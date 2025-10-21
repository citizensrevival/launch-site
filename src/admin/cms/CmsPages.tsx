// CMS Pages Component
// Page management interface

import { useState, useMemo } from 'react';
import { AdminLayout } from '../AdminLayout';
import { usePages, usePageManagement } from '../../lib/cms/hooks';
import { useAppSelector } from '../../shell/store/hooks';
import type { Page, PageVersion, PublishStatus } from '../../lib/cms/types';
import { PageVersionEditor } from './PageVersionEditor';
import { PageVersionHistory } from './components/PageVersionHistory';
import { Icon } from '@mdi/react';
import { 
  mdiPlus, 
  mdiRefresh, 
  mdiMagnify, 
  mdiChevronUp, 
  mdiChevronDown,
  mdiPencil,
  mdiTrashCanOutline,
  mdiFileDocumentOutline,
  mdiShieldCheckOutline,
  mdiClose,
  mdiContentSave,
  mdiKey,
  mdiHistory
} from '@mdi/js';
import { Tooltip } from '../../shell/Tooltip';

type SortKey = 'slug';
type SortDirection = 'asc' | 'desc';

export function CmsPages() {
  const selectedSite = useAppSelector((state) => state.site.selectedSite);
  const siteId = selectedSite?.id || '';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PublishStatus | ''>('');
  const [isSystemFilter, setIsSystemFilter] = useState<boolean | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('slug');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showNewPageDialog, setShowNewPageDialog] = useState(false);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [showPageVersionEditor, setShowPageVersionEditor] = useState(false);
  const [showPageVersionHistory, setShowPageVersionHistory] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const filters = useMemo(() => ({
    search: searchTerm || undefined,
    status: statusFilter || undefined,
    is_system: isSystemFilter ?? undefined,
  }), [searchTerm, statusFilter, isSystemFilter, refreshTrigger]);

  const sort = useMemo(() => ({
    field: sortKey,
    direction: sortDirection
  }), [sortKey, sortDirection]);

  // usePages takes: (siteId, filters, sort, page, pageSize)
  const { pages: pagesData, loading, error } = usePages(
    siteId,
    filters,
    sort,
    1,
    100
  );

  const pages = pagesData?.data || [];

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleEditPageVersion = (page: Page) => {
    setSelectedPage(page);
    setShowPageVersionEditor(true);
  };

  const handlePageVersionSaved = (version: PageVersion) => {
    console.log('Page version saved:', version);
    setShowPageVersionEditor(false);
    setSelectedPage(null);
    handleRefresh(); // Refresh the page list
  };

  const handleClosePageVersionEditor = () => {
    setShowPageVersionEditor(false);
    setSelectedPage(null);
  };

  const handleShowPageVersionHistory = (page: Page) => {
    setSelectedPage(page);
    setShowPageVersionHistory(true);
  };

  const handleClosePageVersionHistory = () => {
    setShowPageVersionHistory(false);
    setSelectedPage(null);
  };

  const handleVersionRestored = (version: PageVersion) => {
    console.log('Version restored:', version);
    setShowPageVersionHistory(false);
    setSelectedPage(null);
    handleRefresh(); // Refresh the page list
  };

  const changeSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const pageHeader = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search pages..."
            className="w-64 px-3 py-1 pl-9 rounded-full bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <Icon path={mdiMagnify} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>

        {/* Filter chips */}
        <Tooltip content="Filter by draft pages">
          <button
            onClick={() => setStatusFilter(statusFilter === 'draft' ? '' : 'draft')}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm transition-colors ${
              statusFilter === 'draft'
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <Icon path={mdiFileDocumentOutline} className="h-4 w-4" />
            <span>Draft</span>
          </button>
        </Tooltip>
        <Tooltip content="Filter by published pages">
          <button
            onClick={() => setStatusFilter(statusFilter === 'published' ? '' : 'published')}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm transition-colors ${
              statusFilter === 'published'
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <Icon path={mdiShieldCheckOutline} className="h-4 w-4" />
            <span>Published</span>
          </button>
        </Tooltip>
        <Tooltip content="Filter by system pages">
          <button
            onClick={() => setIsSystemFilter(isSystemFilter === true ? null : true)}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm transition-colors ${
              isSystemFilter === true
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <Icon path={mdiKey} className="h-4 w-4" />
            <span>System</span>
          </button>
        </Tooltip>
      </div>
      <div className="flex items-center gap-2">
        <Tooltip content="Refresh pages">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="rounded-md bg-purple-600 p-2 text-sm text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon path={mdiRefresh} className={`h-5 w-5 text-white ${loading ? 'animate-spin' : ''}`} />
          </button>
        </Tooltip>
        <Tooltip content="Create new page">
          <button
            type="button"
            onClick={() => setShowNewPageDialog(true)}
            className="rounded-md bg-purple-600 px-3 py-2 text-sm text-white hover:bg-purple-700 inline-flex items-center gap-2"
          >
            <Icon path={mdiPlus} className="h-4 w-4 text-white" />
            <span>New&nbsp;Page</span>
          </button>
        </Tooltip>
      </div>
    </div>
  );

  const headerCell = (label: string, key: SortKey) => (
    <th className="sticky top-0 z-10 bg-gray-800 px-3 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider">
      <Tooltip content={`Sort by ${label.toLowerCase()}`}>
        <button className="inline-flex items-center gap-1 hover:text-white" onClick={() => changeSort(key)}>
          <span>{label}</span>
          {sortKey === key ? (
            <Icon path={sortDirection === 'asc' ? mdiChevronUp : mdiChevronDown} className="h-3 w-3" />
          ) : null}
        </button>
      </Tooltip>
    </th>
  );

  return (
    <AdminLayout pageHeader={pageHeader}>
      {error && (
        <div className="mb-4 bg-red-900/20 border border-red-800 rounded-lg p-4">
          <p className="text-red-400">Error loading pages: {error}</p>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-lg overflow-hidden border border-gray-800">
        <div className="overflow-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead>
              <tr>
                {headerCell('Slug', 'slug')}
                <th className="sticky top-0 z-10 bg-gray-800 px-3 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  System
                </th>
                <th className="sticky top-0 z-10 bg-gray-800 px-3 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  System Key
                </th>
                <th className="sticky top-0 z-10 bg-gray-800 px-3 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Versions
                </th>
                <th className="sticky top-0 z-10 bg-gray-800 px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {pages.length === 0 && !loading ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center">
                    <div className="text-gray-400">
                      {searchTerm || statusFilter || isSystemFilter !== null
                        ? 'No pages match your filters'
                        : 'No pages yet. Create your first page!'}
                    </div>
                  </td>
                </tr>
              ) : (
                pages.map((page) => (
                  <tr key={page.id} className="hover:bg-gray-800/60">
                    <td className="px-3 py-2 text-white font-medium">
                      /{page.slug}
                    </td>
                    <td className="px-3 py-2">
                      {page.is_system ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-purple-900/30 text-purple-400 border border-purple-800">
                          <Icon path={mdiKey} className="h-3 w-3" />
                          System
                        </span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-gray-300">
                      {page.system_key || <span className="text-gray-500">—</span>}
                    </td>
                    <td className="px-3 py-2 text-gray-400">
                      {/* TODO: Show version count once we fetch it */}
                      <span className="text-gray-500">—</span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip content="Edit page version">
                          <button 
                            className="p-2 rounded hover:bg-gray-800" 
                            aria-label="Edit page version"
                            onClick={() => handleEditPageVersion(page)}
                          >
                            <Icon path={mdiPencil} className="h-5 w-5 text-white" />
                          </button>
                        </Tooltip>
                        <Tooltip content="View version history">
                          <button 
                            className="p-2 rounded hover:bg-gray-800" 
                            aria-label="View version history"
                            onClick={() => handleShowPageVersionHistory(page)}
                          >
                            <Icon path={mdiHistory} className="h-5 w-5 text-white" />
                          </button>
                        </Tooltip>
                        <Tooltip content="Delete page">
                          <button 
                            className="p-2 rounded hover:bg-gray-800" 
                            aria-label="Delete page"
                            onClick={() => {
                              // TODO: Implement delete
                              console.log('Delete page:', page.id);
                            }}
                          >
                            <Icon path={mdiTrashCanOutline} className="h-5 w-5 text-red-400" />
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile List View */}
      <div className="md:hidden space-y-2">
        {pages.length === 0 && !loading ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <div className="text-gray-400">
              {searchTerm || statusFilter || isSystemFilter !== null
                ? 'No pages match your filters'
                : 'No pages yet. Create your first page!'}
            </div>
          </div>
        ) : (
          pages.map((page) => (
            <div
              key={page.id}
              className="bg-gray-900 rounded-lg border border-gray-800 p-4 hover:bg-gray-800/60 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium truncate">
                    /{page.slug}
                  </div>
                  {page.system_key && (
                    <div className="text-gray-400 text-sm truncate mt-1">
                      {page.system_key}
                    </div>
                  )}
                  {page.is_system && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-purple-900/30 text-purple-400 border border-purple-800 mt-2">
                      <Icon path={mdiKey} className="h-3 w-3" />
                      System
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-3">
                  <Tooltip content="Edit page version">
                    <button
                      onClick={() => handleEditPageVersion(page)}
                      className="p-2 rounded hover:bg-gray-700"
                      aria-label="Edit page version"
                    >
                      <Icon path={mdiPencil} className="h-5 w-5 text-white" />
                    </button>
                  </Tooltip>
                  <Tooltip content="View version history">
                    <button
                      onClick={() => handleShowPageVersionHistory(page)}
                      className="p-2 rounded hover:bg-gray-700"
                      aria-label="View version history"
                    >
                      <Icon path={mdiHistory} className="h-5 w-5 text-white" />
                    </button>
                  </Tooltip>
                  <Tooltip content="Delete page">
                    <button
                      onClick={() => {
                        // TODO: Implement delete
                        console.log('Delete page:', page.id);
                      }}
                      className="p-2 rounded hover:bg-gray-700"
                      aria-label="Delete page"
                    >
                      <Icon path={mdiTrashCanOutline} className="h-5 w-5 text-red-400" />
                    </button>
                  </Tooltip>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-8">
          <Icon path={mdiRefresh} className="h-8 w-8 text-purple-500 animate-spin" />
        </div>
      )}

      {/* New Page Dialog */}
      {showNewPageDialog && (
        <NewPageDialog
          siteId={siteId}
          onClose={() => setShowNewPageDialog(false)}
          onSuccess={() => {
            setShowNewPageDialog(false);
            handleRefresh();
          }}
        />
      )}

      {/* Edit Page Dialog */}
      {selectedPage && !showPageVersionEditor && (
        <EditPageDialog
          page={selectedPage}
          onClose={() => setSelectedPage(null)}
          onSuccess={() => {
            setSelectedPage(null);
            handleRefresh();
          }}
          onDelete={() => {
            setSelectedPage(null);
            handleRefresh();
          }}
        />
      )}

      {/* Page Version Editor */}
      {selectedPage && showPageVersionEditor && (
        <PageVersionEditor
          page={selectedPage}
          onClose={handleClosePageVersionEditor}
          onSave={handlePageVersionSaved}
        />
      )}

      {/* Page Version History */}
      {selectedPage && showPageVersionHistory && (
        <PageVersionHistory
          page={selectedPage}
          onClose={handleClosePageVersionHistory}
          onRestore={handleVersionRestored}
        />
      )}
    </AdminLayout>
  );
}

// New Page Dialog Component
function NewPageDialog({ 
  siteId, 
  onClose, 
  onSuccess 
}: { 
  siteId: string; 
  onClose: () => void; 
  onSuccess: () => void; 
}) {
  const { createPage } = usePageManagement();
  const [slug, setSlug] = useState('');
  const [systemKey, setSystemKey] = useState('');
  const [isSystem, setIsSystem] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug.trim()) return;

    setSaving(true);
    setError(null);

    try {
      const result = await createPage({
        site_id: siteId,
        slug: slug.trim(),
        is_system: isSystem,
        system_key: systemKey.trim() || undefined,
      });

      if (result) {
        console.log('Page created successfully:', result);
        onSuccess();
      } else {
        const errorMsg = 'Failed to create page. Please try again.';
        console.error('Page creation failed:', errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      console.error('Error creating page:', err);
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-md">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
            <h2 className="text-white font-semibold">Create New Page</h2>
            <Tooltip content="Close dialog">
              <button className="p-2 rounded hover:bg-gray-700" onClick={onClose} aria-label="Close">
                <Icon path={mdiClose} className="h-5 w-5 text-white" />
              </button>
            </Tooltip>
          </div>
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {error && (
              <div className="bg-red-900/20 border border-red-800 rounded p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Slug <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="about-us"
                required
                className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="text-gray-500 text-xs mt-1">URL-friendly identifier (e.g., about-us)</p>
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSystem}
                  onChange={(e) => setIsSystem(e.target.checked)}
                  className="rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-300">System Page</span>
              </label>
              <p className="text-gray-500 text-xs mt-1 ml-6">System pages cannot be deleted by users</p>
            </div>
            {isSystem && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  System Key
                </label>
                <input
                  type="text"
                  value={systemKey}
                  onChange={(e) => setSystemKey(e.target.value)}
                  placeholder="home"
                  className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="text-gray-500 text-xs mt-1">Unique identifier for system pages</p>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md bg-gray-700 text-white hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !slug.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon path={mdiContentSave} className={`h-4 w-4 ${saving ? 'animate-spin' : ''}`} />
                <span>{saving ? 'Creating...' : 'Create Page'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Edit Page Dialog Component
function EditPageDialog({ 
  page, 
  onClose, 
  onSuccess,
  onDelete
}: { 
  page: Page; 
  onClose: () => void; 
  onSuccess: () => void;
  onDelete: () => void;
}) {
  const { updatePage, deletePage } = usePageManagement();
  const [slug, setSlug] = useState(page.slug);
  const [systemKey, setSystemKey] = useState(page.system_key || '');
  const [isSystem, setIsSystem] = useState(page.is_system);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug.trim()) return;

    setSaving(true);
    setError(null);

    try {
      const result = await updatePage(page.id, {
        slug: slug.trim(),
        is_system: isSystem,
        system_key: systemKey.trim() || undefined,
      });

      if (result) {
        console.log('Page updated successfully:', result);
        onSuccess();
      } else {
        const errorMsg = 'Failed to update page. Please try again.';
        console.error('Page update failed:', errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      console.error('Error updating page:', err);
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete page "/${page.slug}"? This action cannot be undone.`)) return;

    setDeleting(true);
    setError(null);

    try {
      const result = await deletePage(page.id);
      if (result) {
        console.log('Page deleted successfully:', page.id);
        onDelete();
      } else {
        const errorMsg = 'Failed to delete page. Please try again.';
        console.error('Page deletion failed:', errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      console.error('Error deleting page:', err);
      setError(errorMsg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-md">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
            <h2 className="text-white font-semibold">Edit Page</h2>
            <Tooltip content="Close dialog">
              <button className="p-2 rounded hover:bg-gray-700" onClick={onClose} aria-label="Close">
                <Icon path={mdiClose} className="h-5 w-5 text-white" />
              </button>
            </Tooltip>
          </div>
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {error && (
              <div className="bg-red-900/20 border border-red-800 rounded p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Slug <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSystem}
                  onChange={(e) => setIsSystem(e.target.checked)}
                  className="rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-300">System Page</span>
              </label>
            </div>
            {isSystem && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  System Key
                </label>
                <input
                  type="text"
                  value={systemKey}
                  onChange={(e) => setSystemKey(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            )}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-700">
              <Tooltip content="Delete page">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting || saving}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon path={mdiTrashCanOutline} className={`h-4 w-4 ${deleting ? 'animate-spin' : ''}`} />
                  <span>{deleting ? 'Deleting...' : 'Delete'}</span>
                </button>
              </Tooltip>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-md bg-gray-700 text-white hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || deleting || !slug.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon path={mdiContentSave} className={`h-4 w-4 ${saving ? 'animate-spin' : ''}`} />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
