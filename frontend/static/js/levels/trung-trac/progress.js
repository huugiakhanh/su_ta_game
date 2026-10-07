// Tiến trình giữa các màn của chương Trưng Trắc (TT-NPC-01). Backend chưa có
// cơ chế lưu tiến trình nên tạm lưu ở sessionStorage phía trình duyệt (mất khi
// đóng tab). Mọi đọc/ghi đi qua module này để sau đổi sang backend chỉ sửa ở đây.
// sessionStorage có thể bị chặn (private mode, chặn dữ liệu trang) -> mọi truy
// cập bọc try/catch, lỗi thì coi như chưa có tiến trình.

const STORAGE_KEY = 'suta.tt.progress';
// Chương Trưng Trắc = chương 1. Kỷ lục gửi server dùng level_id = 100 × chương
// + màn (101/102/103 — TT-TIME-01), khớp VALID_LEVEL_IDS ở backend/routes/api.py.
const CHAPTER_ID = 1;

export const LEVEL_URLS = {
  1: '/gameplay/levels/trung-trac',
  2: '/gameplay/levels/trung-trac/2',
  3: '/gameplay/levels/trung-trac/3'
};

// Phần thưởng nhận ở màn 2 (id -> tên, nguyên văn task card TT-NPC-01 mục 5).
// Màn 2 chỉ GHI NHẬN đã nhận; cơ chế làm ở task màn 3.
export const REWARD_NAMES = {
  BUFF_Y_CHI_KIEN_CUONG: 'Ý chí kiên cường',
  SK_LE_CHAN_ARROW_RAIN: 'Mưa tên',
  SK_TRUNG_NHI_SHADOW: 'Bóng Trưng Nhị'
};

function emptyProgress() {
  // `times`: giây qua từng màn của chương đang chơi ({ 1: 83.2, 2: ... }).
  return { score: 0, books: 0, level1Complete: false, level2Complete: false, level3Complete: false, rewards: [], times: {} };
}

export function readProgress() {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? { ...emptyProgress(), ...JSON.parse(raw) } : emptyProgress();
  } catch (error) {
    return emptyProgress();
  }
}

// Ghi đè các trường trong `patch`, giữ nguyên phần còn lại.
export function saveProgress(patch) {
  const next = { ...readProgress(), ...patch };
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    console.warn('Không lưu được tiến trình (sessionStorage bị chặn).', error);
  }
  return next;
}

export function clearProgress() {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    // sessionStorage bị chặn: không có gì để xoá.
  }
}

// Ghi nhận một phần thưởng (không trùng lặp).
export function addReward(id) {
  const { rewards } = readProgress();
  return rewards.includes(id) ? readProgress() : saveProgress({ rewards: [...rewards, id] });
}

// Dữ liệu giả lập đủ điều kiện vào màn `level` (chỉ dùng với `?debug=1`,
// KHÔNG ghi vào sessionStorage để không lẫn với tiến trình thật).
function debugProgress(level) {
  const data = { ...emptyProgress(), books: 5, level1Complete: true };
  if (level >= 3) {
    data.level2Complete = true;
    data.rewards = Object.keys(REWARD_NAMES);
  }
  return data;
}

// Trả về tiến trình để vào màn `level`. Chưa hoàn thành màn trước -> chuyển về
// màn 1 và trả về null. `?debug=1` -> vào thẳng với dữ liệu giả lập.
export function requireLevel(level) {
  if (level <= 1) return readProgress();
  if (new URLSearchParams(window.location.search).get('debug') === '1') return debugProgress(level);
  const progress = readProgress();
  const unlocked = level === 2 ? progress.level1Complete : progress.level1Complete && progress.level2Complete;
  if (unlocked) return progress;
  window.location.replace(LEVEL_URLS[1]);
  return null;
}

// Lượt chơi thử (`?debug=1`, `?layout=…`) không gửi kỷ lục lên bảng xếp hạng.
export function isTestRun() {
  const params = new URLSearchParams(window.location.search);
  return params.get('debug') === '1' || params.has('layout');
}

// Gửi kỷ lục 1 màn (TT-TIME-01). Server lấy người chơi từ session đăng nhập.
// Trả về 'saved' | 'guest' (chưa đăng nhập) | 'skipped' (lượt thử) | 'error'.
export async function submitLevelRecord(level, seconds, score) {
  if (isTestRun()) return 'skipped';
  try {
    const response = await fetch('/api/game/save-time', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        level_id: CHAPTER_ID * 100 + level,
        clear_time: Math.round(seconds * 100) / 100,
        score: Math.max(0, Math.round(score))
      })
    });
    if (response.status === 401) return 'guest';
    const data = await response.json();
    return data.status === 'success' ? 'saved' : 'error';
  } catch (error) {
    console.warn('Không gửi được kỷ lục.', error);
    return 'error';
  }
}
