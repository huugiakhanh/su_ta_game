// State của 1 lượt chơi (player/obstacles/holes/books/enemies...).
// `state` bị gán lại TOÀN BỘ object mỗi lần resetGame(), nên export dạng
// live-binding (`let` + setter) để các module khác import { state } luôn
// thấy giá trị mới nhất — đây là hành vi chuẩn của ES module named export.

import {
  worldX, makeObstacle, makeHazard, setTerrain, buildTerrain, terrainHoles, terrainLevelAt, flatSpan, groundYAt
} from './geometry.js';
import {
  GROUND_Y, TERRAIN_CELL, MINIBOSS, GUARD, LEVEL, NPC_RULES, NPC_RESCUE, OBSTACLE_TYPES, ARENA, RUSHER, SKILLS, SKILL_TEST,
  BOSS_TD, WALL_ARROWS, QUIZ
} from './config.js';
import { LEVEL1_QUESTION_POOL, NPC_QUESTION_POOLS } from './questions-data.js';
import { createAnim } from './animation.js';

export let state = null;

export function setState(nextState) {
  state = nextState;
  return state;
}

// Boss/mini-boss của màn còn sống? (enemy `boss` — Tô Định, dành cho màn 3 —
// hoặc hazard `boss` — mini-boss kiệu quan màn 1). physics.js (giữ người chơi
// ở cổng) và render.js (cổng mở) dùng chung.
// Khoá ENEMY_SPRITES của enemy: `art` (màn 3: rusher, dummy...) hoặc boss/normal.
export function enemyArtKey(enemy) {
  return enemy.art || (enemy.boss ? 'boss' : 'normal');
}

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
// `terrain` (TT-TERRAIN-01, DESIGN_BASELINE): lưới chữ 48 ô của chunk nhóm
// đó ('#' đất, hàng cuối = GROUND_Y) — địa hình đi theo nhóm; nhóm có địa
// hình chỉ lệch TERRAIN_JITTER (bội số 1 ô) để bậc đất không đè lên bia câu
// hỏi (chunk 3/5/8 x 312, chunk 10 x 560) hay vật trong nhóm. Nhóm không khai
// báo = chunk phẳng. Không đặt bậc trong ~130px đầu chunk (chỗ hồi sinh).
const JITTER = 60;
const TERRAIN_JITTER = TERRAIN_CELL;

// Enemy trên mặt đất: x = mép trái hitbox, w/h = hitbox (px logic). Lính
// thường (không boss) đi tuần quanh chỗ đứng và đâm kích khi người chơi tới
// gần — hành vi ở physics.js (updateGuard), thông số GUARD trong config.js.
// Boss đứng yên.
// `options` (màn 3, TT-BOSS-01): patrolMin/patrolMax/aggroRange ghi đè đoạn tuần
// tra + tầm phát hiện của GUARD (lính canh đấu trường đuổi khắp đấu trường).
// Địa hình (TT-TERRAIN-01): đứng trên mặt đất tại tâm; đoạn tuần tra bị kẹp
// trong đoạn đất phẳng chứa tâm (flatSpan) -> lính không đi xuyên bậc đất.
export function makeEnemy(x, w, h, hp, boss, options = {}) {
  const center = x + w / 2;
  const enemy = {
    x, y: groundYAt(center) - h, w, h, hp, maxHp: hp, boss,
    alive: true, dying: false, hitTimer: 0, anim: createAnim('idle')
  };
  if (boss) return enemy;
  const [flatMin, flatMax] = flatSpan(center);
  return {
    ...enemy,
    facing: -1,
    walking: true,
    patrolMin: Math.max(flatMin + w / 2, options.patrolMin ?? center - GUARD.patrolRange / 2),
    patrolMax: Math.min(flatMax - w / 2, options.patrolMax ?? center + GUARD.patrolRange / 2),
    aggroRange: options.aggroRange ?? GUARD.aggroRange,
    // Cú đâm đang diễn { time, hit } hoặc null.
    action: null,
    attackCooldown: 0
  };
}

// Lính canh trong đấu trường màn 3: đoạn tuần tra [40, width − 40], phát hiện
// người chơi ở mọi chỗ -> truy đuổi khắp đấu trường (updateGuard có tham số).
export function makeArenaGuard(centerX) {
  return makeEnemy(centerX - 11, 22, 40, 2, false, {
    patrolMin: 40, patrolMax: ARENA.width - 40, aggroRange: ARENA.width
  });
}

// Quân cảm tử (TT-BOSS-01 §3.3): `direction` = hướng chạy hiện tại; `rest` =
// thời gian nghỉ còn lại sau cú đâm. Hành vi ở physics.js (updateRusher).
export function makeRusher(centerX, direction) {
  return {
    ...makeEnemy(centerX - RUSHER.w / 2, RUSHER.w, RUSHER.h, RUSHER.hp, false),
    art: 'rusher', facing: direction, direction, rest: 0, walking: true
  };
}

// Bao cát (layout thử): đứng yên, không gây sát thương, không cho điểm.
function makeDummy(centerX) {
  return {
    ...makeEnemy(centerX - 11, 22, 40, SKILL_TEST.dummyHp, false),
    art: 'dummy', harmless: true, walking: false
  };
}

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

// Mốc câu hỏi chặn đường (TT-QUIZ-01): chạm `x` thì physics.js mở câu hỏi
// `stt` (QUESTIONS trong questions-data.js) 1 lần. `npc` = id NPC sắp gặp (màn
// 2 — tiêu đề khung "Câu hỏi về …") hoặc null (màn 1).
// `footY` = mặt đất dưới bia đá (địa hình TT-TERRAIN-01).
function makeQuiz(chunk, localX, stt, npc = null) {
  const x = worldX(chunk, localX);
  return { x, footY: groundYAt(x), stt, npc, done: false };
}

// Bình thư lơ lửng `lift` px trên mặt đất tại chỗ đặt.
function makeBook(chunk, localX, lift) {
  const x = worldX(chunk, localX);
  return { x, y: groundYAt(x) - lift, collected: false };
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// Màn 1: mỗi lượt rút QUIZ.level1Count câu KHÔNG trùng trong bộ màn 1, đặt lần
// lượt vào QUIZ.level1Spots.
function level1Quizzes() {
  const chosen = shuffle(LEVEL1_QUESTION_POOL).slice(0, QUIZ.level1Count);
  return chosen.map((stt, index) => makeQuiz(...QUIZ.level1Spots[index], stt));
}

// Nội dung màn 1. `options.layout === 'p2'` -> layout thử P2; mặc định màn
// thường (11 chướng ngại vật xáo ngẫu nhiên + mini-boss kiệu quan + 5 sách +
// 4 câu hỏi chặn đường).
function level1Content(options) {
  const testP2 = options.layout === 'p2';
  const layout = testP2 ? p2TestLayout() : { ...randomizeObstacles(), holes: terrainHoles() };
  const content = {
    // 12 chướng ngại vật (kể cả mini-boss) được XẾP NGẪU NHIÊN mỗi lượt chơi —
    // xem randomizeObstacles() ở trên.
    obstacles: keepValidBridges(layout.obstacles, layout.holes),
    hazards: testP2 ? layout.hazards : [...layout.hazards, makeMiniBoss()],
    holes: layout.holes,
    books: testP2 ? [] : [
      makeBook(2, 390, 56),
      makeBook(3, 390, 52),
      makeBook(4, 420, 87),
      makeBook(7, 258, 60),
      makeBook(7, 558, 72)
    ],
    // Boss Tô Định (makeEnemy(..., 90, 80, 5, true), BOSS_TO_DINH_CHARIOT)
    // KHÔNG còn ở màn 1 — để dành cho màn 3 (TT-NPC-01).
    enemies: testP2 ? [] : layout.enemies,
    npcs: [],
    quizzes: testP2 ? [] : level1Quizzes()
  };
  checkTerrainFootprints(content);
  return content;
}

// Vật tĩnh / hazard / NPC / bia câu hỏi không được đứng vắt qua bậc đất (chân
// phải nằm trọn trên 1 độ cao) — sai thì cảnh báo để phát hiện khi chỉnh
// layout (TT-TERRAIN-01). Cầu (requiresHole) nằm trên hố nên bỏ qua.
function checkTerrainFootprints(content) {
  const things = [
    ...content.obstacles.filter(item => !item.requiresHole).map(item => ({ name: item.type, x: item.x, w: item.w })),
    ...content.hazards.map(item => ({ name: item.sprite, x: item.x, w: item.w })),
    ...content.npcs.map(item => ({ name: item.id, x: item.x, w: item.w })),
    ...content.quizzes.map(item => ({ name: `bia câu ${item.stt}`, x: item.x - 16, w: 32 }))
  ];
  things.forEach(({ name, x, w }) => {
    const level = terrainLevelAt(x);
    for (let px = x; px < x + w; px += TERRAIN_CELL / 2) {
      if (terrainLevelAt(px) !== level || terrainLevelAt(x + w - 1) !== level) {
        console.warn(`${name} ở x=${Math.round(x)} vắt qua bậc đất`);
        return;
      }
    }
  });
}

// NPC màn 2: `centerX` = tâm = pivot bottom-center; x/y/w/h chỉ là hộp F2
// (NPC không có va chạm). met = đã gặp xong; fade 1 -> 0 sau khi gặp (mờ dần
// rồi biến mất); talking = đang nói thoại (render phát `talk`).
function makeNpc(id, chunk, localX) {
  const centerX = worldX(chunk, localX);
  return {
    id, centerX,
    x: centerX - NPC_RULES.w / 2, y: groundYAt(centerX) - NPC_RULES.h, w: NPC_RULES.w, h: NPC_RULES.h,
    met: false, talking: false, fade: 1
  };
}

// Vật cản / hazard / hố không được nằm trong NPC_RULES.clearance quanh tâm NPC
// (§3.2.2) — sai thì cảnh báo để phát hiện khi chỉnh layout. Lính vây NPC
// (enemy `captorOf`) cố ý đứng sát NPC nên không kiểm tra.
function checkNpcClearance(content) {
  const things = [
    ...content.obstacles.map(item => ({ name: item.type, x: item.x, w: item.w })),
    ...content.hazards.map(item => ({ name: item.sprite, x: item.x, w: item.w })),
    ...content.holes.map(item => ({ name: 'hố', x: item.x, w: item.w }))
  ];
  things.forEach(thing => content.npcs.forEach(npc => {
    const gap = Math.max(thing.x - npc.centerX, npc.centerX - (thing.x + thing.w), 0);
    if (gap < NPC_RULES.clearance) console.warn(`${thing.name} ở x=${thing.x} cách NPC ${npc.id} ${gap}px < ${NPC_RULES.clearance}px`);
  }));
}

// 2 lính canh vây NPC (giải cứu — NPC_RESCUE): 1 bên trái, 1 bên phải, đoạn
// tuần tra phủ tới chỗ người chơi bị giữ trước NPC. `captorOf` = id NPC —
// physics.js (updateMeetings) chỉ mở hội thoại khi lính vây đã chết hết.
function makeCaptors(npc) {
  return [NPC_RESCUE.left, NPC_RESCUE.right].map(side => ({
    ...makeEnemy(npc.centerX + side.dx - 11, 22, 40, 2, false, {
      patrolMin: npc.centerX + side.patrol[0], patrolMax: npc.centerX + side.patrol[1]
    }),
    captorOf: npc.id
  }));
}

// Nội dung màn 2 "Chiêu mộ hiền tài" (TT-NPC-01 §3.2; tăng độ khó TT-L2-HARD
// 29/09 — quân Hán chặn đường + giải cứu NPC + địa hình khó, khó hơn màn 1;
// kéo dài 9 chunk + câu hỏi chặn đường trước mỗi NPC TT-QUIZ-01 29/09). Vị trí
// CỐ ĐỊNH, không xáo; DESIGN_BASELINE. Chỉ dùng quân/bẫy/vật cản đã có ở màn 1
// và layout thử P2 (không asset mới).
// Thứ tự: câu hỏi về Thi Sách (chunk 2) -> Thi Sách (chunk 3) -> cốt truyện khi
// vào chunk 4 -> câu hỏi về Lê Chân (chunk 5) -> Lê Chân (chunk 6) -> câu hỏi
// về Trưng Nhị (chunk 8) -> Trưng Nhị (chunk 9) -> về đích cuối chunk 9. Mỗi
// NPC bị 2 lính canh vây (makeCaptors). Hố căn lưới tile 16px; không đặt hố
// trong ~130px đầu chunk (chỗ hồi sinh sau khi rơi = đầu chunk + 72).
// Địa hình (TT-TERRAIN-01, DESIGN_BASELINE): lưới chữ 48 ô/chunk, '#' đất,
// hàng cuối = GROUND_Y; '.' ở hàng cuối = HỐ (state.holes sinh từ lưới).
// Chunk không khai báo = phẳng. Quanh NPC (chunk 3/6/9 x 560) giữ phẳng.
const LEVEL2_TERRAIN = {
  // chunk 1: gò đất 1 ô giữa hố chông và lính canh
  1: [
    '........................######..................',
    '################################################'
  ],
  // chunk 2: đồi 2 bậc — đứng trên đồi thì túi tiền của lính thu thuế đập vào sườn đồi
  2: [
    '.........#####..................................',
    '.......#########................................',
    '################################################'
  ],
  // chunk 4: hố hở 64px (x 400) — nhảy qua, ngay sau là thanh trượt bắt buộc lướt
  4: [
    '#########################....###################'
  ],
  // chunk 5: lính canh gác trên gò đất 1 ô
  5: [
    '...............########.........................',
    '################################################'
  ],
  // chunk 6: đồi 2 bậc trước khối đá
  6: [
    '...............####.............................',
    '.............########...........................',
    '################################################'
  ],
  // chunk 7: hố 96px (x 160) có cầu bắc qua
  7: [
    '##########......################################'
  ],
  // chunk 8: đồi 2 bậc trước bia câu hỏi về Trưng Nhị
  8: [
    '............................####................',
    '..........................########..............',
    '################################################'
  ]
};

function level2Content() {
  setTerrain(buildTerrain(Object.entries(LEVEL2_TERRAIN).map(([chunk, rows]) => ({ chunk: Number(chunk), rows })), LEVEL.chunks));
  const npcs = [
    makeNpc('thiSach', 3, 560),
    makeNpc('leChan', 6, 560),
    makeNpc('trungNhi', 9, 560)
  ];
  const holes = terrainHoles();
  const obstacles = [
    // chunk 1–2 — làng
    makeObstacle('fenceLow', 1, 150, 40, 18),
    // chunk 3 — đồng lúa
    makeObstacle('reedCurtain', 3, 200, 76, 32, { overhead: true }),
    // chunk 4 — rừng: rào cao, hố hở, thanh trượt (lướt hồi chiêu 2 s -> canh nhịp)
    makeObstacle('fenceHigh', 4, 200, 16, 48),
    makeObstacle('slideBar', 4, 560, 40, 20),
    // chunk 5 — rừng
    makeObstacle('bambooSlope', 5, 450, 56, 30),
    // chunk 6 — bến sông
    makeObstacle('logDrift', 6, 120, 56, 14),
    makeObstacle('stoneBlock', 6, 380, 51, 23),
    // chunk 7 — cầu qua hố, cành cây đổ
    makeObstacle('bridge', 7, 160, 96, 8),
    makeObstacle('fallenBranch', 7, 330, 55, 23),
    // chunk 9
    makeObstacle('fallenBranch', 9, 200, 55, 23)
  ];
  const hazards = [
    // chunk 1: hố chông ẩn
    makeHazard('trap', 'spikePit', 1, 300, { harmful: false, triggerDistance: 58 }),
    // chunk 2: lính thu thuế ném túi tiền + xe cống lăn tới
    makeHazard('thrower', 'hanTaxSoldier', 2, 300, { projectile: 'coinPouch', fireInterval: 3.2, hp: 2 }),
    makeHazard('roller', 'tributeCart', 2, 738, { speed: -101, triggerX: worldX(2, 150), hp: 2 }),
    // chunk 4: hổ lao ra từ ngoài màn hình (như màn 1)
    makeHazard('roller', 'jungleTiger', 4, 732, { speed: -139, triggerX: worldX(4, 260), hp: 2 }),
    // chunk 5: hố chông ẩn
    makeHazard('trap', 'spikePit', 5, 150, { harmful: false, triggerDistance: 58 }),
    // chunk 7: tháp canh + lính gác ném phi tiêu + kỵ binh xông ra khi báo động
    makeHazard('prop', 'watchtower', 7, 520, { harmful: false }),
    makeHazard('thrower', 'watchtowerGuard', 7, 574, {
      projectile: 'throwingDart', fireInterval: 3.4, fireRange: 240, hp: 2, alarmFor: 'cavalry-charge'
    }),
    makeHazard('roller', 'hanCavalry', 7, 780, { id: 'cavalry-charge', speed: -190, hp: 3 }),
    // chunk 8: lính thu thuế
    makeHazard('thrower', 'hanTaxSoldier', 8, 180, { projectile: 'coinPouch', fireInterval: 3.2, hp: 2 })
  ];
  const enemies = [
    // lính canh đi tuần giữa đường
    makeEnemy(worldX(1, 560), 22, 40, 2, false),
    makeEnemy(worldX(5, 300), 22, 40, 2, false),
    makeEnemy(worldX(8, 330), 22, 40, 2, false),
    // lính vây NPC
    ...npcs.flatMap(makeCaptors)
  ];
  // Câu hỏi chặn đường trước mỗi NPC: 1 câu rút ngẫu nhiên trong bộ của NPC.
  const quizzes = npcs.map(npc => makeQuiz(...QUIZ.level2Spots[npc.id], pick(NPC_QUESTION_POOLS[npc.id]), npc.id));
  const content = { obstacles: keepValidBridges(obstacles, holes), hazards, holes, books: [], enemies, npcs, quizzes };
  checkNpcClearance(content);
  checkTerrainFootprints(content);
  return content;
}

// Cột đá đấu trường: vật cản tĩnh + cờ `blocking` (Q1) + trạng thái ô vẽ
// (`intact` -> `cracked` khi chiến xa đâm — Phase B).
function makePillar(centerX) {
  const obstacle = makeObstacle('stonePillar', 1, centerX - ARENA.pillarW / 2, ARENA.pillarW, ARENA.pillarH);
  return { ...obstacle, blocking: Boolean(OBSTACLE_TYPES.stonePillar.blocking), state: 'intact' };
}

// Hàng đợi sinh quân: groups (mỗi nhóm = [{type, at, dx}]) chạy lần lượt,
// nhóm sau bắt đầu khi nhóm trước chết hết + gap giây (kể cả nhóm đầu). loop =
// lặp lại; không lặp thì `done` = true khi nhóm cuối đã chết hết.
export function makeSpawner(groups, gap, loop) {
  return { groups, gap, loop, index: 0, pending: [], time: 0, wait: gap, done: false };
}

// Chiến xa Tô Định (giai đoạn 1, TT-BOSS-01 §3.5): enemy boss 90x80, KHÔNG có
// máu thường — `shield` nấc khiên (hp giữ bằng shield để thanh máu/ô F2 đọc).
// Máy trạng thái ở physics.js (updateChariot): mode throw -> warn -> charge ->
// stun | wall -> throw... `corpse`: hết khiên thì xác xe nằm lại.
function makeChariot() {
  const enemy = makeEnemy(BOSS_TD.startX - BOSS_TD.w / 2, BOSS_TD.w, BOSS_TD.h, BOSS_TD.shield, true);
  return {
    ...enemy,
    art: 'boss', kind: 'chariot', corpse: true, noBar: true,
    shield: BOSS_TD.shield, shielded: true,
    facing: -1, direction: -1,
    mode: 'throw', modeTime: 0,
    throwsLeft: BOSS_TD.throwCount, throwTimer: BOSS_TD.startDelay,
    // Cú ném đang diễn { time, released } hoặc null.
    action: null
  };
}

// Tô Định đi bộ ở giai đoạn 3 (TT-BOSS-01 §3.7): boss 22x40, BOSS_TD.foot.hp máu (5 — team 27/09), không tấn
// công (`passive` — chạm vào không mất máu). Hành vi ở physics.js (updateFoot).
export function makeToDinhFoot(centerX) {
  const { w, h, hp } = BOSS_TD.foot;
  return {
    ...makeEnemy(centerX - w / 2, w, h, hp, true),
    art: 'bossFoot', kind: 'foot', passive: true, facing: -1,
    disarmed: false, fleeing: false, pendingPush: 0
  };
}

// Nội dung màn 3 "Trận Luy Lâu" (TT-BOSS-01 §3.1): đấu trường 1 chunk, cổng
// đóng, 2 cột đá. Không sách/hố/hazard/NPC. `options.layout === 'skills'` ->
// layout thử kỹ năng: bao cát + các nhóm lính sinh lần lượt (SKILL_TEST), không
// boss. Màn thường: chiến xa Tô Định (giai đoạn 1) -> 3 đợt thân binh (giai
// đoạn 2) -> giai đoạn 3 (Phase C). `battle` = tiến trình trận boss.
function level3Content(options) {
  const testSkills = options.layout === 'skills';
  const chariot = testSkills ? null : makeChariot();
  return {
    obstacles: ARENA.pillars.map(makePillar),
    hazards: [], holes: [], books: [], npcs: [],
    enemies: testSkills ? [makeDummy(SKILL_TEST.dummyX)] : [chariot],
    spawner: testSkills ? makeSpawner(SKILL_TEST.groups, SKILL_TEST.gap, true) : null,
    battle: testSkills ? null : {
      phase: 1, phaseTime: 0, chariot,
      // Tô Định đi bộ đứng sau xác xe (giai đoạn 2) — chỉ để vẽ.
      foot: null,
      // Đếm ngược tới lần được hiện lại gợi ý "Khiên quá dày!".
      hintTimer: 0,
      // Giai đoạn 3: Tô Định đánh được + hẹn giờ quân cảm tử.
      todinh: null,
      rusherTimer: 0,
      // Mưa tên trên thành: đếm ngược tới loạt kế tiếp.
      wallTimer: WALL_ARROWS.interval
    }
  };
}

// Trạng thái kỹ năng/buff của lượt chơi (chỉ màn đấu trường). `owned` = phần
// thưởng đã nhận ở màn 2 (tiến trình); không có thì kỹ năng đó không hoạt động.
function createSkillState(rewards) {
  const owned = new Set(rewards.filter(id => SKILLS[id]));
  return {
    owned,
    // Buff Ý chí kiên cường: calm = giây kể từ lần trúng đòn gần nhất.
    buff: { calm: 0, cooldown: 0 },
    arrowRain: { cooldown: 0 },
    // Bóng Trưng Nhị: active = giây hiệu lực còn lại; trail = vệt di chuyển
    // của người chơi (để bóng đi trễ); attack = cú chém đang diễn.
    shadow: { active: 0, cooldown: 0, trail: [], clock: 0, pose: null, attack: null, anim: createAnim('idle') }
  };
}

// State của 1 lượt chơi màn đang chọn (LEVEL, config.js). `options.score` =
// điểm mang sang từ màn trước; máu luôn đầy khi bắt đầu màn (DESIGN_BASELINE).
export function createLevelState(options = {}) {
  // Mặc định phẳng; level1Content/level2Content đặt địa hình của màn.
  setTerrain(null);
  const content = LEVEL.id === 3 ? level3Content(options)
    : LEVEL.id === 2 ? level2Content() : level1Content(options);
  return {
    running: false,
    paused: false,
    won: false,
    cameraX: 0,
    score: options.score ?? 0,
    health: 5,
    booksCollected: 0,
    // Mốc sự kiện 1 lần: màn 1 = nghỉ chân / cốt truyện chunk 10; màn 2 =
    // cốt truyện Thi Sách hy sinh.
    storyShown: false,
    // Câu hỏi chặn đường (màn 1–2, TT-QUIZ-01) — content ghi đè.
    quizzes: [],
    restUsed: false,
    finishX: LEVEL.finishX,
    // Màn đấu trường: kỹ năng/buff + mũi tên mưa đang rơi; cổng mở (cutscene).
    skills: LEVEL.arena ? createSkillState(options.rewards || []) : null,
    arrows: [],
    // Hũ dầu đang bay / đám lửa FX_OIL_FIRE (màn 3).
    jars: [],
    fires: [],
    // Mưa tên trên thành (đang báo/đang rơi) + cutscene kết chương (màn 3).
    wallArrows: [],
    cutscene: null,
    gateOpen: false,
    spawner: null,
    battle: null,
    player: {
      x: LEVEL.arena ? ARENA.playerStartX : 84,
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
      dashCooldown: 0,
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
