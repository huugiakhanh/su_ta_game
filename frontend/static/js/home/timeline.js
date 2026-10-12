// Dòng thời gian chọn nhân vật (HOME-LAZY-01) — HTML: components/home/timeline.html,
// CSS: css/home/timeline.css.
import { showSelectedHero } from './shared.js';

const modal = () => document.getElementById('timeline-modal');

export function open() {
  // Vừa gắn vào trang thì chờ 1 khung hình để hiệu ứng mờ dần (opacity) vẫn chạy.
  requestAnimationFrame(() => modal()?.classList.remove('hidden'));
}

window.closeTimeline = function closeTimeline() {
  modal()?.classList.add('hidden');
};

// Chọn tướng: đổi nút "BẮT ĐẦU CHƠI", lưu localStorage để F5 không mất.
window.selectHero = function selectHero(heroName, routeUrl) {
  showSelectedHero(heroName, routeUrl);
  localStorage.setItem('savedHeroName', heroName);
  localStorage.setItem('savedHeroRoute', routeUrl);
  window.closeTimeline();
};
