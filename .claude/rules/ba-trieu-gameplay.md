---
paths:
  - "frontend/static/js/levels/ba-trieu/**"
  - "frontend/templates/gameplay/levels/ba-trieu.html"
  - "tools/make_question_data.py"
---

# Màn chơi chương Bà Triệu (chương 2)

Kế hoạch + quyết định đã chốt: [docs/SUTA_BT_TASK_00.md](../../docs/SUTA_BT_TASK_00.md). Lộ trình: BT-ENGINE A (xong) → **BT-SKELETON (khung, xong)** → BT-ENGINE B → BT-L1/L2/L3. Cấu trúc theo mẫu chương Trưng Trắc (rule `trung-trac-gameplay.md`); cơ chế chung ở engine (rule `engine.md`).

## Trạng thái: màn 1 (BT-L1) + màn 2 (BT-L2) thật, màn 3 khung; asset BT_ART_01 + BT_ART_02

- Chương `id: 2`, `key: 'bt'` (sessionStorage `suta.bt.progress`), level 201–203 (migration `005_ba_trieu.sql`), URL `/gameplay/levels/ba-trieu[/2|/3]` (`render_chapter_level("ba-trieu", …)` trong `pages.py`). Thẻ trên trang chủ **còn khoá** — vào bằng URL.
- **Asset**: `images/ba-trieu/sprites-32bit/manifest_bt.json` (12 ID: lính đốn gỗ, thợ săn, kỵ binh, quan thu thuế, voi rừng, đá lăn, chông tre, chướng khí, tên nỏ, hòm bạc, Bà Triệu NPC + chân dung) và `maps-32bit/maps_bt.json` (nền núi Nưa xa + 4 lớp giữa, 2 cành cây bục, Quyển Sách Tinh Hoa, cổng trại). Nguồn Codex: `assets/{sprites,maps}-32bit/ba-trieu/`, soát ở `docs/CODEX_PROMPT_BT_ART_01.md` mục 8–12. Status `IN_GAME` (người dùng chơi thử màn 1 ổn, 19/10/2026).
- **BT_ART_02** (`docs/CODEX_PROMPT_BT_ART_02.md`, nhập 21/10/2026): Bà Triệu **thiết kế mới** (mũ vàng, áo vàng nghệ, choàng đỏ — theo ảnh người dùng) + lính Ngô (đốn gỗ, thợ săn, kỵ binh) vẽ lại theo **chuẩn cao người 34 ± 1 px logic** (brief 2.2) → `IN_GAME`. **Dùng ở màn 2 (BT-L2, `IN_GAME`)**: 3 NPC, `EN_NGO_SOLDIER`, 2 nền đầm lầy; **chờ BT-L3 (`NORMALIZED`)**: FX, icon, `bow`/`charge` — danh sách: `NPC_TRIEU_QUOC_DAT`, `NPC_HO_LY` (3 người 1 ô 112×48), `NPC_BACH_TUONG` (128×96: idle/talk/bow/charge), 3 chân dung NPC (đã nạp qua `PORTRAITS`), `EN_NGO_SOLDIER` (`attack_01` `frame_w` 128, mũi kích ô 4 +60 px), `FX_BT_RATTAN_SHIELD`, `FX_BT_CRIT`, `ICON_SK_BT_*`, nền `BG_BT_MID_MARSH` + `BG_BT_FAR_PLAIN`. Khai báo `NPC_SPRITES` đã có; đặt vào màn thì thêm ID vào `LEVEL_SPRITES[2|3]`.
- **Asset mượn chương 1** (`BORROWED_MAPS` → engine `borrowedMaps`): trời ngày, tile mặt đất + địa hình, lớp giữa làng (vùng đầu màn 1), bia câu hỏi, 2 vật cản. Không chép ảnh.
- Hitbox/thông số trong `config.js` đo từ strip (ghi trong comment): lính đốn gỗ 24×34 (không `renderScale`), rìu ô hit 7 tầm 14 px ngoài mép, ô đánh cao 0–12 px trên chân, sát thương 2, nghỉ 1,8 s; thợ săn 26×20 (đầu nỏ cao 20, cách tâm 13); kỵ binh 61×37; voi 84×52, `ride` top 3 / inset 12; đá 18×18; chướng khí 40×44; cành ngắn/dài rộng 60/120 (`BRANCH`, = `visible_bbox.w`). Mọi asset BT_ART_01 đã dùng ở màn 1 (BT-L1).
- **Không import file nào của `js/levels/trung-trac/`** — hai chương độc lập; cần bảng nào thì khai báo lại trong `config.js` chương này.
- **Màn 1 (BT-L1, `docs/SUTA_BT_TASK_L1_01.md`)**: 12 chunk = 9216 px (vùng: làng → rừng nứa 2–3 → rừng thiêng 4–5 → sườn đá 6–8 → rừng nứa 9–10 → doanh trại 11–12). Đúng **12 chướng ngại**: 10 nhóm (`OBSTACLE_GROUPS` trong `level1.js`) xáo mỗi lượt vào chunk 1–10 **trong vùng được phép** của nhóm (`chunks`; chunk 1 chỉ nhóm `easy` = hố chông; chướng khí 4–5; voi + 1 đá 6–8; đá thứ 2 5–9 vì bia chunk 10 trùng gò đất) — `placeGroups()` xếp nhóm hẹp vùng trước; + hố chông cố định (`FIXED_PIT`) và **mini-boss tham quan thu thuế** (`MINIBOSS`, patrol 6 đòn, ném hòm bạc) cố định chunk 11. Bà Triệu đứng chờ chunk 1 (`guide`, thoại `STORY_BA_TRIEU_INTRO` đã duyệt). 5 sách cố định (`LEVEL1_ITEMS`), 4 bia chunk 3/5/8/10 (`QUIZ.level1Spots`), nghỉ chân hồi 1 máu chunk 9 (`REST`, `level1Events`). Cổng trại tâm tại `worldX(12, 618)` mở khi đủ sách + hạ mini-boss. Màn 3: đấu trường, 3 đợt lính (`WAVES`), hết quân → `endGame(true)` (`updateLevel3`). Chưa có kỹ năng, boss, cutscene.
- **Màn 2 (BT-L2, `docs/SUTA_BT_TASK_L2_01.md`)**: 9 chunk **cố định** (rừng nứa 1–3 → sườn đá 4–5 → đầm lầy `BG_BT_MID_MARSH` 6–9; đồi xa `BG_BT_FAR_PLAIN` qua `LEVEL.farHills`). Bia câu hỏi chunk 2/5/8 (pool NPC) → Triệu Quốc Đạt (3), cốt truyện `STORY_QUOC_DAT` khi vào chunk 4, họ Lý (6), Bạch Tượng (9) → đích. Quân vây `CAPTORS`: 2 lính Ngô thường (enemy `art: 'soldier'`, `EN_NGO_SOLDIER` 22×34, kích tầm 49 ngoài mép, sát thương 1) cho Quốc Đạt/họ Lý, 2 thợ săn (hazard `captorOf`) cho Bạch Tượng. NPC to khai báo `holdGap` (họ Lý 48, Bạch Tượng 56). 3 phần thưởng lưu tiến trình, cơ chế ở BT-L3. Asset màn 2 `IN_GAME` (người dùng chơi thử OK 28/10/2026).
- Âm thanh: tạm phát 3 bản nhạc `audio/trung-trac/` (`TODO_MISSING` nhạc riêng).
- Layout thử `?layout=engine` (màn 1, `ENGINE_TEST` trong `config.js`): bậc bục, bục trên hố, cành cây trên 3 miệng chướng khí lệch nhịp, voi rừng (`wildElephant`, `ride`), đá lăn (`boulder`, hp 2). Cành cây dùng `PROP_BT_BRANCH(_LONG)`. `maps_bt.json` ghi `stage_length` 9216 = màn 1 (12 chunk).

## Nội dung lịch sử

- `questions-data.js` **sinh bằng** `python tools/make_question_data.py ba-trieu` từ `assets/question/ba-trieu-question.json` (khớp Excel 50/50). Không sửa tay; đổi pool/câu loại thì sửa `CHAPTERS` trong script rồi chạy lại. Câu 15, 33, 37, 41, 45 **loại hẳn** (người dùng chốt 17/10, cả `/quiz`); pool đã duyệt.
- `dialogue-data.js`: thoại NPC, cốt truyện, cutscene, câu kết chương **đã duyệt 17/10** (BT-00 §4–5) — chép **nguyên văn** từ task card (rule `history-content.md`); NPC/cốt truyện màn 2 đưa vào ở BT-L2, cutscene màn 3 ở BT-L3.
- Phần thưởng màn 2 (id khớp seed `005`): `BUFF_BT_CRIT` Chí mạng, `SK_BT_RATTAN_SHIELD` Khiên mây tre (K), `SK_BT_WHITE_ELEPHANT` Gọi Bạch Tượng (L) — cơ chế làm ở BT-L2/L3 (chí mạng qua hook `skills.attackDamage` của engine).
- Thưởng/thành tựu (BT-00 mục 9, migration `006_ba_trieu_rewards.sql`): qua màn lần đầu 120/180/240 vàng + 8 KC; `BT_CLEAR_1`, `BT_CLEAR_2`, `BT_CHAPTER`, `BT_SPEED` (3 màn < 15 phút) — luật trong `backend/services/game_service.py` (`CHAPTER_BT_LEVELS`).
- Nhạc nền: giao Gemini Pro theo `docs/GEMINI_PROMPT_BT_MUSIC.md`; nộp vào `audio/ba-trieu/` rồi đổi `MUSIC_FILES` trong `audio-data.js`.
