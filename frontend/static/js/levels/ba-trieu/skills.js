// Phần thưởng màn 2 thành kỹ năng ở màn 3 (BT-L3 mục 3) — gắn vào khe kỹ năng
// của engine (CHAPTER.skills): engine lo phím K/L, ô HUD, nút cảm ứng, sở hữu
// (state.skills.owned); ở đây lo hồi chiêu + hiệu ứng.
//   Chí mạng (bị động), Khiên mây tre (skill1 — K), Gọi Bạch Tượng (skill2 — L).

import { state } from '../../engine/state.js';
import { aabb } from '../../engine/geometry.js';
import { setAnim, tickAnim, createAnim, getAnimMeta, animLength } from '../../engine/animation.js';
import { GROUND_Y, VIEW_W } from '../../engine/config.js';
import { CHAPTER } from '../../engine/chapter.js';
import { playSfx } from '../../engine/audio.js';
import { strike } from '../../engine/combat.js';
import { shakeCamera } from '../../engine/level-flow.js';
import { SKILLS } from './config.js';

const CRIT = SKILLS.BUFF_BT_CRIT;
const SHIELD = SKILLS.SK_BT_RATTAN_SHIELD;
const ELEPHANT = SKILLS.SK_BT_WHITE_ELEPHANT;

function owns(id) {
  return Boolean(state.skills?.owned.has(id));
}

// Trạng thái kỹ năng của lượt chơi (engine gộp thêm `owned`).
function createState() {
  return {
    // Khiên: active = giây còn giơ; anim raise -> hold, block khi vừa chặn.
    shield: { active: 0, cooldown: 0, anim: createAnim('raise') },
    // Voi: active = đang lao; x = tâm thân; direction; hits = mục tiêu đã húc lượt này.
    elephant: { active: false, cooldown: 0, x: 0, direction: 1, hits: new Set(), anim: createAnim('charge'), clock: 0 },
    // Hiệu ứng chí mạng đang hiện { x, y, time }.
    crits: []
  };
}

// ---- Chí mạng (bị động) ----
// Sát thương 1 đòn chém (engine combat.attackDamage): `chance` gây ×multiplier.
function attackDamage() {
  if (!owns('BUFF_BT_CRIT') || Math.random() >= CRIT.chance) return 1;
  return { damage: CRIT.multiplier, crit: true };
}

// Đòn chí mạng trúng `target` (CHAPTER.hooks.onCrit): FX tại tâm mục tiêu.
export function showCrit(target) {
  if (!state.skills) return;
  state.skills.crits.push({ x: target.x + target.w / 2, y: target.y + Math.min(18, target.h / 2), time: 0 });
}

// ---- Khiên mây tre (K) ----
// Đang giơ khiên thì chặn mọi sát thương + choáng (engine damage.js gọi
// skills.blockHurt); mỗi lần chặn phát `block`.
function blockHurt() {
  const shield = state.skills.shield;
  if (shield.active <= 0) return false;
  setAnim(shield, 'block');
  shield.anim.time = 0;
  playSfx('shieldBlock');
  return true;
}

function updateShield(dt) {
  const shield = state.skills.shield;
  if (shield.active <= 0) {
    shield.cooldown = Math.max(0, shield.cooldown - dt);
    return;
  }
  shield.active -= dt;
  tickAnim(shield, dt);
  const name = shield.anim.name;
  if (name !== 'hold') {
    const meta = getAnimMeta(SHIELD.fx, name);
    if (!meta || shield.anim.time >= animLength(meta)) setAnim(shield, 'hold');
  }
  if (shield.active <= 0) {
    shield.active = 0;
    shield.cooldown = SHIELD.cooldown;
  }
}

// ---- Gọi Bạch Tượng (L) ----
// Voi xuất hiện ngoài mép màn hình SAU lưng người chơi, lao theo hướng mặt qua
// hết khung nhìn. Húc mục tiêu chạm thân (mỗi mục tiêu 1 lần/lượt): enemy có
// `kind` riêng xử lý qua enemyKinds[kind].onElephant, còn lại mất `damage` máu.
export function elephantBox(elephant) {
  return { x: elephant.x - ELEPHANT.w / 2, y: GROUND_Y - ELEPHANT.h, w: ELEPHANT.w, h: ELEPHANT.h };
}

function callElephant() {
  const p = state.player;
  const elephant = state.skills.elephant;
  const direction = p.facing || 1;
  Object.assign(elephant, {
    active: true, direction, hits: new Set(), clock: 0,
    x: direction > 0 ? state.cameraX - ELEPHANT.w : state.cameraX + VIEW_W + ELEPHANT.w
  });
  setAnim(elephant, 'charge');
  playSfx('elephantCall');
}

function updateElephant(dt) {
  const elephant = state.skills.elephant;
  if (!elephant.active) {
    elephant.cooldown = Math.max(0, elephant.cooldown - dt);
    return;
  }
  elephant.x += elephant.direction * ELEPHANT.speed * dt;
  elephant.clock += dt;
  tickAnim(elephant, dt);
  // Rung màn hình theo nhịp chân voi.
  if (Math.floor(elephant.clock * 4) !== Math.floor((elephant.clock - dt) * 4)) {
    shakeCamera(ELEPHANT.shake.time, ELEPHANT.shake.amp);
  }
  const box = elephantBox(elephant);
  const targets = [
    ...state.enemies.filter(enemy => enemy.alive && enemy.hp > 0),
    ...state.hazards.filter(hazard => hazard.alive && hazard.hp > 0)
  ];
  targets.forEach(target => {
    if (elephant.hits.has(target) || !aabb(box, target)) return;
    elephant.hits.add(target);
    playSfx('elephantHit');
    const kind = CHAPTER.enemyKinds?.[target.kind];
    if (kind?.onElephant) kind.onElephant(target, elephant.direction, ELEPHANT.bossDamage);
    else strike(target, ELEPHANT.damage);
  });
  const offscreen = elephant.direction > 0
    ? elephant.x - ELEPHANT.w > state.cameraX + VIEW_W
    : elephant.x + ELEPHANT.w < state.cameraX;
  if (offscreen) {
    elephant.active = false;
    elephant.cooldown = ELEPHANT.cooldown;
  }
}

// Mỗi frame (engine gọi khi màn có khe kỹ năng). `triggered` = id kỹ năng đã
// sở hữu mà người chơi vừa bấm phím khe của nó. Không dùng được khi đang choáng.
function update(dt, triggered) {
  const skills = state.skills;
  const stunned = state.player.stun > 0;
  // Hết hồi chiêu K/L thì kêu 1 tiếng báo sẵn sàng.
  const shieldWaiting = skills.shield.cooldown > 0;
  const elephantWaiting = skills.elephant.cooldown > 0;
  if (!stunned && triggered.has('SK_BT_RATTAN_SHIELD') && skills.shield.active <= 0 && skills.shield.cooldown <= 0) {
    skills.shield.active = SHIELD.duration;
    setAnim(skills.shield, 'raise');
    skills.shield.anim.time = 0;
    playSfx('shieldRaise');
  }
  if (!stunned && triggered.has('SK_BT_WHITE_ELEPHANT') && !skills.elephant.active && skills.elephant.cooldown <= 0) callElephant();
  updateShield(dt);
  updateElephant(dt);
  if (shieldWaiting && skills.shield.cooldown <= 0 && owns('SK_BT_RATTAN_SHIELD')) playSfx('skillReady');
  if (elephantWaiting && skills.elephant.cooldown <= 0 && owns('SK_BT_WHITE_ELEPHANT')) playSfx('skillReady');
  const critLength = animLength(getAnimMeta(CRIT.fx, 'impact') || { frames: 5, fps: 20 });
  skills.crits.forEach(crit => { crit.time += dt; });
  skills.crits = skills.crits.filter(crit => crit.time < critLength);
}

// Giây hồi chiêu còn lại / tổng của một ô HUD. Khiên đang giơ thì hiện thời
// gian còn lại (ô sáng); voi đang lao thì ô sáng.
const defs = {
  BUFF_BT_CRIT: {
    slot: CRIT.slot, portrait: CRIT.icon,
    timer: () => ({ left: 0, total: 1, active: false })
  },
  SK_BT_RATTAN_SHIELD: {
    slot: SHIELD.slot, portrait: SHIELD.icon,
    timer: ({ shield }) => (shield.active > 0
      ? { left: shield.active, total: SHIELD.duration, active: true }
      : { left: shield.cooldown, total: SHIELD.cooldown, active: false })
  },
  SK_BT_WHITE_ELEPHANT: {
    slot: ELEPHANT.slot, portrait: ELEPHANT.icon,
    timer: ({ elephant }) => (elephant.active
      ? { left: 0, total: 1, active: true }
      : { left: elephant.cooldown, total: ELEPHANT.cooldown, active: false })
  }
};

// Khe kỹ năng của chương (CHAPTER.skills).
export const BT_SKILLS = {
  defs,
  createState,
  update,
  attackDamage,
  blockHurt
};

// Hộp F2 của voi đang lao.
export function skillDebugEntities() {
  const elephant = state.skills?.elephant;
  return elephant?.active ? [elephantBox(elephant)] : [];
}
