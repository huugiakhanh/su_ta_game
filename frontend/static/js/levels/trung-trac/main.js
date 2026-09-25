// Entry point: wiring giữa asset loading, state, input, physics, render.

import { images, loadAssets } from './assets.js';
import { state, setState, createLevelState } from './state.js';
import { ui, showMessage, updateHud } from './ui.js';
import { clearInput, bindInput } from './input.js';
import { update, endGame } from './physics.js';
import { draw, fitCanvas } from './render.js';
import { BACKDROP_ROOT, SPRITE_8BIT_ROOT } from './config.js';

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
  if (missing.missingObstacleSprites) notices.push(`thiếu ${missing.missingObstacleSprites} ảnh chướng ngại vật`);
  if (missing.missingItems) notices.push(`thiếu ${missing.missingItems} ảnh vật phẩm`);
  if (!missing.manifestLoaded) notices.push('không tải được manifest sprite 8-bit (nhân vật dùng hộp tạm)');
  if (missing.missingSprites8.length) notices.push(`thiếu sprite 8-bit: ${missing.missingSprites8.join(', ')}`);
  ui.loadingText.textContent = notices.length
    ? `Đang chạy với placeholder tạm: ${notices.join('; ')}.`
    : 'Đã tải đủ lớp nền, chướng ngại vật, vật phẩm và hoạt ảnh nhân vật.';
  console.info('SUTA backdrop root:', BACKDROP_ROOT);
  console.info('SUTA sprite 8-bit root:', SPRITE_8BIT_ROOT, Object.keys(images.sprites8));
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

// Chế độ xem sprite (?viewer=1): soát bộ sprite 8-bit theo manifest, không
// chạy màn chơi. Nạp động để trang chơi bình thường không tải viewer.js.
const viewerMode = new URLSearchParams(window.location.search).get('viewer') === '1';

if (viewerMode) {
  import('./viewer.js').then(module => module.startViewer());
} else {
  // Letterbox bội số nguyên: tính lại khi đổi cỡ cửa sổ / xoay màn hình.
  fitCanvas();
  window.addEventListener('resize', fitCanvas);
  window.addEventListener('orientationchange', fitCanvas);
  setState(createLevelState());
  updateHud();
  initAssets();
  requestAnimationFrame(frame);
}
