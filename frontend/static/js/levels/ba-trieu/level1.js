// Màn 1 "Rừng núi Nưa" — bố cục khung BT-SKELETON (cố định, nền phẳng) với asset
// riêng BT_ART_01: 3 lính đốn gỗ, 1 hố chông tre, 1 đá tảng lăn, 2 vật cản, 5
// Quyển Sách Tinh Hoa, 4 câu hỏi chặn đường, cổng trại ở đích. Bố cục thật (8
// loại chướng ngại + mini-boss Tham quan thu thuế) làm ở BT-L1. DESIGN_BASELINE.

import { worldX, makeObstacle, makeHazard, setTerrain, buildTerrain, terrainHoles } from '../../engine/geometry.js';
import {
  makeEnemy, makeQuiz, makeItem, makePlatform, shuffle, checkTerrainFootprints, checkPlatformReach
} from '../../engine/entities.js';
import { QUIZ, ENGINE_TEST, LEVEL1_CHUNKS, LUMBERJACK, BRANCH } from './config.js';
import { LEVEL1_QUESTION_POOL } from './questions-data.js';

// Mỗi lượt rút QUIZ.level1Count câu KHÔNG trùng, đặt lần lượt vào level1Spots.
function level1Quizzes() {
  const chosen = shuffle(LEVEL1_QUESTION_POOL).slice(0, QUIZ.level1Count);
  return chosen.map((stt, index) => makeQuiz(...QUIZ.level1Spots[index], stt));
}

// Lính đốn gỗ (hành vi guard của engine) đứng tâm tại worldX(chunk, localX).
function makeLumberjack(chunk, localX) {
  return makeEnemy(worldX(chunk, localX) - LUMBERJACK.w / 2, LUMBERJACK.w, LUMBERJACK.h, LUMBERJACK.hp, false);
}

// Bục cành cây: [chunk, localX (mép trái thân cành), cao, 'short' | 'long'].
function makeBranch([chunk, localX, height, kind]) {
  const branch = BRANCH[kind];
  return makePlatform(chunk, localX, height, branch.w, { sprite: branch.sprite });
}

// Layout thử `?layout=engine` (BT-ENGINE B): bậc bục, bục trên hố, cành cây
// trên 3 miệng chướng khí lệch nhịp, voi rừng (đứng lên lưng), đá lăn. Không
// sách/câu hỏi/quân.
function engineTestLayout() {
  const t = ENGINE_TEST;
  setTerrain(buildTerrain([{ chunk: t.holeChunk, rows: [t.holeRow] }], LEVEL1_CHUNKS));
  const content = {
    obstacles: [],
    hazards: [
      ...t.vents.map(([chunk, localX, phase]) => makeHazard('vent', 'miasma', chunk, localX, { phase })),
      makeHazard('roller', 'wildElephant', t.elephant.chunk, t.elephant.localX, {
        speed: t.elephant.speed, triggerX: worldX(t.elephant.chunk, t.elephant.triggerLocalX)
      }),
      makeHazard('roller', 'boulder', t.boulder.chunk, t.boulder.localX, {
        speed: t.boulder.speed, triggerX: worldX(t.boulder.chunk, t.boulder.triggerLocalX), hp: t.boulder.hp
      })
    ],
    holes: terrainHoles(),
    items: [],
    enemies: [],
    npcs: [],
    quizzes: [],
    platforms: [...t.stairs, t.overHole, ...t.branches].map(makeBranch)
  };
  checkPlatformReach(content);
  return content;
}

export function level1Content(options = {}) {
  if (options.layout === 'engine') return engineTestLayout();
  const content = {
    obstacles: [
      makeObstacle('fallenBranch', 2, 150, 55, 23),
      makeObstacle('stoneBlock', 4, 660, 51, 23)
    ],
    hazards: [
      makeHazard('trap', 'bambooPit', 1, 492, { harmful: false, triggerDistance: 58 }),
      makeHazard('roller', 'boulder', 3, 732, { speed: -120, triggerX: worldX(3, 260), hp: 2 })
    ],
    holes: [],
    items: [
      makeItem(1, 300, 56),
      makeItem(2, 450, 60),
      makeItem(3, 300, 52),
      makeItem(4, 420, 80),
      makeItem(5, 300, 60)
    ],
    enemies: [
      makeLumberjack(2, 600),
      makeLumberjack(4, 250),
      makeLumberjack(5, 680)
    ],
    npcs: [],
    quizzes: level1Quizzes()
  };
  checkTerrainFootprints(content);
  return content;
}
