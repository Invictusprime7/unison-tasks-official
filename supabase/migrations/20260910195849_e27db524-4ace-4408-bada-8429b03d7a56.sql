CREATE OR REPLACE FUNCTION public.commit_canonical_site_revision(
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
SET search_path = public
AS $$
DECLARE
	v_user_id uuid := auth.uid();
	v_revision_id uuid;
	v_current_revision_id uuid;
	v_site_id uuid;
	v_build_id uuid;
	v_bundle_id uuid;
	v_metadata jsonb;
	v_active_page_path text;
	v_runtime_vfs jsonb;
BEGIN
	IF v_user_id IS NULL THEN
		RAISE EXCEPTION 'Authentication is required to commit a canonical revision'
			USING ERRCODE = '42501';
	END IF;

	SELECT
		draft.last_revision_id,
		draft.site_id,
		draft.metadata,
		CASE
			WHEN COALESCE(draft.metadata->>'siteBuildId', '') ~*
				'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
			THEN (draft.metadata->>'siteBuildId')::uuid
			ELSE NULL
		END,
		CASE
			WHEN COALESCE(draft.metadata->>'siteBundleId', '') ~*
				'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
			THEN (draft.metadata->>'siteBundleId')::uuid
			ELSE NULL
		END
	INTO
		v_current_revision_id,
		v_site_id,
		v_metadata,
		v_build_id,
		v_bundle_id
	FROM public.builder_drafts AS draft
	WHERE draft.id = p_draft_id
		AND draft.project_id = p_project_id
		AND draft.business_id = p_business_id
		AND draft.user_id = v_user_id
	FOR UPDATE;

	IF NOT FOUND THEN
		RAISE EXCEPTION 'Canonical draft identity is unavailable or unauthorized'
			USING ERRCODE = '42501';
	END IF;

	IF NOT EXISTS (
		SELECT 1
		FROM public.projects AS project
		WHERE project.id = p_project_id
			AND project.business_id = p_business_id
			AND public.is_project_member(v_user_id, project.id)
	) THEN
		RAISE EXCEPTION 'Canonical project identity is unavailable or unauthorized'
			USING ERRCODE = '42501';
	END IF;

	IF p_status = 'committed' AND v_current_revision_id IS DISTINCT FROM p_parent_revision_id THEN
		RAISE EXCEPTION 'Canonical revision conflict: draft pointer changed before commit'
			USING ERRCODE = '40001';
	END IF;

	IF p_status = 'committed' THEN
		IF jsonb_typeof(p_vfs_files) <> 'object'
			OR jsonb_typeof(p_site_bundle_snapshot->'vfsFiles') <> 'object' THEN
			RAISE EXCEPTION 'Canonical VFS and SiteBundleSnapshot.vfsFiles must be objects'
				USING ERRCODE = '23514';
		END IF;

		SELECT COALESCE(jsonb_object_agg(entry.key, entry.value), '{}'::jsonb)
		INTO v_runtime_vfs
		FROM jsonb_each(p_vfs_files) AS entry
		WHERE entry.key NOT LIKE '/.unison/%'
			AND entry.key NOT LIKE '.unison/%';

		IF p_site_bundle_snapshot->'vfsFiles' IS DISTINCT FROM v_runtime_vfs THEN
			RAISE EXCEPTION 'Canonical runtime VFS must exactly match SiteBundleSnapshot.vfsFiles'
				USING ERRCODE = '23514';
		END IF;

		IF COALESCE(p_site_bundle_snapshot->>'snapshotId', '') = '' THEN
			RAISE EXCEPTION 'Canonical SiteBundleSnapshot is missing snapshotId'
				USING ERRCODE = '23514';
		END IF;
	END IF;

	v_active_page_path := COALESCE(
		NULLIF(BTRIM(p_active_page_path), ''),
		NULLIF(BTRIM(v_metadata->>'activePagePath'), '')
	);
	IF p_status = 'committed' AND (
		v_active_page_path IS NULL OR NOT (p_vfs_files ? v_active_page_path)
	) THEN
		RAISE EXCEPTION 'Canonical active page is missing from SiteBundleSnapshot.vfsFiles'
			USING ERRCODE = '23514';
	END IF;

	INSERT INTO public.site_revisions (
		project_id,
		business_id,
		draft_id,
		parent_revision_id,
		source,
		status,
		patch_json,
		vfs_files,
		site_bundle_snapshot,
		runtime_manifest,
		playground_state,
		readiness_report,
		diagnostics,
		publish_ready,
		publish_blockers,
		backend_ops_applied,
		vfs_hash,
		created_by
	) VALUES (
		p_project_id,
		p_business_id,
		p_draft_id,
		p_parent_revision_id,
		p_source,
		p_status,
		COALESCE(p_patch_json, '{}'::jsonb),
		p_vfs_files,
		COALESCE(p_site_bundle_snapshot, '{}'::jsonb),
		COALESCE(p_runtime_manifest, '{}'::jsonb),
		COALESCE(p_playground_state, '{}'::jsonb),
		COALESCE(p_readiness_report, '{}'::jsonb),
		COALESCE(p_diagnostics, '[]'::jsonb),
		COALESCE(p_publish_ready, false),
		COALESCE(p_publish_blockers, '[]'::jsonb),
		COALESCE(p_backend_ops_applied, '[]'::jsonb),
		p_vfs_hash,
		v_user_id
	)
	RETURNING id INTO v_revision_id;

	IF p_status <> 'committed' THEN
		RETURN v_revision_id;
	END IF;

	UPDATE public.builder_drafts
	SET
		last_revision_id = v_revision_id,
		vfs_files = p_vfs_files,
		metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
			'activePagePath', v_active_page_path,
			'siteBundleSnapshot', p_site_bundle_snapshot,
			'runtimeManifest', COALESCE(p_runtime_manifest, '{}'::jsonb)
		),
		updated_at = now()
	WHERE id = p_draft_id;

	IF v_site_id IS NOT NULL AND v_build_id IS NOT NULL AND v_bundle_id IS NOT NULL THEN
		INSERT INTO public.site_bundles (
			id,
			site_id,
			build_id,
			revision_id,
			version,
			schema_version,
			bundle
		) VALUES (
			v_bundle_id,
			v_site_id,
			v_build_id,
			v_revision_id,
			'1.0.0',
			1,
			p_site_bundle_snapshot
		)
		ON CONFLICT (id) DO UPDATE
		SET
			build_id = EXCLUDED.build_id,
			revision_id = EXCLUDED.revision_id,
			bundle = EXCLUDED.bundle;

		UPDATE public.site_builds
		SET
			status = 'completed',
			current_stage = 'canonical-commit',
			finished_at = now()
		WHERE id = v_build_id
			AND site_id = v_site_id;

		UPDATE public.sites
		SET
			current_build_id = v_build_id,
			status = 'preview',
			updated_at = now()
		WHERE id = v_site_id
			AND business_id = p_business_id;

		UPDATE public.site_runtime_configs
		SET
			public_runtime_enabled = true,
			settings = COALESCE(settings, '{}'::jsonb) || jsonb_build_object(
				'projectId', p_project_id,
				'runtimeManifest', COALESCE(p_runtime_manifest, '{}'::jsonb)
			),
			updated_at = now()
		WHERE site_id = v_site_id;
	END IF;

	RETURN v_revision_id;
END;
$$;