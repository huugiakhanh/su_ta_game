// Màn 2 "Chiêu mộ hiền tài" (TT-NPC-01 §3.2; tăng độ khó TT-L2-HARD 29/09 —
// quân Hán chặn đường + giải cứu NPC + địa hình khó, khó hơn màn 1; kéo dài 9
// chunk + câu hỏi chặn đường trước mỗi NPC TT-QUIZ-01 29/09). Vị trí CỐ ĐỊNH,
// không xáo; DESIGN_BASELINE. Chỉ dùng quân/bẫy/vật cản đã có ở màn 1 và layout
// thử P2 (không asset mới). Gặp/giải cứu NPC là cơ chế chung của engine.

import { CHUNK_W } from '../../engine/config.js';
import { worldX, makeObstacle, makeHazard, setTerrain, buildTerrain, terrainHoles } from '../../engine/geometry.js';
import {
  makeEnemy, makeNpc, makeCaptors, makeQuiz, pick, keepValidBridges, checkTerrainFootprints, checkNpcClearance
} from '../../engine/entities.js';
import { state } from '../../engine/state.js';
import { openStory } from '../../engine/dialogue.js';
import { LEVEL } from '../../engine/chapter.js';
import { QUIZ } from './config.js';
import { NPC_QUESTION_POOLS } from './questions-data.js';
import { STORY_THI_SACH } from './dialogue-data.js';

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

export function level2Content() {
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
  const content = { obstacles: keepValidBridges(obstacles, holes), hazards, holes, items: [], enemies, npcs, quizzes };
  checkNpcClearance(content);
  checkTerrainFootprints(content);
  return content;
}

// Cốt truyện Thi Sách hy sinh hiện 1 lần khi vào chunk ngay sau chunk của
// Thi Sách, sau khi đã gặp Thi Sách (engine gọi khi không có hội thoại mở).
export function level2Events(p) {
  const thiSach = state.npcs.find(item => item.id === 'thiSach');
  const storyX = (Math.floor(thiSach?.centerX / CHUNK_W) + 1) * CHUNK_W;
  if (!state.storyShown && thiSach?.met && p.x >= storyX) {
    state.storyShown = true;
    openStory(STORY_THI_SACH);
  }
}
