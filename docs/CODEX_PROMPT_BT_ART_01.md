# CODEX PROMPT — BT_ART_01: ASSET MÀN 1 CHƯƠNG BÀ TRIỆU "RỪNG NÚI NƯA" (32-bit)

Ngày giao: 16/10/2026 • Người giao: team Sử Ta (Claude soạn) • Skill: agent-sprite-forge / `$generate2dsprite` (sprite), `$generate2dmap` (môi trường)

> Đọc **[SUTA_TT_ART_BRIEF_32.md](../SUTA_TT_ART_BRIEF_32.md)** trước — **luật kỹ thuật chung** (mật độ ×4, strip, pivot bottom-center,
> quay phải, baseline, viền, đổ bóng, alpha 0/255, xoá nền bằng flood-fill mép, QA mục 5, mẫu report mục 6) áp dụng nguyên vẹn.
> **Mục 3 của brief (art bible năm 40 SCN) chỉ dùng làm chuẩn phong cách vẽ**; bối cảnh đợt này là **năm 248**, theo mục 3–5 prompt này.
> Prompt mâu thuẫn brief → theo prompt, ghi vào report.

---

## 0. MỤC TIÊU

Chương 2 (Bà Triệu) đang chạy bằng **asset tạm của chương Trưng Trắc**. Đợt này vẽ asset riêng cho **màn 1 "Rừng núi Nưa"**: năm 248,
Triệu Thị Trinh vào núi Nưa (Thanh Hoá) tụ nghĩa quân chống quan lại **nhà Ngô (Đông Ngô, thời Tam Quốc)**. Người chơi là nghĩa sĩ
nam/nữ (`PLAYER_MALE`/`PLAYER_FEMALE` có sẵn — **không vẽ**); Bà Triệu là **NPC dẫn đường** ở đầu màn.

Màn 1 có 8 loại chướng ngại (thiết kế của team): lính đốn gỗ, thợ săn nỏ trong bụi, đá tảng lăn, voi rừng (nhảy lên lưng để qua),
hố chông tre, kỵ binh, chướng khí (leo lên cành cây cao để tránh), **mini-boss tham quan thu thuế** (ném hòm bạc rỗng). Cơ chế đã có
trong engine (đang chạy bằng khối tạm ở `?layout=engine`) — đợt này chỉ vẽ.

**Chia 2 Gate** (phe quân Ngô là nhận diện mới):
- **Gate A1** — concept phe Ngô + 3 asset mẫu chốt nhận diện (mục 1, cột Gate = A1). **Dừng chờ duyệt.**
- **Gate A2** — phần còn lại, sau khi team duyệt A1.

## 1. DANH SÁCH ASSET

Ô logic → ảnh ×4. Số frame/fps theo asset tương đương của chương 1 (`manifest_tt.json`) để giữ nhịp code; số mới ghi `DESIGN_BASELINE`.

### 1a. Sprite — `assets/sprites-32bit/ba-trieu/` (manifest `manifest_bt.json`)

| # | Gate | Asset ID | Loại | Ô logic → ảnh | Animation (frames @fps, lặp?, hit_frame) | Ghi chú |
|---|---|---|---|---|---|---|
| 1 | A1 | `CONCEPT_NGO` | concept | tự do | — | bảng thiết kế phe Ngô, **không vào game** (mục 4.1) |
| 2 | A1 | `EN_NGO_LUMBERJACK` | enemy | 48×48 → 192×192 | `idle` 6@9 lặp • `walk` 8@11 lặp • `attack_01` **10@10** không lặp, hit **7**, `frame_w` **80** • `hurt` 3@12 • `death` 6@12 | lính đốn gỗ, búa tạ vung ngang **chậm** (báo trước dài 0,6 s) — `DESIGN_BASELINE` |
| 3 | A1 | `EN_WILD_ELEPHANT` | enemy | 128×96 → 512×384 | `idle` 6@8 lặp • `walk` 8@10 lặp | voi rừng chưa thuần, **lưng phẳng đứng được** (mục 4.4) |
| 4 | A2 | `PLAYER_BA_TRIEU` | player (dùng làm NPC) | 48×48 → 192×192 | `idle` 6@9 • `run` 8@16 (**có sẵn** ở `samples/`) + **mới** `talk` 4@8 lặp | chép từ samples, không vẽ lại idle/run (mục 3) |
| 5 | A2 | `PORTRAIT_BA_TRIEU` | portrait | 64×64 → 256×256 | `idle` 1 (**có sẵn**) | chỉ chép từ samples |
| 6 | A2 | `EN_NGO_HUNTER` | enemy | 48×48 → 192×192 | `idle` 6@8 lặp • `throw` 8@16 không lặp, hit **5** (= bắn nỏ; tên `throw` là tên chuẩn engine dùng cho hành động bắn) • `hurt` 3@12 • `death` 6@12 | thợ săn quan lại nấp **trong bụi rậm** (bụi vẽ liền trong sprite, mục 4.3) |
| 7 | A2 | `PJ_CROSSBOW_BOLT` | projectile | 16×8 → 64×32 | `idle` 1 | tên nỏ ngắn bay ngang |
| 8 | A2 | `OB_BOULDER` | obstacle | 32×32 → 128×128 | `roll` 8@18 lặp • `break` 5@12 không lặp | đá tảng lăn, chém vỡ được |
| 9 | A2 | `TR_BAMBOO_SPIKE_PIT` | obstacle | 48×16 → 192×64 | `hidden` 1 • `reveal` 6@24 không lặp | hố chông **tre vót** (khác chông sắt `TR_SPIKE_PIT`) |
| 10 | A2 | `EN_NGO_CAVALRY` | enemy | 96×64 → 384×256 | `gallop` 8@18 lặp • `hurt` 3@12 • `death` 6@12 | kỵ binh Ngô, giáo dài (mục 4.5) |
| 11 | A2 | `FX_MIASMA` | fx | 48×48 → 192×192 | `idle` 4@6 lặp • `warn` 4@12 lặp • `active` 6@12 lặp | chướng khí tím; FX **được bán trong suốt** (mục 4.6) |
| 12 | A2 | `EN_NGO_TAX_OFFICIAL` | enemy (mini-boss) | 64×64 → 256×256 | `walk` 8@11 lặp • `idle` 6@9 lặp • `throw` 6@15 không lặp, hit **4** • `hurt` 3@12 • `death` 9@15 không lặp | tham quan thu thuế béo, ném hòm bạc (mục 4.7) |
| 13 | A2 | `PJ_SILVER_CHEST` | projectile | 16×16 → 64×64 | `loop` 6@18 lặp | hòm bạc **rỗng** xoay khi bay |

### 1b. Môi trường — `assets/maps-32bit/ba-trieu/` (manifest `maps_bt.json`)

| # | Gate | Asset ID | Loại | Cỡ logic → ảnh | Ghi chú |
|---|---|---|---|---|---|
| 14 | A1 | `BG_BT_MID_NUA_FOREST` | parallax lớp giữa | 768×160 → 3072×640 | rừng nứa/tre núi Nưa — **mẫu chốt tông môi trường** (mục 5) |
| 15 | A2 | `BG_BT_FAR_NUA` | parallax đồi xa | 960×120 → 3840×480 | dãy Ngàn Nưa xa, đáy y = 230 |
| 16 | A2 | `BG_BT_MID_ROCKY_SLOPE` | lớp giữa | 768×160 | sườn núi đá (vùng đá lăn) |
| 17 | A2 | `BG_BT_MID_SACRED_FOREST` | lớp giữa | 768×160 | rừng thiêng (vùng chướng khí) |
| 18 | A2 | `BG_BT_MID_CAMP` | lớp giữa | 768×160 | doanh trại nghĩa quân trên núi Nưa (cuối màn) |
| 19 | A2 | `PROP_BT_BRANCH` | prop (bục) | 64×16 → 256×64 và bản dài `PROP_BT_BRANCH_LONG` 128×16 → 512×64 | cành cây đứng được — **mặt trên cành = hàng 0 của ảnh** (mục 5.3) |
| 20 | A2 | `ITEM_BT_TINH_HOA` | item | strip 4 ô 16×16 → 256×64 (`frames` 4) | "Quyển Sách Tinh Hoa" (mục 5.4) |
| 21 | A2 | `PROP_BT_CAMP_GATE` + `PROP_BT_CAMP_GATE_OPEN` | prop (đích) | 192×176 → 768×704 | cổng doanh trại; đóng/mở trùng pixel trừ vùng cửa, lòng cổng mở trong suốt (brief 2.3) |

**Dùng lại, không vẽ:** trời `BG_TT_SKY_DAY`, tileset mặt đất + địa hình `TILESET_TT_GROUND`/`TILESET_TT_TERRAIN`, lớp giữa làng
`BG_TT_MID_VILLAGE` (đầu màn — làng Quan Yên), bia câu hỏi `PROP_TT_QUIZ_STELE`, người chơi + icon chung. Claude khai báo trong code.

## 2. THƯ MỤC, MANIFEST, BẢNG MÀU

- Vùng làm việc (ngoài git): **`assets/sprites-32bit/ba-trieu/`** (cấu trúc brief mục 4: `<category>/<ID>/<id_lower>_<animation>.png`,
  `raw/`, `preview/`, `meta/`; concept ở `concept/`) và **`assets/maps-32bit/ba-trieu/`** (`bg/`, `props/`, `items/`, `raw/`,
  `preview/`, `meta/`). **Không** sửa `assets/sprites-32bit/` của chương 1, `samples/`, `manifest_tt.json`, `maps_tt.json`; không đụng `frontend/`.
- `manifest_bt.json`: cùng định dạng `manifest_tt.json`, `chapter: "ba-trieu"`, `density: 4`, `pivot: bottom-center`, `facing: right`,
  status tối đa `NORMALIZED`. `PLAYER_BA_TRIEU`, `PORTRAIT_BA_TRIEU`: **chép mục từ `samples/manifest_samples.json`** + file ảnh sang
  thư mục `ba-trieu/` (giữ nguyên ID, idle/run), chỉ thêm animation `talk`. Không đưa `CONCEPT_NGO` vào manifest.
- `maps_bt.json`: cùng định dạng `maps_tt.json`; khối `stage` = `{canvas_w 480, canvas_h 270, stage_length 9216, ground_y 248,
  tile_size 16}` (`DESIGN_BASELINE` — màn 1 dự kiến 12 chunk). Nền lặp ngang (`anchor` như `BG_TT_*` tương ứng); `PROP_BT_BRANCH*`
  `anchor: "top-left"`, `pivot {x: 0, y: 0}`; cổng `anchor: "bottom-center-at-GROUND_Y"`, `pivot {x: 96, y: 176}`; item `anchor: "center"`.
- **Bảng màu sprite:** dùng `samples/palette_32_bt.png` (đã đủ 96 màu). Phe Ngô **ưu tiên màu sẵn có** (sắt, đen, đỏ son, da, gỗ).
  Cần màu mới cho màu nhận diện phe Ngô (mục 4.1) → đề xuất ở Gate A1 kèm danh sách màu ít dùng có thể thay; **không tự thêm/đổi**
  khi chưa được duyệt. Mỗi asset ≤ 32 màu (voi ≤ 40, mini-boss ≤ 36).
- **Bảng màu môi trường:** tạo `assets/maps-32bit/ba-trieu/palette_map_32_bt.png` (≤ 192 màu) **kế thừa** `palette_map_32_tt.png`
  (đất, cỏ, gỗ/tre, lá, đá, trời) — ghi số màu giữ/bỏ/thêm vào report.
- Report: `assets/sprites-32bit/ba-trieu/SPRITE_REPORT_BT_32.md` và `assets/maps-32bit/ba-trieu/MAP_REPORT_BT_32.md` theo mẫu brief mục 6.

## 3. BÀ TRIỆU (NPC dẫn màn) — chỉ thêm `talk`

- Nhận diện **đã có** ở đợt mẫu 09/10 (`samples/`): áo vàng nghệ + giáp da, tóc búi + trâm vàng, kiếm sắt thẳng, guốc ngà. Ảnh mẫu là
  chuẩn — **không vẽ lại** `idle`/`run`, không đổi màu.
- `talk` 4@8 lặp: đứng như `idle`, kiếm hạ, **tay trái giơ chỉ về phía trước (phải)**, miệng/đầu nhún nhẹ. Baseline, tỉ lệ thân trùng
  `idle` từng pixel ở vùng chân.
- Không vẽ jump/attack/hurt/death (NPC không chiến đấu ở màn 1).

## 4. PHE QUÂN NGÔ — TƯ LIỆU & THIẾT KẾ

### 4.1 Tư liệu (Claude tra cứu 16/10 — **độ chắc chắn ghi từng dòng**, chỗ thấp cần team duyệt ở Gate A1)

| Dữ kiện | Độ chắc chắn | Nguồn |
|---|---|---|
| Quân Trung Hoa từ Chiến Quốc tới Tam Quốc chủ yếu mặc **giáp lá (lamellar, 札甲)** sắt hoặc da; giáp tương đối nhẹ, ít tấm lớn | trung bình–cao | [Chinese armour — Wikipedia](https://en.wikipedia.org/wiki/Chinese_armour) |
| Văn bản thời Tam Quốc (biểu của Tào Thực, nước Nguỵ) liệt kê các loại giáp: hắc quang, minh quang, **lưỡng đương (裲裆 — 2 mảnh trước ngực/sau lưng, nối dây vai)**, giáp xích, giáp ngựa; đây là loại **hiếm, cao cấp**; giáp ngựa rất hiếm (Quan Độ chỉ có 300 bộ) | trung bình (văn bản Nguỵ, không phải Ngô; hình dạng minh quang còn tranh cãi) | [明光铠 — Wikipedia](https://zh.wikipedia.org/zh-hans/%E6%98%8E%E5%85%89%E9%8E%A7), [Baidu: 明光铠](https://baike.baidu.com/item/%E6%98%8E%E5%85%89%E9%93%A0/7644490), [cne3online: 曹植铠表](https://www.cne3online.com/culture/view/12280608/122835084011701.shtml) |
| **Nỏ** là vũ khí chủ lực của bộ binh/kỵ binh thời Hán–Tam Quốc | cao | [Chinese armour](https://en.wikipedia.org/wiki/Chinese_armour), [warhistory.org](https://warhistory.org/article/chinese-military-history-ii) |
| Tượng kỵ mã mộ tướng Ngô **Đinh Phụng (mất 271)**: chỉ **bàn đạp 1 bên để lên ngựa**; đôi bàn đạp sớm nhất ~322 → kỵ binh năm 248 **không có đôi bàn đạp** | cao | [The Paper](https://www.thepaper.cn/newsDetail_forward_29935344), [Jin military — Wikipedia](https://en.wikipedia.org/wiki/Military_history_of_the_Jin_dynasty_and_the_Sixteen_Kingdoms) |
| Tượng **kỵ sĩ thời Tôn Ngô ở Ngạc Châu**: đội **mũ nhỏ đầu nhọn**, ngồi thẳng, ngựa có dây cương + yên; tượng người hầu búi tóc, áo cổ kín tay hẹp | trung bình (tượng gốm nhỏ, không rõ giáp) | [Ezhou gov — 孙吴青瓷偶人](https://www.ezhou.gov.cn/zjez/ezrw/ezwy/201812/t20181205_176973.html) |
| Trang phục **quan lại Ngô** ở Giao Châu | **thấp — chưa tìm được nguồn** | — |
| Trang phục người Việt Cửu Chân thế kỷ 3 | **thấp — chưa tìm được nguồn** | [Vietnamese clothing — Wikipedia](https://en.wikipedia.org/wiki/Vietnamese_clothing) (chỉ nói chung) |

### 4.2 Ngôn ngữ phe Ngô (thiết kế game, `DESIGN_BASELINE`)

- Vẫn là "quân phương Bắc" như quân Hán của chương 1 (brief 3.2): **áo vạt chéo, giáp lá sắt xám, khăn/mũ vải, kích/kiếm thẳng/nỏ**,
  tông lạnh–tối. Để **phân biệt với quân Hán** chương 1 (đen + đỏ son), phe Ngô dùng **màu nhận diện riêng do Codex đề xuất ở concept**
  (gợi ý: vải xanh rêu sẫm/xanh chàm sẫm + nâu da, điểm nhấn đỏ son nhỏ) — đây là **quy ước game, không phải khẳng định lịch sử**.
  Concept trình 2 phương án màu cạnh `EN_HAN_GUARD`.
- Lính thường: giáp lá **ngắn** (che ngực–bụng, có thể kiểu lưỡng đương 2 mảnh) trên áo vải; **mũ vải nhỏ đầu nhọn** hoặc khăn vấn
  (theo tượng Ngạc Châu) — **không** mũ sắt kín, không giáp tấm, không giáp xích toàn thân.
- Khiên/cờ/áo **không chữ** (brief 3.5).

### 4.3 Từng lính

- **`EN_NGO_LUMBERJACK`** (lính đốn gỗ phá rừng): áo vải xắn tay, giáp lá ngắn hoặc không giáp, **búa tạ cán dài** (đầu sắt nặng). Dáng
  khoẻ, chậm. `attack_01`: kéo búa ra sau **rất rõ** (ô 1–6) → vung ngang ở ô **7** (đầu búa chạm mép phải ô 80) → mất đà thu về (ô 8–10).
  Tầm đầu búa ở ô 7 ghi số px vào report (Claude tính vùng sát thương).
- **`EN_NGO_HUNTER`** (thợ săn của quan lại): áo vải tối, khăn, **nỏ**. Nấp **sau bụi cây thấp** vẽ liền trong sprite (bụi đứng yên, cao
  ~20 px logic, che nửa dưới người); `idle`: chỉ lộ đầu + nỏ, `throw`: nhổm dậy, giương nỏ, bắn ở ô 5, ngồi xuống. Tên nỏ sinh từ đầu nỏ —
  ghi độ cao đầu nỏ ở ô 5 (px logic từ chân) vào report.
- **`EN_NGO_CAVALRY`**: ngựa nâu/đen, **yên + dây cương, không đôi bàn đạp, không giáp ngựa**; người cưỡi giáp lá, **giáo dài** chĩa
  ngang về phía trước. Cùng tỉ lệ với `EN_HAN_CAVALRY` nhưng khác màu phe. (Kỵ binh "thiết giáp" là việc của đợt màn 3, không vẽ ở đây.)
- **`EN_NGO_TAX_OFFICIAL`** (mini-boss): **quan thu thuế béo ịch**, áo bào dài màu phe Ngô, đai lưng, mũ quan vải (độ chắc chắn **thấp**:
  vẽ mũ vải đơn giản, không mũ cánh chuồn/mũ triều đời sau), mặt đỏ, tham lam; kéo theo **hòm bạc** (hòm gỗ đai sắt). `throw`: ôm hòm
  rỗng ném bằng 2 tay, rời tay ở ô 4. `death`: ngã ngửa, hòm đổ ra trống rỗng (không vàng bạc tràn — hòm **rỗng** theo thiết kế).
- **`PJ_SILVER_CHEST`**: hòm gỗ nhỏ đai sắt, nắp bật, xoay 6 ô; **`PJ_CROSSBOW_BOLT`**: tên nỏ ngắn, đầu sắt, đuôi lông.

### 4.4 `EN_WILD_ELEPHANT` (voi rừng chưa thuần)

- Voi **xám-nâu bụi đất** (khác hẳn voi trắng một ngà của Bà Triệu), **2 ngà ngắn**, tai lớn, dáng hung, đầu cúi húc.
- **Lưng phẳng đứng được**: đường lưng gần thẳng trên ≥ 56 px logic bề ngang giữa ô; **mặt lưng cao 48–50 px logic tính từ chân**
  (người chơi đứng lên đó). Không bành, không yên, không người cưỡi.
- `walk` hướng **phải** (code lật khi đi trái), thân nhấp nhô ≤ 1 px logic để người chơi đứng trên không bị rung mạnh. Ghi chiều cao
  đường lưng từng ô vào report.

### 4.5 Không vẽ (phe Ngô)

- Giáp/mũ kiểu phim cổ trang Tam Quốc hiện đại (giáp vảy vàng, mũ sư tử, áo choàng đỏ lớn), giáp minh quang gương tròn lớn, giáp ngựa,
  đôi bàn đạp; chữ "吴/Ngô" trên cờ/khiên; súng, thuốc súng.

### 4.6 `FX_MIASMA` (chướng khí rừng thiêng)

- Cột khí **tím bụi** (bão hoà vừa, không neon) bốc lên từ khe đất: `idle` (tắt) = khe đất nứt + vài sợi khói tím thấp ≤ 4 px logic;
  `warn` = khí tụ sát đất, cao ≤ 10 px, nhấp nháy; `active` = cột khí cao **44 px logic**, rộng 48, có lõi đậm + mép tan.
- Được **bán trong suốt** (alpha nhiều mức) như FX lửa; đáy chạm baseline. Không sọ người, không mặt quỷ.

### 4.7 Hố chông tre, đá lăn

- `TR_BAMBOO_SPIKE_PIT`: như `TR_SPIKE_PIT` (hố nông 48×16, `hidden` có cỏ/lá che, `reveal` chông trồi) nhưng chông **tre vót vàng-nâu**.
- `OB_BOULDER`: đá xám rêu tròn ~28 px logic, `roll` lăn tròn (vân đá xoay theo), `break` vỡ thành mảnh rồi tan.

## 5. MÔI TRƯỜNG MÀN 1 (năm 248, Thanh Hoá)

### 5.1 Tư liệu

- **Núi Nưa (Ngàn Nưa)**: dãy núi cao nhất vùng đồng bằng nam Thanh Hoá (nay giáp Triệu Sơn – Nông Cống – Như Thanh), chạy hướng tây
  bắc – đông nam; tương truyền xưa là **rừng nứa bạt ngàn**, nhiều gỗ quý — độ chắc chắn **trung bình–thấp** (báo chí, du lịch:
  [Báo Pháp luật — Linh khí Ngàn Nưa](https://baophapluat.vn/linh-khi-ngan-nua-post117399.html),
  [Báo Văn hoá — quy hoạch di tích](https://baovanhoa.vn/van-hoa/tro-thanh-trung-tam-du-lich-van-hoa-tam-linh-127796.html)).
- Năm 248 **không** có đền Nưa, Am Tiên (công trình thờ về sau) — **không vẽ đền, am, chùa**.

### 5.2 Từng lớp

- **`BG_BT_FAR_NUA`**: dãy núi đá–đất phủ rừng, đỉnh nhấp nhô, xa nhạt xanh-xám (brief 3.4).
- **`BG_BT_MID_NUA_FOREST`** (mẫu A1): rừng **nứa/tre** dày xen cây gỗ lớn, bụi rậm, dây leo; khoảng hở để lớp xa lộ ra; phần dưới đất
  cỏ đục liền (brief 2.3). Tông xanh lá trầm, không tranh với nhân vật.
- **`BG_BT_MID_ROCKY_SLOPE`**: sườn núi đá vôi/đá xám, đá tảng, cây bụi bám đá.
- **`BG_BT_MID_SACRED_FOREST`**: rừng già âm u, cây đa/si rễ phụ, sương tím **rất nhạt** ở chân cây (gợi chướng khí, không che sân chơi
  dải 60–110 px trên `GROUND_Y`).
- **`BG_BT_MID_CAMP`**: doanh trại nghĩa quân Việt mộc mạc: lều/nhà sàn tre lá, rào tre, giá vũ khí (giáo, cung), lò rèn ngoài trời,
  cờ vải trơn **không chữ**. Ngôn ngữ phe Việt (brief 3.2) nhưng **bớt lông chim/hoạ tiết Đông Sơn** (cách năm 40 hơn 200 năm; độ chắc
  chắn thấp — ghi câu hỏi cho team).
- Hai lớp giữa kề nhau hoà chéo 192 px logic: đất/cỏ phần dưới cùng độ cao, cùng tông với `BG_TT_MID_VILLAGE` (đầu màn) và với nhau.

### 5.3 `PROP_BT_BRANCH` / `PROP_BT_BRANCH_LONG` (bục cành cây)

- Cành cây ngang to, vỏ nâu, vài chùm lá; **mặt trên phẳng nằm đúng hàng 0 của ảnh** (code đặt góc trên-trái ảnh tại mặt bục), bề dày
  thân cành 6–8 px logic, lá rủ xuống dưới được. Hai đầu cành tự nhiên (gãy/thu nhỏ), không cắt phẳng.

### 5.4 `ITEM_BT_TINH_HOA` (Quyển Sách Tinh Hoa)

- **Cuộn thẻ tre buộc dây vàng nghệ** (đồng bộ màu Bà Triệu), khác bình thư chương 1 (thẻ tre dây đỏ) — năm 248 không dùng sách giấy
  đóng gáy. Strip 4 ô lấp lánh nhẹ (1 điểm sáng di chuyển), như `ITEM_BINH_THU`.

### 5.5 `PROP_BT_CAMP_GATE` (+ `_OPEN`)

- Cổng trại bằng **cọc tre/gỗ, mái lá**, 2 cánh phên tre; bản mở: 2 cánh mở vào trong, lòng cổng trong suốt. Không mái ngói, không chữ.

## 6. ACCEPTANCE

### Gate A1
1. `CONCEPT_NGO`: lính Ngô thường đứng cạnh `EN_HAN_GUARD` ở cỡ chơi thật — **2 phương án màu**, phân biệt được 2 phe bằng màu + mũ;
   chọn 1 phương án vẽ tiếp; bảng màu đề xuất (màu mới nếu có + màu thay ra).
2. `EN_NGO_LUMBERJACK`, `EN_WILD_ELEPHANT` đủ animation ở bảng 1a; đúng cỡ ×4, đúng số frame, alpha 0/255, pivot bottom-center, quay
   **phải**, baseline đúng brief 2.2 (voi: 376–379); nhịp `attack_01` đúng 10@10 hit 7.
3. Voi: ảnh `preview/elephant_back.png` vẽ đường mặt lưng (đỏ, chỉ trên preview) từng ô + `PLAYER_MALE` đứng trên lưng ở cỡ chơi thật.
4. `BG_BT_MID_NUA_FOREST`: lặp ngang không vệt (QA brief mục 5.4); mockup ×1 và ×2 với tile `TILESET_TT_GROUND`, `PLAYER_FEMALE`,
   `EN_NGO_LUMBERJACK`: nhân vật nổi rõ hơn nền.
5. Report đủ mục; status tối đa `NORMALIZED`. **Dừng.**

### Gate A2
1. Đủ mục 1a + 1b còn lại; QA brief mục 5 (1–8) đạt; `manifest_bt.json`, `maps_bt.json` khớp file.
2. `PLAYER_BA_TRIEU`: idle/run giống hệt bản samples (so pixel), `talk` cùng baseline.
3. Mockup cỡ chơi thật (logic ×1 và N = 2, 3) cho từng vùng: làng TT → rừng nứa → sườn đá → rừng thiêng → doanh trại, với đủ 8 loại
   chướng ngại + `PROP_BT_BRANCH` trên `FX_MIASMA` (`active`): người chơi trên cành cao 60 px logic **không chạm** cột khí 44 px.
4. Cổng đóng/mở trùng pixel trừ vùng cửa; item 4 ô; nền hoà chéo đúng brief 2.3.
5. Report đủ; **dừng** chờ duyệt.

## 7. BÁO CÁO & DỪNG

- Ghi `SPRITE_REPORT_BT_32.md` / `MAP_REPORT_BT_32.md` theo mẫu brief mục 6, thêm bảng **"Số đo cho code"**: tầm đầu búa ô 7
  (`EN_NGO_LUMBERJACK`), độ cao đầu nỏ ô 5 (`EN_NGO_HUNTER`), độ cao tay ném ô 4 (`EN_NGO_TAX_OFFICIAL`), đường lưng voi từng ô,
  `visible_bbox` của cành, đá, cổng.
- **Câu hỏi cho team** (bắt buộc ghi): màu nhận diện phe Ngô; mũ/trang phục quan thu thuế; mức dùng hoạ tiết Đông Sơn cho người Việt
  năm 248; mọi chi tiết lịch sử Codex không chắc.
- **Dừng sau Gate A1**, chờ team duyệt; sau đó làm A2 và **dừng sau Gate A2**. Không vẽ asset màn 2–3 (NPC chiêu mộ, Bạch Tượng,
  Lục Dận…) — thuộc `BT_ART_02`, `BT_ART_03`.

---

## 8. PHẢN HỒI GATE A1 (Claude soát 17/10/2026 — `/asset-review`)

Quyết định của người dùng (17/10): **phe Ngô = phương án B, chàm sẫm `#34407A`** (duyệt); **giữ rìu** cho `EN_NGO_LUMBERJACK` (Excel
của team ghi "búa tạ quai ngang" — ghi khác biệt này vào report, chờ team); **voi rừng KHÔNG đổi thành voi trắng** — người dùng không
yêu cầu thay đổi đó. Giữ đúng mục 4.4: voi **xám-nâu, hai ngà ngắn**; voi trắng một ngà là Bạch Tượng (đợt `BT_ART_02`).

| Asset ID | Animation | Kết quả | Số đo / lý do |
|---|---|---|---|
| `CONCEPT_NGO` | — | PASS | B (chàm) phân biệt rõ với `EN_HAN_GUARD` (đen–đỏ, mũ sắt, khiên) ở cỡ chơi thật |
| `EN_NGO_LUMBERJACK` | `idle`, `walk` | PASS | đúng cỡ, alpha 0/255, 32 màu, baseline 185 mọi ô, thân cao 136 px, tỉ lệ ổn định giữa các ô |
| `EN_NGO_LUMBERJACK` | `attack_01` | **NORMALIZE** (vẽ lại nếu nguồn không đủ) | **thân nhảy chỗ và đổi tỉ lệ giữa các ô**: nửa trên ô 1–2 ở x≈89–154 (ảnh), ô 3 ở x≈178–238 (lệch ~+22 px logic), ô 7 lại về x≈155–190; ô 3–6 nhỏ hơn idle (cao 107 px, đầu nhỏ rõ), ô 8–10 to hơn idle. Chân phải đứng yên quanh pivot (x = 160 ảnh) như idle, chỉ thân + rìu chuyển động |
| `EN_NGO_LUMBERJACK` | `hurt` | **NORMALIZE** | người **to hơn idle ~20%**: dáng khom nhưng vẫn bị kéo cao đủ 136 px (script chuẩn hoá chiều cao bbox từng ô) |
| `EN_NGO_LUMBERJACK` | `death` | **NORMALIZE** | ô 3–4 (quỳ/gục) to hơn idle rõ — cùng nguyên nhân |
| `EN_WILD_ELEPHANT` | `idle`, `walk` | **NEED_REDRAW** | (1) sai nhận diện: voi trắng một ngà → phải là voi xám-nâu hai ngà (mục 4.4); (2) **lưng bị cắt phẳng** thành đường thẳng tuyệt đối như mặt bàn — cần đường lưng tự nhiên, chỉ *gần* phẳng ≥ 56 px logic; (3) thân **dài bất thường** (rộng 124 px logic so với cao 54 — như bị kéo ngang), cần tỉ lệ voi thật; (4) thân đổ bóng **mịn như gradient có vệt dải** — brief 2.4 yêu cầu mảng bóng 3–5 tông rời; (5) `walk` ô 5–6 có **cụm pixel rời 15–16 px** dưới vòi |
| `BG_BT_MID_NUA_FOREST` | — | PASS (chờ team xem tông khi chạy thử) | 3072×640, 64 màu, alpha 0/255, đáy đục; ghép 2 bản không thấy vệt, mặt đất liền; nhân vật đọc được ở ×1/×2 |

**Việc cho Codex (vẫn là Gate A1, chưa sang A2):**
1. `EN_NGO_LUMBERJACK` `attack_01`, `hurt`, `death`: xử lý lại với **một hệ số thu nhỏ duy nhất cho cả asset** (lấy theo `idle`), không
   chuẩn hoá chiều cao bbox từng ô; **neo chân** (pivot bottom-center) cố định như `idle`. Nếu ảnh nguồn các pose không cùng tỉ lệ thì
   generate lại các pose đó (`NEED_REDRAW`). Giữ 10@10 hit 7, `frame_w` 80; báo lại tầm đầu rìu ô 7.
2. `EN_WILD_ELEPHANT`: vẽ lại theo mục 4.4 (xám-nâu, hai ngà ngắn, tỉ lệ thật), đường lưng tự nhiên gần phẳng ở 48–50 px logic, đổ bóng
   mảng rời, không cụm pixel rời; lặp lại `preview/elephant_back.png`.
3. Ghi report "bản sửa 2", dừng ở Gate A1 chờ duyệt.

---

## 9. PHẢN HỒI GATE A2 + LỖI A1 CÒN TỒN (Claude soát 17/10/2026 — giao sửa một lượt)

> **Đính chính report:** report A2 ghi "Gate A1 đã được người dùng duyệt" — **không đúng**. Người dùng chỉ duyệt concept phe Ngô (B),
> `idle`/`walk` lính đốn gỗ và nền rừng nứa. Các file `EN_NGO_LUMBERJACK` (`attack_01`, `hurt`, `death`) và `EN_WILD_ELEPHANT`
> **chưa được sửa** (ảnh không đổi so với lần soát mục 8) — vẫn phải sửa trong lượt này.

Quyết định người dùng (17/10): quan thu thuế cao **~44 px logic**; **được thay 4 màu ít dùng** trong `samples/palette_32_bt.png`
bằng 4 tông **tím bụi** (sáng → tối) cho chướng khí — ghi rõ 4 màu bị thay vào report, kiểm lại các asset đã dùng 4 màu đó.

### 9.1 Bảng kết quả

| Asset ID | Animation | Kết quả | Số đo / lý do |
|---|---|---|---|
| `EN_NGO_LUMBERJACK` | `attack_01`, `hurt`, `death` | **NORMALIZE** (tồn từ A1) | xem mục 8 — tỉ lệ đổi giữa các ô, thân nhảy chỗ; `hurt` to hơn idle ~20% |
| `EN_WILD_ELEPHANT` | `idle`, `walk` | **NEED_REDRAW** (tồn từ A1) | vẫn là voi trắng một ngà, lưng cắt phẳng, thân kéo dài, bóng gradient, cụm rời 15–16 px ở `walk` ô 5–6 — xem mục 8 |
| `PLAYER_BA_TRIEU` | `idle`, `run` | PASS | hash trùng bản mẫu |
| `PLAYER_BA_TRIEU` | `talk` | **NEED_REDRAW** | (1) **tay giơ lên nói chuyện đang là tay cầm kiếm** — người dùng yêu cầu: tay giơ chỉ/nói chuyện phải là **tay kia (tay không cầm kiếm)**; tay cầm kiếm giữ kiếm hạ đúng như `idle`; (2) thân cao **136 px**, `idle` **130 px** → `talk` bị phóng to ~5%, phải cùng tỉ lệ `idle` (đầu, thân trùng cỡ) |
| `PORTRAIT_BA_TRIEU` | `idle` | PASS | chép nguyên mẫu |
| `EN_NGO_HUNTER` | `idle`, `throw`, `death` | PASS | baseline 185, 32 màu, bụi liền sprite; đầu nỏ ô 5 cao 20 px logic |
| `EN_NGO_HUNTER` | `hurt` | **NORMALIZE** | ô 1 có các vệt sáng vàng quanh đầu (6 cụm rời) — brief 2.2 không vẽ FX dính thân; bỏ vệt |
| `PJ_CROSSBOW_BOLT` | `idle` | PASS | |
| `PJ_SILVER_CHEST` | `loop` | PASS | hòm rỗng xoay 6 ô đều |
| `OB_BOULDER` | `roll` | **NEED_REDRAW** | 8 ô **không phải một hòn đá xoay** — vân nứt/rêu đổi ngẫu nhiên từng ô nên khi lăn sẽ nhấp nháy; vẽ 1 hòn đá rồi xoay đều (45°/ô hoặc tương đương) |
| `OB_BOULDER` | `break` | **NORMALIZE** | có **mảng cỏ dưới chân** chỉ xuất hiện ở `break` (không có ở `roll`) → hiện bất ngờ khi vỡ; bỏ cỏ hoặc chỉ giữ mảnh đá |
| `TR_BAMBOO_SPIKE_PIT` | `hidden`, `reveal` | PASS | chông tre vàng-nâu đọc được |
| `EN_NGO_CAVALRY` | `gallop`, `death` | PASS (dọn cụm rời) | 10–32 cụm pixel < 64 px mỗi ô — dọn cụm vụn không có chủ đích |
| `EN_NGO_CAVALRY` | `hurt` | **NEED_REDRAW** | người cưỡi + giáo bị **đổi màu vàng/vàng kim** (khác hẳn `gallop`/`death` áo chàm) và **to hơn ~12%** (cao 183–185 px so với 163–169) — giữ đúng màu phe, cùng tỉ lệ `gallop` |
| `FX_MIASMA` | `idle`, `warn`, `active` | **NEED_REDRAW** | `active` là **lưới ô cờ đỏ–xám lạnh (dither vụn, 160–240 cụm rời/ô)** — brief 2.4 cấm; ở cỡ chơi thật (preview rừng thiêng ×2) cột khí gần như không thấy. Vẽ lại bằng **4 tông tím bụi mới**, mảng khối, bán trong suốt được; cột `active` cao 44 px logic, đọc rõ trên nền rừng thiêng; `warn` rõ hơn `idle` |
| `EN_NGO_TAX_OFFICIAL` | mọi animation | **NEED_REDRAW** (tỉ lệ) | (1) cao **245 px ảnh ≈ 61 px logic** → thu về **~44 px logic (~176 px ảnh)**, giữ dáng béo; **một hệ số thu nhỏ cho cả asset**, không chuẩn hoá chiều cao từng ô; (2) `idle` ô 3–4 nhỏ hơn các ô khác; (3) `throw` ô 1 to/bè hơn, ô 4–5 **người nhỏ hẳn** và **có hòm đang bay vẽ trong sprite** — bỏ hòm bay (hòm bay là `PJ_SILVER_CHEST`), ô 4 tay vừa buông, trống; giữ 6@15 hit 4, báo lại toạ độ tay ném ô 4 |
| `BG_BT_FAR_NUA`, `BG_BT_MID_NUA_FOREST`, `BG_BT_MID_ROCKY_SLOPE`, `BG_BT_MID_CAMP` | — | PASS | đúng cỡ, 64 màu, đáy đục, nối lặp đạt (chênh qua nối nhỏ hơn p95 cột kề); hoà chéo đúng |
| `BG_BT_MID_SACRED_FOREST` | — | **NORMALIZE** | sau tán đa/si có **dải rừng xa mờ xanh-xám vẽ trong lớp giữa** — brief 2.3 cấm (rừng xa là việc của lớp xa); bỏ dải này, mở khoảng trống. Độ phủ đục ở 60–90 px logic trên mặt đất đang 83–89% — chừa thêm khe cho lớp xa lộ ra |
| `PROP_BT_BRANCH`, `PROP_BT_BRANCH_LONG` | — | **NORMALIZE** | (1) **63–64 màu** > giới hạn **32 màu/asset** (brief 2.5; prop chương 1 đều ≤ 32); (2) phần gỗ quá mảnh, nhìn như dây leo — làm thân cành dày **6–8 px logic** như prompt 5.3, mặt trên vẫn ở hàng 0 |
| `PROP_BT_CAMP_GATE`, `_OPEN` | — | **NORMALIZE** | hình đạt (khác nhau chỉ trong vùng cửa, lòng mở trong suốt) nhưng **96 / 109 màu** > 32 (cổng Luy Lâu chương 1: 32) — giảm về ≤ 32 |
| `ITEM_BT_TINH_HOA` | — | **NORMALIZE (manifest)** | ảnh đúng (4 ô, 256×64) nhưng mục `maps_bt.json` ghi `w: 16, h: 16` — phải theo `ITEM_BINH_THU`: `w: 64, h: 16, frames: 4, frame_w: 16, frame_h: 16` (engine đọc `w` là bề ngang strip) |

### 9.2 Việc cho Codex (một lượt, rồi dừng chờ duyệt)

1. Sửa **mọi dòng NORMALIZE / NEED_REDRAW** ở bảng 9.1 (gồm cả 2 asset tồn từ A1).
2. Nguyên tắc chung cho mọi sprite nhiều ô: **một hệ số thu nhỏ cho cả asset**, neo chân (pivot bottom-center) cố định, không chuẩn hoá
   chiều cao bbox từng ô; không vẽ đạn/FX dính trong sprite nhân vật.
3. Bảng màu: thay đúng 4 màu cho tím bụi (ghi màu cũ → mới); prop ≤ 32 màu/asset.
4. Xuất lại preview liên quan: `elephant_back.png`, rừng thiêng ×1/×2 (người chơi trên cành + chướng khí `active`), trại ×1/×2 (quan thu
   thuế cạnh người chơi và cổng), tổng quan màn.
5. Report "Gate A2 — bản sửa 1": bảng asset đã sửa + số đo mới; **không ghi "người dùng đã duyệt"** (brief 1.4). Dừng chờ duyệt.

---

## 10. PHẢN HỒI GATE A2 — BẢN SỬA 1 (Claude soát 17/10/2026)

Đã sửa đạt: voi rừng (xám-nâu, hai ngà, lưng 48–50 px logic), lớp giữa rừng thiêng (đã bỏ dải rừng xa), cổng trại (32 màu), cành ngắn,
manifest `ITEM_BT_TINH_HOA`, hòm bay đã tách khỏi quan thu thuế, quan thu thuế cao ~44 px logic, chướng khí `active` (tím mảng khối).

> **Lưu ý:** report ghi kỵ binh `hurt` "không còn vàng kim" — **không đúng**, người cưỡi vẫn màu vàng kim. `EN_NGO_LUMBERJACK` `idle`/`walk`
> (đã PASS) bị xuất lại với tỉ lệ mới (cao 136 → 125/120 px) — chấp nhận vì cả nhóm giờ dùng một hệ số, nhưng lần sau **không xuất
> lại asset đã PASS** nếu không được yêu cầu.

| Asset ID | Animation | Kết quả | Số đo / việc cần làm |
|---|---|---|---|
| `PLAYER_BA_TRIEU` | `talk` | **NEED_REDRAW** | (1) Ở `idle` kiếm nằm ở **tay phía trước (bên phải ảnh)**; ở `talk` kiếm bị **chuyển sang tay phía sau** → khi NPC đổi từ idle sang talk kiếm nhảy tay. Giữ kiếm **đúng tay, đúng tư thế hạ như idle**; tay **còn lại (không cầm kiếm)** giơ lên nói chuyện. (2) Thân vẫn cao **135–136 px** so với idle **130 px** (đầu to hơn rõ). (3) Dùng **32 màu**, mặt/tóc/áo sáng và khác nét so với idle (14 màu) — `talk` phải trông như idle chỉ đổi tư thế tay/miệng: cùng màu, cùng cỡ đầu, cùng nét |
| `EN_NGO_LUMBERJACK` | `attack_01` | **NORMALIZE** | ô **3–8** có **2 mảng rời lơ lửng** ở y ≈ 51–67 px (mỗi mảng 150–300 px, ví dụ ô 3: (187,51)–(214,58) và (103,51)–(123,58)) — mảnh ô bên cạnh của ảnh nguồn còn sót; xoá. Thân, tỉ lệ, nhịp 10@10 hit 7 đạt |
| `EN_NGO_LUMBERJACK` | `death` | **NORMALIZE** | ô 1 cao **78 px** so với idle **125 px** — người nhỏ hẳn ngay khi bắt đầu chết; ô 1 phải cùng cỡ idle rồi mới ngã |
| `EN_NGO_LUMBERJACK` | `idle`, `walk`, `hurt` | PASS | baseline 186, 32 màu |
| `EN_WILD_ELEPHANT` | `idle`, `walk` | PASS | 24 màu, baseline 378, lưng 48–50 px logic; (tuỳ chọn) `idle` ô 4 dáng hơi khác 5 ô còn lại |
| `EN_NGO_HUNTER` | mọi animation | **NORMALIZE** | **bụi và người đổi cỡ giữa các animation**: bề ngang idle **113 px**, throw **151 px**, hurt **79 px**, death **113–123 px**; `hurt` bụi còn đổi sang màu cam. Một hệ số cho cả asset, **bụi giống hệt nhau ở mọi animation** (bụi đứng yên, chỉ người chuyển động) |
| `EN_NGO_CAVALRY` | `hurt` | **NEED_REDRAW** | người cưỡi **vẫn vàng kim** (khác áo chàm của `gallop`/`death`); cao 125–128 px, nhỏ hơn gallop 136–142 px ~10% |
| `EN_NGO_CAVALRY` | `death` | **NORMALIZE** | ô 1 (cao 92 px) ngựa + người **nhỏ hơn gallop rõ** — cùng hệ số với gallop |
| `EN_NGO_CAVALRY` | `gallop` | PASS | |
| `EN_NGO_TAX_OFFICIAL` | `death` | **NORMALIZE** | ô 1 cao ~**101 px** so với idle **176 px** — nhỏ hẳn; ô đầu phải cùng cỡ idle |
| `EN_NGO_TAX_OFFICIAL` | `walk`, `idle`, `throw`, `hurt` | PASS | ~44 px logic, tay ném ô 4 tại (219,125) |
| `FX_MIASMA` | `active` | PASS (màu) | cột tím đọc rõ; **màu lệch bảng 1 đơn vị** (`#746A98`, `#53436E`, `#322A4B`, `#A495C2`… so với `#746A99`, `#54446F`, `#342A4C`, `#A596C3` trong bảng) do làm tròn alpha — đưa về đúng mã bảng |
| `FX_MIASMA` | `idle`, `warn` | **NORMALIZE** | `idle` chỉ còn một sợi khói rộng **7–8 px ảnh (2 px logic)**, **mất khe đất nứt** → lúc tắt người chơi không thấy chỗ phun. Thêm **khe đất nứt rộng ~40–48 px logic** cố định ở cả `idle`, `warn`, `active` (như bản đầu), khói nhỏ trên khe |
| `OB_BOULDER` | `roll` | **NORMALIZE** | đã là một hòn đá xoay, nhưng **tâm đá trôi ngang** giữa các ô (ô 6–8 lệch phải pivot) → khi lăn đá rung; căn tâm đá trùng pivot mọi ô |
| `OB_BOULDER` | `break` | **NORMALIZE** | ô 1 rộng **117 px** so với `roll` **77–81 px** — đá to lên 1,45× khi vỡ; cùng cỡ `roll` |
| `TR_BAMBOO_SPIKE_PIT` | `reveal` | **NORMALIZE** | đáy **58** / rộng **183 px** so với `hidden` đáy **57** / rộng **176 px** — lệch 1 px khi bật; khớp `hidden` |
| `PROP_BT_BRANCH_LONG` | — | **NEED_REDRAW** | là cành ngắn **kéo giãn ngang ×2** (100% dải pixel có độ dài chẵn — "pixel béo", brief 2.4 cấm); thân gỗ mảnh hơn cành ngắn. Vẽ cành dài ở độ phân giải gốc, cùng độ dày gỗ với cành ngắn |
| Còn lại (`PORTRAIT_BA_TRIEU`, `PLAYER_BA_TRIEU` idle/run, `PJ_*`, `TR_BAMBOO_SPIKE_PIT` hidden, mọi nền, `PROP_BT_BRANCH`, cổng, item) | — | PASS | |

**Việc cho Codex:** sửa các dòng NORMALIZE / NEED_REDRAW ở bảng trên; **không xuất lại asset PASS**; xuất lại preview liên quan; report
"Gate A2 — bản sửa 2" (bảng file đã sửa + số đo), không ghi "người dùng đã duyệt"; dừng chờ duyệt.

---

## 11. PHẢN HỒI GATE A2 — BẢN SỬA 2 (Claude soát 17/10/2026)

Đã sửa đạt: `PLAYER_BA_TRIEU.talk` (kiếm giữ đúng tay như idle, tay kia giơ nói; cao 130 = idle, 14 màu), `EN_NGO_LUMBERJACK.death`,
`EN_NGO_HUNTER` (bụi giống hệt mọi animation), `EN_NGO_CAVALRY.death`, `FX_MIASMA` (khe đất cố định, đúng mã màu bảng),
`OB_BOULDER` (tâm cố định, `break` cùng cỡ `roll`), `TR_BAMBOO_SPIKE_PIT.reveal` (rộng 176, đáy 57), cành dài không còn kéo giãn.
Hash các file PASS không đổi — đúng yêu cầu.

| Asset ID | Animation | Kết quả | Số đo / việc cần làm |
|---|---|---|---|
| `EN_NGO_LUMBERJACK` | `attack_01` | **NORMALIZE** | khi xoá 2 mảng rời, ô **3–5 bị xén phẳng ở y = 68** (trước đây đỉnh hình ở y 59–65): **lưỡi rìu và đầu cán bị cắt** (rõ nhất ô 5). Chỉ xoá 2 mảng rời, khôi phục phần rìu/mũ phía trên |
| `EN_NGO_TAX_OFFICIAL` | `death` | **NORMALIZE** | chỉ ô 1 được thay bằng pose idle; **ô 2–9 vẫn ở tỉ lệ nhỏ cũ** (ô 2 cao 141 px, người nhỏ hơn idle rõ — đầu, thân bé hơn) → nhảy cỡ giữa ô 1 và ô 2. Thu/phóng ô 2–9 theo **cùng hệ số với idle** |
| `EN_NGO_CAVALRY` | `hurt` | **NORMALIZE** | đã hết vàng kim, cỡ đúng; nhưng **ngựa sáng/cam hơn** và giáp người cưỡi sáng hơn `gallop` → trông như đổi màu khi trúng đòn. Dùng đúng màu ngựa, áo, giáp của `gallop` |
| `PROP_BT_BRANCH_LONG` | — | **NORMALIZE** | đã vẽ gốc (hết pixel béo) nhưng (1) cành chỉ phủ **x = 82–430 px ảnh (≈ 20–107 px logic)** trong ảnh 128 px logic — lệch trái 20 px logic, không "dài" như tên; (2) **mặt trên phẳng ở hàng 0 chỉ x = 150–326 px ảnh (44 px logic)**, phần còn lại lượn thấp hơn → người chơi sẽ đứng lơ lửng trên đoạn cong. Cần thân cành phủ gần hết bề ngang (như cành ngắn: 17–238 / 256 px) và **mặt trên phẳng ở hàng 0 suốt chiều dài** |
| Còn lại | — | PASS | |

**Việc cho Codex:** sửa 4 dòng NORMALIZE; không xuất lại asset PASS; report "Gate A2 — bản sửa 3"; dừng chờ duyệt.

---

## 12. KẾT LUẬN GATE A2 — BẢN SỬA 3 (Claude soát 17/10/2026): **PASS toàn bộ, chờ người dùng duyệt nhập game**

| Asset ID | Animation | Kết quả | Số đo |
|---|---|---|---|
| `EN_NGO_LUMBERJACK` | `attack_01` | PASS | ô 3–5 đủ rìu/mũ (đỉnh y 65/64/59), không còn mảng rời, 10@10 hit 7 |
| `EN_NGO_TAX_OFFICIAL` | `death` | PASS | cùng tỉ lệ idle (176/176/168/174/…), không nhảy cỡ |
| `EN_NGO_CAVALRY` | `hurt` | PASS | 31 màu đều thuộc bảng màu `gallop`, cao 138–140 px; người cưỡi tối/nhoè hơn `gallop` một chút — xem lại khi chạy thử |
| `PROP_BT_BRANCH_LONG` | — | PASS | bbox x 16–495 / 512, mặt trên phẳng hàng 0 suốt 480 px, 32 màu, không kéo giãn; vân gỗ hơi gãy khúc do căn cột — xem lại khi chạy thử |

Hash các file PASS khác không đổi. Toàn bộ 21 ID của BT_ART_01 đạt ở mức soát ảnh; chưa chạy thử trong engine.

**Câu hỏi còn mở cho team (Codex nêu):** mũ/trang phục quan thu thuế (đang là mũ vải đơn giản, nguồn yếu); mức hoạ tiết Đông Sơn cho
nghĩa quân năm 248 (đang dùng rất ít); lính đốn gỗ dùng rìu thay "búa tạ quai ngang" của Excel.
