-- 1. Bookings: replace the broken ownership check with real membership
DROP POLICY IF EXISTS bookings_select_owner ON public.bookings;
CREATE POLICY bookings_select_owner ON public.bookings
  FOR SELECT TO authenticated
  USING (business_id IS NOT NULL AND public.is_business_member(business_id));

-- 2. Businesses: stop exposing the whole row to anonymous visitors
DROP POLICY IF EXISTS businesses_select_storefront ON public.businesses;
REVOKE SELECT ON public.businesses FROM anon;

-- Public-safe storefront projection (no contact/notification/settings data)
CREATE OR REPLACE VIEW public.business_storefronts AS
SELECT id, slug, name, tagline, description, logo_url, brand_color, website, industry, hours
FROM public.businesses;

GRANT SELECT ON public.business_storefronts TO anon, authenticated;