-- Operator-controlled launch mode. 100-seat limit is the default, GA may be enabled later.
create table if not exists public.sat_launch_config (
 id boolean primary key default true check(id),
 launch_mode text not null default 'la' check(launch_mode in ('closed','la','ga')),
 capacity integer not null default 100 check(capacity between 1 and 1000000),
 updated_at timestamptz not null default now()
);
alter table public.sat_launch_config enable row level security;
revoke all on public.sat_launch_config from anon,authenticated;
insert into public.sat_launch_config(id,launch_mode,capacity)
values(true,'closed',100) on conflict(id) do nothing;

create or replace function public.sat_limit_auth_users()
returns trigger language plpgsql security definer set search_path='' as $$
declare mode text; max_users integer; total bigint;
begin
 perform pg_catalog.pg_advisory_xact_lock(712342,100);
 select launch_mode,capacity into mode,max_users from public.sat_launch_config where id=true;
 if mode is null or mode='closed' then
  raise exception 'Registration is not open yet.' using errcode='P0001';
 end if;
 if mode='la' then
  select count(*) into total from auth.users;
  if total > max_users then
   raise exception 'Registration is currently full.' using errcode='P0001';
  end if;
 end if;
 return new;
end; $$;
revoke all on function public.sat_limit_auth_users() from public,anon,authenticated;

create or replace function public.sat_registration_is_full()
returns boolean language sql security definer set search_path='' as $$
 select case
 when (select launch_mode from public.sat_launch_config where id=true) = 'ga' then false
 when (select launch_mode from public.sat_launch_config where id=true) = 'closed' then true
 else (select count(*) from auth.users) >=
      (select capacity from public.sat_launch_config where id=true)
 end;
$$;
revoke all on function public.sat_registration_is_full() from public;
grant execute on function public.sat_registration_is_full() to anon,authenticated,service_role;

-- Do not let clients switch release modes; service operator changes this explicitly.
-- Example after release approval: UPDATE public.sat_launch_config SET launch_mode='la' WHERE id=true;
-- For GA: UPDATE public.sat_launch_config SET launch_mode='ga' WHERE id=true;
