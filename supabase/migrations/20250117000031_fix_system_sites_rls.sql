-- Fix RLS policies for system_sites to allow anonymous access
-- This migration updates the RLS policies to allow public read access to system_sites

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "system_sites_allow_authenticated" ON public.system_sites;

-- Create a new policy that allows public read access
CREATE POLICY "system_sites_allow_public_read" ON public.system_sites
    FOR SELECT USING (true);

-- Grant necessary permissions
GRANT SELECT ON public.system_sites TO anon, authenticated;
