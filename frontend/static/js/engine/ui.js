// DOM refs (HUD, panel) + cập nhật hiển thị. Không chứa logic gameplay.

import { images, spriteUrl } from './assets.js';
import { ATTACK_ICON, DASH_COOLDOWN, DASH_ICON, HEART_ICON } from './config.js';
import { CHAPTER, LEVEL } from './chapter.js';
import { state } from './state.js';
import { getAsset } from './animation.js';
import { formatTime } from './timer.js';

export const ui = {
  health: document.getElementById('healthHearts'),
  // Máu + vật phẩm thu thập nằm ở góc trên-trái khung chơi (TT-HUD-02), không còn trên thanh HUD.
  items: document.getElementById('itemValue'),
  itemHud: document.getElementById('itemHud'),
  itemIcon: document.getElementById('itemIcon'),
  score: document.getElementById('scoreValue'),
  progress: document.getElementById('progressBar'),
  loading: document.getElementById('loadingPanel'),
  loadingText: document.getElementById('loadingText'),
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
  // Khe kỹ năng: ô kỹ năng/buff + mọi phần tử gắn `data-skill` (ô HUD, dòng
  // trợ giúp, nút cảm ứng) — chỉ hiện với phần thưởng đã nhận.
  skillBar: document.getElementById('skillBar'),
  dashSlot: document.getElementById('dashSlot'),
  skillNodes: [...document.querySelectorAll('[data-skill]')],
  skillSlots: [...document.querySelectorAll('.skill[data-skill]')],
  // Ô boss góc trên-phải (nhãn + dãy nấc) — chương cập nhật qua CHAPTER.hooks.updateHud.
  bossHud: document.getElementById('bossHud'),
  bossLabel: document.getElementById('bossHudLabel'),
  bossPips: [...document.querySelectorAll('#bossHudPips i')]
};

let messageTimer = 0;
let lastRenderedHealth = -1;
// Nguồn ảnh tim lúc vẽ lần trước — HUD có thể vẽ trước khi asset tải xong,
// tải xong icon thì phải vẽ lại dù máu không đổi.
let lastHeartUrl = null;
// Hiệu ứng mất/hồi máu, nhặt vật phẩm (TT-HUD-02) chỉ chạy khi số đổi TRONG cùng
// một lượt chơi — state bị thay mỗi lần chơi lại (máu đầy lại) thì không chạy.
let lastHudState = null;
let lastItems = 0;

export function showMessage(text, duration = 1900) {
  ui.message.textContent = text;
  ui.message.classList.add('message--visible');
  messageTimer = duration / 1000;
}

// level-flow.js gọi hàm này mỗi frame để đếm ngược rồi tự ẩn message — giữ
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
  // Màn không có vật phẩm thu thập thì ẩn ô đó.
  ui.itemHud.hidden = state.items.length === 0;
  ui.items.textContent = `${state.itemsCollected}/${state.items.length}`;
  if (sameRun && state.itemsCollected > lastItems) replayAnimation(ui.itemHud, 'is-bumped');
  lastItems = state.itemsCollected;
  updateItemIcon();
  ui.score.textContent = state.score;
  const percent = Math.max(0, Math.min(100, state.player.x / state.finishX * 100));
  ui.progress.style.width = `${percent}%`;
  // Đấu trường không có quãng đường -> ẩn thanh tiến độ.
  ui.progress.parentElement.hidden = Boolean(LEVEL.arena);
  updateDashHud();
  updateSkillHud();
  CHAPTER.hooks?.updateHud?.();
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

// Ô vật phẩm dùng ô đầu của strip vật phẩm (CHAPTER.item.sprite — prop trong
// manifest map, nạp sẵn trong images.maps.props); chưa tải/thiếu thì giữ chữ tạm.
function updateItemIcon() {
  if (ui.itemIcon.dataset.ready) return;
  const prop = images.maps.props[CHAPTER.item?.sprite];
  if (!prop?.image) return;
  const frames = prop.asset?.frames || 1;
  ui.itemIcon.style.backgroundImage = `url("${prop.image.src}")`;
  ui.itemIcon.style.backgroundSize = `${frames * 100}% 100%`;
  ui.itemIcon.textContent = '';
  ui.itemIcon.classList.add('status-bar__item-icon--image');
  ui.itemIcon.dataset.ready = '1';
}

// Ô ⏱ trên HUD — main.js gọi mỗi frame; chỉ ghi DOM khi đổi giây.
export function updateTimeHud(seconds) {
  const text = formatTime(seconds);
  if (ui.time.textContent !== text) ui.time.textContent = text;
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

// Khe kỹ năng (ENGINE-01): ô HUD + nút cảm ứng theo CHAPTER.skills.defs —
// chân dung `portrait`, khe `slot` (nút cảm ứng data-control), hồi chiêu /
// thời gian hiệu lực lấy từ `timer(skills)` của chương.
function updateSkillHud() {
  const skills = state.skills;
  ui.skillNodes.forEach(node => { node.hidden = !skills?.owned.has(node.dataset.skill); });
  if (!skills) return;
  const defs = CHAPTER.skills.defs;
  ui.skillSlots.forEach(slot => {
    const id = slot.dataset.skill;
    if (!skills.owned.has(id)) return;
    const def = defs[id];
    const icon = slot.querySelector('.skill__icon');
    if (!icon.dataset.ready) {
      // Chân dung lấy theo manifest (tải xong manifest mới có) — gán 1 lần.
      if (setSpriteImage(icon, def.portrait)) {
        icon.dataset.ready = '1';
        if (def.slot) setControlIcon(def.slot, def.portrait);
      }
    }
    const { left, total, active } = def.timer(skills);
    slot.classList.toggle('skill--active', active);
    slot.querySelector('.skill__cd').style.height = `${left > 0 ? left / total * 100 : 0}%`;
    slot.querySelector('.skill__time').textContent = left > 0 ? Math.ceil(left) : '';
  });
}
