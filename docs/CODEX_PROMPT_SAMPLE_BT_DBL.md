# CODEX PROMPT — ĐỢT MẪU NHÂN VẬT: BÀ TRIỆU & ĐINH BỘ LĨNH (32-bit)

Ngày giao: 09/10/2026 • Người giao: team Sử Ta (Claude soạn) • Skill: agent-sprite-forge / `$generate2dsprite`

> Đọc **[SUTA_TT_ART_BRIEF_32.md](../SUTA_TT_ART_BRIEF_32.md)** trước. Brief đó quy định **luật kỹ thuật chung** (mật độ ×4, strip,
> pivot, baseline, viền, đổ bóng, alpha, xoá nền, QA, báo cáo) — **áp dụng nguyên vẹn**. Riêng **mục 3 (art bible năm 40 SCN)** chỉ
> dùng làm **chuẩn phong cách vẽ**; trang phục/bối cảnh của đợt này theo **mục 3 và mục 4 của prompt này** (hai thời kỳ khác).
> Prompt này mâu thuẫn với brief → theo prompt, ghi vào report.

---

## 0. MỤC TIÊU

Hai chương mới, mỗi chương có **nhân vật chính (player)** riêng:

| Chương | Nhân vật | Thời điểm vẽ |
|---|---|---|
| Bà Triệu | Triệu Thị Trinh — nữ tướng khởi nghĩa chống quân Ngô | năm 248 |
| Đinh Bộ Lĩnh | Đinh Bộ Lĩnh — thủ lĩnh dẹp loạn 12 sứ quân (Vạn Thắng Vương) | khoảng 951–967, **trước** khi lên ngôi |

Đây là **đợt mẫu**: mục đích là **chốt nhận diện nhân vật** (silhouette, trang phục, màu, vũ khí) trước khi vẽ đủ bộ animation.
Dừng ở cuối đợt (Gate S1), chờ duyệt. **Không** vẽ jump/dash/attack/hurt/death/victory ở đợt này.

## 1. DANH SÁCH ASSET

| # | Asset ID | Loại | Ô logic → ảnh | Animation | Ghi chú |
|---|---|---|---|---|---|
| 1 | `CONCEPT_BA_TRIEU` | concept | tự do | — | bảng thiết kế, **không vào game** |
| 2 | `PLAYER_BA_TRIEU` | player | 48×48 → 192×192 | `idle` 6 @9 lặp • `run` 8 @16 lặp | đi bộ, cỡ như `PLAYER_TRUNG_TRAC` |
| 3 | `PORTRAIT_BA_TRIEU` | portrait | 64×64 → 256×256 | `idle` 1 | ngang vai, nhìn sang phải |
| 4 | `PLAYER_BA_TRIEU_ELEPHANT` | player | 128×96 → 512×384 | `idle` 6 @9 lặp • `walk` 8 @12 lặp | Bà Triệu cưỡi voi trắng một ngà |
| 5 | `CONCEPT_DINH_BO_LINH` | concept | tự do | — | bảng thiết kế, **không vào game** |
| 6 | `PLAYER_DINH_BO_LINH` | player | 48×48 → 192×192 | `idle` 6 @9 lặp • `run` 8 @16 lặp | cỡ như `PLAYER_TRUNG_TRAC` |
| 7 | `PORTRAIT_DINH_BO_LINH` | portrait | 64×64 → 256×256 | `idle` 1 | ngang vai, nhìn sang phải |

- Số frame/fps `idle`/`run` lấy theo `PLAYER_TRUNG_TRAC` trong `manifest_tt.json` để sau này dùng chung nhịp code. Số của dạng cưỡi voi
  (128×96, `walk` 8 @12) là `DESIGN_BASELINE` (cùng cỡ ô với `BOSS_TO_DINH_CHARIOT`); voi + người cưỡi phải nằm gọn trong ô, chân voi
  ở baseline `384 − 5 … 384 − 8`.
- **Concept sheet** (1 file PNG/nhân vật, nền phẳng sáng, được có chữ chú thích **chỉ trên concept**): turnaround trước–nghiêng–sau ở cỡ
  lớn; cận đầu (kiểu tóc, đồ cài); cận vũ khí; bảng màu dùng; 1 hình thu nhỏ đúng cỡ chơi (48×48 logic ×1) đặt cạnh `PLAYER_TRUNG_TRAC`
  để so tỉ lệ. Concept của Bà Triệu có thêm voi (nghiêng) + tư thế cưỡi.
- Mỗi nhân vật: **tối thiểu 2 phương án** silhouette nhỏ (đen, 48×48 ×1) trên concept, đánh dấu phương án chọn vẽ chi tiết.

## 2. THƯ MỤC, MANIFEST, BẢNG MÀU

- Vùng làm việc (ngoài git): **`assets/sprites-32bit/samples/`** — cấu trúc `<category>/<ID>/<id_lower>_<animation>.png` như brief,
  concept ở `samples/concept/<ID>.png`. **Không** đụng `assets/sprites-32bit/` của chương Trưng Trắc, không sửa `manifest_tt.json`,
  không đụng `frontend/`.
- Manifest riêng: `assets/sprites-32bit/samples/manifest_samples.json` — cùng định dạng `manifest_tt.json` (`chapter: "samples"`,
  `density: 4`, `pivot: bottom-center`, `facing: right`, status tối đa `NORMALIZED`). Concept không đưa vào manifest.
- Bảng màu: tạo **2 bảng mới** `samples/palette_32_bt.png` và `samples/palette_32_dbl.png` (mỗi bảng ≤ 96 màu). **Kế thừa** từ
  `palette_32_tt.png` các dải dùng chung (da, tóc, viền tối `#1A1414`/`#3B2A24`, gỗ/tre, sắt, lửa) để 3 chương đồng bộ; màu mới chỉ
  thêm khi cần, liệt kê trong report. Mỗi asset ≤ 32 màu (dạng cưỡi voi ≤ 40).
- Report: `assets/sprites-32bit/samples/SAMPLE_REPORT_32.md` theo mẫu mục 6 của brief.

## 3. BÀ TRIỆU — TƯ LIỆU & THIẾT KẾ

### 3.1 Tư liệu chính thống (để hiểu nhân vật, không vẽ chữ)

- **Triệu Thị Trinh** (thường gọi Bà Triệu, Triệu Ẩu), người quận Cửu Chân, vùng Quân Yên (nay thuộc Thanh Hoá). Anh trai là
  **Triệu Quốc Đạt**. Ghi chép chính: *Đại Việt sử ký toàn thư* (thời Lê), *Việt Nam sử lược* (Trần Trọng Kim); sử Trung Quốc (Tam quốc
  chí) có nhắc cuộc nổi dậy ở Cửu Chân, Giao Chỉ năm 248.
- Năm **248** khởi nghĩa ở vùng **núi Nưa** (Thanh Hoá) chống ách đô hộ của **nhà Ngô (Đông Ngô, thời Tam Quốc)**; được nhân dân
  Cửu Chân, Giao Chỉ hưởng ứng, thắng nhiều trận. Sau nhiều tháng chống lại tướng Ngô Lục Dận thì thất bại, mất năm 248. Đền thờ ở
  Hậu Lộc, Thanh Hoá. Nghĩa quân tôn bà là **Nhụy Kiều tướng quân**.
- Câu nói nổi tiếng (ý): muốn *cưỡi cơn gió mạnh, đạp luồng sóng dữ, chém cá kình ở biển Đông*, chứ không chịu cúi đầu làm tì thiếp —
  dùng để định **khí chất**: trẻ, hiên ngang, dứt khoát, không e lệ.
- **Hình tượng dân gian** (hình ảnh quen thuộc, dùng cho nhận diện): mặc **áo vàng** khi ra trận, **cài trâm vàng**, **đi guốc ngà**,
  **cưỡi voi trắng một ngà** — theo truyền thuyết bà cùng dân vây bắt con voi trắng một ngà phá hoại mùa màng ở đầm lầy, nhảy lên đầu
  voi thuần phục nó rồi dùng làm voi chiến.

### 3.2 Thiết kế `PLAYER_BA_TRIEU` (đi bộ)

- **Tuổi/khí chất:** nữ tướng trẻ (~22), dáng thẳng, cằm hơi ngẩng, bước dài. Phải **khác rõ Trưng Trắc** khi đặt cạnh nhau.
- **Màu nhận diện chủ đạo: VÀNG NGHỆ/vàng đất** (áo) — đây là dấu hiệu đọc được ở cỡ 48×48. Vàng là **vải nhuộm** (vàng nghệ
  `≈ #D9A43A` dải 3–5 tông, ngả đất ở bóng), **không phải kim loại vàng óng** — brief cấm giáp vàng kiểu fantasy.
- **Áo giáp:** áo ngắn vàng + **giáp da** che ngực/vai (nâu sẫm, nẹp đồng nhỏ), thắt lưng vải — đọc ra "giáp" nhưng mộc mạc, cổ đại.
- **Tóc:** búi cao, **trâm vàng** (1 nét sáng, thấy rõ ở `idle`); có thể có 1 dải khăn/dải tóc bay khi `run`.
- **Dưới:** váy/quần ngắn tới gối màu nâu đất hoặc chàm, viền hoa văn hình học kiểu Đông Sơn muộn (răng cưa, vòng tròn) — thế kỷ 3
  vẫn là văn hoá Việt cổ, được dùng lại ngôn ngữ phe Việt của brief (3.2) nhưng **không mũ lông chim** (để khác Trưng Trắc).
- **Chân:** **guốc ngà** (đế màu ngà `≈ #EDE2C8`, 1–2 pixel cao) — chi tiết nhỏ, đừng làm vướng dáng chạy.
- **Vũ khí:** **gươm/kiếm** (team chốt 09/10; lưỡi sắt thẳng, cán có chuôi đồng) cầm tay phải — khác giáo của Trưng Trắc. Độ dài lưỡi ~ 20–24 px
  logic. `idle`: kiếm hạ chéo hoặc vác vai; `run`: kiếm cầm ngang thấp, không che mặt.
- **Không** mũ quan, không áo vạt chéo kiểu Hán/Ngô, không áo choàng dài lê đất.

### 3.3 Thiết kế `PLAYER_BA_TRIEU_ELEPHANT` (cưỡi voi)

- **Voi trắng một ngà**: trắng ngà/xám rất nhạt (đổ bóng xám-ấm, **không** trắng tinh, không xanh), tai lớn, **chỉ 1 ngà** (ngà phía
  người xem thấy — chọn 1 bên, ghi lại để các animation sau giữ nhất quán). Không bành voi kiểu Thái/Ấn cầu kỳ: **tấm phủ lưng vải
  vàng/đỏ** + dây buộc; người cưỡi **ngồi sát gáy voi** (đúng truyền thuyết "nhảy lên đầu voi"), tay giơ kiếm ở `idle`.
- Bà Triệu trên voi dùng **cùng thiết kế** 3.2 (cùng màu, cùng trâm, cùng kiếm) — nhìn là biết một người.
- `walk`: bước voi nặng, thân lên xuống 1–2 px logic, vòi đung đưa; người cưỡi nhún theo, dải khăn bay.
- Tỉ lệ: voi cao ~60–70 px logic tính tới lưng; tổng cả người ~ 88–92 px, nằm gọn trong 96.

### 3.4 Không vẽ

- **Không** vẽ/gợi chi tiết "vú dài ba thước buộc sau lưng" — đó là mô tả từ sử liệu Trung Quốc (Giao Châu ký) mang tính bôi nhọ, các
  nhà sử học (vd. Keith Taylor) coi là cách hạ thấp cuộc khởi nghĩa; không phù hợp game giáo dục. Thân hình bình thường, trang phục kín đáo.
- Không hình tượng "thánh mẫu" (hào quang, mây thần, tiên nữ bay).

## 4. ĐINH BỘ LĨNH — TƯ LIỆU & THIẾT KẾ

### 4.1 Tư liệu chính thống

- **Đinh Bộ Lĩnh** (924–979), quê động Hoa Lư, châu Đại Hoàng (nay thuộc Ninh Bình — vùng núi đá vôi, sông nước). Cha là **Đinh Công
  Trứ**, nha tướng của Dương Đình Nghệ; mồ côi cha từ nhỏ.
- Thời thơ ấu chăn trâu, được bạn bè **tôn làm thủ lĩnh**, lấy **bông lau làm cờ** tập trận (tích "cờ lau tập trận").
- Sau khi nhà Ngô suy (cuối Ngô, 965–966), đất nước rơi vào **loạn 12 sứ quân**. Đinh Bộ Lĩnh liên kết với sứ quân **Trần Lãm** (Trần
  Minh Công), lần lượt dẹp yên các sứ quân, được tôn là **Vạn Thắng Vương**.
- Năm **968** lên ngôi hoàng đế (Đinh Tiên Hoàng), đặt quốc hiệu **Đại Cồ Việt**, đóng đô ở **Hoa Lư**. Mất năm 979. — Đợt này vẽ
  **trước khi lên ngôi**: tướng trẻ cầm quân (khoảng 27–43 tuổi), **không** long bào, không mũ miện.

### 4.2 Lưu ý về độ chắc chắn

Trang phục quân đội thế kỷ 10 của người Việt **có rất ít tư liệu hình ảnh** (khảo cổ Hoa Lư chủ yếu là nền móng, gạch ngói, đồ gốm;
hội thảo "Trang phục, cổ phục thời Đinh" ở Ninh Bình vẫn đang tranh luận). Vì vậy thiết kế dưới đây là **`DESIGN_BASELINE` có cơ sở**,
mục tiêu là **không sai thời đại** hơn là "phục dựng chính xác". Chi tiết nào Codex không chắc → ghi vào "Câu hỏi cho team", không bịa
thêm hoa văn/biểu tượng.

### 4.3 Thiết kế `PLAYER_DINH_BO_LINH`

- **Tuổi/khí chất:** nam tướng trẻ ~30, vạm vỡ vừa phải, dáng chắc, nét mặt cương nghị — "thủ lĩnh từ dân mà lên", không quý tộc cầu kỳ.
- **Màu nhận diện chủ đạo: NÂU ĐẤT + ĐỎ** — áo nâu sẫm/chàm, **khăn/đai đỏ** làm điểm nhấn; giáp màu da thuộc + sắt. Khác vàng
  của Bà Triệu và kem-đồng của Trưng Trắc.
- **Đầu:** tóc búi tó trên đỉnh, **khăn vấn/khăn chít đầu đỏ** (dải đuôi khăn bay khi chạy) — không mũ sắt kiểu Hán, không mũ quan.
- **Thân:** áo ngắn tay chẽn (vạt ngắn trên gối), ngoài là **giáp lá/giáp da** che ngực-bụng + giáp vai đơn giản, thắt lưng vải đỏ.
- **Dưới:** quần ống gọn, **xà cạp/quấn ống chân**, chân đất hoặc dép cỏ — người vùng sông nước Hoa Lư.
- **Vũ khí:** **đao lưỡi rộng cán ngắn** bằng sắt (team chốt 09/10); phải khác giáo đồng của Trưng Trắc và kiếm thẳng của Bà Triệu. `idle`: đao chống/hạ bên hông; `run`: đao cầm thấp phía sau.
- **Biểu tượng cờ lau:** 1 chi tiết nhỏ gợi tích cờ lau (vd. **túm bông lau** cài ở thắt lưng hoặc buộc ở cán vũ khí, màu kem-bạc) —
  chỉ là điểm nhấn, đọc được ở concept; ở 48×48 không được làm rối silhouette.
- **Chân dung** `PORTRAIT_DINH_BO_LINH`: khăn đỏ, búi tóc, giáp vai, ánh mắt nhìn xa; nền trong suốt.

### 4.4 Không vẽ

- **Không** hoa văn Đông Sơn/lông chim trống đồng (đã cách năm 40 SCN gần 1000 năm) — đây là điểm phân biệt thời đại.
- **Không** giáp/mũ kiểu Tống–Đường, áo bào thêu rồng, long bào, mũ miện, kiếm có tua kiểu phim cổ trang Trung Quốc; không giáp tấm Nhật/Âu.
- **Không** chữ Hán/chữ Việt trên cờ, khiên, áo (kể cả chữ "Đinh", "Thiên tử quân").
- **Không** chùa, tháp, kinh thành nguy nga làm nền concept (nền concept để trống hoặc đá vôi Hoa Lư mờ).

## 5. ACCEPTANCE (Gate S1)

1. Đủ 7 mục ở bảng mục 1; strip đúng cỡ ×4, đúng số frame, true alpha 0/255, pivot bottom-center, quay **phải**, baseline 184–187
   (48×48) / 376–379 (128×96).
2. Đặt `PLAYER_BA_TRIEU`, `PLAYER_DINH_BO_LINH`, `PLAYER_TRUNG_TRAC` cạnh nhau ở cỡ chơi thật (×1 và nội suy N = 2, 3) trên tile mặt đất
   hiện tại: **phân biệt được 3 người chỉ bằng silhouette + màu chủ đạo** (kem-lông chim / vàng-trâm-kiếm / nâu đỏ-khăn-đao). Xuất ảnh
   so sánh `samples/preview/lineup.png`.
3. Đặt `PLAYER_BA_TRIEU_ELEPHANT` cạnh `BOSS_TO_DINH_CHARIOT` và `EN_HAN_CAVALRY`: cùng mật độ nét, cùng tỉ lệ người. Xuất
   `samples/preview/elephant_scale.png`.
4. Tỉ lệ bán-chibi ~4–4,5 đầu, cùng độ cao thân với `PLAYER_TRUNG_TRAC` (120–136 px ảnh); nét/viền/đổ bóng khớp asset `IN_GAME` (brief 3.1).
5. Không vi phạm brief 3.5 (trừ phần thời đại đã thay ở mục 3–4 prompt này) và các mục "Không vẽ" 3.4, 4.4.
6. QA mục 5 brief (1–3, 5–7) đạt; report đủ mục; status tối đa `NORMALIZED`.

## 6. BÁO CÁO & DỪNG

- Ghi `SAMPLE_REPORT_32.md` (mẫu mục 6 brief) + bảng "Lựa chọn thiết kế" (phương án silhouette đã chọn, ngà voi bên nào, màu mới thêm
  vào bảng).
- Câu hỏi cho team: mọi chi tiết lịch sử không chắc (đặc biệt trang phục thế kỷ 10).
- **Dừng sau Gate S1.** Đợt sau (sau khi team duyệt nhận diện) mới vẽ `jump`/`dash`/`attack_01`/`hurt`/`death`/`victory` và các
  animation chiến đấu của dạng cưỡi voi.
