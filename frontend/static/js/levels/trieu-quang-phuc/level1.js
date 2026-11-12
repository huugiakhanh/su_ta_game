// Màn 1 "Tuổi trẻ rèn luyện" (TQP-L1, docs/archive/SUTA_TQP_TASK_L1_01.md):
//   - khu rèn luyện cố định chunk 1–2 (3 bù nhìn rơm, 2 cọc tre, bù nhìn cầm
//     giáo chỉ vỡ khi bổ; Triệu Quang Phục đứng chặn cuối chunk 2 tới khi vỡ hết);
//   - 11 nhóm chướng ngại xáo mỗi lượt vào 2 ô (a/b) của chunk 3–10 trong VÙNG
//     ĐƯỢC PHÉP + bẫy chông cố định chunk 9 + mini-boss đội trưởng giáo dài cố
//     định chunk 11 (2 lính hộ tống, chết rơi sách);
//   - 5 Quyển Sách Tinh Hoa (4 cố định + 1 từ đội trưởng), 4 câu hỏi chặn đường;
//   - sự kiện: câu hướng dẫn khu rèn luyện, rắn lao ra từ bụi cỏ; nghỉ chân = bình máu nằm sẵn.
// Layout thử `?layout=engine` (TQP-ENGINE). Mọi số DESIGN_BASELINE.

import { worldX, makeHazard, makeObstacle, setTerrain, buildTerrain, terrainHoles } from '../../engine/geometry.js';
import {
  makeEnemy, makeNpc, makeQuiz, makeItem, makeRestHeal, makePlatform, shuffle, pick, checkTerrainFootprints, checkPlatformReach
} from '../../engine/entities.js';
import { state } from '../../engine/state.js';
import { showMessage } from '../../engine/ui.js';
import { GROUND_Y, TERRAIN_CELL } from '../../engine/config.js';
import {
  QUIZ, SOLDIER, CAPTAIN, SNAKE, LEVEL1_CHUNKS, ENGINE_TEST, MINIBOSS, REST, LEVEL1_ITEMS, TRAINING, SLOTS,
  CROC_RIVER, BOAT_RIVER, MUD_ROWS, SMOKE, TREE, SNAKE_AMBUSH, SPEARMAN_POST, ROCK_LEDGE, BAMBOO_POST, TEXT
} from './config.js';
import { STORY_TQP_YARD } from './dialogue-data.js';
import { LEVEL1_QUESTION_POOL } from './questions-data.js';

// Lệch ngẫu nhiên mỗi nhóm trong ô (±px); nhóm có địa hình lệch bội số 1 ô, tối đa ±48.
const JITTER = 60;
const TERRAIN_JITTER = 48;
const FIRST_CHUNK = 3;
const LAST_CHUNK = 10;

// Lính Lương (hành vi guard của engine) đứng tâm tại worldX(chunk, localX).
export function makeSoldier(chunk, localX, art = null) {
  const enemy = makeEnemy(worldX(chunk, localX) - SOLDIER.w / 2, SOLDIER.w, SOLDIER.h, SOLDIER.hp, false);
  return art ? { ...enemy, art } : enemy;
}

// Rắn (rusher) nằm im (`rest` vô hạn) trong bụi cỏ tới khi người chơi tới gần
// (level1Events đánh thức). Lúc phục không vẽ thanh máu (`noBar`) để khỏi lộ.
export function makeSnake(chunk, localX) {
  return {
    ...makeEnemy(worldX(chunk, localX) - SNAKE.w / 2, SNAKE.w, SNAKE.h, SNAKE.hp, false),
    art: 'snake', facing: -1, direction: -1, rest: Infinity, walking: false, ambush: true, noBar: true
  };
}

export function makeSpikePit(chunk, localX) {
  return makeHazard('trap', 'bambooPit', chunk, localX, { harmful: false, triggerDistance: 58 });
}

// Bục một chiều có ảnh (mặt trên ở hàng 0 của ảnh).
export function makeLedge(chunk, localX, height) {
  return makePlatform(chunk, localX, height, ROCK_LEDGE.w, { sprite: ROCK_LEDGE.sprite });
}
// Cọc tre (vật cản `blocking`): tâm tại localX.
export function makePost(chunk, localX) {
  return { ...makeObstacle('bambooPost', chunk, localX - BAMBOO_POST.w / 2, BAMBOO_POST.w, BAMBOO_POST.h), blocking: true };
}

// Nhóm chướng ngại (Excel). `chunks` = vùng được phép (làng 3–4, bãi lau 5–7,
// đầm lầy 8–10); `slots` = ô được đặt ('a', 'b'; `full` = chiếm cả 2 ô);
// `terrain(slot)` = lưới chữ 48 ô của chunk, lệch theo dx (bội số 1 ô).
// build(chunk, x, dx) -> { hazards?, enemies?, obstacles?, platforms?, items?, tufts? } với
// x = local tâm ô đã lệch.
const AB = ['a', 'b'];
const LAND = [3, 4, 8, 9, 10];
const ALL = [3, 4, 5, 6, 7, 8, 9, 10];
const patrol = { chunks: ALL, slots: AB, build: (c, x) => ({ enemies: [makeSoldier(c, x)] }) };
// Lính giáo dài + cọc tre trước mặt (phía người chơi tới) để nhảy lên bổ.
const spearman = {
  chunks: ALL, slots: AB,
  build: (c, x) => ({ enemies: [makeSoldier(c, x, 'spearman')], obstacles: [makePost(c, x + SPEARMAN_POST.postDx)] })
};
const OBSTACLE_GROUPS = [
  patrol, patrol, spearman, spearman,
  // cung thủ phục kích trên cành cây — cây (prop) đứng trước trong danh sách để vẽ sau cung thủ
  { chunks: LAND, slots: AB, build: (c, x) => ({ hazards: [
    makeHazard('prop', 'archerTree', c, x),
    makeHazard('thrower', 'treeArcher', c, x + TREE.archerDx, {
      groundY: GROUND_Y - TREE.deck, projectile: 'crossbowBolt', aim: true,
      fireInterval: TREE.fireInterval, fireRange: TREE.fireRange
    })
  ] }) },
  // bẫy chông tre ẩn dưới lá
  { chunks: LAND, slots: AB, build: (c, x) => ({ hazards: [makeSpikePit(c, x)] }) },
  // rắn độc trong bụi cỏ (bụi vẽ trước người chơi — render-extras.js)
  { chunks: [5, 6, 7, 8, 9, 10], slots: AB, build: (c, x) => ({
    enemies: [makeSnake(c, x)], tufts: [worldX(c, x)]
  }) },
  // cá sấu Dạ Trạch trong khe nước (ô a)
  { chunks: [5, 6, 7], slots: ['a'], terrain: () => CROC_RIVER.rows, build: (c, x, dx) => ({ hazards: [
    makeHazard('lurker', 'crocodile', c, CROC_RIVER.x + dx, { groundY: GROUND_Y, floatY: CROC_RIVER.floatY, hp: 2, triggerRange: 110 })
  ] }) },
  // thuyền tuần tiễu thổi tù và gọi quân (khe 1) + mỏm đá giữa khe 2 — cả chunk
  { chunks: [5, 6, 7], slots: ['full'], terrain: () => BOAT_RIVER.rows, build: (c, x, dx) => ({
    hazards: [makeHazard('thrower', 'warBoat', c, BOAT_RIVER.boatX + dx, {
      groundY: GROUND_Y, floatY: BOAT_RIVER.floatY, harmful: false, hp: BOAT_RIVER.hp,
      projectile: 'fireArrow', aim: true, fireInterval: BOAT_RIVER.fireInterval,
      callHelp: {
        after: BOAT_RIVER.callHelp.after, range: BOAT_RIVER.callHelp.range,
        spawnAt: BOAT_RIVER.callHelp.spawnAt.map(localX => worldX(c, localX)),
        enemy: { w: SOLDIER.w, h: SOLDIER.h, hp: SOLDIER.hp }
      }
    })],
    platforms: [makeLedge(c, BOAT_RIVER.ledge[0] + dx, BOAT_RIVER.ledge[1])]
  }) },
  // bãi sình lầy (dải 160 px trong ô)
  { chunks: [8, 9, 10], slots: AB, terrain: slot => MUD_ROWS[slot], build: () => ({}) },
  // khói chướng khí bay ngang — 2 làn
  { chunks: [8, 9, 10], slots: AB, build: (c, x) => ({ hazards: SMOKE.map(([offset, lane, speed, travel]) =>
    makeHazard('drift', 'smoke', c, x + offset, { lane, speed, travel, gap: 1.2, triggerRange: 320 })) }) }
];
// Bẫy chông cố định chunk 9 (ngoài 11 nhóm xáo) — chiếm 1 ô trống của chunk.
const FIXED_SPIKE = { chunks: [9], slots: AB, build: (c, x) => ({ hazards: [makeSpikePit(c, x)] }) };

// Xếp nhóm vào ô: bẫy cố định trước, rồi nhóm hẹp vùng trước (thuyền, cá sấu,
// sình, khói...), mỗi nhóm chọn ngẫu nhiên 1 ô còn trống trong vùng; mỗi chunk
// tối đa 1 nhóm có địa hình. Kẹt thì thử lại.
function placeGroups() {
  for (let attempt = 0; attempt < 80; attempt++) {
    const free = new Map();
    for (let c = FIRST_CHUNK; c <= LAST_CHUNK; c++) free.set(c, new Set(AB));
    const terrainChunks = new Set();
    const order = [FIXED_SPIKE, ...shuffle(OBSTACLE_GROUPS).sort((a, b) => a.chunks.length - b.chunks.length)];
    const plan = [];
    const ok = order.every(group => {
      const options = [];
      group.chunks.forEach(chunk => {
        const slots = free.get(chunk);
        if (group.terrain && terrainChunks.has(chunk)) return;
        group.slots.forEach(slot => {
          if (slot === 'full' ? slots.size === 2 : slots.has(slot)) options.push({ chunk, slot });
        });
      });
      if (!options.length) return false;
      const choice = pick(options);
      if (choice.slot === 'full') free.get(choice.chunk).clear();
      else free.get(choice.chunk).delete(choice.slot);
      if (group.terrain) terrainChunks.add(choice.chunk);
      plan.push({ group, ...choice });
      return true;
    });
    if (ok) return plan;
  }
  throw new Error('TQP-L1: không xếp được nhóm chướng ngại vào ô');
}

function randomizeObstacles() {
  const plan = placeGroups().map(item => {
    const terrain = Boolean(item.group.terrain);
    const range = terrain ? TERRAIN_JITTER : JITTER;
    let dx = Math.round((Math.random() * 2 - 1) * range);
    if (terrain) dx = Math.round(dx / TERRAIN_CELL) * TERRAIN_CELL;
    return { ...item, dx };
  });
  // Địa hình phải có TRƯỚC khi dựng nội dung: vật/lính đứng theo groundYAt().
  setTerrain(buildTerrain(plan.filter(item => item.group.terrain).map(item => ({
    chunk: item.chunk, rows: item.group.terrain(item.slot), shift: item.dx / TERRAIN_CELL
  })), LEVEL1_CHUNKS));
  const layout = { hazards: [], enemies: [], obstacles: [], platforms: [], items: [], tufts: [] };
  plan.forEach(({ group, chunk, slot, dx }) => {
    const center = slot === 'full' ? 0 : SLOTS[slot];
    const built = group.build(chunk, center + dx, dx);
    Object.keys(layout).forEach(key => layout[key].push(...(built[key] || [])));
  });
  return layout;
}

// Khu rèn luyện (§2.1): 4 bù nhìn là "quân vây" (`captorOf`) của Triệu Quang
// Phục đứng chặn cuối chunk 2 — vỡ hết thì ông nói 1 câu rồi mờ dần.
function makeTrainingYard() {
  const npc = makeNpc('tqpYard', ...TRAINING.yardNpc, { story: STORY_TQP_YARD, hint: TEXT.yardLocked });
  const dummy = (sprite, [chunk, localX]) => ({ ...makeHazard('prop', sprite, chunk, localX, { hp: 1 }), captorOf: npc.id });
  return {
    npc,
    hazards: [
      ...TRAINING.dummies.map(spot => dummy('strawDummy', spot)),
      dummy('strawSpearman', TRAINING.spearDummy)
    ],
    obstacles: TRAINING.posts.map(([chunk, localX]) => makePost(chunk, localX))
  };
}

// Mini-boss đội trưởng giáo dài: enemy `boss` (phải hạ mới mở cổng) có hành
// vi lính canh của sprite `captain`; chở 1 sách (`carrier` = id). 2 lính hộ tống.
function makeMiniBoss() {
  const id = 'spear-captain';
  const center = worldX(MINIBOSS.chunk, MINIBOSS.localX);
  const enemy = makeEnemy(center - CAPTAIN.w / 2, CAPTAIN.w, CAPTAIN.h, MINIBOSS.hp, false, {
    patrolMin: center - 100, patrolMax: center + 100, aggroRange: 170
  });
  return {
    enemy: { ...enemy, art: 'captain', boss: true, id },
    item: makeItem(MINIBOSS.chunk, MINIBOSS.localX, MINIBOSS.itemLift, { carrier: id }),
    escorts: MINIBOSS.escorts.map(localX => makeSoldier(MINIBOSS.chunk, localX))
  };
}

// Mỗi lượt rút QUIZ.level1Count câu KHÔNG trùng, đặt lần lượt vào level1Spots.
function level1Quizzes() {
  const chosen = shuffle(LEVEL1_QUESTION_POOL).slice(0, QUIZ.level1Count);
  return chosen.map((stt, index) => makeQuiz(...QUIZ.level1Spots[index], stt));
}

// Layout thử `?layout=engine` (TQP-ENGINE): sình (chunk 1), khói trôi 2 làn
// (2), cá sấu trong khe sông (3), thuyền gọi viện (4), lính giáo dài + bục (5),
// vùng ẩn nấp + cung thủ + NPC khoá 2 sách (6); máu tối đa +2. Không câu hỏi.
function engineTestLayout() {
  const t = ENGINE_TEST;
  setTerrain(buildTerrain([
    { chunk: 1, rows: t.mud },
    { chunk: 3, rows: BOAT_RIVER.rows },
    { chunk: 4, rows: BOAT_RIVER.rows }
  ], LEVEL1_CHUNKS));
  const [crocChunk, crocX, crocFloat] = t.crocodile;
  const [boatChunk, boatX, boatFloat] = t.boat;
  const [coverChunk, coverX, coverW] = t.covers;
  const [npcChunk, npcX, requires] = t.npc;
  const [platformChunk, platformX, platformHeight, platformW] = t.platform;
  return {
    bonusHealth: t.bonusHealth,
    obstacles: [],
    hazards: [
      ...t.smoke.map(([chunk, localX, lane, speed, travel]) => makeHazard('drift', 'smoke', chunk, localX, {
        lane, speed, travel, gap: 1.2, triggerRange: 320
      })),
      makeHazard('lurker', 'crocodile', crocChunk, crocX, { groundY: GROUND_Y, floatY: crocFloat, hp: 2, triggerRange: 110 }),
      makeHazard('thrower', 'warBoat', boatChunk, boatX, {
        groundY: GROUND_Y, floatY: boatFloat, harmful: false, hp: 3,
        projectile: 'fireArrow', aim: true, fireInterval: 2.2,
        callHelp: {
          after: t.callHelp.after, range: t.callHelp.range,
          spawnAt: t.callHelp.spawnAt.map(([chunk, localX]) => worldX(chunk, localX)),
          enemy: { w: SOLDIER.w, h: SOLDIER.h, hp: SOLDIER.hp }
        }
      }),
      makeHazard('thrower', 'archer', ...t.archer, { projectile: 'crossbowBolt', aim: true, fireInterval: 2, fireRange: 200 })
    ],
    holes: terrainHoles(),
    items: t.npcItems.map(([chunk, localX, lift]) => makeItem(chunk, localX, lift)),
    enemies: [
      makeSoldier(...t.mudGuard),
      ...t.spearmen.map(([chunk, localX]) => makeSoldier(chunk, localX, 'spearman')),
      ...t.coverGuards.map(([chunk, localX]) => makeSoldier(chunk, localX))
    ],
    npcs: [makeNpc('testNpc', npcChunk, npcX, { requires })],
    quizzes: [],
    covers: [{ x: worldX(coverChunk, coverX), w: coverW }],
    platforms: [
      makeLedge(3, BOAT_RIVER.ledge[0], BOAT_RIVER.ledge[1]), makeLedge(4, BOAT_RIVER.ledge[0], BOAT_RIVER.ledge[1]),
      makePlatform(platformChunk, platformX, platformHeight, platformW)
    ]
  };
}

export function level1Content(options = {}) {
  if (options.layout === 'engine') return engineTestLayout();
  const layout = randomizeObstacles();
  const yard = makeTrainingYard();
  const boss = makeMiniBoss();
  const content = {
    obstacles: [...yard.obstacles, ...layout.obstacles],
    hazards: [...yard.hazards, ...layout.hazards],
    holes: terrainHoles(),
    items: [...LEVEL1_ITEMS.map(([chunk, localX, lift]) => makeItem(chunk, localX, lift)), ...layout.items, boss.item],
    enemies: [...layout.enemies, boss.enemy, ...boss.escorts],
    npcs: [yard.npc],
    quizzes: level1Quizzes(),
    platforms: layout.platforms,
    tufts: layout.tufts,
    // Nghỉ chân: bình máu nằm sẵn (NQ-REST-01).
    pickups: [makeRestHeal(REST.chunk, REST.localX)]
  };
  checkTerrainFootprints(content);
  checkPlatformReach(content);
  return content;
}

// Rắn phục trong bụi cỏ lao ra khi người chơi cách dưới SNAKE_AMBUSH.ambushRange
// (dùng chung màn 1–2).
export function wakeAmbushers(p) {
  const center = p.x + p.w / 2;
  state.enemies.forEach(enemy => {
    if (!enemy.ambush || !enemy.alive) return;
    if (Math.abs(enemy.x + enemy.w / 2 - center) > SNAKE_AMBUSH.ambushRange) return;
    enemy.ambush = false;
    enemy.noBar = false;
    enemy.rest = .01;
  });
}

// Sự kiện mỗi frame: câu hướng dẫn khu rèn luyện (1 lần mỗi câu, theo thứ tự);
// rắn trong bụi cỏ lao ra khi người chơi tới gần.
export function level1Events(p) {
  const tip = TRAINING.tips[state.tipIndex];
  if (tip && p.x > worldX(tip[0], tip[1])) {
    state.tipIndex += 1;
    showMessage(tip[2], 3200);
  }
  wakeAmbushers(p);
}
