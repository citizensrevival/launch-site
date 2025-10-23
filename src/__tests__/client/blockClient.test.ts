// Unit tests for block client functions
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getBlocks,
  getBlock,
  createBlock,
  updateBlock,
  deleteBlock,
  getBlockUsageCount
} from '../../lib/cms/client';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn()
  }
};

// Mock the supabase import
vi.mock('../../shell/lib/supabase', () => ({
  supabase: mockSupabase
}));

describe('Block Client Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.log = vi.fn(); // Mock console.log to capture logs
    console.error = vi.fn(); // Mock console.error to capture errors
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getBlocks', () => {
    it('should fetch blocks with basic parameters', async () => {
      const mockBlocks = [
        {
          id: 'block-1',
          site_id: 'site-1',
          type: 'hero',
          tag: 'marketing',
          is_system: false,
          system_key: null
        }
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis()
      };

      mockSupabase.from.mockReturnValue(mockQuery);
      mockQuery.select.mockResolvedValue({
        data: mockBlocks,
        error: null,
        count: 1
      });

      const result = await getBlocks('site-1');

      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
      expect(result.data?.data).toHaveLength(1);
      expect(result.data?.data[0].type).toBe('hero');
    });

    it('should handle errors gracefully', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis()
      };

      mockSupabase.from.mockReturnValue(mockQuery);
      mockQuery.select.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
        count: 0
      });

      const result = await getBlocks('site-1');

      expect(result.data).toBeNull();
      expect(result.error).toBe('Database error');
    });
  });

  describe('getBlock', () => {
    it('should fetch a single block by ID', async () => {
      const mockBlock = {
        id: 'block-1',
        site_id: 'site-1',
        type: 'hero',
        tag: 'marketing',
        is_system: false,
        system_key: null
      };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn()
      };

      mockSupabase.from.mockReturnValue(mockQuery);
      mockQuery.single.mockResolvedValue({
        data: mockBlock,
        error: null
      });

      const result = await getBlock('block-1');

      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
      expect(result.data?.id).toBe('block-1');
    });
  });

  describe('createBlock', () => {
    it('should create a new block successfully', async () => {
      const blockData = {
        site_id: 'site-1',
        type: 'hero',
        tag: 'marketing',
        is_system: false
      };

      const mockUser = { id: 'user-1' };
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });

      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn()
      };

      mockSupabase.from.mockReturnValue(mockQuery);
      mockQuery.single.mockResolvedValue({
        data: { id: 'block-1', ...blockData },
        error: null
      });

      const result = await createBlock(blockData);

      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('should handle unauthenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const blockData = {
        site_id: 'site-1',
        type: 'hero',
        tag: 'marketing',
        is_system: false
      };

      const result = await createBlock(blockData);

      expect(result.data).toBeNull();
      expect(result.error).toBe('User not authenticated');
    });
  });

  describe('updateBlock', () => {
    it('should update a block successfully', async () => {
      const updates = { type: 'updated-hero', tag: 'updated-marketing' };
      const mockUser = { id: 'user-1' };
      
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });

      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn()
      };

      mockSupabase.from.mockReturnValue(mockQuery);
      mockQuery.single.mockResolvedValue({
        data: { id: 'block-1', ...updates },
        error: null
      });

      const result = await updateBlock('block-1', updates);

      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
    });
  });

  describe('deleteBlock', () => {
    it('should delete a block successfully', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis()
      };

      mockSupabase.from.mockReturnValue(mockQuery);
      mockQuery.eq.mockResolvedValue({
        data: null,
        error: null
      });

      const result = await deleteBlock('block-1');

      expect(result.data).toBeUndefined();
      expect(result.error).toBeNull();
    });
  });

  describe('getBlockUsageCount', () => {
    it('should calculate usage count correctly', async () => {
      const mockPageVersions = [
        {
          slots: [
            { block_id: 'block-1', slot: 'hero', order: 1 },
            { block_id: 'block-2', slot: 'content', order: 1 }
          ]
        },
        {
          slots: [
            { block_id: 'block-1', slot: 'hero', order: 1 }
          ]
        }
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        contains: vi.fn().mockReturnThis()
      };

      mockSupabase.from.mockReturnValue(mockQuery);
      mockQuery.contains.mockResolvedValue({
        data: mockPageVersions,
        error: null
      });

      const result = await getBlockUsageCount('block-1');

      expect(result.data).toBe(2); // block-1 appears in 2 slots across 2 page versions
      expect(result.error).toBeNull();
    });
  });
});