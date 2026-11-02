# CODEX PROMPT — LND_ART_02: ASSET MÀN 2 CHƯƠNG LÝ NAM ĐẾ "CHIÊU MỘ HIỀN TÀI" (32-bit)

Ngày giao: 02/11/2026 • Người giao: team Sử Ta (Claude soạn) • Skill: agent-sprite-forge / `$generate2dsprite` (sprite, chân dung, FX,
icon, vật phẩm), `$generate2dmap` (nền)

> Đọc **[SUTA_TT_ART_BRIEF_32.md](../SUTA_TT_ART_BRIEF_32.md)** trước — luật kỹ thuật chung (mật độ ×4, strip, pivot bottom-center,
> quay phải, baseline hàng `frame_h − 2`, **chiều cao người 34 ± 1 px logic**, viền, đổ bóng, alpha 0/255, xoá nền bằng flood-fill mép,
> QA mục 5, mẫu report mục 6) áp dụng nguyên vẹn. Mục 3 của brief (năm 40 SCN) chỉ là chuẩn phong cách; bối cảnh đợt này là
> **năm 541–542, Giao Châu thời nhà Lương**, như đợt `LND_ART_01` (đã `IN_GAME` — xem `assets/sprites-32bit/ly-nam-de/` và report
> `docs/archive/REPORT_LND-L1.md`). Prompt mâu thuẫn brief → theo prompt, ghi vào report.

---

## 0. MỤC TIÊU

Màn 2 "Chiêu mộ hiền tài": người chơi (nghĩa sĩ nam/nữ — **không vẽ**) đi từ làng xuống vùng sông nước **Chu Diên**, giải cứu và gặp
3 NPC theo thứ tự **Phạm Tu → Tinh Thiều → cha con Triệu Túc** (mỗi NPC bị 2 lính Lương vây; lính Lương dùng lại `EN_LUONG_PATROL`
— **không vẽ**). Trả lời đúng câu hỏi của mỗi NPC thì nhận một phần thưởng dùng ở màn 3:

| Phần thưởng | Loại | Từ NPC |
|---|---|---|
| **Khiên Tô Lịch** | phím K — dựng lớp khiên chặn 3 đòn rồi vỡ | Phạm Tu |
| **Lương thảo dồi dào** | bị động — quân giặc bị hạ hay rơi **bình hồi máu** hơn | Tinh Thiều |
| **Triều Cường** | phím L — gọi sóng nước quét ngang màn hình, dọn quân nhỏ | Triệu Túc |

Đợt này vẽ: 3 NPC + 3 chân dung, FX khiên + sóng nước, bình hồi máu, 3 icon kỹ năng, 1 nền lớp giữa vùng Chu Diên.

**Chia 2 Gate** (3 NPC là nhận diện mới):
- **Gate B1** — concept 3 NPC + `NPC_PHAM_TU` + nền Chu Diên (cột Gate = B1). **Dừng chờ duyệt.**
- **Gate B2** — phần còn lại, sau khi team duyệt B1.

### 0.1 Bài học từ LND_ART_01 / BT_ART_01–02 — BẮT BUỘC

1. **Một hệ số thu nhỏ cho cả asset** (lấy theo `idle`), neo chân cố định; **không** chuẩn hoá chiều cao bbox từng ô.
2. Chân **chạm hàng `frame_h − 2` ở mọi ô**, đo trên **thân chính**, không đo bbox (LND_ART_01: xoá 1 vụn pixel làm lộ ra 2 ô lơ lửng
   15 px). Không để vụn pixel rời; phần nào tách khỏi thân phải là chủ ý (mảnh vỡ, giọt nước) và ghi vào report.
3. Vật lớn (nhóm người, sóng) **không xê dịch ngang giữa các ô** nếu animation không chủ ý di chuyển (LND_ART_01: thuyền giật 8 px).
4. `talk` cùng màu, nét, cỡ đầu với `idle`; chỉ đổi tư thế/miệng/tay.
5. Không vẽ FX/bụi/tia sáng dính trong sprite nhân vật.
6. ≤ **32 màu** mỗi asset (sóng nước ≤ 40); màu nằm đúng mã trong bảng màu.
7. Sửa lại thì **không xuất lại asset đã PASS**. Report không ghi "người dùng đã duyệt".

## 1. DANH SÁCH ASSET

Ô logic → ảnh ×4. Số frame/fps theo asset tương đương đã có để giữ nhịp code; số mới ghi `DESIGN_BASELINE`.

### 1a. Sprite — `assets/sprites-32bit/ly-nam-de/` (thêm vào `manifest_lnd.json`)

| # | Gate | Asset ID | Loại | Ô logic → ảnh | Animation (frames @fps, lặp?) | Ghi chú |
|---|---|---|---|---|---|---|
| 1 | B1 | `CONCEPT_LND_HEROES` | concept | tự do | — | Phạm Tu, Tinh Thiều, Triệu Túc + Triệu Quang Phục đứng cạnh `NPC_LY_BI`, `PLAYER_MALE`, `EN_LUONG_PATROL` ở cỡ chơi thật; **không vào game** (mục 3) |
| 2 | B1 | `NPC_PHAM_TU` | npc | 48×48 → 192×192 | `idle` 6@9 lặp • `talk` 4@8 lặp | như `NPC_LY_BI` (mục 3.1) |
| 3 | B2 | `PORTRAIT_PHAM_TU` | portrait | 64×64 → 256×256 | `idle` 1 | cùng khung, góc nhìn với `PORTRAIT_LY_BI` |
| 4 | B2 | `NPC_TINH_THIEU` | npc | 48×48 → 192×192 | `idle` 6@9 lặp • `talk` 4@8 lặp | mục 3.2 |
| 5 | B2 | `PORTRAIT_TINH_THIEU` | portrait | 64×64 → 256×256 | `idle` 1 | |
| 6 | B2 | `NPC_TRIEU_TUC` | npc (nhóm 2 người) | 96×48 → 384×192 | `idle` 6@9 lặp • `talk` 4@8 lặp | Triệu Túc + con trai Triệu Quang Phục trong **1 sprite**; chỉ Triệu Túc nói (mục 3.3) |
| 7 | B2 | `PORTRAIT_TRIEU_TUC` | portrait | 64×64 → 256×256 | `idle` 1 | chỉ Triệu Túc |
| 8 | B2 | `FX_LND_TO_LICH_SHIELD` | fx | 32×48 → 128×192 | `raise` 3@20 không lặp • `hold` 4@8 lặp • `block` 4@20 không lặp • `break` 6@16 không lặp | Khiên Tô Lịch trước người chơi (mục 4.1); 3 animation đầu cùng nhịp `FX_BT_RATTAN_SHIELD` |
| 9 | B2 | `FX_LND_TIDE` | fx | 128×96 → 512×384 | `surge` 8@14 lặp • `fade` 5@12 không lặp | sóng Triều Cường quét ngang (mục 4.2) |
| 10 | B2 | `ITEM_LND_HEAL` | vật phẩm (sprite) | 16×16 → 64×64 | `idle` 4@8 lặp | bình hồi máu rơi khi hạ quân (mục 4.3) |
| 11 | B2 | `ICON_SK_LND_TO_LICH_SHIELD` | icon | 32×32 → 128×128 | `idle` 1 | mục 5 |
| 12 | B2 | `ICON_SK_LND_SUPPLY` | icon | 32×32 → 128×128 | `idle` 1 | Lương thảo dồi dào |
| 13 | B2 | `ICON_SK_LND_TIDE` | icon | 32×32 → 128×128 | `idle` 1 | Triều Cường |

### 1b. Môi trường — `assets/maps-32bit/ly-nam-de/` (thêm vào `maps_lnd.json`)

| # | Gate | Asset ID | Loại | Cỡ logic → ảnh | Ghi chú |
|---|---|---|---|---|---|
| 14 | B1 | `BG_LND_MID_CHU_DIEN` | parallax lớp giữa | 768×160 → 3072×640 | vùng sông nước Chu Diên — **mẫu chốt tông** (mục 6) |

**Dùng lại, không vẽ (Claude khai báo trong code):** lính Lương `EN_LUONG_PATROL` (quân vây NPC), bẫy lưới, thuyền, mặt nước, mỏm đá,
nền sông Hồng `BG_LND_MID_RED_RIVER`, đồi xa `BG_LND_FAR_MIDLANDS`, làng `BG_TT_MID_VILLAGE`, đồi xa đồng trũng `BG_BT_FAR_PLAIN`
(chương 2), trời, tile đất, bia câu hỏi, người chơi, `NPC_LY_BI`/`PORTRAIT_LY_BI`.

## 2. THƯ MỤC, MANIFEST, BẢNG MÀU

- Vùng làm việc (ngoài git): `assets/sprites-32bit/ly-nam-de/` (`npc/`, `portrait/`, `fx/`, `item/`, `icon/`, `concept/`, `raw/`,
  `preview/`, `meta/`) và `assets/maps-32bit/ly-nam-de/` (`bg/`, `raw/`, `preview/`, `meta/`). **Không** sửa `samples/`, thư mục chương
  1–2, manifest chương khác; không đụng `frontend/`.
- `manifest_lnd.json` / `maps_lnd.json`: **chỉ thêm mục mới**. 15 sprite + 6 map của `LND_ART_01` đang `IN_GAME` — **không sửa, không
  xuất lại**. Mục mới status tối đa `NORMALIZED`. Không đưa `CONCEPT_LND_HEROES` vào manifest. Khối `stage` giữ nguyên.
- Nền `BG_LND_MID_CHU_DIEN`: `anchor: "bottom-at-GROUND_Y"`, `tileable_x: true`, như `BG_LND_MID_RED_RIVER`.
- **Bảng màu:** dùng `palette_32_lnd.png` (sprite, 96 màu — có ramp xám tro phe Lương, đỏ thẫm Lý Bí, 3 màu vàng) và
  `palette_map_32_lnd.png` (môi trường, 192 màu). Cần màu mới (vd. xanh nước cho sóng, màu áo quan văn) → **đề xuất ở Gate B1** (màu
  thêm + màu bỏ, đếm pixel đang dùng của màu bỏ = 0), không tự đổi bảng màu đang `IN_GAME`.
- Report: thêm mục "LND_ART_02 — Gate B1/B2" vào `SPRITE_REPORT_LND_32.md` / `MAP_REPORT_LND_32.md` theo mẫu brief mục 6.

## 3. BA NPC

Bối cảnh chung: hào kiệt người Việt ở Giao Châu đầu thế kỷ 6, theo Lý Bí khởi nghĩa chống nhà Lương. Phải **đọc được là người Việt bản
địa**, khác hẳn phe Lương (xám tro, mũ vải thấp, giáp lá) và khác người chơi (áo nâu/chàm đơn giản). Không có ảnh chân dung lịch sử gốc
cho cả 3 người — mọi chi tiết trang phục dưới đây là **diễn giải của game, độ chắc chắn thấp**; Codex hỏi team chỗ nào không chắc.

| Nguồn team (đã duyệt — `docs/SUTA_LND_TASK_00.md` §4) | Dùng cho |
|---|---|
| Phạm Tu — "lão tướng tài ba vùng Thanh Trì", người chỉ huy xây thành lũy ở cửa sông Tô Lịch | 3.1, khiên 4.1 |
| Tinh Thiều — "mưu sĩ, học giả xuất chúng bị nhà Lương khinh miệt", từng xin làm quan bị cho chức gác cổng | 3.2 |
| Triệu Túc — "hào trưởng vùng Chu Diên (Thái phó tương lai)", "cha con ta ở Chu Diên… muốn đem tráng đinh theo về", vùng nhiều đầm lầy, tráng đinh giỏi nghề sông nước; con trai Triệu Quang Phục | 3.3, sóng 4.2 |

### 3.1 `NPC_PHAM_TU`, `PORTRAIT_PHAM_TU` — lão tướng
- **Silhouette:** người già nhưng vững chãi, lưng thẳng; râu tóc bạc búi cao, râu dài. Cao bằng `NPC_LY_BI` (sọ→chân 34 ± 1).
- **Trang phục:** áo chiến màu đất/nâu sẫm, giáp da hoặc giáp lá **cũ, sờn** che ngực (khác giáp đồng sẫm của Lý Bí), khăn/đai đỏ nâu.
  Cầm **cây giáo/kích gỗ cán dài** dựng đứng, không cầm khiên (khiên là FX kỹ năng riêng).
- **Màu nhận diện:** nâu đất + bạc (râu tóc) + điểm đỏ nâu. Không dùng ramp xám tro của phe Lương.
- `talk`: tay không cầm giáo giơ lên chỉ trỏ / vuốt râu; miệng mở-đóng. Chân dung: nửa người, mặt nghiêm, râu bạc, nền như `PORTRAIT_LY_BI`.
- **Không vẽ:** mũ trụ kiểu Trung Hoa có lông/tua, giáp vảy vàng, ngựa.

### 3.2 `NPC_TINH_THIEU`, `PORTRAIT_TINH_THIEU` — học giả, mưu sĩ
- **Silhouette:** người trẻ-trung niên, gầy, dáng thư sinh; áo dài rộng tay, đai vải; tóc búi gọn, khăn vấn đơn giản.
- **Trang phục:** áo vải màu **chàm nhạt / xanh xám** (khác chàm sẫm của lính Ngô chương 2 và xám tro của Lương), cầm **cuộn thẻ tre**
  hoặc quạt. Không giáp, không vũ khí.
- `talk`: mở cuộn thẻ tre / giơ tay giảng giải. Chân dung: nét mặt điềm tĩnh, ánh nhìn sắc.
- **Không vẽ:** mũ cánh chuồn, áo quan bào triều đình (ông bị nhà Lương chê, chưa làm quan to), chữ đọc được trên thẻ tre.

### 3.3 `NPC_TRIEU_TUC`, `PORTRAIT_TRIEU_TUC` — cha con hào trưởng Chu Diên
- Ô 96×48 chứa **2 người**: **Triệu Túc** (trung niên, đứng **bên phải** — gần người chơi khi quay trái, nói chuyện) và **Triệu Quang
  Phục** (thanh niên, bên trái, hơi thấp hơn, tay cầm **mái chèo** hoặc **sào tre**). Cả hai chân trên cùng baseline; pivot ở giữa ô.
- **Triệu Túc:** hào trưởng — áo màu **nâu đỏ / chàm** chắc khoẻ, khăn quấn đầu, đai rộng, có thể cầm **đoản đao**; da rám nắng, tay áo
  xắn (người sông nước). Không giáp nặng.
- **Triệu Quang Phục:** trẻ, gọn gàng, quần xắn ống, nhanh nhẹn; không vẽ thành nhân vật chính.
- `talk`: chỉ **Triệu Túc** cử động tay/miệng; Triệu Quang Phục giữ tư thế idle (vẫn thở nhẹ cùng nhịp idle). Hai người **không xê dịch
  ngang** giữa các ô.
- Chân dung: **chỉ Triệu Túc**, nửa người.
- **Không vẽ:** Triệu Quang Phục cưỡi rồng/thần thoại Dạ Trạch, thuyền dính trong sprite.

## 4. FX VÀ VẬT PHẨM

### 4.1 `FX_LND_TO_LICH_SHIELD` — Khiên Tô Lịch (phím K)
- Hiện **trước người chơi**, cao ~44 px logic, chạm đất (chân ở hàng `frame_h − 2`), quay phải (code lật khi người chơi quay trái).
- Hình: **tấm khiên lớn bằng gỗ ghép + nẹp đồng**, có hoạ tiết **sóng nước / cọc thành lũy** (gợi thành lũy cửa sông Tô Lịch), chân khiên
  cắm xuống đất. Không trong suốt (alpha 0/255).
- `raise` 3 ô: khiên trồi lên từ đất. `hold` 4 ô: đứng yên, ánh sáng viền nhẹ chạy (không đổi hình khiên). `block` 4 ô: rung + vệt
  sáng chỗ trúng đòn. `break` 6 ô: nứt rồi vỡ thành mảnh gỗ văng ra, ô cuối gần như trống (mảnh nhỏ sắp biến mất).
- **Không vẽ:** người chơi, vũ khí địch, chữ.

### 4.2 `FX_LND_TIDE` — sóng Triều Cường (phím L)
- Một **bức sóng nước sông màu xanh lục-nâu phù sa** cao ~80 px logic, mặt trước cuộn bọt trắng, **lao sang phải** (code di chuyển ngang
  qua màn hình — trong sprite sóng **không** trôi ngang, chỉ cuộn tại chỗ). Đáy sóng chạm hàng `frame_h − 2`.
- `surge` 8 ô lặp: cuộn sóng, bọt tung. `fade` 5 ô: sóng sụp xuống thành vệt nước tan.
- Hợp tông với `PROP_LND_RIVER_WATER` (nâu phù sa) nhưng sáng hơn để nổi trên nền; ≤ 40 màu.
- **Không vẽ:** rồng, thần nước, người, thuyền, cá.

### 4.3 `ITEM_LND_HEAL` — bình hồi máu
- **Ống tre đựng thuốc** (hoặc bầu nậm) buộc lá thuốc xanh, đứng thẳng, cao ~12 px logic; đáy ở hàng `frame_h − 2`; dễ thấy trên nền đất
  nâu (viền tối, điểm xanh lá + đỏ nhỏ).
- `idle` 4 ô lặp: lấp lánh nhẹ ở miệng ống (hình không đổi cỡ, không xê dịch).
- **Không vẽ:** hình trái tim, chữ thập đỏ, chai thuỷ tinh hiện đại.

## 5. ICON KỸ NĂNG (32×32 → 128×128)

Cùng khung/viền/độ dày nét với `ICON_SK_BT_*` chương 2 (`assets/sprites-32bit/ba-trieu/icon/`) để HUD đồng bộ:
- `ICON_SK_LND_TO_LICH_SHIELD`: tấm khiên gỗ nẹp đồng hoạ tiết sóng (như 4.1).
- `ICON_SK_LND_SUPPLY`: bó lúa + bao lương thảo + ống thuốc tre nhỏ (gợi "lương thảo" + hồi máu).
- `ICON_SK_LND_TIDE`: con sóng cuộn bọt trắng.
- Không chữ, không số.

## 6. NỀN `BG_LND_MID_CHU_DIEN`

- Vùng **sông nước Chu Diên**: đầm lầy, lau sậy cao, ruộng nước, bờ đất thấp, vài cây gạo/tre, nhà sàn mái lá nhỏ ở xa, **thuyền độc mộc**
  neo trong lau (chỉ trang trí, không vẽ người trên thuyền). Hợp tông với `BG_LND_MID_RED_RIVER` (người chơi đi từ sông Hồng sang đây).
- Như các nền lớp giữa: **không** trời/mây/núi xa (đồi xa là lớp riêng); dải đất đục ở đáy ≥ 24 px logic; mép trên trong suốt; lặp ngang
  không vệt (đo chỗ nối qua 2 bản ghép, không tin cột đầu = cột cuối); ≤ 64 màu từ `palette_map_32_lnd.png`.
- **Không vẽ:** mặt sông chính diện phía trước (khe sông là địa hình + `PROP_LND_RIVER_WATER`), cầu, đình chùa, đồi chè, công trình hiện đại.

## 7. ACCEPTANCE

### Gate B1
1. `CONCEPT_LND_HEROES`: 3 NPC (Triệu Túc kèm con) cạnh `NPC_LY_BI`, `PLAYER_MALE`, `EN_LUONG_PATROL` ở cỡ chơi thật ×1/×2/×3 —
   phân biệt được từng người + không lẫn với phe Lương/người chơi; bảng màu đề xuất (nếu cần).
2. `NPC_PHAM_TU` (`idle`, `talk`): đúng cỡ ×4, số frame, alpha 0/255, pivot bottom-center, quay phải, chân hàng 187 **mọi ô (đo thân
   chính)**, sọ→chân 34 ± 1 (ghi số đo), một hệ số cho cả asset.
3. `BG_LND_MID_CHU_DIEN` lặp ngang không vệt; mockup ×1/×2 với tile mặt đất, 1 khe sông 112 px có `PROP_LND_RIVER_WATER` (mặt nước nâng
   6 px sát mép đất như trong game — xem `maps_lnd.json` hiện tại), `PLAYER_FEMALE`, `EN_LUONG_PATROL`; mockup chuyển cảnh với
   `BG_LND_MID_RED_RIVER` (hoà chéo 192 logic).
4. Report đủ; **dừng**.

### Gate B2
1. Đủ mục 1a + 1b; QA brief mục 5 đạt; manifest khớp file; 21 mục `LND_ART_01` trùng hash trước/sau.
2. NPC: chân hàng 187 mọi ô; `NPC_TRIEU_TUC` 2 người không xê dịch ngang (ghi mép trái/phải từng ô); `talk` cùng cỡ đầu `idle`.
3. FX khiên: chân hàng 187; `break` ô cuối gần trống. FX sóng: đáy hàng 379, không trôi ngang giữa các ô (ghi mép trái thân sóng từng ô).
   Bình máu: đáy hàng 59.
4. Mockup cỡ chơi thật: khiên trước `PLAYER_MALE` (cả quay trái — lật ảnh); sóng phủ 2 `EN_LUONG_PATROL`; bình máu trên mặt đất cạnh
   người chơi; 3 icon trong ô HUD 32 px cạnh `ICON_SK_DASH`/`ICON_SK_ATTACK`.
5. Report đủ; **dừng** chờ duyệt.

## 8. BÁO CÁO & DỪNG

- Ghi report theo mẫu brief mục 6, thêm bảng **"Số đo cho code"**: sọ→chân 3 NPC; tâm Triệu Túc so với pivot ô 96 px (để code đặt
  người chơi dừng đúng chỗ); bề rộng/chiều cao thấy được của khiên (`hold`) và khoảng cách mép trước khiên tới pivot; bề rộng/chiều cao
  thấy được của sóng (`surge`); `visible_bbox` bình máu.
- **Câu hỏi cho team** (bắt buộc ghi): trang phục, màu nhận diện 3 NPC; có cần Triệu Quang Phục riêng cho màn 3/chương sau không; hình
  khiên Tô Lịch; mọi chi tiết lịch sử Codex không chắc.
- **Dừng sau Gate B1**, chờ team duyệt; sau đó làm B2 và **dừng sau Gate B2**. Không vẽ asset màn 3 (Tiêu Tư, máy bắn đá, cận vệ khiên
  sắt, xe hoả công, thành Long Biên…) — thuộc `LND_ART_03`.

---

## 9. SỬA SAU GATE B1 — 02/11/2026 (Claude soát bằng `/asset-review`, người dùng chốt động tác)

| Asset ID | Animation | Kết quả | Việc Codex |
|---|---|---|---|
| `NPC_PHAM_TU` | idle | PASS | **không xuất lại** |
| `NPC_PHAM_TU` | talk | **NEED_REDRAW** (chỉ tay tự do) | Bản hiện tại: cẳng tay tự do **vắt chéo ngực** lên vuốt râu, bàn tay nằm sát tay cầm giáo → ở cỡ chơi thật ×1 hai tay + giáo dính thành một khối trước ngực, trông như tay cầm giáo đang giơ lên. Vẽ lại theo dưới. |

**Động tác `talk` mới (người dùng chốt): giơ bàn tay ra phía sau.**
- Tay tự do (tay xa, phía **sau lưng** khi nhân vật quay phải) co khuỷu, **bàn tay ngửa giơ ngang vai ở phía sau thân** như đang giảng
  giải; các ô lắc nhẹ cổ tay/bàn tay (ví dụ ô 1 hạ, ô 2–3 giơ, ô 4 hạ dần) để đọc được là đang nói.
- Tay tự do **không đi qua phía trước thân** ở bất kỳ ô nào; khoảng cách gần nhất giữa tay tự do và tay cầm giáo **≥ 6 px logic** (24 px
  ảnh) mọi ô — ghi số đo từng ô vào report. Ở preview ×1 phải đếm được **2 khối tay tách rời**.
- Giữ nguyên so với `idle`: đầu (cỡ, búi, râu), giáo + tay cầm giáo (vị trí, độ dài), thân, chân, màu, hệ số thu nhỏ 0,346; chân hàng 187
  mọi ô (đo thân chính); thân không trôi ngang. Miệng mở/đóng như bản hiện tại. 4@8 lặp, ≤ 32 màu.
- Chỉ xuất lại `npc_pham_tu_talk.png` + frame cache/GIF/contact sheet của talk. Concept, `idle`, nền Chu Diên **không xuất lại** (ghi hash
  trước = sau).
- Xong thì cập nhật report (số đo trước/sau) và **dừng**; chờ duyệt tiếp Gate B1 (concept + nền vẫn chờ team xem) trước khi làm B2.

## 10. KẾT QUẢ GATE B1 — 02/11/2026 (Claude soát, người dùng duyệt)

| Asset ID | Animation | Kết quả | Ghi chú |
|---|---|---|---|
| `BG_LND_MID_CHU_DIEN` | — | PASS | 3072×640, 64 màu thuộc `palette_map_32_lnd.png`, alpha 0/255, đáy đục 36,25 logic, nối 21 < nội bộ 42, chu kỳ 384 logic — **không xuất lại** |
| `NPC_PHAM_TU` | idle | PASS | chân hàng 187 cả 6 ô, sọ→chân 34–34,5 — **không xuất lại** |
| `NPC_PHAM_TU` | talk | NEED_REDRAW | theo mục 9 (làm trước B2) |
| `CONCEPT_LND_HEROES` | — | **Duyệt**, có 1 điều chỉnh | Phạm Tu, Tinh Thiều, Triệu Túc giữ như concept |

**Điều chỉnh cho B2 (người dùng chốt):** **Triệu Quang Phục** trong `NPC_TRIEU_TUC` đang gần giống `PLAYER_MALE` (áo nâu + đai chàm).
Đổi áo sang **ô liu / xanh rêu**, **bỏ đai và khăn chàm** (dùng đai nâu hoặc vải thô), giữ mái chèo, dáng thanh niên; phải phân biệt được
với `PLAYER_MALE` ở preview ×1 đặt cạnh nhau. Dùng màu có sẵn trong `palette_32_lnd.png`; thiếu màu thì đề xuất trong report, không tự đổi
bảng màu.

**Tiếp theo:** (1) vẽ lại `NPC_PHAM_TU` talk (mục 9); (2) làm **Gate B2** (mục 1, cột Gate = B2) với điều chỉnh trên; acceptance mục 7
Gate B2; báo cáo mục 8; **dừng**.

## 11. KẾT QUẢ GATE B2 — 02/11/2026 (Claude soát, người dùng chốt màu)

Kỹ thuật đạt cả 12 asset (cỡ ×4, alpha 0/255, màu thuộc bảng, ≤ 32 / sóng 40, chân hàng 187 / sóng 379 / bình 59 mọi ô, đo thân chính).

| Asset ID | Kết quả | Việc Codex |
|---|---|---|
| `NPC_PHAM_TU` talk | PASS (khe tay 12,25–13,25 logic) | không xuất lại |
| `NPC_TINH_THIEU`, `PORTRAIT_TINH_THIEU` | PASS | không xuất lại |
| `NPC_TRIEU_TUC` | PASS (dải chân 61–321 cố định; Quang Phục áo rêu xám phân biệt được với `PLAYER_MALE`) | không xuất lại |
| `FX_LND_TO_LICH_SHIELD`, 3 icon `ICON_SK_LND_*` | PASS | không xuất lại |
| `PORTRAIT_TRIEU_TUC` | PASS | không xuất lại (da vàng cam chấp nhận là da rám nắng) |
| `PORTRAIT_PHAM_TU` | **NEED_REDRAW** | Bản hiện tại mặc **áo đỏ + choàng đỏ + giáp lá** gần như trùng `PORTRAIT_LY_BI`, lệch nhận diện sprite. Vẽ lại theo **màu sprite `NPC_PHAM_TU`**: áo chiến + giáp da/giáp lá cũ **nâu đất**, chỉ **đai/khăn đỏ nâu** nhỏ, không choàng đỏ; râu tóc bạc, mặt giữ như bản hiện tại; cùng khung/góc/nền với `PORTRAIT_LY_BI`. |
| `ITEM_LND_HEAL` | **NEED_REDRAW** | Ống tre chỉ rộng 5,25 logic, lá xám → ở ×1 gần như không thấy trên nền đất. Vẽ lại: ống tre/bầu thuốc **rộng ~9–10 logic, cao ~12–13**, viền tối rõ, **lá thuốc xanh lá** (dải màu mới dưới đây) + dây đỏ; đáy hàng 59; 4@8 lặp chỉ lấp lánh, không xê dịch; ghi `visible_bbox`. |
| `FX_LND_TIDE` | **NORMALIZE màu** | Hình, nhịp, mép trái 18 / đáy 379 giữ nguyên. Thêm sắc **xanh lục-rêu** (dải mới) vào thân sóng — nhất là nửa dưới — để tách khỏi dải đất nâu của nền giữa; bọt giữ trắng kem. Không đổi hình dáng/kích thước; ≤ 40 màu. |

**Bảng màu `palette_32_lnd.png` (người dùng chốt: thêm màu xanh):** thêm **một dải 4 màu xanh lá / xanh rêu** (tối → sáng, độ bão hoà vừa,
hợp tông 32-bit hiện có), **thay 4 màu đang 0 pixel** trong toàn bộ ảnh runtime của `manifest_lnd.json` (đếm lại trên cả 21 asset
`IN_GAME` + 12 asset LND_ART_02, ghi số đếm từng màu bỏ vào report). Không đổi màu nào đang được dùng → 21 asset `IN_GAME` và asset
B2 PASS **không xuất lại, hash giữ nguyên**. Ghi mã 4 màu thêm / 4 màu bỏ vào report.

**Tiếp theo:** sửa bảng màu → vẽ lại `PORTRAIT_PHAM_TU`, `ITEM_LND_HEAL` → chỉnh màu `FX_LND_TIDE`; mockup lại bình máu cạnh người chơi
và sóng phủ 2 lính trên nền Chu Diên; báo cáo (số đo trước/sau, hash các asset không đổi); **dừng**.

## 12. KẾT QUẢ SỬA SAU GATE B2 — 02/11/2026 (Claude soát lại, người dùng duyệt)

- `PORTRAIT_PHAM_TU` PASS (nâu đất theo sprite, chỉ đai/khăn đỏ nâu); `ITEM_LND_HEAL` PASS (9×12,75 logic, `visible_bbox` x3,5 y2,25
  w9 h12,75 cả 4 ô, đáy 59, lá xanh); `FX_LND_TIDE` PASS (thêm xanh rêu nửa dưới, bbox/mép trái 18/đáy 379 giữ nguyên 13 ô, 40 màu).
- **Bảng màu `palette_32_lnd.png` = 98 màu — người dùng duyệt 02/11/2026** (ngoại lệ trần 96 của brief): chỉ có 2 màu 0 pixel
  (`#D91E25`, `#A7111D`) → thay bằng `#2F4B2A`, `#4F733A`; thêm 2 ô `#78964D`, `#ACC276`. Không đổi màu đang dùng; 35 strip `IN_GAME`
  trùng hash.
- **LND_ART_02 xong** (14 asset: 12 sprite + 1 nền + concept). Bước tiếp: LND-L2 (nhập asset + màn 2). Prompt này xoá khi LND-L2 xong.
