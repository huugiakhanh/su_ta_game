---
paths:
  - "frontend/static/js/levels/mai-hac-de/**"
  - "frontend/templates/gameplay/levels/mai-hac-de.html"
  - "tools/make_question_data.py"
---

# Màn chơi chương Mai Hắc Đế (chương 5)

Kế hoạch + quyết định đã chốt: [docs/SUTA_MHD_TASK_00.md](../../docs/SUTA_MHD_TASK_00.md). Lộ trình: MHD-SKELETON (xong, [REPORT_MHD-SKELETON.md](../../docs/REPORT_MHD-SKELETON.md)) → MHD-ENGINE (xong, [REPORT_MHD-ENGINE.md](../../docs/REPORT_MHD-ENGINE.md)) → `MHD_ART_01` → MHD-L1 → `MHD_ART_02` → MHD-L2 → `MHD_ART_03` → MHD-L3. Cấu trúc theo mẫu chương Triệu Việt Vương (rule `trieu-quang-phuc-gameplay.md`); cơ chế chung ở engine (rule `engine.md`).

## Trạng thái: khung PLACEHOLDER, 3 màn chạy bằng asset mượn

- Chương `id: 5`, `key: 'mhd'` (sessionStorage `suta.mhd.progress`), level 501–503 (migration `009_mai_hac_de.sql`; `010_mai_hac_de_rename.sql` đổi tên màn 1), URL `/gameplay/levels/mai-hac-de[/2|/3]` (`render_chapter_level("mai-hac-de", …)` trong `pages.py`). Slug khớp mục thư viện `mai-hac-de`. Thẻ trang chủ (dòng thời gian + chọn tướng) **còn khoá**, gắn `data-unlock-after="4"` ở MHD-L1. URL thì luôn vào được.
- **Asset tạm**: `SPRITE_ROOT`/`MAP_ROOT` trỏ thẳng `images/trieu-quang-phuc/` (`manifest_tqp.json`, `maps_tqp.json`); chưa có `images/mai-hac-de/` (Codex tạo ở `MHD_ART_01`). Mượn map qua `BORROWED_MAPS`: chương 1 (trời, tile, làng, bia câu hỏi), chương 2 (sách), chương 3 (nền Chu Diên, đồi xa). Nhạc tạm `audio/trieu-quang-phuc/`. Console cảnh báo `maps_tqp.json: stage khác` là do mượn manifest, vô hại.
- **Màn tối giản** (`level1–3.js`, DESIGN_BASELINE): màn 1 6 chunk phẳng, 3 lính, 1 hố chông, 5 sách, 4 câu; màn 2 4 chunk, 2 lính, 1 hố chông, 3 câu theo pool `maThi` → `thucBao` → `suGia`; màn 3 đấu trường 1 chunk, 3 đợt lính, hết quân thì `endGame(true)`.
- Chưa có trong màn thật: NPC, thoại, cutscene, kỹ năng, boss, đoạn gánh cống phẩm, thả dân phu.
- Layout thử `?layout=engine` (màn 1, `ENGINE_TEST`, móc `ENGINE_TEST_HOOKS`/`ENGINE_TEST_KINDS` trong `level1.js`): gánh nặng + mốc đập sọt chunk 1, 2 xe `blocking` `frees` chunk 2, khe hố + hổ `pounce` chunk 3, quan ném hòm rỗng `lob` + `landAs` chunk 4, 2 lính rơi hũ dầu + bao cát chunk 5. Hộp dự phòng tới `MHD_ART_01`. Khi làm MHD-L1/L3 thì thay `hooks`/`enemyKinds` của `chapter.js` bằng móc thật, giữ móc layout thử.
- **`rescued`**: số dân phu cứu được ở màn 1 (0–5), trường tiến trình + cột `chapter_progress.rescued`. Engine đã đếm (`frees`) và ghi lúc qua màn 1; MHD-L1 đặt xe có `frees`, MHD-L3 đọc `readProgress().rescued` (xe bị chặn 3/4/5 s).
- Người chơi là nghĩa sĩ nam/nữ chung; Mai Thúc Loan là NPC dẫn màn 1 + nhân vật cutscene màn 3 (làm ở MHD-L1/L3).
- **Không import file nào của chương khác** — bảng nào cần thì khai báo lại trong `config.js` chương này.

## Nội dung lịch sử

- `assets/question/mai-hac-de-question.json`: **50 câu Claude soạn theo yêu cầu người dùng** thay bộ Excel nhiều nghi vấn; nguồn từng câu ở [docs/RESEARCH_MHD_QUESTIONS.md](../../docs/RESEARCH_MHD_QUESTIONS.md). Pool: màn 1 câu 1–35, `maThi` 36–40, `thucBao` 41–45, `suGia` 46–50. Đổi câu thì giữ nguyên tắc: có nguồn, sách lệch nhau thì nêu "theo sách nào", truyền thuyết ghi "tương truyền". `questions-data.js` **sinh bằng** `python tools/make_question_data.py mai-hac-de`; không sửa tay. Team tự sửa JSON; sửa xong phải chạy lại script trên thì màn chơi mới đổi (`/quiz` đọc JSON trực tiếp). `/quiz` dùng cùng JSON (`QUIZ_BANKS['mai-hac-de']`, `excluded: []`).
- `dialogue-data.js`: thoại NPC, cutscene, dòng kết chương (MHD-00 §4–5) **còn chờ team duyệt**, chưa đưa vào. Duyệt xong chép nguyên văn.
- Mốc năm hiển thị là **713** ở cả dòng thời gian, thẻ chọn tướng, `/history` (theo sách giáo khoa: bùng nổ 713, thất bại 722). Không gọi "gánh vải": chuyện cống vải chưa có bằng chứng tin cậy, game dùng **gánh cống phẩm**. Cutscene màn 3 là cờ Hắc Đế trên thành Tống Bình, không xưng đế tại đó. NPC Thúc Bảo chờ team cho biết nguồn trước MHD-L2 (`docs/RESEARCH_MHD_QUESTIONS.md` mục 2). "Bom lửa" trong Excel đổi thành **hũ dầu lửa** vì thế kỷ 8 chưa có thuốc súng.
- Phần thưởng màn 2 (id khớp seed `009`): `BUFF_MHD_POWER` Ý chí dân nghèo (Mẹ), `SK_MHD_VAN_AN_SHELL` Vỏ Bọc Vạn An (Thúc Bảo, K), `SK_MHD_REINFORCE` Viện Binh (Sứ giả, L) — cơ chế ở MHD-L3.
- Thưởng/thành tựu (MHD-00 mục 9, migration `009`): qua màn lần đầu 208/311/415 vàng + 14 KC; `MHD_CLEAR_1`, `MHD_CLEAR_2`, `MHD_CHAPTER`, `MHD_SPEED` (3 màn < 15 phút) — luật trong `game_service.py` (`CHAPTER_MHD_LEVELS`).
