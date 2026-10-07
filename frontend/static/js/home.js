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

  // function updateStartButton(chapterNumber) {
  //   const startButton = document.querySelector('.center-menu .btn-main');
  //   if (!startButton) return;
  //   startButton.innerHTML = chapterNumber
  //     ? `⚔️ BẮT ĐẦU CHƠI<br><span>(CHƯƠNG ${chapterNumber})</span>`
  //     : '⚔️ BẮT ĐẦU CHƠI';
  // }

  // Hàm Mở Timeline
  window.openTimeline = function openTimeline() {
      const modal = document.getElementById("timeline-modal");
      if(modal) {
          modal.classList.remove("hidden");
      }
  };

  // Hàm Đóng Timeline
  window.closeTimeline = function closeTimeline() {
      const modal = document.getElementById("timeline-modal");
      if(modal) {
          modal.classList.add("hidden");
      }
  };

  // --- CHỨC NĂNG CHỌN TƯỚNG TỪ TIMELINE ---
  window.selectHero = function(heroName, routeUrl) {
      const startBtn = document.getElementById('btn-start-game');
      
      if (startBtn) {
          // 1. Cập nhật đường link cho nút
          startBtn.href = routeUrl;
          
          // 2. Cập nhật giao diện nút (Hiện tên thử thách)
          startBtn.innerHTML = `
              <div>⚔️ BẮT ĐẦU CHƠI</div>
              <span style="font-size: 13px; color: #ffeb3b; font-weight: normal;">(Thử Thách: ${heroName})</span>
          `;
      }

      // 3. Lưu thông tin vào LocalStorage để không bị mất khi F5 tải lại trang
      localStorage.setItem('savedHeroName', heroName);
      localStorage.setItem('savedHeroRoute', routeUrl);

      // 4. Đóng cửa sổ Timeline
      window.closeTimeline();
  };

  // --- TỰ ĐỘNG TẢI LẠI TƯỚNG ĐÃ CHỌN KHI MỞ TRANG ---
  document.addEventListener("DOMContentLoaded", () => {
      const savedName = localStorage.getItem('savedHeroName');
      const savedRoute = localStorage.getItem('savedHeroRoute');
      
      // Nếu trước đó người chơi đã chọn 1 tướng, khôi phục lại hiển thị đó
      if (savedName && savedRoute) {
          const startBtn = document.getElementById('btn-start-game');
          if (startBtn) {
              startBtn.href = savedRoute;
              startBtn.innerHTML = `
                  <div>⚔ BẮT ĐẦU CHƠI</div>
                  <span style="font-size: 13px; color: #ffeb3b; font-weight: normal;">(Thử Thách: ${savedName})</span>
              `;
          }
      }
  });

  // --- BẢNG XẾP HẠNG ---
  window.openLeaderboard = async function openLeaderboard() {
      try {
          const response = await fetch('/api/game/leaderboard');
          const result = await response.json();
          
          if (result.status === 'success') {
              renderLeaderboardUI(result.data);
              document.getElementById('leaderboard-modal').style.display = 'flex';
          }
      } catch (error) {
          console.error('Lỗi lấy dữ liệu bảng xếp hạng:', error);
          document.getElementById('leaderboard-modal').style.display = 'flex';
      }
  };

  function formatTime(totalSeconds) {
      if (!totalSeconds) return "00:00:00";
      const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
      const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
      const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
      return `${h}:${m}:${s}`;
  }

  function renderLeaderboardUI(data) {
      const tbody = document.getElementById('leaderboard-table-body');
      if (!tbody) return;
      tbody.innerHTML = ''; 
      
      // Lấy tên người dùng hiện tại
      const userTextEl = document.querySelector('.info-text h3');
      const currentUserName = userTextEl ? userTextEl.textContent : "KHÁCH TRUY CẬP";
      
      let myRank = "NO";
      let myScore = 0;
      
      if (!data || data.length === 0) {
          tbody.innerHTML = '<tr><td colspan="6" style="padding: 20px; color: #8b4513;">Chưa có dữ liệu xếp hạng</td></tr>';
      } else {
          data.forEach((player) => {
              const tr = document.createElement('tr');
              
              let rankDisplay = player.rank;
              if (player.rank === 1) rankDisplay = '🥇 1';
              else if (player.rank === 2) rankDisplay = '🥈 2';
              else if (player.rank === 3) rankDisplay = '🥉 3';

              tr.innerHTML = `
                  <td style="color: ${player.rank <= 3 ? '#d32f2f' : 'inherit'}; font-size: ${player.rank <= 3 ? '18px' : 'inherit'};">${rankDisplay}</td>
                  <td>${player.name}</td>
                  <td>${player.levels_passed}/12</td>
                  <td style="color: #b22222;">⭐ ${player.total_score.toLocaleString()}</td>
                  <td>🕒 ${formatTime(player.total_time)}</td>
                  <td>...</td> 
              `;
              tbody.appendChild(tr);

              if (player.name === currentUserName) {
                  myRank = player.rank;
                  myScore = player.total_score;
              }
          });
      }

      const rankEl = document.getElementById('my-current-rank');
      const nameEl = document.getElementById('my-current-name');
      const scoreEl = document.getElementById('my-current-score');
      
      if (rankEl) rankEl.textContent = myRank;
      if (nameEl) nameEl.textContent = currentUserName;
      if (scoreEl) scoreEl.textContent = `⭐ ${myScore.toLocaleString()}`;
  }
  // -----------------------

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

  // Tài khoản đang đăng nhập (Flask session — TT-TIME-01); null = khách.
  let currentUser = null;

  function showUser(user) {
    currentUser = user;
    document.querySelector('.info-text h3').textContent = user.name;
    document.querySelector('.info-text div').textContent = `Cấp ${user.level}`;
    document.querySelector('.avatar').textContent = '';
    document.querySelectorAll('.res-item')[0].innerHTML = `🪙 ${user.gold} <button class="btn-plus">+</button>`;
    document.querySelectorAll('.res-item')[1].innerHTML = `💎 ${user.gems} <button class="btn-plus">+</button>`;
  }

  function showGuest() {
    currentUser = null;
    document.querySelector('.info-text h3').textContent = 'KHÁCH TRUY CẬP';
    document.querySelector('.info-text div').textContent = 'Chạm để Đăng nhập';
    document.querySelector('.avatar').textContent = '?';
    document.querySelectorAll('.res-item')[0].innerHTML = '🪙 0 <button class="btn-plus">+</button>';
    document.querySelectorAll('.res-item')[1].innerHTML = '💎 0 <button class="btn-plus">+</button>';
  }

  // Tải lại trang vẫn giữ đăng nhập: hỏi server session hiện tại.
  async function restoreSession() {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      if (data.status === 'success') showUser(data);
    } catch (_) {
      // Không kết nối được: giữ giao diện khách.
    }
  }
  restoreSession();

  window.moBangDangNhap = async function moBangDangNhap() {
    if (currentUser) {
      if (!window.confirm(`Đăng xuất khỏi tài khoản "${currentUser.name}"?`)) return;
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch (_) {
        // Lỗi mạng: vẫn hiện như khách, session tự hết hạn sau.
      }
      showGuest();
      return;
    }
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
      showUser(data);
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
    // updateStartButton(selectedChapter); // Đã comment vì updateStartButton không được định nghĩa

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

  // Tắt gọi hàm này vì nó gây lỗi nếu chưa được định nghĩa ở trên
  // updateStartButton(localStorage.getItem('sutaSelectedChapter'));

})();