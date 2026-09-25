// Vật lý, va chạm, và các phản ứng gameplay (mất máu, rơi hố, tấn công, kết
// thúc màn). Đây là "vòng lặp mô phỏng" chính — mọi thứ khác chỉ đọc/ghi state.

import { state } from './state.js';
import { keys, pressed, clearInput } from './input.js';
import { ui, showMessage, tickMessage, updateHud } from './ui.js';
import { aabb, groundYAt, worldX, reskinHazard, makeProjectile, actionStepAt } from './geometry.js';
import {
  CHUNK_W, VIEW_W, VIEW_H, LEVEL_WORLD_WIDTH, FOOT_MARGIN,
  MOVE_SPEED, GRAVITY, JUMP_FORCE, DASH_SPEED, DASH_TIME, GROUND_SNAP_DISTANCE,
  HURT_ANIMATION_TIME, PROJECTILE_SPEED, PROJECTILE_MAX_RANGE, HAZARD_DESPAWN_MARGIN, OBSTACLE_GROUND_SINK,
  THROWER_ANIMATIONS
} from './config.js';

export function pointHasGround(worldXPosition) {
  return !state.holes.some(hole => worldXPosition > hole.x && worldXPosition < hole.x + hole.w);
}

export function playerGroundY(player, moveDirection = 0) {
  const leftFoot = player.x + FOOT_MARGIN;
  const rightFoot = player.x + player.w - FOOT_MARGIN;
  const samples = [];

  if (pointHasGround(leftFoot)) samples.push({ side: -1, y: groundYAt(leftFoot) });
  if (pointHasGround(rightFoot)) samples.push({ side: 1, y: groundYAt(rightFoot) });
  if (!samples.length) return null;

  // Dùng chân phía trước để nhân vật lên và xuống dốc theo đúng hướng đang chạy.
  if (moveDirection !== 0) {
    const leadingFoot = samples.find(sample => sample.side === Math.sign(moveDirection));
    if (leadingFoot) return leadingFoot.y;
  }
  return Math.min(...samples.map(sample => sample.y));
}

export function hurtPlayer(reason) {
  const p = state.player;
  if (p.invulnerable > 0 || state.won) return;
  state.health -= 1;
  state.score = Math.max(0, state.score - 50);
  p.invulnerable = 1.25;
  p.hurtTimer = HURT_ANIMATION_TIME;
  p.dashing = false;
  p.dashTimer = 0;
  p.vy = -330;
  p.vx = -230 * p.facing;
  showMessage(reason);
  if (state.health <= 0) endGame(false);
}

export function respawnAfterFall() {
  const p = state.player;
  state.health -= 1;
  if (state.health <= 0) {
    endGame(false);
    return;
  }
  const chunkStart = Math.floor(p.x / CHUNK_W) * CHUNK_W;
  p.x = Math.max(80, chunkStart + 120);
  p.y = groundYAt(p.x + p.w / 2) - p.normalH;
  p.h = p.normalH;
  p.dashing = false;
  p.dashTimer = 0;
  p.vx = 0;
  p.vy = 0;
  p.invulnerable = 1.5;
  showMessage('Bạn rơi xuống hố và mất 1 máu.');
}

export function startAttack() {
  const p = state.player;
  if (p.attackCooldown > 0) return;
  p.attacking = true;
  p.attackTimer = .18;
  p.attackCooldown = .36;

  const attackBox = {
    x: p.facing > 0 ? p.x + p.w : p.x - 80,
    y: p.y + 12,
    w: 80,
    h: Math.max(42, p.h - 16)
  };
  state.enemies.forEach(enemy => {
    if (!enemy.alive || enemy.hitTimer > 0 || !aabb(attackBox, enemy)) return;
    enemy.hp -= 1;
    enemy.hitTimer = .18;
    state.score += enemy.boss ? 150 : 100;
    if (enemy.hp <= 0) {
      enemy.alive = false;
      state.score += enemy.boss ? 700 : 250;
      showMessage(enemy.boss ? 'Đã đánh bại toán lính giữ thành!' : 'Đã đánh bại lính canh.');
    }
  });

  // Hazard có `hp` (hổ, kỵ binh, xe cống, lính thu thuế) cũng chém được; loại
  // hp = 0 (kiệu, thuyền, bẫy, tháp canh) thì phải né chứ không phá được.
  state.hazards.forEach(hazard => {
    if (!hazard.alive || hazard.hp <= 0 || hazard.hitTimer > 0 || !aabb(attackBox, hazard)) return;
    hazard.hp -= 1;
    hazard.hitTimer = .18;
    state.score += 100;
    if (hazard.hp <= 0) breakHazard(hazard);
  });

  // Đạn đang bay bị chém thì tan — thưởng cho người chơi phản ứng đúng lúc.
  state.projectiles.forEach(projectile => {
    if (projectile.alive && aabb(attackBox, projectile)) {
      projectile.alive = false;
      state.score += 30;
    }
  });
}

// Hazard hết máu: loại có `wreckSprite` (xe cống) để lại đống đổ nát vô hại
// nằm luôn trên map thay vì biến mất — vừa dùng được sprite xe vỡ, vừa cho
// người chơi thấy dấu vết việc mình vừa làm.
function breakHazard(hazard) {
  state.score += 250;
  if (hazard.wreckSprite) {
    reskinHazard(hazard, hazard.wreckSprite);
    hazard.kind = 'prop';
    hazard.harmful = false;
    hazard.speed = 0;
    hazard.projectile = null;
    hazard.hp = 0;
    showMessage('Xe cống phẩm vỡ tan!');
    return;
  }
  hazard.alive = false;
  showMessage('Đã hạ chướng ngại vật!');
}

function fireProjectile(hazard) {
  const player = state.player;
  const originX = hazard.x + hazard.w / 2;
  const direction = Math.sign(player.x + player.w / 2 - originX) || -1;
  // Điểm bắn tính theo Ô VẼ chứ không theo hitbox: hitbox của thuyền nằm chìm
  // dưới mặt nước nên lấy theo nó thì tên lửa bay ngang mặt đất, khuất sau
  // lớp tối của khe sông.
  const drawTop = hazard.baseY - hazard.drawH + (hazard.grounded ? OBSTACLE_GROUND_SINK : 0);
  state.projectiles.push(makeProjectile(
    hazard.projectile,
    originX + direction * (hazard.w / 2 + 6),
    drawTop + hazard.drawH * .3,
    direction
  ));
}

// Bắt đầu một chuỗi hành động của lính (THROWER_ANIMATIONS). Sprite không có
// chuỗi tương ứng thì trả về false để nơi gọi xử lý tức thì như cũ.
function startAction(hazard, name) {
  if (!THROWER_ANIMATIONS[hazard.sprite]?.[name]) return false;
  hazard.action = { name, time: 0, released: false };
  return true;
}

// Chạy tiếp hành động đang diễn: tới bước `release` thì đạn rời tay (khớp đúng
// ô vung tay), hết chuỗi thì về đứng yên và bắt đầu đếm lại fireInterval.
function advanceAction(hazard, dt) {
  const steps = THROWER_ANIMATIONS[hazard.sprite][hazard.action.name];
  hazard.action.time += dt;
  const current = actionStepAt(steps, hazard.action.time);
  const reachedRelease = !current || current.index >= steps.findIndex(step => step.release);
  if (hazard.action.name === 'throw' && !hazard.action.released && reachedRelease) {
    hazard.action.released = true;
    fireProjectile(hazard);
  }
  if (!current) {
    if (hazard.action.name === 'throw') hazard.fireTimer = hazard.fireInterval;
    hazard.action = null;
  }
}

// Vật cản/kẻ địch có trạng thái. Mỗi `kind` là một hành vi tách bạch:
//   roller  — nằm chờ tới khi người chơi vượt triggerX (hoặc bị gọi bằng báo
//             động) rồi lao sang trái, ra khỏi tầm thì xoá.
//   thrower — đứng yên, vào tầm thì bắn đạn theo chu kỳ.
//   boat    — trôi chậm trên sông và bắn như thrower.
//   trap    — đứng yên, vô hại tới khi người chơi tới sát thì đổi sprite và
//             bắt đầu gây sát thương.
//   prop    — chỉ để vẽ (tháp canh, xác xe cống), không va chạm.
function updateHazards(dt) {
  const player = state.player;
  const playerCenter = player.x + player.w / 2;

  state.hazards.forEach(hazard => {
    if (!hazard.alive) return;
    hazard.hitTimer = Math.max(0, hazard.hitTimer - dt);

    if (hazard.kind === 'roller') {
      if (!hazard.active) {
        if (hazard.triggerX !== null && player.x >= hazard.triggerX) hazard.active = true;
        else return;
      }
      hazard.x += hazard.speed * dt;
      hazard.y = hazard.baseY - hazard.h;
      if (hazard.x + hazard.w < playerCenter - HAZARD_DESPAWN_MARGIN) {
        hazard.alive = false;
        return;
      }
    }

    if (hazard.kind === 'boat' && hazard.speed !== 0) {
      hazard.x += hazard.speed * dt;
      if (hazard.x + hazard.w < playerCenter - HAZARD_DESPAWN_MARGIN) {
        hazard.alive = false;
        return;
      }
    }

    if (hazard.kind === 'trap' && !hazard.sprung) {
      if (Math.abs(playerCenter - (hazard.x + hazard.w / 2)) <= hazard.triggerDistance) {
        hazard.sprung = true;
        hazard.harmful = true;
        reskinHazard(hazard, hazard.sprungSprite);
        showMessage('Bẫy hố chông bật lên!');
      }
    }

    const distance = Math.abs(playerCenter - (hazard.x + hazard.w / 2));

    // Lính gác trên tháp thấy người chơi thì thổi tù và, đánh thức kỵ binh
    // đang chờ (hazard cùng id) — báo động chỉ kêu một lần mỗi lượt chơi.
    if (hazard.alarmFor && !hazard.alarmed && distance <= hazard.fireRange) {
      hazard.alarmed = true;
      const summoned = state.hazards.find(item => item.id === hazard.alarmFor);
      if (summoned) summoned.active = true;
      showMessage('Lính gác thổi tù và báo động — kỵ binh Hán xông tới!', 2600);
      startAction(hazard, 'alarm');
    }

    // Đang diễn hành động thì diễn cho hết (kể cả khi người chơi vừa ra khỏi
    // tầm) để cú ném không bị cắt ngang giữa chừng.
    if (hazard.action) {
      advanceAction(hazard, dt);
    } else if (hazard.projectile && distance <= hazard.fireRange) {
      hazard.fireTimer -= dt;
      if (hazard.fireTimer <= 0 && !startAction(hazard, 'throw')) {
        hazard.fireTimer = hazard.fireInterval;
        fireProjectile(hazard);
      }
    }

    if (hazard.harmful && player.invulnerable <= 0 && aabb(player, hazard)) {
      hurtPlayer(hazard.sprung ? 'Bạn giẫm phải hố chông!' : 'Bạn va phải quân Hán!');
    }
  });

  state.hazards = state.hazards.filter(hazard => hazard.alive);
}

function updateProjectiles(dt) {
  const player = state.player;
  state.projectiles.forEach(projectile => {
    if (!projectile.alive) return;
    projectile.x += projectile.direction * PROJECTILE_SPEED * dt;
    projectile.traveled += PROJECTILE_SPEED * dt;
    if (projectile.traveled >= PROJECTILE_MAX_RANGE
      || Math.abs(projectile.x - state.cameraX) > VIEW_W + HAZARD_DESPAWN_MARGIN) {
      projectile.alive = false;
      return;
    }
    if (player.invulnerable <= 0 && aabb(player, projectile)) {
      projectile.alive = false;
      hurtPlayer('Bạn trúng đạn của quân Hán!');
    }
  });
  state.projectiles = state.projectiles.filter(projectile => projectile.alive);
}

// Cơ chế lướt lấy theo level-test: một cú lao nhanh, có thời gian cố định,
// không thu nhỏ nhân vật thành tư thế quỳ và có thể dùng cả khi đang ở trên không.
export function startDash() {
  const p = state.player;
  if (p.dashing) return;
  p.dashing = true;
  p.dashTimer = DASH_TIME;
  p.vx = p.facing * DASH_SPEED;
}

export function update(dt) {
  if (!state.running || state.paused || state.won) return;
  const p = state.player;
  const previousBottom = p.y + p.h;

  tickMessage(dt);

  p.invulnerable = Math.max(0, p.invulnerable - dt);
  p.hurtTimer = Math.max(0, p.hurtTimer - dt);
  p.attackCooldown = Math.max(0, p.attackCooldown - dt);
  p.attackTimer = Math.max(0, p.attackTimer - dt);
  p.attacking = p.attackTimer > 0;
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
  }
  pressed.jump = false;

  if (pressed.attack) startAttack();
  pressed.attack = false;

  const wasGrounded = p.grounded;
  p.vy += GRAVITY * dt;
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  p.x = Math.max(20, Math.min(state.finishX + 160, p.x));

  p.grounded = false;
  const groundY = playerGroundY(p, move);
  const feetY = p.y + p.h;
  const mayFollowSlope = wasGrounded && groundY !== null && Math.abs(feetY - groundY) <= GROUND_SNAP_DISTANCE;
  const landedOnGround = groundY !== null && feetY >= groundY && p.vy >= 0;
  if (mayFollowSlope || landedOnGround) {
    p.y = groundY - p.h;
    p.vy = 0;
    p.grounded = true;
  }

  for (const obstacle of state.obstacles) {
    if (!obstacle.active || !aabb(p, obstacle)) continue;
    // Chướng ngại vật bắt buộc lướt không gây sát thương trong suốt cú dash.
    if (obstacle.requiresDash && p.dashing) continue;
    if (!obstacle.overhead && !obstacle.harmful && p.vy >= 0 && previousBottom <= obstacle.y + 8) {
      p.y = obstacle.y - p.h;
      p.vy = 0;
      p.grounded = true;
    } else {
      hurtPlayer(obstacle.harmful ? 'Bạn va vào bẫy!' : 'Hãy nhảy hoặc lướt qua chướng ngại vật.');
    }
  }

  // Nếu thời gian lướt vừa hết khi nhân vật còn nằm trong vùng vật cản,
  // duy trì dash tới khi ra khỏi vật để không bị mất máu ở khung hình cuối.
  const insideDashObstacle = state.obstacles.some(obstacle =>
    obstacle.active && obstacle.requiresDash && aabb(p, obstacle)
  );
  if (p.dashing && p.dashTimer <= 0 && !insideDashObstacle) {
    p.dashing = false;
    p.dashTimer = 0;
  }

  updateHazards(dt);
  updateProjectiles(dt);

  state.books.forEach(book => {
    if (book.collected) return;
    const hitbox = { x: book.x - 18, y: book.y - 22, w: 36, h: 44 };
    if (aabb(p, hitbox)) {
      book.collected = true;
      state.booksCollected += 1;
      state.score += 200;
      showMessage(`Đã thu thập sách lịch sử ${state.booksCollected}/5`);
    }
  });

  state.enemies.forEach(enemy => {
    if (!enemy.alive || p.invulnerable > 0) return;
    if (aabb(p, enemy)) hurtPlayer(enemy.boss ? 'Lính giữ thành phản công!' : 'Bạn bị lính canh đánh trúng!');
  });

  if (!state.questionShown && p.x > worldX(8, 520)) {
    state.questionShown = true;
    state.paused = true;
    clearInput();
    ui.question.classList.add('panel--visible');
  }

  if (!state.restUsed && p.x > worldX(9, 470)) {
    state.restUsed = true;
    state.health = Math.min(5, state.health + 1);
    showMessage('Nghỉ chân: hồi 1 máu.');
  }

  if (!state.storyShown && p.x > worldX(10, 520)) {
    state.storyShown = true;
    showMessage('Mê Linh, năm 40: nghĩa quân tập hợp, chuẩn bị phất cờ khởi nghĩa.', 3600);
  }

  const bossAlive = state.enemies.some(enemy => enemy.boss && enemy.alive);
  if (p.x >= state.finishX) {
    if (bossAlive) {
      p.x = state.finishX - 30;
      p.vx = 0;
      showMessage('Hãy đánh bại lính giữ thành trước khi về đích.');
    } else if (state.booksCollected < 5) {
      p.x = state.finishX - 30;
      p.vx = 0;
      showMessage(`Bạn còn thiếu ${5 - state.booksCollected} cuốn sách lịch sử.`);
    } else {
      endGame(true);
    }
  }

  if (p.y > VIEW_H + 160) respawnAfterFall();

  const targetCamera = p.x - VIEW_W * .34;
  const maxCamera = LEVEL_WORLD_WIDTH - VIEW_W;
  state.cameraX += (Math.max(0, Math.min(maxCamera, targetCamera)) - state.cameraX) * Math.min(1, dt * 6);
  updateHud();
}

export function endGame(won) {
  state.won = true;
  state.running = false;
  clearInput();
  ui.endTitle.textContent = won ? 'Hoàn thành màn thử!' : 'Bạn đã thất bại';
  ui.endText.textContent = won
    ? `Bạn thu thập ${state.booksCollected}/5 sách và đạt ${state.score} điểm.`
    : `Điểm đạt được: ${state.score}. Hãy thử lại nhé.`;
  ui.end.classList.add('panel--visible');
}
