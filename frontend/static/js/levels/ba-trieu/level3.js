// Màn 3 "Chiến lũy Bồ Điền" — BT-SKELETON: đấu trường 1 chunk, 3 đợt lính
// canh ra ở ARENA.spawnX (engine makeSpawner); hết đợt cuối + hết quân thì
// thắng chương. Boss Lục Dận 3 giai đoạn + kỹ năng làm ở BT-L3.

import { makeEnemy, makeSpawner } from '../../engine/entities.js';
import { state } from '../../engine/state.js';
import { endGame } from '../../engine/end-game.js';
import { ARENA, WAVES, LUMBERJACK } from './config.js';

// Lính đốn gỗ đấu trường: tuần tra cả đấu trường, thấy người chơi ở mọi chỗ.
function makeArenaGuard(entry, centerX) {
  return makeEnemy(centerX - LUMBERJACK.w / 2, LUMBERJACK.w, LUMBERJACK.h, LUMBERJACK.hp, false, {
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
