# REPORT NQ-SKELETON — Khung chương Ngô Quyền

Ngày: 11/11/2026 • **PASS** (`test_app.py` chưa chạy trên DB test; chưa thử ghi bằng tài khoản thật và chưa chơi tay — xem dưới)
Task card: [SUTA_NQ_TASK_SKELETON_01.md](SUTA_NQ_TASK_SKELETON_01.md). Yêu cầu người dùng: lập kế hoạch chương 7 từ sheet "7 Ngô Quyền", rồi dựng khung chương theo task card đã duyệt.

## Hiện trạng / đo trước khi sửa
- Chương 7 chưa có code. Dòng thời gian có thẻ "Năm 938" khoá "Chờ mở khóa"; cửa sổ chọn tướng **chưa có** thẻ Ngô Quyền; thư viện `ngo-quyen` + ảnh `ngo_quyen.webp` đã có.
- `pytest tests` trước khi sửa: 149 passed, 1 skipped (số trong REPORT_PH-SKELETON; không đo lại riêng).

## Quyết định (người dùng chốt, 11/11/2026)
- Người chơi là nghĩa sĩ nam/nữ; Ngô Quyền là NPC dẫn màn 1 + nhân vật cutscene màn 3.
- Engine thêm thuyền lái + thủy triều + gió ngược + xoáy nước; không làm bơi.
- Thêm ngoài A1: đẽo và cắm cọc (màn 2), ném lao, mini-boss Kiều Công Tiễn.
- Chướng ngại chia theo sử (quân Nam Hán chỉ từ màn 2). Boss dùng máy bắn đá + nỏ lửa, không "pháo".
- Số cọc cắm là phần thưởng thêm (tối thiểu 3/6).
- Q1: giữ Dương Đình Nghệ, hiện dạng hồi tưởng năm 937. Q2–Q3: Kiều Công Hãn, Ngô Xương Ngập ghi "Tương truyền" (dòng chú trên khung thoại). Q4: Hoằng Tháo "bỏ mạng giữa dòng Bạch Đằng".
- Bộ 50 câu: giữ 40, sửa 4, thay 6, dùng câu 50 mới (Tràng Kênh), không dùng câu dự phòng.
- Duyệt nguyên văn thoại NQ-00 §4–5 kèm 3 sửa (2 dòng chú "Tương truyền", mốc 937 trong thông báo màn 1); duyệt pool, 3 phần thưởng, thưởng 300/448/598 + 19 KC.
- NQ-SKELETON Q1: thêm thẻ Ngô Quyền vào cửa sổ chọn tướng ngay, để khoá.

## File đã sửa / tạo
| File | Việc |
|---|---|
| `frontend/static/assets/question/ngo-quyen-question.json` (mới) | 50 câu sinh bằng script ở scratchpad (không vào repo) |
| `frontend/static/js/levels/ngo-quyen/*` (mới, 9 file) | Khung chương `NGO_QUYEN` (id 7, key `nq`), 3 màn tối giản, asset chương 6 (`PLACEHOLDER`); `questions-data.js` sinh tự động |
| `frontend/templates/gameplay/levels/ngo-quyen.html` (mới) | Template chương, chưa có khe kỹ năng |
| `backend/migrations/012_ngo_quyen.sql` (mới) | Chương 7, level 701–703, 3 phần thưởng, 4 thành tựu |
| `backend/routes/pages.py`, `backend/routes/api.py` | 3 route; `VALID_LEVEL_IDS` + 701–703, `VALID_CHAPTER_IDS` + 7 |
| `backend/services/game_service.py` | `CHAPTER_NQ_LEVELS` + 4 luật `NQ_*` |
| `tools/make_question_data.py` | Mục `ngo-quyen` + dòng "Chạy:" |
| `frontend/templates/components/home/leaderboard.html` | Tab `chapter-7` "🌊 NGÔ QUYỀN" |
| `frontend/templates/components/home/chapter.html` | Thẻ Ngô Quyền khoá (Năm 938, "(Tiền Ngô Vương)") |
| `frontend/templates/quiz.html`, `frontend/static/js/quiz.js` | Nút "Ngô Quyền" + `QUIZ_BANKS['ngo-quyen']` |
| `tests/test_time_api.py`, `tests/test_app.py` | Route, save-time, tiến trình, luật `NQ_*`, thưởng; giá trị sai đổi sang `chapter-8`/`progress/8`/`level-704`; `levels_total` 21 |
| `.claude/rules/ngo-quyen-gameplay.md` (mới), `.claude/rules/{backend,assets-32bit,history-content}.md`, `CLAUDE.md` | Ghi chương mới |
| `docs/SUTA_NQ_TASK_00.md`, `docs/RESEARCH_NQ_QUESTIONS.md`, `docs/SUTA_NQ_TASK_SKELETON_01.md`, `docs/REPORT_NQ-SKELETON.md` (mới) | Kế hoạch, tra cứu, task card, report |

Không sửa engine và không sửa file nào trong `js/levels/` của chương 1–6. `docs/architecture.md` không liệt kê chương nên không sửa.

Thay đổi ngoài task card:
- **Icon `NQ_CLEAR_2` đổi 🪵 → 🔨.** Đo trên trình duyệt Windows 10: 🪵 vẽ ra ô trống (192 px mực, không màu, giống hệt 🪙); 🔨 410 px, có màu. Migration 012 đã chạy trên **DB dev** lúc khởi động server với 🪵, nên tôi sửa file 012 (chưa commit, chưa máy nào khác chạy) và cập nhật đúng 1 dòng `achievements` trên DB dev (`UPDATE … WHERE code = 'NQ_CLEAR_2' AND icon = '🪵'`, 1 dòng).
- Đá trong màn 1 là đá ong **rơi** (`snare`, `OB_PH_LATERITE_ROCK`) thay cho "đá lăn": chương 6 không có `OB_BOULDER` và đá ong không có animation lăn. Task card đã ghi khả năng này.

## Kết quả test
Mô phỏng bằng `update(1/60)` trên trình duyệt thật. Lính và đá bị tắt bằng script; người chơi được đặt thẳng tới bia và sách.

| # | Test | Kết quả |
|---|---|---|
| S1 | `pytest tests` | PASS — 162 passed, 1 skipped (`test_app.py` thiếu `SUTA_TEST_DATABASE_URL`) |
| S2 | Migration | PASS trên **DB dev**: `scope=chapter-7` → 200, `levels_total` 3; `chapter-8` → 400; 4 thành tựu `NQ_*` đúng tên và số (149/149 vàng, 24/12 KC). **`test_app.py` CHƯA CHẠY**: chưa kiểm thưởng 300/448/598 + 19 KC qua `save-time` và tính idempotent |
| S3 | Câu hỏi | PASS — script đối chiếu: 40 câu giữ khớp Excel từng trường; 4 câu sửa chỉ khác đúng trường đã duyệt (20, 38: câu hỏi; 23: câu hỏi + giải thích; 33: phương án A); 6 câu thay khớp RESEARCH §6, `correct: 0`; mọi câu 4 phương án không trùng. Pool 35 + 5 + 5 + 5 = 50, không trùng |
| S4 | Màn 1 | PASS — 4 câu không trùng (36, 30, 24, 41, đều trong pool màn 1); thiếu sách bị giữ ở x = 4472 (đích 4512); đủ 5/5 → panel "Hoàn thành Màn 1" + "Sang Màn 2" |
| S5 | Màn 2 | PASS — 3 câu đúng thứ tự pool (6 `duongDinhNghe` → 31 `kieuCongHan` → 46 `ngoXuongNgap`) → "Sang Màn 3" |
| S6 | Màn 3 | PASS — 3 đợt hạ đủ 2 + 3 + 3 = 8 lính, tối đa 1 lính sống cùng lúc (do script hạ nhanh) → panel "Hoàn thành chương Ngô Quyền" đúng nguyên văn §5.3, nút "Sang Màn 4" ẩn; "Chơi lại chương" về màn 1 và xoá tiến trình |
| S7 | Chặn vào thẳng | PASS — xoá tiến trình rồi mở `/ngo-quyen/3` → về màn 1. sessionStorage chỉ có `suta.nq.progress` |
| S8 | API | Một phần — BXH 200, thành tựu 200. Lượt chơi là khách nên save-time 401; PUT tiến trình và save-time chỉ PASS qua pytest (monkeypatch); **chưa ghi thật vào DB** |
| S9 | Hồi quy | PASS — màn 1 của 6 chương trước nạp đúng `CHAPTER.key` (tt, bt, lnd, tqp, mhd, ph); `/quiz` 7 bộ JSON 200, mỗi bộ 50 câu; console chỉ có 401 của khách và 400 do tôi gọi thử `chapter-8`. Chưa chơi lại các màn này |
| S10 | Giao diện | PASS — BXH 9 tab: 1366 và 1024 px xuống 2 hàng, không tràn; 812×375 và 375×812 cuộn ngang trong dải tab (1140/750 và 1140/330 px), trang không tràn. Chọn tướng 7 thẻ: không tràn ngang ở cả 4 cỡ (3 hàng; 375 px 4 hàng, cuộn dọc trong cửa sổ). `/quiz` 375 px: 7 nút, 0 bị cắt, `?chapter=ngo-quyen` chọn đúng, câu đầu thuộc bộ Ngô Quyền (câu 16). Màn 1: 1366×768 canvas 1362×655, 812×375 canvas 523×221, không thanh cuộn |

Console màn 1 có cảnh báo lệch `stage_length` của `maps_ph.json` (9216 so với 4608) do mượn map chương 6; hết khi có `maps_nq.json`. Thời gian màn 2–3 ghi 0 vì chạy mô phỏng tay (đồng hồ màn chỉ chạy trong `requestAnimationFrame`).

Trong lúc kiểm, lượt mô phỏng thắng màn 3 (không có `?debug`) đặt cờ `suta.cleared.7` trong localStorage của trình duyệt kiểm thử; tôi đã xoá cờ này.

## Vấn đề asset
Không có. Toàn bộ asset là mượn tạm.

## Câu hỏi cho team / TODO
- `TODO_MISSING`: nhạc riêng chương 7, đang phát tạm nhạc chương 6.
- Câu 36 (đền thờ ở Hải Phòng) và câu 50 mới (cọc ở bảo tàng Tràng Kênh) có độ chắc thấp — RESEARCH_NQ ghi team kiểm thêm.
- Muốn chạy `test_app.py` cần `SUTA_TEST_DATABASE_URL`.
- Tiếp theo: NQ-ENGINE (E1–E5) + prompt Codex `NQ_ART_01`.
