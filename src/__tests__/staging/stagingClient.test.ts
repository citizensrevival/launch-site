// Unit tests for staging client functions
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  createStaging,
  stageEntity,
  stageSite,
  publishStagedContent,
  rollbackStaging,
  getStagingDependencies,
  getSiteStagingSessions,
  getStagingSession,
  deleteStagingSession,
  getStagedContentPreview
} from '../../lib/cms/stagingClient';
import { SupabaseClient } from '../../lib/cms/interfaces/SupabaseClient';

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getUser: vi.fn()
  },
  from: vi.fn(),
  rpc: vi.fn()
};

// Mock the supabase module
vi.mock('../../lib/supabase', () => ({
  supabase: mockSupabaseClient
}));

describe('Staging Client Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createStaging', () => {
    it('should create a new staging session successfully', async () => {
      const mockUser = { id: 'user-123' };
      const mockStaging = {
        id: 'staging-123',
        site_id: 'site-123',
        name: 'Test Staging',
        description: 'Test description',
        created_at: '2024-01-01T00:00:00Z',
        created_by: 'user-123',
        staged_at: '2024-01-01T00:00:00Z',
        staged_by: 'user-123'
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockSupabaseClient.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockStaging, error: null })
          })
        })
      });

      const result = await createStaging({
        siteId: 'site-123',
        name: 'Test Staging',
        description: 'Test description'
      });

      expect(result.data).toEqual(mockStaging);
      expect(result.error).toBeNull();
    });

    it('should handle authentication error', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: null } });

      const result = await createStaging({
        siteId: 'site-123',
        name: 'Test Staging'
      });

      expect(result.data).toBeNull();
      expect(result.error).toBe('User not authenticated');
    });

    it('should handle database error', async () => {
      const mockUser = { id: 'user-123' };
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockSupabaseClient.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } })
          })
        })
      });

      const result = await createStaging({
        siteId: 'site-123',
        name: 'Test Staging'
      });

      expect(result.data).toBeNull();
      expect(result.error).toBe('Database error');
    });
  });

  describe('stageEntity', () => {
    it('should stage an entity successfully', async () => {
      mockSupabaseClient.rpc.mockResolvedValue({ data: true, error: null });

      const result = await stageEntity({
        entityType: 'page',
        entityId: 'page-123',
        version: 1,
        stagingId: 'staging-123'
      });

      expect(result.data).toBe(true);
      expect(result.error).toBeNull();
      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('stage_entity', {
        entity_type: 'page',
        entity_id: 'page-123',
        version_number: 1,
        staging_id: 'staging-123'
      });
    });

    it('should handle RPC error', async () => {
      mockSupabaseClient.rpc.mockResolvedValue({ data: null, error: { message: 'RPC error' } });

      const result = await stageEntity({
        entityType: 'block',
        entityId: 'block-123',
        version: 2,
        stagingId: 'staging-123'
      });

      expect(result.data).toBe(false);
      expect(result.error).toBe('RPC error');
    });
  });

  describe('stageSite', () => {
    it('should stage entire site successfully', async () => {
      const mockStaging = {
        id: 'staging-123',
        site_id: 'site-123',
        name: 'Site Staging',
        created_at: '2024-01-01T00:00:00Z',
        created_by: 'user-123',
        staged_at: '2024-01-01T00:00:00Z',
        staged_by: 'user-123'
      };

      mockSupabaseClient.rpc.mockResolvedValue({ data: 'staging-123', error: null });
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockStaging, error: null })
          })
        })
      });

      const result = await stageSite({
        siteId: 'site-123',
        name: 'Site Staging',
        description: 'Site-wide staging'
      });

      expect(result.data).toEqual(mockStaging);
      expect(result.error).toBeNull();
    });
  });

  describe('publishStagedContent', () => {
    it('should publish staged content successfully', async () => {
      mockSupabaseClient.rpc.mockResolvedValue({ data: true, error: null });

      const result = await publishStagedContent('staging-123');

      expect(result.data).toBe(true);
      expect(result.error).toBeNull();
      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('publish_staged_content', {
        staging_id_param: 'staging-123'
      });
    });
  });

  describe('rollbackStaging', () => {
    it('should rollback staging successfully', async () => {
      mockSupabaseClient.rpc.mockResolvedValue({ data: true, error: null });

      const result = await rollbackStaging('staging-123');

      expect(result.data).toBe(true);
      expect(result.error).toBeNull();
      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('rollback_staging', {
        staging_id_param: 'staging-123'
      });
    });
  });

  describe('getStagingDependencies', () => {
    it('should get staging dependencies successfully', async () => {
      const mockDependencies = [
        {
          id: 'dep-1',
          staging_id: 'staging-123',
          entity_type: 'page',
          entity_id: 'page-123',
          version: 1,
          dependency_type: 'direct',
          created_at: '2024-01-01T00:00:00Z'
        }
      ];

      mockSupabaseClient.rpc.mockResolvedValue({ data: mockDependencies, error: null });

      const result = await getStagingDependencies('staging-123');

      expect(result.data).toEqual(mockDependencies);
      expect(result.error).toBeNull();
    });
  });

  describe('getSiteStagingSessions', () => {
    it('should get site staging sessions successfully', async () => {
      const mockSessions = [
        {
          id: 'staging-1',
          site_id: 'site-123',
          name: 'Session 1',
          created_at: '2024-01-01T00:00:00Z'
        }
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockSessions, error: null })
          })
        })
      });

      const result = await getSiteStagingSessions('site-123');

      expect(result.data).toEqual(mockSessions);
      expect(result.error).toBeNull();
    });
  });

  describe('getStagingSession', () => {
    it('should get staging session successfully', async () => {
      const mockSession = {
        id: 'staging-123',
        site_id: 'site-123',
        name: 'Test Session',
        created_at: '2024-01-01T00:00:00Z'
      };

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockSession, error: null })
          })
        })
      });

      const result = await getStagingSession('staging-123');

      expect(result.data).toEqual(mockSession);
      expect(result.error).toBeNull();
    });
  });

  describe('deleteStagingSession', () => {
    it('should delete staging session successfully', async () => {
      mockSupabaseClient.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null })
        })
      });

      const result = await deleteStagingSession('staging-123');

      expect(result.data).toBe(true);
      expect(result.error).toBeNull();
    });
  });

  describe('getStagedContentPreview', () => {
    it('should get staged content preview successfully', async () => {
      const mockPreview = {
        pages: [{ id: 'page-1', slug: 'test-page', title: { 'en-US': 'Test Page' } }],
        blocks: [{ id: 'block-1', type: 'hero', tag: 'main' }],
        menus: [{ id: 'menu-1', handle: 'main', label: 'Main Menu' }],
        assets: [{ id: 'asset-1', kind: 'image', storage_key: 'test.jpg' }]
      };

      // Mock the complex query structure
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({ data: [], error: null })
          })
        })
      });

      mockSupabaseClient.from.mockImplementation(mockFrom);

      const result = await getStagedContentPreview('staging-123');

      expect(result.data).toEqual(mockPreview);
      expect(result.error).toBeNull();
    });
  });
});
