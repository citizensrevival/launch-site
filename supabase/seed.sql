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

-- Create the main site
INSERT INTO site (id, handle, label, default_locale, slug, created_by)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'aztec-citizens-revival',
  'Aztec Citizens Revival',
  'en-US',
  'aztec',
  (SELECT id FROM auth.users WHERE email = 'pwningcode@gmail.com')
);

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
VALUES 
  (
    (SELECT id FROM auth.users WHERE email = 'pwningcode@gmail.com'),
    ARRAY['system.admin'],
    'create',
    'site',
    '00000000-0000-0000-0000-000000000001',
    null
  );
