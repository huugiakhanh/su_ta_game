// Lớp debug (F2): hitbox (đỏ; người chơi xanh), pivot bottom-center (vàng),
// nhãn animation + ô đang vẽ phía trên entity, vạch GROUND_Y. Không đụng state.
// Hộp riêng của chương (vd. hũ dầu, lửa, bóng kỹ năng): CHAPTER.hooks.debugEntities.

import { state } from '../state.js';
import { playerHidden } from '../damage.js';
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
  // Công tắc ẩn của bẫy rơi (LND-ENGINE E3): vạch cam trên mặt đất.
  ctx.fillStyle = '#ff9f1c';
  state.hazards.forEach(hazard => {
    if (hazard.kind !== 'snare' || hazard.snareState !== 'idle') return;
    const center = hazard.x + hazard.w / 2 - state.cameraX;
    ctx.fillRect(Math.round(center - hazard.triggerWidth / 2), Math.round(hazard.floorY) - 2, Math.round(hazard.triggerWidth), 2);
  });
  // Dải sình (TQP-ENGINE E1): nâu; vùng ẩn nấp (E7): xanh lá.
  ctx.strokeStyle = '#c8873a';
  state.mud.forEach(span => {
    ctx.strokeRect(Math.round(span.x - state.cameraX) + .5, GROUND_Y - 10.5, Math.round(span.w) - 1, 12);
  });
  ctx.strokeStyle = '#5fdc5f';
  state.covers.forEach(cover => {
    ctx.strokeRect(Math.round(cover.x - state.cameraX) + .5, GROUND_Y - 60.5, Math.round(cover.w) - 1, 60);
  });
  // Khói trôi (E2): vạch quãng trôi; cá sấu (E3): vạch tầm kích hoạt; gọi viện (E4): đồng hồ.
  state.hazards.forEach(hazard => {
    if (!hazard.alive) return;
    if (hazard.kind === 'drift') {
      const from = hazard.originX + hazard.w / 2 - state.cameraX;
      const to = from + Math.sign(hazard.speed || -1) * hazard.travel;
      ctx.fillStyle = '#9fd36b';
      ctx.fillRect(Math.round(Math.min(from, to)), Math.round(hazard.baseY) + 1, Math.round(Math.abs(to - from)), 1);
    }
    if (hazard.kind === 'lurker') {
      const center = hazard.x + hazard.w / 2 - state.cameraX;
      ctx.fillStyle = '#4fd1ff';
      ctx.fillRect(Math.round(center - hazard.triggerRange), GROUND_Y + 2, Math.round(hazard.triggerRange * 2), 1);
    }
    // Thú vồ (MHD-ENGINE E2): vạch tầm kích hoạt, chấm điểm rơi.
    if (hazard.kind === 'pounce') {
      const center = hazard.x + hazard.w / 2 - state.cameraX;
      ctx.fillStyle = '#ffb347';
      ctx.fillRect(Math.round(center - hazard.triggerRange), GROUND_Y + 2, Math.round(hazard.triggerRange * 2), 1);
      if (hazard.pounceState === 'leap') ctx.fillRect(Math.round(hazard.leapTo - state.cameraX) - 2, GROUND_Y - 3, 4, 4);
    }
    // Vật nằm lại (E3): giây còn lại.
    if (hazard.life !== undefined) {
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`${hazard.life.toFixed(1)}s`, Math.round(hazard.x + hazard.w / 2 - state.cameraX), Math.round(hazard.y) - 4);
    }
    if (hazard.callHelp && !hazard.helpCalled) {
      const left = (hazard.callHelp.after - hazard.helpTimer).toFixed(1);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`viện ${left}s`, Math.round(hazard.x + hazard.w / 2 - state.cameraX), Math.round(hazard.y) - 14);
    }
  });
  const p = state.player;
  if (p.mudTime > 0 || playerHidden(p)) {
    ctx.fillStyle = '#ffffff';
    ctx.fillText(playerHidden(p) ? 'ẨN' : `sình ${p.mudTime.toFixed(1)}s`, Math.round(p.x + p.w / 2 - state.cameraX), Math.round(p.y) - 14);
  }
  // Đòn gồng, cưỡi (PH-ENGINE E1–E2): số giây; mồi nhử (E4): khung vàng.
  ctx.fillStyle = '#ffffff';
  if (p.chargeTime > 0) ctx.fillText(`gồng ${p.chargeTime.toFixed(1)}s`, Math.round(p.x + p.w / 2 - state.cameraX), Math.round(p.y) - 24);
  if (p.mounted) ctx.fillText(`cưỡi ${state.mount.time.toFixed(1)}s`, Math.round(p.x + p.w / 2 - state.cameraX), Math.round(p.y) - 24);
  ctx.strokeStyle = '#ffe600';
  state.decoys.filter(decoy => decoy.up).forEach(decoy => {
    ctx.strokeRect(Math.round(decoy.x - decoy.w / 2 - state.cameraX) + .5, Math.round(decoy.footY - decoy.h) + .5, decoy.w - 1, decoy.h - 1);
  });
  // Bục một chiều (E6–E7): xanh lơ; bục gắn hazard chưa xuất hiện thì bỏ.
  ctx.strokeStyle = '#3ce0e0';
  state.platforms.forEach(platform => {
    if (platform.attached && !(platform.attached.alive && platform.attached.active)) return;
    const x = Math.round(platform.x - state.cameraX);
    if (x + platform.w < -20 || x > VIEW_W + 20) return;
    ctx.strokeRect(x + .5, Math.round(platform.y) + .5, Math.round(platform.w) - 1, platform.h - 1);
  });
  ctx.strokeStyle = '#ff6fae';
  state.pickups.forEach(pickup => {
    ctx.strokeRect(Math.round(pickup.x - state.cameraX) + .5, Math.round(pickup.y) + .5, pickup.w - 1, pickup.h - 1);
  });
  state.items.filter(item => !item.collected && !item.hidden).forEach(item => {
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
