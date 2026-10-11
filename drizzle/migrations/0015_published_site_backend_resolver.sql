-- Phase 7 (Published Site Runtime): public-safe backend resolution for published sites.
-- Returns only public identity (mode, url, publishable key) and only for sites
-- whose project is actually published. Secrets never leave the server.
CREATE OR REPLACE FUNCTION public.resolve_published_site_backend(p_project_id uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE b public.connected_supabase_projects%ROWTYPE; v_site uuid; v_published boolean;
BEGIN
  SELECT site_id, (publish_status = 'published' AND active_published_revision_id IS NOT NULL)
    INTO v_site, v_published
    FROM public.projects WHERE id = p_project_id;
  IF NOT FOUND OR NOT v_published THEN
    RAISE EXCEPTION 'Site is not published' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO b FROM public.connected_supabase_projects
   WHERE unison_project_id = p_project_id AND provisioning_status = 'ready' LIMIT 1;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('projectId', p_project_id, 'siteId', v_site,
      'mode', 'shared-legacy', 'provider', 'supabase', 'status', 'ready');
  END IF;
  RETURN jsonb_build_object('projectId', b.unison_project_id, 'siteId', b.site_id,
    'mode', 'dedicated', 'provider', b.provider, 'status', 'ready',
    'projectUrl', b.project_url, 'publishableKey', b.publishable_key);
END $$;
GRANT EXECUTE ON FUNCTION public.resolve_published_site_backend(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.resolve_published_site_backend(uuid) TO authenticated;