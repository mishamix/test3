/*
  # Fix admin authorization bootstrap (RLS)

  Problem:
  - `admin_users` was locked down to admins only
  - checking "am I an admin?" requires reading `admin_users`
  - this creates a circular dependency and causes false "Access denied"

  Solution:
  - allow any authenticated user to SELECT their own admin row
    (auth_user_id = auth.uid()) so the client can verify admin status

  This does NOT grant access to other users' admin rows.
*/

DROP POLICY IF EXISTS "Users can view own admin row" ON public.admin_users;

CREATE POLICY "Users can view own admin row"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

