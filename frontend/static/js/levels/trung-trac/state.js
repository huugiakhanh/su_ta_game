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
      hurtTimer: 0,
      invulnerable: 0
    },
    // Màn có ĐÚNG 12 chướng ngại vật (kể cả boss), trải đều ~1 cái/chunk, độ
    // khó tăng dần. Tháp canh ở chunk 10 chỉ là cảnh trí nên không tính.
    //   1  c1   cành cây đổ        (obstacles)   nhảy qua
    //   2  c2   kiệu quan          (hazards)     đi ngược chiều, nhảy qua
    //   3  c3   bẫy hố chông       (hazards)     tới gần mới bật lên
    //   4  c4   khối đá            (obstacles)   nhảy qua / đứng lên được
    //   5  c5   mành lau           (obstacles)   bắt buộc lướt (dash)
    //   6  c6   lính canh          (enemies)     đánh cận chiến
    //   7  c7   lính thu thuế      (hazards)     ném túi tiền
    //   8  c8   hổ rừng            (hazards)     lao tới
    //   9  c9   xe cống phẩm       (hazards)     lăn tới, chém vỡ được
    //   10 c10  lính gác tháp      (hazards)     ném phi tiêu + báo động
    //   11 c10  kỵ binh            (hazards)     xông ra khi có báo động
    //   12 c11  boss               (enemies)
    // Không còn hố rơi và thuyền tuần tra (bỏ theo yêu cầu thiết kế).
    //
    // width/height của obstacle giữ đúng tỉ lệ khung hình thật của từng ảnh
    // (đã đo qua bounding box sau khi crop sát nội dung) để sprite không méo.
    obstacles: [
      makeObstacle('fallenBranch', 1, 700, 52, 39),
      makeObstacle('stoneBlock', 4, 600, 76, 39),
      makeObstacle('reedCurtain', 5, 500, 133, 53, { overhead: true })
    ],
    hazards: [
      makeHazard('roller', 'officialPalanquin', 2, 1180, {
        speed: -74, triggerX: worldX(2, 150), animOffset: .15
      }),
      makeHazard('trap', 'spikePitHidden', 3, 820, {
        harmful: false, sprungSprite: 'spikePitOpen', triggerDistance: 96
      }),
      makeHazard('thrower', 'hanTaxSoldier', 7, 520, {
        projectile: 'coinPouch', fireInterval: 1.9, hp: 2
      }),
      makeHazard('roller', 'jungleTiger', 8, 1220, {
        speed: -232, triggerX: worldX(8, 700), hp: 2, animOffset: .4
      }),
      // Xe cống: chém vỡ thì biến thành đống đổ nát vô hại nằm lại map.
      makeHazard('roller', 'tributeCart', 9, 1230, {
        speed: -168, triggerX: worldX(9, 250), hp: 2, wreckSprite: 'tributeCartBroken'
      }),
      // Tháp canh chỉ là cảnh trí. Lính đứng DƯỚI CHÂN tháp (sàn tháp trong
      // ảnh chỉ cao 68px mà lính cao 86px); tới gần thì thổi tù và gọi kỵ binh.
      makeHazard('prop', 'watchtower', 10, 700, { harmful: false }),
      makeHazard('thrower', 'watchtowerGuard', 10, 790, {
        projectile: 'throwingDart', fireInterval: 2.2, fireRange: 400,
        hp: 2, alarmFor: 'cavalry-charge'
      }),
      makeHazard('roller', 'hanCavalry', 10, 1300, {
        id: 'cavalry-charge', speed: -316, hp: 3, animOffset: .25
      })
    ],
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
      { x: worldX(6, 1040), y: GROUND_Y - 82, w: 74, h: 82, hp: 2, maxHp: 2, boss: false, alive: true, hitTimer: 0 },
      { x: worldX(11, 850), y: GROUND_Y - 105, w: 96, h: 105, hp: 5, maxHp: 5, boss: true, alive: true, hitTimer: 0 }
      // Ảnh enemy lấy theo cờ `boss` (xem ENEMY_SPRITES trong config.js):
      // lính thường dùng strip lính Hán, boss dùng strip kỵ binh.
    ]
  };
}
