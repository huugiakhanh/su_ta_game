// Hằng số RIÊNG chương Lý Nam Đế (chương 3) — không chứa logic. Hằng số chung
// mọi chương ở engine/config.js. Mọi toạ độ/kích thước/tốc độ là pixel logic.
//
// LND-L1 (docs/SUTA_LND_TASK_L1_01.md): asset riêng chương LND_ART_01 ở
// images/ly-nam-de/ (manifest_lnd.json, maps_lnd.json); mượn map của chương 1
// (trời, tile, làng, đồng lúa, bia câu hỏi) và chương 2 (sách, cổng doanh trại,
// nền màn 2–3 khung) qua BORROWED_MAPS. Không import file nào của chương 1–2.
// LND-L2: màn 2 thật (LND_ART_02). LND-L3 (docs/SUTA_LND_TASK_L3_01.md): trận
// boss Tiêu Tư + 3 kỹ năng + cutscene (LND_ART_03). Mọi số DESIGN_BASELINE.

import { CHUNK_W } from '../../engine/config.js';

// ---- Asset ----
// Manifest là nguồn duy nhất cho frames/fps/loop/hit_frame (density 4,
// pivot bottom-center, quay phải) — không chép số đó vào đây.
export const SPRITE_ROOT = '/static/assets/images/ly-nam-de/sprites-32bit/';
export const SPRITE_MANIFEST_FILE = 'manifest_lnd.json';
export const MAP_ROOT = '/static/assets/images/ly-nam-de/maps-32bit/';
export const MAP_MANIFEST_FILE = 'maps_lnd.json';
// Asset map mượn (engine assets.js addBorrowedMaps).
export const BORROWED_MAPS = [{
  root: '/static/assets/images/trung-trac/maps-32bit/',
  manifest: 'maps_tt.json',
  ids: [
    'BG_TT_SKY_DAY', 'BG_TT_MID_VILLAGE', 'BG_TT_MID_FIELDS', 'TILESET_TT_GROUND', 'TILESET_TT_TERRAIN',
    'PROP_TT_QUIZ_STELE'
  ]
}, {
  // Sách, cổng doanh trại (màn 1), đồi xa đồng trũng (màn 2).
  root: '/static/assets/images/ba-trieu/maps-32bit/',
  manifest: 'maps_bt.json',
  ids: ['ITEM_BT_TINH_HOA', 'PROP_BT_CAMP_GATE', 'PROP_BT_CAMP_GATE_OPEN', 'BG_BT_FAR_PLAIN']
}];
// Mặt nước trong khe sông `'~'` (engine render/terrain.js drawWater): ảnh nước
// trống 6 hàng trên -> nâng 6 px cho mặt nước sát mép đất (không hở dải giữa nền
// giữa và nước — người dùng chơi thử 02/11); phần dưới ảnh (22 > 18 hàng nước)
// tô màu hàng đáy của ảnh.
export const TILES = {
  ground: 'TILESET_TT_GROUND', groundRegion: 'Z1', terrain: 'TILESET_TT_TERRAIN', water: 'PROP_LND_RIVER_WATER',
  waterLift: 6, waterDeep: '#56341f'
};
export const FAR_HILLS = { id: 'BG_LND_FAR_MIDLANDS', parallax: 0.2, bottomY: 230, hiddenUnderSky: [] };

// Ảnh DOM — chân dung Lý Bí (dẫn màn 1), 3 NPC màn 2, Tiêu Tư (cutscene màn 3)
// + icon 3 ô kỹ năng màn 3.
export const PORTRAITS = [
  'PORTRAIT_LY_BI', 'PORTRAIT_PHAM_TU', 'PORTRAIT_TINH_THIEU', 'PORTRAIT_TRIEU_TUC', 'PORTRAIT_TIEU_TU',
  'ICON_SK_LND_TO_LICH_SHIELD', 'ICON_SK_LND_SUPPLY', 'ICON_SK_LND_TIDE'
];

// Sprite canvas mỗi màn cần (chỉ nạp ảnh màn đang chơi dùng). Màn 1 gồm cả
// layout thử ?layout=engine. ITEM_LND_HEAL ở mọi màn: engine drawPickups tra
// ảnh bình máu mỗi frame kể cả khi chưa có bình nào (thiếu thì cảnh báo).
export const LEVEL_SPRITES = {
  1: [
    'NPC_LY_BI', 'EN_LUONG_PATROL', 'EN_LUONG_TAXMAN', 'PJ_LEAD_COINS', 'EN_LUONG_WAR_BOAT', 'PJ_FIRE_ARROW',
    'EN_LUONG_ARCHER', 'PROP_LUONG_WATCHTOWER', 'PJ_CROSSBOW_BOLT', 'TR_BAMBOO_NET', 'EN_LUONG_HOUND',
    'OB_TRIBUTE_CART', 'OB_BOULDER', 'EN_LUONG_TRIBUTE_WAGON', 'ITEM_LND_HEAL'
  ],
  2: [
    'NPC_PHAM_TU', 'NPC_TINH_THIEU', 'NPC_TRIEU_TUC', 'EN_LUONG_PATROL', 'EN_LUONG_TAXMAN', 'PJ_LEAD_COINS',
    'EN_LUONG_WAR_BOAT', 'PJ_FIRE_ARROW', 'EN_LUONG_ARCHER', 'PROP_LUONG_WATCHTOWER', 'PJ_CROSSBOW_BOLT',
    'TR_BAMBOO_NET', 'EN_LUONG_HOUND', 'ITEM_LND_HEAL'
  ],
  3: [
    'BOSS_TIEU_TU', 'EN_LUONG_SHIELD_GUARD', 'EN_LUONG_FIRE_CART', 'PROP_LUONG_CATAPULT', 'OB_BOULDER', 'EN_LUONG_PATROL',
    'PJ_BT_GOLD_COIN', 'FX_BT_STUN', 'FX_BT_ARMOR_SPARK', 'FX_LND_TO_LICH_SHIELD', 'FX_LND_TIDE', 'NPC_LY_BI',
    'ITEM_LND_HEAL'
  ]
};

// URL trang từng màn (route ở backend/routes/pages.py).
export const LEVEL_URLS = {
  1: '/gameplay/levels/ly-nam-de',
  2: '/gameplay/levels/ly-nam-de/2',
  3: '/gameplay/levels/ly-nam-de/3'
};

// ---- Màn 1 "Từ quan chiêu binh" (LND-L1) ----
// 12 chunk = 9216 px = stage_length của maps_lnd.json. Vùng cảnh (Q1): đồi trung
// du -> làng (mượn chương 1) -> bờ sông Hồng -> trạm kiểm soát nhà Lương ->
// đồng bằng Giao Châu (đồng lúa mượn chương 1, cổng doanh trại = đích). Nhóm
// chướng ngại xáo trong vùng được phép (level1.js) để đúng cảnh.
export const LEVEL1_CHUNKS = 12;
export const LEVEL1_ZONES = [
  { id: 'LND1', x0: 0, x1: CHUNK_W * 2, sky: 'BG_TT_SKY_DAY', mid: 'BG_LND_MID_MIDLAND_HILLS' },
  { id: 'LND2', x0: CHUNK_W * 2, x1: CHUNK_W * 4, sky: 'BG_TT_SKY_DAY', mid: 'BG_TT_MID_VILLAGE' },
  { id: 'LND3', x0: CHUNK_W * 4, x1: CHUNK_W * 7, sky: 'BG_TT_SKY_DAY', mid: 'BG_LND_MID_RED_RIVER' },
  { id: 'LND4', x0: CHUNK_W * 7, x1: CHUNK_W * 11, sky: 'BG_TT_SKY_DAY', mid: 'BG_LND_MID_LUONG_CHECKPOINT' },
  { id: 'LND5', x0: CHUNK_W * 11, x1: CHUNK_W * LEVEL1_CHUNKS, sky: 'BG_TT_SKY_DAY', mid: 'BG_TT_MID_FIELDS' }
];
// Cổng doanh trại nghĩa quân (mượn chương 2) — tâm tại worldX(12, 618), như
// chương 2; mở khi đủ sách + hạ mini-boss. Chân cột chìm 2 px (như chương 2).
export const LEVEL1_FINISH_X = CHUNK_W * 11 + 618;
export const FINISH_GATE = { closed: 'PROP_BT_CAMP_GATE', open: 'PROP_BT_CAMP_GATE_OPEN', worldX: LEVEL1_FINISH_X, sink: 2 };
// Lý Bí đứng chờ ở chunk 1 (NPC dẫn — như Bà Triệu chương 2).
export const GUIDE_LOCAL_X = 190;
// Mini-boss xe cống phẩm trâu kéo (patrol — Q3): cố định chunk 11, đi tuần
// patrolRange quanh localX, KHÔNG dừng, không ném (fireRange 0), va chạm −1
// máu; 6 đòn; vỡ thì rơi 1 Quyển Sách Tinh Hoa (`itemLift` trên mặt đất).
// 2 lính hộ tống `escorts` (localX) đứng hai bên.
export const MINIBOSS = {
  chunk: 11, localX: 420, hp: 6, patrolRange: 200, speed: 35,
  hitScore: 100, defeatScore: 700, itemLift: 40, escorts: [250, 600]
};
// Bẫy lưới cố định chunk 9 (ngoài 10 nhóm xáo) — đủ 12 chướng ngại.
export const FIXED_NET = { chunk: 9, localX: 480 };
// Nghỉ chân hồi 1 máu (Q4) — 1 lần khi vượt điểm này (đầu trạm kiểm soát).
export const REST = { chunk: 8, localX: 200 };
// 3 Quyển Sách Tinh Hoa cố định [chunk, localX, độ cao trên mặt đất]; 2 quyển
// còn lại nằm trong xe cống phẩm nhỏ và xe trâu mini-boss (Q2).
export const LEVEL1_ITEMS = [[2, 390, 56], [6, 120, 64], [9, 250, 60]];
// Bẫy lưới: treo `dropHeight`, công tắc ẩn rộng `triggerWidth` quanh tâm.
export const NET = { dropHeight: 90, triggerWidth: 24 };
// Thuyền chiến (floatY 10: mớn nước 10 px trên đáy ô -> đúng mặt nước nâng
// TILES.waterLift): lưới địa hình chunk sông (48 cột × 16 px): khe 1 (cột 14–20,
// x 224–336, rộng 112) có thuyền, đất 64, khe 2 (cột 25–35, x 400–576, rộng
// 176) có mỏm đá 64 ở giữa. `boatX` tâm thuyền, `ledge` [localX trái, cao].
export const RIVER = {
  rows: ['##############~~~~~~~####~~~~~~~~~~~############'],
  boatX: 280, floatY: 5, ledge: [456, 15], fireInterval: 2.2
};
// Cung thủ trên tháp canh: tháp tâm localX (xa bia câu hỏi local 560), cung
// thủ đứng cao `deck` trên mặt đất. Ảnh tháp: đáy ô = chân tháp (hàng 447, không
// theo quy ước frame_h − 2), sàn ở hàng ảnh 80 -> mặt sàn cao 91 px so với đáy
// khi vẽ (drawSprite đặt hàng cuối ô tại footY); chân cung thủ (hàng 187) đặt
// ngay trên hàng sàn.
export const TOWER = { localX: 380, deck: 91, fireInterval: 2, fireRange: 260 };

// Câu hỏi chặn đường (điểm + luật ở engine):
//   level1Count  số câu mỗi lượt màn 1 (rút ngẫu nhiên, không trùng).
//   level1Spots  [chunk, localX] — chạm x này thì hỏi (theo thứ tự); không
//                rơi vào khe sông (khe chunk sông ở local 224–576).
//   level2Spots  [chunk, localX] — câu hỏi về NPC sắp gặp (pool cùng tên,
//                thứ tự Phạm Tu -> Tinh Thiều -> Triệu Túc, LND-00 §3.2);
//                chunk 2 sau khe sông (khe tới local 576).
export const QUIZ = {
  level1Count: 4,
  level1Spots: [[3, 312], [5, 680], [8, 560], [10, 560]],
  level2Spots: { phamTu: [2, 680], tinhThieu: [5, 600], trieuTuc: [8, 600] }
};

// ---- Màn 2 "Chiêu mộ hiền tài" (LND-L2) ----
// 9 chunk cố định (Q1): bờ sông Hồng (Phạm Tu — Thanh Trì, cửa sông Tô Lịch)
// -> làng (Tinh Thiều) -> vùng sông nước Chu Diên (cha con Triệu Túc). Đồi xa
// đồng trũng riêng màn (mượn chương 2). Về đích cuối chunk 9 khi đã gặp đủ 3 NPC
// (không cổng, như chương 2).
export const LEVEL2_CHUNKS = 9;
export const LEVEL2_ZONES = [
  { id: 'LND3', x0: 0, x1: CHUNK_W * 3, sky: 'BG_TT_SKY_DAY', mid: 'BG_LND_MID_RED_RIVER' },
  { id: 'LND2', x0: CHUNK_W * 3, x1: CHUNK_W * 6, sky: 'BG_TT_SKY_DAY', mid: 'BG_TT_MID_VILLAGE' },
  { id: 'LND6', x0: CHUNK_W * 6, x1: CHUNK_W * LEVEL2_CHUNKS, sky: 'BG_TT_SKY_DAY', mid: 'BG_LND_MID_CHU_DIEN' }
];
export const LEVEL2_FAR_HILLS = { id: 'BG_BT_FAR_PLAIN', parallax: 0.2, bottomY: 230, hiddenUnderSky: [] };
export const LEVEL2_FINISH_X = CHUNK_W * LEVEL2_CHUNKS - 96;
// Số sách cần để gặp từng NPC màn 2 (engine `requires`) — sách chia 3 / 3 / 4.
export const LEVEL2_NPC_BOOKS = { phamTu: 3, tinhThieu: 6, trieuTuc: 10 };
// 8 Quyển Sách Tinh Hoa cố định [chunk, localX, độ cao trên mặt đất] (DESIGN_BASELINE):
//   ch2, ch7: trên mỏm đá giữa khe sông; còn lại trên đất.
export const LEVEL2_ITEMS = [
  [2, 488, 52], [3, 100, 56],
  [4, 250, 56], [5, 150, 56], [6, 100, 56],
  [7, 488, 52], [8, 450, 64], [9, 100, 56]
];
// Quân mang sách [chunk, localX, loại] — hạ mới rơi sách (`carrier` = id quân).
export const LEVEL2_CARRIERS = [[1, 560, 'soldier'], [8, 300, 'hound']];
// Quân vây NPC (giải cứu): [dx tâm so với tâm NPC, đoạn tuần tra [min, max]].
// Phạm Tu, Tinh Thiều = 1 trái + 1 phải (như engine NPC_RESCUE); cha con Triệu
// Túc (nhóm 2 người rộng ±33) cả 2 lính bên trái, tuần tra tới chỗ người chơi
// bị giữ (holdGap 40).
export const CAPTORS = {
  phamTu: [{ dx: -100, patrol: [-170, -30] }, { dx: 48, patrol: [-60, 80] }],
  tinhThieu: [{ dx: -100, patrol: [-170, -30] }, { dx: 48, patrol: [-60, 80] }],
  trieuTuc: [{ dx: -100, patrol: [-170, -50] }, { dx: -160, patrol: [-230, -50] }]
};

// ---- Màn 3 "Công phá thành Long Biên" (LND-L3) ----
// Đấu trường 1 chunk, nền thành Long Biên (BG_LND_MID_LONG_BIEN): mặt thành
// phẳng ở hàng ảnh 256/640 = `wallTop` px trên đáy ảnh -> y GROUND_Y − wallTop.
// Tiêu Tư + máy bắn đá đứng trên mặt thành ở GĐ 1–2 (chỉ vẽ, không va chạm).
export const ARENA = { width: CHUNK_W, playerStartX: 170, spawnX: 720, wallTop: 96 };
export const LEVEL3_ZONES = [
  { id: 'LND7', x0: 0, x1: ARENA.width, sky: 'BG_TT_SKY_DAY', mid: 'BG_LND_MID_LONG_BIEN' }
];

// Tiêu Tư BOSS_TIEU_TU (ô 48×48; attack_01 frame_w 80): thân thấy được ±11,
// cao 37 -> hitbox 22×36. GĐ 1–2 đứng trên thành tại wallX, `command` mỗi
// commandInterval giây (GĐ 2: commandIntervalP2), ra lệnh ở hit_frame 3.
// GĐ 3 rơi xuống đất (gia tốc fallGravity) rồi thành enemy boss `hp` máu, chạm
// thân vô hại (`passive`). Mũi kiếm attack_01 ô hit 4 cách pivot +32,5, cao
// 24,5 trên chân -> ô chém `sword` [near, reach] × [low, high] trên chân; vung
// khi khoảng mép tới người chơi ≤ swordRange, nghỉ swordCooldown. Xa hơn thì
// `throw` mỗi throwInterval giây; tay ném ô hit 5 cách pivot +20, cao 26,5
// (`hand`). Mỗi `panicEvery` đòn trúng thì `flee` sang đầu kia đấu trường
// (panicSpeed, dừng cách tường panicMargin).
export const BOSS_TT = {
  id: 'BOSS_TIEU_TU', w: 22, h: 36, wallX: 660, commandInterval: 4, commandIntervalP2: 6, startDelay: 2,
  fallGravity: 900, hp: 10, knockback: 10,
  sword: { near: 10, reach: 33, low: 20, high: 29 }, swordRange: 18, swordCooldown: 1.6,
  throwInterval: 2.5, hand: { x: 20, y: 26.5 },
  panicEvery: 3, panicSpeed: 140, panicMargin: 90, defeatScore: 1000
};

// Máy bắn đá PROP_LUONG_CATAPULT (ô 64×48, khung đứng yên): trên thành tại `x`,
// quay về người chơi. `fire` ô hit 5 đá rời rổ tại `release` (+23,5; 43,25 trên
// chân). Đá OB_BOULDER (`roll`, thấy được 18×18, tâm cao `radius` trên chân ô)
// bay vòng cung `flightTime` giây tới vạch báo (x người chơi lúc Tiêu Tư ra
// lệnh), chạm đất phát `break`. Hitbox w×h, trúng −1 máu.
export const CATAPULT = {
  id: 'PROP_LUONG_CATAPULT', x: 540, release: { x: 23.5, y: 43.25 },
  boulder: 'OB_BOULDER', flightTime: 1.1, w: 14, h: 14, radius: 9
};

// Cận vệ khiên sắt EN_LUONG_SHIELD_GUARD (ô 48×48; attack_01 frame_w 128): thân
// ±9, sọ→chân 34 -> hitbox 20×34. `count` lượt, mỗi lượt 1 con ra ở
// ARENA.spawnX, lượt sau `gap` giây sau khi lượt trước ngã. Đi `speed` px/s về
// phía người chơi; KHIÊN chặn đòn chém từ phía đang quay mặt (`blocked` +
// FX_BT_ARMOR_SPARK + gợi ý cách nhau hintInterval). Người chơi sang phía sau
// thì đợi `turnDelay` giây mới quay lại. Mũi thương ô hit 4 cách pivot +53,5,
// cao 32,25 trên chân -> ô đâm `spear` [near, reach] × [low, high]; vung khi
// khoảng mép tới người chơi ≤ attackRange, nghỉ attackCooldown. Xác nằm
// corpseTime giây. Triều Cường đẩy lùi `tidePush` px.
export const SHIELD_GUARD = {
  id: 'EN_LUONG_SHIELD_GUARD', count: 3, w: 20, h: 34, hp: 3, speed: 24, gap: 1.5, startDelay: 1.5,
  turnDelay: .7, attackRange: 38, attackCooldown: 1.8,
  spear: { near: 10, reach: 54, low: 28, high: 36 }, spark: 'FX_BT_ARMOR_SPARK', hintInterval: 4,
  corpseTime: 2, tidePush: 24
};

// Xe hoả công EN_LUONG_FIRE_CART (ô 96×48; xe + lính đẩy thấy được ±42, lửa
// cao 45): hitbox thân xe 80×26 (không tính lửa — nhảy qua được). `count` lượt,
// ra ở ARENA.spawnX, `burn` chạy `speed` px/s về phía người chơi, chạm tường
// quay đầu (ảnh lật theo hướng chạy). Đang cháy: chém bị chặn + gợi ý; chạm thân
// −1 máu. Triều Cường -> `douse` -> `stalled` (đứng yên, vô hại), `hp` đòn ->
// `death`, xác nằm lại. Lượt sau `gap` giây sau khi xe trước vỡ.
export const FIRE_CART = {
  id: 'EN_LUONG_FIRE_CART', count: 2, w: 80, h: 26, hp: 3, speed: 60, gap: 2, startDelay: 1.2, hintInterval: 4
};

// Lính tuần tiễu rải rác GĐ 1–2 (nguồn bình máu — Q4): mỗi `interval` giây ra
// 1 lính ở mép trái (`x`) nếu đang có < `max` lính.
export const ARENA_SOLDIERS = { interval: 9, max: 2, x: 40, startDelay: 5 };

// Bình máu rơi khi hạ lính / cận vệ / xe (hooks.dropHeal): `base`, có buff
// Lương thảo dồi dào thì `supply`. Boss không rơi.
export const HEAL_DROP = { base: .15, supply: .4 };

// Vòng choáng FX_BT_STUN (32×16, tâm vòng ở giữa ô) trên đỉnh đầu người chơi;
// tiền vàng PJ_BT_GOLD_COIN (16×16, xoay 6@18): bay vòng cung tới chỗ người chơi
// sau `flightTime` giây, trúng thì choáng `stun` giây (không mất máu). Đá máy
// bắn đá dùng chung `gravity`.
export const STUN_FX = { id: 'FX_BT_STUN', anim: 'loop', lift: 0 };
export const GOLD_COIN = { id: 'PJ_BT_GOLD_COIN', anim: 'loop', flightTime: 1.1, gravity: 520, w: 8, h: 8, stun: 1.2 };

// Câu thông báo trong trận (LND-L3 §5 — duyệt Q1 02/11/2026; guardContact dùng
// lại câu va chạm lính Lương).
export const BOSS_TEXT = {
  guardHint: 'Khiên sắt chặn phía trước — hãy nhảy qua đầu, chém sau lưng!',
  guardHit: 'Bạn bị cận vệ đâm thương trúng!',
  guardContact: 'Bạn va phải lính Lương!',
  boulderHit: 'Bạn trúng đá máy bắn đá!',
  phase2: 'Tiêu Tư tung xe hoả công!',
  cartHint: 'Lửa quá lớn — hãy gọi Triều Cường (L)!',
  cartHit: 'Xe hoả công lao trúng bạn!',
  phase3: 'Tiêu Tư hoảng loạn nhảy xuống thành!',
  swordHit: 'Bạn trúng kiếm của Tiêu Tư!',
  coinStun: 'Không nhận vàng giặc!'
};

// Cutscene kết chương (giây, px): Tiêu Tư trúng đòn cuối đứng `beatenHold`,
// `bribe` rồi giữ ô cuối `bribeHold` -> cốt truyện câu 1 -> `flee` sang phải
// `fleeSpeed` (camera theo), cách mép phải `fadeBeforeEdge` thì tối dần
// `fadeTime`, sáng lại có Lý Bí trên thành tại `lyBiX` (người chơi về
// `playerX`), `plant_flag` -> cờ PROP_LND_VAN_XUAN_FLAG (ô 24×32, pivot
// bottom-left; vải chỉ ở 12,5 hàng dưới của ô, mép cán x 0) treo từ đầu cán
// ô 8 (+10; 42,5 trên chân) buông dọc cán: pivot đặt tại (+dx; lift trên chân)
// = đầu cán hạ 12,5 (người dùng chơi thử 02/11: neo pivot ở đầu cán thì cờ nằm
// trên cán, tách khỏi cán). Đứng `victoryHold` -> cốt truyện câu 2 -> panel kết chương.
export const LND_CUTSCENE = {
  beatenHold: .8, bribeHold: .8, fleeSpeed: 180, fadeBeforeEdge: 140, fadeTime: .6, lyBiX: 384, playerX: 300,
  victoryHold: 1,
  flag: { id: 'PROP_LND_VAN_XUAN_FLAG', dx: 10, lift: 30 }
};

// Layout thử kỹ năng `?layout=skills` (màn 3): bao cát + 1 cận vệ + 1 xe hoả công
// ra lặp (không boss, không máy bắn đá).
export const SKILL_TEST = { dummyX: 380, dummyHp: 99, respawnGap: 3 };

// ---- Môi trường ----
// Không có vật cản tĩnh (OBSTACLE_TYPES rỗng — chướng ngại màn 1 đều là hazard/lính).
export const OBSTACLE_TYPES = {};
// Quyển Sách Tinh Hoa (mượn chương 2, strip 4 ô 16×16 logic).
export const ITEM = { sprite: 'ITEM_BT_TINH_HOA', fps: 8 };
export const QUIZ_STELE_ID = 'PROP_TT_QUIZ_STELE';
// Mỏm đá giữa sông: bục một chiều 64 px, mặt trên ở hàng 0 của ảnh.
export const ROCK_LEDGE = { sprite: 'PROP_LND_ROCK_LEDGE', w: 64 };
export const MAP_PROPS_IN_GAME = [
  ITEM.sprite, QUIZ_STELE_ID, FINISH_GATE.closed, FINISH_GATE.open, ROCK_LEDGE.sprite, TILES.water,
  LND_CUTSCENE.flag.id
];

// ---- Quân địch, hazard, đạn ----
// Hitbox (w, h) tính từ pivot bottom-center, đo từ strip LND_ART_01 (report
// Codex "Số đo cho code", px logic) — KHÔNG lấy từ cỡ ảnh. DESIGN_BASELINE.
// Lính tuần tiễu EN_LUONG_PATROL (guard): sọ→chân 33,5 -> hitbox 22×34; mũi kích
// ô hit 4 (9@18) cách pivot +60 (49 ngoài mép, trùng lính Ngô chương 2), cao
// 16–24 trên chân = 10–18 px từ đỉnh hitbox.
export const SOLDIER = { w: 22, h: 34, hp: 2 };
export const GUARD = {
  patrolRange: 96, speed: 22, aggroRange: 130,
  attackReach: 49, attackBoxY: 10, attackBoxH: 9, attackCooldown: 1.6, damage: 1
};
// Chó săn EN_LUONG_HOUND (rusher): thân thấy được ~25×18; vùng cắn ô hit 3 cao
// 2,5–5,75 trên chân (12–16 từ đỉnh hitbox), tới +14,75 từ tâm (2 ngoài mép).
export const HOUND = {
  hp: 1, w: 26, h: 18, speed: 150, attackRange: 10,
  attackReach: 4, attackBoxY: 11, attackBoxH: 6, rest: .8, damage: 1
};
export const ENEMY_SPRITES = {
  normal: {
    id: 'EN_LUONG_PATROL', behavior: 'guard', rules: GUARD,
    anims: { idle: 'idle', walk: 'walk', attack: 'attack_01', hurt: 'hurt', death: 'death' },
    attackMessage: 'Bạn bị lính Lương đâm kích trúng!', contactMessage: 'Bạn va phải lính Lương!',
    defeatMessage: 'Đã đánh bại lính Lương.'
  },
  // Không có `idle` riêng: đứng ở ô 1 của `run` (idleHold, như quân cảm tử chương 1).
  hound: {
    id: 'EN_LUONG_HOUND', behavior: 'rusher', rules: HOUND, idleHold: true,
    anims: { idle: 'run', walk: 'run', attack: 'attack_01', death: 'death' },
    attackMessage: 'Chó săn quân Lương cắn trúng bạn!', contactMessage: 'Chó săn quân Lương cắn trúng bạn!',
    defeatMessage: 'Đã hạ chó săn.'
  },
  // ---- Màn 3 (boss.js — enemy `kind` riêng, animation do boss.js đặt) ----
  shieldGuard: {
    id: SHIELD_GUARD.id,
    anims: { idle: 'idle', walk: 'walk', attack: 'attack_01', blocked: 'blocked', hurt: 'hurt', death: 'death' },
    defeatMessage: 'Đã hạ cận vệ khiên sắt.'
  },
  fireCart: {
    id: FIRE_CART.id, anims: { idle: 'burn', burn: 'burn', douse: 'douse', stalled: 'stalled', death: 'death' },
    defeatMessage: 'Xe hoả công vỡ tan!'
  },
  tieuTu: {
    id: BOSS_TT.id,
    anims: { idle: 'idle', attack: 'attack_01', throw: 'throw', hurt: 'hurt', bribe: 'bribe', flee: 'flee' }
  },
  // Bao cát layout thử `?layout=skills` (không asset — hộp tạm + thanh máu).
  dummy: { id: null, anims: {} }
};
export const HAZARD_SPRITES = {
  // Bẫy lưới trúc (snare — LND-ENGINE E3): lưới 40×12 (fall rộng 38,5–40,
  // landed 42,75), báo hiệu `warnTime` giây (bám theo đầu người chơi) rồi rơi,
  // vận tốc đầu `fallSpeed`; trúng −1 máu + trói `stun` giây.
  netTrap: {
    id: 'TR_BAMBOO_NET', w: 40, h: 12, warnTime: .35, fallSpeed: 300, stun: 1,
    anims: { idle: 'idle', warn: 'warn', fall: 'fall', landed: 'landed' },
    springMessage: 'Lưới trúc rung trên đầu!', hitMessage: 'Bạn bị lưới trúc chụp trúng!'
  },
  // Quan thu thuế (thrower): thân ~17×34; tay ném ô hit 5 cách pivot +15,5, cao 29.
  taxman: {
    id: 'EN_LUONG_TAXMAN', w: 18, h: 34, muzzle: 29, muzzleX: 15,
    anims: { idle: 'idle', throw: 'throw', hurt: 'hurt', death: 'death' },
    hitMessage: 'Bạn va phải quan thu thuế!', breakMessage: 'Đã hạ quan thu thuế!'
  },
  // Thuyền chiến (thrower nổi trong khe sông — E1/E2): pivot = mặt đất + floatY
  // (RIVER; mớn nước 10 logic trên đáy ô, nước che phần dưới); điểm phóng ô hit 5
  // cách pivot +33, cao 27,5; hoả tiễn nhắm người chơi. Va thân vô hại
  // (`harmful: false` khi đặt) — chỉ hoả tiễn gây sát thương.
  warBoat: {
    id: 'EN_LUONG_WAR_BOAT', w: 72, h: 28, muzzle: 27.5, muzzleX: 33,
    anims: { idle: 'idle', throw: 'throw' }
  },
  // Cung thủ trên tháp canh (thrower đứng cao — E2): đứng trên sàn tháp (TOWER.deck);
  // điểm phóng ô hit 5 cách pivot +10,75, cao 23; tên nhắm người chơi. Không với
  // tới (không hp).
  towerArcher: {
    id: 'EN_LUONG_ARCHER', w: 20, h: 34, muzzle: 23, muzzleX: 11,
    anims: { idle: 'idle', throw: 'throw' }, hitMessage: 'Bạn va phải cung thủ!'
  },
  // Tháp canh gỗ (hazard `prop` — chỉ vẽ, không va chạm), đặt TRƯỚC cung thủ
  // trong danh sách hazard để vẽ phía sau.
  watchtower: { id: 'PROP_LUONG_WATCHTOWER', w: 28, h: 110, anims: { idle: 'idle' } },
  // Xe chở cống phẩm nhỏ (roller phá được, chở 1 sách — E4a; chép chương 1):
  // vỡ thì xác nằm lại (`corpse`).
  tributeCart: {
    id: 'OB_TRIBUTE_CART', w: 48, h: 38, anims: { move: 'roll', idle: 'roll', death: 'break' }, corpse: true,
    hitMessage: 'Xe cống phẩm lao trúng bạn!', breakMessage: 'Xe cống phẩm vỡ tung!'
  },
  // Đá lở vùng đồi núi (roller có máu — chém vỡ được, hoặc nhảy qua).
  boulder: {
    id: 'OB_BOULDER', w: 18, h: 18, anims: { move: 'roll', idle: 'roll', death: 'break' },
    hitMessage: 'Bạn bị đá lở lăn trúng!', breakMessage: 'Đá tảng vỡ tan!'
  },
  // Mini-boss xe cống phẩm trâu kéo (patrol): bbox ảnh 119,5×53,5 gồm sừng trâu
  // -> hitbox 100×44; vỡ thì xác xe nằm lại (`corpse`).
  tributeWagon: {
    id: 'EN_LUONG_TRIBUTE_WAGON', w: 100, h: 44, corpse: true,
    anims: { move: 'walk', idle: 'idle', hurt: 'hurt', death: 'death' },
    hitMessage: 'Xe cống phẩm húc trúng bạn!', breakMessage: 'Xe cống phẩm của quân Lương vỡ tan!'
  }
};
// Đạn (ảnh quay PHẢI — engine xoay theo góc bay khi `aim`): hitbox nhỏ hơn hình.
export const PROJECTILE_SPRITES = {
  leadCoins: { id: 'PJ_LEAD_COINS', anim: 'loop', w: 8, h: 8 },
  fireArrow: { id: 'PJ_FIRE_ARROW', anim: 'loop', w: 14, h: 4 },
  crossbowBolt: { id: 'PJ_CROSSBOW_BOLT', anim: 'idle', w: 12, h: 3 }
};
// Layout thử `?layout=engine` (màn 1 — LND-ENGINE): mỗi chunk thử một cơ chế mới.
//   snare        bẫy lưới chunk 1 (tâm, độ cao treo, bề ngang công tắc ẩn).
//   river        lưới địa hình chunk 2: 2 khe nước '~' + 1 mỏm đá '#' giữa.
//   ledge        mỏm đá bắc ngang khe thứ 2 [chunk, localX, cao, rộng].
//   boat         [chunk, localX tâm, floatY]; cung thủ [chunk, localX, độ cao đứng].
//   cart         xe chở sách: chunk 4, lăn trái khi người chơi qua triggerLocalX.
//   dropGuards   3 lính chunk 5 — hạ là rơi bình máu (hook dropHeal luôn true ở layout này).
export const ENGINE_TEST = {
  snare: { chunk: 1, localX: 380, dropHeight: 90, triggerWidth: 24 },
  guard: [1, 520],
  // Cột 16–21 nước (x 256–352), 22–29 đất, 30–40 nước (x 480–656) có bục giữa.
  river: ['################~~~~~~########~~~~~~~~~~~#######'],
  ledge: [2, 536, 10, 64],
  boat: [2, 304, 10],
  archer: [3, 520, 92],
  cart: { chunk: 4, localX: 700, speed: -110, triggerLocalX: 260, hp: 2, itemLift: 40 },
  hound: [4, 600],
  dropGuards: [[5, 300], [5, 420], [5, 540]]
};
// NPC: Lý Bí dẫn màn 1; 3 NPC màn 2 (LND_ART_02). NPC_TRIEU_TUC: 2 người trong 1
// ô 96×48 (thấy được ±33 quanh tâm; ảnh gốc Triệu Quang Phục bên trái, Triệu Túc
// — người nói — lệch +24). NPC quay về người chơi (đến từ trái) nên ảnh lật:
// Triệu Túc đứng gần người chơi. `holdGap` 40 -> người chơi dừng ngoài nhóm.
export const NPC_SPRITES = {
  lyBi: { id: 'NPC_LY_BI', portrait: 'PORTRAIT_LY_BI', anims: { idle: 'idle', talk: 'talk' } },
  phamTu: { id: 'NPC_PHAM_TU', portrait: 'PORTRAIT_PHAM_TU', anims: { idle: 'idle', talk: 'talk' } },
  tinhThieu: { id: 'NPC_TINH_THIEU', portrait: 'PORTRAIT_TINH_THIEU', anims: { idle: 'idle', talk: 'talk' } },
  trieuTuc: { id: 'NPC_TRIEU_TUC', portrait: 'PORTRAIT_TRIEU_TUC', anims: { idle: 'idle', talk: 'talk' }, holdGap: 40 }
};
// Bình hồi máu rơi khi hạ quân (engine E4b — CHAPTER.pickups.heal); ống tre
// thuốc 9×12,75 logic.
export const PICKUPS = { heal: { id: 'ITEM_LND_HEAL', anim: 'idle' } };

// ---- Phần thưởng màn 2 (id khớp seed backend/migrations/007_ly_nam_de.sql) ----
// Tên theo docs/SUTA_LND_TASK_00.md §3.4 (duyệt 31/10/2026); cơ chế ở skills.js.
export const REWARD_NAMES = {
  SK_LND_TO_LICH_SHIELD: 'Khiên Tô Lịch',
  BUFF_LND_SUPPLY: 'Lương thảo dồi dào',
  SK_LND_TIDE: 'Triều Cường'
};

// Kỹ năng màn 3 (LND-L3 §3, skills.js). Khiên Tô Lịch (K): FX_LND_TO_LICH_SHIELD
// (ô 32×48) trước mặt `offsetX`, chặn `blocks` đòn hoặc hết `duration` giây thì
// `break`, hồi `cooldown`. Triều Cường (L): FX_LND_TIDE (ô 128×96) ra sau lưng
// người chơi, quét theo hướng mặt `speed` px/s qua hết khung nhìn, hộp trúng
// w×h; lính thường −`damage`, cận vệ −1 xuyên khiên + đẩy lùi, xe đang cháy ->
// douse, Tiêu Tư −`bossDamage`; hồi `cooldown`.
export const SKILLS = {
  SK_LND_TO_LICH_SHIELD: {
    slot: 'skill1', duration: 6, blocks: 3, cooldown: 12, offsetX: 10,
    fx: 'FX_LND_TO_LICH_SHIELD', icon: 'ICON_SK_LND_TO_LICH_SHIELD'
  },
  BUFF_LND_SUPPLY: { slot: null, icon: 'ICON_SK_LND_SUPPLY' },
  SK_LND_TIDE: {
    slot: 'skill2', cooldown: 14, speed: 320, w: 100, h: 70, damage: 2, bossDamage: 1,
    fx: 'FX_LND_TIDE', icon: 'ICON_SK_LND_TIDE'
  }
};

// ---- Câu chữ thông báo dùng trong engine (CHAPTER.text) ----
export const TEXT = {
  obstacleHit: 'Hãy nhảy hoặc lướt qua chướng ngại vật.',
  trapHit: 'Bạn va vào bẫy!',
  fell: 'Bạn rơi xuống sông và mất 1 máu.',
  hazardHit: 'Bạn va phải quân Lương!',
  hazardDefeated: 'Đã hạ chướng ngại vật!',
  projectileHit: 'Bạn trúng đạn của quân Lương!',
  bossContact: 'Quân Lương phản công!',
  bossDefeated: 'Đã đánh bại quân Lương!',
  bossBlocksFinish: 'Hãy phá xe cống phẩm của quân Lương trước khi vào doanh trại.',
  itemPicked: (count, total) => `Đã thu thập Quyển Sách Tinh Hoa ${count}/${total}`,
  itemsMissing: count => `Bạn còn thiếu ${count} Quyển Sách Tinh Hoa.`,
  npcLocked: (need, have) => `Cần ${need} Quyển Sách Tinh Hoa mới gặp được (đang có ${have}).`,
  rescueHint: name => `Hãy hạ quân Lương đang vây ${name}!`
};
