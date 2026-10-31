# SỬ TA — CHƯƠNG 3: LÝ NAM ĐẾ
# TASK CARD: LND-SKELETON — KHUNG CHƯƠNG `ly-nam-de` CHẠY BẰNG ASSET CHƯƠNG 2

TASK_ID: LND-SKELETON • Version 1.0 • 31/10/2026 • **ĐÃ DUYỆT, ĐÃ LÀM** — report [REPORT_LND-SKELETON.md](REPORT_LND-SKELETON.md)
Task card tổng: [SUTA_LND_TASK_00.md](SUTA_LND_TASK_00.md) (§1 thông số, §3.3 pool, §5.1 tên màn, §9 thưởng — đã duyệt 31/10)
Mẫu: [SUTA_BT_TASK_SKELETON_01.md](SUTA_BT_TASK_SKELETON_01.md) + [REPORT_BT-SKELETON.md](REPORT_BT-SKELETON.md)
Rule áp dụng: `engine.md`, `ba-trieu-gameplay.md` (mẫu), `backend.md`, `web-pages.md`, `history-content.md`; skill `/add-migration`

---

## 0. MỤC TIÊU

Dựng đủ đường đi của chương 3 từ trình duyệt tới DB: 3 URL màn chơi chạy được, tiến trình màn 1 → 2 → 3 → panel hết chương, kỷ lục + tiến trình lưu server, BXH có tab chương, `/quiz` có bộ câu Lý Nam Đế, thưởng + thành tựu chương 3 trong DB. Nội dung màn **tối giản**, dùng asset + hành vi có sẵn của chương 2, để các task sau (LND-ENGINE, LND-L1/L2/L3) chỉ việc thay nội dung.

**Không làm:** NPC dẫn màn (Lý Bí), thoại NPC màn 2, cutscene, kỹ năng, boss Tiêu Tư (LND-00 §4–5 còn chờ duyệt); asset mới; cơ chế engine mới (LND-ENGINE); mở thẻ trang chủ.

## 1. QUY TẮC
1. **Không import file nào trong `js/levels/trung-trac/` hay `js/levels/ba-trieu/`** — các chương độc lập. Bảng ánh xạ sprite cần dùng thì khai báo lại trong `ly-nam-de/config.js`, ghi rõ `PLACEHOLDER — asset chương 2, thay ở LND-L<n>`.
2. Asset tạm: `SPRITE_ROOT`/`MAP_ROOT` trỏ thẳng thư mục `images/ba-trieu/` (manifest `manifest_bt.json`, `maps_bt.json`) + `BORROWED_MAPS` y như chương 2 đang mượn chương 1. **Không chép ảnh**, chưa tạo `images/ly-nam-de/` (Codex tạo ở `LND_ART_01`).
3. Câu chữ hiển thị chỉ dùng: tên màn (LND-00 §5.1, đã duyệt), câu hỏi từ JSON, câu thông báo kỹ thuật (`TEXT`). Câu còn chờ team (thông báo đầu màn dài, dòng kết lịch sử) → `TODO_MISSING`.
4. Số mới (độ dài màn, vị trí, số đợt lính) là `DESIGN_BASELINE`.
5. **Không sửa engine.** Thiếu gì ở engine → dừng và báo.

---

## 2. TRIỂN KHAI

### 2.1 Frontend chương — `frontend/static/js/levels/ly-nam-de/`

| File | Nội dung |
|---|---|
| `main.js` | `boot(LY_NAM_DE)` |
| `chapter.js` | `LY_NAM_DE = { id: 3, key: 'lnd', … }` theo hợp đồng `engine/chapter.js`; không `skills`, `enemyKinds`, `hooks` |
| `config.js` | asset path tạm trỏ chương 2, `BORROWED_MAPS`, `LEVEL_SPRITES`, `LEVEL_URLS`, vùng/đích từng màn, bảng ánh xạ tối thiểu (`OBSTACLE_TYPES`, `HAZARD_SPRITES`, `ENEMY_SPRITES` + `GUARD`, `PROJECTILE_SPRITES`, `NPC_SPRITES = {}`), `ITEM` (Quyển Sách Tinh Hoa của chương 2 tạm), `QUIZ`, `REWARD_NAMES` (3 tên LND-00 §3.4), `TEXT` |
| `questions-data.js` | **sinh bằng script** (2.4): 50 câu, `LEVEL1_QUESTION_POOL` (36 câu), `NPC_QUESTION_POOLS` `phamTu`/`tinhThieu`/`trieuTuc` theo LND-00 §3.3 |
| `dialogue-data.js` | `CHAPTER_END = { title: 'Hoàn thành chương Lý Nam Đế', text: … }` — chỉ dòng điểm (LND-00 §5.4 dòng 1, còn chờ duyệt → `TODO_MISSING`, tạm hiện điểm như BT-SKELETON); `NPC_DIALOGUES = {}` |
| `audio-data.js` | `MUSIC_FILES` tạm trỏ `audio/ba-trieu/level{1,2,3}.mp3` (`TODO_MISSING` nhạc riêng), `SFX = {}` |
| `level1.js` | màn 1 tối giản (2.2) |
| `level2.js` | màn 2 tối giản |
| `level3.js` | màn 3 tối giản + `update` kết thúc trận |

`TEXT`: đổi chữ "quân Ngô" → "quân Lương"; giữ "Quyển Sách Tinh Hoa". Các khoá như chương 2: `obstacleHit`, `trapHit`, `fell`, `hazardHit`, `hazardDefeated`, `projectileHit`, `bossContact`, `bossDefeated`, `bossBlocksFinish`, `itemPicked`, `itemsMissing`, `rescueHint`.

### 2.2 Nội dung màn tối giản (DESIGN_BASELINE, toàn bộ PLACEHOLDER)

| Màn | URL | Bố cục |
|---|---|---|
| 1 "Từ quan chiêu binh" | `/gameplay/levels/ly-nam-de` | 6 chunk nền phẳng, nền núi Nưa tạm; 3 lính (lính đốn gỗ chương 2), 1 hố chông, 1 đá lăn; **5 Quyển Sách** cố định; 4 câu hỏi chặn đường từ `LEVEL1_QUESTION_POOL`; đích ở cuối, cần đủ 5 sách |
| 2 "Chiêu mộ hiền tài" | `…/ly-nam-de/2` | 4 chunk, 2 lính; **3 câu hỏi chặn đường** lần lượt từ pool `phamTu` → `tinhThieu` → `trieuTuc` (chưa có NPC — thêm ở LND-L2); đích ở cuối |
| 3 "Công phá thành Long Biên" | `…/ly-nam-de/3` | đấu trường 1 chunk (`arena: true`), 3 đợt lính qua `makeSpawner`; hết đợt 3 + hết quân → `endGame(true)` → panel hết chương. Không boss, không cutscene, `skills: false` |

Không dùng `guide`, `npcs`, `events` cốt truyện. `introMessage` = tên màn.

### 2.3 Template + route
- `frontend/templates/gameplay/levels/ly-nam-de.html` kế thừa `gameplay/base.html` (theo mẫu `ba-trieu.html`): `chapter_name` "Lý Nam Đế", `brand` "SUTA · LÝ NAM ĐẾ", `item_label` "Quyển Sách Tinh Hoa đã thu thập", `item_glyph` 📖; khối kỹ năng để trống; `chapter_script` → `js/levels/ly-nam-de/main.js`. Không CSS riêng.
- `backend/routes/pages.py`: 3 route `render_chapter_level("ly-nam-de", n, "Màn n: …")`. Không alias URL cũ.

### 2.4 Script câu hỏi — `tools/make_question_data.py`
- Thêm mục `"ly-nam-de"` vào `CHAPTERS`: `task` = `docs/SUTA_LND_TASK_00.md §3.3`, `excluded: []`, `level1` 36 câu, `npc` 3 pool. Chạy `python tools/make_question_data.py ly-nam-de`. **Không** sinh lại file chương 1–2.
- Script đọc `<slug>-question.json` → file `ly-nam-de-question.json` đã có, khớp slug.

### 2.5 Backend — migration `backend/migrations/007_ly_nam_de.sql` (skill `/add-migration`)
```sql
INSERT INTO chapters (id, slug, title, sort_order) VALUES (3, 'ly-nam-de', 'Lý Nam Đế', 3);
-- Thưởng qua màn lần đầu: LND-00 mục 9 (duyệt 31/10/2026).
INSERT INTO levels (id, chapter_id, level_no, title, first_clear_gold, first_clear_gems) VALUES
    (301, 3, 1, 'Từ quan chiêu binh',        144, 0),
    (302, 3, 2, 'Chiêu mộ hiền tài',         216, 0),
    (303, 3, 3, 'Công phá thành Long Biên',  288, 10);
INSERT INTO rewards (id, chapter_id, name) VALUES
    ('SK_LND_TO_LICH_SHIELD', 3, 'Khiên Tô Lịch'),
    ('BUFF_LND_SUPPLY',       3, 'Lương thảo dồi dào'),
    ('SK_LND_TIDE',           3, 'Triều Cường');
INSERT INTO achievements (code, name, description, icon, reward_gold, reward_gems, sort_order) VALUES
    ('LND_CLEAR_1', 'Từ quan chiêu binh',  'Hoàn thành màn 1 chương Lý Nam Đế.', …, 72, 0, 11),
    ('LND_CLEAR_2', 'Hội tụ hiền tài',     'Hoàn thành màn 2 chương Lý Nam Đế.', …, 72, 0, 12),
    ('LND_CHAPTER', 'Vạn Xuân',            'Hoàn thành chương Lý Nam Đế.',       …, 0, 14, 13),
    ('LND_SPEED',   'Đoản binh thần tốc',  'Tổng thời gian tốt nhất 3 màn Lý Nam Đế dưới 15 phút.', …, 0, 7, 14);
```
- `INSERT` thường như `005`/`006` — `backend/db.py` ghi `schema_migrations` nên mỗi file chỉ chạy một lần. Icon chọn emoji theo khuôn chương 2.
- `backend/routes/api.py`: `VALID_LEVEL_IDS` + 301–303, `VALID_CHAPTER_IDS` + 3.
- `backend/services/game_service.py`: `CHAPTER_LND_LEVELS = (301, 302, 303)` + 4 luật `LND_*` trong `ACHIEVEMENT_RULES` (dùng `_cleared`, `_speed_for` có sẵn). `TT_FLAWLESS`/`TT_SCHOLAR` giữ chung mọi chương.

### 2.6 Trang chủ + /quiz
- BXH: tab `data-scope="chapter-3"` "LÝ NAM ĐẾ" trong `components/home/leaderboard.html` (kiểm tab không tràn ở điện thoại ngang — giờ 5 tab).
- Thẻ Lý Nam Đế (dòng thời gian + chọn tướng): **giữ khoá**, chưa gắn `data-unlock-after` — mở ở LND-L1.
- `/quiz`: nút "Lý Nam Đế" (`data-chapter="ly-nam-de"`) trong `quiz.html` + mục `QUIZ_BANKS['ly-nam-de']` (`excluded: []`) trong `js/quiz.js`.

### 2.7 Tài liệu
- Rule mới `.claude/rules/ly-nam-de-gameplay.md` (`paths`: `js/levels/ly-nam-de/**`, template chương), ghi trạng thái PLACEHOLDER; thêm `tools/make_question_data.py` vào paths.
- `CLAUDE.md`: bảng rule + dòng trạng thái chương 3; `.claude/rules/backend.md`, `history-content.md` (thêm paths dialogue/questions `ly-nam-de`); `docs/architecture.md` nếu có liệt kê chương.
- LND-00 §2: trỏ link task card này.

---

## 3. TEST

| # | Test |
|---|---|
| S1 | `pytest tests` PASS. Sửa/thêm test không cần DB (`test_time_api.py`): 3 URL Lý Nam Đế → 200, đúng `data-level`, đúng `ly-nam-de/main.js`; save-time nhận 301–303, từ chối 304; tiến trình chương 3 OK, **chương 4 → 404** (test cũ đang coi `progress/3` là 404 và `chapter-3` là scope sai → đổi sang `4`/`chapter-4`, thêm `level-304`); thành tựu `LND_*` trao đúng điều kiện |
| S2 | Migration chạy 2 lần không lỗi (`test_app.py` khi có `SUTA_TEST_DATABASE_URL`; nếu không có → ghi chưa kiểm, kiểm trên DB dev khi khởi động lại server). `test_app.py`: `levels_total` toàn game 6 → 9 |
| S3 | `questions-data.js`: 50 câu, pool đúng LND-00 §3.3, mọi id tồn tại, không trùng giữa pool |
| S4 | Màn 1: nhặt đủ 5 sách, 4 câu không trùng, qua đích → "Sang Màn 2"; thiếu sách bị giữ lại |
| S5 | Màn 2: 3 câu đúng thứ tự pool; qua đích → "Sang Màn 3" |
| S6 | Màn 3: 3 đợt lính, hết → panel "Hoàn thành chương Lý Nam Đế"; "Chơi lại chương" về màn 1 |
| S7 | Vào thẳng màn 2/3 khi chưa qua màn trước → về màn 1; `?debug=1` vào được; tiến trình ghi `suta.lnd.progress`, **không đụng** `suta.tt.progress`/`suta.bt.progress` |
| S8 | API: kỷ lục `level_id` 301–303, `PUT /api/game/progress/3`; tab BXH "LÝ NAM ĐẾ" gọi `scope=chapter-3` |
| S9 | Hồi quy: màn 1 Trưng Trắc + 3 màn Bà Triệu nạp đúng; `/quiz` 3 chương chạy; console sạch (trừ 401 khách) |
| S10 | `/verify-ui`: màn 1 Lý Nam Đế, tab BXH và `/quiz` ở desktop + điện thoại ngang |

## 4. FILE

| Loại | File |
|---|---|
| Tạo | `frontend/static/js/levels/ly-nam-de/{main,chapter,config,questions-data,dialogue-data,audio-data,level1,level2,level3}.js`, `frontend/templates/gameplay/levels/ly-nam-de.html`, `backend/migrations/007_ly_nam_de.sql`, `.claude/rules/ly-nam-de-gameplay.md`, `docs/REPORT_LND-SKELETON.md` |
| Sửa | `backend/routes/pages.py`, `backend/routes/api.py`, `backend/services/game_service.py`, `tools/make_question_data.py`, `frontend/templates/components/home/leaderboard.html`, `frontend/templates/quiz.html`, `frontend/static/js/quiz.js`, `tests/test_time_api.py`, `tests/test_app.py`, `CLAUDE.md`, `.claude/rules/{backend,history-content}.md`, `docs/SUTA_LND_TASK_00.md` (link) |
| Chỉ đọc | `js/levels/ba-trieu/*` (mẫu), `js/engine/*`, `assets/images/ba-trieu/**`, `assets/question/ly-nam-de-question.json` |

## 5. QUYẾT ĐỊNH ĐÃ CHỐT (31/10/2026)

| # | Quyết định |
|---|---|
| Q1 | Duyệt luôn pool §3.3, tên màn §5.1, thưởng + thành tựu §9 của LND-00 → seed đủ trong `007` (đổi sau bằng migration mới) |
| Q2 | Buff Tinh Thiều tên **"Lương thảo dồi dào"** (`BUFF_LND_SUPPLY`) |
| Q3 | Thẻ trang chủ **giữ khoá**, chương chỉ vào bằng URL tới khi xong LND-L1 |
| Q4 | Asset tạm **mượn chương 2** (trỏ manifest, không chép ảnh) |

## 6. GATE
1. Không sửa engine, không sửa file chương 1–2; mọi chỗ tạm ghi `PLACEHOLDER`/`TODO_MISSING`.
2. Test S1–S10 ghi PASS/FAIL có số đo; FAIL hoặc sửa ngoài phạm vi → `BLOCKED`.
3. Report `/task-report`; chỉ commit khi người dùng yêu cầu. Sau đó: LND-ENGINE + prompt Codex `LND_ART_01`.
