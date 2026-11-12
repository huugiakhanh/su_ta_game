// Hằng số RIÊNG chương Ngô Quyền (chương 7) — không chứa logic. Hằng số chung
// mọi chương ở engine/config.js. Mọi toạ độ/kích thước/tốc độ là pixel logic.
//
// NQ-L1 (docs/SUTA_NQ_TASK_L1_01.md): asset riêng `images/ngo-quyen/` (đợt
// NQ_ART_01, IN_GAME 12/11/2026); trời, tile, bia câu hỏi của chương 1, sách của
// chương 2, đồi xa + nước sông của chương 3 qua BORROWED_MAPS. Màn 2–3 vẫn là
// khung NQ-SKELETON (PLACEHOLDER tới NQ-L3). Màn 2 thật (NQ-L2,
// docs/SUTA_NQ_TASK_L2_01.md, asset đợt NQ_ART_02). Không import file nào của
// chương 1–6. Mọi số DESIGN_BASELINE.

import { CHUNK_W } from '../../engine/config.js';

// ---- Asset ----
export const SPRITE_ROOT = '/static/assets/images/ngo-quyen/sprites-32bit/';
export const SPRITE_MANIFEST_FILE = 'manifest_nq.json';
export const MAP_ROOT = '/static/assets/images/ngo-quyen/maps-32bit/';
export const MAP_MANIFEST_FILE = 'maps_nq.json';
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
  ids: ['BG_LND_FAR_MIDLANDS', 'PROP_LND_RIVER_WATER']
}];
// Mặt nước khe sông `'~'` (ảnh nước PROP_LND_RIVER_WATER: 6 hàng trên trong suốt).
// `waterLift` −2 -> mặt nước thấp hơn mép bờ 8 px (NQ-L1): boong thuyền ở
// GROUND_Y + 2 (bước thẳng từ bờ lên thuyền) mà thân thuyền vẫn nổi trên nước;
// chương 3–4 nâng nước +6 vì thuyền ở đó không chở người.
export const TILES = {
  ground: 'TILESET_TT_GROUND', groundRegion: 'Z1', terrain: 'TILESET_TT_TERRAIN',
  water: 'PROP_LND_RIVER_WATER', waterLift: -2, waterDeep: '#56341f',
  // Bãi triều lúc nước ròng (NQ-L2): tile 64×16, đỉnh ở GROUND_Y.
  flat: 'PROP_NQ_TIDAL_FLAT', flatLift: 0
};
// Mặt nước dưới GROUND_Y bao nhiêu px (= 6 hàng trống của ảnh nước − waterLift).
export const WATER_SURFACE = 8;
export const FAR_HILLS = { id: 'BG_LND_FAR_MIDLANDS', parallax: 0.2, bottomY: 230, hiddenUnderSky: [] };

// Ảnh DOM riêng chương (chân dung).
export const PORTRAITS = [
  'PORTRAIT_NGO_QUYEN', 'PORTRAIT_KIEU_CONG_TIEN',
  'PORTRAIT_DUONG_DINH_NGHE', 'PORTRAIT_KIEU_CONG_HAN', 'PORTRAIT_NGO_XUONG_NGAP'
];

// Sprite canvas mỗi màn cần (chỉ nạp ảnh màn đang chơi dùng). ITEM_LND_HEAL ở mọi
// màn: engine drawPickups tra ảnh bình máu mỗi frame kể cả khi chưa có bình nào.
// Màn 1 nạp thêm bộ cọc + bè lưới cho layout thử `?layout=engine`.
const STAKE_SPRITES = ['EN_NH_NET_RAFT', 'PJ_NQ_NET', 'OB_NQ_STAKE_PILE', 'OB_NQ_STAKE_SPOT', 'OB_NQ_HIDDEN_STAKE'];
export const LEVEL_SPRITES = {
  1: ['NPC_NGO_QUYEN', 'EN_NQ_KCT_SPEARMAN', 'EN_NQ_KCT_ARCHER', 'EN_KIEU_CONG_TIEN', 'OB_NQ_BOAT', 'FX_NQ_WHIRLPOOL',
    'FX_NQ_GUST', 'OB_NQ_WIND_ROCK', 'EN_CROCODILE', 'OB_BOULDER', 'PJ_SPEAR', 'PJ_CROSSBOW_BOLT', 'ITEM_LND_HEAL', ...STAKE_SPRITES],
  2: ['NPC_DUONG_DINH_NGHE', 'NPC_KIEU_CONG_HAN', 'NPC_NGO_XUONG_NGAP', 'EN_NH_SOLDIER', 'EN_NQ_KCT_SPEARMAN',
    'OB_NQ_BOAT', 'OB_NQ_FIRE_BOAT', 'EN_CROCODILE', 'FX_NQ_GUST', 'OB_NQ_WIND_ROCK', 'ITEM_LND_HEAL', ...STAKE_SPRITES],
  3: ['EN_NQ_KCT_SPEARMAN', 'ITEM_LND_HEAL']
};

// URL trang từng màn (route ở backend/routes/pages.py).
export const LEVEL_URLS = {
  1: '/gameplay/levels/ngo-quyen',
  2: '/gameplay/levels/ngo-quyen/2',
  3: '/gameplay/levels/ngo-quyen/3'
};

// ---- Màn 1 "Hành quân ra Bắc" (NQ-L1, docs/SUTA_NQ_TASK_L1_01.md) ----
// 12 chunk, 3 vùng: bến Ái Châu 1–3, đường ra Bắc 4–8, ngoài Đại La 9–12. Cổng Đại La là đích.
export const LEVEL1_CHUNKS = 12;
export const LEVEL1_ZONES = [
  { id: 'NQ1', x0: 0, x1: CHUNK_W * 3, sky: 'BG_TT_SKY_DAY', mid: 'BG_NQ_MID_AI_CHAU_RIVER' },
  { id: 'NQ2', x0: CHUNK_W * 3, x1: CHUNK_W * 8, sky: 'BG_TT_SKY_DAY', mid: 'BG_NQ_MID_NORTH_ROAD' },
  { id: 'NQ3', x0: CHUNK_W * 8, x1: CHUNK_W * LEVEL1_CHUNKS, sky: 'BG_TT_SKY_DAY', mid: 'BG_NQ_MID_DAI_LA_OUTSKIRTS' }
];
export const LEVEL1_FINISH_X = CHUNK_W * 11 + 618;
export const FINISH_GATE = { closed: 'PROP_NQ_DAI_LA_GATE', open: 'PROP_NQ_DAI_LA_GATE_OPEN', worldX: LEVEL1_FINISH_X, sink: 0 };
// Ngô Quyền đứng chờ ở chunk 1 (NPC dẫn màn).
export const GUIDE_LOCAL_X = 190;
// Tâm 2 ô đặt nhóm xáo trong mỗi chunk xáo (lệch ±SLOT_JITTER).
export const SLOTS = { a: 210, b: 600 };
export const SLOT_JITTER = 60;
// Khe sông (48 cột × 16 px mỗi chunk, `~` = nước). Nhảy tối đa ~115 px, nhảy +
// lướt ~195 px (đo NQ-L1) -> khe 1 (176 px) qua được không cần thuyền, khe 2–4 phải đi thuyền.
//   khe 1 chunk 1 cột 24–34 (x 384–560)  — tập lái;
//   khe 2 chunk 2 cột 10–37 (x 160–608)  — sách treo giữa sông;
//   khe 3 chunk 3 cột 6–41  (x 96–672)   — xoáy giữa dòng, 2 thuyền 2 bên;
//   khe 4 chunk 5 cột 14–33 (x 224–544)  — cá sấu.
export const RIVERS = [
  { chunk: 1, rows: ['########################~~~~~~~~~~~#############'] },
  { chunk: 2, rows: ['##########~~~~~~~~~~~~~~~~~~~~~~~~~~~~##########'] },
  { chunk: 3, rows: ['######~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~######'] },
  { chunk: 5, rows: ['##############~~~~~~~~~~~~~~~~~~~~##############'] }
];
// Các điểm cố định màn 1 ([chunk, localX]; sách [chunk, localX, độ cao trên mặt đất]).
export const LEVEL1 = {
  // Thuyền đậu sát mép trái mỗi khe (tâm thuyền); khe 3 có thêm thuyền phía bên kia xoáy.
  boats: [[1, 418], [2, 194], [3, 130], [3, 440], [5, 258]],
  whirl: [3, 384],
  crocodile: [5, 400],
  // 2 vùng gió lệch nhịp, mỗi vùng có 1 đá nấp ở giữa.
  gusts: [[6, 250, 0], [6, 560, 1.6]],
  rocks: [[6, 250], [6, 560]],
  boulders: [[8, 520], [8, 760]],
  spearmen: [[9, 300], [9, 560]],
  ramparts: [[10, 260], [10, 560]],
  escorts: [[11, 520], [11, 660]],
  kct: { at: [12, 300], hp: 8, patrol: 120, itemLift: 40 },
  // Kiều Công Tiễn lên tiếng khi người chơi vượt mốc này.
  kctTalk: [11, 420],
  // 3 sách cố định + sách từ cung thủ thứ 2 + sách Kiều Công Tiễn giữ.
  books: [[2, 384, 70], [5, 680, 40], [7, 400, 60]],
  bookLift: 40,
  rest: [7, 40],
  // Câu hướng dẫn (1 lần mỗi câu, theo thứ tự x).
  tips: [
    [1, 300, 'Đứng lên thuyền, bấm ←/→ để chèo. Nhảy lên bờ khi tới nơi.'],
    [2, 100, 'Sách treo giữa sông! Thôi chèo cho thuyền đứng yên rồi hãy nhảy.'],
    [3, 40, 'Xoáy nước giữa dòng! Đừng chèo vào giữa xoáy — nhảy sang thuyền bên kia.'],
    [5, 140, 'Cá sấu ẩn dưới nước — thấy bọt thì nhảy lên!'],
    [8, 100, 'Đá lăn xuống dốc! Nhảy hoặc lướt qua.'],
    [10, 40, 'Cung thủ trên ụ thành! Nhảy lên rồi ném lao để hạ.']
  ]
};
// Nhóm xáo: chunk 4 và 7, 2 ô mỗi chunk.
export const SHUFFLED_CHUNKS = [4, 7];
// Đá lăn (roller) tới từ phải khi người chơi cách `trigger` px.
export const BOULDER = { speed: -150, trigger: 440, hp: 1 };
// Ụ thành PROP_NQ_RAMPART (ảnh 96×64, mặt ván hàng 32 ảnh = 8 logic từ đỉnh,
// rộng ván x 42–341 ảnh): mặt ụ cao 56 trên đất. Chỉ để vẽ (Q2 — không đứng lên được).
export const RAMPART = { prop: 'PROP_NQ_RAMPART', deck: 56, archerDx: 0, fireInterval: 2.2, fireRange: 240, hp: 1 };
// Vùng nấp gió: phía trái đá (gió thổi sang trái), rộng `w` sát mép đá.
export const SHELTER = { w: 40 };

// ---- Màn 2 "Trận địa cọc ngầm" (NQ-L2, docs/SUTA_NQ_TASK_L2_01.md) ----
// 10 chunk ĐẶT CỐ ĐỊNH, 3 vùng: rừng ven sông + xưởng đẽo cọc 1–3, bãi cửa sông 4–7,
// bến thuyền ta 8–10. 3 NPC khoá 3/6/10 sách; 6 mốc cắm cọc, cần 3.
export const LEVEL2_CHUNKS = 10;
export const LEVEL2_ZONES = [
  { id: 'NQ2A', x0: 0, x1: CHUNK_W * 3, sky: 'BG_TT_SKY_DAY', mid: 'BG_NQ_MID_RIVERSIDE_FOREST' },
  { id: 'NQ2B', x0: CHUNK_W * 3, x1: CHUNK_W * 7, sky: 'BG_TT_SKY_DAY', mid: 'BG_NQ_MID_BACH_DANG_ESTUARY' },
  { id: 'NQ2C', x0: CHUNK_W * 7, x1: CHUNK_W * LEVEL2_CHUNKS, sky: 'BG_TT_SKY_DAY', mid: 'BG_NQ_MID_OUR_DOCK' }
];
export const LEVEL2_FINISH_X = CHUNK_W * 9 + 700;
// Địa hình (48 cột × 16 px): `,` bãi triều (lộ lúc nước ròng), `~` sông.
//   chunk 4 bãi cột 12–35 (x 192–576, 384 px) — 2 mốc;
//   chunk 5 sông cột 10–37 (x 160–608, 448 px) — thuyền, bè lưới, 2 cọc ngầm;
//   chunk 6 bãi cột 14–33 (x 224–544, 320 px) — 2 mốc;
//   chunk 7 bãi cột 4–19 (x 64–320, 256 px) — 2 mốc; khe cột 28–37 (x 448–608, 160 px) — cá sấu;
//   chunk 8 sông cột 10–37 (x 160–608) — thuyền, thuyền hỏa công.
export const LEVEL2_TERRAIN = [
  { chunk: 4, rows: ['############,,,,,,,,,,,,,,,,,,,,,,,,############'] },
  { chunk: 5, rows: ['##########~~~~~~~~~~~~~~~~~~~~~~~~~~~~##########'] },
  { chunk: 6, rows: ['##############,,,,,,,,,,,,,,,,,,,,##############'] },
  { chunk: 7, rows: ['####,,,,,,,,,,,,,,,,########~~~~~~~~~~##########'] },
  { chunk: 8, rows: ['##########~~~~~~~~~~~~~~~~~~~~~~~~~~~~##########'] }
];
// Thủy triều: ròng 8 s (đủ vác cọc từ đống ra 2 mốc gần) -> báo 2 s -> lớn 6 s -> báo
// 2 s. `rise` 0: mặt sông không hạ (bè, thuyền lửa, cọc ngầm đặt theo mặt nước cố định).
export const LEVEL2_TIDE = { low: 8, warn: 2, high: 6, rise: 0 };
export const LEVEL2_STAKES_REQUIRED = 3;
// NPC: [chunk, localX, số sách cần, art lính vây]. Dương Đình Nghệ là cảnh hồi
// tưởng năm 937 -> lính vây là quân Kiều Công Tiễn (Q2); 2 NPC sau quân Nam Hán.
export const LEVEL2_NPCS = {
  duongDinhNghe: [2, 560, 3, 'normal'],
  kieuCongHan: [3, 560, 6, 'nh'],
  ngoXuongNgap: [10, 560, 10, 'nh']
};
// 2 lính vây mỗi NPC: tâm lệch `dx`, tuần trong [patrol] so với tâm NPC (như PH màn 2).
export const CAPTORS = [{ dx: -100, patrol: [-170, -30] }, { dx: 48, patrol: [-60, 80] }];
// Điểm đặt [chunk, localX]; sách [chunk, localX, độ cao trên mặt đất].
export const LEVEL2 = {
  // Sách: 2 + 1 trước Dương Đình Nghệ, 3 trước Kiều Công Hãn, 4 trước Ngô Xương Ngập.
  books: [[1, 300, 56], [1, 560, 56], [2, 120, 56], [3, 60, 56], [3, 150, 56], [3, 230, 56],
    [5, 400, 70], [6, 700, 56], [8, 400, 70], [9, 430, 56]],
  soldiers: [[1, 440], [9, 300], [9, 560]],
  // Đống cọc (Q3): sau Kiều Công Hãn + đầu chunk 6.
  piles: [[3, 710], [6, 100]],
  stakeSpots: [[4, 280], [4, 480], [6, 300], [6, 470], [7, 130], [7, 260]],
  boats: [[5, 194], [8, 194]],
  raft: [5, 520],
  hiddenStakes: [[5, 280], [5, 310]],
  // Thuyền hỏa công: xuất phát ở mép phải khe chunk 8, trôi sang trái hết lòng sông.
  // 150 px/s (đo NQ-L2): cú nhảy tại chỗ trên thuyền bay 0,7 s -> thuyền lửa (52 px)
  // lọt dưới chân nếu nhảy lúc nó cách ≤ 25 px; 70 px/s thì không nhảy tránh được.
  fireBoat: { at: [8, 570], speed: -150, travel: 420, gap: 3, triggerRange: 420 },
  gust: [6, 650, 0],
  crocodile: [7, 528],
  rest: [9, 100],
  tips: [
    [3, 640, 'Đống cọc gỗ bịt sắt! Chạm vào để vác một cọc.'],
    [4, 120, 'Nước ròng lộ bãi bùn: cắm cọc vào mốc. Nước lên thì rời bãi ngay!'],
    [5, 120, 'Thuyền do thám Nam Hán quăng lưới! Trúng lưới sẽ bị khựng.'],
    [8, 100, 'Thuyền lửa trôi xuôi dòng! Nhảy tránh.']
  ]
};

// ---- Màn 3 "Đại thắng Bạch Đằng" — PLACEHOLDER, thay ở NQ-L3 ----
// Đấu trường 1 chunk, 3 đợt lính ra từ mép phải; hết đợt 3 + hết quân thì thắng.
export const ARENA = { width: CHUNK_W, playerStartX: 170, spawnX: CHUNK_W - 60, edge: 40 };
export const LEVEL3_ZONES = [
  { id: 'NQ3', x0: 0, x1: ARENA.width, sky: 'BG_TT_SKY_DAY', mid: 'BG_NQ_MID_AI_CHAU_RIVER' }
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
  level1Spots: [[2, 690], [4, 400], [7, 720], [10, 720]],
  level2Spots: { duongDinhNghe: [2, 280], kieuCongHan: [3, 330], ngoXuongNgap: [10, 280] }
};

// ---- Môi trường ----
export const OBSTACLE_TYPES = {};
// Quyển Sách Tinh Hoa — sprite chương 2 (strip 4 ô 16×16 logic).
export const ITEM = { sprite: 'ITEM_BT_TINH_HOA', fps: 8 };
export const QUIZ_STELE_ID = 'PROP_TT_QUIZ_STELE';
export const MAP_PROPS_IN_GAME = [ITEM.sprite, QUIZ_STELE_ID, TILES.water, TILES.flat, RAMPART.prop, FINISH_GATE.closed, FINISH_GATE.open];

// ---- Quân địch, hazard, đạn ----
// Lính giáo dài EN_NQ_KCT_SPEARMAN (ô 48×48, attack_01 frame_w 128): sọ→chân 34;
// mũi giáo ô hit 4 cách pivot +44,5 (33,5 ngoài mép hộp 22), cao 21,75 trên chân
// = 12 từ đỉnh hộp 34 -> hộp đâm Y 10, cao 9.
export const SOLDIER = { w: 22, h: 34, hp: 2 };
export const GUARD = {
  patrolRange: 96, speed: 34, aggroRange: 150,
  attackReach: 34, attackBoxY: 10, attackBoxH: 9, attackCooldown: 1.4, damage: 1
};
// Kiều Công Tiễn EN_KIEU_CONG_TIEN (ô 64×64, attack_01 frame_w 160): sọ→chân ~44;
// mũi thương ô hit 4 cách pivot +60 (45 ngoài mép hộp 30), cao 29,5 trên chân
// = 14,5 từ đỉnh hộp 44 -> hộp đâm Y 10, cao 10.
export const KCT = { w: 30, h: 44 };
export const KCT_GUARD = {
  patrolRange: 200, speed: 26, aggroRange: 170,
  attackReach: 45, attackBoxY: 10, attackBoxH: 10, attackCooldown: 1.8, damage: 1
};
// Lính đao Nam Hán EN_NH_SOLDIER (ô 48×48, attack_01 frame_w 128): sọ→chân ~34;
// mũi đao ô hit 4 cách pivot +40,25 (29 ngoài mép hộp 22), cao 19,6 trên chân
// = 14 từ đỉnh hộp 34 -> hộp chém Y 10, cao 10 (report NQ_ART_02).
export const NH_GUARD = { ...GUARD, attackReach: 40, attackBoxY: 10, attackBoxH: 10 };
const SPEAR_ANIMS = { idle: 'idle', walk: 'walk', attack: 'attack_01', hurt: 'hurt', death: 'death' };
const SOLDIER_ART = {
  id: 'EN_NQ_KCT_SPEARMAN', behavior: 'guard', anims: SPEAR_ANIMS,
  attackMessage: 'Bạn bị lính Kiều Công Tiễn đâm trúng!', contactMessage: 'Bạn va phải lính Kiều Công Tiễn!'
};
export const ENEMY_SPRITES = {
  normal: { ...SOLDIER_ART, rules: GUARD, defeatMessage: 'Đã hạ lính Kiều Công Tiễn.' },
  // Mini-boss (Q1 — như đội trưởng chương 4): `plungeOnly` gạt đòn chém ngang,
  // chỉ đòn bổ và lao ném trúng được.
  kct: {
    id: 'EN_KIEU_CONG_TIEN', behavior: 'guard', rules: KCT_GUARD, plungeOnly: true,
    anims: { ...SPEAR_ANIMS, blocked: 'blocked' },
    attackMessage: 'Bạn bị Kiều Công Tiễn đâm trúng!', contactMessage: 'Bạn va phải Kiều Công Tiễn!'
  },
  // Màn 2: lính Nam Hán (đi tuần + vây 2 NPC sau).
  nh: {
    id: 'EN_NH_SOLDIER', behavior: 'guard', rules: NH_GUARD, anims: SPEAR_ANIMS,
    attackMessage: 'Bạn bị lính Nam Hán chém trúng!', contactMessage: 'Bạn va phải lính Nam Hán!',
    defeatMessage: 'Đã hạ lính Nam Hán.'
  },
  // Màn 3: lính đấu trường đuổi khắp đấu trường.
  arena: { ...SOLDIER_ART, rules: { ...GUARD, speed: 70, aggroRange: CHUNK_W }, defeatMessage: 'Đã đánh bại lính giặc.' }
};
export const HAZARD_SPRITES = {
  // NQ-ENGINE E1: thuyền OB_NQ_BOAT (ô 64×24, boong hàng ảnh 46 = 12,5 logic trên đáy).
  boat: {
    id: 'OB_NQ_BOAT', w: 64, h: 16, ride: { top: 4, inset: 6 }, boat: { speed: 140, drag: 3 },
    anims: { idle: 'idle', move: 'move' }
  },
  // Xoáy: bán kính 48 (NQ-L1 đo: 64 thì cú nhảy từ thuyền A sang B qua xoáy chỉ
  // vừa chạm mép boong) — thuyền B đậu ngoài tầm kéo ở +56.
  whirl: { id: 'FX_NQ_WHIRLPOOL', w: 40, h: 8, radius: 48, core: 10, pull: 70, anims: { idle: 'idle' } },
  gust: {
    id: 'FX_NQ_GUST', w: 256, h: 90, dir: -1, force: 120, cycle: { off: 1.6, warn: .8, active: 1.6 },
    anims: { idle: 'idle', warn: 'warn', active: 'active' }
  },
  // Đá chắn gió OB_NQ_WIND_ROCK: khối 28×36 logic (bbox ảnh 112×144).
  shelterRock: { id: 'OB_NQ_WIND_ROCK', w: 28, h: 36, anims: { idle: 'idle' } },
  // Cá sấu EN_CROCODILE: số đo chương 4 (hộp đớp 46×20).
  crocodile: {
    id: 'EN_CROCODILE', w: 46, h: 20, warnTime: .6, upTime: 1, diveTime: .3, leap: 56,
    anims: { warn: 'warn', attack: 'attack', dive: 'dive', death: 'death' },
    hitMessage: 'Cá sấu đớp trúng bạn!', breakMessage: 'Đã hạ cá sấu!'
  },
  boulder: {
    id: 'OB_BOULDER', w: 18, h: 18, anims: { move: 'roll', idle: 'roll', death: 'break' },
    hitMessage: 'Bạn bị đá lăn trúng!', breakMessage: 'Đá tảng vỡ tan!'
  },
  // Cung thủ trên ụ (thrower đứng cao): tay nhả ô 5 ở +15,75; 20 trên chân.
  archer: {
    id: 'EN_NQ_KCT_ARCHER', w: 20, h: 34, muzzle: 20, muzzleX: 15.75,
    anims: { idle: 'idle', throw: 'throw', hurt: 'hurt', death: 'death' },
    hitMessage: 'Bạn va phải cung thủ!', breakMessage: 'Đã hạ cung thủ!'
  },
  // ---- Cọc + quân thủy Nam Hán (NQ_ART_02, NQ-L2) ----
  // Cọc ngầm OB_NQ_HIDDEN_STAKE (ô 16×24, cọc cao 20): chỉ nguy hiểm lúc nước ròng.
  hiddenStake: { id: 'OB_NQ_HIDDEN_STAKE', w: 10, h: 20, tideOnly: 'low', damage: 1, anims: { idle: 'idle' }, hitMessage: 'Bạn va phải cọc ngầm!' },
  // Đống cọc OB_NQ_STAKE_PILE (ô 32×24): chạm khi tay không thì vác 1 cọc (vô hạn).
  stakePile: { id: 'OB_NQ_STAKE_PILE', w: 30, h: 20, burdenSource: {}, anims: { idle: 'idle' } },
  // Bè quăng lưới EN_NH_NET_RAFT (ô 96×48, lưới rời tay ô 5): hộp là lính đứng giữa bè.
  netRaft: {
    id: 'EN_NH_NET_RAFT', w: 20, h: 34, muzzle: 26, anims: { idle: 'idle', throw: 'throw', hurt: 'hurt', death: 'death' },
    hitMessage: 'Bạn va phải lính Nam Hán!', breakMessage: 'Đã hạ thuyền do thám Nam Hán!'
  },
  // Thuyền hỏa công OB_NQ_FIRE_BOAT (ô 64×32): kind `drift` trôi trong khe sông.
  fireBoat: { id: 'OB_NQ_FIRE_BOAT', w: 52, h: 18, anims: { move: 'move', idle: 'move' }, hitMessage: 'Bạn bị thuyền lửa thiêu trúng!' }
};
export const PROJECTILE_SPRITES = {
  crossbowBolt: { id: 'PJ_CROSSBOW_BOLT', anim: 'idle', w: 12, h: 3, hitMessage: 'Bạn trúng tên!' },
  // Lưới quăng từ bè (NQ-ENGINE E6): vòng cung, trúng thì choáng, không mất máu.
  net: { id: 'PJ_NQ_NET', anim: 'idle', w: 16, h: 10, lob: { flightTime: .9, gravity: 700 }, stun: 1, damage: 0, hitMessage: 'Bạn bị lưới chụp trúng!' }
};
// Lao ném (engine carry.js): lính Kiều Công Tiễn ở vùng Đại La rơi 1 lao. Bay
// THẲNG (người dùng chơi thử 12/11: bỏ vòng cung) — `gravity` 0 nên engine cho lao
// đi một đường thẳng từ tay tới đất cách `range` px (dốc xuống rất ít). Ném từ đất
// thì lao bay ngang tầm thân lính; cung thủ trên ụ (thân 56–90 trên đất) phải
// nhảy lên rồi ném.
export const CARRY = {
  javelin: {
    sprite: 'PJ_SPEAR', anim: 'idle', w: 22, h: 4, pickup: { w: 22, h: 22, life: 12 },
    range: 320, flightTime: .55, gravity: 0, damage: 1
  }
};
// Lính rơi lao khi bị hạ ở vùng này trở đi (x world).
export const JAVELIN_FROM_X = CHUNK_W * 8;
// Đòn bổ (TQP-ENGINE E5) — số chương 4.
export const PLUNGE = { speed: 280, forward: 260 };

// ---- Layout thử `?layout=engine` (NQ-ENGINE) ----
//   chunk 1: bến + thuyền trong khe sông 320 px + xoáy nước;
//   chunk 2: 2 vùng gió lệch nhịp + 2 đá chắn;
//   chunk 3: bãi triều 192 px + khe sông + thuyền thứ 2 + 2 cọc ngầm theo triều;
//   chunk 4: đống cọc + 3 mốc trên bãi triều (cần 2);
//   chunk 5: bè quăng lưới (đặt trên đất để thử) + 1 lính giáo.
// Triều chu kỳ ngắn để thử nhanh.
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
  netRaft: [5, 620],
  soldier: [5, 320]
};
// Thuyền nổi: đáy ảnh chìm `BOAT_FLOAT` px dưới mặt đất -> boong cao GROUND_Y + 2.
export const BOAT_FLOAT = 14;
// Mốc cắm cọc OB_NQ_STAKE_SPOT (engine CHAPTER.stakes; anim spot = mốc vải, planted = cọc cao 27,75).
export const STAKES = { sprite: 'OB_NQ_STAKE_SPOT', w: 8, h: 28 };
// Strip vác cọc riêng (manifest_shared.json, NQ_ART_02) — engine L2-E1.
export const BURDEN_ANIMS = { idle: 'stake_idle', run: 'stake_run' };
const NPC_ANIMS = { idle: 'idle', talk: 'talk' };
export const NPC_SPRITES = {
  ngoQuyen: { id: 'NPC_NGO_QUYEN', portrait: 'PORTRAIT_NGO_QUYEN', anims: NPC_ANIMS },
  // Màn 2. Dương Đình Nghệ hồi tưởng năm 937: vẽ xám mờ (engine L2-E2).
  duongDinhNghe: { id: 'NPC_DUONG_DINH_NGHE', portrait: 'PORTRAIT_DUONG_DINH_NGHE', anims: NPC_ANIMS, memorial: true },
  kieuCongHan: { id: 'NPC_KIEU_CONG_HAN', portrait: 'PORTRAIT_KIEU_CONG_HAN', anims: NPC_ANIMS },
  ngoXuongNgap: { id: 'NPC_NGO_XUONG_NGAP', portrait: 'PORTRAIT_NGO_XUONG_NGAP', anims: NPC_ANIMS }
};
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
  fell: 'Bạn rơi xuống nước và mất 1 máu.',
  hazardHit: 'Bạn va phải quân giặc!',
  hazardDefeated: 'Đã hạ chướng ngại vật!',
  projectileHit: 'Bạn trúng đòn của quân giặc!',
  bossContact: 'Kiều Công Tiễn phản công!',
  bossDefeated: 'Đã đánh bại Kiều Công Tiễn!',
  bossBlocksFinish: 'Hãy hạ Kiều Công Tiễn trước.',
  plungeHint: 'Kiều Công Tiễn gạt đòn chém ngang — nhảy lên, đang rơi thì bấm Đánh để bổ xuống, hoặc ném lao!',
  javelinPicked: 'Đã nhặt lao. Bấm Đánh để ném.',
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
