// Màn 2 "Dựng cờ Vạn An" (MHD-L2, docs/SUTA_MHD_TASK_L2_01.md): 10 chunk ĐẶT CỐ
// ĐỊNH — đường Hoan Châu (1–3) -> đồng Sa Nam, dãy Hùng Sơn (4–6) -> bờ sông Lam
// (7–10). Thứ tự: câu hỏi + Mẹ Mai Thúc Loan (chunk 3, cần 3 sách) -> câu hỏi +
// Thúc Bảo (chunk 6, cần 6) -> câu hỏi + Sứ giả Lâm Ấp (chunk 10, cần 10)
// -> đích cuối chunk 10. Mỗi NPC 2 lính áp giải vây. 10 Quyển Sách Tinh Hoa chia
// 3 / 3 / 4 (7 cố định + 2 trong xe cống + 1 lính mang). Xe cống màn 2 không thả
// dân phu (Q2). Chướng ngại dùng lại bộ dựng màn 1. Mọi số DESIGN_BASELINE.

import { makeEnemy, makeNpc, makeQuiz, makeItem, pick, checkTerrainFootprints, checkNpcClearance } from '../../engine/entities.js';
import { QUIZ, SOLDIER, LEVEL2_NPCS, CAPTORS, LEVEL2_ITEMS, LEVEL2_LAYOUT, CART_GUARD } from './config.js';
import { NPC_QUESTION_POOLS } from './questions-data.js';
import {
  makeSoldier, makeCart, makeBushArcher, makeJavelinTower, makeBoulder, makeTigerCave, makeCavalry, updateCavalry
} from './level1.js';

const L = LEVEL2_LAYOUT;

// Quân vây NPC: lính áp giải tuần trong đoạn [min, max] quanh tâm NPC.
function makeCaptors(npc) {
  return CAPTORS.map(side => ({
    ...makeEnemy(npc.centerX + side.dx - SOLDIER.w / 2, SOLDIER.w, SOLDIER.h, SOLDIER.hp, false, {
      patrolMin: npc.centerX + side.patrol[0], patrolMax: npc.centerX + side.patrol[1]
    }),
    captorOf: npc.id
  }));
}

// Gộp kết quả các bộ dựng { hazards, bushes?, caves? }.
function collect(builds) {
  return {
    hazards: builds.flatMap(built => built.hazards || []),
    bushes: builds.flatMap(built => built.bushes || []),
    caves: builds.flatMap(built => built.caves || [])
  };
}

export function level2Content() {
  const npcs = Object.entries(LEVEL2_NPCS).map(([id, [chunk, localX, requires]]) => makeNpc(id, chunk, localX, { requires }));
  // Xe cống chở sách (không thả dân phu) + 1 lính áp giải đứng sau xe.
  const carts = L.carts.map(([chunk, localX]) => {
    const id = `mhd2-book-cart-${chunk}`;
    return {
      hazard: makeCart(chunk, localX, { id, frees: 0 }),
      guard: makeSoldier(chunk, localX + CART_GUARD.guardDx),
      item: makeItem(chunk, localX, L.bookLift, { carrier: id })
    };
  });
  // Lính mang sách: hạ mới hiện sách (engine revealCarriedItems theo `id`).
  const carrierId = 'mhd2-book-carrier';
  const built = collect([
    ...L.bushArchers.map(spot => makeBushArcher(...spot)),
    ...L.towers.map(spot => makeJavelinTower(...spot)),
    ...L.boulders.map(spot => makeBoulder(...spot)),
    makeTigerCave(...L.tiger),
    makeCavalry(...L.cavalry)
  ]);
  const content = {
    obstacles: [],
    hazards: [...carts.map(cart => cart.hazard), ...built.hazards],
    holes: [],
    items: [
      ...LEVEL2_ITEMS.map(([chunk, localX, lift]) => makeItem(chunk, localX, lift)),
      ...carts.map(cart => cart.item),
      makeItem(...L.carrier, L.bookLift, { carrier: carrierId })
    ],
    enemies: [
      ...L.escorts.map(spot => makeSoldier(...spot)),
      ...carts.map(cart => cart.guard),
      { ...makeSoldier(...L.carrier), id: carrierId },
      ...npcs.flatMap(makeCaptors)
    ],
    npcs,
    // Câu hỏi chặn đường trước mỗi NPC: 1 câu rút ngẫu nhiên trong bộ của NPC.
    quizzes: npcs.map(npc => makeQuiz(...QUIZ.level2Spots[npc.id], pick(NPC_QUESTION_POOLS[npc.id]), npc.id)),
    bushes: built.bushes,
    caves: built.caves
  };
  checkNpcClearance(content);
  checkTerrainFootprints(content);
  return content;
}

// Sự kiện mỗi frame: kỵ binh báo trước rồi phi ra (như màn 1).
export function level2Events(p, dt) {
  updateCavalry(p, dt);
}
