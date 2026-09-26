// Trang giữ chỗ cho màn chưa làm (TT-NPC-01): màn 3 "Trận Luy Lâu", và màn 2
// trong lúc Phase B chưa xong. Chặn truy cập khi chưa hoàn thành màn trước
// (`?debug=1` vào thẳng), tóm tắt điểm + phần thưởng, nút chơi lại từ màn 1.

import { requireLevel, clearProgress, REWARD_NAMES, LEVEL_URLS } from './progress.js';

const level = Number(document.querySelector('[data-level]')?.dataset.level) || 2;
const progress = requireLevel(level);

if (progress) {
  document.getElementById('progressSummary').textContent =
    `Điểm: ${progress.score} · Binh thư: ${progress.books}/5`;
  const list = document.getElementById('rewardList');
  progress.rewards.forEach(id => {
    const item = document.createElement('li');
    item.textContent = REWARD_NAMES[id] || id;
    list.appendChild(item);
  });
  list.hidden = progress.rewards.length === 0;
}

document.getElementById('replayButton').addEventListener('click', () => {
  clearProgress();
  window.location.href = LEVEL_URLS[1];
});
