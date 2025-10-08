-- ─────────────────────────────────────────────────────────────────────────────
-- Fix RLS policy for leads table to allow anonymous users to insert
-- ─────────────────────────────────────────────────────────────────────────────

-- Drop existing policies to ensure clean state
drop policy if exists "public can insert leads" on public.leads;
drop policy if exists "only admins can select leads" on public.leads;
drop policy if exists "admins can update leads" on public.leads;
drop policy if exists "admins can delete leads" on public.leads;

-- Recreate insert policy for anonymous users
create policy "public can insert leads"
  on public.leads
  for insert
  to anon, authenticated
  with check ( true );

-- Recreate select policy for admins only
create policy "only admins can select leads"
  on public.leads
  for select
  to authenticated
  using ( exists (select 1 from public.admins a where a.user_id = auth.uid()) );

-- Recreate update policy for admins only
create policy "admins can update leads"
  on public.leads
  for update
  to authenticated
  using ( exists (select 1 from public.admins a where a.user_id = auth.uid()) )
  with check ( exists (select 1 from public.admins a where a.user_id = auth.uid()) );

-- Recreate delete policy for admins only
create policy "admins can delete leads"
  on public.leads
  for delete
  to authenticated
  using ( exists (select 1 from public.admins a where a.user_id = auth.uid()) );

-- Ensure proper grants are in place
grant insert on public.leads to anon, authenticated;
grant select, update, delete on public.leads to authenticated;

-- Verify RLS is enabled
alter table public.leads enable row level security;
