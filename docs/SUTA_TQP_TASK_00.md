# SỬ TA — CHƯƠNG 4: TRIỆU VIỆT VƯƠNG (TRIỆU QUANG PHỤC)
# TASK CARD TỔNG: KẾ HOẠCH CHƯƠNG + NỘI DUNG CHỜ TEAM DUYỆT

TASK_ID: TQP-00 • Version 1.0 • 04/11/2026
Nguồn: Excel của team `DATA các nhân vật.xlsx`, sheet "4 Triệu Việt Vương" (ô A1 = bối cảnh + thiết kế, A2:H52 = 50 câu hỏi).
Mẫu tham chiếu: chương Lý Nam Đế ([SUTA_LND_TASK_00.md](SUTA_LND_TASK_00.md), `js/levels/ly-nam-de/`, rule `ly-nam-de-gameplay.md`).

> Task card này **chỉ là tài liệu**. Mỗi giai đoạn code ở mục 2 có task card riêng, duyệt trước khi làm.
> Kế hoạch tổng **ĐÃ DUYỆT 04/11/2026** (người dùng). Khi lập TQP-SKELETON, người dùng **duyệt luôn** chia pool 3.3,
> tên 3 phần thưởng 3.4, tên 3 màn 5.1 và thưởng/thành tựu mục 9 (04/11/2026) để seed migration `008`.
> **Mục 4 team đã duyệt (người dùng báo 05/11/2026)**; mục 5.1–5.2 duyệt 04/11 (TQP-L1). Phần còn lại của mục 5 **CHỜ TEAM DUYỆT** — sau khi duyệt mới thành
> Source of Truth, chép nguyên văn vào `dialogue-data.js` / `config.js` (rule `history-content.md`).

---

## 0. QUYẾT ĐỊNH ĐÃ CHỐT (03–04/11/2026)

| # | Quyết định |
|---|---|
| 1 | Người chơi vẫn là **nghĩa sĩ nam/nữ** (`PLAYER_MALE`/`PLAYER_FEMALE`). **Triệu Quang Phục là NPC dẫn màn 1** (`NPC_TQP` + `PORTRAIT_TQP`) + nhân vật cutscene màn 3. NPC màn 2 nói với TQP (như chương 3 nói với Lý Bí). Excel ghi "người chơi vào vai Triệu Quang Phục" → đổi như 3 chương trước. |
| 2 | Slug **`trieu-quang-phuc`**, khớp mục thư viện `library_heroes.json` và avatar `trieu_quang_phuc.webp` đã có. Tên chương hiển thị "Triệu Việt Vương". |
| 3 | **Sách mở khoá NPC màn 2**: màn 1 giữ nếp cũ (5 sách); màn 2 rải 10 sách, NPC cần đủ **3 / 6 / 10** quyển mới hiện. |
| 4 | Thêm **đòn bổ từ trên** vào engine (dùng chung): lính giáo dài và gáy Dương Sàn chỉ trúng đòn bổ. |
| 5 | Thêm **ẩn nấp trong lau sậy** (màn 2, đoạn Dạ Trạch đêm) và **khu rèn luyện đầu màn 1** (hướng dẫn chơi). Không làm tầm nhìn đêm, không làm đoạn chèo thuyền màn 2. |
| 6 | **Giữ đủ 50 câu**, không loại câu nào. Câu nghi vấn ghi ở mục 7 để team xem lại Excel. |
| 7 | Đồ hoạ chuẩn **32-bit hi-bit** (Excel ghi "8-bit" là thiết kế cũ). Phe Lương dùng lại xám tro `CONCEPT_LUONG` chương 3. |
| 8 | Thứ tự: **khung chương → engine → màn 1 → màn 2 → màn 3**; mỗi màn: prompt Codex → code bằng asset tạm → thay asset thật. |
| 9 | **Không import file nào của chương khác** — bảng nào cần thì khai báo lại trong `config.js` chương 4; sprite dùng lại thì chép cùng ID. |

## 1. THÔNG SỐ CHƯƠNG

| Mục | Giá trị |
|---|---|
| Thư mục code | `frontend/static/js/levels/trieu-quang-phuc/` |
| Id chương / key tiến trình | `4` / `tqp` (khoá `suta.tqp.progress`) |
| Level id | `401`, `402`, `403` (migration `008_trieu_quang_phuc.sql`) |
| URL | `/gameplay/levels/trieu-quang-phuc`, `…/2`, `…/3` |
| Template | `templates/gameplay/levels/trieu-quang-phuc.html` kế thừa `gameplay/base.html` |
| Asset | `assets/images/trieu-quang-phuc/sprites-32bit/manifest_tqp.json`, `maps-32bit/maps_tqp.json` |
| Câu hỏi | `assets/question/trieu-quang-phuc-question.json` — **chưa có**, chuyển nguyên văn từ Excel (đối chiếu 50/50) → sinh `questions-data.js` bằng `python tools/make_question_data.py trieu-quang-phuc` (thêm mục vào `CHAPTERS`). `/quiz` thêm chương 4 (`QUIZ_BANKS`) |
| Thư viện | `library_heroes.json` đã có mục `trieu-quang-phuc` — không đụng |
| Trang chủ | thẻ TQP trong `components/home/chapter.html` + `timeline.html` đang khoá → mở với `data-unlock-after="3"` |

## 2. LỘ TRÌNH

| Mã | Nội dung | Phụ thuộc |
|---|---|---|
| **TQP-00** | Task card này + team duyệt mục 3.3, 4, 5, 9 | — |
| **TQP-ART-BIBLE** | Tra cứu có nguồn (`/research`, 05/11): đầm Dạ Trạch, thuyền độc mộc, Chử Đồng Tử (rồng vàng, móng rồng — lời truyền; dáng người không có nguồn → tạo hình tiên ông người dùng duyệt 05/11), động Khuất Lão (trung du Tam Nông, bệnh lam chướng) — lưu ở [archive/RESEARCH_TQP_ART_BIBLE.md](archive/RESEARCH_TQP_ART_BIBLE.md); giáp Dương Sàn tra ở `TQP_ART_03` | — |
| **TQP-SKELETON** | [SUTA_TQP_TASK_SKELETON_01.md](SUTA_TQP_TASK_SKELETON_01.md) — thư mục chương, `chapter.js`/`config.js`, template, route, migration `008` (chương 4, level 401–403, phần thưởng, thành tựu), `VALID_*`, thẻ trang chủ + timeline, JSON câu hỏi + `/quiz`, rule `.claude/rules/trieu-quang-phuc-gameplay.md` (+ thêm vào bảng rule trong `CLAUDE.md`). Chạy được bằng asset mượn | TQP-00 |
| **TQP-ENGINE** | [SUTA_TQP_TASK_ENGINE_01.md](SUTA_TQP_TASK_ENGINE_01.md) — mục 3.5 (**xong 04/11/2026**, [REPORT_TQP-ENGINE.md](REPORT_TQP-ENGINE.md); E9 bỏ vì bẫy chông ẩn chương 2 đã có) | TQP-SKELETON |
| **TQP-L1** + `TQP_ART_01` | Màn 1 (mục 3.1) — **xong 04/11** ([task card](archive/SUTA_TQP_TASK_L1_01.md), [report](archive/REPORT_TQP-L1.md)); `TQP_ART_01` Gate A1 + A2 PASS, `IN_GAME` | SKELETON, ENGINE |
| **TQP-L2** + `TQP_ART_02` | Màn 2 (mục 3.2) — **XONG 05/11** (chơi tay OK): [archive/SUTA_TQP_TASK_L2_01.md](archive/SUTA_TQP_TASK_L2_01.md), [archive/REPORT_TQP-L2.md](archive/REPORT_TQP-L2.md) | L1, TQP-00 duyệt |
| **TQP-L3** + `TQP_ART_03` | Màn 3 boss Dương Sàn (mục 3.4) | L2 |
| Nhạc | `GEMINI_PROMPT_TQP_MUSIC.md` → `audio/trieu-quang-phuc/level1–3.mp3` | — |

Mỗi giai đoạn: kế hoạch → duyệt → code → `pytest tests` + `/verify-ui` → `/task-report`. Thay đổi engine phải chơi lại 3 màn Trưng Trắc + 3 màn Bà Triệu + 3 màn Lý Nam Đế và các layout thử (`?layout=p2`, `?layout=skills`, `?layout=engine`, `?viewer=1`).

---

## 3. THIẾT KẾ MÀN (DESIGN_BASELINE — số cụ thể chốt ở task card từng màn)

### 3.1 Màn 1 — "Tuổi trẻ rèn luyện" (tên nháp), 12 chunk
- **Khu rèn luyện (chunk 1–2, mới):** TQP dẫn, thoại hướng dẫn. Bài tập: chém 3 bù nhìn rơm (hazard `prop` có `hp`, không gây hại) → nhảy cọc tre (bục) → lướt qua khe thấp → **bổ** xuống bù nhìn đội nón cầm giáo. Xong thì cổng tre mở.
- Vùng cảnh: làng Chu Diên (3–4) → bãi lau ven sông (5–7) → đầm lầy (8–10) → bờ đầm Dạ Trạch (11–12, đích).
- 5 Quyển Sách Tinh Hoa, 4 bia câu hỏi, 1 điểm nghỉ chân hồi máu. Chướng ngại xáo mỗi lượt trong vùng được phép.
- **Mini-boss cố định cuối màn: đội trưởng giáo dài** — to hơn lính thường, 6 đòn, chỉ trúng đòn bổ, 2 lính hộ tống, chết rơi sách.

| Excel | Cơ chế | Mới/có |
|---|---|---|
| Lính tuần tra nhà Lương | `guard` | có |
| Cung thủ phục kích trên cành cây / tháp canh | thrower `aim` + prop cây cao / tháp (như tháp canh chương 3) | có |
| Bẫy chông tre ẩn dưới lá | `trap` cờ `hidden` (E9) | sửa nhỏ |
| Bãi sình lầy (đứng quá 3 s lún, mất máu) | **vùng sình** (E1) | mới |
| Khói chướng khí bay ngang | **khói trôi** (E2) — nhảy qua, hoặc lướt xuyên (lướt được miễn) | mới |
| Rắn độc đầm lầy | `rusher` thấp, bò sau prop bụi cỏ vẽ ở lớp trên (lớp vẽ chương) | có |
| Lính giáo dài | gạt mọi đòn chém ngang, đâm xa phía trước; chỉ **đòn bổ** (E5) trúng | mới |
| Cá sấu Dạ Trạch | **hazard trong khe nước** (E3) | mới |
| Thuyền tuần tiễu nhỏ | thuyền phá được + **gọi viện** (E4) | mới |

### 3.2 Màn 2 — "Hiền tài Dạ Trạch" (tên nháp), 10 chunk cố định
- Vùng cảnh: bờ sông Chu Diên (1–3, **Triệu Túc**) → núi rừng động Khuất Lão (4–6, **Lý Nam Đế**) → đầm Dạ Trạch ban đêm (7–10, **Chử Đồng Tử**). Thứ tự NPC theo Excel.
- Rải **10 Quyển Sách Tinh Hoa**, có quyển ở chỗ khó (trên bục, sau khe nước, trong thuyền tuần tiễu). NPC cần **3 / 6 / 10** sách mới hiện (E6); chưa đủ thì NPC mờ + dòng "Cần N Quyển Sách Tinh Hoa" + chặn đường → quay lại tìm.
- Mỗi NPC 2 lính Lương vây (giải cứu), trước mỗi NPC 1 bia câu hỏi chặn đường.
- Đoạn Dạ Trạch: bụi lau là **vùng ẩn nấp** (E7) — lính không phát hiện; đánh úp sau lưng lính chưa phát hiện ×2 sát thương.
- Chướng ngại dùng lại màn 1 (sình, khói trôi, cá sấu, thuyền, rắn, lính giáo).

### 3.3 Câu hỏi — CHỜ TEAM DUYỆT

Giữ đủ **50 câu**. Chia pool (theo số thứ tự Excel):

| Pool | Câu |
|---|---|
| `NPC_QUESTION_POOLS.trieuTuc` (gia thế, Chu Diên, rút lui) | 2, 3, 8, 10, 32 |
| `NPC_QUESTION_POOLS.lyNamDe` (Lý Bí, Vạn Xuân, trao quyền) | 1, 4, 5, 7, 43 |
| `NPC_QUESTION_POOLS.chuDongTu` (Dạ Trạch, truyền thuyết, du kích) | 12, 13, 15, 16, 33 |
| `LEVEL1_QUESTION_POOL` (còn lại, rút 4 câu/lượt) | 6, 9, 11, 14, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 34, 35, 36, 37, 38, 39, 40, 41, 42, 44, 45, 46, 47, 48, 49, 50 |

### 3.4 Màn 3 — "Đại phá Dương Sàn" (tên nháp)
- Đấu trường 2 chunk: bãi lầy Dạ Trạch nửa đêm, vài mỏm đất khô hẹp, gốc lau sậy, ánh đuốc chập chờn.
- **Dương Sàn**: to gấp 3 người chơi, giáp nặng — chém thẳng tóe lửa, không mất máu; cầm đại đao càn quét.
- **GĐ 1–2 (vòng lặp ×3):** boss lao tới theo người chơi; gọi lính đánh thuê, cung thủ bắn. Người chơi đứng sau bãi sình nhử boss lao qua → boss **lún 4 s**, giáp hở, điểm sáng ở gáy → bật **Móng Rồng** (L) rồi **bổ** vào gáy. Đủ 3 lượt → GĐ 3.
- **GĐ 3:** boss cuồng nộ đập vỡ mỏm đất → mặt đất thành nước (khe sông) + **thuyền độc mộc** bập bềnh (bục chở người có sẵn + nhấp nhô). Nhảy qua thuyền áp sát, bổ kết liễu → cutscene (5.4) → panel kết chương (5.5).
- Chưa có Móng Rồng (vào thẳng bằng `?layout`) thì bổ gáy vẫn gây 1/3 sát thương, không kẹt màn.
- Phần thưởng màn 2 (chỉ tác dụng màn 3):

| Id đề xuất | Tên (nháp) | Loại | Từ NPC |
|---|---|---|---|
| `BUFF_TQP_VITALITY` | Thể lực cường tráng | bị động — máu tối đa +2 (E8) | Triệu Túc |
| `SK_TQP_RALLY` | Hiệu triệu Vạn Xuân | phím K — đòn quét vòng quanh người, hạ quân nhỏ, hồi 12 s | Lý Nam Đế |
| `SK_TQP_DRAGON_CLAW` | Móng Rồng | phím L — 6 s đòn đánh xuyên giáp gáy Dương Sàn, hồi 10 s | Chử Đồng Tử |

### 3.5 TQP-ENGINE — cơ chế mới (dùng chung mọi chương)
1. **E1 Vùng sình**: đi chậm, nhảy thấp hơn; đứng liên tục > 3 s thì lún, −1 máu, đẩy ra. Dùng được cho entity (boss bị kẹt).
2. **E2 Khói trôi**: đám khói bay ngang ở độ cao thấp/cao, dựa trên `vent`; lướt được miễn.
3. **E3 Hazard trong khe nước**: chu kỳ cảnh báo (bọt) → ngoi đớp → lặn; chỉ chém được khi ngoi.
4. **E4 Thuyền phá được + gọi viện**: thuyền có `hp`; người chơi ở gần quá N giây chưa phá → bắn pháo tín hiệu, sinh 2 lính trên bờ (1 lần).
5. **E5 Đòn bổ từ trên**: đang trên không bấm ↓ = bổ xuống (thay cho lướt); trúng đầu địch thì sát thương + nảy lên. Cờ `plungeOnly` cho địch chỉ trúng đòn bổ.
6. **E6 NPC khoá theo số vật phẩm**: `requires: { items: N }` — chưa đủ thì NPC mờ, hiện gợi ý, chặn đường.
7. **E7 Vùng ẩn nấp**: `guard`/thrower không phát hiện người chơi trong vùng; đánh lính chưa phát hiện từ sau lưng ×2.
8. **E8 Máu tối đa theo lượt**: `MAX_HEALTH` (hằng số, đang dùng ở `engine/state.js`, `engine/level-flow.js`, `level1.js` chương 2–3) → `state.maxHealth` mặc định 5, chương nâng qua hook kỹ năng; HUD vẽ đủ số tim.
9. **E9** `trap` cờ `hidden`.

Layout thử `?layout=engine` màn 1 chương 4 chạy đủ E1–E7, E9.

---

## 4. NỘI DUNG MÀN 2 — ĐÃ DUYỆT (team, người dùng báo 05/11/2026)

Quy ước: ✅ đáp án đúng; câu **in nghiêng** lấy nguyên văn Excel ô A1, còn lại Claude soạn nháp. Thoại xưng hô với Triệu Quang Phục.

### 4.1 Thái phó Triệu Túc (cha Triệu Quang Phục)

**Thoại**
1. Triệu Túc: "Con ta, quân Lương đã đến sát Chu Diên. Cha muốn xem con cầm quân thế nào."
2. Triệu Túc: *"Quân Lương do Trần Bá Tiên chỉ huy thế giặc đang rất mạnh, quân ta mới thua trận. Là người lãnh đạo, con chọn cách đánh nào?"*

**Câu hỏi:** Triệu Quang Phục chọn cách đánh nào?
- ✅ *Rút lui về vùng đầm lầy hiểm trở Dạ Trạch, tránh thế giặc mạnh, bảo toàn lực lượng.*
- ❌ "Dàn quân đánh trực diện một trận quyết thắng với quân Lương."
- ❌ "Giải tán nghĩa quân, ai về nhà nấy chờ thời."

**Gợi ý khi sai:** Giặc đang mạnh, ta vừa thua. Trước hết phải giữ được lực lượng.

**Vì sao đúng:** *Đánh trực diện sẽ tiêu vong. Rút lui chiến lược là nền tảng của chiến thắng.*

**Phần thưởng:** Thể lực cường tráng. Trong trận đánh, máu tối đa tăng thêm 2.

### 4.2 Lý Nam Đế (Lý Bí — Quân vương)

**Thoại**
1. Lý Nam Đế: "Ta đã lui về động Khuất Lão. Việc chống giặc, nay trông cả vào khanh."
2. Lý Nam Đế: *"Bệnh tình ta đã trở nặng, vận nước ngàn cân treo sợi tóc. Nếu ta trao lại binh quyền, điều đầu tiên khanh làm để yên lòng quân là gì?"*

**Câu hỏi:** Triệu Quang Phục sẽ làm gì?
- ✅ *Xưng vương, dựng cờ phục quốc, lấy nhân nghĩa và kỷ luật để thu phục lòng dân cùng tàn quân khắp nơi.*
- ❌ "Ở lại động Khuất Lão chờ bệ hạ khỏi bệnh rồi mới tính."
- ❌ "Cầu hoà với nhà Lương cho quân sĩ nghỉ ngơi."

**Gợi ý khi sai:** Quân đang như rắn mất đầu. Cần có người đứng ra quy tụ.

**Vì sao đúng:** *Trong lúc rắn mất đầu, cần một danh chính ngôn thuận (Triệu Việt Vương) để quy tụ ý chí chiến đấu.*
> Nghi vấn mục 7 dòng 5: lúc nhận binh quyền ông xưng **Dạ Trạch Vương** — team chốt sửa chữ trong ngoặc hay không.

**Phần thưởng:** Hiệu triệu Vạn Xuân. Trong trận đánh, bấm K tung đòn quét quanh mình, hạ quân nhỏ xung quanh.

### 4.3 Chử Đồng Tử (Nhân vật huyền thoại — Đạo sĩ hiển linh)

**Thoại**
1. Chử Đồng Tử: "Lòng ngươi vì nước vì dân, nên ta hiện về giúp sức."
2. Chử Đồng Tử: *"Kẻ địch đông gấp chục lần, trang bị tận răng đóng ngoài cửa đầm. Ngươi dùng gì để phá giặc?"*

**Câu hỏi:** Triệu Quang Phục dùng gì để phá giặc?
- ✅ *Thuận theo tự nhiên. Ban ngày tĩnh lặng ẩn nấp, ban đêm dùng thuyền độc mộc xuất quỷ nhập thần tập kích doanh trại địch.*
- ❌ "Dồn hết quân ra cửa đầm, quyết tử một trận giữa ban ngày."
- ❌ "Đắp thành cao giữa đầm, cố thủ chờ giặc tự rút."

**Gợi ý khi sai:** Dạ Trạch có lau sậy rậm và đêm tối. Hãy dựa vào đó.

**Vì sao đúng:** *Đây chính là chiến thuật du kích làm nên tên tuổi Triệu Quang Phục.*

**Phần thưởng:** Móng Rồng. Trong trận đánh, bấm L để đòn đánh mang sức mạnh rồng, chém xuyên giáp Dương Sàn.

---

## 5. CÂU CHỮ KHÁC — CHỜ TEAM DUYỆT (nháp)

### 5.1 Thông báo đầu màn
> Màn 1 + mục 5.2 **duyệt 04/11/2026** (TQP-L1 Q1) — đã chép nguyên văn vào code.
- Màn 1: "Màn 1: Tuổi trẻ rèn luyện — Giữa thế kỷ 6, quân Lương đô hộ Giao Châu. Hãy cùng Triệu Quang Phục rèn võ nghệ ở Chu Diên, thu đủ 5 Quyển Sách Tinh Hoa."
- Màn 2: "Màn 2: Hiền tài Dạ Trạch"
- Màn 3: "Màn 3: Đại phá Dương Sàn"

### 5.2 Thoại Triệu Quang Phục dẫn màn 1
1. TQP: "Ta là Triệu Quang Phục, con Thái phó Triệu Túc. Muốn đánh giặc, trước hết phải rèn võ nghệ."
2. TQP: "Hãy cùng ta luyện tập rồi theo cha ta về với Lý Bí."

### 5.3 Thoại hướng dẫn khu rèn luyện
Câu chữ chốt ở TQP-L1 (không phải nội dung lịch sử — chỉ hướng dẫn phím).

### 5.4 Cutscene màn 3
1. "Triệu Quang Phục tung đòn kết liễu. Tướng giặc Dương Sàn tử trận."
2. "Quân Lương tan vỡ, nghĩa quân Dạ Trạch tiến về Long Biên."

### 5.5 Panel kết chương
- Tiêu đề: "Hoàn thành chương Triệu Việt Vương"
- Dòng 1: `Bạn đã cùng Triệu Quang Phục đánh tan quân Lương và đạt ${score} điểm.`
- Dòng 2 (lấy từ giải thích câu 19, 20, 21): "Năm 550, Triệu Quang Phục chém tướng Dương Sàn, xưng Triệu Việt Vương, khôi phục nước Vạn Xuân và đóng đô ở Long Biên."

---

## 6. ASSET (đề xuất — chốt ID trong prompt Codex từng đợt bằng `/codex-prompt`, không tạo ID gần giống ID đã có)

| Đợt | Nội dung |
|---|---|
| `TQP_ART_01` | **Xong 04/11** — prompt đã xoá, kết quả soát trong [REPORT_TQP-L1.md](archive/REPORT_TQP-L1.md) (04/11; Gate A1 = `plunge` người chơi nam/nữ, `NPC_TQP`, lính giáo dài, nền đầm + mặt sình). Người dùng chốt 04/11: thuyền gọi quân bằng **tù và + cờ hiệu** (không pháo hiệu — thế kỷ 6 chưa có thuốc súng); `NPC_TQP` ~~giữ nhận diện người con trong `NPC_TRIEU_TUC`~~ → **đổi 04/11 (soát Gate A1): tạo hình theo ảnh thư viện `characters/avatar/thumb/trieu_quang_phuc.webp`** (giáp lá rêu, khăn choàng đỏ, giáo tua đỏ); đòn bổ của người chơi là **cú chém xuống** (không cắm kiếm); bảng màu sprite chương 4 = 101 màu (+3 màu cá sấu/rắn/khói). Nội dung gốc: NPC + chân dung TQP; bù nhìn rơm (đứng / vỡ), cọc tre; lính giáo dài + đội trưởng giáo dài; cung thủ trên cây (prop cây); bẫy chông ẩn; khói chướng khí trôi; rắn + bụi cỏ; cá sấu (bọt / ngoi / lặn); thuyền tuần tiễu + pháo tín hiệu; tile + cảnh sình lầy; nền bãi tập Chu Diên, bãi lau ven sông, đầm lầy; cổng đích |
| `TQP_ART_02` | **XONG 05/11 — 17 asset `IN_GAME`** (prompt đã xoá; tư liệu ở [archive/RESEARCH_TQP_ART_BIBLE.md](archive/RESEARCH_TQP_ART_BIBLE.md)) (05/11; Gate B1 = 3 NPC + rồng vàng + chân dung Chử Đồng Tử + trời đêm + Dạ Trạch đêm). Nội dung gốc: NPC + chân dung Triệu Túc (vẽ riêng), Lý Nam Đế (bệnh, ngồi), Chử Đồng Tử; bụi lau che + FX ẩn nấp; nền động Khuất Lão, Dạ Trạch đêm; FX + icon 3 kỹ năng. Người dùng chốt 05/11: Triệu Túc **một người** (ID mới, giữ nhận diện chương 3; ô cha con `NPC_TRIEU_TUC` không dùng vì người con theo tạo hình TQP cũ); **thêm** trời đêm `BG_TQP_SKY_NIGHT` + nước đầm xanh rêu `PROP_TQP_SWAMP_WATER`; tạo hình Chử Đồng Tử **tra cứu trước** (TQP-ART-BIBLE). **Gate B1 soát 05/11, người dùng duyệt:** PASS 3 NPC, rồng vàng, chân dung Chử Đồng Tử, Dạ Trạch đêm; `BG_TQP_SKY_NIGHT` NEED_REDRAW (3 dải phẳng mép cứng y≈37/152 logic → ramp chàm 6 màu thay 6 xanh trời ngày, dither, thêm sao). Chốt cho B2: 1–2 đốm đuốc xa ở Dạ Trạch; Khuất Lão = cửa hang nhỏ một bên vùng trung du. **Gate B2 soát 05/11, người dùng duyệt:** PASS cả 12 asset mới + trời đêm vẽ lại (chênh hàng kề ≤ 2,6) + Dạ Trạch thêm 2 đuốc; palette map đổi 6 ô xanh trời ngày → chàm (192 màu). Đã chép PNG + 2 manifest sang `images/trieu-quang-phuc/`, chưa khai báo `config.js` (để TQP-L2/L3). Ghi chú cho code: bụi lau giữ vàng rơm sáng ở cảnh đêm để đọc rõ chỗ nấp; `FX_TQP_DRAGON_CLAW.hold` căn theo kiếm tư thế idle → TQP-L3 chỉ vẽ `hold` khi đứng yên, ra đòn dùng `strike` |
| `TQP_ART_03` | Dương Sàn (lao, chém đại đao, lún, hở gáy, cuồng nộ, ngã) + chân dung; lính đánh thuê, cung thủ; mỏm đất vỡ; thuyền độc mộc; nền Dạ Trạch nửa đêm + chớp đuốc |

Mượn trong lúc chờ (qua `BORROWED_MAPS` hoặc chép cùng ID): lính Lương, cung thủ, thuyền chiến, tháp canh, sách `ITEM_BT_TINH_HOA`, bia câu hỏi, bình máu `ITEM_LND_HEAL` (chương 2–3).

## 7. VIỆC CHỜ TEAM

- [x] Duyệt chia pool câu hỏi (mục 3.3) — 04/11/2026 (người dùng).
- [x] Duyệt tên 3 màn (5.1), tên 3 phần thưởng (3.4) — 04/11/2026 (người dùng).
- [x] Duyệt thưởng vàng / thành tựu (mục 9) — 04/11/2026 (người dùng).
- [ ] Duyệt mục 4 và 5.2–5.5 (thoại, đáp án sai, gợi ý, cutscene, panel kết chương).
- [ ] Nhạc nền riêng chương (Gemini Pro).
- [ ] **Câu nghi vấn** — vẫn giữ trong game, nhờ team xem lại Excel; sửa Excel thì Claude đồng bộ lại JSON:

| # | Câu | Vấn đề |
|---|---|---|
| 1 | 1 | Toàn thư chép riêng "Kỷ Triệu Việt Vương"; xếp ông vào "Nhà Tiền Lý" còn tranh cãi |
| 2 | 9, 35 | Sau sắp xếp hành chính 2025 (Thái Bình nhập Hưng Yên, bỏ cấp huyện): phương án "Thái Bình" nay cũng thuộc Hưng Yên; "huyện Khoái Châu" / "xã Dạ Trạch" cần kiểm tra tên hiện hành |
| 3 | 33 | Giải thích tự mâu thuẫn ("…nhưng thực tế là tên địa danh") |
| 4 | 31, 39 | Mốc năm chưa thống nhất (547–550 / lên ngôi 548 hoặc 550) |
| 5 | A1 | Tình huống Lý Nam Đế: lý do ghi "Triệu Việt Vương", nhưng lúc nhận binh quyền ông xưng **Dạ Trạch Vương** (câu 11); hiệu Triệu Việt Vương là sau năm 550 (câu 20) |
| 6 | 46 | "Vũ khí đa số tre, gỗ và một ít sắt" khó kiểm chứng |

## 8. GATE TQP-00
1. Team duyệt mục 3.3, 4, 5, 9.
2. Sau khi duyệt, nội dung mục 4–5 thành **Source of Truth**, chép nguyên văn vào `dialogue-data.js` ở TQP-L1/L2/L3.

## 9. THƯỞNG VÀNG / THÀNH TỰU CHƯƠNG 4 — CHỜ TEAM DUYỆT (`DESIGN_BASELINE`)

Nguyên tắc như chương 3 (LND-00 mục 9): chương sau thưởng cao hơn chương trước ~20%; cùng khuôn thành tựu; chỉ dùng dữ liệu server đã có.

**Thưởng qua màn lần đầu** (cột `levels.first_clear_*`, migration `008`):

| Màn | Chương 3 (đối chiếu) | Chương 4 đề xuất |
|---|---|---|
| 1 | 144 vàng | **173 vàng** |
| 2 | 216 vàng | **259 vàng** |
| 3 | 288 vàng + 10 KC | **346 vàng + 12 KC** |
| Tổng | 648 vàng + 10 KC | **778 vàng + 12 KC** |

**Thành tựu mới** (bảng `achievements` + luật trong `ACHIEVEMENT_RULES`):

| Code | Tên | Điều kiện | Thưởng |
|---|---|---|---|
| `TQP_CLEAR_1` | Rèn chí Chu Diên | Hoàn thành màn 1 chương Triệu Việt Vương | 86 vàng |
| `TQP_CLEAR_2` | Dạ Trạch Vương | Hoàn thành màn 2 chương Triệu Việt Vương | 86 vàng |
| `TQP_CHAPTER` | Triệu Việt Vương | Hoàn thành chương Triệu Việt Vương | 17 KC |
| `TQP_SPEED` | Xuất quỷ nhập thần | Tổng thời gian tốt nhất 3 màn dưới 15 phút | 8 KC |

- `TT_FLAWLESS` và `TT_SCHOLAR` giữ chung mọi chương — không tạo bản `TQP_` trùng nghĩa.
