// Màn 3 "Công phá thành Long Biên" (LND-L3, docs/SUTA_LND_TASK_L3_01.md): đấu
// trường 1 chunk dưới chân thành Long Biên. Dựng nội dung + quân; diễn biến trận
// boss ở boss.js.

import { makeEnemy } from '../../engine/entities.js';
import { createAnim } from '../../engine/animation.js';
import { ARENA, SOLDIER, BOSS_TT, SHIELD_GUARD, FIRE_CART, ARENA_SOLDIERS, SKILL_TEST } from './config.js';

// Lính tuần tiễu đấu trường (GĐ 1–2): tuần tra cả đấu trường, thấy người chơi ở
// mọi chỗ (hành vi `guard` của engine).
export function makeArenaSoldier(centerX) {
  return makeEnemy(centerX - SOLDIER.w / 2, SOLDIER.w, SOLDIER.h, SOLDIER.hp, false, {
    patrolMin: 40, patrolMax: ARENA.width - 40, aggroRange: ARENA.width
  });
}

// Cận vệ khiên sắt (GĐ 1): enemy kind `shieldGuard` (boss.js). `turnTimer` đếm
// thời gian người chơi đứng sau lưng; `action` = cú đâm đang diễn { time, hit }.
export function makeShieldGuard(centerX) {
  return {
    ...makeEnemy(centerX - SHIELD_GUARD.w / 2, SHIELD_GUARD.w, SHIELD_GUARD.h, SHIELD_GUARD.hp, false),
    art: 'shieldGuard', kind: 'shieldGuard', walking: true, facing: -1,
    turnTimer: 0, action: null, attackCooldown: .6, blockedTime: 0, corpseTimer: 0
  };
}

// Xe hoả công (GĐ 2): enemy kind `fireCart`. mode burn -> douse -> stalled; hết
// máu -> death (xác nằm lại).
export function makeFireCart(centerX) {
  return {
    ...makeEnemy(centerX - FIRE_CART.w / 2, FIRE_CART.w, FIRE_CART.h, FIRE_CART.hp, false),
    art: 'fireCart', kind: 'fireCart', noBar: true, walking: false,
    facing: -1, direction: -1, mode: 'burn', anim: createAnim('burn')
  };
}

// Tiêu Tư dưới đất (GĐ 3): boss `passive` (chạm thân vô hại; đòn kiếm, tiền vàng
// do boss.js). `run` = đang hoảng loạn chạy tới x { targetX } hoặc null.
export function makeTieuTu(centerX) {
  return {
    ...makeEnemy(centerX - BOSS_TT.w / 2, BOSS_TT.w, BOSS_TT.h, BOSS_TT.hp, true),
    art: 'tieuTu', kind: 'tieuTu', passive: true, facing: -1,
    action: null, swordCooldown: .8, throwTimer: 1.2, hitsTaken: 0, run: null, pendingPush: 0
  };
}

// Bao cát (layout thử): đứng yên, không gây sát thương, không cho điểm.
function makeDummy(centerX) {
  return {
    ...makeEnemy(centerX - 11, 22, 40, SKILL_TEST.dummyHp, false),
    art: 'dummy', harmless: true, walking: false
  };
}

// Nội dung màn 3. `options.layout === 'skills'` -> layout thử kỹ năng: bao cát +
// cận vệ + xe hoả công ra lặp, không boss/máy bắn đá (`battle.test`).
// `battle` = tiến trình trận (boss.js).
export function level3Content(options) {
  const test = options.layout === 'skills';
  return {
    obstacles: [], hazards: [], holes: [], items: [], npcs: [], quizzes: [],
    enemies: test ? [makeDummy(SKILL_TEST.dummyX)] : [],
    battle: {
      test, phase: 1, phaseTime: 0,
      // Tiêu Tư trên thành (GĐ 1–2, chỉ vẽ): idle/command, đếm tới lệnh kế.
      commander: test ? null : { anim: createAnim('idle'), timer: BOSS_TT.startDelay, action: null },
      // Máy bắn đá trên thành: idle/fire; `shot` = cú bắn đang diễn { time, targetX, released }.
      catapult: test ? null : { anim: createAnim('idle'), shot: null },
      // Tiêu Tư đang rơi từ thành (GĐ 3, chỉ vẽ) rồi thành enemy tieuTu.
      drop: null,
      tieuTu: null,
      // Cận vệ / xe: số lượt đã ra, hẹn giờ lượt kế, con đang trận.
      guardsSpawned: 0, guardTimer: SHIELD_GUARD.startDelay, guard: null,
      cartsSpawned: 0, cartTimer: FIRE_CART.startDelay, cart: null,
      soldierTimer: ARENA_SOLDIERS.startDelay,
      // Gợi ý khiên / lửa — đếm ngược tới lần được hiện lại.
      hintTimer: 0,
      // Đá máy bắn đá, tiền vàng đang bay, tóe lửa trên khiên.
      boulders: [], coins: [], sparks: []
    }
  };
}
