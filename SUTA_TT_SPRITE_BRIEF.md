# SỬ TA — CHƯƠNG TRƯNG TRẮC
# SPRITE BRIEF CHO CODEX (agent-sprite-forge / $generate2dsprite)

Version 1.0 • 24/09/2026 • Phạm vi: nhân vật, binh lính, chướng ngại vật, projectile đi kèm đòn đánh

---

## 0. NHIỆM VỤ

Bạn là **Pixel Technical Artist** cho game "Sử ta": platformer 2D góc nhìn ngang (side-scroller), phong cách 8-bit, bối cảnh khởi nghĩa Hai Bà Trưng (năm 40 SCN). Game chạy trên web (HTML5 canvas + JS, backend Flask). **Không dùng Godot.**

Nhiệm vụ của bạn:
- Dùng `$generate2dsprite` để tạo toàn bộ sprite liệt kê ở mục 5, theo đúng thứ tự batch và gate ở mục 4.
- Xuất asset đúng frame contract (mục 3), đúng folder và tên file (mục 6), cập nhật manifest JSON.
- Viết báo cáo `SPRITE_REPORT_TT.md` (mục 8).

Bạn **không** viết code gameplay, không tạo scene Godot, không tạo map/tileset, không sửa file ngoài thư mục `assets/sprites/`.

---

## 1. QUY TẮC BẮT BUỘC (SOURCE OF TRUTH)

1. File này là Source of Truth cho ID, canvas, số frame, tên animation. Không đổi, không thêm ID mới gần giống. Thiếu dữ liệu → ghi `TODO_MISSING` trong report, không tự bịa.
2. Nếu contract trong file này xung đột với giới hạn kỹ thuật của skill (xem `SKILL.md`, `references/modes.md`, `references/prompt-rules.md` của generate2dsprite): **giữ nguyên ID, số frame, canvas, pivot**; cách generate/layout sheet thì làm theo skill. Ghi xung đột vào report.
3. Mỗi animation generate thành **sheet riêng**, QC xong mới ghép. Không nhồi nhiều animation vào một ảnh.
4. Asset không normalize được về đúng contract mà không vẽ lại → đánh `NEED_REDRAW` + lý do. Không tự crop/scale bừa để "cho qua".
5. Trạng thái asset: `RAW_AI` → `NORMALIZED` → `QA_PASS` → `IN_GAME`. Codex chỉ được đặt tối đa `NORMALIZED`. `QA_PASS` do người trong team duyệt.
6. Dừng ở mỗi GATE (mục 4) và chờ người duyệt. Không tự chạy sang batch tiếp theo.
7. Không copy nhân vật, sprite, logo của bất kỳ game/IP nào.

---

## 2. ART BIBLE (KHÓA TOÀN CHƯƠNG)

### 2.1 Kỹ thuật
- **Góc nhìn:** side view thuần (profile hoặc 3/4 nhẹ hướng camera), **mọi sprite quay mặt sang PHẢI**. Code sẽ lật ngang khi cần.
- **Phong cách:** 8-bit pixel art, khối màu phẳng, bóng đổ 1–2 tông, outline 1px màu tối `#1A1414` (không dùng đen tuyền dày).
- **Không anti-alias**, không gradient mịn, không glow mềm, không nhiễu.
- **Nền khi generate:** màu chroma phẳng theo quy định của skill (thường magenta `#FF00FF`). **Cấm dùng magenta/hồng sen trong bản thân nhân vật.**
- **Scale:** mọi frame cuối cùng ở độ phân giải gốc (1x). Nếu ảnh generate lớn hơn, downscale bằng **nearest-neighbor**, không bilinear. Game render bội số nguyên ×3.
- **Ánh sáng:** từ trên-trái, cố định cho mọi asset.
- **Pivot:** bottom-center. Chân mọi frame nằm trên cùng một baseline (hàng pixel cuối có nội dung = `frame_h - 2`, chừa 1–2px đệm).
- **Không** chữ, không label, không khung UI, không checkerboard, không bóng đổ dưới chân (code tự vẽ).

### 2.2 Palette (tối đa ~28 màu cho cả chương)

| Nhóm | Màu (hex) |
|---|---|
| Outline / tối | `#1A1414`, `#3B2A24` |
| Da | `#F0C49A`, `#D49A6A`, `#9C6340` |
| Tóc | `#1E1A1A`, `#3A302C` |
| Đồng Đông Sơn (vũ khí, trang sức Việt) | `#E3B25C`, `#B8803A`, `#7A4E24` |
| Vải Lạc Việt (nâu đất, chàm, kem) | `#8A5A34`, `#5E3A22`, `#34407A`, `#EDE2C8` |
| Điểm nhấn Việt | `#C8322A` (thắt lưng/khăn đỏ), `#F4F0E6` (lông chim) |
| Quân Hán (đen, đỏ son, sắt) | `#262428`, `#8E1F24`, `#B8363A`, `#6C6E7A`, `#A5A8B2` |
| Gỗ / tre | `#A7773F`, `#6E4A26`, `#C9B26A` |
| Thiên nhiên / thú | `#D98A2B` (hổ), `#F2E3C2`, `#4F8A3C`, `#2F5E2A` |
| Lửa | `#FFD25A`, `#FF8A2A`, `#D93A1E` |

### 2.3 Ngôn ngữ hình ảnh hai phe (quan trọng)
Người chơi phải nhận ra phe chỉ bằng silhouette và màu:

- **Người Việt (Lạc Việt, văn hóa Đông Sơn):** tóc búi hoặc để xõa ngang vai, mũ/đồ cài **lông chim** (như hình chiến binh trên trống đồng), áo ngắn/yếm, váy hoặc khố, họa tiết **vòng tròn tiếp tuyến, răng cưa, chim Lạc** kiểu trống đồng, trang sức vòng đồng. Vũ khí: giáo đồng mũi lá, **rìu lưỡi xéo** Đông Sơn, cung, dao găm đồng. Tông ấm: nâu đất, đồng, kem, chàm, đỏ điểm nhấn.
- **Quân Hán:** áo vạt chéo (cổ chéo), **giáp vảy màu đen/sắt**, khăn hoặc mũ vải đen, điểm màu **đỏ son**. Vũ khí: **kích** (giáo có nhánh), kiếm thẳng, nỏ, khiên chữ nhật. Tông lạnh/tối: đen, xám sắt, đỏ son.

### 2.4 Cấm (lệch lịch sử / lệch phong cách)
- Không trang phục tiên hiệp/võ hiệp Trung Quốc hiện đại, không samurai/ninja Nhật, không giáp Âu.
- Không áo dài, nón lá kiểu hiện đại cho nhân vật năm 40 SCN.
- Không thuốc súng, bom, súng, còi kim loại, xe bọc thép kim loại, phi tiêu ninja (shuriken).
- Không chữ Hán, không chữ Latin trên cờ/biển/quần áo.

---

## 3. FRAME CONTRACT CHUNG

### 3.1 Canvas theo loại

| Loại | Canvas (W×H px) | Chiều cao thân gợi ý |
|---|---|---|
| Người (player, NPC, lính bộ) | 48×48 | 30–34 px (chừa chỗ cho giáo/kích khi đánh) |
| Hổ | 64×48 | 26–30 px |
| Xe cống phẩm | 64×48 | — |
| Kỵ binh, thuyền, kiệu | 96×64 (thuyền 96×48) | — |
| Boss (chiến xa + Tô Định) | 128×96 | — |
| Tháp canh (prop tĩnh) | 48×112 | — |
| Bẫy hố chông | 48×16 | — |
| Projectile nhỏ | 16×16 (tên/dao: 24×8 hoặc 16×8) | — |
| Hiệu ứng nổ lửa | 32×32 | — |

Mọi frame trong cùng asset dùng **cùng canvas và cùng tỉ lệ** (shared scale). Nhân vật không phồng/xẹp giữa các frame.

### 3.2 Tên animation (chuẩn, không đổi)
`idle`, `run`, `walk`, `jump`, `attack_01`, `attack_02`, `throw`, `cast`, `hurt`, `death`, `talk`, `alarm`, `roll`, `break`, `charge`, `stun`, `shield_break`, `flee`, `disarmed`, `victory`, `hidden`, `reveal`, `loop`, `impact`, `float`, `shoot`, `gallop`.

### 3.3 Nhịp đòn đánh
Mọi animation tấn công phải có 3 pha rõ: **anticipation (báo trước) → contact (hit frame) → recovery**. Ghi `hit_frame` (đếm từ 1) vào manifest. Telegraph phải nhìn thấy được ít nhất 2 frame trước hit frame.

### 3.4 Định dạng giao cho engine web
Với mỗi animation, xuất **strip ngang 1×N**, mỗi ô đúng canvas, không khoảng cách giữa các ô, nền trong suốt thật (true alpha). Giữ thêm các output mặc định của skill (raw sheet, frames lẻ, GIF preview, metadata).

---

## 4. QUY TRÌNH VÀ GATE

**GATE 1 — Khóa style (bắt buộc làm trước):**
1. `PLAYER_TRUNG_TRAC` chỉ animation `idle`.
2. `EN_HAN_BASE` (lính Hán mẫu) chỉ animation `idle`.
3. Một ảnh preview `lineup_gate1.png`: hai nhân vật đứng cạnh nhau trên cùng baseline, ở scale 1x và 3x.
4. **DỪNG**, báo cáo, chờ duyệt. Nếu style bị chê, chỉ sửa 2 asset này.

**GATE 2 — Batch P0:** làm toàn bộ asset P0 ở mục 5. Lính Hán dùng `EN_HAN_BASE` đã duyệt làm **reference** (chế độ reference variant của skill) để giữ cùng tỉ lệ, nét vẽ. **DỪNG** chờ duyệt.

**GATE 3 — Batch P1**, rồi **GATE 4 — Batch P2**, mỗi gate đều dừng chờ duyệt.

Gợi ý kỹ thuật (đối chiếu với SKILL.md trước khi dùng): dùng shared scale cho mọi asset nhiều frame; căn theo thành phần lớn nhất (thân nhân vật) cho sprite người/thú; projectile/FX tách sheet riêng. Vật thể cần va chạm chính xác (hố chông, tháp canh, xe) generate riêng từng cái, không gộp prop pack.

Câu lệnh gọi mẫu:
```
Use $generate2dsprite to create <asset description>. Side-view, facing right,
8-bit pixel art, <W>x<H> per frame, <N> frames, <animation>. Follow the art bible
and frame contract in SUTA_TT_SPRITE_BRIEF.md.
```

---

## 5. DANH SÁCH ASSET

Chú thích: **P0** = bắt buộc để chơi được chương • **P1** = nên có • **P2** = để sau.
Cột "Hit" = hit frame (đếm từ 1). FPS là gợi ý, code có thể chỉnh.

### 5.1 NHÂN VẬT PHE VIỆT

#### PLAYER_TRUNG_TRAC — Trưng Trắc (nhân vật chính) • P0
Canvas 48×48. Nữ tướng trẻ, dáng khỏe, nhanh nhẹn. Tóc đen búi cao, **mũ cài lông chim trắng** kiểu chiến binh trống đồng; áo yếm/áo ngắn màu kem, váy nâu đất ngang gối có dải họa tiết vòng tròn Đông Sơn màu đồng; **thắt lưng đỏ** buông dài (điểm nhận diện); vòng đồng ở cổ tay. Vũ khí: **giáo đồng mũi lá**, cán gỗ, dài khoảng bằng chiều cao nhân vật.

| Animation | Frames | FPS | Loop | Ghi chú |
|---|---|---|---|---|
| idle | 4 | 6 | có | thở nhẹ, lông chim và thắt lưng lay nhẹ |
| run | 6 | 12 | có | chu kỳ chạy đầy đủ, giáo cầm ngang hông |
| jump | 3 | — | không | 1 bật lên, 2 đỉnh, 3 rơi (code chọn frame theo vận tốc) |
| attack_01 | 6 | 14 | không | đâm giáo thẳng. 1–2 lùi người lấy đà, **3 hit** (giáo duỗi tối đa), 4–6 thu về. Hit 3 |
| hurt | 2 | 8 | không | giật lùi, không biến dạng giải phẫu |
| death | 5 | 8 | không | quỵ xuống, nằm, frame cuối giữ nguyên |
| victory | 4 | 6 | không | **P1** — cắm cờ xuống đất, giơ tay (cờ là phần của sprite, không chữ) |

Prompt seed (EN): *Young Lac Viet female general, Dong Son bronze-age Vietnam, tall hair bun with white bird-feather headdress, cream short top, earth-brown knee skirt with bronze drum circle pattern band, long red sash, bronze bracelets, bronze leaf-blade spear.*

#### NPC_TRUNG_NHI — Trưng Nhị (em gái, NPC + đồng đội "bóng ma") • P0
Canvas 48×48. Cùng văn hóa nhưng phân biệt rõ với chị: trẻ hơn, **khăn quấn đầu màu chàm** với 2 lông chim ngắn, tóc xõa ngang vai, áo ngắn chàm, váy kem. Vũ khí: **rìu lưỡi xéo Đông Sơn** bằng đồng.
Dạng "bóng ma" hỗ trợ đánh song song sẽ do code tô màu bán trong suốt, **không vẽ riêng**.

| Animation | Frames | FPS | Loop | Ghi chú |
|---|---|---|---|---|
| idle | 4 | 6 | có | |
| talk | 4 | 8 | có | cử chỉ tay khi hội thoại |
| run | 6 | 12 | có | |
| attack_01 | 6 | 14 | không | bổ rìu chéo từ trên xuống. Hit 3 |

#### NPC_THI_SACH — Thi Sách (hào trưởng Chu Diên) • P0
Canvas 48×48. Nam giới trưởng thành, vai rộng, tóc búi, đai trán có lông chim, ngực để trần hoặc áo choàng ngắn nâu, khố có vạt họa tiết, vòng đồng lớn ở cổ. Cầm giáo chống đất. Dáng điềm tĩnh, cương nghị.

| Animation | Frames | FPS | Loop | Ghi chú |
|---|---|---|---|---|
| idle | 4 | 5 | có | |
| talk | 4 | 8 | có | |

#### NPC_LE_CHAN — Lê Chân (nữ tướng vùng biển) • P0
Canvas 48×48. Nữ tướng, **khăn quấn đầu nâu**, tóc tết, áo ngắn không tay màu nâu-kem, váy ngắn chàm, **cung gỗ** và ống tên sau lưng, dây chuỗi vỏ ốc (gợi vùng biển).

| Animation | Frames | FPS | Loop | Ghi chú |
|---|---|---|---|---|
| idle | 4 | 6 | có | |
| talk | 4 | 8 | có | |

#### PORTRAIT_* — Chân dung hội thoại/quiz • P1
Canvas 64×64, 1 frame tĩnh, khung vai trở lên, quay 3/4 sang phải, nền trong suốt.
`PORTRAIT_TRUNG_TRAC`, `PORTRAIT_TRUNG_NHI`, `PORTRAIT_THI_SACH`, `PORTRAIT_LE_CHAN`, `PORTRAIT_TO_DINH`.

### 5.2 QUÂN HÁN (dùng EN_HAN_BASE làm reference)

#### EN_HAN_BASE — Lính Hán mẫu (reference, không xuất hiện trong game) • GATE 1
Canvas 48×48. Lính bộ Hán: khăn đầu đen, áo vạt chéo đỏ son, giáp vảy đen phủ ngực-vai, quần xám, xà cạp, cầm kiếm thẳng. Chỉ cần `idle` 4 frame. Tất cả lính Hán sau đây giữ nguyên tỉ lệ đầu/thân, độ dày outline và palette của mẫu này.

#### EN_HAN_TAXMAN — Lính thu thuế • P0
Canvas 48×48. Không giáp, áo đỏ son vạt chéo, mũ vải đen, **túi tiền lớn đeo hông**, dáng hách dịch. Ném túi tiền (tầm xa).

| Animation | Frames | FPS | Loop | Ghi chú |
|---|---|---|---|---|
| idle | 4 | 6 | có | tung hứng túi tiền |
| walk | 6 | 8 | có | |
| throw | 6 | 12 | không | 1–3 vung tay ra sau, **4 thả tay**, 5–6 thu. Hit 4 (thời điểm spawn projectile) |
| hurt | 2 | 8 | không | |
| death | 4 | 8 | không | ngã, túi tiền rơi (tiền không bay ra ngoài canvas) |

→ Projectile: `PJ_COIN_POUCH` (mục 5.5).

#### EN_HAN_WATCHTOWER — Lính gác tháp canh • P1
Canvas 48×48 (lính) + prop `PROP_WATCHTOWER` 48×112 (tháp tre-gỗ, sàn đứng ở trên, thang, không có lính; 1 frame tĩnh). Lính giáp vảy, **tù và sừng trâu** đeo ngang người, cầm giáo dài.

| Animation | Frames | FPS | Loop | Ghi chú |
|---|---|---|---|---|
| idle | 4 | 5 | có | nhìn quanh |
| alarm | 4 | 8 | có | thổi tù và (telegraph gọi viện binh) |
| throw | 6 | 12 | không | phóng giáo chéo xuống. Hit 4 |
| hurt | 2 | 8 | không | |
| death | 4 | 8 | không | |

→ Projectile: `PJ_SPEAR`.

#### EN_HAN_GUARD — Thân binh của Thái thú • P0 (dùng ở boss giai đoạn 2)
Canvas 48×48. Giáp vảy đen nặng, mũ sắt, **khiên chữ nhật** đỏ-đen (không chữ), cầm **kích**.

| Animation | Frames | FPS | Loop | Ghi chú |
|---|---|---|---|---|
| idle | 4 | 6 | có | |
| walk | 6 | 8 | có | khiên trước ngực |
| attack_01 | 6 | 12 | không | đâm kích. 1–2 rút về, Hit 3, 4–6 thu |
| hurt | 2 | 8 | không | |
| death | 4 | 8 | không | |

#### EN_HAN_RUSHER — Quân cảm tử • P1
Canvas 48×48. Giáp nhẹ, băng trán đỏ, cầm đoản đao, dáng chồm về trước (lao thẳng vào người chơi).

| Animation | Frames | FPS | Loop | Ghi chú |
|---|---|---|---|---|
| run | 6 | 14 | có | chạy lao nhanh |
| attack_01 | 4 | 14 | không | chém ngang. Hit 2 |
| death | 4 | 10 | không | |

#### EN_HAN_CAVALRY — Kỵ binh • P1
Canvas 96×64. Ngựa nâu, lính giáp đen cầm kích chĩa ngang, lướt ngang màn hình rất nhanh.

| Animation | Frames | FPS | Loop | Ghi chú |
|---|---|---|---|---|
| gallop | 6 | 14 | có | vó ngựa rõ ràng |
| hurt | 2 | 8 | không | |
| death | 5 | 10 | không | người ngã khỏi ngựa, ngựa chạy khỏi khung ở frame cuối không cần thiết — chỉ cần ngã |

#### EN_HAN_BOAT — Thuyền tuần tra sông Hát • P1
Canvas 96×48. Thuyền gỗ nhỏ mũi vuông, một lính cung đứng mũi thuyền, một lính chèo ở đuôi. Mép nước dưới đáy thuyền **không vẽ** (code vẽ nước).

| Animation | Frames | FPS | Loop | Ghi chú |
|---|---|---|---|---|
| float | 4 | 5 | có | nhấp nhô nhẹ, chèo khua |
| shoot | 6 | 10 | không | 1–3 châm lửa và kéo cung, **Hit 4** bắn, 5–6 hạ cung |
| death | 5 | 8 | không | thuyền nghiêng, lính ngã |

→ Projectile: `PJ_FIRE_ARROW`.

#### EN_HAN_PALANQUIN — Kiệu quan lại (mini-boss Phần 1) • P2
Canvas 96×64. Kiệu gỗ mái cong, rèm đỏ son, **4 phu khiêng** (áo đỏ, khăn đen). Bên trong thỉnh thoảng vén rèm ném dao.

| Animation | Frames | FPS | Loop | Ghi chú |
|---|---|---|---|---|
| walk | 6 | 8 | có | 4 phu bước so le |
| throw | 4 | 10 | không | rèm vén, tay ném. Hit 3 |
| hurt | 2 | 8 | không | |
| break | 6 | 10 | không | kiệu sập, phu bỏ chạy ra khỏi hình |

→ Projectile: `PJ_THROWING_KNIFE`.

### 5.3 THÚ DỮ VÀ CHƯỚNG NGẠI VẬT

#### EN_TIGER — Hổ rừng • P0
Canvas 64×48. Hổ vằn cam-đen-kem, dáng săn mồi.

| Animation | Frames | FPS | Loop | Ghi chú |
|---|---|---|---|---|
| idle | 4 | 5 | có | đuôi quẫy |
| run | 6 | 14 | có | |
| attack_01 | 6 | 12 | không | vồ. 1–2 **khom người rõ** (telegraph), 3 bật lên, **Hit 4** vuốt chạm, 5–6 tiếp đất |
| hurt | 2 | 8 | không | |
| death | 4 | 8 | không | |

#### OB_TRIBUTE_CART — Xe gỗ chở cống phẩm • P0
Canvas 64×48. Xe gỗ hai bánh chất bó hàng cống phẩm (ngà voi, sừng, bó lông chim, giỏ ngọc trai — vẽ đơn giản), không có người kéo, lăn nhanh về phía người chơi.

| Animation | Frames | FPS | Loop | Ghi chú |
|---|---|---|---|---|
| roll | 4 | 12 | có | bánh xe quay, hàng rung |
| break | 5 | 12 | không | vỡ thành mảnh gỗ, frame cuối gần trống. Vật phẩm rơi do code sinh, **không vẽ vào đây** |

#### TR_SPIKE_PIT — Hố chông sắt • P0
Canvas 48×16 (rộng 3 tile 16px). Hố nông cắm chông sắt nhọn.

| Animation | Frames | FPS | Loop | Ghi chú |
|---|---|---|---|---|
| hidden | 1 | — | — | cỏ cao che phủ, chỉ lộ vài đầu chông nếu nhìn kỹ |
| reveal | 3 | 12 | không | cỏ rạp xuống lộ chông |

### 5.4 BOSS — THÁI THÚ TÔ ĐỊNH

#### BOSS_TO_DINH_CHARIOT — Tô Định trên chiến xa bọc khiên • P0
Canvas 128×96. **Chiến xa gỗ** bốn bánh, phía trước dựng **tường khiên gỗ bọc da** dày (đỏ-đen, đinh đồng), Tô Định núp phía sau chỉ lộ nửa người: mũ quan đen cao, áo bào đỏ sẫm, râu dài. Xe do lính đẩy phía sau hoặc tự lăn (chọn một, ghi vào report).

| Animation | Frames | FPS | Loop | Ghi chú |
|---|---|---|---|---|
| idle | 4 | 6 | có | Tô Định ló đầu nhìn rồi thụt lại |
| charge | 6 | 14 | có | xe lao tới, bánh quay nhanh |
| stun | 4 | 8 | có | sau khi đâm cột đá: khiên nứt, xe khựng, sao/choáng **không vẽ** (FX riêng) |
| throw | 6 | 10 | không | Tô Định nhô lên ném hũ dầu. 1–3 giơ hũ, **Hit 4** ném, 5–6 thụt xuống |
| shield_break | 6 | 10 | không | tường khiên vỡ tung, kết thúc giai đoạn 1. Frame cuối: xe hỏng không còn khiên |

Hai trạng thái khiên (nguyên / nứt) có thể dùng thêm sheet `idle_cracked` 4 frame — **P1**.

#### BOSS_TO_DINH_FOOT — Tô Định đi bộ (giai đoạn 3 + cutscene) • P0
Canvas 48×48. Cùng thiết kế với trên (mũ quan, áo bào đỏ sẫm, râu dài), dáng đẫy đà, hèn nhát, cầm kiếm thẳng.

| Animation | Frames | FPS | Loop | Ghi chú |
|---|---|---|---|---|
| idle | 4 | 8 | có | run rẩy, liếc ngang |
| disarmed | 4 | 10 | không | bị đánh văng kiếm, kiếm bay ra khỏi tay (kiếm không cần rời canvas) |
| flee | 6 | 12 | có | **đã cải trang**: cắt tóc, cạo râu, mặc áo vải thô nâu của dân thường, bỏ chạy ôm đầu |

### 5.5 PROJECTILE VÀ FX ĐI KÈM ĐÒN ĐÁNH (tách khỏi body)

| ID | Canvas | Frames | Loop | Mô tả | Ưu tiên |
|---|---|---|---|---|---|
| PJ_COIN_POUCH | 16×16 | 4 | có | túi vải buộc dây xoay tròn, lộ vài đồng xu tròn lỗ vuông | P0 |
| PJ_OIL_JAR | 16×16 | 4 | có | hũ đất nung, miệng có giẻ đang cháy, xoay | P0 |
| FX_OIL_FIRE | 32×32 | 6 | không | hũ vỡ bùng lửa: 1–2 vỡ, 3–4 bùng cao, 5–6 tàn | P0 |
| PJ_SPEAR | 32×8 | 1 | — | giáo bay ngang, code tự xoay góc | P1 |
| PJ_FIRE_ARROW | 24×8 | 3 | có | mũi tên tẩm lửa, ngọn lửa ở đầu lay động | P1 |
| PJ_ARROW_RAIN | 8×24 | 1 | — | mũi tên cắm dọc từ trên thành xuống (boss stage) | P1 |
| PJ_THROWING_KNIFE | 16×8 | 4 | có | dao ném lưỡi thẳng xoay | P2 |

---

## 6. OUTPUT: FOLDER, TÊN FILE, MANIFEST

### 6.1 Cấu trúc thư mục
```
assets/sprites/
  player/PLAYER_TRUNG_TRAC/
  npc/NPC_TRUNG_NHI/  npc/NPC_THI_SACH/  npc/NPC_LE_CHAN/
  portrait/PORTRAIT_*/
  enemy/EN_HAN_BASE/  enemy/EN_HAN_TAXMAN/  enemy/EN_TIGER/ ...
  boss/BOSS_TO_DINH_CHARIOT/  boss/BOSS_TO_DINH_FOOT/
  obstacle/OB_TRIBUTE_CART/  obstacle/TR_SPIKE_PIT/
  prop/PROP_WATCHTOWER/
  projectile/PJ_*/   fx/FX_*/
  manifest_tt.json
  SPRITE_REPORT_TT.md
```

Trong mỗi thư mục asset:
```
<asset_id_lower>_<animation>.png     ← strip ngang 1xN, true alpha (file game dùng)
frames/<animation>_01.png ...         ← frame lẻ
preview/<animation>.gif               ← GIF xem thử
raw/                                  ← ảnh generate gốc, sheet chưa clean
meta/                                 ← metadata do skill xuất
```
Ví dụ: `assets/sprites/player/PLAYER_TRUNG_TRAC/player_trung_trac_attack_01.png`

Tên file: chữ thường, snake_case, không dấu, không đuôi kiểu `_final2_new`.

### 6.2 Manifest `manifest_tt.json`
```json
{
  "chapter": "TRUNG_TRAC",
  "version": "1.0",
  "render_scale": 3,
  "assets": [
    {
      "id": "PLAYER_TRUNG_TRAC",
      "category": "player",
      "priority": "P0",
      "frame_w": 48,
      "frame_h": 48,
      "pivot": "bottom-center",
      "facing": "right",
      "status": "NORMALIZED",
      "animations": [
        {
          "name": "attack_01",
          "file": "player/PLAYER_TRUNG_TRAC/player_trung_trac_attack_01.png",
          "frames": 6,
          "fps": 14,
          "loop": false,
          "hit_frame": 3
        }
      ],
      "qa_notes": ""
    }
  ]
}
```
`hit_frame` = `null` cho animation không gây sát thương. Asset chưa làm vẫn có mục trong manifest với `"status": "TODO"`.

---

## 7. QA TỰ KIỂM TRƯỚC KHI BÁO NORMALIZED

Mỗi animation phải PASS đủ:
1. Đúng số frame và đúng canvas trong mục 5.
2. Nền trong suốt thật, không viền magenta/trắng quanh sprite.
3. Chân cùng baseline, pivot bottom-center; không frame nào chạm/cắt mép canvas (trừ khi mục 5 cho phép).
4. Tỉ lệ đầu/thân và kích cỡ nhân vật không đổi giữa các frame và giữa các animation.
5. Vũ khí giữ độ dài và kiểu dáng ổn định.
6. Không frame trùng lặp, không thiếu frame; hit frame nhìn rõ, có telegraph trước đó.
7. Pixel sắc, không mờ, không anti-alias, palette nằm trong mục 2.2 (sai lệch nhỏ phải ghi chú).
8. Không có FX/projectile dính vào body.
9. Đúng ngôn ngữ hình ảnh phe (mục 2.3) và không vi phạm danh sách cấm (mục 2.4).
10. Tên file, đường dẫn, manifest khớp nhau.

---

## 8. BÁO CÁO `SPRITE_REPORT_TT.md`

Sau mỗi gate, cập nhật:
```
## Gate <n> — <ngày>
| Asset ID | Animation | Status | QA notes |
|---|---|---|---|

Xung đột với skill: ...
NEED_REDRAW: ...
TODO_MISSING: ...
Câu hỏi cần người duyệt: ...
```

---

## 9. NGOÀI PHẠM VI (KHÔNG LÀM TRONG TASK NÀY)
- Tileset, background, parallax, cổng thành Luy Lâu, cột đá, sông nước.
- Vật phẩm thu thập (thẻ tre binh pháp, máu, giáp), icon, UI, HUD.
- FX kỹ năng: mưa tên của Lê Chân, hiệu ứng "bóng ma" Trưng Nhị, hồi máu "Ý chí kiên cường", hiệu ứng choáng.
- Cutscene hoàn chỉnh, cờ chiến thắng cắm trên cổng thành.
- Code gameplay, scene, engine.
