CREATE UNIQUE INDEX IF NOT EXISTS user_roles_single_admin ON public.user_roles (role) WHERE role = 'admin';
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
begin
  insert into public.user_roles(user_id, role)
  select new.id, 'admin'
  where not exists (select 1 from public.user_roles where role='admin')
  on conflict do nothing;
  return new;
end $function$;