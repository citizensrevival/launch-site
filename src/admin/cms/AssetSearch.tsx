// AssetSearch Component
// Handles asset filtering, searching, and view mode controls

import React from 'react';
import { useAppSelector, useAppDispatch } from '../../shell/store/hooks';
import { updateFilter, setViewMode } from '../../shell/store/slices/assetSearchSlice';
import type { AssetKind } from '../../lib/cms/types';

export function AssetSearch() {
  const dispatch = useAppDispatch();
  const { filters, viewMode } = useAppSelector((state) => state.assetSearch);

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    dispatch(updateFilter({ key, value }));
  };

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    dispatch(setViewMode(mode));
  };

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center space-x-4">
        <select
          value={filters.kind || ''}
          onChange={(e) => handleFilterChange('kind', e.target.value as AssetKind || undefined)}
          className="px-3 py-2 border border-gray-300 rounded-md bg-white"
        >
          <option value="">All Types</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="file">Files</option>
        </select>

        <input
          type="text"
          placeholder="Search assets..."
          value={filters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
          className="px-3 py-2 border border-gray-300 rounded-md bg-white"
        />
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => handleViewModeChange('grid')}
          className={`p-2 rounded-md ${
            viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Grid
        </button>
        <button
          onClick={() => handleViewModeChange('list')}
          className={`p-2 rounded-md ${
            viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          List
        </button>
      </div>
    </div>
  );
}
