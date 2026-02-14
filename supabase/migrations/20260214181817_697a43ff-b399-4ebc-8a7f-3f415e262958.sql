
-- Project-level SEO settings (global metadata for the site)
CREATE TABLE public.project_seo (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  business_id UUID NOT NULL,
  
  -- Global site meta
  site_title TEXT NOT NULL DEFAULT '',
  site_description TEXT NOT NULL DEFAULT '',
  site_keywords TEXT[] DEFAULT '{}',
  favicon_url TEXT,
  og_image_url TEXT,
  canonical_base_url TEXT,
  
  -- Social
  twitter_handle TEXT,
  facebook_app_id TEXT,
  
  -- Technical
  robots_txt TEXT DEFAULT 'User-agent: *\nAllow: /',
  generate_sitemap BOOLEAN DEFAULT true,
  
  -- JSON-LD defaults
  json_ld_type TEXT DEFAULT 'LocalBusiness',
  json_ld_data JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(project_id)
);

-- Per-page SEO overrides
CREATE TABLE public.project_page_seo (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  page_key TEXT NOT NULL,
  
  -- Page meta
  title TEXT,
  description TEXT,
  keywords TEXT[],
  og_title TEXT,
  og_description TEXT,
  og_image_url TEXT,
  canonical_url TEXT,
  no_index BOOLEAN DEFAULT false,
  
  -- JSON-LD for this page
  json_ld_type TEXT,
  json_ld_data JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(project_id, page_key)
);

-- Enable RLS
ALTER TABLE public.project_seo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_page_seo ENABLE ROW LEVEL SECURITY;

-- RLS: Users can manage SEO for their business projects
CREATE POLICY "project_seo_select_member"
  ON public.project_seo FOR SELECT
  USING (is_business_member(business_id));

CREATE POLICY "project_seo_insert_member"
  ON public.project_seo FOR INSERT
  WITH CHECK (is_business_member(business_id));

CREATE POLICY "project_seo_update_member"
  ON public.project_seo FOR UPDATE
  USING (is_business_member(business_id));

CREATE POLICY "project_seo_delete_member"
  ON public.project_seo FOR DELETE
  USING (is_business_member(business_id));

-- Page SEO: same business member check via project_seo parent
CREATE POLICY "project_page_seo_select"
  ON public.project_page_seo FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.project_seo ps 
    WHERE ps.project_id = project_page_seo.project_id 
    AND is_business_member(ps.business_id)
  ));

CREATE POLICY "project_page_seo_insert"
  ON public.project_page_seo FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.project_seo ps 
    WHERE ps.project_id = project_page_seo.project_id 
    AND is_business_member(ps.business_id)
  ));

CREATE POLICY "project_page_seo_update"
  ON public.project_page_seo FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.project_seo ps 
    WHERE ps.project_id = project_page_seo.project_id 
    AND is_business_member(ps.business_id)
  ));

CREATE POLICY "project_page_seo_delete"
  ON public.project_page_seo FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.project_seo ps 
    WHERE ps.project_id = project_page_seo.project_id 
    AND is_business_member(ps.business_id)
  ));

-- Timestamps trigger
CREATE TRIGGER update_project_seo_updated_at
  BEFORE UPDATE ON public.project_seo
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

CREATE TRIGGER update_project_page_seo_updated_at
  BEFORE UPDATE ON public.project_page_seo
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();
