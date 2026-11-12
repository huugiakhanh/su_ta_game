// Hằng số RIÊNG chương Mai Hắc Đế (chương 5) — không chứa logic. Hằng số chung
// mọi chương ở engine/config.js. Mọi toạ độ/kích thước/tốc độ là pixel logic.
//
// MHD-L1 (docs/SUTA_MHD_TASK_L1_01.md): màn 1 thật bằng asset MHD_ART_01
// (images/mai-hac-de/). Trời, tile, bia câu hỏi mượn chương 1, sách chương 2,
// đồi xa chương 3 qua BORROWED_MAPS. Màn 2 (MHD-L2), màn 3 (MHD-L3) thật. Không
// import file nào của chương 1–4. Mọi số DESIGN_BASELINE.

import { CHUNK_W } from '../../engine/config.js';

// ---- Asset ----
export const SPRITE_ROOT = '/static/assets/images/mai-hac-de/sprites-32bit/';
export const SPRITE_MANIFEST_FILE = 'manifest_mhd.json';
export const MAP_ROOT = '/static/assets/images/mai-hac-de/maps-32bit/';
export const MAP_MANIFEST_FILE = 'maps_mhd.json';
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

// Ảnh DOM riêng chương: chân dung Mai Thúc Loan dẫn màn 1, 3 NPC màn 2, Quang Sở
// Khách (cutscene) + 3 icon phần thưởng ở HUD màn 3.
export const PORTRAITS = [
  'PORTRAIT_MAI_THUC_LOAN', 'PORTRAIT_MHD_MOTHER', 'PORTRAIT_MHD_SA_NAM_HERO', 'PORTRAIT_MHD_LAM_AP_ENVOY',
  'PORTRAIT_QUANG_SO_KHACH', 'ICON_BUFF_MHD_POWER', 'ICON_SK_MHD_VAN_AN_SHELL', 'ICON_SK_MHD_REINFORCE'
];

// Sprite canvas mỗi màn cần (chỉ nạp ảnh màn đang chơi dùng). Màn 1 gồm cả
// layout thử ?layout=engine (hũ dầu + lửa). ITEM_LND_HEAL ở mọi màn: engine
// drawPickups tra ảnh bình máu mỗi frame kể cả khi chưa có bình nào.
// Màn 2 (MHD-L2): 3 NPC + chướng ngại màn 1. Màn 3 (MHD-L3): trận Quang Sở Khách.
export const LEVEL_SPRITES = {
  1: [
    'NPC_MAI_THUC_LOAN', 'NPC_MHD_PORTER', 'EN_TANG_ESCORT', 'EN_TANG_ARCHER', 'EN_TANG_JAVELIN', 'EN_TANG_CAVALRY',
    'EN_TANG_TAX_OFFICIAL', 'OB_MHD_EMPTY_CHEST', 'PJ_SILVER_CHEST', 'EN_TIGER', 'OB_TRIBUTE_CART', 'OB_BOULDER',
    'PJ_SPEAR', 'PJ_CROSSBOW_BOLT', 'PROP_LUONG_WATCHTOWER', 'PJ_OIL_JAR', 'FX_OIL_FIRE', 'ITEM_LND_HEAL'
  ],
  2: [
    'NPC_MHD_MOTHER', 'NPC_MHD_SA_NAM_HERO', 'NPC_MHD_LAM_AP_ENVOY', 'EN_TANG_ESCORT', 'EN_TANG_ARCHER',
    'EN_TANG_JAVELIN', 'EN_TANG_CAVALRY', 'EN_TIGER', 'OB_TRIBUTE_CART', 'OB_BOULDER', 'PJ_SPEAR', 'PJ_CROSSBOW_BOLT',
    'PROP_LUONG_WATCHTOWER', 'ITEM_LND_HEAL'
  ],
  3: [
    'BOSS_QUANG_SO_KHACH', 'EN_TANG_ARROW_CART', 'EN_TANG_SHIELD_GUARD', 'EN_TANG_SCOUT', 'FX_MHD_REINFORCE',
    'FX_MHD_VAN_AN_SHELL', 'PROP_MHD_BLACK_FLAG', 'NPC_MAI_THUC_LOAN', 'PJ_CROSSBOW_BOLT', 'PJ_OIL_JAR', 'FX_OIL_FIRE',
    'FX_BT_ARMOR_SPARK', 'ITEM_LND_HEAL'
  ]
};

// URL trang từng màn (route ở backend/routes/pages.py).
export const LEVEL_URLS = {
  1: '/gameplay/levels/mai-hac-de',
  2: '/gameplay/levels/mai-hac-de/2',
  3: '/gameplay/levels/mai-hac-de/3'
};

// ---- Màn 1 "Gánh cống Hoan Châu" (MHD-L1) ----
// 12 chunk = 9216 px = stage_length của maps_mhd.json. Vùng cảnh (§2): đường
// cống phẩm -> đèo núi -> trạm gác nhà Đường (cổng trạm = đích). Nhóm chướng
// ngại xáo trong vùng được phép (level1.js) để đúng cảnh.
export const LEVEL1_CHUNKS = 12;
export const LEVEL1_ZONES = [
  { id: 'MHD1', x0: 0, x1: CHUNK_W * 4, sky: 'BG_TT_SKY_DAY', mid: 'BG_MHD_MID_TRIBUTE_ROAD' },
  { id: 'MHD2', x0: CHUNK_W * 4, x1: CHUNK_W * 9, sky: 'BG_TT_SKY_DAY', mid: 'BG_MHD_MID_MOUNTAIN_PASS' },
  { id: 'MHD3', x0: CHUNK_W * 9, x1: CHUNK_W * LEVEL1_CHUNKS, sky: 'BG_TT_SKY_DAY', mid: 'BG_MHD_MID_TANG_CHECKPOINT' }
];
// Cổng trạm gác PROP_MHD_CHECKPOINT_GATE (192×176, pivot giữa đáy) — tâm tại
// worldX(12, 618) như chương 2–4; mở khi đủ sách + hạ quan thu thuế.
export const LEVEL1_FINISH_X = CHUNK_W * 11 + 618;
export const FINISH_GATE = {
  closed: 'PROP_MHD_CHECKPOINT_GATE', open: 'PROP_MHD_CHECKPOINT_GATE_OPEN', worldX: LEVEL1_FINISH_X, sink: 0
};
// Mai Thúc Loan đứng chờ ở chunk 1 (NPC dẫn — như Triệu Quang Phục chương 4).
export const GUIDE_LOCAL_X = 190;

// Đoạn gánh cống phẩm chunk 1–2 (§2.1, cố định): vào màn đang gánh (LEVEL.burden);
// xe cống đầu tiên `cart` [chunk, localX tâm] — đứng trong `reach` px quanh tâm
// xe mà bấm Đánh thì đập sọt: hết gánh, xe vỡ, thả 1 dân phu. Lính áp giải
// `guard` đứng SAU xe (phía phải) nên không đánh người đang gánh.
// `tips` [chunk, localX, câu] = câu hướng dẫn phím hiện 1 lần khi vượt x đó.
export const BURDEN_ROAD = {
  cart: [2, 560], reach: 60, guard: [2, 700],
  tips: [
    [1, 320, 'Đang gánh nặng: chỉ đi và nhảy được, không lướt.'],
    [2, 360, 'Tới sát xe cống, bấm Đánh để đập sọt!']
  ]
};

// Mini-boss quan thu thuế (hazard `patrol` `boss`, ném hòm rỗng — MHD-ENGINE E3):
// cố định chunk 11, 6 đòn chém; đi tuần ±`patrol` quanh tâm; chết rơi 1 Quyển
// Sách Tinh Hoa (`itemLift` trên mặt đất); 2 lính áp giải hộ tống `escorts` (localX).
export const MINIBOSS = {
  chunk: 11, localX: 420, hp: 6, speed: 30, patrol: 90, fireInterval: 2.2, fireRange: 240,
  itemLift: 40, escorts: [250, 600]
};
// Nghỉ chân — bình máu nằm sẵn ở điểm này (engine makeRestHeal) (giữa đèo).
export const REST = { chunk: 7, localX: 200 };
// 2 Quyển Sách Tinh Hoa cố định [chunk, localX, độ cao trên mặt đất] (đầu
// chunk, ngoài 2 ô đặt nhóm); 2 quyển trong xe chở sách (chunk 6, 9), 1 quyển
// rơi từ quan thu thuế.
export const LEVEL1_ITEMS = [[4, 100, 56], [8, 60, 60]];
export const BOOK_CARTS = { chunks: [6, 9], itemLift: 40 };

// Hai ô đặt nhóm chướng ngại mỗi chunk (local x tâm): `a` và `b` (lệch ±60).
// Bia câu hỏi đứng giữa (420).
export const SLOTS = { a: 260, b: 600 };
// Lính áp giải canh xe cống: đứng sau xe `guardDx` px.
export const CART_GUARD = { guardDx: 90 };
// Cung thủ núp bụi PROP_MHD_BUSH_COVER (48×32, pivot giữa đáy — vẽ SAU người
// chơi để che nửa dưới cung thủ, render-extras.js).
export const BUSH = { prop: 'PROP_MHD_BUSH_COVER', fireInterval: 2.2, fireRange: 260 };
// Lính ném lao trên tháp canh PROP_LUONG_WATCHTOWER: sàn tháp cao `deck` trên
// mặt đất (số đo chương 3); không với tới.
export const TOWER = { deck: 91, fireInterval: 2.4, fireRange: 260 };
// Đá lăn: lăn sang trái `speed` px/s khi người chơi tới cách `trigger` px (ngoài
// tầm nhìn phía trước ~422 px để không hiện giữa màn hình).
export const BOULDER = { speed: -140, trigger: 440, hp: 1 };
// Hổ vồ từ hang: cửa hang PROP_MHD_CAVE_MOUTH (map prop, vẽ sau hổ —
// render-extras.js); vồ trong khoảng ±`span` quanh hang.
export const TIGER_CAVE = { prop: 'PROP_MHD_CAVE_MOUTH', hp: 3, triggerRange: 220, span: 200 };
// Kỵ binh phi ngang (roller): người chơi vượt `warnDistance` px trước chỗ đặt
// thì báo trước (câu + tiếng vó), `delay` giây sau ngựa mới phi ra từ ngoài màn
// hình (Q2: né bằng nhảy hoặc lướt).
export const CAVALRY = { speed: -300, warnDistance: 620, delay: 1, hp: 2 };

// Câu hỏi chặn đường (điểm + luật ở engine):
//   level1Count  số câu mỗi lượt màn 1 (rút ngẫu nhiên, không trùng).
//   level1Spots  [chunk, localX] — chạm x này thì hỏi (theo thứ tự); giữa 2 ô nhóm.
//   level2Spots  [chunk, localX] — câu hỏi về NPC sắp gặp (pool cùng tên = id
//                NPC, thứ tự Mẹ -> Thúc Bảo (khoá `thucBao`) -> Sứ giả, MHD-00
//                quyết định 4), cùng chunk với NPC, trước 2 lính vây.
export const QUIZ = {
  level1Count: 4,
  level1Spots: [[3, 420], [5, 420], [8, 420], [10, 420]],
  level2Spots: { maThi: [3, 280], thucBao: [6, 280], suGia: [10, 280] }
};

// ---- Màn 2 "Dựng cờ Vạn An" (MHD-L2) ----
// 10 chunk đặt cố định (level2.js): đường Hoan Châu (1–3) -> đồng Sa Nam, dãy
// Hùng Sơn (4–6) -> bờ sông Lam (7–10). Đích cuối chunk 10, sau Sứ giả (không cổng).
export const LEVEL2_CHUNKS = 10;
export const LEVEL2_ZONES = [
  { id: 'MHD2A', x0: 0, x1: CHUNK_W * 3, sky: 'BG_TT_SKY_DAY', mid: 'BG_MHD_MID_TRIBUTE_ROAD' },
  { id: 'MHD2B', x0: CHUNK_W * 3, x1: CHUNK_W * 6, sky: 'BG_TT_SKY_DAY', mid: 'BG_MHD_MID_SA_NAM' },
  { id: 'MHD2C', x0: CHUNK_W * 6, x1: CHUNK_W * LEVEL2_CHUNKS, sky: 'BG_TT_SKY_DAY', mid: 'BG_MHD_MID_LAM_RIVER' }
];
export const LEVEL2_FINISH_X = CHUNK_W * 9 + 672;
// NPC [chunk, localX tâm, số sách cần (E6)] — id = khoá pool câu hỏi; sách chia 3 / 3 / 4.
export const LEVEL2_NPCS = {
  maThi: [3, 560, 3],
  thucBao: [6, 560, 6],
  suGia: [10, 560, 10]
};
// 2 lính áp giải vây mỗi NPC (engine đếm `captorOf`): tâm lệch `dx`, tuần trong
// [patrol] so với tâm NPC (như chương 4).
export const CAPTORS = [{ dx: -100, patrol: [-170, -30] }, { dx: 48, patrol: [-60, 80] }];
// 7 Quyển Sách Tinh Hoa cố định [chunk, localX, độ cao trên mặt đất]; 2 quyển
// trong xe cống (LEVEL2_LAYOUT.carts), 1 quyển lính mang (LEVEL2_LAYOUT.carrier).
//   trước Mẹ: ch1 đất, xe ch2, ch3 đất; trước Thúc Bảo: ch4 trên cao, ch5 đất,
//   lính mang ch5; trước Sứ giả: ch7 đất, ch8 trên cao, xe ch9, ch9 đất.
export const LEVEL2_ITEMS = [
  [1, 150, 56], [3, 100, 56],
  [4, 450, 64], [5, 100, 56],
  [7, 150, 56], [8, 420, 64], [9, 100, 56]
];
// Chướng ngại cố định từng chunk [chunk, localX] (level2.js). DESIGN_BASELINE.
export const LEVEL2_LAYOUT = {
  escorts: [[1, 600], [4, 600], [8, 260], [8, 600]],
  bushArchers: [[1, 300], [7, 250]],
  carts: [[2, 300], [9, 300]],
  boulders: [[2, 600], [8, 420]],
  towers: [[4, 300], [9, 620]],
  tiger: [5, 420],
  carrier: [5, 650],
  cavalry: [7, 600],
  bookLift: 40
};

// ---- Màn 3 "Công phá Tống Bình" (MHD-L3, docs/SUTA_MHD_TASK_L3_01.md) ----
// Đấu trường 1 chunk phẳng trước cổng phủ Đô hộ. Mọi số DESIGN_BASELINE.
export const ARENA = { width: CHUNK_W, playerStartX: 170, scoutEdge: 30 };
// Nền cổng: khai báo `mid` để engine nạp ảnh; render-extras.js tự vẽ theo toạ độ thế giới.
export const GATE_PLATE = 'BG_MHD_MID_TONG_BINH_GATE';
export const LEVEL3_ZONES = [
  { id: 'MHD3', x0: 0, x1: ARENA.width, sky: 'BG_TT_SKY_DAY', mid: GATE_PLATE }
];
// Quang Sở Khách (ô 64×64, thân 24×38). GĐ 1–2 đứng sau xe ở phase1X / phase2X.
// GĐ 3: tiến tới trong tầm `reach`, chuỗi `combo` nhát (máu ≤ enragedAt thì
// `comboEnraged`), mỗi nhát tiến `lunge` px, rồi `winded` giây hở sườn. Lưỡi đao
// ô hit 5, đo trên ảnh: [near, reach] từ tâm × [low, high] trên chân; attack_01
// quét thấp, attack_02 quét ngang thân.
export const BOSS = {
  id: 'BOSS_QUANG_SO_KHACH', w: 24, h: 38, hp: 12, phase1X: 700, phase2X: 724, minX: 12, speed: 44, retreatSpeed: 60,
  reach: 40, lunge: 12, combo: 2, comboEnraged: 3, enragedAt: 6, winded: 1.4, rest: .3, hintInterval: 4, defeatScore: 1500,
  blades: {
    attack_01: { near: 8, reach: 40, low: 0, high: 14 },
    attack_02: { near: 8, reach: 42, low: 12, high: 30 }
  }
};
// Xe bắn tiễn EN_TANG_ARROW_CART (ô 128×96, thân 120×58, tâm trùng tâm ô):
//   GĐ 1: đứng ở startX, loạt tên mỗi volleyGap giây khi người chơi trong aimRange;
//         vạch báo aimTime giây; điểm bắn (muzzleX, muzzleY) đo ở giá nỏ; 3 tên lệch `spread`.
//   GĐ 2: chạy trong [minX, maxX] (tâm). Báo trước `windup`, húc chargeSpeed; chỉ
//         nửa trước (`front` → mũi húc, cao frontH) gây sát thương để nhảy qua được.
//         Khựng ở tường wallStall giây, Viện Binh chặn: theo rescued (`stallFor`).
//   deck/lever: toạ độ so với tâm khi xe quay phải (lật khi quay trái); leverPerRound
//         nhát vào cần = 1 lượt, `rounds` lượt thì vỡ; hết khựng hất xuống, miễn thương throwOffGrace.
export const CART = {
  id: 'EN_TANG_ARROW_CART', w: 120, h: 58, startX: 600, minX: 68, maxX: 630,
  aimRange: 340, aimTime: .8, volleyGap: 3.5, muzzleX: 48, muzzleY: 50, spread: [-14, 0, 14],
  phase2Delay: 1.2, windup: .8, chargeSpeed: 240, recover: .3, wallStall: 1.8,
  front: -10, frontH: 54, ramTip: 62,
  deck: { from: -57.75, to: -14.5, height: 42.5 }, lever: { from: -51.75, to: -25.5 },
  leverPerRound: 2, rounds: 3, throwOffGrace: 1.2, throwOffVy: -260, leverAnim: .25, leverScore: 100
};
// Viện Binh chặn xe: `rescued` (dân phu cứu ở màn 1) -> giây khựng (MHD-00 §3.4).
export const stallFor = rescued => (rescued <= 1 ? 3 : rescued <= 3 ? 4 : 5);
// 2 vệ sĩ khiên sắt: tâm `centers`, tuần `patrol`. Khiên cháy khi hũ dầu trúng
// hoặc vỡ cách ≤ JAR.splash px. Hết khiên thì `hp` máu, chém được.
export const GUARDS = { centers: [380, 470], patrol: [320, 520], w: 22, h: 34, hp: 3, aggroRange: 220 };
export const JAR = { maxOnField: 2, splash: 36 };
// Trinh sát: ra từ mép xa người chơi mỗi `interval` giây, tối đa `max` con.
export const SCOUTS = { w: 22, h: 34, hp: 1, phase1: { interval: 4.5, max: 2 }, phase3: { interval: 7, max: 1 }, test: { interval: 3, max: 2 } };
export const HEAL_DROP = { chance: .25 };
// Tóe lửa trên khiên / giáp / xe (FX_BT_ARMOR_SPARK 16×16, chép chương 4).
export const SPARK = { id: 'FX_BT_ARMOR_SPARK', anim: 'impact' };
// Cờ đen PROP_MHD_BLACK_FLAG (32×64): tâm cột cách mép trái ô 4,25 -> tâm ô tại
// x, chân tại lỗ cắm trên cổng (cao footLift trên đất).
export const FLAG = { id: 'PROP_MHD_BLACK_FLAG', x: 652.25, footLift: 125 };
// Cutscene: bỏ vũ khí -> cốt truyện 1 -> phi ngựa tới cổng (gateX, mờ dần
// fleeFade giây cuối) -> tối/sáng (đặt Mai Thúc Loan guideX, người chơi playerX) ->
// cờ kéo lên -> cốt truyện 2 -> panel.
export const MHD_CUTSCENE = {
  disarmHold: .4, fleeSpeed: 220, gateX: 642, fleeFade: .35, fadeTime: .6, flagHold: .6, guideX: 560, playerX: 500
};
// Kỹ năng (phần thưởng màn 2 — MHD-L3 §3).
export const SKILLS = {
  BUFF_MHD_POWER: { slot: null, damage: 1.2, icon: 'ICON_BUFF_MHD_POWER' },
  SK_MHD_VAN_AN_SHELL: { slot: 'skill1', duration: 6, cooldown: 12, grace: .5, fx: 'FX_MHD_VAN_AN_SHELL', icon: 'ICON_SK_MHD_VAN_AN_SHELL' },
  SK_MHD_REINFORCE: {
    slot: 'skill2', cooldown: 14, speed: 300, w: 100, h: 50, scoutDamage: 2, push: 30,
    fx: 'FX_MHD_REINFORCE', fxHalf: 52, braceGap: 34, icon: 'ICON_SK_MHD_REINFORCE'
  }
};
// Câu thông báo trong trận (MHD-L3 §5 — Claude soạn, không phải nội dung lịch sử,
// duyệt Q1 08/11/2026).
export const BOSS_TEXT = {
  shieldHint: 'Khiên sắt gạt mọi đòn chém — hãy ném hũ dầu!',
  jarHint: 'Nhặt hũ dầu, bấm Đánh để ném vào vệ sĩ!',
  shieldBurn: 'Khiên sắt bốc cháy!',
  cartBlock: 'Xe bắn tiễn quá chắc — phải phá cần điều khiển!',
  bossSafe: 'Quang Sở Khách núp sau xe, chưa đánh được!',
  phase2: 'Quang Sở Khách thúc xe bắn tiễn húc thẳng!',
  chargeHit: 'Bạn bị xe bắn tiễn húc trúng!',
  boltHit: 'Bạn trúng tên!',
  stalled: 'Xe khựng lại — nhảy lên bục, đánh cần điều khiển!',
  reinforce: 'Viện binh chặn xe!',
  leverOff: 'Phải đứng trên bục mới với tới cần điều khiển!',
  phase3: 'Xe vỡ! Quang Sở Khách vác đại đao xông ra!',
  bladeHit: 'Bạn trúng đại đao!',
  bossGuard: 'Đại đao gạt đòn — chờ hắn đuối sức sau loạt chém!'
};

// ---- Môi trường ----
export const OBSTACLE_TYPES = {};
// Quyển Sách Tinh Hoa — sprite chương 2 (strip 4 ô 16×16 logic).
export const ITEM = { sprite: 'ITEM_BT_TINH_HOA', fps: 8 };
export const QUIZ_STELE_ID = 'PROP_TT_QUIZ_STELE';
export const MAP_PROPS_IN_GAME = [
  ITEM.sprite, QUIZ_STELE_ID, FINISH_GATE.closed, FINISH_GATE.open, BUSH.prop, TIGER_CAVE.prop
];

// ---- Quân địch, hazard, đạn ----
// Lính áp giải EN_TANG_ESCORT (ô 48×48; attack_01 frame_w 128): thân như lính
// chương 4 (22×34); đầu roi ô hit 4 cách pivot +46,75 (36 ngoài mép), cao 15,4
// trên chân = 18,6 từ đỉnh hitbox -> hộp roi y 14–23. Nhanh hơn lính chương 4.
export const SOLDIER = { w: 22, h: 34, hp: 2 };
export const GUARD = {
  patrolRange: 96, speed: 34, aggroRange: 150,
  attackReach: 36, attackBoxY: 14, attackBoxH: 9, attackCooldown: 1.4, damage: 1
};
// Vệ sĩ khiên sắt EN_TANG_SHIELD_GUARD (ô 48×48): mũi đao ô hit 4 ở +20,5 (9,5 ngoài
// mép), cao 26,5–29 -> hộp y 5–17; không khiên +19,25, cao 24–27.
const SHIELD_GUARD_RULES = { patrolRange: 96, speed: 28, aggroRange: 220, attackReach: 12, attackBoxY: 5, attackBoxH: 12, attackCooldown: 1.6, damage: 1 };
const BARE_GUARD_RULES = { ...SHIELD_GUARD_RULES, speed: 40, attackCooldown: 1.3 };
// Trinh sát EN_TANG_SCOUT: mũi dao ô hit 3 ở +18 (7 ngoài mép), cao 23,75–25,25.
const SCOUT_RULES = { speed: 130, attackRange: 6, attackReach: 10, attackBoxY: 6, attackBoxH: 10, rest: .9, damage: 1 };
export const ENEMY_SPRITES = {
  // Màn 3: còn khiên -> `plungeOnly` (chương không bật đòn bổ nên mọi đòn chém bị gạt).
  shieldGuard: {
    id: 'EN_TANG_SHIELD_GUARD', behavior: 'guard', rules: SHIELD_GUARD_RULES, plungeOnly: true,
    anims: { idle: 'idle', walk: 'walk', attack: 'attack_01', blocked: 'blocked', death: 'death' },
    attackMessage: 'Bạn bị vệ sĩ chém trúng!', contactMessage: 'Bạn va phải vệ sĩ khiên sắt!'
  },
  // Đang cháy khiên: đứng yên, vô hại (boss.js đặt aggroRange 0 + passive), phát shield_burn 1 lần.
  burningGuard: {
    id: 'EN_TANG_SHIELD_GUARD', behavior: 'guard', rules: { ...SHIELD_GUARD_RULES, speed: 0 }, plungeOnly: true,
    anims: { idle: 'shield_burn', death: 'death' }, contactMessage: 'Bạn va phải vệ sĩ khiên sắt!'
  },
  bareGuard: {
    id: 'EN_TANG_SHIELD_GUARD', behavior: 'guard', rules: BARE_GUARD_RULES,
    anims: { idle: 'bare_idle', walk: 'bare_walk', attack: 'bare_attack_01', hurt: 'hurt', death: 'death' },
    attackMessage: 'Bạn bị vệ sĩ chém trúng!', contactMessage: 'Bạn va phải vệ sĩ!', defeatMessage: 'Đã hạ vệ sĩ!'
  },
  scout: {
    id: 'EN_TANG_SCOUT', behavior: 'rusher', rules: SCOUT_RULES, idleHold: true,
    anims: { idle: 'run', walk: 'run', attack: 'attack_01', death: 'death' },
    attackMessage: 'Bạn bị trinh sát đâm trúng!', contactMessage: 'Bạn va phải lính trinh sát!'
  },
  quangSoKhach: {
    id: BOSS.id,
    anims: {
      idle: 'idle', walk: 'walk', command: 'command', attack_01: 'attack_01', attack_02: 'attack_02', winded: 'winded',
      blocked: 'blocked', hurt: 'hurt', disarm: 'disarm', flee: 'flee'
    }
  },
  arrowCart: {
    id: CART.id, anims: { idle: 'idle', fire: 'fire', charge: 'charge', stalled: 'stalled', lever_hit: 'lever_hit', break: 'break' }
  },
  normal: {
    id: 'EN_TANG_ESCORT', behavior: 'guard', rules: GUARD,
    anims: { idle: 'idle', walk: 'walk', attack: 'attack_01', hurt: 'hurt', death: 'death' },
    attackMessage: 'Bạn bị lính áp giải quất roi trúng!', contactMessage: 'Bạn va phải lính Đường!',
    defeatMessage: 'Đã đánh bại lính áp giải.'
  }
};
export const HAZARD_SPRITES = {
  // Hổ vồ (MHD-ENGINE E2) EN_TIGER (ô 64×48): `warn` gầm ở miệng hang, `leap`
  // dùng strip `pounce` (code nâng theo vòng cung), nghỉ đứng `idle`.
  tiger: {
    id: 'EN_TIGER', w: 48, h: 24, warnTime: .6, leapTime: .7, leapHeight: 70, leapRange: 200, recoverTime: 1,
    anims: { warn: 'warn', leap: 'pounce', recover: 'idle', hurt: 'hurt', death: 'death' },
    hitMessage: 'Bạn bị hổ vồ trúng!', breakMessage: 'Đã hạ hổ dữ!'
  },
  // Xe cống phẩm đứng yên chặn đường (Q3): `durations.idle` vô hạn -> fps 0 ->
  // đứng ở ô 1 của strip `roll` (bánh không quay). Vỡ thì phát `break`, xác nằm lại.
  tributeCart: {
    id: 'OB_TRIBUTE_CART', w: 48, h: 38, blocking: true, corpse: true,
    anims: { idle: 'roll', death: 'break' }, durations: { idle: Infinity },
    breakMessage: 'Đã phá xe cống phẩm, dân phu chạy thoát!'
  },
  // Quan thu thuế EN_TANG_TAX_OFFICIAL (ô 64×64): thân ~30, sọ→chân 43,5 ->
  // 30×44; tay buông hòm ô hit 4 ở +20,75; 33,25.
  taxOfficial: {
    id: 'EN_TANG_TAX_OFFICIAL', w: 30, h: 44, muzzle: 33.25, muzzleX: 20.75,
    anims: { idle: 'idle', move: 'walk', throw: 'throw', hurt: 'hurt', death: 'death' },
    hitMessage: 'Bạn va phải quan thu thuế!', breakMessage: 'Đã hạ quan thu thuế!'
  },
  // Hòm rỗng nằm lại (MHD-ENGINE E3) OB_MHD_EMPTY_CHEST: thân 17×16 trong ảnh
  // (Gate A2) -> hộp 18×16, chặn ngang; chém vỡ; hết `life` giây thì mất.
  emptyChest: {
    id: 'OB_MHD_EMPTY_CHEST', w: 18, h: 16, blocking: true, hp: 1, life: 8, maxLanded: 3,
    anims: { idle: 'idle', death: 'break' }, breakMessage: 'Đã phá hòm rỗng!'
  },
  // Cung thủ núp bụi (thrower đứng đất): tay giữ cung ô hit 5 ở +11; 25,5.
  archer: {
    id: 'EN_TANG_ARCHER', w: 20, h: 34, muzzle: 25.5, muzzleX: 11,
    anims: { idle: 'idle', throw: 'throw', hurt: 'hurt', death: 'death' },
    hitMessage: 'Bạn va phải cung thủ!', breakMessage: 'Đã hạ cung thủ!'
  },
  // Lính ném lao trên tháp (thrower đứng cao): tay phóng ô hit 5 ở +13,75; 18,75.
  javelin: {
    id: 'EN_TANG_JAVELIN', w: 20, h: 34, muzzle: 18.75, muzzleX: 13.75,
    anims: { idle: 'idle', throw: 'throw' }, hitMessage: 'Bạn va phải lính ném lao!'
  },
  // Tháp canh (hazard `prop` — chỉ vẽ), đặt TRƯỚC lính ném lao để vẽ phía sau.
  watchtower: { id: 'PROP_LUONG_WATCHTOWER', w: 28, h: 110, anims: { idle: 'idle' } },
  boulder: {
    id: 'OB_BOULDER', w: 18, h: 18, anims: { move: 'roll', idle: 'roll', death: 'break' },
    hitMessage: 'Bạn bị đá lăn trúng!', breakMessage: 'Đá tảng vỡ tan!'
  },
  // Kỵ binh EN_TANG_CAVALRY (ô 96×64): hộp theo thân ngựa + người cưỡi ~64×36
  // (bụng cách đất ~10, sọ người cưỡi ~37,5) — nhảy hoặc lướt qua được (Q2).
  cavalry: {
    id: 'EN_TANG_CAVALRY', w: 64, h: 36, anims: { move: 'gallop', idle: 'gallop', hurt: 'hurt', death: 'death' },
    hitMessage: 'Bạn bị kỵ binh Đường húc trúng!', breakMessage: 'Đã hạ kỵ binh Đường!'
  }
};
export const PROJECTILE_SPRITES = {
  emptyChest: { id: 'PJ_SILVER_CHEST', anim: 'loop', w: 14, h: 12, lob: { flightTime: .9, gravity: 700 }, landAs: 'emptyChest' },
  crossbowBolt: { id: 'PJ_CROSSBOW_BOLT', anim: 'idle', w: 12, h: 3 },
  javelin: { id: 'PJ_SPEAR', anim: 'idle', w: 22, h: 4 }
};
// Hũ dầu (MHD-ENGINE E1, DESIGN_BASELINE): layout thử + màn 3 (MHD-L3).
export const CARRY = {
  oilJar: {
    sprite: 'PJ_OIL_JAR', anim: 'loop', w: 10, h: 10, pickup: { w: 22, h: 22, life: 12 },
    // Tầm 120: từ 84–156 px trước vệ sĩ là trúng hoặc văng lửa tới (MHD-L3).
    range: 120, flightTime: .6, gravity: 600, damage: 1,
    impact: { id: 'FX_OIL_FIRE', anim: 'impact', w: 32, h: 24, time: .6 }
  }
};
// Dân phu được cứu (MHD-ENGINE E5): tối đa 5 (5 xe cống màn 1).
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
// NPC: Mai Thúc Loan dẫn màn 1; 3 NPC màn 2 (id = khoá pool câu hỏi).
const NPC_ANIMS = { idle: 'idle', talk: 'talk' };
export const NPC_SPRITES = {
  maiThucLoan: { id: 'NPC_MAI_THUC_LOAN', portrait: 'PORTRAIT_MAI_THUC_LOAN', anims: NPC_ANIMS },
  maThi: { id: 'NPC_MHD_MOTHER', portrait: 'PORTRAIT_MHD_MOTHER', anims: NPC_ANIMS },
  thucBao: { id: 'NPC_MHD_SA_NAM_HERO', portrait: 'PORTRAIT_MHD_SA_NAM_HERO', anims: NPC_ANIMS },
  suGia: { id: 'NPC_MHD_LAM_AP_ENVOY', portrait: 'PORTRAIT_MHD_LAM_AP_ENVOY', anims: NPC_ANIMS }
};
// Bình hồi máu (chương 3) — màn 3 rơi theo HEAL_DROP (boss.js dropHeal).
export const PICKUPS = { heal: { id: 'ITEM_LND_HEAL', anim: 'idle' } };

// ---- Phần thưởng màn 2 (id khớp seed backend/migrations/009_mai_hac_de.sql) ----
// Tên theo docs/SUTA_MHD_TASK_00.md §3.4 (duyệt 07/11/2026); cơ chế ở skills.js.
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
  projectileHit: 'Bạn trúng đòn của quân Đường!',
  bossContact: 'Bạn va phải quan thu thuế!',
  bossDefeated: 'Đã hạ quan thu thuế!',
  bossBlocksFinish: 'Hãy hạ quan thu thuế trước khi qua trạm gác.',
  itemPicked: (count, total) => `Đã thu thập Quyển Sách Tinh Hoa ${count}/${total}`,
  itemsMissing: count => `Bạn còn thiếu ${count} Quyển Sách Tinh Hoa.`,
  rescueHint: name => `Hãy hạ quân Đường đang vây ${name}!`,
  burdenHint: 'Đang gánh nặng! Tới xe cống rồi bấm Đánh để đập sọt.',
  // MHD-L1 (câu thông báo kỹ thuật, không phải nội dung lịch sử).
  cavalryWarn: 'Tiếng vó ngựa! Nhảy hoặc lướt để né kỵ binh.',
  // MHD-L2 (TQP-ENGINE E6 — NPC khoá theo sách).
  npcLocked: (need, have) => `Cần ${need} Quyển Sách Tinh Hoa mới gặp được (đang có ${have}).`,
  // MHD-L3: khiên sắt gạt đòn (engine player.js blockedByGuard).
  plungeHint: BOSS_TEXT.shieldHint
};
