'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotesStore } from '@/lib/store/useNotesStore';
import {
  X,
  Pencil,
  Blocks as BlocksIcon,
  Paperclip,
  FileText,
  Image as ImageIcon,
  Video,
} from 'lucide-react';
import {
  Note,
  NoteImage,
  AudioRecording,
  Drawing,
  Attachment,
  ContentBlock,
  InlineImage,
} from '@/lib/store/types';
import { VersionHistory } from './VersionHistory';
import { VoiceRecorder } from '@/components/audio/VoiceRecorder';
import { AudioPlayer } from '@/components/audio/AudioPlayer';
import { useTextSelection } from '@/hooks/useTextSelection';
import { useAIActions } from '@/hooks/useAIActions';
import { useInfiniteCanvas } from '@/hooks/useInfiniteCanvas';
import { AIToolbar } from '@/components/ai/AIToolbar';
import { MindmapViewer } from '@/components/ai/MindmapViewer';
import { InteractiveQuiz } from '@/components/ai/InteractiveQuiz';
import { FlashcardViewer } from '@/components/ai/FlashcardViewer';
import { GeneratedMindmap, Quiz, FlashcardSet } from '@/lib/ai/types';
import { useAutoSave } from '@/hooks/useAutoSave';
import { AIActionBubble, AIActionType } from '@/components/ai/AIActionBubble';
import { AIResultPanel } from '@/components/ai/AIResultPanel';
import InlineSketchCanvas from './InlineSketchCanvas';
import QuickSketchToolbar from './QuickSketchToolbar';
import { NoteLinkInput } from './NoteLinkParser';
import { SmartBlocks } from './SmartBlocks';
import { AttachmentDropzone } from './AttachmentDropzone';
import { DraggableImage } from './DraggableImage';
import { TextWithImageWrap } from './TextWithImageWrap';

interface EnhancedNoteEditorProps {
  note?: Note;
  isOpen: boolean;
  onClose: () => void;
  isFocusMode?: boolean;
}

export function EnhancedNoteEditor({ note, isOpen, onClose, isFocusMode = false }: EnhancedNoteEditorProps) {
  const { updateNote } = useNotesStore();

  // Basic note data
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [images, setImages] = useState<NoteImage[]>([]);
  const [audioRecordings, setAudioRecordings] = useState<AudioRecording[]>([]);

  // Enhanced features state
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [useBlockMode, setUseBlockMode] = useState(false);
  const [useSketchMode, setUseSketchMode] = useState(false);
  const [currentSketchDrawing, setCurrentSketchDrawing] = useState<Drawing | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [inlineImages, setInlineImages] = useState<InlineImage[]>([]);

  // AI state
  const contentAreaRef = useRef<HTMLDivElement | null>(null);
  const { selectedText, selectionPosition, clearSelection } = useTextSelection(contentAreaRef);
  const { isProcessing, currentSuggestion, processAction, clearSuggestion } = useAIActions();

  const [showMindmap, setShowMindmap] = useState(false);
  const [generatedMindmap, setGeneratedMindmap] = useState<GeneratedMindmap | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<Quiz | null>(null);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [generatedFlashcards, setGeneratedFlashcards] = useState<FlashcardSet | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // AI Result Panel
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiPanelTitle, setAIPanelTitle] = useState('');
  const [aiPanelContent, setAIPanelContent] = useState('');

  // Sketch Mode Hook (using infinite canvas)
  const sketchHook = useInfiniteCanvas({
    initialStrokes: currentSketchDrawing?.strokes || [],
  });

  // Auto-save drawing when strokes change
  const lastStrokeCountRef = useRef(0);
  useEffect(() => {
    if (useSketchMode && sketchHook.strokeCount > 0 && sketchHook.strokeCount !== lastStrokeCountRef.current) {
      lastStrokeCountRef.current = sketchHook.strokeCount;

      const strokes = sketchHook.getStrokes();
      const pngData = sketchHook.exportAsPNG();

      if (!currentSketchDrawing) {
        // Create new drawing
        const newDrawing: Drawing = {
          id: `drawing-${Date.now()}`,
          data: pngData,
          strokes: strokes,
          canvasWidth: sketchHook.viewport.width,
          canvasHeight: sketchHook.viewport.height,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setCurrentSketchDrawing(newDrawing);
        setDrawings([...drawings, newDrawing]);
      } else {
        // Update existing drawing
        const updatedDrawing: Drawing = {
          ...currentSketchDrawing,
          data: pngData,
          strokes: strokes,
          updatedAt: new Date(),
        };
        setCurrentSketchDrawing(updatedDrawing);
        setDrawings(drawings.map((d) => (d.id === updatedDrawing.id ? updatedDrawing : d)));
      }
    }
  }, [sketchHook.strokeCount, useSketchMode, currentSketchDrawing, drawings, sketchHook]);

  // Load note data
  useEffect(() => {
    if (isOpen) {
      if (note) {
        setTitle(note.title);
        setContent(note.content);
        setTags(note.tags);
        setImages(note.images || []);
        setAudioRecordings(note.audioRecordings || []);
        setDrawings(note.drawings || []);
        setAttachments(note.attachments || []);
        setBlocks(note.blocks || []);
        setUseBlockMode(note.useBlocks || false);
        setInlineImages(note.inlineImages || []);
      } else {
        // Reset for new note
        setTitle('');
        setContent('');
        setTags([]);
        setImages([]);
        setAudioRecordings([]);
        setDrawings([]);
        setAttachments([]);
        setBlocks([]);
        setUseBlockMode(false);
        setInlineImages([]);
      }
      setTagInput('');
      clearSuggestion();
    }
  }, [note, isOpen, clearSuggestion]);

  // Auto-save
  const noteData = {
    title,
    content,
    tags,
    images,
    audioRecordings,
    drawings,
    attachments,
    blocks,
    useBlocks: useBlockMode,
    inlineImages,
  };

  const { isSaving, lastSaved } = useAutoSave(
    noteData,
    (data) => {
      if (note && (title.trim() || content.trim())) {
        updateNote(note.id, data);
      }
    },
    1000
  );

  // AI Actions
  const handleAIAction = async (action: AIActionType) => {
    if (!selectedText) return;

    setAIPanelTitle(getActionTitle(action));
    setShowAIPanel(true);
    setAIPanelContent('');

    try {
      if (action === 'mindmap') {
        // Generate mindmap
        setIsGeneratingAI(true);
        const response = await fetch('/api/ai/mindmap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Selected Text',
            content: selectedText,
          }),
        });

        const data = await response.json();
        if (data.mindmap) {
          setGeneratedMindmap(data.mindmap);
          setShowMindmap(true);
          setShowAIPanel(false);
        }
        setIsGeneratingAI(false);
      } else if (action === 'quiz') {
        // Generate quiz
        setIsGeneratingAI(true);
        const response = await fetch('/api/ai/quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Selected Text Quiz',
            content: selectedText,
          }),
        });

        const data = await response.json();
        if (data.quiz) {
          setGeneratedQuiz(data.quiz);
          setShowQuiz(true);
          setShowAIPanel(false);
        }
        setIsGeneratingAI(false);
      } else if (action === 'flashcards') {
        // Generate flashcards
        setIsGeneratingAI(true);

        const response = await fetch('/api/ai/flashcards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Selected Text',
            content: selectedText,
            count: 8,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate flashcards');
        }

        const data = await response.json();

        if (data && data.flashcards && data.flashcards.length > 0) {
          setGeneratedFlashcards(data);
          setShowFlashcards(true);
          setShowAIPanel(false);
        } else {
          throw new Error('No flashcards generated from the response');
        }
        setIsGeneratingAI(false);
      } else {
        // Other actions (summarize, explain)
        await processAction(action as any, selectedText);
        setAIPanelContent(currentSuggestion || 'Processing...');
      }
    } catch (error) {
      console.error('AI action error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setAIPanelContent(`Error: ${errorMessage}`);
      setShowAIPanel(true);
      setIsGeneratingAI(false);
    } finally {
      clearSelection();
    }
  };

  const getActionTitle = (action: AIActionType): string => {
    const titles: Record<AIActionType, string> = {
      summarize: 'AI Summary',
      explain: 'AI Explanation',
      mindmap: 'Mind Map',
      quiz: 'Generated Quiz',
      flashcards: 'Study Flashcards',
      improve: 'Improved Text',
    };
    return titles[action];
  };

  // Tag management
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if dragging files
    if (e.dataTransfer.types.includes('Files')) {
      setIsDraggingFile(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Only hide if leaving the editor completely
    if (e.currentTarget === e.target) {
      setIsDraggingFile(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);

    const files = Array.from(e.dataTransfer.files);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const isImage = file.type.startsWith('image/');
        const isPdf = file.type === 'application/pdf';
        const isVideo = file.type.startsWith('video/');

        if (isImage) {
          // Add as draggable inline image
          const newImage = {
            id: `image-${Date.now()}-${Math.random()}`,
            src: result,
            name: file.name,
            position: { x: 100, y: 100 }, // Default position
            size: { width: 300, height: 200 }, // Default size
            rotation: 0,
          };
          setInlineImages((prev) => [...prev, newImage]);
        } else {
          // Add to attachments (PDFs, videos)
          const attachment: Attachment = {
            id: `attachment-${Date.now()}-${Math.random()}`,
            type: isPdf ? 'pdf' : isVideo ? 'video' : 'image',
            src: result,
            name: file.name,
            createdAt: new Date(),
          };

          if (isPdf) {
            attachment.meta = {
              title: file.name,
              summary: 'PDF document',
            };
          }

          handleAddAttachment(attachment);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Manual file upload
  const handleManualUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,application/pdf,video/*';
    input.multiple = true;
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);

      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const isImage = file.type.startsWith('image/');
          const isPdf = file.type === 'application/pdf';
          const isVideo = file.type.startsWith('video/');

          if (isImage) {
            const newImage = {
              id: `image-${Date.now()}-${Math.random()}`,
              src: result,
              name: file.name,
              position: { x: 100, y: 100 },
              size: { width: 300, height: 200 },
              rotation: 0,
            };
            setInlineImages((prev) => [...prev, newImage]);
          } else {
            const attachment: Attachment = {
              id: `attachment-${Date.now()}-${Math.random()}`,
              type: isPdf ? 'pdf' : isVideo ? 'video' : 'image',
              src: result,
              name: file.name,
              createdAt: new Date(),
            };

            if (isPdf) {
              attachment.meta = {
                title: file.name,
                summary: 'PDF document',
              };
            }

            handleAddAttachment(attachment);
          }
        };
        reader.readAsDataURL(file);
      });
    };
    input.click();
  };

  // Inline image handlers
  const handleImageUpdate = (id: string, updates: Partial<{
    position: { x: number; y: number };
    size: { width: number; height: number };
    rotation: number;
  }>) => {
    setInlineImages((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, ...updates } : img
      )
    );
  };

  const handleImageRemove = (id: string) => {
    setInlineImages((prev) => prev.filter((img) => img.id !== id));
  };

  // Attachment handlers
  const handleAddAttachment = (attachment: Attachment) => {
    setAttachments([...attachments, attachment]);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter((a) => a.id !== id));
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`fixed inset-0 ${isFocusMode ? 'left-0' : 'left-0 md:left-64'} z-50 flex flex-col`}
            style={{ backgroundColor: 'var(--bg-secondary)' }}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
          {/* Dropzone Overlay - Show when dragging files */}
          <AnimatePresence>
            {isDraggingFile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-purple-500/20 backdrop-blur-sm flex items-center justify-center pointer-events-none"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="rounded-2xl shadow-2xl p-12 border-4 border-dashed pointer-events-none"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: '#63cdff'
                  }}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(99, 205, 255, 0.1)' }}>
                      <svg
                        className="w-10 h-10"
                        style={{ color: '#63cdff' }}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                        Drop your files here
                      </p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Supports images, PDFs, and videos
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Header */}
          <div className="flex items-center justify-between px-4 md:px-8 py-4 md:py-6" style={{
            backgroundColor: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-primary)'
          }}>
            <div className="flex items-center gap-3">
              <h2 className="text-base md:text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {note ? 'Edit Note' : 'New Note'}
              </h2>
              {/* Autosave indicator */}
              {isSaving ? (
                <span className="hidden sm:flex items-center gap-2 text-sm" style={{ color: '#63cdff' }}>
                  <div className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#63cdff', borderTopColor: 'transparent' }} />
                  Saving...
                </span>
              ) : lastSaved && (Date.now() - lastSaved.getTime() < 240000) ? (
                <span className="hidden sm:inline text-sm" style={{ color: '#8ef292' }}>
                  ✓ Autosaved
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              {/* Upload Files Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleManualUpload}
                className="p-2 rounded-lg transition-colors"
                style={{ color: '#8ef292' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(142, 242, 146, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                title="Upload Files"
              >
                <Paperclip className="w-5 h-5" />
              </motion.button>

              {/* Sketch Mode Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  // When toggling sketch mode, disable block mode
                  if (!useSketchMode) {
                    setUseBlockMode(false);
                  }
                  setUseSketchMode(!useSketchMode);
                }}
                className="p-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: useSketchMode ? 'rgba(142, 242, 146, 0.1)' : 'transparent',
                  color: useSketchMode ? '#8ef292' : 'var(--text-secondary)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = useSketchMode ? 'rgba(142, 242, 146, 0.2)' : 'var(--bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = useSketchMode ? 'rgba(142, 242, 146, 0.1)' : 'transparent'}
                title="Toggle Sketch Mode"
              >
                <Pencil className="w-5 h-5" />
              </motion.button>

              {/* Block Mode Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  // When toggling block mode, disable sketch mode
                  if (!useBlockMode) {
                    setUseSketchMode(false);
                  }
                  setUseBlockMode(!useBlockMode);
                }}
                className="p-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: useBlockMode ? 'rgba(99, 205, 255, 0.1)' : 'transparent',
                  color: useBlockMode ? '#63cdff' : 'var(--text-secondary)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = useBlockMode ? 'rgba(99, 205, 255, 0.2)' : 'var(--bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = useBlockMode ? 'rgba(99, 205, 255, 0.1)' : 'transparent'}
                title="Toggle Block Mode"
              >
                <BlocksIcon className="w-5 h-5" />
              </motion.button>

              {note && <VersionHistory noteId={note.id} />}

              <button
                onClick={onClose}
                className="p-2 rounded-lg transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Sketch Mode Toolbar */}
          {useSketchMode && (
            <QuickSketchToolbar
              currentTool={sketchHook.state.tool}
              currentColor={sketchHook.state.color}
              currentWidth={sketchHook.state.width}
              onToolChange={sketchHook.setTool}
              onColorChange={sketchHook.setColor}
              onWidthChange={sketchHook.setWidth}
              onClearAll={() => {
                if (window.confirm('Are you sure you want to clear the canvas?')) {
                  sketchHook.clearAll();
                }
              }}
              onUndo={sketchHook.undo}
              onRedo={sketchHook.redo}
              canUndo={sketchHook.canUndo}
              canRedo={sketchHook.canRedo}
            />
          )}

          {/* Content - No scroll on main container */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 flex">
              {/* Left side - Title and Content */}
              <div className="flex-1 flex flex-col px-4 md:px-8 py-6 md:py-8 overflow-hidden">
                {/* Title Input (hide in sketch mode) */}
                {!useSketchMode && (
                  <input
                    type="text"
                    placeholder="Note title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-2xl md:text-3xl font-bold border-none outline-none bg-transparent mb-6"
                    style={{
                      color: 'var(--text-primary)',
                      caretColor: 'var(--text-primary)'
                    }}
                  />
                )}

                {/* Content Area */}
                <div
                  ref={contentAreaRef}
                  className="flex-1 overflow-y-auto relative"
                  style={{ userSelect: 'text' }}
                  data-selection-container="true"
                >
                  {useSketchMode ? (
                    <InlineSketchCanvas
                      currentDrawing={currentSketchDrawing}
                      canvasHook={sketchHook}
                      onUpdate={(drawing) => {
                        setCurrentSketchDrawing(drawing);
                        // Auto-add to drawings list if it's new
                        if (!drawings.find((d) => d.id === drawing.id)) {
                          setDrawings([...drawings, drawing]);
                        } else {
                          // Update existing drawing
                          setDrawings(drawings.map((d) => (d.id === drawing.id ? drawing : d)));
                        }
                      }}
                    />
                  ) : (
                    <>
                      {/* Text content with wrapping around images */}
                      <TextWithImageWrap images={inlineImages}>
                        {useBlockMode ? (
                          <SmartBlocks blocks={blocks} onChange={setBlocks} />
                        ) : (
                          <NoteLinkInput value={content} onChange={setContent} />
                        )}
                      </TextWithImageWrap>
                    </>
                  )}

                  {/* Inline Draggable Images - Float on top (not in sketch mode) */}
                  {!useSketchMode && inlineImages.map((image) => (
                    <DraggableImage
                      key={image.id}
                      id={image.id}
                      src={image.src}
                      name={image.name}
                      position={image.position}
                      size={image.size}
                      rotation={image.rotation}
                      onUpdate={handleImageUpdate}
                      onRemove={handleImageRemove}
                    />
                  ))}
                </div>

                {/* Attachments Dropzone */}
                <div className="mt-4 relative z-10">
                  <AttachmentDropzone
                    attachments={attachments}
                    onAddAttachment={handleAddAttachment}
                    onRemoveAttachment={handleRemoveAttachment}
                  />
                </div>

                {/* Legacy Attachments Display - Keep for backwards compatibility */}
                {false && attachments.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 pt-4 border-t border-gray-200"
                  >
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">
                      Files ({attachments.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {attachments.map((attachment) => (
                        <motion.div
                          key={attachment.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              attachment.type === 'pdf' ? 'bg-red-100' : 'bg-green-100'
                            }`}>
                              {attachment.type === 'pdf' ? (
                                <FileText className="w-5 h-5 text-red-600" />
                              ) : (
                                <Video className="w-5 h-5 text-green-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {attachment.name || 'Untitled'}
                              </p>
                              {attachment.meta?.summary && (
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                  {attachment.meta.summary}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => setAttachments(attachments.filter((a) => a.id !== attachment.id))}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Drawings */}
                {drawings.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 pt-4 border-t border-gray-200"
                  >
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">
                      Drawings ({drawings.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {drawings.map((drawing) => (
                        <motion.div
                          key={drawing.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative group rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={drawing.data}
                            alt="Drawing"
                            className={`w-full h-40 object-cover ${
                              drawing.strokes ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''
                            }`}
                            onClick={() => {
                              if (drawing.strokes) {
                                setCurrentSketchDrawing(drawing);
                                setUseBlockMode(false);
                                setUseSketchMode(true);
                              }
                            }}
                            title={drawing.strokes ? 'Click to edit' : 'Drawing'}
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDrawings(drawings.filter((d) => d.id !== drawing.id));
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          {drawing.strokes && (
                            <div className="absolute bottom-2 left-2 px-2 py-1 bg-purple-600 text-white text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                              <Pencil className="w-3 h-3" />
                              Edit
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Fixed Bottom Panel - Voice and Tags only */}
          <div className={`fixed bottom-4 right-4 ${isFocusMode ? 'left-4' : 'left-4 md:left-[17rem]'} rounded-2xl shadow-xl overflow-y-auto max-h-48 z-[5]`}
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)'
            }}
          >
            <div className="px-6 py-4 space-y-4">
              {/* Voice Recordings */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                    Voice Notes
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <VoiceRecorder
                    onSave={(recording) => setAudioRecordings([...audioRecordings, recording])}
                  />
                  {audioRecordings.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {audioRecordings.map((recording) => (
                        <AudioPlayer
                          key={recording.id}
                          recording={recording}
                          onDelete={() =>
                            setAudioRecordings(
                              audioRecordings.filter((r) => r.id !== recording.id)
                            )
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                  Tags
                </h3>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add tags (press Enter)..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    className="flex-1 px-3 py-2 text-sm rounded-lg outline-none focus:border-[#63cdff] focus:ring-2 transition-all"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-primary)',
                      caretColor: 'var(--text-primary)'
                    }}
                  />
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {tags.map((tag) => (
                        <motion.span
                          key={tag}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                          style={{
                            backgroundColor: '#e4f6e5',
                            color: '#121421'
                          }}
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="hover:text-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </motion.span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* AI Action Bubble - appears on text selection */}
          {isOpen && (
            <AIActionBubble
              isVisible={!!selectedText && !isProcessing}
              position={selectionPosition || { x: 0, y: 0 }}
              onAction={handleAIAction}
              onClose={clearSelection}
            />
          )}

          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Result Panel */}
      <AIResultPanel
        isOpen={showAIPanel}
        title={aiPanelTitle}
        content={aiPanelContent}
        onClose={() => setShowAIPanel(false)}
        onInsert={() => {
          setContent(content + '\n\n' + aiPanelContent);
        }}
      />

      {/* Mindmap Viewer */}
      {showMindmap && generatedMindmap && (
        <MindmapViewer
          mindmap={generatedMindmap}
          noteId={note?.id}
          onClose={() => {
            setShowMindmap(false);
            setGeneratedMindmap(null);
          }}
        />
      )}

      {/* Interactive Quiz */}
      {showQuiz && generatedQuiz && (
        <InteractiveQuiz
          quiz={generatedQuiz}
          onClose={() => {
            setShowQuiz(false);
            setGeneratedQuiz(null);
          }}
          onRegenerate={async () => {
            const response = await fetch('/api/ai/quiz', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title, content }),
            });
            const data = await response.json();
            if (data.quiz) {
              setGeneratedQuiz(data.quiz);
            }
          }}
        />
      )}

      {/* Flashcard Viewer */}
      {showFlashcards && generatedFlashcards && (
        <FlashcardViewer
          flashcardSet={generatedFlashcards}
          onClose={() => {
            setShowFlashcards(false);
            setGeneratedFlashcards(null);
          }}
          onRegenerate={async () => {
            const response = await fetch('/api/ai/flashcards', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title, content, count: 8 }),
            });
            const data = await response.json();
            if (data && data.flashcards && data.flashcards.length > 0) {
              setGeneratedFlashcards(data);
            }
          }}
        />
      )}
    </>
  );
}
