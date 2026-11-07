// Hàm hình học/vật lý thuần — không phụ thuộc state hay DOM. Ngoại lệ duy
// nhất: địa hình của màn đang chơi (`terrain`, đặt bằng setTerrain() lúc tạo
// state) — giống registry manifest của animation.js.

import { CHUNK_W, GROUND_Y, TERRAIN_CELL, TERRAIN_MAX_STEP } from './config.js';
import { CHAPTER } from './chapter.js';
import { createAnim } from './animation.js';

export function worldX(chunkNumber, localX) {
  return (chunkNumber - 1) * CHUNK_W + localX;
}

// ---- Địa hình ô vuông (TT-TERRAIN-01) ----
// `levels[column]` = số ô đất nhô trên GROUND_Y của cột (0 = mặt đất thường,
// -1 = hố). null = màn phẳng (đấu trường, layout thử).
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
// '~' ở hàng cuối = cột NƯỚC (sông — LND-ENGINE E1): hố có cờ nước, rơi xuống
// thì hiện lại ở chỗ đứng vững cuối cùng (damage.js respawnAfterFall).
// '=' ở hàng cuối = cột SÌNH (TQP-ENGINE E1): đất đi được, cao bằng mặt đất,
// làm chậm + lún người chơi (player.js) — dải sình: terrainMud() / inMud().
export function buildTerrain(placements, chunks) {
  const levels = new Int8Array(chunks * COLUMNS_PER_CHUNK);
  const water = new Uint8Array(chunks * COLUMNS_PER_CHUNK);
  const mud = new Uint8Array(chunks * COLUMNS_PER_CHUNK);
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
      const bottom = rows[rows.length - 1][col];
      // Cột sình: không có '#' nhưng vẫn là mặt đất (level 0).
      levels[(chunk - 1) * COLUMNS_PER_CHUNK + target] = bottom === '=' ? 0 : height - 1;
      water[(chunk - 1) * COLUMNS_PER_CHUNK + target] = bottom === '~' ? 1 : 0;
      mud[(chunk - 1) * COLUMNS_PER_CHUNK + target] = bottom === '=' ? 1 : 0;
    }
  });
  for (let col = 1; col < levels.length; col++) {
    const step = Math.abs(Math.max(levels[col], 0) - Math.max(levels[col - 1], 0));
    if (step > TERRAIN_MAX_STEP) console.warn(`terrain x=${col * TERRAIN_CELL}: bậc chênh ${step} ô > ${TERRAIN_MAX_STEP}`);
  }
  return { levels, water, mud };
}

// Độ cao (số ô) của cột chứa x; -1 = hố. Màn phẳng / ngoài màn -> 0.
export function terrainLevelAt(worldXPosition) {
  if (!terrain) return 0;
  return terrain.levels[Math.floor(worldXPosition / TERRAIN_CELL)] ?? 0;
}

// Các hố của địa hình (chuỗi cột -1 liền nhau, cùng loại) dạng { x, w, water }
// như state.holes; `water` = khe sông (cột '~').
export function terrainHoles() {
  const holes = [];
  if (!terrain) return holes;
  terrain.levels.forEach((level, col) => {
    if (level >= 0) return;
    const water = Boolean(terrain.water?.[col]);
    const last = holes[holes.length - 1];
    if (last && last.x + last.w === col * TERRAIN_CELL && last.water === water) last.w += TERRAIN_CELL;
    else holes.push({ x: col * TERRAIN_CELL, w: TERRAIN_CELL, water });
  });
  return holes;
}

// Dải sình (TQP-ENGINE E1): chuỗi cột '=' liền nhau dạng { x, w } -> state.mud.
export function terrainMud() {
  const spans = [];
  if (!terrain?.mud) return spans;
  terrain.mud.forEach((flag, col) => {
    if (!flag) return;
    const last = spans[spans.length - 1];
    if (last && last.x + last.w === col * TERRAIN_CELL) last.w += TERRAIN_CELL;
    else spans.push({ x: col * TERRAIN_CELL, w: TERRAIN_CELL });
  });
  return spans;
}

// x nằm trên cột sình? Dùng cho người chơi và chương (boss lao vào sình thì kẹt).
export function inMud(worldXPosition) {
  if (!terrain?.mud) return false;
  return Boolean(terrain.mud[Math.floor(worldXPosition / TERRAIN_CELL)]);
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
// Neo theo CHAPTER.sprites.obstacles[type].anchor: 'bottom' đứng trên mặt đất, 'overhead'
// là thanh 20px ở groundY - 46 (khe dash 26px), 'top' là mặt trên ở groundY
// (cầu). Cách vẽ (ảnh x1, căn phần nhìn thấy trùng hitbox) nằm ở render/entities.js.
export function makeObstacle(type, chunk, localX, width, height, options = {}) {
  const spec = CHAPTER.sprites.obstacles[type] || {};
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
// TÂM vật (= pivot bottom-center của sprite) chứ không phải mép trái.
export function makeHazard(kind, sprite, chunk, localX, options = {}) {
  const size = CHAPTER.sprites.hazards[sprite];
  const centerX = worldX(chunk, localX);
  // floatY > 0: vật nổi trên nước (thuyền) nên đáy nằm DƯỚI mặt đất.
  const groundY = (options.groundY ?? groundYAt(centerX)) + (options.floatY || 0);
  // Bẫy rơi (`snare` — LND-ENGINE E3) treo cao `dropHeight` px trên mặt đất.
  // Khói trôi (`drift` — TQP-ENGINE E2) làn `high` lơ lửng `lanes.high` px.
  const lift = kind === 'snare' ? options.dropHeight ?? 80
    : kind === 'drift' ? size.lanes?.[options.lane || 'low'] ?? (options.lane === 'high' ? 24 : 0) : 0;
  const baseY = groundY - lift;
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
    // Snare chỉ gây sát thương lúc rơi (hazards.js tự xử lý, không qua va chạm chung).
    harmful: options.harmful ?? (kind !== 'prop' && kind !== 'snare' && kind !== 'drift' && kind !== 'lurker' && kind !== 'pounce'),
    hp,
    maxHp: hp,
    hitTimer: 0,
    alive: true,
    // Hết máu: alive = false ngay (tắt va chạm), dying = true trong lúc phát
    // animation death/break một lần, xong thì xoá khỏi state.
    dying: false,
    sprung: false,
    // Snare (LND-ENGINE E3): mặt đất nơi vật rơi xuống, bề ngang công tắc ẩn
    // (quanh tâm), trạng thái idle -> warn -> fall -> landed, vận tốc rơi.
    floorY: groundY,
    triggerWidth: options.triggerWidth ?? 32,
    snareState: 'idle',
    snareTimer: 0,
    vy: 0,
    // Vent (BT-ENGINE E8): giây lệch nhịp ban đầu / đồng hồ chu kỳ; trạng thái phun.
    phase: options.phase ?? 0,
    ventState: 'off',
    // Drift (TQP-ENGINE E2 — khói trôi ngang): vào `triggerRange` thì trôi từ
    // `originX` (mép trái lúc xuất phát) với `speed` hết quãng `travel` px, chờ
    // `gap` giây rồi trôi lại. wait -> move -> gap. `invisible` = không vẽ.
    // Lurker (E3 — cá sấu): hidden -> warn -> attack -> dive -> hidden, nghỉ `rest`.
    triggerRange: options.triggerRange ?? 260,
    originX: centerX - size.w / 2,
    travel: options.travel ?? 320,
    gap: options.gap ?? 1.5,
    traveled: 0,
    driftState: 'wait',
    lurkState: 'hidden',
    rest: options.rest ?? 1.5,
    restTimer: 0,
    lurkTimer: 0,
    // Hazard đang ẩn: không chém/bổ được (E3) — undefined = như cũ.
    exposed: kind === 'lurker' || kind === 'pounce' ? false : undefined,
    invisible: kind === 'drift' || kind === 'lurker' || kind === 'pounce',
    // Pounce (MHD-ENGINE E2 — hổ vồ): hidden -> warn -> leap -> recover -> leap...
    // `span` = [minX, maxX] kẹp điểm rơi (tâm); null = không kẹp.
    pounceState: 'hidden',
    pounceTimer: 0,
    span: options.span ?? null,
    // Số người được thả khi hazard bị phá (MHD-ENGINE E5).
    frees: options.frees ?? 0,
    // Gọi viện (E4 — thuyền tuần tiễu): { after, range, spawnAt: [worldX], enemy: { art, w, h, hp } }.
    callHelp: options.callHelp || null,
    helpTimer: 0,
    helpCalled: false,
    projectile: options.projectile || null,
    // Nhắm đạn vào thân người chơi lúc nhả (LND-ENGINE E2); false = bắn ngang.
    aim: Boolean(options.aim),
    fireInterval: options.fireInterval ?? 1.8,
    fireRange: options.fireRange ?? 258,
    fireTimer: options.fireDelay ?? 0.9,
    // Hành động đang diễn (ném/báo động): { name, time, released } hoặc null.
    action: null,
    // Animation đang phát { name: trạng thái trong sprites.hazards[sprite].anims, time }.
    anim: createAnim(kind === 'roller' ? 'move' : 'idle')
  };
}

// Đạn bay ngang theo `direction` (-1/1); có `aim` = { x, y } (LND-ENGINE E2)
// thì bay thẳng tới điểm đó: vector đơn vị (vx, vy), `angle` để render xoay ảnh.
export function makeProjectile(sprite, x, y, direction, aim = null) {
  const size = CHAPTER.sprites.projectiles[sprite];
  const length = aim ? Math.hypot(aim.x - x, aim.y - y) : 0;
  const vx = length ? (aim.x - x) / length : direction;
  const vy = length ? (aim.y - y) / length : 0;
  return {
    sprite,
    x: x - size.w / 2,
    y: y - size.h / 2,
    w: size.w,
    h: size.h,
    direction: Math.sign(vx) || direction,
    vx,
    vy,
    // Góc bay (radian) — 0 với đạn ngang (render không xoay).
    angle: vy ? Math.atan2(vy, vx) : 0,
    traveled: 0,
    // Giây đã bay — đồng hồ riêng cho animation lặp của đạn.
    age: 0,
    alive: true
  };
}
