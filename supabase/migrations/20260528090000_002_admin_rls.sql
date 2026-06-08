/*
  # Admin-only RLS hardening

  Changes:
  - Add `auth_user_id` to `admin_users` and make it unique
  - Lock down RLS so ONLY admins can manage properties/inquiries/admin_users
  - Keep public read access for available properties
  - Keep public insert access for inquiries (contact form)

  IMPORTANT:
  After running this migration, you must insert your admin user row with the auth user id:

    insert into public.admin_users (auth_user_id, email)
    values ('<auth.uid()>', '<admin email>');
*/

-- Add auth_user_id for strong admin identity
ALTER TABLE public.admin_users
ADD COLUMN IF NOT EXISTS auth_user_id uuid;

-- If you already have rows, you must backfill auth_user_id manually.
CREATE UNIQUE INDEX IF NOT EXISTS admin_users_auth_user_id_key ON public.admin_users(auth_user_id);

-- Helper function: is current user an admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users au
    WHERE au.auth_user_id = auth.uid()
  );
$$;

-- Drop old overly-permissive policies
DROP POLICY IF EXISTS "Authenticated users can manage properties" ON public.properties;
DROP POLICY IF EXISTS "Authenticated users can manage inquiries" ON public.property_inquiries;
DROP POLICY IF EXISTS "Authenticated users can view admin users" ON public.admin_users;

-- Properties: admins can manage everything
CREATE POLICY "Admins can manage properties"
  ON public.properties
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Inquiries: admins can read/update/delete; public can insert (already exists in 001)
CREATE POLICY "Admins can manage inquiries"
  ON public.property_inquiries
  FOR SELECT, UPDATE, DELETE
  TO authenticated
  USING (public.is_admin());

-- Admin users: admins can read/manage admin list
CREATE POLICY "Admins can manage admin users"
  ON public.admin_users
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

