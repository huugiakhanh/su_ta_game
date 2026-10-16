// Đòn đánh trúng mục tiêu: quân địch (enemy) và hazard có máu. Dùng chung
// cho đòn chém của người chơi và đòn kỹ năng của chương (strike()).

import { state, enemyArtKey } from './state.js';
import { showMessage } from './ui.js';
import { setAnim } from './animation.js';
import { CHAPTER } from './chapter.js';
import { playSfx } from './audio.js';

// Vùng mũi giáo của một thân người (người chơi, bóng kỹ năng): dải 48px ngay
// trước mặt theo `facing`.
export function spearBox(body, facing) {
  return {
    x: facing > 0 ? body.x + body.w : body.x - 48,
    y: body.y + 7,
    w: 48,
    h: Math.max(25, body.h - 10)
  };
}

// Một đòn trúng enemy (chém, đòn kỹ năng). KHÔNG xét hitTimer — đòn chém
// thường tự chặn khi hitTimer > 0; đòn phụ của kỹ năng thì không (để cộng thêm
// đòn trong cùng lúc). Bao cát (`harmless`) không cho điểm.
// Enemy có `kind` riêng của chương (CHAPTER.enemyKinds): `blockStrike` chặn
// đòn (vd. chiến xa còn khiên), `onStruck` thay phần xử lý trúng đòn/hết máu.
export function strikeEnemy(enemy) {
  const kind = CHAPTER.enemyKinds?.[enemy.kind];
  if (kind?.blockStrike?.(enemy)) return;
  enemy.hp -= 1;
  enemy.hitTimer = .18;
  playSfx(enemy.hp > 0 ? 'hit' : 'enemyDie');
  if (!enemy.harmless) state.score += enemy.boss ? 150 : 100;
  if (kind?.onStruck) {
    kind.onStruck(enemy);
    return;
  }
  if (enemy.hp > 0) return;
  // Tắt va chạm ngay; animation death phát nốt rồi mới xoá (updateEnemies).
  enemy.alive = false;
  enemy.dying = true;
  enemy.action = null;
  setAnim(enemy, 'death');
  if (enemy.harmless) return;
  state.score += enemy.boss ? 700 : 250;
  // Quân ra thành đợt đông (art không có defeatMessage) — không thông báo từng con.
  const message = enemy.boss ? CHAPTER.text.bossDefeated : CHAPTER.sprites.enemies[enemyArtKey(enemy)]?.defeatMessage;
  if (message) showMessage(message);
}

export function strikeHazard(hazard) {
  hazard.hp -= 1;
  hazard.hitTimer = .18;
  playSfx(hazard.hp > 0 ? 'hit' : 'enemyDie');
  state.score += hazard.hitScore ?? 100;
  if (hazard.hp <= 0) breakHazard(hazard);
}

// Đòn kỹ năng trúng 1 mục tiêu (enemy hoặc hazard).
export function strike(target) {
  if (state.enemies.includes(target)) strikeEnemy(target);
  else strikeHazard(target);
}

// Hazard hết máu: tắt va chạm/đạn/di chuyển NGAY, phát death (break) một lần.
// Loại `corpse` (vd. xe cống) đứng ở ô cuối và nằm lại map, vô hại; loại khác
// xoá khi animation phát xong (hazards.js). Thông báo: `breakMessage` của sprite
// hoặc CHAPTER.text.hazardDefeated; hazard `boss` phát thêm tiếng hạ boss.
export function breakHazard(hazard) {
  state.score += hazard.defeatScore ?? 250;
  hazard.alive = false;
  hazard.dying = true;
  hazard.harmful = false;
  hazard.speed = 0;
  hazard.projectile = null;
  hazard.action = null;
  setAnim(hazard, 'death');
  const spec = CHAPTER.sprites.hazards[hazard.sprite];
  if (hazard.boss && !spec?.corpse) playSfx('bossDefeat');
  showMessage(spec?.breakMessage ?? CHAPTER.text.hazardDefeated);
}
