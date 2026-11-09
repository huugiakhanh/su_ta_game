# SỬ TA — CHƯƠNG 6: PHÙNG HƯNG
# TASK CARD: PH-SKELETON — KHUNG CHƯƠNG `phung-hung` CHẠY BẰNG ASSET CHƯƠNG 5

TASK_ID: PH-SKELETON • Version 1.0 • 09/11/2026 • **ĐÃ DUYỆT, ĐÃ LÀM** — report [REPORT_PH-SKELETON.md](REPORT_PH-SKELETON.md)
Task card tổng: [SUTA_PH_TASK_00.md](SUTA_PH_TASK_00.md) (§1 thông số, §3.3 pool, §3.4 phần thưởng, §5.1 tên màn, §8 thưởng). Câu hỏi: [RESEARCH_PH_QUESTIONS.md](RESEARCH_PH_QUESTIONS.md) §4–6.
Mẫu: [SUTA_MHD_TASK_SKELETON_01.md](SUTA_MHD_TASK_SKELETON_01.md) + [REPORT_MHD-SKELETON.md](REPORT_MHD-SKELETON.md)
Rule áp dụng: `engine.md`, `mai-hac-de-gameplay.md` (mẫu), `backend.md`, `web-pages.md`, `history-content.md`, `assets-32bit.md`; skill `/add-migration`

---

## 0. MỤC TIÊU

Dựng đủ đường đi của chương 6 từ trình duyệt tới DB: 3 URL màn chơi chạy được; tiến trình màn 1 → 2 → 3 → panel hết chương; kỷ lục + tiến trình lưu server; BXH có tab chương; `/quiz` có bộ câu Phùng Hưng; thưởng + thành tựu chương 6 trong DB. Nội dung màn **tối giản**, dùng asset + hành vi có sẵn của chương 5, để PH-ENGINE và PH-L1/L2/L3 chỉ việc thay nội dung.

**Không làm:** NPC dẫn màn, thoại NPC màn 2, khoá NPC, Vũ Khí Thô Sơ, cutscene, kỹ năng, boss Cao Chính Bình, hổ, trâu, xe muối, đòn gồng (thuộc PH-ENGINE và PH-L1/L2/L3); asset mới; cơ chế engine mới; mở thẻ trang chủ.

## 1. QUY TẮC

1. **Không import file nào của chương khác.** Bảng ánh xạ sprite cần dùng thì khai báo lại trong `phung-hung/config.js`, ghi `PLACEHOLDER — asset chương 5, thay ở PH-L<n>`.
2. Asset tạm: `SPRITE_ROOT`/`MAP_ROOT` trỏ thẳng `images/mai-hac-de/` (`manifest_mhd.json`, `maps_mhd.json`), có sẵn `EN_TANG_ESCORT`, `OB_BOULDER`, `ITEM_LND_HEAL`. Map chương 1–3 mượn qua `BORROWED_MAPS` như chương 5. **Không chép ảnh**, chưa tạo `images/phung-hung/` (Codex tạo ở `PH_ART_01`).
3. Câu chữ hiển thị chỉ dùng: tên màn (PH-00 §5.1), câu hỏi từ JSON, panel kết chương (PH-00 §5.3), câu thông báo kỹ thuật (`TEXT`). Câu chữ đã duyệt nhưng chưa có màn để dùng (thoại, cutscene) đưa vào ở PH-L1/L2/L3.
4. Số mới (độ dài màn, vị trí, số đợt lính) là `DESIGN_BASELINE`.
5. **Không sửa engine.** Chương 6 không thêm trường tiến trình. Thiếu gì ở engine → dừng và báo.

---

## 2. TRIỂN KHAI

### 2.1 Ngân hàng câu hỏi — `frontend/static/assets/question/phung-hung-question.json` (mới)

- Sinh bằng script tạm ở scratchpad (đọc xlsx bằng thư viện chuẩn, không cài gói, không đưa vào repo): lấy Excel sheet "6 Phùng Hưng" A3:H52, áp RESEARCH §5 (13 câu sửa) và §6 (20 câu thay). Định dạng như `mai-hac-de-question.json`: `{ id, question, options[4], correct (0–3), explanation }`; `id` = STT Excel.
- 17 câu giữ chép **nguyên văn**. Câu sửa chỉ đổi đúng các trường RESEARCH §5 nêu; câu 32 đổi cả chữ phương án D và `correct: 3`. Câu thay: đáp án đúng ở `options[0]`, `correct: 0` (`quiz.js` và `engine/dialogue.js` đều xáo phương án mỗi lần hiện).
- Ô số phải ra chuỗi trong `options` (câu 21, 39, 48 của bộ mới là năm).

### 2.2 Frontend chương — `frontend/static/js/levels/phung-hung/`

| File | Nội dung |
|---|---|
| `main.js` | `boot(PHUNG_HUNG)` |
| `chapter.js` | `PHUNG_HUNG = { id: 6, key: 'ph', … }` theo hợp đồng `engine/chapter.js`; không `skills`, `enemyKinds`, `hooks`, `plunge`, `stealth` |
| `config.js` | asset path tạm trỏ chương 5, `BORROWED_MAPS`, `TILES`, `LEVEL_SPRITES`, `LEVEL_URLS`, vùng/đích từng màn, bảng ánh xạ tối thiểu, `ITEM` (sách `ITEM_BT_TINH_HOA` mượn), `PICKUPS.heal` = `ITEM_LND_HEAL`, `QUIZ`, `REWARD_NAMES` (3 tên PH-00 §3.4), `TEXT` (như chương 5, chữ "quân Đường", "Quyển Sách Tinh Hoa") |
| `questions-data.js` | **sinh bằng script** (2.5): 50 câu, `LEVEL1_QUESTION_POOL` 35 câu, `NPC_QUESTION_POOLS` `phungHai`/`doAnhHan`/`boPhaCan` theo PH-00 §3.3 |
| `dialogue-data.js` | `CHAPTER_END` nguyên văn PH-00 §5.3; `NPC_DIALOGUES = {}` |
| `audio-data.js` | `MUSIC_FILES` tạm trỏ `audio/mai-hac-de/level{1,2,3}.mp3` (`TODO_MISSING` nhạc riêng), `SFX = {}` |
| `level1.js`, `level2.js`, `level3.js` | màn tối giản (2.3); `level3.js` có `update` kết thúc trận |

### 2.3 Nội dung màn tối giản (DESIGN_BASELINE, toàn bộ PLACEHOLDER)

| Màn | URL | Bố cục |
|---|---|---|
| 1 "Trai tráng Đường Lâm" | `/gameplay/levels/phung-hung` | 6 chunk nền phẳng; 3 lính `EN_TANG_ESCORT`, 1 đá lăn `OB_BOULDER`; **5 Quyển Sách** cố định; 4 câu hỏi chặn đường từ `LEVEL1_QUESTION_POOL`; đích cuối màn, cần đủ 5 sách |
| 2 "Tụ nghĩa chiêu hiền" | `…/phung-hung/2` | 4 chunk, 2 lính; **3 câu hỏi chặn đường** lần lượt từ pool `phungHai` → `doAnhHan` → `boPhaCan`; đích cuối màn |
| 3 "Vây phủ Tống Bình" | `…/phung-hung/3` | đấu trường 1 chunk (`arena: true`), 3 đợt lính qua `makeSpawner`; hết đợt 3 + hết quân → `endGame(true)` → panel hết chương. Không boss, không cutscene, `skills: false` |

Không dùng `guide`, `npcs`, `events` cốt truyện. `introMessage` = tên màn.

### 2.4 Template + route

- `frontend/templates/gameplay/levels/phung-hung.html` kế thừa `gameplay/base.html` (theo mẫu `mai-hac-de.html`): `chapter_name` "Phùng Hưng", `brand` "SUTA · PHÙNG HƯNG", `item_label` "Quyển Sách Tinh Hoa đã thu thập", `item_glyph` 📖; khối kỹ năng để trống; `chapter_script` → `js/levels/phung-hung/main.js`. Không CSS riêng.
- `backend/routes/pages.py`: 3 route `render_chapter_level("phung-hung", n, "Màn n: …")`.

### 2.5 Script câu hỏi — `tools/make_question_data.py`

Thêm mục `"phung-hung"` vào `CHAPTERS`: `task` = `docs/SUTA_PH_TASK_00.md §3.3`, `excluded: []`, `npc` = `phungHai: [7, 8, 10, 28, 42]`, `doAnhHan: [6, 9, 13, 34, 43]`, `boPhaCan: [17, 18, 38, 46, 49]`, `level1` = 35 câu còn lại. Sửa dòng "Chạy:" trong docstring. **Không** sinh lại file chương 2–5.

### 2.6 Backend — migration `backend/migrations/011_phung_hung.sql` (skill `/add-migration`)

```sql
INSERT INTO chapters (id, slug, title, sort_order) VALUES (6, 'phung-hung', 'Phùng Hưng', 6);
INSERT INTO levels (id, chapter_id, level_no, title, first_clear_gold, first_clear_gems) VALUES
    (601, 6, 1, 'Trai tráng Đường Lâm', 250, 0),
    (602, 6, 2, 'Tụ nghĩa chiêu hiền',  373, 0),
    (603, 6, 3, 'Vây phủ Tống Bình',    498, 16);
INSERT INTO rewards (id, chapter_id, name) VALUES
    ('BUFF_PH_POWER',    6, 'Sức Địch Ngàn Người'),
    ('SK_PH_SUPPLY_CUT', 6, 'Khóa Lương'),
    ('SK_PH_FIRE_DRUM',  6, 'Hỏa Trận Trống Đồng');
INSERT INTO achievements (code, name, description, icon, reward_gold, reward_gems, sort_order) VALUES
    ('PH_CLEAR_1', 'Trai tráng Đường Lâm', 'Hoàn thành màn 1 chương Phùng Hưng.', '🐅', 124, 0, 23),
    ('PH_CLEAR_2', 'Tụ nghĩa chiêu hiền',  'Hoàn thành màn 2 chương Phùng Hưng.', '🤝', 124, 0, 24),
    ('PH_CHAPTER', 'Bố Cái Đại Vương',     'Hoàn thành chương Phùng Hưng.',       '👑', 0, 20, 25),
    ('PH_SPEED',   'Thần tốc vây thành',   'Tổng thời gian tốt nhất 3 màn Phùng Hưng dưới 15 phút.', '🥁', 0, 10, 26);
```

- `backend/routes/api.py`: `VALID_LEVEL_IDS` + 601–603, `VALID_CHAPTER_IDS` + 6.
- `backend/services/game_service.py`: `CHAPTER_PH_LEVELS = (601, 602, 603)` + 4 luật `PH_*` trong `ACHIEVEMENT_RULES` (`_cleared`, `_speed_for` có sẵn).

### 2.7 Trang chủ + /quiz

- Thẻ Phùng Hưng (dòng thời gian + chọn tướng): **giữ khoá**, chưa gắn `data-unlock-after="5"`, mở ở PH-L1 (như chương 4, 5).
- Năm trên thẻ chọn tướng: xem Q1.
- BXH: tab `data-scope="chapter-6"` trong `components/home/leaderboard.html`, đặt trước tab QUIZ; nhãn "🥁 PHÙNG HƯNG".
- `/quiz`: nút "Phùng Hưng" (`data-chapter="phung-hung"`) trong `quiz.html` + `QUIZ_BANKS['phung-hung']` (`excluded: []`) trong `js/quiz.js`.

### 2.8 Tài liệu

- Rule mới `.claude/rules/phung-hung-gameplay.md` (`paths`: `js/levels/phung-hung/**`, template chương, `tools/make_question_data.py`), ghi trạng thái PLACEHOLDER.
- `CLAUDE.md`: bảng rule. `.claude/rules/backend.md` (chương 6, migration 011), `assets-32bit.md` (chương 6 mượn asset chương 5), `history-content.md` (ngoại lệ bộ câu chương 6), `docs/architecture.md` nếu liệt kê chương.

---

## 3. TEST

| # | Test |
|---|---|
| S1 | `pytest tests` PASS. `test_time_api.py`: 3 URL Phùng Hưng → 200, đúng `data-level`, đúng `phung-hung/main.js`; save-time nhận 601–603, từ chối 604; tiến trình chương 6 OK, **chương 7 → 404** (dòng 200 đổi `progress/6` → `progress/7`; dòng 258 đổi `chapter-6` → `chapter-7`, thêm `level-604`; dòng 246 thêm `level-603`); luật `PH_*` trao đúng điều kiện (899 s đạt, đúng 900 s chưa đạt) |
| S2 | Migration chạy 2 lần không lỗi (`test_app.py` khi có `SUTA_TEST_DATABASE_URL`; không có → ghi chưa kiểm, kiểm trên DB dev khi khởi động lại server). `test_app.py`: dòng 73 thêm `011_phung_hung`; dòng 138 `levels_total` 15 → 18; thưởng 250/373/498 + 16 KC, 4 thành tựu |
| S3 | JSON đủ 50 câu; script đối chiếu: 17 câu giữ khớp Excel từng chữ, 13 câu sửa chỉ khác đúng trường đã duyệt, 20 câu thay khớp RESEARCH §6; `correct` trong 0–3, 4 phương án không trùng. `questions-data.js`: pool đúng PH-00 §3.3, script tự kiểm id tồn tại + không trùng |
| S4 | Màn 1: nhặt đủ 5 sách, 4 câu không trùng, qua đích → "Sang Màn 2"; thiếu sách bị giữ lại |
| S5 | Màn 2: 3 câu đúng thứ tự pool; qua đích → "Sang Màn 3" |
| S6 | Màn 3: 3 đợt lính, hết → panel "Hoàn thành chương Phùng Hưng"; "Chơi lại chương" về màn 1 |
| S7 | Vào thẳng màn 2/3 khi chưa qua màn trước → về màn 1; `?debug=1` vào được; tiến trình ghi `suta.ph.progress`, **không đụng** khoá của 5 chương trước |
| S8 | API: kỷ lục `level_id` 601–603, `PUT /api/game/progress/6`; tab BXH gọi `scope=chapter-6` |
| S9 | Hồi quy: màn 1 của 5 chương trước nạp đúng; `PUT progress/5` vẫn lưu; `/quiz` 6 chương chạy; console sạch (trừ 401 khách) |
| S10 | `/verify-ui`: màn 1 chương 6, cửa sổ BXH 8 tab và `/quiz` ở desktop, 1024 px, điện thoại ngang + dọc; báo số đo |

## 4. FILE

| Loại | File |
|---|---|
| Tạo | `frontend/static/assets/question/phung-hung-question.json`, `frontend/static/js/levels/phung-hung/{main,chapter,config,questions-data,dialogue-data,audio-data,level1,level2,level3}.js`, `frontend/templates/gameplay/levels/phung-hung.html`, `backend/migrations/011_phung_hung.sql`, `.claude/rules/phung-hung-gameplay.md`, `docs/REPORT_PH-SKELETON.md` |
| Sửa | `backend/routes/{pages,api}.py`, `backend/services/game_service.py`, `tools/make_question_data.py`, `frontend/templates/components/home/leaderboard.html`, `frontend/templates/quiz.html`, `frontend/static/js/quiz.js`, `tests/test_time_api.py`, `tests/test_app.py`, `CLAUDE.md`, `.claude/rules/{backend,assets-32bit,history-content}.md`, `docs/architecture.md` (nếu liệt kê chương); `frontend/templates/components/home/chapter.html` (chỉ khi Q1 chọn đổi năm) |
| Chỉ đọc | `js/levels/mai-hac-de/*` (mẫu), `js/engine/*`, `assets/images/mai-hac-de/**`, `backend/migrations/009_mai_hac_de.sql`, Excel `DATA các nhân vật.xlsx` |

## 5. QUYẾT ĐỊNH ĐÃ CHỐT (người dùng chọn đổi thành 791, 09/11/2026)

| # | Câu hỏi | Quyết định |
|---|---|---|
| Q1 | Dòng thời gian và `/history` ghi **Năm 791**, nhưng thẻ chọn tướng `chapter.html:151` ghi **Năm 766**. Thống nhất thế nào? | Đổi thẻ chọn tướng thành 791, khớp 2 nơi kia và mốc Toàn thư; kế hoạch tổng đã chọn 791. Sửa ngay trong PH-SKELETON |

## 6. GATE

1. Không sửa engine, không sửa file chương 1–5; mọi chỗ tạm ghi `PLACEHOLDER`/`TODO_MISSING`.
2. Test S1–S10 ghi PASS/FAIL có số đo; FAIL hoặc sửa ngoài phạm vi → `BLOCKED`.
3. Report `/task-report`; chỉ commit khi người dùng yêu cầu. Sau đó: PH-ENGINE + prompt Codex `PH_ART_01`.
