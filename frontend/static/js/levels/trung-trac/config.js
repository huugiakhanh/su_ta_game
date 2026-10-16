// Hằng số RIÊNG chương Trưng Trắc — không chứa logic. Hằng số chung mọi chương
// (độ phân giải, vật lý, người chơi, NPC/câu hỏi...) ở engine/config.js.
// Mọi toạ độ/kích thước/tốc độ là pixel logic (xem engine/config.js).

import { CHUNK_W } from '../../engine/config.js';

// ---- Asset ----
// Bộ sprite 32-bit (TT-HIBIT-01, Codex — nguồn ở assets/sprites-32bit/, brief
// SUTA_TT_ART_BRIEF_32.md). Manifest là nguồn DUY NHẤT cho frames/fps/loop/
// hit_frame — đọc lúc chạy (engine/animation.js), không chép các số đó vào đây.
// frame_w/frame_h là pixel LOGIC, ảnh vẽ dày gấp `density` (ô 48x48 -> ảnh
// 192x192 khi density 4); pivot bottom-center: chân ở hàng frame_h - 2 (1px
// đệm dưới chân), quay mặt PHẢI trong ảnh.
// Đổi số frame/fps/hit_frame của animation KHÔNG lặp thì phải giữ nhịp
// gameplay (thời lượng frames/fps và tỉ lệ (hit_frame−1)/frames) vì phần mô
// phỏng tính thời điểm chạm từ đó.
// Nhân vật người chơi nam/nữ + icon HUD KHÔNG nằm ở đây — manifest chung
// (images/shared/, ENGINE-01).
export const SPRITE_ROOT = '/static/assets/images/trung-trac/sprites-32bit/';
export const SPRITE_MANIFEST_FILE = 'manifest_tt.json';

// Bộ môi trường 32-bit (TT-HIBIT-03, Codex — nguồn ở assets/maps-32bit/trung-trac/,
// chép sang đây giữ cấu trúc thư mục). maps_tt.json là nguồn cho đường dẫn +
// cỡ logic + neo (đọc lúc chạy trong engine/assets.js): mọi số (w/h, frame_w/h,
// visible_bbox, pivot, rect tile) là pixel LOGIC, ảnh vẽ dày gấp `density`
// (4). Các số dưới đây là cách VẼ (vị trí, vùng).
export const MAP_ROOT = '/static/assets/images/trung-trac/maps-32bit/';
export const MAP_MANIFEST_FILE = 'maps_tt.json';
// Mặt đất dùng CHUNG 1 bộ tile (region 'Z1' trong tileset_tt_ground.json) cho
// mọi vùng và mọi màn, chỉ tile đầu tiên của mỗi vai trò — không đổi theo
// vùng, không biến thể theo cột (team 30/09, cho đồng bộ). Decor vẫn rải theo cột.
// Bộ tile ghép địa hình (TT-TERRAIN-01; bản 32-bit TT-HIBIT-03 C2): sheet 64x48
// logic riêng, 12 vai trò (engine TERRAIN_TILE_ROLES), 1 tile/vai trò; thiếu
// sheet thì dự phòng bằng tile Z1 của TILESET_TT_GROUND.
export const TILES = { ground: 'TILESET_TT_GROUND', groundRegion: 'Z1', terrain: 'TILESET_TT_TERRAIN' };

// Đồi xa vẽ tông trời nắng nên lạc tông dưới trời giông: `hiddenUnderSky` =
// các ảnh trời mà dưới đó đồi xa tắt dần (cùng hệ số hoà với trời) — ảnh trời
// giông đã có dãy núi xa riêng (quyết định team, phương án (a) sau Phase B).
export const FAR_HILLS = { id: 'BG_TT_FAR_HILLS', parallax: 0.2, bottomY: 230, hiddenUnderSky: ['BG_TT_SKY_STORM'] }; // DESIGN_BASELINE

// Chân dung (ảnh DOM: hội thoại, ô kỹ năng) — nạp ở mọi màn (nhỏ).
export const PORTRAITS = [
  'PORTRAIT_TRUNG_TRAC', 'PORTRAIT_TRUNG_NHI', 'PORTRAIT_THI_SACH', 'PORTRAIT_LE_CHAN', 'PORTRAIT_TO_DINH'
];

// Sprite canvas mỗi màn cần (Phần D — chỉ nạp ảnh màn đang chơi dùng; sprite
// ×4 nặng ~2–14 MB/asset khi giải nén). Thêm thực thể dùng sprite mới vào màn
// thì thêm ID vào đây — thiếu thì render cảnh báo 1 lần "chưa nạp" và vẽ hộp
// tạm. Màn 1 cả layout thử ?layout=p2; màn 3 cả ?layout=skills.
// PLAYER_TRUNG_TRAC ở màn 1 là Trưng Trắc đứng chờ (NPC dẫn — TT-HERO-01).
// (PJ_FIRE_ARROW có trong manifest/PROJECTILE_SPRITES nhưng chưa màn nào dùng.)
const SPRITES_TOWER = ['EN_HAN_WATCHTOWER', 'PROP_WATCHTOWER', 'EN_HAN_CAVALRY', 'PJ_SPEAR'];
export const LEVEL_SPRITES = {
  1: [
    'PLAYER_TRUNG_TRAC', 'EN_HAN_GUARD', 'TR_SPIKE_PIT', 'EN_TIGER', 'OB_TRIBUTE_CART',
    'EN_HAN_TAXMAN', 'PJ_COIN_POUCH', ...SPRITES_TOWER, 'EN_HAN_PALANQUIN', 'PJ_THROWING_KNIFE'
  ],
  2: [
    'EN_HAN_GUARD', 'TR_SPIKE_PIT', 'EN_TIGER', 'OB_TRIBUTE_CART',
    'EN_HAN_TAXMAN', 'PJ_COIN_POUCH', ...SPRITES_TOWER, 'NPC_THI_SACH', 'NPC_LE_CHAN', 'NPC_TRUNG_NHI'
  ],
  3: [
    'EN_HAN_GUARD', 'EN_HAN_RUSHER', 'BOSS_TO_DINH_CHARIOT', 'BOSS_TO_DINH_FOOT',
    'PJ_OIL_JAR', 'FX_OIL_FIRE', 'PJ_ARROW_RAIN', 'NPC_TRUNG_NHI'
  ]
};

// URL trang từng màn (route ở backend/routes/pages.py).
export const LEVEL_URLS = {
  1: '/gameplay/levels/trung-trac',
  2: '/gameplay/levels/trung-trac/2',
  3: '/gameplay/levels/trung-trac/3'
};

// ---- Màn 1 "Vượt ải" ----
export const LEVEL_CHUNKS = 12;
export const LEVEL_WORLD_WIDTH = CHUNK_W * LEVEL_CHUNKS;
// Vùng cảnh theo world X (chunk đếm từ 1: Z1 = chunk 1–3 = 0–2304...). Vùng
// chỉ đổi CẢNH (trời + lớp giữa), vật cản vẫn xáo ngẫu nhiên (level1.js).
export const ZONES = [
  { id: 'Z1', x0: 0, x1: 2304, sky: 'BG_TT_SKY_DAY', mid: 'BG_TT_MID_VILLAGE' },
  { id: 'Z2', x0: 2304, x1: 3840, sky: 'BG_TT_SKY_DAY', mid: 'BG_TT_MID_FIELDS' },
  { id: 'Z3', x0: 3840, x1: 6144, sky: 'BG_TT_SKY_DAY', mid: 'BG_TT_MID_FOREST' },
  { id: 'Z4', x0: 6144, x1: 7680, sky: 'BG_TT_SKY_DAY', mid: 'BG_TT_MID_RIVER' },
  { id: 'Z5', x0: 7680, x1: 9216, sky: 'BG_TT_SKY_STORM', mid: 'BG_TT_MID_CITADEL' }
];
// Trigger về đích (= worldX(12, 618)) — level1.js (finishX) và cổng thành dùng
// chung số này. Cổng Luy Lâu đặt TÂM tại đây (quyết định team G1: bỏ độ lệch
// +24px của ảnh cũ); cổng 192px trải 8970–9162 < 9216.
export const FINISH_X = CHUNK_W * 11 + 618;
// Cổng thành Luy Lâu (prop, KHÔNG có hitbox — trigger về đích ở engine
// level-flow.js). Vẽ x1, pivot bottom-center lấy từ maps_tt.json, đáy ở GROUND_Y
// (không chìm). Đổi sang ảnh mở khi đã đủ điều kiện NỘI DUNG (mini-boss đã hạ
// + nhặt đủ sách), trước khi người chơi chạm FINISH_X; suy ra mỗi frame nên
// không đóng lại (G7).
export const FINISH_GATE = { closed: 'PROP_LUYLAU_GATE', open: 'PROP_LUYLAU_GATE_OPEN', worldX: FINISH_X };
// Trưng Trắc đứng chờ người chơi ở chunk 1 màn 1 (TT-HERO-01, DESIGN_BASELINE).
export const GUIDE_LOCAL_X = 190;

// Mini-boss kiệu quan ở chunk 11 màn 1 (TT-NPC-01 §3.1.2, DESIGN_BASELINE).
//   localX      tâm (pivot) trong chunk 11 — chỗ boss Tô Định cũ.
//   hp          số đòn chém để hạ.
//   patrolRange đi qua lại trong đoạn này (căn giữa tại localX), tốc độ speed.
//   fireRange   người chơi trong tầm -> dừng lại, quay về phía người chơi, ném.
//   fireInterval chu kỳ ném tính từ lúc ném xong (giây).
//   hitScore / defeatScore  điểm mỗi đòn / khi hạ (D9 — như boss cũ).
export const MINIBOSS = {
  chunk: 11, localX: 510, hp: 6, patrolRange: 160, speed: 30,
  fireRange: 240, fireInterval: 2.5, hitScore: 100, defeatScore: 700
};

// Bình thư (vật phẩm thu thập): strip ITEM_BINH_THU (4 ô 16x16) vẽ x1, lặp
// fps (manifest để fps null). Hitbox nhặt 22x26 ở engine (ITEM_HITBOX).
export const ITEM = { sprite: 'ITEM_BINH_THU', fps: 6 }; // DESIGN_BASELINE

// ---- Màn 2 "Chiêu mộ hiền tài" ----
// (TT-NPC-01 §3.2.1; tăng độ khó TT-L2-HARD 29/09; kéo dài 9 chunk TT-QUIZ-01
// 29/09 — DESIGN_BASELINE): trời ngày suốt màn. Chunk 1–2 làng (Z1), chunk 3
// đồng lúa (Z2), chunk 4–5 rừng (Z3), chunk 6–9 bến sông (Z4) — `id` giữ tên
// vùng của TT-MAP-01 để dùng đúng lớp giữa.
export const LEVEL2_CHUNKS = 9;
export const LEVEL2_ZONES = [
  { id: 'Z1', x0: 0, x1: CHUNK_W * 2, sky: 'BG_TT_SKY_DAY', mid: 'BG_TT_MID_VILLAGE' },
  { id: 'Z2', x0: CHUNK_W * 2, x1: CHUNK_W * 3, sky: 'BG_TT_SKY_DAY', mid: 'BG_TT_MID_FIELDS' },
  { id: 'Z3', x0: CHUNK_W * 3, x1: CHUNK_W * 5, sky: 'BG_TT_SKY_DAY', mid: 'BG_TT_MID_FOREST' },
  { id: 'Z4', x0: CHUNK_W * 5, x1: CHUNK_W * LEVEL2_CHUNKS, sky: 'BG_TT_SKY_DAY', mid: 'BG_TT_MID_RIVER' }
];
// Điểm kết thúc màn 2: cuối chunk cuối lùi 96px (D15 — không vẽ cổng).
export const LEVEL2_FINISH_X = CHUNK_W * LEVEL2_CHUNKS - 96;

// Câu hỏi lịch sử chặn đường (TT-QUIZ-01, DESIGN_BASELINE; điểm + luật ở engine):
//   level1Count  số câu mỗi lượt màn 1 (rút ngẫu nhiên, không trùng).
//   level1Spots  [chunk, localX] — chạm x này thì hỏi (theo thứ tự).
//   level2Spots  câu hỏi trước NPC màn 2: npc id -> [chunk, localX].
export const QUIZ = {
  level1Count: 4,
  level1Spots: [[3, 312], [5, 312], [8, 312], [10, 560]],
  level2Spots: { thiSach: [2, 600], leChan: [5, 600], trungNhi: [8, 600] }
};

// ---- Màn 3 "Trận Luy Lâu" ----
// (TT-BOSS-01 §3.1, DESIGN_BASELINE): ĐẤU TRƯỜNG cố định 1 chunk trước cổng
// Luy Lâu, không có đoạn đi cảnh. Tường vô hình ở x = 0 và x = width (engine
// kẹp người chơi; chiến xa/quân cảm tử quay đầu ở tường).
//   gateX      tâm cổng PROP_LUYLAU_GATE (192px -> trải 576–768), đóng suốt trận.
//   pillars    tâm 2 cột đá PROP_STONE_PILLAR (hitbox pillarW x pillarH).
//   playerStartX  mép trái hitbox người chơi lúc vào màn.
//   spawnX     tâm điểm quân địch xuất hiện (trước cổng).
export const ARENA = {
  width: CHUNK_W, gateX: 672, pillars: [250, 450], pillarW: 24, pillarH: 48,
  // playerStartX 170 (TT-MOBILE-01, cũ 60): ra khỏi cụm nút cảm ứng trái, vẫn trước cột đá 250.
  playerStartX: 170, spawnX: 700,
  // Mưa tên trên thành (§3.9) — bật/tắt áp lực nền cả 3 giai đoạn.
  wallArrows: true
};
// Mưa tên trên thành (TT-BOSS-01 §3.9, DESIGN_BASELINE): mỗi `interval` giây
// `count` mũi PJ_ARROW_RAIN nhắm vị trí ngẫu nhiên trong ±spread px quanh
// người chơi; vạch báo trên mặt đất `warnTime` giây rồi tên mới rơi (fallSpeed).
// Trúng người chơi -1 máu, dash né được, không trúng quân ta/quân địch. Ngưng
// trong cutscene và phasePause giây đầu mỗi giai đoạn.
export const WALL_ARROWS = { interval: 3.5, count: 2, spread: 120, warnTime: .6, fallSpeed: 420, phasePause: 2 };
export const LEVEL3_ZONES = [
  { id: 'Z5', x0: 0, x1: ARENA.width, sky: 'BG_TT_SKY_STORM', mid: 'BG_TT_MID_CITADEL' }
];
// Cờ chiến thắng cắm trên cổng mở (cutscene màn 3): strip lặp, pivot
// bottom-left đặt tại `attach` — null = dùng `flag_attach` của
// PROP_LUYLAU_GATE_OPEN trong maps_tt.json: (94,10) logic, giữa nóc mái cổng
// (yêu cầu team 27/09; bản 32-bit C3: chân cán chạm ngói nóc). Đặt { x, y }
// (toạ độ logic trong ảnh cổng 192x176) để ghi đè. Thiếu ảnh/điểm gắn thì bỏ
// qua (TODO_MISSING).
export const VICTORY_FLAG = { id: 'PROP_TT_VICTORY_FLAG', attach: null };

// ---- Môi trường ----
// Vật cản tĩnh (`obstacles`) -> asset trong maps_tt.json + cách neo/cờ.
// Hitbox (w, h) do nội dung màn truyền vào makeObstacle — KHÔNG lấy từ cỡ ảnh.
// Vẽ x1 theo cỡ PNG, căn sao cho PHẦN NHÌN THẤY trùng hitbox:
//   - asset có `visible_bbox` (3 loại P0): góc bbox trùng góc trên-trái hitbox;
//   - còn lại: đáy-giữa canvas trùng đáy-giữa hitbox + groundSink.
//   anchor     'bottom' (hitbox đứng trên mặt đất), 'overhead' (hitbox 20px ở
//              GROUND_Y - 46, khe dash 26px phía dưới), 'top' (mặt trên hitbox
//              ở GROUND_Y — cầu bắc qua hố).
//   groundSink số px đáy ảnh chìm dưới đáy hitbox (4 cho 3 loại cũ — khớp
//              visible_bbox; 0 cho P2).
//   requiresHole  chỉ được tạo khi có hố tương ứng (entities.js kiểm tra).
// P2 (fenceLow...logDrift): màn 1 chỉ dùng trong layout thử `?layout=p2`;
// màn 2 dùng. Hitbox P2 là DESIGN_BASELINE (task TT-MAP-01 §3.3.4).
// spikesTrap: không có asset (màn dùng hazard TR_SPIKE_PIT) — giữ khai
// báo, thiếu ảnh thì render vẽ hộp tạm (G8).
export const OBSTACLE_TYPES = {
  fallenBranch: { id: 'OBS_FALLEN_BRANCH', anchor: 'bottom', groundSink: 4 },
  stoneBlock: { id: 'OBS_STONE_BLOCK', anchor: 'bottom', groundSink: 4 },
  reedCurtain: { id: 'OBS_REED_CURTAIN', anchor: 'overhead', groundSink: 4 },
  fenceLow: { id: 'OBS_FENCE_LOW', anchor: 'bottom', groundSink: 0 },
  fenceHigh: { id: 'OBS_FENCE_HIGH', anchor: 'bottom', groundSink: 0 },
  bambooSlope: { id: 'OBS_BAMBOO_SLOPE', anchor: 'bottom', groundSink: 0 },
  slideBar: { id: 'OBS_SLIDE_BAR', anchor: 'overhead', groundSink: 0 },
  bridge: { id: 'OBS_BRIDGE', anchor: 'top', groundSink: 0, requiresHole: true },
  logDrift: { id: 'OBS_LOG_DRIFT', anchor: 'bottom', groundSink: 0 },
  spikesTrap: { id: null, anchor: 'bottom', groundSink: 0 },
  // Cột đá màn 3 (TT-BOSS-01, quyết định team Q1): `blocking` — va ngang thì
  // bị chặn lại, KHÔNG mất máu; đứng lên được. Chỉ chiến xa bị cột chặn,
  // quân địch đi xuyên (Q2). Strip 2 ô 24x48 (`frame_states` intact/cracked
  // trong maps_tt.json) — render chọn ô theo obstacle.state.
  stonePillar: { id: 'PROP_STONE_PILLAR', anchor: 'bottom', groundSink: 0, blocking: true }
};

// Bia đá đánh dấu mốc câu hỏi chặn đường (TT-QUIZ-01, Codex 29/09): pivot
// bottom-center tại `quiz.x`, đáy ở GROUND_Y, KHÔNG hitbox. Trạng thái
// `active` (strip lặp, chưa hỏi) / `done` (1 ô, đã hỏi) — `state_files` trong
// maps_tt.json. Thiếu ảnh thì không vẽ.
export const QUIZ_STELE_ID = 'PROP_TT_QUIZ_STELE';

// Ảnh môi trường cần tải ngoài các lớp nền/tileset (vật cản, sách, cổng) — mọi màn.
export const MAP_PROPS_IN_GAME = [
  ...Object.values(OBSTACLE_TYPES).map(type => type.id).filter(Boolean),
  ITEM.sprite, FINISH_GATE.closed, FINISH_GATE.open, VICTORY_FLAG.id, QUIZ_STELE_ID
];

// ---- Quân địch, hazard, đạn ----
// Hazard (vật cản/kẻ địch có trạng thái) -> asset trong manifest sprite. Khoá
// (jungleTiger, hanTaxSoldier...) là tên `sprite` nội dung màn dùng.
//   id      asset trong manifest_tt.json (mọi strip quay mặt PHẢI; render tự lật
//           để vật chạy quay theo hướng chạy, lính/boss quay về phía người chơi).
//   w, h    hitbox (px logic) tính từ pivot bottom-center (tâm ngang, chân) —
//           KHÔNG lấy từ cỡ ảnh. DESIGN_BASELINE (docs/archive/INTEGRATION_PLAN_TT.md §5).
//   anims   trạng thái gameplay -> animation manifest. Trạng thái: move (roller
//           đang lao), idle, hurt (hitTimer > 0), throw, alarm, sprung (bẫy
//           đã bật), death (hết máu — phát 1 lần rồi xoá; vật `corpse` thì
//           đứng ở ô cuối và nằm lại map). Thiếu trạng thái -> dùng idle/move.
//   durations  trải animation trên đúng số giây này thay vì fps manifest.
//           throw .85s = tổng thời lượng chuỗi ném cũ (quyết định team §9.5),
//           đạn rời tay khi tới ô hit_frame (4) -> .425s (cũ .45s).
//   alarmTime  thời gian thổi tù và (giây, như bản cũ).
//   muzzle  độ cao điểm sinh đạn so với chân (px logic) — giữ đúng độ cao đạn
//           bản cũ quy đổi (≈32) để né/nhảy qua như trước.
//   muzzleX khoảng cách ngang từ tâm tới điểm sinh đạn (px logic); không ghi
//           = ngay ngoài mép hitbox (w/2 + 4).
//   sink    số px chìm xuống dưới mặt đất khi vẽ (bẫy chông nằm lọt vào cỏ).
//   corpse  hết máu thì phát death 1 lần rồi NẰM LẠI map ở ô cuối, vô hại
//           (xe cống — quyết định team §9.2).
//   Câu thông báo (thiếu thì dùng TEXT chung): breakMessage (hạ được),
//   springMessage (bẫy bật), sprungMessage (giẫm phải bẫy đã bật), alarmMessage.
export const HAZARD_SPRITES = {
  officialPalanquin: { id: 'EN_HAN_PALANQUIN', w: 76, h: 44, anims: { move: 'walk', idle: 'walk', hurt: 'hurt', death: 'break' } },
  // Mini-boss kiệu quan màn 1 (TT-NPC-01, hành vi `patrol` — xem MINIBOSS).
  // Cùng asset/hitbox với kiệu `roller` (hiện không còn trong nhóm xáo). Kiệu
  // không có `idle`: khi đứng chờ ném thì dừng ở ô 1 của `walk` (`idleHold`,
  // quyết định team D6). Dao rời tay ở hit_frame 3 của `throw` (fps manifest,
  // không ép thời lượng). muzzle 24 = DESIGN_BASELINE (D10). muzzleX 12 =
  // tay quan ở giữa kiệu trong strip 32-bit (TT-HIBIT-01 A4, người dùng chọn
  // 02/10 — trước đây dao sinh ở mép trước kiệu, cách tâm 42). DESIGN_BASELINE.
  palanquinBoss: {
    id: 'EN_HAN_PALANQUIN', w: 76, h: 44, muzzle: 24, muzzleX: 12, idleHold: true,
    anims: { move: 'walk', idle: 'walk', throw: 'throw', hurt: 'hurt', death: 'break' },
    breakMessage: 'Đã hạ kiệu quan!'
  },
  jungleTiger: { id: 'EN_TIGER', w: 48, h: 24, anims: { move: 'run', idle: 'idle', hurt: 'hurt', death: 'death' } },
  tributeCart: {
    id: 'OB_TRIBUTE_CART', w: 48, h: 38, anims: { move: 'roll', idle: 'roll', death: 'break' }, corpse: true,
    breakMessage: 'Xe cống phẩm vỡ tan!'
  },
  hanCavalry: { id: 'EN_HAN_CAVALRY', w: 56, h: 48, anims: { move: 'gallop', idle: 'gallop', hurt: 'hurt', death: 'death' } },
  hanTaxSoldier: {
    id: 'EN_HAN_TAXMAN', w: 20, h: 40, muzzle: 32,
    anims: { idle: 'idle', throw: 'throw', hurt: 'hurt', death: 'death' }, durations: { throw: .85 }
  },
  watchtowerGuard: {
    id: 'EN_HAN_WATCHTOWER', w: 22, h: 36, muzzle: 32, alarmTime: 1.1,
    anims: { idle: 'idle', alarm: 'alarm', throw: 'throw', hurt: 'hurt', death: 'death' }, durations: { throw: .85 },
    alarmMessage: 'Lính gác thổi tù và báo động — kỵ binh Hán xông tới!'
  },
  watchtower: { id: 'PROP_WATCHTOWER', w: 29, h: 91, anims: { idle: 'idle' } },
  // Hố chông mới là hố NÔNG 48x16 (không còn ảnh mặt cắt): cỏ -> chông trồi
  // lên (reveal 1 lần). Chìm 3px vào dải cỏ; hitbox mỏng sát mặt đất.
  spikePit: {
    id: 'TR_SPIKE_PIT', w: 36, h: 6, sink: 3, anims: { idle: 'hidden', sprung: 'reveal' },
    springMessage: 'Bẫy hố chông bật lên!', sprungMessage: 'Bạn giẫm phải hố chông!'
  }
};

// Lính canh thường (EN_HAN_GUARD, enemy không phải boss) — DESIGN_BASELINE:
//   patrolRange  đi qua lại trong đoạn này (căn giữa tại chỗ đứng), tốc độ speed.
//   aggroRange   người chơi trong khoảng này (tâm tới tâm) -> quay về phía
//                người chơi, tiến lại gần nhưng không ra khỏi đoạn tuần tra.
//   attackReach  tầm đâm kích tính từ mép hitbox lính; khoảng trống tới người
//                chơi <= attackReach - 4 thì đâm (attack_01, sát thương ở ô
//                hit_frame của manifest, chỉ trong ô đó, mỗi cú trúng 1 lần).
//   attackBoxY / attackBoxH  dải dọc của mũi kích so với đỉnh hitbox lính.
//   attackCooldown  nghỉ giữa 2 cú đâm (giây), tính từ lúc đâm xong hoặc lúc
//                bị chém ngắt cú đâm.
// Vùng đâm đo theo strip attack_01 vẽ lại 2026-09-26. Ở ô hit 3–4, mũi kích
// tới x=43/42 trong cell 48px: 8px quá mép hitbox (pivot 24, nửa hitbox 11).
// attackReach thêm 4px dung sai; dải mũi kích y=20–29 trong sprite tương ứng
// y=13–22 tính từ đỉnh hitbox lính. Body cao trung bình 40.5px, lệch 7.4% so
// với idle 43.75px và nằm trong ngưỡng đồng bộ sprite.
export const GUARD = {
  patrolRange: 96, speed: 24, aggroRange: 110,
  attackReach: 12, attackBoxY: 13, attackBoxH: 10, attackCooldown: 1.2
};

// Quân cảm tử EN_HAN_RUSHER (TT-BOSS-01 §3.3, DESIGN_BASELINE):
//   speed         chạy 90px/s; hướng chọn VỀ PHÍA người chơi lúc xuất hiện và
//                 sau mỗi lần nghỉ, rồi giữ nguyên tới khi chạm tường thì quay đầu.
//   attackRange   khoảng trống tới người chơi <= số này -> phát attack_01, sát
//                 thương trong ô hit_frame (2) nếu lưỡi đoản đao (attackReach) trúng.
//   attackBoxY/H  dải dọc lưỡi đao so với đỉnh hitbox: strip attack_01 ô 2
//                 có lưỡi đao ở hàng 26–31 (đỉnh hitbox = hàng 6) -> 20–25, nới 2px.
//   rest          nghỉ sau cú đâm (giây) rồi chạy tiếp.
export const RUSHER = {
  hp: 1, w: 22, h: 40, speed: 90, attackRange: 12,
  attackReach: 12, attackBoxY: 20, attackBoxH: 8, rest: 1.0
};

// Enemy (lính canh / boss) -> asset sprite. Hitbox nằm trong nội dung màn
// (enemy là object phẳng). `behavior` = hành vi chung của engine (guard |
// rusher) với thông số `rules`; boss có `kind` riêng (boss.js) nên không cần.
// Câu thông báo: attackMessage (bị đâm trúng), contactMessage (chạm thân),
// defeatMessage (hạ được; không có = không thông báo).
export const ENEMY_SPRITES = {
  normal: {
    id: 'EN_HAN_GUARD', behavior: 'guard', rules: GUARD,
    anims: { idle: 'idle', walk: 'walk', attack: 'attack_01', hurt: 'hurt', death: 'death' },
    attackMessage: 'Bạn bị lính canh đâm trúng!', contactMessage: 'Bạn bị lính canh đánh trúng!',
    defeatMessage: 'Đã đánh bại lính canh.'
  },
  // Chiến xa Tô Định (màn 3 giai đoạn 1, TT-BOSS-01 §3.5): trạng thái máy
  // trạng thái -> animation. Không có `hurt` -> trúng đòn nháy mờ. Hết khiên
  // phát shield_break 1 lần rồi NẰM LẠI ở ô cuối (xác xe, không va chạm).
  boss: {
    id: 'BOSS_TO_DINH_CHARIOT',
    anims: { idle: 'idle', idleCracked: 'idle_cracked', throw: 'throw', charge: 'charge', stun: 'stun', death: 'shield_break' }
  },
  // Tô Định đi bộ (giai đoạn 2 đứng sau xác xe, chỉ để vẽ).
  // Giai đoạn 3: trúng đòn phát `hurt` (Codex bổ sung 26/09), hết máu
  // `disarmed` 1 lần; cutscene: `flee` (đã cải trang).
  bossFoot: { id: 'BOSS_TO_DINH_FOOT', anims: { idle: 'idle', hurt: 'hurt', disarmed: 'disarmed', flee: 'flee' } },
  // Quân cảm tử màn 3 (TT-BOSS-01 §3.3): không có idle/hurt — lúc nghỉ giữa 2
  // cú đâm thì đứng ở ô 1 của `run` (idleHold, như kiệu quan).
  rusher: {
    id: 'EN_HAN_RUSHER', behavior: 'rusher', rules: RUSHER, idleHold: true,
    anims: { idle: 'run', walk: 'run', attack: 'attack_01', death: 'death' },
    attackMessage: 'Bạn bị quân cảm tử đâm trúng!', contactMessage: 'Bạn bị quân cảm tử đâm trúng!'
  },
  // "Bao cát" của layout thử ?layout=skills: không có asset — vẽ hộp tạm.
  dummy: { id: null, anims: {} }
};

// Đạn -> asset sprite (khoá là tên `projectile` hazard khai báo). Hitbox (w, h)
// nhỏ hơn hình một chút để đuôi lửa/cán giáo không gây sát thương oan. Mọi
// strip đạn quay PHẢI, bay sang trái thì lật.
export const PROJECTILE_SPRITES = {
  coinPouch: { id: 'PJ_COIN_POUCH', anim: 'loop', w: 10, h: 10 },
  throwingDart: { id: 'PJ_SPEAR', anim: 'idle', w: 22, h: 4 },
  fireArrow: { id: 'PJ_FIRE_ARROW', anim: 'loop', w: 16, h: 5 },
  // Dao ném của mini-boss kiệu quan: hình 16x8, hitbox 12x5 bớt cán (D10,
  // DESIGN_BASELINE).
  throwingKnife: { id: 'PJ_THROWING_KNIFE', anim: 'loop', w: 12, h: 5 }
};

// NPC (TT-NPC-01 §3.2.3). Khoá = `npc.id` trong nội dung màn và
// dialogue-data.js. Sprite 48x48 quay PHẢI, pivot bottom-center; render lật để
// NPC quay về phía người chơi. Không có va chạm (hitbox chỉ để F2 hiển thị).
//   portrait  chân dung 64x64 cho khung hội thoại (DOM, image-rendering: pixelated).
export const NPC_SPRITES = {
  thiSach: { id: 'NPC_THI_SACH', portrait: 'PORTRAIT_THI_SACH', anims: { idle: 'idle', talk: 'talk' } },
  leChan: { id: 'NPC_LE_CHAN', portrait: 'PORTRAIT_LE_CHAN', anims: { idle: 'idle', talk: 'talk' } },
  trungNhi: { id: 'NPC_TRUNG_NHI', portrait: 'PORTRAIT_TRUNG_NHI', anims: { idle: 'idle', talk: 'talk' } },
  // Màn 1 (TT-HERO-01): Trưng Trắc chờ người chơi ở đầu màn — chưa có NPC_TRUNG_TRAC,
  // dùng lại strip idle của sprite người chơi cũ (không có `talk`).
  trungTrac: { id: 'PLAYER_TRUNG_TRAC', portrait: 'PORTRAIT_TRUNG_TRAC', anims: { idle: 'idle', talk: 'idle' } }
};

// ---- Màn 3: phần thưởng, boss ----
// Phần thưởng nhận ở màn 2 (id -> tên, nguyên văn task card TT-NPC-01 mục 5).
export const REWARD_NAMES = {
  BUFF_Y_CHI_KIEN_CUONG: 'Ý chí kiên cường',
  SK_LE_CHAN_ARROW_RAIN: 'Mưa tên',
  SK_TRUNG_NHI_SHADOW: 'Bóng Trưng Nhị'
};

// Phần thưởng màn 2 thành cơ chế thật ở màn 3 (TT-BOSS-01 §3.2, DESIGN_BASELINE).
// Khoá = id phần thưởng trong tiến trình (REWARD_NAMES). `slot` = khe kỹ năng
// của engine (skill1 = phím K, skill2 = phím L; null = bị động).
//   buff       BUFF_Y_CHI_KIEN_CUONG: máu còn 1 + calmTime giây không trúng đòn
//              -> hồi 1 máu; hồi chiêu `cooldown` tính từ lần hồi trước.
//   arrowRain  SK_LE_CHAN_ARROW_RAIN (phím K): `count` mũi PJ_ARROW_RAIN rơi từ
//              mép trên màn hình, rải đều trong vùng `width` px bắt đầu cách
//              `offset` px phía trước người chơi, ra lần lượt trong `spread` giây
//              (xê dịch ±`jitter` px), rơi `fallSpeed` px/s. Mỗi lần dùng: lính
//              nhận tối đa perEnemy mũi, boss tối đa perBoss.
//   shadow     SK_TRUNG_NHI_SHADOW (phím L): kéo dài `duration`, hồi chiêu tính
//              từ lúc HẾT hiệu lực; bóng NPC_TRUNG_NHI alpha `alpha`, ánh `tint`,
//              đi sau `gap` px, trễ `delay` giây theo vệt di chuyển.
//   portrait   chân dung ô HUD.
export const SKILLS = {
  BUFF_Y_CHI_KIEN_CUONG: { slot: null, calmTime: 3, cooldown: 20, portrait: 'PORTRAIT_THI_SACH' },
  SK_LE_CHAN_ARROW_RAIN: {
    slot: 'skill1', cooldown: 12, width: 160, offset: 24, count: 10, spread: .8,
    jitter: 5, fallSpeed: 420, perEnemy: 2, perBoss: 1, portrait: 'PORTRAIT_LE_CHAN'
  },
  SK_TRUNG_NHI_SHADOW: {
    slot: 'skill2', duration: 8, cooldown: 20, gap: 20, delay: .15, alpha: .5,
    tint: 'rgba(58, 64, 190, .55)', sprite: 'NPC_TRUNG_NHI', portrait: 'PORTRAIT_TRUNG_NHI'
  }
};
// Mũi tên mưa (PJ_ARROW_RAIN 8x24, mũi ở đáy ô): hitbox 4x10 ở đầu mũi.
export const ARROW_RAIN_SPRITE = { id: 'PJ_ARROW_RAIN', anim: 'idle', w: 4, h: 10 };

// Boss Tô Định (TT-BOSS-01 §3.5–3.6, DESIGN_BASELINE).
//   startX          tâm chiến xa lúc vào trận; w/h hitbox 90x80 (không nhảy qua được).
//   shield          số nấc khiên. Chỉ mất nấc khi xe ĐÂM CỘT hoặc trúng HŨ DẦU bị
//                   chém phản; đòn chém trực tiếp (người chơi, bóng Trưng Nhị) chỉ
//                   làm xe nháy mờ + hiện gợi ý (tối đa 1 lần / hintInterval giây).
//   startDelay      chờ trước cú ném đầu tiên (đọc thông báo đầu màn).
//   throwCount/throwInterval  ném 2 lần, 2 lần BẮT ĐẦU cách nhau 1,6 s; hũ rời
//                   tay ở hit_frame 4 của `throw`, từ độ cao `muzzle` so với chân,
//                   lệch muzzleX về phía trước.
//   warnTime/shake  đứng báo trước 0,8 s, rung ngang 1 px (vẽ bằng code).
//   chargeSpeed     lao 220 px/s tới khi chạm cột đá hoặc tường.
//   stunTime        đâm cột: choáng 2,5 s. wallPause: đâm tường đứng 0,5 s.
//   pillarFade      cột đang nứt bị đâm lần nữa: mờ dần rồi biến mất.
//   jar             hũ dầu: bay vòng cung `flightTime` giây tới vị trí ngang của
//                   người chơi lúc ném (trọng lực `gravity`), hitbox w x h; chém
//                   trúng thì bị phản, bay thẳng `reflectSpeed` px/s về phía xe.
//   fire            FX_OIL_FIRE: vùng lửa rộng width, cao h, tồn tại `time` giây
//                   (animation impact 0,5 s rồi giữ ô cuối — quyết định Q5), mỗi
//                   đám lửa trúng người chơi tối đa 1 lần; lửa trên thân xe không
//                   gây sát thương (Q6).
//   footX           Tô Định đi bộ đứng sau xác xe ở giai đoạn 2 (không hitbox),
//                   giai đoạn 3 thành mục tiêu đánh được tại đây.
//   foot            giai đoạn 3 (§3.7): hitbox w x h, hp; trúng đòn bị đẩy lùi
//                   `knockback` px về phía cổng (tâm không quá maxX, tối đa 1
//                   lần mỗi khung); cứ rusherInterval giây 1 quân cảm tử ra từ
//                   cổng, tối đa rusherMax con cùng lúc; cutscene chạy trốn fleeSpeed.
//   cutscene        §3.8: disarmHold = đứng thêm sau `disarmed`; fadeTime = tối/
//                   sáng dần; walkSpeed = người chơi tự đi tới cổng; victoryHold
//                   = thời gian đứng `victory` trước panel cốt truyện cuối.
//   shieldScore/breakScore/reflectScore  điểm.
export const BOSS_TD = {
  startX: 600, w: 90, h: 80, shield: 3, startDelay: 1.5,
  throwCount: 2, throwInterval: 1.6, muzzle: 64, muzzleX: 20,
  warnTime: .8, shake: 1, chargeSpeed: 220, stunTime: 2.5, wallPause: .5, pillarFade: .3,
  hintInterval: 5,
  // reflectW/H: vùng nhận đòn chém để PHẢN hũ, rộng hơn hitbox gây lửa (team
  // 26/09 — hũ bay nhanh, cửa sổ canh nhịp quá hẹp với 10x10).
  jar: { id: 'PJ_OIL_JAR', anim: 'loop', w: 10, h: 10, reflectW: 20, reflectH: 20, flightTime: .9, gravity: 600, reflectSpeed: 260 },
  fire: { id: 'FX_OIL_FIRE', anim: 'impact', width: 32, h: 24, time: .6 },
  footX: 640,
  foot: { w: 22, h: 40, hp: 5, knockback: 16, maxX: 740, rusherInterval: 4, rusherMax: 2, fleeSpeed: 150 },
  cutscene: { disarmHold: .4, fadeTime: .4, walkSpeed: 120, victoryHold: 1.4 },
  shieldScore: 300, breakScore: 1000, reflectScore: 50
};
// Giai đoạn 2 — 3 đợt thân binh ra từ cổng (ARENA.spawnX); đợt sau bắt đầu khi
// đợt trước chết hết + gap giây. Cùng định dạng nhóm với SKILL_TEST.
export const WAVES = {
  gap: 1.5,
  groups: [
    [{ type: 'guard', at: 0, dx: 0 }, { type: 'guard', at: 0, dx: -40 }],
    [{ type: 'rusher', at: 0, dx: 0 }, { type: 'rusher', at: .6, dx: 0 }, { type: 'rusher', at: 1.2, dx: 0 }],
    [
      { type: 'guard', at: 0, dx: 0 }, { type: 'guard', at: 0, dx: -40 },
      { type: 'rusher', at: .6, dx: 0 }, { type: 'rusher', at: 1.2, dx: 0 }
    ]
  ]
};
// Thông báo trong trận (TT-BOSS-01 mục 5.2 — nguyên văn, Source of Truth).
export const BOSS_TEXT = {
  shieldHint: 'Khiên quá dày! Hãy dùng cột đá hoặc hũ dầu.',
  shieldBroken: 'Khiên chiến xa đã vỡ! Thân binh của Thái thú xông ra.',
  phase3: 'Tô Định không còn chỗ nấp!'
};

// Layout thử `?layout=skills` (chỉ màn 3): không boss; sinh lần lượt các nhóm
// (đợt sau khi đợt trước chết hết + gap giây), lặp lại; bao cát đứng yên
// dummyHp máu ở dummyX để đo sát thương. `at` = giây tính từ đầu nhóm, `dx` =
// lệch so với ARENA.spawnX.
export const SKILL_TEST = {
  gap: 1.5, dummyX: 380, dummyHp: 99,
  // Quân cảm tử ra trước lính canh (yêu cầu người chơi thử 26/09).
  groups: [
    [{ type: 'rusher', at: 0, dx: 0 }, { type: 'rusher', at: .6, dx: 0 }, { type: 'rusher', at: 1.2, dx: 0 }],
    [{ type: 'guard', at: 0, dx: 0 }, { type: 'guard', at: 0, dx: -40 }]
  ]
};

// ---- Câu chữ thông báo dùng trong engine (CHAPTER.text) ----
export const TEXT = {
  obstacleHit: 'Hãy nhảy hoặc lướt qua chướng ngại vật.',
  trapHit: 'Bạn va vào bẫy!',
  fell: 'Bạn rơi xuống hố và mất 1 máu.',
  hazardHit: 'Bạn va phải quân Hán!',
  hazardDefeated: 'Đã hạ chướng ngại vật!',
  projectileHit: 'Bạn trúng đạn của quân Hán!',
  bossContact: 'Lính giữ thành phản công!',
  bossDefeated: 'Đã đánh bại toán lính giữ thành!',
  bossBlocksFinish: 'Hãy hạ kiệu quan trước khi qua cổng.',
  itemPicked: (count, total) => `Đã thu thập sách lịch sử ${count}/${total}`,
  itemsMissing: count => `Bạn còn thiếu ${count} cuốn sách lịch sử.`,
  rescueHint: name => `Hãy hạ lính canh đang vây ${name}!`
};
