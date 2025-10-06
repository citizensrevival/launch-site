-- ─────────────────────────────────────────────────────────────────────────────
-- Prereqs (UUID generation, schema access)
-- ─────────────────────────────────────────────────────────────────────────────
create extension if not exists pgcrypto;  -- for gen_random_uuid()

grant usage on schema public to anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- Enum to identify audience/intent
-- ─────────────────────────────────────────────────────────────────────────────
do $$
begin
  if not exists (select 1 from pg_type where typname = 'lead_type') then
    create type lead_type as enum ('subscriber', 'vendor', 'sponsor', 'volunteer');
  end if;
end$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Leads table (single table for all forms)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  lead_kind lead_type not null,                 -- subscriber | vendor | sponsor | volunteer
  business_name text,                           -- vendors/sponsors
  contact_name text,                            -- vendors/sponsors/volunteers
  email text not null check (position('@' in email) > 1),
  phone text,                                   -- optional, any audience
  website text,
  social_links text[] default '{}',             -- zero-or-more
  source_path text,                             -- page/path the form was submitted from
  tags text[] default '{}',                     -- optional labels
  meta jsonb default '{}'::jsonb,               -- spare field for future (utm, etc.)
  created_at timestamptz not null default now()
);

-- Basic index helpers
create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_kind_idx      on public.leads (lead_kind);
create index if not exists leads_email_idx     on public.leads (email);

-- ─────────────────────────────────────────────────────────────────────────────
-- Admins table to gate access
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Enable Row Level Security (RLS)
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.leads  enable row level security;
alter table public.admins enable row level security;

-- ─────────────────────────────────────────────────────────────────────────────
-- Policies for leads
--   - Public (anon + authenticated) can INSERT
--   - Only admins (present in public.admins) can SELECT/UPDATE/DELETE
-- ─────────────────────────────────────────────────────────────────────────────

-- Insert: open to anon & authenticated (RLS still enforces table constraints)
drop policy if exists "public can insert leads" on public.leads;
create policy "public can insert leads"
  on public.leads
  for insert
  to anon, authenticated
  with check ( true );

-- Select: only admins
drop policy if exists "only admins can select leads" on public.leads;
create policy "only admins can select leads"
  on public.leads
  for select
  to authenticated
  using ( exists (select 1 from public.admins a where a.user_id = auth.uid()) );

-- Update: only admins
drop policy if exists "admins can update leads" on public.leads;
create policy "admins can update leads"
  on public.leads
  for update
  to authenticated
  using ( exists (select 1 from public.admins a where a.user_id = auth.uid()) )
  with check ( exists (select 1 from public.admins a where a.user_id = auth.uid()) );

-- Delete: only admins
drop policy if exists "admins can delete leads" on public.leads;
create policy "admins can delete leads"
  on public.leads
  for delete
  to authenticated
  using ( exists (select 1 from public.admins a where a.user_id = auth.uid()) );

-- ─────────────────────────────────────────────────────────────────────────────
-- Policies for admins (optional convenience: let a user see their own row)
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "self can select own admin row" on public.admins;
create policy "self can select own admin row"
  on public.admins
  for select
  to authenticated
  using ( user_id = auth.uid() );

-- ─────────────────────────────────────────────────────────────────────────────
-- Privileges (RLS is the real gate; explicit grants avoid privilege surprises)
-- ─────────────────────────────────────────────────────────────────────────────
grant insert on public.leads to anon, authenticated;                 -- public inserts
grant select, update, delete on public.leads to authenticated;       -- admins pass RLS

-- (Optional) allow seeing your own admin row
grant select on public.admins to authenticated;
