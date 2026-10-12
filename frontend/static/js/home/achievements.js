// Thành tựu (SUTA-DB-01; tải khi cần — HOME-LAZY-01).
// HTML: components/home/achievements.html, CSS: css/home/board.css.
import { goldIcon, home, messageRow, tableRow } from './shared.js';

export async function open() {
  document.getElementById('achievement-modal').style.display = 'flex';
  const tbody = document.getElementById('achievement-table-body');
  try {
    const result = await fetch('/api/game/achievements').then((response) => response.json());
    if (result.status !== 'success') throw new Error(result.message);
    renderAchievements(result.data);
  } catch (error) {
    console.error('Lỗi lấy danh sách thành tựu:', error);
    messageRow(tbody, 5, 'Không tải được thành tựu');
  }
}

function rewardNodes(gold, gems) {
  const nodes = [];
  if (gold) nodes.push(goldIcon(), ` ${gold}`);
  if (gems) nodes.push(`${nodes.length ? ' ' : ''}💎 ${gems}`);
  return nodes.length ? nodes : ['—'];
}

function renderAchievements(list) {
  const tbody = document.getElementById('achievement-table-body');
  tbody.innerHTML = '';
  list.forEach((item) => {
    const row = tableRow([
      { text: item.icon, className: 'achievement-icon' },
      { text: item.name },
      { text: item.description, className: 'achievement-desc' },
      { nodes: rewardNodes(item.reward_gold, item.reward_gems), className: 'achievement-reward' },
      item.unlocked
        ? { text: `✅ ${new Date(item.unlocked_at).toLocaleDateString('vi-VN')}`, className: 'achievement-status--done' }
        : { text: '🔒 Chưa mở' },
    ]);
    row.classList.toggle('is-locked', !item.unlocked);
    tbody.appendChild(row);
  });
  const unlocked = list.filter((item) => item.unlocked).length;
  document.getElementById('achievement-count').textContent = `${unlocked}/${list.length}`;
  document.getElementById('achievement-hint').textContent = home.user
    ? home.user.name
    : 'Đăng nhập để lưu thành tựu';
}
