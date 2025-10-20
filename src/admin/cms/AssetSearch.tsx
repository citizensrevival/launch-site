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
import { Tooltip } from '../../shell/Tooltip';
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
          className="block w-full max-w-md bg-gray-700 border border-transparent rounded-md py-2 px-3 text-sm placeholder-gray-400 text-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />

        {/* Asset Type Chips */}
        <div className="flex items-center gap-2">
          <Tooltip content="Filter by images">
            <button
              onClick={() => handleKindToggle('image')}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm transition-colors ${
                selectedKinds.includes('image')
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Icon path={mdiImage} className="h-4 w-4" />
              Images
            </button>
          </Tooltip>
          <Tooltip content="Filter by videos">
            <button
              onClick={() => handleKindToggle('video')}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm transition-colors ${
                selectedKinds.includes('video')
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Icon path={mdiVideo} className="h-4 w-4" />
              Videos
            </button>
          </Tooltip>
          <Tooltip content="Filter by files">
            <button
              onClick={() => handleKindToggle('file')}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm transition-colors ${
                selectedKinds.includes('file')
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Icon path={mdiFile} className="h-4 w-4" />
              Files
            </button>
          </Tooltip>
          {selectedKinds.length > 0 && (
            <button
              onClick={() => handleFilterChange('kinds', undefined)}
              className="text-sm text-gray-400 hover:text-white ml-2 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* View Mode Toggle */}
      <Tooltip content={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}>
        <button
          onClick={handleViewModeToggle}
          className="p-2 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <Icon path={viewMode === 'grid' ? mdiViewList : mdiViewGrid} className="h-5 w-5" />
        </button>
      </Tooltip>
    </div>
  );
}
