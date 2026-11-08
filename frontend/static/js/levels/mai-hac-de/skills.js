// Phần thưởng màn 2 thành kỹ năng ở màn 3 (MHD-L3 §3) — gắn vào khe kỹ năng của
// engine (CHAPTER.skills): engine lo phím K/L, ô HUD, nút cảm ứng, sở hữu
// (state.skills.owned); ở đây lo hồi chiêu + hiệu ứng.
//   Ý chí dân nghèo (bị động, attackDamage 1,2), Vỏ Bọc Vạn An (skill1 — K, chặn
//   1 đòn), Viện Binh (skill2 — L, toán dân quân quét ngang, chặn xe).

import { state } from '../../engine/state.js';
import { aabb } from '../../engine/geometry.js';
import { setAnim, tickAnim, createAnim, getAnimMeta, animLength } from '../../engine/animation.js';
import { CHAPTER, LEVEL } from '../../engine/chapter.js';
import { playSfx } from '../../engine/audio.js';
import { strike } from '../../engine/combat.js';
import { GROUND_Y } from '../../engine/config.js';
import { SKILLS } from './config.js';

const POWER = SKILLS.BUFF_MHD_POWER;
const SHELL = SKILLS.SK_MHD_VAN_AN_SHELL;
const REINFORCE = SKILLS.SK_MHD_REINFORCE;

const owns = id => Boolean(state.skills?.owned.has(id));

function animSeconds(id, name) {
  const meta = getAnimMeta(id, name);
  return meta ? animLength(meta) : 0;
}

// Trạng thái kỹ năng của lượt chơi (engine gộp thêm `owned`).
function createState() {
  return {
    // Vỏ bọc: left = giây còn hiệu lực; breaking = đang phát `break` sau khi đỡ đòn.
    shell: { left: 0, cooldown: 0, breaking: false, anim: createAnim('on') },
    // Viện Binh: sweeps = các toán đang chạy { x (tâm), dir, hit, brace, time }.
    reinforce: { cooldown: 0, sweeps: [] }
  };
}

// ---- Vỏ Bọc Vạn An (K) ----
function updateShell(dt) {
  const shell = state.skills.shell;
  shell.cooldown = Math.max(0, shell.cooldown - dt);
  if (shell.breaking) {
    tickAnim(shell, dt);
    if (shell.anim.time >= animSeconds(SHELL.fx, 'break')) shell.breaking = false;
    return;
  }
  if (shell.left <= 0) return;
  shell.left = Math.max(0, shell.left - dt);
  tickAnim(shell, dt);
  if (shell.anim.name === 'on' && shell.anim.time >= animSeconds(SHELL.fx, 'on')) setAnim(shell, 'hold');
}

// Đang bật thì đỡ trọn đòn này, vỏ vỡ (engine damage.js gọi trước khi trừ máu).
function blockHurt() {
  const shell = state.skills.shell;
  if (shell.left <= 0) return false;
  shell.left = 0;
  shell.breaking = true;
  setAnim(shell, 'break');
  shell.anim.time = 0;
  state.player.invulnerable = Math.max(state.player.invulnerable, SHELL.grace);
  playSfx('shellBreak');
  return true;
}

// ---- Viện Binh (L) ----
// Hướng chạy: enemy kind có `reinforceDir` (xe ở GĐ 2) quyết định, không thì theo hướng mặt.
function startSweep() {
  const p = state.player;
  const center = p.x + p.w / 2;
  const forced = state.enemies.map(enemy => CHAPTER.enemyKinds?.[enemy.kind]?.reinforceDir?.(enemy, center)).find(Boolean);
  const dir = forced || (p.facing < 0 ? -1 : 1);
  state.skills.reinforce.sweeps.push({ x: center, dir, hit: new Set(), brace: null, time: 0 });
}

const sweepBox = sweep => ({ x: sweep.x - REINFORCE.w / 2, y: GROUND_Y - REINFORCE.h, w: REINFORCE.w, h: REINFORCE.h });

// Trúng: enemy kind có `onReinforce` tự xử lý (true = toán dừng lại chặn); trinh
// sát mất máu; lính khác bị đẩy, không mất khiên.
function sweepHits(sweep) {
  const box = sweepBox(sweep);
  for (const enemy of state.enemies) {
    if (!enemy.alive || sweep.hit.has(enemy) || !aabb(box, enemy)) continue;
    sweep.hit.add(enemy);
    const kind = CHAPTER.enemyKinds?.[enemy.kind];
    if (kind) {
      const brace = kind.onReinforce?.(enemy);
      if (brace) {
        sweep.brace = brace;
        return;
      }
    } else if (enemy.art === 'scout') {
      strike(enemy, REINFORCE.scoutDamage);
    } else {
      enemy.x = Math.max(0, Math.min(LEVEL.worldWidth - enemy.w, enemy.x + sweep.dir * REINFORCE.push));
    }
  }
}

function updateReinforce(dt) {
  const reinforce = state.skills.reinforce;
  reinforce.cooldown = Math.max(0, reinforce.cooldown - dt);
  reinforce.sweeps = reinforce.sweeps.filter(sweep => {
    sweep.time += dt;
    if (sweep.brace) return sweep.brace.active();
    sweep.x += sweep.dir * REINFORCE.speed * dt;
    sweepHits(sweep);
    return sweep.x > -REINFORCE.fxHalf && sweep.x < LEVEL.worldWidth + REINFORCE.fxHalf;
  });
}

// Mỗi frame (engine gọi khi màn có khe kỹ năng). Không dùng được khi choáng/cutscene.
function update(dt, triggered) {
  const skills = state.skills;
  const ready = !(state.player.stun > 0) && !state.cutscene;
  const shellWaiting = skills.shell.cooldown > 0;
  const reinforceWaiting = skills.reinforce.cooldown > 0;
  if (ready && triggered.has('SK_MHD_VAN_AN_SHELL') && skills.shell.cooldown <= 0) {
    Object.assign(skills.shell, { left: SHELL.duration, cooldown: SHELL.cooldown, breaking: false });
    setAnim(skills.shell, 'on');
    skills.shell.anim.time = 0;
    playSfx('shellOn');
  }
  if (ready && triggered.has('SK_MHD_REINFORCE') && skills.reinforce.cooldown <= 0) {
    skills.reinforce.cooldown = REINFORCE.cooldown;
    startSweep();
    playSfx('reinforceCall');
  }
  updateShell(dt);
  updateReinforce(dt);
  if (shellWaiting && skills.shell.cooldown <= 0 && owns('SK_MHD_VAN_AN_SHELL')) playSfx('skillReady');
  if (reinforceWaiting && skills.reinforce.cooldown <= 0 && owns('SK_MHD_REINFORCE')) playSfx('skillReady');
}

// Tắt mọi kỹ năng đang chạy (cutscene kết chương).
export function stopSkills() {
  if (!state.skills) return;
  Object.assign(state.skills.shell, { left: 0, breaking: false });
  state.skills.reinforce.sweeps = [];
}

const defs = {
  BUFF_MHD_POWER: { slot: POWER.slot, portrait: POWER.icon, timer: () => ({ left: 0, total: 1, active: false }) },
  SK_MHD_VAN_AN_SHELL: {
    slot: SHELL.slot, portrait: SHELL.icon,
    timer: ({ shell }) => (shell.left > 0
      ? { left: shell.left, total: SHELL.duration, active: true }
      : { left: shell.cooldown, total: SHELL.cooldown, active: false })
  },
  SK_MHD_REINFORCE: {
    slot: REINFORCE.slot, portrait: REINFORCE.icon,
    timer: ({ reinforce }) => ({ left: reinforce.cooldown, total: REINFORCE.cooldown, active: false })
  }
};

// Khe kỹ năng của chương (CHAPTER.skills).
export const MHD_SKILLS = {
  defs,
  createState,
  update,
  blockHurt,
  // Ý chí dân nghèo: đòn chém cơ bản +20 %.
  attackDamage: () => (state.skills.owned.has('BUFF_MHD_POWER') ? POWER.damage : 1)
};
