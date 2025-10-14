-- =========================================================
-- Update Analytics Views for anon_id Exclusions
-- =========================================================
-- Update all analytics views to properly exclude sessions, pageviews, and events
-- that are associated with excluded users (by anon_id)

begin;

-- =========================================================
-- Core Filtered Views (Updated for anon_id exclusions)
-- =========================================================

-- Users view excluding excluded users (already handles anon_id)
create or replace view public.v_analytics_users as
select u.*
from public.users u
where not exists (
  select 1 from public.excluded_users eu
  where (eu.user_id = u.id or eu.anon_id = u.anon_id)
);

-- Sessions view excluding excluded users/sessions (updated for anon_id)
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

-- Pageviews view excluding excluded users (updated for anon_id)
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

-- Events view excluding excluded users (updated for anon_id)
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

-- =========================================================
-- Analytics Overview Views (Updated for anon_id exclusions)
-- =========================================================

-- Unique users over time (excluding excluded users)
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

-- Sessions summary with computed metrics (excluding excluded users)
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

-- Event rollup daily (excluding excluded users)
create or replace view public.v_event_rollup_daily as
select
  date_trunc('day', occurred_at)::date as day,
  name,
  count(*)::bigint as event_count,
  count(distinct user_id)::bigint as unique_users
from public.v_analytics_events
group by 1, 2
order by 1, 2;

-- =========================================================
-- Users Analytics Views (Updated for anon_id exclusions)
-- =========================================================

-- Users with session data and lead status
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
  -- Get device info from most recent session
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

-- New users daily (excluding excluded users)
create or replace view public.v_new_users_daily as
select
  date_trunc('day', first_seen_at)::date as day,
  count(*)::bigint as new_users
from public.v_analytics_users
group by 1
order by 1;

-- New vs returning users (excluding excluded users)
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

-- Sessions per user distribution (excluding excluded users)
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

-- =========================================================
-- Page Analytics Views (Updated for anon_id exclusions)
-- =========================================================

-- Pageviews daily (excluding excluded users)
create or replace view public.v_pageviews_daily as
select
  date_trunc('day', occurred_at)::date as day,
  count(*)::bigint as pageviews,
  count(distinct user_id)::bigint as unique_users
from public.v_analytics_pageviews
group by 1
order by 1;

-- Top pages (excluding excluded users)
create or replace view public.v_top_pages as
select
  path,
  count(*)::bigint as views,
  count(distinct user_id)::bigint as unique_users,
  max(occurred_at) as last_viewed
from public.v_analytics_pageviews
group by 1
order by views desc;

-- =========================================================
-- Event Analytics Views (Updated for anon_id exclusions)
-- =========================================================

-- Events daily (excluding excluded users)
create or replace view public.v_events_daily as
select
  date_trunc('day', occurred_at)::date as day,
  count(*)::bigint as events,
  count(distinct user_id)::bigint as unique_users
from public.v_analytics_events
group by 1
order by 1;

-- Top events (excluding excluded users)
create or replace view public.v_top_events as
select
  name,
  count(*)::bigint as count,
  count(distinct user_id)::bigint as unique_users,
  max(occurred_at) as last_occurred
from public.v_analytics_events
group by 1
order by count desc;

-- =========================================================
-- Referrer Analytics Views (Updated for anon_id exclusions)
-- =========================================================

-- Top referrers (excluding excluded users)
create or replace view public.v_top_referrers as
select
  coalesce(referrer, 'Direct') as referrer,
  count(*)::bigint as sessions,
  count(distinct user_id)::bigint as unique_users,
  avg(extract(epoch from coalesce(ended_at, now()) - started_at))::numeric(10,2) as avg_duration_seconds,
  max(started_at) as last_seen
from public.v_analytics_sessions
group by 1
order by sessions desc;

-- =========================================================
-- Device Analytics Views (Updated for anon_id exclusions)
-- =========================================================

-- Device breakdown (excluding excluded users)
create or replace view public.v_device_breakdown as
select
  device_category,
  count(*)::bigint as sessions,
  count(distinct user_id)::bigint as unique_users
from public.v_analytics_sessions
group by 1
order by sessions desc;

-- Browser breakdown (excluding excluded users)
create or replace view public.v_browser_breakdown as
select
  browser_name,
  count(*)::bigint as sessions,
  count(distinct user_id)::bigint as unique_users
from public.v_analytics_sessions
group by 1
order by sessions desc;

-- OS breakdown (excluding excluded users)
create or replace view public.v_os_breakdown as
select
  os_name,
  count(*)::bigint as sessions,
  count(distinct user_id)::bigint as unique_users
from public.v_analytics_sessions
group by 1
order by sessions desc;

-- =========================================================
-- Geographic Analytics Views (Updated for anon_id exclusions)
-- =========================================================

-- Country breakdown (excluding excluded users)
create or replace view public.v_country_breakdown as
select
  coalesce(geo_country, 'Unknown') as country,
  count(*)::bigint as sessions,
  count(distinct user_id)::bigint as unique_users
from public.v_analytics_sessions
group by 1
order by sessions desc;

-- City breakdown (excluding excluded users)
create or replace view public.v_city_breakdown as
select
  coalesce(geo_city, 'Unknown') as city,
  coalesce(geo_country, 'Unknown') as country,
  count(*)::bigint as sessions,
  count(distinct user_id)::bigint as unique_users
from public.v_analytics_sessions
group by 1, 2
order by sessions desc;

commit;
