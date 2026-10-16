// Phần thưởng màn 2 thành kỹ năng ở màn 3 (TT-BOSS-01 §3.2) — hiệu ứng riêng
// chương, gắn vào khe kỹ năng của engine (CHAPTER.skills): engine lo phím K/L,
// ô HUD, nút cảm ứng, sở hữu (state.skills.owned); ở đây lo hồi chiêu + hiệu ứng.
//   Ý chí kiên cường (bị động), Mưa tên (skill1 — K), Bóng Trưng Nhị (skill2 — L).

import { state } from '../../engine/state.js';
import { showMessage } from '../../engine/ui.js';
import { aabb } from '../../engine/geometry.js';
import { setAnim, tickAnim, getAnimMeta, hitTime, createAnim } from '../../engine/animation.js';
import { GROUND_Y, ATTACK_COOLDOWN, ATTACK_ACTIVE_TIME } from '../../engine/config.js';
import { playSfx } from '../../engine/audio.js';
import { spearBox, strike } from '../../engine/combat.js';
import { SKILLS, ARROW_RAIN_SPRITE, REWARD_NAMES } from './config.js';

const BUFF = SKILLS.BUFF_Y_CHI_KIEN_CUONG;
const RAIN = SKILLS.SK_LE_CHAN_ARROW_RAIN;
const SHADOW = SKILLS.SK_TRUNG_NHI_SHADOW;

function owns(id) {
  return Boolean(state.skills?.owned.has(id));
}

// Trạng thái kỹ năng của lượt chơi (engine gộp thêm `owned`).
function createState() {
  return {
    // Buff Ý chí kiên cường: calm = giây kể từ lần trúng đòn gần nhất.
    buff: { calm: 0, cooldown: 0 },
    arrowRain: { cooldown: 0 },
    // Bóng Trưng Nhị: active = giây hiệu lực còn lại; trail = vệt di chuyển
    // của người chơi (để bóng đi trễ); attack = cú chém đang diễn.
    shadow: { active: 0, cooldown: 0, trail: [], clock: 0, pose: null, attack: null, anim: createAnim('idle') }
  };
}

// Mục tiêu có máu mà kỹ năng đánh được. Chiến xa còn khiên (`shielded`):
// mưa tên không tác dụng; bóng Trưng Nhị chém trúng thì xe chỉ nháy mờ + gợi ý
// (includeShielded, xử lý ở boss.js blockStrike).
function skillTargets(includeShielded = false) {
  return [
    ...state.enemies.filter(enemy => enemy.alive && enemy.hp > 0 && (includeShielded || !enemy.shielded)),
    ...state.hazards.filter(hazard => hazard.alive && hazard.hp > 0)
  ];
}

// Ý chí kiên cường (bị động): máu còn 1 và calmTime giây không trúng đòn ->
// hồi 1 máu; hồi chiêu tính từ lần hồi trước.
function updateBuff(dt) {
  const buff = state.skills.buff;
  buff.cooldown = Math.max(0, buff.cooldown - dt);
  buff.calm += dt;
  if (!owns('BUFF_Y_CHI_KIEN_CUONG')) return;
  if (state.health === 1 && buff.calm >= BUFF.calmTime && buff.cooldown <= 0) {
    state.health += 1;
    playSfx('heal');
    buff.cooldown = BUFF.cooldown;
    buff.calm = 0;
    showMessage(`${REWARD_NAMES.BUFF_Y_CHI_KIEN_CUONG}: hồi 1 máu.`);
  }
}

// Mưa tên (K): `count` mũi rải đều trong vùng phía trước người chơi, ra lần
// lượt trong `spread` giây, rơi từ mép trên màn hình. Mỗi lần dùng là một
// `salvo` đếm số mũi đã trúng từng mục tiêu (lính <= perEnemy, boss <= perBoss).
function castArrowRain() {
  const p = state.player;
  state.skills.arrowRain.cooldown = RAIN.cooldown;
  playSfx('skillArrow');
  const left = p.facing > 0 ? p.x + p.w + RAIN.offset : p.x - RAIN.offset - RAIN.width;
  const step = RAIN.width / RAIN.count;
  const salvo = new Map();
  for (let i = 0; i < RAIN.count; i += 1) {
    const jitter = (Math.random() * 2 - 1) * RAIN.jitter;
    state.arrows.push({
      salvo, centerX: left + step * (i + .5) + jitter, tipY: 0,
      delay: i * RAIN.spread / RAIN.count, alive: true
    });
  }
}

// Mũi tên mưa: chạm mục tiêu có máu (chưa đủ số mũi của lần dùng này) -> 1
// đòn rồi biến mất; mục tiêu đã đủ thì mũi bay xuyên. Chạm đất -> biến mất.
// Không chặn đạn địch, không ảnh hưởng người chơi.
function updateArrows(dt) {
  const targets = skillTargets();
  state.arrows.forEach(arrow => {
    if (arrow.delay > 0) {
      arrow.delay -= dt;
      return;
    }
    arrow.tipY += RAIN.fallSpeed * dt;
    if (arrow.tipY >= GROUND_Y) {
      arrow.alive = false;
      return;
    }
    const box = {
      x: arrow.centerX - ARROW_RAIN_SPRITE.w / 2, y: arrow.tipY - ARROW_RAIN_SPRITE.h,
      w: ARROW_RAIN_SPRITE.w, h: ARROW_RAIN_SPRITE.h
    };
    const target = targets.find(item => item.alive
      && (arrow.salvo.get(item) || 0) < (item.boss ? RAIN.perBoss : RAIN.perEnemy)
      && aabb(box, item));
    if (!target) return;
    arrow.salvo.set(target, (arrow.salvo.get(target) || 0) + 1);
    arrow.alive = false;
    strike(target);
  });
  state.arrows = state.arrows.filter(arrow => arrow.alive);
}

// Bóng Trưng Nhị (L): đi sau người chơi `gap` px, trễ `delay` giây theo vệt
// di chuyển; `run` khi di chuyển (cả trên không), `idle` khi đứng yên; chém
// cùng lúc với người chơi — trong cửa sổ bắt đầu ở hit_frame của bóng, vùng
// giáo lật theo hướng bóng, mỗi mục tiêu nhận thêm tối đa 1 đòn mỗi cú. Không
// hurtbox, không va chạm, không phản hũ dầu.
function updateShadow(dt) {
  const shadow = state.skills.shadow;
  if (shadow.active <= 0) {
    shadow.cooldown = Math.max(0, shadow.cooldown - dt);
    return;
  }
  shadow.active -= dt;
  if (shadow.active <= 0) {
    shadow.active = 0;
    shadow.cooldown = SHADOW.cooldown;
    shadow.attack = null;
    shadow.pose = null;
    return;
  }
  const p = state.player;
  shadow.clock += dt;
  shadow.trail.push({
    t: shadow.clock, x: p.x, y: p.y, w: p.w, h: p.h, facing: p.facing,
    moving: Math.abs(p.vx) > 1 || !p.grounded
  });
  const target = shadow.clock - SHADOW.delay;
  while (shadow.trail.length > 1 && shadow.trail[1].t <= target) shadow.trail.shift();
  const sample = shadow.trail[0];
  shadow.pose = {
    x: sample.x - sample.facing * SHADOW.gap, y: sample.y, w: sample.w, h: sample.h,
    facing: sample.facing, moving: sample.moving
  };
  setAnim(shadow, shadow.attack ? 'attack' : (sample.moving ? 'run' : 'idle'));
  tickAnim(shadow, dt);
  if (!shadow.attack) return;

  const attack = shadow.attack;
  attack.time += dt;
  shadow.anim.time = attack.time;
  const meta = getAnimMeta(SHADOW.sprite, 'attack_01');
  const start = meta ? hitTime(meta, ATTACK_COOLDOWN) : 0;
  if (attack.time >= start && attack.time < start + ATTACK_ACTIVE_TIME) {
    const box = spearBox(shadow.pose, shadow.pose.facing);
    skillTargets(true).forEach(item => {
      if (!item.alive || attack.hits.has(item) || !aabb(box, item)) return;
      attack.hits.add(item);
      strike(item);
    });
  }
  if (attack.time >= ATTACK_COOLDOWN) shadow.attack = null;
}

// Mỗi frame (engine gọi khi màn có khe kỹ năng). `triggered` = id kỹ năng đã
// sở hữu mà người chơi vừa bấm phím khe của nó.
function update(dt, triggered) {
  const skills = state.skills;
  // Hết hồi chiêu K/L thì kêu 1 tiếng báo sẵn sàng.
  const rainWaiting = skills.arrowRain.cooldown > 0;
  const shadowWaiting = skills.shadow.cooldown > 0;
  skills.arrowRain.cooldown = Math.max(0, skills.arrowRain.cooldown - dt);
  if (rainWaiting && skills.arrowRain.cooldown <= 0 && owns('SK_LE_CHAN_ARROW_RAIN')) playSfx('skillReady');
  if (triggered.has('SK_LE_CHAN_ARROW_RAIN') && skills.arrowRain.cooldown <= 0) castArrowRain();
  if (triggered.has('SK_TRUNG_NHI_SHADOW') && skills.shadow.active <= 0 && skills.shadow.cooldown <= 0) {
    Object.assign(skills.shadow, { active: SHADOW.duration, trail: [], clock: 0, attack: null });
    playSfx('skillShadow');
  }
  updateShadow(dt);
  if (shadowWaiting && skills.shadow.cooldown <= 0 && owns('SK_TRUNG_NHI_SHADOW')) playSfx('skillReady');
  updateArrows(dt);
  updateBuff(dt);
}

// Giây hồi chiêu còn lại / tổng của một ô HUD. Bóng Trưng Nhị đang hiệu lực
// thì hiện thời gian hiệu lực còn lại (ô sáng xanh).
const defs = {
  BUFF_Y_CHI_KIEN_CUONG: {
    slot: BUFF.slot, portrait: BUFF.portrait,
    timer: skills => ({ left: skills.buff.cooldown, total: BUFF.cooldown, active: false })
  },
  SK_LE_CHAN_ARROW_RAIN: {
    slot: RAIN.slot, portrait: RAIN.portrait,
    timer: skills => ({ left: skills.arrowRain.cooldown, total: RAIN.cooldown, active: false })
  },
  SK_TRUNG_NHI_SHADOW: {
    slot: SHADOW.slot, portrait: SHADOW.portrait,
    timer: ({ shadow }) => (shadow.active > 0
      ? { left: shadow.active, total: SHADOW.duration, active: true }
      : { left: shadow.cooldown, total: SHADOW.cooldown, active: false })
  }
};

// Khe kỹ năng của chương (CHAPTER.skills).
export const TT_SKILLS = {
  defs,
  createState,
  update,
  // Buff Ý chí kiên cường đếm thời gian KỂ TỪ lần trúng đòn gần nhất.
  onPlayerHurt() {
    state.skills.buff.calm = 0;
  },
  // Bóng Trưng Nhị chém cùng lúc với người chơi.
  onAttackStart() {
    const shadow = state.skills.shadow;
    if (shadow.active > 0) shadow.attack = { time: 0, hits: new Set() };
  }
};

// Hộp F2 của bóng Trưng Nhị (đang hiệu lực).
export function skillDebugEntities() {
  const shadow = state.skills?.shadow;
  return shadow?.pose && shadow.active > 0 ? [shadow.pose] : [];
}
