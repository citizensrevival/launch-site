-- Add missing columns to sessions table for analytics Edge Functions

-- Add browser_version column
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS browser_version TEXT;

-- Add os_version column  
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS os_version TEXT;
