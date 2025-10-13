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

-- No analytics or leads data will be seeded
-- The database will start clean for testing the exclusion features
