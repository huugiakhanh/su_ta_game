// Màn 2 "Hiền tài Dạ Trạch" — TQP-SKELETON: chưa có NPC (thoại chờ team duyệt —
// docs/SUTA_TQP_TASK_00.md §4), chưa rải 10 sách khoá NPC (TQP-ENGINE E6). Tạm:
// 3 câu hỏi chặn đường rút lần lượt từ pool của Triệu Túc, Lý Nam Đế, Chử Đồng
// Tử; 2 lính Lương, 1 bẫy chông tre. NPC + giải cứu làm ở TQP-L2. DESIGN_BASELINE.

import { worldX, makeHazard } from '../../engine/geometry.js';
import { makeEnemy, makeQuiz, pick, checkTerrainFootprints } from '../../engine/entities.js';
import { QUIZ, SOLDIER } from './config.js';
import { NPC_QUESTION_POOLS } from './questions-data.js';

export function level2Content() {
  const content = {
    obstacles: [],
    hazards: [makeHazard('trap', 'bambooPit', 4, 300, { harmful: false, triggerDistance: 58 })],
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
