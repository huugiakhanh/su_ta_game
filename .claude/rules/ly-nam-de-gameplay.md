---
paths:
  - "frontend/static/js/levels/ly-nam-de/**"
  - "frontend/templates/gameplay/levels/ly-nam-de.html"
  - "tools/make_question_data.py"
---

# Màn chơi chương Lý Nam Đế (chương 3)

Kế hoạch + quyết định đã chốt: [docs/SUTA_LND_TASK_00.md](../../docs/SUTA_LND_TASK_00.md). Lộ trình: LND-SKELETON (xong) → LND-ENGINE (xong) → `LND_ART_01` → LND-L1 (xong 02/11, [REPORT_LND-L1.md](../../docs/archive/REPORT_LND-L1.md)) → `LND_ART_02` + LND-L2 → LND-L3. Cấu trúc theo mẫu chương Bà Triệu (rule `ba-trieu-gameplay.md`); cơ chế chung ở engine (rule `engine.md`).

## Trạng thái

- Chương `id: 3`, `key: 'lnd'` (sessionStorage `suta.lnd.progress`), level 301–303 (migration `007_ly_nam_de.sql`), URL `/gameplay/levels/ly-nam-de[/2|/3]` (`render_chapter_level("ly-nam-de", …)` trong `pages.py`). Thẻ trang chủ (dòng thời gian + chọn tướng) `data-unlock-after="2"` — mở khi đã qua chương Bà Triệu. URL thì luôn vào được.
- Người chơi là nghĩa sĩ nam/nữ chung; Lý Bí là NPC dẫn màn 1 (`guide`, `NPC_LY_BI` + `PORTRAIT_LY_BI`, thoại `STORY_LY_BI_INTRO`) + cutscene màn 3 (chưa làm).
- **Asset**: `images/ly-nam-de/{sprites,maps}-32bit/` (`manifest_lnd.json`, `maps_lnd.json`, đợt `LND_ART_01` — `IN_GAME`). Mượn map qua `BORROWED_MAPS`: chương 1 (trời, tile, làng, đồng lúa, bia câu hỏi), chương 2 (sách `ITEM_BT_TINH_HOA`, cổng doanh trại, nền rừng/đầm/doanh trại cho màn 2–3 khung). Sprite chép từ chương 1–2 (cùng ID): `OB_TRIBUTE_CART`, `PJ_FIRE_ARROW`, `OB_BOULDER`, `PJ_CROSSBOW_BOLT`. Nhạc tạm `audio/ba-trieu/level1–3.mp3`.
- **Không import file nào của `js/levels/trung-trac/` hay `js/levels/ba-trieu/`** — bảng nào cần thì khai báo lại trong `config.js` chương này.
- **Màn 1 "Từ quan chiêu binh"** (LND-L1, `level1.js`, DESIGN_BASELINE): 12 chunk = 9216 px; vùng đồi trung du 1–2 → làng 3–4 → sông Hồng 5–7 → trạm kiểm soát 8–11 → đồng bằng 12 (cổng doanh trại `worldX(12, 618)`). 10 nhóm xáo trong vùng được phép (lính tuần tiễu ×2, quan thu thuế, thuyền chiến ×2 kèm lưới địa hình `RIVER` 2 khe `'~'` + mỏm đá `PROP_LND_ROCK_LEDGE`, cung thủ + tháp canh, lưới trúc nhóm dễ chunk 1, chó săn, xe cống phẩm nhỏ chở sách, đá lở) + lưới cố định chunk 9 + **mini-boss xe trâu** (`patrol` không dừng/không ném, `fireRange: 0`, 6 đòn, `corpse`, chở 1 sách, 2 lính hộ tống) = 12. Sách 3 cố định + 1 xe nhỏ + 1 xe trâu. 4 bia câu hỏi chunk 3, 5, 8, 10 (không rơi vào khe sông). Nghỉ chân hồi 1 máu chunk 8.
- **Tháp canh** = hazard kind `prop` (`watchtower`) đặt **trước** cung thủ trong danh sách hazard để vẽ phía sau; cung thủ `groundY: GROUND_Y − TOWER.deck` (91 — đáy ảnh tháp ở hàng 447, sàn hàng ảnh 80). Thuyền chiến `harmful: false` (chỉ hoả tiễn gây sát thương), pivot = mặt đất + 14.
- Layout thử `?layout=engine` (màn 1, `ENGINE_TEST`, LND-ENGINE) dùng asset thật: bẫy lưới, sông 2 khe + mỏm đá + thuyền, tháp + cung thủ, xe cống phẩm chở sách, chó săn, 3 lính rơi bình máu (`hooks.dropHeal` chỉ bật khi `state.layoutTest === 'engine'`).
- Màn 2–3 vẫn là **khung** (LND-SKELETON, DESIGN_BASELINE) với lính Lương thật: màn 2 = 4 chunk, 2 lính, 1 bẫy lưới, 3 câu hỏi theo pool `phamTu` → `tinhThieu` → `trieuTuc` (chưa NPC); màn 3 = đấu trường, 3 đợt lính (`WAVES`), hết quân → `endGame(true)` (`updateLevel3`). Chưa có kỹ năng, boss, cutscene.

## Nội dung lịch sử

- `questions-data.js` **sinh bằng** `python tools/make_question_data.py ly-nam-de` từ `assets/question/ly-nam-de-question.json` (khớp Excel 50/50). Không sửa tay; đổi pool thì sửa `CHAPTERS` trong script rồi chạy lại. **Giữ đủ 50 câu** (không loại câu nào); câu nghi vấn chờ team ở LND-00 mục 7. `/quiz` dùng cùng JSON (`QUIZ_BANKS['ly-nam-de']`, `excluded: []`).
- `dialogue-data.js`: thoại NPC, cutscene, câu kết chương **đã duyệt** (LND-00 §4–5) — chép **nguyên văn** từ task card (rule `history-content.md`). Đã có: thông báo đầu màn 1 (§5.1, `chapter.js`), thoại Lý Bí dẫn màn 1 (§5.2, `STORY_LY_BI_INTRO`), panel kết chương (§5.4, `CHAPTER_END`). Còn: 3 NPC màn 2 (LND-L2), cutscene (LND-L3).
- Phần thưởng màn 2 (id khớp seed `007`): `SK_LND_TO_LICH_SHIELD` Khiên Tô Lịch (K), `BUFF_LND_SUPPLY` Lương thảo dồi dào (bị động — quân màn 3 rơi bình máu nhiều hơn), `SK_LND_TIDE` Triều Cường (L). Cơ chế làm ở LND-L3.
- Thưởng/thành tựu (LND-00 mục 9, migration `007`): qua màn lần đầu 144/216/288 vàng + 10 KC; `LND_CLEAR_1`, `LND_CLEAR_2`, `LND_CHAPTER`, `LND_SPEED` (3 màn < 15 phút) — luật trong `game_service.py` (`CHAPTER_LND_LEVELS`).
