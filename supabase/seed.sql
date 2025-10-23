-- Seed data for local development
-- This file is automatically loaded when running `supabase db reset`

-- Create a test admin user for local development
-- Email: pwningcode@gmail.com
-- Password: testpassword123
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'pwningcode@gmail.com',
  crypt('testpassword123', gen_salt('bf')),
  now(),
  null,
  null,
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- Add the user to the system_user_permissions table
INSERT INTO system_user_permissions (user_id, permissions)
SELECT 
  id,
  ARRAY[
    'system.admin',
    'cms.pages.read', 'cms.pages.write', 'cms.pages.publish', 'cms.pages.delete',
    'cms.blocks.read', 'cms.blocks.write', 'cms.blocks.publish', 'cms.blocks.delete',
    'cms.menus.read', 'cms.menus.write', 'cms.menus.publish', 'cms.menus.delete',
    'cms.assets.read', 'cms.assets.write', 'cms.assets.publish', 'cms.assets.delete',
    'users.manage', 'users.read', 'users.write', 'users.delete',
    'audit.read', 'audit.write'
  ]
FROM auth.users WHERE email = 'pwningcode@gmail.com';

-- Create the main site with a proper UUID
INSERT INTO system_sites (id, name, domain, settings)
VALUES (
  gen_random_uuid(),
  'Aztec Citizens Revival',
  'aztec-citizens-revival.local',
  '{"default_locale": "en-US", "slug": "aztec"}'::jsonb
);

-- Verify the site was created
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM system_sites WHERE domain = 'aztec-citizens-revival.local') THEN
    RAISE EXCEPTION 'Site creation failed - no site found with domain aztec-citizens-revival.local';
  END IF;
  RAISE NOTICE 'Site created successfully: aztec-citizens-revival.local';
END $$;

-- Create the site-specific storage bucket
-- Note: This requires the service role key or manual creation in dashboard
-- We'll create the bucket with a simple name format
DO $$
DECLARE
  site_uuid uuid;
BEGIN
  -- Get the site ID
  SELECT id INTO site_uuid FROM system_sites WHERE domain = 'aztec-citizens-revival.local';
  
  IF site_uuid IS NOT NULL THEN
    -- Create bucket with site ID as bucket name
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      site_uuid,
      site_uuid,
      true,
      52428800, -- 50MB in bytes
      ARRAY['image/*', 'video/*', 'application/*']
    ) ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Created storage bucket: % for site: %', site_uuid, site_uuid;
  ELSE
    RAISE EXCEPTION 'Site not found - cannot create bucket';
  END IF;
END $$;

-- Note: User permissions are already set above in the system_user_permissions table

-- Log the initial setup
INSERT INTO system_audit_log (user_id, action, entity_type, entity_id, new_values)
SELECT 
  (SELECT id FROM auth.users WHERE email = 'pwningcode@gmail.com'),
  'create',
  'site',
  id,
  '{"name": "Aztec Citizens Revival", "domain": "aztec-citizens-revival.local"}'::jsonb
FROM system_sites WHERE domain = 'aztec-citizens-revival.local';
