// Phần thưởng màn 2 thành kỹ năng ở màn 3 (TQP-L3 §3) — gắn vào khe kỹ năng của
// engine (CHAPTER.skills): engine lo phím K/L, ô HUD, nút cảm ứng, sở hữu
// (state.skills.owned); ở đây lo hồi chiêu + hiệu ứng.
//   Thể lực cường tráng (bị động — bonusHealth), Hiệu triệu Vạn Xuân (skill1 — K),
//   Móng Rồng (skill2 — L; boss.js đọc clawActive() khi bổ gáy).

import { state } from '../../engine/state.js';
import { setAnim, tickAnim, createAnim, getAnimMeta, animLength, hitTime } from '../../engine/animation.js';
import { CHAPTER } from '../../engine/chapter.js';
import { playSfx } from '../../engine/audio.js';
import { strike } from '../../engine/combat.js';
import { SKILLS } from './config.js';

const VITALITY = SKILLS.BUFF_TQP_VITALITY;
const RALLY = SKILLS.SK_TQP_RALLY;
const CLAW = SKILLS.SK_TQP_DRAGON_CLAW;

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
    // Hiệu triệu: active = đang phát `burst`; hit = đã gây hiệu ứng ở ô hit.
    rally: { active: false, hit: false, cooldown: 0, anim: createAnim('burst') },
    // Móng Rồng: left = giây còn bật; anim `on` (lúc bật) -> `hold`; cooldown đếm
    // từ lúc bật.
    claw: { left: 0, cooldown: 0, anim: createAnim('on') }
  };
}

// Móng Rồng đang bật (boss.js: bổ gáy gây sát thương đầy đủ).
export function clawActive() {
  return (state.skills?.claw.left || 0) > 0;
}

// ---- Hiệu triệu Vạn Xuân (K) ----
// Ô hit của `burst`: lính + cung thủ (hazard có máu) trong bán kính quanh người
// chơi mất máu + bị đẩy; đạn trong bán kính tan; enemy có `kind` riêng xử lý
// qua enemyKinds[kind].onRally (Dương Sàn: ngắt cú lao, không mất máu).
function rallyHit() {
  const p = state.player;
  const center = p.x + p.w / 2;
  const inRange = body => Math.abs(body.x + body.w / 2 - center) <= RALLY.radius + body.w / 2
    && body.y < p.y + p.h + 8 && body.y + body.h > p.y - 24;
  state.enemies.filter(enemy => enemy.alive && inRange(enemy)).forEach(enemy => {
    const kind = CHAPTER.enemyKinds?.[enemy.kind];
    if (kind) {
      kind.onRally?.(enemy);
      return;
    }
    enemy.x += Math.sign(enemy.x + enemy.w / 2 - center || 1) * RALLY.push;
    strike(enemy, RALLY.damage);
  });
  state.hazards.filter(hazard => hazard.alive && hazard.hp > 0 && inRange(hazard)).forEach(hazard => strike(hazard, RALLY.damage));
  state.projectiles.forEach(projectile => {
    if (projectile.alive && inRange(projectile)) projectile.alive = false;
  });
  playSfx('rallyHit');
}

function updateRally(dt) {
  const rally = state.skills.rally;
  if (!rally.active) {
    rally.cooldown = Math.max(0, rally.cooldown - dt);
    return;
  }
  tickAnim(rally, dt);
  const meta = getAnimMeta(RALLY.fx, 'burst');
  if (!rally.hit && rally.anim.time >= (meta ? hitTime(meta) : 0)) {
    rally.hit = true;
    rallyHit();
  }
  if (rally.anim.time >= animSeconds(RALLY.fx, 'burst')) {
    rally.active = false;
    rally.cooldown = RALLY.cooldown;
  }
}

// ---- Móng Rồng (L) ----
function updateClaw(dt) {
  const claw = state.skills.claw;
  claw.cooldown = Math.max(0, claw.cooldown - dt);
  if (claw.left <= 0) return;
  claw.left = Math.max(0, claw.left - dt);
  tickAnim(claw, dt);
  if (claw.anim.name === 'on' && claw.anim.time >= animSeconds(CLAW.fx, 'on')) setAnim(claw, 'hold');
}

// Mỗi frame (engine gọi khi màn có khe kỹ năng). `triggered` = id kỹ năng đã
// sở hữu mà người chơi vừa bấm phím khe của nó. Không dùng được khi đang choáng
// hoặc trong cutscene.
function update(dt, triggered) {
  const skills = state.skills;
  const ready = !(state.player.stun > 0) && !state.cutscene;
  const rallyWaiting = skills.rally.cooldown > 0;
  const clawWaiting = skills.claw.cooldown > 0;
  if (ready && triggered.has('SK_TQP_RALLY') && !skills.rally.active && skills.rally.cooldown <= 0) {
    Object.assign(skills.rally, { active: true, hit: false });
    setAnim(skills.rally, 'burst');
    skills.rally.anim.time = 0;
    playSfx('rallyCall');
  }
  if (ready && triggered.has('SK_TQP_DRAGON_CLAW') && skills.claw.left <= 0 && skills.claw.cooldown <= 0) {
    Object.assign(skills.claw, { left: CLAW.duration, cooldown: CLAW.cooldown });
    setAnim(skills.claw, 'on');
    skills.claw.anim.time = 0;
    playSfx('clawOn');
  }
  updateRally(dt);
  updateClaw(dt);
  if (rallyWaiting && skills.rally.cooldown <= 0 && owns('SK_TQP_RALLY')) playSfx('skillReady');
  if (clawWaiting && skills.claw.cooldown <= 0 && owns('SK_TQP_DRAGON_CLAW')) playSfx('skillReady');
}

// Tắt mọi kỹ năng đang chạy (cutscene kết chương).
export function stopSkills() {
  if (!state.skills) return;
  state.skills.rally.active = false;
  state.skills.claw.left = 0;
}

// Giây hồi chiêu còn lại / tổng của một ô HUD. Móng Rồng đang bật thì hiện thời
// gian còn lại (ô sáng); hết bật thì phần hồi chiêu còn lại.
const defs = {
  BUFF_TQP_VITALITY: {
    slot: VITALITY.slot, portrait: VITALITY.icon,
    timer: () => ({ left: 0, total: 1, active: false })
  },
  SK_TQP_RALLY: {
    slot: RALLY.slot, portrait: RALLY.icon,
    timer: ({ rally }) => (rally.active
      ? { left: 0, total: 1, active: true }
      : { left: rally.cooldown, total: RALLY.cooldown, active: false })
  },
  SK_TQP_DRAGON_CLAW: {
    slot: CLAW.slot, portrait: CLAW.icon,
    timer: ({ claw }) => (claw.left > 0
      ? { left: claw.left, total: CLAW.duration, active: true }
      : { left: claw.cooldown, total: CLAW.cooldown, active: false })
  }
};

// Khe kỹ năng của chương (CHAPTER.skills).
export const TQP_SKILLS = {
  defs,
  createState,
  update,
  // Thể lực cường tráng: máu tối đa + bonus (engine E8).
  bonusHealth: owned => (owned.has('BUFF_TQP_VITALITY') ? VITALITY.bonus : 0)
};
