'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GripVertical,
  ChevronDown,
  ChevronUp,
  Trash2,
  MoreVertical,
  Type,
  Image as ImageIcon,
  Code,
  CheckSquare,
  Heading1,
} from 'lucide-react';
import { ContentBlock } from '@/lib/store/types';

interface SmartBlocksProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

export function SmartBlocks({ blocks, onChange }: SmartBlocksProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);

      const reorderedBlocks = arrayMove(blocks, oldIndex, newIndex).map((block, index) => ({
        ...block,
        order: index,
      }));

      onChange(reorderedBlocks);
    }
  };

  const handleBlockChange = (id: string, content: string) => {
    onChange(
      blocks.map((block) =>
        block.id === id ? { ...block, content } : block
      )
    );
  };

  const handleBlockDelete = (id: string) => {
    onChange(blocks.filter((block) => block.id !== id));
  };

  const handleBlockCollapse = (id: string) => {
    onChange(
      blocks.map((block) =>
        block.id === id ? { ...block, collapsed: !block.collapsed } : block
      )
    );
  };

  const addBlock = (type: ContentBlock['type']) => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type,
      content: '',
      order: blocks.length,
      collapsed: false,
    };
    onChange([...blocks, newBlock]);
  };

  return (
    <div className="space-y-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence mode="popLayout">
            {blocks.map((block) => (
              <SortableBlock
                key={block.id}
                block={block}
                onChange={handleBlockChange}
                onDelete={handleBlockDelete}
                onCollapse={handleBlockCollapse}
              />
            ))}
          </AnimatePresence>
        </SortableContext>
      </DndContext>

      {/* Add Block Menu */}
      <div className="flex flex-wrap gap-2 pt-4">
        <button
          onClick={() => addBlock('text')}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <Type className="w-4 h-4" />
          Text
        </button>
        <button
          onClick={() => addBlock('heading')}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <Heading1 className="w-4 h-4" />
          Heading
        </button>
        <button
          onClick={() => addBlock('code')}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <Code className="w-4 h-4" />
          Code
        </button>
        <button
          onClick={() => addBlock('checklist')}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <CheckSquare className="w-4 h-4" />
          Checklist
        </button>
      </div>
    </div>
  );
}

interface SortableBlockProps {
  block: ContentBlock;
  onChange: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onCollapse: (id: string) => void;
}

function SortableBlock({ block, onChange, onDelete, onCollapse }: SortableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [showMenu, setShowMenu] = useState(false);

  const getPlaceholder = () => {
    switch (block.type) {
      case 'heading':
        return 'Enter heading...';
      case 'code':
        return '// Enter code...';
      case 'checklist':
        return '☐ Enter checklist item...';
      default:
        return 'Enter text...';
    }
  };

  const getBlockStyle = () => {
    switch (block.type) {
      case 'heading':
        return 'text-2xl font-bold';
      case 'code':
        return 'font-mono bg-gray-50 px-3 py-2 rounded-lg';
      default:
        return '';
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={`group relative border-2 rounded-lg transition-all ${
        isDragging ? 'border-purple-500 shadow-lg' : 'border-transparent hover:border-gray-200'
      }`}
    >
      <div className="flex items-start gap-2 p-3">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {block.collapsed ? (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm text-gray-500 italic cursor-pointer"
                onClick={() => onCollapse(block.id)}
              >
                {block.content.slice(0, 50)}
                {block.content.length > 50 && '...'}
              </motion.div>
            ) : (
              <motion.textarea
                key="expanded"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                value={block.content}
                onChange={(e) => onChange(block.id, e.target.value)}
                placeholder={getPlaceholder()}
                className={`w-full resize-none outline-none ${getBlockStyle()}`}
                rows={block.type === 'heading' ? 1 : 3}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onCollapse(block.id)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title={block.collapsed ? 'Expand' : 'Collapse'}
          >
            {block.collapsed ? (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronUp className="w-4 h-4 text-gray-600" />
            )}
          </button>
          <button
            onClick={() => onDelete(block.id)}
            className="p-1 hover:bg-red-50 rounded transition-colors"
            title="Delete block"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
