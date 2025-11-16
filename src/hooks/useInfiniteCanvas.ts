/**
 * useInfiniteCanvas - Optimized infinite canvas hook with tile-based rendering
 */

import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { DrawingStroke, DrawingPoint } from '@/lib/store/types';
import { TileManager } from '@/utils/TileManager';
import { Viewport, screenToWorld, throttle } from '@/utils/canvasUtils';

export type DrawingTool = 'pen' | 'eraser' | 'highlighter' | 'line' | 'rectangle' | 'circle';

interface UseInfiniteCanvasProps {
  initialStrokes?: DrawingStroke[];
  onStrokesChange?: (strokes: DrawingStroke[]) => void;
}

interface CanvasDrawState {
  tool: DrawingTool;
  color: string;
  width: number;
  opacity: number;
}

export const useInfiniteCanvas = ({
  initialStrokes = [],
  onStrokesChange,
}: UseInfiniteCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tileManagerRef = useRef<TileManager>(new TileManager());
  const isDrawingRef = useRef(false);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastRenderTimeRef = useRef(0);

  // Viewport state
  const [viewport, setViewport] = useState<Viewport>({
    x: 0,
    y: 0,
    width: 800,
    height: 600,
    scale: 1,
  });

  // Pan state
  const [isPanning, setIsPanning] = useState(false);
  const lastPanPosRef = useRef({ x: 0, y: 0 });

  // Drawing state
  const [currentStroke, setCurrentStroke] = useState<DrawingStroke | null>(null);
  const [strokeCount, setStrokeCount] = useState(0); // For triggering re-renders

  // Tool state
  const [state, setState] = useState<CanvasDrawState>({
    tool: 'pen',
    color: '#121421',
    width: 4,
    opacity: 1,
  });

  // Undo/redo stacks
  const [undoStack, setUndoStack] = useState<DrawingStroke[][]>([]);
  const [redoStack, setRedoStack] = useState<DrawingStroke[][]>([]);

  // Initialize tile manager with initial strokes
  useEffect(() => {
    tileManagerRef.current.updateStrokes(initialStrokes);
    setStrokeCount(initialStrokes.length);
  }, [initialStrokes]);

  // Update canvas size on container resize
  useEffect(() => {
    const updateSize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      setViewport((prev) => ({
        ...prev,
        width: rect.width,
        height: rect.height,
      }));
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Optimized render function with RAF
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', {
      alpha: false,
      desynchronized: true, // Performance hint
    });
    if (!ctx) return;

    // Throttle rendering to avoid excessive redraws
    const now = performance.now();
    if (now - lastRenderTimeRef.current < 16) return; // ~60fps
    lastRenderTimeRef.current = now;

    // Render tiles
    tileManagerRef.current.renderToCanvas(ctx, viewport, currentStroke);
  }, [viewport, currentStroke]);

  // Schedule render with RAF
  const scheduleRender = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(render);
  }, [render]);

  // Render whenever viewport or strokes change
  useEffect(() => {
    scheduleRender();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [scheduleRender]);

  // Cleanup unused tiles periodically
  useEffect(() => {
    const interval = setInterval(() => {
      tileManagerRef.current.cleanup(viewport);
    }, 5000);
    return () => clearInterval(interval);
  }, [viewport]);

  // Drawing functions
  const startDrawing = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const screenX = clientX - rect.left;
      const screenY = clientY - rect.top;
      const worldPos = screenToWorld(screenX, screenY, viewport);

      const newStroke: DrawingStroke = {
        id: `stroke-${Date.now()}-${Math.random()}`,
        tool: state.tool,
        color: state.color,
        width: state.width,
        opacity: state.opacity,
        points: [{ x: worldPos.x, y: worldPos.y }],
      };

      setCurrentStroke(newStroke);
      isDrawingRef.current = true;
    },
    [viewport, state]
  );

  const continueDrawing = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDrawingRef.current || !currentStroke) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const screenX = clientX - rect.left;
      const screenY = clientY - rect.top;
      const worldPos = screenToWorld(screenX, screenY, viewport);

      setCurrentStroke((prev) => {
        if (!prev) return null;

        if (['line', 'rectangle', 'circle'].includes(state.tool)) {
          // For shapes, only update end point
          return {
            ...prev,
            points: [prev.points[0], { x: worldPos.x, y: worldPos.y }],
          };
        } else {
          // For freehand, add points
          return {
            ...prev,
            points: [...prev.points, { x: worldPos.x, y: worldPos.y }],
          };
        }
      });

      scheduleRender();
    },
    [currentStroke, viewport, state.tool, scheduleRender]
  );

  const stopDrawing = useCallback(() => {
    if (!isDrawingRef.current || !currentStroke) return;

    if (currentStroke.points.length > 0) {
      // Save to undo stack
      const allStrokes = tileManagerRef.current.getAllStrokes();
      setUndoStack((prev) => [...prev, allStrokes]);
      setRedoStack([]);

      // Add stroke to tile manager
      tileManagerRef.current.addStroke(currentStroke);
      setStrokeCount((c) => c + 1);

      // Notify parent
      if (onStrokesChange) {
        onStrokesChange(tileManagerRef.current.getAllStrokes());
      }
    }

    setCurrentStroke(null);
    isDrawingRef.current = false;
    scheduleRender();
  }, [currentStroke, onStrokesChange, scheduleRender]);

  // Pan functions
  const startPan = useCallback((clientX: number, clientY: number) => {
    setIsPanning(true);
    lastPanPosRef.current = { x: clientX, y: clientY };
  }, []);

  const continuePan = useCallback(
    throttle((clientX: number, clientY: number) => {
      if (!isPanning) return;

      const dx = clientX - lastPanPosRef.current.x;
      const dy = clientY - lastPanPosRef.current.y;

      setViewport((prev) => ({
        ...prev,
        x: prev.x - dx / prev.scale,
        y: prev.y - dy / prev.scale,
      }));

      lastPanPosRef.current = { x: clientX, y: clientY };
    }, 16),
    [isPanning]
  );

  const stopPan = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Mouse event handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
        // Middle mouse or Ctrl+Click for panning
        startPan(e.clientX, e.clientY);
      } else if (e.button === 0) {
        // Left mouse for drawing
        startDrawing(e.clientX, e.clientY);
      }
    },
    [startDrawing, startPan]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (isPanning) {
        continuePan(e.clientX, e.clientY);
      } else if (isDrawingRef.current) {
        continueDrawing(e.clientX, e.clientY);
      }
    },
    [isPanning, continueDrawing, continuePan]
  );

  const handleMouseUp = useCallback(() => {
    stopDrawing();
    stopPan();
  }, [stopDrawing, stopPan]);

  // Touch event handlers
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        startDrawing(touch.clientX, touch.clientY);
      } else if (e.touches.length === 2) {
        // Two-finger pan
        const touch = e.touches[0];
        startPan(touch.clientX, touch.clientY);
      }
    },
    [startDrawing, startPan]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      if (e.touches.length === 1 && isDrawingRef.current) {
        const touch = e.touches[0];
        continueDrawing(touch.clientX, touch.clientY);
      } else if (e.touches.length === 2) {
        const touch = e.touches[0];
        continuePan(touch.clientX, touch.clientY);
      }
    },
    [continueDrawing, continuePan]
  );

  const handleTouchEnd = useCallback(() => {
    stopDrawing();
    stopPan();
  }, [stopDrawing, stopPan]);

  // Wheel for zooming/panning
  const handleWheel = useCallback(
    throttle((e: React.WheelEvent<HTMLCanvasElement>) => {
      e.preventDefault();

      if (e.ctrlKey || e.metaKey) {
        // Zoom
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.max(0.1, Math.min(5, viewport.scale * zoomFactor));

        // Zoom towards mouse position
        const worldPosBefore = screenToWorld(mouseX, mouseY, viewport);
        const newViewport = { ...viewport, scale: newScale };
        const worldPosAfter = screenToWorld(mouseX, mouseY, newViewport);

        setViewport({
          ...newViewport,
          x: viewport.x + (worldPosBefore.x - worldPosAfter.x),
          y: viewport.y + (worldPosBefore.y - worldPosAfter.y),
        });
      } else {
        // Pan
        setViewport((prev) => ({
          ...prev,
          x: prev.x + e.deltaX / prev.scale,
          y: prev.y + e.deltaY / prev.scale,
        }));
      }
    }, 16),
    [viewport]
  );

  // Tool setters
  const setTool = useCallback((tool: DrawingTool) => {
    setState((prev) => ({
      ...prev,
      tool,
      // Set opacity for highlighter, full opacity for others
      opacity: tool === 'highlighter' ? 0.3 : 1,
    }));
  }, []);

  const setColor = useCallback((color: string) => {
    setState((prev) => ({ ...prev, color }));
  }, []);

  const setWidth = useCallback((width: number) => {
    setState((prev) => ({ ...prev, width }));
  }, []);

  // Actions
  const clearAll = useCallback(() => {
    const allStrokes = tileManagerRef.current.getAllStrokes();
    if (allStrokes.length === 0) return;

    setUndoStack((prev) => [...prev, allStrokes]);
    setRedoStack([]);
    tileManagerRef.current.clear();
    setStrokeCount(0);

    if (onStrokesChange) {
      onStrokesChange([]);
    }

    scheduleRender();
  }, [onStrokesChange, scheduleRender]);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;

    const currentStrokes = tileManagerRef.current.getAllStrokes();
    const previousState = undoStack[undoStack.length - 1];

    setRedoStack((prev) => [...prev, currentStrokes]);
    setUndoStack((prev) => prev.slice(0, -1));

    tileManagerRef.current.updateStrokes(previousState);
    setStrokeCount(previousState.length);

    if (onStrokesChange) {
      onStrokesChange(previousState);
    }

    scheduleRender();
  }, [undoStack, onStrokesChange, scheduleRender]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;

    const currentStrokes = tileManagerRef.current.getAllStrokes();
    const nextState = redoStack[redoStack.length - 1];

    setUndoStack((prev) => [...prev, currentStrokes]);
    setRedoStack((prev) => prev.slice(0, -1));

    tileManagerRef.current.updateStrokes(nextState);
    setStrokeCount(nextState.length);

    if (onStrokesChange) {
      onStrokesChange(nextState);
    }

    scheduleRender();
  }, [redoStack, onStrokesChange, scheduleRender]);

  const exportAsPNG = useCallback((): string => {
    const canvas = canvasRef.current;
    if (!canvas) return '';
    return canvas.toDataURL('image/png');
  }, []);

  const getStrokes = useCallback(() => {
    return tileManagerRef.current.getAllStrokes();
  }, []);

  return {
    canvasRef,
    containerRef,
    viewport,
    state,
    strokeCount,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleWheel,
    setTool,
    setColor,
    setWidth,
    clearAll,
    undo,
    redo,
    exportAsPNG,
    getStrokes,
  };
};
