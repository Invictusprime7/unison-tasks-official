-- Site-scoped users table for per-template authentication
-- Allows same email to register on multiple sites without conflict
-- Each template/site has its own isolated user base

CREATE TABLE IF NOT EXISTS site_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  metadata JSONB DEFAULT '{}',
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  -- Same email can exist on different sites (critical for isolation)
  UNIQUE(site_id, email)
);

-- Indexes for performance
CREATE INDEX idx_site_users_site_email ON site_users(site_id, email);
CREATE INDEX idx_site_users_business ON site_users(business_id);
CREATE INDEX idx_site_users_created ON site_users(created_at DESC);

-- Enable RLS
ALTER TABLE site_users ENABLE ROW LEVEL SECURITY;

-- Business owners can view/manage their site users
CREATE POLICY "Business owners can manage site users"
  ON site_users
  FOR ALL
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Service role has full access (for edge functions)
CREATE POLICY "Service role full access on site_users"
  ON site_users
  FOR ALL
  USING (auth.role() = 'service_role');

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_site_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER site_users_updated_at
  BEFORE UPDATE ON site_users
  FOR EACH ROW
  EXECUTE FUNCTION update_site_users_updated_at();

-- Add comment for documentation
COMMENT ON TABLE site_users IS 'Site-scoped users for per-template authentication. Allows email reuse across different sites.';
COMMENT ON COLUMN site_users.site_id IS 'References the project/site this user belongs to';
COMMENT ON COLUMN site_users.password_hash IS 'bcrypt hashed password';
