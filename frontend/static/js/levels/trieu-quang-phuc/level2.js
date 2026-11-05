// Màn 2 "Hiền tài Dạ Trạch" (TQP-L2, docs/SUTA_TQP_TASK_L2_01.md): 10 chunk ĐẶT
// CỐ ĐỊNH — bờ sông Chu Diên (1–3) -> trung du động Khuất Lão (4–6) -> đầm Dạ
// Trạch ban đêm (7–10). Thứ tự: câu hỏi + Triệu Túc (chunk 3, cần 3 sách) ->
// câu hỏi + Lý Nam Đế (chunk 6, cần 6) -> câu hỏi + Chử Đồng Tử (chunk 10, cần
// 10, rồng vàng hiện sau lưng) -> đích cuối chunk 10. Mỗi NPC 2 lính vây.
// 10 Quyển Sách Tinh Hoa chia 3 / 3 / 4 giữa các đoạn (8 cố định + 2 lính mang).
// Đoạn Dạ Trạch có 2 bụi lau ẩn nấp (TQP-ENGINE E7). Chướng ngại dùng lại màn 1.
// Mọi số DESIGN_BASELINE (config.js).

import { worldX, makeHazard, setTerrain, buildTerrain, terrainHoles } from '../../engine/geometry.js';
import {
  makeEnemy, makeNpc, makeQuiz, makeItem, pick, checkTerrainFootprints, checkNpcClearance, checkPlatformReach
} from '../../engine/entities.js';
import { state } from '../../engine/state.js';
import { GROUND_Y } from '../../engine/config.js';
import {
  QUIZ, SOLDIER, LEVEL2_CHUNKS, LEVEL2_NPCS, CAPTORS, LEVEL2_ITEMS, LEVEL2_CARRIERS, LEVEL2_LAYOUT,
  CROC_RIVER, BOAT_RIVER, MUD_ROWS, SMOKE, TREE, SPEARMAN_POST, DRAGON
} from './config.js';
import { NPC_QUESTION_POOLS } from './questions-data.js';
import { makeSoldier, makeSnake, makeSpikePit, makeLedge, makePost, wakeAmbushers } from './level1.js';

const L = LEVEL2_LAYOUT;

// Quân vây NPC: lính tuần trong đoạn [min, max] quanh tâm NPC.
function makeCaptors(npc) {
  return CAPTORS.map(side => ({
    ...makeEnemy(npc.centerX + side.dx - SOLDIER.w / 2, SOLDIER.w, SOLDIER.h, SOLDIER.hp, false, {
      patrolMin: npc.centerX + side.patrol[0], patrolMax: npc.centerX + side.patrol[1]
    }),
    captorOf: npc.id
  }));
}

// Cung thủ trên cây: cây (prop) đứng trước cung thủ trong danh sách để vẽ sau.
function makeArcherTree(chunk, localX) {
  return [
    makeHazard('prop', 'archerTree', chunk, localX),
    makeHazard('thrower', 'treeArcher', chunk, localX + TREE.archerDx, {
      groundY: GROUND_Y - TREE.deck, projectile: 'crossbowBolt', aim: true,
      fireInterval: TREE.fireInterval, fireRange: TREE.fireRange
    })
  ];
}

// Thuyền tuần trong khe 1 của BOAT_RIVER (thổi tù và gọi quân).
function makeWarBoat(chunk) {
  return makeHazard('thrower', 'warBoat', chunk, BOAT_RIVER.boatX, {
    groundY: GROUND_Y, floatY: BOAT_RIVER.floatY, harmful: false, hp: BOAT_RIVER.hp,
    projectile: 'fireArrow', aim: true, fireInterval: BOAT_RIVER.fireInterval,
    callHelp: {
      after: BOAT_RIVER.callHelp.after, range: BOAT_RIVER.callHelp.range,
      spawnAt: BOAT_RIVER.callHelp.spawnAt.map(localX => worldX(chunk, localX)),
      enemy: { w: SOLDIER.w, h: SOLDIER.h, hp: SOLDIER.hp }
    }
  });
}

// Lính mang sách: hạ mới hiện sách (engine revealCarriedItems theo `id`).
function makeCarriers() {
  return LEVEL2_CARRIERS.map(([chunk, localX, art], index) => {
    const id = `book-carrier-${index + 1}`;
    return {
      enemy: { ...makeSoldier(chunk, localX, art), id },
      item: makeItem(chunk, localX, 40, { carrier: id })
    };
  });
}

export function level2Content() {
  // Địa hình trước nội dung: khe thuyền (ch2), khe cá sấu (ch8), sình ô a (ch9).
  setTerrain(buildTerrain([
    { chunk: 2, rows: BOAT_RIVER.rows },
    { chunk: 8, rows: CROC_RIVER.rows },
    { chunk: 9, rows: MUD_ROWS.a }
  ], LEVEL2_CHUNKS));
  const npcs = Object.entries(LEVEL2_NPCS).map(([id, [chunk, localX, requires]]) => makeNpc(id, chunk, localX, { requires }));
  const carriers = makeCarriers();
  const hazards = [
    makeSpikePit(...L.spike),
    makeWarBoat(2),
    ...makeArcherTree(...L.tree),
    makeHazard('lurker', 'crocodile', 8, CROC_RIVER.x, { groundY: GROUND_Y, floatY: CROC_RIVER.floatY, hp: 2, triggerRange: 110 }),
    ...SMOKE.map(([offset, lane, speed, travel]) =>
      makeHazard('drift', 'smoke', L.smoke[0], L.smoke[1] + offset, { lane, speed, travel, gap: 1.2, triggerRange: 320 })),
    ...makeArcherTree(...L.tree2)
  ];
  const enemies = [
    makeSoldier(...L.patrol),
    makeSnake(...L.snake),
    ...L.spearmen.filter(([chunk, localX]) => !LEVEL2_CARRIERS.some(([c, x]) => c === chunk && x === localX))
      .map(([chunk, localX]) => makeSoldier(chunk, localX, 'spearman')),
    ...L.coverGuards.map(([chunk, localX]) => makeSoldier(chunk, localX)),
    ...carriers.map(carrier => carrier.enemy),
    ...npcs.flatMap(makeCaptors)
  ];
  // Cọc tre: 1 ở ch1 (sách trên đỉnh) + 1 trước mỗi lính giáo dài để nhảy lên bổ.
  const obstacles = [
    makePost(...L.post),
    ...L.spearmen.map(([chunk, localX]) => makePost(chunk, localX + SPEARMAN_POST.postDx))
  ];
  const platforms = [
    makeLedge(2, BOAT_RIVER.ledge[0], BOAT_RIVER.ledge[1]),
    makeLedge(...L.ledge)
  ];
  const content = {
    obstacles,
    hazards,
    holes: terrainHoles(),
    items: [...LEVEL2_ITEMS.map(([chunk, localX, lift]) => makeItem(chunk, localX, lift)), ...carriers.map(carrier => carrier.item)],
    enemies,
    npcs,
    // Câu hỏi chặn đường trước mỗi NPC: 1 câu rút ngẫu nhiên trong bộ của NPC.
    quizzes: npcs.map(npc => makeQuiz(...QUIZ.level2Spots[npc.id], pick(NPC_QUESTION_POOLS[npc.id]), npc.id)),
    platforms,
    covers: L.covers.map(([chunk, localX, w]) => ({ x: worldX(chunk, localX), w })),
    tufts: [worldX(...L.snake)]
  };
  checkNpcClearance(content);
  checkTerrainFootprints(content);
  checkPlatformReach(content);
  return content;
}

// Sự kiện mỗi frame: rắn phục lao ra; rồng vàng bắt đầu hiện khi đủ sách và
// người chơi tới gần Chử Đồng Tử (`state.dragonTime` = giây từ lúc hiện).
export function level2Events(p, dt) {
  wakeAmbushers(p);
  const npc = state.npcs.find(item => item.id === DRAGON.npc);
  if (!npc) return;
  if (state.dragonTime === null) {
    if (state.itemsCollected >= npc.requires && Math.abs(npc.centerX - (p.x + p.w / 2)) < DRAGON.range) state.dragonTime = 0;
    return;
  }
  state.dragonTime += dt;
}
