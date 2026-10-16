-- Idempotent pass grants. Multiple purchases extend the access window instead
-- of silently overlapping, while a retry of the same checkout grants only once.
create or replace function public.sat_record_90_day_purchase(
 p_user_id uuid, p_checkout_session text, p_payment_intent text, p_paid_at timestamptz
) returns boolean language plpgsql security definer set search_path='' as $$
declare previous_expiry timestamptz; starts timestamptz;
begin
 if p_user_id is null or nullif(p_checkout_session,'') is null then
  raise exception 'Invalid purchase';
 end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_user_id::text));
 if exists(select 1 from public.sat_access_passes where checkout_session_id=p_checkout_session) then
  return false;
 end if;
 select max(expires_at) into previous_expiry from public.sat_access_passes
 where user_id=p_user_id and refunded_at is null and expires_at>p_paid_at;
 starts:=greatest(coalesce(previous_expiry,p_paid_at),p_paid_at);
 insert into public.sat_access_passes(
  user_id,checkout_session_id,payment_intent_id,purchased_at,starts_at,expires_at
 )values(p_user_id,p_checkout_session,p_payment_intent,p_paid_at,
 starts,starts+interval '90 days');
 return true;
end; $$;
revoke all on function public.sat_record_90_day_purchase(uuid,text,text,timestamptz) from public,anon,authenticated;
grant execute on function public.sat_record_90_day_purchase(uuid,text,text,timestamptz) to service_role;

create or replace function public.sat_my_plus_access_expires_at()
returns timestamptz language sql security definer set search_path='' stable as $$
 select max(expires_at) from public.sat_access_passes
 where user_id=(select auth.uid()) and refunded_at is null and starts_at<=now() and expires_at>now();
$$;
revoke all on function public.sat_my_plus_access_expires_at() from public,anon;
grant execute on function public.sat_my_plus_access_expires_at() to authenticated;
