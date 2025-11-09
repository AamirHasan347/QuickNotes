'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotesStore } from '@/lib/store/useNotesStore';
import {
  X,
  ImagePlus,
  Pencil,
  Blocks as BlocksIcon,
  Save,
  MoreVertical,
} from 'lucide-react';
import {
  Note,
  NoteImage,
  AudioRecording,
  Drawing,
  Attachment,
  ContentBlock,
} from '@/lib/store/types';
import { VersionHistory } from './VersionHistory';
import { useImageDrop, ImageDropResult } from '@/hooks/useImageDrop';
import { VoiceRecorder } from '@/components/audio/VoiceRecorder';
import { AudioPlayer } from '@/components/audio/AudioPlayer';
import { useTextSelection } from '@/hooks/useTextSelection';
import { useAIActions } from '@/hooks/useAIActions';
import { AIToolbar } from '@/components/ai/AIToolbar';
import { MindmapViewer } from '@/components/ai/MindmapViewer';
import { InteractiveQuiz } from '@/components/ai/InteractiveQuiz';
import { GeneratedMindmap, Quiz } from '@/lib/ai/types';
import { useAutoSave } from '@/hooks/useAutoSave';
import { SaveIndicator } from './SaveIndicator';
import { AIActionBubble, AIActionType } from '@/components/ai/AIActionBubble';
import { AIResultPanel } from '@/components/ai/AIResultPanel';
import { SketchCanvas } from './SketchCanvas';
import { AttachmentDropzone } from './AttachmentDropzone';
import { NoteLinkInput } from './NoteLinkParser';
import { SmartBlocks } from './SmartBlocks';

interface EnhancedNoteEditorProps {
  note?: Note;
  isOpen: boolean;
  onClose: () => void;
}

export function EnhancedNoteEditor({ note, isOpen, onClose }: EnhancedNoteEditorProps) {
  const { addNote, updateNote, activeWorkspaceId } = useNotesStore();

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

  // AI state
  const contentAreaRef = useRef<HTMLDivElement>(null);
  const { selectedText, selectionPosition, clearSelection } = useTextSelection(contentAreaRef);
  const { isProcessing, currentSuggestion, processAction, clearSuggestion } = useAIActions();

  const [showMindmap, setShowMindmap] = useState(false);
  const [generatedMindmap, setGeneratedMindmap] = useState<GeneratedMindmap | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<Quiz | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // AI Result Panel
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiPanelTitle, setAIPanelTitle] = useState('');
  const [aiPanelContent, setAIPanelContent] = useState('');

  // Image drop handler
  const handleImageDrop = (image: ImageDropResult) => {
    const newImage: NoteImage = {
      id: image.id,
      src: image.src,
      type: image.type,
    };
    setImages((prev) => [...prev, newImage]);
  };

  const { isDragging, dragHandlers } = useImageDrop(handleImageDrop);

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

  const handleSave = () => {
    if (!title.trim() && !content.trim()) return;

    if (note) {
      updateNote(note.id, noteData);
    } else {
      addNote({
        ...noteData,
        isPinned: false,
        workspaceId: activeWorkspaceId || undefined,
      });
    }

    onClose();
  };

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

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {note ? 'Edit Note' : 'New Note'}
            </h2>

            <div className="flex items-center gap-2">
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

          {/* Content */}
          <div
            ref={contentAreaRef}
            {...dragHandlers}
            className="flex-1 overflow-y-auto p-6 space-y-6"
          >
            {/* Title Input */}
            <input
              type="text"
              placeholder="Note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-2xl font-bold text-gray-900 placeholder-gray-400 border-none outline-none"
            />

            {/* Content Area - Block Mode or Normal Mode */}
            {useBlockMode ? (
              <SmartBlocks blocks={blocks} onChange={setBlocks} />
            ) : (
              <NoteLinkInput value={content} onChange={setContent} />
            )}

            {/* Attachments */}
            <AttachmentDropzone
              attachments={attachments}
              onAddAttachment={(att) => setAttachments([...attachments, att])}
              onRemoveAttachment={(id) =>
                setAttachments(attachments.filter((a) => a.id !== id))
              }
            />

            {/* Drawings */}
            {drawings.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  Drawings ({drawings.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {drawings.map((drawing) => (
                    <motion.div
                      key={drawing.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group rounded-lg overflow-hidden border-2 border-gray-200"
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

            {/* Voice Recordings */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Voice Notes
              </h3>

              <VoiceRecorder
                onSave={(recording) => setAudioRecordings([...audioRecordings, recording])}
              />

              {audioRecordings.length > 0 && (
                <div className="space-y-2 mt-3">
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

            {/* AI Study Tools */}
            <AIToolbar
              onGenerateMindmap={async () => {
                setIsGeneratingAI(true);
                const response = await fetch('/api/ai/mindmap', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ title, content }),
                });
                const data = await response.json();
                if (data.mindmap) {
                  setGeneratedMindmap(data.mindmap);
                  setShowMindmap(true);
                }
                setIsGeneratingAI(false);
              }}
              onGenerateQuiz={async () => {
                setIsGeneratingAI(true);
                const response = await fetch('/api/ai/quiz', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ title, content }),
                });
                const data = await response.json();
                if (data.quiz) {
                  setGeneratedQuiz(data.quiz);
                  setShowQuiz(true);
                }
                setIsGeneratingAI(false);
              }}
              onSummarizeNote={async () => {
                await processAction('summarize', content);
                setAIPanelTitle('AI Summary');
                setAIPanelContent(currentSuggestion || '');
                setShowAIPanel(true);
              }}
              isProcessing={isGeneratingAI}
            />

            {/* Tags */}
            <div>
              <input
                type="text"
                placeholder="Add tags (press Enter)..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-purple-600 transition-colors"
              />
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map((tag) => (
                    <motion.span
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-2"
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

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {isSaving && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  Saving...
                </div>
              )}
              {lastSaved && !isSaving && (
                <div className="text-green-600">✓ Saved</div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {note ? 'Update' : 'Create'} Note
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* AI Action Bubble - appears on text selection */}
      <AIActionBubble
        isVisible={!!selectedText && !isProcessing}
        position={selectionPosition || { x: 0, y: 0 }}
        onAction={handleAIAction}
        onClose={clearSelection}
      />

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

      {/* Save Indicator */}
      <SaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
    </>
  );
}
