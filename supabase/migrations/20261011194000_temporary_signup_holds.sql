-- Temporary signup holds prevent over-promising pending confirmations.
-- Holds expire automatically after 24 hours and do not occupy permanent seats.
create table if not exists public.sat_la_signup_holds (
 user_id uuid primary key references auth.users(id) on delete cascade,
 expires_at timestamptz not null default now()+interval '24 hours',
 consumed_at timestamptz
);
alter table public.sat_la_signup_holds enable row level security;
revoke all on public.sat_la_signup_holds from anon,authenticated;

create or replace function public.sat_la_occupied_seats()
returns bigint language sql volatile security definer set search_path='' as $$
 select (select count(*) from auth.users where email_confirmed_at is not null)
      + (select count(*) from public.sat_la_reservations where consumed_at is null and expires_at>now())
      + (select count(*) from public.sat_la_signup_holds where consumed_at is null and expires_at>now());
$$;
revoke all on function public.sat_la_occupied_seats() from public,anon,authenticated;
grant execute on function public.sat_la_occupied_seats() to service_role;

create or replace function public.sat_guard_auth_seat()
returns trigger language plpgsql security definer set search_path='' as $$
declare mode text; max_users integer; occupied bigint; own_hold bigint;
begin
 perform pg_catalog.pg_advisory_xact_lock(712342,100);
 select launch_mode,capacity into mode,max_users from public.sat_launch_config where id=true;
 if tg_op='INSERT' then
  if mode is null or mode='closed' then raise exception 'Registration is not open yet.'; end if;
  if mode='ga' then return new; end if;
  select count(*) into own_hold from public.sat_la_reservations r
   where lower(r.email)=lower(new.email) and r.expires_at>now() and r.consumed_at is null;
  if new.email_confirmed_at is null then
   if own_hold=0 then
    if (select public.sat_la_occupied_seats())>=max_users then
     raise exception 'Registration is currently full.';
    end if;
    insert into public.sat_la_signup_holds(user_id,expires_at)
      values(new.id,now()+interval '24 hours');
   end if;
   return new;
  end if;
 elsif tg_op='UPDATE' then
  if old.email_confirmed_at is not null or new.email_confirmed_at is null then return new; end if;
  if mode='ga' then return new; end if;
 end if;

 select public.sat_la_occupied_seats() into occupied;
 select
 (select count(*) from public.sat_la_reservations r
  where lower(r.email)=lower(new.email) and r.expires_at>now() and r.consumed_at is null)
 +(select count(*) from public.sat_la_signup_holds h where h.user_id=new.id
   and h.expires_at>now() and h.consumed_at is null)
 into own_hold;

 if mode='la' and occupied-own_hold>max_users then
  raise exception 'Registration is currently full.';
 end if;
 update public.sat_la_reservations set consumed_at=now()
 where lower(email)=lower(new.email) and expires_at>now() and consumed_at is null;
 update public.sat_la_signup_holds set consumed_at=now()
 where user_id=new.id and consumed_at is null;
 return new;
end; $$;
revoke all on function public.sat_guard_auth_seat() from public,anon,authenticated;
