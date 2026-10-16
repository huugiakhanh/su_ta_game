// Nhân vật người chơi nam/nữ (TT-HERO-01). Thứ tự lấy giới tính:
//   1. `data-gender` của <body> (route truyền giới tính tài khoản đang đăng nhập);
//   2. khách: lựa chọn cũ trong localStorage (try/catch — có thể bị chặn);
//   3. không có -> bảng chọn #heroPicker. Đã đăng nhập (tài khoản cũ chưa có
//      giới tính) thì lưu vào tài khoản qua POST /api/auth/gender, khách lưu
//      localStorage.
// Đổi nhân vật trong menu cài đặt: lưu như trên, áp dụng từ lần tải màn sau.

const STORAGE_KEY = 'suta.player.gender';
const GENDERS = ['male', 'female'];

const picker = document.getElementById('heroPicker');
const loggedIn = document.body.dataset.loggedIn === '1';

function storedGender() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return GENDERS.includes(value) ? value : null;
  } catch (_) {
    return null;
  }
}

async function saveGender(gender) {
  if (!loggedIn) {
    try {
      localStorage.setItem(STORAGE_KEY, gender);
    } catch (_) {
      // Không lưu được: lần sau hỏi lại.
    }
    return;
  }
  try {
    await fetch('/api/auth/gender', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gender })
    });
  } catch (_) {
    // Lỗi mạng: vẫn chơi bằng nhân vật vừa chọn, lần sau hỏi lại.
  }
}

// Hiện bảng chọn, trả về 'male' | 'female' khi người chơi bấm.
function pickGender() {
  return new Promise(resolve => {
    const buttons = [...picker.querySelectorAll('[data-gender-choice]')];
    const choose = event => {
      buttons.forEach(button => button.removeEventListener('click', choose));
      picker.classList.remove('panel--visible');
      resolve(event.currentTarget.dataset.genderChoice);
    };
    buttons.forEach(button => button.addEventListener('click', choose));
    picker.classList.add('panel--visible');
    buttons[0]?.focus({ preventScroll: true });
  });
}

export async function resolveGender() {
  const fromPage = document.body.dataset.gender;
  if (GENDERS.includes(fromPage)) return fromPage;
  if (!loggedIn) {
    const stored = storedGender();
    if (stored) return stored;
  }
  const gender = await pickGender();
  saveGender(gender);
  return gender;
}

// Menu cài đặt: chọn lại và lưu; nhân vật đổi từ lần tải màn sau.
export async function changeGender() {
  const gender = await pickGender();
  await saveGender(gender);
  return gender;
}
