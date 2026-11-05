---
paths:
  - "frontend/static/js/levels/trieu-quang-phuc/**"
  - "frontend/templates/gameplay/levels/trieu-quang-phuc.html"
  - "tools/make_question_data.py"
---

# Màn chơi chương Triệu Việt Vương (chương 4)

Kế hoạch + quyết định đã chốt: [docs/SUTA_TQP_TASK_00.md](../../docs/SUTA_TQP_TASK_00.md). Lộ trình: TQP-SKELETON (xong 04/11, [REPORT_TQP-SKELETON.md](../../docs/REPORT_TQP-SKELETON.md)) → TQP-ENGINE (xong 04/11, [REPORT_TQP-ENGINE.md](../../docs/REPORT_TQP-ENGINE.md)) → `TQP_ART_01` (Gate A1 + A2 PASS 04/11) → TQP-L1 (xong 04/11, [REPORT_TQP-L1.md](../../docs/archive/REPORT_TQP-L1.md)) → `TQP_ART_02` → TQP-L2 → `TQP_ART_03` → TQP-L3. Cấu trúc theo mẫu chương Lý Nam Đế (rule `ly-nam-de-gameplay.md`); cơ chế chung ở engine (rule `engine.md`).

## Trạng thái

- Chương `id: 4`, `key: 'tqp'` (sessionStorage `suta.tqp.progress`), level 401–403 (migration `008_trieu_quang_phuc.sql`), URL `/gameplay/levels/trieu-quang-phuc[/2|/3]` (`render_chapter_level("trieu-quang-phuc", …)` trong `pages.py`). Slug khớp mục thư viện `trieu-quang-phuc`. Thẻ trang chủ (dòng thời gian + chọn tướng) `data-unlock-after="3"` — mở khi đã qua chương Lý Nam Đế. URL thì luôn vào được.
- Người chơi là nghĩa sĩ nam/nữ chung; Triệu Quang Phục là NPC dẫn màn 1 (`guide`, `NPC_TQP` + `PORTRAIT_TQP` — tạo hình theo avatar thư viện, thoại `STORY_TQP_INTRO`) và đứng chặn cuối bãi tập (`tqpYard`, `STORY_TQP_YARD`).
- **Asset**: `images/trieu-quang-phuc/{sprites,maps}-32bit/` (`manifest_tqp.json` 17 ID, `maps_tqp.json` 4 nền + 6 prop; đợt `TQP_ART_01` `IN_GAME`). Bảng màu sprite `palette_32_tqp.png` **101 màu** (98 của chương 3 + 3 màu rêu — người dùng duyệt 04/11). Sprite chép từ chương 2–3 (cùng ID): `EN_LUONG_PATROL`, `EN_LUONG_ARCHER`, `EN_LUONG_WAR_BOAT` (+ `signal`/`hurt`/`death` mới), `PJ_FIRE_ARROW`, `PJ_CROSSBOW_BOLT`, `ITEM_LND_HEAL`, `TR_BAMBOO_SPIKE_PIT`. Mượn map qua `BORROWED_MAPS`: chương 1 (trời, tile, bia câu hỏi), chương 2 (sách, đồi xa `BG_BT_FAR_PLAIN`), chương 3 (làng `BG_LND_MID_CHU_DIEN`, sông `BG_LND_MID_RED_RIVER` cho màn 2 khung, mặt nước nâu `PROP_LND_RIVER_WATER`, mỏm đá). Đòn bổ `plunge` (4@16, `frame_w` 80) của `PLAYER_MALE`/`PLAYER_FEMALE` ở `manifest_shared.json`. Nhạc tạm của chương 3.
- **Màn 1 "Tuổi trẻ rèn luyện"** (TQP-L1, `level1.js`, DESIGN_BASELINE): 12 chunk = 9216 px; bãi tập 1–2 → làng Chu Diên 3–4 → bãi lau 5–7 → đầm lầy 8–10 → bờ Dạ Trạch 11–12 (cổng trại `PROP_TQP_REED_GATE` = đích `worldX(12, 618)`).
  - **Khu rèn luyện** (`TRAINING`, cố định): 3 bù nhìn rơm + bù nhìn cầm giáo (hazard `prop` hp 1, `corpse`; bù nhìn giáo `plungeOnly`) là **quân vây** (`captorOf`) của `tqpYard` cuối chunk 2 → vỡ hết mới đi tiếp (`hint: TEXT.yardLocked`); 2 cọc tre `PROP_TQP_BAMBOO_POST` (vật cản `blocking` 16×48 — phải nhảy qua hoặc lên, chơi tay 04/11); 3 câu hướng dẫn phím `TRAINING.tips` (`state.tipIndex`).
  - **11 nhóm xáo** vào 2 ô (`SLOTS` a 260 / b 600, lệch ±60; nhóm địa hình ±48 bội 16) của chunk 3–10 trong vùng được phép: lính tuần ×2, lính giáo dài ×2 (+ cọc tre `blocking` trước mặt), cung thủ trên cây (`archerTree` prop + `treeArcher` cao `TREE.deck` 87, lệch +13), chông ẩn, rắn trong bụi cỏ (rusher `rest: Infinity` + `ambush`/`noBar` → `level1Events` đánh thức khi cách 180; bụi `PROP_TQP_GRASS_TUFT` vẽ `hooks.draw.afterPlayer` — `render-extras.js`), cá sấu (`CROC_RIVER` 1 khe ô a, `floatY` 18 → mắt `warn` ngang mặt nước), thuyền tuần (`BOAT_RIVER` cả chunk, hp 3, `callHelp`, `signalTime` .67), sình (`MUD_ROWS` a/b), khói 2 làn (`SMOKE`). Mỗi chunk tối đa 1 nhóm địa hình. + chông cố định chunk 9 (1 ô trống).
  - **Mini-boss đội trưởng giáo dài** (`MINIBOSS`, chunk 11): enemy `boss: true` art `captain` (`behavior: 'guard'`, `plungeOnly`, hitbox 30×44, tầm đâm 60) — hp 12 = 6 đòn bổ; `id` = `carrier` của sách thứ 5; 2 lính tuần hộ tống.
  - Sách 4 cố định (`LEVEL1_ITEMS`) + 1 từ đội trưởng; 4 bia câu hỏi `QUIZ.level1Spots` (chunk 3/8/10 ở 420 giữa 2 ô, chunk 5 ở 720); nghỉ chân hồi 1 máu chunk 8.
- Màn 2–3 vẫn là **khung TQP-SKELETON (PLACEHOLDER)**: màn 2 4 chunk, 2 lính, 1 chông, 3 bia câu hỏi theo pool `trieuTuc` → `lyNamDe` → `chuDongTu`; màn 3 đấu trường 1 chunk, 3 đợt lính (`WAVES`), hết quân → panel kết chương.
- Chương bật `plunge: { speed: 280, forward: 260 }` (đòn bổ **chéo về trước** — chơi tay 04/11: rơi thẳng quá nhanh) và `stealth: { ambush: 2 }` (đánh úp). `TEXT` có `mudSunk`, `plungeHint`, `npcLocked` (câu kỹ thuật).
- Layout thử `?layout=engine` (màn 1, `ENGINE_TEST`, TQP-ENGINE) — asset thật (trừ NPC hộp `testNpc`): sình chunk 1 (local 160–320) + 1 lính; khói trôi thấp/cao chunk 2; cá sấu `lurker` khe 1 chunk 3; thuyền `hp` 3 + `callHelp` chunk 4; 2 lính giáo dài (`spearman`, `plungeOnly`) + bục chunk 5; vùng ẩn nấp + 2 lính + cung thủ, NPC hộp `testNpc` `requires: 2` + 2 sách treo cao chunk 6; máu tối đa 7 (`bonusHealth`).
- **Không import file nào của chương khác** — bảng nào cần thì khai báo lại trong `config.js` chương này.

## Nội dung lịch sử

- `assets/question/trieu-quang-phuc-question.json` **chuyển từ Excel** sheet "4 Triệu Việt Vương" (A3:H52) bằng script đọc xlsx, đối chiếu 50/50 câu (TQP-SKELETON). `questions-data.js` **sinh bằng** `python tools/make_question_data.py trieu-quang-phuc`; không sửa tay. **Giữ đủ 50 câu**; câu nghi vấn chờ team ở TQP-00 mục 7. `/quiz` dùng cùng JSON (`QUIZ_BANKS['trieu-quang-phuc']`, `excluded: []`).
- `dialogue-data.js`: thông báo đầu màn 1 (`chapter.js`) + thoại Triệu Quang Phục dẫn màn 1 `STORY_TQP_INTRO` — **nguyên văn TQP-00 §5.1–5.2** (duyệt 04/11, TQP-L1 Q1). `STORY_TQP_YARD` "Đã luyện xong, lên đường!" là câu kỹ thuật (Q2). Thoại NPC màn 2, cutscene, kết chương còn chờ team (§4, §5.4–5.5); panel kết chương tạm chỉ báo điểm (`TODO_MISSING`).
- Phần thưởng màn 2 (id khớp seed `008`, tên duyệt 04/11): `BUFF_TQP_VITALITY` Thể lực cường tráng (Triệu Túc), `SK_TQP_RALLY` Hiệu triệu Vạn Xuân (Lý Nam Đế, K), `SK_TQP_DRAGON_CLAW` Móng Rồng (Chử Đồng Tử, L) — cơ chế ở TQP-L3.
- Thưởng/thành tựu (TQP-00 mục 9, migration `008`): qua màn lần đầu 173/259/346 vàng + 12 KC; `TQP_CLEAR_1`, `TQP_CLEAR_2`, `TQP_CHAPTER`, `TQP_SPEED` (3 màn < 15 phút) — luật trong `game_service.py` (`CHAPTER_TQP_LEVELS`).
