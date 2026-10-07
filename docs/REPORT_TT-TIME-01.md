# REPORT TT-TIME-01 — Thời gian qua màn/chương + menu cài đặt

Ngày: 07/10/2026 · Nhánh: `responsive-mobile` · Task card: [SUTA_TT_TASK_TIME_01.md](SUTA_TT_TASK_TIME_01.md)

**Trạng thái: Code xong, 11/13 test PASS. Còn T11–T12 CHƯA CHẠY**: hai test này cần đăng nhập bằng một tài khoản trong DB thật, mà Claude không tự tạo tài khoản / ghi kỷ lục vào DB dev của team. Chưa commit.

## File đã sửa / tạo

| File | Mục đích |
|---|---|
| `backend/routes/api.py` | Login ghi `session['username']`; thêm `GET /api/auth/me`, `POST /api/auth/logout`; `save-time` lấy user từ session (401 nếu là khách), kiểm `level_id ∈ {101,102,103}`, `0 < clear_time ≤ 24h`, `score` nguyên ≥ 0 (sai → 400) |
| `backend/repositories/user_repository.py` | Thêm `find_by_username()` cho `/me` |
| `frontend/static/js/home.js` | Khôi phục đăng nhập khi tải trang (`/me`); bấm ô người chơi khi đã đăng nhập → hỏi "Đăng xuất?" |
| `frontend/templates/gameplay/levels/trung-trac.html` | Nút ⚙️ thay nút 🔊; ô "Thời gian" trên HUD; `#endTime` trong panel kết thúc; `#settingsPanel`; dòng trợ giúp `Esc` |
| `frontend/static/css/levels/trung-trac.css` | Style ⚙️ (có dấu 🔇 khi tắt tiếng), ô thời gian, menu cài đặt (kể cả màn thấp/cảm ứng), thời gian trên panel; HUD 4 cột |
| `trung-trac/timer.js` (mới) | Đồng hồ màn + `formatTime` |
| `trung-trac/settings.js` (mới) | Menu cài đặt |
| `trung-trac/progress.js` | `times` trong tiến trình; `submitLevelRecord()`, `isTestRun()` |
| `trung-trac/main.js` | Đếm giờ trong `frame()` (`countsLevelTime()`), dừng `update()` khi menu mở, nối `initSettings`/phím |
| `trung-trac/physics.js` | `endGame`: chốt giây, lưu `times`, hiện thời gian / bảng chương, gửi kỷ lục |
| `trung-trac/ui.js` | `updateTimeHud()`; bỏ `updateMuteButton` + ref nút loa |
| `trung-trac/input.js` | Esc/P mở menu; `isBlocked()` chặn phím chơi, R, nút cảm ứng |
| `trung-trac/dialogue.js` | Bỏ qua phím 1–4/Enter/Space khi menu mở |
| `trung-trac/audio.js` | `getVolume`/`setVolume` (Nhạc/Hiệu ứng), nhớ `localStorage` `suta.audio.volume` |
| `tests/test_time_api.py` (mới) | 13 test API (session, `/me`, `logout`, `save-time`) — không cần DB, repository giả |
| `CLAUDE.md`, task card, report | Tài liệu |

Lệch nhỏ so với kế hoạch đã duyệt:
- Test API viết thành **file mới** `tests/test_time_api.py` thay vì thêm vào `test_app.py`. Lý do: `test_app.py` tự skip toàn bộ khi thiếu `SUTA_TEST_DATABASE_URL`, còn test mới chạy được không cần DB.
- `audio-data.js` **không sửa**: âm lượng mặc định 100 % nằm ở `audio.js`.

## Kết quả test

| # | Test | Kết quả |
|---|---|---|
| T1 | ⏱ chạy khi chơi, đứng ở panel Bắt đầu | **PASS** (00:00 trước khi bấm; 2,03 s chơi → `00:02`) |
| T2 | Menu mở → đồng hồ đứng (0,75 → 0,75 sau 2 s); đóng → chạy tiếp; focus vào "Tiếp tục" | **PASS** |
| T3 | Hội thoại (`state.paused`) vẫn đếm (+1,02 s / 1 s) | **PASS** |
| T4 | Thua → đứng; "Chơi lại" giữ 15,13 s (cộng dồn) | **PASS** |
| T5 | Thắng: "Thời gian: 00:15", `progress.times = {1: 15.13}`; R sau khi thắng → về 0 | **PASS** |
| T6 | Cutscene không đếm (+0 s / 1,5 s); panel kết chương "Màn 1: 01:35 · Màn 2: 04:01 · Màn 3: 00:01 · Tổng chương: 05:38" | **PASS** |
| T7 | Thanh trượt 40 % / 70 % lưu, tải lại vẫn giữ; phím M đồng bộ ô Tắt tiếng + dấu 🔇 trên ⚙️ | **PASS** |
| T8 | Thoát → hộp xác nhận (focus "Ở lại"); Ở lại → về menu; Thoát → `/`, tiến trình màn 1 còn | **PASS** |
| T9 | Menu mở: phím D không đi (`keys.right=false`), sau khi đóng thì đi được | **PASS** |
| T10 | `pytest`: 13 passed (`/me` theo login/logout, sai mật khẩu, 401 khi chưa đăng nhập, dùng user session thay payload, 9 payload sai → 400); server thật: `/me` → guest, `save-time` khách → 401 | **PASS** |
| T11 | Thắng màn khi đã đăng nhập → bản ghi 101/102/103 trong `level_records` | **CHƯA CHẠY**: cần tài khoản trong DB. Khách: panel hiện "Đăng nhập ở trang chủ để lưu kỷ lục…" (PASS) |
| T12 | Trang chủ tải lại còn đăng nhập; đăng xuất | **CHƯA CHẠY** trên giao diện (logic API đã PASS ở T10) |
| T13 | Menu trên điện thoại ngang 740×360 (cảm ứng): vừa khung, không cuộn | **PASS** |

Ghi chú kiểm thử: khung trình duyệt của Claude bị ẩn nên `requestAnimationFrame` không chạy. Khi thử, Claude tạm thay rAF bằng `setTimeout` **ngay trong tab thử** (không sửa code). Đồng hồ đo bằng thời gian thật giữa 2 frame nên không phụ thuộc cách này. Các bước thua/thắng/cutscene gọi trực tiếp `endGame` / `state.cutscene` qua module, không chơi hết màn.

## Lưu ý / TODO

- **Đổi `SUTA_SECRET_KEY`** trong `.env` khi chạy thật. Mặc định `dev-only-change-me` thì cookie đăng nhập có thể bị giả mạo.
- Thời gian do trình duyệt đo, nên người rành kỹ thuật vẫn gửi được số giả (dù chỉ cho tài khoản của chính họ). Chưa chống gian lận.
- Cột "Đã qua màn X/12" trên bảng xếp hạng vẫn ghi cứng 12 (không đổi).
- Bản ghi cũ trong `level_records` (nếu có) dùng `level_id` khác 101–103 vẫn được bảng xếp hạng cộng.
- Tải lại trang / thoát giữa màn → đồng hồ màn đó tính lại từ 0 (theo D9).
