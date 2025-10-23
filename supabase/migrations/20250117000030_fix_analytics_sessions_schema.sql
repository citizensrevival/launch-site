-- Fix analytics_sessions table schema
-- This migration updates the analytics_sessions table to include all fields expected by the analytics functions

-- Drop the existing analytics_sessions table and recreate it with the correct schema
DROP TABLE IF EXISTS public.analytics_sessions CASCADE;

CREATE TABLE public.analytics_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.analytics_users(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  duration_ms integer,
  page_count integer DEFAULT 0,
  event_count integer DEFAULT 0,
  properties jsonb DEFAULT '{}',
  -- Additional fields expected by analytics functions
  landing_page text,
  landing_path text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  user_agent text,
  device_category text,
  browser_name text,
  browser_version text,
  os_name text,
  os_version text,
  is_bot boolean DEFAULT false,
  ip_address inet,
  geo_country text,
  geo_region text,
  geo_city text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_analytics_sessions_user_id ON public.analytics_sessions(user_id);
CREATE INDEX idx_analytics_sessions_session_id ON public.analytics_sessions(session_id);
CREATE INDEX idx_analytics_sessions_started_at ON public.analytics_sessions(started_at);
CREATE INDEX idx_analytics_sessions_ended_at ON public.analytics_sessions(ended_at);

-- Enable RLS
ALTER TABLE public.analytics_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "analytics_sessions_allow_authenticated" ON public.analytics_sessions
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Grant permissions
GRANT ALL ON public.analytics_sessions TO authenticated;
GRANT ALL ON public.analytics_sessions TO anon;
