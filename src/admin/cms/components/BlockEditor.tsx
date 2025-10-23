// Block Editor Component
// Main interface for editing block versions with layout variants, content, and assets

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Icon } from '@mdi/react';
import { 
  mdiClose, 
  mdiContentSave, 
  mdiEye,
  mdiChevronDown,
} from '@mdi/js';
import { useBlockVersions, useBlockVersionManagement, useBlockManagement } from '../../../lib/cms/hooks';
import { BlockContentEditor } from './BlockContentEditor';
import { BlockAssetManager } from './BlockAssetManager';
import type { Block, BlockVersion, LocalizedContent } from '../../../lib/cms/types';

interface BlockEditorProps {
  block: Block;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (version: BlockVersion) => void;
}

export function BlockEditor({ block, isOpen, onClose, onSave }: BlockEditorProps) {
  const { versions } = useBlockVersions(block.id);
  const { createBlockVersion, loading: managementLoading } = useBlockVersionManagement();
  const { publishBlock } = useBlockManagement();

  // State for current editing session
  const [currentVersion, setCurrentVersion] = useState<BlockVersion | null>(null);
  const [layoutVariant, setLayoutVariant] = useState<string>('default');
  const [content, setContent] = useState<LocalizedContent<Record<string, unknown>>>({});
  const [assets, setAssets] = useState<Array<{ role: string; asset_id: string }>>([]);
  const [isDraft, setIsDraft] = useState(true);
  const [showVersionSelector, setShowVersionSelector] = useState(false);
  const isInitializing = useRef(false);

  // Initialize editor when block changes
  useEffect(() => {
    if (isInitializing.current) {
      return;
    }
    
    if (block && versions && versions.length > 0) {
      // Load the latest version by default
      const latestVersion = versions[0];
      isInitializing.current = true;
      setCurrentVersion(latestVersion);
      setLayoutVariant(latestVersion.layout_variant);
      setContent(latestVersion.content);
      setAssets(latestVersion.assets);
      setIsDraft(latestVersion.status === 'draft');
      setTimeout(() => { isInitializing.current = false; }, 0);
    } else if (block) {
      // Initialize with empty content for new block
      isInitializing.current = true;
      setCurrentVersion(null);
      setLayoutVariant('default');
      setContent({});
      setAssets([]);
      setIsDraft(true);
      setTimeout(() => { isInitializing.current = false; }, 0);
    }
  }, [block?.id, versions?.length]);

  // Stable callback for content changes
  const handleContentChange = useCallback((newContent: LocalizedContent<Record<string, unknown>>) => {
    setContent(newContent);
  }, []);

  // Layout variant options
  const layoutVariants = useMemo(() => [
    { value: 'default', label: 'Default Layout' },
    { value: 'hero', label: 'Hero Layout' },
    { value: 'card', label: 'Card Layout' },
    { value: 'list', label: 'List Layout' },
    { value: 'grid', label: 'Grid Layout' }
  ], []);

  // Handle save version
  const handleSave = async () => {
    try {
      console.log('💾 [BlockEditor] Saving block version:', {
        blockId: block.id,
        layoutVariant,
        content,
        assets,
        isDraft
      });

      // Get the next version number
      const nextVersion = currentVersion ? currentVersion.version + 1 : 1;
      
      const versionData = {
        block_id: block.id,
        version: nextVersion,
        layout_variant: layoutVariant,
        content,
        assets,
        status: isDraft ? 'draft' as const : 'published' as const
      };

      let savedVersion: BlockVersion | null = null;

      // Always create a new version for now
      // TODO: Add logic to update existing versions if needed
      const response = await createBlockVersion(versionData);
      savedVersion = response;

      if (savedVersion) {
        console.log('✅ [BlockEditor] Version saved successfully:', savedVersion);
        setCurrentVersion(savedVersion);
        onSave?.(savedVersion);
      } else {
        console.error('❌ [BlockEditor] Failed to save version');
      }
    } catch (error) {
      console.error('❌ [BlockEditor] Error saving version:', error);
    }
  };

  // Handle publish
  const handlePublish = async () => {
    if (!currentVersion) return;

    try {
      console.log('📢 [BlockEditor] Publishing block version:', currentVersion.id);
      const response = await publishBlock(block.id, currentVersion.version);
      
      if (response) {
        console.log('✅ [BlockEditor] Version published successfully');
        setIsDraft(false);
      } else {
        console.error('❌ [BlockEditor] Failed to publish version');
      }
    } catch (error) {
      console.error('❌ [BlockEditor] Error publishing version:', error);
    }
  };

  // Handle version selection
  const handleVersionSelect = (version: BlockVersion) => {
    setCurrentVersion(version);
    setLayoutVariant(version.layout_variant);
    setContent(version.content);
    setAssets(version.assets);
    setIsDraft(version.status === 'draft');
    setShowVersionSelector(false);
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-white">
              Edit Block: {block.type}
            </h2>
            {currentVersion && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Version {currentVersion.version}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  currentVersion.status === 'published' 
                    ? 'bg-green-900 text-green-300' 
                    : 'bg-yellow-900 text-yellow-300'
                }`}>
                  {currentVersion.status}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Icon path={mdiClose} size={1.2} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Version Management */}
          <div className="w-80 bg-gray-900 border-r border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-medium text-white mb-4">Version Management</h3>
              
              {/* Version Selector */}
              <div className="mb-4">
                <button
                  onClick={() => setShowVersionSelector(!showVersionSelector)}
                  className="w-full flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <span className="text-white">
                    {currentVersion ? `Version ${currentVersion.version}` : 'Select Version'}
                  </span>
                  <Icon 
                    path={mdiChevronDown} 
                    size={1} 
                    className={`text-gray-400 transition-transform ${showVersionSelector ? 'rotate-180' : ''}`}
                  />
                </button>
                
                {showVersionSelector && versions && (
                  <div className="mt-2 bg-gray-800 rounded-lg border border-gray-700 max-h-48 overflow-y-auto">
                    {versions.map((version) => (
                      <button
                        key={version.id}
                        onClick={() => handleVersionSelect(version)}
                        className={`w-full p-3 text-left hover:bg-gray-700 transition-colors ${
                          currentVersion?.id === version.id ? 'bg-blue-900' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-white">Version {version.version}</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            version.status === 'published' 
                              ? 'bg-green-900 text-green-300' 
                              : 'bg-yellow-900 text-yellow-300'
                          }`}>
                            {version.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400 mt-1">
                          {new Date(version.created_at).toLocaleDateString()}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Layout Variant Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Layout Variant
                </label>
                <select
                  value={layoutVariant}
                  onChange={(e) => setLayoutVariant(e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  {layoutVariants.map((variant) => (
                    <option key={variant.value} value={variant.value}>
                      {variant.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Asset Management */}
              <div className="mb-4">
                <BlockAssetManager
                  assets={assets}
                  onAssetsChange={setAssets}
                  blockType={block.type}
                />
              </div>
            </div>
          </div>

          {/* Right Panel - Content Editor */}
          <div className="flex-1 flex flex-col">
            <BlockContentEditor
              content={content}
              onChange={handleContentChange}
              layoutVariant={layoutVariant}
              blockType={block.type}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isDraft}
                onChange={(e) => setIsDraft(e.target.checked)}
                className="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-300">Save as Draft</span>
            </label>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={managementLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Icon path={mdiContentSave} size={1} />
              {managementLoading ? 'Saving...' : 'Save Version'}
            </button>
            {currentVersion && currentVersion.status === 'draft' && (
              <button
                onClick={handlePublish}
                disabled={managementLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Icon path={mdiEye} size={1} />
                Publish
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
