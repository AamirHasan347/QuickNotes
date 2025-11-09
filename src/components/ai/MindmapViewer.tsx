'use client';

import { useCallback } from 'react';
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
} from '@xyflow/react';
import { X } from 'lucide-react';
import { GeneratedMindmap } from '@/lib/ai/types';
import '@xyflow/react/dist/style.css';

interface MindmapViewerProps {
  mindmap: GeneratedMindmap;
  onClose: () => void;
}

export function MindmapViewer({ mindmap, onClose }: MindmapViewerProps) {
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
    style: { stroke: '#9333ea', strokeWidth: 2 },
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{mindmap.title}</h2>
            <p className="text-sm text-gray-500">AI-Generated Mindmap</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mindmap */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
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
