'use client';

import { useState, useEffect, useRef } from 'react';
import { useNotesStore } from '@/lib/store/useNotesStore';
import { useSettingsStore } from '@/lib/store/useSettingsStore';
import { X, ImagePlus, Save, CheckCircle2 } from 'lucide-react';
import { Note, NoteImage, AudioRecording } from '@/lib/store/types';
import { VersionHistory } from './VersionHistory';
import { useImageDrop, ImageDropResult } from '@/hooks/useImageDrop';
import { VoiceRecorder } from '@/components/audio/VoiceRecorder';
import { AudioPlayer } from '@/components/audio/AudioPlayer';
import { useTextSelection } from '@/hooks/useTextSelection';
import { useAIActions } from '@/hooks/useAIActions';
import { FloatingAIToolbar, AIAction } from '@/components/ai/FloatingAIToolbar';
import { AIInlineSuggestion } from '@/components/ai/AIInlineSuggestion';
import { AIPassiveHint } from '@/components/ai/AIPassiveHint';
import { AIToolbar } from '@/components/ai/AIToolbar';
import { MindmapViewer } from '@/components/ai/MindmapViewer';
import { InteractiveQuiz } from '@/components/ai/InteractiveQuiz';
import { FlashcardViewer } from '@/components/ai/FlashcardViewer';
import { GeneratedMindmap, Quiz, FlashcardSet } from '@/lib/ai/types';

interface NoteEditorProps {
  note?: Note;
  isOpen: boolean;
  onClose: () => void;
}

export function NoteEditor({ note, isOpen, onClose }: NoteEditorProps) {
  const { addNote, updateNote, activeWorkspaceId } = useNotesStore();
  const { settings } = useSettingsStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [images, setImages] = useState<NoteImage[]>([]);
  const [audioRecordings, setAudioRecordings] = useState<AudioRecording[]>([]);

  // AI Integration
  const contentAreaRef = useRef<HTMLDivElement>(null);
  const { selectedText, selectionPosition, clearSelection } = useTextSelection(contentAreaRef);
  const { isProcessing, currentSuggestion, processAction, clearSuggestion } = useAIActions();

  const [showPassiveHint, setShowPassiveHint] = useState(false);
  const [passiveHintType, setPassiveHintType] = useState<'summarize' | 'expand' | 'improve'>('summarize');

  // AI Viewers state
  const [showMindmap, setShowMindmap] = useState(false);
  const [generatedMindmap, setGeneratedMindmap] = useState<GeneratedMindmap | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<Quiz | null>(null);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [generatedFlashcards, setGeneratedFlashcards] = useState<FlashcardSet | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Handle image drops
  const handleImageDrop = (image: ImageDropResult) => {
    const newImage: NoteImage = {
      id: image.id,
      src: image.src,
      type: image.type,
    };
    setImages((prev) => [...prev, newImage]);
  };

  const { isDragging, dragHandlers } = useImageDrop(handleImageDrop);

  useEffect(() => {
    if (isOpen) {
      if (note) {
        setTitle(note.title);
        setContent(note.content);
        setTags(note.tags);
        setImages(note.images || []);
        setAudioRecordings(note.audioRecordings || []);
      } else {
        setTitle('');
        setContent('');
        setTags([]);
        setImages([]);
        setAudioRecordings([]);
      }
      setTagInput('');
      setShowPassiveHint(false);
      setHasUnsavedChanges(false);
      setLastSaved(null);
      clearSuggestion();
    }
  }, [note, isOpen, clearSuggestion]);

  // Track unsaved changes
  useEffect(() => {
    if (note && isOpen) {
      const hasChanges =
        title !== note.title ||
        content !== note.content ||
        JSON.stringify(tags) !== JSON.stringify(note.tags) ||
        JSON.stringify(images) !== JSON.stringify(note.images || []) ||
        JSON.stringify(audioRecordings) !== JSON.stringify(note.audioRecordings || []);

      setHasUnsavedChanges(hasChanges);
    }
  }, [title, content, tags, images, audioRecordings, note, isOpen]);

  // Auto-save functionality
  useEffect(() => {
    if (!settings.autoSave) {
      return;
    }

    if (!note) {
      return;
    }

    if (!hasUnsavedChanges) {
      return;
    }

    if (!title.trim() && !content.trim()) {
      return;
    }

    const timer = setTimeout(() => {
      updateNote(note.id, {
        title,
        content,
        tags,
        images,
        audioRecordings,
      });
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    }, settings.autoSaveDelay * 1000); // Convert seconds to milliseconds

    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, tags, images, audioRecordings, settings.autoSave, settings.autoSaveDelay, note?.id, hasUnsavedChanges]);

  // Detect long paragraphs and show passive hints
  useEffect(() => {
    if (!content || showPassiveHint) return;

    const paragraphs = content.split('\n\n');
    const longParagraph = paragraphs.find(p => p.split(' ').length > 100);

    if (longParagraph) {
      const timer = setTimeout(() => {
        setShowPassiveHint(true);
        setPassiveHintType('summarize');
      }, 5000); // Show after 5 seconds of no typing

      return () => clearTimeout(timer);
    }
  }, [content, showPassiveHint]);

  const handleSave = () => {
    if (!title.trim() && !content.trim()) {
      return;
    }

    if (note) {
      updateNote(note.id, {
        title,
        content,
        tags,
        images,
        audioRecordings,
      });
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } else {
      addNote({
        title,
        content,
        tags,
        isPinned: false,
        workspaceId: activeWorkspaceId || undefined,
        images,
        audioRecordings,
      });
    }

    onClose();
  };

  const handleManualSave = () => {
    if (!note || !hasUnsavedChanges) return;

    updateNote(note.id, {
      title,
      content,
      tags,
      images,
      audioRecordings,
    });
    setLastSaved(new Date());
    setHasUnsavedChanges(false);
  };

  const removeImage = (imageId: string) => {
    setImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const handleSaveRecording = (recording: AudioRecording) => {
    setAudioRecordings((prev) => [...prev, recording]);
  };

  const removeRecording = (recordingId: string) => {
    setAudioRecordings((prev) => prev.filter((rec) => rec.id !== recordingId));
  };

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
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // AI Action Handlers
  const handleAIAction = async (action: AIAction) => {
    if (!selectedText) return;
    await processAction(action, selectedText);
    clearSelection();
  };

  const handleAcceptSuggestion = () => {
    if (!currentSuggestion) return;

    // Replace selected text with AI suggestion
    // Since we're using a textarea, we need to handle this carefully
    setContent(prevContent => {
      // For now, just append the suggestion at the end
      // In a rich text editor, you'd replace the selected text
      return prevContent + '\n\n' + currentSuggestion;
    });

    clearSuggestion();
  };

  const handlePassiveHintAccept = async () => {
    setShowPassiveHint(false);

    // Find the longest paragraph and summarize it
    const paragraphs = content.split('\n\n');
    const longParagraph = paragraphs.find(p => p.split(' ').length > 100);

    if (longParagraph) {
      await processAction('summarize', longParagraph);
    }
  };

  // AI Toolbar Handlers
  const handleGenerateMindmap = async () => {
    if (!title.trim() && !content.trim()) {
      alert('Please add some content to generate a mindmap');
      return;
    }

    setIsGeneratingAI(true);
    try {
      console.log('Generating mindmap for:', { title, content: content.substring(0, 100) });
      const response = await fetch('/api/ai/mindmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || 'Untitled Note',
          content
        }),
      });

      console.log('Mindmap response status:', response.status);
      const data = await response.json();
      console.log('Mindmap data received:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate mindmap');
      }

      if (data.mindmap) {
        setGeneratedMindmap(data.mindmap);
        setShowMindmap(true);
      } else {
        throw new Error('No mindmap data in response');
      }
    } catch (error) {
      console.error('Error generating mindmap:', error);
      alert(`Failed to generate mindmap: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!title.trim() && !content.trim()) {
      alert('Please add some content to generate a quiz');
      return;
    }

    setIsGeneratingAI(true);
    try {
      console.log('Generating quiz for:', { title, content: content.substring(0, 100) });
      const response = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || 'Untitled Note',
          content,
          count: 15
        }),
      });

      console.log('Quiz response status:', response.status);
      const data = await response.json();
      console.log('Quiz data received:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate quiz');
      }

      if (data.quiz) {
        setGeneratedQuiz(data.quiz);
        setShowQuiz(true);
      } else {
        throw new Error('No quiz data in response');
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert(`Failed to generate quiz: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSummarizeNote = async () => {
    if (!content.trim()) {
      alert('Please add some content to summarize');
      return;
    }

    await processAction('summarize', content);
  };

  const handleGenerateFlashcards = async () => {
    if (!title.trim() && !content.trim()) {
      alert('Please add some content to generate flashcards');
      return;
    }

    setIsGeneratingAI(true);
    try {
      console.log('Generating flashcards for:', { title, content: content.substring(0, 100) });
      const response = await fetch('/api/ai/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || 'Untitled Note',
          content,
          count: 20 // Generate 20 flashcards by default
        }),
      });

      console.log('Flashcards response status:', response.status);
      const data = await response.json();
      console.log('Flashcards data received:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate flashcards');
      }

      if (data && data.flashcards && data.flashcards.length > 0) {
        setGeneratedFlashcards(data);
        setShowFlashcards(true);
      } else {
        throw new Error('No flashcards data in response');
      }
    } catch (error) {
      console.error('Error generating flashcards:', error);
      alert(`Failed to generate flashcards: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-[--color-text-black]">
              {note ? 'Edit Note' : 'New Note'}
            </h2>
            {note && (
              <div className="flex items-center gap-2 text-sm">
                {settings.autoSave ? (
                  lastSaved ? (
                    <div className="flex items-center gap-1.5 text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Auto-saved</span>
                    </div>
                  ) : hasUnsavedChanges ? (
                    <span className="text-gray-500">Auto-saving in {settings.autoSaveDelay}s...</span>
                  ) : null
                ) : hasUnsavedChanges ? (
                  <span className="text-orange-600 font-medium">● Unsaved changes</span>
                ) : lastSaved ? (
                  <div className="flex items-center gap-1.5 text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Saved</span>
                  </div>
                ) : null}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {note && !settings.autoSave && (
              <button
                onClick={handleManualSave}
                disabled={!hasUnsavedChanges}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: hasUnsavedChanges ? '#63cdff' : 'var(--bg-tertiary)',
                  color: hasUnsavedChanges ? '#121421' : 'var(--text-secondary)',
                }}
                title={hasUnsavedChanges ? 'Save changes' : 'No changes to save'}
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            )}
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
          className={`flex-1 overflow-y-auto p-6 space-y-4 transition-all ${
            isDragging
              ? 'ring-4 ring-[--color-primary-blue] ring-opacity-50 bg-blue-50'
              : ''
          }`}
        >
          {isDragging && (
            <div className="absolute inset-0 flex items-center justify-center bg-blue-50/90 z-10 pointer-events-none">
              <div className="text-center">
                <ImagePlus className="w-16 h-16 text-[--color-primary-blue] mx-auto mb-2" />
                <p className="text-lg font-semibold text-[--color-primary-blue]">
                  Drop image here
                </p>
              </div>
            </div>
          )}

          <input
            type="text"
            placeholder="Note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-2xl font-bold text-[--color-text-black] placeholder-gray-400 border-none outline-none"
          />

          <textarea
            placeholder="Start writing your note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            spellCheck={settings.spellCheck}
            className="w-full min-h-[300px] text-gray-700 placeholder-gray-400 border-none outline-none resize-none"
          />

          {/* AI Passive Hint */}
          <AIPassiveHint
            isVisible={showPassiveHint && !isProcessing && !currentSuggestion}
            message="💡 Would you like me to summarize this section?"
            type={passiveHintType}
            onAccept={handlePassiveHintAccept}
            onDismiss={() => setShowPassiveHint(false)}
          />

          {/* AI Inline Suggestion */}
          {isProcessing && (
            <AIInlineSuggestion
              suggestion=""
              isLoading={true}
              onAccept={() => {}}
              onReject={() => {}}
            />
          )}

          {currentSuggestion && !isProcessing && (
            <AIInlineSuggestion
              suggestion={currentSuggestion}
              isLoading={false}
              onAccept={handleAcceptSuggestion}
              onReject={clearSuggestion}
            />
          )}

          {/* Display images */}
          {images.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Images
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.src}
                      alt=""
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          const errorDiv = document.createElement('div');
                          errorDiv.className = 'w-full h-32 flex items-center justify-center text-gray-400 text-sm';
                          errorDiv.textContent = 'Failed to load image';
                          parent.appendChild(errorDiv);
                        }
                      }}
                    />
                    <button
                      onClick={() => removeImage(image.id)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      title="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {image.type === 'local' ? 'Local file' : 'External URL'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Voice Recordings */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
              Voice Notes
            </h3>

            <VoiceRecorder onSave={handleSaveRecording} />

            {audioRecordings.length > 0 && (
              <div className="space-y-2 mt-3">
                {audioRecordings.map((recording) => (
                  <AudioPlayer
                    key={recording.id}
                    recording={recording}
                    onDelete={() => removeRecording(recording.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* AI Study Tools */}
          <AIToolbar
            onGenerateMindmap={handleGenerateMindmap}
            onGenerateQuiz={handleGenerateQuiz}
            onSummarizeNote={handleSummarizeNote}
            onGenerateFlashcards={handleGenerateFlashcards}
            isProcessing={isGeneratingAI}
          />

          <div>
            <input
              type="text"
              placeholder="Add tags (press Enter)..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-[--color-primary-blue] transition-colors"
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-[--color-accent-green] text-[--color-text-black] rounded-full text-sm flex items-center gap-2"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[--color-primary-blue] text-[--color-text-black] rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            {note ? 'Update' : 'Create'} Note
          </button>
        </div>
      </div>

      {/* AI Floating Toolbar - Rendered outside main dialog to avoid z-index issues */}
      <FloatingAIToolbar
        isVisible={!!selectedText && !isProcessing && !currentSuggestion}
        position={selectionPosition || { x: 0, y: 0 }}
        onAction={handleAIAction}
        onClose={clearSelection}
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
          onRegenerate={handleGenerateQuiz}
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
          onRegenerate={handleGenerateFlashcards}
        />
      )}
    </div>
  );
}
