// Màn 1 "Tuổi trẻ rèn luyện" — bố cục khung TQP-SKELETON (cố định), asset chương
// 3: 3 lính Lương, 1 bẫy lưới trúc, 1 chunk sông 2 khe có mỏm đá, 5 Quyển Sách
// Tinh Hoa, 4 câu hỏi chặn đường, đích cuối màn. Bố cục thật (khu rèn luyện,
// 9 chướng ngại + mini-boss đội trưởng giáo dài) làm ở TQP-L1. DESIGN_BASELINE.
// Layout thử `?layout=engine` (TQP-ENGINE): mỗi chunk một cơ chế mới.

import { worldX, makeHazard, setTerrain, buildTerrain, terrainHoles } from '../../engine/geometry.js';
import {
  makeEnemy, makeNpc, makeQuiz, makeItem, makePlatform, shuffle, checkTerrainFootprints, checkPlatformReach
} from '../../engine/entities.js';
import { GROUND_Y } from '../../engine/config.js';
import { QUIZ, SOLDIER, NET, RIVER, ROCK_LEDGE, LEVEL1_CHUNKS, ENGINE_TEST } from './config.js';
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

// Mỏm đá giữa khe sông thứ 2 (bục một chiều).
function makeLedge(chunk) {
  return makePlatform(chunk, RIVER.ledge[0], RIVER.ledge[1], ROCK_LEDGE.w, { sprite: ROCK_LEDGE.sprite });
}

// Layout thử `?layout=engine` (TQP-ENGINE): sình (chunk 1), khói trôi 2 làn
// (2), cá sấu trong khe sông (3), thuyền gọi viện (4), lính giáo dài + bục (5),
// vùng ẩn nấp + cung thủ + NPC khoá 2 sách (6); máu tối đa +2. Không câu hỏi.
function engineTestLayout() {
  const t = ENGINE_TEST;
  setTerrain(buildTerrain([
    { chunk: 1, rows: t.mud },
    { chunk: 3, rows: RIVER.rows },
    { chunk: 4, rows: RIVER.rows }
  ], LEVEL1_CHUNKS));
  const [crocChunk, crocX, crocFloat] = t.crocodile;
  const [boatChunk, boatX, boatFloat] = t.boat;
  const [coverChunk, coverX, coverW] = t.covers;
  const [npcChunk, npcX, requires] = t.npc;
  const [platformChunk, platformX, platformHeight, platformW] = t.platform;
  const spearman = ([chunk, localX]) => ({ ...makeSoldier(chunk, localX), art: 'spearman' });
  return {
    bonusHealth: t.bonusHealth,
    obstacles: [],
    hazards: [
      ...t.smoke.map(([chunk, localX, lane, speed, travel]) => makeHazard('drift', 'smoke', chunk, localX, {
        lane, speed, travel, gap: 1.2, triggerRange: 320
      })),
      makeHazard('lurker', 'crocodile', crocChunk, crocX, { groundY: GROUND_Y, floatY: crocFloat, hp: 2, triggerRange: 110 }),
      makeHazard('thrower', 'warBoat', boatChunk, boatX, {
        groundY: GROUND_Y, floatY: boatFloat, harmful: false, hp: 3,
        projectile: 'fireArrow', aim: true, fireInterval: 2.2,
        callHelp: {
          after: t.callHelp.after, range: t.callHelp.range,
          spawnAt: t.callHelp.spawnAt.map(([chunk, localX]) => worldX(chunk, localX)),
          enemy: { w: SOLDIER.w, h: SOLDIER.h, hp: SOLDIER.hp }
        }
      }),
      makeHazard('thrower', 'archer', ...t.archer, { projectile: 'crossbowBolt', aim: true, fireInterval: 2, fireRange: 200 })
    ],
    holes: terrainHoles(),
    items: t.npcItems.map(([chunk, localX, lift]) => makeItem(chunk, localX, lift)),
    enemies: [
      makeSoldier(...t.mudGuard),
      ...t.spearmen.map(spearman),
      ...t.coverGuards.map(([chunk, localX]) => makeSoldier(chunk, localX))
    ],
    npcs: [makeNpc('testNpc', npcChunk, npcX, { requires })],
    quizzes: [],
    covers: [{ x: worldX(coverChunk, coverX), w: coverW }],
    platforms: [
      makeLedge(3), makeLedge(4),
      makePlatform(platformChunk, platformX, platformHeight, platformW)
    ]
  };
}

export function level1Content(options = {}) {
  if (options.layout === 'engine') return engineTestLayout();
  // Địa hình phải có TRƯỚC khi dựng nội dung: vật/lính đứng theo groundYAt().
  setTerrain(buildTerrain([{ chunk: RIVER.chunk, rows: RIVER.rows }], LEVEL1_CHUNKS));
  const content = {
    obstacles: [],
    hazards: [makeHazard('snare', 'netTrap', 1, 492, { dropHeight: NET.dropHeight, triggerWidth: NET.triggerWidth })],
    holes: terrainHoles(),
    items: [
      makeItem(1, 300, 56),
      makeItem(2, 450, 60),
      makeItem(3, 120, 52),
      makeItem(4, 420, 80),
      makeItem(5, 300, 60)
    ],
    enemies: [
      makeSoldier(2, 600),
      makeSoldier(4, 250),
      makeSoldier(5, 680)
    ],
    npcs: [],
    quizzes: level1Quizzes(),
    platforms: [makeLedge(RIVER.chunk)]
  };
  checkTerrainFootprints(content);
  checkPlatformReach(content);
  return content;
}
