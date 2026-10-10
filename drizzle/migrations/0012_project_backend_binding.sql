CREATE TABLE IF NOT EXISTS public.connected_supabase_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL,
  unison_project_id uuid NOT NULL,
  site_id uuid,
  provider text NOT NULL DEFAULT 'supabase',
  mode text NOT NULL DEFAULT 'unison-managed' CHECK (mode IN ('unison-managed','connected-supabase')),
  project_ref text,
  project_url text,
  publishable_key text,
  secret_key_ciphertext text,
  schema_version integer NOT NULL DEFAULT 1,
  provisioning_status text NOT NULL DEFAULT 'selected'
    CHECK (provisioning_status IN ('selected','creating','provisioning','migrating','ready','failed','disconnected')),
  backend_manifest jsonb NOT NULL DEFAULT '{}'::jsonb,
  health_status jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.connected_supabase_projects TO service_role;
ALTER TABLE public.connected_supabase_projects ENABLE ROW LEVEL SECURITY;
-- No browser policies: secrets never leave the server. Browser reads go through resolve_project_backend().

CREATE UNIQUE INDEX IF NOT EXISTS connected_supabase_projects_active_unison_project_idx
  ON public.connected_supabase_projects (unison_project_id) WHERE provisioning_status <> 'disconnected';
CREATE UNIQUE INDEX IF NOT EXISTS connected_supabase_projects_active_site_idx
  ON public.connected_supabase_projects (site_id) WHERE provisioning_status <> 'disconnected' AND site_id IS NOT NULL;

CREATE TRIGGER connected_supabase_projects_updated_at BEFORE UPDATE ON public.connected_supabase_projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

CREATE OR REPLACE FUNCTION public.resolve_project_backend(p_project_id uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE b public.connected_supabase_projects%ROWTYPE; v_site uuid;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_project_member(auth.uid(), p_project_id) THEN
    RAISE EXCEPTION 'Not a member of this project' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO b FROM public.connected_supabase_projects
   WHERE unison_project_id = p_project_id AND provisioning_status <> 'disconnected' LIMIT 1;
  IF NOT FOUND THEN
    SELECT site_id INTO v_site FROM public.projects WHERE id = p_project_id;
    RETURN jsonb_build_object('bindingId', 'shared-legacy:' || p_project_id, 'projectId', p_project_id,
      'siteId', v_site, 'mode', 'shared-legacy', 'provider', 'supabase', 'status', 'ready');
  END IF;
  RETURN jsonb_build_object('bindingId', b.id, 'projectId', b.unison_project_id, 'siteId', b.site_id,
    'mode', 'dedicated', 'provider', b.provider,
    'status', CASE WHEN b.provisioning_status = 'ready' THEN 'ready' WHEN b.provisioning_status = 'failed' THEN 'failed' ELSE 'provisioning' END,
    'projectUrl', b.project_url, 'publishableKey', b.publishable_key);
END $$;
GRANT EXECUTE ON FUNCTION public.resolve_project_backend(uuid) TO authenticated;