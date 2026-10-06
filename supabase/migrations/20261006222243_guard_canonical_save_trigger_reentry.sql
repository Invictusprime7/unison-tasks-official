-- Prevent project/draft trigger recursion during atomic canonical saves.
CREATE OR REPLACE FUNCTION public.sync_draft_to_project()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  resolved_name text;
  requested_project_id uuid;
  linked_business_id uuid;
BEGIN
  IF pg_trigger_depth() > 1 THEN RETURN NEW; END IF;
  resolved_name := COALESCE(
    NULLIF(BTRIM(NEW.name), ''),
    NULLIF(BTRIM(NEW.metadata->>'projectName'), ''),
    NULLIF(BTRIM(NEW.metadata->>'name'), ''),
    'Untitled project'
  );

  requested_project_id := NEW.project_id;
  IF requested_project_id IS NULL
     AND COALESCE(NEW.metadata->>'projectId', '') ~*
       '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' THEN
    requested_project_id := (NEW.metadata->>'projectId')::uuid;
  END IF;

  -- A client-supplied id is accepted only when it belongs to the same user.
  -- Stale or foreign metadata is ignored and receives a new owned project.
  IF requested_project_id IS NOT NULL THEN
    SELECT p.business_id
      INTO linked_business_id
      FROM public.projects p
     WHERE p.id = requested_project_id
       AND p.owner_id = NEW.user_id;

    IF FOUND THEN
      NEW.project_id := requested_project_id;
      NEW.business_id := COALESCE(NEW.business_id, linked_business_id);

      UPDATE public.projects
         SET name = resolved_name,
             business_id = COALESCE(NEW.business_id, business_id),
             updated_at = now()
       WHERE id = requested_project_id
         AND (name IS DISTINCT FROM resolved_name
           OR business_id IS DISTINCT FROM COALESCE(NEW.business_id, business_id));
    ELSE
      requested_project_id := NULL;
    END IF;
  END IF;

  IF requested_project_id IS NULL THEN
    INSERT INTO public.projects (
      name, description, owner_id, business_id, status, publish_status,
      settings, template_type
    )
    VALUES (
      resolved_name,
      NULLIF(NEW.metadata->>'description', ''),
      NEW.user_id,
      NEW.business_id,
      'draft',
      'draft',
      '{}'::jsonb,
      NEW.template_id::text
    )
    RETURNING id INTO NEW.project_id;
  END IF;

  NEW.name := resolved_name;
  NEW.metadata := jsonb_set(
    jsonb_set(COALESCE(NEW.metadata, '{}'::jsonb), '{projectId}', to_jsonb(NEW.project_id), true),
    '{projectName}',
    to_jsonb(resolved_name),
    true
  );
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_draft_to_project() FROM PUBLIC, anon, authenticated;


CREATE OR REPLACE FUNCTION public.sync_project_to_drafts()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public AS $$
BEGIN
  IF pg_trigger_depth() > 1 THEN RETURN NEW; END IF;
  IF NEW.name IS DISTINCT FROM OLD.name THEN
    UPDATE public.builder_drafts
       SET name = NEW.name,
           metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{projectName}', to_jsonb(NEW.name), true)
     WHERE project_id = NEW.id
       AND (name IS DISTINCT FROM NEW.name OR metadata->>'projectName' IS DISTINCT FROM NEW.name);
  END IF;
  RETURN NEW;
END;
$$;
CREATE OR REPLACE FUNCTION public.touch_project_on_draft_write()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public AS $$
BEGIN
  IF pg_trigger_depth() > 1 THEN RETURN NEW; END IF;
  IF NEW.project_id IS NOT NULL THEN
    UPDATE public.projects SET updated_at = now() WHERE id = NEW.project_id;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.sync_project_to_drafts() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.touch_project_on_draft_write() FROM PUBLIC, anon, authenticated;
