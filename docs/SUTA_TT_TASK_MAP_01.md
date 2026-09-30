# SỬ TA — CHƯƠNG TRƯNG TRẮC
# TASK CARD: TÍCH HỢP MÔI TRƯỜNG 8-BIT VÀ SPRITE BATCH R

TASK_ID: TT-MAP-01 • Version 1.0 • 25/09/2026
Thư mục code: `frontend/static/js/levels/trung-trac/`

Tài liệu (READ-ONLY):
- `CLAUDE.md`
- `SUTA_TT_MAP_BRIEF.md`
- `assets/maps/trung-trac/maps_tt.json`, `MAP_INVENTORY_TT.md`, `MAP_REPORT_TT.md`
- `SUTA_TT_SPRITE_BRIEF.md`, `docs/REPORT_TT-INT-01.md`

---

## 0. MỤC TIÊU

Codex đã vẽ xong bộ môi trường pixel 8-bit cho màn Trưng Trắc; team đã duyệt toàn bộ. Task này thay nền, mặt đất, vật cản tĩnh, vật phẩm và cổng đích (hiện là ảnh cũ bị thu nhỏ, `TODO_MAP`) bằng asset mới vẽ **×1, không smoothing**, và ráp 2 sprite đã vẽ lại ở Batch R.

Kết quả cuối:
1. Nền gồm trời, đồi xa, lớp giữa, đổi cảnh theo 5 vùng. Mặt đất lát bằng tileset. Tất cả sắc nét từng pixel.
2. Vật cản tĩnh, sách (bình thư), cổng Luy Lâu dùng asset mới, phần nhìn thấy khớp hitbox.
3. Sáu vật cản P2 được khai báo sẵn trong code, kiểm tra được trong layout thử, nhưng chưa đưa vào màn.
4. `attack_01` của Trưng Trắc và `throw` của lính gác tháp dùng strip mới; bỏ hệ số bù `drawScale: 1.5`.

**Giữ nguyên:**
- Gameplay, vật lý, hitbox hiện có.
- `randomizeObstacles()` và quy tắc 12 chướng ngại vật.
- Điều kiện thắng (hạ boss + đủ 5 sách + qua `finishX`), vị trí và hitbox nhặt của 5 sách.
- HUD, điều khiển.

**Ngoài phạm vi:**
- Boss 3 giai đoạn; cột đá dùng trong trận boss.
- Mưa tên; cờ chiến thắng.
- Đưa P2 vào màn; làm hố trong màn.
- Hiệu ứng thời tiết động, âm thanh.

---

## 1. QUY TẮC

1. Tuân thủ `CLAUDE.md`. Task card mâu thuẫn với code → dừng và báo.
2. Không sửa, không vẽ lại PNG. Được **chép** asset sang `frontend/static/`. Không xoá ảnh cũ, chỉ ngừng tham chiếu.
3. Trong `maps_tt.json` và `manifest_tt.json` chỉ được sửa trường `status`.
4. Asset mới vẽ đúng kích thước gốc (×1). **Không dùng `drawScale` khác 1** cho asset mới. Lệch vị trí thì sửa bằng anchor/offset, không phóng to thu nhỏ.
5. Hằng số mới (vùng, parallax, độ rộng chuyển cảnh, fps…) đặt trong `config.js`; số chưa qua chơi thử ghi comment `DESIGN_BASELINE`.
6. Làm theo **3 phase**, mỗi phase: test → report → **dừng chờ người chơi thử duyệt**.
7. `backdrops/chapter1/map-v2-manifest.json` đã lỗi thời (896×360, `GROUND_Y` 290). Không dùng.

---

## 2. BƯỚC 0 — KẾ HOẠCH (CHỈ ĐỌC)

1. Đọc `render.js` (`drawBackdrops`, vẽ obstacle, sách, landmark), `config.js` (`BACKDROP_LAYERS`, `LANDMARKS`, `OBSTACLE_SPRITE_FILES`, `ITEM_FILES`), `geometry.js` (`makeObstacle`, `groundYAt`), `state.js`, `physics.js` (va chạm obstacle, holes, finish).
2. Đọc `maps_tt.json` và `tileset_tt_ground.json`; liệt kê trường nào code sẽ dùng.
3. Đề xuất nơi chép asset (gợi ý `frontend/static/assets/images/maps-8bit/`, giữ cấu trúc thư mục của `assets/maps/trung-trac/`).
4. Viết `docs/MAP_PLAN_TT.md`: OWNED FILES theo phase, READ-ONLY FILES, bảng ánh xạ asset cũ → mới, các quyết định cần team chốt (mục 3.3.3, 3.3.4), rủi ro.
5. **DỪNG. Chờ duyệt.**

---

## 3. TRIỂN KHAI

### PHASE A — Sprite Batch R (nhỏ, làm trước)

- Chép strip `PLAYER_TRUNG_TRAC` `attack_01` và `EN_HAN_WATCHTOWER` `throw` mới cùng `manifest_tt.json` từ `assets/sprites/` sang `sprites-8bit/`.
- So sánh manifest trước/sau: nếu `frames`, `fps`, `hit_frame`, `frame_w/h` của hai animation này thay đổi, **dừng và báo** (không tự điều chỉnh code theo).
- Xoá `drawScale: 1.5` của `attack` trong `PLAYER_ANIMATIONS` và mọi code bù tạm liên quan.
- Đặt `status` của 2 asset về `IN_GAME`.

**Test A:**
- Trong `?viewer=1` và trong game: thân nhân vật ở `attack_01` cao bằng `idle` (~44 px); lính gác cùng cỡ ở cả 6 ô `throw`.
- Chân đúng baseline, lật trái/phải đúng.
- Thời điểm gây sát thương vẫn 0,12 s sau khi bấm; đạn giáo vẫn ra ở ô 4 (~0,425 s).
- Chơi hết màn 1 lượt, không lỗi console.

### PHASE B — Nền parallax, vùng, mặt đất

**3.1 Lớp nền** (thay `sky`, `foreground`, `ground` cũ; thứ tự vẽ từ xa đến gần):

| Lớp | Asset | Vị trí | Parallax (DESIGN_BASELINE) |
|---|---|---|---|
| Trời | `BG_TT_SKY_DAY` (Z1–Z4), `BG_TT_SKY_STORM` (Z5) | y = 0, phủ 480×270 | 0.05 |
| Đồi xa | `BG_TT_FAR_HILLS` (mọi vùng) | đáy ảnh ở y = 230 | 0.2 |
| Lớp giữa | `BG_TT_MID_VILLAGE` / `_FIELDS` / `_FOREST` / `_RIVER` / `_CITADEL` theo vùng | đáy ảnh ở `GROUND_Y` (y = 88–248) | 0.5 |
| Mặt đất | `TILESET_TT_GROUND` theo vùng | mép trên tile mặt ở `GROUND_Y` | 1.0 |

Yêu cầu:
- Vẽ ×1 ở kích thước gốc; **tắt smoothing cho mọi lớp**, bỏ nhánh bật smoothing dành cho ảnh cũ.
- Lặp ngang theo chiều rộng gốc của ảnh. Offset = `cameraX × parallax` modulo chiều rộng ảnh, **làm tròn về pixel nguyên** để không rung hình.
- Parallax cũ là 0.22 / 0.58 / 1.0; hệ số mới làm trời trôi chậm hơn nhiều. Ghi cảm nhận trong report để team chỉnh.

**3.2 Vùng**

| Vùng | Chunk | World X |
|---|---|---|
| Z1 làng Mê Linh | 1–3 | 0 – 2304 |
| Z2 đồng lúa | 4–5 | 2304 – 3840 |
| Z3 rừng sâu | 6–8 | 3840 – 6144 |
| Z4 bến sông Hát | 9–10 | 6144 – 7680 |
| Z5 ngoài thành Luy Lâu | 11–12 | 7680 – 9216 |

- Kiểm tra lại `worldX(chunk, localX)` đánh chunk từ 1 trước khi dùng các mốc trên.
- Bảng vùng đặt trong `config.js`.
- **Lớp giữa và trời:** hoà (crossfade) theo vị trí camera, trong khoảng chuyển cảnh `ZONE_BLEND_WIDTH` = 192 px (DESIGN_BASELINE) quanh mỗi ranh giới. Khi hoà, vẽ cả hai ảnh với `globalAlpha`. Trời chỉ đổi ở ranh giới Z4 → Z5.
- **Mặt đất** đổi tile theo world X của từng cột tile, cắt dứt khoát tại ranh giới vùng.

**3.3 Lát tileset**
- Đọc vai trò tile (`surface` / `fill` / `edge` / `decor`) và vùng từ `tileset_tt_ground.json`; không viết cứng toạ độ tile trong code.
- Hàng mặt: tile `surface` 16×16 đặt top = `GROUND_Y`. Hàng lấp: tile `fill` từ y = 264, bị cắt ở y = 270.
- Chọn biến thể **tất định theo chỉ số cột tile** (hash đơn giản), không random mỗi frame, không đổi khi chơi lại.
- Tile `decor` 16×8 đặt trên mép cỏ (đáy decor = `GROUND_Y`), mật độ thưa (khoảng 1/4 số cột, DESIGN_BASELINE), tất định. Vẽ **sau lớp giữa, trước obstacle/nhân vật**. Không va chạm.
- Nếu `state.holes` có phần tử: không vẽ tile trong hố; vẽ tile `edge` trái/phải ở hai mép hố.
- Chỉ vẽ các cột tile nằm trong viewport.

**Test B:**
- Chạy hết màn hai chiều: không thấy đường nối ở bất kỳ lớp nào; không rung pixel khi di chuyển chậm.
- Bật F2: vạch `GROUND_Y` trùng mép cỏ tile trên suốt màn.
- Qua 4 ranh giới vùng: cảnh hoà mượt, không nhấp nháy; trời đổi sang giông trước khi vào chunk 11.
- Chơi lại 2 lần: biến thể tile và decor giữ nguyên.
- Màn hình 1280×720 và điện thoại ngang/dọc: nền sắc nét, không mờ.
- Hồi quy: chơi hết màn 3 lượt, không lỗi console, hiệu năng không tụt rõ rệt.

### PHASE C — Vật cản, bình thư, cổng, P2

**3.3.1 Vật cản đang dùng** (canvas mới trùng cỡ vẽ cũ tính theo 1.65):

| Type | Asset | Canvas | Phần nhìn thấy trong canvas | Neo |
|---|---|---|---|---|
| `fallenBranch` | `OBS_FALLEN_BRANCH` | 91×38 | (18,11) 55×23 | đáy canvas ở `GROUND_Y + 4` |
| `stoneBlock` | `OBS_STONE_BLOCK` | 84×38 | (16,11) 51×23 | đáy canvas ở `GROUND_Y + 4` |
| `reedCurtain` | `OBS_REED_CURTAIN` | 125×53 | (24,3) 76×20 | phần nhìn thấy trùng hitbox y 202–222 → top canvas ở y = 199 |

- Tách "cỡ hitbox" khỏi "cách vẽ": asset mới vẽ ×1 theo kích thước PNG, căn sao cho **phần nhìn thấy trùng hitbox**.
- Kiểm bằng F2, lệch tối đa 1 px. Không sửa hitbox.

**3.3.2 Bình thư**
- `books` vẽ `ITEM_BINH_THU` (strip 4 ô 16×16) ×1, tâm tại `(book.x, book.y + bob)`, lặp ở **6 fps** (DESIGN_BASELINE; manifest để `null`).
- Bob làm tròn về pixel nguyên.
- Giữ hitbox nhặt 22×26 và 5 vị trí hiện có. Hitbox lớn hơn hình là chấp nhận được (dễ nhặt); ghi vào report.

**3.3.3 Cổng Luy Lâu** (thay `finish-gate.png` trong `LANDMARKS`)
- `PROP_LUYLAU_GATE` 192×176, pivot bottom-center, đáy ở `GROUND_Y` (không chìm).
- Khi điều kiện thắng **về nội dung** đã đủ (boss đã hạ và đủ 5/5 sách), đổi sang `PROP_LUYLAU_GATE_OPEN`, trước khi người chơi chạm `finishX`, để báo hiệu "cổng đã mở".
- **Quyết định cần team chốt ở Bước 0:** tâm cổng đặt ở `finishX` (9066, xoá độ lệch 24 px cũ; mép phải cổng tới 9162 < 9216) hay giữ 9090. Đề xuất: đặt ở `finishX`.
- Cổng không có hitbox; trigger về đích giữ nguyên.

**3.3.4 Sáu vật cản P2** (khai báo, không đưa vào màn)

| Type | Asset | Hitbox | Flags | Neo |
|---|---|---|---|---|
| `fenceLow` | `OBS_FENCE_LOW` | 40×18 | thường | đáy ở `GROUND_Y`, sink 0 |
| `fenceHigh` | `OBS_FENCE_HIGH` | 16×48 | thường | đáy ở `GROUND_Y`, sink 0 |
| `bambooSlope` | `OBS_BAMBOO_SLOPE` | 56×30 | thường (hộp chữ nhật, không dốc) | đáy ở `GROUND_Y`, sink 0 |
| `slideBar` | `OBS_SLIDE_BAR` | 40×20, y = `GROUND_Y` − 46 | overhead, requiresDash | top canvas ở `GROUND_Y` − 66; hitbox là nửa dưới canvas |
| `bridge` | `OBS_BRIDGE` | 96×8 | thường, `requiresHole` | **top** ở `GROUND_Y` |
| `logDrift` | `OBS_LOG_DRIFT` | 56×14 | thường, không di chuyển | đáy ở `GROUND_Y`, sink 0 |

- Tất cả DESIGN_BASELINE.
- Hỗ trợ sink theo từng loại (`groundSink`, mặc định 4 cho 3 loại cũ, 0 cho P2).
- `bridge` chỉ được tạo khi có hố tương ứng; thiếu hố thì cảnh báo và bỏ qua.
- **Quyết định cần team chốt ở Bước 0:** kiểm tra `bridge` đặt ngang mặt đất có gây mất máu khi đi vào cạnh không. Nếu có, đề xuất cách xử lý (ví dụ cầu chỉ va chạm từ trên xuống) trong kế hoạch, **không tự sửa luật va chạm chung**.
- **Layout thử** `?layout=p2` (chỉ dùng để test, không ảnh hưởng màn thường): nền phẳng, đặt lần lượt 6 vật cản P2, một hố rộng 96 px có `bridge` bắc qua. Không có hazard/enemy.

**3.3.5 Cột đá**
`PROP_STONE_PILLAR` (2 trạng thái): chỉ chép asset và hiển thị trong viewer; không đặt vào màn (thuộc task boss).

**Test C:**
- F2: phần nhìn thấy của mọi vật cản trùng hitbox (lệch ≤ 1 px); khe dưới lau sậy và `slideBar` đúng 26 px.
- Đứng lên khối đá / cành cây vẫn như cũ; dash qua lau sậy không mất máu, đi bộ vào mất 1 máu.
- Bình thư lặp đều, bob không rung; nhặt đủ 5 vẫn thắng được.
- Cổng: đóng khi chưa đủ điều kiện, người chơi bị giữ trước cổng như cũ; đủ điều kiện thì mở; qua cổng thì thắng.
- `?layout=p2`: nhảy qua, đứng lên được `fenceLow`/`fenceHigh`/`bambooSlope`/`logDrift`; dash qua `slideBar`; đi qua cầu không rơi và không mất máu (hoặc ghi rõ hành vi thực tế nếu đang chờ quyết định).
- Hồi quy: chơi hết màn 3 lượt, không lỗi console.

---

## 4. GATE MỖI PHASE

1. Liệt kê file đã sửa + mục đích.
2. Chạy test của phase, ghi PASS/FAIL.
3. Không sửa ngoài OWNED FILES đã duyệt; không đổi ID/animation; không sửa PNG.
4. Có FAIL → `BLOCKED` + lý do.
5. PASS → **dừng chờ người chơi thử duyệt**.
6. Sau Phase C:
   - Đặt `status` = `IN_GAME` trong `maps_tt.json` cho các asset đang vẽ trong màn thường. P2 và cột đá giữ nguyên.
   - Cập nhật `CLAUDE.md`: mục Map, Chướng ngại vật tĩnh, Vật phẩm, Tài liệu asset. Xoá mô tả lỗi thời (nền ảnh cũ thu nhỏ, smoothing cho lớp nền, `drawScale 1.65`, `finish-gate.png`, `TODO_MAP`, bù `attack_01`).
   - Ghi chú `map-v2-manifest.json` là lỗi thời.

---

## 5. BÁO CÁO `docs/REPORT_TT-MAP-01.md`

```
## Phase <A|B|C> — <ngày>
### File đã sửa (file | mục đích)
### Hằng số mới (tên | giá trị | DESIGN_BASELINE?)
### Kết quả test (test | PASS/FAIL | ghi chú)
### Khác biệt cảm giác/hình ảnh so với bản trước
### Vấn đề asset (asset | mô tả | NORMALIZE/NEED_REDRAW)
### Câu hỏi cho team
```
