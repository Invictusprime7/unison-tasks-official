-- Keep the versioned canonical RPC behind the same privilege boundary as the
-- historical canonical writer after direct revision inserts were revoked.
ALTER FUNCTION public.commit_canonical_site_revision_v2(
  uuid, uuid, uuid, uuid, text, text,
  jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb,
  boolean, jsonb, jsonb, text, text
) SECURITY DEFINER
  SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.commit_canonical_site_revision_v2(
  uuid, uuid, uuid, uuid, text, text,
  jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb,
  boolean, jsonb, jsonb, text, text
) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.commit_canonical_site_revision_v2(
  uuid, uuid, uuid, uuid, text, text,
  jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb,
  boolean, jsonb, jsonb, text, text
) TO authenticated, service_role;

NOTIFY pgrst, 'reload schema';
