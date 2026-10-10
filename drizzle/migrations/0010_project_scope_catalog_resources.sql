DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['products','services','menu_items','pricing_plans','featured_offers','testimonials','portfolio_projects','availability_slots','content_types','content_entries','content_entry_revisions','content_publish_events']
  LOOP
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS project_id uuid', t);
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I (business_id, project_id)', t || '_business_project_idx', t);
    IF t <> 'content_entry_revisions' THEN
      -- Backfill only where the business owns exactly one project (unambiguous).
      EXECUTE format($f$
        UPDATE public.%I r SET project_id = p.id
        FROM (SELECT business_id, (array_agg(id))[1] AS id FROM public.projects WHERE business_id IS NOT NULL GROUP BY business_id HAVING count(*) = 1) p
        WHERE r.project_id IS NULL AND r.business_id = p.business_id
      $f$, t);
    END IF;
  END LOOP;
END $$;

COMMENT ON COLUMN public.products.project_id IS 'Owning Unison project/site. NULL = legacy business-scoped row (transitional shared-legacy read only).';
COMMENT ON COLUMN public.content_entry_revisions.project_id IS 'Owning project; revisions are immutable so historical rows stay NULL.';