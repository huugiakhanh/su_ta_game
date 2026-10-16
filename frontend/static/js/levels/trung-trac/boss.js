// Màn 3: trận boss Tô Định (TT-BOSS-01 §3.5–3.9) — chiến xa + hũ dầu + cột đá
// (giai đoạn 1), thân binh theo đợt (giai đoạn 2), Tô Định đi bộ + quân cảm
// tử (giai đoạn 3), mưa tên trên thành, cutscene kết chương. Gắn vào engine qua
// LEVEL.update (updateBattle), LEVEL.cutscene, CHAPTER.enemyKinds, CHAPTER.hooks.

import { state } from '../../engine/state.js';
import { clearInput } from '../../engine/input.js';
import { ui, showMessage, tickMessage, updateHud } from '../../engine/ui.js';
import { aabb } from '../../engine/geometry.js';
import { setAnim, tickAnim, getAnimMeta, hitTime, animLength, createAnim } from '../../engine/animation.js';
import { GROUND_Y, DASH_TIME } from '../../engine/config.js';
import { LEVEL } from '../../engine/chapter.js';
import { openStory } from '../../engine/dialogue.js';
import { playSfx, stopMusic } from '../../engine/audio.js';
import { hurtPlayer, playerImmune } from '../../engine/damage.js';
import { updateEnemies } from '../../engine/enemies.js';
import { updateCamera } from '../../engine/level-flow.js';
import { endGame } from '../../engine/end-game.js';
import { ARENA, BOSS_TD, WAVES, BOSS_TEXT, WALL_ARROWS, ARROW_RAIN_SPRITE, ENEMY_SPRITES } from './config.js';
import { STORY_TO_DINH_FLEES, STORY_LUY_LAU_VICTORY } from './dialogue-data.js';
import { makeArenaSpawner, makeToDinhFoot, spawnArenaEnemy } from './level3.js';

// ---- Giai đoạn 1–2: chiến xa, hũ dầu, cột đá (§3.5–3.6) ----
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
  playSfx(chariot.shield > 0 ? 'shieldCrack' : 'shieldBreak');
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
  playSfx('pillarCrack');
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
  playSfx('throw');
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
  playSfx('jarReflect');
  jar.vx = direction * JAR.reflectSpeed;
  jar.vy = 0;
  state.score += BOSS_TD.reflectScore;
}

// Cửa sổ đánh của người chơi (CHAPTER.hooks.onAttackWindow): chém trúng hũ
// dầu đang bay thì phản về phía chiến xa.
export function reflectJarsInBox(attackBox) {
  state.jars.forEach(jar => {
    if (jar.alive && !jar.reflected && aabb(attackBox, jarReflectBox(jar))) reflectJar(jar);
  });
}

// Dash xuyên chiến xa (CHAPTER.hooks.keepDashing): còn chồng thân xe thì kéo
// dài cú lướt (tối đa thêm DASH_TIME — xe sát tường/cột thì không kẹt mãi
// trong cú lướt).
export function keepDashingThroughChariot(p) {
  const chariot = state.battle?.chariot;
  return Boolean(chariot?.alive && aabb(p, chariot) && p.dashTimer > -DASH_TIME);
}

function spawnFire(x, footY, harmless) {
  state.fires.push({ x, footY, time: 0, harmless, hit: false });
  playSfx('fire');
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
        playSfx('chariotWarn');
      }
    }
  } else if (chariot.mode === 'warn') {
    facePlayer(chariot);
    if (chariot.modeTime >= BOSS_TD.warnTime) {
      chariot.direction = chariot.facing;
      setChariotMode(chariot, 'charge');
      playSfx('chariotCharge');
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

// Tiến trình trận (LEVEL.update): giai đoạn 1 (chiến xa) -> hết khiên ->
// giai đoạn 2 (Tô Định đứng sau xác xe, 3 đợt thân binh WAVES) -> hết đợt 3 ->
// giai đoạn 3. Layout thử kỹ năng không có trận (state.battle = null).
export function updateBattle(dt) {
  const battle = state.battle;
  if (!battle) return;
  battle.phaseTime += dt;
  battle.hintTimer = Math.max(0, battle.hintTimer - dt);
  updateJars(dt);
  updateFires(dt);
  updatePillars(dt);
  if (battle.phase === 1 && !battle.chariot.alive) {
    battle.phase = 2;
    battle.phaseTime = 0;
    battle.foot = { x: BOSS_TD.footX, anim: createAnim('idle') };
    state.spawner = makeArenaSpawner(WAVES.groups, WAVES.gap, false, 'waveStart');
  } else if (battle.phase === 2 && state.spawner?.done) {
    startPhase3(battle);
  }
  if (battle.phase === 3) updatePhase3Rushers(dt);
  updateWallArrows(dt);
  if (battle.foot) tickAnim(battle.foot, dt);
}

// ---- Giai đoạn 3, mưa tên trên thành, cutscene kết chương (§3.7–3.9) ----
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
  playSfx('waveStart');
  showMessage(BOSS_TEXT.phase3, 2600);
}

function updatePhase3Rushers(dt) {
  const battle = state.battle;
  battle.rusherTimer -= dt;
  if (battle.rusherTimer > 0) return;
  battle.rusherTimer = FOOT.rusherInterval;
  const rushers = state.enemies.filter(enemy => enemy.alive && enemy.art === 'rusher').length;
  if (rushers < FOOT.rusherMax) state.enemies.push(spawnArenaEnemy({ type: 'rusher' }, ARENA.spawnX));
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
  playSfx('bossDefeat');
  // Nhạc trận dừng trong cutscene; nhạc thắng phát ở endGame.
  stopMusic();
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
      if (arrow.warn <= 0) playSfx('arrowFall');
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

// Cutscene kết chương (§3.8, LEVEL.cutscene — thay update()), người chơi không điều khiển:
//   disarm  -> Tô Định phát `disarmed` rồi đứng thêm disarmHold
//   fadeOut -> tối dần; hết tối: panel cốt truyện câu 1–2 (PORTRAIT_TO_DINH)
//   fadeIn  -> sáng lại, Tô Định (đã cải trang) `flee` chạy sang trái ra khỏi màn hình
//   walk    -> người chơi tự đi tới trước cổng; tới nơi: cổng mở, cờ, `victory`
//   victory -> đứng victoryHold rồi panel cốt truyện câu 3–4 (PORTRAIT_TRUNG_TRAC)
//   -> panel kết chương (endGame).
// Panel cốt truyện đặt state.paused nên update() dừng tới khi đóng panel.
export function updateCutscene(dt) {
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
      playSfx('gateOpen');
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

// Enemy `kind` riêng của trận (CHAPTER.enemyKinds — engine gọi):
//   chariot: chém thẳng khi còn khiên chỉ nháy + gợi ý; chạm thân -1 máu (trừ
//            khi người chơi đứng trên cột đá); rung khi báo trước lao.
//   foot:    trúng đòn bị đẩy lùi; hết máu -> văng kiếm, cutscene.
export const ENEMY_KINDS = {
  chariot: {
    update: updateChariot,
    blockStrike(enemy) {
      if (!enemy.shielded) return false;
      enemy.hitTimer = .18;
      playSfx('shieldHit');
      shieldHint();
      return true;
    },
    onContact(enemy, p) {
      // Đứng trên cột đá: không tính va chạm với xe đứng sát cột.
      if (!p.standingOn?.blocking) hurtPlayer('Bạn bị chiến xa húc trúng!');
    },
    shake: enemy => (enemy.alive && enemy.mode === 'warn'
      ? (Math.floor(enemy.modeTime * 30) % 2 ? BOSS_TD.shake : -BOSS_TD.shake) : 0),
    debugLabel: (enemy, label) => `${label} ${enemy.mode} khiên ${enemy.shield}`
  },
  foot: {
    update: updateFoot,
    onStruck(enemy) {
      enemy.pendingPush = FOOT.knockback;
      if (enemy.hp <= 0) {
        state.score += 700;
        defeatToDinh(enemy);
      }
    }
  }
};

// Ô boss góc trên-phải (CHAPTER.hooks.updateHud): "Khiên" + nấc ở giai đoạn 1,
// "Đợt N/3" ở giai đoạn 2; ẩn ở giai đoạn 3 và ngoài trận.
export function updateBossHud() {
  const battle = state.battle;
  const phase = battle?.phase;
  ui.bossHud.hidden = !(phase === 1 || phase === 2);
  if (ui.bossHud.hidden) return;
  const shieldPhase = phase === 1;
  ui.bossPips[0].parentElement.hidden = !shieldPhase;
  if (shieldPhase) {
    ui.bossLabel.textContent = 'Khiên';
    ui.bossPips.forEach((pip, index) => pip.classList.toggle('is-lost', index >= battle.chariot.shield));
    return;
  }
  const spawner = state.spawner;
  const total = spawner?.groups.length || 3;
  ui.bossLabel.textContent = `Đợt ${Math.min(total, Math.max(1, spawner?.index || 1))}/${total}`;
}

// Hộp F2 riêng của trận: hũ dầu, đám lửa.
export function battleDebugEntities() {
  return [
    ...state.jars.map(jar => ({ x: jar.x - JAR.w / 2, y: jar.y - JAR.h / 2, w: JAR.w, h: JAR.h })),
    ...state.fires.map(fire => ({ x: fire.x - FIRE.width / 2, y: fire.footY - FIRE.h, w: FIRE.width, h: FIRE.h }))
  ];
}
