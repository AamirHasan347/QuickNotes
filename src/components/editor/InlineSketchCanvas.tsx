import React, { useEffect } from 'react';
import { Drawing } from '@/lib/store/types';
import { useInfiniteCanvas } from '@/hooks/useInfiniteCanvas';

interface InlineSketchCanvasProps {
  currentDrawing: Drawing | null;
  onUpdate: (drawing: Drawing) => void;
  canvasHook: ReturnType<typeof useInfiniteCanvas>;
  guideLines?: 'none' | 'dots' | 'single-line' | 'grid';
  theme?: 'light' | 'dark' | 'auto';
}

const InlineSketchCanvas: React.FC<InlineSketchCanvasProps> = ({
  currentDrawing,
  onUpdate,
  canvasHook,
  guideLines = 'none',
  theme = 'light',
}) => {
  const {
    canvasRef,
    containerRef,
    viewport,
    strokeCount,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleWheel,
  } = canvasHook;

  // Guide lines background style generator
  const getGuideLineStyle = (): React.CSSProperties => {
    const isDark = theme === 'dark';
    const lineColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';
    const dotColor = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)';

    switch (guideLines) {
      case 'dots':
        return {
          backgroundImage: `radial-gradient(circle, ${dotColor} 2px, transparent 2px)`,
          backgroundSize: '25px 25px',
        };
      case 'single-line':
        return {
          backgroundImage: `linear-gradient(${lineColor} 1.5px, transparent 1.5px)`,
          backgroundSize: '100% 40px',
        };
      case 'grid':
        return {
          backgroundImage: `
            linear-gradient(${lineColor} 1.5px, transparent 1.5px),
            linear-gradient(90deg, ${lineColor} 1.5px, transparent 1.5px)
          `,
          backgroundSize: '40px 40px',
        };
      case 'none':
      default:
        return {};
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default browser zoom
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '0')) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[500px] relative" style={{ backgroundColor: 'var(--bg-primary)', ...getGuideLineStyle() }}>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onWheel={handleWheel}
        className="w-full h-full cursor-crosshair touch-none"
        style={{ touchAction: 'none' }}
      />

      {/* Instructions Overlay */}
      {strokeCount === 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <div className="backdrop-blur-sm rounded-xl p-6 shadow-lg" style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)'
          }}>
            <p className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Infinite Canvas Ready!
            </p>
            <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
              Draw with your mouse or touch • Pan with middle mouse or two fingers
            </p>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Ctrl/Cmd + Scroll to zoom • Scroll to pan
            </p>
          </div>
        </div>
      )}

      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-4 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md text-xs pointer-events-none" style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        color: 'var(--text-secondary)'
      }}>
        Zoom: {Math.round(viewport.scale * 100)}%
      </div>

      {/* Stroke counter */}
      {strokeCount > 0 && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md border border-gray-200 text-xs text-gray-600 pointer-events-none">
          {strokeCount} stroke{strokeCount !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default InlineSketchCanvas;
