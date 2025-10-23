// Audit Logging React Hooks
// This file contains React hooks for the audit logging system

import { useState, useEffect, useCallback } from 'react';
import { AuditLogEntry } from './types';
import {
  logCmsAudit,
  getAuditLog,
  getEntityAuditLog,
  getAuditLogStats,
  clearAuditLog,
  exportAuditLog
} from './auditClient';

// Hook for managing audit log entries
export function useAuditLog(params: {
  entityType?: string;
  entityId?: string;
  userId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}) {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    count: 0,
    page: 1,
    pageSize: 50,
    totalPages: 0
  });

  const fetchAuditLog = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const response = await getAuditLog(params);
    
    if (response.error) {
      setError(response.error);
    } else {
      setEntries(response.data?.data || []);
      setPagination({
        count: response.data?.count || 0,
        page: response.data?.page || 1,
        pageSize: response.data?.page_size || 50,
        totalPages: response.data?.total_pages || 0
      });
    }
    
    setLoading(false);
  }, [params.entityType, params.entityId, params.userId, params.action, params.startDate, params.endDate, params.page, params.pageSize]);

  useEffect(() => {
    fetchAuditLog();
  }, [fetchAuditLog]);

  const logOperation = useCallback(async (operation: {
    action: 'create' | 'update' | 'publish' | 'unpublish' | 'delete' | 'rollback';
    entityType: 'page' | 'block' | 'menu' | 'asset';
    entityId: string;
    version?: number;
    changes?: Record<string, unknown>;
  }) => {
    const response = await logCmsAudit(operation);
    
    if (response.error) {
      setError(response.error);
      return false;
    }
    
    // Refresh the audit log
    await fetchAuditLog();
    return true;
  }, [fetchAuditLog]);

  return {
    entries,
    loading,
    error,
    pagination,
    logOperation,
    refresh: fetchAuditLog
  };
}

// Hook for entity-specific audit log
export function useEntityAuditLog(entityType: string, entityId: string) {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEntityAuditLog = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const response = await getEntityAuditLog(entityType, entityId);
    
    if (response.error) {
      setError(response.error);
    } else {
      setEntries(response.data || []);
    }
    
    setLoading(false);
  }, [entityType, entityId]);

  useEffect(() => {
    fetchEntityAuditLog();
  }, [fetchEntityAuditLog]);

  return {
    entries,
    loading,
    error,
    refresh: fetchEntityAuditLog
  };
}

// Hook for audit log statistics
export function useAuditLogStats(params: {
  startDate?: string;
  endDate?: string;
  entityType?: string;
}) {
  const [stats, setStats] = useState<{
    totalOperations: number;
    operationsByType: Record<string, number>;
    operationsByEntity: Record<string, number>;
    operationsByUser: Record<string, number>;
    recentActivity: AuditLogEntry[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const response = await getAuditLogStats(params);
    
    if (response.error) {
      setError(response.error);
    } else {
      setStats(response.data);
    }
    
    setLoading(false);
  }, [params.startDate, params.endDate, params.entityType]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats
  };
}

// Hook for audit log management
export function useAuditLogManagement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearLog = useCallback(async (params: {
    olderThan?: string;
    entityType?: string;
  }) => {
    setLoading(true);
    setError(null);
    
    const response = await clearAuditLog(params);
    
    if (response.error) {
      setError(response.error);
      setLoading(false);
      return false;
    }
    
    setLoading(false);
    return true;
  }, []);

  const exportLog = useCallback(async (params: {
    entityType?: string;
    startDate?: string;
    endDate?: string;
    format?: 'csv' | 'json';
  }) => {
    setLoading(true);
    setError(null);
    
    const response = await exportAuditLog(params);
    
    if (response.error) {
      setError(response.error);
      setLoading(false);
      return null;
    }
    
    setLoading(false);
    return response.data;
  }, []);

  return {
    loading,
    error,
    clearLog,
    exportLog
  };
}

// Hook for audit log filtering
export function useAuditLogFilters() {
  const [filters, setFilters] = useState({
    entityType: '',
    action: '',
    userId: '',
    startDate: '',
    endDate: ''
  });

  const updateFilter = useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      entityType: '',
      action: '',
      userId: '',
      startDate: '',
      endDate: ''
    });
  }, []);

  const getFilterParams = useCallback(() => {
    const params: any = {};
    
    if (filters.entityType) params.entityType = filters.entityType;
    if (filters.action) params.action = filters.action;
    if (filters.userId) params.userId = filters.userId;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    
    return params;
  }, [filters]);

  return {
    filters,
    updateFilter,
    clearFilters,
    getFilterParams
  };
}

// Hook for audit log pagination
export function useAuditLogPagination(initialPage = 1, initialPageSize = 50) {
  const [pagination, setPagination] = useState({
    page: initialPage,
    pageSize: initialPageSize
  });

  const updatePage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const updatePageSize = useCallback((pageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize, page: 1 }));
  }, []);

  const resetPagination = useCallback(() => {
    setPagination({ page: 1, pageSize: initialPageSize });
  }, [initialPageSize]);

  return {
    pagination,
    updatePage,
    updatePageSize,
    resetPagination
  };
}
