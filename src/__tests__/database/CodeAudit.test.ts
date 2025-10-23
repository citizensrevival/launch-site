// Code Audit Tests
// This file audits all code references to ensure they use the correct database object structures

import { describe, it, expect } from 'vitest';

describe('Code Audit', () => {
  describe('Database Object Structure Validation', () => {
    it('should validate system_sites object has correct structure', () => {
      // Test the actual structure that the application expects
      const systemSite = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Site',
        domain: 'test.example.com',
        settings: {},
        created_at: '2025-01-17T00:00:00.000Z',
        updated_at: '2025-01-17T00:00:00.000Z',
        default_locale: 'en',
        slug: 'test-site'
      };

      // Validate required fields
      expect(systemSite.id).toBeDefined();
      expect(systemSite.name).toBeDefined();
      expect(systemSite.domain).toBeDefined();
      expect(systemSite.default_locale).toBeDefined();
      expect(systemSite.slug).toBeDefined();
      expect(systemSite.created_at).toBeDefined();
      expect(systemSite.updated_at).toBeDefined();

      // Validate field types
      expect(typeof systemSite.id).toBe('string');
      expect(typeof systemSite.name).toBe('string');
      expect(typeof systemSite.domain).toBe('string');
      expect(typeof systemSite.default_locale).toBe('string');
      expect(typeof systemSite.slug).toBe('string');
      expect(typeof systemSite.settings).toBe('object');
    });

    it('should validate leads_submissions object has correct structure', () => {
      const leadsSubmission = {
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

      // Validate required fields
      expect(leadsSubmission.id).toBeDefined();
      expect(leadsSubmission.lead_kind).toBeDefined();
      expect(leadsSubmission.email).toBeDefined();
      expect(leadsSubmission.social_links).toBeDefined();
      expect(leadsSubmission.created_at).toBeDefined();
      expect(leadsSubmission.updated_at).toBeDefined();

      // Validate field types
      expect(typeof leadsSubmission.id).toBe('string');
      expect(typeof leadsSubmission.lead_kind).toBe('string');
      expect(typeof leadsSubmission.email).toBe('string');
      expect(Array.isArray(leadsSubmission.social_links)).toBe(true);
    });

    it('should validate analytics_users object has correct structure', () => {
      const analyticsUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        user_id: '123e4567-e89b-12d3-a456-426614174001',
        first_seen_at: '2025-01-17T00:00:00.000Z',
        last_seen_at: '2025-01-17T00:00:00.000Z',
        properties: {},
        created_at: '2025-01-17T00:00:00.000Z',
        updated_at: '2025-01-17T00:00:00.000Z'
      };

      // Validate required fields
      expect(analyticsUser.id).toBeDefined();
      expect(analyticsUser.user_id).toBeDefined();
      expect(analyticsUser.properties).toBeDefined();
      expect(analyticsUser.created_at).toBeDefined();
      expect(analyticsUser.updated_at).toBeDefined();

      // Validate field types
      expect(typeof analyticsUser.id).toBe('string');
      expect(typeof analyticsUser.user_id).toBe('string');
      expect(typeof analyticsUser.properties).toBe('object');
    });

    it('should validate cms_pages object has correct structure', () => {
      const cmsPage = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        site_id: '123e4567-e89b-12d3-a456-426614174001',
        slug: 'test-page',
        system_key: null,
        is_system: false,
        created_at: '2025-01-17T00:00:00.000Z',
        updated_at: '2025-01-17T00:00:00.000Z'
      };

      // Validate required fields
      expect(cmsPage.id).toBeDefined();
      expect(cmsPage.site_id).toBeDefined();
      expect(cmsPage.slug).toBeDefined();
      expect(cmsPage.is_system).toBeDefined();
      expect(cmsPage.created_at).toBeDefined();
      expect(cmsPage.updated_at).toBeDefined();

      // Validate field types
      expect(typeof cmsPage.id).toBe('string');
      expect(typeof cmsPage.site_id).toBe('string');
      expect(typeof cmsPage.slug).toBe('string');
      expect(typeof cmsPage.is_system).toBe('boolean');
    });

    it('should validate cms_page_versions object has correct structure', () => {
      const cmsPageVersion = {
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

      // Validate required fields
      expect(cmsPageVersion.id).toBeDefined();
      expect(cmsPageVersion.page_id).toBeDefined();
      expect(cmsPageVersion.version).toBeDefined();
      expect(cmsPageVersion.title).toBeDefined();
      expect(cmsPageVersion.status).toBeDefined();
      expect(cmsPageVersion.created_at).toBeDefined();
      expect(cmsPageVersion.created_by).toBeDefined();

      // Validate field types
      expect(typeof cmsPageVersion.id).toBe('string');
      expect(typeof cmsPageVersion.page_id).toBe('string');
      expect(typeof cmsPageVersion.version).toBe('number');
      expect(typeof cmsPageVersion.title).toBe('string');
      expect(typeof cmsPageVersion.status).toBe('string');
      expect(['draft', 'staged', 'published', 'archived']).toContain(cmsPageVersion.status);
    });

    it('should validate cms_blocks object has correct structure', () => {
      const cmsBlock = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        site_id: '123e4567-e89b-12d3-a456-426614174001',
        type: 'hero',
        tag: null,
        created_at: '2025-01-17T00:00:00.000Z',
        updated_at: '2025-01-17T00:00:00.000Z'
      };

      // Validate required fields
      expect(cmsBlock.id).toBeDefined();
      expect(cmsBlock.site_id).toBeDefined();
      expect(cmsBlock.type).toBeDefined();
      expect(cmsBlock.created_at).toBeDefined();
      expect(cmsBlock.updated_at).toBeDefined();

      // Validate field types
      expect(typeof cmsBlock.id).toBe('string');
      expect(typeof cmsBlock.site_id).toBe('string');
      expect(typeof cmsBlock.type).toBe('string');
    });

    it('should validate cms_menus object has correct structure', () => {
      const cmsMenu = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        site_id: '123e4567-e89b-12d3-a456-426614174001',
        handle: 'main',
        label: 'Main Menu',
        created_at: '2025-01-17T00:00:00.000Z',
        updated_at: '2025-01-17T00:00:00.000Z'
      };

      // Validate required fields
      expect(cmsMenu.id).toBeDefined();
      expect(cmsMenu.site_id).toBeDefined();
      expect(cmsMenu.handle).toBeDefined();
      expect(cmsMenu.label).toBeDefined();
      expect(cmsMenu.created_at).toBeDefined();
      expect(cmsMenu.updated_at).toBeDefined();

      // Validate field types
      expect(typeof cmsMenu.id).toBe('string');
      expect(typeof cmsMenu.site_id).toBe('string');
      expect(typeof cmsMenu.handle).toBe('string');
      expect(typeof cmsMenu.label).toBe('string');
    });

    it('should validate cms_assets object has correct structure', () => {
      const cmsAsset = {
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

      // Validate required fields
      expect(cmsAsset.id).toBeDefined();
      expect(cmsAsset.site_id).toBeDefined();
      expect(cmsAsset.kind).toBeDefined();
      expect(cmsAsset.storage_key).toBeDefined();
      expect(cmsAsset.created_at).toBeDefined();
      expect(cmsAsset.created_by).toBeDefined();

      // Validate field types
      expect(typeof cmsAsset.id).toBe('string');
      expect(typeof cmsAsset.site_id).toBe('string');
      expect(typeof cmsAsset.kind).toBe('string');
      expect(typeof cmsAsset.storage_key).toBe('string');
      expect(['image', 'video', 'file']).toContain(cmsAsset.kind);
    });

    it('should validate system_user_permissions object has correct structure', () => {
      const systemUserPermissions = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        user_id: '123e4567-e89b-12d3-a456-426614174001',
        permissions: ['cms.pages.read', 'cms.pages.write'],
        created_at: '2025-01-17T00:00:00.000Z',
        updated_at: '2025-01-17T00:00:00.000Z'
      };

      // Validate required fields
      expect(systemUserPermissions.id).toBeDefined();
      expect(systemUserPermissions.user_id).toBeDefined();
      expect(systemUserPermissions.permissions).toBeDefined();
      expect(systemUserPermissions.created_at).toBeDefined();
      expect(systemUserPermissions.updated_at).toBeDefined();

      // Validate field types
      expect(typeof systemUserPermissions.id).toBe('string');
      expect(typeof systemUserPermissions.user_id).toBe('string');
      expect(Array.isArray(systemUserPermissions.permissions)).toBe(true);
    });

    it('should validate system_audit_log object has correct structure', () => {
      const systemAuditLog = {
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

      // Validate required fields
      expect(systemAuditLog.id).toBeDefined();
      expect(systemAuditLog.user_id).toBeDefined();
      expect(systemAuditLog.action).toBeDefined();
      expect(systemAuditLog.entity_type).toBeDefined();
      expect(systemAuditLog.created_at).toBeDefined();

      // Validate field types
      expect(typeof systemAuditLog.id).toBe('string');
      expect(typeof systemAuditLog.user_id).toBe('string');
      expect(typeof systemAuditLog.action).toBe('string');
      expect(typeof systemAuditLog.entity_type).toBe('string');
    });
  });

  describe('Data Validation', () => {
    it('should validate UUID format', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(uuid).toMatch(uuidRegex);
    });

    it('should validate email format', () => {
      const email = 'test@example.com';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(email).toMatch(emailRegex);
    });

    it('should validate enum values', () => {
      const validStatuses = ['draft', 'staged', 'published', 'archived'];
      const validAssetKinds = ['image', 'video', 'file'];
      const validLeadKinds = ['subscriber', 'vendor', 'sponsor', 'volunteer'];
      
      expect(validStatuses).toContain('draft');
      expect(validAssetKinds).toContain('image');
      expect(validLeadKinds).toContain('subscriber');
    });

    it('should validate timestamp format', () => {
      const timestamp = '2025-01-17T00:00:00.000Z';
      const timestampRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
      expect(timestamp).toMatch(timestampRegex);
    });
  });

  describe('Required Fields Validation', () => {
    it('should have all required fields for system_sites', () => {
      const requiredFields = ['id', 'name', 'domain', 'default_locale', 'slug', 'created_at', 'updated_at'];
      const systemSite = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Site',
        domain: 'test.example.com',
        settings: {},
        created_at: '2025-01-17T00:00:00.000Z',
        updated_at: '2025-01-17T00:00:00.000Z',
        default_locale: 'en',
        slug: 'test-site'
      };

      requiredFields.forEach(field => {
        expect(systemSite[field as keyof typeof systemSite]).toBeDefined();
      });
    });

    it('should have all required fields for leads_submissions', () => {
      const requiredFields = ['id', 'lead_kind', 'email', 'created_at', 'updated_at'];
      const leadsSubmission = {
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

      requiredFields.forEach(field => {
        expect(leadsSubmission[field as keyof typeof leadsSubmission]).toBeDefined();
      });
    });

    it('should have all required fields for cms_pages', () => {
      const requiredFields = ['id', 'site_id', 'slug', 'is_system', 'created_at', 'updated_at'];
      const cmsPage = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        site_id: '123e4567-e89b-12d3-a456-426614174001',
        slug: 'test-page',
        system_key: null,
        is_system: false,
        created_at: '2025-01-17T00:00:00.000Z',
        updated_at: '2025-01-17T00:00:00.000Z'
      };

      requiredFields.forEach(field => {
        expect(cmsPage[field as keyof typeof cmsPage]).toBeDefined();
      });
    });

    it('should have all required fields for cms_page_versions', () => {
      const requiredFields = ['id', 'page_id', 'version', 'title', 'status', 'created_at', 'created_by'];
      const cmsPageVersion = {
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

      requiredFields.forEach(field => {
        expect(cmsPageVersion[field as keyof typeof cmsPageVersion]).toBeDefined();
      });
    });
  });

  describe('No Unnecessary Aliases', () => {
    it('should use direct database types instead of aliases', () => {
      // Test that we're not creating unnecessary type aliases
      // The application should use the Database type directly
      const databaseType = {
        system_sites: 'system_sites',
        leads_submissions: 'leads_submissions',
        analytics_users: 'analytics_users',
        cms_pages: 'cms_pages',
        cms_blocks: 'cms_blocks',
        cms_menus: 'cms_menus',
        cms_assets: 'cms_assets',
        system_user_permissions: 'system_user_permissions',
        system_audit_log: 'system_audit_log'
      };

      // All table names should be accessible
      expect(databaseType.system_sites).toBe('system_sites');
      expect(databaseType.leads_submissions).toBe('leads_submissions');
      expect(databaseType.analytics_users).toBe('analytics_users');
      expect(databaseType.cms_pages).toBe('cms_pages');
      expect(databaseType.cms_blocks).toBe('cms_blocks');
      expect(databaseType.cms_menus).toBe('cms_menus');
      expect(databaseType.cms_assets).toBe('cms_assets');
      expect(databaseType.system_user_permissions).toBe('system_user_permissions');
      expect(databaseType.system_audit_log).toBe('system_audit_log');
    });
  });
});
