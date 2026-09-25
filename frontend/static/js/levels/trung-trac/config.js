// Hằng số thuần cho màn Trưng Trắc — không chứa logic, chỉ export để các
// module khác import dùng chung.

export const VIEW_W = 896;
export const VIEW_H = 360;
export const CHUNK_W = 1280;
export const LEVEL_CHUNKS = 12;
export const LEVEL_WORLD_WIDTH = CHUNK_W * LEVEL_CHUNKS;
// Dải đất ground.png (1792x70) vẽ ở cỡ GỐC, sát đáy khung nhìn. Ảnh có ~34 hàng
// trong suốt phía trên mép cỏ, nên mặt sàn vật lý (GROUND_Y) phải nằm ở MÉP CỎ
// chứ không phải mép trên của ảnh — nếu không nhân vật/vật cản sẽ lơ lửng.
// Tạo lại ground.png với lề khác thì chỉ cần sửa GROUND_GRASS_OFFSET.
export const GROUND_LAYER_HEIGHT = 70;
export const GROUND_LAYER_TOP = VIEW_H - GROUND_LAYER_HEIGHT;
export const GROUND_GRASS_OFFSET = 34;
export const GROUND_Y = GROUND_LAYER_TOP + GROUND_GRASS_OFFSET;
export const FOOT_MARGIN = 9;
export const MOVE_SPEED = 280;
export const GRAVITY = 2200;
export const JUMP_FORCE = 780;
export const DASH_SPEED = 720;
export const DASH_TIME = 0.30;
export const GROUND_SNAP_DISTANCE = 18;
// 6 GIF nhân vật đã được chuẩn hoá về CÙNG 1 khung 1202x610, nhân vật cùng tỉ lệ,
// chân cùng baseline (đáy khung), đầu cùng toạ độ ngang — nhờ vậy không cần hệ số
// bù riêng cho từng animation. Ô vẽ lấy chiều cao cố định, chiều rộng suy ra từ
// tỉ lệ ảnh thật lúc chạy, nên đổi ảnh khác khung vẫn không méo.
export const PLAYER_SPRITE_HEIGHT = 86;
// Vị trí đầu nhân vật trong khung (0..1) — khung lệch tâm vì tư thế dash có vệt
// tóc/bụi kéo dài về sau. Neo theo điểm này để nhân vật không "nhảy ngang" khi
// đổi animation và để lật trái/phải đúng tâm. Do script chuẩn hoá GIF tính ra.
export const PLAYER_SPRITE_ANCHOR_X = 0.4583;
export const OBSTACLE_GROUND_SINK = 7;

// Nền map v2 tách thành 3 plate tile ngang để gameplay dễ đọc:
// - sky: trời/núi xa, opaque, parallax chậm;
// - foreground: làng tre trung tầng có alpha fade trước lane chơi;
// - ground: dải cỏ/đất riêng, mép cỏ trùng GROUND_Y, chạy cùng tốc độ thế giới.
// Nhờ tách `ground`, cây/nhà không còn bị bake vào mặt sàn nên obstacle,
// hazard và nhân vật có thể đặt/chuyển độc lập mà không lộ đường ghép.
export const BACKDROP_ROOT = '/static/assets/images/backdrops/chapter1/';
// foreground.png (midground: làng/cây/núi gần) chỉ có nội dung ở dải y≈100–175
// (tính theo cỡ hiển thị 360px), mờ dần tới ~230, phần dưới trong suốt hoàn
// toàn. Vẽ từ y=0 thì dải làng lơ lửng giữa màn hình — dời xuống để CHÂN dải
// làng/cây (y≈175 trong ảnh) nằm ngay trên mép cỏ; phần sương mờ phía dưới
// bị layer `ground` (vẽ sau) che đi.
const MIDGROUND_BASE_IN_IMAGE = 175;
export const MIDGROUND_Y = GROUND_Y - MIDGROUND_BASE_IN_IMAGE - 8;

export const BACKDROP_LAYERS = [
  { key: 'sky', file: 'sky.png', y: 0, height: VIEW_H, speed: 0.22, fallbackColor: '#43b8e3' },
  { key: 'foreground', file: 'foreground.png', y: MIDGROUND_Y, height: VIEW_H, speed: 0.58, fallbackColor: 'rgba(0, 0, 0, 0)', fallbackBandHeight: 0 },
  { key: 'ground', file: 'ground.png', y: GROUND_LAYER_TOP, height: GROUND_LAYER_HEIGHT, speed: 1, fallbackColor: '#795238', fallbackBandHeight: VIEW_H - GROUND_Y }
];

// Set-piece cốt truyện (cổng làng, cầu, cổng thành...) đặt theo toạ độ world-X
// riêng lẻ, vẽ đè lên layer nền. Thiếu ảnh thì render.js tự vẽ fallback bằng
// canvas (xem drawLandmarkFallback), không lỗi, không trống trơn.
// worldX = tâm set-piece (không phải mép trái), height = chiều cao vẽ trong game,
// sink = số px chìm xuống dưới GROUND_Y cho phần chân/nền của ảnh ăn vào mặt đất.
// Chiều rộng tự suy từ tỉ lệ ảnh thật lúc chạy nên không bao giờ méo.
export const LANDMARKS = [
  // Cổng đích cuối màn 12/12. worldX=15150 khớp finishX = worldX(12, 1030) khai
  // báo trong state.js (12-1)*1280+1030 — sửa 1 trong 2 chỗ thì nhớ sửa chỗ kia.
  { file: 'finish-gate.png', worldX: 15150, height: 250, sink: 14 }
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
  // Bộ sprite có trạng thái (artifacts/sprite-forge-trung-trac) dùng chung
  // đường dẫn với bộ vật cản tĩnh lịch sử đã tái tạo, chỉ khác là chúng được
  // `hazards` dùng thay vì
  // `obstacles` vì có trạng thái (bẫy bật, xe vỡ) hoặc chỉ là cảnh trí.
  spikePitHidden: 'spike_pit_hidden.png',
  spikePitOpen: 'spike_pit_open.png',
  tributeCartBroken: 'tribute_cart_broken.png',
  watchtower: 'watchtower.png'
};

// Sprite ĐỘNG vẽ trên canvas phải là PNG strip ngang (canvas không chạy GIF —
// chỉ lấy khung đầu), các ô đều nhau: ô thứ i = [i*cellW, 0, cellW, h] với
// cellW = image.width / frames. `fps` là tốc độ phát, không liên quan tới FPS
// của game. Xem docs/sprite-spec-trung-trac.md mục 1.3.
// `facing` = hướng mặt GỐC trong ảnh (mặc định 'left'). Spec yêu cầu vẽ quay
// trái nhưng ảnh AI sinh ra không phải lúc nào cũng theo — kiệu quan, lính thu
// thuế, lính gác được vẽ quay phải. render.js tự lật để vật di chuyển quay theo
// hướng chạy, lính đứng/boss luôn quay về phía người chơi.
export const OBSTACLE_STRIP_FILES = {
  hanCavalry: { file: 'han_cavalry_strip6.png', frames: 6, fps: 12 },
  hanTaxSoldier: { file: 'han_tax_soldier_strip4.png', frames: 4, fps: 6, facing: 'right' },
  jungleTiger: { file: 'jungle_tiger_strip6.png', frames: 6, fps: 12 },
  officialPalanquin: { file: 'official_palanquin_strip4.png', frames: 4, fps: 6, facing: 'right' },
  patrolBoat: { file: 'patrol_boat_strip4.png', frames: 4, fps: 4 },
  tributeCart: { file: 'tribute_cart_strip4.png', frames: 4, fps: 9 },
  watchtowerGuard: { file: 'watchtower_guard_strip4.png', frames: 4, fps: 5, facing: 'right' }
};

// Lính ném đạn KHÔNG chạy strip theo đồng hồ chung (vòng lặp đó không liên
// quan gì tới lúc đạn bay ra). Thay vào đó: bình thường đứng yên ở ô `idle`,
// tới lượt ném thì chạy chuỗi `throw` một lần — mỗi bước là { frame: ô trong
// strip, time: số giây giữ ô đó }, bước có `release: true` là lúc đạn rời tay
// (đạn sinh ra ngay khi bước đó BẮT ĐẦU). `alarm` (nếu có) chạy một lần khi
// lính gác thổi tù và báo động. Ô trong strip:
//   hanTaxSoldier   0 đứng · 1 giơ túi tiền · 2 vung tay ném · 3 đứng
//   watchtowerGuard 0 đứng · 1 đứng · 2 phóng giáo/phi tiêu · 3 thổi tù và
// Enemy cận chiến dùng chung strip lính thu thuế cũng đứng ở ô `idle`.
export const THROWER_ANIMATIONS = {
  hanTaxSoldier: {
    idle: 0,
    throw: [
      { frame: 1, time: .45 },
      { frame: 2, time: .4, release: true }
    ]
  },
  watchtowerGuard: {
    idle: 0,
    alarm: [{ frame: 3, time: 1.1 }],
    throw: [
      { frame: 1, time: .45 },
      { frame: 2, time: .4, release: true }
    ]
  }
};

// Cỡ vẽ (drawW/drawH, tính bằng game px) giữ đúng tỉ lệ 1 Ô của strip nên
// sprite không bao giờ méo; hitbox (w/h) cố tình NHỎ HƠN cỡ vẽ vì phần rìa
// (bờm ngựa, mái kiệu, cán giáo, buồm thuyền) không nên tính là va chạm.
// Cỡ bám bảng "thước đo trong game" ở docs/sprite-spec-trung-trac.md mục 2.
export const HAZARD_SPRITE_SIZES = {
  jungleTiger: { drawW: 132, drawH: 64, w: 104, h: 52 },
  hanCavalry: { drawW: 132, drawH: 120, w: 92, h: 96 },
  tributeCart: { drawW: 168, drawH: 92, w: 120, h: 78 },
  tributeCartBroken: { drawW: 142, drawH: 90, w: 112, h: 58 },
  officialPalanquin: { drawW: 175, drawH: 100, w: 140, h: 82 },
  patrolBoat: { drawW: 190, drawH: 110, w: 150, h: 66 },
  hanTaxSoldier: { drawW: 74, drawH: 86, w: 46, h: 78 },
  watchtowerGuard: { drawW: 81, drawH: 86, w: 48, h: 78 },
  watchtower: { drawW: 111, drawH: 180, w: 111, h: 180 },
  spikePitHidden: { drawW: 133, drawH: 42, w: 120, h: 16 },
  // spike_pit_open.png là MẶT CẮT hố: mép cỏ 2 bên nằm ở 36% chiều cao ảnh,
  // lòng hố + chông ở dưới. `groundLine` = vị trí mép cỏ trong ảnh (0..1) để
  // render neo mép cỏ vào GROUND_Y (lòng hố chìm xuống dải đất) thay vì neo
  // đáy ảnh; `pitLeft/pitRight` = miệng hố (0..1 theo chiều ngang) để tô nền
  // tối phía sau chông. Hitbox chỉ bằng miệng hố, mỏng sát mặt đất: đi qua là
  // giẫm phải, nhảy qua thì an toàn.
  spikePitOpen: { drawW: 142, drawH: 60, w: 74, h: 12, groundLine: .36, pitLeft: .25, pitRight: .77 }
};

// Đạn bay: cỡ nhỏ (12–26 px theo spec) nên hitbox chỉ hẹp hơn cỡ vẽ một chút,
// đủ để lửa/tua đỏ ở đuôi không gây sát thương oan.
export const PROJECTILE_SIZES = {
  coinPouch: { drawW: 33, drawH: 26, w: 22, h: 18 },
  fireArrow: { drawW: 42, drawH: 20, w: 30, h: 14 },
  throwingDart: { drawW: 46, drawH: 17, w: 32, h: 12 }
};

export const PROJECTILE_SPEED = 330;
// Tầm bay tối đa của đạn (px tính từ điểm bắn). Bay hết tầm thì đạn tan —
// ≈1.4s ở PROJECTILE_SPEED. Để hơi lớn hơn fireRange (400–430) để đạn vẫn tới
// được người chơi đứng ở mép tầm bắn. Đoạn cuối PROJECTILE_FADE_RANGE mờ dần
// thay vì biến mất đột ngột.
export const PROJECTILE_MAX_RANGE = 460;
export const PROJECTILE_FADE_RANGE = 90;
// Hazard chạy khỏi tầm nhìn phía sau người chơi bao nhiêu px thì xoá khỏi
// state (tránh mảng phình to vô hạn khi chơi lâu).
export const HAZARD_DESPAWN_MARGIN = 520;

// Vật phẩm (item icon) lấy từ frontend/static/assets/images/items.
export const ITEM_ROOT = '/static/assets/images/items/';
export const ITEM_FILES = {
  book: 'book.png',
  heart: 'heart.png'
};

// Đạn nằm trong items/ nhưng là PNG strip (2 khung) giống obstacle động.
export const ITEM_STRIP_FILES = {
  coinPouch: { file: 'coin_pouch_strip2.png', frames: 2, fps: 8 },
  fireArrow: { file: 'fire_arrow_strip2.png', frames: 2, fps: 14 },
  throwingDart: { file: 'throwing_dart_strip2.png', frames: 2, fps: 12 }
};

// Nhân vật chính: thư mục riêng cho Trưng Trắc — khi thiếu GIF, engine tự
// fallback sang hình vẽ canvas (xem render.js/drawPlayer).
export const PLAYER_ROOT_CANDIDATES = ['/static/assets/images/characters/trung-trac/'];

export const PLAYER_ANIMATION_FILES = {
  idle: 'stance.gif',
  run: 'run.gif',
  jump: 'jump.gif',
  dash: 'dash.gif',
  attack: 'attack.gif',
  hurt: 'hurt.gif'
};

// Thời gian giữ animation trúng đòn (giây). Ngắn hơn thời gian bất tử (1.25s)
// để nhân vật quay lại tư thế thường trong lúc vẫn còn nhấp nháy miễn thương.
export const HURT_ANIMATION_TIME = 0.45;

// Enemy dùng strip riêng (OBSTACLE_STRIP_FILES) — atlas `mapchunk_1/contains
// obstacles.png` đã bỏ hẳn, không còn module nào đọc tới nó.
export const ENEMY_SPRITES = {
  normal: { sprite: 'hanTaxSoldier', drawW: 75, drawH: 88 },
  boss: { sprite: 'hanCavalry', drawW: 138, drawH: 126 }
};
