// DOM refs (HUD, panel) + cập nhật hiển thị. Không chứa logic gameplay.

import { joinAssetPath } from './assets.js';
import { ITEM_ROOT, ITEM_FILES } from './config.js';
import { state } from './state.js';

export const ui = {
  health: document.getElementById('healthHearts'),
  books: document.getElementById('bookValue'),
  score: document.getElementById('scoreValue'),
  progress: document.getElementById('progressBar'),
  loading: document.getElementById('loadingPanel'),
  loadingText: document.getElementById('loadingText'),
  start: document.getElementById('startButton'),
  question: document.getElementById('questionPanel'),
  end: document.getElementById('endPanel'),
  endTitle: document.getElementById('endTitle'),
  endText: document.getElementById('endText'),
  restart: document.getElementById('restartButton'),
  message: document.getElementById('messageBox')
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
  ui.books.textContent = `${state.booksCollected}/5`;
  ui.score.textContent = state.score;
  const percent = Math.max(0, Math.min(100, state.player.x / state.finishX * 100));
  ui.progress.style.width = `${percent}%`;
}
