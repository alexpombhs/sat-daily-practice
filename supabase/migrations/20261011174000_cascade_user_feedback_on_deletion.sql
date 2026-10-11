-- On user account deletion, remove authored feedback rather than retaining
-- content after user_id has been nulled. Anonymous feedback remains unaffected.
alter table public.sat_feedback
  drop constraint if exists sat_feedback_user_id_fkey;
alter table public.sat_feedback
  add constraint sat_feedback_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;
