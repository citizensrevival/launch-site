// Linked Assets Display Component
// Shows linked assets with role information and previews

import { useState, useEffect } from 'react';
import { Icon } from '@mdi/react';
import { 
  mdiImage,
  mdiFile,
  mdiEye,
  mdiTag,
  mdiAlertCircle,
  mdiLoading
} from '@mdi/js';
// Stub functions - TODO: Implement proper asset URL generation
const getAssetUrl = (asset: Asset) => `#asset-${asset.id}`;
const getAssetVariantUrl = (asset: Asset, variant: string) => `#asset-${asset.id}-${variant}`;

import type { Asset } from '../assets/types/asset.types';


interface LinkedAssetsDisplayProps {
  assets: Array<{ role: string; asset_id: string }>;
  siteId?: string; // Make optional since it's not used
  className?: string;
  showPreviews?: boolean;
  compact?: boolean;
}

// Role descriptions for better UX
const ROLE_DESCRIPTIONS = {
  hero_image: 'Main hero image',
  hero_background: 'Hero background',
  feature_icons: 'Feature icons',
  feature_images: 'Feature images',
  cta_background: 'CTA background',
  cta_image: 'CTA image',
  text_image: 'Text image',
  text_background: 'Text background',
  content_image: 'Content image',
  content_background: 'Content background',
  card_image: 'Card image',
  card_icon: 'Card icon',
  list_icons: 'List icons',
  list_images: 'List images',
  grid_images: 'Grid images',
  grid_background: 'Grid background'
} as const;

export function LinkedAssetsDisplay({ 
  assets, 
  className = '',
  showPreviews = true,
  compact = false
}: LinkedAssetsDisplayProps) {
  const [loadedAssets] = useState<Record<string, Asset>>({});
  const [loadingAssets, setLoadingAssets] = useState<Set<string>>(new Set());
  const [assetErrors, setAssetErrors] = useState<Set<string>>(new Set());

  // Load asset details
  useEffect(() => {
    const loadAssets = async () => {
      const assetIds = assets.map(a => a.asset_id);
      const newLoadingAssets = new Set<string>();

      for (const assetId of assetIds) {
        if (!loadedAssets[assetId] && !loadingAssets.has(assetId)) {
          newLoadingAssets.add(assetId);
        }
      }

      if (newLoadingAssets.size > 0) {
        setLoadingAssets(prev => new Set([...prev, ...newLoadingAssets]));
        
        // In a real implementation, you would fetch asset details here
        // For now, we'll simulate loading
        setTimeout(() => {
          setLoadingAssets(prev => {
            const updated = new Set(prev);
            newLoadingAssets.forEach(id => updated.delete(id));
            return updated;
          });
        }, 1000);
      }
    };

    loadAssets();
  }, [assets, loadedAssets, loadingAssets]);

  // Get role description
  const getRoleDescription = (role: string) => {
    return ROLE_DESCRIPTIONS[role as keyof typeof ROLE_DESCRIPTIONS] || 'Asset';
  };

  // Get asset icon based on type
  const getAssetIcon = (asset?: Asset) => {
    if (!asset) return mdiFile;
    switch (asset.kind) {
      case 'image':
        return mdiImage;
      case 'video':
        return mdiFile; // You might want a video icon
      default:
        return mdiFile;
    }
  };

  // Get asset preview URL
  const getAssetPreviewUrl = (asset: Asset) => {
    if (asset.kind === 'image') {
      return getAssetVariantUrl(asset, 'thumbnail');
    }
    return getAssetUrl(asset);
  };

  if (assets.length === 0) {
    return (
      <div className={`text-center py-4 text-gray-500 ${className}`}>
        <Icon path={mdiImage} size={1.5} className="mx-auto mb-2 text-gray-600" />
        <p className="text-sm">No assets linked</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {assets.map((linkedAsset, index) => {
        const asset = loadedAssets[linkedAsset.asset_id];
        const isLoading = loadingAssets.has(linkedAsset.asset_id);
        const hasError = assetErrors.has(linkedAsset.asset_id);

        return (
          <div 
            key={`${linkedAsset.role}-${linkedAsset.asset_id}-${index}`}
            className={`bg-gray-800 rounded-lg p-3 ${
              compact ? 'p-2' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Asset Preview/Icon */}
              <div className="flex-shrink-0">
                {isLoading ? (
                  <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                    <Icon path={mdiLoading} size={1} className="text-gray-400 animate-spin" />
                  </div>
                ) : hasError ? (
                  <div className="w-12 h-12 bg-red-900 rounded-lg flex items-center justify-center">
                    <Icon path={mdiAlertCircle} size={1} className="text-red-400" />
                  </div>
                ) : asset && showPreviews && asset.kind === 'image' ? (
                  <div className="w-12 h-12 bg-gray-700 rounded-lg overflow-hidden">
                    <img
                      src={getAssetPreviewUrl(asset)}
                      alt={linkedAsset.role}
                      className="w-full h-full object-cover"
                      onError={() => setAssetErrors(prev => new Set([...prev, linkedAsset.asset_id]))}
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                    <Icon path={getAssetIcon(asset)} size={1} className="text-gray-400" />
                  </div>
                )}
              </div>

              {/* Asset Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Icon path={mdiTag} size={0.8} className="text-blue-400" />
                  <span className="text-sm font-medium text-gray-300 capitalize">
                    {linkedAsset.role.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="text-xs text-gray-500 mb-1">
                  {getRoleDescription(linkedAsset.role)}
                </div>

                <div className="text-xs text-gray-400 font-mono">
                  ID: {linkedAsset.asset_id.slice(0, 8)}...
                </div>

                {asset && (
                  <div className="text-xs text-gray-500 mt-1">
                    {asset.kind.toUpperCase()} • {asset.width && asset.height ? `${asset.width}×${asset.height}` : 'Unknown size'}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {asset && showPreviews && (
                  <button
                    onClick={() => {
                      // Open asset in new tab or modal
                      window.open(getAssetUrl(asset), '_blank');
                    }}
                    className="p-1 text-gray-400 hover:text-blue-400 rounded"
                    title="View full size"
                  >
                    <Icon path={mdiEye} size={0.8} />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Compact version for use in lists
export function LinkedAssetsCompact({ 
  assets, 
  siteId, 
  className = '' 
}: Omit<LinkedAssetsDisplayProps, 'showPreviews' | 'compact'>) {
  return (
    <LinkedAssetsDisplay
      assets={assets}
      siteId={siteId}
      className={className}
      showPreviews={false}
      compact={true}
    />
  );
}

// Summary component showing asset counts by role
export function LinkedAssetsSummary({ 
  assets, 
  className = '' 
}: { 
  assets: Array<{ role: string; asset_id: string }>; 
  className?: string; 
}) {
  const assetsByRole = assets.reduce((acc, asset) => {
    acc[asset.role] = (acc[asset.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (Object.keys(assetsByRole).length === 0) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        No assets linked
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {Object.entries(assetsByRole).map(([role, count]) => (
        <span
          key={role}
          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-900 text-blue-300 rounded text-xs"
        >
          <Icon path={mdiTag} size={0.6} />
          {role.replace('_', ' ')} ({count})
        </span>
      ))}
    </div>
  );
}
