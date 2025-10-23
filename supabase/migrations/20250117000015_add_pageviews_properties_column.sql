-- Add properties column to pageviews table for analytics Edge Functions

-- Add properties column as JSONB to store additional pageview data
ALTER TABLE public.pageviews ADD COLUMN IF NOT EXISTS properties JSONB DEFAULT '{}'::jsonb;
