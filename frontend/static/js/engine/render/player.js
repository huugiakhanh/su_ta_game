// Vẽ người chơi (nhân vật nam/nữ dùng chung — PLAYER_SPRITE_ID).

import { state } from '../state.js';
import { getAnimMeta, frameIndex } from '../animation.js';
import { PLAYER_SPRITE_ID, PLAYER_ANIMATIONS, PLAYER_JUMP_APEX_VY } from '../config.js';
import { ctx, debugLabels, drawSprite, spriteImage } from './canvas.js';

// Ô của animation người chơi cần vẽ (0-based) theo cấu hình PLAYER_ANIMATIONS.
function playerFrame(config, meta, p, animTime) {
  if (config.holdFrame !== undefined) return config.holdFrame < 0 ? meta.frames - 1 : config.holdFrame;
  if (config.byVelocity) {
    // jump 3 ô: bật lên / gần đỉnh / rơi — chọn theo vận tốc dọc, không theo giờ.
    if (p.vy < -PLAYER_JUMP_APEX_VY) return 0;
    return p.vy > PLAYER_JUMP_APEX_VY ? Math.min(2, meta.frames - 1) : Math.min(1, meta.frames - 1);
  }
  return frameIndex(meta, animTime, config.duration);
}

export function drawPlayer(time) {
  const p = state.player;
  const x = Math.round(p.x - state.cameraX);
  const y = Math.round(p.y);
  const dead = p.deathTime !== null && state.health <= 0;
  const blinkHidden = !dead && p.invulnerable > 0 && Math.floor(p.invulnerable * 12) % 2 === 0;

  // Trạng thái animation do player.js chọn (thứ tự ưu tiên hurt > dash >
  // attack > jump > run > idle); thua thì phát `death` một lần.
  const key = dead ? 'death' : (p.anim?.name || 'idle');
  const animTime = dead ? Math.max(0, time - p.deathTime) : (p.anim?.time || 0);
  const config = PLAYER_ANIMATIONS[key];
  const meta = getAnimMeta(PLAYER_SPRITE_ID, config.anim);
  const image = spriteImage(PLAYER_SPRITE_ID, config.anim);

  if (meta && image) {
    const frame = playerFrame(config, meta, p, animTime);
    debugLabels.set(p, `${key}:${config.anim} ${frame + 1}/${meta.frames}`);
    if (blinkHidden) return;
    const pivotX = Math.round(p.x + p.w / 2 - state.cameraX);
    const footY = Math.round(p.y + p.h);
    const facing = p.facing < 0 ? -1 : 1;
    drawSprite(image, meta, frame, pivotX, footY, facing);
    return;
  }

  // Thiếu manifest/strip: hộp placeholder đúng bằng hitbox (như Phase 1).
  debugLabels.set(p, `${key} (placeholder)`);
  if (blinkHidden) return;
  const colors = { hurt: '#e0564a', dash: '#6fc3e8', attack: '#f0c859', jump: '#c9853f', run: '#a8322c', idle: '#8b2820', death: '#3a2a22' };
  ctx.fillStyle = '#2b1710';
  ctx.fillRect(x, y, p.w, p.h);
  ctx.fillStyle = colors[key];
  ctx.fillRect(x + 1, y + 1, p.w - 2, p.h - 2);
  const headX = p.facing > 0 ? x + p.w - 11 : x + 3;
  ctx.fillStyle = '#c98c61';
  ctx.fillRect(headX, y + 3, 8, 8);
  if (p.attacking) {
    ctx.fillStyle = '#d7d5c8';
    ctx.fillRect(p.facing > 0 ? x + p.w : x - 48, y + 14, 48, 3);
  }
}
