// AssetSearch Component
// Handles asset filtering, searching, and view mode controls

import {
  mdiViewGrid,
  mdiViewList,
  mdiImage,
  mdiVideo,
  mdiFile,
} from '@mdi/js';
import Icon from '@mdi/react';
import { useAppDispatch, useAppSelector } from '../../shell/store/hooks';
import { setViewMode, updateFilter, toggleKindFilter } from '../../shell/store/slices/assetSearchSlice';
import type { AssetKind } from '../../lib/cms/types';

export function AssetSearch() {
  const dispatch = useAppDispatch();
  const { filters, viewMode } = useAppSelector((state) => state.assetSearch);

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    dispatch(updateFilter({ key, value }));
  };

  const handleViewModeToggle = () => {
    dispatch(setViewMode(viewMode === 'grid' ? 'list' : 'grid'));
  };

  const handleKindToggle = (kind: AssetKind) => {
    dispatch(toggleKindFilter(kind));
  };

  const selectedKinds = (filters.kinds as AssetKind[]) || [];

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-col gap-3 flex-1">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search by filename, tags, name, description..."
          value={filters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
          className="px-3 py-2 border border-gray-300 rounded-md bg-white w-full max-w-md"
        />

        {/* Asset Type Chips */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Types:</span>
          <button
            onClick={() => handleKindToggle('image')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedKinds.includes('image')
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Icon path={mdiImage} size={0.7} />
            Images
          </button>
          <button
            onClick={() => handleKindToggle('video')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedKinds.includes('video')
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Icon path={mdiVideo} size={0.7} />
            Videos
          </button>
          <button
            onClick={() => handleKindToggle('file')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedKinds.includes('file')
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Icon path={mdiFile} size={0.7} />
            Files
          </button>
          {selectedKinds.length > 0 && (
            <button
              onClick={() => handleFilterChange('kinds', undefined)}
              className="text-sm text-gray-500 hover:text-gray-700 ml-2"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* View Mode Toggle */}
      <button
        onClick={handleViewModeToggle}
        className="p-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
        title={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
      >
        <Icon path={viewMode === 'grid' ? mdiViewList : mdiViewGrid} size={0.9} />
      </button>
    </div>
  );
}
