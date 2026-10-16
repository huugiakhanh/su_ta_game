// Đồng hồ màn (TT-TIME-01). Đếm từ lúc vào trang màn tới lúc thắng, CỘNG DỒN
// qua các lượt thua -> chơi lại (resetGame không xoá). main.js quyết định lúc
// nào được đếm (tickLevelTime) — xem countsLevelTime() ở đó. Tải lại trang thì
// về 0 (module nạp lại). Không import module nào.

let elapsed = 0;

export function tickLevelTime(dt) {
  elapsed += dt;
}

export function levelTime() {
  return elapsed;
}

// Thắng rồi chơi lại màn (phím R) là lượt mới -> đếm lại từ 0.
export function resetLevelTime() {
  elapsed = 0;
}

// Giây -> "mm:ss" (từ 1 giờ: "h:mm:ss"). Làm tròn xuống tới giây.
export function formatTime(seconds) {
  const total = Math.max(0, Math.floor(seconds || 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}
