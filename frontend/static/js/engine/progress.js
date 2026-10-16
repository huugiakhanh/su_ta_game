// Tiến trình giữa các màn của chương đang chơi (TT-NPC-01). Đọc/ghi đồng bộ qua
// sessionStorage của tab; đã đăng nhập thì sessionStorage là bản đệm của tiến
// trình trên server (SUTA-DB-01): vào màn lấy từ server khi tab chưa có bản của
// tài khoản đó, mỗi lần ghi gửi PUT nền. Khách: chỉ sessionStorage như cũ.
// sessionStorage có thể bị chặn (private mode, chặn dữ liệu trang) -> mọi truy
// cập bọc try/catch, lỗi thì coi như chưa có tiến trình.

import { CHAPTER, levelIds } from './chapter.js';

// Khoá sessionStorage theo chương (`CHAPTER.key` — Trưng Trắc: 'tt' ->
// 'suta.tt.progress', giữ nguyên khoá cũ). Kỷ lục gửi server dùng level_id =
// 100 × CHAPTER.id + màn (Trưng Trắc 101/102/103 — TT-TIME-01), khớp
// VALID_LEVEL_IDS ở backend/routes/api.py.
const storageKey = () => `suta.${CHAPTER.key}.progress`;
// Tài khoản (id) sở hữu bản tiến trình trong tab; không có = tiến trình khách.
const ownerKey = () => `${storageKey()}.owner`;
const progressUrl = () => `/api/game/progress/${CHAPTER.id}`;
const SYNC_TIMEOUT_MS = 4000;

// Id tài khoản khi tiến trình đang đồng bộ với server; null = khách/lượt thử.
let serverOwner = null;
// Gửi lần lượt để server nhận đúng thứ tự ghi.
let serverQueue = Promise.resolve();

// URL trang của màn `id` trong chương đang chơi.
export function levelUrl(id) {
  return CHAPTER.levels[id]?.url;
}

// `level<N>Complete` cho mọi màn của chương; `books` = số vật phẩm thu thập ở màn 1
// (tên trường giữ nguyên dữ liệu đã lưu trên server).
function emptyProgress() {
  const flags = Object.fromEntries(levelIds().map(id => [`level${id}Complete`, false]));
  // `times`: giây qua từng màn của chương đang chơi ({ 1: 83.2, 2: ... }).
  return { score: 0, books: 0, ...flags, rewards: [], times: {} };
}

function storageGet(key) {
  try {
    return window.sessionStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

function storageSet(key, value) {
  try {
    window.sessionStorage.setItem(key, value);
    return true;
  } catch (error) {
    return false;
  }
}

function storageRemove(key) {
  try {
    window.sessionStorage.removeItem(key);
  } catch (error) {
    // sessionStorage bị chặn: không có gì để xoá.
  }
}

export function readProgress() {
  try {
    const raw = storageGet(storageKey());
    return raw ? { ...emptyProgress(), ...JSON.parse(raw) } : emptyProgress();
  } catch (error) {
    return emptyProgress();
  }
}

// PUT/DELETE nền lên server. `keepalive`: vẫn gửi xong khi trang chuyển màn ngay sau đó.
function sendToServer(method, body) {
  if (!serverOwner) return;
  const init = { method, keepalive: true };
  if (body) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(body);
  }
  serverQueue = serverQueue
    .then(() => fetch(progressUrl(), init))
    .then(response => {
      if (!response.ok) console.warn(`Server từ chối tiến trình (${response.status}).`);
    })
    .catch(error => console.warn('Không đồng bộ được tiến trình lên server.', error));
}

// Ghi đè các trường trong `patch`, giữ nguyên phần còn lại.
export function saveProgress(patch) {
  const next = { ...readProgress(), ...patch };
  if (!storageSet(storageKey(), JSON.stringify(next))) {
    console.warn('Không lưu được tiến trình (sessionStorage bị chặn).');
  }
  sendToServer('PUT', next);
  return next;
}

export function clearProgress() {
  storageRemove(storageKey());
  sendToServer('DELETE');
}

// Gọi (await) trước requireLevel(). Đã đăng nhập: tab chưa có bản của tài khoản
// này -> lấy bản server (server chưa có mà tab có tiến trình khách -> đẩy tiến
// trình khách lên tài khoản); tab đã có thì bản tab là mới nhất. Khách: xoá bản
// của tài khoản cũ (vừa đăng xuất) khỏi tab. Lỗi mạng: giữ nguyên tab, không đồng bộ.
export async function syncProgressFromServer() {
  if (isTestRun()) return;
  let response;
  try {
    const signal = AbortSignal.timeout?.(SYNC_TIMEOUT_MS);
    response = await fetch(progressUrl(), { signal });
  } catch (error) {
    console.warn('Không tải được tiến trình từ server — dùng bản trong tab.', error);
    return;
  }
  const localOwner = storageGet(ownerKey());
  if (response.status === 401) {
    if (localOwner) {
      storageRemove(storageKey());
      storageRemove(ownerKey());
    }
    return;
  }
  if (!response.ok) return;
  let data;
  try {
    data = await response.json();
  } catch (error) {
    return;
  }
  const owner = String(data.owner);
  serverOwner = owner;
  if (localOwner === owner) return;
  if (data.progress) {
    storageSet(storageKey(), JSON.stringify({ ...emptyProgress(), ...data.progress }));
  } else if (localOwner) {
    storageRemove(storageKey());
  } else if (storageGet(storageKey())) {
    sendToServer('PUT', readProgress());
  }
  storageSet(ownerKey(), owner);
}

// Ghi nhận một phần thưởng (không trùng lặp).
export function addReward(id) {
  const { rewards } = readProgress();
  return rewards.includes(id) ? readProgress() : saveProgress({ rewards: [...rewards, id] });
}

// Dữ liệu giả lập đủ điều kiện vào màn `level` (chỉ dùng với `?debug=1`,
// KHÔNG ghi vào sessionStorage để không lẫn với tiến trình thật): mọi màn trước
// đã qua; từ màn 3 có đủ phần thưởng của chương.
function debugProgress(level) {
  const data = { ...emptyProgress(), books: 5 };
  levelIds().filter(id => id < level).forEach(id => { data[`level${id}Complete`] = true; });
  if (level >= 3) data.rewards = Object.keys(CHAPTER.rewards || {});
  return data;
}

// Trả về tiến trình để vào màn `level`. Chưa hoàn thành MỌI màn trước -> chuyển
// về màn 1 và trả về null. `?debug=1` -> vào thẳng với dữ liệu giả lập.
export function requireLevel(level) {
  if (level <= 1) return readProgress();
  if (new URLSearchParams(window.location.search).get('debug') === '1') return debugProgress(level);
  const progress = readProgress();
  const unlocked = levelIds().filter(id => id < level).every(id => progress[`level${id}Complete`]);
  if (unlocked) return progress;
  window.location.replace(levelUrl(1));
  return null;
}

// Lượt chơi thử (`?debug=1`, `?layout=…`) không gửi kỷ lục lên bảng xếp hạng.
export function isTestRun() {
  const params = new URLSearchParams(window.location.search);
  return params.get('debug') === '1' || params.has('layout');
}

// Gửi kỷ lục 1 màn (TT-TIME-01). Server lấy người chơi từ session đăng nhập.
// `stats` = state.stats (SUTA-DB-01, xét thành tựu).
// Trả về { status, reward }: status 'saved' | 'guest' (chưa đăng nhập) |
// 'skipped' (lượt thử) | 'error'; reward (khi saved) = { gold_gained,
// gems_gained, new_achievements: [{ code, name, icon }] } từ server.
export async function submitLevelRecord(level, seconds, score, stats) {
  if (isTestRun()) return { status: 'skipped' };
  try {
    const response = await fetch('/api/game/save-time', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        level_id: CHAPTER.id * 100 + level,
        clear_time: Math.round(seconds * 100) / 100,
        score: Math.max(0, Math.round(score)),
        stats: {
          hits_taken: stats.hitsTaken,
          quiz_correct: stats.quizCorrect,
          quiz_total: stats.quizTotal
        }
      })
    });
    if (response.status === 401) return { status: 'guest' };
    const data = await response.json();
    return data.status === 'success' ? { status: 'saved', reward: data } : { status: 'error' };
  } catch (error) {
    console.warn('Không gửi được kỷ lục.', error);
    return { status: 'error' };
  }
}
