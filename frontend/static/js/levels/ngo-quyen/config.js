// Hằng số RIÊNG chương Ngô Quyền (chương 7) — không chứa logic. Hằng số chung
// mọi chương ở engine/config.js. Mọi toạ độ/kích thước/tốc độ là pixel logic.
//
// NQ-SKELETON (docs/SUTA_NQ_TASK_SKELETON_01.md): khung 3 màn chạy bằng asset
// MƯỢN — toàn bộ PLACEHOLDER, thay ở NQ-L1/L2/L3 khi có đợt Codex NQ_ART_01–03.
// Sprite + nền của chương Phùng Hưng (trỏ thẳng manifest chương 6, không chép
// ảnh); trời, tile, bia câu hỏi của chương 1, sách của chương 2, đồi xa của
// chương 3 qua BORROWED_MAPS. Không import file nào của chương 1–6. Mọi số
// DESIGN_BASELINE.

import { CHUNK_W } from '../../engine/config.js';

// ---- Asset ----
// PLACEHOLDER — asset chương 6, thay ở NQ-L1 (đợt NQ_ART_01 tạo images/ngo-quyen/).
export const SPRITE_ROOT = '/static/assets/images/phung-hung/sprites-32bit/';
export const SPRITE_MANIFEST_FILE = 'manifest_ph.json';
export const MAP_ROOT = '/static/assets/images/phung-hung/maps-32bit/';
export const MAP_MANIFEST_FILE = 'maps_ph.json';
// Asset map chương 1–3 (engine assets.js addBorrowedMaps).
export const BORROWED_MAPS = [{
  root: '/static/assets/images/trung-trac/maps-32bit/',
  manifest: 'maps_tt.json',
  ids: ['BG_TT_SKY_DAY', 'TILESET_TT_GROUND', 'TILESET_TT_TERRAIN', 'PROP_TT_QUIZ_STELE']
}, {
  root: '/static/assets/images/ba-trieu/maps-32bit/',
  manifest: 'maps_bt.json',
  ids: ['ITEM_BT_TINH_HOA']
}, {
  root: '/static/assets/images/ly-nam-de/maps-32bit/',
  manifest: 'maps_lnd.json',
  ids: ['BG_LND_FAR_MIDLANDS']
}];
export const TILES = { ground: 'TILESET_TT_GROUND', groundRegion: 'Z1', terrain: 'TILESET_TT_TERRAIN' };
export const FAR_HILLS = { id: 'BG_LND_FAR_MIDLANDS', parallax: 0.2, bottomY: 230, hiddenUnderSky: [] };

// Ảnh DOM riêng chương (chân dung) — chưa có (NQ_ART_01).
export const PORTRAITS = [];

// Sprite canvas mỗi màn cần. ITEM_LND_HEAL ở mọi màn: engine drawPickups tra ảnh
// bình máu mỗi frame kể cả khi chưa có bình nào.
export const LEVEL_SPRITES = {
  1: ['EN_PH_TANG_SPEARMAN', 'OB_PH_LATERITE_ROCK', 'ITEM_LND_HEAL'],
  2: ['EN_PH_TANG_SPEARMAN', 'ITEM_LND_HEAL'],
  3: ['EN_PH_TANG_SPEARMAN', 'ITEM_LND_HEAL']
};

// URL trang từng màn (route ở backend/routes/pages.py).
export const LEVEL_URLS = {
  1: '/gameplay/levels/ngo-quyen',
  2: '/gameplay/levels/ngo-quyen/2',
  3: '/gameplay/levels/ngo-quyen/3'
};

// ---- Màn 1 "Hành quân ra Bắc" — PLACEHOLDER, thay ở NQ-L1 ----
// 6 chunk nền phẳng, 1 vùng. Đích cuối chunk 6, không cổng.
export const LEVEL1_CHUNKS = 6;
export const LEVEL1_ZONES = [
  { id: 'NQ1', x0: 0, x1: CHUNK_W * LEVEL1_CHUNKS, sky: 'BG_TT_SKY_DAY', mid: 'BG_PH_MID_DUONG_LAM' }
];
export const LEVEL1_FINISH_X = CHUNK_W * 5 + 672;
// Điểm cố định [chunk, localX]; sách [chunk, localX, độ cao trên mặt đất].
export const LEVEL1 = {
  soldiers: [[2, 520], [4, 380], [5, 560]],
  rock: [3, 420],
  books: [[1, 480, 40], [2, 260, 40], [3, 660, 40], [4, 620, 40], [5, 260, 40]]
};
// Đá ong rơi (snare): ẩn tới khi kích hoạt (level1Events bật hình).
export const ROCK = { dropHeight: 90, triggerWidth: 24, hp: 1 };

// ---- Màn 2 "Trận địa cọc ngầm" — PLACEHOLDER, thay ở NQ-L2 ----
// 4 chunk, 2 lính, 3 câu hỏi chặn đường theo thứ tự pool NPC; chưa có NPC.
export const LEVEL2_CHUNKS = 4;
export const LEVEL2_ZONES = [
  { id: 'NQ2', x0: 0, x1: CHUNK_W * LEVEL2_CHUNKS, sky: 'BG_TT_SKY_DAY', mid: 'BG_PH_MID_SUPPLY_ROAD' }
];
export const LEVEL2_FINISH_X = CHUNK_W * 3 + 672;
export const LEVEL2 = { soldiers: [[2, 600], [3, 600]] };

// ---- Màn 3 "Đại thắng Bạch Đằng" — PLACEHOLDER, thay ở NQ-L3 ----
// Đấu trường 1 chunk, 3 đợt lính ra từ mép phải; hết đợt 3 + hết quân thì thắng.
export const ARENA = { width: CHUNK_W, playerStartX: 170, spawnX: CHUNK_W - 60, edge: 40 };
export const LEVEL3_ZONES = [
  { id: 'NQ3', x0: 0, x1: ARENA.width, sky: 'BG_TT_SKY_DAY', mid: 'BG_PH_MID_TAX_PASS' }
];
// Mỗi đợt: quân ra ở giây `at` tính từ đầu đợt, lệch `dx` so với spawnX.
export const WAVES = {
  gap: 1.5,
  groups: [
    [{ at: 0 }, { at: 1.2, dx: -40 }],
    [{ at: 0 }, { at: 1, dx: -40 }, { at: 2 }],
    [{ at: 0 }, { at: .8, dx: -40 }, { at: 1.6 }]
  ]
};

// Câu hỏi chặn đường (điểm + luật ở engine):
//   level1Count  số câu mỗi lượt màn 1 (rút ngẫu nhiên, không trùng).
//   level1Spots  [chunk, localX] — chạm x này thì hỏi (theo thứ tự).
//   level2Spots  [chunk, localX] theo khoá pool, thứ tự Dương Đình Nghệ ->
//                Kiều Công Hãn -> Ngô Xương Ngập (NQ-00 §3.3).
export const QUIZ = {
  level1Count: 4,
  level1Spots: [[1, 700], [3, 160], [4, 160], [6, 160]],
  level2Spots: { duongDinhNghe: [1, 420], kieuCongHan: [2, 420], ngoXuongNgap: [3, 420] }
};

// ---- Môi trường ----
export const OBSTACLE_TYPES = {};
// Quyển Sách Tinh Hoa — PLACEHOLDER sprite chương 2 (strip 4 ô 16×16 logic).
export const ITEM = { sprite: 'ITEM_BT_TINH_HOA', fps: 8 };
export const QUIZ_STELE_ID = 'PROP_TT_QUIZ_STELE';
export const MAP_PROPS_IN_GAME = [ITEM.sprite, QUIZ_STELE_ID];

// ---- Quân địch, hazard, đạn ----
// PLACEHOLDER — lính giáo chương 6 EN_PH_TANG_SPEARMAN, số đo chép từ phung-hung/config.js
// (mũi giáo ô 4 ở +45,25 từ pivot): thay bằng lính Kiều Công Tiễn ở NQ-L1.
export const SOLDIER = { w: 22, h: 34, hp: 2 };
export const GUARD = {
  patrolRange: 96, speed: 34, aggroRange: 150,
  attackReach: 34, attackBoxY: 10, attackBoxH: 9, attackCooldown: 1.4, damage: 1
};
const SOLDIER_ART = {
  id: 'EN_PH_TANG_SPEARMAN', behavior: 'guard',
  anims: { idle: 'idle', walk: 'walk', attack: 'attack_01', hurt: 'hurt', death: 'death' },
  attackMessage: 'Bạn bị lính giặc đánh trúng!', contactMessage: 'Bạn va phải lính giặc!'
};
export const ENEMY_SPRITES = {
  normal: { ...SOLDIER_ART, rules: GUARD, defeatMessage: 'Đã đánh bại lính giặc.' },
  // Màn 3: lính đấu trường đuổi khắp đấu trường.
  arena: { ...SOLDIER_ART, rules: { ...GUARD, speed: 70, aggroRange: CHUNK_W }, defeatMessage: 'Đã đánh bại lính giặc.' }
};
export const HAZARD_SPRITES = {
  // ---- NQ-ENGINE (layout thử) — PLACEHOLDER, chưa có sprite (NQ_ART_01) ----
  boat: {
    id: 'OB_NQ_BOAT', w: 64, h: 16, ride: { top: 4, inset: 6 }, boat: { speed: 140, drag: 3 },
    anims: { idle: 'idle', move: 'row' }
  },
  whirl: { id: 'FX_NQ_WHIRLPOOL', w: 40, h: 8, radius: 64, core: 10, pull: 70, anims: { idle: 'idle' } },
  gust: {
    id: 'FX_NQ_GUST', w: 256, h: 90, dir: -1, force: 120, cycle: { off: 1.6, warn: .8, active: 1.6 },
    anims: { idle: 'idle', warn: 'warn', active: 'active' }
  },
  shelterRock: { id: 'OB_NQ_WIND_ROCK', w: 28, h: 36, anims: { idle: 'idle' } },
  hiddenStake: { id: 'OB_NQ_HIDDEN_STAKE', w: 10, h: 22, tideOnly: 'low', damage: 1, anims: { idle: 'idle' }, hitMessage: 'Bạn va phải cọc ngầm!' },
  stakePile: { id: 'OB_NQ_STAKE_PILE', w: 30, h: 20, burdenSource: {}, anims: { idle: 'idle' } },
  netThrower: { id: 'EN_NQ_NET_THROWER', w: 20, h: 34, muzzle: 26, anims: { idle: 'idle', throw: 'throw', hurt: 'hurt', death: 'death' } },
  // PLACEHOLDER — đá ong rơi chương 6 (chương 6 không có OB_BOULDER), thay ở NQ-L1.
  lateriteRock: {
    id: 'OB_PH_LATERITE_ROCK', w: 24, h: 24, warnTime: .5, fallSpeed: 300, stun: .4, damage: 1, blocking: true,
    anims: { idle: 'idle', warn: 'warn', fall: 'fall', landed: 'landed', death: 'break' },
    springMessage: 'Đá rung chuyển trên đầu!', hitMessage: 'Bạn bị đá rơi trúng!', breakMessage: 'Đá vỡ tan!'
  }
};
export const PROJECTILE_SPRITES = {
  // Lưới quăng từ bè (NQ-ENGINE E6): vòng cung, trúng thì choáng, không mất máu.
  // PLACEHOLDER — chưa có sprite, vẽ hộp tới NQ_ART_02.
  net: { id: 'PJ_NQ_NET', anim: 'idle', w: 16, h: 10, lob: { flightTime: .9, gravity: 700 }, stun: 1, damage: 0, hitMessage: 'Bạn bị lưới chụp trúng!' }
};

// ---- Layout thử `?layout=engine` (NQ-ENGINE) — PLACEHOLDER, vẽ hộp tới NQ_ART_01 ----
//   chunk 1: bến + thuyền trong khe sông 320 px + xoáy nước;
//   chunk 2: 2 vùng gió lệch nhịp + 2 đá chắn;
//   chunk 3: bãi triều 192 px + khe sông + thuyền thứ 2 + 2 cọc ngầm theo triều;
//   chunk 4: đống cọc + 3 mốc trên bãi triều (cần 2);
//   chunk 5: lính quăng lưới + 1 lính giáo.
// Triều chu kỳ ngắn để thử nhanh. Mọi số DESIGN_BASELINE.
export const ENGINE_TEST = {
  terrain: [
    { chunk: 1, rows: ['##########~~~~~~~~~~~~~~~~~~~~##################'] },
    { chunk: 3, rows: ['########,,,,,,,,,,,,~~~~~~~~~~~~################'] },
    { chunk: 4, rows: ['##########,,,,,,,,,,,,,,,,,,,,,,,,,,,,##########'] }
  ],
  tide: { low: 6, warn: 2, high: 6, rise: 10 },
  boats: [[1, 220], [3, 420]],
  whirl: [1, 400],
  gusts: [[2, 250, 0], [2, 560, 1.6]],
  shelters: [[2, 180], [2, 500]],
  hiddenStakes: [[3, 455], [3, 485]],
  pile: [4, 100],
  stakeSpots: [[4, 260], [4, 380], [4, 500]],
  stakesRequired: 2,
  netThrower: [5, 620],
  soldier: [5, 320]
};
// Thuyền nổi: đáy ảnh chìm `BOAT_FLOAT` px dưới mặt đất -> boong cao GROUND_Y + 2.
export const BOAT_FLOAT = 14;
// Mốc cắm cọc (engine CHAPTER.stakes): chưa có sprite.
export const STAKES = { w: 8, h: 28 };
export const NPC_SPRITES = {};
// Bình hồi máu (chương 3) — chưa có quân nào rơi.
export const PICKUPS = { heal: { id: 'ITEM_LND_HEAL', anim: 'idle' } };

// ---- Phần thưởng màn 2 (id khớp seed backend/migrations/012_ngo_quyen.sql) ----
// Tên theo docs/SUTA_NQ_TASK_00.md §3.4 (duyệt 11/11/2026); cơ chế ở NQ-L3.
export const REWARD_NAMES = {
  BUFF_NQ_SWIFT: 'Thần Tốc Hành Quân',
  SK_NQ_IRON_STAKE: 'Cọc Sắt Bạch Đằng',
  SK_NQ_DECOY_BOAT: 'Thuyền Nhẹ Khiêu Chiến'
};

// ---- Câu chữ thông báo dùng trong engine (CHAPTER.text) ----
export const TEXT = {
  obstacleHit: 'Hãy nhảy hoặc lướt qua chướng ngại vật.',
  trapHit: 'Bạn va vào bẫy!',
  fell: 'Bạn rơi xuống hố và mất 1 máu.',
  hazardHit: 'Bạn va phải quân giặc!',
  hazardDefeated: 'Đã hạ chướng ngại vật!',
  projectileHit: 'Bạn trúng đòn của quân giặc!',
  bossContact: 'Quân giặc phản công!',
  bossDefeated: 'Đã đánh bại quân giặc!',
  bossBlocksFinish: 'Hãy hạ hết quân giặc trước.',
  rest: 'Nghỉ chân: hồi 1 máu.',
  itemPicked: (count, total) => `Đã thu thập Quyển Sách Tinh Hoa ${count}/${total}`,
  itemsMissing: count => `Bạn còn thiếu ${count} Quyển Sách Tinh Hoa.`,
  rescueHint: name => `Hãy hạ quân giặc đang vây ${name}!`,
  npcLocked: (requires, have) => `Cần ${requires} Quyển Sách Tinh Hoa (đã có ${have}).`,
  // NQ-ENGINE (câu kỹ thuật, không phải nội dung lịch sử).
  tideRising: 'Nước triều sắp lên! Rời khỏi bãi bùn.',
  tideFalling: 'Nước triều đang rút.',
  gustWarn: 'Gió ngược sắp thổi! Nấp sau tảng đá.',
  whirlHit: 'Thuyền bị xoáy nước cuốn!',
  stakePicked: 'Đã vác cọc. Ra bãi bùn lúc nước ròng để cắm.',
  stakePlanted: (count, total) => `Đã cắm cọc ${count}/${total}`,
  stakeFlooded: 'Nước đang lớn, chưa cắm cọc được.',
  stakesMissing: count => `Cần cắm thêm ${count} cọc nữa.`,
  burdenHint: 'Đang vác cọc: tới mốc trên bãi bùn rồi bấm Đánh để cắm.'
};
