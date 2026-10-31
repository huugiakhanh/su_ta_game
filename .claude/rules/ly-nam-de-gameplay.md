---
paths:
  - "frontend/static/js/levels/ly-nam-de/**"
  - "frontend/templates/gameplay/levels/ly-nam-de.html"
  - "tools/make_question_data.py"
---

# Màn chơi chương Lý Nam Đế (chương 3)

Kế hoạch + quyết định đã chốt: [docs/SUTA_LND_TASK_00.md](../../docs/SUTA_LND_TASK_00.md). Lộ trình: **LND-SKELETON (khung, xong)** → LND-ENGINE → LND-L1/L2/L3. Cấu trúc theo mẫu chương Bà Triệu (rule `ba-trieu-gameplay.md`); cơ chế chung ở engine (rule `engine.md`).

## Trạng thái: khung 3 màn chạy bằng asset MƯỢN (PLACEHOLDER)

- Chương `id: 3`, `key: 'lnd'` (sessionStorage `suta.lnd.progress`), level 301–303 (migration `007_ly_nam_de.sql`), URL `/gameplay/levels/ly-nam-de[/2|/3]` (`render_chapter_level("ly-nam-de", …)` trong `pages.py`). Thẻ trang chủ (dòng thời gian + chọn tướng) **còn khoá**, chưa có `data-unlock-after` — mở (`data-unlock-after="2"`) ở LND-L1 khi có asset thật. URL thì luôn vào được.
- Người chơi là nghĩa sĩ nam/nữ chung; Lý Bí là NPC dẫn màn 1 + cutscene (chưa làm).
- **Asset tạm**: `SPRITE_ROOT`/`MAP_ROOT` trỏ thẳng thư mục chương 2 (`images/ba-trieu/`, `manifest_bt.json`, `maps_bt.json`) + `BORROWED_MAPS` của chương 1 như chương 2 đang mượn. Không chép ảnh. Lính Lương tạm = `EN_NGO_SOLDIER`, sách = `ITEM_BT_TINH_HOA`, nhạc = `audio/ba-trieu/level1–3.mp3`. Thay bằng `images/ly-nam-de/` (`manifest_lnd.json`, `maps_lnd.json`) ở `LND_ART_01–03`. Console báo `maps_bt.json: stage khác engine/chương` (stage_length 9216 ≠ 4608 của màn 1 khung) — vô hại, hết khi có `maps_lnd.json`.
- **Không import file nào của `js/levels/trung-trac/` hay `js/levels/ba-trieu/`** — bảng nào cần thì khai báo lại trong `config.js` chương này.
- Màn khung (DESIGN_BASELINE): màn 1 = 6 chunk phẳng, 3 lính, 1 bẫy chông, 1 đá lăn, 2 vật cản, 5 sách, 4 câu hỏi, đích cuối (không cổng); màn 2 = 4 chunk, 2 lính, 1 bẫy, 3 câu hỏi theo pool `phamTu` → `tinhThieu` → `trieuTuc` (chưa NPC); màn 3 = đấu trường, 3 đợt lính (`WAVES`), hết quân → `endGame(true)` (`updateLevel3`). Chưa có kỹ năng, boss, cutscene.

## Nội dung lịch sử

- `questions-data.js` **sinh bằng** `python tools/make_question_data.py ly-nam-de` từ `assets/question/ly-nam-de-question.json` (khớp Excel 50/50). Không sửa tay; đổi pool thì sửa `CHAPTERS` trong script rồi chạy lại. **Giữ đủ 50 câu** (không loại câu nào); câu nghi vấn chờ team ở LND-00 mục 7. `/quiz` dùng cùng JSON (`QUIZ_BANKS['ly-nam-de']`, `excluded: []`).
- `dialogue-data.js`: thoại NPC, cutscene, câu kết chương còn là **nháp chờ duyệt** (LND-00 §4–5) → để trống/`TODO_MISSING`, panel hết chương tạm chỉ báo điểm. Sau khi duyệt chép **nguyên văn**.
- Phần thưởng màn 2 (id khớp seed `007`): `SK_LND_TO_LICH_SHIELD` Khiên Tô Lịch (K), `BUFF_LND_SUPPLY` Lương thảo dồi dào (bị động — quân màn 3 rơi bình máu nhiều hơn), `SK_LND_TIDE` Triều Cường (L). Cơ chế làm ở LND-L3.
- Thưởng/thành tựu (LND-00 mục 9, migration `007`): qua màn lần đầu 144/216/288 vàng + 10 KC; `LND_CLEAR_1`, `LND_CLEAR_2`, `LND_CHAPTER`, `LND_SPEED` (3 màn < 15 phút) — luật trong `game_service.py` (`CHAPTER_LND_LEVELS`).
