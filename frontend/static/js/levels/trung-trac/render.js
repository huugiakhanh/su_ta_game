// Toàn bộ vẽ canvas: nền parallax, landmark, obstacle, item, enemy, nhân vật, HUD in-canvas.

import { images } from './assets.js';
import { state } from './state.js';
import {
  VIEW_W, VIEW_H, CHUNK_W, LEVEL_CHUNKS, OBSTACLE_GROUND_SINK, GROUND_Y,
  PLAYER_SPRITE_HEIGHT, PLAYER_SPRITE_ANCHOR_X, BACKDROP_LAYERS, LANDMARKS,
  OBSTACLE_STRIP_FILES, ITEM_STRIP_FILES, ENEMY_SPRITES, HAZARD_SPRITE_SIZES
} from './config.js';

export const canvas = document.getElementById('gameCanvas');
export const ctx = canvas.getContext('2d');
export const playerSprite = document.getElementById('playerSprite');
ctx.imageSmoothingEnabled = false;

// Giữ đúng độ phân giải camera kể cả khi HTML cũ vẫn còn width="1280".
canvas.width = VIEW_W;
canvas.height = VIEW_H;
ctx.imageSmoothingEnabled = false;

let currentPlayerAnimation = '';

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
  for (let x = -offset; x < VIEW_W; x += drawWidth) {
    ctx.drawImage(image, Math.round(x), y, drawWidth, height);
  }
}

function drawBackdrops() {
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
    if (left + w < -80 || left > VIEW_W + 80) return;
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
  const postW = Math.max(8, Math.round(w * 0.09));
  ctx.fillStyle = '#5a3a22';
  ctx.fillRect(x, y, postW, h);
  ctx.fillRect(Math.round(x + w - postW), y, postW, h);
  ctx.fillStyle = '#7a4f2c';
  ctx.fillRect(x - 4, y, Math.round(w) + 8, 18);
  ctx.fillStyle = '#b23325';
  ctx.beginPath();
  ctx.moveTo(x + w - postW, y + 18);
  ctx.lineTo(x + w - postW + 30, y + 27);
  ctx.lineTo(x + w - postW, y + 36);
  ctx.closePath();
  ctx.fill();
}

// Hố rơi (state.holes) trước đây không có hình gì đại diện — nhân vật rơi
// xuống "hố vô hình" trông như bug. Vẽ 1 hố tối đơn giản đè lên dải đất để
// người chơi thấy rõ chỗ cần nhảy/lướt qua.
function drawHoles() {
  state.holes.forEach(hole => {
    const x = hole.x - state.cameraX;
    if (x + hole.w < -40 || x > VIEW_W + 40) return;
    const left = Math.round(x);
    const width = Math.round(hole.w);
    const gradient = ctx.createLinearGradient(0, GROUND_Y, 0, VIEW_H);
    gradient.addColorStop(0, '#120a06');
    gradient.addColorStop(1, '#000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(left, GROUND_Y, width, VIEW_H - GROUND_Y);
    // Viền mép hố để rõ ranh giới với cỏ xung quanh.
    ctx.fillStyle = 'rgba(0, 0, 0, .55)';
    ctx.fillRect(left, GROUND_Y, 4, VIEW_H - GROUND_Y);
    ctx.fillRect(left + width - 4, GROUND_Y, 4, VIEW_H - GROUND_Y);
  });
}

// Vẽ 1 khung của PNG strip ngang: ô thứ i nằm ở [i * cellW, 0, cellW, height].
// Khung chọn theo ĐỒNG HỒ CHUNG của game (`time`) cộng `offset` riêng từng vật,
// nhờ vậy hai con hổ cạnh nhau không chạy y hệt nhau mà không cần lưu timer.
function drawStripSprite(image, meta, x, y, width, height, time, offset = 0, alpha = 1) {
  const cellW = image.width / meta.frames;
  const frame = Math.floor(Math.max(0, (time + offset) * meta.fps)) % meta.frames;
  ctx.globalAlpha = alpha;
  ctx.drawImage(
    image,
    frame * cellW, 0, cellW, image.height,
    Math.round(x), Math.round(y), Math.round(width), Math.round(height)
  );
  ctx.globalAlpha = 1;
}

// Một `sprite` có thể là strip động (OBSTACLE_STRIP_FILES) hoặc PNG tĩnh
// (OBSTACLE_SPRITE_FILES) — hazard dùng chung một tên nên gom lựa chọn vào đây.
function drawHazardArt(sprite, x, y, width, height, time, offset = 0, alpha = 1, direction = -1) {
  const stripMeta = OBSTACLE_STRIP_FILES[sprite];
  const stripImage = stripMeta && images.obstacleStrips[sprite];
  // Lật ngang quanh tâm ô vẽ khi hướng mặt gốc của ảnh khác hướng cần quay.
  const naturalDirection = stripMeta?.facing === 'right' ? 1 : -1;
  const flip = direction !== naturalDirection;
  ctx.save();
  if (flip) {
    const centerX = Math.round(x + width / 2);
    ctx.translate(centerX, 0);
    ctx.scale(-1, 1);
    ctx.translate(-centerX, 0);
  }
  if (stripImage) {
    drawStripSprite(stripImage, stripMeta, x, y, width, height, time, offset, alpha);
    ctx.restore();
    return;
  }
  const staticImage = images.obstacleSprites[sprite];
  ctx.globalAlpha = alpha;
  if (staticImage) {
    ctx.drawImage(staticImage, Math.round(x), Math.round(y), Math.round(width), Math.round(height));
  } else {
    ctx.fillStyle = '#4a3020';
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

// Hướng cần quay (-1 trái / 1 phải): vật đang chạy quay theo hướng chạy; vật
// đứng yên có thể tấn công (lính, boss) quay về phía người chơi; còn lại (bẫy,
// tháp, xác xe, thuyền neo) giữ hướng trái mặc định.
function facingDirection(centerX, speed = 0, watchesPlayer = false) {
  if (speed !== 0) return Math.sign(speed);
  if (!watchesPlayer) return -1;
  const playerCenter = state.player.x + state.player.w / 2;
  return playerCenter > centerX ? 1 : -1;
}

function drawBooks(time) {
  const bookImage = images.items.book;
  state.books.forEach((book, index) => {
    if (book.collected) return;
    const x = book.x - state.cameraX;
    if (x < -60 || x > VIEW_W + 60) return;
    const y = book.y + Math.sin(time * 4 + index) * 5;
    ctx.fillStyle = 'rgba(255, 210, 80, .3)';
    ctx.beginPath();
    ctx.ellipse(Math.round(x), Math.round(y + 4), 26, 26, 0, 0, Math.PI * 2);
    ctx.fill();
    if (bookImage) {
      const w = 40;
      const h = w * (bookImage.height / bookImage.width);
      ctx.drawImage(bookImage, Math.round(x - w / 2), Math.round(y - h / 2), w, h);
    } else {
      ctx.fillStyle = '#f4d05c';
      ctx.fillRect(Math.round(x - 15), Math.round(y - 19), 30, 38);
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
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, y + obstacle.drawH - 3, obstacle.drawW * 0.48, 5, 0, 0, Math.PI * 2);
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
    if (x + obstacle.drawW < -80 || x > VIEW_W + 80) return;
    // Neo theo mặt đất thật tại vị trí vật cản và chìm nhẹ 7 px để phần trong
    // suốt ở đáy ô sprite không khiến chướng ngại vật trông như đang bay.
    const drawY = obstacle.groundY - obstacle.drawH + OBSTACLE_GROUND_SINK;
    drawObstacleContrastHalo(obstacle, x, drawY);
    drawObstacleSprite(obstacle.type, x, drawY, obstacle.drawW, obstacle.drawH);
  });
}

// Vật có trạng thái. Chia làm 2 lượt vẽ theo `grounded`:
//   submerged (thuyền, grounded = false) vẽ TRƯỚC drawHoles() để thân thuyền
//     chìm dưới lớp tối của khe sông — nếu vẽ sau, thuyền rộng hơn khe sẽ che
//     mất miệng hố và người chơi không thấy chỗ phải nhảy.
//   còn lại vẽ sau vật cản, trước enemy.
function drawHazards(time, submerged = false) {
  state.hazards.forEach((hazard, index) => {
    if (!hazard.alive) return;
    if (hazard.grounded === submerged) return;
    // Roller chưa được kích hoạt thì chưa xuất hiện trên màn — nó đang "chờ"
    // ngoài tầm nhìn, vẽ ra sẽ thành vật đứng im giữa đường.
    if (hazard.kind === 'roller' && !hazard.active) return;
    const drawX = hazard.x + hazard.w / 2 - hazard.drawW / 2 - state.cameraX;
    if (drawX + hazard.drawW < -100 || drawX > VIEW_W + 100) return;
    const size = HAZARD_SPRITE_SIZES[hazard.sprite] || {};
    let drawY;
    if (size.groundLine !== undefined) {
      // Sprite mặt cắt (hố chông): mép đất trong ảnh trùng mặt đất, phần dưới
      // chìm vào dải đất. Tô miệng hố tối trước để lòng hố không lộ cỏ/đất
      // của layer nền qua các khe trong suốt giữa hàng chông.
      drawY = hazard.baseY - hazard.drawH * size.groundLine;
      drawPitShadow(
        drawX + hazard.drawW * size.pitLeft,
        hazard.baseY,
        hazard.drawW * (size.pitRight - size.pitLeft)
      );
    } else {
      const sink = hazard.grounded ? OBSTACLE_GROUND_SINK : 0;
      drawY = hazard.baseY - hazard.drawH + sink;
    }
    drawHazardArt(
      hazard.sprite, drawX, drawY, hazard.drawW, hazard.drawH,
      time, hazard.animOffset + index * .07, hazard.hitTimer > 0 ? .45 : 1,
      facingDirection(hazard.x + hazard.w / 2, hazard.kind === 'roller' ? hazard.speed : 0, hazard.kind === 'thrower')
    );
    if (hazard.maxHp > 0 && hazard.hp > 0) drawHealthBar(drawX, drawY - 12, hazard.drawW, hazard.hp / hazard.maxHp, '#e2ad45');
  });
}

function drawProjectiles(time) {
  state.projectiles.forEach((projectile, index) => {
    const x = projectile.x + projectile.w / 2 - projectile.drawW / 2 - state.cameraX;
    if (x + projectile.drawW < -60 || x > VIEW_W + 60) return;
    const y = projectile.y + projectile.h / 2 - projectile.drawH / 2;
    const meta = ITEM_STRIP_FILES[projectile.sprite];
    const image = meta && images.itemStrips[projectile.sprite];
    if (!image) {
      ctx.fillStyle = '#e0b24a';
      ctx.fillRect(Math.round(x), Math.round(y), projectile.drawW, projectile.drawH);
      return;
    }
    ctx.save();
    // Đạn vẽ sẵn hướng sang TRÁI (theo spec), nên chỉ lật khi bay sang phải.
    if (projectile.direction > 0) {
      ctx.translate(Math.round(x + projectile.drawW / 2), 0);
      ctx.scale(-1, 1);
      ctx.translate(-Math.round(x + projectile.drawW / 2), 0);
    }
    drawStripSprite(image, meta, x, y, projectile.drawW, projectile.drawH, time, index * .05);
    ctx.restore();
  });
}

function drawPitShadow(left, top, width) {
  const gradient = ctx.createLinearGradient(0, top, 0, VIEW_H);
  gradient.addColorStop(0, '#2a1a0e');
  gradient.addColorStop(1, '#0c0704');
  ctx.fillStyle = gradient;
  ctx.fillRect(Math.round(left), Math.round(top), Math.round(width), Math.round(VIEW_H - top));
}

function drawHealthBar(x, y, width, ratio, color) {
  ctx.fillStyle = '#2b110d';
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(width), 6);
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x + 1), Math.round(y + 1), Math.round((width - 2) * ratio), 4);
}

function drawEnemies(time) {
  state.enemies.forEach((enemy, index) => {
    if (!enemy.alive) return;
    const x = enemy.x - state.cameraX;
    if (x + enemy.w < -80 || x > VIEW_W + 80) return;
    // Enemy giờ dùng PNG strip riêng (lính Hán / kỵ binh) thay cho atlas cũ.
    // Hitbox giữ nguyên, chỉ ô VẼ to hơn và neo theo đáy hitbox để sprite
    // không bị bóp méo theo khung va chạm.
    const art = ENEMY_SPRITES[enemy.boss ? 'boss' : 'normal'];
    const drawX = x + enemy.w / 2 - art.drawW / 2;
    const drawY = enemy.y + enemy.h - art.drawH;
    drawHazardArt(
      art.sprite, drawX, drawY, art.drawW, art.drawH,
      time, index * .13, enemy.hitTimer > 0 ? .45 : 1,
      facingDirection(enemy.x + enemy.w / 2, 0, true)
    );
    drawHealthBar(drawX, drawY - 12, art.drawW, enemy.hp / enemy.maxHp, enemy.boss ? '#e34c36' : '#e2ad45');
  });
}

function drawPlayer() {
  const p = state.player;
  const x = Math.round(p.x - state.cameraX);
  const y = Math.round(p.y);
  const blinkHidden = p.invulnerable > 0 && Math.floor(p.invulnerable * 12) % 2 === 0;

  // Thứ tự ưu tiên: trúng đòn > lướt > đánh > nhảy > chạy > đứng yên.
  // Dùng attackCooldown (.36s) chứ không phải attacking (.18s — chỉ là khung
  // gây sát thương) để cả cú vung kiếm kịp chạy hết, không bị cắt giữa chừng.
  const animationName =
    p.hurtTimer > 0 ? 'hurt'
      : p.dashing ? 'dash'
        : p.attackCooldown > 0 ? 'attack'
          : !p.grounded ? 'jump'
            : Math.abs(p.vx) > 1 ? 'run' : 'idle';
  const playerImage = images.player[animationName] || images.player.idle;
  if (playerSprite && playerImage) {
    // Để trình duyệt chạy GIF trực tiếp trong một phần tử HTML giống level-test.
    // Canvas chỉ còn vẽ map, vì vẽ GIF vào canvas có thể bị giữ ở khung đầu.
    // Chiều rộng ô vẽ suy ra từ tỉ lệ ảnh thật để không bao giờ méo; ô được đặt
    // sao cho điểm neo (đầu nhân vật) trùng tâm hitbox, và lật trái/phải cũng
    // xoay quanh đúng điểm neo đó.
    const aspect = playerImage.naturalHeight
      ? playerImage.naturalWidth / playerImage.naturalHeight
      : 1;
    const boxH = PLAYER_SPRITE_HEIGHT;
    const boxW = boxH * aspect;
    const drawX = x + p.w / 2 - boxW * PLAYER_SPRITE_ANCHOR_X;
    const footY = y + p.h;
    if (currentPlayerAnimation !== animationName) {
      const imageUrl = playerImage.currentSrc || playerImage.src;
      playerSprite.style.backgroundImage = `url(${JSON.stringify(imageUrl)})`;
      currentPlayerAnimation = animationName;
    }
    playerSprite.hidden = false;
    playerSprite.style.left = `${drawX / VIEW_W * 100}%`;
    playerSprite.style.bottom = `${(VIEW_H - footY) / VIEW_H * 100}%`;
    playerSprite.style.width = `${boxW / VIEW_W * 100}%`;
    playerSprite.style.height = `${boxH / VIEW_H * 100}%`;
    playerSprite.style.transformOrigin = `${PLAYER_SPRITE_ANCHOR_X * 100}% bottom`;
    playerSprite.style.transform = `scaleX(${p.facing < 0 ? -1 : 1})`;
    playerSprite.style.visibility = blinkHidden ? 'hidden' : 'visible';
    playerSprite.classList.toggle('is-dashing', p.dashing);
  } else {
    if (playerSprite) playerSprite.hidden = true;
    if (blinkHidden) return;
    // Placeholder canvas cho Trưng Trắc: tóc dài buộc sau, khăn đầu, giáp đỏ-vàng,
    // váy hình thang thay vì 2 ống quần — dùng tới khi có GIF nhân vật thật.
    ctx.save();
    ctx.translate(x + (p.facing < 0 ? p.w : 0), y);
    ctx.scale(p.facing, 1);

    const headTop = 2;
    const bodyTop = 18;
    const skirtTop = p.h - 24;
    const skirtBottom = p.h - 6;

    ctx.fillStyle = '#1c1108';
    ctx.fillRect(-4, headTop + 6, 10, 30);
    ctx.fillRect(10, headTop - 2, 20, 12);

    ctx.fillStyle = '#c98c61';
    ctx.fillRect(14, headTop, 16, 16);

    ctx.fillStyle = '#d2a33e';
    ctx.fillRect(13, headTop - 2, 18, 4);

    ctx.fillStyle = '#7a1f1f';
    ctx.fillRect(8, bodyTop, 28, Math.max(14, skirtTop - bodyTop));

    ctx.fillStyle = '#d2a33e';
    ctx.fillRect(8, bodyTop + 6, 28, 5);

    ctx.beginPath();
    ctx.moveTo(10, skirtTop);
    ctx.lineTo(32, skirtTop);
    ctx.lineTo(37, skirtBottom);
    ctx.lineTo(5, skirtBottom);
    ctx.closePath();
    ctx.fillStyle = '#8b2820';
    ctx.fill();

    ctx.fillStyle = '#2b1710';
    ctx.fillRect(6, skirtBottom, 12, p.h - skirtBottom);
    ctx.fillRect(24, skirtBottom, 12, p.h - skirtBottom);

    if (p.attacking) {
      ctx.fillStyle = '#d7d5c8';
      ctx.fillRect(35, bodyTop + 6, 42, 5);
      ctx.fillStyle = '#6c431f';
      ctx.fillRect(30, bodyTop + 4, 12, 9);
    }
    ctx.restore();
  }
}

function drawChunkMarker() {
  const chunk = Math.min(LEVEL_CHUNKS, Math.floor(state.player.x / CHUNK_W) + 1);
  ctx.fillStyle = 'rgba(24, 14, 9, .72)';
  ctx.fillRect(VIEW_W - 105, 12, 90, 28);
  ctx.fillStyle = '#ffe7a3';
  ctx.font = 'bold 15px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText(`${chunk} / ${LEVEL_CHUNKS}`, VIEW_W - 60, 32);
}

export function draw(time = 0) {
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  drawBackdrops();
  if (!state) return;
  drawLandmarks();
  drawHazards(time, true);
  drawHoles();
  drawBooks(time);
  drawObstacles();
  drawHazards(time);
  drawEnemies(time);
  drawProjectiles(time);
  drawPlayer();
  drawChunkMarker();
}
