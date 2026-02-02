-- Add raw text columns for conversational onboarding
ALTER TABLE public.profiles
ADD COLUMN raw_intent_text TEXT,
ADD COLUMN raw_offering_text TEXT;