-- Fix the exclude_user function to handle type mismatches properly

-- Drop and recreate the function with proper type handling
DROP FUNCTION IF EXISTS public.exclude_user(UUID, TEXT, INET, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.exclude_user(
    p_user_id UUID DEFAULT NULL,
    p_session_id TEXT DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_anon_id TEXT DEFAULT NULL,
    p_reason TEXT DEFAULT 'Manual exclusion',
    p_excluded_by TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    exclusion_id UUID;
    excluded_by_uuid UUID;
    session_id_uuid UUID;
BEGIN
    -- Try to convert excluded_by to UUID, use NULL if invalid or empty
    IF p_excluded_by IS NOT NULL AND p_excluded_by != '' AND p_excluded_by != 'system' AND p_excluded_by != 'admin' THEN
        BEGIN
            excluded_by_uuid := p_excluded_by::UUID;
        EXCEPTION WHEN OTHERS THEN
            excluded_by_uuid := NULL;
        END;
    ELSE
        excluded_by_uuid := NULL;
    END IF;

    -- Try to convert session_id to UUID if it's a valid UUID string
    IF p_session_id IS NOT NULL AND p_session_id != '' THEN
        BEGIN
            session_id_uuid := p_session_id::UUID;
        EXCEPTION WHEN OTHERS THEN
            session_id_uuid := NULL;
        END;
    ELSE
        session_id_uuid := NULL;
    END IF;

    -- Check if already excluded
    IF public.is_user_excluded(p_user_id, p_session_id, p_ip_address, p_anon_id) THEN
        -- Return existing exclusion ID
        SELECT id INTO exclusion_id FROM public.excluded_users
        WHERE (p_user_id IS NOT NULL AND user_id = p_user_id)
           OR (session_id_uuid IS NOT NULL AND session_id = session_id_uuid)
           OR (p_ip_address IS NOT NULL AND ip_address = p_ip_address)
           OR (p_anon_id IS NOT NULL AND anon_id = p_anon_id)
        LIMIT 1;
        RETURN exclusion_id;
    END IF;

    -- Insert new exclusion
    INSERT INTO public.excluded_users (
        user_id, session_id, ip_address, anon_id, reason, excluded_by
    ) VALUES (
        p_user_id, session_id_uuid, p_ip_address, p_anon_id, p_reason, excluded_by_uuid
    ) RETURNING id INTO exclusion_id;

    RETURN exclusion_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.exclude_user TO authenticated;
