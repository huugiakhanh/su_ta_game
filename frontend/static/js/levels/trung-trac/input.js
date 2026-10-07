// Input: bàn phím + nút cảm ứng mobile, gộp vào chung 1 state `keys`/`pressed`.

export const keys = {
  left: false, right: false, jump: false, dash: false, attack: false, arrowRain: false, shadow: false
};
// Hành động kích hoạt 1 lần mỗi lần nhấn (không giữ). arrowRain/shadow = kỹ
// năng màn 3 (phím K/L — TT-BOSS-01, quyết định team Q3: K không còn là dash).
const PRESS_ACTIONS = ['jump', 'dash', 'attack', 'arrowRain', 'shadow'];
export const pressed = { jump: false, dash: false, attack: false, arrowRain: false, shadow: false };
// Cờ lớp debug (F2): hitbox, pivot, tên animation — render.js đọc mỗi frame.
export const debug = { enabled: false };

export function setKey(code, down) {
  const mapping = {
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right',
    ArrowUp: 'jump', KeyW: 'jump', Space: 'jump',
    ArrowDown: 'dash', KeyS: 'dash', ShiftLeft: 'dash', ShiftRight: 'dash',
    KeyJ: 'attack', KeyK: 'arrowRain', KeyL: 'shadow'
  };
  const action = mapping[code];
  if (!action) return false;
  if (down && !keys[action] && PRESS_ACTIONS.includes(action)) pressed[action] = true;
  keys[action] = down;
  return true;
}

export function clearInput() {
  Object.keys(keys).forEach(key => { keys[key] = false; });
  PRESS_ACTIONS.forEach(action => { pressed[action] = false; });
  document.querySelectorAll('.control').forEach(button => button.classList.remove('is-pressed'));
}

// Gắn toàn bộ listener bàn phím/cảm ứng. `onRestart` được main.js truyền vào
// vì phím R gọi resetGame() — input.js không cần biết resetGame là gì.
// `onToggleMute`: phím M bật/tắt âm thanh (TT-AUDIO-01).
export function bindInput({ onRestart, onToggleMute }) {
  window.addEventListener('keydown', event => {
    if (event.code === 'KeyR') {
      onRestart();
      return;
    }
    if (event.code === 'KeyM') {
      if (!event.repeat) onToggleMute();
      return;
    }
    if (event.code === 'F2') {
      event.preventDefault();
      if (!event.repeat) debug.enabled = !debug.enabled;
      return;
    }
    if (setKey(event.code, true)) event.preventDefault();
  });
  window.addEventListener('keyup', event => {
    if (setKey(event.code, false)) event.preventDefault();
  });
  window.addEventListener('blur', clearInput);

  document.querySelectorAll('[data-control]').forEach(button => {
    const action = button.dataset.control;
    const press = event => {
      event.preventDefault();
      if (!keys[action] && PRESS_ACTIONS.includes(action)) pressed[action] = true;
      keys[action] = true;
      button.classList.add('is-pressed');
      button.setPointerCapture?.(event.pointerId);
    };
    const release = event => {
      event.preventDefault();
      keys[action] = false;
      button.classList.remove('is-pressed');
    };
    button.addEventListener('pointerdown', press);
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('contextmenu', event => event.preventDefault());
  });
}
