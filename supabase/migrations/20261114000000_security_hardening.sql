-- Security hardening, from the pre-launch audit.
--   1. profiles was readable by every signed-in user, including the free text
--      people wrote about what they're going through. Now: your own row only,
--      plus a narrow public_profiles view (id, name, username) for showing
--      people to each other.
--   2. Anyone could open a conversation with anyone, skipping requests,
--      pause and limits. Now a conversation needs an accepted request (or, for
--      Telos, a post by the person being contacted).
--   3. A receiver could rewrite a request they received (change who it was
--      from). Now only the status can change, once.
--   4. Conversations never moved to the top when a message arrived, because
--      the timestamp trigger ran as the caller and RLS blocked it.
--   5. Abuse limits: requests per person per day.
--
-- Safe to run more than once.

-- ─────────────────────────────────────────────────────────────
-- 1. profiles: own row only, plus a narrow public view
-- ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

-- What other people may see of you: who you are, nothing you've written about
-- yourself. Runs with the owner's rights on purpose (that's what lets it read
-- other rows), so keep the column list short.
CREATE OR REPLACE VIEW public.public_profiles
  WITH (security_invoker = false) AS
  SELECT id, display_name, username FROM public.profiles;

REVOKE ALL ON public.public_profiles FROM PUBLIC, anon;
GRANT SELECT ON public.public_profiles TO authenticated;

-- ─────────────────────────────────────────────────────────────
-- 2. Conversations need consent
-- ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT TO authenticated
  WITH CHECK (
    (auth.uid() = user_one OR auth.uid() = user_two)
    AND NOT public.is_blocked_between(user_one, user_two)
    AND (
      -- A connection starts from an accepted request between the two.
      (conversation_type = 'connection' AND EXISTS (
        SELECT 1 FROM public.connection_requests r
        WHERE r.status = 'accepted'
          AND ((r.sender_id = user_one AND r.receiver_id = user_two)
            OR (r.sender_id = user_two AND r.receiver_id = user_one))
      ))
      OR
      -- A Telos chat is started by the person replying to someone's post.
      (conversation_type = 'telos' AND auth.uid() = user_one AND EXISTS (
        SELECT 1 FROM public.telos_posts p WHERE p.user_id = user_two
      ))
    )
  );

-- Only members of a conversation may ask whether they are in it.
CREATE OR REPLACE FUNCTION public.is_conversation_participant(_user_id uuid, _conversation_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT (auth.uid() IS NULL OR auth.uid() = _user_id)
    AND EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = _conversation_id
        AND (user_one = _user_id OR user_two = _user_id)
    )
$$;

-- ─────────────────────────────────────────────────────────────
-- 3. A request can only be answered, not rewritten
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.protect_connection_request()
RETURNS trigger
LANGUAGE plpgsql SET search_path = public
AS $$
BEGIN
  IF NEW.sender_id IS DISTINCT FROM OLD.sender_id
     OR NEW.receiver_id IS DISTINCT FROM OLD.receiver_id
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'request_fields_locked';
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status AND OLD.status <> 'pending' THEN
    RAISE EXCEPTION 'request_already_answered';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_connection_request_update ON public.connection_requests;
CREATE TRIGGER protect_connection_request_update
  BEFORE UPDATE ON public.connection_requests
  FOR EACH ROW EXECUTE FUNCTION public.protect_connection_request();

-- ─────────────────────────────────────────────────────────────
-- 4. Conversations rise to the top when a message arrives
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.conversations SET updated_at = now() WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

-- ─────────────────────────────────────────────────────────────
-- 5. Don't let one account flood people with requests (each one can send an
-- email or push to the person on the other end).
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.limit_request_rate()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  recent integer;
BEGIN
  SELECT count(*) INTO recent
  FROM public.connection_requests
  WHERE sender_id = NEW.sender_id AND created_at > now() - interval '24 hours';

  IF recent >= 25 THEN
    RAISE EXCEPTION 'too_many_requests';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS limit_request_rate_on_insert ON public.connection_requests;
CREATE TRIGGER limit_request_rate_on_insert
  BEFORE INSERT ON public.connection_requests
  FOR EACH ROW EXECUTE FUNCTION public.limit_request_rate();
