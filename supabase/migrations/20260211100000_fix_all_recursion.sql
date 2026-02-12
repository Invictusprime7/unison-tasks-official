-- ============================================================================
-- COMPREHENSIVE FIX: Remove ALL recursion between profiles and project_members
-- This migration ensures no policies on either table reference the other
-- ============================================================================

-- ============================================================================
-- STEP 1: Drop ALL existing policies on profiles
-- ============================================================================
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view project collaborators" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.profiles;

-- ============================================================================
-- STEP 2: Create SIMPLE profiles policies (NO references to other tables)
-- ============================================================================

-- Anyone authenticated can view profiles (they contain only public info)
CREATE POLICY "profiles_select_all"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Users can only insert their own profile
CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can only delete their own profile
CREATE POLICY "profiles_delete_own"
  ON public.profiles
  FOR DELETE
  USING (auth.uid() = id);

-- ============================================================================
-- STEP 3: Ensure project_members policies are clean (NO profiles references)
-- ============================================================================

-- Drop any residual policies that might still exist
DROP POLICY IF EXISTS "pm_select_own" ON public.project_members;
DROP POLICY IF EXISTS "pm_select_owner" ON public.project_members;
DROP POLICY IF EXISTS "pm_insert_owner" ON public.project_members;
DROP POLICY IF EXISTS "pm_update_owner" ON public.project_members;
DROP POLICY IF EXISTS "pm_delete_owner" ON public.project_members;
DROP POLICY IF EXISTS "pm_delete_self" ON public.project_members;

-- Recreate project_members policies (ONLY reference projects.owner_id, NOT profiles)
CREATE POLICY "pm_select_own"
  ON public.project_members
  FOR SELECT
  USING (user_id = auth.uid());

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

CREATE POLICY "pm_delete_self"
  ON public.project_members
  FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- STEP 4: Ensure RLS is enabled on both tables
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 5: Grant appropriate permissions
-- ============================================================================
GRANT SELECT ON public.profiles TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_members TO authenticated;
GRANT SELECT ON public.project_members TO anon;
