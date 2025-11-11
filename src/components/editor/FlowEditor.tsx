'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, Reorder, useDragControls } from 'framer-motion';
import { GripVertical, X, Image as ImageIcon, Type, Maximize2, Minimize2 } from 'lucide-react';
import { FlowBlock } from '@/lib/store/types';

interface FlowEditorProps {
  blocks: FlowBlock[];
  onChange: (blocks: FlowBlock[]) => void;
}

export function FlowEditor({ blocks, onChange }: FlowEditorProps) {
  const [focusedBlock, setFocusedBlock] = useState<string | null>(null);

  const addTextBlock = () => {
    const newBlock: FlowBlock = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: '',
    };
    onChange([...blocks, newBlock]);
  };

  const updateBlock = (id: string, updates: Partial<FlowBlock>) => {
    onChange(
      blocks.map((block) =>
        block.id === id ? { ...block, ...updates } : block
      )
    );
  };

  const removeBlock = (id: string) => {
    onChange(blocks.filter((block) => block.id !== id));
  };

  const addImageAfterBlock = (afterId: string, imageSrc: string, imageName: string) => {
    const imageBlock: FlowBlock = {
      id: `image-${Date.now()}`,
      type: 'image',
      src: imageSrc,
      name: imageName,
      size: 'medium',
      alignment: 'center',
    };

    const index = blocks.findIndex((b) => b.id === afterId);
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, imageBlock);
    onChange(newBlocks);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Block Editor */}
      <Reorder.Group
        axis="y"
        values={blocks}
        onReorder={onChange}
        className="flex-1 space-y-4 p-4 overflow-y-auto"
      >
        {blocks.map((block) => (
          <FlowBlockComponent
            key={block.id}
            block={block}
            isFocused={focusedBlock === block.id}
            onFocus={() => setFocusedBlock(block.id)}
            onBlur={() => setFocusedBlock(null)}
            onUpdate={(updates) => updateBlock(block.id, updates)}
            onRemove={() => removeBlock(block.id)}
            onAddImage={(src, name) => addImageAfterBlock(block.id, src, name)}
          />
        ))}
      </Reorder.Group>

      {/* Add Block Button */}
      {blocks.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <button
            onClick={addTextBlock}
            className="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors"
          >
            <Type className="w-4 h-4" />
            Start writing...
          </button>
        </div>
      )}
    </div>
  );
}

function FlowBlockComponent({
  block,
  isFocused,
  onFocus,
  onBlur,
  onUpdate,
  onRemove,
  onAddImage,
}: {
  block: FlowBlock;
  isFocused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  onUpdate: (updates: Partial<FlowBlock>) => void;
  onRemove: () => void;
  onAddImage: (src: string, name: string) => void;
}) {
  const dragControls = useDragControls();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      onAddImage(result, file.name);
    };
    reader.readAsDataURL(file);
  }, [onAddImage]);

  if (block.type === 'text') {
    return (
      <Reorder.Item
        value={block}
        dragListener={false}
        dragControls={dragControls}
        className="group"
      >
        <motion.div
          layout
          className={`relative rounded-lg ${
            isFocused ? 'bg-purple-50 ring-2 ring-purple-300' : 'bg-white hover:bg-gray-50'
          } transition-all`}
        >
          {/* Drag Handle */}
          <div
            onPointerDown={(e) => dragControls.start(e)}
            className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>

          {/* Text Area */}
          <div className="pl-10 pr-10">
            <textarea
              value={block.content}
              onChange={(e) => onUpdate({ content: e.target.value })}
              onFocus={onFocus}
              onBlur={onBlur}
              placeholder="Type here... Press Enter to create a new block"
              className="w-full min-h-[60px] p-3 text-gray-900 bg-transparent border-none outline-none resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  // Create new text block
                }
              }}
            />
          </div>

          {/* Actions */}
          <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 hover:bg-purple-100 rounded text-purple-600 transition-colors"
              title="Add image"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <button
              onClick={onRemove}
              className="p-1.5 hover:bg-red-100 rounded text-red-600 transition-colors"
              title="Delete block"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </motion.div>
      </Reorder.Item>
    );
  }

  if (block.type === 'image') {
    return (
      <Reorder.Item
        value={block}
        dragListener={false}
        dragControls={dragControls}
        className="group"
      >
        <ImageBlock
          block={block as FlowBlock & { type: 'image' }}
          dragControls={dragControls}
          onUpdate={onUpdate}
          onRemove={onRemove}
        />
      </Reorder.Item>
    );
  }

  return null;
}

function ImageBlock({
  block,
  dragControls,
  onUpdate,
  onRemove,
}: {
  block: FlowBlock & { type: 'image' };
  dragControls: any;
  onUpdate: (updates: Partial<FlowBlock>) => void;
  onRemove: () => void;
}) {
  const getSizeClass = () => {
    switch (block.size) {
      case 'small': return 'max-w-xs';
      case 'medium': return 'max-w-md';
      case 'large': return 'max-w-2xl';
      default: return 'max-w-md';
    }
  };

  const getAlignmentClass = () => {
    switch (block.alignment) {
      case 'left': return 'mr-auto';
      case 'center': return 'mx-auto';
      case 'right': return 'ml-auto';
      case 'float-left': return 'float-left mr-4 mb-4';
      case 'float-right': return 'float-right ml-4 mb-4';
      default: return 'mx-auto';
    }
  };

  return (
    <motion.div
      layout
      className={`relative ${getSizeClass()} ${getAlignmentClass()} group`}
    >
      {/* Drag Handle */}
      <div
        onPointerDown={(e) => dragControls.start(e)}
        className="absolute -left-10 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing bg-white rounded-lg shadow-md z-10"
      >
        <GripVertical className="w-4 h-4 text-gray-600" />
      </div>

      {/* Image Container */}
      <div className="relative rounded-lg overflow-hidden shadow-lg border-2 border-gray-200 group-hover:border-purple-400 transition-colors">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={block.src}
          alt={block.name}
          className="w-full h-auto"
          draggable={false}
        />

        {/* Overlay Controls */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />

        {/* Floating Toolbar */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto flex gap-1">
          {/* Size Toggle */}
          <button
            onClick={() => {
              const sizes: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large'];
              const currentSize = block.size === 'full' ? 'large' : (block.size || 'medium');
              const currentIndex = sizes.indexOf(currentSize as 'small' | 'medium' | 'large');
              const nextSize = sizes[(currentIndex + 1) % sizes.length];
              onUpdate({ size: nextSize });
            }}
            className="p-1.5 bg-white/90 hover:bg-white rounded text-gray-700 transition-colors shadow-sm"
            title="Change size"
          >
            {block.size === 'small' ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Delete */}
          <button
            onClick={onRemove}
            className="p-1.5 bg-white/90 hover:bg-red-50 rounded text-red-600 transition-colors shadow-sm"
            title="Delete image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Alignment Controls */}
        <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
          <select
            value={block.alignment}
            onChange={(e) => onUpdate({ alignment: e.target.value as any })}
            className="px-2 py-1 text-xs bg-white/90 rounded shadow-sm border border-gray-300"
          >
            <option value="left">Align Left</option>
            <option value="center">Center</option>
            <option value="right">Align Right</option>
            <option value="float-left">Float Left</option>
            <option value="float-right">Float Right</option>
          </select>
        </div>

        {/* Image Name */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
          <p className="text-xs text-white font-medium truncate">{block.name}</p>
        </div>
      </div>
    </motion.div>
  );
}
