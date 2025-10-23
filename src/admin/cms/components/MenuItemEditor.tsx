// Menu Item Editor Component
// Form for editing individual menu items

import { useState, useEffect } from 'react';
import { Icon } from '@mdi/react';
import { 
  mdiContentSave,
  mdiClose,
  mdiChevronRight,
  mdiMinus,
  mdiLink,
  mdiAnchor,
  mdiFolder,
  mdiFileDocument
} from '@mdi/js';
import { MenuItemVisibilityEditor } from './MenuItemVisibilityEditor';
import type { MenuItem } from '../../../lib/cms/types';

interface MenuItemEditorProps {
  item: MenuItem;
  onSave: (item: MenuItem) => void;
  onCancel: () => void;
}

const ITEM_TYPES = [
  { value: 'page', label: 'Page', icon: mdiFileDocument, description: 'Link to an internal page' },
  { value: 'external', label: 'External Link', icon: mdiLink, description: 'Link to external URL' },
  { value: 'anchor', label: 'Anchor', icon: mdiAnchor, description: 'Link to page section' },
  { value: 'separator', label: 'Separator', icon: mdiMinus, description: 'Visual separator' },
  { value: 'group', label: 'Group', icon: mdiFolder, description: 'Grouping container' }
];

export function MenuItemEditor({ item, onSave, onCancel }: MenuItemEditorProps) {
  const [formData, setFormData] = useState({
    type: item.type || 'page',
    label: typeof item.label === 'string' ? item.label : item.label?.['en-US'] || '',
    url: (item as any).url || '',
    target: item.target || '_self',
    rel: item.rel || '',
    anchor: (item as any).anchor || '',
    page_id: (item as any).page_id || '',
    order: (item as any).order || 0
  });

  const [badge, setBadge] = useState(item.badge || { 'en-US': { text: '', tone: 'info' as const } });
  const [visibility, setVisibility] = useState(item.visibility || {});
  const [showVisibilityEditor, setShowVisibilityEditor] = useState(false);
  const [showBadgeEditor, setShowBadgeEditor] = useState(false);

  // Update form when item changes
  useEffect(() => {
    setFormData({
      type: item.type || 'page',
      label: typeof item.label === 'string' ? item.label : item.label?.['en-US'] || '',
      url: (item as any).url || '',
      target: item.target || '_self',
      rel: item.rel || '',
      anchor: (item as any).anchor || '',
      page_id: (item as any).page_id || '',
      order: (item as any).order || 0
    });
    setBadge(item.badge || { 'en-US': { text: '', tone: 'info' as const } });
    setVisibility(item.visibility || {});
  }, [item]);

  const handleSave = () => {
    const updatedItem: any = {
      ...item,
      type: formData.type,
      label: { 'en-US': formData.label },
      url: formData.url || undefined,
      target: formData.target || undefined,
      rel: Array.isArray(formData.rel) ? formData.rel : undefined,
      anchor: formData.anchor || undefined,
      page_id: formData.page_id || undefined,
      order: formData.order,
      badge,
      visibility
    };

    onSave(updatedItem);
  };


  const getItemTypeIcon = (type: string) => {
    const itemType = ITEM_TYPES.find(t => t.value === type);
    return itemType?.icon || mdiFileDocument;
  };

  const getItemTypeDescription = (type: string) => {
    const itemType = ITEM_TYPES.find(t => t.value === type);
    return itemType?.description || '';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-3 mb-2">
          <Icon path={getItemTypeIcon(formData.type)} size={1.2} className="text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Edit Menu Item</h3>
        </div>
        <p className="text-sm text-gray-400">{getItemTypeDescription(formData.type)}</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Basic Settings */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3">Basic Settings</h4>
          <div className="space-y-4">
            {/* Item Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Item Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'page' | 'external' | 'anchor' | 'separator' | 'group' }))}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
              >
                {ITEM_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Label */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Label *
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="Menu item label"
                required
              />
            </div>

            {/* Order */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Order
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Link Settings */}
        {(formData.type === 'page' || formData.type === 'external' || formData.type === 'anchor') && (
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-3">Link Settings</h4>
            <div className="space-y-4">
              {/* URL */}
              {formData.type === 'external' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    URL *
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="https://example.com"
                    required
                  />
                </div>
              )}

              {/* Page ID */}
              {formData.type === 'page' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Page ID
                  </label>
                  <input
                    type="text"
                    value={formData.page_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, page_id: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="Page ID or slug"
                  />
                </div>
              )}

              {/* Anchor */}
              {formData.type === 'anchor' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Anchor
                  </label>
                  <input
                    type="text"
                    value={formData.anchor}
                    onChange={(e) => setFormData(prev => ({ ...prev, anchor: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="#section-id"
                  />
                </div>
              )}

              {/* Target */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Target
                </label>
                <select
                  value={formData.target}
                  onChange={(e) => setFormData(prev => ({ ...prev, target: e.target.value as '_self' | '_blank' }))}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="_self">Same Window</option>
                  <option value="_blank">New Window</option>
                  <option value="_parent">Parent Frame</option>
                  <option value="_top">Top Frame</option>
                </select>
              </div>

              {/* Rel */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rel Attribute
                </label>
                <input
                  type="text"
                  value={formData.rel}
                  onChange={(e) => setFormData(prev => ({ ...prev, rel: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="noopener, noreferrer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Advanced Settings */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3">Advanced Settings</h4>
          <div className="space-y-3">
            {/* Visibility Rules */}
            <button
              onClick={() => setShowVisibilityEditor(!showVisibilityEditor)}
              className="w-full flex items-center justify-between p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                <Icon path={mdiChevronRight} size={1} className="text-gray-400" />
                <span className="text-sm text-gray-300">Visibility Rules</span>
                {item.visibility && (
                  <span className="px-2 py-1 bg-blue-900 text-blue-300 rounded text-xs">
                    Configured
                  </span>
                )}
              </div>
              <Icon path={mdiChevronRight} size={1} className="text-gray-400" />
            </button>

            {/* Badge */}
            <button
              onClick={() => setShowBadgeEditor(!showBadgeEditor)}
              className="w-full flex items-center justify-between p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                <Icon path={mdiChevronRight} size={1} className="text-gray-400" />
                <span className="text-sm text-gray-300">Badge</span>
                {badge['en-US']?.text && (
                  <span className="px-2 py-1 bg-blue-900 text-blue-300 rounded text-xs">
                    {badge['en-US'].text}
                  </span>
                )}
              </div>
              <Icon path={mdiChevronRight} size={1} className="text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Icon path={mdiContentSave} size={0.8} />
            Save
          </button>
        </div>
      </div>

      {/* Visibility Editor Modal */}
      {showVisibilityEditor && (
        <MenuItemVisibilityEditor
          visibility={visibility}
          onSave={setVisibility}
          onClose={() => setShowVisibilityEditor(false)}
        />
      )}

      {/* Badge Editor Modal */}
      {showBadgeEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Badge Configuration</h3>
              <button
                onClick={() => setShowBadgeEditor(false)}
                className="text-gray-400 hover:text-white"
              >
                <Icon path={mdiClose} size={1} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Badge Text
                </label>
                <input
                  type="text"
                  value={badge['en-US']?.text || ''}
                  onChange={(e) => setBadge(prev => ({ ...prev, 'en-US': { ...prev['en-US'], text: e.target.value } }))}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="New, Hot, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Badge Style
                </label>
                <select
                  value={badge['en-US']?.tone || 'info'}
                  onChange={(e) => setBadge(prev => ({ ...prev, 'en-US': { ...prev['en-US'], tone: e.target.value as 'info' | 'success' | 'warning' } }))}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="default">Default</option>
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="danger">Danger</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowBadgeEditor(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
