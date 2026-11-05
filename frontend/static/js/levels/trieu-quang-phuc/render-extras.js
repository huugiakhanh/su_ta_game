// Lớp vẽ riêng chương Triệu Việt Vương — gắn vào engine qua CHAPTER.hooks.draw.
// Màn 1 (TQP-L1): bụi cỏ PROP_TQP_GRASS_TUFT (prop map, pivot giữa đáy) vẽ
// TRƯỚC người chơi tại chỗ rắn nằm phục (`state.tufts` = worldX tâm) để che rắn.

import { state } from '../../engine/state.js';
import { images } from '../../engine/assets.js';
import { VIEW_W, GROUND_Y } from '../../engine/config.js';
import { ctx, drawMapImage, mapWidth, mapHeight } from '../../engine/render/canvas.js';
import { SNAKE_AMBUSH } from './config.js';

function drawTufts() {
  if (!state.tufts?.length) return;
  const prop = images.maps.props?.[SNAKE_AMBUSH.tuft];
  if (!prop?.image) return;
  const w = mapWidth(prop.image);
  const h = mapHeight(prop.image);
  state.tufts.forEach(centerX => {
    const left = Math.round(centerX - w / 2 - state.cameraX);
    if (left + w < -16 || left > VIEW_W + 16) return;
    drawMapImage(ctx, prop.image, 0, 0, w, h, left, GROUND_Y - h);
  });
}

export const DRAW_LAYERS = { afterPlayer: drawTufts };
