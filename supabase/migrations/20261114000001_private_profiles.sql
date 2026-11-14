-- Private profiles
--
-- profiles was readable by every signed-in user, including the free text
-- people wrote about what they're going through. After this: your own row
-- only, plus a narrow public_profiles view (id, name, username) for showing
-- people to each other.
--
-- RUN THIS TOGETHER WITH RELEASING THE APP CODE THAT READS public_profiles.
-- Older app builds read other people's names from profiles and will show
-- "Unknown" once this is applied.
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
