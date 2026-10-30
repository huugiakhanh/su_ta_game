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

// `amount`: số máu mất (BT-ENGINE E3 — đòn nặng như búa lính đốn gỗ); thống kê
// `hitsTaken` vẫn chỉ +1 mỗi lần trúng đòn.
export function hurtPlayer(reason, amount = 1) {
  const p = state.player;
  if (p.invulnerable > 0 || state.won) return;
  // Kỹ năng chặn đòn của chương (BT-L3 E1 — Khiên mây tre) -> bỏ qua sát thương.
  if (state.skills && CHAPTER.skills.blockHurt?.(reason)) return;
  playSfx('hurt');
  state.health = Math.max(0, state.health - amount);
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

// Choáng (BT-L3 E2): `time` giây không điều khiển được (player.js), không mất
// máu. Kỹ năng chặn đòn của chương chặn được. Trả về true nếu đã choáng.
export function stunPlayer(reason, time) {
  const p = state.player;
  if (state.won) return false;
  if (state.skills && CHAPTER.skills.blockHurt?.(reason)) return false;
  p.stun = Math.max(p.stun || 0, time);
  showMessage(reason);
  return true;
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
