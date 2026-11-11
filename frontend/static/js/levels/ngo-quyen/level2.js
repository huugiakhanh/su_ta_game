// Màn 2 "Trận địa cọc ngầm" — NQ-SKELETON, toàn bộ PLACEHOLDER (thay ở NQ-L2):
// 4 chunk, 2 lính, 3 câu hỏi chặn đường lần lượt từ pool Dương Đình Nghệ ->
// Kiều Công Hãn -> Ngô Xương Ngập (NQ-00 §3.3). Chưa có NPC, sách, cọc.

import { makeQuiz, pick } from '../../engine/entities.js';
import { QUIZ, LEVEL2 } from './config.js';
import { NPC_QUESTION_POOLS } from './questions-data.js';
import { makeSoldier } from './level1.js';

export function level2Content() {
  return {
    obstacles: [],
    hazards: [],
    holes: [],
    items: [],
    enemies: LEVEL2.soldiers.map(spot => makeSoldier(...spot)),
    npcs: [],
    quizzes: Object.entries(QUIZ.level2Spots).map(([pool, spot]) => makeQuiz(...spot, pick(NPC_QUESTION_POOLS[pool])))
  };
}
