// Hằng số thuần cho màn Trưng Trắc — không chứa logic, chỉ export để các
// module khác import dùng chung.

export const VIEW_W = 896;
export const VIEW_H = 360;
export const CHUNK_W = 1280;
export const LEVEL_CHUNKS = 12;
export const LEVEL_WORLD_WIDTH = CHUNK_W * LEVEL_CHUNKS;
export const GROUND_Y = 290;
export const FOOT_MARGIN = 9;
export const MOVE_SPEED = 280;
export const GRAVITY = 2200;
export const JUMP_FORCE = 780;
export const DASH_SPEED = 720;
export const DASH_TIME = 0.30;
export const GROUND_SNAP_DISTANCE = 18;
// 4 GIF nhân vật đã được chuẩn hoá về CÙNG 1 khung 790x608, nhân vật cùng tỉ lệ,
// chân cùng baseline (đáy khung), đầu cùng toạ độ ngang — nhờ vậy không cần hệ số
// bù riêng cho từng animation. Ô vẽ lấy chiều cao cố định, chiều rộng suy ra từ
// tỉ lệ ảnh thật lúc chạy, nên đổi ảnh khác khung vẫn không méo.
export const PLAYER_SPRITE_HEIGHT = 86;
// Vị trí đầu nhân vật trong khung (0..1) — khung lệch tâm vì tư thế dash có vệt
// tóc/bụi kéo dài về sau. Neo theo điểm này để nhân vật không "nhảy ngang" khi
// đổi animation và để lật trái/phải đúng tâm. Do script chuẩn hoá GIF tính ra.
export const PLAYER_SPRITE_ANCHOR_X = 0.705;
export const OBSTACLE_GROUND_SINK = 7;

// Nền: backdrops/chapter1/{sky,foreground}.png (ảnh tile ngang được).
// 2 lớp chồng theo đúng kỹ thuật parallax chuẩn: `sky` (trời + vật xa, ảnh
// đặc/opaque, vẽ trước) rồi `foreground` (đất/cây/nhà, PNG nền TRONG SUỐT,
// vẽ đè lên sau) — phần trong suốt của foreground tự để lộ sky bên dưới,
// nên không cần canh đúng 1 đường cắt ngang giữa 2 ảnh như cách cũ.
// Thiếu ảnh nào thì layer đó tự vẽ fallback thay thế — không lỗi, không seam.
export const BACKDROP_ROOT = '/static/assets/images/backdrops/chapter1/';
export const BACKDROP_LAYERS = [
  { key: 'sky', file: 'sky.png', y: -70, height: VIEW_H, speed: 0.3, fallbackColor: '#8bc9dc' },
  { key: 'foreground', file: 'foreground.png', y: 0, height: VIEW_H, speed: 0.7, fallbackColor: '#795238', fallbackBandHeight: VIEW_H - GROUND_Y }
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
  { file: 'finish-gate.png', worldX: 15150, height: 200, sink: 14 }
];

// Dốc/địa hình đặc biệt (nếu cần) khai báo tại đây thay vì gắn cứng theo
// số chunk như trước. Rỗng = mặt đất phẳng theo GROUND_Y trên toàn bộ level.
export const TERRAIN_RAMPS = [];

export const OBSTACLE_ROOT = '/static/assets/images/mapchunk_1/';
export const OBSTACLE_FILE_NAMES = ['contains obstacles.png'];

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
  stoneBlock: 'stone_block.png'
};

// Vật phẩm (item icon) lấy từ frontend/static/assets/images/items.
export const ITEM_ROOT = '/static/assets/images/items/';
export const ITEM_FILES = {
  book: 'book.png',
  heart: 'heart.png'
};

// Nhân vật chính: thư mục riêng cho Trưng Trắc — khi thiếu GIF, engine tự
// fallback sang hình vẽ canvas (xem render.js/drawPlayer).
export const PLAYER_ROOT_CANDIDATES = ['/static/assets/images/characters/trung-trac/'];

export const PLAYER_ANIMATION_FILES = {
  idle: 'stance.gif',
  run: 'run.gif',
  jump: 'jump.gif',
  dash: 'dash.gif'
};

// Chỉ còn dùng atlas cho enemy (obstacle giờ dùng ảnh riêng, xem OBSTACLE_SPRITE_FILES).
export const atlas = {
  hanGuards: { col: 3, row: 3 }
};
