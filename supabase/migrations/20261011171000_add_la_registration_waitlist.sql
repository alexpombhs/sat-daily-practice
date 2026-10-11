-- Limited availability admission control. Runs after *every* auth.users insert,
-- including direct API registration, and serializes inserts to prevent exceeding 100.
-- Counts existing accounts conservatively, including unconfirmed accounts.
create or replace function public.sat_limit_auth_users()
returns trigger language plpgsql security definer set search_path=''
as $$
declare account_count bigint;
begin
  perform pg_catalog.pg_advisory_xact_lock(712342,100);
  select count(*) into account_count from auth.users;
  if account_count > 100 then
    raise exception 'SAT limited availability registration is full; please join the waitlist.'
      using errcode='P0001';
  end if;
  return new;
end;
$$;
revoke all on function public.sat_limit_auth_users() from public, anon, authenticated;
drop trigger if exists sat_enforce_account_capacity on auth.users;
create trigger sat_enforce_account_capacity
  after insert on auth.users
  for each row execute function public.sat_limit_auth_users();

create table if not exists public.sat_launch_waitlist (
  id bigint generated always as identity primary key,
  email text not null unique,
  created_at timestamptz not null default now(),
  contacted_at timestamptz,
  status text not null default 'waiting'
    check(status in ('waiting','invited','removed'))
);
alter table public.sat_launch_waitlist enable row level security;
revoke all on public.sat_launch_waitlist from anon,authenticated;
-- Controlled insert-only signup: callers cannot enumerate or select emails.
create or replace function public.sat_join_waitlist(email_input text, birth_date_input text)
returns boolean language plpgsql security definer set search_path=''
as $$
declare normalized text := lower(trim(email_input));
  birth_date date;
begin
  if length(normalized)>254 or length(normalized)<6 or normalized !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'Enter a valid email address.';
  end if;
  if birth_date_input is null or birth_date_input !~ '^\\d{4}-\\d{2}-\\d{2}
    values(normalized) on conflict(email) do nothing;
  return true;
end;
$$;
revoke all on function public.sat_join_waitlist(text,text) from public;
grant execute on function public.sat_join_waitlist(text) to anon,authenticated;
-- No waitlist SELECT/UPDATE/DELETE permission for public API roles.
create or replace function public.sat_registration_is_full()
returns boolean language sql security definer set search_path=''
as $$
  select (select count(*) from auth.users) >= 100;
$$;
revoke all on function public.sat_registration_is_full() from public;
grant execute on function public.sat_registration_is_full() to anon,authenticated;
 then
    raise exception 'Enter a valid date of birth.';
  end if;
  begin
    birth_date := birth_date_input::date;
  exception when others then
    raise exception 'Enter a valid date of birth.';
  end;
  if to_char(birth_date,'YYYY-MM-DD') <> birth_date_input or birth_date > (current_date - interval '13 years')::date or birth_date < date '1900-01-01' then
    raise exception 'Waitlist registration is available only to eligible users aged 13 or older.';
  end if;
  insert into public.sat_launch_waitlist(email)
    values(normalized) on conflict(email) do nothing;
  return true;
end;
$$;
revoke all on function public.sat_join_waitlist(text) from public;
grant execute on function public.sat_join_waitlist(text) to anon,authenticated;
-- No waitlist SELECT/UPDATE/DELETE permission for public API roles.
create or replace function public.sat_registration_is_full()
returns boolean language sql security definer set search_path=''
as $$
  select (select count(*) from auth.users) >= 100;
$$;
revoke all on function public.sat_registration_is_full() from public;
grant execute on function public.sat_registration_is_full() to anon,authenticated;
