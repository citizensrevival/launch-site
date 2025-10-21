-- Fix page_version status design issue
-- Remove status column from page_version and rely on page_publish table

-- First, let's see what data we have
DO $$ 
DECLARE
    published_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO published_count 
    FROM page_version 
    WHERE status = 'published';
    
    IF published_count > 0 THEN
        RAISE NOTICE 'Found % published page versions that need to be migrated to page_publish table', published_count;
        
        -- Migrate published versions to page_publish table
        INSERT INTO page_publish (page_id, version, published_at, published_by)
        SELECT 
            page_id, 
            version, 
            COALESCE(updated_at, created_at) as published_at,
            COALESCE(updated_by, created_by) as published_by
        FROM page_version 
        WHERE status = 'published'
        ON CONFLICT (page_id) DO UPDATE SET
            version = EXCLUDED.version,
            published_at = EXCLUDED.published_at,
            published_by = EXCLUDED.published_by;
            
        RAISE NOTICE 'Migrated published versions to page_publish table';
    END IF;
END $$;

-- Drop dependent policies first
DROP POLICY IF EXISTS read_published_pages ON page_version;

-- Remove the status column from page_version
ALTER TABLE page_version DROP COLUMN IF EXISTS status;

-- Update the schema to reflect the new design
COMMENT ON TABLE page_version IS 'Page versions are always drafts by default. Published status is tracked in page_publish table.';
COMMENT ON TABLE page_publish IS 'Tracks which version of each page is currently published. Only one version per page can be published.';
