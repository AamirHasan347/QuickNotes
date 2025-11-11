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
import { AIToolbar } from '@/components/ai/AIToolbar';
import { MindmapViewer } from '@/components/ai/MindmapViewer';
import { InteractiveQuiz } from '@/components/ai/InteractiveQuiz';
import { GeneratedMindmap, Quiz } from '@/lib/ai/types';
import { useAutoSave } from '@/hooks/useAutoSave';
import { AIActionBubble, AIActionType } from '@/components/ai/AIActionBubble';
import { AIResultPanel } from '@/components/ai/AIResultPanel';
import { SketchCanvas } from './SketchCanvas';
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
  const [showSketchCanvas, setShowSketchCanvas] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [inlineImages, setInlineImages] = useState<InlineImage[]>([]);

  // AI state
  const contentAreaRef = useRef<HTMLDivElement | null>(null);
  const { selectedText, selectionPosition, clearSelection } = useTextSelection(contentAreaRef);
  const { isProcessing, currentSuggestion, processAction, clearSuggestion } = useAIActions();

  // Debug logging for AI state changes
  useEffect(() => {
    console.log('🎯 [EnhancedNoteEditor] Selected text changed:', selectedText);
    console.log('📍 [EnhancedNoteEditor] Selection position:', selectionPosition);
    console.log('⚙️ [EnhancedNoteEditor] Is processing:', isProcessing);
    console.log('👁️ [EnhancedNoteEditor] Bubble should be visible:', !!selectedText && !isProcessing);
  }, [selectedText, selectionPosition, isProcessing]);

  // Debug logging for contentAreaRef
  useEffect(() => {
    console.log('📦 [EnhancedNoteEditor] Content area ref:', contentAreaRef.current);
    if (contentAreaRef.current) {
      console.log('✅ [EnhancedNoteEditor] Content area ref is attached');
      console.log('📐 [EnhancedNoteEditor] Content area dimensions:', {
        width: contentAreaRef.current.offsetWidth,
        height: contentAreaRef.current.offsetHeight,
      });
    } else {
      console.log('❌ [EnhancedNoteEditor] Content area ref is NOT attached');
    }
  }, [contentAreaRef.current]);

  const [showMindmap, setShowMindmap] = useState(false);
  const [generatedMindmap, setGeneratedMindmap] = useState<GeneratedMindmap | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<Quiz | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // AI Result Panel
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiPanelTitle, setAIPanelTitle] = useState('');
  const [aiPanelContent, setAIPanelContent] = useState('');

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
      } else {
        // Other actions (summarize, explain)
        await processAction(action as any, selectedText);
        setAIPanelContent(currentSuggestion || 'Processing...');
      }
    } catch (error) {
      console.error('AI action error:', error);
      setAIPanelContent('An error occurred. Please try again.');
    }

    clearSelection();
  };

  const getActionTitle = (action: AIActionType): string => {
    const titles = {
      summarize: 'AI Summary',
      explain: 'AI Explanation',
      mindmap: 'Mind Map',
      quiz: 'Generated Quiz',
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
            className={`fixed inset-0 ${isFocusMode ? 'left-0' : 'left-0 md:left-64'} bg-white z-50 flex flex-col`}
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
                  className="bg-white rounded-2xl shadow-2xl p-12 border-4 border-dashed border-purple-500 pointer-events-none"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center">
                      <svg
                        className="w-10 h-10 text-purple-600"
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
                      <p className="text-xl font-semibold text-gray-900 mb-1">
                        Drop your files here
                      </p>
                      <p className="text-sm text-gray-600">
                        Supports images, PDFs, and videos
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Header */}
          <div className="flex items-center justify-between px-4 md:px-8 py-4 md:py-6 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-3">
              <h2 className="text-base md:text-lg font-semibold text-gray-900">
                {note ? 'Edit Note' : 'New Note'}
              </h2>
              {/* Autosave indicator */}
              {isSaving ? (
                <span className="hidden sm:flex items-center gap-2 text-sm text-blue-600">
                  <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              ) : lastSaved && (Date.now() - lastSaved.getTime() < 240000) ? (
                <span className="hidden sm:inline text-sm text-green-600">
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
                className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                title="Upload Files"
              >
                <Paperclip className="w-5 h-5 text-green-600" />
              </motion.button>

              {/* Sketch Mode Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSketchCanvas(true)}
                className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
                title="Sketch Mode"
              >
                <Pencil className="w-5 h-5 text-purple-600" />
              </motion.button>

              {/* Block Mode Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setUseBlockMode(!useBlockMode)}
                className={`p-2 rounded-lg transition-colors ${
                  useBlockMode ? 'bg-blue-100' : 'hover:bg-gray-100'
                }`}
                title="Toggle Block Mode"
              >
                <BlocksIcon
                  className={`w-5 h-5 ${useBlockMode ? 'text-blue-600' : 'text-gray-600'}`}
                />
              </motion.button>

              {note && <VersionHistory noteId={note.id} />}

              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content - No scroll on main container */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 flex">
              {/* Left side - Title and Content */}
              <div className="flex-1 flex flex-col px-4 md:px-8 py-6 md:py-8 overflow-hidden">
                {/* Title Input */}
                <input
                  type="text"
                  placeholder="Note title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-2xl md:text-3xl font-bold text-gray-900 placeholder-gray-400 border-none outline-none bg-transparent mb-6"
                />

                {/* Content Area */}
                <div
                  ref={contentAreaRef}
                  className="flex-1 overflow-y-auto relative"
                  style={{ userSelect: 'text' }}
                  data-selection-container="true"
                >
                  {/* Text content with wrapping around images */}
                  <TextWithImageWrap images={inlineImages}>
                    {useBlockMode ? (
                      <SmartBlocks blocks={blocks} onChange={setBlocks} />
                    ) : (
                      <NoteLinkInput value={content} onChange={setContent} />
                    )}
                  </TextWithImageWrap>

                  {/* Inline Draggable Images - Float on top */}
                  {inlineImages.map((image) => (
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
                            className="w-full h-40 object-cover"
                          />
                          <button
                            onClick={() => setDrawings(drawings.filter((d) => d.id !== drawing.id))}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Fixed Bottom Panel - Voice and Tags only */}
          <div className={`fixed bottom-4 right-4 ${isFocusMode ? 'left-4' : 'left-4 md:left-[17rem]'} bg-white border border-gray-200 rounded-2xl shadow-xl overflow-y-auto max-h-48 z-[5]`}>
            <div className="px-6 py-4 space-y-4">
              {/* Voice Recordings */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
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
                <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Tags
                </h3>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add tags (press Enter)..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                  />
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {tags.map((tag) => (
                        <motion.span
                          key={tag}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="px-2 py-1 bg-green-50 text-gray-900 rounded-full text-xs font-medium flex items-center gap-1"
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

      {/* Sketch Canvas Modal */}
      <SketchCanvas
        isOpen={showSketchCanvas}
        onClose={() => setShowSketchCanvas(false)}
        onSave={(drawing) => setDrawings([...drawings, drawing])}
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
    </>
  );
}
