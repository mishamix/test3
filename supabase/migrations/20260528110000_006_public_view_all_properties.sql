/*
  # Allow public read access to all properties and their images

  Enables the public Properties page to list/filter by status (for_sale, sold, rented)
  and keeps property detail pages accessible for all saved listings.
*/

DROP POLICY IF EXISTS "Public can view for_sale properties" ON public.properties;
DROP POLICY IF EXISTS "Public can view available properties" ON public.properties;

CREATE POLICY "Public can view properties"
  ON public.properties
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Public can view property images" ON public.property_images;

CREATE POLICY "Public can view property images"
  ON public.property_images
  FOR SELECT
  TO public
  USING (true);
