// Màn 3: trận boss Lục Dận (BT-L3, docs/SUTA_BT_TASK_L3_01.md mục 2):
//   GĐ 1 — Lục Dận trên đài ra lệnh mưa tên độc + 3 tháp vàng ném tiền (choáng);
//   GĐ 2 — 3 lượt kỵ binh thiết giáp (đòn chém bị giáp chặn, chỉ voi húc hạ được);
//   GĐ 3 — đài sụp, Lục Dận rơi xuống bùn, `passive`, hết máu -> cutscene.
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
import { updateEnemies } from '../../engine/enemies.js';
import { updateCamera, shakeCamera } from '../../engine/level-flow.js';
import { endGame } from '../../engine/end-game.js';
import {
  BOSS_LD, COMMAND_TOWER, POISON_ARROWS, GOLD_TOWER, GOLD_COIN, ARMORED_CAVALRY, BOSS_TEXT, BT_CUTSCENE,
  SKILL_TEST, ENEMY_SPRITES
} from './config.js';
import { STORY_LUC_DAN_FALLS, STORY_BT_VICTORY } from './dialogue-data.js';
import { makeArmoredCavalry, makeLucDan } from './level3.js';

const centerOf = body => body.x + body.w / 2;

function facePlayer(entity) {
  const p = state.player;
  entity.facing = Math.sign(centerOf(p) - centerOf(entity)) || entity.facing;
}

// Thời lượng animation `name` của sprite `id` (manifest); thiếu thì 0.
function animSeconds(id, name) {
  const meta = getAnimMeta(id, name);
  return meta ? animLength(meta) : 0;
}

// ---- Mưa tên độc (Lục Dận ra lệnh) ----
// Mỗi loạt `count` mũi quanh người chơi; vạch báo warnTime giây rồi rơi từ mép
// trên. Trúng người chơi (không miễn thương) -1 máu; chạm đất thì tan.
function fireArrowSalvo() {
  const p = state.player;
  const center = centerOf(p);
  playSfx('arrowCommand');
  for (let i = 0; i < POISON_ARROWS.count; i += 1) {
    const x = center + (Math.random() * 2 - 1) * POISON_ARROWS.spread;
    state.battle.arrows.push({ x: Math.max(8, Math.min(LEVEL.worldWidth - 8, x)), warn: POISON_ARROWS.warnTime, tipY: 0, alive: true });
  }
}

export const arrowBox = arrow => ({
  x: arrow.x - POISON_ARROWS.w / 2, y: arrow.tipY - POISON_ARROWS.h, w: POISON_ARROWS.w, h: POISON_ARROWS.h
});

function updateArrows(dt) {
  const battle = state.battle;
  const p = state.player;
  battle.arrows.forEach(arrow => {
    if (arrow.warn > 0) {
      arrow.warn -= dt;
      if (arrow.warn <= 0) playSfx('arrowFall');
      return;
    }
    arrow.tipY += POISON_ARROWS.fallSpeed * dt;
    if (!playerImmune(p) && aabb(p, arrowBox(arrow))) {
      arrow.alive = false;
      hurtPlayer(BOSS_TEXT.arrowHit);
      return;
    }
    if (arrow.tipY >= GROUND_Y) arrow.alive = false;
  });
  battle.arrows = battle.arrows.filter(arrow => arrow.alive);
}

// Lục Dận trên đài (GĐ 1–2): `command` mỗi commandInterval giây, ở hit_frame
// phát 1 loạt mưa tên; ngoài lúc ra lệnh đứng `idle`.
function updateCommander(dt) {
  const battle = state.battle;
  const commander = battle.commander;
  if (!commander) return;
  if (commander.action) {
    const meta = getAnimMeta(BOSS_LD.id, 'command');
    commander.action.time += dt;
    if (!commander.action.released && commander.action.time >= (meta ? hitTime(meta) : 0)) {
      commander.action.released = true;
      fireArrowSalvo();
    }
    if (commander.action.time >= (meta ? animLength(meta) : 0)) commander.action = null;
  } else {
    commander.timer -= dt;
    if (commander.timer <= 0) {
      commander.timer = battle.phase === 1 ? BOSS_LD.commandInterval : BOSS_LD.commandIntervalP2;
      commander.action = { time: 0, released: false };
    }
  }
  setAnim(commander, commander.action ? 'command' : 'idle');
  tickAnim(commander, dt);
  if (commander.action) commander.anim.time = commander.action.time;
}

// ---- Tháp vàng + tiền vàng (GĐ 1) ----
// Đồng tiền bay vòng cung, rơi tới chỗ người chơi lúc ném sau flightTime giây.
function throwCoin(tower) {
  const p = state.player;
  const x = centerOf(tower) + tower.facing * GOLD_TOWER.muzzleX;
  const y = GROUND_Y - GOLD_TOWER.muzzle;
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

// Tiền trúng người chơi (không miễn thương): choáng, không mất máu (khiên mây tre
// chặn được — engine stunPlayer). Chạm đất thì biến mất.
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

// Tháp vàng: quay về người chơi, `throw` mỗi throwInterval giây (tính từ lúc ném
// xong), tiền rời tay ở hit_frame. Animation: death (đống đổ, giữ ô cuối) >
// hurt > throw > idle.
function updateGoldTower(tower, dt) {
  const art = ENEMY_SPRITES.goldTower;
  if (tower.alive) {
    facePlayer(tower);
    if (tower.action) {
      const meta = getAnimMeta(art.id, art.anims.throw);
      tower.action.time += dt;
      if (!tower.action.released && tower.action.time >= (meta ? hitTime(meta) : 0)) {
        tower.action.released = true;
        throwCoin(tower);
      }
      if (tower.action.time >= (meta ? animLength(meta) : 0)) {
        tower.action = null;
        tower.throwTimer = GOLD_TOWER.throwInterval;
      }
    } else {
      tower.throwTimer -= dt;
      if (tower.throwTimer <= 0) tower.action = { time: 0, released: false };
    }
  }
  let next = 'idle';
  if (!tower.alive) next = 'death';
  else if (tower.hitTimer > 0 && !tower.action) next = 'hurt';
  else if (tower.action) next = 'throw';
  setAnim(tower, next);
  tickAnim(tower, dt);
  if (next === 'throw') tower.anim.time = tower.action.time;
}

// Tháp hết máu: đống đổ nằm lại (dying giữ true — không bị engine xoá), vô hại.
function destroyTower(tower) {
  tower.alive = false;
  tower.dying = true;
  tower.action = null;
  setAnim(tower, 'death');
  state.score += 250;
  playSfx('towerBreak');
}

// ---- Kỵ binh thiết giáp (GĐ 2) ----
function setMode(entity, mode) {
  entity.mode = mode;
  entity.modeTime = 0;
}

function hintArmor() {
  const battle = state.battle;
  if (battle.hintTimer > 0) return;
  battle.hintTimer = ARMORED_CAVALRY.hintInterval;
  showMessage(BOSS_TEXT.armorHint, 2400);
}

// Tóe lửa trên giáp tại điểm chém (FX_BT_ARMOR_SPARK, vẽ ở render-extras.js).
function addSpark(x, y) {
  state.battle.sparks ||= [];
  state.battle.sparks.push({ x, y, time: 0 });
}

// Voi húc trúng (skills.js gọi qua ENEMY_KINDS.armoredCavalry.onElephant): ngã
// về hướng voi chạy; tắt va chạm ngay.
function knockCavalry(cavalry, direction) {
  if (!cavalry.alive) return;
  cavalry.alive = false;
  cavalry.dying = true;
  cavalry.pushDirection = direction;
  setMode(cavalry, 'knockback');
  state.score += ARMORED_CAVALRY.defeatScore;
  playSfx('armorBreak');
}

// Phi về phía người chơi theo `direction`, chạm tường quay đầu; `blocked` (đòn
// chém bị chặn) vẫn trượt theo đà chậm; `knockback` bị hất rồi `death`, xác nằm
// corpseTime giây rồi xoá (dying = false).
function updateCavalry(cavalry, dt) {
  cavalry.modeTime += dt;
  const width = LEVEL.worldWidth;
  if (cavalry.mode === 'gallop' || cavalry.mode === 'blocked') {
    const speed = ARMORED_CAVALRY.speed * (cavalry.mode === 'blocked' ? .4 : 1);
    cavalry.x += cavalry.direction * speed * dt;
    if (cavalry.direction > 0 && cavalry.x + cavalry.w >= width) cavalry.direction = -1;
    else if (cavalry.direction < 0 && cavalry.x <= 0) cavalry.direction = 1;
    cavalry.facing = cavalry.direction;
    if (cavalry.mode === 'blocked' && cavalry.modeTime >= animSeconds(ARMORED_CAVALRY.id, 'blocked')) setMode(cavalry, 'gallop');
  } else if (cavalry.mode === 'knockback') {
    const length = animSeconds(ARMORED_CAVALRY.id, 'knockback');
    const slow = Math.max(0, 1 - cavalry.modeTime / Math.max(.01, length));
    cavalry.x = Math.max(-cavalry.w / 2, Math.min(width - cavalry.w / 2, cavalry.x + cavalry.pushDirection * ARMORED_CAVALRY.pushSpeed * slow * dt));
    if (cavalry.modeTime >= length) setMode(cavalry, 'fallen');
  } else if (cavalry.mode === 'fallen') {
    if (cavalry.modeTime >= animSeconds(ARMORED_CAVALRY.id, 'death') + ARMORED_CAVALRY.corpseTime) cavalry.dying = false;
  }
  setAnim(cavalry, cavalry.mode === 'fallen' ? 'death' : cavalry.mode);
  tickAnim(cavalry, dt);
}

// Sinh lượt kỵ binh: lượt sau ra gap giây sau khi lượt trước ngã. Layout thử
// kỹ năng: ra lặp mãi (SKILL_TEST.cavalryGap).
function updateCavalrySpawns(dt) {
  const battle = state.battle;
  if (battle.cavalry && !battle.cavalry.alive) battle.cavalry = null;
  if (battle.cavalry) return;
  if (!battle.test && battle.cavalrySpawned >= ARMORED_CAVALRY.count) return;
  battle.cavalryTimer -= dt;
  if (battle.cavalryTimer > 0) return;
  battle.cavalryTimer = battle.test ? SKILL_TEST.cavalryGap : ARMORED_CAVALRY.gap;
  battle.cavalrySpawned += 1;
  battle.cavalry = makeArmoredCavalry(battle.spawnX);
  state.enemies.push(battle.cavalry);
  playSfx('cavalryCharge');
}

// ---- GĐ 3: đài sụp, Lục Dận rơi xuống bùn ----
function startPhase3(battle) {
  battle.phase = 3;
  battle.phaseTime = 0;
  battle.arrows = [];
  battle.commander.action = null;
  battle.tower.state = 'shake';
  setAnim(battle.tower, 'shake');
  playSfx('towerShake');
  shakeCamera(COMMAND_TOWER.shakeTime, 2);
  showMessage(BOSS_TEXT.phase3, 2600);
}

// Đài: shake -> collapse (Lục Dận bắt đầu rơi). Rơi: `fall` từ sàn xuống đất
// trước đài (nhanh dần), chạm đất -> rung + Lục Dận thành mục tiêu (lucDan).
function updateCollapse(dt) {
  const battle = state.battle;
  const tower = battle.tower;
  tickAnim(tower, dt);
  if (tower.state === 'shake' && tower.anim.time >= COMMAND_TOWER.shakeTime) {
    tower.state = 'collapse';
    setAnim(tower, 'collapse');
    playSfx('towerCollapse');
    battle.commander = null;
    battle.fall = { anim: createAnim('fall'), time: 0 };
  }
  const fall = battle.fall;
  if (!fall) return;
  fall.time += dt;
  tickAnim(fall, dt);
  const length = animSeconds(BOSS_LD.id, 'fall') || .5;
  const t = Math.min(1, fall.time / length);
  fall.x = COMMAND_TOWER.x + (BOSS_LD.groundX - COMMAND_TOWER.x) * t;
  fall.height = COMMAND_TOWER.floor * (1 - t * t);
  if (t < 1) return;
  battle.fall = null;
  battle.lucDan = makeLucDan(BOSS_LD.groundX);
  state.enemies.push(battle.lucDan);
  playSfx('mudSplash');
  shakeCamera(.35, 3);
}

// Lục Dận trong bùn: quay về người chơi, trúng đòn bị đẩy lùi về phía đài (1 lần
// mỗi khung); bỏ chạy (cutscene) thì chạy sang phải.
function updateLucDan(boss, dt) {
  if (boss.pendingPush) {
    boss.x = Math.min(BOSS_LD.maxX - boss.w / 2, boss.x + boss.pendingPush);
    boss.pendingPush = 0;
  }
  if (boss.fleeing) {
    boss.x += BOSS_LD.fleeSpeed * dt;
    boss.facing = 1;
    if (boss.x > LEVEL.worldWidth + 40) boss.dying = false;
  } else if (!boss.beaten) {
    facePlayer(boss);
  }
  let next = 'idle';
  if (boss.fleeing) next = 'flee';
  else if (boss.beaten || boss.hitTimer > 0) next = 'hurt';
  setAnim(boss, next);
  tickAnim(boss, dt);
}

// Lục Dận hết máu: dừng mọi quân, đạn, tên, tiền, voi -> cutscene. Người chơi
// mất quyền điều khiển từ đây.
function defeatLucDan(boss) {
  playSfx('bossDefeat');
  // Nhạc trận dừng trong cutscene; nhạc thắng phát ở endGame.
  stopMusic();
  state.score += BOSS_LD.defeatScore;
  Object.assign(boss, { alive: false, dying: true, beaten: true, hitTimer: 0 });
  const battle = state.battle;
  battle.arrows = [];
  battle.coins = [];
  state.projectiles = [];
  if (state.skills) Object.assign(state.skills.elephant, { active: false });
  if (state.skills) state.skills.shield.active = 0;
  const p = state.player;
  Object.assign(p, {
    dashing: false, dashTimer: 0, attackCooldown: 0, attacking: false, hurtTimer: 0, invulnerable: 0, vx: 0, stun: 0
  });
  clearInput();
  state.cutscene = { step: 'beaten', time: 0, fade: 0, elephant: null, flag: false };
}

// Tiến trình trận (LEVEL.update): GĐ 1 (tháp vàng) -> hết tháp -> GĐ 2 (kỵ binh)
// -> đủ 3 lượt ngã -> GĐ 3 (đài sụp). Mưa tên chạy suốt GĐ 1–2.
export function updateBattle(dt) {
  const battle = state.battle;
  if (!battle) return;
  battle.phaseTime += dt;
  battle.hintTimer = Math.max(0, battle.hintTimer - dt);
  (battle.sparks || []).forEach(spark => { spark.time += dt; });
  battle.sparks = (battle.sparks || []).filter(spark => spark.time < animSeconds(ARMORED_CAVALRY.spark, 'impact') + .02);
  updateArrows(dt);
  updateCoins(dt);
  if (battle.test) {
    updateCavalrySpawns(dt);
    return;
  }
  if (battle.phase <= 2) updateCommander(dt);
  if (battle.phase === 1 && !state.enemies.some(enemy => enemy.kind === 'goldTower' && enemy.alive)) {
    battle.phase = 2;
    battle.phaseTime = 0;
    battle.coins = [];
    playSfx('waveStart');
  } else if (battle.phase === 2) {
    updateCavalrySpawns(dt);
    if (battle.cavalrySpawned >= ARMORED_CAVALRY.count && !battle.cavalry) startPhase3(battle);
  }
  if (battle.phase === 3) updateCollapse(dt);
}

// ---- Cutscene kết chương (BT-00 §5.2–5.3, LEVEL.cutscene — thay update()) ----
// Người chơi không điều khiển:
//   beaten   -> Lục Dận trúng đòn cuối đứng beatenHold giây
//   fadeOut  -> tối dần; hết tối: người chơi về mặt đất, cốt truyện câu 1
//   fadeIn   -> sáng lại, Lục Dận `flee` chạy ra mép phải; Bạch Tượng `bow`
//   mount    -> chớp tối; ở giữa đổi sang Bà Triệu cưỡi voi (PLAYER_BA_TRIEU_ELEPHANT)
//   ready    -> voi đứng mountHold giây
//   charge   -> voi lao sang phải tới chargeToX, rung màn hình theo nhịp chân
//   victory  -> cờ cắm, đứng victoryHold giây rồi cốt truyện câu 2 -> panel kết chương.
// Panel cốt truyện đặt state.paused nên update() dừng tới khi đóng panel.
const CUT = BT_CUTSCENE;

function cutsceneStep(step) {
  state.cutscene.step = step;
  state.cutscene.time = 0;
}

export function updateCutscene(dt) {
  const cut = state.cutscene;
  const p = state.player;
  const boss = state.battle.lucDan;
  cut.time += dt;
  tickMessage(dt);
  let cameraTarget = null;

  if (cut.step === 'beaten') {
    if (cut.time >= CUT.beatenHold) cutsceneStep('fadeOut');
  } else if (cut.step === 'fadeOut') {
    cut.fade = Math.min(1, cut.time / CUT.fadeTime);
    if (cut.fade >= 1) {
      // Đang tối hẳn: người chơi về mặt đất, đứng sau chỗ Bạch Tượng xuất hiện.
      p.x = CUT.playerX;
      p.y = GROUND_Y - p.h;
      p.vy = 0;
      p.grounded = true;
      p.facing = 1;
      cut.elephant = { x: CUT.elephantX, rider: false, anim: createAnim('bow') };
      cutsceneStep('story1');
      openStory(STORY_LUC_DAN_FALLS, () => cutsceneStep('fadeIn'));
    }
  } else if (cut.step === 'fadeIn') {
    cut.fade = Math.max(0, 1 - cut.time / CUT.fadeTime);
    if (boss) Object.assign(boss, { beaten: false, fleeing: true });
    if (cut.fade <= 0 && cut.elephant.anim.time >= animSeconds('NPC_BACH_TUONG', 'bow')) {
      playSfx('elephantCall');
      cutsceneStep('mount');
    }
  } else if (cut.step === 'mount') {
    const half = CUT.mountFade;
    cut.fade = cut.time < half ? cut.time / half : Math.max(0, 2 - cut.time / half);
    if (cut.time >= half && !cut.elephant.rider) {
      cut.elephant.rider = true;
      setAnim(cut.elephant, 'idle');
    }
    if (cut.time >= half * 2) {
      cut.fade = 0;
      cutsceneStep('ready');
    }
  } else if (cut.step === 'ready') {
    if (cut.time >= CUT.mountHold) {
      setAnim(cut.elephant, 'charge');
      cutsceneStep('charge');
    }
  } else if (cut.step === 'charge') {
    cut.elephant.x += CUT.chargeSpeed * dt;
    // Rung theo nhịp chân voi.
    if (Math.floor(cut.time * 4) !== Math.floor((cut.time - dt) * 4)) shakeCamera(.2, 2);
    cameraTarget = cut.elephant.x;
    if (cut.elephant.x >= CUT.chargeToX) {
      cut.elephant.x = CUT.chargeToX;
      setAnim(cut.elephant, 'idle');
      cut.flag = true;
      playSfx('gateOpen');
      cutsceneStep('victory');
    }
  } else if (cut.step === 'victory') {
    cameraTarget = cut.elephant.x;
    if (cut.time >= CUT.victoryHold) {
      cutsceneStep('story2');
      openStory(STORY_BT_VICTORY, () => cutsceneStep('end'));
    }
  } else if (cut.step === 'story2') {
    cameraTarget = cut.elephant.x;
  } else if (cut.step === 'end') {
    state.cutscene = null;
    endGame(true);
    return;
  }

  if (cut.elephant) tickAnim(cut.elephant, dt);
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

// Enemy `kind` riêng của trận (CHAPTER.enemyKinds — engine gọi):
//   goldTower:      tháp vàng — hết máu thành đống đổ; voi húc -2 máu.
//   armoredCavalry: đòn chém bị giáp chặn (blocked + tóe lửa + gợi ý); chạm thân
//                   -1 máu; voi húc -> ngã.
//   lucDan:         trúng đòn bị đẩy lùi; hết máu -> cutscene.
// `onElephant(enemy, direction)` do skills.js gọi khi Bạch Tượng húc trúng.
export const ENEMY_KINDS = {
  goldTower: {
    update: updateGoldTower,
    onStruck(enemy) {
      if (enemy.hp <= 0) destroyTower(enemy);
    },
    onElephant(enemy) {
      enemy.hp -= GOLD_TOWER.elephantDamage;
      enemy.hitTimer = .18;
      playSfx('hit');
      if (enemy.hp <= 0) destroyTower(enemy);
    },
    debugLabel: (enemy, label) => `${label} hp ${enemy.hp}`
  },
  armoredCavalry: {
    update: updateCavalry,
    blockStrike(enemy) {
      if (!enemy.alive) return true;
      const p = state.player;
      if (enemy.mode !== 'blocked') setMode(enemy, 'blocked');
      addSpark(p.facing > 0 ? enemy.x + 6 : enemy.x + enemy.w - 6, p.y + 14);
      playSfx('armorClank');
      hintArmor();
      return true;
    },
    onContact() {
      hurtPlayer(BOSS_TEXT.cavalryHit);
    },
    onElephant: knockCavalry,
    debugLabel: (enemy, label) => `${label} ${enemy.mode}`
  },
  lucDan: {
    update: updateLucDan,
    onStruck(enemy) {
      enemy.pendingPush = BOSS_LD.knockback;
      state.score += BOSS_LD.hitScore;
      if (enemy.hp <= 0) defeatLucDan(enemy);
    },
    onElephant(enemy, direction, damage) {
      enemy.hp -= damage;
      enemy.hitTimer = .18;
      enemy.pendingPush = BOSS_LD.knockback * 2;
      playSfx('hit');
      if (enemy.hp <= 0) defeatLucDan(enemy);
    }
  }
};

// Ô boss góc trên-phải (CHAPTER.hooks.updateHud): "Tháp vàng" + nấc còn lại ở
// GĐ 1, "Kỵ binh thiết giáp" + lượt còn lại ở GĐ 2; ẩn ở GĐ 3 (thanh máu trên
// đầu Lục Dận) và layout thử.
export function updateBossHud() {
  const battle = state.battle;
  const phase = battle && !battle.test ? battle.phase : 0;
  ui.bossHud.hidden = !(phase === 1 || phase === 2);
  if (ui.bossHud.hidden) return;
  ui.bossPips[0].parentElement.hidden = false;
  let left;
  if (phase === 1) {
    ui.bossLabel.textContent = 'Tháp vàng';
    left = state.enemies.filter(enemy => enemy.kind === 'goldTower' && enemy.alive).length;
  } else {
    ui.bossLabel.textContent = 'Kỵ binh thiết giáp';
    left = ARMORED_CAVALRY.count - battle.cavalrySpawned + (battle.cavalry?.alive ? 1 : 0);
  }
  ui.bossPips.forEach((pip, index) => pip.classList.toggle('is-lost', index >= left));
}

// Hộp F2 riêng của trận: tên độc đang rơi, tiền vàng.
export function battleDebugEntities() {
  const battle = state.battle;
  if (!battle) return [];
  return [
    ...battle.arrows.filter(arrow => arrow.warn <= 0).map(arrowBox),
    ...battle.coins.map(coinBox)
  ];
}
