// Màn 1 "Hành quân ra Bắc" — NQ-SKELETON, toàn bộ PLACEHOLDER (thay ở NQ-L1):
// 6 chunk nền phẳng, 3 lính, 1 đá rơi, 5 Quyển Sách cố định, 4 câu hỏi chặn
// đường rút từ LEVEL1_QUESTION_POOL. Đích cuối màn, cần đủ 5 sách.

import { worldX, makeHazard } from '../../engine/geometry.js';
import { makeEnemy, makeQuiz, makeItem, shuffle } from '../../engine/entities.js';
import { state } from '../../engine/state.js';
import { QUIZ, SOLDIER, LEVEL1, ROCK } from './config.js';
import { LEVEL1_QUESTION_POOL } from './questions-data.js';

export function makeSoldier(chunk, localX) {
  return makeEnemy(worldX(chunk, localX) - SOLDIER.w / 2, SOLDIER.w, SOLDIER.h, SOLDIER.hp, false);
}

// Đá rơi: ẩn tới khi có người vào công tắc (updateRocks bật hình).
function makeRock(chunk, localX) {
  return { ...makeHazard('snare', 'lateriteRock', chunk, localX, ROCK), invisible: true };
}

export function level1Content() {
  const chosen = shuffle(LEVEL1_QUESTION_POOL).slice(0, QUIZ.level1Count);
  return {
    obstacles: [],
    hazards: [makeRock(...LEVEL1.rock)],
    holes: [],
    items: LEVEL1.books.map(([chunk, localX, lift]) => makeItem(chunk, localX, lift)),
    enemies: LEVEL1.soldiers.map(spot => makeSoldier(...spot)),
    npcs: [],
    quizzes: QUIZ.level1Spots.map((spot, index) => makeQuiz(...spot, chosen[index]))
  };
}

// Đá rơi hiện khi đã kích hoạt (tránh treo giữa trời).
export function level1Events() {
  state.hazards.forEach(hazard => {
    if (hazard.kind === 'snare' && hazard.invisible && hazard.snareState !== 'idle') hazard.invisible = false;
  });
}
