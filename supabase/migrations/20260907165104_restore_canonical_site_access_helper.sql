CREATE OR REPLACE FUNCTION public.can_access_project(
	p_project_id uuid,
	p_roles text[]
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, private
AS $$
	SELECT auth.uid() IS NOT NULL
		AND (
			private.is_project_owner(p_project_id, auth.uid())
			OR private.check_project_membership_role(
				p_project_id,
				auth.uid(),
				COALESCE(p_roles, ARRAY[]::text[])
			)
		);
$$;

REVOKE ALL ON FUNCTION public.can_access_project(uuid, text[])
	FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_project(uuid, text[])
	TO service_role;;
