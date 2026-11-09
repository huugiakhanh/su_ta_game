# REPORT PH-SKELETON — Khung chương Phùng Hưng

Ngày: 09/11/2026 • **PASS** (`test_app.py` chưa chạy trên DB test; chưa thử ghi bằng tài khoản thật và chưa chơi tay — xem dưới)
Task card: [SUTA_PH_TASK_SKELETON_01.md](SUTA_PH_TASK_SKELETON_01.md). Yêu cầu người dùng: lập kế hoạch chương 6 từ sheet "6 Phùng Hưng", rồi dựng khung chương theo task card đã duyệt.

## Hiện trạng / đo trước khi sửa
- Chương 6 chưa có code. Thẻ Phùng Hưng khoá "Sắp ra mắt"; thư viện `phung-hung` đã có.
- `pytest tests` trước khi sửa không đo riêng; lần gần nhất có số trong report MHD-SKELETON là 137 passed.
- Năm hiển thị lệch: dòng thời gian và `/history` 791, thẻ chọn tướng 766.

## Quyết định (người dùng chốt, 09/11/2026)
- Người chơi là nghĩa sĩ nam/nữ; Phùng Hưng là NPC.
- Câu hỏi: tra nguồn từng câu, giữ câu đúng, thay câu sai/lạc đề, đủ 50 câu. Đã duyệt giữ 17, sửa 13, thay 20.
- Sách + Vũ Khí Thô Sơ cùng mở khoá NPC màn 2.
- Thêm bù nhìn nhử hổ và cưỡi trâu; không làm đốt kho lương, không làm đấm trống đúng nhịp.
- Q1–Q5 theo đề xuất: không suy tôn trong cutscene, Bồ Phá Cần ghi "tương truyền", đáp án Đỗ Anh Hàn xoay quanh vây phủ, hổ hạ bằng đòn gồng, thư viện để team quyết.
- Duyệt nguyên văn: thoại NPC, tên màn, cutscene, panel, tên phần thưởng, thưởng/thành tựu, chia pool. Giữ "vác gỗ, xô trâu" của A1.
- Thẻ chọn tướng đổi 766 → 791.

## File đã sửa / tạo
| File | Việc |
|---|---|
| `frontend/static/assets/question/phung-hung-question.json` (mới) | 50 câu sinh bằng script ở scratchpad, không vào repo |
| `frontend/static/js/levels/phung-hung/*` (mới, 9 file) | Khung chương `PHUNG_HUNG` (id 6, key `ph`), 3 màn tối giản, asset chương 5 (`PLACEHOLDER`); `questions-data.js` sinh tự động |
| `frontend/templates/gameplay/levels/phung-hung.html` (mới) | Template chương, chưa có khe kỹ năng |
| `backend/migrations/011_phung_hung.sql` (mới) | Chương 6, level 601–603, 3 phần thưởng, 4 thành tựu |
| `backend/routes/pages.py`, `backend/routes/api.py` | 3 route; `VALID_LEVEL_IDS`, `VALID_CHAPTER_IDS` |
| `backend/services/game_service.py` | `CHAPTER_PH_LEVELS` + 4 luật `PH_*` |
| `tools/make_question_data.py` | Mục `phung-hung` |
| `frontend/templates/components/home/leaderboard.html` | Tab `chapter-6` |
| `frontend/templates/components/home/chapter.html` | Năm 766 → 791 |
| `frontend/templates/quiz.html`, `frontend/static/js/quiz.js` | Nút "Phùng Hưng" + `QUIZ_BANKS` |
| `tests/test_time_api.py`, `tests/test_app.py` | Route, save-time, tiến trình, luật `PH_*`, thưởng; `chapter-7`/`progress/7`/`level-604` là giá trị sai; `levels_total` 18 |
| `.claude/rules/phung-hung-gameplay.md` (mới), `.claude/rules/{backend,assets-32bit,history-content}.md`, `CLAUDE.md` | Ghi chương mới |
| `docs/SUTA_PH_TASK_00.md`, `docs/RESEARCH_PH_QUESTIONS.md`, `docs/SUTA_PH_TASK_SKELETON_01.md` (mới) | Kế hoạch, tra cứu, task card |

Không sửa engine và không sửa file nào trong `js/levels/` của chương 1–5. Thay đổi hành vi nhỏ ngoài yêu cầu: không.

**Không phải do phiên này:** `docs/SUTA_TQP_TASK_00.md`, `SUTA_TQP_TASK_ENGINE_01.md`, `SUTA_TQP_TASK_SKELETON_01.md` đang ở trạng thái bị xoá. Chưa đụng tới.

## Kết quả test
Mô phỏng bằng `update(1/60)` trên trình duyệt thật, lượt `?debug=1` (không ghi kỷ lục). Người chơi được đặt thẳng tới bia và sách, lính bị hạ bằng script.

| # | Test | Kết quả |
|---|---|---|
| S1 | `pytest tests` | PASS — 149 passed, 1 skipped (`test_app.py` thiếu `SUTA_TEST_DATABASE_URL`) |
| S2 | Migration | PASS trên **DB dev**: `scope=chapter-6` → `levels_total` 3; `scope=chapter-7` → 400; 4 thành tựu `PH_*` đúng tên và số thưởng (124/124 vàng, 20/10 KC). **`test_app.py` CHƯA CHẠY**, nên test thưởng 250/373/498 và idempotent chưa từng chạy |
| S3 | Câu hỏi | PASS — script đối chiếu: 17 câu giữ khớp Excel từng trường; 13 câu sửa chỉ khác đúng trường đã duyệt, chữ mới có nguyên văn trong RESEARCH §5; 20 câu thay khớp §6; `correct` 0–3, 4 phương án không trùng; câu 32 `correct: 3`. Pool 35 + 5 + 5 + 5 = 50, không trùng |
| S4 | Màn 1 | PASS — 4 câu không trùng (29, 2, 50, 31); thiếu 5 sách bị giữ ở x = 4494 (đích 4512), câu "Bạn còn thiếu 5 Quyển Sách Tinh Hoa."; đủ 5/5 → "Sang Màn 2" |
| S5 | Màn 2 | PASS — 3 câu đúng thứ tự pool (42 `phungHai` → 43 `doAnhHan` → 18 `boPhaCan`), → "Sang Màn 3" |
| S6 | Màn 3 | PASS — tối đa 3 lính cùng lúc, hết đợt → panel "Hoàn thành chương Phùng Hưng" đúng nguyên văn §5.3; "Chơi lại chương" về màn 1 |
| S7 | Chặn vào thẳng | PASS — `/phung-hung/3` không có tiến trình → về màn 1. Chỉ có khoá `suta.ph.progress`, không đụng khoá chương khác |
| S8 | API | Một phần — đọc BXH 200, `/api/game` không có request ghi trong lượt debug. PUT tiến trình và save-time chỉ PASS qua pytest (monkeypatch); **chưa ghi thật vào DB** |
| S9 | Hồi quy | PASS — màn 1 của 5 chương trước: đúng `CHAPTER.key`, 0 request lỗi; `/quiz` 6 bộ JSON 200, mỗi bộ 50 câu. Console chỉ có 400 do tôi gọi thử `chapter-7` và 401 của khách. Chưa chơi lại các màn này |
| S10 | Giao diện | PASS — BXH 8 tab: 1366 và 1024 px xuống 2 hàng, không tràn; 812×375 và 375×812 cuộn ngang trong dải tab (261 và 681 px), trang không tràn. `/quiz` 375 px: 6 nút, 0 bị cắt. Màn 1: 1366×768 canvas 1362×655, 812×375 canvas 523×221, không thanh cuộn. Thẻ chọn tướng hiện Năm 791, vẫn khoá |

Console màn 1 có cảnh báo lệch `stage_length` của `maps_mhd.json` (9216 so với 4608): do mượn map chương 5, hết khi có `maps_ph.json`.

## Vấn đề asset
Không có. Toàn bộ asset là mượn tạm.

## Câu hỏi cho team / TODO
- `TODO_MISSING`: nhạc riêng chương 6, đang phát tạm nhạc chương 5.
- Trang thư viện `phung-hung` viết Phùng Hưng "được suy tôn" khi vào Tống Bình, lệch Toàn thư và *Việt điện u linh* (RESEARCH §2 mục 1): team quyết.
- Các câu 24, 25, 40, 46 dựa trên truyền thuyết hoặc nguồn yếu; 37, 44, 50 khá khó với học sinh.
- Muốn chạy `test_app.py` cần `SUTA_TEST_DATABASE_URL`.
- Tiếp theo: PH-ENGINE (E1–E6) + prompt Codex `PH_ART_01`.
