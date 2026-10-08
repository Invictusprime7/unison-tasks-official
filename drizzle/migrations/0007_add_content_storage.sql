CREATE TABLE IF NOT EXISTS public.content_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  api_key text NOT NULL,
  display_name text NOT NULL,
  description text,
  field_schema jsonb NOT NULL DEFAULT '{"fields":[]}'::jsonb,
  workflow jsonb NOT NULL DEFAULT '{"states":["draft","review","published","archived"]}'::jsonb,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (business_id, api_key),
  CHECK (api_key ~ '^[a-z][a-z0-9_]{1,62}$'),
  CHECK (jsonb_typeof(field_schema) = 'object'),
  CHECK (jsonb_typeof(workflow) = 'object')
);

CREATE TABLE IF NOT EXISTS public.content_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  content_type_id uuid NOT NULL REFERENCES public.content_types(id) ON DELETE RESTRICT,
  site_id uuid REFERENCES public.sites(id) ON DELETE SET NULL,
  locale text NOT NULL DEFAULT 'en',
  slug text,
  title text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','review','published','archived')),
  scheduled_publish_at timestamptz,
  published_at timestamptz,
  archived_at timestamptz,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (jsonb_typeof(data) = 'object'),
  CHECK (char_length(locale) BETWEEN 2 AND 35)
);
CREATE UNIQUE INDEX IF NOT EXISTS content_entries_business_type_locale_slug_idx ON public.content_entries (business_id, content_type_id, locale, slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS content_entries_business_status_updated_idx ON public.content_entries (business_id, status, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.content_entry_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid NOT NULL REFERENCES public.content_entries(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  revision_number integer NOT NULL CHECK (revision_number > 0),
  snapshot jsonb NOT NULL,
  change_summary text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entry_id, revision_number)
);

CREATE TABLE IF NOT EXISTS public.content_publish_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  entry_id uuid NOT NULL REFERENCES public.content_entries(id) ON DELETE CASCADE,
  revision_id uuid REFERENCES public.content_entry_revisions(id) ON DELETE SET NULL,
  event_type text NOT NULL CHECK (event_type IN ('submitted','approved','published','unpublished','archived','restored')),
  actor_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.content_types, public.content_entries, public.content_entry_revisions, public.content_publish_events TO service_role;
GRANT SELECT ON public.content_types, public.content_entries TO authenticated;

ALTER TABLE public.content_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_entry_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_publish_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members read content types" ON public.content_types FOR SELECT TO authenticated USING (public.is_business_member(business_id));
CREATE POLICY "Members read content entries" ON public.content_entries FOR SELECT TO authenticated USING (public.is_business_member(business_id));

CREATE OR REPLACE FUNCTION public.reject_content_revision_mutation() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN RAISE EXCEPTION 'Content revisions are immutable'; END; $$;
CREATE TRIGGER reject_content_revision_mutation BEFORE UPDATE OR DELETE ON public.content_entry_revisions FOR EACH ROW EXECUTE FUNCTION public.reject_content_revision_mutation();
CREATE TRIGGER set_content_types_updated_at BEFORE UPDATE ON public.content_types FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();
CREATE TRIGGER set_content_entries_updated_at BEFORE UPDATE ON public.content_entries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

CREATE OR REPLACE FUNCTION public.cms_apply_content_entry_command(
  p_action text, p_business_id uuid, p_actor_id uuid, p_entry_id uuid DEFAULT NULL, p_content_type_id uuid DEFAULT NULL,
  p_site_id uuid DEFAULT NULL, p_locale text DEFAULT 'en', p_slug text DEFAULT NULL, p_title text DEFAULT NULL,
  p_data jsonb DEFAULT '{}'::jsonb, p_target_status text DEFAULT NULL, p_change_summary text DEFAULT NULL
) RETURNS public.content_entries LANGUAGE plpgsql SET search_path = public AS $$
DECLARE entry_row public.content_entries%ROWTYPE; rev_id uuid; rev_no integer; ev text; prev text;
BEGIN
  IF p_actor_id IS NULL THEN RAISE EXCEPTION 'Content command requires an authenticated actor'; END IF;
  IF p_action NOT IN ('create','update','transition') THEN RAISE EXCEPTION 'Unsupported content command'; END IF;
  IF p_data IS NULL OR jsonb_typeof(p_data) <> 'object' THEN RAISE EXCEPTION 'Content data must be an object'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.content_types t WHERE t.business_id = p_business_id AND (p_content_type_id IS NULL OR t.id = p_content_type_id)) AND p_action = 'create' THEN
    RAISE EXCEPTION 'Content entry must use a content type from the same business'; END IF;
  IF p_action = 'create' THEN
    IF p_content_type_id IS NULL OR coalesce(btrim(p_title),'') = '' THEN RAISE EXCEPTION 'Content creation requires a type and title'; END IF;
    INSERT INTO public.content_entries (business_id, content_type_id, site_id, locale, slug, title, data, created_by, updated_by)
    VALUES (p_business_id, p_content_type_id, p_site_id, p_locale, p_slug, btrim(p_title), p_data, p_actor_id, p_actor_id) RETURNING * INTO entry_row;
  ELSE
    SELECT * INTO entry_row FROM public.content_entries WHERE id = p_entry_id AND business_id = p_business_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Content entry was not found in this business'; END IF;
    IF p_action = 'update' THEN
      IF coalesce(btrim(p_title),'') = '' THEN RAISE EXCEPTION 'Content update requires a title'; END IF;
      UPDATE public.content_entries SET site_id = p_site_id, locale = p_locale, slug = p_slug, title = btrim(p_title), data = p_data, updated_by = p_actor_id
      WHERE id = entry_row.id RETURNING * INTO entry_row;
    ELSE
      prev := entry_row.status;
      IF NOT ((prev='draft' AND p_target_status='review') OR (prev='review' AND p_target_status IN ('draft','published'))
        OR (prev='published' AND p_target_status IN ('draft','archived')) OR (prev='archived' AND p_target_status='draft')) THEN
        RAISE EXCEPTION 'Content workflow transition from % to % is not allowed', prev, p_target_status; END IF;
      ev := CASE p_target_status WHEN 'review' THEN 'submitted' WHEN 'published' THEN 'published' WHEN 'archived' THEN 'archived' ELSE 'unpublished' END;
      UPDATE public.content_entries SET status = p_target_status,
        published_at = CASE WHEN p_target_status='published' THEN now() ELSE published_at END,
        archived_at = CASE WHEN p_target_status='archived' THEN now() ELSE archived_at END, updated_by = p_actor_id
      WHERE id = entry_row.id RETURNING * INTO entry_row;
    END IF;
  END IF;
  SELECT coalesce(max(r.revision_number),0)+1 INTO rev_no FROM public.content_entry_revisions r WHERE r.entry_id = entry_row.id;
  INSERT INTO public.content_entry_revisions (entry_id, business_id, revision_number, snapshot, change_summary, created_by)
  VALUES (entry_row.id, p_business_id, rev_no, to_jsonb(entry_row), p_change_summary, p_actor_id) RETURNING id INTO rev_id;
  IF ev IS NOT NULL THEN
    INSERT INTO public.content_publish_events (business_id, entry_id, revision_id, event_type, actor_id, metadata)
    VALUES (p_business_id, entry_row.id, rev_id, ev, p_actor_id, jsonb_build_object('fromStatus', prev, 'toStatus', entry_row.status));
  END IF;
  RETURN entry_row;
END; $$;
REVOKE ALL ON FUNCTION public.cms_apply_content_entry_command(text,uuid,uuid,uuid,uuid,uuid,text,text,text,jsonb,text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cms_apply_content_entry_command(text,uuid,uuid,uuid,uuid,uuid,text,text,text,jsonb,text,text) TO service_role;