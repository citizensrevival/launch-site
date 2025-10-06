-- Temporarily disable RLS for testing
-- Run this in your Supabase SQL Editor

-- Disable RLS on the leads table
ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity, forcerowsecurity
FROM pg_tables
WHERE tablename = 'leads';

-- Test insert to verify it works
INSERT INTO public.leads (lead_kind, email)
VALUES ('subscriber', 'test-no-rls@example.com');

-- Check the insert worked
SELECT * FROM public.leads WHERE email = 'test-no-rls@example.com';

-- Clean up test data
DELETE FROM public.leads WHERE email = 'test-no-rls@example.com';
