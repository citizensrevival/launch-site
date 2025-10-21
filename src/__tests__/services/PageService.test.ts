// Example test file showing how to test the PageService with dependency injection
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PageService } from '../../lib/cms/services/PageService';
import { createMockSupabaseClient } from '../../lib/cms/interfaces/SupabaseClient';
import type { SupabaseClient } from '../../lib/cms/interfaces/SupabaseClient';

describe('PageService', () => {
  let mockClient: SupabaseClient;
  let pageService: PageService;

  beforeEach(() => {
    mockClient = createMockSupabaseClient();
    pageService = new PageService(mockClient);
  });

  describe('createPage', () => {
    it('should create a page successfully', async () => {
      // Arrange
      const pageData = {
        site_id: 'test-site-id',
        slug: 'test-page',
        is_system: false,
        system_key: null
      };

      const mockResponse = {
        id: 'test-page-id',
        ...pageData
      };

      (mockClient.from as vi.Mock).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockResponse, error: null })
      });

      // Act
      const result = await pageService.createPage(pageData);

      // Assert
      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockResponse);
      expect(mockClient.from).toHaveBeenCalledWith('page');
    });

    it('should handle authentication errors', async () => {
      // Arrange
      (mockClient.auth.getUser as vi.Mock).mockResolvedValue({ 
        data: { user: null } 
      });

      const pageData = {
        site_id: 'test-site-id',
        slug: 'test-page',
        is_system: false,
        system_key: null
      };

      // Act
      const result = await pageService.createPage(pageData);

      // Assert
      expect(result.data).toBeNull();
      expect(result.error).toBe('User not authenticated');
    });

    it('should handle database errors', async () => {
      // Arrange
      const pageData = {
        site_id: 'test-site-id',
        slug: 'test-page',
        is_system: false,
        system_key: null
      };

      (mockClient.from as vi.Mock).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Database error' } 
        })
      });

      // Act
      const result = await pageService.createPage(pageData);

      // Assert
      expect(result.data).toBeNull();
      expect(result.error).toBe('Database error');
    });

    it('should handle system_key null values correctly', async () => {
      // Arrange
      const pageData = {
        site_id: 'test-site-id',
        slug: 'test-page',
        is_system: false,
        system_key: undefined // This should be converted to null
      };

      const mockResponse = {
        id: 'test-page-id',
        site_id: 'test-site-id',
        slug: 'test-page',
        is_system: false,
        system_key: null
      };

      (mockClient.from as vi.Mock).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockResponse, error: null })
      });

      // Act
      const result = await pageService.createPage(pageData);

      // Assert
      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockResponse);
    });
  });

  describe('createPageVersion', () => {
    it('should create a page version successfully', async () => {
      // Arrange
      const versionData = {
        page_id: 'test-page-id',
        version: 1,
        title: { 'en-US': 'Test Page' },
        layout_variant: null,
        seo: { 'en-US': { title: 'Test SEO' } },
        nav_hints: {
          label: { 'en-US': 'Test Label' },
          badge: { 'en-US': 'Test Badge' },
          order: 1,
          hidden: false
        },
        slots: []
      };

      const mockResponse = {
        id: 'test-version-id',
        created_at: '2023-01-01T00:00:00Z',
        created_by: 'test-user-id',
        ...versionData
      };

      (mockClient.from as vi.Mock).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockResponse, error: null })
      });

      // Act
      const result = await pageService.createPageVersion(versionData);

      // Assert
      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockResponse);
    });

    it('should filter out null values for optional fields', async () => {
      // Arrange
      const versionData = {
        page_id: 'test-page-id',
        version: 1,
        title: { 'en-US': 'Test Page' },
        layout_variant: null, // This should be filtered out
        seo: { 'en-US': { title: 'Test SEO' } },
        nav_hints: {
          label: { 'en-US': 'Test Label' },
          badge: { 'en-US': 'Test Badge' },
          order: 1,
          hidden: false
        },
        slots: []
      };

      const mockResponse = {
        id: 'test-version-id',
        created_at: '2023-01-01T00:00:00Z',
        created_by: 'test-user-id',
        ...versionData
      };

      const insertSpy = vi.fn().mockReturnThis();
      (mockClient.from as vi.Mock).mockReturnValue({
        insert: insertSpy,
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockResponse, error: null })
      });

      // Act
      await pageService.createPageVersion(versionData);

      // Assert
      expect(insertSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          page_id: 'test-page-id',
          version: 1,
          created_by: 'test-user-id',
          updated_by: null,
          updated_at: null
          // layout_variant should be filtered out
        })
      );
    });
  });

  describe('getPages', () => {
    it('should retrieve pages for a site', async () => {
      // Arrange
      const siteId = 'test-site-id';
      const mockPages = [
        {
          id: 'page-1',
          site_id: siteId,
          slug: 'page-1',
          is_system: false,
          system_key: null
        },
        {
          id: 'page-2',
          site_id: siteId,
          slug: 'page-2',
          is_system: true,
          system_key: 'home'
        }
      ];

      (mockClient.from as vi.Mock).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: mockPages, error: null })
      });

      // Act
      const result = await pageService.getPages(siteId);

      // Assert
      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(2);
      expect(result.data[0].slug).toBe('page-1');
      expect(result.data[1].system_key).toBe('home');
    });
  });
});
