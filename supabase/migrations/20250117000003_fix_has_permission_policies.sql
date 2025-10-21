-- Fix has_permission function calls in RLS policies
-- The function signature is has_permission(user_id, permission) but policies are calling it with (auth.uid(), permission)

-- Drop and recreate all policies with correct parameter order
-- This is a comprehensive fix for all RLS policies that use has_permission

-- PAGE VERSION POLICIES
DROP POLICY IF EXISTS "cms_pages_write" ON page_version;
DROP POLICY IF EXISTS "cms_pages_update" ON page_version;
DROP POLICY IF EXISTS "page_versions_read" ON page_version;
DROP POLICY IF EXISTS "page_versions_create" ON page_version;
DROP POLICY IF EXISTS "page_versions_update" ON page_version;

-- PAGE PUBLISH POLICIES
DROP POLICY IF EXISTS "cms_pages_publish" ON page_publish;
DROP POLICY IF EXISTS "cms_pages_unpublish" ON page_publish;
DROP POLICY IF EXISTS "page_publish_read" ON page_publish;
DROP POLICY IF EXISTS "page_publish" ON page_publish;
DROP POLICY IF EXISTS "page_unpublish" ON page_publish;

-- PAGE TABLE POLICIES
DROP POLICY IF EXISTS "pages_read" ON page;
DROP POLICY IF EXISTS "pages_create" ON page;
DROP POLICY IF EXISTS "pages_update" ON page;
DROP POLICY IF EXISTS "pages_delete" ON page;

-- Recreate with correct parameter order
-- PAGE VERSION POLICIES
CREATE POLICY "cms_pages_write" ON page_version
  FOR INSERT WITH CHECK (has_permission(auth.uid(), 'cms.pages.write'));

CREATE POLICY "cms_pages_update" ON page_version
  FOR UPDATE USING (has_permission(auth.uid(), 'cms.pages.write'));

CREATE POLICY "page_versions_read" ON page_version
  FOR SELECT USING (has_permission(auth.uid(), 'cms.pages.read'));

CREATE POLICY "page_versions_create" ON page_version
  FOR INSERT WITH CHECK (has_permission(auth.uid(), 'cms.pages.write'));

CREATE POLICY "page_versions_update" ON page_version
  FOR UPDATE USING (has_permission(auth.uid(), 'cms.pages.write'));

-- PAGE PUBLISH POLICIES
CREATE POLICY "cms_pages_publish" ON page_publish
  FOR INSERT WITH CHECK (has_permission(auth.uid(), 'cms.pages.publish'));

CREATE POLICY "cms_pages_unpublish" ON page_publish
  FOR DELETE USING (has_permission(auth.uid(), 'cms.pages.publish'));

CREATE POLICY "page_publish_read" ON page_publish
  FOR SELECT USING (has_permission(auth.uid(), 'cms.pages.read'));

CREATE POLICY "page_publish" ON page_publish
  FOR INSERT WITH CHECK (has_permission(auth.uid(), 'cms.pages.publish'));

CREATE POLICY "page_unpublish" ON page_publish
  FOR DELETE USING (has_permission(auth.uid(), 'cms.pages.publish'));

-- PAGE TABLE POLICIES
CREATE POLICY "pages_read" ON page
  FOR SELECT USING (has_permission(auth.uid(), 'cms.pages.read'));

CREATE POLICY "pages_create" ON page
  FOR INSERT WITH CHECK (has_permission(auth.uid(), 'cms.pages.write'));

CREATE POLICY "pages_update" ON page
  FOR UPDATE USING (has_permission(auth.uid(), 'cms.pages.write'));

CREATE POLICY "pages_delete" ON page
  FOR DELETE USING (
    has_permission(auth.uid(), 'cms.pages.write') AND 
    NOT is_system
  );
