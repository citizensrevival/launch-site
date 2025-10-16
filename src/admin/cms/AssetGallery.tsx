// AssetGallery Component
// Displays assets in grid or list view with pagination

import { forwardRef, useImperativeHandle } from 'react';
import { useAssets, useAssetManagement } from '../../lib/cms/hooks';
import { useAppSelector, useAppDispatch } from '../../shell/store/hooks';
import { setPage } from '../../shell/store/slices/assetSearchSlice';
import { getAssetUrl } from '../../lib/cms/utils';

export const AssetGallery = forwardRef<{ refresh: () => void }>((_, ref) => {
  const dispatch = useAppDispatch();
  const selectedSite = useAppSelector((state) => state.site.selectedSite);
  const { filters, sort, page, viewMode } = useAppSelector((state) => state.assetSearch);

  const { assets, loading, error, refresh } = useAssets(selectedSite?.id || '', filters, sort, page, 20);
  const { deleteAsset } = useAssetManagement();

  useImperativeHandle(ref, () => ({
    refresh
  }));

  const handleDelete = async (assetId: string) => {
    if (confirm('Are you sure you want to delete this asset?')) {
      await deleteAsset(assetId);
      // Refresh assets list
      window.location.reload();
    }
  };

  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <div className="text-red-800">{error}</div>
      </div>
    );
  }

  if (assets?.data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-4xl mb-4">📁</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No assets found</h3>
        <p className="text-gray-500">Upload your first asset to get started.</p>
      </div>
    );
  }

  return (
    <>
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
        {assets?.data.map((asset) => (
          <div
            key={asset.id}
            className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${
              viewMode === 'list' ? 'flex items-center p-4' : ''
            }`}
          >
            {viewMode === 'grid' ? (
              <>
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  {asset.kind === 'image' ? (
                        <img
                          src={getAssetUrl(asset.storage_key, selectedSite?.id || '')}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                  ) : (
                    <div className="text-gray-400 text-4xl">
                      {asset.kind === 'video' ? '🎥' : '📄'}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 truncate">
                    {asset.storage_key.split('/').pop()}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {asset.kind} • {asset.width && asset.height ? `${asset.width}×${asset.height}` : 'Unknown size'}
                  </p>
                  <div className="mt-2 flex space-x-2">
                    <button
                      onClick={() => handleDelete(asset.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center mr-4">
                  {asset.kind === 'image' ? (
                        <img
                          src={getAssetUrl(asset.storage_key, selectedSite?.id || '')}
                          alt=""
                          className="w-full h-full object-cover rounded-md"
                        />
                  ) : (
                    <div className="text-gray-400 text-2xl">
                      {asset.kind === 'video' ? '🎥' : '📄'}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    {asset.storage_key.split('/').pop()}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {asset.kind} • {asset.width && asset.height ? `${asset.width}×${asset.height}` : 'Unknown size'}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDelete(asset.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {assets && assets.total_pages > 1 && (
        <div className="mt-6 flex items-center justify-center space-x-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-3 py-2 text-sm text-gray-700">
            Page {page} of {assets.total_pages}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === assets.total_pages}
            className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
});
