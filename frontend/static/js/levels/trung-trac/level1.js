// Màn 1 "Vượt ải": 11 nhóm chướng ngại xáo mỗi lượt + mini-boss kiệu quan +
// 5 bình thư + 4 câu hỏi chặn đường; layout thử `?layout=p2`. Sự kiện 1 lần:
// nghỉ chân, dòng cốt truyện.

import { worldX, makeObstacle, makeHazard, setTerrain, buildTerrain, terrainHoles } from '../../engine/geometry.js';
import {
  makeEnemy, makeQuiz, makeItem, shuffle, keepValidBridges, checkTerrainFootprints
} from '../../engine/entities.js';
import { state } from '../../engine/state.js';
import { showMessage } from '../../engine/ui.js';
import { playSfx } from '../../engine/audio.js';
import { TERRAIN_CELL, MAX_HEALTH } from '../../engine/config.js';
import { LEVEL } from '../../engine/chapter.js';
import { MINIBOSS, QUIZ } from './config.js';
import { LEVEL1_QUESTION_POOL } from './questions-data.js';

// Màn có ĐÚNG 12 chướng ngại vật (kể cả mini-boss), ~1 cái/chunk. Mỗi lượt chơi
// (resetGame -> createLevelState) các nhóm dưới đây được xáo ngẫu nhiên vào
// chunk 1..10 và lệch thêm ±JITTER px trong chunk:
//   - chunk 1 chỉ nhận nhóm "easy" (vật tĩnh/bẫy) để người chơi kịp làm quen,
//     không bị ném đạn/lao vào ngay khi vừa xuất phát.
//   - tháp canh + lính gác + kỵ binh là 1 nhóm (báo động gọi kỵ binh) nên luôn
//     đi chung 1 chunk; tháp canh chỉ là cảnh trí nên không tính vào 12.
//   - mini-boss kiệu quan luôn cố định ở chunk 11 (thêm trong
//     level1Content). Kiệu KHÔNG còn nằm trong nhóm xáo (TT-NPC-01, quyết
//     định team D5) — chỗ của nó là nhóm lính canh thứ 2.
// Mỗi nhóm là hàm (chunk, dx) -> { obstacles, hazards, enemies }; dx cộng vào
// MỌI toạ độ localX/triggerX của nhóm để cả nhóm dịch chung, không lệch nhau.
// width/height của obstacle giữ đúng tỉ lệ khung hình thật của từng ảnh.
// `terrain` (TT-TERRAIN-01, DESIGN_BASELINE): lưới chữ 48 ô của chunk nhóm
// đó ('#' đất, hàng cuối = GROUND_Y) — địa hình đi theo nhóm; nhóm có địa
// hình chỉ lệch TERRAIN_JITTER (bội số 1 ô) để bậc đất không đè lên bia câu
// hỏi (chunk 3/5/8 x 312, chunk 10 x 560) hay vật trong nhóm. Nhóm không khai
// báo = chunk phẳng. Không đặt bậc trong ~130px đầu chunk (chỗ hồi sinh).
const JITTER = 60;
const TERRAIN_JITTER = TERRAIN_CELL;

const OBSTACLE_GROUPS = [
  // cành cây đổ — nhảy qua, rồi nhảy lên gò đất 1 ô
  { easy: true, terrain: [
    '................................######..........',
    '################################################'
  ], build: (c, dx) => ({ obstacles: [makeObstacle('fallenBranch', c, 420 + dx, 55, 23)] }) },
  // khối đá — nhảy qua / đứng lên được, sau đó là bậc thang 2 ô
  { easy: true, terrain: [
    '..............................###...............',
    '............................##########..........',
    '################################################'
  ], build: (c, dx) => ({ obstacles: [makeObstacle('stoneBlock', c, 360 + dx, 51, 23)] }) },
  // bẫy hố chông — tới gần mới bật lên; gò đất 1 ô phía trước
  { easy: true, terrain: [
    '.........########...............................',
    '################################################'
  ], build: (c, dx) => ({ hazards: [makeHazard('trap', 'spikePit', c, 492 + dx, {
    harmful: false, triggerDistance: 58
  })] }) },
  // mành lau — bắt buộc lướt (dash)
  { build: (c, dx) => ({ obstacles: [makeObstacle('reedCurtain', c, 300 + dx, 76, 32, { overhead: true })] }) },
  // lính canh — đi tuần, đâm kích khi người chơi tới gần. Có 2 nhóm: nhóm
  // thứ 2 thay chỗ kiệu quan `roller` cũ (kiệu giờ là mini-boss chunk 11 —
  // quyết định team D5), đứng LỆCH vị trí trong chunk so với nhóm 1 (đầu
  // chunk thay vì cuối chunk; tránh các vị trí sách 258–558). Lính đứng gác
  // trên gò đất 1 ô (đoạn tuần tra kẹp trong gò — makeEnemy).
  { terrain: [
    '.....................................##########.',
    '################################################'
  ], build: (c, dx) => ({ enemies: [
    makeEnemy(worldX(c, 624 + dx), 22, 40, 2, false)
  ] }) },
  { terrain: [
    '.........########...............................',
    '################################################'
  ], build: (c, dx) => ({ enemies: [
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

// Mini-boss kiệu quan (TT-NPC-01 §3.1.2): đi tuần quanh tâm trong đoạn
// patrolRange, vào tầm thì dừng lại ném dao — hành vi `patrol` của engine
// (hazards.js). `boss: true` -> phải hạ mới mở cổng.
function makeMiniBoss() {
  const hazard = makeHazard('patrol', 'palanquinBoss', MINIBOSS.chunk, MINIBOSS.localX, {
    speed: -MINIBOSS.speed, hp: MINIBOSS.hp, projectile: 'throwingKnife',
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
    // Đang đi (true) hay đứng chờ ném (false) — chọn animation move/idle.
    walking: true
  };
}

function randomizeObstacles() {
  const easy = OBSTACLE_GROUPS.filter(group => group.easy);
  const first = easy[Math.floor(Math.random() * easy.length)];
  const order = [first, ...shuffle(OBSTACLE_GROUPS.filter(group => group !== first))];
  const plan = order.map((group, index) => {
    const range = group.terrain ? TERRAIN_JITTER : JITTER;
    let dx = Math.round((Math.random() * 2 - 1) * range);
    // Nhóm có địa hình lệch đúng bội số 1 ô để vật trong nhóm khớp bậc đất.
    if (group.terrain) dx = Math.round(dx / TERRAIN_CELL) * TERRAIN_CELL;
    return { group, chunk: index + 1, dx };
  });
  // Địa hình phải có TRƯỚC khi dựng nội dung: vật/lính đứng theo groundYAt().
  setTerrain(buildTerrain(plan.filter(item => item.group.terrain).map(item => ({
    chunk: item.chunk, rows: item.group.terrain, shift: item.dx / TERRAIN_CELL
  })), LEVEL.chunks));
  const layout = { obstacles: [], hazards: [], enemies: [] };
  plan.forEach(({ group, chunk, dx }) => {
    const built = group.build(chunk, dx);
    layout.obstacles.push(...(built.obstacles || []));
    layout.hazards.push(...(built.hazards || []));
    layout.enemies.push(...(built.enemies || []));
  });
  return layout;
}

// Mỗi lượt rút QUIZ.level1Count câu KHÔNG trùng trong bộ màn 1, đặt lần lượt
// vào QUIZ.level1Spots.
function level1Quizzes() {
  const chosen = shuffle(LEVEL1_QUESTION_POOL).slice(0, QUIZ.level1Count);
  return chosen.map((stt, index) => makeQuiz(...QUIZ.level1Spots[index], stt));
}

// Nội dung màn 1. `options.layout === 'p2'` -> layout thử P2; mặc định màn
// thường (11 chướng ngại vật xáo ngẫu nhiên + mini-boss kiệu quan + 5 sách +
// 4 câu hỏi chặn đường).
export function level1Content(options) {
  const testP2 = options.layout === 'p2';
  const layout = testP2 ? p2TestLayout() : { ...randomizeObstacles(), holes: terrainHoles() };
  const content = {
    // 12 chướng ngại vật (kể cả mini-boss) được XẾP NGẪU NHIÊN mỗi lượt chơi —
    // xem randomizeObstacles() ở trên.
    obstacles: keepValidBridges(layout.obstacles, layout.holes),
    hazards: testP2 ? layout.hazards : [...layout.hazards, makeMiniBoss()],
    holes: layout.holes,
    items: testP2 ? [] : [
      makeItem(2, 390, 56),
      makeItem(3, 390, 52),
      makeItem(4, 420, 87),
      makeItem(7, 258, 60),
      makeItem(7, 558, 72)
    ],
    // Boss Tô Định KHÔNG ở màn 1 — để dành cho màn 3 (TT-NPC-01).
    enemies: testP2 ? [] : layout.enemies,
    npcs: [],
    quizzes: testP2 ? [] : level1Quizzes()
  };
  checkTerrainFootprints(content);
  return content;
}

// Mốc sự kiện 1 lần của màn 1 (giữ nguyên theo D1–D2): nghỉ chân chunk 9,
// dòng cốt truyện chunk 10.
export function level1Events(p) {
  if (!state.restUsed && p.x > worldX(9, 282)) {
    state.restUsed = true;
    state.health = Math.min(MAX_HEALTH, state.health + 1);
    playSfx('heal');
    showMessage('Nghỉ chân: hồi 1 máu.');
  }

  if (!state.storyShown && p.x > worldX(10, 312)) {
    state.storyShown = true;
    showMessage('Mê Linh, năm 40: nghĩa quân tập hợp, chuẩn bị phất cờ khởi nghĩa.', 3600);
  }
}
