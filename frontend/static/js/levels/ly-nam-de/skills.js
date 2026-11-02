// Phần thưởng màn 2 thành kỹ năng ở màn 3 (LND-L3 mục 3) — gắn vào khe kỹ năng
// của engine (CHAPTER.skills): engine lo phím K/L, ô HUD, nút cảm ứng, sở hữu
// (state.skills.owned); ở đây lo hồi chiêu + hiệu ứng.
//   Khiên Tô Lịch (skill1 — K), Lương thảo dồi dào (bị động — boss.js dropHeal),
//   Triều Cường (skill2 — L).

import { state } from '../../engine/state.js';
import { aabb } from '../../engine/geometry.js';
import { setAnim, tickAnim, createAnim, getAnimMeta, animLength } from '../../engine/animation.js';
import { GROUND_Y, VIEW_W } from '../../engine/config.js';
import { CHAPTER } from '../../engine/chapter.js';
import { playSfx } from '../../engine/audio.js';
import { strike } from '../../engine/combat.js';
import { SKILLS } from './config.js';

const SHIELD = SKILLS.SK_LND_TO_LICH_SHIELD;
const SUPPLY = SKILLS.BUFF_LND_SUPPLY;
const TIDE = SKILLS.SK_LND_TIDE;

function owns(id) {
  return Boolean(state.skills?.owned.has(id));
}

function animSeconds(id, name) {
  const meta = getAnimMeta(id, name);
  return meta ? animLength(meta) : 0;
}

// Trạng thái kỹ năng của lượt chơi (engine gộp thêm `owned`).
function createState() {
  return {
    // Khiên: active = giây còn dựng; blocksLeft = đòn còn chặn được; anim
    // raise -> hold, block khi vừa chặn; breaking = đang phát `break` (vỡ).
    shield: { active: 0, blocksLeft: 0, cooldown: 0, breaking: false, anim: createAnim('raise') },
    // Sóng: active = đang quét; x = tâm sóng; direction; hits = mục tiêu đã trúng
    // lượt này; fading = đang phát `fade` sau khi ra khỏi khung nhìn.
    tide: { active: false, fading: false, cooldown: 0, x: 0, direction: 1, hits: new Set(), anim: createAnim('surge') }
  };
}

// ---- Khiên Tô Lịch (K) ----
// Đang dựng khiên thì chặn mọi sát thương + choáng (engine damage.js gọi
// skills.blockHurt); mỗi lần chặn phát `block`, chặn đủ `blocks` đòn thì vỡ.
function blockHurt() {
  const shield = state.skills.shield;
  if (shield.active <= 0 || shield.breaking) return false;
  shield.blocksLeft -= 1;
  playSfx('shieldBlock');
  if (shield.blocksLeft <= 0) breakShield(shield);
  else {
    setAnim(shield, 'block');
    shield.anim.time = 0;
  }
  return true;
}

function breakShield(shield) {
  shield.breaking = true;
  setAnim(shield, 'break');
  shield.anim.time = 0;
  playSfx('shieldBreak');
}

function updateShield(dt) {
  const shield = state.skills.shield;
  if (shield.active <= 0) {
    shield.cooldown = Math.max(0, shield.cooldown - dt);
    return;
  }
  tickAnim(shield, dt);
  if (shield.breaking) {
    if (shield.anim.time >= animSeconds(SHIELD.fx, 'break')) {
      Object.assign(shield, { active: 0, breaking: false, cooldown: SHIELD.cooldown });
    }
    return;
  }
  shield.active -= dt;
  const name = shield.anim.name;
  if (name !== 'hold' && shield.anim.time >= animSeconds(SHIELD.fx, name)) setAnim(shield, 'hold');
  if (shield.active <= 0) {
    // Hết giờ: vỡ như khi chặn đủ đòn (vẫn đang `active` tới khi phát xong break).
    shield.active = .01;
    breakShield(shield);
  }
}

// ---- Triều Cường (L) ----
// Sóng xuất hiện ngoài mép khung nhìn SAU lưng người chơi, quét theo hướng mặt
// qua hết khung nhìn. Mỗi mục tiêu trúng 1 lần/lượt: enemy có `kind` riêng xử
// lý qua enemyKinds[kind].onTide, còn lại mất `damage` máu.
export function tideBox(tide) {
  return { x: tide.x - TIDE.w / 2, y: GROUND_Y - TIDE.h, w: TIDE.w, h: TIDE.h };
}

function callTide() {
  const p = state.player;
  const tide = state.skills.tide;
  const direction = p.facing || 1;
  Object.assign(tide, {
    active: true, fading: false, direction, hits: new Set(),
    x: direction > 0 ? state.cameraX - TIDE.w / 2 : state.cameraX + VIEW_W + TIDE.w / 2
  });
  setAnim(tide, 'surge');
  playSfx('tideCall');
}

function updateTide(dt) {
  const tide = state.skills.tide;
  if (!tide.active) {
    tide.cooldown = Math.max(0, tide.cooldown - dt);
    return;
  }
  tickAnim(tide, dt);
  if (tide.fading) {
    if (tide.anim.time >= animSeconds(TIDE.fx, 'fade')) {
      tide.active = false;
      tide.cooldown = TIDE.cooldown;
    }
    return;
  }
  tide.x += tide.direction * TIDE.speed * dt;
  const box = tideBox(tide);
  state.enemies.filter(enemy => enemy.alive && enemy.hp > 0).forEach(target => {
    if (tide.hits.has(target) || !aabb(box, target)) return;
    tide.hits.add(target);
    playSfx('tideHit');
    const kind = CHAPTER.enemyKinds?.[target.kind];
    if (kind?.onTide) kind.onTide(target, tide.direction, target.boss ? TIDE.bossDamage : 1);
    else strike(target, TIDE.damage);
  });
  // Mép trước của sóng ra khỏi khung nhìn -> sụp xuống (`fade`) tại chỗ.
  const front = tide.x + tide.direction * TIDE.w / 2;
  const offscreen = tide.direction > 0 ? front > state.cameraX + VIEW_W : front < state.cameraX;
  if (offscreen) {
    tide.fading = true;
    setAnim(tide, 'fade');
  }
}

// Mỗi frame (engine gọi khi màn có khe kỹ năng). `triggered` = id kỹ năng đã
// sở hữu mà người chơi vừa bấm phím khe của nó. Không dùng được khi đang choáng.
function update(dt, triggered) {
  const skills = state.skills;
  const stunned = state.player.stun > 0;
  // Hết hồi chiêu K/L thì kêu 1 tiếng báo sẵn sàng.
  const shieldWaiting = skills.shield.cooldown > 0;
  const tideWaiting = skills.tide.cooldown > 0;
  if (!stunned && triggered.has('SK_LND_TO_LICH_SHIELD') && skills.shield.active <= 0 && skills.shield.cooldown <= 0) {
    Object.assign(skills.shield, { active: SHIELD.duration, blocksLeft: SHIELD.blocks, breaking: false });
    setAnim(skills.shield, 'raise');
    skills.shield.anim.time = 0;
    playSfx('shieldRaise');
  }
  if (!stunned && triggered.has('SK_LND_TIDE') && !skills.tide.active && skills.tide.cooldown <= 0) callTide();
  updateShield(dt);
  updateTide(dt);
  if (shieldWaiting && skills.shield.cooldown <= 0 && owns('SK_LND_TO_LICH_SHIELD')) playSfx('skillReady');
  if (tideWaiting && skills.tide.cooldown <= 0 && owns('SK_LND_TIDE')) playSfx('skillReady');
}

// Giây hồi chiêu còn lại / tổng của một ô HUD. Khiên đang dựng thì hiện thời
// gian còn lại (ô sáng); sóng đang quét thì ô sáng.
const defs = {
  SK_LND_TO_LICH_SHIELD: {
    slot: SHIELD.slot, portrait: SHIELD.icon,
    timer: ({ shield }) => (shield.active > 0
      ? { left: shield.active, total: SHIELD.duration, active: true }
      : { left: shield.cooldown, total: SHIELD.cooldown, active: false })
  },
  BUFF_LND_SUPPLY: {
    slot: SUPPLY.slot, portrait: SUPPLY.icon,
    timer: () => ({ left: 0, total: 1, active: false })
  },
  SK_LND_TIDE: {
    slot: TIDE.slot, portrait: TIDE.icon,
    timer: ({ tide }) => (tide.active
      ? { left: 0, total: 1, active: true }
      : { left: tide.cooldown, total: TIDE.cooldown, active: false })
  }
};

// Khe kỹ năng của chương (CHAPTER.skills).
export const LND_SKILLS = {
  defs,
  createState,
  update,
  blockHurt
};

// Hộp F2 của sóng đang quét.
export function skillDebugEntities() {
  const tide = state.skills?.tide;
  return tide?.active && !tide.fading ? [tideBox(tide)] : [];
}
