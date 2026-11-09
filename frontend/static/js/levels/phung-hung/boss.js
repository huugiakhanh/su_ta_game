// Màn 3: trận Cao Chính Bình (PH-L3, docs/SUTA_PH_TASK_L3_01.md §2, §4). Boss không
// có máu, thay bằng thanh Nỗi sợ hãi:
//   GĐ 1 — né nước sôi, đá rơi, tên; lính rơi đuốc, ném vào 4 trụ gác.
//   GĐ 2 — đấm 2 trống đồng luân phiên trái, phải.
//   Đầy thanh -> cutscene (PH-00 §5.2) -> panel kết chương (§5.3).
// Gắn vào engine qua LEVEL.update, LEVEL.cutscene, CHAPTER.enemyKinds, CHAPTER.hooks.

import { state } from '../../engine/state.js';
import { clearInput } from '../../engine/input.js';
import { ui, showMessage, tickMessage, updateHud } from '../../engine/ui.js';
import { aabb } from '../../engine/geometry.js';
import { setAnim, tickAnim, getAnimMeta, animLength } from '../../engine/animation.js';
import { GROUND_Y, GRAVITY, VIEW_W } from '../../engine/config.js';
import { LEVEL } from '../../engine/chapter.js';
import { openStory } from '../../engine/dialogue.js';
import { playSfx, stopMusic } from '../../engine/audio.js';
import { hurtPlayer, playerImmune } from '../../engine/damage.js';
import { updateEnemies } from '../../engine/enemies.js';
import { shakeCamera } from '../../engine/level-flow.js';
import { endGame } from '../../engine/end-game.js';
import {
  ARENA, BOSS, BOSS_TEXT, DRUMS, FEAR, GATE, HEAL_DROP, PH_CUTSCENE as CUT, POSTS, ROCKS, SKILLS, SOLDIERS, TORCH
} from './config.js';
import { STORY_PH_COLLAPSE, STORY_PH_GATE } from './dialogue-data.js';
import { makeArenaSoldier } from './level3.js';
import { stopSkills } from './skills.js';

const POWER = SKILLS.BUFF_PH_POWER;
const centerOf = body => body.x + body.w / 2;
const ownsPower = () => Boolean(state.skills?.owned.has('BUFF_PH_POWER'));

function animSeconds(id, name) {
  const meta = getAnimMeta(id, name);
  return meta ? animLength(meta) : 0;
}

function showHint(text) {
  const battle = state.battle;
  if (battle.hintTimer > 0) return;
  battle.hintTimer = BOSS.hintInterval;
  showMessage(text, 2400);
}

// ---- Tư thế boss (chỉ vẽ, không có thân) ----
function setBossPose(pose) {
  Object.assign(state.battle.boss, { pose, time: 0 });
}

const restPose = () => (state.battle.fear >= FEAR.panicAt ? 'fear' : 'idle');

function updateBossPose(dt) {
  const boss = state.battle.boss;
  boss.time += dt;
  if ((boss.pose === 'command' || boss.pose === 'hurt') && boss.time >= animSeconds(BOSS.id, boss.pose)) setBossPose(restPose());
  else if (boss.pose === 'idle' && restPose() === 'fear') setBossPose('fear');
}

// ---- Thanh Nỗi sợ hãi ----
function addFear(amount) {
  const battle = state.battle;
  battle.fear = Math.min(FEAR.max, battle.fear + amount);
  if (battle.fear >= FEAR.max && !state.cutscene) startCutscene();
}

// ---- Trụ gác ----
function ignitePost(post) {
  if (post.lit) return;
  Object.assign(post, { lit: true, alive: false, dying: true });
  setAnim(post, 'ignite');
  post.anim.time = 0;
  state.score += POSTS.score;
  playSfx('postIgnite');
  showMessage(BOSS_TEXT.postLit, 1800);
  addFear(POSTS.fear);
}

function updatePost(post, dt) {
  tickAnim(post, dt);
  if (post.anim.name === 'ignite' && post.anim.time >= animSeconds('OB_PH_WATCH_POST', 'ignite')) setAnim(post, 'burning');
}

// ---- Trống đồng ----
function setDrumReady(drum, ready) {
  drum.ready = ready;
  if (drum.anim.name !== 'hit') setAnim(drum, ready ? 'ready' : 'idle');
}

function hitDrum(drum) {
  const battle = state.battle;
  setDrumReady(drum, false);
  setAnim(drum, 'hit');
  drum.anim.time = 0;
  setDrumReady(battle.drums.find(other => other !== drum), true);
  shakeCamera(DRUMS.shakeTime, DRUMS.shakeAmp);
  playSfx('drumHit');
  state.score += DRUMS.score;
  setBossPose('hurt');
  if (ownsPower()) addFx(POWER.fx, 'impact', centerOf(drum), drum.y + drum.h);
  addFear(DRUMS.fear * (ownsPower() ? POWER.drumFactor : 1));
}

function updateDrum(drum, dt) {
  tickAnim(drum, dt);
  if (drum.anim.name === 'hit' && drum.anim.time >= animSeconds('OB_PH_BRONZE_DRUM', 'hit')) setAnim(drum, drum.ready ? 'ready' : 'idle');
}

// Đòn chém không trừ gì của trống: đúng trống đang mở thì tính một cú đấm.
function blockDrumStrike(drum) {
  if (drum.ready) hitDrum(drum);
  else showHint(BOSS_TEXT.drumWait);
  return true;
}

// ---- GĐ 1 -> GĐ 2 ----
function setDrumsForPhase2() {
  const { drums } = state.battle;
  const px = centerOf(state.player);
  const far = drums.reduce((best, drum) => (Math.abs(centerOf(drum) - px) > Math.abs(centerOf(best) - px) ? drum : best));
  drums.forEach(drum => {
    Object.assign(drum, { alive: true, dying: false });
    setDrumReady(drum, drum === far);
  });
}

// CHAPTER.hooks.onAttackWindow: GĐ 1 trống chưa nhận đòn, chỉ nhắc.
export function onAttackWindow(attackBox) {
  const battle = state.battle;
  if (battle?.phase === 1 && battle.drums.some(drum => aabb(attackBox, drum))) showHint(BOSS_TEXT.drumLocked);
}

function startPhase2() {
  const battle = state.battle;
  battle.phase = 2;
  battle.soldierTimer = SOLDIERS.phase2.interval;
  // Cung thủ ngừng bắn. Đuốc hết tác dụng, bỏ để Đánh là đấm được trống.
  battle.archers.forEach(archer => { archer.fireRange = -1; });
  state.player.carrying = null;
  state.pickups = state.pickups.filter(pickup => !pickup.carry);
  state.thrown = [];
  setDrumsForPhase2();
  shakeCamera(.4, 3);
  playSfx('drumHit');
  showMessage(BOSS_TEXT.phase2, 2800);
}

// ---- Đá rơi: khoá chỗ người chơi lúc báo, rơi thẳng, không chặn đường ----
function spawnRock() {
  const x = Math.max(ROCKS.margin, Math.min(ARENA.width - ROCKS.margin, centerOf(state.player)));
  state.battle.rocks.push({ x, y: ROCKS.startY, vy: ROCKS.fallSpeed, mode: 'warn', time: 0, harmful: true });
  playSfx('trap');
}

function updateRock(rock, dt) {
  rock.time += dt;
  if (rock.mode === 'warn') {
    if (rock.time < ROCKS.warn) return;
    Object.assign(rock, { mode: 'fall', time: 0 });
  }
  if (rock.mode === 'fall') {
    rock.vy += GRAVITY * dt;
    rock.y = Math.min(GROUND_Y - ROCKS.h, rock.y + rock.vy * dt);
    const p = state.player;
    const box = { x: rock.x - ROCKS.w / 2, y: rock.y, w: ROCKS.w, h: ROCKS.h };
    if (rock.harmful && !playerImmune(p) && aabb(p, box)) {
      rock.harmful = false;
      hurtPlayer(BOSS_TEXT.rockHit);
    }
    if (rock.y >= GROUND_Y - ROCKS.h) Object.assign(rock, { mode: 'landed', time: 0 });
  } else if (rock.mode === 'landed' && rock.time >= ROCKS.landed) {
    Object.assign(rock, { mode: 'break', time: 0 });
  }
}

function updateRocks(dt) {
  const battle = state.battle;
  battle.rockTimer -= dt;
  if (battle.rockTimer <= 0) {
    battle.rockTimer = ROCKS.interval;
    spawnRock();
  }
  battle.rocks.forEach(rock => updateRock(rock, dt));
  battle.rocks = battle.rocks.filter(rock => !(rock.mode === 'break' && rock.time >= ROCKS.breakTime));
}

// ---- Lính ----
function updateSoldiers(dt) {
  const battle = state.battle;
  const rule = battle.test ? SOLDIERS.test : battle.phase === 1 ? SOLDIERS.phase1 : SOLDIERS.phase2;
  battle.soldierTimer -= dt;
  if (battle.soldierTimer > 0) return;
  battle.soldierTimer = rule.interval;
  if (state.enemies.filter(enemy => enemy.alive && enemy.soldier).length >= rule.max) return;
  const fromRight = centerOf(state.player) < ARENA.width / 2;
  state.enemies.push(makeArenaSoldier(fromRight ? ARENA.width - ARENA.spawnEdge : ARENA.spawnEdge, fromRight ? -1 : 1));
}

function torchesOnField() {
  return state.pickups.filter(pickup => pickup.carry === 'torch').length
    + state.thrown.filter(item => item.alive).length
    + (state.player.carrying ? 1 : 0);
}

// CHAPTER.hooks.dropCarry: lính GĐ 1 rơi đuốc khi còn trụ chưa cháy.
export function dropCarry(target) {
  const battle = state.battle;
  if (!battle || battle.phase !== 1 || !target.soldier) return null;
  if (battle.posts.every(post => post.lit) || torchesOnField() >= TORCH.maxOnField) return null;
  if (!battle.torchHintShown) {
    battle.torchHintShown = true;
    showMessage(BOSS_TEXT.torchHint, 2400);
  }
  return 'torch';
}

// CHAPTER.hooks.onThrownHit: trúng trụ thì cháy; trúng lính thì tính như đòn thường.
export function onThrownHit(thrown, target) {
  if (target.kind === 'watchPost') {
    ignitePost(target);
    return true;
  }
  return !target.soldier;
}

// CHAPTER.hooks.dropHeal: lính ở màn 3.
export function dropHeal(target) {
  return Boolean(state.battle && target.soldier && Math.random() < HEAL_DROP.chance);
}

// ---- FX chỉ vẽ ----
export function addFx(id, anim, x, footY) {
  state.battle.fxs.push({ id, anim, x, footY, time: 0, length: animSeconds(id, anim) });
}

// CHAPTER.hooks.onCrit: Sức Địch Ngàn Người trúng lính.
export function onCrit(target) {
  if (state.battle) addFx(POWER.fx, 'impact', centerOf(target), target.y + target.h);
}

function updateFxs(dt) {
  const battle = state.battle;
  battle.fxs.forEach(fx => { fx.time += dt; });
  battle.fxs = battle.fxs.filter(fx => fx.time < fx.length);
}

// Tiến trình trận (LEVEL.update).
export function updateBattle(dt) {
  const battle = state.battle;
  if (!battle || state.cutscene) return;
  battle.hintTimer = Math.max(0, battle.hintTimer - dt);
  if (battle.test && !battle.testStarted) {
    battle.testStarted = true;
    setDrumsForPhase2();
    battle.archers.forEach(archer => { archer.fireRange = -1; });
  }
  updateFxs(dt);
  updateBossPose(dt);
  updateRocks(dt);
  updateSoldiers(dt);
  if (battle.boss.pose !== 'command' && battle.boss.pose !== 'hurt' && battle.archers.some(archer => archer.action?.time === 0)) setBossPose('command');
  if (battle.pendingFear > 0) {
    const amount = battle.pendingFear;
    battle.pendingFear = 0;
    addFear(amount);
  }
  if (!state.cutscene && battle.phase === 1 && battle.posts.every(post => post.lit)) startPhase2();
}

// ---- Enemy `kind` riêng của trận (CHAPTER.enemyKinds) ----
export const ENEMY_KINDS = {
  watchPost: {
    update: updatePost,
    blockStrike() {
      showHint(BOSS_TEXT.postHint);
      return true;
    },
    onContact() {},
    debugLabel: (post, label) => `${label} ${post.lit ? 'lit' : 'unlit'}`
  },
  drum: {
    update: updateDrum,
    blockStrike: blockDrumStrike,
    onContact() {},
    debugLabel: (drum, label) => `${label} ${drum.ready ? 'ready' : 'off'}`
  }
};

// Ô boss góc trên-phải (CHAPTER.hooks.updateHud). Ẩn ở màn khác và trong cutscene.
export function updateBossHud() {
  const battle = state.battle;
  ui.bossHud.hidden = !battle || Boolean(state.cutscene);
  if (ui.bossHud.hidden) return;
  ui.bossPips.forEach(pip => { pip.hidden = true; });
  ui.bossLabel.textContent = battle.phase === 1
    ? `Cao Chính Bình — Đốt trụ gác ${battle.posts.filter(post => post.lit).length}/${battle.posts.length}`
    : 'Cao Chính Bình — Trống đồng';
}

// ---- Cutscene kết chương (PH-00 §5.2–5.3, LEVEL.cutscene — thay update()) ----
//   collapse -> story1 -> gate (cổng mở) -> march -> enter (mờ dần) -> story2 -> panel.
function cutsceneStep(step) {
  state.cutscene.step = step;
  state.cutscene.time = 0;
}

function startCutscene() {
  const battle = state.battle;
  playSfx('bossDefeat');
  stopMusic();
  state.score += BOSS.defeatScore;
  setBossPose('death');
  battle.rocks = [];
  state.projectiles = [];
  state.thrown = [];
  state.pickups = state.pickups.filter(pickup => !pickup.carry);
  state.hazards = state.hazards.filter(hazard => hazard.kind !== 'vent');
  state.enemies.forEach(enemy => {
    if (!enemy.soldier || !enemy.alive) return;
    Object.assign(enemy, { alive: false, dying: true, action: null });
    setAnim(enemy, 'death');
  });
  stopSkills();
  const p = state.player;
  Object.assign(p, {
    dashing: false, dashTimer: 0, attackCooldown: 0, attacking: false, hurtTimer: 0, invulnerable: 0, vx: 0, stun: 0, carrying: null
  });
  clearInput();
  shakeCamera(.6, 3);
  state.cutscene = { step: 'collapse', time: 0, fade: 0 };
}

function openGate() {
  const battle = state.battle;
  battle.gateOpen = true;
  shakeCamera(.4, 3);
  playSfx('gateOpen');
  battle.marchers = CUT.marchers.map(([id, x, facing]) => ({ id, x, facing }));
  battle.lord = { x: Math.max(0, state.cameraX) - 24, alpha: 1 };
}

// Đưa camera về giữa lầu cổng.
function focusGate(dt) {
  const target = Math.max(0, Math.min(LEVEL.worldWidth - VIEW_W, GATE.x - VIEW_W / 2));
  state.cameraX += (target - state.cameraX) * Math.min(1, dt * CUT.cameraRate);
}

export function updateCutscene(dt) {
  const cut = state.cutscene;
  const battle = state.battle;
  const p = state.player;
  cut.time += dt;
  tickMessage(dt);
  battle.boss.time += dt;
  if (cut.step === 'collapse') {
    if (cut.time >= animSeconds(BOSS.id, 'death') + CUT.collapseHold) {
      cutsceneStep('story1');
      openStory(STORY_PH_COLLAPSE, () => {
        openGate();
        cutsceneStep('gate');
      });
    }
  } else if (cut.step === 'gate') {
    if (cut.time >= CUT.gateHold) cutsceneStep('march');
  } else if (cut.step === 'march') {
    battle.lord.x = Math.min(GATE.x, battle.lord.x + CUT.walkSpeed * dt);
    if (GATE.x - battle.lord.x <= CUT.enterDistance) cutsceneStep('enter');
  } else if (cut.step === 'enter') {
    battle.lord.alpha = Math.max(0, 1 - cut.time / CUT.enterFade);
    if (battle.lord.alpha <= 0) {
      cutsceneStep('story2');
      openStory(STORY_PH_GATE, () => cutsceneStep('end'));
    }
  } else if (cut.step === 'end') {
    state.cutscene = null;
    endGame(true);
    return;
  }
  if (!p.grounded && !p.platform) p.y = Math.min(p.y + 200 * dt, GROUND_Y - p.h);
  setAnim(p, 'idle');
  tickAnim(p, dt);
  updateEnemies(dt);
  focusGate(dt);
  updateHud();
}
