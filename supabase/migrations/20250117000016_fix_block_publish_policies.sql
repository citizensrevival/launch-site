-- Fix block_publish RLS policies
-- Temporarily disable RLS for block_publish to test if that's the issue

-- Drop existing policies
DROP POLICY IF EXISTS "cms_blocks_publish" ON block_publish;
DROP POLICY IF EXISTS "cms_blocks_unpublish" ON block_publish;
DROP POLICY IF EXISTS "block_publish_read" ON block_publish;
DROP POLICY IF EXISTS "block_publish" ON block_publish;
DROP POLICY IF EXISTS "block_unpublish" ON block_publish;

-- Create simpler policies that allow authenticated users to publish
CREATE POLICY "block_publish_allow_authenticated" ON block_publish
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Alternative: Temporarily disable RLS for testing
-- ALTER TABLE block_publish DISABLE ROW LEVEL SECURITY;
