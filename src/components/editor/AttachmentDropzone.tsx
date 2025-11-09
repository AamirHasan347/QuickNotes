'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Image as ImageIcon, Video, Link as LinkIcon, X, Download } from 'lucide-react';
import { Attachment } from '@/lib/store/types';

interface AttachmentDropzoneProps {
  attachments: Attachment[];
  onAddAttachment: (attachment: Attachment) => void;
  onRemoveAttachment: (id: string) => void;
}

export function AttachmentDropzone({
  attachments,
  onAddAttachment,
  onRemoveAttachment,
}: AttachmentDropzoneProps) {
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      for (const file of acceptedFiles) {
        const reader = new FileReader();

        reader.onload = async () => {
          const result = reader.result as string;
          let type: Attachment['type'] = 'image';

          if (file.type.startsWith('image/')) {
            type = 'image';
          } else if (file.type === 'application/pdf') {
            type = 'pdf';
          } else if (file.type.startsWith('video/')) {
            type = 'video';
          }

          const attachment: Attachment = {
            id: `attachment-${Date.now()}-${Math.random()}`,
            type,
            src: result,
            name: file.name,
            createdAt: new Date(),
          };

          // For PDFs, we could generate AI summary here
          if (type === 'pdf') {
            attachment.meta = {
              title: file.name,
              summary: 'PDF document', // TODO: Add AI summarization
            };
          }

          onAddAttachment(attachment);
        };

        reader.readAsDataURL(file);
      }
    },
    [onAddAttachment]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'video/*': ['.mp4', '.webm', '.mov'],
    },
    noClick: false,
  });

  const getIcon = (type: Attachment['type']) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-5 h-5" />;
      case 'pdf':
        return <FileText className="w-5 h-5" />;
      case 'video':
        return <Video className="w-5 h-5" />;
      case 'link':
        return <LinkIcon className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer ${
          isDragActive
            ? 'border-purple-500 bg-purple-50 scale-105 shadow-lg'
            : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          <motion.div
            animate={isDragActive ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
            transition={{ duration: 0.2 }}
            className="flex justify-center mb-3"
          >
            {isDragActive ? (
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                <Download className="w-8 h-8 text-purple-600" />
              </div>
            ) : (
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-red-600" />
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <Video className="w-6 h-6 text-green-600" />
                </div>
              </div>
            )}
          </motion.div>
          <p className="text-sm font-medium text-gray-700 mb-1">
            {isDragActive ? 'Drop files here' : 'Drag & drop files, or click to browse'}
          </p>
          <p className="text-xs text-gray-500">
            Supports images, PDFs, and videos
          </p>
        </div>
      </div>

      {/* Attachments List */}
      <AnimatePresence mode="popLayout">
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
              Attachments ({attachments.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {attachments.map((attachment) => (
                <motion.div
                  key={attachment.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative group"
                >
                  {attachment.type === 'image' && (
                    <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={attachment.src}
                        alt={attachment.name || 'Attachment'}
                        className="w-full h-40 object-cover"
                      />
                      <button
                        onClick={() => onRemoveAttachment(attachment.id)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-2 py-1">
                        {attachment.name}
                      </div>
                    </div>
                  )}

                  {(attachment.type === 'pdf' || attachment.type === 'video') && (
                    <div className="rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          attachment.type === 'pdf' ? 'bg-red-100' : 'bg-green-100'
                        }`}>
                          {getIcon(attachment.type)}
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
                          onClick={() => onRemoveAttachment(attachment.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
