# REPORT NQ-L1 — Màn 1 "Hành quân ra Bắc" (bố cục thật)

Ngày: 12/11/2026 • **PASS** (người dùng chơi thử ổn 12/11; `test_app.py` chưa chạy trên DB test)
Task card: [SUTA_NQ_TASK_L1_01.md](SUTA_NQ_TASK_L1_01.md) (duyệt 12/11/2026, Q1–Q4 theo đề xuất). Asset: đợt `NQ_ART_01` (Gate A1 + A2 duyệt 11/11/2026; prompt và 2 bản FIX đã xoá, kết quả soát ở dưới).

## Hiện trạng trước khi sửa
- Chương 7 trỏ thẳng asset chương 6 (`images/phung-hung/`), màn 1 khung 6 chunk, cảnh báo lệch `stage_length` (9216 so với 4608). Thẻ chương 7 trang chủ khoá cứng.
- `pytest tests`: 170 passed, 1 skipped (report NQ-ENGINE).

## Quyết định (người dùng chốt)
- Gate A1 `NQ_ART_01` (11/11): quân Kiều Công Tiễn **màu A tím than**; `NPC_NGO_QUYEN` đạt (giống ảnh thư viện `ngo_quyen.png`); thêm `#493953`, `#635274` vào bảng sprite. `row` nam/nữ vẽ 3 lần (FIX_A1, FIX_ROW chèo 30 px logic); lính giáo vẽ lại nhận diện (FIX_A1). Gate A2 duyệt 11/11.
- Task card (12/11): Q1 Kiều Công Tiễn `plungeOnly` (chém ngang bị gạt, chỉ đòn bổ + lao), hp 8; Q2 ụ thành chỉ để vẽ, cung thủ hạ bằng lao; Q3 khe 2–4 bắt buộc thuyền; Q4 chỉ xáo nhóm ở chunk 4, 7.

## File đã sửa / tạo
| File | Việc |
|---|---|
| `frontend/static/assets/images/ngo-quyen/{sprites,maps}-32bit/**` (mới) | Chép từ nguồn Codex: `manifest_nq.json` (16 asset, 37 strip), `maps_nq.json` (3 nền, ụ thành, cổng đóng/mở) |
| `images/shared/sprites-32bit/manifest_shared.json` + 2 strip | Thêm mục `row` của `PLAYER_MALE`/`PLAYER_FEMALE` (+18 dòng, không đổi mục khác) |
| `assets/{sprites,maps}-32bit/ngo-quyen/manifest_nq.json`, `maps_nq.json` (nguồn, ngoài git) | `status` NORMALIZED → IN_GAME |
| `js/levels/ngo-quyen/config.js` | Viết lại: asset riêng, `TILES.water`, 12 chunk 3 vùng, `RIVERS`, `LEVEL1`, lính/Kiều Công Tiễn/cung thủ/cá sấu/đá lăn/thuyền, `CARRY.javelin`, `PLUNGE`, `FINISH_GATE`, `NPC_SPRITES.ngoQuyen`, câu `TEXT` mới; màn 2–3 khung đổi sang nền/lính chương 7 |
| `js/levels/ngo-quyen/level1.js` | Bố cục màn 1, nhóm xáo, `dropCarry`, `returnBoats`, câu hướng dẫn, nghỉ chân, thoại Kiều Công Tiễn |
| `js/levels/ngo-quyen/render-extras.js` (mới) | Vẽ ụ thành (ảnh map) ở lớp `beforeNpcs` |
| `js/levels/ngo-quyen/{chapter,dialogue-data}.js` | `guide` Ngô Quyền, cổng, `carry`, `plunge`, `stateFields`, `hooks`; `STORY_NQ_INTRO`, `STORY_NQ_KCT` |
| `templates/components/home/{timeline,chapter}.html` | Thẻ chương 7 `data-unlock-after="6"` + `data-route` (+ `data-hero` ở dòng thời gian) |
| `.claude/rules/{ngo-quyen-gameplay,assets-32bit}.md`, `docs/SUTA_NQ_TASK_00.md`, `docs/SUTA_NQ_TASK_L1_01.md` | Tài liệu |

Không sửa `js/engine/` và file chương 1–6.

### Khác task card (phát hiện khi đo, đã sửa trong task)
1. **Khe 1 256 → 176 px.** Đo nhảy + lướt chỉ đi ~195 px (từ mép 390 đáp ở 585), khe 256 px không qua được nếu không đi thuyền — trái ý "khe 1 không bắt buộc".
2. **Thuyền kẹt giữa sông.** Rơi xuống khe 2 giữa dòng thì người về bờ trái mà thuyền nằm giữa sông (cách mép 259 px, quá tầm nhảy) → kẹt màn. Thêm `returnBoats` (chương, không phải engine): người đứng trên bờ trái một khe thì thuyền trống của khe đó về chỗ đậu `homeX`.
3. **Nhảy khỏi thuyền đang chạy thì rơi.** Người trên không không giữ vận tốc thuyền (engine). Sách giữa sông lấy được khi thuyền đứng yên → thêm câu nhắc chunk 2 "Thôi chèo cho thuyền đứng yên rồi hãy nhảy."
4. **Xoáy nước: không lái men mép được** — thuyền chỉ đi ngang, lõi xoáy luôn cuốn. Đổi thành **2 thuyền 2 bên xoáy**: chèo thuyền A tới gần rồi nhảy sang thuyền B. Bán kính xoáy 64 → **48** (64 thì cú nhảy chỉ chạm mép boong cuối), thuyền B đậu ở +56. Câu nhắc đổi theo.
5. **Thuyền bị nước che.** Ảnh nước vẽ từ `GROUND_Y` xuống, boong ở `GROUND_Y + 2` nên cả thân thuyền khuất (NQ-ENGINE chỉ thử bằng hộp tạm). `TILES.waterLift` −2: mặt nước thấp hơn mép bờ 8 px, thân thuyền hiện trên nước; xoáy + cá sấu hạ theo (`WATER_SURFACE`).
6. **Ụ thành là ảnh map**, hazard chỉ vẽ sprite → vẽ bằng `hooks.draw.beforeNpcs` (chương), không va chạm.
7. **Cung thủ hạ được cả bằng nhảy chém** (máu 1; đo: 2 lần nhảy chém thì trúng). Giữ: tránh kẹt khi ném trượt hết lao (lao chỉ có từ 2 lính chunk 9, sống 12 s). Lao vẫn là cách chính (câu nhắc).
8. **Lao bay thẳng** (người dùng chơi thử 12/11: bỏ vòng cung). `CARRY.javelin` `gravity` 0, `range` 320, `flightTime` .55 (không sửa engine): lao đi đường thẳng từ tay xuống đất cách 320 px. Ném từ đất thì lao ngang tầm thân lính nên **không trúng cung thủ trên ụ** — phải nhảy lên rồi ném; câu nhắc chunk 10 đổi thành "Cung thủ trên ụ thành! Nhảy lên rồi ném lao để hạ."

## Kết quả test
Đo bằng `update(1/60)` trên trình duyệt thật (`?debug=1`), vẽ lại bằng `draw()` để chụp.

| # | Test | Kết quả |
|---|---|---|
| L1 | Màn / asset | PASS — 4 khe nước đúng toạ độ (384/176, 928/448, 1632/576, 3296/320), 3 vùng đúng chunk; console chỉ 401 của khách; không còn cảnh báo `stage_length`; 0 request tới `images/phung-hung/` (54 request `ngo-quyen`); 19 sprite + 5 nền nạp, không hộp tạm |
| L2 | Nhóm xáo | PASS — 10 lần dựng: luôn 3 lính + 1 vùng gió ở chunk 4/7, 4 ô khác nhau, không lính nào trong/sát khe nước |
| L3 | Ngô Quyền | PASS — đứng chunk 1, 2 câu khớp NQ-00 §5.1 từng chữ (script so `dialogue-data.js` với task card + chữ hiện trên khung), chân dung hiện |
| L4 | Thuyền | PASS — lên thuyền đi thẳng từ bờ; `row` khi thuyền chạy, `idle` khi dừng; thuyền `move`/`idle`; dừng đúng mép phải (576 = 640 − 64); khe 1 nhảy + lướt qua (đáp 641, không mất máu); khe 2 không qua được bằng nhảy + lướt; sách giữa sông lấy được khi thuyền dừng (vx 3,9), đáp lại boong sau 40 frame; rơi giữa khe 2 → −1 máu, về 882, thuyền về 930, lên lại được |
| L5 | Xoáy | PASS — chèo thuyền B vào lõi: bị cuốn sau 37 frame, −1 máu, câu "Thuyền bị xoáy nước cuốn!", thuyền về `homeX`; nhảy thường từ A (tâm người 1846) sang B đáp 1963 (boong 1950–2002); nhảy + lướt thì vượt quá, rơi −1 |
| L6 | Cá sấu | PASS (một phần) — báo bọt (`warn`) rồi ngoi đớp người trên thuyền −1 máu; **chưa đo hạ cá sấu** ở chương này (cơ chế chương 4, đã kiểm ở TQP) |
| L7 | Gió / đá lăn | PASS — trong vùng gió lúc active bị đẩy 30 px / 0,25 s (120 px/s), trong vùng nấp 0 px; 2 đá lăn kích hoạt khi tới gần, nhảy qua cả 2 không mất máu; **chưa đo đá trúng người** |
| L8 | Lính / lao / cung thủ | PASS — hạ lính giáo rơi lao, nhặt hiện "Đã nhặt lao. Bấm Đánh để ném."; cung thủ đứng mặt ụ (chân 192 = 248 − 56); cung thủ 2 hạ → hiện sách. **Sau khi đổi lao bay thẳng:** quỹ đạo ném từ đất 31 → 2 px trên đất sau 310 px (thẳng, dốc ~5°); trúng lính giáo cách 117 px (máu 2 → 1); ném từ đất vào cung thủ: trượt (đúng thiết kế); nhảy lên, ném ở đỉnh (tay cao 110 px) cách 90 và 140 px: trúng, cung thủ chết; ném từ đất trúng Kiều Công Tiễn cách 150 px (8 → 7). Tính theo đường thẳng: nhảy ném trúng cung thủ khi đứng cách ~60–155 px |
| L9 | Kiều Công Tiễn | PASS — thoại 1 câu khớp NQ-00, chân dung; 8 lần chém ngang: máu 8 → 8, câu `plungeHint`; đòn bổ: 6 lần bấm, 4 lần trúng thì hạ, rơi sách 5; còn sống thì "Hãy hạ Kiều Công Tiễn trước." (đủ 5 sách vẫn giữ ở x 9059); thiếu sách "Bạn còn thiếu 4 Quyển Sách Tinh Hoa."; hạ + đủ sách → cổng mở, bảng "Hoàn thành Màn 1", nút Sang Màn 2 |
| L10 | Câu hỏi / nghỉ / trang chủ | PASS — 4 câu ở chunk 2, 4, 7, 10 (x 1458, 2704, 5328, 7632); trang chủ khách: thẻ dòng thời gian + thẻ chọn tướng chương 7 khoá, đặt `suta.cleared.6` thì cả 2 mở ("▶ Bắt đầu chơi", route `/gameplay/levels/ngo-quyen`); **nghỉ chân chưa đo riêng** |
| L11 | Hồi quy | PASS (khói) — 900 frame không lỗi: chương 7 màn 1, `?layout=engine`, màn 2/3 (`?debug=1`), `?viewer=1`; chương 1 (+`?layout=p2`), `?layout=engine` chương 2–6, chương 6 màn 1 + màn 3 `?layout=skills`. Chương 1 có 3 cảnh báo sprite chưa nạp (`PJ_OIL_JAR`, `FX_OIL_FIRE`, `PJ_ARROW_RAIN`) — có từ trước, task không đụng chương 1. Nam: chơi gần đủ màn bằng mô phỏng (dịch người qua từng đoạn); nữ: chỉ đoạn Kiều Công Tiễn + về đích |
| L12 | Chơi tay | PASS — người dùng chơi thử 12/11: lần 1 yêu cầu lao bay thẳng (đã sửa, mục 8); lần 2 báo "đã ổn". 3 điểm Gate A2 (mép xoáy, cung thủ bắn ngang, tường nền thấp) không bị nêu |
| L13 | pytest / giao diện | PASS — `pytest tests`: 170 passed, 1 skipped; 812×375: canvas 523×221, câu nhắc + HUD trong canvas |

## Vấn đề asset
- Gate A1/A2 PASS (soát `/asset-review` 3 lượt). Ghi chú còn mở: xoáy nước mép bầu dục cứng (trong game đọc được là xoáy), cung thủ bắn ngang (code tự ngắm), nền Đại La tường thấp + nửa phải trống.
- Thuyền chỉ lộ một dải mảnh trên mặt nước (boong ở `GROUND_Y + 2`, mặt nước + 8). Đọc được là thuyền nhưng nhỏ — xem lại khi chơi tay.

## TODO
- Số `DESIGN_BASELINE` chỉnh thêm nếu cần sau khi chơi nhiều lượt (khe sông, xoáy 48/70, gió 120, đá lăn −150, Kiều Công Tiễn hp 8, lao tầm 160).
- Gợi ý engine (không làm ở task này): người nhảy khỏi thuyền nên giữ vận tốc thuyền; thuyền trống tự về bến khi người rơi (đang làm ở chương bằng `returnBoats`).
- `test_app.py` cần `SUTA_TEST_DATABASE_URL`.
- Tiếp: `NQ_ART_02` + NQ-L2.
