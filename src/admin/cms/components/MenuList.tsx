// Menu List Component
// Displays menus in a table with actions

import { useState } from 'react';
import { Icon } from '@mdi/react';
import { 
  mdiPencil,
  mdiTrashCanOutline,
  mdiMenu,
  mdiChevronUp,
  mdiChevronDown,
  mdiChevronLeft,
  mdiChevronRight
} from '@mdi/js';
import type { Menu } from '../menus/types/menu.types';

interface MenuListProps {
  menus: Menu[];
  loading: boolean;
  onEdit: (menu: Menu) => void;
  onDelete: (menu: Menu) => void;
  onEditItems: (menu: Menu) => void;
  onSort: (field: 'handle' | 'label' | 'system_key') => void;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function MenuList({ 
  menus, 
  loading, 
  onEdit, 
  onDelete, 
  onEditItems,
  onSort,
  currentPage,
  onPageChange
}: MenuListProps) {
  const [sortField, setSortField] = useState<'handle' | 'label' | 'system_key' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: 'handle' | 'label' | 'system_key') => {
    if (sortField === field) {
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      setSortDirection(newDirection);
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    onSort(field);
  };

  const getSortIcon = (field: 'handle' | 'label' | 'system_key') => {
    if (sortField !== field) {
      return <Icon path={mdiChevronUp} size={1} className="text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <Icon path={mdiChevronUp} size={1} className="text-blue-400" />
      : <Icon path={mdiChevronDown} size={1} className="text-blue-400" />;
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading menus...</p>
        </div>
      </div>
    );
  }

  if (menus.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg">
        <div className="p-8 text-center">
          <Icon path={mdiMenu} size={3} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-300 mb-2">No Menus Found</h3>
          <p className="text-gray-400">Create your first menu to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      {/* Table Header */}
      <div className="bg-gray-700 px-6 py-4">
        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-300">
          <div className="col-span-3">
            <button
              onClick={() => handleSort('handle')}
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              Handle
              {getSortIcon('handle')}
            </button>
          </div>
          <div className="col-span-3">
            <button
              onClick={() => handleSort('label')}
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              Label
              {getSortIcon('label')}
            </button>
          </div>
          <div className="col-span-2">
            <button
              onClick={() => handleSort('system_key')}
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              System Key
              {getSortIcon('system_key')}
            </button>
          </div>
          <div className="col-span-2 text-center">Type</div>
          <div className="col-span-2 text-center">Actions</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-700">
        {menus.map((menu) => (
          <div key={menu.id} className="px-6 py-4 hover:bg-gray-750 transition-colors">
            <div className="grid grid-cols-12 gap-4 items-center">
              {/* Handle */}
              <div className="col-span-3">
                <div className="text-sm font-medium text-white">{menu.handle}</div>
              </div>

              {/* Label */}
              <div className="col-span-3">
                <div className="text-sm text-gray-300">{menu.label}</div>
              </div>

              {/* System Key */}
              <div className="col-span-2">
                <div className="text-sm text-gray-400">
                  {/* TODO: Implement system key functionality */}
                  -
                </div>
              </div>

              {/* Type */}
              <div className="col-span-2 text-center">
                {/* TODO: Implement system menu functionality */}
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                  Custom
                </span>
              </div>

              {/* Actions */}
              <div className="col-span-2">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => onEditItems(menu)}
                    className="p-2 text-gray-400 hover:text-blue-400 rounded-lg hover:bg-gray-700 transition-colors"
                    title="Edit menu items"
                  >
                    <Icon path={mdiMenu} size={1} />
                  </button>
                  
                  <button
                    onClick={() => onEdit(menu)}
                    className="p-2 text-gray-400 hover:text-yellow-400 rounded-lg hover:bg-gray-700 transition-colors"
                    title="Edit menu"
                  >
                    <Icon path={mdiPencil} size={1} />
                  </button>
                  
                  {/* TODO: Implement system menu functionality */}
                  <button
                    onClick={() => onDelete(menu)}
                    className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-gray-700 transition-colors"
                    title="Delete menu"
                  >
                    <Icon path={mdiTrashCanOutline} size={1} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="bg-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Showing {menus.length} menu{menus.length !== 1 ? 's' : ''}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-600 transition-colors"
            >
              <Icon path={mdiChevronLeft} size={1} />
            </button>
            
            <span className="text-sm text-gray-300 px-3">
              Page {currentPage}
            </span>
            
            <button
              onClick={() => onPageChange(currentPage + 1)}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <Icon path={mdiChevronRight} size={1} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
