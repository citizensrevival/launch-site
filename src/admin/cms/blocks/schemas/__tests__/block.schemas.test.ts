import { describe, it, expect } from 'vitest';
import {
  BlockSchema,
  CreateBlockInputSchema,
  UpdateBlockInputSchema,
  BlockFiltersSchema,
  BlockSortOptionsSchema,
  BlockListResponseSchema,
  BlockResponseSchema,
} from '../block.schemas';

describe('Block Schemas', () => {
  describe('BlockSchema', () => {
    it('should validate a complete block object', () => {
      const validBlock = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        site_id: '550e8400-e29b-41d4-a716-446655440001',
        type: 'hero',
        tag: 'main-hero',
        is_system: false,
        system_key: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        created_by: '550e8400-e29b-41d4-a716-446655440002',
        updated_by: '550e8400-e29b-41d4-a716-446655440002',
      };

      const result = BlockSchema.safeParse(validBlock);
      if (!result.success) {
        console.log('Validation errors:', JSON.stringify(result.error.issues, null, 2));
      }
      expect(result.success).toBe(true);
    });

    it('should validate a system block', () => {
      const systemBlock = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        site_id: '550e8400-e29b-41d4-a716-446655440001',
        type: 'header',
        tag: null,
        is_system: true,
        system_key: 'site-header',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        created_by: '550e8400-e29b-41d4-a716-446655440002',
        updated_by: '550e8400-e29b-41d4-a716-446655440002',
      };

      const result = BlockSchema.safeParse(systemBlock);
      expect(result.success).toBe(true);
    });

    it('should reject invalid block data', () => {
      const invalidBlock = {
        id: 'not-a-uuid',
        site_id: 'not-a-uuid',
        type: '',
        is_system: 'not-a-boolean',
        created_at: 'invalid-date',
        updated_at: 'invalid-date',
        created_by: 'not-a-uuid',
        updated_by: 'not-a-uuid',
      };

      const result = BlockSchema.safeParse(invalidBlock);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(8);
      }
    });

    it('should reject missing required fields', () => {
      const incompleteBlock = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        site_id: '550e8400-e29b-41d4-a716-446655440001',
        type: 'hero',
        // missing is_system, created_at, updated_at, created_by, updated_by
      };

      const result = BlockSchema.safeParse(incompleteBlock);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(5);
      }
    });
  });

  describe('CreateBlockInputSchema', () => {
    it('should validate block input with required fields', () => {
      const validInput = {
        site_id: '550e8400-e29b-41d4-a716-446655440001',
        type: 'hero',
        created_by: '550e8400-e29b-41d4-a716-446655440002',
      };

      const result = CreateBlockInputSchema.safeParse(validInput);
      if (!result.success) {
        console.log('CreateBlockInput validation errors:', JSON.stringify(result.error.issues, null, 2));
      }
      expect(result.success).toBe(true);
    });

    it('should validate block input with all optional fields', () => {
      const completeInput = {
        site_id: '550e8400-e29b-41d4-a716-446655440001',
        type: 'hero',
        tag: 'main-hero',
        is_system: true,
        system_key: 'site-hero',
        created_by: '550e8400-e29b-41d4-a716-446655440002',
      };

      const result = CreateBlockInputSchema.safeParse(completeInput);
      expect(result.success).toBe(true);
    });

    it('should reject invalid block input', () => {
      const invalidInput = {
        site_id: 'not-a-uuid',
        type: '',
        created_by: 'not-a-uuid',
      };

      const result = CreateBlockInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(3);
      }
    });

    it('should reject missing required fields', () => {
      const incompleteInput = {
        type: 'hero',
        // missing site_id, created_by
      };

      const result = CreateBlockInputSchema.safeParse(incompleteInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(2);
      }
    });
  });

  describe('UpdateBlockInputSchema', () => {
    it('should validate block update with single field', () => {
      const validUpdate = {
        type: 'updated-hero',
      };

      const result = UpdateBlockInputSchema.safeParse(validUpdate);
      expect(result.success).toBe(true);
    });

    it('should validate block update with multiple fields', () => {
      const validUpdate = {
        type: 'updated-hero',
        tag: 'updated-tag',
        system_key: 'updated-key',
      };

      const result = UpdateBlockInputSchema.safeParse(validUpdate);
      expect(result.success).toBe(true);
    });

    it('should reject invalid block update', () => {
      const invalidUpdate = {
        type: '',
        tag: 123, // should be string
      };

      const result = UpdateBlockInputSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(2);
      }
    });

    it('should reject empty update object', () => {
      const emptyUpdate = {};

      const result = UpdateBlockInputSchema.safeParse(emptyUpdate);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(1);
      }
    });
  });

  describe('BlockFiltersSchema', () => {
    it('should validate empty filters', () => {
      const emptyFilters = {};
      const result = BlockFiltersSchema.safeParse(emptyFilters);
      expect(result.success).toBe(true);
    });

    it('should validate filters with all fields', () => {
      const completeFilters = {
        type: 'hero',
        tag: 'main-hero',
        is_system: false,
        system_key: 'site-hero',
        created_by: '550e8400-e29b-41d4-a716-446655440002',
        date_from: '2024-01-01T00:00:00Z',
        date_to: '2024-12-31T23:59:59Z',
        search: 'hero',
      };

      const result = BlockFiltersSchema.safeParse(completeFilters);
      expect(result.success).toBe(true);
    });

    it('should validate filters with partial fields', () => {
      const partialFilters = {
        type: 'hero',
        is_system: false,
      };

      const result = BlockFiltersSchema.safeParse(partialFilters);
      expect(result.success).toBe(true);
    });

    it('should reject invalid filters', () => {
      const invalidFilters = {
        type: 123, // should be string
        is_system: 'not-a-boolean',
        date_from: 'not-a-date',
        created_by: 'not-a-uuid',
      };

      const result = BlockFiltersSchema.safeParse(invalidFilters);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(4);
      }
    });
  });

  describe('BlockSortOptionsSchema', () => {
    it('should validate sort options with valid field and direction', () => {
      const validSort = {
        field: 'created_at',
        direction: 'asc',
      };

      const result = BlockSortOptionsSchema.safeParse(validSort);
      expect(result.success).toBe(true);
    });

    it('should validate sort options with different field and direction', () => {
      const validSort = {
        field: 'type',
        direction: 'desc',
      };

      const result = BlockSortOptionsSchema.safeParse(validSort);
      expect(result.success).toBe(true);
    });

    it('should reject invalid sort field', () => {
      const invalidSort = {
        field: 'invalid_field',
        direction: 'asc',
      };

      const result = BlockSortOptionsSchema.safeParse(invalidSort);
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

      const result = BlockSortOptionsSchema.safeParse(invalidSort);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(1);
      }
    });
  });

  describe('BlockListResponseSchema', () => {
    it('should validate block list response', () => {
      const validResponse = {
        blocks: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            site_id: '550e8400-e29b-41d4-a716-446655440001',
            type: 'hero',
            tag: 'main-hero',
            is_system: false,
            system_key: null,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            created_by: '550e8400-e29b-41d4-a716-446655440002',
            updated_by: '550e8400-e29b-41d4-a716-446655440002',
          },
        ],
        totalCount: 1,
        hasMore: false,
      };

      const result = BlockListResponseSchema.safeParse(validResponse);
      if (!result.success) {
        console.log('BlockListResponse validation errors:', JSON.stringify(result.error.issues, null, 2));
      }
      expect(result.success).toBe(true);
    });

    it('should validate empty block list response', () => {
      const emptyResponse = {
        blocks: [],
        totalCount: 0,
        hasMore: false,
      };

      const result = BlockListResponseSchema.safeParse(emptyResponse);
      expect(result.success).toBe(true);
    });

    it('should reject invalid block list response', () => {
      const invalidResponse = {
        blocks: [
          {
            id: 'not-a-uuid',
            site_id: '550e8400-e29b-41d4-a716-446655440001',
            type: 'hero',
            is_system: false,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            created_by: '550e8400-e29b-41d4-a716-446655440002',
            updated_by: '550e8400-e29b-41d4-a716-446655440002',
          },
        ],
        totalCount: 'not-a-number',
        hasMore: 'not-a-boolean',
      };

      const result = BlockListResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(3);
      }
    });
  });

  describe('BlockResponseSchema', () => {
    it('should validate block response', () => {
      const validResponse = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        site_id: '550e8400-e29b-41d4-a716-446655440001',
        type: 'hero',
        tag: 'main-hero',
        is_system: false,
        system_key: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        created_by: '550e8400-e29b-41d4-a716-446655440002',
        updated_by: '550e8400-e29b-41d4-a716-446655440002',
      };

      const result = BlockResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it('should reject invalid block response', () => {
      const invalidResponse = {
        id: 'not-a-uuid',
        site_id: 'not-a-uuid',
        type: '',
        is_system: 'not-a-boolean',
        created_at: 'invalid-date',
        updated_at: 'invalid-date',
        created_by: 'not-a-uuid',
        updated_by: 'not-a-uuid',
      };

      const result = BlockResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(8);
      }
    });
  });
});
