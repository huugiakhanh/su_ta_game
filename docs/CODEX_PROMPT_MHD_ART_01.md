# CODEX PROMPT — MHD_ART_01: ASSET MÀN 1 CHƯƠNG MAI HẮC ĐẾ "GÁNH CỐNG HOAN CHÂU" (32-bit)

Ngày giao: 07/11/2026 • Người giao: team Sử Ta (Claude soạn) • Skill: agent-sprite-forge / `$generate2dsprite` (sprite), `$generate2dmap` (môi trường)

> Đọc **[SUTA_TT_ART_BRIEF_32.md](../SUTA_TT_ART_BRIEF_32.md)** trước. **Luật kỹ thuật chung** của brief áp dụng nguyên vẹn: mật độ ×4, strip, pivot bottom-center, quay phải, baseline, chiều cao người 34 ± 1 px logic, viền, đổ bóng, alpha 0/255, xoá nền bằng flood-fill mép, QA mục 5, mẫu report mục 6.
> **Mục 3 của brief (art bible năm 40 SCN) chỉ dùng làm chuẩn phong cách vẽ.** Bối cảnh đợt này là **đầu thế kỷ 8 (khoảng năm 713–722)**, theo mục 4–7 của prompt này.
> Prompt mâu thuẫn brief → theo prompt, ghi vào report.

---

## 0. MỤC TIÊU

Chương 5 (Mai Hắc Đế) hiện chạy bằng **asset tạm của chương Triệu Việt Vương** và hộp dự phòng. Đợt này vẽ asset riêng cho **màn 1 "Gánh cống Hoan Châu"**.

Bối cảnh: đầu thế kỷ 8, vùng Hoan Châu (nay là Nghệ An – Hà Tĩnh) dưới ách nhà Đường. Dân phu bị bắt gánh cống phẩm dưới đòn roi. Mai Thúc Loan đứng lên, đập vỡ cống phẩm, tập hợp dân nghèo.
- Người chơi là nghĩa sĩ nam/nữ (`PLAYER_MALE`/`PLAYER_FEMALE` có sẵn). Đợt này **chỉ thêm 2 animation gánh** cho hai nhân vật đó.
- Mai Thúc Loan là **NPC dẫn đường** đầu màn.

Thứ tự vùng cảnh: đường cống phẩm Hoan Châu → đèo núi → trạm gác nhà Đường (đích).

Cơ chế đã có trong engine, đang chạy bằng hộp tạm ở `?layout=engine` — đợt này **chỉ vẽ**: gánh nặng, xe chặn đường thả dân phu, hổ vồ, hòm rỗng nằm lại.

**Chia 2 Gate:**
- **Gate A1** — asset chốt nhận diện (cột Gate = A1). **Dừng chờ duyệt.**
- **Gate A2** — phần còn lại, làm sau khi team duyệt A1.

## 1. DANH SÁCH ASSET

Ô logic → ảnh ×4. Số frame/fps lấy theo asset tương đương đã `IN_GAME` để giữ nhịp code; số mới là `DESIGN_BASELINE`.

### 1a. Sprite — `assets/sprites-32bit/mai-hac-de/` (manifest `manifest_mhd.json`)

| # | Gate | Asset ID | Loại | Ô logic → ảnh | Animation (frames @fps, lặp?, hit_frame) | Ghi chú |
|---|---|---|---|---|---|---|
| 1 | A1 | `CONCEPT_TANG` | concept (không vào manifest) | tự do | — | 2 phương án màu phe Đường (mục 5.1) |
| 2 | A1 | `PLAYER_MALE` | player (asset **chung**) | 48×48 → 192×192 | **chỉ thêm** `burden_idle` 6@9 lặp, `frame_w` 80 • `burden_run` 8@12 lặp, `frame_w` 80 | gánh cống phẩm (mục 3). **Không** sửa animation khác |
| 3 | A1 | `PLAYER_FEMALE` | player (asset **chung**) | 48×48 → 192×192 | như #2 | theo nhận diện nữ |
| 4 | A1 | `NPC_MAI_THUC_LOAN` | npc | 48×48 → 192×192 | `idle` 6@9 lặp • `talk` 4@8 lặp | Mai Thúc Loan (mục 4) |
| 5 | A1 | `EN_TANG_ESCORT` | enemy | 48×48 → 192×192 | `idle` 6@9 lặp • `walk` 8@14 lặp • `attack_01` 9@18 không lặp, hit **4**, `frame_w` 128 • `hurt` 3@12 • `death` 6@12 | lính áp giải cầm roi (mục 5.2) |
| 6 | A2 | `PORTRAIT_MAI_THUC_LOAN` | portrait | 64×64 → 256×256 | `idle` 1 | chân dung theo `NPC_MAI_THUC_LOAN` |
| 7 | A2 | `NPC_MHD_PORTER` | npc | 48×48 → 192×192 | `idle` 6@9 lặp • `run` 8@16 lặp | dân phu được giải cứu (mục 6.1) |
| 8 | A2 | `EN_TANG_ARCHER` | enemy | 48×48 → 192×192 | `idle` 6@8 lặp • `throw` 8@16 không lặp, hit **5** • `hurt` 3@12 • `death` 6@12 | cung thủ núp lùm (mục 5.3) |
| 9 | A2 | `EN_TANG_JAVELIN` | enemy | 48×48 → 192×192 | `idle` 6@8 lặp • `throw` 8@16 không lặp, hit **5** • `hurt` 3@12 • `death` 6@12 | lính ném lao trên tháp (mục 5.3) |
| 10 | A2 | `EN_TANG_CAVALRY` | enemy | 96×64 → 384×256 | `gallop` 8@18 lặp • `hurt` 3@12 • `death` 6@12 | kỵ binh phi ngang (mục 5.4) |
| 11 | A2 | `EN_TANG_TAX_OFFICIAL` | enemy (mini-boss) | 64×64 → 256×256 | `idle` 6@9 lặp • `walk` 8@11 lặp • `throw` 6@15 không lặp, hit **4** • `hurt` 3@12 • `death` 9@15 | quan thu thuế (mục 5.5) |
| 12 | A2 | `OB_MHD_EMPTY_CHEST` | obstacle | 32×24 → 128×96 | `idle` 1 • `break` 5@12 không lặp | hòm rỗng nằm lại chắn đường (mục 6.2) |
| 13 | A2 | `EN_TIGER` | enemy (**có sẵn**, chương 1) | 64×48 → 256×192 | **chép** toàn bộ từ `manifest_tt.json` + **thêm** `warn` 4@8 lặp • `pounce` 6@9 không lặp | hổ vồ từ hang (mục 6.3) |
| 14 | A2 | `OB_TRIBUTE_CART`, `PJ_SPEAR`, `PJ_OIL_JAR`, `FX_OIL_FIRE` | **có sẵn** (chương 1) | — | **chép nguyên** mục + ảnh từ `manifest_tt.json` | dùng lại, không vẽ lại |
| 15 | A2 | `OB_BOULDER`, `ITEM_LND_HEAL`, `PROP_LUONG_WATCHTOWER`, `PJ_CROSSBOW_BOLT` | **có sẵn** (chương 3) | — | **chép nguyên** mục + ảnh từ `manifest_lnd.json` | đá lăn, bình máu, tháp canh gỗ, tên bay |
| 16 | A2 | `PJ_SILVER_CHEST` | **có sẵn** (chương 2) | — | **chép nguyên** mục + ảnh từ `manifest_bt.json` | hòm gỗ đai sắt đang bay |

### 1b. Môi trường — `assets/maps-32bit/mai-hac-de/` (manifest `maps_mhd.json`)

| # | Gate | Asset ID | Loại | Cỡ logic → ảnh | Ghi chú |
|---|---|---|---|---|---|
| 17 | A1 | `BG_MHD_MID_TRIBUTE_ROAD` | lớp giữa | 768×160 → 3072×640 | đường cống phẩm Hoan Châu — **mẫu chốt tông môi trường** (mục 7.1) |
| 18 | A2 | `BG_MHD_MID_MOUNTAIN_PASS` | lớp giữa | 768×160 | đèo núi, sườn đá, rừng thưa |
| 19 | A2 | `BG_MHD_MID_TANG_CHECKPOINT` | lớp giữa | 768×160 | trạm gác nhà Đường (cuối màn) |
| 20 | A2 | `PROP_MHD_CAVE_MOUTH` | prop | 96×64 → 384×256 | cửa hang tối cho hổ, vẽ **sau** hổ |
| 21 | A2 | `PROP_MHD_BUSH_COVER` | prop (tiền cảnh) | 48×32 → 192×128 | bụi rậm che cung thủ, vẽ **trước** nhân vật; chừa khe để thấy đầu và cung |
| 22 | A2 | `PROP_MHD_CHECKPOINT_GATE` + `PROP_MHD_CHECKPOINT_GATE_OPEN` | prop (đích) | 192×176 → 768×704 | cổng trạm gác gỗ; đóng/mở trùng pixel trừ vùng cửa, lòng cổng mở trong suốt (brief 2.3) |

**Dùng lại, không vẽ** (Claude khai báo trong code):
- trời `BG_TT_SKY_DAY`;
- tileset `TILESET_TT_GROUND`/`TILESET_TT_TERRAIN`;
- bia câu hỏi `PROP_TT_QUIZ_STELE`;
- đồi xa `BG_LND_FAR_MIDLANDS`;
- sách `ITEM_BT_TINH_HOA`.

## 2. THƯ MỤC, MANIFEST, BẢNG MÀU

- **Vùng làm việc** (ngoài git): `assets/sprites-32bit/mai-hac-de/` và `assets/maps-32bit/mai-hac-de/`, cấu trúc brief mục 4.
- **Không** sửa thư mục chương 1–4, `samples/`, các manifest chương khác (trừ mục gánh ở dưới). Không đụng `frontend/`.
- **Animation gánh của người chơi** (asset chung):
  - Nguồn của `PLAYER_MALE`/`PLAYER_FEMALE` nằm trong `assets/sprites-32bit/manifest_tt.json` + thư mục `player/` (bản game: `frontend/static/assets/images/shared/sprites-32bit/manifest_shared.json`, chỉ đọc).
  - Thêm file `player/PLAYER_MALE/player_male_burden_idle.png`, `player_male_burden_run.png`, tương tự `PLAYER_FEMALE`.
  - Thêm **đúng 2 mục animation** vào 2 asset đó trong `manifest_tt.json`.
  - **Không** đổi bất kỳ file/animation/`qa_notes` nào khác của 2 asset. Report ghi hash các file cũ trước/sau để chứng minh không đổi.
- **`manifest_mhd.json`**: cùng định dạng `manifest_tqp.json`, `chapter: "mai-hac-de"`, `density: 4`, `pivot: bottom-center`, `facing: right`, status tối đa `NORMALIZED`.
  - Asset chép (mục 1a #13–16): chép mục + ảnh **giữ nguyên ID, tên animation, số frame**.
  - `EN_TIGER`: chỉ **thêm** 2 animation, các ảnh cũ giữ nguyên từng byte.
  - **Không** đưa `PLAYER_*` vào `manifest_mhd.json`.
- **`maps_mhd.json`**: cùng định dạng `maps_tqp.json`, khối `stage` = `{canvas_w 480, canvas_h 270, stage_length 9216, ground_y 248, tile_size 16}` (`DESIGN_BASELINE`, màn 1 dự kiến 12 chunk).
  - Nền: `anchor: "bottom-at-GROUND_Y"`.
  - `PROP_MHD_CAVE_MOUTH`, `PROP_MHD_BUSH_COVER`: `anchor: "bottom-center"`.
  - Cổng: `anchor: "bottom-center-at-GROUND_Y"`, `pivot {x: 96, y: 176}`.
- **Bảng màu sprite**: chép `assets/sprites-32bit/trieu-quang-phuc/palette_32_tqp.png` (101 màu) thành `palette_32_mhd.png`.
  - Dải màu phe Đường và da ngăm của Mai Thúc Loan cần tông mới → **đề xuất ở Gate A1** (tối đa 10 màu, kèm màu ít dùng có thể thay); **không tự thêm** khi chưa duyệt.
  - Mỗi asset ≤ 32 màu (quan thu thuế ≤ 36).
  - Animation gánh: thân người **chỉ dùng màu đã có trong strip `idle` của chính nhân vật đó**; đòn gánh + sọt dùng màu gỗ/tre sẵn có của bảng.
- **Bảng màu môi trường**: tạo `palette_map_32_mhd.png` (≤ 192 màu) **kế thừa** `assets/maps-32bit/trieu-quang-phuc/palette_map_32_tqp.png`. Report ghi số màu giữ/bỏ/thêm.
- **Report**: `assets/sprites-32bit/mai-hac-de/SPRITE_REPORT_MHD_32.md` và `assets/maps-32bit/mai-hac-de/MAP_REPORT_MHD_32.md` theo mẫu brief mục 6.

## 3. ANIMATION GÁNH CỦA NGƯỜI CHƠI

- **Khi nào dùng:** đầu màn 1, người chơi gánh cống phẩm tới xe cống rồi đập sọt. Lúc gánh chỉ đi và nhảy; `jump`, `hurt` dùng animation sẵn có, nên hai strip mới chỉ cần đứng và đi.
- **Cách gánh:** một **đòn gánh tre** trên vai, hai **sọt tre** treo hai đầu trước và sau người. Đòn gánh nằm dọc theo hướng mặt (nhìn nghiêng thấy cả hai sọt). `frame_w` 80, căn giữa pivot; toàn bộ đòn + sọt nằm trong ô, cách mép ô ≥ 4 px ảnh.
- **Sọt:** nặng trĩu, đáy cách đất ≥ 4 px logic ở mọi ô, có **nắp lá hoặc vải buộc kín** để không cần vẽ hàng bên trong. **Không vẽ quả vải**: chuyện cống vải chưa có bằng chứng tin cậy, team đã bỏ.
- **Thân người:** khom về trước, hai tay giữ đòn gánh. Giữ mặt, tóc, áo, màu, tỉ lệ như `idle`. **Không cầm kiếm** trong hai strip này.
- `burden_idle` 6@9: đứng thở nặng, vai nhún, sọt đung đưa nhẹ ±1 px logic, lệch pha với thân.
- `burden_run` 8@12: bước chậm, nặng nề, **không** phải dáng chạy; vai nhấp theo nhịp bước, sọt lắc ngược nhịp. Code đi ở 60 % tốc độ thường, nên sải chân ngắn hơn `run`.
- Baseline 187, đỉnh sọ khi khom thấp hơn `idle` tối đa 3 px logic. Ghi số đo vào report.

## 4. MAI THÚC LOAN (`NPC_MAI_THUC_LOAN`, `PORTRAIT_MAI_THUC_LOAN`)

- **Tham chiếu:** ảnh thư viện `frontend/static/assets/images/characters/avatar/mai_hac_de.png` (bản nhỏ `thumb/mai_hac_de.webp`). Lấy **khuôn mặt và nhận diện**: nam trung niên khoẻ, mặt vuông, râu ngắn, tóc búi, **khăn trán đỏ** bay, nước da ngăm đen.
- **Tư liệu:** sử triều Nguyễn liên hệ tên Hắc Đế với nước da đen của ông ([Phan Huy Lê](https://his.ussh.vnu.edu.vn/vi/news/nguyen-viet-hoang/khao-cuu-lai-cuoc-khoi-nghia-mai-thuc-loan-gs-vs-phan-huy-le-5743.html)). Da phải **đậm rõ** so với `PLAYER_MALE`, đọc được ở cỡ chơi thật, không tô đen kịt và không biếm hoạ.
- **Trang phục màn 1 — đề xuất, chờ duyệt ở Gate A1:** người lao động: áo ngắn vải thô sẫm màu không tay hoặc xắn tay, quần lửng xà cạp, chân trần, dây lưng vải đỏ sẫm. **Không** áo choàng đen, giáp, thắt lưng đồng như ảnh thư viện: đó là hình tượng Hắc Đế, để dành đợt `MHD_ART_03`.
- **Vũ khí:** đòn gánh tre cầm dọc như gậy, nối ý "từ gánh cống phẩm đến ngọn cờ". Không kiếm.
- Chiều cao 34 ± 1 px logic, vai rộng hơn người thường.
- `idle` 6@9: đứng thẳng, đòn gánh chống đất.
- `talk` 4@8: giữ đòn gánh đúng tay và tư thế như `idle`; **tay còn lại** giơ chỉ về phía trước (phải); đầu nhún nhẹ. Baseline, tỉ lệ đầu–thân, màu trùng `idle`.
- `PORTRAIT_MAI_THUC_LOAN`: bán thân, nhìn sang phải, cùng nét/màu với NPC, cùng khung với `PORTRAIT_TQP`.

## 5. PHE ĐƯỜNG

### 5.1 `CONCEPT_TANG` — chốt ngôn ngữ phe ở Gate A1

Phe mới phải **khác hẳn** 3 phe đã có khi đứng cạnh nhau ở cỡ chơi thật: Hán (đen, đỏ son), Ngô (`EN_NGO_SOLDIER`), Lương (xám tro).

Vẽ `assets/sprites-32bit/mai-hac-de/concept/CONCEPT_TANG.png`: 2 phương án, mỗi phương án 1 lính + 1 ramp 6 màu, đặt cạnh `EN_HAN_GUARD`, `EN_NGO_SOLDIER`, `EN_LUONG_PATROL`:
- **Phương án A — vàng đất:** áo vàng đất, giáp nâu đồng, điểm đỏ gạch.
- **Phương án B — nâu sẫm:** áo nâu sẫm, giáp vàng đồng xỉn, điểm đỏ gạch.

Vẽ `EN_TANG_ESCORT` theo phương án Codex đánh giá dễ đọc hơn; team có thể đổi ở Gate A1.

**Tư liệu (độ chắc chắn trung bình tới thấp, đều là diễn giải cho game):**
- Tượng mộ đời Đường cho thấy giáp ngực hai tấm tròn, mũ có che tai ([Nelson-Atkins](https://art.nelson-atkins.org/objects/10381/tomb-figurine-of-a-warrior)). Giáp nặng đó dành cho tướng; **lính áp giải và lính địa phương chỉ mặc áo vải + giáp da hoặc lá ngắn che ngực**, đội khăn phốc đầu hoặc mũ da.
- Quan lại đội **phốc đầu đen**, mặc **áo bào cổ tròn**, thắt đai ([tổng hợp](https://hanfuway.com/a-comprehensive-guide-to-tang-dynasty-clothing/)). Màu áo theo phẩm cấp, các nguồn lệch nhau; quan địa phương phẩm thấp nên chọn lục hoặc xanh rêu, **không** vàng và tím.
- Áo, khiên, cờ **không chữ** (brief 3.5). Không giáp vàng kiểu fantasy, không mũ sư tử.

### 5.2 `EN_TANG_ESCORT` (lính áp giải)

- Lính nhẹ, không khiên, cầm **roi da dài** ở tay gần người xem. Nhanh nhẹn: `walk` 8@14, dáng hơi chúi.
- `attack_01`: vung roi ra sau (ô 1–3), **quất thẳng** ở ô **4**, đầu roi ra xa **44–48 px logic tính từ pivot**, cao 12–18 px logic từ chân; thu roi (ô 5–9). Ghi tầm và độ cao đầu roi vào report.
- Roi thuộc sprite, không phải FX. Mọi ô cùng một roi, cùng độ dài khi duỗi.

### 5.3 `EN_TANG_ARCHER`, `EN_TANG_JAVELIN`

- `EN_TANG_ARCHER`: áo vải, mũ da, cung gỗ. Thân được bụi che một phần nên **đầu, vai, cung phải đọc rõ ở nửa trên ô**. `throw` kéo cung, tên rời tay ở ô **5**.
- `EN_TANG_JAVELIN`: giáp lá ngắn, ôm bó lao sau lưng. `throw` giơ lao qua đầu, ném ở ô **5**. Đứng trên tháp nên tư thế ném hơi chúi xuống. Tháp canh `PROP_LUONG_WATCHTOWER` có sẵn, mép sàn ở hàng ảnh 80.
- Không vẽ tên, lao đang bay trong strip (brief 2.2).

### 5.4 `EN_TANG_CAVALRY`

- Ngựa cao chân, thân dài, người cưỡi giáp lá, cầm giáo chĩa ngang ra trước. Theo tỉ lệ `EN_NGO_CAVALRY`, cùng phe màu mục 5.1.
- **Gầm ngựa phải thoáng:** người chơi lướt qua dưới bụng ngựa, nên khoảng giữa hai chân trước và sau mở rõ ở mọi ô `gallop`.
- `death`: ngựa khuỵu, người ngã. Không máu me.

### 5.5 `EN_TANG_TAX_OFFICIAL` (mini-boss)

- Quan thu thuế mập, đỉnh sọ **~44 px logic** như `EN_NGO_TAX_OFFICIAL`. Phốc đầu đen, áo bào cổ tròn, đai lưng, túi bên hông, mặt hách dịch.
- Dáng khác `EN_NGO_TAX_OFFICIAL`: áo cổ tròn, không vạt chéo, màu theo mục 5.1.
- `throw`: nhấc hòm bằng hai tay, ném ở ô **4**. Hòm rời tay ở ô 4, ô sau không còn hòm.
- `death` 9@15: ngã ngửa, phốc đầu rơi, hòm đổ.

## 6. DÂN PHU, VẬT, THÚ

### 6.1 `NPC_MHD_PORTER` (dân phu được giải cứu)

- Nam gầy, da nâu sạm, cởi trần hoặc áo ngắn rách, đóng khố hoặc quần xắn, chân trần, tóc búi lệch, khăn vải quấn đầu. **Không** vũ khí. Ngoại hình khác hẳn lính Đường và người chơi.
- **Tư liệu:** tìm thấy bài tổng hợp dẫn Trần Quang Đức (2013) rằng thường dân xưa cởi trần đóng khố là chuyện bình thường; chưa đọc bản gốc. Độ chắc chắn thấp với riêng thế kỷ 8; không thêm hoa văn trống đồng, lông chim.
- `run` 8@16: chạy thoát, hai tay vung, đầu ngoái lại ở vài ô.
- Không vẽ dây trói trong strip.

### 6.2 `OB_MHD_EMPTY_CHEST`

- Hòm gỗ đai sắt rỗng nắp mở hé, **cùng kiểu** `PJ_SILVER_CHEST` nhưng nằm yên trên đất. Thân hòm chiếm khoảng 22×16 px logic, chân ở baseline.
- `idle` 1 ô. `break` 5@12: ván bung, đai sắt rơi, ô cuối còn vài mảnh nhỏ.

### 6.3 `EN_TIGER` — thêm 2 animation

- Ảnh cũ giữ nguyên; animation mới **cùng tỉ lệ, cùng màu, cùng baseline**.
- `warn` 4@8 lặp: hổ hạ thấp người, gầm, đuôi quất. Vẽ tại miệng hang.
- `pounce` 6@9 không lặp: bật lên, thân duỗi dài, hai chân trước vươn ra, móng xoè. Code tự nâng cả con theo đường vòng cung, **sprite không tự nhảy**: chân sau không rời baseline quá 8 px logic trong ô. Ô cuối co chân lại để tiếp đất.

## 7. MÔI TRƯỜNG

### 7.1 `BG_MHD_MID_TRIBUTE_ROAD` (mẫu chốt tông)

Đường đất ven chân núi vùng Hoan Châu: bãi cỏ khô, ruộng cằn, vài nhà sàn thấp lợp lá, cây bàng hoặc cây rừng thưa, gánh sọt bỏ lại ven đường, cọc mốc gỗ. Tông **khô, nắng gắt, vàng nâu**, khác đầm xanh rêu của chương 4 và làng xanh của chương 1. Có thể thấy vài bóng dân phu nhỏ ở xa làm nền, không nổi hơn nhân vật.

**Tư liệu:** vùng Nghệ An – Hà Tĩnh có núi sát đồng bằng. Chi tiết cảnh quan thế kỷ 8 **chưa có nguồn**, độ chắc chắn thấp; ghi câu hỏi nếu cần.

### 7.2 Hai nền còn lại

- `BG_MHD_MID_MOUNTAIN_PASS`: đường đèo, vách đá xám nâu, cây rừng bám sườn, không có dân cư. Đất dưới cùng độ cao và tông với 7.1 để hoà chéo.
- `BG_MHD_MID_TANG_CHECKPOINT`: hàng rào gỗ nhọn, lều lính, kho cống phẩm, cờ trơn không chữ màu phe Đường. Đây là trạm gác địa phương, **không** phải thành lớn hay cung điện.

### 7.3 Prop

- `PROP_MHD_CAVE_MOUTH`: vòm đá thấp, lòng hang tối hẳn, đủ rộng cho hổ 64 px logic đứng trước.
- `PROP_MHD_BUSH_COVER`: bụi lá rậm tông khô, che nửa dưới người, vẽ trước nhân vật.
- `PROP_MHD_CHECKPOINT_GATE`: cổng gỗ hai cánh của trạm gác, chòi trên cổng, mái gỗ đơn giản. Bản `_OPEN` chỉ khác vùng cửa.

## 8. KHÔNG VẼ

Ngoài brief 3.5:
- quả vải, cành vải, sọt vải (dùng nắp che);
- bom, pháo, thuốc súng (thế kỷ 8 chưa có);
- cờ đen, áo choàng đen, giáp của Hắc Đế ở đợt này;
- thành Vạn An, thành Tống Bình;
- máu me, cảnh hành hạ chi tiết (đây là game giáo dục).

## 9. ACCEPTANCE

**Gate A1:**
1. Đúng cỡ, số frame, `frame_w`; baseline 187 mọi ô.
2. Hash file cũ của `PLAYER_MALE`/`PLAYER_FEMALE` không đổi; 2 strip mới đọc được là "gánh nặng" ở cỡ chơi thật, phân biệt `burden_idle` với `idle`.
3. Mockup cỡ chơi thật trên `BG_MHD_MID_TRIBUTE_ROAD` + tile hiện tại: `NPC_MAI_THUC_LOAN` cạnh `PLAYER_MALE`, `EN_TANG_ESCORT`, `EN_LUONG_PATROL`, `EN_HAN_GUARD`, `EN_NGO_SOLDIER`. Phe Đường tách rõ 3 phe cũ; da Mai Thúc Loan đậm rõ.
4. Đầu roi ô 4 đạt tầm mục 5.2.
5. Nền lặp liền mạch theo brief QA 4.

**Gate A2:**
1. Đủ mục 1, QA brief mục 5, số màu trong giới hạn.
2. Asset chép giống bản gốc từng byte, ghi hash.
3. `EN_TIGER` ảnh cũ không đổi; `pounce` đọc được khi code nâng theo vòng cung (mockup 3 tư thế).
4. Hai chân ngựa `EN_TANG_CAVALRY` để lộ khe gầm ở mọi ô (ảnh chồng hộp người chơi 25×42 khi lướt).
5. Mockup đủ 3 vùng nối nhau, cung thủ sau `PROP_MHD_BUSH_COVER`, hổ trước `PROP_MHD_CAVE_MOUTH`, lính ném lao trên tháp.

## 10. BÁO CÁO & DỪNG

Ghi vào report vùng làm việc theo mẫu brief mục 6, gồm số đo: đỉnh sọ mọi người mới, đầu roi, tầm ném tay, số màu từng asset, màu đề xuất thêm.

**Câu hỏi team cần trả lời ở Gate A1:**
- Chọn phương án màu phe Đường A hay B.
- Trang phục màn 1 của Mai Thúc Loan (mục 4) có đúng ý không.
- Duyệt màu da ngăm và các màu thêm vào bảng.

Dừng ở **Gate A1** chờ duyệt, không tự làm Gate A2.
