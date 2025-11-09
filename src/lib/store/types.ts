export interface NoteVersion {
  id: string;
  noteId: string;
  title: string;
  content: string;
  tags: string[];
  timestamp: Date;
}

export interface MindmapData {
  nodes: any[]; // React Flow nodes
  edges: any[]; // React Flow edges
}

export interface NoteImage {
  id: string;
  src: string;
  type: 'local' | 'external';
}

export interface AudioRecording {
  id: string;
  src: string;
  duration: number;
  createdAt: Date;
}

export interface Drawing {
  id: string;
  data: string; // Base64 encoded canvas image
  createdAt: Date;
}

export interface Attachment {
  id: string;
  type: 'image' | 'pdf' | 'video' | 'link';
  src: string;
  name?: string;
  meta?: {
    title?: string;
    summary?: string;
    thumbnail?: string;
    favicon?: string;
  };
  createdAt: Date;
}

export interface NoteLink {
  targetId: string;
  targetTitle: string;
}

export interface ContentBlock {
  id: string;
  type: 'text' | 'heading' | 'image' | 'attachment' | 'code' | 'checklist' | 'drawing';
  content: string;
  collapsed?: boolean;
  order: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  workspaceId?: string;
  createdAt: Date;
  updatedAt: Date;
  position?: number; // For drag-and-drop ordering
  mindmapData?: MindmapData; // Store mindmap structure for reopening
  images?: NoteImage[]; // Images dropped into the note
  audioRecordings?: AudioRecording[]; // Voice recordings
  drawings?: Drawing[]; // Handwriting/sketch data
  attachments?: Attachment[]; // PDFs, videos, links
  links?: NoteLink[]; // Wiki-style note links
  blocks?: ContentBlock[]; // Smart block structure
  useBlocks?: boolean; // Whether to render as blocks or plain content
}

export interface Workspace {
  id: string;
  name: string;
  color: string;
  icon?: string;
}
