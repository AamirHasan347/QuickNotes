/**
 * Mindmap Organizer Service
 * AI-powered automatic organization and clustering of mindmap nodes
 */

import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { BaseAIService, AIServiceOptions } from './base-service';
import { extractDeepSeekJSON } from '@/lib/utils/json-extractor';
import { Node, Edge } from '@xyflow/react';

export interface NodeCluster {
  id: string;
  name: string;
  description?: string;
  nodeIds: string[];
  color: string;
  position: { x: number; y: number };
}

export interface OrganizedMindmap {
  clusters: NodeCluster[];
  nodes: Node[];
  edges: Edge[];
  suggestedConnections?: Edge[];
}

export interface NodeRelationship {
  nodeId1: string;
  nodeId2: string;
  relationship: string;
  strength: number; // 0-1
}

export class MindmapOrganizerService extends BaseAIService {
  constructor(options?: AIServiceOptions) {
    super(options);
  }

  /**
   * Analyze nodes and identify clusters based on content similarity
   */
  async analyzeAndCluster(nodes: Node[]): Promise<NodeCluster[]> {
    this.validateConfig();

    try {
      const llm = this.getLLM('mindmap');

      // Prepare node data for AI analysis
      const nodeData = nodes.map(node => ({
        id: node.id,
        label: node.data.label || '',
      }));

      const clusterPrompt = PromptTemplate.fromTemplate(`
You are an expert at organizing and categorizing information into logical clusters.

Given these mindmap nodes, analyze their content and group them into 3-7 meaningful clusters based on:
- Topic similarity
- Semantic relationships
- Conceptual themes
- Subject matter

Nodes:
{nodes}

Return a JSON array of clusters with this structure:
[
  {{
    "id": "cluster-1",
    "name": "Cluster Name",
    "description": "Brief description of what this cluster represents",
    "nodeIds": ["node-id-1", "node-id-2"],
    "color": "#63cdff"
  }}
]

Guidelines:
- Create 3-7 clusters maximum
- Each cluster should have 2+ nodes (unless there's a clear outlier)
- Cluster names should be concise (2-4 words)
- Use these colors: #63cdff (blue), #8ef292 (green), #ff6b9d (pink), #ffd93d (yellow), #a78bfa (purple), #fb923c (orange)
- Ensure all node IDs match the provided nodes
- Return only valid JSON

JSON response:
`);

      const chain = clusterPrompt.pipe(llm).pipe(new StringOutputParser());

      const result = await chain.invoke({
        nodes: JSON.stringify(nodeData, null, 2),
      });

      // Debug logging
      console.log('\n🗺️  [MINDMAP ORGANIZER - Cluster] Raw AI Response:');
      console.log('📏 Response length:', result?.length || 0);
      console.log('🔍 Has <think> tags:', /<think>/.test(result || ''));

      let parsed;
      try {
        parsed = extractDeepSeekJSON(result);
        console.log('✅ [MINDMAP ORGANIZER - Cluster] JSON parsed successfully');
        console.log('📊 Clusters found:', parsed.length || 0);
      } catch (error) {
        console.error('❌ [MINDMAP ORGANIZER - Cluster] JSON parsing failed:', error);
        console.error('📛 Raw response:', result);
        throw new Error('AI returned malformed cluster data. Please try again.');
      }

      // Validate and add default positions
      return this.validateAndEnrichClusters(parsed, nodes);
    } catch (error) {
      const aiError = this.handleError(error, 'analyzeAndCluster');
      throw new Error(aiError.message);
    }
  }

  /**
   * Identify relationships between nodes
   */
  async identifyRelationships(nodes: Node[]): Promise<NodeRelationship[]> {
    this.validateConfig();

    try {
      const llm = this.getLLM('mindmap');

      const nodeData = nodes.map(node => ({
        id: node.id,
        label: node.data.label || '',
      }));

      const relationshipPrompt = PromptTemplate.fromTemplate(`
Analyze these mindmap nodes and identify semantic relationships between them.

Nodes:
{nodes}

Return a JSON array of relationships:
[
  {{
    "nodeId1": "node-id-1",
    "nodeId2": "node-id-2",
    "relationship": "causes|supports|relates to|precedes|includes",
    "strength": 0.8
  }}
]

Guidelines:
- Only suggest relationships with strength >= 0.5
- Limit to top 10-15 most significant relationships
- Relationship types: causes, supports, relates to, precedes, includes, contrasts
- Strength: 0-1 (0.5=weak, 0.7=moderate, 0.9=strong)
- Return only valid JSON

JSON response:
`);

      const chain = relationshipPrompt.pipe(llm).pipe(new StringOutputParser());

      const result = await chain.invoke({
        nodes: JSON.stringify(nodeData, null, 2),
      });

      // Debug logging
      console.log('\n🗺️  [MINDMAP ORGANIZER - Relationships] Raw AI Response:');
      console.log('📏 Response length:', result?.length || 0);
      console.log('🔍 Has <think> tags:', /<think>/.test(result || ''));

      try {
        const parsed = extractDeepSeekJSON(result);
        console.log('✅ [MINDMAP ORGANIZER - Relationships] JSON parsed successfully');
        console.log('📊 Relationships found:', parsed.length || 0);
        return parsed;
      } catch (error) {
        console.error('❌ [MINDMAP ORGANIZER - Relationships] JSON parsing failed:', error);
        console.error('📛 Raw response:', result);
        // Return empty array on error instead of throwing
        return [];
      }
    } catch (error) {
      console.error('Error identifying relationships:', error);
      return [];
    }
  }

  /**
   * Organize nodes using force-directed layout algorithm
   */
  organizeWithForceLayout(
    nodes: Node[],
    clusters: NodeCluster[],
    edges: Edge[]
  ): OrganizedMindmap {
    const organizedNodes = [...nodes];
    const clusterCenters = this.calculateClusterCenters(clusters.length);

    // Assign cluster positions
    clusters.forEach((cluster, index) => {
      cluster.position = clusterCenters[index];
    });

    // Position nodes within their clusters using force simulation
    clusters.forEach(cluster => {
      const clusterNodes = organizedNodes.filter(node =>
        cluster.nodeIds.includes(node.id)
      );

      // Calculate radius based on number of nodes
      const radius = Math.max(150, Math.sqrt(clusterNodes.length) * 80);
      const angleStep = (2 * Math.PI) / clusterNodes.length;

      clusterNodes.forEach((node, index) => {
        const angle = index * angleStep;
        const randomOffset = (Math.random() - 0.5) * 40; // Add slight randomness

        node.position = {
          x: cluster.position.x + radius * Math.cos(angle) + randomOffset,
          y: cluster.position.y + radius * Math.sin(angle) + randomOffset,
        };

        // Update node styling to match cluster
        node.data = {
          ...node.data,
          background: `${cluster.color}40`, // Semi-transparent
          border: `2px solid ${cluster.color}`,
        };
      });
    });

    return {
      clusters,
      nodes: organizedNodes,
      edges,
    };
  }

  /**
   * Calculate evenly distributed cluster centers on the canvas
   */
  private calculateClusterCenters(count: number): Array<{ x: number; y: number }> {
    const centers: Array<{ x: number; y: number }> = [];
    const canvasWidth = 1200;
    const canvasHeight = 800;
    const padding = 200;

    if (count === 1) {
      return [{ x: canvasWidth / 2, y: canvasHeight / 2 }];
    }

    // Use grid layout for multiple clusters
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    const cellWidth = (canvasWidth - 2 * padding) / cols;
    const cellHeight = (canvasHeight - 2 * padding) / rows;

    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      centers.push({
        x: padding + cellWidth * col + cellWidth / 2,
        y: padding + cellHeight * row + cellHeight / 2,
      });
    }

    return centers;
  }

  /**
   * Validate clusters and add default values
   */
  private validateAndEnrichClusters(
    clusters: NodeCluster[],
    nodes: Node[]
  ): NodeCluster[] {
    const validNodeIds = new Set(nodes.map(n => n.id));
    const defaultColors = ['#63cdff', '#8ef292', '#ff6b9d', '#ffd93d', '#a78bfa', '#fb923c'];

    return clusters
      .map((cluster, index) => ({
        ...cluster,
        id: cluster.id || `cluster-${index + 1}`,
        name: cluster.name || `Cluster ${index + 1}`,
        color: cluster.color || defaultColors[index % defaultColors.length],
        nodeIds: cluster.nodeIds.filter(id => validNodeIds.has(id)),
        position: cluster.position || { x: 0, y: 0 },
      }))
      .filter(cluster => cluster.nodeIds.length > 0);
  }

  /**
   * Suggest new connections based on clustering
   */
  async suggestConnections(
    nodes: Node[],
    clusters: NodeCluster[],
    existingEdges: Edge[]
  ): Promise<Edge[]> {
    const existingConnections = new Set(
      existingEdges.map(e => `${e.source}-${e.target}`)
    );

    const suggestedEdges: Edge[] = [];
    const relationships = await this.identifyRelationships(nodes);

    relationships.forEach((rel, index) => {
      const connectionKey = `${rel.nodeId1}-${rel.nodeId2}`;
      const reverseKey = `${rel.nodeId2}-${rel.nodeId1}`;

      if (!existingConnections.has(connectionKey) && !existingConnections.has(reverseKey)) {
        suggestedEdges.push({
          id: `suggested-${index}`,
          source: rel.nodeId1,
          target: rel.nodeId2,
          animated: true,
          style: { stroke: '#a78bfa', strokeWidth: 2, strokeDasharray: '5,5' },
          label: rel.relationship,
        });
      }
    });

    return suggestedEdges.slice(0, 10); // Limit suggestions
  }
}
