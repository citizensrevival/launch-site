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

type EditorTab = 'content' | 'seo' | 'navigation' | 'layout';

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
  const [currentVersion, setCurrentVersion] = useState<PageVersion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState<LocalizedField>({});
  const [layoutVariant, setLayoutVariant] = useState<string>('');
  const [seo, setSeo] = useState<LocalizedField>({});
  const [navHints, setNavHints] = useState<LocalizedField>({});
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft');
  
  // SEO fields
  const [seoTitle, setSeoTitle] = useState<LocalizedField>({});
  const [seoDescription, setSeoDescription] = useState<LocalizedField>({});
  const [seoKeywords, setSeoKeywords] = useState<LocalizedField>({});
  const [seoImage, setSeoImage] = useState<LocalizedField>({});
  
  // Navigation hints
  const [navLabel, setNavLabel] = useState<LocalizedField>({});
  const [navOrder, setNavOrder] = useState<number>(0);
  const [navHidden, setNavHidden] = useState<boolean>(false);
  const [navBadge, setNavBadge] = useState<LocalizedField>({});
  
  const { createPageVersion, updatePageVersion } = usePageVersionManagement();
  const { versions, loading: versionsLoading } = usePageVersions(page.id);

  // Load latest version on mount
  useEffect(() => {
    if (versions && versions.length > 0) {
      const latestVersion = versions[0];
      setCurrentVersion(latestVersion);
      
      // Initialize form with latest version data
      setTitle(latestVersion.title || {});
      setLayoutVariant(latestVersion.layout_variant || '');
      setSeo(latestVersion.seo || {});
      setNavHints(latestVersion.nav_hints || {});
      setStatus(latestVersion.status);
      
      // Parse SEO data
      if (latestVersion.seo) {
        setSeoTitle(latestVersion.seo.title || {});
        setSeoDescription(latestVersion.seo.description || {});
        setSeoKeywords(latestVersion.seo.keywords || {});
        setSeoImage(latestVersion.seo.image || {});
      }
      
      // Parse navigation hints
      if (latestVersion.nav_hints) {
        setNavLabel(latestVersion.nav_hints.label || {});
        setNavOrder(latestVersion.nav_hints.order || 0);
        setNavHidden(latestVersion.nav_hints.hidden || false);
        setNavBadge(latestVersion.nav_hints.badge || {});
      }
    }
  }, [versions]);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Prepare SEO data
      const seoData: LocalizedContent = {};
      SUPPORTED_LOCALES.forEach(locale => {
        if (seoTitle[locale.code] || seoDescription[locale.code] || seoKeywords[locale.code] || seoImage[locale.code]) {
          seoData[locale.code] = {
            title: seoTitle[locale.code] || '',
            description: seoDescription[locale.code] || '',
            keywords: seoKeywords[locale.code] || '',
            image: seoImage[locale.code] || ''
          };
        }
      });

      // Prepare navigation hints
      const navHintsData: LocalizedContent = {};
      SUPPORTED_LOCALES.forEach(locale => {
        if (navLabel[locale.code] || navBadge[locale.code]) {
          navHintsData[locale.code] = {
            label: navLabel[locale.code] || '',
            badge: navBadge[locale.code] || '',
            order: navOrder,
            hidden: navHidden
          };
        }
      });

      const versionData = {
        page_id: page.id,
        version: currentVersion ? currentVersion.version + 1 : 1,
        title,
        layout_variant: layoutVariant || null,
        seo: seoData,
        nav_hints: navHintsData,
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

  const updateLocalizedField = (
    field: LocalizedField,
    setter: (value: LocalizedField) => void,
    locale: string,
    value: string
  ) => {
    setter({ ...field, [locale]: value });
  };

  const renderLocalizedInput = (
    field: LocalizedField,
    setter: (value: LocalizedField) => void,
    placeholder: string,
    multiline = false
  ) => (
    <div className="space-y-2">
      {SUPPORTED_LOCALES.map(locale => (
        <div key={locale.code} className="flex items-center space-x-2">
          <div className="w-16 text-xs text-gray-400 font-medium">
            {locale.code}
          </div>
          {multiline ? (
            <textarea
              value={field[locale.code] || ''}
              onChange={(e) => updateLocalizedField(field, setter, locale.code, e.target.value)}
              placeholder={`${placeholder} (${locale.name})`}
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={3}
            />
          ) : (
            <input
              type="text"
              value={field[locale.code] || ''}
              onChange={(e) => updateLocalizedField(field, setter, locale.code, e.target.value)}
              placeholder={`${placeholder} (${locale.name})`}
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          )}
        </div>
      ))}
    </div>
  );

  const tabs = [
    { id: 'content' as const, label: 'Content', icon: mdiTranslate },
    { id: 'seo' as const, label: 'SEO', icon: mdiMagnify },
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
          <div>
            <h2 className="text-xl font-semibold text-white">Edit Page Version</h2>
            <p className="text-sm text-gray-400">/{page.slug}</p>
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

          {/* Content Tab */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Page Title (Multi-language)
                </label>
                {renderLocalizedInput(title, setTitle, 'Page title')}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'draft' | 'published' | 'archived')}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  SEO Title
                </label>
                {renderLocalizedInput(seoTitle, setSeoTitle, 'SEO title')}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Meta Description
                </label>
                {renderLocalizedInput(seoDescription, setSeoDescription, 'Meta description', true)}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Keywords
                </label>
                {renderLocalizedInput(seoKeywords, setSeoKeywords, 'Keywords (comma-separated)')}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Social Media Image
                </label>
                {renderLocalizedInput(seoImage, setSeoImage, 'Image URL')}
              </div>
            </div>
          )}

          {/* Navigation Tab */}
          {activeTab === 'navigation' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Navigation Label
                </label>
                {renderLocalizedInput(navLabel, setNavLabel, 'Navigation label')}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Navigation Badge
                </label>
                {renderLocalizedInput(navBadge, setNavBadge, 'Badge text')}
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
