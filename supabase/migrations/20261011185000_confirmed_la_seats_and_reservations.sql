-- LA admissions: confirmed users and unexpired 24h email reservations occupy seats.
-- Unconfirmed accounts do not permanently occupy seats.
create table if not exists public.sat_la_reservations (
 waitlist_id bigint primary key references public.sat_launch_waitlist(id) on delete cascade,
 email text not null,
 reserved_at timestamptz not null default now(),
 expires_at timestamptz not null,
 consumed_at timestamptz
);
create index if not exists sat_la_reservations_expires_idx on public.sat_la_reservations(expires_at)
 where consumed_at is null;
alter table public.sat_la_reservations enable row level security;
revoke all on public.sat_la_reservations from anon,authenticated;

create or replace function public.sat_la_occupied_seats()
returns bigint language sql security definer set search_path='' stable as $$
 select (select count(*) from auth.users where email_confirmed_at is not null)
      + (select count(*) from public.sat_la_reservations
         where consumed_at is null and expires_at>now());
$$;
revoke all on function public.sat_la_occupied_seats() from public,anon,authenticated;
grant execute on function public.sat_la_occupied_seats() to service_role;

create or replace function public.sat_registration_is_full()
returns boolean language plpgsql security definer set search_path='' stable as $$
declare mode text; max_users integer;
begin
 select launch_mode,capacity into mode,max_users from public.sat_launch_config where id=true;
 if mode='ga' then return false; end if;
 if mode is null or mode='closed' then return true; end if;
 return (select public.sat_la_occupied_seats()) >= max_users;
end; $$;
revoke all on function public.sat_registration_is_full() from public;
grant execute on function public.sat_registration_is_full() to anon,authenticated,service_role;

create or replace function public.sat_guard_auth_seat()
returns trigger language plpgsql security definer set search_path='' as $$
declare mode text; max_users integer; occupied bigint; own_hold bigint;
begin
 perform pg_catalog.pg_advisory_xact_lock(712342,100);
 select launch_mode,capacity into mode,max_users from public.sat_launch_config where id=true;
 if tg_op='INSERT' then
  if mode is null or mode='closed' then raise exception 'Registration is not open yet.'; end if;
  if mode='ga' then return new; end if;
  if new.email_confirmed_at is null then
    -- Pending registrations do not consume a permanent seat, but never
    -- accept new registrations after all seats are occupied.
    if (select public.sat_la_occupied_seats()) >= max_users
       and not exists(select 1 from public.sat_la_reservations r
         where lower(r.email)=lower(new.email)
           and r.expires_at>now() and r.consumed_at is null) then
      raise exception 'Registration is currently full.';
    end if;
    return new;
  end if;
 elsif tg_op='UPDATE' then
  if old.email_confirmed_at is not null or new.email_confirmed_at is null then return new; end if;
  -- Existing pending users can verify when space is available, even during
  -- an administrative closure; a confirmed account still must fit LA capacity.
  if mode='ga' then return new; end if;
 end if;
 select public.sat_la_occupied_seats() into occupied;
 select count(*) into own_hold from public.sat_la_reservations r
 where lower(r.email)=lower(new.email) and r.expires_at>now()
       and r.consumed_at is null;
 if mode='la' and occupied-own_hold >= max_users then
  raise exception 'Registration is currently full.';
 end if;
 update public.sat_la_reservations set consumed_at=now()
 where lower(email)=lower(new.email) and expires_at>now() and consumed_at is null;
 return new;
end; $$;
revoke all on function public.sat_guard_auth_seat() from public,anon,authenticated;
drop trigger if exists sat_enforce_account_capacity on auth.users;
create trigger sat_auth_admit_created after insert on auth.users
 for each row execute function public.sat_guard_auth_seat();
create trigger sat_auth_admit_confirmed after update of email_confirmed_at on auth.users
 for each row execute function public.sat_guard_auth_seat();

-- Reserve seat as part of the same transaction that claims an invitation.
drop function if exists public.sat_claim_waitlist_invite();
create function public.sat_claim_waitlist_invite()
returns table(id bigint,email text,claim_token uuid,unsubscribe_token uuid)
language plpgsql security definer set search_path='' as $$
declare mode text; max_users integer;
begin
 perform pg_catalog.pg_advisory_xact_lock(712342,100);
 select launch_mode,capacity into mode,max_users from public.sat_launch_config where id=true;
 if mode is null or mode='closed' then return; end if;
 if mode='la' and (select public.sat_la_occupied_seats())>=max_users then return; end if;
 return query with next_entry as (
  select w.id from public.sat_launch_waitlist w
  where w.status='waiting'
  order by w.created_at for update skip locked limit 1
 ), claimed as (
  update public.sat_launch_waitlist w
  set status='sending',claimed_at=now(),claim_token=gen_random_uuid()
  from next_entry where w.id=next_entry.id
  returning w.id,w.email,w.claim_token,w.unsubscribe_token
 ), hold as (
  insert into public.sat_la_reservations(waitlist_id,email,reserved_at,expires_at)
  select claimed.id,claimed.email,now(),now()+interval '24 hours' from claimed
  on conflict(waitlist_id) do update set
    reserved_at=excluded.reserved_at,expires_at=excluded.expires_at,consumed_at=null
  returning waitlist_id
 )
 select claimed.id,claimed.email,claimed.claim_token,claimed.unsubscribe_token
 from claimed join hold on hold.waitlist_id=claimed.id;
end; $$;
revoke all on function public.sat_claim_waitlist_invite() from public,anon,authenticated;
grant execute on function public.sat_claim_waitlist_invite() to service_role;

create or replace function public.sat_finish_waitlist_invite(
 invite_id bigint,token uuid,was_sent boolean
) returns boolean language plpgsql security definer set search_path='' as $$
declare affected integer;
begin
 update public.sat_launch_waitlist
 set status=case when was_sent then 'invited' else 'waiting' end,
 contacted_at=case when was_sent then now() else contacted_at end,
 claimed_at=null,claim_token=null
 where id=invite_id and claim_token=token and status='sending';
 get diagnostics affected=row_count;
 if affected=1 and not was_sent then
  delete from public.sat_la_reservations where waitlist_id=invite_id and consumed_at is null;
 end if;
 return affected=1;
end; $$;
revoke all on function public.sat_finish_waitlist_invite(bigint,uuid,boolean) from public,anon,authenticated;
grant execute on function public.sat_finish_waitlist_invite(bigint,uuid,boolean) to service_role;
