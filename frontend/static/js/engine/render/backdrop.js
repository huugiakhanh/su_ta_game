// Nền parallax: trời -> đồi xa -> lớp giữa theo vùng (LEVEL.zones), hoà cảnh
// trước ranh giới vùng.

import { images } from '../assets.js';
import { state } from '../state.js';
import { VIEW_W, VIEW_H, GROUND_Y, SKY_PARALLAX, MID_PARALLAX, SKY_FALLBACK_COLOR, ZONE_BLEND_WIDTH } from '../config.js';
import { CHAPTER, LEVEL } from '../chapter.js';
import { ctx, backingScale, drawMapImage, mapWidth, mapHeight } from './canvas.js';

// ---- Nền (TT-MAP-01, bộ 32-bit TT-HIBIT-03): trời -> đồi xa -> lớp giữa -> tile mặt đất ----
// Mọi lớp vẽ theo cỡ LOGIC (mapWidth/mapHeight), toạ độ nguyên.

function mod(value, size) {
  return ((value % size) + size) % size;
}

// Lặp ngang 1 ảnh theo chiều rộng LOGIC. Offset làm tròn về pixel nguyên TRƯỚC
// khi lấy modulo để lớp nền không rung dưới pixel khi camera lerp chậm.
function drawTiledLayer(target, image, parallax, y) {
  const width = mapWidth(image);
  const height = mapHeight(image);
  const offset = mod(Math.round(state.cameraX * parallax), width);
  for (let x = -offset; x < VIEW_W; x += width) drawMapImage(target, image, 0, 0, width, height, x, y);
}

// Vùng cảnh của màn đang chơi (LEVEL.zones).
export function zoneIndexAt(x) {
  const zones = LEVEL.zones;
  const index = zones.findIndex(zone => x < zone.x1);
  return index < 0 ? zones.length - 1 : Math.max(0, index);
}

// Cảnh (trời hoặc lớp giữa, `key` = 'sky' | 'mid') theo tâm khung nhìn: trong
// ZONE_BLEND_WIDTH px ngay TRƯỚC ranh giới vùng kế tiếp thì hoà A -> B theo t.
export function sceneryAt(key) {
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

// Đồi xa tắt dần dưới các ảnh trời trong CHAPTER.farHills.hiddenUnderSky (trời giông),
// theo đúng hệ số hoà của trời nên cả hai đổi cùng nhịp.
function drawFarHills() {
  const hills = CHAPTER.farHills;
  const image = hills && images.maps.layers[hills.id];
  if (!image) return;
  const { from, to, t } = sceneryAt('sky');
  const hidden = id => hills.hiddenUnderSky.includes(id);
  const alpha = to ? (hidden(from) ? 0 : 1) * (1 - t) + (hidden(to) ? 0 : 1) * t : (hidden(from) ? 0 : 1);
  if (alpha <= 0) return;
  ctx.globalAlpha = alpha;
  drawTiledLayer(ctx, image, hills.parallax, hills.bottomY - mapHeight(image));
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

export function drawBackdrops() {
  drawSky();
  drawFarHills();
  drawMidground();
}
