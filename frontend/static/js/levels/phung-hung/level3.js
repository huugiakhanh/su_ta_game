// Màn 3 "Vây phủ Tống Bình" (PH-L3, docs/SUTA_PH_TASK_L3_01.md): đấu trường 1 chunk
// trước lầu cổng. Dựng trụ gác, trống đồng, nước sôi, cung thủ; diễn biến ở boss.js.
// Mọi số DESIGN_BASELINE.

import { makeEnemy } from '../../engine/entities.js';
import { makeHazard } from '../../engine/geometry.js';
import { setAnim } from '../../engine/animation.js';
import { GROUND_Y } from '../../engine/config.js';
import { ARENA, ARCHERS, DRUMS, FEAR, GATE, POSTS, SOLDIER, WATER } from './config.js';

// Trụ gác và trống đồng là enemy `kind` riêng để nhận đuốc và đòn chém (boss.js).
function makeFixture(centerX, spec, art, kind) {
  return {
    ...makeEnemy(centerX - spec.w / 2, spec.w, spec.h, 1, false, {}),
    art, kind, facing: 1, walking: false, passive: true, noBar: true
  };
}

const makePost = centerX => ({ ...makeFixture(centerX, POSTS, 'watchPost', 'watchPost'), lit: false });
// GĐ 1 trống chưa `alive` để đuốc bay qua, không mất đuốc (engine carry.js thrownTarget).
const makeDrum = centerX => ({ ...makeFixture(centerX, DRUMS, 'drum', 'drum'), ready: false, alive: false, dying: true });

// Layout thử: trụ đã cháy sẵn. Cháy rồi thì `alive = false` để đuốc, đòn chém bỏ qua.
function burnAtStart(post) {
  Object.assign(post, { lit: true, alive: false, dying: true });
  setAnim(post, 'burning');
  return post;
}

function makeWater(centerX, index) {
  return makeHazard('vent', 'boilingWater', 1, centerX, { phase: index * WATER.phaseStep });
}

// Cung thủ đứng trên lối đi; `harmful: false` để nhảy chạm chân không bị tính va chạm.
function makeArcher(centerX, index) {
  return {
    ...makeHazard('thrower', 'wallArcher', 1, centerX, {
      groundY: GROUND_Y - GATE.deck, projectile: 'crossbowBolt', aim: true,
      fireInterval: ARCHERS.interval, fireRange: ARCHERS.range, harmful: false
    }),
    fireTimer: 1 + index * ARCHERS.stagger
  };
}

// Lính đấu trường: thấy người chơi ở mọi chỗ. `soldier` để skills.js đổi art.
export function makeArenaSoldier(centerX, direction) {
  return {
    ...makeEnemy(centerX - SOLDIER.w / 2, SOLDIER.w, SOLDIER.h, SOLDIER.hp, false, {
      patrolMin: ARENA.spawnEdge, patrolMax: ARENA.width - ARENA.spawnEdge, aggroRange: ARENA.width
    }),
    art: 'arena', soldier: true, panicLeft: 0, noBar: true, facing: direction
  };
}

// `options.layout === 'skills'`: vào thẳng GĐ 2, trụ đã cháy, thanh sợ không đầy.
export function level3Content(options) {
  const test = options.layout === 'skills';
  const posts = POSTS.centers.map(makePost);
  if (test) posts.forEach(burnAtStart);
  const drums = DRUMS.centers.map(makeDrum);
  const waters = WATER.spouts.map(makeWater);
  const archers = ARCHERS.centers.map(makeArcher);
  return {
    obstacles: [], holes: [], items: [], npcs: [], quizzes: [],
    hazards: [...waters, ...archers],
    enemies: [...posts, ...drums],
    battle: {
      test, phase: test ? 2 : 1, testStarted: false,
      fear: test ? POSTS.centers.length * POSTS.fear : 0, pendingFear: 0, fearMax: FEAR.max,
      posts, drums, archers, rocks: [], fxs: [],
      rockTimer: 1.5, soldierTimer: 1, hintTimer: 0, torchHintShown: false,
      boss: { pose: 'idle', time: 0 }, gateOpen: false, lord: null, marchers: null
    }
  };
}
