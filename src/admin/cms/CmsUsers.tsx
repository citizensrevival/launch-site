// CMS Users Management Component
// This component provides the interface for managing user permissions

import React, { useState } from 'react';
import { useUserPermissionsManagement, useAdminAccess } from '../../lib/cms/permissionsHooks';
import { Permission, UserPermissions } from '../../lib/cms/types';

export function CmsUsers() {
  const [selectedUser, setSelectedUser] = useState<UserPermissions | null>(null);
  const [showAddUserForm, setShowAddUserForm] = useState(false);

  const {
    users,
    loading,
    error,
    updatePermissions,
    addPermission,
    removePermission,
    refresh
  } = useUserPermissionsManagement();

  const {
    canAccess,
    loading: accessLoading,
    error: accessError
  } = useAdminAccess();

  const handleUpdatePermissions = async (userId: string, permissions: Permission[]) => {
    const success = await updatePermissions(userId, permissions);
    if (success) {
      setSelectedUser(null);
    }
    return success;
  };

  const handleAddPermission = async (userId: string, permission: Permission) => {
    const success = await addPermission(userId, permission);
    if (success && selectedUser?.userId === userId) {
      // Refresh selected user data
      const updatedUser = users.find(u => u.userId === userId);
      if (updatedUser) {
        setSelectedUser(updatedUser);
      }
    }
    return success;
  };

  const handleRemovePermission = async (userId: string, permission: Permission) => {
    const success = await removePermission(userId, permission);
    if (success && selectedUser?.userId === userId) {
      // Refresh selected user data
      const updatedUser = users.find(u => u.userId === userId);
      if (updatedUser) {
        setSelectedUser(updatedUser);
      }
    }
    return success;
  };

  if (accessLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Checking access...</span>
      </div>
    );
  }

  if (accessError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">Error checking access: {accessError}</div>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="text-yellow-800">You don't have permission to access user management.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">User Permissions Management</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAddUserForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add User
          </button>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">Error loading users: {error}</div>
        </div>
      )}

      {/* Add User Form */}
      {showAddUserForm && (
        <AddUserForm
          onClose={() => setShowAddUserForm(false)}
          onAddUser={(userId, permissions) => {
            handleUpdatePermissions(userId, permissions);
            setShowAddUserForm(false);
          }}
        />
      )}

      {/* Users List */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Users</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {users.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No users found. Add a user to get started.
            </div>
          ) : (
            users.map((user) => (
              <UserItem
                key={user.userId}
                user={user}
                isSelected={selectedUser?.userId === user.userId}
                onSelect={() => setSelectedUser(user)}
              />
            ))
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <UserPermissionsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdatePermissions={handleUpdatePermissions}
          onAddPermission={handleAddPermission}
          onRemovePermission={handleRemovePermission}
        />
      )}
    </div>
  );
}

// User Item Component
interface UserItemProps {
  user: UserPermissions;
  isSelected: boolean;
  onSelect: () => void;
}

function UserItem({ user, isSelected, onSelect }: UserItemProps) {
  const permissionCount = user.permissions.length;
  const isAdmin = user.permissions.includes('system.admin');

  return (
    <div
      className={`px-6 py-4 cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-blue-50 border-r-2 border-blue-600' : ''}`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h4 className="text-sm font-medium text-gray-900">{user.userId}</h4>
            {isAdmin && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Admin
              </span>
            )}
          </div>
          <div className="mt-1 text-sm text-gray-500">
            {permissionCount} permission{permissionCount !== 1 ? 's' : ''}
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Created {new Date(user.grantedAt).toLocaleDateString()}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {permissionCount} permissions
          </span>
        </div>
      </div>
    </div>
  );
}

// Add User Form Component
interface AddUserFormProps {
  onClose: () => void;
  onAddUser: (userId: string, permissions: Permission[]) => void;
}

function AddUserForm({ onClose, onAddUser }: AddUserFormProps) {
  const [userId, setUserId] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allPermissions: Permission[] = [
    'cms.pages.read',
    'cms.pages.write',
    'cms.pages.publish',
    'cms.blocks.read',
    'cms.blocks.write',
    'cms.blocks.publish',
    'cms.menus.read',
    'cms.menus.write',
    'cms.menus.publish',
    'cms.assets.read',
    'cms.assets.write',
    'cms.assets.publish',
    'analytics.read',
    'leads.read',
    'leads.write',
    'users.manage',
    'system.admin'
  ];

  const handlePermissionToggle = (permission: Permission) => {
    setSelectedPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim()) return;

    setLoading(true);
    setError(null);

    try {
      onAddUser(userId.trim(), selectedPermissions);
      setUserId('');
      setSelectedPermissions([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }

    setLoading(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Add User</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="user-id" className="block text-sm font-medium text-gray-700 mb-1">
            User ID *
          </label>
          <input
            id="user-id"
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter user ID"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Permissions
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
            {allPermissions.map((permission) => (
              <label key={permission} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedPermissions.includes(permission)}
                  onChange={() => handlePermissionToggle(permission)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{permission}</span>
              </label>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add User'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// User Permissions Modal Component
interface UserPermissionsModalProps {
  user: UserPermissions;
  onClose: () => void;
  onUpdatePermissions: (userId: string, permissions: Permission[]) => Promise<boolean>;
  onAddPermission: (userId: string, permission: Permission) => Promise<boolean>;
  onRemovePermission: (userId: string, permission: Permission) => Promise<boolean>;
}

function UserPermissionsModal({ user, onClose, onUpdatePermissions, onRemovePermission }: UserPermissionsModalProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>(user.permissions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allPermissions: Permission[] = [
    'cms.pages.read',
    'cms.pages.write',
    'cms.pages.publish',
    'cms.blocks.read',
    'cms.blocks.write',
    'cms.blocks.publish',
    'cms.menus.read',
    'cms.menus.write',
    'cms.menus.publish',
    'cms.assets.read',
    'cms.assets.write',
    'cms.assets.publish',
    'analytics.read',
    'leads.read',
    'leads.write',
    'users.manage',
    'system.admin'
  ];

  const handlePermissionToggle = (permission: Permission) => {
    setSelectedPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    const success = await onUpdatePermissions(user.userId, selectedPermissions);
    
    if (success) {
      onClose();
    } else {
      setError('Failed to update permissions');
    }

    setLoading(false);
  };


  const handleRemovePermission = async (permission: Permission) => {
    setLoading(true);
    setError(null);

    const success = await onRemovePermission(user.userId, permission);
    
    if (!success) {
      setError('Failed to remove permission');
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Permissions for {user.userId}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Current Permissions</h4>
            <div className="flex flex-wrap gap-2">
              {user.permissions.map((permission) => (
                <span
                  key={permission}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {permission}
                  <button
                    onClick={() => handleRemovePermission(permission)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Available Permissions</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
              {allPermissions.map((permission) => (
                <label key={permission} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(permission)}
                    onChange={() => handlePermissionToggle(permission)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{permission}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}