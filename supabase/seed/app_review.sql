-- Demo data for Apple App Review. Run once in the Supabase SQL editor.
--
-- Before running, create these two users in the dashboard
-- (Authentication → Users → Add user → "Auto Confirm User" ticked):
--   reviewer@thymos.world   with a password you choose (put it in App Store Connect)
--   reviewer-partner@thymos.world   with any password (never shared)
--
-- This gives the reviewer a finished profile, a safety check on file (so
-- matching isn't held), and an existing conversation so they can try the
-- Report / Block controls without waiting for a real match.

DO $$
DECLARE
  rev uuid := (SELECT id FROM auth.users WHERE email = 'reviewer@thymos.world');
  par uuid := (SELECT id FROM auth.users WHERE email = 'reviewer-partner@thymos.world');
  one uuid;
  two uuid;
  convo uuid;
BEGIN
  IF rev IS NULL OR par IS NULL THEN
    RAISE EXCEPTION 'Create both reviewer users in Authentication → Users first.';
  END IF;

  INSERT INTO public.profiles (id, display_name, username, capacity_level, quote_text)
  VALUES
    (rev, 'Reviewer', 'app_reviewer', 'some', 'I want to feel less alone with this.'),
    (par, 'Sam', 'sam_demo', 'good_amount', 'I just want to be understood.')
  ON CONFLICT (id) DO UPDATE
    SET display_name = EXCLUDED.display_name,
        username = EXCLUDED.username,
        capacity_level = EXCLUDED.capacity_level,
        quote_text = EXCLUDED.quote_text;

  DELETE FROM public.user_struggles WHERE user_id IN (rev, par);
  DELETE FROM public.user_goals WHERE user_id IN (rev, par);
  DELETE FROM public.user_connection_intents WHERE user_id IN (rev, par);
  DELETE FROM public.user_offers WHERE user_id IN (rev, par);

  INSERT INTO public.user_struggles (user_id, struggle_type)
    VALUES (rev, 'anxiety'), (rev, 'loneliness'), (par, 'anxiety'), (par, 'burnout');
  INSERT INTO public.user_goals (user_id, goal_type)
    VALUES (rev, 'inner_peace'), (par, 'inner_peace');
  INSERT INTO public.user_connection_intents (user_id, intent_type)
    VALUES (rev, 'a_listener'), (par, 'a_listener');
  INSERT INTO public.user_offers (user_id, offer_type)
    VALUES (rev, 'Listening'), (par, 'Listening');

  INSERT INTO public.user_safety (user_id, answer)
    VALUES (rev, 'no'), (par, 'no')
  ON CONFLICT (user_id) DO UPDATE SET answer = 'no', checked_at = now();

  -- Clean slate for the demo accounts' relationship, then one conversation.
  DELETE FROM public.user_blocks
    WHERE (blocker_id = rev AND blocked_id = par) OR (blocker_id = par AND blocked_id = rev);
  one := LEAST(rev, par);
  two := GREATEST(rev, par);
  INSERT INTO public.conversations (user_one, user_two, conversation_type)
    VALUES (one, two, 'connection')
  ON CONFLICT (user_one, user_two) DO UPDATE SET updated_at = now()
  RETURNING id INTO convo;

  DELETE FROM public.messages WHERE conversation_id = convo;
  INSERT INTO public.messages (conversation_id, sender_id, content, created_at) VALUES
    (convo, par, 'Hi, glad we matched. How has your week been?', now() - interval '2 minutes'),
    (convo, par, 'No rush to reply. I''m here when you''re ready.', now() - interval '1 minute');
END $$;
