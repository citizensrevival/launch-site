-- Add slug column to sites table
-- This migration adds a slug column to the site table for easy lookup

-- Add slug column to site table
alter table site add column if not exists slug text unique;

-- Create index on slug for fast lookups
create index if not exists idx_site_slug on site (slug);

-- Update the existing site with the 'aztec' slug
update site 
set slug = 'aztec' 
where id = '00000000-0000-0000-0000-000000000001';

-- Make slug not null after setting the value
alter table site alter column slug set not null;
