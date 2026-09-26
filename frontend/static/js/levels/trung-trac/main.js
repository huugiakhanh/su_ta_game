// Entry point: wiring giữa asset loading, state, input, physics, render.

import { images, loadAssets } from './assets.js';
import { state, setState, createLevelState } from './state.js';
import { ui, showMessage, updateHud } from './ui.js';
import { clearInput, bindInput } from './input.js';
import { update, endGame } from './physics.js';
import { draw, fitCanvas } from './render.js';
import { MAP_8BIT_ROOT, SPRITE_8BIT_ROOT, LEVEL, setLevel } from './config.js';
import { LEVEL_URLS, requireLevel } from './progress.js';
import { initDialogue, closeDialogue } from './dialogue.js';

let lastTime = 0;
const params = new URLSearchParams(window.location.search);
// Màn đang chơi lấy từ `data-level` của trang (route truyền vào) — cùng bộ
// module cho mọi màn (TT-NPC-01). Chưa hoàn thành màn trước -> requireLevel()
// chuyển về màn 1 và trả null (`?debug=1` vào thẳng với dữ liệu giả lập).
setLevel(Number(document.body.dataset.level) || 1);
const progress = requireLevel(LEVEL.id);
// `?layout=p2`: layout thử 6 vật cản P2 + cầu qua hố (TT-MAP-01), chỉ màn 1.
// `score`: điểm mang sang từ màn trước (chơi lại màn thì quay về số này — D12).
const levelOptions = {
  layout: LEVEL.id === 1 && params.get('layout') === 'p2' ? 'p2' : null,
  score: LEVEL.id > 1 && progress ? progress.score : 0
};
const INTRO_MESSAGES = {
  1: 'Thu thập 5 cuốn sách, vượt chướng ngại và hạ kiệu quan.',
  2: LEVEL.title
};

function resetGame(startImmediately = true) {
  closeDialogue();
  setState(createLevelState(levelOptions));
  state.running = startImmediately;
  state.paused = false;
  ui.question.classList.remove('panel--visible');
  ui.end.classList.remove('panel--visible');
  ui.next.hidden = true;
  ui.restart.hidden = false;
  ui.loading.classList.toggle('panel--visible', !startImmediately);
  clearInput();
  updateHud();
  showMessage(INTRO_MESSAGES[LEVEL.id], 2600);
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
  if (missing.missingMaps.length) notices.push(`thiếu nền 8-bit: ${missing.missingMaps.join(', ')} (đang dùng màu tạm)`);
  if (missing.missingItems) notices.push(`thiếu ${missing.missingItems} ảnh vật phẩm`);
  if (!missing.manifestLoaded) notices.push('không tải được manifest sprite 8-bit (nhân vật dùng hộp tạm)');
  if (missing.missingSprites8.length) notices.push(`thiếu sprite 8-bit: ${missing.missingSprites8.join(', ')}`);
  ui.loadingText.textContent = notices.length
    ? `Đang chạy với placeholder tạm: ${notices.join('; ')}.`
    : 'Đã tải đủ lớp nền, chướng ngại vật, vật phẩm và hoạt ảnh nhân vật.';
  console.info('SUTA map 8-bit root:', MAP_8BIT_ROOT, Object.keys(images.maps.layers));
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
// Hoàn thành màn -> sang màn sau (tiến trình đã ghi trong endGame).
ui.next.addEventListener('click', () => { window.location.href = LEVEL_URLS[LEVEL.id + 1]; });
// Trả lời sai tới hết máu trong hội thoại màn 2 -> thua theo luật hiện tại.
initDialogue({ onDefeat: () => endGame(false) });

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
const viewerMode = params.get('viewer') === '1';

if (!progress) {
  // Đang chuyển về màn 1 (chưa hoàn thành màn trước) — không khởi động màn.
} else if (viewerMode) {
  import('./viewer.js').then(module => module.startViewer());
} else {
  // Letterbox bội số nguyên: tính lại khi đổi cỡ cửa sổ / xoay màn hình.
  fitCanvas();
  window.addEventListener('resize', fitCanvas);
  window.addEventListener('orientationchange', fitCanvas);
  setState(createLevelState(levelOptions));
  updateHud();
  initAssets();
  requestAnimationFrame(frame);
}
