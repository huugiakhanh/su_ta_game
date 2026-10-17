---
paths:
  - "frontend/static/js/levels/ba-trieu/**"
  - "frontend/templates/gameplay/levels/ba-trieu.html"
  - "tools/make_question_data.py"
---

# Màn chơi chương Bà Triệu (chương 2)

Kế hoạch + quyết định đã chốt: [docs/SUTA_BT_TASK_00.md](../../docs/SUTA_BT_TASK_00.md). Lộ trình: BT-ENGINE A (xong) → **BT-SKELETON (khung, xong)** → BT-ENGINE B → BT-L1/L2/L3. Cấu trúc theo mẫu chương Trưng Trắc (rule `trung-trac-gameplay.md`); cơ chế chung ở engine (rule `engine.md`).

## Trạng thái: KHUNG (BT-SKELETON) + asset riêng BT_ART_01 (nhập 17/10/2026)

- Chương `id: 2`, `key: 'bt'` (sessionStorage `suta.bt.progress`), level 201–203 (migration `005_ba_trieu.sql`), URL `/gameplay/levels/ba-trieu[/2|/3]` (`render_chapter_level("ba-trieu", …)` trong `pages.py`). Thẻ trên trang chủ **còn khoá** — vào bằng URL.
- **Asset**: `images/ba-trieu/sprites-32bit/manifest_bt.json` (12 ID: lính đốn gỗ, thợ săn, kỵ binh, quan thu thuế, voi rừng, đá lăn, chông tre, chướng khí, tên nỏ, hòm bạc, Bà Triệu NPC + chân dung) và `maps-32bit/maps_bt.json` (nền núi Nưa xa + 4 lớp giữa, 2 cành cây bục, Quyển Sách Tinh Hoa, cổng trại). Nguồn Codex: `assets/{sprites,maps}-32bit/ba-trieu/`, soát ở `docs/CODEX_PROMPT_BT_ART_01.md` mục 8–12. Status vẫn `NORMALIZED` — lên `IN_GAME` sau khi người dùng chơi thử.
- **Asset mượn chương 1** (`BORROWED_MAPS` → engine `borrowedMaps`): trời ngày, tile mặt đất + địa hình, lớp giữa làng (vùng đầu màn 1), bia câu hỏi, 2 vật cản. Không chép ảnh.
- Hitbox/thông số trong `config.js` đo từ strip (ghi trong comment): lính đốn gỗ 22×32, rìu ô hit 7 tầm 14 px ngoài mép, sát thương 2, nghỉ 1,8 s; voi 84×52, `ride` top 3 / inset 12; đá 18×18; chướng khí 40×44; cành ngắn/dài rộng 60/120 (`BRANCH`, = `visible_bbox.w`). Thợ săn, kỵ binh, quan thu thuế, tên nỏ, hòm bạc, NPC Bà Triệu **khai báo sẵn, chưa đặt vào màn** (BT-L1).
- **Không import file nào của `js/levels/trung-trac/`** — hai chương độc lập; cần bảng nào thì khai báo lại trong `config.js` chương này.
- Màn 1 (6 chunk, vùng làng → rừng nứa → rừng thiêng → sườn đá → doanh trại): bố cục cố định, 3 lính đốn gỗ, chông tre, đá lăn, 2 vật cản, 5 Quyển Sách Tinh Hoa, 4 câu hỏi (rút từ `LEVEL1_QUESTION_POOL`), cổng trại ở đích (`FINISH_GATE`). Màn 2 (4 chunk): chưa NPC — 3 câu hỏi chặn đường lần lượt từ pool `quocDat`, `hoLy`, `bachTuong` (makeQuiz với `npc = null`, vì `CHAPTER.dialogues` chưa có NPC). Màn 3: đấu trường, 3 đợt lính (`WAVES`), hết quân → `endGame(true)` (`updateLevel3`). Chưa có kỹ năng, boss, NPC dẫn màn, cutscene.
- Âm thanh: tạm phát 3 bản nhạc `audio/trung-trac/` (`TODO_MISSING` nhạc riêng).
- Layout thử `?layout=engine` (màn 1, `ENGINE_TEST` trong `config.js`): bậc bục, bục trên hố, cành cây trên 3 miệng chướng khí lệch nhịp, voi rừng (`wildElephant`, `ride`), đá lăn (`boulder`, hp 2). Cành cây dùng `PROP_BT_BRANCH(_LONG)`. `maps_bt.json` ghi `stage_length` 9216 (màn 1 dự kiến 12 chunk) nên màn khung 6 chunk có cảnh báo "maps_bt.json: stage khác" — vô hại, hết khi BT-L1 kéo dài màn.

## Nội dung lịch sử

- `questions-data.js` **sinh bằng** `python tools/make_question_data.py ba-trieu` từ `assets/question/ba-trieu-question.json` (khớp Excel 50/50). Không sửa tay; đổi pool/câu loại thì sửa `CHAPTERS` trong script rồi chạy lại. Câu 15, 33, 37, 41, 45 tạm loại, chờ team.
- `dialogue-data.js`: thoại NPC, cốt truyện, câu kết chương còn **nháp chờ team duyệt** (BT-00 §4–5) → để trống/`TODO_MISSING`. Duyệt xong mới chép nguyên văn (rule `history-content.md`).
- Phần thưởng màn 2 (id khớp seed `005`): `BUFF_BT_CRIT` Chí mạng, `SK_BT_RATTAN_SHIELD` Khiên mây tre (K), `SK_BT_WHITE_ELEPHANT` Gọi Bạch Tượng (L) — cơ chế làm ở BT-L2/L3 (chí mạng qua hook `skills.attackDamage` của engine).
