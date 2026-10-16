drop function if exists public.sat_claim_waitlist_invite();
create function public.sat_claim_waitlist_invite()
returns table(id bigint,email text,claim_token uuid,unsubscribe_token uuid)
language plpgsql security definer set search_path='' as $$
begin
 return query with next_entry as (
  select w.id from public.sat_launch_waitlist w
  where w.status='waiting' or (w.status='sending' and w.claimed_at < now()-interval '15 minutes')
  order by w.created_at for update skip locked limit 1
 )
 update public.sat_launch_waitlist w
 set status='sending',claimed_at=now(),claim_token=gen_random_uuid()
 from next_entry where w.id=next_entry.id
 returning w.id,w.email,w.claim_token,w.unsubscribe_token;
end; $$;
revoke all on function public.sat_claim_waitlist_invite() from public,anon,authenticated;
grant execute on function public.sat_claim_waitlist_invite() to service_role;
