-- Profiles table (core user data)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  intent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User struggles (multi-select, many-to-many)
CREATE TABLE public.user_struggles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  struggle_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, struggle_type)
);

-- User strengths (multi-select, many-to-many)
CREATE TABLE public.user_strengths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  strength_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, strength_type)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_struggles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_strengths ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- User struggles RLS policies
CREATE POLICY "Users can view own struggles" 
  ON public.user_struggles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own struggles" 
  ON public.user_struggles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own struggles" 
  ON public.user_struggles FOR DELETE 
  USING (auth.uid() = user_id);

-- User strengths RLS policies
CREATE POLICY "Users can view own strengths" 
  ON public.user_strengths FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own strengths" 
  ON public.user_strengths FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own strengths" 
  ON public.user_strengths FOR DELETE 
  USING (auth.uid() = user_id);

-- Trigger for updating updated_at on profiles
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();