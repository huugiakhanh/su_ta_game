// Vật lý, va chạm, và các phản ứng gameplay (mất máu, rơi hố, tấn công, kết
// thúc màn). Đây là "vòng lặp mô phỏng" chính — mọi thứ khác chỉ đọc/ghi state.

import {
  state, bossAlive, enemyArtKey, makeArenaGuard, makeRusher, makeSpawner, makeToDinhFoot
} from './state.js';
import { keys, pressed, clearInput } from './input.js';
import { ui, showMessage, tickMessage, updateHud } from './ui.js';
import { aabb, groundYAt, worldX, makeProjectile } from './geometry.js';
import {
  CHUNK_W, VIEW_W, VIEW_H, LEVEL, NPC_RULES, NPC_RESCUE, FOOT_MARGIN,
  MOVE_SPEED, GRAVITY, JUMP_FORCE, DASH_SPEED, DASH_TIME, DASH_COOLDOWN, GROUND_SNAP_DISTANCE,
  HURT_ANIMATION_TIME, PROJECTILE_SPEED, PROJECTILE_MAX_RANGE, HAZARD_DESPAWN_MARGIN,
  ATTACK_COOLDOWN, ATTACK_ACTIVE_TIME, PLAYER_SPRITE_ID, PLAYER_ANIMATIONS,
  HAZARD_SPRITES, ENEMY_SPRITES, MINIBOSS, GUARD, GROUND_Y,
  ARENA, RUSHER, SKILLS, ARROW_RAIN_SPRITE, BOSS_TD, WAVES, BOSS_TEXT, WALL_ARROWS
} from './config.js';
import { setAnim, tickAnim, getAnimMeta, hitTime, animLength, createAnim } from './animation.js';
import { saveProgress, REWARD_NAMES } from './progress.js';
import { openNpcDialogue, openStory, openQuiz } from './dialogue.js';
import {
  STORY_THI_SACH, STORY_TO_DINH_FLEES, STORY_LUY_LAU_VICTORY, CHAPTER_END, NPC_DIALOGUES
} from './dialogue-data.js';
import { QUESTIONS } from './questions-data.js';

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
  // Buff Ý chí kiên cường đếm thời gian KỂ TỪ lần trúng đòn gần nhất.
  if (state.skills) state.skills.buff.calm = 0;
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
  // Bóng Trưng Nhị (màn 3) chém cùng lúc với người chơi.
  const shadow = state.skills?.shadow;
  if (shadow && shadow.active > 0) shadow.attack = { time: 0, hits: new Set() };
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

  const attackBox = spearBox(p, p.facing);
  const canHit = target => !p.attackHits.has(target) && target.hitTimer <= 0 && aabb(attackBox, target);
  state.enemies.forEach(enemy => {
    if (!enemy.alive || !canHit(enemy)) return;
    p.attackHits.add(enemy);
    strikeEnemy(enemy);
  });

  // Hazard có `hp` (hổ, kỵ binh, xe cống, lính thu thuế) cũng chém được; loại
  // hp = 0 (kiệu, thuyền, bẫy, tháp canh) thì phải né chứ không phá được.
  state.hazards.forEach(hazard => {
    if (!hazard.alive || hazard.hp <= 0 || !canHit(hazard)) return;
    p.attackHits.add(hazard);
    strikeHazard(hazard);
  });

  // Hũ dầu đang bay (màn 3): chém trúng thì bị PHẢN về phía chiến xa.
  state.jars.forEach(jar => {
    if (jar.alive && !jar.reflected && aabb(attackBox, jarReflectBox(jar))) reflectJar(jar);
  });

  // Đạn đang bay bị chém thì tan — thưởng cho người chơi phản ứng đúng lúc.
  state.projectiles.forEach(projectile => {
    if (projectile.alive && aabb(attackBox, projectile)) {
      projectile.alive = false;
      state.score += 30;
    }
  });
}

// Vùng mũi giáo của một thân người (người chơi, bóng Trưng Nhị): dải 48px
// ngay trước mặt theo `facing`.
function spearBox(body, facing) {
  return {
    x: facing > 0 ? body.x + body.w : body.x - 48,
    y: body.y + 7,
    w: 48,
    h: Math.max(25, body.h - 10)
  };
}

// Một đòn trúng enemy (chém, bóng Trưng Nhị, mưa tên). KHÔNG xét hitTimer —
// đòn chém thường tự chặn khi hitTimer > 0; đòn phụ của kỹ năng thì không
// (để bóng/mưa tên cộng thêm đòn trong cùng lúc). Bao cát (`harmless`) không
// cho điểm.
function strikeEnemy(enemy) {
  // Chiến xa còn khiên: đòn chém (người chơi, bóng) chỉ làm xe nháy mờ + gợi ý.
  if (enemy.shielded) {
    enemy.hitTimer = .18;
    shieldHint();
    return;
  }
  enemy.hp -= 1;
  enemy.hitTimer = .18;
  if (!enemy.harmless) state.score += enemy.boss ? 150 : 100;
  // Tô Định đi bộ: đẩy lùi về phía cổng (áp dụng ở updateFoot, 1 lần/khung);
  // hết máu -> văng kiếm, cutscene.
  if (enemy.kind === 'foot') {
    enemy.pendingPush = FOOT.knockback;
    if (enemy.hp <= 0) {
      state.score += 700;
      defeatToDinh(enemy);
    }
    return;
  }
  if (enemy.hp > 0) return;
  // Tắt va chạm ngay; animation death phát nốt rồi mới xoá (updateEnemies).
  enemy.alive = false;
  enemy.dying = true;
  enemy.action = null;
  setAnim(enemy, 'death');
  if (enemy.harmless) return;
  state.score += enemy.boss ? 700 : 250;
  // Quân cảm tử ra thành đợt đông — không hiện thông báo từng con.
  if (enemy.art === 'rusher') return;
  showMessage(enemy.boss ? 'Đã đánh bại toán lính giữ thành!' : 'Đã đánh bại lính canh.');
}

function strikeHazard(hazard) {
  hazard.hp -= 1;
  hazard.hitTimer = .18;
  state.score += hazard.boss ? MINIBOSS.hitScore : 100;
  if (hazard.hp <= 0) breakHazard(hazard);
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

// Mũi kích/giáo của lính: dải rộng `reach` ngay trước mặt, cao boxH từ
// boxY tính từ đỉnh hitbox.
function meleeBox(enemy, reach, boxY, boxH) {
  return {
    x: enemy.facing > 0 ? enemy.x + enemy.w : enemy.x - reach,
    y: enemy.y + boxY,
    w: reach,
    h: boxH
  };
}

const guardAttackBox = enemy => meleeBox(enemy, GUARD.attackReach, GUARD.attackBoxY, GUARD.attackBoxH);
const rusherAttackBox = enemy => meleeBox(enemy, RUSHER.attackReach, RUSHER.attackBoxY, RUSHER.attackBoxH);

// Cú đâm đang diễn (lính canh, quân cảm tử): gây sát thương khi animation ở
// đúng ô hit_frame (chỉ trong ô đó, 1 lần/cú); hết animation thì `onEnd`
// (bắt đầu nghỉ). Bị chém trúng giữa chừng thì cú đâm bị huỷ.
function advanceMeleeAttack(enemy, dt, art, box, onEnd, message) {
  const meta = getAnimMeta(art.id, art.anims.attack);
  const action = enemy.action;
  if (!meta || enemy.hitTimer > 0) {
    enemy.action = null;
    onEnd();
    return;
  }
  action.time += dt;
  const start = hitTime(meta);
  const p = state.player;
  if (!action.hit && action.time >= start && action.time < start + 1 / meta.fps
    && !playerImmune(p) && aabb(p, box(enemy))) {
    action.hit = true;
    hurtPlayer(message);
  }
  if (action.time >= animLength(meta)) {
    enemy.action = null;
    onEnd();
  }
}

// Lính canh thường: đi tuần trong [patrolMin, patrolMax]; người chơi trong
// aggroRange -> quay về phía người chơi và tiến lại (không ra khỏi đoạn tuần
// tra); tới tầm kích thì đứng lại đâm. Không bị đẩy lùi khi trúng đòn.
function updateGuard(enemy, dt) {
  enemy.attackCooldown = Math.max(0, enemy.attackCooldown - dt);
  if (enemy.action) {
    enemy.walking = false;
    advanceMeleeAttack(enemy, dt, ENEMY_SPRITES.normal, guardAttackBox,
      () => { enemy.attackCooldown = GUARD.attackCooldown; }, 'Bạn bị lính canh đâm trúng!');
    return;
  }
  const p = state.player;
  const center = enemy.x + enemy.w / 2;
  const toPlayer = p.x + p.w / 2 - center;
  let direction;
  // aggroRange riêng (lính đấu trường màn 3 = cả đấu trường), mặc định GUARD.
  if (Math.abs(toPlayer) <= (enemy.aggroRange ?? GUARD.aggroRange)) {
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

// Quân cảm tử (TT-BOSS-01 §3.3): chạy theo `direction` (chọn về phía người
// chơi lúc xuất hiện và sau mỗi lần nghỉ), chạm tường đấu trường thì quay
// đầu; người chơi ở phía trước trong attackRange -> đâm (attack_01, sát
// thương ở ô hit_frame), rồi nghỉ `rest` giây. Không bị đẩy lùi (1 máu).
function updateRusher(enemy, dt) {
  const p = state.player;
  const toPlayer = p.x + p.w / 2 - (enemy.x + enemy.w / 2);
  if (enemy.action) {
    enemy.walking = false;
    advanceMeleeAttack(enemy, dt, ENEMY_SPRITES.rusher, rusherAttackBox,
      () => { enemy.rest = RUSHER.rest; }, 'Bạn bị quân cảm tử đâm trúng!');
    return;
  }
  if (enemy.rest > 0) {
    enemy.walking = false;
    enemy.rest -= dt;
    if (enemy.rest <= 0) enemy.direction = Math.sign(toPlayer) || enemy.direction;
    enemy.facing = enemy.direction;
    return;
  }
  const gap = Math.abs(toPlayer) - (p.w + enemy.w) / 2;
  if (Math.sign(toPlayer) === enemy.direction && gap <= RUSHER.attackRange) {
    enemy.walking = false;
    enemy.facing = enemy.direction;
    enemy.action = { time: 0, hit: false };
    return;
  }
  enemy.walking = true;
  enemy.x += enemy.direction * RUSHER.speed * dt;
  if (enemy.x <= 0) {
    enemy.x = 0;
    enemy.direction = 1;
  } else if (enemy.x + enemy.w >= LEVEL.worldWidth) {
    enemy.x = LEVEL.worldWidth - enemy.w;
    enemy.direction = -1;
  }
  enemy.facing = enemy.direction;
}

// Lính canh / quân cảm tử / boss: hành vi + animation + xoá sau khi phát xong
// death. Trạng thái: death > hurt > attack > walk > idle.
function updateEnemies(dt) {
  state.enemies.forEach(enemy => {
    if (enemy.kind === 'chariot') {
      updateChariot(enemy, dt);
      return;
    }
    if (enemy.kind === 'foot') {
      updateFoot(enemy, dt);
      return;
    }
    const art = ENEMY_SPRITES[enemyArtKey(enemy)];
    if (!enemy.boss && enemy.alive) {
      if (enemy.art === 'rusher') updateRusher(enemy, dt);
      else if (!enemy.harmless) updateGuard(enemy, dt);
    }
    let next = 'idle';
    if (enemy.dying) next = 'death';
    else if (enemy.hitTimer > 0 && art.anims.hurt) next = 'hurt';
    else if (enemy.action && art.anims.attack) next = 'attack';
    else if (enemy.walking && art.anims.walk) next = 'walk';
    setAnim(enemy, next);
    tickAnim(enemy, dt);
    // Cú đâm vẽ theo đúng đồng hồ của action để ô hit_frame khớp lúc gây sát thương.
    if (next === 'attack') enemy.anim.time = enemy.action.time;
    // Không có `idle` riêng (quân cảm tử): đứng ở ô 1 của strip chạy.
    if (next === 'idle' && art.idleHold) enemy.anim.time = 0;
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

// ---- Màn 3: phần thưởng màn 2 thành kỹ năng/buff (TT-BOSS-01 §3.2) ----
const BUFF = SKILLS.BUFF_Y_CHI_KIEN_CUONG;
const RAIN = SKILLS.SK_LE_CHAN_ARROW_RAIN;
const SHADOW = SKILLS.SK_TRUNG_NHI_SHADOW;

function owns(id) {
  return Boolean(state.skills?.owned.has(id));
}

// Mục tiêu có máu mà kỹ năng đánh được. Chiến xa còn khiên (`shielded`):
// mưa tên không tác dụng; bóng Trưng Nhị chém trúng thì xe chỉ nháy mờ + gợi ý
// (includeShielded, xử lý ở strikeEnemy).
function skillTargets(includeShielded = false) {
  return [
    ...state.enemies.filter(enemy => enemy.alive && enemy.hp > 0 && (includeShielded || !enemy.shielded)),
    ...state.hazards.filter(hazard => hazard.alive && hazard.hp > 0)
  ];
}

function strike(target) {
  if (state.enemies.includes(target)) strikeEnemy(target);
  else strikeHazard(target);
}

// Ý chí kiên cường (bị động): máu còn 1 và calmTime giây không trúng đòn ->
// hồi 1 máu; hồi chiêu tính từ lần hồi trước.
function updateBuff(dt) {
  const buff = state.skills.buff;
  buff.cooldown = Math.max(0, buff.cooldown - dt);
  buff.calm += dt;
  if (!owns('BUFF_Y_CHI_KIEN_CUONG')) return;
  if (state.health === 1 && buff.calm >= BUFF.calmTime && buff.cooldown <= 0) {
    state.health += 1;
    buff.cooldown = BUFF.cooldown;
    buff.calm = 0;
    showMessage(`${REWARD_NAMES.BUFF_Y_CHI_KIEN_CUONG}: hồi 1 máu.`);
  }
}

// Mưa tên (K): `count` mũi rải đều trong vùng phía trước người chơi, ra lần
// lượt trong `spread` giây, rơi từ mép trên màn hình. Mỗi lần dùng là một
// `salvo` đếm số mũi đã trúng từng mục tiêu (lính <= perEnemy, boss <= perBoss).
function castArrowRain() {
  const p = state.player;
  state.skills.arrowRain.cooldown = RAIN.cooldown;
  const left = p.facing > 0 ? p.x + p.w + RAIN.offset : p.x - RAIN.offset - RAIN.width;
  const step = RAIN.width / RAIN.count;
  const salvo = new Map();
  for (let i = 0; i < RAIN.count; i += 1) {
    const jitter = (Math.random() * 2 - 1) * RAIN.jitter;
    state.arrows.push({
      salvo, centerX: left + step * (i + .5) + jitter, tipY: 0,
      delay: i * RAIN.spread / RAIN.count, alive: true
    });
  }
}

// Mũi tên mưa: chạm mục tiêu có máu (chưa đủ số mũi của lần dùng này) -> 1
// đòn rồi biến mất; mục tiêu đã đủ thì mũi bay xuyên. Chạm đất -> biến mất.
// Không chặn đạn địch, không ảnh hưởng người chơi.
function updateArrows(dt) {
  const targets = skillTargets();
  state.arrows.forEach(arrow => {
    if (arrow.delay > 0) {
      arrow.delay -= dt;
      return;
    }
    arrow.tipY += RAIN.fallSpeed * dt;
    if (arrow.tipY >= GROUND_Y) {
      arrow.alive = false;
      return;
    }
    const box = {
      x: arrow.centerX - ARROW_RAIN_SPRITE.w / 2, y: arrow.tipY - ARROW_RAIN_SPRITE.h,
      w: ARROW_RAIN_SPRITE.w, h: ARROW_RAIN_SPRITE.h
    };
    const target = targets.find(item => item.alive
      && (arrow.salvo.get(item) || 0) < (item.boss ? RAIN.perBoss : RAIN.perEnemy)
      && aabb(box, item));
    if (!target) return;
    arrow.salvo.set(target, (arrow.salvo.get(target) || 0) + 1);
    arrow.alive = false;
    strike(target);
  });
  state.arrows = state.arrows.filter(arrow => arrow.alive);
}

// Bóng Trưng Nhị (L): đi sau người chơi `gap` px, trễ `delay` giây theo vệt
// di chuyển; `run` khi di chuyển (cả trên không), `idle` khi đứng yên; chém
// cùng lúc với người chơi — trong cửa sổ bắt đầu ở hit_frame của bóng, vùng
// giáo lật theo hướng bóng, mỗi mục tiêu nhận thêm tối đa 1 đòn mỗi cú. Không
// hurtbox, không va chạm, không phản hũ dầu.
function updateShadow(dt) {
  const shadow = state.skills.shadow;
  if (shadow.active <= 0) {
    shadow.cooldown = Math.max(0, shadow.cooldown - dt);
    return;
  }
  shadow.active -= dt;
  if (shadow.active <= 0) {
    shadow.active = 0;
    shadow.cooldown = SHADOW.cooldown;
    shadow.attack = null;
    shadow.pose = null;
    return;
  }
  const p = state.player;
  shadow.clock += dt;
  shadow.trail.push({
    t: shadow.clock, x: p.x, y: p.y, w: p.w, h: p.h, facing: p.facing,
    moving: Math.abs(p.vx) > 1 || !p.grounded
  });
  const target = shadow.clock - SHADOW.delay;
  while (shadow.trail.length > 1 && shadow.trail[1].t <= target) shadow.trail.shift();
  const sample = shadow.trail[0];
  shadow.pose = {
    x: sample.x - sample.facing * SHADOW.gap, y: sample.y, w: sample.w, h: sample.h,
    facing: sample.facing, moving: sample.moving
  };
  setAnim(shadow, shadow.attack ? 'attack' : (sample.moving ? 'run' : 'idle'));
  tickAnim(shadow, dt);
  if (!shadow.attack) return;

  const attack = shadow.attack;
  attack.time += dt;
  shadow.anim.time = attack.time;
  const meta = getAnimMeta(SHADOW.sprite, 'attack_01');
  const start = meta ? hitTime(meta, ATTACK_COOLDOWN) : 0;
  if (attack.time >= start && attack.time < start + ATTACK_ACTIVE_TIME) {
    const box = spearBox(shadow.pose, shadow.pose.facing);
    skillTargets(true).forEach(item => {
      if (!item.alive || attack.hits.has(item) || !aabb(box, item)) return;
      attack.hits.add(item);
      strike(item);
    });
  }
  if (attack.time >= ATTACK_COOLDOWN) shadow.attack = null;
}

function updateSkills(dt) {
  const skills = state.skills;
  skills.arrowRain.cooldown = Math.max(0, skills.arrowRain.cooldown - dt);
  if (pressed.arrowRain && owns('SK_LE_CHAN_ARROW_RAIN') && skills.arrowRain.cooldown <= 0) castArrowRain();
  if (pressed.shadow && owns('SK_TRUNG_NHI_SHADOW') && skills.shadow.active <= 0 && skills.shadow.cooldown <= 0) {
    Object.assign(skills.shadow, { active: SHADOW.duration, trail: [], clock: 0, attack: null });
  }
  updateShadow(dt);
  updateArrows(dt);
  updateBuff(dt);
}

// Sinh quân theo nhóm (layout thử ?layout=skills; Phase B dùng cho các đợt):
// nhóm sau bắt đầu khi quân của nhóm trước chết hết + gap giây; trong nhóm,
// mỗi quân ra ở giây `at` tính từ đầu nhóm, tại ARENA.spawnX + dx.
function spawnEnemy(entry) {
  const centerX = ARENA.spawnX + (entry.dx || 0);
  const p = state.player;
  const direction = Math.sign(p.x + p.w / 2 - centerX) || -1;
  state.enemies.push(entry.type === 'rusher' ? makeRusher(centerX, direction) : makeArenaGuard(centerX));
}

function updateSpawner(dt) {
  const spawner = state.spawner;
  if (!spawner) return;
  if (spawner.pending.length) {
    spawner.time += dt;
    while (spawner.pending.length && spawner.pending[0].at <= spawner.time) spawnEnemy(spawner.pending.shift());
    return;
  }
  if (state.enemies.some(enemy => enemy.alive && !enemy.harmless)) {
    spawner.wait = spawner.gap;
    return;
  }
  if (spawner.index >= spawner.groups.length) {
    if (!spawner.loop) {
      spawner.done = true;
      return;
    }
    spawner.index = 0;
  }
  spawner.wait -= dt;
  if (spawner.wait > 0) return;
  spawner.pending = [...spawner.groups[spawner.index]].sort((a, b) => a.at - b.at);
  spawner.index += 1;
  spawner.time = 0;
  spawner.wait = spawner.gap;
  while (spawner.pending.length && spawner.pending[0].at <= 0) spawnEnemy(spawner.pending.shift());
}

// ---- Màn 3: boss Tô Định giai đoạn 1–2 (TT-BOSS-01 §3.5–3.6) ----
const JAR = BOSS_TD.jar;
const FIRE = BOSS_TD.fire;

const chariotCenter = chariot => chariot.x + chariot.w / 2;
const jarBox = jar => ({ x: jar.x - JAR.w / 2, y: jar.y - JAR.h / 2, w: JAR.w, h: JAR.h });
// Vùng nhận đòn chém để phản hũ (rộng hơn hitbox gây lửa).
const jarReflectBox = jar => ({ x: jar.x - JAR.reflectW / 2, y: jar.y - JAR.reflectH / 2, w: JAR.reflectW, h: JAR.reflectH });
const fireBox = fire => ({ x: fire.x - FIRE.width / 2, y: fire.footY - FIRE.h, w: FIRE.width, h: FIRE.h });

function facePlayer(chariot) {
  const p = state.player;
  chariot.facing = Math.sign(p.x + p.w / 2 - chariotCenter(chariot)) || chariot.facing;
}

function setChariotMode(chariot, mode) {
  chariot.mode = mode;
  chariot.modeTime = 0;
}

function startThrowCycle(chariot) {
  setChariotMode(chariot, 'throw');
  chariot.throwsLeft = BOSS_TD.throwCount;
  chariot.throwTimer = 0;
  chariot.action = null;
}

// Gợi ý khi chém thẳng vào xe còn khiên — tối đa 1 lần mỗi hintInterval giây.
function shieldHint() {
  const battle = state.battle;
  if (!battle || battle.hintTimer > 0) return;
  battle.hintTimer = BOSS_TD.hintInterval;
  showMessage(BOSS_TEXT.shieldHint, 2400);
}

// Mất 1 nấc khiên (đâm cột / trúng hũ dầu phản). Hết khiên: phát shield_break
// một lần, xác xe nằm lại (không va chạm), hũ đang bay tan, sang giai đoạn 2
// (updateBattle).
function loseShield(chariot) {
  chariot.shield -= 1;
  chariot.hp = chariot.shield;
  state.score += BOSS_TD.shieldScore;
  if (chariot.shield > 0) return;
  chariot.shielded = false;
  chariot.alive = false;
  chariot.dying = true;
  chariot.action = null;
  setAnim(chariot, 'death');
  state.score += BOSS_TD.breakScore;
  state.jars = [];
  showMessage(BOSS_TEXT.shieldBroken, 3200);
}

// Cột đá bị xe đâm: nguyên -> nứt; đang nứt -> bỏ va chạm ngay, mờ dần
// pillarFade giây rồi biến mất (updatePillars).
function hitPillar(pillar) {
  if (pillar.state === 'intact') {
    pillar.state = 'cracked';
    return;
  }
  pillar.broken = true;
  pillar.alpha = 1;
}

function updatePillars(dt) {
  state.obstacles.forEach(obstacle => {
    if (!obstacle.broken || !obstacle.active) return;
    obstacle.alpha = Math.max(0, obstacle.alpha - dt / BOSS_TD.pillarFade);
    if (obstacle.alpha <= 0) obstacle.active = false;
  });
}

// Hũ dầu: bay vòng cung, rơi đúng vị trí ngang của người chơi lúc ném sau
// flightTime giây (tính sẵn vx, vy ban đầu theo trọng lực của hũ).
function throwJar(chariot) {
  const p = state.player;
  const x = chariotCenter(chariot) + chariot.facing * BOSS_TD.muzzleX;
  const y = GROUND_Y - BOSS_TD.muzzle;
  const targetX = Math.max(8, Math.min(LEVEL.worldWidth - 8, p.x + p.w / 2));
  const time = JAR.flightTime;
  state.jars.push({
    x, y,
    vx: (targetX - x) / time,
    vy: (GROUND_Y - y - .5 * JAR.gravity * time * time) / time,
    age: 0, reflected: false, alive: true
  });
}

// Đòn chém của NGƯỜI CHƠI trúng hũ đang bay: hũ bay thẳng về phía xe
// reflectSpeed px/s (xe đã hỏng thì bay ngược lại hướng cũ, ra khỏi đấu trường).
function reflectJar(jar) {
  const chariot = state.battle?.chariot;
  const direction = chariot?.alive
    ? Math.sign(chariotCenter(chariot) - jar.x) || 1
    : -Math.sign(jar.vx) || 1;
  jar.reflected = true;
  jar.vx = direction * JAR.reflectSpeed;
  jar.vy = 0;
  state.score += BOSS_TD.reflectScore;
}

function spawnFire(x, footY, harmless) {
  state.fires.push({ x, footY, time: 0, harmless, hit: false });
}

// Hũ thường: chạm người chơi (không đang miễn thương) hoặc chạm đất -> lửa tại
// chỗ. Hũ bị phản: chỉ tính khi trúng hitbox thân xe còn khiên (Q6) -> mất 1
// nấc, lửa trên thân xe (vô hại), không choáng; trượt thì bay ra khỏi đấu trường.
function updateJars(dt) {
  const p = state.player;
  const chariot = state.battle.chariot;
  state.jars.forEach(jar => {
    jar.age += dt;
    if (jar.reflected) {
      jar.x += jar.vx * dt;
      if (chariot.alive && chariot.shielded && aabb(jarBox(jar), chariot)) {
        jar.alive = false;
        spawnFire(chariotCenter(chariot), chariot.y + chariot.h - 20, true);
        loseShield(chariot);
        return;
      }
      if (jar.x < -16 || jar.x > LEVEL.worldWidth + 16) jar.alive = false;
      return;
    }
    jar.vy += JAR.gravity * dt;
    jar.x += jar.vx * dt;
    jar.y += jar.vy * dt;
    const hitPlayer = !playerImmune(p) && aabb(p, jarBox(jar));
    if (hitPlayer || jar.y + JAR.h / 2 >= GROUND_Y) {
      jar.alive = false;
      spawnFire(jar.x, GROUND_Y, false);
    }
  });
  state.jars = state.jars.filter(jar => jar.alive);
}

// Đám lửa: gây 1 sát thương, mỗi đám trúng người chơi tối đa 1 lần; dash né được.
function updateFires(dt) {
  const p = state.player;
  state.fires.forEach(fire => {
    fire.time += dt;
    if (fire.harmless || fire.hit || playerImmune(p) || !aabb(p, fireBox(fire))) return;
    fire.hit = true;
    hurtPlayer('Bạn bị lửa dầu thiêu!');
  });
  state.fires = state.fires.filter(fire => fire.time < FIRE.time);
}

// Máy trạng thái chiến xa: throw (ném throwCount hũ, cách nhau throwInterval)
// -> warn (đứng báo trước, render rung 1 px) -> charge (lao về phía người chơi)
// -> đâm cột: dừng ở mép cột, mất 1 nấc, cột nứt/vỡ, stun | đâm tường: wall
// (đứng rồi quay đầu) -> throw...
function chariotBehavior(chariot, dt) {
  chariot.modeTime += dt;
  if (chariot.mode === 'throw') {
    facePlayer(chariot);
    if (chariot.action) {
      const meta = getAnimMeta(ENEMY_SPRITES.boss.id, ENEMY_SPRITES.boss.anims.throw);
      chariot.action.time += dt;
      if (!chariot.action.released && chariot.action.time >= (meta ? hitTime(meta) : 0)) {
        chariot.action.released = true;
        throwJar(chariot);
      }
      if (chariot.action.time >= (meta ? animLength(meta) : 0)) chariot.action = null;
    }
    chariot.throwTimer -= dt;
    if (!chariot.action && chariot.throwTimer <= 0) {
      if (chariot.throwsLeft > 0) {
        chariot.throwsLeft -= 1;
        chariot.throwTimer = BOSS_TD.throwInterval;
        chariot.action = { time: 0, released: false };
      } else {
        setChariotMode(chariot, 'warn');
      }
    }
  } else if (chariot.mode === 'warn') {
    facePlayer(chariot);
    if (chariot.modeTime >= BOSS_TD.warnTime) {
      chariot.direction = chariot.facing;
      setChariotMode(chariot, 'charge');
    }
  } else if (chariot.mode === 'charge') {
    chariot.facing = chariot.direction;
    const prevLeft = chariot.x;
    const prevRight = chariot.x + chariot.w;
    chariot.x += chariot.direction * BOSS_TD.chargeSpeed * dt;
    const pillar = state.obstacles.find(obstacle => obstacle.active && obstacle.blocking && !obstacle.broken
      && (chariot.direction > 0
        ? prevRight <= obstacle.x && chariot.x + chariot.w > obstacle.x
        : prevLeft >= obstacle.x + obstacle.w && chariot.x < obstacle.x + obstacle.w));
    if (pillar) {
      // Dừng đúng mép cột (không chồng hitbox với người chơi đứng sau cột).
      chariot.x = chariot.direction > 0 ? pillar.x - chariot.w : pillar.x + pillar.w;
      hitPillar(pillar);
      loseShield(chariot);
      if (chariot.alive) setChariotMode(chariot, 'stun');
      return;
    }
    if (chariot.x <= 0 || chariot.x + chariot.w >= LEVEL.worldWidth) {
      chariot.x = Math.max(0, Math.min(LEVEL.worldWidth - chariot.w, chariot.x));
      setChariotMode(chariot, 'wall');
    }
  } else if (chariot.mode === 'stun') {
    if (chariot.modeTime >= BOSS_TD.stunTime) startThrowCycle(chariot);
  } else if (chariot.mode === 'wall') {
    if (chariot.modeTime >= BOSS_TD.wallPause) {
      facePlayer(chariot);
      startThrowCycle(chariot);
    }
  }
}

// Chiến xa: hành vi + animation (death > throw > charge > stun > idle /
// idle_cracked khi còn 1 nấc). Xác xe (`corpse`) giữ dying = true, đứng ở ô cuối.
function updateChariot(chariot, dt) {
  if (chariot.alive) chariotBehavior(chariot, dt);
  let next;
  if (!chariot.alive) next = 'death';
  else if (chariot.mode === 'throw' && chariot.action) next = 'throw';
  else if (chariot.mode === 'charge') next = 'charge';
  else if (chariot.mode === 'stun') next = 'stun';
  else next = chariot.shield === 1 ? 'idleCracked' : 'idle';
  setAnim(chariot, next);
  tickAnim(chariot, dt);
  if (next === 'throw') chariot.anim.time = chariot.action.time;
}

// Tiến trình trận: giai đoạn 1 (chiến xa) -> hết khiên -> giai đoạn 2 (Tô Định
// đứng sau xác xe, 3 đợt thân binh WAVES) -> hết đợt 3 -> giai đoạn 3 (Phase C).
function updateBattle(dt) {
  const battle = state.battle;
  battle.phaseTime += dt;
  battle.hintTimer = Math.max(0, battle.hintTimer - dt);
  updateJars(dt);
  updateFires(dt);
  updatePillars(dt);
  if (battle.phase === 1 && !battle.chariot.alive) {
    battle.phase = 2;
    battle.phaseTime = 0;
    battle.foot = { x: BOSS_TD.footX, anim: createAnim('idle') };
    state.spawner = makeSpawner(WAVES.groups, WAVES.gap, false);
  } else if (battle.phase === 2 && state.spawner?.done) {
    startPhase3(battle);
  }
  if (battle.phase === 3) updatePhase3Rushers(dt);
  updateWallArrows(dt);
  if (battle.foot) tickAnim(battle.foot, dt);
}

// ---- Màn 3: giai đoạn 3, mưa tên trên thành, cutscene kết chương (§3.7–3.9) ----
const FOOT = BOSS_TD.foot;
const CUT = BOSS_TD.cutscene;

// Vào giai đoạn 3: Tô Định (đi bộ) đứng tại footX thành mục tiêu BOSS_TD.foot.hp máu, không
// tấn công (`passive`); quân cảm tử ra định kỳ từ cổng.
function startPhase3(battle) {
  battle.phase = 3;
  battle.phaseTime = 0;
  battle.foot = null;
  state.spawner = null;
  battle.todinh = makeToDinhFoot(BOSS_TD.footX);
  battle.rusherTimer = FOOT.rusherInterval;
  state.enemies.push(battle.todinh);
  showMessage(BOSS_TEXT.phase3, 2600);
}

function updatePhase3Rushers(dt) {
  const battle = state.battle;
  battle.rusherTimer -= dt;
  if (battle.rusherTimer > 0) return;
  battle.rusherTimer = FOOT.rusherInterval;
  const rushers = state.enemies.filter(enemy => enemy.alive && enemy.art === 'rusher').length;
  if (rushers < FOOT.rusherMax) spawnEnemy({ type: 'rusher', dx: 0 });
}

// Tô Định đi bộ: run rẩy tại chỗ (`idle`) quay về phía người chơi; trúng đòn
// phát `hurt` và bị đẩy lùi về phía cổng (1 lần mỗi khung — đòn người chơi +
// bóng Trưng Nhị cùng khung chỉ đẩy 1 lần); hết máu `disarmed`; cutscene `flee`.
function updateFoot(foot, dt) {
  if (foot.pendingPush) {
    foot.x = Math.min(FOOT.maxX - foot.w / 2, foot.x + foot.pendingPush);
    foot.pendingPush = 0;
  }
  if (foot.fleeing) {
    foot.x -= FOOT.fleeSpeed * dt;
    foot.facing = -1;
  } else if (!foot.disarmed) {
    facePlayer(foot);
  }
  let next = 'idle';
  if (foot.fleeing) next = 'flee';
  else if (foot.disarmed) next = 'disarmed';
  else if (foot.hitTimer > 0) next = 'hurt';
  setAnim(foot, next);
  tickAnim(foot, dt);
}

// Tô Định hết máu: dừng mọi quân địch (phát death) và đạn, phát `disarmed` 1
// lần -> cutscene. Người chơi mất quyền điều khiển từ đây.
function defeatToDinh(foot) {
  foot.alive = false;
  foot.dying = true;
  foot.disarmed = true;
  foot.hitTimer = 0;
  state.enemies.forEach(enemy => {
    if (enemy === foot || !enemy.alive) return;
    enemy.alive = false;
    enemy.dying = true;
    enemy.action = null;
    setAnim(enemy, 'death');
  });
  state.jars = [];
  state.fires = [];
  state.projectiles = [];
  state.arrows = [];
  state.wallArrows = [];
  if (state.skills) Object.assign(state.skills.shadow, { active: 0, attack: null, pose: null });
  const p = state.player;
  Object.assign(p, { dashing: false, dashTimer: 0, attackCooldown: 0, attacking: false, hurtTimer: 0, invulnerable: 0, vx: 0 });
  clearInput();
  state.cutscene = { step: 'disarm', time: 0, fade: 0 };
}

// Mưa tên trên thành: vạch báo warnTime giây rồi tên rơi; trúng người chơi (không
// miễn thương) -1 máu. Không trúng quân địch.
function updateWallArrows(dt) {
  const battle = state.battle;
  const p = state.player;
  if (ARENA.wallArrows && battle.phaseTime >= WALL_ARROWS.phasePause) {
    battle.wallTimer -= dt;
    if (battle.wallTimer <= 0) {
      battle.wallTimer = WALL_ARROWS.interval;
      const center = p.x + p.w / 2;
      for (let i = 0; i < WALL_ARROWS.count; i += 1) {
        const x = center + (Math.random() * 2 - 1) * WALL_ARROWS.spread;
        state.wallArrows.push({ x: Math.max(8, Math.min(LEVEL.worldWidth - 8, x)), warn: WALL_ARROWS.warnTime, tipY: 0, alive: true });
      }
    }
  }
  state.wallArrows.forEach(arrow => {
    if (arrow.warn > 0) {
      arrow.warn -= dt;
      return;
    }
    arrow.tipY += WALL_ARROWS.fallSpeed * dt;
    const box = {
      x: arrow.x - ARROW_RAIN_SPRITE.w / 2, y: arrow.tipY - ARROW_RAIN_SPRITE.h,
      w: ARROW_RAIN_SPRITE.w, h: ARROW_RAIN_SPRITE.h
    };
    if (!playerImmune(p) && aabb(p, box)) {
      arrow.alive = false;
      hurtPlayer('Bạn trúng tên trên thành!');
      return;
    }
    if (arrow.tipY >= GROUND_Y) arrow.alive = false;
  });
  state.wallArrows = state.wallArrows.filter(arrow => arrow.alive);
}

function cutsceneStep(step) {
  state.cutscene.step = step;
  state.cutscene.time = 0;
}

// Cutscene kết chương (§3.8), người chơi không điều khiển:
//   disarm  -> Tô Định phát `disarmed` rồi đứng thêm disarmHold
//   fadeOut -> tối dần; hết tối: panel cốt truyện câu 1–2 (PORTRAIT_TO_DINH)
//   fadeIn  -> sáng lại, Tô Định (đã cải trang) `flee` chạy sang trái ra khỏi màn hình
//   walk    -> Trưng Trắc tự đi tới trước cổng; tới nơi: cổng mở, cờ, `victory`
//   victory -> đứng victoryHold rồi panel cốt truyện câu 3–4 (PORTRAIT_TRUNG_TRAC)
//   -> panel kết chương (endGame).
// Panel cốt truyện đặt state.paused nên update() dừng tới khi đóng panel.
function updateCutscene(dt) {
  const cut = state.cutscene;
  const p = state.player;
  const foot = state.battle.todinh;
  cut.time += dt;
  tickMessage(dt);
  let playerAnim = 'idle';

  if (cut.step === 'disarm') {
    const meta = getAnimMeta(ENEMY_SPRITES.bossFoot.id, ENEMY_SPRITES.bossFoot.anims.disarmed);
    if (cut.time >= (meta ? animLength(meta) : 0) + CUT.disarmHold) cutsceneStep('fadeOut');
  } else if (cut.step === 'fadeOut') {
    cut.fade = Math.min(1, cut.time / CUT.fadeTime);
    if (cut.fade >= 1) {
      // Đang tối hẳn: đưa người chơi về mặt đất (có thể đang đứng trên cột).
      p.y = GROUND_Y - p.h;
      p.vy = 0;
      p.grounded = true;
      cutsceneStep('story1');
      openStory(STORY_TO_DINH_FLEES, () => cutsceneStep('fadeIn'));
    }
  } else if (cut.step === 'fadeIn') {
    cut.fade = Math.max(0, 1 - cut.time / CUT.fadeTime);
    foot.disarmed = false;
    foot.fleeing = true;
    if (cut.fade <= 0 && foot.x + foot.w < state.cameraX - 8) {
      foot.dying = false;
      cutsceneStep('walk');
    }
  } else if (cut.step === 'walk') {
    const target = ARENA.gateX - p.w / 2;
    const direction = Math.sign(target - p.x);
    p.facing = direction || p.facing;
    p.x += direction * CUT.walkSpeed * dt;
    playerAnim = 'run';
    if (direction === 0 || Math.sign(target - p.x) !== direction) {
      p.x = target;
      p.facing = 1;
      state.gateOpen = true;
      cutsceneStep('victory');
    }
  } else if (cut.step === 'victory') {
    playerAnim = 'victory';
    if (cut.time >= CUT.victoryHold) {
      cutsceneStep('story2');
      openStory(STORY_LUY_LAU_VICTORY, () => cutsceneStep('end'));
    }
  } else if (cut.step === 'story2') {
    playerAnim = 'victory';
  } else if (cut.step === 'end') {
    playerAnim = 'victory';
    state.cutscene = null;
    endGame(true);
    return;
  }

  setAnim(p, playerAnim);
  tickAnim(p, dt);
  updateEnemies(dt);
  updateCamera(dt);
  updateHud();
}

function updateCamera(dt) {
  const p = state.player;
  // Đấu trường: neo tâm người chơi (địch đến từ cả 2 phía); màn thường nhìn
  // xa phía trước. Cùng kẹp [0, worldWidth − VIEW_W].
  const targetCamera = LEVEL.arena ? p.x + p.w / 2 - VIEW_W / 2 : p.x - VIEW_W * .34;
  const maxCamera = LEVEL.worldWidth - VIEW_W;
  state.cameraX += (Math.max(0, Math.min(maxCamera, targetCamera)) - state.cameraX) * Math.min(1, dt * 6);
}

// Cơ chế lướt lấy theo level-test: một cú lao nhanh, có thời gian cố định,
// không thu nhỏ nhân vật thành tư thế quỳ và có thể dùng cả khi đang ở trên không.
export function startDash() {
  const p = state.player;
  if (p.dashing || p.dashCooldown > 0) return;
  p.dashing = true;
  p.dashTimer = DASH_TIME;
  p.dashCooldown = DASH_COOLDOWN;
  p.vx = p.facing * DASH_SPEED;
}

export function update(dt) {
  if (!state.running || state.paused || state.won) return;
  if (state.cutscene) {
    updateCutscene(dt);
    return;
  }
  const p = state.player;
  const previousBottom = p.y + p.h;

  tickMessage(dt);

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
  }
  pressed.jump = false;

  if (pressed.attack) startAttack();
  pressed.attack = false;

  const wasGrounded = p.grounded;
  p.vy += GRAVITY * dt;
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  // Đấu trường (màn 3): tường vô hình ở 0 và worldWidth.
  if (LEVEL.arena) p.x = Math.max(0, Math.min(LEVEL.worldWidth - p.w, p.x));
  else p.x = Math.max(12, Math.min(state.finishX + 96, p.x));
  // Đã rơi xuống dưới mặt đất trong hố: kẹp giữa 2 vách hố (không đi xuyên
  // vào lòng đất) tới khi rơi hết và respawnAfterFall().
  if (previousBottom > GROUND_Y + GROUND_SNAP_DISTANCE) {
    const hole = state.holes.find(item => p.x + p.w / 2 > item.x && p.x + p.w / 2 < item.x + item.w);
    if (hole) p.x = Math.max(hole.x, Math.min(hole.x + hole.w - p.w, p.x));
  }

  p.grounded = false;
  const groundY = playerGroundY(p, move);
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

  // Vật cản người chơi đang đứng trên (cột đá: xe đâm cột thì không tính va chạm).
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
      // Cột đá (Q1): va ngang thì bị đẩy ra mép gần nhất, không mất máu.
      p.x = p.x + p.w / 2 < obstacle.x + obstacle.w / 2 ? obstacle.x - p.w : obstacle.x + obstacle.w;
      p.vx = 0;
    } else {
      hurtPlayer(obstacle.harmful ? 'Bạn va vào bẫy!' : 'Hãy nhảy hoặc lướt qua chướng ngại vật.');
    }
  }

  // Nếu thời gian lướt vừa hết khi nhân vật còn nằm trong vùng vật cản,
  // duy trì dash tới khi ra khỏi vật để không bị mất máu ở khung hình cuối.
  const insideDashObstacle = state.obstacles.some(obstacle =>
    obstacle.active && obstacle.requiresDash && aabb(p, obstacle)
  );
  // Dash xuyên chiến xa (màn 3): còn chồng thân xe thì kéo dài cú lướt (tối
  // đa thêm DASH_TIME — xe sát tường/cột thì không kẹt mãi trong cú lướt).
  const chariot = state.battle?.chariot;
  const insideChariot = chariot?.alive && aabb(p, chariot) && p.dashTimer > -DASH_TIME;
  if (p.dashing && p.dashTimer <= 0 && !insideDashObstacle && !insideChariot) {
    p.dashing = false;
    p.dashTimer = 0;
  }

  updateAttack();
  if (state.skills) updateSkills(dt);
  pressed.arrowRain = false;
  pressed.shadow = false;
  updateEnemies(dt);
  updateHazards(dt);
  updateProjectiles(dt);
  updateSpawner(dt);
  if (state.battle) updateBattle(dt);
  if (state.cutscene) {
    updatePlayerAnimation(dt);
    updateHud();
    return;
  }

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
    if (!enemy.alive || enemy.harmless || enemy.passive || playerImmune(p)) return;
    if (!aabb(p, enemy)) return;
    if (enemy.kind === 'chariot') {
      // Đứng trên cột đá: không tính va chạm với xe đứng sát cột.
      if (!p.standingOn?.blocking) hurtPlayer('Bạn bị chiến xa húc trúng!');
    } else if (enemy.boss) hurtPlayer('Lính giữ thành phản công!');
    else hurtPlayer(enemy.art === 'rusher' ? 'Bạn bị quân cảm tử đâm trúng!' : 'Bạn bị lính canh đánh trúng!');
  });

  // Câu hỏi chặn đường (màn 1–2) mở thì dừng game — sự kiện màn chờ frame sau.
  if (!updateQuizzes(p)) {
    if (LEVEL.id === 1) updateLevel1Events(p);
    if (LEVEL.id === 2) updateMeetings(p, dt);
  }

  // Đấu trường không có điểm về đích (kết thúc bằng boss — Phase B/C).
  if (!LEVEL.arena && p.x >= state.finishX) {
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

  updateCamera(dt);
  updatePlayerAnimation(dt);
  updateHud();
}

// Câu hỏi chặn đường (TT-QUIZ-01): chạm mốc `quiz.x` thì mở câu hỏi 1 lần
// (khung hội thoại tự dừng game; trả lời 1 lần — dialogue.js). Màn 2: tiêu đề
// "Câu hỏi về <NPC>". Trả về true nếu vừa mở câu hỏi.
function updateQuizzes(p) {
  const quiz = state.quizzes.find(item => !item.done && p.x > item.x);
  if (!quiz) return false;
  quiz.done = true;
  const title = quiz.npc ? `Câu hỏi về ${NPC_DIALOGUES[quiz.npc].name}` : 'Câu hỏi lịch sử';
  openQuiz(QUESTIONS[quiz.stt], { title });
  return true;
}

// Mốc sự kiện 1 lần của màn 1 (giữ nguyên theo D1–D2): nghỉ chân chunk 9,
// dòng cốt truyện chunk 10. (Câu hỏi chunk 8 cũ -> updateQuizzes.)
function updateLevel1Events(p) {
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
// rồi biến mất. Cốt truyện Thi Sách hy sinh hiện 1 lần khi vào chunk kế tiếp sau
// khi đã gặp Thi Sách. Giải cứu (TT-L2-HARD): còn lính vây NPC (enemy
// `captorOf`) sống thì vẫn giữ người chơi nhưng KHÔNG mở hội thoại, và nhắc
// hạ lính vây (tối đa 1 lần mỗi NPC_RESCUE.hintInterval giây).
function updateMeetings(p, dt) {
  state.npcs.forEach(npc => {
    if (npc.met && npc.fade > 0) npc.fade = Math.max(0, npc.fade - dt / NPC_RULES.fadeTime);
  });
  state.rescueHintTimer = Math.max(0, (state.rescueHintTimer || 0) - dt);

  const npc = state.npcs.find(item => !item.met);
  if (npc) {
    const front = p.x + p.w;
    if (front > npc.centerX - NPC_RULES.holdGap) {
      p.x = npc.centerX - NPC_RULES.holdGap - p.w;
      p.vx = 0;
    }
    const distance = npc.centerX - (p.x + p.w);
    const captive = state.enemies.some(enemy => enemy.captorOf === npc.id && enemy.alive);
    if (captive && distance <= NPC_RESCUE.hintRange && state.rescueHintTimer <= 0) {
      state.rescueHintTimer = NPC_RESCUE.hintInterval;
      showMessage(`Hãy hạ lính canh đang vây ${NPC_DIALOGUES[npc.id].name}!`, 2400);
    }
    if (!captive && distance <= NPC_RULES.talkDistance) {
      openNpcDialogue(npc, () => { npc.met = true; });
      return;
    }
  }

  const thiSach = state.npcs.find(item => item.id === 'thiSach');
  // Cốt truyện hiện khi vào chunk ngay sau chunk của Thi Sách.
  const storyX = (Math.floor(thiSach?.centerX / CHUNK_W) + 1) * CHUNK_W;
  if (!state.storyShown && thiSach?.met && p.x >= storyX) {
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
      level1Complete: true, level2Complete: false, level3Complete: false, rewards: []
    });
  } else if (won && LEVEL.id === 2) {
    saveProgress({ score: state.score, level2Complete: true });
  } else if (won && LEVEL.id === 3) {
    saveProgress({ score: state.score, level3Complete: true });
  }
  ui.next.hidden = !toNextLevel;
  ui.next.textContent = `Sang Màn ${LEVEL.id + 1}`;
  ui.restart.hidden = toNextLevel;
  // Màn 3: thua thì đánh lại trận từ đầu (máu đầy, điểm mang sang từ màn 2).
  ui.restart.textContent = LEVEL.arena ? 'Đánh lại' : 'Chơi lại';
  ui.endTitle.textContent = won ? `Hoàn thành ${LEVEL.title}` : 'Bạn đã thất bại';
  const summary = LEVEL.id === 2
    ? `Bạn đã gặp đủ ${state.npcs.length} người tài và đạt ${state.score} điểm.`
    : `Bạn thu thập ${state.booksCollected}/5 sách và đạt ${state.score} điểm.`;
  ui.endText.textContent = won ? summary : `Điểm đạt được: ${state.score}. Hãy thử lại nhé.`;
  // Hết chương (thắng màn 3): panel kết chương mục 5.4 + "Chơi lại chương" /
  // "Về trang chủ" thay cho nút sang màn sau.
  const chapterEnd = won && LEVEL.id === 3;
  ui.replayChapter.hidden = !chapterEnd;
  ui.home.hidden = !chapterEnd;
  if (chapterEnd) {
    ui.next.hidden = true;
    ui.endTitle.textContent = CHAPTER_END.title;
    ui.endText.textContent = CHAPTER_END.text(state.score);
  }
  ui.end.classList.add('panel--visible');
}
