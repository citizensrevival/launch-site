// Unit tests for block hooks
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import {
  useBlocks,
  useBlockManagement
} from '../../lib/cms/hooks';

// Mock the client functions
vi.mock('../../lib/cms/client', () => ({
  getBlocks: vi.fn(),
  createBlock: vi.fn(),
  updateBlock: vi.fn(),
  deleteBlock: vi.fn()
}));

describe('Block Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.log = vi.fn();
    console.error = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('useBlocks', () => {
    it('should fetch blocks on mount', async () => {
      const mockBlocks = {
        data: [
          {
            id: 'block-1',
            site_id: 'site-1',
            type: 'hero',
            tag: 'marketing',
            is_system: false,
            system_key: null
          }
        ],
        count: 1,
        page: 1,
        page_size: 20,
        total_pages: 1
      };

      const { getBlocks } = await import('../../lib/cms/client');
      vi.mocked(getBlocks).mockResolvedValue({
        data: mockBlocks,
        error: null
      });

      const { result } = renderHook(() => useBlocks('site-1'));

      await waitFor(() => {
        expect(getBlocks).toHaveBeenCalledWith('site-1', undefined, undefined, 1, 20);
        expect(result.current.blocks).toEqual(mockBlocks);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
      });
    });

    it('should handle errors gracefully', async () => {
      const { getBlocks } = await import('../../lib/cms/client');
      vi.mocked(getBlocks).mockResolvedValue({
        data: null,
        error: 'Database error'
      });

      const { result } = renderHook(() => useBlocks('site-1'));

      await waitFor(() => {
        expect(result.current.blocks).toBeNull();
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Database error');
      });
    });

    it('should not fetch if siteId is empty', async () => {
      const { getBlocks } = await import('../../lib/cms/client');
      
      renderHook(() => useBlocks(''));

      expect(getBlocks).not.toHaveBeenCalled();
    });
  });

  describe('useBlockManagement', () => {
    it('should provide management functions', () => {
      const { result } = renderHook(() => useBlockManagement());

      expect(result.current.createBlock).toBeDefined();
      expect(result.current.updateBlock).toBeDefined();
      expect(result.current.deleteBlock).toBeDefined();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle createBlock success', async () => {
      const mockBlock = {
        id: 'block-1',
        site_id: 'site-1',
        type: 'hero',
        tag: 'marketing',
        is_system: false,
        system_key: null
      };

      const { createBlock } = await import('../../lib/cms/client');
      vi.mocked(createBlock).mockResolvedValue({
        data: mockBlock,
        error: null
      });

      const { result } = renderHook(() => useBlockManagement());

      const blockData = {
        site_id: 'site-1',
        type: 'hero',
        tag: 'marketing',
        is_system: false
      };

      const createdBlock = await result.current.createBlock(blockData);

      expect(createBlock).toHaveBeenCalledWith(blockData);
      expect(createdBlock).toBe(mockBlock);
    });

    it('should handle createBlock error', async () => {
      const { createBlock } = await import('../../lib/cms/client');
      vi.mocked(createBlock).mockResolvedValue({
        data: null,
        error: 'Creation failed'
      });

      const { result } = renderHook(() => useBlockManagement());

      const blockData = {
        site_id: 'site-1',
        type: 'hero',
        tag: 'marketing',
        is_system: false
      };

      const createdBlock = await result.current.createBlock(blockData);

      expect(createdBlock).toBeNull();
    });
  });
});