-- =========================================================
-- Create Analytics Views with Excluded Users Filtering
-- =========================================================
-- Create comprehensive views for each analytics visualization
-- that properly exclude excluded users, sessions, and associated data

begin;

-- =========================================================
-- Core Filtered Views
-- =========================================================

-- Users view excluding excluded users
create or replace view public.v_analytics_users as
select u.*
from public.users u
where not exists (
  select 1 from public.excluded_users eu
  where (eu.user_id = u.id or eu.anon_id = u.anon_id)
);

-- Sessions view excluding excluded users/sessions
create or replace view public.v_analytics_sessions as
select s.*
from public.sessions s
where not exists (
  select 1 from public.excluded_users eu
  where (eu.user_id = s.user_id or eu.session_id = s.id or eu.ip_address = s.ip_address)
);

-- Pageviews view excluding excluded users
create or replace view public.v_analytics_pageviews as
select pv.*
from public.pageviews pv
where not exists (
  select 1 from public.excluded_users eu
  where eu.user_id = pv.user_id
);

-- Events view excluding excluded users
create or replace view public.v_analytics_events as
select ev.*
from public.events ev
where not exists (
  select 1 from public.excluded_users eu
  where eu.user_id = ev.user_id
);

-- =========================================================
-- Analytics Overview Views
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
-- Users Analytics Views
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
group by u.id, u.anon_id, u.first_seen_at, u.last_seen_at, 
         u.first_referrer, u.last_referrer, u.first_utm_source, u.last_utm_source, u.properties;

-- New users over time
create or replace view public.v_new_users_daily as
select
  date_trunc('day', first_seen_at)::date as day,
  count(*) as new_users
from public.v_analytics_users
group by 1
order by 1;

-- New vs returning users
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

-- =========================================================
-- Sessions Analytics Views
-- =========================================================

-- Sessions per user distribution
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

-- Average session metrics
create or replace view public.v_session_metrics as
select
  count(*) as total_sessions,
  avg(duration_seconds) as avg_duration,
  avg(pageviews_count) as avg_pageviews
from public.v_sessions_summary;

-- =========================================================
-- Events Analytics Views
-- =========================================================

-- Event summary with counts and unique users
create or replace view public.v_events_analytics as
select
  name,
  count(*) as count,
  count(distinct user_id) as unique_users,
  max(occurred_at) as last_occurred
from public.v_analytics_events
group by name
order by count desc;

-- Event trends over time
create or replace view public.v_event_trends_daily as
select
  date_trunc('day', occurred_at)::date as day,
  name,
  count(*) as count
from public.v_analytics_events
group by 1, 2
order by 1, 2;

-- =========================================================
-- Referrers Analytics Views
-- =========================================================

-- Referrer analytics with conversion data
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

-- Referral traffic over time
create or replace view public.v_referral_traffic_daily as
select
  date_trunc('day', s.started_at)::date as day,
  count(*) as referrals
from public.v_analytics_sessions s
where s.referrer is not null and s.referrer != ''
group by 1
order by 1;

-- =========================================================
-- Grant Permissions
-- =========================================================

-- Grant select permissions on all views
grant select on public.v_analytics_users to authenticated;
grant select on public.v_analytics_sessions to authenticated;
grant select on public.v_analytics_pageviews to authenticated;
grant select on public.v_analytics_events to authenticated;
grant select on public.v_unique_users_daily to authenticated;
grant select on public.v_sessions_summary to authenticated;
grant select on public.v_event_rollup_daily to authenticated;
grant select on public.v_users_analytics to authenticated;
grant select on public.v_new_users_daily to authenticated;
grant select on public.v_new_vs_returning_users to authenticated;
grant select on public.v_sessions_per_user_distribution to authenticated;
grant select on public.v_session_metrics to authenticated;
grant select on public.v_events_analytics to authenticated;
grant select on public.v_event_trends_daily to authenticated;
grant select on public.v_referrers_analytics to authenticated;
grant select on public.v_referral_traffic_daily to authenticated;

grant select on public.v_analytics_users to anon;
grant select on public.v_analytics_sessions to anon;
grant select on public.v_analytics_pageviews to anon;
grant select on public.v_analytics_events to anon;
grant select on public.v_unique_users_daily to anon;
grant select on public.v_sessions_summary to anon;
grant select on public.v_event_rollup_daily to anon;
grant select on public.v_users_analytics to anon;
grant select on public.v_new_users_daily to anon;
grant select on public.v_new_vs_returning_users to authenticated;
grant select on public.v_sessions_per_user_distribution to anon;
grant select on public.v_session_metrics to anon;
grant select on public.v_events_analytics to anon;
grant select on public.v_event_trends_daily to anon;
grant select on public.v_referrers_analytics to anon;
grant select on public.v_referral_traffic_daily to anon;

commit;
