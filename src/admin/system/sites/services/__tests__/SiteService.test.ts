import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SiteService } from '../SiteService';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../../../../core/types/database.types';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
} as unknown as SupabaseClient<Database>;

describe('SiteService', () => {
  let siteService: SiteService;

  beforeEach(() => {
    vi.clearAllMocks();
    siteService = new SiteService(mockSupabase);
  });

  describe('getSites', () => {
    it('should return sites with default parameters', async () => {
      const mockData = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Test Site',
          slug: 'test-site',
          settings: {},
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          created_by: '123e4567-e89b-12d3-a456-426614174001',
          updated_by: '123e4567-e89b-12d3-a456-426614174001',
        },
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
      };

      mockSupabase.from = vi.fn().mockReturnValue(mockQuery);
      mockQuery.select.mockResolvedValue({ data: mockData, error: null, count: 1 });

      const result = await siteService.getSites();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sites).toEqual(mockData);
        expect(result.data.total).toBe(1);
        expect(result.data.hasMore).toBe(false);
      }
    });

    it('should apply search filter', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
      };

      mockSupabase.from = vi.fn().mockReturnValue(mockQuery);
      mockQuery.select.mockResolvedValue({ data: [], error: null, count: 0 });

      await siteService.getSites({ search: 'test' });

      expect(mockQuery.or).toHaveBeenCalledWith('name.ilike.%test%,slug.ilike.%test%,description.ilike.%test%');
    });

    it('should handle database errors', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
      };

      mockSupabase.from = vi.fn().mockReturnValue(mockQuery);
      mockQuery.select.mockResolvedValue({ data: null, error: { message: 'Database error' }, count: 0 });

      const result = await siteService.getSites();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Database error');
      }
    });
  });

  describe('getSiteById', () => {
    it('should return site by ID', async () => {
      const mockSite = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Site',
        slug: 'test-site',
        settings: {},
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        created_by: '123e4567-e89b-12d3-a456-426614174001',
        updated_by: '123e4567-e89b-12d3-a456-426614174001',
      };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockSite, error: null }),
      };

      mockSupabase.from = vi.fn().mockReturnValue(mockQuery);

      const result = await siteService.getSiteById('123e4567-e89b-12d3-a456-426614174000');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockSite);
      }
    });

    it('should handle site not found', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      };

      mockSupabase.from = vi.fn().mockReturnValue(mockQuery);

      const result = await siteService.getSiteById('123e4567-e89b-12d3-a456-426614174000');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Site not found');
      }
    });
  });

  describe('createSite', () => {
    it('should create a new site', async () => {
      const mockSite = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'New Site',
        slug: 'new-site',
        settings: {},
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        created_by: '123e4567-e89b-12d3-a456-426614174001',
        updated_by: '123e4567-e89b-12d3-a456-426614174001',
      };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }), // Slug check passes
        insert: vi.fn().mockReturnThis(),
      };

      mockSupabase.from = vi.fn().mockReturnValue(mockQuery);
      mockQuery.insert.mockResolvedValue({ data: mockSite, error: null });

      const result = await siteService.createSite(
        { name: 'New Site', slug: 'new-site' },
        '123e4567-e89b-12d3-a456-426614174001'
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockSite);
      }
    });

    it('should handle duplicate slug', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'existing' }, error: null }), // Slug exists
      };

      mockSupabase.from = vi.fn().mockReturnValue(mockQuery);

      const result = await siteService.createSite(
        { name: 'New Site', slug: 'existing-slug' },
        '123e4567-e89b-12d3-a456-426614174001'
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Site with this slug already exists');
      }
    });
  });

  describe('updateSite', () => {
    it('should update a site', async () => {
      const mockUpdatedSite = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Updated Site',
        slug: 'updated-site',
        settings: {},
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        created_by: '123e4567-e89b-12d3-a456-426614174001',
        updated_by: '123e4567-e89b-12d3-a456-426614174001',
      };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }), // Slug check passes
        update: vi.fn().mockReturnThis(),
      };

      mockSupabase.from = vi.fn().mockReturnValue(mockQuery);
      mockQuery.update.mockResolvedValue({ data: mockUpdatedSite, error: null });

      const result = await siteService.updateSite(
        '123e4567-e89b-12d3-a456-426614174000',
        { name: 'Updated Site' },
        '123e4567-e89b-12d3-a456-426614174001'
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockUpdatedSite);
      }
    });
  });

  describe('deleteSite', () => {
    it('should delete a site', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };

      mockSupabase.from = vi.fn().mockReturnValue(mockQuery);
      mockQuery.delete.mockResolvedValue({ error: null });

      const result = await siteService.deleteSite('123e4567-e89b-12d3-a456-426614174000');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      }
    });
  });

  describe('isSlugAvailable', () => {
    it('should return true when slug is available', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      };

      mockSupabase.from = vi.fn().mockReturnValue(mockQuery);

      const result = await siteService.isSlugAvailable('available-slug');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.available).toBe(true);
      }
    });

    it('should return false when slug is taken', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'existing' }, error: null }),
      };

      mockSupabase.from = vi.fn().mockReturnValue(mockQuery);

      const result = await siteService.isSlugAvailable('taken-slug');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.available).toBe(false);
      }
    });
  });
});
