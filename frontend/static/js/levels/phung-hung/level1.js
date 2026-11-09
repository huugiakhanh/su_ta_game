// Màn 1 "Trai tráng Đường Lâm" (PH-L1, docs/SUTA_PH_TASK_L1_01.md), 12 chunk:
//   - bài học cố định theo thứ tự đòn gồng: hổ + bù nhìn (3–4), lính khiên (5),
//     trâu mộng (7), hào chông (9), xe muối + lính gác ải (11–12);
//   - 7 nhóm phụ xáo vào 2 ô của chunk 2, 6, 8, 10: lính tuần, đá ong, thợ săn;
//   - 5 Quyển Sách Tinh Hoa (2 trên đường + hổ, lính khiên, rào), 4 câu hỏi;
//   - cổng ải mở khi đủ sách, đã hạ hổ và 2 lính gác (`boss: true`).
// Layout thử `?layout=engine` (PH-ENGINE). Mọi số DESIGN_BASELINE.

import { worldX, makeHazard, setTerrain, buildTerrain, terrainHoles } from '../../engine/geometry.js';
import { state } from '../../engine/state.js';
import { GROUND_Y } from '../../engine/config.js';
import { tickAnim } from '../../engine/animation.js';
import { strike } from '../../engine/combat.js';
import { showMessage } from '../../engine/ui.js';
import { playSfx } from '../../engine/audio.js';
import {
  makeEnemy, makeQuiz, makeItem, makeExtra, makeDecoy, makeNpc, shuffle, pick, checkTerrainFootprints
} from '../../engine/entities.js';
import {
  QUIZ, SOLDIER, ENGINE_TEST, LEVEL1_CHUNKS, SCARECROW, LEVEL1, SLOTS, SLOT_JITTER, ROCK, TREE, TEXT
} from './config.js';
import { LEVEL1_QUESTION_POOL } from './questions-data.js';

const TIGER_ID = 'ph-tiger';
const SHIELD_ID = 'ph-shield';
const FENCE_ID = 'ph-fence';
const SLOT_NAMES = ['a', 'b'];
const SHUFFLED_CHUNKS = [2, 6, 8, 10];

// Mỗi lượt rút QUIZ.level1Count câu KHÔNG trùng, đặt lần lượt vào level1Spots.
function level1Quizzes() {
  const chosen = shuffle(LEVEL1_QUESTION_POOL).slice(0, QUIZ.level1Count);
  return chosen.map((stt, index) => makeQuiz(...QUIZ.level1Spots[index], stt));
}

// Lính (hành vi guard của engine) đứng tâm tại worldX(chunk, localX).
export function makeSoldier(chunk, localX) {
  return makeEnemy(worldX(chunk, localX) - SOLDIER.w / 2, SOLDIER.w, SOLDIER.h, SOLDIER.hp, false);
}

// Lính khiên: chỉ vỡ bởi đòn gồng (art `shield`).
export function makeShield(chunk, localX, hp, options = {}) {
  return { ...makeSoldier(chunk, localX), art: 'shield', hp, maxHp: hp, ...options };
}

// Đá ong rơi: ẩn tới khi có người vào công tắc (updateRocks bật hình).
export function makeRock(chunk, localX) {
  return { hazards: [{ ...makeHazard('snare', 'lateriteRock', chunk, localX, ROCK), invisible: true }] };
}

// Thợ săn trên cây: cây (prop) đứng trước trong danh sách để vẽ sau thợ săn.
export function makeTreeHunter(chunk, localX) {
  return { hazards: [
    makeHazard('prop', 'archerTree', chunk, localX),
    makeHazard('thrower', 'treeHunter', chunk, localX + TREE.archerDx, {
      groundY: GROUND_Y - TREE.deck, projectile: 'crossbowBolt', aim: true,
      fireInterval: TREE.fireInterval, fireRange: TREE.fireRange
    })
  ] };
}

// Nhóm xáo. `chunks` = vùng được phép. build(chunk, x) -> { hazards?, enemies? }.
const patrol = { chunks: SHUFFLED_CHUNKS, build: (c, x) => ({ enemies: [makeSoldier(c, x)] }) };
const rock = { chunks: [6, 8], build: makeRock };
const hunter = { chunks: SHUFFLED_CHUNKS, build: makeTreeHunter };
const SHUFFLED_GROUPS = [patrol, patrol, patrol, rock, rock, hunter, hunter];

// Xếp nhóm vào ô: nhóm hẹp vùng trước, mỗi nhóm chọn ngẫu nhiên 1 ô còn trống.
function placeGroups() {
  for (let attempt = 0; attempt < 80; attempt++) {
    const free = new Map(SHUFFLED_CHUNKS.map(chunk => [chunk, new Set(SLOT_NAMES)]));
    const plan = [];
    const ok = [...shuffle(SHUFFLED_GROUPS)].sort((a, b) => a.chunks.length - b.chunks.length).every(group => {
      const options = group.chunks.flatMap(chunk => [...free.get(chunk)].map(slot => ({ chunk, slot })));
      if (!options.length) return false;
      const choice = pick(options);
      free.get(choice.chunk).delete(choice.slot);
      plan.push({ group, ...choice });
      return true;
    });
    if (ok) return plan;
  }
  throw new Error('PH-L1: không xếp được nhóm chướng ngại vào ô');
}

function randomizeObstacles() {
  const layout = { hazards: [], enemies: [] };
  placeGroups().forEach(({ group, chunk, slot }) => {
    const dx = Math.round((Math.random() * 2 - 1) * SLOT_JITTER);
    const built = group.build(chunk, SLOTS[slot] + dx);
    layout.hazards.push(...(built.hazards || []));
    layout.enemies.push(...(built.enemies || []));
  });
  return layout;
}

// Mãnh hổ: mini-boss (`boss` giữ cổng), vồ bù nhìn thì khựng, rơi 1 sách.
function makeTiger() {
  const { at, span, hp, triggerRange } = LEVEL1.tiger;
  return {
    ...makeHazard('pounce', 'tiger', ...at, {
      id: TIGER_ID, hp, triggerRange, span: [worldX(...span[0]), worldX(...span[1])]
    }),
    boss: true
  };
}

// Trâu mộng lao tới từ phải khi người chơi tới gần.
function makeBuffalo() {
  const { at, speed, trigger } = LEVEL1.buffalo;
  return makeHazard('roller', 'buffalo', ...at, { speed, triggerX: worldX(...at) - trigger, hp: 1 });
}

// Lính gác ải: đứng yên, kiếm không hạ được, chỉ xe muối húc mới hạ (onPushHit).
function makeGateGuard(chunk, localX) {
  return { ...makeSoldier(chunk, localX), art: 'normal', kind: 'gateGuard', boss: true };
}

// Layout thử `?layout=engine` (PH-ENGINE): mỗi chunk một cơ chế E1–E6.
function engineTestLayout() {
  const t = ENGINE_TEST;
  setTerrain(buildTerrain([{ chunk: 4, rows: t.hole }, { chunk: 5, rows: t.spikes }], LEVEL1_CHUNKS));
  const [spanChunk, spanMin, spanMax] = t.tigerSpan;
  return {
    layoutTest: 'engine',
    obstacles: [],
    hazards: [
      makeHazard('pounce', 'tiger', ...t.tiger, { hp: 9, triggerRange: 300, span: [worldX(spanChunk, spanMin), worldX(spanChunk, spanMax)] }),
      makeHazard('roller', 'buffalo', ...t.buffalo, { speed: -220, triggerX: worldX(...t.buffalo) - t.buffaloTrigger, hp: 1 }),
      makeHazard('prop', 'barrier', ...t.barrier, { hp: 3 }),
      makeHazard('prop', 'saltCart', ...t.cart)
    ],
    holes: terrainHoles(),
    items: [makeItem(...t.book)],
    extras: [makeExtra('weapon', ...t.weapon)],
    decoys: t.decoys.map(spot => makeDecoy(...spot, SCARECROW)),
    enemies: [
      { ...makeShield(...t.sandbag, 6), kind: 'testBag' },
      makeShield(...t.shieldGuard, 6),
      ...t.soldiers.map(spot => makeSoldier(...spot)),
      ...t.cartGuards.map(spot => makeSoldier(...spot))
    ],
    npcs: [makeNpc('testNpc', ...t.npc, { requires: 1, extras: { weapon: 1 } })],
    quizzes: []
  };
}

// Bao cát của layout thử + lính gác ải: quay mặt về người chơi, không đi, không đánh.
export const ENEMY_KINDS = {
  testBag: { update() {} },
  gateGuard: {
    update(enemy, dt) {
      enemy.facing = state.player.x + state.player.w / 2 < enemy.x + enemy.w / 2 ? -1 : 1;
      tickAnim(enemy, dt);
    },
    blockStrike() {
      showMessage(TEXT.gateGuardBlock);
      return true;
    }
  }
};

// Xe muối húc lính gác: bỏ `kind` để chạy luồng chết thường, hạ ngay.
export function onPushHit(body, enemy) {
  if (enemy.kind !== 'gateGuard') return false;
  enemy.kind = null;
  strike(enemy, enemy.hp);
  return true;
}

export function level1Content(options = {}) {
  if (options.layout === 'engine') return engineTestLayout();
  const { firstGuard, books, bookLift, shield, buffaloGuards, fence, bookFence, trench, cart, gateGuards, decoys } = LEVEL1;
  setTerrain(buildTerrain([{ chunk: trench.chunk, rows: trench.rows }], LEVEL1_CHUNKS));
  const layout = randomizeObstacles();
  const content = {
    obstacles: [],
    hazards: [
      makeTiger(),
      makeBuffalo(),
      makeHazard('prop', 'barrier', ...fence, { hp: 3 }),
      makeHazard('prop', 'barrier', ...bookFence, { hp: 3, id: FENCE_ID }),
      makeHazard('prop', 'saltCart', ...cart),
      ...layout.hazards
    ],
    holes: terrainHoles(),
    items: [
      ...books.map(([chunk, localX, lift]) => makeItem(chunk, localX, lift)),
      makeItem(...LEVEL1.tiger.at, bookLift, { carrier: TIGER_ID }),
      makeItem(...shield.at, bookLift, { carrier: SHIELD_ID }),
      makeItem(...bookFence, bookLift, { carrier: FENCE_ID })
    ],
    decoys: decoys.map(spot => makeDecoy(...spot, SCARECROW)),
    enemies: [
      makeSoldier(...firstGuard),
      makeShield(...shield.at, shield.hp, { id: SHIELD_ID }),
      ...buffaloGuards.map(spot => makeSoldier(...spot)),
      ...gateGuards.map(spot => makeGateGuard(...spot)),
      ...layout.enemies
    ],
    npcs: [],
    quizzes: level1Quizzes()
  };
  checkTerrainFootprints(content);
  return content;
}

// Đá ong ẩn cho tới khi công tắc kích hoạt (tránh đá treo lơ lửng giữa trời).
export function updateRocks() {
  state.hazards.forEach(hazard => {
    if (hazard.kind === 'snare' && hazard.invisible && hazard.snareState !== 'idle') hazard.invisible = false;
  });
}

// Sự kiện mỗi frame: câu hướng dẫn (1 lần mỗi câu, theo thứ tự), đá ong, nghỉ chân.
export function level1Events(p) {
  if (state.layoutTest) return;
  updateRocks();
  const tip = LEVEL1.tips[state.tipIndex];
  if (tip && p.x > worldX(tip[0], tip[1])) {
    state.tipIndex += 1;
    showMessage(tip[2], 3200);
  }
  if (!state.restUsed && p.x > worldX(...LEVEL1.rest)) {
    state.restUsed = true;
    state.health = Math.min(state.maxHealth, state.health + 1);
    playSfx('heal');
    showMessage(TEXT.rest);
  }
}
