# REPORT LND-SKELETON — Khung chương Lý Nam Đế

Task card: [SUTA_LND_TASK_SKELETON_01.md](SUTA_LND_TASK_SKELETON_01.md) • 31/10/2026 • **PASS** (S2 chạy trên DB dev, chưa chạy trên DB test — xem dưới)
Yêu cầu người dùng: lập kế hoạch chương 3 từ sheet "3 Lý Bí", rồi dựng khung chương theo task card đã duyệt.

## Quyết định người dùng chốt (31/10/2026)
- Duyệt luôn pool câu hỏi (LND-00 §3.3), tên 3 màn (§5.1), thưởng + 4 thành tựu (§9) → seed đủ trong migration `007`.
- Buff Tinh Thiều tên **"Lương thảo dồi dào"** (`BUFF_LND_SUPPLY`).
- Thẻ Lý Nam Đế trên trang chủ **giữ khoá** tới LND-L1; chương chỉ vào bằng URL.
- Asset tạm **mượn chương 2** (trỏ manifest, không chép ảnh).
- (30/10, LND-00) Giữ đủ 50 câu; người chơi là nghĩa sĩ, Lý Bí là NPC; slug `ly-nam-de`.

## File
| File | Việc |
|---|---|
| `frontend/static/js/levels/ly-nam-de/{main,chapter,config,level1,level2,level3,dialogue-data,audio-data}.js` (mới) | Khung chương 3: `LY_NAM_DE` (id 3, key `lnd`), 3 màn tối giản, asset tạm chương 1–2 (`PLACEHOLDER`), không import file chương 1–2 |
| `frontend/static/js/levels/ly-nam-de/questions-data.js` (mới, sinh tự động) | 50 câu + `LEVEL1_QUESTION_POOL` (36) + `NPC_QUESTION_POOLS` (phamTu 5, tinhThieu 4, trieuTuc 5) |
| `frontend/templates/gameplay/levels/ly-nam-de.html` (mới) | Template chương kế thừa `base.html`, chưa có khe kỹ năng |
| `backend/migrations/007_ly_nam_de.sql` (mới) | Chương 3, level 301–303 (144/216/288 vàng + 10 KC), 3 phần thưởng, 4 thành tựu `LND_*` |
| `backend/routes/pages.py` | 3 route `/gameplay/levels/ly-nam-de[/2|/3]` |
| `backend/routes/api.py` | `VALID_LEVEL_IDS` + 301–303, `VALID_CHAPTER_IDS` + 3 |
| `backend/services/game_service.py` | `CHAPTER_LND_LEVELS` + 4 luật `LND_*` |
| `tools/make_question_data.py` | Thêm mục `ly-nam-de`; dòng "câu loại" ghi "không có" khi danh sách rỗng |
| `frontend/templates/components/home/leaderboard.html` | Tab `chapter-3` "🏯 LÝ NAM ĐẾ" |
| `frontend/templates/quiz.html`, `frontend/static/js/quiz.js` | Nút "Lý Nam Đế" + `QUIZ_BANKS['ly-nam-de']` (`excluded: []`) |
| `tests/test_time_api.py` | Route 3 màn, save-time 301–303 nhận / 304 từ chối, tiến trình chương 3 (chương 4 → 404), BXH `chapter-3`/`level-303` hợp lệ (test cũ coi `chapter-3`/`progress/3` là sai → đổi sang chương 4, thêm `level-304`), luật `LND_*` |
| `tests/test_app.py` | `levels_total` toàn game 6 → 9; trang màn 3 Lý Nam Đế; test thưởng + thành tựu chương 3 |
| `.claude/rules/ly-nam-de-gameplay.md` (mới), `.claude/rules/{backend,assets-32bit}.md`, `CLAUDE.md` | Ghi chương mới |
| `docs/SUTA_LND_TASK_00.md` | Đánh dấu phần đã duyệt 31/10, tên buff, link task card SKELETON |

Không sửa engine, không sửa file nào trong `js/levels/trung-trac/` hay `js/levels/ba-trieu/`.

Thay đổi nhỏ so với task card: lính Lương tạm dùng **lính Ngô thường `EN_NGO_SOLDIER`** (task card ghi lính đốn gỗ) — giống lính tuần tiễu hơn; màn 1 khung **không có cổng đích** (cổng trại chương 2 không hợp cảnh).

## Kết quả test
| # | Test | Kết quả |
|---|---|---|
| S1 | `pytest tests` | PASS — 108 passed, 1 skipped (`test_app.py` thiếu `SUTA_TEST_DATABASE_URL`) |
| S2 | Migration | PASS trên **DB dev** (khởi động lại server): `scope=all` → `levels_total` 9, `scope=chapter-3` → 3; `/api/game/achievements` có 4 `LND_*` (72/72 vàng, 14/7 KC). Test DB (`test_migrations_are_idempotent`, `test_ly_nam_de_rewards_and_achievements`) **CHƯA CHẠY** |
| S3 | `questions-data.js` | PASS — 50 câu, script tự kiểm mọi id trong pool tồn tại + không trùng; pool đúng LND-00 §3.3 |
| S4 | Màn 1 | PASS — mô phỏng `update(1/60)`, trả lời đúng: 5/5 sách, 4 câu không trùng (29, 12, 4, 50), qua đích x=4514 → panel "Sang Màn 2", 3050 điểm. Bỏ sách → bị giữ ở x=4494 (đích 4512), báo "Bạn còn thiếu 5 Quyển Sách Tinh Hoa." |
| S5 | Màn 2 | PASS — 3 câu đúng thứ tự pool (14 phamTu → 7 tinhThieu → 34 trieuTuc), → "Sang Màn 3" |
| S6 | Màn 3 | PASS — 3 đợt lính (spawner index 0→3), hết quân → panel "Hoàn thành chương Lý Nam Đế" + "Chơi lại chương"/"Về trang chủ"; "Chơi lại chương" xoá tiến trình, về màn 1 |
| S7 | Chặn vào thẳng + khoá tiến trình | PASS — vào `/ly-nam-de/3` khi chưa qua → về `/ly-nam-de`; `?debug=1` vào thẳng màn 3; ghi `suta.lnd.progress`, `suta.tt.progress`/`suta.bt.progress` vẫn `null` |
| S8 | API | PASS ở mức test không DB (save-time 301–303, `PUT progress/3`). Tab BXH "LÝ NAM ĐẾ" gọi `scope=chapter-3`, hiện "Chưa có dữ liệu xếp hạng". **Chưa chơi bằng tài khoản thật** |
| S9 | Hồi quy | PASS — màn 1 Trưng Trắc (5 sách, 4 câu, 8 hazard), 3 màn Bà Triệu nạp đúng; `/quiz` chọn sẵn chương 3 từ `?chapter=ly-nam-de`, nạp JSON 200, câu 1 là câu chương 3. Console chỉ có 401 tiến trình/kỷ lục của khách (đúng thiết kế) + cảnh báo `maps_bt.json: stage khác` (asset mượn, vô hại) |
| S10 | Giao diện | PASS một phần — chụp màn 1 (HUD "SUTA · LÝ NAM ĐẾ", 5 tim, 0/5 sách, nền làng mượn). BXH: điện thoại ngang 812×375 → 5 tab một hàng, 750/750 px, trang không cuộn ngang; điện thoại dọc 375×812 → thanh tab cuộn ngang trong khung (592/330 px, như trước), trang không cuộn ngang. Chưa đo đủ 5 cỡ cho màn chơi |

Ghi chú mô phỏng: người chơi được hồi máu khi < 3 để kiểm luồng, không kiểm độ khó. Mô phỏng thắng màn 3 đã đặt cờ khách `suta.cleared.3` trong trình duyệt preview (chưa thẻ nào dùng cờ này).

## Vấn đề asset
- Không có (chưa có asset riêng chương 3).

## Câu hỏi cho team / TODO
- Duyệt thoại NPC + câu chữ còn lại (LND-00 §4–5) — `dialogue-data.js` để trống, panel hết chương tạm chỉ báo điểm.
- 8 câu nghi vấn (LND-00 mục 7) — đang dùng nguyên văn trong game và `/quiz`.
- Nhạc riêng chương (đang mượn nhạc chương 2).
- Chạy `test_app.py` trên DB test khi có `SUTA_TEST_DATABASE_URL`.

## Bước tiếp
LND-ENGINE (sông + thuyền, bẫy lưới công tắc ẩn, đạn chéo, rơi vật phẩm, khiên theo hướng) và prompt Codex `LND_ART_01` (`/codex-prompt`).
