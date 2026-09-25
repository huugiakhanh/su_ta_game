// State của 1 lượt chơi (player/obstacles/holes/books/enemies...).
// `state` bị gán lại TOÀN BỘ object mỗi lần resetGame(), nên export dạng
// live-binding (`let` + setter) để các module khác import { state } luôn
// thấy giá trị mới nhất — đây là hành vi chuẩn của ES module named export.

import { worldX, makeObstacle, makeHazard } from './geometry.js';
import { GROUND_Y } from './config.js';
import { createAnim } from './animation.js';

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
const JITTER = 60;

// Enemy đứng yên trên mặt đất: x = mép trái hitbox, w/h = hitbox (px logic).
function makeEnemy(x, w, h, hp, boss) {
  return {
    x, y: GROUND_Y - h, w, h, hp, maxHp: hp, boss,
    alive: true, dying: false, hitTimer: 0, anim: createAnim('idle')
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
  // kiệu quan — đi ngược chiều, nhảy qua
  { build: (c, dx) => ({ hazards: [makeHazard('roller', 'officialPalanquin', c, 708 + dx, {
    speed: -44, triggerX: worldX(c, 90 + dx)
  })] }) },
  // lính canh — đánh cận chiến
  { build: (c, dx) => ({ enemies: [
    makeEnemy(worldX(c, 624 + dx), 22, 40, 2, false)
  ] }) },
  // lính thu thuế — ném túi tiền
  { build: (c, dx) => ({ hazards: [makeHazard('thrower', 'hanTaxSoldier', c, 312 + dx, {
    projectile: 'coinPouch', fireInterval: 3.2, hp: 2
  })] }) },
  // hổ rừng — lao tới
  { build: (c, dx) => ({ hazards: [makeHazard('roller', 'jungleTiger', c, 732 + dx, {
    speed: -139, triggerX: worldX(c, 420 + dx), hp: 2
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
    finishX: worldX(12, 618),
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
    // 12 chướng ngại vật (kể cả boss) được XẾP NGẪU NHIÊN mỗi lượt chơi —
    // xem randomizeObstacles() bên dưới.
    obstacles: layout.obstacles,
    hazards: layout.hazards,
    projectiles: [],
    holes: [],
    books: [
      { x: worldX(2, 390), y: GROUND_Y - 56, collected: false },
      { x: worldX(3, 390), y: GROUND_Y - 52, collected: false },
      { x: worldX(4, 420), y: GROUND_Y - 87, collected: false },
      { x: worldX(7, 258), y: GROUND_Y - 60, collected: false },
      { x: worldX(7, 558), y: GROUND_Y - 72, collected: false }
    ],
    enemies: [
      ...layout.enemies,
      makeEnemy(worldX(11, 510), 90, 80, 5, true)
      // Ảnh enemy lấy theo cờ `boss` (xem ENEMY_SPRITES trong config.js):
      // lính thường EN_HAN_GUARD, boss BOSS_TO_DINH_CHARIOT (hitbox 90x80 theo
      // hình mới — quyết định team §9.4).
    ]
  };
}
