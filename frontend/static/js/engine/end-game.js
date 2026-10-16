// Kết thúc màn: thắng/thua, ghi tiến trình chương, panel kết thúc + thời gian
// qua màn/chương + kỷ lục (TT-TIME-01, SUTA-DB-01).

import { state } from './state.js';
import { ui } from './ui.js';
import { clearInput } from './input.js';
import { GOLD_ICON_URL } from './config.js';
import { CHAPTER, LEVEL, levelIds, isLastLevel } from './chapter.js';
import { readProgress, saveProgress, submitLevelRecord } from './progress.js';
import { formatTime, levelTime } from './timer.js';
import { playSfx, playMusic } from './audio.js';

export function endGame(won) {
  // Thua: render phát animation `death` một lần tính từ mốc này (cùng đồng
  // hồ với timestamp requestAnimationFrame mà draw() nhận).
  if (!won) state.player.deathTime = performance.now() / 1000;
  state.won = true;
  state.running = false;
  clearInput();
  if (!won) playSfx('death');
  playMusic(won ? 'win' : 'lose');
  // Hoàn thành màn: ghi tiến trình trước khi hiện panel, rồi mời sang màn sau
  // (D11). Màn 1 ghi tiến trình MỚI (xoá phần của lượt trước — các màn sau phải
  // chơi lại); màn sau giữ dữ liệu màn trước + phần thưởng đã ghi khi trả lời đúng.
  const toNextLevel = won;
  // TT-TIME-01: chốt thời gian màn; điểm của riêng màn = điểm cuối − điểm mang
  // sang (đọc tiến trình TRƯỚC khi ghi đè).
  const seconds = levelTime();
  const levelScore = state.score - (LEVEL.id === 1 ? 0 : readProgress().score);
  state.levelCleared = won;
  let progress = null;
  if (won && LEVEL.id === 1) {
    const flags = Object.fromEntries(levelIds().map(id => [`level${id}Complete`, id === 1]));
    progress = saveProgress({
      score: state.score, books: state.itemsCollected, ...flags, rewards: [],
      times: { 1: seconds }
    });
  } else if (won) {
    progress = saveProgress({
      score: state.score, [`level${LEVEL.id}Complete`]: true, times: { ...readProgress().times, [LEVEL.id]: seconds }
    });
  }
  ui.next.hidden = !toNextLevel;
  ui.next.textContent = `Sang Màn ${LEVEL.id + 1}`;
  ui.restart.hidden = toNextLevel;
  // Đấu trường: thua thì đánh lại trận từ đầu (máu đầy, điểm mang sang từ màn trước).
  ui.restart.textContent = LEVEL.arena ? 'Đánh lại' : 'Chơi lại';
  ui.endTitle.textContent = won ? `Hoàn thành ${LEVEL.title}` : 'Bạn đã thất bại';
  ui.endText.textContent = won ? LEVEL.summary(state) : `Điểm đạt được: ${state.score}. Hãy thử lại nhé.`;
  // Hết chương (thắng màn cuối): panel kết chương + "Chơi lại chương" /
  // "Về trang chủ" thay cho nút sang màn sau.
  const chapterEnd = won && isLastLevel();
  ui.replayChapter.hidden = !chapterEnd;
  ui.home.hidden = !chapterEnd;
  if (chapterEnd) {
    ui.next.hidden = true;
    ui.endTitle.textContent = CHAPTER.chapterEnd.title;
    ui.endText.textContent = CHAPTER.chapterEnd.text(state.score);
  }
  ui.endTime.hidden = !won;
  if (won) {
    const status = showLevelTime(seconds, progress.times, chapterEnd);
    submitLevelRecord(LEVEL.id, seconds, levelScore, state.stats).then(({ status: result, reward }) => {
      status.textContent = RECORD_STATUS[result];
      if (reward) showRecordReward(reward);
    });
  }
  ui.end.classList.add('panel--visible');
}

const RECORD_STATUS = {
  saved: 'Đã lưu kỷ lục lên bảng xếp hạng.',
  guest: 'Đăng nhập ở trang chủ để lưu kỷ lục lên bảng xếp hạng.',
  skipped: 'Lượt chơi thử — không lưu kỷ lục.',
  error: 'Chưa lưu được kỷ lục (lỗi kết nối).'
};

// Vàng/KC + thành tựu mới server trả về khi lưu kỷ lục (SUTA-DB-01).
// Vàng hiện icon (GOLD_ICON_URL) trước số; lỗi tải ảnh thì chữ "+N vàng".
function showRecordReward({ gold_gained: gold, gems_gained: gems, new_achievements: achievements = [] }) {
  if (!gold && !gems && !achievements.length) return;
  if (gold || gems) {
    const line = document.createElement('p');
    line.className = 'end-time__reward';
    if (gold) {
      const icon = document.createElement('img');
      icon.className = 'end-time__gold';
      icon.alt = 'Vàng';
      const amount = document.createTextNode(`+${gold}`);
      icon.addEventListener('error', () => {
        icon.remove();
        amount.textContent = `+${gold} vàng`;
      }, { once: true });
      icon.src = GOLD_ICON_URL;
      line.append(icon, amount);
    }
    if (gems) line.append(`${gold ? ' · ' : ''}+${gems} kim cương`);
    ui.endTime.append(line);
  }
  achievements.forEach(({ icon, name }) => {
    const line = document.createElement('p');
    line.className = 'end-time__achievement';
    line.textContent = `${icon} Thành tựu mới: ${name}`;
    ui.endTime.append(line);
  });
  playSfx('reward');
}

// Màn giữa chương: "Thời gian: mm:ss". Hết chương: thời gian từng màn + tổng
// (màn thiếu số — vào thẳng bằng ?debug=1 — hiện "—"). Trả về dòng trạng thái lưu.
function showLevelTime(seconds, times, chapterEnd) {
  const box = ui.endTime;
  box.replaceChildren();
  if (chapterEnd) {
    const list = document.createElement('ul');
    list.className = 'end-time__list';
    let total = 0;
    levelIds().forEach(level => {
      const time = times[level];
      if (time) total += time;
      const item = document.createElement('li');
      item.textContent = `Màn ${level}: ${time ? formatTime(time) : '—'}`;
      list.append(item);
    });
    const totalItem = document.createElement('li');
    totalItem.className = 'end-time__total';
    totalItem.textContent = `Tổng chương: ${formatTime(total)}`;
    list.append(totalItem);
    box.append(list);
  } else {
    const line = document.createElement('p');
    line.className = 'end-time__value';
    line.textContent = `Thời gian: ${formatTime(seconds)}`;
    box.append(line);
  }
  const status = document.createElement('p');
  status.className = 'end-time__status';
  status.textContent = 'Đang lưu kỷ lục…';
  box.append(status);
  return status;
}
