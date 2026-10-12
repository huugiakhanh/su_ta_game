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

  // --- BẢNG XẾP HẠNG (phạm vi theo tab — SUTA-DB-01) ---
  let leaderboardScope = 'all';

  window.openLeaderboard = async function openLeaderboard(scope = leaderboardScope) {
      leaderboardScope = scope;
      document.querySelectorAll('.leaderboard-tabs .tab-btn').forEach((tab) => {
          tab.classList.toggle('active', tab.dataset.scope === scope);
      });
      document.getElementById('leaderboard-modal').style.display = 'flex';
      try {
          const response = await fetch(`/api/game/leaderboard?scope=${encodeURIComponent(scope)}`);
          const result = await response.json();
          if (result.status === 'success' && scope === leaderboardScope) renderLeaderboardUI(result);
      } catch (error) {
          console.error('Lỗi lấy dữ liệu bảng xếp hạng:', error);
      }
  };

  document.querySelectorAll('.leaderboard-tabs .tab-btn').forEach((tab) => {
      tab.addEventListener('click', () => window.openLeaderboard(tab.dataset.scope));
  });

  function formatTime(totalSeconds) {
      if (!totalSeconds) return "00:00:00";
      const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
      const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
      const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
      return `${h}:${m}:${s}`;
  }

  // Ô bảng bằng textContent — tên người chơi do người dùng nhập, không đưa vào innerHTML.
  // `nodes` (thay `text`): danh sách node/chuỗi gắn vào ô (vd. icon vàng).
  function tableRow(cells) {
      const tr = document.createElement('tr');
      cells.forEach(({ text, nodes, style, className }) => {
          const td = document.createElement('td');
          if (nodes) td.append(...nodes);
          else td.textContent = text;
          if (style) td.style.cssText = style;
          if (className) td.className = className;
          tr.appendChild(td);
      });
      return tr;
  }

  function messageRow(tbody, colspan, text) {
      tbody.innerHTML = `<tr><td colspan="${colspan}" style="padding: 20px; color: #8b4513;"></td></tr>`;
      tbody.querySelector('td').textContent = text;
  }

  const MEDALS = { 1: '🥇 1', 2: '🥈 2', 3: '🥉 3' };

  // Tiêu đề cột theo loại bảng: `game` (toàn game / chương) hoặc `quiz` (SUTA-QUIZ-LB).
  const LEADERBOARD_COLUMNS = {
      game: ['HẠNG', 'NGƯỜI CHƠI', 'ĐÃ QUA MÀN', 'TỔNG ĐIỂM', 'THỜI GIAN', 'THÀNH TÍCH'],
      quiz: ['HẠNG', 'NGƯỜI CHƠI', 'CÂU ĐÚNG', 'TỈ LỆ ĐÚNG', 'THỜI GIAN', 'SỐ LƯỢT'],
  };

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

  function renderLeaderboardUI({ kind = 'game', data, me, levels_total: levelsTotal }) {
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
      document.getElementById('my-current-name').textContent = currentUser ? currentUser.name : 'Khách';
      document.getElementById('my-current-score').textContent = kind === 'quiz'
          ? `✅ ${(me ? me.total_correct : 0).toLocaleString()} câu đúng`
          : `⭐ ${(me ? me.total_score : 0).toLocaleString()}`;
  }

  // --- THÀNH TỰU (SUTA-DB-01) ---
  window.openAchievements = async function openAchievements() {
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
  };

  // Icon vàng assets/images/icon/icon_gold.png qua CSS .res-icon--gold (cùng ô vàng trang
  // chủ — emoji 🪙 không hiện trên Windows 10).
  function goldIcon() {
      const icon = document.createElement('span');
      icon.className = 'res-icon res-icon--gold';
      icon.setAttribute('role', 'img');
      icon.setAttribute('aria-label', 'Vàng');
      return icon;
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
      document.getElementById('achievement-hint').textContent = currentUser
          ? currentUser.name
          : 'Đăng nhập để lưu thành tựu';
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

  // Avatar người chơi (cột users.avatar — SUTA-DB-01). Ảnh chung toàn web (không
  // thuộc chương nào) ở assets/images/avatar/ — Codex vẽ (AVATAR_MALE/AVATAR_FEMALE,
  // 256×256, bộ 32-bit); lỗi tải thì hiện chữ tạm.
  const AVATAR_ROOT = '/static/assets/images/avatar/';
  const AVATARS = {
    male: { label: 'Nam', src: `${AVATAR_ROOT}avatar_male.png` },
    female: { label: 'Nữ', src: `${AVATAR_ROOT}avatar_female.png` },
  };

  function renderAvatar(box, key) {
    const avatar = AVATARS[key] || AVATARS.male;
    box.classList.remove('avatar--guest', 'avatar--fallback');
    const img = document.createElement('img');
    img.className = 'avatar__img';
    img.alt = `Avatar ${avatar.label}`;
    img.addEventListener('error', () => {
      box.textContent = avatar.label;
      box.classList.add('avatar--fallback');
    }, { once: true });
    img.src = avatar.src;
    box.replaceChildren(img);
  }

  document.querySelectorAll('[data-avatar]').forEach((box) => renderAvatar(box, box.dataset.avatar));

  function showResources(gold, gems) {
    document.querySelector('[data-res="gold"]').textContent = gold.toLocaleString('vi-VN');
    document.querySelector('[data-res="gems"]').textContent = gems.toLocaleString('vi-VN');
  }

  function showUser(user) {
    currentUser = user;
    document.querySelector('.info-text h3').textContent = user.name;
    document.querySelector('.info-text div').textContent = `Đã qua ${user.levels_cleared} màn`;
    renderAvatar(document.querySelector('.player-info .avatar'), user.avatar);
    showResources(user.gold, user.gems);
  }

  function showGuest() {
    currentUser = null;
    document.querySelector('.info-text h3').textContent = 'KHÁCH TRUY CẬP';
    document.querySelector('.info-text div').textContent = 'Chạm để Đăng nhập';
    const avatar = document.querySelector('.player-info .avatar');
    avatar.classList.remove('avatar--fallback');
    avatar.classList.add('avatar--guest');
    avatar.textContent = '?';
    showResources(0, 0);
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

  window.moBangDangNhap = function moBangDangNhap() {
    if (currentUser) {
      openProfile();
      return;
    }
    document.getElementById('loginModal').style.display = 'block';
    setAuthMessage('');
  };

  // --- HỒ SƠ: đổi avatar + đăng xuất (SUTA-DB-01) ---
  function markAvatarChoice(key) {
    document.querySelectorAll('[data-avatar-choice]').forEach((button) => {
      const selected = button.dataset.avatarChoice === key;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  }

  function openProfile() {
    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('profileMessage').textContent = '';
    markAvatarChoice(currentUser.avatar);
    document.getElementById('profileModal').hidden = false;
  }

  window.dongHoSo = function dongHoSo() {
    document.getElementById('profileModal').hidden = true;
  };

  document.querySelectorAll('[data-avatar-choice]').forEach((button) => {
    button.addEventListener('click', async () => {
      const key = button.dataset.avatarChoice;
      if (!currentUser || key === currentUser.avatar) return;
      const message = document.getElementById('profileMessage');
      message.textContent = 'Đang lưu...';
      try {
        const data = await postAuth('/api/auth/avatar', { avatar: key });
        if (data.status !== 'success') throw new Error(data.message);
        currentUser.avatar = key;
        renderAvatar(document.querySelector('.player-info .avatar'), key);
        markAvatarChoice(key);
        message.textContent = 'Đã đổi avatar.';
      } catch (_) {
        message.textContent = 'Không đổi được avatar, thử lại sau.';
      }
    });
  });

  window.dangXuat = async function dangXuat() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (_) {
      // Lỗi mạng: vẫn hiện như khách, session tự hết hạn sau.
    }
    window.dongHoSo();
    showGuest();
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
      const avatar = document.querySelector('input[name="regAvatar"]:checked')?.value || 'male';
      const data = await postAuth('/register', { name, username, password, avatar });
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