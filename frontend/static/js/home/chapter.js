// Cửa sổ chọn chương → chọn tướng (tải khi gọi openChapterModal() — HOME-LAZY-01).
// HTML: components/home/chapter.html, CSS: css/home/chapter.css.
// Hiện chưa có nút nào trên trang chủ mở cửa sổ này.

let selectedChapter = null;

export function init() {
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      window.closeChapterModal();
      window.closeHeroSelectModal();
    }
  });
}

export function open() {
  const modal = document.getElementById('chapterModalOverlay');
  if (!modal) return;
  modal.hidden = false;
  document.body.classList.add('chapter-modal-open');
  modal.querySelector('.chapter-modal-close')?.focus();
}

window.closeChapterModal = function closeChapterModal() {
  const modal = document.getElementById('chapterModalOverlay');
  if (!modal) return;
  modal.hidden = true;
  document.body.classList.remove('chapter-modal-open');
};

window.chonTamChuong = function chonTamChuong(chapterNumber, element) {
  const okButton = document.getElementById('btnXacNhanChuong');
  if (selectedChapter === chapterNumber) {
    selectedChapter = null;
    element.classList.remove('selected');
  } else {
    selectedChapter = chapterNumber;
    document.querySelectorAll('.chapter-modal-card').forEach((card) => card.classList.remove('selected'));
    element.classList.add('selected');
  }
  okButton.disabled = selectedChapter === null;
  okButton.style.opacity = selectedChapter === null ? '0.5' : '1';
  okButton.style.cursor = selectedChapter === null ? 'not-allowed' : 'pointer';
};

window.clickChuongKhoa = function clickChuongKhoa() {
  selectedChapter = null;
  document.querySelectorAll('.chapter-modal-card').forEach((card) => card.classList.remove('selected'));
  const okButton = document.getElementById('btnXacNhanChuong');
  okButton.disabled = true;
  okButton.style.opacity = '0.5';
  okButton.style.cursor = 'not-allowed';
};

window.xacNhanChonChuong = function xacNhanChonChuong() {
  if (!selectedChapter) return;
  localStorage.setItem('sutaSelectedChapter', String(selectedChapter));
  window.closeChapterModal();
  window.openHeroSelectModal();
};

window.openHeroSelectModal = function openHeroSelectModal() {
  const heroModal = document.getElementById('heroSelectModal');
  if (!heroModal) return;
  heroModal.hidden = false;
  document.body.classList.add('chapter-modal-open');
};

window.closeHeroSelectModal = function closeHeroSelectModal() {
  const heroModal = document.getElementById('heroSelectModal');
  if (!heroModal) return;
  heroModal.hidden = true;
  document.body.classList.remove('chapter-modal-open');
};

window.backToChapterModal = function backToChapterModal() {
  window.closeHeroSelectModal();
  open();
};

window.playHeroLevel = function playHeroLevel(routeUrl) {
  window.location.href = routeUrl;
};
