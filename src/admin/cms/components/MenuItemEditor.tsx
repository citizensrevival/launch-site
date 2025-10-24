// Menu Item Editor Component
// Provides interface for editing menu items

import { useState } from 'react';
import { Icon } from '@mdi/react';
import { 
  mdiPlus, 
  mdiTrashCanOutline, 
  mdiChevronDown, 
  mdiChevronRight,
  mdiFileDocument,
  mdiLink,
  mdiAnchor,
  mdiFolder
} from '@mdi/js';

interface MenuItem {
  id: string;
  type: 'page' | 'external' | 'anchor' | 'separator' | 'group';
  label: Record<string, string>;
  target?: string;
  rel?: string;
  children?: MenuItem[];
  visibility?: {
    device?: string[];
    audience?: string[];
    featureFlags?: string[];
    schedule?: {
      start?: string;
      end?: string;
    };
  };
  badge?: {
    text: Record<string, string>;
    color: string;
  };
  style_hints?: Record<string, any>;
}

interface MenuItemEditorProps {
  items: MenuItem[];
  onItemsChange: (items: MenuItem[]) => void;
}

export function MenuItemEditor({ items, onItemsChange }: MenuItemEditorProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const addItem = (parentId?: string) => {
    const newItem: MenuItem = {
      id: `item-${Date.now()}`,
      type: 'page',
      label: { 'en-US': 'New Item' },
      children: [],
    };

    if (parentId) {
      // Add as child
      const updateItems = (items: MenuItem[]): MenuItem[] => {
        return items.map(item => {
          if (item.id === parentId) {
            return {
              ...item,
              children: [...(item.children || []), newItem],
            };
          }
          if (item.children) {
            return {
              ...item,
              children: updateItems(item.children),
            };
          }
          return item;
        });
      };
      onItemsChange(updateItems(items));
    } else {
      // Add as root item
      onItemsChange([...items, newItem]);
    }
  };

  const removeItem = (itemId: string) => {
    const updateItems = (items: MenuItem[]): MenuItem[] => {
      return items.filter(item => {
        if (item.id === itemId) return false;
        if (item.children) {
          return {
            ...item,
            children: updateItems(item.children),
          };
        }
        return item;
      });
    };
    onItemsChange(updateItems(items));
  };

  const updateItem = (itemId: string, updates: Partial<MenuItem>) => {
    const updateItems = (items: MenuItem[]): MenuItem[] => {
      return items.map(item => {
        if (item.id === itemId) {
          return { ...item, ...updates };
        }
        if (item.children) {
          return {
            ...item,
            children: updateItems(item.children),
          };
        }
        return item;
      });
    };
    onItemsChange(updateItems(items));
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'page': return mdiFileDocument;
      case 'external': return mdiLink;
      case 'anchor': return mdiAnchor;
      case 'group': return mdiFolder;
      default: return mdiFileDocument;
    }
  };

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id} className="border border-gray-600 rounded mb-2">
        <div 
          className="flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 transition-colors"
          style={{ paddingLeft: `${depth * 20 + 12}px` }}
        >
          <div className="flex items-center gap-2">
            {hasChildren && (
              <button
                onClick={() => toggleExpanded(item.id)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <Icon 
                  path={isExpanded ? mdiChevronDown : mdiChevronRight} 
                  size={0.8} 
                />
              </button>
            )}
            <Icon path={getItemIcon(item.type)} size={0.8} className="text-gray-400" />
            <span className="text-white text-sm">
              {item.label['en-US'] || 'Untitled'}
            </span>
            <span className="text-xs text-gray-400">({item.type})</span>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => addItem(item.id)}
              className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
              title="Add child item"
            >
              <Icon path={mdiPlus} size={0.8} />
            </button>
            <button
              onClick={() => removeItem(item.id)}
              className="p-1 text-red-400 hover:text-red-300 transition-colors"
              title="Remove item"
            >
              <Icon path={mdiTrashCanOutline} size={0.8} />
            </button>
          </div>
        </div>

        {/* Item Details */}
        <div className="p-3 bg-gray-900 border-t border-gray-700">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Type</label>
              <select
                value={item.type}
                onChange={(e) => updateItem(item.id, { type: e.target.value as any })}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
              >
                <option value="page">Page</option>
                <option value="external">External Link</option>
                <option value="anchor">Anchor</option>
                <option value="separator">Separator</option>
                <option value="group">Group</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1">Label</label>
              <input
                type="text"
                value={item.label['en-US'] || ''}
                onChange={(e) => updateItem(item.id, { 
                  label: { ...item.label, 'en-US': e.target.value }
                })}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                placeholder="Menu item label"
              />
            </div>
            
            {item.type !== 'separator' && (
              <div className="col-span-2">
                <label className="block text-xs text-gray-400 mb-1">Target</label>
                <input
                  type="text"
                  value={item.target || ''}
                  onChange={(e) => updateItem(item.id, { target: e.target.value })}
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                  placeholder="URL or page slug"
                />
              </div>
            )}
          </div>
        </div>

        {/* Children */}
        {isExpanded && hasChildren && (
          <div className="ml-4">
            {item.children!.map(child => renderMenuItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-300">Menu Items</h4>
        <button
          onClick={() => addItem()}
          className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
        >
          <Icon path={mdiPlus} size={0.8} />
          Add Item
        </button>
      </div>

      <div className="space-y-2">
        {items.map(item => renderMenuItem(item))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">
          No menu items. Click "Add Item" to get started.
        </div>
      )}
    </div>
  );
}