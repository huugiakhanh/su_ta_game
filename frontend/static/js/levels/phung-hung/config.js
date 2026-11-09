// Hằng số RIÊNG chương Phùng Hưng (chương 6) — không chứa logic. Hằng số chung
// mọi chương ở engine/config.js. Mọi toạ độ/kích thước/tốc độ là pixel logic.
//
// PH-SKELETON (docs/SUTA_PH_TASK_SKELETON_01.md): khung 3 màn chạy bằng asset
// MƯỢN — toàn bộ PLACEHOLDER, thay ở PH-L1/L2/L3 khi có đợt Codex PH_ART_01–03.
// Sprite + nền của chương Mai Hắc Đế (trỏ thẳng manifest chương 5, không chép
// ảnh); trời, tile, bia câu hỏi của chương 1, sách của chương 2, đồi xa của
// chương 3 qua BORROWED_MAPS. Không import file nào của chương 1–5. Mọi số
// DESIGN_BASELINE.

import { CHUNK_W } from '../../engine/config.js';

// ---- Asset ----
// PH_ART_01 (Gate A1 + A2, IN_GAME).
export const SPRITE_ROOT = '/static/assets/images/phung-hung/sprites-32bit/';
export const SPRITE_MANIFEST_FILE = 'manifest_ph.json';
export const MAP_ROOT = '/static/assets/images/phung-hung/maps-32bit/';
export const MAP_MANIFEST_FILE = 'maps_ph.json';
// PLACEHOLDER — asset map chương 1–3 + nền chương 5 (engine assets.js addBorrowedMaps).
export const BORROWED_MAPS = [{
  root: '/static/assets/images/mai-hac-de/maps-32bit/',
  manifest: 'maps_mhd.json',
  ids: ['BG_MHD_MID_SA_NAM', 'BG_MHD_MID_TANG_CHECKPOINT']
}, {
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
export const TILES = { ground: 'TILESET_TT_GROUND', groundRegion: 'Z1', terrain: 'TILESET_TT_TERRAIN', spikes: 'PROP_PH_SPIKE_TRENCH' };
export const FAR_HILLS = { id: 'BG_LND_FAR_MIDLANDS', parallax: 0.2, bottomY: 230, hiddenUnderSky: [] };

// Ảnh DOM riêng chương (chân dung).
export const PORTRAITS = ['PORTRAIT_PHUNG_HUNG'];

// Sprite canvas mỗi màn cần (chỉ nạp ảnh màn đang chơi dùng). ITEM_LND_HEAL ở mọi
// màn: engine drawPickups tra ảnh bình máu mỗi frame kể cả khi chưa có bình nào.
export const LEVEL_SPRITES = {
  1: ['NPC_PHUNG_HUNG', 'EN_PH_TANG_SPEARMAN', 'ITEM_LND_HEAL', 'EN_TANG_SHIELD_GUARD', 'EN_TIGER', 'EN_PH_BUFFALO',
    'OB_PH_SALT_CART', 'OB_PH_FENCE', 'OB_PH_SCARECROW', 'OB_PH_LATERITE_ROCK', 'EN_PH_TANG_HUNTER', 'PJ_CROSSBOW_BOLT', 'PROP_TQP_ARCHER_TREE'],
  2: ['EN_PH_TANG_SPEARMAN', 'ITEM_LND_HEAL'],
  3: ['EN_PH_TANG_SPEARMAN', 'ITEM_LND_HEAL']
};

// URL trang từng màn (route ở backend/routes/pages.py).
export const LEVEL_URLS = {
  1: '/gameplay/levels/phung-hung',
  2: '/gameplay/levels/phung-hung/2',
  3: '/gameplay/levels/phung-hung/3'
};

// ---- Màn 1 "Trai tráng Đường Lâm" (PH-L1, docs/SUTA_PH_TASK_L1_01.md) ----
// 12 chunk, 3 vùng: Đường Lâm 1–4, đồi đá ong 5–8, ải thu thuế 9–12. Cổng ải là đích.
export const LEVEL1_CHUNKS = 12;
export const LEVEL1_ZONES = [
  { id: 'PH1', x0: 0, x1: CHUNK_W * 4, sky: 'BG_TT_SKY_DAY', mid: 'BG_PH_MID_DUONG_LAM' },
  { id: 'PH2', x0: CHUNK_W * 4, x1: CHUNK_W * 8, sky: 'BG_TT_SKY_DAY', mid: 'BG_PH_MID_LATERITE_HILLS' },
  { id: 'PH3', x0: CHUNK_W * 8, x1: CHUNK_W * LEVEL1_CHUNKS, sky: 'BG_TT_SKY_DAY', mid: 'BG_PH_MID_TAX_PASS' }
];
export const LEVEL1_FINISH_X = CHUNK_W * 11 + 618;
export const FINISH_GATE = { closed: 'PROP_PH_TAX_GATE', open: 'PROP_PH_TAX_GATE_OPEN', worldX: LEVEL1_FINISH_X, sink: 0 };
// Phùng Hưng đứng chờ ở chunk 1 (NPC dẫn màn).
export const GUIDE_LOCAL_X = 190;
// Tâm 2 ô đặt nhóm xáo trong mỗi chunk xáo (lệch ±SLOT_JITTER).
export const SLOTS = { a: 210, b: 600 };
export const SLOT_JITTER = 60;
// Các điểm cố định màn 1 ([chunk, localX]; số DESIGN_BASELINE).
export const LEVEL1 = {
  firstGuard: [1, 640],
  // 5 sách: 2 trên đường + 3 giấu (hổ, lính khiên, rào).
  books: [[2, 480, 60], [10, 480, 60]],
  bookLift: 40,
  tiger: { at: [4, 100], span: [[3, 120], [4, 640]], hp: 9, triggerRange: 300 },
  decoys: [[3, 420], [3, 660], [4, 200]],
  shield: { at: [5, 380], hp: 6 },
  buffalo: { at: [7, 680], speed: -220, trigger: 440 },
  buffaloGuards: [[7, 300], [7, 400], [7, 500]],
  fence: [7, 590],
  bookFence: [8, 720],
  rest: [8, 40],
  // Hào chông chunk 9: 10 cột = 160 px, cần nhảy + lướt (nhảy 115 px, nhảy + lướt 198 px).
  trench: { chunk: 9, rows: ['####################^^^^^^^^^^##################'] },
  cart: [11, 640],
  gateGuards: [[12, 120], [12, 260]],
  tips: [
    [3, 440, 'Đứng gần bù nhìn, đợi hổ vồ trúng rồi tung đòn gồng!'],
    [7, 100, 'Giữ J, thả đúng lúc để thu phục trâu mộng!'],
    [9, 180, 'Hào quá rộng: nhảy rồi lướt để qua.'],
    [11, 500, 'Đẩy xe húc lính gác ải!']
  ]
};
// Đá ong rơi: treo cao, công tắc ẩn rộng.
export const ROCK = { dropHeight: 90, triggerWidth: 24, hp: 1 };
// Thợ săn trên cây PROP_TQP_ARCHER_TREE: mặt cành hàng ảnh 99 -> cao 87, đứng lệch 13.
export const TREE = { deck: 87, archerDx: 13, fireInterval: 2.2, fireRange: 240 };

// ---- Màn 2 "Tụ nghĩa chiêu hiền" (khung) ----
// 4 chunk nền phẳng, nền Sa Nam tạm.
export const LEVEL2_CHUNKS = 4;
export const LEVEL2_ZONES = [
  { id: 'PH2A', x0: 0, x1: CHUNK_W * LEVEL2_CHUNKS, sky: 'BG_TT_SKY_DAY', mid: 'BG_MHD_MID_SA_NAM' }
];
export const LEVEL2_FINISH_X = CHUNK_W * LEVEL2_CHUNKS - 96;

// ---- Màn 3 "Vây phủ Tống Bình" (khung) ----
// Đấu trường 1 chunk, 3 đợt lính ra ở spawnX (engine makeSpawner). Nền trạm gác tạm.
export const ARENA = { width: CHUNK_W, playerStartX: 170, spawnX: 700 };
export const LEVEL3_ZONES = [
  { id: 'PH3', x0: 0, x1: ARENA.width, sky: 'BG_TT_SKY_DAY', mid: 'BG_MHD_MID_TANG_CHECKPOINT' }
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
//   level2Spots  [chunk, localX] — pool cùng tên = id NPC, thứ tự Phùng Hải ->
//                Đỗ Anh Hàn -> Bồ Phá Cần (PH-00 §3.3).
export const QUIZ = {
  level1Count: 4,
  level1Spots: [[2, 400], [6, 400], [8, 400], [10, 400]],
  level2Spots: { phungHai: [1, 600], doAnhHan: [2, 600], boPhaCan: [3, 600] }
};

// ---- Môi trường ----
export const OBSTACLE_TYPES = {};
// Quyển Sách Tinh Hoa — PLACEHOLDER sprite chương 2 (strip 4 ô 16×16 logic).
export const ITEM = { sprite: 'ITEM_BT_TINH_HOA', fps: 8 };
export const QUIZ_STELE_ID = 'PROP_TT_QUIZ_STELE';
export const MAP_PROPS_IN_GAME = [ITEM.sprite, QUIZ_STELE_ID, TILES.spikes, FINISH_GATE.closed, FINISH_GATE.open];

// ---- Quân địch, hazard, đạn ----
// Lính tuần giáo EN_PH_TANG_SPEARMAN (ô 48×48; attack_01 frame_w 128). Mũi giáo ô 4
// ở +45,25 từ pivot, cao 19,5 từ đế chân (SPRITE_REPORT_PH_32): attackReach = 45 − w/2,
// attackBoxY..+H ôm hàng 14,5 tính từ đỉnh hitbox.
export const SOLDIER = { w: 22, h: 34, hp: 2 };
export const GUARD = {
  patrolRange: 96, speed: 34, aggroRange: 150,
  attackReach: 34, attackBoxY: 10, attackBoxH: 9, attackCooldown: 1.4, damage: 1
};
export const ENEMY_SPRITES = {
  normal: {
    id: 'EN_PH_TANG_SPEARMAN', behavior: 'guard', rules: GUARD,
    anims: { idle: 'idle', walk: 'walk', attack: 'attack_01', hurt: 'hurt', death: 'death' },
    attackMessage: 'Bạn bị lính Đường đánh trúng!', contactMessage: 'Bạn va phải lính Đường!',
    defeatMessage: 'Đã đánh bại lính Đường.'
  },
  // PLACEHOLDER layout thử (PH-ENGINE): lính khiên chỉ vỡ bởi đòn gồng; số đo từ chương 5.
  shield: {
    id: 'EN_TANG_SHIELD_GUARD', behavior: 'guard', chargeOnly: true,
    rules: { patrolRange: 96, speed: 28, aggroRange: 220, attackReach: 12, attackBoxY: 5, attackBoxH: 12, attackCooldown: 1.6, damage: 1 },
    anims: { idle: 'idle', walk: 'walk', attack: 'attack_01', blocked: 'blocked', hurt: 'hurt', death: 'death' },
    attackMessage: 'Bạn bị lính khiên chém trúng!', contactMessage: 'Bạn va phải lính khiên!',
    defeatMessage: 'Đã phá thế thủ của lính khiên.'
  }
};
export const HAZARD_SPRITES = {
  // Đá ong rơi (snare): ẩn tới khi có người vào vùng (level1Events bật hình), nằm lại chặn đường, đập vỡ được.
  lateriteRock: {
    id: 'OB_PH_LATERITE_ROCK', w: 24, h: 24, warnTime: .5, fallSpeed: 300, stun: .4, damage: 1, blocking: true,
    anims: { idle: 'idle', warn: 'warn', fall: 'fall', landed: 'landed', death: 'break' },
    springMessage: 'Đá ong rung chuyển trên đầu!', hitMessage: 'Bạn bị đá ong rơi trúng!', breakMessage: 'Đá ong vỡ tan!'
  },
  // Thợ săn trên cây (thrower đứng cao): điểm phóng ở cung ô 5, +12; 27.
  treeHunter: {
    id: 'EN_PH_TANG_HUNTER', w: 20, h: 34, muzzle: 27, muzzleX: 12,
    anims: { idle: 'idle', throw: 'throw', hurt: 'hurt', death: 'death' }, hitMessage: 'Bạn va phải thợ săn!'
  },
  // Cây cho thợ săn (hazard `prop`, chỉ vẽ), đặt TRƯỚC thợ săn để vẽ phía sau.
  archerTree: { id: 'PROP_TQP_ARCHER_TREE', w: 28, h: 110, anims: { idle: 'idle' } },
  // Layout thử (PH-ENGINE). Hitbox theo số đo PH_ART_01, DESIGN_BASELINE.
  tiger: {
    id: 'EN_TIGER', w: 48, h: 24, warnTime: .6, leapTime: .7, leapHeight: 70, leapRange: 200, recoverTime: 1,
    stuckTime: 2, stuckOnly: true, chargeOnly: true,
    anims: { warn: 'warn', leap: 'pounce', recover: 'idle', stuck: 'stuck', hurt: 'hurt', death: 'death' },
    hitMessage: 'Bạn bị hổ vồ trúng!', breakMessage: 'Đã hạ hổ dữ!'
  },
  buffalo: {
    // rideTop: lưng trâu cao ~36 logic (hàng 102–112 trên baseline 251), mông người cao
    // ~8,75 logic so với chân (hàng 151–155 trên baseline 187) -> nâng chân người 27.
    id: 'EN_PH_BUFFALO', w: 64, h: 36, chargeOnly: true,
    tameable: { speed: 300, time: 5, damage: 3, rideTop: 27, anims: { ride: 'ride' } },
    anims: { move: 'charge', idle: 'charge', blocked: 'blocked' },
    hitMessage: 'Bạn bị trâu húc trúng!', tameMessage: 'Đã thu phục trâu mộng!'
  },
  saltCart: {
    id: 'OB_PH_SALT_CART', w: 46, h: 28, blocking: true, pushable: { speed: .45, damage: 2 },
    anims: { idle: 'roll', death: 'break' }, durations: { idle: Infinity }
  },
  barrier: {
    id: 'OB_PH_FENCE', w: 28, h: 36, blocking: true, rammable: true,
    anims: { idle: 'idle', death: 'break' }, breakMessage: 'Đã húc đổ rào chắn!'
  }
};
// Bù nhìn nhử hổ (engine makeDecoy): cao 40 logic theo sprite.
export const SCARECROW = { sprite: 'OB_PH_SCARECROW', w: 18, h: 40 };

// Vật phẩm phụ (PH-ENGINE E6). Sprite Vũ Khí Thô Sơ có ở PH_ART_02, tới lúc đó vẽ hộp dự phòng.
export const EXTRA_ITEMS = {
  weapon: { sprite: 'ITEM_PH_WEAPON', fps: 8, picked: (count, total) => `Đã thu thập Vũ Khí Thô Sơ ${count}/${total}` }
};

// Layout thử `?layout=engine` (PH-ENGINE), mỗi chunk một cơ chế. PLACEHOLDER.
//   chunk 1: bao cát + lính `chargeOnly`; 2: hổ + 2 bù nhìn; 3: trâu + 3 lính + rào;
//   4: xe đẩy + 2 lính + khe hố; 5: hào chông 160 px; 6: NPC khoá 1 sách + 1 vũ khí.
export const ENGINE_TEST = {
  sandbag: [1, 360], shieldGuard: [1, 560],
  tiger: [2, 600], tigerSpan: [2, 180, 740], decoys: [[2, 300], [2, 480]],
  buffalo: [3, 680], buffaloTrigger: 440, soldiers: [[3, 300], [3, 400], [3, 500]], barrier: [3, 590],
  cart: [4, 200], cartGuards: [[4, 340], [4, 420]],
  hole: ['##################################.....#########'],
  spikes: ['####################^^^^^^^^^^##################'],
  book: [6, 200, 56], weapon: [6, 320, 56], npc: [6, 560]
};
export const PROJECTILE_SPRITES = {
  crossbowBolt: { id: 'PJ_CROSSBOW_BOLT', anim: 'idle', w: 12, h: 3 }
};
// NPC: Phùng Hưng dẫn màn 1; 3 NPC màn 2 thêm ở PH-L2.
const NPC_ANIMS = { idle: 'idle', talk: 'talk' };
export const NPC_SPRITES = {
  phungHung: { id: 'NPC_PHUNG_HUNG', portrait: 'PORTRAIT_PHUNG_HUNG', anims: NPC_ANIMS }
};
// Bình hồi máu (chương 3) — chưa có quân nào rơi.
export const PICKUPS = { heal: { id: 'ITEM_LND_HEAL', anim: 'idle' } };

// ---- Phần thưởng màn 2 (id khớp seed backend/migrations/011_phung_hung.sql) ----
// Tên theo docs/SUTA_PH_TASK_00.md §3.4 (duyệt 09/11/2026); cơ chế ở PH-L3.
export const REWARD_NAMES = {
  BUFF_PH_POWER: 'Sức Địch Ngàn Người',
  SK_PH_SUPPLY_CUT: 'Khóa Lương',
  SK_PH_FIRE_DRUM: 'Hỏa Trận Trống Đồng'
};

// ---- Câu chữ thông báo dùng trong engine (CHAPTER.text) ----
export const TEXT = {
  obstacleHit: 'Hãy nhảy hoặc lướt qua chướng ngại vật.',
  trapHit: 'Bạn va vào bẫy!',
  fell: 'Bạn rơi xuống hố và mất 1 máu.',
  hazardHit: 'Bạn va phải quân Đường!',
  hazardDefeated: 'Đã hạ chướng ngại vật!',
  projectileHit: 'Bạn trúng đòn của quân Đường!',
  bossContact: 'Quân Đường phản công!',
  bossDefeated: 'Đã đánh bại quân Đường!',
  bossBlocksFinish: 'Hãy hạ mãnh hổ và lính gác ải trước.',
  gateGuardBlock: 'Lính gác không hề hấn. Hãy đẩy xe húc chúng!',
  rest: 'Nghỉ chân: hồi 1 máu.',
  itemPicked: (count, total) => `Đã thu thập Quyển Sách Tinh Hoa ${count}/${total}`,
  itemsMissing: count => `Bạn còn thiếu ${count} Quyển Sách Tinh Hoa.`,
  rescueHint: name => `Hãy hạ quân Đường đang vây ${name}!`,
  chargeHint: 'Đòn thường bị gạt! Giữ J rồi thả để tung đòn gồng.',
  spikeFell: 'Bạn rơi xuống hào chông và mất 1 máu.',
  npcLocked: (requires, have, extras) => `Cần ${requires} Quyển Sách Tinh Hoa (đã có ${have})${extras?.weapon ? ` và ${extras.weapon} Vũ Khí Thô Sơ` : ''}.`
};
