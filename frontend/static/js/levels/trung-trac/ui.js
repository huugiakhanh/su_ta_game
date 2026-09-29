// DOM refs (HUD, panel) + cập nhật hiển thị. Không chứa logic gameplay.

import { joinAssetPath } from './assets.js';
import { ATTACK_ICON, DASH_COOLDOWN, DASH_ICON, ITEM_ROOT, ITEM_FILES, LEVEL, SKILLS, SPRITE_8BIT_ROOT } from './config.js';
import { state } from './state.js';
import { getAsset } from './animation.js';

export const ui = {
  health: document.getElementById('healthHearts'),
  books: document.getElementById('bookValue'),
  bookHud: document.getElementById('bookHud'),
  score: document.getElementById('scoreValue'),
  progress: document.getElementById('progressBar'),
  loading: document.getElementById('loadingPanel'),
  loadingText: document.getElementById('loadingText'),
  start: document.getElementById('startButton'),
  end: document.getElementById('endPanel'),
  endTitle: document.getElementById('endTitle'),
  endText: document.getElementById('endText'),
  restart: document.getElementById('restartButton'),
  next: document.getElementById('nextLevelButton'),
  // Panel kết chương (màn 3).
  replayChapter: document.getElementById('replayChapterButton'),
  home: document.getElementById('homeButton'),
  message: document.getElementById('messageBox'),
  // Màn 3: ô kỹ năng/buff + mọi phần tử gắn `data-skill` (ô HUD, dòng trợ
  // giúp, nút cảm ứng) — chỉ hiện với phần thưởng đã nhận.
  skillBar: document.getElementById('skillBar'),
  dashSlot: document.getElementById('dashSlot'),
  skillNodes: [...document.querySelectorAll('[data-skill]')],
  skillSlots: [...document.querySelectorAll('.skill[data-skill]')],
  // Màn 3: thanh khiên chiến xa (giai đoạn 1) / "Đợt N/3" (giai đoạn 2).
  bossHud: document.getElementById('bossHud'),
  bossLabel: document.getElementById('bossHudLabel'),
  shieldPips: [...document.querySelectorAll('#shieldPips i')]
};

let messageTimer = 0;
let lastRenderedHealth = -1;

export function showMessage(text, duration = 1900) {
  ui.message.textContent = text;
  ui.message.classList.add('message--visible');
  messageTimer = duration / 1000;
}

// physics.js gọi hàm này mỗi frame để đếm ngược rồi tự ẩn message — giữ
// `messageTimer` đóng gói trong ui.js thay vì phải export biến mutable riêng.
export function tickMessage(dt) {
  if (messageTimer > 0) {
    messageTimer -= dt;
    if (messageTimer <= 0) ui.message.classList.remove('message--visible');
  }
}

export function updateHud() {
  if (state.health !== lastRenderedHealth) {
    lastRenderedHealth = state.health;
    ui.health.innerHTML = '';
    for (let i = 0; i < state.health; i += 1) {
      const icon = document.createElement('img');
      icon.src = joinAssetPath(ITEM_ROOT, ITEM_FILES.heart);
      icon.alt = 'Máu';
      ui.health.appendChild(icon);
    }
  }
  // Màn không có sách (màn 2) thì ẩn ô Sách trên HUD.
  ui.bookHud.hidden = state.books.length === 0;
  ui.books.textContent = `${state.booksCollected}/${state.books.length}`;
  ui.score.textContent = state.score;
  const percent = Math.max(0, Math.min(100, state.player.x / state.finishX * 100));
  ui.progress.style.width = `${percent}%`;
  // Đấu trường không có quãng đường -> ẩn thanh tiến độ.
  ui.progress.parentElement.hidden = Boolean(LEVEL.arena);
  updateDashHud();
  updateSkillHud();
  updateBossHud();
}

function updateBossHud() {
  const battle = state.battle;
  const phase = battle?.phase;
  ui.bossHud.hidden = !(phase === 1 || phase === 2);
  if (ui.bossHud.hidden) return;
  const shieldPhase = phase === 1;
  ui.shieldPips[0].parentElement.hidden = !shieldPhase;
  if (shieldPhase) {
    ui.bossLabel.textContent = 'Khiên';
    ui.shieldPips.forEach((pip, index) => pip.classList.toggle('is-lost', index >= battle.chariot.shield));
    return;
  }
  const spawner = state.spawner;
  const total = spawner?.groups.length || 3;
  ui.bossLabel.textContent = `Đợt ${Math.min(total, Math.max(1, spawner?.index || 1))}/${total}`;
}

// Giây hồi chiêu còn lại / tổng của một ô. Bóng Trưng Nhị đang hiệu lực thì
// hiện thời gian hiệu lực còn lại (ô sáng xanh).
function skillTimer(id, skills) {
  const spec = SKILLS[id];
  if (id === 'SK_LE_CHAN_ARROW_RAIN') return { left: skills.arrowRain.cooldown, total: spec.cooldown, active: false };
  if (id === 'SK_TRUNG_NHI_SHADOW') {
    const shadow = skills.shadow;
    return shadow.active > 0
      ? { left: shadow.active, total: spec.duration, active: true }
      : { left: shadow.cooldown, total: spec.cooldown, active: false };
  }
  return { left: skills.buff.cooldown, total: spec.cooldown, active: false };
}

// Nút cảm ứng của chiêu (TT-MOBILE-01) dùng cùng ảnh với ô HUD; ảnh tải
// xong mới hiện (CSS ẩn chữ tạm), lỗi thì giữ chữ.
function setControlIcon(control, src) {
  const icon = document.querySelector(`[data-control="${control}"] .control__icon`);
  if (!icon) return;
  icon.onload = () => { icon.hidden = false; };
  icon.src = src;
}
const SKILL_CONTROLS = { SK_LE_CHAN_ARROW_RAIN: 'arrowRain', SK_TRUNG_NHI_SHADOW: 'shadow' };

// Ô Lướt (mọi màn): lớp phủ + số giây hồi chiêu còn lại của dash.
function updateDashHud() {
  const slot = ui.dashSlot;
  const icon = slot.querySelector('.skill__icon');
  if (!icon.dataset.ready) {
    // Icon lấy theo manifest; chưa có asset (TODO_MISSING) thì giữ chữ tạm.
    const file = getAsset(DASH_ICON)?.animations?.[0]?.file;
    if (file) {
      icon.src = joinAssetPath(SPRITE_8BIT_ROOT, file);
      icon.onload = () => { icon.hidden = false; };
      icon.dataset.ready = '1';
      setControlIcon('dash', icon.src);
    }
  }
  const attackIcon = document.querySelector('[data-control="attack"] .control__icon');
  if (attackIcon && !attackIcon.dataset.ready) {
    const file = getAsset(ATTACK_ICON)?.animations?.[0]?.file;
    if (file) {
      setControlIcon('attack', joinAssetPath(SPRITE_8BIT_ROOT, file));
      attackIcon.dataset.ready = '1';
    }
  }
  const left = state.player.dashCooldown || 0;
  slot.classList.toggle('skill--active', state.player.dashing);
  slot.querySelector('.skill__cd').style.height = `${left > 0 ? left / DASH_COOLDOWN * 100 : 0}%`;
  slot.querySelector('.skill__time').textContent = left > 0 ? Math.ceil(left) : '';
}

function updateSkillHud() {
  const skills = state.skills;
  ui.skillNodes.forEach(node => { node.hidden = !skills?.owned.has(node.dataset.skill); });
  if (!skills) return;
  ui.skillSlots.forEach(slot => {
    const id = slot.dataset.skill;
    if (!skills.owned.has(id)) return;
    const icon = slot.querySelector('.skill__icon');
    if (!icon.dataset.ready) {
      // Chân dung lấy theo manifest (tải xong manifest mới có) — gán 1 lần.
      const file = getAsset(SKILLS[id].portrait)?.animations?.[0]?.file;
      if (file) {
        icon.src = joinAssetPath(SPRITE_8BIT_ROOT, file);
        icon.dataset.ready = '1';
        if (SKILL_CONTROLS[id]) setControlIcon(SKILL_CONTROLS[id], icon.src);
      }
    }
    const { left, total, active } = skillTimer(id, skills);
    slot.classList.toggle('skill--active', active);
    slot.querySelector('.skill__cd').style.height = `${left > 0 ? left / total * 100 : 0}%`;
    slot.querySelector('.skill__time').textContent = left > 0 ? Math.ceil(left) : '';
  });
}
