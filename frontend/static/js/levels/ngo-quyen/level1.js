// Màn 1 "Hành quân ra Bắc" (NQ-L1, docs/SUTA_NQ_TASK_L1_01.md), 12 chunk:
//   - bến Ái Châu 1–3: tập lái thuyền (khe 1), sách giữa sông (khe 2), xoáy nước
//     giữa dòng + 2 thuyền 2 bên (khe 3);
//   - đường ra Bắc 4–8: cá sấu (khe 4), gió ngược + đá nấp, đá lăn; nhóm xáo ở 4, 7;
//   - ngoài Đại La 9–12: lính giáo rơi lao, cung thủ trên ụ thành, Kiều Công Tiễn
//     (mini-boss `boss`, `plungeOnly`) + 2 lính hộ vệ trước cổng Đại La;
//   - 5 Quyển Sách Tinh Hoa (3 trên đường + cung thủ thứ 2 + Kiều Công Tiễn), 4 câu hỏi.
// Layout thử `?layout=engine` (NQ-ENGINE). Mọi số DESIGN_BASELINE.

import { worldX, makeHazard, setTerrain, buildTerrain, terrainHoles } from '../../engine/geometry.js';
import { GROUND_Y, CHUNK_W } from '../../engine/config.js';
import {
  makeEnemy, makeQuiz, makeItem, makeRestHeal, makeStakeSpot, shuffle, checkTerrainFootprints
} from '../../engine/entities.js';
import { state } from '../../engine/state.js';
import { showMessage } from '../../engine/ui.js';
import { openStory } from '../../engine/dialogue.js';
import {
  QUIZ, SOLDIER, KCT, LEVEL1, LEVEL1_CHUNKS, RIVERS, SLOTS, SLOT_JITTER, SHUFFLED_CHUNKS, BOULDER, RAMPART,
  SHELTER, JAVELIN_FROM_X, ENGINE_TEST, BOAT_FLOAT, WATER_SURFACE, TEXT
} from './config.js';
import { STORY_NQ_KCT } from './dialogue-data.js';
import { LEVEL1_QUESTION_POOL } from './questions-data.js';

const ARCHER_ID = 'nq-archer-2';
const KCT_ID = 'nq-kieu-cong-tien';
const SLOT_NAMES = ['a', 'b'];
// Xoáy FX_NQ_WHIRLPOOL (ô 16 cao, tâm ở giữa): đáy ảnh dưới mặt nước 8 px.
const WHIRL_SINK = 8;

// Mỗi lượt rút QUIZ.level1Count câu KHÔNG trùng, đặt lần lượt vào level1Spots.
function level1Quizzes() {
  const chosen = shuffle(LEVEL1_QUESTION_POOL).slice(0, QUIZ.level1Count);
  return chosen.map((stt, index) => makeQuiz(...QUIZ.level1Spots[index], stt));
}

// Lính (hành vi guard của engine) đứng tâm tại worldX(chunk, localX).
export function makeSoldier(chunk, localX) {
  return makeEnemy(worldX(chunk, localX) - SOLDIER.w / 2, SOLDIER.w, SOLDIER.h, SOLDIER.hp, false);
}

export const makeBoat = (chunk, localX) => makeHazard('boat', 'boat', chunk, localX, { floatY: BOAT_FLOAT, groundY: GROUND_Y });

// Vùng gió + đá nấp ở giữa; vùng nấp là dải `SHELTER.w` sát mép trái đá.
export function makeGust(chunk, localX, phase = 0) {
  const rock = makeHazard('prop', 'shelterRock', chunk, localX);
  return {
    hazards: [{ ...makeHazard('gust', 'gust', chunk, localX), phase }, rock],
    shelters: [{ x: rock.x - SHELTER.w, w: SHELTER.w }]
  };
}

// Đá lăn tới từ phải khi người chơi cách BOULDER.trigger px.
function makeBoulder(chunk, localX) {
  return makeHazard('roller', 'boulder', chunk, localX, {
    speed: BOULDER.speed, triggerX: worldX(chunk, localX) - BOULDER.trigger, hp: BOULDER.hp
  });
}

// Cung thủ đứng trên mặt ụ thành (ụ chỉ vẽ — lớp vẽ `ramparts` của chương).
function makeArcher(chunk, localX, options = {}) {
  return makeHazard('thrower', 'archer', chunk, localX + RAMPART.archerDx, {
    groundY: GROUND_Y - RAMPART.deck, projectile: 'crossbowBolt', aim: true, hp: RAMPART.hp,
    fireInterval: RAMPART.fireInterval, fireRange: RAMPART.fireRange, ...options
  });
}

// Mini-boss Kiều Công Tiễn: enemy `boss` (giữ cổng) có hành vi lính canh của art
// `kct`; chở sách thứ 5 (`carrier` = id).
function makeKieuCongTien() {
  const { at, hp, patrol } = LEVEL1.kct;
  const center = worldX(...at);
  const enemy = makeEnemy(center - KCT.w / 2, KCT.w, KCT.h, hp, false, {
    patrolMin: center - patrol, patrolMax: center + patrol, aggroRange: 170
  });
  return { ...enemy, art: 'kct', boss: true, id: KCT_ID };
}

// Nhóm xáo (chunk 4, 7): 3 lính tuần + 1 vùng gió có đá nấp.
const patrol = { build: (c, x) => ({ enemies: [makeSoldier(c, x)] }) };
const gust = { build: (c, x) => makeGust(c, x, Math.random() * 3) };
const SHUFFLED_GROUPS = [patrol, patrol, patrol, gust];

function randomizeObstacles() {
  const slots = shuffle(SHUFFLED_CHUNKS.flatMap(chunk => SLOT_NAMES.map(slot => ({ chunk, slot }))));
  const layout = { hazards: [], enemies: [], shelters: [] };
  shuffle(SHUFFLED_GROUPS).forEach((group, index) => {
    const { chunk, slot } = slots[index];
    const dx = Math.round((Math.random() * 2 - 1) * SLOT_JITTER);
    const built = group.build(chunk, SLOTS[slot] + dx);
    layout.hazards.push(...(built.hazards || []));
    layout.enemies.push(...(built.enemies || []));
    layout.shelters.push(...(built.shelters || []));
  });
  return layout;
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
      ...t.boats.map(spot => makeBoat(...spot)),
      makeHazard('whirl', 'whirl', ...t.whirl, { groundY: GROUND_Y }),
      ...t.gusts.map(([chunk, localX, phase]) => ({ ...makeHazard('gust', 'gust', chunk, localX), phase })),
      ...t.shelters.map(spot => makeHazard('prop', 'shelterRock', ...spot)),
      ...t.hiddenStakes.map(spot => makeHazard('prop', 'hiddenStake', ...spot, { groundY: GROUND_Y + 6 })),
      makeHazard('prop', 'stakePile', ...t.pile),
      makeHazard('thrower', 'netRaft', ...t.netRaft, { projectile: 'net', fireInterval: 2.5, fireRange: 260, aim: false })
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
  const L = LEVEL1;
  setTerrain(buildTerrain(RIVERS, LEVEL1_CHUNKS));
  const layout = randomizeObstacles();
  const gusts = L.gusts.map(([chunk, localX, phase]) => makeGust(chunk, localX, phase));
  const [archer1, archer2] = L.ramparts;
  const content = {
    obstacles: [],
    hazards: [
      ...L.boats.map(spot => makeBoat(...spot)),
      makeHazard('whirl', 'whirl', ...L.whirl, { groundY: GROUND_Y + WATER_SURFACE + WHIRL_SINK }),
      makeHazard('lurker', 'crocodile', ...L.crocodile, { groundY: GROUND_Y, floatY: 18 + WATER_SURFACE, hp: 2, triggerRange: 110 }),
      ...gusts.flatMap(item => item.hazards),
      ...L.boulders.map(spot => makeBoulder(...spot)),
      makeArcher(...archer1),
      makeArcher(...archer2, { id: ARCHER_ID }),
      ...layout.hazards
    ],
    shelters: [...gusts.flatMap(item => item.shelters), ...layout.shelters],
    // Ụ thành (tâm x world) — chỉ vẽ, lớp `beforeNpcs` (render-extras.js).
    ramparts: L.ramparts.map(spot => worldX(...spot)),
    holes: terrainHoles(),
    items: [
      ...L.books.map(([chunk, localX, lift]) => makeItem(chunk, localX, lift)),
      makeItem(...archer2, L.bookLift, { carrier: ARCHER_ID }),
      makeItem(...L.kct.at, L.kct.itemLift, { carrier: KCT_ID })
    ],
    enemies: [
      ...L.spearmen.map(spot => makeSoldier(...spot)),
      ...L.escorts.map(spot => makeSoldier(...spot)),
      makeKieuCongTien(),
      ...layout.enemies
    ],
    npcs: [],
    quizzes: level1Quizzes(),
    // Nghỉ chân: bình máu nằm sẵn (NQ-REST-01).
    pickups: [makeRestHeal(...L.rest)]
  };
  checkTerrainFootprints(content);
  return content;
}

// CHAPTER.hooks.dropCarry: lính vùng Đại La rơi 1 lao (lính thường, không phải boss).
export function dropCarry(target) {
  if (state.layoutTest || target.boss || !state.enemies.includes(target)) return null;
  return target.x >= JAVELIN_FROM_X ? 'javelin' : null;
}

// Thuyền trống về chỗ đậu ban đầu (`homeX`) khi người chơi đứng trên bờ trái
// khe đó — rơi xuống sông giữa dòng thì về chỗ đứng vững ở bờ trái, thuyền phải
// ở đó để đi lại (không thì kẹt: khe 2–4 quá tầm nhảy + lướt). Khe 3 có 2 thuyền:
// cả 2 về chỗ (thuyền bên kia xoáy đậu giữa dòng). Màn 2 dùng lại (level2.js).
export function returnBoats(p) {
  if (!p.grounded || p.platform) return;
  const center = p.x + p.w / 2;
  state.hazards.forEach(boat => {
    if (boat.kind !== 'boat' || boat.homeX === undefined || boat.x === boat.homeX) return;
    const river = state.holes.find(hole => hole.water && boat.homeX >= hole.x && boat.homeX < hole.x + hole.w);
    if (!river || center >= river.x || center < river.x - CHUNK_W) return;
    boat.x = boat.homeX;
    boat.vx = 0;
  });
}

// Sự kiện mỗi frame: câu hướng dẫn (1 lần mỗi câu, theo thứ tự), nhặt lao lần đầu,
// Kiều Công Tiễn lên tiếng.
export function level1Events(p) {
  if (state.layoutTest) return;
  returnBoats(p);
  const tip = LEVEL1.tips[state.tipIndex];
  if (tip && p.x > worldX(tip[0], tip[1])) {
    state.tipIndex += 1;
    showMessage(tip[2], 3200);
  }
  if (p.carrying === 'javelin' && !state.javelinHintShown) {
    state.javelinHintShown = true;
    showMessage(TEXT.javelinPicked, 2800);
  }
  if (!state.kctTalked && p.x > worldX(...LEVEL1.kctTalk)) {
    state.kctTalked = true;
    openStory(STORY_NQ_KCT, () => {});
  }
}
