// Người chơi (nhân vật nam/nữ dùng chung mọi chương — TT-HERO-01): điều khiển,
// trọng lực, đứng trên đất/bậc/vật cản, rơi hố, lướt, đánh, animation.

import { state } from './state.js';
import { keys, pressed } from './input.js';
import { aabb, groundYAt, terrainLevelAt } from './geometry.js';
import { setAnim, tickAnim, getAnimMeta, hitTime } from './animation.js';
import {
  FOOT_MARGIN, TERRAIN_CELL, GROUND_Y, MOVE_SPEED, GRAVITY, JUMP_FORCE, DASH_SPEED, DASH_TIME, DASH_COOLDOWN,
  GROUND_SNAP_DISTANCE, ATTACK_COOLDOWN, ATTACK_ACTIVE_TIME, PLAYER_SPRITE_ID, PLAYER_ANIMATIONS
} from './config.js';
import { CHAPTER, LEVEL } from './chapter.js';
import { playSfx } from './audio.js';
import { hurtPlayer } from './damage.js';
import { spearBox, strikeEnemy, strikeHazard, playerStrike } from './combat.js';
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

export function startAttack() {
  const p = state.player;
  if (p.attackCooldown > 0) return;
  playSfx('swing');
  // Bấm đánh chỉ bắt đầu cú vung; sát thương tính ở updateAttack() khi
  // animation tới ô hit_frame (không còn gây sát thương ngay lúc bấm).
  p.attackCooldown = ATTACK_COOLDOWN;
  p.attackHits = new Set();
  // Kỹ năng của chương chém cùng lúc với người chơi (Trưng Trắc: bóng Trưng Nhị).
  if (state.skills) CHAPTER.skills.onAttackStart?.();
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
  if (p.attackCooldown <= 0) {
    p.attacking = false;
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
    playerStrike(enemy, strikeEnemy);
  });

  // Hazard có `hp` cũng chém được; loại hp = 0 (bẫy, tháp canh...) thì phải né
  // chứ không phá được.
  state.hazards.forEach(hazard => {
    if (!hazard.alive || hazard.hp <= 0 || !canHit(hazard)) return;
    p.attackHits.add(hazard);
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

// Cơ chế lướt lấy theo level-test: một cú lao nhanh, có thời gian cố định,
// không thu nhỏ nhân vật thành tư thế quỳ và có thể dùng cả khi đang ở trên không.
export function startDash() {
  const p = state.player;
  if (p.dashing || p.dashCooldown > 0) return;
  playSfx('dash');
  p.dashing = true;
  p.dashTimer = DASH_TIME;
  p.dashCooldown = DASH_COOLDOWN;
  p.vx = p.facing * DASH_SPEED;
}

// Trạng thái animation của người chơi, theo thứ tự ưu tiên:
// trúng đòn > lướt > đánh > nhảy > chạy > đứng yên. Dùng attackCooldown (cả
// cú vung) chứ không phải `attacking` (chỉ cửa sổ gây sát thương).
function playerAnimationState(p) {
  if (p.hurtTimer > 0) return 'hurt';
  if (p.dashing) return 'dash';
  if (p.attackCooldown > 0) return 'attack';
  if (!p.grounded) return 'jump';
  return Math.abs(p.vx) > 1 ? 'run' : 'idle';
}

export function updatePlayerAnimation(dt) {
  const p = state.player;
  setAnim(p, playerAnimationState(p));
  tickAnim(p, dt);
  // Đòn đánh chạy theo đúng đồng hồ của cú vung (khớp thời điểm gây sát
  // thương), kể cả khi vừa hết cú trước đã bấm cú mới (cùng tên animation).
  if (p.anim.name === 'attack') p.anim.time = ATTACK_COOLDOWN - p.attackCooldown;
}

// 1 bước điều khiển + vật lý người chơi: hồi chiêu, phím, trọng lực, kẹp màn/hố,
// sườn bậc, tiếp đất, vật cản, kết thúc cú lướt. Trả về đáy hitbox frame trước.
export function updatePlayerControl(dt) {
  const p = state.player;
  // Đứng trên bục di chuyển (lưng voi — E7): chở theo quãng bục dịch ở frame trước.
  if (p.platform && platformActive(p.platform)) p.x += p.platform.dx;
  const previousBottom = p.y + p.h;

  p.invulnerable = Math.max(0, p.invulnerable - dt);
  p.hurtTimer = Math.max(0, p.hurtTimer - dt);
  p.attackCooldown = Math.max(0, p.attackCooldown - dt);
  p.dashCooldown = Math.max(0, (p.dashCooldown || 0) - dt);
  state.enemies.forEach(enemy => { enemy.hitTimer = Math.max(0, enemy.hitTimer - dt); });

  const move = Number(keys.right) - Number(keys.left);
  if (!p.dashing && move !== 0) p.facing = move;

  if (pressed.dash) startDash();
  pressed.dash = false;

  if (p.dashing) {
    p.dashTimer -= dt;
    p.vx = p.facing * DASH_SPEED;
  } else {
    p.vx = move * MOVE_SPEED;
  }

  if (pressed.jump && p.grounded && !p.dashing) {
    p.vy = -JUMP_FORCE;
    p.grounded = false;
    playSfx('jump');
  }
  pressed.jump = false;

  if (pressed.attack) startAttack();
  pressed.attack = false;

  const wasGrounded = p.grounded;
  p.vy += GRAVITY * dt;
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
      p.y = obstacle.y - p.h;
      p.vy = 0;
      p.grounded = true;
      p.standingOn = obstacle;
    } else if (obstacle.blocking) {
      // Vật chặn (cột đá — Q1): va ngang thì bị đẩy ra mép gần nhất, không mất máu.
      p.x = p.x + p.w / 2 < obstacle.x + obstacle.w / 2 ? obstacle.x - p.w : obstacle.x + obstacle.w;
      p.vx = 0;
    } else {
      hurtPlayer(obstacle.harmful ? CHAPTER.text.trapHit : CHAPTER.text.obstacleHit);
    }
  }

  if (!wasGrounded && p.grounded) playSfx('land');

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
