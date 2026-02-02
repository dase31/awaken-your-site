-- Create user_goals table
CREATE TABLE public.user_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_goals
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_goals
CREATE POLICY "Users can view own goals" ON public.user_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON public.user_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON public.user_goals
  FOR DELETE USING (auth.uid() = user_id);

-- Create user_connection_intents table
CREATE TABLE public.user_connection_intents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  intent_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_connection_intents
ALTER TABLE public.user_connection_intents ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_connection_intents
CREATE POLICY "Users can view own intents" ON public.user_connection_intents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own intents" ON public.user_connection_intents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own intents" ON public.user_connection_intents
  FOR DELETE USING (auth.uid() = user_id);

-- Add new columns to profiles
ALTER TABLE public.profiles 
  ADD COLUMN raw_goals_text TEXT,
  ADD COLUMN raw_connection_text TEXT;