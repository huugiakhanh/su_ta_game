# SỬ TA — CHƯƠNG 2: BÀ TRIỆU
# TASK CARD TỔNG: KẾ HOẠCH CHƯƠNG + NỘI DUNG CHỜ TEAM DUYỆT

TASK_ID: BT-00 • Version 1.0 • 16/10/2026
Nguồn: Excel của team `DATA các nhân vật.xlsx`, sheet "2 Bà Triệu" (ô A1 = bối cảnh + thiết kế, A2:H52 = 50 câu hỏi).
Mẫu tham chiếu: chương Trưng Trắc (`js/levels/trung-trac/`, `docs/archive/SUTA_TT_TASK_NPC_01.md`, `SUTA_TT_TASK_BOSS_01.md`).

> Task card này **chỉ là tài liệu**. Mỗi giai đoạn code ở mục 2 có task card riêng, duyệt trước khi làm.
> Mục 4 (thoại) và 5.3 (kết chương) là **NHÁP do Claude soạn — CHỜ TEAM DUYỆT**. Chưa duyệt thì không đưa vào code.

---

## 0. QUYẾT ĐỊNH ĐÃ CHỐT (16/10/2026)

| # | Quyết định |
|---|---|
| 1 | Người chơi vẫn là **nghĩa sĩ nam/nữ** (`PLAYER_MALE`/`PLAYER_FEMALE`, dùng chung mọi chương). Bà Triệu là **NPC dẫn màn 1** + nhân vật cutscene, giống Trưng Trắc ở chương 1. |
| 2 | Bạch Tượng = **kỹ năng gọi voi** (phím L: voi trắng lao ngang màn hình húc địch). **Không có cơ chế cưỡi.** Excel ghi "thú cưỡi, tăng tốc, miễn nhiễm bẫy nhỏ" → đổi thành kỹ năng. |
| 3 | Thêm vào engine **bục lơ lửng một chiều** (cành cây cho chướng khí, lưng voi rừng đứng được). |
| 4 | Thoại NPC màn 2 (đáp án sai, gợi ý, "vì sao đúng"), cốt truyện, câu kết chương: **Claude soạn nháp, team duyệt**. |
| 5 | Câu **15, 33, 37, 41, 45** tạm loại, chờ team (mục 3.3). Các câu còn lại chép nguyên văn. |
| 6 | Mini-boss màn 1 = **Tham quan thu thuế** (ném hòm bạc). |
| 7 | Kết chương: thắng Lục Dận như Excel **+ 1–2 câu kết cục lịch sử** (mục 5.3). |
| 8 | Thứ tự: **khung chương → màn 1 → màn 2 → màn 3**; mỗi màn: prompt Codex → code bằng asset tạm → thay asset thật. |
| 9 | Đồ hoạ theo chuẩn **32-bit hi-bit** hiện hành (Excel ghi "8-bit" là thiết kế cũ). |

## 1. THÔNG SỐ CHƯƠNG

| Mục | Giá trị |
|---|---|
| Thư mục code | `frontend/static/js/levels/ba-trieu/` |
| Id chương / key tiến trình | `2` / `bt` (khoá `suta.bt.progress`) |
| Level id | `201`, `202`, `203` (`CHECK id = chapter_id*100 + level_no`) |
| URL | `/gameplay/levels/ba-trieu`, `…/ba-trieu/2`, `…/ba-trieu/3` |
| Template | `templates/gameplay/levels/ba-trieu.html` kế thừa `gameplay/base.html` |
| Asset | `assets/images/ba-trieu/sprites-32bit/manifest_bt.json`, `maps-32bit/maps_bt.json` |
| Câu hỏi | `assets/question/ba-trieu-question.json` (đã có, **khớp Excel 50/50 câu**, đối chiếu 16/10) → sinh `questions-data.js` bằng script |
| Thư viện | `library_heroes.json` đã có mục `ba-trieu` — không đụng |
| Trang chủ | thẻ Bà Triệu đang "🔒 Sắp ra mắt" (`components/home/chapter.html`) → mở ở BT-SKELETON |

## 2. LỘ TRÌNH

| Mã | Nội dung | Phụ thuộc |
|---|---|---|
| **BT-00** | Task card này + team duyệt nội dung mục 4–5 | — |
| **BT-ART-BIBLE** | Phụ lục art bible năm 248 trong `SUTA_TT_ART_BRIEF_32.md` (trang phục Đông Ngô, người Cửu Chân, núi Nưa, Bồ Điền), tra cứu có nguồn bằng `/research` | — |
| **BT-ENGINE A** | Route gameplay chung, `/quiz` chọn chương, sát thương nhiều máu, chí mạng — [SUTA_BT_TASK_ENGINE_01.md](SUTA_BT_TASK_ENGINE_01.md) | — |
| **BT-SKELETON** | [SUTA_BT_TASK_SKELETON_01.md](SUTA_BT_TASK_SKELETON_01.md) — thư mục chương, `chapter.js`/`config.js`, template, route, migration `005` (chương 2, level 201–203, phần thưởng), `VALID_*`, mở thẻ trang chủ, rule `.claude/rules/ba-trieu-gameplay.md`. Chạy được bằng asset chương 1 | BT-ENGINE A |
| **BT-ENGINE B** | Bục một chiều, bục gắn hazard (lưng voi), hazard `vent` (chướng khí); roller phá được đã có sẵn | BT-SKELETON |
| **BT-L1** + `BT_ART_01` | Màn 1 (mục 3.1) | SKELETON, ENGINE |
| **BT-L2** + `BT_ART_02` | Màn 2 (mục 3.2) | L1, BT-00 duyệt |
| **BT-L3** + `BT_ART_03` | Màn 3 boss Lục Dận (mục 3.4) | L2 |

Mỗi giai đoạn: kế hoạch → duyệt → code → `pytest tests` + `/verify-ui` → `/task-report`. Thay đổi engine phải chơi lại 3 màn Trưng Trắc + `?layout=p2`, `?layout=skills`, `?viewer=1`.

---

## 3. THIẾT KẾ MÀN (DESIGN_BASELINE — số cụ thể chốt ở task card từng màn)

### 3.1 Màn 1 — "Rừng núi Nưa" (cấu trúc như màn 1 chương 1)
- 12 chướng ngại kể cả mini-boss, xáo mỗi lượt; 5 **Quyển Sách Tinh Hoa** (vật phẩm thu thập); 4 câu hỏi chặn đường; Bà Triệu dẫn đầu màn.
- Vùng cảnh đề xuất: làng Quan Yên → rừng → sườn núi đá → rừng thiêng chướng khí → doanh trại núi Nưa (đích).

| Excel | Cơ chế engine | Ghi chú |
|---|---|---|
| Lính đốn gỗ Đông Ngô | lính canh (`GUARD` ghi đè) | vung búa chậm, sát thương 2 |
| Thợ săn quan lại | `thrower`, đạn tên bay ngang | nấp trong bụi |
| Đá tảng lăn | `roller` **phá được** (mới) | nhảy qua hoặc chém vỡ |
| Voi rừng chưa thuần | `roller` chậm + **bục di chuyển trên lưng** (mới) | không giết được, nhảy lên lưng để qua |
| Hố chông tre | `trap` / vật cản `harmful` | căn nhịp nhảy |
| Lính kỵ binh Đông Ngô | `roller` | như kỵ binh chương 1, sprite mới |
| Chướng khí rừng thiêng | **vùng hazard theo nhịp** + **cành cây bục** (mới) | báo hiệu → phun → tắt |
| Tham quan thu thuế | **mini-boss** `patrol` ném hòm bạc | cố định cuối màn, như kiệu quan |

### 3.2 Màn 2 — "Chiêu mộ hiền tài"
- Cấu trúc như màn 2 chương 1: đặt cố định, có quân Ngô/bẫy/hố/bậc đất, địa hình chuyển dần sang đầm lầy Bồ Điền.
- Thứ tự NPC: **Triệu Quốc Đạt → ba anh em họ Lý → Bạch Tượng**. Mỗi NPC bị 2 địch vây (giải cứu), trước mỗi NPC 1 câu hỏi chặn đường. Bạch Tượng bị **thợ săn quan lại** vây thay vì lính.
- Cốt truyện giữa màn: Triệu Quốc Đạt qua đời, nghĩa quân tôn Bà Triệu làm chủ tướng (câu 13 trong Excel) — nháp mục 4.4.

### 3.3 Câu hỏi

**Tạm loại, chờ team quyết** (không đưa vào game, không sửa chữ):

| Câu | Lý do |
|---|---|
| 15 | Ngoại hình "vú dài 3 thước" — cân nhắc độ tuổi người chơi |
| 33 | Giai thoại quân giặc khoả thân — cân nhắc độ tuổi người chơi |
| 37 | Đáp án D có lỗi gõ "xuất xuất ngoại" |
| 41 | Phố Bà Triệu "giao với đường nào" — nhiều phố cắt ngang, đáp án dễ gây tranh cãi; không phải kiến thức lịch sử |
| 45 | "Dưới góc độ game thiết kế" — không phải kiến thức lịch sử |

**Chia pool** (theo số thứ tự Excel; đề xuất, team sửa được):

| Pool | Câu |
|---|---|
| `NPC_QUESTION_POOLS.quocDat` (anh trai, chí khí) | 5, 6, 13, 27, 29, 50 |
| `NPC_QUESTION_POOLS.hoLy` (Bồ Điền, chiến thuật) | 16, 17, 44, 49 |
| `NPC_QUESTION_POOLS.bachTuong` (voi) | 7, 23, 36 |
| `LEVEL1_QUESTION_POOL` (còn lại, rút 4 câu/lượt) | 1, 2, 3, 4, 8, 9, 10, 11, 12, 14, 18, 19, 20, 21, 22, 24, 25, 26, 28, 30, 31, 32, 34, 35, 38, 39, 40, 42, 43, 46, 47, 48 |

Trang `/quiz`: thêm chọn chương để nạp `ba-trieu-question.json` (BT-ENGINE). Bộ quiz có loại 5 câu trên không → **chờ team** (mặc định: loại giống trong game).

### 3.4 Màn 3 — "Chiến lũy Bồ Điền" — boss Lục Dận
- Đấu trường 1 chunk: một bên đầm lầy, một bên núi đá; rung màn hình khi voi dậm. Lục Dận đứng trên **đài cao**, không với tới.
- **GĐ 1:** mưa tên độc (có vạch báo) + phá **3 tháp canh chứa vàng**; tháp ném tiền vàng "mua chuộc" (chạm thì choáng ngắn).
- **GĐ 2:** kỵ binh thiết giáp — đòn thường bị giáp chặn, chỉ kỹ năng **Gọi Bạch Tượng** ("Giáp vàng húc tới") hất văng/phá giáp.
- **GĐ 3:** đài sụp, Lục Dận rơi xuống đầm lầy, không tấn công, bị dồn bằng chuỗi đòn (chí mạng) → bỏ chạy về phương Bắc → cutscene + panel kết chương.
- Phần thưởng màn 2 thành kỹ năng (chỉ tác dụng màn 3):

| Id đề xuất | Tên | Loại | Từ NPC |
|---|---|---|---|
| `BUFF_BT_CRIT` | Chí mạng | bị động — đòn chém có tỉ lệ gây gấp đôi sát thương | Triệu Quốc Đạt |
| `SK_BT_RATTAN_SHIELD` | Khiên mây tre | phím K — chặn đạn/đòn trong một lúc, có hồi chiêu | Anh em họ Lý |
| `SK_BT_WHITE_ELEPHANT` | Gọi Bạch Tượng | phím L — voi trắng lao ngang húc địch, có hồi chiêu | Bạch Tượng |

---

## 4. NỘI DUNG MÀN 2 — NHÁP, CHỜ TEAM DUYỆT

Quy ước: ✅ đáp án đúng; câu **in nghiêng** lấy nguyên văn Excel. Thoại xưng hô với Bà Triệu (như chương 1 xưng hô với Trưng Trắc).

### 4.1 Triệu Quốc Đạt — Anh trai, Hào trưởng vùng Quan Yên

**Thoại**
1. Triệu Quốc Đạt: "Trinh, anh nghe em định vào núi Nưa tụ nghĩa quân."
2. Triệu Quốc Đạt: *"Em là phận gái, sao không lo việc bề gia thất, dệt vải thêu thùa mà lại muốn dấy binh đánh giặc, chuốc lấy hiểm nguy?"*

**Câu hỏi:** Bà Triệu đáp lời anh trai thế nào?
- ✅ *"Tôi chỉ muốn cưỡi cơn gió mạnh, đạp luồng sóng dữ, chém cá kình ở biển Đông, quét sạch bờ cõi, để cứu dân ra khỏi nơi đắm đuối, chứ không thèm bắt chước người đời cúi đầu cong lưng để làm tì thiếp người ta."*
- ❌ "Anh nói phải. Em sẽ ở nhà lo việc canh cửi, chờ thời thế đổi thay."
- ❌ "Em vào rừng chỉ để săn bắn cho thoả chí, không màng việc nước."

**Gợi ý khi sai:** Nghĩ xem điều gì lớn hơn an nguy của riêng mình.

**Vì sao đúng:** *Lời khẳng định khí tiết hào hùng này đã thuyết phục hoàn toàn anh trai cùng hội quân khởi nghĩa.*

**Phần thưởng:** Chí mạng. Trong trận đánh, đòn chém đôi khi gây gấp đôi sát thương.

### 4.2 Ba anh em họ Lý (Lý Hoằng, Lý Cường, Lý Lực) — Tướng tài vùng Bồ Điền

**Thoại**
1. Lý Hoằng: "Nghe tin nàng dấy binh, anh em chúng tôi từ Bồ Điền tìm đến."
2. Lý Hoằng: *"Núi Nưa hiểm trở nhưng lương thảo khó bề bám trụ lâu dài. Nếu quân Đông Ngô kéo đại binh tới vây ráp, chủ tướng sẽ lui về đâu?"*

**Câu hỏi:** Khi đại binh Đông Ngô kéo tới, nghĩa quân nên dựa vào đâu?
- ✅ *Tiến về căn cứ Bồ Điền. Nơi đây đất trũng, sình lầy hiểm trở, thuận lợi lập chiến lũy phòng thủ vững chắc và chặn đường tiến quân của giặc.*
- ❌ Kéo cả quân ra đồng bằng trống trải, dàn trận đánh lớn với giặc.
- ❌ Giải tán nghĩa quân, đợi giặc rút rồi tụ lại.

**Gợi ý khi sai:** Hãy tìm nơi địa thế giúp ta lấy ít địch nhiều.

**Vì sao đúng:** *Tầm nhìn chiến lược, biết dựa vào địa hình Bồ Điền đã thuyết phục 3 anh em họ Lý đầu quân.*

**Phần thưởng:** Khiên mây tre. Trong trận đánh, bấm K để giơ khiên chặn tên và đòn đánh trong chốc lát.

### 4.3 Bạch Tượng — Voi trắng một ngà

**Thoại**
1. (Tiếng voi rống vang khắp núi rừng.)
2. Bạch Tượng: *"Ta là chúa tể núi rừng, chỉ khuất phục trước người có uy đức và sức mạnh cái thế. Ngươi làm sao để ta cúi đầu?"*

**Câu hỏi:** Làm sao để Bạch Tượng cúi đầu?
- ✅ *Không dùng đao kiếm. Dùng sức mạnh nhảy lên lưng, vuốt ve và gióng hồi chiêng lệnh vang vọng núi rừng để hòa nhịp ý chí.*
- ❌ Dùng giáo mác vây bắt, đánh cho voi kiệt sức rồi xích lại.
- ❌ Đào hố sâu bẫy voi, bỏ đói nhiều ngày cho thuần.

**Gợi ý khi sai:** Muôn loài phục người có uy đức, không phục kẻ tàn bạo.

**Vì sao đúng:** *Bà Triệu thu phục voi bằng sự oai linh và tiếng cồng chiêng vang dội.*

**Phần thưởng:** Gọi Bạch Tượng. Trong trận đánh, bấm L để voi trắng lao tới húc văng quân địch.

### 4.4 Cốt truyện — Triệu Quốc Đạt qua đời (khi vào chunk sau NPC Triệu Quốc Đạt)
1. "Tin buồn truyền về: Triệu Quốc Đạt đã qua đời."
2. "Nghĩa quân tôn Bà Triệu lên làm chủ tướng, tiếp tục cuộc khởi nghĩa."

> Cần team xác nhận: thứ tự sự kiện (Quốc Đạt mất trước khi gặp anh em họ Lý?) và cách nói về cái chết của ông.

---

## 5. CÂU CHỮ KHÁC — NHÁP, CHỜ TEAM DUYỆT

### 5.1 Thông báo đầu màn
- Màn 1: "Màn 1: Rừng núi Nưa — Năm 248, quan lại Đông Ngô cướp bóc dân lành. Hãy theo Triệu Thị Trinh vào núi Nưa, thu đủ 5 Quyển Sách Tinh Hoa."
- Màn 2: "Màn 2: Chiêu mộ hiền tài"
- Màn 3: "Màn 3: Chiến lũy Bồ Điền"

### 5.2 Cutscene màn 3
1. "Đài cao sụp đổ, Lục Dận rơi xuống đầm lầy."
2. "Bà Triệu mặc giáp vàng, cưỡi voi trắng dẫn quân xông lên. Lục Dận bỏ chạy về phương Bắc."

### 5.3 Panel kết chương
- Tiêu đề: "Hoàn thành chương Bà Triệu"
- Dòng 1: `Bạn đã cùng Bà Triệu đẩy lui quân Đông Ngô và đạt ${score} điểm.`
- Dòng 2 (kết cục lịch sử, lấy từ giải thích câu 18, 19, 34 trong Excel): "Theo sử cũ, cuộc khởi nghĩa kéo dài khoảng 5–6 tháng. Trước thế giặc mạnh, Bà Triệu tuẫn tiết ở núi Tùng (Hậu Lộc, Thanh Hóa) khi mới 23 tuổi. Nhân dân lập đền thờ bà đến ngày nay."

---

## 6. ASSET (đề xuất ID — chốt trong prompt Codex từng đợt, không tạo ID gần giống ID đã có)

| Đợt | Nội dung |
|---|---|
| `BT_ART_01` | `NPC_BA_TRIEU` (dẫn màn) + `PORTRAIT_BA_TRIEU` (tận dụng `docs/CODEX_PROMPT_SAMPLE_BT_DBL.md`), 8 địch/vật cản mục 3.1 + đạn (tên nỏ, hòm bạc), cành cây bục, Quyển Sách Tinh Hoa, bia câu hỏi, nền + tile núi Nưa, điểm đích doanh trại |
| `BT_ART_02` | NPC + chân dung Triệu Quốc Đạt, ba anh em họ Lý, Bạch Tượng; voi trắng kỹ năng; icon 3 kỹ năng; nền + tile đầm lầy Bồ Điền |
| `BT_ART_03` | Lục Dận (trên đài, rơi, chạy) + chân dung, tháp vàng, kỵ binh thiết giáp, tên độc, tiền vàng, nền chiến lũy, cờ chiến thắng |

Nhạc nền 3 màn: tạm dùng nhạc chương 1 → `TODO_MISSING` nhạc riêng.

## 7. VIỆC CHỜ TEAM

- [ ] Duyệt nháp mục 4 và 5 (đáp án sai, gợi ý, cốt truyện, kết chương).
- [ ] Quyết 5 câu tạm loại (mục 3.3), và bộ `/quiz` có loại theo không.
- [ ] Duyệt chia pool câu hỏi (mục 3.3).
- [ ] Số vàng/kim cương thưởng và thành tựu chương 2 (`BT_*`) — xem `docs/archive/REPORT_SUTA-DB-01.md`.
- [ ] Nhạc nền riêng chương.

## 8. GATE BT-00
1. Team duyệt mục 4–5 (ghi "ĐÃ DUYỆT <ngày>" vào đầu từng mục, sửa trực tiếp nếu cần).
2. Sau khi duyệt, nội dung mục 4–5 thành **Source of Truth**, chép nguyên văn vào `dialogue-data.js` ở BT-L2/BT-L3.
