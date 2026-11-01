// Màn 1 "Từ quan chiêu binh" — bố cục khung LND-SKELETON (cố định, nền phẳng),
// asset mượn chương 1–2: 3 lính Lương (tạm lính Ngô), 1 bẫy chông, 1 đá lở, 2 vật
// cản, 5 Quyển Sách Tinh Hoa, 4 câu hỏi chặn đường, đích cuối màn. Bố cục thật
// (8 loại chướng ngại + mini-boss xe cống phẩm) làm ở LND-L1. DESIGN_BASELINE.

import { worldX, makeObstacle, makeHazard, setTerrain, buildTerrain, terrainHoles } from '../../engine/geometry.js';
import { makeEnemy, makeQuiz, makeItem, makePlatform, shuffle, checkTerrainFootprints } from '../../engine/entities.js';
import { GROUND_Y } from '../../engine/config.js';
import { QUIZ, SOLDIER, HOUND, ENGINE_TEST, LEVEL1_CHUNKS } from './config.js';
import { LEVEL1_QUESTION_POOL } from './questions-data.js';

// Mỗi lượt rút QUIZ.level1Count câu KHÔNG trùng, đặt lần lượt vào level1Spots.
function level1Quizzes() {
  const chosen = shuffle(LEVEL1_QUESTION_POOL).slice(0, QUIZ.level1Count);
  return chosen.map((stt, index) => makeQuiz(...QUIZ.level1Spots[index], stt));
}

// Lính Lương (hành vi guard của engine) đứng tâm tại worldX(chunk, localX).
function makeSoldier(chunk, localX) {
  return makeEnemy(worldX(chunk, localX) - SOLDIER.w / 2, SOLDIER.w, SOLDIER.h, SOLDIER.hp, false);
}

// Layout thử `?layout=engine` (LND-ENGINE): bẫy lưới, sông + mỏm đá + bục +
// thuyền nhắm bắn, cung thủ đứng cao bắn chéo, xe cống phẩm chở 1 sách, chó
// săn, lính rơi bình máu. Không câu hỏi; 1 sách duy nhất nằm trong xe.
function engineTestLayout() {
  const t = ENGINE_TEST;
  setTerrain(buildTerrain([{ chunk: 2, rows: t.river }], LEVEL1_CHUNKS));
  const [houndChunk, houndX] = t.hound;
  const [archerChunk, archerX, archerHeight] = t.archer;
  const [boatChunk, boatX, floatY] = t.boat;
  const cartId = 'test-cart';
  return {
    // Hook dropHeal của chương (chapter.js) chỉ bật ở layout này.
    layoutTest: 'engine',
    obstacles: [],
    hazards: [
      makeHazard('snare', 'netTrap', t.snare.chunk, t.snare.localX, {
        dropHeight: t.snare.dropHeight, triggerWidth: t.snare.triggerWidth
      }),
      makeHazard('thrower', 'warBoat', boatChunk, boatX, {
        groundY: GROUND_Y, floatY, projectile: 'fireArrow', aim: true, fireInterval: 2.2
      }),
      makeHazard('thrower', 'towerArcher', archerChunk, archerX, {
        groundY: GROUND_Y - archerHeight, projectile: 'fireArrow', aim: true, fireInterval: 2
      }),
      makeHazard('roller', 'tributeCart', t.cart.chunk, t.cart.localX, {
        id: cartId, speed: t.cart.speed, triggerX: worldX(t.cart.chunk, t.cart.triggerLocalX), hp: t.cart.hp
      })
    ],
    holes: terrainHoles(),
    items: [makeItem(t.cart.chunk, t.cart.localX, t.cart.itemLift, { carrier: cartId })],
    enemies: [
      makeSoldier(...t.guard),
      {
        ...makeEnemy(worldX(houndChunk, houndX) - HOUND.w / 2, HOUND.w, HOUND.h, HOUND.hp, false),
        art: 'hound', facing: -1, direction: -1, rest: 0, walking: true
      },
      ...t.dropGuards.map(spot => makeSoldier(...spot))
    ],
    npcs: [],
    quizzes: [],
    platforms: [makePlatform(t.ledge[0], t.ledge[1], t.ledge[2], t.ledge[3])]
  };
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
      makeSoldier(2, 600),
      makeSoldier(4, 250),
      makeSoldier(5, 680)
    ],
    npcs: [],
    quizzes: level1Quizzes()
  };
  checkTerrainFootprints(content);
  return content;
}
