// Màn 2 "Chiêu mộ hiền tài" (LND-L2, docs/SUTA_LND_TASK_L2_01.md): 9 chunk ĐẶT
// CỐ ĐỊNH: bờ sông Hồng -> làng -> vùng sông nước Chu Diên. Thứ tự: câu hỏi về
// Phạm Tu (chunk 2) -> Phạm Tu (chunk 3) -> câu hỏi về Tinh Thiều (chunk 5) ->
// Tinh Thiều (chunk 6) -> câu hỏi về Triệu Túc (chunk 8) -> cha con Triệu Túc
// (chunk 9) -> về đích cuối chunk 9. Mỗi NPC bị 2 lính Lương vây (CAPTORS).
// Chướng ngại dùng lại cơ chế màn 1 (sông + thuyền + mỏm đá, lưới trúc, tháp
// canh, quan thu thuế, chó săn). Mọi số DESIGN_BASELINE.

import { worldX, makeHazard, setTerrain, buildTerrain, terrainHoles } from '../../engine/geometry.js';
import {
  makeEnemy, makeNpc, makeQuiz, makeItem, makePlatform, pick, checkTerrainFootprints, checkNpcClearance, checkPlatformReach
} from '../../engine/entities.js';
import { LEVEL } from '../../engine/chapter.js';
import { GROUND_Y } from '../../engine/config.js';
import {
  QUIZ, SOLDIER, HOUND, NET, RIVER, TOWER, ROCK_LEDGE, CAPTORS, LEVEL2_NPC_BOOKS, LEVEL2_ITEMS, LEVEL2_CARRIERS
} from './config.js';
import { NPC_QUESTION_POOLS } from './questions-data.js';

// Khe sông chunk 2 và 7: lưới địa hình `RIVER` của màn 1 (khe 1 có thuyền, khe 2
// có mỏm đá). Quanh NPC (local 560) và bia câu hỏi giữ đất phẳng.
const RIVER_CHUNKS = [2, 7];

function makeSoldier(chunk, localX) {
  return makeEnemy(worldX(chunk, localX) - SOLDIER.w / 2, SOLDIER.w, SOLDIER.h, SOLDIER.hp, false);
}

function makeHound(chunk, localX) {
  return {
    ...makeEnemy(worldX(chunk, localX) - HOUND.w / 2, HOUND.w, HOUND.h, HOUND.hp, false),
    art: 'hound', facing: -1, direction: -1, rest: 0, walking: true
  };
}

function makeNet(chunk, localX) {
  return makeHazard('snare', 'netTrap', chunk, localX, { dropHeight: NET.dropHeight, triggerWidth: NET.triggerWidth });
}

function makeWarBoat(chunk) {
  return makeHazard('thrower', 'warBoat', chunk, RIVER.boatX, {
    groundY: GROUND_Y, floatY: RIVER.floatY, harmful: false,
    projectile: 'fireArrow', aim: true, fireInterval: RIVER.fireInterval
  });
}

// Quân vây NPC (engine giải cứu đếm enemy `captorOf`): lính Lương tuần tra
// trong đoạn [min, max] quanh tâm NPC.
function makeNpcCaptors(npc) {
  return CAPTORS[npc.id].map(side => ({
    ...makeEnemy(npc.centerX + side.dx - SOLDIER.w / 2, SOLDIER.w, SOLDIER.h, SOLDIER.hp, false, {
      patrolMin: npc.centerX + side.patrol[0], patrolMax: npc.centerX + side.patrol[1]
    }),
    captorOf: npc.id
  }));
}

export function level2Content() {
  setTerrain(buildTerrain(RIVER_CHUNKS.map(chunk => ({ chunk, rows: RIVER.rows })), LEVEL.chunks));
  const npcs = [
    makeNpc('phamTu', 3, 560, { requires: LEVEL2_NPC_BOOKS.phamTu }),
    makeNpc('tinhThieu', 6, 560, { requires: LEVEL2_NPC_BOOKS.tinhThieu }),
    makeNpc('trieuTuc', 9, 560, { requires: LEVEL2_NPC_BOOKS.trieuTuc })
  ];
  // Quân mang sách: hạ mới hiện sách (engine revealCarriedItems theo `id`).
  const carriers = LEVEL2_CARRIERS.map(([chunk, localX, kind], index) => {
    const id = `book-carrier-${index + 1}`;
    const make = kind === 'hound' ? makeHound : makeSoldier;
    return {
      enemy: { ...make(chunk, localX), id },
      item: makeItem(chunk, localX, 40, { carrier: id })
    };
  });
  const hazards = [
    // chunk 1: lưới trúc
    makeNet(1, 300),
    // chunk 2, 7: thuyền chiến trong khe sông
    ...RIVER_CHUNKS.map(makeWarBoat),
    // chunk 4: quan thu thuế ném xâu tiền chì
    makeHazard('thrower', 'taxman', 4, 440, { projectile: 'leadCoins', fireInterval: 2.8, fireRange: 220, hp: 2 }),
    // chunk 5: tháp canh (vẽ sau) + cung thủ bắn chéo
    makeHazard('prop', 'watchtower', 5, TOWER.localX),
    makeHazard('thrower', 'towerArcher', 5, TOWER.localX, {
      groundY: GROUND_Y - TOWER.deck, projectile: 'crossbowBolt', aim: true,
      fireInterval: TOWER.fireInterval, fireRange: TOWER.fireRange
    }),
    // chunk 6: lưới trúc trước nhóm lính vây Tinh Thiều
    makeNet(6, 200)
  ];
  const enemies = [
    // chó săn chunk 4; lính tuần tiễu chunk 1 và chó săn chunk 8 mang sách
    makeHound(4, 680),
    ...carriers.map(carrier => carrier.enemy),
    ...npcs.flatMap(makeNpcCaptors)
  ];
  // Mỏm đá giữa khe sông thứ 2 của mỗi chunk sông.
  const platforms = RIVER_CHUNKS.map(chunk =>
    makePlatform(chunk, RIVER.ledge[0], RIVER.ledge[1], ROCK_LEDGE.w, { sprite: ROCK_LEDGE.sprite }));
  // Câu hỏi chặn đường trước mỗi NPC: 1 câu rút ngẫu nhiên trong bộ của NPC.
  const quizzes = npcs.map(npc => makeQuiz(...QUIZ.level2Spots[npc.id], pick(NPC_QUESTION_POOLS[npc.id]), npc.id));
  const items = [...LEVEL2_ITEMS.map(([chunk, localX, lift]) => makeItem(chunk, localX, lift)), ...carriers.map(carrier => carrier.item)];
  const content = { obstacles: [], hazards, holes: terrainHoles(), items, enemies, npcs, quizzes, platforms };
  checkNpcClearance(content);
  checkTerrainFootprints(content);
  checkPlatformReach(content);
  return content;
}
