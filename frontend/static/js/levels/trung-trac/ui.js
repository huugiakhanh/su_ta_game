// DOM refs (HUD, panel) + cập nhật hiển thị. Không chứa logic gameplay.

import { images, spriteUrl } from './assets.js';
import { ATTACK_ICON, BOOK_SPRITE_ID, DASH_COOLDOWN, DASH_ICON, HEART_ICON, LEVEL, SKILLS } from './config.js';
import { state } from './state.js';
import { getAsset } from './animation.js';
import { formatTime } from './timer.js';

export const ui = {
  health: document.getElementById('healthHearts'),
  // Máu + sách nằm ở góc trên-trái khung chơi (TT-HUD-02), không còn trên thanh HUD.
  books: document.getElementById('bookValue'),
  bookHud: document.getElementById('bookHud'),
  bookIcon: document.getElementById('bookIcon'),
  score: document.getElementById('scoreValue'),
  progress: document.getElementById('progressBar'),
  loading: document.getElementById('loadingPanel'),
  loadingText: document.getElementById('loadingText'),
  start: document.getElementById('startButton'),
  end: document.getElementById('endPanel'),
  endTitle: document.getElementById('endTitle'),
  endText: document.getElementById('endText'),
  // Thời gian màn/chương + trạng thái lưu kỷ lục (TT-TIME-01).
  endTime: document.getElementById('endTime'),
  restart: document.getElementById('restartButton'),
  next: document.getElementById('nextLevelButton'),
  // Panel kết chương (màn 3).
  replayChapter: document.getElementById('replayChapterButton'),
  home: document.getElementById('homeButton'),
  message: document.getElementById('messageBox'),
  // Ô thời gian màn trên HUD (TT-TIME-01).
  time: document.getElementById('timeValue'),
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
// Nguồn ảnh tim lúc vẽ lần trước — HUD có thể vẽ trước khi asset tải xong,
// tải xong icon thì phải vẽ lại dù máu không đổi.
let lastHeartUrl = null;
// Hiệu ứng mất/hồi máu, nhặt sách (TT-HUD-02) chỉ chạy khi số đổi TRONG cùng
// một lượt chơi — state bị thay mỗi lần chơi lại (máu đầy lại) thì không chạy.
let lastHudState = null;
let lastBooks = 0;

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
  const sameRun = state === lastHudState;
  lastHudState = state;
  const heartUrl = spriteUrl(HEART_ICON);
  if (state.health !== lastRenderedHealth || heartUrl !== lastHeartUrl) {
    // Đổi máu trong cùng lượt: tim mất nhấp nháy rồi mờ, cả hàng rung; tim
    // hồi sáng lên. Lượt mới / ảnh tim vừa tải xong: vẽ lại, không hiệu ứng.
    const previous = sameRun && lastRenderedHealth >= 0 ? lastRenderedHealth : state.health;
    lastRenderedHealth = state.health;
    lastHeartUrl = heartUrl;
    ui.health.innerHTML = '';
    for (let i = 0; i < Math.max(state.health, previous); i += 1) {
      const heart = makeHeart();
      if (i >= state.health) {
        heart.classList.add('is-lost');
        heart.addEventListener('animationend', () => heart.remove(), { once: true });
      } else if (i >= previous) heart.classList.add('is-gained');
      ui.health.append(heart);
    }
    ui.health.setAttribute('aria-label', `Máu: ${state.health}`);
    if (state.health < previous) replayAnimation(ui.health, 'is-hurt');
  }
  // Màn không có sách (màn 2) thì ẩn ô Sách.
  ui.bookHud.hidden = state.books.length === 0;
  ui.books.textContent = `${state.booksCollected}/${state.books.length}`;
  if (sameRun && state.booksCollected > lastBooks) replayAnimation(ui.bookHud, 'is-bumped');
  lastBooks = state.booksCollected;
  updateBookIcon();
  ui.score.textContent = state.score;
  const percent = Math.max(0, Math.min(100, state.player.x / state.finishX * 100));
  ui.progress.style.width = `${percent}%`;
  // Đấu trường không có quãng đường -> ẩn thanh tiến độ.
  ui.progress.parentElement.hidden = Boolean(LEVEL.arena);
  updateDashHud();
  updateSkillHud();
  updateBossHud();
}

// Một tim: icon ICON_HUD_HEART; chưa tải xong/thiếu thì chữ ♥ tạm.
function makeHeart() {
  const icon = document.createElement('img');
  icon.alt = '';
  if (setSpriteImage(icon, HEART_ICON)) return icon;
  const glyph = document.createElement('span');
  glyph.className = 'status-bar__heart-glyph';
  glyph.textContent = '♥';
  return glyph;
}

// Chạy lại animation CSS `className` trên `node` (kể cả khi đang chạy dở).
function replayAnimation(node, className) {
  node.classList.remove(className);
  void node.offsetWidth;
  node.classList.add(className);
}

// Ô sách dùng ô đầu của strip bình thư ITEM_BINH_THU (maps_tt.json, nạp sẵn
// trong images.maps.props); chưa tải/thiếu thì giữ chữ 📖 tạm.
function updateBookIcon() {
  if (ui.bookIcon.dataset.ready) return;
  const prop = images.maps.props[BOOK_SPRITE_ID];
  if (!prop?.image) return;
  const frames = prop.asset?.frames || 1;
  ui.bookIcon.style.backgroundImage = `url("${prop.image.src}")`;
  ui.bookIcon.style.backgroundSize = `${frames * 100}% 100%`;
  ui.bookIcon.textContent = '';
  ui.bookIcon.classList.add('status-bar__book-icon--image');
  ui.bookIcon.dataset.ready = '1';
}

// Ô ⏱ trên HUD — main.js gọi mỗi frame; chỉ ghi DOM khi đổi giây.
export function updateTimeHud(seconds) {
  const text = formatTime(seconds);
  if (ui.time.textContent !== text) ui.time.textContent = text;
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

// Gán ảnh asset `id` cho <img>. Ảnh dày (density > 1) gắn `img--hibit` (CSS
// thu nhỏ mượt thay vì pixelated). Thiếu trong manifest -> false.
export function setSpriteImage(img, id) {
  const url = spriteUrl(id);
  if (!url) return false;
  img.classList.toggle('img--hibit', (getAsset(id)?.density || 1) > 1);
  img.src = url;
  return true;
}

// Nút cảm ứng của chiêu (TT-MOBILE-01) dùng cùng ảnh với ô HUD; ảnh tải
// xong mới hiện (CSS ẩn chữ tạm), lỗi thì giữ chữ.
function setControlIcon(control, id) {
  const icon = document.querySelector(`[data-control="${control}"] .control__icon`);
  if (!icon) return;
  icon.onload = () => { icon.hidden = false; };
  setSpriteImage(icon, id);
}
const SKILL_CONTROLS = { SK_LE_CHAN_ARROW_RAIN: 'arrowRain', SK_TRUNG_NHI_SHADOW: 'shadow' };

// Ô Lướt (mọi màn): lớp phủ + số giây hồi chiêu còn lại của dash.
function updateDashHud() {
  const slot = ui.dashSlot;
  const icon = slot.querySelector('.skill__icon');
  if (!icon.dataset.ready) {
    // Icon lấy theo manifest; chưa có asset (TODO_MISSING) thì giữ chữ tạm.
    icon.onload = () => { icon.hidden = false; };
    if (setSpriteImage(icon, DASH_ICON)) {
      icon.dataset.ready = '1';
      setControlIcon('dash', DASH_ICON);
    }
  }
  const attackIcon = document.querySelector('[data-control="attack"] .control__icon');
  if (attackIcon && !attackIcon.dataset.ready) {
    if (spriteUrl(ATTACK_ICON)) {
      setControlIcon('attack', ATTACK_ICON);
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
      if (setSpriteImage(icon, SKILLS[id].portrait)) {
        icon.dataset.ready = '1';
        if (SKILL_CONTROLS[id]) setControlIcon(SKILL_CONTROLS[id], SKILLS[id].portrait);
      }
    }
    const { left, total, active } = skillTimer(id, skills);
    slot.classList.toggle('skill--active', active);
    slot.querySelector('.skill__cd').style.height = `${left > 0 ? left / total * 100 : 0}%`;
    slot.querySelector('.skill__time').textContent = left > 0 ? Math.ceil(left) : '';
  });
}
