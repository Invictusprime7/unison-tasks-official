ALTER TABLE public.site_revisions
  ADD COLUMN IF NOT EXISTS authorship_phase text,
  ADD COLUMN IF NOT EXISTS creative_authority text,
  ADD COLUMN IF NOT EXISTS launch_revision_id uuid REFERENCES public.site_revisions(id) ON DELETE RESTRICT;

ALTER TABLE public.site_revisions
  DROP CONSTRAINT IF EXISTS site_revisions_authorship_phase_chk,
  DROP CONSTRAINT IF EXISTS site_revisions_creative_authority_chk;

ALTER TABLE public.site_revisions
  ADD CONSTRAINT site_revisions_authorship_phase_chk
    CHECK (authorship_phase IN ('wizard-launch', 'builder-authoring')),
  ADD CONSTRAINT site_revisions_creative_authority_chk
    CHECK (creative_authority IN ('wizard', 'builder'));

UPDATE public.site_revisions
SET authorship_phase = CASE WHEN status = 'committed' THEN 'builder-authoring' ELSE 'wizard-launch' END,
    creative_authority = CASE WHEN status = 'committed' THEN 'builder' ELSE 'wizard' END;

WITH RECURSIVE launch_lineage AS (
  SELECT revision.id AS revision_id, revision.id AS launch_revision_id
  FROM public.site_revisions AS revision
  WHERE revision.status = 'committed'
    AND revision.source = 'wizard-launch'

  UNION ALL

  SELECT child.id, launch_lineage.launch_revision_id
  FROM public.site_revisions AS child
  JOIN launch_lineage ON child.parent_revision_id = launch_lineage.revision_id
  WHERE child.status = 'committed'
    AND child.source <> 'wizard-launch'
)
UPDATE public.site_revisions AS revision
SET launch_revision_id = launch_lineage.launch_revision_id
FROM launch_lineage
WHERE revision.id = launch_lineage.revision_id;

UPDATE public.site_revisions AS revision
SET site_bundle_snapshot = COALESCE(revision.site_bundle_snapshot, '{}'::jsonb)
  || jsonb_build_object(
    'meta',
    COALESCE(revision.site_bundle_snapshot->'meta', '{}'::jsonb)
      || jsonb_build_object(
        'authorshipAuthority',
        jsonb_strip_nulls(jsonb_build_object(
          'phase', revision.authorship_phase,
          'creativeAuthority', revision.creative_authority,
          'commitAuthority', 'vfs-commit-service',
          'launchRevisionId', revision.launch_revision_id::text
        ))
      )
  );

ALTER TABLE public.site_revisions
  ALTER COLUMN authorship_phase SET NOT NULL,
  ALTER COLUMN creative_authority SET NOT NULL;

CREATE INDEX IF NOT EXISTS site_revisions_launch_revision_id_idx
  ON public.site_revisions (launch_revision_id)
  WHERE launch_revision_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.stamp_revision_authorship_authority()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_parent_launch_revision_id uuid;
  v_authority jsonb;
  v_meta jsonb;
BEGIN
  IF NEW.status <> 'committed' THEN
    NEW.authorship_phase := 'wizard-launch';
    NEW.creative_authority := 'wizard';
    NEW.launch_revision_id := NULL;
    RETURN NEW;
  END IF;

  IF NEW.source = 'wizard-launch' THEN
    NEW.authorship_phase := 'builder-authoring';
    NEW.creative_authority := 'builder';
    NEW.launch_revision_id := NEW.id;
  ELSE
    IF NEW.parent_revision_id IS NOT NULL THEN
      SELECT COALESCE(parent.launch_revision_id,
        CASE WHEN parent.source = 'wizard-launch' THEN parent.id ELSE NULL END)
      INTO v_parent_launch_revision_id
      FROM public.site_revisions AS parent
      WHERE parent.id = NEW.parent_revision_id;
    END IF;
    NEW.authorship_phase := 'builder-authoring';
    NEW.creative_authority := 'builder';
    NEW.launch_revision_id := v_parent_launch_revision_id;
  END IF;

  v_authority := jsonb_build_object(
    'phase', NEW.authorship_phase,
    'creativeAuthority', NEW.creative_authority,
    'commitAuthority', 'vfs-commit-service'
  );
  IF NEW.launch_revision_id IS NOT NULL THEN
    v_authority := v_authority || jsonb_build_object('launchRevisionId', NEW.launch_revision_id::text);
  END IF;
  v_meta := COALESCE(NEW.site_bundle_snapshot->'meta', '{}'::jsonb)
    || jsonb_build_object('authorshipAuthority', v_authority);
  NEW.site_bundle_snapshot := COALESCE(NEW.site_bundle_snapshot, '{}'::jsonb)
    || jsonb_build_object('meta', v_meta);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS stamp_revision_authorship_authority
  ON public.site_revisions;
CREATE TRIGGER stamp_revision_authorship_authority
  BEFORE INSERT ON public.site_revisions
  FOR EACH ROW
  EXECUTE FUNCTION public.stamp_revision_authorship_authority();

REVOKE ALL ON FUNCTION public.stamp_revision_authorship_authority() FROM PUBLIC, anon, authenticated;

COMMENT ON COLUMN public.site_revisions.authorship_phase IS
  'Creative-authority phase after this revision is accepted.';
COMMENT ON COLUMN public.site_revisions.creative_authority IS
  'Wizard before launch acceptance; Builder after the one-way handoff.';
COMMENT ON COLUMN public.site_revisions.launch_revision_id IS
  'Accepted launch revision that established Builder presentation authorship.';

NOTIFY pgrst, 'reload schema';
