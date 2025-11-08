'use client';

import { useState, useEffect } from 'react';
import { useNotesStore } from '@/lib/store/useNotesStore';
import { X, ImagePlus } from 'lucide-react';
import { Note, NoteImage, AudioRecording } from '@/lib/store/types';
import { VersionHistory } from './VersionHistory';
import { useImageDrop, ImageDropResult } from '@/hooks/useImageDrop';
import { VoiceRecorder } from '@/components/audio/VoiceRecorder';
import { AudioPlayer } from '@/components/audio/AudioPlayer';

interface NoteEditorProps {
  note?: Note;
  isOpen: boolean;
  onClose: () => void;
}

export function NoteEditor({ note, isOpen, onClose }: NoteEditorProps) {
  const { addNote, updateNote, activeWorkspaceId } = useNotesStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [images, setImages] = useState<NoteImage[]>([]);
  const [audioRecordings, setAudioRecordings] = useState<AudioRecording[]>([]);

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
    }
  }, [note, isOpen]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-[--color-text-black]">
            {note ? 'Edit Note' : 'New Note'}
          </h2>
          <div className="flex items-center gap-2">
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
            className="w-full min-h-[300px] text-gray-700 placeholder-gray-400 border-none outline-none resize-none"
          />

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
    </div>
  );
}
