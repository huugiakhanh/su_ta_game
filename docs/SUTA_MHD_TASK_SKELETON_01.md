# SỬ TA — CHƯƠNG 5: MAI HẮC ĐẾ
# TASK CARD: MHD-SKELETON — KHUNG CHƯƠNG `mai-hac-de` CHẠY BẰNG ASSET CHƯƠNG 4

TASK_ID: MHD-SKELETON • Version 1.0 • 07/11/2026 • **ĐÃ DUYỆT, ĐÃ LÀM** — report [REPORT_MHD-SKELETON.md](REPORT_MHD-SKELETON.md)
Task card tổng: [SUTA_MHD_TASK_00.md](SUTA_MHD_TASK_00.md) (§1 thông số, §3.3 pool, §3.4 phần thưởng, §5.1 tên màn, §9 thưởng)
Mẫu: [SUTA_TQP_TASK_SKELETON_01.md](SUTA_TQP_TASK_SKELETON_01.md) + [REPORT_TQP-SKELETON.md](REPORT_TQP-SKELETON.md)
Rule áp dụng: `engine.md`, `trieu-quang-phuc-gameplay.md` (mẫu), `backend.md`, `web-pages.md`, `history-content.md`, `assets-32bit.md`; skill `/add-migration`

---

## 0. MỤC TIÊU

Dựng đủ đường đi của chương 5 từ trình duyệt tới DB: 3 URL màn chơi chạy được; tiến trình màn 1 → 2 → 3 → panel hết chương; kỷ lục + tiến trình (có `rescued`) lưu server; BXH có tab chương; `/quiz` có bộ câu Mai Hắc Đế; thưởng + thành tựu chương 5 trong DB. Nội dung màn **tối giản**, dùng asset + hành vi có sẵn của chương 4, để MHD-ENGINE và MHD-L1/L2/L3 chỉ việc thay nội dung.

**Không làm:** NPC dẫn màn, thoại NPC màn 2, khoá NPC theo sách, cutscene, kỹ năng, boss Quang Sở Khách, đoạn gánh vải, thả dân phu (MHD-00 §4–5 còn chờ team duyệt; cơ chế thuộc MHD-ENGINE); asset mới; cơ chế engine mới; mở thẻ trang chủ.

## 1. QUY TẮC
1. **Không import file nào của chương khác.** Bảng ánh xạ sprite cần dùng thì khai báo lại trong `mai-hac-de/config.js`, ghi `PLACEHOLDER — asset chương 4, thay ở MHD-L<n>`.
2. Asset tạm: `SPRITE_ROOT`/`MAP_ROOT` trỏ thẳng `images/trieu-quang-phuc/` (`manifest_tqp.json`, `maps_tqp.json`): có sẵn lính, cung thủ, hố chông, bình máu. Map chương 1–3 mượn qua `BORROWED_MAPS` như chương 4. **Không chép ảnh**, chưa tạo `images/mai-hac-de/` (Codex tạo ở `MHD_ART_01`).
3. Câu chữ hiển thị chỉ dùng: tên màn (MHD-00 §5.1), câu hỏi từ JSON, câu thông báo kỹ thuật (`TEXT`). Câu còn chờ team (thông báo đầu màn dài, dòng kết lịch sử) → `TODO_MISSING`.
4. Số mới (độ dài màn, vị trí, số đợt lính) là `DESIGN_BASELINE`.
5. **Không sửa engine**, trừ 1 dòng `rescued: 0` trong `emptyProgress()` của `engine/progress.js` (2.6). Thiếu gì khác ở engine → dừng và báo.

---

## 2. TRIỂN KHAI

### 2.1 Ngân hàng câu hỏi — `frontend/static/assets/question/mai-hac-de-question.json` (mới)
- Chuyển từ Excel sheet "5 Mai Hắc Đế" A3:H52 bằng script tạm ở scratchpad (đọc xlsx bằng thư viện chuẩn, không cài gói), cùng định dạng `trieu-quang-phuc-question.json`: `{ id, question, options[4], correct (0–3), explanation }`; "Đáp án B" → `correct: 1`.
- **Chép nguyên văn**, không sửa chữ, kể cả câu nghi vấn MHD-00 §7 và lỗi gõ lặp ở cột H câu 6, 7. Đối chiếu 50/50 câu: chữ câu hỏi, 4 phương án, đáp án đúng, giải thích.
- Ô số trong Excel (câu 9: 544, 722, 938, 248) phải ra chuỗi trong `options`, đúng như hiển thị. Đường dẫn file Excel có dấu tiếng Việt: tìm bằng ký tự đại diện, script chạy UTF-8.
- Script tạm không đưa vào repo.

### 2.2 Frontend chương — `frontend/static/js/levels/mai-hac-de/`

| File | Nội dung |
|---|---|
| `main.js` | `boot(MAI_HAC_DE)` |
| `chapter.js` | `MAI_HAC_DE = { id: 5, key: 'mhd', … }` theo hợp đồng `engine/chapter.js`; không `skills`, `enemyKinds`, `hooks`, `plunge`, `stealth` |
| `config.js` | asset path tạm trỏ chương 4, `BORROWED_MAPS`, `TILES`, `LEVEL_SPRITES`, `LEVEL_URLS`, vùng/đích từng màn, bảng ánh xạ tối thiểu (`OBSTACLE_TYPES`, `HAZARD_SPRITES`, `ENEMY_SPRITES` + `GUARD`, `PROJECTILE_SPRITES`, `NPC_SPRITES = {}`), `ITEM` (sách `ITEM_BT_TINH_HOA` mượn), `PICKUPS.heal` = `ITEM_LND_HEAL`, `QUIZ`, `REWARD_NAMES` (3 tên MHD-00 §3.4), `TEXT` |
| `questions-data.js` | **sinh bằng script** (2.5): 50 câu, `LEVEL1_QUESTION_POOL` (35 câu), `NPC_QUESTION_POOLS` `maThi`/`thucBao`/`suGia` theo MHD-00 §3.3 |
| `dialogue-data.js` | `CHAPTER_END = { title: 'Hoàn thành chương Mai Hắc Đế', text: … }`: tạm chỉ báo điểm, `TODO_MISSING` dòng lịch sử; `NPC_DIALOGUES = {}` |
| `audio-data.js` | `MUSIC_FILES` tạm trỏ `audio/trieu-quang-phuc/level{1,2,3}.mp3` (`TODO_MISSING` nhạc riêng), `SFX = {}` |
| `level1.js`, `level2.js`, `level3.js` | màn tối giản (2.3); `level3.js` có `update` kết thúc trận |

`TEXT`: các khoá như chương 4 (`obstacleHit`, `trapHit`, `fell`, `hazardHit`, `hazardDefeated`, `projectileHit`, `bossContact`, `bossDefeated`, `bossBlocksFinish`, `itemPicked`, `itemsMissing`, `rescueHint`), chữ "quân Đường", "Quyển Sách Tinh Hoa".

### 2.3 Nội dung màn tối giản (DESIGN_BASELINE, toàn bộ PLACEHOLDER)

| Màn | URL | Bố cục |
|---|---|---|
| 1 "Gánh vải Hoan Châu" | `/gameplay/levels/mai-hac-de` | 6 chunk nền phẳng, nền làng mượn; 3 lính `EN_LUONG_PATROL`, 1 hố chông `TR_BAMBOO_SPIKE_PIT`; **5 Quyển Sách** cố định; 4 câu hỏi chặn đường từ `LEVEL1_QUESTION_POOL`; đích cuối màn, cần đủ 5 sách |
| 2 "Dựng cờ Vạn An" | `…/mai-hac-de/2` | 4 chunk, 2 lính; **3 câu hỏi chặn đường** lần lượt từ pool `maThi` → `thucBao` → `suGia` (NPC + 10 sách thêm ở MHD-L2); đích cuối màn |
| 3 "Công phá Tống Bình" | `…/mai-hac-de/3` | đấu trường 1 chunk (`arena: true`), 3 đợt lính qua `makeSpawner`; hết đợt 3 + hết quân → `endGame(true)` → panel hết chương. Không boss, không cutscene, `skills: false` |

Không dùng `guide`, `npcs`, `events` cốt truyện. `introMessage` = tên màn.

### 2.4 Template + route
- `frontend/templates/gameplay/levels/mai-hac-de.html` kế thừa `gameplay/base.html` (theo mẫu `trieu-quang-phuc.html`): `chapter_name` "Mai Hắc Đế", `brand` "SUTA · MAI HẮC ĐẾ", `item_label` "Quyển Sách Tinh Hoa đã thu thập", `item_glyph` 📖; khối kỹ năng để trống; `chapter_script` → `js/levels/mai-hac-de/main.js`. Không CSS riêng.
- `backend/routes/pages.py`: 3 route `render_chapter_level("mai-hac-de", n, "Màn n: …")`.

### 2.5 Script câu hỏi — `tools/make_question_data.py`
- Thêm mục `"mai-hac-de"` vào `CHAPTERS`: `task` = `docs/SUTA_MHD_TASK_00.md §3.3`, `excluded: []`, `level1` 35 câu, `npc` 3 pool. Chạy `python tools/make_question_data.py mai-hac-de`. **Không** sinh lại file chương 2–4. Sửa dòng "Chạy:" trong docstring.

### 2.6 Backend — migration `backend/migrations/009_mai_hac_de.sql` (skill `/add-migration`)
```sql
INSERT INTO chapters (id, slug, title, sort_order) VALUES (5, 'mai-hac-de', 'Mai Hắc Đế', 5);
INSERT INTO levels (id, chapter_id, level_no, title, first_clear_gold, first_clear_gems) VALUES
    (501, 5, 1, 'Gánh vải Hoan Châu', 208, 0),
    (502, 5, 2, 'Dựng cờ Vạn An',     311, 0),
    (503, 5, 3, 'Công phá Tống Bình', 415, 14);
INSERT INTO rewards (id, chapter_id, name) VALUES
    ('BUFF_MHD_POWER',      5, 'Ý chí dân nghèo'),
    ('SK_MHD_VAN_AN_SHELL', 5, 'Vỏ Bọc Vạn An'),
    ('SK_MHD_REINFORCE',    5, 'Viện Binh');
INSERT INTO achievements (code, name, description, icon, reward_gold, reward_gems, sort_order) VALUES
    ('MHD_CLEAR_1', 'Gánh vải Hoan Châu', 'Hoàn thành màn 1 chương Mai Hắc Đế.',  '🧺', 103, 0, 19),
    ('MHD_CLEAR_2', 'Dựng cờ Vạn An',     'Hoàn thành màn 2 chương Mai Hắc Đế.',  '🏴', 103, 0, 20),
    ('MHD_CHAPTER', 'Hắc Đế',             'Hoàn thành chương Mai Hắc Đế.',        '👑', 0, 20, 21),
    ('MHD_SPEED',   'Thần tốc ra Bắc',    'Tổng thời gian tốt nhất 3 màn Mai Hắc Đế dưới 15 phút.', '🐎', 0, 10, 22);
-- Số dân phu cứu được ở màn 1 (0–5), dùng ở màn 3. Chương khác luôn 0.
ALTER TABLE chapter_progress ADD COLUMN rescued SMALLINT NOT NULL DEFAULT 0
    CHECK (rescued BETWEEN 0 AND 5);
```
- `backend/routes/api.py`: `VALID_LEVEL_IDS` + 501–503, `VALID_CHAPTER_IDS` + 5; `MAX_RESCUED = 5`; `parse_progress` đọc `rescued` (mặc định 0, sai dạng → từ chối) và trả trong dict. Thiếu bước này thì trường bị bỏ khi lưu server.
- `backend/repositories/progress_repository.py`: thêm `rescued` vào `_to_dict`, `SELECT` của `get_progress`, `INSERT … ON CONFLICT` của `save_progress`.
- `backend/services/game_service.py`: `CHAPTER_MHD_LEVELS = (501, 502, 503)` + 4 luật `MHD_*` trong `ACHIEVEMENT_RULES` (`_cleared`, `_speed_for` có sẵn).
- `frontend/static/js/engine/progress.js`: `emptyProgress()` thêm `rescued: 0`.

### 2.7 Trang chủ + thư viện + /quiz
- **Năm 713 → 722** (MHD-00 quyết định 6): `components/home/timeline.html:79` và `history.html:90`. Thẻ chọn tướng `chapter.html:142` đã là 722.
- Thẻ Mai Hắc Đế (dòng thời gian + chọn tướng): **giữ khoá**, chưa gắn `data-unlock-after="4"`, mở ở MHD-L1 (như chương 4).
- BXH: tab `data-scope="chapter-5"` "🏴 MAI HẮC ĐẾ" trong `components/home/leaderboard.html`, đặt trước tab QUIZ.
- 7 tab sẽ tràn: report TQP-SKELETON ghi 6 tab đã vừa khít ở 1024 px. Cách xử lý xem Q3.
- `/quiz`: nút "Mai Hắc Đế" (`data-chapter="mai-hac-de"`) trong `quiz.html` + `QUIZ_BANKS['mai-hac-de']` (`excluded: []`) trong `js/quiz.js`.

### 2.8 Tài liệu
- Rule mới `.claude/rules/mai-hac-de-gameplay.md` (`paths`: `js/levels/mai-hac-de/**`, template chương, `tools/make_question_data.py`), ghi trạng thái PLACEHOLDER.
- `CLAUDE.md`: bảng rule. `.claude/rules/backend.md` (chương 5, migration 009, cột `rescued`), `assets-32bit.md` (chương 5 mượn asset chương 4), `history-content.md` nếu liệt kê file theo chương, `engine.md` (trường `rescued`), `docs/architecture.md` nếu liệt kê chương.
- MHD-00 §7: đánh dấu mục được duyệt.

---

## 3. TEST

| # | Test |
|---|---|
| S1 | `pytest tests` PASS. `test_time_api.py`: 3 URL Mai Hắc Đế → 200, đúng `data-level`, đúng `mai-hac-de/main.js`; save-time nhận 501–503, từ chối 504; tiến trình chương 5 OK, **chương 6 → 404** (dòng 143 đổi `progress/5` → `progress/6`; dòng 195 đổi `chapter-5` → `chapter-6`, thêm `level-504`; dòng 183 thêm `level-503`); luật `MHD_*` trao đúng điều kiện (899 s đạt, đúng 900 s chưa đạt) |
| S2 | `parse_progress`: `rescued` 0 và 5 nhận; 6, −1, `"3"`, `true` từ chối; thiếu trường → 0 (tiến trình chương cũ vẫn lưu được). `test_time_api.py:150` so bằng với `GOOD_PROGRESS` nên phải thêm `"rescued": 0` vào hằng này (dòng 109) |
| S3 | Migration chạy 2 lần không lỗi (`test_app.py` khi có `SUTA_TEST_DATABASE_URL`; không có → ghi chưa kiểm, kiểm trên DB dev khi khởi động lại server). `test_app.py`: dòng 72 thêm `009_mai_hac_de`; dòng 137 `levels_total` 12 → 15; trang màn 3 chương 5; thưởng 208/311/415 + 14 KC, 4 thành tựu; `rescued` lưu rồi đọc lại đúng |
| S4 | JSON: 50 câu khớp Excel cả chữ lẫn đáp án đúng. `questions-data.js`: pool đúng MHD-00 §3.3, script tự kiểm id tồn tại + không trùng |
| S5 | Màn 1: nhặt đủ 5 sách, 4 câu không trùng, qua đích → "Sang Màn 2"; thiếu sách bị giữ lại |
| S6 | Màn 2: 3 câu đúng thứ tự pool; qua đích → "Sang Màn 3" |
| S7 | Màn 3: 3 đợt lính, hết → panel "Hoàn thành chương Mai Hắc Đế"; "Chơi lại chương" về màn 1 |
| S8 | Vào thẳng màn 2/3 khi chưa qua màn trước → về màn 1; `?debug=1` vào được; tiến trình ghi `suta.mhd.progress`, **không đụng** `suta.{tt,bt,lnd,tqp}.progress` |
| S9 | API: kỷ lục `level_id` 501–503, `PUT /api/game/progress/5`; tab BXH "MAI HẮC ĐẾ" gọi `scope=chapter-5` |
| S10 | Hồi quy: màn 1 của 4 chương trước nạp đúng; `PUT progress/4` vẫn lưu; `/quiz` 5 chương chạy; thẻ `/history` và dòng thời gian hiện "Năm 722"; console sạch (trừ 401 khách) |
| S11 | `/verify-ui`: màn 1 chương 5, cửa sổ BXH 7 tab và `/quiz` ở desktop, 1024 px, điện thoại ngang + dọc; báo số đo độ rộng tab |

## 4. FILE

| Loại | File |
|---|---|
| Tạo | `frontend/static/assets/question/mai-hac-de-question.json`, `frontend/static/js/levels/mai-hac-de/{main,chapter,config,questions-data,dialogue-data,audio-data,level1,level2,level3}.js`, `frontend/templates/gameplay/levels/mai-hac-de.html`, `backend/migrations/009_mai_hac_de.sql`, `.claude/rules/mai-hac-de-gameplay.md`, `docs/REPORT_MHD-SKELETON.md` |
| Sửa | `backend/routes/{pages,api}.py`, `backend/repositories/progress_repository.py`, `backend/services/game_service.py`, `frontend/static/js/engine/progress.js` (1 dòng), `tools/make_question_data.py`, `frontend/templates/components/home/{leaderboard,timeline}.html`, `frontend/templates/{history,quiz}.html`, `frontend/static/css/home/board.css` (theo Q3), `frontend/static/js/quiz.js`, `tests/test_time_api.py`, `tests/test_app.py`, `CLAUDE.md`, `.claude/rules/{backend,assets-32bit,engine,history-content}.md`, `docs/SUTA_MHD_TASK_00.md`, `docs/architecture.md` (nếu liệt kê chương) |
| Chỉ đọc | `js/levels/trieu-quang-phuc/*` (mẫu), `js/engine/*`, `assets/images/trieu-quang-phuc/**`, `backend/migrations/008_trieu_quang_phuc.sql`, Excel `DATA các nhân vật.xlsx` |

## 5. QUYẾT ĐỊNH ĐÃ CHỐT (người dùng duyệt theo đề xuất, 07/11/2026)

| # | Câu hỏi | Đề xuất |
|---|---|---|
| Q1 | Migration đã chạy thì không sửa được, chỉ thêm file mới. Duyệt luôn pool §3.3, tên màn §5.1, tên 3 phần thưởng §3.4, thưởng + thành tựu §9 của MHD-00 để seed trong `009`? | Duyệt luôn như chương 4. Thoại §4–5 vẫn chờ team, không chặn việc này |
| Q2 | Thẻ trang chủ giữ khoá tới MHD-L1? | Giữ khoá, chương chỉ vào bằng URL |
| Q3 | BXH 7 tab xử lý thế nào? | Cho tab xuống hàng từ màn rộng hơn điện thoại; điện thoại giữ cuộn ngang như hiện nay. Tab chỉ còn nhiều thêm (17 nhân vật), giảm khoảng cách nữa không giải quyết được lâu dài |

## 6. GATE
1. Không sửa engine ngoài `rescued: 0`, không sửa file chương 1–4; mọi chỗ tạm ghi `PLACEHOLDER`/`TODO_MISSING`.
2. Test S1–S11 ghi PASS/FAIL có số đo; FAIL hoặc sửa ngoài phạm vi → `BLOCKED`.
3. Report `/task-report`; chỉ commit khi người dùng yêu cầu. Sau đó: MHD-ENGINE + prompt Codex `MHD_ART_01`.
