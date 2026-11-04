// Hằng số RIÊNG chương Triệu Việt Vương (chương 4) — không chứa logic. Hằng số
// chung mọi chương ở engine/config.js. Mọi toạ độ/kích thước/tốc độ là pixel logic.
//
// TQP-SKELETON (docs/SUTA_TQP_TASK_SKELETON_01.md): khung 3 màn chạy bằng asset
// MƯỢN — toàn bộ PLACEHOLDER, thay ở TQP-L1/L2/L3 khi có đợt Codex TQP_ART_01–03.
// Sprite + nền sông/Chu Diên/mỏm đá/nước của chương Lý Nam Đế (trỏ thẳng manifest
// chương 3, không chép ảnh); trời, tile, làng, bia câu hỏi của chương 1 và sách
// của chương 2 qua BORROWED_MAPS (như chương 3 đang mượn). Không import file nào
// của chương 1–3. Mọi số DESIGN_BASELINE.

import { CHUNK_W } from '../../engine/config.js';

// ---- Asset ----
// PLACEHOLDER — asset chương 3, thay ở TQP-L1 (images/trieu-quang-phuc/, manifest_tqp.json, maps_tqp.json).
export const SPRITE_ROOT = '/static/assets/images/ly-nam-de/sprites-32bit/';
export const SPRITE_MANIFEST_FILE = 'manifest_lnd.json';
export const MAP_ROOT = '/static/assets/images/ly-nam-de/maps-32bit/';
export const MAP_MANIFEST_FILE = 'maps_lnd.json';
// PLACEHOLDER — asset map chương 1–2 (engine assets.js addBorrowedMaps).
export const BORROWED_MAPS = [{
  root: '/static/assets/images/trung-trac/maps-32bit/',
  manifest: 'maps_tt.json',
  ids: ['BG_TT_SKY_DAY', 'BG_TT_MID_VILLAGE', 'TILESET_TT_GROUND', 'TILESET_TT_TERRAIN', 'PROP_TT_QUIZ_STELE']
}, {
  root: '/static/assets/images/ba-trieu/maps-32bit/',
  manifest: 'maps_bt.json',
  ids: ['ITEM_BT_TINH_HOA']
}];
// Mặt nước trong khe sông `'~'` — số như chương 3 (ảnh nước PROP_LND_RIVER_WATER).
export const TILES = {
  ground: 'TILESET_TT_GROUND', groundRegion: 'Z1', terrain: 'TILESET_TT_TERRAIN', water: 'PROP_LND_RIVER_WATER',
  waterLift: 6, waterDeep: '#56341f'
};
export const FAR_HILLS = { id: 'BG_LND_FAR_MIDLANDS', parallax: 0.2, bottomY: 230, hiddenUnderSky: [] };

// Ảnh DOM riêng chương (chân dung) — chưa có (TQP_ART_01–03).
export const PORTRAITS = [];

// Sprite canvas mỗi màn cần (chỉ nạp ảnh màn đang chơi dùng). PLACEHOLDER: lính
// tuần tiễu Lương chương 3. ITEM_LND_HEAL ở mọi màn: engine drawPickups tra ảnh
// bình máu mỗi frame kể cả khi chưa có bình nào.
export const LEVEL_SPRITES = {
  1: ['EN_LUONG_PATROL', 'TR_BAMBOO_NET', 'ITEM_LND_HEAL'],
  2: ['EN_LUONG_PATROL', 'TR_BAMBOO_NET', 'ITEM_LND_HEAL'],
  3: ['EN_LUONG_PATROL', 'ITEM_LND_HEAL']
};

// URL trang từng màn (route ở backend/routes/pages.py).
export const LEVEL_URLS = {
  1: '/gameplay/levels/trieu-quang-phuc',
  2: '/gameplay/levels/trieu-quang-phuc/2',
  3: '/gameplay/levels/trieu-quang-phuc/3'
};

// ---- Màn 1 "Tuổi trẻ rèn luyện" (khung) ----
// 6 chunk. Vùng cảnh tạm: làng (chương 1) -> sông (chương 3) -> sông nước Chu
// Diên (chương 3). Đích cuối màn, không cổng (cổng thật ở TQP-L1).
export const LEVEL1_CHUNKS = 6;
export const LEVEL1_ZONES = [
  { id: 'TQP1', x0: 0, x1: CHUNK_W * 2, sky: 'BG_TT_SKY_DAY', mid: 'BG_TT_MID_VILLAGE' },
  { id: 'TQP2', x0: CHUNK_W * 2, x1: CHUNK_W * 4, sky: 'BG_TT_SKY_DAY', mid: 'BG_LND_MID_RED_RIVER' },
  { id: 'TQP3', x0: CHUNK_W * 4, x1: CHUNK_W * LEVEL1_CHUNKS, sky: 'BG_TT_SKY_DAY', mid: 'BG_LND_MID_CHU_DIEN' }
];
export const LEVEL1_FINISH_X = CHUNK_W * LEVEL1_CHUNKS - 96;
// Chunk sông (lưới 48 cột × 16 px, như chương 3): khe 1 (local 224–336) nhảy
// qua, khe 2 (local 400–576) có mỏm đá `ledge` [localX trái, cao] ở giữa.
export const RIVER = {
  chunk: 3,
  rows: ['##############~~~~~~~####~~~~~~~~~~~############'],
  ledge: [456, 15]
};

// ---- Màn 2 "Hiền tài Dạ Trạch" (khung) ----
// 4 chunk nền phẳng: sông -> sông nước Chu Diên (tạm cho đầm Dạ Trạch).
export const LEVEL2_CHUNKS = 4;
export const LEVEL2_ZONES = [
  { id: 'TQP2', x0: 0, x1: CHUNK_W * 2, sky: 'BG_TT_SKY_DAY', mid: 'BG_LND_MID_RED_RIVER' },
  { id: 'TQP3', x0: CHUNK_W * 2, x1: CHUNK_W * LEVEL2_CHUNKS, sky: 'BG_TT_SKY_DAY', mid: 'BG_LND_MID_CHU_DIEN' }
];
export const LEVEL2_FINISH_X = CHUNK_W * LEVEL2_CHUNKS - 96;

// ---- Màn 3 "Đại phá Dương Sàn" (khung) ----
// Đấu trường 1 chunk, 3 đợt lính ra ở spawnX (engine makeSpawner). Nền sông nước
// Chu Diên tạm cho bãi lầy Dạ Trạch.
export const ARENA = { width: CHUNK_W, playerStartX: 170, spawnX: 700 };
export const LEVEL3_ZONES = [
  { id: 'TQP3', x0: 0, x1: ARENA.width, sky: 'BG_TT_SKY_DAY', mid: 'BG_LND_MID_CHU_DIEN' }
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
//   level1Spots  [chunk, localX] — chạm x này thì hỏi (theo thứ tự); không rơi
//                vào khe sông (chunk 3 local 224–576).
//   level2Spots  [chunk, localX] — câu hỏi về NPC sắp gặp (pool cùng tên, thứ
//                tự Triệu Túc -> Lý Nam Đế -> Chử Đồng Tử, TQP-00 §3.2).
export const QUIZ = {
  level1Count: 4,
  level1Spots: [[2, 312], [3, 680], [4, 560], [5, 560]],
  level2Spots: { trieuTuc: [1, 600], lyNamDe: [2, 600], chuDongTu: [3, 600] }
};

// ---- Môi trường ----
export const OBSTACLE_TYPES = {};
// Quyển Sách Tinh Hoa — PLACEHOLDER sprite chương 2 (strip 4 ô 16×16 logic).
export const ITEM = { sprite: 'ITEM_BT_TINH_HOA', fps: 8 };
export const QUIZ_STELE_ID = 'PROP_TT_QUIZ_STELE';
// Mỏm đá giữa sông (chương 3): bục một chiều 64 px, mặt trên ở hàng 0 của ảnh.
export const ROCK_LEDGE = { sprite: 'PROP_LND_ROCK_LEDGE', w: 64 };
export const MAP_PROPS_IN_GAME = [ITEM.sprite, QUIZ_STELE_ID, ROCK_LEDGE.sprite, TILES.water];

// ---- Quân địch, hazard, đạn ----
// PLACEHOLDER: lính tuần tiễu EN_LUONG_PATROL chương 3 — số đo hitbox/tầm kích
// chép từ ly-nam-de/config.js (22×34, kích 49 px ngoài mép, cao 10–18 px từ đỉnh).
export const SOLDIER = { w: 22, h: 34, hp: 2 };
export const GUARD = {
  patrolRange: 96, speed: 22, aggroRange: 130,
  attackReach: 49, attackBoxY: 10, attackBoxH: 9, attackCooldown: 1.6, damage: 1
};
export const ENEMY_SPRITES = {
  normal: {
    id: 'EN_LUONG_PATROL', behavior: 'guard', rules: GUARD,
    anims: { idle: 'idle', walk: 'walk', attack: 'attack_01', hurt: 'hurt', death: 'death' },
    attackMessage: 'Bạn bị lính Lương đâm kích trúng!', contactMessage: 'Bạn va phải lính Lương!',
    defeatMessage: 'Đã đánh bại lính Lương.'
  }
};
// Bẫy lưới trúc chương 3 (snare): treo `dropHeight`, công tắc ẩn `triggerWidth`.
export const NET = { dropHeight: 90, triggerWidth: 24 };
export const HAZARD_SPRITES = {
  // PLACEHOLDER — thay bằng bẫy chông ẩn của chương ở TQP-L1.
  netTrap: {
    id: 'TR_BAMBOO_NET', w: 40, h: 12, warnTime: .35, fallSpeed: 300, stun: 1,
    anims: { idle: 'idle', warn: 'warn', fall: 'fall', landed: 'landed' },
    springMessage: 'Lưới trúc rung trên đầu!', hitMessage: 'Bạn bị lưới trúc chụp trúng!'
  }
};
export const PROJECTILE_SPRITES = {};
// NPC (Triệu Quang Phục dẫn màn 1, 3 NPC màn 2) — chưa có (TQP-L1/L2).
export const NPC_SPRITES = {};
// Bình hồi máu (chương 3) — chưa có quân nào rơi (hook dropHeal ở TQP-L3).
export const PICKUPS = { heal: { id: 'ITEM_LND_HEAL', anim: 'idle' } };

// ---- Phần thưởng màn 2 (id khớp seed backend/migrations/008_trieu_quang_phuc.sql) ----
// Tên theo docs/SUTA_TQP_TASK_00.md §3.4 (duyệt 04/11/2026); cơ chế ở TQP-L3.
export const REWARD_NAMES = {
  BUFF_TQP_VITALITY: 'Thể lực cường tráng',
  SK_TQP_RALLY: 'Hiệu triệu Vạn Xuân',
  SK_TQP_DRAGON_CLAW: 'Móng Rồng'
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
