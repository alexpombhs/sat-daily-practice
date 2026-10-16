-- Free tier: two ten-question sessions per UTC day. Counter cannot be reset by deleting sessions.
create table if not exists public.sat_free_daily_usage(
 user_id uuid not null references auth.users(id) on delete cascade,
 practice_date date not null,
 session_count integer not null default 0 check(session_count between 0 and 2),
 primary key(user_id,practice_date)
);
alter table public.sat_free_daily_usage enable row level security;
revoke all on public.sat_free_daily_usage from anon,authenticated;
grant select on public.sat_free_daily_usage to authenticated;
create policy sat_free_own_usage on public.sat_free_daily_usage for select to authenticated
 using(user_id=(select auth.uid()));

create or replace function public.sat_guard_free_session()
returns trigger language plpgsql security definer set search_path='' as $$
declare paid boolean; used integer;
begin
 select exists(select 1 from public.sat_access_passes p
  where p.user_id=new.user_id and p.starts_at<=now() and p.expires_at>now()
  and p.refunded_at is null) into paid;
 if paid then return new; end if;
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
drop trigger if exists sat_free_session_guard on public.sat_sessions;
create trigger sat_free_session_guard before insert on public.sat_sessions
 for each row execute function public.sat_guard_free_session();

create or replace function public.sat_my_free_sessions_remaining()
returns integer language sql security definer set search_path='' stable as $$
 select greatest(0,2-coalesce((select session_count from public.sat_free_daily_usage
 where user_id=(select auth.uid()) and practice_date=(now() at time zone 'utc')::date),0));
$$;
revoke all on function public.sat_my_free_sessions_remaining() from public,anon;
grant execute on function public.sat_my_free_sessions_remaining() to authenticated;
