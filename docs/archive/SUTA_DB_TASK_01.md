# TASK CARD SUTA-DB-01 — Database người chơi (tiến trình, kinh tế, thành tựu, BXH)

Người dùng duyệt 10/10/2026 (hỏi đáp + duyệt kế hoạch trong phiên Claude Code).

## 1. Mục tiêu

Xây lại database PostgreSQL phục vụ các chức năng đang có / sắp có trong game: tiến trình chương theo tài khoản, vàng/kim cương thưởng khi qua màn, thành tựu, bảng xếp hạng theo chương/màn. Mật khẩu lưu dạng hash. Schema quản lý bằng file SQL đánh số.

## 2. Quyết định đã chốt

| # | Nội dung | Chốt |
|---|---|---|
| D1 | Phạm vi | Có: tiến trình chương, thành tựu + BXH, vàng/kim cương. Không: năng lượng ⚡ (bỏ khỏi trang chủ), cửa hàng/vật phẩm (làm sau), câu hỏi lên DB |
| D2 | Kinh tế | Chỉ thưởng khi **qua màn lần đầu** + thưởng thành tựu. Mọi số `DESIGN_BASELINE` |
| D3 | Mật khẩu | Hash bằng `werkzeug.security` (có sẵn theo Flask) |
| D4 | Migration | `backend/migrations/NNN_*.sql` + bảng `schema_migrations`, mỗi file 1 transaction |
| D5 | Dữ liệu cũ | Dữ liệu thử → `001_baseline.sql` drop `users`/`level_records` cũ, tạo lại. Bỏ tài khoản seed `admin/admin` |
| D6 | Khách | Chưa đăng nhập vẫn chơi bằng `sessionStorage` như cũ; đã đăng nhập thì tiến trình đồng bộ lên server |
| D7 | Session | Lưu `session['user_id']` (thay `username`) |
| D8 | Thưởng qua màn lần đầu | 101 = 100 vàng, 102 = 150 vàng, 103 = 200 vàng + 5 KC (`DESIGN_BASELINE`) |
| D9 | Thành tựu mẫu | `TT_CLEAR_1`, `TT_CLEAR_2`, `TT_CHAPTER`, `TT_SPEED` (tổng best 3 màn < 15 phút), `TT_FLAWLESS` (qua màn không trúng đòn), `TT_SCHOLAR` (đúng hết câu hỏi trong màn) — chờ team duyệt tên/số |

## 3. Schema

Danh mục (seed): `chapters`, `levels`, `rewards`, `achievements`.
Người chơi: `users`, `chapter_progress`, `chapter_progress_rewards`, `level_records`, `user_level_stats`, `user_achievements`, `currency_transactions` (UNIQUE `(user_id, reason, ref)` — thưởng không cộng 2 lần). Chi tiết cột: `backend/migrations/001_baseline.sql`.

## 4. Bước thực hiện

1. Migration runner + `001_baseline.sql` + hash mật khẩu + `user_id` trong session.
2. `game_service.complete_level` (record + `user_level_stats` + thưởng lần đầu + thành tựu, 1 transaction).
3. API + đồng bộ tiến trình chương (`progress.js`).
4. `stats` từ client cho `TT_FLAWLESS`/`TT_SCHOLAR`.
5. BXH theo phạm vi + UI trang chủ (bỏ ⚡, modal thành tựu, tab BXH). Cập nhật CLAUDE.md + report.

## 5. Test case

| # | Test case | Cần DB |
|---|---|---|
| T1 | Migration chạy 2 lần liên tiếp không lỗi, lần 2 không làm gì | có |
| T2 | Đăng ký → cột `password_hash` không chứa mật khẩu gốc; đăng nhập đúng/sai | có |
| T3 | `save-time` khách → 401; payload sai → 400 (giữ test TT-TIME-01) | không |
| T4 | Qua cùng 1 màn 2 lần → chỉ 1 lần cộng thưởng, `clear_count` = 2, best = tốt nhất | có |
| T5 | Thành tựu mở đúng 1 lần, thưởng cộng 1 lần | có |
| T6 | Progress PUT rồi GET khớp; khách → 401 | có / không |
| T7 | BXH `all` / `chapter-1` / `level-101` đúng thứ tự; scope sai → 400 | có / không |
| T8 | Thủ công: đăng nhập → qua màn 1 → đóng tab → mở lại vào được màn 2; vàng tăng ở trang chủ; khách chơi đủ 3 màn | — |
