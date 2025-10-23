// CMS Schema Validation Tests
// This file tests that CMS TypeScript objects conform to the database schema

import { describe, it, expect } from 'vitest';
import { Database } from '../../lib/database.types';
import { z } from 'zod';

// Create Zod schemas that match the database types exactly
const zSystemSite = z.object({
  id: z.string().uuid(),
  name: z.string(),
  domain: z.string(),
  settings: z.record(z.any()),
  created_at: z.string(),
  updated_at: z.string(),
  default_locale: z.string(),
  slug: z.string()
});

const zLeadsSubmission = z.object({
  id: z.string().uuid(),
  lead_kind: z.string(),
  business_name: z.string().nullable(),
  contact_name: z.string().nullable(),
  email: z.string().email(),
  phone: z.string().nullable(),
  website: z.string().nullable(),
  social_links: z.array(z.string()),
  source_path: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string()
});

const zAnalyticsUser = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  first_seen_at: z.string(),
  last_seen_at: z.string(),
  properties: z.record(z.any()),
  created_at: z.string(),
  updated_at: z.string()
});

const zCmsPage = z.object({
  id: z.string().uuid(),
  site_id: z.string().uuid(),
  slug: z.string(),
  system_key: z.string().nullable(),
  is_system: z.boolean(),
  created_at: z.string(),
  updated_at: z.string()
});

const zCmsPageVersion = z.object({
  id: z.string().uuid(),
  page_id: z.string().uuid(),
  version: z.number().int(),
  title: z.string(),
  locale: z.string(),
  template: z.string(),
  seo: z.record(z.any()),
  nav_hints: z.record(z.any()),
  slots: z.array(z.any()),
  status: z.enum(['draft', 'staged', 'published', 'archived']),
  created_at: z.string(),
  created_by: z.string().uuid()
});

const zCmsBlock = z.object({
  id: z.string().uuid(),
  site_id: z.string().uuid(),
  type: z.string(),
  tag: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string()
});

const zCmsBlockVersion = z.object({
  id: z.string().uuid(),
  block_id: z.string().uuid(),
  version: z.number().int(),
  layout_variant: z.string(),
  content: z.record(z.any()),
  assets: z.array(z.any()),
  status: z.enum(['draft', 'staged', 'published', 'archived']),
  created_at: z.string(),
  created_by: z.string().uuid()
});

const zCmsMenu = z.object({
  id: z.string().uuid(),
  site_id: z.string().uuid(),
  handle: z.string(),
  label: z.string(),
  created_at: z.string(),
  updated_at: z.string()
});

const zCmsMenuVersion = z.object({
  id: z.string().uuid(),
  menu_id: z.string().uuid(),
  version: z.number().int(),
  locale: z.string(),
  items: z.array(z.any()),
  rules: z.array(z.any()),
  status: z.enum(['draft', 'staged', 'published', 'archived']),
  created_at: z.string(),
  created_by: z.string().uuid()
});

const zCmsAsset = z.object({
  id: z.string().uuid(),
  site_id: z.string().uuid(),
  kind: z.enum(['image', 'video', 'file']),
  storage_key: z.string(),
  width: z.number().int().nullable(),
  height: z.number().int().nullable(),
  duration_ms: z.number().int().nullable(),
  checksum: z.string().nullable(),
  created_at: z.string(),
  created_by: z.string().uuid()
});

const zCmsAssetVersion = z.object({
  id: z.string().uuid(),
  asset_id: z.string().uuid(),
  version: z.number().int(),
  meta: z.record(z.any()),
  status: z.enum(['draft', 'staged', 'published', 'archived']),
  created_at: z.string(),
  created_by: z.string().uuid()
});

const zSystemUserPermissions = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  permissions: z.array(z.string()),
  created_at: z.string(),
  updated_at: z.string()
});

const zSystemAuditLog = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid().nullable(),
  action: z.string(),
  entity_type: z.string(),
  entity_id: z.string().uuid().nullable(),
  old_values: z.record(z.any()).nullable(),
  new_values: z.record(z.any()).nullable(),
  ip_address: z.string().nullable(),
  user_agent: z.string().nullable(),
  created_at: z.string()
});

describe('CMS Schema Validation', () => {
  describe('System Sites', () => {
    it('should validate system_sites table structure', () => {
      const validSystemSite = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Site',
        domain: 'test.example.com',
        settings: {},
        created_at: '2025-01-17T00:00:00.000Z',
        updated_at: '2025-01-17T00:00:00.000Z',
        default_locale: 'en',
        slug: 'test-site'
      };

      const result = zSystemSite.safeParse(validSystemSite);
      expect(result.success).toBe(true);
    });

    it('should reject invalid system_sites data', () => {
      const invalidSystemSite = {
        id: 'invalid-uuid',
        name: 'Test Site',
        domain: 'test.example.com',
        settings: {},
        created_at: '2025-01-17T00:00:00.000Z',
        updated_at: '2025-01-17T00:00:00.000Z',
        default_locale: 'en',
        slug: 'test-site'
      };

      const result = zSystemSite.safeParse(invalidSystemSite);
      expect(result.success).toBe(false);
    });
  });

  describe('Leads Submissions', () => {
    it('should validate leads_submissions table structure', () => {
      const validLead = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        lead_kind: 'subscriber',
        business_name: null,
        contact_name: null,
        email: 'test@example.com',
        phone: null,
        website: null,
        social_links: [],
        source_path: '/test',
        created_at: '2025-01-17T00:00:00.000Z',
        updated_at: '2025-01-17T00:00:00.000Z'
      };

      const result = zLeadsSubmission.safeParse(validLead);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const invalidLead = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        lead_kind: 'subscriber',
        business_name: null,
        contact_name: null,
        email: 'invalid-email',
        phone: null,
        website: null,
        social_links: [],
        source_path: '/test',
        created_at: '2025-01-17T00:00:00.000Z',
        updated_at: '2025-01-17T00:00:00.000Z'
      };

      const result = zLeadsSubmission.safeParse(invalidLead);
      expect(result.success).toBe(false);
    });
  });

  describe('Analytics Users', () => {
    it('should validate analytics_users table structure', () => {
      const validAnalyticsUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        user_id: '123e4567-e89b-12d3-a456-426614174001',
        first_seen_at: '2025-01-17T00:00:00.000Z',
        last_seen_at: '2025-01-17T00:00:00.000Z',
        properties: {},
        created_at: '2025-01-17T00:00:00.000Z',
        updated_at: '2025-01-17T00:00:00.000Z'
      };

      const result = zAnalyticsUser.safeParse(validAnalyticsUser);
      expect(result.success).toBe(true);
    });
  });

  describe('CMS Pages', () => {
    it('should validate cms_pages table structure', () => {
      const validPage = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        site_id: '123e4567-e89b-12d3-a456-426614174001',
        slug: 'test-page',
        system_key: null,
        is_system: false,
        created_at: '2025-01-17T00:00:00.000Z',
        updated_at: '2025-01-17T00:00:00.000Z'
      };

      const result = zCmsPage.safeParse(validPage);
      expect(result.success).toBe(true);
    });

    it('should validate cms_page_versions table structure', () => {
      const validPageVersion = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        page_id: '123e4567-e89b-12d3-a456-426614174001',
        version: 1,
        title: 'Test Page',
        locale: 'en',
        template: 'default',
        seo: {},
        nav_hints: {},
        slots: [],
        status: 'draft',
        created_at: '2025-01-17T00:00:00.000Z',
        created_by: '123e4567-e89b-12d3-a456-426614174002'
      };

      const result = zCmsPageVersion.safeParse(validPageVersion);
      expect(result.success).toBe(true);
    });

    it('should reject invalid status values', () => {
      const invalidPageVersion = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        page_id: '123e4567-e89b-12d3-a456-426614174001',
        version: 1,
        title: 'Test Page',
        locale: 'en',
        template: 'default',
        seo: {},
        nav_hints: {},
        slots: [],
        status: 'invalid-status',
        created_at: '2025-01-17T00:00:00.000Z',
        created_by: '123e4567-e89b-12d3-a456-426614174002'
      };

      const result = zCmsPageVersion.safeParse(invalidPageVersion);
      expect(result.success).toBe(false);
    });
  });

  describe('CMS Blocks', () => {
    it('should validate cms_blocks table structure', () => {
      const validBlock = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        site_id: '123e4567-e89b-12d3-a456-426614174001',
        type: 'hero',
        tag: null,
        created_at: '2025-01-17T00:00:00.000Z',
        updated_at: '2025-01-17T00:00:00.000Z'
      };

      const result = zCmsBlock.safeParse(validBlock);
      expect(result.success).toBe(true);
    });

    it('should validate cms_block_versions table structure', () => {
      const validBlockVersion = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        block_id: '123e4567-e89b-12d3-a456-426614174001',
        version: 1,
        layout_variant: 'default',
        content: {},
        assets: [],
        status: 'draft',
        created_at: '2025-01-17T00:00:00.000Z',
        created_by: '123e4567-e89b-12d3-a456-426614174002'
      };

      const result = zCmsBlockVersion.safeParse(validBlockVersion);
      expect(result.success).toBe(true);
    });
  });

  describe('CMS Menus', () => {
    it('should validate cms_menus table structure', () => {
      const validMenu = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        site_id: '123e4567-e89b-12d3-a456-426614174001',
        handle: 'main',
        label: 'Main Menu',
        created_at: '2025-01-17T00:00:00.000Z',
        updated_at: '2025-01-17T00:00:00.000Z'
      };

      const result = zCmsMenu.safeParse(validMenu);
      expect(result.success).toBe(true);
    });

    it('should validate cms_menu_versions table structure', () => {
      const validMenuVersion = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        menu_id: '123e4567-e89b-12d3-a456-426614174001',
        version: 1,
        locale: 'en',
        items: [],
        rules: [],
        status: 'draft',
        created_at: '2025-01-17T00:00:00.000Z',
        created_by: '123e4567-e89b-12d3-a456-426614174002'
      };

      const result = zCmsMenuVersion.safeParse(validMenuVersion);
      expect(result.success).toBe(true);
    });
  });

  describe('CMS Assets', () => {
    it('should validate cms_assets table structure', () => {
      const validAsset = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        site_id: '123e4567-e89b-12d3-a456-426614174001',
        kind: 'image',
        storage_key: 'assets/test.jpg',
        width: 1920,
        height: 1080,
        duration_ms: null,
        checksum: 'abc123',
        created_at: '2025-01-17T00:00:00.000Z',
        created_by: '123e4567-e89b-12d3-a456-426614174002'
      };

      const result = zCmsAsset.safeParse(validAsset);
      expect(result.success).toBe(true);
    });

    it('should reject invalid asset kind', () => {
      const invalidAsset = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        site_id: '123e4567-e89b-12d3-a456-426614174001',
        kind: 'invalid-kind',
        storage_key: 'assets/test.jpg',
        width: 1920,
        height: 1080,
        duration_ms: null,
        checksum: 'abc123',
        created_at: '2025-01-17T00:00:00.000Z',
        created_by: '123e4567-e89b-12d3-a456-426614174002'
      };

      const result = zCmsAsset.safeParse(invalidAsset);
      expect(result.success).toBe(false);
    });

    it('should validate cms_asset_versions table structure', () => {
      const validAssetVersion = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        asset_id: '123e4567-e89b-12d3-a456-426614174001',
        version: 1,
        meta: {},
        status: 'draft',
        created_at: '2025-01-17T00:00:00.000Z',
        created_by: '123e4567-e89b-12d3-a456-426614174002'
      };

      const result = zCmsAssetVersion.safeParse(validAssetVersion);
      expect(result.success).toBe(true);
    });
  });

  describe('System Tables', () => {
    it('should validate system_user_permissions table structure', () => {
      const validPermissions = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        user_id: '123e4567-e89b-12d3-a456-426614174001',
        permissions: ['cms.pages.read', 'cms.pages.write'],
        created_at: '2025-01-17T00:00:00.000Z',
        updated_at: '2025-01-17T00:00:00.000Z'
      };

      const result = zSystemUserPermissions.safeParse(validPermissions);
      expect(result.success).toBe(true);
    });

    it('should validate system_audit_log table structure', () => {
      const validAuditLog = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        user_id: '123e4567-e89b-12d3-a456-426614174001',
        action: 'create',
        entity_type: 'page',
        entity_id: '123e4567-e89b-12d3-a456-426614174002',
        old_values: null,
        new_values: {},
        ip_address: null,
        user_agent: null,
        created_at: '2025-01-17T00:00:00.000Z'
      };

      const result = zSystemAuditLog.safeParse(validAuditLog);
      expect(result.success).toBe(true);
    });
  });
});
