-- ============================================================================
-- COMPLETE RESET: profiles and project_members RLS policies
-- This migration drops ALL existing policies and creates clean, non-recursive ones
-- ============================================================================

-- ============================================================================
-- STEP 1: Drop ALL policies on profiles (any name that might exist)
-- ============================================================================
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
    END LOOP;
END $$;

-- ============================================================================
-- STEP 2: Drop ALL policies on project_members (any name that might exist)
-- ============================================================================
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'project_members' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.project_members', pol.policyname);
    END LOOP;
END $$;

-- ============================================================================
-- STEP 3: Drop ALL policies on projects (any name that might exist)
-- ============================================================================
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'projects' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.projects', pol.policyname);
    END LOOP;
END $$;

-- ============================================================================
-- STEP 4: Ensure SECURITY DEFINER functions exist
-- ============================================================================
CREATE OR REPLACE FUNCTION public.check_project_membership(p_project_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM project_members
    WHERE project_id = p_project_id
    AND user_id = p_user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.check_project_ownership(p_project_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM projects
    WHERE id = p_project_id
    AND owner_id = p_user_id
  );
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.check_project_membership(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_project_membership(UUID, UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.check_project_ownership(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_project_ownership(UUID, UUID) TO anon;

-- ============================================================================
-- STEP 5: Create PROFILES policies (simple, no cross-table references)
-- ============================================================================

-- SELECT: Any authenticated user can view any profile (public info)
CREATE POLICY "profiles_read"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Users can only create their own profile
CREATE POLICY "profiles_create"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- UPDATE: Users can only update their own profile
CREATE POLICY "profiles_modify"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- DELETE: Users can only delete their own profile
CREATE POLICY "profiles_remove"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (id = auth.uid());

-- ============================================================================
-- STEP 6: Create PROJECT_MEMBERS policies (using SECURITY DEFINER functions)
-- ============================================================================

-- SELECT: Users can view their own memberships
CREATE POLICY "members_read_own"
  ON public.project_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- SELECT: Project owners can view all members
CREATE POLICY "members_read_by_owner"
  ON public.project_members
  FOR SELECT
  TO authenticated
  USING (public.check_project_ownership(project_id, auth.uid()));

-- INSERT: Only project owners can add members
CREATE POLICY "members_create"
  ON public.project_members
  FOR INSERT
  TO authenticated
  WITH CHECK (public.check_project_ownership(project_id, auth.uid()));

-- UPDATE: Only project owners can update members
CREATE POLICY "members_modify"
  ON public.project_members
  FOR UPDATE
  TO authenticated
  USING (public.check_project_ownership(project_id, auth.uid()));

-- DELETE: Project owners can remove any member
CREATE POLICY "members_remove_by_owner"
  ON public.project_members
  FOR DELETE
  TO authenticated
  USING (public.check_project_ownership(project_id, auth.uid()));

-- DELETE: Users can remove themselves from projects
CREATE POLICY "members_remove_self"
  ON public.project_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- STEP 7: Create PROJECTS policies (using SECURITY DEFINER functions)
-- ============================================================================

-- SELECT: Owners can view their projects
CREATE POLICY "projects_read_own"
  ON public.projects
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

-- SELECT: Members can view projects they belong to
CREATE POLICY "projects_read_member"
  ON public.projects
  FOR SELECT
  TO authenticated
  USING (public.check_project_membership(id, auth.uid()));

-- INSERT: Any authenticated user can create projects
CREATE POLICY "projects_create"
  ON public.projects
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

-- UPDATE: Only owners can update projects
CREATE POLICY "projects_modify"
  ON public.projects
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

-- DELETE: Only owners can delete projects
CREATE POLICY "projects_remove"
  ON public.projects
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- ============================================================================
-- STEP 8: Ensure RLS is enabled on all tables
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 9: Grant table permissions
-- ============================================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_members TO authenticated;
GRANT SELECT ON public.project_members TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT SELECT ON public.projects TO anon;
