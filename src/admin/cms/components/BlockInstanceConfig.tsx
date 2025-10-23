// Block Instance Configuration Component
// Configures block instances with version selection and props

import { useState, useEffect } from 'react';
import { Icon } from '@mdi/react';
import { 
  mdiClose,
  mdiContentSave,
  mdiRefresh,
  mdiPlus,
  mdiMinus
} from '@mdi/js';
import type { BlockInstance } from '../../../lib/cms/types';

interface BlockInstanceConfigProps {
  blockInstance: BlockInstance;
  onSave: (blockInstance: BlockInstance) => void;
  onClose: () => void;
}

interface BlockVersion {
  id: string;
  version: number;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
}

export function BlockInstanceConfig({ blockInstance, onSave, onClose }: BlockInstanceConfigProps) {
  const [versionMode, setVersionMode] = useState<'latest' | 'pinned'>('latest');
  const [pinnedVersion, setPinnedVersion] = useState<number>(1);
  const [availableVersions, setAvailableVersions] = useState<BlockVersion[]>([]);
  const [instanceProps, setInstanceProps] = useState<Record<string, unknown>>(blockInstance.instance_props || {});
  const [propsJson, setPropsJson] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  // const [isLoading, setIsLoading] = useState(false); // TODO: Implement loading state

  // Load available versions for the block
  useEffect(() => {
    loadBlockVersions();
  }, [blockInstance.block_id]);

  // Initialize props JSON
  useEffect(() => {
    setPropsJson(JSON.stringify(instanceProps, null, 2));
  }, [instanceProps]);

  const loadBlockVersions = async () => {
    try {
      // TODO: Implement actual API call to get block versions
      // For now, simulate with mock data
      const mockVersions: BlockVersion[] = [
        { id: '1', version: 1, status: 'published', created_at: '2024-01-01T00:00:00Z' },
        { id: '2', version: 2, status: 'draft', created_at: '2024-01-02T00:00:00Z' },
        { id: '3', version: 3, status: 'draft', created_at: '2024-01-03T00:00:00Z' }
      ];
      setAvailableVersions(mockVersions);
    } catch (error) {
      console.error('Failed to load block versions:', error);
    }
  };

  const handlePropsJsonChange = (value: string) => {
    setPropsJson(value);
    setJsonError(null);
    
    try {
      const parsed = JSON.parse(value);
      setInstanceProps(parsed);
    } catch (error) {
      setJsonError('Invalid JSON format');
    }
  };

  const handleSave = () => {
    const updatedBlock: BlockInstance = {
      ...blockInstance,
      instance_props: instanceProps,
      // Add version tracking if needed
    };
    onSave(updatedBlock);
  };

  const addProp = () => {
    const newProps = { ...instanceProps, [`prop_${Date.now()}`]: '' };
    setInstanceProps(newProps);
  };

  const removeProp = (key: string) => {
    const newProps = { ...instanceProps };
    delete newProps[key];
    setInstanceProps(newProps);
  };

  const updateProp = (key: string, value: string) => {
    const newProps = { ...instanceProps };
    try {
      // Try to parse as JSON, fallback to string
      newProps[key] = JSON.parse(value);
    } catch {
      newProps[key] = value;
    }
    setInstanceProps(newProps);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-white">Block Configuration</h2>
            <p className="text-sm text-gray-400">Block ID: {blockInstance.block_id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
          >
            <Icon path={mdiClose} size={1.2} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Version Configuration */}
          <div className="bg-gray-750 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-4">Version Configuration</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="versionMode"
                    value="latest"
                    checked={versionMode === 'latest'}
                    onChange={(e) => setVersionMode(e.target.value as 'latest' | 'pinned')}
                    className="text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-white">Follow Latest Version</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="versionMode"
                    value="pinned"
                    checked={versionMode === 'pinned'}
                    onChange={(e) => setVersionMode(e.target.value as 'latest' | 'pinned')}
                    className="text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-white">Pin to Specific Version</span>
                </label>
              </div>

              {versionMode === 'pinned' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Version Number
                  </label>
                  <select
                    value={pinnedVersion}
                    onChange={(e) => setPinnedVersion(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {availableVersions.map(version => (
                      <option key={version.id} value={version.version}>
                        Version {version.version} ({version.status})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="text-sm text-gray-400">
                {versionMode === 'latest' 
                  ? 'This block will automatically use the latest published version'
                  : `This block will use version ${pinnedVersion}`
                }
              </div>
            </div>
          </div>

          {/* Instance Properties */}
          <div className="bg-gray-750 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Instance Properties</h3>
              <button
                onClick={addProp}
                className="flex items-center space-x-2 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
              >
                <Icon path={mdiPlus} size={0.8} />
                <span>Add Property</span>
              </button>
            </div>

            <div className="space-y-3">
              {Object.entries(instanceProps).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={key}
                    onChange={(e) => {
                      const newProps = { ...instanceProps };
                      delete newProps[key];
                      newProps[e.target.value] = value;
                      setInstanceProps(newProps);
                    }}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Property name"
                  />
                  <input
                    type="text"
                    value={typeof value === 'string' ? value : JSON.stringify(value)}
                    onChange={(e) => updateProp(key, e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Property value"
                  />
                  <button
                    onClick={() => removeProp(key)}
                    className="p-2 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Icon path={mdiMinus} size={0.8} />
                  </button>
                </div>
              ))}

              {Object.keys(instanceProps).length === 0 && (
                <div className="text-center py-4 text-gray-400">
                  <p>No properties configured</p>
                  <p className="text-sm">Click "Add Property" to configure block-specific settings</p>
                </div>
              )}
            </div>

            {/* JSON Editor */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">JSON Editor</label>
                <button
                  onClick={() => setPropsJson(JSON.stringify(instanceProps, null, 2))}
                  className="flex items-center space-x-1 px-2 py-1 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
                >
                  <Icon path={mdiRefresh} size={0.7} />
                  <span>Reset</span>
                </button>
              </div>
              <textarea
                value={propsJson}
                onChange={(e) => handlePropsJsonChange(e.target.value)}
                className={`w-full h-32 px-3 py-2 bg-gray-700 border rounded-md text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  jsonError ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Enter JSON properties..."
              />
              {jsonError && (
                <p className="text-red-400 text-sm mt-1">{jsonError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <div className="text-sm text-gray-400">
            {Object.keys(instanceProps).length} properties configured
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!!jsonError}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon path={mdiContentSave} size={0.9} />
              <span>Save Configuration</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
