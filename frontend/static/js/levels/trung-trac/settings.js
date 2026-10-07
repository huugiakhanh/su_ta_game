// Menu cài đặt trong màn chơi (TT-TIME-01): Tiếp tục, âm lượng Nhạc/Hiệu ứng
// + tắt tiếng, Thoát khỏi màn chơi (hỏi xác nhận). Mở bằng nút ⚙️ trên HUD
// hoặc phím Esc/P (input.js). Khi mở: main.js không gọi update() và không
// đếm giờ, input.js + dialogue.js bỏ qua phím chơi. Cờ riêng, không dùng
// state.paused (của hội thoại) để đóng menu không mở khoá hội thoại đang dở.

import { getVolume, setVolume, isMuted, setMuted, playSfx } from './audio.js';
import { clearInput } from './input.js';

const el = {
  button: document.getElementById('settingsButton'),
  panel: document.getElementById('settingsPanel'),
  main: document.getElementById('settingsMain'),
  confirm: document.getElementById('settingsConfirm'),
  resume: document.getElementById('settingsResume'),
  music: document.getElementById('volumeMusic'),
  musicValue: document.getElementById('volumeMusicValue'),
  sfx: document.getElementById('volumeSfx'),
  sfxValue: document.getElementById('volumeSfxValue'),
  mute: document.getElementById('muteToggle'),
  exit: document.getElementById('settingsExit'),
  exitCancel: document.getElementById('exitCancel'),
  exitConfirm: document.getElementById('exitConfirm')
};

let open = false;

export function isSettingsOpen() {
  return open;
}

// Đồng bộ ô điều khiển với trạng thái âm thanh hiện tại (phím M đổi ngoài menu).
export function syncSettings() {
  const music = Math.round(getVolume('music') * 100);
  const sfx = Math.round(getVolume('sfx') * 100);
  el.music.value = music;
  el.musicValue.textContent = `${music}%`;
  el.sfx.value = sfx;
  el.sfxValue.textContent = `${sfx}%`;
  el.mute.checked = isMuted();
  const label = isMuted() ? 'Cài đặt (Esc) — đang tắt tiếng' : 'Cài đặt (Esc)';
  el.button.setAttribute('aria-label', label);
  el.button.title = label;
  el.button.classList.toggle('hud__settings--muted', isMuted());
}

function showConfirm(on) {
  el.main.hidden = on;
  el.confirm.hidden = !on;
  (on ? el.exitCancel : el.resume).focus();
}

export function openSettings() {
  if (open) return;
  open = true;
  clearInput();
  syncSettings();
  el.panel.classList.add('panel--visible');
  showConfirm(false);
}

export function closeSettings() {
  if (!open) return;
  open = false;
  clearInput();
  el.panel.classList.remove('panel--visible');
  // Bỏ focus để Space (nhảy) không "bấm" lại nút trong menu.
  document.activeElement?.blur?.();
}

export function toggleSettings() {
  if (open) closeSettings();
  else openSettings();
}

export function initSettings() {
  syncSettings();
  el.button.addEventListener('click', () => {
    playSfx('click');
    toggleSettings();
  });
  el.resume.addEventListener('click', () => {
    playSfx('click');
    closeSettings();
  });
  el.music.addEventListener('input', () => {
    setVolume('music', el.music.value / 100);
    syncSettings();
  });
  el.sfx.addEventListener('input', () => {
    setVolume('sfx', el.sfx.value / 100);
    syncSettings();
  });
  // Nghe thử mức hiệu ứng khi thả thanh trượt.
  el.sfx.addEventListener('change', () => playSfx('click'));
  el.mute.addEventListener('change', () => {
    setMuted(el.mute.checked);
    syncSettings();
  });
  el.exit.addEventListener('click', () => {
    playSfx('click');
    showConfirm(true);
  });
  el.exitCancel.addEventListener('click', () => {
    playSfx('click');
    showConfirm(false);
  });
  el.exitConfirm.addEventListener('click', () => {
    window.location.href = '/';
  });
}
