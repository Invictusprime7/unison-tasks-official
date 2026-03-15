
-- Setup wizard progress tracking per business
CREATE TABLE public.business_setup_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  step_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(business_id, step_id)
);

ALTER TABLE public.business_setup_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "setup_progress_select_member" ON public.business_setup_progress
  FOR SELECT TO authenticated
  USING (is_business_member(business_id));

CREATE POLICY "setup_progress_insert_member" ON public.business_setup_progress
  FOR INSERT TO authenticated
  WITH CHECK (is_business_member(business_id));

CREATE POLICY "setup_progress_update_member" ON public.business_setup_progress
  FOR UPDATE TO authenticated
  USING (is_business_member(business_id));

CREATE POLICY "setup_progress_delete_member" ON public.business_setup_progress
  FOR DELETE TO authenticated
  USING (is_business_member(business_id));

-- Auto-update timestamp
CREATE TRIGGER set_setup_progress_updated_at
  BEFORE UPDATE ON public.business_setup_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();
