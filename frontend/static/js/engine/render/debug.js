// Lớp debug (F2): hitbox (đỏ; người chơi xanh), pivot bottom-center (vàng),
// nhãn animation + ô đang vẽ phía trên entity, vạch GROUND_Y. Không đụng state.
// Hộp riêng của chương (vd. hũ dầu, lửa, bóng kỹ năng): CHAPTER.hooks.debugEntities.

import { state } from '../state.js';
import { VIEW_W, GROUND_Y, ITEM_HITBOX } from '../config.js';
import { CHAPTER, LEVEL } from '../chapter.js';
import { ctx, debugLabels } from './canvas.js';
import { zoneIndexAt, sceneryAt } from './backdrop.js';

export function drawDebugOverlay() {
  ctx.save();
  ctx.lineWidth = 1;
  ctx.font = '7px monospace';
  ctx.textAlign = 'center';
  const entities = [
    ...state.obstacles.filter(item => item.active),
    ...state.hazards.filter(item => item.alive && !(item.kind === 'roller' && !item.active)),
    ...state.enemies.filter(item => item.alive),
    ...state.npcs.filter(item => item.fade > 0),
    ...(state.guide?.fade > 0 ? [state.guide] : []),
    ...state.projectiles,
    ...(CHAPTER.hooks?.debugEntities?.() || []),
    state.player
  ];
  entities.forEach(entity => {
    const x = Math.round(entity.x - state.cameraX);
    if (x + entity.w < -20 || x > VIEW_W + 20) return;
    const y = Math.round(entity.y);
    ctx.strokeStyle = entity === state.player ? '#00ff9c' : '#ff3b3b';
    ctx.strokeRect(x + .5, y + .5, Math.round(entity.w) - 1, Math.round(entity.h) - 1);
    const pivotX = Math.round(x + entity.w / 2);
    const pivotY = Math.round(y + entity.h);
    ctx.fillStyle = '#ffe600';
    ctx.fillRect(pivotX - 1, pivotY - 1, 3, 3);
    const label = debugLabels.get(entity);
    if (label) {
      const textW = Math.ceil(ctx.measureText(label).width) + 4;
      ctx.fillStyle = 'rgba(0, 0, 0, .6)';
      ctx.fillRect(Math.round(pivotX - textW / 2), y - 10, textW, 9);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(label, pivotX, y - 3);
    }
  });
  // Bục một chiều (E6–E7): xanh lơ; bục gắn hazard chưa xuất hiện thì bỏ.
  ctx.strokeStyle = '#3ce0e0';
  state.platforms.forEach(platform => {
    if (platform.attached && !(platform.attached.alive && platform.attached.active)) return;
    const x = Math.round(platform.x - state.cameraX);
    if (x + platform.w < -20 || x > VIEW_W + 20) return;
    ctx.strokeRect(x + .5, Math.round(platform.y) + .5, Math.round(platform.w) - 1, platform.h - 1);
  });
  state.items.filter(item => !item.collected).forEach(item => {
    const x = Math.round(item.x - state.cameraX);
    ctx.strokeStyle = '#4fa3ff';
    ctx.strokeRect(x - ITEM_HITBOX.w / 2 + .5, Math.round(item.y) - ITEM_HITBOX.h / 2 + .5, ITEM_HITBOX.w - 1, ITEM_HITBOX.h - 1);
  });
  ctx.strokeStyle = 'rgba(255, 255, 255, .5)';
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y + .5);
  ctx.lineTo(VIEW_W, GROUND_Y + .5);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.fillText(`x ${Math.round(state.player.x)}  cam ${Math.round(state.cameraX)}  GROUND_Y ${GROUND_Y}`, 4, 10);
  const mid = sceneryAt('mid');
  const sky = sceneryAt('sky');
  ctx.fillText(`zone ${LEVEL.zones[zoneIndexAt(state.cameraX + VIEW_W / 2)].id}  mid ${mid.to ? `${mid.from}>${mid.to} ${mid.t.toFixed(2)}` : mid.from}  sky ${sky.to ? `>${sky.to} ${sky.t.toFixed(2)}` : sky.from}`, 4, 19);
  ctx.restore();
}
