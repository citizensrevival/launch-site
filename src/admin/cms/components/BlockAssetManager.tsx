// Block Asset Manager Component
// Enhanced asset management for blocks with role-based linking

import { useState, useMemo } from 'react';
import { Icon } from '@mdi/react';
import { 
  mdiPlus,
  mdiTrashCanOutline,
  mdiImage,
  mdiFile,
  mdiEye,
  mdiPencil,
  mdiTag,
  mdiAlertCircle
} from '@mdi/js';
import { AssetPicker } from './AssetPicker';
import { getAssetUrl, getAssetVariantUrl } from '../../../lib/cms/utils';
import { getBlockTypeAssetRoles, getBlockTypeRequiredAssets, validateBlockAssets } from '../../../lib/cms/blockTypes';
import type { Asset } from '../../../lib/cms/types';

interface BlockAsset {
  role: string;
  asset_id: string;
  asset?: Asset;
}

interface BlockAssetManagerProps {
  assets: Array<{ role: string; asset_id: string }>;
  onAssetsChange: (assets: Array<{ role: string; asset_id: string }>) => void;
  blockType?: string;
  availableRoles?: string[];
  className?: string;
}

// Asset role definitions based on block types
const ASSET_ROLES = {
  hero: ['hero_image', 'hero_background'],
  features: ['feature_icons', 'feature_images'],
  cta: ['cta_background', 'cta_image'],
  text: ['text_image', 'text_background'],
  'image-text': ['content_image', 'content_background'],
  card: ['card_image', 'card_icon'],
  list: ['list_icons', 'list_images'],
  grid: ['grid_images', 'grid_background']
} as const;

// Role descriptions for better UX
const ROLE_DESCRIPTIONS = {
  hero_image: 'Main hero image displayed prominently',
  hero_background: 'Background image for hero section',
  feature_icons: 'Icons representing features',
  feature_images: 'Images showcasing features',
  cta_background: 'Background for call-to-action section',
  cta_image: 'Supporting image for call-to-action',
  text_image: 'Image accompanying text content',
  text_background: 'Background for text section',
  content_image: 'Main content image',
  content_background: 'Background for content section',
  card_image: 'Image displayed on card',
  card_icon: 'Icon for card',
  list_icons: 'Icons for list items',
  list_images: 'Images for list items',
  grid_images: 'Images for grid items',
  grid_background: 'Background for grid section'
} as const;

export function BlockAssetManager({ 
  assets, 
  onAssetsChange, 
  blockType,
  availableRoles,
  className = '' 
}: BlockAssetManagerProps) {
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [editingAsset, setEditingAsset] = useState<BlockAsset | null>(null);

  // Get available roles for the block type
  const roles = useMemo(() => {
    if (availableRoles) return availableRoles;
    if (blockType) {
      return getBlockTypeAssetRoles(blockType);
    }
    return ['content', 'background', 'icon', 'thumbnail'];
  }, [blockType, availableRoles]);

  // Get required assets for validation
  const requiredAssets = useMemo(() => {
    if (blockType) {
      return getBlockTypeRequiredAssets(blockType);
    }
    return [];
  }, [blockType]);

  // Validate assets
  const assetValidation = useMemo(() => {
    if (blockType) {
      return validateBlockAssets(blockType, assets);
    }
    return { valid: true, errors: [] };
  }, [blockType, assets]);

  // Get role description
  const getRoleDescription = (role: string) => {
    return ROLE_DESCRIPTIONS[role as keyof typeof ROLE_DESCRIPTIONS] || 'Asset for this block';
  };

  // Handle adding new asset
  const handleAddAsset = (role: string) => {
    setSelectedRole(role);
    setShowAssetPicker(true);
  };

  // Handle asset selection from picker
  const handleAssetSelect = (assetId: string) => {
    if (selectedRole) {
      const newAssets = [...assets, { role: selectedRole, asset_id: assetId }];
      onAssetsChange(newAssets);
      setShowAssetPicker(false);
      setSelectedRole('');
    }
  };

  // Handle removing asset
  const handleRemoveAsset = (role: string, assetId: string) => {
    const newAssets = assets.filter(asset => 
      !(asset.role === role && asset.asset_id === assetId)
    );
    onAssetsChange(newAssets);
  };

  // Handle editing asset role
  const handleEditAsset = (asset: BlockAsset) => {
    setEditingAsset(asset);
  };

  // Handle role change
  const handleRoleChange = (oldRole: string, assetId: string, newRole: string) => {
    const newAssets = assets.map(asset => 
      asset.role === oldRole && asset.asset_id === assetId
        ? { ...asset, role: newRole }
        : asset
    );
    onAssetsChange(newAssets);
    setEditingAsset(null);
  };

  // Group assets by role
  const assetsByRole = useMemo(() => {
    const grouped: Record<string, Array<{ role: string; asset_id: string }>> = {};
    assets.forEach(asset => {
      if (!grouped[asset.role]) {
        grouped[asset.role] = [];
      }
      grouped[asset.role].push(asset);
    });
    return grouped;
  }, [assets]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-300">Block Assets</h4>
        <div className="flex items-center gap-2">
          {!assetValidation.valid && (
            <div className="flex items-center gap-1 text-red-400">
              <Icon path={mdiAlertCircle} size={0.8} />
              <span className="text-xs">Validation errors</span>
            </div>
          )}
          <div className="text-xs text-gray-500">
            {assets.length} asset{assets.length !== 1 ? 's' : ''} linked
          </div>
        </div>
      </div>

      {/* Validation Errors */}
      {!assetValidation.valid && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Icon path={mdiAlertCircle} size={0.8} className="text-red-400" />
            <span className="text-sm font-medium text-red-300">Asset Validation Errors</span>
          </div>
          <ul className="text-xs text-red-300 space-y-1">
            {assetValidation.errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Assets by Role */}
      {Object.keys(assetsByRole).length > 0 ? (
        <div className="space-y-3">
          {Object.entries(assetsByRole).map(([role, roleAssets]) => (
            <div key={role} className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon path={mdiTag} size={0.8} className="text-blue-400" />
                  <span className="text-sm font-medium text-gray-300 capitalize">
                    {role.replace('_', ' ')}
                  </span>
                  {requiredAssets.includes(role) && (
                    <span className="text-xs bg-red-900 text-red-300 px-2 py-1 rounded">
                      Required
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    ({roleAssets.length})
                  </span>
                </div>
                <button
                  onClick={() => handleAddAsset(role)}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <Icon path={mdiPlus} size={0.6} />
                  Add
                </button>
              </div>
              
              <div className="text-xs text-gray-500 mb-2">
                {getRoleDescription(role)}
              </div>

              <div className="space-y-2">
                {roleAssets.map((asset, index) => (
                  <div key={`${asset.role}-${asset.asset_id}-${index}`} className="flex items-center gap-2 p-2 bg-gray-700 rounded">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center">
                        <Icon path={mdiImage} size={0.8} className="text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-300 truncate">
                        Asset {asset.asset_id.slice(0, 8)}...
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {asset.asset_id}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditAsset({ ...asset, asset: undefined })}
                        className="p-1 text-gray-400 hover:text-blue-400 rounded"
                        title="Edit role"
                      >
                        <Icon path={mdiPencil} size={0.8} />
                      </button>
                      
                      <button
                        onClick={() => handleRemoveAsset(asset.role, asset.asset_id)}
                        className="p-1 text-gray-400 hover:text-red-400 rounded"
                        title="Remove asset"
                      >
                        <Icon path={mdiTrashCanOutline} size={0.8} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Icon path={mdiImage} size={2} className="mx-auto mb-2 text-gray-600" />
          <p className="text-sm">No assets linked to this block</p>
          <p className="text-xs">Add assets to enhance your block content</p>
        </div>
      )}

      {/* Add Asset Buttons */}
      <div className="space-y-2">
        <div className="text-xs text-gray-400 mb-2">Add assets by role:</div>
        <div className="grid grid-cols-2 gap-2">
          {roles.map(role => (
            <button
              key={role}
              onClick={() => handleAddAsset(role)}
              className="flex items-center gap-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors"
            >
              <Icon path={mdiPlus} size={0.8} className="text-blue-400" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-300 capitalize">
                  {role.replace('_', ' ')}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {getRoleDescription(role)}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Asset Picker Modal */}
      {showAssetPicker && (
        <AssetPicker
          isOpen={showAssetPicker}
          onClose={() => {
            setShowAssetPicker(false);
            setSelectedRole('');
          }}
          onAssetSelect={handleAssetSelect}
        />
      )}

      {/* Role Editor Modal */}
      {editingAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Edit Asset Role</h3>
              <button
                onClick={() => setEditingAsset(null)}
                className="text-gray-400 hover:text-white"
              >
                <Icon path={mdiClose} size={1} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Asset Role
                </label>
                <select
                  value={editingAsset.role}
                  onChange={(e) => setEditingAsset({ ...editingAsset, role: e.target.value })}
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  {roles.map(role => (
                    <option key={role} value={role}>
                      {role.replace('_', ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
                <div className="text-xs text-gray-500 mt-1">
                  {getRoleDescription(editingAsset.role)}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setEditingAsset(null)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRoleChange(
                    editingAsset.role, 
                    editingAsset.asset_id, 
                    editingAsset.role
                  )}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Asset Picker Button Component
interface AssetPickerButtonProps {
  onAssetSelect: (assetId: string) => void;
  buttonText?: string;
  buttonIcon?: string;
  role?: string;
  className?: string;
}

export function AssetPickerButton({ 
  onAssetSelect, 
  buttonText = "Add Asset",
  buttonIcon = mdiPlus,
  role,
  className = ""
}: AssetPickerButtonProps) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowPicker(true)}
        className={`flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm ${className}`}
      >
        <Icon path={buttonIcon} size={0.8} />
        {buttonText}
        {role && (
          <span className="text-xs bg-blue-500 px-2 py-1 rounded">
            {role}
          </span>
        )}
      </button>

      {showPicker && (
        <AssetPicker
          isOpen={showPicker}
          onClose={() => setShowPicker(false)}
          onAssetSelect={(assetId) => {
            onAssetSelect(assetId);
            setShowPicker(false);
          }}
        />
      )}
    </>
  );
}
