// Toàn bộ vẽ canvas: nền parallax, landmark, obstacle, item, enemy, nhân vật, HUD in-canvas.

import { images } from './assets.js';
import { state } from './state.js';
import {
  VIEW_W, VIEW_H, CHUNK_W, LEVEL_CHUNKS, OBSTACLE_GROUND_SINK,
  PLAYER_FRAME_SIZE, PLAYER_JUMP_SCALE, BACKDROP_LAYERS, LANDMARKS, atlas
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
    const x = landmark.worldX - state.cameraX;
    if (x + landmark.w < -80 || x > VIEW_W + 80) return;
    const image = images.landmarkCache[landmark.file];
    if (image) ctx.drawImage(image, Math.round(x), Math.round(landmark.y), landmark.w, landmark.h);
  });
}

function drawAtlasSprite(name, x, y, width, height, alpha = 1) {
  const image = images.obstacles;
  if (!image) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#4a3020';
    ctx.fillRect(Math.round(x), Math.round(y), width, height);
    ctx.globalAlpha = 1;
    return;
  }
  const source = atlas[name];
  const cellW = image.width / 4;
  const cellH = image.height / 4;
  ctx.globalAlpha = alpha;
  ctx.drawImage(
    image,
    source.col * cellW, source.row * cellH, cellW, cellH,
    Math.round(x), Math.round(y), width, height
  );
  ctx.globalAlpha = 1;
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
  ctx.drawImage(image, Math.round(x), Math.round(y), width, height);
}

function drawObstacles() {
  state.obstacles.forEach(obstacle => {
    if (!obstacle.active) return;
    const x = obstacle.x - state.cameraX - (obstacle.drawW - obstacle.w) / 2;
    if (x + obstacle.drawW < -80 || x > VIEW_W + 80) return;
    // Neo theo mặt đất thật tại vị trí vật cản và chìm nhẹ 7 px để phần trong
    // suốt ở đáy ô sprite không khiến chướng ngại vật trông như đang bay.
    const drawY = obstacle.groundY - obstacle.drawH + OBSTACLE_GROUND_SINK;
    drawObstacleSprite(obstacle.type, x, drawY, obstacle.drawW, obstacle.drawH);
  });
}

function drawEnemies() {
  state.enemies.forEach(enemy => {
    if (!enemy.alive) return;
    const x = enemy.x - state.cameraX;
    if (x + enemy.w < -80 || x > VIEW_W + 80) return;
    drawAtlasSprite('hanGuards', x, enemy.y, enemy.w, enemy.h, enemy.hitTimer > 0 ? .45 : 1);
    ctx.fillStyle = '#2b110d';
    ctx.fillRect(Math.round(x), Math.round(enemy.y - 12), enemy.w, 6);
    ctx.fillStyle = enemy.boss ? '#e34c36' : '#e2ad45';
    ctx.fillRect(Math.round(x + 1), Math.round(enemy.y - 11), (enemy.w - 2) * enemy.hp / enemy.maxHp, 4);
  });
}

function drawPlayer() {
  const p = state.player;
  const x = Math.round(p.x - state.cameraX);
  const y = Math.round(p.y);
  const blinkHidden = p.invulnerable > 0 && Math.floor(p.invulnerable * 12) % 2 === 0;

  const animationName = p.dashing ? 'dash' : !p.grounded ? 'jump' : Math.abs(p.vx) > 1 ? 'run' : 'idle';
  const playerImage = images.player[animationName] || images.player.idle;
  if (playerSprite && playerImage) {
    // Để trình duyệt chạy GIF trực tiếp trong một phần tử HTML giống level-test.
    // Canvas chỉ còn vẽ map, vì vẽ GIF vào canvas có thể bị giữ ở khung đầu.
    const scale = animationName === 'jump' ? PLAYER_JUMP_SCALE : 1;
    const drawX = x + p.w / 2 - PLAYER_FRAME_SIZE / 2;
    const footY = y + p.h;
    if (currentPlayerAnimation !== animationName) {
      const imageUrl = playerImage.currentSrc || playerImage.src;
      playerSprite.style.backgroundImage = `url(${JSON.stringify(imageUrl)})`;
      currentPlayerAnimation = animationName;
    }
    playerSprite.hidden = false;
    playerSprite.style.left = `${drawX / VIEW_W * 100}%`;
    playerSprite.style.bottom = `${(VIEW_H - footY) / VIEW_H * 100}%`;
    playerSprite.style.width = `${PLAYER_FRAME_SIZE / VIEW_W * 100}%`;
    playerSprite.style.height = `${PLAYER_FRAME_SIZE / VIEW_H * 100}%`;
    playerSprite.style.transform = `scaleX(${p.facing < 0 ? -1 : 1}) scale(${scale})`;
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
  drawBooks(time);
  drawObstacles();
  drawEnemies();
  drawPlayer();
  drawChunkMarker();
}
