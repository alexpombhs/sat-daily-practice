-- Before enabling tiers, permanently grandfather every existing Auth account.
-- Snapshot is deliberately early so later rollout migrations cannot restrict them.
create table if not exists public.sat_legacy_full_access(
 user_id uuid primary key references auth.users(id) on delete cascade,
 grandfathered_at timestamptz not null default now()
);
alter table public.sat_legacy_full_access enable row level security;
revoke all on public.sat_legacy_full_access from public,anon,authenticated;
grant select,insert,update,delete on public.sat_legacy_full_access to service_role;
insert into public.sat_legacy_full_access(user_id)
select id from auth.users on conflict(user_id) do nothing;
