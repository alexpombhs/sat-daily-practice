create table if not exists public.sat_vocabulary_attempts (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  vocabulary_id text not null,
  direction text not null check (direction in ('word-to-definition','definition-to-word')),
  selected_answer text not null,
  correct_answer text not null,
  correct boolean not null,
  created_at timestamptz not null default now()
);

create index if not exists sat_vocabulary_attempts_user_word_created_idx
  on public.sat_vocabulary_attempts(user_id,vocabulary_id,created_at desc);

alter table public.sat_vocabulary_attempts enable row level security;

revoke all on table public.sat_vocabulary_attempts from anon, authenticated;
grant select, insert on table public.sat_vocabulary_attempts to authenticated;

drop policy if exists "Users can read own vocabulary attempts" on public.sat_vocabulary_attempts;
create policy "Users can read own vocabulary attempts"
  on public.sat_vocabulary_attempts
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own vocabulary attempts" on public.sat_vocabulary_attempts;
create policy "Users can insert own vocabulary attempts"
  on public.sat_vocabulary_attempts
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);
