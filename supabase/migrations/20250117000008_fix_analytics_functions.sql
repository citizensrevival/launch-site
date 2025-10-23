-- Fix analytics functions and add missing upsert_user_by_anon_id function

-- Drop existing functions to avoid conflicts
DROP FUNCTION IF EXISTS public.exclude_user(UUID, TEXT, INET, TEXT, TEXT, UUID);
DROP FUNCTION IF EXISTS public.is_user_excluded(UUID, TEXT, INET, TEXT);
DROP FUNCTION IF EXISTS public.remove_exclusion(UUID, TEXT, INET, TEXT);

-- Create upsert_user_by_anon_id function
CREATE OR REPLACE FUNCTION public.upsert_user_by_anon_id(
    p_anon_id TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Try to find existing user by anon_id
    SELECT id INTO user_id FROM public.users WHERE anon_id = p_anon_id;
    
    IF user_id IS NOT NULL THEN
        -- Update last_seen_at
        UPDATE public.users 
        SET last_seen_at = NOW() 
        WHERE id = user_id;
        RETURN user_id;
    ELSE
        -- Create new user
        INSERT INTO public.users (anon_id, first_seen_at, last_seen_at)
        VALUES (p_anon_id, NOW(), NOW())
        RETURNING id INTO user_id;
        RETURN user_id;
    END IF;
END;
$$;

-- Fix the is_user_excluded function to handle type mismatches
CREATE OR REPLACE FUNCTION public.is_user_excluded(
    p_user_id UUID DEFAULT NULL,
    p_session_id TEXT DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_anon_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.excluded_users
        WHERE (p_user_id IS NOT NULL AND user_id = p_user_id)
           OR (p_session_id IS NOT NULL AND session_id = p_session_id)
           OR (p_ip_address IS NOT NULL AND ip_address = p_ip_address)
           OR (p_anon_id IS NOT NULL AND anon_id = p_anon_id)
    );
END;
$$;

-- Fix the exclude_user function to handle invalid UUIDs
CREATE OR REPLACE FUNCTION public.exclude_user(
    p_user_id UUID DEFAULT NULL,
    p_session_id TEXT DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_anon_id TEXT DEFAULT NULL,
    p_reason TEXT DEFAULT 'Manual exclusion',
    p_excluded_by TEXT DEFAULT 'system'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    exclusion_id UUID;
    excluded_by_uuid UUID;
BEGIN
    -- Try to convert excluded_by to UUID, use NULL if invalid
    BEGIN
        excluded_by_uuid := p_excluded_by::UUID;
    EXCEPTION WHEN OTHERS THEN
        excluded_by_uuid := NULL;
    END;

    -- Check if already excluded
    IF public.is_user_excluded(p_user_id, p_session_id, p_ip_address, p_anon_id) THEN
        -- Return existing exclusion ID
        SELECT id INTO exclusion_id FROM public.excluded_users
        WHERE (p_user_id IS NOT NULL AND user_id = p_user_id)
           OR (p_session_id IS NOT NULL AND session_id = p_session_id)
           OR (p_ip_address IS NOT NULL AND ip_address = p_ip_address)
           OR (p_anon_id IS NOT NULL AND anon_id = p_anon_id)
        LIMIT 1;
        RETURN exclusion_id;
    END IF;

    -- Insert new exclusion
    INSERT INTO public.excluded_users (
        user_id, session_id, ip_address, anon_id, reason, excluded_by
    ) VALUES (
        p_user_id, p_session_id, p_ip_address, p_anon_id, p_reason, excluded_by_uuid
    ) RETURNING id INTO exclusion_id;

    RETURN exclusion_id;
END;
$$;

-- Fix the remove_exclusion function
CREATE OR REPLACE FUNCTION public.remove_exclusion(
    p_user_id UUID DEFAULT NULL,
    p_session_id TEXT DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_anon_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.excluded_users
    WHERE (p_user_id IS NOT NULL AND user_id = p_user_id)
       OR (p_session_id IS NOT NULL AND session_id = p_session_id)
       OR (p_ip_address IS NOT NULL AND ip_address = p_ip_address)
       OR (p_anon_id IS NOT NULL AND anon_id = p_anon_id);

    RETURN FOUND;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.upsert_user_by_anon_id TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_excluded TO authenticated;
GRANT EXECUTE ON FUNCTION public.exclude_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_exclusion TO authenticated;
