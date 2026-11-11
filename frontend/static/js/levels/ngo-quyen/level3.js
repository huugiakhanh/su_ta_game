// Màn 3 "Đại thắng Bạch Đằng" — NQ-SKELETON, toàn bộ PLACEHOLDER (thay ở NQ-L3):
// đấu trường 1 chunk, 3 đợt lính ra từ mép phải (engine makeSpawner). Hết đợt 3
// và hết quân thì thắng -> panel hết chương. Không boss, không cutscene, không kỹ năng.

import { makeEnemy, makeSpawner } from '../../engine/entities.js';
import { state } from '../../engine/state.js';
import { endGame } from '../../engine/end-game.js';
import { ARENA, SOLDIER, WAVES } from './config.js';

// Lính đấu trường: thấy người chơi ở mọi chỗ, đuổi khắp đấu trường.
function spawnArenaSoldier(entry, centerX) {
  return {
    ...makeEnemy(centerX - SOLDIER.w / 2, SOLDIER.w, SOLDIER.h, SOLDIER.hp, false, {
      patrolMin: ARENA.edge, patrolMax: ARENA.width - ARENA.edge, aggroRange: ARENA.width
    }),
    art: 'arena'
  };
}

export function level3Content() {
  return {
    obstacles: [], hazards: [], holes: [], items: [], enemies: [], npcs: [], quizzes: [],
    spawner: makeSpawner(WAVES.groups, WAVES.gap, false, { spawn: spawnArenaSoldier, x: ARENA.spawnX })
  };
}

// Mỗi frame: spawner `done` chỉ bật khi đã hết đợt và không còn quân sống.
export function updateArena() {
  if (!state.won && state.spawner?.done) endGame(true);
}
