// Màn 1 "Gánh cống Hoan Châu" (MHD-L1, docs/SUTA_MHD_TASK_L1_01.md):
//   - đoạn gánh cống phẩm cố định chunk 1–2: vào màn đang gánh, tới xe cống đầu
//     tiên bấm Đánh thì đập sọt (hết gánh, xe vỡ, 1 dân phu chạy thoát);
//   - 10 nhóm chướng ngại xáo mỗi lượt vào 2 ô (a/b) của chunk 3–10 trong VÙNG
//     ĐƯỢC PHÉP + 2 xe chở sách cố định chunk 6, 9 + mini-boss quan thu thuế cố
//     định chunk 11 (ném hòm rỗng nằm lại, 2 lính hộ tống, chết rơi sách);
//   - 5 xe cống = 5 dân phu (`rescued`); 5 Quyển Sách Tinh Hoa (2 cố định + 2
//     trong xe + 1 từ quan thu thuế); 4 câu hỏi chặn đường;
//   - sự kiện: câu hướng dẫn đoạn gánh, kỵ binh báo trước rồi phi ra, nghỉ chân.
// Layout thử `?layout=engine` (MHD-ENGINE). Mọi số DESIGN_BASELINE.

import { worldX, makeHazard, setTerrain, buildTerrain, terrainHoles } from '../../engine/geometry.js';
import { state } from '../../engine/state.js';
import { makeEnemy, makeQuiz, makeItem, shuffle, pick, checkTerrainFootprints } from '../../engine/entities.js';
import { breakHazard } from '../../engine/combat.js';
import { showMessage } from '../../engine/ui.js';
import { playSfx } from '../../engine/audio.js';
import { GROUND_Y } from '../../engine/config.js';
import {
  QUIZ, SOLDIER, ENGINE_TEST, LEVEL1_CHUNKS, BURDEN_ROAD, MINIBOSS, REST, LEVEL1_ITEMS, BOOK_CARTS, SLOTS,
  CART_GUARD, BUSH, TOWER, BOULDER, TIGER_CAVE, CAVALRY, TEXT
} from './config.js';
import { LEVEL1_QUESTION_POOL } from './questions-data.js';

// Lệch ngẫu nhiên mỗi nhóm trong ô (±px).
const JITTER = 60;
const FIRST_CHUNK = 3;
const LAST_CHUNK = 10;
const FIRST_CART_ID = 'mhd-first-cart';
const MINIBOSS_ID = 'mhd-tax-official';

// Mỗi lượt rút QUIZ.level1Count câu KHÔNG trùng, đặt lần lượt vào level1Spots.
function level1Quizzes() {
  const chosen = shuffle(LEVEL1_QUESTION_POOL).slice(0, QUIZ.level1Count);
  return chosen.map((stt, index) => makeQuiz(...QUIZ.level1Spots[index], stt));
}

// Lính áp giải (hành vi guard của engine) đứng tâm tại worldX(chunk, localX).
export function makeSoldier(chunk, localX) {
  return makeEnemy(worldX(chunk, localX) - SOLDIER.w / 2, SOLDIER.w, SOLDIER.h, SOLDIER.hp, false);
}

// Xe cống đứng yên chặn đường. Màn 1 giữ 1 dân phu (MHD-ENGINE E5 `frees`);
// màn 2 truyền `frees: 0` (chỉ chở sách — MHD-L2 Q2).
export function makeCart(chunk, localX, options = {}) {
  return makeHazard('prop', 'tributeCart', chunk, localX, { hp: 2, frees: 1, ...options });
}

// Bộ dựng chướng ngại dùng chung màn 1–2: trả { hazards, bushes?, caves? }.
// Cung thủ núp bụi (bụi vẽ sau người chơi — render-extras.js).
export function makeBushArcher(chunk, localX) {
  return {
    hazards: [makeHazard('thrower', 'archer', chunk, localX, {
      projectile: 'crossbowBolt', aim: true, fireInterval: BUSH.fireInterval, fireRange: BUSH.fireRange, hp: 2
    })],
    bushes: [worldX(chunk, localX)]
  };
}
// Lính ném lao trên tháp canh — tháp (prop) đứng trước trong danh sách để vẽ sau lính.
export function makeJavelinTower(chunk, localX) {
  return { hazards: [
    makeHazard('prop', 'watchtower', chunk, localX),
    makeHazard('thrower', 'javelin', chunk, localX, {
      groundY: GROUND_Y - TOWER.deck, projectile: 'javelin', aim: true,
      fireInterval: TOWER.fireInterval, fireRange: TOWER.fireRange
    })
  ] };
}
export function makeBoulder(chunk, localX) {
  return { hazards: [makeHazard('roller', 'boulder', chunk, localX, {
    speed: BOULDER.speed, triggerX: worldX(chunk, localX) - BOULDER.trigger, hp: BOULDER.hp
  })] };
}
// Hổ vồ từ hang (cửa hang vẽ sau hổ — render-extras.js).
export function makeTigerCave(chunk, localX) {
  const center = worldX(chunk, localX);
  return {
    hazards: [makeHazard('pounce', 'tiger', chunk, localX, {
      hp: TIGER_CAVE.hp, triggerRange: TIGER_CAVE.triggerRange, span: [center - TIGER_CAVE.span, center + TIGER_CAVE.span]
    })],
    caves: [center]
  };
}
// Kỵ binh phi ngang: chờ ngoài màn hình, updateCavalry báo trước rồi cho phi.
export function makeCavalry(chunk, localX) {
  return { hazards: [{
    ...makeHazard('roller', 'cavalry', chunk, localX, { speed: CAVALRY.speed, hp: CAVALRY.hp }),
    charge: { warnX: worldX(chunk, localX) - CAVALRY.warnDistance, timer: null }
  }] };
}

// Nhóm chướng ngại. `chunks` = vùng được phép (đường 3–4, đèo 5–9, trạm 10);
// `slots` = ô được đặt. build(chunk, x) -> { hazards?, enemies?, items?, bushes?, caves? }
// với x = local tâm ô đã lệch.
const AB = ['a', 'b'];
const ALL = [3, 4, 5, 6, 7, 8, 9, 10];
const ROAD_AND_GATE = [3, 4, 10];
const PASS = [5, 6, 7, 8, 9];
const escort = { chunks: ALL, slots: AB, build: (c, x) => ({ enemies: [makeSoldier(c, x)] }) };
// Xe cống giữ dân phu + 1 lính áp giải đứng sau xe.
const guardedCart = {
  chunks: ROAD_AND_GATE, slots: AB,
  build: (c, x) => ({ hazards: [makeCart(c, x)], enemies: [makeSoldier(c, x + CART_GUARD.guardDx)] })
};
const OBSTACLE_GROUPS = [
  escort, escort, escort, guardedCart, guardedCart,
  { chunks: [3, 4, 5, 6, 7, 8, 9], slots: AB, build: makeBushArcher },
  { chunks: [5, 6, 7, 8, 9, 10], slots: AB, build: makeJavelinTower },
  { chunks: PASS, slots: AB, build: makeBoulder },
  { chunks: PASS, slots: AB, build: makeTigerCave },
  { chunks: ROAD_AND_GATE, slots: AB, build: makeCavalry }
];
// Xe chở sách cố định (ngoài nhóm xáo) — chiếm 1 ô trống của chunk.
const bookCart = chunk => ({
  chunks: [chunk], slots: AB,
  build: (c, x) => {
    const id = `mhd-book-cart-${c}`;
    return { hazards: [makeCart(c, x, { id })], items: [makeItem(c, x, BOOK_CARTS.itemLift, { carrier: id })] };
  }
});

// Xếp nhóm vào ô: xe chở sách cố định trước, rồi nhóm hẹp vùng trước, mỗi nhóm
// chọn ngẫu nhiên 1 ô còn trống trong vùng. Kẹt thì thử lại.
function placeGroups() {
  for (let attempt = 0; attempt < 80; attempt++) {
    const free = new Map();
    for (let c = FIRST_CHUNK; c <= LAST_CHUNK; c++) free.set(c, new Set(AB));
    const fixed = BOOK_CARTS.chunks.map(bookCart);
    const order = [...fixed, ...shuffle(OBSTACLE_GROUPS).sort((a, b) => a.chunks.length - b.chunks.length)];
    const plan = [];
    const ok = order.every(group => {
      const options = [];
      group.chunks.forEach(chunk => group.slots.forEach(slot => {
        if (free.get(chunk).has(slot)) options.push({ chunk, slot });
      }));
      if (!options.length) return false;
      const choice = pick(options);
      free.get(choice.chunk).delete(choice.slot);
      plan.push({ group, ...choice });
      return true;
    });
    if (ok) return plan;
  }
  throw new Error('MHD-L1: không xếp được nhóm chướng ngại vào ô');
}

function randomizeObstacles() {
  const layout = { hazards: [], enemies: [], items: [], bushes: [], caves: [] };
  placeGroups().forEach(({ group, chunk, slot }) => {
    const dx = Math.round((Math.random() * 2 - 1) * JITTER);
    const built = group.build(chunk, SLOTS[slot] + dx);
    Object.keys(layout).forEach(key => layout[key].push(...(built[key] || [])));
  });
  return layout;
}

// Đoạn gánh (§2.1): xe cống đầu tiên + lính áp giải đứng sau xe.
function makeBurdenRoad() {
  return {
    hazards: [makeCart(...BURDEN_ROAD.cart, { id: FIRST_CART_ID })],
    enemies: [makeSoldier(...BURDEN_ROAD.guard)]
  };
}

// Mini-boss quan thu thuế: hazard `patrol` `boss` (phải hạ mới mở cổng), ném hòm
// rỗng vòng cung (nằm lại chắn đường); chở 1 sách (`carrier` = id). 2 lính hộ tống.
function makeMiniBoss() {
  const center = worldX(MINIBOSS.chunk, MINIBOSS.localX);
  const hazard = makeHazard('patrol', 'taxOfficial', MINIBOSS.chunk, MINIBOSS.localX, {
    id: MINIBOSS_ID, speed: -MINIBOSS.speed, hp: MINIBOSS.hp, projectile: 'emptyChest',
    fireInterval: MINIBOSS.fireInterval, fireRange: MINIBOSS.fireRange, harmful: false
  });
  return {
    hazard: { ...hazard, boss: true, patrolMin: center - MINIBOSS.patrol, patrolMax: center + MINIBOSS.patrol },
    item: makeItem(MINIBOSS.chunk, MINIBOSS.localX, MINIBOSS.itemLift, { carrier: MINIBOSS_ID }),
    escorts: MINIBOSS.escorts.map(localX => makeSoldier(MINIBOSS.chunk, localX))
  };
}

// Layout thử `?layout=engine` (MHD-ENGINE): gánh nặng (chunk 1), xe chặn đường thả
// người (2), hổ vồ + khe hố (3), quan ném hòm rỗng (4), hũ dầu + bao cát (5).
function engineTestLayout() {
  const t = ENGINE_TEST;
  setTerrain(buildTerrain([{ chunk: 3, rows: t.hole }], LEVEL1_CHUNKS));
  const [spanChunk, spanMin, spanMax] = t.tigerSpan;
  const officialX = worldX(...t.official);
  const official = makeHazard('patrol', 'taxOfficial', ...t.official, {
    hp: 6, speed: 30, projectile: 'emptyChest', fireInterval: 2.2, fireRange: 240, harmful: false
  });
  const jarGuards = t.jarGuards.map(([chunk, localX]) => ({ ...makeSoldier(chunk, localX), dropsJar: true }));
  return {
    layoutTest: 'engine',
    burden: {},
    obstacles: [],
    hazards: [
      ...t.carts.map(([chunk, localX]) => makeCart(chunk, localX)),
      makeHazard('pounce', 'tiger', ...t.tiger, {
        hp: 3, triggerRange: 220, span: [worldX(spanChunk, spanMin), worldX(spanChunk, spanMax)]
      }),
      { ...official, patrolMin: officialX - 80, patrolMax: officialX + 80 }
    ],
    holes: terrainHoles(),
    items: [],
    enemies: [...jarGuards, { ...makeSoldier(...t.sandbag), kind: 'testBag', hp: 3, maxHp: 3 }],
    npcs: [],
    quizzes: []
  };
}

// Móc của layout thử (MHD-ENGINE) — chapter.js chỉ gọi khi state.layoutTest === 'engine'.
export const ENGINE_TEST_HOOKS = {
  dropCarry: target => (target.dropsJar ? 'oilJar' : null),
  onBurdenAttack: p => Math.abs(p.x + p.w / 2 - worldX(...ENGINE_TEST.cartMark)) <= ENGINE_TEST.reach,
  onThrownHit(thrown, target) {
    if (target.kind !== 'testBag') return false;
    target.hp -= 1;
    target.hitTimer = .18;
    if (target.hp <= 0) target.alive = false;
    state.score += 100;
    return true;
  }
};
export const ENGINE_TEST_KINDS = { testBag: { update() {}, blockStrike: () => true } };

// Màn thật: đứng trong BURDEN_ROAD.reach px quanh tâm xe cống đầu tiên mà bấm
// Đánh thì đập sọt — xe vỡ (thả 1 dân phu), engine bỏ gánh rồi vung đòn.
export function burdenAttackAtCart(p) {
  const cart = state.hazards.find(hazard => hazard.id === FIRST_CART_ID && hazard.alive);
  if (!cart) return true;
  if (Math.abs(p.x + p.w / 2 - (cart.x + cart.w / 2)) > BURDEN_ROAD.reach) return false;
  breakHazard(cart);
  return true;
}

export function level1Content(options = {}) {
  if (options.layout === 'engine') return engineTestLayout();
  const layout = randomizeObstacles();
  const road = makeBurdenRoad();
  const boss = makeMiniBoss();
  const content = {
    obstacles: [],
    hazards: [...road.hazards, ...layout.hazards, boss.hazard],
    holes: [],
    items: [...LEVEL1_ITEMS.map(([chunk, localX, lift]) => makeItem(chunk, localX, lift)), ...layout.items, boss.item],
    enemies: [...road.enemies, ...layout.enemies, ...boss.escorts],
    npcs: [],
    quizzes: level1Quizzes(),
    bushes: layout.bushes,
    caves: layout.caves
  };
  checkTerrainFootprints(content);
  return content;
}

// Kỵ binh: người chơi vượt `charge.warnX` thì báo trước (câu + tiếng vó), hết
// CAVALRY.delay giây thì phi ra (roller active). Dùng chung màn 1–2.
export function updateCavalry(p, dt) {
  state.hazards.forEach(hazard => {
    const charge = hazard.charge;
    if (!charge || hazard.active || !hazard.alive) return;
    if (charge.timer === null) {
      if (p.x < charge.warnX) return;
      charge.timer = CAVALRY.delay;
      showMessage(TEXT.cavalryWarn, 2400);
      playSfx('cavalryCharge');
      return;
    }
    charge.timer -= dt;
    if (charge.timer <= 0) hazard.active = true;
  });
}

// Sự kiện mỗi frame: câu hướng dẫn đoạn gánh (1 lần mỗi câu, theo thứ tự); kỵ
// binh báo trước; nghỉ chân hồi 1 máu (1 lần).
export function level1Events(p, dt) {
  if (state.layoutTest) return;
  const tip = BURDEN_ROAD.tips[state.tipIndex];
  if (tip && p.burden && p.x > worldX(tip[0], tip[1])) {
    state.tipIndex += 1;
    showMessage(tip[2], 3200);
  }
  updateCavalry(p, dt);
  if (!state.restUsed && p.x > worldX(REST.chunk, REST.localX)) {
    state.restUsed = true;
    state.health = Math.min(state.maxHealth, state.health + 1);
    playSfx('heal');
    showMessage('Nghỉ chân: hồi 1 máu.');
  }
}
