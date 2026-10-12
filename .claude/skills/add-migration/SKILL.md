---
name: add-migration
description: >-
  Thêm thay đổi schema hoặc dữ liệu danh mục (chương, màn, phần thưởng, thành tựu) cho database PostgreSQL của Sử Ta — tạo file backend/migrations/NNN_ten.sql mới, cập nhật repository/route, VALID_* trong api.py, PLAYER_TABLES trong test, viết test. Dùng khi cần bảng/cột mới, thêm level/chương/thành tựu, hoặc lưu loại dữ liệu người chơi mới.
argument-hint: "[mô tả ngắn, vd. bảng daily_quests]"
---

# /add-migration

Thay đổi: `$ARGUMENTS`. Nền tảng: rule `backend.md`.

## Quy tắc cứng

- **Không sửa file migration đã có** (đã chạy ở máy ai đó). Đổi schema = **thêm file mới** `backend/migrations/NNN_ten.sql`, `NNN` = số lớn nhất hiện có + 1, 3 chữ số, `ten` snake_case.
- Mỗi file chạy trong **1 transaction** (`run_migrations()`), lỗi thì rollback file đó → không cần `BEGIN/COMMIT` trong file.
- Chỉ PostgreSQL. Không SQL trong route/template — truy vấn đặt ở `backend/repositories/`.
- Id danh mục (chapter, level = 100 × chương + màn, reward, achievement code) là **Source of Truth** trong seed — code JS/Python phải khớp.

## Các bước

1. `ls backend/migrations` → chọn số tiếp theo. Đọc `001_baseline.sql` để theo đúng kiểu (tên bảng số nhiều, `BIGSERIAL`, `TIMESTAMPTZ DEFAULT NOW()`, `REFERENCES users(id) ON DELETE CASCADE`, `CHECK` cho ràng buộc giá trị).
2. Viết file: đầu file chú thích `-- <MÃ-TASK> (<ngày>): <mục đích>` + điều code phụ thuộc vào (hằng số khớp ở file nào). Thêm index cho cột lọc/sắp xếp. Số thưởng chưa chơi thử → chú thích `DESIGN_BASELINE`.
3. Code:
   - Repository mới/sửa trong `backend/repositories/` (`db_cursor(commit=True)` khi ghi).
   - Route trong `backend/routes/api.py`: lấy user từ `session`, khách → 401; kiểm kiểu bằng `is_int`/`is_clear_time`… (bool không được tính là int); lỗi đầu vào → 400.
   - Thêm level/chương → cập nhật `VALID_LEVEL_IDS` / `VALID_CHAPTER_IDS` và phía JS (`progress.js` `level_id`).
   - Thêm thành tựu → dòng seed + 1 luật trong `ACHIEVEMENT_RULES` (`backend/services/game_service.py`).
   - Tiền tệ: chỉ đổi `users.gold/gems` cùng 1 dòng `currency_transactions` (UNIQUE chống cộng trùng).
4. Test:
   - `tests/test_time_api.py` (không cần DB): monkeypatch hàm repository trong module `api`, test 401 khách, 400 dữ liệu sai (tham số hoá), 200 dữ liệu đúng.
   - `tests/test_app.py` (DB thật): bảng người chơi mới → thêm vào `PLAYER_TABLES` để fixture TRUNCATE; thêm test luồng thật.
   - `python -m pytest tests -q`. `test_app.py` skip khi thiếu `SUTA_TEST_DATABASE_URL` → báo rõ test DB chưa chạy.
5. Áp migration: lần chạy server tiếp theo (`app.py` gọi `run_migrations()`) sẽ áp vào **DB dev của người dùng** — báo trước khi chạy; kiểm bằng gọi API thật qua `/verify-ui` hoặc `curl`.
6. Cập nhật rule `backend.md` (bảng/API mới) và report.
