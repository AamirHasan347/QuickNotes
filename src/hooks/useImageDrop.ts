import { useState, useCallback } from 'react';

export interface ImageDropResult {
  id: string;
  src: string;
  type: 'local' | 'external';
}

interface UseImageDropReturn {
  isDragging: boolean;
  dragHandlers: {
    onDragEnter: (e: React.DragEvent<HTMLElement>) => void;
    onDragOver: (e: React.DragEvent<HTMLElement>) => void;
    onDragLeave: (e: React.DragEvent<HTMLElement>) => void;
    onDrop: (e: React.DragEvent<HTMLElement>) => void;
  };
}

export function useImageDrop(
  onImageDrop: (image: ImageDropResult) => void
): UseImageDropReturn {
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setDragCounter((prev) => prev + 1);

    // Check if the drag contains files or images
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      const hasImages = Array.from(e.dataTransfer.items).some(
        (item) => item.type.startsWith('image/') || item.kind === 'file'
      );
      if (hasImages) {
        setIsDragging(true);
      }
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setDragCounter((prev) => {
      const newCount = prev - 1;
      if (newCount === 0) {
        setIsDragging(false);
      }
      return newCount;
    });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();

      setIsDragging(false);
      setDragCounter(0);

      // Handle local image files
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const files = Array.from(e.dataTransfer.files);

        files.forEach((file) => {
          if (file.type.startsWith('image/')) {
            const objectURL = URL.createObjectURL(file);
            const imageId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            onImageDrop({
              id: imageId,
              src: objectURL,
              type: 'local',
            });
          }
        });

        return;
      }

      // Handle external images from websites
      let imageUrl = e.dataTransfer.getData('text/uri-list') ||
                     e.dataTransfer.getData('text/plain') ||
                     e.dataTransfer.getData('text/html') ||
                     e.dataTransfer.getData('URL');

      if (imageUrl) {
        let extractedUrl = imageUrl.trim();

        // If it's HTML (from dragging from a webpage), extract the img src
        if (extractedUrl.includes('<img')) {
          const match = extractedUrl.match(/src=["']([^"']+)["']/);
          if (match && match[1]) {
            extractedUrl = match[1];
          }
        }

        // Clean up the URL (remove newlines, etc.)
        extractedUrl = extractedUrl.split('\n')[0].trim();

        // Validate it's an image URL or looks like a URL
        if (extractedUrl && (
          extractedUrl.match(/\.(jpeg|jpg|gif|png|svg|webp|bmp|ico)(\?.*)?$/i) ||
          extractedUrl.startsWith('http://') ||
          extractedUrl.startsWith('https://') ||
          extractedUrl.startsWith('data:image/') ||
          extractedUrl.includes('/image') ||
          extractedUrl.includes('.jpg') ||
          extractedUrl.includes('.png') ||
          extractedUrl.includes('.gif') ||
          extractedUrl.includes('.webp')
        )) {
          const imageId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

          // Fetch and convert to blob to avoid CORS issues
          fetch(extractedUrl, { mode: 'cors' })
            .then(response => response.blob())
            .then(blob => {
              const blobUrl = URL.createObjectURL(blob);
              onImageDrop({
                id: imageId,
                src: blobUrl,
                type: 'external',
              });
            })
            .catch(() => {
              // If fetch fails (CORS), try to use the URL directly as fallback
              onImageDrop({
                id: imageId,
                src: extractedUrl,
                type: 'external',
              });
            });
        }
      }
    },
    [onImageDrop]
  );

  return {
    isDragging,
    dragHandlers: {
      onDragEnter: handleDragEnter,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  };
}
