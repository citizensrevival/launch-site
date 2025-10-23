// Audit Integration Hook
// This hook provides audit logging integration for existing CMS operations

import { useCallback } from 'react';
import { logCmsAudit } from './auditClient';

// Hook for integrating audit logging into CMS operations
export function useAuditIntegration() {
  const logOperation = useCallback(async (params: {
    action: 'create' | 'update' | 'publish' | 'unpublish' | 'delete' | 'rollback';
    entityType: 'page' | 'block' | 'menu' | 'asset';
    entityId: string;
    version?: number;
    changes?: Record<string, unknown>;
  }) => {
    try {
      await logCmsAudit(params);
    } catch (error) {
      // Don't throw errors for audit logging failures
      // Just log to console for debugging
      console.warn('Failed to log audit entry:', error);
    }
  }, []);

  const logCreate = useCallback((entityType: 'page' | 'block' | 'menu' | 'asset', entityId: string, data?: any) => {
    return logOperation({
      action: 'create',
      entityType,
      entityId,
      changes: data ? { created: data } : undefined
    });
  }, [logOperation]);

  const logUpdate = useCallback((entityType: 'page' | 'block' | 'menu' | 'asset', entityId: string, version: number, changes: Record<string, unknown>) => {
    return logOperation({
      action: 'update',
      entityType,
      entityId,
      version,
      changes
    });
  }, [logOperation]);

  const logPublish = useCallback((entityType: 'page' | 'block' | 'menu' | 'asset', entityId: string, version: number) => {
    return logOperation({
      action: 'publish',
      entityType,
      entityId,
      version,
      changes: { published: true }
    });
  }, [logOperation]);

  const logUnpublish = useCallback((entityType: 'page' | 'block' | 'menu' | 'asset', entityId: string) => {
    return logOperation({
      action: 'unpublish',
      entityType,
      entityId,
      changes: { published: false }
    });
  }, [logOperation]);

  const logDelete = useCallback((entityType: 'page' | 'block' | 'menu' | 'asset', entityId: string) => {
    return logOperation({
      action: 'delete',
      entityType,
      entityId,
      changes: { deleted: true }
    });
  }, [logOperation]);

  const logRollback = useCallback((entityType: 'page' | 'block' | 'menu' | 'asset', entityId: string, version: number) => {
    return logOperation({
      action: 'rollback',
      entityType,
      entityId,
      version,
      changes: { rolled_back: true }
    });
  }, [logOperation]);

  return {
    logOperation,
    logCreate,
    logUpdate,
    logPublish,
    logUnpublish,
    logDelete,
    logRollback
  };
}

// Higher-order function to wrap CMS operations with audit logging
export function withAuditLogging<T extends any[], R>(
  operation: (...args: T) => Promise<R>,
  auditConfig: {
    action: 'create' | 'update' | 'publish' | 'unpublish' | 'delete' | 'rollback';
    entityType: 'page' | 'block' | 'menu' | 'asset';
    getEntityId: (...args: T) => string;
    getVersion?: (...args: T) => number;
    getChanges?: (...args: T) => Record<string, unknown>;
  }
) {
  return async (...args: T): Promise<R> => {
    try {
      const result = await operation(...args);
      
      // Log the operation
      await logCmsAudit({
        action: auditConfig.action,
        entityType: auditConfig.entityType,
        entityId: auditConfig.getEntityId(...args),
        version: auditConfig.getVersion?.(...args),
        changes: auditConfig.getChanges?.(...args)
      });
      
      return result;
    } catch (error) {
      // Don't log audit entries for failed operations
      throw error;
    }
  };
}

// Audit logging decorators for common CMS operations
export const auditDecorators = {
  // Page operations
  createPage: (operation: (data: any) => Promise<any>) => 
    withAuditLogging(operation, {
      action: 'create',
      entityType: 'page',
      getEntityId: (data) => data.id,
      getChanges: (data) => ({ created: data })
    }),

  updatePage: (operation: (id: string, data: any) => Promise<any>) =>
    withAuditLogging(operation, {
      action: 'update',
      entityType: 'page',
      getEntityId: (_id) => _id,
      getChanges: (_id, data) => ({ updated: data })
    }),

  publishPage: (operation: (id: string, version: number) => Promise<any>) =>
    withAuditLogging(operation, {
      action: 'publish',
      entityType: 'page',
      getEntityId: (_id) => _id,
      getVersion: (_id, version) => version,
      getChanges: () => ({ published: true })
    }),

  // Block operations
  createBlock: (operation: (data: any) => Promise<any>) =>
    withAuditLogging(operation, {
      action: 'create',
      entityType: 'block',
      getEntityId: (data) => data.id,
      getChanges: (data) => ({ created: data })
    }),

  updateBlock: (operation: (id: string, data: any) => Promise<any>) =>
    withAuditLogging(operation, {
      action: 'update',
      entityType: 'block',
      getEntityId: (_id) => _id,
      getChanges: (_id, data) => ({ updated: data })
    }),

  publishBlock: (operation: (id: string, version: number) => Promise<any>) =>
    withAuditLogging(operation, {
      action: 'publish',
      entityType: 'block',
      getEntityId: (_id) => _id,
      getVersion: (_id, version) => version,
      getChanges: () => ({ published: true })
    }),

  // Menu operations
  createMenu: (operation: (data: any) => Promise<any>) =>
    withAuditLogging(operation, {
      action: 'create',
      entityType: 'menu',
      getEntityId: (data) => data.id,
      getChanges: (data) => ({ created: data })
    }),

  updateMenu: (operation: (id: string, data: any) => Promise<any>) =>
    withAuditLogging(operation, {
      action: 'update',
      entityType: 'menu',
      getEntityId: (_id) => _id,
      getChanges: (_id, data) => ({ updated: data })
    }),

  publishMenu: (operation: (id: string, version: number) => Promise<any>) =>
    withAuditLogging(operation, {
      action: 'publish',
      entityType: 'menu',
      getEntityId: (_id) => _id,
      getVersion: (_id, version) => version,
      getChanges: () => ({ published: true })
    }),

  // Asset operations
  createAsset: (operation: (data: any) => Promise<any>) =>
    withAuditLogging(operation, {
      action: 'create',
      entityType: 'asset',
      getEntityId: (data) => data.id,
      getChanges: (data) => ({ created: data })
    }),

  updateAsset: (operation: (id: string, data: any) => Promise<any>) =>
    withAuditLogging(operation, {
      action: 'update',
      entityType: 'asset',
      getEntityId: (_id) => _id,
      getChanges: (_id, data) => ({ updated: data })
    }),

  publishAsset: (operation: (id: string, version: number) => Promise<any>) =>
    withAuditLogging(operation, {
      action: 'publish',
      entityType: 'asset',
      getEntityId: (_id) => _id,
      getVersion: (_id, version) => version,
      getChanges: () => ({ published: true })
    })
};

// Utility function to create audit log entries for batch operations
export async function logBatchOperation(
  operations: Array<{
    action: 'create' | 'update' | 'publish' | 'unpublish' | 'delete' | 'rollback';
    entityType: 'page' | 'block' | 'menu' | 'asset';
    entityId: string;
    version?: number;
    changes?: Record<string, unknown>;
  }>
) {
  const promises = operations.map(operation => 
    logCmsAudit(operation).catch(error => {
      console.warn('Failed to log batch operation:', error);
      return null;
    })
  );

  await Promise.all(promises);
}

// Utility function to create audit log entries for staging operations
export async function logStagingOperation(
  stagingId: string,
  operations: Array<{
    action: 'stage' | 'unstage' | 'publish_staged' | 'rollback_staged';
    entityType: 'page' | 'block' | 'menu' | 'asset';
    entityId: string;
    version?: number;
  }>
) {
  const auditEntries = operations.map(operation => ({
    action: (operation.action === 'stage' ? 'create' : 
            operation.action === 'unstage' ? 'update' :
            operation.action === 'publish_staged' ? 'publish' : 'rollback') as 'create' | 'update' | 'publish' | 'rollback',
    entityType: operation.entityType,
    entityId: operation.entityId,
    version: operation.version,
    changes: { 
      staging_id: stagingId,
      staging_operation: operation.action
    }
  }));

  await logBatchOperation(auditEntries);
}
