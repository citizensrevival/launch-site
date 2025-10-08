-- =========================================================
-- Citizens Revival — In-House Analytics Schema (Supabase)
-- =========================================================
-- Safe to run once in a fresh database. Re-run guarded by IF NOT EXISTS.
-- Notes:
-- - Uses UUIDs via pgcrypto's gen_random_uuid()
-- - Timestamps are timestamptz (UTC-friendly)
-- - RLS is OFF by default for simplicity; see bottom to enable later
-- =========================================================

begin;

-- ---------- Extensions ----------
create extension if not exists pgcrypto;   -- for gen_random_uuid()
create extension if not exists pg_trgm;    -- for faster LIKE/ILIKE on urls, titles, etc.

-- ---------- Schema ----------
create schema if not exists analytics;

-- =========================================================
-- Core entities
-- =========================================================

-- Represents an anonymous browser/device. Persist your own anon_id cookie and send it in.
create table if not exists analytics.users (
  id                uuid primary key default gen_random_uuid(),
  -- Your tracker should persist this in a 1st-party cookie/localStorage.
  anon_id           text unique not null,

  first_seen_at     timestamptz not null default now(),
  last_seen_at      timestamptz not null default now(),

  -- Optional soft traits you may set/update (do NOT store PII by default)
  first_referrer    text,
  first_utm_source  text,
  first_utm_medium  text,
  first_utm_campaign text,

  last_referrer     text,
  last_utm_source   text,
  last_utm_medium   text,
  last_utm_campaign text,

  properties        jsonb not null default '{}'::jsonb, -- freeform key/val (non-PII)
  constraint users_anon_id_chk check (length(anon_id) > 0)
);

create index if not exists idx_users_first_seen on analytics.users (first_seen_at);
create index if not exists idx_users_last_seen  on analytics.users (last_seen_at);

-- A visit window (e.g., resets after 30 min of inactivity). Link to users.id
create table if not exists analytics.sessions (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references analytics.users(id) on delete cascade,

  started_at        timestamptz not null default now(),
  ended_at          timestamptz,          -- nullable until session is closed
  -- use a view to compute duration since now() is volatile for generated cols

  -- Acquisition + context
  landing_page      text,                 -- full URL
  landing_path      text,                 -- path only (e.g., /about)
  referrer          text,
  utm_source        text,
  utm_medium        text,
  utm_campaign      text,
  utm_term          text,
  utm_content       text,

  -- Device / UA parsing (store raw; parse in app as needed)
  user_agent        text,
  device_category   text,                 -- "mobile" | "desktop" | "tablet" | "bot" | null
  browser_name      text,
  browser_version   text,
  os_name           text,
  os_version        text,
  is_bot            boolean not null default false,

  -- Network / Geo (keep light; avoid precise PII)
  ip_address        inet,                 -- store as inet; anonymize at edge if desired
  geo_country       text,
  geo_region        text,
  geo_city          text,

  properties        jsonb not null default '{}'::jsonb
);

create index if not exists idx_sessions_user on analytics.sessions (user_id, started_at desc);
create index if not exists idx_sessions_started on analytics.sessions (started_at desc);
create index if not exists idx_sessions_ended   on analytics.sessions (ended_at desc);
create index if not exists idx_sessions_referrer on analytics.sessions using gin (referrer gin_trgm_ops);
create index if not exists idx_sessions_landing  on analytics.sessions using gin (landing_path gin_trgm_ops);

-- Pageviews inside a session (ordered by occurred_at)
create table if not exists analytics.pageviews (
  id                bigserial primary key,
  session_id        uuid not null references analytics.sessions(id) on delete cascade,
  user_id           uuid not null references analytics.users(id) on delete cascade,

  occurred_at       timestamptz not null default now(),
  url               text not null,
  path              text not null,        -- normalized path (/xyz)
  title             text,
  referrer          text,

  properties        jsonb not null default '{}'::jsonb
);

create index if not exists idx_pageviews_session_time on analytics.pageviews (session_id, occurred_at);
create index if not exists idx_pageviews_user_time    on analytics.pageviews (user_id, occurred_at);
create index if not exists idx_pageviews_path_time    on analytics.pageviews (path, occurred_at);
create index if not exists idx_pageviews_url_trgm     on analytics.pageviews using gin (url gin_trgm_ops);

-- Custom events (clicks, form submits, video plays, etc.)
create table if not exists analytics.events (
  id                bigserial primary key,
  session_id        uuid not null references analytics.sessions(id) on delete cascade,
  user_id           uuid not null references analytics.users(id) on delete cascade,

  occurred_at       timestamptz not null default now(),
  name              text not null,        -- e.g., 'lead_form_submitted', 'cta_click'
  label             text,                 -- optional human-friendly label
  value_num         numeric,              -- optional numeric value (e.g., 1, score, ms)
  value_text        text,                 -- optional text payload

  properties        jsonb not null default '{}'::jsonb
);

create index if not exists idx_events_session_time on analytics.events (session_id, occurred_at);
create index if not exists idx_events_user_time    on analytics.events (user_id, occurred_at);
create index if not exists idx_events_name_time    on analytics.events (name, occurred_at);
create index if not exists idx_events_props_gin    on analytics.events using gin (properties jsonb_path_ops);

-- =========================================================
-- Helpful Views (power your dashboard with minimal SQL)
-- =========================================================

-- 1) Unique users per day (UTC) over a date range
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
group by d.day
order by d.day;

-- 2) Sessions summary with computed duration (sec), pages, events
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
from analytics.sessions s;

-- 3) Event counts + uniques (handy for Events page)
create or replace view analytics.v_event_rollup_daily as
select
  date_trunc('day', occurred_at)::date as day,
  name,
  count(*)::bigint as event_count,
  count(distinct user_id)::bigint as unique_users
from analytics.events
group by 1, 2
order by 1, 2;

-- =========================================================
-- (Optional) Convenience function: upsert user by anon_id
-- Call from your edge function before creating a session.
-- =========================================================
create or replace function analytics.upsert_user_by_anon_id(p_anon_id text)
returns uuid
language plpgsql
as $$
declare
  v_user_id uuid;
begin
  if p_anon_id is null or length(p_anon_id) = 0 then
    raise exception 'anon_id is required';
  end if;

  select id into v_user_id from analytics.users where anon_id = p_anon_id;
  if v_user_id is null then
    insert into analytics.users (anon_id)
      values (p_anon_id)
      returning id into v_user_id;
  else
    update analytics.users
       set last_seen_at = now()
     where id = v_user_id;
  end if;

  return v_user_id;
end;
$$;

-- =========================================================
-- (Optional) Minimal "admin-friendly" default grants
-- Adjust to your auth model. In Supabase, your server-side
-- (service role) bypasses RLS; client auth uses RLS policies.
-- =========================================================
-- grant usage on schema analytics to authenticated;
-- grant select on all tables in schema analytics to authenticated;
-- alter default privileges in schema analytics grant select on tables to authenticated;

-- =========================================================
-- (Optional) RLS starter (leave OFF if you only query via server)
-- =========================================================
-- alter table analytics.users    enable row level security;
-- alter table analytics.sessions enable row level security;
-- alter table analytics.pageviews enable row level security;
-- alter table analytics.events    enable row level security;
--
-- -- Example read-only policy (authenticated can read everything)
-- create policy "ro users"    on analytics.users    for select to authenticated using (true);
-- create policy "ro sessions" on analytics.sessions for select to authenticated using (true);
-- create policy "ro pageviews" on analytics.pageviews for select to authenticated using (true);
-- create policy "ro events"    on analytics.events    for select to authenticated using (true);
--
-- -- Example insert policies (only via RPC/edge with your checks)
-- create policy "ins sessions" on analytics.sessions for insert to authenticated with check (true);
-- create policy "ins pageviews" on analytics.pageviews for insert to authenticated using (true);
-- create policy "ins events"    on analytics.events    for select to authenticated using (true);

commit;

-- =========================================================
-- Quick queries you can use immediately (optional):
-- -- Unique users over last 30 days:
-- select * from analytics.v_unique_users_daily
-- where day >= (now() - interval '30 days')::date;
--
-- -- Sessions list for dashboard:
-- select * from analytics.v_sessions_summary
-- order by started_at desc
-- limit 100;
--
-- -- Event trend for 'lead_form_submitted':
-- select * from analytics.v_event_rollup_daily
-- where name = 'lead_form_submitted'
-- order by day;
-- =========================================================
