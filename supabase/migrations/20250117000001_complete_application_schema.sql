-- Complete Application Schema Migration
-- This migration creates the entire application database schema in one go
-- Includes: leads, admins, analytics, CMS, and all supporting tables

-- Enable required extensions
create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

-- Grant schema access
grant usage on schema public to anon, authenticated;

-- Grant table permissions
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;

-- Permission checking function
create or replace function has_permission(user_id uuid, permission text)
returns boolean
language plpgsql
security definer
as $$
begin
  -- Check if user has the specific permission
  return exists (
    select 1 
    from user_permissions 
    where user_permissions.user_id = has_permission.user_id 
    and permission = any(user_permissions.permissions)
  );
end;
$$;

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
-- Analytics Schema (Public Schema Tables)
-- ─────────────────────────────────────────────────────────────────────────────

-- Users table (analytics users, not auth users)
create table if not exists public.users (
  id                uuid primary key default gen_random_uuid(),
  anon_id           text unique not null,
  first_seen_at     timestamptz not null default now(),
  last_seen_at      timestamptz not null default now(),
  first_referrer    text,
  first_utm_source  text,
  first_utm_medium  text,
  first_utm_campaign text,
  last_referrer     text,
  last_utm_source   text,
  last_utm_medium   text,
  last_utm_campaign text,
  properties        jsonb not null default '{}'::jsonb,
  constraint users_anon_id_chk check (length(anon_id) > 0)
);

-- Sessions table
create table if not exists public.sessions (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.users(id) on delete cascade,
  started_at        timestamptz not null default now(),
  ended_at          timestamptz,
  landing_page      text,
  landing_path      text,
  referrer          text,
  utm_source        text,
  utm_medium        text,
  utm_campaign      text,
  utm_term          text,
  utm_content       text,
  user_agent        text,
  device_category   text,
  browser_name      text,
  os_name           text,
  is_bot            boolean not null default false,
  ip_address        inet,
  geo_country       text,
  geo_region        text,
  geo_city          text
);

-- Pageviews table
create table if not exists public.pageviews (
  id                uuid primary key default gen_random_uuid(),
  session_id        uuid not null references public.sessions(id) on delete cascade,
  user_id           uuid not null references public.users(id) on delete cascade,
  url               text not null,
  path              text not null,
  title             text,
  referrer          text,
  occurred_at       timestamptz not null default now()
);

-- Events table
create table if not exists public.events (
  id                uuid primary key default gen_random_uuid(),
  session_id        uuid not null references public.sessions(id) on delete cascade,
  user_id           uuid not null references public.users(id) on delete cascade,
  name              text not null,
  properties        jsonb not null default '{}'::jsonb,
  occurred_at       timestamptz not null default now()
);

-- Excluded users table
create table if not exists public.excluded_users (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid,
  session_id        uuid,
  ip_address        inet,
  anon_id           text,
  excluded_at       timestamptz not null default now(),
  reason            text
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
create or replace function public.get_analytics_data(
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
  with filtered_page_views as (
    select pv.*
    from public.v_analytics_pageviews pv
    where pv.occurred_at >= start_date 
      and pv.occurred_at <= end_date
  ),
  filtered_sessions as (
    select s.*
    from public.v_analytics_sessions s
    where s.started_at >= start_date 
      and s.started_at <= end_date
  )
  select 
    (select count(*) from filtered_page_views)::bigint as total_page_views,
    (select count(distinct user_id) from filtered_page_views)::bigint as unique_visitors,
    (select count(*) from filtered_sessions)::bigint as total_sessions,
    (select avg(extract(epoch from coalesce(ended_at, now()) - started_at)) from filtered_sessions) as avg_session_duration,
    (select jsonb_agg(jsonb_build_object('page', path, 'views', views)) 
     from (
       select path, count(*) as views 
       from filtered_page_views 
       group by path 
       order by views desc 
       limit 10
     ) top_pages) as top_pages,
    (select jsonb_agg(jsonb_build_object('device', device_category, 'count', device_count)) 
     from (
       select device_category, count(*) as device_count 
       from filtered_sessions 
       where device_category is not null
       group by device_category
     ) device_stats) as device_breakdown,
    (select jsonb_agg(jsonb_build_object('country', geo_country, 'count', country_count)) 
     from (
       select geo_country, count(*) as country_count 
       from filtered_sessions 
       where geo_country is not null
       group by geo_country 
       order by country_count desc 
       limit 10
     ) country_stats) as country_breakdown;
end $$;

-- Function to track page view
create or replace function public.track_page_view(
  p_session_id uuid,
  p_user_id uuid,
  p_url text,
  p_path text,
  p_title text default null,
  p_referrer text default null
)
returns uuid language plpgsql as $$
declare
  view_id uuid;
begin
  -- Insert page view
  insert into public.pageviews (
    session_id, user_id, url, path, title, referrer
  ) values (
    p_session_id, p_user_id, p_url, p_path, p_title, p_referrer
  ) returning id into view_id;
  
  return view_id;
end $$;

-- Function to track event
create or replace function public.track_event(
  p_session_id uuid,
  p_user_id uuid,
  p_name text,
  p_properties jsonb default '{}'
)
returns uuid language plpgsql as $$
declare
  event_id uuid;
begin
  -- Insert event
  insert into public.events (
    session_id, user_id, name, properties
  ) values (
    p_session_id, p_user_id, p_name, p_properties
  ) returning id into event_id;
  
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
-- Analytics Views (Comprehensive Set)
-- ─────────────────────────────────────────────────────────────────────────────

-- Core filtered views (excluding excluded users)
create or replace view public.v_analytics_users as
select u.*
from public.users u
where not exists (
  select 1 from public.excluded_users eu
  where (eu.user_id = u.id or eu.anon_id = u.anon_id)
);

create or replace view public.v_analytics_sessions as
select s.*
from public.sessions s
where not exists (
  select 1 from public.excluded_users eu
  where (eu.user_id = s.user_id or eu.session_id = s.id or eu.ip_address = s.ip_address)
    or (eu.anon_id is not null and exists (
      select 1 from public.users u 
      where u.id = s.user_id and u.anon_id = eu.anon_id
    ))
);

create or replace view public.v_analytics_pageviews as
select pv.*
from public.pageviews pv
where not exists (
  select 1 from public.excluded_users eu
  where eu.user_id = pv.user_id
    or (eu.anon_id is not null and exists (
      select 1 from public.users u 
      where u.id = pv.user_id and u.anon_id = eu.anon_id
    ))
);

create or replace view public.v_analytics_events as
select ev.*
from public.events ev
where not exists (
  select 1 from public.excluded_users eu
  where eu.user_id = ev.user_id
    or (eu.anon_id is not null and exists (
      select 1 from public.users u 
      where u.id = ev.user_id and u.anon_id = eu.anon_id
    ))
);

-- Analytics overview views
create or replace view public.v_unique_users_daily as
with days as (
  select generate_series(
    date_trunc('day', (select min(first_seen_at) from public.v_analytics_users)),
    date_trunc('day', now()),
    interval '1 day'
  )::date as day
)
select
  d.day,
  count(distinct u.id) as unique_users
from days d
left join public.v_analytics_users u
  on date_trunc('day', u.first_seen_at) <= d.day
 and date_trunc('day', u.last_seen_at) >= d.day
group by d.day
order by d.day;

create or replace view public.v_sessions_summary as
select
  s.id as session_id,
  s.user_id,
  s.started_at,
  s.ended_at,
  extract(epoch from coalesce(s.ended_at, now()) - s.started_at)::bigint as duration_seconds,
  s.landing_page,
  s.landing_path,
  s.referrer,
  s.utm_source, s.utm_medium, s.utm_campaign, s.utm_term, s.utm_content,
  s.device_category, s.browser_name, s.os_name, s.is_bot,
  s.ip_address, s.geo_country, s.geo_region, s.geo_city,
  (select count(*) from public.v_analytics_pageviews pv where pv.session_id = s.id) as pageviews_count,
  (select count(*) from public.v_analytics_events ev where ev.session_id = s.id) as events_count
from public.v_analytics_sessions s;

create or replace view public.v_event_rollup_daily as
select
  date_trunc('day', occurred_at)::date as day,
  name,
  count(*)::bigint as event_count,
  count(distinct user_id)::bigint as unique_users
from public.v_analytics_events
group by 1, 2
order by 1, 2;

-- Users analytics views
create or replace view public.v_users_analytics as
select
  u.id,
  u.anon_id,
  u.first_seen_at,
  u.last_seen_at,
  u.first_referrer,
  u.last_referrer,
  u.first_utm_source,
  u.last_utm_source,
  u.properties,
  count(distinct s.id) as sessions,
  coalesce(avg(extract(epoch from coalesce(s.ended_at, now()) - s.started_at)), 0) as avg_duration,
  exists(
    select 1 from public.v_analytics_events ev 
    where ev.user_id = u.id and ev.name = 'lead_submitted'
  ) as has_lead,
  (select s2.device_category from public.v_analytics_sessions s2 
   where s2.user_id = u.id order by s2.started_at desc limit 1) as device_category,
  (select s2.browser_name from public.v_analytics_sessions s2 
   where s2.user_id = u.id order by s2.started_at desc limit 1) as browser_name,
  (select s2.os_name from public.v_analytics_sessions s2 
   where s2.user_id = u.id order by s2.started_at desc limit 1) as os_name,
  (select s2.geo_country from public.v_analytics_sessions s2 
   where s2.user_id = u.id order by s2.started_at desc limit 1) as geo_country,
  (select s2.geo_city from public.v_analytics_sessions s2 
   where s2.user_id = u.id order by s2.started_at desc limit 1) as geo_city
from public.v_analytics_users u
left join public.v_analytics_sessions s on s.user_id = u.id
group by u.id, u.anon_id, u.first_seen_at, u.last_seen_at, u.first_referrer, u.last_referrer, u.first_utm_source, u.last_utm_source, u.properties;

create or replace view public.v_new_users_daily as
select
  date_trunc('day', first_seen_at)::date as day,
  count(*)::bigint as new_users
from public.v_analytics_users
group by 1
order by 1;

create or replace view public.v_new_vs_returning_users as
with user_stats as (
  select
    u.id,
    u.first_seen_at,
    u.last_seen_at,
    case 
      when date_trunc('day', u.first_seen_at) = date_trunc('day', u.last_seen_at) then 'New'
      else 'Returning'
    end as user_type
  from public.v_analytics_users u
)
select
  user_type as type,
  count(*) as count
from user_stats
group by user_type;

-- Sessions analytics views
create or replace view public.v_sessions_per_user_distribution as
with user_session_counts as (
  select
    user_id,
    count(*) as session_count
  from public.v_analytics_sessions
  group by user_id
)
select
  session_count as sessions,
  count(*) as users
from user_session_counts
group by session_count
order by session_count;

create or replace view public.v_session_metrics as
select
  count(*) as total_sessions,
  avg(duration_seconds) as avg_duration,
  avg(pageviews_count) as avg_pageviews
from public.v_sessions_summary;

-- Events analytics views
create or replace view public.v_events_analytics as
select
  name,
  count(*) as count,
  count(distinct user_id) as unique_users,
  max(occurred_at) as last_occurred
from public.v_analytics_events
group by name
order by count desc;

create or replace view public.v_event_trends_daily as
select
  date_trunc('day', occurred_at)::date as day,
  name,
  count(*) as count
from public.v_analytics_events
group by 1, 2
order by 1, 2;

-- Page analytics views
create or replace view public.v_pageviews_daily as
select
  date_trunc('day', occurred_at)::date as day,
  count(*)::bigint as pageviews,
  count(distinct user_id)::bigint as unique_users
from public.v_analytics_pageviews
group by 1
order by 1;

create or replace view public.v_top_pages as
select
  path,
  count(*)::bigint as views,
  count(distinct user_id)::bigint as unique_users,
  max(occurred_at) as last_viewed
from public.v_analytics_pageviews
group by 1
order by views desc;

-- Referrer analytics views
create or replace view public.v_referrers_analytics as
with referrer_sessions as (
  select
    s.id as session_id,
    s.user_id,
    s.started_at,
    s.ended_at,
    s.referrer,
    case 
      when s.referrer is null or s.referrer = '' then 'direct'
      else split_part(split_part(s.referrer, '://', 2), '/', 1)
    end as domain,
    extract(epoch from coalesce(s.ended_at, now()) - s.started_at) as duration,
    ss.pageviews_count as pageviews
  from public.v_analytics_sessions s
  left join public.v_sessions_summary ss on ss.session_id = s.id
),
referrer_conversions as (
  select
    rs.domain,
    count(distinct rs.session_id) as total_sessions,
    count(distinct rs.user_id) as total_users,
    count(distinct case when ev.name = 'lead_submitted' then rs.session_id end) as conversions,
    avg(rs.duration) as avg_duration,
    avg(rs.pageviews) as avg_pageviews,
    max(rs.started_at) as last_seen
  from referrer_sessions rs
  left join public.v_analytics_events ev on ev.session_id = rs.session_id
  group by rs.domain
)
select
  domain,
  total_sessions,
  total_users,
  conversions,
  round(avg_duration::numeric) as avg_session_duration,
  round(avg_pageviews::numeric, 1) as pages_per_session,
  round((case when total_sessions > 0 then (total_sessions - avg_pageviews) / total_sessions * 100 else 0 end)::numeric, 1) as bounce_rate,
  last_seen,
  round((case when (select count(*) from referrer_sessions) > 0 then total_sessions::float / (select count(*) from referrer_sessions) * 100 else 0 end)::numeric, 1) as traffic_share
from referrer_conversions
order by total_sessions desc;

create or replace view public.v_referral_traffic_daily as
select
  date_trunc('day', s.started_at)::date as day,
  count(*) as referrals
from public.v_analytics_sessions s
where s.referrer is not null and s.referrer != ''
group by 1
order by 1;

-- Device analytics views
create or replace view public.v_device_breakdown as
select
  device_category,
  count(*)::bigint as sessions,
  count(distinct user_id)::bigint as unique_users
from public.v_analytics_sessions
group by 1
order by sessions desc;

create or replace view public.v_browser_breakdown as
select
  browser_name,
  count(*)::bigint as sessions,
  count(distinct user_id)::bigint as unique_users
from public.v_analytics_sessions
group by 1
order by sessions desc;

create or replace view public.v_os_breakdown as
select
  os_name,
  count(*)::bigint as sessions,
  count(distinct user_id)::bigint as unique_users
from public.v_analytics_sessions
group by 1
order by sessions desc;

-- Geographic analytics views
create or replace view public.v_country_breakdown as
select
  coalesce(geo_country, 'Unknown') as country,
  count(*)::bigint as sessions,
  count(distinct user_id)::bigint as unique_users
from public.v_analytics_sessions
group by 1
order by sessions desc;

create or replace view public.v_city_breakdown as
select
  coalesce(geo_city, 'Unknown') as city,
  coalesce(geo_country, 'Unknown') as country,
  count(*)::bigint as sessions,
  count(distinct user_id)::bigint as unique_users
from public.v_analytics_sessions
group by 1, 2
order by sessions desc;

-- ─────────────────────────────────────────────────────────────────────────────
-- Indexes for Performance
-- ─────────────────────────────────────────────────────────────────────────────

-- Core application indexes
create index if not exists idx_leads_email on public.leads(email);
create index if not exists idx_leads_lead_kind on public.leads(lead_kind);
create index if not exists idx_leads_created_at on public.leads(created_at);

-- Analytics indexes
create index if not exists idx_users_first_seen on public.users(first_seen_at);
create index if not exists idx_users_last_seen on public.users(last_seen_at);
create index if not exists idx_users_anon_id on public.users(anon_id);

create index if not exists idx_sessions_user_id on public.sessions(user_id);
create index if not exists idx_sessions_started_at on public.sessions(started_at);
create index if not exists idx_sessions_ended_at on public.sessions(ended_at);
create index if not exists idx_sessions_referrer on public.sessions(referrer);
create index if not exists idx_sessions_device_category on public.sessions(device_category);
create index if not exists idx_sessions_geo_country on public.sessions(geo_country);

create index if not exists idx_pageviews_session_id on public.pageviews(session_id);
create index if not exists idx_pageviews_user_id on public.pageviews(user_id);
create index if not exists idx_pageviews_occurred_at on public.pageviews(occurred_at);
create index if not exists idx_pageviews_path on public.pageviews(path);

create index if not exists idx_events_session_id on public.events(session_id);
create index if not exists idx_events_user_id on public.events(user_id);
create index if not exists idx_events_occurred_at on public.events(occurred_at);
create index if not exists idx_events_name on public.events(name);

create index if not exists idx_excluded_users_user_id on public.excluded_users(user_id);
create index if not exists idx_excluded_users_session_id on public.excluded_users(session_id);
create index if not exists idx_excluded_users_ip_address on public.excluded_users(ip_address);
create index if not exists idx_excluded_users_anon_id on public.excluded_users(anon_id);
create index if not exists idx_excluded_users_excluded_at on public.excluded_users(excluded_at);

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
alter table public.users enable row level security;
alter table public.sessions enable row level security;
alter table public.pageviews enable row level security;
alter table public.events enable row level security;
alter table public.excluded_users enable row level security;
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
create policy "admins can view analytics users" on public.users
  for select using (
    exists (select 1 from public.admins where user_id = auth.uid())
  );

create policy "admins can view analytics sessions" on public.sessions
  for select using (
    exists (select 1 from public.admins where user_id = auth.uid())
  );

create policy "admins can view analytics pageviews" on public.pageviews
  for select using (
    exists (select 1 from public.admins where user_id = auth.uid())
  );

create policy "admins can view analytics events" on public.events
  for select using (
    exists (select 1 from public.admins where user_id = auth.uid())
  );

create policy "admins can manage excluded users" on public.excluded_users
  for all using (
    exists (select 1 from public.admins where user_id = auth.uid())
  );

-- Public analytics tracking (allow inserts for tracking)
create policy "public can insert analytics users" on public.users
  for insert with check (true);

create policy "public can insert analytics sessions" on public.sessions
  for insert with check (true);

create policy "public can insert analytics pageviews" on public.pageviews
  for insert with check (true);

create policy "public can insert analytics events" on public.events
  for insert with check (true);

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

-- Allow authenticated users to read sites (needed for site selection)
create policy "read_sites" on site
  for select using (auth.role() = 'authenticated');

-- Storage policies for file uploads
-- Allow authenticated users to upload files to any bucket
create policy "storage_upload_policy" on storage.objects
  for insert with check (auth.role() = 'authenticated');

-- Allow authenticated users to read files from any bucket
create policy "storage_read_policy" on storage.objects
  for select using (auth.role() = 'authenticated');

-- Allow authenticated users to update files in any bucket
create policy "storage_update_policy" on storage.objects
  for update using (auth.role() = 'authenticated');

-- Allow authenticated users to delete files from any bucket
create policy "storage_delete_policy" on storage.objects
  for delete using (auth.role() = 'authenticated');

-- =============================================================================
-- COMPREHENSIVE CMS RLS POLICIES
-- =============================================================================

-- SITE TABLE POLICIES
-- Allow authenticated users to read sites (needed for site selection)
create policy "sites_read" on site
  for select using (auth.role() = 'authenticated');

-- Only system admins can manage sites
create policy "sites_manage" on site
  for all using (has_permission(auth.uid(), 'system.admin'));

-- PAGE TABLE POLICIES
-- Read pages (requires cms.pages.read permission)
create policy "pages_read" on page
  for select using (has_permission(auth.uid(), 'cms.pages.read'));

-- Create pages (requires cms.pages.write permission)
create policy "pages_create" on page
  for insert with check (has_permission(auth.uid(), 'cms.pages.write'));

-- Update pages (requires cms.pages.write permission)
create policy "pages_update" on page
  for update using (has_permission(auth.uid(), 'cms.pages.write'));

-- Delete pages (requires cms.pages.write permission, but not system pages)
create policy "pages_delete" on page
  for delete using (
    has_permission(auth.uid(), 'cms.pages.write') and 
    not is_system
  );

-- PAGE VERSION POLICIES
-- Read page versions (requires cms.pages.read permission)
create policy "page_versions_read" on page_version
  for select using (has_permission(auth.uid(), 'cms.pages.read'));

-- Create page versions (requires cms.pages.write permission)
create policy "page_versions_create" on page_version
  for insert with check (has_permission(auth.uid(), 'cms.pages.write'));

-- Update page versions (requires cms.pages.write permission)
create policy "page_versions_update" on page_version
  for update using (has_permission(auth.uid(), 'cms.pages.write'));

-- PAGE PUBLISH POLICIES
-- Read page publish records (requires cms.pages.read permission)
create policy "page_publish_read" on page_publish
  for select using (has_permission(auth.uid(), 'cms.pages.read'));

-- Publish pages (requires cms.pages.publish permission)
create policy "page_publish" on page_publish
  for insert with check (has_permission(auth.uid(), 'cms.pages.publish'));

-- Unpublish pages (requires cms.pages.publish permission)
create policy "page_unpublish" on page_publish
  for delete using (has_permission(auth.uid(), 'cms.pages.publish'));

-- BLOCK TABLE POLICIES
-- Read blocks (requires cms.blocks.read permission)
create policy "blocks_read" on block
  for select using (has_permission(auth.uid(), 'cms.blocks.read'));

-- Create blocks (requires cms.blocks.write permission)
create policy "blocks_create" on block
  for insert with check (has_permission(auth.uid(), 'cms.blocks.write'));

-- Update blocks (requires cms.blocks.write permission)
create policy "blocks_update" on block
  for update using (has_permission(auth.uid(), 'cms.blocks.write'));

-- Delete blocks (requires cms.blocks.write permission, but not system blocks)
create policy "blocks_delete" on block
  for delete using (
    has_permission(auth.uid(), 'cms.blocks.write') and 
    not is_system
  );

-- BLOCK VERSION POLICIES
-- Read block versions (requires cms.blocks.read permission)
create policy "block_versions_read" on block_version
  for select using (has_permission(auth.uid(), 'cms.blocks.read'));

-- Create block versions (requires cms.blocks.write permission)
create policy "block_versions_create" on block_version
  for insert with check (has_permission(auth.uid(), 'cms.blocks.write'));

-- Update block versions (requires cms.blocks.write permission)
create policy "block_versions_update" on block_version
  for update using (has_permission(auth.uid(), 'cms.blocks.write'));

-- BLOCK PUBLISH POLICIES
-- Read block publish records (requires cms.blocks.read permission)
create policy "block_publish_read" on block_publish
  for select using (has_permission(auth.uid(), 'cms.blocks.read'));

-- Publish blocks (requires cms.blocks.publish permission)
create policy "block_publish" on block_publish
  for insert with check (has_permission(auth.uid(), 'cms.blocks.publish'));

-- Unpublish blocks (requires cms.blocks.publish permission)
create policy "block_unpublish" on block_publish
  for delete using (has_permission(auth.uid(), 'cms.blocks.publish'));

-- MENU TABLE POLICIES
-- Read menus (requires cms.menus.read permission)
create policy "menus_read" on menu
  for select using (has_permission(auth.uid(), 'cms.menus.read'));

-- Create menus (requires cms.menus.write permission)
create policy "menus_create" on menu
  for insert with check (has_permission(auth.uid(), 'cms.menus.write'));

-- Update menus (requires cms.menus.write permission)
create policy "menus_update" on menu
  for update using (has_permission(auth.uid(), 'cms.menus.write'));

-- Delete menus (requires cms.menus.write permission, but not system menus)
create policy "menus_delete" on menu
  for delete using (
    has_permission(auth.uid(), 'cms.menus.write') and 
    not is_system
  );

-- MENU VERSION POLICIES
-- Read menu versions (requires cms.menus.read permission)
create policy "menu_versions_read" on menu_version
  for select using (has_permission(auth.uid(), 'cms.menus.read'));

-- Create menu versions (requires cms.menus.write permission)
create policy "menu_versions_create" on menu_version
  for insert with check (has_permission(auth.uid(), 'cms.menus.write'));

-- Update menu versions (requires cms.menus.write permission)
create policy "menu_versions_update" on menu_version
  for update using (has_permission(auth.uid(), 'cms.menus.write'));

-- MENU PUBLISH POLICIES
-- Read menu publish records (requires cms.menus.read permission)
create policy "menu_publish_read" on menu_publish
  for select using (has_permission(auth.uid(), 'cms.menus.read'));

-- Publish menus (requires cms.menus.publish permission)
create policy "menu_publish" on menu_publish
  for insert with check (has_permission(auth.uid(), 'cms.menus.publish'));

-- Unpublish menus (requires cms.menus.publish permission)
create policy "menu_unpublish" on menu_publish
  for delete using (has_permission(auth.uid(), 'cms.menus.publish'));

-- ASSET TABLE POLICIES
-- Read assets (requires cms.assets.read permission)
create policy "assets_read" on asset
  for select using (has_permission(auth.uid(), 'cms.assets.read'));

-- Create assets (requires cms.assets.write permission)
create policy "assets_create" on asset
  for insert with check (has_permission(auth.uid(), 'cms.assets.write'));

-- Update assets (requires cms.assets.write permission)
create policy "assets_update" on asset
  for update using (has_permission(auth.uid(), 'cms.assets.write'));

-- Delete assets (requires cms.assets.write permission, but not system assets)
create policy "assets_delete" on asset
  for delete using (
    has_permission(auth.uid(), 'cms.assets.write') and 
    not is_system
  );

-- ASSET VERSION POLICIES
-- Read asset versions (requires cms.assets.read permission)
create policy "asset_versions_read" on asset_version
  for select using (has_permission(auth.uid(), 'cms.assets.read'));

-- Create asset versions (requires cms.assets.write permission)
create policy "asset_versions_create" on asset_version
  for insert with check (has_permission(auth.uid(), 'cms.assets.write'));

-- Update asset versions (requires cms.assets.write permission)
create policy "asset_versions_update" on asset_version
  for update using (has_permission(auth.uid(), 'cms.assets.write'));

-- ASSET PUBLISH POLICIES
-- Read asset publish records (requires cms.assets.read permission)
create policy "asset_publish_read" on asset_publish
  for select using (has_permission(auth.uid(), 'cms.assets.read'));

-- Publish assets (requires cms.assets.publish permission)
create policy "asset_publish" on asset_publish
  for insert with check (has_permission(auth.uid(), 'cms.assets.publish'));

-- Unpublish assets (requires cms.assets.publish permission)
create policy "asset_unpublish" on asset_publish
  for delete using (has_permission(auth.uid(), 'cms.assets.publish'));

-- ASSET VARIANT POLICIES
-- Read asset variants (requires cms.assets.read permission)
create policy "asset_variants_read" on asset_variant
  for select using (has_permission(auth.uid(), 'cms.assets.read'));

-- Create asset variants (requires cms.assets.write permission)
create policy "asset_variants_create" on asset_variant
  for insert with check (has_permission(auth.uid(), 'cms.assets.write'));

-- Update asset variants (requires cms.assets.write permission)
create policy "asset_variants_update" on asset_variant
  for update using (has_permission(auth.uid(), 'cms.assets.write'));

-- Delete asset variants (requires cms.assets.write permission)
create policy "asset_variants_delete" on asset_variant
  for delete using (has_permission(auth.uid(), 'cms.assets.write'));

-- ASSET USAGE POLICIES
-- Read asset usage (requires cms.assets.read permission)
create policy "asset_usage_read" on asset_usage
  for select using (has_permission(auth.uid(), 'cms.assets.read'));

-- Create asset usage (requires cms.assets.write permission)
create policy "asset_usage_create" on asset_usage
  for insert with check (has_permission(auth.uid(), 'cms.assets.write'));

-- Update asset usage (requires cms.assets.write permission)
create policy "asset_usage_update" on asset_usage
  for update using (has_permission(auth.uid(), 'cms.assets.write'));

-- Delete asset usage (requires cms.assets.write permission)
create policy "asset_usage_delete" on asset_usage
  for delete using (has_permission(auth.uid(), 'cms.assets.write'));

-- USER PERMISSIONS POLICIES
-- Allow authenticated users to read their own permissions (needed for has_permission function)
create policy "user_permissions_read_own" on user_permissions
  for select using (user_id = auth.uid());

-- Only system admins can manage user permissions
create policy "user_permissions_manage" on user_permissions
  for all using (has_permission(auth.uid(), 'system.admin'));

-- CMS AUDIT LOG POLICIES
-- Only system admins can read audit logs
create policy "audit_log_read" on cms_audit_log
  for select using (has_permission(auth.uid(), 'system.admin'));

-- Only system admins can create audit log entries
create policy "audit_log_create" on cms_audit_log
  for insert with check (has_permission(auth.uid(), 'system.admin'));
