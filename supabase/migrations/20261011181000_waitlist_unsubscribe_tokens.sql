alter table public.sat_launch_waitlist
 add column if not exists unsubscribe_token uuid not null default gen_random_uuid(),
 add column if not exists removed_at timestamptz;
create unique index if not exists sat_launch_waitlist_unsubscribe_token_idx
 on public.sat_launch_waitlist(unsubscribe_token);
-- Token possession authorizes only removal of that exact waitlist entry.
create or replace function public.sat_unsubscribe_waitlist(token_input uuid)
returns boolean language plpgsql security definer set search_path='' as $$
declare affected integer;
begin
 update public.sat_launch_waitlist set status='removed',removed_at=now(),
 claimed_at=null,claim_token=null
 where unsubscribe_token=token_input and status <> 'removed';
 get diagnostics affected=row_count;
 return affected>0;
end; $$;
revoke all on function public.sat_unsubscribe_waitlist(uuid) from public,anon,authenticated;
grant execute on function public.sat_unsubscribe_waitlist(uuid) to service_role;
