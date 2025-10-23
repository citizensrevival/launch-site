-- Add Missing Analytics Functions
-- This migration adds the missing analytics functions that the application expects

-- Create the missing upsert_user_by_anon_id function for analytics
CREATE OR REPLACE FUNCTION public.upsert_user_by_anon_id(
  p_anon_id text
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  user_id uuid;
BEGIN
  -- Insert or update user in analytics_users table
  INSERT INTO public.analytics_users (
    user_id,
    first_seen_at,
    last_seen_at,
    properties
  ) VALUES (
    gen_random_uuid(),
    now(),
    now(),
    '{}'::jsonb
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    last_seen_at = now()
  RETURNING id INTO user_id;
  
  RETURN user_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.upsert_user_by_anon_id TO anon, authenticated;
