// Màn 3: trận boss Tiêu Tư (LND-L3, docs/SUTA_LND_TASK_L3_01.md mục 2):
//   GĐ 1 — Tiêu Tư trên thành ra lệnh máy bắn đá + 3 lượt cận vệ khiên sắt (khiên
//          chặn đòn phía trước, phải nhảy qua đầu chém sau lưng);
//   GĐ 2 — 2 lượt xe hoả công (chỉ Triều Cường dập lửa, xe chết máy mới phá được);
//   GĐ 3 — Tiêu Tư nhảy xuống thành, chém kiếm + ném vàng (choáng), hết máu -> cutscene.
// Gắn vào engine qua LEVEL.update (updateBattle), LEVEL.cutscene, CHAPTER.enemyKinds,
// CHAPTER.hooks.

import { state } from '../../engine/state.js';
import { clearInput } from '../../engine/input.js';
import { ui, showMessage, tickMessage, updateHud } from '../../engine/ui.js';
import { aabb } from '../../engine/geometry.js';
import { setAnim, tickAnim, getAnimMeta, hitTime, animLength, createAnim } from '../../engine/animation.js';
import { GROUND_Y, VIEW_W } from '../../engine/config.js';
import { LEVEL } from '../../engine/chapter.js';
import { openStory } from '../../engine/dialogue.js';
import { playSfx, stopMusic } from '../../engine/audio.js';
import { hurtPlayer, stunPlayer, playerImmune } from '../../engine/damage.js';
import { strikeEnemy } from '../../engine/combat.js';
import { updateEnemies } from '../../engine/enemies.js';
import { updateCamera, shakeCamera } from '../../engine/level-flow.js';
import { endGame } from '../../engine/end-game.js';
import {
  ARENA, BOSS_TT, CATAPULT, SHIELD_GUARD, FIRE_CART, ARENA_SOLDIERS, GOLD_COIN, BOSS_TEXT, LND_CUTSCENE, SKILL_TEST,
  HEAL_DROP
} from './config.js';
import { STORY_TIEU_TU_FLEES, STORY_LND_VICTORY } from './dialogue-data.js';
import { makeShieldGuard, makeFireCart, makeTieuTu, makeArenaSoldier } from './level3.js';

// Mặt thành (y) — Tiêu Tư, máy bắn đá, Lý Bí cutscene đứng ở đây.
export const WALL_Y = GROUND_Y - ARENA.wallTop;

const centerOf = body => body.x + body.w / 2;
const clampX = (entity, x) => Math.max(0, Math.min(LEVEL.worldWidth - entity.w, x));

// Thời lượng animation `name` của sprite `id` (manifest); thiếu thì 0.
function animSeconds(id, name) {
  const meta = getAnimMeta(id, name);
  return meta ? animLength(meta) : 0;
}

function hitSeconds(id, name) {
  const meta = getAnimMeta(id, name);
  return meta ? hitTime(meta) : 0;
}

// Hướng từ entity tới người chơi (−1 / 1); trùng tâm thì giữ `fallback`.
function towardPlayer(entity, fallback = -1) {
  return Math.sign(centerOf(state.player) - centerOf(entity)) || fallback;
}

// Khoảng trống giữa mép entity và mép người chơi (0 nếu chồng nhau).
function edgeGap(entity) {
  const p = state.player;
  return Math.max(0, Math.max(p.x - (entity.x + entity.w), entity.x - (p.x + p.w)));
}

// Ô đánh tính từ pivot (tâm, chân) của entity quay `facing`: [near, reach] ngang
// × [low, high] trên chân (px logic, config.js).
function strikeBox(entity, facing, box) {
  const center = centerOf(entity);
  const feet = entity.y + entity.h;
  const x0 = facing > 0 ? center + box.near : center - box.reach;
  return { x: x0, y: feet - box.high, w: box.reach - box.near, h: box.high - box.low };
}

function showHint(text) {
  const battle = state.battle;
  if (battle.hintTimer > 0) return;
  battle.hintTimer = SHIELD_GUARD.hintInterval;
  showMessage(text, 2400);
}

// ---- Tiêu Tư trên thành + máy bắn đá (GĐ 1–2) ----
// Lệnh `command`: ở hit_frame máy bắn đá bắn vào chỗ người chơi đang đứng.
function startShot() {
  const catapult = state.battle.catapult;
  if (!catapult || catapult.shot) return;
  const targetX = Math.max(12, Math.min(LEVEL.worldWidth - 12, centerOf(state.player)));
  catapult.facing = Math.sign(targetX - CATAPULT.x) || -1;
  catapult.shot = { time: 0, targetX, released: false };
  setAnim(catapult, 'fire');
  catapult.anim.time = 0;
  playSfx('catapultCreak');
}

function updateCommander(dt) {
  const battle = state.battle;
  const commander = battle.commander;
  if (!commander) return;
  if (commander.action) {
    commander.action.time += dt;
    if (!commander.action.released && commander.action.time >= hitSeconds(BOSS_TT.id, 'command')) {
      commander.action.released = true;
      if (commander.action.order === 'catapult') startShot();
    }
    if (commander.action.time >= animSeconds(BOSS_TT.id, 'command')) commander.action = null;
  } else {
    commander.timer -= dt;
    if (commander.timer <= 0) {
      commander.timer = battle.phase === 1 ? BOSS_TT.commandInterval : BOSS_TT.commandIntervalP2;
      commander.action = { time: 0, released: false, order: 'catapult' };
    }
  }
  setAnim(commander, commander.action ? 'command' : 'idle');
  tickAnim(commander, dt);
  if (commander.action) commander.anim.time = commander.action.time;
}

// Đá rời rổ ở hit_frame của `fire`: bay vòng cung tới vạch báo sau flightTime giây.
function releaseBoulder(catapult, shot) {
  const x = CATAPULT.x + catapult.facing * CATAPULT.release.x;
  const y = WALL_Y - CATAPULT.release.y;
  const time = CATAPULT.flightTime;
  const landY = GROUND_Y - CATAPULT.radius;
  state.battle.boulders.push({
    x, y, targetX: shot.targetX,
    vx: (shot.targetX - x) / time,
    vy: (landY - y - .5 * GOLD_COIN.gravity * time * time) / time,
    broken: false, breakTime: 0, anim: createAnim('roll')
  });
  playSfx('catapultFire');
}

function updateCatapult(dt) {
  const catapult = state.battle.catapult;
  if (!catapult) return;
  const shot = catapult.shot;
  if (shot) {
    shot.time += dt;
    if (!shot.released && shot.time >= hitSeconds(CATAPULT.id, 'fire')) {
      shot.released = true;
      releaseBoulder(catapult, shot);
    }
    if (shot.time >= animSeconds(CATAPULT.id, 'fire')) {
      catapult.shot = null;
      setAnim(catapult, 'idle');
    } else {
      catapult.anim.time = shot.time;
    }
  }
  if (!catapult.shot) tickAnim(catapult, dt);
}

export const boulderBox = boulder => ({
  x: boulder.x - CATAPULT.w / 2, y: boulder.y - CATAPULT.h / 2, w: CATAPULT.w, h: CATAPULT.h
});

// Đá bay: trúng người chơi (không miễn thương) −1 máu rồi vỡ; chạm đất vỡ
// (`break`), phát xong thì xoá.
function updateBoulders(dt) {
  const battle = state.battle;
  const p = state.player;
  const landY = GROUND_Y - CATAPULT.radius;
  battle.boulders.forEach(boulder => {
    tickAnim(boulder, dt);
    if (boulder.broken) {
      boulder.breakTime += dt;
      return;
    }
    boulder.vy += GOLD_COIN.gravity * dt;
    boulder.x += boulder.vx * dt;
    boulder.y += boulder.vy * dt;
    const hit = !playerImmune(p) && aabb(p, boulderBox(boulder));
    if (hit) hurtPlayer(BOSS_TEXT.boulderHit);
    if (hit || boulder.y >= landY) {
      boulder.y = Math.min(boulder.y, landY);
      boulder.broken = true;
      setAnim(boulder, 'break');
      playSfx('boulderCrash');
      shakeCamera(.2, 1);
    }
  });
  const breakLength = animSeconds(CATAPULT.boulder, 'break') || .4;
  battle.boulders = battle.boulders.filter(boulder => !boulder.broken || boulder.breakTime < breakLength);
}

// ---- Tiền vàng (GĐ 3) ----
// Đồng tiền bay vòng cung từ tay Tiêu Tư, rơi tới chỗ người chơi sau flightTime giây.
function throwCoin(boss) {
  const p = state.player;
  const x = centerOf(boss) + boss.facing * BOSS_TT.hand.x;
  const y = boss.y + boss.h - BOSS_TT.hand.y;
  const targetX = Math.max(8, Math.min(LEVEL.worldWidth - 8, centerOf(p)));
  const time = GOLD_COIN.flightTime;
  playSfx('coinThrow');
  state.battle.coins.push({
    x, y,
    vx: (targetX - x) / time,
    vy: (GROUND_Y - y - .5 * GOLD_COIN.gravity * time * time) / time,
    age: 0, alive: true
  });
}

export const coinBox = coin => ({ x: coin.x - GOLD_COIN.w / 2, y: coin.y - GOLD_COIN.h / 2, w: GOLD_COIN.w, h: GOLD_COIN.h });

// Tiền trúng người chơi (không miễn thương): choáng, không mất máu (Khiên Tô
// Lịch chặn được — engine stunPlayer). Chạm đất thì biến mất.
function updateCoins(dt) {
  const battle = state.battle;
  const p = state.player;
  battle.coins.forEach(coin => {
    coin.age += dt;
    coin.vy += GOLD_COIN.gravity * dt;
    coin.x += coin.vx * dt;
    coin.y += coin.vy * dt;
    if (!playerImmune(p) && aabb(p, coinBox(coin))) {
      coin.alive = false;
      if (stunPlayer(BOSS_TEXT.coinStun, GOLD_COIN.stun)) playSfx('coinStun');
      return;
    }
    if (coin.y + GOLD_COIN.h / 2 >= GROUND_Y) coin.alive = false;
  });
  battle.coins = battle.coins.filter(coin => coin.alive);
}

// ---- Cận vệ khiên sắt (GĐ 1) ----
// Tóe lửa trên khiên tại điểm chém (FX_BT_ARMOR_SPARK, vẽ ở render-extras.js).
function addSpark(x, y) {
  state.battle.sparks.push({ x, y, time: 0 });
}

// Quay về người chơi chậm `turnDelay` giây (khe chém sau lưng); đi tới, trong
// tầm thì đâm (sát thương ở hit_frame); bị chặn đòn đứng `blocked`. Hết máu:
// engine đặt death, xác nằm corpseTime giây rồi xoá.
function updateShieldGuard(guard, dt) {
  if (!guard.alive) {
    setAnim(guard, 'death');
    tickAnim(guard, dt);
    if (guard.anim.time >= animSeconds(SHIELD_GUARD.id, 'death') + SHIELD_GUARD.corpseTime) guard.dying = false;
    return;
  }
  const desired = towardPlayer(guard, guard.facing);
  if (desired !== guard.facing && !guard.action) {
    guard.turnTimer += dt;
    if (guard.turnTimer >= SHIELD_GUARD.turnDelay) {
      guard.facing = desired;
      guard.turnTimer = 0;
    }
  } else {
    guard.turnTimer = 0;
  }
  guard.blockedTime = Math.max(0, guard.blockedTime - dt);
  guard.attackCooldown = Math.max(0, guard.attackCooldown - dt);
  guard.walking = false;
  if (guard.action) {
    guard.action.time += dt;
    if (!guard.action.hit && guard.action.time >= hitSeconds(SHIELD_GUARD.id, 'attack_01')) {
      guard.action.hit = true;
      const p = state.player;
      if (!playerImmune(p) && aabb(p, strikeBox(guard, guard.facing, SHIELD_GUARD.spear))) hurtPlayer(BOSS_TEXT.guardHit);
    }
    if (guard.action.time >= animSeconds(SHIELD_GUARD.id, 'attack_01')) {
      guard.action = null;
      guard.attackCooldown = SHIELD_GUARD.attackCooldown;
    }
  } else if (guard.blockedTime <= 0 && guard.hitTimer <= 0 && guard.facing === desired) {
    const gap = edgeGap(guard);
    if (gap <= SHIELD_GUARD.attackRange && guard.attackCooldown <= 0) {
      guard.action = { time: 0, hit: false };
      playSfx('spearThrust');
    } else if (gap > 4) {
      guard.x = clampX(guard, guard.x + guard.facing * SHIELD_GUARD.speed * dt);
      guard.walking = true;
    }
  }
  let next = 'idle';
  if (guard.action) next = 'attack';
  else if (guard.blockedTime > 0) next = 'blocked';
  else if (guard.hitTimer > 0) next = 'hurt';
  else if (guard.walking) next = 'walk';
  setAnim(guard, next);
  tickAnim(guard, dt);
  if (next === 'attack') guard.anim.time = guard.action.time;
}

// Đòn chém từ phía cận vệ đang quay mặt -> khiên chặn. Triều Cường (`pierce`)
// xuyên khiên.
function blockGuardStrike(guard) {
  if (!guard.alive) return true;
  if (guard.pierce) return false;
  if (towardPlayer(guard, guard.facing) !== guard.facing) return false;
  guard.blockedTime = animSeconds(SHIELD_GUARD.id, 'blocked');
  guard.action = null;
  addSpark(centerOf(guard) + guard.facing * 9, state.player.y + 14);
  playSfx('armorClank');
  showHint(BOSS_TEXT.guardHint);
  return true;
}

// Triều Cường quét trúng cận vệ: bị đẩy lùi theo hướng sóng, −1 máu xuyên khiên.
function tideGuard(guard, direction, damage) {
  guard.x = clampX(guard, guard.x + direction * SHIELD_GUARD.tidePush);
  guard.pierce = true;
  strikeEnemy(guard, damage);
  guard.pierce = false;
}

// Sinh lượt cận vệ: lượt sau ra `gap` giây sau khi lượt trước ngã.
function updateGuardSpawns(dt) {
  const battle = state.battle;
  if (battle.guard && !battle.guard.alive) battle.guard = null;
  if (battle.guard) return;
  if (!battle.test && battle.guardsSpawned >= SHIELD_GUARD.count) return;
  battle.guardTimer -= dt;
  if (battle.guardTimer > 0) return;
  battle.guardTimer = battle.test ? SKILL_TEST.respawnGap : SHIELD_GUARD.gap;
  battle.guardsSpawned += 1;
  battle.guard = makeShieldGuard(ARENA.spawnX);
  state.enemies.push(battle.guard);
  playSfx('guardMarch');
}

// ---- Xe hoả công (GĐ 2) ----
// `burn`: chạy về phía người chơi, chạm tường quay đầu; `douse` (Triều Cường)
// -> `stalled` đứng yên. Hết máu: engine đặt death, xác nằm lại hết trận
// (dying giữ true).
function updateFireCart(cart, dt) {
  if (!cart.alive) {
    setAnim(cart, 'death');
    tickAnim(cart, dt);
    return;
  }
  cart.modeTime = (cart.modeTime || 0) + dt;
  if (cart.mode === 'burn') {
    cart.x += cart.direction * FIRE_CART.speed * dt;
    if (cart.direction > 0 && cart.x + cart.w >= LEVEL.worldWidth) cart.direction = -1;
    else if (cart.direction < 0 && cart.x <= 0) cart.direction = 1;
    cart.x = clampX(cart, cart.x);
    cart.facing = cart.direction;
  } else if (cart.mode === 'douse' && cart.modeTime >= animSeconds(FIRE_CART.id, 'douse')) {
    cart.mode = 'stalled';
    cart.modeTime = 0;
  }
  setAnim(cart, cart.mode);
  tickAnim(cart, dt);
}

function blockCartStrike(cart) {
  if (!cart.alive) return true;
  if (cart.mode === 'stalled') return false;
  playSfx('fireBlock');
  if (cart.mode === 'burn') showHint(BOSS_TEXT.cartHint);
  return true;
}

// Triều Cường quét trúng xe đang cháy: dập lửa -> douse.
function tideCart(cart) {
  if (cart.mode !== 'burn') return;
  cart.mode = 'douse';
  cart.modeTime = 0;
  playSfx('douse');
}

function updateCartSpawns(dt) {
  const battle = state.battle;
  if (battle.cart && !battle.cart.alive) battle.cart = null;
  if (battle.cart) return;
  if (!battle.test && battle.cartsSpawned >= FIRE_CART.count) return;
  battle.cartTimer -= dt;
  if (battle.cartTimer > 0) return;
  battle.cartTimer = battle.test ? SKILL_TEST.respawnGap : FIRE_CART.gap;
  battle.cartsSpawned += 1;
  battle.cart = makeFireCart(ARENA.spawnX);
  state.enemies.push(battle.cart);
  playSfx('cartIgnite');
  // Tiêu Tư phất tay ra lệnh (chỉ diễn — lệnh bắn đá giữ nhịp riêng).
  if (battle.commander && !battle.commander.action) battle.commander.action = { time: 0, released: false, order: 'cart' };
}

// Lính tuần tiễu rải rác (GĐ 1–2): đủ `max` lính đang sống thì chờ.
function updateSoldierSpawns(dt) {
  const battle = state.battle;
  battle.soldierTimer -= dt;
  if (battle.soldierTimer > 0) return;
  battle.soldierTimer = ARENA_SOLDIERS.interval;
  const soldiers = state.enemies.filter(enemy => enemy.alive && !enemy.kind && !enemy.harmless).length;
  if (soldiers >= ARENA_SOLDIERS.max) return;
  state.enemies.push(makeArenaSoldier(ARENA_SOLDIERS.x));
}

// ---- GĐ 3: Tiêu Tư nhảy xuống thành ----
function startPhase3(battle) {
  battle.phase = 3;
  battle.phaseTime = 0;
  battle.commander = null;
  if (battle.catapult) {
    battle.catapult.shot = null;
    setAnim(battle.catapult, 'idle');
  }
  battle.drop = { x: BOSS_TT.wallX, height: ARENA.wallTop, vy: 0, anim: createAnim('hurt') };
  playSfx('waveStart');
  showMessage(BOSS_TEXT.phase3, 2600);
}

// Rơi theo trọng lực (giữ ô 1 `hurt`), chạm đất -> rung + thành enemy tieuTu.
function updateDrop(dt) {
  const battle = state.battle;
  const drop = battle.drop;
  if (!drop) return;
  drop.vy += BOSS_TT.fallGravity * dt;
  drop.height -= drop.vy * dt;
  if (drop.height > 0) return;
  battle.drop = null;
  battle.tieuTu = makeTieuTu(drop.x);
  state.enemies.push(battle.tieuTu);
  playSfx('bossLand');
  shakeCamera(.35, 3);
}

// Tiêu Tư dưới đất: hoảng loạn chạy (`run`), hoặc quay về người chơi, gần thì
// chém, xa thì ném vàng. Cutscene đặt `pose` (bribe/hurt) hoặc `fleeing`.
function updateTieuTu(boss, dt) {
  if (boss.pendingPush) {
    boss.x = clampX(boss, boss.x + boss.pendingPush);
    boss.pendingPush = 0;
  }
  if (boss.fleeing) {
    boss.x += LND_CUTSCENE.fleeSpeed * dt;
    boss.facing = 1;
    if (boss.x > LEVEL.worldWidth + 40) boss.dying = false;
    setAnim(boss, 'flee');
    tickAnim(boss, dt);
    return;
  }
  if (boss.pose) {
    setAnim(boss, boss.pose);
    tickAnim(boss, dt);
    return;
  }
  boss.swordCooldown = Math.max(0, boss.swordCooldown - dt);
  boss.throwTimer -= dt;
  if (boss.run) {
    const direction = Math.sign(boss.run.targetX - centerOf(boss));
    boss.facing = direction || boss.facing;
    boss.x = clampX(boss, boss.x + direction * BOSS_TT.panicSpeed * dt);
    if (!direction || Math.abs(boss.run.targetX - centerOf(boss)) < 4) boss.run = null;
  } else if (boss.action) {
    const name = boss.action.type === 'attack' ? 'attack_01' : 'throw';
    boss.action.time += dt;
    if (!boss.action.hit && boss.action.time >= hitSeconds(BOSS_TT.id, name)) {
      boss.action.hit = true;
      const p = state.player;
      if (boss.action.type === 'throw') throwCoin(boss);
      else if (!playerImmune(p) && aabb(p, strikeBox(boss, boss.facing, BOSS_TT.sword))) hurtPlayer(BOSS_TEXT.swordHit);
    }
    if (boss.action.time >= animSeconds(BOSS_TT.id, name)) {
      if (boss.action.type === 'attack') boss.swordCooldown = BOSS_TT.swordCooldown;
      else boss.throwTimer = BOSS_TT.throwInterval;
      boss.action = null;
    }
  } else if (boss.hitTimer <= 0) {
    boss.facing = towardPlayer(boss, boss.facing);
    const gap = edgeGap(boss);
    if (gap <= BOSS_TT.swordRange && boss.swordCooldown <= 0) {
      boss.action = { type: 'attack', time: 0, hit: false };
      playSfx('swordSwing');
    } else if (gap > BOSS_TT.swordRange && boss.throwTimer <= 0) {
      boss.action = { type: 'throw', time: 0, hit: false };
    }
  }
  let next = 'idle';
  if (boss.run) next = 'flee';
  else if (boss.action) next = boss.action.type;
  else if (boss.hitTimer > 0) next = 'hurt';
  setAnim(boss, next);
  tickAnim(boss, dt);
  if (boss.action) boss.anim.time = boss.action.time;
}

// Trúng đòn: đẩy lùi; mỗi `panicEvery` đòn chạy sang đầu kia đấu trường.
function strikeTieuTu(boss) {
  boss.pendingPush = BOSS_TT.knockback * Math.sign(centerOf(boss) - centerOf(state.player) || 1);
  if (boss.hp <= 0) {
    defeatTieuTu(boss);
    return;
  }
  boss.hitsTaken += 1;
  if (boss.hitsTaken % BOSS_TT.panicEvery !== 0) return;
  boss.action = null;
  const margin = BOSS_TT.panicMargin;
  const targetX = centerOf(boss) < LEVEL.worldWidth / 2 ? LEVEL.worldWidth - margin : margin;
  boss.run = { targetX };
  playSfx('bossPanic');
}

// Tiêu Tư hết máu: dừng mọi quân, đá, tiền, sóng, khiên -> cutscene. Người
// chơi mất quyền điều khiển từ đây.
function defeatTieuTu(boss) {
  playSfx('bossDefeat');
  // Nhạc trận dừng trong cutscene; nhạc thắng phát ở endGame.
  stopMusic();
  state.score += BOSS_TT.defeatScore;
  Object.assign(boss, { alive: false, dying: true, hitTimer: 0, action: null, run: null, pose: 'hurt' });
  const battle = state.battle;
  battle.boulders = [];
  battle.coins = [];
  state.projectiles = [];
  if (state.skills) {
    state.skills.tide.active = false;
    state.skills.shield.active = 0;
  }
  const p = state.player;
  Object.assign(p, {
    dashing: false, dashTimer: 0, attackCooldown: 0, attacking: false, hurtTimer: 0, invulnerable: 0, vx: 0, stun: 0
  });
  clearInput();
  state.cutscene = { step: 'beaten', time: 0, fade: 0, lyBi: null, flag: false };
}

// Tiến trình trận (LEVEL.update): GĐ 1 (cận vệ) -> đủ 3 lượt ngã -> GĐ 2 (xe)
// -> đủ 2 xe vỡ -> GĐ 3 (Tiêu Tư dưới đất). Máy bắn đá + lính rải rác chạy
// suốt GĐ 1–2.
export function updateBattle(dt) {
  const battle = state.battle;
  if (!battle) return;
  battle.phaseTime += dt;
  battle.hintTimer = Math.max(0, battle.hintTimer - dt);
  battle.sparks.forEach(spark => { spark.time += dt; });
  battle.sparks = battle.sparks.filter(spark => spark.time < animSeconds(SHIELD_GUARD.spark, 'impact') + .02);
  updateBoulders(dt);
  updateCoins(dt);
  if (battle.test) {
    updateGuardSpawns(dt);
    updateCartSpawns(dt);
    return;
  }
  if (battle.phase <= 2) {
    updateCommander(dt);
    updateSoldierSpawns(dt);
  }
  updateCatapult(dt);
  if (battle.phase === 1) {
    updateGuardSpawns(dt);
    if (battle.guardsSpawned >= SHIELD_GUARD.count && !battle.guard) {
      battle.phase = 2;
      battle.phaseTime = 0;
      playSfx('waveStart');
      showMessage(BOSS_TEXT.phase2, 2600);
    }
  } else if (battle.phase === 2) {
    updateCartSpawns(dt);
    if (battle.cartsSpawned >= FIRE_CART.count && !battle.cart) startPhase3(battle);
  } else {
    updateDrop(dt);
  }
}

// ---- Cutscene kết chương (LND-00 §5.3–5.4, LEVEL.cutscene — thay update()) ----
// Người chơi không điều khiển:
//   beaten  -> Tiêu Tư trúng đòn cuối đứng `hurt` beatenHold giây
//   bribe   -> quỳ dâng vàng (`bribe`), giữ ô cuối bribeHold giây -> cốt truyện câu 1
//   flee    -> chạy về mép phải (camera theo); cách mép fadeBeforeEdge thì tối dần
//   fadeOut -> tối dần; hết tối: người chơi về playerX, Lý Bí hiện trên thành
//   fadeIn  -> sáng lại
//   plant   -> Lý Bí `plant_flag`; xong thì cờ gắn đầu cán
//   victory -> đứng victoryHold giây -> cốt truyện câu 2 -> panel kết chương.
// Panel cốt truyện đặt state.paused nên update() dừng tới khi đóng panel.
const CUT = LND_CUTSCENE;

function cutsceneStep(step) {
  state.cutscene.step = step;
  state.cutscene.time = 0;
}

export function updateCutscene(dt) {
  const cut = state.cutscene;
  const p = state.player;
  const boss = state.battle.tieuTu;
  cut.time += dt;
  tickMessage(dt);
  let cameraTarget = null;

  // Tới lúc tối màn: camera neo Tiêu Tư (có thể đang ở sát mép sau lần hoảng loạn chạy).
  if (boss && ['beaten', 'bribe', 'story1', 'flee'].includes(cut.step)) cameraTarget = centerOf(boss);

  if (cut.step === 'beaten') {
    if (cut.time >= CUT.beatenHold) {
      if (boss) boss.pose = 'bribe';
      playSfx('coinThrow');
      cutsceneStep('bribe');
    }
  } else if (cut.step === 'bribe') {
    if (cut.time >= animSeconds(BOSS_TT.id, 'bribe') + CUT.bribeHold) {
      cutsceneStep('story1');
      openStory(STORY_TIEU_TU_FLEES, () => {
        if (boss) Object.assign(boss, { pose: null, fleeing: true });
        cutsceneStep('flee');
      });
    }
  } else if (cut.step === 'flee') {
    // Tối dần khi Tiêu Tư sắp ra khỏi mép phải (vẫn chạy tiếp trong lúc tối).
    if (!boss || !boss.dying || boss.x >= LEVEL.worldWidth - CUT.fadeBeforeEdge) cutsceneStep('fadeOut');
  } else if (cut.step === 'fadeOut') {
    cut.fade = Math.min(1, cut.time / CUT.fadeTime);
    if (cut.fade >= 1) {
      // Đang tối hẳn: người chơi về mặt đất dưới thành, Lý Bí hiện trên mặt thành.
      p.x = CUT.playerX - p.w / 2;
      p.y = GROUND_Y - p.h;
      p.vy = 0;
      p.grounded = true;
      p.facing = 1;
      cut.lyBi = { x: CUT.lyBiX, anim: createAnim('idle') };
      cutsceneStep('fadeIn');
    }
  } else if (cut.step === 'fadeIn') {
    cut.fade = Math.max(0, 1 - cut.time / CUT.fadeTime);
    cameraTarget = CUT.lyBiX;
    if (cut.fade <= 0) {
      setAnim(cut.lyBi, 'plant_flag');
      playSfx('flagRaise');
      cutsceneStep('plant');
    }
  } else if (cut.step === 'plant') {
    cameraTarget = CUT.lyBiX;
    if (cut.lyBi.anim.time >= animSeconds('NPC_LY_BI', 'plant_flag')) {
      cut.flag = true;
      playSfx('gateOpen');
      cutsceneStep('victory');
    }
  } else if (cut.step === 'victory') {
    cameraTarget = CUT.lyBiX;
    if (cut.time >= CUT.victoryHold) {
      cutsceneStep('story2');
      openStory(STORY_LND_VICTORY, () => cutsceneStep('end'));
    }
  } else if (cut.step === 'story2') {
    cameraTarget = CUT.lyBiX;
  } else if (cut.step === 'end') {
    state.cutscene = null;
    endGame(true);
    return;
  }

  if (cut.lyBi) tickAnim(cut.lyBi, dt);
  setAnim(p, 'idle');
  tickAnim(p, dt);
  updateEnemies(dt);
  if (cameraTarget === null) updateCamera(dt);
  else {
    const max = LEVEL.worldWidth - VIEW_W;
    const target = Math.max(0, Math.min(max, cameraTarget - VIEW_W / 2));
    state.cameraX += (target - state.cameraX) * Math.min(1, dt * 4);
  }
  updateHud();
}

// Bình máu rơi (CHAPTER.hooks.dropHeal — engine gọi khi hạ enemy/hazard): lính,
// cận vệ, xe; có buff Lương thảo dồi dào thì tỉ lệ cao hơn. Bao cát, boss không rơi.
export function dropHeal(target) {
  if (LEVEL.id !== 3 || target.harmless || target.boss) return false;
  const supply = Boolean(state.skills?.owned.has('BUFF_LND_SUPPLY'));
  return Math.random() < (supply ? HEAL_DROP.supply : HEAL_DROP.base);
}

// Enemy `kind` riêng của trận (CHAPTER.enemyKinds — engine gọi):
//   shieldGuard: khiên chặn đòn phía trước; chạm thân −1 máu; Triều Cường xuyên khiên.
//   fireCart:    đang cháy chém bị chặn, chạm thân −1 máu; Triều Cường dập lửa.
//   tieuTu:      trúng đòn bị đẩy lùi, hoảng loạn chạy; hết máu -> cutscene.
// `onTide(enemy, direction, damage)` do skills.js gọi khi sóng Triều Cường quét trúng.
export const ENEMY_KINDS = {
  shieldGuard: {
    update: updateShieldGuard,
    blockStrike: blockGuardStrike,
    onContact() {
      hurtPlayer(BOSS_TEXT.guardContact);
    },
    onTide: tideGuard,
    debugLabel: (enemy, label) => `${label} hp ${enemy.hp}${enemy.turnTimer > 0 ? ' quay' : ''}`
  },
  fireCart: {
    update: updateFireCart,
    blockStrike: blockCartStrike,
    onContact(enemy) {
      if (enemy.mode === 'burn') hurtPlayer(BOSS_TEXT.cartHit);
    },
    onTide: tideCart,
    debugLabel: (enemy, label) => `${label} ${enemy.mode} hp ${enemy.hp}`
  },
  tieuTu: {
    update: updateTieuTu,
    onStruck: strikeTieuTu,
    onTide(enemy, direction, damage) {
      strikeEnemy(enemy, damage);
    }
  }
};

// Ô boss góc trên-phải (CHAPTER.hooks.updateHud): "Cận vệ khiên sắt" + lượt còn
// lại ở GĐ 1, "Xe hoả công" ở GĐ 2; ẩn ở GĐ 3 (thanh máu trên đầu Tiêu Tư) và
// layout thử. Nấc thừa (xe chỉ 2 lượt) ẩn đi.
export function updateBossHud() {
  const battle = state.battle;
  const phase = battle && !battle.test ? battle.phase : 0;
  ui.bossHud.hidden = !(phase === 1 || phase === 2);
  if (ui.bossHud.hidden) return;
  let total;
  let left;
  if (phase === 1) {
    ui.bossLabel.textContent = 'Cận vệ khiên sắt';
    total = SHIELD_GUARD.count;
    left = total - battle.guardsSpawned + (battle.guard?.alive ? 1 : 0);
  } else {
    ui.bossLabel.textContent = 'Xe hoả công';
    total = FIRE_CART.count;
    left = total - battle.cartsSpawned + (battle.cart?.alive ? 1 : 0);
  }
  ui.bossPips.forEach((pip, index) => {
    pip.hidden = index >= total;
    pip.classList.toggle('is-lost', index >= left);
  });
}

// Hộp F2 riêng của trận: đá đang bay, tiền vàng.
export function battleDebugEntities() {
  const battle = state.battle;
  if (!battle) return [];
  return [
    ...battle.boulders.filter(boulder => !boulder.broken).map(boulderBox),
    ...battle.coins.map(coinBox)
  ];
}
