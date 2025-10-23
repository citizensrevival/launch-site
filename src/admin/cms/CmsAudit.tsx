// CMS Audit Log Component
// This component provides the main interface for viewing and managing audit logs

import { useState } from 'react';
import { useAuditLog, useAuditLogStats, useAuditLogFilters, useAuditLogPagination, useEntityAuditLog } from '../../lib/cms/auditHooks';
import { AuditLogEntry } from '../../lib/cms/types';

export function CmsAudit() {
  const [selectedEntity, setSelectedEntity] = useState<{ type: string; id: string } | null>(null);
  const [showStats, setShowStats] = useState(false);

  const {
    filters,
    updateFilter,
    clearFilters,
    getFilterParams
  } = useAuditLogFilters();

  const {
    pagination,
    updatePage,
    updatePageSize,
    resetPagination
  } = useAuditLogPagination();

  const {
    entries,
    loading,
    error,
    pagination: auditPagination,
    refresh
  } = useAuditLog({
    ...getFilterParams(),
    page: pagination.page,
    pageSize: pagination.pageSize
  });

  const {
    stats,
    loading: statsLoading,
    error: statsError
  } = useAuditLogStats({
    startDate: filters.startDate,
    endDate: filters.endDate,
    entityType: filters.entityType
  });

  const handleFilterChange = (key: string, value: string) => {
    updateFilter(key, value);
    resetPagination();
  };

  const handlePageChange = (page: number) => {
    updatePage(page);
  };

  const handlePageSizeChange = (pageSize: number) => {
    updatePageSize(pageSize);
  };

  const handleEntityClick = (entityType: string, entityId: string) => {
    setSelectedEntity({ type: entityType, id: entityId });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading audit log...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">CMS Audit Log</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowStats(!showStats)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {showStats ? 'Hide Stats' : 'Show Stats'}
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
          <div className="text-red-800">Error loading audit log: {error}</div>
        </div>
      )}

      {/* Statistics Panel */}
      {showStats && (
        <AuditLogStats
          stats={stats}
          loading={statsLoading}
          error={statsError}
        />
      )}

      {/* Filters */}
      <AuditLogFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
      />

      {/* Audit Log Table */}
      <AuditLogTable
        entries={entries}
        onEntityClick={handleEntityClick}
        pagination={auditPagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Entity Details Modal */}
      {selectedEntity && (
        <EntityAuditModal
          entityType={selectedEntity.type}
          entityId={selectedEntity.id}
          onClose={() => setSelectedEntity(null)}
        />
      )}
    </div>
  );
}

// Audit Log Statistics Component
interface AuditLogStatsProps {
  stats: any;
  loading: boolean;
  error: string | null;
}

function AuditLogStats({ stats, loading, error }: AuditLogStatsProps) {
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">Error loading statistics: {error}</div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Audit Log Statistics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.totalOperations}</div>
          <div className="text-sm text-blue-800">Total Operations</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{Object.keys(stats.operationsByType).length}</div>
          <div className="text-sm text-green-800">Action Types</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">{Object.keys(stats.operationsByEntity).length}</div>
          <div className="text-sm text-purple-800">Entity Types</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-600">{Object.keys(stats.operationsByUser).length}</div>
          <div className="text-sm text-orange-800">Active Users</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Operations by Type</h4>
          <div className="space-y-2">
            {Object.entries(stats.operationsByType).map(([action, count]) => (
              <div key={action} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">{action}</span>
                <span className="text-sm font-medium text-gray-900">{count as number}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Operations by Entity</h4>
          <div className="space-y-2">
            {Object.entries(stats.operationsByEntity).map(([entity, count]) => (
              <div key={entity} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">{entity}s</span>
                <span className="text-sm font-medium text-gray-900">{count as number}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Audit Log Filters Component
interface AuditLogFiltersProps {
  filters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
}

function AuditLogFilters({ filters, onFilterChange, onClearFilters }: AuditLogFiltersProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <button
          onClick={onClearFilters}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label htmlFor="entity-type" className="block text-sm font-medium text-gray-700 mb-1">
            Entity Type
          </label>
          <select
            id="entity-type"
            value={filters.entityType}
            onChange={(e) => onFilterChange('entityType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="page">Pages</option>
            <option value="block">Blocks</option>
            <option value="menu">Menus</option>
            <option value="asset">Assets</option>
          </select>
        </div>

        <div>
          <label htmlFor="action" className="block text-sm font-medium text-gray-700 mb-1">
            Action
          </label>
          <select
            id="action"
            value={filters.action}
            onChange={(e) => onFilterChange('action', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="publish">Publish</option>
            <option value="unpublish">Unpublish</option>
            <option value="delete">Delete</option>
            <option value="rollback">Rollback</option>
          </select>
        </div>

        <div>
          <label htmlFor="user-id" className="block text-sm font-medium text-gray-700 mb-1">
            User ID
          </label>
          <input
            id="user-id"
            type="text"
            value={filters.userId}
            onChange={(e) => onFilterChange('userId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter user ID"
          />
        </div>

        <div>
          <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            id="start-date"
            type="date"
            value={filters.startDate}
            onChange={(e) => onFilterChange('startDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            id="end-date"
            type="date"
            value={filters.endDate}
            onChange={(e) => onFilterChange('endDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

// Audit Log Table Component
interface AuditLogTableProps {
  entries: AuditLogEntry[];
  onEntityClick: (entityType: string, entityId: string) => void;
  pagination: {
    count: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

function AuditLogTable({ entries, onEntityClick, pagination, onPageChange, onPageSizeChange }: AuditLogTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-green-100 text-green-800';
      case 'update':
        return 'bg-blue-100 text-blue-800';
      case 'publish':
        return 'bg-purple-100 text-purple-800';
      case 'unpublish':
        return 'bg-yellow-100 text-yellow-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      case 'rollback':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Audit Log Entries</h3>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">
              {pagination.count} total entries
            </span>
            <select
              value={pagination.pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Changes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(entry.action)}`}>
                    {entry.action}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => onEntityClick(entry.entity_type, entry.entity_id)}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {entry.entity_type} {entry.entity_id}
                  </button>
                  {entry.version && (
                    <span className="ml-2 text-xs text-gray-500">v{entry.version}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {entry.user_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {entry.changes ? Object.keys(entry.changes).length : 0} changes
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(entry.occurred_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.count)} of{' '}
            {pagination.count} entries
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Entity Audit Modal Component
interface EntityAuditModalProps {
  entityType: string;
  entityId: string;
  onClose: () => void;
}

function EntityAuditModal({ entityType, entityId, onClose }: EntityAuditModalProps) {
  const { entries, loading, error } = useEntityAuditLog(entityType, entityId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Audit Log for {entityType} {entityId}
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

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-800">Error: {error}</div>
          </div>
        )}

        {entries.length === 0 && !loading && (
          <div className="text-center text-gray-500 py-8">
            No audit entries found for this entity
          </div>
        )}

        {entries.length > 0 && (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    entry.action === 'create' ? 'bg-green-100 text-green-800' :
                    entry.action === 'update' ? 'bg-blue-100 text-blue-800' :
                    entry.action === 'publish' ? 'bg-purple-100 text-purple-800' :
                    entry.action === 'unpublish' ? 'bg-yellow-100 text-yellow-800' :
                    entry.action === 'delete' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {entry.action}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(entry.occurred_at).toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  User: {entry.user_id}
                  {entry.version && ` | Version: ${entry.version}`}
                </div>
                {entry.changes && Object.keys(entry.changes).length > 0 && (
                  <div className="mt-2 text-sm text-gray-500">
                    <strong>Changes:</strong> {Object.keys(entry.changes).join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}