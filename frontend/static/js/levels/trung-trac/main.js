// Entry point: wiring giữa asset loading, state, input, physics, render.

import { images, loadAssets } from './assets.js';
import { state, setState, createLevelState } from './state.js';
import { ui, showMessage, updateHud } from './ui.js';
import { clearInput, bindInput } from './input.js';
import { update, endGame } from './physics.js';
import { draw } from './render.js';
import { BACKDROP_ROOT } from './config.js';

let lastTime = 0;

function resetGame(startImmediately = true) {
  setState(createLevelState());
  state.running = startImmediately;
  state.paused = false;
  ui.question.classList.remove('panel--visible');
  ui.end.classList.remove('panel--visible');
  ui.loading.classList.toggle('panel--visible', !startImmediately);
  clearInput();
  updateHud();
  showMessage('Thu thập 5 cuốn sách và vượt qua các chướng ngại vật.', 2600);
}

function frame(timestamp) {
  const dt = Math.min(.032, Math.max(0, (timestamp - lastTime) / 1000 || 0));
  lastTime = timestamp;
  if (state) update(dt);
  if (state) draw(timestamp / 1000);
  requestAnimationFrame(frame);
}

async function initAssets() {
  const missing = await loadAssets();
  const notices = [];
  if (missing.missingBackdrops) notices.push(`thiếu ${missing.missingBackdrops} lớp nền (đang dùng màu tạm)`);
  if (!images.obstacles) notices.push('thiếu contains obstacles.png');
  if (missing.missingObstacleSprites) notices.push(`thiếu ${missing.missingObstacleSprites} ảnh chướng ngại vật`);
  if (missing.missingItems) notices.push(`thiếu ${missing.missingItems} ảnh vật phẩm`);
  if (missing.missingAnimations.length) notices.push(`thiếu GIF nhân vật (đang dùng hình tạm): ${missing.missingAnimations.join(', ')}`);
  ui.loadingText.textContent = notices.length
    ? `Đang chạy với placeholder tạm: ${notices.join('; ')}.`
    : 'Đã tải đủ lớp nền, chướng ngại vật, vật phẩm và hoạt ảnh nhân vật.';
  console.info('SUTA backdrop root:', BACKDROP_ROOT);
  console.info('SUTA obstacle loaded:', Boolean(images.obstacles));
  console.info('SUTA player root:', images.playerRoot);
  ui.start.disabled = false;
  draw();
}

bindInput({ onRestart: () => resetGame(true) });

ui.start.addEventListener('click', () => {
  ui.loading.classList.remove('panel--visible');
  resetGame(true);
});
ui.restart.addEventListener('click', () => resetGame(true));

document.querySelectorAll('[data-answer]').forEach(button => {
  button.addEventListener('click', () => {
    const correct = button.dataset.answer === 'correct';
    if (correct) {
      state.score += 500;
      showMessage('Chính xác! Khởi nghĩa Hai Bà Trưng bùng nổ năm 40 SCN.', 3000);
    } else {
      state.health -= 1;
      showMessage('Chưa đúng. Đáp án là năm 40 SCN; bạn mất 1 máu.', 3000);
      if (state.health <= 0) {
        ui.question.classList.remove('panel--visible');
        endGame(false);
        return;
      }
    }
    ui.question.classList.remove('panel--visible');
    state.paused = false;
    updateHud();
  });
});

setState(createLevelState());
updateHud();
initAssets();
requestAnimationFrame(frame);
