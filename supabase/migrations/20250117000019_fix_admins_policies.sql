-- Fix admins table RLS policies to allow user management
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "self can select own admin row" ON public.admins;

-- Create policies that allow admin users to manage other admins
CREATE POLICY "admins_can_read_all" ON public.admins
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
  );

CREATE POLICY "admins_can_insert" ON public.admins
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
  );

CREATE POLICY "admins_can_delete" ON public.admins
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
  );

-- Also fix user_permissions policies to allow admin management
DROP POLICY IF EXISTS "manage_user_permissions" ON user_permissions;

CREATE POLICY "user_permissions_read" ON user_permissions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
  );

CREATE POLICY "user_permissions_insert" ON user_permissions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
  );

CREATE POLICY "user_permissions_update" ON user_permissions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
  );

CREATE POLICY "user_permissions_delete" ON user_permissions
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
  );
