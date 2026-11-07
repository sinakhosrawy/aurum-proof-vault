CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT _user_id = 'f4d9cdff-4f57-40ca-a3f8-1ecaf7a0be96'::uuid
    AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION 'Public registration is disabled for this site';
END;
$$;
COMMENT ON FUNCTION public.handle_new_user() IS 'Registration retired: this single-administrator site rejects new accounts; existing account login and recovery are unchanged.';