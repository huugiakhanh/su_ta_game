// Phần thưởng màn 2 thành kỹ năng ở màn 3 (NQ-L3 §3, NQ-00 §3.4), gắn vào khe kỹ
// năng của engine (CHAPTER.skills). Engine lo phím K/L, ô HUD, nút cảm ứng, sở hữu;
// ở đây lo hồi chiêu và hiệu ứng:
//   Thần Tốc Hành Quân (bị động: chạy + chèo ×1,2 — engine moveFactor),
//   Cọc Sắt Bạch Đằng (K: cọc sắt dưới chân mục tiêu gần nhất),
//   Thuyền Nhẹ Khiêu Chiến (L: lướt về trước + miễn sát thương 3 s).
// Không import boss.js (boss.js import file này): đặt `battle.stakeTarget` /
// `battle.pendingBait` để boss.js xử lý ở frame sau.

import { state } from '../../engine/state.js';
import { playSfx } from '../../engine/audio.js';
import { showMessage } from '../../engine/ui.js';
import { GROUND_Y } from '../../engine/config.js';
import { SKILLS, BAIT, BOSS_TEXT } from './config.js';

const SWIFT = SKILLS.BUFF_NQ_SWIFT;
const STAKE = SKILLS.SK_NQ_IRON_STAKE;
const DECOY = SKILLS.SK_NQ_DECOY_BOAT;

const owns = id => Boolean(state.skills?.owned.has(id));
const centerOf = body => body.x + body.w / 2;

function createState() {
  return {
    stake: { cooldown: 0, fx: null },
    decoy: { cooldown: 0, dash: 0, guard: 0, dir: 1, time: 0 }
  };
}

// Mục tiêu gần nhất trong tầm: GĐ 2 mảng giáp còn lại, lính dưới bùn; GĐ 3 Hoằng Tháo.
function stakeTarget() {
  const battle = state.battle;
  if (!battle) return null;
  const center = centerOf(state.player);
  const candidates = state.enemies.filter(enemy => {
    if (!enemy.alive) return false;
    if (enemy.kind === 'shipArmor') return battle.phase === 2;
    if (enemy.kind === 'hoangThao') return battle.phase === 3;
    return Boolean(enemy.mud);
  });
  const near = candidates.filter(enemy => Math.abs(centerOf(enemy) - center) <= STAKE.range);
  return near.sort((a, b) => Math.abs(centerOf(a) - center) - Math.abs(centerOf(b) - center))[0] || null;
}

function castStake() {
  const target = stakeTarget();
  if (!target) {
    showMessage(BOSS_TEXT.noStakeSpot, 1600);
    return;
  }
  const footY = target.kind === 'shipArmor' ? GROUND_Y : target.y + target.h;
  Object.assign(state.skills.stake, { cooldown: STAKE.cooldown, fx: { x: centerOf(target), footY, time: 0 } });
  state.battle.stakeTarget = target;
  playSfx('stakeRise');
}

function castDecoy() {
  const p = state.player;
  Object.assign(state.skills.decoy, { cooldown: DECOY.cooldown, dash: DECOY.dashTime, guard: DECOY.guard, dir: p.facing < 0 ? -1 : 1, time: 0 });
  if (state.battle?.phase === 1) state.battle.pendingBait += BAIT.decoy;
  playSfx('decoyDash');
}

// Lướt về trước: trên thuyền thì đẩy thuyền (engine kẹp trong khúc nước), dưới đất đẩy người.
function updateDecoyDash(decoy, dt) {
  if (decoy.dash <= 0) return;
  decoy.dash = Math.max(0, decoy.dash - dt);
  const p = state.player;
  const step = decoy.dir * DECOY.dashSpeed * dt;
  const boat = p.platform?.attached;
  if (boat?.kind === 'boat') boat.x += step;
  else p.x += step;
}

// Mỗi frame (engine gọi khi màn có khe kỹ năng). Không dùng được khi choáng/cutscene.
function update(dt, triggered) {
  const skills = state.skills;
  const { stake, decoy } = skills;
  const ready = !(state.player.stun > 0) && !state.cutscene;
  const stakeWaiting = stake.cooldown > 0;
  const decoyWaiting = decoy.cooldown > 0;
  if (ready && triggered.has('SK_NQ_IRON_STAKE') && stake.cooldown <= 0) castStake();
  if (ready && triggered.has('SK_NQ_DECOY_BOAT') && decoy.cooldown <= 0) castDecoy();
  stake.cooldown = Math.max(0, stake.cooldown - dt);
  decoy.cooldown = Math.max(0, decoy.cooldown - dt);
  decoy.guard = Math.max(0, decoy.guard - dt);
  decoy.time += dt;
  if (stake.fx) {
    stake.fx.time += dt;
    if (stake.fx.time > 2) stake.fx = null;
  }
  updateDecoyDash(decoy, dt);
  if (stakeWaiting && stake.cooldown <= 0 && owns('SK_NQ_IRON_STAKE')) playSfx('skillReady');
  if (decoyWaiting && decoy.cooldown <= 0 && owns('SK_NQ_DECOY_BOAT')) playSfx('skillReady');
}

// Tắt mọi kỹ năng đang chạy (cutscene kết chương).
export function stopSkills() {
  if (!state.skills) return;
  state.skills.stake.fx = null;
  Object.assign(state.skills.decoy, { dash: 0, guard: 0 });
}

const defs = {
  BUFF_NQ_SWIFT: { slot: SWIFT.slot, portrait: SWIFT.icon, timer: () => ({ left: 0, total: 1, active: false }) },
  SK_NQ_IRON_STAKE: {
    slot: STAKE.slot, portrait: STAKE.icon,
    timer: ({ stake }) => ({ left: stake.cooldown, total: STAKE.cooldown, active: false })
  },
  SK_NQ_DECOY_BOAT: {
    slot: DECOY.slot, portrait: DECOY.icon,
    timer: ({ decoy }) => (decoy.guard > 0
      ? { left: decoy.guard, total: DECOY.guard, active: true }
      : { left: decoy.cooldown, total: DECOY.cooldown, active: false })
  }
};

// Thần Tốc Hành Quân: hệ số tốc độ chạy + chèo (engine player.js, hazards.js).
const moveFactor = () => (owns('BUFF_NQ_SWIFT') ? SWIFT.factor : 1);

// Thuyền Nhẹ Khiêu Chiến: miễn mọi sát thương lúc `guard`.
const blockHurt = () => (state.skills?.decoy.guard ?? 0) > 0;

export const NQ_SKILLS = { defs, createState, update, moveFactor, blockHurt };
