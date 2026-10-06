# SỬ TA — CHƯƠNG TRƯNG TRẮC
# ART BRIEF 32-BIT (HI-BIT) CHO CODEX (agent-sprite-forge / $generate2dsprite, $generate2dmap)

Version 2.0 • 06/10/2026 • Gộp 4 brief cũ (`SUTA_TT_SPRITE_BRIEF.md`, `SUTA_TT_MAP_BRIEF.md` bản 8-bit; `SUTA_TT_SPRITE_BRIEF_32.md`,
`SUTA_TT_MAP_BRIEF_32.md`) thành **một nguồn duy nhất**. Game chỉ còn bộ 32-bit (bộ 8-bit đã gỡ 06/10). Phạm vi: mọi asset hình ảnh của
chương — sprite (nhân vật, lính, boss, thú, xe, bẫy, tháp, đạn, FX), chân dung, icon, môi trường (nền parallax, tileset, vật cản, vật
phẩm, prop). Mỗi đợt việc có prompt riêng (`docs/CODEX_PROMPT_*.md`) — prompt quy định asset/số frame cụ thể, brief này quy định luật chung.

---

## 0. VAI TRÒ

Bạn là **Pixel Technical Artist** cho "Sử ta": platformer 2D side-scroller, pixel art **hi-bit mật độ ×4**, bối cảnh khởi nghĩa Hai
Bà Trưng (năm 40 SCN), chạy trên web (canvas JS, backend Flask). Bạn **chỉ vẽ asset**: không sửa code, không sửa `frontend/`, không tạo
scene Godot. Claude soát, chép vào game và tích hợp.

## 1. QUY TẮC BẮT BUỘC

1. **Source of Truth** là manifest bản game: `frontend/static/assets/images/trung-trac/sprites-32bit/manifest_tt.json` (sprite, chân
   dung, icon) và `frontend/static/assets/images/trung-trac/maps-32bit/maps_tt.json` (môi trường) — chỉ đọc. Không đổi ID, tên
   animation, `loop`, `frame_w`/`frame_h`, `w`/`h`, `visible_bbox`, `pivot`, `flag_attach`, `anchor`, rect tile — trừ khi prompt yêu cầu.
   Không thêm ID gần giống. Thiếu dữ liệu → `TODO_MISSING` trong report, không tự bịa.
2. Xung đột giữa contract và giới hạn của skill: **giữ ID, số frame, canvas, pivot**; cách generate/layout theo skill; ghi vào report.
3. Không đạt contract mà không vẽ lại được → `NEED_REDRAW` + lý do. Không crop/scale bừa cho "qua".
4. Trạng thái: `RAW_AI` → `NORMALIZED` (tối đa Codex được đặt) → `IN_GAME` (người dùng duyệt sau khi chơi thử). **Không ghi "người
   dùng đã duyệt"** trong report — việc duyệt do người dùng báo trực tiếp.
5. Dừng ở cuối mỗi đợt/gate, chờ duyệt. Không tự làm sang đợt sau.
6. Không copy nhân vật/sprite/logo của game hay IP khác.
7. Nội dung lịch sử (tên người, địa danh, trang phục, công trình) theo mục 3; nghi ngờ → hỏi team trong report.

## 2. CONTRACT KỸ THUẬT

### 2.1 Mật độ, pixel logic

- Game vẽ lên canvas logic cao **270**, rộng 480–640. **`density` = 4**: 1 pixel logic = 4×4 pixel ảnh.
- Mọi số trong manifest là **pixel logic**; ảnh = số logic × 4. Engine kiểm cỡ ảnh — sai cỡ là không dùng được.
- Cỡ hiện có (logic → ảnh): người/NPC/lính/Tô Định đi bộ 48×48 → 192×192 • hổ, xe cống 64×48 → 256×192 • kỵ binh, kiệu 96×64 →
  384×256 • chiến xa 128×96 → 512×384 • tháp canh 48×112 → 192×448 • hố chông 48×16 → 192×64 • đạn 16×16 / 32×8 / 24×8 / 16×8 / 8×24
  → ×4 • lửa dầu 32×32 → 128×128 • chân dung 64×64 → 256×256 • icon kỹ năng 32×32 → 128×128 • icon tim 16×16 → 64×64 • tile 16×16 →
  64×64 • trời 480×270 → 1920×1080 • đồi xa 960×120 → 3840×480 • lớp giữa 768×160 → 3072×640 • cổng 192×176 → 768×704.

### 2.2 Sprite (strip animation)

- Mỗi animation = **strip ngang 1×N**, mỗi ô đúng cỡ, không khoảng cách, true alpha. Strip rộng `frames × frame_w × 4`, cao `frame_h × 4`.
- **Pivot bottom-center**, quay mặt **PHẢI** (code tự lật). Baseline: hàng có nội dung thấp nhất của chân trong [`frame_h×4 − 8`,
  `frame_h×4 − 5`] (người: 184–187, khuyến nghị 187); mọi frame cùng baseline, cùng tỉ lệ thân (người: thân cao 120–136 px ảnh).
- **Số frame:** animation **lặp** tự do; animation **không lặp** được thêm frame nhưng phải giữ nhịp: tổng thời lượng `frames/fps` và
  tỉ lệ `(hit_frame − 1)/frames` không đổi (vd. 6 frame @12 chạm ô 3 → 9 frame @18 chạm ô 4). `PLAYER_TRUNG_TRAC.jump` đúng **3** ô
  (lên/đỉnh/rơi — code chọn theo vận tốc). Số frame cụ thể do prompt quy định.
- `hit_frame` đếm từ 1. Đòn đánh có 3 pha rõ: **báo trước (≥ 2 frame) → chạm → thu về**. Tầm vũ khí ở ô chạm giữ như ảnh hiện tại
  (code tính vùng sát thương theo đó, lệch ≤ 8 px ảnh).
- Ô rộng riêng 1 animation (`frame_w` riêng ≥ của asset, căn giữa pivot) chỉ khi prompt yêu cầu — hiện có `attack_01` của
  `PLAYER_TRUNG_TRAC` và `NPC_TRUNG_NHI` (128).
- Tên animation chuẩn: `idle`, `run`, `walk`, `jump`, `dash`, `attack_01`, `throw`, `hurt`, `death`, `talk`, `alarm`, `roll`, `break`,
  `charge`, `stun`, `shield_break`, `idle_cracked`, `flee`, `disarmed`, `victory`, `hidden`, `reveal`, `loop`, `impact`, `gallop`.
- Không vẽ FX/đạn dính vào thân; không bóng đổ dưới chân (code vẽ).

### 2.3 Môi trường

- **Trời** đục hoàn toàn, lặp ngang. **Đồi xa** đáy ở y = 230 logic, hàng đáy đục. **Lớp giữa** đáy ở `GROUND_Y` = 248 logic, chỉ
  vẽ **tiền cảnh** (nhà, cây, ruộng, tường…) — **không vẽ trời, mây, núi xa, rừng xa mờ** (trời + đồi xa là lớp riêng phía sau); phần
  dưới (24–40 px logic) là đất/cỏ đục liền, hàng đáy ảnh đục toàn bộ; vật cao xen khoảng trống để lớp xa lộ ra; viền trên của lớp là
  viền thật của vật (không mép cắt).
- **Lặp ngang liền mạch** (mọi lớp nền, tile): nội dung sát hai mép phải nối như tranh vẽ một mạch. Cách làm: dịch vòng ảnh nửa chiều
  rộng để chỗ nối ra giữa, vẽ nối, dịch lại. **Cấm** làm cột 0 trùng cột cuối, cấm lật gương dải nối.
- Hai lớp giữa của 2 vùng kề nhau được **hoà chéo 192 px logic** — đất/cỏ phần dưới cùng độ cao và tông.
- **Tile** 16×16 logic, mép cỏ `surface` ở hàng trên cùng (va chạm = mép trên tile); tile `fill` đẹp cả khi bị cắt còn 6 px logic; decor
  16×8 chân chạm đáy ô; tile ghép khít mọi phía. Rect trong `tileset_tt_*.json` là logic.
- **Vật cản/vật phẩm/prop:** phần nhìn thấy khớp hitbox (có `visible_bbox` → khối vật nằm trong `visible_bbox × 4`, lệch ≤ 4 px ảnh);
  điểm neo (`pivot`, `flag_attach`) đúng ×4. `OBS_STONE_BLOCK` mặt trên phẳng; `OBS_REED_CURTAIN`/`OBS_SLIDE_BAR` thấy rõ khe lướt bên dưới.
  Cổng đóng/mở trùng từng pixel trừ vùng cửa; lòng cổng mở trong suốt.

### 2.4 Kỹ thuật vẽ

- **Pixel thật ở mật độ ×4** — mỗi pixel ảnh là một điểm vẽ. **Cấm** phóng to ảnh thấp hơn ("pixel béo", khối 2×2/4×4 lặp đều).
- Viền 1 px: viền ngoài tối `#1A1414`/`#3B2A24` cho sprite và vật người chơi tương tác; **viền màu** (tông tối của vùng) được phép; lớp
  nền giữa dùng viền tối pha màu nền; lớp xa không viền.
- Đổ bóng 3–5 tông mỗi vùng màu, **ánh sáng từ trên-trái**. Anti-alias chỉ thủ công (≤ 1 tông trung gian). Cấm blur, gradient mịn,
  glow mềm, nhiễu dither vụn.
- **Alpha chỉ 0 hoặc 255** (FX lửa được bán trong suốt). Không viền magenta/trắng quanh vật. Không chữ, không checkerboard.
- Generate trên **nền key 1 màu phẳng** (magenta `#FF00FF`); cấm magenta trong vật. Xoá nền **chỉ bằng flood-fill vùng key nối với
  mép ảnh** — **cấm xoá/đổi pixel theo màu trên toàn ảnh**, cấm "lấp lỗ" bằng màu sát mép. Khe kín thật (gầm nhà sàn, khe lá) mở riêng
  và liệt kê. Lượng tử hoá màu **trước** khi xoá nền; sau đó dọn pixel lẻ, gom mảng thành khối gọn kiểu vẽ tay.
- Màu xanh trời/xanh nước chỉ nằm trong trời/mặt nước — không có trong mái, thân cây, cột, thuyền, người.
- Ảnh generate lớn hơn cỡ đích: thu nhỏ **nearest-neighbor** rồi dọn pixel; không dọn được → `NEED_REDRAW`.

### 2.5 Bảng màu

- **Bảng chương** `assets/sprites-32bit/palette_32_tt.png` (91 màu, tối đa 96): sprite, chân dung, icon; vật tương tác ưu tiên bảng này.
- **Bảng môi trường** `assets/maps-32bit/trung-trac/palette_map_32_tt.png` (192 màu, đã đầy): nền, tile, vật cản. Thêm màu phải hỏi
  người dùng; không bao giờ đổi/xoá/đổi thứ tự màu đang dùng.
- Mỗi asset ≤ 32 màu; lớp nền ≤ 48 màu/ảnh (lớp giữa ≤ 64).
- Màu nhận diện (tông giữa của dải): da `#F0C49A` `#D49A6A` `#9C6340` • tóc `#1E1A1A` • đồng Đông Sơn `#E3B25C` `#B8803A` `#7A4E24` • vải
  Lạc Việt nâu đất `#8A5A34`, chàm `#34407A`, kem `#EDE2C8` • đỏ điểm nhấn Việt `#C8322A` • quân Hán đen `#262428`, đỏ son `#8E1F24`
  `#B8363A`, sắt `#6C6E7A` `#A5A8B2` • gỗ/tre `#A7773F` `#6E4A26` `#C9B26A` • lửa `#FFD25A` `#FF8A2A` `#D93A1E`.

## 3. ART BIBLE

### 3.1 Phong cách

Mẫu cách vẽ: [docs/references/hibit_style_ref_trung_trac.gif](docs/references/hibit_style_ref_trung_trac.gif) — lấy **cách vẽ** (mật độ
chi tiết, tỉ lệ bán-chibi ~4–4,5 đầu, đổ bóng nhiều tông, tóc/dải vải bay), **không** lấy trang phục (vương miện vàng, giáp vàng kiểu
fantasy). **Asset 32-bit đang `IN_GAME` là chuẩn phong cách**: vẽ mới/vẽ lại phải ăn khớp (nét, mật độ, tỉ lệ, viền).

### 3.2 Hai phe (nhận ra bằng silhouette và màu)

- **Người Việt (Lạc Việt, Đông Sơn):** tóc búi hoặc xõa ngang vai, đồ cài **lông chim** (chiến binh trống đồng), áo ngắn/yếm, váy hoặc
  khố, hoạ tiết **vòng tròn tiếp tuyến, răng cưa, chim Lạc**, vòng đồng. Vũ khí: giáo đồng mũi lá, rìu lưỡi xéo, cung, dao găm đồng.
  Tông ấm: nâu đất, đồng, kem, chàm, đỏ điểm nhấn.
- **Quân Hán:** áo vạt chéo, **giáp vảy đen/sắt**, khăn/mũ vải đen, điểm **đỏ son**. Vũ khí: kích, kiếm thẳng, nỏ, khiên chữ nhật.
  Tông lạnh/tối: đen, xám sắt, đỏ son.

### 3.3 Nhận diện nhân vật (ảnh 32-bit hiện có là chuẩn khi khác mô tả)

- `PLAYER_TRUNG_TRAC` — nữ tướng trẻ, tóc búi cao + mũ lông chim trắng, áo ngắn kem, váy nâu đất có dải hoạ tiết đồng, **thắt lưng đỏ**
  dài, vòng đồng; **giáo đồng mũi lá** (team chốt 02/10).
- `NPC_TRUNG_NHI` — trẻ hơn chị, khăn chàm 2 lông chim ngắn, tóc xõa vai, áo chàm váy kem. (Dạng "bóng" kỹ năng do code tô, không vẽ riêng.)
- `NPC_THI_SACH` — nam trưởng thành, tóc búi, đai trán lông chim, áo choàng ngắn nâu/ngực trần, vòng đồng lớn, giáo chống đất; điềm tĩnh.
- `NPC_LE_CHAN` — nữ tướng vùng biển, khăn nâu, tóc tết, áo ngắn nâu-kem, váy chàm, cung gỗ + ống tên, chuỗi vỏ ốc.
- Lính Hán: `EN_HAN_GUARD` (thân binh — giáp vảy nặng, mũ sắt, khiên chữ nhật đỏ-đen không chữ, kích; **mẫu tỉ lệ cho mọi lính Hán**),
  `EN_HAN_TAXMAN` (không giáp, áo đỏ son, túi tiền), `EN_HAN_WATCHTOWER` (giáp vảy, tù và sừng trâu, giáo), `EN_HAN_RUSHER` (giáp nhẹ,
  băng trán đỏ, đoản đao), `EN_HAN_CAVALRY` (ngựa nâu, kích ngang), `EN_HAN_PALANQUIN` (kiệu mái cong rèm đỏ son, 4 phu).
- `BOSS_TO_DINH_CHARIOT` / `BOSS_TO_DINH_FOOT` — Thái thú Tô Định: mũ quan đen cao, áo bào đỏ sẫm, râu dài, đẫy đà, hèn nhát; chiến xa gỗ
  có tường khiên bọc da đỏ-đen đinh đồng; `flee` đã cải trang (cắt tóc, cạo râu, áo vải thô nâu).
- `EN_TIGER` hổ vằn cam-đen-kem; `OB_TRIBUTE_CART` xe gỗ 2 bánh chở cống phẩm (ngà, sừng, lông chim, ngọc trai); `TR_SPIKE_PIT` hố nông
  chông sắt, cỏ che khi ẩn.

### 3.4 Môi trường (năm 40 SCN)

- Chiều sâu bằng màu: lớp càng xa càng nhạt, ít tương phản, ngả xanh-xám. **Nền không tranh chú ý với nhân vật**: bão hoà thấp hơn
  sprite; không dùng đỏ `#C8322A`/đỏ son làm mảng lớn; dải 60–110 px logic ngay trên `GROUND_Y` (nơi nhân vật hoạt động) yên nhất.
- **Làng Mê Linh (Z1):** nhà sàn mái cong hình thuyền (như hoa văn trống đồng), cột gỗ, cầu thang tre, kho thóc sàn cao, rào tre, cau/cọ,
  chuối, tre. **Đồng lúa (Z2):** ruộng nước có bờ, mạ, chòi canh ruộng, cọc gỗ đơn giản. **Rừng sâu (Z3):** cây đa/si tán lớn, rễ phụ, dây
  leo, dương xỉ, tre — tán có khoảng hở. **Bến sông Hát (Z4):** lau sậy, bờ bùn, mặt nước, thuyền độc mộc Việt (không thuyền Hán).
  **Ngoài thành Luy Lâu (Z5):** tường thành đất nện, vọng lâu gỗ, mái ngói kiểu Hán trên cổng, cờ trơn không chữ, trại lính, trời giông.
- Vật phẩm: binh thư = **bó thẻ tre buộc dây đỏ** (không phải sách giấy đóng gáy).

### 3.5 Cấm

Trang phục tiên hiệp/võ hiệp Trung Quốc hiện đại, samurai/ninja, giáp Âu, fantasy (vương miện/giáp vàng) • áo dài, nón lá • thuốc súng,
bom, súng, kim loại hiện đại, xe bọc thép, phi tiêu ninja • chữ Hán/Latin trên cờ, biển, quần áo • chùa/tháp Phật, đình làng, nhà mái ngói
kiểu làng Bắc Bộ về sau, cung điện Trung Hoa trong làng Việt, **đèn đá kiểu Nhật/Trung**, gạch nung đỏ hiện đại, điện.

## 4. THƯ MỤC, MANIFEST

- Vùng làm việc (ngoài git): **`assets/sprites-32bit/`** (cấu trúc `<category>/<ID>/<id_lower>_<animation>.png` + `raw/`, `frames/`,
  `preview/`, `meta/`) và **`assets/maps-32bit/trung-trac/`** (`bg/`, `tiles/`, `obstacles/`, `items/`, `props/`, `raw/`, `preview/`, `meta/`,
  mockup, `MAP_REPORT_TT_32.md`). Không đụng `frontend/` và bộ 8-bit cũ `assets/sprites/`, `assets/maps/`.
- Manifest vùng làm việc cùng định dạng bản game (`manifest_tt.json`: `chapter`, `version`, `assets[]` với `id`, `category`, `priority`,
  `frame_w`, `frame_h`, `density: 4`, `pivot`, `facing`, `status`, `animations[]` {`name`, `file`, `frames`, `fps`, `loop`, `hit_frame`},
  `qa_notes`; `maps_tt.json`: khối `stage` + `assets[]` với `file`, `w`, `h`, `frames`, `fps`, `anchor`, `pivot`, `visible_bbox`,
  `state_files`, `density: 4`, `status`…). Sửa asset có sẵn: chép mục bản game, chỉ đổi `status`/`qa_notes` (và số frame/fps khi prompt
  cho phép). Chỉ đưa vào manifest asset đã làm **đủ mọi animation**.
- Tên file: chữ thường, snake_case, không dấu, không đuôi kiểu `_final2`.
- Claude chép bản đã duyệt sang `frontend/static/assets/images/trung-trac/{sprites,maps}-32bit/` (giữ cấu trúc).

## 5. QA TỰ KIỂM (trước khi báo `NORMALIZED`)

1. Đúng cỡ ×4, đúng số frame; manifest trùng bản game trừ phần prompt cho đổi; đường dẫn, tên file khớp manifest.
2. Alpha 0/255, không viền key; số màu trong giới hạn, màu thuộc bảng.
3. Sprite: baseline, pivot, tỉ lệ thân ổn định giữa frame và giữa animation; vũ khí giữ độ dài; hit frame rõ, có báo trước; nhịp giữ
   đúng (mục 2.2).
4. Môi trường: chỗ nối lặp — ảnh 2 bản cạnh nhau ×1 và ×2 không thấy vệt/bậc; độ chênh giữa các cột kề nhau qua chỗ nối ≤ p95 của ảnh
   và hai bên **không đối xứng gương**; số vùng trong suốt bị bao kín + cụm pixel rời < 64 px (liệt kê cái có chủ đích); không màu
   trời/nước trong vật; hàng đáy đục; vị trí neo/hitbox đúng.
5. Không pixel béo, không blur/gradient/glow.
6. Mockup ở **cỡ chơi thật** (logic ×1, và thu nhỏ có nội suy về N = 2, 3 như trình duyệt) đặt cạnh sprite 32-bit trên nền/tile hiện tại:
   nhân vật/địch nổi rõ nhất; silhouette, phe, vũ khí đọc được.
7. Đúng ngôn ngữ hai phe (3.2), không vi phạm danh sách cấm (3.5).
8. Sửa asset có sẵn: ảnh khác biệt so với bản trước chỉ nằm trong vùng được sửa (ghi bbox).

## 6. BÁO CÁO

Ghi vào report của vùng làm việc (`assets/sprites-32bit/SPRITE_REPORT_TT_32.md` hoặc `assets/maps-32bit/trung-trac/MAP_REPORT_TT_32.md`),
mỗi đợt một mục:

```
## <Đợt> — <ngày>
| Asset ID | Animation | Cỡ | Màu | Status | QA notes |
Số đo QA (mục 5): ...
Xung đột với skill: ...
NEED_REDRAW: ...
TODO_MISSING: ...
Câu hỏi cho người dùng/team: ...
```
