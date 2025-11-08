'use client';

import { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  NodeProps,
  Handle,
  Position,
  ConnectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { X, Plus } from 'lucide-react';
import { useNotesStore } from '@/lib/store/useNotesStore';

// Define node data type
interface NodeData extends Record<string, unknown> {
  label: string;
  background?: string;
  color?: string;
  border?: string;
  fontWeight?: string;
  onLabelChange?: (nodeId: string, newLabel: string) => void;
}

interface MindmapEditorProps {
  isOpen: boolean;
  onClose: () => void;
  initialTitle?: string;
  existingMindmap?: {
    noteId: string;
    nodes: Node<NodeData>[];
    edges: Edge[];
  };
}

// Custom editable node component
function EditableNode({ data, id }: NodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const nodeData = data as NodeData;
  const [label, setLabel] = useState<string>(nodeData.label || '');

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (nodeData.onLabelChange) {
      nodeData.onLabelChange(id, label);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setIsEditing(false);
      if (nodeData.onLabelChange) {
        nodeData.onLabelChange(id, label);
      }
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setLabel(nodeData.label || '');
      setIsEditing(false);
    }
  };

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      onDoubleClick={handleDoubleClick}
      style={{
        background: nodeData.background || '#8ef292',
        color: nodeData.color || '#121421',
        border: nodeData.border || '1px solid #121421',
        borderRadius: '8px',
        padding: '8px 12px',
        minWidth: '100px',
        textAlign: 'center',
        fontWeight: nodeData.fontWeight || 'normal',
        cursor: isEditing ? 'text' : 'grab',
      }}
    >
      {/* Connection handles */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      {isEditing ? (
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onClick={handleInputClick}
          onMouseDown={(e) => e.stopPropagation()}
          autoFocus
          className="bg-transparent border-none outline-none text-center w-full nodrag"
          style={{ color: nodeData.color || '#121421', cursor: 'text' }}
        />
      ) : (
        <div>{label}</div>
      )}
    </div>
  );
}

const nodeTypes = {
  editable: EditableNode,
};

const initialNodes: Node<NodeData>[] = [];
const initialEdges: Edge[] = [];

export function MindmapEditor({ isOpen, onClose, initialTitle, existingMindmap }: MindmapEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodeIdCounter, setNodeIdCounter] = useState(1);
  const [mindmapTitle, setMindmapTitle] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const { addNote, updateNote } = useNotesStore();

  // Initialize with existing mindmap or create new one
  useEffect(() => {
    if (isOpen) {
      if (existingMindmap) {
        // Load existing mindmap
        const nodesWithCallbacks = existingMindmap.nodes.map(node => ({
          ...node,
          data: {
            ...node.data,
            onLabelChange: handleNodeLabelChange,
          },
        }));
        setNodes(nodesWithCallbacks);
        setEdges(existingMindmap.edges);
        setEditingNoteId(existingMindmap.noteId);

        // Set counter to highest node id + 1
        const maxId = Math.max(...existingMindmap.nodes.map(n => parseInt(n.id) || 0), 0);
        setNodeIdCounter(maxId + 1);

        // Extract title from first node or use default
        const centralNode = existingMindmap.nodes.find(n => n.id === '1');
        setMindmapTitle(centralNode?.data?.label || initialTitle || 'Mindmap');
      } else if (nodes.length === 0) {
        // Create new mindmap with central node
        const centralNode: Node<NodeData> = {
          id: '1',
          type: 'editable',
          data: {
            label: initialTitle || 'Central Idea',
            background: '#63cdff',
            color: '#121421',
            border: '2px solid #121421',
            fontWeight: 'bold',
            onLabelChange: handleNodeLabelChange,
          },
          position: { x: 250, y: 150 },
        };
        setNodes([centralNode]);
        setNodeIdCounter(2);
        setMindmapTitle(initialTitle || 'Mindmap');
        setEditingNoteId(null);
      }
    }
  }, [isOpen, existingMindmap]);

  const handleNodeLabelChange = useCallback((nodeId: string, newLabel: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, label: newLabel } }
          : node
      )
    );
  }, [setNodes]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = useCallback(() => {
    const newNode: Node<NodeData> = {
      id: nodeIdCounter.toString(),
      type: 'editable',
      data: {
        label: `Idea ${nodeIdCounter}`,
        background: '#8ef292',
        color: '#121421',
        border: '1px solid #121421',
        onLabelChange: handleNodeLabelChange,
      },
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
    };

    setNodes((nds) => [...nds, newNode]);
    setNodeIdCounter((id) => id + 1);
  }, [nodeIdCounter, setNodes, handleNodeLabelChange]);

  const handleSave = useCallback(() => {
    // Convert mindmap to markdown format for preview
    let content = `# ${mindmapTitle}\n\n`;
    content += '## Mindmap Structure\n\n';

    nodes.forEach((node) => {
      content += `- **${node.data.label}**\n`;
    });

    content += '\n## Connections\n\n';
    edges.forEach((edge) => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      if (sourceNode && targetNode) {
        content += `- ${sourceNode.data.label} → ${targetNode.data.label}\n`;
      }
    });

    // Prepare mindmap data for storage
    const mindmapData = {
      nodes: nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          onLabelChange: undefined, // Remove callback for serialization
        },
      })),
      edges,
    };

    if (editingNoteId) {
      // Update existing mindmap note
      updateNote(editingNoteId, {
        title: mindmapTitle,
        content,
        mindmapData,
      });
    } else {
      // Create new mindmap note
      addNote({
        title: mindmapTitle,
        content,
        tags: ['mindmap'],
        isPinned: false,
        mindmapData,
      });
    }

    // Reset and close
    setNodes([]);
    setEdges([]);
    setNodeIdCounter(1);
    setEditingNoteId(null);
    onClose();
  }, [mindmapTitle, nodes, edges, editingNoteId, addNote, updateNote, onClose, setNodes, setEdges]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-[--color-text-black]">
            Mindmap Editor
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={addNode}
              className="flex items-center gap-2 px-3 py-1.5 bg-[--color-primary-green] text-[--color-text-black] rounded-lg hover:opacity-90 transition-opacity text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Node
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mindmap Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            connectionMode={ConnectionMode.Loose}
            fitView
          >
            <Controls />
            <MiniMap
              nodeColor="#63cdff"
              maskColor="rgba(0, 0, 0, 0.1)"
            />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <p>💡 <strong>Tip:</strong> Double-click nodes to edit. Drag nodes to move them. Click and drag between nodes to create connections.</p>
            </div>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[--color-primary-blue] text-[--color-text-black] rounded-lg hover:opacity-90 transition-opacity"
            >
              Save Mindmap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
