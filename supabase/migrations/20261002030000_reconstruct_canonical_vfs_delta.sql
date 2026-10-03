-- Reconstruct the complete candidate under the draft row lock. The client
-- sends only changed files and deletions in _commitMetadata.vfsDelta; the
-- existing full writer remains responsible for hashing, provenance, CAS and
-- all downstream projections.
CREATE OR REPLACE FUNCTION public.commit_canonical_site_revision_v2(
  p_project_id uuid,
  p_business_id uuid,
  p_draft_id uuid,
  p_parent_revision_id uuid,
  p_source text,
  p_status text,
  p_patch_json jsonb,
  p_vfs_files jsonb,
  p_site_bundle_snapshot jsonb,
  p_runtime_manifest jsonb,
  p_playground_state jsonb,
  p_readiness_report jsonb,
  p_diagnostics jsonb,
  p_publish_ready boolean,
  p_publish_blockers jsonb,
  p_backend_ops_applied jsonb,
  p_vfs_hash text,
  p_active_page_path text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
SET statement_timeout = '45s'
AS $$
DECLARE
  v_delta jsonb := p_patch_json->'_commitMetadata'->'vfsDelta';
  v_base_vfs jsonb;
  v_deleted_paths text[];
  v_runtime_vfs jsonb;
BEGIN
  IF jsonb_typeof(v_delta) = 'object' THEN
    IF jsonb_typeof(v_delta->'files') <> 'object'
      OR jsonb_typeof(v_delta->'deletedPaths') <> 'array'
      OR EXISTS (
        SELECT 1
        FROM jsonb_array_elements(v_delta->'deletedPaths') AS item(value)
        WHERE jsonb_typeof(item.value) <> 'string'
      ) THEN
      RAISE EXCEPTION 'Canonical VFS delta is malformed'
        USING ERRCODE = '23514';
    END IF;

    SELECT COALESCE(draft.vfs_files, '{}'::jsonb)
    INTO v_base_vfs
    FROM public.builder_drafts AS draft
    WHERE draft.id = p_draft_id
      AND draft.project_id = p_project_id
      AND draft.business_id = p_business_id
      AND draft.user_id = auth.uid()
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Canonical draft identity is unavailable or unauthorized'
        USING ERRCODE = '42501';
    END IF;

    SELECT COALESCE(array_agg(item.value #>> '{}'), ARRAY[]::text[])
    INTO v_deleted_paths
    FROM jsonb_array_elements(v_delta->'deletedPaths') AS item(value);

    v_runtime_vfs := (v_base_vfs - v_deleted_paths) || (v_delta->'files');
    p_vfs_files := v_runtime_vfs;
  END IF;

  IF jsonb_typeof(p_vfs_files) <> 'object' THEN
    RAISE EXCEPTION 'Canonical VFS must be an object'
      USING ERRCODE = '23514';
  END IF;

  SELECT COALESCE(jsonb_object_agg(entry.key, entry.value), '{}'::jsonb)
  INTO v_runtime_vfs
  FROM jsonb_each(p_vfs_files) AS entry
  WHERE entry.key NOT LIKE '/.unison/%'
    AND entry.key NOT LIKE '.unison/%';

  p_site_bundle_snapshot := COALESCE(p_site_bundle_snapshot, '{}'::jsonb)
    || jsonb_build_object('vfsFiles', v_runtime_vfs);

  RETURN public.commit_canonical_site_revision_v2_full(
    p_project_id,
    p_business_id,
    p_draft_id,
    p_parent_revision_id,
    p_source,
    p_status,
    p_patch_json,
    p_vfs_files,
    p_site_bundle_snapshot,
    p_runtime_manifest,
    p_playground_state,
    p_readiness_report,
    p_diagnostics,
    p_publish_ready,
    p_publish_blockers,
    p_backend_ops_applied,
    p_vfs_hash,
    p_active_page_path
  );
END;
$$;

ALTER FUNCTION public.commit_canonical_site_revision_v2(
  uuid, uuid, uuid, uuid, text, text,
  jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb,
  boolean, jsonb, jsonb, text, text
) SECURITY DEFINER
  SET search_path = public, pg_temp
  SET statement_timeout = '45s';

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
