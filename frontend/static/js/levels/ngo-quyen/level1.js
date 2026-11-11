// Màn 1 "Hành quân ra Bắc" — NQ-SKELETON, toàn bộ PLACEHOLDER (thay ở NQ-L1):
// 6 chunk nền phẳng, 3 lính, 1 đá rơi, 5 Quyển Sách cố định, 4 câu hỏi chặn
// đường rút từ LEVEL1_QUESTION_POOL. Đích cuối màn, cần đủ 5 sách.

import { worldX, makeHazard, setTerrain, buildTerrain, terrainHoles } from '../../engine/geometry.js';
import { GROUND_Y } from '../../engine/config.js';
import { makeEnemy, makeQuiz, makeItem, makeStakeSpot, shuffle } from '../../engine/entities.js';
import { state } from '../../engine/state.js';
import { QUIZ, SOLDIER, LEVEL1, LEVEL1_CHUNKS, ROCK, ENGINE_TEST, BOAT_FLOAT } from './config.js';
import { LEVEL1_QUESTION_POOL } from './questions-data.js';

export function makeSoldier(chunk, localX) {
  return makeEnemy(worldX(chunk, localX) - SOLDIER.w / 2, SOLDIER.w, SOLDIER.h, SOLDIER.hp, false);
}

// Đá rơi: ẩn tới khi có người vào công tắc (updateRocks bật hình).
function makeRock(chunk, localX) {
  return { ...makeHazard('snare', 'lateriteRock', chunk, localX, ROCK), invisible: true };
}

// Layout thử `?layout=engine` (NQ-ENGINE): mỗi chunk một cơ chế E1–E6.
function engineTestLayout() {
  const t = ENGINE_TEST;
  setTerrain(buildTerrain(t.terrain, LEVEL1_CHUNKS));
  const zone = ([chunk, localX]) => ({ x: worldX(chunk, localX) - 20, w: 40 });
  return {
    layoutTest: 'engine',
    tideSpec: t.tide,
    stakesRequired: t.stakesRequired,
    obstacles: [],
    hazards: [
      ...t.boats.map(([chunk, localX]) => makeHazard('boat', 'boat', chunk, localX, { floatY: BOAT_FLOAT, groundY: GROUND_Y })),
      makeHazard('whirl', 'whirl', ...t.whirl, { groundY: GROUND_Y }),
      ...t.gusts.map(([chunk, localX, phase]) => ({ ...makeHazard('gust', 'gust', chunk, localX), phase })),
      ...t.shelters.map(spot => makeHazard('prop', 'shelterRock', ...spot)),
      ...t.hiddenStakes.map(spot => makeHazard('prop', 'hiddenStake', ...spot, { groundY: GROUND_Y + 6 })),
      makeHazard('prop', 'stakePile', ...t.pile),
      makeHazard('thrower', 'netThrower', ...t.netThrower, { projectile: 'net', fireInterval: 2.5, fireRange: 260, aim: false })
    ],
    shelters: t.shelters.map(zone),
    stakeSpots: t.stakeSpots.map(spot => makeStakeSpot(...spot)),
    holes: terrainHoles(),
    items: [],
    enemies: [makeSoldier(...t.soldier)],
    npcs: [],
    quizzes: []
  };
}

export function level1Content(options = {}) {
  if (options.layout === 'engine') return engineTestLayout();
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
