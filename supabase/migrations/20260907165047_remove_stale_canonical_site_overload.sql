DROP FUNCTION IF EXISTS public.commit_canonical_site_revision(
	uuid,
	uuid,
	uuid,
	jsonb,
	jsonb,
	uuid,
	text,
	text,
	text,
	jsonb,
	text,
	text,
	jsonb,
	text,
	text,
	text
);

DROP FUNCTION IF EXISTS public.can_access_project(uuid, text[]);