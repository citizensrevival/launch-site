import { describe, it, expect } from 'vitest';
import {
  AssetSchema,
  AssetInputSchema,
  AssetUpdateSchema,
  AssetFiltersSchema,
  AssetSortOptionsSchema,
  AssetListResponseSchema,
  AssetResponseSchema,
} from '../asset.schemas';

describe('Asset Schemas', () => {
  describe('AssetSchema', () => {
    it('should validate a complete asset object', () => {
      const validAsset = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        kind: 'image',
        storage_key: 'images/hero-banner.jpg',
        width: 1920,
        height: 1080,
        duration_ms: null,
        file_size: 1024000,
        mime_type: 'image/jpeg',
        alt_text: 'Hero banner image',
        caption: 'Main hero banner for the website',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        created_by: '550e8400-e29b-41d4-a716-446655440000',
        updated_by: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = AssetSchema.safeParse(validAsset);
      if (!result.success) {
        console.log('Validation errors:', JSON.stringify(result.error.issues, null, 2));
      }
      expect(result.success).toBe(true);
    });

    it('should validate an asset with minimal required fields', () => {
      const minimalAsset = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        kind: 'document',
        storage_key: 'documents/contract.pdf',
        file_size: 2048000,
        mime_type: 'application/pdf',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        created_by: '550e8400-e29b-41d4-a716-446655440000',
        updated_by: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = AssetSchema.safeParse(minimalAsset);
      if (!result.success) {
        console.log('Minimal asset validation errors:', JSON.stringify(result.error.issues, null, 2));
      }
      expect(result.success).toBe(true);
    });

    it('should reject invalid asset data', () => {
      const invalidAsset = {
        id: 'not-a-uuid',
        kind: 'invalid-kind',
        storage_key: '',
        created_at: 'invalid-date',
        updated_at: 'invalid-date',
        created_by: '',
        updated_by: '',
      };

      const result = AssetSchema.safeParse(invalidAsset);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(6);
      }
    });

    it('should reject missing required fields', () => {
      const incompleteAsset = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        kind: 'image',
        // missing storage_key, created_at, updated_at, created_by, updated_by
      };

      const result = AssetSchema.safeParse(incompleteAsset);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(5);
      }
    });
  });

  describe('AssetInputSchema', () => {
    it('should validate asset input with required fields', () => {
      const validInput = {
        kind: 'image',
        storage_key: 'images/hero-banner.jpg',
        published_by: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = AssetInputSchema.safeParse(validInput);
      if (!result.success) {
        console.log('Asset input validation errors:', JSON.stringify(result.error.issues, null, 2));
      }
      expect(result.success).toBe(true);
    });

    it('should validate asset input with all optional fields', () => {
      const completeInput = {
        kind: 'image',
        storage_key: 'images/hero-banner.jpg',
        width: 1920,
        height: 1080,
        duration_ms: 5000,
        published_by: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = AssetInputSchema.safeParse(completeInput);
      expect(result.success).toBe(true);
    });

    it('should reject invalid asset input', () => {
      const invalidInput = {
        kind: 'invalid-kind',
        storage_key: '',
        published_by: 'not-a-uuid',
      };

      const result = AssetInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(2);
      }
    });

    it('should reject missing required fields', () => {
      const incompleteInput = {
        kind: 'image',
        // missing storage_key and published_by
      };

      const result = AssetInputSchema.safeParse(incompleteInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(2);
      }
    });
  });

  describe('AssetUpdateSchema', () => {
    it('should validate asset update with single field', () => {
      const validUpdate = {
        width: 1920,
      };

      const result = AssetUpdateSchema.safeParse(validUpdate);
      expect(result.success).toBe(true);
    });

    it('should validate asset update with multiple fields', () => {
      const validUpdate = {
        width: 1920,
        height: 1080,
        duration_ms: 5000,
      };

      const result = AssetUpdateSchema.safeParse(validUpdate);
      expect(result.success).toBe(true);
    });

    it('should reject invalid asset update', () => {
      const invalidUpdate = {
        width: -100,
        height: 'not-a-number',
        kind: 'invalid-kind',
      };

      const result = AssetUpdateSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(2);
      }
    });

    it('should reject empty update object', () => {
      const emptyUpdate = {};

      const result = AssetUpdateSchema.safeParse(emptyUpdate);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(1);
      }
    });
  });

  describe('AssetFiltersSchema', () => {
    it('should validate empty filters', () => {
      const emptyFilters = {};

      const result = AssetFiltersSchema.safeParse(emptyFilters);
      expect(result.success).toBe(true);
    });

    it('should validate filters with all fields', () => {
      const completeFilters = {
        kind: 'image',
        published_by: '550e8400-e29b-41d4-a716-446655440000',
        date_from: '2024-01-01T00:00:00Z',
        date_to: '2024-12-31T23:59:59Z',
        search: 'hero banner',
      };

      const result = AssetFiltersSchema.safeParse(completeFilters);
      expect(result.success).toBe(true);
    });

    it('should validate filters with partial fields', () => {
      const partialFilters = {
        kind: 'image',
        search: 'hero',
      };

      const result = AssetFiltersSchema.safeParse(partialFilters);
      expect(result.success).toBe(true);
    });

    it('should reject invalid filters', () => {
      const invalidFilters = {
        kind: 'invalid-kind',
        date_from: 'invalid-date',
        date_to: 'invalid-date',
      };

      const result = AssetFiltersSchema.safeParse(invalidFilters);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(3);
      }
    });
  });

  describe('AssetSortOptionsSchema', () => {
    it('should validate sort options with valid field and direction', () => {
      const validSort = {
        field: 'created_at',
        direction: 'desc',
      };

      const result = AssetSortOptionsSchema.safeParse(validSort);
      expect(result.success).toBe(true);
    });

    it('should validate sort options with different field and direction', () => {
      const validSort = {
        field: 'kind',
        direction: 'asc',
      };

      const result = AssetSortOptionsSchema.safeParse(validSort);
      expect(result.success).toBe(true);
    });

    it('should reject invalid sort field', () => {
      const invalidSort = {
        field: 'invalid-field',
        direction: 'desc',
      };

      const result = AssetSortOptionsSchema.safeParse(invalidSort);
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

      const result = AssetSortOptionsSchema.safeParse(invalidSort);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(1);
      }
    });
  });

  describe('AssetListResponseSchema', () => {
    it('should validate asset list response', () => {
      const validResponse = {
        assets: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            kind: 'image',
            storage_key: 'images/hero-banner.jpg',
            width: 1920,
            height: 1080,
            duration_ms: null,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            created_by: '550e8400-e29b-41d4-a716-446655440000',
            updated_by: '550e8400-e29b-41d4-a716-446655440000',
          },
        ],
        totalCount: 1,
        hasMore: false,
      };

      const result = AssetListResponseSchema.safeParse(validResponse);
      if (!result.success) {
        console.log('AssetListResponse validation errors:', JSON.stringify(result.error.issues, null, 2));
      }
      expect(result.success).toBe(true);
    });

    it('should validate empty asset list response', () => {
      const emptyResponse = {
        assets: [],
        totalCount: 0,
        hasMore: false,
      };

      const result = AssetListResponseSchema.safeParse(emptyResponse);
      expect(result.success).toBe(true);
    });

    it('should reject invalid asset list response', () => {
      const invalidResponse = {
        assets: 'not-an-array',
        totalCount: 'not-a-number',
        hasMore: 'not-a-boolean',
      };

      const result = AssetListResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(3);
      }
    });
  });

  describe('AssetResponseSchema', () => {
    it('should validate asset response', () => {
      const validResponse = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        kind: 'image',
        storage_key: 'images/hero-banner.jpg',
        width: 1920,
        height: 1080,
        duration_ms: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        created_by: '550e8400-e29b-41d4-a716-446655440000',
        updated_by: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = AssetResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it('should reject invalid asset response', () => {
      const invalidResponse = {
        id: 'not-a-uuid',
        kind: 'invalid-kind',
        storage_key: '',
        created_at: 'invalid-date',
        updated_at: 'invalid-date',
        created_by: '',
        updated_by: '',
      };

      const result = AssetResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(6);
      }
    });
  });
});
