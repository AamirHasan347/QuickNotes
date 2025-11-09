'use client';

import { useCallback, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  BackgroundVariant,
  EdgeMouseHandler,
} from '@xyflow/react';
import { X, Save, Trash2 } from 'lucide-react';
import { GeneratedMindmap } from '@/lib/ai/types';
import { useNotesStore } from '@/lib/store/useNotesStore';
import '@xyflow/react/dist/style.css';

interface MindmapViewerProps {
  mindmap: GeneratedMindmap;
  onClose: () => void;
  noteId?: string;
}

export function MindmapViewer({ mindmap, onClose, noteId }: MindmapViewerProps) {
  const { updateNote } = useNotesStore();
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);

  // Convert our mindmap format to ReactFlow format
  const initialNodes: Node[] = mindmap.nodes.map((node) => ({
    id: node.id,
    type: 'default',
    data: { label: node.label },
    position: node.position || { x: 0, y: 0 },
    style: {
      background: node.type === 'root' ? '#9333ea' : node.type === 'branch' ? '#3b82f6' : '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: '10px 15px',
      fontSize: '14px',
      fontWeight: node.type === 'root' ? 'bold' : 'normal',
    },
  }));

  const initialEdges: Edge[] = mindmap.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    animated: true,
    style: {
      stroke: '#9333ea',
      strokeWidth: 2,
    },
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Handle edge click to select it
  const onEdgeClick: EdgeMouseHandler = useCallback((event, edge) => {
    setSelectedEdge(edge.id);
  }, []);

  // Delete selected edge
  const deleteSelectedEdge = useCallback(() => {
    if (selectedEdge) {
      setEdges((eds) => eds.filter((e) => e.id !== selectedEdge));
      setSelectedEdge(null);
    }
  }, [selectedEdge, setEdges]);

  // Save mindmap to note
  const handleSave = useCallback(() => {
    if (!noteId) return;

    // Convert back to our mindmap format
    const updatedMindmap: GeneratedMindmap = {
      title: mindmap.title,
      nodes: nodes.map((node) => ({
        id: node.id,
        label: String(node.data.label),
        type: (node.style?.background === '#9333ea' ? 'root' :
               node.style?.background === '#3b82f6' ? 'branch' : 'leaf') as 'root' | 'branch' | 'leaf',
        position: node.position,
      })),
      edges: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
      })),
    };

    updateNote(noteId, { mindmapData: updatedMindmap });
    alert('Mindmap saved successfully!');
  }, [noteId, nodes, edges, mindmap.title, updateNote]);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{mindmap.title}</h2>
            <p className="text-sm text-gray-500">AI-Generated Mindmap • Click edges to select, then delete</p>
          </div>
          <div className="flex items-center gap-2">
            {selectedEdge && (
              <button
                onClick={deleteSelectedEdge}
                className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Arrow
              </button>
            )}
            {noteId && (
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Mindmap
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mindmap */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges.map((edge) => ({
              ...edge,
              style: {
                ...edge.style,
                stroke: edge.id === selectedEdge ? '#ef4444' : '#9333ea',
                strokeWidth: edge.id === selectedEdge ? 3 : 2,
              },
            }))}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onEdgeClick={onEdgeClick}
            fitView
            attributionPosition="bottom-left"
          >
            <Controls />
            <MiniMap />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-purple-600"></div>
                <span className="text-gray-600">Root</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-600"></div>
                <span className="text-gray-600">Branch</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-600"></div>
                <span className="text-gray-600">Leaf</span>
              </div>
            </div>
            <div className="text-gray-500">
              {mindmap.nodes.length} nodes • {mindmap.edges.length} connections
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
