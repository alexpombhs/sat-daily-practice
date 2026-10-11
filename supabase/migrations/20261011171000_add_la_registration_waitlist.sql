-- Limited availability: serialize every Auth insert; reject a 101st account.
create or replace function public.sat_limit_auth_users()
returns trigger language plpgsql security definer set search_path = '' as $$
declare account_count bigint;
begin
  perform pg_catalog.pg_advisory_xact_lock(712342, 100);
  select count(*) into account_count from auth.users;
  if account_count > 100 then
    raise exception 'Limited availability registration is full' using errcode = 'P0001';
  end if;
  return new;
end; $$;
revoke all on function public.sat_limit_auth_users() from public, anon, authenticated;
drop trigger if exists sat_enforce_account_capacity on auth.users;
create trigger sat_enforce_account_capacity after insert on auth.users
for each row execute function public.sat_limit_auth_users();

create table if not exists public.sat_launch_waitlist (
 id bigint generated always as identity primary key,
 email text not null unique,
 created_at timestamptz not null default now(),
 contacted_at timestamptz,
 status text not null default 'waiting' check (status in ('waiting','invited','removed'))
);
alter table public.sat_launch_waitlist enable row level security;
revoke all on public.sat_launch_waitlist from anon, authenticated;

create or replace function public.sat_join_waitlist(email_input text, birth_date_input text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
 normalized text := lower(trim(email_input));
 dob date;
begin
 if normalized is null or length(normalized) < 6 or length(normalized) > 254
    or normalized !~ '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$' then
   raise exception 'Enter a valid email address.';
 end if;
 if birth_date_input is null or birth_date_input !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then
   raise exception 'Enter a valid date of birth.';
 end if;
 begin
   dob := birth_date_input::date;
 exception when others then
   raise exception 'Enter a valid date of birth.';
 end;
 if to_char(dob, 'YYYY-MM-DD') <> birth_date_input
    or dob > (current_date - interval '13 years')::date
    or dob < date '1900-01-01' then
   raise exception 'Waitlist requires age 13 or older.';
 end if;
 insert into public.sat_launch_waitlist(email) values(normalized)
 on conflict(email) do nothing;
 return true;
end; $$;
revoke all on function public.sat_join_waitlist(text, text) from public;
grant execute on function public.sat_join_waitlist(text, text) to anon, authenticated;

create or replace function public.sat_registration_is_full()
returns boolean language sql security definer set search_path = '' as $$
 select (select count(*) from auth.users) >= 100;
$$;
revoke all on function public.sat_registration_is_full() from public;
grant execute on function public.sat_registration_is_full() to anon, authenticated;
