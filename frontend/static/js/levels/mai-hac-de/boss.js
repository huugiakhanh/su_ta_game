// Màn 3: trận Quang Sở Khách (MHD-L3, docs/SUTA_MHD_TASK_L3_01.md §2, §4):
//   GĐ 1 — xe bắn loạt tên có vạch báo, 2 vệ sĩ khiên sắt gạt đòn chém; trinh sát
//          chết rơi hũ dầu, ném trúng thì cháy khiên, vệ sĩ mới chém được.
//   GĐ 2 — xe húc qua lại; đâm tường hoặc bị Viện Binh chặn thì khựng, nhảy lên bục
//          đánh cần điều khiển 3 lượt.
//   GĐ 3 — xe vỡ, boss chém loạn đại đao, chỉ mất máu lúc đuối sức sau loạt chém.
// Hết máu -> cutscene (MHD-00 §5.3) -> panel kết chương (§5.4). Gắn vào engine qua
// LEVEL.update (updateBattle), LEVEL.cutscene, CHAPTER.enemyKinds, CHAPTER.hooks.

import { state } from '../../engine/state.js';
import { clearInput } from '../../engine/input.js';
import { ui, showMessage, tickMessage, updateHud } from '../../engine/ui.js';
import { aabb, makeProjectile } from '../../engine/geometry.js';
import { setAnim, tickAnim, getAnimMeta, hitTime, animLength } from '../../engine/animation.js';
import { GROUND_Y, VIEW_W } from '../../engine/config.js';
import { LEVEL } from '../../engine/chapter.js';
import { PLATFORM_THICKNESS, makeNpc } from '../../engine/entities.js';
import { openStory } from '../../engine/dialogue.js';
import { playSfx, stopMusic } from '../../engine/audio.js';
import { hurtPlayer, playerImmune } from '../../engine/damage.js';
import { spearBox } from '../../engine/combat.js';
import { updateEnemies } from '../../engine/enemies.js';
import { shakeCamera } from '../../engine/level-flow.js';
import { endGame } from '../../engine/end-game.js';
import {
  ARENA, BOSS, CART, GUARDS, JAR, SCOUTS, FLAG, HEAL_DROP, MHD_CUTSCENE, SKILLS, BOSS_TEXT, stallFor
} from './config.js';
import { STORY_MHD_FLEE, STORY_MHD_FLAG } from './dialogue-data.js';
import { makeScout } from './level3.js';
import { stopSkills } from './skills.js';

const centerOf = body => body.x + body.w / 2;

function animSeconds(id, name) {
  const meta = getAnimMeta(id, name);
  return meta ? animLength(meta) : 0;
}

function hitSeconds(id, name) {
  const meta = getAnimMeta(id, name);
  return meta ? hitTime(meta) : 0;
}

function towardPlayer(entity, fallback = -1) {
  return Math.sign(centerOf(state.player) - centerOf(entity)) || fallback;
}

function showHint(text) {
  const battle = state.battle;
  if (battle.hintTimer > 0) return;
  battle.hintTimer = BOSS.hintInterval;
  showMessage(text, 2400);
}

function addSpark(x, y) {
  state.battle.sparks.push({ x, y, time: 0 });
  playSfx('armorClank');
}

function setMode(entity, mode) {
  entity.mode = mode;
  entity.modeTime = 0;
  entity.hit = false;
  entity.fired = false;
}

function bossCommand(boss) {
  setMode(boss, 'command');
  playSfx('bossCommand');
}

// ---- Xe bắn tiễn ----
// Vạch báo + loạt tên (GĐ 1): điểm bắn ở giá nỏ, khoá vị trí người chơi lúc báo.
export const cartMuzzle = cart => ({ x: centerOf(cart) + cart.facing * CART.muzzleX, y: GROUND_Y - CART.muzzleY });

function fireVolley(cart) {
  const muzzle = cartMuzzle(cart);
  CART.spread.forEach(offset => {
    state.projectiles.push(makeProjectile('crossbowBolt', muzzle.x, muzzle.y, cart.facing, { x: cart.aim.x, y: cart.aim.y + offset }));
  });
  playSfx('throw');
}

// Bục + cần tính theo hướng xe (toạ độ config là khi xe quay phải).
function spanOf(cart, span) {
  const center = centerOf(cart);
  return cart.facing > 0
    ? { from: center + span.from, to: center + span.to }
    : { from: center - span.to, to: center - span.from };
}

// Bục chỉ có khi xe khựng (bục tĩnh trong state.platforms — xe đứng yên lúc đó).
function addDeck(cart) {
  const span = spanOf(cart, CART.deck);
  cart.deck = { x: span.from, y: GROUND_Y - CART.deck.height, w: span.to - span.from, h: PLATFORM_THICKNESS, sprite: null, dx: 0 };
  state.platforms.push(cart.deck);
}

// Gỡ bục; người đang đứng trên thì bị hất xuống, miễn thương, không mất máu.
function removeDeck(cart) {
  if (!cart.deck) return;
  const p = state.player;
  if (p.platform === cart.deck) {
    p.platform = null;
    p.grounded = false;
    p.vy = CART.throwOffVy;
    p.invulnerable = Math.max(p.invulnerable, CART.throwOffGrace);
  }
  state.platforms = state.platforms.filter(platform => platform !== cart.deck);
  cart.deck = null;
}

function stallCart(cart, time, message) {
  cart.stallLeft = time;
  setMode(cart, 'stalled');
  addDeck(cart);
  showMessage(message, 2200);
}

function startWindup(cart) {
  const center = centerOf(cart);
  let dir = towardPlayer(cart, cart.facing);
  if (center <= CART.minX + 2) dir = 1;
  else if (center >= CART.maxX - 2) dir = -1;
  cart.dir = dir;
  cart.facing = dir;
  setMode(cart, 'windup');
  const boss = state.battle.boss;
  if (boss.alive && state.battle.phase === 2 && boss.mode === 'idle') bossCommand(boss);
}

function breakCart(cart) {
  const battle = state.battle;
  removeDeck(cart);
  Object.assign(cart, { alive: false, dying: true, action: null });
  setMode(cart, 'break');
  cart.anim.time = 0;
  shakeCamera(.5, 3);
  playSfx('cartBreak');
  battle.phase = 3;
  battle.scoutTimer = SCOUTS.phase3.interval;
  const boss = battle.boss;
  boss.noBar = false;
  boss.retreat = 0;
  boss.waitTime = animSeconds(CART.id, 'break') + BOSS.rest;
  setMode(boss, 'idle');
  showMessage(BOSS_TEXT.phase3, 2600);
}

function leverHit(cart) {
  const battle = state.battle;
  cart.hitTimer = .18;
  cart.leverTime = CART.leverAnim;
  cart.leverHits += 1;
  state.score += CART.leverScore;
  playSfx('leverHit');
  shakeCamera(.12, 2);
  const span = spanOf(cart, CART.lever);
  addSpark((span.from + span.to) / 2, GROUND_Y - CART.deck.height - 12);
  if (cart.leverHits < CART.leverPerRound) return;
  cart.leverHits = 0;
  if (!battle.test) battle.round += 1;
  if (battle.round >= CART.rounds) {
    breakCart(cart);
    return;
  }
  removeDeck(cart);
  cart.stallLeft = 0;
  setMode(cart, 'recover');
}

// Đòn chém lên xe: luôn chặn. Lúc khựng mà người chơi đứng trên bục, cần nằm trong
// vùng thân + nhát chém thì tính 1 nhát vào cần.
function blockCartStrike(cart) {
  if (!cart.alive) return true;
  const p = state.player;
  if (cart.mode === 'stalled') {
    if (p.platform === cart.deck && leverInReach(cart, p)) {
      leverHit(cart);
      return true;
    }
    showHint(BOSS_TEXT.leverOff);
  } else {
    showHint(BOSS_TEXT.cartBlock);
  }
  addSpark(centerOf(p) + p.facing * 24, p.y + 14);
  return true;
}

function leverInReach(cart, p) {
  const span = spanOf(cart, CART.lever);
  const box = spearBox(p, p.facing);
  const left = Math.min(p.x, box.x);
  const right = Math.max(p.x + p.w, box.x + box.w);
  return span.to >= left && span.from <= right;
}

function updateArrowCart(cart, dt) {
  cart.modeTime += dt;
  cart.leverTime = Math.max(0, cart.leverTime - dt);
  if (!cart.alive) {
    setAnim(cart, 'break');
    tickAnim(cart, dt);
    return;
  }
  const battle = state.battle;
  if (battle.phase === 1) updateCartVolleys(cart, dt);
  else updateCartCharge(cart, dt);
  let next = 'idle';
  if (cart.mode === 'fire') next = 'fire';
  else if (cart.mode === 'charge') next = 'charge';
  else if (cart.mode === 'stalled' || cart.mode === 'recover') next = cart.leverTime > 0 ? 'lever_hit' : 'stalled';
  setAnim(cart, next);
  tickAnim(cart, dt);
  if (next === 'fire') cart.anim.time = cart.modeTime;
}

function updateCartVolleys(cart, dt) {
  const battle = state.battle;
  const p = state.player;
  if (cart.mode === 'idle') {
    battle.volleyTimer -= dt;
    if (battle.volleyTimer > 0 || Math.abs(centerOf(p) - centerOf(cart)) > CART.aimRange) return;
    cart.aim = { x: centerOf(p), y: p.y + p.h / 2 };
    setMode(cart, 'aim');
    if (battle.boss.mode === 'idle') bossCommand(battle.boss);
  } else if (cart.mode === 'aim') {
    if (cart.modeTime >= CART.aimTime) setMode(cart, 'fire');
  } else if (cart.mode === 'fire') {
    if (!cart.fired && cart.modeTime >= hitSeconds(CART.id, 'fire')) {
      cart.fired = true;
      fireVolley(cart);
    }
    if (cart.modeTime >= animSeconds(CART.id, 'fire')) {
      battle.volleyTimer = Math.max(0, CART.volleyGap - CART.aimTime - animSeconds(CART.id, 'fire'));
      cart.aim = null;
      setMode(cart, 'idle');
    }
  }
}

function updateCartCharge(cart, dt) {
  const battle = state.battle;
  switch (cart.mode) {
    case 'windup':
      if (cart.modeTime >= CART.windup) {
        playSfx('bossCharge');
        setMode(cart, 'charge');
      }
      break;
    case 'charge': {
      const next = centerOf(cart) + cart.dir * CART.chargeSpeed * dt;
      const center = Math.max(CART.minX, Math.min(CART.maxX, next));
      cart.x = center - cart.w / 2;
      if (center !== next) {
        shakeCamera(.25, 3);
        playSfx('wallCrash');
        stallCart(cart, CART.wallStall, BOSS_TEXT.stalled);
      }
      break;
    }
    case 'stalled':
      cart.stallLeft -= dt;
      if (cart.stallLeft <= 0) {
        removeDeck(cart);
        setMode(cart, 'recover');
      }
      break;
    case 'recover':
      if (cart.modeTime >= CART.recover) startWindup(cart);
      break;
    default:
      // Vừa sang GĐ 2 (xe đang đứng hoặc còn dở loạt tên).
      battle.phaseDelay -= dt;
      if (battle.phaseDelay <= 0) startWindup(cart);
  }
}

// Chỉ nửa trước xe gây sát thương khi húc, để nhảy qua được (cao 60, nhảy 83).
function cartFrontBox(cart) {
  const center = centerOf(cart);
  const near = center + cart.facing * CART.front;
  const tip = center + cart.facing * CART.ramTip;
  return { x: Math.min(near, tip), y: GROUND_Y - CART.frontH, w: Math.abs(tip - near), h: CART.frontH };
}

// ---- Quang Sở Khách ----
function bladeBox(boss, name) {
  const blade = BOSS.blades[name];
  const center = centerOf(boss);
  const x0 = boss.facing > 0 ? center + blade.near : center - blade.reach;
  return { x: x0, y: GROUND_Y - blade.high, w: blade.reach - blade.near, h: blade.high - blade.low };
}

const swingName = boss => (boss.swing % 2 === 0 ? 'attack_01' : 'attack_02');
const clampBossX = (boss, x) => Math.max(BOSS.minX, Math.min(LEVEL.worldWidth - BOSS.minX - boss.w, x));

function updateBossBehindCart(boss) {
  const battle = state.battle;
  if (boss.mode === 'command') {
    if (boss.modeTime >= animSeconds(BOSS.id, 'command')) setMode(boss, 'idle');
    return;
  }
  if (battle.phase !== 2) return;
  const gap = BOSS.phase2X - centerOf(boss);
  boss.retreat = Math.abs(gap) > 2 ? Math.sign(gap) : 0;
}

function updateBossBlade(boss, dt) {
  const p = state.player;
  if (boss.waitTime > 0) {
    boss.waitTime -= dt;
    return;
  }
  if (boss.mode === 'swing') {
    const name = swingName(boss);
    const strikeAt = hitSeconds(BOSS.id, name);
    if (boss.modeTime < strikeAt && strikeAt > 0) {
      boss.x = clampBossX(boss, boss.x + boss.facing * BOSS.lunge / strikeAt * dt);
    }
    if (!boss.hit && boss.modeTime >= strikeAt) {
      boss.hit = true;
      playSfx('bladeSwing');
      if (!playerImmune(p) && aabb(p, bladeBox(boss, name))) hurtPlayer(BOSS_TEXT.bladeHit);
    }
    if (boss.modeTime >= animSeconds(BOSS.id, name)) {
      boss.swing += 1;
      boss.combo -= 1;
      boss.facing = towardPlayer(boss, boss.facing);
      setMode(boss, boss.combo > 0 ? 'swing' : 'winded');
    }
    return;
  }
  if (boss.mode === 'winded') {
    if (boss.modeTime >= BOSS.winded) {
      boss.waitTime = BOSS.rest;
      setMode(boss, 'idle');
    }
    return;
  }
  boss.facing = towardPlayer(boss, boss.facing);
  const gap = Math.abs(centerOf(p) - centerOf(boss));
  if (gap <= BOSS.reach) {
    boss.combo = boss.hp <= BOSS.enragedAt ? BOSS.comboEnraged : BOSS.combo;
    setMode(boss, 'swing');
  } else {
    boss.x = clampBossX(boss, boss.x + boss.facing * BOSS.speed * dt);
    boss.mode = 'walk';
  }
}

function updateQuangSoKhach(boss, dt) {
  boss.modeTime += dt;
  boss.blockedTime = Math.max(0, boss.blockedTime - dt);
  boss.hurtTime = Math.max(0, boss.hurtTime - dt);
  if (!boss.alive) {
    setAnim(boss, boss.pose || 'disarm');
    tickAnim(boss, dt);
    return;
  }
  const battle = state.battle;
  if (battle.phase < 3) {
    updateBossBehindCart(boss);
    if (boss.retreat) boss.x = clampBossX(boss, boss.x + boss.retreat * BOSS.retreatSpeed * dt);
    boss.facing = -1;
  } else {
    updateBossBlade(boss, dt);
  }
  let next = boss.mode === 'swing' ? swingName(boss) : boss.mode;
  if (boss.retreat && next === 'idle') next = 'walk';
  if (boss.hurtTime > 0 && next === 'winded') next = 'hurt';
  if (boss.blockedTime > 0 && (next === 'idle' || next === 'walk')) next = 'blocked';
  const previous = boss.anim.name;
  setAnim(boss, next);
  if (previous !== next) boss.anim.time = 0;
  tickAnim(boss, dt);
  if (next === 'attack_01' || next === 'attack_02' || next === 'command') boss.anim.time = boss.modeTime;
}

// Chém boss: chỉ mất máu lúc `winded` ở GĐ 3; còn lại tóe lửa + gợi ý.
function blockBossStrike(boss) {
  if (!boss.alive) return true;
  const battle = state.battle;
  if (battle.phase === 3 && boss.waitTime <= 0 && boss.mode === 'winded') return false;
  const p = state.player;
  addSpark(centerOf(boss) + towardPlayer(boss, boss.facing) * (boss.w / 2), Math.min(p.y + 14, GROUND_Y - 8));
  if (boss.mode === 'idle' || boss.mode === 'walk') boss.blockedTime = animSeconds(BOSS.id, 'blocked');
  showHint(battle.phase === 3 ? BOSS_TEXT.bossGuard : BOSS_TEXT.bossSafe);
  return true;
}

function onBossStruck(boss) {
  // 1,2 × 10 nhát: làm tròn để máu về đúng 0.
  boss.hp = Math.round(boss.hp * 100) / 100;
  boss.hurtTime = animSeconds(BOSS.id, 'hurt');
  shakeCamera(.12, 2);
  if (boss.hp <= 0) defeatBoss(boss);
}

// Hết máu: dừng quân, đạn, kỹ năng -> cutscene. Người chơi mất điều khiển từ đây.
function defeatBoss(boss) {
  playSfx('bossDefeat');
  stopMusic();
  state.score += BOSS.defeatScore;
  Object.assign(boss, { alive: false, dying: true, hitTimer: 0, pose: 'disarm', noBar: true, facing: towardPlayer(boss, -1) });
  boss.anim.time = 0;
  state.projectiles = [];
  state.thrown = [];
  state.enemies.forEach(enemy => {
    if (enemy === boss || !enemy.alive) return;
    Object.assign(enemy, { alive: false, dying: true, action: null });
    setAnim(enemy, 'death');
  });
  stopSkills();
  const p = state.player;
  Object.assign(p, {
    dashing: false, dashTimer: 0, attackCooldown: 0, attacking: false, hurtTimer: 0, invulnerable: 0, vx: 0, stun: 0, carrying: null
  });
  clearInput();
  state.cutscene = { step: 'disarm', time: 0, fade: 0 };
}

// ---- Vệ sĩ khiên sắt, hũ dầu, trinh sát ----
function burnShield(guard) {
  if (guard.art !== 'shieldGuard' || !guard.alive) return;
  Object.assign(guard, { art: 'burningGuard', action: null, aggroRange: 0, passive: true, walking: false, blockTimer: 0 });
  guard.burnLeft = animSeconds('EN_TANG_SHIELD_GUARD', 'shield_burn');
  guard.anim.time = 0;
  playSfx('shieldBurn');
  showMessage(BOSS_TEXT.shieldBurn, 1800);
}

function burnNear(x) {
  state.battle?.guards.forEach(guard => {
    if (Math.abs(centerOf(guard) - x) <= JAR.splash) burnShield(guard);
  });
}

function updateBurningGuards(dt) {
  state.battle.guards.forEach(guard => {
    if (guard.art !== 'burningGuard' || !guard.alive) return;
    guard.burnLeft -= dt;
    if (guard.burnLeft > 0) return;
    Object.assign(guard, { art: 'bareGuard', aggroRange: GUARDS.aggroRange, passive: false, noBar: false });
    guard.anim.time = 0;
  });
}

function jarsOnField() {
  return state.pickups.filter(pickup => pickup.carry === 'oilJar').length
    + state.thrown.filter(item => item.alive).length
    + (state.player.carrying ? 1 : 0);
}

// CHAPTER.hooks.dropCarry: trinh sát GĐ 1 rơi hũ khi còn khiên chưa cháy.
export function dropCarry(target) {
  const battle = state.battle;
  if (!battle || battle.phase !== 1 || target.art !== 'scout') return null;
  if (!battle.guards.some(guard => guard.alive && guard.art === 'shieldGuard')) return null;
  if (jarsOnField() >= JAR.maxOnField) return null;
  if (!battle.jarHintShown) {
    battle.jarHintShown = true;
    showMessage(BOSS_TEXT.jarHint, 2400);
  }
  return 'oilJar';
}

// CHAPTER.hooks.onThrownHit: trúng ai cũng lan lửa; chỉ trinh sát và vệ sĩ hết
// khiên mất máu theo đòn thường (trả false).
export function onThrownHit(thrown, target) {
  burnNear(thrown.x);
  if (target.art === 'shieldGuard') burnShield(target);
  return !(target.art === 'scout' || target.art === 'bareGuard');
}

export function onThrownLand(thrown) {
  burnNear(thrown.x);
}

// CHAPTER.hooks.dropHeal: trinh sát, vệ sĩ ở màn 3. Boss, xe không rơi.
export function dropHeal(target) {
  if (!state.battle || (target.art !== 'scout' && target.art !== 'bareGuard')) return false;
  return Math.random() < HEAL_DROP.chance;
}

// CHAPTER.hooks.onAttackWindow: tóe lửa đúng frame khiên vừa gạt (engine vừa đặt blockTimer).
export function onAttackWindow() {
  const battle = state.battle;
  if (!battle) return;
  const p = state.player;
  battle.guards.forEach(guard => {
    if (guard.art === 'shieldGuard' && guard.alive && guard.blockTimer >= .2 - 1e-6) {
      addSpark(centerOf(guard) + towardPlayer(guard, guard.facing) * guard.w / 2, p.y + 16);
    }
  });
}

function updateScouts(dt) {
  const battle = state.battle;
  const rule = battle.test ? SCOUTS.test : battle.phase === 1 ? SCOUTS.phase1 : battle.phase === 3 ? SCOUTS.phase3 : null;
  if (!rule) return;
  battle.scoutTimer -= dt;
  if (battle.scoutTimer > 0) return;
  battle.scoutTimer = rule.interval;
  const alive = state.enemies.filter(enemy => enemy.alive && enemy.art === 'scout').length;
  if (alive >= rule.max) return;
  const fromRight = centerOf(state.player) < ARENA.width / 2;
  state.enemies.push(makeScout(fromRight ? ARENA.width - ARENA.scoutEdge : ARENA.scoutEdge, fromRight ? -1 : 1));
}

// Tiến trình trận (LEVEL.update).
export function updateBattle(dt) {
  const battle = state.battle;
  if (!battle) return;
  battle.hintTimer = Math.max(0, battle.hintTimer - dt);
  battle.sparks.forEach(spark => { spark.time += dt; });
  battle.sparks = battle.sparks.filter(spark => spark.time < .3);
  updateBurningGuards(dt);
  updateScouts(dt);
  if (battle.phase === 1 && battle.guards.every(guard => !guard.alive)) {
    battle.phase = 2;
    battle.phaseDelay = CART.phase2Delay;
    const { cart } = battle;
    cart.aim = null;
    setMode(cart, 'idle');
    showMessage(BOSS_TEXT.phase2, 2400);
  }
}

// ---- Enemy `kind` riêng của trận (CHAPTER.enemyKinds) ----
export const ENEMY_KINDS = {
  quangSoKhach: {
    update: updateQuangSoKhach,
    blockStrike: blockBossStrike,
    onStruck: onBossStruck,
    onContact() {},
    debugLabel: (enemy, label) => `${label} ${enemy.mode} hp ${enemy.hp}`
  },
  arrowCart: {
    update: updateArrowCart,
    blockStrike: blockCartStrike,
    onContact(cart, p) {
      if (cart.mode === 'charge' && aabb(p, cartFrontBox(cart))) hurtPlayer(BOSS_TEXT.chargeHit);
    },
    // Rung khi báo trước cú húc.
    shake: cart => (cart.mode === 'windup' && Math.floor(cart.modeTime * 24) % 2 ? 1 : 0),
    // GĐ 2: Viện Binh luôn chạy về phía xe.
    reinforceDir: (cart, fromX) => (cart.alive && state.battle.phase === 2 ? Math.sign(centerOf(cart) - fromX) || 1 : 0),
    // Trúng lúc báo trước / đang húc: xe khựng theo `rescued`, toán dân quân đứng chặn ở mũi xe.
    onReinforce(cart) {
      if (cart.mode !== 'windup' && cart.mode !== 'charge') return null;
      playSfx('reinforceHit');
      shakeCamera(.2, 2);
      stallCart(cart, stallFor(state.battle.rescued), BOSS_TEXT.reinforce);
      return {
        x: centerOf(cart) + cart.facing * (CART.ramTip + SKILLS.SK_MHD_REINFORCE.braceGap),
        facing: -cart.facing,
        active: () => cart.alive && cart.mode === 'stalled'
      };
    },
    debugLabel: (enemy, label) => `${label} ${enemy.mode}`
  }
};

// Ô boss góc trên-phải (CHAPTER.hooks.updateHud). Ẩn ở màn khác và trong cutscene.
export function updateBossHud() {
  const battle = state.battle;
  ui.bossHud.hidden = !battle || Boolean(state.cutscene);
  if (ui.bossHud.hidden) return;
  const setPips = (total, lost) => ui.bossPips.forEach((pip, index) => {
    pip.hidden = index >= total;
    pip.classList.toggle('is-lost', index < lost);
  });
  if (battle.phase === 1) {
    ui.bossLabel.textContent = 'Quang Sở Khách — Phá khiên';
    setPips(battle.guards.length, battle.guards.filter(guard => !guard.alive).length);
  } else if (battle.phase === 2) {
    ui.bossLabel.textContent = `Quang Sở Khách — Phá xe ${Math.min(battle.round + 1, CART.rounds)}/${CART.rounds}`;
    setPips(CART.rounds, battle.round);
  } else {
    ui.bossLabel.textContent = 'Quang Sở Khách';
    setPips(0, 0);
  }
}

// ---- Cutscene kết chương (MHD-00 §5.3–5.4, LEVEL.cutscene — thay update()) ----
//   disarm -> story1 -> flee (phi tới cổng, mờ dần) -> fadeOut -> fadeIn (Mai Thúc
//   Loan giữa sân) -> flag (cờ kéo lên) -> story2 -> panel kết chương.
const CUT = MHD_CUTSCENE;

function cutsceneStep(step) {
  state.cutscene.step = step;
  state.cutscene.time = 0;
}

function startRide(boss) {
  const battle = state.battle;
  const x = centerOf(boss);
  battle.rider = { x, facing: Math.sign(CUT.gateX - x) || 1, time: 0, alpha: 1 };
  boss.dying = false; // Xoá khỏi state.enemies, từ đây render-extras vẽ người phi ngựa.
  playSfx('cavalryCharge');
}

// Phi tới cổng; fleeFade giây cuối mờ dần rồi biến mất. Trả true khi xong.
function updateRide(dt) {
  const rider = state.battle.rider;
  rider.time += dt;
  const remaining = Math.abs(CUT.gateX - rider.x) / CUT.fleeSpeed;
  rider.x += rider.facing * Math.min(CUT.fleeSpeed * dt, Math.abs(CUT.gateX - rider.x));
  rider.alpha = Math.min(1, remaining / CUT.fleeFade);
  return remaining <= 0;
}

// Sau khi tối: đặt cảnh cờ. Camera về đầu phải để thấy cổng.
function setFlagScene() {
  const p = state.player;
  state.battle.rider = null;
  state.npcs.push(makeNpc('maiThucLoan', 1, CUT.guideX));
  Object.assign(p, { x: CUT.playerX - p.w / 2, y: GROUND_Y - p.h, vy: 0, vx: 0, platform: null, facing: 1, grounded: true });
  state.cameraX = Math.max(0, LEVEL.worldWidth - VIEW_W);
}

export function updateCutscene(dt) {
  const cut = state.cutscene;
  const p = state.player;
  const boss = state.battle.boss;
  cut.time += dt;
  tickMessage(dt);
  if (cut.step === 'disarm') {
    if (cut.time >= animSeconds(BOSS.id, 'disarm') + CUT.disarmHold) {
      cutsceneStep('story1');
      openStory(STORY_MHD_FLEE, () => {
        startRide(boss);
        cutsceneStep('flee');
      });
    }
  } else if (cut.step === 'flee') {
    if (updateRide(dt)) cutsceneStep('fadeOut');
  } else if (cut.step === 'fadeOut') {
    cut.fade = Math.min(1, cut.time / CUT.fadeTime);
    if (cut.fade >= 1) {
      setFlagScene();
      cutsceneStep('fadeIn');
    }
  } else if (cut.step === 'fadeIn') {
    cut.fade = Math.max(0, 1 - cut.time / CUT.fadeTime);
    if (cut.fade <= 0) {
      state.battle.flagTime = 0;
      playSfx('reward');
      cutsceneStep('flag');
    }
  } else if (cut.step === 'flag') {
    if (cut.time >= animSeconds(FLAG.id, 'raise') + CUT.flagHold) {
      cutsceneStep('story2');
      openStory(STORY_MHD_FLAG, () => cutsceneStep('end'));
    }
  } else if (cut.step === 'end') {
    state.cutscene = null;
    endGame(true);
    return;
  }
  if (state.battle.flagTime !== null) state.battle.flagTime += dt;
  if (!p.grounded && !p.platform) p.y = Math.min(p.y + 200 * dt, GROUND_Y - p.h);
  setAnim(p, 'idle');
  tickAnim(p, dt);
  updateEnemies(dt);
  const rider = state.battle.rider;
  const focus = rider ? rider.x : boss.alive || boss.dying ? centerOf(boss) : null;
  if (cut.step === 'disarm' || cut.step === 'flee') {
    const target = Math.max(0, Math.min(LEVEL.worldWidth - VIEW_W, (focus ?? centerOf(p)) - VIEW_W / 2));
    state.cameraX += (target - state.cameraX) * Math.min(1, dt * 3);
  }
  updateHud();
}
