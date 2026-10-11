-- Paid entitlements are server-controlled. Webhooks and operator jobs use service_role.
create table if not exists public.sat_access_passes (
 id bigint generated always as identity primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 checkout_session_id text not null unique,
 payment_intent_id text,
 purchased_at timestamptz not null default now(),
 starts_at timestamptz not null,
 expires_at timestamptz not null,
 refunded_at timestamptz,
 created_at timestamptz not null default now(),
 constraint sat_access_pass_dates check(expires_at>starts_at)
);
create index if not exists sat_access_passes_user_expiry_idx on public.sat_access_passes(user_id,expires_at desc);
alter table public.sat_access_passes enable row level security;
revoke all on public.sat_access_passes from anon,authenticated;
grant select on public.sat_access_passes to authenticated;
create policy sat_access_pass_own_read on public.sat_access_passes for select to authenticated
 using(user_id=(select auth.uid()));
create or replace function public.sat_my_plus_access()
returns boolean language sql security definer set search_path='' stable as $$
 select exists(select 1 from public.sat_access_passes p
 where p.user_id=(select auth.uid()) and p.starts_at<=now()
 and p.expires_at>now() and p.refunded_at is null);
$$;
revoke all on function public.sat_my_plus_access() from public,anon;
grant execute on function public.sat_my_plus_access() to authenticated;
