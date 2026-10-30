// Hằng số RIÊNG chương Bà Triệu (chương 2) — không chứa logic. Hằng số chung
// mọi chương ở engine/config.js. Mọi toạ độ/kích thước/tốc độ là pixel logic.
//
// Asset riêng chương: đợt Codex BT_ART_01 (docs/CODEX_PROMPT_BT_ART_01.md) và
// BT_ART_02 (docs/CODEX_PROMPT_BT_ART_02.md, nhập 21/10/2026 — lính Ngô + Bà Triệu
// vẽ lại theo chuẩn cao 34 px logic; NPC/FX/icon màn 2 chờ BT-L2). Trời, tile mặt đất/địa hình,
// lớp giữa làng, bia câu hỏi, 2 vật cản MƯỢN của chương Trưng Trắc qua
// BORROWED_MAPS (prompt: "dùng lại, không vẽ"). Không import file nào của chương
// 1. Màn 1 = BT-L1, màn 2 = BT-L2, màn 3 = BT-L3 (boss Lục Dận + 3 kỹ năng,
// asset BT_ART_03 — docs/SUTA_BT_TASK_L3_01.md). Mọi số DESIGN_BASELINE.

import { CHUNK_W } from '../../engine/config.js';

// ---- Asset ----
// Manifest là nguồn duy nhất cho frames/fps/loop/hit_frame (density 4,
// pivot bottom-center, quay phải) — không chép số đó vào đây.
export const SPRITE_ROOT = '/static/assets/images/ba-trieu/sprites-32bit/';
export const SPRITE_MANIFEST_FILE = 'manifest_bt.json';
export const MAP_ROOT = '/static/assets/images/ba-trieu/maps-32bit/';
export const MAP_MANIFEST_FILE = 'maps_bt.json';
// Asset map mượn của chương Trưng Trắc (engine assets.js addBorrowedMaps).
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

// Ảnh DOM — nạp ở mọi màn: chân dung Bà Triệu (dẫn màn 1), 3 NPC màn 2, Lục Dận
// (cốt truyện màn 3) + 3 icon kỹ năng màn 3 (ô HUD, nút cảm ứng).
export const PORTRAITS = [
  'PORTRAIT_BA_TRIEU', 'PORTRAIT_TRIEU_QUOC_DAT', 'PORTRAIT_LY_HOANG', 'PORTRAIT_BACH_TUONG', 'PORTRAIT_LUC_DAN',
  'ICON_SK_BT_CRIT', 'ICON_SK_BT_RATTAN_SHIELD', 'ICON_SK_BT_WHITE_ELEPHANT'
];

// Sprite canvas mỗi màn cần (chỉ nạp ảnh màn đang chơi dùng). Màn 1 gồm cả
// layout thử ?layout=engine; PLAYER_BA_TRIEU = Bà Triệu đứng chờ (NPC dẫn).
export const LEVEL_SPRITES = {
  1: [
    'PLAYER_BA_TRIEU', 'EN_NGO_LUMBERJACK', 'EN_NGO_HUNTER', 'PJ_CROSSBOW_BOLT', 'OB_BOULDER', 'EN_WILD_ELEPHANT',
    'TR_BAMBOO_SPIKE_PIT', 'EN_NGO_CAVALRY', 'FX_MIASMA', 'EN_NGO_TAX_OFFICIAL', 'PJ_SILVER_CHEST'
  ],
  2: [
    'NPC_TRIEU_QUOC_DAT', 'NPC_HO_LY', 'NPC_BACH_TUONG', 'EN_NGO_SOLDIER', 'EN_NGO_LUMBERJACK', 'EN_NGO_HUNTER',
    'PJ_CROSSBOW_BOLT', 'OB_BOULDER', 'TR_BAMBOO_SPIKE_PIT', 'EN_NGO_CAVALRY'
  ],
  3: [
    'BOSS_LUC_DAN', 'PROP_BT_COMMAND_TOWER', 'EN_BT_GOLD_TOWER', 'EN_NGO_ARMORED_CAVALRY', 'PJ_BT_POISON_ARROW',
    'PJ_BT_GOLD_COIN', 'FX_BT_STUN', 'FX_BT_ARMOR_SPARK', 'FX_BT_RATTAN_SHIELD', 'FX_BT_CRIT', 'NPC_BACH_TUONG',
    'PLAYER_BA_TRIEU_ELEPHANT'
  ]
};

// URL trang từng màn (route ở backend/routes/pages.py).
export const LEVEL_URLS = {
  1: '/gameplay/levels/ba-trieu',
  2: '/gameplay/levels/ba-trieu/2',
  3: '/gameplay/levels/ba-trieu/3'
};

// ---- Màn 1 "Rừng núi Nưa" (BT-L1) ----
// 12 chunk = 9216 px = stage_length của maps_bt.json. Vùng cảnh: làng Quan Yên
// (nền làng mượn chương 1) -> rừng nứa -> rừng thiêng -> sườn núi đá -> rừng
// nứa -> doanh trại núi Nưa (cổng trại = đích). Nhóm chướng ngại xáo trong vùng
// được phép (level1.js) để đúng cảnh.
export const LEVEL1_CHUNKS = 12;
export const LEVEL1_ZONES = [
  { id: 'BT1', x0: 0, x1: CHUNK_W, sky: 'BG_TT_SKY_DAY', mid: 'BG_TT_MID_VILLAGE' },
  { id: 'BT2', x0: CHUNK_W, x1: CHUNK_W * 3, sky: 'BG_TT_SKY_DAY', mid: 'BG_BT_MID_NUA_FOREST' },
  { id: 'BT3', x0: CHUNK_W * 3, x1: CHUNK_W * 5, sky: 'BG_TT_SKY_DAY', mid: 'BG_BT_MID_SACRED_FOREST' },
  { id: 'BT4', x0: CHUNK_W * 5, x1: CHUNK_W * 8, sky: 'BG_TT_SKY_DAY', mid: 'BG_BT_MID_ROCKY_SLOPE' },
  { id: 'BT2', x0: CHUNK_W * 8, x1: CHUNK_W * 10, sky: 'BG_TT_SKY_DAY', mid: 'BG_BT_MID_NUA_FOREST' },
  { id: 'BT5', x0: CHUNK_W * 10, x1: CHUNK_W * LEVEL1_CHUNKS, sky: 'BG_TT_SKY_DAY', mid: 'BG_BT_MID_CAMP' }
];
// Đích = worldX(12, 618) như chương 1; cổng trại đặt TÂM tại đây (192px ->
// trải 8970–9162 < 9216), không hitbox; mở khi đủ sách + hạ mini-boss.
export const LEVEL1_FINISH_X = CHUNK_W * 11 + 618;
// Đáy hình cổng ở hàng 174,5/176 logic (trống 1,5 px dưới chân cột) -> chìm 2 px
// để chân cột chạm đất (`sink`, engine drawFinishGate).
export const FINISH_GATE = { closed: 'PROP_BT_CAMP_GATE', open: 'PROP_BT_CAMP_GATE_OPEN', worldX: LEVEL1_FINISH_X, sink: 2 };
// Bà Triệu đứng chờ ở chunk 1 (NPC dẫn — như Trưng Trắc chương 1).
export const GUIDE_LOCAL_X = 190;
// Mini-boss tham quan thu thuế (patrol, như kiệu quan chương 1 — Q4: 6 đòn):
// cố định chunk 11, đi tuần patrolRange quanh localX, vào fireRange thì dừng
// ném hòm bạc rỗng; fireInterval tính từ lúc ném xong.
export const MINIBOSS = {
  chunk: 11, localX: 510, hp: 6, patrolRange: 160, speed: 30,
  fireRange: 240, fireInterval: 2.5, hitScore: 100, defeatScore: 700
};
// Hố chông tre cố định chunk 11 (ngoài 10 nhóm xáo) — đủ 12 chướng ngại.
export const FIXED_PIT = { chunk: 11, localX: 220 };
// Nghỉ chân hồi 1 máu (Q2) — 1 lần khi vượt điểm này.
export const REST = { chunk: 9, localX: 282 };
// 5 Quyển Sách Tinh Hoa cố định: [chunk, localX, độ cao trên mặt đất].
export const LEVEL1_ITEMS = [[2, 390, 56], [4, 640, 60], [6, 300, 64], [7, 600, 72], [9, 420, 60]];

// ---- Màn 2 "Chiêu mộ hiền tài" (BT-L2, docs/SUTA_BT_TASK_L2_01.md) ----
// 9 chunk cố định: rừng nứa (Triệu Quốc Đạt) -> sườn đá -> đầm lầy Bồ Điền (họ
// Lý, Bạch Tượng). Đồi xa đồng bằng riêng màn (engine LEVEL.farHills). Về đích
// cuối chunk 9 khi đã gặp đủ 3 NPC (không cổng, như chương 1).
export const LEVEL2_CHUNKS = 9;
export const LEVEL2_ZONES = [
  { id: 'BT2', x0: 0, x1: CHUNK_W * 3, sky: 'BG_TT_SKY_DAY', mid: 'BG_BT_MID_NUA_FOREST' },
  { id: 'BT4', x0: CHUNK_W * 3, x1: CHUNK_W * 5, sky: 'BG_TT_SKY_DAY', mid: 'BG_BT_MID_ROCKY_SLOPE' },
  { id: 'BT6', x0: CHUNK_W * 5, x1: CHUNK_W * LEVEL2_CHUNKS, sky: 'BG_TT_SKY_DAY', mid: 'BG_BT_MID_MARSH' }
];
export const LEVEL2_FAR_HILLS = { id: 'BG_BT_FAR_PLAIN', parallax: 0.2, bottomY: 230, hiddenUnderSky: [] };
export const LEVEL2_FINISH_X = CHUNK_W * LEVEL2_CHUNKS - 96;
// Quân vây NPC (giải cứu): [dx tâm so với tâm NPC, đoạn tuần tra [min, max]].
// Triệu Quốc Đạt = như engine NPC_RESCUE (1 trái, 1 phải); họ Lý (nhóm 3 người
// rộng ±43) cả 2 lính bên trái, đoạn tuần tra tới chỗ người chơi bị giữ
// (holdGap 48); Bạch Tượng: 2 thợ săn nấp bên trái (đứng yên, bắn nỏ).
export const CAPTORS = {
  quocDat: [{ dx: -100, patrol: [-170, -30] }, { dx: 48, patrol: [-60, 80] }],
  hoLy: [{ dx: -110, patrol: [-180, -60] }, { dx: -170, patrol: [-240, -60] }],
  bachTuong: [{ dx: -130 }, { dx: -220 }]
};

// ---- Màn 3 "Chiến lũy Bồ Điền" (BT-L3, docs/SUTA_BT_TASK_L3_01.md) ----
// Đấu trường 1 chunk, tường vô hình 2 đầu, nền chiến lũy (đầm lầy – rào tre –
// núi đá). Đài chỉ huy bên phải (Lục Dận đứng trên, không với tới), 3 tháp vàng
// giữa đấu trường, kỵ binh thiết giáp ra từ mép phải. Mọi số DESIGN_BASELINE.
export const ARENA = { width: CHUNK_W, playerStartX: 170, spawnX: CHUNK_W + 40 };
export const LEVEL3_ZONES = [
  { id: 'BT7', x0: 0, x1: ARENA.width, sky: 'BG_TT_SKY_DAY', mid: 'BG_BT_MID_FORTRESS' }
];
export const LEVEL3_FAR_HILLS = LEVEL2_FAR_HILLS;

// Đài chỉ huy PROP_BT_COMMAND_TOWER (sprite 96×160, pivot giữa chân): sàn cao 128 px
// logic trên mặt đất, rộng ±19,5 quanh tâm (report Gate C1). `shake` 4@16 lặp,
// `collapse` 10@12. Lục Dận đứng giữa sàn.
//   x            tâm đài (cách mép phải 150 — trong khung nhìn rộng 640 khi
//                người chơi đứng đầu đấu trường)
//   floor        độ cao sàn trên mặt đất
//   shakeTime    rung trước khi sụp (giây); collapse dùng thời lượng manifest
export const COMMAND_TOWER = { id: 'PROP_BT_COMMAND_TOWER', x: CHUNK_W - 150, floor: 128, shakeTime: .6 };

// Boss Lục Dận BOSS_LUC_DAN (ô 48×48):
//   GĐ 1–2 đứng trên đài, `command` (6@12, hit 3) mỗi `commandInterval` giây (GĐ 2:
//   `commandIntervalP2`) — ở hit_frame phát 1 loạt mưa tên độc.
//   GĐ 3: rơi (`fall` 6@12) từ sàn xuống đất trước đài (tâm `groundX`), đứng trong
//   bùn (`mud_idle`). Thân trong bùn đo được −16…+10,5, cao 31 px -> hitbox 24×30.
//   `passive` (không tấn công, chạm không mất máu), `hp` máu; trúng đòn `hurt`
//   (3@12) + đẩy lùi `knockback` px về phía đài. Hết máu: `flee` (8@16) chạy
//   sang phải `fleeSpeed` px/s.
export const BOSS_LD = {
  id: 'BOSS_LUC_DAN', commandInterval: 3.5, commandIntervalP2: 5, startDelay: 2.4,
  groundX: CHUNK_W - 210, w: 24, h: 30, hp: 8, knockback: 10, maxX: CHUNK_W - 160,
  fleeSpeed: 120, hitScore: 150, defeatScore: 1000
};

// Mưa tên độc (PJ_BT_POISON_ARROW 8×24, mũi ở hàng đáy ô, rơi thẳng): mỗi loạt
// `count` mũi quanh người chơi (lệch ±spread), vạch báo đỏ trên đất `warnTime`
// giây rồi rơi `fallSpeed` px/s từ mép trên. Hitbox 4×10 ở đầu mũi. −1 máu.
export const POISON_ARROWS = { id: 'PJ_BT_POISON_ARROW', anim: 'idle', count: 3, spread: 70, warnTime: .7, fallSpeed: 420, w: 4, h: 10 };

// Tháp canh chứa vàng EN_BT_GOLD_TOWER (ô 48×96): thân thấy được ±20,5, cao 83
// -> hitbox 36×80. Đứng yên, `hp` máu; quay về phía người chơi; `throw` (6@10,
// hit 4) mỗi `throwInterval` giây (tháp lệch nhịp `phase`), tiền rời tay ở
// (+21,5, −55,25) px so với chân (report Gate C2). Hết máu `destroyed` (8@12),
// đống đổ nằm lại. Bạch Tượng húc: −`elephantDamage` máu.
export const GOLD_TOWER = {
  id: 'EN_BT_GOLD_TOWER', xs: [240, 365, 490], w: 36, h: 80, hp: 4,
  throwInterval: 2.8, phase: .9, startDelay: 1.6, muzzleX: 21.5, muzzle: 55.25, elephantDamage: 2
};

// Đồng tiền vàng PJ_BT_GOLD_COIN (ô 16×16, xoay 6@18): bay vòng cung, rơi tới
// chỗ người chơi lúc ném sau `flightTime` giây. Trúng người chơi (không miễn
// thương): không mất máu, CHOÁNG `stun` giây (engine stunPlayer, có FX_BT_STUN).
// Hitbox 8×8. Chạm đất thì biến mất.
export const GOLD_COIN = { id: 'PJ_BT_GOLD_COIN', anim: 'loop', flightTime: 1.1, gravity: 520, w: 8, h: 8, stun: 1.2 };
// Vòng choáng FX_BT_STUN (32×16, tâm vòng ở (16, 8) logic): tâm đặt `lift` px trên đỉnh đầu.
export const STUN_FX = { id: 'FX_BT_STUN', anim: 'loop', lift: 0 };

// Kỵ binh thiết giáp EN_NGO_ARMORED_CAVALRY (ô 96×64, `blocked` riêng frame_w 104):
// ngựa + người thấy được −35…+44, cao ~44 px -> hitbox 64×40. `count` lượt, mỗi
// lượt 1 con ra từ ARENA.spawnX, phi `speed` px/s về phía người chơi, chạm
// tường quay đầu. Chạm thân −1 máu (lướt né được). Đòn chém thường bị giáp chặn
// (`blocked` 4@20 + FX_BT_ARMOR_SPARK). Chỉ Bạch Tượng húc mới hạ được:
// `knockback` (8@14, bị hất `pushSpeed` px/s) -> `death` (6@12) -> xác nằm
// `corpseTime` giây. Lượt sau ra `gap` giây sau khi lượt trước ngã.
export const ARMORED_CAVALRY = {
  id: 'EN_NGO_ARMORED_CAVALRY', count: 3, w: 64, h: 40, speed: 150, gap: 1.6, startDelay: 1.2,
  pushSpeed: 140, corpseTime: 2, spark: 'FX_BT_ARMOR_SPARK', hintInterval: 4, defeatScore: 500
};

// Câu chữ thông báo riêng trận (BT-L3 Q1, duyệt 28/10/2026).
export const BOSS_TEXT = {
  coinStun: 'Không nhận vàng giặc!',
  armorHint: 'Giáp quá dày — hãy gọi Bạch Tượng (L)!',
  phase3: 'Đài chỉ huy rung chuyển!',
  arrowHit: 'Bạn trúng tên độc!',
  cavalryHit: 'Kỵ binh thiết giáp xông tới húc trúng bạn!'
};

// Cutscene kết chương (giây, px/s): Lục Dận trúng đòn cuối đứng `beatenHold`, tối
// dần `fadeTime` (người chơi về x `playerX`); Bạch Tượng cúi chào (`bow`) tại
// `elephantX`, chớp tối `mountFade` rồi Bà Triệu cưỡi voi
// (PLAYER_BA_TRIEU_ELEPHANT) đứng `mountHold`, lao sang phải `chargeSpeed`
// tới `chargeToX`; cờ PROP_BT_VICTORY_FLAG (24×32, pivot bottom-left = chân cán)
// cắm trên đỉnh đống đổ đài chỉ huy (collapse ô cuối cao ~18 px): chân cán tại
// x `flag.x`, cao `flag.lift` px trên mặt đất (nền chiến lũy là lớp parallax nên
// không gắn cờ vào ụ đất trong nền) rồi panel cốt truyện câu 2.
export const BT_CUTSCENE = {
  beatenHold: .8, fadeTime: .6, playerX: 120, elephantX: 300, mountFade: .35, mountHold: .6,
  chargeSpeed: 150, chargeToX: CHUNK_W - 240, victoryHold: 1,
  flag: { id: 'PROP_BT_VICTORY_FLAG', x: CHUNK_W - 154, lift: 15 }
};

// Layout thử kỹ năng `?layout=skills` (màn 3): bao cát + kỵ binh thiết giáp ra
// lặp (không boss, không tháp, không mưa tên).
export const SKILL_TEST = { dummyX: 420, dummyHp: 99, cavalryGap: 3 };

// Câu hỏi chặn đường (điểm + luật ở engine):
//   level1Count  số câu mỗi lượt màn 1 (rút ngẫu nhiên, không trùng).
//   level1Spots  [chunk, localX] — chạm x này thì hỏi (theo thứ tự).
//   level2Spots  [chunk, localX] — câu hỏi về NPC sắp gặp (pool cùng tên).
export const QUIZ = {
  level1Count: 4,
  level1Spots: [[3, 312], [5, 640], [8, 312], [10, 560]],
  level2Spots: { quocDat: [2, 560], hoLy: [5, 560], bachTuong: [8, 560] }
};

// ---- Môi trường ----
// Vật cản tĩnh (mượn maps_tt.json). Cách neo: rule trung-trac-gameplay.md.
export const OBSTACLE_TYPES = {
  fallenBranch: { id: 'OBS_FALLEN_BRANCH', anchor: 'bottom', groundSink: 4 },
  stoneBlock: { id: 'OBS_STONE_BLOCK', anchor: 'bottom', groundSink: 4 }
};
// Bục cành cây (makePlatform `sprite`): ảnh 64×16 / 128×16 logic, mặt trên ở
// hàng 0, thân cành từ visible_bbox.x — bề ngang bục = visible_bbox.w (60 / 120).
export const BRANCH = { short: { sprite: 'PROP_BT_BRANCH', w: 60 }, long: { sprite: 'PROP_BT_BRANCH_LONG', w: 120 } };
// Quyển Sách Tinh Hoa: strip 4 ô 16×16 logic.
export const ITEM = { sprite: 'ITEM_BT_TINH_HOA', fps: 8 };
export const QUIZ_STELE_ID = 'PROP_TT_QUIZ_STELE';
export const MAP_PROPS_IN_GAME = [
  ...Object.values(OBSTACLE_TYPES).map(type => type.id), ITEM.sprite, QUIZ_STELE_ID,
  FINISH_GATE.closed, FINISH_GATE.open, BRANCH.short.sprite, BRANCH.long.sprite, 'PROP_BT_VICTORY_FLAG'
];

// ---- Quân địch, hazard, đạn ----
// Hitbox (w, h) tính từ pivot bottom-center, đo từ strip BT_ART_02 (lính Ngô vẽ
// lại ×1,097 theo chuẩn cao 34 px logic, px logic) — KHÔNG lấy từ cỡ ảnh. DESIGN_BASELINE.
// Lính đốn gỗ EN_NGO_LUMBERJACK (hành vi `guard` của engine): thân cao ~34 px
// logic (kể cả mũ) -> hitbox 24×34 (LUMBERJACK — nội dung màn dùng). Rìu ở ô hit 7
// (10@10, vẽ lại BT_ART_02_FIX_LJ cùng khổ người idle): đầu rìu cách tâm 25 px
// (13 px ngoài mép hitbox), cao 0–10,5 px trên mặt chân — ô đánh 0–12 px = 22–34 px từ đỉnh hitbox. Vung chậm, sát thương 2 (BT-00
// §3.1); nghỉ 1,8 s giữa 2 nhát.
export const LUMBERJACK = { w: 24, h: 34, hp: 2 };
export const GUARD = {
  patrolRange: 96, speed: 20, aggroRange: 110,
  attackReach: 14, attackBoxY: 22, attackBoxH: 12, attackCooldown: 1.8, damage: 2
};
export const SOLDIER = { w: 22, h: 34, hp: 2 };
export const SOLDIER_GUARD = {
  patrolRange: 96, speed: 22, aggroRange: 130,
  attackReach: 49, attackBoxY: 10, attackBoxH: 9, attackCooldown: 1.6, damage: 1
};
export const ENEMY_SPRITES = {
  normal: {
    id: 'EN_NGO_LUMBERJACK', behavior: 'guard', rules: GUARD,
    anims: { idle: 'idle', walk: 'walk', attack: 'attack_01', hurt: 'hurt', death: 'death' },
    attackMessage: 'Bạn bị lính đốn gỗ bổ rìu trúng!', contactMessage: 'Bạn va phải lính Ngô!',
    defeatMessage: 'Đã đánh bại lính đốn gỗ.'
  },
  // Lính Ngô thường EN_NGO_SOLDIER (BT-L2, quân vây NPC — enemy `art: 'soldier'`):
  // thân ~14 px rộng, sọ→chân ~35 -> hitbox 22×34. Kích ô hit 4 (9@18) vươn tới
  // 60 px từ tâm (49 px ngoài mép), cao 16–24 px trên chân = 10–18 px từ đỉnh
  // hitbox. Q4: giữ đúng tầm hình nhưng sát thương 1, nghỉ 1,6 s.
  soldier: {
    id: 'EN_NGO_SOLDIER', behavior: 'guard', rules: SOLDIER_GUARD,
    anims: { idle: 'idle', walk: 'walk', attack: 'attack_01', hurt: 'hurt', death: 'death' },
    attackMessage: 'Bạn bị lính Ngô đâm kích trúng!', contactMessage: 'Bạn va phải lính Ngô!',
    defeatMessage: 'Đã đánh bại lính Ngô.'
  },
  // Màn 3 (BT-L3): enemy `kind` riêng chương (boss.js ENEMY_KINDS) — hành vi +
  // animation do chương lo; bảng này chỉ ánh xạ tên trạng thái -> animation.
  goldTower: {
    id: 'EN_BT_GOLD_TOWER', anims: { idle: 'idle', throw: 'throw', hurt: 'hurt', death: 'destroyed' }
  },
  armoredCavalry: {
    id: 'EN_NGO_ARMORED_CAVALRY',
    anims: { idle: 'gallop', gallop: 'gallop', blocked: 'blocked', knockback: 'knockback', death: 'death' }
  },
  lucDan: {
    id: 'BOSS_LUC_DAN', anims: { idle: 'mud_idle', hurt: 'hurt', flee: 'flee' }
  },
  // Bao cát layout thử `?layout=skills` (không asset — hộp tạm + thanh máu).
  dummy: { id: null, anims: {} }
};
export const HAZARD_SPRITES = {
  // Hố chông tre (trap): như chông sắt chương 1, chìm 3 px vào cỏ.
  bambooPit: {
    id: 'TR_BAMBOO_SPIKE_PIT', w: 36, h: 6, sink: 3, anims: { idle: 'hidden', sprung: 'reveal' },
    springMessage: 'Bẫy chông tre bật lên!', sprungMessage: 'Bạn giẫm phải chông tre!'
  },
  // Voi rừng chưa thuần (roller, không giết được): thân thấy được rộng ~96,
  // cao ~52 px logic; lưng cao 48–50 px -> bục `ride` (mặt bục cách đỉnh hitbox
  // `top`, hụt mỗi bên `inset`). Va ngang mất máu, nhảy lên lưng được chở theo.
  wildElephant: {
    id: 'EN_WILD_ELEPHANT', w: 84, h: 52, anims: { move: 'walk', idle: 'idle' }, ride: { top: 3, inset: 12 },
    hitMessage: 'Voi rừng húc trúng bạn! Hãy nhảy lên lưng voi.'
  },
  // Đá tảng lăn (roller có máu — chém vỡ được, hoặc nhảy qua): đá thấy được ~20 px.
  boulder: {
    id: 'OB_BOULDER', w: 18, h: 18, anims: { move: 'roll', idle: 'roll', death: 'break' },
    hitMessage: 'Bạn bị đá tảng lăn trúng!', breakMessage: 'Đá tảng vỡ tan!'
  },
  // Chướng khí rừng thiêng (vent): khe đất rộng 42 px, cột khí cao 44 px logic <
  // chân người chơi đứng trên cành 60 px -> trên cành an toàn. Chu kỳ
  // off/warn/active (giây); lướt KHÔNG né được (ignoreDash — BT-ENGINE Q4).
  miasma: {
    id: 'FX_MIASMA', w: 40, h: 44, anims: { idle: 'idle', warn: 'warn', active: 'active' },
    cycle: { off: 1.6, warn: .6, active: 1.2 }, ignoreDash: true,
    hitMessage: 'Bạn hít phải chướng khí! Hãy leo lên cành cây.'
  },
  // Thợ săn nấp trong bụi (thrower): bụi + người cao ~20 px; đầu nỏ ô hit 5
  // cao ~20 px, cách tâm ~12,5 px (report Codex Gate B1 bản sửa 1).
  ngoHunter: {
    id: 'EN_NGO_HUNTER', w: 26, h: 20, muzzle: 20, muzzleX: 13,
    anims: { idle: 'idle', throw: 'throw', hurt: 'hurt', death: 'death' },
    hitMessage: 'Bạn va phải thợ săn quan lại!', breakMessage: 'Đã hạ thợ săn quan lại!'
  },
  // Kỵ binh Ngô (roller): ngựa + người thấy được ~82×37,5 px.
  ngoCavalry: {
    id: 'EN_NGO_CAVALRY', w: 61, h: 37, anims: { move: 'gallop', idle: 'gallop', hurt: 'hurt', death: 'death' },
    hitMessage: 'Kỵ binh Ngô xông tới đâm trúng bạn!', breakMessage: 'Đã hạ kỵ binh Ngô!'
  },
  // Mini-boss tham quan thu thuế (patrol): thân ~40×44 px; hòm rời tay ô hit 4,
  // cao 31 px, cách tâm 22 px.
  ngoTaxOfficial: {
    id: 'EN_NGO_TAX_OFFICIAL', w: 30, h: 44, muzzle: 31, muzzleX: 22,
    anims: { move: 'walk', idle: 'idle', throw: 'throw', hurt: 'hurt', death: 'death' },
    breakMessage: 'Đã hạ tham quan thu thuế!'
  }
};

// Layout thử `?layout=engine` (màn 1 — BT-ENGINE B): bục, bục trên hố, cành
// cây trên chướng khí, voi rừng, đá lăn. Độ cao bục tính từ mặt đất (px).
// Bục = [chunk, localX, cao, loại cành BRANCH]; 3 cành dài nối nhau phủ 3 miệng khí.
export const ENGINE_TEST = {
  stairs: [[1, 260, 40, 'short'], [1, 380, 72, 'short']],
  // Hố chunk 2: cột 20–25 (x local 320–416); bục bắc ngang trên hố.
  holeRow: '####################......######################',
  holeChunk: 2,
  overHole: [2, 338, 36, 'short'],
  branches: [[3, 150, 60, 'long'], [3, 270, 60, 'long'], [3, 390, 60, 'long']],
  vents: [[3, 200, 0], [3, 310, .8], [3, 420, 1.6]],
  elephant: { chunk: 4, localX: 700, speed: -60, triggerLocalX: 150 },
  boulder: { chunk: 5, localX: 700, speed: -120, triggerLocalX: 200, hp: 2 }
};
// Đạn (bay ngang, strip quay PHẢI): hitbox nhỏ hơn hình.
export const PROJECTILE_SPRITES = {
  crossbowBolt: { id: 'PJ_CROSSBOW_BOLT', anim: 'idle', w: 12, h: 3 },
  silverChest: { id: 'PJ_SILVER_CHEST', anim: 'loop', w: 10, h: 10 }
};
// NPC: Bà Triệu dẫn màn 1; 3 NPC màn 2 (BT_ART_02). NPC_HO_LY: 3 người trong 1
// ô 112×48 (thấy được ±43 px quanh tâm), chỉ Lý Hoằng (giữa) nói.
// NPC_BACH_TUONG ô 128×96 (thân voi ±52 px): `bow` để BT-L3 (Q5), `charge`
// dùng cho kỹ năng Gọi Bạch Tượng. `holdGap` (engine updateMeetings) = người
// chơi dừng cách tâm NPC bao xa — ngoài thân NPC to.
export const NPC_SPRITES = {
  baTrieu: { id: 'PLAYER_BA_TRIEU', portrait: 'PORTRAIT_BA_TRIEU', anims: { idle: 'idle', talk: 'talk' } },
  quocDat: { id: 'NPC_TRIEU_QUOC_DAT', portrait: 'PORTRAIT_TRIEU_QUOC_DAT', anims: { idle: 'idle', talk: 'talk' } },
  hoLy: { id: 'NPC_HO_LY', portrait: 'PORTRAIT_LY_HOANG', anims: { idle: 'idle', talk: 'talk' }, holdGap: 48 },
  bachTuong: { id: 'NPC_BACH_TUONG', portrait: 'PORTRAIT_BACH_TUONG', anims: { idle: 'idle', talk: 'talk' }, holdGap: 56 }
};

// ---- Phần thưởng màn 2 (id khớp seed backend/migrations/005_ba_trieu.sql) ----
// Tên theo docs/SUTA_BT_TASK_00.md §3.4; cơ chế ở màn 3 (skills.js, BT-L3).
export const REWARD_NAMES = {
  BUFF_BT_CRIT: 'Chí mạng',
  SK_BT_RATTAN_SHIELD: 'Khiên mây tre',
  SK_BT_WHITE_ELEPHANT: 'Gọi Bạch Tượng'
};

// Kỹ năng màn 3 (BT-L3 mục 3, DESIGN_BASELINE). `icon` = ảnh ô HUD/nút cảm ứng.
//   Chí mạng (bị động): mỗi đòn chém `chance` gây ×`multiplier`; FX_BT_CRIT
//     `impact` (5@20) tại điểm trúng.
//   Khiên mây tre (K): giơ khiên `duration` giây (FX_BT_RATTAN_SHIELD raise 3@20 ->
//     hold 4@8 lặp; chặn được thì `block` 4@20), chặn mọi sát thương + choáng
//     (engine skills.blockHurt); hồi chiêu `cooldown` tính từ lúc hạ khiên.
//     Khiên vẽ trước người chơi, cách tâm `offsetX` về phía mặt.
//   Gọi Bạch Tượng (L): NPC_BACH_TUONG `charge` lao từ ngoài mép sau lưng người
//     chơi theo hướng mặt `speed` px/s qua hết đấu trường; thân 96×50 (thấy được
//     ±49, cao 54). Húc trúng: kỵ binh thiết giáp ngã, tháp −2 máu, Lục Dận (GĐ 3)
//     −`bossDamage`, lính thường −2; mỗi mục tiêu 1 lần/lượt. Rung màn hình.
export const SKILLS = {
  BUFF_BT_CRIT: { slot: null, chance: .25, multiplier: 2, fx: 'FX_BT_CRIT', icon: 'ICON_SK_BT_CRIT' },
  SK_BT_RATTAN_SHIELD: {
    slot: 'skill1', duration: 2.5, cooldown: 10, offsetX: 10, fx: 'FX_BT_RATTAN_SHIELD', icon: 'ICON_SK_BT_RATTAN_SHIELD'
  },
  SK_BT_WHITE_ELEPHANT: {
    slot: 'skill2', cooldown: 14, speed: 360, w: 96, h: 50, damage: 2, bossDamage: 2,
    shake: { amp: 2, time: .25 }, sprite: 'NPC_BACH_TUONG', icon: 'ICON_SK_BT_WHITE_ELEPHANT'
  }
};

// ---- Câu chữ thông báo dùng trong engine (CHAPTER.text) ----
export const TEXT = {
  obstacleHit: 'Hãy nhảy hoặc lướt qua chướng ngại vật.',
  trapHit: 'Bạn va vào bẫy!',
  fell: 'Bạn rơi xuống hố và mất 1 máu.',
  hazardHit: 'Bạn va phải quân Ngô!',
  hazardDefeated: 'Đã hạ chướng ngại vật!',
  projectileHit: 'Bạn trúng đạn của quân Ngô!',
  bossContact: 'Quân Ngô phản công!',
  bossDefeated: 'Đã đánh bại quân Ngô!',
  bossBlocksFinish: 'Hãy hạ tên tham quan thu thuế trước khi vào doanh trại.',
  itemPicked: (count, total) => `Đã thu thập Quyển Sách Tinh Hoa ${count}/${total}`,
  itemsMissing: count => `Bạn còn thiếu ${count} Quyển Sách Tinh Hoa.`,
  rescueHint: name => `Hãy hạ quân Ngô đang vây ${name}!`
};
