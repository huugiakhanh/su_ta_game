// Lớp vẽ riêng chương Ngô Quyền, gắn vào engine qua CHAPTER.hooks.draw.
// Màn 1: ụ thành PROP_NQ_RAMPART (ảnh map, chỉ vẽ — không va chạm) đứng sau cung
// thủ: vẽ ở lớp `beforeNpcs` (sau vật cản, trước hazard).

import { state } from '../../engine/state.js';
import { images } from '../../engine/assets.js';
import { VIEW_W, GROUND_Y } from '../../engine/config.js';
import { ctx, drawMapImage, mapWidth, mapHeight } from '../../engine/render/canvas.js';
import { RAMPART } from './config.js';

function drawRamparts() {
  const prop = images.maps.props[RAMPART.prop];
  if (!prop?.image || !state.ramparts) return;
  const w = mapWidth(prop.image);
  const h = mapHeight(prop.image);
  state.ramparts.forEach(centerX => {
    const left = Math.round(centerX - w / 2 - state.cameraX);
    if (left + w < -48 || left > VIEW_W + 48) return;
    drawMapImage(ctx, prop.image, 0, 0, w, h, left, GROUND_Y - h);
  });
}

export const DRAW_LAYERS = { beforeNpcs: drawRamparts };
