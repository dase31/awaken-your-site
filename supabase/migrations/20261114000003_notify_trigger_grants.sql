-- The notification and request-guard functions only ever run as triggers.
-- Nobody should be able to call them over the API.
-- Safe to run more than once.
REVOKE ALL ON FUNCTION public.enforce_matching_settings() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_on_request_change()  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_on_new_message()     FROM PUBLIC, anon, authenticated;
