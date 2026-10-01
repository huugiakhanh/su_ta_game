# Prompt giao Codex — tile lòng hố cho `TILESET_TT_GROUND`

Trạng thái: Codex giao 29/09 (10 tile `NORMALIZED`, chỉ 10 ô trống thay đổi, sheet vẫn 48×320) — **đã tích
hợp**: chép `tileset_tt_ground.png` + `.json` sang bản chạy; `drawHoles()` dùng tile thật (đã kiểm tra hố
chunk 4 vùng Z3 và hố có cầu chunk 7 vùng Z4). Team đã duyệt 29/09 → `IN_GAME` (trạng thái nằm ở cấp
`TILESET_TT_GROUND` trong `maps_tt.json`, vốn đã là `IN_GAME`; tile không có trường status riêng).
Ghi chú gốc: Hố hở ở màn 2 (chunk 4, vùng Z3 rừng; chunk 7, vùng Z4 bến sông, có
cầu bắc qua) hiện được **vẽ tạm bằng code**: dùng tile `fill` của vùng phủ các dải tối dần (`drawHoles()` ở
`render.js`). Tileset chỉ có `surface`/`fill`/`left-edge`/`right-edge`/`decoration`, thiếu phần lòng hố.

Code **đã sẵn sàng**: khi vùng có đủ tile vai trò `pit-top` + `pit-deep`, `drawHoles()` tự vẽ tile đó thay cho
bản tạm, không cần sửa code. Sau khi team duyệt: Claude chép `tileset_tt_ground.png` + `.json` sang
`frontend/static/assets/images/trung-trac/maps-8bit/tiles/TILESET_TT_GROUND/`.

---

## PROMPT (dán nguyên văn cho Codex)

Làm theo `SUTA_TT_MAP_BRIEF.md` (art bible mục 3, tileset mục 5.3, output mục 6, QA mục 7, report mục 8).
Chỉ làm việc trong `assets/maps/trung-trac/`, không sửa code.

**Nhiệm vụ:** bổ sung vào `TILESET_TT_GROUND` 2 tile **lòng hố** cho **mỗi vùng** (Z1, Z2, Z3, Z4, Z5), để
engine vẽ bên trong hố thay cho khối tối tạm. Ưu tiên **P0: Z3 và Z4** (đang có hố trong game), P1: Z1,
Z2, Z5.

**Bối cảnh kỹ thuật (đã chốt trong code, không đổi):**
- Mặt đất lát tile 16×16, `GROUND_Y` = 248. Dải đất chỉ cao **22 px** tới đáy khung (tile mặt 248–264 +
  6 px tile dưới 264–270).
- Hố là một khoảng trống ngang (bội số 16 px, hiện 64 px và 96 px). Mép hố đã có tile `left-edge` /
  `right-edge` (nửa đặc, nửa trong suốt — đất kết thúc đúng mép hố).
- Trong hố engine vẽ: hàng trên (y 248–264) = tile `pit-top`, hàng dưới (y 264–280, chỉ thấy 6 px trên
  cùng) = tile `pit-deep`, lặp ngang theo lưới 16 px suốt bề rộng hố. Biến thể chọn tất định theo cột.

**Contract (Source of Truth):**

| Vai trò | Ô trong sheet (column, row) | ID tile | Nội dung |
|---|---|---|---|
| `pit-top` | (2, start_row + 1) | `TT_<Zx>_PIT_TOP` | Lòng hố ngay dưới mép cỏ: vách đất của vùng nhìn vào trong, **tối dần từ trên xuống**; 1–2 hàng trên cùng là bóng đổ của mép cỏ; vài rễ cây / sỏi / rêu nhô ra theo vùng |
| `pit-deep` | (2, start_row + 2) | `TT_<Zx>_PIT_DEEP` | Phần sâu: gần như tối hẳn, chỉ còn vài đốm đất rất tối. **6 hàng trên cùng** phải khớp liền với đáy `pit-top` (chỉ 6 px này hiện trong game) |

- `start_row` theo `region_layout` trong `tileset_tt_ground.json` (Z1 = 0, Z3 = 4, Z5 = 8, Z2 = 12, Z4 = 16).
  Hai ô này **đang trống** (`unused_cells`), nên **không đổi cỡ sheet** (48×320) và **không động tới ô
  nào khác**.
- Tile 16×16, **không trong suốt** (đặc toàn bộ), **nối liền ngang** với chính nó (ghép 4 ô cạnh nhau
  không thấy đường nối), `pit-top` nối liền dọc với `pit-deep`.
- Ghép với `left-edge` / `right-edge` của cùng vùng phải liền mạch: phần đất đặc của tile mép tiếp xúc lòng
  hố như vách hố (sáng từ trên-trái → vách phải của lòng hố sáng hơn vách trái một chút là được, nhưng tile
  lặp ngang nên không vẽ vách cố định trong tile).

**Chất liệu theo vùng** (khớp tile `fill` cùng vùng, tối hơn nhiều):
- Z1 làng: đất nện nâu, sỏi nhỏ.
- Z2 đồng lúa: đất bùn bờ ruộng, rơm vụn.
- Z3 rừng: đất mùn tối, **rễ cây** nhô ngang từ vách.
- Z4 bến sông: bùn cát ướt, có thể thoáng **mặt nước tối** ở đáy `pit-top` / trong `pit-deep`.
- Z5 Luy Lâu: đất đỏ nện tối.

**Kỹ thuật (mục 3.1):** pixel art 1×, khối màu phẳng, tối dần bằng **các bậc màu rời** (không gradient
mịn, không dither nhiễu), không anti-alias, không outline `#1A1414` (lòng hố là nền, không phải vật tương
tác); dùng palette đất mục 3.2 và các tông tối hơn của chúng; không đen tuyền `#000000` mảng lớn; cấm
magenta/hồng sen.

**Output:**
1. Cập nhật `tiles/TILESET_TT_GROUND/tileset_tt_ground.png` (vẽ vào đúng các ô trống nêu trên).
2. Cập nhật `tiles/TILESET_TT_GROUND/tileset_tt_ground.json`: thêm 10 mục tile (mỗi vùng 2 mục) theo đúng định
   dạng mục hiện có, ví dụ Z3:
   ```json
   {"id": "TT_Z3_PIT_TOP", "column": 2, "row": 5, "region": "Z3", "role": "pit-top", "rect": {"x": 32, "y": 80, "w": 16, "h": 16}},
   {"id": "TT_Z3_PIT_DEEP", "column": 2, "row": 6, "region": "Z3", "role": "pit-deep", "rect": {"x": 32, "y": 96, "w": 16, "h": 16}}
   ```
   và bỏ 2 ô tương ứng khỏi `unused_cells`. Không sửa mục tile khác.
3. Mockup `mockups/mockup_pit_tiles.png` (+ bản ×3): mỗi vùng 1 cảnh 480×270 với hố 64 px (và 1 hố 96 px có
   `OBS_BRIDGE` bắc qua ở Z4), gồm `surface`/`fill` hai bên, `left-edge`/`right-edge`, `pit-top`/`pit-deep`
   trong hố — đúng cách engine ghép (hàng dưới chỉ thấy 6 px), cạnh `PLAYER_TRUNG_TRAC` idle.
4. Cập nhật `MAP_REPORT_TT.md` (mục 8): bảng QA, xung đột với skill, `NEED_REDRAW`/`TODO_MISSING`, câu hỏi
   cho team.

**QA tự kiểm trước khi báo NORMALIZED:** sheet vẫn 48×320; chỉ 10 ô mới thay đổi (so sánh pixel với sheet
cũ); tile đặc, nối liền ngang khi ghép 4 ô; `pit-top` → `pit-deep` liền dọc; ghép với tile mép không lộ
khe; hố đọc rõ là "hố đất" (không phải khối đen) ở ×1 và ×3 trên cả 5 vùng.

Status tối đa `NORMALIZED`. Dừng lại chờ người duyệt, không làm asset khác.
