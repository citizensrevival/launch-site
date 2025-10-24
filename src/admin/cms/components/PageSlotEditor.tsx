// Page Slot Editor Component
// Manages page slots with drag-and-drop block ordering

import { useState, useEffect } from 'react';
import { Icon } from '@mdi/react';
import { 
  mdiPlus,
  mdiMinus,
  mdiDrag,
  mdiCog,
  mdiChevronDown,
  mdiChevronUp,
  mdiContentSave,
  mdiClose
} from '@mdi/js';
// Stub type - TODO: Implement proper BlockInstance type
type BlockInstance = {
  id: string;
  block_id: string;
  block_version: number;
  settings: Record<string, any>;
  slot?: string;
  order?: number;
};

// Stub function - TODO: Implement proper UUID generation
const generateUUID = () => Math.random().toString(36).substr(2, 9);

interface PageSlotEditorProps {
  slots: BlockInstance[];
  onSlotsChange: (slots: BlockInstance[]) => void;
  onClose: () => void;
}

interface SlotGroup {
  slot: string;
  blocks: BlockInstance[];
}

const COMMON_SLOTS = [
  'header',
  'hero',
  'content',
  'sidebar',
  'footer',
  'navigation'
];

export function PageSlotEditor({ slots, onSlotsChange, onClose }: PageSlotEditorProps) {
  const [slotGroups, setSlotGroups] = useState<SlotGroup[]>([]);
  const [draggedBlock, setDraggedBlock] = useState<BlockInstance | null>(null);
  const [draggedOverSlot, setDraggedOverSlot] = useState<string | null>(null);
  const [expandedSlots, setExpandedSlots] = useState<Set<string>>(new Set(['hero', 'content']));

  // Group blocks by slot
  useEffect(() => {
    const groups: SlotGroup[] = [];
    const slotMap = new Map<string, BlockInstance[]>();

    // Group existing blocks
    slots.forEach(block => {
      const slotName = block.slot || 'default';
      if (!slotMap.has(slotName)) {
        slotMap.set(slotName, []);
      }
      slotMap.get(slotName)!.push(block);
    });

    // Create groups and sort blocks by order
    slotMap.forEach((blocks, slot) => {
      groups.push({
        slot,
        blocks: blocks.sort((a, b) => (a.order || 0) - (b.order || 0))
      });
    });

    // Add empty slots that are commonly used
    COMMON_SLOTS.forEach(slot => {
      if (!slotMap.has(slot)) {
        groups.push({ slot, blocks: [] });
      }
    });

    // Sort groups by slot name
    groups.sort((a, b) => a.slot.localeCompare(b.slot));
    setSlotGroups(groups);
  }, [slots]);

  const handleDragStart = (e: React.DragEvent, block: BlockInstance) => {
    setDraggedBlock(block);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, slot: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverSlot(slot);
  };

  const handleDragLeave = () => {
    setDraggedOverSlot(null);
  };

  const handleDrop = (e: React.DragEvent, targetSlot: string) => {
    e.preventDefault();
    if (!draggedBlock) return;

    const newSlots = slots.map(block => {
      if (block.block_id === draggedBlock.block_id) {
        return { ...block, slot: targetSlot };
      }
      return block;
    });

    // Reorder blocks in the target slot
    const targetSlotBlocks = newSlots
      .filter(block => block.slot === targetSlot)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    // Update order for all blocks in the target slot
    const updatedSlots = newSlots.map(block => {
      if (block.slot === targetSlot) {
        const index = targetSlotBlocks.findIndex(b => b.block_id === block.block_id);
        return { ...block, order: index };
      }
      return block;
    });

    onSlotsChange(updatedSlots);
    setDraggedBlock(null);
    setDraggedOverSlot(null);
  };

  const addBlockToSlot = (slot: string) => {
    const newBlock: BlockInstance = {
      id: generateUUID(),
      slot,
      order: slotGroups.find(g => g.slot === slot)?.blocks.length || 0,
      block_id: generateUUID(),
      block_version: 1,
      settings: {}
    };

    onSlotsChange([...slots, newBlock]);
  };

  const removeBlockFromSlot = (blockId: string) => {
    onSlotsChange(slots.filter(block => block.block_id !== blockId));
  };

  const moveBlockUp = (block: BlockInstance) => {
    const slotBlocks = slots
      .filter(b => b.slot === block.slot)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    
    const currentIndex = slotBlocks.findIndex(b => b.block_id === block.block_id);
    if (currentIndex > 0) {
      const newSlots = slots.map(b => {
        if (b.block_id === block.block_id) {
          return { ...b, order: currentIndex - 1 };
        } else if (b.slot === block.slot && b.order === currentIndex - 1) {
          return { ...b, order: currentIndex };
        }
        return b;
      });
      onSlotsChange(newSlots);
    }
  };

  const moveBlockDown = (block: BlockInstance) => {
    const slotBlocks = slots
      .filter(b => b.slot === block.slot)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    
    const currentIndex = slotBlocks.findIndex(b => b.block_id === block.block_id);
    if (currentIndex < slotBlocks.length - 1) {
      const newSlots = slots.map(b => {
        if (b.block_id === block.block_id) {
          return { ...b, order: currentIndex + 1 };
        } else if (b.slot === block.slot && b.order === currentIndex + 1) {
          return { ...b, order: currentIndex };
        }
        return b;
      });
      onSlotsChange(newSlots);
    }
  };

  const toggleSlotExpansion = (slot: string) => {
    const newExpanded = new Set(expandedSlots);
    if (newExpanded.has(slot)) {
      newExpanded.delete(slot);
    } else {
      newExpanded.add(slot);
    }
    setExpandedSlots(newExpanded);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-white">Page Slots Editor</h2>
            <p className="text-sm text-gray-400">Drag and drop blocks between slots</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
          >
            <Icon path={mdiClose} size={1.2} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {slotGroups.map(group => (
              <div
                key={group.slot}
                className={`bg-gray-750 rounded-lg border-2 transition-colors ${
                  draggedOverSlot === group.slot 
                    ? 'border-purple-500 bg-purple-900/20' 
                    : 'border-gray-600'
                }`}
                onDragOver={(e) => handleDragOver(e, group.slot)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, group.slot)}
              >
                {/* Slot Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-600">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toggleSlotExpansion(group.slot)}
                      className="p-1 text-gray-400 hover:text-white transition-colors"
                    >
                      <Icon 
                        path={expandedSlots.has(group.slot) ? mdiChevronDown : mdiChevronUp} 
                        size={1} 
                      />
                    </button>
                    <h3 className="text-lg font-medium text-white capitalize">
                      {group.slot} Slot
                    </h3>
                    <span className="text-sm text-gray-400">
                      ({group.blocks.length} blocks)
                    </span>
                  </div>
                  <button
                    onClick={() => addBlockToSlot(group.slot)}
                    className="flex items-center space-x-2 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
                  >
                    <Icon path={mdiPlus} size={0.8} />
                    <span>Add Block</span>
                  </button>
                </div>

                {/* Slot Content */}
                {expandedSlots.has(group.slot) && (
                  <div className="p-4">
                    {group.blocks.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <p>No blocks in this slot</p>
                        <p className="text-sm">Drag blocks here or click "Add Block"</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {group.blocks.map((block, index) => (
                          <div
                            key={block.block_id}
                            className="flex items-center space-x-3 p-3 bg-gray-700 rounded-md border border-gray-600"
                            draggable
                            onDragStart={(e) => handleDragStart(e, block)}
                          >
                            <div className="flex items-center space-x-2 text-gray-400">
                              <Icon path={mdiDrag} size={1} />
                              <span className="text-sm">#{index + 1}</span>
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-white font-medium">
                                  Block {block.block_id.slice(0, 8)}...
                                </span>
                                <span className="text-sm text-gray-400">
                                  (Order: {block.order})
                                </span>
                              </div>
                              {block.settings && Object.keys(block.settings).length > 0 && (
                                <div className="text-sm text-gray-400">
                                  Props: {Object.keys(block.settings).join(', ')}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => moveBlockUp(block)}
                                disabled={index === 0}
                                className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Move up"
                              >
                                <Icon path={mdiChevronUp} size={0.8} />
                              </button>
                              <button
                                onClick={() => moveBlockDown(block)}
                                disabled={index === group.blocks.length - 1}
                                className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Move down"
                              >
                                <Icon path={mdiChevronDown} size={0.8} />
                              </button>
                              <button
                                onClick={() => {/* TODO: Implement block configuration */}}
                                className="p-1 text-gray-400 hover:text-white transition-colors"
                                title="Configure block"
                              >
                                <Icon path={mdiCog} size={0.8} />
                              </button>
                              <button
                                onClick={() => removeBlockFromSlot(block.block_id)}
                                className="p-1 text-red-400 hover:text-red-300 transition-colors"
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
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <div className="text-sm text-gray-400">
            {slots.length} total blocks across {slotGroups.length} slots
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
            >
              <Icon path={mdiContentSave} size={0.9} />
              <span>Save Slots</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
