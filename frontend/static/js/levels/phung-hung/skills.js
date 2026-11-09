// Phần thưởng màn 2 thành kỹ năng ở màn 3 (PH-L3 §3), gắn vào khe kỹ năng của engine
// (CHAPTER.skills). Engine lo phím K/L, ô HUD, nút cảm ứng, sở hữu; ở đây lo hồi chiêu
// và hiệu ứng:
//   Sức Địch Ngàn Người (bị động), Khóa Lương (K: lính và tên chậm, cung thủ bắn thưa),
//   Hỏa Trận Trống Đồng (L: lính choáng, GĐ 2 cộng thanh sợ).
// Làm chậm không sửa engine: đổi art của lính, sprite của đạn sang bản số chậm.

import { state } from '../../engine/state.js';
import { playSfx } from '../../engine/audio.js';
import { SKILLS, ARCHERS } from './config.js';

const POWER = SKILLS.BUFF_PH_POWER;
const SUPPLY = SKILLS.SK_PH_SUPPLY_CUT;
const FIRE = SKILLS.SK_PH_FIRE_DRUM;

const owns = id => Boolean(state.skills?.owned.has(id));
const centerOf = body => body.x + body.w / 2;

function createState() {
  return {
    supply: { left: 0, cooldown: 0, castTime: Infinity },
    fire: { cooldown: 0, castTime: Infinity, x: 0, footY: 0 }
  };
}

function tickCast(fx, dt) {
  if (fx.castTime !== Infinity) fx.castTime += dt;
}

// Art theo trạng thái: choáng hơn chậm.
function soldierArt(enemy, slowed) {
  if (enemy.panicLeft > 0) return 'arenaPanic';
  return slowed ? 'arenaSlow' : 'arena';
}

function applySlow(slowed) {
  state.projectiles.forEach(projectile => {
    if (projectile.sprite === 'crossbowBolt' && slowed) projectile.sprite = 'crossbowBoltSlow';
    else if (projectile.sprite === 'crossbowBoltSlow' && !slowed) projectile.sprite = 'crossbowBolt';
  });
  state.battle?.archers.forEach(archer => {
    archer.fireInterval = ARCHERS.interval * (slowed ? SUPPLY.fireFactor : 1);
  });
}

function updateSoldiers(dt, slowed) {
  state.enemies.forEach(enemy => {
    if (!enemy.soldier || !enemy.alive) return;
    if (enemy.panicLeft > 0) {
      enemy.panicLeft = Math.max(0, enemy.panicLeft - dt);
      if (enemy.panicLeft <= 0) enemy.passive = false;
    }
    enemy.art = soldierArt(enemy, slowed);
  });
}

function castFire() {
  const p = state.player;
  const center = centerOf(p);
  state.enemies.forEach(enemy => {
    if (!enemy.soldier || !enemy.alive || Math.abs(centerOf(enemy) - center) > FIRE.range) return;
    Object.assign(enemy, { panicLeft: FIRE.stun, passive: true, action: null });
  });
  Object.assign(state.skills.fire, { cooldown: FIRE.cooldown, castTime: 0, x: center, footY: p.y + p.h });
  if (state.battle?.phase === 2) state.battle.pendingFear += FIRE.fear;
  playSfx('fireDrum');
}

// Mỗi frame (engine gọi khi màn có khe kỹ năng). Không dùng được khi choáng/cutscene.
function update(dt, triggered) {
  const skills = state.skills;
  const { supply, fire } = skills;
  const ready = !(state.player.stun > 0) && !state.cutscene;
  const supplyWaiting = supply.cooldown > 0;
  const fireWaiting = fire.cooldown > 0;
  if (ready && triggered.has('SK_PH_SUPPLY_CUT') && supply.cooldown <= 0) {
    Object.assign(supply, { left: SUPPLY.duration, cooldown: SUPPLY.cooldown, castTime: 0 });
    playSfx('supplyCut');
  }
  if (ready && triggered.has('SK_PH_FIRE_DRUM') && fire.cooldown <= 0) castFire();
  supply.left = Math.max(0, supply.left - dt);
  supply.cooldown = Math.max(0, supply.cooldown - dt);
  fire.cooldown = Math.max(0, fire.cooldown - dt);
  tickCast(supply, dt);
  tickCast(fire, dt);
  const slowed = supply.left > 0;
  applySlow(slowed);
  updateSoldiers(dt, slowed);
  if (supplyWaiting && supply.cooldown <= 0 && owns('SK_PH_SUPPLY_CUT')) playSfx('skillReady');
  if (fireWaiting && fire.cooldown <= 0 && owns('SK_PH_FIRE_DRUM')) playSfx('skillReady');
}

// Tắt mọi kỹ năng đang chạy (cutscene kết chương).
export function stopSkills() {
  if (!state.skills) return;
  Object.assign(state.skills.supply, { left: 0, castTime: Infinity });
  state.skills.fire.castTime = Infinity;
}

const defs = {
  BUFF_PH_POWER: { slot: POWER.slot, portrait: POWER.icon, timer: () => ({ left: 0, total: 1, active: false }) },
  SK_PH_SUPPLY_CUT: {
    slot: SUPPLY.slot, portrait: SUPPLY.icon,
    timer: ({ supply }) => (supply.left > 0
      ? { left: supply.left, total: SUPPLY.duration, active: true }
      : { left: supply.cooldown, total: SUPPLY.cooldown, active: false })
  },
  SK_PH_FIRE_DRUM: {
    slot: FIRE.slot, portrait: FIRE.icon,
    timer: ({ fire }) => ({ left: fire.cooldown, total: FIRE.cooldown, active: false })
  }
};

// Sức Địch Ngàn Người: sát thương ×2 với lính. `crit` để engine gọi hooks.onCrit vẽ FX.
function attackDamage(target) {
  if (!state.skills.owned.has('BUFF_PH_POWER') || !target.soldier) return 1;
  return { damage: POWER.damage, crit: true };
}

export const PH_SKILLS = { defs, createState, update, attackDamage };
