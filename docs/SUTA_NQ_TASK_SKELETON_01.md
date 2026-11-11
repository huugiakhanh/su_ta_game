# SỬ TA — CHƯƠNG 7: NGÔ QUYỀN
# TASK CARD: NQ-SKELETON — KHUNG CHƯƠNG `ngo-quyen` CHẠY BẰNG ASSET CHƯƠNG 6

TASK_ID: NQ-SKELETON • Version 1.0 • 11/11/2026 • **ĐÃ DUYỆT, ĐÃ LÀM** — report [REPORT_NQ-SKELETON.md](REPORT_NQ-SKELETON.md)
Task card tổng: [SUTA_NQ_TASK_00.md](SUTA_NQ_TASK_00.md) (§1 thông số, §3.3 pool, §3.4 phần thưởng, §5.1 tên màn, §5.3 panel, §8 thưởng). Câu hỏi: [RESEARCH_NQ_QUESTIONS.md](RESEARCH_NQ_QUESTIONS.md) §4–6.
Mẫu: [SUTA_PH_TASK_SKELETON_01.md](SUTA_PH_TASK_SKELETON_01.md) + [REPORT_PH-SKELETON.md](REPORT_PH-SKELETON.md)
Rule áp dụng: `engine.md`, `phung-hung-gameplay.md` (mẫu), `backend.md`, `web-pages.md`, `history-content.md`, `assets-32bit.md`; skill `/add-migration`

---

## 0. MỤC TIÊU

Dựng đủ đường đi của chương 7 từ trình duyệt tới DB: 3 URL màn chơi chạy được; tiến trình màn 1 → 2 → 3 → panel hết chương; kỷ lục + tiến trình lưu server; BXH có tab chương; `/quiz` có bộ câu Ngô Quyền; thưởng + thành tựu chương 7 trong DB. Nội dung màn **tối giản**, dùng asset + hành vi có sẵn của chương 6, để NQ-ENGINE và NQ-L1/L2/L3 chỉ việc thay nội dung.

**Không làm:** NPC dẫn màn, thoại NPC màn 2, khoá NPC, hồi tưởng, cutscene, kỹ năng, mini-boss Kiều Công Tiễn, boss Hoằng Tháo, thuyền lái, thủy triều, gió, xoáy, cắm cọc, ném lao (thuộc NQ-ENGINE và NQ-L1/L2/L3); asset mới; cơ chế engine mới; mở thẻ trang chủ.

## 1. QUY TẮC

1. **Không import file nào của chương khác.** Bảng ánh xạ sprite cần dùng thì khai báo lại trong `ngo-quyen/config.js`, ghi `PLACEHOLDER — asset chương 6, thay ở NQ-L<n>`.
2. Asset tạm: `SPRITE_ROOT`/`MAP_ROOT` trỏ thẳng `images/phung-hung/` (`manifest_ph.json`, `maps_ph.json`), có sẵn `EN_PH_TANG_SPEARMAN`, `ITEM_LND_HEAL`; đá lăn mượn ID có trong manifest chương 6 (nếu không có `OB_BOULDER` thì dùng `OB_PH_LATERITE_ROCK` kiểu `roller`, chốt khi code). Map mượn qua `BORROWED_MAPS` như chương 6. **Không chép ảnh**, chưa tạo `images/ngo-quyen/` (Codex tạo ở `NQ_ART_01`).
3. Câu chữ hiển thị chỉ dùng: tên màn (NQ-00 §5.1), câu hỏi từ JSON, panel kết chương (NQ-00 §5.3), câu thông báo kỹ thuật (`TEXT`). Thoại NPC, thoại dẫn, cutscene đã duyệt nhưng chưa có màn để dùng → đưa vào ở NQ-L1/L2/L3.
4. Số mới (độ dài màn, vị trí, số đợt lính) là `DESIGN_BASELINE`.
5. **Không sửa engine.** Chương 7 chưa thêm trường tiến trình (số cọc là việc của NQ-ENGINE E5). Thiếu gì ở engine → dừng và báo.

---

## 2. TRIỂN KHAI

### 2.1 Ngân hàng câu hỏi — `frontend/static/assets/question/ngo-quyen-question.json` (mới)

- Sinh bằng script tạm ở scratchpad (đọc xlsx bằng thư viện chuẩn, không cài gói, không đưa vào repo): lấy Excel sheet "7 Ngô Quyền" A3:H52, áp RESEARCH §5 (4 câu sửa: 20, 23, 33, 38) và §6 (6 câu thay: 29, 31, 41, 47, 49, 50 — câu 50 dùng câu Tràng Kênh, **không** dùng câu dự phòng). Định dạng như `phung-hung-question.json`: `{ id, question, options[4], correct (0–3), explanation }`; `id` = STT Excel.
- 40 câu giữ chép **nguyên văn**. Câu sửa chỉ đổi đúng phần RESEARCH §5 nêu (20, 23, 38: chữ câu hỏi; 23: thêm cả giải thích; 33: chữ phương án A). Câu thay: đáp án đúng ở `options[0]`, `correct: 0` (`quiz.js` và `engine/dialogue.js` đều xáo phương án).
- Ô số phải ra chuỗi trong `options` (câu 16 năm 938/939/944/905, câu 49 mới 937/930/938/944).

### 2.2 Frontend chương — `frontend/static/js/levels/ngo-quyen/`

| File | Nội dung |
|---|---|
| `main.js` | `boot(NGO_QUYEN)` |
| `chapter.js` | `NGO_QUYEN = { id: 7, key: 'nq', … }` theo hợp đồng `engine/chapter.js`; không `skills`, `enemyKinds`, `hooks`, `charge`, `plunge`, `stealth` |
| `config.js` | asset path tạm trỏ chương 6, `BORROWED_MAPS`, `TILES`, `LEVEL_SPRITES`, `LEVEL_URLS`, vùng/đích từng màn, bảng ánh xạ tối thiểu, `ITEM` (sách mượn như chương 6), `PICKUPS.heal` = `ITEM_LND_HEAL`, `QUIZ`, `REWARD_NAMES` (3 tên NQ-00 §3.4), `TEXT` (như chương 6, đổi chữ "quân Đường" → "quân giặc") |
| `questions-data.js` | **sinh bằng script** (2.5): 50 câu, `LEVEL1_QUESTION_POOL` 35 câu, `NPC_QUESTION_POOLS` `duongDinhNghe`/`kieuCongHan`/`ngoXuongNgap` theo NQ-00 §3.3 |
| `dialogue-data.js` | `CHAPTER_END` nguyên văn NQ-00 §5.3; `NPC_DIALOGUES = {}` |
| `audio-data.js` | `MUSIC_FILES` tạm trỏ `audio/phung-hung/level{1,2,3}.mp3` (`TODO_MISSING` nhạc riêng), `SFX = {}` |
| `level1.js`, `level2.js`, `level3.js` | màn tối giản (2.3); `level3.js` có `update` kết thúc trận |

### 2.3 Nội dung màn tối giản (DESIGN_BASELINE, toàn bộ PLACEHOLDER)

| Màn | URL | Bố cục |
|---|---|---|
| 1 "Hành quân ra Bắc" | `/gameplay/levels/ngo-quyen` | 6 chunk nền phẳng; 3 lính giáo (`EN_PH_TANG_SPEARMAN`), 1 đá lăn; **5 Quyển Sách** cố định; 4 câu hỏi chặn đường từ `LEVEL1_QUESTION_POOL`; đích cuối màn, cần đủ 5 sách |
| 2 "Trận địa cọc ngầm" | `…/ngo-quyen/2` | 4 chunk, 2 lính; **3 câu hỏi chặn đường** lần lượt từ pool `duongDinhNghe` → `kieuCongHan` → `ngoXuongNgap`; đích cuối màn |
| 3 "Đại thắng Bạch Đằng" | `…/ngo-quyen/3` | đấu trường 1 chunk (`arena: true`), 3 đợt lính qua `makeSpawner`; hết đợt 3 + hết quân → `endGame(true)` → panel hết chương. Không boss, không cutscene, `skills: false` |

Không dùng `guide`, `npcs`, `events` cốt truyện. `introMessage` = tên màn (NQ-00 §5.1, màn 1 có câu thông báo đã sửa mốc 937).

### 2.4 Template + route

- `frontend/templates/gameplay/levels/ngo-quyen.html` kế thừa `gameplay/base.html` (theo mẫu `phung-hung.html`): `chapter_name` "Ngô Quyền", `brand` "SUTA · NGÔ QUYỀN", `item_label` "Quyển Sách Tinh Hoa đã thu thập", `item_glyph` 📖; khối kỹ năng để trống; `chapter_script` → `js/levels/ngo-quyen/main.js`. Không CSS riêng.
- `backend/routes/pages.py`: 3 route `render_chapter_level("ngo-quyen", n, "Màn n: …")` với tên màn "Hành quân ra Bắc", "Trận địa cọc ngầm", "Đại thắng Bạch Đằng".

### 2.5 Script câu hỏi — `tools/make_question_data.py`

Thêm mục `"ngo-quyen"` vào `CHAPTERS`: `task` = `docs/SUTA_NQ_TASK_00.md §3.3`, `excluded: []`, `npc` = `duongDinhNghe: [3, 6, 7, 10, 49]`, `kieuCongHan: [11, 12, 21, 29, 31]`, `ngoXuongNgap: [13, 14, 28, 34, 46]`, `level1` = 35 câu còn lại. Sửa dòng "Chạy:" trong docstring. **Không** sinh lại file chương 2–6.

### 2.6 Backend — migration `backend/migrations/012_ngo_quyen.sql` (skill `/add-migration`)

```sql
INSERT INTO chapters (id, slug, title, sort_order) VALUES (7, 'ngo-quyen', 'Ngô Quyền', 7);
INSERT INTO levels (id, chapter_id, level_no, title, first_clear_gold, first_clear_gems) VALUES
    (701, 7, 1, 'Hành quân ra Bắc',    300, 0),
    (702, 7, 2, 'Trận địa cọc ngầm',   448, 0),
    (703, 7, 3, 'Đại thắng Bạch Đằng', 598, 19);
INSERT INTO rewards (id, chapter_id, name) VALUES
    ('BUFF_NQ_SWIFT',    7, 'Thần Tốc Hành Quân'),
    ('SK_NQ_IRON_STAKE', 7, 'Cọc Sắt Bạch Đằng'),
    ('SK_NQ_DECOY_BOAT', 7, 'Thuyền Nhẹ Khiêu Chiến');
INSERT INTO achievements (code, name, description, icon, reward_gold, reward_gems, sort_order) VALUES
    ('NQ_CLEAR_1', 'Hành quân ra Bắc',    'Hoàn thành màn 1 chương Ngô Quyền.', '🛶', 149, 0, 27),
    ('NQ_CLEAR_2', 'Trận địa cọc ngầm',   'Hoàn thành màn 2 chương Ngô Quyền.', '🔨', 149, 0, 28),
    ('NQ_CHAPTER', 'Bạch Đằng 938',       'Hoàn thành chương Ngô Quyền.',       '👑', 0, 24, 29),
    ('NQ_SPEED',   'Nước triều thần tốc', 'Tổng thời gian tốt nhất 3 màn Ngô Quyền dưới 15 phút.', '🌊', 0, 12, 30);
```

- `backend/routes/api.py`: `VALID_LEVEL_IDS` + 701–703, `VALID_CHAPTER_IDS` + 7.
- `backend/services/game_service.py`: `CHAPTER_NQ_LEVELS = (701, 702, 703)` + 4 luật `NQ_*` trong `ACHIEVEMENT_RULES` (`_cleared`, `_speed_for` có sẵn).
- Icon `NQ_CLEAR_2`: dự kiến 🪵, đo trên Windows 10 thì không hiện (ô trống như 🪙) → **đã đổi 🔨** lúc code (report NQ-SKELETON).

### 2.7 Trang chủ + /quiz

- Dòng thời gian (`timeline.html`, thẻ "Năm 938"): **giữ khoá**, chưa gắn `data-unlock-after="6"`, mở ở NQ-L1 (như chương 4–6).
- Chọn tướng (`chapter.html`): **thêm thẻ Ngô Quyền khoá** sau thẻ Phùng Hưng (Q1): class `locked`, `onclick` alert "Hoàn thành chương Phùng Hưng để mở khóa Ngô Quyền!", Năm 938, "(Tiền Ngô Vương)", "🔒 Qua chương Phùng Hưng"; chưa gắn `data-unlock-after`/`data-route` (NQ-L1 gắn).
- BXH: tab `data-scope="chapter-7"` trong `components/home/leaderboard.html`, đặt trước tab QUIZ; nhãn "🌊 NGÔ QUYỀN" (9 tab).
- `/quiz`: nút "Ngô Quyền" (`data-chapter="ngo-quyen"`) trong `quiz.html` + `QUIZ_BANKS['ngo-quyen']` (`excluded: []`) trong `js/quiz.js`.

### 2.8 Tài liệu

- Rule mới `.claude/rules/ngo-quyen-gameplay.md` (`paths`: `js/levels/ngo-quyen/**`, template chương, `tools/make_question_data.py`), ghi trạng thái PLACEHOLDER.
- `CLAUDE.md`: bảng rule. `.claude/rules/backend.md` (chương 7, migration 012), `assets-32bit.md` (chương 7 mượn asset chương 6), `history-content.md` (ngoại lệ bộ câu chương 7: giữ 40, sửa 4, thay 6 theo RESEARCH_NQ), `docs/architecture.md` nếu liệt kê chương.

---

## 3. TEST

| # | Test |
|---|---|
| S1 | `pytest tests` PASS. `test_time_api.py`: 3 URL Ngô Quyền → 200, đúng `data-level`, đúng `ngo-quyen/main.js`; save-time nhận 701–703, từ chối 704 (dòng 88 đổi 604 → 704 hoặc thêm dòng); tiến trình chương 7 OK, **chương 8 → 404** (dòng 247 đổi `progress/7` → `progress/8`); scope BXH: dòng 307 đổi `chapter-7` → `chapter-8`, thêm `level-704`; dòng 295 thêm `level-703`; luật `NQ_*` trao đúng điều kiện (899 s đạt, đúng 900 s chưa đạt) |
| S2 | Migration chạy 2 lần không lỗi (`test_app.py` khi có `SUTA_TEST_DATABASE_URL`; không có → ghi chưa kiểm, kiểm trên DB dev khi khởi động lại server). `test_app.py`: dòng 74 thêm `012_ngo_quyen`; dòng 139 `levels_total` 18 → 21; thưởng 300/448/598 + 19 KC, 4 thành tựu, 3 phần thưởng |
| S3 | JSON đủ 50 câu; script đối chiếu: 40 câu giữ khớp Excel từng chữ, 4 câu sửa chỉ khác đúng trường đã duyệt, 6 câu thay khớp RESEARCH §6; `correct` trong 0–3, 4 phương án không trùng. `questions-data.js`: pool đúng NQ-00 §3.3, script tự kiểm id tồn tại + không trùng |
| S4 | Màn 1: nhặt đủ 5 sách, 4 câu không trùng, qua đích → "Sang Màn 2"; thiếu sách bị giữ lại |
| S5 | Màn 2: 3 câu đúng thứ tự pool; qua đích → "Sang Màn 3" |
| S6 | Màn 3: 3 đợt lính, hết → panel "Hoàn thành chương Ngô Quyền" (2 dòng §5.3); "Chơi lại chương" về màn 1 |
| S7 | Vào thẳng màn 2/3 khi chưa qua màn trước → về màn 1; `?debug=1` vào được; tiến trình ghi `suta.nq.progress`, **không đụng** khoá của 6 chương trước |
| S8 | API: kỷ lục `level_id` 701–703, `PUT /api/game/progress/7`; tab BXH gọi `scope=chapter-7` |
| S9 | Hồi quy: màn 1 của 6 chương trước nạp đúng; `PUT progress/6` vẫn lưu; `/quiz` 7 chương chạy; console sạch (trừ 401 khách) |
| S10 | `/verify-ui`: màn 1 chương 7, cửa sổ BXH 9 tab, cửa sổ chọn tướng 7 thẻ và `/quiz` ở desktop, 1024 px, điện thoại ngang + dọc; báo số đo (tab BXH không tràn ngang, lưới chọn tướng không vỡ) |

## 4. FILE

| Loại | File |
|---|---|
| Tạo | `frontend/static/assets/question/ngo-quyen-question.json`, `frontend/static/js/levels/ngo-quyen/{main,chapter,config,questions-data,dialogue-data,audio-data,level1,level2,level3}.js`, `frontend/templates/gameplay/levels/ngo-quyen.html`, `backend/migrations/012_ngo_quyen.sql`, `.claude/rules/ngo-quyen-gameplay.md`, `docs/REPORT_NQ-SKELETON.md` |
| Sửa | `backend/routes/{pages,api}.py`, `backend/services/game_service.py`, `tools/make_question_data.py`, `frontend/templates/components/home/leaderboard.html`, `frontend/templates/quiz.html`, `frontend/static/js/quiz.js`, `tests/test_time_api.py`, `tests/test_app.py`, `CLAUDE.md`, `.claude/rules/{backend,assets-32bit,history-content}.md`, `docs/architecture.md` (nếu liệt kê chương); `frontend/templates/components/home/chapter.html` (thẻ khoá, Q1) |
| Chỉ đọc | `js/levels/phung-hung/*` (mẫu), `js/engine/*`, `assets/images/phung-hung/**`, `backend/migrations/011_phung_hung.sql`, Excel `DATA các nhân vật.xlsx` |

## 5. QUYẾT ĐỊNH ĐÃ CHỐT (11/11/2026, người dùng)

| # | Câu hỏi | Quyết định |
|---|---|---|
| Q1 | Cửa sổ chọn tướng (`chapter.html`) có thẻ cho chương 1–6, **chưa có thẻ Ngô Quyền** (dòng thời gian thì đã có). Thêm lúc nào? | **ĐÃ CHỐT: thêm ngay ở NQ-SKELETON, để khoá** (class `locked`, "🔒 Qua chương Phùng Hưng", Năm 938, phụ đề "(Tiền Ngô Vương)"), chưa gắn `data-unlock-after`; NQ-L1 gắn như các chương trước. Kiểm lưới 7 thẻ ở S10 |

## 6. GATE

1. Không sửa engine, không sửa file chương 1–6 (trừ các file dùng chung ở mục 4); mọi chỗ tạm ghi `PLACEHOLDER`/`TODO_MISSING`.
2. Test S1–S10 ghi PASS/FAIL có số đo; FAIL hoặc sửa ngoài phạm vi → `BLOCKED`.
3. Report `/task-report`; chỉ commit khi người dùng yêu cầu. Sau đó: NQ-ENGINE + prompt Codex `NQ_ART_01`.
