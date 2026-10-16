// Canvas + công cụ vẽ dùng chung mọi lớp render (và lớp vẽ riêng của chương):
// fitCanvas, ảnh môi trường theo mật độ, ô sprite pivot bottom-center, sprite có
// animation, hộp tạm, thanh máu. Toạ độ vẽ là pixel LOGIC.

import { images } from '../assets.js';
import { state } from '../state.js';
import { getAnimMeta, frameIndex } from '../animation.js';
import { LOGICAL_W, LOGICAL_H, MAX_VIEW_W, VIEW_W, VIEW_H, setViewWidth } from '../config.js';
import { LEVEL } from '../chapter.js';

export const canvas = document.getElementById('gameCanvas');
export const ctx = canvas.getContext('2d');

// Canvas luôn ở độ phân giải LOGIC (VIEW_W x VIEW_H); fitCanvas() chọn VIEW_W
// theo tỉ lệ cửa sổ và cỡ HIỂN THỊ (CSS).
canvas.width = VIEW_W;
canvas.height = VIEW_H;
ctx.imageSmoothingEnabled = false;

// Tên animation + ô đang vẽ của từng entity trong frame hiện tại — chỉ để lớp
// debug F2 in ra, không ảnh hưởng gameplay.
export const debugLabels = new Map();

// Độ phân giải bộ đệm hiện tại: canvas thật = LOGICAL x backingScale pixel, mọi
// lệnh vẽ vẫn dùng toạ độ LOGIC nhờ setTransform.
export let backingScale = 0;

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

// Ảnh môi trường mang `image.density` (assets.js; bộ 32-bit = 4). Cỡ LOGIC của
// ảnh — dùng thay image.width/height (không gọi thẳng với ảnh map).
const mapDensity = image => image.density || 1;
export const mapWidth = image => image.width / mapDensity(image);
export const mapHeight = image => image.height / mapDensity(image);

// Vẽ 1 vùng ảnh môi trường: toạ độ nguồn (sx..sh) và đích là pixel LOGIC, nguồn
// nhân density khi lấy từ ảnh. Bộ đệm N < density (màn thấp) thì thu nhỏ có
// nội suy như drawSprite; còn lại nearest-neighbor.
export function drawMapImage(target, image, sx, sy, sw, sh, dx, dy, dw = sw, dh = sh) {
  const density = mapDensity(image);
  if (density > 1 && backingScale < density) target.imageSmoothingEnabled = true;
  target.drawImage(image, sx * density, sy * density, sw * density, sh * density, dx, dy, dw, dh);
  target.imageSmoothingEnabled = false;
}

// Vẽ 1 ô strip, pivot bottom-center: chân (hàng frame_h - 2) nằm ngay
// trên `footY`, lật ngang quanh pivot khi quay trái (ảnh gốc quay phải).
// Luôn vẽ x1 theo pixel LOGIC. Bộ 32-bit (density > 1): ô ảnh dày gấp
// density được ép vào đúng khung logic — bộ đệm N = density thì khớp 1:1;
// bộ đệm nhỏ hơn (màn thấp) thì thu nhỏ có nội suy để không rụng hàng pixel.
export function drawSprite(image, meta, frame, pivotX, footY, facing, alpha = 1) {
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

let tintCanvas = null;

// Ô sprite phủ một lớp màu (source-atop, chỉ tô lên pixel có hình) rồi vẽ
// như drawSprite. Dùng 1 canvas phụ cỡ 1 ô.
export function drawTintedSprite(image, meta, frame, pivotX, footY, facing, alpha, tint) {
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

// Hướng cần quay (-1 trái / 1 phải) cho sprite (ảnh gốc quay PHẢI):
// vật có hướng chạy riêng (`facing` của roller, giữ nguyên cả khi đang chết)
// quay theo hướng đó; lính/boss quay về phía người chơi; còn lại (bẫy, tháp)
// giữ hướng gốc.
export function facingDirection(centerX, fixedFacing = 0, watchesPlayer = false) {
  if (fixedFacing) return fixedFacing;
  if (!watchesPlayer) return 1;
  const playerCenter = state.player.x + state.player.w / 2;
  return playerCenter > centerX ? 1 : -1;
}

// Strip `name` của sprite `assetId`. Asset đã tải xong mà màn không nạp
// (thiếu trong LEVEL.sprites của chương — nạp theo màn, Phần D) thì cảnh báo
// 1 lần/asset để thêm vào danh sách; caller vẽ hộp tạm như khi thiếu ảnh.
const unloadedWarned = new Set();
export function spriteImage(assetId, name) {
  const strips = images.sprites[assetId];
  if (!strips && images.loaded && assetId && !unloadedWarned.has(assetId)) {
    unloadedWarned.add(assetId);
    console.warn(`sprite ${assetId} chưa nạp ở màn ${LEVEL.id} — thêm vào sprites của màn ${LEVEL.id} (chapter.js của chương)`);
  }
  return strips?.[name] || null;
}

// Vẽ ô hiện tại của entity có `anim = { name, time }` (đồng hồ riêng, tick ở
// phần mô phỏng). `anims` ánh xạ tên trạng thái -> animation manifest; `durations`
// ép thời lượng (vd. throw .85s). Trả về { label, top } hoặc null nếu thiếu
// manifest/ảnh (caller tự vẽ placeholder).
export function drawAnimated(assetId, anims, durations, entity, pivotX, footY, facing, alpha = 1) {
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
export function drawPlaceholder(entity, alpha = 1) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#4a3020';
  ctx.fillRect(Math.round(entity.x - state.cameraX), Math.round(entity.y), Math.round(entity.w), Math.round(entity.h));
  ctx.globalAlpha = 1;
}

export function drawHealthBar(x, y, width, ratio, color) {
  ctx.fillStyle = '#2b110d';
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(width), 4);
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x + 1), Math.round(y + 1), Math.round((width - 2) * ratio), 2);
}
