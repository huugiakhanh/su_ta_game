# TT-HIBIT-03 — Map 32-bit (hi-bit) chương Trưng Trắc

Ngày: 02/10/2026 • Trạng thái: **HOÀN THÀNH 06/10** — 25/25 asset map `IN_GAME`, test chạy lại với asset thật PASS — report [REPORT_TT-HIBIT-03.md](REPORT_TT-HIBIT-03.md) — brief [SUTA_TT_ART_BRIEF_32.md](../SUTA_TT_ART_BRIEF_32.md), prompt `CODEX_PROMPT_32BIT_MAP_C1.md` (đã xoá)
Lộ trình 32-bit: sprite (TT-HIBIT-01, xong) → chân dung/icon (TT-HIBIT-02, xong) → **map (task này)**.

## 1. Mục tiêu

Đổi toàn bộ bộ môi trường trong `maps_tt.json` (25 asset) sang mật độ ×4 cho đồng bộ với sprite 32-bit, theo cùng nguyên
tắc đã dùng: **giữ nguyên pixel logic** (`GROUND_Y` 248, lưới địa hình 16 px, hitbox vật cản, vị trí cổng/cờ/bia, parallax),
chỉ thay ảnh; **thay từng asset** (bản 32-bit `IN_GAME` + khớp contract thì dùng, không thì giữ 8-bit); `?hibit=1` để duyệt.

| Nhóm | Asset | Cỡ logic → ảnh ×4 |
|---|---|---|
| Nền parallax (8) | `BG_TT_SKY_DAY`, `BG_TT_SKY_STORM` | 480×270 → 1920×1080 |
| | `BG_TT_FAR_HILLS` | 960×120 → 3840×480 |
| | `BG_TT_MID_VILLAGE/FIELDS/FOREST/RIVER/CITADEL` | 768×160 → 3072×640 |
| Tileset (2) | `TILESET_TT_GROUND` (60 tile, 5 vùng, decor) | 48×320 → 192×1280 |
| | `TILESET_TT_TERRAIN` (12 vai trò ghép địa hình) | 64×48 → 256×192 |
| Vật cản (9) | `OBS_FALLEN_BRANCH`, `OBS_STONE_BLOCK`, `OBS_REED_CURTAIN`, `OBS_FENCE_LOW`, `OBS_FENCE_HIGH`, `OBS_BAMBOO_SLOPE`, `OBS_SLIDE_BAR`, `OBS_BRIDGE`, `OBS_LOG_DRIFT` | ×4 |
| Vật phẩm / prop (6) | `ITEM_BINH_THU`, `PROP_STONE_PILLAR` (2 trạng thái), `PROP_TT_QUIZ_STELE` (active/done), `PROP_LUYLAU_GATE`, `PROP_LUYLAU_GATE_OPEN`, `PROP_TT_VICTORY_FLAG` | ×4 |

## 2. Thiết kế code

**Nguyên tắc:** mọi số trong `maps_tt.json` bản 32-bit (`w/h`, `frame_w/h`, `visible_bbox`, `pivot`, `flag_attach`, rect tile
trong `tileset_*.json`) vẫn ghi **pixel logic** như bản 8-bit; thêm `density: 4`. Ảnh nạp được gắn mật độ (`image.density`),
mọi chỗ vẽ đi qua **một hàm chung** nhân toạ độ nguồn với mật độ — không phải đổi cấu trúc `images.maps`.

### 2.1 `config.js`
- `MAP_32BIT_ROOT = '/static/assets/images/trung-trac/maps-32bit/'` (manifest cùng tên `maps_tt.json`).

### 2.2 `assets.js` — nạp + chọn bản
- `loadMapAssets()` nạp thêm manifest 32-bit; với **từng asset** (nền, tileset, prop/vật cản): dùng bản 32-bit khi
  `status: IN_GAME` (hoặc `?hibit=1`) **và** `mapMismatch(base, hibit)` = null **và** ảnh đúng cỡ `w×density × h×density`;
  không thì bản 8-bit + `console.warn` lý do (như sprite).
- `mapMismatch`: so `w`, `h`, `frame_w`, `frame_h`, `frames`, `fps`, `frame_states`, `visible_bbox`, `pivot`, `flag_attach`,
  `anchor`, tập khoá `state_files`; density nguyên ≥ 1.
- Tileset: metadata (`tileset_tt_*.json`) của bản 32-bit **phải trùng bản 8-bit** về `tile_size` và tập (vai trò, vùng, rect)
  — rect vẫn logic. Lệch → giữ 8-bit.
- Gắn `image.density` cho mọi ảnh nạp từ `maps-32bit/` (kể cả ảnh `state_files`); `checkSize()` so với cỡ ×density.
- Nền chỉ nạp các vùng của màn đang chơi (`backdropIds()` — đã có), nên ảnh nền lớn không nạp thừa.

### 2.3 `render.js` — vẽ
- Hàm chung `drawMapImage(target, image, sx, sy, sw, sh, dx, dy, dw = sw, dh = sh)`: nguồn × `image.density`, đích giữ
  logic; bật nội suy khi `backingScale < density` (giống `drawSprite8`). Hàm phụ `mapWidth(image)` / `mapHeight(image)` = cỡ
  logic (thay cho `image.width/height`).
- Thay **13 chỗ** `drawImage` của map + mọi chỗ đọc `image.width/height`:
  `drawTiledLayer` (lặp theo `mapWidth`), đồi xa, lớp giữa, `drawTileSegments`, `drawGroundDecor`, `drawGroundAutotile`,
  `drawRaisedColumn`, mép hố trong `drawGround`, `drawFinishGate`, `drawVictoryFlag`, `drawQuizSteles`, `drawBooks`,
  `drawObstacles` (cả cột đá nhiều ô).
- **Canvas hoà lớp giữa** (`blendContext`, `'lighter'`): hiện ở cỡ logic → làm mất chi tiết ảnh 32-bit. Đổi sang cỡ
  `VIEW_W × backingScale` + `setTransform(backingScale)`, vẽ về khung logic.
- Toạ độ vẽ vẫn làm tròn theo pixel logic sau khi trừ camera (như hiện nay — nền không rung dưới pixel).

### 2.4 `viewer.js`
- `mapAssetEntries` đọc thêm manifest 32-bit → mục `ID [32-bit]` cho vật cản/item/prop (vẽ theo density như sprite).

### 2.5 Không đụng
`physics.js`, `state.js`, `geometry.js` (hitbox, địa hình, va chạm), `maps_tt.json` bản 8-bit, ảnh 8-bit.

## 3. Thứ tự Codex (brief mới `SUTA_TT_MAP_BRIEF_32.md`, kế thừa `SUTA_TT_MAP_BRIEF.md`)

| Đợt | Asset | Lý do |
|---|---|---|
| C1 | 9 vật cản + bình thư + cột đá + bia đá | đứng sát nhân vật 32-bit — lệch phong cách lộ rõ nhất |
| C2 | `TILESET_TT_GROUND` + `TILESET_TT_TERRAIN` | ghép tile phải khít; thử bằng màn 2 (bậc + hố) |
| C3 | cổng đóng/mở + cờ | cutscene màn 3 |
| C4 | 8 lớp nền parallax | ảnh lớn nhất; vẽ sau để khớp tông với tile/vật cản đã duyệt |

Mỗi đợt: Codex vẽ trong `assets/maps-32bit/` → Claude soát → chép sang `frontend/.../maps-32bit/` → người dùng chơi thử
`?hibit=1` → `IN_GAME`. Code (mục 2) làm xong **trước** khi giao C1.

## 4. Test case

| # | Kịch bản | Kỳ vọng |
|---|---|---|
| TC1 | Không có `maps-32bit/` | Màn 1–3 vẽ y như hiện nay |
| TC2 | **Bộ giả** = toàn bộ map 8-bit phóng ×4 nearest (không vạch), `?hibit=1`, bộ đệm N = 4 | Ảnh canvas **trùng từng pixel** với bản 8-bit ở cùng vị trí camera (màn 1 nhiều vùng, màn 2 có bậc + hố, màn 3 cổng mở + cờ) — chứng minh mọi chỗ vẽ đã quy đổi đúng |
| TC3 | Bộ giả có vạch 1 px ảnh trên mỗi asset | Vạch hiện trên canvas (chi tiết ×4 lên tới màn hình), kể cả vùng hoà lớp giữa |
| TC4 | Asset 32-bit lệch contract (`visible_bbox`, `pivot`, rect tile…) hoặc sai cỡ ảnh | Giữ 8-bit + cảnh báo |
| TC5 | Trộn: chỉ vài asset 32-bit | Asset khác vẫn 8-bit, không lệch vị trí |
| TC6 | Viewer | Có mục map `[32-bit]` |
| TC7 | Bộ nhớ: màn 1 với bộ giả đủ ×4 (DevTools) | Ghi số đo; nếu quá nặng cho điện thoại → đề xuất nạp theo màn/vùng |

Bộ giả tạo trong `frontend/.../maps-32bit/` chỉ để thử, **xoá sau khi thử** (không commit).

## 4b. Kết quả test (02/10/2026, bộ giả = map 8-bit ×4 nearest, đã xoá sau khi thử)

| # | Kết quả |
|---|---|
| TC1 | PASS — không có `maps-32bit/`: màn 2 nạp đủ, không ảnh nào có density (1 dòng 404 manifest như sprite) |
| TC2 | PASS — bộ đệm N = 4 (khung 1920×1080), vẽ cùng khung 2 lần (ảnh ×4 vs ảnh 8-bit): **0 pixel khác** ở màn 1 (làng + bia/sách, hoà Z1→Z2, cổng), màn 2 (gò, đồi 2 bậc, hố hở, hố có cầu, bia đã/chưa hỏi, **cả 9 loại vật cản**), màn 3 (cột đá lành/nứt, cổng đóng, cổng mở + cờ). Riêng hoà trời ngày→giông + đồi xa mờ dần (vẽ alpha một phần): lệch tối đa **1/255** do làm tròn GPU — không thấy được; lớp giữa hoà qua canvas phụ trùng 0 pixel |
| TC3 | PASS — vạch 1 px ảnh trên lớp giữa làng: hiện trên canvas (2112 px); trong vùng hoà Z1→Z2: 2140 px khác, 1962 px nằm lệch lưới logic → chi tiết dưới 1 px logic còn nguyên qua canvas hoà |
| TC4 | PASS — sai cỡ ảnh lớp giữa đồng lúa, bộ ghép địa hình thiếu `inner-left`, rào thấp lệch `visible_bbox` → cả 3 giữ 8-bit + cảnh báo đúng lý do |
| TC5 | PASS — cùng lượt TC4: 3 asset 8-bit, phần còn lại 32-bit |
| TC6 | PASS — viewer có 16 mục map `[32-bit]` (vật cản/item/prop), báo cỡ strip cần có |
| TC7 | Đo (ước tính giải nén) màn 1 với bộ giả gần đủ ×4: **map ~61 MB + sprite ~95 MB = ~156 MB** — xem mục 5 |

Tileset mặt đất 32-bit chỉ có vùng Z1 (Q1): được nhận, `regions` chỉ còn Z1 — đúng ý đồ.

## 4c. Đợt C1 (02/10/2026)

Codex giao 12 asset (9 vật cản, bình thư, cột đá, bia đá) + `palette_map_32_tt.png` (64 màu môi trường) — report
`assets/maps-32bit/trung-trac/MAP_REPORT_TT_32.md`. Claude soát độc lập: manifest trùng bản 8-bit (trừ `status`/`density`/
ghi chú), khối `stage` giống; ảnh chính + ảnh trạng thái đúng cỡ ×4, alpha 0/255, 15–31 màu/asset, khối 4×4 đồng màu ≤ 3 %;
3 vật có `visible_bbox` (cây đổ, đá, màn lau) trùng **0 px** — PASS. Đã chép 16 file + manifest vào game; màn 2
`?debug=1&hibit=1`: engine nhận cả 12 asset 32-bit (cột đá/bia cả ảnh trạng thái), nền/tile/cổng vẫn 8-bit.
Codex nêu: bình thư ở 16×16 logic còn hơi nhỏ trên nền — người dùng xem khi chơi thử. Người dùng chơi thử ổn (02/10) →
`status: IN_GAME` cho 12 asset ở cả 2 manifest; không cờ `?hibit`: màn 3 nạp 12 vật thể bản 32-bit, cổng/cờ vẫn 8-bit.

**Lệch bản nguồn / bản game (phát hiện khi soạn C2):** `assets/maps/trung-trac/maps_tt.json` khác bản game
`frontend/.../maps-8bit/maps_tt.json` ở `TILESET_TT_GROUND.w` (80 vs 48 — nguồn thêm 4 tile góc/vách Z1 chưa từng chép vào game,
không dùng vì bậc đất vẽ bằng `TILESET_TT_TERRAIN`) và `PROP_LUYLAU_GATE_OPEN.flag_attach` ((166,31) vs (94,10) — team 27/09). Engine
so với bản game → brief 32-bit đã sửa: luôn lấy số **bản trong game**. Không sửa 2 manifest 8-bit (ngoài phạm vi).

## 4d. Đợt C2 (03/10/2026)

Codex giao `TILESET_TT_TERRAIN` (256×192, 12 vai trò) + `TILESET_TT_GROUND` vùng Z1 (192×1280, 12 tile) theo
`CODEX_PROMPT_32BIT_MAP_C2.md` (đã xoá); không thêm màu (bảng môi trường 64). Claude soát: manifest trùng **bản game**
(w 48 — không phải 80 của bản nguồn), ảnh đúng cỡ ×4, 30 màu/sheet; metadata đủ 12 tile Z1 / 12 vai trò, rect logic, `tile_size` trùng,
không thừa; tile địa hình đặc 100 %; `left-edge` nửa trái đặc / nửa phải trong suốt, `right-edge` ngược lại; decor nền trong suốt — PASS.
Đã chép vào game; màn 2 `?debug=1&hibit=1`: engine nhận cả 2 tileset (regions chỉ Z1, 3 decor); ảnh chụp đồi 2 bậc chunk 2 + hố hở
chunk 4: mặt cỏ/góc/vách ghép liền, mép hố đúng. Codex lưu ý: `fill` lặp dài có thể lộ nhịp 64 px — xem khi chơi thử.

**Lỗi asset (người dùng báo 03/10 — decor không sát mặt đất):** đo 3 decor 32-bit: hàng có nội dung thấp nhất 22/23/22 trong ô 64×32 →
trống **8–9 px ảnh (≈ 2 px logic)** dưới chân; bản 8-bit chạm đáy ô (0 px). `drawGroundDecor()` đặt đáy ô decor = mép cỏ (`topY − decor.h`),
nên cỏ lơ lửng ~2 px. Code đúng, asset lệch contract C2 ("đáy chạm đáy ô"). Đề xuất **NORMALIZE** (dịch hình xuống, không vẽ lại) — prompt sửa
cuối `CODEX_PROMPT_32BIT_MAP_C2.md` (đã xoá). C2 giữ `NORMALIZED` tới khi sửa xong.

**Codex sửa decor (03/10) — Claude soát lại PASS:** hàng thấp nhất 3 decor = **31/31/31** (pixel đặc ở hàng đáy 17/13/50); hình cũ giữ
nguyên 100 % chỉ dịch xuống 9/8/9 px ảnh (không co giãn, không cắt ngọn), thêm 25/18/63 px chân cùng màu gốc; khác biệt với bản trước
chỉ nằm trong dải decor (0,192)–(192,224); vẫn alpha 0/255, 30 màu; `tileset_tt_ground.json`, `maps_tt.json`, `TILESET_TT_TERRAIN`
không đổi. Đã chép sheet vào game; `?debug=1&hibit=1` màn 2: console "map 32-bit đang dùng" có cả 2 tileset, không cảnh báo, decor sát
mép cỏ. Người dùng chơi thử, báo chuyển **`IN_GAME`** (03/10) — đã đổi `status` 2 tileset ở cả 2 manifest; không `?hibit=1` engine
vẫn nạp cả 2 tileset 32-bit.

## 5. Rủi ro / ghi chú

- **Bộ nhớ (TC7):** màn 1 ~156 MB ảnh giải nén khi đủ ×4 (map ~61, sprite ~95). Sprite hiện nạp **mọi** asset của chương ở mọi
  màn (kể cả chiến xa màn 3 ở màn 1) — đề xuất (task riêng, Phần D): mỗi màn chỉ nạp sprite/prop nó dùng; ước giảm còn
  ~90–110 MB ở màn 1. Cần đo trên điện thoại thật trước khi phát hành.
- Bộ đệm N = 3 (màn 720p) thu nhỏ ảnh ×4 có nội suy — nền hơi mềm hơn sprite? Kiểm bằng mắt khi chơi thử.
- `tileset_tt_ground.json` có 5 vùng × 12 tile nhưng game chỉ dùng vùng `Z1` (`GROUND_TILE_REGION`) + decor — Codex vẫn vẽ đủ
  để giữ contract, hoặc team quyết chỉ vẽ Z1 (câu hỏi Q1).

## 6. Câu hỏi team

- **Q1 (người dùng chốt 02/10): chỉ vẽ vùng Z1** của `TILESET_TT_GROUND` (vùng game dùng — `GROUND_TILE_REGION`) + decor +
  tile hố dự phòng. Bản 32-bit: metadata chỉ có tile vùng Z1; engine chỉ so contract vùng Z1 (mọi tile Z1 bản 8-bit phải có,
  cùng vai trò + rect logic).

## 4e. Đợt C3 (03/10/2026)

Prompt `CODEX_PROMPT_32BIT_MAP_C3.md` (đã xoá). Claude soát độc lập — PASS:
- `PROP_LUYLAU_GATE`/`_OPEN` 768×704, `PROP_TT_VICTORY_FLAG` 384×128 (4 ô 96×128); alpha 0/255; mỗi asset 32 màu (2 ảnh cổng chung 32 màu);
  không magenta; khối 4×4 đồng màu 5 % / 1 % (không pixel béo).
- Đóng/mở khác nhau chỉ trong (251,386)–(518,702) ảnh = vùng cửa; lòng cổng (248..517, 386..703) trong suốt, nền cổng đục; ảnh mở không
  có cờ.
- Cờ: cán giống hệt ở 4 ô, hàng thấp nhất 123 (cột 5); đặt tại `flag_attach` (376,40) → chân cán y = 35 ảnh, ngói nóc đục từ y = 36 → chạm mái.
- Manifest: 3 mục trùng bản game trừ `status`/`density`/`qa_notes`; 14 mục C1/C2 giữ `IN_GAME`.
- Đã chép 3 PNG + manifest vào game. Màn 3 `?debug=1&hibit=1`: console "map 32-bit đang dùng" có cả 3 asset, không cảnh báo; ảnh chụp cổng
  đóng (đáy ở mép cỏ) và `gateOpen` + cờ trên nóc mái, nhìn xuyên lòng cổng thấy lớp giữa thành.
- Câu hỏi Codex (độ tương phản cổng sau boss/nhân vật): mockup + ảnh trong game nhân vật vẫn nổi rõ.
- Người dùng chơi thử, báo chuyển **`IN_GAME`** (03/10) — đã đổi `status` 3 asset ở cả 2 manifest (17/17 mục `IN_GAME`); không `?hibit=1`
  engine vẫn nạp cả 3.

## 4f. Đợt C4 (03/10/2026)

Prompt `CODEX_PROMPT_32BIT_MAP_C4.md` (đã xoá); người dùng chốt nới bảng môi trường lên 128 màu. Codex giao cả C4a + C4b
1 lượt. Claude soát (chi tiết + số đo ở mục "Kết quả soát C4" trong prompt):
- `BG_TT_SKY_DAY`/`STORM`: PASS — đã chép vào game, bản game `maps_tt.json` thêm 2 mục này (`NORMALIZED`); màn 2 `?hibit=1` engine nhận.
- `BG_TT_FAR_HILLS`: **NEED_REDRAW** — alpha 8-bit phóng ×4, 3 màu phẳng (pixel béo, 46 % đổi màu trên lưới 4 px).
- 5 `BG_TT_MID_*`: **NEED_REDRAW** (sửa tách lớp) — xoá núi xa theo màu toàn ảnh làm thủng 700–2 700 lỗ kín/lớp (bản 8-bit 2–142) + 500–2 000
  vụn; lớp thành còn mảng núi sót. Chưa chép vào game.
- Bảng màu 128/128, 64 màu đầu y nguyên; manifest 8 mục đúng contract.
- Prompt sửa: cuối file prompt C4 — chờ người dùng giao Codex.

**Codex sửa C4 (03/10) — Claude soát lại PASS:**
- `BG_TT_FAR_HILLS`: 8 màu, chỗ đổi màu trên lưới 4 px 0,26/0,25 (vẽ thật ×4 — trước 0,46), alpha 0/255, đáy đục, nối 0.
- 5 lớp giữa: lỗ kín 17 / 74 / 133 / 9 / 2 (bản 8-bit ×4: 17 / 80 / 142 / 9 / 2), vụn < 64 px 2 / 0 / 0 / 0 / 0; lớp thành hết mảng núi sót;
  vẫn ≤ 48 màu, alpha 0/255, đáy đục, nối 0, mọi màu thuộc bảng; 2 ảnh trời không đổi.
- Thẩm mỹ (không phải lỗi contract): lỗ cũ ở chòi canh đồng lúa, cọc + thuyền bến sông được lấp bằng màu xanh nước/trời → đốm xanh nhạt khi
  phóng to; ở cỡ chơi thật (ảnh chụp màn 2 chunk 3) khó thấy — để người dùng quyết khi chơi thử.
- Đã chép 6 ảnh + manifest (25 mục; 8 nền `NORMALIZED`) vào game. Màn 2 `?debug=1&hibit=1`: `images.maps.layers` có trời, đồi xa, 4 lớp giữa
  đều 32-bit (density 4), không cảnh báo. (Lần nạp đầu trình duyệt dùng `maps_tt.json` cũ trong cache — nạp lại là đúng.)

**Người dùng chơi thử C4 (03/10): lớp giữa "có những khoảng xanh làm vỡ ảnh, không nét" → yêu cầu vẽ lại 5 lớp giữa (C4b-R).** Chốt: bỏ dải
núi/rừng xa khỏi lớp giữa; thử `BG_TT_MID_FIELDS` trước rồi mới 4 lớp còn lại; ≤ 64 màu/ảnh, bảng môi trường 192 (giữ 99 màu đầu, thay 29 màu
C4b cũ — không asset nào khác dùng); bố cục tự do (không bắt khớp bản 8-bit). Nguyên nhân gốc ghi trong prompt
`CODEX_PROMPT_32BIT_MAP_C4_MID_REDRAW.md` (đã xoá): ảnh nguồn có trời + núi phía sau rồi cắt ra. Bản lỗi vẫn
nằm trong game ở `NORMALIZED` (chỉ hiện với `?hibit=1`).

**C4b-R lượt 1 — `BG_TT_MID_FIELDS` (Codex 03/10) — Claude soát PASS:** 3072×640, alpha 0/255, 64 màu (đều trong bảng), nối 0, hàng đáy đục,
không màu magenta; raw trên nền key không có trời/núi; 222 vùng trong suốt kín (135 dưới 16 px — khe tàu lá cọ, gầm chòi) và 236 cụm rời
(ngọn cỏ/mạ) — xem ảnh: chi tiết có chủ đích, không đốm xanh. Bảng môi trường 140/192: 99 màu đầu y nguyên, 29 màu C4b cũ đã bỏ (4 lớp giữa
cũ trong game còn dùng chúng — sẽ được thay ở lượt 2; mọi asset khác vẫn đủ màu). Đã chép ảnh + manifest vào game; màn 2 `?debug=1&hibit=1`:
`images.maps.layers.BG_TT_MID_FIELDS` 3072 px density 4, ảnh chụp sạch.
**Câu hỏi nội dung (chờ người dùng/team):** "cọc thu thuế không chữ" được vẽ thành trụ có mái chóp + hộp trên đỉnh — trông giống đèn đá kiểu
Nhật/Trung, có thể không hợp năm 40 SCN.
Người dùng duyệt lượt 1 (03/10): **đổi cọc thu thuế thành cọc gỗ đơn giản** (gộp vào lượt 2). Prompt lượt 2 đã viết trong file prompt C4b-R.

**C4b-R lượt 2 (Codex 03/10) — Claude soát PASS:**
- 4 lớp mới (VILLAGE, FOREST, RIVER, CITADEL) + FIELDS: 3072×640, alpha 0/255, mỗi lớp 64 màu (đều trong bảng), không magenta, nối 0, hàng đáy
  đục; vùng trong suốt kín 318 / 377 / 20 / 115 (FIELDS 220) — xem ảnh: gầm nhà sàn, khe tán/rễ, khe lau, lỗ châu mai, không đốm xanh.
- FIELDS: khác lượt 1 chỉ trong (2052,300)–(2183,500) = cọc thu thuế, nay là cọc gỗ vạt đầu buộc dây, kê đá — đúng yêu cầu người dùng.
- Bảng môi trường 192/192 (99 + 40 + 53 màu); mọi asset map 32-bit trong game vẫn đủ màu.
- Ảnh hoà 4 cặp vùng không thấy vỡ; mockup ×3 cả 5 vùng sạch. Codex ghi đã đặt một dải đất/cỏ sinh riêng **phía sau** tranh ở phần đáy (22 564 px
  ở VILLAGE) để nối độ cao đất — không phải lấp lỗ trong vật.
- Đã chép 5 ảnh + manifest vào game. Màn 1 `?debug=1&hibit=1`: `images.maps.layers` đủ 8 nền density 4; ảnh chụp vùng sông và vùng thành (cổng C3)
  sạch, không cảnh báo.
- Câu hỏi khi duyệt: lều trại lớp thành dáng lều vải chữ A; tường thành là các đoạn rời; lớp sông thấp và thưa.

Người dùng chơi thử, báo chuyển **C4 sang `IN_GAME`** (03/10) — đã đổi 8 mục `BG_*` ở cả 2 manifest (25/25 `IN_GAME`). Không `?hibit=1`, màn 1
nạp đủ 8 nền density 4 (`images.maps.layers`); thời gian nạp ảnh map màn 1 ~10 s trên máy dev — việc của Phần D.

**Lỗi chỗ nối lặp (người dùng chơi thử 06/10):** đoạn ruộng lúa có chỗ nối lệch = chỗ lặp ngang của `BG_TT_MID_FIELDS`; `BG_TT_MID_CITADEL` cũng lệch
(Z5 màn 1). QA trước báo "nối 0" vì Codex làm cột 0 trùng cột cuối — phép đo không phát hiện nội dung đứt sát mép. Đề xuất **NORMALIZE**: dịch vòng nửa ảnh,
vẽ lại dải quanh chỗ nối, dịch lại — prompt `CODEX_PROMPT_32BIT_MAP_C4_SEAM.md` (đã xoá). Hai ảnh vẫn `IN_GAME` (lỗi nhìn thấy nhưng không
ảnh hưởng gameplay) tới khi có bản sửa.
Sửa chỗ nối lần 1 (Codex 06/10) — Claude soát **FAIL**: dải nối làm bằng lật gương (độ chênh cột qua chỗ nối đối xứng tuyệt đối), sinh vạch dọc 1 px
(132.7 ≈ 2× p95) + hình đối xứng + mảnh cỏ lơ lửng; không chép vào game. Prompt sửa lần 2 trong file prompt chỗ nối.
Sửa chỗ nối lần 2 (Codex 06/10) — Claude soát **PASS**: chỉ đổi trong dải ~140 px mỗi mép (ngoài dải trùng bản trước), 64 màu trong bảng, alpha
0/255, đáy đục; profile độ chênh cột qua chỗ nối bình thường (FIELDS 17.9–47.5, CITADEL 14.4–29.2; p95 68.6 / 39.2 — đơn vị tổng 4 kênh); không
đối xứng gương (soi gương 150.2 / 134.0 > ngẫu nhiên 128.9 / 105.2). Mockup ×3 không thấy chỗ nối. Lỗi nhỏ còn lại ở mép miếng vá: FIELDS bụi dương
xỉ cắt phẳng ngọn + mép dọc x≈145 (cột chênh 204.6 > đỉnh thường ~110); CITADEL vệt pixel kéo ngang ở mép tường đổ — gần như không thấy ở cỡ chơi
thật. Đã chép 2 ảnh + manifest vào game (vẫn `IN_GAME`); màn 2 `?debug=1` engine nạp bản mới.

