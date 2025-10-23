-- Fix menu_publish RLS policies to allow authenticated users to publish
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "menu_publish_read" ON menu_publish;
DROP POLICY IF EXISTS "menu_publish" ON menu_publish;
DROP POLICY IF EXISTS "menu_unpublish" ON menu_publish;

-- Create simpler policies that allow authenticated users to publish
CREATE POLICY "menu_publish_allow_authenticated" ON menu_publish
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Also fix menu and menu_version policies to be consistent
DROP POLICY IF EXISTS "menus_read" ON menu;
DROP POLICY IF EXISTS "menus_create" ON menu;
DROP POLICY IF EXISTS "menus_update" ON menu;
DROP POLICY IF EXISTS "menus_delete" ON menu;

CREATE POLICY "menus_read" ON menu
  FOR SELECT USING (true);

CREATE POLICY "menus_create" ON menu
  FOR INSERT WITH CHECK (true);

CREATE POLICY "menus_update" ON menu
  FOR UPDATE USING (true);

CREATE POLICY "menus_delete" ON menu
  FOR DELETE USING (NOT is_system);

-- Fix menu_version policies
DROP POLICY IF EXISTS "menu_versions_read" ON menu_version;
DROP POLICY IF EXISTS "menu_versions_create" ON menu_version;
DROP POLICY IF EXISTS "menu_versions_update" ON menu_version;

CREATE POLICY "menu_versions_read" ON menu_version
  FOR SELECT USING (true);

CREATE POLICY "menu_versions_create" ON menu_version
  FOR INSERT WITH CHECK (true);

CREATE POLICY "menu_versions_update" ON menu_version
  FOR UPDATE USING (true);
