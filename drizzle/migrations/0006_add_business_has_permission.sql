CREATE OR REPLACE FUNCTION public.business_has_permission(p_business_id uuid, p_permission text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH r AS (
    SELECT
      EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = p_business_id AND b.owner_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.business_members bm WHERE bm.business_id = p_business_id AND bm.user_id = auth.uid() AND lower(bm.role) IN ('owner','admin')) AS is_admin,
      EXISTS (SELECT 1 FROM public.business_members bm WHERE bm.business_id = p_business_id AND bm.user_id = auth.uid() AND lower(bm.role) IN ('manager','editor')) AS is_editor_role,
      EXISTS (SELECT 1 FROM public.business_members bm WHERE bm.business_id = p_business_id AND bm.user_id = auth.uid()) AS is_member
  )
  SELECT CASE
    WHEN p_permission IN ('business.read','project.read','artifact.read','catalog.read','booking.read') THEN is_admin OR is_editor_role OR is_member
    WHEN p_permission IN ('artifact.write','catalog.write','project.write','booking.manage') THEN is_admin OR is_editor_role
    WHEN p_permission IN ('artifact.delete','catalog.delete','business.profile.write','team.manage','site.publish') THEN is_admin
    ELSE false END
  FROM r;
$$;
REVOKE EXECUTE ON FUNCTION public.business_has_permission(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.business_has_permission(uuid, text) TO authenticated;