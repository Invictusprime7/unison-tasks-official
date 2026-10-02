-- Stale builder tabs flood the old RPC name (~90 calls/sec), exhausting the API connection pool.
-- Renaming makes old clients get an instant "function not found" without touching the database.
ALTER FUNCTION public.commit_canonical_site_revision(uuid, uuid, uuid, uuid, text, text, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, boolean, jsonb, jsonb, text, text)
  RENAME TO commit_canonical_site_revision_v2;
NOTIFY pgrst, 'reload schema';