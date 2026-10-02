-- Stop the projects <-> builder_drafts name-sync triggers from re-entering each other.
-- A draft save updated projects.name from a BEFORE trigger, whose AFTER trigger
-- then updated the same (still in-flight) draft row -> SQLSTATE 27000.

CREATE OR REPLACE FUNCTION public.sync_project_to_drafts()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Fired from inside another trigger (a draft write syncing its name up):
  -- the draft already carries the name, never write back into it.
  IF pg_trigger_depth() > 1 THEN
    RETURN NEW;
  END IF;
  IF NEW.name IS DISTINCT FROM OLD.name THEN
    UPDATE public.builder_drafts
       SET name = NEW.name,
           metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{projectName}', to_jsonb(NEW.name), true)
     WHERE project_id = NEW.id
       AND (name IS DISTINCT FROM NEW.name
            OR metadata->>'projectName' IS DISTINCT FROM NEW.name);
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sync_draft_to_project()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  resolved_name text;
  resolved_project uuid;
BEGIN
  resolved_name := COALESCE(
    NULLIF(NEW.name, ''),
    NULLIF(NEW.metadata->>'projectName', ''),
    NULLIF(NEW.metadata->>'name', ''),
    'Untitled project'
  );

  IF NEW.project_id IS NULL THEN
    INSERT INTO public.projects (name, owner_id, business_id, status, publish_status, settings, template_type)
    VALUES (resolved_name, NEW.user_id, NEW.business_id, 'draft', 'draft', '{}'::jsonb, NULLIF(NEW.template_id, ''))
    RETURNING id INTO resolved_project;
    NEW.project_id := resolved_project;
    NEW.name := resolved_name;
  ELSE
    NEW.name := resolved_name;
    -- Fired from the project's own name sync: the project already has the name.
    IF pg_trigger_depth() > 1 THEN
      RETURN NEW;
    END IF;
    UPDATE public.projects
       SET name        = resolved_name,
           business_id = COALESCE(NEW.business_id, business_id),
           updated_at  = now()
     WHERE id = NEW.project_id
       AND (name IS DISTINCT FROM resolved_name
            OR (NEW.business_id IS NOT NULL AND business_id IS DISTINCT FROM NEW.business_id));
  END IF;

  RETURN NEW;
END;
$function$;