import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuditService } from '../AuditService';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../../../../core/types/database.types';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
} as unknown as SupabaseClient<Database>;

describe('AuditService', () => {
  let auditService: AuditService;

  beforeEach(() => {
    vi.clearAllMocks();
    auditService = new AuditService(mockSupabase);
  });

  describe('listAuditLogs', () => {
    it('should list audit logs with default parameters', async () => {
      const mockLogs = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          site_id: '550e8400-e29b-41d4-a716-446655440001',
          entity_type: 'page',
          entity_id: '550e8400-e29b-41d4-a716-446655440002',
          action: 'create',
          changes: { title: 'New Page' },
          metadata: { source: 'admin' },
          created_at: '2024-01-01T00:00:00Z',
          created_by: '550e8400-e29b-41d4-a716-446655440003',
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
      mockQuery.select.mockResolvedValue({ data: mockLogs, error: null, count: 1 });

      const result = await auditService.listAuditLogs();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.logs).toEqual(mockLogs);
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
        site_id: '550e8400-e29b-41d4-a716-446655440001',
        entity_type: 'page',
        action: 'create',
        created_by: '550e8400-e29b-41d4-a716-446655440003',
        search: 'page',
      };
      const sort = { field: 'created_at', direction: 'desc' } as const;

      await auditService.listAuditLogs(filters, sort);

      expect(mockQuery.eq).toHaveBeenCalledWith('site_id', '550e8400-e29b-41d4-a716-446655440001');
      expect(mockQuery.eq).toHaveBeenCalledWith('entity_type', 'page');
      expect(mockQuery.eq).toHaveBeenCalledWith('action', 'create');
      expect(mockQuery.eq).toHaveBeenCalledWith('created_by', '550e8400-e29b-41d4-a716-446655440003');
      expect(mockQuery.or).toHaveBeenCalledWith('entity_type.ilike.%page%,action.ilike.%page%');
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('should handle errors when listing audit logs', async () => {
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

      const result = await auditService.listAuditLogs();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Database error');
      }
    });
  });

  describe('getAuditLog', () => {
    it('should get a single audit log by ID', async () => {
      const mockLog = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        site_id: '550e8400-e29b-41d4-a716-446655440001',
        entity_type: 'page',
        entity_id: '550e8400-e29b-41d4-a716-446655440002',
        action: 'create',
        changes: { title: 'New Page' },
        metadata: { source: 'admin' },
        created_at: '2024-01-01T00:00:00Z',
        created_by: '550e8400-e29b-41d4-a716-446655440003',
      };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.single.mockResolvedValue({ data: mockLog, error: null });

      const result = await auditService.getAuditLog('550e8400-e29b-41d4-a716-446655440000');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockLog);
      }
    });

    it('should handle errors when getting audit log', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.single.mockResolvedValue({ data: null, error: { message: 'Audit log not found' } });

      const result = await auditService.getAuditLog('550e8400-e29b-41d4-a716-446655440000');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Audit log not found');
      }
    });
  });

  describe('createAuditLog', () => {
    it('should create a new audit log', async () => {
      const mockLog = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        site_id: '550e8400-e29b-41d4-a716-446655440001',
        entity_type: 'page',
        entity_id: '550e8400-e29b-41d4-a716-446655440002',
        action: 'create',
        changes: { title: 'New Page' },
        metadata: { source: 'admin' },
        created_at: '2024-01-01T00:00:00Z',
        created_by: '550e8400-e29b-41d4-a716-446655440003',
      };

      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.single.mockResolvedValue({ data: mockLog, error: null });

      const input = {
        site_id: '550e8400-e29b-41d4-a716-446655440001',
        entity_type: 'page' as const,
        entity_id: '550e8400-e29b-41d4-a716-446655440002',
        action: 'create' as const,
        changes: { title: 'New Page' },
        metadata: { source: 'admin' },
        created_by: '550e8400-e29b-41d4-a716-446655440003',
      };

      const result = await auditService.createAuditLog(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockLog);
      }
    });

    it('should handle errors when creating audit log', async () => {
      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.single.mockResolvedValue({ data: null, error: { message: 'Insert failed' } });

      const input = {
        site_id: '550e8400-e29b-41d4-a716-446655440001',
        entity_type: 'page' as const,
        entity_id: '550e8400-e29b-41d4-a716-446655440002',
        action: 'create' as const,
        changes: { title: 'New Page' },
        created_by: '550e8400-e29b-41d4-a716-446655440003',
      };

      const result = await auditService.createAuditLog(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Insert failed');
      }
    });
  });

  describe('getAuditStats', () => {
    it('should get audit statistics', async () => {
      const mockLogs = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          site_id: '550e8400-e29b-41d4-a716-446655440001',
          entity_type: 'page',
          entity_id: '550e8400-e29b-41d4-a716-446655440002',
          action: 'create',
          changes: { title: 'New Page' },
          metadata: { source: 'admin' },
          created_at: '2024-01-01T00:00:00Z',
          created_by: '550e8400-e29b-41d4-a716-446655440003',
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440004',
          site_id: '550e8400-e29b-41d4-a716-446655440001',
          entity_type: 'page',
          entity_id: '550e8400-e29b-41d4-a716-446655440005',
          action: 'update',
          changes: { title: 'Updated Page' },
          metadata: { source: 'admin' },
          created_at: '2024-01-01T01:00:00Z',
          created_by: '550e8400-e29b-41d4-a716-446655440003',
        },
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.select.mockReturnValue(mockQuery);
      mockQuery.eq.mockReturnValue(mockQuery);
      mockQuery.gte.mockReturnValue(mockQuery);
      mockQuery.lte.mockReturnValue(mockQuery);
      mockQuery.select.mockResolvedValue({ data: mockLogs, error: null });

      const result = await auditService.getAuditStats('550e8400-e29b-41d4-a716-446655440001');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.total_actions).toBe(2);
        expect(result.data.actions_by_type.create).toBe(1);
        expect(result.data.actions_by_type.update).toBe(1);
        expect(result.data.actions_by_user['550e8400-e29b-41d4-a716-446655440003']).toBe(2);
        expect(result.data.recent_activity).toHaveLength(2);
      }
    });

    it('should handle errors when getting audit stats', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.select.mockReturnValue(mockQuery);
      mockQuery.eq.mockReturnValue(mockQuery);
      mockQuery.gte.mockReturnValue(mockQuery);
      mockQuery.lte.mockReturnValue(mockQuery);
      mockQuery.select.mockResolvedValue({ data: null, error: { message: 'Query failed' } });

      const result = await auditService.getAuditStats('550e8400-e29b-41d4-a716-446655440001');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Query failed');
      }
    });
  });

  describe('getEntityAuditHistory', () => {
    it('should get entity audit history', async () => {
      const mockLogs = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          site_id: '550e8400-e29b-41d4-a716-446655440001',
          entity_type: 'page',
          entity_id: '550e8400-e29b-41d4-a716-446655440002',
          action: 'create',
          changes: { title: 'New Page' },
          metadata: { source: 'admin' },
          created_at: '2024-01-01T00:00:00Z',
          created_by: '550e8400-e29b-41d4-a716-446655440003',
        },
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.select.mockReturnValue(mockQuery);
      mockQuery.eq.mockReturnValue(mockQuery);
      mockQuery.order.mockReturnValue(mockQuery);
      mockQuery.select.mockResolvedValue({ data: mockLogs, error: null });

      const result = await auditService.getEntityAuditHistory('page', '550e8400-e29b-41d4-a716-446655440002');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockLogs);
      }
    });

    it('should handle errors when getting entity audit history', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.select.mockReturnValue(mockQuery);
      mockQuery.eq.mockReturnValue(mockQuery);
      mockQuery.order.mockReturnValue(mockQuery);
      mockQuery.select.mockResolvedValue({ data: null, error: { message: 'Query failed' } });

      const result = await auditService.getEntityAuditHistory('page', '550e8400-e29b-41d4-a716-446655440002');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Query failed');
      }
    });
  });

  describe('deleteAuditLog', () => {
    it('should delete an audit log', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.delete.mockReturnValue(mockQuery);
      mockQuery.eq.mockReturnValue(mockQuery);
      mockQuery.delete.mockResolvedValue({ error: null });

      const result = await auditService.deleteAuditLog('550e8400-e29b-41d4-a716-446655440000');

      expect(result.success).toBe(true);
    });

    it('should handle errors when deleting audit log', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.delete.mockReturnValue(mockQuery);
      mockQuery.eq.mockReturnValue(mockQuery);
      mockQuery.delete.mockResolvedValue({ error: { message: 'Delete failed' } });

      const result = await auditService.deleteAuditLog('550e8400-e29b-41d4-a716-446655440000');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Delete failed');
      }
    });
  });

  describe('cleanupOldLogs', () => {
    it('should cleanup old audit logs', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        lt: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.delete.mockReturnValue(mockQuery);
      mockQuery.lt.mockReturnValue(mockQuery);
      mockQuery.select.mockReturnValue(mockQuery);
      mockQuery.select.mockResolvedValue({ data: [{ id: '1' }, { id: '2' }], error: null });

      const result = await auditService.cleanupOldLogs(30);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.deletedCount).toBe(2);
      }
    });

    it('should handle errors when cleaning up old logs', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        lt: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
      };

      (mockSupabase.from as any).mockReturnValue(mockQuery);
      mockQuery.delete.mockReturnValue(mockQuery);
      mockQuery.lt.mockReturnValue(mockQuery);
      mockQuery.select.mockReturnValue(mockQuery);
      mockQuery.select.mockResolvedValue({ data: null, error: { message: 'Delete failed' } });

      const result = await auditService.cleanupOldLogs(30);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Delete failed');
      }
    });
  });
});
