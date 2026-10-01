# Prompt giao Codex — bộ tile ghép địa hình `TILESET_TT_TERRAIN`

Trạng thái: Codex giao 30/09, người dùng duyệt → **`IN_GAME`**, đã chép sang bản chạy (Codex chép, Claude
soát: trùng byte, đủ 12 vai trò, 64×48 khớp manifest) và kiểm trong game — xem
[REPORT_TT-TERRAIN-01.md](REPORT_TT-TERRAIN-01.md). (Claude soạn 30/09, task TT-TERRAIN-01.) Thay cho prompt tile sườn cũ
(`CODEX_PROMPT_TILESET_TERRAIN.md`, đã bỏ).

Màn 1–2 có địa hình **bậc đất cao/thấp + hố**, soạn bằng lưới ô 16 px. Team chốt (30/09): mặt đất dùng
**chung 1 bộ tile** cho mọi vùng/màn, và muốn một bộ tile **kiểu ghép khối** (góc/cạnh/thân/góc trong) để
ghép địa hình dễ. Hiện game vẽ tạm bằng tile Z1 của `TILESET_TT_GROUND` (cạnh bậc vuông, phủ dải bóng).

Code **đã sẵn sàng**: khi `maps_tt.json` có asset `TILESET_TT_TERRAIN`, engine tự ghép tile theo độ cao
từng cột (`terrainTileRole()` ở `render.js`), thay luôn tile mép hố cũ và lòng hố — không cần sửa code.
Soát ghép bằng **F2** (nhãn vai trò tile từng ô). Sau khi team duyệt: Claude chép PNG + JSON + `maps_tt.json`
sang `frontend/static/assets/images/trung-trac/maps-8bit/`.

Ảnh mẫu người dùng gửi (tileset stock 16×16 có watermark Shutterstock) **chỉ để tham khảo cách chia ô** —
**không** chép, không đồ lại nét, không đưa ảnh đó vào repo. Vẽ mới hoàn toàn theo art bible SUTA.

---

## PROMPT (dán nguyên văn cho Codex)

Làm theo `SUTA_TT_MAP_BRIEF.md` (art bible mục 3, tileset mục 5.3, output mục 6, QA mục 7, report mục 8).
Chỉ làm việc trong `assets/maps/trung-trac/`, không sửa code.

**Nhiệm vụ:** vẽ asset mới `TILESET_TT_TERRAIN` — bộ tile 16×16 **ghép khối đất** (kiểu tileset platformer:
góc, mép, thân, góc trong) dùng chung cho mọi vùng của chương Trưng Trắc. Chất liệu: **đất nện nâu + cỏ
làng**, cùng tông với tile vùng Z1 hiện có của `TILESET_TT_GROUND` (đặt cạnh nhau không lệch màu).

**Bối cảnh kỹ thuật (đã chốt trong code, không đổi):**
- Địa hình là các **cột đất đặc liền từ đáy lên** (không có bục lơ lửng): mỗi cột rộng 16 px, đỉnh ở
  y = 248 − N·16 (N = 0–3), thân kéo xuống tới đáy khung 270 (đáy khối luôn bị cắt → **không cần hàng đáy,
  góc dưới**). Hố = cột trống, lòng hố vẽ bằng `pit-top`/`pit-deep`.
- Engine chọn vai trò mỗi ô chỉ theo đỉnh cột đó và 2 cột bên cạnh:
  - hàng đỉnh: `surface`; bên trái thấp hơn → `corner-left`; bên phải thấp hơn → `corner-right`; cả 2 bên
    thấp hơn → `corner-single`.
  - thân, cao hơn cột bên cạnh (sườn lộ ra): `wall-left` / `wall-right` / `wall-single` (lộ cả 2 bên).
  - thân, **đúng hàng mặt cỏ của cột bên cạnh thấp hơn**: `inner-left` / `inner-right` (góc trong — cỏ của
    bậc thấp vắt vào chân vách bậc cao).
  - còn lại: `fill`.
  - Mép hố: cột đất cạnh hố dùng `corner-right` + `wall-right` (hố bên phải) hoặc `corner-left` +
    `wall-left` (hố bên trái), lặp tới đáy khung.
- Ví dụ đồi 2 bậc (mỗi ký hiệu 1 ô 16 px, hàng trên cùng y = 216):
  ```
  .    .    CL   S    S    CR   .    .
  CL   S    IL   F    F    IR   S    CR
  S    IL   F    F    F    F    IR   S
  F    F    F    F    F    F    F    F
  ```
  Mép hố: `S  CR | hố | CL  S` / `F  WR | hố | WL  F`.

**Contract (Source of Truth) — sheet 64×48, lưới 4 cột × 3 hàng, không gutter/margin:**

| (cột, hàng) | Vai trò | ID tile | Nội dung |
|---|---|---|---|
| (0,0) | `corner-left` | `TT_TERRAIN_CORNER_LEFT` | Mặt cỏ **bo qua góc trên-trái**, vài sợi cỏ rủ xuống mép trái; mép trái là vách đất **sáng** (sáng từ trên-trái) |
| (1,0) | `surface` | `TT_TERRAIN_SURFACE` | Mặt cỏ ngang, đất bên dưới; lặp ngang liền mạch |
| (2,0) | `corner-right` | `TT_TERRAIN_CORNER_RIGHT` | Như `corner-left` nhưng góc trên-phải, vách phải **tối** (trong bóng) — không lật nguyên xi |
| (3,0) | `corner-single` | `TT_TERRAIN_CORNER_SINGLE` | Đỉnh cột rộng 1 ô: cỏ bo cả 2 góc, vách trái sáng + vách phải tối |
| (0,1) | `wall-left` | `TT_TERRAIN_WALL_LEFT` | Thân đất, 2–3 px mép trái là vách sáng; lặp dọc liền mạch, nối liền đáy `corner-left` |
| (1,1) | `fill` | `TT_TERRAIN_FILL` | Thân đất đặc (sỏi, đá nhỏ); **lặp liền cả ngang lẫn dọc** |
| (2,1) | `wall-right` | `TT_TERRAIN_WALL_RIGHT` | Thân đất, 2–3 px mép phải là vách tối; lặp dọc liền mạch, nối liền đáy `corner-right` |
| (3,1) | `wall-single` | `TT_TERRAIN_WALL_SINGLE` | Thân cột rộng 1 ô: vách trái sáng + vách phải tối; lặp dọc |
| (0,2) | `inner-left` | `TT_TERRAIN_INNER_LEFT` | Như `fill` nhưng **góc trên-trái có mẩu cỏ** (4–6 px) — cỏ của bậc thấp bên trái vắt vào chân vách |
| (1,2) | `inner-right` | `TT_TERRAIN_INNER_RIGHT` | Như `fill`, mẩu cỏ ở **góc trên-phải** |
| (2,2) | `pit-top` | `TT_TERRAIN_PIT_TOP` | Lòng hố ngay dưới mặt đất: đất tối dần từ trên xuống theo bậc màu rời, 1–2 hàng trên là bóng; lặp ngang |
| (3,2) | `pit-deep` | `TT_TERRAIN_PIT_DEEP` | Phần sâu gần như tối hẳn; **6 hàng trên** khớp liền đáy `pit-top` (chỉ 6 px này hiện trong game) |

- Tile **đặc toàn bộ** (không trong suốt). Mặt cỏ của `surface`/`corner-*` cùng một độ cao trong ô để ghép
  ngang không lệch; phần cỏ nhô trên đỉnh ô (nếu có) vẫn nằm trong ô 16×16.
- Ghép phải liền mạch: `corner-left` → `surface`… → `corner-right` (ngang); `corner-*` → `wall-*` →
  `wall-*` (dọc); `wall-*`/`inner-*` cạnh `fill` (ngang); `surface` của bậc thấp → `inner-*` của bậc cao
  (mẩu cỏ nối liền mặt cỏ); `pit-top` → `pit-deep` (dọc).

**Kỹ thuật (mục 3.1):** pixel art 1×, khối màu phẳng, không gradient mịn, không dither nhiễu, không
anti-alias, không outline `#1A1414` (địa hình là nền); palette đất/cỏ mục 3.2; cấm magenta/hồng sen.

**Output:**
1. `tiles/TILESET_TT_TERRAIN/tileset_tt_terrain.png` (64×48).
2. `tiles/TILESET_TT_TERRAIN/tileset_tt_terrain.json`, cùng lược đồ `tileset_tt_ground.json`:
   `schema_version`, `id`, `file`, `tile_size` {16,16}, `sheet_size` {64,48}, `grid` {columns 4, rows 3,
   gutter 0, margin 0}, `tiles`: 12 mục `{id, column, row, region: "ALL", role, rect}`, ví dụ:
   ```json
   {"id": "TT_TERRAIN_CORNER_LEFT", "column": 0, "row": 0, "region": "ALL", "role": "corner-left", "rect": {"x": 0, "y": 0, "w": 16, "h": 16}}
   ```
3. `maps_tt.json`: thêm mục asset `TILESET_TT_TERRAIN` theo đúng định dạng mục `TILESET_TT_GROUND`
   (`file`, `metadata`, `w` 64, `h` 48, `status` `NORMALIZED`). Không sửa mục khác.
4. Mockup `mockups/mockup_terrain_tileset.png` (+ bản ×3): cảnh 480×270 ghép đúng cách engine như trên —
   mặt đất phẳng, gò 1 ô rộng 96 px, đồi 2 bậc (như ví dụ), 1 cột rộng 1 ô cao 2 ô, 1 hố 64 px — đặt cạnh
   `PLAYER_TRUNG_TRAC` idle đứng trên bậc; nền là `BG_TT_MID_VILLAGE`.
5. Cập nhật `MAP_REPORT_TT.md` (mục 8): bảng QA, `NEED_REDRAW`/`TODO_MISSING`, câu hỏi cho team.

**QA tự kiểm trước khi báo NORMALIZED:** sheet đúng 64×48, 12 ô; tile đặc; mọi phép ghép ở trên không lộ
khe/lệch màu ở ×1 và ×3; `fill` lặp 4×4 không thấy lưới; bậc đọc rõ là "gò đất" và hố đọc rõ là "hố đất".

Status tối đa `NORMALIZED`. Dừng lại chờ người duyệt, không làm asset khác.
