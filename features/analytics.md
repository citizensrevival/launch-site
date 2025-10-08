# Analytics

## 🧩 Overview

Your in-house analytics system will have two main parts:

1. **Tracking Infrastructure** (the invisible side) — collects, stores, and organizes session, user, and event data.
2. **Analytics Dashboard** (the visible side) — visualizes, filters, and lets you drill down into user behaviors.

---

## 1. Core Business Features

### A. **User & Session Tracking**

* **Unique User Identification**

  * Uses a persistent cookie or localStorage ID for return visitors.
  * “Unique user” = 1 browser + device combo, not just IP.
* **Sessions**

  * Defined as a period of activity (e.g., 30 min timeout rule).
  * Track:

    * Start/end timestamps
    * Pageviews (URLs and timestamps)
    * Referrer (where they came from)
    * Device info (browser, OS)
    * IP (optionally geo-located)
* **Events**

  * Support custom events like:

    * “Lead form submitted”
    * “Clicked Get Involved”
    * “Scrolled to bottom”
    * “Played video,” etc.

---

### B. **Data Collected per Session**

| Category               | Data Example                              | Purpose                |
| ---------------------- | ----------------------------------------- | ---------------------- |
| **Session Info**       | session_id, user_id, start_time, duration | Measure engagement     |
| **User Info**          | hashed user_id, returning_user flag       | Track new vs returning |
| **Navigation History** | ordered list of URLs & timestamps         | Understand flow        |
| **Events**             | event_name, metadata                      | Conversion tracking    |
| **IP & Location**      | city, region, country (optional)          | Marketing insights     |

---

## 2. Admin Analytics Dashboard (Top-Level Navigation)

### A. **Analytics Overview (Dashboard Home)**

**Purpose:** Quick health snapshot of site engagement.

**Widgets / Components:**

* **Line Graph:** Unique Users over time (filterable by date range)
* **Bar Graph:** Sessions per day
* **Map View (optional):** User sessions by location
* **Conversion Summary:** Number of form submissions or “Get Involved” leads
* **New vs Returning Users:** Pie or stacked bar chart
* **Top Landing Pages:** List of most viewed pages

**Filters:**

* Date range (last 7 days, 30 days, custom)
* Device type (mobile/desktop)
* Referrer source

---

### B. **Users Page**

**Purpose:** See and analyze unique users and their engagement trends.

**Components:**

* Table of users:
    * Columns: User ID, First Visit, Last Visit, Sessions, Avg Duration, Lead Submitted (Y/N)
    * Click → Drill into that user’s session history
* Chart: Growth of *new users* over time
* Chart: Distribution of *returning vs new users*

---

### C. **Sessions Page**

**Purpose:** Analyze activity at the session level.

**Components:**

* Table of sessions:
  * Columns: Session ID, User ID, Start, Duration, Pageviews, Events, IP/Location
  * Click → open Session Detail page
* Filters:
  * Date range
  * User ID
  * Source (Referrer)
* Chart: Sessions per user distribution (histogram-style)
* KPI Summary:
  * Average session length
  * Average pages per session

---

### D. **Session Detail Page**

**Purpose:** Replay a user’s experience for a given session.

**Components:**

* **Session Summary Card:**
  * Start/End time, duration, IP, location, device info, referrer
* **Timeline View:**
  * Sequential display of all events:

    ```
    0:00 - Page / (home)
    0:10 - Clicked "Get Involved"
    0:35 - Form submitted
    1:05 - Page /thank-you
    ```
* **Event Log Panel:**
  * Expandable JSON-like view of event metadata
* **Lead Submission Info:**
  * If submitted during session → show details

---

### E. **Events Page**

**Purpose:** See what users are *doing*, not just where they're going.

**Components:**

* Table of custom events:
  * Event name, count, unique users, conversion %
* Chart: Frequency of specific events over time
* Drill down → see sessions that triggered that event

---

### F. **Referrers Page**

**Purpose:** Analyze traffic sources and referral performance.

**Components:**

* **Key Metrics:**
  * Total Referrals
  * Referral Traffic Percentage
  * Top Referrer
  * Active Referrers
* **Visualizations:**
  * Referral traffic changes over time (line chart)
  * Traffic share by source (pie chart)
  * Top 3 referrers (horizontal bar chart)
* **Referrers Table:**
  * Referrer domain, total sessions, total users, conversions
  * Average session duration, bounce rate, pages per session
  * Click → open referrer detail panel
* **Referrer Detail Panel:**
  * Comprehensive referrer statistics
  * Performance indicators (conversion rate, quality score)
  * Traffic share and engagement metrics

---

## 3. Supporting Components & Systems

### A. **Data Filtering & Drill-Down**

* Global filters (date range, user type, source)
* Drill from:
  * Overview → User → Session → Event
  * Event → Sessions → User
* Breadcrumbs for easy navigation

### B. **Visualization Tools**

* Line and bar charts for time-based metrics
* Pie charts for ratios
* Geographic map for session origin (optional)
* Tables with pagination and column sorting

### C. **Backend Admin Settings**

* Configure event tracking categories
* Manage IP anonymization (GDPR consideration)
* Control data retention limits (e.g., keep 6 months)

---

## 4. Data Flow Overview (Conceptually)

```
Frontend Tracker
  ↓
Supabase Edge Function or REST endpoint
  ↓
Analytics Tables in Supabase:
    users
    sessions
    pageviews
    events
  ↓
Admin Dashboard (reads + visualizes)
```


## 📊 Summary of Pages & Components

| Page           | Key Widgets                                  | Drill Down To    |
| -------------- | -------------------------------------------- | ---------------- |
| Dashboard      | Unique Users, Sessions, Map, Conversions     | Users / Sessions |
| Users          | User table, New vs Returning, Growth chart   | Sessions         |
| Sessions       | Sessions table, Avg duration, Pageview stats | Session Detail   |
| Session Detail | Timeline, Events, Metadata                   | Events           |
| Events         | Event counts, charts                         | Session Detail   |
| Referrers    | Referrer table, Traffic share, Performance  | Referrer Detail  |
| Settings       | Data retention, anonymization                | —                |

---

# Database Schema

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

-- 4) Referrer analytics (handy for Referrers page)
create or replace view analytics.v_referrer_stats as
select
  coalesce(s.referrer, 'direct') as referrer_domain,
  count(distinct s.id) as total_sessions,
  count(distinct s.user_id) as total_users,
  count(distinct case when ev.name = 'lead_form_submitted' then s.id end) as conversions,
  avg(extract(epoch from coalesce(s.ended_at, now()) - s.started_at)) as avg_session_duration,
  count(distinct case when pv_count.pageviews = 1 then s.id end)::float / count(distinct s.id) * 100 as bounce_rate,
  avg(pv_count.pageviews) as pages_per_session,
  max(s.started_at) as last_seen,
  count(distinct s.id)::float / (select count(*) from analytics.sessions) * 100 as traffic_share
from analytics.sessions s
left join (
  select session_id, count(*) as pageviews
  from analytics.pageviews
  group by session_id
) pv_count on pv_count.session_id = s.id
left join analytics.events ev on ev.session_id = s.id
group by s.referrer
order by total_sessions desc;

-- 5) Referral traffic over time
create or replace view analytics.v_referral_traffic_daily as
select
  date_trunc('day', s.started_at)::date as day,
  count(distinct s.id) as referrals
from analytics.sessions s
where s.referrer is not null
group by 1
order by 1;

-- 6) Traffic share by source
create or replace view analytics.v_traffic_share as
select
  case 
    when s.referrer is null then 'Direct'
    when s.referrer like '%google%' then 'Google'
    when s.referrer like '%facebook%' then 'Facebook'
    when s.referrer like '%twitter%' then 'Twitter'
    when s.referrer like '%linkedin%' then 'LinkedIn'
    when s.referrer like '%reddit%' then 'Reddit'
    else 'Other'
  end as source,
  count(distinct s.id) as count
from analytics.sessions s
group by 1
order by count desc;

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
-- (Optional) Minimal “admin-friendly” default grants
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
-- create policy "ins pageviews" on analytics.pageviews for insert to authenticated with check (true);
-- create policy "ins events"    on analytics.events    for insert to authenticated with check (true);

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

---

# Frontend Tracker

// ================================================
// Citizens Revival Analytics Tracker Interfaces
// ================================================

/**
 * Represents the identifying and contextual information
 * about the user’s browser/device.
 */
export interface AnalyticsUser {
  anonId: string;             // Persistent UUID stored in localStorage or cookie
  firstSeenAt?: string;       // ISO string
  lastSeenAt?: string;
  isReturning?: boolean;
}

/**
 * Represents a single browsing session.
 */
export interface AnalyticsSession {
  sessionId: string;
  userId: string;
  startedAt: string;
  endedAt?: string;
  referrer?: string;
  landingPage?: string;
  landingPath?: string;
  utm?: Partial<UTMParams>;
  device?: DeviceInfo;
  geo?: GeoInfo;
}

/**
 * UTM parameters extracted from URL.
 */
export interface UTMParams {
  source: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

/**
 * Basic device / user agent info.
 */
export interface DeviceInfo {
  category: 'desktop' | 'mobile' | 'tablet' | 'bot' | 'unknown';
  browserName: string;
  browserVersion?: string;
  osName: string;
  osVersion?: string;
}

/**
 * Basic geolocation info (from IP or external API).
 */
export interface GeoInfo {
  country?: string;
  region?: string;
  city?: string;
}

/**
 * Represents a single custom event (e.g. button click, form submit).
 */
export interface AnalyticsEvent {
  name: string;                     // e.g. "lead_form_submitted"
  label?: string;                   // Human-readable label
  valueNum?: number;                // Optional numeric metric
  valueText?: string;               // Optional text value
  properties?: Record<string, any>; // Extra structured metadata
}

/**
 * Represents a pageview entry.
 */
export interface PageviewEvent {
  url: string;
  path: string;
  title?: string;
  referrer?: string;
  properties?: Record<string, any>;
}

// ================================================
// Public Tracker API
// ================================================

/**
 * The public API exposed by your frontend analytics tracker.
 */
export interface AnalyticsTracker {
  /** Initialize tracker — creates or restores user & session context. */
  init(): Promise<void>;

  /** Identify current user with a stable anonId (optional custom override). */
  identify(anonId?: string): Promise<void>;

  /** Manually start a new session (optional; usually automatic). */
  startSession(): Promise<void>;

  /** End current session (flush events, mark ended_at). */
  endSession(): Promise<void>;

  /** Track a pageview (e.g., on React Router route change). */
  trackPageview(event: PageviewEvent): Promise<void>;

  /** Track a custom event (click, form submission, etc.). */
  trackEvent(event: AnalyticsEvent): Promise<void>;

  /** Attach session-level metadata (e.g. after async location lookup). */
  updateSessionContext(context: Partial<Pick<AnalyticsSession, 'geo' | 'device' | 'utm'>>): Promise<void>;

  /** Return current context (useful for debugging or local dashboards). */
  getContext(): {
    user: AnalyticsUser | null;
    session: AnalyticsSession | null;
  };

  /** Optional: flush all pending events to Supabase manually. */
  flush(): Promise<void>;

  /** Optional: clear stored identifiers (e.g., GDPR “forget me”). */
  reset(): Promise<void>;
}

// ================================================
// Example Usage
// ================================================

/*
import { tracker } from './analyticsTracker';

await tracker.init();

tracker.trackPageview({
  url: window.location.href,
  path: window.location.pathname,
  title: document.title,
});

tracker.trackEvent({
  name: 'lead_form_submitted',
  label: 'Volunteer Sign-Up',
  properties: { role: 'vendor' },
});
*/

Notes for Implementation
Storage:
Save anonId (UUID) in localStorage and sessionId in sessionStorage.
Session auto-renewal:
Automatically start a new session if >30 minutes idle or browser closed.
Debounce network calls:
Batch events and pageviews before sending to Supabase Edge Function.
Initialization order:
init() should internally call identify() and startSession().
Type safety benefit:
Define all tracker calls strictly via these interfaces so your components stay decoupled from the backend structure.

---

# Edge Functions

## 1) `ingest.upsertUser`

Create or find a user by `anonId`, update `last_seen_at`.

**POST** `/ingest/upsert-user`
**From**: public tracker
**Auth**: anon key ok (RLS or service role on server side)
**Derive on server**: none

```ts
// zod
const UpsertUserReq = z.object({
  anonId: z.string().min(10),            // UUID-like string from client
  traits: z.record(z.any()).optional(),  // non-PII
});
type UpsertUserRes = { userId: string };
```

---

## 2) `ingest.startSession`

Start a new session linked to a user; capture first-hit context. Session timeout handled client-side, but server can close stale ones defensively.

**POST** `/ingest/start-session`
**From**: public tracker
**Auth**: anon key
**Derive on server**: none (except normalize)

```ts
const StartSessionReq = z.object({
  anonId: z.string(),
  sessionId: z.string().uuid(),          // client-generated is fine
  landingPage: z.string().url(),
  landingPath: z.string(),
  referrer: z.string().nullable(),
  utm: z.object({
    source: z.string().optional(),
    medium: z.string().optional(),
    campaign: z.string().optional(),
    term: z.string().optional(),
    content: z.string().optional(),
  }).partial().optional(),
  device: z.object({
    category: z.enum(['desktop','mobile','tablet','bot','unknown']),
    browserName: z.string(),
    browserVersion: z.string().optional(),
    osName: z.string(),
    osVersion: z.string().optional(),
  }).optional(),
  // client MAY omit network/geo; see server-derived variant below
});
type StartSessionRes = { sessionId: string; userId: string };
```

---

## 3) `ingest.endSession`

Mark session end and duration.

**POST** `/ingest/end-session`
**From**: public tracker
**Auth**: anon key

```ts
const EndSessionReq = z.object({
  sessionId: z.string().uuid(),
});
type EndSessionRes = { ok: true };
```

---

## 4) `ingest.trackPageview`

Append a pageview to a session.

**POST** `/ingest/pageview`
**From**: public tracker
**Auth**: anon key

```ts
const PageviewReq = z.object({
  sessionId: z.string().uuid(),
  userId: z.string().uuid(),
  url: z.string().url(),
  path: z.string(),
  title: z.string().optional(),
  referrer: z.string().nullable().optional(),
  properties: z.record(z.any()).optional(),
  occurredAt: z.string().datetime().optional(), // fallback to server now()
});
type PageviewRes = { id: number };
```

---

## 5) `ingest.trackEvent`

Custom events (clicks, form submits, etc.).

**POST** `/ingest/event`
**From**: public tracker
**Auth**: anon key

```ts
const EventReq = z.object({
  sessionId: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1),
  label: z.string().optional(),
  valueNum: z.number().optional(),
  valueText: z.string().optional(),
  properties: z.record(z.any()).optional(),
  occurredAt: z.string().datetime().optional(),
});
type EventRes = { id: number };
```

---

## 6) `ingest.batch`

High-throughput batching for mobile or flaky networks. Accepts mixed items.

**POST** `/ingest/batch`
**From**: public tracker
**Auth**: anon key
**Idempotency**: support `Idempotency-Key` header (dedupe within 24h)

```ts
const BatchReq = z.object({
  user: UpsertUserReq.optional(),
  session: StartSessionReq.optional(),
  pageviews: z.array(PageviewReq).optional(),
  events: z.array(EventReq).optional(),
});
type BatchRes = {
  userId?: string;
  sessionId?: string;
  pageviewIds?: number[];
  eventIds?: number[];
};
```

---

## 7) `ingest.updateSessionContext`

Attach late-arriving context: geo lookup results, refined device parsing, or campaign overrides (e.g., after router settles).

**POST** `/ingest/update-session-context`
**From**: public tracker
**Auth**: anon key

```ts
const UpdateSessionContextReq = z.object({
  sessionId: z.string().uuid(),
  geo: z.object({
    country: z.string().optional(),
    region: z.string().optional(),
    city: z.string().optional(),
  }).partial().optional(),
  device: StartSessionReq.shape.device.optional(),
  utm: StartSessionReq.shape.utm.optional(),
  properties: z.record(z.any()).optional(),
});
type UpdateSessionContextRes = { ok: true };
```

---

## 8) `ingest.heartbeat`

A lightweight “I’m still here” to keep long sessions accurate without spamming pageviews.

**POST** `/ingest/heartbeat`
**From**: public tracker
**Auth**: anon key

```ts
const HeartbeatReq = z.object({
  sessionId: z.string().uuid(),
  userId: z.string().uuid(),
});
type HeartbeatRes = { ok: true; serverTime: string };
```

---

## 9) `admin.export` (optional)

Server-side export for CSV/JSON with filters. Prefer running via service role and restricting to admin JWT.

**POST** `/admin/export`
**From**: admin UI only
**Auth**: service role (never expose anon)
**Output**: presigned URL or inline data (paginated)

```ts
const AdminExportReq = z.object({
  entity: z.enum(['users','sessions','events','pageviews']),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  filters: z.record(z.any()).optional(), // e.g., { eventName:'lead_form_submitted' }
  format: z.enum(['json','csv']).default('json'),
});
type AdminExportRes = { url?: string; rows?: unknown[]; count?: number };
```

---

# Cross-Cutting Concerns (do these inside the functions)

**1) Derive IP & UA server-side**
Never trust client for network identity. In *all ingest endpoints*:

* Pull IP from `X-Forwarded-For`/`CF-Connecting-IP`/`X-Real-IP`.
* Parse UA server-side (lightweight parse is fine).
* Optional: anonymize IP (e.g., zero out last octet for IPv4).

**2) Geo**

* Either (a) enrich asynchronously via a scheduled job, or
* (b) call a privacy-friendly IP-to-country lookup at ingest (cache results).
  Store only `country/region/city`.

**3) Validation & rate limits**

* Use Zod (above) to reject bad payloads with `400`.
* Add simple rate limits per IP + `anonId` for `/ingest/*`.

**4) Idempotency**

* For `/ingest/batch`, honor `Idempotency-Key` header + a hash of body; store a short-lived record to prevent duplicates.

**5) Clock safety**

* Prefer server timestamps; accept client times only as hints.

**6) Privacy**

* No PII by default. Keep `properties` generic.
* Provide a `reset` action in UI that calls a small helper (could reuse `upsertUser` logic to rotate `anonId` client-side; server just treats it as a new user).

---

# Suggested File Layout

```
/supabase/functions/
  ingest-upsert-user/index.ts
  ingest-start-session/index.ts
  ingest-end-session/index.ts
  ingest-pageview/index.ts
  ingest-event/index.ts
  ingest-batch/index.ts
  ingest-update-session-context/index.ts
  ingest-heartbeat/index.ts
  admin-export/index.ts            # optional
  _lib/db.ts                       # singleton Postgres client
  _lib/validation.ts               # zod schemas (from above)
  _lib/auth.ts                     # header parsing, admin checks
  _lib/identity.ts                 # ip/ua extraction, geo
  _lib/idempotency.ts              # store/replay keys
```

---

# Minimal DB touches per function

* `upsertUser` → `analytics.upsert_user_by_anon_id()` (from your schema) + update `last_seen_at`.
* `startSession` → insert into `analytics.sessions`.
* `endSession` → set `ended_at` where `id = sessionId`.
* `trackPageview` → insert into `analytics.pageviews`.
* `trackEvent` → insert into `analytics.events`.
* `batch` → conditionally run the above in a single transaction.
* `updateSessionContext` → update `analytics.sessions.properties` and `geo_*`, `device_*`, `utm_*`.
* `heartbeat` → optional: update `sessions.ended_at = now()` to extend “active until” or store a lightweight ping table.
* `admin.export` → `select` from views (`v_unique_users_daily`, `v_sessions_summary`, `v_event_rollup_daily`) or base tables with filters.

---

If you’d like, I can turn this into **ready-to-drop Edge Function starters** (Deno/TypeScript using Supabase’s `serve`), with the Zod validation and Postgres queries stubbed in.

---

# Todo List

### 1. **Database Schema Extension**
You need to add the analytics schema from the document to your Supabase database:

```sql
-- Add the analytics schema and tables from the document
-- This includes: users, sessions, pageviews, events tables
-- Plus the helpful views: v_unique_users_daily, v_sessions_summary, v_event_rollup_daily
```

### 2. **Supabase Edge Functions** (8 functions needed)
Create these edge functions in `/supabase/functions/`:
- `ingest-upsert-user/index.ts`
- `ingest-start-session/index.ts` 
- `ingest-end-session/index.ts`
- `ingest-pageview/index.ts`
- `ingest-event/index.ts`
- `ingest-batch/index.ts`
- `ingest-update-session-context/index.ts`
- `ingest-heartbeat/index.ts`
- `admin-export/index.ts` (optional)

### 3. **Frontend Analytics Tracker**
Create a TypeScript analytics tracker that implements the interfaces from the document:
- `src/lib/analyticsTracker.ts` - Main tracker implementation
- `src/lib/analyticsTypes.ts` - TypeScript interfaces
- Integration with React Router for automatic pageview tracking
- Event tracking for form submissions, button clicks, etc.

### 4. **Admin Analytics Dashboard**
Extend your existing admin system with new pages:
- **Analytics Overview** (`/manage/analytics`) - Dashboard with charts
- **Users Page** (`/manage/analytics/users`) - User analysis
- **Sessions Page** (`/manage/analytics/sessions`) - Session analysis  
- **Session Detail Page** (`/manage/analytics/sessions/:id`) - Individual session replay
- **Events Page** (`/manage/analytics/events`) - Event analysis

### 5. **Additional Dependencies**
You'll need to add these packages:
```bash
npm install zod  # For validation in edge functions
npm install recharts  # For analytics charts
npm install date-fns  # Already installed ✅
```

### 6. **Configuration Updates**
- Update your Supabase config to include the analytics schema
- Add analytics to your admin navigation
- Configure CORS for the edge functions

## Implementation Priority

1. **Database Schema** - Add analytics tables and views
2. **Edge Functions** - Create the 8 ingest functions
3. **Frontend Tracker** - Basic tracking implementation
4. **Admin Dashboard** - Analytics overview page
5. **Advanced Features** - Detailed session analysis, event tracking

### 7. Update Terms and Privacy
- Update TermsAndConditions.md appropiately
- Update PrivacyPolicy.md appropiately

---

# Implementation Summary

## ✅ Completed Features

### 1. Database Schema
- ✅ Created migration `20250109000001_analytics_schema.sql`
- ✅ Analytics schema with users, sessions, pageviews, events tables
- ✅ Helpful views: `v_unique_users_daily`, `v_sessions_summary`, `v_event_rollup_daily`
- ✅ Convenience function: `analytics.upsert_user_by_anon_id()`

### 2. Supabase Edge Functions (8 functions)
- ✅ `ingest-upsert-user/index.ts` - Create/update users
- ✅ `ingest-start-session/index.ts` - Start new sessions
- ✅ `ingest-end-session/index.ts` - End sessions
- ✅ `ingest-pageview/index.ts` - Track pageviews
- ✅ `ingest-event/index.ts` - Track custom events
- ✅ `ingest-batch/index.ts` - Batch operations
- ✅ `ingest-update-session-context/index.ts` - Update session metadata
- ✅ `ingest-heartbeat/index.ts` - Session heartbeat

### 3. Frontend Analytics Tracker
- ✅ `src/lib/analyticsTypes.ts` - TypeScript interfaces
- ✅ `src/lib/analyticsTracker.ts` - Main tracker implementation
- ✅ Automatic session management (30min timeout)
- ✅ Device/browser detection
- ✅ UTM parameter extraction
- ✅ Event batching and flushing
- ✅ GDPR-compliant reset functionality

### 4. Admin Analytics Dashboard
- ✅ `src/admin/analytics/AnalyticsOverview.tsx` - Main dashboard
- ✅ `src/admin/analytics/UsersPage.tsx` - User analysis
- ✅ `src/admin/analytics/SessionsPage.tsx` - Session analysis
- ✅ `src/admin/analytics/EventsPage.tsx` - Event analysis
- ✅ Integrated into admin navigation
- ✅ Responsive design with charts (Recharts)

### 5. Dependencies
- ✅ Added `zod` for validation
- ✅ Added `recharts` for charts
- ✅ No conflicts with existing packages

### 6. Test Data
- ✅ Added comprehensive test data to `supabase/seed.sql`
- ✅ 5 test users with realistic sessions
- ✅ 8 pageviews across different pages
- ✅ 10 custom events (CTA clicks, form submissions, etc.)

## 🔄 Missing Features (To Be Implemented)

### 1. Real Data Integration
- **TODO**: Replace mock data in dashboard components with actual Supabase queries
- **TODO**: Implement data fetching hooks/services for analytics
- **TODO**: Add loading states and error handling

### 2. Advanced Analytics Features
- **TODO**: Session Detail Page (`/manage/analytics/sessions/:id`)
- **TODO**: Real-time analytics updates
- **TODO**: Export functionality (CSV/JSON)
- **TODO**: Advanced filtering and date range selection
- **TODO**: Geographic map visualization

### 3. Privacy & Compliance
- **TODO**: IP anonymization implementation
- **TODO**: Data retention policies
- **TODO**: GDPR compliance features
- **TODO**: Cookie consent integration

### 4. Performance & Monitoring
- **TODO**: Analytics data aggregation jobs
- **TODO**: Performance monitoring for edge functions
- **TODO**: Rate limiting implementation
- **TODO**: Error tracking and logging

### 5. Frontend Integration
- **TODO**: Integrate analytics tracker into main app
- **TODO**: Automatic pageview tracking on route changes
- **TODO**: Event tracking for form submissions
- **TODO**: Custom event tracking for user interactions

### 6. Configuration & Settings
- **TODO**: Analytics settings page
- **TODO**: Event tracking configuration
- **TODO**: Data retention settings
- **TODO**: Privacy controls

## 🚀 Next Steps

1. **Run the migration**: `supabase db push`
2. **Deploy edge functions**: `supabase functions deploy`
3. **Test the analytics dashboard**: Navigate to `/manage/analytics`
4. **Integrate frontend tracking**: Add analytics tracker to main app
5. **Replace mock data**: Implement real Supabase queries
6. **Add real-time features**: WebSocket updates for live analytics

## 📝 Implementation Notes

- All components use mock data for now - replace with real Supabase queries
- Edge functions are ready to deploy but need testing
- Analytics tracker is ready to integrate into the main app
- Test data provides realistic scenarios for development
- Navigation is fully integrated and responsive
- Charts are implemented with Recharts library
- All TypeScript interfaces are properly defined

## 🔧 Configuration Required

1. **Supabase Environment**: Ensure analytics schema is deployed
2. **Edge Functions**: Deploy all 8 functions to Supabase
3. **CORS Settings**: Configure CORS for edge functions
4. **RLS Policies**: Enable Row Level Security if needed
5. **Admin Permissions**: Ensure admin users can access analytics

## 📊 Analytics Data Structure

The analytics system tracks:
- **Users**: Anonymous users with persistent IDs
- **Sessions**: Browsing sessions with device/geo info
- **Pageviews**: Individual page visits with referrer data
- **Events**: Custom user interactions (clicks, form submissions, etc.)

All data is stored in the `analytics` schema with proper indexing for performance.
