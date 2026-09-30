// Hàm hình học/vật lý thuần — không phụ thuộc state hay DOM. Ngoại lệ duy
// nhất: địa hình của màn đang chơi (`terrain`, đặt bằng setTerrain() lúc tạo
// state) — giống registry manifest của animation.js.

import {
  CHUNK_W, GROUND_Y, TERRAIN_CELL, TERRAIN_MAX_STEP, OBSTACLE_TYPES,
  HAZARD_SPRITES, PROJECTILE_SPRITES
} from './config.js';
import { createAnim } from './animation.js';

export function worldX(chunkNumber, localX) {
  return (chunkNumber - 1) * CHUNK_W + localX;
}

// ---- Địa hình ô vuông (TT-TERRAIN-01) ----
// `levels[column]` = số ô đất nhô trên GROUND_Y của cột (0 = mặt đất thường,
// -1 = hố). null = màn phẳng (màn 3, layout thử).
let terrain = null;

export function setTerrain(next) {
  terrain = next;
}

const COLUMNS_PER_CHUNK = CHUNK_W / TERRAIN_CELL;

// Lưới chữ -> độ cao từng cột. `placements` = [{ chunk, rows, shift }]: rows
// là các hàng COLUMNS_PER_CHUNK ký tự của 1 chunk (trên xuống dưới, hàng cuối
// = GROUND_Y), shift = dịch ngang theo số ô (nhóm vật cản màn 1 lệch ngẫu
// nhiên). Độ cao cột = số '#' liền nhau tính từ hàng cuối; '#' lơ lửng phía
// trên khoảng trống bị bỏ + cảnh báo. Chunk không khai báo = phẳng.
export function buildTerrain(placements, chunks) {
  const levels = new Int8Array(chunks * COLUMNS_PER_CHUNK);
  placements.forEach(({ chunk, rows, shift = 0 }) => {
    rows.forEach(row => {
      if (row.length !== COLUMNS_PER_CHUNK) console.warn(`terrain chunk ${chunk}: hàng dài ${row.length} ô, cần ${COLUMNS_PER_CHUNK}`, row);
    });
    for (let col = 0; col < COLUMNS_PER_CHUNK; col++) {
      let height = 0;
      while (height < rows.length && rows[rows.length - 1 - height][col] === '#') height++;
      if (rows.slice(0, rows.length - height).some(row => row[col] === '#')) {
        console.warn(`terrain chunk ${chunk} cột ${col}: ô '#' lơ lửng — chỉ hỗ trợ đất liền từ đáy lên, bỏ qua.`);
      }
      const target = col + shift;
      if (target < 0 || target >= COLUMNS_PER_CHUNK) continue;
      levels[(chunk - 1) * COLUMNS_PER_CHUNK + target] = height - 1;
    }
  });
  for (let col = 1; col < levels.length; col++) {
    const step = Math.abs(Math.max(levels[col], 0) - Math.max(levels[col - 1], 0));
    if (step > TERRAIN_MAX_STEP) console.warn(`terrain x=${col * TERRAIN_CELL}: bậc chênh ${step} ô > ${TERRAIN_MAX_STEP}`);
  }
  return { levels };
}

// Độ cao (số ô) của cột chứa x; -1 = hố. Màn phẳng / ngoài màn -> 0.
export function terrainLevelAt(worldXPosition) {
  if (!terrain) return 0;
  return terrain.levels[Math.floor(worldXPosition / TERRAIN_CELL)] ?? 0;
}

// Các hố của địa hình (chuỗi cột -1 liền nhau) dạng { x, w } như state.holes.
export function terrainHoles() {
  const holes = [];
  if (!terrain) return holes;
  terrain.levels.forEach((level, col) => {
    if (level >= 0) return;
    const last = holes[holes.length - 1];
    if (last && last.x + last.w === col * TERRAIN_CELL) last.w += TERRAIN_CELL;
    else holes.push({ x: col * TERRAIN_CELL, w: TERRAIN_CELL });
  });
  return holes;
}

// Đoạn đất phẳng [x0, x1) chứa x (cùng độ cao, không hố) — kẹp đoạn tuần tra
// của lính để lính không đi xuyên bậc đất.
export function flatSpan(worldXPosition) {
  if (!terrain) return [-Infinity, Infinity];
  const { levels } = terrain;
  const col = Math.floor(worldXPosition / TERRAIN_CELL);
  const level = levels[col];
  let first = col;
  let last = col;
  while (first > 0 && levels[first - 1] === level) first--;
  while (last < levels.length - 1 && levels[last + 1] === level) last++;
  return [
    first === 0 ? -Infinity : first * TERRAIN_CELL,
    last === levels.length - 1 ? Infinity : (last + 1) * TERRAIN_CELL
  ];
}

// Mặt đất (đỉnh cột địa hình) tại x. Hố vẫn trả GROUND_Y — hố xử lý riêng
// qua state.holes / pointHasGround.
export function groundYAt(worldXPosition) {
  return GROUND_Y - Math.max(0, terrainLevelAt(worldXPosition)) * TERRAIN_CELL;
}

export function aabb(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// Vật cản tĩnh: `localX` là MÉP TRÁI hitbox; width/height là hitbox (px logic).
// Neo theo OBSTACLE_TYPES[type].anchor: 'bottom' đứng trên mặt đất, 'overhead'
// là thanh 20px ở groundY - 46 (khe dash 26px), 'top' là mặt trên ở groundY
// (cầu). Cách vẽ (ảnh x1, căn phần nhìn thấy trùng hitbox) nằm ở render.js.
export function makeObstacle(type, chunk, localX, width, height, options = {}) {
  const spec = OBSTACLE_TYPES[type] || {};
  const anchor = options.overhead ? 'overhead' : (spec.anchor || 'bottom');
  const overhead = anchor === 'overhead';
  const groundY = options.groundY || groundYAt(worldX(chunk, localX) + width / 2);
  const y = overhead ? groundY - 46 : (anchor === 'top' ? groundY : groundY - height);
  return {
    type,
    x: worldX(chunk, localX),
    y,
    w: width,
    h: overhead ? 20 : height,
    groundY,
    groundSink: options.groundSink ?? spec.groundSink ?? 0,
    harmful: Boolean(options.harmful),
    overhead,
    requiresDash: options.requiresDash ?? overhead,
    requiresHole: Boolean(spec.requiresHole),
    active: true
  };
}

// Hazard = vật cản/kẻ địch CÓ TRẠNG THÁI (di chuyển, bắn đạn, bật bẫy) — khác
// `obstacles` vốn là vật tĩnh thuần. Khác obstacle ở một điểm nữa: `localX` là
// TÂM vật (= pivot bottom-center của sprite 8-bit) chứ không phải mép trái.
export function makeHazard(kind, sprite, chunk, localX, options = {}) {
  const size = HAZARD_SPRITES[sprite];
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
    baseY,
    // Vật nổi/bay không chìm xuống đất như vật đứng trên mặt đất.
    grounded: !options.floatY,
    speed: options.speed || 0,
    // Hướng chạy cố định (-1/1) của vật có tốc độ — render giữ hướng này cả
    // khi vật đã dừng lại để phát animation chết.
    facing: options.speed ? Math.sign(options.speed) : 0,
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
    // Hết máu: alive = false ngay (tắt va chạm), dying = true trong lúc phát
    // animation death/break một lần, xong thì xoá khỏi state.
    dying: false,
    sprung: false,
    projectile: options.projectile || null,
    fireInterval: options.fireInterval ?? 1.8,
    fireRange: options.fireRange ?? 258,
    fireTimer: options.fireDelay ?? 0.9,
    // Hành động đang diễn (ném/báo động): { name, time, released } hoặc null.
    action: null,
    // Animation đang phát { name: trạng thái trong HAZARD_SPRITES.anims, time }.
    anim: createAnim(kind === 'roller' ? 'move' : 'idle')
  };
}

export function makeProjectile(sprite, x, y, direction) {
  const size = PROJECTILE_SPRITES[sprite];
  return {
    sprite,
    x: x - size.w / 2,
    y: y - size.h / 2,
    w: size.w,
    h: size.h,
    direction,
    traveled: 0,
    // Giây đã bay — đồng hồ riêng cho animation lặp của đạn.
    age: 0,
    alive: true
  };
}
