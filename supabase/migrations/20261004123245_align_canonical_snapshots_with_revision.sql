-- Canonical revision inserts stamp authorship metadata into the stored
-- snapshot. Project that exact snapshot into its draft and bundle rows before
-- their strict canonical-projection guards run.
CREATE OR REPLACE FUNCTION public.align_draft_snapshot_to_revision()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
DECLARE
	v_snapshot jsonb;
BEGIN
	IF NEW.last_revision_id IS NULL
		OR NOT (COALESCE(NEW.metadata, '{}'::jsonb) ? 'siteBundleSnapshot')
		OR (
			TG_OP = 'UPDATE'
			AND NEW.last_revision_id IS NOT DISTINCT FROM OLD.last_revision_id
		) THEN
		RETURN NEW;
	END IF;

	SELECT revision.site_bundle_snapshot
	INTO v_snapshot
	FROM public.site_revisions AS revision
	WHERE revision.id = NEW.last_revision_id
		AND revision.project_id = NEW.project_id
		AND revision.business_id = NEW.business_id
		AND revision.draft_id = NEW.id
		AND revision.status = 'committed';

	IF FOUND THEN
		NEW.metadata := NEW.metadata || pg_catalog.jsonb_build_object(
			'siteBundleSnapshot',
			v_snapshot
		);
	END IF;
	RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.align_draft_snapshot_to_revision() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS builder_drafts_align_revision_snapshot ON public.builder_drafts;
CREATE TRIGGER builder_drafts_align_revision_snapshot
	BEFORE INSERT OR UPDATE OF last_revision_id, metadata
	ON public.builder_drafts
	FOR EACH ROW
	EXECUTE FUNCTION public.align_draft_snapshot_to_revision();

CREATE OR REPLACE FUNCTION public.align_bundle_snapshot_to_revision()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
DECLARE
	v_snapshot jsonb;
BEGIN
	IF NEW.revision_id IS NULL
		OR (
			TG_OP = 'UPDATE'
			AND NEW.revision_id IS NOT DISTINCT FROM OLD.revision_id
		) THEN
		RETURN NEW;
	END IF;

	SELECT revision.site_bundle_snapshot
	INTO v_snapshot
	FROM public.site_revisions AS revision
	JOIN public.projects AS project
		ON project.id = revision.project_id
	WHERE revision.id = NEW.revision_id
		AND revision.status = 'committed'
		AND project.site_id = NEW.site_id;

	IF FOUND THEN
		NEW.bundle := v_snapshot;
	END IF;
	RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.align_bundle_snapshot_to_revision() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS site_bundles_align_revision_snapshot ON public.site_bundles;
CREATE TRIGGER site_bundles_align_revision_snapshot
	BEFORE INSERT OR UPDATE OF revision_id, bundle, site_id
	ON public.site_bundles
	FOR EACH ROW
	EXECUTE FUNCTION public.align_bundle_snapshot_to_revision();

-- The authorship migration also stamped historical revisions, so repair their
-- existing projections while the strict guards are temporarily removed.
DROP TRIGGER IF EXISTS builder_drafts_assert_canonical_projection ON public.builder_drafts;
DROP TRIGGER IF EXISTS site_bundles_assert_canonical_revision ON public.site_bundles;

UPDATE public.builder_drafts AS draft
SET metadata = draft.metadata || pg_catalog.jsonb_build_object(
	'siteBundleSnapshot',
	revision.site_bundle_snapshot
)
FROM public.site_revisions AS revision
WHERE draft.last_revision_id = revision.id
	AND draft.project_id = revision.project_id
	AND draft.business_id = revision.business_id
	AND draft.id = revision.draft_id
	AND revision.status = 'committed'
	AND draft.metadata ? 'siteBundleSnapshot'
	AND draft.metadata->'siteBundleSnapshot' IS DISTINCT FROM revision.site_bundle_snapshot;

UPDATE public.site_bundles AS bundle
SET bundle = revision.site_bundle_snapshot
FROM public.site_revisions AS revision,
	public.projects AS project
WHERE bundle.revision_id = revision.id
	AND revision.status = 'committed'
	AND project.id = revision.project_id
	AND project.site_id = bundle.site_id
	AND bundle.bundle IS DISTINCT FROM revision.site_bundle_snapshot;

CREATE TRIGGER builder_drafts_assert_canonical_projection
	BEFORE INSERT OR UPDATE OF last_revision_id, vfs_files, metadata, project_id, business_id
	ON public.builder_drafts
	FOR EACH ROW
	EXECUTE FUNCTION public.assert_canonical_draft_projection();

CREATE TRIGGER site_bundles_assert_canonical_revision
	BEFORE INSERT OR UPDATE OF revision_id, bundle, site_id
	ON public.site_bundles
	FOR EACH ROW
	EXECUTE FUNCTION public.assert_canonical_site_bundle();

NOTIFY pgrst, 'reload schema';