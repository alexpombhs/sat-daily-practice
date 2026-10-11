create table if not exists public.sat_question_difficulty (
  question_id text primary key references public.sat_question_bank(id) on delete cascade,
  difficulty text not null check (difficulty in ('easy','medium','advanced')),
  concepts jsonb not null default '[]'::jsonb,
  reasoning_steps smallint not null check (reasoning_steps between 1 and 8),
  integration_level text not null check (integration_level in ('low','medium','high')),
  confidence numeric(3,2) not null check (confidence between 0 and 1),
  rubric_version text not null,
  evaluated_at timestamptz not null default now()
);
create index if not exists sat_question_difficulty_level_idx on public.sat_question_difficulty(difficulty);
alter table public.sat_question_difficulty enable row level security;
revoke all on table public.sat_question_difficulty from anon, authenticated;
grant select on table public.sat_question_difficulty to authenticated;
drop policy if exists "Authenticated read difficulty" on public.sat_question_difficulty;
create policy "Authenticated read difficulty" on public.sat_question_difficulty for select to authenticated using (true);
