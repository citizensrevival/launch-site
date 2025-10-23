-- Add staging support to the CMS system
-- This migration adds staging capabilities to the existing publishing system

-- Add 'staged' to publish_status enum
ALTER TYPE publish_status ADD VALUE IF NOT EXISTS 'staged';

-- Create site_staging table for site-level staging
CREATE TABLE IF NOT EXISTS site_staging (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES site(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid NOT NULL,
  staged_at timestamptz NOT NULL DEFAULT now(),
  staged_by uuid NOT NULL,
  UNIQUE (site_id, name)
);

-- Add staging_status columns to version tables
ALTER TABLE page_version ADD COLUMN IF NOT EXISTS staging_status publish_status DEFAULT 'draft';
ALTER TABLE block_version ADD COLUMN IF NOT EXISTS staging_status publish_status DEFAULT 'draft';
ALTER TABLE menu_version ADD COLUMN IF NOT EXISTS staging_status publish_status DEFAULT 'draft';
ALTER TABLE asset_version ADD COLUMN IF NOT EXISTS staging_status publish_status DEFAULT 'draft';

-- Create staging dependency tracking table
CREATE TABLE IF NOT EXISTS staging_dependency (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staging_id uuid NOT NULL REFERENCES site_staging(id) ON DELETE CASCADE,
  entity_type text NOT NULL, -- 'page', 'block', 'menu', 'asset'
  entity_id uuid NOT NULL,
  version int NOT NULL,
  dependency_type text NOT NULL, -- 'direct', 'indirect', 'asset'
  dependency_entity_type text,
  dependency_entity_id uuid,
  dependency_version int,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create index for efficient dependency queries
CREATE INDEX IF NOT EXISTS idx_staging_dependency_staging_id ON staging_dependency(staging_id);
CREATE INDEX IF NOT EXISTS idx_staging_dependency_entity ON staging_dependency(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_staging_dependency_dependency ON staging_dependency(dependency_entity_type, dependency_entity_id);

-- Add comments for documentation
COMMENT ON TABLE site_staging IS 'Tracks site-level staging sessions for atomic publishing';
COMMENT ON TABLE staging_dependency IS 'Tracks dependencies between staged content for atomic publishing';
COMMENT ON COLUMN page_version.staging_status IS 'Staging status for this page version (draft, staged, published, archived)';
COMMENT ON COLUMN block_version.staging_status IS 'Staging status for this block version (draft, staged, published, archived)';
COMMENT ON COLUMN menu_version.staging_status IS 'Staging status for this menu version (draft, staged, published, archived)';
COMMENT ON COLUMN asset_version.staging_status IS 'Staging status for this asset version (draft, staged, published, archived)';

-- Enable RLS on new tables
ALTER TABLE site_staging ENABLE ROW LEVEL SECURITY;
ALTER TABLE staging_dependency ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for site_staging
CREATE POLICY "site_staging_allow_authenticated" ON site_staging
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Create RLS policies for staging_dependency
CREATE POLICY "staging_dependency_allow_authenticated" ON staging_dependency
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Create function to stage individual entities
CREATE OR REPLACE FUNCTION stage_entity(
  entity_type text,
  entity_id uuid,
  version_number int,
  staging_id uuid
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  table_name text;
  version_table text;
  staging_column text;
BEGIN
  -- Determine table names based on entity type
  CASE entity_type
    WHEN 'page' THEN
      table_name := 'page';
      version_table := 'page_version';
      staging_column := 'staging_status';
    WHEN 'block' THEN
      table_name := 'block';
      version_table := 'block_version';
      staging_column := 'staging_status';
    WHEN 'menu' THEN
      table_name := 'menu';
      version_table := 'menu_version';
      staging_column := 'staging_status';
    WHEN 'asset' THEN
      table_name := 'asset';
      version_table := 'asset_version';
      staging_column := 'staging_status';
    ELSE
      RAISE EXCEPTION 'Invalid entity_type: %', entity_type;
  END CASE;

  -- Update staging status
  EXECUTE format('UPDATE %I SET %I = ''staged'' WHERE %I = $1 AND version = $2', 
    version_table, staging_column, 
    CASE entity_type WHEN 'page' THEN 'page_id' WHEN 'block' THEN 'block_id' WHEN 'menu' THEN 'menu_id' WHEN 'asset' THEN 'asset_id' END);

  -- Record dependency
  INSERT INTO staging_dependency (staging_id, entity_type, entity_id, version, dependency_type)
  VALUES (staging_id, entity_type, entity_id, version_number, 'direct');

  RETURN true;
END;
$$;

-- Create function to stage entire site
CREATE OR REPLACE FUNCTION stage_site(
  site_id_param uuid,
  staging_name text,
  staging_description text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_staging_id uuid;
  user_id uuid;
BEGIN
  -- Get current user
  user_id := auth.uid();
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Create staging session
  INSERT INTO site_staging (site_id, name, description, created_by, staged_by)
  VALUES (site_id_param, staging_name, staging_description, user_id, user_id)
  RETURNING id INTO new_staging_id;

  -- Stage all published content
  -- Pages
  UPDATE page_version SET staging_status = 'staged'
  WHERE page_id IN (SELECT id FROM page WHERE site_id = site_id_param)
    AND staging_status = 'published';

  -- Blocks
  UPDATE block_version SET staging_status = 'staged'
  WHERE block_id IN (SELECT id FROM block WHERE site_id = site_id_param)
    AND staging_status = 'published';

  -- Menus
  UPDATE menu_version SET staging_status = 'staged'
  WHERE menu_id IN (SELECT id FROM menu WHERE site_id = site_id_param)
    AND staging_status = 'published';

  -- Assets
  UPDATE asset_version SET staging_status = 'staged'
  WHERE asset_id IN (SELECT id FROM asset WHERE site_id = site_id_param)
    AND staging_status = 'published';

  -- Record dependencies for all staged content
  INSERT INTO staging_dependency (staging_id, entity_type, entity_id, version, dependency_type)
  SELECT 
    new_staging_id,
    'page',
    pv.page_id,
    pv.version,
    'direct'
  FROM page_version pv
  JOIN page p ON p.id = pv.page_id
  WHERE p.site_id = site_id_param AND pv.staging_status = 'staged';

  INSERT INTO staging_dependency (staging_id, entity_type, entity_id, version, dependency_type)
  SELECT 
    new_staging_id,
    'block',
    bv.block_id,
    bv.version,
    'direct'
  FROM block_version bv
  JOIN block b ON b.id = bv.block_id
  WHERE b.site_id = site_id_param AND bv.staging_status = 'staged';

  INSERT INTO staging_dependency (staging_id, entity_type, entity_id, version, dependency_type)
  SELECT 
    new_staging_id,
    'menu',
    mv.menu_id,
    mv.version,
    'direct'
  FROM menu_version mv
  JOIN menu m ON m.id = mv.menu_id
  WHERE m.site_id = site_id_param AND mv.staging_status = 'staged';

  INSERT INTO staging_dependency (staging_id, entity_type, entity_id, version, dependency_type)
  SELECT 
    new_staging_id,
    'asset',
    av.asset_id,
    av.version,
    'direct'
  FROM asset_version av
  JOIN asset a ON a.id = av.asset_id
  WHERE a.site_id = site_id_param AND av.staging_status = 'staged';

  RETURN new_staging_id;
END;
$$;

-- Create function to publish staged content atomically
CREATE OR REPLACE FUNCTION publish_staged_content(staging_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  staging_record site_staging%ROWTYPE;
  user_id uuid;
BEGIN
  -- Get current user
  user_id := auth.uid();
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Get staging record
  SELECT * INTO staging_record FROM site_staging WHERE id = staging_id_param;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Staging session not found';
  END IF;

  -- Publish all staged content atomically
  -- Pages
  INSERT INTO page_publish (page_id, version, published_by)
  SELECT DISTINCT entity_id, version, user_id
  FROM staging_dependency
  WHERE staging_id = staging_id_param AND entity_type = 'page'
  ON CONFLICT (page_id) DO UPDATE SET
    version = EXCLUDED.version,
    published_by = EXCLUDED.published_by;

  -- Blocks
  INSERT INTO block_publish (block_id, version, published_by)
  SELECT DISTINCT entity_id, version, user_id
  FROM staging_dependency
  WHERE staging_id = staging_id_param AND entity_type = 'block'
  ON CONFLICT (block_id) DO UPDATE SET
    version = EXCLUDED.version,
    published_by = EXCLUDED.published_by;

  -- Menus
  INSERT INTO menu_publish (menu_id, version, published_by)
  SELECT DISTINCT entity_id, version, user_id
  FROM staging_dependency
  WHERE staging_id = staging_id_param AND entity_type = 'menu'
  ON CONFLICT (menu_id) DO UPDATE SET
    version = EXCLUDED.version,
    published_by = EXCLUDED.published_by;

  -- Assets
  INSERT INTO asset_publish (asset_id, version, published_by)
  SELECT DISTINCT entity_id, version, user_id
  FROM staging_dependency
  WHERE staging_id = staging_id_param AND entity_type = 'asset'
  ON CONFLICT (asset_id) DO UPDATE SET
    version = EXCLUDED.version,
    published_by = EXCLUDED.published_by;

  -- Update staging status to published
  UPDATE page_version SET staging_status = 'published'
  WHERE page_id IN (
    SELECT entity_id FROM staging_dependency 
    WHERE staging_id = staging_id_param AND entity_type = 'page'
  );

  UPDATE block_version SET staging_status = 'published'
  WHERE block_id IN (
    SELECT entity_id FROM staging_dependency 
    WHERE staging_id = staging_id_param AND entity_type = 'block'
  );

  UPDATE menu_version SET staging_status = 'published'
  WHERE menu_id IN (
    SELECT entity_id FROM staging_dependency 
    WHERE staging_id = staging_id_param AND entity_type = 'menu'
  );

  UPDATE asset_version SET staging_status = 'published'
  WHERE asset_id IN (
    SELECT entity_id FROM staging_dependency 
    WHERE staging_id = staging_id_param AND entity_type = 'asset'
  );

  -- Clean up staging session
  DELETE FROM staging_dependency WHERE staging_id = staging_id_param;
  DELETE FROM site_staging WHERE id = staging_id_param;

  RETURN true;
END;
$$;

-- Create function to rollback staging
CREATE OR REPLACE FUNCTION rollback_staging(staging_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Reset staging status to draft
  UPDATE page_version SET staging_status = 'draft'
  WHERE page_id IN (
    SELECT entity_id FROM staging_dependency 
    WHERE staging_id = staging_id_param AND entity_type = 'page'
  );

  UPDATE block_version SET staging_status = 'draft'
  WHERE block_id IN (
    SELECT entity_id FROM staging_dependency 
    WHERE staging_id = staging_id_param AND entity_type = 'block'
  );

  UPDATE menu_version SET staging_status = 'draft'
  WHERE menu_id IN (
    SELECT entity_id FROM staging_dependency 
    WHERE staging_id = staging_id_param AND entity_type = 'menu'
  );

  UPDATE asset_version SET staging_status = 'draft'
  WHERE asset_id IN (
    SELECT entity_id FROM staging_dependency 
    WHERE staging_id = staging_id_param AND entity_type = 'asset'
  );

  -- Clean up staging session
  DELETE FROM staging_dependency WHERE staging_id = staging_id_param;
  DELETE FROM site_staging WHERE id = staging_id_param;

  RETURN true;
END;
$$;

-- Create function to get staging dependencies
CREATE OR REPLACE FUNCTION get_staging_dependencies(staging_id_param uuid)
RETURNS TABLE (
  entity_type text,
  entity_id uuid,
  version int,
  dependency_type text,
  dependency_entity_type text,
  dependency_entity_id uuid,
  dependency_version int
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sd.entity_type,
    sd.entity_id,
    sd.version,
    sd.dependency_type,
    sd.dependency_entity_type,
    sd.dependency_entity_id,
    sd.dependency_version
  FROM staging_dependency sd
  WHERE sd.staging_id = staging_id_param
  ORDER BY sd.entity_type, sd.entity_id;
END;
$$;
