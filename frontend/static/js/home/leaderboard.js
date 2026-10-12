// Bảng xếp hạng (SUTA-DB-01, tab Quiz — SUTA-QUIZ-LB; tải khi cần — HOME-LAZY-01).
// HTML: components/home/leaderboard.html, CSS: css/home/board.css.
import { formatTime, home, messageRow, tableRow } from './shared.js';

let leaderboardScope = 'all';

const MEDALS = { 1: '🥇 1', 2: '🥈 2', 3: '🥉 3' };

// Tiêu đề cột theo loại bảng: `game` (toàn game / chương) hoặc `quiz` (SUTA-QUIZ-LB).
const LEADERBOARD_COLUMNS = {
  game: ['HẠNG', 'NGƯỜI CHƠI', 'ĐÃ QUA MÀN', 'TỔNG ĐIỂM', 'THỜI GIAN', 'THÀNH TÍCH'],
  quiz: ['HẠNG', 'NGƯỜI CHƠI', 'CÂU ĐÚNG', 'TỈ LỆ ĐÚNG', 'THỜI GIAN', 'SỐ LƯỢT'],
};

export function init() {
  document.querySelectorAll('.leaderboard-tabs .tab-btn').forEach((tab) => {
    tab.addEventListener('click', () => open(tab.dataset.scope));
  });
}

export async function open(scope = leaderboardScope) {
  leaderboardScope = scope;
  document.querySelectorAll('.leaderboard-tabs .tab-btn').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.scope === scope);
  });
  document.getElementById('leaderboard-modal').style.display = 'flex';
  try {
    const response = await fetch(`/api/game/leaderboard?scope=${encodeURIComponent(scope)}`);
    const result = await response.json();
    if (result.status === 'success' && scope === leaderboardScope) renderLeaderboard(result);
  } catch (error) {
    console.error('Lỗi lấy dữ liệu bảng xếp hạng:', error);
  }
}

function percent(correct, total) {
  return total ? `${Math.round((correct / total) * 100)}%` : '—';
}

function leaderboardCells(kind, player, levelsTotal) {
  if (kind === 'quiz') {
    return [
      { text: `✅ ${player.total_correct.toLocaleString()}/${player.total_questions.toLocaleString()}`, style: 'color: #b22222;' },
      { text: percent(player.total_correct, player.total_questions) },
      { text: `🕒 ${formatTime(player.total_time)}` },
      { text: player.runs },
    ];
  }
  return [
    { text: `${player.levels_passed}/${levelsTotal}` },
    { text: `⭐ ${player.total_score.toLocaleString()}`, style: 'color: #b22222;' },
    { text: `🕒 ${formatTime(player.total_time)}` },
    { text: player.badges || '—' },
  ];
}

function renderLeaderboard({ kind = 'game', data, me, levels_total: levelsTotal }) {
  const tbody = document.getElementById('leaderboard-table-body');
  if (!tbody) return;
  const columns = LEADERBOARD_COLUMNS[kind] || LEADERBOARD_COLUMNS.game;
  const head = document.getElementById('leaderboard-table-head');
  if (head) {
    head.replaceChildren(...columns.map((title) => {
      const th = document.createElement('th');
      th.textContent = title;
      return th;
    }));
  }
  tbody.innerHTML = '';
  if (!data || data.length === 0) {
    messageRow(tbody, columns.length, 'Chưa có dữ liệu xếp hạng');
  } else {
    data.forEach((player) => {
      const top = player.rank <= 3;
      tbody.appendChild(tableRow([
        { text: MEDALS[player.rank] || player.rank, style: top ? 'color: #d32f2f; font-size: 18px;' : '' },
        { text: player.name },
        ...leaderboardCells(kind, player, levelsTotal),
      ]));
    });
  }
  // Hạng của mình do server tính (kể cả ngoài top 10).
  document.getElementById('my-current-rank').textContent = me ? me.rank : 'NO';
  document.getElementById('my-current-name').textContent = home.user ? home.user.name : 'Khách';
  document.getElementById('my-current-score').textContent = kind === 'quiz'
    ? `✅ ${(me ? me.total_correct : 0).toLocaleString()} câu đúng`
    : `⭐ ${(me ? me.total_score : 0).toLocaleString()}`;
}
