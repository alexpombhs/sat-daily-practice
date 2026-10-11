alter table public.sat_sessions add column if not exists is_free boolean not null default false;
-- Capture all accounts existing before LA entitlement rollout.
-- This snapshot runs once on migration deployment; new registrations are not grandfathered.
create table if not exists public.sat_legacy_full_access (
 user_id uuid primary key references auth.users(id) on delete cascade,
 grandfathered_at timestamptz not null default now()
);
alter table public.sat_legacy_full_access enable row level security;
revoke all on public.sat_legacy_full_access from public,anon,authenticated;
grant select,insert,update,delete on public.sat_legacy_full_access to service_role;
-- Legacy users were snapshotted at 20261011171500, before tier rollout.
-- Never recapture newly registered accounts here.

create or replace function public.sat_my_plus_access()
returns boolean language sql security definer set search_path='' stable as $$
 select exists(select 1 from public.sat_legacy_full_access where user_id=(select auth.uid()))
 or exists(select 1 from public.sat_access_passes p
 where p.user_id=(select auth.uid()) and p.starts_at<=now()
 and p.expires_at>now() and p.refunded_at is null);
$$;
revoke all on function public.sat_my_plus_access() from public,anon;
grant execute on function public.sat_my_plus_access() to authenticated;

create or replace function public.sat_guard_free_session()
returns trigger language plpgsql security definer set search_path='' as $$
declare entitled boolean; used integer;
begin
 select exists(select 1 from public.sat_legacy_full_access l where l.user_id=new.user_id)
 or exists(select 1 from public.sat_access_passes p
 where p.user_id=new.user_id and p.starts_at<=now()
 and p.expires_at>now() and p.refunded_at is null) into entitled;
 new.is_free:=not entitled;
 if entitled then return new; end if;
 if new.question_count<>10 then raise exception 'Free practice sessions contain 10 questions.'; end if;
 if coalesce(new.session_settings->>'practiceTest','all')<>'all'
 or coalesce(new.session_settings->>'selectionMode','random')<>'random'
 or coalesce(new.session_settings->>'failedOnly','false')='true'
 or coalesce(new.session_settings->>'failedEverOnly','false')='true'
 or coalesce(new.session_settings->>'difficulty','all')<>'all'
 then raise exception 'Free practice uses a random selection of all questions.'; end if;
 insert into public.sat_free_daily_usage(user_id,practice_date,session_count)
 values(new.user_id,(now() at time zone 'utc')::date,1)
 on conflict(user_id,practice_date) do update
 set session_count=public.sat_free_daily_usage.session_count+1
 where public.sat_free_daily_usage.session_count<2
 returning session_count into used;
 if used is null then raise exception 'Today''s two free sessions are complete.'; end if;
 return new;
end; $$;
revoke all on function public.sat_guard_free_session() from public,anon,authenticated;

-- Null expiration means grandfathered full access has no timed expiry.
create or replace function public.sat_my_plus_access_expires_at()
returns timestamptz language sql security definer set search_path='' stable as $$
 select max(expires_at) from public.sat_access_passes
 where user_id=(select auth.uid()) and refunded_at is null and starts_at<=now() and expires_at>now();
$$;
