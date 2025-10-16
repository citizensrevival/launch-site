-- CMS Core Schema Migration
-- This migration creates the complete CMS database schema

-- Enable required extensions
create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

-- Multi-tenant site table
create table if not exists site (
  id uuid primary key default gen_random_uuid(),
  handle text unique not null,
  label text not null,
  default_locale text not null default 'en-US',
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
create index if not exists idx_menu_site on menu(site_id);
create index if not exists idx_menu_ver_menu on menu_version(menu_id);
