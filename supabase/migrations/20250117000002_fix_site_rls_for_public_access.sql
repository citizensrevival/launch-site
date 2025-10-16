-- Fix RLS policies for site table to allow public read access
-- Anonymous and authenticated users should be able to read site data

-- Drop the existing restrictive policy
drop policy if exists "manage_sites" on site;

-- Create a new policy that allows public read access to sites
create policy "public_read_sites" on site
  for select
  to anon, authenticated
  using (true);

-- Keep the admin-only policy for write operations
create policy "admin_manage_sites" on site
  for all
  to authenticated
  using (has_permission(auth.uid(), 'system.admin'))
  with check (has_permission(auth.uid(), 'system.admin'));

-- Grant necessary permissions
grant select on site to anon, authenticated;
grant insert, update, delete on site to authenticated;
