---
paths:
  - "frontend/static/js/levels/ngo-quyen/**"
  - "frontend/templates/gameplay/levels/ngo-quyen.html"
  - "tools/make_question_data.py"
---

# Màn chơi chương Ngô Quyền (chương 7)

Kế hoạch + quyết định đã chốt: [docs/SUTA_NQ_TASK_00.md](../../docs/SUTA_NQ_TASK_00.md) (duyệt hết 11/11/2026). Lộ trình: NQ-SKELETON (xong, [task card](../../docs/SUTA_NQ_TASK_SKELETON_01.md), [report](../../docs/REPORT_NQ-SKELETON.md)) → NQ-ENGINE (xong, [task card](../../docs/SUTA_NQ_TASK_ENGINE_01.md), [report](../../docs/REPORT_NQ-ENGINE.md): thuyền lái, thủy triều + bãi triều, gió ngược, xoáy nước, cắm cọc + cột `stakes`, đạn choáng — rule `engine.md` mục NQ-ENGINE) → `NQ_ART_01` + NQ-L1 → `NQ_ART_02` + NQ-L2 → `NQ_ART_03` + NQ-L3. Cấu trúc theo mẫu chương Phùng Hưng (rule `phung-hung-gameplay.md`); cơ chế chung ở engine (rule `engine.md`).

## Trạng thái: khung PLACEHOLDER (NQ-SKELETON)

- Chương `id: 7`, `key: 'nq'` (sessionStorage `suta.nq.progress`), level 701–703 (migration `012_ngo_quyen.sql`), URL `/gameplay/levels/ngo-quyen[/2|/3]` (`render_chapter_level("ngo-quyen", …)` trong `pages.py`). Slug khớp mục thư viện `ngo-quyen`. Thẻ dòng thời gian (Năm 938) và thẻ chọn tướng (thêm ở NQ-SKELETON, "(Tiền Ngô Vương)") **đang khoá, chưa có `data-unlock-after`** — NQ-L1 gắn `data-unlock-after="6"` + `data-route`. URL thì luôn vào được.
- **Asset**: tạm trỏ thẳng `images/phung-hung/` (`manifest_ph.json`, `maps_ph.json`), chưa có `images/ngo-quyen/`. Mượn map chương 1–3 qua `BORROWED_MAPS`. Lính `EN_PH_TANG_SPEARMAN`, đá rơi `OB_PH_LATERITE_ROCK` (chương 6 không có `OB_BOULDER`). Nhạc tạm của chương 6 (`TODO_MISSING` nhạc riêng). Màn 1 cảnh báo lệch `stage_length` của `maps_ph.json` (9216 so với 4608) — hết khi có `maps_nq.json`.
- **Màn 1** (6 chunk): 3 lính, 1 đá rơi, 5 sách cố định, 4 câu hỏi từ `LEVEL1_QUESTION_POOL`; đích cuối chunk 6.
- **Màn 2** (4 chunk): 2 lính, 3 câu hỏi chặn đường lần lượt pool `duongDinhNghe` → `kieuCongHan` → `ngoXuongNgap`; chưa có NPC.
- **Màn 3**: đấu trường 1 chunk, 3 đợt lính (`WAVES`, `makeSpawner`); `updateArena` gọi `endGame(true)` khi `state.spawner.done`.
- Layout thử `?layout=engine` (màn 1, `ENGINE_TEST` trong `config.js`, `engineTestLayout` trong `level1.js`), hộp dự phòng tới `NQ_ART_01`, triều 6/2/6/2 s: thuyền + khe sông 320 px + xoáy chunk 1; 2 vùng gió + 2 đá nấp chunk 2; bãi triều 192 px + khe sông + thuyền 2 + 2 cọc ngầm `tideOnly: 'low'` chunk 3; đống cọc + 3 mốc trên bãi (cần 2) chunk 4; lính quăng lưới (`net`: `lob` + `stun` 1) + 1 lính chunk 5. Thuyền: boong ở GROUND_Y + 2 lúc nước lớn (`BOAT_FLOAT` 14, `ride.top` 4).
- Người chơi là nghĩa sĩ nam/nữ chung; Ngô Quyền sẽ là NPC dẫn màn 1 + nhân vật cutscene màn 3.
- **Không import file nào của chương khác** — bảng nào cần thì khai báo lại trong `config.js` chương này.

## Thiết kế đã chốt (chi tiết ở NQ-00)

- Chướng ngại chia theo sử: màn 1 (Ái Châu → Đại La) chỉ quân Kiều Công Tiễn + thiên nhiên, mini-boss Kiều Công Tiễn; quân Nam Hán từ màn 2. Boss Hoằng Tháo dùng máy bắn đá + nỏ lửa, không "pháo".
- Màn 2: 6 mốc cắm cọc, tối thiểu 3 mới về đích; số cọc làm lâu thuyền mất giáp ở GĐ 2 màn 3 (vào màn 3 bằng URL thì tính mức tối thiểu).
- NPC màn 2: Dương Đình Nghệ hiện dạng **hồi tưởng năm 937** (mất trước trận Bạch Đằng); Kiều Công Hãn và Ngô Xương Ngập có dòng chú "Tương truyền" trên khung thoại.

## Nội dung lịch sử

- `assets/question/ngo-quyen-question.json`: 40 câu giữ nguyên Excel sheet "7 Ngô Quyền", 4 câu sửa (20, 23, 33, 38), 6 câu thay (29, 31, 41, 47, 49, 50) theo [docs/RESEARCH_NQ_QUESTIONS.md](../../docs/RESEARCH_NQ_QUESTIONS.md) §5–6 (người dùng duyệt 11/11/2026). `questions-data.js` **sinh bằng** `python tools/make_question_data.py ngo-quyen`; không sửa tay. `/quiz` dùng cùng JSON (`QUIZ_BANKS['ngo-quyen']`, `excluded: []`).
- `dialogue-data.js`: hiện chỉ có `CHAPTER_END` (NQ-00 §5.3). Thoại NQ-00 §4–5 đã duyệt nguyên văn, đưa vào ở NQ-L1/L2/L3.
- Phần thưởng màn 2 (id khớp seed `012`): `BUFF_NQ_SWIFT` Thần Tốc Hành Quân, `SK_NQ_IRON_STAKE` Cọc Sắt Bạch Đằng (K), `SK_NQ_DECOY_BOAT` Thuyền Nhẹ Khiêu Chiến (L) — cơ chế làm ở NQ-L3.
- Thưởng/thành tựu (NQ-00 mục 8, migration `012`): qua màn lần đầu 300/448/598 vàng + 19 KC; `NQ_CLEAR_1`, `NQ_CLEAR_2`, `NQ_CHAPTER`, `NQ_SPEED` (3 màn < 15 phút) — luật trong `game_service.py` (`CHAPTER_NQ_LEVELS`).
