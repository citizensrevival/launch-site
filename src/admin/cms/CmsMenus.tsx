// CMS Menus Component
// Menu management interface

import { useState, useMemo } from 'react';
import { AdminLayout } from '../AdminLayout';
import { useMenus, useMenuManagement } from './menus/hooks/useMenus';
import { useAppSelector } from '../store/hooks';
import type { Menu } from './menus/types/menu.types';
import { MenuList } from './components/MenuList';
import { MenuEditor } from './components/MenuEditor';
import { Icon } from '@mdi/react';
import { 
  mdiPlus, 
  mdiRefresh, 
  mdiMagnify, 
  mdiClose,
  mdiContentSave,
} from '@mdi/js';

type SortKey = 'handle' | 'label' | 'system_key';

export function CmsMenus() {
  const { selectedSite, loading: siteLoading, error: siteError } = useAppSelector((state: any) => state.site);
  const { loading: managementLoading, error: managementError } = useMenuManagement();
  
  // Stub functions - TODO: Implement proper menu management functionality
  const createMenu = async (data: any) => {
    console.log('Create menu:', data);
    return { success: true };
  };
  
  const updateMenu = async (id: string, data: any) => {
    console.log('Update menu:', id, data);
    return { success: true };
  };
  
  const deleteMenu = async (id: string) => {
    console.log('Delete menu:', id);
    return { success: true };
  };

  // State for menus
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortKey>('handle');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [showMenuEditor, setShowMenuEditor] = useState(false);
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    handle: '',
    label: '',
    // system_key: '', // TODO: Implement proper system key functionality
    // is_system: false // TODO: Implement proper system menu functionality
  });

  // Get menus with filters and sorting
  const filters: Record<string, any> = useMemo(() => ({
    search: searchTerm || undefined,
    is_system: undefined
  }), [searchTerm]);

  const sort: { field: 'handle' | 'label' | 'created_at' | 'updated_at'; direction: 'asc' | 'desc' } = useMemo(() => ({
    field: sortField as 'handle' | 'label' | 'created_at' | 'updated_at',
    direction: sortDirection
  }), [sortField, sortDirection]);

  const { menus, loading: menusLoading, error: menusError, refresh: refreshMenus } = useMenus(
    filters,
    sort,
    pageSize
  );

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // Handle sorting
  const handleSort = (field: SortKey) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Handle refresh
  const handleRefresh = () => {
    refreshMenus();
    setCurrentPage(1);
  };

  // Handle create menu
  const handleCreateMenu = async () => {
    if (!selectedSite) {
      console.error('❌ [CmsMenus] No selected site available');
      return;
    }

    if (!formData.handle || !formData.label) {
      console.error('❌ [CmsMenus] Missing required fields');
      return;
    }

    console.log('🆕 [CmsMenus] Calling createMenu with data:', {
      site_id: selectedSite.id,
      handle: formData.handle,
      label: formData.label,
      // system_key: formData.system_key || undefined, // TODO: Implement proper system key functionality
      // is_system: formData.is_system // TODO: Implement proper system menu functionality
    });

    const created = await createMenu({
      site_id: selectedSite.id,
      handle: formData.handle,
      label: formData.label,
      // system_key: formData.system_key || undefined, // TODO: Implement proper system key functionality
      // is_system: formData.is_system // TODO: Implement proper system menu functionality
    });

    if (created) {
      console.log('✅ [CmsMenus] Menu created successfully');
      closeModals();
      handleRefresh();
    } else {
      console.error('❌ [CmsMenus] Failed to create menu');
    }
  };

  // Handle update menu
  const handleUpdateMenu = async () => {
    if (!editingMenu) return;

    const updated = await updateMenu(editingMenu.id, {
      handle: formData.handle,
      label: formData.label,
      // system_key: formData.system_key || undefined, // TODO: Implement proper system key functionality
      // is_system: formData.is_system // TODO: Implement proper system menu functionality
    });

    if (updated) {
      console.log('✅ [CmsMenus] Menu updated successfully');
      closeModals();
      handleRefresh();
    } else {
      console.error('❌ [CmsMenus] Failed to update menu');
    }
  };

  // Handle delete menu
  const handleDeleteMenu = async (menu: Menu) => {
    if (window.confirm(`Are you sure you want to delete the menu "${menu.label}"?`)) {
      const deleted = await deleteMenu(menu.id);
      if (deleted) {
        console.log('✅ [CmsMenus] Menu deleted successfully');
        handleRefresh();
      } else {
        console.error('❌ [CmsMenus] Failed to delete menu');
      }
    }
  };

  // Open edit modal
  const openEditModal = (menu: Menu) => {
    setEditingMenu(menu);
    setFormData({
      handle: menu.handle,
      label: menu.label,
      // system_key: menu.system_key || '', // TODO: Implement proper system key functionality
      // is_system: menu.is_system // TODO: Implement proper system menu functionality
    });
    setIsEditModalOpen(true);
  };

  // Open menu editor
  const openMenuEditor = (menu: Menu) => {
    setEditingMenuId(menu.id);
    setShowMenuEditor(true);
  };

  // Close all modals
  const closeModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setEditingMenu(null);
    setShowMenuEditor(false);
    setEditingMenuId(null);
    setFormData({
      handle: '',
      label: '',
      // system_key: '', // TODO: Implement proper system key functionality
      // is_system: false // TODO: Implement proper system menu functionality
    });
  };

  // Loading state
  if (siteLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  // Error state
  if (siteError) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="bg-red-900 border border-red-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-300 mb-2">Error Loading Site</h3>
            <p className="text-red-300">{siteError}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // No site selected
  if (!selectedSite) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-300 mb-2">No Site Selected</h3>
            <p className="text-yellow-300">Please select a site to manage menus.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Menus"
      subtitle="Manage navigation menus"
      actions={
        <div className="flex items-center gap-4">
          <button
            onClick={handleRefresh}
            className="text-gray-400 hover:text-white transition-colors"
            title="Refresh"
          >
            <Icon path={mdiRefresh} size={1} />
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Icon path={mdiPlus} size={0.8} />
            New Menu
          </button>
        </div>
      }
    >
      <div className="p-6">
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="relative">
            <Icon 
              path={mdiMagnify} 
              size={1} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
            />
            <input
              type="text"
              placeholder="Search menus by handle, label, or system key..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Error Display */}
        {(menusError || managementError) && (
          <div className="mb-4 p-4 bg-red-900 border border-red-700 rounded-lg">
            <h3 className="text-lg font-semibold text-red-300 mb-2">Error</h3>
            <p className="text-red-300">{menusError || managementError}</p>
          </div>
        )}

        {/* Menus List */}
        <MenuList
          menus={menus || []}
          loading={menusLoading}
          onEdit={openEditModal}
          onDelete={handleDeleteMenu}
          onEditItems={openMenuEditor}
          onSort={handleSort}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />

        {/* Create Menu Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Create New Menu</h2>
                <button
                  onClick={closeModals}
                  className="text-gray-400 hover:text-white"
                >
                  <Icon path={mdiClose} size={1} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Handle *
                  </label>
                  <input
                    type="text"
                    value={formData.handle}
                    onChange={(e) => setFormData(prev => ({ ...prev, handle: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="e.g., main-navigation"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Label *
                  </label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="e.g., Main Navigation"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    System Key
                  </label>
                  <input
                    type="text"
                    // value={formData.system_key}
                    // onChange={(e) => setFormData(prev => ({ ...prev, system_key: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="Optional system key for programmatic access"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_system"
                    // checked={formData.is_system}
                    // onChange={(e) => setFormData(prev => ({ ...prev, is_system: e.target.checked }))}
                    className="mr-2"
                  />
                  <label htmlFor="is_system" className="text-sm text-gray-300">
                    System Menu (protected from deletion)
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={closeModals}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateMenu}
                  disabled={!formData.handle || !formData.label || managementLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {managementLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Icon path={mdiContentSave} size={0.8} />
                      Create Menu
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Menu Modal */}
        {isEditModalOpen && editingMenu && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Edit Menu</h2>
                <button
                  onClick={closeModals}
                  className="text-gray-400 hover:text-white"
                >
                  <Icon path={mdiClose} size={1} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Handle *
                  </label>
                  <input
                    type="text"
                    value={formData.handle}
                    onChange={(e) => setFormData(prev => ({ ...prev, handle: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Label *
                  </label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    System Key
                  </label>
                  <input
                    type="text"
                    // value={formData.system_key}
                    // onChange={(e) => setFormData(prev => ({ ...prev, system_key: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_system_edit"
                    // checked={formData.is_system}
                    // onChange={(e) => setFormData(prev => ({ ...prev, is_system: e.target.checked }))}
                    className="mr-2"
                  />
                  <label htmlFor="is_system_edit" className="text-sm text-gray-300">
                    System Menu (protected from deletion)
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={closeModals}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateMenu}
                  disabled={!formData.handle || !formData.label || managementLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {managementLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Icon path={mdiContentSave} size={0.8} />
                      Update Menu
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Menu Editor Modal */}
        {showMenuEditor && editingMenuId && (
          <MenuEditor
            menuId={editingMenuId}
            isOpen={showMenuEditor}
            onClose={closeModals}
          />
        )}
      </div>
    </AdminLayout>
  );
}