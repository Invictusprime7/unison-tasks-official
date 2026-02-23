-- Site Intent Bindings: Element-level automation binding
-- This table maps specific UI elements to workflows/recipes
-- Enables GoHighLevel-style "Business OS" intent orchestration

-- ============================================
-- SITE INTENT BINDINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.site_intent_bindings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL,
    page_path TEXT NOT NULL DEFAULT '/',
    element_key TEXT NOT NULL, -- CSS selector or element hash
    element_label TEXT, -- Human-readable label (button text, form name)
    intent TEXT NOT NULL, -- The bound intent (e.g., 'cart.add', 'booking.create')
    intent_confidence REAL DEFAULT 1.0, -- 1.0 = explicit, <1.0 = inferred
    workflow_id UUID REFERENCES public.crm_workflows(id) ON DELETE SET NULL,
    recipe_ids UUID[] DEFAULT '{}', -- Array of recipe IDs from installed packs
    enabled BOOLEAN DEFAULT true,
    payload_schema JSONB DEFAULT '{}', -- Expected payload keys
    last_triggered_at TIMESTAMPTZ,
    trigger_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint per element per page per project
    CONSTRAINT site_intent_bindings_unique UNIQUE (project_id, page_path, element_key)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_site_intent_bindings_project ON public.site_intent_bindings(project_id);
CREATE INDEX IF NOT EXISTS idx_site_intent_bindings_business ON public.site_intent_bindings(business_id);
CREATE INDEX IF NOT EXISTS idx_site_intent_bindings_intent ON public.site_intent_bindings(intent);
CREATE INDEX IF NOT EXISTS idx_site_intent_bindings_lookup ON public.site_intent_bindings(project_id, page_path, intent);

-- ============================================
-- INTENT EXECUTION LOG TABLE
-- ============================================
-- Tracks every intent execution for debugging and analytics
CREATE TABLE IF NOT EXISTS public.intent_execution_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID,
    binding_id UUID REFERENCES public.site_intent_bindings(id) ON DELETE SET NULL,
    intent TEXT NOT NULL,
    payload JSONB DEFAULT '{}',
    source TEXT DEFAULT 'preview', -- 'preview' | 'published' | 'test'
    source_url TEXT,
    result_status TEXT NOT NULL, -- 'success' | 'error' | 'skipped'
    result_data JSONB DEFAULT '{}',
    error_message TEXT,
    workflows_triggered UUID[] DEFAULT '{}',
    recipes_triggered UUID[] DEFAULT '{}',
    execution_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for log queries
CREATE INDEX IF NOT EXISTS idx_intent_execution_log_business ON public.intent_execution_log(business_id);
CREATE INDEX IF NOT EXISTS idx_intent_execution_log_project ON public.intent_execution_log(project_id);
CREATE INDEX IF NOT EXISTS idx_intent_execution_log_created ON public.intent_execution_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_intent_execution_log_intent ON public.intent_execution_log(intent);

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE public.site_intent_bindings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intent_execution_log ENABLE ROW LEVEL SECURITY;

-- Site intent bindings: users can manage their own
CREATE POLICY "site_intent_bindings_own_read" ON public.site_intent_bindings
    FOR SELECT USING (business_id = auth.uid());
    
CREATE POLICY "site_intent_bindings_own_insert" ON public.site_intent_bindings
    FOR INSERT WITH CHECK (business_id = auth.uid());
    
CREATE POLICY "site_intent_bindings_own_update" ON public.site_intent_bindings
    FOR UPDATE USING (business_id = auth.uid());
    
CREATE POLICY "site_intent_bindings_own_delete" ON public.site_intent_bindings
    FOR DELETE USING (business_id = auth.uid());

-- Service role can access all
CREATE POLICY "site_intent_bindings_service" ON public.site_intent_bindings
    FOR ALL USING (auth.role() = 'service_role');

-- Intent execution log: users can read their own
CREATE POLICY "intent_execution_log_own_read" ON public.intent_execution_log
    FOR SELECT USING (business_id = auth.uid());
    
-- Service role can insert/read all
CREATE POLICY "intent_execution_log_service" ON public.intent_execution_log
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- FUNCTIONS
-- ============================================

-- Update trigger count and last_triggered_at
CREATE OR REPLACE FUNCTION public.update_intent_binding_stats(
    p_binding_id UUID
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.site_intent_bindings
    SET 
        trigger_count = trigger_count + 1,
        last_triggered_at = NOW(),
        updated_at = NOW()
    WHERE id = p_binding_id;
END;
$$;

-- Get bindings for a project page with workflow/recipe details
CREATE OR REPLACE FUNCTION public.get_page_intent_bindings(
    p_project_id UUID,
    p_page_path TEXT DEFAULT '/'
) RETURNS TABLE (
    binding_id UUID,
    element_key TEXT,
    element_label TEXT,
    intent TEXT,
    intent_confidence REAL,
    workflow_id UUID,
    workflow_name TEXT,
    recipe_ids UUID[],
    enabled BOOLEAN,
    trigger_count INTEGER,
    last_triggered_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id AS binding_id,
        b.element_key,
        b.element_label,
        b.intent,
        b.intent_confidence,
        b.workflow_id,
        w.name AS workflow_name,
        b.recipe_ids,
        b.enabled,
        b.trigger_count,
        b.last_triggered_at
    FROM public.site_intent_bindings b
    LEFT JOIN public.crm_workflows w ON w.id = b.workflow_id
    WHERE b.project_id = p_project_id
      AND b.page_path = p_page_path
    ORDER BY b.element_label, b.element_key;
END;
$$;

-- ============================================
-- GRANTS
-- ============================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_intent_bindings TO authenticated;
GRANT SELECT ON public.intent_execution_log TO authenticated;
GRANT ALL ON public.site_intent_bindings TO service_role;
GRANT ALL ON public.intent_execution_log TO service_role;
GRANT EXECUTE ON FUNCTION public.update_intent_binding_stats(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_page_intent_bindings(UUID, TEXT) TO authenticated, service_role;
