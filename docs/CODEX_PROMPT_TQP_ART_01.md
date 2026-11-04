# CODEX PROMPT — TQP_ART_01: ASSET MÀN 1 CHƯƠNG TRIỆU VIỆT VƯƠNG "TUỔI TRẺ RÈN LUYỆN" (32-bit)

Ngày giao: 04/11/2026 • Người giao: team Sử Ta (Claude soạn) • Skill: agent-sprite-forge / `$generate2dsprite` (sprite), `$generate2dmap` (môi trường)

> Đọc **[SUTA_TT_ART_BRIEF_32.md](../SUTA_TT_ART_BRIEF_32.md)** trước. **Luật kỹ thuật chung** của brief áp dụng nguyên vẹn: mật độ ×4, strip, pivot bottom-center, quay phải, baseline, chiều cao người 34 ± 1 px logic, viền, đổ bóng, alpha 0/255, xoá nền bằng flood-fill mép, QA mục 5, mẫu report mục 6.
> **Mục 3 của brief (art bible năm 40 SCN) chỉ dùng làm chuẩn phong cách vẽ.** Bối cảnh đợt này là **giữa thế kỷ 6 (khoảng năm 546–550)**, theo mục 4–6 của prompt này.
> Prompt mâu thuẫn brief → theo prompt, ghi vào report.

---

## 0. MỤC TIÊU

Chương 4 (Triệu Việt Vương) hiện chạy bằng **asset tạm của chương Lý Nam Đế** và hộp dự phòng. Đợt này vẽ asset riêng cho **màn 1 "Tuổi trẻ rèn luyện"**.

Bối cảnh: giữa thế kỷ 6, Giao Châu dưới ách nhà Lương. Triệu Quang Phục, con Thái phó Triệu Túc ở Chu Diên, rèn võ nghệ rồi cùng nghĩa quân lui về đầm Dạ Trạch.
- Người chơi là nghĩa sĩ nam/nữ (`PLAYER_MALE`/`PLAYER_FEMALE` có sẵn). Đợt này **chỉ thêm 1 animation `plunge`** cho hai nhân vật đó.
- Triệu Quang Phục là **NPC dẫn đường** ở khu rèn luyện đầu màn.

Thứ tự vùng cảnh của màn: bãi tập Chu Diên → làng Chu Diên (dùng lại nền chương 3) → bãi lau ven sông → đầm lầy → bờ đầm Dạ Trạch (đích).

Cơ chế đã có trong engine, đang chạy bằng hộp tạm ở `?layout=engine` — đợt này **chỉ vẽ**:
- sình lầy làm chậm/lún;
- khói chướng khí trôi ngang;
- cá sấu ngoi lên từ khe nước;
- thuyền tuần gọi viện;
- đòn bổ từ trên và lính giáo dài chỉ hạ được bằng đòn bổ.

**Chia 2 Gate:**
- **Gate A1** — 4 asset chốt nhận diện (cột Gate = A1 ở mục 1). **Dừng chờ duyệt.**
- **Gate A2** — phần còn lại, làm sau khi team duyệt A1.

## 1. DANH SÁCH ASSET

Ô logic → ảnh ×4. Số frame/fps lấy theo asset tương đương đã `IN_GAME` để giữ nhịp code; số mới là `DESIGN_BASELINE`.

### 1a. Sprite — `assets/sprites-32bit/trieu-quang-phuc/` (manifest `manifest_tqp.json`)

| # | Gate | Asset ID | Loại | Ô logic → ảnh | Animation (frames @fps, lặp?, hit_frame) | Ghi chú |
|---|---|---|---|---|---|---|
| 1 | A1 | `PLAYER_MALE` | player (asset **chung**) | 48×48 → 192×192 | **chỉ thêm** `plunge` 4@16 không lặp | đòn bổ từ trên (mục 3). **Không** sửa animation khác |
| 2 | A1 | `PLAYER_FEMALE` | player (asset **chung**) | 48×48 → 192×192 | **chỉ thêm** `plunge` 4@16 không lặp | như #1, theo nhận diện nữ |
| 3 | A1 | `NPC_TQP` | npc | 48×48 → 192×192 | `idle` 6@9 lặp • `talk` 4@8 lặp | Triệu Quang Phục (mục 4) |
| 4 | A1 | `EN_LUONG_SPEARMAN` | enemy | 48×48 → 192×192 | `idle` 6@9 lặp • `walk` 8@11 lặp • `attack_01` 9@18 không lặp, hit **4**, `frame_w` 128 • `blocked` 4@20 không lặp • `hurt` 3@12 • `death` 6@12 | lính giáo dài Lương (mục 5.2) |
| 5 | A2 | `PORTRAIT_TQP` | portrait | 64×64 → 256×256 | `idle` 1 | chân dung theo `NPC_TQP` |
| 6 | A2 | `EN_LUONG_SPEAR_CAPTAIN` | enemy (mini-boss) | 64×64 → 256×256 | `idle` 6@9 lặp • `walk` 8@11 lặp • `attack_01` 9@18 không lặp, hit **4**, `frame_w` 160 • `blocked` 4@20 không lặp • `hurt` 3@12 • `death` 8@12 | đội trưởng giáo dài (mục 5.3) |
| 7 | A2 | `EN_LUONG_WAR_BOAT` | enemy (**có sẵn**, chương 3) | 96×48 → 384×192 | **chép** `idle` 6@8, `throw` 8@16 hit 5 từ `manifest_lnd.json` + **thêm** `signal` 8@12 không lặp • `hurt` 3@12 • `death` 6@12 | thuyền tuần tiễu thổi tù và gọi quân (mục 5.4) |
| 8 | A2 | `EN_CROCODILE` | enemy | 64×32 → 256×128 | `warn` 4@10 lặp • `attack` 8@8 không lặp, hit **5** • `dive` 3@10 không lặp • `death` 6@12 | cá sấu Dạ Trạch (mục 5.5) |
| 9 | A2 | `EN_SWAMP_SNAKE` | enemy | 48×16 → 192×64 | `run` 6@14 lặp • `attack_01` 6@20 không lặp, hit **3** • `death` 5@12 | rắn độc trườn sát đất (mục 5.6) |
| 10 | A2 | `FX_SWAMP_GAS` | fx | 64×24 → 256×96 | `move` 6@10 lặp | khói chướng khí trôi ngang; **được bán trong suốt** (mục 5.7) |
| 11 | A2 | `PROP_TQP_ARCHER_TREE` | prop (sprite) | 64×112 → 256×448 | `idle` 1 | cây cao có cành cho cung thủ đứng (mục 5.8) |
| 12 | A2 | `OB_TQP_STRAW_DUMMY` | obstacle | 32×48 → 128×192 | `idle` 1 • `hit` 3@16 không lặp • `break` 6@12 không lặp | bù nhìn rơm tập chém (mục 6.4) |
| 13 | A2 | `OB_TQP_STRAW_SPEARMAN` | obstacle | 32×48 → 128×192 | `idle` 1 • `hit` 3@16 không lặp • `break` 6@12 không lặp | bù nhìn đội nón cầm giáo — tập đòn bổ (mục 6.4) |
| 14 | A2 | `EN_LUONG_PATROL`, `EN_LUONG_ARCHER`, `PJ_FIRE_ARROW`, `PJ_CROSSBOW_BOLT`, `ITEM_LND_HEAL` | **có sẵn** (chương 3) | — | **chép nguyên** mục + ảnh từ `manifest_lnd.json` | dùng lại, không vẽ lại |
| 15 | A2 | `TR_BAMBOO_SPIKE_PIT` | **có sẵn** (chương 2) | — | **chép nguyên** mục + ảnh từ `manifest_bt.json` | bẫy chông tre ẩn dưới lá |

### 1b. Môi trường — `assets/maps-32bit/trieu-quang-phuc/` (manifest `maps_tqp.json`)

| # | Gate | Asset ID | Loại | Cỡ logic → ảnh | Ghi chú |
|---|---|---|---|---|---|
| 16 | A1 | `BG_TQP_MID_SWAMP` | lớp giữa | 768×160 → 3072×640 | đầm lầy Chu Diên — **mẫu chốt tông môi trường** (mục 6.2) |
| 17 | A1 | `PROP_TQP_MUD` | prop (mặt sình) | 64×16 → 256×64 | dải bùn lát ngang liền mạch (mục 6.3) |
| 18 | A2 | `BG_TQP_MID_TRAINING_YARD` | lớp giữa | 768×160 | bãi tập võ của cha con Triệu Túc |
| 19 | A2 | `BG_TQP_MID_REED_BANK` | lớp giữa | 768×160 | bãi lau sậy ven sông |
| 20 | A2 | `BG_TQP_MID_DA_TRACH` | lớp giữa | 768×160 | bờ đầm Dạ Trạch (cuối màn) |
| 21 | A2 | `PROP_TQP_BAMBOO_POST` | prop (bục) | 16×48 → 64×192 | cọc tre đứng được — **mặt trên = hàng 0 của ảnh** |
| 22 | A2 | `PROP_TQP_GRASS_TUFT` | prop (tiền cảnh) | 48×24 → 192×96 | bụi cỏ che rắn, vẽ **trước** nhân vật |
| 23 | A2 | `PROP_TQP_REED_GATE` + `PROP_TQP_REED_GATE_OPEN` | prop (đích) | 192×176 → 768×704 | cổng trại nghĩa quân bằng tre–lau; đóng/mở trùng pixel trừ vùng cửa, lòng cổng mở trong suốt (brief 2.3) |

**Dùng lại, không vẽ** (Claude khai báo trong code):
- trời `BG_TT_SKY_DAY`;
- tileset `TILESET_TT_GROUND`/`TILESET_TT_TERRAIN`;
- bia câu hỏi `PROP_TT_QUIZ_STELE`;
- làng `BG_LND_MID_CHU_DIEN`, mặt nước `PROP_LND_RIVER_WATER`, mỏm đá `PROP_LND_ROCK_LEDGE`;
- đồi xa `BG_BT_FAR_PLAIN`;
- sách `ITEM_BT_TINH_HOA`.

## 2. THƯ MỤC, MANIFEST, BẢNG MÀU

- **Vùng làm việc** (ngoài git): `assets/sprites-32bit/trieu-quang-phuc/` (cấu trúc brief mục 4: `<category>/<ID>/<id_lower>_<animation>.png`, `raw/`, `preview/`, `meta/`) và `assets/maps-32bit/trieu-quang-phuc/` (`bg/`, `props/`, `raw/`, `preview/`, `meta/`).
- **Không** sửa thư mục chương 1–3, `samples/`, `manifest_tt.json` (trừ mục `plunge` ở dưới), `manifest_lnd.json`, `manifest_bt.json`, `maps_*.json` của chương khác. Không đụng `frontend/`.
- **`plunge` của người chơi** (asset chung):
  - Nguồn của `PLAYER_MALE`/`PLAYER_FEMALE` nằm trong `assets/sprites-32bit/manifest_tt.json` + thư mục `player/` (bản game: `frontend/static/assets/images/shared/sprites-32bit/manifest_shared.json`, chỉ đọc).
  - Thêm file `player/PLAYER_MALE/player_male_plunge.png`, `player/PLAYER_FEMALE/player_female_plunge.png`.
  - Thêm **đúng 1 mục animation `plunge`** vào 2 asset đó trong `manifest_tt.json`.
  - **Không** đổi bất kỳ file/animation/`qa_notes` nào khác của 2 asset (vừa duyệt kiếm v2 hôm 04/11). Report ghi hash các file cũ trước/sau để chứng minh không đổi.
- **`manifest_tqp.json`**: cùng định dạng `manifest_lnd.json`, `chapter: "trieu-quang-phuc"`, `density: 4`, `pivot: bottom-center`, `facing: right`, status tối đa `NORMALIZED`.
  - Asset chép từ chương 2–3 (mục 1a #7, #14, #15): chép mục + ảnh **giữ nguyên ID, tên animation, số frame**.
  - `EN_LUONG_WAR_BOAT`: chỉ **thêm** 3 animation mới, ảnh `idle`/`throw` giữ nguyên từng byte.
  - **Không** đưa `PLAYER_*` vào `manifest_tqp.json`.
- **`maps_tqp.json`**: cùng định dạng `maps_lnd.json`, khối `stage` = `{canvas_w 480, canvas_h 270, stage_length 9216, ground_y 248, tile_size 16}` (`DESIGN_BASELINE`, màn 1 dự kiến 12 chunk).
  - Nền: `anchor: "bottom-at-GROUND_Y"`.
  - `PROP_TQP_MUD`, `PROP_TQP_BAMBOO_POST`: `anchor: "top-left"`, `pivot {x: 0, y: 0}`.
  - `PROP_TQP_GRASS_TUFT`: `anchor: "bottom-center"`.
  - Cổng: `anchor: "bottom-center-at-GROUND_Y"`, `pivot {x: 96, y: 176}`.
- **Bảng màu sprite**: chép `assets/sprites-32bit/ly-nam-de/palette_32_lnd.png` (98 màu — ngoại lệ trần 96 người dùng đã duyệt 02/11) thành `palette_32_tqp.png`. Cùng phe Lương xám tro và người Việt Chu Diên như chương 3.
  - Cá sấu, rắn, khói đầm cần tông mới → **đề xuất ở Gate A1** (tối đa 6 màu, kèm màu ít dùng có thể thay); **không tự thêm** khi chưa duyệt.
  - Mỗi asset ≤ 32 màu (đội trưởng ≤ 36).
  - `plunge` của người chơi **chỉ dùng màu đã có trong strip `idle` của chính nhân vật đó**.
- **Bảng màu môi trường**: tạo `palette_map_32_tqp.png` (≤ 192 màu) **kế thừa** `assets/maps-32bit/ly-nam-de/palette_map_32_lnd.png`. Report ghi số màu giữ/bỏ/thêm.
- **Report**: `assets/sprites-32bit/trieu-quang-phuc/SPRITE_REPORT_TQP_32.md` và `assets/maps-32bit/trieu-quang-phuc/MAP_REPORT_TQP_32.md` theo mẫu brief mục 6.

## 3. `plunge` CỦA NGƯỜI CHƠI (đòn bổ từ trên)

- **Khi nào dùng:** người chơi đang **rơi xuống** thì bấm Đánh → lao thẳng xuống, mũi kiếm chĩa xuống. Trúng đầu địch thì nảy lên. Code phát `plunge` **1 lần rồi giữ ô cuối** tới lúc chạm.
- 4@16 không lặp (0,25 s):
  - ô 1 co gối, kiếm vung lên ngang đầu;
  - ô 2 xoay kiếm, mũi bắt đầu chúc xuống;
  - ô 3–4 hai tay nắm chuôi trước bụng, **mũi kiếm chĩa thẳng xuống dưới**, chân co lại.
  - Ô 4 là tư thế giữ (đẹp khi đứng yên lâu).
- **Mũi kiếm ở ô 4 nằm trong ô 48×48**, sát đáy: mũi kiếm ở hàng 180–187 (ảnh), không vượt baseline. Ghi toạ độ mũi kiếm ô 4 vào report.
- **Giữ nhận diện kiếm v2**: kiếm thẳng sắt hai lưỡi, lưỡi 18 px logic, chắn tay thanh ngang, chuôi quấn vải; tay gần người xem cầm kiếm. Cùng tỉ lệ thân, đầu, màu với `jump` ô 3.
- Không vẽ vệt chém/FX dính vào sprite (brief 2.2).

## 4. TRIỆU QUANG PHỤC (`NPC_TQP`, `PORTRAIT_TQP`)

- **Nhận diện có sẵn:** Triệu Quang Phục đã được vẽ là **người con đứng bên trái** trong `NPC_TRIEU_TUC` (chương 3, đã `IN_GAME`). Nguồn tham chiếu:
  - `assets/sprites-32bit/ly-nam-de/npc/NPC_TRIEU_TUC/npc_trieu_tuc_idle.png` (nửa trái mỗi ô);
  - `concept/trieu_tuc_pair_b1.png`;
  - mục "Triệu Quang Phục" trong `SPRITE_REPORT_LND_32.md`: áo rêu trầm `#343830`/`#444840`/`#5B5E53`/`#77766C`, đai + dây tóc nâu vải thô, quần xắn, chân trần, dáng trẻ, đỉnh sọ ~33,75 px logic.
- **Người dùng chốt 04/11:** giữ mặt, tóc, áo, quần, dáng **như sprite chương 3**, chỉ **đổi mái chèo thành giáo** (ngọn giáo sắt mũi lá, cán tre/gỗ). Ở màn này ông dẫn bài rèn võ.
- **Lưu ý màu:** áo rêu dùng chung dải xám tro của phe Lương. Mockup Gate A1 phải đặt `NPC_TQP` **cạnh `EN_LUONG_PATROL` và `EN_LUONG_SPEARMAN`** ở cỡ chơi thật. Nếu khó phân biệt → ghi đề xuất (vd. đai/dây tóc đậm hơn) vào câu hỏi cho team, **không tự đổi màu áo**.
- `idle` 6@9: đứng thẳng, giáo dựng bên người.
- `talk` 4@8: giữ giáo đúng tay và tư thế như `idle`; **tay còn lại** giơ chỉ về phía trước (phải); đầu nhún nhẹ. Baseline, tỉ lệ đầu–thân, màu trùng `idle` (bài học `PLAYER_BA_TRIEU.talk` — BT_ART_01 mục 10).
- `PORTRAIT_TQP`: bán thân, nhìn sang phải, cùng nét/màu với `NPC_TQP`, cùng khung với `PORTRAIT_TRIEU_TUC`.
- Thông tin trang phục người Việt thế kỷ 6: **độ chắc chắn thấp** — theo sprite chương 3, không thêm hoạ tiết mới (lông chim, trống đồng). Chỗ nào không chắc → hỏi team trong report.

## 5. PHE LƯƠNG, THÚ ĐẦM LẦY

### 5.1 Ngôn ngữ phe Lương (đã chốt ở chương 3)

- Dùng **`CONCEPT_LUONG` phương án A — xám tro** (`assets/sprites-32bit/ly-nam-de/concept/CONCEPT_LUONG.png`, ramp `#343830 #444840 #5B5E53 #77766C #999583 #B8AF96`). Tỉ lệ, mũ, giáp như `EN_LUONG_PATROL`.
- Áo/khiên/cờ **không chữ** (brief 3.5).

### 5.2 `EN_LUONG_SPEARMAN` (lính giáo dài)

- Lính Lương thường, giáp lá ngắn như `EN_LUONG_PATROL`, cầm **giáo dài** (cán ≥ 1,5 lần chiều cao người, mũi sắt lá). Thế thủ **giáo chĩa ngang ra trước**.
- `attack_01`:
  - kéo giáo về (ô 1–3);
  - **đâm thẳng** ở ô **4**, mũi giáo ra xa: **56–60 px logic tính từ pivot** (dài hơn kích của `EN_LUONG_PATROL`);
  - thu về (ô 5–9).
  - Ghi tầm mũi giáo ô 4 và độ cao mũi (px logic từ chân) vào report.
- `blocked` 4@20: **dựng cán giáo chéo trước người gạt đòn**. Thân không lùi; chân đứng yên như `idle`.

### 5.3 `EN_LUONG_SPEAR_CAPTAIN` (mini-boss cuối màn)

- To hơn lính thường: đỉnh sọ **~40 px logic**, vai rộng. Giáp lá dày hơn (vai giáp), mũ có chóp/núm. Giáo dài hơn lính thường.
- Cùng ngôn ngữ xám tro, **không** mũ sư tử, áo choàng đỏ lớn, giáp vàng (brief 3.5).
- `attack_01` đâm ở ô 4, tầm mũi **72–78 px logic** từ pivot (`frame_w` 160). Ghi số vào report.
- `death` 8@12: ngã, giáo rơi.

### 5.4 `EN_LUONG_WAR_BOAT` — thêm 3 animation

- Ảnh `idle`/`throw` của chương 3 giữ nguyên; thêm animation **cùng tỉ lệ, cùng màu, cùng mớn nước**.
- `signal` 8@12: lính trên thuyền **thổi tù và sừng trâu + phất cờ hiệu trơn không chữ** (người dùng chốt 04/11). **Không** pháo hiệu, pháo hoa, thuốc súng — thế kỷ 6 chưa có.
- `hurt` 3@12: thuyền chao.
- `death` 6@12: thuyền vỡ mạn, lính ngã xuống nước, chìm dần. Code vẽ thuyền chìm dưới lớp nước — phần dưới mớn nước bị che.

### 5.5 `EN_CROCODILE` (cá sấu Dạ Trạch)

- Nằm trong khe nước. Code **tự nâng cả con lên** theo đường cong khi đớp (tối đa ~56 px logic) — sprite **không tự nhảy**, chỉ đổi tư thế tại chỗ.
- Màu xanh rêu–nâu bùn, lưng gai, bụng vàng nhạt; dài ~56 px logic trong ô 64×32.
- `warn` 4@10 lặp: **chỉ mắt + mũi + bọt nước** nổi trên mặt nước (thân chìm, nửa dưới ô trong suốt).
- `attack` 8@8: trồi lên, há miệng rộng ở ô **5**, ngoạm, khép miệng (ô 6–8).
- `dive` 3@10: lặn, còn gợn nước.
- `death` 6@12: lật bụng, chìm.
- Không máu me.

### 5.6 `EN_SWAMP_SNAKE` (rắn độc đầm lầy)

- Rắn mảnh, màu rêu–nâu xen vạch vàng mờ để khó thấy trong cỏ; cao ≤ 12 px logic.
- `run` trườn uốn sóng; `attack_01` ngóc đầu mổ ở ô 3; `death` duỗi người.

### 5.7 `FX_SWAMP_GAS` (khói chướng khí)

- **Đám khói** xanh lục xám đục (bão hoà vừa, khác chướng khí tím chương 2), dài ~60 px, cao ~20 px logic, mép tan.
- `move` cuộn nhẹ tại chỗ (code tự di chuyển ngang).
- Được bán trong suốt (như FX lửa). Không mặt quỷ, không sọ.
- Cùng 1 sprite dùng cho 2 làn: sát đất (nhảy qua) và ngang thân (lướt qua).

### 5.8 `PROP_TQP_ARCHER_TREE`

- Cây gạo/cây đa ven đầm cao, tán thưa. **1 cành ngang phẳng** cho `EN_LUONG_ARCHER` (có sẵn) đứng, cao **~88 px logic** tính từ đáy ảnh. Ghi hàng ảnh của mặt cành vào report (code đặt chân cung thủ lên đó, như `PROP_LUONG_WATCHTOWER`).
- Đáy ảnh = gốc cây. Không người trong sprite.

## 6. MÔI TRƯỜNG MÀN 1 (giữa thế kỷ 6, Chu Diên → Dạ Trạch)

### 6.1 Tư liệu

| Dữ kiện | Độ chắc chắn | Nguồn |
|---|---|---|
| Dạ Trạch là vùng **đầm lầy rộng, lau sậy rậm**, nghĩa quân dùng **thuyền độc mộc**, ẩn ban ngày, đánh ban đêm | cao (bộ câu hỏi team: câu 10, 12, 13; thư viện `trieu-quang-phuc`) | Excel team, `library_heroes.json` |
| Đầm thuộc vùng Khoái Châu (Hưng Yên), do sông Hồng đổi dòng tạo thành | trung bình (câu 9, 38 — xem TQP-00 mục 7) | Excel team |
| Chu Diên là vùng **sông nước, đầm lầy** | trung bình | thiết kế chương 3 (`BG_LND_MID_CHU_DIEN` đã duyệt) |
| Nhà cửa, trang phục người Việt thế kỷ 6 | **thấp** — theo các nền/NPC chương 3 đã duyệt | — |

Năm 546–550 **chưa có** đền Hoá Dạ Trạch, đình, chùa, tháp → **không vẽ** công trình thờ.

### 6.2 Từng lớp giữa

- **`BG_TQP_MID_SWAMP`** (mẫu A1):
  - đầm lầy nước tù lấp loáng, lau sậy, cỏ nước, gốc cây chết, vài cây gạo/cây sung ven bờ;
  - khoảng hở để lớp xa lộ ra; phần dưới đất bùn–cỏ đục liền (brief 2.3);
  - tông xanh rêu trầm, không tranh với nhân vật;
  - **không** vẽ mặt nước ngang mặt đất (mặt nước chơi được là lớp riêng `PROP_LND_RIVER_WATER`).
- **`BG_TQP_MID_TRAINING_YARD`**: bãi đất nện cạnh nhà sàn của hào trưởng Chu Diên, giá giáo/cung bằng tre, bia bắn bằng rơm, rào tre. Ngôn ngữ phe Việt như chương 3, **ít hoạ tiết**.
- **`BG_TQP_MID_REED_BANK`**: bờ sông bãi lau sậy cao, vài thuyền độc mộc mắc cạn, cọc tre.
- **`BG_TQP_MID_DA_TRACH`**: mép đầm Dạ Trạch mênh mông lau sậy, chòi canh tre nghĩa quân, thuyền độc mộc buộc ở cọc; chuẩn bị cho cổng trại.
- Các lớp kề nhau **hoà chéo 192 px logic**: đất/cỏ phần dưới cùng độ cao, cùng tông với `BG_LND_MID_CHU_DIEN` (làng — vùng 2).

### 6.3 `PROP_TQP_MUD` (mặt sình)

- **Dải bùn** nâu xám ướt có vũng nước nhỏ, bọt khí, cỏ nát, lát ngang liền mạch (QA brief mục 5.4). Code lát theo toạ độ thế giới, đặt **đỉnh ảnh cao hơn mặt đất vài px** (code ghi `mudLift`).
- Bề mặt bùn ở hàng ảnh 8–16 (2–4 px logic). Phần dưới đục, che kín tile đất phía dưới tới đáy ảnh.
- Report ghi hàng mặt bùn.
- Phân biệt rõ với mặt đất cỏ thường ở cỡ chơi thật (mockup A1).

### 6.4 Bù nhìn tập võ

- **`OB_TQP_STRAW_DUMMY`**: bù nhìn rơm buộc trên cọc tre, cao ~34 px logic.
  - `hit`: lắc nghiêng rồi về;
  - `break`: rơm bung, cọc gãy, xác nằm lại ở ô cuối (code giữ ô cuối).
- **`OB_TQP_STRAW_SPEARMAN`**: bù nhìn như trên, **đội nón tre/mũ rơm và cầm giáo gỗ chĩa ngang** — để người chơi tập nhảy lên bổ xuống. Cùng nhịp animation.

### 6.5 `PROP_TQP_BAMBOO_POST`, `PROP_TQP_GRASS_TUFT`, `PROP_TQP_REED_GATE`

- **Cọc tre:** 2–3 cây tre buộc dây, đầu bằng; **mặt trên phẳng đúng hàng 0** của ảnh (người chơi đứng lên); rộng 16 px logic.
- **Bụi cỏ:** cỏ năn/cỏ lác thấp ~20 px logic, mép dưới đục liền chân. Vẽ **trước** nhân vật nên nửa trên phải thưa, rắn lộ một phần.
- **Cổng trại:** cọc tre, mái lá/lau, 2 cánh phên lau. Bản mở: 2 cánh mở vào trong, lòng cổng trong suốt. Không mái ngói, không chữ.

## 7. ACCEPTANCE

### Gate A1

1. **`plunge`** nam + nữ:
   - đúng cỡ, 4 ô, alpha 0/255, baseline 187, cùng tỉ lệ `jump`;
   - chỉ dùng màu của `idle` cùng nhân vật;
   - mũi kiếm ô 4 trong ô, chĩa thẳng xuống;
   - file cũ của 2 asset **không đổi hash**.
   - Preview: 4 ô cạnh `jump` ô 3, và mockup người chơi ô 4 lơ lửng trên đầu `EN_LUONG_SPEARMAN` ở cỡ chơi thật.
2. **`NPC_TQP`**:
   - mặt/tóc/áo khớp người con trong `NPC_TRIEU_TUC` (preview đặt cạnh nhau);
   - cầm giáo; `talk` giữ giáo đúng tay như `idle`;
   - đỉnh sọ 33–35 px logic;
   - mockup cạnh `EN_LUONG_PATROL`, `EN_LUONG_SPEARMAN`, `PLAYER_MALE`.
3. **`EN_LUONG_SPEARMAN`**: đủ 6 animation, nhịp `attack_01` 9@18 hit 4, tầm mũi giáo 56–60 px logic, `blocked` đọc rõ ở cỡ chơi thật.
4. **`BG_TQP_MID_SWAMP` + `PROP_TQP_MUD`**:
   - lặp ngang không vệt (QA brief 5.4);
   - mockup ×1 và ×2: tile `TILESET_TT_GROUND`, dải sình 160 px, `PLAYER_FEMALE` đứng trong sình, `EN_LUONG_SPEARMAN` trên đất — nhân vật nổi rõ hơn nền, sình phân biệt rõ với đất.
5. Đề xuất màu mới (nếu cần) cho cá sấu/rắn/khói. Report đủ mục; status tối đa `NORMALIZED`. **Dừng.**

### Gate A2

1. Đủ mục 1a + 1b còn lại. QA brief mục 5 (1–8) đạt. `manifest_tqp.json`, `maps_tqp.json` khớp file.
2. Asset chép (#7 `idle`/`throw`, #14, #15): hash trùng bản gốc.
3. Mockup cỡ chơi thật (logic ×1 và N = 2, 3) từng vùng: bãi tập → làng Chu Diên → bãi lau → đầm lầy → bờ Dạ Trạch. Mockup phải có:
   - đủ chướng ngại: lính tuần, lính giáo dài, cung thủ trên cây, bẫy chông, sình, khói 2 làn, rắn trong bụi cỏ, cá sấu ở khe nước, thuyền;
   - bù nhìn và cọc tre;
   - mini-boss cạnh người chơi;
   - cổng đóng/mở.
4. Report đủ; **dừng** chờ duyệt.

## 8. BÁO CÁO & DỪNG

- Ghi `SPRITE_REPORT_TQP_32.md` / `MAP_REPORT_TQP_32.md` theo mẫu brief mục 6, thêm bảng **"Số đo cho code"**:

| Asset | Số đo |
|---|---|
| `PLAYER_*` `plunge` | toạ độ mũi kiếm ô 4 |
| `EN_LUONG_SPEARMAN`, `EN_LUONG_SPEAR_CAPTAIN` | tầm + độ cao mũi giáo ô 4 |
| `EN_LUONG_WAR_BOAT` | mớn nước, độ cao tù và ở `signal` |
| `EN_CROCODILE` | hitbox thân lúc `attack` ô 5 (px logic từ pivot) |
| `EN_SWAMP_SNAKE` | hitbox |
| `FX_SWAMP_GAS` | phần đục |
| `PROP_TQP_ARCHER_TREE` | hàng mặt cành |
| `PROP_TQP_MUD` | hàng mặt bùn |
| `PROP_TQP_BAMBOO_POST` | `visible_bbox` |
| `PROP_TQP_GRASS_TUFT` | `visible_bbox` |
| `PROP_TQP_REED_GATE` | `visible_bbox` |

- **Câu hỏi cho team** (bắt buộc ghi):
  - áo rêu của Triệu Quang Phục có đủ phân biệt với quân Lương không;
  - trang phục người Việt thế kỷ 6;
  - mũ/giáp đội trưởng giáo dài;
  - mọi chi tiết lịch sử Codex không chắc.
- **Dừng sau Gate A1**, chờ team duyệt; sau đó làm A2 và **dừng sau Gate A2**.
- Không vẽ asset màn 2–3 (Triệu Túc riêng, Lý Nam Đế, Chử Đồng Tử, lau sậy ẩn nấp, Dương Sàn, thuyền độc mộc chở người, FX kỹ năng) — thuộc `TQP_ART_02`, `TQP_ART_03`.
