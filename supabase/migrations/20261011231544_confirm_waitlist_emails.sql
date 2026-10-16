-- Email verification and one-click personal-data removal for waitlist.
alter table public.sat_launch_waitlist
 add column if not exists verification_token uuid not null default gen_random_uuid(),
 add column if not exists verified_at timestamptz,
 add column if not exists verification_sent_at timestamptz;
create unique index if not exists sat_launch_waitlist_verification_token_idx
 on public.sat_launch_waitlist(verification_token);

create or replace function public.sat_join_waitlist(email_input text,birth_date_input text)
returns boolean language plpgsql security definer set search_path='' as $$
declare normalized text:=lower(trim(email_input));dob date;count_changed integer;
begin
 if normalized is null or length(normalized)<6 or length(normalized)>254
 or normalized !~ '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$' then
   raise exception 'Enter a valid email address.';
 end if;
 if birth_date_input is null or birth_date_input !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then
  raise exception 'Enter a valid date of birth.';
 end if;
 begin dob:=birth_date_input::date;
 exception when others then raise exception 'Enter a valid date of birth.'; end;
 if to_char(dob,'YYYY-MM-DD')<>birth_date_input
   or dob>(current_date-interval '13 years')::date or dob<date '1900-01-01' then
  raise exception 'Waitlist is available for students aged 13 or older.';
 end if;
 insert into public.sat_launch_waitlist(email) values(normalized)
 on conflict(email) do nothing;
 update public.sat_launch_waitlist set verification_sent_at=now()
 where email=normalized and status='waiting' and verified_at is null
  and (verification_sent_at is null or verification_sent_at<now()-interval '15 minutes');
 get diagnostics count_changed=row_count;
 return count_changed=1;
end; $$;
revoke all on function public.sat_join_waitlist(text,text) from public,anon,authenticated;
grant execute on function public.sat_join_waitlist(text,text) to service_role;

create or replace function public.sat_verify_waitlist_email(token_input uuid)
returns boolean language plpgsql security definer set search_path='' as $$
declare affected integer;
begin
 update public.sat_launch_waitlist set verified_at=coalesce(verified_at,now())
 where verification_token=token_input and status='waiting';
 get diagnostics affected=row_count;
 return affected>0;
end; $$;
revoke all on function public.sat_verify_waitlist_email(uuid) from public,anon,authenticated;
grant execute on function public.sat_verify_waitlist_email(uuid) to service_role;

create or replace function public.sat_unsubscribe_waitlist(token_input uuid)
returns boolean language plpgsql security definer set search_path='' as $$
declare removed_id bigint;
begin
 delete from public.sat_launch_waitlist where unsubscribe_token=token_input returning id into removed_id;
 return removed_id is not null;
end; $$;
revoke all on function public.sat_unsubscribe_waitlist(uuid) from public,anon,authenticated;
grant execute on function public.sat_unsubscribe_waitlist(uuid) to service_role;

drop function if exists public.sat_claim_waitlist_invite();
create function public.sat_claim_waitlist_invite()
returns table(id bigint,email text,claim_token uuid,unsubscribe_token uuid)
language plpgsql security definer set search_path='' as $$
declare mode text;max_users integer;
begin
 perform pg_catalog.pg_advisory_xact_lock(712342,100);
 select launch_mode,capacity into mode,max_users from public.sat_launch_config where id=true;
 if mode is null or mode='closed' then return; end if;
 if mode='la' and (select public.sat_la_occupied_seats())>=max_users then return; end if;
 return query with next_entry as (
  select w.id from public.sat_launch_waitlist w
  where w.verified_at is not null and
   (w.status='waiting' or (w.status='sending' and w.claimed_at<now()-interval '15 minutes'))
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
