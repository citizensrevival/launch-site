-- Add missing columns to system_sites table
-- This migration adds default_locale and slug columns to system_sites

-- Add default_locale column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'system_sites' AND column_name = 'default_locale') THEN
        ALTER TABLE public.system_sites ADD COLUMN default_locale text NOT NULL DEFAULT 'en';
    END IF;
END $$;

-- Add slug column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'system_sites' AND column_name = 'slug') THEN
        ALTER TABLE public.system_sites ADD COLUMN slug text NOT NULL DEFAULT 'default';
    END IF;
END $$;

-- Add unique constraint on slug if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE table_name = 'system_sites' AND constraint_name = 'system_sites_slug_unique') THEN
        ALTER TABLE public.system_sites ADD CONSTRAINT system_sites_slug_unique UNIQUE (slug);
    END IF;
END $$;

-- Update existing system_sites record to have proper values
UPDATE public.system_sites 
SET 
    default_locale = 'en',
    slug = 'aztec'
WHERE slug = 'default' OR slug IS NULL;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.system_sites TO anon, authenticated;
