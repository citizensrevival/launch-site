// Permissions React Hooks
// This file contains React hooks for the permissions system

import React, { useState, useEffect, useCallback } from 'react';
import { Permission, UserPermissions } from './types';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  updateUserPermissions,
  addUserPermission,
  removeUserPermission,
  getAllUsersWithPermissions,
  canPerformCmsOperation,
  canAccessAdmin,
  isAdmin,
  getCmsPermissionsSummary
} from './permissionsClient';

// Hook for checking individual permissions
export function usePermission(permission: Permission) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkPermission = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await hasPermission(permission);
      setHasAccess(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setHasAccess(false);
    }
    
    setLoading(false);
  }, [permission]);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return {
    hasAccess,
    loading,
    error,
    checkPermission
  };
}

// Hook for checking multiple permissions
export function usePermissions(permissions: Permission[]) {
  const [permissionStates, setPermissionStates] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkPermissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await Promise.all(
        permissions.map(async (permission) => ({
          permission,
          hasAccess: await hasPermission(permission)
        }))
      );

      const states = results.reduce((acc, { permission, hasAccess }) => {
        acc[permission] = hasAccess;
        return acc;
      }, {} as Record<string, boolean>);

      setPermissionStates(states);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setPermissionStates({});
    }
    
    setLoading(false);
  }, [permissions]);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  const hasAny = useCallback(async () => {
    return await hasAnyPermission(permissions);
  }, [permissions]);

  const hasAll = useCallback(async () => {
    return await hasAllPermissions(permissions);
  }, [permissions]);

  return {
    permissionStates,
    loading,
    error,
    checkPermissions,
    hasAny,
    hasAll
  };
}

// Hook for CMS permissions summary
export function useCmsPermissions() {
  const [permissions, setPermissions] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const response = await getCmsPermissionsSummary();
    
    if (response.error) {
      setError(response.error);
    } else {
      setPermissions(response.data);
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return {
    permissions,
    loading,
    error,
    refresh: fetchPermissions
  };
}

// Hook for user permissions management
export function useUserPermissionsManagement() {
  const [users, setUsers] = useState<UserPermissions[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const response = await getAllUsersWithPermissions();
    
    if (response.error) {
      setError(response.error);
    } else {
      setUsers(response.data || []);
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updatePermissions = useCallback(async (userId: string, permissions: Permission[]) => {
    setLoading(true);
    setError(null);
    
    const response = await updateUserPermissions(userId, permissions);
    
    if (response.error) {
      setError(response.error);
      setLoading(false);
      return false;
    }
    
    // Refresh users list
    await fetchUsers();
    setLoading(false);
    return true;
  }, [fetchUsers]);

  const addPermission = useCallback(async (userId: string, permission: Permission) => {
    setLoading(true);
    setError(null);
    
    const response = await addUserPermission(userId, permission);
    
    if (response.error) {
      setError(response.error);
      setLoading(false);
      return false;
    }
    
    // Refresh users list
    await fetchUsers();
    setLoading(false);
    return true;
  }, [fetchUsers]);

  const removePermission = useCallback(async (userId: string, permission: Permission) => {
    setLoading(true);
    setError(null);
    
    const response = await removeUserPermission(userId, permission);
    
    if (response.error) {
      setError(response.error);
      setLoading(false);
      return false;
    }
    
    // Refresh users list
    await fetchUsers();
    setLoading(false);
    return true;
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    updatePermissions,
    addPermission,
    removePermission,
    refresh: fetchUsers
  };
}

// Hook for admin access check
export function useAdminAccess() {
  const [canAccess, setCanAccess] = useState<boolean | null>(null);
  const [isAdminUser, setIsAdminUser] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAccess = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [adminAccess, adminStatus] = await Promise.all([
        canAccessAdmin(),
        isAdmin()
      ]);
      
      setCanAccess(adminAccess);
      setIsAdminUser(adminStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setCanAccess(false);
      setIsAdminUser(false);
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  return {
    canAccess,
    isAdmin: isAdminUser,
    loading,
    error,
    checkAccess
  };
}

// Hook for CMS operation permissions
export function useCmsOperationPermissions() {
  const [operationPermissions, setOperationPermissions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkOperationPermissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const operations = [
        { operation: 'create' as const, entityType: 'page' as const },
        { operation: 'read' as const, entityType: 'page' as const },
        { operation: 'update' as const, entityType: 'page' as const },
        { operation: 'delete' as const, entityType: 'page' as const },
        { operation: 'publish' as const, entityType: 'page' as const },
        { operation: 'create' as const, entityType: 'block' as const },
        { operation: 'read' as const, entityType: 'block' as const },
        { operation: 'update' as const, entityType: 'block' as const },
        { operation: 'delete' as const, entityType: 'block' as const },
        { operation: 'publish' as const, entityType: 'block' as const },
        { operation: 'create' as const, entityType: 'menu' as const },
        { operation: 'read' as const, entityType: 'menu' as const },
        { operation: 'update' as const, entityType: 'menu' as const },
        { operation: 'delete' as const, entityType: 'menu' as const },
        { operation: 'publish' as const, entityType: 'menu' as const },
        { operation: 'create' as const, entityType: 'asset' as const },
        { operation: 'read' as const, entityType: 'asset' as const },
        { operation: 'update' as const, entityType: 'asset' as const },
        { operation: 'delete' as const, entityType: 'asset' as const },
        { operation: 'publish' as const, entityType: 'asset' as const }
      ];

      const results = await Promise.all(
        operations.map(async ({ operation, entityType }) => ({
          key: `${operation}_${entityType}`,
          hasAccess: await canPerformCmsOperation(operation, entityType)
        }))
      );

      const permissions = results.reduce((acc, { key, hasAccess }) => {
        acc[key] = hasAccess;
        return acc;
      }, {} as Record<string, boolean>);

      setOperationPermissions(permissions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setOperationPermissions({});
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    checkOperationPermissions();
  }, [checkOperationPermissions]);

  const canPerform = useCallback(async (operation: 'create' | 'read' | 'update' | 'delete' | 'publish', entityType: 'page' | 'block' | 'menu' | 'asset') => {
    return await canPerformCmsOperation(operation, entityType);
  }, []);

  return {
    operationPermissions,
    loading,
    error,
    checkOperationPermissions,
    canPerform
  };
}

// Hook for permission-based UI rendering
export function usePermissionGate(permission: Permission, fallback?: React.ReactNode) {
  const { hasAccess, loading } = usePermission(permission);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-4 w-full rounded"></div>;
  }

  if (!hasAccess) {
    return fallback || null;
  }

  return null; // Render children when permission is granted
}

// Hook for conditional rendering based on permissions
export function useConditionalRender(permissions: Permission[], mode: 'any' | 'all' = 'any') {
  const { permissionStates, loading } = usePermissions(permissions);

  const shouldRender = useCallback(() => {
    if (loading) return false;
    
    if (mode === 'any') {
      return permissions.some(permission => permissionStates[permission]);
    } else {
      return permissions.every(permission => permissionStates[permission]);
    }
  }, [permissions, permissionStates, loading, mode]);

  return {
    shouldRender: shouldRender(),
    loading,
    permissionStates
  };
}
