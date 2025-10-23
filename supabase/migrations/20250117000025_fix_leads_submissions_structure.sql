-- Fix leads_submissions table structure to match original leads table
-- This migration restores the leads_submissions table to have the same structure as the original leads table

-- Drop the current leads_submissions table and recreate it with the original structure
DROP TABLE IF EXISTS public.leads_submissions CASCADE;

-- Recreate leads_submissions with the original leads table structure
CREATE TABLE public.leads_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_kind text NOT NULL,                    -- subscriber | vendor | sponsor | volunteer
  business_name text,                         -- vendors/sponsors
  contact_name text,                          -- vendors/sponsors/volunteers
  email text NOT NULL CHECK (position('@' in email) > 1),
  phone text,                                 -- optional, any audience
  website text,
  social_links text[] DEFAULT '{}',          -- zero-or-more
  source_path text,                           -- page/path the form was submitted from
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add unique constraint on email and lead_kind (same as original)
ALTER TABLE public.leads_submissions 
ADD CONSTRAINT leads_submissions_email_lead_kind_unique 
UNIQUE (email, lead_kind);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads_submissions TO anon, authenticated;

-- Recreate the upsert_lead function to work with the corrected table structure
CREATE OR REPLACE FUNCTION public.upsert_lead(
  p_lead_kind text,
  p_email text,
  p_business_name text DEFAULT NULL,
  p_contact_name text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_website text DEFAULT NULL,
  p_social_links text[] DEFAULT '{}',
  p_source_path text DEFAULT NULL,
  p_meta jsonb DEFAULT '{}',
  p_tags text[] DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  lead_id uuid;
BEGIN
  -- Insert into leads_submissions table with the original structure
  INSERT INTO public.leads_submissions (
    lead_kind, business_name, contact_name, email, phone, website, social_links, source_path
  ) VALUES (
    p_lead_kind, p_business_name, p_contact_name, p_email, p_phone, p_website, p_social_links, p_source_path
  )
  ON CONFLICT (email, lead_kind) 
  DO UPDATE SET
    business_name = EXCLUDED.business_name,
    contact_name = EXCLUDED.contact_name,
    phone = EXCLUDED.phone,
    website = EXCLUDED.website,
    social_links = EXCLUDED.social_links,
    source_path = EXCLUDED.source_path,
    updated_at = now()
  RETURNING id INTO lead_id;
  
  RETURN lead_id;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.upsert_lead TO anon, authenticated;
