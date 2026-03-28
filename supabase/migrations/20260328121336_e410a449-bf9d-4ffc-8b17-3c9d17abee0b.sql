
-- Telos profiles (extends user profile with specialty info)
CREATE TABLE public.telos_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.telos_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all telos profiles" ON public.telos_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own telos profile" ON public.telos_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own telos profile" ON public.telos_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Telos specialties (domains user is good at)
CREATE TABLE public.telos_specialties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  specialty text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.telos_specialties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all specialties" ON public.telos_specialties FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own specialties" ON public.telos_specialties FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own specialties" ON public.telos_specialties FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Telos posts (offers and requests)
CREATE TABLE public.telos_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  post_type text NOT NULL DEFAULT 'offer',
  category text NOT NULL DEFAULT 'general',
  status text NOT NULL DEFAULT 'open',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.telos_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all open posts" ON public.telos_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create own posts" ON public.telos_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON public.telos_posts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON public.telos_posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Add type column to conversations for telos tagging
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS conversation_type text NOT NULL DEFAULT 'connection';
