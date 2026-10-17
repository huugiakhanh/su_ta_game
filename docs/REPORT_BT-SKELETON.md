# REPORT BT-SKELETON — Khung chương Bà Triệu

Task card: [SUTA_BT_TASK_SKELETON_01.md](SUTA_BT_TASK_SKELETON_01.md) • 16/10/2026 • **PASS** (S2 chưa chạy được — xem dưới)

## Quyết định người dùng chốt
Duyệt nguyên đề xuất Q1–Q5: thẻ trang chủ giữ khoá; thưởng qua màn bằng chương 1 (`DESIGN_BASELINE`); `TT_FLAWLESS`/`TT_SCHOLAR` giữ nguyên (tính cả màn Bà Triệu); seed 3 phần thưởng chương 2 ngay trong `005`; có tab BXH "BÀ TRIỆU".

## File
| File | Mục đích |
|---|---|
| `frontend/static/js/levels/ba-trieu/{main,chapter,config,level1,level2,level3,dialogue-data,audio-data}.js` (mới) | Khung chương 2: `BA_TRIEU` (id 2, key `bt`), 3 màn tối giản, asset tạm chương 1 (`PLACEHOLDER`), không import file chương 1 |
| `frontend/static/js/levels/ba-trieu/questions-data.js` (mới, sinh tự động) | 45 câu (loại 15/33/37/41/45) + `LEVEL1_QUESTION_POOL` (32 câu) + `NPC_QUESTION_POOLS` (quocDat 6, hoLy 4, bachTuong 3) |
| `tools/make_question_data.py` (mới) | Sinh `questions-data.js` từ JSON câu hỏi; kiểm pool không trỏ câu bị loại/không tồn tại, không trùng giữa pool |
| `frontend/templates/gameplay/levels/ba-trieu.html` (mới) | Template chương kế thừa `base.html`, chưa có khe kỹ năng |
| `backend/migrations/005_ba_trieu.sql` (mới) | Seed chương 2, level 201–203 (100/150/200 vàng + 5 KC), 3 phần thưởng |
| `backend/routes/pages.py` | 3 route `/gameplay/levels/ba-trieu[/2|/3]` |
| `backend/routes/api.py` | `VALID_LEVEL_IDS` + 201–203, `VALID_CHAPTER_IDS` + 2 |
| `frontend/templates/components/home/leaderboard.html` | Tab `chapter-2` "🐘 BÀ TRIỆU" |
| `tests/test_time_api.py` | Route 3 màn, save-time 201–203 nhận / 204 từ chối, tiến trình chương 2 (chương 3 → 404), BXH `chapter-2`/`level-201` hợp lệ (test cũ coi `chapter-2` là sai → đổi sang `chapter-3`, thêm `level-204`) |
| `tests/test_app.py` | `levels_total` toàn game 3 → 6; thêm URL màn 3 Bà Triệu vào test trang |
| `.claude/rules/ba-trieu-gameplay.md` (mới), `.claude/rules/backend.md`, `CLAUDE.md` | Ghi chương mới |

Không sửa engine, không sửa file nào trong `js/levels/trung-trac/`.

## Kết quả test
| # | Test | Kết quả |
|---|---|---|
| S1 | `pytest tests` | PASS — 93 passed, 1 skipped |
| S2 | Migration 2 lần (DB test) | **CHƯA CHẠY** — máy không có `SUTA_TEST_DATABASE_URL`, `test_app.py` tự skip. Migration đã áp vào **DB dev** khi khởi động lại server: `GET /api/game/leaderboard?scope=chapter-2` → 200, `levels_total` = 3; `scope=all` → `levels_total` = 6 |
| S3 | `questions-data.js` | PASS — 45 câu, không có 15/33/37/41/45, script tự kiểm mọi id trong pool; nội dung chép từ JSON đã đối chiếu khớp Excel 50/50 |
| S4 | Màn 1 | PASS — mô phỏng `update(1/60)` (ô trình duyệt ẩn): nhặt 5/5 sách, 4 câu không trùng (24, 48, 21, 19), qua đích → panel "Sang Màn 2"; bỏ sách chạy thẳng tới đích → bị giữ ở x=4494 (đích 4512), báo "Bạn còn thiếu 5 Quyển Sách Tinh Hoa." |
| S5 | Màn 2 | PASS — 3 câu đúng thứ tự pool (27 quocDat → 44 hoLy → 36 bachTuong), qua đích → "Sang Màn 3" |
| S6 | Màn 3 | PASS — 3 đợt lính, hết quân → panel "Hoàn thành chương Bà Triệu" + "Chơi lại chương"/"Về trang chủ"; "Chơi lại chương" xoá tiến trình, về màn 1 |
| S7 | Chặn vào thẳng + khoá tiến trình | PASS — vào `/ba-trieu/3` khi chưa qua màn trước → về `/ba-trieu`; tiến trình ghi `suta.bt.progress`, `suta.tt.progress` vẫn `null` |
| S8 | Đăng nhập: kỷ lục + tiến trình lên server | PASS ở mức API test (không DB); **chưa chơi bằng tài khoản thật** (không tạo tài khoản thử trong DB dev). Tab BXH "BÀ TRIỆU" mở được, gọi `scope=chapter-2`, hiện "Chưa có dữ liệu xếp hạng" |
| S9 | Hồi quy | PASS — màn 1 Trưng Trắc nạp đúng (`key tt`, 4 câu hỏi, 5 sách, 8 hazard); `/quiz` không đổi; console chỉ có 401 tiến trình/kỷ lục của khách (đúng thiết kế) |
| S10 | Giao diện | PASS một phần — chụp màn 1 Bà Triệu (cảnh làng/rừng tạm, HUD 0/5 sách); BXH ở điện thoại ngang 812×375: 4 tab vừa khung (750/750px), không cuộn ngang trang. Chưa đo đủ 5 cỡ màn hình cho màn chơi |

Ghi chú mô phỏng: thời gian màn hiện 00:00 / "—" vì đồng hồ chạy trong vòng `requestAnimationFrame` (không chạy khi ô trình duyệt ẩn), không phải lỗi. Người chơi được cho bất tử trong mô phỏng để kiểm luồng, không kiểm độ khó.

## Thay đổi hành vi cần biết
- BXH "Toàn game" giờ tính 6 màn (`levels_total` 6) — cột "Đã qua màn" của người chơi cũ hiện x/6.
- `TT_FLAWLESS` / `TT_SCHOLAR` ("qua một màn…") sẽ trao cả khi qua màn Bà Triệu (Q3 — giữ nguyên, chờ team).

## TODO / chờ team
- Duyệt thoại NPC, cốt truyện, câu kết chương (BT-00 §4–5) — `dialogue-data.js` đang để trống/`TODO_MISSING`, panel hết chương tạm chỉ báo điểm.
- 5 câu tạm loại; thưởng vàng/KC chương 2; thành tựu `BT_*`; nhạc riêng chương.
- Chạy `test_app.py` trên DB test khi có `SUTA_TEST_DATABASE_URL`.

## Bước tiếp
BT-ENGINE Phase B (bục một chiều, lưng voi, hazard `vent`) với layout thử `?layout=engine` ở màn 1 Bà Triệu; song song soạn prompt Codex `BT_ART_01`.
