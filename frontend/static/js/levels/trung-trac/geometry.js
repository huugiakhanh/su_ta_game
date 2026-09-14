// Hàm hình học/vật lý thuần — không phụ thuộc state hay DOM.

import { CHUNK_W, GROUND_Y, TERRAIN_RAMPS } from './config.js';

export function worldX(chunkNumber, localX) {
  return (chunkNumber - 1) * CHUNK_W + localX;
}

export function groundYAt(worldXPosition) {
  const segment = TERRAIN_RAMPS.find(item => worldXPosition >= item.x1 && worldXPosition <= item.x2);
  if (!segment) return GROUND_Y;
  const t = (worldXPosition - segment.x1) / (segment.x2 - segment.x1);
  return segment.y1 + (segment.y2 - segment.y1) * t;
}

export function aabb(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function makeObstacle(type, chunk, localX, width, height, options = {}) {
  const drawScale = options.drawScale || 1.65;
  const groundY = options.groundY || groundYAt(worldX(chunk, localX) + width / 2);
  return {
    type,
    x: worldX(chunk, localX),
    y: options.overhead ? groundY - 77 : groundY - height,
    w: width,
    h: options.overhead ? 34 : height,
    drawW: Math.round(width * drawScale),
    drawH: Math.round(height * drawScale),
    groundY,
    harmful: Boolean(options.harmful),
    overhead: Boolean(options.overhead),
    requiresDash: options.requiresDash ?? Boolean(options.overhead),
    active: true
  };
}
