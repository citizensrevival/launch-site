import { describe, it, expect } from 'vitest';
import {
  MenuSchema,
  MenuVersionSchema,
  CreateMenuInputSchema,
  UpdateMenuInputSchema,
  CreateMenuVersionInputSchema,
  UpdateMenuVersionInputSchema,
  MenuFiltersSchema,
  MenuSortOptionsSchema,
  MenuListResponseSchema,
  MenuResponseSchema,
} from '../menu.schemas';

describe('Menu Schemas', () => {
  describe('MenuSchema', () => {
    it('should validate a complete menu object', () => {
      const validMenu = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        site_id: '550e8400-e29b-41d4-a716-446655440001',
        handle: 'main-navigation',
        label: 'Main Navigation',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        created_by: '550e8400-e29b-41d4-a716-446655440002',
        updated_by: '550e8400-e29b-41d4-a716-446655440002',
      };

      const result = MenuSchema.safeParse(validMenu);
      if (!result.success) {
        console.log('Validation errors:', JSON.stringify(result.error.issues, null, 2));
      }
      expect(result.success).toBe(true);
    });

    it('should reject invalid menu data', () => {
      const invalidMenu = {
        id: 'not-a-uuid',
        site_id: 'not-a-uuid',
        handle: '',
        label: '',
        created_at: 'invalid-date',
        updated_at: 'invalid-date',
        created_by: 'not-a-uuid',
        updated_by: 'not-a-uuid',
      };

      const result = MenuSchema.safeParse(invalidMenu);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(8);
      }
    });

    it('should reject missing required fields', () => {
      const incompleteMenu = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        site_id: '550e8400-e29b-41d4-a716-446655440001',
        handle: 'main-navigation',
        // missing label, created_at, updated_at, created_by, updated_by
      };

      const result = MenuSchema.safeParse(incompleteMenu);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(5);
      }
    });
  });

  describe('MenuVersionSchema', () => {
    it('should validate a complete menu version object', () => {
      const validMenuVersion = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        menu_id: '550e8400-e29b-41d4-a716-446655440001',
        version: 1,
        items: [
          {
            id: 'item-1',
            type: 'page',
            label: { en: 'Home', es: 'Inicio' },
            target: '/',
          },
        ],
        status: 'draft',
        created_at: '2024-01-01T00:00:00Z',
        created_by: '550e8400-e29b-41d4-a716-446655440002',
        updated_by: '550e8400-e29b-41d4-a716-446655440002',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const result = MenuVersionSchema.safeParse(validMenuVersion);
      if (!result.success) {
        console.log('MenuVersion validation errors:', JSON.stringify(result.error.issues, null, 2));
      }
      expect(result.success).toBe(true);
    });

    it('should validate menu version with minimal fields', () => {
      const minimalMenuVersion = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        menu_id: '550e8400-e29b-41d4-a716-446655440001',
        version: 1,
        items: [],
        status: 'draft',
        created_at: '2024-01-01T00:00:00Z',
        created_by: '550e8400-e29b-41d4-a716-446655440002',
      };

      const result = MenuVersionSchema.safeParse(minimalMenuVersion);
      expect(result.success).toBe(true);
    });

    it('should reject invalid menu version data', () => {
      const invalidMenuVersion = {
        id: 'not-a-uuid',
        menu_id: 'not-a-uuid',
        version: -1,
        items: 'not-an-array',
        status: 'invalid-status',
        created_at: 'invalid-date',
        created_by: 'not-a-uuid',
      };

      const result = MenuVersionSchema.safeParse(invalidMenuVersion);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(7);
      }
    });
  });

  describe('CreateMenuInputSchema', () => {
    it('should validate menu input with required fields', () => {
      const validInput = {
        site_id: '550e8400-e29b-41d4-a716-446655440001',
        handle: 'main-navigation',
        label: 'Main Navigation',
        created_by: '550e8400-e29b-41d4-a716-446655440002',
      };

      const result = CreateMenuInputSchema.safeParse(validInput);
      if (!result.success) {
        console.log('CreateMenuInput validation errors:', JSON.stringify(result.error.issues, null, 2));
      }
      expect(result.success).toBe(true);
    });

    it('should reject invalid menu input', () => {
      const invalidInput = {
        site_id: 'not-a-uuid',
        handle: '',
        label: '',
        created_by: 'not-a-uuid',
      };

      const result = CreateMenuInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(4);
      }
    });

    it('should reject missing required fields', () => {
      const incompleteInput = {
        handle: 'main-navigation',
        // missing site_id, label, created_by
      };

      const result = CreateMenuInputSchema.safeParse(incompleteInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(3);
      }
    });
  });

  describe('UpdateMenuInputSchema', () => {
    it('should validate menu update with single field', () => {
      const validUpdate = {
        label: 'Updated Navigation',
      };

      const result = UpdateMenuInputSchema.safeParse(validUpdate);
      expect(result.success).toBe(true);
    });

    it('should validate menu update with multiple fields', () => {
      const validUpdate = {
        handle: 'updated-navigation',
        label: 'Updated Navigation',
      };

      const result = UpdateMenuInputSchema.safeParse(validUpdate);
      expect(result.success).toBe(true);
    });

    it('should reject invalid menu update', () => {
      const invalidUpdate = {
        handle: '',
        label: 123, // should be string
      };

      const result = UpdateMenuInputSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(2);
      }
    });

    it('should reject empty update object', () => {
      const emptyUpdate = {};

      const result = UpdateMenuInputSchema.safeParse(emptyUpdate);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(1);
      }
    });
  });

  describe('CreateMenuVersionInputSchema', () => {
    it('should validate menu version input with required fields', () => {
      const validInput = {
        menu_id: '550e8400-e29b-41d4-a716-446655440001',
        items: [
          {
            id: 'item-1',
            type: 'page',
            label: { en: 'Home' },
            target: '/',
          },
        ],
        created_by: '550e8400-e29b-41d4-a716-446655440002',
      };

      const result = CreateMenuVersionInputSchema.safeParse(validInput);
      if (!result.success) {
        console.log('CreateMenuVersionInput validation errors:', JSON.stringify(result.error.issues, null, 2));
      }
      expect(result.success).toBe(true);
    });

    it('should validate menu version input with empty items', () => {
      const validInput = {
        menu_id: '550e8400-e29b-41d4-a716-446655440001',
        items: [],
        created_by: '550e8400-e29b-41d4-a716-446655440002',
      };

      const result = CreateMenuVersionInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject invalid menu version input', () => {
      const invalidInput = {
        menu_id: 'not-a-uuid',
        items: 'not-an-array',
        created_by: 'not-a-uuid',
      };

      const result = CreateMenuVersionInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(3);
      }
    });
  });

  describe('UpdateMenuVersionInputSchema', () => {
    it('should validate menu version update with items', () => {
      const validUpdate = {
        items: [
          {
            id: 'item-1',
            type: 'page',
            label: { en: 'Updated Home' },
            target: '/',
          },
        ],
      };

      const result = UpdateMenuVersionInputSchema.safeParse(validUpdate);
      expect(result.success).toBe(true);
    });

    it('should reject empty update object', () => {
      const emptyUpdate = {};

      const result = UpdateMenuVersionInputSchema.safeParse(emptyUpdate);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(1);
      }
    });
  });

  describe('MenuFiltersSchema', () => {
    it('should validate empty filters', () => {
      const emptyFilters = {};
      const result = MenuFiltersSchema.safeParse(emptyFilters);
      expect(result.success).toBe(true);
    });

    it('should validate filters with all fields', () => {
      const completeFilters = {
        handle: 'main-navigation',
        label: 'Main Navigation',
        created_by: '550e8400-e29b-41d4-a716-446655440002',
        date_from: '2024-01-01T00:00:00Z',
        date_to: '2024-12-31T23:59:59Z',
        search: 'navigation',
      };

      const result = MenuFiltersSchema.safeParse(completeFilters);
      expect(result.success).toBe(true);
    });

    it('should validate filters with partial fields', () => {
      const partialFilters = {
        handle: 'main-navigation',
        search: 'nav',
      };

      const result = MenuFiltersSchema.safeParse(partialFilters);
      expect(result.success).toBe(true);
    });

    it('should reject invalid filters', () => {
      const invalidFilters = {
        handle: 123, // should be string
        date_from: 'not-a-date',
        created_by: 'not-a-uuid',
      };

      const result = MenuFiltersSchema.safeParse(invalidFilters);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(3);
      }
    });
  });

  describe('MenuSortOptionsSchema', () => {
    it('should validate sort options with valid field and direction', () => {
      const validSort = {
        field: 'created_at',
        direction: 'asc',
      };

      const result = MenuSortOptionsSchema.safeParse(validSort);
      expect(result.success).toBe(true);
    });

    it('should validate sort options with different field and direction', () => {
      const validSort = {
        field: 'handle',
        direction: 'desc',
      };

      const result = MenuSortOptionsSchema.safeParse(validSort);
      expect(result.success).toBe(true);
    });

    it('should reject invalid sort field', () => {
      const invalidSort = {
        field: 'invalid_field',
        direction: 'asc',
      };

      const result = MenuSortOptionsSchema.safeParse(invalidSort);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(1);
      }
    });

    it('should reject invalid sort direction', () => {
      const invalidSort = {
        field: 'created_at',
        direction: 'invalid-direction',
      };

      const result = MenuSortOptionsSchema.safeParse(invalidSort);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(1);
      }
    });
  });

  describe('MenuListResponseSchema', () => {
    it('should validate menu list response', () => {
      const validResponse = {
        menus: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            site_id: '550e8400-e29b-41d4-a716-446655440001',
            handle: 'main-navigation',
            label: 'Main Navigation',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            created_by: '550e8400-e29b-41d4-a716-446655440002',
            updated_by: '550e8400-e29b-41d4-a716-446655440002',
          },
        ],
        totalCount: 1,
        hasMore: false,
      };

      const result = MenuListResponseSchema.safeParse(validResponse);
      if (!result.success) {
        console.log('MenuListResponse validation errors:', JSON.stringify(result.error.issues, null, 2));
      }
      expect(result.success).toBe(true);
    });

    it('should validate empty menu list response', () => {
      const emptyResponse = {
        menus: [],
        totalCount: 0,
        hasMore: false,
      };

      const result = MenuListResponseSchema.safeParse(emptyResponse);
      expect(result.success).toBe(true);
    });

    it('should reject invalid menu list response', () => {
      const invalidResponse = {
        menus: [
          {
            id: 'not-a-uuid',
            site_id: '550e8400-e29b-41d4-a716-446655440001',
            handle: 'main-navigation',
            label: 'Main Navigation',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            created_by: '550e8400-e29b-41d4-a716-446655440002',
            updated_by: '550e8400-e29b-41d4-a716-446655440002',
          },
        ],
        totalCount: 'not-a-number',
        hasMore: 'not-a-boolean',
      };

      const result = MenuListResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(3);
      }
    });
  });

  describe('MenuResponseSchema', () => {
    it('should validate menu response', () => {
      const validResponse = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        site_id: '550e8400-e29b-41d4-a716-446655440001',
        handle: 'main-navigation',
        label: 'Main Navigation',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        created_by: '550e8400-e29b-41d4-a716-446655440002',
        updated_by: '550e8400-e29b-41d4-a716-446655440002',
      };

      const result = MenuResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it('should reject invalid menu response', () => {
      const invalidResponse = {
        id: 'not-a-uuid',
        site_id: 'not-a-uuid',
        handle: '',
        label: '',
        created_at: 'invalid-date',
        updated_at: 'invalid-date',
        created_by: 'not-a-uuid',
        updated_by: 'not-a-uuid',
      };

      const result = MenuResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(8);
      }
    });
  });
});
