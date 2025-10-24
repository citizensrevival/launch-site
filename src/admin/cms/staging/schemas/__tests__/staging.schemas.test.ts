import { describe, it, expect } from 'vitest';
import {
  StagingEnvironmentSchema,
  CreateStagingEnvironmentInputSchema,
  UpdateStagingEnvironmentInputSchema,
  StagingFiltersSchema,
  StagingSortOptionsSchema,
  StagingListResponseSchema,
  StagingResponseSchema,
  StagingPreviewResponseSchema,
} from '../staging.schemas';

describe('Staging Schemas', () => {
  describe('StagingEnvironmentSchema', () => {
    it('should validate a valid staging environment', () => {
      const validEnvironment = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        site_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Staging',
        description: 'Staging environment for testing',
        url: 'https://staging.example.com',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        created_by: '550e8400-e29b-41d4-a716-446655440002',
        updated_by: '550e8400-e29b-41d4-a716-446655440003',
      };

      const result = StagingEnvironmentSchema.safeParse(validEnvironment);
      expect(result.success).toBe(true);
    });

    it('should reject invalid staging environment data', () => {
      const invalidEnvironment = {
        id: 'invalid-uuid',
        site_id: '550e8400-e29b-41d4-a716-446655440001',
        name: '',
        description: 'Staging environment for testing',
        url: 'invalid-url',
        is_active: true,
        created_at: 'invalid-date',
        updated_at: '2024-01-01T00:00:00Z',
        created_by: '550e8400-e29b-41d4-a716-446655440002',
        updated_by: '550e8400-e29b-41d4-a716-446655440003',
      };

      const result = StagingEnvironmentSchema.safeParse(invalidEnvironment);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(4); // id, name, url, created_at
      }
    });
  });

  describe('CreateStagingEnvironmentInputSchema', () => {
    it('should validate valid create staging environment input', () => {
      const validInput = {
        site_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Staging',
        description: 'Staging environment for testing',
        url: 'https://staging.example.com',
        created_by: '550e8400-e29b-41d4-a716-446655440002',
      };

      const result = CreateStagingEnvironmentInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject invalid create staging environment input', () => {
      const invalidInput = {
        site_id: 'invalid-uuid',
        name: '',
        description: 'Staging environment for testing',
        url: 'invalid-url',
        created_by: '550e8400-e29b-41d4-a716-446655440002',
      };

      const result = CreateStagingEnvironmentInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(3); // site_id, name, url
      }
    });
  });

  describe('UpdateStagingEnvironmentInputSchema', () => {
    it('should validate valid update staging environment input', () => {
      const validInput = {
        name: 'Updated Staging',
        description: 'Updated staging environment',
        url: 'https://updated-staging.example.com',
        is_active: false,
        updated_by: '550e8400-e29b-41d4-a716-446655440002',
      };

      const result = UpdateStagingEnvironmentInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject empty update input', () => {
      const invalidInput = {
        updated_by: '550e8400-e29b-41d4-a716-446655440002',
      };

      const result = UpdateStagingEnvironmentInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(1); // refinement error
      }
    });
  });

  describe('StagingFiltersSchema', () => {
    it('should validate valid staging filters', () => {
      const validFilters = {
        site_id: '550e8400-e29b-41d4-a716-446655440001',
        environment_id: '550e8400-e29b-41d4-a716-446655440002',
        status: 'deployed',
        deployment_type: 'full',
        created_by: '550e8400-e29b-41d4-a716-446655440003',
        date_from: '2024-01-01T00:00:00Z',
        date_to: '2024-12-31T23:59:59Z',
        search: 'staging',
      };

      const result = StagingFiltersSchema.safeParse(validFilters);
      expect(result.success).toBe(true);
    });

    it('should validate empty filters', () => {
      const emptyFilters = {};

      const result = StagingFiltersSchema.safeParse(emptyFilters);
      expect(result.success).toBe(true);
    });
  });

  describe('StagingSortOptionsSchema', () => {
    it('should validate valid sort options', () => {
      const validSort = {
        field: 'created_at' as const,
        direction: 'desc' as const,
      };

      const result = StagingSortOptionsSchema.safeParse(validSort);
      expect(result.success).toBe(true);
    });

    it('should reject invalid sort options', () => {
      const invalidSort = {
        field: 'invalid_field',
        direction: 'invalid_direction',
      };

      const result = StagingSortOptionsSchema.safeParse(invalidSort);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(2); // field, direction
      }
    });
  });

  describe('StagingListResponseSchema', () => {
    it('should validate valid staging list response', () => {
      const validResponse = {
        environments: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            site_id: '550e8400-e29b-41d4-a716-446655440001',
            name: 'Staging',
            description: 'Staging environment',
            url: 'https://staging.example.com',
            is_active: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            created_by: '550e8400-e29b-41d4-a716-446655440002',
            updated_by: '550e8400-e29b-41d4-a716-446655440003',
          },
        ],
        deployments: [],
        totalCount: 1,
        hasMore: false,
      };

      const result = StagingListResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('StagingResponseSchema', () => {
    it('should validate valid staging response', () => {
      const validResponse = {
        environment: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          site_id: '550e8400-e29b-41d4-a716-446655440001',
          name: 'Staging',
          description: 'Staging environment',
          url: 'https://staging.example.com',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          created_by: '550e8400-e29b-41d4-a716-446655440002',
          updated_by: '550e8400-e29b-41d4-a716-446655440003',
        },
      };

      const result = StagingResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('StagingPreviewResponseSchema', () => {
    it('should validate valid staging preview response', () => {
      const validResponse = {
        preview: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          deployment_id: '550e8400-e29b-41d4-a716-446655440001',
          url: 'https://preview.example.com',
          expires_at: '2024-01-02T00:00:00Z',
          created_at: '2024-01-01T00:00:00Z',
          created_by: '550e8400-e29b-41d4-a716-446655440002',
        },
        url: 'https://preview.example.com',
      };

      const result = StagingPreviewResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });
  });
});
