// State của 1 lượt chơi (player/obstacles/holes/books/enemies...).
// `state` bị gán lại TOÀN BỘ object mỗi lần resetGame(), nên export dạng
// live-binding (`let` + setter) để các module khác import { state } luôn
// thấy giá trị mới nhất — đây là hành vi chuẩn của ES module named export.

import { worldX, makeObstacle, makeHazard } from './geometry.js';
import { GROUND_Y } from './config.js';

export let state = null;

export function setState(nextState) {
  state = nextState;
  return state;
}

// Màn có ĐÚNG 12 chướng ngại vật (kể cả boss), ~1 cái/chunk. Mỗi lượt chơi
// (resetGame -> createLevelState) các nhóm dưới đây được xáo ngẫu nhiên vào
// chunk 1..10 và lệch thêm ±JITTER px trong chunk:
//   - chunk 1 chỉ nhận nhóm "easy" (vật tĩnh/bẫy) để người chơi kịp làm quen,
//     không bị ném đạn/lao vào ngay khi vừa xuất phát.
//   - tháp canh + lính gác + kỵ binh là 1 nhóm (báo động gọi kỵ binh) nên luôn
//     đi chung 1 chunk; tháp canh chỉ là cảnh trí nên không tính vào 12.
//   - boss luôn cố định ở chunk 11 (thêm trong createLevelState).
// Mỗi nhóm là hàm (chunk, dx) -> { obstacles, hazards, enemies }; dx cộng vào
// MỌI toạ độ localX/triggerX của nhóm để cả nhóm dịch chung, không lệch nhau.
// width/height của obstacle giữ đúng tỉ lệ khung hình thật của từng ảnh.
const JITTER = 100;

const OBSTACLE_GROUPS = [
  // cành cây đổ — nhảy qua
  { easy: true, build: (c, dx) => ({ obstacles: [makeObstacle('fallenBranch', c, 700 + dx, 91, 39)] }) },
  // khối đá — nhảy qua / đứng lên được
  { easy: true, build: (c, dx) => ({ obstacles: [makeObstacle('stoneBlock', c, 600 + dx, 85, 39)] }) },
  // bẫy hố chông — tới gần mới bật lên
  { easy: true, build: (c, dx) => ({ hazards: [makeHazard('trap', 'spikePitHidden', c, 820 + dx, {
    harmful: false, sprungSprite: 'spikePitOpen', triggerDistance: 96
  })] }) },
  // mành lau — bắt buộc lướt (dash)
  { build: (c, dx) => ({ obstacles: [makeObstacle('reedCurtain', c, 500 + dx, 127, 53, { overhead: true })] }) },
  // kiệu quan — đi ngược chiều, nhảy qua
  { build: (c, dx) => ({ hazards: [makeHazard('roller', 'officialPalanquin', c, 1180 + dx, {
    speed: -74, triggerX: worldX(c, 150 + dx), animOffset: .15
  })] }) },
  // lính canh — đánh cận chiến
  { build: (c, dx) => ({ enemies: [
    { x: worldX(c, 1040 + dx), y: GROUND_Y - 82, w: 74, h: 82, hp: 2, maxHp: 2, boss: false, alive: true, hitTimer: 0 }
  ] }) },
  // lính thu thuế — ném túi tiền
  { build: (c, dx) => ({ hazards: [makeHazard('thrower', 'hanTaxSoldier', c, 520 + dx, {
    projectile: 'coinPouch', fireInterval: 3.2, hp: 2
  })] }) },
  // hổ rừng — lao tới
  { build: (c, dx) => ({ hazards: [makeHazard('roller', 'jungleTiger', c, 1220 + dx, {
    speed: -232, triggerX: worldX(c, 700 + dx), hp: 2, animOffset: .4
  })] }) },
  // xe cống phẩm — lăn tới; chém vỡ thì thành đống đổ nát vô hại nằm lại map
  { build: (c, dx) => ({ hazards: [makeHazard('roller', 'tributeCart', c, 1230 + dx, {
    speed: -168, triggerX: worldX(c, 250 + dx), hp: 2, wreckSprite: 'tributeCartBroken'
  })] }) },
  // tháp canh (cảnh trí) + lính gác ném phi tiêu + kỵ binh xông ra khi báo động.
  // Lính đứng DƯỚI CHÂN tháp (sàn tháp trong ảnh chỉ cao 68px mà lính cao 86px).
  { build: (c, dx) => ({ hazards: [
    makeHazard('prop', 'watchtower', c, 700 + dx, { harmful: false }),
    makeHazard('thrower', 'watchtowerGuard', c, 790 + dx, {
      projectile: 'throwingDart', fireInterval: 3.4, fireRange: 400,
      hp: 2, alarmFor: 'cavalry-charge'
    }),
    makeHazard('roller', 'hanCavalry', c, 1300 + dx, {
      id: 'cavalry-charge', speed: -316, hp: 3, animOffset: .25
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

export function createLevelState() {
  const layout = randomizeObstacles();
  return {
    running: false,
    paused: false,
    won: false,
    cameraX: 0,
    score: 0,
    health: 5,
    booksCollected: 0,
    questionShown: false,
    storyShown: false,
    restUsed: false,
    finishX: worldX(12, 1030),
    player: {
      x: 140,
      y: GROUND_Y - 70,
      w: 42,
      h: 70,
      normalH: 70,
      vx: 0,
      vy: 0,
      facing: 1,
      grounded: true,
      dashing: false,
      dashTimer: 0,
      attacking: false,
      attackTimer: 0,
      attackCooldown: 0,
      hurtTimer: 0,
      invulnerable: 0
    },
    // 12 chướng ngại vật (kể cả boss) được XẾP NGẪU NHIÊN mỗi lượt chơi —
    // xem randomizeObstacles() bên dưới.
    obstacles: layout.obstacles,
    hazards: layout.hazards,
    projectiles: [],
    holes: [],
    books: [
      { x: worldX(2, 650), y: GROUND_Y - 94, collected: false },
      { x: worldX(3, 650), y: GROUND_Y - 86, collected: false },
      { x: worldX(4, 700), y: GROUND_Y - 145, collected: false },
      { x: worldX(7, 430), y: GROUND_Y - 100, collected: false },
      { x: worldX(7, 930), y: GROUND_Y - 120, collected: false }
    ],
    enemies: [
      ...layout.enemies,
      { x: worldX(11, 850), y: GROUND_Y - 105, w: 96, h: 105, hp: 5, maxHp: 5, boss: true, alive: true, hitTimer: 0 }
      // Ảnh enemy lấy theo cờ `boss` (xem ENEMY_SPRITES trong config.js):
      // lính thường dùng strip lính Hán, boss dùng strip kỵ binh.
    ]
  };
}
