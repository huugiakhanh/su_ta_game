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
// Dải đất ground.png (1792x70) vẽ thu theo k (70 -> 42px), sát đáy khung nhìn.
// Ảnh có ~34 hàng gốc (-> 20px) trong suốt phía trên mép cỏ, nên mặt sàn vật
// lý (GROUND_Y) phải nằm ở MÉP CỎ chứ không phải mép trên của ảnh — nếu không
// nhân vật/vật cản sẽ lơ lửng. Tạo lại ground.png với lề khác thì chỉ cần sửa
// GROUND_GRASS_OFFSET. TODO_MAP: nền sẽ vẽ lại theo brief môi trường.
export const GROUND_LAYER_HEIGHT = 42;
export const GROUND_LAYER_TOP = VIEW_H - GROUND_LAYER_HEIGHT;
export const GROUND_GRASS_OFFSET = 20;
export const GROUND_Y = GROUND_LAYER_TOP + GROUND_GRASS_OFFSET;
export const FOOT_MARGIN = 5;
export const MOVE_SPEED = 168;
export const GRAVITY = 1320;
export const JUMP_FORCE = 468;
export const DASH_SPEED = 432;
export const DASH_TIME = 0.30;
export const GROUND_SNAP_DISTANCE = 11;
export const OBSTACLE_GROUND_SINK = 4;

// Nền map v2 tách thành 3 plate tile ngang để gameplay dễ đọc:
// - sky: trời/núi xa, opaque, parallax chậm;
// - foreground: làng tre trung tầng có alpha fade trước lane chơi;
// - ground: dải cỏ/đất riêng, mép cỏ trùng GROUND_Y, chạy cùng tốc độ thế giới.
// Nhờ tách `ground`, cây/nhà không còn bị bake vào mặt sàn nên obstacle,
// hazard và nhân vật có thể đặt/chuyển độc lập mà không lộ đường ghép.
export const BACKDROP_ROOT = '/static/assets/images/backdrops/chapter1/';
// foreground.png (midground: làng/cây/núi gần) vẽ cao FOREGROUND_HEIGHT (=
// 360px hệ cũ x k), chỉ có nội dung ở dải y≈60–105 (theo cỡ vẽ đó), mờ dần tới
// ~138, phần dưới trong suốt hoàn toàn. Vẽ từ y=0 thì dải làng lơ lửng giữa
// màn hình — dời xuống để CHÂN dải làng/cây (y≈105 trong ảnh) nằm ngay trên
// mép cỏ; phần sương mờ phía dưới bị layer `ground` (vẽ sau) che đi.
const FOREGROUND_HEIGHT = 216;
const MIDGROUND_BASE_IN_IMAGE = 105;
export const MIDGROUND_Y = GROUND_Y - MIDGROUND_BASE_IN_IMAGE - 5;

// Khung 480x270 (k = 0.6) cao hơn hệ cũ 54px logic — phần dư là trời phía
// trên, nên `sky` kéo phủ cả VIEW_H (TODO_MAP: vẽ lại nền đúng tỉ lệ 16:9).
export const BACKDROP_LAYERS = [
  { key: 'sky', file: 'sky.png', y: 0, height: VIEW_H, speed: 0.22, fallbackColor: '#43b8e3' },
  { key: 'foreground', file: 'foreground.png', y: MIDGROUND_Y, height: FOREGROUND_HEIGHT, speed: 0.58, fallbackColor: 'rgba(0, 0, 0, 0)', fallbackBandHeight: 0 },
  { key: 'ground', file: 'ground.png', y: GROUND_LAYER_TOP, height: GROUND_LAYER_HEIGHT, speed: 1, fallbackColor: '#795238', fallbackBandHeight: VIEW_H - GROUND_Y }
];

// Set-piece cốt truyện (cổng làng, cầu, cổng thành...) đặt theo toạ độ world-X
// riêng lẻ, vẽ đè lên layer nền. Thiếu ảnh thì render.js tự vẽ fallback bằng
// canvas (xem drawLandmarkFallback), không lỗi, không trống trơn.
// worldX = tâm set-piece (không phải mép trái), height = chiều cao vẽ trong game,
// sink = số px chìm xuống dưới GROUND_Y cho phần chân/nền của ảnh ăn vào mặt đất.
// Chiều rộng tự suy từ tỉ lệ ảnh thật lúc chạy nên không bao giờ méo.
export const LANDMARKS = [
  // Cổng đích cuối màn 12/12. worldX=9090 ứng với finishX = worldX(12, 618)
  // khai báo trong state.js (12-1)*768+618 = 9066 — sửa 1 trong 2 chỗ thì nhớ
  // sửa chỗ kia. (Lệch 24px có từ bản cũ 15150 vs 15110, giữ nguyên khi quy đổi.)
  { file: 'finish-gate.png', worldX: 9090, height: 150, sink: 8 }
];

// Dốc/địa hình đặc biệt (nếu cần) khai báo tại đây thay vì gắn cứng theo
// số chunk như trước. Rỗng = mặt đất phẳng theo GROUND_Y trên toàn bộ level.
export const TERRAIN_RAMPS = [];

// Phần 1: mỗi loại chướng ngại vật là 1 ảnh riêng (không dùng atlas cắt ô
// nữa) lấy từ frontend/static/assets/images/obstacles — dễ thêm/thay ảnh
// theo từng type mà không đụng tới sheet chung.
export const OBSTACLE_SPRITE_ROOT = '/static/assets/images/obstacles/';
export const OBSTACLE_SPRITE_FILES = {
  bambooSlope: 'bamboo_slope.png',
  bridge: 'bridge.png',
  fallenBranch: 'fallen_branch.png',
  fenceHigh: 'fence_high.png',
  fenceLow: 'fence_low.png',
  logDrift: 'log.png',
  reedCurtain: 'reed_curtain.png',
  slideBar: 'slide_bar.png',
  spikesTrap: 'spikes.png',
  stoneBlock: 'stone_block.png',
};
// (Các ảnh hazard cũ spike_pit_*.png, tribute_cart_broken.png, watchtower.png
// và các strip *_strip*.png đã ngừng tham chiếu — hazard/enemy/đạn giờ dùng
// bộ sprite 8-bit, xem HAZARD_SPRITES. File ảnh cũ vẫn giữ nguyên trên đĩa.)

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

// Vật phẩm (item icon) lấy từ frontend/static/assets/images/items.
export const ITEM_ROOT = '/static/assets/images/items/';
export const ITEM_FILES = {
  book: 'book.png',
  heart: 'heart.png'
};

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
//   drawScale: hệ số vẽ bù cho strip bị vẽ SAI TỈ LỆ so với các strip khác.
//     TẠM THỜI — attack_01 của Codex vẽ nhân vật chỉ cao ~29-30px (đầu cũng
//     nhỏ theo) trong khi idle/run/dash cao 44px, tức nhỏ hơn ~1.5 lần, không
//     phải do tư thế cúi. Đã báo NEED_REDRAW (docs/REPORT_TT-INT-01.md); vẽ
//     lại đúng tỉ lệ thì XOÁ drawScale. DESIGN_BASELINE: 1.5 (44 / 29.5).
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
