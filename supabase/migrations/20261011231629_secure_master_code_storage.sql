-- Never commit, return, or store a plaintext master code.
-- The operator provisions a bcrypt hash and an explicit user allowlist.
create table if not exists public.sat_master_test_code_config (
 singleton boolean primary key default true check (singleton=true),
 code_hash text not null,
 enabled boolean not null default false,
 updated_at timestamptz not null default now()
);
create table if not exists public.sat_master_test_allowed_users (
 user_id uuid primary key references auth.users(id) on delete cascade,
 granted_at timestamptz not null default now()
);
create table if not exists public.sat_master_test_attempts (
 user_id uuid primary key references auth.users(id) on delete cascade,
 window_started_at timestamptz not null default now(),
 attempts integer not null default 0
);
alter table public.sat_master_test_code_config enable row level security;
alter table public.sat_master_test_allowed_users enable row level security;
alter table public.sat_master_test_attempts enable row level security;
revoke all on public.sat_master_test_code_config from public,anon,authenticated;
revoke all on public.sat_master_test_allowed_users from public,anon,authenticated;
revoke all on public.sat_master_test_attempts from public,anon,authenticated;
grant select,insert,update,delete on public.sat_master_test_code_config to service_role;
grant select,insert,update,delete on public.sat_master_test_allowed_users to service_role;
grant select,insert,update,delete on public.sat_master_test_attempts to service_role;

create or replace function public.sat_redeem_master_test_code(p_user_id uuid,p_code text)
returns timestamptz language plpgsql security definer set search_path='' as $$
declare
 stored_hash text;
 is_enabled boolean;
 attempts_now integer;
 expiry timestamptz;
begin
 if p_user_id is null or p_code is null or length(p_code)>100 then return null; end if;
 -- Only an operator-approved user may use this reusable test credential.
 if not exists(select 1 from public.sat_master_test_allowed_users where user_id=p_user_id)
 then return null; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('master-test:'||p_user_id::text));
 insert into public.sat_master_test_attempts(user_id,window_started_at,attempts)
 values(p_user_id,now(),1)
 on conflict(user_id) do update set
  attempts=case when public.sat_master_test_attempts.window_started_at<now()-interval '1 hour'
    then 1 else public.sat_master_test_attempts.attempts+1 end,
  window_started_at=case when public.sat_master_test_attempts.window_started_at<now()-interval '1 hour'
    then now() else public.sat_master_test_attempts.window_started_at end
 returning attempts into attempts_now;
 if attempts_now>5 then return null; end if;
 select code_hash,enabled into stored_hash,is_enabled
 from public.sat_master_test_code_config where singleton=true;
 if not coalesce(is_enabled,false) or stored_hash is null then return null; end if;
 if extensions.crypt(upper(trim(p_code)),stored_hash)<>stored_hash then return null; end if;
 -- A repeated activation refreshes the same test pass; it never grants paid credit.
 select public.sat_activate_master_test_pass(p_user_id) into expiry;
 delete from public.sat_master_test_attempts where user_id=p_user_id;
 return expiry;
end; $$;
revoke all on function public.sat_redeem_master_test_code(uuid,text) from public,anon,authenticated;
grant execute on function public.sat_redeem_master_test_code(uuid,text) to service_role;
