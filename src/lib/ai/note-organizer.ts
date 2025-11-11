/**
 * Note Organizer Service
 * AI-powered note organization and workspace/folder suggestions
 */

import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { BaseAIService } from './base-service';
import { AIProvider } from './types';
import { parseAIJson } from './utils';
import { Note, SmartWorkspace, Folder } from '../store/types';

export interface OrganizationSuggestion {
  noteId: string;
  suggestedWorkspaceId?: string;
  suggestedFolderId?: string;
  suggestedNewWorkspace?: {
    name: string;
    icon: string;
    color: string;
    description: string;
  };
  suggestedNewFolder?: {
    name: string;
    parentId: string | null;
    workspaceId: string;
  };
  confidence: number; // 0-1 score
  reasoning: string; // Explanation for user
}

export interface BatchSuggestionResult {
  suggestions: OrganizationSuggestion[];
  totalAnalyzed: number;
  totalWithSuggestions: number;
}

export class NoteOrganizerService extends BaseAIService {
  constructor(provider?: AIProvider) {
    super(provider);
  }

  /**
   * Analyze a single note and suggest organization
   */
  async analyzeNote(
    note: Note,
    workspaces: SmartWorkspace[],
    folders: Folder[]
  ): Promise<OrganizationSuggestion> {
    this.validateConfig();

    try {
      const llm = this.getLLM('assistant');

      // Build context about existing workspaces and folders
      const workspaceContext = workspaces
        .map(
          (w) =>
            `- ${w.name} (${w.icon || '📁'}): ${w.description || 'No description'}`
        )
        .join('\n');

      const folderContext = folders
        .map((f) => {
          const workspace = workspaces.find((w) => w.id === f.workspaceId);
          return `- ${f.name} (in ${workspace?.name || 'Unknown'}${f.parentId ? ', subfolder' : ''})`;
        })
        .join('\n');

      const prompt = PromptTemplate.fromTemplate(`
You are an intelligent note organization assistant. Your task is to suggest the best location for a note based on its content.

**Note to Organize:**
Title: {title}
Content: {content}
Tags: {tags}

**Existing Workspaces:**
{workspaces}

**Existing Folders:**
{folders}

Analyze the note and suggest where it should be organized. You can:
1. Suggest an existing workspace (if it's a high-level topic)
2. Suggest an existing folder (most common)
3. Suggest creating a NEW workspace (only if topic doesn't fit any existing ones)
4. Suggest creating a NEW folder under an existing workspace

Return your suggestion as JSON with this structure:
{{
  "type": "existing_workspace" | "existing_folder" | "new_workspace" | "new_folder",
  "workspaceId": "workspace-id" (if type is existing_workspace or existing_folder),
  "folderId": "folder-id" (if type is existing_folder),
  "newWorkspace": {{
    "name": "Workspace Name",
    "icon": "🎯",
    "color": "#hexcolor",
    "description": "Brief description"
  }} (if type is new_workspace),
  "newFolder": {{
    "name": "Folder Name",
    "workspaceId": "parent-workspace-id",
    "parentId": null
  }} (if type is new_folder),
  "confidence": 0.85 (0-1 score),
  "reasoning": "Brief explanation of why this organization makes sense"
}}

Important:
- Be practical - prefer existing folders unless topic is truly new
- Only suggest new workspaces for major topic areas
- Confidence should reflect how well the note fits the suggestion
- Keep reasoning concise (1-2 sentences)

JSON response:
`);

      const chain = prompt.pipe(llm).pipe(new StringOutputParser());

      const result = await chain.invoke({
        title: note.title || 'Untitled',
        content: note.content.substring(0, 1000), // Limit content length
        tags: note.tags.join(', ') || 'None',
        workspaces: workspaceContext || 'No workspaces yet',
        folders: folderContext || 'No folders yet',
      });

      // Parse JSON response
      const parsed = parseAIJson(result);

      // Build suggestion object
      const suggestion: OrganizationSuggestion = {
        noteId: note.id,
        confidence: parsed.confidence || 0.5,
        reasoning: parsed.reasoning || 'AI suggested this organization.',
      };

      // Handle different suggestion types
      switch (parsed.type) {
        case 'existing_workspace':
          suggestion.suggestedWorkspaceId = parsed.workspaceId;
          break;

        case 'existing_folder':
          suggestion.suggestedFolderId = parsed.folderId;
          break;

        case 'new_workspace':
          suggestion.suggestedNewWorkspace = {
            name: parsed.newWorkspace?.name || 'New Workspace',
            icon: parsed.newWorkspace?.icon || '📁',
            color: parsed.newWorkspace?.color || '#63cdff',
            description: parsed.newWorkspace?.description || '',
          };
          break;

        case 'new_folder':
          suggestion.suggestedNewFolder = {
            name: parsed.newFolder?.name || 'New Folder',
            workspaceId: parsed.newFolder?.workspaceId || workspaces[0]?.id,
            parentId: parsed.newFolder?.parentId || null,
          };
          break;
      }

      return suggestion;
    } catch (error) {
      const aiError = this.handleError(error, 'analyzeNote');
      throw new Error(aiError.message);
    }
  }

  /**
   * Analyze multiple notes in batch
   */
  async analyzeBatch(
    notes: Note[],
    workspaces: SmartWorkspace[],
    folders: Folder[],
    onProgress?: (current: number, total: number) => void
  ): Promise<BatchSuggestionResult> {
    const suggestions: OrganizationSuggestion[] = [];
    let totalWithSuggestions = 0;

    for (let i = 0; i < notes.length; i++) {
      try {
        const suggestion = await this.analyzeNote(notes[i], workspaces, folders);

        // Only include suggestions with confidence > 0.5
        if (suggestion.confidence > 0.5) {
          suggestions.push(suggestion);
          totalWithSuggestions++;
        }

        // Report progress
        if (onProgress) {
          onProgress(i + 1, notes.length);
        }

        // Rate limiting: Wait 500ms between requests
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error analyzing note ${notes[i].id}:`, error);
        // Continue with next note
      }
    }

    return {
      suggestions,
      totalAnalyzed: notes.length,
      totalWithSuggestions,
    };
  }

  /**
   * Get unorganized notes (notes with no folderId)
   */
  getUnorganizedNotes(notes: Note[]): Note[] {
    return notes.filter((note) => !note.folderId || note.folderId === null);
  }

  /**
   * Quick heuristic-based suggestion (no AI call)
   * Used for instant suggestions based on tags and title keywords
   */
  quickSuggest(
    note: Note,
    workspaces: SmartWorkspace[],
    folders: Folder[]
  ): OrganizationSuggestion | null {
    // Simple keyword matching
    const text = `${note.title} ${note.content} ${note.tags.join(' ')}`.toLowerCase();

    // Try to match with existing folders
    for (const folder of folders) {
      const folderName = folder.name.toLowerCase();
      if (text.includes(folderName) || folderName.includes(text.split(' ')[0])) {
        return {
          noteId: note.id,
          suggestedFolderId: folder.id,
          confidence: 0.6,
          reasoning: `Note content matches "${folder.name}" folder.`,
        };
      }
    }

    // Try to match with workspaces
    for (const workspace of workspaces) {
      const workspaceName = workspace.name.toLowerCase();
      if (text.includes(workspaceName)) {
        // Find a folder in this workspace
        const workspaceFolder = folders.find((f) => f.workspaceId === workspace.id);
        if (workspaceFolder) {
          return {
            noteId: note.id,
            suggestedFolderId: workspaceFolder.id,
            confidence: 0.55,
            reasoning: `Note topic relates to ${workspace.name} workspace.`,
          };
        }
      }
    }

    return null;
  }
}
