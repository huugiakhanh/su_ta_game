# SỬ TA — CHƯƠNG 4: TRIỆU VIỆT VƯƠNG
# TASK CARD: TQP-SKELETON — KHUNG CHƯƠNG `trieu-quang-phuc` CHẠY BẰNG ASSET CHƯƠNG 3

TASK_ID: TQP-SKELETON • Version 1.0 • 04/11/2026 • **ĐÃ DUYỆT, ĐÃ LÀM** — report [REPORT_TQP-SKELETON.md](REPORT_TQP-SKELETON.md)
Task card tổng: [SUTA_TQP_TASK_00.md](SUTA_TQP_TASK_00.md) (§1 thông số, §3.3 pool, §3.4 phần thưởng, §5.1 tên màn, §9 thưởng — người dùng duyệt 04/11)
Mẫu: [SUTA_LND_TASK_SKELETON_01.md](SUTA_LND_TASK_SKELETON_01.md) + [REPORT_LND-SKELETON.md](REPORT_LND-SKELETON.md)
Rule áp dụng: `engine.md`, `ly-nam-de-gameplay.md` (mẫu), `backend.md`, `web-pages.md`, `history-content.md`, `assets-32bit.md`; skill `/add-migration`

---

## 0. MỤC TIÊU

Dựng đủ đường đi của chương 4 từ trình duyệt tới DB: 3 URL màn chơi chạy được; tiến trình màn 1 → 2 → 3 → panel hết chương; kỷ lục + tiến trình lưu server; BXH có tab chương; `/quiz` có bộ câu Triệu Việt Vương; thưởng + thành tựu chương 4 trong DB. Nội dung màn **tối giản**, dùng asset + hành vi có sẵn của chương 3, để TQP-ENGINE và TQP-L1/L2/L3 chỉ việc thay nội dung.

**Không làm:** NPC dẫn màn (TQP), thoại NPC màn 2, khoá NPC theo số sách, cutscene, kỹ năng, boss Dương Sàn, khu rèn luyện (TQP-00 §4–5 còn chờ team duyệt; cơ chế thuộc TQP-ENGINE); asset mới; cơ chế engine mới; mở thẻ trang chủ.

## 1. QUY TẮC
1. **Không import file nào của chương khác** (`js/levels/{trung-trac,ba-trieu,ly-nam-de}/`). Bảng ánh xạ sprite cần dùng thì khai báo lại trong `trieu-quang-phuc/config.js`, ghi `PLACEHOLDER — asset chương 3, thay ở TQP-L<n>`.
2. Asset tạm: `SPRITE_ROOT`/`MAP_ROOT` trỏ thẳng `images/ly-nam-de/` (`manifest_lnd.json`, `maps_lnd.json`) — có sẵn lính Lương, cung thủ, thuyền, bình máu. Map chương 1–2 mượn qua `BORROWED_MAPS` y như chương 3 đang mượn. **Không chép ảnh**, chưa tạo `images/trieu-quang-phuc/` (Codex tạo ở `TQP_ART_01`).
3. Câu chữ hiển thị chỉ dùng: tên màn (TQP-00 §5.1, đã duyệt), câu hỏi từ JSON, câu thông báo kỹ thuật (`TEXT`). Câu còn chờ team (thông báo đầu màn dài, dòng kết lịch sử) → `TODO_MISSING`.
4. Số mới (độ dài màn, vị trí, số đợt lính) là `DESIGN_BASELINE`.
5. **Không sửa engine.** Thiếu gì ở engine → dừng và báo.

---

## 2. TRIỂN KHAI

### 2.1 Ngân hàng câu hỏi — `frontend/static/assets/question/trieu-quang-phuc-question.json` (mới)
- File **chưa có** (chương 1–3 team nộp sẵn JSON). Chuyển từ Excel sheet "4 Triệu Việt Vương" A3:H52 bằng script tạm ở scratchpad (đọc xlsx bằng thư viện chuẩn, không cài gói), cùng định dạng `ly-nam-de-question.json`: `{ id, question, options[4], correct (0–3), explanation }`; "Đáp án B" → `correct: 1`.
- **Chép nguyên văn**, không sửa chữ (kể cả câu nghi vấn TQP-00 §7, phương án "Cửa biển Đại Nha (Nam)" câu 27). Đối chiếu lại 50/50 câu: chữ câu hỏi, 4 phương án, đáp án đúng, giải thích.
- Script tạm không đưa vào repo.

### 2.2 Frontend chương — `frontend/static/js/levels/trieu-quang-phuc/`

| File | Nội dung |
|---|---|
| `main.js` | `boot(TRIEU_QUANG_PHUC)` |
| `chapter.js` | `TRIEU_QUANG_PHUC = { id: 4, key: 'tqp', … }` theo hợp đồng `engine/chapter.js`; không `skills`, `enemyKinds`, `hooks` |
| `config.js` | asset path tạm trỏ chương 3, `BORROWED_MAPS`, `TILES`, `LEVEL_SPRITES`, `LEVEL_URLS`, vùng/đích từng màn, bảng ánh xạ tối thiểu (`OBSTACLE_TYPES`, `HAZARD_SPRITES`, `ENEMY_SPRITES` + `GUARD`, `PROJECTILE_SPRITES`, `NPC_SPRITES = {}`), `ITEM` (sách `ITEM_BT_TINH_HOA` mượn), `PICKUPS.heal` = `ITEM_LND_HEAL`, `QUIZ`, `REWARD_NAMES` (3 tên TQP-00 §3.4), `TEXT` |
| `questions-data.js` | **sinh bằng script** (2.5): 50 câu, `LEVEL1_QUESTION_POOL` (35 câu), `NPC_QUESTION_POOLS` `trieuTuc`/`lyNamDe`/`chuDongTu` theo TQP-00 §3.3 |
| `dialogue-data.js` | `CHAPTER_END = { title: 'Hoàn thành chương Triệu Việt Vương', text: … }` — dòng điểm (TQP-00 §5.5 dòng 1 chờ duyệt → tạm chỉ báo điểm như LND-SKELETON, `TODO_MISSING`); `NPC_DIALOGUES = {}` |
| `audio-data.js` | `MUSIC_FILES` tạm trỏ `audio/ly-nam-de/level{1,2,3}.mp3` (`TODO_MISSING` nhạc riêng), `SFX = {}` |
| `level1.js` | màn 1 tối giản (2.3) |
| `level2.js` | màn 2 tối giản |
| `level3.js` | màn 3 tối giản + `update` kết thúc trận |

`TEXT`: các khoá như chương 3 (`obstacleHit`, `trapHit`, `fell`, `hazardHit`, `hazardDefeated`, `projectileHit`, `bossContact`, `bossDefeated`, `bossBlocksFinish`, `itemPicked`, `itemsMissing`, `rescueHint`), chữ "quân Lương", "Quyển Sách Tinh Hoa".

### 2.3 Nội dung màn tối giản (DESIGN_BASELINE, toàn bộ PLACEHOLDER)

| Màn | URL | Bố cục |
|---|---|---|
| 1 "Tuổi trẻ rèn luyện" | `/gameplay/levels/trieu-quang-phuc` | 6 chunk nền phẳng, nền làng mượn; 3 lính tuần tiễu Lương, 1 hố chông, 1 khe sông `'~'` có mỏm đá; **5 Quyển Sách** cố định; 4 câu hỏi chặn đường từ `LEVEL1_QUESTION_POOL`; đích cuối màn, cần đủ 5 sách |
| 2 "Hiền tài Dạ Trạch" | `…/trieu-quang-phuc/2` | 4 chunk, 2 lính; **3 câu hỏi chặn đường** lần lượt từ pool `trieuTuc` → `lyNamDe` → `chuDongTu` (chưa có NPC, chưa rải 10 sách — thêm ở TQP-L2 sau TQP-ENGINE E6); đích cuối màn |
| 3 "Đại phá Dương Sàn" | `…/trieu-quang-phuc/3` | đấu trường 1 chunk (`arena: true`), 3 đợt lính qua `makeSpawner`; hết đợt 3 + hết quân → `endGame(true)` → panel hết chương. Không boss, không cutscene, `skills: false` |

Không dùng `guide`, `npcs`, `events` cốt truyện. `introMessage` = tên màn.

### 2.4 Template + route
- `frontend/templates/gameplay/levels/trieu-quang-phuc.html` kế thừa `gameplay/base.html` (theo mẫu `ly-nam-de.html`): `chapter_name` "Triệu Việt Vương", `brand` "SUTA · TRIỆU VIỆT VƯƠNG", `item_label` "Quyển Sách Tinh Hoa đã thu thập", `item_glyph` 📖; khối kỹ năng để trống; `chapter_script` → `js/levels/trieu-quang-phuc/main.js`. Không CSS riêng.
- `backend/routes/pages.py`: 3 route `render_chapter_level("trieu-quang-phuc", n, "Màn n: …")`.

### 2.5 Script câu hỏi — `tools/make_question_data.py`
- Thêm mục `"trieu-quang-phuc"` vào `CHAPTERS`: `task` = `docs/SUTA_TQP_TASK_00.md §3.3`, `excluded: []`, `level1` 35 câu, `npc` 3 pool. Chạy `python tools/make_question_data.py trieu-quang-phuc`. **Không** sinh lại file chương 2–3. Sửa dòng "Chạy:" trong docstring.

### 2.6 Backend — migration `backend/migrations/008_trieu_quang_phuc.sql` (skill `/add-migration`)
```sql
INSERT INTO chapters (id, slug, title, sort_order) VALUES (4, 'trieu-quang-phuc', 'Triệu Việt Vương', 4);
-- Thưởng qua màn lần đầu: TQP-00 mục 9 (duyệt 04/11/2026).
INSERT INTO levels (id, chapter_id, level_no, title, first_clear_gold, first_clear_gems) VALUES
    (401, 4, 1, 'Tuổi trẻ rèn luyện', 173, 0),
    (402, 4, 2, 'Hiền tài Dạ Trạch',  259, 0),
    (403, 4, 3, 'Đại phá Dương Sàn',  346, 12);
INSERT INTO rewards (id, chapter_id, name) VALUES
    ('BUFF_TQP_VITALITY',  4, 'Thể lực cường tráng'),
    ('SK_TQP_RALLY',       4, 'Hiệu triệu Vạn Xuân'),
    ('SK_TQP_DRAGON_CLAW', 4, 'Móng Rồng');
INSERT INTO achievements (code, name, description, icon, reward_gold, reward_gems, sort_order) VALUES
    ('TQP_CLEAR_1', 'Rèn chí Chu Diên',   'Hoàn thành màn 1 chương Triệu Việt Vương.', …, 86, 0, 15),
    ('TQP_CLEAR_2', 'Dạ Trạch Vương',     'Hoàn thành màn 2 chương Triệu Việt Vương.', …, 86, 0, 16),
    ('TQP_CHAPTER', 'Triệu Việt Vương',   'Hoàn thành chương Triệu Việt Vương.',       …, 0, 17, 17),
    ('TQP_SPEED',   'Xuất quỷ nhập thần', 'Tổng thời gian tốt nhất 3 màn Triệu Việt Vương dưới 15 phút.', …, 0, 8, 18);
```
- Cột/thứ tự và `sort_order` đối chiếu lại `007_ly_nam_de.sql` khi viết; icon emoji theo khuôn chương 3.
- `backend/routes/api.py`: `VALID_LEVEL_IDS` + 401–403, `VALID_CHAPTER_IDS` + 4.
- `backend/services/game_service.py`: `CHAPTER_TQP_LEVELS = (401, 402, 403)` + 4 luật `TQP_*` trong `ACHIEVEMENT_RULES` (`_cleared`, `_speed_for` có sẵn).

### 2.7 Trang chủ + /quiz
- BXH: tab `data-scope="chapter-4"` "⛵ TRIỆU VIỆT VƯƠNG" trong `components/home/leaderboard.html` (6 tab — kiểm không tràn ở điện thoại ngang; dọc vẫn cuộn ngang trong khung như trước).
- Thẻ TQP (dòng thời gian + chọn tướng): **giữ khoá**, chưa gắn `data-unlock-after` — mở ở TQP-L1.
- `/quiz`: nút "Triệu Việt Vương" (`data-chapter="trieu-quang-phuc"`) trong `quiz.html` + `QUIZ_BANKS['trieu-quang-phuc']` (`excluded: []`) trong `js/quiz.js`.

### 2.8 Tài liệu
- Rule mới `.claude/rules/trieu-quang-phuc-gameplay.md` (`paths`: `js/levels/trieu-quang-phuc/**`, template chương, `tools/make_question_data.py`), ghi trạng thái PLACEHOLDER.
- `CLAUDE.md`: bảng rule; `.claude/rules/backend.md` (chương 4 — migration 008), `assets-32bit.md` (chương 4 mượn asset chương 3), `history-content.md` nếu có liệt kê file theo chương; `docs/architecture.md` nếu có liệt kê chương.
- TQP-00 §2: trỏ link task card này.

---

## 3. TEST

| # | Test |
|---|---|
| S1 | `pytest tests` PASS. `test_time_api.py`: 3 URL Triệu Việt Vương → 200, đúng `data-level`, đúng `trieu-quang-phuc/main.js`; save-time nhận 401–403, từ chối 404 (`level_id`); tiến trình chương 4 OK, **chương 5 → 404** (test cũ đang coi `progress/4`, `chapter-4` là sai → đổi sang `5`/`chapter-5`, thêm `level-404`); luật `TQP_*` trao đúng điều kiện (dưới 900 s đạt, đúng 900 s chưa đạt) |
| S2 | Migration chạy 2 lần không lỗi (`test_app.py` khi có `SUTA_TEST_DATABASE_URL`; không có → ghi chưa kiểm, kiểm trên DB dev khi khởi động lại server). `test_app.py`: `levels_total` toàn game 9 → 12; trang màn 3 chương 4; test thưởng 173/259/346 + 12 KC và 4 thành tựu |
| S3 | JSON: 50 câu khớp Excel cả chữ lẫn đáp án đúng. `questions-data.js`: pool đúng TQP-00 §3.3, script tự kiểm id tồn tại + không trùng |
| S4 | Màn 1: nhặt đủ 5 sách, 4 câu không trùng, qua đích → "Sang Màn 2"; thiếu sách bị giữ lại; rơi khe sông → về mỏm đá |
| S5 | Màn 2: 3 câu đúng thứ tự pool; qua đích → "Sang Màn 3" |
| S6 | Màn 3: 3 đợt lính, hết → panel "Hoàn thành chương Triệu Việt Vương"; "Chơi lại chương" về màn 1 |
| S7 | Vào thẳng màn 2/3 khi chưa qua màn trước → về màn 1; `?debug=1` vào được; tiến trình ghi `suta.tqp.progress`, **không đụng** `suta.{tt,bt,lnd}.progress` |
| S8 | API: kỷ lục `level_id` 401–403, `PUT /api/game/progress/4`; tab BXH "TRIỆU VIỆT VƯƠNG" gọi `scope=chapter-4` |
| S9 | Hồi quy: màn 1 Trưng Trắc, Bà Triệu, 3 màn Lý Nam Đế nạp đúng; `/quiz` 4 chương chạy; console sạch (trừ 401 khách) |
| S10 | `/verify-ui`: màn 1 chương 4, tab BXH và `/quiz` ở desktop + điện thoại ngang + dọc |

## 4. FILE

| Loại | File |
|---|---|
| Tạo | `frontend/static/assets/question/trieu-quang-phuc-question.json`, `frontend/static/js/levels/trieu-quang-phuc/{main,chapter,config,questions-data,dialogue-data,audio-data,level1,level2,level3}.js`, `frontend/templates/gameplay/levels/trieu-quang-phuc.html`, `backend/migrations/008_trieu_quang_phuc.sql`, `.claude/rules/trieu-quang-phuc-gameplay.md`, `docs/REPORT_TQP-SKELETON.md` |
| Sửa | `backend/routes/pages.py`, `backend/routes/api.py`, `backend/services/game_service.py`, `tools/make_question_data.py`, `frontend/templates/components/home/leaderboard.html`, `frontend/templates/quiz.html`, `frontend/static/js/quiz.js`, `tests/test_time_api.py`, `tests/test_app.py`, `CLAUDE.md`, `.claude/rules/{backend,assets-32bit,history-content}.md`, `docs/SUTA_TQP_TASK_00.md` (link), `docs/architecture.md` (nếu liệt kê chương) |
| Chỉ đọc | `js/levels/ly-nam-de/*` (mẫu), `js/engine/*`, `assets/images/ly-nam-de/**`, `backend/migrations/007_ly_nam_de.sql`, Excel `DATA các nhân vật.xlsx` |

## 5. QUYẾT ĐỊNH ĐÃ CHỐT (04/11/2026)

| # | Quyết định |
|---|---|
| Q1 | Duyệt luôn pool §3.3, tên màn §5.1, tên 3 phần thưởng §3.4, thưởng + thành tựu §9 của TQP-00 → seed đủ trong `008` (đổi sau bằng migration mới) |
| Q2 | Thẻ trang chủ **giữ khoá**, chương chỉ vào bằng URL tới khi xong TQP-L1 |
| Q3 | Asset tạm **trỏ chương 3** (manifest `manifest_lnd.json`/`maps_lnd.json`, không chép ảnh) |

## 6. GATE
1. Không sửa engine, không sửa file chương 1–3; mọi chỗ tạm ghi `PLACEHOLDER`/`TODO_MISSING`.
2. Test S1–S10 ghi PASS/FAIL có số đo; FAIL hoặc sửa ngoài phạm vi → `BLOCKED`.
3. Report `/task-report`; chỉ commit khi người dùng yêu cầu. Sau đó: TQP-ENGINE + prompt Codex `TQP_ART_01`.
