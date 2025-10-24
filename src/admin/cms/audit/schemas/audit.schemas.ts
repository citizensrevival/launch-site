import { z } from 'zod';

// ================================================
// Audit Log Schemas
// ================================================

export const AuditLogSchema = z.object({
  id: z.string().uuid(),
  site_id: z.string().uuid(),
  entity_type: z.enum(['page', 'menu', 'block', 'asset', 'user', 'site', 'deployment']),
  entity_id: z.string().uuid(),
  action: z.enum(['create', 'update', 'delete', 'publish', 'unpublish', 'deploy', 'rollback']),
  changes: z.record(z.string(), z.any()),
  metadata: z.record(z.string(), z.any()),
  created_at: z.string().datetime(),
  created_by: z.string().uuid(),
  ip_address: z.string().optional(),
  user_agent: z.string().max(1000).optional(),
});

export const CreateAuditLogInputSchema = z.object({
  site_id: z.string().uuid(),
  entity_type: z.enum(['page', 'menu', 'block', 'asset', 'user', 'site', 'deployment']),
  entity_id: z.string().uuid(),
  action: z.enum(['create', 'update', 'delete', 'publish', 'unpublish', 'deploy', 'rollback']),
  changes: z.record(z.string(), z.any()),
  metadata: z.record(z.string(), z.any()).optional(),
  created_by: z.string().uuid(),
  ip_address: z.string().optional(),
  user_agent: z.string().max(1000).optional(),
});

export const AuditFiltersSchema = z.object({
  site_id: z.string().uuid().optional(),
  entity_type: z.string().optional(),
  entity_id: z.string().uuid().optional(),
  action: z.string().optional(),
  created_by: z.string().uuid().optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  search: z.string().optional(),
});

export const AuditSortOptionsSchema = z.object({
  field: z.enum(['created_at', 'entity_type', 'action', 'created_by']),
  direction: z.enum(['asc', 'desc']),
});

// ================================================
// Response Schemas
// ================================================

export const AuditListResponseSchema = z.object({
  logs: z.array(AuditLogSchema),
  totalCount: z.number(),
  hasMore: z.boolean(),
});

export const AuditResponseSchema = z.object({
  log: AuditLogSchema,
});

export const AuditStatsSchema = z.object({
  total_actions: z.number().int().min(0),
  actions_by_type: z.record(z.string(), z.number().int().min(0)),
  actions_by_user: z.record(z.string(), z.number().int().min(0)),
  recent_activity: z.array(AuditLogSchema),
});
