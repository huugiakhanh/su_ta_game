# CODEX PROMPT — BT_ART_02: ASSET MÀN 2 CHƯƠNG BÀ TRIỆU "CHIÊU MỘ HIỀN TÀI" (32-bit)

Ngày giao: 19/10/2026 • Người giao: team Sử Ta (Claude soạn) • **Người dùng duyệt 19/10/2026** (giữ `EN_NGO_SOLDIER`) • Skill: agent-sprite-forge / `$generate2dsprite` (sprite, icon, FX), `$generate2dmap` (nền)

> Đọc **[SUTA_TT_ART_BRIEF_32.md](../SUTA_TT_ART_BRIEF_32.md)** trước — luật kỹ thuật chung (mật độ ×4, strip, pivot bottom-center,
> quay phải, baseline, viền, đổ bóng, alpha 0/255, xoá nền bằng flood-fill mép, QA mục 5, mẫu report mục 6) áp dụng nguyên vẹn.
> Mục 3 của brief (năm 40 SCN) chỉ là chuẩn phong cách; bối cảnh đợt này là **năm 248**, như đợt `BT_ART_01`
> ([CODEX_PROMPT_BT_ART_01.md](CODEX_PROMPT_BT_ART_01.md) mục 4–5 — phe Ngô, núi Nưa). Prompt mâu thuẫn brief → theo prompt, ghi vào report.

---

## 0. MỤC TIÊU

Màn 2 "Chiêu mộ hiền tài": người chơi (nghĩa sĩ nam/nữ — **không vẽ**) đi từ làng Quan Yên qua rừng tới **đầm lầy Bồ Điền**, giải cứu
và gặp 3 NPC theo thứ tự **Triệu Quốc Đạt → ba anh em họ Lý → Bạch Tượng** (mỗi NPC bị 2 quân địch vây, trả lời câu hỏi để nhận
phần thưởng). Phần thưởng là 3 kỹ năng dùng ở màn 3: **Chí mạng** (bị động), **Khiên mây tre** (phím K), **Gọi Bạch Tượng** (phím L —
voi trắng lao ngang màn hình húc địch; **không cưỡi**).

Đợt này vẽ: NPC + chân dung 3 nhóm nhân vật, lính Ngô thường (quân vây NPC), hoạt ảnh voi trắng cho kỹ năng, FX khiên + chí mạng,
icon 3 kỹ năng, lớp nền đầm lầy Bồ Điền.

**Chia 2 Gate** (Triệu Quốc Đạt, Bạch Tượng là nhận diện mới):
- **Gate B1** — concept + 3 asset chốt nhận diện (cột Gate = B1). **Dừng chờ duyệt.**
- **Gate B2** — phần còn lại, sau khi team duyệt B1.

### 0.1 Bài học từ BT_ART_01 — BẮT BUỘC (mỗi điểm đã gây 1 vòng sửa ở đợt trước)

1. **Một hệ số thu nhỏ cho cả asset** (lấy theo `idle`), neo chân (pivot bottom-center) cố định. **Không** chuẩn hoá chiều cao bbox
   từng ô — ô đầu của `hurt`/`death`/`bow` phải cùng cỡ `idle`. Đầu, thân trùng cỡ giữa mọi animation.
2. Animation mới của nhân vật đã có (vd. `talk`) phải **cùng màu, cùng nét, cùng cỡ đầu** với `idle`; chỉ đổi tư thế.
3. **Không vẽ đạn/FX/bụi/tia sáng dính trong sprite nhân vật** (FX là asset riêng).
4. Phần đứng yên (bụi cây, cờ, vật cầm) giống hệt nhau ở mọi animation.
5. Không mảng pixel rời, không vệt mảnh ảnh nguồn sót lại; không kéo giãn ảnh (pixel béo); mảng bóng 3–5 tông rời, không gradient mịn.
6. Prop/icon/sprite ≤ **32 màu** (voi ≤ 40); màu nằm **đúng mã** trong bảng màu.
7. Sửa lại thì **không xuất lại asset đã PASS**. Report **không ghi "người dùng đã duyệt"** (brief 1.4).

## 1. DANH SÁCH ASSET

Ô logic → ảnh ×4. Số frame/fps theo asset tương đương của chương 1 (`manifest_tt.json`) để giữ nhịp code; số mới là `DESIGN_BASELINE`.

### 1a. Sprite — `assets/sprites-32bit/ba-trieu/` (thêm vào `manifest_bt.json`)

| # | Gate | Asset ID | Loại | Ô logic → ảnh | Animation (frames @fps, lặp?, hit_frame) | Ghi chú |
|---|---|---|---|---|---|---|
| 1 | B1 | `CONCEPT_BT_HEROES` | concept | tự do | — | Triệu Quốc Đạt, 3 anh em họ Lý, lính Ngô thường đứng cạnh `PLAYER_BA_TRIEU` + `PLAYER_MALE` ở cỡ chơi thật, **không vào game** (mục 3, 4, 5) |
| 2 | B1 | `NPC_TRIEU_QUOC_DAT` | npc | 48×48 → 192×192 | `idle` 6@8 lặp • `talk` 6@12 lặp | như `NPC_THI_SACH` (mục 3) |
| 3 | B1 | `NPC_BACH_TUONG` | npc | 128×96 → 512×384 | `idle` 6@8 lặp • `charge` 8@18 lặp | voi trắng một ngà — **cùng thiết kế voi** trong `samples/player/PLAYER_BA_TRIEU_ELEPHANT` (mục 5) |
| 4 | B2 | `PORTRAIT_TRIEU_QUOC_DAT` | portrait | 64×64 → 256×256 | `idle` 1 | cùng khung, góc nhìn với `PORTRAIT_BA_TRIEU` |
| 5 | B2 | `NPC_HO_LY` | npc (nhóm) | 112×48 → 448×192 | `idle` 6@9 lặp • `talk` 6@12 lặp | **3 người trong 1 sprite** (mục 4) |
| 6 | B2 | `PORTRAIT_LY_HOANG` | portrait | 64×64 → 256×256 | `idle` 1 | người nói của nhóm họ Lý |
| 7 | B2 | `NPC_BACH_TUONG` (thêm) | npc | 128×96 | `talk` 6@10 lặp • `bow` 8@10 **không lặp** | rống / cúi đầu thuần phục (mục 5) |
| 8 | B2 | `PORTRAIT_BACH_TUONG` | portrait | 64×64 → 256×256 | `idle` 1 | đầu voi trắng một ngà |
| 9 | B2 | `EN_NGO_SOLDIER` | enemy | 48×48 → 192×192 | `idle` 6@9 lặp • `walk` 8@11 lặp • `attack_01` 9@18 không lặp, hit **4** • `hurt` 3@12 • `death` 6@12 | lính Ngô thường cầm kích — quân vây Triệu Quốc Đạt, họ Lý; cùng nhịp `EN_HAN_GUARD` (mục 6) |
| 10 | B2 | `FX_BT_RATTAN_SHIELD` | fx | 32×48 → 128×192 | `raise` 3@20 không lặp • `hold` 4@8 lặp • `block` 4@20 không lặp | khiên mây tre hiện trước người chơi (mục 7.1) |
| 11 | B2 | `FX_BT_CRIT` | fx | 32×32 → 128×128 | `impact` 5@20 không lặp | tia chém chí mạng (mục 7.2) |
| 12 | B2 | `ICON_SK_BT_CRIT` | icon | 32×32 → 128×128 | `idle` 1 | icon Chí mạng (mục 8) |
| 13 | B2 | `ICON_SK_BT_RATTAN_SHIELD` | icon | 32×32 → 128×128 | `idle` 1 | icon Khiên mây tre |
| 14 | B2 | `ICON_SK_BT_WHITE_ELEPHANT` | icon | 32×32 → 128×128 | `idle` 1 | icon Gọi Bạch Tượng |

### 1b. Môi trường — `assets/maps-32bit/ba-trieu/` (thêm vào `maps_bt.json`)

| # | Gate | Asset ID | Loại | Cỡ logic → ảnh | Ghi chú |
|---|---|---|---|---|---|
| 15 | B1 | `BG_BT_MID_MARSH` | parallax lớp giữa | 768×160 → 3072×640 | đầm lầy Bồ Điền — **mẫu chốt tông** (mục 9) |
| 16 | B2 | `BG_BT_FAR_PLAIN` | parallax đồi xa | 960×120 → 3840×480 | đồng trũng xa + núi thấp mờ, đáy y = 230 (mục 9) |

**Dùng lại, không vẽ:** trời `BG_TT_SKY_DAY`, tileset `TILESET_TT_GROUND`/`TILESET_TT_TERRAIN` (engine dùng **một** tileset mặt đất cho
cả chương — **không** vẽ tileset bùn), lớp giữa làng `BG_TT_MID_VILLAGE` (Quan Yên), `BG_BT_MID_NUA_FOREST`, `BG_BT_MID_SACRED_FOREST`,
vật cản chương 1 `OBS_REED_CURTAIN`, `OBS_LOG_DRIFT`, `OBS_BRIDGE`, bia câu hỏi, `EN_NGO_HUNTER` (quân vây Bạch Tượng), người chơi,
`PLAYER_BA_TRIEU`, `PORTRAIT_BA_TRIEU`. Claude khai báo trong code.

## 2. THƯ MỤC, MANIFEST, BẢNG MÀU

- Vùng làm việc (ngoài git): `assets/sprites-32bit/ba-trieu/` (`npc/`, `portrait/`, `enemy/`, `fx/`, `icon/`, `concept/`, `raw/`,
  `preview/`, `meta/`) và `assets/maps-32bit/ba-trieu/` (`bg/`, `raw/`, `preview/`, `meta/`). **Không** sửa `samples/`, asset chương 1,
  `manifest_tt.json`, `maps_tt.json`; không đụng `frontend/`.
- `manifest_bt.json` / `maps_bt.json`: **chỉ thêm mục mới**. 22 mục của `BT_ART_01` đang `IN_GAME` — **không sửa, không xuất lại**.
  Mục mới status tối đa `NORMALIZED`. Không đưa `CONCEPT_BT_HEROES` vào manifest. Khối `stage` giữ nguyên.
- Nền: `BG_BT_MID_MARSH` `anchor: "bottom-at-GROUND_Y"`, `tileable_x: true` (như `BG_BT_MID_NUA_FOREST`); `BG_BT_FAR_PLAIN`
  `anchor: "bottom-at-y-230"` (như `BG_BT_FAR_NUA`).
- **Bảng màu sprite:** `samples/palette_32_bt.png` (bản hiện hành, đã có 4 tông tím của `BT_ART_01`). Voi trắng, Bà Triệu dùng đúng màu
  bản mẫu. Cần màu mới → đề xuất ở Gate B1 kèm màu ít dùng có thể thay; **không tự thêm/đổi**.
- **Bảng màu môi trường:** `assets/maps-32bit/ba-trieu/palette_map_32_bt.png` — thêm màu nước/bùn nếu thiếu, ghi số màu thêm vào report
  (≤ 192 màu tổng).
- Report: nối tiếp `SPRITE_REPORT_BT_32.md` / `MAP_REPORT_BT_32.md` bằng mục mới **"BT_ART_02 — Gate B1 / B2"** (không xoá mục cũ).

## 3. TRIỆU QUỐC ĐẠT — anh trai Bà Triệu, hào trưởng vùng Quan Yên

| Dữ kiện | Độ chắc chắn |
|---|---|
| Anh trai Triệu Thị Trinh, hào trưởng (thủ lĩnh địa phương) vùng Quan Yên, Cửu Chân; khởi binh trước, mất trong khởi nghĩa (nội dung team đã duyệt — `SUTA_BT_TASK_00.md` mục 4) | cao (theo tài liệu team) |
| Ngoại hình, trang phục cụ thể | **thấp — không có nguồn**; dưới đây là **thiết kế game**, hỏi team ở Gate B1 |

- Thiết kế (`DESIGN_BASELINE`): đàn ông Việt trưởng thành (~30), **chững chạc, uy nghi** — đứng thẳng, vai rộng; tóc búi, **khăn vấn**
  hoặc dải vải; râu ngắn; áo dài qua gối vạt chéo **nâu đất/chàm** (màu Việt `#8A5A34`, `#34407A` — **khác áo chàm sẫm giáp lá của
  phe Ngô**: không giáp lá, không mũ nhọn), thắt lưng vải, một điểm nhấn vàng nghệ nhỏ (đồng bộ em gái). Tay cầm **kiếm sắt thẳng tra vỏ**
  ở hông hoặc gậy — không cầm vũ khí giơ cao.
- Đứng cạnh `PLAYER_BA_TRIEU` phải đọc được là **người nhà**, không phải lính địch: tông ấm, dáng điềm tĩnh.
- `talk`: tay không cầm vật giơ ra trước (khuyên can), đầu/miệng nhún nhẹ; kiếm/gậy giữ đúng tay như `idle`.
- Không vẽ: `run`/`attack`/`death` (cái chết chỉ kể bằng chữ), mũ quan, giáp vảy, áo bào kiểu quan lại Trung Hoa.

## 4. BA ANH EM HỌ LÝ (Lý Hoằng, Lý Cường, Lý Lực) — tướng tài vùng Bồ Điền

- **Một sprite chung** cho 3 người (game coi là 1 NPC): đứng thành hàng hơi so le, **Lý Hoằng ở giữa, hơi lên trước** (người nói);
  hai người kia hai bên, thấp/lùi hơn một chút. Ô 112×48 logic; 3 người cùng tỉ lệ với `PLAYER_MALE`, chân cả 3 trên baseline.
- Phân biệt bằng **vũ khí + dáng** (thiết kế game, không phải khẳng định lịch sử): Lý Hoằng **giáo dài**, Lý Cường **cung**, Lý Lực
  cầm **khiên mây tre đan tròn** (liên hệ phần thưởng Khiên mây tre). Cùng "đồng phục" nghĩa sĩ vùng Bồ Điền: áo ngắn nâu/chàm, xà cạp,
  khăn, chân đất — **khác phe Ngô** rõ bằng silhouette (không giáp lá, không mũ nhọn).
- `idle`: cả 3 thở nhẹ, lệch nhịp 1–2 ô cho tự nhiên; `talk`: **chỉ Lý Hoằng** cử động tay/miệng, 2 người kia giữ `idle`.
- `PORTRAIT_LY_HOANG`: chỉ Lý Hoằng.
- Trang phục người Việt Cửu Chân thế kỷ 3: **độ chắc chắn thấp** (BT_ART_01 mục 4.1) — giữ mức hoạ tiết Đông Sơn **rất ít** như đợt trước,
  ghi câu hỏi cho team.

## 5. BẠCH TƯỢNG — voi trắng một ngà

- **Nhận diện đã có**: con voi trong `samples/player/PLAYER_BA_TRIEU_ELEPHANT/` (xem `samples/preview/elephant_scale.png`) — trắng ngà/kem,
  **một ngà** (ghi rõ ngà bên nào, giữ nhất quán), tai lớn, vòi dài. `NPC_BACH_TUONG` là **cùng con voi đó, không người cưỡi, không tấm
  phủ lưng**; cùng ô 128×96, cùng tỉ lệ, cùng màu (so pixel thân voi với bản mẫu ở report). Khác hẳn `EN_WILD_ELEPHANT` (xám-nâu, hai ngà).
- Dáng **uy nghi, "chúa tể núi rừng"**: đầu ngẩng, đứng vững; không dữ tợn kiểu quái vật, không mắt đỏ, không giáp.
- `idle` 6@8: thở, vẫy tai, vòi đung đưa nhẹ.
- `charge` 8@18 lặp (kỹ năng "Gọi Bạch Tượng"): **lao nhanh sang phải**, đầu cúi, ngà chĩa trước, vòi cuộn lên, chân sải dài. Thân nhấp
  nhô ≤ 2 px logic. Không vẽ bụi/đất văng trong sprite. Ghi vào report: **mép trước đầu/ngà** (px logic từ pivot) và bbox thân ở từng ô
  (Claude tính vùng húc).
- `talk` 6@10 lặp: ngẩng đầu, **vòi giơ cao rống** (thoại "tiếng voi rống vang khắp núi rừng"), không vẽ chữ/sóng âm.
- `bow` 8@10 không lặp (sau khi người chơi trả lời đúng): **khuỵu chân trước, cúi đầu, vòi hạ chạm đất**, giữ tư thế ở ô cuối. Chân sau
  vẫn trên baseline; ô 1 = tư thế `idle`.
- `PORTRAIT_BACH_TUONG`: đầu + một ngà + mắt hiền nhưng uy, nền trong suốt như chân dung khác.

## 6. `EN_NGO_SOLDIER` — lính Ngô thường

- Theo phương án đã duyệt ở `BT_ART_01` (**phe Ngô = chàm sẫm `#34407A`**, concept `CONCEPT_NGO`): áo vạt chéo, **giáp lá ngắn**,
  **mũ vải nhỏ đầu nhọn**, cầm **kích** (giáo có lưỡi ngang). Cùng tỉ lệ, cùng bảng màu với `EN_NGO_LUMBERJACK`/`EN_NGO_HUNTER`.
- Cùng nhịp `EN_HAN_GUARD` để dùng chung hành vi lính canh: `attack_01` 9@18 hit 4 = đâm kích về phía trước; ghi **tầm mũi kích ở ô 4**
  (px logic từ pivot) vào report. Nếu cần `frame_w` rộng hơn cho mũi kích, ghi rõ (như `attack_01` của `EN_NGO_LUMBERJACK`).
- Không vẽ: khiên/cờ có chữ, mũ sắt kín, giáp minh quang, áo choàng đỏ (BT_ART_01 mục 4.5).

## 7. FX KỸ NĂNG

### 7.1 `FX_BT_RATTAN_SHIELD` (Khiên mây tre)
- Khiên **tròn đan mây tre** vàng-nâu (đường kính ~22–26 px logic), núm giữa, nhìn chính diện hơi nghiêng; code vẽ **trước người chơi**
  (pivot bottom-center của FX đặt tại chân người chơi + lệch về phía trước — ghi tâm khiên px logic từ pivot vào report).
- `raise` 3 ô: khiên đưa lên từ thấp; `hold` 4 ô lặp: khiên đứng yên, viền sáng nhẹ nhấp nháy; `block` 4 ô: chớp sáng + vài mảnh mây
  văng khi chặn đòn, ô cuối về như `hold`. Không vẽ tay/người cầm.

### 7.2 `FX_BT_CRIT` (Chí mạng)
- Vệt chém chéo **vàng nghệ–trắng** + tia sáng toả 4–6 nhánh, mạnh ở ô 2, tan ở ô 5. Bán trong suốt được (như FX lửa). Không chữ "CRIT", không số.

## 8. ICON KỸ NĂNG (`ICON_SK_BT_*`)

- Cùng phong cách, khung, độ dày viền với `ICON_SK_DASH`/`ICON_SK_ATTACK` (`frontend/static/assets/images/shared/sprites-32bit/` — **chỉ xem, không sửa**):
  - `ICON_SK_BT_CRIT`: lưỡi kiếm + tia chớp vàng nghệ.
  - `ICON_SK_BT_RATTAN_SHIELD`: khiên mây tre đan (cùng thiết kế `FX_BT_RATTAN_SHIELD`).
  - `ICON_SK_BT_WHITE_ELEPHANT`: đầu voi trắng một ngà nhìn nghiêng (cùng thiết kế `PORTRAIT_BACH_TUONG`).
- Đọc rõ ở cỡ HUD **32×32 px màn hình** (×1 logic); không chữ, không phím "K/L" trong icon.

## 9. MÔI TRƯỜNG — ĐẦM LẦY BỒ ĐIỀN (năm 248)

- Tư liệu: Bồ Điền là căn cứ cuối của nghĩa quân, vùng **đất trũng sình lầy** thuận lập chiến lũy (nội dung team đã duyệt — BT-00 mục
  4.2); vị trí nay thuộc Thanh Hoá (độ chắc chắn **trung bình**, nguồn phổ thông). Không có công trình đền/miếu thờ năm 248 — **không vẽ đền, chùa**.
- **`BG_BT_MID_MARSH`** (mẫu B1): đầm nước đọng xen bãi bùn, **lau sậy, cỏ năn, bèo**, vài cây tràm/cây bụi ngập nước, **cọc tre và rào
  chông tre** cắm lẻ tẻ (dấu hiệu nghĩa quân bắt đầu lập lũy — chưa phải chiến lũy đầy đủ của màn 3), có thể 1 chòi canh tre lá thấp.
  Phần dưới đất/bùn đục liền, cùng độ cao mặt đất với các lớp giữa khác để hoà chéo 192 px logic (brief 2.3). Tông xanh rêu–nâu bùn trầm,
  **không** tranh với nhân vật; không che sân chơi dải 60–110 px trên `GROUND_Y`.
- **`BG_BT_FAR_PLAIN`**: đồng trũng + đầm xa, dải núi thấp mờ xanh-xám phía chân trời (Bồ Điền xa núi Nưa); khớp `BG_TT_SKY_DAY`.
- Không vẽ: thuyền/quân Ngô trong nền, cờ có chữ, tháp vàng/đài cao (thuộc màn 3 — `BT_ART_03`).

## 10. ACCEPTANCE

### Gate B1
1. `CONCEPT_BT_HEROES`: Triệu Quốc Đạt, nhóm họ Lý, `EN_NGO_SOLDIER` (phác) đứng cạnh `PLAYER_BA_TRIEU`, `PLAYER_MALE`, `EN_NGO_LUMBERJACK`
   ở cỡ chơi thật — phe Việt / phe Ngô phân biệt bằng silhouette + màu; bảng màu đề xuất (nếu cần màu mới).
2. `NPC_TRIEU_QUOC_DAT` (`idle`, `talk`), `NPC_BACH_TUONG` (`idle`, `charge`): đúng cỡ ×4, số frame, alpha 0/255, pivot bottom-center,
   quay **phải**, baseline brief 2.2 (voi: như `PLAYER_BA_TRIEU_ELEPHANT`); mục 0.1 đạt.
3. `preview/bach_tuong_vs_sample.png`: `NPC_BACH_TUONG.idle` cạnh voi của `PLAYER_BA_TRIEU_ELEPHANT` và `EN_WILD_ELEPHANT` — cùng con
   voi trắng với bản mẫu, khác hẳn voi rừng.
4. `BG_BT_MID_MARSH`: lặp ngang không vệt (QA brief 5.4); mockup ×1/×2 với `TILESET_TT_GROUND`, `PLAYER_FEMALE`, `NPC_TRIEU_QUOC_DAT`:
   nhân vật nổi rõ hơn nền; hoà chéo với `BG_BT_MID_SACRED_FOREST`.
5. Report đủ mục; status tối đa `NORMALIZED`. **Dừng.**

### Gate B2
1. Đủ mục 1a + 1b còn lại; QA brief mục 5 (1–8) và mục 0.1 đạt; manifest khớp file; 22 mục `BT_ART_01` không đổi (hash).
2. `NPC_BACH_TUONG`: `talk`, `bow` cùng tỉ lệ `idle` (ô 1 của `bow` = `idle`).
3. Mockup cỡ chơi thật: (a) mỗi NPC bị 2 quân vây (`EN_NGO_SOLDIER` ×2 quanh Triệu Quốc Đạt, quanh nhóm họ Lý; `EN_NGO_HUNTER` ×2 quanh
   Bạch Tượng) trên nền tương ứng (làng → rừng → đầm lầy); (b) `NPC_BACH_TUONG.charge` lao qua 3 `EN_NGO_SOLDIER`; (c) `PLAYER_MALE` +
   `FX_BT_RATTAN_SHIELD` (`hold`) và `FX_BT_CRIT` trên `EN_NGO_SOLDIER`; (d) 3 icon cạnh `ICON_SK_DASH`/`ICON_SK_ATTACK` ở ×1.
4. Report đủ; **dừng** chờ duyệt.

## 11. BÁO CÁO & DỪNG

- Ghi report theo mẫu brief mục 6, thêm bảng **"Số đo cho code"**: mép trước đầu/ngà + bbox thân `NPC_BACH_TUONG.charge` từng ô; tầm mũi kích
  ô 4 `EN_NGO_SOLDIER`; tâm khiên `FX_BT_RATTAN_SHIELD`; tâm x từng người trong `NPC_HO_LY` (px logic từ pivot); `visible_bbox` các NPC.
- **Câu hỏi cho team** (bắt buộc ghi): trang phục, tuổi, vật cầm của Triệu Quốc Đạt; vũ khí phân biệt 3 anh em họ Lý; ngà còn lại của Bạch
  Tượng ở bên nào; mức hoạ tiết Đông Sơn; mọi chi tiết lịch sử Codex không chắc.
- **Dừng sau Gate B1**, chờ team duyệt; làm B2 rồi **dừng sau Gate B2**. Không vẽ asset màn 3 (Lục Dận, tháp vàng, kỵ binh thiết giáp, tên
  độc, tiền vàng, nền chiến lũy, Bà Triệu cưỡi voi trong game) — thuộc `BT_ART_03`.

---

## 12. PHẢN HỒI GATE B1 + CHUẨN CHIỀU CAO (Claude soát 19/10/2026 — `/asset-review`)

Quyết định người dùng (19/10):
- **Chuẩn chiều cao người trưởng thành = 34 ± 1 px logic** từ đỉnh sọ tới chân (không tính mũ/búi/lông/vương miện/vũ khí) — đã ghi vào
  brief mục 2.2, áp dụng mọi chương.
- **Sửa chương 2 trước.** Lính Hán chương 1 (`EN_HAN_GUARD` ~29,5) ghi TODO, chưa sửa đợt này.
- **Triệu Quốc Đạt (và họ Lý) phải khác người chơi nam** — hiện khăn chàm + áo nâu gần giống hệt `PLAYER_MALE`.
- `PLAYER_BA_TRIEU`/`PORTRAIT_BA_TRIEU` **thiết kế mới theo ảnh người dùng đưa** (mũ vàng, áo vàng nghệ, áo choàng đỏ) — người dùng chủ
  động yêu cầu, giữ thiết kế, chỉ sửa tỉ lệ.

### 12.1 Số đo chiều cao (đỉnh sọ → chân ở `idle` ô 1, px logic, ±1)

| Nhóm | Asset | Đỉnh sọ → chân |
|---|---|---|
| Mốc (chung) | `PLAYER_MALE` / `PLAYER_FEMALE` | 35 / 35,5 |
| Chương 1 | `NPC_LE_CHAN` 36 • `NPC_THI_SACH` 35 • `EN_HAN_TAXMAN` ~33,5 • `PLAYER_TRUNG_TRAC`, `NPC_TRUNG_NHI`, `BOSS_TO_DINH_FOOT` ~33 | đạt |
| Chương 1 | `EN_HAN_GUARD` (đỉnh mũ sắt) | ~29,5 — **TODO đợt sau** |
| Chương 2 | `PLAYER_BA_TRIEU` **mới** | **29** (vương miện tới 37 — đầu + thân nhỏ hơn mọi nhân vật) |
| Chương 2 | `PLAYER_BA_TRIEU` cũ (đang chạy trong game) | 31 |
| Chương 2 | `NPC_TRIEU_QUOC_DAT` | **31,5** |
| Chương 2 | `EN_NGO_LUMBERJACK` (đang `IN_GAME`) | **31** |

### 12.2 Bảng kết quả

| Asset ID | Animation | Kết quả | Số đo / việc cần làm |
|---|---|---|---|
| `NPC_BACH_TUONG` | `idle` | PASS | 3072×384, alpha 0/255, 32 màu, đáy 379; cùng con voi trắng với bản mẫu (so `bach_tuong_vs_sample.png`), một ngà, khác hẳn voi rừng |
| `NPC_BACH_TUONG` | `charge` | **NORMALIZE** | **mảnh pixel rời** ở ô 2 (185 px tại x 25–31, y 228–266 và 38 px tại y 291–299), ô 5 (8 px tại x 59–62, y 262–265), ô 6 (90 px + 23 px tại x 27–32) — mảnh ngà/đuôi của ô bên cạnh trong lưới nguồn; xoá. Thân, nhịp đạt |
| `NPC_TRIEU_QUOC_DAT` | `idle`, `talk` | **NEED_REDRAW** | (1) cao **31,5** → **34** (một hệ số cho cả asset, tạo lại từ nguồn — **không** phóng to ảnh đã thu nhỏ); (2) **trông như `PLAYER_MALE`** (khăn chàm, áo nâu ngắn) → **bỏ khăn chàm**, dùng **khăn vấn nâu đất hoặc vàng nghệ**, **áo dài qua gối** vạt chéo, râu rõ hơn, dáng trung niên chững chạc — đúng mục 3; đứng cạnh `PLAYER_MALE` phải phân biệt ngay. Kỹ thuật (cỡ, alpha, đáy 187, 32 màu) đạt |
| `CONCEPT_BT_HEROES` | — | **Sửa ở concept trước B2** | 3 anh em họ Lý cũng khăn chàm như người chơi → đổi khăn/áo theo hướng khác người chơi (vd. khăn nâu, áo ngắn chàm sẫm hơn, xà cạp) trước khi vẽ `NPC_HO_LY`; vẽ lại concept ở chiều cao 34 |
| `PLAYER_BA_TRIEU` | `idle`, `run`, `talk` | **NORMALIZE (tỉ lệ)** | đúng cỡ, alpha 0/255, 32 màu, đáy 187 — nhưng **thân + đầu chỉ 29** px logic (vương miện nâng tổng lên 37). Phóng theo một hệ số để **đỉnh sọ → chân = 34** (vương miện vượt lên, tổng ~42 px logic, vẫn trong ô 48 — đỉnh không quá hàng 8 px ảnh). Giữ thiết kế, màu, `talk` kiếm tra vỏ |
| `PORTRAIT_BA_TRIEU` | `idle` | PASS | 256×256, 32 màu, cùng mũ và màu với sprite |
| `EN_NGO_LUMBERJACK` | mọi animation | **NORMALIZE (tỉ lệ)** — asset đang `IN_GAME` | thân **31** → **34**: tạo lại cả 5 animation từ nguồn (`meta/revision3_source/`, `raw/`) với **một hệ số mới** (×~1,10 so với hiện tại); giữ 10@10 hit 7, `frame_w` 80 (rìu không được vượt ô — nếu vượt, báo lại); báo lại tầm đầu rìu ô 7. Status về `NORMALIZED` |
| `EN_NGO_HUNTER`, `EN_NGO_CAVALRY` | mọi animation | **NORMALIZE (tỉ lệ)** | cùng phe, đang dùng **cùng hệ số** với lính đốn gỗ → nhân **cùng hệ số mới** (người nấp bụi / người cưỡi + ngựa); báo lại độ cao đầu nỏ ô 5, bbox kỵ binh |
| `EN_NGO_TAX_OFFICIAL` | — | PASS (giữ) | mini-boss: người dùng đã chốt tổng cao ~44 px logic — không đổi |
| `BG_BT_MID_MARSH` | — | PASS | 3072×640, 64 màu, alpha 0/255, nối lặp đạt (p95 nối 34 < p95 nội bộ 67); ở mockup ×2 đọc rõ nhân vật. Cọc/rào chông tre khó thấy ở cỡ chơi — chấp nhận |

### 12.3 Việc cho Codex (một lượt, rồi dừng chờ duyệt)

1. Sửa mọi dòng NORMALIZE / NEED_REDRAW ở 12.2; **không xuất lại asset PASS** (`NPC_BACH_TUONG.idle`, `PORTRAIT_BA_TRIEU`,
   `EN_NGO_TAX_OFFICIAL`, `BG_BT_MID_MARSH`, các asset khác của BT_ART_01).
2. Đo **đỉnh sọ → chân** (px logic) của mọi người đã sửa và ghi bảng vào report; mọi người trưởng thành 34 ± 1 (brief 2.2).
3. Xuất `preview/height_lineup.png`: `PLAYER_MALE`, `PLAYER_FEMALE`, `PLAYER_TRUNG_TRAC`, `PLAYER_BA_TRIEU`, `NPC_TRIEU_QUOC_DAT`,
   `EN_NGO_LUMBERJACK`, `EN_HAN_GUARD`, `EN_NGO_TAX_OFFICIAL` cùng baseline, ×1 và ×2, kẻ vạch ngang ở mức 34 px logic.
4. `EN_NGO_SOLDIER`, `NPC_HO_LY` ở Gate B2 vẽ ngay theo chuẩn 34.
5. Report "BT_ART_02 — Gate B1 bản sửa 1"; không ghi "người dùng đã duyệt". Dừng chờ duyệt.

> Lưu ý cho đợt `BT_ART_03`: `samples/PLAYER_BA_TRIEU_ELEPHANT` vẫn là thiết kế Bà Triệu cũ (tóc búi, áo giáp) — nếu dùng cho cutscene
> phải vẽ lại theo thiết kế mới.

---

## 13. KẾT LUẬN GATE B1 — BẢN SỬA 1 (Claude soát 19/10/2026): **PASS toàn bộ, chờ người dùng duyệt sang B2**

Chỉ các file được giao sửa thay đổi (so hash với bản chạy): `EN_NGO_TAX_OFFICIAL`, `PORTRAIT_BA_TRIEU`, `NPC_BACH_TUONG.idle`,
`BG_BT_MID_MARSH` và các asset BT_ART_01 khác giữ nguyên — đúng yêu cầu. Mọi strip đã sửa: đúng cỡ ×4, alpha 0/255, ≤ 32 màu, đáy cố định
(187 / 251 / 379), không còn mảnh rời đáng kể (chỉ cụm ≤ 30 px ảnh — điểm sáng, không phải mảnh ô bên cạnh).

| Asset ID | Animation | Kết quả | Số đo |
|---|---|---|---|
| `PLAYER_BA_TRIEU` | `idle`, `run`, `talk` | PASS | đỉnh sọ → chân **~35** px logic (vương miện tới 43); `idle` đỉnh hàng 15 mọi ô; `talk` 4 ô cùng cỡ, kiếm tra vỏ đúng tay |
| `NPC_TRIEU_QUOC_DAT` | `idle`, `talk` | PASS | **~34**; khăn vấn nâu, áo dài qua gối, râu — khác hẳn `PLAYER_MALE`. `talk` **4@12** (prompt ghi 6@12) — animation lặp nên chấp nhận |
| `NPC_BACH_TUONG` | `charge` | PASS | đã xoá mảnh rời ô 2, 5, 6; 8@18, đáy 379 |
| `EN_NGO_LUMBERJACK` | mọi animation | PASS | **~33–34**; `idle` đỉnh 49–51, `walk` 54–56; `attack_01` 10@10 hit 7, `frame_w` 80, đầu rìu ô 7 tới x 257/320 px ảnh |
| `EN_NGO_HUNTER` | mọi animation | PASS | ×1,097; bụi rộng 124–125 px cố định ở `idle`; đầu nỏ ô 5 ~ (145–148, 103–109) px ảnh |
| `EN_NGO_CAVALRY` | mọi animation | PASS | ×1,097; `gallop` rộng 323–340 px ảnh, đáy 251 |
| `CONCEPT_BT_HEROES` | — | PASS (1 câu hỏi) | họ Lý khăn nâu, xà cạp, cung/giáo/khiên mây rõ, cao 34 — **nhưng áo chàm sẫm trùng màu phe Ngô** (`#34407A`) → hỏi người dùng trước B2 |

**Khi nhập game (Claude, sau khi duyệt):** lính Ngô to thêm ~10% → cập nhật hitbox trong `ba-trieu/config.js` (`LUMBERJACK`, `GUARD`
tầm rìu, `ngoHunter` muzzle/muzzleX, `ngoCavalry` w/h) và chơi lại màn 1; Bà Triệu/Triệu Quốc Đạt khai báo `NPC_SPRITES`.

---

## 14. NGƯỜI DÙNG DUYỆT GATE B1 (19/10/2026) — LÀM GATE B2

- **Gate B1 duyệt**: `PLAYER_BA_TRIEU` (thiết kế mới), `NPC_TRIEU_QUOC_DAT`, `NPC_BACH_TUONG` (`idle`, `charge`), lính Ngô đã chỉnh tỉ lệ
  (`EN_NGO_LUMBERJACK`, `EN_NGO_HUNTER`, `EN_NGO_CAVALRY`), `BG_BT_MID_MARSH`, concept. **Không xuất lại** các asset này ở B2.
- **Thay đổi cho `NPC_HO_LY` + `PORTRAIT_LY_HOANG`:** áo ba anh em họ Lý **nâu đất / kem** (bảng màu Việt `#8A5A34`, `#EDE2C8`), **bỏ
  chàm sẫm** — chàm sẫm `#34407A` là màu nhận diện phe Ngô. Giữ khăn nâu, xà cạp, vũ khí (Lý Hoằng giáo, Lý Cường cung, Lý Lực khiên mây
  tre) như concept. Điểm nhấn nhỏ được dùng đỏ Việt `#C8322A` hoặc vàng nghệ, không dùng chàm.
- Chuẩn chiều cao **34 ± 1 px logic** (brief 2.2) cho `NPC_HO_LY` (cả 3 người) và `EN_NGO_SOLDIER`; `EN_NGO_SOLDIER` cùng hệ số với lính
  Ngô đã duyệt (đứng cạnh `EN_NGO_LUMBERJACK` cao bằng).
- Làm đủ phần B2 ở mục 1 (bảng 1a/1b cột Gate = B2), acceptance mục 10 Gate B2, báo cáo mục 11; thêm `preview/height_lineup.png` có
  `NPC_HO_LY`, `EN_NGO_SOLDIER`. Report "BT_ART_02 — Gate B2"; không ghi "người dùng đã duyệt". **Dừng chờ duyệt.**

---

## 15. PHẢN HỒI GATE B2 (Claude soát 21/10/2026 — `/asset-review`)

Kỹ thuật toàn đợt đạt: 19 file mới đúng cỡ ×4 / số frame, alpha 0/255, ≤ 32 màu (voi `talk`/`bow` 40 — trong giới hạn voi), đáy 187 /
379, manifest đủ file, không trùng ID; asset đã duyệt ở B1 và BT_ART_01 không bị xuất lại (chỉ file B2 có thời gian sửa mới).

| Asset ID | Animation | Kết quả | Số đo / việc cần làm |
|---|---|---|---|
| `NPC_HO_LY` | `idle`, `talk` | **NEED_REDRAW (màu áo)** | **Áo vẫn chàm sẫm** — report cũng ghi "áo chàm sẫm ngắn". Mục 14 (người dùng duyệt 19/10) yêu cầu **áo nâu đất / kem** (`#8A5A34`, `#EDE2C8`), **không chàm**. Đổi màu áo + vạt cả 3 người ở mọi ô, giữ nguyên hình, khăn nâu, vũ khí, chiều cao (33,5–34,75 đạt) và việc chỉ Lý Hoằng cử động khi nói |
| `PORTRAIT_LY_HOANG` | `idle` | **NEED_REDRAW (màu áo)** | áo chàm → nâu đất / kem như sprite |
| `ICON_SK_BT_CRIT`, `ICON_SK_BT_RATTAN_SHIELD`, `ICON_SK_BT_WHITE_ELEPHANT` | `idle` | **NORMALIZE** | **nền ô vuông tối đục** (alpha 255 toàn ảnh) — `ICON_SK_DASH`/`ICON_SK_ATTACK` nền **trong suốt**, không khung; ở HUD 3 icon mới thành ô vuông đen lệch phong cách (`icons_hud_x1.png`). Bỏ nền, giữ hình, alpha 0/255 |
| `EN_NGO_SOLDIER` | mọi animation | PASS | ~34 px logic, mũ vải chàm đầu nhọn, giáp lá, kích; `attack_01` 9@18 hit 4, `frame_w` 128, mũi kích ô 4 +60 px logic; `death` ô 1 = `idle` |
| `NPC_BACH_TUONG` | `talk`, `bow` | PASS | vòi giơ rống; `bow` ô 1 = `idle`, khuỵu chân trước, vòi chạm đất, giữ ô cuối |
| `PORTRAIT_TRIEU_QUOC_DAT`, `PORTRAIT_BACH_TUONG` | `idle` | PASS | cùng khung/góc với `PORTRAIT_BA_TRIEU` |
| `FX_BT_RATTAN_SHIELD` | `raise`, `hold`, `block` | PASS | mặt đan cố định, tâm (0, −24) logic, `block` ô cuối = `hold` |
| `FX_BT_CRIT` | `impact` | PASS | mạnh ô 2, tan ô 5, không chữ |
| `BG_BT_FAR_PLAIN` | — | PASS | 3840×480, 48 màu, đáy đục, nối 2,76 < p95 nội bộ 6,62 |

**Việc cho Codex:** sửa 2 dòng NEED_REDRAW (màu áo họ Lý) và 1 dòng NORMALIZE (nền icon); **không xuất lại asset PASS**; xuất lại
`ly_contact.png`, `portraits.png`, `icons_hud_x1.png`, `encounters_x2.png`; report "BT_ART_02 — Gate B2 bản sửa 1", không ghi "người dùng
đã duyệt"; dừng chờ duyệt.

---

## 16. KẾT LUẬN GATE B2 — BẢN SỬA 1 (Claude soát 21/10/2026): **PASS toàn bộ, chờ người dùng duyệt nhập game**

Chỉ 6 PNG được giao sửa thay đổi (theo thời gian sửa + hash Codex báo); mọi màu nằm trong `palette_32_bt.png` (0 màu ngoài bảng).

| Asset ID | Animation | Kết quả | Số đo |
|---|---|---|---|
| `NPC_HO_LY` | `idle`, `talk` | PASS | áo/vạt cả 3 người nâu đất, không còn mảng chàm (chỉ ~0,9% pixel hơi xanh — chi tiết nhỏ, không phải vải áo); alpha trùng bản trước, đáy 187, chiều cao giữ 33,5–34,75 |
| `PORTRAIT_LY_HOANG` | `idle` | PASS | áo nâu như sprite, mặt/khăn giữ nguyên, 30 màu |
| `ICON_SK_BT_CRIT`, `_RATTAN_SHIELD`, `_WHITE_ELEPHANT` | `idle` | PASS | nền trong suốt (alpha 0/255), cạnh DASH/ATTACK cùng phong cách |

**Sai lệch mã màu (Codex hỏi):** bảng màu sprite không có đúng `#8A5A34`/`#EDE2C8`; Codex dùng dải nâu sẵn có (`#8F5E31`, `#A56D3F`…). Claude đề xuất
**chấp nhận** — hai mã trong prompt là tông Việt của brief 2.5, dải nâu trong bảng cùng tông; thêm màu mới không cần thiết.

Toàn bộ BT_ART_02 (B1 + B2) đạt ở mức soát ảnh; chưa chạy trong engine.
