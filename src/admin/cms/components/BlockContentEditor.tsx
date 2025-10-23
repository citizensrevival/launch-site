// Block Content Editor Component
// JSON structure editor with i18n support for block content

import { useState, useMemo, useRef, useEffect } from 'react';
import { Icon } from '@mdi/react';
import { 
  mdiCodeJson,
  mdiEye,
  mdiPlus,
  mdiMinus
} from '@mdi/js';
import type { LocalizedContent } from '../../../lib/cms/types';
import { getBlockTypeFields } from '../../../lib/cms/blockTypes';
import { BlockPreview } from './BlockPreview';

interface BlockContentEditorProps {
  content: LocalizedContent<Record<string, unknown>>;
  onChange: (content: LocalizedContent<Record<string, unknown>>) => void;
  layoutVariant: string;
  blockType?: string;
}

interface LocaleData {
  locale: string;
  data: Record<string, unknown>;
}

export function BlockContentEditor({ content, onChange, layoutVariant, blockType }: BlockContentEditorProps) {
  const [activeTab, setActiveTab] = useState<'visual' | 'json' | 'preview'>('visual');
  const [activeLocale, setActiveLocale] = useState<string>('en-US');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isValidJson, setIsValidJson] = useState(true);
  
  // Use ref to store stable content reference
  const contentRef = useRef(content);
  const [localContent, setLocalContent] = useState(content);

  // Update local content when prop changes
  useEffect(() => {
    if (JSON.stringify(contentRef.current) !== JSON.stringify(content)) {
      contentRef.current = content;
      setLocalContent(content);
    }
  }, [content]);

  // Parse content into locale data
  const localeData = useMemo(() => {
    const locales: LocaleData[] = [];
    
    Object.entries(localContent).forEach(([locale, data]) => {
      if (typeof data === 'object' && data !== null) {
        locales.push({
          locale,
          data: data as Record<string, unknown>
        });
      }
    });

    return locales;
  }, [localContent]);

  // Get current locale data
  const currentLocaleData = useMemo(() => {
    return localeData.find(l => l.locale === activeLocale)?.data || {};
  }, [localeData, activeLocale]);

  // Available locales
  const availableLocales = useMemo(() => [
    { code: 'en-US', name: 'English (US)' },
    { code: 'es-US', name: 'Spanish (US)' },
    { code: 'fr-CA', name: 'French (Canada)' },
    { code: 'de-DE', name: 'German (Germany)' }
  ], []);

  // Get fields from block type definition
  const fields = useMemo(() => {
    if (blockType) {
      return getBlockTypeFields(blockType);
    }
    // Fallback to layout variant for backward compatibility
    const commonFields = [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'subtitle', label: 'Subtitle', type: 'text', required: false },
      { key: 'description', label: 'Description', type: 'textarea', required: false }
    ];

    switch (layoutVariant) {
      case 'hero':
        return [
          ...commonFields,
          { key: 'cta_text', label: 'Call to Action Text', type: 'text', required: false },
          { key: 'cta_url', label: 'Call to Action URL', type: 'url', required: false },
          { key: 'background_color', label: 'Background Color', type: 'color', required: false }
        ];
      case 'card':
        return [
          ...commonFields,
          { key: 'card_title', label: 'Card Title', type: 'text', required: false },
          { key: 'card_content', label: 'Card Content', type: 'textarea', required: false },
          { key: 'card_image_alt', label: 'Image Alt Text', type: 'text', required: false }
        ];
      case 'list':
        return [
          ...commonFields,
          { key: 'items', label: 'List Items', type: 'array', required: false },
          { key: 'list_type', label: 'List Type', type: 'select', required: false, options: ['bullet', 'numbered'] }
        ];
      case 'grid':
        return [
          ...commonFields,
          { key: 'columns', label: 'Number of Columns', type: 'number', required: false },
          { key: 'gap', label: 'Grid Gap', type: 'text', required: false }
        ];
      default:
        return commonFields;
    }
  }, [blockType, layoutVariant]);

  // Handle field changes
  const handleFieldChange = (key: string, value: unknown) => {
    const newContent = { ...localContent };
    
    if (!newContent[activeLocale]) {
      newContent[activeLocale] = {};
    }
    
    (newContent[activeLocale] as Record<string, unknown>)[key] = value;
    setLocalContent(newContent);
    onChange(newContent);
  };

  // Handle JSON editing
  const handleJsonChange = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      setJsonError(null);
      setIsValidJson(true);
      setLocalContent(parsed);
      onChange(parsed);
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : 'Invalid JSON');
      setIsValidJson(false);
    }
  };

  // Add new locale
  const handleAddLocale = (localeCode: string) => {
    if (!localContent[localeCode]) {
      const newContent = { ...localContent };
      newContent[localeCode] = {};
      setLocalContent(newContent);
      onChange(newContent);
      setActiveLocale(localeCode);
    }
  };

  // Remove locale (commented out for now)
  // const handleRemoveLocale = (localeCode: string) => {
  //   if (Object.keys(content).length > 1) {
  //     const newContent = { ...content };
  //     delete newContent[localeCode];
  //     onChange(newContent);
  //     
  //     if (activeLocale === localeCode) {
  //       const remainingLocales = Object.keys(newContent);
  //       setActiveLocale(remainingLocales[0]);
  //     }
  //   }
  // };

  // Render field input
  const renderFieldInput = (field: any) => {
    const value = currentLocaleData[field.key] || '';
    
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            value={value as string}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            rows={3}
            placeholder={`Enter ${field.label.toLowerCase()}...`}
          />
        );
      
      case 'select':
        return (
          <select
            value={value as string}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((option: any) => (
              <option key={option.value || option} value={option.value || option}>
                {option.label || option}
              </option>
            ))}
          </select>
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={value as number}
            onChange={(e) => handleFieldChange(field.key, parseInt(e.target.value) || 0)}
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            placeholder={`Enter ${field.label.toLowerCase()}...`}
          />
        );
      
      case 'color':
        return (
          <input
            type="color"
            value={value as string || '#000000'}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className="w-full h-12 bg-gray-800 border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none"
          />
        );
      
      case 'array':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add new item..."
                className="flex-1 p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const newItems = [...(value as string[] || []), e.currentTarget.value];
                    handleFieldChange(field.key, newItems);
                    e.currentTarget.value = '';
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.querySelector(`input[placeholder="Add new item..."]`) as HTMLInputElement;
                  if (input?.value) {
                    const newItems = [...(value as string[] || []), input.value];
                    handleFieldChange(field.key, newItems);
                    input.value = '';
                  }
                }}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Icon path={mdiPlus} size={1} />
              </button>
            </div>
            {(value as string[] || []).map((item: string, index: number) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-gray-800 rounded">
                <span className="flex-1 text-white">{item}</span>
                <button
                  onClick={() => {
                    const newItems = (value as string[] || []).filter((_, i) => i !== index);
                    handleFieldChange(field.key, newItems);
                  }}
                  className="p-1 text-red-400 hover:bg-gray-700 rounded"
                >
                  <Icon path={mdiMinus} size={0.8} />
                </button>
              </div>
            ))}
          </div>
        );
      
      default:
        return (
          <input
            type={field.type === 'url' ? 'url' : 'text'}
            value={value as string}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            placeholder={`Enter ${field.label.toLowerCase()}...`}
          />
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-medium text-white">Content Editor</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Layout:</span>
            <span className="px-2 py-1 bg-blue-900 text-blue-300 rounded text-xs">
              {layoutVariant}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('visual')}
            className={`px-3 py-2 rounded-lg transition-colors ${
              activeTab === 'visual' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Icon path={mdiEye} size={1} className="mr-2" />
            Visual
          </button>
          {blockType && (
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'preview' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Icon path={mdiEye} size={1} className="mr-2" />
              Preview
            </button>
          )}
          <button
            onClick={() => setActiveTab('json')}
            className={`px-3 py-2 rounded-lg transition-colors ${
              activeTab === 'json' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Icon path={mdiCodeJson} size={1} className="mr-2" />
            JSON
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'preview' ? (
          /* Block Preview */
          <div className="flex-1 p-4 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              <BlockPreview
                blockType={blockType || layoutVariant}
                content={localContent}
                layoutVariant={layoutVariant}
                locale={activeLocale}
                className="bg-white rounded-lg shadow-sm"
              />
            </div>
          </div>
        ) : activeTab === 'visual' ? (
          <>
            {/* Locale Tabs */}
            <div className="flex items-center gap-2 p-4 border-b border-gray-700">
              <span className="text-sm text-gray-400">Locales:</span>
              {localeData.map((locale) => (
                <button
                  key={locale.locale}
                  onClick={() => setActiveLocale(locale.locale)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    activeLocale === locale.locale
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {locale.locale}
                </button>
              ))}
              
              {/* Add Locale Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    const dropdown = document.getElementById('locale-dropdown');
                    if (dropdown) dropdown.classList.toggle('hidden');
                  }}
                  className="px-3 py-1 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded text-sm flex items-center gap-1"
                >
                  <Icon path={mdiPlus} size={0.8} />
                  Add
                </button>
                <div id="locale-dropdown" className="hidden absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10">
                  {availableLocales
                    .filter(locale => !localContent[locale.code])
                    .map(locale => (
                      <button
                        key={locale.code}
                        onClick={() => handleAddLocale(locale.code)}
                        className="w-full px-3 py-2 text-left text-white hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
                      >
                        {locale.name}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="flex-1 overflow-y-auto p-4 max-h-96">
              <div className="space-y-6">
                {fields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {field.label}
                      {field.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    {renderFieldInput(field)}
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* JSON Editor */
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-300">JSON Content</h4>
                {jsonError && (
                  <span className="text-red-400 text-sm">{jsonError}</span>
                )}
              </div>
            </div>
            <div className="flex-1 p-4">
              <textarea
                value={JSON.stringify(localContent, null, 2)}
                onChange={(e) => handleJsonChange(e.target.value)}
                className={`w-full h-full p-4 bg-gray-900 border rounded-lg text-white font-mono text-sm focus:outline-none ${
                  isValidJson ? 'border-gray-600' : 'border-red-500'
                }`}
                placeholder="Enter JSON content..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
