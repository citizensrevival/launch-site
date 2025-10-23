-- Cleanup Old Schema Objects
-- This migration removes old, unused database objects that have been replaced by the new properly named schema

-- Drop old tables (in reverse dependency order)
DROP TABLE IF EXISTS public.asset_usage CASCADE;
DROP TABLE IF EXISTS public.cms_audit_log CASCADE;
DROP TABLE IF EXISTS public.user_permissions CASCADE;
DROP TABLE IF EXISTS public.asset_variant CASCADE;
DROP TABLE IF EXISTS public.asset_publish CASCADE;
DROP TABLE IF EXISTS public.asset_version CASCADE;
DROP TABLE IF EXISTS public.asset CASCADE;
DROP TABLE IF EXISTS public.menu_publish CASCADE;
DROP TABLE IF EXISTS public.menu_version CASCADE;
DROP TABLE IF EXISTS public.menu CASCADE;
DROP TABLE IF EXISTS public.block_publish CASCADE;
DROP TABLE IF EXISTS public.block_version CASCADE;
DROP TABLE IF EXISTS public.block CASCADE;
DROP TABLE IF EXISTS public.page_publish CASCADE;
DROP TABLE IF EXISTS public.page_version CASCADE;
DROP TABLE IF EXISTS public.page CASCADE;
DROP TABLE IF EXISTS public.site CASCADE;

-- Drop old analytics tables (replaced by analytics_* tables)
DROP TABLE IF EXISTS public.excluded_users CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.pageviews CASCADE;
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop old leads table (replaced by leads_submissions)
DROP TABLE IF EXISTS public.leads CASCADE;

-- Drop old admins table (replaced by system_user_permissions)
DROP TABLE IF EXISTS public.admins CASCADE;

-- Drop old enums that are no longer used
DROP TYPE IF EXISTS public.lead_type CASCADE;
DROP TYPE IF EXISTS public.publish_status CASCADE;
DROP TYPE IF EXISTS public.asset_kind CASCADE;

-- Drop old functions that are no longer used
DROP FUNCTION IF EXISTS public.has_permission(uuid, text) CASCADE;

-- Note: The new schema uses properly prefixed tables:
-- - analytics_* tables for analytics data
-- - leads_* tables for lead management
-- - system_* tables for system administration
-- - cms_* tables for content management
-- - All tables have proper RLS policies and indexes
