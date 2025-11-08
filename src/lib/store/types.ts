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
}

export interface Workspace {
  id: string;
  name: string;
  color: string;
  icon?: string;
}
