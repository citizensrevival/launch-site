-- =========================================================
-- Move Excluded Users Table to Analytics Schema
-- =========================================================
-- Move the excluded_users table from public schema to analytics schema
-- This keeps all analytics-related tables properly organized

begin;

-- Drop the public view first
drop view if exists public.excluded_users;

-- Move the table to analytics schema (it should already be there, but let's ensure it)
-- First, check if the table exists in analytics schema, if not, create it
create table if not exists analytics.excluded_users (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references analytics.users(id) on delete cascade,
  session_id        uuid references analytics.sessions(id) on delete cascade,
  ip_address        inet,
  anon_id           text,
  reason            text not null default 'Manual exclusion',
  excluded_by       text not null default 'admin',
  excluded_at       timestamptz not null default now(),
  
  -- Ensure at least one identifier is provided
  constraint excluded_users_identifier_check check (
    user_id is not null or 
    session_id is not null or 
    ip_address is not null or 
    anon_id is not null
  )
);

-- Create indexes for efficient lookups
create index if not exists idx_excluded_users_user_id on analytics.excluded_users (user_id);
create index if not exists idx_excluded_users_session_id on analytics.excluded_users (session_id);
create index if not exists idx_excluded_users_ip_address on analytics.excluded_users (ip_address);
create index if not exists idx_excluded_users_anon_id on analytics.excluded_users (anon_id);
create index if not exists idx_excluded_users_excluded_at on analytics.excluded_users (excluded_at);

-- Grant permissions on analytics schema table
grant select, insert, update, delete on analytics.excluded_users to authenticated;
grant select, insert, update, delete on analytics.excluded_users to anon;

-- Update the AnalyticsService to use analytics.excluded_users instead of public.excluded_users
-- This will be handled in the code, but we need to ensure the table is in the right place

commit;
