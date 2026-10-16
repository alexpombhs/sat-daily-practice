create or replace function public.sat_unsubscribe_waitlist(token_input uuid)
returns boolean language plpgsql security definer set search_path='' as $$
declare target_id bigint;
begin
 select id into target_id from public.sat_launch_waitlist
 where unsubscribe_token=token_input and status<>'removed'
 for update;
 if target_id is null then return false; end if;
 update public.sat_launch_waitlist
  set status='removed',removed_at=now(),claimed_at=null,claim_token=null
  where id=target_id;
 delete from public.sat_la_reservations
  where waitlist_id=target_id and consumed_at is null;
 return true;
end; $$;
revoke all on function public.sat_unsubscribe_waitlist(uuid) from public,anon,authenticated;
grant execute on function public.sat_unsubscribe_waitlist(uuid) to service_role;
