CREATE UNIQUE INDEX IF NOT EXISTS content_types_project_api_key_idx
  ON public.content_types (business_id, COALESCE(project_id, '00000000-0000-0000-0000-000000000000'::uuid), api_key);
ALTER TABLE public.content_types DROP CONSTRAINT IF EXISTS content_types_business_id_api_key_key;
DROP INDEX IF EXISTS public.content_types_business_id_api_key_key;

CREATE UNIQUE INDEX IF NOT EXISTS content_entries_project_type_locale_slug_idx
  ON public.content_entries (business_id, COALESCE(project_id, '00000000-0000-0000-0000-000000000000'::uuid), content_type_id, locale, slug)
  WHERE slug IS NOT NULL;
DROP INDEX IF EXISTS public.content_entries_business_type_locale_slug_idx;

-- Content command stamps the entry's project onto new revisions/events.
CREATE OR REPLACE FUNCTION public.stamp_content_child_project()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF NEW.project_id IS NULL THEN
    SELECT e.project_id INTO NEW.project_id FROM public.content_entries e WHERE e.id = NEW.entry_id;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS stamp_content_revision_project ON public.content_entry_revisions;
CREATE TRIGGER stamp_content_revision_project BEFORE INSERT ON public.content_entry_revisions
  FOR EACH ROW EXECUTE FUNCTION public.stamp_content_child_project();
DROP TRIGGER IF EXISTS stamp_content_event_project ON public.content_publish_events;
CREATE TRIGGER stamp_content_event_project BEFORE INSERT ON public.content_publish_events
  FOR EACH ROW EXECUTE FUNCTION public.stamp_content_child_project();