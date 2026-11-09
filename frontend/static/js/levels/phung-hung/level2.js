// Màn 2 "Tụ nghĩa chiêu hiền" — PH-SKELETON: chưa có NPC, chưa rải sách + Vũ Khí
// Thô Sơ. Tạm: 3 câu hỏi chặn đường rút lần lượt từ pool của Phùng Hải, Đỗ Anh
// Hàn, Bồ Phá Cần; 2 lính. NPC + giải cứu làm ở PH-L2. DESIGN_BASELINE.

import { worldX } from '../../engine/geometry.js';
import { makeEnemy, makeQuiz, pick, checkTerrainFootprints } from '../../engine/entities.js';
import { QUIZ, SOLDIER } from './config.js';
import { NPC_QUESTION_POOLS } from './questions-data.js';

export function level2Content() {
  const content = {
    obstacles: [],
    hazards: [],
    holes: [],
    items: [],
    enemies: [
      makeEnemy(worldX(2, 300) - SOLDIER.w / 2, SOLDIER.w, SOLDIER.h, SOLDIER.hp, false),
      makeEnemy(worldX(3, 300) - SOLDIER.w / 2, SOLDIER.w, SOLDIER.h, SOLDIER.hp, false)
    ],
    npcs: [],
    quizzes: Object.entries(QUIZ.level2Spots)
      .map(([pool, spot]) => makeQuiz(...spot, pick(NPC_QUESTION_POOLS[pool])))
  };
  checkTerrainFootprints(content);
  return content;
}
