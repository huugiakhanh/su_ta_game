---
paths:
  - "frontend/static/js/levels/phung-hung/**"
  - "frontend/templates/gameplay/levels/phung-hung.html"
  - "tools/make_question_data.py"
---

# Màn chơi chương Phùng Hưng (chương 6)

Kế hoạch + quyết định đã chốt: [docs/SUTA_PH_TASK_00.md](../../docs/SUTA_PH_TASK_00.md). Lộ trình: PH-SKELETON (xong, [REPORT_PH-SKELETON.md](../../docs/REPORT_PH-SKELETON.md)) → PH-ENGINE (xong, [REPORT_PH-ENGINE.md](../../docs/REPORT_PH-ENGINE.md)) → `PH_ART_01` + PH-L1 (xong code, chờ chơi tay, [task card](../../docs/SUTA_PH_TASK_L1_01.md), [report](../../docs/REPORT_PH-L1.md)) → `PH_ART_02` + PH-L2 → `PH_ART_03` + PH-L3. Cấu trúc theo mẫu chương Mai Hắc Đế (rule `mai-hac-de-gameplay.md`); cơ chế chung ở engine (rule `engine.md`).

## Trạng thái: màn 1 thật, màn 2–3 còn khung PLACEHOLDER

- Chương `id: 6`, `key: 'ph'` (sessionStorage `suta.ph.progress`), level 601–603 (migration `011_phung_hung.sql`), URL `/gameplay/levels/phung-hung[/2|/3]` (`render_chapter_level("phung-hung", …)` trong `pages.py`). Slug khớp mục thư viện `phung-hung`. Thẻ trang chủ `data-unlock-after="5"`: mở khi đã qua chương 5; URL thì luôn vào được. Mốc năm hiển thị là **791** ở cả 3 nơi (dòng thời gian, `/history`, thẻ chọn tướng).
- **Asset**: `PH_ART_01` (Gate A1 + A2) đã `IN_GAME`. Màn 2–3 khung dùng nền chương 5 qua `BORROWED_MAPS` (cùng map chương 1–3), nhạc tạm `audio/mai-hac-de/`. Xe muối 4 bánh là người dùng chốt, khác prompt.
- **Màn 1** (`level1.js`, `config.js` `LEVEL1`, DESIGN_BASELINE): 12 chunk, 3 vùng (Đường Lâm 1–4 → đồi đá ong 5–8 → ải 9–12, cổng `PROP_PH_TAX_GATE` tại `worldX(12, 618)`). Phùng Hưng `guide` đầu màn (`STORY_PH_INTRO`). Bài học cố định: hổ `boss` + 3 bù nhìn chunk 3–4, lính khiên 5, trâu + 3 lính + rào 7, hào 9, xe muối + 2 lính gác 11–12. 7 nhóm xáo vào 2 ô của chunk 2, 6, 8, 10 (`placeGroups`): 3 lính, 2 đá ong (chỉ 6, 8), 2 thợ săn trên cây. 5 sách: chunk 2, 10 + giấu ở hổ, lính khiên, rào chunk 8. Đá ong ẩn tới khi kích hoạt (`updateRocks`, tránh treo giữa trời), `blocking` khi nằm. Lính gác ải `kind: 'gateGuard'`, `boss`: `blockStrike` chặn mọi đòn, chỉ xe húc mới hạ (`onPushHit` bỏ `kind` rồi `strike`).
- **Màn 2–3 khung**: màn 2 4 chunk (2 lính, 3 bia theo pool `phungHai` → `doAnhHan` → `boPhaCan`); màn 3 đấu trường, 3 đợt lính rồi panel kết chương. Chưa có NPC, kỹ năng, boss.
- Chương bật `charge: {}` (đòn gồng) ở mọi màn. Layout thử `?layout=engine` (màn 1, `ENGINE_TEST`, PH-ENGINE): bao cát + lính khiên chunk 1; hổ + 2 bù nhìn chunk 2; trâu (mượn `EN_TANG_CAVALRY`) + 3 lính + rào chunk 3; xe đẩy (mượn `OB_TRIBUTE_CART`) + 2 lính + khe hố chunk 4; hào chông 160 px chunk 5; NPC hộp khoá 1 sách + 1 vũ khí chunk 6. Bù nhìn, chông, vũ khí vẽ hộp dự phòng tới `PH_ART_01`/`02`. Nhảy chạy xa 115 px, nhảy + lướt 198 px (đo PH-ENGINE) nên hào phải rộng trong khoảng đó.
- Người chơi là nghĩa sĩ nam/nữ chung; Phùng Hưng sẽ là NPC dẫn màn 1 + nhân vật cutscene màn 3.
- **Không import file nào của chương khác** — bảng nào cần thì khai báo lại trong `config.js` chương này.

## Thiết kế đã chốt (chi tiết ở PH-00)

- Đòn gồng (giữ J ~0,7 s rồi thả) là cơ chế trung tâm: phá lính khiên, thu phục trâu, hạ hổ khi hổ khựng vì vồ trúng bù nhìn. Không dùng `plunge` cho chương này.
- Boss Cao Chính Bình không có máu: thanh Nỗi sợ hãi; ném đuốc vào 4 trụ gác, rồi đấm luân phiên 2 trống đồng. Không làm đấm đúng nhịp, không làm đốt kho lương.
- NPC màn 2 cần cả sách lẫn Vũ Khí Thô Sơ: 3 + 1 / 6 + 2 / 10 + 3.

## Nội dung lịch sử

- `assets/question/phung-hung-question.json`: 17 câu giữ nguyên Excel, 13 câu sửa, 20 câu thay theo [docs/RESEARCH_PH_QUESTIONS.md](../../docs/RESEARCH_PH_QUESTIONS.md) §4–6. `questions-data.js` **sinh bằng** `python tools/make_question_data.py phung-hung`; không sửa tay. `/quiz` dùng cùng JSON (`QUIZ_BANKS['phung-hung']`, `excluded: []`).
- Hiệu Bố Cái Đại Vương do Phùng An tôn **sau khi ông mất** (Toàn thư, *Việt điện u linh*): cutscene không để cảnh suy tôn, panel kết chương mới nhắc. Trang thư viện đang viết khác, chờ team.
- Bồ Phá Cần chỉ có tư liệu về việc lập Phùng An; kế đốt lửa đánh trống không có nguồn nên thoại ghi "tương truyền". Đáp án NPC Đỗ Anh Hàn xoay quanh việc vây phủ đô hộ (Cương mục), không khẳng định cắt lương.
- Cao Chính Bình "lo sợ phát bệnh", không viết "trúng phong" (không có nguồn).
- Phần thưởng màn 2 (id khớp seed `011`): `BUFF_PH_POWER` Sức Địch Ngàn Người, `SK_PH_SUPPLY_CUT` Khóa Lương (K), `SK_PH_FIRE_DRUM` Hỏa Trận Trống Đồng (L) — cơ chế làm ở PH-L3.
- Thưởng/thành tựu (PH-00 mục 8, migration `011`): qua màn lần đầu 250/373/498 vàng + 16 KC; `PH_CLEAR_1`, `PH_CLEAR_2`, `PH_CHAPTER`, `PH_SPEED` (3 màn < 15 phút) — luật trong `game_service.py` (`CHAPTER_PH_LEVELS`).
