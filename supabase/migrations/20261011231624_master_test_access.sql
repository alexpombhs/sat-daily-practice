-- Operator-controlled test passes. These are never treated as paid purchases.
-- An authenticated, allowlisted Edge Function invokes this RPC with service_role.
create or replace function public.sat_activate_master_test_pass(p_user_id uuid)
returns timestamptz language plpgsql security definer set search_path='' as $$
declare start_time timestamptz:=now(); expiry timestamptz;
begin
 if p_user_id is null or not exists(select 1 from auth.users where id=p_user_id)
 then raise exception 'Unknown user'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_user_id::text));
 -- Repeat redemption refreshes the same test pass to 90 days rather than stacking.
 expiry:=start_time+interval '90 days';
 delete from public.sat_access_passes
  where user_id=p_user_id and checkout_session_id like 'master-test:%';
 insert into public.sat_access_passes(user_id,checkout_session_id,purchased_at,starts_at,expires_at)
 values(p_user_id,'master-test:'||p_user_id,start_time,start_time,expiry);
 return expiry;
end; $$;
revoke all on function public.sat_activate_master_test_pass(uuid) from public,anon,authenticated;
grant execute on function public.sat_activate_master_test_pass(uuid) to service_role;
