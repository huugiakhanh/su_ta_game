# REPORT TQP-L2 — Màn 2 "Hiền tài Dạ Trạch" (chương 4)

Ngày: 05/11/2026. Yêu cầu người dùng: lập và làm TQP-L2 theo TQP-00 §3.2 + thoại §4 đã duyệt, dùng asset `TQP_ART_02` vừa vào game ("Duyệt, làm luôn"). Task card: [SUTA_TQP_TASK_L2_01.md](SUTA_TQP_TASK_L2_01.md).

## Hiện trạng / đo trước khi sửa
- Màn 2 là khung TQP-SKELETON: 4 chunk nền phẳng, 2 lính, 1 chông, 3 bia câu hỏi, không NPC, không sách; nền mượn sông chương 3.
- Asset `TQP_ART_02` (17 ID) đã `IN_GAME` (commit beba708) nhưng chưa khai báo trong `config.js`.
- Engine chỉ có lớp vẽ chương `beforeEnemies` (vẽ SAU NPC) → không vẽ được rồng sau lưng NPC; `CHAPTER.tiles` chung cả chương → không đổi được ảnh nước riêng 1 màn.

## Quyết định (người dùng chốt)
- Kế hoạch TQP-L2 duyệt nguyên ("Duyệt, làm luôn" 05/11): 10 chunk cố định, sách 3 / 3 / 4 (mỗi NPC cần đủ toàn bộ sách các đoạn trước), ngày → đêm từ chunk 7, đồi xa trung du, nước xanh rêu riêng màn 2, 2 sửa engine nhỏ.
- §4.2 "Vì sao đúng" **giữ nguyên văn đã duyệt** "(Triệu Việt Vương)"; nghi vấn *Dạ Trạch Vương* để team (TQP-00 mục 7 dòng 5).
- Từ Gate B2: bụi lau giữ màu vàng rơm sáng ở cảnh đêm (đọc rõ chỗ nấp); `FX_TQP_DRAGON_CLAW.hold` chỉ vẽ khi đứng yên (TQP-L3).
- Chơi tay cả màn: **"tôi chơi thử đã ổn"** (05/11).

## File đã sửa / tạo / xoá
| File | Việc |
|---|---|
| `js/engine/render/index.js` | Lớp vẽ chương `hooks.draw.beforeNpcs` (trước `drawNpcs`) |
| `js/engine/chapter.js` | Trường màn `tiles?` ghép đè `CHAPTER.tiles` trong `setLevel()` (bản gốc chương giữ riêng, `setChapter` đặt lại); chú thích hợp đồng |
| `js/levels/trieu-quang-phuc/config.js` | `LEVEL2_*` (10 chunk, 4 vùng, đồi xa, tiles, NPC, CAPTORS, 8 sách + 2 lính mang, bố cục), `REED_COVER`, `DRAGON`, `QUIZ.level2Spots`, `LEVEL_SPRITES[2]`, `PORTRAITS` +3, `NPC_SPRITES` +3 (`holdGap` 16 cho Lý Nam Đế ngồi, Chử Đồng Tử trên mây), mượn `BG_LND_FAR_MIDLANDS`, `MAP_PROPS_IN_GAME` + nước + bụi lau |
| `js/levels/trieu-quang-phuc/level2.js` | Viết lại: địa hình (khe thuyền ch2, khe cá sấu ch8, sình ch9), 3 NPC khoá sách + lính vây, bia câu hỏi, chướng ngại cố định, 2 vùng nấp; `level2Events` (rắn phục, rồng) |
| `js/levels/trieu-quang-phuc/level1.js` | `export` 5 hàm dựng (`makeSoldier/makeSnake/makeSpikePit/makeLedge/makePost`) + tách `wakeAmbushers` để màn 2 dùng lại — hành vi màn 1 không đổi |
| `js/levels/trieu-quang-phuc/dialogue-data.js` | `NPC_DIALOGUES` 3 NPC — nguyên văn TQP-00 §4.1–4.3 |
| `js/levels/trieu-quang-phuc/render-extras.js` | Bụi lau lặp 64 px (`afterPlayer`, mờ .55 khi người chơi ở trong); rồng `beforeNpcs` (`appear` → `idle`, mờ theo NPC) |
| `js/levels/trieu-quang-phuc/chapter.js` | Màn 2: `farHills`, `tiles`, `events`, summary sách 10; `stateFields.dragonTime` |
| `docs/archive/SUTA_TQP_TASK_L2_01.md` (mới) | Task card (chuyển vào archive khi xong) |
| `docs/SUTA_TQP_TASK_00.md` | Lộ trình TQP-L2 trỏ task card |
| `.claude/rules/trieu-quang-phuc-gameplay.md`, `engine.md` | Màn 2, asset ART_02, `beforeNpcs`, `LEVEL.tiles` |

Thay đổi hành vi nhỏ ngoài yêu cầu: **có** — bụi lau vẽ mờ 55% khi người chơi đứng trong (chụp ở cỡ chơi thật: bụi đặc che kín nhân vật, không thấy mình). `name`/`title` hộp thoại tách từ tiêu đề mục §4.x ("Thái phó Triệu Túc" / "cha Triệu Quang Phục"…), không thêm chữ mới.

## Kết quả test
- `pytest tests`: 120 passed, 1 skipped — PASS (`test_app.py` skip vì thiếu `SUTA_TEST_DATABASE_URL`; test DB **chưa chạy**).
- T1 nội dung (mô phỏng `?debug=1`): 10 sách (2 ẩn theo lính), NPC `requires` 3/6/10 tại x 2096/4400/7472, 3 bia, 2 vùng nấp (x 4808, 6544, rộng 192), 3 khe; console không cảnh báo khoảng cách NPC/địa hình — PASS.
- T2 khoá NPC: Triệu Túc 0 sách → giữ ở x 2059 (NPC 2096) 240 frame + "Cần 3 Quyển Sách Tinh Hoa mới gặp được (đang có 0)", không mở hội thoại; 3 sách → mở ngay. Lý Nam Đế 5 → khoá, 6 → mở; Chử Đồng Tử 9 → khoá, 10 → mở — PASS.
- T3 hội thoại: tên/danh xưng/chân dung đúng (`portrait_tqp_trieu_tuc_idle.png`…); trả lời đúng cả 3 → `readProgress().rewards` = `BUFF_TQP_VITALITY`, `SK_TQP_RALLY`, `SK_TQP_DRAGON_CLAW`. 32 chuỗi thoại khớp nguyên văn TQP-00 — PASS.
- T4 ẩn nấp: đứng giữa bụi lau 600 frame, lính đi xuyên (khoảng cách nhỏ nhất 0 px) → máu 5 → 5; đứng ngoài 600 frame → 5 → 0 — PASS.
- T5 rồng: đủ 10 sách + tới gần → `dragonTime` chạy, ảnh chụp thấy rồng sau Chử Đồng Tử, cùng lính vây + người chơi — PASS.
- T6 nước: màn 1 `PROP_LND_RIVER_WATER` / `#56341f`, màn 2 `PROP_TQP_SWAMP_WATER` / `#2c3820` — PASS.
- T7 bot hồi quy 12 màn × 4 chương (iframe, 2400 frame, chạy + nhảy + đánh + bấm qua hội thoại): 0 lỗi JS — PASS.
- T8 chụp ở cỡ chơi thật: Chu Diên (nước xanh rêu trong khe), Khuất Lão (Lý Nam Đế ngồi, cửa hang), Dạ Trạch đêm (bụi lau, lính, rồng) — PASS.
- T9 chơi tay cả màn: người dùng "tôi chơi thử đã ổn" — PASS.

## Vấn đề asset
- Không có.

## Câu hỏi cho team / TODO
- TQP-00 mục 7 dòng 5: §4.2 ghi "(Triệu Việt Vương)" lúc Lý Nam Đế trao binh quyền — khi đó ông xưng *Dạ Trạch Vương*. Team chốt có sửa chữ trong ngoặc không.
- Tên màn "Màn 2: Hiền tài Dạ Trạch" vẫn là nháp TQP-00 §5.1.
- Tác dụng 3 phần thưởng (máu +2, K Hiệu triệu, L Móng Rồng) làm ở TQP-L3; `FX_TQP_DRAGON_CLAW.hold` chỉ vẽ khi đứng yên.
- Tiếp theo: prompt `TQP_ART_03` (Dương Sàn, lính đánh thuê, mỏm đất vỡ, thuyền độc mộc, nền nửa đêm) → TQP-L3.
