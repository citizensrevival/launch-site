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

-- Analytics test data
-- Create test users
INSERT INTO analytics.users (anon_id, first_seen_at, last_seen_at, first_referrer, first_utm_source, first_utm_medium, first_utm_campaign, last_referrer, last_utm_source, last_utm_medium, last_utm_campaign, properties) VALUES
  ('anon_test_user_1', '2024-01-01T10:00:00Z', '2024-01-07T15:30:00Z', 'https://google.com', 'google', 'organic', 'launch', 'https://facebook.com', 'facebook', 'social', 'launch', '{"test": true}'),
  ('anon_test_user_2', '2024-01-02T14:20:00Z', '2024-01-07T09:15:00Z', 'https://twitter.com', 'twitter', 'social', 'launch', 'https://twitter.com', 'twitter', 'social', 'launch', '{"test": true}'),
  ('anon_test_user_3', '2024-01-03T11:45:00Z', '2024-01-06T16:20:00Z', 'https://linkedin.com', 'linkedin', 'social', 'launch', 'https://linkedin.com', 'linkedin', 'social', 'launch', '{"test": true}'),
  ('anon_test_user_4', '2024-01-04T09:30:00Z', '2024-01-07T12:45:00Z', 'https://google.com', 'google', 'cpc', 'launch', 'https://google.com', 'google', 'cpc', 'launch', '{"test": true}'),
  ('anon_test_user_5', '2024-01-05T16:15:00Z', '2024-01-07T18:30:00Z', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '{"test": true}');

-- Create test sessions
INSERT INTO analytics.sessions (user_id, started_at, ended_at, landing_page, landing_path, referrer, utm_source, utm_medium, utm_campaign, utm_term, utm_content, user_agent, device_category, browser_name, browser_version, os_name, os_version, is_bot, ip_address, geo_country, geo_region, geo_city, properties) VALUES
  ((SELECT id FROM analytics.users WHERE anon_id = 'anon_test_user_1'), '2024-01-01T10:00:00Z', '2024-01-01T10:15:00Z', 'https://example.com/', '/', 'https://google.com', 'google', 'organic', 'launch', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'desktop', 'Chrome', '120.0', 'Windows', '10', false, '192.168.1.1', 'US', 'California', 'San Francisco', '{}'),
  ((SELECT id FROM analytics.users WHERE anon_id = 'anon_test_user_1'), '2024-01-02T14:30:00Z', '2024-01-02T14:45:00Z', 'https://example.com/about', '/about', 'https://facebook.com', 'facebook', 'social', 'launch', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'desktop', 'Chrome', '120.0', 'Windows', '10', false, '192.168.1.1', 'US', 'California', 'San Francisco', '{}'),
  ((SELECT id FROM analytics.users WHERE anon_id = 'anon_test_user_2'), '2024-01-02T14:20:00Z', '2024-01-02T14:35:00Z', 'https://example.com/vendors', '/vendors', 'https://twitter.com', 'twitter', 'social', 'launch', NULL, NULL, 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', 'mobile', 'Safari', '17.0', 'iOS', '17.0', false, '192.168.1.2', 'CA', 'Ontario', 'Toronto', '{}'),
  ((SELECT id FROM analytics.users WHERE anon_id = 'anon_test_user_3'), '2024-01-03T11:45:00Z', '2024-01-03T12:00:00Z', 'https://example.com/sponsors', '/sponsors', 'https://linkedin.com', 'linkedin', 'social', 'launch', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 'desktop', 'Chrome', '120.0', 'macOS', '10.15.7', false, '192.168.1.3', 'US', 'New York', 'New York', '{}'),
  ((SELECT id FROM analytics.users WHERE anon_id = 'anon_test_user_4'), '2024-01-04T09:30:00Z', '2024-01-04T09:45:00Z', 'https://example.com/volunteers', '/volunteers', 'https://google.com', 'google', 'cpc', 'launch', 'volunteer', 'banner', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'desktop', 'Firefox', '121.0', 'Windows', '10', false, '192.168.1.4', 'US', 'Texas', 'Austin', '{}'),
  ((SELECT id FROM analytics.users WHERE anon_id = 'anon_test_user_5'), '2024-01-05T16:15:00Z', '2024-01-05T16:30:00Z', 'https://example.com/', '/', NULL, NULL, NULL, NULL, NULL, NULL, 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)', 'tablet', 'Safari', '17.0', 'iOS', '17.0', false, '192.168.1.5', 'US', 'Florida', 'Miami', '{}');

-- Create test pageviews
INSERT INTO analytics.pageviews (session_id, user_id, occurred_at, url, path, title, referrer, properties) VALUES
  ((SELECT id FROM analytics.sessions WHERE user_id = (SELECT id FROM analytics.users WHERE anon_id = 'anon_test_user_1') AND started_at = '2024-01-01T10:00:00Z'), (SELECT id FROM analytics.users WHERE anon_id = 'anon_test_user_1'), '2024-01-01T10:00:00Z', 'https://example.com/', '/', 'Home - Citizens Revival', 'https://google.com', '{}'),
  ((SELECT id FROM analytics.sessions WHERE user_id = (SELECT id FROM analytics.users WHERE anon_id = 'anon_test_user_1') AND started_at = '2024-01-01T10:00:00Z'), (SELECT id FROM analytics.users WHERE anon_id = 'anon_test_user_1'), '2024-01-01T10:05:00Z', 'https://example.com/about', '/about', 'About - Citizens Revival', 'https://example.com/', '{}'),
  ((SELECT id FROM analytics.sessions WHERE user_id = (SELECT id FROM analytics.users WHERE anon_id = 'anon_test_user_1') AND started_at = '2024-01-01T10:00:00Z'), (SELECT id FROM analytics.users WHERE anon_id = 'anon_test_user_1'), '2024-01-01T10:10:00Z', 'https://example.com/contact', '/contact', 'Contact - Citizens Revival', 'https://example.com/about', '{}'),
  ((SELECT id FROM analytics.sessions WHERE user_id = (SELECT id FROM analytics.users WHERE anon_id = 'anon_test_user_2') AND started_at = '2024-01-02T14:20:00Z'), (SELECT id FROM analytics.users WHERE anon_id = 'anon_test_user_2'), '2024-01-02T14:20:00Z', 'https://example.com/vendors', '/vendors', 'Vendors - Citizens Revival', 'https://twitter.com', '{}'),
  ((SELECT id FROM analytics.sessions WHERE user_id = (SELECT id FROM analytics.users WHERE anon_id = 'anon_test_user_2') AND started_at = '2024-01-02T14:20:00Z'), (SELECT id FROM analytics.users WHERE anon_id = 'anon_test_user_2'), '2024-01-02T14:25:00Z', 'https://example.com/vendors/apply', '/vendors/apply', 'Apply as Vendor - Citizens Revival', 'https://example.com/vendors', '{}'),
  ((SELECT id FROM analytics.sessions WHERE user_id = (SELECT id FROM analytics.users WHERE anon_id = 'anon_test_user_3') AND started_at = '2024-01-03T11:45:00Z'), (SELECT id FROM analytics.users WHERE anon_id = 'anon_test_user_3'), '2024-01-03T11:45:00Z', 'https://example.com/sponsors', '/sponsors', 'Sponsors - Citizens Revival', 'https://linkedin.com', '{}'),
  ((SELECT id FROM analytics.sessions WHERE user_id = (SELECT id FROM analytics.users WHERE anon_id = 'anon_test_user_4') AND started_at = '2024-01-04T09:30:00Z'), (SELECT id FROM analytics.users WHERE anon_id = 'anon_test_user_4'), '2024-01-04T09:30:00Z', 'https://example.com/volunteers', '/volunteers', 'Volunteers - Citizens Revival', 'https://google.com', '{}'),
  ((SELECT id FROM analytics.sessions WHERE user_id = (SELECT id FROM analytics.users WHERE anon_id = 'anon_test_user_5') AND started_at = '2024-01-05T16:15:00Z'), (SELECT id FROM analytics.users WHERE anon_id = 'anon_test_user_5'), '2024-01-05T16:15:00Z', 'https://example.com/', '/', 'Home - Citizens Revival', NULL, '{}');

-- Create test events
INSERT INTO analytics.events (session_id, user_id, occurred_at, name, label, value_num, value_text, properties) VALUES
  ((SELECT id FROM analytics.sessions WHERE user_id = (SELECT id FROM analytics.users WHERE anon_id = 'anon_test_user_1') AND started_at = '2024-01-01T10:00:00Z'), (SELECT id FROM analytics.users WHERE anon_id = 'anon_test_user_1'), '2024-01-01T10:02:00Z', 'cta_click', 'Get Involved Button Clicked', 1, NULL, '{"button_text": "Get Involved", "page": "/"}'),
  ((SELECT id FROM analytics.sessions WHERE user_id = (SELECT id FROM analytics.users WHERE anon_id = 'anon_test_user_1') AND started_at = '2024-01-01T10:00:00Z'), (SELECT id FROM analytics.users WHERE anon_id = 'anon_test_user_1'), '2024-01-01T10:12:00Z', 'lead_form_submitted', 'Lead Form Submitted', 1, 'subscriber', '{"form_type": "newsletter", "page": "/contact"}'),
  ((SELECT id FROM analytics.sessions WHERE user_id = (SELECT id FROM analytics.users WHERE anon_id = 'anon_test_user_2') AND started_at = '2024-01-02T14:20:00Z'), (SELECT id FROM analytics.users WHERE anon_id = 'anon_test_user_2'), '2024-01-02T14:22:00Z', 'cta_click', 'Apply as Vendor Button Clicked', 1, NULL, '{"button_text": "Apply as Vendor", "page": "/vendors"}'),
  ((SELECT id FROM analytics.sessions WHERE user_id = (SELECT id FROM analytics.users WHERE anon_id = 'anon_test_user_2') AND started_at = '2024-01-02T14:20:00Z'), (SELECT id FROM analytics.users WHERE anon_id = 'anon_test_user_2'), '2024-01-02T14:28:00Z', 'lead_form_submitted', 'Vendor Application Submitted', 1, 'vendor', '{"form_type": "vendor_application", "page": "/vendors/apply"}'),
  ((SELECT id FROM analytics.sessions WHERE user_id = (SELECT id FROM analytics.users WHERE anon_id = 'anon_test_user_3') AND started_at = '2024-01-03T11:45:00Z'), (SELECT id FROM analytics.users WHERE anon_id = 'anon_test_user_3'), '2024-01-03T11:47:00Z', 'cta_click', 'Become a Sponsor Button Clicked', 1, NULL, '{"button_text": "Become a Sponsor", "page": "/sponsors"}'),
  ((SELECT id FROM analytics.sessions WHERE user_id = (SELECT id FROM analytics.users WHERE anon_id = 'anon_test_user_3') AND started_at = '2024-01-03T11:45:00Z'), (SELECT id FROM analytics.users WHERE anon_id = 'anon_test_user_3'), '2024-01-03T11:52:00Z', 'lead_form_submitted', 'Sponsor Application Submitted', 1, 'sponsor', '{"form_type": "sponsor_application", "page": "/sponsors"}'),
  ((SELECT id FROM analytics.sessions WHERE user_id = (SELECT id FROM analytics.users WHERE anon_id = 'anon_test_user_4') AND started_at = '2024-01-04T09:30:00Z'), (SELECT id FROM analytics.users WHERE anon_id = 'anon_test_user_4'), '2024-01-04T09:32:00Z', 'cta_click', 'Volunteer Button Clicked', 1, NULL, '{"button_text": "Volunteer", "page": "/volunteers"}'),
  ((SELECT id FROM analytics.sessions WHERE user_id = (SELECT id FROM analytics.users WHERE anon_id = 'anon_test_user_4') AND started_at = '2024-01-04T09:30:00Z'), (SELECT id FROM analytics.users WHERE anon_id = 'anon_test_user_4'), '2024-01-04T09:38:00Z', 'lead_form_submitted', 'Volunteer Application Submitted', 1, 'volunteer', '{"form_type": "volunteer_application", "page": "/volunteers"}'),
  ((SELECT id FROM analytics.sessions WHERE user_id = (SELECT id FROM analytics.users WHERE anon_id = 'anon_test_user_5') AND started_at = '2024-01-05T16:15:00Z'), (SELECT id FROM analytics.users WHERE anon_id = 'anon_test_user_5'), '2024-01-05T16:17:00Z', 'video_play', 'Video Played', 1, 'intro_video', '{"video_title": "Citizens Revival Introduction", "page": "/"}'),
  ((SELECT id FROM analytics.sessions WHERE user_id = (SELECT id FROM analytics.users WHERE anon_id = 'anon_test_user_5') AND started_at = '2024-01-05T16:15:00Z'), (SELECT id FROM analytics.users WHERE anon_id = 'anon_test_user_5'), '2024-01-05T16:25:00Z', 'download_started', 'Download Started', 1, 'brochure.pdf', '{"file_name": "Citizens Revival Brochure", "page": "/"}');
