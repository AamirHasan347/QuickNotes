'use client';

import { ReactNode } from 'react';
import { InlineImage } from '@/lib/store/types';

interface TextWithImageWrapProps {
  children: ReactNode;
  images: InlineImage[];
  className?: string;
}

/**
 * TextWithImageWrap component creates invisible spacer elements that push text
 * away from draggable images, creating a text wrapping effect.
 *
 * How it works:
 * 1. For each image, we create a floated spacer div with the same dimensions
 * 2. The spacer is positioned at the same location as the image
 * 3. Text naturally flows around the floated spacer
 * 4. The actual draggable image floats on top with higher z-index
 */
export function TextWithImageWrap({ children, images, className = '' }: TextWithImageWrapProps) {
  return (
    <div className={`relative h-full ${className}`}>
      {/* Invisible spacers that push text away - these create the wrapping effect */}
      {images.map((image) => {
        // Determine float direction based on horizontal position
        const isLeftSide = image.position.x < 300; // Assume container is wider than 600px
        const floatDirection = isLeftSide ? 'left' : 'right';

        return (
          <div
            key={`spacer-${image.id}`}
            style={{
              float: floatDirection,
              width: image.size.width + 20, // Add 20px margin for breathing room
              height: image.size.height + 20,
              marginRight: floatDirection === 'left' ? '16px' : '0',
              marginLeft: floatDirection === 'right' ? '16px' : '0',
              marginBottom: '16px',
              marginTop: '8px',
              pointerEvents: 'none', // Don't interfere with mouse events
              opacity: 0, // Invisible but still affects layout
            }}
          />
        );
      })}

      {/* Actual text content */}
      <div className="relative z-0 h-full">
        {children}
      </div>
    </div>
  );
}
