// Block Content Editor Component
// Provides a rich text editor for block content

import { useState, useEffect } from 'react';
import type { LocalizedContent } from '../blocks/types/block.types';

interface BlockContentEditorProps {
  content: LocalizedContent<Record<string, unknown>>;
  onChange: (content: LocalizedContent<Record<string, unknown>>) => void;
  layoutVariant: string;
  blockType: string;
}

export function BlockContentEditor({ 
  content, 
  onChange
}: BlockContentEditorProps) {
  const [currentLocale, setCurrentLocale] = useState('en-US');
  const [currentContent, setCurrentContent] = useState<Record<string, unknown>>({});

  useEffect(() => {
    const localeContent = content[currentLocale] || {};
    setCurrentContent(localeContent);
  }, [content, currentLocale]);

  const handleContentChange = (field: string, value: unknown) => {
    const newContent = {
      ...currentContent,
      [field]: value,
    };

    setCurrentContent(newContent);

    const updatedContent = {
      ...content,
      [currentLocale]: newContent,
    };

    onChange(updatedContent);
  };

  const locales = [
    { code: 'en-US', label: 'English (US)' },
    { code: 'es-ES', label: 'Spanish (ES)' },
    { code: 'fr-FR', label: 'French (FR)' },
  ];

  return (
    <div className="p-6 bg-gray-900 text-white">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-white mb-4">Content Editor</h3>
        
        {/* Locale Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Language
          </label>
          <select
            value={currentLocale}
            onChange={(e) => setCurrentLocale(e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
          >
            {locales.map((locale) => (
              <option key={locale.code} value={locale.code}>
                {locale.label}
              </option>
            ))}
          </select>
        </div>

        {/* Content Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={(currentContent.title as string) || ''}
              onChange={(e) => handleContentChange('title', e.target.value)}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
              placeholder="Enter title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Content
            </label>
            <textarea
              value={(currentContent.content as string) || ''}
              onChange={(e) => handleContentChange('content', e.target.value)}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white h-32"
              placeholder="Enter content"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={(currentContent.description as string) || ''}
              onChange={(e) => handleContentChange('description', e.target.value)}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white h-24"
              placeholder="Enter description"
            />
          </div>
        </div>
      </div>
    </div>
  );
}