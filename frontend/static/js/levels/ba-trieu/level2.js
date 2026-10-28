// Màn 2 "Chiêu mộ hiền tài" (BT-L2, docs/SUTA_BT_TASK_L2_01.md): 9 chunk ĐẶT CỐ
// ĐỊNH (như màn 2 chương 1): rừng nứa -> sườn đá -> đầm lầy Bồ Điền. Thứ tự:
// câu hỏi về Triệu Quốc Đạt (chunk 2) -> Triệu Quốc Đạt (chunk 3) -> cốt
// truyện khi vào chunk 4 -> câu hỏi về họ Lý (chunk 5) -> ba anh em họ Lý
// (chunk 6) -> câu hỏi về Bạch Tượng (chunk 8) -> Bạch Tượng (chunk 9) -> về
// đích cuối chunk 9. NPC bị vây (giải cứu): 2 lính Ngô thường / 2 thợ săn
// (CAPTORS). Mọi số DESIGN_BASELINE.

import { CHUNK_W } from '../../engine/config.js';
import { worldX, makeObstacle, makeHazard, setTerrain, buildTerrain, terrainHoles } from '../../engine/geometry.js';
import {
  makeEnemy, makeNpc, makeQuiz, makePlatform, pick, checkTerrainFootprints, checkNpcClearance, checkPlatformReach
} from '../../engine/entities.js';
import { state } from '../../engine/state.js';
import { openStory } from '../../engine/dialogue.js';
import { LEVEL } from '../../engine/chapter.js';
import { QUIZ, LUMBERJACK, SOLDIER, BRANCH, CAPTORS } from './config.js';
import { NPC_QUESTION_POOLS } from './questions-data.js';
import { STORY_QUOC_DAT } from './dialogue-data.js';

// Địa hình (lưới chữ 48 ô/chunk, '#' đất, hàng cuối = mặt đất; '.' ở hàng
// cuối = hố bùn). Chunk không khai báo = phẳng; quanh NPC (x 560) giữ phẳng;
// không đặt hố trong ~130 px đầu chunk (chỗ hồi sinh sau khi rơi).
const LEVEL2_TERRAIN = {
  // chunk 2: gò đất trước thợ săn
  2: [
    '........#######.................................',
    '################################################'
  ],
  // chunk 4: gò đất 1 ô trên sườn đá — đá tảng lăn qua
  4: [
    '..........................########..............',
    '################################################'
  ],
  // chunk 7: hố bùn 96 px (x 256–352) có cành cây bắc qua
  7: [
    '################......##########################'
  ],
  // chunk 8: hố bùn 64 px (x 352–416) — nhảy qua
  8: [
    '######################....######################'
  ]
};

function makeLumberjack(chunk, localX) {
  return makeEnemy(worldX(chunk, localX) - LUMBERJACK.w / 2, LUMBERJACK.w, LUMBERJACK.h, LUMBERJACK.hp, false);
}

function makeHunter(chunk, localX, options = {}) {
  return makeHazard('thrower', 'ngoHunter', chunk, localX, {
    projectile: 'crossbowBolt', fireInterval: 3.0, fireRange: 240, hp: 2, ...options
  });
}

// Quân vây NPC (engine giải cứu đếm enemy/hazard `captorOf`): Triệu Quốc Đạt
// và họ Lý = lính Ngô thường (enemy `art: 'soldier'`), Bạch Tượng = thợ săn.
function makeNpcCaptors(npc) {
  return CAPTORS[npc.id].map(side => {
    const centerX = npc.centerX + side.dx;
    if (npc.id === 'bachTuong') {
      const local = centerX - Math.floor(centerX / CHUNK_W) * CHUNK_W;
      return { ...makeHunter(Math.floor(centerX / CHUNK_W) + 1, local), captorOf: npc.id };
    }
    return {
      ...makeEnemy(centerX - SOLDIER.w / 2, SOLDIER.w, SOLDIER.h, SOLDIER.hp, false, {
        patrolMin: npc.centerX + side.patrol[0], patrolMax: npc.centerX + side.patrol[1]
      }),
      art: 'soldier',
      captorOf: npc.id
    };
  });
}

export function level2Content() {
  setTerrain(buildTerrain(Object.entries(LEVEL2_TERRAIN).map(([chunk, rows]) => ({ chunk: Number(chunk), rows })), LEVEL.chunks));
  const npcs = [
    makeNpc('quocDat', 3, 560),
    makeNpc('hoLy', 6, 560),
    makeNpc('bachTuong', 9, 560)
  ];
  const captors = npcs.flatMap(makeNpcCaptors);
  const holes = terrainHoles();
  const obstacles = [
    // chunk 3 — cây đổ trước Triệu Quốc Đạt
    makeObstacle('fallenBranch', 3, 200, 55, 23),
    // chunk 5 — khối đá
    makeObstacle('stoneBlock', 5, 200, 51, 23)
  ];
  const hazards = [
    // chunk 1: hố chông tre
    makeHazard('trap', 'bambooPit', 1, 300, { harmful: false, triggerDistance: 58 }),
    // chunk 2: thợ săn nấp sau gò đất
    makeHunter(2, 360),
    // chunk 4: đá tảng lăn từ sườn núi qua gò đất
    makeHazard('roller', 'boulder', 4, 740, { speed: -100, triggerX: worldX(4, 220), hp: 2 }),
    // chunk 5: kỵ binh Ngô lao ra từ ngoài màn hình
    makeHazard('roller', 'ngoCavalry', 5, 780, { speed: -190, triggerX: worldX(5, 260), hp: 3 }),
    // chunk 6: hố chông tre trước nhóm lính vây họ Lý
    makeHazard('trap', 'bambooPit', 6, 200, { harmful: false, triggerDistance: 58 }),
    // chunk 8: thợ săn bên kia hố bùn
    makeHunter(8, 250),
    ...captors.filter(captor => captor.kind)
  ];
  const enemies = [
    // lính đốn gỗ đi tuần giữa đường
    makeLumberjack(1, 560),
    makeLumberjack(7, 560),
    ...captors.filter(captor => !captor.kind)
  ];
  // Cành cây bắc qua hố bùn chunk 7 (mép trái thân cành, cao 36 px).
  const platforms = [makePlatform(7, 274, 36, BRANCH.short.w, { sprite: BRANCH.short.sprite })];
  // Câu hỏi chặn đường trước mỗi NPC: 1 câu rút ngẫu nhiên trong bộ của NPC.
  const quizzes = npcs.map(npc => makeQuiz(...QUIZ.level2Spots[npc.id], pick(NPC_QUESTION_POOLS[npc.id]), npc.id));
  const content = { obstacles, hazards, holes, items: [], enemies, npcs, quizzes, platforms };
  checkNpcClearance(content);
  checkTerrainFootprints(content);
  checkPlatformReach(content);
  return content;
}

// Cốt truyện Triệu Quốc Đạt qua đời: 1 lần khi vào chunk ngay sau chunk của
// Triệu Quốc Đạt, sau khi đã gặp (engine gọi khi không có hội thoại mở).
export function level2Events(p) {
  const quocDat = state.npcs.find(item => item.id === 'quocDat');
  const storyX = (Math.floor(quocDat?.centerX / CHUNK_W) + 1) * CHUNK_W;
  if (!state.storyShown && quocDat?.met && p.x >= storyX) {
    state.storyShown = true;
    openStory(STORY_QUOC_DAT);
  }
}
