DELETE FROM public.form_definitions a
USING public.form_definitions b
WHERE a.ctid < b.ctid
  AND a.business_id = b.business_id
  AND a.project_id = b.project_id
  AND a.site_id = b.site_id
  AND a.external_id = b.external_id;

CREATE UNIQUE INDEX IF NOT EXISTS form_definitions_scope_external_id_key
  ON public.form_definitions (business_id, project_id, site_id, external_id);