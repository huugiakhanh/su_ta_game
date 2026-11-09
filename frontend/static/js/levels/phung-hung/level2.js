// Màn 2 "Tụ nghĩa chiêu hiền" (PH-L2, docs/SUTA_PH_TASK_L2_01.md): 10 chunk ĐẶT CỐ
// ĐỊNH — Đường Lâm (1–3) -> đường tiếp tế (4–6) -> ngoại thành Tống Bình (7–10).
// Thứ tự: bia + Phùng Hải (chunk 3, cần 3 sách + 1 vũ khí) -> bia + Đỗ Anh Hàn
// (chunk 6, 6 + 2) -> bia + Bồ Phá Cần (chunk 10, 10 + 3) -> đích cuối chunk 10.
// Mỗi NPC 2 lính vây. 10 sách + 3 Vũ Khí Thô Sơ, một số giấu trong rào hoặc do lính
// khiên mang. Chướng ngại dùng lại bộ dựng màn 1. Mọi số DESIGN_BASELINE.

import { makeHazard, setTerrain, buildTerrain, terrainHoles } from '../../engine/geometry.js';
import {
  makeEnemy, makeNpc, makeQuiz, makeItem, makeExtra, pick, checkTerrainFootprints, checkNpcClearance
} from '../../engine/entities.js';
import { QUIZ, SOLDIER, LEVEL1, LEVEL2_CHUNKS, LEVEL2_NPCS, CAPTORS, LEVEL2 } from './config.js';
import { NPC_QUESTION_POOLS } from './questions-data.js';
import { makeSoldier, makeShield, makeRock, makeTreeHunter, updateRocks } from './level1.js';

// 2 lính vây NPC: tuần trong đoạn [min, max] quanh tâm NPC, `captorOf` giữ hội thoại.
function makeCaptors(npc) {
  return CAPTORS.map(side => ({
    ...makeEnemy(npc.centerX + side.dx - SOLDIER.w / 2, SOLDIER.w, SOLDIER.h, SOLDIER.hp, false, {
      patrolMin: npc.centerX + side.patrol[0], patrolMax: npc.centerX + side.patrol[1]
    }),
    captorOf: npc.id
  }));
}

export function level2Content() {
  const { books, weapons, escorts, shields, rocks, hunters, fences, trench, bookLift } = LEVEL2;
  setTerrain(buildTerrain([{ chunk: trench.chunk, rows: trench.rows }], LEVEL2_CHUNKS));
  const npcs = Object.entries(LEVEL2_NPCS).map(([id, [chunk, localX, requires, weapon]]) => makeNpc(id, chunk, localX, { requires, extras: { weapon } }));
  // Lính khiên mang sách: hạ mới hiện (engine revealCarriedItems theo `id`).
  const shieldUnits = shields.map(([chunk, localX]) => ({
    enemy: makeShield(chunk, localX, LEVEL1.shield.hp, { id: `ph2-shield-${chunk}` }),
    item: makeItem(chunk, localX, bookLift, { carrier: `ph2-shield-${chunk}` })
  }));
  // Rào: `hide` = món giấu bên trong; phá rào mới hiện.
  const fenceUnits = fences.map(({ at, hide }) => {
    const id = `ph2-fence-${at[0]}`;
    const options = { carrier: id };
    return {
      hazard: makeHazard('prop', 'barrier', ...at, { hp: 3, id }),
      item: hide === 'book' ? makeItem(...at, bookLift, options) : null,
      extra: hide === 'weapon' ? makeExtra('weapon', ...at, bookLift, options) : null
    };
  });
  const content = {
    obstacles: [],
    hazards: [
      ...fenceUnits.map(unit => unit.hazard),
      ...rocks.flatMap(spot => makeRock(...spot).hazards),
      ...hunters.flatMap(spot => makeTreeHunter(...spot).hazards)
    ],
    holes: terrainHoles(),
    items: [
      ...books.map(([chunk, localX, lift]) => makeItem(chunk, localX, lift)),
      ...shieldUnits.map(unit => unit.item),
      ...fenceUnits.flatMap(unit => (unit.item ? [unit.item] : []))
    ],
    extras: [
      ...weapons.map(([chunk, localX, lift]) => makeExtra('weapon', chunk, localX, lift)),
      ...fenceUnits.flatMap(unit => (unit.extra ? [unit.extra] : []))
    ],
    enemies: [
      ...escorts.map(spot => makeSoldier(...spot)),
      ...shieldUnits.map(unit => unit.enemy),
      ...npcs.flatMap(makeCaptors)
    ],
    npcs,
    // Bia trước mỗi NPC: 1 câu rút ngẫu nhiên trong bộ của NPC (PH-00 §3.3).
    quizzes: npcs.map(npc => makeQuiz(...QUIZ.level2Spots[npc.id], pick(NPC_QUESTION_POOLS[npc.id]), npc.id))
  };
  checkNpcClearance(content);
  checkTerrainFootprints(content);
  return content;
}

// Sự kiện mỗi frame: đá ong hiện khi kích hoạt (như màn 1).
export function level2Events() {
  updateRocks();
}
