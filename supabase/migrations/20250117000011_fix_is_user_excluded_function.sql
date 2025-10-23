-- Fix the is_user_excluded function to handle type mismatches properly

-- Drop and recreate the function with proper type handling
DROP FUNCTION IF EXISTS public.is_user_excluded(UUID, TEXT, INET, TEXT);

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
           OR (p_session_id IS NOT NULL AND session_id::TEXT = p_session_id)
           OR (p_ip_address IS NOT NULL AND ip_address = p_ip_address)
           OR (p_anon_id IS NOT NULL AND anon_id = p_anon_id)
    );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_user_excluded TO authenticated;
