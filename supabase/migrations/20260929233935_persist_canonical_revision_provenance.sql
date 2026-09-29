-- Supabase is the durable ledger for accepted source. Authorship, hashes and
-- operation identity are computed by the canonical application boundary, then
-- validated and stamped here inside the existing revision CAS transaction.
ALTER TABLE public.site_revisions
  ADD COLUMN IF NOT EXISTS candidate_id text,
  ADD COLUMN IF NOT EXISTS operation_ids text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS file_provenance jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.site_revisions
  DROP CONSTRAINT IF EXISTS site_revisions_file_provenance_object_chk;

ALTER TABLE public.site_revisions
  ADD CONSTRAINT site_revisions_file_provenance_object_chk
  CHECK (jsonb_typeof(file_provenance) = 'object');

CREATE INDEX IF NOT EXISTS site_revisions_candidate_id_idx
  ON public.site_revisions (candidate_id)
  WHERE candidate_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS site_revisions_operation_ids_idx
  ON public.site_revisions USING gin (operation_ids);

COMMENT ON COLUMN public.site_revisions.candidate_id IS
  'Ephemeral candidate identity accepted or rejected by this durable revision.';
COMMENT ON COLUMN public.site_revisions.operation_ids IS
  'Local mutation identities atomically acknowledged by this revision.';
COMMENT ON COLUMN public.site_revisions.file_provenance IS
  'Per-file authorship, ownership and content hashes supplied by the canonical acceptance boundary.';

CREATE OR REPLACE FUNCTION public.stamp_canonical_revision_provenance()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_metadata jsonb;
  v_operation_ids jsonb;
  v_operation_id_values text[];
  v_file_provenance jsonb;
  v_stamped_provenance jsonb;
BEGIN
  v_metadata := NEW.patch_json->'_commitMetadata';
  IF jsonb_typeof(v_metadata) IS DISTINCT FROM 'object' THEN
    RAISE EXCEPTION 'Canonical revision commit metadata is required'
      USING ERRCODE = '23514';
  END IF;

  v_operation_ids := v_metadata->'operationIds';
  IF jsonb_typeof(v_operation_ids) IS DISTINCT FROM 'array'
    OR jsonb_array_length(v_operation_ids) = 0
    OR EXISTS (
      SELECT 1
      FROM jsonb_array_elements(v_operation_ids) AS item(value)
      WHERE jsonb_typeof(item.value) <> 'string'
        OR BTRIM(item.value #>> '{}') = ''
    ) THEN
    RAISE EXCEPTION 'Canonical revision operation identities must be a non-empty string array'
      USING ERRCODE = '23514';
  END IF;

  SELECT array_agg(item.value #>> '{}' ORDER BY item.ordinality)
  INTO v_operation_id_values
  FROM jsonb_array_elements(v_operation_ids) WITH ORDINALITY AS item(value, ordinality);
  NEW.operation_ids := v_operation_id_values;

  IF cardinality(NEW.operation_ids) <> (
    SELECT count(DISTINCT operation_id)
    FROM unnest(NEW.operation_ids) AS operation_id
  ) THEN
    RAISE EXCEPTION 'Canonical revision operation identities must be unique'
      USING ERRCODE = '23514';
  END IF;

  IF NEW.patch_json->'operationIds' IS DISTINCT FROM v_operation_ids THEN
    RAISE EXCEPTION 'Canonical patch and ledger operation identities differ'
      USING ERRCODE = '23514';
  END IF;

  NEW.candidate_id := NULLIF(BTRIM(v_metadata->>'candidateId'), '');
  IF NEW.candidate_id IS DISTINCT FROM NULLIF(BTRIM(NEW.patch_json#>>'{candidate,id}'), '') THEN
    RAISE EXCEPTION 'Canonical patch and ledger candidate identities differ'
      USING ERRCODE = '23514';
  END IF;

  v_file_provenance := v_metadata->'fileProvenance';
  IF jsonb_typeof(v_file_provenance) IS DISTINCT FROM 'object' THEN
    RAISE EXCEPTION 'Canonical file provenance must be an object'
      USING ERRCODE = '23514';
  END IF;

  IF jsonb_typeof(NEW.vfs_files) IS DISTINCT FROM 'object'
    OR EXISTS (
      SELECT 1 FROM jsonb_each(NEW.vfs_files) AS file(path, contents)
      WHERE jsonb_typeof(file.contents) <> 'string'
    ) THEN
    RAISE EXCEPTION 'Canonical VFS must contain only source strings'
      USING ERRCODE = '23514';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_each(v_file_provenance) AS provenance(path, record)
    WHERE jsonb_typeof(provenance.record) <> 'object'
      OR provenance.record->>'path' IS DISTINCT FROM provenance.path
      OR COALESCE(provenance.record->>'ownership', '') NOT IN ('ai', 'user', 'compiler', 'system')
      OR jsonb_typeof(provenance.record->'lastOperationIds') IS DISTINCT FROM 'array'
  ) THEN
    RAISE EXCEPTION 'Canonical file provenance contains an invalid record'
      USING ERRCODE = '23514';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_object_keys(NEW.vfs_files) AS file(path)
    WHERE NOT (v_file_provenance ? file.path)
      OR NULLIF(v_file_provenance->file.path->>'currentHash', '') IS NULL
      OR COALESCE((v_file_provenance->file.path->>'deleted')::boolean, false)
  ) THEN
    RAISE EXCEPTION 'Every canonical VFS file requires live provenance and a content hash'
      USING ERRCODE = '23514';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_each(v_file_provenance) AS provenance(path, record)
    WHERE NOT (NEW.vfs_files ? provenance.path)
      AND (
        COALESCE((provenance.record->>'deleted')::boolean, false) IS NOT TRUE
        OR provenance.record->'currentHash' IS DISTINCT FROM 'null'::jsonb
      )
  ) THEN
    RAISE EXCEPTION 'Provenance outside the canonical VFS must be a deletion tombstone'
      USING ERRCODE = '23514';
  END IF;

  SELECT COALESCE(jsonb_object_agg(
    provenance.path,
    CASE
      WHEN provenance.record->>'authoredRevisionId' IS NULL
        THEN jsonb_set(provenance.record, '{authoredRevisionId}', to_jsonb(NEW.id::text), true)
      ELSE provenance.record
    END
  ), '{}'::jsonb)
  INTO v_stamped_provenance
  FROM jsonb_each(v_file_provenance) AS provenance(path, record);

  NEW.file_provenance := v_stamped_provenance;
  NEW.patch_json := NEW.patch_json - '_commitMetadata';
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS stamp_canonical_revision_provenance
  ON public.site_revisions;

CREATE TRIGGER stamp_canonical_revision_provenance
  BEFORE INSERT ON public.site_revisions
  FOR EACH ROW
  EXECUTE FUNCTION public.stamp_canonical_revision_provenance();

REVOKE ALL ON FUNCTION public.stamp_canonical_revision_provenance() FROM PUBLIC, anon, authenticated;

-- The authenticated client can commit only through the lock/CAS RPC. The
-- function already authenticates auth.uid(), membership and draft ownership;
-- SECURITY DEFINER supplies the table privilege after direct INSERT is removed.
REVOKE INSERT ON TABLE public.site_revisions FROM authenticated;

ALTER FUNCTION public.commit_canonical_site_revision(
  uuid, uuid, uuid, uuid, text, text,
  jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb,
  boolean, jsonb, jsonb, text, text
) SECURITY DEFINER;

NOTIFY pgrst, 'reload schema';
