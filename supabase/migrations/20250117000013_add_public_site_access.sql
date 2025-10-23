-- Add public read access to the site table

-- Create a policy for public read access to sites
CREATE POLICY "public_read_sites" ON public.site
    FOR SELECT
    USING (true);

-- Grant select permission to anonymous users
GRANT SELECT ON public.site TO anon;
