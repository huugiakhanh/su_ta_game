# Asset brief — Chương Trưng Trắc

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

Đặt tại `frontend/static/assets/images/characters/trung-trac/`, khung hình vuông 96×96px (khớp `PLAYER_FRAME_SIZE`), nền trong suốt:

| File | Trạng thái |
|---|---|
| `stance.gif` | Đứng yên (idle) |
| `run.gif` | Chạy |
| `jump.gif` | Nhảy |
| `dash.gif` | Lướt |

Gợi ý thêm (chưa bắt buộc, dùng cho các phần sau): `attack.gif`, `hurt.gif`.

Mô tả nhân vật: nữ tướng Việt cổ thế kỷ 1, tóc dài búi/buộc sau, khăn/đai đầu, giáp phục đỏ-vàng, có thể cầm kiếm/giáo ngắn.

**Bắt buộc: chuẩn hoá GIF trước khi dùng.** AI tạo mỗi file một khung ảnh khác nhau và vẽ nhân vật to nhỏ khác nhau; game co ảnh theo *khung* nên nhân vật sẽ phình to/thu nhỏ mỗi khi đổi animation (jump từng bị to gấp đôi lúc đứng yên). Thả file mới vào thư mục rồi chạy:

```bash
python tools/normalize_player_gifs.py          # chạy thử, xem preview
APPLY=1 python tools/normalize_player_gifs.py  # ghi đè thật (tự backup vào _original/)
```

Script tự đo khuôn mặt để cân tỉ lệ nhân vật, đưa 4 (hoặc 6) file về cùng khung, chân cùng baseline, đầu cùng toạ độ ngang. Nếu nó in ra `PLAYER_SPRITE_ANCHOR_X` khác giá trị đang có trong `trung-trac/config.js` thì cập nhật lại hằng số đó.

## 3. Phần 1 — chướng ngại vật — ĐÃ CODE (dùng asset có sẵn, không phải 8 hazard cốt truyện)

`obstacles: [...]` trong `createLevelState()` (`trung-trac/state.js`) hiện dùng đúng 10 ảnh có sẵn trong `frontend/static/assets/images/obstacles/`, mỗi ảnh 1 type riêng (không dùng atlas cắt ô nữa) — xem `OBSTACLE_SPRITE_FILES` trong `trung-trac/config.js`:

| Type trong code | File ảnh | Hành vi |
|---|---|---|
| `fallenBranch` | fallen_branch.png | thường (nhảy qua) |
| `stoneBlock` | stone_block.png | thường |
| `fenceLow` | fence_low.png | thường |
| `bambooSlope` | bamboo_slope.png | thường |
| `spikesTrap` | spikes.png | **harmful** (mất máu) |
| `reedCurtain` | reed_curtain.png | **overhead** (bắt buộc dash) |
| `slideBar` | slide_bar.png | **overhead** (bắt buộc dash) |
| `bridge` | bridge.png | thường |
| `fenceHigh` | fence_high.png | thường |
| `logDrift` | log.png | thường |

Lưu ý ảnh: crop sát nội dung ở đáy (không để viền trong suốt thừa dưới chân) — game không tự crop nữa, vẽ nguyên cả file nên viền thừa sẽ làm obstacle trông lơ lửng.

Đây **không phải** 8 hazard cốt truyện gốc (lính thu thuế, kỵ binh, hổ báo, thuyền, kiệu quan lại) — những cái đó cần ảnh nhân vật/sinh vật riêng (chưa có), vẫn để dành roadmap bên dưới nếu sau này muốn làm đúng lore hơn:

1. Lính thu thuế nhà Hán (ném túi tiền xu — tấn công tầm xa, cần hệ thống projectile mới)
2. Xe gỗ chở cống phẩm (lăn nhanh, có thể phá vỡ, cần obstacle di chuyển được)
3. Phu trạm canh gác (trên tháp canh, thổi còi báo động, cần cơ chế gọi thêm lính)
4. Hổ báo rừng sâu (cần sprite enemy riêng, hiện enemy vẫn dùng atlas `hanGuards`)
5. ~~Cạm bẫy hố chông sắt~~ → đã có `spikesTrap`
6. Lính kỵ binh (cưỡi ngựa, lướt nhanh ngang màn hình, cần obstacle di chuyển được)
7. Thuyền tuần tra sông Hát (bắn tên lửa từ dưới sông, cần projectile + bối cảnh sông)
8. Kiệu quan lại (4 lính khiêng, ném phi tiêu, cần projectile)

## 3b. Cổng đích cuối màn — đã có fallback vẽ tay, thiếu ảnh thật

`LANDMARKS` trong `trung-trac/config.js` đã khai báo sẵn slot `finish-gate.png` (170×170px) tại đúng vị trí kết thúc màn (world-X khớp `finishX`). Chưa có ảnh thì game tự vẽ 1 cổng gỗ đơn giản (2 cột + xà ngang + cờ đỏ) bằng canvas — không trống trơn nhưng chưa đẹp. Muốn thay ảnh thật:

```
[Style anchor] + A single standalone wooden torii-style finish gate with a small red flag flying on top, viewed from the side, matching the game's art style. Transparent background, approximately 170x170px square framing. No text, no watermark.
```

Đặt tại `frontend/static/assets/images/backdrops/chapter1/finish-gate.png` — không cần sửa code.

## 4. Phần 2 — 3 NPC gặp gỡ (roadmap)

- Thi Sách (hào trưởng Chu Diên)
- Lê Chân (nữ tướng An Biên)
- Trưng Nhị (em gái, đồng minh)

Mỗi NPC: 1 pose tĩnh là đủ cho demo (không cần animation đầy đủ).

## 5. Phần 3 — Boss Tô Định (roadmap)

- Tô Định (dáng hèn nhát, núp sau xe)
- Xe bọc thép (Shield Chariot) — có thể có 2 trạng thái: nguyên vẹn / hư hỏng
- Lính ngự lâm bảo vệ boss

## Asset đã có sẵn nhưng chưa dùng

`frontend/static/assets/images/items/`: `armor.png`, `book_gold.png`, `book-open.png`, `question_scroll.png` — chưa có mechanic tương ứng (giáp, sách đặc biệt, đánh dấu điểm hỏi đáp...). `book.png` và `heart.png` đã dùng (sách thu thập + HUD máu).

`frontend/static/assets/images/obstacles/` — cả 10 ảnh đã dùng hết cho Phần 1 (xem mục 3 ở trên). Atlas `contains obstacles.png` (`mapchunk_1/`) giờ chỉ còn dùng cho enemy (`hanGuards`).
