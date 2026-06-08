/*
  # Align public properties SELECT policy with new statuses
*/

-- Replace old policy (available) with for_sale
DROP POLICY IF EXISTS "Public can view available properties" ON public.properties;

CREATE POLICY "Public can view for_sale properties"
  ON public.properties
  FOR SELECT
  TO public
  USING (status = 'for_sale');

