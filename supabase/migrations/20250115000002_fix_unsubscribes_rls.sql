-- ─────────────────────────────────────────────────────────────────────────────
-- Fix RLS policy for unsubscribes table to allow both anonymous and authenticated users
-- ─────────────────────────────────────────────────────────────────────────────

-- Drop existing policies to ensure clean state
drop policy if exists "Allow anonymous unsubscribe insert" on public.unsubscribes;
drop policy if exists "Allow authenticated users to view unsubscribes" on public.unsubscribes;

-- Recreate insert policy for both anonymous and authenticated users
create policy "Allow public unsubscribe insert"
  on public.unsubscribes
  for insert
  to anon, authenticated
  with check (true);

-- Recreate select policy for authenticated users (for admin purposes)
create policy "Allow authenticated users to view unsubscribes"
  on public.unsubscribes
  for select
  to authenticated
  using (true);

-- Update grants to include both anon and authenticated
grant insert on public.unsubscribes to anon, authenticated;
grant select on public.unsubscribes to authenticated;
