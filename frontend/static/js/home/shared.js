// Trạng thái + hàm dùng chung của trang chủ (HOME-LAZY-01). main.js và các module cửa
// sổ (timeline/leaderboard/achievements/login/chapter) cùng import file này — không
// import ngược main.js để tránh vòng.

// Tài khoản đang đăng nhập (Flask session — TT-TIME-01); null = khách.
export const home = { user: null };

export function formatTime(totalSeconds) {
  if (!totalSeconds) return '00:00:00';
  const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

// Ô bảng bằng textContent — tên người chơi do người dùng nhập, không đưa vào innerHTML.
// `nodes` (thay `text`): danh sách node/chuỗi gắn vào ô (vd. icon vàng).
export function tableRow(cells) {
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

export function messageRow(tbody, colspan, text) {
  tbody.innerHTML = `<tr><td colspan="${colspan}" style="padding: 20px; color: #8b4513;"></td></tr>`;
  tbody.querySelector('td').textContent = text;
}

// Icon vàng assets/images/icon/icon_gold.png qua CSS .res-icon--gold (cùng ô vàng trang
// chủ — emoji 🪙 không hiện trên Windows 10).
export function goldIcon() {
  const icon = document.createElement('span');
  icon.className = 'res-icon res-icon--gold';
  icon.setAttribute('role', 'img');
  icon.setAttribute('aria-label', 'Vàng');
  return icon;
}

export async function postJson(path, body) {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return response.json();
}

// Avatar người chơi (cột users.avatar — SUTA-DB-01). Ảnh chung toàn web (không
// thuộc chương nào) ở assets/images/avatar/ — Codex vẽ (AVATAR_MALE/AVATAR_FEMALE,
// 256×256, bộ 32-bit); lỗi tải thì hiện chữ tạm.
const AVATAR_ROOT = '/static/assets/images/avatar/';
const AVATARS = {
  male: { label: 'Nam', src: `${AVATAR_ROOT}avatar_male.png` },
  female: { label: 'Nữ', src: `${AVATAR_ROOT}avatar_female.png` },
};

export function renderAvatar(box, key) {
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

function showResources(gold, gems) {
  document.querySelector('[data-res="gold"]').textContent = gold.toLocaleString('vi-VN');
  document.querySelector('[data-res="gems"]').textContent = gems.toLocaleString('vi-VN');
}

// Ô người chơi + vàng/kim cương ở thanh trên.
export function showUser(user) {
  home.user = user;
  document.querySelector('.info-text h3').textContent = user.name;
  document.querySelector('.info-text div').textContent = `Đã qua ${user.levels_cleared} màn`;
  renderAvatar(document.querySelector('.player-info .avatar'), user.avatar);
  showResources(user.gold, user.gems);
}

export function showGuest() {
  home.user = null;
  document.querySelector('.info-text h3').textContent = 'KHÁCH TRUY CẬP';
  document.querySelector('.info-text div').textContent = 'Chạm để Đăng nhập';
  const avatar = document.querySelector('.player-info .avatar');
  avatar.classList.remove('avatar--fallback');
  avatar.classList.add('avatar--guest');
  avatar.textContent = '?';
  showResources(0, 0);
}

// Nút "BẮT ĐẦU CHƠI" theo nhân vật đã chọn ở dòng thời gian (lưu localStorage).
export function showSelectedHero(heroName, routeUrl) {
  const startBtn = document.getElementById('btn-start-game');
  if (!startBtn) return;
  startBtn.href = routeUrl;
  const title = document.createElement('div');
  title.textContent = '⚔️ BẮT ĐẦU CHƠI';
  const hint = document.createElement('span');
  hint.style.cssText = 'font-size: 13px; color: #ffeb3b; font-weight: normal;';
  hint.textContent = `(Thử Thách: ${heroName})`;
  startBtn.replaceChildren(title, hint);
}
