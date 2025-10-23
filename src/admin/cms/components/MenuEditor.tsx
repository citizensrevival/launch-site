// Menu Editor Component
// Tree-based editor for menu items

import { useState, useEffect } from 'react';
import { Icon } from '@mdi/react';
import { 
  mdiClose,
  mdiPlus,
  mdiMinus,
  mdiDrag,
  mdiChevronRight,
  mdiChevronDown,
  mdiPencil,
  mdiTrashCanOutline,
  mdiContentSave,
  mdiEye,
  mdiEyeOff,
  mdiFileDocument,
  mdiLink,
  mdiAnchor,
  mdiFolder
} from '@mdi/js';
import { useMenuVersions, useMenuVersionManagement, useMenuManagement } from '../../../lib/cms/hooks';
import { MenuItemEditor } from './MenuItemEditor';
import { supabase } from '../../../shell/lib/supabase';

interface MenuEditorProps {
  menuId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItemWithChildren {
  id: string;
  type: 'page' | 'external' | 'anchor' | 'separator' | 'group';
  label?: any;
  target?: string;
  rel?: any;
  url?: string;
  anchor?: string;
  page_id?: string;
  order?: number;
  children?: MenuItemWithChildren[];
  visibility?: any;
  badge?: any;
  style_hints?: any;
  isExpanded?: boolean;
  isEditing?: boolean;
  isAddingChild?: boolean;
}

// Convert MenuItemWithChildren to MenuItem for editing
function convertToMenuItem(item: MenuItemWithChildren): any {
  const { isExpanded, isEditing, isAddingChild, children, ...menuItem } = item;
  return menuItem;
}

export function MenuEditor({ menuId, isOpen, onClose }: MenuEditorProps) {
  const { versions } = useMenuVersions(menuId);
  const { createMenuVersion, loading: managementLoading } = useMenuVersionManagement();
  const { publishMenu, unpublishMenu, loading: publishLoading } = useMenuManagement();

  // State
  const [currentVersion, setCurrentVersion] = useState<any>(null);
  const [items, setItems] = useState<MenuItemWithChildren[]>([]);
  const [editingItem, setEditingItem] = useState<MenuItemWithChildren | null>(null);
  const [, setAddingItem] = useState<MenuItemWithChildren | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Load current version
  useEffect(() => {
    if (versions && versions.length > 0) {
      const latestVersion = versions[0];
      setCurrentVersion(latestVersion);
      // Extract items from localized content structure
      const items = latestVersion.items?.['en-US'] || [];
      setItems(items);
    }
  }, [versions]);

  // Handle item expansion
  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Handle add item
  const handleAddItem = (parentId?: string) => {
    const newItem: MenuItemWithChildren = {
      id: `temp-${Date.now()}`,
      type: 'page',
      label: { 'en-US': 'New Item' },
      isEditing: true
    };

    if (parentId) {
      // Add as child
      setItems(prev => addItemAsChild(prev, parentId, newItem));
    } else {
      // Add as root item
      setItems(prev => [...prev, newItem]);
    }
    setEditingItem(newItem);
  };

  // Handle edit item
  const handleEditItem = (item: MenuItemWithChildren) => {
    setEditingItem(item);
  };

  // Handle delete item
  const handleDeleteItem = (itemId: string) => {
    setItems(prev => removeItem(prev, itemId));
  };

  // Handle save item
  const handleSaveItem = (updatedItem: MenuItemWithChildren) => {
    setItems(prev => updateItem(prev, updatedItem));
    setEditingItem(null);
    setAddingItem(null);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    if (editingItem?.id.startsWith('temp-')) {
      // Remove temporary item
      setItems(prev => removeItem(prev, editingItem.id));
    }
    setEditingItem(null);
    setAddingItem(null);
  };

  // Handle save version
  const handleSaveVersion = async () => {
    try {
      const nextVersion = currentVersion ? currentVersion.version + 1 : 1;
      
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ [MenuEditor] User not authenticated');
        return;
      }
      
      const versionData = {
        menu_id: menuId,
        version: nextVersion,
        items: { 'en-US': items }, // Wrap in localized content structure
        created_by: user.id
      };

      const savedVersion = await createMenuVersion(versionData);
      if (savedVersion) {
        setCurrentVersion(savedVersion);
        console.log('✅ [MenuEditor] Version saved successfully');
      }
    } catch (error) {
      console.error('❌ [MenuEditor] Error saving version:', error);
    }
  };

  // Handle publish menu
  const handlePublishMenu = async () => {
    if (!currentVersion) return;
    
    try {
      const success = await publishMenu(menuId, currentVersion.version);
      if (success) {
        console.log('✅ [MenuEditor] Menu published successfully');
      } else {
        console.error('❌ [MenuEditor] Failed to publish menu');
      }
    } catch (error) {
      console.error('❌ [MenuEditor] Error publishing menu:', error);
    }
  };

  // Handle unpublish menu
  const handleUnpublishMenu = async () => {
    try {
      const success = await unpublishMenu(menuId);
      if (success) {
        console.log('✅ [MenuEditor] Menu unpublished successfully');
      } else {
        console.error('❌ [MenuEditor] Failed to unpublish menu');
      }
    } catch (error) {
      console.error('❌ [MenuEditor] Error unpublishing menu:', error);
    }
  };

  // Render menu item
  const renderMenuItem = (item: MenuItemWithChildren, depth = 0) => {
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const isEditing = editingItem?.id === item.id;

    return (
      <div key={item.id} className="select-none">
        <div 
          className={`flex items-center gap-2 p-3 hover:bg-gray-700 rounded-lg transition-colors ${
            isEditing ? 'bg-blue-900 border border-blue-700' : ''
          }`}
          style={{ paddingLeft: `${depth * 20 + 12}px` }}
        >
          {/* Expand/Collapse Button */}
          {hasChildren && (
            <button
              onClick={() => toggleExpanded(item.id)}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <Icon path={isExpanded ? mdiChevronDown : mdiChevronRight} size={1} />
            </button>
          )}
          
          {/* Drag Handle */}
          <div className="p-1 text-gray-500 cursor-move">
            <Icon path={mdiDrag} size={0.8} />
          </div>

          {/* Item Type Icon */}
          <div className="w-6 h-6 flex items-center justify-center">
            <Icon path={getItemTypeIcon(item.type)} size={1} className="text-gray-400" />
          </div>

          {/* Item Label */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">
              {typeof item.label === 'string' ? item.label : item.label?.['en-US'] || 'Untitled'}
            </div>
            <div className="text-xs text-gray-400 capitalize">
              {item.type} {item.url && `• ${item.url}`}
            </div>
          </div>

          {/* Visibility Indicator */}
          {item.visibility && (
            <div className="p-1 text-gray-400" title="Has visibility rules">
              <Icon path={mdiEye} size={0.8} />
            </div>
          )}

          {/* Badge Indicator */}
          {item.badge && (
            <div className="px-2 py-1 bg-blue-900 text-blue-300 rounded text-xs">
              Badge
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleAddItem(item.id)}
              className="p-1 text-gray-400 hover:text-green-400 rounded transition-colors"
              title="Add child item"
            >
              <Icon path={mdiPlus} size={0.8} />
            </button>
            
            <button
              onClick={() => handleEditItem(item)}
              className="p-1 text-gray-400 hover:text-yellow-400 rounded transition-colors"
              title="Edit item"
            >
              <Icon path={mdiPencil} size={0.8} />
            </button>
            
            <button
              onClick={() => handleDeleteItem(item.id)}
              className="p-1 text-gray-400 hover:text-red-400 rounded transition-colors"
              title="Delete item"
            >
              <Icon path={mdiTrashCanOutline} size={0.8} />
            </button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="ml-4">
            {item.children!.map(child => renderMenuItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-white">Menu Editor</h2>
            <p className="text-sm text-gray-400">Edit menu items and structure</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Icon path={mdiClose} size={1.2} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Menu Items Tree */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-2">
              {items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Icon path={mdiPlus} size={2} className="mx-auto mb-2 text-gray-600" />
                  <p className="text-sm">No menu items yet</p>
                  <p className="text-xs mb-4">Add your first menu item to get started</p>
                  <button
                    onClick={() => handleAddItem()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <Icon path={mdiPlus} size={0.8} />
                    Add First Item
                  </button>
                </div>
              ) : (
                items.map(item => renderMenuItem(item))
              )}
            </div>
          </div>

          {/* Editor Panel */}
          <div className="w-96 border-l border-gray-700 bg-gray-750">
            {editingItem ? (
              <MenuItemEditor
                item={convertToMenuItem(editingItem)}
                onSave={(item) => handleSaveItem({ ...item, children: editingItem.children, isExpanded: editingItem.isExpanded, isEditing: editingItem.isEditing, isAddingChild: editingItem.isAddingChild })}
                onCancel={handleCancelEdit}
              />
            ) : (
              <div className="p-6 text-center text-gray-500">
                <Icon path={mdiPencil} size={2} className="mx-auto mb-2 text-gray-600" />
                <p className="text-sm">Select a menu item to edit</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <div className="text-sm text-gray-400">
            {items.length} item{items.length !== 1 ? 's' : ''} in menu
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveVersion}
              disabled={managementLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {managementLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Icon path={mdiContentSave} size={0.8} />
                  Save Version
                </>
              )}
            </button>
            <button
              onClick={handlePublishMenu}
              disabled={publishLoading || !currentVersion}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {publishLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Publishing...
                </>
              ) : (
                <>
                  <Icon path={mdiEye} size={0.8} />
                  Publish
                </>
              )}
            </button>
            <button
              onClick={handleUnpublishMenu}
              disabled={publishLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {publishLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Unpublishing...
                </>
              ) : (
                <>
                  <Icon path={mdiEyeOff} size={0.8} />
                  Unpublish
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getItemTypeIcon(type: string) {
  switch (type) {
    case 'page': return mdiFileDocument;
    case 'external': return mdiLink;
    case 'anchor': return mdiAnchor;
    case 'separator': return mdiMinus;
    case 'group': return mdiFolder;
    default: return mdiFileDocument;
  }
}

function addItemAsChild(items: MenuItemWithChildren[], parentId: string, newItem: MenuItemWithChildren): MenuItemWithChildren[] {
  return items.map(item => {
    if (item.id === parentId) {
      return {
        ...item,
        children: [...(item.children || []), newItem]
      };
    }
    if (item.children) {
      return {
        ...item,
        children: addItemAsChild(item.children, parentId, newItem)
      };
    }
    return item;
  });
}

function removeItem(items: MenuItemWithChildren[], itemId: string): MenuItemWithChildren[] {
  return items.filter(item => {
    if (item.id === itemId) return false;
    if (item.children) {
      item.children = removeItem(item.children, itemId);
    }
    return true;
  });
}

function updateItem(items: MenuItemWithChildren[], updatedItem: MenuItemWithChildren): MenuItemWithChildren[] {
  return items.map(item => {
    if (item.id === updatedItem.id) {
      return updatedItem;
    }
    if (item.children) {
      return {
        ...item,
        children: updateItem(item.children, updatedItem)
      };
    }
    return item;
  });
}
