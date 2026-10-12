// Đăng nhập/đăng ký + hồ sơ (đổi avatar, đăng xuất) — SUTA-DB-01; tải khi bấm ô người
// chơi lần đầu (HOME-LAZY-01). HTML: components/home/login.html, CSS: css/home/login.css.
import { home, postJson, renderAvatar, showGuest, showUser } from './shared.js';

function setAuthMessage(message, color = '#ffcc00') {
  const messageElement = document.getElementById('authMessage');
  if (messageElement) {
    messageElement.textContent = message;
    messageElement.style.color = color;
  }
}

export function init() {
  document.querySelectorAll('#loginModal [data-avatar], #profileModal [data-avatar]')
    .forEach((box) => renderAvatar(box, box.dataset.avatar));

  document.querySelectorAll('[data-avatar-choice]').forEach((button) => {
    button.addEventListener('click', async () => {
      const key = button.dataset.avatarChoice;
      if (!home.user || key === home.user.avatar) return;
      const message = document.getElementById('profileMessage');
      message.textContent = 'Đang lưu...';
      try {
        const data = await postJson('/api/auth/avatar', { avatar: key });
        if (data.status !== 'success') throw new Error(data.message);
        home.user.avatar = key;
        renderAvatar(document.querySelector('.player-info .avatar'), key);
        markAvatarChoice(key);
        message.textContent = 'Đã đổi avatar.';
      } catch (_) {
        message.textContent = 'Không đổi được avatar, thử lại sau.';
      }
    });
  });
}

export function openLogin() {
  document.getElementById('loginModal').style.display = 'block';
  setAuthMessage('');
}

// --- HỒ SƠ: đổi avatar + đăng xuất ---
function markAvatarChoice(key) {
  document.querySelectorAll('[data-avatar-choice]').forEach((button) => {
    const selected = button.dataset.avatarChoice === key;
    button.classList.toggle('is-selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
}

export function openProfile() {
  document.getElementById('profileName').textContent = home.user.name;
  document.getElementById('profileMessage').textContent = '';
  markAvatarChoice(home.user.avatar);
  document.getElementById('profileModal').hidden = false;
}

window.dongHoSo = function dongHoSo() {
  document.getElementById('profileModal').hidden = true;
};

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

window.xacNhanDangNhap = async function xacNhanDangNhap() {
  setAuthMessage('Đang kiểm tra tài khoản...');
  try {
    const data = await postJson('/login', {
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
    const data = await postJson('/register', { name, username, password, avatar });
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
