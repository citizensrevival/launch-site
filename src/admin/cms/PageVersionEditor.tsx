// Page Version Editor Component
// Comprehensive page version editing with i18n support

import { useState, useEffect } from 'react';
import { usePageVersions, usePageVersionManagement } from '../../lib/cms/hooks';
import { publishPage, unpublishPage, getPublishedPageVersion } from '../../lib/cms/client';
import type { Page, PageVersion, BlockInstance } from '../../lib/cms/types';
import { supabase } from '../../shell/lib/supabase';
import { Icon } from '@mdi/react';
import { 
  mdiClose,
  mdiTranslate,
  mdiPalette,
  mdiNavigation,
  mdiContentSaveOutline,
  mdiViewGrid,
  mdiCog,
  mdiMinus
} from '@mdi/js';
import { PageSlotEditor } from './components/PageSlotEditor';
import { BlockInstanceConfig } from './components/BlockInstanceConfig';

interface PageVersionEditorProps {
  page: Page;
  onClose: () => void;
  onSave: (version: PageVersion) => void;
}

type EditorTab = 'content' | 'navigation' | 'layout' | 'slots';

interface LocalizedField {
  [locale: string]: string;
}

const SUPPORTED_LOCALES = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'es-MX', name: 'Español (México)' },
  { code: 'fr-FR', name: 'Français' },
  { code: 'de-DE', name: 'Deutsch' }
];

const LAYOUT_VARIANTS = [
  { value: 'default', label: 'Default Layout' },
  { value: 'landing', label: 'Landing Page' },
  { value: 'blog', label: 'Blog Post' },
  { value: 'article', label: 'Article' },
  { value: 'contact', label: 'Contact Page' },
  { value: 'about', label: 'About Page' }
];

export function PageVersionEditor({ page, onClose, onSave }: PageVersionEditorProps) {
  const [activeTab, setActiveTab] = useState<EditorTab>('content');
  const [selectedLocale, setSelectedLocale] = useState<string>('en-US');
  const [currentVersion, setCurrentVersion] = useState<PageVersion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state - language-specific fields
  const [title, setTitle] = useState<LocalizedField>({});
  const [layoutVariant, setLayoutVariant] = useState<string>('');
  
  // SEO fields - language-specific
  const [seoTitle, setSeoTitle] = useState<LocalizedField>({});
  const [seoDescription, setSeoDescription] = useState<LocalizedField>({});
  const [seoKeywords, setSeoKeywords] = useState<LocalizedField>({});
  const [seoImage, setSeoImage] = useState<LocalizedField>({});
  
  // Navigation hints - language-specific
  const [navLabel, setNavLabel] = useState<LocalizedField>({});
  const [navOrder, setNavOrder] = useState<number>(0);
  const [navHidden, setNavHidden] = useState<boolean>(false);
  const [navBadge, setNavBadge] = useState<LocalizedField>({});
  
  // Slots state
  const [slots, setSlots] = useState<BlockInstance[]>([]);
  const [showSlotEditor, setShowSlotEditor] = useState(false);
  const [editingBlock, setEditingBlock] = useState<BlockInstance | null>(null);
  
  // Publish state
  const [isPublished, setIsPublished] = useState(false);
  const [publishedVersion, setPublishedVersion] = useState<number | null>(null);
  const [publishLoading, setPublishLoading] = useState(false);
  
  const { createPageVersion, error: versionError } = usePageVersionManagement();
  const { versions, loading: versionsLoading } = usePageVersions(page.id);

  // Check published status on mount
  useEffect(() => {
    async function checkPublishedStatus() {
      try {
        const published = await getPublishedPageVersion(page.id);
        if (published.data) {
          setIsPublished(true);
          setPublishedVersion(published.data.version);
        } else {
          setIsPublished(false);
          setPublishedVersion(null);
        }
      } catch (error) {
        console.error('Error checking published status:', error);
        setIsPublished(false);
        setPublishedVersion(null);
      }
    }
    
    checkPublishedStatus();
  }, [page.id]);

  // Load latest version on mount
  useEffect(() => {
    console.log('PageVersionEditor: versions changed:', versions);
    console.log('PageVersionEditor: versions length:', versions?.length);
    if (versions && versions.length > 0) {
      const latestVersion = versions[0];
      console.log('PageVersionEditor: latest version:', latestVersion);
      setCurrentVersion(latestVersion);
      
      // Initialize form with latest version data for all locales
      setTitle(latestVersion.title || {});
      setLayoutVariant(latestVersion.layout_variant || '');
        // Status is now tracked in page_publish table, not in page_version
      
      // Parse SEO data for all locales
      if (latestVersion.seo) {
        setSeoTitle((latestVersion.seo.title as LocalizedField) || {});
        setSeoDescription((latestVersion.seo.description as LocalizedField) || {});
        setSeoKeywords((latestVersion.seo.keywords as LocalizedField) || {});
        setSeoImage((latestVersion.seo.image as LocalizedField) || {});
      }
      
      // Parse navigation hints for all locales
      if (latestVersion.nav_hints) {
        setNavLabel((latestVersion.nav_hints.label as LocalizedField) || {});
        
        // Handle order - could be a number or nested object from previous incorrect saves
        const orderValue = latestVersion.nav_hints.order;
        if (typeof orderValue === 'number') {
          setNavOrder(orderValue);
        } else if (typeof orderValue === 'object' && orderValue !== null) {
          // If it's a nested object, try to extract a reasonable value
          // Look for the first numeric value in the nested structure
          const findNumericValue = (obj: any): number => {
            if (typeof obj === 'number') return obj;
            if (typeof obj === 'object' && obj !== null) {
              for (const key in obj) {
                const result = findNumericValue(obj[key]);
                if (typeof result === 'number') return result;
              }
            }
            return 0;
          };
          setNavOrder(findNumericValue(orderValue));
        } else {
          setNavOrder(0);
        }
        
        // Handle hidden - could be a boolean or nested object from previous incorrect saves
        const hiddenValue = latestVersion.nav_hints.hidden;
        if (typeof hiddenValue === 'boolean') {
          setNavHidden(hiddenValue);
        } else if (typeof hiddenValue === 'object' && hiddenValue !== null) {
          // If it's a nested object, try to extract a reasonable value
          const findBooleanValue = (obj: any): boolean => {
            if (typeof obj === 'boolean') return obj;
            if (typeof obj === 'object' && obj !== null) {
              for (const key in obj) {
                const result = findBooleanValue(obj[key]);
                if (typeof result === 'boolean') return result;
              }
            }
            return false;
          };
          setNavHidden(findBooleanValue(hiddenValue));
        } else {
          setNavHidden(false);
        }
        
        setNavBadge((latestVersion.nav_hints.badge as LocalizedField) || {});
      }
      
      // Initialize slots
      setSlots(latestVersion.slots || []);
    } else {
      console.log('PageVersionEditor: No versions found, initializing with empty data');
    }
  }, [versions]);

  // Helper functions to update localized fields
  const updateLocalizedField = (
    field: LocalizedField,
    setter: (value: LocalizedField) => void,
    value: string
  ) => {
    setter({ ...field, [selectedLocale]: value });
  };

  const getCurrentValue = (field: LocalizedField) => {
    return field[selectedLocale] || '';
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // First, let's check what versions actually exist in the database
      console.log('Checking database for existing versions for page:', page.id);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: dbVersions, error: dbError } = await supabase
        .from('page_version')
        .select('id, version')
        .eq('page_id', page.id)
        .order('version', { ascending: false });

      if (dbError) {
        console.error('Error querying database for versions:', dbError);
      } else {
        console.log('Database versions:', dbVersions);
      }

      // Calculate next version number
      let nextVersion = 1;
      if (versions && versions.length > 0) {
        console.log('Hook versions:', versions.map(v => ({ id: v.id, version: v.version })));
        const maxVersion = Math.max(...versions.map(v => v.version));
        nextVersion = maxVersion + 1;
        console.log('Max existing version:', maxVersion, 'Next version:', nextVersion);
      } else {
        console.log('No existing versions from hook, starting with version 1');
      }

      // If database has versions but hook doesn't, use database versions
      if (dbVersions && dbVersions.length > 0 && (!versions || versions.length === 0)) {
        console.log('Using database versions instead of hook versions');
        const maxDbVersion = Math.max(...dbVersions.map(v => v.version));
        nextVersion = maxDbVersion + 1;
        console.log('Max database version:', maxDbVersion, 'Next version:', nextVersion);
      }

      const versionData = {
        page_id: page.id,
        version: nextVersion,
        title,
        layout_variant: layoutVariant || null,
        seo: {
          title: seoTitle,
          description: seoDescription,
          keywords: seoKeywords,
          image: seoImage
        },
        nav_hints: {
          label: navLabel,
          badge: navBadge,
          order: navOrder,
          hidden: navHidden
        },
        slots: slots
      };

      console.log('Creating page version with data:', versionData);
      console.log('Next version number:', nextVersion);
      
      const result = await createPageVersion(versionData as any);
      console.log('createPageVersion result:', result);
      console.log('versionError from hook:', versionError);
      
      if (!result) {
        console.error('createPageVersion returned null/undefined');
        console.error('Hook error:', versionError);
        throw new Error(`Failed to create page version - no result returned. Hook error: ${versionError || 'Unknown error'}`);
      }

      console.log('Page version created successfully:', result);
      onSave(result);
    } catch (error) {
      console.error('Error saving page version:', error);
      console.error('Error details:', error);
      
      // Show more detailed error information
      let errorMessage = 'Failed to save page version';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message);
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!currentVersion) return;
    
    setPublishLoading(true);
    try {
      const result = await publishPage(page.id, currentVersion.version);
      if (result) {
        setIsPublished(true);
        setPublishedVersion(currentVersion.version);
        console.log('Page published successfully');
      }
    } catch (error) {
      console.error('Error publishing page:', error);
      alert('Failed to publish page. Please try again.');
    } finally {
      setPublishLoading(false);
    }
  };

  const handleUnpublish = async () => {
    setPublishLoading(true);
    try {
      const result = await unpublishPage(page.id);
      if (result) {
        setIsPublished(false);
        setPublishedVersion(null);
        console.log('Page unpublished successfully');
      }
    } catch (error) {
      console.error('Error unpublishing page:', error);
      alert('Failed to unpublish page. Please try again.');
    } finally {
      setPublishLoading(false);
    }
  };

  const tabs = [
    { id: 'content' as const, label: 'Content & SEO', icon: mdiTranslate },
    { id: 'navigation' as const, label: 'Navigation', icon: mdiNavigation },
    { id: 'layout' as const, label: 'Layout', icon: mdiPalette },
    { id: 'slots' as const, label: 'Page Slots', icon: mdiViewGrid }
  ];

  if (versionsLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-white mt-2">Loading page versions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Edit Page Version</h2>
              <p className="text-sm text-gray-400">/{page.slug}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Icon path={mdiTranslate} size={1} className="text-gray-400" />
              <select
                value={selectedLocale}
                onChange={(e) => setSelectedLocale(e.target.value)}
                className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {SUPPORTED_LOCALES.map(locale => (
                  <option key={locale.code} value={locale.code}>
                    {locale.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
          >
            <Icon path={mdiClose} size={1.2} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-gray-750'
                  : 'text-gray-400 hover:text-white hover:bg-gray-750'
              }`}
            >
              <Icon path={tab.icon} size={0.9} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-900/20 border border-red-500/50 rounded-md">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Content & SEO Tab */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              {/* Page Content */}
              <div className="bg-gray-750 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-4">Page Content</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Page Title
                    </label>
                    <input
                      type="text"
                      value={getCurrentValue(title)}
                      onChange={(e) => updateLocalizedField(title, setTitle, e.target.value)}
                      placeholder="Page title"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* Status is now managed through publish/unpublish buttons in footer */}
                </div>
              </div>

              {/* SEO Section */}
              <div className="bg-gray-750 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-4">SEO Metadata</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      SEO Title
                    </label>
                    <input
                      type="text"
                      value={getCurrentValue(seoTitle)}
                      onChange={(e) => updateLocalizedField(seoTitle, setSeoTitle, e.target.value)}
                      placeholder="SEO title"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Meta Description
                    </label>
                    <textarea
                      value={getCurrentValue(seoDescription)}
                      onChange={(e) => updateLocalizedField(seoDescription, setSeoDescription, e.target.value)}
                      placeholder="Meta description"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Keywords
                    </label>
                    <input
                      type="text"
                      value={getCurrentValue(seoKeywords)}
                      onChange={(e) => updateLocalizedField(seoKeywords, setSeoKeywords, e.target.value)}
                      placeholder="Keywords (comma-separated)"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Social Media Image
                    </label>
                    <input
                      type="text"
                      value={getCurrentValue(seoImage)}
                      onChange={(e) => updateLocalizedField(seoImage, setSeoImage, e.target.value)}
                      placeholder="Image URL"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Tab */}
          {activeTab === 'navigation' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Navigation Label
                </label>
                <input
                  type="text"
                  value={getCurrentValue(navLabel)}
                  onChange={(e) => updateLocalizedField(navLabel, setNavLabel, e.target.value)}
                  placeholder="Navigation label"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Navigation Badge
                </label>
                <input
                  type="text"
                  value={getCurrentValue(navBadge)}
                  onChange={(e) => updateLocalizedField(navBadge, setNavBadge, e.target.value)}
                  placeholder="Badge text"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Order
                  </label>
                  <input
                    type="number"
                    value={navOrder}
                    onChange={(e) => setNavOrder(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="navHidden"
                    checked={navHidden}
                    onChange={(e) => setNavHidden(e.target.checked)}
                    className="rounded border-gray-600 bg-gray-700 text-purple-500 focus:ring-purple-500"
                  />
                  <label htmlFor="navHidden" className="text-sm text-gray-300">
                    Hidden from navigation
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Layout Tab */}
          {activeTab === 'layout' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Layout Variant
                </label>
                <select
                  value={layoutVariant}
                  onChange={(e) => setLayoutVariant(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Default Layout</option>
                  {LAYOUT_VARIANTS.map(variant => (
                    <option key={variant.value} value={variant.value}>
                      {variant.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Page Slots (JSON)
                </label>
                <textarea
                  value={JSON.stringify(slots, null, 2)}
                  readOnly
                  className="w-full h-32 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white font-mono text-sm"
                  placeholder="Slots will be managed in the slots editor..."
                />
                <p className="text-xs text-gray-400 mt-1">
                  Slots are managed in the Page Slots System (Phase 2.3)
                </p>
              </div>
            </div>
          )}

          {/* Slots Tab */}
          {activeTab === 'slots' && (
            <div className="space-y-6">
              <div className="bg-gray-750 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">Page Slots</h3>
                  <button
                    onClick={() => setShowSlotEditor(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
                  >
                    <Icon path={mdiViewGrid} size={0.9} />
                    <span>Manage Slots</span>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {slots.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Icon path={mdiViewGrid} size={3} className="mx-auto mb-4 text-gray-500" />
                      <p className="text-lg font-medium">No blocks configured</p>
                      <p className="text-sm">Click "Manage Slots" to add blocks to page slots</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {slots.map((block, index) => (
                        <div key={block.block_id} className="flex items-center justify-between p-3 bg-gray-700 rounded-md border border-gray-600">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-400">#{index + 1}</span>
                            <div>
                              <div className="text-white font-medium">
                                {block.slot} Slot
                              </div>
                              <div className="text-sm text-gray-400">
                                Block {block.block_id.slice(0, 8)}... (Order: {block.order})
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setEditingBlock(block)}
                              className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-md transition-colors"
                              title="Configure block"
                            >
                              <Icon path={mdiCog} size={0.8} />
                            </button>
                            <button
                              onClick={() => {
                                const newSlots = slots.filter(b => b.block_id !== block.block_id);
                                setSlots(newSlots);
                              }}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-md transition-colors"
                              title="Remove block"
                            >
                              <Icon path={mdiMinus} size={0.8} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400">
              {currentVersion && `Version ${currentVersion.version}`}
            </div>
            {isPublished && publishedVersion === currentVersion?.version ? (
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-green-400">
                  This version is published
                </span>
              </div>
            ) : isPublished && publishedVersion !== currentVersion?.version ? (
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-yellow-400">
                  Version {publishedVersion} is published
                </span>
              </div>
            ) : null}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            {isPublished && publishedVersion === currentVersion?.version ? (
              <button
                onClick={handleUnpublish}
                disabled={publishLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {publishLoading ? 'Unpublishing...' : 'Unpublish'}
              </button>
            ) : (
              <button
                onClick={handlePublish}
                disabled={publishLoading || !currentVersion}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {publishLoading ? 'Publishing...' : 'Publish'}
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon path={mdiContentSaveOutline} size={0.9} />
              <span>{isLoading ? 'Saving...' : 'Save Version'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Slot Editor Modal */}
      {showSlotEditor && (
        <PageSlotEditor
          slots={slots}
          onSlotsChange={setSlots}
          onClose={() => setShowSlotEditor(false)}
        />
      )}

      {/* Block Instance Config Modal */}
      {editingBlock && (
        <BlockInstanceConfig
          blockInstance={editingBlock}
          onSave={(updatedBlock) => {
            const newSlots = slots.map(block => 
              block.block_id === updatedBlock.block_id ? updatedBlock : block
            );
            setSlots(newSlots);
            setEditingBlock(null);
          }}
          onClose={() => setEditingBlock(null)}
        />
      )}
    </div>
  );
}
