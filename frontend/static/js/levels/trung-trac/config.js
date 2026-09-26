// Hằng số thuần cho màn Trưng Trắc — không chứa logic, chỉ export để các
// module khác import dùng chung.

// Độ phân giải LOGIC của màn (TT-INT-01): mọi thứ vẽ lên canvas cao 270 rồi
// phóng ra màn hình (xem fitCanvas() trong render.js). Mọi toạ độ/kích
// thước/tốc độ dưới đây là pixel logic — đã quy đổi từ hệ cũ 896x360 theo hệ
// số k = 0.6 (khớp tỉ lệ bộ sprite 8-bit mới, xem docs/INTEGRATION_PLAN_TT.md).
// Hằng số tính theo giây KHÔNG nhân k.
// Chiều CAO logic cố định; chiều RỘNG khung nhìn (VIEW_W) giãn theo tỉ lệ cửa
// sổ để màn chơi phủ kín chiều ngang (yêu cầu team 26/09): tối thiểu LOGICAL_W
// (16:9 — cửa sổ hẹp/dọc giữ như cũ), tối đa MAX_VIEW_W. fitCanvas() đặt lại
// VIEW_W qua setViewWidth(); `export let` là live-binding nên các module khác
// import VIEW_W luôn đọc giá trị mới.
export const LOGICAL_W = 480;
export const LOGICAL_H = 270;
export const MAX_VIEW_W = 640; // DESIGN_BASELINE (~2.37:1, màn siêu rộng thì có viền 2 bên)
export let VIEW_W = LOGICAL_W;
export const VIEW_H = LOGICAL_H;
export function setViewWidth(width) {
  VIEW_W = width;
}
export const CHUNK_W = 768;
export const LEVEL_CHUNKS = 12;
export const LEVEL_WORLD_WIDTH = CHUNK_W * LEVEL_CHUNKS;
// Mặt sàn vật lý = mép trên hàng tile `surface` của tileset mặt đất (TT-MAP-01):
// tile surface 16px (248–264) + 6px tile fill (264–270, bị cắt ở đáy khung).
// Khớp `stage.ground_y` trong maps_tt.json (assets.js cảnh báo nếu lệch).
export const GROUND_Y = 248;
export const FOOT_MARGIN = 5;
export const MOVE_SPEED = 168;
export const GRAVITY = 1320;
export const JUMP_FORCE = 468;
export const DASH_SPEED = 432;
export const DASH_TIME = 0.30;
export const GROUND_SNAP_DISTANCE = 11;

// Bộ môi trường 8-bit (Codex, bản chép từ assets/maps/trung-trac/, giữ cấu trúc
// thư mục). maps_tt.json là nguồn cho đường dẫn + cỡ ảnh (đọc lúc chạy trong
// assets.js); các số dưới đây là cách VẼ (parallax, vị trí, vùng). Mọi lớp vẽ
// x1, không smoothing, lặp ngang theo đúng chiều rộng gốc của ảnh.
export const MAP_8BIT_ROOT = '/static/assets/images/maps-8bit/';
export const MAP_MANIFEST_FILE = 'maps_tt.json';
export const TILESET_ID = 'TILESET_TT_GROUND';

// Lớp nền từ xa đến gần. `bottomY` = đáy ảnh (null = phủ từ y=0).
// Parallax DESIGN_BASELINE (bản cũ: 0.22 trời / 0.58 lớp giữa / 1.0 đất).
export const SKY_PARALLAX = 0.05; // DESIGN_BASELINE
// Đồi xa vẽ tông trời nắng nên lạc tông dưới trời giông: `hiddenUnderSky` =
// các ảnh trời mà dưới đó đồi xa tắt dần (cùng hệ số hoà với trời) — ảnh trời
// giông đã có dãy núi xa riêng (quyết định team, phương án (a) sau Phase B).
export const FAR_HILLS = { id: 'BG_TT_FAR_HILLS', parallax: 0.2, bottomY: 230, hiddenUnderSky: ['BG_TT_SKY_STORM'] }; // DESIGN_BASELINE
export const MID_PARALLAX = 0.5; // DESIGN_BASELINE — đáy ảnh lớp giữa ở GROUND_Y
export const SKY_FALLBACK_COLOR = '#43b8e3';
export const GROUND_FALLBACK_COLOR = '#795238';

// Vùng cảnh theo world X (chunk đếm từ 1: Z1 = chunk 1–3 = 0–2304...). Vùng
// chỉ đổi CẢNH, vật cản vẫn xáo ngẫu nhiên (state.js). `tiles` = region
// trong tileset_tt_ground.json.
export const ZONES = [
  { id: 'Z1', x0: 0, x1: 2304, sky: 'BG_TT_SKY_DAY', mid: 'BG_TT_MID_VILLAGE', tiles: 'Z1' },
  { id: 'Z2', x0: 2304, x1: 3840, sky: 'BG_TT_SKY_DAY', mid: 'BG_TT_MID_FIELDS', tiles: 'Z2' },
  { id: 'Z3', x0: 3840, x1: 6144, sky: 'BG_TT_SKY_DAY', mid: 'BG_TT_MID_FOREST', tiles: 'Z3' },
  { id: 'Z4', x0: 6144, x1: 7680, sky: 'BG_TT_SKY_DAY', mid: 'BG_TT_MID_RIVER', tiles: 'Z4' },
  { id: 'Z5', x0: 7680, x1: 9216, sky: 'BG_TT_SKY_STORM', mid: 'BG_TT_MID_CITADEL', tiles: 'Z5' }
];
// Lớp giữa + trời hoà dần trong ZONE_BLEND_WIDTH px TRƯỚC mỗi ranh giới, tính
// theo tâm khung nhìn (cameraX + VIEW_W/2) — hoà xong đúng lúc tâm khung nhìn
// chạm ranh giới, nên trời đã đổi sang giông trước khi người chơi vào chunk 11
// (quyết định team G3). Mặt đất KHÔNG hoà: đổi tile dứt khoát tại ranh giới.
export const ZONE_BLEND_WIDTH = 192; // DESIGN_BASELINE
// Tỉ lệ cột tile mặt đất có decor (cỏ, lau...) — chọn tất định theo cột.
export const GROUND_DECOR_DENSITY = 0.25; // DESIGN_BASELINE

// Trigger về đích (= worldX(12, 618)) — state.js (finishX) và cổng thành dùng
// chung số này. Cổng Luy Lâu đặt TÂM tại đây (quyết định team G1: bỏ độ lệch
// +24px của ảnh cũ); cổng 192px trải 8970–9162 < 9216.
export const FINISH_X = CHUNK_W * 11 + 618;
// Cổng thành Luy Lâu (prop, KHÔNG có hitbox — trigger về đích giữ nguyên ở
// physics.js). Vẽ x1, pivot bottom-center lấy từ maps_tt.json, đáy ở GROUND_Y
// (không chìm). Đổi sang ảnh mở khi đã đủ điều kiện NỘI DUNG (mini-boss đã hạ
// + nhặt đủ sách — `bossAlive()` ở state.js), trước khi người chơi chạm FINISH_X; suy ra mỗi frame nên không
// đóng lại (G7).
export const FINISH_GATE = { closed: 'PROP_LUYLAU_GATE', open: 'PROP_LUYLAU_GATE_OPEN', worldX: FINISH_X };

// Màn 2 "Chiêu mộ hiền tài" (TT-NPC-01 §3.2.1, DESIGN_BASELINE): 4 chunk, trời
// ngày suốt màn. Chunk 1 làng (Z1), chunk 2 đồng lúa (Z2), chunk 3–4 bến sông
// (Z4) — `id`/`tiles` giữ tên vùng của TT-MAP-01 để dùng đúng tile + lớp giữa.
// Hoà cảnh giữa vùng theo đúng cách màn 1 (ZONE_BLEND_WIDTH).
export const LEVEL2_ZONES = [
  { id: 'Z1', x0: 0, x1: 768, sky: 'BG_TT_SKY_DAY', mid: 'BG_TT_MID_VILLAGE', tiles: 'Z1' },
  { id: 'Z2', x0: 768, x1: 1536, sky: 'BG_TT_SKY_DAY', mid: 'BG_TT_MID_FIELDS', tiles: 'Z2' },
  { id: 'Z4', x0: 1536, x1: 3072, sky: 'BG_TT_SKY_DAY', mid: 'BG_TT_MID_RIVER', tiles: 'Z4' }
];
// Điểm kết thúc màn 2: cuối chunk 4 lùi 96px (D15 — không vẽ cổng).
export const LEVEL2_FINISH_X = CHUNK_W * 4 - 96;

// Các màn của chương dùng CHUNG một bộ engine (TT-NPC-01, phương án A): main.js
// đọc `data-level` của trang rồi gọi setLevel(); mọi module đọc thông số màn
// đang chơi qua `LEVEL` (live-binding như VIEW_W). Dữ liệu nội dung (vật cản,
// NPC, sách) nằm ở state.js theo LEVEL.id.
//   chunks / worldWidth  độ dài màn.
//   zones   vùng cảnh (trời, lớp giữa, tile) theo world X.
//   finishX điểm về đích; gate = cổng vẽ tại finishX (null = không có cổng).
//   title   tên màn (panel đầu/cuối màn, tiêu đề trang).
export const LEVELS = {
  1: {
    id: 1, title: 'Màn 1: Vượt ải', chunks: LEVEL_CHUNKS, worldWidth: LEVEL_WORLD_WIDTH,
    zones: ZONES, finishX: FINISH_X, gate: FINISH_GATE
  },
  2: {
    id: 2, title: 'Màn 2: Chiêu mộ hiền tài', chunks: 4, worldWidth: CHUNK_W * 4,
    zones: LEVEL2_ZONES, finishX: LEVEL2_FINISH_X, gate: null
  }
};
export let LEVEL = LEVELS[1];
export function setLevel(id) {
  LEVEL = LEVELS[id] || LEVELS[1];
  return LEVEL;
}

// Dốc/địa hình đặc biệt (nếu cần) khai báo tại đây thay vì gắn cứng theo
// số chunk như trước. Rỗng = mặt đất phẳng theo GROUND_Y trên toàn bộ level.
export const TERRAIN_RAMPS = [];

// Vật cản tĩnh (`obstacles`) -> asset 8-bit trong maps_tt.json + cách neo/cờ.
// Hitbox (w, h) do state.js truyền vào makeObstacle — KHÔNG lấy từ cỡ ảnh. Vẽ
// x1 theo cỡ PNG, căn sao cho PHẦN NHÌN THẤY trùng hitbox:
//   - asset có `visible_bbox` (3 loại P0): góc bbox trùng góc trên-trái hitbox;
//   - còn lại: đáy-giữa canvas trùng đáy-giữa hitbox + groundSink.
//   anchor     'bottom' (hitbox đứng trên mặt đất), 'overhead' (hitbox 20px ở
//              GROUND_Y - 46, khe dash 26px phía dưới), 'top' (mặt trên hitbox
//              ở GROUND_Y — cầu bắc qua hố).
//   groundSink số px đáy ảnh chìm dưới đáy hitbox (4 cho 3 loại cũ — khớp
//              visible_bbox; 0 cho P2).
//   requiresHole  chỉ được tạo khi có hố tương ứng (state.js kiểm tra).
// P2 (fenceLow...logDrift): khai báo sẵn, màn thường CHƯA dùng — chỉ có trong
// layout thử `?layout=p2`. Hitbox P2 là DESIGN_BASELINE (task TT-MAP-01 §3.3.4).
// spikesTrap: không có asset 8-bit (màn dùng hazard TR_SPIKE_PIT) — giữ khai
// báo, thiếu ảnh thì render vẽ hộp tạm (G8). Ảnh cũ trong images/obstacles/ đã
// ngừng tham chiếu nhưng vẫn giữ trên đĩa.
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
  spikesTrap: { id: null, anchor: 'bottom', groundSink: 0 }
};
// (Các ảnh hazard cũ spike_pit_*.png, tribute_cart_broken.png, watchtower.png
// và các strip *_strip*.png đã ngừng tham chiếu — hazard/enemy/đạn giờ dùng
// bộ sprite 8-bit, xem HAZARD_SPRITES. File ảnh cũ vẫn giữ nguyên trên đĩa.)

// Ảnh 8-bit của map cần tải ngoài các lớp nền/tileset (vật cản, sách, cổng).
export const MAP_PROPS_IN_GAME = [
  ...Object.values(OBSTACLE_TYPES).map(type => type.id).filter(Boolean),
  'ITEM_BINH_THU', FINISH_GATE.closed, FINISH_GATE.open
];

// Hazard (vật cản/kẻ địch có trạng thái) -> asset 8-bit trong manifest. Khoá
// (jungleTiger, hanTaxSoldier...) là tên `sprite` state.js dùng.
//   id      asset trong manifest_tt.json (mọi strip quay mặt PHẢI; render tự lật
//           để vật chạy quay theo hướng chạy, lính/boss quay về phía người chơi).
//   w, h    hitbox (px logic) tính từ pivot bottom-center (tâm ngang, chân) —
//           KHÔNG lấy từ cỡ ảnh. DESIGN_BASELINE (docs/INTEGRATION_PLAN_TT.md §5).
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
//   sink    số px chìm xuống dưới mặt đất khi vẽ (bẫy chông nằm lọt vào cỏ).
//   corpse  hết máu thì phát death 1 lần rồi NẰM LẠI map ở ô cuối, vô hại
//           (xe cống — quyết định team §9.2).
export const HAZARD_SPRITES = {
  officialPalanquin: { id: 'EN_HAN_PALANQUIN', w: 76, h: 44, anims: { move: 'walk', idle: 'walk', hurt: 'hurt', death: 'break' } },
  // Mini-boss kiệu quan màn 1 (TT-NPC-01, hành vi `patrol` — xem MINIBOSS).
  // Cùng asset/hitbox với kiệu `roller` (hiện không còn trong nhóm xáo). Kiệu
  // không có `idle`: khi đứng chờ ném thì dừng ở ô 1 của `walk` (`idleHold`,
  // quyết định team D6). Dao rời tay ở hit_frame 3 của `throw` (fps manifest,
  // không ép thời lượng). muzzle 24 = DESIGN_BASELINE (D10).
  palanquinBoss: {
    id: 'EN_HAN_PALANQUIN', w: 76, h: 44, muzzle: 24, idleHold: true,
    anims: { move: 'walk', idle: 'walk', throw: 'throw', hurt: 'hurt', death: 'break' }
  },
  jungleTiger: { id: 'EN_TIGER', w: 48, h: 24, anims: { move: 'run', idle: 'idle', hurt: 'hurt', death: 'death' } },
  tributeCart: { id: 'OB_TRIBUTE_CART', w: 48, h: 38, anims: { move: 'roll', idle: 'roll', death: 'break' }, corpse: true },
  hanCavalry: { id: 'EN_HAN_CAVALRY', w: 56, h: 48, anims: { move: 'gallop', idle: 'gallop', hurt: 'hurt', death: 'death' } },
  hanTaxSoldier: {
    id: 'EN_HAN_TAXMAN', w: 20, h: 40, muzzle: 32,
    anims: { idle: 'idle', throw: 'throw', hurt: 'hurt', death: 'death' }, durations: { throw: .85 }
  },
  watchtowerGuard: {
    id: 'EN_HAN_WATCHTOWER', w: 22, h: 36, muzzle: 32, alarmTime: 1.1,
    anims: { idle: 'idle', alarm: 'alarm', throw: 'throw', hurt: 'hurt', death: 'death' }, durations: { throw: .85 }
  },
  watchtower: { id: 'PROP_WATCHTOWER', w: 29, h: 91, anims: { idle: 'idle' } },
  // Hố chông mới là hố NÔNG 48x16 (không còn ảnh mặt cắt): cỏ -> chông trồi
  // lên (reveal 1 lần). Chìm 3px vào dải cỏ; hitbox mỏng sát mặt đất.
  spikePit: { id: 'TR_SPIKE_PIT', w: 36, h: 6, sink: 3, anims: { idle: 'hidden', sprung: 'reveal' } },
  // Thuyền tuần tra: khai báo sẵn, KHÔNG có trong màn hiện tại.
  patrolBoat: {
    id: 'EN_HAN_BOAT', w: 70, h: 24, muzzle: 22,
    anims: { idle: 'float', move: 'float', throw: 'shoot', death: 'death' }
  }
};

// Enemy (lính canh / boss) -> asset 8-bit. Hitbox nằm trong state.js (enemy
// là object phẳng). Boss hiện chỉ đứng + nhận đòn (chưa có cơ chế 3 giai
// đoạn), nên chỉ dùng idle; hết máu phát shield_break 1 lần rồi xoá.
// Boss Tô Định TẠM KHÔNG đặt vào màn 1 (TT-NPC-01: thay bằng mini-boss kiệu
// quan) — giữ khai báo để màn 3 dùng lại.
export const ENEMY_SPRITES = {
  normal: { id: 'EN_HAN_GUARD', anims: { idle: 'idle', walk: 'walk', attack: 'attack_01', hurt: 'hurt', death: 'death' } },
  boss: { id: 'BOSS_TO_DINH_CHARIOT', anims: { idle: 'idle', death: 'shield_break' } }
};

// Đạn -> asset 8-bit (khoá là tên `projectile` hazard khai báo). Hitbox (w, h)
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

export const PROJECTILE_SPEED = 198;
// Tầm bay tối đa của đạn (px tính từ điểm bắn). Bay hết tầm thì đạn tan —
// ≈1.4s ở PROJECTILE_SPEED. Để hơi lớn hơn fireRange (240–258) để đạn vẫn tới
// được người chơi đứng ở mép tầm bắn. Đoạn cuối PROJECTILE_FADE_RANGE mờ dần
// thay vì biến mất đột ngột.
export const PROJECTILE_MAX_RANGE = 276;
export const PROJECTILE_FADE_RANGE = 54;
// Hazard chạy khỏi tầm nhìn phía sau người chơi bao nhiêu px thì xoá khỏi
// state (tránh mảng phình to vô hạn khi chơi lâu).
export const HAZARD_DESPAWN_MARGIN = 312;

// Icon HUD lấy từ frontend/static/assets/images/items (heart vẽ bằng DOM ở ui.js).
export const ITEM_ROOT = '/static/assets/images/items/';
export const ITEM_FILES = {
  heart: 'heart.png'
};
// Bình thư (`books`): strip ITEM_BINH_THU (4 ô 16x16) vẽ x1, tâm tại
// (book.x, book.y + bob), lặp BOOK_FPS (manifest để fps null). Hitbox nhặt
// 22x26 ở physics.js giữ nguyên (lớn hơn hình — dễ nhặt).
export const BOOK_SPRITE_ID = 'ITEM_BINH_THU';
export const BOOK_FPS = 6; // DESIGN_BASELINE
export const BOOK_BOB_AMPLITUDE = 3;

// Thời gian giữ animation trúng đòn (giây). Ngắn hơn thời gian bất tử (1.25s)
// để nhân vật quay lại tư thế thường trong lúc vẫn còn nhấp nháy miễn thương.
export const HURT_ANIMATION_TIME = 0.45;

// Bộ sprite 8-bit mới (Codex, bản chép từ assets/sprites/). Manifest là nguồn
// DUY NHẤT cho frames/fps/loop/hit_frame — đọc lúc chạy (animation.js), không
// chép các số đó vào đây. Mọi strip vẽ x1 (không co giãn), pivot bottom-center:
// chân nằm ở hàng frame_h - 2 (1px đệm dưới chân), quay mặt PHẢI trong ảnh.
export const SPRITE_8BIT_ROOT = '/static/assets/images/sprites-8bit/';
export const SPRITE_MANIFEST_FILE = 'manifest_tt.json';
// Các asset 8-bit game cần tải strip (viewer tự tải riêng mọi asset).
export const SPRITE_8BIT_IN_GAME = [
  'PLAYER_TRUNG_TRAC',
  'EN_HAN_PALANQUIN', 'EN_TIGER', 'OB_TRIBUTE_CART', 'EN_HAN_CAVALRY',
  'EN_HAN_TAXMAN', 'EN_HAN_WATCHTOWER', 'PROP_WATCHTOWER', 'TR_SPIKE_PIT', 'EN_HAN_BOAT',
  'EN_HAN_GUARD', 'BOSS_TO_DINH_CHARIOT',
  'PJ_COIN_POUCH', 'PJ_SPEAR', 'PJ_FIRE_ARROW', 'PJ_THROWING_KNIFE',
  'NPC_THI_SACH', 'NPC_LE_CHAN', 'NPC_TRUNG_NHI'
];

// NPC màn 2 (TT-NPC-01 §3.2.3). Khoá = `npc.id` trong state.js và
// dialogue-data.js. Sprite 48x48 quay PHẢI, pivot bottom-center; render lật để
// NPC quay về phía người chơi. Không có va chạm (hitbox chỉ để F2 hiển thị).
//   portrait  chân dung 64x64 cho khung hội thoại (DOM, image-rendering: pixelated).
export const NPC_SPRITES = {
  thiSach: { id: 'NPC_THI_SACH', portrait: 'PORTRAIT_THI_SACH', anims: { idle: 'idle', talk: 'talk' } },
  leChan: { id: 'NPC_LE_CHAN', portrait: 'PORTRAIT_LE_CHAN', anims: { idle: 'idle', talk: 'talk' } },
  trungNhi: { id: 'NPC_TRUNG_NHI', portrait: 'PORTRAIT_TRUNG_NHI', anims: { idle: 'idle', talk: 'talk' } }
};
// DESIGN_BASELINE:
//   talkDistance  khoảng trống từ mép phải người chơi tới tâm NPC để mở hội thoại.
//   holdGap       NPC chưa gặp xong thì mép phải người chơi bị giữ cách tâm NPC
//                 chừng này (như cổng đích giữ người chơi).
//   fadeTime      gặp xong NPC mờ dần trong chừng này giây rồi biến mất.
//   w, h          hộp F2 của NPC (không va chạm).
//   clearance     không đặt vật cản trong vòng này quanh tâm NPC (state.js kiểm tra).
export const NPC_RULES = { talkDistance: 32, holdGap: 12, fadeTime: 0.8, w: 22, h: 42, clearance: 96 };
// Điểm câu hỏi màn 2 (D14): đúng ngay lần đầu / đúng sau khi đã chọn sai.
export const QUESTION_SCORE = { firstTry: 500, retry: 250 }; // DESIGN_BASELINE

// Đòn đánh của người chơi (giây). Animation attack_01 (6 ô) trải trên đúng
// ATTACK_COOLDOWN; cửa sổ gây sát thương (`attacking`) dài ATTACK_ACTIVE_TIME,
// BẮT ĐẦU tại ô hit_frame của manifest (ô 3 -> 2/6 x .36 = .12s sau khi bấm).
export const ATTACK_COOLDOWN = 0.36;
export const ATTACK_ACTIVE_TIME = 0.18;

// Nhân vật chính: trạng thái gameplay -> animation trong manifest
// (PLAYER_TRUNG_TRAC). Thứ tự ưu tiên hurt > dash > attack > jump > run > idle
// nằm ở playerAnimationState() (physics.js).
//   duration: trải strip trên đúng số giây này thay vì fps của manifest.
//   byVelocity: chọn ô theo vận tốc dọc (lên / gần đỉnh / rơi), không theo giờ.
//   holdFrame: đứng yên ở 1 ô cố định (-1 = ô cuối).
// Mọi strip vẽ x1 — attack_01 đã được vẽ lại đúng tỉ lệ ở Batch R (TT-MAP-01).
// dash: 4 ô, không lặp (16fps = .25s < DASH_TIME .30s) -> đứng ở ô cuối tới hết cú lướt.
// death chỉ phát khi thua (endGame(false) ghi player.deathTime).
export const PLAYER_SPRITE_ID = 'PLAYER_TRUNG_TRAC';
export const PLAYER_ANIMATIONS = {
  idle: { anim: 'idle' },
  run: { anim: 'run' },
  jump: { anim: 'jump', byVelocity: true },
  attack: { anim: 'attack_01', duration: ATTACK_COOLDOWN},
  hurt: { anim: 'hurt' },
  dash: { anim: 'dash' },
  death: { anim: 'death' }
};
// Ngưỡng vận tốc dọc (px logic/s) chọn ô `jump`: vy < -N ô 1 (bật lên),
// |vy| <= N ô 2 (gần đỉnh), vy > N ô 3 (rơi). DESIGN_BASELINE.
export const PLAYER_JUMP_APEX_VY = 90;
