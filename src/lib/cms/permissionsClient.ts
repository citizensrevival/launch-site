// Permissions Client Functions
// This file contains all client-side functions for the permissions system

import { supabase } from '../../shell/lib/supabase';
import { Permission, UserPermissions, ApiResponse } from './types';

// Check if user has a specific permission
export async function hasPermission(permission: Permission): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase.rpc('has_permission', {
      user_id: user.id,
      permission: permission
    });

    if (error) {
      console.warn('Permission check failed:', error);
      return false;
    }

    return data as boolean;
  } catch (error) {
    console.warn('Permission check error:', error);
    return false;
  }
}

// Check if user has any of the specified permissions
export async function hasAnyPermission(permissions: Permission[]): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase.rpc('has_permission', {
      user_id: user.id,
      permission: permissions[0] // Check first permission
    });

    if (error) {
      console.warn('Permission check failed:', error);
      return false;
    }

    // If first permission check passes, return true
    if (data) return true;

    // Check remaining permissions
    for (let i = 1; i < permissions.length; i++) {
      const { data: hasPerm, error: permError } = await supabase.rpc('has_permission', {
        user_id: user.id,
        permission: permissions[i]
      });

      if (permError) {
        console.warn(`Permission check failed for ${permissions[i]}:`, permError);
        continue;
      }

      if (hasPerm) return true;
    }

    return false;
  } catch (error) {
    console.warn('Permission check error:', error);
    return false;
  }
}

// Check if user has all of the specified permissions
export async function hasAllPermissions(permissions: Permission[]): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    for (const permission of permissions) {
      const { data, error } = await supabase.rpc('has_permission', {
        user_id: user.id,
        permission: permission
      });

      if (error) {
        console.warn(`Permission check failed for ${permission}:`, error);
        return false;
      }

      if (!data) return false;
    }

    return true;
  } catch (error) {
    console.warn('Permission check error:', error);
    return false;
  }
}

// Get user permissions
export async function getUserPermissions(userId: string): Promise<ApiResponse<UserPermissions>> {
  try {
    const { data, error } = await supabase
      .from('user_permissions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Update user permissions
export async function updateUserPermissions(
  userId: string, 
  permissions: Permission[]
): Promise<ApiResponse<UserPermissions>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if current user has permission to manage user permissions
    const canManage = await hasPermission('users.manage');
    if (!canManage) throw new Error('Insufficient permissions to manage user permissions');

    const { data, error } = await supabase
      .from('user_permissions')
      .upsert({
        user_id: userId,
        permissions: permissions
      })
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Add permission to user
export async function addUserPermission(
  userId: string, 
  permission: Permission
): Promise<ApiResponse<UserPermissions>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if current user has permission to manage user permissions
    const canManage = await hasPermission('users.manage');
    if (!canManage) throw new Error('Insufficient permissions to manage user permissions');

    // Get current permissions
    const currentPermissions = await getUserPermissions(userId);
    if (currentPermissions.error) throw new Error(currentPermissions.error);

    const permissions = currentPermissions.data?.permissions || [];
    
    // Add permission if not already present
    if (!permissions.includes(permission)) {
      permissions.push(permission);
    }

    return await updateUserPermissions(userId, permissions);
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Remove permission from user
export async function removeUserPermission(
  userId: string, 
  permission: Permission
): Promise<ApiResponse<UserPermissions>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if current user has permission to manage user permissions
    const canManage = await hasPermission('users.manage');
    if (!canManage) throw new Error('Insufficient permissions to manage user permissions');

    // Get current permissions
    const currentPermissions = await getUserPermissions(userId);
    if (currentPermissions.error) throw new Error(currentPermissions.error);

    const permissions = currentPermissions.data?.permissions || [];
    
    // Remove permission
    const updatedPermissions = permissions.filter(p => p !== permission);

    return await updateUserPermissions(userId, updatedPermissions);
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Get all users with their permissions
export async function getAllUsersWithPermissions(): Promise<ApiResponse<UserPermissions[]>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if current user has permission to manage user permissions
    const canManage = await hasPermission('users.manage');
    if (!canManage) throw new Error('Insufficient permissions to view user permissions');

    const { data, error } = await supabase
      .from('user_permissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    return { data: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Check if user can perform CMS operation
export async function canPerformCmsOperation(
  operation: 'create' | 'read' | 'update' | 'delete' | 'publish',
  entityType: 'page' | 'block' | 'menu' | 'asset'
): Promise<boolean> {
  const permission = `cms.${entityType}s.${operation}` as Permission;
  return await hasPermission(permission);
}

// Check if user can access admin features
export async function canAccessAdmin(): Promise<boolean> {
  return await hasAnyPermission([
    'cms.pages.read',
    'cms.blocks.read',
    'cms.menus.read',
    'cms.assets.read',
    'analytics.read',
    'leads.read',
    'users.manage',
    'system.admin'
  ]);
}

// Check if user is admin
export async function isAdmin(): Promise<boolean> {
  return await hasPermission('system.admin');
}

// Get user's CMS permissions summary
export async function getCmsPermissionsSummary(): Promise<ApiResponse<{
  canReadPages: boolean;
  canWritePages: boolean;
  canPublishPages: boolean;
  canReadBlocks: boolean;
  canWriteBlocks: boolean;
  canPublishBlocks: boolean;
  canReadMenus: boolean;
  canWriteMenus: boolean;
  canPublishMenus: boolean;
  canReadAssets: boolean;
  canWriteAssets: boolean;
  canPublishAssets: boolean;
  canAccessAnalytics: boolean;
  canAccessLeads: boolean;
  canManageUsers: boolean;
  isAdmin: boolean;
}>> {
  try {
    const [
      canReadPages,
      canWritePages,
      canPublishPages,
      canReadBlocks,
      canWriteBlocks,
      canPublishBlocks,
      canReadMenus,
      canWriteMenus,
      canPublishMenus,
      canReadAssets,
      canWriteAssets,
      canPublishAssets,
      canAccessAnalytics,
      canAccessLeads,
      canManageUsers,
      isAdmin
    ] = await Promise.all([
      hasPermission('cms.pages.read'),
      hasPermission('cms.pages.write'),
      hasPermission('cms.pages.publish'),
      hasPermission('cms.blocks.read'),
      hasPermission('cms.blocks.write'),
      hasPermission('cms.blocks.publish'),
      hasPermission('cms.menus.read'),
      hasPermission('cms.menus.write'),
      hasPermission('cms.menus.publish'),
      hasPermission('cms.assets.read'),
      hasPermission('cms.assets.write'),
      hasPermission('cms.assets.publish'),
      hasPermission('analytics.read'),
      hasPermission('leads.read'),
      hasPermission('users.manage'),
      hasPermission('system.admin')
    ]);

    return {
      data: {
        canReadPages,
        canWritePages,
        canPublishPages,
        canReadBlocks,
        canWriteBlocks,
        canPublishBlocks,
        canReadMenus,
        canWriteMenus,
        canPublishMenus,
        canReadAssets,
        canWriteAssets,
        canPublishAssets,
        canAccessAnalytics,
        canAccessLeads,
        canManageUsers,
        isAdmin
      },
      error: null
    };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
