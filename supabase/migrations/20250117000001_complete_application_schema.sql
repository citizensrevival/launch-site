-- Complete Application Schema Migration
-- This migration creates the entire application database schema in one go
-- Includes: leads, admins, analytics, CMS, and all supporting tables

-- Enable required extensions
create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

-- Grant schema access
grant usage on schema public to anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- Core Application Enums
-- ─────────────────────────────────────────────────────────────────────────────
do $$ begin
  create type lead_type as enum ('subscriber', 'vendor', 'sponsor', 'volunteer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type publish_status as enum ('draft','published','archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type asset_kind as enum ('image','video','file');
exception when duplicate_object then null; end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Core Application Tables
-- ─────────────────────────────────────────────────────────────────────────────

-- Leads table (single table for all forms)
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  lead_kind lead_type not null,                 -- subscriber | vendor | sponsor | volunteer
  business_name text,                           -- vendors/sponsors
  contact_name text,                             -- vendors/sponsors/volunteers
  email text not null check (position('@' in email) > 1),
  phone text,                                    -- optional, any audience
  website text,
  social_links text[] default '{}',              -- zero-or-more
  source_path text,                              -- page/path the form was submitted from
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Admins table
create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Analytics Schema
-- ─────────────────────────────────────────────────────────────────────────────

-- Create analytics schema
create schema if not exists analytics;

-- Page views table
create table if not exists analytics.page_views (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  user_id uuid,
  anon_id text,
  page_path text not null,
  page_title text,
  referrer text,
  user_agent text,
  ip_address inet,
  country text,
  city text,
  device_type text,
  browser text,
  os text,
  created_at timestamptz not null default now()
);

-- Events table
create table if not exists analytics.events (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  user_id uuid,
  anon_id text,
  event_name text not null,
  event_properties jsonb default '{}',
  page_path text,
  created_at timestamptz not null default now()
);

-- Sessions table
create table if not exists analytics.sessions (
  id text primary key,
  user_id uuid,
  anon_id text,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_seconds integer,
  page_views integer default 0,
  events integer default 0,
  country text,
  city text,
  device_type text,
  browser text,
  os text
);

-- Excluded users table
create table if not exists analytics.excluded_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  session_id text,
  ip_address inet,
  anon_id text,
  excluded_at timestamptz not null default now(),
  reason text
);

-- ─────────────────────────────────────────────────────────────────────────────
-- CMS Schema
-- ─────────────────────────────────────────────────────────────────────────────

-- Multi-tenant site table
create table if not exists site (
  id uuid primary key default gen_random_uuid(),
  handle text unique not null,
  label text not null,
  default_locale text not null default 'en-US',
  slug text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

-- Update trigger function
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin 
  new.updated_at = now(); 
  return new; 
end $$;

create trigger trg_site_updated before update on site
for each row execute function touch_updated_at();

-- PAGES
create table if not exists page (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references site(id) on delete cascade,
  slug text not null,
  is_system boolean default false,
  system_key text unique,
  unique (site_id, slug)
);

create table if not exists page_version (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references page(id) on delete cascade,
  version int not null,
  title jsonb not null, -- i18n: {"en-US": "About Us", "es-MX": "Acerca de"}
  layout_variant text, -- optional: user-selectable page layout
  seo jsonb not null default '{}'::jsonb, -- i18n: {"en-US": {...}, "es-MX": {...}}
  nav_hints jsonb not null default '{}'::jsonb, -- i18n: {"en-US": {...}, "es-MX": {...}}
  slots jsonb not null default '[]'::jsonb,
  status publish_status not null default 'draft',
  created_at timestamptz not null default now(),
  created_by uuid not null,
  updated_by uuid,
  updated_at timestamptz,
  unique (page_id, version)
);

create table if not exists page_publish (
  page_id uuid not null references page(id) on delete cascade,
  version int not null,
  published_at timestamptz not null default now(),
  published_by uuid not null,
  primary key (page_id)
);

-- BLOCKS (reusable)
create table if not exists block (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references site(id) on delete cascade,
  type text not null,
  tag text,
  is_system boolean default false,
  system_key text unique
);

create table if not exists block_version (
  id uuid primary key default gen_random_uuid(),
  block_id uuid not null references block(id) on delete cascade,
  version int not null,
  layout_variant text not null,
  content jsonb not null, -- i18n: {"en-US": {...}, "es-MX": {...}}
  assets jsonb not null default '[]'::jsonb,
  status publish_status not null default 'draft',
  created_at timestamptz not null default now(),
  created_by uuid not null,
  updated_by uuid,
  updated_at timestamptz,
  unique (block_id, version)
);

create table if not exists block_publish (
  block_id uuid not null references block(id) on delete cascade,
  version int not null,
  published_at timestamptz not null default now(),
  published_by uuid not null,
  primary key (block_id)
);

-- MENUS
create table if not exists menu (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references site(id) on delete cascade,
  handle text not null,
  label text not null,
  is_system boolean default false,
  system_key text unique,
  unique (site_id, handle)
);

create table if not exists menu_version (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid not null references menu(id) on delete cascade,
  version int not null,
  items jsonb not null default '[]'::jsonb, -- i18n: {"en-US": [...], "es-MX": [...]}
  status publish_status not null default 'draft',
  created_at timestamptz not null default now(),
  created_by uuid not null,
  updated_by uuid,
  updated_at timestamptz,
  unique (menu_id, version)
);

create table if not exists menu_publish (
  menu_id uuid not null references menu(id) on delete cascade,
  version int not null,
  published_at timestamptz not null default now(),
  published_by uuid not null,
  primary key (menu_id)
);

-- ASSETS
create table if not exists asset (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references site(id) on delete cascade,
  kind asset_kind not null,
  storage_key text not null,
  width int, height int, duration_ms int,
  checksum text,
  is_system boolean default false,
  system_key text unique,
  created_at timestamptz not null default now(),
  created_by uuid not null
);

create table if not exists asset_version (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references asset(id) on delete cascade,
  version int not null,
  meta jsonb not null default '{}'::jsonb,
  edit_operation jsonb, -- { operation: 'crop|resize|rotate', params: {...} }
  status publish_status not null default 'draft',
  created_at timestamptz not null default now(),
  created_by uuid not null,
  updated_by uuid,
  updated_at timestamptz,
  unique (asset_id, version)
);

create table if not exists asset_publish (
  asset_id uuid not null references asset(id) on delete cascade,
  version int not null,
  published_at timestamptz not null default now(),
  published_by uuid not null,
  primary key (asset_id)
);

-- ASSET VARIANTS
create table if not exists asset_variant (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references asset(id) on delete cascade,
  variant_name text not null, -- 'thumbnail', 'small', 'medium', 'large'
  storage_key text not null,
  width int, height int,
  file_size int,
  created_at timestamptz not null default now(),
  unique (asset_id, variant_name)
);

-- USER PERMISSIONS
create table if not exists user_permissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  permissions text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_user_permissions_updated before update on user_permissions
for each row execute function touch_updated_at();

-- AUDIT LOG
create table if not exists cms_audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  user_permissions text[] not null,
  action text not null, -- 'create', 'update', 'publish', 'unpublish', 'delete', 'rollback'
  entity_type text not null, -- 'page', 'block', 'menu', 'asset'
  entity_id uuid not null,
  version int,
  changes jsonb,
  occurred_at timestamptz not null default now()
);

-- OPTIONAL USAGE TRACKING
create table if not exists asset_usage (
  site_id uuid not null references site(id) on delete cascade,
  asset_id uuid not null references asset(id) on delete cascade,
  used_by_type text not null,
  used_by_id uuid not null,
  primary key (asset_id, used_by_type, used_by_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Analytics Functions and Views
-- ─────────────────────────────────────────────────────────────────────────────

-- Function to get analytics data with exclusions
create or replace function analytics.get_analytics_data(
  start_date timestamptz default (now() - interval '30 days'),
  end_date timestamptz default now()
)
returns table (
  total_page_views bigint,
  unique_visitors bigint,
  total_sessions bigint,
  avg_session_duration numeric,
  top_pages jsonb,
  device_breakdown jsonb,
  country_breakdown jsonb
) language plpgsql as $$
begin
  return query
  with excluded_sessions as (
    select distinct session_id 
    from analytics.excluded_users 
    where session_id is not null
  ),
  filtered_page_views as (
    select pv.*
    from analytics.page_views pv
    where pv.created_at >= start_date 
      and pv.created_at <= end_date
      and pv.session_id not in (select session_id from excluded_sessions)
      and (pv.user_id is null or pv.user_id not in (select user_id from analytics.excluded_users where user_id is not null))
      and (pv.anon_id is null or pv.anon_id not in (select anon_id from analytics.excluded_users where anon_id is not null))
      and (pv.ip_address is null or pv.ip_address not in (select ip_address from analytics.excluded_users where ip_address is not null))
  ),
  filtered_sessions as (
    select s.*
    from analytics.sessions s
    where s.started_at >= start_date 
      and s.started_at <= end_date
      and s.id not in (select session_id from excluded_sessions)
      and (s.user_id is null or s.user_id not in (select user_id from analytics.excluded_users where user_id is not null))
      and (s.anon_id is null or s.anon_id not in (select anon_id from analytics.excluded_users where anon_id is not null))
  )
  select 
    (select count(*) from filtered_page_views)::bigint as total_page_views,
    (select count(distinct coalesce(user_id::text, anon_id)) from filtered_page_views)::bigint as unique_visitors,
    (select count(*) from filtered_sessions)::bigint as total_sessions,
    (select avg(duration_seconds) from filtered_sessions where duration_seconds is not null) as avg_session_duration,
    (select jsonb_agg(jsonb_build_object('page', page_path, 'views', views)) 
     from (
       select page_path, count(*) as views 
       from filtered_page_views 
       group by page_path 
       order by views desc 
       limit 10
     ) top_pages) as top_pages,
    (select jsonb_agg(jsonb_build_object('device', device_type, 'count', device_count)) 
     from (
       select device_type, count(*) as device_count 
       from filtered_sessions 
       where device_type is not null
       group by device_type
     ) device_stats) as device_breakdown,
    (select jsonb_agg(jsonb_build_object('country', country, 'count', country_count)) 
     from (
       select country, count(*) as country_count 
       from filtered_sessions 
       where country is not null
       group by country 
       order by country_count desc 
       limit 10
     ) country_stats) as country_breakdown;
end $$;

-- Function to track page view
create or replace function analytics.track_page_view(
  p_session_id text,
  p_page_path text,
  p_user_id uuid default null,
  p_anon_id text default null,
  p_page_title text default null,
  p_referrer text default null,
  p_user_agent text default null,
  p_ip_address inet default null,
  p_country text default null,
  p_city text default null,
  p_device_type text default null,
  p_browser text default null,
  p_os text default null
)
returns uuid language plpgsql as $$
declare
  view_id uuid;
begin
  -- Insert page view
  insert into analytics.page_views (
    session_id, user_id, anon_id, page_path, page_title, referrer, 
    user_agent, ip_address, country, city, device_type, browser, os
  ) values (
    p_session_id, p_user_id, p_anon_id, p_page_path, p_page_title, p_referrer,
    p_user_agent, p_ip_address, p_country, p_city, p_device_type, p_browser, p_os
  ) returning id into view_id;
  
  -- Update or create session
  insert into analytics.sessions (id, user_id, anon_id, page_views, country, city, device_type, browser, os)
  values (p_session_id, p_user_id, p_anon_id, 1, p_country, p_city, p_device_type, p_browser, p_os)
  on conflict (id) do update set
    page_views = sessions.page_views + 1,
    ended_at = now(),
    duration_seconds = extract(epoch from (now() - sessions.started_at))::integer;
  
  return view_id;
end $$;

-- Function to track event
create or replace function analytics.track_event(
  p_session_id text,
  p_event_name text,
  p_user_id uuid default null,
  p_anon_id text default null,
  p_event_properties jsonb default '{}',
  p_page_path text default null
)
returns uuid language plpgsql as $$
declare
  event_id uuid;
begin
  -- Insert event
  insert into analytics.events (
    session_id, user_id, anon_id, event_name, event_properties, page_path
  ) values (
    p_session_id, p_user_id, p_anon_id, p_event_name, p_event_properties, p_page_path
  ) returning id into event_id;
  
  -- Update session event count
  update analytics.sessions 
  set events = events + 1,
      ended_at = now(),
      duration_seconds = extract(epoch from (now() - started_at))::integer
  where id = p_session_id;
  
  return event_id;
end $$;

-- Function to upsert lead
create or replace function upsert_lead(
  p_lead_kind lead_type,
  p_email text,
  p_business_name text default null,
  p_contact_name text default null,
  p_phone text default null,
  p_website text default null,
  p_social_links text[] default '{}',
  p_source_path text default null
)
returns uuid language plpgsql as $$
declare
  lead_id uuid;
begin
  insert into public.leads (
    lead_kind, business_name, contact_name, email, phone, website, social_links, source_path
  ) values (
    p_lead_kind, p_business_name, p_contact_name, p_email, p_phone, p_website, p_social_links, p_source_path
  )
  on conflict (email, lead_kind) do update set
    business_name = excluded.business_name,
    contact_name = excluded.contact_name,
    phone = excluded.phone,
    website = excluded.website,
    social_links = excluded.social_links,
    source_path = excluded.source_path,
    updated_at = now()
  returning id into lead_id;
  
  return lead_id;
end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Indexes for Performance
-- ─────────────────────────────────────────────────────────────────────────────

-- Core application indexes
create index if not exists idx_leads_email on public.leads(email);
create index if not exists idx_leads_lead_kind on public.leads(lead_kind);
create index if not exists idx_leads_created_at on public.leads(created_at);

-- Analytics indexes
create index if not exists idx_page_views_session_id on analytics.page_views(session_id);
create index if not exists idx_page_views_user_id on analytics.page_views(user_id);
create index if not exists idx_page_views_created_at on analytics.page_views(created_at);
create index if not exists idx_page_views_page_path on analytics.page_views(page_path);

create index if not exists idx_events_session_id on analytics.events(session_id);
create index if not exists idx_events_user_id on analytics.events(user_id);
create index if not exists idx_events_created_at on analytics.events(created_at);
create index if not exists idx_events_event_name on analytics.events(event_name);

create index if not exists idx_sessions_user_id on analytics.sessions(user_id);
create index if not exists idx_sessions_started_at on analytics.sessions(started_at);

create index if not exists idx_excluded_users_user_id on analytics.excluded_users(user_id);
create index if not exists idx_excluded_users_session_id on analytics.excluded_users(session_id);
create index if not exists idx_excluded_users_ip_address on analytics.excluded_users(ip_address);
create index if not exists idx_excluded_users_anon_id on analytics.excluded_users(anon_id);
create index if not exists idx_excluded_users_excluded_at on analytics.excluded_users(excluded_at);

-- CMS indexes
create index if not exists idx_page_site_slug on page(site_id, slug);
create index if not exists idx_page_ver_page on page_version(page_id);
create index if not exists idx_block_site on block(site_id);
create index if not exists idx_block_ver_block on block_version(block_id);
create index if not exists idx_asset_site on asset(site_id);
create index if not exists idx_asset_ver_asset on asset_version(asset_id);
create index if not exists idx_asset_variant_asset on asset_variant(asset_id);
create index if not exists idx_menu_site on menu(site_id);
create index if not exists idx_menu_ver_menu on menu_version(menu_id);
create index if not exists idx_audit_log_user on cms_audit_log(user_id);
create index if not exists idx_audit_log_entity on cms_audit_log(entity_type, entity_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security (RLS) Policies
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable RLS on all tables
alter table public.leads enable row level security;
alter table public.admins enable row level security;
alter table analytics.page_views enable row level security;
alter table analytics.events enable row level security;
alter table analytics.sessions enable row level security;
alter table analytics.excluded_users enable row level security;
alter table site enable row level security;
alter table page enable row level security;
alter table page_version enable row level security;
alter table page_publish enable row level security;
alter table block enable row level security;
alter table block_version enable row level security;
alter table block_publish enable row level security;
alter table menu enable row level security;
alter table menu_version enable row level security;
alter table menu_publish enable row level security;
alter table asset enable row level security;
alter table asset_version enable row level security;
alter table asset_publish enable row level security;
alter table asset_variant enable row level security;
alter table user_permissions enable row level security;
alter table cms_audit_log enable row level security;

-- Permission checking function
create or replace function has_permission(user_id uuid, permission text)
returns boolean language plpgsql as $$
begin
  return exists (
    select 1 from user_permissions 
    where user_permissions.user_id = has_permission.user_id 
    and permission = any(user_permissions.permissions)
  );
end $$;

-- Leads policies
create policy "public can insert leads" on public.leads
  for insert with check (true);

create policy "only admins can select leads" on public.leads
  for select using (
    exists (select 1 from public.admins where user_id = auth.uid())
  );

create policy "admins can update leads" on public.leads
  for update using (
    exists (select 1 from public.admins where user_id = auth.uid())
  );

create policy "admins can delete leads" on public.leads
  for delete using (
    exists (select 1 from public.admins where user_id = auth.uid())
  );

-- Admins policies
create policy "self can select own admin row" on public.admins
  for select using (user_id = auth.uid());

-- Analytics policies (admin only)
create policy "admins can view analytics" on analytics.page_views
  for select using (
    exists (select 1 from public.admins where user_id = auth.uid())
  );

create policy "admins can view analytics events" on analytics.events
  for select using (
    exists (select 1 from public.admins where user_id = auth.uid())
  );

create policy "admins can view analytics sessions" on analytics.sessions
  for select using (
    exists (select 1 from public.admins where user_id = auth.uid())
  );

create policy "admins can manage excluded users" on analytics.excluded_users
  for all using (
    exists (select 1 from public.admins where user_id = auth.uid())
  );

-- Public read access to published content
create policy "read_published_pages" on page_version
  for select using (status = 'published');

create policy "read_published_blocks" on block_version
  for select using (status = 'published');

create policy "read_published_assets" on asset_version
  for select using (status = 'published');

create policy "read_published_menus" on menu_version
  for select using (status = 'published');

create policy "read_published_asset_variants" on asset_variant
  for select using (
    exists (
      select 1 from asset_version av 
      where av.asset_id = asset_variant.asset_id 
      and av.status = 'published'
    )
  );

-- Permission-based write access for pages
create policy "cms_pages_write" on page_version
  for insert with check (has_permission(auth.uid(), 'cms.pages.write'));

create policy "cms_pages_update" on page_version
  for update using (has_permission(auth.uid(), 'cms.pages.write'));

create policy "cms_pages_publish" on page_publish
  for insert with check (has_permission(auth.uid(), 'cms.pages.publish'));

create policy "cms_pages_unpublish" on page_publish
  for delete using (has_permission(auth.uid(), 'cms.pages.publish'));

-- Permission-based write access for blocks
create policy "cms_blocks_write" on block_version
  for insert with check (has_permission(auth.uid(), 'cms.blocks.write'));

create policy "cms_blocks_update" on block_version
  for update using (has_permission(auth.uid(), 'cms.blocks.write'));

create policy "cms_blocks_publish" on block_publish
  for insert with check (has_permission(auth.uid(), 'cms.blocks.publish'));

create policy "cms_blocks_unpublish" on block_publish
  for delete using (has_permission(auth.uid(), 'cms.blocks.publish'));

-- Permission-based write access for menus
create policy "cms_menus_write" on menu_version
  for insert with check (has_permission(auth.uid(), 'cms.menus.write'));

create policy "cms_menus_update" on menu_version
  for update using (has_permission(auth.uid(), 'cms.menus.write'));

create policy "cms_menus_publish" on menu_publish
  for insert with check (has_permission(auth.uid(), 'cms.menus.publish'));

create policy "cms_menus_unpublish" on menu_publish
  for delete using (has_permission(auth.uid(), 'cms.menus.publish'));

-- Permission-based write access for assets
create policy "cms_assets_write" on asset_version
  for insert with check (has_permission(auth.uid(), 'cms.assets.write'));

create policy "cms_assets_update" on asset_version
  for update using (has_permission(auth.uid(), 'cms.assets.write'));

create policy "cms_assets_publish" on asset_publish
  for insert with check (has_permission(auth.uid(), 'cms.assets.publish'));

create policy "cms_assets_unpublish" on asset_publish
  for delete using (has_permission(auth.uid(), 'cms.assets.publish'));

-- Protect system content from deletion
create policy "cannot_delete_system_content" on page
  for delete using (
    not is_system or has_permission(auth.uid(), 'system.admin')
  );

create policy "cannot_delete_system_blocks" on block
  for delete using (
    not is_system or has_permission(auth.uid(), 'system.admin')
  );

create policy "cannot_delete_system_menus" on menu
  for delete using (
    not is_system or has_permission(auth.uid(), 'system.admin')
  );

create policy "cannot_delete_system_assets" on asset
  for delete using (
    not is_system or has_permission(auth.uid(), 'system.admin')
  );

-- User permissions management
create policy "manage_user_permissions" on user_permissions
  for all using (has_permission(auth.uid(), 'users.manage'));

-- Audit log access
create policy "read_audit_log" on cms_audit_log
  for select using (has_permission(auth.uid(), 'system.admin'));

-- Site management
create policy "manage_sites" on site
  for all using (has_permission(auth.uid(), 'system.admin'));

-- Base table access (pages, blocks, menus, assets)
create policy "cms_pages_read" on page
  for select using (has_permission(auth.uid(), 'cms.pages.read'));

create policy "cms_blocks_read" on block
  for select using (has_permission(auth.uid(), 'cms.blocks.read'));

create policy "cms_menus_read" on menu
  for select using (has_permission(auth.uid(), 'cms.menus.read'));

create policy "cms_assets_read" on asset
  for select using (has_permission(auth.uid(), 'cms.assets.read'));

-- Asset table write policies
create policy "cms_assets_write" on asset
  for insert with check (has_permission(auth.uid(), 'cms.assets.write'));

create policy "cms_assets_update" on asset
  for update using (has_permission(auth.uid(), 'cms.assets.write'));

create policy "cms_assets_delete" on asset
  for delete using (has_permission(auth.uid(), 'cms.assets.write'));

-- Asset version read policies
create policy "cms_assets_read_versions" on asset_version
  for select using (has_permission(auth.uid(), 'cms.assets.read'));

-- Asset publish read policies
create policy "cms_assets_read_publish" on asset_publish
  for select using (has_permission(auth.uid(), 'cms.assets.read'));
