import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StagingService } from '../StagingService';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../../../../core/types/database.types';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
} as unknown as SupabaseClient<Database>;

describe('StagingService', () => {
  let stagingService: StagingService;

  beforeEach(() => {
    vi.clearAllMocks();
    stagingService = new StagingService(mockSupabase);
  });

  describe('listEnvironments', () => {
    it('should list staging environments with default parameters', async () => {
      const mockEnvironments = [
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
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.select.mockReturnValue(mockQuery);
      mockQuery.order.mockReturnValue(mockQuery);
      mockQuery.range.mockReturnValue(mockQuery);
      mockQuery.eq.mockReturnValue(mockQuery);
      mockQuery.gte.mockReturnValue(mockQuery);
      mockQuery.lte.mockReturnValue(mockQuery);
      mockQuery.or.mockReturnValue(mockQuery);
      mockQuery.select.mockResolvedValue({ data: mockEnvironments, error: null, count: 1 });

      const result = await stagingService.listEnvironments();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.environments).toEqual(mockEnvironments);
        expect(result.data.totalCount).toBe(1);
        expect(result.data.hasMore).toBe(false);
      }
    });

    it('should apply filters when provided', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.select.mockReturnValue(mockQuery);
      mockQuery.order.mockReturnValue(mockQuery);
      mockQuery.range.mockReturnValue(mockQuery);
      mockQuery.eq.mockReturnValue(mockQuery);
      mockQuery.gte.mockReturnValue(mockQuery);
      mockQuery.lte.mockReturnValue(mockQuery);
      mockQuery.or.mockReturnValue(mockQuery);
      mockQuery.select.mockResolvedValue({ data: [], error: null, count: 0 });

      const filters = {
        site_id: '550e8400-e29b-41d4-a716-446655440001',
        created_by: '550e8400-e29b-41d4-a716-446655440002',
        search: 'staging',
      };
      const sort = { field: 'name', direction: 'asc' } as const;

      await stagingService.listEnvironments(filters, sort);

      expect(mockQuery.eq).toHaveBeenCalledWith('site_id', '550e8400-e29b-41d4-a716-446655440001');
      expect(mockQuery.eq).toHaveBeenCalledWith('created_by', '550e8400-e29b-41d4-a716-446655440002');
      expect(mockQuery.or).toHaveBeenCalledWith('name.ilike.%staging%,description.ilike.%staging%');
      expect(mockQuery.order).toHaveBeenCalledWith('name', { ascending: true });
    });

    it('should handle errors when listing environments', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.select.mockReturnValue(mockQuery);
      mockQuery.order.mockReturnValue(mockQuery);
      mockQuery.range.mockReturnValue(mockQuery);
      mockQuery.eq.mockReturnValue(mockQuery);
      mockQuery.gte.mockReturnValue(mockQuery);
      mockQuery.lte.mockReturnValue(mockQuery);
      mockQuery.or.mockReturnValue(mockQuery);
      mockQuery.select.mockResolvedValue({ data: null, error: { message: 'Database error' } });

      const result = await stagingService.listEnvironments();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Database error');
      }
    });
  });

  describe('getEnvironment', () => {
    it('should get a single staging environment by ID', async () => {
      const mockEnvironment = {
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
      };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.single.mockResolvedValue({ data: mockEnvironment, error: null });

      const result = await stagingService.getEnvironment('550e8400-e29b-41d4-a716-446655440000');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockEnvironment);
      }
    });

    it('should handle errors when getting environment', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.single.mockResolvedValue({ data: null, error: { message: 'Environment not found' } });

      const result = await stagingService.getEnvironment('550e8400-e29b-41d4-a716-446655440000');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Environment not found');
      }
    });
  });

  describe('createEnvironment', () => {
    it('should create a new staging environment', async () => {
      const mockEnvironment = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        site_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Staging',
        description: 'Staging environment',
        url: 'https://staging.example.com',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        created_by: '550e8400-e29b-41d4-a716-446655440002',
        updated_by: '550e8400-e29b-41d4-a716-446655440002',
      };

      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.single.mockResolvedValue({ data: mockEnvironment, error: null });

      const input = {
        site_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Staging',
        description: 'Staging environment',
        url: 'https://staging.example.com',
        created_by: '550e8400-e29b-41d4-a716-446655440002',
      };

      const result = await stagingService.createEnvironment(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockEnvironment);
      }
    });

    it('should handle errors when creating environment', async () => {
      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.single.mockResolvedValue({ data: null, error: { message: 'Insert failed' } });

      const input = {
        site_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Staging',
        url: 'https://staging.example.com',
        created_by: '550e8400-e29b-41d4-a716-446655440002',
      };

      const result = await stagingService.createEnvironment(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Insert failed');
      }
    });
  });

  describe('updateEnvironment', () => {
    it('should update an existing staging environment', async () => {
      const mockEnvironment = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        site_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Updated Staging',
        description: 'Updated staging environment',
        url: 'https://updated-staging.example.com',
        is_active: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        created_by: '550e8400-e29b-41d4-a716-446655440002',
        updated_by: '550e8400-e29b-41d4-a716-446655440003',
      };

      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.single.mockResolvedValue({ data: mockEnvironment, error: null });

      const updates = {
        name: 'Updated Staging',
        description: 'Updated staging environment',
        url: 'https://updated-staging.example.com',
        is_active: false,
        updated_by: '550e8400-e29b-41d4-a716-446655440003',
      };

      const result = await stagingService.updateEnvironment('550e8400-e29b-41d4-a716-446655440000', updates);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockEnvironment);
      }
    });

    it('should handle errors when updating environment', async () => {
      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.single.mockResolvedValue({ data: null, error: { message: 'Update failed' } });

      const updates = {
        name: 'Updated Staging',
        updated_by: '550e8400-e29b-41d4-a716-446655440003',
      };

      const result = await stagingService.updateEnvironment('550e8400-e29b-41d4-a716-446655440000', updates);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Update failed');
      }
    });
  });

  describe('deleteEnvironment', () => {
    it('should delete a staging environment', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.delete.mockReturnValue(mockQuery);
      mockQuery.eq.mockReturnValue(mockQuery);
      mockQuery.delete.mockResolvedValue({ error: null });

      const result = await stagingService.deleteEnvironment('550e8400-e29b-41d4-a716-446655440000');

      expect(result.success).toBe(true);
    });

    it('should handle errors when deleting environment', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.delete.mockReturnValue(mockQuery);
      mockQuery.eq.mockReturnValue(mockQuery);
      mockQuery.delete.mockResolvedValue({ error: { message: 'Delete failed' } });

      const result = await stagingService.deleteEnvironment('550e8400-e29b-41d4-a716-446655440000');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Delete failed');
      }
    });
  });

  describe('createDeployment', () => {
    it('should create a new deployment', async () => {
      const mockDeployment = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        environment_id: '550e8400-e29b-41d4-a716-446655440001',
        site_id: '550e8400-e29b-41d4-a716-446655440002',
        status: 'pending',
        deployment_type: 'incremental',
        changes: [],
        deployed_by: '550e8400-e29b-41d4-a716-446655440003',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.single.mockResolvedValue({ data: mockDeployment, error: null });

      const result = await stagingService.createDeployment(
        '550e8400-e29b-41d4-a716-446655440001',
        [],
        '550e8400-e29b-41d4-a716-446655440003'
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockDeployment);
      }
    });

    it('should handle errors when creating deployment', async () => {
      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.single.mockResolvedValue({ data: null, error: { message: 'Insert failed' } });

      const result = await stagingService.createDeployment(
        '550e8400-e29b-41d4-a716-446655440001',
        [],
        '550e8400-e29b-41d4-a716-446655440003'
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Insert failed');
      }
    });
  });

  describe('createPreview', () => {
    it('should create a new preview', async () => {
      const mockPreview = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        deployment_id: '550e8400-e29b-41d4-a716-446655440001',
        url: 'https://preview-550e8400-e29b-41d4-a716-446655440001.example.com',
        expires_at: '2024-01-02T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        created_by: '550e8400-e29b-41d4-a716-446655440002',
      };

      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.single.mockResolvedValue({ data: mockPreview, error: null });

      const result = await stagingService.createPreview(
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440002'
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.preview).toEqual(mockPreview);
        expect(result.data.url).toBe(mockPreview.url);
      }
    });

    it('should handle errors when creating preview', async () => {
      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.single.mockResolvedValue({ data: null, error: { message: 'Insert failed' } });

      const result = await stagingService.createPreview(
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440002'
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Insert failed');
      }
    });
  });
});
