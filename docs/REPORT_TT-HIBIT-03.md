# REPORT TT-HIBIT-03 — Map 32-bit (hi-bit) chương Trưng Trắc

Ngày: 06/10/2026 • Trạng thái: **HOÀN THÀNH** — 25/25 asset map `IN_GAME`, test PASS. Task card:
[SUTA_TT_TASK_HIBIT_03.md](SUTA_TT_TASK_HIBIT_03.md) (nhật ký từng đợt mục 4b–4f), brief: [SUTA_TT_ART_BRIEF_32.md](../SUTA_TT_ART_BRIEF_32.md).

Cùng với TT-HIBIT-01 (sprite) và TT-HIBIT-02 (chân dung/icon): **mọi ảnh trong 3 màn chương Trưng Trắc đã là 32-bit ×4**, trừ
`EN_HAN_BOAT`, `EN_HAN_BASE` (không dùng trong màn).

## 1. Kết quả

| Đợt | Asset | Ảnh ×4 | `IN_GAME` | Prompt |
|---|---|---|---|---|
| C1 | 9 vật cản `OBS_*`, `ITEM_BINH_THU`, `PROP_STONE_PILLAR` (+2 ảnh trạng thái), `PROP_TT_QUIZ_STELE` (+active/done) | theo cỡ logic ×4 | 02/10 | `CODEX_PROMPT_32BIT_MAP_C1.md` (đã xoá) |
| C2 | `TILESET_TT_TERRAIN` (12 vai trò), `TILESET_TT_GROUND` (chỉ vùng Z1 — người dùng chốt Q1) | 256×192, 192×1280 | 03/10 | `CODEX_PROMPT_32BIT_MAP_C2.md` (đã xoá) |
| C3 | `PROP_LUYLAU_GATE`, `PROP_LUYLAU_GATE_OPEN`, `PROP_TT_VICTORY_FLAG` | 768×704, 384×128 | 03/10 | `CODEX_PROMPT_32BIT_MAP_C3.md` (đã xoá) |
| C4 | `BG_TT_SKY_DAY`, `BG_TT_SKY_STORM`, `BG_TT_FAR_HILLS`, 5 `BG_TT_MID_*` | 1920×1080, 3840×480, 3072×640 | 03/10 (chỗ nối sửa 06/10) | `CODEX_PROMPT_32BIT_MAP_C4.md` (đã xoá), `CODEX_PROMPT_32BIT_MAP_C4_MID_REDRAW.md` (đã xoá), `CODEX_PROMPT_32BIT_MAP_C4_SEAM.md` (đã xoá) |

Bảng màu môi trường `palette_map_32_tt.png`: **192 màu** (64 C1–C2, +35 C4a, +93 lớp giữa vẽ lại); vật tương tác ưu tiên bảng chương
(91 màu — cờ dùng hoàn toàn bảng chương). Mọi số trong `maps_tt.json` 32-bit vẫn là **pixel logic** của bản 8-bit trong game + `density: 4`;
gameplay (hitbox, `GROUND_Y`, lưới địa hình, parallax, vị trí cổng/cờ/bia) không đổi.

## 2. File code đã sửa (02/10, không đổi từ đó)

| File | Mục đích |
|---|---|
| `config.js` | `MAP_32BIT_ROOT` |
| `assets.js` | nạp manifest 32-bit; chọn bản **từng asset** (`IN_GAME` hoặc `?hibit=1`) khi `mapMismatch` = null + đúng cỡ ×density, không thì 8-bit + cảnh báo; `tileMetaMismatch` (tileset mặt đất chỉ so vùng `GROUND_TILE_REGION`); gắn `image.density` (cả ảnh `state_files`) |
| `render.js` | `drawMapImage()` + `mapWidth()/mapHeight()` thay mọi chỗ vẽ map (13 chỗ) và mọi chỗ đọc `image.width/height`; canvas hoà lớp giữa ở độ phân giải bộ đệm |
| `viewer.js` | mục map `ID [32-bit]` |
| `main.js` | log "map 32-bit đang dùng" |

Không đụng `physics.js`, `state.js`, `geometry.js`, manifest/ảnh 8-bit. Không có sửa ngoài phạm vi.

## 3. Test

**02/10 — bộ giả** (map 8-bit phóng ×4 nearest, đã xoá sau khi thử) — chi tiết task card mục 4b:

| # | Kết quả |
|---|---|
| TC1 không có `maps-32bit/` | PASS |
| TC2 bộ giả ×4 vs 8-bit, bộ đệm N = 4 | PASS — 0 pixel khác ở màn 1/2/3 (riêng hoà trời + đồi xa mờ dần lệch ≤ 1/255 do GPU) |
| TC3 vạch 1 px ảnh hiện lên canvas, kể cả vùng hoà | PASS |
| TC4 lệch contract / sai cỡ → giữ 8-bit + cảnh báo | PASS |
| TC5 trộn 8-bit / 32-bit | PASS |
| TC6 viewer | PASS — 16 mục `[32-bit]` |
| TC7 bộ nhớ | đo: ~156 MB (ước) |

**06/10 — chạy lại với bộ asset thật** (không cờ `?hibit`, `?debug=1`, server dev cục bộ):

| # | Kịch bản | Kết quả |
|---|---|---|
| R1 | Màn 1 / 2 / 3 nạp map | PASS — mọi asset map màn dùng đều bản 32-bit (density 4): màn 1 **25/25**, màn 2 23, màn 3 20 (chỉ nạp nền của màn); không cảnh báo |
| TC1 | Tạm đổi tên `maps-32bit/` → màn 2 | PASS — 23 ảnh map đều 8-bit, màn vẽ đầy đủ; đã đổi lại tên |
| TC4 + TC5 | Tạm sửa manifest game: `BG_TT_MID_FIELDS.w` 770, `PROP_LUYLAU_GATE.pivot.x` 90 → màn 1 | PASS — 2 asset giữ 8-bit + cảnh báo đúng lý do (`w 770, 8-bit 768`; `pivot {"x":90…}`), `BG_TT_MID_VILLAGE`, `PROP_LUYLAU_GATE_OPEN` vẫn 32-bit; đã chép lại manifest gốc (trùng byte), màn 1 lại 25/25 |
| TC6 | Viewer `?viewer=1` | PASS — 16 mục map `[32-bit]` (IN_GAME) |
| TC7 | Bộ nhớ ảnh giải nén (w×h×4, mọi ảnh trong `images`) | màn 1 **map 67,8 MB + sprite 95,4 MB = 163 MB**; màn 2 52,4 + 95,4; màn 3 29,9 + 95,4. Nạp xong ảnh: ~9,1 s / 8,5 s / 8,6 s trên máy dev → Phần D |

Kiểm bằng mắt trong game (ảnh chụp từng đợt, task card): decor sát mép cỏ, ghép bậc + mép hố, cổng đóng/mở + cờ trên nóc, 5 vùng lớp giữa, chỗ hoà
vùng, chỗ nối lặp đồng lúa/thành sau sửa.

## 4. Vấn đề asset trong quá trình (đã xử lý)

| Asset | Lỗi | Cách xử lý |
|---|---|---|
| 3 decor `TILESET_TT_GROUND` | chân cỏ cách đáy ô 8–9 px ảnh → lơ lửng ~2 px logic (người dùng phát hiện) | NORMALIZE dịch xuống, đáy = hàng 31 |
| `BG_TT_FAR_HILLS` | alpha 8-bit phóng ×4, 3 màu (pixel béo) | vẽ lại: 8 màu, đổi màu trên lưới 4 px 0,26 |
| 5 `BG_TT_MID_*` (bản đầu) | tách núi xa theo màu → 700–2 700 lỗ/lớp; bản sửa lấp lỗ bằng màu trời/nước → **người dùng thấy "khoảng xanh vỡ ảnh, không nét"** | **vẽ lại C4b-R** (người dùng chốt): bỏ núi xa, vẽ vật thể trên nền key, xoá nền chỉ bằng flood-fill từ mép, ≤ 64 màu/lớp, bố cục tự do; thử FIELDS trước |
| `BG_TT_MID_FIELDS` | cọc thu thuế vẽ thành dạng đèn đá Nhật/Trung | người dùng chọn: cọc gỗ đơn giản |
| `BG_TT_MID_FIELDS`, `_CITADEL` | chỗ lặp ngang lệch (người dùng phát hiện); sửa lần 1 lật gương → vạch dọc 1 px + đối xứng (FAIL) | sửa lần 2: vẽ mới dải nối — PASS |

**Bài học QA (đã ghi vào handoff):** Codex nhiều lần làm số đo "đạt" mà hình vẫn lỗi (cột 0 = cột cuối → "nối 0"; lật gương → mép giống nhau;
lấp lỗ → "0 lỗ"). Soát asset nền luôn kèm ảnh ở cỡ chơi thật + phóng to, và đo đúng hiện tượng (profile độ chênh cột qua chỗ nối, chỉ số soi
gương, lỗ kín, vụn, màu xanh trong vật).

## 5. Quyết định người dùng

Q1 chỉ vẽ vùng Z1 của `TILESET_TT_GROUND` (02/10) • nới bảng môi trường 64 → 128 (C4) → 192 (C4b-R) • lớp giữa bỏ núi xa, bố cục tự do, ≤ 64
màu, thử 1 lớp trước (03/10) • cọc thu thuế → cọc gỗ đơn giản (03/10) • `IN_GAME` từng đợt sau chơi thử.

## 6. Còn lại / TODO

- **NORMALIZE nhỏ (tuỳ người dùng):** mép miếng vá chỗ nối — FIELDS ngọn bụi dương xỉ cắt phẳng + mép ghép dọc x≈145; CITADEL vệt pixel kéo
  ngang ở mép tường đổ. Chỉ thấy khi phóng ×4.
- **Câu hỏi nội dung chưa chốt:** lều trại lớp thành dáng lều vải chữ A (có thể trông hiện đại); tường thành là các đoạn rời; lớp sông thấp, thưa.
- **Phần D (task riêng):** bộ nhớ ~163 MB + nạp ~9 s ở màn 1 trên máy dev — sprite nạp mọi asset chương ở mọi màn (95 MB); màn 3 vẫn nạp
  `BG_TT_FAR_HILLS` (~7 MB) dù bị ẩn dưới trời giông; cần nạp theo màn và đo trên điện thoại thật.
- Manifest **8-bit** ghi `OBS_FENCE_HIGH`, `OBS_BRIDGE` là `NORMALIZED` dù đã dùng trong màn 2 từ TT-L2-HARD — chỉ ảnh hưởng nhãn viewer; ngoài
  phạm vi task này.
- Chưa commit: toàn bộ code + tài liệu + ảnh đợt 32-bit; thư mục `assets/` (vùng làm việc Codex) chưa được git theo dõi — chờ người dùng quyết.
- Lỗi có sẵn ngoài phạm vi: `updateStartButton is not defined` ở `home.js`.
