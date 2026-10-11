-- Aggregate-only launch diagnostics for the operator; no student-level exports.
create or replace function public.sat_operator_launch_metrics()
returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object(
  'launch_mode',(select launch_mode from public.sat_launch_config where id=true),
  'capacity',(select capacity from public.sat_launch_config where id=true),
  'confirmed_accounts',(select count(*) from auth.users where email_confirmed_at is not null),
  'pending_accounts',(select count(*) from auth.users where email_confirmed_at is null),
  'occupied_seats',(select public.sat_la_occupied_seats()),
  'verified_waitlist',(select count(*) from public.sat_launch_waitlist
     where verified_at is not null and status='waiting'),
  'pending_waitlist_verification',(select count(*) from public.sat_launch_waitlist
     where verified_at is null and status='waiting'),
  'active_invitations',(select count(*) from public.sat_la_reservations
     where consumed_at is null and expires_at>now()),
  'active_plus_users',(select count(distinct user_id) from public.sat_access_passes
     where refunded_at is null and starts_at<=now() and expires_at>now()),
  'paid_passes',(select count(*) from public.sat_access_passes where refunded_at is null),
  'free_sessions_today',(select coalesce(sum(session_count),0) from public.sat_free_daily_usage
     where practice_date=(now() at time zone 'utc')::date)
 );
$$;
revoke all on function public.sat_operator_launch_metrics() from public,anon,authenticated;
grant execute on function public.sat_operator_launch_metrics() to service_role;
