// Toàn bộ vẽ canvas: nền parallax, landmark, obstacle, item, enemy, nhân vật, HUD in-canvas.

import { images } from './assets.js';
import { state } from './state.js';
import { debug } from './input.js';
import { getAnimMeta, frameIndex } from './animation.js';
import {
  LOGICAL_W, LOGICAL_H, VIEW_W, VIEW_H, CHUNK_W, LEVEL_CHUNKS, OBSTACLE_GROUND_SINK, GROUND_Y,
  BACKDROP_LAYERS, LANDMARKS,
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

function drawBackdropLayer(layer, image) {
  const y = Math.round(layer.y);
  const height = Math.round(layer.height);
  if (!image) {
    // fallbackBandHeight cho phép chỉ tô 1 dải ở đáy layer (vd. đất) thay vì
    // tô kín cả layer — cần thiết cho layer `foreground` vốn nền trong suốt,
    // để layer `sky` phía dưới vẫn hiện ra khi chưa có ảnh foreground thật.
    const bandHeight = Math.round(layer.fallbackBandHeight ?? height);
    ctx.fillStyle = layer.fallbackColor;
    ctx.fillRect(0, y + height - bandHeight, VIEW_W, bandHeight);
    return;
  }
  // Scale ảnh theo chiều cao layer rồi lặp ngang vô hạn theo cameraX * speed —
  // đây là 1 ảnh tile duy nhất, không phải nhiều ảnh ghép cạnh nhau nên không có "mép nối".
  const scale = height / image.height;
  const drawWidth = Math.max(1, Math.round(image.width * scale));
  const offset = ((state.cameraX * layer.speed) % drawWidth + drawWidth) % drawWidth;
  for (let x = -Math.round(offset); x < VIEW_W; x += drawWidth) {
    ctx.drawImage(image, x, y, drawWidth, height);
  }
}

// Nền cũ (ảnh lớn) vẽ THU NHỎ theo k nên bật smoothing cho đỡ răng cưa; draw()
// tắt lại trước khi vẽ sprite. TODO_MAP: nền pixel đúng tỉ lệ sẽ được vẽ lại.
function drawBackdrops() {
  ctx.imageSmoothingEnabled = true;
  BACKDROP_LAYERS.forEach(layer => drawBackdropLayer(layer, images.backdrops[layer.key]));
}

function drawLandmarks() {
  LANDMARKS.forEach(landmark => {
    const image = images.landmarkCache[landmark.file];
    // Rộng suy từ tỉ lệ ảnh thật để thay ảnh khác kích thước vẫn không méo;
    // chưa có ảnh thì dùng tỉ lệ 1:1 cho hình vẽ tạm.
    const aspect = image && image.naturalHeight
      ? image.naturalWidth / image.naturalHeight
      : 1;
    const h = landmark.height;
    const w = h * aspect;
    const left = landmark.worldX - w / 2 - state.cameraX;
    if (left + w < -48 || left > VIEW_W + 48) return;
    const top = GROUND_Y + (landmark.sink || 0) - h;
    if (image) {
      ctx.drawImage(image, Math.round(left), Math.round(top), Math.round(w), h);
    } else {
      drawLandmarkFallback(left, top, w, h);
    }
  });
}

// Cổng gỗ tạm (2 cột + xà ngang + cờ nhỏ) — dùng tới khi có ảnh landmark thật.
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

function drawBooks(time) {
  const bookImage = images.items.book;
  state.books.forEach((book, index) => {
    if (book.collected) return;
    const x = book.x - state.cameraX;
    if (x < -36 || x > VIEW_W + 36) return;
    const y = book.y + Math.sin(time * 4 + index) * 3;
    ctx.fillStyle = 'rgba(255, 210, 80, .3)';
    ctx.beginPath();
    ctx.ellipse(Math.round(x), Math.round(y + 2), 16, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    if (bookImage) {
      const w = 24;
      const h = Math.round(w * (bookImage.height / bookImage.width));
      ctx.drawImage(bookImage, Math.round(x - w / 2), Math.round(y - h / 2), w, h);
    } else {
      ctx.fillStyle = '#f4d05c';
      ctx.fillRect(Math.round(x - 9), Math.round(y - 11), 18, 23);
    }
  });
}

function drawObstacleSprite(type, x, y, width, height) {
  const image = images.obstacleSprites[type];
  if (!image) {
    ctx.fillStyle = '#4a3020';
    ctx.fillRect(Math.round(x), Math.round(y), width, height);
    return;
  }
  // Ảnh nguồn đã được crop sát nội dung (không còn viền trong suốt thừa),
  // vẽ nguyên cả ảnh scale theo drawW/drawH là đủ.
  ctx.drawImage(image, Math.round(x), Math.round(y), width, height);
}

// Quầng mờ phía sau obstacle để tách khỏi nền cây cối bận rộn — harmful thì
// dùng quầng đỏ cảnh báo, loại thường dùng quầng tối trung tính.
function drawObstacleContrastHalo(obstacle, x, y) {
  const cx = x + obstacle.drawW / 2;
  const cy = y + obstacle.drawH / 2;
  if (obstacle.harmful) {
    // Bẫy gây sát thương cần nổi bật rõ — quầng đỏ đậm hơn + viền sáng mỏng
    // quanh đáy để không bị chìm vào màu nâu/xanh của nền cây cối.
    const radius = Math.max(obstacle.drawW, obstacle.drawH) * 0.85;
    const gradient = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius);
    gradient.addColorStop(0, 'rgba(255, 60, 30, .75)');
    gradient.addColorStop(0.6, 'rgba(224, 32, 20, .4)');
    gradient.addColorStop(1, 'rgba(224, 32, 20, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 210, 90, .8)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(cx, y + obstacle.drawH - 2, obstacle.drawW * 0.48, 3, 0, 0, Math.PI * 2);
    ctx.stroke();
    return;
  }
  const radius = Math.max(obstacle.drawW, obstacle.drawH) * 0.62;
  const gradient = ctx.createRadialGradient(cx, cy, radius * 0.25, cx, cy, radius);
  gradient.addColorStop(0, 'rgba(8, 6, 3, .4)');
  gradient.addColorStop(1, 'rgba(8, 6, 3, 0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawObstacles() {
  state.obstacles.forEach(obstacle => {
    if (!obstacle.active) return;
    const x = obstacle.x - state.cameraX - (obstacle.drawW - obstacle.w) / 2;
    if (x + obstacle.drawW < -48 || x > VIEW_W + 48) return;
    // Neo theo mặt đất thật tại vị trí vật cản và chìm nhẹ 4 px để phần trong
    // suốt ở đáy ô sprite không khiến chướng ngại vật trông như đang bay.
    const drawY = obstacle.groundY - obstacle.drawH + OBSTACLE_GROUND_SINK;
    drawObstacleContrastHalo(obstacle, x, drawY);
    drawObstacleSprite(obstacle.type, x, drawY, obstacle.drawW, obstacle.drawH);
    debugLabels.set(obstacle, obstacle.type);
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
// `scale` = 1 cho mọi strip đúng tỉ lệ; khác 1 chỉ dùng bù tạm (drawScale).
function drawSprite8(image, meta, frame, pivotX, footY, facing, alpha = 1, scale = 1) {
  const w = meta.frame_w * scale;
  const h = meta.frame_h * scale;
  const left = pivotX - w / 2;
  const top = footY - (meta.frame_h - 1) * scale;
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
    drawSprite8(image, meta, frame, pivotX, footY, facing, 1, config.drawScale || 1);
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
  ctx.restore();
}

export function draw(time = 0) {
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  debugLabels.clear();
  drawBackdrops();
  if (!state) {
    ctx.imageSmoothingEnabled = false;
    return;
  }
  drawLandmarks();
  // Hết lớp nền: tắt smoothing trước khi vẽ sprite.
  ctx.imageSmoothingEnabled = false;
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
