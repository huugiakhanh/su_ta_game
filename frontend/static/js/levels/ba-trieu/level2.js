// Màn 2 "Chiêu mộ hiền tài" — BT-SKELETON: chưa có NPC (thoại chờ team duyệt —
// docs/SUTA_BT_TASK_00.md §4). Tạm: 3 câu hỏi chặn đường rút lần lượt từ pool
// của Triệu Quốc Đạt, anh em họ Lý, Bạch Tượng (tiêu đề "Câu hỏi lịch sử" vì
// chưa có NPC); 2 lính đốn gỗ, 1 hố chông tre. NPC + giải cứu làm ở BT-L2. DESIGN_BASELINE.

import { worldX, makeHazard } from '../../engine/geometry.js';
import { makeEnemy, makeQuiz, pick, checkTerrainFootprints } from '../../engine/entities.js';
import { QUIZ, LUMBERJACK } from './config.js';
import { NPC_QUESTION_POOLS } from './questions-data.js';

export function level2Content() {
  const content = {
    obstacles: [],
    hazards: [makeHazard('trap', 'bambooPit', 4, 300, { harmful: false, triggerDistance: 58 })],
    holes: [],
    items: [],
    enemies: [
      makeEnemy(worldX(2, 300) - LUMBERJACK.w / 2, LUMBERJACK.w, LUMBERJACK.h, LUMBERJACK.hp, false),
      makeEnemy(worldX(3, 300) - LUMBERJACK.w / 2, LUMBERJACK.w, LUMBERJACK.h, LUMBERJACK.hp, false)
    ],
    npcs: [],
    quizzes: Object.entries(QUIZ.level2Spots)
      .map(([pool, spot]) => makeQuiz(...spot, pick(NPC_QUESTION_POOLS[pool])))
  };
  checkTerrainFootprints(content);
  return content;
}
