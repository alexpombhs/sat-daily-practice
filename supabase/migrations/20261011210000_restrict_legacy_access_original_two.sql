-- Preserve unrestricted access for the two original accounts only.
-- Existing user and practice records remain untouched.
CREATE OR REPLACE FUNCTION public.sat_is_legacy_plus(p_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select exists(
    select 1 from (
      select id from auth.users order by created_at asc,id asc limit 2
    ) originals
    join public.sat_legacy_full_access l on l.user_id=originals.id
    where originals.id=p_user_id
  );
$function$

CREATE OR REPLACE FUNCTION public.sat_my_plus_access()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
 select public.sat_is_legacy_plus((select auth.uid()))
 or exists(select 1 from public.sat_access_passes p
 where p.user_id=(select auth.uid()) and p.starts_at<=now()
 and p.expires_at>now() and p.refunded_at is null);
$function$

CREATE OR REPLACE FUNCTION public.sat_guard_free_session()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare entitled boolean; used integer;
begin
 select public.sat_is_legacy_plus(new.user_id)
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
end; $function$

