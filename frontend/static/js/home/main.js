// Trang chủ (HOME-LAZY-01): chỉ giữ phần luôn cần khi mở trang — khôi phục đăng nhập,
// vàng/kim cương, nhân vật đã chọn. Mỗi cửa sổ (dòng thời gian, BXH, thành tựu, đăng
// nhập/hồ sơ, chọn chương) chỉ nạp khi BẤM lần đầu (không tải trước khi rê chuột) qua loader.js.
import { loadComponent } from './loader.js';
import { home, showSelectedHero, showUser } from './shared.js';

// Hiện "Đang tải..." nếu cửa sổ chưa sẵn sau 150 ms (lần đầu mở, mạng chậm).
const toast = document.createElement('div');
toast.className = 'home-toast';
toast.setAttribute('role', 'status');
toast.hidden = true;
document.body.appendChild(toast);
let toastTimer = null;

function showToast(text, autoHideMs = 0) {
  toast.textContent = text;
  toast.hidden = false;
  clearTimeout(toastTimer);
  if (autoHideMs) toastTimer = setTimeout(() => { toast.hidden = true; }, autoHideMs);
}

async function openComponent(name, action) {
  const slow = setTimeout(() => showToast('Đang tải...'), 150);
  try {
    const module = await loadComponent(name);
    clearTimeout(slow);
    toast.hidden = true;
    action(module);
  } catch (error) {
    clearTimeout(slow);
    console.error(error);
    showToast('Không tải được, hãy thử lại.', 2500);
  }
}

// Hàm gọi từ onclick trong home.html.
window.openTimeline = () => openComponent('timeline', (module) => module.open());
window.openLeaderboard = (scope) => openComponent('leaderboard', (module) => module.open(scope));
window.openAchievements = () => openComponent('achievements', (module) => module.open());
window.moBangDangNhap = () => openComponent('login', (module) => (home.user ? module.openProfile() : module.openLogin()));
// Chưa có nút nào gọi (nút "CHỌN CHƯƠNG" mở dòng thời gian) — giữ cho cửa sổ chọn chương.
window.openChapterModal = () => openComponent('chapter', (module) => module.open());

// Nhân vật đã chọn ở lần trước (dòng thời gian lưu localStorage).
const savedName = localStorage.getItem('savedHeroName');
const savedRoute = localStorage.getItem('savedHeroRoute');
if (savedName && savedRoute) showSelectedHero(savedName, savedRoute);

// Tải lại trang vẫn giữ đăng nhập: hỏi server session hiện tại.
async function restoreSession() {
  try {
    const data = await fetch('/api/auth/me').then((response) => response.json());
    if (data.status === 'success') showUser(data);
  } catch (_) {
    // Không kết nối được: giữ giao diện khách.
  }
}
restoreSession();
