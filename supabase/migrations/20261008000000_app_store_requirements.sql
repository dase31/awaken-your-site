-- App Store requirements
--   1. Private safety check (own table — profiles is readable by every user)
--   2. Block users, enforced at the database level
--   3. Report users/content
--   4. Basic filter for hate slurs in messages and Telos posts
--   5. Real account deletion (removes the login, not just the profile row)
--
-- Safe to run more than once.

-- ─────────────────────────────────────────────────────────────
-- 1. Private safety check
-- A "yes" must never influence matching, and must never be visible to other
-- users, so this is deliberately NOT a column on profiles (which every
-- signed-in user can read).
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_safety (
  user_id    uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  answer     text NOT NULL CHECK (answer IN ('no', 'yes', 'declined', 'cleared')),
  checked_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_safety ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own safety check" ON public.user_safety;
CREATE POLICY "Users can view own safety check" ON public.user_safety
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own safety check" ON public.user_safety;
CREATE POLICY "Users can insert own safety check" ON public.user_safety
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own safety check" ON public.user_safety;
CREATE POLICY "Users can update own safety check" ON public.user_safety
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- 2. Blocking
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_blocks (
  blocker_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id),
  CONSTRAINT user_blocks_not_self CHECK (blocker_id <> blocked_id)
);

ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own blocks" ON public.user_blocks;
CREATE POLICY "Users can view own blocks" ON public.user_blocks
  FOR SELECT TO authenticated USING (auth.uid() = blocker_id);

DROP POLICY IF EXISTS "Users can block others" ON public.user_blocks;
CREATE POLICY "Users can block others" ON public.user_blocks
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = blocker_id);

DROP POLICY IF EXISTS "Users can unblock" ON public.user_blocks;
CREATE POLICY "Users can unblock" ON public.user_blocks
  FOR DELETE TO authenticated USING (auth.uid() = blocker_id);

-- True when either user has blocked the other. Only answers for the caller's
-- own relationships, so it can't be used to probe two unrelated users.
CREATE OR REPLACE FUNCTION public.is_blocked_between(_a uuid, _b uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT (auth.uid() = _a OR auth.uid() = _b)
    AND EXISTS (
      SELECT 1 FROM public.user_blocks
      WHERE (blocker_id = _a AND blocked_id = _b)
         OR (blocker_id = _b AND blocked_id = _a)
    )
$$;

CREATE OR REPLACE FUNCTION public.conversation_has_block(_conversation_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = _conversation_id
      AND public.is_blocked_between(c.user_one, c.user_two)
  )
$$;

-- Everyone the caller should never be shown or matched with, in either
-- direction (people they blocked, and people who blocked them).
CREATE OR REPLACE FUNCTION public.my_block_exclusions()
RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT blocked_id FROM public.user_blocks WHERE blocker_id = auth.uid()
  UNION
  SELECT blocker_id FROM public.user_blocks WHERE blocked_id = auth.uid()
$$;

REVOKE ALL ON FUNCTION public.is_blocked_between(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.conversation_has_block(uuid)   FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.my_block_exclusions()          FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_blocked_between(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.conversation_has_block(uuid)   TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_block_exclusions()          TO authenticated;

-- Enforce blocks where messages, requests and conversations are created.
DROP POLICY IF EXISTS "Participants can send messages" ON public.messages;
CREATE POLICY "Participants can send messages" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND public.is_conversation_participant(auth.uid(), conversation_id)
    AND NOT public.conversation_has_block(conversation_id)
  );

DROP POLICY IF EXISTS "Users can send connection requests" ON public.connection_requests;
CREATE POLICY "Users can send connection requests" ON public.connection_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND NOT public.is_blocked_between(sender_id, receiver_id)
  );

DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT TO authenticated
  WITH CHECK (
    (auth.uid() = user_one OR auth.uid() = user_two)
    AND NOT public.is_blocked_between(user_one, user_two)
  );

-- ─────────────────────────────────────────────────────────────
-- 3. Reports
-- Reviewed by you in the Supabase dashboard (Table Editor → reports).
-- reporter/reported ids are SET NULL on account deletion so a report
-- survives its subject deleting their account; "context" and
-- "reported_name" are snapshots taken at report time for the same reason.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reports (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id      uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reported_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  conversation_id  uuid REFERENCES public.conversations(id) ON DELETE SET NULL,
  telos_post_id    uuid REFERENCES public.telos_posts(id) ON DELETE SET NULL,
  reason           text NOT NULL
    CHECK (reason IN ('harassment', 'self_harm', 'hate', 'spam', 'inappropriate', 'other')),
  details          text CHECK (details IS NULL OR length(details) <= 1000),
  context          text CHECK (context IS NULL OR length(context) <= 4000),
  reported_name    text,
  status           text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'reviewing', 'actioned', 'dismissed')),
  created_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reports_not_self CHECK (reporter_id IS DISTINCT FROM reported_user_id)
);

CREATE INDEX IF NOT EXISTS reports_status_created_idx
  ON public.reports (status, created_at);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can file reports" ON public.reports;
CREATE POLICY "Users can file reports" ON public.reports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Users can view their own reports" ON public.reports;
CREATE POLICY "Users can view their own reports" ON public.reports
  FOR SELECT TO authenticated USING (auth.uid() = reporter_id);

-- ─────────────────────────────────────────────────────────────
-- 4. Objectionable-content filter (hate slurs only — deliberately narrow
-- to avoid blocking ordinary, if rough, conversation about hard things)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.contains_hate_slur(_text text)
RETURNS boolean
LANGUAGE sql IMMUTABLE
AS $$
  SELECT coalesce(_text, '') ~*
    '\m(nigger|niggers|nigga|niggas|faggot|faggots|kike|kikes|spic|spics|tranny|trannies|retard|retards|retarded)\M'
$$;

CREATE OR REPLACE FUNCTION public.reject_objectionable_message()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF public.contains_hate_slur(NEW.content) THEN
    RAISE EXCEPTION 'objectionable_content';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_objectionable_post()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF public.contains_hate_slur(NEW.title) OR public.contains_hate_slur(NEW.description) THEN
    RAISE EXCEPTION 'objectionable_content';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS messages_reject_objectionable ON public.messages;
CREATE TRIGGER messages_reject_objectionable
  BEFORE INSERT OR UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.reject_objectionable_message();

DROP TRIGGER IF EXISTS telos_posts_reject_objectionable ON public.telos_posts;
CREATE TRIGGER telos_posts_reject_objectionable
  BEFORE INSERT OR UPDATE ON public.telos_posts
  FOR EACH ROW EXECUTE FUNCTION public.reject_objectionable_post();

-- ─────────────────────────────────────────────────────────────
-- 5. Account deletion
-- Apple requires that "delete account" actually deletes the account.
-- Removing the auth user cascades to the profile and everything that
-- references it (tags, messages, conversations, requests, reflections,
-- blocks, safety check). The Telos tables have no foreign key, so they are
-- cleared explicitly first.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  DELETE FROM public.telos_posts       WHERE user_id = uid;
  DELETE FROM public.telos_specialties WHERE user_id = uid;
  DELETE FROM public.telos_profiles    WHERE user_id = uid;
  DELETE FROM auth.users               WHERE id = uid;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_my_account() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_my_account() TO authenticated;
