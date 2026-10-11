-- IMPORTANT: after migration, enable this under Supabase Authentication > Hooks
-- "Before User Created" -> Postgres function public.sat_before_user_created.
-- Until enabled, the UI alone cannot enforce age screening.
create or replace function public.sat_before_user_created(event jsonb)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  supplied text := event->'user'->'user_metadata'->>'sat_signup_birth_date';
  dob date;
  cutoff date := (current_date - interval '13 years')::date;
begin
  if supplied is null or supplied !~ '^\d{4}-\d{2}-\d{2}$' then
    return jsonb_build_object('error',jsonb_build_object('http_code',400,'message','Date of birth is required to create an account.'));
  end if;
  begin
    dob := supplied::date;
  exception when others then
    return jsonb_build_object('error',jsonb_build_object('http_code',400,'message','Enter a valid date of birth.'));
  end;
  if to_char(dob,'YYYY-MM-DD') <> supplied or dob > current_date or dob < date '1900-01-01' then
    return jsonb_build_object('error',jsonb_build_object('http_code',400,'message','Enter a valid date of birth.'));
  end if;
  if dob > cutoff then
    return jsonb_build_object('error',jsonb_build_object('http_code',403,'message','SAT Daily Practice is for students ages 13 and older. You can create an account once you turn 13.'));
  end if;
  return '{}'::jsonb;
end;
$$;
revoke all on function public.sat_before_user_created(jsonb) from public,anon,authenticated;
grant usage on schema public to supabase_auth_admin;
grant execute on function public.sat_before_user_created(jsonb) to supabase_auth_admin;
