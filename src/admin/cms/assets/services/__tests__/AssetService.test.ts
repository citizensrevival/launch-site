import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AssetService } from '../AssetService';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../../../../core/types/database.types';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
  storage: {
    from: vi.fn(),
    upload: vi.fn(),
    download: vi.fn(),
    remove: vi.fn(),
    getPublicUrl: vi.fn(),
  },
} as unknown as SupabaseClient<Database>;

// Mock the BaseService success method
const mockSuccess = vi.fn();
const mockHandleError = vi.fn();

describe('AssetService', () => {
  let assetService: AssetService;

  beforeEach(() => {
    vi.clearAllMocks();
    assetService = new AssetService(mockSupabase);
  });

  describe('listAssets', () => {
    it('should list assets with default parameters', async () => {
      const mockAssets = [
        {
          id: 'asset-1',
          kind: 'image',
          storage_key: 'images/asset-1.jpg',
          width: 1920,
          height: 1080,
          duration_ms: null,
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
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        single: vi.fn(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.select.mockReturnValue(mockQuery);
      mockQuery.order.mockReturnValue(mockQuery);
      mockQuery.range.mockReturnValue(mockQuery);
      mockQuery.eq.mockReturnValue(mockQuery);
      mockQuery.gte.mockReturnValue(mockQuery);
      mockQuery.lte.mockReturnValue(mockQuery);
      mockQuery.or.mockReturnValue(mockQuery);
      mockQuery.insert.mockReturnValue(mockQuery);
      mockQuery.update.mockReturnValue(mockQuery);
      mockQuery.delete.mockReturnValue(mockQuery);
      mockQuery.single.mockResolvedValue({ data: mockAssets[0], error: null });
      
      // Mock the final query execution
      mockQuery.select.mockResolvedValue({ data: mockAssets, error: null, count: 1 });

      const result = await assetService.listAssets();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.assets).toEqual(mockAssets);
        expect(result.data.totalCount).toBe(1);
        expect(result.data.hasMore).toBe(false);
      }
    });

    it('should handle errors when listing assets', async () => {
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
      
      // Mock the handleError method to return the expected result
      mockHandleError.mockReturnValue({
        success: false,
        error: 'Database error',
      });

      const result = await assetService.listAssets();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Database error');
      }
    });
  });

  describe('getAsset', () => {
    it('should get a single asset by ID', async () => {
      const mockAsset = {
        id: 'asset-1',
        kind: 'image',
        storage_key: 'images/asset-1.jpg',
        width: 1920,
        height: 1080,
        duration_ms: null,
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
      mockQuery.single.mockResolvedValue({ data: mockAsset, error: null });
      
      // Mock the success method to return the expected result
      mockSuccess.mockReturnValue({
        success: true,
        data: mockAsset,
      });

      const result = await assetService.getAsset('asset-1');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockAsset);
      }
    });

    it('should handle errors when getting asset', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.single.mockResolvedValue({ data: null, error: { message: 'Asset not found' } });
      
      // Mock the handleError method to return the expected result
      mockHandleError.mockReturnValue({
        success: false,
        error: 'Asset not found',
      });

      const result = await assetService.getAsset('asset-1');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Asset not found');
      }
    });
  });

  describe('createAsset', () => {
    it('should create a new asset', async () => {
      const mockAsset = {
        id: 'asset-1',
        kind: 'image',
        storage_key: 'images/asset-1.jpg',
        width: 1920,
        height: 1080,
        duration_ms: null,
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
      mockQuery.single.mockResolvedValue({ data: mockAsset, error: null });
      
      // Mock the success method to return the expected result
      mockSuccess.mockReturnValue({
        success: true,
        data: mockAsset,
      });

      const input = {
        kind: 'image',
        storage_key: 'images/asset-1.jpg',
        width: 1920,
        height: 1080,
        published_by: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = await assetService.createAsset(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockAsset);
      }
    });

    it('should handle errors when creating asset', async () => {
      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.single.mockResolvedValue({ data: null, error: { message: 'Insert failed' } });
      
      // Mock the handleError method to return the expected result
      mockHandleError.mockReturnValue({
        success: false,
        error: 'Insert failed',
      });

      const input = {
        kind: 'image',
        storage_key: 'images/asset-1.jpg',
        published_by: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = await assetService.createAsset(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Insert failed');
      }
    });
  });

  describe('updateAsset', () => {
    it('should update an existing asset', async () => {
      const mockAsset = {
        id: 'asset-1',
        kind: 'image',
        storage_key: 'images/asset-1.jpg',
        width: 1920,
        height: 1080,
        duration_ms: null,
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
      mockQuery.single.mockResolvedValue({ data: mockAsset, error: null });
      
      // Mock the success method to return the expected result
      mockSuccess.mockReturnValue({
        success: true,
        data: mockAsset,
      });

      const updates = {
        width: 1920,
        height: 1080,
      };

      const result = await assetService.updateAsset('asset-1', updates);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockAsset);
      }
    });

    it('should handle errors when updating asset', async () => {
      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.single.mockResolvedValue({ data: null, error: { message: 'Update failed' } });
      
      // Mock the handleError method to return the expected result
      mockHandleError.mockReturnValue({
        success: false,
        error: 'Update failed',
      });

      const updates = {
        width: 1920,
        height: 1080,
      };

      const result = await assetService.updateAsset('asset-1', updates);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Update failed');
      }
    });
  });

  describe('deleteAsset', () => {
    it('should delete an asset', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.delete.mockResolvedValue({ error: null });
      
      // Mock the success method to return the expected result
      mockSuccess.mockReturnValue({
        success: true,
        data: { id: 'asset-1' },
      });

      const result = await assetService.deleteAsset('asset-1');

      expect(result.success).toBe(true);
    });

    it('should handle errors when deleting asset', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.delete.mockResolvedValue({ error: { message: 'Delete failed' } });
      
      // Mock the handleError method to return the expected result
      mockHandleError.mockReturnValue({
        success: false,
        error: 'Delete failed',
      });

      const result = await assetService.deleteAsset('asset-1');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Delete failed');
      }
    });
  });

  describe('uploadAsset', () => {
    it('should upload a file and create asset record', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockAsset = {
        id: 'asset-1',
        kind: 'image',
        storage_key: 'assets/1234567890-test.jpg',
        width: 1920,
        height: 1080,
        duration_ms: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        created_by: 'user-1',
        updated_by: 'user-1',
      };

      const mockStorageQuery = {
        upload: vi.fn(),
      };

      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn(),
      };

      (mockSupabase.storage.from as any).mockReturnValue(mockStorageQuery);
      mockStorageQuery.upload.mockResolvedValue({ data: { path: 'assets/1234567890-test.jpg' }, error: null });

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.single.mockResolvedValue({ data: mockAsset, error: null });

      const metadata = {
        kind: 'image',
        published_by: '550e8400-e29b-41d4-a716-446655440000',
      };
      
      // Mock the success method to return the expected result
      mockSuccess.mockReturnValue({
        success: true,
        data: mockAsset,
      });

      const result = await assetService.uploadAsset(mockFile, metadata);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockAsset);
      }
    });

    it('should handle errors when uploading asset', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      const mockStorageQuery = {
        upload: vi.fn(),
      };

      (mockSupabase.storage.from as any).mockReturnValue(mockStorageQuery);
      mockStorageQuery.upload.mockResolvedValue({ data: null, error: { message: 'Upload failed' } });
      
      // Mock the handleError method to return the expected result
      mockHandleError.mockReturnValue({
        success: false,
        error: 'Upload failed',
      });

      const metadata = {
        kind: 'image',
        published_by: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = await assetService.uploadAsset(mockFile, metadata);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Upload failed');
      }
    });
  });

  describe('generateVariants', () => {
    it('should generate variants for an asset', async () => {
      const mockAsset = {
        id: 'asset-1',
        kind: 'image',
        storage_key: 'images/asset-1.jpg',
        width: 1920,
        height: 1080,
        duration_ms: null,
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
      mockQuery.single.mockResolvedValue({ data: mockAsset, error: null });
      
      // Mock the success method to return the expected result
      mockSuccess.mockReturnValue({
        success: true,
        data: mockAsset,
      });

      const result = await assetService.generateVariants('asset-1', ['thumbnail', 'medium']);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockAsset);
      }
    });

    it('should handle errors when generating variants', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.single.mockResolvedValue({ data: null, error: { message: 'Asset not found' } });
      
      // Mock the handleError method to return the expected result
      mockHandleError.mockReturnValue({
        success: false,
        error: 'Asset not found',
      });

      const result = await assetService.generateVariants('asset-1', ['thumbnail', 'medium']);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Asset not found');
      }
    });
  });

  describe('getAssetUrl', () => {
    it('should return asset URL', () => {
      const asset = {
        id: 'asset-1',
        kind: 'image',
        storage_key: 'images/asset-1.jpg',
        width: 1920,
        height: 1080,
        duration_ms: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        created_by: 'user-1',
        updated_by: 'user-1',
      };

      const mockStorageQuery = {
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/asset-1.jpg' } }),
      };

      (mockSupabase.storage.from as any).mockReturnValue(mockStorageQuery);

      const url = assetService.getAssetUrl(asset);

      expect(url).toBe('https://example.com/asset-1.jpg');
    });
  });

  describe('getAssetThumbnail', () => {
    it('should return thumbnail URL', () => {
      const asset = {
        id: 'asset-1',
        kind: 'image',
        storage_key: 'images/asset-1.jpg',
        width: 1920,
        height: 1080,
        duration_ms: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        created_by: 'user-1',
        updated_by: 'user-1',
      };

      const mockStorageQuery = {
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/asset-1-thumb.jpg' } }),
      };

      (mockSupabase.storage.from as any).mockReturnValue(mockStorageQuery);

      const url = assetService.getAssetThumbnail(asset, 150);

      expect(url).toBe('https://example.com/asset-1-thumb.jpg');
    });
  });
});
