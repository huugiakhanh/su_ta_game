---
paths:
  - "backend/**"
  - "tests/**"
  - "app.py"
---

# Backend — Flask + PostgreSQL

Lý do quyết định: `docs/archive/SUTA_DB_TASK_01.md`, `REPORT_SUTA-DB-01.md`. Thêm migration: skill `/add-migration`.

## Cấu trúc

- `__init__.py` — application factory `create_app()`; `config.py` — biến môi trường (`.env` qua python-dotenv).
- `db.py` — kết nối psycopg2 (`db_cursor(commit=...)`) + `run_migrations()` (gọi trong `app.py`).
- `routes/pages.py` — route trả HTML; `routes/api.py` — `/login`, `/register`, `/api/*`. Không viết SQL trong route.
- `repositories/` — user, progress, record (BXH game), quiz (BXH quiz), achievement. `services/game_service.py` — `complete_level()`: kỷ lục + thưởng + thành tựu trong **1 transaction**.
- `data/library_heroes.json` — nội dung trang Thư viện lịch sử (đọc lại mỗi request trong `pages.py`).

## Database

- **Migration**: `migrations/NNN_ten.sql`; `run_migrations()` chạy file chưa có trong `schema_migrations`, mỗi file 1 transaction. Đổi schema = **thêm file mới**, không sửa file đã chạy. `001_baseline.sql` drop bảng cũ và tạo lại toàn bộ.
- **Danh mục** (seed trong migration, Source of Truth cho id): `chapters` (1 = Trưng Trắc, 2 = Bà Triệu — migration 005), `levels` (id = 100 × chương + màn → 101–103, 201–203, kèm `first_clear_gold/gems`), `rewards` (3 phần thưởng NPC màn 2 mỗi chương), `achievements`. Số thưởng/thành tựu là `DESIGN_BASELINE`.
- **Người chơi**:
  - `users` (`username`, `password_hash` werkzeug, `display_name`, `gold`, `gems`, `avatar` `male`|`female`).
  - `chapter_progress` (+ `chapter_progress_rewards`) = object `progress` của `progress.js` (`levelNComplete` ⇔ `cleared_level ≥ N`).
  - `level_records` (mọi lượt qua màn + `stats` JSONB); `user_level_stats` (tốt nhất mỗi người/màn — dùng cho BXH và phát hiện qua lần đầu).
  - `user_achievements`; `currency_transactions` — sổ cái vàng/KC, UNIQUE `(user_id, reason, ref)` → không cộng trùng; `users.gold/gems` **chỉ đổi cùng 1 dòng ở đây**.
  - `quiz_results` (mỗi lượt `/quiz`: số câu, số đúng, giây; không thưởng).
- **Thành tựu**: điều kiện là hàm Python trong `ACHIEVEMENT_RULES` (`services/game_service.py`, khớp `code` trong bảng). Thêm thành tựu = dòng seed trong migration mới + 1 luật.
- **Kinh tế**: chỉ có thưởng qua màn lần đầu + thưởng thành tựu; tài khoản mới 0 vàng / 0 KC.

## API

- Auth: `/api/auth/*` (session lưu `user_id`, không tin username trong payload). `/me` trả `name`, `gold`, `gems`, `levels_cleared`, `avatar`; `register` nhận `avatar`; `POST /api/auth/avatar` đổi avatar; `POST /api/auth/logout`.
- `POST /api/game/save-time` (401 nếu chưa đăng nhập): `level_id ∈ VALID_LEVEL_IDS`, `0 < clear_time ≤ 24h`, `score` nguyên ≥ 0, `stats` tuỳ chọn (`hits_taken`, `quiz_correct`, `quiz_total`). Trả `first_clear`, `gold_gained`, `gems_gained`, `new_achievements`.
- `GET/PUT/DELETE /api/game/progress/<chương>` (khách 401).
- `GET /api/game/leaderboard?scope=all|chapter-<id>|quiz` → `kind` `game`|`quiz`, `data` top 10, `me` (hạng của người đang đăng nhập kể cả ngoài top), bảng game thêm `levels_total`. Game: tổng điểm tốt nhất mỗi màn giảm dần, hoà thì tổng thời gian tăng dần. Quiz: tổng câu đúng giảm dần, hoà thì tổng thời gian tăng dần. `scope=level-<id>` vẫn nhận nhưng trang chủ không còn tab màn.
- `POST /api/quiz/result` (`question_count` 1–200, `correct_count ≤ question_count`, `time_seconds`; khách 401).
- `GET /api/game/achievements` (khách vẫn xem danh mục).
- `GET /components/home/<tên>` (`pages.py`) — partial cửa sổ trang chủ, chỉ nhận tên trong `HOME_COMPONENTS`.

## Test

- `tests/test_time_api.py` — không cần DB: monkeypatch hàm repository trong module `api`. Thêm endpoint thì thêm test ở đây.
- `tests/test_app.py` — PostgreSQL thật qua `SUTA_TEST_DATABASE_URL` (DB riêng; fixture TRUNCATE bảng người chơi — thêm bảng người chơi mới thì thêm vào `PLAYER_TABLES`). Tự skip nếu thiếu biến.
