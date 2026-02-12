-- ============================================================================
-- FIX: Break recursion cycle between projects and project_members
-- The problem:
--   1. projects policy "can view projects they are members of" queries project_members
--   2. project_members policy queries projects.owner_id
--   3. This creates a circular dependency = infinite recursion
--
-- The solution: Use a SECURITY DEFINER function to check membership
-- This bypasses RLS when checking membership, breaking the cycle
-- ============================================================================

-- Create a security definer function to check project membership
-- This function runs with the privileges of the function owner (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_project_member(p_project_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_id = p_project_id
    AND user_id = p_user_id
  );
$$;

-- Create a security definer function to check project ownership
CREATE OR REPLACE FUNCTION public.is_project_owner(p_project_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = p_project_id
    AND owner_id = p_user_id
  );
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_project_member(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_project_owner(UUID, UUID) TO authenticated;

-- ============================================================================
-- STEP 1: Drop ALL existing policies on projects
-- ============================================================================
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view projects they are members of" ON public.projects;
DROP POLICY IF EXISTS "Users can view projects they have access to" ON public.projects;
DROP POLICY IF EXISTS "Project owners can manage their projects" ON public.projects;
DROP POLICY IF EXISTS "Owners can update their projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Owners can delete their projects" ON public.projects;
DROP POLICY IF EXISTS "Members can view joined projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
DROP POLICY IF EXISTS "projects_select" ON public.projects;
DROP POLICY IF EXISTS "projects_insert" ON public.projects;
DROP POLICY IF EXISTS "projects_update" ON public.projects;
DROP POLICY IF EXISTS "projects_delete" ON public.projects;

-- ============================================================================
-- STEP 2: Create projects policies using SECURITY DEFINER functions
-- ============================================================================

-- Users can view projects they own OR are members of
CREATE POLICY "projects_select"
  ON public.projects
  FOR SELECT
  USING (
    owner_id = auth.uid()
    OR public.is_project_member(id, auth.uid())
  );

-- Any authenticated user can create projects
CREATE POLICY "projects_insert"
  ON public.projects
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND owner_id = auth.uid());

-- Only owners can update projects
CREATE POLICY "projects_update"
  ON public.projects
  FOR UPDATE
  USING (owner_id = auth.uid());

-- Only owners can delete projects
CREATE POLICY "projects_delete"
  ON public.projects
  FOR DELETE
  USING (owner_id = auth.uid());

-- ============================================================================
-- STEP 3: Update project_members policies to use SECURITY DEFINER function
-- ============================================================================
DROP POLICY IF EXISTS "pm_select_own" ON public.project_members;
DROP POLICY IF EXISTS "pm_select_owner" ON public.project_members;
DROP POLICY IF EXISTS "pm_insert_owner" ON public.project_members;
DROP POLICY IF EXISTS "pm_update_owner" ON public.project_members;
DROP POLICY IF EXISTS "pm_delete_owner" ON public.project_members;
DROP POLICY IF EXISTS "pm_delete_self" ON public.project_members;

-- Users can see their own memberships
CREATE POLICY "pm_select_own"
  ON public.project_members
  FOR SELECT
  USING (user_id = auth.uid());

-- Project owners can see all members (using SECURITY DEFINER function)
CREATE POLICY "pm_select_owner"
  ON public.project_members
  FOR SELECT
  USING (public.is_project_owner(project_id, auth.uid()));

-- Project owners can add members
CREATE POLICY "pm_insert_owner"
  ON public.project_members
  FOR INSERT
  WITH CHECK (public.is_project_owner(project_id, auth.uid()));

-- Project owners can update members
CREATE POLICY "pm_update_owner"
  ON public.project_members
  FOR UPDATE
  USING (public.is_project_owner(project_id, auth.uid()));

-- Project owners can remove members
CREATE POLICY "pm_delete_owner"
  ON public.project_members
  FOR DELETE
  USING (public.is_project_owner(project_id, auth.uid()));

-- Users can remove themselves from projects
CREATE POLICY "pm_delete_self"
  ON public.project_members
  FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- STEP 4: Ensure RLS is enabled
-- ============================================================================
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 5: Update profiles policies to not cause issues
-- ============================================================================
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Simple profiles policies (no cross-table references)
CREATE POLICY "profiles_select_all"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "profiles_delete_own"
  ON public.profiles
  FOR DELETE
  USING (auth.uid() = id);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
