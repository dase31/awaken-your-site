-- Trigger functions only ever run as triggers. Nobody should be able to call
-- them over the API (Supabase security advisor, lint 0028/0029).
-- Safe to run more than once.
REVOKE ALL ON FUNCTION public.limit_request_rate()            FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_conversation_timestamp() FROM PUBLIC, anon, authenticated;
