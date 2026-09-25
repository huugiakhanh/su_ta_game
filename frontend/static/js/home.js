(() => {
  'use strict';

  let selectedChapter = null;

  function setAuthMessage(message, color = '#ffcc00') {
    const messageElement = document.getElementById('authMessage');
    if (messageElement) {
      messageElement.textContent = message;
      messageElement.style.color = color;
    }
  }

  function updateStartButton(chapterNumber) {
    const startButton = document.querySelector('.center-menu .btn-main');
    if (!startButton) return;
    startButton.innerHTML = chapterNumber
      ? `⚔️ BẮT ĐẦU CHƠI<br><span>(CHƯƠNG ${chapterNumber})</span>`
      : '⚔️ BẮT ĐẦU CHƠI';
  }
  // cập nhật sau xóa cái này đi 
  function showUpdateNotice(btn) {
    const originalText = btn.innerHTML;
    
    // Đổi chữ và khóa bấm tạm thời
    btn.innerHTML = "⏳ ĐANG CẬP NHẬT...";
    btn.style.opacity = "0.5";
    btn.disabled = true;

    // Trả lại chữ cũ sau 1.5 giây
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.opacity = "";
        btn.disabled = false;
    }, 1500);
  }

  window.openChapterModal = function openChapterModal() {
    const modal = document.getElementById('chapterModalOverlay');
    if (!modal) return;
    modal.hidden = false;
    document.body.classList.add('chapter-modal-open');
    modal.querySelector('.chapter-modal-close')?.focus();
  };

  window.closeChapterModal = function closeChapterModal() {
    const modal = document.getElementById('chapterModalOverlay');
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove('chapter-modal-open');
  };

  window.moBangDangNhap = function moBangDangNhap() {
    document.getElementById('loginModal').style.display = 'block';
    setAuthMessage('');
  };

  window.doiTab = function doiTab(type) {
    const loginTab = document.getElementById('tabLoginBtn');
    const registerTab = document.getElementById('tabRegBtn');
    const loginForm = document.getElementById('formLogin');
    const registerForm = document.getElementById('formRegister');
    const isLogin = type === 'login';

    loginTab.style.background = isLogin ? '#5d4037' : '#2b1d14';
    loginTab.style.color = isLogin ? '#f1c40f' : '#aaa';
    registerTab.style.background = isLogin ? '#2b1d14' : '#5d4037';
    registerTab.style.color = isLogin ? '#aaa' : '#f1c40f';
    loginForm.style.display = isLogin ? 'block' : 'none';
    registerForm.style.display = isLogin ? 'none' : 'block';
    setAuthMessage('');
  };

  async function postAuth(path, body) {
    const response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return response.json();
  }

  window.xacNhanDangNhap = async function xacNhanDangNhap() {
    setAuthMessage('Đang kiểm tra tài khoản...');
    try {
      const data = await postAuth('/login', {
        username: document.getElementById('loginUser').value,
        password: document.getElementById('loginPass').value,
      });
      if (data.status !== 'success') {
        setAuthMessage(data.message, '#ff6b6b');
        return;
      }

      document.getElementById('loginModal').style.display = 'none';
      document.querySelector('.info-text h3').textContent = data.name;
      document.querySelector('.info-text div').textContent = `Cấp ${data.level}`;
      document.querySelector('.avatar').textContent = '';
      document.querySelectorAll('.res-item')[0].innerHTML = `🪙 ${data.gold} <button class="btn-plus">+</button>`;
      document.querySelectorAll('.res-item')[1].innerHTML = `💎 ${data.gems} <button class="btn-plus">+</button>`;
    } catch (_) {
      setAuthMessage('Không thể kết nối đến máy chủ!', '#ff6b6b');
    }
  };

  window.xacNhanDangKy = async function xacNhanDangKy() {
    const name = document.getElementById('regName').value;
    const username = document.getElementById('regUser').value;
    const password = document.getElementById('regPass').value;
    if (!name || !username || !password) {
      setAuthMessage('Vui lòng điền đủ thông tin!', '#ff6b6b');
      return;
    }

    setAuthMessage('Đang tạo tài khoản mới...');
    try {
      const data = await postAuth('/register', { name, username, password });
      if (data.status === 'success') {
        setAuthMessage(data.message, '#51cf66');
        setTimeout(() => window.doiTab('login'), 1500);
      } else {
        setAuthMessage(data.message, '#ff6b6b');
      }
    } catch (_) {
      setAuthMessage('Không thể kết nối đến máy chủ!', '#ff6b6b');
    }
  };

  window.chonTamChuong = function chonTamChuong(chapterNumber, element) {
    const okButton = document.getElementById('btnXacNhanChuong');
    if (selectedChapter === chapterNumber) {
      selectedChapter = null;
      element.classList.remove('selected');
    } else {
      selectedChapter = chapterNumber;
      document.querySelectorAll('.chapter-modal-card').forEach(card => card.classList.remove('selected'));
      element.classList.add('selected');
    }
    okButton.disabled = selectedChapter === null;
    okButton.style.opacity = selectedChapter === null ? '0.5' : '1';
    okButton.style.cursor = selectedChapter === null ? 'not-allowed' : 'pointer';
  };

  window.clickChuongKhoa = function clickChuongKhoa() {
    selectedChapter = null;
    document.querySelectorAll('.chapter-modal-card').forEach(card => card.classList.remove('selected'));
    const okButton = document.getElementById('btnXacNhanChuong');
    okButton.disabled = true;
    okButton.style.opacity = '0.5';
    okButton.style.cursor = 'not-allowed';
  };

 window.xacNhanChonChuong = function xacNhanChonChuong() {
    if (!selectedChapter) return;
    localStorage.setItem('sutaSelectedChapter', String(selectedChapter));
    updateStartButton(selectedChapter);

    // 1. Đóng Modal Chọn Chương
    window.closeChapterModal();

    // 2. Mở Modal Chọn Tướng
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
    window.openChapterModal();
  };

  window.playHeroLevel = function playHeroLevel(routeUrl) {
    window.location.href = routeUrl;
  };

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      window.closeChapterModal();
      window.closeHeroSelectModal();
    }
  });

  updateStartButton(localStorage.getItem('sutaSelectedChapter'));


})();
