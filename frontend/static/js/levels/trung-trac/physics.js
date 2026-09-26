// Vật lý, va chạm, và các phản ứng gameplay (mất máu, rơi hố, tấn công, kết
// thúc màn). Đây là "vòng lặp mô phỏng" chính — mọi thứ khác chỉ đọc/ghi state.

import { state, bossAlive } from './state.js';
import { keys, pressed, clearInput } from './input.js';
import { ui, showMessage, tickMessage, updateHud } from './ui.js';
import { aabb, groundYAt, worldX, makeProjectile } from './geometry.js';
import {
  CHUNK_W, VIEW_W, VIEW_H, LEVEL, NPC_RULES, FOOT_MARGIN,
  MOVE_SPEED, GRAVITY, JUMP_FORCE, DASH_SPEED, DASH_TIME, GROUND_SNAP_DISTANCE,
  HURT_ANIMATION_TIME, PROJECTILE_SPEED, PROJECTILE_MAX_RANGE, HAZARD_DESPAWN_MARGIN,
  ATTACK_COOLDOWN, ATTACK_ACTIVE_TIME, PLAYER_SPRITE_ID, PLAYER_ANIMATIONS,
  HAZARD_SPRITES, ENEMY_SPRITES, MINIBOSS, GUARD
} from './config.js';
import { setAnim, tickAnim, getAnimMeta, hitTime, animLength } from './animation.js';
import { saveProgress } from './progress.js';
import { openNpcDialogue, openStory } from './dialogue.js';
import { STORY_THI_SACH } from './dialogue-data.js';

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

// Miễn sát thương từ lính, hazard và đạn: đang nhấp nháy sau khi trúng đòn,
// hoặc đang dash (dash bất tử tạm thời — quyết định team 25/09). Vật cản tĩnh
// (`obstacles`) KHÔNG dùng hàm này: dash vẫn chỉ xuyên được loại requiresDash.
function playerImmune(p) {
  return p.invulnerable > 0 || p.dashing;
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
  p.vy = -198;
  p.vx = -138 * p.facing;
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
  p.x = Math.max(48, chunkStart + 72);
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
  // Bấm đánh chỉ bắt đầu cú vung; sát thương tính ở updateAttack() khi
  // animation tới ô hit_frame (không còn gây sát thương ngay lúc bấm).
  p.attackCooldown = ATTACK_COOLDOWN;
  p.attackHits = new Set();
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
function updateAttack() {
  const p = state.player;
  if (p.attackCooldown <= 0) {
    p.attacking = false;
    return;
  }
  const elapsed = ATTACK_COOLDOWN - p.attackCooldown;
  const start = attackHitTime();
  p.attacking = elapsed >= start && elapsed < start + ATTACK_ACTIVE_TIME;
  if (!p.attacking) return;

  const attackBox = {
    x: p.facing > 0 ? p.x + p.w : p.x - 48,
    y: p.y + 7,
    w: 48,
    h: Math.max(25, p.h - 10)
  };
  const canHit = target => !p.attackHits.has(target) && target.hitTimer <= 0 && aabb(attackBox, target);
  state.enemies.forEach(enemy => {
    if (!enemy.alive || !canHit(enemy)) return;
    p.attackHits.add(enemy);
    enemy.hp -= 1;
    enemy.hitTimer = .18;
    state.score += enemy.boss ? 150 : 100;
    if (enemy.hp <= 0) {
      // Tắt va chạm ngay; animation death phát nốt rồi mới xoá (updateEnemies).
      enemy.alive = false;
      enemy.dying = true;
      setAnim(enemy, 'death');
      state.score += enemy.boss ? 700 : 250;
      showMessage(enemy.boss ? 'Đã đánh bại toán lính giữ thành!' : 'Đã đánh bại lính canh.');
    }
  });

  // Hazard có `hp` (hổ, kỵ binh, xe cống, lính thu thuế) cũng chém được; loại
  // hp = 0 (kiệu, thuyền, bẫy, tháp canh) thì phải né chứ không phá được.
  state.hazards.forEach(hazard => {
    if (!hazard.alive || hazard.hp <= 0 || !canHit(hazard)) return;
    p.attackHits.add(hazard);
    hazard.hp -= 1;
    hazard.hitTimer = .18;
    state.score += hazard.boss ? MINIBOSS.hitScore : 100;
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

function updatePlayerAnimation(dt) {
  const p = state.player;
  setAnim(p, playerAnimationState(p));
  tickAnim(p, dt);
  // Đòn đánh chạy theo đúng đồng hồ của cú vung (khớp thời điểm gây sát
  // thương), kể cả khi vừa hết cú trước đã bấm cú mới (cùng tên animation).
  if (p.anim.name === 'attack') p.anim.time = ATTACK_COOLDOWN - p.attackCooldown;
}

// Animation manifest (+ thời lượng ép, nếu có) của một trạng thái hazard.
function hazardAnim(hazard, animState) {
  const sprite = HAZARD_SPRITES[hazard.sprite];
  const name = sprite?.anims[animState];
  const meta = name ? getAnimMeta(sprite.id, name) : null;
  return { meta, duration: sprite?.durations?.[animState] ?? null };
}

// Hazard hết máu: tắt va chạm/đạn/di chuyển NGAY, phát death (break) một lần.
// Loại `corpse` (xe cống) đứng ở ô cuối và nằm lại map, vô hại; loại khác xoá
// khi animation phát xong (updateDyingHazard).
function breakHazard(hazard) {
  state.score += hazard.boss ? MINIBOSS.defeatScore : 250;
  hazard.alive = false;
  hazard.dying = true;
  hazard.harmful = false;
  hazard.speed = 0;
  hazard.projectile = null;
  hazard.action = null;
  setAnim(hazard, 'death');
  if (HAZARD_SPRITES[hazard.sprite]?.corpse) {
    showMessage('Xe cống phẩm vỡ tan!');
    return;
  }
  if (hazard.boss) {
    showMessage('Đã hạ kiệu quan!');
    return;
  }
  showMessage('Đã hạ chướng ngại vật!');
}

function fireProjectile(hazard) {
  const player = state.player;
  const originX = hazard.x + hazard.w / 2;
  const direction = Math.sign(player.x + player.w / 2 - originX) || -1;
  // Đạn sinh ở độ cao `muzzle` so với chân (HAZARD_SPRITES) — ngang tay ném.
  const muzzle = HAZARD_SPRITES[hazard.sprite]?.muzzle ?? hazard.h * .7;
  state.projectiles.push(makeProjectile(
    hazard.projectile,
    originX + direction * (hazard.w / 2 + 4),
    hazard.baseY - muzzle,
    direction
  ));
}

// Bắt đầu hành động của lính: 'throw' (ném) hoặc 'alarm' (thổi tù và).
function startAction(hazard, name) {
  hazard.action = { name, time: 0, released: false };
}

// Chạy tiếp hành động đang diễn. `throw`: đạn rời tay đúng lúc animation tới ô
// hit_frame của manifest (trải trên `durations.throw` nếu có), hết animation
// thì về đứng yên và bắt đầu đếm lại fireInterval. `alarm` kéo dài alarmTime.
// Thiếu manifest -> ném ngay (như bản cũ không có animation).
function advanceAction(hazard, dt) {
  const action = hazard.action;
  action.time += dt;
  if (action.name === 'alarm') {
    if (action.time >= (HAZARD_SPRITES[hazard.sprite]?.alarmTime ?? 0)) hazard.action = null;
    return;
  }
  const { meta, duration } = hazardAnim(hazard, 'throw');
  const releaseAt = meta ? hitTime(meta, duration) : 0;
  const total = meta ? animLength(meta, duration) : 0;
  if (!action.released && action.time >= releaseAt) {
    action.released = true;
    fireProjectile(hazard);
  }
  if (action.time >= total) {
    hazard.fireTimer = hazard.fireInterval;
    hazard.action = null;
  }
}

// Trạng thái animation của hazard: death > hurt > hành động (ném/báo động) >
// bẫy đã bật > di chuyển/đứng. Hành động dùng đúng đồng hồ của action để ô vẽ
// khớp thời điểm nhả đạn kể cả khi vừa bị ngắt bởi `hurt`.
function updateHazardAnimation(hazard, dt) {
  const anims = HAZARD_SPRITES[hazard.sprite]?.anims || {};
  let next;
  if (hazard.dying) next = 'death';
  else if (hazard.hitTimer > 0 && anims.hurt) next = 'hurt';
  else if (hazard.action && anims[hazard.action.name]) next = hazard.action.name;
  else if (hazard.sprung) next = 'sprung';
  else if (hazard.kind === 'patrol') next = hazard.walking ? 'move' : 'idle';
  else next = hazard.kind === 'roller' && hazard.active ? 'move' : 'idle';
  setAnim(hazard, next);
  tickAnim(hazard, dt);
  // Asset không có `idle` riêng (kiệu quan): đứng ở ô 1 của strip thay vì chạy chân.
  if (next === 'idle' && HAZARD_SPRITES[hazard.sprite]?.idleHold) hazard.anim.time = 0;
  if (hazard.action && next === hazard.action.name) hazard.anim.time = hazard.action.time;
}

// Hazard đang chết: phát nốt death; xong thì xoá (hoặc nằm lại nếu `corpse`).
function updateDyingHazard(hazard, dt) {
  updateHazardAnimation(hazard, dt);
  if (HAZARD_SPRITES[hazard.sprite]?.corpse) return;
  const { meta } = hazardAnim(hazard, 'death');
  if (!meta || hazard.anim.time >= animLength(meta)) hazard.dying = false;
}

// Mini-boss đi tuần (kind `patrol`): người chơi ngoài tầm fireRange và không
// đang ném -> đi qua lại trong [patrolMin, patrolMax], quay theo hướng đi;
// trong tầm hoặc đang ném -> đứng lại, quay về phía người chơi. Cú ném dùng
// chung cơ chế thrower trong updateHazards (đạn rời tay ở hit_frame, chu kỳ
// fireInterval tính từ lúc ném xong). Không bị đẩy lùi khi trúng đòn.
function updatePatrol(hazard, dt, playerCenter) {
  const center = hazard.x + hazard.w / 2;
  if (hazard.action || Math.abs(playerCenter - center) <= hazard.fireRange) {
    hazard.walking = false;
    hazard.facing = Math.sign(playerCenter - center) || -1;
    return;
  }
  hazard.walking = true;
  let direction = Math.sign(hazard.speed) || -1;
  if (center <= hazard.patrolMin) direction = 1;
  else if (center >= hazard.patrolMax) direction = -1;
  hazard.speed = direction * Math.abs(hazard.speed);
  hazard.facing = direction;
  hazard.x += hazard.speed * dt;
}

// Mũi kích của lính canh: dải rộng attackReach ngay trước mặt lính.
function guardAttackBox(enemy) {
  return {
    x: enemy.facing > 0 ? enemy.x + enemy.w : enemy.x - GUARD.attackReach,
    y: enemy.y + GUARD.attackBoxY,
    w: GUARD.attackReach,
    h: GUARD.attackBoxH
  };
}

// Cú đâm đang diễn: gây sát thương khi animation ở đúng ô hit_frame (chỉ
// trong ô đó, 1 lần/cú); hết animation thì nghỉ attackCooldown. Bị chém
// trúng giữa chừng thì cú đâm bị huỷ.
function advanceGuardAttack(enemy, dt) {
  const meta = getAnimMeta(ENEMY_SPRITES.normal.id, ENEMY_SPRITES.normal.anims.attack);
  const action = enemy.action;
  if (!meta || enemy.hitTimer > 0) {
    enemy.action = null;
    enemy.attackCooldown = GUARD.attackCooldown;
    return;
  }
  action.time += dt;
  const start = hitTime(meta);
  const p = state.player;
  if (!action.hit && action.time >= start && action.time < start + 1 / meta.fps
    && !playerImmune(p) && aabb(p, guardAttackBox(enemy))) {
    action.hit = true;
    hurtPlayer('Bạn bị lính canh đâm trúng!');
  }
  if (action.time >= animLength(meta)) {
    enemy.action = null;
    enemy.attackCooldown = GUARD.attackCooldown;
  }
}

// Lính canh thường: đi tuần trong [patrolMin, patrolMax]; người chơi trong
// aggroRange -> quay về phía người chơi và tiến lại (không ra khỏi đoạn tuần
// tra); tới tầm kích thì đứng lại đâm. Không bị đẩy lùi khi trúng đòn.
function updateGuard(enemy, dt) {
  enemy.attackCooldown = Math.max(0, enemy.attackCooldown - dt);
  if (enemy.action) {
    enemy.walking = false;
    advanceGuardAttack(enemy, dt);
    return;
  }
  const p = state.player;
  const center = enemy.x + enemy.w / 2;
  const toPlayer = p.x + p.w / 2 - center;
  let direction;
  if (Math.abs(toPlayer) <= GUARD.aggroRange) {
    enemy.facing = Math.sign(toPlayer) || -1;
    const gap = Math.abs(toPlayer) - (p.w + enemy.w) / 2;
    if (gap <= GUARD.attackReach - 4) {
      enemy.walking = false;
      if (enemy.attackCooldown <= 0 && enemy.hitTimer <= 0) enemy.action = { time: 0, hit: false };
      return;
    }
    direction = enemy.facing;
  } else {
    // Bước kế tiếp sẽ ra khỏi đoạn tuần tra -> quay đầu.
    direction = enemy.facing;
    const step = direction * GUARD.speed * dt;
    if (center + step < enemy.patrolMin) direction = 1;
    else if (center + step > enemy.patrolMax) direction = -1;
    enemy.facing = direction;
  }
  // Đuổi theo người chơi thì dừng ở mép đoạn tuần tra (không ra khỏi đoạn).
  const nextCenter = center + direction * GUARD.speed * dt;
  enemy.walking = nextCenter >= enemy.patrolMin && nextCenter <= enemy.patrolMax;
  if (enemy.walking) enemy.x += direction * GUARD.speed * dt;
}

// Lính canh / boss: hành vi (lính thường) + animation + xoá sau khi phát xong
// death. Trạng thái: death > hurt > attack > walk > idle.
function updateEnemies(dt) {
  state.enemies.forEach(enemy => {
    const art = ENEMY_SPRITES[enemy.boss ? 'boss' : 'normal'];
    if (!enemy.boss && enemy.alive) updateGuard(enemy, dt);
    let next = 'idle';
    if (enemy.dying) next = 'death';
    else if (enemy.hitTimer > 0 && art.anims.hurt) next = 'hurt';
    else if (enemy.action && art.anims.attack) next = 'attack';
    else if (enemy.walking && art.anims.walk) next = 'walk';
    setAnim(enemy, next);
    tickAnim(enemy, dt);
    // Cú đâm vẽ theo đúng đồng hồ của action để ô hit_frame khớp lúc gây sát thương.
    if (next === 'attack') enemy.anim.time = enemy.action.time;
    if (enemy.dying) {
      const meta = getAnimMeta(art.id, art.anims.death);
      if (!meta || enemy.anim.time >= animLength(meta)) enemy.dying = false;
    }
  });
  state.enemies = state.enemies.filter(enemy => enemy.alive || enemy.dying);
}

// Vật cản/kẻ địch có trạng thái. Mỗi `kind` là một hành vi tách bạch:
//   roller  — nằm chờ tới khi người chơi vượt triggerX (hoặc bị gọi bằng báo
//             động) rồi lao sang trái, ra khỏi tầm thì xoá.
//   thrower — đứng yên, vào tầm thì bắn đạn theo chu kỳ.
//   boat    — trôi chậm trên sông và bắn như thrower.
//   trap    — đứng yên, vô hại tới khi người chơi tới sát thì bật chông
//             (animation `sprung`) và bắt đầu gây sát thương.
//   prop    — chỉ để vẽ (tháp canh), không va chạm.
//   patrol  — mini-boss kiệu quan: đi tuần, vào tầm thì đứng lại ném dao.
// Hazard đang chết (dying) chỉ phát nốt animation, không va chạm/di chuyển.
function updateHazards(dt) {
  const player = state.player;
  const playerCenter = player.x + player.w / 2;

  state.hazards.forEach(hazard => {
    hazard.hitTimer = Math.max(0, hazard.hitTimer - dt);
    if (!hazard.alive) {
      if (hazard.dying) updateDyingHazard(hazard, dt);
      return;
    }

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

    if (hazard.kind === 'patrol') updatePatrol(hazard, dt, playerCenter);

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
      if (hazard.fireTimer <= 0) {
        startAction(hazard, 'throw');
        advanceAction(hazard, 0);
      }
    }

    updateHazardAnimation(hazard, dt);

    if (hazard.harmful && !playerImmune(player) && aabb(player, hazard)) {
      hurtPlayer(hazard.sprung ? 'Bạn giẫm phải hố chông!' : 'Bạn va phải quân Hán!');
    }
  });

  // Xác xe (`corpse`) giữ dying = true mãi nên nằm lại map.
  state.hazards = state.hazards.filter(hazard => hazard.alive || hazard.dying);
}

function updateProjectiles(dt) {
  const player = state.player;
  state.projectiles.forEach(projectile => {
    if (!projectile.alive) return;
    projectile.x += projectile.direction * PROJECTILE_SPEED * dt;
    projectile.traveled += PROJECTILE_SPEED * dt;
    projectile.age += dt;
    if (projectile.traveled >= PROJECTILE_MAX_RANGE
      || Math.abs(projectile.x - state.cameraX) > VIEW_W + HAZARD_DESPAWN_MARGIN) {
      projectile.alive = false;
      return;
    }
    // Đang dash thì đạn bay xuyên qua (không tan, không trừ máu).
    if (!playerImmune(player) && aabb(player, projectile)) {
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
  p.x = Math.max(12, Math.min(state.finishX + 96, p.x));

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
    if (!obstacle.overhead && !obstacle.harmful && p.vy >= 0 && previousBottom <= obstacle.y + 5) {
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

  updateAttack();
  updateEnemies(dt);
  updateHazards(dt);
  updateProjectiles(dt);

  state.books.forEach(book => {
    if (book.collected) return;
    const hitbox = { x: book.x - 11, y: book.y - 13, w: 22, h: 26 };
    if (aabb(p, hitbox)) {
      book.collected = true;
      state.booksCollected += 1;
      state.score += 200;
      showMessage(`Đã thu thập sách lịch sử ${state.booksCollected}/5`);
    }
  });

  state.enemies.forEach(enemy => {
    if (!enemy.alive || playerImmune(p)) return;
    if (aabb(p, enemy)) hurtPlayer(enemy.boss ? 'Lính giữ thành phản công!' : 'Bạn bị lính canh đánh trúng!');
  });

  if (LEVEL.id === 1) updateLevel1Events(p);
  if (LEVEL.id === 2) updateMeetings(p, dt);

  if (p.x >= state.finishX) {
    if (bossAlive()) {
      p.x = state.finishX - 18;
      p.vx = 0;
      showMessage('Hãy hạ kiệu quan trước khi qua cổng.');
    } else if (state.booksCollected < state.books.length) {
      p.x = state.finishX - 18;
      p.vx = 0;
      showMessage(`Bạn còn thiếu ${state.books.length - state.booksCollected} cuốn sách lịch sử.`);
    } else if (state.npcs.some(npc => !npc.met)) {
      p.x = state.finishX - 18;
      p.vx = 0;
    } else {
      endGame(true);
    }
  }

  if (p.y > VIEW_H + 96) respawnAfterFall();

  const targetCamera = p.x - VIEW_W * .34;
  const maxCamera = LEVEL.worldWidth - VIEW_W;
  state.cameraX += (Math.max(0, Math.min(maxCamera, targetCamera)) - state.cameraX) * Math.min(1, dt * 6);
  updatePlayerAnimation(dt);
  updateHud();
}

// Mốc sự kiện 1 lần của màn 1 (giữ nguyên theo D1–D2): câu hỏi chunk 8,
// nghỉ chân chunk 9, dòng cốt truyện chunk 10.
function updateLevel1Events(p) {
  if (!state.questionShown && p.x > worldX(8, 312)) {
    state.questionShown = true;
    state.paused = true;
    clearInput();
    ui.question.classList.add('panel--visible');
  }

  if (!state.restUsed && p.x > worldX(9, 282)) {
    state.restUsed = true;
    state.health = Math.min(5, state.health + 1);
    showMessage('Nghỉ chân: hồi 1 máu.');
  }

  if (!state.storyShown && p.x > worldX(10, 312)) {
    state.storyShown = true;
    showMessage('Mê Linh, năm 40: nghĩa quân tập hợp, chuẩn bị phất cờ khởi nghĩa.', 3600);
  }
}

// Màn 2 (TT-NPC-01 §3.2.3–3.2.4). NPC xếp theo thứ tự gặp; chỉ NPC chưa gặp
// ĐẦU TIÊN có tác dụng: giữ người chơi lại trước NPC (như cổng đích), tới đủ
// gần (talkDistance) thì tạm dừng game và mở hội thoại. Gặp xong NPC mờ dần
// rồi biến mất. Cốt truyện Thi Sách hy sinh hiện 1 lần khi vào chunk 2 sau
// khi đã gặp Thi Sách.
function updateMeetings(p, dt) {
  state.npcs.forEach(npc => {
    if (npc.met && npc.fade > 0) npc.fade = Math.max(0, npc.fade - dt / NPC_RULES.fadeTime);
  });

  const npc = state.npcs.find(item => !item.met);
  if (npc) {
    const front = p.x + p.w;
    if (front > npc.centerX - NPC_RULES.holdGap) {
      p.x = npc.centerX - NPC_RULES.holdGap - p.w;
      p.vx = 0;
    }
    if (npc.centerX - (p.x + p.w) <= NPC_RULES.talkDistance) {
      openNpcDialogue(npc, () => { npc.met = true; });
      return;
    }
  }

  const thiSach = state.npcs.find(item => item.id === 'thiSach');
  if (!state.storyShown && thiSach?.met && p.x >= CHUNK_W) {
    state.storyShown = true;
    openStory(STORY_THI_SACH);
  }
}

export function endGame(won) {
  // Thua: render phát animation `death` một lần tính từ mốc này (cùng đồng
  // hồ với timestamp requestAnimationFrame mà draw() nhận).
  if (!won) state.player.deathTime = performance.now() / 1000;
  state.won = true;
  state.running = false;
  clearInput();
  // Hoàn thành màn: ghi tiến trình trước khi hiện panel, rồi mời sang màn sau
  // (D11). Màn 1 ghi tiến trình MỚI (xoá phần của lượt trước — màn 2/3 phải
  // chơi lại); màn 2 giữ dữ liệu màn 1 + phần thưởng đã ghi khi trả lời đúng.
  const toNextLevel = won;
  if (won && LEVEL.id === 1) {
    saveProgress({
      score: state.score, books: state.booksCollected,
      level1Complete: true, level2Complete: false, rewards: []
    });
  } else if (won && LEVEL.id === 2) {
    saveProgress({ score: state.score, level2Complete: true });
  }
  ui.next.hidden = !toNextLevel;
  ui.next.textContent = `Sang Màn ${LEVEL.id + 1}`;
  ui.restart.hidden = toNextLevel;
  ui.endTitle.textContent = won ? `Hoàn thành ${LEVEL.title}` : 'Bạn đã thất bại';
  const summary = LEVEL.id === 2
    ? `Bạn đã gặp đủ ${state.npcs.length} người tài và đạt ${state.score} điểm.`
    : `Bạn thu thập ${state.booksCollected}/5 sách và đạt ${state.score} điểm.`;
  ui.endText.textContent = won ? summary : `Điểm đạt được: ${state.score}. Hãy thử lại nhé.`;
  ui.end.classList.add('panel--visible');
}
