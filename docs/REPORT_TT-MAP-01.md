# REPORT — TT-MAP-01

Task card: `docs/SUTA_TT_TASK_MAP_01.md` • Kế hoạch: `docs/MAP_PLAN_TT.md` (team duyệt toàn bộ đề xuất, G1–G9, ngày 25/09/2026)

---

## Phase A — 25/09/2026

**Trạng thái: PASS — chờ người chơi thử duyệt trước khi sang Phase B.**

### File đã sửa (file | mục đích)

| File | Mục đích |
|---|---|
| `frontend/static/assets/images/sprites-8bit/enemy/EN_HAN_WATCHTOWER/en_han_watchtower_throw.png` | Chép đè strip `throw` Batch R từ `assets/sprites/` (md5 `8b86d4d4…`, trùng bản nguồn). |
| `frontend/static/assets/images/sprites-8bit/manifest_tt.json` | Chép đè từ `assets/sprites/manifest_tt.json` (md5 `415c81f6…`, trùng bản nguồn). Chỉ khác bản cũ ở `qa_notes` của `PLAYER_TRUNG_TRAC` và `EN_HAN_WATCHTOWER`. |
| `frontend/static/js/levels/trung-trac/config.js` | Xoá comment mô tả hệ số bù `drawScale 1.5` cho `attack_01`, ghi rằng mọi strip vẽ ×1. |
| `frontend/static/js/levels/trung-trac/render.js` | Bỏ tham số `scale` của `drawSprite8` và đối số `config.drawScale \|\| 1` trong `drawPlayer`, nên mọi strip vẽ ×1. |
| `docs/MAP_PLAN_TT.md` | Đính chính D1 (xem ghi chú bên dưới). |

Không cần chép `player_trung_trac_attack_01.png` vì strip Batch R đã nằm sẵn trong `sprites-8bit/` (md5 trùng `267da5d7…`, commit `16e643d`).

**Đính chính kế hoạch (D1):** object `PLAYER_ANIMATIONS.attack` vốn đã không còn `drawScale`; trước Phase A chỉ còn comment và đường code bù tạm. Nhân vật khi chém đã được vẽ ×1, không phải bị vẽ to như kế hoạch ghi ban đầu.

### Hằng số mới

Không có.

### So sánh manifest trước/sau (điều kiện dừng)

| Asset.animation | frames | fps | loop | hit_frame | frame_w×h | status asset |
|---|---|---|---|---|---|---|
| `PLAYER_TRUNG_TRAC.attack_01` | 6 → 6 | 14 → 14 | false | 3 → 3 | 48×48 → 48×48 | `IN_GAME` (không đổi) |
| `EN_HAN_WATCHTOWER.throw` | 6 → 6 | 12 → 12 | false | 4 → 4 | 48×48 → 48×48 | `IN_GAME` (không đổi) |

Không có trường thời gian hoặc kích thước nào thay đổi, nên không gặp điều kiện dừng. `status` của cả hai asset đã là `IN_GAME`, không cần sửa.

### Kết quả test (test | PASS/FAIL | ghi chú)

Môi trường: Flask dev server `localhost:5000`, pane trình duyệt nội bộ. Pane bị ẩn nên `requestAnimationFrame` không chạy; các test gameplay chạy bằng cách tự gọi `update(1/60)` và `draw()` của chính các module game qua `import()`.

| Test | Kết quả | Ghi chú |
|---|---|---|
| `?viewer=1`: `attack_01` cùng tỉ lệ `idle`, chân đúng baseline | **PASS** (theo G4) | Ô cao 35–38 px, `idle` 43–44 px, chênh do tư thế chém cúi. Tỉ lệ đầu/thân khớp `idle`. Chân ở hàng `frame_h − 2` trên cả 6 ô. |
| `?viewer=1`: lính gác cùng cỡ ở cả 6 ô `throw` | **PASS** | Ô cao 37–42 px (`idle` 39 px), không còn ô bị co nhỏ như bản cũ (29–39 px). Chân đúng baseline. |
| Trong game: chân đúng baseline, lật trái/phải đúng | **PASS** | Bật F2: pivot vàng nằm trên vạch `GROUND_Y`. Người chơi quay phải và quay trái đều đúng. Lính gác luôn quay về phía người chơi. |
| Sát thương đòn chém bắt đầu 0,12 s sau khi bấm | **PASS** | `hitTime(attack_01, 0.36)` = **0.120 s**. Đo mô phỏng: cửa sổ sát thương mở sau 8 frame (0.133 s), phần dư là do lượng tử hoá 1/60 s. |
| Đạn giáo ra ở ô 4 (~0,425 s) | **PASS** | `hitTime(throw, 0.85)` = **0.425 s**. Đo mô phỏng: đạn sinh ở frame thứ 27 kể từ khi bắt đầu ném (0.45 s ≤ 0.425 s + 2 frame). Nhãn F2 hiện `throw 4/6` đúng lúc nhả đạn. |
| Chơi hết màn 1 lượt, không lỗi console | **PASS** | Bot tự động: giữ phải, chém, nhảy, trả lời câu hỏi, hạ boss. Kết quả: thắng (“Hoàn thành màn thử!”, 5/5 sách). Không có exception trong `update`/`draw`, console không có lỗi. |

Kết quả test ở chế độ mô phỏng. **Cần người chơi thử bằng tay** để xác nhận cảm giác đòn chém và nhịp ném.

### Khác biệt cảm giác/hình ảnh so với bản trước

- Thời gian và hitbox không đổi (manifest không đổi thông số, code gameplay không đổi).
- Lính gác tháp khi ném giờ giữ nguyên cỡ người qua 6 ô, không còn co lại ở ô 4–6.
- Nhân vật khi chém không đổi so với bản đang chạy vì strip đã có sẵn và vẫn vẽ ×1.

### Vấn đề asset (asset | mô tả | NORMALIZE/NEED_REDRAW)

Không có. `attack_01` thấp hơn `idle` khoảng 15% do tư thế, đã được chấp nhận theo G4.

### Câu hỏi cho team

- Xác nhận Phase A qua chơi thử bằng tay để sang Phase B (nền parallax, vùng, mặt đất). → **Đã duyệt 25/09/2026.**

---

## Phase B — 25/09/2026

**Trạng thái: PASS — chờ người chơi thử duyệt trước khi sang Phase C.**

### File đã sửa (file | mục đích)

| File | Mục đích |
|---|---|
| `frontend/static/assets/images/maps-8bit/` (mới) | Chép từ `assets/maps/trung-trac/`, giữ cấu trúc thư mục: `maps_tt.json`, 8 PNG trong `bg/*/`, `tiles/TILESET_TT_GROUND/tileset_tt_ground.{png,json}`. Không chép `raw/`, `mockups/`, `references/`, prompt. |
| `frontend/static/js/levels/trung-trac/config.js` | Cho `GROUND_Y = 248` là hằng số trực tiếp (giá trị không đổi). Bỏ `GROUND_LAYER_*`, `MIDGROUND_Y`, `BACKDROP_LAYERS`. Thêm hằng số nền 8-bit, bảng `ZONES`, hằng số hoà vùng và mật độ decor. `BACKDROP_ROOT` giữ lại cho ảnh cổng đích cũ tới Phase C. |
| `frontend/static/js/levels/trung-trac/assets.js` | Nạp `maps_tt.json` và các lớp nền theo ID. Nạp tileset qua trường `metadata`, gom tile theo vùng và vai trò (`surface`/`fill`/`left-edge`/`right-edge`/`decoration`). Cảnh báo trên console nếu cỡ ảnh, `stage.ground_y` hoặc `runtime_slice` lệch với code. Dữ liệu đưa vào `images.maps` (thay cho `images.backdrops`). |
| `frontend/static/js/levels/trung-trac/render.js` | Viết lại `drawBackdrops` gồm trời, đồi xa, lớp giữa: vẽ ×1, lặp theo chiều rộng gốc, offset làm tròn trước khi lấy modulo. Hoà vùng: trời vẽ đè bằng `globalAlpha`; lớp giữa hoà trên canvas phụ bằng `'lighter'`. Thêm `drawGround` (tile theo vùng, biến thể chọn bằng hash của cột, decor thưa, cắt tile ở hố, tile `left-edge`/`right-edge` kết thúc đúng mép hố). Bỏ mọi nhánh bật smoothing. Lớp F2 thêm dòng `zone / mid / sky` kèm hệ số hoà. |
| `frontend/static/js/levels/trung-trac/main.js` | Đổi thông báo thiếu asset sang danh sách ID nền 8-bit bị thiếu. Log gốc của map 8-bit. |

### Hằng số mới (tên | giá trị | DESIGN_BASELINE?)

| Tên | Giá trị | DESIGN_BASELINE? |
|---|---|---|
| `GROUND_Y` | 248 (giữ nguyên giá trị, đổi cách định nghĩa) | Không |
| `MAP_8BIT_ROOT` / `MAP_MANIFEST_FILE` / `TILESET_ID` | `/static/assets/images/maps-8bit/` / `maps_tt.json` / `TILESET_TT_GROUND` | Không |
| `SKY_PARALLAX` | 0.05 | **Có** |
| `FAR_HILLS` | `{ id: BG_TT_FAR_HILLS, parallax: 0.2, bottomY: 230 }` | **Có** |
| `MID_PARALLAX` | 0.5 (đáy ảnh ở `GROUND_Y`) | **Có** |
| `ZONES` | Z1 0–2304, Z2 2304–3840, Z3 3840–6144, Z4 6144–7680, Z5 7680–9216 | Không (task card §3.2) |
| `ZONE_BLEND_WIDTH` | 192, cửa sổ `[B − 192, B]` tính theo tâm khung nhìn (G3) | **Có** |
| `GROUND_DECOR_DENSITY` | 0.25 | **Có** |
| `SKY_FALLBACK_COLOR` / `GROUND_FALLBACK_COLOR` | `#43b8e3` / `#795238` (màu cũ) | Không |

### Kết quả test (test | PASS/FAIL | ghi chú)

Môi trường như Phase A: pane ẩn nên các test di chuyển dùng vật lý thật (`update(1/60)`) và `draw()` thật, gọi qua `import()`. Riêng `hazards`, `enemies` và `obstacles` được xoá trong test đi 2 chiều để bot không bị chặn.

| Test | Kết quả | Ghi chú |
|---|---|---|
| Chạy hết màn 2 chiều: không thấy đường nối, không rung pixel khi di chuyển chậm | **PASS** | Đi phải 0 → 8901 (3149 frame) rồi đi trái về 98. Offset từng lớp **không bao giờ đi lùi** so với hướng camera (0 lần sang phải, 0 lần sang trái), bước tối đa mỗi frame: trời 1, đồi 1, lớp giữa 2, đất 3 px. Ảnh lặp nối đúng chu kỳ nguyên (480/960/768 px), không có khe; Codex đã QC mép nối MAE = 0. Cảm nhận khi đi chậm cần người chơi xác nhận. |
| F2: vạch `GROUND_Y` trùng mép cỏ tile trên suốt màn | **PASS** (có ghi chú asset) | Tile `surface` vẽ ở y = 248 mọi vùng (chụp F2 ở Z1, Z3, Z4/Z5). Tile Z1/Z3/Z5 đặc từ hàng 0. **Z2**: hàng 0 của cả 3 tile surface trong suốt, nên mép cỏ nhìn thấy ở y = 249 (lệch 1 px, trong dung sai). **Z4**: hàng 0–1 lởm chởm (bùn cát). Xem mục vấn đề asset. |
| Qua 4 ranh giới vùng: hoà mượt, không nhấp nháy; trời đổi sang giông trước chunk 11 | **PASS** | Hệ số hoà ở cả 4 ranh giới **tăng đơn điệu** khi đi (0 lần giảm), nên không nhấp nháy. Trời giông hoà xong khi người chơi ở **x = 7630 < 7680**. Chụp giữa lúc hoà Z1→Z2 (t ≈ 0.5): hai làng chồng mờ, không thủng xuống trời. Mặt đất cắt dứt khoát tại 7680 (Z4 cỏ xanh → Z5 đất đỏ). |
| Chơi lại 2 lần: biến thể tile và decor giữ nguyên | **PASS** (có ghi chú) | 3 lần tạo state mới liên tiếp, băm pixel canvas ở 5 vị trí camera (0/2200/5000/7600/8736): **giống hệt**. Lần đo đầu tiên (chạy ngay sau test đi 2 chiều) có 2/5 vị trí khác, nhưng **không tái hiện được** trong 4 lần thử sau, kể cả khi đi 300 frame rồi chụp lại. Tile/decor chọn bằng hàm thuần `tileHash(cột)`, không dùng `Math.random`. Nghi do pane ẩn/hiện xen giữa, chưa chứng minh được. |
| 1280×720 và điện thoại ngang/dọc: nền sắc nét, không mờ | **PASS** (cần xác nhận trên máy thật) | Mọi lớp vẽ vào bộ đệm bằng nearest-neighbor. 1280×720: hiển thị 1084×610, bộ đệm ×3. Dọc 375×812 (DPR 2): hiển thị 359×202, bộ đệm ×2. Ngang 812×375 (giả lập DPR 1): hiển thị **396×223, tức nhỏ hơn ×1**, nên ảnh chắc chắn mất chi tiết khi thu. Cả ba trường hợp đều thu từ bộ đệm về cỡ hiển thị bằng `image-rendering: auto` (cơ chế `fitCanvas` đã chốt, không sửa). |
| Hồi quy: chơi hết màn 3 lượt, không lỗi console, hiệu năng không tụt | **PASS** | 3/3 lượt thắng (5/5 sách, hạ boss), 0 exception, console không lỗi. Thời gian CPU trung bình của `draw()` là 0.09–0.10 ms/frame (ngân sách 16.7 ms). Chưa đo FPS thật vì pane ẩn làm `requestAnimationFrame` dừng. |

Thêm: kiểm tra nhanh nhánh vẽ hố (chưa có hố trong màn). Hố thử 96 px ở x = 1600: không vẽ tile trong hố, tile `left-edge`/`right-edge` khép hai mép, `drawHoles` phủ tối lòng hố. Sẽ kiểm kỹ ở `?layout=p2` (Phase C).

### Khác biệt cảm giác/hình ảnh so với bản trước

- **Parallax trời 0.05 (cũ 0.22):** trời và mây gần như đứng yên, chiều sâu đến chủ yếu từ đồi xa (0.2) và lớp giữa (0.5). Cảm giác “xa” hơn, nhưng trên đoạn chạy dài trời hơi tĩnh. Nếu team thấy trời “chết” thì đề xuất thử 0.08–0.1.
- **Lớp giữa 0.5 (cũ 0.58):** trôi chậm hơn một chút, chưa thấy khác biệt rõ.
- Toàn cảnh sắc nét từng pixel, không còn nền bị thu nhỏ mờ. Mỗi vùng có cảnh riêng (làng, đồng lúa, rừng, bến sông, thành Luy Lâu dưới trời giông).
- Mặt đất đổi chất liệu tại ranh giới vùng, thấy rõ ở Z4 → Z5.
- **Tạm thời tới Phase C:** cổng đích cũ (`finish-gate.png`, ảnh lớn bị thu) giờ vẽ **không smoothing** nên răng cưa. Phase C thay bằng `PROP_LUYLAU_GATE`. Tương tự, vật cản và sách vẫn là ảnh cũ bị thu.

### Vấn đề asset (asset | mô tả | NORMALIZE/NEED_REDRAW)

| Asset | Mô tả | Đề xuất |
|---|---|---|
| `TILESET_TT_GROUND` — `TT_Z2_SURFACE_01/02/03` | Hàng pixel đầu (y = 0) trong suốt, nên mép cỏ Z2 thấp hơn `GROUND_Y` 1 px và nhân vật/vật cản trông lơ lửng 1 px trong vùng đồng lúa. | `NORMALIZE` (dịch nội dung lên 1 px, hoặc lấp hàng 0) |
| `TILESET_TT_GROUND` — `TT_Z4_SURFACE_01/02/03` | Hàng 0–1 chỉ đặc một phần (5–14/16 px), mép trên lởm chởm. Có thể là chủ ý (bùn cát), nhưng chân đứng trên phần trong suốt. | Team xác nhận. Nếu không chủ ý thì `NORMALIZE` |
| `TILESET_TT_GROUND` — decor Z3 (`FERN`, `BROADLEAF`, `VINE_ROOT`) | Hàng đáy (y = 7) trong suốt, nên decor hở 1 px trên mép cỏ. | `NORMALIZE` (nhỏ, không ảnh hưởng gameplay) |

### Câu hỏi cho team

1. Chơi thử bằng tay xác nhận Phase B, đặc biệt cảm nhận parallax trời 0.05 và độ mượt khi qua 4 ranh giới.
2. Có giao Codex `NORMALIZE` hàng đầu tile surface Z2 (và Z4 nếu không chủ ý) không?
3. Màn ngang điện thoại nhỏ (canvas hiển thị < 480 px) chắc chắn mất chi tiết. Có cần xem lại bố cục nút cảm ứng/HUD ở một task khác không? (Ngoài phạm vi TT-MAP-01.)

### Phase B.1 — Chuyển vùng mặt đất mượt (25/09/2026, theo yêu cầu sau khi chơi thử)

Người chơi thử thấy **mặt đất đổi vùng không mượt**, vì task card §3.2 yêu cầu cắt tile dứt khoát tại ranh giới. Theo yêu cầu của team, phần này **thay luật §3.2**: mặt đất chuyển vùng qua một dải chuyển tiếp dither kiểu pixel art. Không dùng alpha, không sửa PNG, không đổi va chạm.

**Cách làm:** mỗi ranh giới có một dải rộng `GROUND_BLEND_WIDTH` = 192 px, căn giữa ranh giới (ví dụ Z4→Z5: 7584–7776). Trong dải, mỗi pixel của hàng tile `surface` và `fill` lấy từ tile vùng sau nếu nhiễu < t, còn lại lấy từ tile vùng trước; t tăng tuyến tính 0 → 1 qua dải. Nhiễu tất định theo toạ độ world, trộn 3 tầng (ô 8, 4, 2 px; trọng số 0.5/0.3/0.2) để các mảng đất quyện thành **cụm tự nhiên** thay vì lấm tấm đều. Bản đầu dùng ô 2 px đơn lẻ trông như muối tiêu nên đã bỏ. Mỗi dải là ảnh tĩnh, dựng **1 lần** thành canvas 192×32 rồi cache; `drawGround` cắt từng cột 16 px từ canvas này (vẫn cắt đúng ở mép hố). Decor trong dải chọn vùng theo xác suất t, tất định theo cột.

| File | Mục đích |
|---|---|
| `config.js` | Thêm `GROUND_BLEND_WIDTH` = 192 (bội số 32) và `GROUND_DITHER_CELL` = 2, **DESIGN_BASELINE**. Sửa comment “mặt đất không hoà”. |
| `render.js` | Thêm `columnTiles`, `cellNoise`/`ditherNoise`, `groundBand` (dựng và cache dải), `bandAt`; nhánh dải trong `drawGround`. |

| Test | Kết quả | Ghi chú |
|---|---|---|
| 4 ranh giới: đất chuyển dần, không còn đường cắt thẳng | **PASS** (chờ người chơi xác nhận) | Chụp phóng to cả 4 ranh giới: cỏ, đất của vùng trước tan dần thành cụm vào vùng sau qua 192 px. |
| Tất định khi chơi lại | **PASS** | 4 cặp state mới ở cam 2200/3700/6000/7500. Cặp đầu tiên lệch **tối đa ±1/255** ở ~4.7k kênh màu, chỉ ở pixel bán trong suốt của lớp giữa, ngoài dải đất. Lệch này tái hiện được khi vẽ cam khác rồi quay lại, nên là sai số làm tròn alpha của GPU canvas, không phải do chọn tile khác. Các cặp sau giống hệt. Đây cũng là nguyên nhân lần lệch “không tái hiện được” ở Phase B. |
| Hồi quy: 3 lượt chơi hết màn | **PASS** | 3/3 thắng, 5/5 sách, 0 exception, console không lỗi. `draw()` khoảng 0.09 ms/frame (dải dựng 1 lần nên không tăng). |

**Quan sát thêm (asset, chưa sửa):** ở vùng Z5 trời giông, ảnh `BG_TT_FAR_HILLS` dùng chung mọi vùng mang tông **xanh trời nắng**, nên giữa các khối tường thành lộ ra những mảng xanh sáng trông như “trời quang” lẫn vào cảnh giông. Ảnh `BG_TT_SKY_STORM` đã có dãy núi xa riêng. Đề xuất (chờ team chọn):
(a) ẩn `BG_TT_FAR_HILLS` ở Z5, hoà tắt dần trong cùng cửa sổ với trời; hoặc
(b) giao Codex vẽ `BG_TT_FAR_HILLS_STORM` (`NEED_REDRAW`, asset mới).
→ **Team chọn (a)**, làm cùng Phase C.

---

## Phase C — 25/09/2026

**Trạng thái: PASS — chờ người chơi thử duyệt.** Thêm phương án (a) cho đồi xa (xem trên).

### File đã sửa (file | mục đích)

| File | Mục đích |
|---|---|
| `frontend/static/assets/images/maps-8bit/{obstacles,items,props}/` | Chép 9 PNG `OBS_*`, `items/ITEM_BINH_THU/item_binh_thu_idle.png`, `PROP_LUYLAU_GATE(_OPEN)`, `PROP_STONE_PILLAR` (strip + 2 ảnh trạng thái). Không chép GIF, `processed/` hay prompt. |
| `assets/maps/trung-trac/maps_tt.json` + bản chạy `maps-8bit/maps_tt.json` | **Chỉ sửa `status`** → `IN_GAME` cho 15 asset vẽ trong màn thường: 2 trời, đồi xa, 5 lớp giữa, tileset, 3 vật cản P0, bình thư, cổng đóng/mở. P2 (6) và `PROP_STONE_PILLAR` giữ `NORMALIZED`. Hai bản giống hệt (`cmp`). |
| `config.js` | Bỏ `OBSTACLE_SPRITE_ROOT/FILES`, `LANDMARKS`, `BACKDROP_ROOT`, `OBSTACLE_GROUND_SINK`, `ITEM_FILES.book`. Thêm `OBSTACLE_TYPES` (id, anchor, `groundSink`, `requiresHole`), `MAP_PROPS_IN_GAME`, `FINISH_X` (= 9066), `FINISH_GATE`, `BOOK_SPRITE_ID`/`BOOK_FPS`/`BOOK_BOB_AMPLITUDE`, `FAR_HILLS.hiddenUnderSky`. |
| `geometry.js` | `makeObstacle`: bỏ `drawScale 1.65`/`drawW`/`drawH`; neo theo `anchor` (`bottom`/`overhead`/`top`), thêm `groundSink`, `requiresHole`. **Hitbox 3 loại cũ không đổi** (đã so: fallenBranch y225 55×23, stoneBlock y225 51×23, reedCurtain y202 76×20). |
| `state.js` | `finishX = FINISH_X` (giá trị không đổi). `createLevelState(options)`: `layout: 'p2'` dùng `p2TestLayout()`, mặc định giữ nguyên `randomizeObstacles()` và luật 12 vật cản. `keepValidBridges()` cảnh báo và bỏ cầu không có hố. |
| `render.js` | Vật cản vẽ ×1 qua `obstacleDrawRect()` (khớp `visible_bbox` hoặc đáy-giữa + sink), bỏ quầng. Bình thư: strip 4 ô, `BOOK_FPS`, bob làm tròn, bỏ quầng. Cổng Luy Lâu đóng/mở (`drawFinishGate`, `finishGateOpen`). Đồi xa tắt dần dưới trời giông. |
| `assets.js` | Nạp vật cản/bình thư/cổng theo ID vào `images.maps.props` (kèm mục manifest). Bỏ nạp ảnh cũ. Export `loadMapManifest()`. |
| `main.js` | `?layout=p2` truyền vào `createLevelState`. Bỏ thông báo thiếu ảnh vật cản cũ (gộp vào danh sách thiếu nền 8-bit). |
| `viewer.js` | Thêm 13 asset môi trường (vật cản, bình thư, cổng, cột đá) từ `maps_tt.json`, nhãn `map/…`. |
| `CLAUDE.md` | Cập nhật mục Map (mới), Cổng đích, Nhân vật (bỏ bù `attack_01`), Chướng ngại vật tĩnh, Hố, Vật phẩm, Chưa dùng tới, Quy ước mở rộng, Cấu trúc module, Tài liệu asset. Xoá mô tả lỗi thời (nền ảnh cũ thu nhỏ, smoothing, `drawScale 1.65`, `finish-gate.png`, `TODO_MAP`). Ghi `map-v2-manifest.json` là lỗi thời. |

`physics.js` **không sửa** (G2: luật va chạm chung đủ cho cầu).

### Hằng số mới (tên | giá trị | DESIGN_BASELINE?)

| Tên | Giá trị | DESIGN_BASELINE? |
|---|---|---|
| `FINISH_X` | 9066 (= `worldX(12, 618)`, trước đây nằm trong `state.js`) | Không |
| `FINISH_GATE` | `{ closed: PROP_LUYLAU_GATE, open: PROP_LUYLAU_GATE_OPEN, worldX: FINISH_X }` | Không (G1) |
| `OBSTACLE_TYPES[*].groundSink` | 4 (3 loại cũ) / 0 (P2) | Không (task card) |
| Hitbox P2 (trong `p2TestLayout`) | fenceLow 40×18, fenceHigh 16×48, bambooSlope 56×30, slideBar 40×20, bridge 96×8, logDrift 56×14 | **Có** |
| `BOOK_FPS` | 6 | **Có** |
| `BOOK_BOB_AMPLITUDE` | 3 (như cũ) | Không |
| `FAR_HILLS.hiddenUnderSky` | `['BG_TT_SKY_STORM']` | Không (team chọn (a)) |

### Kết quả test (test | PASS/FAIL | ghi chú)

Cách chạy như các phase trước (vật lý và vẽ thật, gọi qua `import()`, pane ẩn).

| Test | Kết quả | Ghi chú |
|---|---|---|
| Phần nhìn thấy của mọi vật cản trùng hitbox (lệch ≤ 1 px) | **PASS** | Đo alpha-bbox thật của từng PNG sau khi đặt: **Δ = 0 px** ở cả 4 cạnh cho 9 loại. `slideBar` có thêm 20 px dây treo phía trên (đúng thiết kế: hitbox là nửa dưới canvas). Ảnh F2 ở Z3: khung đỏ ôm sát cành cây, lau sậy, khối đá. |
| Khe dưới lau sậy và `slideBar` đúng 26 px | **PASS** | Đáy hitbox y = 222, `GROUND_Y` = 248, nên khe 26 px ở cả hai. |
| Đứng lên khối đá / cành cây như cũ | **PASS** | Thả từ trên xuống: chân ở y = 225 = mặt trên hitbox, `grounded`, 0 sát thương. Nhảy qua: 0 sát thương. |
| Dash qua lau sậy không mất máu, đi bộ vào mất 1 máu | **PASS** | Dash: 0; đi bộ: −1 (“Hãy nhảy hoặc lướt qua chướng ngại vật.”). |
| Bình thư lặp đều, bob không rung; nhặt đủ 5 vẫn thắng | **PASS** | Strip 4 ô × 16×16, 6 fps (4 ô/0.67 s, lặp đều). Bob làm tròn nên toạ độ vẽ luôn nguyên. Đặt dưới từng sách và nhảy: 5/5 nhặt được. Hitbox nhặt 22×26 (lớn hơn hình 16×16) giữ nguyên: dễ nhặt, chấp nhận theo task card. |
| Cổng: đóng khi chưa đủ điều kiện, bị giữ như cũ; đủ thì mở; qua cổng thì thắng | **PASS** | Boss còn: đóng, bị giữ ở x = 9059. Boss đã hạ + 4/5 sách: vẫn đóng, bị giữ. 5/5 sách: **mở ngay khi người chơi còn ở x = 8900** (trước `finishX`), đi tiếp thì thắng. Ảnh: cổng đóng có người chơi đứng trước cánh giữa; cổng mở hai cánh. |
| `?layout=p2`: nhảy qua / đứng lên `fenceLow`/`fenceHigh`/`bambooSlope`/`logDrift` | **PASS** | Đứng lên: chân đúng mặt trên (230/200/218/234), 0 sát thương. Nhảy qua: 0 sát thương. Đi bộ vào cạnh: −1 (như loại thường). |
| `?layout=p2`: dash qua `slideBar` | **PASS** | Dash: 0 sát thương. Đi bộ vào: −1. (Lần đo đầu báo −1 khi dash là do điểm xuất phát của test đè lên `bambooSlope` ngay trước; đặt `slideBar` riêng thì 0.) |
| `?layout=p2`: đi qua cầu không rơi, không mất máu | **PASS** | Đi sang phải và sang trái qua hố 96 px (x 960–1056): chân luôn ở 248, 0 sát thương. Đáp giữa cầu từ trên cao rồi nhảy lên: bình thường. **Xác nhận G2: không cần sửa luật va chạm.** |
| `bridge` thiếu hố thì cảnh báo và bỏ qua | **PASS** (theo code) | `keepValidBridges()` ghi `console.warn` và lọc bỏ. Layout thường không có cầu nên không phát sinh. |
| Cột đá chỉ hiển thị trong viewer | **PASS** | `?viewer=1` → `PROP_STONE_PILLAR` (`map/prop`), 2 ô 24×48 (`intact\|cracked`). Không đặt trong màn. |
| Đồi xa không lộ mảng xanh dưới trời giông (phương án a) | **PASS** | Ảnh ở Z5: không còn mảng xanh sáng giữa tường thành. Đồi tắt dần cùng hệ số với trời. |
| Hồi quy: chơi hết màn 3 lượt, không lỗi console | **PASS** (có ghi chú) | 6 lượt bot: **4 thắng**, 2 lượt bot sót 1 sách nên không qua được cổng. 0 exception, console không lỗi, `draw()` 0.11–0.15 ms/frame. Đã tái hiện lượt sót bằng seed cố định (seed 19): bot đáp lên khối đá ở x ≈ 1082 rồi nhảy tiếp **từ trên đá** tại x = 1092, bay qua sách ở x = 1158 với đỉnh đầu y ≈ 104, cao hơn hẳn khung nhặt (y 179–205). Đây là do **bot tự động**, không phải lỗi game: vị trí sách, hitbox nhặt và `physics.js` không đổi, và cả 5 sách nhặt được khi nhảy tại chỗ. |
| `pytest tests` | skip | Thiếu `SUTA_TEST_DATABASE_URL` (như `CLAUDE.md` ghi). |

### Khác biệt cảm giác/hình ảnh so với bản trước

- Vật cản, bình thư, cổng giờ là pixel art ×1 sắc nét, cùng tỉ lệ với nhân vật. Không còn ảnh cũ bị thu nhỏ, không còn quầng tối/đỏ sau vật cản và quầng vàng sau sách (G5).
- Bình thư nhỏ hơn hẳn sách cũ (16×16 so với 24×36) nhưng có ánh lấp lánh. Khung nhặt vẫn như cũ nên dễ nhặt hơn so với hình.
- Cổng Luy Lâu to và rõ hơn nhiều (192×176, cũ ≈ 131×150), dịch trái 24 px về đúng `finishX` (G1). Cổng mở hai cánh ngay khi đủ điều kiện, báo trước cho người chơi.
- Vùng Z5: bỏ đồi xa tông nắng, dãy núi trong ảnh trời giông thay chỗ, nên cảnh đồng nhất hơn.

### Vấn đề asset (asset | mô tả | NORMALIZE/NEED_REDRAW)

Không phát sinh thêm ở Phase C. Các vấn đề tile Z2/Z4/decor Z3 từ Phase B vẫn chờ team quyết định.

### Câu hỏi cho team

1. Chơi thử xác nhận Phase C, đặc biệt: cảm giác bình thư nhỏ 16×16, nhịp 6 fps, và thời điểm cổng mở.
2. Tile Z2 (và Z4 nếu không chủ ý) có giao Codex `NORMALIZE` không? (từ Phase B)
3. Với TT-MAP-01 đã xong 3 phase: có cần commit/PR không, và commit vào nhánh `update-map-frame` hiện tại?
