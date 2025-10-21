// Example test file showing how to test Zod schemas comprehensively
import { describe, it, expect } from 'vitest';
import { zPage, zPageVersion } from '../../lib/cms/schemas';

describe('Page Schemas', () => {
  describe('zPage', () => {
    it('should validate a valid page', () => {
      const validPage = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        site_id: '123e4567-e89b-12d3-a456-426614174001',
        slug: 'test-page',
        is_system: false,
        system_key: null
      };

      const result = zPage.safeParse(validPage);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validPage);
      }
    });

    it('should validate a system page with system_key', () => {
      const systemPage = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        site_id: '123e4567-e89b-12d3-a456-426614174001',
        slug: 'home',
        is_system: true,
        system_key: 'home'
      };

      const result = zPage.safeParse(systemPage);
      expect(result.success).toBe(true);
    });

    it('should validate a page with undefined system_key', () => {
      const pageWithUndefined = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        site_id: '123e4567-e89b-12d3-a456-426614174001',
        slug: 'test-page',
        is_system: false,
        system_key: undefined
      };

      const result = zPage.safeParse(pageWithUndefined);
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID', () => {
      const invalidPage = {
        id: 'invalid-uuid',
        site_id: '123e4567-e89b-12d3-a456-426614174001',
        slug: 'test-page',
        is_system: false,
        system_key: null
      };

      const result = zPage.safeParse(invalidPage);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['id']);
        expect(result.error.issues[0].code).toBe('invalid_format');
      }
    });

    it('should reject missing required fields', () => {
      const incompletePage = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        site_id: '123e4567-e89b-12d3-a456-426614174001',
        // missing slug, is_system
        system_key: null
      };

      const result = zPage.safeParse(incompletePage);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(2);
        expect(result.error.issues.some(issue => issue.path.includes('slug'))).toBe(true);
        expect(result.error.issues.some(issue => issue.path.includes('is_system'))).toBe(true);
      }
    });

    it('should reject invalid system_key type', () => {
      const invalidSystemKey = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        site_id: '123e4567-e89b-12d3-a456-426614174001',
        slug: 'test-page',
        is_system: false,
        system_key: 123 // should be string or null
      };

      const result = zPage.safeParse(invalidSystemKey);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['system_key']);
        expect(result.error.issues[0].code).toBe('invalid_type');
      }
    });
  });

  describe('zPageVersion', () => {
    it('should validate a valid page version', () => {
      const validVersion = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        page_id: '123e4567-e89b-12d3-a456-426614174001',
        version: 1,
        title: { 'en-US': 'Test Page' },
        layout_variant: 'default',
        seo: { 'en-US': { title: 'Test SEO' } },
        nav_hints: {
          label: { 'en-US': 'Test Label' },
          badge: { 'en-US': 'Test Badge' },
          order: 1,
          hidden: false
        },
        slots: [],
        created_at: '2023-01-01T00:00:00Z',
        created_by: '123e4567-e89b-12d3-a456-426614174002'
      };

      const result = zPageVersion.safeParse(validVersion);
      expect(result.success).toBe(true);
    });

    it('should validate page version with null layout_variant', () => {
      const versionWithNull = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        page_id: '123e4567-e89b-12d3-a456-426614174001',
        version: 1,
        title: { 'en-US': 'Test Page' },
        layout_variant: null,
        seo: { 'en-US': { title: 'Test SEO' } },
        nav_hints: {
          label: { 'en-US': 'Test Label' },
          badge: { 'en-US': 'Test Badge' },
          order: 1,
          hidden: false
        },
        slots: [],
        created_at: '2023-01-01T00:00:00Z',
        created_by: '123e4567-e89b-12d3-a456-426614174002'
      };

      const result = zPageVersion.safeParse(versionWithNull);
      expect(result.success).toBe(true);
    });

    it('should validate page version with undefined layout_variant', () => {
      const versionWithUndefined = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        page_id: '123e4567-e89b-12d3-a456-426614174001',
        version: 1,
        title: { 'en-US': 'Test Page' },
        // layout_variant is undefined
        seo: { 'en-US': { title: 'Test SEO' } },
        nav_hints: {
          label: { 'en-US': 'Test Label' },
          badge: { 'en-US': 'Test Badge' },
          order: 1,
          hidden: false
        },
        slots: [],
        created_at: '2023-01-01T00:00:00Z',
        created_by: '123e4567-e89b-12d3-a456-426614174002'
      };

      const result = zPageVersion.safeParse(versionWithUndefined);
      expect(result.success).toBe(true);
    });

    it('should handle nested nav_hints order transformation', () => {
      const versionWithNestedOrder = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        page_id: '123e4567-e89b-12d3-a456-426614174001',
        version: 1,
        title: { 'en-US': 'Test Page' },
        seo: { 'en-US': { title: 'Test SEO' } },
        nav_hints: {
          label: { 'en-US': 'Test Label' },
          badge: { 'en-US': 'Test Badge' },
          order: { 'en-US': { 'en-US': 1 } }, // Nested structure
          hidden: { 'en-US': { 'en-US': false } } // Nested structure
        },
        slots: [],
        created_at: '2023-01-01T00:00:00Z',
        created_by: '123e4567-e89b-12d3-a456-426614174002'
      };

      const result = zPageVersion.safeParse(versionWithNestedOrder);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.nav_hints.order).toBe(1);
        expect(result.data.nav_hints.hidden).toBe(false);
      }
    });

    it('should reject invalid version number', () => {
      const invalidVersion = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        page_id: '123e4567-e89b-12d3-a456-426614174001',
        version: 'not-a-number',
        title: { 'en-US': 'Test Page' },
        seo: { 'en-US': { title: 'Test SEO' } },
        nav_hints: {
          label: { 'en-US': 'Test Label' },
          badge: { 'en-US': 'Test Badge' },
          order: 1,
          hidden: false
        },
        slots: [],
        created_at: '2023-01-01T00:00:00Z',
        created_by: '123e4567-e89b-12d3-a456-426614174002'
      };

      const result = zPageVersion.safeParse(invalidVersion);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['version']);
        expect(result.error.issues[0].code).toBe('invalid_type');
      }
    });

    it('should reject invalid title structure', () => {
      const invalidTitle = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        page_id: '123e4567-e89b-12d3-a456-426614174001',
        version: 1,
        title: 'not-an-object', // Should be localized content object
        seo: { 'en-US': { title: 'Test SEO' } },
        nav_hints: {
          label: { 'en-US': 'Test Label' },
          badge: { 'en-US': 'Test Badge' },
          order: 1,
          hidden: false
        },
        slots: [],
        created_at: '2023-01-01T00:00:00Z',
        created_by: '123e4567-e89b-12d3-a456-426614174002'
      };

      const result = zPageVersion.safeParse(invalidTitle);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['title']);
        expect(result.error.issues[0].code).toBe('invalid_type');
      }
    });
  });
});
