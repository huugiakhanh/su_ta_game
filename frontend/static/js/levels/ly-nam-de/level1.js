// Màn 1 "Từ quan chiêu binh" (LND-L1, docs/SUTA_LND_TASK_L1_01.md): 10 nhóm
// chướng ngại xáo mỗi lượt vào chunk 1–10 trong VÙNG ĐƯỢC PHÉP của nhóm + bẫy
// lưới cố định chunk 9 + mini-boss xe cống phẩm trâu kéo cố định chunk 11 =
// đúng 12 chướng ngại; 5 Quyển Sách Tinh Hoa (3 cố định + 1 trong xe nhỏ + 1
// trong xe trâu); 4 câu hỏi chặn đường; Lý Bí đứng chờ đầu màn (chapter.js
// guide). Nghỉ chân: bình máu nằm sẵn. Layout thử `?layout=engine`.
// Mọi số DESIGN_BASELINE.

import { worldX, makeHazard, setTerrain, buildTerrain, terrainHoles } from '../../engine/geometry.js';
import {
  makeEnemy, makeQuiz, makeItem, makeRestHeal, makePlatform, shuffle, pick, checkTerrainFootprints, checkPlatformReach
} from '../../engine/entities.js';
import { GROUND_Y, TERRAIN_CELL } from '../../engine/config.js';
import {
  QUIZ, SOLDIER, HOUND, ENGINE_TEST, LEVEL1_CHUNKS, MINIBOSS, FIXED_NET, REST, LEVEL1_ITEMS, NET, RIVER, TOWER,
  ROCK_LEDGE
} from './config.js';
import { LEVEL1_QUESTION_POOL } from './questions-data.js';

// Lệch ngẫu nhiên mỗi nhóm trong chunk (±px); nhóm có địa hình lệch bội số 1 ô.
const JITTER = 60;
const SHUFFLED_CHUNKS = 10;

// Lính Lương (hành vi guard của engine) đứng tâm tại worldX(chunk, localX).
function makeSoldier(chunk, localX) {
  return makeEnemy(worldX(chunk, localX) - SOLDIER.w / 2, SOLDIER.w, SOLDIER.h, SOLDIER.hp, false);
}

function makeHound(chunk, localX) {
  return {
    ...makeEnemy(worldX(chunk, localX) - HOUND.w / 2, HOUND.w, HOUND.h, HOUND.hp, false),
    art: 'hound', facing: -1, direction: -1, rest: 0, walking: true
  };
}

function makeNet(chunk, localX) {
  return makeHazard('snare', 'netTrap', chunk, localX, { dropHeight: NET.dropHeight, triggerWidth: NET.triggerWidth });
}

// Mỏm đá giữa sông: bục một chiều (ảnh PROP_LND_ROCK_LEDGE, mặt trên hàng 0).
function makeLedge(chunk, localX, height) {
  return makePlatform(chunk, localX, height, ROCK_LEDGE.w, { sprite: ROCK_LEDGE.sprite });
}

// Nhóm chướng ngại (Excel "8 chướng ngại vật"). `chunks` = vùng được phép
// (đồi 1–2, làng 3–4, sông 5–7, trạm kiểm soát 8–10); `easy` = được đặt ở chunk
// 1. Mỗi nhóm: (chunk, dx) -> { hazards?, enemies?, platforms?, items? }.
// `terrain`: lưới chữ 48 ô của chunk đó, lệch theo dx (bội số 1 ô).
const ALL = [2, 3, 4, 5, 6, 7, 8, 9, 10];
const LAND = [2, 3, 4, 8, 9, 10];
const patrol = (c, dx) => ({ enemies: [makeSoldier(c, 600 + dx)] });
// Thuyền chiến trong khe 1 + mỏm đá giữa khe 2: hoả tiễn nhắm người chơi khi
// nhảy qua sông; va thân thuyền vô hại.
const warBoat = (c, dx) => ({
  hazards: [makeHazard('thrower', 'warBoat', c, RIVER.boatX + dx, {
    groundY: GROUND_Y, floatY: RIVER.floatY, harmful: false,
    projectile: 'fireArrow', aim: true, fireInterval: RIVER.fireInterval
  })],
  platforms: [makeLedge(c, RIVER.ledge[0] + dx, RIVER.ledge[1])]
});
const OBSTACLE_GROUPS = [
  // lính tuần tiễu nhà Lương — kích
  { chunks: ALL, build: patrol },
  { chunks: ALL, build: patrol },
  // quan lại thu thuế — ném xâu tiền chì ngang (local 440: cách bia câu hỏi
  // chunk 3 @312 và chunk 8/10 @560 ≥ 60 px kể cả lệch)
  { chunks: LAND, build: (c, dx) => ({ hazards: [makeHazard('thrower', 'taxman', c, 440 + dx, {
    projectile: 'leadCoins', fireInterval: 2.8, fireRange: 220, hp: 2
  })] }) },
  // thuyền chiến nhỏ trên sông Hồng (×2)
  { chunks: [5, 6, 7], terrain: RIVER.rows, build: warBoat },
  { chunks: [5, 6, 7], terrain: RIVER.rows, build: warBoat },
  // cung thủ trên tháp canh — bắn chéo xuống; tháp (prop) đứng trước trong danh
  // sách để vẽ phía sau cung thủ
  { chunks: [8, 9, 10], build: (c, dx) => ({ hazards: [
    makeHazard('prop', 'watchtower', c, TOWER.localX + dx),
    makeHazard('thrower', 'towerArcher', c, TOWER.localX + dx, {
      groundY: GROUND_Y - TOWER.deck, projectile: 'crossbowBolt', aim: true,
      fireInterval: TOWER.fireInterval, fireRange: TOWER.fireRange
    })
  ] }) },
  // bẫy lưới trúc + công tắc ẩn (nhóm dễ; không chunk 9 — đã có lưới cố định)
  { easy: true, chunks: [1, 2, 3, 4, 8, 10], build: (c, dx) => ({ hazards: [makeNet(c, 400 + dx)] }) },
  // chó săn quân Lương — chạy nhanh, cắn thấp
  { chunks: ALL, build: (c, dx) => ({ enemies: [makeHound(c, 640 + dx)] }) },
  // xe chở cống phẩm — chém vỡ (hoặc để lăn mất) thì rơi 1 sách
  { chunks: LAND, build: (c, dx) => {
    const id = `cart-${c}`;
    return {
      hazards: [makeHazard('roller', 'tributeCart', c, 700 + dx, {
        id, speed: -110, triggerX: worldX(c, 260 + dx), hp: 2
      })],
      items: [makeItem(c, 700 + dx, 40, { carrier: id })]
    };
  } },
  // đá lở vùng đồi núi
  { chunks: [2, 3, 4], build: (c, dx) => ({ hazards: [makeHazard('roller', 'boulder', c, 740 + dx, {
    speed: -100, triggerX: worldX(c, 220 + dx), hp: 2
  })] }) }
];

// Xếp 10 nhóm vào 10 chunk: chunk 1 = nhóm dễ; còn lại nhóm hẹp vùng trước
// (thuyền, cung thủ, đá), mỗi nhóm chọn ngẫu nhiên 1 chunk còn trống trong vùng.
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
  throw new Error('LND-L1: không xếp được nhóm chướng ngại vào vùng');
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
  const layout = { hazards: [], enemies: [], platforms: [], items: [] };
  plan.forEach(({ group, chunk, dx }) => {
    const built = group.build(chunk, dx);
    Object.keys(layout).forEach(key => layout[key].push(...(built[key] || [])));
  });
  return layout;
}

// Mini-boss xe cống phẩm trâu kéo (Q3): hành vi `patrol` của engine, đi tuần
// không dừng (fireRange 0, không đạn), va chạm −1 máu, `boss: true` -> phải hạ
// mới mở cổng; chở 1 sách. 2 lính hộ tống đứng hai bên.
function makeMiniBoss() {
  const id = 'tribute-wagon';
  const hazard = makeHazard('patrol', 'tributeWagon', MINIBOSS.chunk, MINIBOSS.localX, {
    id, speed: -MINIBOSS.speed, hp: MINIBOSS.hp, fireRange: 0
  });
  const center = worldX(MINIBOSS.chunk, MINIBOSS.localX);
  return {
    hazard: {
      ...hazard,
      boss: true,
      hitScore: MINIBOSS.hitScore,
      defeatScore: MINIBOSS.defeatScore,
      patrolMin: center - MINIBOSS.patrolRange / 2,
      patrolMax: center + MINIBOSS.patrolRange / 2,
      walking: true
    },
    item: makeItem(MINIBOSS.chunk, MINIBOSS.localX, MINIBOSS.itemLift, { carrier: id }),
    escorts: MINIBOSS.escorts.map(localX => makeSoldier(MINIBOSS.chunk, localX))
  };
}

// Mỗi lượt rút QUIZ.level1Count câu KHÔNG trùng, đặt lần lượt vào level1Spots.
function level1Quizzes() {
  const chosen = shuffle(LEVEL1_QUESTION_POOL).slice(0, QUIZ.level1Count);
  return chosen.map((stt, index) => makeQuiz(...QUIZ.level1Spots[index], stt));
}

// Layout thử `?layout=engine` (LND-ENGINE): bẫy lưới, sông + mỏm đá + thuyền
// nhắm bắn, cung thủ đứng cao bắn chéo, xe cống phẩm chở 1 sách, chó săn, lính
// rơi bình máu. Không câu hỏi; 1 sách duy nhất nằm trong xe.
function engineTestLayout() {
  const t = ENGINE_TEST;
  setTerrain(buildTerrain([{ chunk: 2, rows: t.river }], LEVEL1_CHUNKS));
  const [archerChunk, archerX, archerHeight] = t.archer;
  const [boatChunk, boatX, floatY] = t.boat;
  const cartId = 'test-cart';
  return {
    // Hook dropHeal của chương (chapter.js) chỉ bật ở layout này.
    layoutTest: 'engine',
    obstacles: [],
    hazards: [
      makeHazard('snare', 'netTrap', t.snare.chunk, t.snare.localX, {
        dropHeight: t.snare.dropHeight, triggerWidth: t.snare.triggerWidth
      }),
      makeHazard('thrower', 'warBoat', boatChunk, boatX, {
        groundY: GROUND_Y, floatY, harmful: false, projectile: 'fireArrow', aim: true, fireInterval: 2.2
      }),
      makeHazard('prop', 'watchtower', archerChunk, archerX),
      makeHazard('thrower', 'towerArcher', archerChunk, archerX, {
        groundY: GROUND_Y - archerHeight, projectile: 'crossbowBolt', aim: true, fireInterval: 2
      }),
      makeHazard('roller', 'tributeCart', t.cart.chunk, t.cart.localX, {
        id: cartId, speed: t.cart.speed, triggerX: worldX(t.cart.chunk, t.cart.triggerLocalX), hp: t.cart.hp
      })
    ],
    holes: terrainHoles(),
    items: [makeItem(t.cart.chunk, t.cart.localX, t.cart.itemLift, { carrier: cartId })],
    enemies: [
      makeSoldier(...t.guard),
      makeHound(...t.hound),
      ...t.dropGuards.map(spot => makeSoldier(...spot))
    ],
    npcs: [],
    quizzes: [],
    platforms: [makeLedge(t.ledge[0], t.ledge[1], t.ledge[2])]
  };
}

export function level1Content(options = {}) {
  if (options.layout === 'engine') return engineTestLayout();
  const layout = randomizeObstacles();
  const boss = makeMiniBoss();
  const content = {
    obstacles: [],
    hazards: [...layout.hazards, makeNet(FIXED_NET.chunk, FIXED_NET.localX), boss.hazard],
    holes: terrainHoles(),
    items: [...LEVEL1_ITEMS.map(([chunk, localX, lift]) => makeItem(chunk, localX, lift)), ...layout.items, boss.item],
    enemies: [...layout.enemies, ...boss.escorts],
    npcs: [],
    quizzes: level1Quizzes(),
    platforms: layout.platforms,
    // Nghỉ chân (Q4): bình máu nằm sẵn (NQ-REST-01).
    pickups: [makeRestHeal(REST.chunk, REST.localX)]
  };
  checkTerrainFootprints(content);
  checkPlatformReach(content);
  return content;
}

