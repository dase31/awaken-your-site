-- Add username column to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username text;

-- Unique constraint — one username per user, globally unique
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_username_key UNIQUE (username);

-- Format constraint enforced at DB level:
--   • 3–20 characters
--   • Starts with a letter (no leading numbers or underscores)
--   • Only letters, digits, underscores
--   • No consecutive underscores
--   • No trailing underscore
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_username_format CHECK (
    username IS NULL OR (
      length(username) >= 3
      AND length(username) <= 20
      AND username ~ '^[a-zA-Z][a-zA-Z0-9_]*[a-zA-Z0-9]$'
      AND username !~ '__'
    )
  );

-- Fast lookup index for availability checks
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles (username);
