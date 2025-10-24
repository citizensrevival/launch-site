import { describe, it, expect } from 'vitest';
import {
  PageSchema,
  CreatePageInputSchema,
  UpdatePageInputSchema,
  CreatePageVersionInputSchema,
  UpdatePageVersionInputSchema,
  PageFiltersSchema,
  PageSortOptionsSchema,
  PageListResponseSchema,
  PageResponseSchema,
} from '../page.schemas';

describe('Page Schemas', () => {
  describe('PageSchema', () => {
    it('should validate a valid page', () => {
      const validPage = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        site_id: '550e8400-e29b-41d4-a716-446655440001',
        slug: 'home',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        created_by: '550e8400-e29b-41d4-a716-446655440002',
        updated_by: '550e8400-e29b-41d4-a716-446655440003',
      };

      const result = PageSchema.safeParse(validPage);
      expect(result.success).toBe(true);
    });

    it('should reject invalid page data', () => {
      const invalidPage = {
        id: 'invalid-uuid',
        site_id: '550e8400-e29b-41d4-a716-446655440001',
        slug: '',
        created_at: 'invalid-date',
        updated_at: '2024-01-01T00:00:00Z',
        created_by: '550e8400-e29b-41d4-a716-446655440002',
        updated_by: '550e8400-e29b-41d4-a716-446655440003',
      };

      const result = PageSchema.safeParse(invalidPage);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(3); // id, slug, created_at
      }
    });
  });

  describe('CreatePageInputSchema', () => {
    it('should validate valid create page input', () => {
      const validInput = {
        site_id: '550e8400-e29b-41d4-a716-446655440001',
        slug: 'about',
        created_by: '550e8400-e29b-41d4-a716-446655440002',
      };

      const result = CreatePageInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject invalid create page input', () => {
      const invalidInput = {
        site_id: 'invalid-uuid',
        slug: '',
        created_by: '550e8400-e29b-41d4-a716-446655440002',
      };

      const result = CreatePageInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(2); // site_id, slug
      }
    });
  });

  describe('UpdatePageInputSchema', () => {
    it('should validate valid update page input', () => {
      const validInput = {
        slug: 'updated-about',
      };

      const result = UpdatePageInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject empty update input', () => {
      const invalidInput = {};

      const result = UpdatePageInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(1); // refinement error
      }
    });
  });

  describe('CreatePageVersionInputSchema', () => {
    it('should validate valid create page version input', () => {
      const validInput = {
        page_id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'About Us',
        locale: 'en-US',
        template: 'default',
        seo: { title: 'About Us - Company' },
        nav_hints: { showInNav: true },
        slots: [],
        created_by: '550e8400-e29b-41d4-a716-446655440002',
      };

      const result = CreatePageVersionInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should apply default values', () => {
      const input = {
        page_id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'About Us',
        template: 'default',
        created_by: '550e8400-e29b-41d4-a716-446655440002',
      };

      const result = CreatePageVersionInputSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.locale).toBe('en-US');
        expect(result.data.seo).toEqual({});
        expect(result.data.nav_hints).toEqual({});
        expect(result.data.slots).toEqual([]);
      }
    });
  });

  describe('UpdatePageVersionInputSchema', () => {
    it('should validate valid update page version input', () => {
      const validInput = {
        title: 'Updated About Us',
        template: 'new-template',
      };

      const result = UpdatePageVersionInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject empty update input', () => {
      const invalidInput = {};

      const result = UpdatePageVersionInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(1); // refinement error
      }
    });
  });

  describe('PageFiltersSchema', () => {
    it('should validate valid page filters', () => {
      const validFilters = {
        slug: 'home',
        created_by: '550e8400-e29b-41d4-a716-446655440002',
        date_from: '2024-01-01T00:00:00Z',
        date_to: '2024-12-31T23:59:59Z',
        search: 'about',
      };

      const result = PageFiltersSchema.safeParse(validFilters);
      expect(result.success).toBe(true);
    });

    it('should validate empty filters', () => {
      const emptyFilters = {};

      const result = PageFiltersSchema.safeParse(emptyFilters);
      expect(result.success).toBe(true);
    });
  });

  describe('PageSortOptionsSchema', () => {
    it('should validate valid sort options', () => {
      const validSort = {
        field: 'created_at' as const,
        direction: 'desc' as const,
      };

      const result = PageSortOptionsSchema.safeParse(validSort);
      expect(result.success).toBe(true);
    });

    it('should reject invalid sort options', () => {
      const invalidSort = {
        field: 'invalid_field',
        direction: 'invalid_direction',
      };

      const result = PageSortOptionsSchema.safeParse(invalidSort);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(2); // field, direction
      }
    });
  });

  describe('PageListResponseSchema', () => {
    it('should validate valid page list response', () => {
      const validResponse = {
        pages: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            site_id: '550e8400-e29b-41d4-a716-446655440001',
            slug: 'home',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            created_by: '550e8400-e29b-41d4-a716-446655440002',
            updated_by: '550e8400-e29b-41d4-a716-446655440003',
          },
        ],
        totalCount: 1,
        hasMore: false,
      };

      const result = PageListResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('PageResponseSchema', () => {
    it('should validate valid page response', () => {
      const validPage = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        site_id: '550e8400-e29b-41d4-a716-446655440001',
        slug: 'home',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        created_by: '550e8400-e29b-41d4-a716-446655440002',
        updated_by: '550e8400-e29b-41d4-a716-446655440003',
      };

      const result = PageResponseSchema.safeParse(validPage);
      expect(result.success).toBe(true);
    });
  });
});
