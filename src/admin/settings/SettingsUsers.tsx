import { useState, useEffect } from 'react';
import { AdminLayout } from '../AdminLayout';
import { Icon } from '@mdi/react';
import { 
  mdiAccountPlus, 
  mdiAccountEdit, 
  mdiDelete, 
  mdiClose,
  mdiCheck,
  mdiShield,
  mdiShieldCheck,
  mdiShieldAlert,
  mdiAccount,
} from '@mdi/js';
import { supabase } from '../../shell/lib/supabase';

interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  created_at: string;
  permissions: string[];
}

interface UserFormData {
  email: string;
  password: string;
  permissions: string[];
}

const PERMISSION_GROUPS = {
  'cms.pages': ['cms.pages.read', 'cms.pages.write', 'cms.pages.publish'],
  'cms.blocks': ['cms.blocks.read', 'cms.blocks.write', 'cms.blocks.publish'],
  'cms.assets': ['cms.assets.read', 'cms.assets.write', 'cms.assets.publish'],
  'cms.menus': ['cms.menus.read', 'cms.menus.write', 'cms.menus.publish'],
  'analytics': ['analytics.read', 'analytics.write'],
  'admin': ['admin.users', 'admin.settings']
};

const PERMISSION_LABELS = {
  'cms.pages.read': 'Read Pages',
  'cms.pages.write': 'Write Pages',
  'cms.pages.publish': 'Publish Pages',
  'cms.blocks.read': 'Read Blocks',
  'cms.blocks.write': 'Write Blocks',
  'cms.blocks.publish': 'Publish Blocks',
  'cms.assets.read': 'Read Assets',
  'cms.assets.write': 'Write Assets',
  'cms.assets.publish': 'Publish Assets',
  'cms.menus.read': 'Read Menus',
  'cms.menus.write': 'Write Menus',
  'cms.menus.publish': 'Publish Menus',
  'analytics.read': 'Read Analytics',
  'analytics.write': 'Write Analytics',
  'admin.users': 'Manage Users',
  'admin.settings': 'Manage Settings'
};

export function SettingsUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    password: '',
    permissions: []
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Get all admin users
      const { data: admins, error: adminsError } = await supabase
        .from('admins')
        .select('id, user_id, created_at');

      if (adminsError) throw adminsError;

      // Get permissions for each admin user
      const usersWithDetails = await Promise.all(
        admins.map(async (admin) => {
          const { data: permissions } = await supabase
            .from('user_permissions')
            .select('permissions')
            .eq('user_id', admin.user_id)
            .single();

          return {
            id: admin.id,
            user_id: admin.user_id,
            email: `User ID: ${admin.user_id}`, // Placeholder since we can't access auth.users
            created_at: admin.created_at,
            permissions: permissions?.permissions || []
          };
        })
      );

      setUsers(usersWithDetails);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    try {
      setSubmitting(true);
      setError(null);

      // Use regular signup to create user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');

      // Add to admins table
      const { error: adminError } = await supabase
        .from('admins')
        .insert({ user_id: authData.user.id });

      if (adminError) throw adminError;

      // Add permissions
      if (formData.permissions.length > 0) {
        const { error: permError } = await supabase
          .from('user_permissions')
          .upsert({
            user_id: authData.user.id,
            permissions: formData.permissions
          }, { onConflict: 'user_id' });

        if (permError) throw permError;
      }

      // Reset form and reload users
      setFormData({ email: '', password: '', permissions: [] });
      setShowAddForm(false);
      await loadUsers();
    } catch (error) {
      console.error('Error adding user:', error);
      setError(error instanceof Error ? error.message : 'Failed to add user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = async () => {
    if (!editingUser) return;

    try {
      setSubmitting(true);
      setError(null);

      // Update permissions
      const { error: permError } = await supabase
        .from('user_permissions')
        .upsert({
          user_id: editingUser.user_id,
          permissions: formData.permissions
        }, { onConflict: 'user_id' });

      if (permError) throw permError;

      // Reset form and reload users
      setFormData({ email: '', password: '', permissions: [] });
      setEditingUser(null);
      await loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      setError(error instanceof Error ? error.message : 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    if (!confirm(`Are you sure you want to remove admin access for ${user.email}? This action cannot be undone.`)) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Delete from admins table (this will cascade to user_permissions)
      const { error: adminError } = await supabase
        .from('admins')
        .delete()
        .eq('user_id', user.user_id);

      if (adminError) throw adminError;

      // Note: User will still exist in auth but won't have admin access
      // To fully delete the user, you'd need server-side admin functions

      await loadUsers();
    } catch (error) {
      console.error('Error removing admin access:', error);
      setError(error instanceof Error ? error.message : 'Failed to remove admin access');
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleIcon = (permissions: string[]) => {
    if (permissions.includes('admin.users') || permissions.includes('admin.settings')) {
      return <Icon path={mdiShieldCheck} className="h-4 w-4 text-red-400" />;
    }
    if (permissions.some(p => p.includes('publish'))) {
      return <Icon path={mdiShield} className="h-4 w-4 text-green-400" />;
    }
    if (permissions.some(p => p.includes('write'))) {
      return <Icon path={mdiShieldAlert} className="h-4 w-4 text-yellow-400" />;
    }
    return <Icon path={mdiAccount} className="h-4 w-4 text-gray-400" />;
  };

  const getRoleLabel = (permissions: string[]) => {
    if (permissions.includes('admin.users') || permissions.includes('admin.settings')) {
      return 'Admin';
    }
    if (permissions.some(p => p.includes('publish'))) {
      return 'Publisher';
    }
    if (permissions.some(p => p.includes('write'))) {
      return 'Editor';
    }
    if (permissions.some(p => p.includes('read'))) {
      return 'Viewer';
    }
    return 'No Access';
  };

  const startEdit = (user: AdminUser) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '', // Don't show password for editing
      permissions: user.permissions
    });
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setFormData({ email: '', password: '', permissions: [] });
    setError(null);
  };

  const cancelAdd = () => {
    setShowAddForm(false);
    setFormData({ email: '', password: '', permissions: [] });
    setError(null);
  };

  if (loading) {
    return (
      <AdminLayout
        title="Users"
        subtitle="Manage user permissions and access"
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Users"
      subtitle="Manage user permissions and access"
      actions={
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Icon path={mdiAccountPlus} size={0.8} />
          Add User
        </button>
      }
    >
      <div className="space-y-6">
        {/* Info message about limitations */}
        <div className="bg-blue-900 border border-blue-700 text-blue-200 px-4 py-3 rounded-md">
          <div className="flex items-start gap-3">
            <Icon path={mdiShieldAlert} className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">User Management Information</p>
              <p className="text-sm mt-1">
                This interface manages admin access and permissions for the CMS system. 
                User accounts are created through the signup process, and you can grant them admin access here.
                The current user (you) should already have admin access to view this page.
              </p>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Users table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center">
                            <Icon path={mdiAccount} className="h-4 w-4 text-gray-300" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.permissions)}
                        <span className="text-sm text-gray-300">{getRoleLabel(user.permissions)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.permissions.slice(0, 3).map((permission) => (
                          <span
                            key={permission}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-700 text-gray-300"
                          >
                            {PERMISSION_LABELS[permission as keyof typeof PERMISSION_LABELS] || permission}
                          </span>
                        ))}
                        {user.permissions.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-600 text-gray-400">
                            +{user.permissions.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => startEdit(user)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          title="Edit user"
                        >
                          <Icon path={mdiAccountEdit} size={0.8} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Delete user"
                        >
                          <Icon path={mdiDelete} size={0.8} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add User Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Add New User</h3>
                <button
                  onClick={cancelAdd}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Icon path={mdiClose} size={1} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="user@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Temporary Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="Temporary password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Permissions
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {Object.entries(PERMISSION_GROUPS).map(([group, permissions]) => (
                      <div key={group} className="border border-gray-600 rounded-md p-3">
                        <div className="text-sm font-medium text-gray-300 mb-2 capitalize">
                          {group.replace('cms.', '').replace('.', ' ')}
                        </div>
                        <div className="space-y-1">
                          {permissions.map((permission) => (
                            <label key={permission} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.permissions.includes(permission)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData(prev => ({
                                      ...prev,
                                      permissions: [...prev.permissions, permission]
                                    }));
                                  } else {
                                    setFormData(prev => ({
                                      ...prev,
                                      permissions: prev.permissions.filter(p => p !== permission)
                                    }));
                                  }
                                }}
                                className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="ml-2 text-sm text-gray-300">
                                {PERMISSION_LABELS[permission as keyof typeof PERMISSION_LABELS] || permission}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={cancelAdd}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUser}
                  disabled={submitting || !formData.email || !formData.password}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <Icon path={mdiCheck} size={0.8} />
                      Add User
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Form */}
        {editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Edit User Permissions</h3>
                <button
                  onClick={cancelEdit}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Icon path={mdiClose} size={1} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-3 py-2 bg-gray-600 text-gray-400 rounded-md border border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Permissions
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {Object.entries(PERMISSION_GROUPS).map(([group, permissions]) => (
                      <div key={group} className="border border-gray-600 rounded-md p-3">
                        <div className="text-sm font-medium text-gray-300 mb-2 capitalize">
                          {group.replace('cms.', '').replace('.', ' ')}
                        </div>
                        <div className="space-y-1">
                          {permissions.map((permission) => (
                            <label key={permission} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.permissions.includes(permission)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData(prev => ({
                                      ...prev,
                                      permissions: [...prev.permissions, permission]
                                    }));
                                  } else {
                                    setFormData(prev => ({
                                      ...prev,
                                      permissions: prev.permissions.filter(p => p !== permission)
                                    }));
                                  }
                                }}
                                className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="ml-2 text-sm text-gray-300">
                                {PERMISSION_LABELS[permission as keyof typeof PERMISSION_LABELS] || permission}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditUser}
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Icon path={mdiCheck} size={0.8} />
                      Update User
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
