'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
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
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { X, Plus, Sparkles, Undo2, Redo2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNotesStore } from '@/lib/store/useNotesStore';
import { useSettingsStore } from '@/lib/store/useSettingsStore';
import { MindmapOrganizerService, NodeCluster } from '@/lib/ai/mindmap-organizer';
import { OrganizingModal } from './OrganizingModal';
import { ClusterLabel } from './ClusterLabel';

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
        background: nodeData.background || 'var(--accent-primary)',
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
  const { settings } = useSettingsStore();

  // AI Organize state
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [organizingStage, setOrganizingStage] = useState<'analyzing' | 'clustering' | 'organizing' | 'complete'>('analyzing');
  const [organizingProgress, setOrganizingProgress] = useState(0);
  const [clusters, setClusters] = useState<NodeCluster[]>([]);

  // Undo/Redo state
  const [history, setHistory] = useState<Array<{ nodes: Node[]; edges: Edge[] }>>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedoAction = useRef(false);

  const organizerService = useRef(new MindmapOrganizerService());

  // Initialize with existing mindmap or create new one
  useEffect(() => {
    if (isOpen) {
      if (existingMindmap) {
        // Load existing mindmap - handle both old AI format and new React Flow format
        const nodesWithCallbacks = existingMindmap.nodes.map(node => {
          // Check if this is old AI format (has label at root level instead of in data)
          const isOldFormat = 'label' in node && 'type' in node && !node.data;

          if (isOldFormat) {
            // Migrate old AI-generated mindmap format
            const oldNode = node as any;
            const nodeType = oldNode.type || 'leaf';
            const background = nodeType === 'root' ? '#9333ea' :
                              nodeType === 'branch' ? '#3b82f6' : '#10b981';
            const color = '#ffffff';
            const fontWeight = nodeType === 'root' ? 'bold' : 'normal';

            return {
              id: oldNode.id,
              type: 'default',
              position: oldNode.position || { x: 0, y: 0 },
              data: {
                label: oldNode.label || '',
                background,
                color,
                border: 'none',
                fontWeight,
                onLabelChange: handleNodeLabelChange,
              } as NodeData,
              style: {
                background,
                color,
                border: 'none',
                borderRadius: '8px',
                padding: '10px 15px',
                fontSize: '14px',
                fontWeight,
              },
            } as Node<NodeData>;
          } else {
            // New React Flow format
            const background = node.data?.background || 'var(--accent-primary)';
            const color = node.data?.color || '#121421';
            const border = node.data?.border || '1px solid #121421';
            const fontWeight = node.data?.fontWeight || 'normal';

            return {
              ...node,
              data: {
                label: node.data?.label || '',
                background,
                color,
                border,
                fontWeight,
                onLabelChange: handleNodeLabelChange,
              } as NodeData,
              style: {
                background,
                color,
                border,
                borderRadius: '8px',
                padding: '10px 15px',
                fontSize: '14px',
                fontWeight,
              },
            } as Node<NodeData>;
          }
        });

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
            background: 'var(--accent-primary)',
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

  // Save to history for undo/redo
  const saveToHistory = useCallback(() => {
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }

    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({ nodes, edges });
      // Keep only last 20 states
      return newHistory.slice(-20);
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 19));
  }, [nodes, edges, historyIndex]);

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoRedoAction.current = true;
      const prevState = history[historyIndex - 1];
      setNodes(prevState.nodes as Node<NodeData>[]);
      setEdges(prevState.edges);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex, setNodes, setEdges]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedoAction.current = true;
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes as Node<NodeData>[]);
      setEdges(nextState.edges);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex, setNodes, setEdges]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Z for undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Cmd/Ctrl + Shift + Z for redo
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        handleRedo();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleUndo, handleRedo]);

  // AI Auto-Organize
  const handleAutoOrganize = useCallback(async () => {
    if (nodes.length < 2) {
      alert('Add at least 2 nodes to organize');
      return;
    }

    saveToHistory();
    setIsOrganizing(true);
    setOrganizingStage('analyzing');
    setOrganizingProgress(0);

    try {
      // Stage 1: Analyze and cluster
      setOrganizingProgress(20);
      const foundClusters = await organizerService.current.analyzeAndCluster(nodes);

      setOrganizingStage('clustering');
      setOrganizingProgress(50);

      await new Promise(resolve => setTimeout(resolve, 800)); // Smooth transition

      // Stage 2: Organize layout
      setOrganizingStage('organizing');
      setOrganizingProgress(70);

      const organized = organizerService.current.organizeWithForceLayout(
        nodes,
        foundClusters,
        edges
      );

      setOrganizingProgress(90);

      // Stage 3: Apply changes with smooth animation
      setClusters(organized.clusters);

      // Update nodes with animation
      const nodesWithCallbacks = organized.nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          label: node.data.label || '',
          onLabelChange: handleNodeLabelChange,
        } as NodeData,
      })) as Node<NodeData>[];

      setNodes(nodesWithCallbacks);
      setOrganizingProgress(100);

      // Show complete stage
      setOrganizingStage('complete');
      await new Promise(resolve => setTimeout(resolve, 1500));

      setIsOrganizing(false);
    } catch (error) {
      console.error('Error organizing mindmap:', error);
      alert('Failed to organize mindmap. Please check your AI configuration.');
      setIsOrganizing(false);
    }
  }, [nodes, edges, setNodes, handleNodeLabelChange, saveToHistory]);

  // Handle cluster name change
  const handleClusterNameChange = useCallback((clusterId: string, newName: string) => {
    setClusters(prev =>
      prev.map(cluster =>
        cluster.id === clusterId ? { ...cluster, name: newName } : cluster
      )
    );
  }, []);

  const addNode = useCallback(() => {
    const newNode: Node<NodeData> = {
      id: nodeIdCounter.toString(),
      type: 'editable',
      data: {
        label: `Idea ${nodeIdCounter}`,
        background: 'var(--accent-primary)',
        color: '#121421',
        border: '1px solid #121421',
        onLabelChange: handleNodeLabelChange,
      },
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
    };

    setNodes((nds) => [...nds, newNode]);
    setNodeIdCounter((id) => id + 1);
    saveToHistory();

    // Auto-organize if enabled
    if (settings.mindmapAutoOrganizeOnAdd && nodes.length >= 3) {
      setTimeout(() => handleAutoOrganize(), 500);
    }
  }, [nodeIdCounter, setNodes, handleNodeLabelChange, saveToHistory, settings.mindmapAutoOrganizeOnAdd, nodes.length, handleAutoOrganize]);

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
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-[--color-text-black]">
              Mindmap Editor
            </h2>

            {/* Undo/Redo */}
            <div className="flex items-center gap-1 border-l pl-4">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Undo (Cmd+Z)"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Redo (Cmd+Shift+Z)"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* AI Auto-Organize Button */}
            <motion.button
              onClick={handleAutoOrganize}
              disabled={isOrganizing || nodes.length < 2}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[--color-primary-blue] to-[--color-primary-green] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              {/* Glowing effect */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 bg-white/20 rounded-lg blur-sm"
              />

              <Sparkles className="w-4 h-4 relative z-10" />
              <span className="text-sm font-medium relative z-10">Auto-Organize</span>
            </motion.button>

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
              nodeColor="var(--accent-primary)"
              maskColor="rgba(0, 0, 0, 0.1)"
            />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>

          {/* Cluster Labels Overlay */}
          {clusters.length > 0 && (
            <div className="absolute inset-0 pointer-events-none">
              {clusters.map(cluster => (
                <ClusterLabel
                  key={cluster.id}
                  clusterId={cluster.id}
                  name={cluster.name}
                  color={cluster.color}
                  position={cluster.position}
                  onNameChange={handleClusterNameChange}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <p>💡 <strong>Tip:</strong> Double-click nodes to edit. Drag nodes to move them. Click and drag between nodes to create connections.</p>
              {settings.mindmapAutoOrganizeOnAdd && (
                <p className="mt-1 text-xs text-[--color-primary-green]">✨ Auto-organize is enabled</p>
              )}
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

      {/* Organizing Modal */}
      <OrganizingModal
        isOpen={isOrganizing}
        stage={organizingStage}
        progress={organizingProgress}
        clustersFound={clusters.length}
      />
    </div>
  );
}
