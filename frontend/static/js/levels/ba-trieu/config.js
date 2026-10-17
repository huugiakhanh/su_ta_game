// Hằng số RIÊNG chương Bà Triệu (chương 2) — không chứa logic. Hằng số chung
// mọi chương ở engine/config.js. Mọi toạ độ/kích thước/tốc độ là pixel logic.
//
// Asset riêng chương: đợt Codex BT_ART_01 (docs/CODEX_PROMPT_BT_ART_01.md, nhập
// 17/10/2026, status NORMALIZED — chờ chơi thử). Trời, tile mặt đất/địa hình,
// lớp giữa làng, bia câu hỏi, 2 vật cản MƯỢN của chương Trưng Trắc qua
// BORROWED_MAPS (prompt: "dùng lại, không vẽ"). Không import file nào của chương
// 1. Bố cục màn vẫn là khung BT-SKELETON (bố cục thật ở BT-L1). Mọi số DESIGN_BASELINE.

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

// Chân dung (ảnh DOM) — nạp ở mọi màn. Bà Triệu dẫn màn (chờ thoại team duyệt).
export const PORTRAITS = ['PORTRAIT_BA_TRIEU'];

// Sprite canvas mỗi màn cần (chỉ nạp ảnh màn đang chơi dùng). Màn 1 gồm cả
// layout thử ?layout=engine (voi rừng, đá lăn, chướng khí).
export const LEVEL_SPRITES = {
  1: ['EN_NGO_LUMBERJACK', 'TR_BAMBOO_SPIKE_PIT', 'OB_BOULDER', 'EN_WILD_ELEPHANT', 'FX_MIASMA'],
  2: ['EN_NGO_LUMBERJACK', 'TR_BAMBOO_SPIKE_PIT'],
  3: ['EN_NGO_LUMBERJACK']
};

// URL trang từng màn (route ở backend/routes/pages.py).
export const LEVEL_URLS = {
  1: '/gameplay/levels/ba-trieu',
  2: '/gameplay/levels/ba-trieu/2',
  3: '/gameplay/levels/ba-trieu/3'
};

// ---- Màn 1 "Rừng núi Nưa" ----
// Vùng cảnh: làng Quan Yên (nền làng mượn chương 1) -> rừng nứa -> rừng thiêng
// -> sườn núi đá -> doanh trại núi Nưa (cổng trại = đích).
export const LEVEL1_CHUNKS = 6;
export const LEVEL1_ZONES = [
  { id: 'BT1', x0: 0, x1: CHUNK_W, sky: 'BG_TT_SKY_DAY', mid: 'BG_TT_MID_VILLAGE' },
  { id: 'BT2', x0: CHUNK_W, x1: CHUNK_W * 2, sky: 'BG_TT_SKY_DAY', mid: 'BG_BT_MID_NUA_FOREST' },
  { id: 'BT3', x0: CHUNK_W * 2, x1: CHUNK_W * 3, sky: 'BG_TT_SKY_DAY', mid: 'BG_BT_MID_SACRED_FOREST' },
  { id: 'BT4', x0: CHUNK_W * 3, x1: CHUNK_W * 5, sky: 'BG_TT_SKY_DAY', mid: 'BG_BT_MID_ROCKY_SLOPE' },
  { id: 'BT5', x0: CHUNK_W * 5, x1: CHUNK_W * LEVEL1_CHUNKS, sky: 'BG_TT_SKY_DAY', mid: 'BG_BT_MID_CAMP' }
];
export const LEVEL1_FINISH_X = CHUNK_W * LEVEL1_CHUNKS - 96;
// Cổng trại nghĩa quân: TÂM tại đích (192px -> trải 4416–4608), không hitbox;
// mở khi đủ sách (+ hạ mini-boss khi có — BT-L1).
export const FINISH_GATE = { closed: 'PROP_BT_CAMP_GATE', open: 'PROP_BT_CAMP_GATE_OPEN', worldX: LEVEL1_FINISH_X };

// ---- Màn 2 "Chiêu mộ hiền tài" (PLACEHOLDER cảnh: chờ nền Bồ Điền ở BT_ART_02) ----
export const LEVEL2_CHUNKS = 4;
export const LEVEL2_ZONES = [
  { id: 'BT2', x0: 0, x1: CHUNK_W * 2, sky: 'BG_TT_SKY_DAY', mid: 'BG_BT_MID_NUA_FOREST' },
  { id: 'BT3', x0: CHUNK_W * 2, x1: CHUNK_W * 3, sky: 'BG_TT_SKY_DAY', mid: 'BG_BT_MID_SACRED_FOREST' },
  { id: 'BT5', x0: CHUNK_W * 3, x1: CHUNK_W * LEVEL2_CHUNKS, sky: 'BG_TT_SKY_DAY', mid: 'BG_BT_MID_CAMP' }
];
export const LEVEL2_FINISH_X = CHUNK_W * LEVEL2_CHUNKS - 96;

// ---- Màn 3 "Chiến lũy Bồ Điền" (PLACEHOLDER: đấu trường trại, chưa có boss — BT_ART_03) ----
// Đấu trường 1 chunk, tường vô hình 2 đầu. Quân ra ở spawnX; hết đợt cuối +
// hết quân thì thắng chương (level3.js).
export const ARENA = { width: CHUNK_W, playerStartX: 170, spawnX: 700 };
export const LEVEL3_ZONES = [
  { id: 'BT5', x0: 0, x1: ARENA.width, sky: 'BG_TT_SKY_DAY', mid: 'BG_BT_MID_CAMP' }
];
// 3 đợt lính; đợt sau = đợt trước chết hết + gap giây (engine makeSpawner).
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
//   level2Spots  [chunk, localX] — 3 câu màn 2, lần lượt từ pool quocDat, hoLy,
//                bachTuong (chưa có NPC — gắn NPC ở BT-L2).
export const QUIZ = {
  level1Count: 4,
  level1Spots: [[2, 312], [3, 560], [4, 560], [5, 560]],
  level2Spots: { quocDat: [1, 600], hoLy: [2, 600], bachTuong: [3, 600] }
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
  FINISH_GATE.closed, FINISH_GATE.open, BRANCH.short.sprite, BRANCH.long.sprite
];

// ---- Quân địch, hazard, đạn ----
// Hitbox (w, h) tính từ pivot bottom-center, đo từ strip BT_ART_01 (px logic) —
// KHÔNG lấy từ cỡ ảnh. DESIGN_BASELINE.
// Lính đốn gỗ EN_NGO_LUMBERJACK (hành vi `guard` của engine): thân cao ~31 px
// logic -> hitbox 22×32 (LUMBERJACK — nội dung màn dùng). Rìu ở ô hit 7
// (10@10): đầu rìu cách tâm 22,25 px (11,25 px ngoài mép hitbox), cao 35–46,5 px
// tính từ đỉnh ô = 20–32 px từ đỉnh hitbox. Vung chậm, sát thương 2 (BT-00
// §3.1); nghỉ 1,8 s giữa 2 nhát.
export const LUMBERJACK = { w: 22, h: 32, hp: 2 };
export const GUARD = {
  patrolRange: 96, speed: 20, aggroRange: 110,
  attackReach: 14, attackBoxY: 20, attackBoxH: 12, attackCooldown: 1.8, damage: 2
};
export const ENEMY_SPRITES = {
  normal: {
    id: 'EN_NGO_LUMBERJACK', behavior: 'guard', rules: GUARD,
    anims: { idle: 'idle', walk: 'walk', attack: 'attack_01', hurt: 'hurt', death: 'death' },
    attackMessage: 'Bạn bị lính đốn gỗ bổ rìu trúng!', contactMessage: 'Bạn va phải lính Ngô!',
    defeatMessage: 'Đã đánh bại lính đốn gỗ.'
  }
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
  // ---- Khai báo sẵn cho BT-L1 (chưa đặt vào màn) ----
  // Thợ săn nấp trong bụi (thrower): người cao ~18 px trên bụi; đầu nỏ ô hit 5
  // cao 20 px, cách tâm 12 px.
  ngoHunter: {
    id: 'EN_NGO_HUNTER', w: 24, h: 18, muzzle: 20, muzzleX: 12,
    anims: { idle: 'idle', throw: 'throw', hurt: 'hurt', death: 'death' }
  },
  // Kỵ binh Ngô (roller): ngựa + người thấy được ~75×34 px.
  ngoCavalry: { id: 'EN_NGO_CAVALRY', w: 56, h: 34, anims: { move: 'gallop', idle: 'gallop', hurt: 'hurt', death: 'death' } },
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
// NPC: Bà Triệu dẫn màn 1 (chưa đặt — thoại chờ team duyệt, BT-00 §4–5).
export const NPC_SPRITES = {
  baTrieu: { id: 'PLAYER_BA_TRIEU', portrait: 'PORTRAIT_BA_TRIEU', anims: { idle: 'idle', talk: 'talk' } }
};

// ---- Phần thưởng màn 2 (id khớp seed backend/migrations/005_ba_trieu.sql) ----
// Tên theo docs/SUTA_BT_TASK_00.md §3.4; cơ chế làm ở BT-L2/BT-L3.
export const REWARD_NAMES = {
  BUFF_BT_CRIT: 'Chí mạng',
  SK_BT_RATTAN_SHIELD: 'Khiên mây tre',
  SK_BT_WHITE_ELEPHANT: 'Gọi Bạch Tượng'
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
  bossBlocksFinish: 'Hãy hạ quân địch trước khi đi tiếp.',
  itemPicked: (count, total) => `Đã thu thập Quyển Sách Tinh Hoa ${count}/${total}`,
  itemsMissing: count => `Bạn còn thiếu ${count} Quyển Sách Tinh Hoa.`,
  rescueHint: name => `Hãy hạ quân Ngô đang vây ${name}!`
};
