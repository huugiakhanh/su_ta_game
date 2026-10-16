// Entry của engine: boot(chapter) nối asset, state, input, mô phỏng, render
// cho chương được truyền vào (ENGINE-01). `main.js` của mỗi chương chỉ gọi
// boot() với object định nghĩa chương (xem chapter.js của engine).

import { images, loadAssets } from './assets.js';
import { state, setState, createLevelState } from './state.js';
import { ui, showMessage, updateHud, updateTimeHud } from './ui.js';
import { clearInput, bindInput } from './input.js';
import { update } from './level-flow.js';
import { endGame } from './end-game.js';
import { draw, fitCanvas } from './render/index.js';
import { setPlayerGender, PLAYER_SPRITE_ID } from './config.js';
import { LEVEL, setChapter, setLevel } from './chapter.js';
import { levelUrl, requireLevel, clearProgress, syncProgressFromServer } from './progress.js';
import { initDialogue, closeDialogue } from './dialogue.js';
import { initAudio, playMusic, playSfx, registerAudio, setAudioSuspended, toggleMuted } from './audio.js';
import { initSettings, isSettingsOpen, syncSettings, toggleSettings } from './settings.js';
import { levelTime, resetLevelTime, tickLevelTime } from './timer.js';
import { resolveGender } from './hero.js';

let lastTime = 0;
// Đã chọn nhân vật + tải xong asset (TT-HERO-01) — trước đó phím R không làm gì.
let started = false;
let levelOptions = null;
// Máy cảm ứng cầm dọc (TT-MOBILE-01): CSS hiện #rotateOverlay, frame() ngừng
// update() tới khi xoay ngang. Cờ riêng, không dùng state.paused (của hội thoại).
const portraitQuery = window.matchMedia('(pointer: coarse) and (orientation: portrait)');

// Vào chơi thật: thông báo nhiệm vụ + nhạc nền của màn (TT-AUDIO-01; chưa mở
// khoá âm thanh thì phát khi người chơi bấm phím/chạm lần đầu).
function beginPlay() {
  showMessage(LEVEL.introMessage, LEVEL.introMessageTime ?? 2600);
  playMusic(`level${LEVEL.id}`);
}

// `intro` = cảnh chạy vào màn (+ hội thoại với NPC dẫn nếu màn có) — chỉ lần vào
// màn đầu tiên (TT-HERO-01); chơi lại (R / nút) vào thẳng.
function resetGame({ intro = false } = {}) {
  // Đồng hồ màn cộng dồn qua các lượt thua (TT-TIME-01); thắng rồi chơi lại
  // (phím R) là lượt mới -> đếm lại từ 0.
  if (state?.levelCleared) resetLevelTime();
  closeDialogue();
  setState(createLevelState({ ...levelOptions, intro }));
  state.running = true;
  state.paused = false;
  ui.end.classList.remove('panel--visible');
  ui.next.hidden = true;
  ui.restart.hidden = false;
  ui.replayChapter.hidden = true;
  ui.home.hidden = true;
  ui.endTime.hidden = true;
  clearInput();
  updateHud();
  if (state.intro) state.intro.onDone = beginPlay;
  else beginPlay();
}

// Đồng hồ màn (TT-TIME-01) chạy khi đang chơi, kể cả lúc hội thoại/câu hỏi
// (state.paused) — không chạy lúc chọn nhân vật/tải asset (running = false),
// trong cảnh vào màn + hội thoại NPC dẫn (state.intro — TT-HERO-01), sau khi
// kết thúc (won), trong cutscene, khi menu cài đặt mở hoặc cầm dọc.
function countsLevelTime() {
  return state.running && !state.won && !state.cutscene && !state.intro;
}

function frame(timestamp) {
  // Thời gian thật giữa 2 frame (kẹp .25s: tab ẩn thì rAF dừng, quay lại
  // không cộng cả quãng ẩn). Mô phỏng vẫn kẹp .032s như cũ.
  const realDt = Math.min(.25, Math.max(0, (timestamp - lastTime) / 1000 || 0));
  const dt = Math.min(.032, realDt);
  lastTime = timestamp;
  if (state && !portraitQuery.matches && !isSettingsOpen()) {
    if (countsLevelTime()) tickLevelTime(realDt);
    update(dt);
  }
  if (state) {
    draw(timestamp / 1000);
    updateTimeHud(levelTime());
  }
  requestAnimationFrame(frame);
}

async function initAssets(playerSprite) {
  const missing = await loadAssets(playerSprite);
  const notices = [];
  if (missing.missingMaps.length) notices.push(`thiếu ảnh môi trường: ${missing.missingMaps.join(', ')} (đang dùng màu/hộp tạm)`);
  if (!missing.manifestLoaded) notices.push('không tải được manifest sprite (nhân vật dùng hộp tạm)');
  if (missing.missingSprites.length) notices.push(`thiếu sprite: ${missing.missingSprites.join(', ')}`);
  if (notices.length) console.warn('SUTA thiếu asset:', notices);
  // Thiếu asset thì giữ dòng báo trên khung chơi (không chặn chơi); đủ thì ẩn.
  ui.loadingText.textContent = notices.length ? `Đang chạy với placeholder tạm: ${notices.join('; ')}.` : '';
  ui.loading.hidden = !notices.length;
  console.info(`SUTA màn ${LEVEL.id} đã nạp — nền:`, Object.keys(images.maps.layers), 'sprite:', Object.keys(images.sprites));
  draw();
}

// Âm thanh (TT-AUDIO-01): phím M bật/tắt, lựa chọn nhớ trong localStorage.
// Âm lượng + tắt tiếng chỉnh trong menu cài đặt ⚙️ (TT-TIME-01).
function toggleSound() {
  toggleMuted();
  syncSettings();
  playSfx('click');
}

// Khởi động màn chơi của `chapter` (object định nghĩa chương — engine/chapter.js).
export async function boot(chapter) {
  setChapter(chapter);
  registerAudio(chapter.audio);
  portraitQuery.addEventListener?.('change', () => {
    clearInput();
    setAudioSuspended('portrait', portraitQuery.matches);
  });
  const params = new URLSearchParams(window.location.search);
  // Màn đang chơi lấy từ `data-level` của trang (route truyền vào) — cùng bộ
  // module cho mọi màn (TT-NPC-01). Chưa hoàn thành màn trước -> requireLevel()
  // chuyển về màn 1 và trả null (`?debug=1` vào thẳng với dữ liệu giả lập).
  // Đã đăng nhập: lấy tiến trình từ server trước (SUTA-DB-01).
  setLevel(Number(document.body.dataset.level) || 1);
  await syncProgressFromServer();
  const progress = requireLevel(LEVEL.id);
  // `layout`: layout thử `?layout=<LEVEL.testLayout>` của màn (nếu có).
  // `score`: điểm mang sang từ màn trước (chơi lại màn thì quay về số này — D12).
  // `rewards`: phần thưởng đã nhận -> khe kỹ năng (`?debug=1` có đủ).
  levelOptions = {
    layout: LEVEL.testLayout && params.get('layout') === LEVEL.testLayout ? LEVEL.testLayout : null,
    score: LEVEL.id > 1 && progress ? progress.score : 0,
    rewards: progress?.rewards || []
  };

  initAudio();
  setAudioSuspended('portrait', portraitQuery.matches);
  initSettings();

  bindInput({
    onRestart: () => { if (started) resetGame(); },
    onToggleMute: toggleSound,
    onToggleSettings: toggleSettings,
    isBlocked: isSettingsOpen
  });

  // Tiếng bấm cho các nút panel.
  [ui.restart, ui.next, ui.replayChapter, ui.home].forEach(button => {
    button.addEventListener('click', () => playSfx('click'));
  });
  ui.restart.addEventListener('click', () => resetGame());
  // Hoàn thành màn -> sang màn sau (tiến trình đã ghi trong endGame).
  ui.next.addEventListener('click', () => { window.location.href = levelUrl(LEVEL.id + 1); });
  // Hết chương: chơi lại từ màn 1 (xoá tiến trình) hoặc về trang chủ.
  ui.replayChapter.addEventListener('click', () => {
    clearProgress();
    window.location.href = levelUrl(1);
  });
  ui.home.addEventListener('click', () => { window.location.href = '/'; });
  // Trả lời sai tới hết máu trong hội thoại -> thua theo luật hiện tại.
  initDialogue({ onDefeat: () => endGame(false) });

  // Chế độ xem sprite (?viewer=1): soát bộ sprite theo manifest, không
  // chạy màn chơi. Nạp động để trang chơi bình thường không tải viewer.js.
  const viewerMode = params.get('viewer') === '1';

  if (!progress) {
    // Đang chuyển về màn 1 (chưa hoàn thành màn trước) — không khởi động màn.
    return;
  }
  if (viewerMode) {
    import('./viewer.js').then(module => module.startViewer());
    return;
  }
  // Letterbox bội số nguyên: tính lại khi đổi cỡ cửa sổ / xoay màn hình.
  fitCanvas();
  window.addEventListener('resize', fitCanvas);
  window.addEventListener('orientationchange', fitCanvas);
  // Chưa chạy (running = false) trong lúc chọn nhân vật + tải asset; người chơi
  // đứng sẵn ngoài mép trái để cảnh vào màn bắt đầu liền mạch (TT-HERO-01).
  setState(createLevelState({ ...levelOptions, intro: true }));
  updateHud();
  requestAnimationFrame(frame);
  // Nền + sprite khác tải ngay trong lúc chọn nhân vật; sprite người chơi tải
  // khi biết giới tính (TT-HERO-01).
  const playerSprite = resolveGender().then(gender => {
    setPlayerGender(gender);
    return PLAYER_SPRITE_ID;
  });
  const assetsReady = initAssets(playerSprite);
  await playerSprite;
  if (!images.loaded) ui.loading.hidden = false;
  await assetsReady;
  started = true;
  resetGame({ intro: true });
}
