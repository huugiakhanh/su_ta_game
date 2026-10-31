// Màn 1 "Từ quan chiêu binh" — bố cục khung LND-SKELETON (cố định, nền phẳng),
// asset mượn chương 1–2: 3 lính Lương (tạm lính Ngô), 1 bẫy chông, 1 đá lở, 2 vật
// cản, 5 Quyển Sách Tinh Hoa, 4 câu hỏi chặn đường, đích cuối màn. Bố cục thật
// (8 loại chướng ngại + mini-boss xe cống phẩm) làm ở LND-L1. DESIGN_BASELINE.

import { worldX, makeObstacle, makeHazard } from '../../engine/geometry.js';
import { makeEnemy, makeQuiz, makeItem, shuffle, checkTerrainFootprints } from '../../engine/entities.js';
import { QUIZ, SOLDIER } from './config.js';
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
