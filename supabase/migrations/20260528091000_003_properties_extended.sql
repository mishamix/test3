/*
  # Extend property schema for CMS requirements

  Adds:
  - city, country, full_address
  - thumbnail_url
  - area_unit (sqm/sqft) + area_size stays numeric
  - status values: for_sale / sold / rented (migrates existing data)
  - optional fields: year_built, parking_spaces, has_pool, has_garden, map_lat, map_lng
  - property_images table for normalized gallery (with ordering + thumbnail)
*/

-- New columns (all nullable / safe defaults)
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS full_address text,
  ADD COLUMN IF NOT EXISTS thumbnail_url text,
  ADD COLUMN IF NOT EXISTS area_unit text NOT NULL DEFAULT 'sqft',
  ADD COLUMN IF NOT EXISTS year_built integer,
  ADD COLUMN IF NOT EXISTS parking_spaces integer,
  ADD COLUMN IF NOT EXISTS has_pool boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_garden boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS map_lat double precision,
  ADD COLUMN IF NOT EXISTS map_lng double precision;

-- Migrate status values (legacy: available/reserved -> for_sale)
UPDATE public.properties
SET status = CASE
  WHEN status IN ('available', 'reserved') THEN 'for_sale'
  WHEN status = 'sold' THEN 'sold'
  WHEN status = 'rented' THEN 'rented'
  ELSE status
END;

-- Image gallery normalization (optional; can be used gradually)
CREATE TABLE IF NOT EXISTS public.property_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_thumbnail boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;

-- Public read images for available properties
DROP POLICY IF EXISTS "Public can view property images" ON public.property_images;
CREATE POLICY "Public can view property images"
  ON public.property_images
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_images.property_id
        AND p.status = 'for_sale'
    )
  );

-- Admins can manage property images
DROP POLICY IF EXISTS "Admins can manage property images" ON public.property_images;
CREATE POLICY "Admins can manage property images"
  ON public.property_images
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_property_images_property ON public.property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_property_images_sort_order ON public.property_images(property_id, sort_order);

