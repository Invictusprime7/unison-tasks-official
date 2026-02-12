-- ============================================================================
-- REMOVE: All project_members RLS policies and related functions
-- This migration completely removes project_members from the RLS system
-- ============================================================================

-- ============================================================================
-- STEP 1: Drop ALL policies on project_members
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
-- STEP 2: Drop policies on other tables that use check_project_membership
-- ============================================================================
DROP POLICY IF EXISTS "tasks_insert" ON public.tasks;
DROP POLICY IF EXISTS "tasks_update" ON public.tasks;
DROP POLICY IF EXISTS "project_revisions_select" ON public.project_revisions;
DROP POLICY IF EXISTS "project_revisions_insert" ON public.project_revisions;
DROP POLICY IF EXISTS "project_files_select" ON public.project_files;
DROP POLICY IF EXISTS "project_files_all" ON public.project_files;
DROP POLICY IF EXISTS "projects_read_member" ON public.projects;

-- ============================================================================
-- STEP 3: Disable RLS on project_members (allows all access)
-- ============================================================================
ALTER TABLE public.project_members DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 4: Drop SECURITY DEFINER functions that reference project_members
-- ============================================================================
DROP FUNCTION IF EXISTS public.check_project_membership(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.is_project_member(UUID, UUID) CASCADE;

-- ============================================================================
-- STEP 4: Update projects policies to not reference project_members
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

-- Recreate simple projects policies (no membership checks)
CREATE POLICY "projects_read"
  ON public.projects
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "projects_create"
  ON public.projects
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "projects_update"
  ON public.projects
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "projects_delete"
  ON public.projects
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- ============================================================================
-- STEP 6: Recreate policies for tasks (using project ownership)
-- ============================================================================
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'tasks' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.tasks', pol.policyname);
    END LOOP;
END $$;

-- Tasks: users can access tasks in projects they own
CREATE POLICY "tasks_select"
  ON public.tasks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = tasks.project_id
      AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "tasks_insert"
  ON public.tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = tasks.project_id
      AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "tasks_update"
  ON public.tasks
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = tasks.project_id
      AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "tasks_delete"
  ON public.tasks
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = tasks.project_id
      AND p.owner_id = auth.uid()
    )
  );

-- ============================================================================
-- STEP 7: Recreate policies for project_revisions (using project ownership)
-- ============================================================================
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'project_revisions' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.project_revisions', pol.policyname);
    END LOOP;
END $$;

CREATE POLICY "project_revisions_select"
  ON public.project_revisions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_revisions.project_id
      AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "project_revisions_insert"
  ON public.project_revisions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_revisions.project_id
      AND p.owner_id = auth.uid()
    )
  );

-- ============================================================================
-- STEP 8: Recreate policies for project_files (using project ownership)
-- ============================================================================
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'project_files' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.project_files', pol.policyname);
    END LOOP;
END $$;

CREATE POLICY "project_files_select"
  ON public.project_files
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_files.project_id
      AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "project_files_all"
  ON public.project_files
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_files.project_id
      AND p.owner_id = auth.uid()
    )
  );

-- ============================================================================
-- STEP 5: Grant permissions (project_members is now open to authenticated users)
-- ============================================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_members TO authenticated;
GRANT SELECT ON public.project_members TO anon;
