-- Privacy-first age confirmation: store only the user's explicit eligibility
-- attestation, never a birthdate. The Auth Before User Created hook must be enabled.
create or replace function public.sat_before_user_created(event jsonb)
returns jsonb language plpgsql set search_path='' as $$
begin
 if coalesce(event->'user'->'user_metadata'->>'sat_age_13_confirmed','false')<>'true' then
  return jsonb_build_object('error',jsonb_build_object('http_code',403,
   'message','SAT Daily Practice is for students ages 13 and older. Please confirm your eligibility to sign up.'));
 end if;
 return '{}'::jsonb;
end; $$;
revoke all on function public.sat_before_user_created(jsonb) from public,anon,authenticated;
grant execute on function public.sat_before_user_created(jsonb) to supabase_auth_admin;

-- Waitlist RPC accepts the same explicit 13+ attestation as signup.
-- Drop the former two-text-argument signature after migrating the Edge function.
create or replace function public.sat_join_waitlist(email_input text, age_confirmed boolean)
returns boolean language plpgsql security definer set search_path='' as $$
declare normalized text:=lower(trim(email_input));sent integer;
begin
 if age_confirmed is distinct from true then
  raise exception 'Please confirm you are 13 or older.';
 end if;
 if normalized is null or length(normalized)<6 or length(normalized)>254
   or normalized !~ '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$' then
  raise exception 'Enter a valid email address.';
 end if;
 insert into public.sat_launch_waitlist(email) values(normalized)
 on conflict(email) do nothing;
 update public.sat_launch_waitlist set verification_sent_at=now()
 where email=normalized and status='waiting' and verified_at is null
 and (verification_sent_at is null or verification_sent_at<now()-interval '15 minutes');
 get diagnostics sent=row_count;
 return sent=1;
end; $$;
revoke all on function public.sat_join_waitlist(text,boolean) from public,anon,authenticated;
grant execute on function public.sat_join_waitlist(text,boolean) to service_role;
drop function if exists public.sat_join_waitlist(text,text);
