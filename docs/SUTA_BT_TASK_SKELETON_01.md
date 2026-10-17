# SỬ TA — CHƯƠNG 2: BÀ TRIỆU
# TASK CARD: BT-SKELETON — KHUNG CHƯƠNG `ba-trieu` CHẠY BẰNG ASSET CHƯƠNG 1

TASK_ID: BT-SKELETON • Version 1.0 • 16/10/2026 • **CHỜ DUYỆT**
Task card tổng: [SUTA_BT_TASK_00.md](SUTA_BT_TASK_00.md) (§1 thông số chương) • Trước đó: [BT-ENGINE Phase A](REPORT_BT-ENGINE.md)
Rule áp dụng: `engine.md`, `trung-trac-gameplay.md` (mẫu), `backend.md`, `web-pages.md`; skill `/add-migration`

---

## 0. MỤC TIÊU

Dựng đủ đường đi của chương 2 từ trình duyệt tới DB: 3 URL màn chơi chạy được, tiến trình màn 1 → 2 → 3 → panel hết chương, kỷ lục và tiến trình lưu server, BXH có tab chương. Nội dung màn **tối giản** bằng asset + hành vi có sẵn của chương 1 để các task sau (BT-ENGINE B, BT-L1/L2/L3) chỉ việc thay nội dung.

**Không làm:** thoại NPC, cốt truyện, NPC dẫn màn, kỹ năng, boss Lục Dận (nội dung BT-00 §4–5 còn chờ team duyệt); asset mới; cơ chế engine mới (Phase B); thành tựu `BT_*`.

## 1. QUY TẮC
1. **Không import file nào trong `js/levels/trung-trac/`** từ chương Bà Triệu (hai chương độc lập). Bảng ánh xạ sprite cần dùng thì chép phần tối thiểu sang `ba-trieu/config.js`, ghi rõ `PLACEHOLDER — asset chương 1, thay ở BT-L<n>`.
2. Asset tạm: trỏ thẳng manifest chương 1 (`SPRITE_ROOT`/`MAP_ROOT` = thư mục `trung-trac/`), **không chép ảnh**. Thư mục `images/ba-trieu/` chưa tạo (Codex tạo ở `BT_ART_01`).
3. Câu chữ hiển thị chỉ dùng: tên màn (BT-00 §5.1 — tên ngắn, không câu mô tả còn chờ duyệt), câu hỏi từ Excel, câu thông báo chung kiểu kỹ thuật (`TEXT`). Câu nào còn chờ team → `TODO_MISSING`.
4. Số mới là `DESIGN_BASELINE` (độ dài màn, vị trí, thưởng vàng).
5. Không sửa engine. Thiếu gì ở engine → dừng và báo.

---

## 2. TRIỂN KHAI

### 2.1 Frontend chương — `frontend/static/js/levels/ba-trieu/`

| File | Nội dung |
|---|---|
| `main.js` | `boot(BA_TRIEU)` |
| `chapter.js` | `BA_TRIEU = { id: 2, key: 'bt', … }` theo hợp đồng `engine/chapter.js`; không `skills`, `enemyKinds`, `hooks` |
| `config.js` | asset path (tạm trỏ chương 1), `LEVEL_SPRITES`, `LEVEL_URLS`, vùng/đích từng màn, bảng ánh xạ tối thiểu (`OBSTACLE_TYPES`, `HAZARD_SPRITES`, `ENEMY_SPRITES` + `GUARD`, `PROJECTILE_SPRITES`, `NPC_SPRITES` = `{}`), `ITEM` (sprite `ITEM_BINH_THU` tạm), `QUIZ`, `REWARD_NAMES`, `TEXT` |
| `questions-data.js` | **sinh bằng script** (2.4) từ `ba-trieu-question.json`: `QUESTIONS` (45 câu, bỏ 15/33/37/41/45), `LEVEL1_QUESTION_POOL`, `NPC_QUESTION_POOLS` theo BT-00 §3.3 |
| `dialogue-data.js` | `CHAPTER_END = { title: 'Hoàn thành chương Bà Triệu', text: score => … }` — dòng điểm (BT-00 §5.3 dòng 1, chờ duyệt → ghi `TODO_MISSING` nếu team chưa duyệt khi code) ; `NPC_DIALOGUES = {}` |
| `audio-data.js` | `MUSIC_FILES` tạm trỏ 3 file `audio/trung-trac/level{1,2,3}.mp3` (`TODO_MISSING` nhạc riêng), `SFX = {}`, `MUSIC` tổng hợp dự phòng tối thiểu |
| `level1.js` | màn 1 tối giản (2.2) |
| `level2.js` | màn 2 tối giản |
| `level3.js` | màn 3 tối giản + `update` kết thúc trận |

`TEXT` (thay chữ "quân Hán" → "quân Ngô", "sách lịch sử" → "Quyển Sách Tinh Hoa"): `obstacleHit`, `trapHit`, `fell`, `hazardHit`, `hazardDefeated`, `projectileHit`, `bossContact`, `bossDefeated`, `bossBlocksFinish`, `itemPicked`, `itemsMissing`, `rescueHint`.

### 2.2 Nội dung màn tối giản (DESIGN_BASELINE, toàn bộ PLACEHOLDER)

| Màn | URL | Bố cục |
|---|---|---|
| 1 "Rừng núi Nưa" | `/gameplay/levels/ba-trieu` | 6 chunk, nền phẳng, vùng cảnh tạm Z1/Z3 chương 1; 3 lính canh, 1 bẫy chông, 1 roller (hổ); **5 Quyển Sách** cố định; 4 câu hỏi chặn đường rút từ `LEVEL1_QUESTION_POOL` (`QUIZ.level1Count = 4`); đích ở cuối (`gate: null`), cần đủ 5 sách |
| 2 "Chiêu mộ hiền tài" | `…/ba-trieu/2` | 4 chunk, 2 lính canh; **3 câu hỏi chặn đường** lần lượt từ `NPC_QUESTION_POOLS.quocDat/hoLy/bachTuong` (chưa có NPC — thêm ở BT-L2); đích ở cuối |
| 3 "Chiến lũy Bồ Điền" | `…/ba-trieu/3` | đấu trường 1 chunk (`arena: true`), 3 đợt lính canh qua `makeSpawner` (như giai đoạn 2 chương 1); hết đợt 3 + hết quân → `endGame(true)` → panel hết chương. Không boss, không cutscene, `skills: false` |

Không dùng `guide`, `npcs`, `events` cốt truyện. `introMessage` = tên màn.

### 2.3 Template + route
- `frontend/templates/gameplay/levels/ba-trieu.html` kế thừa `gameplay/base.html`: `chapter_name` "Bà Triệu", `brand` "SUTA · BÀ TRIỆU", `canvas_label`, `item_label` "Quyển Sách Tinh Hoa đã thu thập", `item_glyph` 📖; khối kỹ năng để trống; `chapter_script` → `js/levels/ba-trieu/main.js`. Không CSS riêng.
- `backend/routes/pages.py`: 3 route gọi `render_chapter_level("ba-trieu", n, "Màn n: …")`. Không alias URL cũ.

### 2.4 Script sinh câu hỏi — `tools/make_question_data.py`
- Đọc `frontend/static/assets/question/<chương>-question.json` (đã đối chiếu khớp Excel 50/50 ở BT-00) → ghi `js/levels/<chương>/questions-data.js` cùng định dạng chương 1 (`{stt, question, answers, correct, explain}`), danh sách loại và pool truyền tham số/khai báo đầu script.
- Chỉ chạy cho `ba-trieu`; **không** sinh lại file của Trưng Trắc.

### 2.5 Backend — migration `backend/migrations/005_ba_trieu.sql` (skill `/add-migration`)
```sql
INSERT INTO chapters (id, slug, title, sort_order) VALUES (2, 'ba-trieu', 'Bà Triệu', 2);
-- Thưởng qua màn lần đầu: DESIGN_BASELINE = bằng chương 1, chờ team chốt.
INSERT INTO levels (id, chapter_id, level_no, title, first_clear_gold, first_clear_gems) VALUES
    (201, 2, 1, 'Rừng núi Nưa', 100, 0),
    (202, 2, 2, 'Chiêu mộ hiền tài', 150, 0),
    (203, 2, 3, 'Chiến lũy Bồ Điền', 200, 5);
INSERT INTO rewards (id, chapter_id, name) VALUES
    ('BUFF_BT_CRIT', 2, 'Chí mạng'),
    ('SK_BT_RATTAN_SHIELD', 2, 'Khiên mây tre'),
    ('SK_BT_WHITE_ELEPHANT', 2, 'Gọi Bạch Tượng');
```
- Không đổi bảng (`cleared_level` 0–3 vẫn đủ vì mỗi chương 3 màn).
- `backend/routes/api.py`: `VALID_LEVEL_IDS` thêm 201–203, `VALID_CHAPTER_IDS` thêm 2.
- Thành tựu: **không thêm** `BT_*` (chờ team). Lưu ý: `TT_FLAWLESS` / `TT_SCHOLAR` ("qua một màn…") trong `game_service.py` sẽ tính cả màn Bà Triệu — giữ nguyên, ghi vào report để team quyết (Q3).

### 2.6 Trang chủ
- BXH: thêm tab `data-scope="chapter-2"` "BÀ TRIỆU" trong `components/home/leaderboard.html` (+ CSS nếu tab tràn trên điện thoại).
- Thẻ Bà Triệu trên dòng thời gian / cửa sổ chọn tướng: **giữ khoá** (Q1) — chương mới vào bằng URL trực tiếp.

### 2.7 Tài liệu
- Rule mới `.claude/rules/ba-trieu-gameplay.md` (`paths`: `js/levels/ba-trieu/**`, template, `tools/make_question_data.py`), ghi rõ trạng thái PLACEHOLDER.
- `CLAUDE.md`: bảng rule + dòng trạng thái ("chương Bà Triệu: khung chạy bằng asset tạm"); `docs/architecture.md` nếu có liệt kê chương.
- Thêm `paths` của chương mới vào rule liên quan: `history-content.md` (dialogue/questions của ba-trieu), `assets-32bit.md` (khi có asset — để sau).

---

## 3. TEST

| # | Test |
|---|---|
| S1 | `pytest tests` PASS; thêm test không cần DB: 3 URL Bà Triệu → 200, đúng `data-level`, đúng `ba-trieu/main.js`; `VALID_*` chấp nhận 201–203 / chương 2 (save-time, progress) |
| S2 | Migration chạy 2 lần không lỗi (test `test_migrations_are_idempotent` khi có DB test) — nếu máy không có `SUTA_TEST_DATABASE_URL` thì ghi rõ chưa kiểm |
| S3 | `questions-data.js` sinh ra: 45 câu, không có 15/33/37/41/45, mọi id trong pool tồn tại, so khớp chữ với JSON |
| S4 | Chơi màn 1: nhặt đủ 5 sách, 4 câu hỏi không trùng, qua đích → "Sang Màn 2"; thiếu sách bị giữ lại |
| S5 | Màn 2: 3 câu hỏi đúng thứ tự pool; qua đích → "Sang Màn 3" |
| S6 | Màn 3: 3 đợt lính, hết → panel "Hoàn thành chương Bà Triệu", "Chơi lại chương" về màn 1 |
| S7 | Vào thẳng màn 2/3 khi chưa qua màn trước → về màn 1; `?debug=1` vào được; tiến trình lưu khoá `suta.bt.progress`, **không đụng** `suta.tt.progress` |
| S8 | Đăng nhập: kỷ lục gửi với `level_id` 201–203 (200 OK), tiến trình `PUT /api/game/progress/2`; tab BXH "BÀ TRIỆU" hiện dữ liệu |
| S9 | Hồi quy: 3 màn Trưng Trắc + `/quiz` không đổi; console sạch (trừ 401 khách) |
| S10 | `/verify-ui` màn 1 Bà Triệu + tab BXH mới ở desktop và điện thoại ngang |

## 4. FILE

| Loại | File |
|---|---|
| Tạo | `frontend/static/js/levels/ba-trieu/{main,chapter,config,questions-data,dialogue-data,audio-data,level1,level2,level3}.js`, `frontend/templates/gameplay/levels/ba-trieu.html`, `backend/migrations/005_ba_trieu.sql`, `tools/make_question_data.py`, `.claude/rules/ba-trieu-gameplay.md`, `docs/REPORT_BT-SKELETON.md` |
| Sửa | `backend/routes/pages.py`, `backend/routes/api.py`, `tests/test_time_api.py`, `tests/test_app.py` (nếu cần cho migration), `frontend/templates/components/home/leaderboard.html` (+ `css/home/board.css` nếu cần), `CLAUDE.md`, `.claude/rules/history-content.md` |
| Chỉ đọc | `js/levels/trung-trac/*`, `js/engine/*`, `frontend/static/assets/question/ba-trieu-question.json` |

## 5. CÂU HỎI CẦN CHỐT

| # | Câu hỏi | Đề xuất |
|---|---|---|
| Q1 | Mở thẻ Bà Triệu trên trang chủ ngay ở bước này? | **Không** — giữ khoá tới khi xong BT-L1 (asset thật); khung chỉ vào bằng URL |
| Q2 | Thưởng vàng/KC qua màn chương 2 | **Bằng chương 1** (100/150/200 vàng + 5 KC), `DESIGN_BASELINE`, chờ team |
| Q3 | `TT_FLAWLESS`/`TT_SCHOLAR` có tính cả màn Bà Triệu không? | **Giữ nguyên** (tính mọi màn), ghi vào report cho team |
| Q4 | Seed 3 phần thưởng chương 2 ngay trong `005`? | **Có** — id cố định theo BT-00 §3.4 để `?debug=1` và API tiến trình chạy; đổi tên sau bằng migration mới |
| Q5 | Tab BXH "BÀ TRIỆU" hiện ngay dù chương còn tạm? | **Có** — dữ liệu chỉ có khi ai đó chơi qua URL |

## 6. GATE
1. Không sửa engine, không sửa file Trưng Trắc; mọi chỗ tạm ghi `PLACEHOLDER`/`TODO_MISSING`.
2. Test S1–S10 ghi PASS/FAIL có số đo; FAIL hoặc sửa ngoài phạm vi → `BLOCKED`.
3. Report `/task-report`; chỉ commit khi người dùng yêu cầu. Sau đó: BT-ENGINE Phase B.
