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

export interface InlineImage {
  id: string;
  src: string;
  name: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
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

export interface FlowBlock {
  id: string;
  type: 'text' | 'image' | 'heading';
  content?: string;
  collapsed?: boolean;
  // Image-specific properties
  src?: string;
  name?: string;
  size?: 'small' | 'medium' | 'large' | 'full';
  alignment?: 'left' | 'center' | 'right' | 'float-left' | 'float-right';
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  workspaceId?: string; // Used when note is at workspace root (no folder)
  folderId?: string | null; // Used when note belongs to a specific folder
  // NOTE: A note should have EITHER workspaceId OR folderId, not both
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
  inlineImages?: InlineImage[]; // Draggable inline images with position/size/rotation
}

// Smart Workspace = Top-level organizational container
export interface SmartWorkspace {
  id: string;
  name: string;
  color: string;
  icon?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Folder = Can be a direct child of workspace OR a subfolder (3 levels max)
export interface Folder {
  id: string;
  name: string;
  workspaceId?: string; // Optional - which workspace this folder tree belongs to (for backwards compatibility)
  parentId?: string | null; // null = direct child of workspace, otherwise parent folder ID
  color?: string; // Optional color tag for visual organization
  isPinned?: boolean; // Pin important folders to the top
  order: number; // For custom ordering
  depth?: number; // 1 = workspace child, 2 = subfolder, 3 = sub-subfolder (max 3) - optional for backwards compatibility
  createdAt: Date;
  updatedAt: Date;
}

// OLD: Legacy Workspace interface (for backward compatibility during migration)
export interface Workspace {
  id: string;
  name: string;
  color: string;
  icon?: string;
  folderIds: string[]; // IDs of folders belonging to this workspace (many-to-many)
  createdAt: Date;
  updatedAt: Date;
}
