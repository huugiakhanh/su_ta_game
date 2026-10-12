# REPORT SUTA-QUIZ-LB — Bảng xếp hạng: Toàn game / Chương / Quiz

Ngày: 12/10/2026. Yêu cầu người dùng: BXH chỉ giữ xếp hạng toàn game, theo từng chương, và thêm xếp hạng phần Quiz (trang `/quiz`).

## Quyết định (người dùng chốt)
- BXH Quiz: **tổng số câu đúng** qua mọi lượt (giảm dần), hoà thì **tổng thời gian** (tăng dần). Trang quiz thêm đồng hồ.
- Quiz **không thưởng** vàng/kim cương.

## File đã sửa / tạo
| File | Mục đích |
|---|---|
| `backend/migrations/003_quiz_results.sql` (mới) | Bảng `quiz_results` (user, số câu, số đúng, giây) |
| `backend/repositories/quiz_repository.py` (mới) | `save_quiz_result`, `get_quiz_leaderboard` |
| `backend/routes/api.py` | `POST /api/quiz/result` (khách 401, kiểm dữ liệu); `scope=quiz` cho `/api/game/leaderboard`; trả thêm `kind` |
| `frontend/static/js/quiz.js`, `frontend/templates/quiz.html` | Đồng hồ ⏱ (chỉ tính lúc suy nghĩ, không tính 3,5 s xem giải thích); màn kết quả hiện số câu đúng + thời gian; gửi kết quả, khách được nhắc đăng nhập |
| `frontend/templates/home.html`, `frontend/static/js/home.js` | Tab: Toàn game / Trưng Trắc / Quiz (bỏ Màn 1–3); tiêu đề cột đổi theo loại bảng (`LEADERBOARD_COLUMNS`) |
| `tests/test_time_api.py`, `tests/test_app.py` | Test API quiz (repo giả) + test xếp hạng quiz (DB thật) |
| `CLAUDE.md` | Cập nhật mục Database/API/BXH |

API `scope=level-10x` **vẫn giữ** (chỉ ẩn khỏi giao diện) để không phá test/tương thích.

## Kết quả test
- `pytest tests`: 60 PASS, 1 skip (`test_app.py` — thiếu `SUTA_TEST_DATABASE_URL`, nên test DB `test_quiz_leaderboard_total_correct_then_time` **chưa chạy**).
- Kiểm thử tay trên server dev (5057): migration 003 chạy; làm quiz 1 câu → "Đã lưu vào bảng xếp hạng Quiz!"; tab Quiz hiện Câu đúng/Tỉ lệ/Thời gian/Số lượt + hạng của mình; quay lại tab Toàn game thì tiêu đề cột trở lại đúng; không lỗi console — PASS.

## TODO / lưu ý
- Kết quả quiz do trình duyệt gửi nên **chưa chống gian lận** (giống thời gian/điểm màn chơi).
- Ngân hàng câu `/quiz` (`trung-trac-question.json`) là của cả game hiện tại (chỉ Trưng Trắc); khi có chương mới, cân nhắc BXH quiz theo chương.
- Dữ liệu thử trong DB dev: 2 lượt quiz của tài khoản đang đăng nhập trên trình duyệt preview (5 câu/đúng 3/12 s và 1 câu/đúng 0/~1 s).
