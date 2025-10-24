import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBlocks, useBlock, useBlockActions } from '../useBlocks';
import { BlockService } from '../../services/BlockService';
import { supabase } from '../../../../../core/supabase';

// Mock the document object for testing
Object.defineProperty(global, 'document', {
  value: {
    createElement: vi.fn(),
    getElementById: vi.fn(),
    querySelector: vi.fn(),
    querySelectorAll: vi.fn(),
    appendChild: vi.fn(),
    removeChild: vi.fn(),
    body: {
      appendChild: vi.fn(),
      removeChild: vi.fn(),
    },
  },
  writable: true,
});

// Mock the window object for testing
Object.defineProperty(global, 'window', {
  value: {
    document: global.document,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
  writable: true,
});

// Mock the BlockService
vi.mock('../../services/BlockService');
vi.mock('../../../../../core/supabase', () => ({
  supabase: {},
}));

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

const mockBlockListResponse = {
  blocks: [mockBlock],
  totalCount: 1,
  hasMore: false,
};

const mockListBlocks = vi.fn();
const mockGetBlock = vi.fn();
const mockCreateBlock = vi.fn();
const mockUpdateBlock = vi.fn();
const mockDeleteBlock = vi.fn();
const mockGetBlockUsage = vi.fn();
const mockIsBlockInUse = vi.fn();

// Cast BlockService.prototype to any to mock private/protected methods
(BlockService as any).mockImplementation(() => ({
  listBlocks: mockListBlocks,
  getBlock: mockGetBlock,
  createBlock: mockCreateBlock,
  updateBlock: mockUpdateBlock,
  deleteBlock: mockDeleteBlock,
  getBlockUsage: mockGetBlockUsage,
  isBlockInUse: mockIsBlockInUse,
}));

describe('useBlocks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListBlocks.mockResolvedValue({ success: true, data: mockBlockListResponse });
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useBlocks());

    expect(result.current.blocks).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.totalCount).toBe(0);
  });

  it('should fetch blocks successfully', async () => {
    const { result } = renderHook(() => useBlocks());

    await act(async () => {
      // Wait for the initial fetch to complete
    });

    expect(mockListBlocks).toHaveBeenCalledWith({}, { field: 'created_at', direction: 'desc' }, 50, 0);
    expect(result.current.blocks).toEqual(mockBlockListResponse.blocks);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.totalCount).toBe(1);
  });

  it('should handle fetch blocks error', async () => {
    mockListBlocks.mockResolvedValue({ success: false, error: 'Failed to fetch blocks' });

    const { result } = renderHook(() => useBlocks());

    await act(async () => {
      // Wait for the initial fetch to complete
    });

    expect(result.current.blocks).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Failed to fetch blocks');
    expect(result.current.hasMore).toBe(false);
    expect(result.current.totalCount).toBe(0);
  });

  it('should load more blocks successfully', async () => {
    mockListBlocks
      .mockResolvedValueOnce({
        success: true,
        data: { blocks: [mockBlock], totalCount: 2, hasMore: true },
      })
      .mockResolvedValueOnce({
        success: true,
        data: { blocks: [{ ...mockBlock, id: 'block-2' }], totalCount: 2, hasMore: false },
      });

    const { result } = renderHook(() => useBlocks());

    // Initial fetch
    await act(async () => {});

    expect(result.current.blocks).toEqual([mockBlock]);
    expect(result.current.hasMore).toBe(true);

    // Load more
    await act(async () => {
      result.current.loadMore();
    });

    expect(mockListBlocks).toHaveBeenCalledWith({}, { field: 'created_at', direction: 'desc' }, 50, 50);
    expect(result.current.blocks).toEqual([mockBlock, { ...mockBlock, id: 'block-2' }]);
    expect(result.current.loading).toBe(false);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.totalCount).toBe(2);
  });

  it('should not load more when loading or no more blocks', async () => {
    mockListBlocks.mockResolvedValue({
      success: true,
      data: { blocks: [mockBlock], totalCount: 1, hasMore: false },
    });

    const { result } = renderHook(() => useBlocks());

    // Set hasMore to false
    await act(async () => {});

    expect(result.current.hasMore).toBe(false);
    await act(async () => {
      result.current.loadMore();
    });
    expect(mockListBlocks).toHaveBeenCalledTimes(1); // Should not call again

    // Set loading to true
    result.current.loading = true;
    await act(async () => {
      result.current.loadMore();
    });
    expect(mockListBlocks).toHaveBeenCalledTimes(1); // Should not call again
  });
});

describe('useBlock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetBlock.mockResolvedValue({ success: true, data: mockBlock });
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useBlock('block-1'));

    expect(result.current.block).toBe(null);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);
  });

  it('should fetch block successfully', async () => {
    const { result } = renderHook(() => useBlock('block-1'));

    await act(async () => {
      // Wait for the fetch to complete
    });

    expect(mockGetBlock).toHaveBeenCalledWith('block-1');
    expect(result.current.block).toEqual(mockBlock);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle fetch block error', async () => {
    mockGetBlock.mockResolvedValue({ success: false, error: 'Block not found' });

    const { result } = renderHook(() => useBlock('block-1'));

    await act(async () => {
      // Wait for the fetch to complete
    });

    expect(result.current.block).toBe(null);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Block not found');
  });

  it('should not fetch when blockId is empty', () => {
    renderHook(() => useBlock(''));

    expect(mockGetBlock).not.toHaveBeenCalled();
  });
});

describe('useBlockActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateBlock.mockResolvedValue({ success: true, data: mockBlock });
    mockUpdateBlock.mockResolvedValue({ success: true, data: mockBlock });
    mockDeleteBlock.mockResolvedValue({ success: true, data: { id: 'block-1' } });
    mockGetBlockUsage.mockResolvedValue({ success: true, data: { usage_count: 2 } });
    mockIsBlockInUse.mockResolvedValue({ success: true, data: { in_use: true } });
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useBlockActions());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should create block successfully', async () => {
    const { result } = renderHook(() => useBlockActions());

    const input = {
      site_id: 'site-1',
      type: 'hero',
      tag: 'main-hero',
      created_by: '550e8400-e29b-41d4-a716-446655440000',
    };

    let createdBlock;
    await act(async () => {
      createdBlock = await result.current.createBlock(input);
    });

    expect(mockCreateBlock).toHaveBeenCalledWith(input);
    expect(createdBlock).toEqual({ success: true, data: mockBlock });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle create block error', async () => {
    mockCreateBlock.mockResolvedValue({ success: false, error: 'Create failed' });

    const { result } = renderHook(() => useBlockActions());

    const input = {
      site_id: 'site-1',
      type: 'hero',
      created_by: '550e8400-e29b-41d4-a716-446655440000',
    };

    let createdBlock;
    await act(async () => {
      createdBlock = await result.current.createBlock(input);
    });

    expect(mockCreateBlock).toHaveBeenCalledWith(input);
    expect(createdBlock).toEqual({ success: false, error: 'Create failed' });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Create failed');
  });

  it('should update block successfully', async () => {
    const { result } = renderHook(() => useBlockActions());

    const updates = {
      tag: 'updated-hero',
    };

    let updatedBlock;
    await act(async () => {
      updatedBlock = await result.current.updateBlock('block-1', updates);
    });

    expect(mockUpdateBlock).toHaveBeenCalledWith('block-1', updates);
    expect(updatedBlock).toEqual({ success: true, data: mockBlock });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should delete block successfully', async () => {
    const { result } = renderHook(() => useBlockActions());

    let deleted;
    await act(async () => {
      deleted = await result.current.deleteBlock('block-1');
    });

    expect(mockDeleteBlock).toHaveBeenCalledWith('block-1');
    expect(deleted).toEqual({ success: true, data: { id: 'block-1' } });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should get block usage successfully', async () => {
    const { result } = renderHook(() => useBlockActions());

    let usage;
    await act(async () => {
      usage = await result.current.getBlockUsage('block-1');
    });

    expect(mockGetBlockUsage).toHaveBeenCalledWith('block-1');
    expect(usage).toEqual({ success: true, data: { usage_count: 2 } });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should check if block is in use successfully', async () => {
    const { result } = renderHook(() => useBlockActions());

    let inUse;
    await act(async () => {
      inUse = await result.current.isBlockInUse('block-1');
    });

    expect(mockIsBlockInUse).toHaveBeenCalledWith('block-1');
    expect(inUse).toEqual({ success: true, data: { in_use: true } });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });
});
