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

-- Add the user to the admins table
INSERT INTO public.admins (user_id) 
SELECT id FROM auth.users WHERE email = 'pwningcode@gmail.com';

-- Create the main site with a proper UUID
INSERT INTO site (id, handle, label, default_locale, slug, created_by)
VALUES (
  gen_random_uuid(),
  'aztec-citizens-revival',
  'Aztec Citizens Revival',
  'en-US',
  'aztec',
  (SELECT id FROM auth.users WHERE email = 'pwningcode@gmail.com')
);

-- Verify the site was created
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM site WHERE handle = 'aztec-citizens-revival') THEN
    RAISE EXCEPTION 'Site creation failed - no site found with handle aztec-citizens-revival';
  END IF;
  RAISE NOTICE 'Site created successfully: aztec-citizens-revival';
END $$;

-- Create the site-specific storage bucket
-- Note: This requires the service role key or manual creation in dashboard
-- We'll create the bucket with the site ID as the bucket name
DO $$
DECLARE
  site_uuid uuid;
BEGIN
  -- Get the site ID
  SELECT id INTO site_uuid FROM site WHERE handle = 'aztec-citizens-revival';
  
  IF site_uuid IS NOT NULL THEN
    -- Create bucket with a more standard name format
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'site-' || replace(site_uuid::text, '-', ''),
      'site-' || replace(site_uuid::text, '-', ''),
      true,
      52428800, -- 50MB in bytes
      ARRAY['image/*', 'video/*', 'application/*']
    ) ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Created storage bucket for site: %', site_uuid;
  ELSE
    RAISE EXCEPTION 'Site not found - cannot create bucket';
  END IF;
END $$;

-- Grant full CMS permissions to the authenticated user
INSERT INTO user_permissions (user_id, permissions)
SELECT 
  id,
  ARRAY[
    -- System permissions
    'system.admin',
    
    -- Site permissions
    'sites.read',
    'sites.write',
    'sites.delete',
    
    -- Page permissions
    'cms.pages.read',
    'cms.pages.write',
    'cms.pages.publish',
    'cms.pages.delete',
    
    -- Block permissions
    'cms.blocks.read',
    'cms.blocks.write',
    'cms.blocks.publish',
    'cms.blocks.delete',
    
    -- Menu permissions
    'cms.menus.read',
    'cms.menus.write',
    'cms.menus.publish',
    'cms.menus.delete',
    
    -- Asset permissions
    'cms.assets.read',
    'cms.assets.write',
    'cms.assets.publish',
    'cms.assets.delete',
    
    -- User management permissions
    'users.manage',
    'users.read',
    'users.write',
    'users.delete',
    
    -- Audit permissions
    'audit.read',
    'audit.write'
  ]
FROM auth.users 
WHERE email = 'pwningcode@gmail.com';

-- Log the initial setup
INSERT INTO cms_audit_log (user_id, user_permissions, action, entity_type, entity_id, version)
SELECT 
  (SELECT id FROM auth.users WHERE email = 'pwningcode@gmail.com'),
  ARRAY['system.admin'],
  'create',
  'site',
  id,
  null
FROM site WHERE handle = 'aztec-citizens-revival';
