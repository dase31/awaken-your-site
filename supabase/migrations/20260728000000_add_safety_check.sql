-- Private safety check, kept separate from matching signals.
-- A positive answer must never influence who a user is matched with.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS safety_checked_at timestamptz,
  ADD COLUMN IF NOT EXISTS safety_answer text;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_safety_answer_check
  CHECK (safety_answer IS NULL OR safety_answer IN ('no', 'yes', 'declined'));
