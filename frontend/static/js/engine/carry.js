// Mang và ném (MHD-ENGINE E1): người chơi nhặt vật do chương khai báo
// (CHAPTER.carry[kind]), bấm Đánh để ném theo đường cong. Vật rơi ra bằng
// combat.js spawnCarry; nhặt trong level-flow.js updatePickups. Công thức đường bay
// như hũ dầu chương 1 nhưng độc lập (chương 1 giữ code riêng — MHD-ENGINE Q3).

import { state } from './state.js';
import { aabb, groundYAt } from './geometry.js';
import { ATTACK_COOLDOWN, VIEW_H } from './config.js';
import { CHAPTER, LEVEL } from './chapter.js';
import { playSfx } from './audio.js';
import { strike } from './combat.js';

// Vật rời tay cách đỉnh đầu chừng này px.
const HAND_OFFSET = 10;

export const carrySpec = kind => CHAPTER.carry?.[kind];

// Hộp va chạm của vật đang bay (x, y là tâm).
const thrownBox = item => ({ x: item.x - item.w / 2, y: item.y - item.h / 2, w: item.w, h: item.h });

function overHole(x) {
  return state.holes.some(hole => x > hole.x && x < hole.x + hole.w);
}

// Bấm Đánh khi đang cầm: ném theo hướng mặt, rơi cách `range` px sau `flightTime`
// giây. Dùng đồng hồ cú vung để phát animation `attack`, nhưng `throwSwing` tắt
// hộp chém (player.js updateAttack).
export function throwCarried() {
  const p = state.player;
  const spec = carrySpec(p.carrying);
  if (!spec || p.attackCooldown > 0) return;
  const x = p.x + p.w / 2 + p.facing * p.w / 2;
  const y = p.y + HAND_OFFSET;
  const time = spec.flightTime;
  state.thrown.push({
    kind: p.carrying, x, y, w: spec.w, h: spec.h, facing: p.facing, age: 0, alive: true,
    vx: p.facing * spec.range / time,
    // Đáy vật chạm đất đúng lúc hết `flightTime`.
    vy: (groundYAt(x + p.facing * spec.range) - spec.h / 2 - y - .5 * spec.gravity * time * time) / time
  });
  p.carrying = null;
  p.attackCooldown = ATTACK_COOLDOWN;
  p.throwSwing = true;
  playSfx('throw');
}

// Vật mất ở (x, footY): để lại hiệu ứng `impact` (chỉ vẽ, vô hại).
function endThrown(item, footY) {
  item.alive = false;
  const impact = carrySpec(item.kind)?.impact;
  if (impact) state.impacts.push({ ...impact, x: item.x, footY, age: 0 });
}

function thrownTarget(box) {
  return state.enemies.find(enemy => enemy.alive && aabb(box, enemy))
    || state.hazards.find(hazard => hazard.alive && hazard.hp > 0 && hazard.exposed !== false && aabb(box, hazard));
}

// Vật đang bay: trúng địch thì chương xử lý trước (`hooks.onThrownHit` trả true),
// không thì trừ máu như đòn thường; chạm đất thì báo `hooks.onThrownLand`.
export function updateThrown(dt) {
  state.thrown.forEach(item => {
    const spec = carrySpec(item.kind);
    item.age += dt;
    // Tích phân đúng parabol để điểm rơi không lệch theo dt.
    item.x += item.vx * dt;
    item.y += item.vy * dt + .5 * spec.gravity * dt * dt;
    item.vy += spec.gravity * dt;
    const target = thrownTarget(thrownBox(item));
    if (target) {
      if (!CHAPTER.hooks?.onThrownHit?.(item, target)) strike(target, spec.damage ?? 1);
      endThrown(item, target.y + target.h);
      return;
    }
    if (item.y > VIEW_H || item.x < 0 || item.x > LEVEL.worldWidth) {
      item.alive = false;
      return;
    }
    if (!overHole(item.x) && item.y + item.h / 2 >= groundYAt(item.x)) {
      CHAPTER.hooks?.onThrownLand?.(item);
      endThrown(item, groundYAt(item.x));
    }
  });
  state.thrown = state.thrown.filter(item => item.alive);
  state.impacts.forEach(impact => { impact.age += dt; });
  state.impacts = state.impacts.filter(impact => impact.age < impact.time);
}
