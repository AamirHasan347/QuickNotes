/**
 * TileManager - Manages infinite canvas tiles and optimized rendering
 */

import { DrawingStroke } from '@/lib/store/types';
import {
  CanvasTile,
  Viewport,
  TILE_SIZE,
  getTileKey,
  worldToTile,
  strokeIntersectsTile,
  getVisibleTiles,
  renderStroke,
} from './canvasUtils';

export class TileManager {
  private tiles: Map<string, CanvasTile> = new Map();
  private tileCanvases: Map<string, HTMLCanvasElement> = new Map();
  private renderQueue: Set<string> = new Set();

  /**
   * Add a stroke to the appropriate tiles
   */
  addStroke(stroke: DrawingStroke): void {
    // Find all tiles this stroke intersects
    const affectedTiles = this.getAffectedTiles(stroke);

    affectedTiles.forEach(({ x, y }) => {
      const key = getTileKey(x, y);
      let tile = this.tiles.get(key);

      if (!tile) {
        tile = {
          x,
          y,
          strokes: [],
          dirty: true,
        };
        this.tiles.set(key, tile);
      }

      tile.strokes.push(stroke);
      tile.dirty = true;
      this.renderQueue.add(key);
    });
  }

  /**
   * Remove a stroke from all tiles
   */
  removeStroke(strokeId: string): void {
    this.tiles.forEach((tile, key) => {
      const index = tile.strokes.findIndex((s) => s.id === strokeId);
      if (index !== -1) {
        tile.strokes.splice(index, 1);
        tile.dirty = true;
        this.renderQueue.add(key);
      }
    });
  }

  /**
   * Update all strokes (for undo/redo)
   */
  updateStrokes(strokes: DrawingStroke[]): void {
    // Clear all tiles
    this.tiles.clear();
    this.tileCanvases.clear();
    this.renderQueue.clear();

    // Re-add all strokes
    strokes.forEach((stroke) => this.addStroke(stroke));
  }

  /**
   * Get tiles affected by a stroke
   */
  private getAffectedTiles(stroke: DrawingStroke): { x: number; y: number }[] {
    if (stroke.points.length === 0) return [];

    const tiles: Set<string> = new Set();

    // Get bounding box
    const xs = stroke.points.map((p) => p.x);
    const ys = stroke.points.map((p) => p.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);

    // Get tile range
    const startTile = worldToTile(minX, minY);
    const endTile = worldToTile(maxX, maxY);

    // Check all tiles in range
    for (let y = startTile.y; y <= endTile.y; y++) {
      for (let x = startTile.x; x <= endTile.x; x++) {
        if (strokeIntersectsTile(stroke, x, y)) {
          tiles.add(getTileKey(x, y));
        }
      }
    }

    return Array.from(tiles).map((key) => {
      const [x, y] = key.split(',').map(Number);
      return { x, y };
    });
  }

  /**
   * Render a single tile to an offscreen canvas
   */
  private renderTile(tile: CanvasTile): HTMLCanvasElement {
    const key = getTileKey(tile.x, tile.y);
    let canvas = this.tileCanvases.get(key);

    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.width = TILE_SIZE;
      canvas.height = TILE_SIZE;
      this.tileCanvases.set(key, canvas);
    }

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return canvas;

    // Clear tile
    ctx.clearRect(0, 0, TILE_SIZE, TILE_SIZE);

    // Calculate tile world offset
    const offsetX = tile.x * TILE_SIZE;
    const offsetY = tile.y * TILE_SIZE;

    // Render all strokes in this tile
    tile.strokes.forEach((stroke) => {
      renderStroke(ctx, stroke, offsetX, offsetY);
    });

    tile.dirty = false;
    this.renderQueue.delete(key);

    return canvas;
  }

  /**
   * Render visible tiles to the main canvas
   */
  renderToCanvas(
    ctx: CanvasRenderingContext2D,
    viewport: Viewport,
    currentStroke?: DrawingStroke | null
  ): void {
    // Clear canvas
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(0, 0, viewport.width, viewport.height);

    // Get visible tiles
    const visibleTiles = getVisibleTiles(viewport);

    // Render each visible tile
    visibleTiles.forEach(({ x, y }) => {
      const key = getTileKey(x, y);
      let tile = this.tiles.get(key);

      // Create empty tile if doesn't exist
      if (!tile) {
        tile = {
          x,
          y,
          strokes: [],
          dirty: false,
        };
        this.tiles.set(key, tile);
      }

      // Render tile if dirty
      if (tile.dirty || !this.tileCanvases.has(key)) {
        this.renderTile(tile);
      }

      // Draw tile to main canvas
      const tileCanvas = this.tileCanvases.get(key);
      if (tileCanvas) {
        const worldX = x * TILE_SIZE;
        const worldY = y * TILE_SIZE;
        const screenX = (worldX - viewport.x) * viewport.scale;
        const screenY = (worldY - viewport.y) * viewport.scale;

        ctx.drawImage(
          tileCanvas,
          screenX,
          screenY,
          TILE_SIZE * viewport.scale,
          TILE_SIZE * viewport.scale
        );
      }
    });

    // Render current stroke on top
    if (currentStroke && currentStroke.points.length > 0) {
      ctx.save();
      ctx.translate(-viewport.x * viewport.scale, -viewport.y * viewport.scale);
      ctx.scale(viewport.scale, viewport.scale);
      renderStroke(ctx, currentStroke);
      ctx.restore();
    }
  }

  /**
   * Cleanup unused tiles (for memory management)
   */
  cleanup(viewport: Viewport): void {
    const visibleTileKeys = new Set(
      getVisibleTiles(viewport).map(({ x, y }) => getTileKey(x, y))
    );

    // Remove tiles far from viewport
    this.tileCanvases.forEach((canvas, key) => {
      if (!visibleTileKeys.has(key)) {
        const tile = this.tiles.get(key);
        // Only remove if tile has no strokes (empty tile)
        if (tile && tile.strokes.length === 0) {
          this.tileCanvases.delete(key);
          this.tiles.delete(key);
        }
      }
    });
  }

  /**
   * Get all strokes from all tiles
   */
  getAllStrokes(): DrawingStroke[] {
    const strokeMap = new Map<string, DrawingStroke>();

    this.tiles.forEach((tile) => {
      tile.strokes.forEach((stroke) => {
        strokeMap.set(stroke.id, stroke);
      });
    });

    return Array.from(strokeMap.values());
  }

  /**
   * Clear all tiles and strokes
   */
  clear(): void {
    this.tiles.clear();
    this.tileCanvases.clear();
    this.renderQueue.clear();
  }
}
