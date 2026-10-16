-- Operator service role explicitly owns required LA, retention and billing actions.
grant select,insert,update,delete on public.sat_access_passes to service_role;
grant select,insert,update,delete on public.sat_launch_waitlist to service_role;
grant select,insert,update,delete on public.sat_la_reservations to service_role;
grant select,insert,update,delete on public.sat_la_signup_holds to service_role;
grant select,insert,update,delete on public.sat_free_daily_usage to service_role;
grant select,insert,update,delete on public.sat_launch_config to service_role;
grant select,insert,update,delete on public.sat_content_admins to service_role;
grant usage,select on sequence public.sat_launch_waitlist_id_seq to service_role;
grant usage,select on sequence public.sat_access_passes_id_seq to service_role;
