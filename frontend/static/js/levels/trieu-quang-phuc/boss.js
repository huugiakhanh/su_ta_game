// Màn 3: trận boss Dương Sàn (TQP-L3, docs/archive/SUTA_TQP_TASK_L3_01.md §2, §4):
//   GĐ 1–2 — Dương Sàn đuổi đánh, lao theo người chơi; lao vào dải sình thì lún,
//            gáy hở -> bổ từ trên vào gáy (Móng Rồng: sát thương đầy đủ). Giáp
//            chặn mọi đòn khác (tóe lửa). Gọi lính đánh thuê + cung thủ. 3 lượt.
//   GĐ 3   — cuồng nộ đập vỡ mỏm đất, đoạn giữa hoá nước, 3 thuyền độc mộc; boss ở
//            bờ phải, cuồng nộ tạo sóng đất rồi sa vào sình mép bờ -> bổ kết liễu.
// Hết máu -> cutscene (TQP-00 §5.4) -> panel kết chương (§5.5).
// Gắn vào engine qua LEVEL.update (updateBattle), LEVEL.cutscene, CHAPTER.enemyKinds,
// CHAPTER.hooks.

import { state } from '../../engine/state.js';
import { clearInput } from '../../engine/input.js';
import { ui, showMessage, tickMessage, updateHud } from '../../engine/ui.js';
import { aabb, inMud, setTerrain, buildTerrain, terrainHoles, terrainMud } from '../../engine/geometry.js';
import { setAnim, tickAnim, getAnimMeta, hitTime, animLength } from '../../engine/animation.js';
import { GROUND_Y, VIEW_W } from '../../engine/config.js';
import { CHAPTER, LEVEL } from '../../engine/chapter.js';
import { makeRidePlatform } from '../../engine/entities.js';
import { openStory } from '../../engine/dialogue.js';
import { playSfx, stopMusic } from '../../engine/audio.js';
import { hurtPlayer, playerImmune } from '../../engine/damage.js';
import { updateEnemies } from '../../engine/enemies.js';
import { updateCamera, shakeCamera } from '../../engine/level-flow.js';
import { endGame } from '../../engine/end-game.js';
import {
  ARENA, BOSS, SLAM, REINFORCE, HEAL_DROP, SPARK, CANOES, LEVEL3_TERRAIN, BOSS_TEXT, TQP_CUTSCENE, SKILL_TEST
} from './config.js';
import { STORY_TQP_FINISH, STORY_TQP_VICTORY } from './dialogue-data.js';
import { makeMercenary, makeArcher, makeCanoe } from './level3.js';
import { clawActive, stopSkills } from './skills.js';

const centerOf = body => body.x + body.w / 2;
const clampX = (entity, x, min = 0, max = LEVEL.worldWidth) => Math.max(min, Math.min(max - entity.w, x));

// Đoạn đất bờ phải ở GĐ 3 (sau mép nước) — x nhỏ nhất boss được đứng.
const FLOOD_EDGE = 592;
// Đoạn hoá nước ở GĐ 3 (người chơi đứng trong đó lúc đầm vỡ thì về bờ trái).
const FLOOD_SPAN = [176, 592];

function animSeconds(name) {
  const meta = getAnimMeta(BOSS.id, name);
  return meta ? animLength(meta) : 0;
}

function hitSeconds(name) {
  const meta = getAnimMeta(BOSS.id, name);
  return meta ? hitTime(meta) : 0;
}

function towardPlayer(entity, fallback = -1) {
  return Math.sign(centerOf(state.player) - centerOf(entity)) || fallback;
}

// Khoảng trống giữa mép entity và mép người chơi (0 nếu chồng nhau).
function edgeGap(entity) {
  const p = state.player;
  return Math.max(0, Math.max(p.x - (entity.x + entity.w), entity.x - (p.x + p.w)));
}

function showHint(text) {
  const battle = state.battle;
  if (battle.hintTimer > 0) return;
  battle.hintTimer = BOSS.hintInterval;
  showMessage(text, 2400);
}

// ---- Dương Sàn ----
// Hitbox: đứng 40×100; đang lún hạ còn stuckH (đỉnh = khe gáy). Chân giữ GROUND_Y.
function setStuckBox(boss, stuck) {
  boss.h = stuck ? BOSS.stuckH : BOSS.h;
  boss.y = GROUND_Y - boss.h;
}

function setMode(boss, mode) {
  boss.mode = mode;
  boss.modeTime = 0;
  boss.hit = false;
  setStuckBox(boss, mode === 'stuck');
  if (mode === 'stuck') playSfx('bossStuck');
}

// Ô đao (attack_01 ô hit 5): [near, reach] từ tâm theo hướng mặt × [low, high] trên chân.
function bladeBox(boss) {
  const blade = BOSS.blade;
  const center = centerOf(boss);
  const x0 = boss.facing > 0 ? center + blade.near : center - blade.reach;
  return { x: x0, y: GROUND_Y - blade.high, w: blade.reach - blade.near, h: blade.high - blade.low };
}

// Toạ độ thế giới của khe gáy ở ô hiện tại (stuck/hurt), lật theo hướng mặt.
export function napePoint(boss) {
  const table = boss.mode === 'stuck' ? BOSS.napeStuck : BOSS.napeHurt;
  const name = boss.mode === 'stuck' ? 'stuck' : 'hurt';
  const meta = getAnimMeta(BOSS.id, name);
  const frame = meta ? Math.min(table.length - 1, Math.floor(boss.anim.time * meta.fps) % meta.frames) : 0;
  const [dx, dy] = table[frame] || table[0];
  return { x: centerOf(boss) + dx * boss.facing, y: GROUND_Y + dy };
}

// Gọi viện ở ô hit của `command`: lính đánh thuê (+ cung thủ ở lượt 3) ra ở mép
// đấu trường xa người chơi; tối đa REINFORCE.max lính sống.
function callReinforcements() {
  const battle = state.battle;
  const wave = REINFORCE.waves[Math.min(battle.round, REINFORCE.waves.length - 1)];
  const farRight = centerOf(state.player) < ARENA.width / 2;
  const edge = farRight ? ARENA.width - REINFORCE.edgeX : REINFORCE.edgeX;
  const alive = state.enemies.filter(enemy => enemy.alive && enemy.art === 'mercenary').length;
  const count = Math.max(0, Math.min(wave.mercs, REINFORCE.max - alive));
  for (let i = 0; i < count; i++) state.enemies.push(makeMercenary(edge + (farRight ? -i * 28 : i * 28)));
  if (wave.archer && !battle.archer?.alive) {
    battle.archer = makeArcher(edge);
    state.hazards.push(battle.archer);
  }
  playSfx('bossCommand');
  if (count || wave.archer) showMessage(BOSS_TEXT.command, 1800);
}

// GĐ 1–2: đi / đánh / lao / lún / gọi viện.
function updateBattleBoss(boss, dt) {
  const battle = state.battle;
  const p = state.player;
  boss.attackCooldown = Math.max(0, boss.attackCooldown - dt);
  boss.chargeCooldown = Math.max(0, boss.chargeCooldown - dt);
  if (boss.mode === 'stuck') {
    if (!boss.test && boss.modeTime >= BOSS.stuckTime) setMode(boss, 'hurt');
    return;
  }
  if (boss.mode === 'hurt') {
    if (boss.modeTime >= animSeconds('hurt')) setMode(boss, 'idle');
    return;
  }
  if (boss.mode === 'attack') {
    if (!boss.hit && boss.modeTime >= hitSeconds('attack_01')) {
      boss.hit = true;
      playSfx('bladeSwing');
      if (!playerImmune(p) && aabb(p, bladeBox(boss))) hurtPlayer(BOSS_TEXT.bladeHit);
    }
    if (boss.modeTime >= animSeconds('attack_01')) {
      boss.attackCooldown = BOSS.attackCooldown;
      setMode(boss, 'idle');
    }
    return;
  }
  if (boss.mode === 'command') {
    if (!boss.hit && boss.modeTime >= hitSeconds('command')) {
      boss.hit = true;
      callReinforcements();
    }
    if (boss.modeTime >= animSeconds('command')) setMode(boss, 'idle');
    return;
  }
  if (boss.mode === 'rest') {
    if (boss.modeTime >= BOSS.wallRest) setMode(boss, 'idle');
    return;
  }
  if (boss.mode === 'charge') {
    boss.x += boss.chargeDir * BOSS.chargeSpeed * dt;
    const center = centerOf(boss);
    // Lao từ trong sình ra (vừa thoát lún) thì chỉ lún lại khi đã ra khỏi sình.
    if (!inMud(center)) boss.chargeClear = true;
    else if (boss.chargeClear) {
      setMode(boss, 'stuck');
      shakeCamera(.25, 2);
      showHint(BOSS_TEXT.napeHint);
      return;
    }
    const wall = boss.x <= 0 || boss.x + boss.w >= LEVEL.worldWidth;
    boss.x = clampX(boss, boss.x);
    if (wall) {
      boss.chargeCooldown = BOSS.chargeCooldown;
      shakeCamera(.2, 2);
      setMode(boss, 'rest');
    } else if (boss.chargeDir * (center - boss.chargeTarget) >= 0) {
      boss.chargeCooldown = BOSS.chargeCooldown;
      setMode(boss, 'idle');
    }
    return;
  }
  // idle / walk: chọn hành động kế.
  boss.facing = towardPlayer(boss, boss.facing);
  const gap = edgeGap(boss);
  if (gap <= BOSS.reach && boss.attackCooldown <= 0) {
    setMode(boss, 'attack');
  } else if (battle.reinforceTimer <= 0 && !battle.test) {
    battle.reinforceTimer = REINFORCE.interval;
    setMode(boss, 'command');
  } else if (gap > BOSS.chargeRange && boss.chargeCooldown <= 0) {
    boss.chargeDir = boss.facing;
    boss.chargeTarget = centerOf(p) + boss.chargeDir * BOSS.overshoot;
    boss.chargeClear = !inMud(centerOf(boss));
    playSfx('bossCharge');
    setMode(boss, 'charge');
  } else if (gap > 4) {
    boss.x = clampX(boss, boss.x + boss.facing * BOSS.speed * dt);
    boss.mode = 'walk';
  } else {
    boss.mode = 'idle';
  }
}

// GĐ 3: đứng bờ phải; người chơi lên bờ phải trong tầm thì chém; mỗi
// rageInterval giây cuồng nộ (sóng đất) rồi lội vào dải sình mép bờ lún, lún xong
// về chỗ đứng.
function updateFloodBoss(boss, dt) {
  const battle = state.battle;
  const p = state.player;
  boss.attackCooldown = Math.max(0, boss.attackCooldown - dt);
  if (boss.mode === 'rage') {
    if (!boss.hit && boss.modeTime >= hitSeconds('rage')) {
      boss.hit = true;
      releaseSlam(boss, true);
    }
    if (boss.modeTime >= animSeconds('rage')) {
      boss.target = BOSS.p3StuckX;
      setMode(boss, 'wade');
    }
    return;
  }
  if (boss.mode === 'wade' || boss.mode === 'home') {
    const direction = Math.sign(boss.target - centerOf(boss));
    boss.facing = boss.mode === 'wade' ? towardPlayer(boss, -1) : direction || boss.facing;
    boss.x += direction * BOSS.speed * 1.5 * dt;
    if (!direction || Math.abs(boss.target - centerOf(boss)) < 2) {
      boss.x = boss.target - boss.w / 2;
      if (boss.mode === 'wade') {
        boss.facing = -1;
        setMode(boss, 'stuck');
      } else {
        battle.rageTimer = BOSS.rageInterval;
        setMode(boss, 'idle');
      }
    }
    return;
  }
  if (boss.mode === 'stuck') {
    if (boss.modeTime >= BOSS.stuckTimeP3) setMode(boss, 'hurt');
    return;
  }
  if (boss.mode === 'hurt') {
    if (boss.modeTime >= animSeconds('hurt')) {
      boss.target = BOSS.p3HomeX;
      setMode(boss, 'home');
    }
    return;
  }
  if (boss.mode === 'attack') {
    if (!boss.hit && boss.modeTime >= hitSeconds('attack_01')) {
      boss.hit = true;
      playSfx('bladeSwing');
      if (!playerImmune(p) && aabb(p, bladeBox(boss))) hurtPlayer(BOSS_TEXT.bladeHit);
    }
    if (boss.modeTime >= animSeconds('attack_01')) {
      boss.attackCooldown = BOSS.attackCooldown;
      setMode(boss, 'idle');
    }
    return;
  }
  // idle ở chỗ đứng.
  boss.facing = towardPlayer(boss, -1);
  battle.rageTimer -= dt;
  if (edgeGap(boss) <= BOSS.reach && boss.attackCooldown <= 0) setMode(boss, 'attack');
  else if (battle.rageTimer <= 0) {
    boss.facing = -1;
    playSfx('bossRage');
    setMode(boss, 'rage');
  }
}

// Sóng đất ở ô hit của `rage`: FX tại mũi đao; `travel` (GĐ 3) = sóng chạy về
// phía mép nước; lúc đầm vỡ chỉ là FX tại chỗ.
function releaseSlam(boss, travel) {
  const x = centerOf(boss) + boss.facing * BOSS.rageTip.x;
  state.battle.slams.push({ x, time: 0, direction: boss.facing, travel, hit: false });
  playSfx('groundSlam');
  shakeCamera(.35, 3);
}

export const slamBox = slam => ({ x: slam.x - SLAM.w / 2, y: GROUND_Y - SLAM.h, w: SLAM.w, h: SLAM.h });

// Sóng chạy: trúng người chơi đứng ĐẤT (không phải thuyền/bục) −1 máu, 1 lần/sóng;
// tới mép nước thì tan. Sóng không chạy (lúc đầm vỡ) chỉ là FX, xong animation thì xoá.
function updateSlams(dt) {
  const battle = state.battle;
  const p = state.player;
  const length = (getAnimMeta(SLAM.id, SLAM.anim) && animLength(getAnimMeta(SLAM.id, SLAM.anim))) || .4;
  battle.slams.forEach(slam => {
    slam.time += dt;
    if (!slam.travel) return;
    slam.x += slam.direction * SLAM.speed * dt;
    if (!slam.hit && p.grounded && !p.platform && !playerImmune(p) && aabb(p, slamBox(slam))) {
      slam.hit = true;
      hurtPlayer(BOSS_TEXT.slamHit);
    }
  });
  battle.slams = battle.slams.filter(slam => (slam.travel
    ? slam.x > FLOOD_EDGE && slam.x < LEVEL.worldWidth
    : slam.time < length));
}

// ---- Đòn đánh lên Dương Sàn (CHAPTER.enemyKinds.duongSan.blockStrike) ----
// Bổ từ trên (người chơi đang `plunging`) khi boss đang lún = trúng gáy. Mọi đòn
// khác: giáp chặn (tóe lửa + gợi ý). Luôn trả true — sát thương do napeHit.
function blockBossStrike(boss) {
  if (!boss.alive) return true;
  const p = state.player;
  if (boss.mode === 'stuck' && p.plunging) {
    napeHit(boss);
    return true;
  }
  const sparkX = centerOf(boss) + towardPlayer(boss, boss.facing) * (boss.w / 2 - 4);
  state.battle.sparks.push({ x: sparkX, y: Math.min(p.y + 14, GROUND_Y - 8), time: 0 });
  playSfx('armorClank');
  if (['idle', 'walk', 'rest'].includes(boss.mode)) boss.blockedTime = animSeconds('blocked');
  showHint(boss.mode === 'stuck' ? BOSS_TEXT.napeHint : BOSS_TEXT.armorHint);
  return true;
}

function napeHit(boss) {
  const battle = state.battle;
  const claw = clawActive();
  const damage = claw ? BOSS.clawDamage : BOSS.plainDamage;
  const nape = napePoint(boss);
  battle.strikes.push({ x: nape.x, y: nape.y, time: 0, claw });
  boss.hitTimer = .18;
  playSfx(claw ? 'clawStrike' : 'hit');
  shakeCamera(.2, 2);
  state.score += 150 * damage;
  if (!claw) showHint(BOSS_TEXT.noClaw);
  if (boss.test) return;
  boss.hp = Math.max(0, boss.hp - damage);
  if (boss.hp <= 0) {
    defeatBoss(boss);
    return;
  }
  // Qua mốc máu của lượt -> thoát lún, lùi lại; mốc cuối -> GĐ 3.
  const threshold = BOSS.thresholds[battle.round];
  if (battle.phase < 3 && threshold !== undefined && boss.hp <= threshold) {
    battle.round += 1;
    boss.facing = towardPlayer(boss, boss.facing);
    setMode(boss, 'hurt');
    boss.x = clampX(boss, boss.x - boss.facing * BOSS.retreat);
    if (battle.round >= BOSS.thresholds.length) startPhase3(battle);
  }
}

// ---- GĐ 3: cuồng nộ, đầm vỡ ----
// Chuyển giai đoạn (người chơi bị giữ lại `p.stun`): boss `rage` tại chỗ; ô hit
// sóng đất + mỏm đất `crack`; hết animation thì đầm vỡ (đổi địa hình, thuyền).
function startPhase3(battle) {
  const boss = battle.boss;
  battle.phase = 3;
  battle.transition = { flooded: false };
  boss.facing = towardPlayer(boss, -1);
  setMode(boss, 'rage');
  state.player.stun = Math.max(state.player.stun || 0, animSeconds('rage') + .3);
  playSfx('bossRage');
  showMessage(BOSS_TEXT.phase3, 2600);
}

function updateTransition() {
  const battle = state.battle;
  const boss = battle.boss;
  const transition = battle.transition;
  if (!boss.hit && boss.modeTime >= hitSeconds('rage')) {
    boss.hit = true;
    releaseSlam(boss, false);
    // Mỏm đất vỡ (engine phát `death` = crack rồi xoá, bục trên lưng bỏ theo).
    state.hazards.forEach(hazard => {
      if (hazard.sprite !== 'dirtMound' || !hazard.alive) return;
      Object.assign(hazard, { alive: false, dying: true });
      setAnim(hazard, 'death');
    });
    playSfx('moundCrack');
  }
  if (boss.modeTime < animSeconds('rage')) return;
  if (!transition.flooded) flood(battle);
}

// Đầm vỡ: đoạn giữa hoá nước + dải sình bờ phải; 3 thuyền; lính trên đoạn nước
// ngã; lính còn lại giữ trên bờ mình; người chơi đứng giữa về bờ trái; boss về
// chỗ đứng bờ phải.
function flood(battle) {
  battle.transition.flooded = true;
  setTerrain(buildTerrain([{ chunk: 1, rows: LEVEL3_TERRAIN.flood }], 1));
  state.holes = terrainHoles();
  state.mud = terrainMud();
  CANOES.x.forEach(x => {
    const canoe = makeCanoe(x);
    state.hazards.push(canoe);
    const platform = makeRidePlatform(canoe);
    if (platform) state.platforms.push(platform);
  });
  state.enemies.forEach(enemy => {
    if (!enemy.alive || enemy.art !== 'mercenary') return;
    const center = centerOf(enemy);
    if (center > FLOOD_SPAN[0] && center < FLOOD_SPAN[1]) {
      Object.assign(enemy, { alive: false, dying: true, action: null });
      setAnim(enemy, 'death');
    } else if (center <= FLOOD_SPAN[0]) {
      enemy.patrolMax = FLOOD_SPAN[0] - enemy.w / 2 - 4;
    } else {
      enemy.patrolMin = FLOOD_SPAN[1] + enemy.w / 2 + 4;
    }
  });
  const p = state.player;
  const center = centerOf(p);
  if (center > FLOOD_SPAN[0] - 4 && center < FLOOD_SPAN[1] + 4) {
    Object.assign(p, { x: ARENA.playerStartX - p.w / 2, vy: 0, vx: 0, platform: null });
    p.y = GROUND_Y - p.h;
  }
  p.safeSpot = { x: ARENA.playerStartX - p.w / 2, feetY: GROUND_Y };
  const boss = battle.boss;
  boss.x = BOSS.p3HomeX - boss.w / 2;
  boss.facing = -1;
  battle.rageTimer = BOSS.rageInterval;
  battle.transition = null;
  setMode(boss, 'idle');
  playSfx('flood');
  shakeCamera(.5, 3);
  showMessage(BOSS_TEXT.canoeHint, 2600);
}

// ---- Cập nhật Dương Sàn (enemyKinds.duongSan.update) ----
function updateDuongSan(boss, dt) {
  boss.modeTime += dt;
  boss.blockedTime = Math.max(0, boss.blockedTime - dt);
  if (!boss.alive) {
    // Cutscene đặt `pose` (hurt -> death); xác nằm lại (dying giữ true).
    setAnim(boss, boss.pose || 'death');
    tickAnim(boss, dt);
    return;
  }
  const battle = state.battle;
  if (battle.transition) updateTransition();
  else if (battle.phase === 3) updateFloodBoss(boss, dt);
  else updateBattleBoss(boss, dt);
  let next = boss.mode === 'wade' || boss.mode === 'home' ? 'walk' : boss.mode;
  if (next === 'rest') next = 'idle';
  if ((next === 'idle' || next === 'walk') && boss.blockedTime > 0) next = 'blocked';
  const previous = boss.anim.name;
  setAnim(boss, next);
  if (previous !== next) boss.anim.time = 0;
  tickAnim(boss, dt);
  // Hành động một lần vẽ theo đồng hồ của mode để ô hit khớp lúc gây hiệu ứng.
  if (['attack', 'command', 'rage', 'hurt'].includes(next)) boss.anim.time = boss.modeTime;
}

// Dương Sàn hết máu: dừng quân, đạn, sóng, kỹ năng -> cutscene. Người chơi mất
// quyền điều khiển từ đây.
function defeatBoss(boss) {
  playSfx('bossDefeat');
  stopMusic();
  state.score += BOSS.defeatScore;
  Object.assign(boss, { alive: false, dying: true, hitTimer: 0, pose: 'hurt' });
  setStuckBox(boss, false);
  boss.anim.time = 0;
  const battle = state.battle;
  battle.slams = [];
  state.projectiles = [];
  state.enemies.forEach(enemy => {
    if (enemy === boss || !enemy.alive) return;
    Object.assign(enemy, { alive: false, dying: true, action: null });
    setAnim(enemy, 'death');
  });
  state.hazards.forEach(hazard => {
    if (hazard.kind !== 'thrower' || !hazard.alive) return;
    Object.assign(hazard, { alive: false, dying: true, action: null });
  });
  stopSkills();
  const p = state.player;
  Object.assign(p, {
    dashing: false, dashTimer: 0, attackCooldown: 0, attacking: false, plunging: false, hurtTimer: 0,
    invulnerable: 0, vx: 0, stun: 0
  });
  clearInput();
  state.cutscene = { step: 'beaten', time: 0, fade: 0 };
}

// Mỏm đất chặn ngang (người dùng chơi thử 05/11: bục một chiều đi xuyên được).
// Bục `ride` trên lưng mỏm lo việc đứng lên mặt; thân mỏm (dưới mặt quá
// MOUND_STEP px) đẩy người chơi ra mép gần nhất, không mất máu — như vật cản
// `blocking` của engine (vật cản tĩnh engine vẽ bằng ảnh map, mỏm là sprite).
const MOUND_STEP = 4;

function blockMounds() {
  const p = state.player;
  state.hazards.forEach(hazard => {
    const ride = CHAPTER.sprites.hazards[hazard.sprite]?.ride;
    if (hazard.sprite !== 'dirtMound' || !hazard.alive || !ride) return;
    const body = { x: hazard.x + ride.inset, y: hazard.y + ride.top, w: hazard.w - ride.inset * 2, h: hazard.h - ride.top };
    if (!aabb(p, body) || p.y + p.h <= body.y + MOUND_STEP) return;
    p.x = centerOf(p) < centerOf(body) ? body.x - p.w : body.x + body.w;
    p.vx = 0;
  });
}

// Tiến trình trận (LEVEL.update).
export function updateBattle(dt) {
  const battle = state.battle;
  if (!battle) return;
  blockMounds();
  battle.hintTimer = Math.max(0, battle.hintTimer - dt);
  battle.sparks.forEach(spark => { spark.time += dt; });
  battle.sparks = battle.sparks.filter(spark => spark.time < .3);
  battle.strikes.forEach(item => { item.time += dt; });
  battle.strikes = battle.strikes.filter(item => item.time < .4);
  updateSlams(dt);
  if (battle.archer && !battle.archer.alive) battle.archer = null;
  if (battle.phase < 3) battle.reinforceTimer -= dt;
  // Layout thử: lính đánh thuê ra lặp (tối đa 2), boss lún mãi.
  if (battle.test && battle.reinforceTimer <= 0) {
    battle.reinforceTimer = SKILL_TEST.respawnGap;
    if (state.enemies.filter(enemy => enemy.alive && enemy.art === 'mercenary').length < 2) {
      state.enemies.push(makeMercenary(ARENA.width - REINFORCE.edgeX));
    }
  }
}

// ---- Cutscene kết chương (TQP-00 §5.4–5.5, LEVEL.cutscene — thay update()) ----
//   beaten  -> boss `hurt` đứng beatenHold giây
//   death   -> `death` phát hết + deathHold giây -> cốt truyện câu 1
//   fadeOut -> tối dần; fadeIn -> sáng lại -> cốt truyện câu 2 -> panel kết chương.
// Panel cốt truyện đặt state.paused nên update() dừng tới khi đóng panel.
const CUT = TQP_CUTSCENE;

function cutsceneStep(step) {
  state.cutscene.step = step;
  state.cutscene.time = 0;
}

export function updateCutscene(dt) {
  const cut = state.cutscene;
  const p = state.player;
  const boss = state.battle.boss;
  cut.time += dt;
  tickMessage(dt);
  if (cut.step === 'beaten') {
    if (cut.time >= CUT.beatenHold) {
      boss.pose = 'death';
      boss.anim.time = 0;
      playSfx('bossFall');
      cutsceneStep('death');
    }
  } else if (cut.step === 'death') {
    if (cut.time >= animSeconds('death') + CUT.deathHold) {
      cutsceneStep('story1');
      openStory(STORY_TQP_FINISH, () => cutsceneStep('fadeOut'));
    }
  } else if (cut.step === 'fadeOut') {
    cut.fade = Math.min(1, cut.time / CUT.fadeTime);
    if (cut.fade >= 1) cutsceneStep('fadeIn');
  } else if (cut.step === 'fadeIn') {
    cut.fade = Math.max(0, 1 - cut.time / CUT.fadeTime);
    if (cut.fade <= 0) {
      cutsceneStep('story2');
      openStory(STORY_TQP_VICTORY, () => cutsceneStep('end'));
    }
  } else if (cut.step === 'end') {
    state.cutscene = null;
    endGame(true);
    return;
  }
  // Người chơi đứng yên (đang trên không thì rơi xuống đất/bục — engine không
  // chạy vật lý trong cutscene nên đặt thẳng chân xuống chỗ đứng).
  if (!p.grounded && !p.platform) {
    p.y = Math.min(p.y + 200 * dt, GROUND_Y - p.h);
  }
  setAnim(p, 'idle');
  tickAnim(p, dt);
  updateEnemies(dt);
  const max = LEVEL.worldWidth - VIEW_W;
  const target = Math.max(0, Math.min(max, centerOf(boss) - VIEW_W / 2));
  if (cut.step === 'beaten' || cut.step === 'death') state.cameraX += (target - state.cameraX) * Math.min(1, dt * 3);
  else updateCamera(dt);
  updateHud();
}

// Bình máu rơi (CHAPTER.hooks.dropHeal): lính đánh thuê, cung thủ ở màn 3. Boss
// không rơi.
export function dropHeal(target) {
  if (LEVEL.id !== 3 || target.boss) return false;
  return Math.random() < HEAL_DROP.chance;
}

// Enemy `kind` riêng của trận (CHAPTER.enemyKinds — engine gọi):
//   duongSan: giáp chặn mọi đòn trừ bổ gáy lúc lún; lao trúng −1 máu; Hiệu triệu
//             ngắt cú lao (`onRally` — skills.js gọi).
export const ENEMY_KINDS = {
  duongSan: {
    update: updateDuongSan,
    blockStrike: blockBossStrike,
    onContact(boss) {
      if (boss.mode === 'charge') hurtPlayer(BOSS_TEXT.chargeHit);
    },
    onRally(boss) {
      if (boss.mode !== 'charge') return;
      boss.chargeCooldown = BOSS.chargeCooldown;
      setMode(boss, 'rest');
    },
    debugLabel: (enemy, label) => `${label} ${enemy.mode} hp ${enemy.hp}`
  }
};

// Ô boss góc trên-phải (CHAPTER.hooks.updateHud): GĐ 1–2 "Dương Sàn — Lượt n/3"
// + 3 nấc (nấc mất = lượt đã bổ trúng); GĐ 3 "Dương Sàn — Cuồng nộ". Ẩn ở màn
// khác, layout thử và cutscene.
export function updateBossHud() {
  const battle = state.battle;
  ui.bossHud.hidden = !battle || battle.test || Boolean(state.cutscene);
  if (ui.bossHud.hidden) return;
  const total = BOSS.thresholds.length;
  if (battle.phase < 3) {
    ui.bossLabel.textContent = `Dương Sàn — Lượt ${Math.min(battle.round + 1, total)}/${total}`;
    ui.bossPips.forEach((pip, index) => {
      pip.hidden = index >= total;
      pip.classList.toggle('is-lost', index < battle.round);
    });
  } else {
    ui.bossLabel.textContent = 'Dương Sàn — Cuồng nộ';
    ui.bossPips.forEach(pip => { pip.hidden = true; });
  }
}

// Hộp F2 riêng của trận: sóng đất đang chạy.
export function battleDebugEntities() {
  const battle = state.battle;
  if (!battle) return [];
  return battle.slams.filter(slam => slam.travel).map(slamBox);
}
