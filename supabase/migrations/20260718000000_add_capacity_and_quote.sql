-- Capacity/reciprocity signal + optional reveal quote
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS capacity_level text,
  ADD COLUMN IF NOT EXISTS quote_text text;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_capacity_level_check
  CHECK (capacity_level IS NULL OR capacity_level IN ('very_little', 'some', 'good_amount'));

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_quote_text_length_check
  CHECK (quote_text IS NULL OR length(quote_text) <= 300);

-- What each person can offer right now (multi-select, mirrors user_struggles/user_goals)
CREATE TABLE public.user_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  offer_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, offer_type)
);

ALTER TABLE public.user_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own offers" ON public.user_offers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own offers" ON public.user_offers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own offers" ON public.user_offers
  FOR DELETE USING (auth.uid() = user_id);
