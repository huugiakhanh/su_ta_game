// Mặt đất: tileset mặt đất của chương, ghép tile địa hình tự động (bậc đất,
// mép hố — TT-TERRAIN-01), lòng hố, lớp F2 vai trò tile.

import { images } from '../assets.js';
import { state } from '../state.js';
import { groundYAt, terrainLevelAt } from '../geometry.js';
import { VIEW_W, VIEW_H, GROUND_Y, TERRAIN_CELL, GROUND_FALLBACK_COLOR, GROUND_DECOR_DENSITY } from '../config.js';
import { CHAPTER } from '../chapter.js';
import { ctx, drawMapImage } from './canvas.js';

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

// Mặt đất dùng CHUNG 1 bộ tile cho mọi vùng/màn (CHAPTER.tiles.groundRegion) và chỉ
// tile ĐẦU TIÊN của mỗi vai trò — không đổi biến thể theo cột, không đổi theo
// vùng (team 30/09). Decor vẫn rải tất định theo cột (tileHash).
function groundRegion(tileset) {
  return tileset.regions[CHAPTER.tiles.groundRegion] || null;
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

export function drawTerrainDebug() {
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

export function drawGround() {
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

export function drawHoles() {
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
