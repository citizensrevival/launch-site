// Block List Component
// Displays blocks in a table with sorting, filtering, and actions
import { Icon } from '@mdi/react';
import { 
  mdiChevronUp, 
  mdiChevronDown,
  mdiPencil,
  mdiTrashCanOutline,
  mdiCubeOutline,
  mdiShieldCheckOutline,
  mdiKey,
  mdiFileDocumentOutline,
  mdiLoading
} from '@mdi/js';
import { Tooltip } from '../../../shell/Tooltip';
import { useBlockUsageCount } from '../../../lib/cms/hooks';
import type { Block, PaginatedResponse, ContentSort } from '../../../lib/cms/types';

interface BlockListProps {
  blocks: PaginatedResponse<Block> | null;
  loading: boolean;
  error: string | null;
  onEdit: (block: Block) => void;
  onDelete: (block: Block) => void;
  sort: ContentSort;
  onSort: (field: 'type' | 'tag' | 'system_key') => void;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function BlockList({
  blocks,
  loading,
  error,
  onEdit,
  onDelete,
  sort,
  onSort,
  currentPage,
  onPageChange
}: BlockListProps) {
  // Usage counts are now handled by individual components

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Loading blocks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <div className="text-red-400 text-lg mb-2">⚠️</div>
        <h2 className="text-xl font-semibold text-white mb-2">Error Loading Blocks</h2>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!blocks || blocks.data.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <div className="text-gray-400 text-lg mb-2">🧩</div>
        <h2 className="text-xl font-semibold text-white mb-2">No Blocks Found</h2>
        <p className="text-gray-400">Create your first content block to get started.</p>
      </div>
    );
  }

  const getSortIcon = (field: string) => {
    if (sort.field !== field) {
      return <Icon path={mdiChevronUp} size={0.8} className="opacity-30" />;
    }
    return sort.direction === 'asc' 
      ? <Icon path={mdiChevronUp} size={0.8} />
      : <Icon path={mdiChevronDown} size={0.8} />;
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => onSort('type')}
                  className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  <Icon path={mdiCubeOutline} size={0.8} />
                  Type
                  {getSortIcon('type')}
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => onSort('tag')}
                  className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Tag
                  {getSortIcon('tag')}
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => onSort('system_key')}
                  className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  <Icon path={mdiKey} size={0.8} />
                  System Key
                  {getSortIcon('system_key')}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">
                Usage
              </th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {blocks.data.map((block) => (
              <BlockRow
                key={block.id}
                block={block}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {blocks.total_pages > 1 && (
        <div className="px-6 py-4 bg-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, blocks.count)} of {blocks.count} blocks
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-gray-300">
              Page {currentPage} of {blocks.total_pages}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= blocks.total_pages}
              className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Individual block row component
function BlockRow({ 
  block, 
  onEdit, 
  onDelete 
}: { 
  block: Block; 
  onEdit: (block: Block) => void; 
  onDelete: (block: Block) => void; 
}) {
  const { usageCount, loading: usageLoading } = useBlockUsageCount(block.id);

  return (
    <tr className="hover:bg-gray-700/50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Icon path={mdiCubeOutline} size={0.8} className="text-blue-400" />
            <span className="font-medium text-white">{block.type}</span>
          </div>
          {block.is_system && (
            <Tooltip content="System Block">
              <Icon path={mdiShieldCheckOutline} size={0.8} className="text-yellow-400" />
            </Tooltip>
          )}
        </div>
      </td>
      
      <td className="px-6 py-4">
        <span className="text-gray-300">
          {block.tag || <span className="text-gray-500 italic">No tag</span>}
        </span>
      </td>
      
      <td className="px-6 py-4">
        <span className="text-gray-300">
          {block.system_key || <span className="text-gray-500 italic">No system key</span>}
        </span>
      </td>
      
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-sm text-gray-300">Active</span>
        </div>
      </td>
      
      <td className="px-6 py-4">
        {usageLoading ? (
          <div className="flex items-center gap-2">
            <Icon path={mdiLoading} size={0.8} className="animate-spin text-gray-400" />
            <span className="text-gray-400 text-sm">Loading...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Icon path={mdiFileDocumentOutline} size={0.8} className="text-gray-400" />
            <span className="text-gray-300">{usageCount} pages</span>
          </div>
        )}
      </td>
      
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <Tooltip content="Edit Block">
            <button
              onClick={() => onEdit(block)}
              className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-600 rounded transition-colors"
            >
              <Icon path={mdiPencil} size={0.8} />
            </button>
          </Tooltip>
          
          {!block.is_system && (
            <Tooltip content="Delete Block">
              <button
                onClick={() => onDelete(block)}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-600 rounded transition-colors"
              >
                <Icon path={mdiTrashCanOutline} size={0.8} />
              </button>
            </Tooltip>
          )}
        </div>
      </td>
    </tr>
  );
}
