// AssetDetails Component
// Displays detailed information about an asset including variants

import { useAsset } from './assets/hooks/useAssets';
import { useState } from 'react';
import { AssetEditor } from './components/AssetEditor';
import { Toast } from './components/Toast';
import type { AssetEditOperation } from './assets/types/asset.types';

// Stub function - TODO: Implement proper asset URL generation
const getAssetUrl = (storageKey: string, _siteId: string) => {
  return `https://example.com/assets/${storageKey}`;
};

interface AssetDetailsProps {
  assetId: string;
  siteId: string;
  onAssetUpdated?: () => void;
}

interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  details?: string;
}

export function AssetDetails({ assetId, siteId, onAssetUpdated }: AssetDetailsProps) {
  const { asset, loading: assetLoading, error: assetError, refetch: refreshAsset } = useAsset(assetId);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  
  // Stub variants data - TODO: Implement proper variants fetching
  const variants: any[] = [];
  const variantsLoading = false;
  const variantsError = null;

  const handleGenerateVariants = async () => {
    setIsGenerating(true);
    try {
      // Stub implementation - TODO: Implement variant generation
      const error = null;
      if (error) {
        setToast({
          message: 'Failed to generate variants',
          type: 'error',
          details: error,
        });
      } else {
        setToast({
          message: 'Variants generation started',
          type: 'success',
        });
        // Wait a bit for variants to be generated, then refresh
        setTimeout(() => {
          // TODO: Implement variant refresh
          // Also refresh the gallery to show updated thumbnails
          if (onAssetUpdated) {
            onAssetUpdated();
          }
        }, 2000);
      }
    } catch (err) {
      setToast({
        message: 'Error generating variants',
        type: 'error',
        details: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveEdit = async (_editOperation: AssetEditOperation, _editedImageBlob: Blob, createNew: boolean) => {
    try {
      // Stub implementation - TODO: Implement asset editing
      const result = { success: true, data: asset };
      if (result.success && result.data) {
        setToast({
          message: createNew ? 'New asset created successfully!' : 'Asset updated successfully!',
          type: 'success',
          details: createNew 
            ? 'A new asset has been created with variants.' 
            : 'The asset has been updated and variants regenerated.',
        });
        setIsEditing(false);
        
        // Always refresh the gallery to show updates
        if (onAssetUpdated) {
          onAssetUpdated();
        }
        
        // If updating existing asset, also refresh the current view
        if (!createNew) {
          refreshAsset();
          setTimeout(() => {
            // TODO: Implement variant refresh
          }, 2000);
        }
      } else {
        setToast({
          message: 'Failed to save edited asset',
          type: 'error',
          details: 'Unknown error occurred',
        });
      }
    } catch (err) {
      setToast({
        message: 'Error saving edited asset',
        type: 'error',
        details: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  };

  const formatBytes = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (assetLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (assetError || !asset) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <div className="text-red-800">{assetError || 'Asset not found'}</div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Asset Preview */}
        <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center">
          {asset.kind === 'image' ? (
            <img
              src={getAssetUrl(asset.storage_key, siteId)}
              alt=""
              className="max-w-full max-h-96 object-contain"
            />
          ) : (
            <div className="text-gray-400 text-6xl">
              {asset.kind === 'video' ? '🎥' : '📄'}
            </div>
          )}
        </div>

        {/* Asset Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Asset Information</h3>
            {asset.kind === 'image' && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-700 transition-colors"
              >
                Edit Image
              </button>
            )}
          </div>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-600">File Name:</dt>
            <dd className="font-medium text-gray-900">{asset.storage_key.split('/').pop()}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Type:</dt>
            <dd className="font-medium text-gray-900">{asset.kind}</dd>
          </div>
          {asset.width && asset.height && (
            <div className="flex justify-between">
              <dt className="text-gray-600">Dimensions:</dt>
              <dd className="font-medium text-gray-900">{asset.width} × {asset.height}px</dd>
            </div>
          )}
          {asset.duration_ms && (
            <div className="flex justify-between">
              <dt className="text-gray-600">Duration:</dt>
              <dd className="font-medium text-gray-900">{(asset.duration_ms / 1000).toFixed(2)}s</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-gray-600">Storage Key:</dt>
            <dd className="font-mono text-xs text-gray-700 break-all">{asset.storage_key}</dd>
          </div>
        </dl>
      </div>

      {/* Variants Section */}
      {asset.kind === 'image' && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Image Variants</h3>
            <button
              onClick={handleGenerateVariants}
              disabled={isGenerating}
              className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isGenerating ? 'Generating...' : 'Generate Variants'}
            </button>
          </div>

          {variantsLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          )}

          {variantsError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="text-red-800 text-sm">{variantsError}</div>
            </div>
          )}

          {!variantsLoading && !variantsError && variants.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
              No variants generated yet. Click "Generate Variants" to create optimized versions.
            </div>
          )}

          {!variantsLoading && variants.length > 0 && (
            <>
              {/* Optimization Stats */}
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <h5 className="font-medium text-blue-900 mb-2">Optimization Statistics</h5>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-blue-700">Total Variants:</span>
                    <span className="ml-2 font-medium text-blue-900">{variants.length}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Total Size:</span>
                    <span className="ml-2 font-medium text-blue-900">
                      {formatBytes(variants.reduce((sum, v) => sum + (v.file_size || 0), 0))}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Variant List */}
              <div className="space-y-3">
                {variants.map((variant) => (
                  <div key={variant.id} className="border border-gray-200 rounded-md p-3 bg-white">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-gray-900 capitalize">
                            {variant.variant_name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {variant.width} × {variant.height}px
                          </span>
                        </div>
                        <div className="space-y-1 text-xs text-gray-600">
                          <div>Size: {formatBytes(variant.file_size)}</div>
                          <div className="font-mono text-gray-500 break-all">
                            {variant.storage_key}
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                        <img
                          src={getAssetUrl(variant.storage_key, siteId)}
                          alt={`${variant.variant_name} variant`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
      </div>

      {/* Asset Editor Modal */}
      {isEditing && asset.kind === 'image' && (
        <AssetEditor
          asset={asset}
          imageUrl={getAssetUrl(asset.storage_key, siteId)}
          onSave={handleSaveEdit}
          onCancel={() => setIsEditing(false)}
        />
      )}

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          details={toast.details}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}

