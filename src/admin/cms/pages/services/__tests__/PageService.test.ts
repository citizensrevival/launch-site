import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PageService } from '../PageService';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../../../../core/types/database.types';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
} as unknown as SupabaseClient<Database>;

describe('PageService', () => {
  let pageService: PageService;

  beforeEach(() => {
    vi.clearAllMocks();
    pageService = new PageService(mockSupabase);
  });

  describe('listPages', () => {
    it('should list pages with default parameters', async () => {
      const mockPages = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          site_id: '550e8400-e29b-41d4-a716-446655440001',
          slug: 'home',
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
      mockQuery.select.mockResolvedValue({ data: mockPages, error: null, count: 1 });

      const result = await pageService.listPages();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.pages).toEqual(mockPages);
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
        slug: 'home',
        created_by: '550e8400-e29b-41d4-a716-446655440002',
        search: 'about',
      };
      const sort = { field: 'slug', direction: 'asc' } as const;

      await pageService.listPages(filters, sort);

      expect(mockQuery.eq).toHaveBeenCalledWith('slug', 'home');
      expect(mockQuery.eq).toHaveBeenCalledWith('created_by', '550e8400-e29b-41d4-a716-446655440002');
      expect(mockQuery.or).toHaveBeenCalledWith('slug.ilike.%about%');
      expect(mockQuery.order).toHaveBeenCalledWith('slug', { ascending: true });
    });

    it('should handle errors when listing pages', async () => {
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

      const result = await pageService.listPages();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Database error');
      }
    });
  });

  describe('getPage', () => {
    it('should get a single page by ID', async () => {
      const mockPage = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        site_id: '550e8400-e29b-41d4-a716-446655440001',
        slug: 'home',
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
      mockQuery.single.mockResolvedValue({ data: mockPage, error: null });

      const result = await pageService.getPage('550e8400-e29b-41d4-a716-446655440000');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockPage);
      }
    });

    it('should handle errors when getting page', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.single.mockResolvedValue({ data: null, error: { message: 'Page not found' } });

      const result = await pageService.getPage('550e8400-e29b-41d4-a716-446655440000');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Page not found');
      }
    });
  });

  describe('createPage', () => {
    it('should create a new page', async () => {
      const mockPage = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        site_id: '550e8400-e29b-41d4-a716-446655440001',
        slug: 'about',
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
      mockQuery.single.mockResolvedValue({ data: mockPage, error: null });

      const input = {
        site_id: '550e8400-e29b-41d4-a716-446655440001',
        slug: 'about',
        created_by: '550e8400-e29b-41d4-a716-446655440002',
      };

      const result = await pageService.createPage(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockPage);
      }
    });

    it('should handle errors when creating page', async () => {
      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.single.mockResolvedValue({ data: null, error: { message: 'Insert failed' } });

      const input = {
        site_id: '550e8400-e29b-41d4-a716-446655440001',
        slug: 'about',
        created_by: '550e8400-e29b-41d4-a716-446655440002',
      };

      const result = await pageService.createPage(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Insert failed');
      }
    });
  });

  describe('updatePage', () => {
    it('should update an existing page', async () => {
      const mockPage = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        site_id: '550e8400-e29b-41d4-a716-446655440001',
        slug: 'updated-about',
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
      mockQuery.single.mockResolvedValue({ data: mockPage, error: null });

      const updates = {
        slug: 'updated-about',
      };

      const result = await pageService.updatePage('550e8400-e29b-41d4-a716-446655440000', updates);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockPage);
      }
    });

    it('should handle errors when updating page', async () => {
      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.single.mockResolvedValue({ data: null, error: { message: 'Update failed' } });

      const updates = {
        slug: 'updated-about',
      };

      const result = await pageService.updatePage('550e8400-e29b-41d4-a716-446655440000', updates);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Update failed');
      }
    });
  });

  describe('deletePage', () => {
    it('should delete a page', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.delete.mockReturnValue(mockQuery);
      mockQuery.eq.mockReturnValue(mockQuery);
      mockQuery.delete.mockResolvedValue({ error: null });

      const result = await pageService.deletePage('550e8400-e29b-41d4-a716-446655440000');

      expect(result.success).toBe(true);
    });

    it('should handle errors when deleting page', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.delete.mockReturnValue(mockQuery);
      mockQuery.eq.mockReturnValue(mockQuery);
      mockQuery.delete.mockResolvedValue({ error: { message: 'Delete failed' } });

      const result = await pageService.deletePage('550e8400-e29b-41d4-a716-446655440000');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Delete failed');
      }
    });
  });

  describe('publishPage', () => {
    it('should publish a page', async () => {
      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.insert.mockResolvedValue({ error: null });

      const result = await pageService.publishPage(
        '550e8400-e29b-41d4-a716-446655440000',
        'en-US',
        1,
        '550e8400-e29b-41d4-a716-446655440002'
      );

      expect(result.success).toBe(true);
    });

    it('should handle errors when publishing page', async () => {
      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.insert.mockResolvedValue({ error: { message: 'Publish failed' } });

      const result = await pageService.publishPage(
        '550e8400-e29b-41d4-a716-446655440000',
        'en-US',
        1,
        '550e8400-e29b-41d4-a716-446655440002'
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Publish failed');
      }
    });
  });
});
