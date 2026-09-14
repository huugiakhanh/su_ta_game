// Input: bàn phím + nút cảm ứng mobile, gộp vào chung 1 state `keys`/`pressed`.

export const keys = { left: false, right: false, jump: false, dash: false, attack: false };
export const pressed = { jump: false, dash: false, attack: false };

export function setKey(code, down) {
  const mapping = {
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right',
    ArrowUp: 'jump', KeyW: 'jump', Space: 'jump',
    ArrowDown: 'dash', KeyS: 'dash', ShiftLeft: 'dash', ShiftRight: 'dash', KeyK: 'dash',
    KeyJ: 'attack'
  };
  const action = mapping[code];
  if (!action) return false;
  if (down && !keys[action] && (action === 'jump' || action === 'dash' || action === 'attack')) pressed[action] = true;
  keys[action] = down;
  return true;
}

export function clearInput() {
  Object.keys(keys).forEach(key => { keys[key] = false; });
  pressed.jump = false;
  pressed.dash = false;
  pressed.attack = false;
  document.querySelectorAll('.control').forEach(button => button.classList.remove('is-pressed'));
}

// Gắn toàn bộ listener bàn phím/cảm ứng. `onRestart` được main.js truyền vào
// vì phím R gọi resetGame() — input.js không cần biết resetGame là gì.
export function bindInput({ onRestart }) {
  window.addEventListener('keydown', event => {
    if (event.code === 'KeyR') {
      onRestart();
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
      if (!keys[action] && (action === 'jump' || action === 'dash' || action === 'attack')) pressed[action] = true;
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
