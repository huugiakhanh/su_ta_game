# Asset brief — Chương Trưng Trắc

> Cần đặc tả chi tiết để giao cho agent vẽ sprite (tạo hình nhân vật, animation, chướng ngại vật động/tĩnh, ràng buộc kỹ thuật)? Xem [sprite-spec-trung-trac.md](sprite-spec-trung-trac.md). File này là checklist asset đang có/đang thiếu.

Checklist ảnh cần tạo bằng AI cho chương Trưng Trắc. Thả đúng file vào đúng đường dẫn bên dưới — engine (`frontend/static/js/levels/trung-trac/`, xem `config.js`/`assets.js`) tự nhận diện, không cần sửa code. Nếu thiếu file nào, game vẫn chạy được với placeholder màu/hình khối tạm.

## Nguyên tắc chung

- Phong cách 8-bit/pixel-art nhất quán: cùng độ phân giải gốc, cùng bảng màu, cùng kiểu outline giữa mọi ảnh.
- Nhân vật/vật thể: nền trong suốt (PNG), góc nhìn side-scroller (nhìn ngang).
- Nền cảnh: phải **tileable theo chiều ngang** (mép trái ghép khớp mép phải) để lặp vô hạn không lộ đường nối.
- Viết prompt AI kèm 1 câu mô tả phong cách cố định (vd: "16-bit pixel art, side view, flat color palette, clean black outline") và dùng lại y hệt câu đó cho mọi ảnh để giữ nhất quán phong cách.

## 1. Lớp nền — ĐÃ XONG

Đặt tại `frontend/static/assets/images/backdrops/chapter1/`:

| File | Ghi chú |
|---|---|
| `sky.png` | Trời + mây (+ núi xa nếu muốn), ảnh **đặc/opaque**, tileable ngang, vẽ trước |
| `foreground.png` | Đất/cỏ + cây/tre/nhà, PNG nền **TRONG SUỐT** (chỉ phần cây/nhà/đất là có màu), tileable ngang, vẽ đè lên sau |

Kỹ thuật chốt: 2 lớp chồng theo chuẩn parallax game 2D — `foreground.png` có nền trong suốt nên không cần canh khớp 1 đường cắt ngang với `sky.png` như cách cũ (cắt đôi 1 ảnh); phần trong suốt tự động để lộ sky bên dưới. Muốn tạo ảnh `foreground.png` mới: vẽ trên nền chroma-key (`#FF00FF`), sau đó dùng Photopea Magic Wand xoá nền màu đó thành alpha trong suốt thật trước khi lưu.

## 2. Nhân vật chính — Trưng Trắc

Đặt tại `frontend/static/assets/images/characters/trung-trac/`, nền trong suốt. Không cần canh kích thước khung khi tạo — script chuẩn hoá (mục dưới) sẽ tự đưa mọi file về cùng khung:

| File | Trạng thái |
|---|---|
| `stance.gif` | Đứng yên (idle) |
| `run.gif` | Chạy |
| `jump.gif` | Nhảy |
| `dash.gif` | Lướt |
| `attack.gif` | Vung kiếm |
| `hurt.gif` | Trúng đòn |

Cả 6 đã có và đã chuẩn hoá về khung 1202×610.

Mô tả nhân vật: nữ tướng Việt cổ thế kỷ 1, tóc dài búi/buộc sau, khăn/đai đầu, giáp phục đỏ-vàng, có thể cầm kiếm/giáo ngắn.

**Bắt buộc: chuẩn hoá GIF trước khi dùng.** AI tạo mỗi file một khung ảnh khác nhau và vẽ nhân vật to nhỏ khác nhau; game co ảnh theo *khung* nên nhân vật sẽ phình to/thu nhỏ mỗi khi đổi animation (jump từng bị to gấp đôi lúc đứng yên). Thả file mới vào thư mục rồi chạy:

```bash
python tools/normalize_player_gifs.py          # chạy thử, xem preview
APPLY=1 python tools/normalize_player_gifs.py  # ghi đè thật (tự backup vào _original/)
```

Script tự đo khuôn mặt để cân tỉ lệ nhân vật, đưa 4 (hoặc 6) file về cùng khung, chân cùng baseline, đầu cùng toạ độ ngang. Nếu nó in ra `PLAYER_SPRITE_ANCHOR_X` khác giá trị đang có trong `trung-trac/config.js` thì cập nhật lại hằng số đó.

## 3. Phần 1 — chướng ngại vật tĩnh — ĐÃ TÁI TẠO VÀ GHÉP MAP

`obstacles: [...]` trong `createLevelState()` (`trung-trac/state.js`) dùng ảnh tĩnh có sẵn trong `frontend/static/assets/images/obstacles/`, mỗi ảnh 1 type riêng (không dùng atlas cắt ô nữa) — xem `OBSTACLE_SPRITE_FILES` trong `trung-trac/config.js`:

Bộ hiện hành được tạo lại theo bối cảnh Giao Chỉ khoảng năm 40: tre chẻ, mây buộc,
gỗ thô và đá ong/đá suối; không dùng đinh thép hoặc kết cấu trung đại. Nguồn,
prompt và kết quả QC nằm trong `artifacts/static-obstacles-v2/`; script xuất file
runtime là `tools/finalize_static_obstacles.py`.

| Type trong code | File ảnh | Hành vi |
|---|---|---|
| `fallenBranch` | fallen_branch.png | thường (nhảy qua) |
| `stoneBlock` | stone_block.png | thường |
| `fenceLow` | fence_low.png | thường |
| `bambooSlope` | bamboo_slope.png | thường |
| `reedCurtain` | reed_curtain.png | **overhead** (bắt buộc dash) |
| `slideBar` | slide_bar.png | **overhead** (bắt buộc dash) |
| `bridge` | bridge.png | thường |
| `fenceHigh` | fence_high.png | thường |
| `logDrift` | log.png | thường |

Lưu ý ảnh: crop sát nội dung ở đáy (không để viền trong suốt thừa dưới chân) — game không tự crop nữa, vẽ nguyên cả file nên viền thừa sẽ làm obstacle trông lơ lửng.

## 4. Phần 1 — 8 hazard cốt truyện — ĐÃ CODE

Bộ sprite mới (sinh ra trong `artifacts/sprite-forge-trung-trac/`, xem
[prompts/generation-prompts.md](../artifacts/sprite-forge-trung-trac/prompts/generation-prompts.md))
đã được ráp vào màn qua mảng `hazards: [...]` trong `createLevelState()`. Khác
`obstacles` (vật tĩnh thuần), hazard là vật **có trạng thái**: di chuyển, bắn
đạn, hoặc đổi sprite giữa chừng.

Vật ĐỘNG giao dạng **PNG strip ngang** (canvas không chạy được GIF) — khai báo
số khung/tốc độ trong `OBSTACLE_STRIP_FILES` / `ITEM_STRIP_FILES`, cỡ vẽ và
hitbox trong `HAZARD_SPRITE_SIZES` / `PROJECTILE_SIZES` (`trung-trac/config.js`).

| File | Vị trí trong màn | `kind` | Hành vi trong game |
|---|---|---|---|
| `official_palanquin_strip4.png` | chunk 2 | roller | Kiệu quan đi ngược chiều, chậm (74 px/s), không phá được — phải nhảy qua |
| `spike_pit_hidden.png` → `spike_pit_open.png` | chunk 3 | trap | Chỉ thấy bụi cỏ; tới sát 96 px thì bật thành hố chông và bắt đầu gây sát thương |
| `patrol_boat_strip4.png` | *(bỏ khỏi màn)* | boat | Neo trong khe sông (`holes[0]`), bắn `fire_arrow` lên bờ |
| `fire_arrow_strip2.png` | *(bỏ khỏi màn)* | đạn | Đạn của thuyền tuần tra |
| `han_tax_soldier_strip4.png` | chunk 7 | thrower | Đứng ném `coin_pouch`, 2 máu, chém được |
| `coin_pouch_strip2.png` | — | đạn | Đạn của lính thu thuế |
| `jungle_tiger_strip6.png` | chunk 8 | roller | Lao tới 232 px/s khi người chơi qua mốc, 2 máu |
| `tribute_cart_strip4.png` | chunk 9 | roller | Xe cống lăn tới 168 px/s, 2 máu |
| `tribute_cart_broken.png` | chunk 9 | prop | Xác xe sau khi bị chém vỡ — nằm lại map, vô hại |
| `watchtower.png` | chunk 10 | prop | Cảnh trí, không va chạm |
| `watchtower_guard_strip4.png` | chunk 10 | thrower | Ném `throwing_dart`; tới gần thì thổi tù và gọi kỵ binh (`alarmFor`) |
| `throwing_dart_strip2.png` | — | đạn | Đạn của lính gác tháp |
| `han_cavalry_strip6.png` | chunk 10 | roller | Nằm chờ, chỉ xông ra khi có báo động; 316 px/s, 3 máu |

Ngoài ra `han_tax_soldier_strip4.png` và `han_cavalry_strip6.png` còn được dùng
làm ảnh cho `enemies` (lính thường / boss) thay atlas `hanGuards` cũ — xem
`ENEMY_SPRITES` trong `config.js`. Atlas `mapchunk_1/contains obstacles.png`
**không còn module nào đọc tới**.

Hai điều chỉnh so với spec gốc, do tỉ lệ ảnh thật:

- Lính gác đứng **dưới chân tháp** chứ không đứng trên sàn tháp: sàn trong
  `watchtower.png` nằm ở ~37% chiều cao (cao 68 px so với mặt đất) mà lính cao
  86 px nên đặt lên sàn thì đầu lính chồi qua mái tranh.
- Thuyền tuần tra **neo một chỗ** trong khe sông và được vẽ *dưới* lớp hố
  (`drawHazards(time, true)` chạy trước `drawHoles()`): thuyền rộng 190 px còn
  khe chỉ 155 px, nếu vẽ đè lên thì thuyền che mất miệng hố và người chơi không
  thấy chỗ phải nhảy.

Bẫy hố chông cũ (`spikes.png` / type `spikesTrap`) đã **gỡ khỏi màn**, thay bằng
cặp `spike_pit_hidden`/`spike_pit_open`; ảnh vẫn còn trong repo và vẫn khai báo
trong `OBSTACLE_SPRITE_FILES` nếu muốn dùng lại.

Tuỳ chọn chưa làm: `spike_pit_trigger_strip3.png` (3 khung cỏ bật tung → chông
nhô lên) để chuyển cảnh bẫy mượt hơn thay vì đổi ảnh tức thì.
