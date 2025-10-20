// Page Version Editor Component
// Comprehensive page version editing with i18n support

import { useState, useEffect, useMemo } from 'react';
import { usePageVersions, usePageVersionManagement } from '../../lib/cms/hooks';
import type { Page, PageVersion, LocalizedContent } from '../../lib/cms/types';
import { Icon } from '@mdi/react';
import { 
  mdiClose,
  mdiContentSave,
  mdiEye,
  mdiEyeOff,
  mdiTranslate,
  mdiPalette,
  mdiMagnify,
  mdiNavigation,
  mdiCodeJson,
  mdiChevronDown,
  mdiPlus,
  mdiMinus,
  mdiContentSaveOutline
} from '@mdi/js';
import { Tooltip } from '../../shell/Tooltip';

interface PageVersionEditorProps {
  page: Page;
  onClose: () => void;
  onSave: (version: PageVersion) => void;
}

type EditorTab = 'content' | 'navigation' | 'layout';

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
  
  // Form state - single locale fields
  const [title, setTitle] = useState<string>('');
  const [layoutVariant, setLayoutVariant] = useState<string>('');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft');
  
  // SEO fields
  const [seoTitle, setSeoTitle] = useState<string>('');
  const [seoDescription, setSeoDescription] = useState<string>('');
  const [seoKeywords, setSeoKeywords] = useState<string>('');
  const [seoImage, setSeoImage] = useState<string>('');
  
  // Navigation hints
  const [navLabel, setNavLabel] = useState<string>('');
  const [navOrder, setNavOrder] = useState<number>(0);
  const [navHidden, setNavHidden] = useState<boolean>(false);
  const [navBadge, setNavBadge] = useState<string>('');
  
  const { createPageVersion, updatePageVersion } = usePageVersionManagement();
  const { versions, loading: versionsLoading } = usePageVersions(page.id);

  // Load latest version on mount and when locale changes
  useEffect(() => {
    if (versions && versions.length > 0) {
      const latestVersion = versions[0];
      setCurrentVersion(latestVersion);
      
      // Initialize form with latest version data for selected locale
      setTitle(latestVersion.title?.[selectedLocale] || '');
      setLayoutVariant(latestVersion.layout_variant || '');
      setStatus(latestVersion.status);
      
      // Parse SEO data for selected locale
      if (latestVersion.seo) {
        setSeoTitle(latestVersion.seo[selectedLocale]?.title || '');
        setSeoDescription(latestVersion.seo[selectedLocale]?.description || '');
        setSeoKeywords(latestVersion.seo[selectedLocale]?.keywords || '');
        setSeoImage(latestVersion.seo[selectedLocale]?.image || '');
      }
      
      // Parse navigation hints for selected locale
      if (latestVersion.nav_hints) {
        setNavLabel(latestVersion.nav_hints[selectedLocale]?.label || '');
        setNavOrder(latestVersion.nav_hints[selectedLocale]?.order || 0);
        setNavHidden(latestVersion.nav_hints[selectedLocale]?.hidden || false);
        setNavBadge(latestVersion.nav_hints[selectedLocale]?.badge || '');
      }
    }
  }, [versions, selectedLocale]);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get existing data for all locales
      const existingTitle = currentVersion?.title || {};
      const existingSeo = currentVersion?.seo || {};
      const existingNavHints = currentVersion?.nav_hints || {};

      // Update data for selected locale
      const updatedTitle = { ...existingTitle, [selectedLocale]: title };
      
      const updatedSeo = { 
        ...existingSeo, 
        [selectedLocale]: {
          title: seoTitle,
          description: seoDescription,
          keywords: seoKeywords,
          image: seoImage
        }
      };

      const updatedNavHints = { 
        ...existingNavHints, 
        [selectedLocale]: {
          label: navLabel,
          badge: navBadge,
          order: navOrder,
          hidden: navHidden
        }
      };

      const versionData = {
        page_id: page.id,
        version: currentVersion ? currentVersion.version + 1 : 1,
        title: updatedTitle,
        layout_variant: layoutVariant || null,
        seo: updatedSeo,
        nav_hints: updatedNavHints,
        slots: currentVersion?.slots || [],
        status
      };

      console.log('Creating page version with data:', versionData);
      
      const result = await createPageVersion(versionData);
      
      if (!result) {
        throw new Error('Failed to create page version');
      }

      console.log('Page version created successfully:', result);
      onSave(result);
    } catch (error) {
      console.error('Error saving page version:', error);
      setError(error instanceof Error ? error.message : 'Failed to save page version');
    } finally {
      setIsLoading(false);
    }
  };


  const tabs = [
    { id: 'content' as const, label: 'Content & SEO', icon: mdiTranslate },
    { id: 'navigation' as const, label: 'Navigation', icon: mdiNavigation },
    { id: 'layout' as const, label: 'Layout', icon: mdiPalette }
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
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Page title"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as 'draft' | 'published' | 'archived')}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
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
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      placeholder="SEO title"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Meta Description
                    </label>
                    <textarea
                      value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value)}
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
                      value={seoKeywords}
                      onChange={(e) => setSeoKeywords(e.target.value)}
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
                      value={seoImage}
                      onChange={(e) => setSeoImage(e.target.value)}
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
                  value={navLabel}
                  onChange={(e) => setNavLabel(e.target.value)}
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
                  value={navBadge}
                  onChange={(e) => setNavBadge(e.target.value)}
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
                  value={JSON.stringify(currentVersion?.slots || [], null, 2)}
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
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <div className="text-sm text-gray-400">
            {currentVersion && `Version ${currentVersion.version}`}
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
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon path={mdiContentSaveOutline} size={0.9} />
              <span>{isLoading ? 'Saving...' : 'Save Version'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
