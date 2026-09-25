# Sprite spec — Chương Trưng Trắc, Màn 1

Tài liệu đặc tả cho agent vẽ sprite (agent-sprite-forge). Mục tiêu: tạo ra asset **thả vào repo là chạy được ngay**, không phải chỉnh tay.

Đọc kèm: [asset-brief-trung-trac.md](asset-brief-trung-trac.md) (danh sách asset đã có) và `frontend/static/js/levels/trung-trac/config.js` (hằng số thật của engine).

---

## 1. Ràng buộc kỹ thuật (bắt buộc — sai là không dùng được)

### 1.1 Nền trong suốt
Mọi sprite là **PNG/GIF nền trong suốt thật (alpha)**. Không nền trắng, không nền chroma còn sót. Engine vẽ đè sprite lên cảnh nền nên mọi pixel đục ngoài thân nhân vật/vật thể đều thành khối bẩn trên màn hình.

### 1.2 Nội dung phải chạm mép đáy khung
Engine neo vật thể theo **đáy ảnh**: `drawY = groundY - drawH + 7`. Nếu dưới chân còn viền trong suốt thừa, vật thể sẽ trông như lơ lửng trên mặt đất. Cắt sát đáy — hàng pixel cuối cùng phải có nội dung (chân, bánh xe, đế đá...).

Ngoại lệ: vật thể vốn bay/nổi (đạn, thuyền trên sông) không áp dụng.

### 1.3 Animation: GIF hay PNG strip?
Hai cơ chế render khác nhau, **chọn sai thì animation đứng im ở frame đầu**:

| Loại | Cơ chế render | Định dạng cần giao |
|---|---|---|
| Nhân vật chính | HTML `<div>` + `background-image` | **GIF động** |
| Mọi thứ khác (obstacle, địch, đạn) | `ctx.drawImage` trên canvas | **PNG sprite strip ngang** |

Canvas **không chạy được GIF động** (chỉ lấy frame đầu). Nên với địch/chướng ngại vật động, giao **1 file PNG, các frame xếp ngang, ô đều nhau**, đặt tên `<tên>_strip<N>.png` (N = số frame). Ví dụ `han_cavalry_strip6.png`. Vật tĩnh thì 1 PNG đơn.

### 1.4 Đường dẫn và tên file
```
frontend/static/assets/images/
├── characters/trung-trac/     # stance.gif, run.gif, jump.gif, dash.gif, attack.gif, hurt.gif
├── obstacles/                 # chướng ngại vật tĩnh + động (PNG / PNG strip)
└── items/                     # vật phẩm, đạn
```
Tên file: `snake_case`, không dấu, không khoảng trắng.

### 1.5 Độ phân giải nguồn
Vẽ ở độ phân giải cao (cạnh dài 400–1200px) rồi để engine thu nhỏ. Quan trọng là **đúng tỉ lệ khung và đúng chuẩn cỡ tương đối**, không phải số pixel tuyệt đối.

---

## 2. Thước đo trong game (dùng để canh cỡ mọi thứ)

Đơn vị dưới đây là **game pixel** — khung nhìn là 896×360, mặt đất ở y=290.

| Mốc | Giá trị | Ý nghĩa cho hoạ sĩ |
|---|---|---|
| Hitbox nhân vật | 42 × 70 | Nhân vật vẽ ra cao ~80 game px trên màn hình |
| Chiều cao nhảy tối đa | ~138 | Vật cản muốn **nhảy qua được** phải cao **< 120** |
| Quãng lướt (dash) | ~216 | Vật cản bắt buộc lướt nên rộng < 180 |
| Dải đất dưới chân | 70 | Phần dưới mặt đất chỉ còn 70px — không vẽ vật thể chìm sâu hơn |
| Khung nhìn | 896 × 360 | Vật thể rộng quá 400 sẽ chiếm gần nửa màn hình |

**Bảng cỡ mục tiêu** (chiều cao vật thể hiển thị trên màn hình, so với nhân vật ~80):

| Nhóm | Cao (game px) | Ghi chú |
|---|---|---|
| Vật cản thấp (nhảy qua) | 55 – 90 | log, đá, rào thấp |
| Vật cản cao (nhảy sát nút) | 95 – 115 | rào cao, cổng |
| Vật cản lướt qua (overhead) | 90 – 110 | mép dưới cách đất ~45 |
| Địch bộ binh | 75 – 90 | ngang tầm nhân vật |
| Thú (hổ báo) | 55 – 70 | thấp và dài |
| Kỵ binh (ngựa + người) | 110 – 130 | to hơn nhân vật rõ rệt |
| Kiệu 4 người khiêng | 90 – 110, rộng 200–260 | vật thể rộng nhất |
| Tháp canh | 160 – 200 | cao gấp đôi nhân vật |
| Thuyền tuần tra | 90 – 120, rộng 220–280 | nổi trên sông |
| Đạn (tiền xu, tên, phi tiêu) | 12 – 26 | nhỏ, phải đọc rõ trên nền bận |

---

## 3. Phong cách mỹ thuật (bám theo asset đã có)

```
Detailed painterly pixel art, soft shading with subtle light and shadow (not flat
cel-shading), premium mobile-game quality, warm natural daylight, ancient Vietnam
(Mê Linh, ~40 AD, Hai Bà Trưng era). Side view for a 2D platformer. Clean readable
silhouettes, no heavy black outline, no text, no watermark, no baked-in ground shadow.
```

Tham chiếu bắt buộc: `characters/trung-trac/stance.gif` (nhân vật) và `backdrops/chapter1/foreground.png` (cảnh vật). Sprite mới phải đứng chung khung hình với 2 file này mà không lạc tông.

**Bảng màu chủ đạo**

| Vai trò | Mã màu |
|---|---|
| Đỏ giáp phục (quân ta) | `#7a1f1f`, `#8b2820` |
| Vàng kim trang trí | `#d2a33e` |
| Tóc nâu đen | `#1c1108` |
| Da | `#c98c61` |
| Xanh lam giáp Hán (quân địch) | `#2b3a5c`, `#16213a` |
| Gỗ/tre | `#7a4f2c`, `#5a3a22` |
| Kim loại/lưỡi kiếm | `#d7d5c8` |

Quân ta = **đỏ + vàng kim**. Quân Hán = **xanh lam sẫm + đen**. Nhìn màu là phân biệt được địch/ta ngay cả khi sprite chỉ cao 80px.

---

## 4. Nhân vật chính — Trưng Trắc

### 4.1 Tạo hình (khoá thiết kế — mọi animation phải giống hệt)

Nữ tướng Việt cổ thế kỷ 1, tỉ lệ chibi khoảng **3 đầu**, dáng nhanh nhẹn chứ không hộ pháp.

- **Tóc**: nâu đen, buộc đuôi ngựa cao, đuôi tóc dài bay về phía sau
- **Khăn/ruy băng**: dải lụa đỏ dài buộc quanh đầu, bay phía sau cùng tóc
- **Vương miện**: đai vàng kim ôm trán, giữa có **viên ngọc đỏ**
- **Giáp**: giáp vai + yếm ngực vàng kim, bên trong áo đỏ sẫm
- **Thân dưới**: váy quấn đỏ viền vàng, không phải quần
- **Tay/chân**: bao tay vàng kim, ủng nâu viền vàng
- **Vũ khí**: kiếm thẳng (gươm) lưỡi bạc, chuôi vàng — luôn cầm tay phải

Mặc định **quay mặt sang phải**. Engine tự lật khi đi sang trái — **không vẽ bản lật**.

> Lưu ý cho agent: khuôn mặt phải **luôn lộ rõ** ở mọi frame (không bị tóc/tay che hoàn toàn). Script chuẩn hoá đo kích thước khuôn mặt để cân tỉ lệ giữa các animation; mặt bị che sẽ làm nó cân sai.

### 4.2 Sáu animation

Tất cả giao dạng **GIF động, nền trong suốt**, cùng một cỡ nhân vật, chân chạm mép đáy khung.

| File | Frame | Nhịp | Mô tả chuyển động |
|---|---|---|---|
| `stance.gif` | 4 | 200ms | Đứng thủ, kiếm chúc xuống. Thở nhẹ: ngực nhô, tóc và ruy băng đung đưa. Lặp mượt. |
| `run.gif` | 6 | 200ms | Chu kỳ chạy sang phải: tiếp đất → nhún → vung chân → đỉnh bước → tiếp đất chân kia → nhún. Thân hơi chồm trước, váy và tóc bay ngược. |
| `jump.gif` | 3 | 200ms | (1) Khuỵu gối lấy đà (2) Bốc lên, chân co (3) Rơi xuống, chân duỗi chuẩn bị tiếp đất. |
| `dash.gif` | 3 | 200/500/300ms | Lao người thấp về trước, thân gần song song mặt đất, tóc và váy kéo dài về sau, có vệt tốc độ mảnh. |
| `attack.gif` | 4 | 110ms | (1) Vung kiếm lên quá vai, dồn trọng tâm chân sau (2) Chém xuống theo vòng cung, có vệt sáng mỏng (3) Duỗi hết tầm, thân chồm tới (4) Thu kiếm về thế thủ. |
| `hurt.gif` | 3 | 150ms | (1) Trúng đòn: người bật ngược, đầu ngửa, miệng hé, có tia sao va chạm (2) Loạng choạng lùi một bước, gối khuỵu (3) Gượng dậy về thế thủ. |

**Cảnh báo quan trọng** — lỗi đã gặp hai lần với AI:
1. Nhân vật ở các frame trong **cùng một file** phải **cùng kích thước tuyệt đối**. Trước đây frame "trúng đòn" bị vẽ nhỏ còn 2/3, frame "vung kiếm" bị vẽ to hơn — phải sửa tay.
2. Nhân vật giữa **các file khác nhau** cũng phải cùng kích thước. Dùng chính `stance.gif` làm mốc.
3. Trừ frame bay lên khi nhảy/trúng đòn, **chân phải chạm đúng một đường baseline** ở mọi frame.

Sau khi giao, chạy kiểm tra:
```bash
python tools/normalize_player_gifs.py        # chạy thử, xem preview
APPLY=1 python tools/normalize_player_gifs.py
```
Script in ra hệ số scale của từng file — **gần 1.00 là đạt**. Lệch quá 1.15 nghĩa là file đó vẽ sai cỡ, nên vẽ lại thay vì để script phóng bù.

---

## 5. Chướng ngại vật tĩnh

1 PNG đơn, nền trong suốt, **cắt sát đáy**. Đây là loại engine đã hỗ trợ đầy đủ — thả vào là dùng được.

### 5.1 Ba hành vi (quyết định cách vẽ)

| Hành vi | Cờ trong code | Yêu cầu tạo hình |
|---|---|---|
| Nhảy qua / đứng lên được | (mặc định) | Mặt trên phẳng, rõ ràng là đứng lên được. Cao 55–115. |
| Gây sát thương khi chạm | `harmful` | Phải **nhìn là biết nguy hiểm**: mũi nhọn, kim loại sắc, màu cảnh báo. Đừng lẫn với cây cỏ trang trí. |
| Bắt buộc lướt qua bên dưới | `overhead` | Là vật **treo/chắn ngang trên cao**, có khoảng hở rõ ràng bên dưới (~45px tính từ mặt đất). |

### 5.2 Mười vật hiện hành (bộ lịch sử Giao Chỉ, khoảng năm 40)
`bamboo_slope`, `bridge`, `fallen_branch`, `fence_high`, `fence_low`, `log`, `reed_curtain`, `slide_bar`, `spikes`, `stone_block`

Nguồn tạo và metadata QC: `artifacts/static-obstacles-v2/`. Tất cả dùng tre,
mây, gỗ thô, đất đá địa phương và giữ đúng pixel style của map; không dùng
chi tiết kim khí hoặc kết cấu trung đại không cần thiết.

### 5.3 Cần vẽ mới cho Màn 1

| File | Vật | Hành vi | Cỡ (cao × rộng) | Mô tả |
|---|---|---|---|---|
| `spike_pit_hidden.png` | Bãi cỏ cao che bẫy | tĩnh, vô hại | 45 × 120 | Bụi cỏ dại rậm, trông vô hại. Đây là trạng thái "chưa lộ" của bẫy chông. |
| `spike_pit_open.png` | Hố chông sắt đã lộ | `harmful` | 60 × 120 | Hố tối, chông sắt nhọn tua tủa chĩa lên, đất và cỏ bị bật tung quanh miệng hố. Mép hố nằm đúng mép đáy ảnh. |
| `watchtower.png` | Tháp canh | tĩnh (nền cho địch) | 180 × 110 | Tháp tre, sàn gỗ, mái tranh nhỏ. Chân tháp chạm đáy ảnh. Vẽ **không có người** — lính giao riêng ở mục 6. |

---

## 6. Chướng ngại vật động và kẻ địch

> **Trạng thái code**: engine hiện **chưa có** hệ thống đạn, vật cản di chuyển, hay spawn theo báo động. Phần code sẽ làm sau. Asset cứ vẽ trước theo spec này để khi code xong là ráp vào được ngay.

Tất cả giao dạng **PNG sprite strip ngang**, các ô đều nhau, nhân vật/vật thể căn giữa ô theo chiều ngang và chạm đáy ô theo chiều dọc.

### 6.1 Lính thu thuế nhà Hán
- `han_tax_soldier_strip4.png` — 4 frame, cao 80–90
  - (1) đứng gác, giáo/tay chống hông (2) rút túi tiền, vươn tay ra sau lấy đà (3) ném tới trước (4) thu tay về
- `coin_pouch_strip2.png` — 2 frame, cao 18–22 — túi vải nâu căng phồng, vài đồng xu vuông lỗ văng ra, xoay nhẹ giữa 2 frame
- Giáp xanh lam sẫm, mũ trụ hình nón, thắt lưng treo xâu tiền

### 6.2 Xe gỗ chở cống phẩm
- `tribute_cart_strip4.png` — 4 frame, cao 85–100, rộng 110–130 — xe hai bánh chất hòm, lụa, vò gốm buộc dây thừng. 4 frame = **bánh xe quay** (nan hoa xoay 1/4 vòng mỗi frame), thân xe xóc nhẹ
- `tribute_cart_broken.png` — 1 PNG tĩnh, cùng cỡ — xe vỡ tan: ván gãy, một bánh văng ra nghiêng, hòm bung, lụa và tiền đổ ra đất
- Lăn từ phải sang trái về phía người chơi → vẽ **hướng sang trái**

### 6.3 Phu trạm canh gác
- `watchtower_guard_strip4.png` — 4 frame, cao 80–90 — lính đứng trên tháp, cầm **giáo dài**, bên hông có tù và
  - (1)(2) canh gác, đảo mắt (3) phát hiện, giương giáo (4) đưa tù và lên miệng thổi, có vòng sóng âm nhỏ
- Vẽ **chỉ nhân vật**, không kèm tháp (tháp là `watchtower.png` ở mục 5.3)

### 6.4 Hổ báo rừng sâu
- `jungle_tiger_strip6.png` — 6 frame, cao 55–70, rộng 110–140 — hổ Đông Dương vằn cam-đen, chu kỳ **chạy rình mồi**: đầu thấp, vai gồng, đuôi vung theo nhịp, răng nhe
- Hướng sang trái (lao về phía người chơi)

### 6.5 Lính kỵ binh
- `han_cavalry_strip6.png` — 6 frame, cao 110–130, rộng 150–180 — ngựa chiến nâu sẫm phi nước đại, kỵ sĩ giáp xanh lam chồm trước, đao giơ cao, bờm và đuôi ngựa bay ngược
- Chu kỳ phi: 6 frame đủ một vòng chân. Hướng sang trái, lướt rất nhanh ngang màn hình

### 6.6 Thuyền tuần tra sông Hát
- `patrol_boat_strip4.png` — 4 frame, cao 90–120, rộng 220–280 — thuyền gỗ đáy nông, buồm vuông nhỏ, cờ đỏ, hai lính: một chèo, một giương cung
  - 4 frame = thuyền **nhấp nhô theo sóng** + lính chèo đưa mái
- `fire_arrow_strip2.png` — 2 frame, cao 12–16 — mũi tên thân gỗ, đầu quấn vải tẩm dầu đang cháy, lửa và tàn lửa phần phật
- Mực nước nằm ở mép đáy ảnh (thuyền không có "chân" chạm đất)

### 6.7 Kiệu quan lại
- `official_palanquin_strip4.png` — 4 frame, cao 90–110, rộng 200–260 — kiệu mái cong sơn son thếp vàng, rèm lụa, **4 lính khiêng** (2 trước 2 sau) trên đòn tre
  - 4 frame = bước đi đồng loạt, kiệu **nhún lên xuống** theo nhịp; frame cuối rèm hé, thấy bóng quan bên trong
- `throwing_dart_strip2.png` — 2 frame, cao 12–16 — phi tiêu sắt đen, tua đỏ ngắn ở đuôi, xoay nhẹ

### 6.8 Bẫy hố chông (phần động)
Dùng 2 PNG tĩnh ở mục 5.3 (`spike_pit_hidden` → `spike_pit_open`). Nếu muốn mượt hơn thì giao thêm:
- `spike_pit_trigger_strip3.png` — 3 frame, cao 60, rộng 120 — cỏ bật tung → chông nhô lên → chông dựng đứng hẳn

---

## 7. Checklist trước khi bàn giao

- [ ] Nền trong suốt thật (mở bằng trình xem có ô caro — không thấy mảng trắng/hồng nào)
- [ ] Nội dung chạm mép đáy khung (trừ đạn và thuyền)
- [ ] Địch/vật động giao **PNG strip ngang**, ô đều nhau — không giao GIF
- [ ] Nhân vật chính giao **GIF động**
- [ ] Cỡ tương đối đúng bảng mục 2 (so với nhân vật cao ~80 game px)
- [ ] Quân ta đỏ-vàng, quân Hán xanh lam-đen
- [ ] Mọi thứ quay mặt/di chuyển **sang trái** trừ nhân vật chính (sang phải)
- [ ] Tên file `snake_case`, đúng thư mục mục 1.4
- [ ] Với nhân vật: chạy `python tools/normalize_player_gifs.py`, hệ số scale mọi file gần 1.00
