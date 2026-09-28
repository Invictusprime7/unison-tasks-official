-- Canonical commits validate and persist the full site snapshot atomically.
-- The default authenticated timeout (8s) cancels larger edits inside bundle
-- validation. PostgREST reads this function setting from its schema cache.
-- Keep headroom below the Data API's 60s request ceiling; leave role defaults,
-- RLS, optimistic revision checks, and lock timeouts unchanged.
ALTER FUNCTION public.commit_canonical_site_revision(
  uuid, uuid, uuid, uuid, text, text,
  jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb,
  boolean, jsonb, jsonb, text, text
) SET statement_timeout = '45s';

NOTIFY pgrst, 'reload schema';
