// Unit tests for staging hooks
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useStagingSessions,
  useStagingSession,
  useSiteStaging,
  useStagingManagement
} from '../../lib/cms/stagingHooks';
import * as stagingClient from '../../lib/cms/stagingClient';

// Mock the staging client
vi.mock('../../lib/cms/stagingClient', () => ({
  getSiteStagingSessions: vi.fn(),
  getStagingSession: vi.fn(),
  getStagingDependencies: vi.fn(),
  getStagedContentPreview: vi.fn(),
  createStaging: vi.fn(),
  stageEntity: vi.fn(),
  stageSite: vi.fn(),
  publishStagedContent: vi.fn(),
  rollbackStaging: vi.fn(),
  deleteStagingSession: vi.fn()
}));

describe('Staging Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useStagingSessions', () => {
    it('should fetch staging sessions on mount', async () => {
      const mockSessions = [
        {
          id: 'staging-1',
          site_id: 'site-123',
          name: 'Session 1',
          created_at: '2024-01-01T00:00:00Z'
        }
      ];

      vi.mocked(stagingClient.getSiteStagingSessions).mockResolvedValue({
        data: mockSessions,
        error: null
      });

      const { result } = renderHook(() => useStagingSessions('site-123'));

      expect(result.current.sessions).toEqual(mockSessions);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle error when fetching sessions', async () => {
      vi.mocked(stagingClient.getSiteStagingSessions).mockResolvedValue({
        data: [],
        error: 'Failed to fetch sessions'
      });

      const { result } = renderHook(() => useStagingSessions('site-123'));

      expect(result.current.sessions).toEqual([]);
      expect(result.current.error).toBe('Failed to fetch sessions');
    });

    it('should create new staging session', async () => {
      const mockStaging = {
        id: 'staging-123',
        site_id: 'site-123',
        name: 'New Session',
        created_at: '2024-01-01T00:00:00Z'
      };

      vi.mocked(stagingClient.getSiteStagingSessions).mockResolvedValue({
        data: [],
        error: null
      });

      vi.mocked(stagingClient.createStaging).mockResolvedValue({
        data: mockStaging,
        error: null
      });

      const { result } = renderHook(() => useStagingSessions('site-123'));

      await act(async () => {
        await result.current.createNewStaging('New Session', 'Description');
      });

      expect(stagingClient.createStaging).toHaveBeenCalledWith({
        siteId: 'site-123',
        name: 'New Session',
        description: 'Description'
      });
    });

    it('should delete staging session', async () => {
      vi.mocked(stagingClient.getSiteStagingSessions).mockResolvedValue({
        data: [],
        error: null
      });

      vi.mocked(stagingClient.deleteStagingSession).mockResolvedValue({
        data: true,
        error: null
      });

      const { result } = renderHook(() => useStagingSessions('site-123'));

      await act(async () => {
        await result.current.deleteSession('staging-123');
      });

      expect(stagingClient.deleteStagingSession).toHaveBeenCalledWith('staging-123');
    });
  });

  describe('useStagingSession', () => {
    it('should fetch staging session data', async () => {
      const mockSession = {
        id: 'staging-123',
        site_id: 'site-123',
        name: 'Test Session',
        created_at: '2024-01-01T00:00:00Z'
      };

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

      const mockPreview = {
        pages: [{ id: 'page-1', slug: 'test', title: { 'en-US': 'Test' } }],
        blocks: [],
        menus: [],
        assets: []
      };

      vi.mocked(stagingClient.getStagingSession).mockResolvedValue({
        data: mockSession,
        error: null
      });

      vi.mocked(stagingClient.getStagingDependencies).mockResolvedValue({
        data: mockDependencies,
        error: null
      });

      vi.mocked(stagingClient.getStagedContentPreview).mockResolvedValue({
        data: mockPreview,
        error: null
      });

      const { result } = renderHook(() => useStagingSession('staging-123'));

      expect(result.current.session).toEqual(mockSession);
      expect(result.current.dependencies).toEqual(mockDependencies);
      expect(result.current.preview).toEqual(mockPreview);
    });

    it('should stage entity to session', async () => {
      vi.mocked(stagingClient.getStagingSession).mockResolvedValue({
        data: { id: 'staging-123' },
        error: null
      });

      vi.mocked(stagingClient.getStagingDependencies).mockResolvedValue({
        data: [],
        error: null
      });

      vi.mocked(stagingClient.getStagedContentPreview).mockResolvedValue({
        data: null,
        error: null
      });

      vi.mocked(stagingClient.stageEntity).mockResolvedValue({
        data: true,
        error: null
      });

      const { result } = renderHook(() => useStagingSession('staging-123'));

      await act(async () => {
        await result.current.stageEntity('page', 'page-123', 1);
      });

      expect(stagingClient.stageEntity).toHaveBeenCalledWith({
        entityType: 'page',
        entityId: 'page-123',
        version: 1,
        stagingId: 'staging-123'
      });
    });

    it('should publish staged content', async () => {
      vi.mocked(stagingClient.getStagingSession).mockResolvedValue({
        data: { id: 'staging-123' },
        error: null
      });

      vi.mocked(stagingClient.getStagingDependencies).mockResolvedValue({
        data: [],
        error: null
      });

      vi.mocked(stagingClient.getStagedContentPreview).mockResolvedValue({
        data: null,
        error: null
      });

      vi.mocked(stagingClient.publishStagedContent).mockResolvedValue({
        data: true,
        error: null
      });

      const { result } = renderHook(() => useStagingSession('staging-123'));

      await act(async () => {
        await result.current.publishStaged();
      });

      expect(stagingClient.publishStagedContent).toHaveBeenCalledWith('staging-123');
    });

    it('should rollback staged content', async () => {
      vi.mocked(stagingClient.getStagingSession).mockResolvedValue({
        data: { id: 'staging-123' },
        error: null
      });

      vi.mocked(stagingClient.getStagingDependencies).mockResolvedValue({
        data: [],
        error: null
      });

      vi.mocked(stagingClient.getStagedContentPreview).mockResolvedValue({
        data: null,
        error: null
      });

      vi.mocked(stagingClient.rollbackStaging).mockResolvedValue({
        data: true,
        error: null
      });

      const { result } = renderHook(() => useStagingSession('staging-123'));

      await act(async () => {
        await result.current.rollbackStaged();
      });

      expect(stagingClient.rollbackStaging).toHaveBeenCalledWith('staging-123');
    });
  });

  describe('useSiteStaging', () => {
    it('should stage entire site', async () => {
      const mockStaging = {
        id: 'staging-123',
        site_id: 'site-123',
        name: 'Site Staging',
        created_at: '2024-01-01T00:00:00Z'
      };

      vi.mocked(stagingClient.stageSite).mockResolvedValue({
        data: mockStaging,
        error: null
      });

      const { result } = renderHook(() => useSiteStaging('site-123'));

      await act(async () => {
        await result.current.stageEntireSite('Site Staging', 'Description');
      });

      expect(stagingClient.stageSite).toHaveBeenCalledWith({
        siteId: 'site-123',
        name: 'Site Staging',
        description: 'Description'
      });

      expect(result.current.result).toEqual({
        success: true,
        staging_id: 'staging-123',
        staged_entities: 0
      });
    });

    it('should handle error when staging site', async () => {
      vi.mocked(stagingClient.stageSite).mockResolvedValue({
        data: null,
        error: 'Failed to stage site'
      });

      const { result } = renderHook(() => useSiteStaging('site-123'));

      await act(async () => {
        await result.current.stageEntireSite('Site Staging');
      });

      expect(result.current.error).toBe('Failed to stage site');
      expect(result.current.result).toBeNull();
    });
  });

  describe('useStagingManagement', () => {
    it('should create staging session', async () => {
      const mockStaging = {
        id: 'staging-123',
        site_id: 'site-123',
        name: 'New Session',
        created_at: '2024-01-01T00:00:00Z'
      };

      vi.mocked(stagingClient.createStaging).mockResolvedValue({
        data: mockStaging,
        error: null
      });

      const { result } = renderHook(() => useStagingManagement('site-123'));

      await act(async () => {
        await result.current.createStagingSession('New Session', 'Description');
      });

      expect(stagingClient.createStaging).toHaveBeenCalledWith({
        siteId: 'site-123',
        name: 'New Session',
        description: 'Description'
      });

      expect(result.current.activeStaging).toBe('staging-123');
    });

    it('should stage entity', async () => {
      vi.mocked(stagingClient.createStaging).mockResolvedValue({
        data: { id: 'staging-123' },
        error: null
      });

      vi.mocked(stagingClient.stageEntity).mockResolvedValue({
        data: true,
        error: null
      });

      const { result } = renderHook(() => useStagingManagement('site-123'));

      // Set active staging first
      act(() => {
        result.current.setActiveStaging('staging-123');
      });

      await act(async () => {
        await result.current.stageEntity('page', 'page-123', 1);
      });

      expect(stagingClient.stageEntity).toHaveBeenCalledWith({
        entityType: 'page',
        entityId: 'page-123',
        version: 1,
        stagingId: 'staging-123'
      });
    });

    it('should handle error when no active staging', async () => {
      const { result } = renderHook(() => useStagingManagement('site-123'));

      await act(async () => {
        await result.current.stageEntity('page', 'page-123', 1);
      });

      expect(result.current.error).toBe('No active staging session');
    });

    it('should publish all staged content', async () => {
      vi.mocked(stagingClient.publishStagedContent).mockResolvedValue({
        data: true,
        error: null
      });

      const { result } = renderHook(() => useStagingManagement('site-123'));

      // Set active staging first
      act(() => {
        result.current.setActiveStaging('staging-123');
      });

      await act(async () => {
        await result.current.publishAllStaged();
      });

      expect(stagingClient.publishStagedContent).toHaveBeenCalledWith('staging-123');
      expect(result.current.activeStaging).toBeNull();
    });

    it('should rollback all staged content', async () => {
      vi.mocked(stagingClient.rollbackStaging).mockResolvedValue({
        data: true,
        error: null
      });

      const { result } = renderHook(() => useStagingManagement('site-123'));

      // Set active staging first
      act(() => {
        result.current.setActiveStaging('staging-123');
      });

      await act(async () => {
        await result.current.rollbackAllStaged();
      });

      expect(stagingClient.rollbackStaging).toHaveBeenCalledWith('staging-123');
      expect(result.current.activeStaging).toBeNull();
    });
  });
});
