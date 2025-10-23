-- Add analytics exclusion functions
-- These functions handle user/session exclusions for analytics

-- Create excluded_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.excluded_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    session_id TEXT,
    ip_address INET,
    anon_id TEXT,
    reason TEXT NOT NULL,
    excluded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add excluded_by column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'excluded_users' AND column_name = 'excluded_by') THEN
        ALTER TABLE public.excluded_users ADD COLUMN excluded_by UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Enable RLS
ALTER TABLE public.excluded_users ENABLE ROW LEVEL SECURITY;

-- Create policies for excluded_users
CREATE POLICY "Users can view their own exclusions" ON public.excluded_users
    FOR SELECT USING (auth.uid() = excluded_by);

CREATE POLICY "Users can insert their own exclusions" ON public.excluded_users
    FOR INSERT WITH CHECK (auth.uid() = excluded_by);

CREATE POLICY "Users can update their own exclusions" ON public.excluded_users
    FOR UPDATE USING (auth.uid() = excluded_by);

CREATE POLICY "Users can delete their own exclusions" ON public.excluded_users
    FOR DELETE USING (auth.uid() = excluded_by);

-- Function to check if a user is excluded
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

-- Function to exclude a user
CREATE OR REPLACE FUNCTION public.exclude_user(
    p_user_id UUID DEFAULT NULL,
    p_session_id TEXT DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_anon_id TEXT DEFAULT NULL,
    p_reason TEXT DEFAULT 'Manual exclusion',
    p_excluded_by UUID DEFAULT auth.uid()
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    exclusion_id UUID;
BEGIN
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
        p_user_id, p_session_id, p_ip_address, p_anon_id, p_reason, p_excluded_by
    ) RETURNING id INTO exclusion_id;

    RETURN exclusion_id;
END;
$$;

-- Function to remove exclusion
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
GRANT EXECUTE ON FUNCTION public.is_user_excluded TO authenticated;
GRANT EXECUTE ON FUNCTION public.exclude_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_exclusion TO authenticated;
