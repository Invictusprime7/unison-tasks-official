-- COMPREHENSIVE FIX: Eliminate ALL infinite recursion paths in RLS policies
--
-- ROOT CAUSE: Two recursion patterns exist:
--   1. Self-referencing: policies query their own table
--   2. Mutual recursion: Table A policy → Table B → Table B RLS → Table A → loop
--
-- SOLUTION: SECURITY DEFINER functions bypass RLS, breaking recursion chains.
--
-- NOTE: Each step runs independently so one failure doesn't roll back others.
-- Optional tables use exception handling to skip gracefully if schema differs.

-- ============================================
-- STEP 1: Create SECURITY DEFINER helper functions
-- ============================================

CREATE OR REPLACE FUNCTION check_project_membership(p_project_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM project_members
        WHERE project_id = p_project_id
        AND user_id = p_user_id
    );
END;
$$;

CREATE OR REPLACE FUNCTION check_project_membership_role(p_project_id UUID, p_user_id UUID, p_roles TEXT[])
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM project_members
        WHERE project_id = p_project_id
        AND user_id = p_user_id
        AND role = ANY(p_roles)
    );
END;
$$;

CREATE OR REPLACE FUNCTION check_project_ownership(p_project_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM projects
        WHERE id = p_project_id
        AND owner_id = p_user_id
    );
END;
$$;

CREATE OR REPLACE FUNCTION check_project_business_ownership(p_project_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
    v_business_id UUID;
BEGIN
    SELECT business_id INTO v_business_id FROM projects WHERE id = p_project_id;
    IF v_business_id IS NULL THEN
        RETURN FALSE;
    END IF;
    RETURN EXISTS (
        SELECT 1 FROM businesses
        WHERE id = v_business_id
        AND owner_id = p_user_id
    );
END;
$$;

CREATE OR REPLACE FUNCTION check_project_visibility(p_project_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
    v_visibility TEXT;
BEGIN
    SELECT visibility INTO v_visibility
    FROM projects WHERE id = p_project_id;
    IF v_visibility = 'public' THEN
        RETURN TRUE;
    END IF;
    RETURN FALSE;
END;
$$;

CREATE OR REPLACE FUNCTION check_project_access(p_project_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
    RETURN check_project_ownership(p_project_id, p_user_id)
        OR check_project_membership(p_project_id, p_user_id)
        OR check_project_visibility(p_project_id, p_user_id);
END;
$$;

-- ============================================
-- STEP 2: Fix organization_members (if exists)
-- ============================================
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organization_members') THEN
        EXECUTE 'CREATE OR REPLACE FUNCTION check_organization_membership(p_org_id UUID, p_user_id UUID)
        RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public STABLE AS $fn$
        BEGIN
            RETURN EXISTS (SELECT 1 FROM organization_members WHERE organization_id = p_org_id AND user_id = p_user_id AND is_active = true);
        END; $fn$';

        EXECUTE 'CREATE OR REPLACE FUNCTION check_organization_admin(p_org_id UUID, p_user_id UUID)
        RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public STABLE AS $fn$
        BEGIN
            RETURN EXISTS (SELECT 1 FROM organization_members WHERE organization_id = p_org_id AND user_id = p_user_id AND role IN (''owner'', ''admin'') AND is_active = true);
        END; $fn$';

        DROP POLICY IF EXISTS "Users can view organization members they belong to" ON organization_members;
        DROP POLICY IF EXISTS "Organization owners and admins can manage members" ON organization_members;
        DROP POLICY IF EXISTS "om_select_own" ON organization_members;
        DROP POLICY IF EXISTS "om_select_as_member" ON organization_members;
        DROP POLICY IF EXISTS "om_admin_all" ON organization_members;

        ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "om_select_own" ON organization_members
            FOR SELECT USING (user_id = auth.uid());
        CREATE POLICY "om_select_as_member" ON organization_members
            FOR SELECT USING (check_organization_membership(organization_id, auth.uid()));
        CREATE POLICY "om_admin_all" ON organization_members
            FOR ALL USING (check_organization_admin(organization_id, auth.uid()));
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping organization_members fix: %', SQLERRM;
END $$;

-- ============================================
-- STEP 3: Fix project_members (CORE - must succeed)
-- ============================================
DROP POLICY IF EXISTS "Users can view project members for accessible projects" ON project_members;
DROP POLICY IF EXISTS "Project owners and admins can manage members" ON project_members;
DROP POLICY IF EXISTS "Users can view project members" ON project_members;
DROP POLICY IF EXISTS "Users can view own membership" ON project_members;
DROP POLICY IF EXISTS "Owners can view project members" ON project_members;
DROP POLICY IF EXISTS "Owners can manage project members" ON project_members;
DROP POLICY IF EXISTS "Members can view fellow members" ON project_members;
DROP POLICY IF EXISTS "pm_select_own" ON project_members;
DROP POLICY IF EXISTS "pm_select_as_owner" ON project_members;
DROP POLICY IF EXISTS "pm_select_as_business_owner" ON project_members;
DROP POLICY IF EXISTS "pm_manage_as_owner" ON project_members;
DROP POLICY IF EXISTS "pm_insert_self" ON project_members;
DROP POLICY IF EXISTS "pm_delete_self" ON project_members;

ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pm_select_own" ON project_members
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "pm_select_as_owner" ON project_members
    FOR SELECT USING (check_project_ownership(project_id, auth.uid()));

CREATE POLICY "pm_select_as_business_owner" ON project_members
    FOR SELECT USING (check_project_business_ownership(project_id, auth.uid()));

CREATE POLICY "pm_manage_as_owner" ON project_members
    FOR ALL USING (check_project_ownership(project_id, auth.uid()));

CREATE POLICY "pm_insert_self" ON project_members
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "pm_delete_self" ON project_members
    FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- STEP 4: Fix projects table (CORE - must succeed)
-- ============================================
DROP POLICY IF EXISTS "Users can view projects they have access to" ON projects;
DROP POLICY IF EXISTS "Users can view projects they are members of" ON projects;
DROP POLICY IF EXISTS "Project admins can update projects" ON projects;
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Members can view joined projects" ON projects;
DROP POLICY IF EXISTS "Users can view accessible projects" ON projects;

CREATE POLICY "Users can view accessible projects" ON projects
    FOR SELECT USING (
        owner_id = auth.uid()
        OR check_project_membership(id, auth.uid())
        OR check_project_visibility(id, auth.uid())
    );

CREATE POLICY "Project admins can update projects" ON projects
    FOR UPDATE USING (
        owner_id = auth.uid()
        OR check_project_membership_role(id, auth.uid(), ARRAY['owner', 'admin'])
    );

-- ============================================
-- STEP 5: Fix tasks table (optional - uses exception handling)
-- ============================================
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tasks') THEN
        DROP POLICY IF EXISTS "Users can view tasks in accessible projects" ON tasks;
        DROP POLICY IF EXISTS "Users can create tasks in accessible projects" ON tasks;
        DROP POLICY IF EXISTS "Users can update tasks they created or are assigned to" ON tasks;
        DROP POLICY IF EXISTS "Users can view tasks in their projects" ON tasks;
        DROP POLICY IF EXISTS "Users can update tasks in their projects" ON tasks;
        DROP POLICY IF EXISTS "Users can create tasks in their projects" ON tasks;
        DROP POLICY IF EXISTS "tasks_select" ON tasks;
        DROP POLICY IF EXISTS "tasks_insert" ON tasks;
        DROP POLICY IF EXISTS "tasks_update" ON tasks;

        ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "tasks_select" ON tasks
            FOR SELECT USING (check_project_access(project_id, auth.uid()));

        CREATE POLICY "tasks_insert" ON tasks
            FOR INSERT WITH CHECK (
                check_project_ownership(project_id, auth.uid())
                OR check_project_membership(project_id, auth.uid())
            );

        -- Use membership-based access (safe regardless of column names)
        CREATE POLICY "tasks_update" ON tasks
            FOR UPDATE USING (
                check_project_membership(project_id, auth.uid())
                OR check_project_ownership(project_id, auth.uid())
            );
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping tasks fix: %', SQLERRM;
END $$;

-- ============================================
-- STEP 6: Fix task_comments (optional)
-- ============================================
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'task_comments') THEN
        DROP POLICY IF EXISTS "Users can view comments on accessible tasks" ON task_comments;
        DROP POLICY IF EXISTS "Users can create comments on accessible tasks" ON task_comments;
        DROP POLICY IF EXISTS "task_comments_select" ON task_comments;
        DROP POLICY IF EXISTS "task_comments_insert" ON task_comments;
        DROP POLICY IF EXISTS "task_comments_update" ON task_comments;

        ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "task_comments_select" ON task_comments
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM tasks t
                    WHERE t.id = task_comments.task_id
                    AND check_project_access(t.project_id, auth.uid())
                )
            );

        CREATE POLICY "task_comments_insert" ON task_comments
            FOR INSERT WITH CHECK (
                EXISTS (
                    SELECT 1 FROM tasks t
                    WHERE t.id = task_comments.task_id
                    AND (check_project_ownership(t.project_id, auth.uid())
                         OR check_project_membership(t.project_id, auth.uid()))
                )
            );

        CREATE POLICY "task_comments_update" ON task_comments
            FOR UPDATE USING (author_id = auth.uid());
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping task_comments fix: %', SQLERRM;
END $$;

-- ============================================
-- STEP 7: Fix time_tracking_sessions (optional)
-- ============================================
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'time_tracking_sessions') THEN
        DROP POLICY IF EXISTS "Users can view time sessions for accessible tasks" ON time_tracking_sessions;
        DROP POLICY IF EXISTS "time_sessions_select" ON time_tracking_sessions;

        ALTER TABLE time_tracking_sessions ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "time_sessions_select" ON time_tracking_sessions
            FOR SELECT USING (
                user_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM tasks t
                    WHERE t.id = time_tracking_sessions.task_id
                    AND (check_project_ownership(t.project_id, auth.uid())
                         OR check_project_membership(t.project_id, auth.uid()))
                )
            );
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping time_tracking_sessions fix: %', SQLERRM;
END $$;

-- ============================================
-- STEP 8: Fix folders (optional)
-- ============================================
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'folders') THEN
        DROP POLICY IF EXISTS "Users can view accessible folders" ON folders;
        DROP POLICY IF EXISTS "folders_select" ON folders;

        ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "folders_select" ON folders
            FOR SELECT USING (
                owner_id = auth.uid()
                OR permission = 'public'
                OR (project_id IS NOT NULL AND (
                    check_project_ownership(project_id, auth.uid())
                    OR check_project_membership(project_id, auth.uid())
                ))
            );
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping folders fix: %', SQLERRM;
END $$;

-- ============================================
-- STEP 9: Fix files (optional)
-- ============================================
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'files') THEN
        DROP POLICY IF EXISTS "Users can view accessible files" ON files;
        DROP POLICY IF EXISTS "files_select" ON files;

        ALTER TABLE files ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "files_select" ON files
            FOR SELECT USING (
                owner_id = auth.uid()
                OR permission = 'public'
                OR (project_id IS NOT NULL AND (
                    check_project_ownership(project_id, auth.uid())
                    OR check_project_membership(project_id, auth.uid())
                ))
            );
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping files fix: %', SQLERRM;
END $$;

-- ============================================
-- STEP 10: Fix file_comments (optional)
-- ============================================
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'file_comments') THEN
        DROP POLICY IF EXISTS "Users can view comments on accessible files" ON file_comments;
        DROP POLICY IF EXISTS "Users can comment on accessible files" ON file_comments;
        DROP POLICY IF EXISTS "file_comments_select" ON file_comments;
        DROP POLICY IF EXISTS "file_comments_insert" ON file_comments;
        DROP POLICY IF EXISTS "file_comments_update" ON file_comments;

        ALTER TABLE file_comments ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "file_comments_select" ON file_comments
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM files f
                    WHERE f.id = file_comments.file_id
                    AND (f.owner_id = auth.uid()
                         OR f.permission = 'public'
                         OR (f.project_id IS NOT NULL AND check_project_membership(f.project_id, auth.uid())))
                )
            );

        CREATE POLICY "file_comments_insert" ON file_comments
            FOR INSERT WITH CHECK (
                EXISTS (
                    SELECT 1 FROM files f
                    WHERE f.id = file_comments.file_id
                    AND (f.owner_id = auth.uid()
                         OR (f.project_id IS NOT NULL AND check_project_membership(f.project_id, auth.uid())))
                )
            );

        CREATE POLICY "file_comments_update" ON file_comments
            FOR UPDATE USING (author_id = auth.uid());
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping file_comments fix: %', SQLERRM;
END $$;

-- ============================================
-- STEP 11: Fix page_layouts (optional)
-- ============================================
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'page_layouts') THEN
        DROP POLICY IF EXISTS "Users can view accessible layouts" ON page_layouts;
        DROP POLICY IF EXISTS "page_layouts_select" ON page_layouts;

        ALTER TABLE page_layouts ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "page_layouts_select" ON page_layouts
            FOR SELECT USING (
                owner_id = auth.uid()
                OR visibility = 'public'
                OR (project_id IS NOT NULL AND check_project_membership(project_id, auth.uid()))
            );
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping page_layouts fix: %', SQLERRM;
END $$;

-- ============================================
-- STEP 12: Fix project_revisions (optional)
-- ============================================
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_revisions') THEN
        DROP POLICY IF EXISTS "project_revisions_select" ON project_revisions;
        DROP POLICY IF EXISTS "project_revisions_insert" ON project_revisions;

        CREATE POLICY "project_revisions_select" ON project_revisions
            FOR SELECT USING (
                check_project_ownership(project_id, auth.uid())
                OR check_project_membership(project_id, auth.uid())
            );

        CREATE POLICY "project_revisions_insert" ON project_revisions
            FOR INSERT WITH CHECK (
                check_project_ownership(project_id, auth.uid())
                OR check_project_membership(project_id, auth.uid())
            );
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping project_revisions fix: %', SQLERRM;
END $$;

-- ============================================
-- STEP 13: Fix project_files (optional)
-- ============================================
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_files') THEN
        DROP POLICY IF EXISTS "project_files_select" ON project_files;
        DROP POLICY IF EXISTS "project_files_all" ON project_files;

        CREATE POLICY "project_files_select" ON project_files
            FOR SELECT USING (
                check_project_ownership(project_id, auth.uid())
                OR check_project_membership(project_id, auth.uid())
            );

        CREATE POLICY "project_files_all" ON project_files
            FOR ALL USING (
                check_project_ownership(project_id, auth.uid())
                OR check_project_membership(project_id, auth.uid())
            );
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping project_files fix: %', SQLERRM;
END $$;
