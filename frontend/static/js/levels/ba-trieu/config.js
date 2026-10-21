// Hằng số RIÊNG chương Bà Triệu (chương 2) — không chứa logic. Hằng số chung
// mọi chương ở engine/config.js. Mọi toạ độ/kích thước/tốc độ là pixel logic.
//
// Asset riêng chương: đợt Codex BT_ART_01 (docs/CODEX_PROMPT_BT_ART_01.md) và
// BT_ART_02 (docs/CODEX_PROMPT_BT_ART_02.md, nhập 21/10/2026 — lính Ngô + Bà Triệu
// vẽ lại theo chuẩn cao 34 px logic; NPC/FX/icon màn 2 chờ BT-L2). Trời, tile mặt đất/địa hình,
// lớp giữa làng, bia câu hỏi, 2 vật cản MƯỢN của chương Trưng Trắc qua
// BORROWED_MAPS (prompt: "dùng lại, không vẽ"). Không import file nào của chương
// 1. Màn 1 = bố cục thật BT-L1 (docs/SUTA_BT_TASK_L1_01.md); màn 2–3 còn khung
// BT-SKELETON. Mọi số DESIGN_BASELINE.

import { CHUNK_W } from '../../engine/config.js';

// ---- Asset ----
// Manifest là nguồn duy nhất cho frames/fps/loop/hit_frame (density 4,
// pivot bottom-center, quay phải) — không chép số đó vào đây.
export const SPRITE_ROOT = '/static/assets/images/ba-trieu/sprites-32bit/';
export const SPRITE_MANIFEST_FILE = 'manifest_bt.json';
export const MAP_ROOT = '/static/assets/images/ba-trieu/maps-32bit/';
export const MAP_MANIFEST_FILE = 'maps_bt.json';
// Asset map mượn của chương Trưng Trắc (engine assets.js addBorrowedMaps).
export const BORROWED_MAPS = [{
  root: '/static/assets/images/trung-trac/maps-32bit/',
  manifest: 'maps_tt.json',
  ids: [
    'BG_TT_SKY_DAY', 'BG_TT_MID_VILLAGE', 'TILESET_TT_GROUND', 'TILESET_TT_TERRAIN',
    'PROP_TT_QUIZ_STELE', 'OBS_FALLEN_BRANCH', 'OBS_STONE_BLOCK'
  ]
}];
export const TILES = { ground: 'TILESET_TT_GROUND', groundRegion: 'Z1', terrain: 'TILESET_TT_TERRAIN' };
export const FAR_HILLS = { id: 'BG_BT_FAR_NUA', parallax: 0.2, bottomY: 230, hiddenUnderSky: [] };

// Chân dung (ảnh DOM) — nạp ở mọi màn: Bà Triệu (dẫn màn 1) + 3 NPC màn 2.
export const PORTRAITS = ['PORTRAIT_BA_TRIEU', 'PORTRAIT_TRIEU_QUOC_DAT', 'PORTRAIT_LY_HOANG', 'PORTRAIT_BACH_TUONG'];

// Sprite canvas mỗi màn cần (chỉ nạp ảnh màn đang chơi dùng). Màn 1 gồm cả
// layout thử ?layout=engine; PLAYER_BA_TRIEU = Bà Triệu đứng chờ (NPC dẫn).
export const LEVEL_SPRITES = {
  1: [
    'PLAYER_BA_TRIEU', 'EN_NGO_LUMBERJACK', 'EN_NGO_HUNTER', 'PJ_CROSSBOW_BOLT', 'OB_BOULDER', 'EN_WILD_ELEPHANT',
    'TR_BAMBOO_SPIKE_PIT', 'EN_NGO_CAVALRY', 'FX_MIASMA', 'EN_NGO_TAX_OFFICIAL', 'PJ_SILVER_CHEST'
  ],
  2: ['EN_NGO_LUMBERJACK', 'TR_BAMBOO_SPIKE_PIT'],
  3: ['EN_NGO_LUMBERJACK']
};

// URL trang từng màn (route ở backend/routes/pages.py).
export const LEVEL_URLS = {
  1: '/gameplay/levels/ba-trieu',
  2: '/gameplay/levels/ba-trieu/2',
  3: '/gameplay/levels/ba-trieu/3'
};

// ---- Màn 1 "Rừng núi Nưa" (BT-L1) ----
// 12 chunk = 9216 px = stage_length của maps_bt.json. Vùng cảnh: làng Quan Yên
// (nền làng mượn chương 1) -> rừng nứa -> rừng thiêng -> sườn núi đá -> rừng
// nứa -> doanh trại núi Nưa (cổng trại = đích). Nhóm chướng ngại xáo trong vùng
// được phép (level1.js) để đúng cảnh.
export const LEVEL1_CHUNKS = 12;
export const LEVEL1_ZONES = [
  { id: 'BT1', x0: 0, x1: CHUNK_W, sky: 'BG_TT_SKY_DAY', mid: 'BG_TT_MID_VILLAGE' },
  { id: 'BT2', x0: CHUNK_W, x1: CHUNK_W * 3, sky: 'BG_TT_SKY_DAY', mid: 'BG_BT_MID_NUA_FOREST' },
  { id: 'BT3', x0: CHUNK_W * 3, x1: CHUNK_W * 5, sky: 'BG_TT_SKY_DAY', mid: 'BG_BT_MID_SACRED_FOREST' },
  { id: 'BT4', x0: CHUNK_W * 5, x1: CHUNK_W * 8, sky: 'BG_TT_SKY_DAY', mid: 'BG_BT_MID_ROCKY_SLOPE' },
  { id: 'BT2', x0: CHUNK_W * 8, x1: CHUNK_W * 10, sky: 'BG_TT_SKY_DAY', mid: 'BG_BT_MID_NUA_FOREST' },
  { id: 'BT5', x0: CHUNK_W * 10, x1: CHUNK_W * LEVEL1_CHUNKS, sky: 'BG_TT_SKY_DAY', mid: 'BG_BT_MID_CAMP' }
];
// Đích = worldX(12, 618) như chương 1; cổng trại đặt TÂM tại đây (192px ->
// trải 8970–9162 < 9216), không hitbox; mở khi đủ sách + hạ mini-boss.
export const LEVEL1_FINISH_X = CHUNK_W * 11 + 618;
export const FINISH_GATE = { closed: 'PROP_BT_CAMP_GATE', open: 'PROP_BT_CAMP_GATE_OPEN', worldX: LEVEL1_FINISH_X };
// Bà Triệu đứng chờ ở chunk 1 (NPC dẫn — như Trưng Trắc chương 1).
export const GUIDE_LOCAL_X = 190;
// Mini-boss tham quan thu thuế (patrol, như kiệu quan chương 1 — Q4: 6 đòn):
// cố định chunk 11, đi tuần patrolRange quanh localX, vào fireRange thì dừng
// ném hòm bạc rỗng; fireInterval tính từ lúc ném xong.
export const MINIBOSS = {
  chunk: 11, localX: 510, hp: 6, patrolRange: 160, speed: 30,
  fireRange: 240, fireInterval: 2.5, hitScore: 100, defeatScore: 700
};
// Hố chông tre cố định chunk 11 (ngoài 10 nhóm xáo) — đủ 12 chướng ngại.
export const FIXED_PIT = { chunk: 11, localX: 220 };
// Nghỉ chân hồi 1 máu (Q2) — 1 lần khi vượt điểm này.
export const REST = { chunk: 9, localX: 282 };
// 5 Quyển Sách Tinh Hoa cố định: [chunk, localX, độ cao trên mặt đất].
export const LEVEL1_ITEMS = [[2, 390, 56], [4, 640, 60], [6, 300, 64], [7, 600, 72], [9, 420, 60]];

// ---- Màn 2 "Chiêu mộ hiền tài" (PLACEHOLDER cảnh: chờ nền Bồ Điền ở BT_ART_02) ----
export const LEVEL2_CHUNKS = 4;
export const LEVEL2_ZONES = [
  { id: 'BT2', x0: 0, x1: CHUNK_W * 2, sky: 'BG_TT_SKY_DAY', mid: 'BG_BT_MID_NUA_FOREST' },
  { id: 'BT3', x0: CHUNK_W * 2, x1: CHUNK_W * 3, sky: 'BG_TT_SKY_DAY', mid: 'BG_BT_MID_SACRED_FOREST' },
  { id: 'BT5', x0: CHUNK_W * 3, x1: CHUNK_W * LEVEL2_CHUNKS, sky: 'BG_TT_SKY_DAY', mid: 'BG_BT_MID_CAMP' }
];
export const LEVEL2_FINISH_X = CHUNK_W * LEVEL2_CHUNKS - 96;

// ---- Màn 3 "Chiến lũy Bồ Điền" (PLACEHOLDER: đấu trường trại, chưa có boss — BT_ART_03) ----
// Đấu trường 1 chunk, tường vô hình 2 đầu. Quân ra ở spawnX; hết đợt cuối +
// hết quân thì thắng chương (level3.js).
export const ARENA = { width: CHUNK_W, playerStartX: 170, spawnX: 700 };
export const LEVEL3_ZONES = [
  { id: 'BT5', x0: 0, x1: ARENA.width, sky: 'BG_TT_SKY_DAY', mid: 'BG_BT_MID_CAMP' }
];
// 3 đợt lính; đợt sau = đợt trước chết hết + gap giây (engine makeSpawner).
export const WAVES = {
  gap: 1.5,
  groups: [
    [{ type: 'guard', at: 0, dx: 0 }],
    [{ type: 'guard', at: 0, dx: 0 }, { type: 'guard', at: 0, dx: -40 }],
    [{ type: 'guard', at: 0, dx: 0 }, { type: 'guard', at: 0, dx: -40 }, { type: 'guard', at: .8, dx: 0 }]
  ]
};

// Câu hỏi chặn đường (điểm + luật ở engine):
//   level1Count  số câu mỗi lượt màn 1 (rút ngẫu nhiên, không trùng).
//   level1Spots  [chunk, localX] — chạm x này thì hỏi (theo thứ tự).
//   level2Spots  [chunk, localX] — 3 câu màn 2, lần lượt từ pool quocDat, hoLy,
//                bachTuong (chưa có NPC — gắn NPC ở BT-L2).
export const QUIZ = {
  level1Count: 4,
  level1Spots: [[3, 312], [5, 640], [8, 312], [10, 560]],
  level2Spots: { quocDat: [1, 600], hoLy: [2, 600], bachTuong: [3, 600] }
};

// ---- Môi trường ----
// Vật cản tĩnh (mượn maps_tt.json). Cách neo: rule trung-trac-gameplay.md.
export const OBSTACLE_TYPES = {
  fallenBranch: { id: 'OBS_FALLEN_BRANCH', anchor: 'bottom', groundSink: 4 },
  stoneBlock: { id: 'OBS_STONE_BLOCK', anchor: 'bottom', groundSink: 4 }
};
// Bục cành cây (makePlatform `sprite`): ảnh 64×16 / 128×16 logic, mặt trên ở
// hàng 0, thân cành từ visible_bbox.x — bề ngang bục = visible_bbox.w (60 / 120).
export const BRANCH = { short: { sprite: 'PROP_BT_BRANCH', w: 60 }, long: { sprite: 'PROP_BT_BRANCH_LONG', w: 120 } };
// Quyển Sách Tinh Hoa: strip 4 ô 16×16 logic.
export const ITEM = { sprite: 'ITEM_BT_TINH_HOA', fps: 8 };
export const QUIZ_STELE_ID = 'PROP_TT_QUIZ_STELE';
export const MAP_PROPS_IN_GAME = [
  ...Object.values(OBSTACLE_TYPES).map(type => type.id), ITEM.sprite, QUIZ_STELE_ID,
  FINISH_GATE.closed, FINISH_GATE.open, BRANCH.short.sprite, BRANCH.long.sprite
];

// ---- Quân địch, hazard, đạn ----
// Hitbox (w, h) tính từ pivot bottom-center, đo từ strip BT_ART_02 (lính Ngô vẽ
// lại ×1,097 theo chuẩn cao 34 px logic, px logic) — KHÔNG lấy từ cỡ ảnh. DESIGN_BASELINE.
// Lính đốn gỗ EN_NGO_LUMBERJACK (hành vi `guard` của engine): thân cao ~34 px
// logic (kể cả mũ) -> hitbox 24×34 (LUMBERJACK — nội dung màn dùng). Rìu ở ô hit 7
// (10@10): đầu rìu cách tâm 24,5 px (12,5 px ngoài mép hitbox), cao 0–12 px
// trên mặt chân = 22–34 px từ đỉnh hitbox. Vung chậm, sát thương 2 (BT-00
// §3.1); nghỉ 1,8 s giữa 2 nhát.
export const LUMBERJACK = { w: 24, h: 34, hp: 2 };
export const GUARD = {
  patrolRange: 96, speed: 20, aggroRange: 110,
  attackReach: 14, attackBoxY: 22, attackBoxH: 12, attackCooldown: 1.8, damage: 2
};
export const ENEMY_SPRITES = {
  normal: {
    id: 'EN_NGO_LUMBERJACK', behavior: 'guard', rules: GUARD,
    anims: { idle: 'idle', walk: 'walk', attack: 'attack_01', hurt: 'hurt', death: 'death' },
    attackMessage: 'Bạn bị lính đốn gỗ bổ rìu trúng!', contactMessage: 'Bạn va phải lính Ngô!',
    defeatMessage: 'Đã đánh bại lính đốn gỗ.'
  }
};
export const HAZARD_SPRITES = {
  // Hố chông tre (trap): như chông sắt chương 1, chìm 3 px vào cỏ.
  bambooPit: {
    id: 'TR_BAMBOO_SPIKE_PIT', w: 36, h: 6, sink: 3, anims: { idle: 'hidden', sprung: 'reveal' },
    springMessage: 'Bẫy chông tre bật lên!', sprungMessage: 'Bạn giẫm phải chông tre!'
  },
  // Voi rừng chưa thuần (roller, không giết được): thân thấy được rộng ~96,
  // cao ~52 px logic; lưng cao 48–50 px -> bục `ride` (mặt bục cách đỉnh hitbox
  // `top`, hụt mỗi bên `inset`). Va ngang mất máu, nhảy lên lưng được chở theo.
  wildElephant: {
    id: 'EN_WILD_ELEPHANT', w: 84, h: 52, anims: { move: 'walk', idle: 'idle' }, ride: { top: 3, inset: 12 },
    hitMessage: 'Voi rừng húc trúng bạn! Hãy nhảy lên lưng voi.'
  },
  // Đá tảng lăn (roller có máu — chém vỡ được, hoặc nhảy qua): đá thấy được ~20 px.
  boulder: {
    id: 'OB_BOULDER', w: 18, h: 18, anims: { move: 'roll', idle: 'roll', death: 'break' },
    hitMessage: 'Bạn bị đá tảng lăn trúng!', breakMessage: 'Đá tảng vỡ tan!'
  },
  // Chướng khí rừng thiêng (vent): khe đất rộng 42 px, cột khí cao 44 px logic <
  // chân người chơi đứng trên cành 60 px -> trên cành an toàn. Chu kỳ
  // off/warn/active (giây); lướt KHÔNG né được (ignoreDash — BT-ENGINE Q4).
  miasma: {
    id: 'FX_MIASMA', w: 40, h: 44, anims: { idle: 'idle', warn: 'warn', active: 'active' },
    cycle: { off: 1.6, warn: .6, active: 1.2 }, ignoreDash: true,
    hitMessage: 'Bạn hít phải chướng khí! Hãy leo lên cành cây.'
  },
  // Thợ săn nấp trong bụi (thrower): bụi + người cao ~20 px; đầu nỏ ô hit 5
  // cao ~20 px, cách tâm ~12,5 px (report Codex Gate B1 bản sửa 1).
  ngoHunter: {
    id: 'EN_NGO_HUNTER', w: 26, h: 20, muzzle: 20, muzzleX: 13,
    anims: { idle: 'idle', throw: 'throw', hurt: 'hurt', death: 'death' },
    hitMessage: 'Bạn va phải thợ săn quan lại!', breakMessage: 'Đã hạ thợ săn quan lại!'
  },
  // Kỵ binh Ngô (roller): ngựa + người thấy được ~82×37,5 px.
  ngoCavalry: {
    id: 'EN_NGO_CAVALRY', w: 61, h: 37, anims: { move: 'gallop', idle: 'gallop', hurt: 'hurt', death: 'death' },
    hitMessage: 'Kỵ binh Ngô xông tới đâm trúng bạn!', breakMessage: 'Đã hạ kỵ binh Ngô!'
  },
  // Mini-boss tham quan thu thuế (patrol): thân ~40×44 px; hòm rời tay ô hit 4,
  // cao 31 px, cách tâm 22 px.
  ngoTaxOfficial: {
    id: 'EN_NGO_TAX_OFFICIAL', w: 30, h: 44, muzzle: 31, muzzleX: 22,
    anims: { move: 'walk', idle: 'idle', throw: 'throw', hurt: 'hurt', death: 'death' },
    breakMessage: 'Đã hạ tham quan thu thuế!'
  }
};

// Layout thử `?layout=engine` (màn 1 — BT-ENGINE B): bục, bục trên hố, cành
// cây trên chướng khí, voi rừng, đá lăn. Độ cao bục tính từ mặt đất (px).
// Bục = [chunk, localX, cao, loại cành BRANCH]; 3 cành dài nối nhau phủ 3 miệng khí.
export const ENGINE_TEST = {
  stairs: [[1, 260, 40, 'short'], [1, 380, 72, 'short']],
  // Hố chunk 2: cột 20–25 (x local 320–416); bục bắc ngang trên hố.
  holeRow: '####################......######################',
  holeChunk: 2,
  overHole: [2, 338, 36, 'short'],
  branches: [[3, 150, 60, 'long'], [3, 270, 60, 'long'], [3, 390, 60, 'long']],
  vents: [[3, 200, 0], [3, 310, .8], [3, 420, 1.6]],
  elephant: { chunk: 4, localX: 700, speed: -60, triggerLocalX: 150 },
  boulder: { chunk: 5, localX: 700, speed: -120, triggerLocalX: 200, hp: 2 }
};
// Đạn (bay ngang, strip quay PHẢI): hitbox nhỏ hơn hình.
export const PROJECTILE_SPRITES = {
  crossbowBolt: { id: 'PJ_CROSSBOW_BOLT', anim: 'idle', w: 12, h: 3 },
  silverChest: { id: 'PJ_SILVER_CHEST', anim: 'loop', w: 10, h: 10 }
};
// NPC: Bà Triệu dẫn màn 1; 3 NPC màn 2 (BT_ART_02) khai báo sẵn — đặt vào màn ở
// BT-L2 (khi đó thêm ID vào LEVEL_SPRITES[2]). NPC_HO_LY: 3 người trong 1 ô
// 112×48, chỉ Lý Hoằng (giữa) nói. NPC_BACH_TUONG ô 128×96: `bow` (không lặp)
// sau khi trả lời đúng, `charge` dùng cho kỹ năng Gọi Bạch Tượng (BT-L3).
export const NPC_SPRITES = {
  baTrieu: { id: 'PLAYER_BA_TRIEU', portrait: 'PORTRAIT_BA_TRIEU', anims: { idle: 'idle', talk: 'talk' } },
  quocDat: { id: 'NPC_TRIEU_QUOC_DAT', portrait: 'PORTRAIT_TRIEU_QUOC_DAT', anims: { idle: 'idle', talk: 'talk' } },
  hoLy: { id: 'NPC_HO_LY', portrait: 'PORTRAIT_LY_HOANG', anims: { idle: 'idle', talk: 'talk' } },
  bachTuong: { id: 'NPC_BACH_TUONG', portrait: 'PORTRAIT_BACH_TUONG', anims: { idle: 'idle', talk: 'talk', bow: 'bow' } }
};

// ---- Phần thưởng màn 2 (id khớp seed backend/migrations/005_ba_trieu.sql) ----
// Tên theo docs/SUTA_BT_TASK_00.md §3.4; cơ chế làm ở BT-L2/BT-L3.
export const REWARD_NAMES = {
  BUFF_BT_CRIT: 'Chí mạng',
  SK_BT_RATTAN_SHIELD: 'Khiên mây tre',
  SK_BT_WHITE_ELEPHANT: 'Gọi Bạch Tượng'
};

// ---- Câu chữ thông báo dùng trong engine (CHAPTER.text) ----
export const TEXT = {
  obstacleHit: 'Hãy nhảy hoặc lướt qua chướng ngại vật.',
  trapHit: 'Bạn va vào bẫy!',
  fell: 'Bạn rơi xuống hố và mất 1 máu.',
  hazardHit: 'Bạn va phải quân Ngô!',
  hazardDefeated: 'Đã hạ chướng ngại vật!',
  projectileHit: 'Bạn trúng đạn của quân Ngô!',
  bossContact: 'Quân Ngô phản công!',
  bossDefeated: 'Đã đánh bại quân Ngô!',
  bossBlocksFinish: 'Hãy hạ tên tham quan thu thuế trước khi vào doanh trại.',
  itemPicked: (count, total) => `Đã thu thập Quyển Sách Tinh Hoa ${count}/${total}`,
  itemsMissing: count => `Bạn còn thiếu ${count} Quyển Sách Tinh Hoa.`,
  rescueHint: name => `Hãy hạ quân Ngô đang vây ${name}!`
};
