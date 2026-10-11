-- Parsing and canonical editing are super-account capabilities, never purchasable Plus.
-- The two existing original accounts are the only grandfathered super users.
create or replace function public.sat_is_content_admin()
returns boolean language sql stable security definer set search_path='' as $$
 select public.sat_is_legacy_plus((select auth.uid()))
 and exists(select 1 from public.sat_content_admins a where a.user_id=(select auth.uid()));
$$;
revoke all on function public.sat_is_content_admin() from public,anon;
grant execute on function public.sat_is_content_admin() to authenticated;
