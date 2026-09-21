// Hàm hình học/vật lý thuần — không phụ thuộc state hay DOM.

import {
  CHUNK_W, GROUND_Y, TERRAIN_RAMPS,
  HAZARD_SPRITE_SIZES, PROJECTILE_SIZES
} from './config.js';

export function worldX(chunkNumber, localX) {
  return (chunkNumber - 1) * CHUNK_W + localX;
}

export function groundYAt(worldXPosition) {
  const segment = TERRAIN_RAMPS.find(item => worldXPosition >= item.x1 && worldXPosition <= item.x2);
  if (!segment) return GROUND_Y;
  const t = (worldXPosition - segment.x1) / (segment.x2 - segment.x1);
  return segment.y1 + (segment.y2 - segment.y1) * t;
}

export function aabb(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function makeObstacle(type, chunk, localX, width, height, options = {}) {
  const drawScale = options.drawScale || 1.65;
  const groundY = options.groundY || groundYAt(worldX(chunk, localX) + width / 2);
  return {
    type,
    x: worldX(chunk, localX),
    y: options.overhead ? groundY - 77 : groundY - height,
    w: width,
    h: options.overhead ? 34 : height,
    drawW: Math.round(width * drawScale),
    drawH: Math.round(height * drawScale),
    groundY,
    harmful: Boolean(options.harmful),
    overhead: Boolean(options.overhead),
    requiresDash: options.requiresDash ?? Boolean(options.overhead),
    active: true
  };
}

// Hazard = vật cản/kẻ địch CÓ TRẠNG THÁI (di chuyển, bắn đạn, bật bẫy) — khác
// `obstacles` vốn là vật tĩnh thuần. Khác obstacle ở một điểm nữa: `localX` là
// TÂM vật chứ không phải mép trái, vì bẫy đổi sprite giữa chừng (cỏ -> hố chông)
// và xe vỡ có cỡ khác xe lành, neo theo tâm thì vật không bị "trượt" khi đổi.
export function makeHazard(kind, sprite, chunk, localX, options = {}) {
  const size = HAZARD_SPRITE_SIZES[sprite];
  const centerX = worldX(chunk, localX);
  // floatY > 0: vật nổi trên nước (thuyền) nên đáy nằm DƯỚI mặt đất.
  const baseY = (options.groundY ?? groundYAt(centerX)) + (options.floatY || 0);
  const hp = options.hp ?? 0;
  return {
    kind,
    sprite,
    id: options.id || `${sprite}-${chunk}-${localX}`,
    x: centerX - size.w / 2,
    y: baseY - size.h,
    w: size.w,
    h: size.h,
    drawW: size.drawW,
    drawH: size.drawH,
    baseY,
    // Vật nổi/bay không chìm xuống đất như vật đứng trên mặt đất.
    grounded: !options.floatY,
    speed: options.speed || 0,
    // Roller nằm chờ tới khi người chơi vượt triggerX (hoặc tới khi có báo
    // động); các loại khác hoạt động ngay khi vào tầm nhìn.
    active: options.active ?? (kind !== 'roller'),
    triggerX: options.triggerX ?? null,
    triggerDistance: options.triggerDistance ?? 0,
    alarmFor: options.alarmFor || null,
    alarmed: false,
    harmful: options.harmful ?? (kind !== 'prop'),
    hp,
    maxHp: hp,
    hitTimer: 0,
    alive: true,
    sprungSprite: options.sprungSprite || null,
    sprung: false,
    wreckSprite: options.wreckSprite || null,
    projectile: options.projectile || null,
    fireInterval: options.fireInterval ?? 1.8,
    fireRange: options.fireRange ?? 430,
    fireTimer: options.fireDelay ?? 0.9,
    animOffset: options.animOffset ?? 0
  };
}

// Đổi sprite của hazard tại chỗ (bẫy bật lên, xe cống vỡ tan) — giữ nguyên TÂM
// ngang và đáy chạm đất để vật mới không nhảy vị trí so với vật cũ.
export function reskinHazard(hazard, sprite) {
  const size = HAZARD_SPRITE_SIZES[sprite];
  const centerX = hazard.x + hazard.w / 2;
  hazard.sprite = sprite;
  hazard.w = size.w;
  hazard.h = size.h;
  hazard.drawW = size.drawW;
  hazard.drawH = size.drawH;
  hazard.x = centerX - size.w / 2;
  hazard.y = hazard.baseY - size.h;
  return hazard;
}

export function makeProjectile(sprite, x, y, direction) {
  const size = PROJECTILE_SIZES[sprite];
  return {
    sprite,
    x: x - size.w / 2,
    y: y - size.h / 2,
    w: size.w,
    h: size.h,
    drawW: size.drawW,
    drawH: size.drawH,
    direction,
    alive: true
  };
}
