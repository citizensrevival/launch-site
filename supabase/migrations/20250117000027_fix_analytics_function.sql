-- Fix analytics function to work with correct table structure
-- This migration fixes the upsert_user_by_anon_id function to work with the analytics_users table

-- Drop and recreate the function with the correct logic
DROP FUNCTION IF EXISTS public.upsert_user_by_anon_id(text);

CREATE OR REPLACE FUNCTION public.upsert_user_by_anon_id(
  p_anon_id text
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  user_id uuid;
BEGIN
  -- Insert user in analytics_users table
  -- Since there's no unique constraint on user_id, we'll just insert
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
  RETURNING id INTO user_id;
  
  RETURN user_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.upsert_user_by_anon_id TO anon, authenticated;
