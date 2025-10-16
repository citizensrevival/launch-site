-- CMS Initial Data Seed
-- This migration seeds the initial site and creates default permissions

-- Create the main site
insert into site (id, handle, label, default_locale, slug, created_by)
values (
  '00000000-0000-0000-0000-000000000001',
  'aztec-citizens-revival',
  'Aztec Citizens Revival',
  'en-US',
  'aztec',
  '00000000-0000-0000-0000-000000000000'
);

-- Create system assets (these will be populated when we migrate existing content)
insert into asset (id, site_id, kind, storage_key, is_system, system_key, created_by)
values 
  (
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000001',
    'image',
    'assets/logo-primary.png',
    true,
    'logo-primary',
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    '00000000-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000001',
    'image',
    'assets/logo-transparent.png',
    true,
    'logo-transparent',
    '00000000-0000-0000-0000-000000000000'
  );

-- Create initial asset versions
insert into asset_version (asset_id, version, meta, created_by)
values 
  (
    '00000000-0000-0000-0000-000000000010',
    1,
    '{
      "alt": {"en-US": "Aztec Citizens Revival Logo"},
      "caption": {"en-US": "Main logo for Aztec Citizens Revival"}
    }',
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    '00000000-0000-0000-0000-000000000011',
    1,
    '{
      "alt": {"en-US": "Aztec Citizens Revival Logo (Transparent)"},
      "caption": {"en-US": "Transparent logo for Aztec Citizens Revival"}
    }',
    '00000000-0000-0000-0000-000000000000'
  );

-- Publish the assets
insert into asset_publish (asset_id, version, published_by)
values 
  ('00000000-0000-0000-0000-000000000010', 1, '00000000-0000-0000-0000-000000000000'),
  ('00000000-0000-0000-0000-000000000011', 1, '00000000-0000-0000-0000-000000000000');

-- Create system blocks
insert into block (id, site_id, type, is_system, system_key)
values 
  (
    '00000000-0000-0000-0000-000000000020',
    '00000000-0000-0000-0000-000000000001',
    'hero',
    true,
    'homepage-hero'
  ),
  (
    '00000000-0000-0000-0000-000000000021',
    '00000000-0000-0000-0000-000000000001',
    'content',
    true,
    'homepage-about'
  );

-- Create block versions
insert into block_version (block_id, version, layout_variant, content, created_by)
values 
  (
    '00000000-0000-0000-0000-000000000020',
    1,
    'media_left',
    '{
      "en-US": {
        "headline": "What is Aztec Citizens Revival?",
        "body": "Aztec Citizens Revival is a homegrown weekend festival celebrating the spirit of community, creativity, and connection in Aztec, New Mexico.",
        "cta_text": "Learn More",
        "cta_url": "/about"
      }
    }',
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    '00000000-0000-0000-0000-000000000021',
    1,
    'default',
    '{
      "en-US": {
        "title": "About Our Community",
        "content": "We are a community-driven organization dedicated to fostering local talent, supporting small businesses, and creating memorable experiences for residents and visitors alike."
      }
    }',
    '00000000-0000-0000-0000-000000000000'
  );

-- Publish the blocks
insert into block_publish (block_id, version, published_by)
values 
  ('00000000-0000-0000-0000-000000000020', 1, '00000000-0000-0000-0000-000000000000'),
  ('00000000-0000-0000-0000-000000000021', 1, '00000000-0000-0000-0000-000000000000');

-- Create system pages
insert into page (id, site_id, slug, is_system, system_key)
values 
  (
    '00000000-0000-0000-0000-000000000030',
    '00000000-0000-0000-0000-000000000001',
    '/',
    true,
    'homepage'
  ),
  (
    '00000000-0000-0000-0000-000000000031',
    '00000000-0000-0000-0000-000000000001',
    '/sponsors',
    true,
    'sponsors'
  ),
  (
    '00000000-0000-0000-0000-000000000032',
    '00000000-0000-0000-0000-000000000001',
    '/vendors',
    true,
    'vendors'
  ),
  (
    '00000000-0000-0000-0000-000000000033',
    '00000000-0000-0000-0000-000000000001',
    '/volunteers',
    true,
    'volunteers'
  );

-- Create page versions
insert into page_version (page_id, version, title, layout_variant, seo, nav_hints, slots, created_by)
values 
  (
    '00000000-0000-0000-0000-000000000030',
    1,
    '{"en-US": "Home"}',
    'landing',
    '{
      "en-US": {
        "description": "Aztec Citizens Revival - A homegrown weekend festival celebrating community, creativity, and connection in Aztec, New Mexico.",
        "keywords": ["Aztec", "New Mexico", "festival", "community", "local"]
      }
    }',
    '{
      "en-US": {
        "defaultLabel": "Home",
        "showInNav": true
      }
    }',
    '[
      {"slot": "main", "order": 1, "block_id": "00000000-0000-0000-0000-000000000020"},
      {"slot": "main", "order": 2, "block_id": "00000000-0000-0000-0000-000000000021"}
    ]',
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    '00000000-0000-0000-0000-000000000031',
    1,
    '{"en-US": "Sponsors"}',
    'default',
    '{
      "en-US": {
        "description": "Meet our sponsors who make Aztec Citizens Revival possible.",
        "keywords": ["sponsors", "support", "community"]
      }
    }',
    '{
      "en-US": {
        "defaultLabel": "Sponsors",
        "showInNav": true
      }
    }',
    '[]',
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    '00000000-0000-0000-0000-000000000032',
    1,
    '{"en-US": "Vendors"}',
    'default',
    '{
      "en-US": {
        "description": "Local vendors and artisans at Aztec Citizens Revival.",
        "keywords": ["vendors", "artisans", "local business"]
      }
    }',
    '{
      "en-US": {
        "defaultLabel": "Vendors",
        "showInNav": true
      }
    }',
    '[]',
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    '00000000-0000-0000-0000-000000000033',
    1,
    '{"en-US": "Volunteers"}',
    'default',
    '{
      "en-US": {
        "description": "Join our volunteer team and help make Aztec Citizens Revival amazing.",
        "keywords": ["volunteers", "community", "help"]
      }
    }',
    '{
      "en-US": {
        "defaultLabel": "Volunteers",
        "showInNav": true
      }
    }',
    '[]',
    '00000000-0000-0000-0000-000000000000'
  );

-- Publish the pages
insert into page_publish (page_id, version, published_by)
values 
  ('00000000-0000-0000-0000-000000000030', 1, '00000000-0000-0000-0000-000000000000'),
  ('00000000-0000-0000-0000-000000000031', 1, '00000000-0000-0000-0000-000000000000'),
  ('00000000-0000-0000-0000-000000000032', 1, '00000000-0000-0000-0000-000000000000'),
  ('00000000-0000-0000-0000-000000000033', 1, '00000000-0000-0000-0000-000000000000');

-- Create main navigation menu
insert into menu (id, site_id, handle, label, is_system, system_key)
values 
  (
    '00000000-0000-0000-0000-000000000040',
    '00000000-0000-0000-0000-000000000001',
    'main',
    'Main Navigation',
    true,
    'main-nav'
  );

-- Create menu version
insert into menu_version (menu_id, version, items, created_by)
values 
  (
    '00000000-0000-0000-0000-000000000040',
    1,
    '{
      "en-US": [
        {
          "id": "home",
          "type": "page",
          "label": {"en-US": "Home"},
          "pageId": "00000000-0000-0000-0000-000000000030"
        },
        {
          "id": "sponsors",
          "type": "page", 
          "label": {"en-US": "Sponsors"},
          "pageId": "00000000-0000-0000-0000-000000000031"
        },
        {
          "id": "vendors",
          "type": "page",
          "label": {"en-US": "Vendors"},
          "pageId": "00000000-0000-0000-0000-000000000032"
        },
        {
          "id": "volunteers",
          "type": "page",
          "label": {"en-US": "Volunteers"},
          "pageId": "00000000-0000-0000-0000-000000000033"
        }
      ]
    }',
    '00000000-0000-0000-0000-000000000000'
  );

-- Publish the menu
insert into menu_publish (menu_id, version, published_by)
values ('00000000-0000-0000-0000-000000000040', 1, '00000000-0000-0000-0000-000000000000');

-- Log the initial setup
insert into cms_audit_log (user_id, user_permissions, action, entity_type, entity_id, version)
values 
  ('00000000-0000-0000-0000-000000000000', ARRAY['system.admin'], 'create', 'site', '00000000-0000-0000-0000-000000000001', null),
  ('00000000-0000-0000-0000-000000000000', ARRAY['system.admin'], 'create', 'page', '00000000-0000-0000-0000-000000000030', 1),
  ('00000000-0000-0000-0000-000000000000', ARRAY['system.admin'], 'publish', 'page', '00000000-0000-0000-0000-000000000030', 1);
