// State của 1 lượt chơi (player/obstacles/holes/books/enemies...).
// `state` bị gán lại TOÀN BỘ object mỗi lần resetGame(), nên export dạng
// live-binding (`let` + setter) để các module khác import { state } luôn
// thấy giá trị mới nhất — đây là hành vi chuẩn của ES module named export.

import { worldX, makeObstacle } from './geometry.js';
import { GROUND_Y } from './config.js';

export let state = null;

export function setState(nextState) {
  state = nextState;
  return state;
}

export function createLevelState() {
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
      invulnerable: 0
    },
    // Phần 1: mỗi loại lấy đúng 1 ảnh riêng trong assets/images/obstacles.
    // width/height truyền vào giữ đúng tỉ lệ khung hình thật của từng ảnh
    // (đã đo qua bounding box) để sprite không bị méo khi scale.
    obstacles: [
      makeObstacle('fallenBranch', 1, 700, 55, 48),
      makeObstacle('stoneBlock', 2, 300, 46, 61),
      makeObstacle('fenceLow', 2, 800, 32, 39),
      makeObstacle('bambooSlope', 3, 300, 110, 48),
      makeObstacle('spikesTrap', 3, 800, 79, 53, { harmful: true }),
      makeObstacle('reedCurtain', 5, 300, 133, 61, { overhead: true }),
      makeObstacle('slideBar', 5, 800, 145, 57, { overhead: true }),
      makeObstacle('bridge', 6, 300, 82, 55),
      makeObstacle('fenceHigh', 6, 800, 44, 67),
      makeObstacle('logDrift', 9, 750, 67, 64)
    ],
    holes: [
      { x: worldX(4, 455), w: 155 },
      // Cầu ở map 1.4 có mặt cầu để đứng. Chỉ giữ một khe gãy nhỏ cần nhảy qua.
      { x: worldX(4, 865), w: 52 }
    ],
    books: [
      { x: worldX(2, 650), y: GROUND_Y - 94, collected: false },
      { x: worldX(3, 650), y: GROUND_Y - 86, collected: false },
      { x: worldX(4, 700), y: GROUND_Y - 145, collected: false },
      { x: worldX(7, 430), y: GROUND_Y - 100, collected: false },
      { x: worldX(7, 930), y: GROUND_Y - 120, collected: false }
    ],
    enemies: [
      { x: worldX(6, 1040), y: GROUND_Y - 82, w: 74, h: 82, hp: 2, maxHp: 2, boss: false, alive: true, hitTimer: 0 },
      { x: worldX(11, 850), y: GROUND_Y - 105, w: 96, h: 105, hp: 5, maxHp: 5, boss: true, alive: true, hitTimer: 0 }
    ]
  };
}
