# REPORT TQP-SKELETON — Khung chương Triệu Việt Vương

Task card: [SUTA_TQP_TASK_SKELETON_01.md](SUTA_TQP_TASK_SKELETON_01.md) • 04/11/2026 • **PASS** (S2 chạy trên DB dev, chưa chạy trên DB test — xem dưới)
Yêu cầu người dùng: lập kế hoạch chương 4 từ sheet "4 Triệu Việt Vương", rồi dựng khung chương theo task card đã duyệt.

## Quyết định người dùng chốt
- (03/11, TQP-00) Người chơi là nghĩa sĩ, Triệu Quang Phục là NPC; sách mở khoá NPC màn 2 (3/6/10); thêm đòn bổ từ trên, ẩn nấp lau sậy, khu rèn luyện; giữ đủ 50 câu.
- (04/11) Duyệt luôn pool câu hỏi (TQP-00 §3.3), tên 3 màn (§5.1), tên 3 phần thưởng (§3.4), thưởng + 4 thành tựu (§9) → seed đủ trong migration `008`.
- (04/11) Thẻ trang chủ **giữ khoá** tới TQP-L1; asset tạm trỏ manifest chương 3.

## File
| File | Việc |
|---|---|
| `frontend/static/assets/question/trieu-quang-phuc-question.json` (mới) | 50 câu chuyển từ Excel (script đọc xlsx bằng thư viện chuẩn, ở scratchpad, không vào repo) |
| `frontend/static/js/levels/trieu-quang-phuc/{main,chapter,config,level1,level2,level3,dialogue-data,audio-data}.js` (mới) | Khung chương 4: `TRIEU_QUANG_PHUC` (id 4, key `tqp`), 3 màn tối giản, asset chương 3 (`PLACEHOLDER`) |
| `frontend/static/js/levels/trieu-quang-phuc/questions-data.js` (mới, sinh tự động) | 50 câu + `LEVEL1_QUESTION_POOL` (35) + `NPC_QUESTION_POOLS` (trieuTuc 5, lyNamDe 5, chuDongTu 5) |
| `frontend/templates/gameplay/levels/trieu-quang-phuc.html` (mới) | Template chương, chưa có khe kỹ năng |
| `backend/migrations/008_trieu_quang_phuc.sql` (mới) | Chương 4, level 401–403 (173/259/346 vàng + 12 KC), 3 phần thưởng, 4 thành tựu `TQP_*` |
| `backend/routes/pages.py` | 3 route `/gameplay/levels/trieu-quang-phuc[/2|/3]` |
| `backend/routes/api.py` | `VALID_LEVEL_IDS` + 401–403, `VALID_CHAPTER_IDS` + 4 |
| `backend/services/game_service.py` | `CHAPTER_TQP_LEVELS` + 4 luật `TQP_*` |
| `tools/make_question_data.py` | Mục `trieu-quang-phuc` |
| `frontend/templates/components/home/leaderboard.html` | Tab `chapter-4` "🛶 TRIỆU VIỆT VƯƠNG" |
| `frontend/static/css/home/board.css` | Khoảng cách tab BXH 10 → 6 px để 6 tab vừa một hàng (người dùng chọn 04/11) |
| `frontend/templates/quiz.html`, `frontend/static/js/quiz.js` | Nút "Triệu Việt Vương" + `QUIZ_BANKS['trieu-quang-phuc']` |
| `tests/test_time_api.py` | Route 3 màn, save-time 401–403 nhận / 404 từ chối, tiến trình chương 4 (chương 5 → 404), BXH `chapter-4`/`level-403` hợp lệ (`chapter-5`, `level-404` sai), luật `TQP_*` |
| `tests/test_app.py` | `levels_total` 9 → 12; trang màn 3 chương 4; test thưởng + thành tựu chương 4; danh sách `schema_migrations` thêm 005–008 (test cũ chỉ liệt kê 001–004 — sẽ FAIL khi chạy với DB test, chưa ai chạy) |
| `.claude/launch.json` | Thêm cấu hình `su-ta-flask-5059` (cổng 5057 đang bị server của phiên khác giữ) |
| `.claude/rules/trieu-quang-phuc-gameplay.md` (mới), `.claude/rules/{backend,assets-32bit,history-content}.md`, `CLAUDE.md` | Ghi chương mới |
| `docs/SUTA_TQP_TASK_00.md` | Đánh dấu phần đã duyệt 04/11, link task card SKELETON |

Không sửa engine, không sửa file nào trong `js/levels/{trung-trac,ba-trieu,ly-nam-de}/`.

Khác task card: bẫy tạm là **lưới trúc `TR_BAMBOO_NET`** (manifest chương 3 không có hố chông), không có đá lở.

## Kết quả test
| # | Test | Kết quả |
|---|---|---|
| S1 | `pytest tests` | PASS — 120 passed, 1 skipped (`test_app.py` thiếu `SUTA_TEST_DATABASE_URL`) |
| S2 | Migration | PASS trên **DB dev** (khởi động server mới): `scope=all` → `levels_total` 12, `scope=chapter-4` → 3; `/api/game/achievements` có 4 `TQP_*` (86/86 vàng, 17/8 KC). Test DB **CHƯA CHẠY** |
| S3 | Câu hỏi | PASS — JSON 50/50 câu khớp Excel (chữ câu hỏi, 4 phương án, đáp án đúng, giải thích; đối chiếu bằng 2 lần đọc xlsx độc lập); script tự kiểm id trong pool tồn tại + không trùng; 4 pool phủ đủ 50 câu |
| S4 | Màn 1 | PASS — mô phỏng `update(1/60)`, trả lời đúng: 4 câu không trùng (39, 27, 17, 40), qua 2 khe sông + mỏm đá không rơi. Thiếu 2 sách → bị giữ ở x=4505 (đích 4512), báo "Bạn còn thiếu 2 Quyển Sách Tinh Hoa."; đủ 5/5 → panel "Sang Màn 2", 3000 điểm. *2 sách cuối được dời tới chỗ người chơi trong mô phỏng (bot nhảy theo nhịp cố định nên hụt) — chưa kiểm bằng tay việc nhặt được cả 5 quyển* |
| S5 | Màn 2 | PASS — 3 câu đúng thứ tự pool (32 trieuTuc → 43 lyNamDe → 13 chuDongTu) → "Sang Màn 3" |
| S6 | Màn 3 | PASS — 3 đợt lính (spawner 1→2→3), hết quân → panel "Hoàn thành chương Triệu Việt Vương"; "Chơi lại chương" xoá tiến trình, về màn 1 |
| S7 | Chặn vào thẳng + khoá tiến trình | PASS — vào `/trieu-quang-phuc/3` khi chưa qua → về `/trieu-quang-phuc`; `?debug=1` vào được; ghi `suta.tqp.progress`, `suta.{tt,bt,lnd}.progress` vẫn `null` |
| S8 | API | PASS ở mức test không DB (save-time 401–403, `PUT progress/4`). Tab BXH gọi `scope=chapter-4`, hiện "Chưa có dữ liệu xếp hạng". **Chưa chơi bằng tài khoản thật** |
| S9 | Hồi quy | PASS — 3 URL Lý Nam Đế + Trưng Trắc + Bà Triệu trả 200 đúng `main.js`; màn 1 Lý Nam Đế nạp đủ (5 sách, 4 câu, 10 hazard, 5 lính). `/quiz?chapter=trieu-quang-phuc` chọn sẵn chương 4, câu 1 là câu 41 chương 4. Console chỉ có 401 của khách + cảnh báo `maps_lnd.json: stage khác` (asset mượn, vô hại) |
| S10 | Giao diện | PASS một phần — chụp màn 1 (HUD "SUTA · TRIỆU VIỆT VƯƠNG", nền làng/sông mượn, khe sông). Trang không cuộn ngang ở 812×375, 375×812, 1024×768. Tab BXH: lúc đầu 6 tab tràn (764/750 px ở điện thoại ngang, 894/874 px ở 1024 px, tab "QUIZ" bị cắt) → người dùng chọn giảm khoảng cách tab 10 → 6 px: điện thoại ngang 750/750 một hàng, 1024 px 874/874 (vừa khít, không còn dư), điện thoại dọc vẫn cuộn ngang trong khung (744/330, như trước) |

Ghi chú mô phỏng: người chơi được hồi máu khi < 3 để kiểm luồng, không kiểm độ khó; đồng hồ màn không chạy trong mô phỏng nên panel ghi "Màn 1: —". Mô phỏng thắng màn 3 đặt cờ khách `suta.cleared.4` trong trình duyệt preview.

## Vấn đề asset
- Không có (chưa có asset riêng chương 4).

## Câu hỏi cho team / TODO
- Thanh tab BXH ở 1024 px đã vừa khít — thêm tab thứ 7 (chương 5) sẽ tràn lại; khi đó cần thu gọn chữ tab hoặc cho xuống hàng.
- Duyệt thoại NPC + cutscene + panel kết chương (TQP-00 §4, 5.2–5.5) — `dialogue-data.js` để trống.
- 6 câu/nội dung nghi vấn (TQP-00 mục 7) — đang dùng nguyên văn trong game và `/quiz`.
- Nhạc riêng chương (đang mượn nhạc chương 3).
- Chạy `test_app.py` trên DB test khi có `SUTA_TEST_DATABASE_URL`.

## Bước tiếp
TQP-ENGINE (sình, khói trôi, cá sấu, thuyền gọi viện, đòn bổ, NPC khoá theo sách, ẩn nấp, máu tối đa, bẫy ẩn) và prompt Codex `TQP_ART_01` (`/codex-prompt`).
