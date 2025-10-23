-- Create Properly Named Schema
-- This migration creates a new schema with properly prefixed objects for better organization

-- Create analytics tables
CREATE TABLE analytics_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  properties jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE analytics_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES analytics_users(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  duration_ms integer,
  page_count integer DEFAULT 0,
  event_count integer DEFAULT 0,
  properties jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE analytics_pageviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  user_id uuid REFERENCES analytics_users(id) ON DELETE CASCADE,
  page_path text NOT NULL,
  page_title text,
  referrer text,
  user_agent text,
  viewport_width integer,
  viewport_height integer,
  timestamp timestamptz NOT NULL DEFAULT now(),
  duration_ms integer,
  properties jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  user_id uuid REFERENCES analytics_users(id) ON DELETE CASCADE,
  event_name text NOT NULL,
  event_category text,
  event_value numeric,
  properties jsonb DEFAULT '{}',
  timestamp timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE analytics_excluded_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create leads tables
CREATE TABLE leads_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_name text NOT NULL,
  form_data jsonb NOT NULL DEFAULT '{}',
  ip_address inet,
  user_agent text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create system tables
CREATE TABLE system_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  domain text NOT NULL,
  settings jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE system_user_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  permissions text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE system_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create CMS tables
CREATE TABLE cms_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES system_sites(id) ON DELETE CASCADE,
  slug text NOT NULL,
  system_key text,
  is_system boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(site_id, slug)
);

CREATE TABLE cms_page_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid REFERENCES cms_pages(id) ON DELETE CASCADE,
  version integer NOT NULL,
  title jsonb NOT NULL DEFAULT '{}',
  layout_variant text,
  seo jsonb DEFAULT '{}',
  nav_hints jsonb DEFAULT '{}',
  slots jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  UNIQUE(page_id, version)
);

CREATE TABLE cms_page_publishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid REFERENCES cms_pages(id) ON DELETE CASCADE,
  version integer NOT NULL,
  published_at timestamptz NOT NULL DEFAULT now(),
  published_by uuid,
  UNIQUE(page_id)
);

CREATE TABLE cms_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES system_sites(id) ON DELETE CASCADE,
  type text NOT NULL,
  tag text,
  system_key text,
  is_system boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE cms_block_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id uuid REFERENCES cms_blocks(id) ON DELETE CASCADE,
  version integer NOT NULL,
  layout_variant text,
  content jsonb DEFAULT '{}',
  assets jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  UNIQUE(block_id, version)
);

CREATE TABLE cms_block_publishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id uuid REFERENCES cms_blocks(id) ON DELETE CASCADE,
  version integer NOT NULL,
  published_at timestamptz NOT NULL DEFAULT now(),
  published_by uuid,
  UNIQUE(block_id)
);

CREATE TABLE cms_menus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES system_sites(id) ON DELETE CASCADE,
  handle text NOT NULL,
  label text NOT NULL,
  system_key text,
  is_system boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(site_id, handle)
);

CREATE TABLE cms_menu_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id uuid REFERENCES cms_menus(id) ON DELETE CASCADE,
  version integer NOT NULL,
  items jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  UNIQUE(menu_id, version)
);

CREATE TABLE cms_menu_publishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id uuid REFERENCES cms_menus(id) ON DELETE CASCADE,
  version integer NOT NULL,
  published_at timestamptz NOT NULL DEFAULT now(),
  published_by uuid,
  UNIQUE(menu_id)
);

CREATE TABLE cms_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES system_sites(id) ON DELETE CASCADE,
  kind text NOT NULL,
  storage_key text NOT NULL,
  width integer,
  height integer,
  duration_ms integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE cms_asset_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES cms_assets(id) ON DELETE CASCADE,
  version integer NOT NULL,
  meta jsonb DEFAULT '{}',
  edit_operation jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  UNIQUE(asset_id, version)
);

CREATE TABLE cms_asset_publishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES cms_assets(id) ON DELETE CASCADE,
  version integer NOT NULL,
  published_at timestamptz NOT NULL DEFAULT now(),
  published_by uuid,
  UNIQUE(asset_id)
);

CREATE TABLE cms_asset_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES cms_assets(id) ON DELETE CASCADE,
  variant_name text NOT NULL,
  storage_key text NOT NULL,
  width integer,
  height integer,
  file_size integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(asset_id, variant_name)
);

CREATE TABLE cms_asset_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES cms_assets(id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  role text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(asset_id, entity_type, entity_id, role)
);

-- Create indexes for performance
CREATE INDEX idx_analytics_users_user_id ON analytics_users(user_id);
CREATE INDEX idx_analytics_sessions_user_id ON analytics_sessions(user_id);
CREATE INDEX idx_analytics_sessions_session_id ON analytics_sessions(session_id);
CREATE INDEX idx_analytics_pageviews_session_id ON analytics_pageviews(session_id);
CREATE INDEX idx_analytics_pageviews_user_id ON analytics_pageviews(user_id);
CREATE INDEX idx_analytics_pageviews_timestamp ON analytics_pageviews(timestamp);
CREATE INDEX idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp);

CREATE INDEX idx_leads_submissions_form_name ON leads_submissions(form_name);
CREATE INDEX idx_leads_submissions_created_at ON leads_submissions(created_at);

CREATE INDEX idx_system_user_permissions_user_id ON system_user_permissions(user_id);
CREATE INDEX idx_system_audit_log_user_id ON system_audit_log(user_id);
CREATE INDEX idx_system_audit_log_entity_type ON system_audit_log(entity_type);
CREATE INDEX idx_system_audit_log_created_at ON system_audit_log(created_at);

CREATE INDEX idx_cms_pages_site_id ON cms_pages(site_id);
CREATE INDEX idx_cms_pages_slug ON cms_pages(slug);
CREATE INDEX idx_cms_page_versions_page_id ON cms_page_versions(page_id);
CREATE INDEX idx_cms_page_publishes_page_id ON cms_page_publishes(page_id);

CREATE INDEX idx_cms_blocks_site_id ON cms_blocks(site_id);
CREATE INDEX idx_cms_blocks_type ON cms_blocks(type);
CREATE INDEX idx_cms_block_versions_block_id ON cms_block_versions(block_id);
CREATE INDEX idx_cms_block_publishes_block_id ON cms_block_publishes(block_id);

CREATE INDEX idx_cms_menus_site_id ON cms_menus(site_id);
CREATE INDEX idx_cms_menus_handle ON cms_menus(handle);
CREATE INDEX idx_cms_menu_versions_menu_id ON cms_menu_versions(menu_id);
CREATE INDEX idx_cms_menu_publishes_menu_id ON cms_menu_publishes(menu_id);

CREATE INDEX idx_cms_assets_site_id ON cms_assets(site_id);
CREATE INDEX idx_cms_assets_kind ON cms_assets(kind);
CREATE INDEX idx_cms_asset_versions_asset_id ON cms_asset_versions(asset_id);
CREATE INDEX idx_cms_asset_publishes_asset_id ON cms_asset_publishes(asset_id);
CREATE INDEX idx_cms_asset_variants_asset_id ON cms_asset_variants(asset_id);
CREATE INDEX idx_cms_asset_usage_asset_id ON cms_asset_usage(asset_id);
CREATE INDEX idx_cms_asset_usage_entity ON cms_asset_usage(entity_type, entity_id);

-- Enable RLS on all tables
ALTER TABLE analytics_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_pageviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_excluded_users ENABLE ROW LEVEL SECURITY;

ALTER TABLE leads_submissions ENABLE ROW LEVEL SECURITY;

ALTER TABLE system_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_audit_log ENABLE ROW LEVEL SECURITY;

ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_page_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_page_publishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_block_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_block_publishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_menu_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_menu_publishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_asset_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_asset_publishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_asset_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_asset_usage ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for authenticated users
-- Analytics policies
CREATE POLICY "analytics_users_allow_authenticated" ON analytics_users
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "analytics_sessions_allow_authenticated" ON analytics_sessions
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "analytics_pageviews_allow_authenticated" ON analytics_pageviews
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "analytics_events_allow_authenticated" ON analytics_events
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "analytics_excluded_users_allow_authenticated" ON analytics_excluded_users
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Leads policies
CREATE POLICY "leads_submissions_allow_authenticated" ON leads_submissions
  FOR ALL USING (auth.uid() IS NOT NULL);

-- System policies
CREATE POLICY "system_sites_allow_authenticated" ON system_sites
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "system_user_permissions_allow_authenticated" ON system_user_permissions
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "system_audit_log_allow_authenticated" ON system_audit_log
  FOR ALL USING (auth.uid() IS NOT NULL);

-- CMS policies
CREATE POLICY "cms_pages_allow_authenticated" ON cms_pages
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "cms_page_versions_allow_authenticated" ON cms_page_versions
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "cms_page_publishes_allow_authenticated" ON cms_page_publishes
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "cms_blocks_allow_authenticated" ON cms_blocks
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "cms_block_versions_allow_authenticated" ON cms_block_versions
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "cms_block_publishes_allow_authenticated" ON cms_block_publishes
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "cms_menus_allow_authenticated" ON cms_menus
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "cms_menu_versions_allow_authenticated" ON cms_menu_versions
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "cms_menu_publishes_allow_authenticated" ON cms_menu_publishes
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "cms_assets_allow_authenticated" ON cms_assets
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "cms_asset_versions_allow_authenticated" ON cms_asset_versions
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "cms_asset_publishes_allow_authenticated" ON cms_asset_publishes
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "cms_asset_variants_allow_authenticated" ON cms_asset_variants
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "cms_asset_usage_allow_authenticated" ON cms_asset_usage
  FOR ALL USING (auth.uid() IS NOT NULL);
