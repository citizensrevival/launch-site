-- Remove redundant status column from menu_version table
-- The status is tracked via the menu_publish table instead

-- First drop the policy that depends on the status column
DROP POLICY IF EXISTS "read_published_menus" ON menu_version;

-- Then drop the status column
ALTER TABLE menu_version DROP COLUMN IF EXISTS status;
