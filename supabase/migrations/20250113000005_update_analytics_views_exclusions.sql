-- =========================================================
-- Update Analytics Views to Exclude Excluded Users
-- =========================================================
-- Update all analytics views to filter out excluded users/sessions/IPs

begin;

-- Update v_unique_users_daily to exclude excluded users
create or replace view analytics.v_unique_users_daily as
with days as (
  select generate_series(
    date_trunc('day', (select min(first_seen_at) from analytics.users)),
    date_trunc('day', now()),
    interval '1 day'
  )::date as day
)
select
  d.day,
  count(distinct u.id) as unique_users
from days d
left join analytics.users u
  on date_trunc('day', u.first_seen_at) <= d.day
 and date_trunc('day', u.last_seen_at)  >= d.day
 and not analytics.is_user_excluded(p_user_id => u.id, p_anon_id => u.anon_id)
group by d.day
order by d.day;

-- Update v_sessions_summary to exclude excluded users/sessions
create or replace view analytics.v_sessions_summary as
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
  (select count(*) from analytics.pageviews pv where pv.session_id = s.id) as pageviews_count,
  (select count(*) from analytics.events ev where ev.session_id = s.id)    as events_count
from analytics.sessions s
where not analytics.is_user_excluded(
  p_user_id => s.user_id, 
  p_session_id => s.id, 
  p_ip_address => s.ip_address
);

-- Update v_event_rollup_daily to exclude excluded users
create or replace view analytics.v_event_rollup_daily as
select
  date_trunc('day', occurred_at)::date as day,
  name,
  count(*)::bigint as event_count,
  count(distinct user_id)::bigint as unique_users
from analytics.events
where not analytics.is_user_excluded(p_user_id => user_id)
group by 1, 2
order by 1, 2;

-- Create new view for analytics users (excluding excluded users)
create or replace view analytics.v_analytics_users as
select u.*
from analytics.users u
where not analytics.is_user_excluded(p_user_id => u.id, p_anon_id => u.anon_id);

-- Create new view for analytics sessions (excluding excluded users)
create or replace view analytics.v_analytics_sessions as
select s.*
from analytics.sessions s
where not analytics.is_user_excluded(
  p_user_id => s.user_id, 
  p_session_id => s.id, 
  p_ip_address => s.ip_address
);

-- Create new view for analytics pageviews (excluding excluded users)
create or replace view analytics.v_analytics_pageviews as
select pv.*
from analytics.pageviews pv
where not analytics.is_user_excluded(p_user_id => pv.user_id);

-- Create new view for analytics events (excluding excluded users)
create or replace view analytics.v_analytics_events as
select ev.*
from analytics.events ev
where not analytics.is_user_excluded(p_user_id => ev.user_id);

-- Update public views to use filtered analytics views
create or replace view public.users as
select * from analytics.v_analytics_users;

create or replace view public.sessions as
select * from analytics.v_analytics_sessions;

create or replace view public.pageviews as
select * from analytics.v_analytics_pageviews;

create or replace view public.events as
select * from analytics.v_analytics_events;

commit;
