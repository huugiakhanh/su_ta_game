# CODEX PROMPT — BT_ART_03: ASSET MÀN 3 CHƯƠNG BÀ TRIỆU "CHIẾN LŨY BỒ ĐIỀN" (32-bit)

Ngày giao: 28/10/2026 • Người giao: team Sử Ta (Claude soạn) • **Người dùng duyệt 28/10/2026** (A1–A4 theo đề xuất, mục 12) • Skill: agent-sprite-forge /
`$generate2dsprite` (sprite, chân dung, FX, prop có animation), `$generate2dmap` (nền)

> Đọc **[SUTA_TT_ART_BRIEF_32.md](../SUTA_TT_ART_BRIEF_32.md)** trước — luật kỹ thuật chung (mật độ ×4, strip, pivot bottom-center,
> quay phải, baseline, **chuẩn cao người 34 ± 1 px logic** mục 2.2, alpha 0/255, QA mục 5, mẫu report mục 6) áp dụng nguyên vẹn.
> Bối cảnh **năm 248**, phe Ngô / phe Việt như [CODEX_PROMPT_BT_ART_01.md](CODEX_PROMPT_BT_ART_01.md) mục 4–5 và
> [CODEX_PROMPT_BT_ART_02.md](CODEX_PROMPT_BT_ART_02.md) mục 0.1, 3–6. Prompt mâu thuẫn brief → theo prompt, ghi vào report.

---

## 0. MỤC TIÊU

Màn 3 "Chiến lũy Bồ Điền" — trận boss cuối chương (thiết kế đã chốt: `docs/SUTA_BT_TASK_00.md` §3.4, §5.2). Đấu trường **1 màn
hình** (768 px logic): một bên đầm lầy, một bên núi đá. Tướng Ngô **Lục Dận** đứng trên **đài chỉ huy cao** (người chơi không với tới):

- **GĐ 1:** mưa tên độc (vạch báo do code vẽ) + **3 tháp canh chứa vàng** phải phá; tháp ném **tiền vàng "mua chuộc"** (chạm → choáng ngắn).
- **GĐ 2:** **kỵ binh thiết giáp** — đòn thường bị giáp chặn (tóe lửa), chỉ kỹ năng Gọi Bạch Tượng (`NPC_BACH_TUONG.charge`, đã có) húc
  văng / phá giáp.
- **GĐ 3:** **đài sụp**, Lục Dận rơi xuống đầm lầy, lúng túng trong bùn, không tấn công; bị dồn đòn → **bỏ chạy** về phương Bắc →
  cutscene "Bà Triệu mặc giáp vàng, cưỡi voi trắng dẫn quân xông lên" + cờ chiến thắng.

Người chơi (nghĩa sĩ nam/nữ), lính Ngô thường, Bạch Tượng, FX khiên/chí mạng, icon kỹ năng **đã có — không vẽ**.

**Chia 2 Gate** (Lục Dận + kỵ binh thiết giáp là nhận diện mới):
- **Gate C1** — concept + asset chốt nhận diện + nền mẫu (cột Gate = C1). **Dừng chờ duyệt.**
- **Gate C2** — phần còn lại, sau khi team duyệt C1.
- **Gate C1 ĐÃ DUYỆT 28/10/2026** (người dùng), gồm bản vá `CODEX_PROMPT_BT_ART_03_FIX_LD.md` (Lục Dận cầm kiếm tay ngoài) và
  `CODEX_PROMPT_BT_ART_03_FIX_C1.md` (kỵ binh `death`, nền chiến lũy). 5 câu hỏi team trong report C1 (giáp/mũ/kiếm Lục Dận, tiền đồng,
  giáp ngựa Ngô, giáp vàng Bà Triệu, đài tre/công sự): **giữ theo concept C1** (`DESIGN_BASELINE`). Với C2:
  - `PJ_BT_GOLD_COIN` giữ như mục 7 (đồng tiền vàng lỗ vuông), không vẽ rương;
  - giáp vàng Bà Triệu theo mức trong phác concept.

  **→ Làm Gate C2.** Không sửa asset C1.
- **Gate C2 ĐÃ DUYỆT 28/10/2026** (người dùng), gồm bản vá `CODEX_PROMPT_BT_ART_03_FIX_C2.md` (khe tóc Bà Triệu cưỡi voi).
  Người dùng cho phép `PJ_BT_POISON_ARROW` dùng 2 màu môi trường #23331B, #364C16. **Đợt BT_ART_03 xong**: 13 asset `NORMALIZED`,
  nhập game ở BT-L3.

### 0.1 Bài học các đợt trước — BẮT BUỘC

Giữ nguyên 7 điểm `BT_ART_02` mục 0.1, và thêm (từ `SCALE_FIX_01`, `BT_ART_02_FIX_LJ`):

1. Người trưởng thành **34 ± 1 px logic** sọ → chân (không tính mũ/vũ khí) ở `idle`; **mọi animation cùng cỡ đầu `idle` ±1 px ảnh** —
   kể cả `hurt`, `death`, `fall`, `flee`. Ghi bảng cỡ đầu từng ô vào report.
2. **Một hệ số cho cả asset**; khi nguồn từng animation khác cỡ thì đo và chọn hệ số riêng sao cho cỡ đầu khớp `idle` — **không** phóng
   strip 192 px đã thu nhỏ.
3. Chân luôn ở pivot (bottom-center, hàng 187 của ô 48); **không dịch cả animation theo x**. Vũ khí vượt ô → đề xuất `frame_w` riêng
   cho animation đó, căn giữa pivot, ghi manifest + report.

## 1. DANH SÁCH ASSET

Ô logic → ảnh ×4. Số frame/fps theo asset tương đương chương 1 (`BOSS_TO_DINH_FOOT`, `BOSS_TO_DINH_CHARIOT`, `EN_HAN_CAVALRY`,
`PROP_WATCHTOWER`, `PJ_COIN_POUCH`, `PJ_ARROW_RAIN`, `PROP_TT_VICTORY_FLAG`) để giữ nhịp code; số mới là `DESIGN_BASELINE`.

### 1a. Sprite — `assets/sprites-32bit/ba-trieu/` (thêm vào `manifest_bt.json`)

| # | Gate | Asset ID | Loại | Ô logic → ảnh | Animation (frames @fps, lặp?, hit_frame) | Ghi chú |
|---|---|---|---|---|---|---|
| 1 | C1 | `CONCEPT_BT_LUC_DAN` | concept | tự do | — | Lục Dận, kỵ binh thiết giáp, tháp vàng, đài chỉ huy, Bà Triệu giáp vàng cưỡi voi — cạnh `PLAYER_MALE`, `EN_NGO_SOLDIER`, `NPC_BACH_TUONG` ở cỡ chơi thật; **không vào game** |
| 2 | C1 | `BOSS_LUC_DAN` | boss | 48×48 → 192×192 | `idle` 6@9 lặp • `command` 6@12 không lặp, hit **3** • `fall` 6@12 không lặp • `mud_idle` 6@9 lặp • `hurt` 3@12 • `flee` 8@16 lặp | tướng Ngô (mục 3) |
| 3 | C1 | `EN_NGO_ARMORED_CAVALRY` | enemy | 96×64 → 384×256 | `gallop` 8@18 lặp • `blocked` 4@20 không lặp • `knockback` 8@14 không lặp • `death` 6@12 không lặp | kỵ binh thiết giáp (mục 4) |
| 4 | C1 | `PROP_BT_COMMAND_TOWER` | prop (sprite) | 96×160 → 384×640 | `idle` 1 • `shake` 4@16 lặp • `collapse` 10@12 không lặp | đài chỉ huy của Lục Dận (mục 5) |
| 5 | C2 | `PORTRAIT_LUC_DAN` | portrait | 64×64 → 256×256 | `idle` 1 | cùng khung, góc nhìn `PORTRAIT_BA_TRIEU` |
| 6 | C2 | `EN_BT_GOLD_TOWER` | enemy (sprite) | 48×96 → 192×384 | `idle` 6@8 lặp • `throw` 6@10 không lặp, hit **4** • `hurt` 3@12 • `destroyed` 8@12 không lặp | tháp canh chứa vàng (mục 6) |
| 7 | C2 | `PJ_BT_GOLD_COIN` | projectile | 16×16 → 64×64 | `loop` 6@18 lặp | tiền vàng "mua chuộc" bay (mục 7) |
| 8 | C2 | `PJ_BT_POISON_ARROW` | projectile | 8×24 → 32×96 | `idle` 1 | tên độc rơi thẳng, mũi ở **đáy ô** (như `PJ_ARROW_RAIN`) (mục 7) |
| 9 | C2 | `FX_BT_STUN` | fx | 32×16 → 128×64 | `loop` 6@12 lặp | choáng do tiền vàng — vòng xoay trên đầu người chơi (mục 7) |
| 10 | C2 | `FX_BT_ARMOR_SPARK` | fx | 16×16 → 64×64 | `impact` 4@20 không lặp | tóe lửa khi đòn thường chém vào giáp kỵ binh (mục 7) |
| 11 | C2 | `PLAYER_BA_TRIEU_ELEPHANT` | cutscene | 128×96 → 512×384 | `idle` 6@8 lặp • `charge` 8@18 lặp | Bà Triệu **giáp vàng** cưỡi Bạch Tượng (mục 8) |

### 1b. Môi trường — `assets/maps-32bit/ba-trieu/` (thêm vào `maps_bt.json`)

| # | Gate | Asset ID | Loại | Cỡ logic → ảnh | Ghi chú |
|---|---|---|---|---|---|
| 12 | C1 | `BG_BT_MID_FORTRESS` | parallax lớp giữa | 768×160 → 3072×640 | chiến lũy Bồ Điền: đầm lầy trái, núi đá phải (mục 9) |
| 13 | C2 | `PROP_BT_VICTORY_FLAG` | prop | 96×32 → 384×128, 4 frame | cờ nghĩa quân bay — như `PROP_TT_VICTORY_FLAG` (`bottom-left-at-flag_attach`) (mục 9) |

**Dùng lại, không vẽ:** trời `BG_TT_SKY_DAY`/`BG_TT_SKY_STORM`, đồi xa `BG_BT_FAR_PLAIN`, tileset chương 1, `EN_NGO_SOLDIER`,
`EN_NGO_HUNTER`, `NPC_BACH_TUONG` (cả `charge` cho kỹ năng), `FX_BT_RATTAN_SHIELD`, `FX_BT_CRIT`, `ICON_SK_BT_*`, người chơi,
`PORTRAIT_BA_TRIEU`. **Vạch báo mưa tên do code vẽ** — không vẽ vạch.

## 2. THƯ MỤC, MANIFEST, BẢNG MÀU

- Vùng làm việc (ngoài git): `assets/sprites-32bit/ba-trieu/` (`boss/`, `enemy/`, `prop/`, `portrait/`, `projectile/`, `fx/`, `cutscene/`,
  `concept/`, `raw/`, `preview/`, `meta/`) và `assets/maps-32bit/ba-trieu/` (`bg/`, `props/`, `raw/`, `preview/`, `meta/`). **Không** sửa
  asset đã có, `samples/`, chương 1; không đụng `frontend/`, `tools/`. Script để trong `meta/`.
- `manifest_bt.json` / `maps_bt.json`: **chỉ thêm mục mới**; mục cũ (`IN_GAME` / `NORMALIZED`) không sửa, không xuất lại (so hash).
  Mục mới status tối đa `NORMALIZED`. Không đưa concept vào manifest. Khối `stage` giữ nguyên.
- `PLAYER_BA_TRIEU_ELEPHANT`: ID đang có **trong `samples/manifest_samples.json`** (thiết kế Bà Triệu cũ) — đợt này tạo mục **mới trong
  `manifest_bt.json`** cùng ID, thiết kế mới; bản `samples/` giữ nguyên (không xoá, không sửa).
- `BG_BT_MID_FORTRESS` `anchor: "bottom-at-GROUND_Y"`, `tileable_x: true` (như `BG_BT_MID_MARSH`). Prop cờ theo mục `PROP_TT_VICTORY_FLAG`
  của `maps_tt.json` (anchor, `flag_attach`).
- **Bảng màu sprite:** `assets/sprites-32bit/ba-trieu/palette_32_bt_a2.png` (bản hiện hành). Vàng của tháp/tiền dùng tông vàng-nghệ sẵn có;
  cần màu mới (vd. ánh kim) → đề xuất ở Gate C1 kèm màu ít dùng có thể thay; **không tự thêm/đổi**. Sprite ≤ 32 màu (voi + Bà Triệu ≤ 40).
- **Bảng màu môi trường:** `palette_map_32_bt.png` (≤ 192 màu tổng, ghi số màu thêm).
- Report: nối tiếp `SPRITE_REPORT_BT_32.md` / `MAP_REPORT_BT_32.md` bằng mục mới **"BT_ART_03 — Gate C1 / C2"**.

## 3. `BOSS_LUC_DAN` — tướng Đông Ngô Lục Dận

| Dữ kiện | Độ chắc chắn |
|---|---|
| Tướng nhà Ngô được cử sang Giao Châu năm 248 đánh dẹp khởi nghĩa Bà Triệu; dùng của cải chiêu dụ, mua chuộc (theo nội dung câu hỏi/bối cảnh team — `SUTA_BT_TASK_00.md` §3.4) | trung bình — nguồn team |
| Ngoại hình, tuổi, giáp, binh khí | **thấp — không có nguồn**; dưới là **thiết kế game**, hỏi team ở Gate C1 |

- Thiết kế (`DESIGN_BASELINE`): võ tướng trưởng thành, **cùng phe màu Ngô** (chàm sẫm `#34407A` + giáp lá/giáp vảy sắt xám) nhưng
  **khác lính thường** bằng: giáp phủ vai, mũ trụ có chóp/tua, đai lưng đồng, áo choàng ngắn **nâu sẫm** (không đỏ — BT_ART_01 mục 4.5),
  cầm **kiếm thẳng** hoặc cờ lệnh. Dáng **tự đắc, chỉ huy từ xa**; mặt không biếm hoạ quá mức, không yêu quái hoá.
- Chuẩn 34 ± 1 (không tính mũ trụ). Ô 48×48; vũ khí/cờ vượt ô → đề xuất `frame_w` riêng.
- `idle`: đứng chống kiếm / tay chắp sau, áo choàng lay nhẹ (đứng trên đài — vẽ **chân trên baseline**, không vẽ sàn đài).
- `command` (hit 3): giơ kiếm/cờ lệnh chỉ tới trước = **ra lệnh bắn tên**; ô 3 là đỉnh động tác.
- `fall`: đài sụp — chới với, ngã ngửa/khuỵu, **ô cuối = ngồi bệt** (chân vẫn trên baseline; code lo việc rơi theo trục y).
- `mud_idle`: đứng **ngập bùn tới gối** (phần dưới gối không vẽ / bị bùn che — bùn là màu đất có sẵn), lúng túng, mất mũ trụ hoặc mũ lệch,
  **không** cầm vũ khí giơ lên (GĐ 3 không tấn công). Cỡ đầu như `idle`.
- `hurt`: giật lùi khi trúng đòn (từ tư thế `mud_idle`). `flee`: chạy sang **phải** (code lật khi chạy trái), áo choàng bay, ngoái lại.
- Không vẽ: ngựa, xe, kiệu (khác Tô Định chương 1), cờ có chữ, chữ Hán trên giáp.

## 4. `EN_NGO_ARMORED_CAVALRY` — kỵ binh thiết giáp

- Ngựa + người **phủ giáp sắt** dày (giáp ngựa che ngực/cổ, người giáp vảy kín, mũ sắt) — đọc được ngay là "đánh thường không thủng",
  khác `EN_NGO_CAVALRY` (giáp nhẹ, BT_ART_01). Tông sắt xám + chàm Ngô, ánh kim ít (không vàng).
- Cùng tỉ lệ người với `EN_NGO_CAVALRY` (người 34 ± 1 khi đứng), cùng ô 96×64, cầm thương/kích chĩa trước.
- `gallop`: phi sang **phải**. `blocked`: giật nhẹ, giáp loé (vẽ loé trên giáp, **không** vẽ tia lửa — đó là `FX_BT_ARMOR_SPARK`).
- `knockback` (voi húc): cả ngựa lẫn người **bị hất văng lùi**, giáp vỡ rời vài mảnh, ô cuối ngã nằm. `death`: từ tư thế đứng ngã xuống
  (dùng khi giáp đã vỡ). Ghi bbox thân từng ô vào report.

## 5. `PROP_BT_COMMAND_TOWER` — đài chỉ huy

- Đài cao **gỗ + tre** dựng tạm trên nền đá (quân Ngô dựng để chỉ huy), mặt sàn phẳng rộng ~40–48 px logic, **mặt sàn cao 128 px logic
  trên chân đài** (người chơi nhảy tối đa ~83 px — không với tới). Cờ hiệu không chữ.
- Ô 96×160, pivot bottom-center. Ghi vào report: **độ cao mặt sàn** (px logic từ đáy) và **x hai mép sàn** từ pivot (Claude đặt Lục Dận).
- `shake`: rung khi bị phá (GĐ 2 → 3), lệch ≤ 2 px logic. `collapse` 10 ô: gãy cột, sụp xuống, ô cuối = **đống gỗ đổ** thấp (≤ 24 px).
  Không vẽ Lục Dận trong prop.

## 6. `EN_BT_GOLD_TOWER` — tháp canh chứa vàng

- Tháp canh gỗ nhỏ, tầng trên có **hòm/rương vàng** lộ ra, lính Ngô (nhỏ, nửa người) đứng ném — **phá được** (chém chân tháp). Ô 48×96;
  người trên tháp cùng tỉ lệ 34 (chỉ thấy nửa thân).
- `idle`: vàng lấp lánh nhẹ (2–3 điểm sáng). `throw` (hit 4): lính vung tay ném đồng vàng — **ô 4 tay rời vật**, không vẽ đồng tiền rời
  tay trong sprite (đạn là `PJ_BT_GOLD_COIN`); ghi **điểm rời tay** (px logic từ pivot) vào report.
- `hurt`: tháp rung. `destroyed`: gãy đổ, vàng vương vãi, ô cuối đống đổ thấp.

## 7. ĐẠN, FX

- `PJ_BT_GOLD_COIN`: một đồng tiền vàng lỗ vuông (tiền đồng đúc thời Ngô — **độ chắc chắn trung bình**, hỏi team), xoay 6 ô; thấy được ≥ 8 px.
- `PJ_BT_POISON_ARROW`: tên rơi thẳng đứng, mũi xuống, **đầu tên xanh lục thẫm** (tẩm độc), lông đuôi; mũi ở đáy ô.
- `FX_BT_STUN`: 3–4 đồng tiền vàng nhỏ + chấm sáng **xoay vòng** quanh một tâm (code đặt trên đầu người chơi); bán trong suốt được.
- `FX_BT_ARMOR_SPARK`: tia lửa trắng-vàng toé hình quạt, tan ở ô 4. Không chữ, không số.

## 8. `PLAYER_BA_TRIEU_ELEPHANT` — Bà Triệu giáp vàng cưỡi Bạch Tượng (cutscene)

- **Voi = đúng `NPC_BACH_TUONG`** (BT_ART_02: một ngà, trắng ngà, cùng tỉ lệ, cùng màu — so pixel thân voi ở report); thêm **bành/tấm phủ
  lưng** đơn giản.
- **Bà Triệu = thiết kế mới** (`PLAYER_BA_TRIEU`/`PORTRAIT_BA_TRIEU` BT_ART_02: mũ vàng, áo vàng nghệ, choàng đỏ) **mặc thêm giáp vàng**
  (giáp ngực/vai vàng nghệ — "mặc giáp vàng" theo cutscene §5.2), cầm kiếm/giáo chỉ trước. Cỡ đầu Bà Triệu = `PLAYER_BA_TRIEU` ±1 px ảnh.
- `idle`: voi đứng thở, Bà Triệu ngồi thẳng. `charge`: như `NPC_BACH_TUONG.charge` (cùng nhịp chân), Bà Triệu nghiêng người, khăn/choàng bay.
- Không vẽ lại theo bản `samples/` (thiết kế Bà Triệu cũ).

## 9. MÔI TRƯỜNG — CHIẾN LŨY BỒ ĐIỀN

- **`BG_BT_MID_FORTRESS`** (mẫu C1): nửa trái **đầm lầy** (nước đọng, lau sậy — cùng ngôn ngữ `BG_BT_MID_MARSH`), nửa phải **núi đá**
  (cùng ngôn ngữ `BG_BT_MID_ROCKY_SLOPE`); giữa là **chiến lũy của nghĩa quân**: rào tre vót nhọn nhiều lớp, ụ đất, chòi canh tre, cờ không chữ.
  Không vẽ quân, tháp vàng, đài chỉ huy trong nền (là sprite riêng). Không che dải 60–110 px trên `GROUND_Y`.
  Đấu trường 1 màn hình nhưng vẫn lặp ngang không vệt (QA 5.4) để camera rung không lộ mép.
- **`PROP_BT_VICTORY_FLAG`**: cờ nghĩa quân **vàng nghệ viền đỏ** (đồng bộ Bà Triệu), không chữ/hoạ tiết rồng; 4 ô bay.
- Không vẽ đền, chùa, công trình đá kiểu Trung Hoa.

## 10. ACCEPTANCE

### Gate C1
1. `CONCEPT_BT_LUC_DAN`: Lục Dận, kỵ binh thiết giáp, `PROP_BT_COMMAND_TOWER` (Lục Dận đứng trên sàn), tháp vàng (phác), Bà Triệu giáp vàng
   cưỡi voi (phác) cạnh `PLAYER_MALE`, `EN_NGO_SOLDIER`, `EN_NGO_CAVALRY`, `NPC_BACH_TUONG` ở cỡ chơi thật — phe Ngô / Việt phân biệt bằng
   silhouette + màu; Lục Dận khác lính thường rõ; kỵ binh thiết giáp khác `EN_NGO_CAVALRY` rõ.
2. `BOSS_LUC_DAN` đủ 6 animation, `EN_NGO_ARMORED_CAVALRY` đủ 4, `PROP_BT_COMMAND_TOWER` đủ 3: đúng cỡ ×4, số frame, alpha 0/255, pivot,
   quay **phải**; bảng cỡ đầu từng ô (mục 0.1).
3. `BG_BT_MID_FORTRESS`: lặp ngang không vệt; mockup ×1/×2 với tileset, `PLAYER_FEMALE`, đài chỉ huy + Lục Dận: nhân vật nổi rõ hơn nền.
4. Report đủ; status tối đa `NORMALIZED`. **Dừng.**

### Gate C2
1. Đủ mục 1a + 1b còn lại; QA brief mục 5 và mục 0.1 đạt; manifest khớp file; mục cũ không đổi (hash).
2. `PLAYER_BA_TRIEU_ELEPHANT`: thân voi trùng `NPC_BACH_TUONG` (so pixel), cỡ đầu Bà Triệu = `PLAYER_BA_TRIEU` ±1.
3. Mockup cỡ chơi thật trên `BG_BT_MID_FORTRESS`: (a) GĐ 1 — đài + Lục Dận `command`, 3 `EN_BT_GOLD_TOWER`, vài `PJ_BT_POISON_ARROW`,
   `PJ_BT_GOLD_COIN`, `PLAYER_MALE` + `FX_BT_STUN`; (b) GĐ 2 — `EN_NGO_ARMORED_CAVALRY` + `FX_BT_ARMOR_SPARK`, `NPC_BACH_TUONG.charge`;
   (c) GĐ 3 — đài `collapse` ô cuối, Lục Dận `mud_idle`; (d) cutscene — `PLAYER_BA_TRIEU_ELEPHANT.charge` + `PROP_BT_VICTORY_FLAG`.
4. Report đủ; **dừng** chờ duyệt.

## 11. BÁO CÁO & DỪNG

- Report theo mẫu brief mục 6, thêm bảng **"Số đo cho code"**: mặt sàn đài (cao + 2 mép x); điểm rời tay `EN_BT_GOLD_TOWER.throw` ô 4;
  bbox thân kỵ binh từng ô `gallop`/`knockback`; mép trước thương kỵ binh; bbox `BOSS_LUC_DAN` từng animation (+ độ sâu bùn ở `mud_idle`);
  bbox đống đổ ô cuối `collapse`/`destroyed`; tâm vòng `FX_BT_STUN`.
- **Câu hỏi cho team** (bắt buộc ghi): giáp, mũ, binh khí Lục Dận; kiểu tiền đồng thời Ngô; giáp ngựa kỵ binh Ngô thế kỷ 3; giáp vàng Bà Triệu
  (truyền thuyết) vẽ mức nào; mọi chi tiết lịch sử Codex không chắc.
- **Dừng sau Gate C1**, chờ team duyệt; làm C2 rồi **dừng sau Gate C2**.

## 12. CÂU HỎI CHỜ NGƯỜI DÙNG CHỐT TRƯỚC KHI GIAO

| # | Câu hỏi | Đề xuất |
|---|---|---|
| A1 | Lục Dận trên đài — đài là **sprite prop có animation sụp** (`PROP_BT_COMMAND_TOWER`) hay vẽ chung vào boss? | **Prop riêng** — code đặt Lục Dận lên sàn, sụp độc lập |
| A2 | Tháp vàng có lính ném trên tháp (1 sprite) hay tháp tự "phun" vàng? | **Có lính nửa người trên tháp** — dễ hiểu "ném tiền mua chuộc" |
| A3 | Cutscene Bà Triệu cưỡi voi: vẽ asset mới `PLAYER_BA_TRIEU_ELEPHANT` (cùng ID bản mẫu, thiết kế mới) hay chỉ dùng chữ + `NPC_BACH_TUONG`? | **Vẽ mới** — cutscene §5.2 có hình ảnh này |
| A4 | Lính thường ở màn 3 (giữa các GĐ) dùng `EN_NGO_SOLDIER` có sẵn? | **Dùng lại**, không vẽ thêm |
