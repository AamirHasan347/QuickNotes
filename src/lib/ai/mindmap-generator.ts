/**
 * Mindmap Generator Service
 * Converts notes into structured mindmaps using LangChain
 */

import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { BaseAIService } from './base-service';
import { GeneratedMindmap, MindmapNode, MindmapEdge, AIProvider } from './types';
import { parseAIJson } from './utils';

export class MindmapGeneratorService extends BaseAIService {
  constructor(provider?: AIProvider) {
    super(provider);
  }

  /**
   * Generate a mindmap structure from note content
   */
  async generateMindmap(
    title: string,
    content: string
  ): Promise<GeneratedMindmap> {
    this.validateConfig();

    try {
      const llm = this.getLLM('mindmap');

      const mindmapPrompt = PromptTemplate.fromTemplate(`
You are an expert at creating hierarchical mindmaps from text content.

Given the following note, create a mindmap structure with:
- One root node (the main topic)
- 3-6 branch nodes (major subtopics)
- 2-4 leaf nodes per branch (supporting details)

Note Title: {title}
Note Content: {content}

Return the mindmap as a JSON object with this exact structure:
{{
  "title": "Main topic",
  "nodes": [
    {{"id": "root", "label": "Main Topic", "type": "root"}},
    {{"id": "branch-1", "label": "Subtopic 1", "type": "branch"}},
    {{"id": "leaf-1-1", "label": "Detail 1", "type": "leaf"}}
  ],
  "edges": [
    {{"id": "e-root-branch-1", "source": "root", "target": "branch-1"}},
    {{"id": "e-branch-1-leaf-1-1", "source": "branch-1", "target": "leaf-1-1"}}
  ]
}}

Important:
- Keep labels concise (max 5 words)
- Ensure all edge source/target IDs match node IDs
- Return only valid JSON

JSON response:
`);

      const chain = mindmapPrompt.pipe(llm).pipe(new StringOutputParser());

      const result = await chain.invoke({
        title: title || 'Untitled Note',
        content: content || '',
      });

      // Parse JSON response (handles markdown code blocks)
      const parsed = parseAIJson(result);

      // Calculate positions for nodes (radial layout)
      const nodesWithPositions = this.calculateNodePositions(parsed.nodes);

      return {
        title: parsed.title || title,
        nodes: nodesWithPositions,
        edges: parsed.edges || [],
      };
    } catch (error) {
      const aiError = this.handleError(error, 'generateMindmap');
      throw new Error(aiError.message);
    }
  }

  /**
   * Calculate node positions for React Flow
   * Uses a radial layout algorithm
   */
  private calculateNodePositions(nodes: MindmapNode[]): MindmapNode[] {
    const positioned: MindmapNode[] = [];
    const rootNode = nodes.find((n) => n.type === 'root');

    if (!rootNode) return nodes;

    // Position root at center
    positioned.push({
      ...rootNode,
      position: { x: 400, y: 300 },
    });

    // Get branches and position in circle around root
    const branchNodes = nodes.filter((n) => n.type === 'branch');
    const angleStep = (2 * Math.PI) / branchNodes.length;
    const branchRadius = 250;

    branchNodes.forEach((branch, index) => {
      const angle = index * angleStep;
      positioned.push({
        ...branch,
        position: {
          x: 400 + branchRadius * Math.cos(angle),
          y: 300 + branchRadius * Math.sin(angle),
        },
      });
    });

    // Position leaf nodes around their parent branches
    const leafNodes = nodes.filter((n) => n.type === 'leaf');
    const leafRadius = 150;

    leafNodes.forEach((leaf) => {
      // Find parent branch from node ID pattern
      const parentId = leaf.id.split('-').slice(0, 2).join('-');
      const parent = positioned.find((n) => n.id === parentId);

      if (parent && parent.position) {
        // Random angle for variety
        const randomAngle = Math.random() * 2 * Math.PI;
        positioned.push({
          ...leaf,
          position: {
            x: parent.position.x + leafRadius * Math.cos(randomAngle),
            y: parent.position.y + leafRadius * Math.sin(randomAngle),
          },
        });
      } else {
        // Fallback position
        positioned.push({
          ...leaf,
          position: {
            x: Math.random() * 800,
            y: Math.random() * 600,
          },
        });
      }
    });

    return positioned;
  }

  /**
   * Generate mindmap from multiple notes (combines content)
   */
  async generateFromMultipleNotes(
    notes: Array<{ title: string; content: string }>
  ): Promise<GeneratedMindmap> {
    const combinedTitle = notes.map((n) => n.title).join(', ');
    const combinedContent = notes
      .map((n) => `### ${n.title}\n${n.content}`)
      .join('\n\n');

    return this.generateMindmap(combinedTitle, combinedContent);
  }
}
