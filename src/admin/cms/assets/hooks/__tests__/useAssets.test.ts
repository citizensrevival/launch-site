import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAssets, useAsset, useAssetActions } from '../useAssets';
import { AssetService } from '../../services/AssetService';
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

// Mock the AssetService
vi.mock('../../services/AssetService');
vi.mock('../../../../../core/supabase', () => ({
  supabase: {},
}));

describe('useAssets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAssets());

    expect(result.current.assets).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.hasMore).toBe(false);
  });

  it('should fetch assets successfully', async () => {
    const mockAssets = [
      {
        id: 'asset-1',
        kind: 'image',
        storage_key: 'images/asset-1.jpg',
        width: 1920,
        height: 1080,
        duration_ms: null,
        published_at: '2024-01-01T00:00:00Z',
        published_by: 'user-1',
      },
    ];

    const mockListAssets = vi.fn().mockResolvedValue({
      success: true,
      data: {
        assets: mockAssets,
        totalCount: 1,
        hasMore: false,
      },
    });

    (AssetService as any).mockImplementation(() => ({
      listAssets: mockListAssets,
    }));

    const { result } = renderHook(() => useAssets());

    await act(async () => {
      await result.current.fetchAssets();
    });

    expect(result.current.assets).toEqual(mockAssets);
    expect(result.current.totalCount).toBe(1);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle fetch assets error', async () => {
    const mockListAssets = vi.fn().mockResolvedValue({
      success: false,
      error: 'Failed to fetch assets',
    });

    (AssetService as any).mockImplementation(() => ({
      listAssets: mockListAssets,
    }));

    const { result } = renderHook(() => useAssets());

    await act(async () => {
      await result.current.fetchAssets();
    });

    expect(result.current.assets).toEqual([]);
    expect(result.current.error).toBe('Failed to fetch assets');
    expect(result.current.loading).toBe(false);
  });

  it('should load more assets successfully', async () => {
    const initialAssets = [
      {
        id: 'asset-1',
        kind: 'image',
        storage_key: 'images/asset-1.jpg',
        width: 1920,
        height: 1080,
        duration_ms: null,
        published_at: '2024-01-01T00:00:00Z',
        published_by: 'user-1',
      },
    ];

    const additionalAssets = [
      {
        id: 'asset-2',
        kind: 'image',
        storage_key: 'images/asset-2.jpg',
        width: 1920,
        height: 1080,
        duration_ms: null,
        published_at: '2024-01-01T00:00:00Z',
        published_by: 'user-1',
      },
    ];

    const mockListAssets = vi.fn()
      .mockResolvedValueOnce({
        success: true,
        data: {
          assets: initialAssets,
          totalCount: 2,
          hasMore: true,
        },
      })
      .mockResolvedValueOnce({
        success: true,
        data: {
          assets: additionalAssets,
          totalCount: 2,
          hasMore: false,
        },
      });

    (AssetService as any).mockImplementation(() => ({
      listAssets: mockListAssets,
    }));

    const { result } = renderHook(() => useAssets());

    // Initial fetch
    await act(async () => {
      await result.current.fetchAssets();
    });

    expect(result.current.assets).toEqual(initialAssets);
    expect(result.current.hasMore).toBe(true);

    // Load more
    await act(async () => {
      await result.current.loadMoreAssets();
    });

    expect(result.current.assets).toEqual([...initialAssets, ...additionalAssets]);
    expect(result.current.hasMore).toBe(false);
  });

  it('should not load more when loading or no more assets', async () => {
    const mockListAssets = vi.fn().mockResolvedValue({
      success: true,
      data: {
        assets: [],
        totalCount: 0,
        hasMore: false,
      },
    });

    (AssetService as any).mockImplementation(() => ({
      listAssets: mockListAssets,
    }));

    const { result } = renderHook(() => useAssets());

    // Set hasMore to false
    await act(async () => {
      await result.current.fetchAssets();
    });

    expect(result.current.hasMore).toBe(false);

    // Try to load more
    await act(async () => {
      await result.current.loadMoreAssets();
    });

    // Should not call listAssets again
    expect(mockListAssets).toHaveBeenCalledTimes(1);
  });
});

describe('useAsset', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAsset('asset-1'));

    expect(result.current.asset).toBe(null);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should fetch asset successfully', async () => {
    const mockAsset = {
      id: 'asset-1',
      kind: 'image',
      storage_key: 'images/asset-1.jpg',
      width: 1920,
      height: 1080,
      duration_ms: null,
      published_at: '2024-01-01T00:00:00Z',
      published_by: 'user-1',
    };

    const mockGetAsset = vi.fn().mockResolvedValue({
      success: true,
      data: mockAsset,
    });

    (AssetService as any).mockImplementation(() => ({
      getAsset: mockGetAsset,
    }));

    const { result } = renderHook(() => useAsset('asset-1'));

    await act(async () => {
      // Wait for the effect to run
    });

    expect(result.current.asset).toEqual(mockAsset);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle fetch asset error', async () => {
    const mockGetAsset = vi.fn().mockResolvedValue({
      success: false,
      error: 'Asset not found',
    });

    (AssetService as any).mockImplementation(() => ({
      getAsset: mockGetAsset,
    }));

    const { result } = renderHook(() => useAsset('asset-1'));

    await act(async () => {
      // Wait for the effect to run
    });

    expect(result.current.asset).toBe(null);
    expect(result.current.error).toBe('Asset not found');
    expect(result.current.loading).toBe(false);
  });

  it('should not fetch when assetId is empty', () => {
    const mockGetAsset = vi.fn();

    (AssetService as any).mockImplementation(() => ({
      getAsset: mockGetAsset,
    }));

    renderHook(() => useAsset(''));

    expect(mockGetAsset).not.toHaveBeenCalled();
  });
});

describe('useAssetActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAssetActions());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should create asset successfully', async () => {
    const mockAsset = {
      id: 'asset-1',
      kind: 'image',
      storage_key: 'images/asset-1.jpg',
      width: 1920,
      height: 1080,
      duration_ms: null,
      published_at: '2024-01-01T00:00:00Z',
      published_by: 'user-1',
    };

    const mockCreateAsset = vi.fn().mockResolvedValue({
      success: true,
      data: mockAsset,
    });

    (AssetService as any).mockImplementation(() => ({
      createAsset: mockCreateAsset,
    }));

    const { result } = renderHook(() => useAssetActions());

    const input = {
      kind: 'image',
      storage_key: 'images/asset-1.jpg',
      published_by: 'user-1',
    };

    let createdAsset;
    await act(async () => {
      createdAsset = await result.current.createAsset(input);
    });

    expect(createdAsset).toEqual(mockAsset);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle create asset error', async () => {
    const mockCreateAsset = vi.fn().mockResolvedValue({
      success: false,
      error: 'Failed to create asset',
    });

    (AssetService as any).mockImplementation(() => ({
      createAsset: mockCreateAsset,
    }));

    const { result } = renderHook(() => useAssetActions());

    const input = {
      kind: 'image',
      storage_key: 'images/asset-1.jpg',
      published_by: 'user-1',
    };

    let createdAsset;
    await act(async () => {
      createdAsset = await result.current.createAsset(input);
    });

    expect(createdAsset).toBe(null);
    expect(result.current.error).toBe('Failed to create asset');
    expect(result.current.loading).toBe(false);
  });

  it('should update asset successfully', async () => {
    const mockAsset = {
      id: 'asset-1',
      kind: 'image',
      storage_key: 'images/asset-1.jpg',
      width: 1920,
      height: 1080,
      duration_ms: null,
      published_at: '2024-01-01T00:00:00Z',
      published_by: 'user-1',
    };

    const mockUpdateAsset = vi.fn().mockResolvedValue({
      success: true,
      data: mockAsset,
    });

    (AssetService as any).mockImplementation(() => ({
      updateAsset: mockUpdateAsset,
    }));

    const { result } = renderHook(() => useAssetActions());

    const updates = {
      width: 1920,
      height: 1080,
    };

    let updatedAsset;
    await act(async () => {
      updatedAsset = await result.current.updateAsset('asset-1', updates);
    });

    expect(updatedAsset).toEqual(mockAsset);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should delete asset successfully', async () => {
    const mockDeleteAsset = vi.fn().mockResolvedValue({
      success: true,
    });

    (AssetService as any).mockImplementation(() => ({
      deleteAsset: mockDeleteAsset,
    }));

    const { result } = renderHook(() => useAssetActions());

    let deleted;
    await act(async () => {
      deleted = await result.current.deleteAsset('asset-1');
    });

    expect(deleted).toBe(true);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should upload asset successfully', async () => {
    const mockAsset = {
      id: 'asset-1',
      kind: 'image',
      storage_key: 'images/asset-1.jpg',
      width: 1920,
      height: 1080,
      duration_ms: null,
      published_at: '2024-01-01T00:00:00Z',
      published_by: 'user-1',
    };

    const mockUploadAsset = vi.fn().mockResolvedValue({
      success: true,
      data: mockAsset,
    });

    (AssetService as any).mockImplementation(() => ({
      uploadAsset: mockUploadAsset,
    }));

    const { result } = renderHook(() => useAssetActions());

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const metadata = {
      kind: 'image',
      published_by: 'user-1',
    };

    let uploadedAsset;
    await act(async () => {
      uploadedAsset = await result.current.uploadAsset(file, metadata);
    });

    expect(uploadedAsset).toEqual(mockAsset);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should generate variants successfully', async () => {
    const mockAsset = {
      id: 'asset-1',
      kind: 'image',
      storage_key: 'images/asset-1.jpg',
      width: 1920,
      height: 1080,
      duration_ms: null,
      published_at: '2024-01-01T00:00:00Z',
      published_by: 'user-1',
    };

    const mockGenerateVariants = vi.fn().mockResolvedValue({
      success: true,
      data: mockAsset,
    });

    (AssetService as any).mockImplementation(() => ({
      generateVariants: mockGenerateVariants,
    }));

    const { result } = renderHook(() => useAssetActions());

    let generatedAsset;
    await act(async () => {
      generatedAsset = await result.current.generateVariants('asset-1', ['thumbnail', 'medium']);
    });

    expect(generatedAsset).toEqual(mockAsset);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should get asset URL', () => {
    const mockGetAssetUrl = vi.fn().mockReturnValue('https://example.com/asset-1.jpg');

    (AssetService as any).mockImplementation(() => ({
      getAssetUrl: mockGetAssetUrl,
    }));

    const { result } = renderHook(() => useAssetActions());

    const asset = {
      id: 'asset-1',
      kind: 'image',
      storage_key: 'images/asset-1.jpg',
      width: 1920,
      height: 1080,
      duration_ms: null,
      published_at: '2024-01-01T00:00:00Z',
      published_by: 'user-1',
    };

    const url = result.current.getAssetUrl(asset);

    expect(url).toBe('https://example.com/asset-1.jpg');
  });

  it('should get asset thumbnail', () => {
    const mockGetAssetThumbnail = vi.fn().mockReturnValue('https://example.com/asset-1-thumb.jpg');

    (AssetService as any).mockImplementation(() => ({
      getAssetThumbnail: mockGetAssetThumbnail,
    }));

    const { result } = renderHook(() => useAssetActions());

    const asset = {
      id: 'asset-1',
      kind: 'image',
      storage_key: 'images/asset-1.jpg',
      width: 1920,
      height: 1080,
      duration_ms: null,
      published_at: '2024-01-01T00:00:00Z',
      published_by: 'user-1',
    };

    const url = result.current.getAssetThumbnail(asset, 150);

    expect(url).toBe('https://example.com/asset-1-thumb.jpg');
  });
});
