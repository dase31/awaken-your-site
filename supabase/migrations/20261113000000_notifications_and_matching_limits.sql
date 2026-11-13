-- Notifications (push + email) and matching limits
--   1. user_settings: pause matching, cap active connections, notification
--      choices. Its own table because profiles is readable by every user and
--      none of this should be.
--   2. push_tokens: one row per device that said yes to push.
--   3. A guard so nobody can send a request to someone who is paused or full.
--   4. Triggers that tell the `notify` edge function when something happens.
--
-- Safe to run more than once.

-- ─────────────────────────────────────────────────────────────
-- 1. Settings
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id                  uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  matching_paused          boolean NOT NULL DEFAULT false,
  -- NULL means no limit.
  max_active_connections   integer CHECK (max_active_connections IS NULL OR max_active_connections BETWEEN 1 AND 50),
  push_enabled             boolean NOT NULL DEFAULT false,
  email_enabled            boolean NOT NULL DEFAULT false,
  -- Set when they answered the notification question, yes or no. NULL means
  -- they haven't been asked yet.
  notifications_decided_at timestamptz,
  updated_at               timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own settings" ON public.user_settings;
CREATE POLICY "Users can view own settings" ON public.user_settings
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own settings" ON public.user_settings;
CREATE POLICY "Users can insert own settings" ON public.user_settings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own settings" ON public.user_settings;
CREATE POLICY "Users can update own settings" ON public.user_settings
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- 2. Push tokens
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.push_tokens (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token        text NOT NULL UNIQUE,
  platform     text NOT NULL DEFAULT 'ios',
  created_at   timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS push_tokens_user_idx ON public.push_tokens (user_id);

ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own push tokens" ON public.push_tokens;
CREATE POLICY "Users can view own push tokens" ON public.push_tokens
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Writes go through these functions: a phone that changes hands must stop
-- sending the previous owner's notifications, and a plain upsert can't take
-- over a row that belongs to someone else.
CREATE OR REPLACE FUNCTION public.register_push_token(p_token text, p_platform text DEFAULT 'ios')
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  IF p_token IS NULL OR length(p_token) < 20 THEN
    RAISE EXCEPTION 'invalid token';
  END IF;

  DELETE FROM public.push_tokens WHERE token = p_token AND user_id <> auth.uid();

  INSERT INTO public.push_tokens (user_id, token, platform)
  VALUES (auth.uid(), p_token, COALESCE(p_platform, 'ios'))
  ON CONFLICT (token) DO UPDATE SET last_seen_at = now(), platform = EXCLUDED.platform;
END;
$$;

CREATE OR REPLACE FUNCTION public.unregister_push_token(p_token text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  DELETE FROM public.push_tokens WHERE token = p_token AND user_id = auth.uid();
END;
$$;

REVOKE ALL ON FUNCTION public.register_push_token(text, text)  FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.unregister_push_token(text)      FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.register_push_token(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.unregister_push_token(text)     TO authenticated;

-- Throttle bookkeeping for the edge function. Service role only.
CREATE TABLE IF NOT EXISTS public.notification_log (
  id         bigserial PRIMARY KEY,
  user_id    uuid NOT NULL,
  kind       text NOT NULL,
  ref        text,
  channel    text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS notification_log_lookup_idx
  ON public.notification_log (user_id, kind, ref, channel, created_at DESC);
ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────
-- 3. Don't let requests through to someone who is paused or full
-- Counts their open conversations plus requests still waiting on them.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.enforce_matching_settings()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  s record;
  open_count integer;
BEGIN
  SELECT matching_paused, max_active_connections INTO s
  FROM public.user_settings WHERE user_id = NEW.receiver_id;

  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  IF s.matching_paused THEN
    RAISE EXCEPTION 'not_accepting_connections';
  END IF;

  IF s.max_active_connections IS NOT NULL THEN
    SELECT
      (SELECT count(*) FROM public.conversations c
        WHERE c.conversation_type = 'connection'
          AND (c.user_one = NEW.receiver_id OR c.user_two = NEW.receiver_id))
      +
      (SELECT count(*) FROM public.connection_requests r
        WHERE r.receiver_id = NEW.receiver_id AND r.status = 'pending')
    INTO open_count;

    IF open_count >= s.max_active_connections THEN
      RAISE EXCEPTION 'not_accepting_connections';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_matching_settings_on_request ON public.connection_requests;
CREATE TRIGGER enforce_matching_settings_on_request
  BEFORE INSERT ON public.connection_requests
  FOR EACH ROW EXECUTE FUNCTION public.enforce_matching_settings();

-- ─────────────────────────────────────────────────────────────
-- 4. Tell the `notify` edge function when something happens
-- The URL and shared secret live in a table no client can read. After running
-- this file:  SELECT value FROM notify_config WHERE key = 'secret';
-- and set that same value as the NOTIFY_SECRET function secret.
-- ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS public.notify_config (
  key   text PRIMARY KEY,
  value text NOT NULL
);
ALTER TABLE public.notify_config ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.notify_config FROM anon, authenticated;

INSERT INTO public.notify_config (key, value) VALUES
  ('secret', replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '')),
  ('url', 'https://lhvdwcobabtugxkyrqox.supabase.co/functions/v1/notify')
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.send_notify_event(p_kind text, p_recipient uuid, p_actor uuid, p_ref text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions, net
AS $$
DECLARE
  cfg_url text;
  cfg_secret text;
BEGIN
  SELECT value INTO cfg_url    FROM public.notify_config WHERE key = 'url';
  SELECT value INTO cfg_secret FROM public.notify_config WHERE key = 'secret';
  IF cfg_url IS NULL OR cfg_secret IS NULL THEN
    RETURN;
  END IF;

  PERFORM net.http_post(
    url     := cfg_url,
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-notify-secret', cfg_secret),
    body    := jsonb_build_object('kind', p_kind, 'recipient', p_recipient, 'actor', p_actor, 'ref', p_ref)
  );
EXCEPTION WHEN OTHERS THEN
  -- A notification problem must never block someone sending a message.
  RAISE WARNING 'send_notify_event failed: %', SQLERRM;
END;
$$;

REVOKE ALL ON FUNCTION public.send_notify_event(text, uuid, uuid, text) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.notify_on_request_change()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.send_notify_event('request_received', NEW.receiver_id, NEW.sender_id, NEW.id::text);
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status = 'accepted' THEN
    PERFORM public.send_notify_event('request_accepted', NEW.sender_id, NEW.receiver_id, NEW.id::text);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_on_request_insert ON public.connection_requests;
CREATE TRIGGER notify_on_request_insert
  AFTER INSERT ON public.connection_requests
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_request_change();

DROP TRIGGER IF EXISTS notify_on_request_update ON public.connection_requests;
CREATE TRIGGER notify_on_request_update
  AFTER UPDATE OF status ON public.connection_requests
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_request_change();

CREATE OR REPLACE FUNCTION public.notify_on_new_message()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  recipient uuid;
BEGIN
  SELECT CASE WHEN c.user_one = NEW.sender_id THEN c.user_two ELSE c.user_one END
  INTO recipient
  FROM public.conversations c WHERE c.id = NEW.conversation_id;

  IF recipient IS NOT NULL THEN
    PERFORM public.send_notify_event('message', recipient, NEW.sender_id, NEW.conversation_id::text);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_on_message_insert ON public.messages;
CREATE TRIGGER notify_on_message_insert
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_new_message();
