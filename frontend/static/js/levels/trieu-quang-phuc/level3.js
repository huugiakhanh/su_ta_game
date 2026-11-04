// Màn 3 "Đại phá Dương Sàn" — TQP-SKELETON: đấu trường 1 chunk, 3 đợt lính Lương
// ra ở ARENA.spawnX (engine makeSpawner); hết đợt cuối + hết quân thì thắng
// chương. Boss Dương Sàn 3 giai đoạn + kỹ năng làm ở TQP-L3.

import { makeEnemy, makeSpawner } from '../../engine/entities.js';
import { state } from '../../engine/state.js';
import { endGame } from '../../engine/end-game.js';
import { ARENA, WAVES, SOLDIER } from './config.js';

// Lính đấu trường: tuần tra cả đấu trường, thấy người chơi ở mọi chỗ.
function makeArenaGuard(entry, centerX) {
  return makeEnemy(centerX - SOLDIER.w / 2, SOLDIER.w, SOLDIER.h, SOLDIER.hp, false, {
    patrolMin: 40, patrolMax: ARENA.width - 40, aggroRange: ARENA.width
  });
}

export function level3Content() {
  return {
    obstacles: [], hazards: [], holes: [], items: [], enemies: [], npcs: [], quizzes: [],
    spawner: makeSpawner(WAVES.groups, WAVES.gap, false, { spawn: makeArenaGuard, x: ARENA.spawnX })
  };
}

// LEVEL.update: hết đợt cuối và không còn quân sống -> thắng (panel hết chương).
export function updateLevel3() {
  if (state.won || !state.spawner?.done) return;
  if (state.enemies.some(enemy => enemy.alive)) return;
  endGame(true);
}
