-- One-time early adopter codes, issued by an operator after external payment
-- is confirmed. Only a SHA-256 digest is retained, never the redeemable code.
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.sat_prepaid_codes (
 id uuid primary key default gen_random_uuid(),
 code_digest text not null unique,
 issued_at timestamptz not null default now(),
 issued_by text not null,
 payment_reference text not null unique,
 provider text not null check(provider in ('paypal','venmo','other')),
 expires_at timestamptz not null default now()+interval '90 days',
 redeemed_by uuid references auth.users(id) on delete set null,
 redeemed_at timestamptz,
 access_pass_id bigint references public.sat_access_passes(id) on delete set null,
 revoked_at timestamptz

);
alter table public.sat_prepaid_codes enable row level security;
revoke all on public.sat_prepaid_codes from public,anon,authenticated;
create index if not exists sat_prepaid_codes_unused_idx on public.sat_prepaid_codes(expires_at)
 where redeemed_at is null and revoked_at is null;

create or replace function public.sat_issue_prepaid_code(
 p_code text,p_issued_by text,p_payment_reference text,p_provider text
) returns uuid language plpgsql security definer set search_path='' as $$
declare created uuid;
begin
 if p_code !~ '^SAT-[A-Z0-9]{6}-[A-Z0-9]{6}-[A-Z0-9]{6}$' then raise exception 'Invalid format'; end if;
 if p_issued_by is null or length(trim(p_issued_by))<2
    or p_payment_reference is null or length(trim(p_payment_reference))<4
    or p_provider not in ('paypal','venmo','other') then raise exception 'Invalid issuance metadata'; end if;
 insert into public.sat_prepaid_codes(code_digest,issued_by,payment_reference,provider)
 values(encode(extensions.digest(p_code,'sha256'),'hex'),p_issued_by,p_payment_reference,p_provider)
 returning id into created;
 return created;
end; $$;
revoke all on function public.sat_issue_prepaid_code(text,text,text,text) from public,anon,authenticated;
grant execute on function public.sat_issue_prepaid_code(text,text,text,text) to service_role;

create or replace function public.sat_redeem_prepaid_code(p_code text)
returns timestamptz language plpgsql security definer set search_path='' as $$
declare me uuid := (select auth.uid()); code_id uuid; expiry timestamptz;pass_id bigint;
begin
 if me is null then raise exception 'Sign in before activating your pass.'; end if;
 if p_code is null or p_code !~ '^SAT-[A-Z0-9]{6}-[A-Z0-9]{6}-[A-Z0-9]{6}$' then
  raise exception 'Enter a valid activation code.';
 end if;
 -- A row-level lock makes the code single-use even for simultaneous requests.
 select id into code_id from public.sat_prepaid_codes
 where code_digest=encode(extensions.digest(p_code,'sha256'),'hex')
 and redeemed_at is null and revoked_at is null and expires_at>now()
 for update;
 if code_id is null then raise exception 'This code is invalid, expired, or already used.'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(me::text));
 select greatest(now(),coalesce(max(expires_at),now())) into expiry
 from public.sat_access_passes where user_id=me and refunded_at is null and expires_at>now();
 expiry:=expiry+interval '90 days';
 insert into public.sat_access_passes(user_id,checkout_session_id,purchased_at,starts_at,expires_at)
 values(me,'prepaid:'||code_id,now(),expiry-interval '90 days',expiry)
 returning id into pass_id;
 update public.sat_prepaid_codes
 set redeemed_by=me,redeemed_at=now(),access_pass_id=pass_id where id=code_id;
 return expiry;
end; $$;
revoke all on function public.sat_redeem_prepaid_code(text) from public,anon;
grant execute on function public.sat_redeem_prepaid_code(text) to authenticated;
