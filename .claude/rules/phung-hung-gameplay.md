---
paths:
  - "frontend/static/js/levels/phung-hung/**"
  - "frontend/templates/gameplay/levels/phung-hung.html"
  - "tools/make_question_data.py"
---

# Màn chơi chương Phùng Hưng (chương 6)

Kế hoạch + quyết định đã chốt: [docs/SUTA_PH_TASK_00.md](../../docs/SUTA_PH_TASK_00.md). Lộ trình: PH-SKELETON (xong, [REPORT_PH-SKELETON.md](../../docs/REPORT_PH-SKELETON.md)) → PH-ENGINE (xong, [REPORT_PH-ENGINE.md](../../docs/REPORT_PH-ENGINE.md)) → `PH_ART_01` + PH-L1 (xong code, chờ chơi tay, [task card](../../docs/SUTA_PH_TASK_L1_01.md), [report](../../docs/REPORT_PH-L1.md)) → `PH_ART_02` + PH-L2 (xong code, chờ chơi tay, [task card](../../docs/SUTA_PH_TASK_L2_01.md), [report](../../docs/REPORT_PH-L2.md)) → `PH_ART_03` + PH-L3 (xong, [task card](../../docs/SUTA_PH_TASK_L3_01.md), [report](../../docs/REPORT_PH-L3.md)). Cấu trúc theo mẫu chương Mai Hắc Đế (rule `mai-hac-de-gameplay.md`); cơ chế chung ở engine (rule `engine.md`).

## Trạng thái: cả 3 màn chơi được; nhạc riêng `audio/phung-hung/level1–3.mp3`

- Chương `id: 6`, `key: 'ph'` (sessionStorage `suta.ph.progress`), level 601–603 (migration `011_phung_hung.sql`), URL `/gameplay/levels/phung-hung[/2|/3]` (`render_chapter_level("phung-hung", …)` trong `pages.py`). Slug khớp mục thư viện `phung-hung`. Thẻ trang chủ `data-unlock-after="5"`: mở khi đã qua chương 5; URL thì luôn vào được. Mốc năm hiển thị là **791** ở cả 3 nơi (dòng thời gian, `/history`, thẻ chọn tướng).
- **Asset**: `PH_ART_01` (Gate A1 + A2) và `PH_ART_02` (Gate B1 + B2, chép từ nguồn; `FX_BT_STUN` chép từ chương 2, chỉ có ở bản chạy) và `PH_ART_03` (Gate C1 + C2; `EN_TANG_ARCHER`, `FX_OIL_FIRE`, `FX_TQP_TORCH` chép cùng ID) đã `IN_GAME`. Mượn map chương 1–4 qua `BORROWED_MAPS`. Nhạc nền riêng chương (team nộp 09/11, `MUSIC_FILES` trong `audio-data.js`; kết quả đo ở [archive/GEMINI_PROMPT_PH_MUSIC.md](../../docs/archive/GEMINI_PROMPT_PH_MUSIC.md)). Xe muối 4 bánh là người dùng chốt, khác prompt.
- **Màn 1** (`level1.js`, `config.js` `LEVEL1`, DESIGN_BASELINE): 12 chunk, 3 vùng (Đường Lâm 1–4 → đồi đá ong 5–8 → ải 9–12, cổng `PROP_PH_TAX_GATE` tại `worldX(12, 618)`). Phùng Hưng `guide` đầu màn (`STORY_PH_INTRO`). Bài học cố định: hổ `boss` + 3 bù nhìn chunk 3–4, lính khiên 5, trâu + 3 lính + rào 7, hào 9, xe muối + 2 lính gác 11–12. 7 nhóm xáo vào 2 ô của chunk 2, 6, 8, 10 (`placeGroups`): 3 lính, 2 đá ong (chỉ 6, 8), 2 thợ săn trên cây. 5 sách: chunk 2, 10 + giấu ở hổ, lính khiên, rào chunk 8. Đá ong ẩn tới khi kích hoạt (`updateRocks`, tránh treo giữa trời), `blocking` khi nằm. Lính gác ải `kind: 'gateGuard'`, `boss`: `blockStrike` chặn mọi đòn, chỉ xe húc mới hạ (`onPushHit` bỏ `kind` rồi `strike`).
- **Màn 2** (`level2.js`, `config.js` `LEVEL2_*`, `LEVEL2`, DESIGN_BASELINE): 10 chunk cố định, 3 vùng (Đường Lâm 1–3 → đường tiếp tế 4–6 → ngoại thành Tống Bình 7–10), đích `worldX(10, 672)`, không cổng. 3 NPC id = khoá pool câu hỏi: `phungHai` (chunk 3, 3 sách + 1 vũ khí), `doAnhHan` (chunk 6, 6 + 2), `boPhaCan` (chunk 10, 10 + 3); mỗi NPC 2 lính vây `CAPTORS` + bia `QUIZ.level2Spots`. 10 sách = 7 cố định + 2 lính khiên mang + 1 trong rào; 3 vũ khí = 1 cố định + 2 trong rào. Hào chông chunk 5 hẹp 96 px, nhảy chạy qua được. Chướng ngại dùng bộ dựng xuất từ `level1.js`; không có hổ, trâu, xe muối (PH-L2 Q2).
- **Màn 3 "Vây phủ Tống Bình"** (PH-L3, DESIGN_BASELINE): đấu trường 1 chunk ban đêm. Module: `level3.js` (dựng), `boss.js` (trận, cutscene, `ENEMY_KINDS` `watchPost`/`drum`, HUD), `skills.js`, `render-extras.js`.
  - Lầu cổng và boss không có thân, vẽ theo thế giới ở `beforeNpcs` vì lớp giữa parallax .5. Mốc từ pivot cổng x 384: sàn lầu cao 140, lối đi cao 112, 4 máng ±72, ±120.
  - Trụ cháy và trống GĐ 1 có `alive: false, dying: true`: đuốc (`thrownTarget`) và đòn chém bỏ qua nhưng vẫn vẽ, vẫn chạy `kind.update`. Không đổi điều này: trống `alive` ở GĐ 1 sẽ nuốt đuốc ném gần nó.
  - Thanh sợ `battle.fear` (0–100): trụ +10, trống +6 (×1,5 có `BUFF_PH_POWER`: 10 cú → 7 cú), L +8 ở GĐ 2 qua `battle.pendingFear` (tránh `skills.js` import `boss.js`).
  - Đá rơi tự mô phỏng trong `boss.js` (`battle.rocks`), không dùng hazard `snare` vì `snare` bám người chơi tới lúc rơi. Không chặn đường.
  - Khóa Lương không sửa engine: đổi `enemy.art` sang `arenaSlow`, `projectile.sprite` sang `crossbowBoltSlow`, nhân `fireInterval`. Hỏa Trận: art `arenaPanic` + `passive`.
  - Dải đất phủ tối lúc vẽ (`NIGHT_GROUND`), vì tile đất chung là tile ban ngày.
  - Cutscene: collapse → story1 → gate → march → enter → story2 → panel. Layout thử `?layout=skills` (thêm `?debug=1`): vào GĐ 2.
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
