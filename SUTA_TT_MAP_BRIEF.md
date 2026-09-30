# SỬ TA — CHƯƠNG TRƯNG TRẮC
# MAP BRIEF CHO CODEX (agent-sprite-forge / $generate2dmap, $generate2dsprite)

Version 1.0 • 25/09/2026
Phạm vi: nền parallax, tileset mặt đất, vật cản tĩnh, vật phẩm, cổng Luy Lâu, landmark, và **vẽ lại 2 sprite lỗi**.
Tài liệu liên quan (READ-ONLY): `CLAUDE.md`, `SUTA_TT_SPRITE_BRIEF.md`, `docs/REPORT_TT-INT-01.md`, `docs/INTEGRATION_PLAN_TT.md`

---

## 0. NHIỆM VỤ

Bạn là **Pixel Environment Artist** cho game "Sử ta". Game đã chuyển sang **canvas pixel logic 480×270**, mọi sprite nhân vật vẽ ×1. Nền hiện tại là ảnh cũ độ phân giải cao bị thu nhỏ (`TODO_MAP`), nhìn mờ và lệch phong cách. Nhiệm vụ: vẽ lại toàn bộ môi trường thành **pixel art thật ở độ phân giải gốc**, cùng phong cách với bộ sprite 8-bit đã duyệt.

Bạn **chỉ vẽ asset**:
- Không sửa code, không sửa file trong `frontend/`.
- Được **đọc** code (`frontend/static/js/levels/trung-trac/config.js`, `state.js`, `geometry.js`) để lấy kích thước và toạ độ chính xác.
- Không tạo scene Godot hay file engine. Chỉ xuất PNG + JSON.
- Claude sẽ tích hợp vào game ở task riêng sau.

---

## 1. QUY TẮC BẮT BUỘC

1. Tuân thủ mục "Phân công AI" trong `CLAUDE.md`. Vùng làm việc: `assets/maps/` và `assets/sprites/` (chỉ cho Batch R).
2. Kích thước vật cản, vật phẩm, toạ độ landmark **lấy từ code**, không tự đặt. Không tìm thấy → `TODO_MISSING`.
3. Không đổi ID đã có. ID mới đặt theo mục 5 của file này.
4. Asset không đạt contract mà không vẽ lại được → `NEED_REDRAW` + lý do. Không crop/scale bừa.
5. Trạng thái: `RAW_AI` → `NORMALIZED` (tối đa Codex được đặt) → `QA_PASS` (team duyệt).
6. Dừng ở mỗi GATE (mục 4), chờ duyệt.

---

## 2. THÔNG SỐ MÀN CHƠI (ĐÃ CHỐT TRONG CODE)

| Thông số | Giá trị |
|---|---|
| Canvas logic | 480×270 |
| Chiều dài màn | 12 chunk × 768 px = 9216 px |
| `GROUND_Y` (mép cỏ, nơi chân đứng) | y = 248 → dải đất dưới chân cao **22 px** (248–270) |
| Nhân vật chính | thân cao ~44 px, hitbox 25×42 |
| Độ cao nhảy tối đa | ~81 px |
| Boss | cố định ở chunk 11; cổng đích gần cuối chunk 12 |
| Vật cản đang dùng trong màn | `fallenBranch`, `stoneBlock`, `reedCurtain` |
| Vật phẩm | `books` (5 cuốn/màn) |

---

## 3. ART BIBLE MÔI TRƯỜNG

### 3.1 Kỹ thuật
- **Pixel art ở độ phân giải gốc 1x.** Engine vẽ nền không smoothing, nên ảnh phải sắc từng pixel. Nếu model ảnh sinh ra lớn hơn, downscale **nearest-neighbor** đúng kích thước contract, rồi dọn pixel lẻ.
- Cùng hướng sáng với sprite: **từ trên-trái**.
- **Chiều sâu bằng màu, không bằng nét:**
  - Lớp càng xa thì càng nhạt, ít tương phản, ngả xanh-xám.
  - Lớp xa không có outline.
  - Lớp giữa dùng outline màu tối pha màu nền, không dùng `#1A1414`.
  - Chỉ vật cản, vật phẩm, cổng thành (thứ người chơi tương tác) mới dùng outline `#1A1414` như sprite.
- **Nền không được tranh chú ý với nhân vật:**
  - Độ bão hoà nền thấp hơn sprite.
  - Không dùng đỏ `#C8322A` (thắt lưng Trưng Trắc) hay đỏ son quân Hán `#8E1F24`/`#B8363A` làm mảng lớn trên nền.
  - Vùng cao 60–110 px ngay trên `GROUND_Y` (nơi nhân vật và địch hoạt động) phải "yên" nhất: ít chi tiết, tương phản thấp.
- **Tileable ngang:** mọi lớp parallax phải nối liền khi đặt hai bản cạnh nhau (mép trái khớp mép phải). Tự kiểm tra bằng ảnh ghép 2 bản.
- Không chữ, không checkerboard. Lớp có ghi "trong suốt" phải có alpha thật.

### 3.2 Palette bổ sung (dùng cùng palette mục 2.2 của `SUTA_TT_SPRITE_BRIEF.md`)

| Nhóm | Màu |
|---|---|
| Trời ngày | `#9CC4E4`, `#C9E0EE`, `#E8F1F2` |
| Núi xa / sương | `#7E9BB0`, `#A4B9C6`, `#5F7C90` |
| Trời giông (Luy Lâu) | `#3E4257`, `#585C74`, `#7A7E93`, chớp `#E6E8F0` |
| Lúa, cỏ xa | `#7FA05A`, `#9DB86E`, `#5E7F44` |
| Rừng sâu | `#2F4F33`, `#3F6541`, `#1F3624` |
| Nước sông | `#4C7FA8`, `#6E9DC2`, `#2F5A7E` |
| Đất đường / đất nện thành | `#9C7A4E`, `#7C5C38`, `#B89468` |

### 3.3 Nội dung hình ảnh (bối cảnh năm 40 SCN)
- **Làng Lạc Việt (Mê Linh):** nhà sàn mái cong hình thuyền như hoa văn trống đồng, cột gỗ, cầu thang tre, kho thóc sàn cao, hàng rào tre, ruộng lúa nước, cọc buộc thuyền độc mộc.
- **Rừng sâu:** rừng nhiệt đới rậm, dây leo, cây cổ thụ rễ nổi, dương xỉ, sương.
- **Bến sông Hát:** bãi lau sậy, bờ bùn, thuyền độc mộc Việt neo bờ (không vẽ thuyền Hán — đó là sprite địch).
- **Ngoài thành Luy Lâu (trị sở quân Hán):** tường thành **đất nện** dày, vọng lâu gỗ, mái ngói kiểu Hán trên cổng, cờ Hán trơn (không chữ), trại lính, trời giông cuồn cuộn.
- **Cấm:** chùa/tháp Phật, đình làng, nhà mái ngói kiểu làng Bắc Bộ về sau, nón lá, áo dài, gạch nung đỏ hiện đại, điện, kim loại hiện đại, cung điện Trung Hoa trong làng Việt.

---

## 4. QUY TRÌNH VÀ GATE

**GATE 0 — Kiểm kê (chỉ đọc, không vẽ):**
Đọc `config.js`, `state.js`, `geometry.js` và ảnh cũ trong `frontend/static/assets/images/`, rồi viết `assets/maps/MAP_INVENTORY_TT.md` gồm:
1. `BACKDROP_LAYERS` hiện tại: tên lớp, ảnh, cỡ vẽ, hệ số parallax, có lặp ngang không.
2. `LANDMARKS`: từng landmark với tên, ảnh, toạ độ world-X, cỡ vẽ (px logic), ý nghĩa cốt truyện nếu có.
3. Vật cản tĩnh trong `OBSTACLE_SPRITE_FILES` / `makeObstacle`: cỡ vẽ và hitbox (px logic) của từng loại, cờ `harmful`/`overhead`/`requiresDash`, khoảng trống bên dưới vật `overhead`.
4. Cỡ vẽ và hitbox của sách (`books`), vị trí và cỡ cổng đích (`finish-gate.png`).
5. Đề xuất ID cho từng landmark theo mẫu `PROP_LM_<TEN>`.

**DỪNG, chờ duyệt.**

**BATCH R — Vẽ lại 2 sprite lỗi** (làm ngay sau Gate 0, dùng `$generate2dsprite`, xem mục 5.6).

**GATE 1 — Khóa style môi trường:**
Vẽ `BG_TT_SKY_DAY`, `BG_TT_FAR_HILLS`, `BG_TT_MID_VILLAGE` và `TILESET_TT_GROUND` (chỉ bộ tile vùng làng).
Xuất ảnh `mockup_gate1.png` 480×270 để kiểm tra trực quan:
- Ghép các lớp theo đúng thứ tự.
- Mặt đất lát bằng tile, mép cỏ ở y = 248.
- Đặt sprite thật `PLAYER_TRUNG_TRAC` (idle), `EN_HAN_TAXMAN` (idle) và `OB_TRIBUTE_CART` đứng trên mép cỏ.
- Xuất thêm bản phóng ×3.

**DỪNG.** Điều cần duyệt: nhân vật và địch có nổi rõ trên nền không.

**GATE 2 — Batch P0**, **GATE 3 — Batch P1**, **GATE 4 — Batch P2**: mỗi gate dừng chờ duyệt, kèm mockup 480×270 cho từng vùng mới.

---

## 5. DANH SÁCH ASSET

### 5.1 Phân vùng màn (gợi ý bố cục, không đổi gameplay)
Thứ tự vật cản bị xáo ngẫu nhiên mỗi lượt, nên vùng chỉ đổi **cảnh nền**, không gắn với vật cản cụ thể. Nếu toạ độ `LANDMARKS` ở Gate 0 cho thấy cần lệch ranh giới vùng thì đề xuất lại.

| Vùng | Chunk | Cảnh | Ưu tiên |
|---|---|---|---|
| Z1 | 1–3 | Làng Mê Linh | P0 |
| Z2 | 4–5 | Đồng lúa, đường quan có trạm thu thuế | P1 (tạm dùng Z1) |
| Z3 | 6–8 | Rừng sâu | P0 |
| Z4 | 9–10 | Bến sông Hát, bãi lau sậy | P1 (tạm dùng Z3) |
| Z5 | 11–12 | Ngoài thành Luy Lâu, trời giông | P0 |

Chuyển vùng do code xử lý (hoà dần lớp giữa). Không cần vẽ ảnh chuyển tiếp.

### 5.2 Lớp parallax

| ID | Kích thước | Nền | Lặp ngang | Nội dung | Parallax gợi ý* | Ưu tiên |
|---|---|---|---|---|---|---|
| BG_TT_SKY_DAY | 480×270 | đục | có | trời ngày, mây xa, dải núi rất xa mờ ở đáy | 0.05 | P0 |
| BG_TT_SKY_STORM | 480×270 | đục | có | trời giông cho Z5, mây đen cuộn, có thể có chớp xa (1 frame tĩnh) | 0.05 | P0 |
| BG_TT_FAR_HILLS | 960×120 | trong suốt | có | đồi núi xa, rặng cây nhạt, đáy ảnh đặt ở y ≈ 230 | 0.2 | P0 |
| BG_TT_MID_VILLAGE | 768×160 | trong suốt | có | nhà sàn, kho thóc, hàng rào tre, cây cau/tre | 0.5 | P0 |
| BG_TT_MID_FIELDS | 768×160 | trong suốt | có | ruộng lúa, bờ đê, lều canh, cột mốc trạm thuế gỗ | 0.5 | P1 |
| BG_TT_MID_FOREST | 768×160 | trong suốt | có | thân cây lớn, dây leo, tán rậm | 0.5 | P0 |
| BG_TT_MID_RIVER | 768×160 | trong suốt | có | bãi lau sậy, mặt sông xa, thuyền độc mộc neo bờ | 0.5 | P1 |
| BG_TT_MID_CITADEL | 768×160 | trong suốt | có | tường thành đất nện xa, vọng lâu, trại lính Hán | 0.5 | P0 |

\*Hệ số parallax là DESIGN_BASELINE, Claude sẽ chỉnh khi tích hợp.

Quy tắc chung cho lớp `MID_*`: đáy ảnh đặt khớp `GROUND_Y` (y = 248), tức ảnh chiếm y 88–248. 30 px dưới cùng của ảnh là nơi nhân vật đứng, nên phải thưa chi tiết.

### 5.3 Tileset mặt đất — `TILESET_TT_GROUND` (P0)

- Tile 16×16, một sheet PNG, lưới không khoảng cách.
- Kèm JSON mô tả từng tile (id, cột, hàng, vùng, vai trò).
- **Đường va chạm là mép trên của tile mặt.** Đặt tile mặt ở y = 248: 1–2 hàng pixel trên cùng là mép cỏ, chân nhân vật đứng ở đó. Ngọn cỏ trang trí nhô lên trên mép thì vẽ ở tile trang trí riêng (không va chạm).
- Dải đất chỉ cao 22 px (1 tile mặt + 6 px tile lấp), nên tile lấp phải đẹp cả khi bị cắt còn 6 px trên cùng.

Nội dung cho **mỗi vùng** (P0: Z1, Z3, Z5; P1: Z2, Z4):
| Vai trò | Số biến thể |
|---|---|
| Mặt (surface) | 3 |
| Lấp (fill) | 2 |
| Mép trái / mép phải (cho hố, dùng sau) | 1 + 1 |
| Trang trí trên mép cỏ, không va chạm (16×8) | 3 |

Chất liệu mặt theo vùng: Z1 đất nện và cỏ, Z2 bờ ruộng, Z3 cỏ rậm có rễ, Z4 bùn cát ven sông, Z5 đất đỏ nện có vết bánh xe.

### 5.4 Vật cản tĩnh và vật phẩm

**Canvas và hitbox:**
- Cỡ canvas **lấy từ Gate 0** (theo cỡ vẽ hiện tại, px logic).
- Phần vật thể nhìn thấy phải **khớp hitbox** (lệch tối đa ~2 px mỗi cạnh).
- Pivot bottom-center, trừ vật `overhead` (xem dưới).
- Dùng outline `#1A1414` như sprite.

| ID mới | Thay cho | Mô tả | Frame | Ưu tiên |
|---|---|---|---|---|
| OBS_FALLEN_BRANCH | `fallenBranch` | cành cây đổ nằm ngang, lá khô | 1 | P0 |
| OBS_STONE_BLOCK | `stoneBlock` | khối đá tảng, mặt trên phẳng rõ ràng (người chơi đứng lên được) | 1 | P0 |
| OBS_REED_CURTAIN | `reedCurtain` | màn lau sậy/dây leo buông từ trên xuống. **Khoảng trống bên dưới** phải nhìn thấy rõ đúng bằng khe dash (số đo ở Gate 0), để người chơi hiểu phải lướt qua | 1 | P0 |
| ITEM_BINH_THU | `books` | bó thẻ tre buộc dây đỏ (binh thư thời cổ, **không phải sách giấy đóng gáy**), 16×16 | 4 lặp (nhấp nhô + ánh lấp lánh) | P0 |
| OBS_FENCE_LOW, OBS_FENCE_HIGH, OBS_BAMBOO_SLOPE, OBS_SLIDE_BAR, OBS_BRIDGE, OBS_LOG_DRIFT | các loại cùng tên | khai báo sẵn, màn chưa dùng | 1 | P2 |

### 5.5 Set-piece và landmark

| ID | Kích thước | Mô tả | Ưu tiên |
|---|---|---|---|
| PROP_LUYLAU_GATE | khoảng 192×176 (chốt theo vị trí cổng đích ở Gate 0) | cổng thành Luy Lâu: hai khối tường đất nện, cánh cổng gỗ lớn đóng, vọng lâu mái ngói Hán, cờ trơn, lỗ châu mai. Đáy ở `GROUND_Y`. Chừa một cột cờ trống trên cổng để sau này cắm cờ chiến thắng | P0 |
| PROP_LUYLAU_GATE_OPEN | như trên | cùng cổng, cánh mở (khi thắng) | P1 |
| PROP_STONE_PILLAR | 24×48 (DESIGN_BASELINE, cho boss sau) | cột đá cổ trước cổng thành. 2 frame: nguyên / nứt vỡ | P1 |
| PROP_LM_* | theo Gate 0 | vẽ lại từng landmark trong `LANDMARKS`, giữ ý nghĩa cốt truyện, cùng cỡ vẽ | P1 |

### 5.6 BATCH R — Vẽ lại sprite lỗi (dùng `$generate2dsprite`, theo `SUTA_TT_SPRITE_BRIEF.md`)

**PLAYER_TRUNG_TRAC — `attack_01` (NEED_REDRAW)**
- Lỗi: nhân vật trong cả 6 ô bị vẽ nhỏ hơn khoảng 1,5 lần (cao 28–30 px, trong khi `idle`/`run`/`dash` cao 44 px). Game đang phải phóng tạm ×1.5.
- Yêu cầu: vẽ lại cùng tỉ lệ thân với `idle`. Giữ canvas 48×48, 6 ô, `hit_frame` 3, chân ở hàng 46, quay phải.
- Nếu mũi giáo duỗi hết không vừa 48 px ngang: báo trong report để team quyết định tăng `frame_w`. **Không tự đổi canvas.**
- Dùng strip `idle` làm reference để giữ tỉ lệ.

**EN_HAN_WATCHTOWER — `throw` (NEED_REDRAW)**
- Lỗi: ô 4–6 vẽ lính nhỏ hẳn so với ô 1–3 và `idle`.
- Yêu cầu: vẽ lại cả 6 ô cùng tỉ lệ `idle`. Giữ canvas 48×48, `hit_frame` 4.

Sau khi vẽ xong: cập nhật strip trong `assets/sprites/`, đặt `status` về `NORMALIZED`. **Không** chép sang `frontend/`; Claude làm việc đó và xoá hệ số bù tạm.

---

## 6. OUTPUT

```
assets/maps/trung-trac/
  MAP_INVENTORY_TT.md
  maps_tt.json
  MAP_REPORT_TT.md
  bg/<ID>/<id_lower>.png          ← lớp parallax
  tiles/TILESET_TT_GROUND/tileset_tt_ground.png + tileset_tt_ground.json
  obstacles/<ID>/<id_lower>.png   ← vật cản tĩnh (1 frame) hoặc strip ngang
  items/<ID>/<id_lower>_idle.png
  props/<ID>/<id_lower>.png       ← nhiều frame thì strip ngang
  mockups/mockup_gate<n>_<vung>.png (+ bản ×3)
  raw/                            ← ảnh generate gốc
```

`maps_tt.json` (mỗi asset một mục):
```json
{
  "id": "BG_TT_MID_VILLAGE",
  "category": "parallax",
  "file": "bg/BG_TT_MID_VILLAGE/bg_tt_mid_village.png",
  "w": 768, "h": 160,
  "transparent": true,
  "tileable_x": true,
  "zone": ["Z1"],
  "anchor": "bottom-at-GROUND_Y",
  "parallax_hint": 0.5,
  "frames": 1,
  "fps": null,
  "replaces": "foreground (ảnh cũ)",
  "priority": "P0",
  "status": "NORMALIZED",
  "qa_notes": ""
}
```
Vật cản thêm các trường `hitbox_from_code` (w, h lấy ở Gate 0) và `pivot`.

---

## 7. QA TỰ KIỂM

1. Đúng kích thước. Pixel sắc, không mờ, không anti-alias. Palette trong mục 3.2 và palette sprite.
2. Lớp tileable nối liền khi ghép 2 bản, không thấy đường nối.
3. Lớp trong suốt có alpha thật, không viền trắng hay magenta.
4. Nhân vật và địch nổi rõ trên nền trong mockup (kiểm tra ở ×1 và ×3).
5. Tile mặt: mép cỏ nằm ở 1–2 hàng trên cùng; tile nối liền ngang; tile lấp đẹp khi bị cắt còn 6 px.
6. Vật cản: phần nhìn thấy khớp hitbox; `OBS_STONE_BLOCK` mặt trên phẳng; `OBS_REED_CURTAIN` thấy rõ khe dash.
7. Không vi phạm danh sách cấm ở mục 3.3.
8. Batch R: tỉ lệ thân khớp `idle` khi xếp cạnh nhau trên cùng baseline; đúng số ô và `hit_frame`.

---

## 8. BÁO CÁO `MAP_REPORT_TT.md`

```
## Gate <n> — <ngày>
| Asset ID | Status | QA notes |
|---|---|---|
Mockup: ...
Xung đột với skill: ...
NEED_REDRAW / TODO_MISSING: ...
Câu hỏi cho team: ...
```

---

## 9. NGOÀI PHẠM VI
- Code tích hợp (Claude làm ở task TT-MAP-01).
- UI/HUD (icon tim, khung câu hỏi), portrait, hiệu ứng thời tiết động (mưa, chớp nhấp nháy).
- Mưa tên trên tường thành và cơ chế boss 3 giai đoạn.
- Cờ chiến thắng cắm trên cổng.
