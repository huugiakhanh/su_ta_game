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
export const PLAYER_FRAME_SIZE = 96;
export const PLAYER_JUMP_SCALE = 1.25;
export const OBSTACLE_GROUND_SINK = 7;

// Nền: backdrops/chapter1/{sky,foreground}.png (ảnh tile ngang được).
// 2 lớp chồng theo đúng kỹ thuật parallax chuẩn: `sky` (trời + vật xa, ảnh
// đặc/opaque, vẽ trước) rồi `foreground` (đất/cây/nhà, PNG nền TRONG SUỐT,
// vẽ đè lên sau) — phần trong suốt của foreground tự để lộ sky bên dưới,
// nên không cần canh đúng 1 đường cắt ngang giữa 2 ảnh như cách cũ.
// Thiếu ảnh nào thì layer đó tự vẽ fallback thay thế — không lỗi, không seam.
export const BACKDROP_ROOT = '/static/assets/images/backdrops/chapter1/';
export const BACKDROP_LAYERS = [
  { key: 'sky', file: 'sky.png', y: 0, height: VIEW_H, speed: 0.3, fallbackColor: '#8bc9dc' },
  { key: 'foreground', file: 'foreground.png', y: 0, height: VIEW_H, speed: 0.7, fallbackColor: '#795238', fallbackBandHeight: VIEW_H - GROUND_Y }
];

// Set-piece cốt truyện (cổng làng, cầu, cổng thành...) đặt theo toạ độ world-X
// riêng lẻ, vẽ đè lên layer nền. Rỗng ở bản nền tảng này — thêm entry
// { file, worldX, y, w, h } khi có ảnh landmark cho từng phần cốt truyện.
export const LANDMARKS = [];

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
