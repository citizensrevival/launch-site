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
import { Tooltip } from '../../core/components/Tooltip';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setQuery } from '../store/slices/assetSearchSlice';

// Stub type - TODO: Implement proper AssetKind type
type AssetKind = 'image' | 'video' | 'audio' | 'document' | 'other';

export function AssetSearch() {
  const dispatch = useAppDispatch();
  const { query } = useAppSelector((state) => state.assetSearch);

  const selectedKinds: AssetKind[] = [];
  const viewMode = 'grid'; // Default view mode

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-col gap-3 flex-1">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search by filename, tags, name, description..."
          value={query || ''}
          onChange={(e) => dispatch(setQuery(e.target.value || ''))}
          className="block w-full max-w-md bg-gray-700 border border-transparent rounded-md py-2 px-3 text-sm placeholder-gray-400 text-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />

        {/* Asset Type Chips */}
        <div className="flex items-center gap-2">
          <Tooltip content="Filter by images">
            <button
              onClick={() => console.log('Image filter clicked')}
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
              onClick={() => console.log('Video filter clicked')}
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
              onClick={() => console.log('Document filter clicked')}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm transition-colors ${
                selectedKinds.includes('document')
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
              onClick={() => console.log('Clear filters clicked')}
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
          onClick={() => console.log('View mode toggle clicked')}
          className="p-2 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <Icon path={viewMode === 'grid' ? mdiViewList : mdiViewGrid} className="h-5 w-5" />
        </button>
      </Tooltip>
    </div>
  );
}
