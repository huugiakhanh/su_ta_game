// Người chơi (nhân vật nam/nữ dùng chung mọi chương — TT-HERO-01): điều khiển,
// trọng lực, đứng trên đất/bậc/vật cản, rơi hố, lướt, đánh, animation.

import { state } from './state.js';
import { keys, pressed } from './input.js';
import { aabb, groundYAt, terrainLevelAt, inMud } from './geometry.js';
import { setAnim, tickAnim, getAnimMeta, hitTime } from './animation.js';
import {
  FOOT_MARGIN, TERRAIN_CELL, GROUND_Y, MOVE_SPEED, GRAVITY, JUMP_FORCE, DASH_SPEED, DASH_TIME, DASH_COOLDOWN,
  GROUND_SNAP_DISTANCE, ATTACK_COOLDOWN, ATTACK_ACTIVE_TIME, PLAYER_SPRITE_ID, PLAYER_ANIMATIONS, RESPAWN_EDGE_MARGIN,
  MUD, STEALTH, PLUNGE, BURDEN, CHARGE, MOUNT_AWAY_TIME
} from './config.js';
import { CHAPTER, LEVEL } from './chapter.js';
import { playSfx } from './audio.js';
import { hurtPlayer } from './damage.js';
import {
  spearBox, strike, strikeEnemy, strikeHazard, playerStrike, attackDamage, plungeOnly, chargeOnly, revealCarriedItems
} from './combat.js';
import { throwCarried } from './carry.js';
import { showMessage } from './ui.js';
import { platformActive } from './entities.js';

export function pointHasGround(worldXPosition) {
  return !state.holes.some(hole => worldXPosition > hole.x && worldXPosition < hole.x + hole.w);
}

// Mặt đất dưới chân: bậc CAO nhất mà 1 trong 2 chân còn chạm (đứng mép bậc
// đất vẫn đứng được, chỉ rơi khi cả 2 chân ra khỏi bậc — TT-TERRAIN-01).
export function playerGroundY(player) {
  const leftFoot = player.x + FOOT_MARGIN;
  const rightFoot = player.x + player.w - FOOT_MARGIN;
  const samples = [];

  if (pointHasGround(leftFoot)) samples.push(groundYAt(leftFoot));
  if (pointHasGround(rightFoot)) samples.push(groundYAt(rightFoot));
  if (!samples.length) return null;
  return Math.min(...samples);
}

// Sườn bậc đất (TT-TERRAIN-01): cột đất mà đỉnh cao hơn chân ở frame trước
// quá GROUND_SNAP_DISTANCE là tường — đẩy người chơi ra mép cột, không mất
// máu (như cột đá). Cột vừa tới đỉnh (đang tiếp đất từ trên xuống) không tính.
// Chỉ xét cột nhô cao (level ≥ 1); vách hố vẫn do phần kẹp hố xử lý.
function resolveTerrainWalls(p, previousBottom) {
  const feet = [p.x + FOOT_MARGIN, p.x + p.w - FOOT_MARGIN];
  for (const foot of feet) {
    if (terrainLevelAt(foot) < 1) continue;
    const top = groundYAt(foot);
    if (previousBottom <= top + GROUND_SNAP_DISTANCE) continue;
    const left = Math.floor(foot / TERRAIN_CELL) * TERRAIN_CELL;
    // Chân phải dừng NGAY TRƯỚC cột (−0.01: floor(x/ô) phải rơi vào cột thấp).
    if (left + TERRAIN_CELL / 2 > p.x + p.w / 2) p.x = left - p.w + FOOT_MARGIN - .01;
    else p.x = left + TERRAIN_CELL - FOOT_MARGIN;
    p.vx = 0;
    return;
  }
}

// Bục một chiều (BT-ENGINE E6): tiếp đất khi đang rơi/đứng (vy ≥ 0), một
// trong 2 chân nằm trên bục, chân frame trước chưa xuống quá mặt bục
// GROUND_SNAP_DISTANCE (nhảy từ dưới lên / đi ngang thì xuyên qua). Chọn bục
// CAO nhất thoả điều kiện. Trả về bục hoặc null.
function landingPlatform(p, previousBottom) {
  if (p.vy < 0) return null;
  const feetY = p.y + p.h;
  const left = p.x + FOOT_MARGIN;
  const right = p.x + p.w - FOOT_MARGIN;
  let best = null;
  state.platforms.forEach(platform => {
    if (!platformActive(platform)) return;
    if (right < platform.x || left > platform.x + platform.w) return;
    if (feetY < platform.y || previousBottom > platform.y + GROUND_SNAP_DISTANCE) return;
    if (!best || platform.y < best.y) best = platform;
  });
  return best;
}

// Chỗ đứng vững cuối cùng (LND-ENGINE E1 — rơi sông thì hiện lại ở đây):
// đứng trên đất hoặc bục TĨNH (không phải lưng hazard), đất/bục trải đủ
// RESPAWN_EDGE_MARGIN quanh tâm để không hiện lại sát mép khe. Bục hẹp (mỏm
// đá) chỉ cần tâm nằm trong nửa giữa bục.
function rememberSafeSpot(p) {
  if (!p.grounded || p.platform?.attached) return;
  const center = p.x + p.w / 2;
  const reach = p.w / 2 + RESPAWN_EDGE_MARGIN;
  const inset = p.platform ? Math.min(reach, p.platform.w / 4) : 0;
  const safe = p.platform
    ? p.platform.x + inset <= center && p.platform.x + p.platform.w - inset >= center
    : pointHasGround(center - reach) && pointHasGround(center + reach) && !state.holes.some(hole =>
      hole.x < center + reach && hole.x + hole.w > center - reach);
  if (safe) p.safeSpot = { x: p.x, feetY: p.y + p.h };
}

// Lún sình (TQP-ENGINE E1): ở trong sình cộng dồn `p.mudTime` (ra khỏi sình
// thì về 0), hình chìm dần `p.mudSink` px; đủ `limit` giây -> −1 máu, bật ra.
function updateMudSink(p, dt, mud) {
  if (!p.grounded || !inMud(p.x + p.w / 2)) {
    p.mudTime = 0;
    p.mudSink = 0;
    return;
  }
  p.mudTime = (p.mudTime || 0) + dt;
  p.mudSink = Math.min(mud.sink, mud.sink * p.mudTime / mud.limit);
  if (p.mudTime < mud.limit) return;
  p.mudTime = 0;
  p.mudSink = 0;
  hurtPlayer(CHAPTER.text.mudSunk || CHAPTER.text.hazardHit);
  // Đẩy ra mép dải sình gần nhất (phím đi đè vận tốc đẩy lùi của hurtPlayer
  // nên đặt thẳng vị trí), bật nhẹ lên.
  const center = p.x + p.w / 2;
  const span = state.mud.find(item => center >= item.x && center <= item.x + item.w);
  if (span) {
    const toLeft = center - span.x <= span.x + span.w - center;
    p.x = toLeft ? span.x - p.w - 2 : span.x + span.w + 2;
  }
  p.vy = -JUMP_FORCE * .45;
}

export function startAttack() {
  const p = state.player;
  if (p.attackCooldown > 0) return;
  playSfx('swing');
  // Đánh úp (TQP-ENGINE E7) xét lúc BẮT ĐẦU vung: lính chưa phát hiện + đang
  // quay lưng về người chơi. Đánh trong vùng ẩn nấp thì lộ.
  p.ambushTargets = ambushTargets(p);
  p.revealTimer = STEALTH.reveal;
  // Bấm đánh chỉ bắt đầu cú vung; sát thương tính ở updateAttack() khi
  // animation tới ô hit_frame (không còn gây sát thương ngay lúc bấm).
  p.attackCooldown = ATTACK_COOLDOWN;
  p.throwSwing = false;
  p.chargedSwing = false;
  p.attackHits = new Set();
  // Kỹ năng của chương chém cùng lúc với người chơi (Trưng Trắc: bóng Trưng Nhị).
  if (state.skills) CHAPTER.skills.onAttackStart?.();
}

// Thông số đòn gồng của chương (PH-ENGINE E1) hoặc null nếu chương không bật.
function chargeSpec() {
  return CHAPTER.charge ? { ...CHARGE, ...CHAPTER.charge } : null;
}

function cancelCharge(p) {
  p.chargeTime = 0;
  p.charged = false;
}

// Đòn gồng: giữ Đánh trên đất (bấm vẫn chém ngay như thường), đủ `hold` giây rồi
// thả thì tung đòn. Nhảy, lướt, trúng đòn... thì huỷ và phải thả phím mới tích lại.
function updateCharge(p, dt) {
  const spec = chargeSpec();
  if (!spec) return;
  if (!keys.attack) {
    const ready = p.charged;
    cancelCharge(p);
    p.chargeBlocked = false;
    if (ready) startChargedAttack(p);
    return;
  }
  if (p.chargeBlocked) return;
  if (!p.grounded || p.dashing || p.burden || p.carrying || p.mounted || p.stun > 0 || p.hurtTimer > 0) {
    cancelCharge(p);
    p.chargeBlocked = true;
    return;
  }
  p.chargeTime += dt;
  if (!p.charged && p.chargeTime >= spec.hold) {
    p.charged = true;
    playSfx('skillReady');
  }
}

function startChargedAttack(p) {
  playSfx('swing');
  p.revealTimer = STEALTH.reveal;
  p.ambushTargets = null;
  p.attackCooldown = ATTACK_COOLDOWN;
  p.throwSwing = false;
  p.chargedSwing = true;
  p.attackHits = new Set();
}

// Đang giữ đủ lâu để tính là tích lực (đi chậm + animation).
function chargingNow(p) {
  const spec = chargeSpec();
  return Boolean(spec) && p.chargeTime >= spec.delay;
}

// Đòn gồng trúng: hazard `tameable` thì thu phục; còn lại mất `damage` (nhân với
// sát thương đòn chém của chương — phần thưởng). Mục tiêu `plungeOnly` vẫn gạt.
function chargedHit(target, strikeFn) {
  if (plungeOnly(target)) {
    blockedByGuard(target);
    return;
  }
  const tame = CHAPTER.sprites.hazards[target.sprite]?.tameable;
  if (tame && state.hazards.includes(target)) {
    startMount(target, tame);
    CHAPTER.hooks?.onChargedHit?.(target);
    return;
  }
  strikeFn(target, chargeSpec().damage * attackDamage(target).damage);
  CHAPTER.hooks?.onChargedHit?.(target);
}

// Thu phục (PH-ENGINE E2): hazard biến mất, người chơi cưỡi theo hướng đang mặt.
function startMount(hazard, spec) {
  const p = state.player;
  hazard.alive = false;
  hazard.dying = false;
  hazard.harmful = false;
  revealCarriedItems(hazard);
  cancelCharge(p);
  p.mounted = true;
  state.mount = { sprite: hazard.sprite, spec, dir: p.facing || 1, time: spec.time, age: 0, riding: true, x: 0, footY: 0, hits: new Set() };
  playSfx('reward');
  const message = CHAPTER.sprites.hazards[hazard.sprite].tameMessage;
  if (message) showMessage(message);
}

function endRide(p, mount) {
  p.mounted = false;
  p.invulnerable = Math.max(p.invulnerable, .5);
  mount.riding = false;
  mount.age = 0;
  mount.x = p.x + p.w / 2;
  mount.footY = p.y + p.h;
}

// Húc lính + vật `rammable`; xuống khi hết giờ, gặp mép hố phía trước hoặc bị chặn
// (không nhích được so với đầu frame). Xuống rồi trâu chạy tiếp một đoạn, chỉ vẽ.
function updateMount(p, dt, startX) {
  const mount = state.mount;
  if (!mount) return;
  mount.age += dt;
  if (!mount.riding) {
    mount.x += mount.dir * mount.spec.speed * dt;
    if (mount.age >= MOUNT_AWAY_TIME) state.mount = null;
    return;
  }
  mount.time -= dt;
  const ram = target => {
    if (mount.hits.has(target) || !aabb(p, target)) return;
    mount.hits.add(target);
    strike(target, mount.spec.damage);
  };
  state.enemies.filter(enemy => enemy.alive && !enemy.boss).forEach(ram);
  state.hazards.filter(hazard => hazard.alive && hazard.hp > 0 && CHAPTER.sprites.hazards[hazard.sprite]?.rammable).forEach(ram);
  const front = mount.dir > 0 ? p.x + p.w + 12 : p.x - 12;
  const edgeAhead = p.grounded && !pointHasGround(front);
  if (mount.time <= 0 || edgeAhead || Math.abs(p.x - startX) < .5) endRide(p, mount);
}

// Đẩy vật `pushable` (PH-ENGINE E3): đứng đất, đi về phía vật. Vật dừng ở mép hố,
// bậc đất, vật chặn khác; đang đẩy mà chạm lính thì húc, cách nhau 0,5 s.
function pushBody(p, body, push, move, dt) {
  const dir = p.x + p.w / 2 < body.x + body.w / 2 ? 1 : -1;
  body.pushTimer = Math.max(0, (body.pushTimer || 0) - dt);
  if (!p.grounded || p.dashing || move !== dir) return;
  const step = dir * push.speed * MOVE_SPEED * dt;
  const next = { x: body.x + step, y: body.y, w: body.w, h: body.h };
  const edge = dir > 0 ? next.x + next.w : next.x;
  if (!pointHasGround(edge) || groundYAt(edge) !== body.baseY) return;
  if (next.x < 12 || next.x + next.w > state.finishX + 96) return;
  const walled = [...state.obstacles.filter(item => item.active && !item.broken && item.blocking),
    ...state.hazards.filter(item => item !== body && item.alive && CHAPTER.sprites.hazards[item.sprite]?.blocking)]
    .some(item => aabb(next, item));
  if (walled) return;
  body.x = next.x;
  p.x += step;
  p.pushing = true;
  if (body.pushTimer > 0) return;
  const enemy = state.enemies.find(item => item.alive && aabb(body, item));
  if (!enemy) return;
  body.pushTimer = .5;
  if (!CHAPTER.hooks?.onPushHit?.(body, enemy)) strike(enemy, push.damage);
}

// Hết gánh (MHD-ENGINE E4): chương gọi được ngoài cú đập sọt (vd. sau cảnh thoại).
export function releaseBurden() {
  state.player.burden = false;
}

// Đang gánh mà bấm Đánh: chương trả true (đứng gần xe cống) thì đập sọt, hết gánh,
// vung đòn như thường; không thì chỉ nhắc, tối đa 1 lần mỗi `hintInterval` giây.
function attackWhileBurdened(p) {
  if (CHAPTER.hooks?.onBurdenAttack?.(p)) {
    releaseBurden();
    startAttack();
    return;
  }
  if (p.burdenHintTimer > 0 || !CHAPTER.text.burdenHint) return;
  p.burdenHintTimer = state.burden?.hintInterval ?? BURDEN.hintInterval;
  showMessage(CHAPTER.text.burdenHint);
}

// Thông số đòn bổ của chương (TQP-ENGINE E5) hoặc null nếu chương không bật.
function plungeSpec() {
  return CHAPTER.plunge ? { ...PLUNGE, ...CHAPTER.plunge } : null;
}

// Đòn bổ từ trên (Q1): đang rơi (vy > 0) mà bấm Đánh thì bổ thẳng xuống thay
// cho chém ngang. Đang bật lên, đang lướt, đang choáng thì không bổ.
function canPlunge(p) {
  return Boolean(plungeSpec()) && !p.grounded && p.vy > 0 && !p.dashing && !p.plunging && p.stun <= 0;
}

function startPlunge() {
  const p = state.player;
  playSfx('swing');
  p.plunging = true;
  p.plungeHits = new Set();
  // Hướng lao (TQP-L1 — bổ chéo về trước): hướng mặt lúc bấm, giữ suốt cú bổ.
  p.plungeDir = p.facing || 1;
  p.revealTimer = STEALTH.reveal;
}

// Hộp đánh của đòn bổ: dải dưới chân, rộng bằng thân.
export function plungeBox(p) {
  return { x: p.x, y: p.y + p.h - 4, w: p.w, h: plungeSpec()?.boxH ?? PLUNGE.boxH };
}

// Đòn bổ trúng mục tiêu có đỉnh ở dưới chân (đang rơi từ trên xuống): trừ máu
// `damage` (không chí mạng), người chơi nảy lên `bounce`, miễn va chạm thân
// `grace` giây. Mỗi mục tiêu trúng 1 lần mỗi cú bổ.
function updatePlunge() {
  const p = state.player;
  const spec = plungeSpec();
  if (!p.plunging || !spec) return;
  const box = plungeBox(p);
  const feet = p.y + p.h;
  const hittable = target => !p.plungeHits.has(target) && target.hitTimer <= 0 && aabb(box, target)
    && feet <= target.y + 16;
  const target = state.enemies.find(enemy => enemy.alive && hittable(enemy))
    || state.hazards.find(hazard => hazard.alive && hazard.hp > 0 && hazard.exposed !== false && hittable(hazard));
  if (!target) return;
  p.plungeHits.add(target);
  if (state.enemies.includes(target)) strikeEnemy(target, spec.damage);
  else strikeHazard(target, spec.damage);
  CHAPTER.hooks?.onPlunge?.(target);
  p.plunging = false;
  p.vy = -spec.bounce;
  p.plungeGrace = spec.grace;
}

// Giây kể từ lúc bấm đánh tới ô hit_frame của attack_01 (trải trên
// ATTACK_COOLDOWN). Thiếu manifest -> 0, tức gây sát thương ngay như bản cũ.
function attackHitTime() {
  const meta = getAnimMeta(PLAYER_SPRITE_ID, PLAYER_ANIMATIONS.attack.anim);
  return meta ? hitTime(meta, ATTACK_COOLDOWN) : 0;
}

// Cửa sổ gây sát thương: [hit_frame, hit_frame + ATTACK_ACTIVE_TIME). Trong
// cửa sổ, attackBox đi theo vị trí hiện tại của nhân vật; mỗi mục tiêu chỉ
// trúng MỘT lần mỗi cú vung (p.attackHits).
export function updateAttack() {
  const p = state.player;
  updatePlunge();
  // Cú ném (MHD-ENGINE E1) chỉ mượn animation `attack`, không có hộp chém.
  if (p.attackCooldown <= 0 || p.throwSwing) {
    p.attacking = false;
    p.chargedSwing = false;
    return;
  }
  const elapsed = ATTACK_COOLDOWN - p.attackCooldown;
  const start = attackHitTime();
  p.attacking = elapsed >= start && elapsed < start + ATTACK_ACTIVE_TIME;
  if (!p.attacking) return;

  const attackBox = spearBox(p, p.facing);
  const canHit = target => !p.attackHits.has(target) && target.hitTimer <= 0 && aabb(attackBox, target);
  state.enemies.forEach(enemy => {
    if (!enemy.alive || !canHit(enemy)) return;
    p.attackHits.add(enemy);
    if (p.chargedSwing) {
      chargedHit(enemy, strikeEnemy);
      return;
    }
    if (blockedByGuard(enemy)) return;
    playerStrike(enemy, strikeEnemy, ambushMultiplier(enemy));
  });

  // Hazard có `hp` cũng chém được; loại hp = 0 (bẫy, tháp canh...) thì phải né
  // chứ không phá được. Hazard đang ẩn (`exposed === false` — cá sấu dưới nước,
  // TQP-ENGINE E3) cũng không chém được.
  state.hazards.forEach(hazard => {
    if (!hazard.alive || hazard.hp <= 0 || hazard.exposed === false || !canHit(hazard)) return;
    p.attackHits.add(hazard);
    if (p.chargedSwing) {
      chargedHit(hazard, strikeHazard);
      return;
    }
    if (blockedByGuard(hazard)) return;
    playerStrike(hazard, strikeHazard);
  });

  // Vật của chương bị chém trong cửa sổ đánh (Trưng Trắc: phản hũ dầu).
  CHAPTER.hooks?.onAttackWindow?.(attackBox);

  // Đạn đang bay bị chém thì tan — thưởng cho người chơi phản ứng đúng lúc.
  state.projectiles.forEach(projectile => {
    if (projectile.alive && aabb(attackBox, projectile)) {
      projectile.alive = false;
      state.score += 30;
    }
  });
}

// Mục tiêu `plungeOnly` (lính giáo dài — TQP-ENGINE E5) gạt đòn chém ngang:
// không mất máu, nhắc `CHAPTER.text.plungeHint` (tối đa 1 lần mỗi 3 s).
// Mục tiêu `chargeOnly` (PH-ENGINE E1) cũng gạt, nhắc `CHAPTER.text.chargeHint`.
function blockedByGuard(target) {
  const plunge = plungeOnly(target);
  if (!plunge && !chargeOnly(target)) return false;
  const p = state.player;
  // Phát animation `blocked` (nếu sprite có) — enemies.js / hazards.js.
  target.blockTimer = .2;
  playSfx('hit');
  const hint = plunge ? CHAPTER.text.plungeHint : CHAPTER.text.chargeHint;
  if ((p.plungeHintTimer || 0) <= 0 && hint) {
    p.plungeHintTimer = plunge ? 3 : chargeSpec()?.hintInterval ?? CHARGE.hintInterval;
    showMessage(hint);
  }
  return true;
}

// Đánh úp (TQP-ENGINE E7): chương bật CHAPTER.stealth.ambush — lúc bắt đầu vung,
// lính CHƯA phát hiện người chơi (`alerted` false) và đang quay lưng về phía
// người chơi thì đòn đó nhân sát thương (lính kịp quay lại trước ô hit_frame
// vẫn tính).
function ambushTargets(p) {
  if (!CHAPTER.stealth?.ambush) return null;
  const center = p.x + p.w / 2;
  return new Set(state.enemies.filter(enemy => {
    if (!enemy.alive || enemy.boss || enemy.alerted || enemy.facing === undefined) return false;
    const side = Math.sign(center - (enemy.x + enemy.w / 2));
    return side !== 0 && side === -enemy.facing;
  }));
}

function ambushMultiplier(enemy) {
  return state.player.ambushTargets?.has(enemy) ? CHAPTER.stealth.ambush : 1;
}

// Cơ chế lướt lấy theo level-test: một cú lao nhanh, có thời gian cố định,
// không thu nhỏ nhân vật thành tư thế quỳ và có thể dùng cả khi đang ở trên không.
export function startDash() {
  const p = state.player;
  if (p.dashing || p.dashCooldown > 0) return;
  playSfx('dash');
  p.revealTimer = STEALTH.reveal;
  p.dashing = true;
  p.dashTimer = DASH_TIME;
  p.dashCooldown = DASH_COOLDOWN;
  p.vx = p.facing * DASH_SPEED;
}

// Trạng thái animation của người chơi, theo thứ tự ưu tiên:
// trúng đòn > lướt > đánh > nhảy > chạy > đứng yên. Dùng attackCooldown (cả
// cú vung) chứ không phải `attacking` (chỉ cửa sổ gây sát thương).
// Đang gánh (MHD-ENGINE E4): chưa có strip nhảy/trúng đòn khi gánh — các strip
// `jump`, `hurt` cầm kiếm — nên trên không hoặc trúng đòn vẫn giữ `burdenIdle`
// (nhấp nháy bất tử vẫn báo trúng đòn). Cú vung lúc đập sọt đã hết gánh.
function playerAnimationState(p) {
  if (p.mounted) return 'ride';
  if (p.burden && (p.hurtTimer > 0 || !p.grounded)) return 'burdenIdle';
  if (p.hurtTimer > 0) return 'hurt';
  if (p.dashing) return 'dash';
  if (p.plunging) return 'plunge';
  if (p.attackCooldown > 0) return p.chargedSwing ? 'chargeStrike' : 'attack';
  if (chargingNow(p)) return 'charge';
  if (!p.grounded) return 'jump';
  const moving = Math.abs(p.vx) > 1;
  if (p.burden) return moving ? 'burdenRun' : 'burdenIdle';
  if (p.pushing) return 'push';
  return moving ? 'run' : 'idle';
}

export function updatePlayerAnimation(dt) {
  const p = state.player;
  setAnim(p, playerAnimationState(p));
  tickAnim(p, dt);
  // Đòn đánh chạy theo đúng đồng hồ của cú vung (khớp thời điểm gây sát
  // thương), kể cả khi vừa hết cú trước đã bấm cú mới (cùng tên animation).
  if (p.anim.name === 'attack' || p.anim.name === 'chargeStrike') p.anim.time = ATTACK_COOLDOWN - p.attackCooldown;
}

// Rơi xuống đỉnh vật: đứng lên.
function standOn(p, body) {
  p.y = body.y - p.h;
  p.vy = 0;
  p.grounded = true;
  p.standingOn = body;
}

// Vật chặn (cột đá — Q1): va ngang thì bị đẩy ra mép gần nhất, không mất máu.
function pushOut(p, body) {
  p.x = p.x + p.w / 2 < body.x + body.w / 2 ? body.x - p.w : body.x + body.w;
  p.vx = 0;
}

// 1 bước điều khiển + vật lý người chơi: hồi chiêu, phím, trọng lực, kẹp màn/hố,
// sườn bậc, tiếp đất, vật cản, kết thúc cú lướt. Trả về đáy hitbox frame trước.
export function updatePlayerControl(dt) {
  const p = state.player;
  // Đứng trên bục di chuyển (lưng voi — E7): chở theo quãng bục dịch ở frame trước.
  if (p.platform && platformActive(p.platform)) p.x += p.platform.dx;
  const previousBottom = p.y + p.h;
  const startX = p.x;

  p.invulnerable = Math.max(0, p.invulnerable - dt);
  p.hurtTimer = Math.max(0, p.hurtTimer - dt);
  p.attackCooldown = Math.max(0, p.attackCooldown - dt);
  p.dashCooldown = Math.max(0, (p.dashCooldown || 0) - dt);
  p.stun = Math.max(0, (p.stun || 0) - dt);
  p.revealTimer = Math.max(0, (p.revealTimer || 0) - dt);
  p.plungeGrace = Math.max(0, (p.plungeGrace || 0) - dt);
  p.plungeHintTimer = Math.max(0, (p.plungeHintTimer || 0) - dt);
  p.burdenHintTimer = Math.max(0, (p.burdenHintTimer || 0) - dt);
  // Đặt lại mỗi frame: pushBody bật khi vật thật sự nhích được.
  p.pushing = false;
  state.enemies.forEach(enemy => { enemy.hitTimer = Math.max(0, enemy.hitTimer - dt); });

  // Đang choáng (BT-L3 E2 — damage.js stunPlayer): bỏ qua phím, vẫn rơi theo trọng lực.
  if (p.stun > 0) {
    pressed.dash = false;
    pressed.jump = false;
    pressed.attack = false;
  }
  // Đang cưỡi (PH-ENGINE E2): chỉ còn nhảy.
  if (p.mounted) {
    pressed.dash = false;
    pressed.attack = false;
  }
  const move = p.stun > 0 || p.mounted ? 0 : Number(keys.right) - Number(keys.left);
  if (!p.dashing && move !== 0) p.facing = move;

  if (pressed.dash && !p.burden) startDash();
  pressed.dash = false;
  updateCharge(p, dt);

  // Sình lầy (TQP-ENGINE E1): đang đứng trên dải sình thì đi chậm, nhảy thấp.
  const mud = { ...MUD, ...CHAPTER.mud };
  const inMudNow = p.grounded && inMud(p.x + p.w / 2);
  if (p.dashing) {
    p.dashTimer -= dt;
    p.vx = p.facing * DASH_SPEED;
  } else if (p.mounted) {
    p.facing = state.mount.dir;
    p.vx = state.mount.dir * state.mount.spec.speed;
  } else {
    const chargeSlow = chargingNow(p) ? chargeSpec().moveSpeed : 1;
    p.vx = move * MOVE_SPEED * (inMudNow ? mud.speed : 1) * (p.burden ? state.burden.speed : 1) * chargeSlow;
  }

  if (pressed.jump && p.grounded && !p.dashing) {
    p.vy = -JUMP_FORCE * (inMudNow ? mud.jump : 1) * (p.burden ? state.burden.jump : 1);
    p.grounded = false;
    playSfx('jump');
  }
  pressed.jump = false;

  if (pressed.attack) {
    if (p.burden) attackWhileBurdened(p);
    else if (p.carrying) throwCarried();
    else if (canPlunge(p)) startPlunge();
    else startAttack();
  }
  pressed.attack = false;

  const wasGrounded = p.grounded;
  p.vy += GRAVITY * dt;
  // Đang bổ (TQP-ENGINE E5): `forward` > 0 thì lao chéo về trước theo đường
  // thẳng đều (rơi đúng `speed`, ngang `forward`, không điều khiển được — TQP-L1);
  // = 0 thì rơi thẳng ít nhất `speed`, trôi ngang chậm lại.
  if (p.plunging) {
    const spec = plungeSpec() || PLUNGE;
    if (spec.forward > 0) {
      p.vy = spec.speed;
      p.vx = p.plungeDir * spec.forward;
    } else {
      p.vy = Math.max(p.vy, spec.speed);
      p.vx *= .5;
    }
  }
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  // Đấu trường: tường vô hình ở 0 và worldWidth.
  if (LEVEL.arena) p.x = Math.max(0, Math.min(LEVEL.worldWidth - p.w, p.x));
  else p.x = Math.max(12, Math.min(state.finishX + 96, p.x));
  // Đã rơi xuống dưới mặt đất trong hố: kẹp giữa 2 vách hố (không đi xuyên
  // vào lòng đất) tới khi rơi hết và respawnAfterFall().
  if (previousBottom > GROUND_Y + GROUND_SNAP_DISTANCE) {
    const hole = state.holes.find(item => p.x + p.w / 2 > item.x && p.x + p.w / 2 < item.x + item.w);
    if (hole) p.x = Math.max(hole.x, Math.min(hole.x + hole.w - p.w, p.x));
  }
  resolveTerrainWalls(p, previousBottom);

  p.grounded = false;
  const groundY = playerGroundY(p);
  const feetY = p.y + p.h;
  const mayFollowSlope = wasGrounded && groundY !== null && Math.abs(feetY - groundY) <= GROUND_SNAP_DISTANCE;
  // Chỉ tiếp đất khi frame trước chân chưa xuống sâu dưới mặt đất — nếu không,
  // người chơi đang rơi trong hố sẽ bị kéo ngược lên khi chân chạm mép hố.
  const landedOnGround = groundY !== null && feetY >= groundY && p.vy >= 0
    && previousBottom <= groundY + GROUND_SNAP_DISTANCE;
  if (mayFollowSlope || landedOnGround) {
    p.y = groundY - p.h;
    p.vy = 0;
    p.grounded = true;
  }

  // Bục một chiều cao hơn mặt đất thì đứng trên bục (kể cả bục trên hố).
  p.platform = landingPlatform(p, previousBottom);
  if (p.platform && (!p.grounded || p.platform.y < p.y + p.h)) {
    p.y = p.platform.y - p.h;
    p.vy = 0;
    p.grounded = true;
  }

  // Vật cản người chơi đang đứng trên (vd. cột đá: xe đâm cột thì không tính va chạm).
  p.standingOn = null;
  for (const obstacle of state.obstacles) {
    if (!obstacle.active || obstacle.broken || !aabb(p, obstacle)) continue;
    // Chướng ngại vật bắt buộc lướt không gây sát thương trong suốt cú dash.
    if (obstacle.requiresDash && p.dashing) continue;
    if (!obstacle.overhead && !obstacle.harmful && p.vy >= 0 && previousBottom <= obstacle.y + 5) {
      standOn(p, obstacle);
    } else if (obstacle.blocking) {
      pushOut(p, obstacle);
    } else {
      hurtPlayer(obstacle.harmful ? CHAPTER.text.trapHit : CHAPTER.text.obstacleHit);
    }
  }
  // Hazard `blocking` (MHD-ENGINE E3 — xe cống, hòm rỗng) theo cùng luật vật chặn.
  for (const hazard of state.hazards) {
    const spec = CHAPTER.sprites.hazards[hazard.sprite];
    if (!hazard.alive || !spec?.blocking || !aabb(p, hazard)) continue;
    // Đang cưỡi: vật `rammable` để updateMount húc đổ, không chặn lại.
    if (p.mounted && spec.rammable) continue;
    if (p.vy >= 0 && previousBottom <= hazard.y + 5) standOn(p, hazard);
    else {
      pushOut(p, hazard);
      if (spec.pushable) pushBody(p, hazard, spec.pushable, move, dt);
    }
  }
  updateMount(p, dt, startX);

  if (!wasGrounded && p.grounded) playSfx('land');
  // Bổ chạm đất: hết đòn bổ, rung nhẹ màn hình.
  if (p.plunging && p.grounded) {
    p.plunging = false;
    state.cameraShake = { time: .12, total: .12, amp: 2 };
  }
  updateMudSink(p, dt, mud);
  rememberSafeSpot(p);

  // Nếu thời gian lướt vừa hết khi nhân vật còn nằm trong vùng vật cản,
  // duy trì dash tới khi ra khỏi vật để không bị mất máu ở khung hình cuối.
  // Chương có thể giữ cú lướt thêm (Trưng Trắc: đang xuyên thân chiến xa).
  const insideDashObstacle = state.obstacles.some(obstacle =>
    obstacle.active && obstacle.requiresDash && aabb(p, obstacle)
  );
  const keptByChapter = Boolean(CHAPTER.hooks?.keepDashing?.(p));
  if (p.dashing && p.dashTimer <= 0 && !insideDashObstacle && !keptByChapter) {
    p.dashing = false;
    p.dashTimer = 0;
  }
  return previousBottom;
}
