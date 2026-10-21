// Màn 1 "Rừng núi Nưa" (BT-L1, docs/SUTA_BT_TASK_L1_01.md): 10 nhóm chướng ngại
// xáo mỗi lượt vào chunk 1–10 trong VÙNG ĐƯỢC PHÉP của nhóm + hố chông tre và
// mini-boss tham quan thu thuế cố định chunk 11 = đúng 12 chướng ngại; 5 Quyển
// Sách Tinh Hoa; 4 câu hỏi chặn đường; Bà Triệu đứng chờ đầu màn (chapter.js
// guide). Sự kiện 1 lần: nghỉ chân hồi 1 máu. Layout thử `?layout=engine`.
// Mọi số DESIGN_BASELINE.

import { worldX, makeHazard, setTerrain, buildTerrain, terrainHoles } from '../../engine/geometry.js';
import {
  makeEnemy, makeQuiz, makeItem, makePlatform, shuffle, pick, checkTerrainFootprints, checkPlatformReach
} from '../../engine/entities.js';
import { state } from '../../engine/state.js';
import { showMessage } from '../../engine/ui.js';
import { playSfx } from '../../engine/audio.js';
import { TERRAIN_CELL, MAX_HEALTH } from '../../engine/config.js';
import {
  QUIZ, ENGINE_TEST, LEVEL1_CHUNKS, LUMBERJACK, BRANCH, MINIBOSS, FIXED_PIT, REST, LEVEL1_ITEMS
} from './config.js';
import { LEVEL1_QUESTION_POOL } from './questions-data.js';

// Lệch ngẫu nhiên mỗi nhóm trong chunk (±px); nhóm có địa hình lệch bội số 1 ô.
const JITTER = 60;
const SHUFFLED_CHUNKS = 10;

// Lính đốn gỗ (hành vi guard của engine) đứng tâm tại worldX(chunk, localX).
function makeLumberjack(chunk, localX) {
  return makeEnemy(worldX(chunk, localX) - LUMBERJACK.w / 2, LUMBERJACK.w, LUMBERJACK.h, LUMBERJACK.hp, false);
}

// Bục cành cây: [chunk, localX (mép trái thân cành), cao, 'short' | 'long'].
function makeBranch([chunk, localX, height, kind]) {
  const branch = BRANCH[kind];
  return makePlatform(chunk, localX, height, branch.w, { sprite: branch.sprite });
}

function makeBambooPit(chunk, localX) {
  return makeHazard('trap', 'bambooPit', chunk, localX, { harmful: false, triggerDistance: 58 });
}

// Chướng khí: 3 miệng khí lệch nhịp + 3 cành dài nối nhau cao 60 px phía trên.
function miasmaGroup(chunk, dx) {
  return {
    hazards: [[200, 0], [310, .8], [420, 1.6]].map(([localX, phase]) =>
      makeHazard('vent', 'miasma', chunk, localX + dx, { phase })),
    platforms: [150, 270, 390].map(localX => makeBranch([chunk, localX + dx, 60, 'long']))
  };
}

// Nhóm chướng ngại (Excel "8 chướng ngại vật"). `chunks` = vùng được phép;
// `easy` = được đặt ở chunk 1 (chỉ nhóm dễ ở chunk 1, như chương 1). Mỗi nhóm:
// (chunk, dx) -> { obstacles?, hazards?, enemies?, platforms? }. `terrain`: lưới
// chữ 48 ô của chunk đó (TT-TERRAIN-01), lệch theo dx (bội số 1 ô).
// Gò đất 1 ô ở local 416–544 (sau bia câu hỏi x 312, trước điểm đá xuất phát 740).
const SLOPE = ['..........................########..............', '################################################'];
const ALL = [2, 3, 4, 5, 6, 7, 8, 9, 10];
const hunter = (c, dx) => ({ hazards: [makeHazard('thrower', 'ngoHunter', c, 470 + dx, {
  projectile: 'crossbowBolt', fireInterval: 3.0, fireRange: 240, hp: 2
})] });
const boulder = (c, dx) => ({ hazards: [makeHazard('roller', 'boulder', c, 740 + dx, {
  speed: -100, triggerX: worldX(c, 220 + dx), hp: 2
})] });
const OBSTACLE_GROUPS = [
  // lính đốn gỗ phá rừng — rìu vung ngang chậm, sát thương 2
  { chunks: ALL, build: (c, dx) => ({ enemies: [makeLumberjack(c, 600 + dx)] }) },
  { chunks: ALL, build: (c, dx) => ({ enemies: [makeLumberjack(c, 600 + dx)] }) },
  // thợ săn quan lại nấp trong bụi — bắn nỏ ngang
  { chunks: ALL, build: hunter },
  { chunks: ALL, build: hunter },
  // đá tảng lăn từ dốc núi — nhảy qua hoặc chém vỡ; lăn qua gò đất 1 ô
  { chunks: [6, 7, 8], terrain: SLOPE, build: boulder },
  // (không chunk 10: bia câu hỏi local 560 trùng gò đất)
  { chunks: [5, 6, 7, 8, 9], terrain: SLOPE, build: boulder },
  // voi rừng chưa thuần — không giết được, nhảy lên lưng để qua
  { chunks: [6, 7, 8], build: (c, dx) => ({ hazards: [makeHazard('roller', 'wildElephant', c, 720 + dx, {
    speed: -60, triggerX: worldX(c, 150 + dx)
  })] }) },
  // hố chông tre — căn nhịp nhảy (nhóm dễ)
  { easy: true, chunks: [1, ...ALL], build: (c, dx) => ({ hazards: [makeBambooPit(c, 492 + dx)] }) },
  // kỵ binh Ngô phi nhanh — kích hoạt khi còn ngoài màn hình
  { chunks: ALL, build: (c, dx) => ({ hazards: [makeHazard('roller', 'ngoCavalry', c, 780 + dx, {
    speed: -190, triggerX: worldX(c, 260 + dx), hp: 3
  })] }) },
  // chướng khí rừng thiêng — leo lên cành cây cao để tránh
  { chunks: [4, 5], build: miasmaGroup }
];

// Xếp 10 nhóm vào 10 chunk: chunk 1 = nhóm dễ; còn lại nhóm hẹp vùng trước
// (chướng khí, voi, đá), mỗi nhóm chọn ngẫu nhiên 1 chunk còn trống trong vùng.
// Kẹt (vùng giao nhau) thì thử lại.
function placeGroups() {
  for (let attempt = 0; attempt < 50; attempt++) {
    const free = new Set(Array.from({ length: SHUFFLED_CHUNKS - 1 }, (_, i) => i + 2));
    const easy = pick(OBSTACLE_GROUPS.filter(group => group.easy));
    const plan = [{ group: easy, chunk: 1 }];
    const rest = shuffle(OBSTACLE_GROUPS.filter(group => group !== easy))
      .sort((a, b) => a.chunks.length - b.chunks.length);
    const ok = rest.every(group => {
      const options = group.chunks.filter(chunk => free.has(chunk));
      if (!options.length) return false;
      const chunk = pick(options);
      free.delete(chunk);
      plan.push({ group, chunk });
      return true;
    });
    if (ok) return plan;
  }
  throw new Error('BT-L1: không xếp được nhóm chướng ngại vào vùng');
}

function randomizeObstacles() {
  const plan = placeGroups().map(item => {
    let dx = Math.round((Math.random() * 2 - 1) * JITTER);
    if (item.group.terrain) dx = Math.round(dx / TERRAIN_CELL) * TERRAIN_CELL;
    return { ...item, dx };
  });
  // Địa hình phải có TRƯỚC khi dựng nội dung: vật/lính đứng theo groundYAt().
  setTerrain(buildTerrain(plan.filter(item => item.group.terrain).map(item => ({
    chunk: item.chunk, rows: item.group.terrain, shift: item.dx / TERRAIN_CELL
  })), LEVEL1_CHUNKS));
  const layout = { obstacles: [], hazards: [], enemies: [], platforms: [] };
  plan.forEach(({ group, chunk, dx }) => {
    const built = group.build(chunk, dx);
    Object.keys(layout).forEach(key => layout[key].push(...(built[key] || [])));
  });
  return layout;
}

// Mini-boss tham quan thu thuế: hành vi `patrol` của engine (như kiệu quan
// chương 1), `boss: true` -> phải hạ mới mở cổng.
function makeMiniBoss() {
  const hazard = makeHazard('patrol', 'ngoTaxOfficial', MINIBOSS.chunk, MINIBOSS.localX, {
    speed: -MINIBOSS.speed, hp: MINIBOSS.hp, projectile: 'silverChest',
    fireInterval: MINIBOSS.fireInterval, fireRange: MINIBOSS.fireRange
  });
  const center = worldX(MINIBOSS.chunk, MINIBOSS.localX);
  return {
    ...hazard,
    boss: true,
    hitScore: MINIBOSS.hitScore,
    defeatScore: MINIBOSS.defeatScore,
    patrolMin: center - MINIBOSS.patrolRange / 2,
    patrolMax: center + MINIBOSS.patrolRange / 2,
    walking: true
  };
}

// Mỗi lượt rút QUIZ.level1Count câu KHÔNG trùng, đặt lần lượt vào level1Spots.
function level1Quizzes() {
  const chosen = shuffle(LEVEL1_QUESTION_POOL).slice(0, QUIZ.level1Count);
  return chosen.map((stt, index) => makeQuiz(...QUIZ.level1Spots[index], stt));
}

// Layout thử `?layout=engine` (BT-ENGINE B): bậc bục, bục trên hố, cành cây
// trên 3 miệng chướng khí lệch nhịp, voi rừng (đứng lên lưng), đá lăn. Không
// sách/câu hỏi/quân.
function engineTestLayout() {
  const t = ENGINE_TEST;
  setTerrain(buildTerrain([{ chunk: t.holeChunk, rows: [t.holeRow] }], LEVEL1_CHUNKS));
  const content = {
    obstacles: [],
    hazards: [
      ...t.vents.map(([chunk, localX, phase]) => makeHazard('vent', 'miasma', chunk, localX, { phase })),
      makeHazard('roller', 'wildElephant', t.elephant.chunk, t.elephant.localX, {
        speed: t.elephant.speed, triggerX: worldX(t.elephant.chunk, t.elephant.triggerLocalX)
      }),
      makeHazard('roller', 'boulder', t.boulder.chunk, t.boulder.localX, {
        speed: t.boulder.speed, triggerX: worldX(t.boulder.chunk, t.boulder.triggerLocalX), hp: t.boulder.hp
      })
    ],
    holes: terrainHoles(),
    items: [],
    enemies: [],
    npcs: [],
    quizzes: [],
    platforms: [...t.stairs, t.overHole, ...t.branches].map(makeBranch)
  };
  checkPlatformReach(content);
  return content;
}

export function level1Content(options = {}) {
  if (options.layout === 'engine') return engineTestLayout();
  const layout = randomizeObstacles();
  const content = {
    obstacles: layout.obstacles,
    hazards: [...layout.hazards, makeBambooPit(FIXED_PIT.chunk, FIXED_PIT.localX), makeMiniBoss()],
    holes: terrainHoles(),
    items: LEVEL1_ITEMS.map(([chunk, localX, lift]) => makeItem(chunk, localX, lift)),
    enemies: layout.enemies,
    npcs: [],
    quizzes: level1Quizzes(),
    platforms: layout.platforms
  };
  checkTerrainFootprints(content);
  checkPlatformReach(content);
  return content;
}

// Sự kiện 1 lần (Q2): nghỉ chân hồi 1 máu khi vượt REST.
export function level1Events(p) {
  if (!state.restUsed && p.x > worldX(REST.chunk, REST.localX)) {
    state.restUsed = true;
    state.health = Math.min(MAX_HEALTH, state.health + 1);
    playSfx('heal');
    showMessage('Nghỉ chân: hồi 1 máu.');
  }
}
