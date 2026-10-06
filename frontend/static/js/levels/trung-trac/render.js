// Toàn bộ vẽ canvas: nền parallax, mặt đất, cổng đích, obstacle, item, enemy, nhân vật, HUD in-canvas.

import { images } from './assets.js';
import { state, bossAlive, enemyArtKey } from './state.js';
import { debug } from './input.js';
import { getAnimMeta, frameIndex } from './animation.js';
import { groundYAt, terrainLevelAt } from './geometry.js';
import {
  LOGICAL_W, LOGICAL_H, MAX_VIEW_W, VIEW_W, VIEW_H, setViewWidth, LEVEL, GROUND_Y, TERRAIN_CELL,
  OBSTACLE_TYPES, BOOK_SPRITE_ID, BOOK_FPS, BOOK_BOB_AMPLITUDE, ZONE_BLEND_WIDTH, SKY_PARALLAX, FAR_HILLS, MID_PARALLAX, NPC_SPRITES,
  SKY_FALLBACK_COLOR, GROUND_FALLBACK_COLOR, GROUND_DECOR_DENSITY, GROUND_TILE_REGION,
  HAZARD_SPRITES, ENEMY_SPRITES, PROJECTILE_SPRITES,
  PROJECTILE_MAX_RANGE, PROJECTILE_FADE_RANGE,
  PLAYER_SPRITE_ID, PLAYER_ANIMATIONS, PLAYER_JUMP_APEX_VY,
  ATTACK_COOLDOWN, SKILLS, ARROW_RAIN_SPRITE, BOSS_TD, VICTORY_FLAG_ID, VICTORY_FLAG_ATTACH, WALL_ARROWS,
  QUIZ_STELE_ID
} from './config.js';

export const canvas = document.getElementById('gameCanvas');
export const ctx = canvas.getContext('2d');

// Canvas luôn ở độ phân giải LOGIC (VIEW_W x VIEW_H); fitCanvas() chọn VIEW_W
// theo tỉ lệ cửa sổ và cỡ HIỂN THỊ (CSS).
canvas.width = VIEW_W;
canvas.height = VIEW_H;
ctx.imageSmoothingEnabled = false;

// Tên animation + ô đang vẽ của từng entity trong frame hiện tại — chỉ để lớp
// debug F2 in ra, không ảnh hưởng gameplay.
const debugLabels = new Map();

// Độ phân giải bộ đệm hiện tại: canvas thật = LOGICAL x backingScale pixel, mọi
// lệnh vẽ vẫn dùng toạ độ LOGIC nhờ setTransform.
let backingScale = 0;

// Phóng canvas logic PHỦ KÍN vùng trống (scale lẻ được phép — quyết định của
// team 25/09 thay cho letterbox bội số nguyên). Chiều cao logic cố định 270:
// scale lấy theo chiều cao còn trống, rồi chiều RỘNG logic (VIEW_W) giãn cho
// canvas phủ hết chiều ngang (team 26/09), kẹp trong [LOGICAL_W, MAX_VIEW_W].
// Cửa sổ hẹp hơn 16:9 -> VIEW_W = 480 và scale theo chiều ngang như cũ; rộng
// hơn MAX_VIEW_W -> có viền hai bên.
// Để pixel vẫn đều khi scale lẻ: vẽ vào bộ đệm ở bội số NGUYÊN N = ceil(scale
// x DPR) bằng nearest-neighbor (mỗi pixel logic = N x N pixel thật), rồi để
// trình duyệt thu nhẹ bộ đệm về cỡ hiển thị bằng nội suy mượt. Khi cỡ hiển thị
// trùng đúng N pixel thiết bị (scale nguyên) thì dùng `pixelated` cho sắc nét.
export function fitCanvas() {
  // Tab/khung đang ẩn (cỡ 0) thì bỏ qua — sự kiện resize sau đó sẽ tính lại.
  if (!window.innerWidth || !window.innerHeight) return null;
  const shell = document.querySelector('.game-shell');
  const blockH = selector => {
    const node = document.querySelector(selector);
    return node && getComputedStyle(node).display !== 'none' ? node.offsetHeight : 0;
  };
  const shellStyle = getComputedStyle(shell);
  const padX = parseFloat(shellStyle.paddingLeft) + parseFloat(shellStyle.paddingRight);
  const padY = parseFloat(shellStyle.paddingTop) + parseFloat(shellStyle.paddingBottom);
  const border = 4; // viền 2px hai bên của .stage-wrap
  const availW = Math.max(1, document.documentElement.clientWidth - padX - border);
  const availH = Math.max(1, window.innerHeight - padY - border
    - blockH('.hud') - blockH('.help'));
  const fitHeight = availH / LOGICAL_H;
  // ceil: canvas rộng ĐÚNG availW (scale giảm < 1 pixel logic so với fitHeight).
  const viewW = Math.min(MAX_VIEW_W, Math.max(LOGICAL_W, Math.ceil(availW / fitHeight - 1e-6)));
  const scale = Math.min(availW / viewW, fitHeight);
  const dpr = window.devicePixelRatio || 1;
  const deviceScale = scale * dpr;
  const nextBacking = Math.max(1, Math.ceil(deviceScale - 1e-3));
  if (nextBacking !== backingScale || viewW !== VIEW_W) {
    backingScale = nextBacking;
    setViewWidth(viewW);
    // Đổi width/height xoá luôn trạng thái context -> đặt lại transform + smoothing.
    canvas.width = VIEW_W * backingScale;
    canvas.height = VIEW_H * backingScale;
    ctx.setTransform(backingScale, 0, 0, backingScale, 0, 0);
    ctx.imageSmoothingEnabled = false;
  }
  canvas.style.imageRendering = Math.abs(deviceScale - backingScale) < 1e-3 ? 'pixelated' : 'auto';
  // Làm tròn XUỐNG: lố dù nửa pixel là trang cao hơn cửa sổ -> hiện thanh
  // cuộn dọc -> mất ~15px chiều ngang và canvas tràn khung.
  shell.style.setProperty('--stage-w', `${Math.floor(VIEW_W * scale)}px`);
  shell.style.setProperty('--stage-h', `${Math.floor(VIEW_H * scale)}px`);
  return scale;
}

// ---- Nền (TT-MAP-01, bộ 32-bit TT-HIBIT-03): trời -> đồi xa -> lớp giữa -> tile mặt đất ----
// Mọi lớp vẽ theo cỡ LOGIC (mapWidth/mapHeight), toạ độ nguyên.

function mod(value, size) {
  return ((value % size) + size) % size;
}

// Ảnh môi trường mang `image.density` (assets.js; bộ 32-bit = 4). Cỡ LOGIC của
// ảnh — dùng thay image.width/height (không gọi thẳng với ảnh map).
const mapDensity = image => image.density || 1;
const mapWidth = image => image.width / mapDensity(image);
const mapHeight = image => image.height / mapDensity(image);

// Vẽ 1 vùng ảnh môi trường: toạ độ nguồn (sx..sh) và đích là pixel LOGIC, nguồn
// nhân density khi lấy từ ảnh. Bộ đệm N < density (màn thấp) thì thu nhỏ có
// nội suy như drawSprite; còn lại nearest-neighbor.
function drawMapImage(target, image, sx, sy, sw, sh, dx, dy, dw = sw, dh = sh) {
  const density = mapDensity(image);
  if (density > 1 && backingScale < density) target.imageSmoothingEnabled = true;
  target.drawImage(image, sx * density, sy * density, sw * density, sh * density, dx, dy, dw, dh);
  target.imageSmoothingEnabled = false;
}

// Lặp ngang 1 ảnh theo chiều rộng LOGIC. Offset làm tròn về pixel nguyên TRƯỚC
// khi lấy modulo để lớp nền không rung dưới pixel khi camera lerp chậm.
function drawTiledLayer(target, image, parallax, y) {
  const width = mapWidth(image);
  const height = mapHeight(image);
  const offset = mod(Math.round(state.cameraX * parallax), width);
  for (let x = -offset; x < VIEW_W; x += width) drawMapImage(target, image, 0, 0, width, height, x, y);
}

// Vùng cảnh của màn đang chơi (LEVEL.zones — màn 1: 5 vùng, màn 2: 3 vùng).
function zoneIndexAt(x) {
  const zones = LEVEL.zones;
  const index = zones.findIndex(zone => x < zone.x1);
  return index < 0 ? zones.length - 1 : Math.max(0, index);
}

// Cảnh (trời hoặc lớp giữa, `key` = 'sky' | 'mid') theo tâm khung nhìn: trong
// ZONE_BLEND_WIDTH px ngay TRƯỚC ranh giới vùng kế tiếp thì hoà A -> B theo t.
function sceneryAt(key) {
  const ref = state.cameraX + VIEW_W / 2;
  const index = zoneIndexAt(ref);
  const current = LEVEL.zones[index][key];
  const next = LEVEL.zones[index + 1];
  if (!next || next[key] === current) return { from: current, to: null, t: 0 };
  const t = (ref - (next.x0 - ZONE_BLEND_WIDTH)) / ZONE_BLEND_WIDTH;
  return t > 0 ? { from: current, to: next[key], t: Math.min(1, t) } : { from: current, to: null, t: 0 };
}

function drawSky() {
  const { from, to, t } = sceneryAt('sky');
  const base = images.maps.layers[from];
  if (base) {
    drawTiledLayer(ctx, base, SKY_PARALLAX, 0);
  } else {
    ctx.fillStyle = SKY_FALLBACK_COLOR;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }
  // Trời là ảnh ĐỤC nên vẽ đè ảnh mới với alpha t là đủ để hoà.
  const next = to && images.maps.layers[to];
  if (next) {
    ctx.globalAlpha = t;
    drawTiledLayer(ctx, next, SKY_PARALLAX, 0);
    ctx.globalAlpha = 1;
  }
}

// Đồi xa tắt dần dưới các ảnh trời trong FAR_HILLS.hiddenUnderSky (trời giông),
// theo đúng hệ số hoà của trời nên cả hai đổi cùng nhịp.
function drawFarHills() {
  const image = images.maps.layers[FAR_HILLS.id];
  if (!image) return;
  const { from, to, t } = sceneryAt('sky');
  const hidden = id => FAR_HILLS.hiddenUnderSky.includes(id);
  const alpha = to ? (hidden(from) ? 0 : 1) * (1 - t) + (hidden(to) ? 0 : 1) * t : (hidden(from) ? 0 : 1);
  if (alpha <= 0) return;
  ctx.globalAlpha = alpha;
  drawTiledLayer(ctx, image, FAR_HILLS.parallax, FAR_HILLS.bottomY - mapHeight(image));
  ctx.globalAlpha = 1;
}

// Canvas phụ để hoà 2 lớp giữa: cả hai PNG đều có alpha nên vẽ chồng bằng
// globalAlpha sẽ làm chỗ hai ảnh cùng đục bị mờ (t = .5 chỉ phủ 75%). Cộng
// 'lighter' A x (1 - t) + B x t trên nền trong suốt cho nội suy tuyến tính
// đúng cả màu lẫn độ phủ, rồi vẽ kết quả x1 lên canvas chính.
// Canvas phụ ở độ phân giải BỘ ĐỆM (logic x backingScale, transform như canvas
// chính) để không mất chi tiết lớp giữa bộ 32-bit.
let blendCanvas = null;
function blendContext(width, height) {
  if (!blendCanvas) blendCanvas = document.createElement('canvas');
  const w = width * backingScale;
  const h = height * backingScale;
  if (blendCanvas.width !== w || blendCanvas.height !== h) {
    blendCanvas.width = w;
    blendCanvas.height = h;
  }
  const blend = blendCanvas.getContext('2d');
  blend.setTransform(backingScale, 0, 0, backingScale, 0, 0);
  blend.imageSmoothingEnabled = false;
  return blend;
}

function drawMidground() {
  const { from, to, t } = sceneryAt('mid');
  const a = images.maps.layers[from];
  const b = to ? images.maps.layers[to] : null;
  if (!a && !b) return;
  const height = mapHeight(a || b);
  const top = GROUND_Y - height;
  if (!b || !a) {
    // Không hoà (hoặc thiếu 1 ảnh): vẽ thẳng ảnh đang có.
    if (!b) drawTiledLayer(ctx, a, MID_PARALLAX, top);
    else drawTiledLayer(ctx, b, MID_PARALLAX, top);
    return;
  }
  const blend = blendContext(VIEW_W, height);
  blend.globalCompositeOperation = 'source-over';
  blend.clearRect(0, 0, VIEW_W, height);
  blend.globalCompositeOperation = 'lighter';
  blend.globalAlpha = 1 - t;
  drawTiledLayer(blend, a, MID_PARALLAX, 0);
  blend.globalAlpha = t;
  drawTiledLayer(blend, b, MID_PARALLAX, 0);
  blend.globalAlpha = 1;
  blend.globalCompositeOperation = 'source-over';
  ctx.drawImage(blendCanvas, 0, top, VIEW_W, height);
}

function drawBackdrops() {
  drawSky();
  drawFarHills();
  drawMidground();
}

// Hash số nguyên tất định theo chỉ số cột tile (không random, không đổi khi
// chơi lại) — chọn biến thể surface/fill và vị trí decor.
function tileHash(column) {
  let h = Math.imul(column ^ 0x27d4eb2d, 0x9e3779b1);
  h ^= h >>> 15;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

function pick(list, value) {
  return list && list.length ? list[value % list.length] : null;
}

// Trừ các khoảng [a, b) bị loại khỏi đoạn [x0, x1) — trả về các đoạn còn lại.
function subtractIntervals(x0, x1, excluded) {
  let segments = [[x0, x1]];
  excluded.forEach(([a, b]) => {
    segments = segments.flatMap(([s, e]) => {
      if (b <= s || a >= e) return [[s, e]];
      const parts = [];
      if (a > s) parts.push([s, a]);
      if (b < e) parts.push([b, e]);
      return parts;
    });
  });
  return segments;
}

// Vẽ 1 tile (rect trong sheet) ở cột world `columnX`, chỉ phần nằm trong các
// đoạn `segments` (world X) — dùng để cắt tile tại mép hố.
function drawTileSegments(image, rect, columnX, screenY, segments, camera) {
  segments.forEach(([s, e]) => {
    const sx = s - columnX;
    const w = e - s;
    drawMapImage(ctx, image, rect.x + sx, rect.y, w, rect.h, s - camera, screenY);
  });
}

// Mặt đất dùng CHUNG 1 bộ tile cho mọi vùng/màn (GROUND_TILE_REGION) và chỉ
// tile ĐẦU TIÊN của mỗi vai trò — không đổi biến thể theo cột, không đổi theo
// vùng (team 30/09). Decor vẫn rải tất định theo cột (tileHash).
function groundRegion(tileset) {
  return tileset.regions[GROUND_TILE_REGION] || null;
}

function groundTile(region, role) {
  return region?.[role]?.[0] || null;
}

// Tile surface + fill của 1 cột (hash chỉ còn dùng cho decor).
function columnTiles(region, column) {
  return { hash: tileHash(column), surface: groundTile(region, 'surface'), fill: groundTile(region, 'fill') };
}

// Decor 16x8 thưa (GROUND_DECOR_DENSITY) trên mép cỏ, đáy = `topY`, không va chạm.
function drawGroundDecor(image, region, hash, columnX, topY, camera) {
  if (((hash >>> 16) & 0xff) >= 256 * GROUND_DECOR_DENSITY) return;
  const decor = pick(region.decoration, hash >>> 24);
  if (decor) drawMapImage(ctx, image, decor.x, decor.y, decor.w, decor.h, columnX - camera, topY - decor.h);
}

// ---- Ghép tile địa hình tự động (bộ TILESET_TT_TERRAIN, TT-TERRAIN-01) ----
// Đỉnh cột đất (y) theo địa hình; cột hố = Infinity (như vực sâu vô tận —
// cột đất cạnh hố lộ sườn tới đáy khung). Hố đọc từ state.holes nên hố khai
// báo tay (layout thử `?layout=p2`) cũng ghép đúng.
function columnTop(column) {
  const center = column * TERRAIN_CELL + TERRAIN_CELL / 2;
  if ((state.holes || []).some(hole => center > hole.x && center < hole.x + hole.w)) return Infinity;
  return groundYAt(column * TERRAIN_CELL);
}

// Vai trò tile của ô (cột `column`, hàng có mép trên `y`) — chỉ theo đỉnh cột
// này và 2 cột bên cạnh:
//   hàng đỉnh: surface | corner-left/right (bên đó thấp hơn) | corner-single (cả 2 bên thấp hơn)
//   thân, cao hơn cột bên cạnh: wall-left/right | wall-single
//   thân, ngang đỉnh cột bên cạnh thấp hơn: inner-left/right (cỏ bên đó vắt vào góc)
//   còn lại: fill
// Trả null nếu ô không có đất. Thân vừa lộ sườn 1 bên vừa ngang đỉnh bên kia
// thì ưu tiên sườn (không có tile ghép 2 kiểu).
export function terrainTileRole(column, y) {
  const top = columnTop(column);
  if (top === Infinity || y < top) return null;
  const leftTop = columnTop(column - 1);
  const rightTop = columnTop(column + 1);
  const openLeft = y < leftTop;
  const openRight = y < rightTop;
  if (y === top) {
    if (openLeft && openRight) return 'corner-single';
    if (openLeft) return 'corner-left';
    return openRight ? 'corner-right' : 'surface';
  }
  if (openLeft && openRight) return 'wall-single';
  if (openLeft) return 'wall-left';
  if (openRight) return 'wall-right';
  const innerLeft = y === leftTop && leftTop > top;
  const innerRight = y === rightTop && rightTop > top;
  if (innerLeft !== innerRight) return innerLeft ? 'inner-left' : 'inner-right';
  return 'fill';
}

// Sheet thiếu vai trò nào thì lùi về vai trò gần nhất.
const TERRAIN_ROLE_FALLBACK = {
  'corner-single': 'corner-left', 'corner-left': 'surface', 'corner-right': 'surface',
  'wall-single': 'wall-left', 'wall-left': 'fill', 'wall-right': 'fill',
  'inner-left': 'fill', 'inner-right': 'fill'
};

function terrainRect(sheet, role) {
  let current = role;
  while (current && !sheet.roles[current]) current = TERRAIN_ROLE_FALLBACK[current];
  return current ? sheet.roles[current] : null;
}

// Vẽ mặt đất bằng bộ tile ghép địa hình: mỗi cột từ đỉnh xuống đáy khung,
// vai trò từng ô theo terrainTileRole. Decor (cỏ, lau) lấy từ tileset cũ, chỉ
// rải trên ô `surface`.
function drawGroundAutotile(sheet, first, last, camera) {
  const decorRegion = images.maps.tileset ? groundRegion(images.maps.tileset) : null;
  for (let column = first; column <= last; column++) {
    const top = columnTop(column);
    if (top === Infinity) continue;
    const x = column * TERRAIN_CELL - camera;
    for (let y = top; y < VIEW_H; y += TERRAIN_CELL) {
      const rect = terrainRect(sheet, terrainTileRole(column, y));
      if (rect) drawMapImage(ctx, sheet.image, rect.x, rect.y, rect.w, rect.h, x, y);
    }
    if (decorRegion && terrainTileRole(column, top) === 'surface') {
      drawGroundDecor(images.maps.tileset.image, decorRegion, tileHash(column), column * TERRAIN_CELL, top, camera);
    }
  }
}

// F2: tên tắt vai trò tile từng ô (soát ghép địa hình — chạy cả khi chưa có
// bộ tile mới).
const TERRAIN_ROLE_LABELS = {
  surface: 'S', fill: '', 'corner-left': 'CL', 'corner-right': 'CR', 'corner-single': 'C1',
  'wall-left': 'WL', 'wall-right': 'WR', 'wall-single': 'W1', 'inner-left': 'IL', 'inner-right': 'IR'
};

function drawTerrainDebug() {
  const camera = Math.round(state.cameraX);
  ctx.save();
  ctx.font = '5px monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  const first = Math.floor(camera / TERRAIN_CELL);
  const last = Math.floor((camera + VIEW_W - 1) / TERRAIN_CELL);
  for (let column = first; column <= last; column++) {
    const top = columnTop(column);
    for (let y = Math.min(top, GROUND_Y); y < VIEW_H; y += TERRAIN_CELL) {
      const label = TERRAIN_ROLE_LABELS[terrainTileRole(column, y)];
      if (label) ctx.fillText(label, column * TERRAIN_CELL - camera + TERRAIN_CELL / 2, y + 9);
    }
  }
  ctx.restore();
}

// 1 cột bậc đất cao `level` ô bằng tile Z1 cũ (xem drawGround): đỉnh
// `surface`, thân `fill`, sườn lộ ra phủ dải bóng tạm.
function drawRaisedColumn(image, region, column, level, camera) {
  const columnX = column * TERRAIN_CELL;
  const top = GROUND_Y - level * TERRAIN_CELL;
  const { hash, surface, fill } = columnTiles(region, column);
  // Đỉnh cột bên cạnh: sườn chỉ lộ ra ở phần cao hơn cột đó.
  const neighborTop = { left: groundYAt(columnX - 1), right: groundYAt(columnX + TERRAIN_CELL) };
  const openLeft = neighborTop.left > top;
  const openRight = neighborTop.right > top;
  const x = columnX - camera;
  if (surface) drawMapImage(ctx, image, surface.x, surface.y, surface.w, surface.h, x, top);
  for (let y = top + TERRAIN_CELL; y < VIEW_H; y += TERRAIN_CELL) {
    if (fill) drawMapImage(ctx, image, fill.x, fill.y, fill.w, fill.h, x, y);
  }
  // Dải bóng dọc phần sườn lộ ra (sáng từ trên-trái như lòng hố).
  [['left', openLeft], ['right', openRight]].forEach(([name, open]) => {
    if (!open) return;
    const [width, alpha] = TERRAIN_SIDE_SHADE[name];
    ctx.fillStyle = `rgba(10, 6, 4, ${alpha})`;
    ctx.fillRect(name === 'left' ? x : x + TERRAIN_CELL - width, top + 3, width, neighborTop[name] - top - 3);
  });
  if (!openLeft && !openRight) drawGroundDecor(image, region, hash, columnX, top, camera);
}

// Mặt đất lát tileset (1 bộ tile chung — groundRegion): hàng `surface` top =
// GROUND_Y, hàng `fill` ngay dưới (bị cắt ở đáy khung), decor 16x8 thưa trên
// mép cỏ. Cột tile căn theo lưới world 16px. Chỉ vẽ các cột trong viewport.
// Hố: không vẽ tile trong hố; tile `left-edge`/`right-edge` (nửa đặc, nửa
// trong suốt) đặt sao cho phần đất kết thúc ĐÚNG mép hố (khớp pointHasGround)
// — quyết định team G6.
// Bậc đất (TT-TERRAIN-01): bộ tile ghép địa hình TILESET_TT_TERRAIN (IN_GAME)
// -> ghép tự động (drawGroundAutotile). Phần tile Z1 bên dưới chỉ là dự phòng
// khi không nạp được bộ đó: cột bậc vẽ bằng surface/fill + dải bóng
// (drawRaisedColumn), hố dùng tile mép nửa ô như trên.
const TERRAIN_SIDE_SHADE = { left: [2, .18], right: [3, .32] };

function drawGround() {
  const tileset = images.maps.tileset;
  const camera = Math.round(state.cameraX);
  const holes = state.holes || [];
  const first = Math.floor(camera / TERRAIN_CELL);
  const last = Math.floor((camera + VIEW_W - 1) / TERRAIN_CELL);
  if (!tileset) {
    ctx.fillStyle = GROUND_FALLBACK_COLOR;
    for (let column = first; column <= last; column++) {
      const top = groundYAt(column * TERRAIN_CELL);
      ctx.fillRect(column * TERRAIN_CELL - camera, top, TERRAIN_CELL, VIEW_H - top);
    }
    return;
  }
  // Có bộ tile ghép địa hình (TILESET_TT_TERRAIN) -> ghép tự động; phần dưới
  // là cách vẽ bằng tile Z1 cũ, chỉ dùng khi chưa có bộ mới.
  if (images.maps.terrain) {
    drawGroundAutotile(images.maps.terrain, first, last, camera);
    return;
  }
  const { image, tileW, tileH } = tileset;
  const region = groundRegion(tileset);
  if (!region) return;
  const half = tileW / 2;
  const surfaceGaps = holes.map(hole => [hole.x - half, hole.x + hole.w + half]);
  const fillGaps = holes.map(hole => [hole.x, hole.x + hole.w]);

  for (let column = first; column <= last; column++) {
    const columnX = column * tileW;
    const level = terrainLevelAt(columnX);
    if (level >= 1) {
      drawRaisedColumn(image, region, column, level, camera);
      continue;
    }
    const { hash, surface, fill } = columnTiles(region, column);
    const surfaceSegments = subtractIntervals(columnX, columnX + tileW, surfaceGaps);
    if (surface) drawTileSegments(image, surface, columnX, GROUND_Y, surfaceSegments, camera);
    if (fill) drawTileSegments(image, fill, columnX, GROUND_Y + tileH, subtractIntervals(columnX, columnX + tileW, fillGaps), camera);
    // Decor chỉ trên cột đất nguyên vẹn, đáy decor = GROUND_Y, không va chạm.
    const intact = surfaceSegments.length === 1 && surfaceSegments[0][1] - surfaceSegments[0][0] === tileW;
    if (intact) drawGroundDecor(image, region, hash, columnX, GROUND_Y, camera);
  }

  holes.forEach(hole => {
    const edges = [
      ['left-edge', hole.x - half],
      ['right-edge', hole.x + hole.w - half]
    ];
    edges.forEach(([role, x]) => {
      if (x + tileW < camera || x > camera + VIEW_W) return;
      const rect = groundTile(region, role);
      if (rect) drawMapImage(ctx, image, rect.x, rect.y, rect.w, rect.h, Math.round(x - camera), GROUND_Y);
    });
  });
}

// Điều kiện thắng về NỘI DUNG đã đủ (mini-boss đã hạ + nhặt hết sách) — cổng
// mở trước khi người chơi chạm finishX; trigger về đích vẫn ở physics.js.
function finishGateOpen() {
  // Đấu trường (màn 3): cổng đóng suốt trận, chỉ mở trong cutscene kết chương.
  if (LEVEL.arena) return state.gateOpen;
  return !bossAlive() && state.booksCollected >= state.books.length;
}

// Cổng thành Luy Lâu: x1, pivot bottom-center (maps_tt.json), đáy ở GROUND_Y.
// Màn không có cổng (LEVEL.gate = null — màn 2) thì bỏ qua.
function drawFinishGate(time = 0) {
  const gate = LEVEL.gate;
  if (!gate) return;
  const prop = images.maps.props[finishGateOpen() ? gate.open : gate.closed]
    || images.maps.props[gate.closed];
  const w = prop ? mapWidth(prop.image) : 131;
  const h = prop ? mapHeight(prop.image) : 150;
  const pivot = prop?.asset.pivot || { x: w / 2, y: h };
  const left = Math.round(gate.worldX - pivot.x - state.cameraX);
  if (left + w < -48 || left > VIEW_W + 48) return;
  const top = GROUND_Y - pivot.y;
  if (prop) drawMapImage(ctx, prop.image, 0, 0, w, h, left, top);
  else drawLandmarkFallback(left, top, w, h);
  if (LEVEL.arena && state.gateOpen) drawVictoryFlag(prop, left, top, time);
}

// Cờ chiến thắng (cutscene màn 3): pivot bottom-left đặt tại VICTORY_FLAG_ATTACH
// (giữa mái cổng; null thì dùng flag_attach của cổng mở), strip lặp theo fps
// maps_tt.json. Thiếu ảnh/điểm gắn -> bỏ (TODO_MISSING).
function drawVictoryFlag(gateProp, gateLeft, gateTop, time) {
  const flag = images.maps.props[VICTORY_FLAG_ID];
  const attach = VICTORY_FLAG_ATTACH || gateProp?.asset.flag_attach;
  if (!flag || !attach) return;
  const { frame_w: fw, frame_h: fh, frames = 1, fps = 6, pivot = { x: 0, y: fh } } = flag.asset;
  const frame = Math.floor(time * fps) % frames;
  drawMapImage(ctx, flag.image, frame * fw, 0, fw, fh, gateLeft + attach.x - pivot.x, gateTop + attach.y - pivot.y);
}

// Bia đá đánh dấu mốc câu hỏi (TT-QUIZ-01): x1, pivot bottom-center tại
// `quiz.x`, đáy ở GROUND_Y. Chưa hỏi -> strip `active` lặp theo fps
// maps_tt.json; đã hỏi (`quiz.done`) -> ảnh `done`. Thiếu ảnh thì bỏ.
function drawQuizSteles(time) {
  const stele = images.maps.props[QUIZ_STELE_ID];
  if (!stele) return;
  const { frame_w: fw, frame_h: fh, frames = 1, fps = 6, pivot = { x: fw / 2, y: fh } } = stele.asset;
  state.quizzes.forEach(quiz => {
    const left = Math.round(quiz.x - pivot.x - state.cameraX);
    if (left + fw < 0 || left > VIEW_W) return;
    const top = (quiz.footY ?? GROUND_Y) - pivot.y;
    const done = quiz.done && stele.states.done;
    const image = done ? stele.states.done : (stele.states.active || stele.image);
    const frame = done ? 0 : Math.floor(time * fps) % frames;
    drawMapImage(ctx, image, frame * fw, 0, fw, fh, left, top);
  });
}

// Cổng gỗ tạm (2 cột + xà ngang + cờ nhỏ) — chỉ dùng khi thiếu ảnh cổng.
function drawLandmarkFallback(left, top, w, h) {
  const x = Math.round(left);
  const y = Math.round(top);
  const postW = Math.max(5, Math.round(w * 0.09));
  ctx.fillStyle = '#5a3a22';
  ctx.fillRect(x, y, postW, h);
  ctx.fillRect(Math.round(x + w - postW), y, postW, h);
  ctx.fillStyle = '#7a4f2c';
  ctx.fillRect(x - 2, y, Math.round(w) + 5, 11);
  ctx.fillStyle = '#b23325';
  ctx.beginPath();
  ctx.moveTo(x + w - postW, y + 11);
  ctx.lineTo(x + w - postW + 18, y + 16);
  ctx.lineTo(x + w - postW, y + 22);
  ctx.closePath();
  ctx.fill();
}

// Lòng hố (state.holes). Bộ tile chung có vai trò `pit-top` (hàng 248–264) +
// `pit-deep` (hàng dưới, còn thấy 6px) thì vẽ tile đó. Thiếu tile thì dự phòng
// bằng tile `fill` (đất) phủ các dải tối dần theo bậc (không gradient
// mịn), vách trái trong bóng + bóng dưới mép cỏ. Vẽ sau drawGround, trước vật cản
// (cầu đè lên hố).
const PIT_SHADE_BANDS = [[0, 4, .35], [4, 10, .55], [10, 16, .72], [16, 22, .88]];
const PIT_WALL = 3;
// Hố trống (bộ tile ghép địa hình): [y0, y1, alpha] tính từ GROUND_Y — trên
// còn thấy nền, xuống đáy tối dần (DESIGN_BASELINE).
const HOLE_DEPTH_BANDS = [[0, 6, .15], [6, 12, .35], [12, 17, .55], [17, 22, .75]];

function drawHoles() {
  const tileset = images.maps.tileset;
  const camera = Math.round(state.cameraX);
  state.holes.forEach(hole => {
    const left = Math.round(hole.x) - camera;
    const width = Math.round(hole.w);
    if (left + width < -24 || left > VIEW_W + 24) return;
    const depth = VIEW_H - GROUND_Y;
    if (!tileset) {
      ctx.fillStyle = '#120a06';
      ctx.fillRect(left, GROUND_Y, width, depth);
      return;
    }
    // Có bộ tile ghép địa hình: hố để TRỐNG (thấy nền phía sau) — 2 mép hố đã
    // là vách đất (corner/wall), không lát tile lòng hố (người dùng 30/09:
    // tile lòng hố khác màu nhìn không ra hố). pit-top/pit-deep không dùng.
    // Chỉ phủ lớp tối mờ tăng dần xuống đáy (theo bậc, không gradient mịn)
    // cho có chiều sâu.
    const sheet = images.maps.terrain;
    if (sheet) return;
    const { tileW, tileH } = tileset;
    const image = sheet ? sheet.image : tileset.image;
    const region = sheet ? sheet.roles : groundRegion(tileset);
    if (!region) return;
    const tile = role => (sheet ? sheet.roles[role] || null : groundTile(region, role));
    const top = tile('pit-top');
    const deep = tile('pit-deep');
    const fill = tile('fill');
    let pitTiles = false;
    for (let columnX = Math.floor(hole.x / tileW) * tileW; columnX < hole.x + hole.w; columnX += tileW) {
      const segments = [[Math.max(columnX, hole.x), Math.min(columnX + tileW, hole.x + hole.w)]];
      if (top && deep) {
        pitTiles = true;
        drawTileSegments(image, top, columnX, GROUND_Y, segments, camera);
        drawTileSegments(image, deep, columnX, GROUND_Y + tileH, segments, camera);
      } else {
        if (fill) {
          drawTileSegments(image, fill, columnX, GROUND_Y, segments, camera);
          drawTileSegments(image, fill, columnX, GROUND_Y + tileH, segments, camera);
        }
      }
    }
    if (pitTiles) return;
    // Tạm: tối dần theo bậc, vách trái trong bóng (sáng từ trên-trái), bóng
    // 2px dưới mép cỏ.
    PIT_SHADE_BANDS.forEach(([y0, y1, alpha]) => {
      ctx.fillStyle = `rgba(10, 6, 4, ${alpha})`;
      ctx.fillRect(left, GROUND_Y + y0, width, Math.min(y1, depth) - y0);
    });
    ctx.fillStyle = 'rgba(10, 6, 4, .45)';
    ctx.fillRect(left, GROUND_Y, PIT_WALL, depth);
    ctx.fillRect(left, GROUND_Y, width, 2);
  });
}

// Hướng cần quay (-1 trái / 1 phải) cho sprite (ảnh gốc quay PHẢI):
// vật có hướng chạy riêng (`facing` của roller, giữ nguyên cả khi đang chết)
// quay theo hướng đó; lính/boss quay về phía người chơi; còn lại (bẫy, tháp)
// giữ hướng gốc.
function facingDirection(centerX, fixedFacing = 0, watchesPlayer = false) {
  if (fixedFacing) return fixedFacing;
  if (!watchesPlayer) return 1;
  const playerCenter = state.player.x + state.player.w / 2;
  return playerCenter > centerX ? 1 : -1;
}

// Strip `name` của sprite `assetId`. Asset đã tải xong mà màn không nạp
// (thiếu trong LEVEL_SPRITES của config.js — nạp theo màn, Phần D) thì cảnh báo
// 1 lần/asset để thêm vào danh sách; caller vẽ hộp tạm như khi thiếu ảnh.
const unloadedWarned = new Set();
function spriteImage(assetId, name) {
  const strips = images.sprites[assetId];
  if (!strips && images.loaded && assetId && !unloadedWarned.has(assetId)) {
    unloadedWarned.add(assetId);
    console.warn(`sprite ${assetId} chưa nạp ở màn ${LEVEL.id} — thêm vào LEVEL_SPRITES[${LEVEL.id}] (config.js)`);
  }
  return strips?.[name] || null;
}

// Vẽ ô hiện tại của entity có `anim = { name, time }` (đồng hồ riêng, tick ở
// physics.js). `anims` ánh xạ tên trạng thái -> animation manifest; `durations`
// ép thời lượng (vd. throw .85s). Trả về { label, top } hoặc null nếu thiếu
// manifest/ảnh (caller tự vẽ placeholder).
function drawAnimated(assetId, anims, durations, entity, pivotX, footY, facing, alpha = 1) {
  const key = entity.anim?.name;
  const name = anims[key] || anims.idle || anims.move;
  const meta = name ? getAnimMeta(assetId, name) : null;
  const image = name ? spriteImage(assetId, name) : null;
  if (!meta || !image) return null;
  const frame = frameIndex(meta, entity.anim?.time || 0, durations?.[key] ?? null);
  drawSprite(image, meta, frame, pivotX, footY, facing, alpha);
  return { label: `${name} ${frame + 1}/${meta.frames}`, top: footY - (meta.frame_h - 1) };
}

// Hộp tạm theo hitbox khi thiếu sprite.
function drawPlaceholder(entity, alpha = 1) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#4a3020';
  ctx.fillRect(Math.round(entity.x - state.cameraX), Math.round(entity.y), Math.round(entity.w), Math.round(entity.h));
  ctx.globalAlpha = 1;
}

// Bình thư: strip ITEM_BINH_THU x1, tâm tại (book.x, book.y + bob), lặp
// BOOK_FPS; bob làm tròn về pixel nguyên. Không còn quầng sáng (G5).
function drawBooks(time) {
  const prop = images.maps.props[BOOK_SPRITE_ID];
  state.books.forEach((book, index) => {
    if (book.collected) return;
    const x = Math.round(book.x - state.cameraX);
    if (x < -36 || x > VIEW_W + 36) return;
    const y = Math.round(book.y) + Math.round(Math.sin(time * 4 + index) * BOOK_BOB_AMPLITUDE);
    if (!prop) {
      ctx.fillStyle = '#f4d05c';
      ctx.fillRect(x - 8, y - 8, 16, 16);
      return;
    }
    const { frame_w: fw = mapWidth(prop.image), frame_h: fh = mapHeight(prop.image), frames = 1 } = prop.asset;
    const frame = Math.floor(time * BOOK_FPS + index) % frames;
    drawMapImage(ctx, prop.image, frame * fw, 0, fw, fh, x - fw / 2, y - fh / 2);
  });
}

// Toạ độ world (trái, trên) để vẽ ảnh vật cản x1 sao cho PHẦN NHÌN THẤY trùng
// hitbox: có `visible_bbox` -> góc bbox trùng góc hitbox; không có -> đáy-giữa
// canvas trùng đáy-giữa hitbox, chìm thêm groundSink px.
export function obstacleDrawRect(obstacle, asset) {
  const bbox = asset.visible_bbox;
  if (bbox) return { x: obstacle.x - bbox.x, y: obstacle.y - bbox.y };
  return {
    x: Math.round(obstacle.x + obstacle.w / 2 - asset.w / 2),
    y: obstacle.y + obstacle.h + obstacle.groundSink - asset.h
  };
}

// Vật cản tĩnh: ảnh theo cỡ logic (không co giãn, không quầng — G5). Thiếu ảnh thì
// vẽ hộp tạm đúng hitbox.
function drawObstacles() {
  state.obstacles.forEach(obstacle => {
    if (!obstacle.active) return;
    const prop = images.maps.props[OBSTACLE_TYPES[obstacle.type]?.id];
    debugLabels.set(obstacle, obstacle.type);
    if (!prop) {
      if (obstacle.x - state.cameraX + obstacle.w < -48 || obstacle.x - state.cameraX > VIEW_W + 48) return;
      drawPlaceholder(obstacle);
      return;
    }
    const asset = prop.asset;
    // Asset nhiều ô trạng thái (cột đá: intact/cracked — `frame_states`): vẽ ô
    // theo obstacle.state, đáy-giữa ô trùng đáy-giữa hitbox. `alpha` = mờ dần
    // khi cột vỡ (Phase B).
    if (asset.frame_w && asset.frames > 1) {
      const frame = Math.max(0, asset.frame_states?.indexOf(obstacle.state) ?? 0);
      const left = Math.round(obstacle.x + obstacle.w / 2 - asset.frame_w / 2 - state.cameraX);
      if (left + asset.frame_w < -48 || left > VIEW_W + 48) return;
      const top = Math.round(obstacle.y + obstacle.h + obstacle.groundSink - asset.frame_h);
      ctx.globalAlpha = obstacle.alpha ?? 1;
      drawMapImage(ctx, prop.image, frame * asset.frame_w, 0, asset.frame_w, asset.frame_h, left, top);
      ctx.globalAlpha = 1;
      debugLabels.set(obstacle, `${obstacle.type} ${obstacle.state || ''}`);
      return;
    }
    const rect = obstacleDrawRect(obstacle, asset);
    const left = Math.round(rect.x - state.cameraX);
    const w = mapWidth(prop.image);
    if (left + w < -48 || left > VIEW_W + 48) return;
    drawMapImage(ctx, prop.image, 0, 0, w, mapHeight(prop.image), left, Math.round(rect.y));
  });
}

// Vật có trạng thái (sprite, pivot bottom-center = tâm ngang + chân
// hitbox). Chia làm 2 lượt vẽ theo `grounded`:
//   submerged (thuyền, grounded = false) vẽ TRƯỚC drawHoles() để thân thuyền
//     chìm dưới lớp tối của khe sông.
//   còn lại vẽ sau vật cản, trước enemy.
// Hazard đang chết (dying) vẫn vẽ để phát nốt death/break; xác xe nằm lại.
function drawHazards(time, submerged = false) {
  state.hazards.forEach(hazard => {
    if (!hazard.alive && !hazard.dying) return;
    if (hazard.grounded === submerged) return;
    // Roller chưa được kích hoạt thì chưa xuất hiện trên màn — nó đang "chờ"
    // ngoài tầm nhìn, vẽ ra sẽ thành vật đứng im giữa đường.
    if (hazard.kind === 'roller' && !hazard.active) return;
    const sprite = HAZARD_SPRITES[hazard.sprite];
    const centerX = hazard.x + hazard.w / 2;
    const pivotX = Math.round(centerX - state.cameraX);
    if (pivotX < -80 || pivotX > VIEW_W + 80) return;
    const footY = Math.round(hazard.baseY + (sprite?.sink || 0));
    const facing = facingDirection(centerX, hazard.facing, hazard.kind === 'thrower');
    const drawn = sprite && drawAnimated(sprite.id, sprite.anims, sprite.durations, hazard, pivotX, footY, facing);
    if (!drawn) {
      drawPlaceholder(hazard);
      debugLabels.set(hazard, `${hazard.sprite} (placeholder)`);
      return;
    }
    debugLabels.set(hazard, drawn.label);
    if (hazard.alive && hazard.maxHp > 0 && hazard.hp > 0) {
      const barW = hazard.w + 8;
      drawHealthBar(pivotX - barW / 2, drawn.top - 5, barW, hazard.hp / hazard.maxHp, hazard.boss ? '#e34c36' : '#e2ad45');
    }
  });
}

function drawProjectiles() {
  state.projectiles.forEach(projectile => {
    const art = PROJECTILE_SPRITES[projectile.sprite];
    const centerX = Math.round(projectile.x + projectile.w / 2 - state.cameraX);
    const centerY = Math.round(projectile.y + projectile.h / 2);
    if (centerX < -40 || centerX > VIEW_W + 40) return;
    // Đoạn cuối tầm bay mờ dần để đạn không biến mất đột ngột.
    const alpha = Math.max(0, Math.min(1, (PROJECTILE_MAX_RANGE - projectile.traveled) / PROJECTILE_FADE_RANGE));
    const meta = art ? getAnimMeta(art.id, art.anim) : null;
    const image = art ? spriteImage(art.id, art.anim) : null;
    if (!meta || !image) {
      drawPlaceholder(projectile, alpha);
      return;
    }
    // Strip đạn lặp theo tuổi của viên đạn (đồng hồ riêng); tâm ô vẽ trùng
    // tâm hitbox; ảnh gốc quay PHẢI nên bay sang trái thì lật.
    const frame = frameIndex(meta, projectile.age);
    const footY = centerY - Math.round(meta.frame_h / 2) + meta.frame_h - 1;
    drawSprite(image, meta, frame, centerX, footY, projectile.direction < 0 ? -1 : 1, alpha);
    debugLabels.set(projectile, `${art.anim} ${frame + 1}/${meta.frames}`);
  });
}

function drawHealthBar(x, y, width, ratio, color) {
  ctx.fillStyle = '#2b110d';
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(width), 4);
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x + 1), Math.round(y + 1), Math.round((width - 2) * ratio), 2);
}

// Lính canh / boss đứng yên (sprite, pivot = tâm ngang + chân hitbox).
// Boss không có animation `hurt` nên trúng đòn thì nháy mờ như bản cũ.
function drawEnemies() {
  state.enemies.forEach(enemy => {
    if (!enemy.alive && !enemy.dying) return;
    const art = ENEMY_SPRITES[enemyArtKey(enemy)];
    const centerX = enemy.x + enemy.w / 2;
    const pivotX = Math.round(centerX - state.cameraX);
    if (pivotX < -80 || pivotX > VIEW_W + 80) return;
    const footY = Math.round(enemy.y + enemy.h);
    const alpha = enemy.hitTimer > 0 && !art.anims.hurt && enemy.alive ? .45 : 1;
    // Chiến xa đứng báo trước khi lao: rung ngang ±shake px (vẽ bằng code).
    const shake = enemy.kind === 'chariot' && enemy.alive && enemy.mode === 'warn'
      ? (Math.floor(enemy.modeTime * 30) % 2 ? BOSS_TD.shake : -BOSS_TD.shake) : 0;
    // Lính thường có hướng riêng (`facing`, theo hướng đi/về phía người chơi);
    // boss không có -> luôn quay về phía người chơi.
    const drawn = drawAnimated(art.id, art.anims, null, enemy, pivotX + shake, footY, facingDirection(centerX, enemy.facing || 0, true), alpha);
    if (!drawn) {
      // Bao cát (layout thử) không có asset: hộp tạm + thanh máu + số máu.
      drawPlaceholder(enemy, alpha);
      debugLabels.set(enemy, `${enemyArtKey(enemy)} hp ${enemy.hp}`);
      if (enemy.harmless && enemy.alive) drawHealthBar(pivotX - (enemy.w + 8) / 2, enemy.y - 6, enemy.w + 8, enemy.hp / enemy.maxHp, '#e2ad45');
      return;
    }
    debugLabels.set(enemy, enemy.kind === 'chariot' ? `${drawn.label} ${enemy.mode} khiên ${enemy.shield}` : drawn.label);
    if (enemy.alive && !enemy.noBar) {
      const barW = enemy.w + 8;
      drawHealthBar(pivotX - barW / 2, drawn.top - 5, barW, enemy.hp / enemy.maxHp, enemy.boss ? '#e34c36' : '#e2ad45');
    }
  });
}

// NPC màn 2: sprite theo cỡ logic, pivot bottom-center tại (centerX, mặt đất = npc.y + npc.h),
// quay về phía người chơi. `idle`, hoặc `talk` khi đang nói thoại — cả hai
// lặp theo đồng hồ chung `time` (game tạm dừng lúc hội thoại nên không dùng
// đồng hồ riêng tick trong physics). Gặp xong thì mờ dần theo npc.fade.
function drawNpcs(time) {
  state.npcs.forEach(npc => {
    if (npc.fade <= 0) return;
    const sprite = NPC_SPRITES[npc.id];
    const pivotX = Math.round(npc.centerX - state.cameraX);
    if (pivotX < -60 || pivotX > VIEW_W + 60) return;
    const pose = { anim: { name: npc.talking ? 'talk' : 'idle', time } };
    const drawn = sprite && drawAnimated(sprite.id, sprite.anims, null, pose, pivotX, npc.y + npc.h, facingDirection(npc.centerX, 0, true), npc.fade);
    if (!drawn) {
      drawPlaceholder(npc, npc.fade);
      debugLabels.set(npc, `${npc.id} (placeholder)`);
      return;
    }
    debugLabels.set(npc, `${npc.id} ${drawn.label}`);
  });
}

// ---- Màn 3: boss (TT-BOSS-01 §3.5–3.6) ----
// Tô Định đi bộ đứng sau xác xe (giai đoạn 2) — vẽ TRƯỚC enemy để nằm sau xe.
function drawBossFoot() {
  const foot = state.battle?.foot;
  if (!foot) return;
  const art = ENEMY_SPRITES.bossFoot;
  const pivotX = Math.round(foot.x - state.cameraX);
  const drawn = drawAnimated(art.id, art.anims, null, foot, pivotX, GROUND_Y, facingDirection(foot.x, 0, true));
  if (!drawn) drawPlaceholder({ x: foot.x - 11, y: GROUND_Y - 40, w: 22, h: 40 });
}

// Hũ dầu (PJ_OIL_JAR `loop`, lặp theo tuổi hũ), tâm ô trùng tâm hitbox.
function drawJars() {
  const jarArt = BOSS_TD.jar;
  const meta = getAnimMeta(jarArt.id, jarArt.anim);
  const image = spriteImage(jarArt.id, jarArt.anim);
  state.jars.forEach(jar => {
    const centerX = Math.round(jar.x - state.cameraX);
    const centerY = Math.round(jar.y);
    if (!meta || !image) {
      ctx.fillStyle = '#6b4a2a';
      ctx.fillRect(centerX - 5, centerY - 5, 10, 10);
      return;
    }
    const footY = centerY - Math.round(meta.frame_h / 2) + meta.frame_h - 1;
    drawSprite(image, meta, frameIndex(meta, jar.age), centerX, footY, jar.vx < 0 ? -1 : 1);
    debugLabels.set(jar, jar.reflected ? 'hũ phản' : 'hũ');
  });
}

// Lửa dầu (FX_OIL_FIRE `impact`, không lặp -> giữ ô cuối tới hết fire.time).
function drawFires() {
  const fireArt = BOSS_TD.fire;
  const meta = getAnimMeta(fireArt.id, fireArt.anim);
  const image = spriteImage(fireArt.id, fireArt.anim);
  state.fires.forEach(fire => {
    const pivotX = Math.round(fire.x - state.cameraX);
    if (!meta || !image) {
      ctx.fillStyle = 'rgba(240, 120, 30, .7)';
      ctx.fillRect(pivotX - fireArt.width / 2, fire.footY - fireArt.h, fireArt.width, fireArt.h);
      return;
    }
    drawSprite(image, meta, frameIndex(meta, fire.time), pivotX, Math.round(fire.footY), 1);
  });
}

// ---- Màn 3: kỹ năng (TT-BOSS-01 §3.2) ----
const SHADOW = SKILLS.SK_TRUNG_NHI_SHADOW;
const SHADOW_ANIMS = { idle: 'idle', run: 'run', attack: 'attack_01' };
let tintCanvas = null;

// Ô sprite phủ một lớp màu (source-atop, chỉ tô lên pixel có hình) rồi vẽ
// như drawSprite. Dùng 1 canvas phụ cỡ 1 ô.
function drawTintedSprite(image, meta, frame, pivotX, footY, facing, alpha, tint) {
  // Canvas phụ giữ đúng mật độ của ô (bộ 32-bit: density x cỡ logic).
  const sw = meta.frame_w * (meta.density || 1);
  const sh = meta.frame_h * (meta.density || 1);
  tintCanvas ||= document.createElement('canvas');
  tintCanvas.width = sw;
  tintCanvas.height = sh;
  const tctx = tintCanvas.getContext('2d');
  tctx.imageSmoothingEnabled = false;
  tctx.drawImage(image, frame * sw, 0, sw, sh, 0, 0, sw, sh);
  tctx.globalCompositeOperation = 'source-atop';
  tctx.fillStyle = tint;
  tctx.fillRect(0, 0, sw, sh);
  drawSprite(tintCanvas, meta, 0, pivotX, footY, facing, alpha);
}

// Bóng Trưng Nhị: NPC_TRUNG_NHI alpha .5 ánh chàm, vẽ SAU lưng người chơi
// (trước drawPlayer). Chém: attack_01 trải trên ATTACK_COOLDOWN như người chơi.
function drawShadow() {
  const shadow = state.skills?.shadow;
  const pose = shadow?.pose;
  if (!pose || shadow.active <= 0) return;
  const key = shadow.anim?.name || 'idle';
  const name = SHADOW_ANIMS[key] || 'idle';
  const meta = getAnimMeta(SHADOW.sprite, name);
  const image = spriteImage(SHADOW.sprite, name);
  const pivotX = Math.round(pose.x + pose.w / 2 - state.cameraX);
  const footY = Math.round(pose.y + pose.h);
  if (!meta || !image) {
    drawPlaceholder(pose, SHADOW.alpha);
    return;
  }
  const frame = frameIndex(meta, shadow.anim.time, key === 'attack' ? ATTACK_COOLDOWN : null);
  drawTintedSprite(image, meta, frame, pivotX, footY, pose.facing < 0 ? -1 : 1, SHADOW.alpha, SHADOW.tint);
  debugLabels.set(pose, `bóng ${name} ${frame + 1}/${meta.frames}`);
}

// Mưa tên trên thành: vạch báo nhấp nháy trên mặt đất (vẽ bằng code) trong lúc
// báo trước và lúc tên đang rơi.
function drawWallArrowMarks(time) {
  state.wallArrows.forEach(arrow => {
    const x = Math.round(arrow.x - state.cameraX);
    if (x < -16 || x > VIEW_W + 16) return;
    const blink = arrow.warn > 0 && Math.floor(time * 10) % 2 === 0;
    ctx.fillStyle = blink ? 'rgba(255, 230, 120, .9)' : 'rgba(210, 40, 30, .85)';
    ctx.fillRect(x - 7, GROUND_Y - 1, 14, 2);
    ctx.fillRect(x - 1, GROUND_Y - 4, 2, 3);
  });
}

// Mưa tên (kỹ năng) + tên trên thành: PJ_ARROW_RAIN (mũi ở đáy ô) vẽ x1 tại (centerX, tipY).
function drawArrows() {
  const meta = getAnimMeta(ARROW_RAIN_SPRITE.id, ARROW_RAIN_SPRITE.anim);
  const image = spriteImage(ARROW_RAIN_SPRITE.id, ARROW_RAIN_SPRITE.anim);
  const falling = [
    ...state.arrows.filter(arrow => arrow.delay <= 0),
    ...state.wallArrows.filter(arrow => arrow.warn <= 0).map(arrow => ({ centerX: arrow.x, tipY: arrow.tipY }))
  ];
  falling.forEach(arrow => {
    const pivotX = Math.round(arrow.centerX - state.cameraX);
    if (pivotX < -16 || pivotX > VIEW_W + 16) return;
    const tipY = Math.round(arrow.tipY);
    if (meta && image) drawSprite(image, meta, 0, pivotX, tipY, 1);
    else {
      ctx.fillStyle = '#e8d9a8';
      ctx.fillRect(pivotX - 1, tipY - 18, 2, 18);
    }
  });
}

// Ô của animation người chơi cần vẽ (0-based) theo cấu hình PLAYER_ANIMATIONS.
function playerFrame(config, meta, p, animTime) {
  if (config.holdFrame !== undefined) return config.holdFrame < 0 ? meta.frames - 1 : config.holdFrame;
  if (config.byVelocity) {
    // jump 3 ô: bật lên / gần đỉnh / rơi — chọn theo vận tốc dọc, không theo giờ.
    if (p.vy < -PLAYER_JUMP_APEX_VY) return 0;
    return p.vy > PLAYER_JUMP_APEX_VY ? Math.min(2, meta.frames - 1) : Math.min(1, meta.frames - 1);
  }
  return frameIndex(meta, animTime, config.duration);
}

// Vẽ 1 ô strip, pivot bottom-center: chân (hàng frame_h - 2) nằm ngay
// trên `footY`, lật ngang quanh pivot khi quay trái (ảnh gốc quay phải).
// Luôn vẽ x1 theo pixel LOGIC. Bộ 32-bit (density > 1): ô ảnh dày gấp
// density được ép vào đúng khung logic — bộ đệm N = density thì khớp 1:1;
// bộ đệm nhỏ hơn (màn thấp) thì thu nhỏ có nội suy để không rụng hàng pixel.
function drawSprite(image, meta, frame, pivotX, footY, facing, alpha = 1) {
  const w = meta.frame_w;
  const h = meta.frame_h;
  const density = meta.density || 1;
  const left = pivotX - w / 2;
  const top = footY - (meta.frame_h - 1);
  ctx.save();
  ctx.globalAlpha = alpha;
  if (density > 1 && backingScale < density) ctx.imageSmoothingEnabled = true;
  if (facing < 0) {
    ctx.translate(pivotX, 0);
    ctx.scale(-1, 1);
    ctx.translate(-pivotX, 0);
  }
  ctx.drawImage(image, frame * w * density, 0, w * density, h * density, left, top, w, h);
  ctx.restore();
}

function drawPlayer(time) {
  const p = state.player;
  const x = Math.round(p.x - state.cameraX);
  const y = Math.round(p.y);
  const dead = p.deathTime !== null && state.health <= 0;
  const blinkHidden = !dead && p.invulnerable > 0 && Math.floor(p.invulnerable * 12) % 2 === 0;

  // Trạng thái animation do physics.js chọn (thứ tự ưu tiên hurt > dash >
  // attack > jump > run > idle); thua thì phát `death` một lần.
  const key = dead ? 'death' : (p.anim?.name || 'idle');
  const animTime = dead ? Math.max(0, time - p.deathTime) : (p.anim?.time || 0);
  const config = PLAYER_ANIMATIONS[key];
  const meta = getAnimMeta(PLAYER_SPRITE_ID, config.anim);
  const image = spriteImage(PLAYER_SPRITE_ID, config.anim);

  if (meta && image) {
    const frame = playerFrame(config, meta, p, animTime);
    debugLabels.set(p, `${key}:${config.anim} ${frame + 1}/${meta.frames}`);
    if (blinkHidden) return;
    const pivotX = Math.round(p.x + p.w / 2 - state.cameraX);
    const footY = Math.round(p.y + p.h);
    const facing = p.facing < 0 ? -1 : 1;
    drawSprite(image, meta, frame, pivotX, footY, facing);
    return;
  }

  // Thiếu manifest/strip: hộp placeholder đúng bằng hitbox (như Phase 1).
  debugLabels.set(p, `${key} (placeholder)`);
  if (blinkHidden) return;
  const colors = { hurt: '#e0564a', dash: '#6fc3e8', attack: '#f0c859', jump: '#c9853f', run: '#a8322c', idle: '#8b2820', death: '#3a2a22' };
  ctx.fillStyle = '#2b1710';
  ctx.fillRect(x, y, p.w, p.h);
  ctx.fillStyle = colors[key];
  ctx.fillRect(x + 1, y + 1, p.w - 2, p.h - 2);
  const headX = p.facing > 0 ? x + p.w - 11 : x + 3;
  ctx.fillStyle = '#c98c61';
  ctx.fillRect(headX, y + 3, 8, 8);
  if (p.attacking) {
    ctx.fillStyle = '#d7d5c8';
    ctx.fillRect(p.facing > 0 ? x + p.w : x - 48, y + 14, 48, 3);
  }
}

// Lớp debug (F2): hitbox (đỏ; người chơi xanh), pivot bottom-center (vàng),
// nhãn animation + ô đang vẽ phía trên entity, vạch GROUND_Y. Không đụng state.
function drawDebugOverlay() {
  ctx.save();
  ctx.lineWidth = 1;
  ctx.font = '7px monospace';
  ctx.textAlign = 'center';
  const entities = [
    ...state.obstacles.filter(item => item.active),
    ...state.hazards.filter(item => item.alive && !(item.kind === 'roller' && !item.active)),
    ...state.enemies.filter(item => item.alive),
    ...state.npcs.filter(item => item.fade > 0),
    ...state.projectiles,
    ...state.jars.map(jar => ({ x: jar.x - BOSS_TD.jar.w / 2, y: jar.y - BOSS_TD.jar.h / 2, w: BOSS_TD.jar.w, h: BOSS_TD.jar.h })),
    ...state.fires.map(fire => ({ x: fire.x - BOSS_TD.fire.width / 2, y: fire.footY - BOSS_TD.fire.h, w: BOSS_TD.fire.width, h: BOSS_TD.fire.h })),
    ...(state.skills?.shadow.pose && state.skills.shadow.active > 0 ? [state.skills.shadow.pose] : []),
    state.player
  ];
  entities.forEach(entity => {
    const x = Math.round(entity.x - state.cameraX);
    if (x + entity.w < -20 || x > VIEW_W + 20) return;
    const y = Math.round(entity.y);
    ctx.strokeStyle = entity === state.player ? '#00ff9c' : '#ff3b3b';
    ctx.strokeRect(x + .5, y + .5, Math.round(entity.w) - 1, Math.round(entity.h) - 1);
    const pivotX = Math.round(x + entity.w / 2);
    const pivotY = Math.round(y + entity.h);
    ctx.fillStyle = '#ffe600';
    ctx.fillRect(pivotX - 1, pivotY - 1, 3, 3);
    const label = debugLabels.get(entity);
    if (label) {
      const textW = Math.ceil(ctx.measureText(label).width) + 4;
      ctx.fillStyle = 'rgba(0, 0, 0, .6)';
      ctx.fillRect(Math.round(pivotX - textW / 2), y - 10, textW, 9);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(label, pivotX, y - 3);
    }
  });
  state.books.filter(book => !book.collected).forEach(book => {
    const x = Math.round(book.x - state.cameraX);
    ctx.strokeStyle = '#4fa3ff';
    ctx.strokeRect(x - 11 + .5, Math.round(book.y) - 13 + .5, 21, 25);
  });
  ctx.strokeStyle = 'rgba(255, 255, 255, .5)';
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y + .5);
  ctx.lineTo(VIEW_W, GROUND_Y + .5);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.fillText(`x ${Math.round(state.player.x)}  cam ${Math.round(state.cameraX)}  GROUND_Y ${GROUND_Y}`, 4, 10);
  const mid = sceneryAt('mid');
  const sky = sceneryAt('sky');
  ctx.fillText(`zone ${LEVEL.zones[zoneIndexAt(state.cameraX + VIEW_W / 2)].id}  mid ${mid.to ? `${mid.from}>${mid.to} ${mid.t.toFixed(2)}` : mid.from}  sky ${sky.to ? `>${sky.to} ${sky.t.toFixed(2)}` : sky.from}`, 4, 19);
  ctx.restore();
}

export function draw(time = 0) {
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  debugLabels.clear();
  if (!state) return;
  drawBackdrops();
  drawGround();
  drawFinishGate(time);
  drawQuizSteles(time);
  drawHazards(time, true);
  drawHoles();
  drawBooks(time);
  drawObstacles();
  drawNpcs(time);
  drawHazards(time);
  drawBossFoot();
  drawEnemies();
  drawProjectiles();
  drawJars();
  drawShadow();
  drawPlayer(time);
  drawFires();
  drawWallArrowMarks(time);
  drawArrows();
  // Cutscene kết chương: tối dần/sáng lại (fade 0..1).
  if (state.cutscene?.fade > 0) {
    ctx.fillStyle = `rgba(0, 0, 0, ${state.cutscene.fade})`;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }
  if (debug.enabled) {
    drawTerrainDebug();
    drawDebugOverlay();
  }
}
