create or replace function public.sat_registration_status()
returns text language plpgsql stable security definer set search_path='' as $$
declare mode text; cap integer;
begin
 select launch_mode,capacity into mode,cap from public.sat_launch_config where id=true;
 if mode is null or mode='closed' then return 'closed'; end if;
 if mode='ga' then return 'open'; end if;
 if (select public.sat_la_occupied_seats())>=cap then return 'full'; end if;
 return 'open';
end; $$;
revoke all on function public.sat_registration_status() from public;
grant execute on function public.sat_registration_status() to anon,authenticated,service_role;