// CMS Blocks Component
// Block management interface

import { useState, useMemo } from 'react';
import { AdminLayout } from '../AdminLayout';
import { useBlocks, useBlockManagement } from '../../lib/cms/hooks';
import { useAppSelector } from '../../shell/store/hooks';
import type { Block, ContentFilters, ContentSort } from '../../lib/cms/types';
import { BlockList } from './components/BlockList';
import { BlockEditor } from './components/BlockEditor';
import { Icon } from '@mdi/react';
import { 
  mdiPlus, 
  mdiRefresh, 
  mdiMagnify, 
  mdiClose,
  mdiContentSave,
  mdiFilterVariant
} from '@mdi/js';

type SortKey = 'type' | 'tag' | 'system_key'; // Sort field types

export function CmsBlocks() {
  const { selectedSite, loading: siteLoading, error: siteError } = useAppSelector((state) => state.site);
  const { createBlock, updateBlock, deleteBlock, loading: managementLoading, error: managementError } = useBlockManagement();

  // Debug logging (reduced for production)
  // console.log('🔍 [CmsBlocks] Component rendered');
  // console.log('🔍 [CmsBlocks] selectedSite:', selectedSite);

  // State for filters and sorting
  const [filters, setFilters] = useState<ContentFilters>({});
  const [sort, setSort] = useState<ContentSort>({ field: 'type', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Memoize filters to prevent infinite loops
  const memoizedFilters = useMemo(() => ({
    ...filters,
    search: searchTerm || undefined
  }), [filters, searchTerm, refreshTrigger]);

  // Memoize sort to prevent infinite loops
  const memoizedSort = useMemo(() => sort, [sort.field, sort.direction]);

  // State for modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const [isBlockEditorOpen, setIsBlockEditorOpen] = useState(false);
  const [editingBlockForVersion, setEditingBlockForVersion] = useState<Block | null>(null);

  // Form state for create/edit
  const [formData, setFormData] = useState({
    type: '',
    tag: '',
    system_key: '',
    is_system: false
  });

  // Debug form data changes (reduced for production)
  // useEffect(() => {
  //   console.log('📝 [CmsBlocks] formData changed:', formData);
  // }, [formData]);

  // Refresh function
  const handleRefresh = () => {
    console.log('🔄 [CmsBlocks] Refreshing blocks list');
    setRefreshTrigger(prev => prev + 1);
  };

  // Fetch blocks - only if we have a site
  const { blocks, loading, error } = useBlocks(
    selectedSite?.id || '',
    memoizedFilters,
    memoizedSort,
    currentPage,
    20
  );

  // Show loading state while sites are being fetched
  if (siteLoading) {
    return (
      <AdminLayout
        pageHeader={
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">Content Blocks</h1>
            <p className="text-gray-400 mt-1">Loading sites...</p>
          </div>
        }
      >
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Show error state if site loading failed
  if (siteError) {
    return (
      <AdminLayout
        pageHeader={
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">Content Blocks</h1>
            <p className="text-gray-400 mt-1">Error loading sites</p>
          </div>
        }
      >
        <div className="p-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-white mb-2">Error Loading Sites</h3>
            <p className="text-gray-400">{siteError}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Show no site selected state
  if (!selectedSite) {
    return (
      <AdminLayout
        pageHeader={
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">Content Blocks</h1>
            <p className="text-gray-400 mt-1">No site selected</p>
          </div>
        }
      >
        <div className="p-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-white mb-2">No Site Selected</h3>
            <p className="text-gray-400">Please select a site from the dropdown in the header to access CMS features.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<ContentFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  // Handle sort changes
  const handleSort = (field: SortKey) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle create block
  const handleCreateBlock = async () => {
    console.log('🆕 [CmsBlocks] handleCreateBlock called');
    console.log('🆕 [CmsBlocks] selectedSite:', selectedSite);
    console.log('🆕 [CmsBlocks] formData:', formData);
    
    if (!selectedSite) {
      console.error('❌ [CmsBlocks] No selected site available');
      return;
    }

    if (!formData.type) {
      console.error('❌ [CmsBlocks] No block type provided');
      return;
    }

    console.log('🆕 [CmsBlocks] Calling createBlock with data:', {
      site_id: selectedSite.id,
      type: formData.type,
      tag: formData.tag || undefined,
      system_key: formData.system_key || undefined,
      is_system: formData.is_system
    });

    const newBlock = await createBlock({
      site_id: selectedSite.id,
      type: formData.type,
      tag: formData.tag || undefined,
      system_key: formData.system_key || undefined,
      is_system: formData.is_system
    });

    console.log('🆕 [CmsBlocks] createBlock result:', newBlock);

    if (newBlock) {
      console.log('✅ [CmsBlocks] Block created successfully, closing modal');
      setIsCreateModalOpen(false);
      setFormData({ type: '', tag: '', system_key: '', is_system: false });
      handleRefresh(); // Refresh the blocks list
    } else {
      console.error('❌ [CmsBlocks] Block creation failed');
    }
  };

  // Handle edit block
  const handleEditBlock = async () => {
    if (!editingBlock) return;

    const updatedBlock = await updateBlock(editingBlock.id, {
      type: formData.type,
      tag: formData.tag || undefined,
      system_key: formData.system_key || undefined,
      is_system: formData.is_system
    });

    if (updatedBlock) {
      setIsEditModalOpen(false);
      setEditingBlock(null);
      setFormData({ type: '', tag: '', system_key: '', is_system: false });
      handleRefresh(); // Refresh the blocks list
    }
  };

  // Handle delete block
  const handleDeleteBlock = async (block: Block) => {
    if (window.confirm(`Are you sure you want to delete the block "${block.type}"?`)) {
      const deleted = await deleteBlock(block.id);
      if (deleted) {
        console.log('✅ [CmsBlocks] Block deleted successfully');
        handleRefresh(); // Refresh the blocks list
      } else {
        console.error('❌ [CmsBlocks] Block deletion failed');
      }
    }
  };

  // Open edit modal
  const openEditModal = (block: Block) => {
    setEditingBlock(block);
    setFormData({
      type: block.type,
      tag: block.tag || '',
      system_key: block.system_key || '',
      is_system: block.is_system
    });
    setIsEditModalOpen(true);
  };

  // Open block editor for version management
  const openBlockEditor = (block: Block) => {
    setEditingBlockForVersion(block);
    setIsBlockEditorOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({ type: '', tag: '', system_key: '', is_system: false });
    setEditingBlock(null);
  };

  // Close modals
  const closeModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    resetForm();
  };

  return (
    <AdminLayout
      pageHeader={
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Content Blocks</h1>
            <p className="text-gray-400 mt-1">Manage reusable content blocks</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Icon path={mdiPlus} size={0.8} />
            New Block
          </button>
        </div>
      }
    >
      <div className="p-6">
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Icon 
                path={mdiMagnify} 
                size={1} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
              />
              <input
                type="text"
                placeholder="Search blocks by type, tag, or system key..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              <Icon path={mdiFilterVariant} size={0.8} />
              Filters
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              <Icon path={mdiRefresh} size={0.8} />
              Refresh
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-gray-800 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <Icon path={mdiClose} size={1} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    System Blocks
                  </label>
                  <select
                    value={filters.is_system === undefined ? '' : filters.is_system.toString()}
                    onChange={(e) => handleFilterChange({ 
                      is_system: e.target.value === '' ? undefined : e.target.value === 'true' 
                    })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">All Blocks</option>
                    <option value="true">System Blocks</option>
                    <option value="false">User Blocks</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Block Type
                  </label>
                  <input
                    type="text"
                    placeholder="Filter by type..."
                    value={filters.type || ''}
                    onChange={(e) => handleFilterChange({ type: e.target.value || undefined })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tag
                  </label>
                  <input
                    type="text"
                    placeholder="Filter by tag..."
                    value={filters.search || ''}
                    onChange={(e) => handleFilterChange({ search: e.target.value || undefined })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {managementError && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-500 rounded-md">
            <p className="text-red-400">{managementError}</p>
          </div>
        )}

        {/* Blocks List */}
        <BlockList
          blocks={blocks}
          loading={loading}
          error={error}
          onEdit={openEditModal}
          onEditVersions={openBlockEditor}
          onDelete={handleDeleteBlock}
          sort={sort}
          onSort={handleSort}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />

        {/* Create Block Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Create New Block</h2>
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
                    Block Type *
                  </label>
                  <input
                    type="text"
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="e.g., hero, features, cta"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tag
                  </label>
                  <input
                    type="text"
                    value={formData.tag}
                    onChange={(e) => setFormData(prev => ({ ...prev, tag: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="Optional tag for organization"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    System Key
                  </label>
                  <input
                    type="text"
                    value={formData.system_key}
                    onChange={(e) => setFormData(prev => ({ ...prev, system_key: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="Optional system key for programmatic access"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_system"
                    checked={formData.is_system}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_system: e.target.checked }))}
                    className="mr-2"
                  />
                  <label htmlFor="is_system" className="text-sm text-gray-300">
                    System Block (protected from deletion)
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
                  onClick={() => {
                    console.log('🖱️ [CmsBlocks] Create button clicked');
                    console.log('🖱️ [CmsBlocks] Button disabled state:', !formData.type || managementLoading);
                    console.log('🖱️ [CmsBlocks] formData.type:', formData.type);
                    console.log('🖱️ [CmsBlocks] managementLoading:', managementLoading);
                    handleCreateBlock();
                  }}
                  disabled={!formData.type || managementLoading}
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
                      Create Block
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Block Modal */}
        {isEditModalOpen && editingBlock && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Edit Block</h2>
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
                    Block Type *
                  </label>
                  <input
                    type="text"
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="e.g., hero, features, cta"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tag
                  </label>
                  <input
                    type="text"
                    value={formData.tag}
                    onChange={(e) => setFormData(prev => ({ ...prev, tag: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="Optional tag for organization"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    System Key
                  </label>
                  <input
                    type="text"
                    value={formData.system_key}
                    onChange={(e) => setFormData(prev => ({ ...prev, system_key: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="Optional system key for programmatic access"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_system_edit"
                    checked={formData.is_system}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_system: e.target.checked }))}
                    className="mr-2"
                  />
                  <label htmlFor="is_system_edit" className="text-sm text-gray-300">
                    System Block (protected from deletion)
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
                  onClick={handleEditBlock}
                  disabled={!formData.type || managementLoading}
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
                      Update Block
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Block Editor Modal */}
        {editingBlockForVersion && (
          <BlockEditor
            block={editingBlockForVersion}
            isOpen={isBlockEditorOpen}
            onClose={() => {
              setIsBlockEditorOpen(false);
              setEditingBlockForVersion(null);
            }}
            onSave={(version) => {
              console.log('✅ [CmsBlocks] Block version saved:', version);
              handleRefresh(); // Refresh the blocks list
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
}
