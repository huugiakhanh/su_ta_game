# TT-MAP-01 — KẾ HOẠCH TÍCH HỢP (BƯỚC 0)

Ngày: 25/09/2026 • Task card: `docs/SUTA_TT_TASK_MAP_01.md` • Trạng thái: **CHỜ DUYỆT** (chưa sửa code, chưa chép asset)

---

## 0. Phát hiện cần team biết trước khi duyệt

| # | Phát hiện | Bằng chứng | Ảnh hưởng / đề xuất |
|---|---|---|---|
| D1 | **Strip `attack_01` Batch R đã nằm sẵn trong `sprites-8bit/`** (đã commit ở `16e643d`). _Đính chính khi làm Phase A:_ object `PLAYER_ANIMATIONS.attack` **đã không còn** `drawScale`; chỉ còn comment bù tạm và tham số `scale` trong `drawSprite8`, nên nhân vật thực ra đã được vẽ ×1. | md5 `assets/sprites/.../player_trung_trac_attack_01.png` = md5 bản `sprites-8bit/` = `267da5d7…`. Bản cũ (`raw/..._strip_pre_scale_fix.png`) cao 28–30 px; bản đang chạy cao 35–38 px. | ~~Nhân vật đang bị vẽ to quá~~ (sai, xem đính chính). Phase A với `attack_01` chỉ còn dọn comment và đường code bù tạm, không cần chép strip. |
| D2 | Strip `throw` của `EN_HAN_WATCHTOWER` trong `sprites-8bit/` **vẫn là bản cũ**. | md5 bản chạy = md5 `raw/en_han_watchtower_throw_strip_pre_batch_r.png` (`b43f4f05…`). Chiều cao ô bản cũ 29–39 px, bản mới 37–42 px (`idle` 39 px). | Phase A chép strip này như task card mô tả. |
| D3 | So sánh manifest `assets/sprites/` với `sprites-8bit/`: 2 asset chỉ khác trường `qa_notes`. `frames`/`fps`/`loop`/`hit_frame`/cỡ ảnh **giữ nguyên** (attack_01: 6 ô, 14 fps, hit 3, 288×48; throw: 6 ô, 12 fps, hit 4, 288×48). `status` của cả 2 asset **đã là `IN_GAME`** ở cả hai bản. | Script so sánh JSON (Bước 0). | Không gặp điều kiện “dừng và báo” của Phase A. Việc “đặt status về `IN_GAME`” trong Phase A không cần sửa gì. |
| D4 | Test A yêu cầu `attack_01` “cao bằng `idle` (~44 px)”. Đo phần có pixel: `attack_01` 35–38 px, `idle` 43–44, `run` 39–44. | Bbox alpha từng ô. `qa_notes` của Codex ghi “nằm trong khoảng 8.4% so với `run`”. | Tư thế chém cúi thấp hơn khoảng 15%. **Team cần chốt mức lệch chấp nhận được** (đề xuất: tỉ lệ đầu/thân khớp `idle` là PASS; chiều cao tổng không cần bằng). Nếu phải cao đúng 44 px thì `NEED_REDRAW`, không bù bằng scale. |
| D5 | Tên vai trò tile trong `tileset_tt_ground.json` là `surface` / `fill` / `left-edge` / `right-edge` / `decoration`, còn task card viết `surface/fill/edge/decor`. | JSON `tiles[].role`. | Code dùng đúng tên trong JSON. Không phải mâu thuẫn về nội dung. |
| D6 | `MAP_INVENTORY_TT.md` nằm ở `assets/maps/`, không nằm trong `assets/maps/trung-trac/` như task card ghi. | `find assets/maps`. | Chỉ lệch đường dẫn tài liệu. |
| D7 | Brief §5.5 ghi cổng mở “khi thắng”, task card §3.3.3 ghi cổng mở khi **đủ điều kiện nội dung**, trước lúc chạm `finishX`. | — | Làm theo task card (mới hơn, cụ thể hơn). |
| D8 | Nếu hoà 2 lớp giữa chỉ bằng `globalAlpha` thì chỗ **hai ảnh cùng đục bị mờ đi** (ở t = 0.5, độ phủ chỉ còn 75%) vì cả hai PNG đều trong suốt một phần. | Tính toán alpha compositing. | Đề xuất hoà trên canvas phụ 480×160: xoá, vẽ A với `α = 1−t` và B với `α = t` bằng `globalCompositeOperation = 'lighter'` (cộng tuyến tính premultiplied, độ phủ giữ đúng), rồi vẽ canvas phụ lên canvas chính. Trời là ảnh đục nên chỉ cần vẽ đè với `globalAlpha`. |

---

## 1. Tóm tắt code hiện tại liên quan (đã đọc)

- **`config.js`**: `GROUND_Y = GROUND_LAYER_TOP (228) + GROUND_GRASS_OFFSET (20) = 248`. `BACKDROP_LAYERS` gồm `sky` (0.22), `foreground` (0.58, `MIDGROUND_Y`) và `ground` (1.0), ảnh ở `backdrops/chapter1/`. `LANDMARKS = [{ file: 'finish-gate.png', worldX: 9090, height: 150, sink: 8 }]`. `OBSTACLE_SPRITE_FILES` có 10 type, ảnh ở `images/obstacles/`. `ITEM_FILES = { book, heart }`. `OBSTACLE_GROUND_SINK = 4`.
- **`geometry.js` – `makeObstacle`**: `localX` là mép trái hitbox. Mặc định `drawScale` = 1.65; `drawW/drawH = round(w/h × 1.65)`. Vật `overhead` có hitbox `y = groundY − 46`, `h = 20`, và dùng tham số `height` để tính `drawH`. `worldX(chunk, localX) = (chunk − 1) × 768 + localX` **đếm chunk từ 1**, nên các mốc vùng trong task card (0 / 2304 / 3840 / 6144 / 7680 / 9216) khớp. `groundYAt` trả về `GROUND_Y` vì `TERRAIN_RAMPS` rỗng.
- **`render.js`**: `drawBackdrops()` bật smoothing và co giãn ảnh theo chiều cao lớp. `drawLandmarks()` vẽ **trước** khi tắt smoothing. `drawObstacles()` căn giữa `drawW` quanh hitbox, `drawY = groundY − drawH + 4`, có quầng tối/đỏ (`drawObstacleContrastHalo`). `drawBooks()` vẽ quầng vàng hình ellipse, `book.png` rộng 24 px, bob = `sin(t·4 + i)·3` **không làm tròn trước khi cộng** (chỉ làm tròn toạ độ vẽ). `drawHoles()` tô hố tối. `drawSprite8(..., scale)` nhận `config.drawScale`.
- **`physics.js`**: va chạm obstacle như sau. Nếu `aabb` trúng, cờ `requiresDash` và người chơi đang dash thì bỏ qua. Nếu vật không `overhead`, không `harmful`, `vy ≥ 0` và `previousBottom ≤ obstacle.y + 5` thì người chơi đứng lên vật; mọi trường hợp khác gọi `hurtPlayer`. Hố dùng `pointHasGround` để bỏ mặt đất, rơi quá `VIEW_H + 96` thì respawn. Khi `x ≥ finishX`: boss còn sống hoặc chưa đủ 5 sách thì người chơi bị giữ ở `finishX − 18`, ngược lại `endGame(true)`. Camera: `cameraX` lerp về `p.x − 0.34·VIEW_W` (**số thực**), max = 9216 − 480 = 8736.
- **`state.js`**: `finishX = worldX(12, 618) = 9066`. Có 5 sách (vị trí trong inventory §4). `holes: []`. Gọi `makeObstacle` cho `fallenBranch (55×23)`, `stoneBlock (51×23)`, `reedCurtain (76×32, overhead)`.
- **`viewer.js`**: chỉ đọc `manifest_tt.json` (schema `assets[].animations[]`), không biết `maps_tt.json`.

Kiểm tra neo của vật cản cũ so với số liệu task card:
- `fallenBranch`: `drawY = 248 − 38 + 4 = 214`; bbox hiện (18,11) 55×23, nên phần nhìn thấy nằm ở y 225–248, trùng hitbox.
- `reedCurtain`: `drawY = 248 − 53 + 4 = 199`, bbox y 3, nên phần nhìn thấy ở y 202–222, trùng hitbox.
- `stoneBlock`: lệch ngang (84 − 51)/2 = 16.5 → hiện lệch 0.5 px do làm tròn. Cách neo mới bên dưới bỏ được sai số này.

---

## 2. Trường code sẽ dùng

### 2.1 `maps_tt.json` (đọc lúc chạy, cùng cách làm với `manifest_tt.json`)

Đề xuất **nạp `maps_tt.json` lúc chạy**, dùng làm nguồn cỡ ảnh và đường dẫn, không chép số vào code. Giá trị gameplay và `DESIGN_BASELINE` (parallax, vùng, hitbox, anchor) đặt trong `config.js` theo quy tắc 5 của task card.

| Trường | Dùng cho |
|---|---|
| `stage.ground_y`, `stage.stage_length`, `stage.tile_size` | Chỉ để **kiểm tra khi nạp**: khác `GROUND_Y` / `LEVEL_WORLD_WIDTH` / 16 thì `console.warn`. Không dùng để thay hằng số. |
| `assets[].id`, `file` | Tra đường dẫn ảnh theo ID. |
| `assets[].w`, `h` | Cỡ vẽ ×1 và chu kỳ lặp ngang. Sau khi tải, kiểm tra với `naturalWidth/Height`; lệch thì cảnh báo. |
| `assets[].metadata` (tileset) | Đường dẫn `tileset_tt_ground.json`. |
| `assets[].visible_bbox` (3 vật cản P0) | Offset căn phần nhìn thấy trùng hitbox. |
| `assets[].frame_w`, `frame_h`, `frames` (`ITEM_BINH_THU`, `PROP_STONE_PILLAR`) | Cắt ô strip. |
| `assets[].pivot` (cổng, cột đá) | Neo bottom-center. |
| `assets[].state_files`, `frame_states` (cột đá) | Chỉ dùng trong viewer. |
| `assets[].status` | Hiển thị trong viewer. Sau Phase C đổi thành `IN_GAME` (trường duy nhất được sửa). |

Không dùng: `zone` (bảng vùng nằm trong `config.js` theo task card), `parallax_hint` (hệ số nằm trong `config.js`), `anchor` dạng chuỗi (mã hoá thành số trong `config.js`), `hitbox_*`/flags của P2 (chỉ đối chiếu, hitbox khai báo trong code), `prompt`, `raw`, `qa_notes`, `mockups`, `references`.

### 2.2 `tileset_tt_ground.json`

| Trường | Dùng cho |
|---|---|
| `tile_size.w/h` | Cỡ ô (16×16). |
| `tiles[].region` (`Z1`…`Z5`) | Chọn bộ tile theo vùng. |
| `tiles[].role` (`surface`, `fill`, `left-edge`, `right-edge`, `decoration`) | Lọc biến thể theo vai trò. |
| `tiles[].rect` (x, y, w, h) | Toạ độ cắt trong sheet. Decor có `h = 8`. |
| `tiles[].id` | Chỉ để debug/log. |
| `runtime_slice.surface_height` (16), `fill_visible_height` (6) | Kiểm tra: `GROUND_Y + 16 + 6 = 270`, khác thì cảnh báo. |

Không dùng: `grid`, `region_layout`, `unused_cells`, `collision` (va chạm vẫn dùng `GROUND_Y`).

---

## 3. Nơi chép asset

Đích: **`frontend/static/assets/images/maps-8bit/`**, giữ cấu trúc của `assets/maps/trung-trac/`. Chỉ chép file runtime.

```
maps-8bit/
├── maps_tt.json
├── bg/BG_TT_SKY_DAY/bg_tt_sky_day.png            (và SKY_STORM, FAR_HILLS, 5 × MID_*)
├── tiles/TILESET_TT_GROUND/tileset_tt_ground.png
├── tiles/TILESET_TT_GROUND/tileset_tt_ground.json
├── obstacles/OBS_*/obs_*.png                      (9 file: 3 P0 + 6 P2)
├── items/ITEM_BINH_THU/item_binh_thu_idle.png
└── props/PROP_LUYLAU_GATE/…, PROP_LUYLAU_GATE_OPEN/…,
    PROP_STONE_PILLAR/prop_stone_pillar.png (+ _intact, _cracked)
```

**Không chép**: `raw/`, `mockups/`, `references/`, `*.prompt.txt`, `items/ITEM_BINH_THU/processed/`, `*.gif`, `MAP_REPORT_TT.md`.
**Không xoá** ảnh cũ trong `backdrops/chapter1/`, `obstacles/`, `items/book.png`; code chỉ ngừng tham chiếu.
Bước chép sẽ chia theo phase: Phase B chép `bg/`, `tiles/`, `maps_tt.json`; Phase C chép `obstacles/`, `items/`, `props/`.

`maps_tt.json` có **2 bản** (nguồn `assets/maps/…` và bản chạy `maps-8bit/`). Sau Phase C chỉ sửa `status` ở bản nguồn rồi chép lại sang bản chạy để hai bản trùng nhau, giống quy trình đang dùng cho `manifest_tt.json`.

---

## 4. OWNED FILES theo phase

### Phase A — Sprite Batch R
| File | Việc |
|---|---|
| `frontend/static/assets/images/sprites-8bit/enemy/EN_HAN_WATCHTOWER/en_han_watchtower_throw.png` | Chép đè từ `assets/sprites/` (D2). |
| `frontend/static/assets/images/sprites-8bit/manifest_tt.json` | Chép đè từ `assets/sprites/` (chỉ `qa_notes` thay đổi, D3). |
| `frontend/static/js/levels/trung-trac/config.js` | Xoá `drawScale: 1.5` và khối comment bù tạm trong `PLAYER_ANIMATIONS`. |
| `frontend/static/js/levels/trung-trac/render.js` | Bỏ tham số `scale` trong `drawSprite8` và đối số `config.drawScale || 1` trong `drawPlayer`. |
| `docs/REPORT_TT-MAP-01.md` | Tạo mới, mục Phase A. |

`attack_01` không cần chép (D1). Các file khác chỉ đọc.

### Phase B — Nền parallax, vùng, mặt đất
| File | Việc |
|---|---|
| `frontend/static/assets/images/maps-8bit/` (`bg/`, `tiles/`, `maps_tt.json`) | Chép asset. |
| `config.js` | Thêm `MAP_8BIT_ROOT`, `MAP_MANIFEST_FILE`, `ZONES` (id, x0, x1, mid, sky, tile region), `PARALLAX_LAYERS` (sky 0.05, far 0.2, mid 0.5; `FAR_HILLS_BOTTOM_Y = 230`), `ZONE_BLEND_WIDTH = 192`, `GROUND_DECOR_DENSITY = 0.25`, tất cả ghi `DESIGN_BASELINE`. Thay `BACKDROP_ROOT`/`BACKDROP_LAYERS`/`GROUND_LAYER_*`/`MIDGROUND_Y`. Cho `GROUND_Y = 248` là hằng số trực tiếp (**giá trị giữ nguyên**) và comment lại. |
| `assets.js` | Nạp `maps_tt.json`, `tileset_tt_ground.json` và ảnh nền/tile theo ID. Thêm `images.maps`. |
| `render.js` | Viết lại `drawBackdrops` (×1, không smoothing, offset làm tròn, hoà vùng qua canvas phụ), thêm `drawGroundTiles` và `drawGroundDecor`. Bỏ nhánh bật smoothing. `drawHoles` giữ lại làm hình hố. |
| `main.js` | Cập nhật thông báo thiếu asset (`missingBackdrops` → lớp nền 8-bit / tileset). |
| `docs/REPORT_TT-MAP-01.md` | Mục Phase B. |

### Phase C — Vật cản, bình thư, cổng, P2
| File | Việc |
|---|---|
| `frontend/static/assets/images/maps-8bit/` (`obstacles/`, `items/`, `props/`) | Chép asset. |
| `config.js` | `OBSTACLE_TYPES` gồm id asset, `groundSink` (4 cho 3 loại cũ, 0 cho P2), anchor (`bottom` / `overhead` / `top`), cờ mặc định. `BOOK_FPS = 6` (`DESIGN_BASELINE`). `FINISH_GATE` (`PROP_LUYLAU_GATE`/`_OPEN`). Ngừng tham chiếu `OBSTACLE_SPRITE_FILES` / `ITEM_FILES.book` / `LANDMARKS['finish-gate.png']` (xoá khai báo, **không xoá file ảnh**). `OBSTACLE_SPRITE_ROOT` giữ nếu còn `spikesTrap` (xem G8). |
| `geometry.js` | `makeObstacle`: bỏ `drawScale 1.65`; thêm `groundSink` theo type và anchor `top` cho `bridge` (`y = groundY`). **Hitbox 3 loại cũ giữ nguyên từng số.** |
| `state.js` | Nhánh layout `p2` (nền phẳng, 6 vật cản P2, 1 hố 96 px + `bridge`, không có hazard/enemy/boss). Kiểm tra `bridge` phải có hố tương ứng, thiếu thì `console.warn` và bỏ qua. Đề xuất `finishX` đọc từ `FINISH_X` trong `config.js` (giá trị giữ 9066) để cổng và trigger dùng chung một số. |
| `render.js` | Vật cản ×1, căn `visible_bbox` trùng hitbox. Bình thư: strip 4 ô, 6 fps, bob làm tròn. Cổng đóng/mở. Tile `left-edge`/`right-edge` quanh hố. |
| `assets.js` | Nạp ảnh vật cản, item, props theo ID. |
| `main.js` | Đọc `?layout=p2` và truyền vào `createLevelState(layout)`. Màn thường không đổi. |
| `viewer.js` | Thêm mục xem asset trong `maps_tt.json` (tối thiểu `PROP_STONE_PILLAR` 2 ô, cổng, bình thư, vật cản) ×1/×3/×4, có pivot và baseline. |
| `assets/maps/trung-trac/maps_tt.json` + bản `maps-8bit/` | Chỉ sửa `status` → `IN_GAME` cho asset đang vẽ trong màn thường. P2 và cột đá giữ nguyên. |
| `CLAUDE.md` | Cập nhật mục Map, Chướng ngại vật tĩnh, Vật phẩm, Tài liệu asset; xoá mô tả lỗi thời; ghi `map-v2-manifest.json` là lỗi thời. |
| `docs/REPORT_TT-MAP-01.md` | Mục Phase C. |
| `physics.js` | **Chỉ sửa nếu team chọn phương án khác ở G2.** Mặc định: READ-ONLY. |

### READ-ONLY (mọi phase)
`physics.js` (trừ G2), `animation.js`, `input.js`, `ui.js`, `frontend/templates/**`, `frontend/static/css/**`, `backend/**`, `app.py`, `tests/**`, mọi PNG/GIF (chỉ chép), `assets/sprites/**`, `assets/maps/**` (trừ trường `status` trong `maps_tt.json`), `sprites-8bit/manifest_tt.json` (Phase A chép đè, không sửa tay), `backdrops/chapter1/map-v2-manifest.json`, `SUTA_TT_MAP_BRIEF.md`, `SUTA_TT_SPRITE_BRIEF.md`, `docs/SUTA_TT_TASK_MAP_01.md`.

---

## 5. Bảng ánh xạ asset cũ → mới

| Chỗ dùng trong code | Asset cũ (ngừng tham chiếu) | Asset mới | Cách vẽ mới |
|---|---|---|---|
| `BACKDROP_LAYERS.sky` | `backdrops/chapter1/sky.png` (1792×720, co về 672×270, 0.22) | `BG_TT_SKY_DAY` (Z1–Z4) / `BG_TT_SKY_STORM` (Z5), 480×270 | y = 0, lặp 480, parallax 0.05. Chỉ hoà ở ranh giới Z4→Z5. |
| _(không có)_ | — | `BG_TT_FAR_HILLS` 960×120 | Đáy ở y = 230 (top 110), lặp 960, parallax 0.2, mọi vùng. |
| `BACKDROP_LAYERS.foreground` | `foreground.png` (1792×720, co về 538×216, 0.58) | `BG_TT_MID_VILLAGE` / `_FIELDS` / `_FOREST` / `_RIVER` / `_CITADEL`, 768×160 | Đáy ở `GROUND_Y` (top 88), lặp 768, parallax 0.5, hoà ở cả 4 ranh giới. |
| `BACKDROP_LAYERS.ground` | `ground.png` (1792×70, co về 1075×42) | `TILESET_TT_GROUND` (vùng Z1–Z5) | Tile `surface` top = 248; `fill` từ y = 264 (bị cắt ở 270); `decoration` 16×8 có đáy = 248. |
| `obstacles.fallenBranch` | `obstacles/fallen_branch.png` ×1.65 | `OBS_FALLEN_BRANCH` 91×38 | left = hitbox.x − 18, top = hitbox.y − 11 (đáy canvas = `GROUND_Y + 4`). |
| `obstacles.stoneBlock` | `stone_block.png` ×1.65 | `OBS_STONE_BLOCK` 84×38 | left = hitbox.x − 16, top = hitbox.y − 11. |
| `obstacles.reedCurtain` | `reed_curtain.png` ×1.65 | `OBS_REED_CURTAIN` 125×53 | left = hitbox.x − 24, top = hitbox.y − 3 = 199. |
| `fenceLow` / `fenceHigh` / `bambooSlope` / `logDrift` | `fence_low.png` / `fence_high.png` / `bamboo_slope.png` / `log.png` | `OBS_FENCE_LOW` 40×18 / `OBS_FENCE_HIGH` 16×48 / `OBS_BAMBOO_SLOPE` 56×30 / `OBS_LOG_DRIFT` 56×14 | Canvas = hitbox, đáy ở `GROUND_Y`, sink 0. |
| `slideBar` | `slide_bar.png` | `OBS_SLIDE_BAR` 40×40 | top canvas = `GROUND_Y − 66`, hitbox = nửa dưới (y 202–222). |
| `bridge` | `bridge.png` | `OBS_BRIDGE` 96×8 | top = `GROUND_Y`, chỉ đặt khi có hố. |
| `spikesTrap` | `spikes.png` | _(không có asset mới)_ | Giữ khai báo cũ hoặc bỏ (G8). |
| `books` | `items/book.png` (rộng 24 px) + quầng vàng | `ITEM_BINH_THU` strip 64×16 (4 × 16×16) | ×1, tâm tại `(book.x, book.y + round(bob))`, 6 fps. Hitbox nhặt 22×26 giữ nguyên. |
| `LANDMARKS` cổng đích | `backdrops/chapter1/finish-gate.png` (cao 150, sink 8, tâm 9090) | `PROP_LUYLAU_GATE` / `PROP_LUYLAU_GATE_OPEN` 192×176, pivot (96, 176) | Đáy = `GROUND_Y` (không chìm), tâm theo G1. Mở khi boss đã hạ và đủ 5/5 sách. |
| _(viewer)_ | — | `PROP_STONE_PILLAR` strip 48×48 (2 × 24×48) | Chỉ hiển thị trong `?viewer=1`. |
| `PLAYER_ANIMATIONS.attack` | `attack_01` + `drawScale 1.5` | `attack_01` Batch R (đã có sẵn, D1) | ×1, bỏ `drawScale`. |
| `EN_HAN_WATCHTOWER.throw` | strip trước Batch R | strip Batch R | ×1 (chép đè). |

`items/heart.png` (HUD) giữ nguyên, ngoài phạm vi.

---

## 6. Thiết kế kỹ thuật (tóm tắt)

- **Offset parallax**: `ox = ((round(cameraX × p) % W) + W) % W`, vẽ từ `x = −ox` theo bước `W` (chiều rộng gốc). Làm tròn **trước** khi lấy modulo để ảnh không rung dưới pixel.
- **Tile**: cột tile theo world, `col = floor(worldX / 16)`, `screenX = col × 16 − round(cameraX)`. Mọi tile dùng chung `round(cameraX)` nên lớp đất và sprite trượt cùng một bước (sprite hiện cũng làm tròn sau khi trừ camera). Chỉ duyệt các cột nằm trong `[floor(cam/16), ceil((cam + 480)/16)]`, khoảng 31 cột.
- **Vùng của cột tile**: lấy theo `col × 16` so với `ZONES`. Mọi ranh giới đều chia hết cho 16. _(Sau Phase B, theo yêu cầu team: không cắt dứt khoát nữa mà dùng dải chuyển tiếp dither 192 px — xem REPORT Phase B.1.)_
- **Biến thể tất định**: `h = hash32(col)` (ví dụ xorshift/`imul` trên chỉ số cột, không có seed ngẫu nhiên). `surface = list[h % n]`, `fill = list[(h >> 8) % n]`, có decor khi `((h >> 16) & 0xff) < 256 × 0.25`, decor = `list[(h >> 24) % n]`. Chơi lại không đổi vì không phụ thuộc thời gian hay `Math.random`.
- **Thứ tự vẽ**: trời → đồi xa → lớp giữa (có hoà vùng) → tile đất → decor → cổng → hazard chìm → hố → sách → vật cản → hazard → enemy → đạn → người chơi.
- **Smoothing**: `imageSmoothingEnabled = false` suốt `draw()`. Bỏ mọi nhánh bật lại.
- **Hoà lớp giữa**: xem D8 (canvas phụ + `'lighter'`). Chỉ tạo canvas phụ khi đang ở vùng hoà.

---

## 7. Quyết định cần team chốt

| # | Câu hỏi | Đề xuất của Claude |
|---|---|---|
| **G1** (§3.3.3) | Đặt tâm cổng Luy Lâu ở `finishX` = 9066 hay giữ 9090? | **9066** (xoá độ lệch 24 px cũ). Cổng trải 8970–9162 < 9216. Khi bị giữ lại (`x = finishX − 18` → tâm người chơi ≈ 9060), người chơi đứng ngay trước **cánh cổng giữa**, đúng ý “cổng đóng chặn đường”. Đề xuất thêm hằng `FINISH_X` trong `config.js` để trigger và cổng dùng chung một số. |
| **G2** (§3.3.4) | `bridge` đặt ngang mặt đất có làm mất máu khi đi vào cạnh không? | **Phân tích luật hiện tại cho thấy không.** (a) Đi bộ từ mặt đất vào: chân ở đúng 248, `aabb` so sánh chặt (`a.y + a.h > b.y` → 248 > 248 sai), nên không chạm. Khi một chân còn trên đất, người chơi vẫn bám `GROUND_Y`. (b) Khi cả hai chân đã ở trên hố, người chơi rơi khoảng 0.4 px/frame, `previousBottom = 248 ≤ 248 + 5`, nên đứng lên cầu. (c) Rơi từ trên xuống: tương tự, không xuyên qua vì cầu dày 8 px và cần rơi > 50 px/frame mới lọt. (d) Chỉ mất máu khi người chơi đã rơi sâu hơn 5 px dưới mặt cầu rồi đi ngang vào cầu, tức là đã rơi xuống hố, chấp nhận được. **Đề xuất: không đổi luật va chạm.** Test C sẽ xác nhận thực tế. Nếu thực tế vẫn mất máu, phương án dự phòng (cần duyệt riêng) là cờ `platformOnly` cho `bridge`: va chạm chỉ khi từ trên xuống, còn va ngang thì bỏ qua. Cờ này chỉ gắn cho `bridge`, không đổi luật chung. |
| **G3** | Hoà vùng tính theo điểm nào của camera? Với cửa sổ **căn giữa** ranh giới (±96) và điểm tham chiếu là **tâm khung nhìn** (`cameraX + 240`), trời chỉ đổi xong khi người chơi ở x ≈ 7699, **đã vào chunk 11 được 19 px**, nên trượt Test B (“đổi trước khi vào chunk 11”). | Điểm tham chiếu = tâm khung nhìn, **cửa sổ hoà `[B − 192, B]`** (xong đúng lúc tâm khung nhìn chạm ranh giới). Khi đó trời đổi xong lúc người chơi ở x ≈ 7603, trước 7680. Áp dụng như nhau cho lớp giữa. Cách khác: giữ ±96 nhưng dùng mép phải khung nhìn. |
| **G4** | Tiêu chí “`attack_01` cao bằng `idle`” (D4). | PASS nếu đầu và thân cùng tỉ lệ `idle` và chân đúng baseline; không đòi bằng 44 px vì tư thế chém cúi. |
| **G5** | Giữ hay bỏ **quầng tối/đỏ** sau vật cản (`drawObstacleContrastHalo`) và **quầng vàng** sau sách? Hai quầng là gradient mượt, không phải pixel art. Asset mới đã được duyệt về độ nổi trên nền. | **Bỏ cả hai.** Nếu vẫn cần quầng cho sách thì làm quầng pixel (hình tròn tô đặc, alpha thấp, toạ độ nguyên). |
| **G6** | Tile `left-edge`/`right-edge` chỉ có khoảng 8 px đất (nửa trái/nửa phải), nửa còn lại trong suốt. Đặt ở đâu? | Đặt sao cho phần đất **kết thúc đúng mép hố**: `left-edge` ở `hole.x − 8`, `right-edge` ở `hole.x + hole.w − 8`. Cột surface kề bên bị cắt 8 px. Hình khi đó khớp va chạm (`pointHasGround`). Hố trong `?layout=p2` đặt thẳng lưới 16 px. Chỉ ảnh hưởng layout thử vì màn thường không có hố. |
| **G7** | Cổng đã mở có đóng lại không (ví dụ khi thua)? | Không. Trạng thái mở suy ra mỗi frame từ `!bossAlive && booksCollected ≥ 5`, không lưu thêm state. |
| **G8** | `spikesTrap` (`spikes.png`) không có asset 8-bit. Giữ khai báo cũ hay xoá? | Giữ khai báo và đường dẫn cũ (không vẽ trong màn), ghi chú trong `config.js`. Có thể xoá nếu team muốn gọn. |
| **G9** | Parallax trời 0.05 (cũ 0.22) sẽ gần như đứng yên. | Làm đúng số trong task card và ghi cảm nhận vào report (task card yêu cầu). |

---

## 8. Rủi ro

| Rủi ro | Giảm thiểu |
|---|---|
| Hoà 2 PNG alpha bị “thủng” (D8). | Canvas phụ + `'lighter'`, kiểm tra bằng mắt tại 4 ranh giới. |
| Rung pixel do `cameraX` là số thực (lerp). | Làm tròn offset **trước** modulo. Tile và sprite dùng chung `round(cameraX)`. Hai lớp parallax khác nhau có thể bước lệch nhau 1 px, đó là hiện tượng parallax bình thường, không phải rung. |
| Màn hình scale lẻ: `fitCanvas()` dùng `image-rendering: auto` khi thu bộ đệm N× về cỡ hiển thị, nên nền có thể hơi mềm ở mép pixel. | Đây là hành vi đã được team chốt (phủ kín màn). Test B “không mờ” sẽ đánh giá với cơ chế này. Nếu vẫn thấy mờ thì ghi vào report, **không tự sửa `fitCanvas`**. |
| Hiệu năng: thêm khoảng 31 × 2 tile + khoảng 8 decor + 4–6 ảnh nền mỗi frame, cộng canvas phụ khi hoà. | Chỉ vẽ cột trong viewport; tạo canvas phụ một lần và dùng lại. Đo FPS trước/sau bằng DevTools, ghi vào report. |
| `maps_tt.json` có 2 bản, dễ lệch nhau. | Chỉ sửa bản nguồn rồi chép sang bản chạy, kiểm tra bằng `diff`. |
| Thiếu hoặc lỗi tải asset mới làm màn trắng. | Giữ fallback màu (trời `#43b8e3`, đất `#795238` từ `GROUND_Y`) và hộp placeholder cho vật cản, cổng, sách. `main.js` báo thiếu asset như hiện nay. |
| Viewer hiện chỉ hiểu schema `manifest_tt.json`. | Thêm nhánh riêng cho `maps_tt.json`, không đổi phần viewer sprite hiện có. |
| Bỏ `drawScale` làm `drawSprite8` đổi chữ ký. | Chỉ `drawPlayer` truyền `scale`. Grep toàn thư mục trước khi sửa. |
| `?layout=p2` rò sang màn thường. | Chỉ bật khi query đúng `layout=p2`, mặc định gọi `createLevelState()` như cũ. `randomizeObstacles()` và quy tắc 12 vật cản không đổi. |
| `GROUND_Y` đổi cách định nghĩa (bỏ `GROUND_LAYER_*`). | Giá trị vẫn là 248, kiểm tra chéo với `maps_tt.json.stage.ground_y` lúc nạp. |

---

## 9. Kế hoạch test (tóm tắt, chi tiết theo task card §3)

Mọi test chạy trên `/gameplay/levels/trung-trac` qua dev server (preview) ở 1280×720, mobile ngang/dọc (`resize_window`), F2 bật/tắt, `?viewer=1`, `?layout=p2`. Đọc console, chụp ảnh làm bằng chứng. Mỗi phase ghi PASS/FAIL vào `docs/REPORT_TT-MAP-01.md` rồi **dừng chờ người chơi thử duyệt**.

---

**DỪNG — chờ team duyệt: OWNED FILES theo phase (§4) và các quyết định G1–G9 (§7).**
