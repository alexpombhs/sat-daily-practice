-- Retain no raw birthday after age eligibility screening.
-- Supabase Before User Created Auth Hook must be enabled independently.
create or replace function public.sat_strip_signup_birthdate()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 update auth.users set raw_user_meta_data =
  coalesce(new.raw_user_meta_data,'{}'::jsonb)-'sat_signup_birth_date'
 where id=new.id;
 return new;
end; $$;
revoke all on function public.sat_strip_signup_birthdate() from public,anon,authenticated;
drop trigger if exists sat_strip_signup_birthdate_on_insert on auth.users;
create trigger sat_strip_signup_birthdate_on_insert after insert on auth.users
 for each row when(new.raw_user_meta_data ? 'sat_signup_birth_date')
 execute function public.sat_strip_signup_birthdate();

update auth.users set raw_user_meta_data=raw_user_meta_data-'sat_signup_birth_date'
 where raw_user_meta_data ? 'sat_signup_birth_date';

-- Remove previously collected optional nonessential student details.
-- Keep existing profile data for backward compatibility. The new UI no longer
-- requests additional fields, but migration must not erase previously saved data.
