# REPORT SUTA-DB-01 — Database người chơi

Task card: [SUTA_DB_TASK_01.md](SUTA_DB_TASK_01.md). Thực hiện 10/10/2026, 5 bước, người dùng duyệt từng bước.

**Trạng thái: HOÀN THÀNH** — 52/52 test tự động PASS (kể cả test PostgreSQL), kiểm tra thủ công trên app thật PASS. Chưa commit.

## 1. File đã sửa / tạo

| File | Mục đích |
|---|---|
| `backend/migrations/001_baseline.sql` (mới) | Schema 11 bảng + seed chương/màn/phần thưởng NPC/thành tựu; drop `users`/`level_records` cũ |
| `backend/db.py` | `run_migrations()` thay `init_db()` (bảng `schema_migrations`, advisory lock, 1 transaction/file) |
| `app.py` | Gọi `run_migrations()` |
| `backend/repositories/user_repository.py` | Hash mật khẩu (werkzeug), `find_by_id`, `last_login_at`, `levels_cleared` |
| `backend/repositories/progress_repository.py` (mới) | Đọc/ghi/xoá tiến trình chương |
| `backend/repositories/record_repository.py` | `get_leaderboard(chapter, level, limit, user_id)` — phạm vi, `me`, `levels_total`, huy hiệu |
| `backend/repositories/achievement_repository.py` (mới) | Danh mục + trạng thái thành tựu |
| `backend/services/game_service.py` (mới) | `complete_level()`: kỷ lục + `user_level_stats` + thưởng lần đầu + thành tựu, 1 transaction; `ACHIEVEMENT_RULES` |
| `backend/routes/api.py` | Session `user_id`; `save-time` + `stats`; route progress, achievements, leaderboard `scope` |
| `frontend/static/js/levels/trung-trac/progress.js` | `syncProgressFromServer()`, PUT/DELETE nền, `submitLevelRecord` gửi `stats` + trả phần thưởng |
| `frontend/static/js/levels/trung-trac/main.js` | `await syncProgressFromServer()` trước `requireLevel()` |
| `frontend/static/js/levels/trung-trac/state.js` | `state.stats` |
| `frontend/static/js/levels/trung-trac/physics.js` | Đếm trúng đòn; `showRecordReward()` trên panel qua màn |
| `frontend/static/js/levels/trung-trac/dialogue.js` | Đếm câu hỏi đúng/tổng |
| `frontend/static/css/levels/trung-trac.css` | Kiểu dòng thưởng/thành tựu trên panel |
| `frontend/templates/home.html` | Ô 🪙 + 💎 (bỏ ⚡), tab BXH, modal Thành tựu |
| `frontend/static/js/home.js` | BXH theo tab + hạng từ server, modal thành tựu, "Đã qua N màn"; ô bảng dùng `textContent` |
| `frontend/static/css/main.css` | Kiểu bảng thành tựu |
| `tests/test_time_api.py`, `tests/test_app.py` | Cập nhật + test mới |
| `CLAUDE.md` | Mục Database, progress.js, thống kê lượt, known issues |

## 2. Kết quả test

| # | Test case | Kết quả |
|---|---|---|
| T1 | Migration chạy 2 lần, lần 2 không làm gì | PASS (`test_migrations_are_idempotent`) |
| T2 | Mật khẩu hash, đăng nhập đúng/sai, trùng tài khoản | PASS |
| T3 | `save-time` khách 401, payload/`stats` sai 400 | PASS |
| T4 | Qua màn 2 lần → thưởng 1 lần, best đúng, `clear_count` 2 | PASS |
| T5 | Thành tựu mở 1 lần, số dư = tổng sổ cái | PASS |
| T6 | Progress PUT/GET/DELETE, khách 401, payload sai 400 | PASS |
| T7 | BXH `all`/`chapter-1`/`level-10x`, `me` ngoài top 10, scope sai 400 | PASS |
| T8 | Thủ công (app thật, PostgreSQL local) | PASS — xem dưới |

T8 đã kiểm: tab mới chưa có tiến trình vào màn 2 → về màn 1; qua màn 1 → server lưu; xoá tab (giả lập đóng tab) → vào thẳng màn 2, điểm mang sang; đăng xuất → tab xoá tiến trình tài khoản; khách qua màn 1 rồi đăng ký → tiến trình chuyển lên tài khoản; bộ đếm `stats` đúng; panel màn 2 hiện "+200 vàng" + "Thành tựu mới: Chiêu hiền"; trang chủ: vàng/KC đúng ô, tab BXH, modal thành tựu 3/6. Log server không lỗi.

Lệnh chạy test DB: đặt `SUTA_TEST_DATABASE_URL` trỏ DB riêng (máy dev dùng `su_ta_test` cùng server với `.env`) rồi `python -m pytest -q tests`.

## 3. Quyết định trong lúc làm (đã báo người dùng)

- Rơi hố tính là trúng đòn (thành tựu Bất khả xâm phạm); trả lời sai không tính — người dùng xác nhận.
- Màn 3 không có câu hỏi → không mở Thông kim bác cổ ở màn 3 — người dùng xác nhận.
- Khách chơi rồi đăng nhập vào tài khoản đã có tiến trình → giữ bản server.
- Tài khoản mới 0 vàng / 0 KC (trước: 1000/50).
- Sửa kèm lỗi cũ trang chủ: vàng đang hiện ở ô 💎, KC đè ô ⚡; tên người chơi đưa vào `innerHTML` ở BXH (nguy cơ XSS) → `textContent`.

## 4. TODO

- `DESIGN_BASELINE` chờ team chốt: thưởng qua màn (100 / 150 / 200 + 5 KC), 6 thành tựu (tên, điều kiện, thưởng; Thần tốc < 15 phút).
- Chống gian lận: thời gian/điểm/`stats` do trình duyệt gửi.
- Cửa hàng, năng lượng: ngoài phạm vi (D1).
- Lỗi có sẵn, không thuộc task: 404 `favicon.ico`, `characters/nguyen-hue.jpg` ở trang chủ.
- DB dev `su_ta` có 2 tài khoản thử `dbtest_…` tạo khi kiểm tra — xoá nếu không cần.

## 5. Bổ sung 10/10/2026 — avatar người chơi

Người dùng chốt: 2 avatar thanh niên Lạc Việt nam/nữ, chọn khi đăng ký + đổi sau, không hiện ở BXH.

| File | Mục đích |
|---|---|
| `backend/migrations/002_user_avatar.sql` (mới) | Cột `users.avatar` (`male`/`female`, mặc định `male`) |
| `backend/repositories/user_repository.py` | `create(..., avatar)`, `set_avatar`, trả `avatar` |
| `backend/routes/api.py` | `register` nhận `avatar`; `POST /api/auth/avatar`; `is_avatar()` (chặn giá trị không phải chuỗi) |
| `frontend/templates/components/login-modal.html` | Ô chọn Nam/Nữ ở form đăng ký; modal hồ sơ `#profileModal` |
| `frontend/static/js/home.js`, `frontend/static/css/main.css` | `renderAvatar()` (lỗi ảnh → chữ tạm), hồ sơ: đổi avatar + Đăng xuất (thay hộp `confirm`) |
| `tests/test_time_api.py`, `tests/test_app.py` | Test đổi avatar (401/400/200), đăng ký có/không/sai avatar, DB: đăng ký nữ → đổi nam |

Test: 58/58 PASS. Thủ công trên app thật: đăng ký chọn Nữ → `/me` = `female`, ô người chơi hiện avatar; mở hồ sơ → đổi Nam →
server lưu `male`; Đăng xuất → về khách. Log server không lỗi.

Ảnh `AVATAR_MALE`/`AVATAR_FEMALE` (64×64 logic → 256×256): Codex vẽ 10/10/2026 (prompt đã xoá theo quy ước; report Codex ở
`assets/sprites-32bit/SPRITE_REPORT_TT_32.md`). Claude soát lại: alpha 0/255, 32 màu thuộc `palette_32_tt.png`, không pixel béo; khe trong
suốt kín (nam 157 px, nữ 619 px) đều là kẽ tóc/lông chim/dải khăn, không lỗ trên mặt/áo; ở 36 px phân biệt rõ nam/nữ, không nhầm với 4
chân dung lịch sử. Người dùng duyệt 10/10.

Vị trí (sửa 12/10 theo người dùng — avatar là ảnh **chung toàn web**, không thuộc chương Trưng Trắc): bản chạy ở
`frontend/static/assets/images/avatar/avatar_male.png` / `avatar_female.png`, **không** có trong `manifest_tt.json` bản game (`home.js`
trỏ thẳng đường dẫn). Bản đầu 10/10 chép vào `frontend/…/trung-trac/sprites-32bit/avatar/` + manifest chương — đã gỡ cả hai. Kiểm tra
trên app: 4 ô avatar (form đăng ký + hồ sơ) tải ảnh từ đường dẫn mới, 256 px, không ô nào rơi về chữ tạm.

TODO: nguồn của Codex vẫn nằm trong vùng làm việc chương (`assets/sprites-32bit/avatar/`, 2 mục `AVATAR_*` trong `manifest_tt.json`
vùng làm việc) — đợt sau nên để Codex chuyển sang vùng làm việc chung (Claude không sửa manifest của Codex ngoài `status`).

## 6. Bổ sung 12/10/2026 — asset chung toàn web

Người dùng: avatar và icon vàng là của **toàn web**, không thuộc chương Trưng Trắc → chuyển ra thư mục ảnh chung, gỡ khỏi manifest chương.

| Trước (10/10) | Sau (12/10) |
|---|---|
| `images/trung-trac/sprites-32bit/avatar/AVATAR_*/avatar_*_idle.png` + 2 mục `manifest_tt.json` | `images/avatar/avatar_male.png`, `avatar_female.png` |
| `images/trung-trac/sprites-32bit/icon/ICON_HUD_GOLD/icon_hud_gold_idle.png` + mục `manifest_tt.json` | `images/icon/icon_gold.png` |

`manifest_tt.json` bản game trở lại đúng bản HEAD (không còn thay đổi). Code: `home.js` (`AVATAR_ROOT`), `main.css` (`.res-icon--gold`),
`config.js` (`GOLD_ICON` → `GOLD_ICON_URL`, gỡ khỏi `SPRITE_DOM_IN_GAME`), `physics.js` (`showRecordReward()` gán `src` thẳng, lỗi tải →
"+N vàng"). Kiểm tra trên app: trang chủ 4 ô avatar + 3 icon vàng tải từ đường dẫn mới; panel qua màn 1 hiện icon (64 px) "+150 · +5 kim
cương"; console game không cảnh báo thiếu asset.

TODO: nguồn của Codex vẫn trong vùng làm việc chương (`assets/sprites-32bit/avatar/`, `icon/ICON_HUD_GOLD/`, 3 mục trong `manifest_tt.json`
vùng làm việc) — đợt sau để Codex chuyển sang vùng làm việc chung.

## 7. Asset

> Vị trí file và manifest mô tả dưới đây là bản 10/10 — đã chuyển ra thư mục chung ngày 12/10 (mục 6).

- `ICON_HUD_GOLD` (icon vàng trang chủ, 16×16 logic → 64×64): Codex vẽ 10/10/2026 theo prompt riêng (đã xoá theo quy ước, report
  Codex ở `assets/sprites-32bit/SPRITE_REPORT_TT_32.md`). Claude soát lại: 64×64 RGBA, alpha 0/255, 10 màu thuộc `palette_32_tt.png`,
  không magenta, lỗ vuông trong suốt 12×12 px, không pixel béo. Người dùng duyệt → chép sang `frontend/…/sprites-32bit/icon/ICON_HUD_GOLD/`,
  thêm vào `manifest_tt.json` bản game (`IN_GAME`, cạnh `ICON_HUD_HEART`), bản vùng làm việc chỉ đổi `status`. Thay icon tạm (ô 1
  `PJ_COIN_POUCH`) trong `.res-icon--gold`.
- Ghi chú: màu ngả nâu đồng vì 3 mã màu đồng ghi trong prompt không có trong bảng màu chương (lỗi prompt) — Codex dùng màu gần nhất;
  người dùng chấp nhận. Muốn sáng hơn thì giao Codex dải vàng sáng có trong bảng.
- Manifest vùng làm việc còn lệch bản game ở `NPC_TRUNG_NHI`, `NPC_THI_SACH` (`NORMALIZED`, việc vẽ lại NPC-IDENTITY đang chờ soát) —
  không thuộc task này, không chép.
