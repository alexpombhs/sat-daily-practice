-- Deploy only together with the canonical-only authenticated frontend.
-- Existing question rows and user history remain untouched.
alter table public.sat_question_bank add column if not exists inline_visuals jsonb not null default '[]'::jsonb;
revoke select on table public.sat_question_bank from anon;
drop policy if exists question_bank_public_read on public.sat_question_bank;
drop policy if exists question_bank_authenticated_read on public.sat_question_bank;
create policy question_bank_authenticated_read
  on public.sat_question_bank
  for select
  to authenticated
  using ((select auth.uid()) is not null);
grant select on table public.sat_question_bank to authenticated;
