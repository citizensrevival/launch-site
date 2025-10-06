-- Re-enable RLS after testing
-- Run this in your Supabase SQL Editor when you're done testing

-- Re-enable RLS on the leads table
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Recreate the permissive insert policies
DROP POLICY IF EXISTS "anon_can_insert_leads" ON public.leads;
DROP POLICY IF EXISTS "auth_can_insert_leads" ON public.leads;

CREATE POLICY "anon_can_insert_leads" ON public.leads
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "auth_can_insert_leads" ON public.leads
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Verify RLS is enabled and policies exist
SELECT schemaname, tablename, rowsecurity, forcerowsecurity
FROM pg_tables
WHERE tablename = 'leads';

SELECT policyname, roles, cmd
FROM pg_policies
WHERE tablename = 'leads';
