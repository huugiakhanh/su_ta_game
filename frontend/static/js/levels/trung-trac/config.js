// Hằng số thuần cho màn Trưng Trắc — không chứa logic, chỉ export để các
// module khác import dùng chung.

// Độ phân giải LOGIC của màn (TT-INT-01): mọi thứ vẽ lên canvas 480x270 rồi
// phóng to bội số nguyên ra màn hình (xem fitCanvas() trong render.js). Mọi
// toạ độ/kích thước/tốc độ dưới đây là pixel logic — đã quy đổi từ hệ cũ
// 896x360 theo hệ số k = 0.6 (khớp tỉ lệ bộ sprite 8-bit mới, xem
// docs/INTEGRATION_PLAN_TT.md). Hằng số tính theo giây KHÔNG nhân k.
export const LOGICAL_W = 480;
export const LOGICAL_H = 270;
export const VIEW_W = LOGICAL_W;
export const VIEW_H = LOGICAL_H;
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
// (quyết định team G3).
export const ZONE_BLEND_WIDTH = 192; // DESIGN_BASELINE
// Mặt đất chuyển vùng bằng dải dither pixel art rộng GROUND_BLEND_WIDTH, căn
// giữa ranh giới (thay cho cắt dứt khoát của task card §3.2 — yêu cầu của team
// sau khi chơi thử Phase B): mỗi ô GROUND_DITHER_CELL px lấy tile vùng trước
// hoặc vùng sau theo nhiễu tất định, tỉ lệ vùng sau tăng dần 0 -> 1 qua dải.
// Phải là bội số của 32 (nửa dải là bội số cỡ tile 16) để dải khớp lưới cột.
export const GROUND_BLEND_WIDTH = 192; // DESIGN_BASELINE
export const GROUND_DITHER_CELL = 2; // DESIGN_BASELINE
// Tỉ lệ cột tile mặt đất có decor (cỏ, lau...) — chọn tất định theo cột.
export const GROUND_DECOR_DENSITY = 0.25; // DESIGN_BASELINE

// Trigger về đích (= worldX(12, 618)) — state.js (finishX) và cổng thành dùng
// chung số này. Cổng Luy Lâu đặt TÂM tại đây (quyết định team G1: bỏ độ lệch
// +24px của ảnh cũ); cổng 192px trải 8970–9162 < 9216.
export const FINISH_X = CHUNK_W * 11 + 618;
// Cổng thành Luy Lâu (prop, KHÔNG có hitbox — trigger về đích giữ nguyên ở
// physics.js). Vẽ x1, pivot bottom-center lấy từ maps_tt.json, đáy ở GROUND_Y
// (không chìm). Đổi sang ảnh mở khi đã đủ điều kiện NỘI DUNG (boss đã hạ + nhặt
// đủ sách), trước khi người chơi chạm FINISH_X; suy ra mỗi frame nên không
// đóng lại (G7).
export const FINISH_GATE = { closed: 'PROP_LUYLAU_GATE', open: 'PROP_LUYLAU_GATE_OPEN', worldX: FINISH_X };

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
export const ENEMY_SPRITES = {
  normal: { id: 'EN_HAN_GUARD', anims: { idle: 'idle', hurt: 'hurt', death: 'death' } },
  boss: { id: 'BOSS_TO_DINH_CHARIOT', anims: { idle: 'idle', death: 'shield_break' } }
};

// Đạn -> asset 8-bit (khoá là tên `projectile` hazard khai báo). Hitbox (w, h)
// nhỏ hơn hình một chút để đuôi lửa/cán giáo không gây sát thương oan. Mọi
// strip đạn quay PHẢI, bay sang trái thì lật.
export const PROJECTILE_SPRITES = {
  coinPouch: { id: 'PJ_COIN_POUCH', anim: 'loop', w: 10, h: 10 },
  throwingDart: { id: 'PJ_SPEAR', anim: 'idle', w: 22, h: 4 },
  fireArrow: { id: 'PJ_FIRE_ARROW', anim: 'loop', w: 16, h: 5 }
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
  'PJ_COIN_POUCH', 'PJ_SPEAR', 'PJ_FIRE_ARROW'
];

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
