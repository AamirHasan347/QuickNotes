/**
 * Canvas Performance Utilities
 * Provides tile-based rendering, viewport management, and optimization helpers
 */

import { DrawingStroke, DrawingPoint } from '@/lib/store/types';

// Configuration
export const TILE_SIZE = 512; // Size of each tile in pixels
export const TILE_BUFFER = 2; // Number of tiles to render outside viewport
export const THROTTLE_DELAY = 16; // ~60fps

/**
 * Represents a single tile in the infinite canvas grid
 */
export interface CanvasTile {
  x: number; // Tile grid X coordinate
  y: number; // Tile grid Y coordinate
  strokes: DrawingStroke[]; // Strokes that intersect this tile
  dirty: boolean; // Needs rerendering
}

/**
 * Viewport tracking for virtualized rendering
 */
export interface Viewport {
  x: number; // Viewport X offset in world coordinates
  y: number; // Viewport Y offset in world coordinates
  width: number; // Viewport width
  height: number; // Viewport height
  scale: number; // Zoom level (1 = 100%)
}

/**
 * Convert screen coordinates to world coordinates
 */
export function screenToWorld(
  screenX: number,
  screenY: number,
  viewport: Viewport
): { x: number; y: number } {
  return {
    x: (screenX / viewport.scale) + viewport.x,
    y: (screenY / viewport.scale) + viewport.y,
  };
}

/**
 * Convert world coordinates to screen coordinates
 */
export function worldToScreen(
  worldX: number,
  worldY: number,
  viewport: Viewport
): { x: number; y: number } {
  return {
    x: (worldX - viewport.x) * viewport.scale,
    y: (worldY - viewport.y) * viewport.scale,
  };
}

/**
 * Get tile coordinate from world position
 */
export function worldToTile(worldX: number, worldY: number): { x: number; y: number } {
  return {
    x: Math.floor(worldX / TILE_SIZE),
    y: Math.floor(worldY / TILE_SIZE),
  };
}

/**
 * Get tile key for Map storage
 */
export function getTileKey(tileX: number, tileY: number): string {
  return `${tileX},${tileY}`;
}

/**
 * Calculate which tiles are visible in the current viewport
 */
export function getVisibleTiles(viewport: Viewport): { x: number; y: number }[] {
  const tiles: { x: number; y: number }[] = [];

  // Calculate viewport bounds in world coordinates
  const worldLeft = viewport.x;
  const worldTop = viewport.y;
  const worldRight = viewport.x + viewport.width / viewport.scale;
  const worldBottom = viewport.y + viewport.height / viewport.scale;

  // Get tile bounds with buffer
  const tileLeft = Math.floor(worldLeft / TILE_SIZE) - TILE_BUFFER;
  const tileTop = Math.floor(worldTop / TILE_SIZE) - TILE_BUFFER;
  const tileRight = Math.floor(worldRight / TILE_SIZE) + TILE_BUFFER;
  const tileBottom = Math.floor(worldBottom / TILE_SIZE) + TILE_BUFFER;

  // Generate tile list
  for (let y = tileTop; y <= tileBottom; y++) {
    for (let x = tileLeft; x <= tileRight; x++) {
      tiles.push({ x, y });
    }
  }

  return tiles;
}

/**
 * Check if a stroke intersects with a tile
 */
export function strokeIntersectsTile(stroke: DrawingStroke, tileX: number, tileY: number): boolean {
  const tileLeft = tileX * TILE_SIZE;
  const tileTop = tileY * TILE_SIZE;
  const tileRight = tileLeft + TILE_SIZE;
  const tileBottom = tileTop + TILE_SIZE;

  // Check if any point in the stroke is within the tile bounds
  for (const point of stroke.points) {
    if (
      point.x >= tileLeft &&
      point.x <= tileRight &&
      point.y >= tileTop &&
      point.y <= tileBottom
    ) {
      return true;
    }
  }

  // For shapes, also check bounding box
  if (stroke.points.length >= 2) {
    const xs = stroke.points.map(p => p.x);
    const ys = stroke.points.map(p => p.y);
    const strokeLeft = Math.min(...xs);
    const strokeTop = Math.min(...ys);
    const strokeRight = Math.max(...xs);
    const strokeBottom = Math.max(...ys);

    // Check if stroke bounding box intersects tile
    return !(
      strokeRight < tileLeft ||
      strokeLeft > tileRight ||
      strokeBottom < tileTop ||
      strokeTop > tileBottom
    );
  }

  return false;
}

/**
 * Render a stroke on a canvas context
 */
export function renderStroke(ctx: CanvasRenderingContext2D, stroke: DrawingStroke, offsetX = 0, offsetY = 0) {
  if (stroke.points.length === 0) return;

  ctx.globalAlpha = stroke.opacity;
  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (stroke.tool === 'highlighter') {
    ctx.globalCompositeOperation = 'multiply';
  } else if (stroke.tool === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out';
  } else {
    ctx.globalCompositeOperation = 'source-over';
  }

  const adjustedPoints = stroke.points.map(p => ({
    x: p.x - offsetX,
    y: p.y - offsetY,
  }));

  // Draw based on tool type
  if (stroke.tool === 'line' && adjustedPoints.length >= 2) {
    const start = adjustedPoints[0];
    const end = adjustedPoints[adjustedPoints.length - 1];
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  } else if (stroke.tool === 'rectangle' && adjustedPoints.length >= 2) {
    const start = adjustedPoints[0];
    const end = adjustedPoints[adjustedPoints.length - 1];
    const width = end.x - start.x;
    const height = end.y - start.y;
    ctx.beginPath();
    ctx.rect(start.x, start.y, width, height);
    ctx.stroke();
  } else if (stroke.tool === 'circle' && adjustedPoints.length >= 2) {
    const start = adjustedPoints[0];
    const end = adjustedPoints[adjustedPoints.length - 1];
    const radiusX = Math.abs(end.x - start.x) / 2;
    const radiusY = Math.abs(end.y - start.y) / 2;
    const centerX = start.x + (end.x - start.x) / 2;
    const centerY = start.y + (end.y - start.y) / 2;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    ctx.stroke();
  } else {
    // Freehand drawing
    ctx.beginPath();
    ctx.moveTo(adjustedPoints[0].x, adjustedPoints[0].y);
    for (let i = 1; i < adjustedPoints.length; i++) {
      ctx.lineTo(adjustedPoints[i].x, adjustedPoints[i].y);
    }
    ctx.stroke();
  }

  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;

  return function (this: any, ...args: Parameters<T>) {
    const currentTime = Date.now();

    if (currentTime - lastExecTime >= delay) {
      func.apply(this, args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}
