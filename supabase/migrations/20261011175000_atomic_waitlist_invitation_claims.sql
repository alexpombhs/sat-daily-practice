-- Atomic waitlist claims prevent two operators from emailing the same person.
-- Claims expire so a crashed sender does not strand a user.
alter table public.sat_launch_waitlist
 add column if not exists claimed_at timestamptz,
 add column if not exists claim_token uuid;
alter table public.sat_launch_waitlist
 drop constraint if exists sat_launch_waitlist_status_check;
alter table public.sat_launch_waitlist
 add constraint sat_launch_waitlist_status_check
 check(status in ('waiting','sending','invited','removed'));

create or replace function public.sat_claim_waitlist_invite()
returns table(id bigint,email text,claim_token uuid,unsubscribe_token uuid)
language plpgsql security definer set search_path = ''
as $$
begin
 return query
 with next_entry as (
   select w.id from public.sat_launch_waitlist w
   where w.status='waiting'
      or (w.status='sending' and w.claimed_at < now()-interval '15 minutes')
   order by w.created_at asc
   for update skip locked limit 1
 )
 update public.sat_launch_waitlist w
 set status='sending',claimed_at=now(),claim_token=gen_random_uuid()
 from next_entry
 where w.id=next_entry.id
 returning w.id,w.email,w.claim_token,w.unsubscribe_token;
end; $$;

create or replace function public.sat_finish_waitlist_invite(
 invite_id bigint, token uuid, was_sent boolean
) returns boolean language plpgsql security definer set search_path=''
as $$
declare affected integer;
begin
 update public.sat_launch_waitlist
 set status=case when was_sent then 'invited' else 'waiting' end,
     contacted_at=case when was_sent then now() else contacted_at end,
     claimed_at=null,claim_token=null
 where id=invite_id and claim_token=token and status='sending';
 get diagnostics affected = row_count;
 return affected=1;
end; $$;
revoke all on function public.sat_claim_waitlist_invite() from public,anon,authenticated;
revoke all on function public.sat_finish_waitlist_invite(bigint,uuid,boolean) from public,anon,authenticated;
grant execute on function public.sat_claim_waitlist_invite() to service_role;
grant execute on function public.sat_finish_waitlist_invite(bigint,uuid,boolean) to service_role;
