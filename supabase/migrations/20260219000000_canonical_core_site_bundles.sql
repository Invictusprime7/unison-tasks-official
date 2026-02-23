-- =============================================================================
-- CANONICAL CORE: Site Bundles as Single Source of Truth
-- This migration establishes SiteBundle as THE canonical data structure
-- All builds output SiteBundle, all previews consume SiteBundle, all publishes use SiteBundle
-- =============================================================================

-- ============================================================================
-- SITES: Core site records
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Identity
  name TEXT NOT NULL,
  slug TEXT,
  domain TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'building', 'preview', 'published', 'archived')),
  
  -- Current versions
  current_build_id UUID,
  published_build_id UUID,
  
  -- Settings
  settings JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sites_business ON public.sites(business_id);
CREATE INDEX IF NOT EXISTS idx_sites_owner ON public.sites(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_sites_slug ON public.sites(slug);
CREATE INDEX IF NOT EXISTS idx_sites_domain ON public.sites(domain);
CREATE UNIQUE INDEX IF NOT EXISTS idx_sites_domain_unique ON public.sites(domain) WHERE domain IS NOT NULL;

-- ============================================================================
-- SITE_BUILDS: Build records (each build produces a SiteBundle)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.site_builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  
  -- Build metadata
  mode TEXT NOT NULL DEFAULT 'full' CHECK (mode IN ('full', 'incremental', 'preview')),
  version INTEGER NOT NULL DEFAULT 1,
  
  -- Build status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  current_stage TEXT,
  
  -- Metrics
  started_at TIMESTAMPTZ DEFAULT now(),
  finished_at TIMESTAMPTZ,
  duration_ms INTEGER,
  warnings_count INTEGER DEFAULT 0,
  errors_count INTEGER DEFAULT 0,
  
  -- Build context (prompt, industry, constraints)
  context JSONB DEFAULT '{}'::jsonb,
  
  -- Error details if failed
  error_message TEXT,
  error_stage TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_site_builds_site ON public.site_builds(site_id);
CREATE INDEX IF NOT EXISTS idx_site_builds_status ON public.site_builds(status);

-- ============================================================================
-- SITE_BUNDLES: The canonical SiteBundle storage
-- This is THE single source of truth for all site data
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.site_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  build_id UUID NOT NULL REFERENCES public.site_builds(id) ON DELETE CASCADE,
  
  -- Version tracking
  version TEXT NOT NULL DEFAULT '1.0.0',
  schema_version INTEGER NOT NULL DEFAULT 1,
  
  -- The complete SiteBundle JSON
  -- This contains: manifest, pages, intents, automations, entitlements, brand, assets
  bundle JSONB NOT NULL,
  
  -- Quick access fields (denormalized from bundle for queries)
  page_count INTEGER,
  intent_count INTEGER,
  
  -- Checksum for integrity verification
  checksum TEXT,
  
  -- Compression (future: gzip bundle for large sites)
  compression TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_site_bundles_site ON public.site_bundles(site_id);
CREATE INDEX IF NOT EXISTS idx_site_bundles_build ON public.site_bundles(build_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_site_bundles_site_build ON public.site_bundles(site_id, build_id);

-- ============================================================================
-- INTENT_EVENTS: Audit log for all intent executions
-- Required for debugging, analytics, and enterprise compliance
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.intent_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Context
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  build_id UUID REFERENCES public.site_builds(id) ON DELETE SET NULL,
  
  -- Intent details
  intent_id TEXT NOT NULL,
  binding_id TEXT,
  page_id TEXT NOT NULL,
  
  -- Execution details
  ok BOOLEAN NOT NULL,
  duration_ms INTEGER,
  
  -- Request/Response (for debugging)
  params JSONB DEFAULT '{}'::jsonb,
  result JSONB DEFAULT '{}'::jsonb,
  error_code TEXT,
  error_message TEXT,
  
  -- Client actions returned
  client_actions JSONB DEFAULT '[]'::jsonb,
  
  -- Automation triggered
  automation_triggered BOOLEAN DEFAULT false,
  automation_run_id UUID,  -- References automation_runs (FK omitted for migration order)
  
  -- User context
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  
  -- Client info
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_intent_events_site ON public.intent_events(site_id);
CREATE INDEX IF NOT EXISTS idx_intent_events_business ON public.intent_events(business_id);
CREATE INDEX IF NOT EXISTS idx_intent_events_intent ON public.intent_events(intent_id);
CREATE INDEX IF NOT EXISTS idx_intent_events_created ON public.intent_events(created_at);
CREATE INDEX IF NOT EXISTS idx_intent_events_ok ON public.intent_events(ok) WHERE ok = false;

-- ============================================================================
-- PUBLISH_ARTIFACTS: Records of published site versions
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.publish_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  build_id UUID NOT NULL REFERENCES public.site_builds(id) ON DELETE CASCADE,
  bundle_id UUID NOT NULL REFERENCES public.site_bundles(id) ON DELETE CASCADE,
  
  -- Publish mode
  mode TEXT NOT NULL CHECK (mode IN ('preview', 'staging', 'production')),
  
  -- CDN/deployment details
  cdn_url TEXT,
  deploy_url TEXT,
  deploy_id TEXT,
  
  -- Version for rollback
  version_number INTEGER NOT NULL DEFAULT 1,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'deploying', 'deployed', 'failed', 'rolled_back')),
  
  -- Checksums
  html_checksum TEXT,
  assets_checksum TEXT,
  
  -- Timestamps
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_publish_artifacts_site ON public.publish_artifacts(site_id);
CREATE INDEX IF NOT EXISTS idx_publish_artifacts_mode ON public.publish_artifacts(mode);
CREATE UNIQUE INDEX IF NOT EXISTS idx_publish_artifacts_current 
  ON public.publish_artifacts(site_id, mode) 
  WHERE status = 'deployed';

-- ============================================================================
-- USAGE_EVENTS: Server-side usage metering
-- Foundation for plan enforcement and billing
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  
  -- Usage type
  event_type TEXT NOT NULL CHECK (event_type IN (
    'site_created',
    'site_published', 
    'build_completed',
    'intent_executed',
    'workflow_run',
    'ai_generation',
    'storage_upload'
  )),
  
  -- Resource reference
  resource_type TEXT, -- 'site', 'build', 'intent', 'workflow'
  resource_id UUID,
  
  -- Quantity (for billable units)
  quantity INTEGER DEFAULT 1,
  
  -- Context
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Billing period (for aggregation)
  billing_period TEXT, -- '2026-02' format
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_usage_events_business ON public.usage_events(business_id);
CREATE INDEX IF NOT EXISTS idx_usage_events_type ON public.usage_events(event_type);
CREATE INDEX IF NOT EXISTS idx_usage_events_period ON public.usage_events(business_id, billing_period);

-- ============================================================================
-- USAGE_SUMMARY: Aggregated usage for quick lookups
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.usage_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  billing_period TEXT NOT NULL, -- '2026-02'
  
  -- Counts
  sites_count INTEGER DEFAULT 0,
  builds_count INTEGER DEFAULT 0,
  intent_executions INTEGER DEFAULT 0,
  workflow_runs INTEGER DEFAULT 0,
  ai_generations INTEGER DEFAULT 0,
  storage_bytes BIGINT DEFAULT 0,
  
  -- Limits (cached from subscription)
  sites_limit INTEGER,
  builds_limit INTEGER,
  intent_limit INTEGER,
  workflow_limit INTEGER,
  storage_limit_bytes BIGINT,
  
  -- Timestamps
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(business_id, billing_period)
);

CREATE INDEX IF NOT EXISTS idx_usage_summary_business ON public.usage_summary(business_id);

-- ============================================================================
-- RLS POLICIES: Proper multi-tenant isolation
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intent_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publish_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_summary ENABLE ROW LEVEL SECURITY;

-- Sites: Users can only access sites for their business
CREATE POLICY "sites_business_isolation" ON public.sites
  FOR ALL
  USING (
    business_id IN (
      SELECT b.id FROM public.businesses b 
      WHERE b.owner_id = auth.uid()
    )
  );

-- Site Builds: Same business isolation through site
CREATE POLICY "site_builds_business_isolation" ON public.site_builds
  FOR ALL
  USING (
    site_id IN (
      SELECT s.id FROM public.sites s
      WHERE s.business_id IN (
        SELECT b.id FROM public.businesses b 
        WHERE b.owner_id = auth.uid()
      )
    )
  );

-- Site Bundles: Same pattern
CREATE POLICY "site_bundles_business_isolation" ON public.site_bundles
  FOR ALL
  USING (
    site_id IN (
      SELECT s.id FROM public.sites s
      WHERE s.business_id IN (
        SELECT b.id FROM public.businesses b 
        WHERE b.owner_id = auth.uid()
      )
    )
  );

-- Intent Events: Business isolation
CREATE POLICY "intent_events_business_isolation" ON public.intent_events
  FOR ALL
  USING (
    business_id IN (
      SELECT b.id FROM public.businesses b 
      WHERE b.owner_id = auth.uid()
    )
  );

-- Publish Artifacts: Business isolation through site
CREATE POLICY "publish_artifacts_business_isolation" ON public.publish_artifacts
  FOR ALL
  USING (
    site_id IN (
      SELECT s.id FROM public.sites s
      WHERE s.business_id IN (
        SELECT b.id FROM public.businesses b 
        WHERE b.owner_id = auth.uid()
      )
    )
  );

-- Usage Events: Business isolation
CREATE POLICY "usage_events_business_isolation" ON public.usage_events
  FOR ALL
  USING (
    business_id IN (
      SELECT b.id FROM public.businesses b 
      WHERE b.owner_id = auth.uid()
    )
  );

-- Usage Summary: Business isolation
CREATE POLICY "usage_summary_business_isolation" ON public.usage_summary
  FOR ALL
  USING (
    business_id IN (
      SELECT b.id FROM public.businesses b 
      WHERE b.owner_id = auth.uid()
    )
  );

-- ============================================================================
-- SERVICE ROLE POLICIES: Allow edge functions to access all data
-- ============================================================================

CREATE POLICY "service_role_sites_full_access" ON public.sites
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_site_builds_full_access" ON public.site_builds
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_site_bundles_full_access" ON public.site_bundles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_intent_events_full_access" ON public.intent_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_publish_artifacts_full_access" ON public.publish_artifacts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_usage_events_full_access" ON public.usage_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_usage_summary_full_access" ON public.usage_summary
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- FUNCTIONS: Usage metering helpers
-- ============================================================================

-- Function to record usage event
CREATE OR REPLACE FUNCTION public.record_usage_event(
  p_business_id UUID,
  p_event_type TEXT,
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_quantity INTEGER DEFAULT 1,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
  v_billing_period TEXT;
BEGIN
  -- Calculate current billing period
  v_billing_period := to_char(now(), 'YYYY-MM');
  
  -- Insert usage event
  INSERT INTO public.usage_events (
    business_id, event_type, resource_type, resource_id, 
    quantity, metadata, billing_period
  ) VALUES (
    p_business_id, p_event_type, p_resource_type, p_resource_id,
    p_quantity, p_metadata, v_billing_period
  ) RETURNING id INTO v_event_id;
  
  -- Update summary (upsert)
  INSERT INTO public.usage_summary (business_id, billing_period)
  VALUES (p_business_id, v_billing_period)
  ON CONFLICT (business_id, billing_period) DO UPDATE SET
    updated_at = now();
  
  -- Update specific counter based on event type
  CASE p_event_type
    WHEN 'site_created' THEN
      UPDATE public.usage_summary SET sites_count = sites_count + p_quantity
      WHERE business_id = p_business_id AND billing_period = v_billing_period;
    WHEN 'build_completed' THEN
      UPDATE public.usage_summary SET builds_count = builds_count + p_quantity
      WHERE business_id = p_business_id AND billing_period = v_billing_period;
    WHEN 'intent_executed' THEN
      UPDATE public.usage_summary SET intent_executions = intent_executions + p_quantity
      WHERE business_id = p_business_id AND billing_period = v_billing_period;
    WHEN 'workflow_run' THEN
      UPDATE public.usage_summary SET workflow_runs = workflow_runs + p_quantity
      WHERE business_id = p_business_id AND billing_period = v_billing_period;
    WHEN 'ai_generation' THEN
      UPDATE public.usage_summary SET ai_generations = ai_generations + p_quantity
      WHERE business_id = p_business_id AND billing_period = v_billing_period;
    ELSE
      NULL;
  END CASE;
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check usage limit
CREATE OR REPLACE FUNCTION public.check_usage_limit(
  p_business_id UUID,
  p_event_type TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_billing_period TEXT;
  v_summary RECORD;
BEGIN
  v_billing_period := to_char(now(), 'YYYY-MM');
  
  SELECT * INTO v_summary
  FROM public.usage_summary
  WHERE business_id = p_business_id AND billing_period = v_billing_period;
  
  IF NOT FOUND THEN
    RETURN true; -- No usage yet, allow
  END IF;
  
  -- Check limits based on event type
  CASE p_event_type
    WHEN 'site_created' THEN
      RETURN v_summary.sites_limit IS NULL OR v_summary.sites_count < v_summary.sites_limit;
    WHEN 'build_completed' THEN
      RETURN v_summary.builds_limit IS NULL OR v_summary.builds_count < v_summary.builds_limit;
    WHEN 'intent_executed' THEN
      RETURN v_summary.intent_limit IS NULL OR v_summary.intent_executions < v_summary.intent_limit;
    WHEN 'workflow_run' THEN
      RETURN v_summary.workflow_limit IS NULL OR v_summary.workflow_runs < v_summary.workflow_limit;
    ELSE
      RETURN true;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- UPDATE TRIGGER for sites.updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_sites_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sites_updated_at_trigger
  BEFORE UPDATE ON public.sites
  FOR EACH ROW
  EXECUTE FUNCTION public.update_sites_updated_at();

-- ============================================================================
-- Add foreign key for current_build_id after site_builds exists
-- ============================================================================

ALTER TABLE public.sites 
  ADD CONSTRAINT fk_sites_current_build 
  FOREIGN KEY (current_build_id) REFERENCES public.site_builds(id) ON DELETE SET NULL;

ALTER TABLE public.sites 
  ADD CONSTRAINT fk_sites_published_build 
  FOREIGN KEY (published_build_id) REFERENCES public.site_builds(id) ON DELETE SET NULL;
