// Màn 3: trận Bạch Đằng (NQ-L3, docs/SUTA_NQ_TASK_L3_01.md §2, §4):
//   GĐ 1 — nước lớn: lái thuyền né đá máy bắn đá + tên lửa; nhặt lao trên bè, ném
//          vào lâu thuyền -> thanh Nhử địch đầy.
//   GĐ 2 — nước rút: lâu thuyền tiến vào bãi cọc, mắc lại; giáp vỡ sẵn = số cọc màn 2
//          (3–6); phá nốt giáp còn lại.
//   GĐ 3 — trên boong: Lưu Hoằng Tháo gạt đòn thường; lướt né đúng lúc -> khựng, chém ×2.
// Hết máu -> cutscene (NQ-00 §5.2) -> panel kết chương (§5.3). Gắn vào engine qua
// LEVEL.update (updateBattle), LEVEL.cutscene, CHAPTER.enemyKinds, CHAPTER.hooks.

import { state } from '../../engine/state.js';
import { clearInput } from '../../engine/input.js';
import { ui, showMessage, tickMessage, updateHud } from '../../engine/ui.js';
import { aabb } from '../../engine/geometry.js';
import { setAnim, tickAnim, getAnimMeta, hitTime, animLength, createAnim } from '../../engine/animation.js';
import { GROUND_Y } from '../../engine/config.js';
import { openStory } from '../../engine/dialogue.js';
import { playSfx, stopMusic } from '../../engine/audio.js';
import { hurtPlayer, playerImmune } from '../../engine/damage.js';
import { strike } from '../../engine/combat.js';
import { shakeCamera } from '../../engine/level-flow.js';
import { forceTide } from '../../engine/tide.js';
import { endGame } from '../../engine/end-game.js';
import { makeEnemy } from '../../engine/entities.js';
import { updateEnemies } from '../../engine/enemies.js';
import {
  ARENA, SHIP, CATAPULT, DECK_ARCHERS, RAFTS, BAIT, BOSS, MUD_SOLDIERS, SKILLS, NQ_CUTSCENE as CUT, BOSS_TEXT, SOLDIER
} from './config.js';
import { STORY_NQ_VICTORY } from './dialogue-data.js';
import { SHIP_BOTTOM_Y, DECK_Y, makeDeckArcher } from './level3.js';
import { stopSkills } from './skills.js';

const centerOf = body => body.x + body.w / 2;
const STAKE = SKILLS.SK_NQ_IRON_STAKE;

function animSeconds(id, name) {
  const meta = getAnimMeta(id, name);
  return meta ? animLength(meta) : 0;
}

function hitSeconds(id, name) {
  const meta = getAnimMeta(id, name);
  return meta ? hitTime(meta) : 0;
}

function showHint(text) {
  const battle = state.battle;
  if (battle.hintTimer > 0) return;
  battle.hintTimer = BOSS.hintInterval;
  showMessage(text, 2400);
}

// ---- FX chỉ vẽ (render-extras.js) ----
export function addFx(id, anim, x, footY) {
  state.battle.fxs.push({ id, anim, x, footY, time: 0, length: animSeconds(id, anim) || .5 });
}

function updateFxs(dt) {
  const battle = state.battle;
  battle.fxs.forEach(fx => { fx.time += dt; });
  battle.fxs = battle.fxs.filter(fx => fx.time < fx.length);
}

// ---- Lâu thuyền: mọi vật trên thuyền đi theo pivot `battle.shipX` ----
// Vùng chặn: chỉ ở GĐ 1 (thuyền nhỏ + người chơi không vào gầm lâu thuyền, không
// nhảy lên boong). Từ GĐ 2 người chơi đi trên bùn trước mạn thuyền (cảnh nhìn ngang)
// để chém giáp; mở boong thì thêm bục một chiều `battle.deck` ở mặt boong.
function placeHull() {
  const { hull, shipX } = state.battle;
  const top = DECK_Y - (SHIP.wallH - SHIP.deck - SHIP.bottom);
  Object.assign(hull, { x: shipX + SHIP.hullFrom, w: SHIP.hullTo - SHIP.hullFrom, y: top, h: SHIP_BOTTOM_Y - top });
}

// Mặt boong là bục gắn lâu thuyền (sprite `ship.ride`, engine tự dựng + không vẽ);
// bật `active` thì đứng được.
function openDeck() {
  const battle = state.battle;
  battle.ship.active = true;
  battle.deck = state.platforms.find(platform => platform.attached === battle.ship) || null;
}

// Nghiêng khi mắc cọc: mũi (bên trái) thấp hơn — điểm cách pivot dx lệch dọc dx × tilt.
function tiltAt(x) {
  const battle = state.battle;
  const stuck = battle.ship.pose.name === 'stuck' || battle.ship.pose.name === 'sink';
  return stuck ? (battle.shipX - x) * SHIP.tilt : 0;
}

function placeShip() {
  const battle = state.battle;
  const { ship, shipX, boss } = battle;
  ship.x = shipX - ship.w / 2;
  // Animation do trận quyết (`pose`); engine đặt `idle` cho hazard prop mỗi frame
  // trước LEVEL.update nên ghi đè ở đây (không dùng `action` — engine coi là đang ném).
  setAnim(ship, ship.pose.name);
  ship.anim.time = ship.pose.time;
  placeHull();
  battle.hull.alive = battle.phase === 1;
  battle.armor.forEach(plate => {
    const cx = shipX - plate.dx;
    plate.x = cx - plate.w / 2;
    plate.y = SHIP_BOTTOM_Y - SHIP.armorY - plate.h / 2 + tiltAt(cx);
  });
  battle.archers.forEach(archer => {
    if (!archer) return;
    archer.x = shipX + DECK_ARCHERS.dx[archer.slot] - archer.w / 2;
  });
  if (battle.phase < 3 && !battle.deckOpen && boss.alive) boss.x = shipX + BOSS.dx - boss.w / 2;
}

function setShipAction(name) {
  state.battle.ship.pose = { name, time: 0 };
}

function updateShip(dt) {
  const ship = state.battle.ship;
  ship.pose.time += dt;
  if (ship.pose.name === 'impale' && ship.pose.time >= animSeconds(SHIP.id, 'impale')) setShipAction('stuck');
}

// Thuyền nhỏ không chèo vào gầm lâu thuyền.
function clampBoat() {
  const { boat, hull } = state.battle;
  if (!boat?.alive) return;
  const limit = hull.x - boat.w - 4;
  if (boat.x > limit) {
    boat.x = limit;
    boat.vx = Math.min(0, boat.vx || 0);
  }
}

// ---- Máy bắn đá + đá (GĐ 1) ----
const catapultX = () => state.battle.shipX + CATAPULT.dx;

function startShot() {
  const battle = state.battle;
  const hullLeft = battle.hull.x;
  const targetX = Math.max(20, Math.min(hullLeft - 10, centerOf(state.player)));
  battle.catapult.shot = { time: 0, targetX, released: false };
  setAnim(battle.catapult, 'fire');
  battle.catapult.anim.time = 0;
}

function releaseBoulder(shot) {
  const x = catapultX() - CATAPULT.release.x;
  const y = DECK_Y - CATAPULT.release.y;
  const time = CATAPULT.flightTime;
  const landY = GROUND_Y - CATAPULT.radius;
  state.battle.boulders.push({
    x, y, targetX: shot.targetX,
    vx: (shot.targetX - x) / time,
    vy: (landY - y - .5 * CATAPULT.gravity * time * time) / time,
    broken: false, breakTime: 0, anim: createAnim('roll')
  });
  playSfx('catapultFire');
}

function updateCatapult(dt) {
  const battle = state.battle;
  const catapult = battle.catapult;
  const shot = catapult.shot;
  if (shot) {
    shot.time += dt;
    if (!shot.released && shot.time >= hitSeconds(CATAPULT.id, 'fire')) {
      shot.released = true;
      releaseBoulder(shot);
    }
    if (shot.time >= animSeconds(CATAPULT.id, 'fire')) {
      catapult.shot = null;
      setAnim(catapult, 'idle');
    } else {
      catapult.anim.time = shot.time;
    }
    return;
  }
  if (battle.phase !== 1 || battle.transition) return;
  catapult.timer -= dt;
  // Hoằng Tháo ra lệnh; máy bắn đá kéo ở ô hit của `command` (updateHoangThao).
  if (catapult.timer <= 0 && battle.boss.mode === 'idle') {
    catapult.timer = CATAPULT.interval;
    setMode(battle.boss, 'command');
    playSfx('bossCommand');
  }
}

export const boulderBox = boulder => ({
  x: boulder.x - CATAPULT.w / 2, y: boulder.y - CATAPULT.h / 2, w: CATAPULT.w, h: CATAPULT.h
});

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
    boulder.vy += CATAPULT.gravity * dt;
    boulder.x += boulder.vx * dt;
    boulder.y += boulder.vy * dt;
    const hit = !playerImmune(p) && aabb(p, boulderBox(boulder));
    if (hit) hurtPlayer(BOSS_TEXT.boulderHit);
    if (hit || boulder.y >= landY) {
      boulder.y = Math.min(boulder.y, landY);
      boulder.broken = true;
      setAnim(boulder, 'break');
      // Rơi xuống nước (bãi đang ngập) thì bắn nước.
      if (!hit && state.holes.some(hole => hole.water && boulder.x > hole.x && boulder.x < hole.x + hole.w)) {
        addFx('FX_NQ_SPLASH', 'burst', boulder.x, GROUND_Y + 8);
        playSfx('splash');
      } else {
        playSfx('boulderCrash');
      }
      shakeCamera(.2, 1);
    }
  });
  const breakLength = animSeconds(CATAPULT.boulder, 'break') || .4;
  battle.boulders = battle.boulders.filter(boulder => !boulder.broken || boulder.breakTime < breakLength);
}

// ---- Cung thủ: hạ rồi hồi sinh (GĐ 1–2) ----
function updateArchers(dt) {
  const battle = state.battle;
  battle.archers.forEach((archer, index) => {
    if (archer && (archer.alive || archer.dying)) return;
    if (battle.phase >= 3) return;
    battle.archerTimers[index] += dt;
    if (battle.archerTimers[index] < DECK_ARCHERS.respawn) return;
    battle.archerTimers[index] = 0;
    const next = makeDeckArcher(battle.shipX, index);
    battle.archers[index] = next;
    state.hazards.push(next);
  });
}

// CHAPTER.hooks.onHazardBroken: hạ cung thủ ở GĐ 1 cộng Nhử địch.
export function onHazardBroken(hazard) {
  const battle = state.battle;
  if (!battle || hazard.sprite !== 'deckArcher') return;
  if (battle.phase === 1) addBait(BAIT.archer);
}

// ---- Bè lao ----
function raftBox(raft) {
  return { x: raft.x - RAFTS.w / 2, y: GROUND_Y - 12, w: RAFTS.w, h: 22 };
}

function updateRafts(dt) {
  const battle = state.battle;
  const p = state.player;
  battle.rafts.forEach(raft => {
    tickAnim(raft, dt);
    if (battle.phase === 1 && !battle.transition) {
      raft.x += raft.dir * RAFTS.speed * dt;
      if (raft.x < RAFTS.from || raft.x > RAFTS.to) {
        raft.x = Math.max(RAFTS.from, Math.min(RAFTS.to, raft.x));
        raft.dir = -raft.dir;
      }
    }
    if (!raft.has) {
      raft.refill -= dt;
      if (raft.refill <= 0) raft.has = true;
      return;
    }
    if (p.carrying || state.won || !aabb(p, raftBox(raft))) return;
    raft.has = false;
    raft.refill = RAFTS.refill;
    p.carrying = 'javelin';
    playSfx('item');
    if (!battle.javelinHintShown) {
      battle.javelinHintShown = true;
      showMessage(BOSS_TEXT.javelin, 2600);
    }
  });
}

// ---- Thanh Nhử địch ----
function addBait(amount) {
  const battle = state.battle;
  if (battle.phase !== 1 || battle.transition) return;
  battle.bait = Math.min(BAIT.max, battle.bait + amount);
  if (battle.bait >= BAIT.max) startTransition();
}

// Lao trúng mạn thuyền (vùng thân giữa boong và mặt nước): carry.js không có mục
// tiêu nên tự bắt ở đây. GĐ 1 cộng Nhử địch, GĐ 2 làm nứt mảng giáp gần nhất.
function updateHullHits() {
  const battle = state.battle;
  const box = { x: battle.shipX + SHIP.hullFrom, y: DECK_Y, w: SHIP.hullTo - SHIP.hullFrom, h: SHIP_BOTTOM_Y - DECK_Y };
  state.thrown.forEach(item => {
    if (!item.alive) return;
    const itemBox = { x: item.x - item.w / 2, y: item.y - item.h / 2, w: item.w, h: item.h };
    if (!aabb(itemBox, box)) return;
    item.alive = false;
    playSfx('woodHit');
    addFx('FX_NQ_WOOD_SPLINTER', 'burst', item.x, item.y + 10);
    if (battle.phase === 1) addBait(BAIT.hull);
    else if (battle.phase === 2) {
      const plate = nearestPlate(item.x);
      if (plate) strike(plate, 1);
    }
  });
}

function nearestPlate(x) {
  const plates = state.battle.armor.filter(plate => plate.alive);
  return plates.sort((a, b) => Math.abs(centerOf(a) - x) - Math.abs(centerOf(b) - x))[0] || null;
}

// CHAPTER.hooks.onThrownHit: lao trúng mảng giáp — GĐ 1 tính như trúng mạn
// (Nhử địch), GĐ 2 là đòn thường. Màn khác: engine xử lý.
export function onThrownHit(thrown, target) {
  const battle = state.battle;
  if (!battle || target.kind !== 'shipArmor') return false;
  if (battle.phase === 1) {
    addFx('FX_NQ_WOOD_SPLINTER', 'burst', thrown.x, thrown.y + 10);
    addBait(BAIT.hull);
    return true;
  }
  return false;
}

// ---- GĐ 1 -> GĐ 2: lâu thuyền tiến vào bãi cọc ----
function startTransition() {
  const battle = state.battle;
  battle.transition = { time: 0, from: battle.shipX, impaled: false, broken: 0, brokenTimer: 0 };
  battle.boulders = [];
  state.projectiles = [];
  const p = state.player;
  p.invulnerable = Math.max(p.invulnerable, 3.5);
  showMessage(BOSS_TEXT.phase2, 3000);
}

function updateTransition(dt) {
  const battle = state.battle;
  const tr = battle.transition;
  tr.time += dt;
  const t = Math.min(1, tr.time / SHIP.advanceTime);
  battle.shipX = tr.from + (SHIP.stuckX - tr.from) * t;
  // Lâu thuyền lấn sang: đẩy thuyền nhỏ + người chơi ra trước mũi.
  const bow = battle.shipX + SHIP.hullFrom;
  const p = state.player;
  if (p.x + p.w > bow - 4) p.x = bow - 4 - p.w;
  if (t >= 1 && !tr.impaled) {
    tr.impaled = true;
    setShipAction('impale');
    shakeCamera(.6, 4);
    playSfx('woodBreak');
    addFx('FX_NQ_WOOD_SPLINTER', 'burst', bow + 10, SHIP_BOTTOM_Y - 20);
    forceTide('low');
  }
  if (tr.impaled) {
    battle.midAlt = Math.min(1, (tr.time - SHIP.advanceTime) / 2);
    state.midAlt = battle.midAlt;
    // Giáp vỡ sẵn lần lượt từ mũi (số cọc màn 2).
    tr.brokenTimer -= dt;
    if (tr.broken < battle.stakes && tr.brokenTimer <= 0) {
      tr.brokenTimer = .3;
      const plate = battle.armor.filter(item => item.alive).sort((a, b) => centerOf(a) - centerOf(b))[0];
      if (plate) breakPlate(plate);
      tr.broken += 1;
      if (tr.broken === battle.stakes) showMessage(BOSS_TEXT.armorBroken(battle.stakes), 2600);
    }
    if (battle.ship.pose.name === 'stuck' && tr.broken >= battle.stakes && battle.midAlt >= 1) startPhase2();
  }
}

function startPhase2() {
  const battle = state.battle;
  battle.transition = null;
  battle.phase = 2;
  battle.mudTimer = 2;
  // Bãi đã lộ: thuyền nhỏ mắc lại trên bùn — bỏ đi để người chơi đi bộ.
  if (battle.boat) {
    const p = state.player;
    if (p.platform?.attached === battle.boat) p.platform = null;
    battle.boat.alive = false;
    state.hazards = state.hazards.filter(hazard => hazard !== battle.boat);
    state.platforms = state.platforms.filter(platform => platform.attached !== battle.boat);
    battle.boat = null;
  }
}

// ---- Mảng giáp ----
function breakPlate(plate) {
  if (!plate.alive) return;
  Object.assign(plate, { alive: false, dying: true, hp: 0 });
  setAnim(plate, 'break');
  plate.anim.time = 0;
  addFx('FX_NQ_WOOD_SPLINTER', 'burst', centerOf(plate), plate.y + plate.h);
  playSfx('woodBreak');
  shakeCamera(.15, 2);
}

function updatePlate(plate, dt) {
  tickAnim(plate, dt);
}

function onPlateStruck(plate) {
  if (plate.hp <= 0) {
    plate.hp = 1;
    breakPlate(plate);
    state.score += 100;
    return;
  }
  setAnim(plate, 'crack');
  plate.anim.time = 0;
}

// GĐ 1 (nước lớn) không với tới; GĐ 3 đã hết.
function blockPlateStrike(plate) {
  return state.battle.phase !== 2 || !plate.alive;
}

// ---- Lính xuống bùn (GĐ 2) ----
function updateMudSoldiers(dt) {
  const battle = state.battle;
  if (battle.phase !== 2) return;
  battle.mudTimer -= dt;
  if (battle.mudTimer > 0) return;
  battle.mudTimer = MUD_SOLDIERS.interval;
  if (state.enemies.filter(enemy => enemy.alive && enemy.mud).length >= MUD_SOLDIERS.max) return;
  const x = battle.shipX + MUD_SOLDIERS.spawnDx;
  state.enemies.push({
    ...makeEnemy(x - SOLDIER.w / 2, SOLDIER.w, SOLDIER.h, SOLDIER.hp, false, { patrolMin: 20, patrolMax: ARENA.width - 20, aggroRange: ARENA.width }),
    art: 'mud', mud: true, facing: -1, noBar: true
  });
}

// CHAPTER.hooks.dropHeal: lính bùn đầu tiên bị hạ rơi 1 bình máu.
export function dropHeal(target) {
  const battle = state.battle;
  if (!battle || !target.mud || battle.healDropped) return false;
  battle.healDropped = true;
  return true;
}

// ---- Hết giáp -> mở boong -> GĐ 3 ----
function updatePhase2() {
  const battle = state.battle;
  if (battle.armor.some(plate => plate.alive)) return;
  if (!battle.deckOpen) {
    battle.deckOpen = true;
    openDeck();
    battle.archers.forEach(archer => { if (archer?.alive) Object.assign(archer, { alive: false, dying: true }); });
    setMode(battle.boss, 'walk');
    showMessage(BOSS_TEXT.boardDeck, 2600);
  }
  if (state.player.platform === battle.deck) startPhase3();
}

function startPhase3() {
  const battle = state.battle;
  battle.phase = 3;
  state.enemies.forEach(enemy => {
    if (!enemy.mud || !enemy.alive) return;
    Object.assign(enemy, { alive: false, dying: true, action: null });
    setAnim(enemy, 'death');
  });
  setMode(battle.boss, 'idle');
  battle.boss.waitTime = .6;
}

// ---- Lưu Hoằng Tháo ----
function setMode(boss, mode) {
  boss.mode = mode;
  boss.modeTime = 0;
  boss.hit = false;
  boss.dodged = false;
  boss.fired = false;
}

const swingName = boss => (boss.swing % 2 === 0 ? 'attack_01' : 'attack_02');
const deckSpan = () => ({ from: state.battle.shipX + SHIP.deckFrom, to: state.battle.shipX + SHIP.deckTo });

function bladeBox(boss, name) {
  const blade = BOSS.blades[name];
  const center = centerOf(boss);
  const x0 = boss.facing > 0 ? center + blade.near : center - blade.reach;
  return { x: x0, y: DECK_Y - blade.high, w: blade.reach - blade.near, h: blade.high - blade.low };
}

const towardPlayer = boss => Math.sign(centerOf(state.player) - centerOf(boss)) || boss.facing || -1;

const playerOnDeck = () => Boolean(state.battle.deck) && state.player.platform === state.battle.deck;


// Kiếm cắm ván sau đòn bổ (ô 7–9 của attack_02): chém được.
function planted(boss) {
  return boss.mode === 'swing' && swingName(boss) === 'attack_02' && boss.hit
    && boss.modeTime >= BOSS.plantFrom * animSeconds(BOSS.id, 'attack_02');
}

function stagger(boss) {
  setMode(boss, 'stagger');
  boss.counterHits = 0;
  playSfx('counter');
  showMessage(BOSS_TEXT.counter, 1600);
}

function updateBossFight(boss, dt) {
  const p = state.player;
  if (boss.waitTime > 0) {
    boss.waitTime -= dt;
    return;
  }
  if (boss.mode === 'stagger') {
    if (boss.modeTime >= BOSS.staggerTime) {
      boss.waitTime = BOSS.rest * .5;
      setMode(boss, 'idle');
    }
    return;
  }
  if (boss.mode === 'swing') {
    const name = swingName(boss);
    const strikeAt = hitSeconds(BOSS.id, name);
    // Lướt trong cửa sổ ngay trước ô hit, đủ gần -> né đúng lúc.
    if (!boss.hit && p.dashing && boss.modeTime >= strikeAt - BOSS.dodgeWindow
      && Math.abs(centerOf(p) - centerOf(boss)) <= BOSS.reach + 24) boss.dodged = true;
    if (!boss.hit && boss.modeTime >= strikeAt) {
      boss.hit = true;
      playSfx('bladeSwing');
      if (boss.dodged) {
        stagger(boss);
        return;
      }
      if (!playerImmune(p) && aabb(p, bladeBox(boss, name))) hurtPlayer(BOSS_TEXT.bladeHit);
    }
    if (boss.modeTime >= animSeconds(BOSS.id, name)) {
      boss.swing += 1;
      boss.waitTime = BOSS.rest;
      setMode(boss, 'idle');
    }
    return;
  }
  boss.facing = towardPlayer(boss);
  const span = deckSpan();
  const gap = Math.abs(centerOf(p) - centerOf(boss));
  if (playerOnDeck() && gap <= BOSS.reach) {
    setMode(boss, 'swing');
    return;
  }
  // Đi về phía người chơi trong dải boong (người chơi dưới bùn thì chờ ở mép boong).
  const target = Math.max(span.from + boss.w / 2, Math.min(span.to - boss.w / 2, centerOf(p)));
  const step = Math.sign(target - centerOf(boss)) * BOSS.speed * dt;
  if (Math.abs(target - centerOf(boss)) > 2) {
    boss.x += step;
    boss.mode = 'walk';
  } else boss.mode = 'idle';
}

function updateHoangThao(boss, dt) {
  boss.modeTime += dt;
  boss.hurtTime = Math.max(0, boss.hurtTime - dt);
  boss.y = DECK_Y - boss.h + tiltAt(centerOf(boss));
  if (!boss.alive) {
    setAnim(boss, 'death');
    tickAnim(boss, dt);
    return;
  }
  const battle = state.battle;
  if (battle.phase < 3) {
    boss.facing = -1;
    if (boss.mode === 'command') {
      if (!boss.fired && boss.modeTime >= hitSeconds(BOSS.id, 'command')) {
        boss.fired = true;
        startShot();
      }
      if (boss.modeTime >= animSeconds(BOSS.id, 'command')) setMode(boss, 'idle');
    } else if (boss.mode === 'walk' && battle.deckOpen) {
      // Bước ra mũi thuyền chờ người chơi.
      const target = battle.shipX + SHIP.deckFrom + 40;
      if (centerOf(boss) > target) boss.x -= BOSS.speed * dt;
      else boss.mode = 'idle';
    }
  } else {
    updateBossFight(boss, dt);
  }
  let next = boss.mode === 'swing' ? swingName(boss) : boss.mode;
  if (boss.hurtTime > 0 && (next === 'idle' || next === 'walk')) next = 'hurt';
  const previous = boss.anim.name;
  setAnim(boss, next);
  if (previous !== next) boss.anim.time = 0;
  tickAnim(boss, dt);
  if (['attack_01', 'attack_02', 'command', 'stagger'].includes(next)) boss.anim.time = boss.modeTime;
}

// Chém boss: chỉ mất máu khi khựng (`stagger`) hoặc kiếm cắm ván; còn lại tóe lửa + nhắc.
function blockBossStrike(boss) {
  const battle = state.battle;
  if (!boss.alive) return true;
  if (battle.phase === 3 && (boss.mode === 'stagger' || planted(boss))) return false;
  if (battle.phase === 3) {
    const p = state.player;
    addFx('FX_BT_ARMOR_SPARK', 'impact', centerOf(boss) + towardPlayer(boss) * boss.w / 2, Math.min(p.y + 22, DECK_Y - 8));
    playSfx('armorClank');
    showHint(BOSS_TEXT.bossGuard);
  }
  return true;
}

function onBossStruck(boss, damage) {
  // Phản đòn: đòn trong lúc khựng mất thêm (×counter).
  if (boss.mode === 'stagger') {
    boss.hp -= damage * (BOSS.counter - 1);
    boss.counterHits += 1;
    // Đủ số đòn phản: hoàn hồn ngay, nghỉ chút rồi đánh tiếp.
    if (boss.counterHits >= BOSS.counterHits && boss.hp > 0) {
      boss.waitTime = BOSS.rest * .5;
      setMode(boss, 'idle');
    }
  }
  boss.hurtTime = animSeconds(BOSS.id, 'hurt');
  shakeCamera(.12, 2);
  if (boss.hp <= 0) defeatBoss(boss);
}

// Kỹ năng K (skills.js đặt battle.stakeTarget): giáp vỡ ngay, boss khựng.
function applyStakeTarget() {
  const battle = state.battle;
  const target = battle.stakeTarget;
  if (!target) return;
  battle.stakeTarget = null;
  if (target.kind === 'shipArmor') breakPlate(target);
  else if (target.kind === 'hoangThao' && target.alive && battle.phase === 3 && target.mode !== 'swing') stagger(target);
  else if (target.kind === 'hoangThao' && target.alive && battle.phase === 3) {
    target.dodged = true;
  } else if (target.alive) {
    strike(target, STAKE.damage);
    target.action = null;
  }
}

// ---- Tiến trình trận (LEVEL.update) ----
export function updateBattle(dt) {
  const battle = state.battle;
  if (!battle || state.cutscene) return;
  if (!battle.started) {
    battle.started = true;
    if (battle.test) {
      forceTide('low');
      setShipAction('stuck');
      state.midAlt = 1;
      battle.preBroken = 0;
      battle.armor.filter((plate, index) => index < battle.stakes).forEach(plate => {
        Object.assign(plate, { alive: false, dying: false, hp: 0 });
      });
      startPhase2();
    } else {
      forceTide('high');
      showMessage(BOSS_TEXT.phase1, 3200);
    }
  }
  battle.hintTimer = Math.max(0, battle.hintTimer - dt);
  if (battle.pendingBait > 0) {
    const amount = battle.pendingBait;
    battle.pendingBait = 0;
    addBait(amount);
  }
  applyStakeTarget();
  updateFxs(dt);
  updateShip(dt);
  if (battle.transition) updateTransition(dt);
  placeShip();
  clampBoat();
  updateCatapult(dt);
  updateBoulders(dt);
  updateArchers(dt);
  updateRafts(dt);
  updateHullHits();
  updateMudSoldiers(dt);
  if (battle.phase === 2) updatePhase2();
}

// ---- Enemy `kind` riêng của trận (CHAPTER.enemyKinds) ----
export const ENEMY_KINDS = {
  hoangThao: {
    update: updateHoangThao,
    blockStrike: blockBossStrike,
    onStruck: onBossStruck,
    onContact() {},
    debugLabel: (enemy, label) => `${label} ${enemy.mode} hp ${enemy.hp}`
  },
  shipArmor: {
    update: updatePlate,
    blockStrike: blockPlateStrike,
    onStruck: onPlateStruck,
    onContact() {},
    debugLabel: (enemy, label) => `${label} hp ${enemy.hp}`
  }
};

// Ô boss góc trên-phải (CHAPTER.hooks.updateHud). Ẩn ở màn khác và trong cutscene.
export function updateBossHud() {
  const battle = state.battle;
  ui.bossHud.hidden = !battle || Boolean(state.cutscene);
  if (ui.bossHud.hidden) return;
  ui.bossPips.forEach(pip => { pip.hidden = true; });
  if (battle.phase === 1) ui.bossLabel.textContent = `Nhử địch ${Math.round(battle.bait)}/${BAIT.max}`;
  else if (battle.phase === 2) ui.bossLabel.textContent = `Giáp lâu thuyền ${battle.armor.filter(plate => plate.alive).length}/${SHIP.armor.length}`;
  else ui.bossLabel.textContent = `Lưu Hoằng Tháo ${Math.max(0, Math.ceil(battle.boss.hp))}/${BOSS.hp}`;
}

// ---- Hết máu -> cutscene (NQ-00 §5.2) -> panel kết chương (§5.3) ----
function defeatBoss(boss) {
  const battle = state.battle;
  playSfx('bossDefeat');
  stopMusic();
  state.score += BOSS.defeatScore;
  Object.assign(boss, { alive: false, dying: true, hitTimer: 0, noBar: true });
  setAnim(boss, 'death');
  boss.anim.time = 0;
  battle.boulders = [];
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
  shakeCamera(.6, 3);
  state.cutscene = { step: 'fall', time: 0, fade: 0, splashed: false };
}

function cutsceneStep(step) {
  state.cutscene.step = step;
  state.cutscene.time = 0;
}

export function updateCutscene(dt) {
  const cut = state.cutscene;
  const battle = state.battle;
  const p = state.player;
  cut.time += dt;
  tickMessage(dt);
  battle.ship.pose.time += dt;
  setAnim(battle.ship, battle.ship.pose.name);
  battle.ship.anim.time = battle.ship.pose.time;
  updateEnemies(dt);
  updateFxs(dt);
  if (cut.step === 'fall') {
    const length = animSeconds(BOSS.id, 'death');
    if (!cut.splashed && cut.time >= length * .75) {
      cut.splashed = true;
      addFx('FX_NQ_SPLASH', 'burst', centerOf(battle.boss), GROUND_Y + 4);
      playSfx('splash');
    }
    if (cut.time >= length + CUT.fallHold) {
      setShipAction('sink');
      // Thuyền chìm: bỏ mặt boong, người chơi rơi xuống bùn (cutscene không chạy vật lý).
      battle.ship.active = false;
      p.platform = null;
      p.grounded = false;
      cutsceneStep('sink');
    }
  } else if (cut.step === 'sink') {
    if (cut.time >= animSeconds(SHIP.id, 'sink') + CUT.sinkHold) {
      cutsceneStep('story');
      openStory(STORY_NQ_VICTORY, () => cutsceneStep('end'));
    }
  } else if (cut.step === 'end') {
    state.cutscene = null;
    endGame(true);
    return;
  }
  if (!p.grounded && !p.platform) {
    p.y = Math.min(p.y + 200 * dt, GROUND_Y - p.h);
    if (p.y >= GROUND_Y - p.h) p.grounded = true;
  }
  setAnim(p, p.grounded ? 'victory' : 'idle');
  tickAnim(p, dt);
  updateHud();
}
