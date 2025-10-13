-- =========================================================
-- Move All Analytics Tables to Public Schema
-- =========================================================
-- Move all analytics tables from analytics schema to public schema
-- This ensures proper schema cache and RPC function compatibility

begin;

-- Drop existing analytics schema tables and recreate in public schema
drop table if exists analytics.pageviews cascade;
drop table if exists analytics.events cascade;
drop table if exists analytics.sessions cascade;
drop table if exists analytics.users cascade;
drop table if exists analytics.excluded_users cascade;

-- Create users table in public schema
create table public.users (
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

-- Create sessions table in public schema
create table public.sessions (
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
  browser_version   text,
  os_name           text,
  os_version        text,
  is_bot            boolean not null default false,
  ip_address        inet,
  geo_country       text,
  geo_region        text,
  geo_city          text,
  properties        jsonb not null default '{}'::jsonb
);

-- Create pageviews table in public schema
create table public.pageviews (
  id                bigserial primary key,
  session_id        uuid not null references public.sessions(id) on delete cascade,
  user_id           uuid not null references public.users(id) on delete cascade,
  occurred_at       timestamptz not null default now(),
  url               text not null,
  path              text not null,
  title             text,
  referrer          text,
  properties        jsonb not null default '{}'::jsonb
);

-- Create events table in public schema
create table public.events (
  id                bigserial primary key,
  session_id        uuid not null references public.sessions(id) on delete cascade,
  user_id           uuid not null references public.users(id) on delete cascade,
  occurred_at       timestamptz not null default now(),
  name              text not null,
  label             text,
  value_num         numeric,
  value_text        text,
  properties        jsonb not null default '{}'::jsonb
);

-- Create excluded_users table in public schema
create table public.excluded_users (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references public.users(id) on delete cascade,
  session_id        uuid references public.sessions(id) on delete cascade,
  ip_address        inet,
  anon_id           text,
  reason            text not null default 'Manual exclusion',
  excluded_by       text not null default 'admin',
  excluded_at       timestamptz not null default now(),
  constraint excluded_users_identifier_check check (
    user_id is not null or 
    session_id is not null or 
    ip_address is not null or 
    anon_id is not null
  )
);

-- Create indexes
create index idx_users_first_seen on public.users (first_seen_at);
create index idx_users_last_seen on public.users (last_seen_at);
create index idx_sessions_user on public.sessions (user_id, started_at desc);
create index idx_sessions_started on public.sessions (started_at desc);
create index idx_sessions_ended on public.sessions (ended_at desc);
create index idx_sessions_referrer on public.sessions using gin (referrer gin_trgm_ops);
create index idx_sessions_landing on public.sessions using gin (landing_path gin_trgm_ops);
create index idx_pageviews_session_time on public.pageviews (session_id, occurred_at);
create index idx_pageviews_user_time on public.pageviews (user_id, occurred_at);
create index idx_pageviews_path_time on public.pageviews (path, occurred_at);
create index idx_pageviews_url_trgm on public.pageviews using gin (url gin_trgm_ops);
create index idx_events_session_time on public.events (session_id, occurred_at);
create index idx_events_user_time on public.events (user_id, occurred_at);
create index idx_events_name_time on public.events (name, occurred_at);
create index idx_events_props_gin on public.events using gin (properties jsonb_path_ops);
create index idx_excluded_users_user_id on public.excluded_users (user_id);
create index idx_excluded_users_session_id on public.excluded_users (session_id);
create index idx_excluded_users_ip_address on public.excluded_users (ip_address);
create index idx_excluded_users_anon_id on public.excluded_users (anon_id);
create index idx_excluded_users_excluded_at on public.excluded_users (excluded_at);

-- Grant permissions
grant select, insert, update, delete on public.users to authenticated;
grant select, insert, update, delete on public.sessions to authenticated;
grant select, insert, update, delete on public.pageviews to authenticated;
grant select, insert, update, delete on public.events to authenticated;
grant select, insert, update, delete on public.excluded_users to authenticated;

grant select, insert, update, delete on public.users to anon;
grant select, insert, update, delete on public.sessions to anon;
grant select, insert, update, delete on public.pageviews to anon;
grant select, insert, update, delete on public.events to anon;
grant select, insert, update, delete on public.excluded_users to anon;

-- Create helper functions in public schema
create or replace function public.upsert_user_by_anon_id(p_anon_id text)
returns uuid
language plpgsql
as $$
declare
  v_user_id uuid;
begin
  if p_anon_id is null or length(p_anon_id) = 0 then
    raise exception 'anon_id is required';
  end if;

  select id into v_user_id from public.users where anon_id = p_anon_id;
  if v_user_id is null then
    insert into public.users (anon_id)
      values (p_anon_id)
      returning id into v_user_id;
  else
    update public.users
       set last_seen_at = now()
     where id = v_user_id;
  end if;

  return v_user_id;
end;
$$;

create or replace function public.is_user_excluded(
  p_user_id uuid default null,
  p_session_id uuid default null,
  p_ip_address inet default null,
  p_anon_id text default null
)
returns boolean
language plpgsql
as $$
begin
  return exists (
    select 1 from public.excluded_users
    where (p_user_id is not null and user_id = p_user_id)
       or (p_session_id is not null and session_id = p_session_id)
       or (p_ip_address is not null and ip_address = p_ip_address)
       or (p_anon_id is not null and anon_id = p_anon_id)
  );
end;
$$;

create or replace function public.exclude_user(
  p_user_id uuid default null,
  p_session_id uuid default null,
  p_ip_address inet default null,
  p_anon_id text default null,
  p_reason text default 'Manual exclusion',
  p_excluded_by text default 'admin'
)
returns uuid
language plpgsql
as $$
declare
  v_exclusion_id uuid;
begin
  if p_user_id is null and p_session_id is null and p_ip_address is null and p_anon_id is null then
    raise exception 'At least one identifier (user_id, session_id, ip_address, or anon_id) must be provided';
  end if;

  insert into public.excluded_users (
    user_id, session_id, ip_address, anon_id, reason, excluded_by
  ) values (
    p_user_id, p_session_id, p_ip_address, p_anon_id, p_reason, p_excluded_by
  ) returning id into v_exclusion_id;

  return v_exclusion_id;
end;
$$;

create or replace function public.remove_exclusion(
  p_user_id uuid default null,
  p_session_id uuid default null,
  p_ip_address inet default null,
  p_anon_id text default null
)
returns boolean
language plpgsql
as $$
begin
  delete from public.excluded_users
  where (p_user_id is not null and user_id = p_user_id)
     or (p_session_id is not null and session_id = p_session_id)
     or (p_ip_address is not null and ip_address = p_ip_address)
     or (p_anon_id is not null and anon_id = p_anon_id);
  
  return found;
end;
$$;

-- Grant execute permissions
grant execute on function public.upsert_user_by_anon_id(text) to authenticated;
grant execute on function public.upsert_user_by_anon_id(text) to anon;
grant execute on function public.is_user_excluded(uuid, uuid, inet, text) to authenticated;
grant execute on function public.is_user_excluded(uuid, uuid, inet, text) to anon;
grant execute on function public.exclude_user(uuid, uuid, inet, text, text, text) to authenticated;
grant execute on function public.exclude_user(uuid, uuid, inet, text, text, text) to anon;
grant execute on function public.remove_exclusion(uuid, uuid, inet, text) to authenticated;
grant execute on function public.remove_exclusion(uuid, uuid, inet, text) to anon;

-- Create views that exclude excluded users
create or replace view public.v_unique_users_daily as
with days as (
  select generate_series(
    date_trunc('day', (select min(first_seen_at) from public.users)),
    date_trunc('day', now()),
    interval '1 day'
  )::date as day
)
select
  d.day,
  count(distinct u.id) as unique_users
from days d
left join public.users u
  on date_trunc('day', u.first_seen_at) <= d.day
 and date_trunc('day', u.last_seen_at)  >= d.day
 and not public.is_user_excluded(p_user_id => u.id, p_anon_id => u.anon_id)
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
  (select count(*) from public.pageviews pv where pv.session_id = s.id) as pageviews_count,
  (select count(*) from public.events ev where ev.session_id = s.id)    as events_count
from public.sessions s
where not public.is_user_excluded(
  p_user_id => s.user_id, 
  p_session_id => s.id, 
  p_ip_address => s.ip_address
);

create or replace view public.v_event_rollup_daily as
select
  date_trunc('day', occurred_at)::date as day,
  name,
  count(*)::bigint as event_count,
  count(distinct user_id)::bigint as unique_users
from public.events
where not public.is_user_excluded(p_user_id => user_id)
group by 1, 2
order by 1, 2;

commit;
