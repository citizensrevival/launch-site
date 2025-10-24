// Block Asset Manager Component
// Manages assets associated with a block

import { useState } from 'react';
import { Icon } from '@mdi/react';
import { mdiPlus, mdiTrashCanOutline, mdiImage } from '@mdi/js';

interface BlockAssetManagerProps {
  assets: Array<{ role: string; asset_id: string }>;
  onAssetsChange: (assets: Array<{ role: string; asset_id: string }>) => void;
  blockType: string;
}

export function BlockAssetManager({ 
  assets, 
  onAssetsChange
}: BlockAssetManagerProps) {
  const [newRole, setNewRole] = useState('');
  const [newAssetId, setNewAssetId] = useState('');

  const addAsset = () => {
    if (newRole && newAssetId) {
      const newAsset = {
        role: newRole,
        asset_id: newAssetId,
      };
      onAssetsChange([...assets, newAsset]);
      setNewRole('');
      setNewAssetId('');
    }
  };

  const removeAsset = (index: number) => {
    const updatedAssets = assets.filter((_, i) => i !== index);
    onAssetsChange(updatedAssets);
  };

  const commonRoles = [
    'background',
    'hero-image',
    'icon',
    'thumbnail',
    'logo',
    'banner',
  ];

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-300 mb-2">Block Assets</h4>
      
      {/* Add New Asset */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            placeholder="Role (e.g., background)"
            className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
          />
          <input
            type="text"
            value={newAssetId}
            onChange={(e) => setNewAssetId(e.target.value)}
            placeholder="Asset ID"
            className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
          />
          <button
            onClick={addAsset}
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <Icon path={mdiPlus} size={0.8} />
          </button>
        </div>
        
        {/* Common Roles */}
        <div className="flex flex-wrap gap-1">
          {commonRoles.map((role) => (
            <button
              key={role}
              onClick={() => setNewRole(role)}
              className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Asset List */}
      <div className="space-y-2">
        {assets.map((asset, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 bg-gray-800 rounded"
          >
            <div className="flex items-center gap-2">
              <Icon path={mdiImage} size={0.8} className="text-gray-400" />
              <span className="text-sm text-white">{asset.role}</span>
              <span className="text-xs text-gray-400">{asset.asset_id}</span>
            </div>
            <button
              onClick={() => removeAsset(index)}
              className="p-1 text-red-400 hover:text-red-300 transition-colors"
            >
              <Icon path={mdiTrashCanOutline} size={0.8} />
            </button>
          </div>
        ))}
      </div>

      {assets.length === 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">
          No assets assigned to this block
        </div>
      )}
    </div>
  );
}