import { describe, it, expect } from 'vitest';
import {
  AuditLogSchema,
  CreateAuditLogInputSchema,
  AuditFiltersSchema,
  AuditSortOptionsSchema,
  AuditListResponseSchema,
  AuditResponseSchema,
  AuditStatsSchema,
} from '../audit.schemas';

describe('Audit Schemas', () => {
  describe('AuditLogSchema', () => {
    it('should validate a valid audit log', () => {
      const validLog = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        site_id: '550e8400-e29b-41d4-a716-446655440001',
        entity_type: 'page',
        entity_id: '550e8400-e29b-41d4-a716-446655440002',
        action: 'create',
        changes: { title: 'New Page' },
        metadata: { source: 'admin' },
        created_at: '2024-01-01T00:00:00Z',
        created_by: '550e8400-e29b-41d4-a716-446655440003',
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      };

      const result = AuditLogSchema.safeParse(validLog);
      expect(result.success).toBe(true);
    });

    it('should reject invalid audit log data', () => {
      const invalidLog = {
        id: 'invalid-uuid',
        site_id: '550e8400-e29b-41d4-a716-446655440001',
        entity_type: 'invalid_type',
        entity_id: '550e8400-e29b-41d4-a716-446655440002',
        action: 'invalid_action',
        changes: { title: 'New Page' },
        metadata: { source: 'admin' },
        created_at: 'invalid-date',
        created_by: '550e8400-e29b-41d4-a716-446655440003',
        ip_address: 'invalid-ip',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      };

      const result = AuditLogSchema.safeParse(invalidLog);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(5); // id, entity_type, action, created_at, ip_address
      }
    });
  });

  describe('CreateAuditLogInputSchema', () => {
    it('should validate valid create audit log input', () => {
      const validInput = {
        site_id: '550e8400-e29b-41d4-a716-446655440001',
        entity_type: 'page',
        entity_id: '550e8400-e29b-41d4-a716-446655440002',
        action: 'create',
        changes: { title: 'New Page' },
        metadata: { source: 'admin' },
        created_by: '550e8400-e29b-41d4-a716-446655440003',
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      };

      const result = CreateAuditLogInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject invalid create audit log input', () => {
      const invalidInput = {
        site_id: 'invalid-uuid',
        entity_type: 'invalid_type,
        entity_id: '550e8400-e29b-41d4-a716-446655440002',
        action: 'invalid_action',
        changes: { title: 'New Page' },
        created_by: '550e8400-e29b-41d4-a716-446655440003',
        ip_address: 'invalid-ip',
      };

      const result = CreateAuditLogInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(4); // site_id, entity_type, action, ip_address
      }
    });
  });

  describe('AuditFiltersSchema', () => {
    it('should validate valid audit filters', () => {
      const validFilters = {
        site_id: '550e8400-e29b-41d4-a716-446655440001',
        entity_type: 'page',
        entity_id: '550e8400-e29b-41d4-a716-446655440002',
        action: 'create',
        created_by: '550e8400-e29b-41d4-a716-446655440003',
        date_from: '2024-01-01T00:00:00Z',
        date_to: '2024-12-31T23:59:59Z',
        search: 'page',
      };

      const result = AuditFiltersSchema.safeParse(validFilters);
      expect(result.success).toBe(true);
    });

    it('should validate empty filters', () => {
      const emptyFilters = {};

      const result = AuditFiltersSchema.safeParse(emptyFilters);
      expect(result.success).toBe(true);
    });
  });

  describe('AuditSortOptionsSchema', () => {
    it('should validate valid sort options', () => {
      const validSort = {
        field: 'created_at' as const,
        direction: 'desc' as const,
      };

      const result = AuditSortOptionsSchema.safeParse(validSort);
      expect(result.success).toBe(true);
    });

    it('should reject invalid sort options', () => {
      const invalidSort = {
        field: 'invalid_field',
        direction: 'invalid_direction',
      };

      const result = AuditSortOptionsSchema.safeParse(invalidSort);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(2); // field, direction
      }
    });
  });

  describe('AuditListResponseSchema', () => {
    it('should validate valid audit list response', () => {
      const validResponse = {
        logs: [
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
        ],
        totalCount: 1,
        hasMore: false,
      };

      const result = AuditListResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('AuditResponseSchema', () => {
    it('should validate valid audit response', () => {
      const validResponse = {
        log: {
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
      };

      const result = AuditResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('AuditStatsSchema', () => {
    it('should validate valid audit stats', () => {
      const validStats = {
        total_actions: 100,
        actions_by_type: {
          create: 50,
          update: 30,
          delete: 20,
        },
        actions_by_user: {
          '550e8400-e29b-41d4-a716-446655440001': 60,
          '550e8400-e29b-41d4-a716-446655440002': 40,
        },
        recent_activity: [
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
        ],
      };

      const result = AuditStatsSchema.safeParse(validStats);
      expect(result.success).toBe(true);
    });
  });
});
