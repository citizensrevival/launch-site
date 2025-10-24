import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BlockService } from '../BlockService';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../../../../core/types/database.types';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
} as unknown as SupabaseClient<Database>;

describe('BlockService', () => {
  let blockService: BlockService;

  beforeEach(() => {
    vi.clearAllMocks();
    blockService = new BlockService(mockSupabase);
  });

  describe('listBlocks', () => {
    it('should list blocks with default parameters', async () => {
      const mockBlocks = [
        {
          id: 'block-1',
          site_id: 'site-1',
          type: 'hero',
          tag: 'main-hero',
          is_system: false,
          system_key: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          created_by: 'user-1',
          updated_by: 'user-1',
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
      mockQuery.select.mockResolvedValue({ data: mockBlocks, error: null, count: 1 });
      
      const result = await blockService.listBlocks();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.blocks).toEqual(mockBlocks);
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
      mockQuery.select.mockResolvedValue({ data: [], error: null, count: 0 });
      
      const filters = {
        type: 'hero',
        is_system: false,
        search: 'main',
      };

      await blockService.listBlocks(filters);

      expect(mockQuery.eq).toHaveBeenCalledWith('type', 'hero');
      expect(mockQuery.eq).toHaveBeenCalledWith('is_system', false);
      expect(mockQuery.or).toHaveBeenCalledWith('type.ilike.%main%,tag.ilike.%main%,system_key.ilike.%main%');
    });

    it('should handle errors when listing blocks', async () => {
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
      mockQuery.select.mockResolvedValue({ data: null, error: { message: 'Database error' } });
      
      const result = await blockService.listBlocks();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Database error');
      }
    });
  });

  describe('getBlock', () => {
    it('should get a single block by ID', async () => {
      const mockBlock = {
        id: 'block-1',
        site_id: 'site-1',
        type: 'hero',
        tag: 'main-hero',
        is_system: false,
        system_key: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        created_by: 'user-1',
        updated_by: 'user-1',
      };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.single.mockResolvedValue({ data: mockBlock, error: null });
      
      const result = await blockService.getBlock('block-1');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockBlock);
      }
    });

    it('should handle errors when getting block', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.single.mockResolvedValue({ data: null, error: { message: 'Block not found' } });
      
      const result = await blockService.getBlock('block-1');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Block not found');
      }
    });
  });

  describe('createBlock', () => {
    it('should create a new block', async () => {
      const mockBlock = {
        id: 'block-1',
        site_id: 'site-1',
        type: 'hero',
        tag: 'main-hero',
        is_system: false,
        system_key: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        created_by: 'user-1',
        updated_by: 'user-1',
      };

      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.single.mockResolvedValue({ data: mockBlock, error: null });
      
      const input = {
        site_id: '550e8400-e29b-41d4-a716-446655440001',
        type: 'hero',
        tag: 'main-hero',
        created_by: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = await blockService.createBlock(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockBlock);
      }
    });

    it('should handle errors when creating block', async () => {
      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.single.mockResolvedValue({ data: null, error: { message: 'Insert failed' } });
      
      const input = {
        site_id: '550e8400-e29b-41d4-a716-446655440001',
        type: 'hero',
        created_by: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = await blockService.createBlock(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Insert failed');
      }
    });
  });

  describe('updateBlock', () => {
    it('should update an existing block', async () => {
      const mockBlock = {
        id: 'block-1',
        site_id: 'site-1',
        type: 'hero',
        tag: 'updated-hero',
        is_system: false,
        system_key: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        created_by: 'user-1',
        updated_by: 'user-1',
      };

      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.single.mockResolvedValue({ data: mockBlock, error: null });
      
      const updates = {
        tag: 'updated-hero',
      };

      const result = await blockService.updateBlock('block-1', updates);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockBlock);
      }
    });

    it('should handle errors when updating block', async () => {
      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.single.mockResolvedValue({ data: null, error: { message: 'Update failed' } });
      
      const updates = {
        tag: 'updated-hero',
      };

      const result = await blockService.updateBlock('block-1', updates);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Update failed');
      }
    });
  });

  describe('deleteBlock', () => {
    it('should delete a block', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.delete.mockReturnValue(mockQuery);
      mockQuery.eq.mockReturnValue(mockQuery);
      mockQuery.delete.mockResolvedValue({ error: null });
      
      const result = await blockService.deleteBlock('block-1');

      expect(result.success).toBe(true);
    });

    it('should handle errors when deleting block', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.delete.mockReturnValue(mockQuery);
      mockQuery.eq.mockReturnValue(mockQuery);
      mockQuery.delete.mockResolvedValue({ error: { message: 'Delete failed' } });
      
      const result = await blockService.deleteBlock('block-1');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Delete failed');
      }
    });
  });

  describe('getBlockUsage', () => {
    it('should get block usage count', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.select.mockReturnValue(mockQuery);
      mockQuery.eq.mockReturnValue(mockQuery);
      mockQuery.select.mockResolvedValue({ data: [{ id: 'slot-1' }, { id: 'slot-2' }], error: null });
      
      const result = await blockService.getBlockUsage('block-1');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.usage_count).toBe(2);
      }
    });

    it('should handle errors when getting block usage', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.select.mockReturnValue(mockQuery);
      mockQuery.eq.mockReturnValue(mockQuery);
      mockQuery.select.mockResolvedValue({ data: null, error: { message: 'Query failed' } });
      
      const result = await blockService.getBlockUsage('block-1');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Query failed');
      }
    });
  });

  describe('isBlockInUse', () => {
    it('should return true when block is in use', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.select.mockReturnValue(mockQuery);
      mockQuery.eq.mockReturnValue(mockQuery);
      mockQuery.select.mockResolvedValue({ data: [{ id: 'slot-1' }], error: null });
      
      const result = await blockService.isBlockInUse('block-1');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.in_use).toBe(true);
      }
    });

    it('should return false when block is not in use', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.select.mockReturnValue(mockQuery);
      mockQuery.eq.mockReturnValue(mockQuery);
      mockQuery.select.mockResolvedValue({ data: [], error: null });
      
      const result = await blockService.isBlockInUse('block-1');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.in_use).toBe(false);
      }
    });
  });
});
