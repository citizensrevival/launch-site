-- Seed data for local development
-- This file is automatically loaded when running `supabase db reset`

-- Example admin user (you'll need to create this user in the auth system first)
-- INSERT INTO public.admins (user_id) VALUES ('00000000-0000-0000-0000-000000000000');

-- Example leads for testing
INSERT INTO public.leads (lead_kind, business_name, contact_name, email, phone, website, social_links, source_path, tags, meta) VALUES
  ('subscriber', NULL, 'John Doe', 'john@example.com', '+1-555-0123', NULL, '{}', '/home', '{"newsletter"}', '{"utm_source": "google", "utm_campaign": "launch"}'),
  ('vendor', 'Acme Corp', 'Jane Smith', 'jane@acme.com', '+1-555-0124', 'https://acme.com', '{"https://twitter.com/acme", "https://linkedin.com/company/acme"}', '/vendors', '{"food", "local"}', '{"booth_size": "10x10"}'),
  ('sponsor', 'Tech Solutions Inc', 'Bob Johnson', 'bob@techsolutions.com', '+1-555-0125', 'https://techsolutions.com', '{}', '/sponsors', '{"gold"}', '{"sponsor_level": "gold", "amount": 5000}'),
  ('volunteer', NULL, 'Alice Brown', 'alice@example.com', '+1-555-0126', NULL, '{"https://github.com/alice"}', '/volunteers', '{"setup", "cleanup"}', '{"availability": "weekends", "skills": ["logistics", "coordination"]}');
