'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit2, Check, X } from 'lucide-react';

interface ClusterLabelProps {
  clusterId: string;
  name: string;
  color: string;
  position: { x: number; y: number };
  onNameChange: (clusterId: string, newName: string) => void;
}

export function ClusterLabel({ clusterId, name, color, position, onNameChange }: ClusterLabelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(name);

  const handleSave = () => {
    if (editedName.trim()) {
      onNameChange(clusterId, editedName.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedName(name);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        position: 'absolute',
        left: position.x - 100,
        top: position.y - 180,
        zIndex: 10,
      }}
      className="pointer-events-auto"
    >
      <div
        className="px-4 py-2 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-2 group"
        style={{
          backgroundColor: `${color}30`,
          border: `2px solid ${color}`,
        }}
      >
        {isEditing ? (
          <>
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              autoFocus
              className="bg-transparent border-none outline-none text-sm font-semibold text-[--color-text-black] w-32"
              style={{ color: '#121421' }}
            />
            <button
              onClick={handleSave}
              className="p-1 hover:bg-white/50 rounded transition-colors"
            >
              <Check className="w-3 h-3" style={{ color }} />
            </button>
            <button
              onClick={handleCancel}
              className="p-1 hover:bg-white/50 rounded transition-colors"
            >
              <X className="w-3 h-3" style={{ color }} />
            </button>
          </>
        ) : (
          <>
            <span className="text-sm font-semibold text-[--color-text-black]">
              {name}
            </span>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 opacity-0 group-hover:opacity-100 hover:bg-white/50 rounded transition-all"
            >
              <Edit2 className="w-3 h-3" style={{ color }} />
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
