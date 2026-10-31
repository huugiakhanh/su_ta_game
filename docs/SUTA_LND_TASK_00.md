# SỬ TA — CHƯƠNG 3: LÝ NAM ĐẾ (LÝ BÍ)
# TASK CARD TỔNG: KẾ HOẠCH CHƯƠNG + NỘI DUNG CHỜ TEAM DUYỆT

TASK_ID: LND-00 • Version 1.0 • 30/10/2026
Nguồn: Excel của team `DATA các nhân vật.xlsx`, sheet "3 Lý Bí" (ô A1 = bối cảnh + thiết kế, A2:H52 = 50 câu hỏi).
Mẫu tham chiếu: chương Bà Triệu ([SUTA_BT_TASK_00.md](SUTA_BT_TASK_00.md), `js/levels/ba-trieu/`, rule `ba-trieu-gameplay.md`).

> Task card này **chỉ là tài liệu**. Mỗi giai đoạn code ở mục 2 có task card riêng, duyệt trước khi làm.
> **ĐÃ DUYỆT 31/10/2026** (người dùng, khi lập kế hoạch LND-SKELETON): chia pool 3.3, tên 3 màn 5.1, thưởng/thành tựu mục 9,
> tên buff Tinh Thiều **"Lương thảo dồi dào"**.
> Mục 4 (thoại màn 2) và 5 (câu chữ khác) **ĐÃ DUYỆT 31/10/2026** (người dùng duyệt nguyên văn) — từ nay là
> **Source of Truth**, chép nguyên văn vào `dialogue-data.js` / `config.js`, không tự sửa (rule `history-content.md`).

---

## 0. QUYẾT ĐỊNH ĐÃ CHỐT (30/10/2026)

| # | Quyết định |
|---|---|
| 1 | Người chơi vẫn là **nghĩa sĩ nam/nữ** (`PLAYER_MALE`/`PLAYER_FEMALE`, dùng chung mọi chương). **Lý Bí là NPC dẫn màn 1** + nhân vật cutscene. Excel ghi "người chơi vào vai Lý Bí" → đổi như 2 chương trước. |
| 2 | Slug **`ly-nam-de`**, khớp file câu hỏi `ly-nam-de-question.json` và trang thư viện `/history_library/ly-nam-de` đã có. |
| 3 | Thêm vào engine (dùng chung) 3 cơ chế mới: **thuyền trên sông bắn hoả tiễn**, **bẫy lưới trúc + công tắc ẩn**, **cung thủ tháp canh bắn chéo**. **Không làm Jump Attack.** |
| 4 | Boss GĐ1: **cận vệ khiên sắt chặn mọi đòn phía trước**, người chơi nhảy qua đầu rồi chém sau lưng (thay cho "Jump Attack" trong Excel; mở rộng cơ chế `blocked` của kỵ binh thiết giáp chương 2). |
| 5 | Phần thưởng Tinh Thiều: **quân bị hạ ở màn 3 có tỉ lệ rơi bình hồi máu**, có buff thì tỉ lệ cao hơn. Bỏ phần "sách" trong Excel (màn 3 không có sách). |
| 6 | Mini-boss màn 1 = **xe chở cống phẩm lớn có lính hộ tống**; phá xe thì rơi Quyển Sách Tinh Hoa. Quan thu thuế và xe cống phẩm nhỏ là chướng ngại thường. |
| 7 | Kết chương: Tiêu Tư hối lộ rồi bỏ chạy về Quảng Châu, Lý Bí **cắm cờ trên thành Long Biên**. Panel kết chương nêu mốc **mùa xuân năm 544 lên ngôi, quốc hiệu Vạn Xuân** (theo câu 9, 10), không cho xưng Đế ngay sau trận Long Biên như Excel. |
| 8 | **Giữ đủ 50 câu**, không loại câu nào. Câu nghi vấn ghi ở mục 7 để team tự xem lại Excel. |
| 9 | Đồ hoạ theo chuẩn **32-bit hi-bit** hiện hành (Excel ghi "8-bit" là thiết kế cũ). |
| 10 | Thứ tự: **khung chương → engine → màn 1 → màn 2 → màn 3**; mỗi màn: prompt Codex → code bằng asset tạm → thay asset thật. |

## 1. THÔNG SỐ CHƯƠNG

| Mục | Giá trị |
|---|---|
| Thư mục code | `frontend/static/js/levels/ly-nam-de/` |
| Id chương / key tiến trình | `3` / `lnd` (khoá `suta.lnd.progress`) |
| Level id | `301`, `302`, `303` (`CHECK id = chapter_id*100 + level_no`) |
| URL | `/gameplay/levels/ly-nam-de`, `…/ly-nam-de/2`, `…/ly-nam-de/3` |
| Template | `templates/gameplay/levels/ly-nam-de.html` kế thừa `gameplay/base.html` |
| Asset | `assets/images/ly-nam-de/sprites-32bit/manifest_lnd.json`, `maps-32bit/maps_lnd.json` |
| Câu hỏi | `assets/question/ly-nam-de-question.json` (đã có, **khớp Excel 50/50 câu** cả chữ lẫn đáp án đúng, đối chiếu 30/10) → sinh `questions-data.js` bằng `python tools/make_question_data.py ly-nam-de` (thêm mục `ly-nam-de` vào `CHAPTERS`) |
| Thư viện | `library_heroes.json` đã có mục `ly-nam-de` — không đụng |
| Trang chủ | thẻ Lý Bí trong `components/home/timeline.html` đang khoá, `chapter.html` chưa có thẻ → thêm/mở ở LND-SKELETON với `data-unlock-after="2"` |

## 2. LỘ TRÌNH

| Mã | Nội dung | Phụ thuộc |
|---|---|---|
| **LND-00** | Task card này + team duyệt mục 3.3, 4, 5 | — |
| **LND-ART-BIBLE** | Phụ lục art bible thế kỷ 6 trong `SUTA_TT_ART_BRIEF_32.md` (trang phục quân Lương, hào trưởng Giao Châu, thành Long Biên, sông Hồng), tra cứu có nguồn bằng `/research` | — |
| **LND-SKELETON** | [SUTA_LND_TASK_SKELETON_01.md](SUTA_LND_TASK_SKELETON_01.md) — thư mục chương, `chapter.js`/`config.js`, template, route, migration `007` (chương 3, level 301–303, phần thưởng), `VALID_*`, thẻ trang chủ + timeline, `/quiz` thêm chương, rule `.claude/rules/ly-nam-de-gameplay.md`. Chạy được bằng asset mượn | LND-00 |
| **LND-ENGINE** | Mục 3.5 | LND-SKELETON |
| **LND-L1** + `LND_ART_01` | Màn 1 (mục 3.1) | SKELETON, ENGINE |
| **LND-L2** + `LND_ART_02` | Màn 2 (mục 3.2) | L1, LND-00 duyệt |
| **LND-L3** + `LND_ART_03` | Màn 3 boss Tiêu Tư (mục 3.4) | L2 |
| Nhạc | Prompt Gemini Pro theo khuôn `GEMINI_PROMPT_BT_MUSIC.md`; trong lúc chờ mượn nhạc chương 2 | — |

Mỗi giai đoạn: kế hoạch → duyệt → code → `pytest tests` + `/verify-ui` → `/task-report`. Thay đổi engine phải chơi lại 3 màn Trưng Trắc + 3 màn Bà Triệu + `?layout=p2`, `?layout=skills`, `?layout=engine`, `?viewer=1`.

---

## 3. THIẾT KẾ MÀN (DESIGN_BASELINE — số cụ thể chốt ở task card từng màn)

### 3.1 Màn 1 — "Từ quan chiêu binh" (cấu trúc như màn 1 chương 2)
- 12 chướng ngại xáo mỗi lượt + mini-boss cố định cuối màn; 5 **Quyển Sách Tinh Hoa**; 4 bia câu hỏi chặn đường; Lý Bí đứng chờ ở chunk 1.
- Vùng cảnh đề xuất: đồi núi Thái Nguyên → làng → bờ sông Hồng (mỏm đá) → trạm kiểm soát nhà Lương → đồng bằng Giao Châu (đích).

| Excel | Cơ chế engine | Ghi chú |
|---|---|---|
| Lính tuần tiễu nhà Lương | lính canh (`GUARD`) | giáp nhẹ, đi qua lại |
| Quan lại thu thuế | `thrower` | ném đồng tiền chì / sổ sách |
| Thuyền chiến nhỏ trên sông Hồng | **thuyền dưới dải sông** (mới) | bắn hoả tiễn lên khi người chơi nhảy qua mỏm đá |
| Bẫy lưới trúc | **công tắc ẩn → lưới rơi** (mới) | đạp ô ẩn thì lưới rơi từ cây |
| Cung thủ trên tháp canh | **đạn bay chéo** (mới) | đặt ở trạm kiểm soát |
| Chó săn quân Lương | enemy nhanh, đòn thấp | |
| Xe chở cống phẩm | `roller` phá được + **rơi vật phẩm** (mới) | nhảy qua hoặc chém vỡ lấy Quyển Sách Tinh Hoa |
| Đá lở vùng đồi núi | `roller` phá được (có sẵn ở chương 2) | vùng đồi núi |
| *(mini-boss)* Xe cống phẩm lớn + hộ tống | mini-boss cố định | phá xe rơi sách cuối; lính hộ tống đi kèm |

### 3.2 Màn 2 — "Chiêu mộ hiền tài"
- Cấu trúc như màn 2 chương 2: 9 chunk đặt cố định, có quân Lương/bẫy/hố; địa hình chuyển dần sang sông nước Chu Diên.
- Thứ tự NPC theo Excel: **Phạm Tu → Tinh Thiều → Triệu Túc**. Mỗi NPC bị 2 lính Lương vây (giải cứu), trước mỗi NPC 1 bia câu hỏi chặn đường.

### 3.3 Câu hỏi

Giữ đủ **50 câu** (người dùng chốt 30/10). **Chia pool — ĐÃ DUYỆT 31/10/2026** (theo số thứ tự Excel):

| Pool | Câu |
|---|---|
| `NPC_QUESTION_POOLS.phamTu` (ban võ, Tô Lịch, Lâm Ấp) | 14, 15, 17, 18, 40 |
| `NPC_QUESTION_POOLS.tinhThieu` (sĩ tộc, triều đình, ban văn) | 7, 28, 41, 48 |
| `NPC_QUESTION_POOLS.trieuTuc` (Chu Diên, Thái phó, Triệu Quang Phục) | 8, 23, 30, 34, 49 |
| `LEVEL1_QUESTION_POOL` (còn lại, rút 4 câu/lượt) | 1, 2, 3, 4, 5, 6, 9, 10, 11, 12, 13, 16, 19, 20, 21, 22, 24, 25, 26, 27, 29, 31, 32, 33, 35, 36, 37, 38, 39, 42, 43, 44, 45, 46, 47, 50 |

Trang `/quiz`: thêm chương 3 để nạp `ly-nam-de-question.json` (LND-SKELETON).

### 3.4 Màn 3 — "Công phá thành Long Biên" — boss Thứ sử Tiêu Tư
- Đấu trường 1 chunk: bờ tường thành Long Biên, gạch đá đổ nát, khói lửa chớp nháy.
- **GĐ 1:** máy bắn đá ném đá tảng (có vạch báo chỗ rơi) + đội **cận vệ khiên sắt**: chém phía trước bị chặn (tóe lửa + gợi ý), phải nhảy qua đầu chém sau lưng.
- **GĐ 2:** cận vệ bị hạ → Tiêu Tư kích hoạt **xe hoả công**; chỉ kỹ năng **Triều Cường** dập được lửa làm xe chết máy (như "chỉ voi húc mới ngã" ở chương 2).
- **GĐ 3:** Tiêu Tư hoảng loạn đánh bừa + ném vàng (chạm thì choáng ngắn, dùng lại cơ chế tiền vàng chương 2) → hết máu → cutscene (mục 5.2) + panel kết chương (mục 5.3).
- Quân bị hạ ở màn 3 có tỉ lệ rơi bình hồi máu (tỉ lệ thấp khi không có buff Tinh Thiều, cao khi có).
- Phần thưởng màn 2 thành kỹ năng (chỉ tác dụng màn 3):

| Id đề xuất | Tên | Loại | Từ NPC |
|---|---|---|---|
| `SK_LND_TO_LICH_SHIELD` | Khiên Tô Lịch | phím K — lớp giáp chặn 3 đòn rồi vỡ, có hồi chiêu | Phạm Tu |
| `BUFF_LND_SUPPLY` | Lương thảo dồi dào | bị động — quân bị hạ rơi bình hồi máu với tỉ lệ cao hơn | Tinh Thiều |
| `SK_LND_TIDE` | Triều Cường | phím L — sóng nước quét màn hình dọn quái nhỏ, dập lửa xe hoả công, có hồi chiêu | Triệu Túc |

### 3.5 LND-ENGINE — cơ chế mới (dùng chung mọi chương)
1. **Dải sông**: vùng nước dưới mặt đất có mỏm đá đứng được; rơi xuống mất máu và đưa về mỏm đá gần nhất.
2. **Thuyền chiến**: nằm trong dải sông, bắn hoả tiễn lên khi người chơi ở trên tầm.
3. **Công tắc ẩn → lưới rơi**: vùng kích hoạt vô hình, lưới rơi từ trên xuống, trúng thì mất máu + choáng ngắn (`stunPlayer` đã có).
4. **Đạn có góc** (`vx`, `vy`) cho cung thủ tháp canh.
5. **Vật cản phá được rơi vật phẩm** (xe cống phẩm rơi sách) và **quái rơi bình máu theo tỉ lệ** (cho buff Tinh Thiều).
6. **Khiên chặn theo hướng**: đòn từ phía trước bị chặn, từ sau lưng thì trúng (cận vệ khiên sắt).

---

## 4. NỘI DUNG MÀN 2 — ĐÃ DUYỆT 31/10/2026

Quy ước: ✅ đáp án đúng; câu **in nghiêng** lấy nguyên văn Excel, còn lại Claude soạn nháp. Thoại xưng hô với Lý Bí (như chương 2 xưng hô với Bà Triệu).

### 4.1 Tướng Phạm Tu — Lão tướng tài ba vùng Thanh Trì

**Thoại**
1. Phạm Tu: "Nghe tin ngài từ quan về quê chiêu binh, lão phu tìm đến xem chí khí ngài thế nào."
2. Phạm Tu: *"Nhà Lương binh hùng tướng mạnh, giáp sắt ngựa béo. Ta dẫu có dũng khí nhưng binh khí thô sơ, làm sao có thể đương cự lâu dài?"*

**Câu hỏi:** Lý Bí đáp lời Phạm Tu thế nào?
- ✅ *Lấy đoản binh đánh trường trận. Đánh bất ngờ vào trị sở Long Biên khiến địch không kịp trở tay, sau đó lập tức xây dựng thành lũy phòng thủ ở cửa sông sừng sững.*
- ❌ "Dàn quân ra đồng bằng, đánh trận lớn với giặc ngay từ đầu."
- ❌ "Đợi rèn đủ giáp sắt, ngựa béo như quân Lương rồi mới dấy binh."

**Gợi ý khi sai:** Quân ít, khí giới thô sơ thì phải đánh lúc giặc không ngờ tới.

**Vì sao đúng:** *Phạm Tu là người chỉ huy xây dựng thành lũy ở cửa sông Tô Lịch để chặn giặc.*

**Phần thưởng:** Khiên Tô Lịch. Trong trận đánh, bấm K để dựng lớp giáp chặn 3 đòn tấn công.

### 4.2 Tinh Thiều — Mưu sĩ, học giả xuất chúng bị nhà Lương khinh miệt

**Thoại**
1. Tinh Thiều: "Ta từng sang xin làm quan, bị nhà Lương chê xuất thân, chỉ cho làm chức gác cổng."
2. Tinh Thiều: *"Bọn giặc Lương chuộng chế độ sĩ tộc, khinh rẻ người phương Nam ta không cho làm quan to. Nay ngài dấy binh, ngài sẽ dùng người bằng cách nào?"*

**Câu hỏi:** Lý Bí sẽ dùng người thế nào?
- ✅ *Ta dựng nước độc lập, mở lối phong tước bằng thực tài và phẩm hạnh, không phân biệt xuất thân hay dòng dõi. Trí thức Giao Châu sẽ là rường cột của Vạn Xuân.*
- ❌ "Chỉ dùng người thuộc dòng dõi hào trưởng, như nhà Lương vẫn làm."
- ❌ "Chỉ cần người giỏi võ, việc văn chương không cần đến."

**Gợi ý khi sai:** Điều Tinh Thiều căm ghét nhất ở nhà Lương là gì?

**Vì sao đúng:** *Sự trọng dụng nhân tài bất chấp xuất thân đã giúp Lý Bí thu phục được Tinh Thiều làm tướng văn đứng đầu.*

**Phần thưởng:** Lương thảo dồi dào. Trong trận đánh, quân giặc bị hạ hay rơi bình hồi máu hơn.

> Ghi chú: Tinh Thiều xin làm quan bị cho chức gác cổng lấy từ câu 7 trong Excel.

### 4.3 Triệu Túc — Hào trưởng vùng Chu Diên (Thái phó tương lai)

**Thoại**
1. Triệu Túc: "Cha con ta ở Chu Diên đã nghe danh ngài, muốn đem tráng đinh theo về."
2. Triệu Túc: *"Vùng Chu Diên ta nhiều đầm lầy, tráng đinh giỏi nghề sông nước nhưng chưa quen giáp lá cà. Quân Lương lại thạo đánh bộ. Đâu là chiến sách vẹn toàn?"*

**Câu hỏi:** Chiến sách nào vẹn toàn?
- ✅ *Lấy thủy binh Chu Diên làm quân tiên phong chặn giặc trên sông, kết hợp bộ binh đánh vu hồi hai bên mạn sườn. Đất hiểm Chu Diên sẽ là phên dậu vững chắc.*
- ❌ "Bắt tráng đinh Chu Diên bỏ thuyền lên bờ, đánh giáp lá cà với quân Lương."
- ❌ "Rút hết về rừng sâu, bỏ lại vùng sông nước cho giặc."

**Gợi ý khi sai:** Hãy dùng đúng sở trường của người Chu Diên.

**Vì sao đúng:** *Sự gia nhập của cha con Triệu Túc (và Triệu Quang Phục sau này) với tài thao lược thủy chiến là chìa khóa thắng lợi của Lý Nam Đế.*

**Phần thưởng:** Triều Cường. Trong trận đánh, bấm L để gọi sóng nước quét sạch quân nhỏ trên màn hình.

---

## 5. CÂU CHỮ KHÁC — ĐÃ DUYỆT 31/10/2026

### 5.1 Thông báo đầu màn
- Màn 1: "Màn 1: Từ quan chiêu binh — Đầu thế kỷ 6, thứ sử Tiêu Tư nhà Lương tàn bạo, tham nhũng. Hãy theo Lý Bí tập hợp lực lượng, thu đủ 5 Quyển Sách Tinh Hoa."
- Màn 2: "Màn 2: Chiêu mộ hiền tài"
- Màn 3: "Màn 3: Công phá thành Long Biên"

### 5.2 Thoại Lý Bí dẫn màn 1 (theo bối cảnh ô A1)
1. Lý Bí: "Ta từng làm Giám quân ở Đức Châu, nhưng không chịu nổi sự tàn bạo, tham nhũng của Tiêu Tư nên đã từ quan về quê."
2. Lý Bí: "Nay ta chiêu binh mãi mã. Hãy theo ta vượt qua đồi núi, xuống đồng bằng Giao Châu tập hợp lực lượng."

### 5.3 Cutscene màn 3
1. "Tiêu Tư hoảng sợ, đem vàng bạc hối lộ xin tha mạng rồi bỏ chạy về Quảng Châu."
2. "Lý Bí cắm cờ trên thành Long Biên. Giao Châu được giải phóng."

### 5.4 Panel kết chương
- Tiêu đề: "Hoàn thành chương Lý Nam Đế"
- Dòng 1: `Bạn đã cùng Lý Bí đánh đuổi quân Lương và đạt ${score} điểm.`
- Dòng 2 (kết cục lịch sử, lấy từ giải thích câu 9, 10, 12): "Mùa xuân năm 544, Lý Bí lên ngôi Hoàng đế, tức Lý Nam Đế, đặt quốc hiệu Vạn Xuân, niên hiệu Thiên Đức, mong đất nước mãi trường tồn như vạn mùa xuân."

---

## 6. ASSET (đề xuất ID — chốt trong prompt Codex từng đợt bằng `/codex-prompt`, không tạo ID gần giống ID đã có)

| Đợt | Nội dung |
|---|---|
| `LND_ART_01` | `NPC_LY_BI` (dẫn màn) + `PORTRAIT_LY_BI`; lính tuần tiễu, quan thu thuế + đạn tiền chì/sổ sách, thuyền chiến + hoả tiễn, lưới trúc, cung thủ tháp canh + tên, chó săn, xe cống phẩm nhỏ + lớn (mini-boss), đá lở; nền + tile đồi Thái Nguyên, bờ sông Hồng (dải nước, mỏm đá), trạm kiểm soát, cổng đích |
| `LND_ART_02` | NPC + chân dung Phạm Tu, Tinh Thiều, Triệu Túc; lính Lương thường (quân vây NPC); FX khiên Tô Lịch, sóng Triều Cường, bình hồi máu; icon 3 kỹ năng; nền sông nước Chu Diên |
| `LND_ART_03` | Tiêu Tư (đánh bừa, ném vàng, bỏ chạy) + chân dung, máy bắn đá + đá tảng, cận vệ khiên sắt, xe hoả công (cháy / chết máy), nền tường thành Long Biên, cờ chiến thắng |

Mượn asset chương 1–2 trong lúc chờ (trời ngày, tile mặt đất, bia câu hỏi, lính Ngô làm lính Lương tạm, tiền vàng `GOLD_COIN`) qua `BORROWED_MAPS`, không chép ảnh.

## 7. VIỆC CHỜ TEAM

- [x] Duyệt mục 4 và 5 — 31/10/2026 (người dùng duyệt nguyên văn đề xuất).
- [x] Duyệt chia pool câu hỏi (mục 3.3) — 31/10/2026.
- [x] Đặt tên buff Tinh Thiều (`BUFF_LND_SUPPLY`) — "Lương thảo dồi dào", 31/10/2026.
- [x] Duyệt thưởng vàng/thành tựu (mục 9) — 31/10/2026.
- [ ] Nhạc nền riêng chương (Gemini Pro).
- [ ] **Câu nghi vấn** — vẫn giữ trong game (người dùng chốt 30/10), nhờ team xem lại Excel; sửa Excel thì Claude đồng bộ lại JSON:

| Câu | Vấn đề |
|---|---|
| 2 | Quê gốc Lý Bí còn nhiều thuyết (Thái Nguyên / huyện Thái Bình xưa), đáp án "Thái Nguyên" có thể gây tranh cãi |
| 20 | Câu hỏi "rút quân về **vùng núi** nào?" nhưng đáp án đúng là **hồ** Điển Triệt |
| 30 / 49 | Mâu thuẫn: câu 30 nói Thái phó "trông coi việc thuế khóa, quan lại", câu 49 nói Thái phó là "người thầy, quan cố vấn cao cấp"; giải thích câu 30 lại ghi "lo việc chính sự, nội trị" |
| 31 | "Đình thờ Lý Nam Đế **lớn nhất** hiện nay" khó kiểm chứng, không phải kiến thức lịch sử |
| 35 | Lỗi gõ "quân nghĩa quân" |
| 37 | Truyền thuyết thiền sư nuôi Lý Bí ở chùa Linh Xét (Pháp Vân) — chưa có nguồn |
| 41 | "Bộ ba quyền lực" là cách gọi hiện đại, sử không ghi "nhân dân thường gọi" như vậy |
| 50 | Giải thích ghi "Triệu Đà xưng Vương", nhưng Triệu Đà từng xưng "Nam Việt Vũ Đế" |

- [ ] Ô A1 ghi trận Long Biên "mùa xuân năm 542" — team đối chiếu nguồn (câu 4 ghi khởi nghĩa mùa xuân 541).

## 8. GATE LND-00
1. Team duyệt mục 3.3, 4, 5, 9.
2. Sau khi duyệt, nội dung mục 4–5 thành **Source of Truth**, chép nguyên văn vào `dialogue-data.js` ở LND-L1/L2/L3.

## 9. THƯỞNG VÀNG / THÀNH TỰU CHƯƠNG 3 — ĐÃ DUYỆT 31/10/2026 (`DESIGN_BASELINE`)

Nguyên tắc như chương 2 (BT-00 mục 9): chương sau thưởng cao hơn chương trước ~20%; cùng khuôn thành tựu; chỉ dùng dữ liệu server đã có.

**Thưởng qua màn lần đầu** (cột `levels.first_clear_*`, migration `007`):

| Màn | Chương 2 (đối chiếu) | Chương 3 đề xuất |
|---|---|---|
| 1 | 120 vàng | **144 vàng** |
| 2 | 180 vàng | **216 vàng** |
| 3 | 240 vàng + 8 KC | **288 vàng + 10 KC** |
| Tổng | 540 vàng + 8 KC | **648 vàng + 10 KC** |

**Thành tựu mới** (bảng `achievements` + luật trong `ACHIEVEMENT_RULES`):

| Code | Tên | Điều kiện | Thưởng |
|---|---|---|---|
| `LND_CLEAR_1` | Từ quan chiêu binh | Hoàn thành màn 1 chương Lý Nam Đế | 72 vàng |
| `LND_CLEAR_2` | Hội tụ hiền tài | Hoàn thành màn 2 chương Lý Nam Đế | 72 vàng |
| `LND_CHAPTER` | Vạn Xuân | Hoàn thành chương Lý Nam Đế | 14 KC |
| `LND_SPEED` | Đoản binh thần tốc | Tổng thời gian tốt nhất 3 màn Lý Nam Đế dưới 15 phút | 7 KC |

- `TT_FLAWLESS` và `TT_SCHOLAR` giữ chung mọi chương — không tạo bản `LND_` trùng nghĩa.
