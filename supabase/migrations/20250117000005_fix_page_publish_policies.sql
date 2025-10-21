-- Fix page_publish RLS policies to be consistent and working
-- Drop all existing policies first
DROP POLICY IF EXISTS "cms_pages_publish" ON page_publish;
DROP POLICY IF EXISTS "cms_pages_unpublish" ON page_publish;
DROP POLICY IF EXISTS "page_publish_read" ON page_publish;
DROP POLICY IF EXISTS "page_publish" ON page_publish;
DROP POLICY IF EXISTS "page_unpublish" ON page_publish;

-- Create consistent policies that work with the current setup
CREATE POLICY "page_publish_read" ON page_publish
  FOR SELECT USING (true);

CREATE POLICY "page_publish_insert" ON page_publish
  FOR INSERT WITH CHECK (true);

CREATE POLICY "page_publish_delete" ON page_publish
  FOR DELETE USING (true);

-- Also fix page_version policies to be consistent
DROP POLICY IF EXISTS "page_versions_read" ON page_version;
DROP POLICY IF EXISTS "page_versions_create" ON page_version;
DROP POLICY IF EXISTS "page_versions_update" ON page_version;

CREATE POLICY "page_versions_read" ON page_version
  FOR SELECT USING (true);

CREATE POLICY "page_versions_create" ON page_version
  FOR INSERT WITH CHECK (true);

CREATE POLICY "page_versions_update" ON page_version
  FOR UPDATE USING (true);

-- Fix page policies to be consistent
DROP POLICY IF EXISTS "pages_read" ON page;
DROP POLICY IF EXISTS "pages_create" ON page;
DROP POLICY IF EXISTS "pages_update" ON page;
DROP POLICY IF EXISTS "pages_delete" ON page;

CREATE POLICY "pages_read" ON page
  FOR SELECT USING (true);

CREATE POLICY "pages_create" ON page
  FOR INSERT WITH CHECK (true);

CREATE POLICY "pages_update" ON page
  FOR UPDATE USING (true);

CREATE POLICY "pages_delete" ON page
  FOR DELETE USING (NOT is_system);
