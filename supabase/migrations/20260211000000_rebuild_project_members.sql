-- ============================================================================
-- REBUILD project_members TABLE
-- Fixes infinite recursion in RLS policies by dropping and recreating table
-- with simple, non-recursive policies
-- ============================================================================

-- Step 1: Drop all existing policies on project_members
DROP POLICY IF EXISTS "Members can view fellow members" ON public.project_members;
DROP POLICY IF EXISTS "Users can view own membership" ON public.project_members;
DROP POLICY IF EXISTS "Owners can view project members" ON public.project_members;
DROP POLICY IF EXISTS "Owners can manage project members" ON public.project_members;
DROP POLICY IF EXISTS "Users can view project members" ON public.project_members;
DROP POLICY IF EXISTS "Users can view project members for accessible projects" ON public.project_members;
DROP POLICY IF EXISTS "Project owners and admins can manage members" ON public.project_members;
DROP POLICY IF EXISTS "project_members_select" ON public.project_members;
DROP POLICY IF EXISTS "project_members_insert" ON public.project_members;
DROP POLICY IF EXISTS "project_members_update" ON public.project_members;
DROP POLICY IF EXISTS "project_members_delete" ON public.project_members;

-- Step 2: Backup existing data
CREATE TEMP TABLE project_members_backup AS 
SELECT * FROM public.project_members;

-- Step 3: Drop the table
DROP TABLE IF EXISTS public.project_members CASCADE;

-- Step 4: Recreate the table with clean structure
CREATE TABLE public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Add foreign keys
ALTER TABLE public.project_members
  ADD CONSTRAINT project_members_project_id_fkey 
  FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

ALTER TABLE public.project_members
  ADD CONSTRAINT project_members_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Step 5: Restore data
INSERT INTO public.project_members (id, project_id, user_id, role, created_at)
SELECT id, project_id, user_id, role, created_at
FROM project_members_backup;

-- Step 6: Drop backup
DROP TABLE project_members_backup;

-- Step 7: Enable RLS
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- Step 8: Create indexes
CREATE INDEX idx_project_members_project ON public.project_members(project_id);
CREATE INDEX idx_project_members_user ON public.project_members(user_id);
CREATE INDEX idx_project_members_role ON public.project_members(role);

-- ============================================================================
-- SIMPLE NON-RECURSIVE RLS POLICIES
-- Key principle: NEVER query project_members within its own policies
-- ============================================================================

-- Policy 1: Users can always see their own memberships
-- Uses only: auth.uid() = user_id (no subquery)
CREATE POLICY "pm_select_own"
  ON public.project_members
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy 2: Project owners can see all members
-- Uses only: projects table (no project_members subquery)
CREATE POLICY "pm_select_owner"
  ON public.project_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_members.project_id
      AND p.owner_id = auth.uid()
    )
  );

-- Policy 3: Project owners can insert members
-- Uses only: projects table (no project_members subquery)
CREATE POLICY "pm_insert_owner"
  ON public.project_members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_members.project_id
      AND p.owner_id = auth.uid()
    )
  );

-- Policy 4: Project owners can update members
-- Uses only: projects table (no project_members subquery)
CREATE POLICY "pm_update_owner"
  ON public.project_members
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_members.project_id
      AND p.owner_id = auth.uid()
    )
  );

-- Policy 5: Project owners can delete members
-- Uses only: projects table (no project_members subquery)
CREATE POLICY "pm_delete_owner"
  ON public.project_members
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_members.project_id
      AND p.owner_id = auth.uid()
    )
  );

-- Policy 6: Users can leave projects (delete own membership)
CREATE POLICY "pm_delete_self"
  ON public.project_members
  FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- Grant permissions
-- ============================================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_members TO authenticated;
GRANT SELECT ON public.project_members TO anon;
