-- Every canonical practice question requires documented commercial-use rights.
-- Existing practice-test questions start as unverified; do not infer permission
-- from public availability, educational purpose, or technical content verification.
alter table public.sat_question_bank
 add column if not exists commercial_rights_status text not null default 'unverified',
 add column if not exists commercial_rights_basis text,
 add column if not exists commercial_rights_reviewed_at timestamptz;
alter table public.sat_question_bank
 drop constraint if exists sat_question_bank_commercial_rights_check;
alter table public.sat_question_bank
 add constraint sat_question_bank_commercial_rights_check
 check (
  commercial_rights_status in ('unverified','original','licensed')
  and (commercial_rights_status='unverified'
       or (nullif(btrim(coalesce(commercial_rights_basis,'')),'') is not null
           and commercial_rights_reviewed_at is not null))
 );

create or replace function public.sat_commercial_content_is_cleared()
returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.sat_question_bank)
 and not exists(select 1 from public.sat_question_bank
   where commercial_rights_status='unverified');
$$;
revoke all on function public.sat_commercial_content_is_cleared() from public,anon,authenticated;
grant execute on function public.sat_commercial_content_is_cleared() to service_role;
-- Content-rights approvals are restricted to the trusted operator service role.
grant update(commercial_rights_status,commercial_rights_basis,commercial_rights_reviewed_at)
 on public.sat_question_bank to service_role;
