---
paths:
  - "frontend/static/js/levels/trieu-quang-phuc/**"
  - "frontend/templates/gameplay/levels/trieu-quang-phuc.html"
  - "tools/make_question_data.py"
---

# Màn chơi chương Triệu Việt Vương (chương 4)

Kế hoạch + quyết định đã chốt: [docs/SUTA_TQP_TASK_00.md](../../docs/SUTA_TQP_TASK_00.md). Lộ trình: TQP-SKELETON (xong 04/11, [REPORT_TQP-SKELETON.md](../../docs/REPORT_TQP-SKELETON.md)) → TQP-ENGINE → `TQP_ART_01` → TQP-L1 → `TQP_ART_02` → TQP-L2 → `TQP_ART_03` → TQP-L3. Cấu trúc theo mẫu chương Lý Nam Đế (rule `ly-nam-de-gameplay.md`); cơ chế chung ở engine (rule `engine.md`).

## Trạng thái

- Chương `id: 4`, `key: 'tqp'` (sessionStorage `suta.tqp.progress`), level 401–403 (migration `008_trieu_quang_phuc.sql`), URL `/gameplay/levels/trieu-quang-phuc[/2|/3]` (`render_chapter_level("trieu-quang-phuc", …)` trong `pages.py`). Slug khớp mục thư viện `trieu-quang-phuc`. Thẻ trang chủ (dòng thời gian + chọn tướng) **còn khoá** — gắn `data-unlock-after="3"` ở TQP-L1. URL thì luôn vào được.
- Người chơi là nghĩa sĩ nam/nữ chung; Triệu Quang Phục sẽ là NPC dẫn màn 1 (TQP-L1).
- **Khung TQP-SKELETON — toàn bộ PLACEHOLDER**: `config.js` trỏ thẳng manifest chương 3 (`images/ly-nam-de/`, sprite `EN_LUONG_PATROL`, `TR_BAMBOO_NET`, `ITEM_LND_HEAL`; map sông `BG_LND_MID_RED_RIVER`, `BG_LND_MID_CHU_DIEN`, nước + mỏm đá) + mượn map chương 1 (trời, làng, tile, bia câu hỏi) và sách chương 2 qua `BORROWED_MAPS`. Cảnh báo console `maps_lnd.json: stage khác` là do mượn manifest, vô hại. Nhạc tạm của chương 3.
  - Màn 1 "Tuổi trẻ rèn luyện": 6 chunk, chunk 3 là sông 2 khe (`RIVER`, mỏm đá giữa khe 2), 3 lính, 1 bẫy lưới, 5 sách cố định, 4 bia câu hỏi, đích cuối màn (không cổng).
  - Màn 2 "Hiền tài Dạ Trạch": 4 chunk, 2 lính, 1 bẫy lưới, 3 bia câu hỏi theo pool `trieuTuc` → `lyNamDe` → `chuDongTu` (chưa có NPC, chưa rải 10 sách).
  - Màn 3 "Đại phá Dương Sàn": đấu trường 1 chunk, 3 đợt lính (`WAVES`), hết quân → panel kết chương. Chưa có boss, kỹ năng.
- **Không import file nào của chương khác** — bảng nào cần thì khai báo lại trong `config.js` chương này.

## Nội dung lịch sử

- `assets/question/trieu-quang-phuc-question.json` **chuyển từ Excel** sheet "4 Triệu Việt Vương" (A3:H52) bằng script đọc xlsx, đối chiếu 50/50 câu (TQP-SKELETON). `questions-data.js` **sinh bằng** `python tools/make_question_data.py trieu-quang-phuc`; không sửa tay. **Giữ đủ 50 câu**; câu nghi vấn chờ team ở TQP-00 mục 7. `/quiz` dùng cùng JSON (`QUIZ_BANKS['trieu-quang-phuc']`, `excluded: []`).
- `dialogue-data.js`: chưa có thoại (TQP-00 §4–5 chờ team duyệt); panel kết chương tạm chỉ báo điểm (`TODO_MISSING`).
- Phần thưởng màn 2 (id khớp seed `008`, tên duyệt 04/11): `BUFF_TQP_VITALITY` Thể lực cường tráng (Triệu Túc), `SK_TQP_RALLY` Hiệu triệu Vạn Xuân (Lý Nam Đế, K), `SK_TQP_DRAGON_CLAW` Móng Rồng (Chử Đồng Tử, L) — cơ chế ở TQP-L3.
- Thưởng/thành tựu (TQP-00 mục 9, migration `008`): qua màn lần đầu 173/259/346 vàng + 12 KC; `TQP_CLEAR_1`, `TQP_CLEAR_2`, `TQP_CHAPTER`, `TQP_SPEED` (3 màn < 15 phút) — luật trong `game_service.py` (`CHAPTER_TQP_LEVELS`).
