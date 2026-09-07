-- Reconcile production schema drift: migration 20260123201549 is recorded as
-- applied, but the public table is absent from the linked project.
CREATE TABLE IF NOT EXISTS public.business_design_preferences (
  business_id UUID PRIMARY KEY,
  template_category TEXT NULL,
  design_preset TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.business_design_preferences ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.business_design_preferences FROM anon;
GRANT SELECT, INSERT, UPDATE ON TABLE public.business_design_preferences TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.business_design_preferences TO service_role;

DROP POLICY IF EXISTS "business_design_preferences_select_member" ON public.business_design_preferences;
DROP POLICY IF EXISTS "business_design_preferences_insert_member" ON public.business_design_preferences;
DROP POLICY IF EXISTS "business_design_preferences_update_member" ON public.business_design_preferences;

CREATE POLICY "business_design_preferences_select_member"
ON public.business_design_preferences
FOR SELECT
TO authenticated
USING (is_business_member(business_id));

CREATE POLICY "business_design_preferences_insert_member"
ON public.business_design_preferences
FOR INSERT
TO authenticated
WITH CHECK (is_business_member(business_id));

CREATE POLICY "business_design_preferences_update_member"
ON public.business_design_preferences
FOR UPDATE
TO authenticated
USING (is_business_member(business_id))
WITH CHECK (is_business_member(business_id));

CREATE INDEX IF NOT EXISTS idx_business_design_preferences_business_id
ON public.business_design_preferences (business_id);
