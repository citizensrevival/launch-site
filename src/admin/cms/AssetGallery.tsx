// AssetGallery Component
// Displays assets in grid or list view with pagination

import { forwardRef, useImperativeHandle, useState } from 'react';
import { useAssets } from './assets/hooks/useAssets';
import { useAppSelector } from '../store/hooks';

// Stub functions - TODO: Implement proper asset operations
const getAssetUrl = (storageKey: string, _siteId: string) => `https://example.com/assets/${storageKey}`;
const getAssetVariantUrl = (storageKey: string, variant: string, _siteId: string) => `https://example.com/assets/${storageKey}?variant=${variant}`;
import { AssetDetailsCompact } from './AssetDetailsCompact';

export const AssetGallery = forwardRef<{ refresh: () => void }>((_, ref) => {
  const selectedSite = useAppSelector((state) => (state as any).site?.selectedSite);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [viewMode] = useState<'grid' | 'list'>('grid');

  const { assets, loading, error, refreshAssets, totalCount } = useAssets();
  
  // Stub asset management - TODO: Implement proper asset management
  const deleteAsset = async (_assetId: string) => {
    return { success: true };
  };

  useImperativeHandle(ref, () => ({
    refresh: refreshAssets
  }));

  const handleDelete = async (assetId: string) => {
    if (confirm('Are you sure you want to delete this asset? This will also delete all variants.')) {
      const success = await deleteAsset(assetId);
      if (success) {
        // Close modal if we're viewing this asset
        if (selectedAssetId === assetId) {
          setSelectedAssetId(null);
        }
        // Refresh the gallery to show updated list
        refreshAssets();
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
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
      <div className="p-4 bg-red-900/20 border border-red-800 rounded-md">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  if (assets?.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-4xl mb-4">📁</div>
        <h3 className="text-lg font-medium text-white mb-2">No assets found</h3>
        <p className="text-gray-400">Upload your first asset to get started.</p>
      </div>
    );
  }

  return (
    <>
      <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4' : 'space-y-4'}>
        {assets?.map((asset) => (
          <div
            key={asset.id}
            className={`bg-gray-800 rounded-lg shadow-sm border border-gray-700 overflow-hidden ${
              viewMode === 'list' ? 'flex items-center p-4' : ''
            } cursor-pointer hover:bg-gray-750 hover:border-gray-600 transition-colors`}
            onClick={() => setSelectedAssetId(asset.id)}
          >
            {viewMode === 'grid' ? (
              <>
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  {asset.kind === 'image' ? (
                        <img
                          src={getAssetVariantUrl(asset.storage_key, selectedSite?.id || '', 'thumbnail')}
                          alt={(asset as any).metadata?.alt || ''}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to original if thumbnail doesn't exist
                            e.currentTarget.src = getAssetUrl(asset.storage_key, selectedSite?.id || '');
                          }}
                        />
                  ) : (
                    <div className="text-gray-400 text-4xl">
                      {asset.kind === 'video' ? '🎥' : '📄'}
                    </div>
                  )}
                </div>
                <div 
                  className="p-4"
                  title={(asset as any).metadata?.caption || (asset as any).metadata?.alt || ''}
                >
                  <h3 className="font-medium text-white truncate">
                    {(asset as any).metadata?.name || asset.storage_key.split('/').pop()}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {asset.kind} • {asset.width && asset.height ? `${asset.width}×${asset.height}` : 'Unknown size'}
                  </p>
                  {(asset as any).metadata?.tags && (asset as any).metadata.tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {(asset as any).metadata.tags.slice(0, 3).map((tag: string, idx: number) => (
                        <span key={idx} className="text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                      {(asset as any).metadata.tags.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{(asset as any).metadata.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center mr-4">
                  {asset.kind === 'image' ? (
                        <img
                          src={getAssetVariantUrl(asset.storage_key, selectedSite?.id || '', 'thumbnail')}
                          alt={(asset as any).metadata?.alt || ''}
                          className="w-full h-full object-cover rounded-md"
                          onError={(e) => {
                            // Fallback to original if thumbnail doesn't exist
                            e.currentTarget.src = getAssetUrl(asset.storage_key, selectedSite?.id || '');
                          }}
                        />
                  ) : (
                    <div className="text-gray-400 text-2xl">
                      {asset.kind === 'video' ? '🎥' : '📄'}
                    </div>
                  )}
                </div>
                <div 
                  className="flex-1"
                  title={(asset as any).metadata?.caption || (asset as any).metadata?.alt || ''}
                >
                  <h3 className="font-medium text-white">
                    {(asset as any).metadata?.name || asset.storage_key.split('/').pop()}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {asset.kind} • {asset.width && asset.height ? `${asset.width}×${asset.height}` : 'Unknown size'}
                  </p>
                  {(asset as any).metadata?.tags && (asset as any).metadata.tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {(asset as any).metadata.tags.slice(0, 5).map((tag: string, idx: number) => (
                        <span key={idx} className="text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                      {(asset as any).metadata.tags.length > 5 && (
                        <span className="text-xs text-gray-500">
                          +{(asset as any).metadata.tags.length - 5}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalCount > 20 && (
        <div className="mt-6 flex items-center justify-center space-x-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-3 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-md hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="px-3 py-2 text-sm text-gray-300">
            Page {page} of {Math.ceil(totalCount / 20)}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === Math.ceil(totalCount / 20)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-md hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Asset Details - Compact Editor */}
      {selectedAssetId && (
        <AssetDetailsCompact
          assetId={selectedAssetId}
          siteId={selectedSite?.id || ''}
          onAssetUpdated={refreshAssets}
          onClose={() => setSelectedAssetId(null)}
          onDelete={handleDelete}
        />
      )}
    </>
  );
});
