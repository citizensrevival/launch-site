-- =========================================================
-- Cleanup Public Analytics Views
-- =========================================================
-- Remove public views and grant permissions directly on analytics schema
-- This keeps analytics data properly organized in the analytics schema

begin;

-- Drop public views
drop view if exists public.users;
drop view if exists public.sessions;
drop view if exists public.pageviews;
drop view if exists public.events;

-- Grant permissions directly on analytics schema tables
grant select, insert, update, delete on analytics.users to authenticated;
grant select, insert, update, delete on analytics.sessions to authenticated;
grant select, insert, update, delete on analytics.pageviews to authenticated;
grant select, insert, update, delete on analytics.events to authenticated;
grant select, insert, update, delete on analytics.excluded_users to authenticated;

-- Grant permissions to anon users (for Edge Functions)
grant select, insert, update, delete on analytics.users to anon;
grant select, insert, update, delete on analytics.sessions to anon;
grant select, insert, update, delete on analytics.pageviews to anon;
grant select, insert, update, delete on analytics.events to anon;
grant select, insert, update, delete on analytics.excluded_users to anon;

-- Grant usage on analytics schema
grant usage on schema analytics to authenticated;
grant usage on schema analytics to anon;

-- Grant execute permissions on analytics functions
grant execute on function analytics.upsert_user_by_anon_id(text) to authenticated;
grant execute on function analytics.upsert_user_by_anon_id(text) to anon;
grant execute on function analytics.is_user_excluded(uuid, uuid, inet, text) to authenticated;
grant execute on function analytics.is_user_excluded(uuid, uuid, inet, text) to anon;
grant execute on function analytics.exclude_user(uuid, uuid, inet, text, text, text) to authenticated;
grant execute on function analytics.exclude_user(uuid, uuid, inet, text, text, text) to anon;
grant execute on function analytics.remove_exclusion(uuid, uuid, inet, text) to authenticated;
grant execute on function analytics.remove_exclusion(uuid, uuid, inet, text) to anon;

commit;
