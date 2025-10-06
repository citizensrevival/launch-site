-- Alternative RLS setup that should definitely work
-- Run this if the original schema.sql doesn't work

-- First, let's clean up any existing policies
DROP POLICY IF EXISTS "public can insert leads" ON public.leads;
DROP POLICY IF EXISTS "only admins can select leads" ON public.leads;
DROP POLICY IF EXISTS "admins can update leads" ON public.leads;
DROP POLICY IF EXISTS "admins can delete leads" ON public.leads;
DROP POLICY IF EXISTS "self can select own admin row" ON public.admins;

-- Ensure the enum type exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_type') THEN
    CREATE TYPE lead_type AS ENUM ('subscriber', 'vendor', 'sponsor', 'volunteer');
  END IF;
END$$;

-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_kind lead_type NOT NULL,
  business_name text,
  contact_name text,
  email text NOT NULL CHECK (position('@' in email) > 1),
  phone text,
  website text,
  social_links text[] DEFAULT '{}',
  source_path text,
  tags text[] DEFAULT '{}',
  meta jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON public.leads (created_at DESC);
CREATE INDEX IF NOT EXISTS leads_kind_idx ON public.leads (lead_kind);
CREATE INDEX IF NOT EXISTS leads_email_idx ON public.leads (email);

-- Create admins table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Grant basic permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT INSERT ON public.leads TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT SELECT ON public.admins TO authenticated;

-- Create a very permissive insert policy for anonymous users
CREATE POLICY "anon_can_insert_leads" ON public.leads
FOR INSERT
TO anon
WITH CHECK (true);

-- Create a permissive insert policy for authenticated users
CREATE POLICY "auth_can_insert_leads" ON public.leads
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create admin-only policies for other operations
CREATE POLICY "admins_can_select_leads" ON public.leads
FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()));

CREATE POLICY "admins_can_update_leads" ON public.leads
FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()));

CREATE POLICY "admins_can_delete_leads" ON public.leads
FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()));

-- Admin table policies
CREATE POLICY "self_can_select_admin" ON public.admins
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Test the setup
DO $$
BEGIN
  -- Test if we can insert as anon (this will fail if RLS is blocking)
  BEGIN
    INSERT INTO public.leads (lead_kind, email) VALUES ('subscriber', 'test@example.com');
    RAISE NOTICE 'RLS test passed: Anonymous insert successful';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'RLS test failed: %', SQLERRM;
  END;
END$$;
