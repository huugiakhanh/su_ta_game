// Màn 3 "Trận Luy Lâu" (TT-BOSS-01 §3.1): đấu trường 1 chunk, cổng đóng, 2 cột
// đá. Không sách/hố/hazard/NPC. Dựng nội dung + quân đấu trường; diễn biến
// trận boss ở boss.js.

import { makeObstacle } from '../../engine/geometry.js';
import { makeEnemy, makeSpawner } from '../../engine/entities.js';
import { state } from '../../engine/state.js';
import { ARENA, RUSHER, SKILL_TEST, BOSS_TD, WALL_ARROWS, OBSTACLE_TYPES } from './config.js';

// Lính canh trong đấu trường: đoạn tuần tra [40, width − 40], phát hiện người
// chơi ở mọi chỗ -> truy đuổi khắp đấu trường.
export function makeArenaGuard(centerX) {
  return makeEnemy(centerX - 11, 22, 40, 2, false, {
    patrolMin: 40, patrolMax: ARENA.width - 40, aggroRange: ARENA.width
  });
}

// Quân cảm tử (TT-BOSS-01 §3.3): `direction` = hướng chạy hiện tại; `rest` =
// thời gian nghỉ còn lại sau cú đâm. Hành vi `rusher` của engine (enemies.js).
export function makeRusher(centerX, direction) {
  return {
    ...makeEnemy(centerX - RUSHER.w / 2, RUSHER.w, RUSHER.h, RUSHER.hp, false),
    art: 'rusher', facing: direction, direction, rest: 0, walking: true
  };
}

// Bao cát (layout thử): đứng yên, không gây sát thương, không cho điểm.
function makeDummy(centerX) {
  return {
    ...makeEnemy(centerX - 11, 22, 40, SKILL_TEST.dummyHp, false),
    art: 'dummy', harmless: true, walking: false
  };
}

// Quân ra từ cổng (đợt thân binh, layout thử, quân cảm tử giai đoạn 3): quân
// cảm tử chạy về phía người chơi, lính canh đuổi khắp đấu trường.
export function spawnArenaEnemy(entry, centerX) {
  const p = state.player;
  const direction = Math.sign(p.x + p.w / 2 - centerX) || -1;
  return entry.type === 'rusher' ? makeRusher(centerX, direction) : makeArenaGuard(centerX);
}

// Hàng đợi sinh quân ở cổng (ARENA.spawnX). `sfx` khi mỗi đợt bắt đầu (trận thật).
export function makeArenaSpawner(groups, gap, loop, sfx = null) {
  return makeSpawner(groups, gap, loop, { spawn: spawnArenaEnemy, x: ARENA.spawnX, sfx });
}

// Cột đá đấu trường: vật cản tĩnh + cờ `blocking` (Q1) + trạng thái ô vẽ
// (`intact` -> `cracked` khi chiến xa đâm).
function makePillar(centerX) {
  const obstacle = makeObstacle('stonePillar', 1, centerX - ARENA.pillarW / 2, ARENA.pillarW, ARENA.pillarH);
  return { ...obstacle, blocking: Boolean(OBSTACLE_TYPES.stonePillar.blocking), state: 'intact' };
}

// Chiến xa Tô Định (giai đoạn 1, TT-BOSS-01 §3.5): enemy boss 90x80, KHÔNG có
// máu thường — `shield` nấc khiên (hp giữ bằng shield để thanh máu/ô F2 đọc).
// Máy trạng thái ở boss.js (updateChariot): mode throw -> warn -> charge ->
// stun | wall -> throw... `corpse`: hết khiên thì xác xe nằm lại.
function makeChariot() {
  const enemy = makeEnemy(BOSS_TD.startX - BOSS_TD.w / 2, BOSS_TD.w, BOSS_TD.h, BOSS_TD.shield, true);
  return {
    ...enemy,
    art: 'boss', kind: 'chariot', corpse: true, noBar: true,
    shield: BOSS_TD.shield, shielded: true,
    facing: -1, direction: -1,
    mode: 'throw', modeTime: 0,
    throwsLeft: BOSS_TD.throwCount, throwTimer: BOSS_TD.startDelay,
    // Cú ném đang diễn { time, released } hoặc null.
    action: null
  };
}

// Tô Định đi bộ ở giai đoạn 3 (TT-BOSS-01 §3.7): boss 22x40, BOSS_TD.foot.hp máu
// (5 — team 27/09), không tấn công (`passive` — chạm vào không mất máu). Hành vi
// ở boss.js (updateFoot).
export function makeToDinhFoot(centerX) {
  const { w, h, hp } = BOSS_TD.foot;
  return {
    ...makeEnemy(centerX - w / 2, w, h, hp, true),
    art: 'bossFoot', kind: 'foot', passive: true, facing: -1,
    disarmed: false, fleeing: false, pendingPush: 0
  };
}

// Nội dung màn 3. `options.layout === 'skills'` -> layout thử kỹ năng: bao cát
// + các nhóm lính sinh lần lượt (SKILL_TEST), không boss. Màn thường: chiến xa
// Tô Định (giai đoạn 1) -> 3 đợt thân binh (giai đoạn 2) -> giai đoạn 3.
// `battle` = tiến trình trận boss.
export function level3Content(options) {
  const testSkills = options.layout === 'skills';
  const chariot = testSkills ? null : makeChariot();
  return {
    obstacles: ARENA.pillars.map(makePillar),
    hazards: [], holes: [], items: [], npcs: [], quizzes: [],
    enemies: testSkills ? [makeDummy(SKILL_TEST.dummyX)] : [chariot],
    spawner: testSkills ? makeArenaSpawner(SKILL_TEST.groups, SKILL_TEST.gap, true) : null,
    battle: testSkills ? null : {
      phase: 1, phaseTime: 0, chariot,
      // Tô Định đi bộ đứng sau xác xe (giai đoạn 2) — chỉ để vẽ.
      foot: null,
      // Đếm ngược tới lần được hiện lại gợi ý "Khiên quá dày!".
      hintTimer: 0,
      // Giai đoạn 3: Tô Định đánh được + hẹn giờ quân cảm tử.
      todinh: null,
      rusherTimer: 0,
      // Mưa tên trên thành: đếm ngược tới loạt kế tiếp.
      wallTimer: WALL_ARROWS.interval
    }
  };
}
