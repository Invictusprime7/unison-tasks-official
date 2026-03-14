CREATE TABLE public.page_graphs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL UNIQUE,
  business_id TEXT NOT NULL,
  pages JSONB NOT NULL DEFAULT '[]'::jsonb,
  nav_index JSONB NOT NULL DEFAULT '{}'::jsonb,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.page_graphs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to page_graphs" ON public.page_graphs
  FOR ALL USING (true) WITH CHECK (true);