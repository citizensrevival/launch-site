// import { PublishStatus } from '../../../../core/types/cms.types'; // TODO: Implement proper CMS types

export interface AuditLog {
  id: string;
  site_id: string;
  entity_type: 'page' | 'menu' | 'block' | 'asset' | 'user' | 'site' | 'deployment';
  entity_id: string;
  action: 'create' | 'update' | 'delete' | 'publish' | 'unpublish' | 'deploy' | 'rollback';
  changes: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: string;
  created_by: string;
  ip_address?: string;
  user_agent?: string;
}

export interface AuditFilters {
  site_id?: string;
  entity_type?: string;
  entity_id?: string;
  action?: string;
  created_by?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface AuditSortOptions {
  field: 'created_at' | 'entity_type' | 'action' | 'created_by';
  direction: 'asc' | 'desc';
}

export interface AuditListResponse {
  logs: AuditLog[];
  totalCount: number;
  hasMore: boolean;
}

export interface AuditResponse {
  log: AuditLog;
}

export interface AuditStats {
  total_actions: number;
  actions_by_type: Record<string, number>;
  actions_by_user: Record<string, number>;
  recent_activity: AuditLog[];
}

export interface CreateAuditLogInput {
  site_id: string;
  entity_type: 'page' | 'menu' | 'block' | 'asset' | 'user' | 'site' | 'deployment';
  entity_id: string;
  action: 'create' | 'update' | 'delete' | 'publish' | 'unpublish' | 'deploy' | 'rollback';
  changes: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  created_by: string;
  ip_address?: string;
  user_agent?: string;
}
