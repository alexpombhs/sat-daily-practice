-- Only explicitly authorized staff can modify the canonical SAT question bank.
create table if not exists public.sat_content_admins(
 user_id uuid primary key references auth.users(id) on delete cascade,
 created_at timestamptz not null default now()
);
alter table public.sat_content_admins enable row level security;
revoke all on public.sat_content_admins from anon,authenticated;

create or replace function public.sat_is_content_admin()
returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.sat_content_admins where user_id=(select auth.uid()));
$$;
revoke all on function public.sat_is_content_admin() from public,anon;
grant execute on function public.sat_is_content_admin() to authenticated;

drop policy if exists "question_bank_config_authenticated_update" on public.sat_question_bank_config;
create policy "question_bank_config_authenticated_update" on public.sat_question_bank_config
 for update to authenticated
 using((select public.sat_is_content_admin()))
 with check((select public.sat_is_content_admin()));

drop policy if exists "question_bank_authenticated_update" on public.sat_question_bank;
create policy "question_bank_authenticated_update" on public.sat_question_bank
 for update to authenticated
 using((select public.sat_is_content_admin()) and
 exists(select 1 from public.sat_question_bank_config where singleton=true and editing_enabled=true))
 with check((select public.sat_is_content_admin()) and
 exists(select 1 from public.sat_question_bank_config where singleton=true and editing_enabled=true));

-- Admin memberships must be assigned by service-role/operator, never client-side.
