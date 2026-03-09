-- Fix infinite recursion: replace "Members can view joined projects" policy
-- with a security definer function approach

-- Create a security definer function to check project membership
CREATE OR REPLACE FUNCTION public.is_project_member(_user_id uuid, _project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.project_members
    WHERE user_id = _user_id
      AND project_id = _project_id
  )
$$;

-- Drop the recursive policy
DROP POLICY IF EXISTS "Members can view joined projects" ON public.projects;

-- Recreate it using the security definer function (bypasses RLS on project_members)
CREATE POLICY "Members can view joined projects"
ON public.projects
FOR SELECT
TO authenticated
USING (public.is_project_member(auth.uid(), id));
