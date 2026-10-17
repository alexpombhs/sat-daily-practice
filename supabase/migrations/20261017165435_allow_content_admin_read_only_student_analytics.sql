create policy "content_admins_select_attempts_for_analytics"
on public.sat_attempts for select to authenticated
using ((select public.sat_is_content_admin()));
create policy "content_admins_select_sessions_for_analytics"
on public.sat_sessions for select to authenticated
using ((select public.sat_is_content_admin()));
