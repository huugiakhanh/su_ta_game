// Toàn bộ vẽ canvas: nền parallax, mặt đất, cổng đích, obstacle, item, enemy, nhân vật, HUD in-canvas.

import { images } from './assets.js';
import { state } from './state.js';
import { debug } from './input.js';
import { getAnimMeta, frameIndex } from './animation.js';
import {
  LOGICAL_W, LOGICAL_H, VIEW_W, VIEW_H, CHUNK_W, LEVEL_CHUNKS, GROUND_Y,
  FINISH_GATE, OBSTACLE_TYPES, BOOK_SPRITE_ID, BOOK_FPS, BOOK_BOB_AMPLITUDE, ZONES, ZONE_BLEND_WIDTH, SKY_PARALLAX, FAR_HILLS, MID_PARALLAX,
  SKY_FALLBACK_COLOR, GROUND_FALLBACK_COLOR, GROUND_DECOR_DENSITY,
  GROUND_BLEND_WIDTH, GROUND_DITHER_CELL,
  HAZARD_SPRITES, ENEMY_SPRITES, PROJECTILE_SPRITES,
  PROJECTILE_MAX_RANGE, PROJECTILE_FADE_RANGE,
  PLAYER_SPRITE_ID, PLAYER_ANIMATIONS, PLAYER_JUMP_APEX_VY
} from './config.js';

export const canvas = document.getElementById('gameCanvas');
export const ctx = canvas.getContext('2d');

// Canvas luôn ở độ phân giải LOGIC; fitCanvas() chỉ đổi cỡ HIỂN THỊ (CSS).
canvas.width = LOGICAL_W;
canvas.height = LOGICAL_H;
ctx.imageSmoothingEnabled = false;

// Tên animation + ô đang vẽ của từng entity trong frame hiện tại — chỉ để lớp
// debug F2 in ra, không ảnh hưởng gameplay.
const debugLabels = new Map();

// Độ phân giải bộ đệm hiện tại: canvas thật = LOGICAL x backingScale pixel, mọi
// lệnh vẽ vẫn dùng toạ độ LOGIC nhờ setTransform.
let backingScale = 0;

// Phóng canvas logic 480x270 PHỦ KÍN vùng trống (giữ tỉ lệ 16:9, scale lẻ được
// phép — quyết định của team 25/09 thay cho letterbox bội số nguyên).
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
    - blockH('.hud') - blockH('.mobile-controls') - blockH('.help'));
  const scale = Math.min(availW / LOGICAL_W, availH / LOGICAL_H);
  const dpr = window.devicePixelRatio || 1;
  const deviceScale = scale * dpr;
  const nextBacking = Math.max(1, Math.ceil(deviceScale - 1e-3));
  if (nextBacking !== backingScale) {
    backingScale = nextBacking;
    // Đổi width/height xoá luôn trạng thái context -> đặt lại transform + smoothing.
    canvas.width = LOGICAL_W * backingScale;
    canvas.height = LOGICAL_H * backingScale;
    ctx.setTransform(backingScale, 0, 0, backingScale, 0, 0);
    ctx.imageSmoothingEnabled = false;
  }
  canvas.style.imageRendering = Math.abs(deviceScale - backingScale) < 1e-3 ? 'pixelated' : 'auto';
  shell.style.setProperty('--stage-w', `${LOGICAL_W * scale}px`);
  shell.style.setProperty('--stage-h', `${LOGICAL_H * scale}px`);
  return scale;
}

// ---- Nền 8-bit (TT-MAP-01): trời -> đồi xa -> lớp giữa -> tile mặt đất ----
// Mọi lớp vẽ x1 ở cỡ gốc, không smoothing, toạ độ nguyên.

function mod(value, size) {
  return ((value % size) + size) % size;
}

// Lặp ngang 1 ảnh theo chiều rộng GỐC. Offset làm tròn về pixel nguyên TRƯỚC
// khi lấy modulo để lớp nền không rung dưới pixel khi camera lerp chậm.
function drawTiledLayer(target, image, parallax, y) {
  const width = image.width;
  const offset = mod(Math.round(state.cameraX * parallax), width);
  for (let x = -offset; x < VIEW_W; x += width) target.drawImage(image, x, y);
}

function zoneIndexAt(x) {
  const index = ZONES.findIndex(zone => x < zone.x1);
  return index < 0 ? ZONES.length - 1 : Math.max(0, index);
}

// Cảnh (trời hoặc lớp giữa, `key` = 'sky' | 'mid') theo tâm khung nhìn: trong
// ZONE_BLEND_WIDTH px ngay TRƯỚC ranh giới vùng kế tiếp thì hoà A -> B theo t.
function sceneryAt(key) {
  const ref = state.cameraX + VIEW_W / 2;
  const index = zoneIndexAt(ref);
  const current = ZONES[index][key];
  const next = ZONES[index + 1];
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
  drawTiledLayer(ctx, image, FAR_HILLS.parallax, FAR_HILLS.bottomY - image.height);
  ctx.globalAlpha = 1;
}

// Canvas phụ để hoà 2 lớp giữa: cả hai PNG đều có alpha nên vẽ chồng bằng
// globalAlpha sẽ làm chỗ hai ảnh cùng đục bị mờ (t = .5 chỉ phủ 75%). Cộng
// 'lighter' A x (1 - t) + B x t trên nền trong suốt cho nội suy tuyến tính
// đúng cả màu lẫn độ phủ, rồi vẽ kết quả x1 lên canvas chính.
let blendCanvas = null;
function blendContext(width, height) {
  if (!blendCanvas) blendCanvas = document.createElement('canvas');
  if (blendCanvas.width !== width || blendCanvas.height !== height) {
    blendCanvas.width = width;
    blendCanvas.height = height;
  }
  const blend = blendCanvas.getContext('2d');
  blend.imageSmoothingEnabled = false;
  return blend;
}

function drawMidground() {
  const { from, to, t } = sceneryAt('mid');
  const a = images.maps.layers[from];
  const b = to ? images.maps.layers[to] : null;
  if (!a && !b) return;
  const height = (a || b).height;
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
  ctx.drawImage(blendCanvas, 0, top);
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
    ctx.drawImage(image, rect.x + sx, rect.y, w, rect.h, s - camera, screenY, w, rect.h);
  });
}

// Tile surface + fill của 1 cột theo vùng (biến thể tất định theo cột).
function columnTiles(region, column) {
  const hash = tileHash(column);
  return { hash, surface: pick(region?.surface, hash), fill: pick(region?.fill, hash >>> 8) };
}

// Nhiễu trắng tất định cho 1 ô lưới (toạ độ ô) -> [0, 1).
function cellNoise(cellX, cellY, salt) {
  return tileHash(Math.imul(cellX, 73856093) ^ Math.imul(cellY + 1, 19349663) ^ salt) / 4294967296;
}

// Nhiễu nhiều tầng tại pixel world (x, y): cụm lớn 4 ô + cụm vừa 2 ô + hạt 1
// ô (ô = GROUND_DITHER_CELL px) — các mảng đất quyện thành cụm tự nhiên thay
// vì lấm tấm đều. Tổng có trọng số vẫn trong [0, 1).
function ditherNoise(x, y) {
  const cell = GROUND_DITHER_CELL;
  return cellNoise(Math.floor(x / (cell * 4)), Math.floor(y / (cell * 4)), 0x51) * .5
    + cellNoise(Math.floor(x / (cell * 2)), Math.floor(y / (cell * 2)), 0x2f) * .3
    + cellNoise(Math.floor(x / cell), Math.floor(y / cell), 0x7b) * .2;
}

// Dải chuyển tiếp mặt đất quanh ranh giới vùng `index` -> `index + 1`, rộng
// GROUND_BLEND_WIDTH, căn giữa ranh giới. Mỗi ô GROUND_DITHER_CELL px lấy pixel
// của vùng sau nếu nhiễu < t (t tăng tuyến tính 0 -> 1 qua dải), còn lại lấy
// vùng trước — trộn kiểu dither pixel art, không alpha, không mờ. Dải là
// tĩnh (tile chọn theo cột) nên dựng 1 lần thành canvas rộng W x 2 tile
// (hàng surface + hàng fill) rồi cache; drawGround cắt từ canvas này theo cột.
const groundBands = new Map();
function groundBand(index, tileset) {
  if (groundBands.has(index)) return groundBands.get(index);
  const { image, tileW, tileH, regions } = tileset;
  const boundary = ZONES[index + 1].x0;
  const x0 = boundary - GROUND_BLEND_WIDTH / 2;
  const width = GROUND_BLEND_WIDTH;
  const height = tileH * 2;
  const layer = regionKey => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const layerCtx = canvas.getContext('2d');
    layerCtx.imageSmoothingEnabled = false;
    for (let x = 0; x < width; x += tileW) {
      const { surface, fill } = columnTiles(regions[regionKey], (x0 + x) / tileW);
      if (surface) layerCtx.drawImage(image, surface.x, surface.y, tileW, tileH, x, 0, tileW, tileH);
      if (fill) layerCtx.drawImage(image, fill.x, fill.y, tileW, tileH, x, tileH, tileW, tileH);
    }
    return { canvas, data: layerCtx.getImageData(0, 0, width, height) };
  };
  const from = layer(ZONES[index].tiles);
  const to = layer(ZONES[index + 1].tiles);
  const out = from.data;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const t = (x + .5) / width;
      if (ditherNoise(x0 + x, y) >= t) continue;
      const i = (y * width + x) * 4;
      out.data[i] = to.data.data[i];
      out.data[i + 1] = to.data.data[i + 1];
      out.data[i + 2] = to.data.data[i + 2];
      out.data[i + 3] = to.data.data[i + 3];
    }
  }
  from.canvas.getContext('2d').putImageData(out, 0, 0);
  const band = { x0, x1: x0 + width, canvas: from.canvas };
  groundBands.set(index, band);
  return band;
}

// Dải chuyển tiếp chứa cột world `columnX` (hoặc null).
function bandAt(columnX, tileset) {
  for (let index = 0; index < ZONES.length - 1; index++) {
    const boundary = ZONES[index + 1].x0;
    if (ZONES[index].tiles === ZONES[index + 1].tiles) continue;
    if (Math.abs(columnX + tileset.tileW / 2 - boundary) < GROUND_BLEND_WIDTH / 2) return groundBand(index, tileset);
  }
  return null;
}

// Mặt đất lát tileset theo vùng: hàng `surface` top = GROUND_Y, hàng `fill`
// ngay dưới (bị cắt ở đáy khung), decor 16x8 thưa trên mép cỏ. Cột tile căn
// theo lưới world 16px, vùng lấy theo world X của cột; quanh mỗi ranh giới
// vùng là dải chuyển tiếp dither (groundBand). Chỉ vẽ các cột trong viewport.
// Hố: không vẽ tile trong hố; tile `left-edge`/`right-edge` (nửa đặc, nửa
// trong suốt) đặt sao cho phần đất kết thúc ĐÚNG mép hố (khớp pointHasGround)
// — quyết định team G6.
function drawGround() {
  const tileset = images.maps.tileset;
  const camera = Math.round(state.cameraX);
  const holes = state.holes || [];
  if (!tileset) {
    ctx.fillStyle = GROUND_FALLBACK_COLOR;
    ctx.fillRect(0, GROUND_Y, VIEW_W, VIEW_H - GROUND_Y);
    return;
  }
  const { image, tileW, tileH, regions } = tileset;
  const half = tileW / 2;
  const surfaceGaps = holes.map(hole => [hole.x - half, hole.x + hole.w + half]);
  const fillGaps = holes.map(hole => [hole.x, hole.x + hole.w]);
  const first = Math.floor(camera / tileW);
  const last = Math.floor((camera + VIEW_W - 1) / tileW);

  for (let column = first; column <= last; column++) {
    const columnX = column * tileW;
    const zoneIndex = zoneIndexAt(columnX);
    let region = regions[ZONES[zoneIndex].tiles];
    if (!region) continue;
    const { hash, surface, fill } = columnTiles(region, column);
    const surfaceSegments = subtractIntervals(columnX, columnX + tileW, surfaceGaps);
    const fillSegments = subtractIntervals(columnX, columnX + tileW, fillGaps);
    const band = bandAt(columnX, tileset);
    if (band) {
      // Trong dải chuyển tiếp: cắt đúng cột này từ canvas dải đã dither sẵn.
      const sx = columnX - band.x0;
      drawTileSegments(band.canvas, { x: sx, y: 0, h: tileH }, columnX, GROUND_Y, surfaceSegments, camera);
      drawTileSegments(band.canvas, { x: sx, y: tileH, h: tileH }, columnX, GROUND_Y + tileH, fillSegments, camera);
      // Decor trong dải cũng chọn vùng theo xác suất t (tất định theo cột).
      const t = (columnX + tileW / 2 - band.x0) / GROUND_BLEND_WIDTH;
      const boundaryZone = zoneIndexAt(band.x1 - 1);
      const pickNext = ((hash >>> 4) & 0xff) / 256 < t;
      region = regions[ZONES[pickNext ? boundaryZone : boundaryZone - 1].tiles] || region;
    } else {
      if (surface) drawTileSegments(image, surface, columnX, GROUND_Y, surfaceSegments, camera);
      if (fill) drawTileSegments(image, fill, columnX, GROUND_Y + tileH, fillSegments, camera);
    }
    // Decor chỉ trên cột đất nguyên vẹn, đáy decor = GROUND_Y, không va chạm.
    const intact = surfaceSegments.length === 1 && surfaceSegments[0][1] - surfaceSegments[0][0] === tileW;
    if (intact && ((hash >>> 16) & 0xff) < 256 * GROUND_DECOR_DENSITY) {
      const decor = pick(region.decoration, hash >>> 24);
      if (decor) ctx.drawImage(image, decor.x, decor.y, decor.w, decor.h, columnX - camera, GROUND_Y - decor.h, decor.w, decor.h);
    }
  }

  holes.forEach(hole => {
    const edges = [
      ['left-edge', hole.x - half, hole.x - 1],
      ['right-edge', hole.x + hole.w - half, hole.x + hole.w]
    ];
    edges.forEach(([role, x, sampleX]) => {
      if (x + tileW < camera || x > camera + VIEW_W) return;
      const rect = pick(regions[ZONES[zoneIndexAt(sampleX)].tiles]?.[role], 0);
      if (rect) ctx.drawImage(image, rect.x, rect.y, rect.w, rect.h, Math.round(x - camera), GROUND_Y, rect.w, rect.h);
    });
  });
}

// Điều kiện thắng về NỘI DUNG đã đủ (boss đã hạ + nhặt hết sách) — cổng mở
// trước khi người chơi chạm finishX; trigger về đích vẫn ở physics.js.
function finishGateOpen() {
  const bossAlive = state.enemies.some(enemy => enemy.boss && enemy.alive);
  return !bossAlive && state.booksCollected >= state.books.length;
}

// Cổng thành Luy Lâu: x1, pivot bottom-center (maps_tt.json), đáy ở GROUND_Y.
function drawFinishGate() {
  const prop = images.maps.props[finishGateOpen() ? FINISH_GATE.open : FINISH_GATE.closed]
    || images.maps.props[FINISH_GATE.closed];
  const w = prop ? prop.image.width : 131;
  const h = prop ? prop.image.height : 150;
  const pivot = prop?.asset.pivot || { x: w / 2, y: h };
  const left = Math.round(FINISH_GATE.worldX - pivot.x - state.cameraX);
  if (left + w < -48 || left > VIEW_W + 48) return;
  const top = GROUND_Y - pivot.y;
  if (prop) ctx.drawImage(prop.image, left, top);
  else drawLandmarkFallback(left, top, w, h);
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

// Hố rơi (state.holes) trước đây không có hình gì đại diện — nhân vật rơi
// xuống "hố vô hình" trông như bug. Vẽ 1 hố tối đơn giản đè lên dải đất để
// người chơi thấy rõ chỗ cần nhảy/lướt qua.
function drawHoles() {
  state.holes.forEach(hole => {
    const x = hole.x - state.cameraX;
    if (x + hole.w < -24 || x > VIEW_W + 24) return;
    const left = Math.round(x);
    const width = Math.round(hole.w);
    const gradient = ctx.createLinearGradient(0, GROUND_Y, 0, VIEW_H);
    gradient.addColorStop(0, '#120a06');
    gradient.addColorStop(1, '#000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(left, GROUND_Y, width, VIEW_H - GROUND_Y);
    // Viền mép hố để rõ ranh giới với cỏ xung quanh.
    ctx.fillStyle = 'rgba(0, 0, 0, .55)';
    ctx.fillRect(left, GROUND_Y, 2, VIEW_H - GROUND_Y);
    ctx.fillRect(left + width - 2, GROUND_Y, 2, VIEW_H - GROUND_Y);
  });
}

// Hướng cần quay (-1 trái / 1 phải) cho sprite 8-bit (ảnh gốc quay PHẢI):
// vật có hướng chạy riêng (`facing` của roller, giữ nguyên cả khi đang chết)
// quay theo hướng đó; lính/boss quay về phía người chơi; còn lại (bẫy, tháp)
// giữ hướng gốc.
function facingDirection(centerX, fixedFacing = 0, watchesPlayer = false) {
  if (fixedFacing) return fixedFacing;
  if (!watchesPlayer) return 1;
  const playerCenter = state.player.x + state.player.w / 2;
  return playerCenter > centerX ? 1 : -1;
}

// Vẽ ô hiện tại của entity có `anim = { name, time }` (đồng hồ riêng, tick ở
// physics.js). `anims` ánh xạ tên trạng thái -> animation manifest; `durations`
// ép thời lượng (vd. throw .85s). Trả về { label, top } hoặc null nếu thiếu
// manifest/ảnh (caller tự vẽ placeholder).
function drawAnimated(assetId, anims, durations, entity, pivotX, footY, facing, alpha = 1) {
  const key = entity.anim?.name;
  const name = anims[key] || anims.idle || anims.move;
  const meta = name ? getAnimMeta(assetId, name) : null;
  const image = name ? images.sprites8[assetId]?.[name] : null;
  if (!meta || !image) return null;
  const frame = frameIndex(meta, entity.anim?.time || 0, durations?.[key] ?? null);
  drawSprite8(image, meta, frame, pivotX, footY, facing, alpha);
  return { label: `${name} ${frame + 1}/${meta.frames}`, top: footY - (meta.frame_h - 1) };
}

// Hộp tạm theo hitbox khi thiếu sprite 8-bit.
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
    const { frame_w: fw = prop.image.width, frame_h: fh = prop.image.height, frames = 1 } = prop.asset;
    const frame = Math.floor(time * BOOK_FPS + index) % frames;
    ctx.drawImage(prop.image, frame * fw, 0, fw, fh, x - fw / 2, y - fh / 2, fw, fh);
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

// Vật cản tĩnh: ảnh 8-bit x1 (không co giãn, không quầng — G5). Thiếu ảnh thì
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
    const rect = obstacleDrawRect(obstacle, prop.asset);
    const left = Math.round(rect.x - state.cameraX);
    if (left + prop.image.width < -48 || left > VIEW_W + 48) return;
    ctx.drawImage(prop.image, left, Math.round(rect.y));
  });
}

// Vật có trạng thái (sprite 8-bit, pivot bottom-center = tâm ngang + chân
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
    const facing = facingDirection(centerX, hazard.facing, hazard.kind === 'thrower' || hazard.kind === 'boat');
    const drawn = sprite && drawAnimated(sprite.id, sprite.anims, sprite.durations, hazard, pivotX, footY, facing);
    if (!drawn) {
      drawPlaceholder(hazard);
      debugLabels.set(hazard, `${hazard.sprite} (placeholder)`);
      return;
    }
    debugLabels.set(hazard, drawn.label);
    if (hazard.alive && hazard.maxHp > 0 && hazard.hp > 0) {
      const barW = hazard.w + 8;
      drawHealthBar(pivotX - barW / 2, drawn.top - 5, barW, hazard.hp / hazard.maxHp, '#e2ad45');
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
    const image = art ? images.sprites8[art.id]?.[art.anim] : null;
    if (!meta || !image) {
      drawPlaceholder(projectile, alpha);
      return;
    }
    // Strip đạn lặp theo tuổi của viên đạn (đồng hồ riêng); tâm ô vẽ trùng
    // tâm hitbox; ảnh gốc quay PHẢI nên bay sang trái thì lật.
    const frame = frameIndex(meta, projectile.age);
    const footY = centerY - Math.round(meta.frame_h / 2) + meta.frame_h - 1;
    drawSprite8(image, meta, frame, centerX, footY, projectile.direction < 0 ? -1 : 1, alpha);
    debugLabels.set(projectile, `${art.anim} ${frame + 1}/${meta.frames}`);
  });
}

function drawHealthBar(x, y, width, ratio, color) {
  ctx.fillStyle = '#2b110d';
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(width), 4);
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x + 1), Math.round(y + 1), Math.round((width - 2) * ratio), 2);
}

// Lính canh / boss đứng yên (sprite 8-bit, pivot = tâm ngang + chân hitbox).
// Boss không có animation `hurt` nên trúng đòn thì nháy mờ như bản cũ.
function drawEnemies() {
  state.enemies.forEach(enemy => {
    if (!enemy.alive && !enemy.dying) return;
    const art = ENEMY_SPRITES[enemy.boss ? 'boss' : 'normal'];
    const centerX = enemy.x + enemy.w / 2;
    const pivotX = Math.round(centerX - state.cameraX);
    if (pivotX < -80 || pivotX > VIEW_W + 80) return;
    const footY = Math.round(enemy.y + enemy.h);
    const alpha = enemy.hitTimer > 0 && !art.anims.hurt && enemy.alive ? .45 : 1;
    const drawn = drawAnimated(art.id, art.anims, null, enemy, pivotX, footY, facingDirection(centerX, 0, true), alpha);
    if (!drawn) {
      drawPlaceholder(enemy, alpha);
      return;
    }
    debugLabels.set(enemy, drawn.label);
    if (enemy.alive) {
      const barW = enemy.w + 8;
      drawHealthBar(pivotX - barW / 2, drawn.top - 5, barW, enemy.hp / enemy.maxHp, enemy.boss ? '#e34c36' : '#e2ad45');
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

// Vẽ 1 ô strip 8-bit, pivot bottom-center: chân (hàng frame_h - 2) nằm ngay
// trên `footY`, lật ngang quanh pivot khi quay trái (ảnh gốc quay phải).
// Luôn vẽ x1.
function drawSprite8(image, meta, frame, pivotX, footY, facing, alpha = 1) {
  const w = meta.frame_w;
  const h = meta.frame_h;
  const left = pivotX - w / 2;
  const top = footY - (meta.frame_h - 1);
  ctx.save();
  ctx.globalAlpha = alpha;
  if (facing < 0) {
    ctx.translate(pivotX, 0);
    ctx.scale(-1, 1);
    ctx.translate(-pivotX, 0);
  }
  ctx.drawImage(image, frame * meta.frame_w, 0, meta.frame_w, meta.frame_h, left, top, w, h);
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
  const image = images.sprites8[PLAYER_SPRITE_ID]?.[config.anim];

  if (meta && image) {
    const frame = playerFrame(config, meta, p, animTime);
    debugLabels.set(p, `${key}:${config.anim} ${frame + 1}/${meta.frames}`);
    if (blinkHidden) return;
    const pivotX = Math.round(p.x + p.w / 2 - state.cameraX);
    const footY = Math.round(p.y + p.h);
    const facing = p.facing < 0 ? -1 : 1;
    drawSprite8(image, meta, frame, pivotX, footY, facing);
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

function drawChunkMarker() {
  const chunk = Math.min(LEVEL_CHUNKS, Math.floor(state.player.x / CHUNK_W) + 1);
  ctx.fillStyle = 'rgba(24, 14, 9, .72)';
  ctx.fillRect(VIEW_W - 63, 7, 54, 17);
  ctx.fillStyle = '#ffe7a3';
  ctx.font = 'bold 9px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText(`${chunk} / ${LEVEL_CHUNKS}`, VIEW_W - 36, 19);
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
    ...state.projectiles,
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
  ctx.fillText(`zone ${ZONES[zoneIndexAt(state.cameraX + VIEW_W / 2)].id}  mid ${mid.to ? `${mid.from}>${mid.to} ${mid.t.toFixed(2)}` : mid.from}  sky ${sky.to ? `>${sky.to} ${sky.t.toFixed(2)}` : sky.from}`, 4, 19);
  ctx.restore();
}

export function draw(time = 0) {
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  debugLabels.clear();
  if (!state) return;
  drawBackdrops();
  drawGround();
  drawFinishGate();
  drawHazards(time, true);
  drawHoles();
  drawBooks(time);
  drawObstacles();
  drawHazards(time);
  drawEnemies();
  drawProjectiles();
  drawPlayer(time);
  drawChunkMarker();
  if (debug.enabled) drawDebugOverlay();
}
