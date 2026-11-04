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
  // + sprite layout thử ?layout=engine (thuyền, cung thủ, tên).
  1: ['EN_LUONG_PATROL', 'TR_BAMBOO_NET', 'ITEM_LND_HEAL', 'EN_LUONG_WAR_BOAT', 'PJ_FIRE_ARROW', 'EN_LUONG_ARCHER', 'PJ_CROSSBOW_BOLT'],
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
  },
  // Lính giáo dài (TQP-ENGINE E5 `plungeOnly`): gạt đòn chém ngang, chỉ đòn bổ
  // từ trên mới trúng. PLACEHOLDER sprite lính tuần chương 3 — lính thật ở TQP-L1.
  spearman: {
    id: 'EN_LUONG_PATROL', behavior: 'guard', rules: GUARD, plungeOnly: true,
    anims: { idle: 'idle', walk: 'walk', attack: 'attack_01', hurt: 'hurt', death: 'death' },
    attackMessage: 'Bạn bị lính giáo dài đâm trúng!', contactMessage: 'Bạn va phải lính giáo dài!',
    defeatMessage: 'Đã hạ lính giáo dài.'
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
  },
  // ---- Layout thử ?layout=engine (TQP-ENGINE) — PLACEHOLDER: `id: null` = hộp tạm ----
  // Khói chướng khí trôi (E2): làn thấp sát đất / làn cao `lanes.high` px.
  smoke: {
    id: null, w: 56, h: 18, lanes: { low: 0, high: 26 }, anims: {},
    hitMessage: 'Bạn hít phải khói chướng khí!'
  },
  // Cá sấu (E3): báo bọt `warnTime`, ngoi đớp `upTime`, lặn `diveTime` (giây);
  // lúc đớp chồm lên cao nhất `leap` px.
  crocodile: {
    id: null, w: 40, h: 20, warnTime: .6, upTime: 1, diveTime: .3, leap: 56, anims: {},
    hitMessage: 'Cá sấu đớp trúng bạn!', breakMessage: 'Đã hạ cá sấu!'
  },
  // Thuyền chiến chương 3 (số đo ly-nam-de/config.js) + gọi viện (E4).
  warBoat: {
    id: 'EN_LUONG_WAR_BOAT', w: 72, h: 28, muzzle: 27.5, muzzleX: 33,
    anims: { idle: 'idle', throw: 'throw' },
    signalMessage: 'Thuyền tuần thổi tù và gọi quân!', breakMessage: 'Đã phá thuyền tuần!'
  },
  // Cung thủ chương 3 đứng đất (thrower `aim`).
  archer: {
    id: 'EN_LUONG_ARCHER', w: 20, h: 34, muzzle: 23, muzzleX: 11,
    anims: { idle: 'idle', throw: 'throw' }, hitMessage: 'Bạn va phải cung thủ!'
  }
};
export const PROJECTILE_SPRITES = {
  fireArrow: { id: 'PJ_FIRE_ARROW', anim: 'loop', w: 14, h: 4 },
  crossbowBolt: { id: 'PJ_CROSSBOW_BOLT', anim: 'idle', w: 12, h: 3 }
};
// NPC (Triệu Quang Phục dẫn màn 1, 3 NPC màn 2) — chưa có (TQP-L1/L2).
// `testNpc`: NPC hộp tạm của layout thử (khoá theo sách — E6), không có thoại.
export const NPC_SPRITES = { testNpc: { id: null, anims: {} } };

// Layout thử `?layout=engine` (màn 1 — TQP-ENGINE): mỗi chunk thử một cơ chế mới.
//   mud      chunk 1: lưới địa hình (cột '=' = sình, local 160–320) + lính sau dải.
//   smoke    chunk 2: khói trôi [chunk, localX xuất phát, làn, speed, travel].
//   river    lưới chunk 3–4 (như RIVER): khe 1 local 224–336, khe 2 local 400–576 + mỏm đá.
//   crocodile [chunk, localX tâm, floatY] — cá sấu trong khe 1 chunk 3.
//   boat     [chunk, localX tâm, floatY] — thuyền trong khe 1 chunk 4, `hp`, gọi viện.
//   spearmen chunk 5: lính giáo dài + 1 bục để nhảy lên bổ.
//   covers   chunk 6: vùng ẩn nấp [localX trái, rộng] + 2 lính tuần + cung thủ.
//   npc      chunk 6: NPC hộp `requires` 2 sách; 2 sách treo cao trước NPC.
//   bonusHealth  máu tối đa +2 (E8 — phần thưởng thật ở TQP-L3).
export const ENGINE_TEST = {
  mud: ['##########==========############################'],
  mudGuard: [1, 450],
  smoke: [[2, 340, 'low', -130, 300], [2, 740, 'high', -110, 300]],
  crocodile: [3, 280, 6],
  boat: [4, 280, 5],
  callHelp: { after: 4, range: 220, spawnAt: [[4, 120], [4, 680]] },
  spearmen: [[5, 300], [5, 600]],
  platform: [5, 430, 40, 64],
  covers: [6, 60, 200],
  coverGuards: [[6, 140], [6, 260]],
  archer: [6, 380],
  npc: [6, 620, 2],
  npcItems: [[6, 470, 60], [6, 530, 60]],
  bonusHealth: 2
};
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
  rescueHint: name => `Hãy hạ quân Lương đang vây ${name}!`,
  // TQP-ENGINE (câu thông báo kỹ thuật, không phải nội dung lịch sử).
  mudSunk: 'Bạn bị lún trong bãi sình!',
  plungeHint: 'Lính giáo dài gạt đòn chém ngang — nhảy lên, đang rơi thì bấm Đánh để bổ xuống!',
  npcLocked: (need, have) => `Cần ${need} Quyển Sách Tinh Hoa mới gặp được (đang có ${have}).`
};
