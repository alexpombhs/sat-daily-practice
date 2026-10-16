-- Mark free practice sessions so feedback can be retained briefly and
-- progress history removed on a privacy-preserving retention schedule.
alter table public.sat_sessions
 add column if not exists is_free boolean not null default false;

create or replace function public.sat_guard_free_session()
returns trigger language plpgsql security definer set search_path='' as $$
declare paid boolean; used integer;
begin
 select exists(select 1 from public.sat_access_passes p
 where p.user_id=new.user_id and p.starts_at<=now()
 and p.expires_at>now() and p.refunded_at is null) into paid;
 new.is_free:=not paid;
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

create or replace function public.sat_cleanup_launch_data()
returns void language plpgsql security definer set search_path='' as $$
begin
 delete from public.sat_sessions
 where is_free=true and status in ('completed','abandoned')
 and coalesce(ended_at,updated_at,created_at) < now()-interval '48 hours';
 delete from public.sat_free_daily_usage
 where practice_date < (now() at time zone 'utc')::date-31;
 delete from public.sat_la_signup_holds
 where expires_at < now()-interval '7 days'
 or (consumed_at is not null and consumed_at < now()-interval '1 day');
 delete from public.sat_launch_waitlist
 where (verified_at is null and created_at < now()-interval '7 days')
 or (status='invited' and contacted_at < now()-interval '30 days')
 or (status='waiting' and verified_at is not null and created_at < now()-interval '180 days');
 delete from public.sat_la_reservations
 where expires_at < now()-interval '30 days';
end; $$;
revoke all on function public.sat_cleanup_launch_data() from public,anon,authenticated;
grant execute on function public.sat_cleanup_launch_data() to service_role;
