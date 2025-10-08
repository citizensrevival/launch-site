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

-- Example leads for testing
INSERT INTO public.leads (lead_kind, business_name, contact_name, email, phone, website, social_links, source_path, tags, meta) VALUES
  ('subscriber', NULL, 'John Doe', 'john@example.com', '+1-555-0123', NULL, '{}', '/home', '{"newsletter"}', '{"utm_source": "google", "utm_campaign": "launch"}'),
  ('vendor', 'Acme Corp', 'Jane Smith', 'jane@acme.com', '+1-555-0124', 'https://acme.com', '{"https://twitter.com/acme", "https://linkedin.com/company/acme"}', '/vendors', '{"food", "local"}', '{"booth_size": "10x10"}'),
  ('sponsor', 'Tech Solutions Inc', 'Bob Johnson', 'bob@techsolutions.com', '+1-555-0125', 'https://techsolutions.com', '{}', '/sponsors', '{"gold"}', '{"sponsor_level": "gold", "amount": 5000}'),
  ('volunteer', NULL, 'Alice Brown', 'alice@example.com', '+1-555-0126', NULL, '{"https://github.com/alice"}', '/volunteers', '{"setup", "cleanup"}', '{"availability": "weekends", "skills": ["logistics", "coordination"]}');
