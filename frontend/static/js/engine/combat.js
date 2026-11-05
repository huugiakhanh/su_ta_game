// Đòn đánh trúng mục tiêu: quân địch (enemy) và hazard có máu. Dùng chung
// cho đòn chém của người chơi và đòn kỹ năng của chương (strike()).

import { state, enemyArtKey } from './state.js';
import { showMessage } from './ui.js';
import { setAnim } from './animation.js';
import { CHAPTER } from './chapter.js';
import { playSfx } from './audio.js';
import { groundYAt } from './geometry.js';
import { HEAL_PICKUP } from './config.js';

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
// `damage`: số hp mất (mặc định 1; > 1 khi chí mạng — BT-ENGINE E4).
export function strikeEnemy(enemy, damage = 1) {
  const kind = CHAPTER.enemyKinds?.[enemy.kind];
  if (kind?.blockStrike?.(enemy)) return;
  enemy.hp -= damage;
  enemy.hitTimer = .18;
  playSfx(enemy.hp > 0 ? 'hit' : 'enemyDie');
  if (!enemy.harmless) state.score += enemy.boss ? 150 : 100;
  if (kind?.onStruck) {
    kind.onStruck(enemy, damage);
    return;
  }
  if (enemy.hp > 0) return;
  // Tắt va chạm ngay; animation death phát nốt rồi mới xoá (updateEnemies).
  enemy.alive = false;
  enemy.dying = true;
  enemy.action = null;
  setAnim(enemy, 'death');
  if (enemy.harmless) return;
  // Vật phẩm `carrier` = id enemy (mini-boss rơi sách — TQP-L1).
  if (enemy.id) revealCarriedItems(enemy);
  dropHeal(enemy);
  state.score += enemy.boss ? 700 : 250;
  // Quân ra thành đợt đông (art không có defeatMessage) — không thông báo từng con.
  const message = enemy.boss ? CHAPTER.text.bossDefeated : CHAPTER.sprites.enemies[enemyArtKey(enemy)]?.defeatMessage;
  if (message) showMessage(message);
}

export function strikeHazard(hazard, damage = 1) {
  hazard.hp -= damage;
  hazard.hitTimer = .18;
  playSfx(hazard.hp > 0 ? 'hit' : 'enemyDie');
  state.score += hazard.hitScore ?? 100;
  if (hazard.hp <= 0) breakHazard(hazard);
}

// Đòn kỹ năng trúng 1 mục tiêu (enemy hoặc hazard).
export function strike(target, damage = 1) {
  if (state.enemies.includes(target)) strikeEnemy(target, damage);
  else strikeHazard(target, damage);
}

// Sát thương 1 đòn chém của người chơi lên `target` (BT-ENGINE E4): chương
// quyết qua `CHAPTER.skills.attackDamage(target)` -> số hoặc { damage, crit }
// (chỉ ở màn bật khe kỹ năng). Không có hook = 1, không chí mạng.
export function attackDamage(target) {
  const result = state.skills ? CHAPTER.skills.attackDamage?.(target) : null;
  if (typeof result === 'number') return { damage: result, crit: false };
  return { damage: result?.damage ?? 1, crit: Boolean(result?.crit) };
}

// Đòn chém của người chơi trúng `target`: tính sát thương (có thể chí mạng),
// trừ máu; chí mạng thì phát tiếng `crit` (nếu chương khai báo) và gọi
// `CHAPTER.hooks.onCrit(target)` để chương tự vẽ hiệu ứng/chữ.
// `multiplier` > 1 = đánh úp (TQP-ENGINE E7): nhân sát thương, gọi
// `CHAPTER.hooks.onAmbush(target)` để chương vẽ hiệu ứng.
export function playerStrike(target, strikeFn, multiplier = 1) {
  const { damage, crit } = attackDamage(target);
  strikeFn(target, damage * multiplier);
  if (multiplier > 1) CHAPTER.hooks?.onAmbush?.(target);
  if (!crit) return;
  if (CHAPTER.audio?.sfx?.crit) playSfx('crit');
  CHAPTER.hooks?.onCrit?.(target);
}

// Mục tiêu chỉ trúng đòn bổ từ trên (TQP-ENGINE E5 — lính giáo dài): cờ
// `plungeOnly` trên sprite enemy (CHAPTER.sprites.enemies[art]) hoặc hazard.
export function plungeOnly(target) {
  const spec = state.enemies.includes(target)
    ? CHAPTER.sprites.enemies[enemyArtKey(target)]
    : CHAPTER.sprites.hazards[target.sprite];
  return Boolean(spec?.plungeOnly);
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
  revealCarriedItems(hazard);
  dropHeal(hazard);
  const spec = CHAPTER.sprites.hazards[hazard.sprite];
  if (hazard.boss && !spec?.corpse) playSfx('bossDefeat');
  showMessage(spec?.breakMessage ?? CHAPTER.text.hazardDefeated);
}

// Vật phẩm `carrier` = hazard này (LND-ENGINE E4a) hiện ra tại tâm hazard, cao
// `lift` như lúc đặt (x kẹp trong màn). Gọi khi hazard bị phá hoặc rời màn.
export function revealCarriedItems(hazard) {
  state.items.forEach(item => {
    if (!item.hidden || item.carrier !== hazard.id) return;
    item.hidden = false;
    item.x = Math.max(24, Math.min(state.finishX - 24, hazard.x + hazard.w / 2));
    item.y = groundYAt(item.x) - item.lift;
  });
}

// Bình máu rơi khi hạ địch (LND-ENGINE E4b): chương quyết qua
// `CHAPTER.hooks.dropHeal(target)` (true = rơi 1 bình). Không có hook = không rơi.
function dropHeal(target) {
  if (!CHAPTER.hooks?.dropHeal?.(target)) return;
  state.pickups.push({
    x: target.x + target.w / 2 - HEAL_PICKUP.w / 2,
    y: target.y + target.h / 2 - HEAL_PICKUP.h / 2,
    w: HEAL_PICKUP.w, h: HEAL_PICKUP.h, vy: 0, life: HEAL_PICKUP.life
  });
}
