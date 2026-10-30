// Màn 3 "Chiến lũy Bồ Điền" (BT-L3, docs/SUTA_BT_TASK_L3_01.md): đấu trường 1
// chunk, đài chỉ huy (Lục Dận đứng trên), 3 tháp vàng. Dựng nội dung + quân;
// diễn biến trận boss ở boss.js.

import { makeEnemy } from '../../engine/entities.js';
import { createAnim } from '../../engine/animation.js';
import { BOSS_LD, GOLD_TOWER, ARMORED_CAVALRY, ARENA, SKILL_TEST } from './config.js';

// Tháp canh chứa vàng (GĐ 1): đứng yên, quay về người chơi, ném tiền định kỳ
// (boss.js updateGoldTower). `throwTimer` lệch nhịp theo thứ tự tháp; `action` =
// cú ném đang diễn { time, released } hoặc null. Hết máu: đống đổ nằm lại.
function makeGoldTower(centerX, index) {
  return {
    ...makeEnemy(centerX - GOLD_TOWER.w / 2, GOLD_TOWER.w, GOLD_TOWER.h, GOLD_TOWER.hp, false),
    art: 'goldTower', kind: 'goldTower', passive: true, walking: false, facing: -1,
    throwTimer: GOLD_TOWER.startDelay + index * GOLD_TOWER.phase, action: null
  };
}

// Kỵ binh thiết giáp (GĐ 2): ra ở ARENA.spawnX (ngoài mép phải), phi về phía
// người chơi. mode gallop -> blocked (đòn chém bị giáp chặn, vẫn trượt theo
// đà) -> gallop | knockback (voi húc) -> fallen (death + xác nằm). boss.js.
export function makeArmoredCavalry(centerX) {
  return {
    ...makeEnemy(centerX - ARMORED_CAVALRY.w / 2, ARMORED_CAVALRY.w, ARMORED_CAVALRY.h, 1, false),
    art: 'armoredCavalry', kind: 'armoredCavalry', noBar: true, walking: false,
    facing: -1, direction: -1, mode: 'gallop', modeTime: 0, anim: createAnim('gallop')
  };
}

// Lục Dận trong bùn (GĐ 3): boss `passive` (không tấn công, chạm không mất máu).
export function makeLucDan(centerX) {
  return {
    ...makeEnemy(centerX - BOSS_LD.w / 2, BOSS_LD.w, BOSS_LD.h, BOSS_LD.hp, true),
    art: 'lucDan', kind: 'lucDan', passive: true, facing: -1, fleeing: false, pendingPush: 0
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
// kỵ binh thiết giáp ra lặp, không boss/tháp/mưa tên (`battle.test`).
// `battle` = tiến trình trận (boss.js).
export function level3Content(options) {
  const test = options.layout === 'skills';
  const towers = test ? [] : GOLD_TOWER.xs.map(makeGoldTower);
  return {
    obstacles: [], hazards: [], holes: [], items: [], npcs: [], quizzes: [],
    enemies: test ? [makeDummy(SKILL_TEST.dummyX)] : towers,
    battle: {
      test, phase: test ? 2 : 1, phaseTime: 0,
      // Lục Dận trên đài (GĐ 1–2, chỉ vẽ): anim command/idle, đếm tới lệnh bắn kế.
      commander: test ? null : { anim: createAnim('idle'), timer: BOSS_LD.startDelay, action: null },
      // Đài chỉ huy: idle -> shake -> collapse (GĐ 3).
      tower: test ? null : { anim: createAnim('idle'), state: 'idle' },
      // Lục Dận rơi từ sàn đài (GĐ 3 — chỉ vẽ, xong thì thành enemy lucDan).
      fall: null,
      lucDan: null,
      // Kỵ binh: số lượt đã ra, hẹn giờ lượt kế, con đang trận.
      cavalrySpawned: 0, cavalryTimer: test ? 0 : ARMORED_CAVALRY.startDelay, cavalry: null,
      // Gợi ý "giáp quá dày" — đếm ngược tới lần được hiện lại.
      hintTimer: 0,
      // Mưa tên độc + tiền vàng đang bay (boss.js).
      arrows: [], coins: [],
      spawnX: ARENA.spawnX
    }
  };
}
