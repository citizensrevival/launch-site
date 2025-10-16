-- Consolidated CMS Schema Migration
-- This migration creates the complete CMS database schema in one go

-- Enable required extensions
create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

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

-- Update trigger for site
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin 
  new.updated_at = now(); 
  return new; 
end $$;

create trigger trg_site_updated before update on site
for each row execute function touch_updated_at();

-- Common enums
do $$ begin
  create type publish_status as enum ('draft','published','archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type asset_kind as enum ('image','video','file');
exception when duplicate_object then null; end $$;

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

-- Indexes for performance
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

-- Enable RLS on all tables
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
