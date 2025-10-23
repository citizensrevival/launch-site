// Audit Logging Client Functions
// This file contains all client-side functions for the audit logging system

import { supabase } from '../../shell/lib/supabase';
import { AuditLogEntry, ApiResponse, PaginatedResponse } from './types';

// Log a CMS operation
export async function logCmsAudit(params: {
  action: 'create' | 'update' | 'publish' | 'unpublish' | 'delete' | 'rollback';
  entityType: 'page' | 'block' | 'menu' | 'asset';
  entityId: string;
  version?: number;
  changes?: Record<string, unknown>;
}): Promise<ApiResponse<AuditLogEntry>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get user permissions
    const { data: userPermissions } = await supabase
      .from('user_permissions')
      .select('permissions')
      .eq('user_id', user.id)
      .single();

    const { data, error } = await supabase
      .from('cms_audit_log')
      .insert({
        user_id: user.id,
        user_permissions: userPermissions?.permissions || [],
        action: params.action,
        entity_type: params.entityType,
        entity_id: params.entityId,
        version: params.version,
        changes: params.changes || {}
      })
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Get audit log entries with filtering
export async function getAuditLog(params: {
  entityType?: string;
  entityId?: string;
  userId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}): Promise<ApiResponse<PaginatedResponse<AuditLogEntry>>> {
  try {
    const {
      entityType,
      entityId,
      userId,
      action,
      startDate,
      endDate,
      page = 1,
      pageSize = 50
    } = params;

    let query = supabase
      .from('cms_audit_log')
      .select('*', { count: 'exact' });

    // Apply filters
    if (entityType) {
      query = query.eq('entity_type', entityType);
    }
    if (entityId) {
      query = query.eq('entity_id', entityId);
    }
    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (action) {
      query = query.eq('action', action);
    }
    if (startDate) {
      query = query.gte('occurred_at', startDate);
    }
    if (endDate) {
      query = query.lte('occurred_at', endDate);
    }

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    // Order by most recent first
    query = query.order('occurred_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) throw error;

    const totalPages = Math.ceil((count || 0) / pageSize);

    return {
      data: {
        data: data || [],
        count: count || 0,
        page,
        page_size: pageSize,
        total_pages: totalPages
      },
      error: null
    };
  } catch (error) {
    return { 
      data: { data: [], count: 0, page: 1, page_size: 50, total_pages: 0 }, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Get audit log for a specific entity
export async function getEntityAuditLog(entityType: string, entityId: string): Promise<ApiResponse<AuditLogEntry[]>> {
  try {
    const { data, error } = await supabase
      .from('cms_audit_log')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('occurred_at', { ascending: false });

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    return { data: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Get audit log statistics
export async function getAuditLogStats(params: {
  startDate?: string;
  endDate?: string;
  entityType?: string;
}): Promise<ApiResponse<{
  totalOperations: number;
  operationsByType: Record<string, number>;
  operationsByEntity: Record<string, number>;
  operationsByUser: Record<string, number>;
  recentActivity: AuditLogEntry[];
}>> {
  try {
    const { startDate, endDate, entityType } = params;

    let query = supabase
      .from('cms_audit_log')
      .select('*');

    // Apply filters
    if (entityType) {
      query = query.eq('entity_type', entityType);
    }
    if (startDate) {
      query = query.gte('occurred_at', startDate);
    }
    if (endDate) {
      query = query.lte('occurred_at', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    const entries = data || [];

    // Calculate statistics
    const totalOperations = entries.length;
    
    const operationsByType = entries.reduce((acc, entry) => {
      acc[entry.action] = (acc[entry.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const operationsByEntity = entries.reduce((acc, entry) => {
      acc[entry.entity_type] = (acc[entry.entity_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const operationsByUser = entries.reduce((acc, entry) => {
      acc[entry.user_id] = (acc[entry.user_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentActivity = entries
      .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime())
      .slice(0, 10);

    return {
      data: {
        totalOperations,
        operationsByType,
        operationsByEntity,
        operationsByUser,
        recentActivity
      },
      error: null
    };
  } catch (error) {
    return { 
      data: { 
        totalOperations: 0, 
        operationsByType: {}, 
        operationsByEntity: {}, 
        operationsByUser: {}, 
        recentActivity: [] 
      }, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Clear audit log (admin only)
export async function clearAuditLog(params: {
  olderThan?: string;
  entityType?: string;
}): Promise<ApiResponse<number>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if user has admin permissions
    const { data: userPermissions } = await supabase
      .from('user_permissions')
      .select('permissions')
      .eq('user_id', user.id)
      .single();

    const hasAdminPermission = userPermissions?.permissions?.includes('system.admin');
    if (!hasAdminPermission) {
      throw new Error('Insufficient permissions to clear audit log');
    }

    let query = supabase
      .from('cms_audit_log')
      .delete({ count: 'exact' });

    // Apply filters
    if (params.olderThan) {
      query = query.lt('occurred_at', params.olderThan);
    }
    if (params.entityType) {
      query = query.eq('entity_type', params.entityType);
    }

    const { count, error } = await query;

    if (error) throw error;

    return { data: count || 0, error: null };
  } catch (error) {
    return { data: 0, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Export audit log to CSV
export async function exportAuditLog(params: {
  entityType?: string;
  startDate?: string;
  endDate?: string;
  format?: 'csv' | 'json';
}): Promise<ApiResponse<string>> {
  try {
    const { entityType, startDate, endDate, format = 'csv' } = params;

    let query = supabase
      .from('cms_audit_log')
      .select('*');

    // Apply filters
    if (entityType) {
      query = query.eq('entity_type', entityType);
    }
    if (startDate) {
      query = query.gte('occurred_at', startDate);
    }
    if (endDate) {
      query = query.lte('occurred_at', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    if (format === 'csv') {
      const csv = convertToCSV(data || []);
      return { data: csv, error: null };
    } else {
      return { data: JSON.stringify(data || [], null, 2), error: null };
    }
  } catch (error) {
    return { data: '', error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Helper function to convert audit log to CSV
function convertToCSV(data: AuditLogEntry[]): string {
  if (data.length === 0) return '';

  const headers = [
    'ID',
    'User ID',
    'Action',
    'Entity Type',
    'Entity ID',
    'Version',
    'Changes',
    'Occurred At'
  ];

  const rows = data.map(entry => [
    entry.id,
    entry.user_id,
    entry.action,
    entry.entity_type,
    entry.entity_id,
    entry.version || '',
    JSON.stringify(entry.changes || {}),
    entry.occurred_at
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  return csvContent;
}
