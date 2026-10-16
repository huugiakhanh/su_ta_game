// Sát thương lên người chơi: trúng đòn, rơi hố, miễn thương. Mọi nguồn gây
// sát thương (vật cản, hazard, quân, đạn, boss của chương) đi qua đây.

import { state } from './state.js';
import { showMessage } from './ui.js';
import { groundYAt } from './geometry.js';
import { CHUNK_W, HURT_ANIMATION_TIME } from './config.js';
import { CHAPTER } from './chapter.js';
import { playSfx } from './audio.js';
import { endGame } from './end-game.js';

// Miễn sát thương từ lính, hazard và đạn: đang nhấp nháy sau khi trúng đòn,
// hoặc đang dash (dash bất tử tạm thời — quyết định team 25/09). Vật cản tĩnh
// (`obstacles`) KHÔNG dùng hàm này: dash vẫn chỉ xuyên được loại requiresDash.
export function playerImmune(p) {
  return p.invulnerable > 0 || p.dashing;
}

export function hurtPlayer(reason) {
  const p = state.player;
  if (p.invulnerable > 0 || state.won) return;
  playSfx('hurt');
  state.health -= 1;
  state.stats.hitsTaken += 1;
  state.score = Math.max(0, state.score - 50);
  p.invulnerable = 1.25;
  p.hurtTimer = HURT_ANIMATION_TIME;
  p.dashing = false;
  p.dashTimer = 0;
  p.vy = -198;
  p.vx = -138 * p.facing;
  // Kỹ năng bị động của chương đếm thời gian kể từ lần trúng đòn gần nhất
  // (Trưng Trắc: Ý chí kiên cường).
  if (state.skills) CHAPTER.skills.onPlayerHurt?.();
  showMessage(reason);
  if (state.health <= 0) endGame(false);
}

export function respawnAfterFall() {
  const p = state.player;
  playSfx('fall');
  state.health -= 1;
  state.stats.hitsTaken += 1;
  if (state.health <= 0) {
    endGame(false);
    return;
  }
  const chunkStart = Math.floor(p.x / CHUNK_W) * CHUNK_W;
  p.x = Math.max(48, chunkStart + 72);
  p.y = groundYAt(p.x + p.w / 2) - p.normalH;
  p.h = p.normalH;
  p.dashing = false;
  p.dashTimer = 0;
  p.vx = 0;
  p.vy = 0;
  p.invulnerable = 1.5;
  showMessage(CHAPTER.text.fell);
}
