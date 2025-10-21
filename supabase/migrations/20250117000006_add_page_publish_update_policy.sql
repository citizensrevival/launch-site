-- Add missing UPDATE policy for page_publish table
-- The upsert operation in publishPage() needs UPDATE permission

CREATE POLICY "page_publish_update" ON page_publish
  FOR UPDATE USING (true) WITH CHECK (true);
