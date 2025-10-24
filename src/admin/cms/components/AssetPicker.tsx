// Asset Picker Component
// Modal for selecting assets to link to blocks

import { useState, useEffect, useRef } from 'react';
import { Icon } from '@mdi/react';
import { 
  mdiClose, 
  mdiMagnify,
  mdiImage,
  mdiFile,
  mdiCheck,
  mdiRefresh
} from '@mdi/js';
import { useAssets } from '../assets/hooks/useAssets';
import { useAppSelector } from '../../store/hooks';
// Stub functions - TODO: Implement proper asset URL generation
const getAssetUrl = (asset: Asset) => `#asset-${asset.id}`;
const getAssetVariantUrl = (asset: Asset, variant: string) => `#asset-${asset.id}-${variant}`;
import type { Asset } from '../assets/types/asset.types';

// Stub types - TODO: Implement proper types
type ContentFilters = Record<string, any>;

interface AssetPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onAssetSelect: (assetId: string) => void;
  buttonText?: string;
  buttonIcon?: string;
  selectedAssetId?: string;
  role?: string;
  acceptedTypes?: ('image' | 'video' | 'file')[];
  multiple?: boolean;
}

export function AssetPicker({ 
  isOpen, 
  onClose, 
  onAssetSelect,
  role,
  acceptedTypes = ['image']
}: AssetPickerProps) {
  const selectedSite = useAppSelector((state: any) => state.site.selectedSite);
  
  // Use refs to store stable values and prevent infinite loops
  const filtersRef = useRef<ContentFilters>({});
  
  // Update filters only when acceptedTypes changes
  useEffect(() => {
    if (acceptedTypes.length === 1) {
      filtersRef.current = { kind: acceptedTypes[0] };
    } else {
      filtersRef.current = {};
    }
  }, [acceptedTypes.join(',')]);
  
  // Use a stable site ID to prevent unnecessary re-renders
  // const siteId = selectedSite?.id || ''; // TODO: Implement proper site filtering
  const { assets, loading, error } = useAssets();
  
  // Debug logging
  useEffect(() => {
    if (assets) {
      console.log('🔍 [AssetPicker] Assets loaded:', assets.length);
      console.log('🔍 [AssetPicker] First asset:', assets[0]);
      console.log('🔍 [AssetPicker] Selected site:', selectedSite?.id);
    }
  }, [assets, selectedSite?.id]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [filterKind, setFilterKind] = useState<'all' | 'image' | 'video' | 'file'>('all');

  // Filter assets based on search and kind
  const filteredAssets = assets?.filter((asset: Asset) => {
    const matchesSearch = !searchTerm || 
      asset.storage_key.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesKind = filterKind === 'all' || asset.kind === filterKind;
    
    return matchesSearch && matchesKind;
  }) || [];

  // Handle asset selection
  const handleAssetSelect = (asset: Asset) => {
    setSelectedAsset(asset);
  };

  // Handle confirm selection
  const handleConfirm = () => {
    if (selectedAsset) {
      onAssetSelect(selectedAsset.id);
      onClose();
    }
  };

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedAsset(null);
      setSearchTerm('');
    }
  }, [isOpen]);


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-white">Select Asset</h2>
            {role && (
              <p className="text-sm text-gray-400 capitalize">
                Role: {role.replace('_', ' ')}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Icon path={mdiClose} size={1.2} className="text-gray-400" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Icon 
                path={mdiMagnify} 
                size={1.2} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
              />
              <input
                type="text"
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <select
              value={filterKind}
              onChange={(e) => setFilterKind(e.target.value as any)}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="file">Files</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-red-400 mb-4">Error loading assets: {error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                >
                  <Icon path={mdiRefresh} size={1} />
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto p-4">
              {filteredAssets.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Icon path={mdiImage} size={3} className="text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">No assets found</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {searchTerm ? 'Try adjusting your search terms' : 'Upload some assets first'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredAssets.map((asset: Asset) => (
                    <div
                      key={asset.id}
                      onClick={() => handleAssetSelect(asset)}
                      className={`relative cursor-pointer rounded-lg border-2 transition-all ${
                        selectedAsset?.id === asset.id
                          ? 'border-blue-500 bg-blue-900/20'
                          : 'border-gray-600 hover:border-gray-500 bg-gray-700'
                      }`}
                    >
                      {/* Asset Preview */}
                      <div className="aspect-square rounded-t-lg overflow-hidden bg-gray-800">
                        {asset.kind === 'image' ? (
                          <img
                            src={getAssetVariantUrl(asset, 'thumbnail')}
                            alt={asset.storage_key || 'Asset'}
                            className="w-full h-full object-cover"
                            onLoad={() => {
                              console.log('🔍 [AssetPicker] Thumbnail loaded:', asset.storage_key);
                            }}
                            onError={(e) => {
                              console.log('🔍 [AssetPicker] Thumbnail failed, trying original:', asset.storage_key);
                              // Try original image as fallback
                              const target = e.target as HTMLImageElement;
                              const originalUrl = getAssetUrl(asset);
                              target.src = originalUrl;
                              target.onerror = () => {
                                // Final fallback to icon
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `<div class="flex items-center justify-center h-full"><Icon path="${mdiImage}" size={2} class="text-gray-500" /></div>`;
                                }
                              };
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Icon path={mdiFile} size={2} className="text-gray-500" />
                          </div>
                        )}
                      </div>

                      {/* Asset Info */}
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-300 truncate">
                            {asset.storage_key.split('/').pop()?.split('.')[0] || 'Untitled'}
                          </span>
                          {selectedAsset?.id === asset.id && (
                            <Icon path={mdiCheck} size={1} className="text-blue-400" />
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {asset.kind} • {asset.width && asset.height ? `${asset.width}×${asset.height}` : 'Unknown size'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <div className="text-sm text-gray-400">
            {selectedAsset ? `Selected: ${selectedAsset.storage_key || 'Untitled'}` : 'No asset selected'}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedAsset}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Select Asset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simplified version for inline use
export function AssetPickerButton({ 
  onAssetSelect, 
  buttonText = "Select Asset",
  buttonIcon = mdiImage 
}: { 
  onAssetSelect: (assetId: string) => void;
  buttonText?: string;
  buttonIcon?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
      >
        <Icon path={buttonIcon} size={1} />
        {buttonText}
      </button>
      
      <AssetPicker
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onAssetSelect={onAssetSelect}
        buttonText={buttonText}
        buttonIcon={buttonIcon}
      />
    </>
  );
}
