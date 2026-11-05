// Hằng số RIÊNG chương Triệu Việt Vương (chương 4) — không chứa logic. Hằng số
// chung mọi chương ở engine/config.js. Mọi toạ độ/kích thước/tốc độ là pixel logic.
//
// TQP-L1 (docs/archive/SUTA_TQP_TASK_L1_01.md): asset riêng chương TQP_ART_01 ở
// images/trieu-quang-phuc/ (manifest_tqp.json, maps_tqp.json); mượn map chương 1
// (trời, tile, bia câu hỏi), chương 2 (sách, đồi xa) và chương 3 (làng Chu Diên,
// mặt nước, mỏm đá) qua BORROWED_MAPS. Không import file nào của chương 1–3.
// TQP-L2 (docs/archive/SUTA_TQP_TASK_L2_01.md): asset TQP_ART_02 (3 NPC + chân
// dung, rồng vàng, trời đêm, Dạ Trạch đêm, Khuất Lão, nước đầm, bụi lau); đồi
// xa trung du mượn chương 3.
// TQP-L3 (docs/archive/SUTA_TQP_TASK_L3_01.md): asset TQP_ART_03 (Dương Sàn, lính đánh
// thuê, trại Lương đêm, mỏm đất, thuyền độc mộc, FX gáy/sóng đất/đuốc) + FX/icon
// 3 phần thưởng (TQP_ART_02). Mọi số DESIGN_BASELINE.

import { CHUNK_W } from '../../engine/config.js';

// ---- Asset ----
// Manifest là nguồn duy nhất cho frames/fps/loop/hit_frame (density 4,
// pivot bottom-center, quay phải) — không chép số đó vào đây.
export const SPRITE_ROOT = '/static/assets/images/trieu-quang-phuc/sprites-32bit/';
export const SPRITE_MANIFEST_FILE = 'manifest_tqp.json';
export const MAP_ROOT = '/static/assets/images/trieu-quang-phuc/maps-32bit/';
export const MAP_MANIFEST_FILE = 'maps_tqp.json';
// Asset map mượn (engine assets.js addBorrowedMaps).
export const BORROWED_MAPS = [{
  root: '/static/assets/images/trung-trac/maps-32bit/',
  manifest: 'maps_tt.json',
  ids: ['BG_TT_SKY_DAY', 'TILESET_TT_GROUND', 'TILESET_TT_TERRAIN', 'PROP_TT_QUIZ_STELE']
}, {
  root: '/static/assets/images/ba-trieu/maps-32bit/',
  manifest: 'maps_bt.json',
  ids: ['ITEM_BT_TINH_HOA', 'BG_BT_FAR_PLAIN']
}, {
  root: '/static/assets/images/ly-nam-de/maps-32bit/',
  manifest: 'maps_lnd.json',
  ids: ['BG_LND_MID_CHU_DIEN', 'BG_LND_MID_RED_RIVER', 'PROP_LND_RIVER_WATER', 'PROP_LND_ROCK_LEDGE', 'BG_LND_FAR_MIDLANDS']
}];
// Mặt nước khe sông `'~'` — số như chương 3 (ảnh nước PROP_LND_RIVER_WATER).
// Mặt sình PROP_TQP_MUD (TQP-ENGINE E1): mặt bùn ở hàng ảnh 12–15 -> đỉnh ảnh
// nâng 3 px trên GROUND_Y để mặt bùn ngang mặt đất.
export const TILES = {
  ground: 'TILESET_TT_GROUND', groundRegion: 'Z1', terrain: 'TILESET_TT_TERRAIN', water: 'PROP_LND_RIVER_WATER',
  waterLift: 6, waterDeep: '#56341f', mud: 'PROP_TQP_MUD', mudLift: 3
};
export const FAR_HILLS = { id: 'BG_BT_FAR_PLAIN', parallax: 0.2, bottomY: 230, hiddenUnderSky: [] };

// Ảnh DOM riêng chương (chân dung): Triệu Quang Phục dẫn màn 1 + 3 NPC màn 2.
// Màn 3: chân dung Dương Sàn + icon 3 phần thưởng (ô kỹ năng HUD).
export const PORTRAITS = [
  'PORTRAIT_TQP', 'PORTRAIT_TQP_TRIEU_TUC', 'PORTRAIT_TQP_LY_NAM_DE', 'PORTRAIT_CHU_DONG_TU', 'PORTRAIT_DUONG_SAN',
  'ICON_SK_TQP_RALLY', 'ICON_SK_TQP_DRAGON_CLAW', 'ICON_BUFF_TQP_VITALITY'
];

// Sprite canvas mỗi màn cần (chỉ nạp ảnh màn đang chơi dùng). Màn 1 gồm cả
// layout thử ?layout=engine. ITEM_LND_HEAL ở mọi màn: engine drawPickups tra
// ảnh bình máu mỗi frame kể cả khi chưa có bình nào.
export const LEVEL_SPRITES = {
  1: [
    'NPC_TQP', 'EN_LUONG_PATROL', 'EN_LUONG_SPEARMAN', 'EN_LUONG_SPEAR_CAPTAIN', 'EN_LUONG_ARCHER',
    'PROP_TQP_ARCHER_TREE', 'PJ_CROSSBOW_BOLT', 'TR_BAMBOO_SPIKE_PIT', 'EN_SWAMP_SNAKE', 'EN_CROCODILE',
    'EN_LUONG_WAR_BOAT', 'PJ_FIRE_ARROW', 'FX_SWAMP_GAS', 'OB_TQP_STRAW_DUMMY', 'OB_TQP_STRAW_SPEARMAN',
    'ITEM_LND_HEAL'
  ],
  2: [
    'NPC_TQP_TRIEU_TUC', 'NPC_TQP_LY_NAM_DE', 'NPC_CHU_DONG_TU', 'FX_TQP_GOLDEN_DRAGON',
    'EN_LUONG_PATROL', 'EN_LUONG_SPEARMAN', 'EN_LUONG_ARCHER', 'PROP_TQP_ARCHER_TREE', 'PJ_CROSSBOW_BOLT',
    'TR_BAMBOO_SPIKE_PIT', 'EN_SWAMP_SNAKE', 'EN_CROCODILE', 'EN_LUONG_WAR_BOAT', 'PJ_FIRE_ARROW', 'FX_SWAMP_GAS',
    'ITEM_LND_HEAL'
  ],
  3: [
    'BOSS_DUONG_SAN', 'EN_LUONG_MERCENARY', 'EN_LUONG_ARCHER', 'PJ_CROSSBOW_BOLT', 'OB_TQP_DIRT_MOUND',
    'OB_TQP_DUGOUT_CANOE', 'FX_TQP_NAPE_GLOW', 'FX_TQP_GROUND_SLAM', 'FX_BT_ARMOR_SPARK', 'FX_TQP_TORCH',
    'FX_TQP_RALLY', 'FX_TQP_DRAGON_CLAW', 'ITEM_LND_HEAL'
  ]
};

// URL trang từng màn (route ở backend/routes/pages.py).
export const LEVEL_URLS = {
  1: '/gameplay/levels/trieu-quang-phuc',
  2: '/gameplay/levels/trieu-quang-phuc/2',
  3: '/gameplay/levels/trieu-quang-phuc/3'
};

// ---- Màn 1 "Tuổi trẻ rèn luyện" (TQP-L1) ----
// 12 chunk = 9216 px = stage_length của maps_tqp.json. Vùng cảnh (Q5): bãi tập
// -> làng Chu Diên (mượn chương 3) -> bãi lau ven sông -> đầm lầy -> bờ đầm
// Dạ Trạch (cổng trại nghĩa quân = đích). Nhóm chướng ngại xáo trong vùng
// được phép (level1.js) để đúng cảnh.
export const LEVEL1_CHUNKS = 12;
export const LEVEL1_ZONES = [
  { id: 'TQP1', x0: 0, x1: CHUNK_W * 2, sky: 'BG_TT_SKY_DAY', mid: 'BG_TQP_MID_TRAINING_YARD' },
  { id: 'TQP2', x0: CHUNK_W * 2, x1: CHUNK_W * 4, sky: 'BG_TT_SKY_DAY', mid: 'BG_LND_MID_CHU_DIEN' },
  { id: 'TQP3', x0: CHUNK_W * 4, x1: CHUNK_W * 7, sky: 'BG_TT_SKY_DAY', mid: 'BG_TQP_MID_REED_BANK' },
  { id: 'TQP4', x0: CHUNK_W * 7, x1: CHUNK_W * 10, sky: 'BG_TT_SKY_DAY', mid: 'BG_TQP_MID_SWAMP' },
  { id: 'TQP5', x0: CHUNK_W * 10, x1: CHUNK_W * LEVEL1_CHUNKS, sky: 'BG_TT_SKY_DAY', mid: 'BG_TQP_MID_DA_TRACH' }
];
// Cổng trại nghĩa quân PROP_TQP_REED_GATE (192×176, pivot giữa đáy) — tâm tại
// worldX(12, 618) như chương 2–3; mở khi đủ sách + hạ mini-boss.
export const LEVEL1_FINISH_X = CHUNK_W * 11 + 618;
export const FINISH_GATE = { closed: 'PROP_TQP_REED_GATE', open: 'PROP_TQP_REED_GATE_OPEN', worldX: LEVEL1_FINISH_X, sink: 0 };
// Triệu Quang Phục đứng chờ ở chunk 1 (NPC dẫn — như Lý Bí chương 3).
export const GUIDE_LOCAL_X = 190;

// Khu rèn luyện chunk 1–2 (TQP-L1 §2.1, cố định): 3 bù nhìn rơm (chunk 1), 2
// cọc tre [chunk, localX tâm] (vật cản chặn ngang, cao 48) rồi bù nhìn cầm
// giáo (chỉ vỡ khi bổ). Triệu Quang Phục đứng lần 2 ở cuối chunk 2 làm "cổng"
// (`yardNpc`): 4 bù nhìn là quân vây (`captorOf`) — vỡ hết mới đi tiếp (Q2).
// `tips` [chunk, localX, câu] = câu hướng dẫn phím hiện 1 lần khi vượt x đó.
export const TRAINING = {
  dummies: [[1, 400], [1, 510], [1, 620]],
  posts: [[2, 110], [2, 230]],
  spearDummy: [2, 400],
  yardNpc: [2, 640],
  tips: [
    [1, 320, 'Bấm Đánh để chém vỡ bù nhìn rơm.'],
    [2, 40, 'Nhảy lên cọc tre.'],
    [2, 300, 'Bù nhìn cầm giáo gạt đòn chém ngang — nhảy lên, đang rơi thì bấm Đánh để bổ xuống!']
  ]
};

// Mini-boss đội trưởng giáo dài (guard `boss`, plungeOnly — Q5): cố định chunk
// 11, 6 đòn bổ (hp 12 — đòn bổ engine PLUNGE.damage 2); chết rơi 1 Quyển Sách
// Tinh Hoa (`itemLift` trên mặt đất); 2 lính tuần hộ tống `escorts` (localX).
export const MINIBOSS = { chunk: 11, localX: 420, hp: 12, itemLift: 40, escorts: [250, 600] };
// Nghỉ chân hồi 1 máu — 1 lần khi vượt điểm này (đầu đầm lầy).
export const REST = { chunk: 8, localX: 200 };
// 4 Quyển Sách Tinh Hoa cố định [chunk, localX, độ cao trên mặt đất] (đầu
// chunk, ngoài 2 ô đặt nhóm và ngoài dải sình ô `a` — sớm nhất x 96); quyển
// thứ 5 rơi từ đội trưởng.
export const LEVEL1_ITEMS = [[3, 100, 56], [6, 100, 60], [8, 60, 56], [10, 60, 64]];

// Hai ô đặt nhóm chướng ngại mỗi chunk (local x tâm): `a` và `b` (lệch ±60,
// nhóm có địa hình lệch bội số 16 tối đa ±48). Bia câu hỏi đứng giữa (420).
export const SLOTS = { a: 260, b: 600 };
// Khe nước cá sấu (1 khe 112 px, cột 14–20 = x 224–336 — ô `a`); `floatY` =
// chân ô cá sấu chìm dưới mặt đất (mắt/bọt `warn` nằm ngang mặt nước).
export const CROC_RIVER = {
  rows: ['##############~~~~~~~###########################'],
  x: 280, floatY: 18
};
// Khe nước thuyền tuần (như sông chương 3 — cả 2 ô): khe 1 (x 224–336) có
// thuyền, đất 64, khe 2 (x 400–576) có mỏm đá 64 ở giữa. `ledge` [localX trái, cao].
export const BOAT_RIVER = {
  rows: ['##############~~~~~~~####~~~~~~~~~~~############'],
  boatX: 280, floatY: 5, ledge: [456, 15], fireInterval: 2.2, hp: 3,
  callHelp: { after: 4, range: 220, spawnAt: [120, 700] }
};
// Dải sình 160 px (TQP-ENGINE E1): ô `a` cột 9–18 (x 144–304), ô `b` cột 31–40
// (x 496–656); bia câu hỏi ở 420 nằm ngoài cả khi lệch ±48.
export const MUD_ROWS = {
  a: ['#########==========#############################'],
  b: ['###############################==========#######']
};
// Khói chướng khí 2 làn (drift): [dx xuất phát so với tâm ô, làn, speed, travel].
export const SMOKE = [[60, 'low', -120, 300], [140, 'high', -100, 320]];
// Cung thủ trên cây PROP_TQP_ARCHER_TREE (ô 64×112): mặt cành ở hàng ảnh 99 ->
// cao 87 trên chân ô (drawSprite đặt hàng cuối ô tại footY); vùng đứng x 36–54
// logic -> cung thủ lệch `archerDx` +13 so với tâm cây.
export const TREE = { deck: 87, archerDx: 13, fireInterval: 2, fireRange: 240 };
// Rắn trong bụi cỏ: bụi PROP_TQP_GRASS_TUFT (48×24, pivot giữa đáy) vẽ trước
// người chơi; rắn nằm im tới khi người chơi cách `ambushRange` thì lao ra.
export const SNAKE_AMBUSH = { ambushRange: 180, tuft: 'PROP_TQP_GRASS_TUFT' };
// Lính giáo dài: 1 cọc tre đứng trước lính `postDx` (phía người chơi tới) để
// nhảy lên bổ xuống.
export const SPEARMAN_POST = { postDx: -90 };

// Câu hỏi chặn đường (điểm + luật ở engine):
//   level1Count  số câu mỗi lượt màn 1 (rút ngẫu nhiên, không trùng).
//   level1Spots  [chunk, localX] — chạm x này thì hỏi (theo thứ tự); giữa 2 ô
//                nhóm (420); chunk 5 ở 720 (sau khe thuyền tới 624 kể cả lệch).
//   level2Spots  [chunk, localX] — câu hỏi về NPC sắp gặp (pool cùng tên, thứ
//                tự Triệu Túc -> Lý Nam Đế -> Chử Đồng Tử, TQP-00 §3.2), cùng
//                chunk với NPC, trước 2 lính vây (lính trái tuần từ local 390).
export const QUIZ = {
  level1Count: 4,
  level1Spots: [[3, 420], [5, 720], [8, 420], [10, 420]],
  level2Spots: { trieuTuc: [3, 280], lyNamDe: [6, 280], chuDongTu: [10, 280] }
};

// ---- Màn 2 "Hiền tài Dạ Trạch" (TQP-L2) ----
// 10 chunk ĐẶT CỐ ĐỊNH (TQP-00 §3.2): bờ sông Chu Diên 1–3 (Triệu Túc) -> trung
// du động Khuất Lão 4–6 (Lý Nam Đế) -> đầm Dạ Trạch ban đêm 7–10 (Chử Đồng Tử).
// Engine hoà trời ngày -> đêm và nền giữa ở ranh giới vùng. Đồi xa trung du
// (chương 3) tắt dưới trời đêm (trời đêm có sẵn chân trời).
export const LEVEL2_CHUNKS = 10;
export const LEVEL2_ZONES = [
  { id: 'TQP2A', x0: 0, x1: CHUNK_W, sky: 'BG_TT_SKY_DAY', mid: 'BG_LND_MID_CHU_DIEN' },
  { id: 'TQP2B', x0: CHUNK_W, x1: CHUNK_W * 3, sky: 'BG_TT_SKY_DAY', mid: 'BG_TQP_MID_REED_BANK' },
  { id: 'TQP2C', x0: CHUNK_W * 3, x1: CHUNK_W * 6, sky: 'BG_TT_SKY_DAY', mid: 'BG_TQP_MID_KHUAT_LAO' },
  { id: 'TQP2D', x0: CHUNK_W * 6, x1: CHUNK_W * LEVEL2_CHUNKS, sky: 'BG_TQP_SKY_NIGHT', mid: 'BG_TQP_MID_DA_TRACH_NIGHT' }
];
export const LEVEL2_FAR_HILLS = { id: 'BG_LND_FAR_MIDLANDS', parallax: 0.2, bottomY: 230, hiddenUnderSky: ['BG_TQP_SKY_NIGHT'] };
// Nước đầm xanh rêu PROP_TQP_SWAMP_WATER (6 hàng trên trong suốt như nước chương
// 3) cho riêng màn 2 (`levels[2].tiles`); vách khe màu rêu tối.
export const LEVEL2_TILES = { water: 'PROP_TQP_SWAMP_WATER', waterLift: 6, waterDeep: '#2c3820' };
// Đích: cuối chunk 10, sau Chử Đồng Tử (không cổng).
export const LEVEL2_FINISH_X = CHUNK_W * LEVEL2_CHUNKS - 96;
// NPC [chunk, localX tâm, số sách cần (E6)] — sách chia 3 / 3 / 4 giữa các đoạn.
export const LEVEL2_NPCS = {
  trieuTuc: [3, 560, 3],
  lyNamDe: [6, 560, 6],
  chuDongTu: [10, 560, 10]
};
// 2 lính Lương vây mỗi NPC (giải cứu — engine đếm `captorOf`): tâm lệch `dx`,
// tuần trong [patrol] so với tâm NPC (như chương 3).
export const CAPTORS = [{ dx: -100, patrol: [-170, -30] }, { dx: 48, patrol: [-60, 80] }];
// 10 Quyển Sách Tinh Hoa [chunk, localX, độ cao trên mặt đất]; sách do lính
// mang (`carrier`) khai báo ở LEVEL2_CARRIERS.
//   ch1: trên đất + trên cọc tre (cao 48); ch2: trên mỏm đá giữa khe thuyền;
//   ch4: trên mỏm đá; ch6: trên đất; ch7: giữa bụi lau; ch8: sau khe cá sấu;
//   ch9: trên đất.
export const LEVEL2_ITEMS = [
  [1, 150, 56], [1, 440, 70], [2, 488, 52],
  [4, 412, 76], [6, 100, 56],
  [7, 296, 30], [8, 440, 56], [9, 90, 56]
];
// Lính mang sách: [chunk, localX, art] — hạ mới rơi sách (`carrier` = id lính).
export const LEVEL2_CARRIERS = [[5, 600, 'spearman'], [9, 500, null]];
// Chướng ngại cố định từng chunk (level2.js). Số đều DESIGN_BASELINE.
//   ch1: lính tuần 600, chông ẩn 300, cọc tre 440 (sách trên đỉnh).
//   ch2: khe thuyền tuần (BOAT_RIVER) + mỏm đá.
//   ch4: rắn trong bụi cỏ 240, mỏm đá [localX trái, cao], cung thủ trên cây 620.
//   ch5: 2 lính giáo dài 260 / 600 (+ cọc tre trước mặt — SPEARMAN_POST).
//   ch7: bụi lau ẩn nấp [localX trái, rộng] + 2 lính tuần đi xuyên bụi.
//   ch8: khe cá sấu (CROC_RIVER) + khói 2 làn ở ô b.
//   ch9: sình ô a, bụi lau ẩn nấp, lính tuần mang sách, cung thủ trên cây 700.
export const LEVEL2_LAYOUT = {
  patrol: [1, 600], spike: [1, 300], post: [1, 440],
  snake: [4, 240], ledge: [4, 380, 48], tree: [4, 620],
  spearmen: [[5, 260], [5, 600]],
  covers: [[7, 200, 192], [9, 400, 192]],
  coverGuards: [[7, 300], [7, 560]],
  smoke: [8, 600],
  tree2: [9, 700]
};
// Bụi lau ẩn nấp PROP_TQP_REED_COVER (64×48, pivot giữa đáy): vẽ lặp mỗi 64 px
// trong vùng `covers`, TRƯỚC người chơi (render-extras.js); người chơi đứng
// trong vùng thì vẽ mờ `insideAlpha` để còn thấy nhân vật.
export const REED_COVER = { prop: 'PROP_TQP_REED_COVER', w: 64, insideAlpha: .55 };
// Rồng vàng FX_TQP_GOLDEN_DRAGON (128×64, pivot giữa đáy) hiện sau lưng Chử Đồng
// Tử khi đủ sách: `appear` (1 lần) rồi `idle` lặp; bắt đầu khi người chơi cách
// NPC dưới `range` px. Mờ theo NPC khi gặp xong.
export const DRAGON = { id: 'FX_TQP_GOLDEN_DRAGON', npc: 'chuDongTu', range: 420 };

// ---- Màn 3 "Đại phá Dương Sàn" (TQP-L3) ----
// Đấu trường 1 chunk (Q2) ban đêm: trời đêm + trại Lương bên đầm. Nước đầm xanh
// rêu như màn 2 (GĐ 3 đoạn giữa hoá nước).
export const ARENA = { width: CHUNK_W, playerStartX: 96 };
export const LEVEL3_ZONES = [
  { id: 'TQP3', x0: 0, x1: ARENA.width, sky: 'BG_TQP_SKY_NIGHT', mid: 'BG_TQP_MID_LUONG_CAMP_NIGHT' }
];
export const LEVEL3_FAR_HILLS = { id: 'BG_BT_FAR_PLAIN', parallax: 0.2, bottomY: 230, hiddenUnderSky: ['BG_TQP_SKY_NIGHT'] };
// Địa hình (ô 16 px, 48 cột): GĐ 1–2 hai dải sình 176–240 / 528–592; GĐ 3 đoạn
// 176–592 thành nước, bờ phải còn dải sình 592–656 (Dương Sàn sa vào sau mỗi
// cú cuồng nộ).
export const LEVEL3_TERRAIN = {
  battle: ['###########====##################====###########'],
  flood: ['###########~~~~~~~~~~~~~~~~~~~~~~~~~~====#######']
};
// Mỏm đất OB_TQP_DIRT_MOUND (ô 64×32; mặt đứng hàng 2, đáy hàng 30): hazard
// `prop` có bục trên lưng (`ride`) — bệ nhảy để bổ gáy (Q3). [tâm x].
export const MOUNDS = [269, 499];
// Thuyền độc mộc OB_TQP_DUGOUT_CANOE (ô 64×24; mặt nước hàng 20, pivot = mặt nước
// +4; mép lòng thuyền hàng 8–10, trung tính 9): hazard `prop` nổi (`floatY`) có
// bục trên lưng. Nhấp nhô ±1 logic chỉ có trong ảnh — bục giữ hàng 9. [tâm x].
export const CANOES = { x: [250, 384, 518], floatY: 4 };
// Đuốc tiền cảnh FX_TQP_TORCH (16×32, gốc cán ở đáy) — trên đất cả 2 giai đoạn.
export const TORCHES = [40, 150, 720];

// Dương Sàn BOSS_DUONG_SAN (ô 128×128; attack_01/rage frame_w 192). Thân đo C1:
// cao ~102 logic -> hitbox 40×100; đang lún (`stuck`) hitbox hạ còn `stuckH` (đỉnh
// = khe gáy, đo C2 −70…−76,5). `hp` 12 (Q5: 3 lượt + kết liễu, mỗi lượt 3).
//   walk `speed`; khoảng mép tới người chơi ≤ `reach` -> attack_01 (ô hit 5,
//   đao [blade.near, blade.reach] từ tâm × [low, high] trên chân), nghỉ
//   attackCooldown. Xa hơn `chargeRange` và hết chargeCooldown -> lao
//   `chargeSpeed` theo 1 hướng, dừng khi qua người chơi `overshoot` px / chạm
//   tường (nghỉ `wallRest`) / tâm vào sình -> lún `stuckTime` (GĐ 3:
//   `stuckTimeP3`). Lao trúng: −1 máu, đẩy `push`.
//   Máu về mốc `thresholds` thì thoát lún, hurt, lùi `retreat` px; mốc cuối -> GĐ 3.
//   Gáy từng ô `stuck`/`hurt` (tương đối pivot, đo C2): FX_TQP_NAPE_GLOW pivot =
//   gáy + (0, +8). Bổ gáy: có Móng Rồng `clawDamage`, không có `plainDamage`.
//   GĐ 3 đứng `p3HomeX`, mỗi `rageInterval` giây `rage` (ô hit 6, mũi đao
//   `rageTip` -> sóng đất), rồi đi tới `p3StuckX` (dải sình bờ phải) lún.
export const BOSS = {
  id: 'BOSS_DUONG_SAN', w: 40, h: 100, stuckH: 70, hp: 12, startX: 640, startDelay: 1.5,
  speed: 40, reach: 40, attackCooldown: 1.8, blade: { near: 10, reach: 62, low: 8, high: 70 },
  chargeRange: 180, chargeCooldown: 3, chargeSpeed: 230, overshoot: 120, wallRest: 1, push: 40,
  stuckTime: 4, stuckTimeP3: 3, thresholds: [9, 6, 3], retreat: 60,
  clawDamage: 3, plainDamage: 1, hintInterval: 4,
  napeStuck: [[-1, -70.25], [-2.5, -73.5], [-3.5, -76.5], [-3.75, -75.75], [-2.75, -70.75], [-1.5, -70]],
  napeHurt: [[-2.5, -82.75], [-2.5, -76.25], [-2.25, -85]],
  p3HomeX: 704, p3StuckX: 624, rageInterval: 6, rageTip: { x: 50.25, y: -2 },
  defeatScore: 1500
};
// Sóng đất FX_TQP_GROUND_SLAM (ô 96×32): phát tại mũi đao ô 6 của `rage`; GĐ 3
// sóng chạy về phía mép nước `speed` px/s, hộp w×h trên mặt đất, trúng người
// đứng đất bờ phải −1 máu (đứng trên thuyền thì an toàn).
export const SLAM = { id: 'FX_TQP_GROUND_SLAM', anim: 'burst', speed: 260, w: 40, h: 22 };
// Gọi viện (`command` ô 3): mỗi `interval` giây khi boss không lao/lún. Lượt n
// (= số lượt đã bổ trúng) ra `waves[n]` = { mercs, archer }; tối đa `max` lính
// sống. Lính ra ở mép xa người chơi (`edgeX` từ tường). Cung thủ đứng ở mép đó.
export const REINFORCE = {
  interval: 10, startDelay: 4, max: 3, edgeX: 30,
  waves: [{ mercs: 1, archer: false }, { mercs: 2, archer: false }, { mercs: 2, archer: true }],
  // Tầm bắn 260 < tầm bay tên của engine (PROJECTILE_MAX_RANGE 276): cung thủ
  // đứng mép khống chế phía đấu trường đó.
  archer: { fireInterval: 2.5, fireRange: 260, hp: 1 }
};
// Bình máu rơi khi hạ lính / cung thủ (hooks.dropHeal — Q5). Boss không rơi.
export const HEAL_DROP = { chance: .25 };
// Tóe lửa trên giáp (FX_BT_ARMOR_SPARK 16×16, chép chương 3).
export const SPARK = { id: 'FX_BT_ARMOR_SPARK', anim: 'impact' };
// Gáy sáng FX_TQP_NAPE_GLOW (16×16, lõi ở giữa ô — pivot = lõi + 8).
export const NAPE_GLOW = { id: 'FX_TQP_NAPE_GLOW', anim: 'loop', lift: 8 };
// Đuốc FX_TQP_TORCH.
export const TORCH = { id: 'FX_TQP_TORCH', anim: 'loop' };

// Kỹ năng (phần thưởng màn 2 — TQP-L3 §3):
//   Thể lực cường tráng: máu tối đa +`bonus` (engine bonusHealth).
//   Hiệu triệu (K): FX_TQP_RALLY (ô 96×64) quanh người chơi; ô hit 3 -> lính /
//   cung thủ trong bán kính `radius` −`damage` + đẩy `push`; đạn trong bán kính
//   tan; Dương Sàn không mất máu nhưng bị ngắt cú lao. Hồi `cooldown`.
//   Móng Rồng (L): `on` rồi bật `duration` giây — bổ gáy gây BOSS.clawDamage;
//   `hold` chỉ vẽ khi người chơi đứng yên (FX căn theo kiếm tư thế idle — Gate
//   B2), `strike` tại gáy khi trúng. Hồi `cooldown` tính từ lúc bật.
export const SKILLS = {
  BUFF_TQP_VITALITY: { slot: null, bonus: 2, icon: 'ICON_BUFF_TQP_VITALITY' },
  SK_TQP_RALLY: {
    slot: 'skill1', cooldown: 12, radius: 40, damage: 2, push: 30,
    fx: 'FX_TQP_RALLY', icon: 'ICON_SK_TQP_RALLY'
  },
  SK_TQP_DRAGON_CLAW: {
    slot: 'skill2', duration: 6, cooldown: 10,
    fx: 'FX_TQP_DRAGON_CLAW', icon: 'ICON_SK_TQP_DRAGON_CLAW'
  }
};
// Layout thử `?layout=skills` (màn 3; `?debug=1` cho đủ 3 phần thưởng): boss lún
// mãi ở dải sình trái (máu không giảm), lính đánh thuê ra lặp (tối đa 2).
export const SKILL_TEST = { bossX: 208, respawnGap: 3 };

// Cutscene kết chương (giây): boss trúng đòn cuối `hurt` beatenHold -> `death`
// rồi nằm deathHold -> cốt truyện 1 -> tối dần fadeTime -> sáng lại -> cốt
// truyện 2 -> panel kết chương.
export const TQP_CUTSCENE = { beatenHold: .6, deathHold: .8, fadeTime: .6 };

// Câu thông báo trong trận (TQP-L3 §5 — Claude soạn, không phải nội dung lịch
// sử, duyệt Q1 05/11/2026).
export const BOSS_TEXT = {
  armorHint: 'Giáp Dương Sàn quá dày — hãy nhử hắn lao vào bãi sình!',
  napeHint: 'Dương Sàn bị lún — nhảy lên bổ vào gáy!',
  noClaw: 'Gáy chưa đủ hở — bật Móng Rồng (L) để đánh mạnh hơn!',
  bladeHit: 'Bạn trúng đại đao của Dương Sàn!',
  chargeHit: 'Dương Sàn lao trúng bạn!',
  command: 'Dương Sàn gọi lính đánh thuê!',
  phase3: 'Dương Sàn cuồng nộ đập vỡ bờ đầm!',
  slamHit: 'Sóng đất hất ngã bạn!',
  canoeHint: 'Nhảy qua thuyền độc mộc để áp sát!'
};

// ---- Môi trường ----
// Cọc tre PROP_TQP_BAMBOO_POST (16×48, mặt trên hàng 0): vật cản `blocking` —
// đi ngang bị chặn (không mất máu), phải nhảy qua hoặc nhảy lên đứng (người
// dùng chơi thử 04/11: bục một chiều đi xuyên được).
export const OBSTACLE_TYPES = {
  bambooPost: { id: 'PROP_TQP_BAMBOO_POST', anchor: 'bottom', groundSink: 0, blocking: true }
};
// Quyển Sách Tinh Hoa (mượn chương 2, strip 4 ô 16×16 logic).
export const ITEM = { sprite: 'ITEM_BT_TINH_HOA', fps: 8 };
export const QUIZ_STELE_ID = 'PROP_TT_QUIZ_STELE';
// Mỏm đá giữa sông (chương 3): bục một chiều 64 px, mặt trên ở hàng 0 của ảnh.
export const ROCK_LEDGE = { sprite: 'PROP_LND_ROCK_LEDGE', w: 64 };
export const BAMBOO_POST = { sprite: 'PROP_TQP_BAMBOO_POST', w: 16, h: 48 };
export const MAP_PROPS_IN_GAME = [
  ITEM.sprite, QUIZ_STELE_ID, ROCK_LEDGE.sprite, BAMBOO_POST.sprite, TILES.water, TILES.mud,
  FINISH_GATE.closed, FINISH_GATE.open, SNAKE_AMBUSH.tuft, LEVEL2_TILES.water, REED_COVER.prop
];
// Nước đầm xanh rêu (như màn 2) cho màn 3 GĐ 3.
export const LEVEL3_TILES = LEVEL2_TILES;

// ---- Quân địch, hazard, đạn ----
// Hitbox (w, h) tính từ pivot bottom-center, đo từ strip TQP_ART_01 (report
// Codex "Số đo cho code", px logic) — KHÔNG lấy từ cỡ ảnh. DESIGN_BASELINE.
// Lính tuần EN_LUONG_PATROL (chương 3): 22×34, mũi kích 49 ngoài mép, cao 10–18 từ đỉnh.
export const SOLDIER = { w: 22, h: 34, hp: 2 };
export const GUARD = {
  patrolRange: 96, speed: 22, aggroRange: 130,
  attackReach: 49, attackBoxY: 10, attackBoxH: 9, attackCooldown: 1.6, damage: 1
};
// Lính giáo dài EN_LUONG_SPEARMAN: thân như lính tuần (22×34); mũi giáo ô hit 4
// cách pivot +56,5 (45 ngoài mép), cao 20,75 trên chân = 13 từ đỉnh hitbox.
export const SPEARMAN_GUARD = {
  patrolRange: 96, speed: 20, aggroRange: 130,
  attackReach: 45, attackBoxY: 9, attackBoxH: 9, attackCooldown: 1.8, damage: 1
};
// Đội trưởng giáo dài EN_LUONG_SPEAR_CAPTAIN (ô 64×64, attack_01 frame_w 160):
// thân ~30, sọ→chân ~40 (mũ tới 45) -> hitbox 30×44; mũi giáo ô hit 4 cách pivot
// +75 (60 ngoài mép), cao 30,75 trên chân = 13 từ đỉnh hitbox.
export const CAPTAIN = { w: 30, h: 44 };
export const CAPTAIN_GUARD = {
  patrolRange: 200, speed: 24, aggroRange: 170,
  attackReach: 60, attackBoxY: 9, attackBoxH: 10, attackCooldown: 1.8, damage: 1
};
// Rắn EN_SWAMP_SNAKE (rusher, ô 48×16): thân 42×≤6,5; vùng mổ ô hit 3 tới +21
// từ tâm, cao ≤ 5,25 trên chân.
export const SNAKE = {
  hp: 1, w: 36, h: 6, speed: 130, attackRange: 8,
  attackReach: 4, attackBoxY: 0, attackBoxH: 6, rest: .8, damage: 1
};
const SPEAR_ANIMS = { idle: 'idle', walk: 'walk', attack: 'attack_01', blocked: 'blocked', hurt: 'hurt', death: 'death' };
export const ENEMY_SPRITES = {
  normal: {
    id: 'EN_LUONG_PATROL', behavior: 'guard', rules: GUARD,
    anims: { idle: 'idle', walk: 'walk', attack: 'attack_01', hurt: 'hurt', death: 'death' },
    attackMessage: 'Bạn bị lính Lương đâm kích trúng!', contactMessage: 'Bạn va phải lính Lương!',
    defeatMessage: 'Đã đánh bại lính Lương.'
  },
  // Lính giáo dài (TQP-ENGINE E5 `plungeOnly`): gạt đòn chém ngang, chỉ đòn bổ trúng.
  spearman: {
    id: 'EN_LUONG_SPEARMAN', behavior: 'guard', rules: SPEARMAN_GUARD, plungeOnly: true, anims: SPEAR_ANIMS,
    attackMessage: 'Bạn bị lính giáo dài đâm trúng!', contactMessage: 'Bạn va phải lính giáo dài!',
    defeatMessage: 'Đã hạ lính giáo dài.'
  },
  // Mini-boss: enemy `boss` có `behavior` -> engine chạy hành vi lính canh.
  captain: {
    id: 'EN_LUONG_SPEAR_CAPTAIN', behavior: 'guard', rules: CAPTAIN_GUARD, plungeOnly: true, anims: SPEAR_ANIMS,
    attackMessage: 'Bạn bị đội trưởng giáo dài đâm trúng!', contactMessage: 'Bạn va phải đội trưởng giáo dài!'
  },
  // Lính đánh thuê EN_LUONG_MERCENARY (màn 3): cùng cỡ + nhịp lính tuần (C2 đo
  // sọ–chân 34, attack_01 ô hit 4 rộng 128) — dùng luật GUARD.
  mercenary: {
    id: 'EN_LUONG_MERCENARY', behavior: 'guard', rules: GUARD,
    anims: { idle: 'idle', walk: 'walk', attack: 'attack_01', hurt: 'hurt', death: 'death' },
    attackMessage: 'Bạn trúng rìu lính đánh thuê!', contactMessage: 'Bạn va phải lính đánh thuê!'
  },
  // Dương Sàn (enemy `kind` duongSan — boss.js đặt animation).
  duongSan: {
    id: 'BOSS_DUONG_SAN',
    anims: {
      idle: 'idle', walk: 'walk', charge: 'charge', attack: 'attack_01', command: 'command', blocked: 'blocked',
      hurt: 'hurt', stuck: 'stuck', rage: 'rage', death: 'death'
    }
  },
  // Không có `idle` riêng: đứng ở ô 1 của `run` (idleHold).
  snake: {
    id: 'EN_SWAMP_SNAKE', behavior: 'rusher', rules: SNAKE, idleHold: true,
    anims: { idle: 'run', walk: 'run', attack: 'attack_01', death: 'death' },
    attackMessage: 'Rắn độc mổ trúng bạn!', contactMessage: 'Rắn độc mổ trúng bạn!',
    defeatMessage: 'Đã hạ rắn độc.'
  }
};
// Bù nhìn tập võ (hazard `prop` có hp — không gây hại): thân ~18×32; vỡ thì xác
// rơm nằm lại (`corpse`).
const DUMMY_ANIMS = { idle: 'idle', hurt: 'hit', death: 'break' };
export const HAZARD_SPRITES = {
  strawDummy: {
    id: 'OB_TQP_STRAW_DUMMY', w: 18, h: 32, corpse: true, anims: DUMMY_ANIMS,
    breakMessage: 'Bù nhìn rơm vỡ tung!'
  },
  strawSpearman: {
    id: 'OB_TQP_STRAW_SPEARMAN', w: 18, h: 32, corpse: true, plungeOnly: true, anims: DUMMY_ANIMS,
    breakMessage: 'Đòn bổ trúng đích!'
  },
  // Hố chông tre ẩn dưới lá (trap — như chương 2): chìm 3 px vào cỏ.
  bambooPit: {
    id: 'TR_BAMBOO_SPIKE_PIT', w: 36, h: 6, sink: 3, anims: { idle: 'hidden', sprung: 'reveal' },
    springMessage: 'Bẫy chông tre bật lên!', sprungMessage: 'Bạn giẫm phải chông tre!'
  },
  // Khói chướng khí trôi (E2): ô 64×24, thân khói ~52×14; làn `high` 26 px.
  smoke: {
    id: 'FX_SWAMP_GAS', w: 52, h: 14, lanes: { low: 0, high: 26 }, anims: { move: 'move' },
    hitMessage: 'Bạn hít phải khói chướng khí!'
  },
  // Cá sấu (E3) EN_CROCODILE (ô 64×32): hộp đớp ô 5 [-26,5; 26,5] × 22,5 ->
  // 46×20. Báo bọt `warnTime`, ngoi đớp `upTime`, lặn `diveTime` (giây); chồm `leap` px.
  crocodile: {
    id: 'EN_CROCODILE', w: 46, h: 20, warnTime: .6, upTime: 1, diveTime: .3, leap: 56,
    anims: { warn: 'warn', attack: 'attack', dive: 'dive', death: 'death' },
    hitMessage: 'Cá sấu đớp trúng bạn!', breakMessage: 'Đã hạ cá sấu!'
  },
  // Thuyền tuần (thrower nổi + gọi viện E4): số đo chương 3 (điểm phóng +33; 27,5);
  // `signal` thổi tù và + cờ, phát `signalTime` giây (= strip 8 ô @12 fps).
  // Va thân vô hại (`harmful: false`).
  warBoat: {
    id: 'EN_LUONG_WAR_BOAT', w: 72, h: 28, muzzle: 27.5, muzzleX: 33, signalTime: .67,
    anims: { idle: 'idle', throw: 'throw', signal: 'signal', hurt: 'hurt', death: 'death' },
    signalMessage: 'Thuyền tuần thổi tù và gọi quân!', breakMessage: 'Đã phá thuyền tuần!'
  },
  // Cung thủ trên cây (thrower đứng cao — số đo chương 3): điểm phóng +11; 23.
  treeArcher: {
    id: 'EN_LUONG_ARCHER', w: 20, h: 34, muzzle: 23, muzzleX: 11,
    anims: { idle: 'idle', throw: 'throw' }, hitMessage: 'Bạn va phải cung thủ!'
  },
  // Cây cho cung thủ (hazard `prop` — chỉ vẽ), đặt TRƯỚC cung thủ để vẽ phía sau.
  archerTree: { id: 'PROP_TQP_ARCHER_TREE', w: 28, h: 110, anims: { idle: 'idle' } },
  // Mỏm đất (màn 3): hazard `prop`, bục trên lưng (mặt hàng 2 của ô 32 cao); GĐ 3
  // `crack` rồi biến mất (alive = false -> death).
  dirtMound: { id: 'OB_TQP_DIRT_MOUND', w: 58, h: 30, ride: { top: 2, inset: 2 }, anims: { idle: 'idle', death: 'crack' } },
  // Thuyền độc mộc (màn 3 GĐ 3): hazard `prop` nổi; ô 24 cao, mép lòng hàng 9.
  canoe: { id: 'OB_TQP_DUGOUT_CANOE', w: 56, h: 24, ride: { top: 9, inset: 4 }, anims: { idle: 'idle' } },
  // Cung thủ đứng đất của layout thử + màn 3.
  archer: {
    id: 'EN_LUONG_ARCHER', w: 20, h: 34, muzzle: 23, muzzleX: 11,
    anims: { idle: 'idle', throw: 'throw' }, hitMessage: 'Bạn va phải cung thủ!'
  }
};
export const PROJECTILE_SPRITES = {
  fireArrow: { id: 'PJ_FIRE_ARROW', anim: 'loop', w: 14, h: 4 },
  crossbowBolt: { id: 'PJ_CROSSBOW_BOLT', anim: 'idle', w: 12, h: 3 }
};
// NPC: Triệu Quang Phục dẫn màn 1 (`tqp`) + đứng chặn cuối bãi tập (`tqpYard`,
// cùng ảnh). `testNpc`: NPC hộp tạm của layout thử (khoá theo sách — E6).
// Màn 2: Lý Nam Đế ngồi phản tre (bbox 11–37) và Chử Đồng Tử trên mây (10–39)
// rộng hơn thân người -> `holdGap` 16 để người chơi đứng ngoài hình.
const NPC_ANIMS = { idle: 'idle', talk: 'talk' };
const TQP_NPC = { id: 'NPC_TQP', portrait: 'PORTRAIT_TQP', anims: NPC_ANIMS };
export const NPC_SPRITES = {
  tqp: TQP_NPC, tqpYard: TQP_NPC, testNpc: { id: null, anims: {} },
  trieuTuc: { id: 'NPC_TQP_TRIEU_TUC', portrait: 'PORTRAIT_TQP_TRIEU_TUC', anims: NPC_ANIMS },
  lyNamDe: { id: 'NPC_TQP_LY_NAM_DE', portrait: 'PORTRAIT_TQP_LY_NAM_DE', anims: NPC_ANIMS, holdGap: 16 },
  chuDongTu: { id: 'NPC_CHU_DONG_TU', portrait: 'PORTRAIT_CHU_DONG_TU', anims: NPC_ANIMS, holdGap: 16 }
};

// Layout thử `?layout=engine` (màn 1 — TQP-ENGINE): mỗi chunk thử một cơ chế mới.
//   mud      chunk 1: lưới địa hình (cột '=' = sình, local 160–320) + lính sau dải.
//   smoke    chunk 2: khói trôi [chunk, localX xuất phát, làn, speed, travel].
//   river    lưới chunk 3–4 (như BOAT_RIVER): khe 1 local 224–336, khe 2 local 400–576 + mỏm đá.
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
  crocodile: [3, 280, CROC_RIVER.floatY],
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
// Bình hồi máu (chương 3) — màn 3 lính rơi theo HEAL_DROP (boss.js dropHeal).
export const PICKUPS = { heal: { id: 'ITEM_LND_HEAL', anim: 'idle' } };

// ---- Phần thưởng màn 2 (id khớp seed backend/migrations/008_trieu_quang_phuc.sql) ----
// Tên theo docs/SUTA_TQP_TASK_00.md §3.4 (duyệt 04/11/2026); cơ chế ở skills.js.
export const REWARD_NAMES = {
  BUFF_TQP_VITALITY: 'Thể lực cường tráng',
  SK_TQP_RALLY: 'Hiệu triệu Vạn Xuân',
  SK_TQP_DRAGON_CLAW: 'Móng Rồng'
};

// ---- Câu chữ thông báo dùng trong engine (CHAPTER.text) ----
export const TEXT = {
  obstacleHit: 'Hãy nhảy hoặc lướt qua chướng ngại vật.',
  trapHit: 'Bạn va vào bẫy!',
  fell: 'Bạn rơi xuống nước và mất 1 máu.',
  hazardHit: 'Bạn va phải quân Lương!',
  hazardDefeated: 'Đã hạ chướng ngại vật!',
  projectileHit: 'Bạn trúng tên của quân Lương!',
  bossContact: 'Bạn va phải đội trưởng giáo dài!',
  bossDefeated: 'Đã hạ đội trưởng giáo dài!',
  bossBlocksFinish: 'Hãy hạ đội trưởng giáo dài trước khi vào trại.',
  itemPicked: (count, total) => `Đã thu thập Quyển Sách Tinh Hoa ${count}/${total}`,
  itemsMissing: count => `Bạn còn thiếu ${count} Quyển Sách Tinh Hoa.`,
  rescueHint: name => `Hãy hạ quân Lương đang vây ${name}!`,
  // TQP-ENGINE (câu thông báo kỹ thuật, không phải nội dung lịch sử).
  mudSunk: 'Bạn bị lún trong bãi sình!',
  plungeHint: 'Đòn chém ngang bị gạt — nhảy lên, đang rơi thì bấm Đánh để bổ xuống!',
  npcLocked: (need, have) => `Cần ${need} Quyển Sách Tinh Hoa mới gặp được (đang có ${have}).`,
  // TQP-L1 khu rèn luyện (Q2 — câu kỹ thuật).
  yardLocked: 'Hãy chém vỡ hết bù nhìn tập võ trước đã!'
};
