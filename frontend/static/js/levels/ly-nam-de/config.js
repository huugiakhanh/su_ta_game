// Hằng số RIÊNG chương Lý Nam Đế (chương 3) — không chứa logic. Hằng số chung
// mọi chương ở engine/config.js. Mọi toạ độ/kích thước/tốc độ là pixel logic.
//
// LND-SKELETON (docs/SUTA_LND_TASK_SKELETON_01.md): khung 3 màn chạy bằng asset
// MƯỢN — toàn bộ PLACEHOLDER, thay ở LND-L1/L2/L3 khi có đợt Codex LND_ART_01–03.
// Sprite + nền/sách của chương Bà Triệu (trỏ thẳng manifest chương 2, không chép
// ảnh); trời, tile, bia câu hỏi, 2 vật cản của chương Trưng Trắc qua
// BORROWED_MAPS (như chương 2 đang mượn). Không import file nào của chương 1–2.
// Mọi số DESIGN_BASELINE.

import { CHUNK_W } from '../../engine/config.js';

// ---- Asset ----
// PLACEHOLDER — asset chương 2, thay ở LND-L1 (images/ly-nam-de/, manifest_lnd.json, maps_lnd.json).
export const SPRITE_ROOT = '/static/assets/images/ba-trieu/sprites-32bit/';
export const SPRITE_MANIFEST_FILE = 'manifest_bt.json';
export const MAP_ROOT = '/static/assets/images/ba-trieu/maps-32bit/';
export const MAP_MANIFEST_FILE = 'maps_bt.json';
// PLACEHOLDER — asset map chương 1 (engine assets.js addBorrowedMaps).
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

// Ảnh DOM riêng chương (chân dung) — chưa có (LND_ART_01–02).
export const PORTRAITS = [];

// Sprite canvas mỗi màn cần (chỉ nạp ảnh màn đang chơi dùng). PLACEHOLDER: lính
// Ngô thường làm lính Lương tạm.
export const LEVEL_SPRITES = {
  1: ['EN_NGO_SOLDIER', 'TR_BAMBOO_SPIKE_PIT', 'OB_BOULDER'],
  2: ['EN_NGO_SOLDIER', 'TR_BAMBOO_SPIKE_PIT'],
  3: ['EN_NGO_SOLDIER']
};

// URL trang từng màn (route ở backend/routes/pages.py).
export const LEVEL_URLS = {
  1: '/gameplay/levels/ly-nam-de',
  2: '/gameplay/levels/ly-nam-de/2',
  3: '/gameplay/levels/ly-nam-de/3'
};

// ---- Màn 1 "Từ quan chiêu binh" (khung) ----
// 6 chunk nền phẳng. Vùng cảnh tạm (chương 1–2): làng -> rừng -> sườn đá. Đích
// cuối màn, không cổng (cổng/trạm thật ở LND-L1).
export const LEVEL1_CHUNKS = 6;
export const LEVEL1_ZONES = [
  { id: 'LND1', x0: 0, x1: CHUNK_W * 2, sky: 'BG_TT_SKY_DAY', mid: 'BG_TT_MID_VILLAGE' },
  { id: 'LND2', x0: CHUNK_W * 2, x1: CHUNK_W * 4, sky: 'BG_TT_SKY_DAY', mid: 'BG_BT_MID_NUA_FOREST' },
  { id: 'LND3', x0: CHUNK_W * 4, x1: CHUNK_W * LEVEL1_CHUNKS, sky: 'BG_TT_SKY_DAY', mid: 'BG_BT_MID_ROCKY_SLOPE' }
];
export const LEVEL1_FINISH_X = CHUNK_W * LEVEL1_CHUNKS - 96;

// ---- Màn 2 "Chiêu mộ hiền tài" (khung) ----
// 4 chunk, chuyển dần sang đầm lầy (tạm cho vùng sông nước Chu Diên).
export const LEVEL2_CHUNKS = 4;
export const LEVEL2_ZONES = [
  { id: 'LND2', x0: 0, x1: CHUNK_W * 2, sky: 'BG_TT_SKY_DAY', mid: 'BG_BT_MID_NUA_FOREST' },
  { id: 'LND4', x0: CHUNK_W * 2, x1: CHUNK_W * LEVEL2_CHUNKS, sky: 'BG_TT_SKY_DAY', mid: 'BG_BT_MID_MARSH' }
];
export const LEVEL2_FINISH_X = CHUNK_W * LEVEL2_CHUNKS - 96;

// ---- Màn 3 "Công phá thành Long Biên" (khung) ----
// Đấu trường 1 chunk, 3 đợt lính ra ở spawnX (engine makeSpawner). Nền doanh trại
// tạm cho tường thành Long Biên.
export const ARENA = { width: CHUNK_W, playerStartX: 170, spawnX: 700 };
export const LEVEL3_ZONES = [
  { id: 'LND5', x0: 0, x1: ARENA.width, sky: 'BG_TT_SKY_DAY', mid: 'BG_BT_MID_CAMP' }
];
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
//   level2Spots  [chunk, localX] — câu hỏi về NPC sắp gặp (pool cùng tên,
//                thứ tự Phạm Tu -> Tinh Thiều -> Triệu Túc, LND-00 §3.2).
export const QUIZ = {
  level1Count: 4,
  level1Spots: [[2, 312], [3, 560], [4, 560], [5, 560]],
  level2Spots: { phamTu: [1, 600], tinhThieu: [2, 600], trieuTuc: [3, 600] }
};

// ---- Môi trường ----
// Vật cản tĩnh (mượn maps_tt.json). Cách neo: rule trung-trac-gameplay.md.
export const OBSTACLE_TYPES = {
  fallenBranch: { id: 'OBS_FALLEN_BRANCH', anchor: 'bottom', groundSink: 4 },
  stoneBlock: { id: 'OBS_STONE_BLOCK', anchor: 'bottom', groundSink: 4 }
};
// Quyển Sách Tinh Hoa — PLACEHOLDER sprite chương 2 (strip 4 ô 16×16 logic).
export const ITEM = { sprite: 'ITEM_BT_TINH_HOA', fps: 8 };
export const QUIZ_STELE_ID = 'PROP_TT_QUIZ_STELE';
export const MAP_PROPS_IN_GAME = [...Object.values(OBSTACLE_TYPES).map(type => type.id), ITEM.sprite, QUIZ_STELE_ID];

// ---- Quân địch, hazard, đạn ----
// PLACEHOLDER: lính Ngô thường EN_NGO_SOLDIER làm lính Lương (hitbox + tầm kích đo
// ở chương 2: 22×34, kích 49 px ngoài mép, cao 10–18 px từ đỉnh hitbox).
export const SOLDIER = { w: 22, h: 34, hp: 2 };
export const GUARD = {
  patrolRange: 96, speed: 22, aggroRange: 130,
  attackReach: 49, attackBoxY: 10, attackBoxH: 9, attackCooldown: 1.6, damage: 1
};
export const ENEMY_SPRITES = {
  normal: {
    id: 'EN_NGO_SOLDIER', behavior: 'guard', rules: GUARD,
    anims: { idle: 'idle', walk: 'walk', attack: 'attack_01', hurt: 'hurt', death: 'death' },
    attackMessage: 'Bạn bị lính Lương đâm trúng!', contactMessage: 'Bạn va phải lính Lương!',
    defeatMessage: 'Đã đánh bại lính Lương.'
  }
};
export const HAZARD_SPRITES = {
  // PLACEHOLDER hố chông tre chương 2 (cho bẫy lưới trúc — LND-ENGINE).
  bambooPit: {
    id: 'TR_BAMBOO_SPIKE_PIT', w: 36, h: 6, sink: 3, anims: { idle: 'hidden', sprung: 'reveal' },
    springMessage: 'Bẫy chông bật lên!', sprungMessage: 'Bạn giẫm phải bẫy chông!'
  },
  // Đá lở vùng đồi núi (roller có máu — chém vỡ được, hoặc nhảy qua).
  boulder: {
    id: 'OB_BOULDER', w: 18, h: 18, anims: { move: 'roll', idle: 'roll', death: 'break' },
    hitMessage: 'Bạn bị đá lở lăn trúng!', breakMessage: 'Đá tảng vỡ tan!'
  }
};
export const PROJECTILE_SPRITES = {};
// NPC (Lý Bí dẫn màn 1, 3 NPC màn 2) — chưa có (LND-L1/L2).
export const NPC_SPRITES = {};

// ---- Phần thưởng màn 2 (id khớp seed backend/migrations/007_ly_nam_de.sql) ----
// Tên theo docs/SUTA_LND_TASK_00.md §3.4 (duyệt 31/10/2026); cơ chế ở LND-L3.
export const REWARD_NAMES = {
  SK_LND_TO_LICH_SHIELD: 'Khiên Tô Lịch',
  BUFF_LND_SUPPLY: 'Lương thảo dồi dào',
  SK_LND_TIDE: 'Triều Cường'
};

// ---- Câu chữ thông báo dùng trong engine (CHAPTER.text) ----
export const TEXT = {
  obstacleHit: 'Hãy nhảy hoặc lướt qua chướng ngại vật.',
  trapHit: 'Bạn va vào bẫy!',
  fell: 'Bạn rơi xuống hố và mất 1 máu.',
  hazardHit: 'Bạn va phải quân Lương!',
  hazardDefeated: 'Đã hạ chướng ngại vật!',
  projectileHit: 'Bạn trúng đạn của quân Lương!',
  bossContact: 'Quân Lương phản công!',
  bossDefeated: 'Đã đánh bại quân Lương!',
  bossBlocksFinish: 'Hãy hạ quân Lương chặn đường trước.',
  itemPicked: (count, total) => `Đã thu thập Quyển Sách Tinh Hoa ${count}/${total}`,
  itemsMissing: count => `Bạn còn thiếu ${count} Quyển Sách Tinh Hoa.`,
  rescueHint: name => `Hãy hạ quân Lương đang vây ${name}!`
};
