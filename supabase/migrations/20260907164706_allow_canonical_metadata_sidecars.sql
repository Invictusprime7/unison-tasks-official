CREATE OR REPLACE FUNCTION public.commit_canonical_site_revision(
  p_site_id uuid,
  p_draft_id uuid,
  p_project_id uuid,
  p_vfs_files jsonb,
  p_site_bundle_snapshot jsonb,
  p_parent_revision_id uuid DEFAULT NULL::uuid,
  p_source text DEFAULT 'builder'::text,
  p_source_ref text DEFAULT NULL::text,
  p_change_summary text DEFAULT NULL::text,
  p_commit_metadata jsonb DEFAULT '{}'::jsonb,
  p_project_name text DEFAULT NULL::text,
  p_site_name text DEFAULT NULL::text,
  p_design_config jsonb DEFAULT NULL::jsonb,
  p_site_status text DEFAULT NULL::text,
  p_runtime_status text DEFAULT NULL::text,
  p_preview_url text DEFAULT NULL::text
)
RETURNS TABLE(revision_id uuid, revision_number integer, bundle_id uuid, build_id uuid, committed_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_revision_id uuid;
  v_revision_number integer;
  v_bundle_id uuid;
  v_build_id uuid;
  v_committed_at timestamptz := now();
  v_runtime_vfs jsonb;
  v_current_revision_id uuid;
  v_runtime_configuration jsonb;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  IF NOT public.can_access_project(p_project_id, ARRAY['owner', 'admin', 'editor']::text[]) THEN
    RAISE EXCEPTION 'Project mutation requires owner, admin, or editor access' USING ERRCODE = '42501';
  END IF;

  IF jsonb_typeof(p_vfs_files) IS DISTINCT FROM 'object' THEN
    RAISE EXCEPTION 'Canonical VFS must be a JSON object' USING ERRCODE = '23514';
  END IF;

  IF jsonb_typeof(p_site_bundle_snapshot) IS DISTINCT FROM 'object'
     OR jsonb_typeof(p_site_bundle_snapshot->'vfsFiles') IS DISTINCT FROM 'object' THEN
    RAISE EXCEPTION 'SiteBundleSnapshot.vfsFiles must be a JSON object' USING ERRCODE = '23514';
  END IF;

  SELECT COALESCE(jsonb_object_agg(entry.key, entry.value), '{}'::jsonb)
  INTO v_runtime_vfs
  FROM jsonb_each(p_vfs_files) AS entry
  WHERE entry.key NOT LIKE '/.unison/%'
    AND entry.key NOT LIKE '.unison/%';

  IF p_site_bundle_snapshot->'vfsFiles' IS DISTINCT FROM v_runtime_vfs THEN
    RAISE EXCEPTION
      'Canonical runtime VFS must exactly match SiteBundleSnapshot.vfsFiles'
      USING ERRCODE = '23514';
  END IF;

  PERFORM 1
  FROM public.projects
  WHERE id = p_project_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Canonical project not found: %', p_project_id USING ERRCODE = 'P0002';
  END IF;

  PERFORM 1
  FROM public.sites
  WHERE id = p_site_id
    AND project_id = p_project_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Canonical site/project mismatch' USING ERRCODE = '23514';
  END IF;

  SELECT last_revision_id
  INTO v_current_revision_id
  FROM public.builder_drafts
  WHERE id = p_draft_id
    AND project_id = p_project_id
    AND site_id = p_site_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Canonical draft/project/site mismatch' USING ERRCODE = '23514';
  END IF;

  IF v_current_revision_id IS DISTINCT FROM p_parent_revision_id THEN
    RAISE EXCEPTION 'Revision parent mismatch: expected %, received %',
      v_current_revision_id,
      p_parent_revision_id
      USING ERRCODE = '40001';
  END IF;

  SELECT COALESCE(MAX(sr.revision_number), 0) + 1
  INTO v_revision_number
  FROM public.site_revisions sr
  WHERE sr.site_id = p_site_id;

  INSERT INTO public.site_revisions (
    site_id,
    draft_id,
    project_id,
    parent_revision_id,
    revision_number,
    source,
    source_ref,
    change_summary,
    vfs_files,
    site_bundle_snapshot,
    metadata,
    created_by,
    created_at
  ) VALUES (
    p_site_id,
    p_draft_id,
    p_project_id,
    p_parent_revision_id,
    v_revision_number,
    p_source,
    p_source_ref,
    p_change_summary,
    p_vfs_files,
    p_site_bundle_snapshot,
    COALESCE(p_commit_metadata, '{}'::jsonb),
    v_user_id,
    v_committed_at
  )
  RETURNING id INTO v_revision_id;

  UPDATE public.builder_drafts
  SET
    vfs_files = p_vfs_files,
    last_revision_id = v_revision_id,
    revision = GREATEST(COALESCE(revision, 0) + 1, v_revision_number),
    updated_at = v_committed_at
  WHERE id = p_draft_id;

  INSERT INTO public.site_bundles (
    site_id,
    project_id,
    draft_id,
    revision_id,
    version,
    snapshot,
    status,
    metadata,
    created_by,
    created_at,
    updated_at
  ) VALUES (
    p_site_id,
    p_project_id,
    p_draft_id,
    v_revision_id,
    v_revision_number,
    p_site_bundle_snapshot,
    'ready',
    jsonb_build_object(
      'source', p_source,
      'source_ref', p_source_ref
    ),
    v_user_id,
    v_committed_at,
    v_committed_at
  )
  RETURNING id INTO v_bundle_id;

  SELECT runtime_configuration
  INTO v_runtime_configuration
  FROM public.site_builds
  WHERE project_id = p_project_id
    AND site_id = p_site_id
    AND draft_id = p_draft_id
  ORDER BY updated_at DESC
  LIMIT 1;

  INSERT INTO public.site_builds (
    project_id,
    site_id,
    draft_id,
    revision_id,
    site_bundle_id,
    status,
    runtime_status,
    runtime_configuration,
    preview_url,
    created_by,
    created_at,
    updated_at
  ) VALUES (
    p_project_id,
    p_site_id,
    p_draft_id,
    v_revision_id,
    v_bundle_id,
    COALESCE(NULLIF(p_site_status, ''), 'preview'),
    COALESCE(NULLIF(p_runtime_status, ''), 'ready'),
    COALESCE(v_runtime_configuration, '{}'::jsonb),
    p_preview_url,
    v_user_id,
    v_committed_at,
    v_committed_at
  )
  RETURNING id INTO v_build_id;

  UPDATE public.projects
  SET
    name = COALESCE(NULLIF(p_project_name, ''), name),
    current_revision_id = v_revision_id,
    current_bundle_id = v_bundle_id,
    current_build_id = v_build_id,
    updated_at = v_committed_at
  WHERE id = p_project_id;

  UPDATE public.sites
  SET
    name = COALESCE(NULLIF(p_site_name, ''), name),
    design_config = COALESCE(p_design_config, design_config),
    status = COALESCE(NULLIF(p_site_status, ''), status),
    last_revision_id = v_revision_id,
    current_bundle_id = v_bundle_id,
    current_build_id = v_build_id,
    updated_at = v_committed_at
  WHERE id = p_site_id;

  RETURN QUERY
  SELECT
    v_revision_id,
    v_revision_number,
    v_bundle_id,
    v_build_id,
    v_committed_at;
END;
$function$;;
