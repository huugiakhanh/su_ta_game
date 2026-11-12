---
paths:
  - "frontend/static/js/levels/ngo-quyen/**"
  - "frontend/templates/gameplay/levels/ngo-quyen.html"
  - "tools/make_question_data.py"
---

# Màn chơi chương Ngô Quyền (chương 7)

Kế hoạch + quyết định đã chốt: [docs/SUTA_NQ_TASK_00.md](../../docs/SUTA_NQ_TASK_00.md) (duyệt hết 11/11/2026). Lộ trình: NQ-SKELETON (xong, [task card](../../docs/SUTA_NQ_TASK_SKELETON_01.md), [report](../../docs/REPORT_NQ-SKELETON.md)) → NQ-ENGINE (xong, [task card](../../docs/SUTA_NQ_TASK_ENGINE_01.md), [report](../../docs/REPORT_NQ-ENGINE.md): thuyền lái, thủy triều + bãi triều, gió ngược, xoáy nước, cắm cọc + cột `stakes`, đạn choáng — rule `engine.md` mục NQ-ENGINE) → `NQ_ART_01` + NQ-L1 (xong 12/11, [task card](../../docs/SUTA_NQ_TASK_L1_01.md), [report](../../docs/REPORT_NQ-L1.md), người dùng chơi thử ổn) → `NQ_ART_02` + NQ-L2 → `NQ_ART_03` + NQ-L3. Cấu trúc theo mẫu chương Phùng Hưng (rule `phung-hung-gameplay.md`); cơ chế chung ở engine (rule `engine.md`).

## Trạng thái: màn 1 thật (NQ-L1), màn 2–3 khung (NQ-SKELETON)

- Chương `id: 7`, `key: 'nq'` (sessionStorage `suta.nq.progress`), level 701–703 (migration `012_ngo_quyen.sql`), URL `/gameplay/levels/ngo-quyen[/2|/3]` (`render_chapter_level("ngo-quyen", …)` trong `pages.py`). Slug khớp mục thư viện `ngo-quyen`. Thẻ dòng thời gian (Năm 938) và thẻ chọn tướng ("(Tiền Ngô Vương)") có `data-unlock-after="6"` + `data-route` (NQ-L1).
- **Asset** riêng `images/ngo-quyen/{sprites,maps}-32bit/` (`manifest_nq.json`, `maps_nq.json` — đợt `NQ_ART_01`), nguồn `assets/{sprites,maps}-32bit/ngo-quyen/`. Mượn map chương 1–3 qua `BORROWED_MAPS` (trời, tile, bia, sách, đồi xa, nước `PROP_LND_RIVER_WATER`). Sprite chép cùng ID: `EN_CROCODILE`, `OB_BOULDER`, `ITEM_LND_HEAL`, `FX_BT_STUN`, `PJ_SPEAR`, `PJ_CROSSBOW_BOLT`. Strip `row` nam/nữ ở `manifest_shared.json`. Nhạc tạm của chương 6 (`TODO_MISSING` nhạc riêng).
- **Mặt nước** `TILES.waterLift` −2: mặt nước thấp hơn mép bờ `WATER_SURFACE` 8 px để thân thuyền (boong `GROUND_Y + 2`, `BOAT_FLOAT` 14) hiện trên nước; xoáy + cá sấu đặt theo `WATER_SURFACE`.
- **Màn 1** (12 chunk, `LEVEL1`/`RIVERS` trong `config.js`, `level1.js`): bến Ái Châu 1–3 (Ngô Quyền `guide`; khe 1 176 px nhảy + lướt qua được; khe 2 448 px + sách treo giữa sông; khe 3 576 px + xoáy giữa dòng, 2 thuyền 2 bên — nhảy từ A sang B, xoáy bán kính 48), đường ra Bắc 4–8 (khe 4 + cá sấu; 2 vùng gió + đá nấp chunk 6; đá lăn chunk 8; nghỉ chân chunk 7), ngoài Đại La 9–12 (lính giáo rơi lao — `CARRY.javelin` bay **thẳng** (`gravity` 0, `range` 320 — người dùng chốt 12/11), `hooks.dropCarry` từ x ≥ chunk 9; 2 cung thủ trên ụ thành — ụ là ảnh map vẽ ở `render-extras.js`, cung thủ máu 1, hạ bằng nhảy lên ném lao (ném từ đất bay dưới thân cung thủ) hoặc nhảy chém; Kiều Công Tiễn art `kct` `boss` + `plungeOnly`, hp 8, rơi sách 5; cổng Đại La là đích). Nhóm xáo chunk 4, 7: 3 lính + 1 vùng gió. `returnBoats`: người đứng ở bờ trái một khe thì thuyền trống của khe đó về `homeX` (tránh kẹt khi rơi giữa sông). 4 câu hỏi chunk 2, 4, 7, 10.
- **Màn 2** (4 chunk): 2 lính, 3 câu hỏi chặn đường lần lượt pool `duongDinhNghe` → `kieuCongHan` → `ngoXuongNgap`; chưa có NPC. Nền tạm `BG_NQ_MID_NORTH_ROAD`.
- **Màn 3**: đấu trường 1 chunk, 3 đợt lính (`WAVES`, `makeSpawner`); `updateArena` gọi `endGame(true)` khi `state.spawner.done`. Nền tạm `BG_NQ_MID_AI_CHAU_RIVER`.
- Layout thử `?layout=engine` (màn 1, `ENGINE_TEST`): thuyền, xoáy, gió, đá vẽ bằng asset thật; bãi triều, cọc ngầm, đống cọc, mốc cọc, lính quăng lưới + lưới vẽ hộp tới `NQ_ART_02`. Triều 6/2/6/2 s.
- Người chơi là nghĩa sĩ nam/nữ chung; Ngô Quyền là NPC dẫn màn 1 + nhân vật cutscene màn 3.
- **Không import file nào của chương khác** — bảng nào cần thì khai báo lại trong `config.js` chương này.

## Thiết kế đã chốt (chi tiết ở NQ-00)

- Chướng ngại chia theo sử: màn 1 (Ái Châu → Đại La) chỉ quân Kiều Công Tiễn + thiên nhiên, mini-boss Kiều Công Tiễn; quân Nam Hán từ màn 2. Boss Hoằng Tháo dùng máy bắn đá + nỏ lửa, không "pháo".
- Màn 2: 6 mốc cắm cọc, tối thiểu 3 mới về đích; số cọc làm lâu thuyền mất giáp ở GĐ 2 màn 3 (vào màn 3 bằng URL thì tính mức tối thiểu).
- NPC màn 2: Dương Đình Nghệ hiện dạng **hồi tưởng năm 937** (mất trước trận Bạch Đằng); Kiều Công Hãn và Ngô Xương Ngập có dòng chú "Tương truyền" trên khung thoại.

## Nội dung lịch sử

- `assets/question/ngo-quyen-question.json`: 40 câu giữ nguyên Excel sheet "7 Ngô Quyền", 4 câu sửa (20, 23, 33, 38), 6 câu thay (29, 31, 41, 47, 49, 50) theo [docs/RESEARCH_NQ_QUESTIONS.md](../../docs/RESEARCH_NQ_QUESTIONS.md) §5–6 (người dùng duyệt 11/11/2026). `questions-data.js` **sinh bằng** `python tools/make_question_data.py ngo-quyen`; không sửa tay. `/quiz` dùng cùng JSON (`QUIZ_BANKS['ngo-quyen']`, `excluded: []`).
- `dialogue-data.js`: `STORY_NQ_INTRO` (Ngô Quyền dẫn màn 1), `STORY_NQ_KCT` (Kiều Công Tiễn, NQ-00 §5.1), `CHAPTER_END` (§5.3). Thoại NQ-00 §4, §5.2 đưa vào ở NQ-L2/L3.
- Phần thưởng màn 2 (id khớp seed `012`): `BUFF_NQ_SWIFT` Thần Tốc Hành Quân, `SK_NQ_IRON_STAKE` Cọc Sắt Bạch Đằng (K), `SK_NQ_DECOY_BOAT` Thuyền Nhẹ Khiêu Chiến (L) — cơ chế làm ở NQ-L3.
- Thưởng/thành tựu (NQ-00 mục 8, migration `012`): qua màn lần đầu 300/448/598 vàng + 19 KC; `NQ_CLEAR_1`, `NQ_CLEAR_2`, `NQ_CHAPTER`, `NQ_SPEED` (3 màn < 15 phút) — luật trong `game_service.py` (`CHAPTER_NQ_LEVELS`).
