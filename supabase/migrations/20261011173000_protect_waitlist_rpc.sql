-- Move waitlist writes behind a server-side Turnstile verification endpoint.
-- Revoke direct public RPC execution to prevent bypassing the bot challenge.
revoke execute on function public.sat_join_waitlist(text, text) from anon, authenticated;
grant execute on function public.sat_join_waitlist(text, text) to service_role;
