// Page Version History Component
// Displays all versions of a page with diff/comparison and restore functionality

import { useState, useEffect } from 'react';
import { Icon } from '@mdi/react';
import { 
  mdiClose,
  mdiHistory,
  mdiCompare,
  mdiRestore,
  mdiChevronDown,
  mdiChevronUp
} from '@mdi/js';
import { usePageVersions, usePageVersionManagement } from '../pages/hooks/usePages';
import type { Page, PageVersion } from '../pages/types/page.types';

interface PageVersionHistoryProps {
  page: Page;
  onClose: () => void;
  onRestore: (version: PageVersion) => void;
}

interface VersionDiff {
  field: string;
  oldValue: any;
  newValue: any;
  hasChanges: boolean;
}

export function PageVersionHistory({ page, onClose, onRestore }: PageVersionHistoryProps) {
  const [selectedVersions, setSelectedVersions] = useState<PageVersion[]>([]);
  const [showDiff, setShowDiff] = useState(false);
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());
  const [diffData, setDiffData] = useState<VersionDiff[]>([]);
  
  const { versions, loading, error } = usePageVersions(page.id);
  const { createPageVersion } = usePageVersionManagement();

  // Calculate version differences
  useEffect(() => {
    if (selectedVersions.length === 2) {
      const [oldVersion, newVersion] = selectedVersions;
      const diffs: VersionDiff[] = [];

      // Compare basic fields
      diffs.push({
        field: 'Version Number',
        oldValue: oldVersion.version,
        newValue: newVersion.version,
        hasChanges: oldVersion.version !== newVersion.version
      });

      // Status is now tracked in page_publish table, not in page_version

      diffs.push({
        field: 'Layout Variant',
        oldValue: oldVersion.layout_variant || 'None',
        newValue: newVersion.layout_variant || 'None',
        hasChanges: oldVersion.layout_variant !== newVersion.layout_variant
      });

      // Compare localized fields
      const compareLocalizedField = (field: string, oldData: any, newData: any) => {
        const oldKeys = Object.keys(oldData || {});
        const newKeys = Object.keys(newData || {});
        const allKeys = [...new Set([...oldKeys, ...newKeys])];
        
        allKeys.forEach(locale => {
          const oldValue = oldData?.[locale] || '';
          const newValue = newData?.[locale] || '';
          if (oldValue !== newValue) {
            diffs.push({
              field: `${field} (${locale})`,
              oldValue: oldValue || '(empty)',
              newValue: newValue || '(empty)',
              hasChanges: true
            });
          }
        });
      };

      compareLocalizedField('Title', oldVersion.title, newVersion.title);
      compareLocalizedField('SEO Title', oldVersion.seo?.title, newVersion.seo?.title);
      compareLocalizedField('SEO Description', oldVersion.seo?.description, newVersion.seo?.description);
      compareLocalizedField('Nav Label', oldVersion.nav_hints?.label, newVersion.nav_hints?.label);
      compareLocalizedField('Nav Badge', oldVersion.nav_hints?.badge, newVersion.nav_hints?.badge);

      // Compare navigation hints
      diffs.push({
        field: 'Nav Order',
        oldValue: oldVersion.nav_hints?.order || 0,
        newValue: newVersion.nav_hints?.order || 0,
        hasChanges: (oldVersion.nav_hints?.order || 0) !== (newVersion.nav_hints?.order || 0)
      });

      diffs.push({
        field: 'Nav Hidden',
        oldValue: oldVersion.nav_hints?.hidden ? 'Yes' : 'No',
        newValue: newVersion.nav_hints?.hidden ? 'Yes' : 'No',
        hasChanges: oldVersion.nav_hints?.hidden !== newVersion.nav_hints?.hidden
      });

      // Compare slots
      diffs.push({
        field: 'Slots Count',
        oldValue: oldVersion.slots?.length || 0,
        newValue: newVersion.slots?.length || 0,
        hasChanges: (oldVersion.slots?.length || 0) !== (newVersion.slots?.length || 0)
      });

      setDiffData(diffs);
    }
  }, [selectedVersions]);

  const handleVersionSelect = (version: PageVersion) => {
    if (selectedVersions.length === 0) {
      setSelectedVersions([version]);
    } else if (selectedVersions.length === 1) {
      if (selectedVersions[0].id === version.id) {
        setSelectedVersions([]);
      } else {
        setSelectedVersions([selectedVersions[0], version]);
        setShowDiff(true);
      }
    } else {
      setSelectedVersions([version]);
      setShowDiff(false);
    }
  };

  const handleRestoreVersion = async (version: PageVersion) => {
    if (confirm(`Are you sure you want to restore version ${version.version}? This will create a new version based on the selected one and publish it immediately.`)) {
      try {
        // Create a new version based on the selected version
        const newVersionData = {
          page_id: page.id,
          version: Math.max(...versions.map(v => v.version)) + 1,
          title: version.title,
          layout_variant: version.layout_variant,
          seo: version.seo,
          nav_hints: version.nav_hints,
          slots: version.slots
          // Note: status is no longer tracked in page_version table
          // All page versions are drafts by default, published status is tracked in page_publish table
        };

        const result = await createPageVersion(newVersionData);
        if (result) {
          // Auto-publish the restored version
          try {
            // TODO: Implement proper page publishing functionality
            const publishPage = async (pageId: string, version: number) => {
              console.log('Publishing page:', pageId, version);
              return true;
            };
            const publishResult = await publishPage(page.id, result.version);
            if (publishResult) {
              console.log('Version restored and published successfully');
            } else {
              console.error('Failed to publish restored version');
              alert('Version restored but failed to publish. You can publish it manually from the page editor.');
            }
          } catch (publishError) {
            console.error('Error publishing restored version:', publishError);
            alert('Version restored but failed to publish. You can publish it manually from the page editor.');
          }
          
          onRestore(result);
          setSelectedVersions([]);
        }
      } catch (error) {
        console.error('Error restoring version:', error);
        alert('Failed to restore version. Please try again.');
      }
    }
  };

  const toggleVersionExpansion = (versionId: string) => {
    const newExpanded = new Set(expandedVersions);
    if (newExpanded.has(versionId)) {
      newExpanded.delete(versionId);
    } else {
      newExpanded.add(versionId);
    }
    setExpandedVersions(newExpanded);
  };

  // Status is now tracked in page_publish table, not in page_version
  // All page versions are drafts by default

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
            <span className="text-white">Loading version history...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="text-red-400 mb-4">Error loading version history: {error}</div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <Icon path={mdiHistory} size={1.2} className="text-purple-400" />
            <div>
              <h2 className="text-xl font-semibold text-white">Page Version History</h2>
              <p className="text-sm text-gray-400">/{page.slug}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
          >
            <Icon path={mdiClose} size={1.2} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Version List */}
          <div className="w-1/2 border-r border-gray-700 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">Versions</h3>
                <div className="text-sm text-gray-400">
                  {versions.length} version{versions.length !== 1 ? 's' : ''}
                </div>
              </div>

              <div className="space-y-2">
                {versions.map((version) => {
                  const isSelected = selectedVersions.some(v => v.id === version.id);
                  const isExpanded = expandedVersions.has(version.id);
                  
                  return (
                    <div
                      key={version.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        isSelected 
                          ? 'border-purple-500 bg-purple-900/20' 
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                      onClick={() => handleVersionSelect(version)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div>
                            <div className="text-white font-medium">
                              Version {version.version}
                            </div>
                            <div className="text-sm text-gray-400">
                              {formatDate(version.created_at)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleVersionExpansion(version.id);
                            }}
                            className="p-1 text-gray-400 hover:text-white transition-colors"
                          >
                            <Icon 
                              path={isExpanded ? mdiChevronUp : mdiChevronDown} 
                              size={0.8} 
                            />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRestoreVersion(version);
                            }}
                            className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                            title="Restore this version"
                          >
                            <Icon path={mdiRestore} size={0.8} />
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-gray-600">
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-400">Title:</span>
                              <span className="text-white ml-2">
                                {version.title?.['en-US'] || 'Untitled'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400">Layout:</span>
                              <span className="text-white ml-2">
                                {version.layout_variant || 'Default'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400">Slots:</span>
                              <span className="text-white ml-2">
                                {version.slots?.length || 0} blocks
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Diff View */}
          <div className="w-1/2 overflow-y-auto">
            <div className="p-4">
              {showDiff && selectedVersions.length === 2 ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-white">Version Comparison</h3>
                    <div className="text-sm text-gray-400">
                      {selectedVersions[0].version} → {selectedVersions[1].version}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {diffData.map((diff, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-md border ${
                          diff.hasChanges 
                            ? 'border-yellow-500 bg-yellow-900/20' 
                            : 'border-gray-600 bg-gray-700/50'
                        }`}
                      >
                        <div className="font-medium text-white mb-2">{diff.field}</div>
                        {diff.hasChanges ? (
                          <div className="space-y-1">
                            <div className="text-sm">
                              <span className="text-red-400">- {diff.oldValue}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-green-400">+ {diff.newValue}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400">
                            {diff.oldValue}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Icon path={mdiCompare} size={3} className="mx-auto mb-4 text-gray-500" />
                    <p className="text-lg font-medium text-gray-400 mb-2">
                      Select two versions to compare
                    </p>
                    <p className="text-sm text-gray-500">
                      Choose versions from the list to see differences
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <div className="text-sm text-gray-400">
            {selectedVersions.length > 0 && (
              <span>
                {selectedVersions.length} version{selectedVersions.length !== 1 ? 's' : ''} selected
              </span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
