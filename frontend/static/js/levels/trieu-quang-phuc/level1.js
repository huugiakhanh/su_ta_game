// Màn 1 "Tuổi trẻ rèn luyện" — bố cục khung TQP-SKELETON (cố định), asset chương
// 3: 3 lính Lương, 1 bẫy lưới trúc, 1 chunk sông 2 khe có mỏm đá, 5 Quyển Sách
// Tinh Hoa, 4 câu hỏi chặn đường, đích cuối màn. Bố cục thật (khu rèn luyện,
// 9 chướng ngại + mini-boss đội trưởng giáo dài) làm ở TQP-L1. DESIGN_BASELINE.

import { worldX, makeHazard, setTerrain, buildTerrain, terrainHoles } from '../../engine/geometry.js';
import {
  makeEnemy, makeQuiz, makeItem, makePlatform, shuffle, checkTerrainFootprints, checkPlatformReach
} from '../../engine/entities.js';
import { QUIZ, SOLDIER, NET, RIVER, ROCK_LEDGE, LEVEL1_CHUNKS } from './config.js';
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

export function level1Content() {
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
    // Mỏm đá giữa khe sông thứ 2 (bục một chiều).
    platforms: [makePlatform(RIVER.chunk, RIVER.ledge[0], RIVER.ledge[1], ROCK_LEDGE.w, { sprite: ROCK_LEDGE.sprite })]
  };
  checkTerrainFootprints(content);
  checkPlatformReach(content);
  return content;
}
