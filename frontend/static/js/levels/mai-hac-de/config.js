// Hằng số RIÊNG chương Mai Hắc Đế (chương 5) — không chứa logic. Hằng số chung
// mọi chương ở engine/config.js. Mọi toạ độ/kích thước/tốc độ là pixel logic.
//
// MHD-SKELETON (docs/SUTA_MHD_TASK_SKELETON_01.md): khung 3 màn chạy bằng asset
// MƯỢN — toàn bộ PLACEHOLDER, thay ở MHD-L1/L2/L3 khi có đợt Codex MHD_ART_01–03.
// Sprite + nền bãi tập của chương Triệu Việt Vương (trỏ thẳng manifest chương 4,
// không chép ảnh); trời, tile, làng, bia câu hỏi của chương 1, sách của chương 2,
// nền Chu Diên + đồi xa của chương 3 qua BORROWED_MAPS. Không import file nào của
// chương 1–4. Mọi số DESIGN_BASELINE.

import { CHUNK_W } from '../../engine/config.js';

// ---- Asset ----
// PLACEHOLDER — asset chương 4, thay ở MHD-L1 (images/mai-hac-de/, manifest_mhd.json, maps_mhd.json).
export const SPRITE_ROOT = '/static/assets/images/trieu-quang-phuc/sprites-32bit/';
export const SPRITE_MANIFEST_FILE = 'manifest_tqp.json';
export const MAP_ROOT = '/static/assets/images/trieu-quang-phuc/maps-32bit/';
export const MAP_MANIFEST_FILE = 'maps_tqp.json';
// PLACEHOLDER — asset map chương 1–3 (engine assets.js addBorrowedMaps).
export const BORROWED_MAPS = [{
  root: '/static/assets/images/trung-trac/maps-32bit/',
  manifest: 'maps_tt.json',
  ids: ['BG_TT_SKY_DAY', 'BG_TT_MID_VILLAGE', 'TILESET_TT_GROUND', 'TILESET_TT_TERRAIN', 'PROP_TT_QUIZ_STELE']
}, {
  root: '/static/assets/images/ba-trieu/maps-32bit/',
  manifest: 'maps_bt.json',
  ids: ['ITEM_BT_TINH_HOA']
}, {
  root: '/static/assets/images/ly-nam-de/maps-32bit/',
  manifest: 'maps_lnd.json',
  ids: ['BG_LND_MID_CHU_DIEN', 'BG_LND_FAR_MIDLANDS']
}];
export const TILES = { ground: 'TILESET_TT_GROUND', groundRegion: 'Z1', terrain: 'TILESET_TT_TERRAIN' };
export const FAR_HILLS = { id: 'BG_LND_FAR_MIDLANDS', parallax: 0.2, bottomY: 230, hiddenUnderSky: [] };

// Ảnh DOM riêng chương (chân dung) — chưa có (MHD_ART_01–03).
export const PORTRAITS = [];

// Sprite canvas mỗi màn cần (chỉ nạp ảnh màn đang chơi dùng). PLACEHOLDER: lính
// tuần tiễu Lương + hố chông chương 4. ITEM_LND_HEAL ở mọi màn: engine drawPickups
// tra ảnh bình máu mỗi frame kể cả khi chưa có bình nào.
export const LEVEL_SPRITES = {
  1: ['EN_LUONG_PATROL', 'TR_BAMBOO_SPIKE_PIT', 'ITEM_LND_HEAL'],
  2: ['EN_LUONG_PATROL', 'TR_BAMBOO_SPIKE_PIT', 'ITEM_LND_HEAL'],
  3: ['EN_LUONG_PATROL', 'ITEM_LND_HEAL']
};

// URL trang từng màn (route ở backend/routes/pages.py).
export const LEVEL_URLS = {
  1: '/gameplay/levels/mai-hac-de',
  2: '/gameplay/levels/mai-hac-de/2',
  3: '/gameplay/levels/mai-hac-de/3'
};

// ---- Màn 1 "Gánh cống Hoan Châu" (khung) ----
// 6 chunk nền phẳng. Vùng cảnh tạm: làng (chương 1) -> Chu Diên (chương 3).
// Đích cuối màn, không cổng (bố cục thật ở MHD-L1).
export const LEVEL1_CHUNKS = 6;
export const LEVEL1_ZONES = [
  { id: 'MHD1', x0: 0, x1: CHUNK_W * 3, sky: 'BG_TT_SKY_DAY', mid: 'BG_TT_MID_VILLAGE' },
  { id: 'MHD2', x0: CHUNK_W * 3, x1: CHUNK_W * LEVEL1_CHUNKS, sky: 'BG_TT_SKY_DAY', mid: 'BG_LND_MID_CHU_DIEN' }
];
export const LEVEL1_FINISH_X = CHUNK_W * LEVEL1_CHUNKS - 96;

// ---- Màn 2 "Dựng cờ Vạn An" (khung) ----
// 4 chunk nền phẳng, nền Chu Diên tạm cho Hoan Châu – Sa Nam.
export const LEVEL2_CHUNKS = 4;
export const LEVEL2_ZONES = [
  { id: 'MHD2', x0: 0, x1: CHUNK_W * LEVEL2_CHUNKS, sky: 'BG_TT_SKY_DAY', mid: 'BG_LND_MID_CHU_DIEN' }
];
export const LEVEL2_FINISH_X = CHUNK_W * LEVEL2_CHUNKS - 96;

// ---- Màn 3 "Công phá Tống Bình" (khung) ----
// Đấu trường 1 chunk, 3 đợt lính ra ở spawnX (engine makeSpawner). Nền bãi tập
// chương 4 tạm cho cổng phủ Đô hộ Tống Bình.
export const ARENA = { width: CHUNK_W, playerStartX: 170, spawnX: 700 };
export const LEVEL3_ZONES = [
  { id: 'MHD3', x0: 0, x1: ARENA.width, sky: 'BG_TT_SKY_DAY', mid: 'BG_TQP_MID_TRAINING_YARD' }
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
//   level2Spots  [chunk, localX] — câu hỏi về NPC sắp gặp (pool cùng tên, thứ
//                tự Mẹ -> Thúc Bảo -> Sứ giả, MHD-00 quyết định 4).
export const QUIZ = {
  level1Count: 4,
  level1Spots: [[2, 312], [3, 680], [4, 560], [5, 560]],
  level2Spots: { maThi: [1, 600], thucBao: [2, 600], suGia: [3, 600] }
};

// ---- Môi trường ----
export const OBSTACLE_TYPES = {};
// Quyển Sách Tinh Hoa — PLACEHOLDER sprite chương 2 (strip 4 ô 16×16 logic).
export const ITEM = { sprite: 'ITEM_BT_TINH_HOA', fps: 8 };
export const QUIZ_STELE_ID = 'PROP_TT_QUIZ_STELE';
export const MAP_PROPS_IN_GAME = [ITEM.sprite, QUIZ_STELE_ID];

// ---- Quân địch, hazard, đạn ----
// PLACEHOLDER: lính tuần tiễu EN_LUONG_PATROL — số đo hitbox/tầm kích chép từ
// trieu-quang-phuc/config.js (22×34, kích 49 px ngoài mép). Thay bằng lính Đường ở MHD-L1.
export const SOLDIER = { w: 22, h: 34, hp: 2 };
export const GUARD = {
  patrolRange: 96, speed: 22, aggroRange: 130,
  attackReach: 49, attackBoxY: 10, attackBoxH: 9, attackCooldown: 1.6, damage: 1
};
export const ENEMY_SPRITES = {
  normal: {
    id: 'EN_LUONG_PATROL', behavior: 'guard', rules: GUARD,
    anims: { idle: 'idle', walk: 'walk', attack: 'attack_01', hurt: 'hurt', death: 'death' },
    attackMessage: 'Bạn bị lính Đường đâm trúng!', contactMessage: 'Bạn va phải lính Đường!',
    defeatMessage: 'Đã đánh bại lính Đường.'
  }
};
// Hổ dữ, xe cống, hòm rỗng, quan thu thuế của layout thử (MHD-ENGINE): số DESIGN_BASELINE,
// ảnh chưa có trong manifest mượn nên vẽ hộp dự phòng tới MHD_ART_01 (Q4).
export const HAZARD_SPRITES = {
  tiger: {
    id: 'EN_TIGER', w: 48, h: 24, warnTime: .6, leapTime: .7, leapHeight: 70, leapRange: 200, recoverTime: 1,
    anims: { warn: 'idle', leap: 'run', recover: 'idle', hurt: 'hurt', death: 'death' },
    hitMessage: 'Bạn bị hổ vồ trúng!', breakMessage: 'Đã hạ hổ dữ!'
  },
  tributeCart: {
    id: 'OB_TRIBUTE_CART', w: 64, h: 36, blocking: true, corpse: true, anims: { idle: 'idle', death: 'death' },
    breakMessage: 'Đã phá xe cống phẩm!'
  },
  taxOfficial: {
    id: 'EN_LUONG_PATROL', w: 22, h: 34,
    anims: { idle: 'idle', move: 'walk', throw: 'attack_01', hurt: 'hurt', death: 'death' }, breakMessage: 'Đã hạ quan thu thuế!'
  },
  emptyChest: {
    id: 'PJ_SILVER_CHEST', w: 22, h: 16, blocking: true, hp: 1, life: 8, maxLanded: 3, anims: { idle: 'loop' },
    breakMessage: 'Đã phá hòm rỗng!'
  },
  // PLACEHOLDER — hố chông tre chương 4 (trap): chìm 3 px vào cỏ.
  bambooPit: {
    id: 'TR_BAMBOO_SPIKE_PIT', w: 36, h: 6, sink: 3, anims: { idle: 'hidden', sprung: 'reveal' },
    springMessage: 'Bẫy chông tre bật lên!', sprungMessage: 'Bạn giẫm phải chông tre!'
  }
};
export const PROJECTILE_SPRITES = {
  emptyChest: { id: 'PJ_SILVER_CHEST', anim: 'loop', w: 14, h: 12, lob: { flightTime: .9, gravity: 700 }, landAs: 'emptyChest' }
};
// Hũ dầu (MHD-ENGINE E1, DESIGN_BASELINE): ID chép từ chương 1 ở MHD_ART_01.
export const CARRY = {
  oilJar: {
    sprite: 'PJ_OIL_JAR', anim: 'loop', w: 10, h: 10, pickup: { w: 22, h: 22, life: 12 },
    range: 160, flightTime: .7, gravity: 600, damage: 1,
    impact: { id: 'FX_OIL_FIRE', anim: 'impact', w: 32, h: 24, time: .6 }
  }
};
// Dân phu được cứu (MHD-ENGINE E5): tối đa 5, sprite vẽ ở MHD_ART_01.
export const RESCUE = { max: 5, score: 150, runner: { id: 'NPC_MHD_PORTER', anim: 'run', speed: 150, life: 2.5, w: 16, h: 32 } };

// Layout thử `?layout=engine` (MHD-ENGINE), mỗi chunk một cơ chế:
//   cartMark  chunk 1: mốc xe cống [chunk, localX]; đứng trong `reach` px thì Đánh là đập sọt.
//   carts     chunk 2: 2 xe chặn đường, phá thả 1 người.
//   hole, tiger  chunk 3: khe hố + hổ vồ.
//   official  chunk 4: quan ném hòm rỗng.
//   jarGuards, sandbag  chunk 5: 2 lính rơi hũ dầu, bao cát chỉ mất máu vì hũ dầu.
export const ENGINE_TEST = {
  cartMark: [1, 560], reach: 60,
  carts: [[2, 260], [2, 520]],
  hole: ['##############......############################'],
  tiger: [3, 560], tigerSpan: [3, 340, 740],
  official: [4, 460],
  jarGuards: [[5, 200], [5, 300]],
  sandbag: [5, 620]
};
// NPC (Mai Thúc Loan dẫn màn 1, 3 NPC màn 2) — chưa có (MHD-L1/L2).
export const NPC_SPRITES = {};
// Bình hồi máu (chương 3) — chưa có quân nào rơi.
export const PICKUPS = { heal: { id: 'ITEM_LND_HEAL', anim: 'idle' } };

// ---- Phần thưởng màn 2 (id khớp seed backend/migrations/009_mai_hac_de.sql) ----
// Tên theo docs/SUTA_MHD_TASK_00.md §3.4 (duyệt 07/11/2026); cơ chế ở MHD-L3.
export const REWARD_NAMES = {
  BUFF_MHD_POWER: 'Ý chí dân nghèo',
  SK_MHD_VAN_AN_SHELL: 'Vỏ Bọc Vạn An',
  SK_MHD_REINFORCE: 'Viện Binh'
};

// ---- Câu chữ thông báo dùng trong engine (CHAPTER.text) ----
export const TEXT = {
  obstacleHit: 'Hãy nhảy hoặc lướt qua chướng ngại vật.',
  trapHit: 'Bạn va vào bẫy!',
  fell: 'Bạn rơi xuống hố và mất 1 máu.',
  hazardHit: 'Bạn va phải quân Đường!',
  hazardDefeated: 'Đã hạ chướng ngại vật!',
  projectileHit: 'Bạn trúng đạn của quân Đường!',
  bossContact: 'Quân Đường phản công!',
  bossDefeated: 'Đã đánh bại quân Đường!',
  bossBlocksFinish: 'Hãy hạ quân Đường chặn đường trước.',
  itemPicked: (count, total) => `Đã thu thập Quyển Sách Tinh Hoa ${count}/${total}`,
  itemsMissing: count => `Bạn còn thiếu ${count} Quyển Sách Tinh Hoa.`,
  rescueHint: name => `Hãy hạ quân Đường đang vây ${name}!`,
  burdenHint: 'Đang gánh nặng! Tới xe cống rồi bấm Đánh để đập sọt.'
};
