-- Restore missing analytics views
-- This migration recreates the analytics views that were dropped in the cleanup

-- Create v_analytics_users view
CREATE OR REPLACE VIEW public.v_analytics_users AS
SELECT 
  id,
  user_id,
  first_seen_at,
  last_seen_at,
  properties
FROM public.analytics_users;

-- Create v_analytics_sessions view  
CREATE OR REPLACE VIEW public.v_analytics_sessions AS
SELECT 
  id,
  user_id,
  session_id,
  started_at,
  ended_at,
  duration_ms,
  page_count,
  event_count,
  properties,
  landing_page,
  landing_path,
  referrer,
  utm_source,
  utm_medium,
  utm_campaign,
  utm_term,
  utm_content,
  user_agent,
  device_category,
  browser_name,
  browser_version,
  os_name,
  os_version,
  is_bot,
  ip_address,
  geo_country,
  geo_region,
  geo_city
FROM public.analytics_sessions;

-- Create v_analytics_pageviews view
CREATE OR REPLACE VIEW public.v_analytics_pageviews AS
SELECT 
  id,
  session_id,
  user_id,
  page_path,
  page_title,
  referrer,
  properties,
  timestamp,
  duration_ms,
  user_agent,
  viewport_width,
  viewport_height
FROM public.analytics_pageviews;

-- Create v_analytics_events view
CREATE OR REPLACE VIEW public.v_analytics_events AS
SELECT 
  id,
  session_id,
  user_id,
  event_name,
  event_category,
  event_value,
  properties,
  timestamp
FROM public.analytics_events;

-- Create v_users_analytics view (main analytics view)
CREATE OR REPLACE VIEW public.v_users_analytics AS
SELECT
  u.id,
  u.user_id as anon_id,
  u.first_seen_at,
  u.last_seen_at,
  u.properties,
  count(distinct s.id) as sessions,
  coalesce(avg(extract(epoch from coalesce(s.ended_at, now()) - s.started_at)), 0) as avg_duration,
  exists(
    select 1 from public.v_analytics_events ev 
    where ev.user_id = u.id and ev.event_name = 'lead_submitted'
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
FROM public.v_analytics_users u
LEFT JOIN public.v_analytics_sessions s ON s.user_id = u.id
GROUP BY u.id, u.user_id, u.first_seen_at, u.last_seen_at, u.properties;

-- Create v_new_users_daily view
CREATE OR REPLACE VIEW public.v_new_users_daily AS
SELECT
  date_trunc('day', first_seen_at)::date as day,
  count(*)::bigint as new_users
FROM public.v_analytics_users
GROUP BY 1
ORDER BY 1;

-- Create v_sessions_summary view
CREATE OR REPLACE VIEW public.v_sessions_summary AS
SELECT
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
  (select count(*) from public.v_analytics_pageviews pv where pv.session_id = s.session_id) as pageviews_count,
  (select count(*) from public.v_analytics_events ev where ev.session_id = s.session_id) as events_count
FROM public.v_analytics_sessions s;

-- Create v_new_vs_returning_users view
CREATE OR REPLACE VIEW public.v_new_vs_returning_users AS
WITH user_stats AS (
  SELECT
    u.id,
    u.first_seen_at,
    u.last_seen_at,
    CASE 
      WHEN date_trunc('day', u.first_seen_at) = date_trunc('day', u.last_seen_at) THEN 'New'
      ELSE 'Returning'
    END as user_type
  FROM public.v_analytics_users u
)
SELECT
  user_type as type,
  count(*)::bigint as count
FROM user_stats
GROUP BY user_type;

-- Grant permissions on views
GRANT SELECT ON public.v_analytics_users TO anon, authenticated;
GRANT SELECT ON public.v_analytics_sessions TO anon, authenticated;
GRANT SELECT ON public.v_analytics_pageviews TO anon, authenticated;
GRANT SELECT ON public.v_analytics_events TO anon, authenticated;
GRANT SELECT ON public.v_sessions_summary TO anon, authenticated;
GRANT SELECT ON public.v_users_analytics TO anon, authenticated;
GRANT SELECT ON public.v_new_users_daily TO anon, authenticated;
GRANT SELECT ON public.v_new_vs_returning_users TO anon, authenticated;
