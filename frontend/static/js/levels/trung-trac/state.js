// State của 1 lượt chơi (player/obstacles/holes/books/enemies...).
// `state` bị gán lại TOÀN BỘ object mỗi lần resetGame(), nên export dạng
// live-binding (`let` + setter) để các module khác import { state } luôn
// thấy giá trị mới nhất — đây là hành vi chuẩn của ES module named export.

import { worldX, makeObstacle, makeHazard } from './geometry.js';
import { GROUND_Y, MINIBOSS, GUARD, LEVEL, NPC_RULES } from './config.js';
import { createAnim } from './animation.js';

export let state = null;

export function setState(nextState) {
  state = nextState;
  return state;
}

// Boss/mini-boss của màn còn sống? (enemy `boss` — Tô Định, dành cho màn 3 —
// hoặc hazard `boss` — mini-boss kiệu quan màn 1). physics.js (giữ người chơi
// ở cổng) và render.js (cổng mở) dùng chung.
export function bossAlive(current = state) {
  return current.enemies.some(enemy => enemy.boss && enemy.alive)
    || current.hazards.some(hazard => hazard.boss && hazard.alive);
}

// Màn có ĐÚNG 12 chướng ngại vật (kể cả mini-boss), ~1 cái/chunk. Mỗi lượt chơi
// (resetGame -> createLevelState) các nhóm dưới đây được xáo ngẫu nhiên vào
// chunk 1..10 và lệch thêm ±JITTER px trong chunk:
//   - chunk 1 chỉ nhận nhóm "easy" (vật tĩnh/bẫy) để người chơi kịp làm quen,
//     không bị ném đạn/lao vào ngay khi vừa xuất phát.
//   - tháp canh + lính gác + kỵ binh là 1 nhóm (báo động gọi kỵ binh) nên luôn
//     đi chung 1 chunk; tháp canh chỉ là cảnh trí nên không tính vào 12.
//   - mini-boss kiệu quan luôn cố định ở chunk 11 (thêm trong
//     createLevelState). Kiệu KHÔNG còn nằm trong nhóm xáo (TT-NPC-01, quyết
//     định team D5) — chỗ của nó là nhóm lính canh thứ 2.
// Mỗi nhóm là hàm (chunk, dx) -> { obstacles, hazards, enemies }; dx cộng vào
// MỌI toạ độ localX/triggerX của nhóm để cả nhóm dịch chung, không lệch nhau.
// width/height của obstacle giữ đúng tỉ lệ khung hình thật của từng ảnh.
const JITTER = 60;

// Enemy trên mặt đất: x = mép trái hitbox, w/h = hitbox (px logic). Lính
// thường (không boss) đi tuần quanh chỗ đứng và đâm kích khi người chơi tới
// gần — hành vi ở physics.js (updateGuard), thông số GUARD trong config.js.
// Boss đứng yên.
function makeEnemy(x, w, h, hp, boss) {
  const enemy = {
    x, y: GROUND_Y - h, w, h, hp, maxHp: hp, boss,
    alive: true, dying: false, hitTimer: 0, anim: createAnim('idle')
  };
  if (boss) return enemy;
  const center = x + w / 2;
  return {
    ...enemy,
    facing: -1,
    walking: true,
    patrolMin: center - GUARD.patrolRange / 2,
    patrolMax: center + GUARD.patrolRange / 2,
    // Cú đâm đang diễn { time, hit } hoặc null.
    action: null,
    attackCooldown: 0
  };
}

const OBSTACLE_GROUPS = [
  // cành cây đổ — nhảy qua
  { easy: true, build: (c, dx) => ({ obstacles: [makeObstacle('fallenBranch', c, 420 + dx, 55, 23)] }) },
  // khối đá — nhảy qua / đứng lên được
  { easy: true, build: (c, dx) => ({ obstacles: [makeObstacle('stoneBlock', c, 360 + dx, 51, 23)] }) },
  // bẫy hố chông — tới gần mới bật lên
  { easy: true, build: (c, dx) => ({ hazards: [makeHazard('trap', 'spikePit', c, 492 + dx, {
    harmful: false, triggerDistance: 58
  })] }) },
  // mành lau — bắt buộc lướt (dash)
  { build: (c, dx) => ({ obstacles: [makeObstacle('reedCurtain', c, 300 + dx, 76, 32, { overhead: true })] }) },
  // lính canh — đi tuần, đâm kích khi người chơi tới gần. Có 2 nhóm: nhóm
  // thứ 2 thay chỗ kiệu quan `roller` cũ (kiệu giờ là mini-boss chunk 11 —
  // quyết định team D5), đứng LỆCH vị trí trong chunk so với nhóm 1 (đầu
  // chunk thay vì cuối chunk; tránh các vị trí sách 258–558).
  { build: (c, dx) => ({ enemies: [
    makeEnemy(worldX(c, 624 + dx), 22, 40, 2, false)
  ] }) },
  { build: (c, dx) => ({ enemies: [
    makeEnemy(worldX(c, 200 + dx), 22, 40, 2, false)
  ] }) },
  // lính thu thuế — ném túi tiền
  { build: (c, dx) => ({ hazards: [makeHazard('thrower', 'hanTaxSoldier', c, 312 + dx, {
    projectile: 'coinPouch', fireInterval: 3.2, hp: 2
  })] }) },
  // hổ rừng — lao tới. triggerX 260 (cũ 420): kích hoạt khi hổ (mép trái
  // local 708) còn cách người chơi ~448px > tầm nhìn phía trước ở khung rộng
  // nhất (0.66 x MAX_VIEW_W 640 ≈ 422) -> hổ lao vào từ ngoài màn hình thay vì
  // hiện ra giữa màn (team duyệt 26/09). DESIGN_BASELINE.
  { build: (c, dx) => ({ hazards: [makeHazard('roller', 'jungleTiger', c, 732 + dx, {
    speed: -139, triggerX: worldX(c, 260 + dx), hp: 2
  })] }) },
  // xe cống phẩm — lăn tới; chém vỡ thì phát `break` rồi nằm lại map ở ô cuối
  // (vô hại) — xem `corpse` trong HAZARD_SPRITES.
  { build: (c, dx) => ({ hazards: [makeHazard('roller', 'tributeCart', c, 738 + dx, {
    speed: -101, triggerX: worldX(c, 150 + dx), hp: 2
  })] }) },
  // tháp canh (cảnh trí) + lính gác ném phi tiêu + kỵ binh xông ra khi báo động.
  // Lính đứng DƯỚI CHÂN tháp (sàn tháp trong ảnh chỉ cao 41px mà lính cao 52px).
  { build: (c, dx) => ({ hazards: [
    makeHazard('prop', 'watchtower', c, 420 + dx, { harmful: false }),
    makeHazard('thrower', 'watchtowerGuard', c, 474 + dx, {
      projectile: 'throwingDart', fireInterval: 3.4, fireRange: 240,
      hp: 2, alarmFor: 'cavalry-charge'
    }),
    makeHazard('roller', 'hanCavalry', c, 780 + dx, {
      id: 'cavalry-charge', speed: -190, hp: 3
    })
  ] }) }
];

function shuffle(list) {
  const result = [...list];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Layout THỬ `?layout=p2` (chỉ để test TT-MAP-01, không ảnh hưởng màn thường):
// nền phẳng, 6 vật cản P2 đặt lần lượt ở chunk 1–2, một hố 96px (căn lưới
// tile 16px) có `bridge` bắc qua. Không hazard/enemy/sách. Hitbox P2 là
// DESIGN_BASELINE.
function p2TestLayout() {
  const hole = { x: worldX(2, 192), w: 96 };
  return {
    obstacles: [
      makeObstacle('fenceLow', 1, 260, 40, 18),
      makeObstacle('fenceHigh', 1, 400, 16, 48),
      makeObstacle('bambooSlope', 1, 520, 56, 30),
      makeObstacle('slideBar', 1, 660, 40, 20),
      makeObstacle('logDrift', 2, 40, 56, 14),
      makeObstacle('bridge', 2, 192, 96, 8)
    ],
    hazards: [],
    enemies: [],
    holes: [hole]
  };
}

// Vật cản `requiresHole` (cầu) chỉ được giữ khi có hố phủ đúng nhịp cầu;
// thiếu hố thì cảnh báo và bỏ qua (không đặt cầu lơ lửng trên đất liền).
function keepValidBridges(obstacles, holes) {
  return obstacles.filter(obstacle => {
    if (!obstacle.requiresHole) return true;
    const spans = holes.some(hole => hole.x <= obstacle.x && hole.x + hole.w >= obstacle.x + obstacle.w);
    if (!spans) console.warn(`${obstacle.type} ở x=${obstacle.x} không có hố tương ứng — bỏ qua.`);
    return spans;
  });
}

// Mini-boss kiệu quan (TT-NPC-01 §3.1.2): đi tuần quanh tâm trong đoạn
// patrolRange, vào tầm thì dừng lại ném dao — hành vi ở physics.js
// (updatePatrol). `boss: true` -> phải hạ mới mở cổng.
function makeMiniBoss() {
  const hazard = makeHazard('patrol', 'palanquinBoss', MINIBOSS.chunk, MINIBOSS.localX, {
    speed: -MINIBOSS.speed, hp: MINIBOSS.hp, projectile: 'throwingKnife',
    fireInterval: MINIBOSS.fireInterval, fireRange: MINIBOSS.fireRange
  });
  const center = worldX(MINIBOSS.chunk, MINIBOSS.localX);
  return {
    ...hazard,
    boss: true,
    patrolMin: center - MINIBOSS.patrolRange / 2,
    patrolMax: center + MINIBOSS.patrolRange / 2,
    // Đang đi (true) hay đứng chờ ném (false) — chọn animation move/idle.
    walking: true
  };
}

function randomizeObstacles() {
  const easy = OBSTACLE_GROUPS.filter(group => group.easy);
  const first = easy[Math.floor(Math.random() * easy.length)];
  const order = [first, ...shuffle(OBSTACLE_GROUPS.filter(group => group !== first))];
  const layout = { obstacles: [], hazards: [], enemies: [] };
  order.forEach((group, index) => {
    const dx = Math.round((Math.random() * 2 - 1) * JITTER);
    const built = group.build(index + 1, dx);
    layout.obstacles.push(...(built.obstacles || []));
    layout.hazards.push(...(built.hazards || []));
    layout.enemies.push(...(built.enemies || []));
  });
  return layout;
}

// Nội dung màn 1. `options.layout === 'p2'` -> layout thử P2; mặc định màn
// thường (11 chướng ngại vật xáo ngẫu nhiên + mini-boss kiệu quan + 5 sách).
function level1Content(options) {
  const testP2 = options.layout === 'p2';
  const layout = testP2 ? p2TestLayout() : { ...randomizeObstacles(), holes: [] };
  return {
    // 12 chướng ngại vật (kể cả mini-boss) được XẾP NGẪU NHIÊN mỗi lượt chơi —
    // xem randomizeObstacles() ở trên.
    obstacles: keepValidBridges(layout.obstacles, layout.holes),
    hazards: testP2 ? layout.hazards : [...layout.hazards, makeMiniBoss()],
    holes: layout.holes,
    books: testP2 ? [] : [
      { x: worldX(2, 390), y: GROUND_Y - 56, collected: false },
      { x: worldX(3, 390), y: GROUND_Y - 52, collected: false },
      { x: worldX(4, 420), y: GROUND_Y - 87, collected: false },
      { x: worldX(7, 258), y: GROUND_Y - 60, collected: false },
      { x: worldX(7, 558), y: GROUND_Y - 72, collected: false }
    ],
    // Boss Tô Định (makeEnemy(..., 90, 80, 5, true), BOSS_TO_DINH_CHARIOT)
    // KHÔNG còn ở màn 1 — để dành cho màn 3 (TT-NPC-01).
    enemies: testP2 ? [] : layout.enemies,
    npcs: []
  };
}

// NPC màn 2: `centerX` = tâm = pivot bottom-center; x/y/w/h chỉ là hộp F2
// (NPC không có va chạm). met = đã gặp xong; fade 1 -> 0 sau khi gặp (mờ dần
// rồi biến mất); talking = đang nói thoại (render phát `talk`).
function makeNpc(id, chunk, localX) {
  const centerX = worldX(chunk, localX);
  return {
    id, centerX,
    x: centerX - NPC_RULES.w / 2, y: GROUND_Y - NPC_RULES.h, w: NPC_RULES.w, h: NPC_RULES.h,
    met: false, talking: false, fade: 1
  };
}

// Vật cản không được nằm trong NPC_RULES.clearance quanh tâm NPC (§3.2.2) —
// sai thì cảnh báo để phát hiện khi chỉnh layout.
function checkNpcClearance(obstacles, npcs) {
  obstacles.forEach(obstacle => npcs.forEach(npc => {
    const gap = Math.max(obstacle.x - npc.centerX, npc.centerX - (obstacle.x + obstacle.w), 0);
    if (gap < NPC_RULES.clearance) console.warn(`${obstacle.type} ở x=${obstacle.x} cách NPC ${npc.id} ${gap}px < ${NPC_RULES.clearance}px`);
  }));
}

// Nội dung màn 2 "Chiêu mộ hiền tài" (TT-NPC-01 §3.2, DESIGN_BASELINE): đặt
// CỐ ĐỊNH, không xáo. 6 vật cản tĩnh xen giữa các NPC (có 1 `slideBar` bắt
// buộc dash); không hazard/enemy/đạn/sách/hố. Hitbox các loại P2 giữ đúng số
// đã chốt ở TT-MAP-01 (layout thử `?layout=p2`); loại P0 giữ số của màn 1.
// Thứ tự gặp: Thi Sách (giữa chunk 1) -> cốt truyện khi vào chunk 2 -> Lê
// Chân (giữa chunk 3) -> Trưng Nhị (giữa chunk 4) -> về đích cuối chunk 4.
function level2Content() {
  const npcs = [
    makeNpc('thiSach', 1, 384),
    makeNpc('leChan', 3, 384),
    makeNpc('trungNhi', 4, 384)
  ];
  const obstacles = [
    makeObstacle('fenceLow', 1, 180, 40, 18),
    makeObstacle('bambooSlope', 1, 600, 56, 30),
    makeObstacle('fallenBranch', 2, 200, 55, 23),
    makeObstacle('slideBar', 2, 520, 40, 20),
    makeObstacle('logDrift', 3, 120, 56, 14),
    makeObstacle('stoneBlock', 3, 600, 51, 23)
  ];
  checkNpcClearance(obstacles, npcs);
  return { obstacles, hazards: [], holes: [], books: [], enemies: [], npcs };
}

// State của 1 lượt chơi màn đang chọn (LEVEL, config.js). `options.score` =
// điểm mang sang từ màn trước; máu luôn đầy khi bắt đầu màn (DESIGN_BASELINE).
export function createLevelState(options = {}) {
  const content = LEVEL.id === 2 ? level2Content() : level1Content(options);
  return {
    running: false,
    paused: false,
    won: false,
    cameraX: 0,
    score: options.score ?? 0,
    health: 5,
    booksCollected: 0,
    // Mốc sự kiện 1 lần: màn 1 = câu hỏi / cốt truyện chunk 10; màn 2 =
    // cốt truyện Thi Sách hy sinh.
    questionShown: false,
    storyShown: false,
    restUsed: false,
    finishX: LEVEL.finishX,
    player: {
      x: 84,
      y: GROUND_Y - 42,
      w: 25,
      h: 42,
      normalH: 42,
      vx: 0,
      vy: 0,
      facing: 1,
      grounded: true,
      dashing: false,
      dashTimer: 0,
      attacking: false,
      attackCooldown: 0,
      // Mục tiêu đã trúng trong cú vung hiện tại (mỗi mục tiêu 1 lần/cú).
      attackHits: new Set(),
      hurtTimer: 0,
      invulnerable: 0,
      // Animation đang phát { name, time } — xem animation.js.
      anim: createAnim('idle'),
      // Mốc thời gian (giây, đồng hồ requestAnimationFrame) lúc thua.
      deathTime: null
    },
    projectiles: [],
    ...content
  };
}
