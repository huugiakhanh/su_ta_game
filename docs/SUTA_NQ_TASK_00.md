# SỬ TA — CHƯƠNG 7: NGÔ QUYỀN (BẠCH ĐẰNG 938)
# TASK CARD TỔNG: KẾ HOẠCH CHƯƠNG + NỘI DUNG ĐÃ DUYỆT

TASK_ID: NQ-00 • Version 1.0 • 11/11/2026
Nguồn: Excel của team `DATA các nhân vật.xlsx`, sheet "7 Ngô Quyền" (ô A1 = bối cảnh + thiết kế; 50 câu tham khảo). Tra cứu: [RESEARCH_NQ_QUESTIONS.md](RESEARCH_NQ_QUESTIONS.md).
Mẫu tham chiếu: chương Phùng Hưng ([SUTA_PH_TASK_00.md](SUTA_PH_TASK_00.md), `js/levels/phung-hung/`).

> Task card này **chỉ là tài liệu**. Mỗi giai đoạn code ở mục 2 có task card riêng, duyệt trước khi làm.
> **ĐÃ DUYỆT toàn bộ 11/11/2026** (người dùng): mục 0, 3.3, 3.4, 4, 5, 8 và đối chiếu 50 câu. Duyệt xong, mục 4–5 + bộ câu hỏi là Source of Truth, chép nguyên văn vào `dialogue-data.js` / `config.js` (rule `history-content.md`).

---

## 0. QUYẾT ĐỊNH

### Đã chốt (11/11/2026, người dùng)

| # | Quyết định |
|---|---|
| 1 | Người chơi là **nghĩa sĩ nam/nữ** (`PLAYER_MALE`/`PLAYER_FEMALE`). Ngô Quyền là NPC dẫn màn 1 + nhân vật cutscene màn 3 |
| 2 | Slug `ngo-quyen`, khớp mục thư viện và avatar `ngo_quyen.png` đã có |
| 3 | Câu hỏi: tra nguồn từng câu, giữ câu đúng, chỉ sửa/thay câu sai hoặc không có nguồn, đủ 50 câu |
| 4 | Engine thêm **thuyền lái được + thủy triều + gió ngược + xoáy nước**. Không làm bơi: rơi xuống nước vẫn về chỗ đứng vững |
| 5 | Thêm ngoài A1: **đẽo và cắm cọc** (màn 2), **ném lao**, **mini-boss Kiều Công Tiễn** cuối màn 1 |
| 6 | Chướng ngại **chia theo sử**: màn 1 chỉ quân Kiều Công Tiễn + thiên nhiên; quân Nam Hán từ màn 2 |
| 7 | Boss không "bắn pháo" (thế kỷ 10 chưa có): **máy bắn đá + nỏ lửa** |
| 8 | Số cọc cắm ở màn 2 là **phần thưởng thêm**: tối thiểu 3/6 mới về đích; cắm nhiều thì lâu thuyền mất giáp nhiều hơn ở GĐ 2 màn 3; vào màn 3 bằng URL thì tính mức tối thiểu |
| 9 | Đồ hoạ 32-bit hi-bit (Excel ghi "8-bit" là thiết kế cũ). Không import file của chương khác; sprite dùng lại thì chép cùng ID |

### Đã chốt 11/11/2026 (phát hiện khi tra cứu, RESEARCH mục 2)

| # | Vấn đề | Đề xuất của Claude |
|---|---|---|
| Q1 | **Dương Đình Nghệ mất tháng 3/937**, trước khi Ngô Quyền ra Bắc. Màn 2 diễn ra ở Bạch Đằng 938, sau khi đã diệt Kiều Công Tiễn ở màn 1 | **ĐÃ CHỐT 11/11/2026 (người dùng): phương án (b)** — giữ Dương Đình Nghệ làm NPC 1 màn 2, hiện dưới dạng **hồi tưởng năm 937** (mục 4.1); thoại giữ nguyên A1. Không có nguồn ông từng hỏi Ngô Quyền việc này. (Phương án (a) Dương Tam Kha không chọn) |
| Q2 | **Kiều Công Hãn** không có trong sử năm 938 (lần đầu năm 966, một trong 12 sứ quân); không thấy thần tích về việc hiến kế cọc. Toàn thư để Ngô Quyền tự bàn kế | **ĐÃ CHỐT 11/11/2026 (người dùng):** giữ NPC 2 như A1, dòng chú "Tương truyền" trên khung thoại (như Bồ Phá Cần chương 6). Câu 29 thay (đã duyệt cùng bộ 50 câu) |
| Q3 | **Ngô Xương Ngập** không có trong sử năm 938 (lần đầu năm 945) | **ĐÃ CHỐT 11/11/2026 (người dùng):** giữ NPC 3 như A1, thoại ghi "tương truyền". Kế khiêu chiến giả thua có nguồn (Cương mục) nên đáp án giữ |
| Q4 | Hoằng Tháo chết đuối (Cương mục) hay bị bắt giết (Toàn thư theo Wikipedia) | **ĐÃ CHỐT 11/11/2026 (người dùng):** cutscene viết "bỏ mạng giữa dòng Bạch Đằng", không khẳng định chi tiết |

Thư viện `ngo-quyen` (`library_heroes.json`) không có điểm mâu thuẫn với các đề xuất trên; không đụng.

## 1. THÔNG SỐ CHƯƠNG

| Mục | Giá trị |
|---|---|
| Thư mục code | `frontend/static/js/levels/ngo-quyen/` |
| Id chương / key tiến trình | `7` / `nq` (khoá `suta.nq.progress`) |
| Level id | `701`, `702`, `703` (migration `012_ngo_quyen.sql`) |
| URL | `/gameplay/levels/ngo-quyen`, `…/2`, `…/3` |
| Template | `templates/gameplay/levels/ngo-quyen.html` kế thừa `gameplay/base.html` |
| Asset | `assets/images/ngo-quyen/sprites-32bit/manifest_nq.json`, `maps-32bit/maps_nq.json` |
| Câu hỏi | `assets/question/ngo-quyen-question.json` → `python tools/make_question_data.py ngo-quyen`; thêm vào `QUIZ_BANKS` trong `quiz.js` |
| Thư viện | `library_heroes.json` đã có mục `ngo-quyen`; không đụng |
| Trang chủ | thẻ "Năm 938" trong `timeline.html` (+ thẻ `chapter.html`) đang khoá → `data-unlock-after="6"`, `data-hero="Ngô Quyền"`, `data-route`, câu khoá "Qua chương Phùng Hưng". Mốc năm giữ **938**. Thẻ Khúc Thừa Dụ (905) đứng giữa vẫn "Chờ mở khóa" — chưa có chương |

## 2. LỘ TRÌNH

| Mã | Nội dung | Phụ thuộc |
|---|---|---|
| **NQ-00** | **Xong 11/11**: task card này + RESEARCH, đã duyệt hết | — |
| **NQ-SKELETON** | **Xong 11/11** ([task card](SUTA_NQ_TASK_SKELETON_01.md), [report](REPORT_NQ-SKELETON.md)) Thư mục chương, template, route `pages.py`, migration `012`, `VALID_*` trong `api.py`, `game_service.py` (`CHAPTER_NQ_LEVELS`), thẻ trang chủ, JSON câu hỏi + script, `QUIZ_BANKS`, rule `.claude/rules/ngo-quyen-gameplay.md` (+ bảng rule `CLAUDE.md`), test | NQ-00 |
| **NQ-ENGINE** | E1–E5 (mục 3.5) + `?layout=engine` màn 1 | SKELETON |
| **NQ-L1** + `NQ_ART_01` | Màn 1 | SKELETON, ENGINE |
| **NQ-L2** + `NQ_ART_02` | Màn 2 | L1, mục 4 đã duyệt |
| **NQ-L3** + `NQ_ART_03` | Màn 3 + cutscene | L2 |
| Nhạc | Prompt Gemini `audio/ngo-quyen/level1–3.mp3` | — |

Mỗi giai đoạn: kế hoạch → duyệt → code → `pytest tests` + `/verify-ui` → `/task-report`. Đổi engine thì chơi lại các màn 6 chương trước và các layout thử (`?layout=p2`, `?layout=skills`, `?layout=engine`, `?viewer=1`).

---

## 3. THIẾT KẾ MÀN (DESIGN_BASELINE, số cụ thể chốt ở task card từng màn)

### 3.1 Màn 1 "Hành quân ra Bắc", 12 chunk
Vùng cảnh: bến sông Ái Châu (1–3) → đường ra Bắc, sông núi (4–8) → ngoài thành Đại La (9–12). Ngô Quyền dẫn đầu màn. 5 Quyển Sách Tinh Hoa, 4 bia câu hỏi.

| Chướng ngại | Cơ chế | Mới/có |
|---|---|---|
| Tập lái thuyền ở bến Ái Châu | Lên thuyền nhỏ, chạy trên khe sông, nhảy qua mỏm đá; dạy phím | E1 |
| Xoáy nước (thay "sóng ngầm Bạch Đằng" của A1) | Kéo thuyền về tâm; lọt vào −1 máu, về chỗ đứng vững | E4 |
| Cá sấu | Ngụp dưới sông, há miệng ngoi lên | `lurker` có, `EN_CROCODILE` chép |
| Gió bão ngược chiều | Đẩy lùi theo nhịp; nấp sau tảng đá chắn gió | E3 |
| Lính giáo dài Kiều Công Tiễn | Chốt chặn trên bộ, `guard` + cọc chắn | có |
| Cung thủ trên tường thành Đại La | Thrower `aim` | có |
| **Mini-boss Kiều Công Tiễn** (chunk 12, trước cổng Đại La) | Enemy `boss` có `behavior` (mẫu đội trưởng TQP-L1); 2 lính hộ vệ; giữ sách thứ 5 | có |
| Ném lao | Lính hạ rơi bó lao (`hooks.dropCarry`), ném vòng cung (`CHAPTER.carry`) | có (`carry.js`) |

### 3.2 Màn 2 "Trận địa cọc ngầm", 10 chunk cố định
Vùng cảnh: rừng ven sông Bạch Đằng (1–3, lấy gỗ cọc) → bãi cửa sông (4–7, 6 mốc cắm cọc theo triều) → bến thuyền ta (8–10). Rải 10 sách. 3 NPC khoá 3 / 6 / 10 sách; mỗi NPC 2 lính vây + 1 bia.

| Chướng ngại | Cơ chế | Mới/có |
|---|---|---|
| Vác cọc, cắm cọc | Nhặt cọc ở xưởng đẽo, vác (đi chậm, khoá lướt), nước ròng thì bấm Đánh ở mốc; tối thiểu 3/6 mới về đích | E5 + gánh nặng có |
| Thủy triều | Đồng hồ triều HUD; nước lớn: khe sông rộng, mốc ngập (không cắm được); nước ròng: bãi lộ, cắm được | E2 |
| Thuyền do thám Nam Hán | Lính thủy trên bè quăng lưới: trúng thì choáng | `snare`/`stunPlayer` có |
| Thuyền hỏa công | Trôi tự do trên sông, nhảy tránh | `drift`/`roller` có |
| Cọc ngầm (của ta) | Thuyền va lúc nước ròng −1 máu; nước lớn đi qua an toàn | E2 |
| Cá sấu, gió ngược | Như màn 1, ít hơn | có |

### 3.3 Câu hỏi: chia pool (ĐÃ DUYỆT 11/11/2026, số theo STT)

| Pool | Câu |
|---|---|
| `NPC_QUESTION_POOLS.duongDinhNghe` (trừ nội phản) | 3, 6, 7, 10, 49 |
| `NPC_QUESTION_POOLS.kieuCongHan` (kế cọc, thủy triều) | 11, 12, 21, 29, 31 |
| `NPC_QUESTION_POOLS.ngoXuongNgap` (dụ địch, kết cục) | 13, 14, 28, 34, 46 |
| `LEVEL1_QUESTION_POOL` (rút 4 câu/lượt) | 35 câu còn lại |

### 3.4 Màn 3 "Đại thắng Bạch Đằng", đấu trường
Cửa sông Bạch Đằng, boss Lưu Hoằng Tháo trên lâu thuyền (giáp kiên cố, không chém tới). Ô boss HUD qua `hooks.updateHud`.
- **GĐ 1 (nước lớn):** người chơi lái thuyền nhỏ (E1), né đá máy bắn đá (vòng cung, vạch báo chỗ rơi — `lob`) và loạt tên nỏ lửa (`PJ_FIRE_ARROW`); nhặt lao trên bè, ném lên lâu thuyền → thanh **Nhử địch** tăng; đầy thì camera kéo sang phải, lâu thuyền tiến vào bãi cọc.
- **GĐ 2 (nước rút):** E2 ép triều hạ, mực nước tụt, cọc nhô lên; lâu thuyền mắc cọc, nghiêng. Số mảng giáp vỡ = số cọc đã cắm ở màn 2 (3–6); phần giáp còn lại phải ném lao phá.
- **GĐ 3 (xáp lá cà):** nhảy lên boong (bục `ride`), Hoằng Tháo rút gươm. Lướt né đúng lúc đòn chém → mở **phản đòn** (cửa sổ ngắn sát thương ×2). Hết máu → đòn kết liễu → cutscene (5.2) → panel kết chương (5.3).
- Chưa có kỹ năng (vào bằng `?layout`) vẫn qua được.

Phần thưởng màn 2 (chỉ tác dụng màn 3; tên theo A1; ĐÃ DUYỆT 11/11/2026, số là DESIGN_BASELINE):

| Id đề xuất | Tên | Loại | Từ NPC |
|---|---|---|---|
| `BUFF_NQ_SWIFT` | Thần Tốc Hành Quân (A1: "gia tăng tốc độ hành quân") | bị động: chạy nhanh hơn ×1,2 (cả khi lái thuyền) | NPC 1 |
| `SK_NQ_IRON_STAKE` | Cọc Sắt Bạch Đằng | K: dựng bẫy cọc dưới chân địch gần nhất, lính dẫm −2 máu + khựng; GĐ 2 phá 1 mảng giáp; hồi 14 s | Kiều Công Hãn |
| `SK_NQ_DECOY_BOAT` | Thuyền Nhẹ Khiêu Chiến | L: lướt nhanh về trước + miễn sát thương 3 s; GĐ 1 tăng Nhử địch; hồi 16 s | Ngô Xương Ngập |

### 3.5 NQ-ENGINE: cơ chế mới (dùng chung)

| Mã | Nội dung | Dựa trên |
|---|---|---|
| E1 | **Thuyền lái**: sprite `boardable` ở bến; lên thuyền thì chỉ đi trên cột nước `'~'`, nhảy được, cập bờ hoặc bấm ↑ thì xuống; va hazard `rammable` hoặc bị `damage` thì mất máu (khác cưỡi trâu: không miễn sát thương) | `state.mount` (PH-ENGINE E2), bục `ride` |
| E2 | **Thủy triều**: `LEVEL.tide = { period, high, low }`; `state.tide` (0–1) đổi mực nước vẽ (`render/terrain.js`), độ rộng phần đi được của khe; hazard `tideOnly: 'low'/'high'` chỉ có hiệu lực theo triều (cọc ngầm, mốc cắm cọc); đồng hồ triều HUD; chương ép triều được (màn 3 GĐ 2) | khe sông LND-ENGINE E1, `setTerrain` |
| E3 | **Gió ngược**: vùng `wind` theo nhịp off/warn/active (như `vent`), đẩy `vx` lùi; đứng trong `state.shelters` (sau đá chắn) thì không bị đẩy | `vent`, `state.covers` |
| E4 | **Xoáy nước**: vùng trong khe sông kéo thuyền về tâm; tới tâm thì `respawnAfterFall` (−1 máu, về `p.safeSpot`) | `hole.water` |
| E5 | **Cắm cọc**: `LEVEL.stakes` mốc + nguồn cọc; vác bằng `p.burden`; bấm Đánh ở mốc lúc nước ròng → `state.stakes`; `progress.js` lưu số cọc (như `rescued` chương 5) | `LEVEL.burden`, `releaseBurden`, `progress.js` |

Layout thử `?layout=engine` màn 1 chương 7 chạy đủ E1–E5.

---

## 4. NỘI DUNG MÀN 2 — ĐÃ DUYỆT 11/11/2026 (người dùng duyệt nguyên văn, kèm 2 dòng chú "Tương truyền")

Quy ước: ✅ đáp án đúng. Câu **in nghiêng** lấy nguyên văn Excel ô A1; còn lại Claude soạn nháp. Thoại nói với Ngô Quyền.

### 4.1 Dương Đình Nghệ (hồi tưởng năm 937 — Q1 phương án b)

Cách hiện trong game (DESIGN_BASELINE, chốt ở NQ-L2): NPC vẽ mờ, dòng chú "Hồi tưởng năm 937" trên đầu khung thoại. Không có nguồn ghi ông từng hỏi Ngô Quyền việc này.

**Thoại**
1. (Hồi tưởng năm 937) Dương Đình Nghệ: "Quyền, ta có việc hệ trọng muốn hỏi."
2. Dương Đình Nghệ: *"Bọn Nam Hán đang nhòm ngó phương Nam, nhưng nội bộ ta lại có kẻ gian thần Kiều Công Tiễn manh tâm phản nghịch. Ngươi tính bề nào?"*

**Câu hỏi:** Ngô Quyền trả lời thế nào?
- ✅ *Việc nhà phải yên thì việc nước mới thành. Trước hết xuất quân diệt trừ Kiều Công Tiễn để trừ họa đâm sau lưng, cắt đứt sự tiếp ứng của giặc.*
- ❌ "Cứ để Tiễn yên, dồn sức đánh Nam Hán trước."
- ❌ "Nhường đất cho Tiễn để tránh đổ máu."

**Gợi ý khi sai:** Kẻ đánh sau lưng nguy hiểm hơn kẻ đứng trước mặt.

**Vì sao đúng:** *Ngô Quyền đã quyết đoán tiêu diệt Kiều Công Tiễn trước khi quân Nam Hán kịp sang viện trợ, làm phá sản kế hoạch phối hợp trong ngoài của địch.*

**Phần thưởng:** Thần Tốc Hành Quân. Trong trận đánh, chạy nhanh hơn.

### 4.2 Kiều Công Hãn (tương truyền — Q2)

Dòng chú "Tương truyền" trên đầu khung thoại (cách hiện như dòng "Hồi tưởng năm 937" ở 4.1).

**Thoại**
1. Kiều Công Hãn: "Ta là cháu Kiều Công Tiễn, nhưng lòng ta theo nước."
2. Kiều Công Hãn: *"Hoằng Tháo dẫn chiến thuyền khổng lồ tiến vào cửa biển. Thuyền ta thì nhỏ mỏng, sức quân ta có hạn, đánh giáp lá cà ắt chịu thiệt. Ta nên dùng mưu gì?"*

**Câu hỏi:** Ngô Quyền chọn kế nào?
- ✅ *Lợi dụng thủy triều. Chặt gỗ đẽo nhọn bịt sắt cắm xuống lòng sông. Nhử địch vào sâu lúc nước lên, đợi nước rút thì dốc toàn lực phản công để thuyền địch mắc cạn và vỡ nát.*
- ❌ "Đem hết thuyền nhỏ ra biển đánh thẳng vào đội chiến thuyền."
- ❌ "Bỏ cửa biển, rút quân lên rừng cố thủ."

**Gợi ý khi sai:** Nước sông lên xuống mỗi ngày. Dùng điều đó thế nào?

**Vì sao đúng:** *Đây là kế sách cắm cọc trên sông Bạch Đằng vĩ đại nhất lịch sử quân sự Việt Nam.*

**Phần thưởng:** Cọc Sắt Bạch Đằng. Trong trận đánh, bấm K để dựng bẫy cọc dưới chân giặc.

### 4.3 Ngô Xương Ngập (tương truyền — Q3)

Dòng chú "Tương truyền" trên đầu khung thoại (như 4.2).

**Thoại**
1. Ngô Xương Ngập: "Thưa cha, bãi cọc đã cắm xong."
2. Ngô Xương Ngập: *"Kế cắm cọc đã xong, nhưng Hoằng Tháo là kẻ đa nghi, làm sao để dụ thủy quân của hắn tiến sâu vào bãi cọc lúc nước chưa rút?"*

**Câu hỏi:** Ngô Quyền dặn con thế nào?
- ✅ *Dùng thuyền nhẹ ra khiêu chiến, đánh thua bỏ chạy. Phải diễn cho khéo để giặc cậy thế lớn mà kiêu ngạo đuổi theo, lọt vào ổ phục kích.*
- ❌ "Đốt lửa trên bãi cọc cho giặc thấy mà tránh."
- ❌ "Đợi nước rút hẳn rồi mới ra đánh."

**Gợi ý khi sai:** Giặc kiêu vì thấy thuyền ta nhỏ. Làm sao cho chúng đuổi theo?

**Vì sao đúng:** *Sự kết hợp hoàn hảo giữa mưu kế tâm lý và yếu tố tự nhiên (thủy triều).*

**Phần thưởng:** Thuyền Nhẹ Khiêu Chiến. Trong trận đánh, bấm L để lướt nhanh và né mọi đòn trong 3 giây.

---

## 5. CÂU CHỮ KHÁC — ĐÃ DUYỆT 11/11/2026 (người dùng duyệt nguyên văn, kèm sửa mốc 937 ở thông báo màn 1)

### 5.1 Tên màn + thông báo + thoại dẫn
- Màn 1: "Màn 1: Hành quân ra Bắc — Năm 937, Kiều Công Tiễn giết Dương Đình Nghệ rồi cầu cứu nhà Nam Hán. Năm 938, hãy cùng Ngô Quyền từ Ái Châu ra Bắc, thu đủ 5 Quyển Sách Tinh Hoa."
- Màn 2: "Màn 2: Trận địa cọc ngầm"
- Màn 3: "Màn 3: Đại thắng Bạch Đằng"
- Ngô Quyền dẫn màn 1: "Ta là Ngô Quyền, người Đường Lâm, trấn giữ Ái Châu. Kiều Công Tiễn đã giết chủ tướng Dương Đình Nghệ, lại rước giặc Nam Hán vào nhà." / "Đường ra Bắc nhiều sông nước. Lên thuyền nhỏ ở bến, giữ vững tay chèo!"
- Kiều Công Tiễn (mini-boss, gặp): "Ngô Quyền! Quân Nam Hán sắp tới, ngươi chẳng làm gì được ta!"

### 5.2 Cutscene màn 3
1. "Nước triều rút, lâu thuyền Nam Hán mắc cọc vỡ nát. Lưu Hoằng Tháo bỏ mạng giữa dòng Bạch Đằng."
2. "Vua Nam Hán đóng quân ở Hải Môn nghe tin, thương khóc thu quân về nước."

### 5.3 Panel kết chương
- Tiêu đề: "Hoàn thành chương Ngô Quyền"
- Dòng 1: `Bạn đã cùng Ngô Quyền làm nên chiến thắng Bạch Đằng năm 938 và đạt ${score} điểm.`
- Dòng 2: "Mùa xuân năm 939, Ngô Quyền xưng vương, đóng đô ở Cổ Loa, chấm dứt hơn một nghìn năm Bắc thuộc."

## 6. ASSET (chốt ID bằng `/codex-prompt` từng đợt, không tạo ID gần giống ID đã có)

**Chép cùng ID, không vẽ mới:** `EN_CROCODILE` (chương 4), `PJ_FIRE_ARROW`, `OB_BOULDER`, `PROP_LUONG_CATAPULT` (chương 3, máy bắn đá — kiểm còn hợp bối cảnh không), `PJ_SPEAR` (chương 1/5, lao ném), `OB_TQP_DUGOUT_CANOE` (chương 4, có thể làm thuyền nhỏ nếu đủ animation — nếu không thì vẽ mới), `ITEM_LND_HEAL`, `FX_BT_STUN`, `FX_BT_ARMOR_SPARK`. Map mượn: trời, tile, sách, bia câu hỏi, nước sông `PROP_LND_RIVER_WATER`.

| Đợt | Nội dung |
|---|---|
| `NQ_ART_01` | Ngô Quyền NPC + chân dung (theo avatar `ngo_quyen.png`); thuyền nhỏ người chơi lái + animation `boat` cho `PLAYER_MALE`/`PLAYER_FEMALE` (`manifest_shared.json`); lính giáo dài Kiều Công Tiễn; cung thủ thành; mini-boss Kiều Công Tiễn + chân dung; xoáy nước; tảng đá chắn gió + FX gió; bó lao; nền bến Ái Châu, sông núi, ngoài thành Đại La |
| `NQ_ART_02` | 3 NPC màn 2 + chân dung; lính thủy Nam Hán trên bè + lưới; thuyền hỏa công; cọc gỗ (vác, cắm, ngầm/nhô); mốc cắm cọc; đồng hồ triều HUD; nền rừng ven sông + bãi cửa sông Bạch Đằng; FX + icon 3 phần thưởng |
| `NQ_ART_03` | `BOSS_LUU_HOANG_THAO` (đứng lâu thuyền + đấu kiếm trên boong) + chân dung; lâu thuyền (nguyên, mắc cọc, nghiêng, mảng giáp vỡ); máy bắn đá trên thuyền; nền cửa sông lúc triều rút; FX nước rút, gỗ vỡ |

## 7. VIỆC CHỜ DUYỆT (xong hết 11/11/2026)

- [x] Chốt Q1 = (b) giữ Dương Đình Nghệ, hồi tưởng 937 — 11/11/2026 (người dùng).
- [x] Chốt Q2, Q3 = giữ Kiều Công Hãn, Ngô Xương Ngập, thoại ghi "tương truyền" — 11/11/2026 (người dùng).
- [x] Chốt Q4 = "bỏ mạng giữa dòng Bạch Đằng" — 11/11/2026 (người dùng). Mục 0 xong.
- [x] Duyệt đối chiếu 50 câu ([RESEARCH](RESEARCH_NQ_QUESTIONS.md) mục 4–6: giữ 40, sửa 4, thay 6; giữ câu 50 mới) — 11/11/2026 (người dùng).
- [x] Duyệt chia pool 3.3 — 11/11/2026 (người dùng).
- [x] Duyệt mục 4 (thoại NPC), mục 5 (tên màn, thoại dẫn, cutscene, panel) kèm 3 sửa — 11/11/2026 (người dùng).
- [x] Duyệt tên + số của 3 phần thưởng (3.4) — 11/11/2026 (người dùng).
- [x] Duyệt thưởng/thành tựu mục 8 — 11/11/2026 (người dùng).

## 8. THƯỞNG VÀNG / THÀNH TỰU CHƯƠNG 7 — ĐÃ DUYỆT 11/11/2026 (`DESIGN_BASELINE`)

Chương sau thưởng cao hơn chương trước ~20%; cùng khuôn thành tựu; chỉ dùng dữ liệu server đã có.

| Màn | Chương 6 (đối chiếu) | Chương 7 đề xuất |
|---|---|---|
| 1 | 250 vàng | **300 vàng** |
| 2 | 373 vàng | **448 vàng** |
| 3 | 498 vàng + 16 KC | **598 vàng + 19 KC** |
| Tổng | 1121 vàng + 16 KC | **1346 vàng + 19 KC** |

| Code | Tên | Điều kiện | Thưởng |
|---|---|---|---|
| `NQ_CLEAR_1` | Hành quân ra Bắc | Hoàn thành màn 1 chương Ngô Quyền | 149 vàng |
| `NQ_CLEAR_2` | Trận địa cọc ngầm | Hoàn thành màn 2 chương Ngô Quyền | 149 vàng |
| `NQ_CHAPTER` | Bạch Đằng 938 | Hoàn thành chương Ngô Quyền | 24 KC |
| `NQ_SPEED` | Nước triều thần tốc | Tổng thời gian tốt nhất 3 màn dưới 15 phút | 12 KC |

`TT_FLAWLESS` và `TT_SCHOLAR` giữ chung mọi chương; không tạo bản `NQ_` trùng nghĩa. Số cọc cắm (E5) chỉ là lợi thế trong trận, không có thành tựu (server chưa nhận dữ liệu này).

## 9. GATE NQ-00
1. Các mục ở mục 7 đã duyệt hết (11/11/2026): **gate đạt**.
2. Nội dung mục 4–5 + bộ câu hỏi là **Source of Truth**, chép nguyên văn vào dữ liệu chương.
