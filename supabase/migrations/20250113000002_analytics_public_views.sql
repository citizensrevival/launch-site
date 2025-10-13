-- =========================================================
-- Analytics Public Views
-- =========================================================
-- Create public views that point to analytics schema tables
-- This allows Edge Functions to access analytics data through the public schema

begin;

-- Create views for analytics tables
create or replace view public.users as
select * from analytics.users;

create or replace view public.sessions as
select * from analytics.sessions;

create or replace view public.pageviews as
select * from analytics.pageviews;

create or replace view public.events as
select * from analytics.events;

-- Grant permissions to authenticated users
grant select, insert, update, delete on public.users to authenticated;
grant select, insert, update, delete on public.sessions to authenticated;
grant select, insert, update, delete on public.pageviews to authenticated;
grant select, insert, update, delete on public.events to authenticated;

-- Grant permissions to anon users (for Edge Functions)
grant select, insert, update, delete on public.users to anon;
grant select, insert, update, delete on public.sessions to anon;
grant select, insert, update, delete on public.pageviews to anon;
grant select, insert, update, delete on public.events to anon;

commit;
