# SỬ TA — CHƯƠNG 5: MAI HẮC ĐẾ (MAI THÚC LOAN)
# TASK CARD TỔNG: KẾ HOẠCH CHƯƠNG + NỘI DUNG CHỜ DUYỆT

TASK_ID: MHD-00 • Version 1.0 • 07/11/2026
Nguồn: Excel của team `DATA các nhân vật.xlsx`, sheet "5 Mai Hắc Đế" (ô A1 = bối cảnh + thiết kế). **Bộ câu hỏi Excel đã được thay** bằng 50 câu mới có nguồn ([RESEARCH_MHD_QUESTIONS.md](RESEARCH_MHD_QUESTIONS.md), người dùng duyệt 07/11/2026).
Mẫu tham chiếu: chương Triệu Việt Vương ([SUTA_TQP_TASK_00.md](SUTA_TQP_TASK_00.md), `js/levels/trieu-quang-phuc/`, rule `trieu-quang-phuc-gameplay.md`).

> Task card này **chỉ là tài liệu**. Mỗi giai đoạn code ở mục 2 có task card riêng, duyệt trước khi làm.
> Kế hoạch tổng **ĐÃ DUYỆT 07/11/2026** (người dùng).
> Khi làm MHD-SKELETON, người dùng **duyệt luôn** chia pool 3.3, tên 3 phần thưởng 3.4, tên 3 màn 5.1 và thưởng/thành tựu mục 9 (07/11/2026) để seed migration `009`.
> **Mục 4, 5.2–5.4 CHỜ TEAM DUYỆT**. Sau khi duyệt mới là Source of Truth, chép nguyên văn vào `dialogue-data.js` / `config.js` (rule `history-content.md`).

---

## 0. QUYẾT ĐỊNH ĐÃ CHỐT (07/11/2026)

| # | Quyết định |
|---|---|
| 1 | Người chơi vẫn là **nghĩa sĩ nam/nữ** (`PLAYER_MALE`/`PLAYER_FEMALE`). **Mai Thúc Loan là NPC dẫn màn 1** + nhân vật cutscene màn 3. NPC màn 2 nói với Mai Thúc Loan (như chương 4 nói với Triệu Quang Phục). |
| 2 | Slug **`mai-hac-de`**, khớp mục thư viện `library_heroes.json` và avatar `mai_hac_de.webp` đã có. |
| 3 | Thêm 2 cơ chế ngoài A1: **gánh cống phẩm mở màn** (không nói "vải": chuyện cống vải chưa có bằng chứng tin cậy, chốt 07/11) và **cứu dân phu / lòng dân**. Không làm dựng thành Vạn An, không làm bè sông Lam. |
| 4 | Giữ NPC người mẹ, ghi rõ "tương truyền", **đưa lên đầu**: Mẹ → Thúc Bảo → Sứ giả (Excel xếp mẹ sau cùng). |
| 5 | "Bom lửa" trong A1 đổi thành **hũ dầu lửa** (thế kỷ 8 chưa có thuốc súng — cùng lý do bỏ pháo hiệu ở chương 4). |
| 6 | Thống nhất mốc **713** theo sách giáo khoa (bùng nổ 713, thất bại 722), chốt lại 07/11 sau tra cứu, thay cho 722 theo Excel. Sửa `timeline.html`, `history.html`, `chapter.html`. |
| 7 | **Sách mở khoá NPC màn 2** 3 / 6 / 10 như chương 4 (A1: "đạt đủ số lượng sách"). |
| 8 | **50 câu**, soạn lại có nguồn (thay bộ Excel, 07/11/2026). Team tự sửa JSON. Đồ hoạ 32-bit hi-bit (Excel ghi "8-bit" là thiết kế cũ). |
| 9 | **Không import file nào của chương khác**; sprite dùng lại thì chép cùng ID. |

## 1. THÔNG SỐ CHƯƠNG

| Mục | Giá trị |
|---|---|
| Thư mục code | `frontend/static/js/levels/mai-hac-de/` |
| Id chương / key tiến trình | `5` / `mhd` (khoá `suta.mhd.progress`) |
| Level id | `501`, `502`, `503` (migration `009_mai_hac_de.sql`) |
| URL | `/gameplay/levels/mai-hac-de`, `…/2`, `…/3` |
| Template | `templates/gameplay/levels/mai-hac-de.html` kế thừa `gameplay/base.html` |
| Asset | `assets/images/mai-hac-de/sprites-32bit/manifest_mhd.json`, `maps-32bit/maps_mhd.json` |
| Câu hỏi | `assets/question/mai-hac-de-question.json` — bộ 50 câu ở RESEARCH_MHD_QUESTIONS.md → `python tools/make_question_data.py mai-hac-de`. `/quiz` thêm chương 5 (`QUIZ_BANKS` trong `quiz.js`) |
| Thư viện | `library_heroes.json` đã có mục `mai-hac-de` — không đụng |
| Trang chủ | thẻ trong `components/home/chapter.html` + `timeline.html` đang khoá → mở với `data-unlock-after="4"` ở MHD-L1 |
| Tiến trình | thêm trường `rescued` (migration `009`: cột `chapter_progress.rescued SMALLINT DEFAULT 0`; `emptyProgress()` trong `engine/progress.js`; `parse_progress`, `progress_repository.py`) |

## 2. LỘ TRÌNH

| Mã | Nội dung | Phụ thuộc |
|---|---|---|
| **MHD-00** | Task card này + team duyệt mục 3.3, 4, 5, 9 | — |
| **MHD-ART-BIBLE** | `/research`: giáp lính Đường, xe bắn tiễn, Sa Nam, Hùng Sơn, Tống Bình, trang phục dân phu Hoan Châu | — |
| **MHD-SKELETON** | **Xong 07/11** ([task card](SUTA_MHD_TASK_SKELETON_01.md), [report](REPORT_MHD-SKELETON.md)) — thư mục chương, `chapter.js`/`config.js`, template, route, migration `009`, `VALID_*`, thẻ trang chủ + timeline, JSON câu hỏi + `/quiz`, rule `.claude/rules/mai-hac-de-gameplay.md` (+ bảng rule `CLAUDE.md`), test. Chạy được bằng asset mượn | MHD-00 |
| **MHD-ENGINE** | **Xong 07/11** ([task card](SUTA_MHD_TASK_ENGINE_01.md), [report](REPORT_MHD-ENGINE.md)) — mục 3.5 | MHD-SKELETON |
| **MHD-L1** + `MHD_ART_01` | Màn 1 (mục 3.1) | SKELETON, ENGINE |
| **MHD-L2** + `MHD_ART_02` | Màn 2 (mục 3.2) | L1, mục 4 đã duyệt |
| **MHD-L3** + `MHD_ART_03` | Màn 3 boss Quang Sở Khách (mục 3.4) | L2 |
| Nhạc | Prompt Gemini 3 màn → team nộp `audio/mai-hac-de/level1–3.mp3` | — |

Mỗi giai đoạn: kế hoạch → duyệt → code → `pytest tests` + `/verify-ui` → `/task-report`. Thay đổi engine phải chơi lại các màn 4 chương trước và các layout thử (`?layout=p2`, `?layout=skills`, `?layout=engine`, `?viewer=1`).

---

## 3. THIẾT KẾ MÀN (DESIGN_BASELINE — số cụ thể chốt ở task card từng màn)

### 3.1 Màn 1 — "Gánh cống Hoan Châu" (tên nháp), 12 chunk
- Vùng cảnh: đường cống phẩm Hoan Châu → đèo núi → trạm gác nhà Đường.
- **Gánh cống phẩm (chunk 1–2, mới):** người chơi gánh sọt: đi chậm, không đánh, không lướt; lính áp giải quất roi thúc. Tới xe cống thì đập sọt, từ đó có đủ thao tác; Mai Thúc Loan dẫn thoại. Kiêm hướng dẫn phím.
- **Lòng dân (mới):** các xe cống phẩm giữ dân phu; đập xe thì dân phu chạy thoát, cộng điểm, lưu `rescued` (tối đa 5). Một số xe chở sách.
- 5 Quyển Sách Tinh Hoa, 4 bia câu hỏi, 1 điểm nghỉ chân. Chướng ngại xáo mỗi lượt trong vùng được phép.

| Excel | Cơ chế | Mới/có |
|---|---|---|
| Lính áp giải (nhanh, roi tầm trung) | `guard` + `rules` | có, sprite mới |
| Xe kéo cống phẩm | hazard có `hp` + `carrier` + thả dân phu (E5) | sửa nhỏ |
| Đá lăn đồi dốc | `roller` `OB_BOULDER` | có |
| Cung thủ núp lùm | thrower theo chu kỳ + bụi vẽ `afterPlayer` | có |
| Hổ dữ vồ từ hang | **hazard vồ vòng cung** (E2) + prop cửa hang | mới |
| Lính ném lao trên tháp | thrower `aim` + tháp + `PJ_SPEAR` | có |
| Mini-boss quan thu thuế | `patrol` 6 đòn, ném **hòm rỗng nằm lại cản đường** (E3) | sửa nhỏ |
| Kỵ binh phi ngang | `roller` nhanh, hitbox cao quá tầm nhảy → buộc lướt (lướt đang miễn sát thương), có báo trước | dữ liệu |

### 3.2 Màn 2 — "Dựng cờ Vạn An" (tên nháp), 10 chunk cố định
- Vùng cảnh: Hoan Châu → Sa Nam / dãy Hùng Sơn → bờ sông Lam.
- Rải 10 Quyển Sách Tinh Hoa; NPC cần đủ **3 / 6 / 10** quyển. Mỗi NPC 2 lính vây + 1 bia câu hỏi chặn đường. Chướng ngại lấy từ màn 1.

### 3.3 Câu hỏi — ĐÃ DUYỆT chia pool (07/11/2026)

**50 câu** (bộ mới, số thứ tự theo RESEARCH_MHD_QUESTIONS.md). Chia pool:

| Pool | Câu |
|---|---|
| `NPC_QUESTION_POOLS.maThi` (xuất thân) | 36–40 |
| `NPC_QUESTION_POOLS.thucBao` (căn cứ, thành Vạn An) | 41–45 |
| `NPC_QUESTION_POOLS.suGia` (ngoại giao, liên minh) | 46–50 |
| `LEVEL1_QUESTION_POOL` (rút 4 câu/lượt) | 1–35 |

### 3.4 Màn 3 — "Công phá Tống Bình" (tên nháp)
- Đấu trường 1 chunk: cổng phủ Đô hộ Tống Bình vỡ nát, cờ khởi nghĩa màu đen.
- **GĐ 1:** Quang Sở Khách núp sau xe bắn tiễn (chỉ vẽ), bắn loạt tên có vạch báo. 2 vệ sĩ khiên sắt gạt đòn chém. Lính trinh sát chết rơi **hũ dầu**; nhặt rồi bấm Đánh để ném (E1), trúng thì cháy khiên, vệ sĩ mới chém được.
- **GĐ 2:** xe húc thẳng. **Viện Binh** chặn xe → xe đứng khựng, nhảy lên bục gắn trên xe đánh cần điều khiển, 3 lượt. Chưa có kỹ năng (vào bằng `?layout`) thì xe tự đâm tường khựng ngắn, không kẹt màn.
- **Lòng dân:** `rescued` 0–1 / 2–3 / 4–5 → xe bị chặn 3 / 4 / 5 s.
- **GĐ 3:** xe hỏng, boss vác đại đao chém loạn, có khoảng hở sau mỗi nhát. Hết máu → cutscene (5.3, cờ Hắc Đế trên thành Tống Bình) → panel kết chương (5.4).
- Máu boss chọn sao cho +20 % thấy được (vd. 12 máu: 12 đòn → 10 đòn; lính ít máu có thể không đổi số đòn).
- Phần thưởng màn 2 (chỉ tác dụng màn 3):

| Id đề xuất | Tên | Loại | Từ NPC |
|---|---|---|---|
| `BUFF_MHD_POWER` | Ý chí dân nghèo (**nháp**, Excel không đặt tên) | bị động — đòn cơ bản +20 % | Mẹ Mai Thúc Loan |
| `SK_MHD_VAN_AN_SHELL` | Vỏ Bọc Vạn An | phím K — chặn trọn 1 đòn, hồi 12 s | Thúc Bảo |
| `SK_MHD_REINFORCE` | Viện Binh | phím L — dân quân tràn qua dọn lính, chặn xe, hồi 14 s | Sứ giả |

Excel ghi Vỏ Bọc "miễn nhiễm sát thương 1 lần": hiểu là 1 lần mỗi lượt kích hoạt, có hồi chiêu như khiên các chương trước.

### 3.5 MHD-ENGINE — cơ chế mới (dùng chung mọi chương)
1. **E1 Mang và ném**: nhặt vật, bấm Đánh để ném theo đường cong; khái quát từ hũ dầu trong boss chương 1.
2. **E2 Hazard vồ**: ẩn → báo trước → nhảy vòng cung → nghỉ (dựa trên mẫu `lurker`).
3. **E3 Đạn nằm lại**: đạn chạm đất thành vật cản tạm, chém vỡ được.
4. **E4 Gánh nặng**: `p.burden` giảm tốc, khoá đánh/lướt; chương bật và tắt được.
5. **E5 Sự kiện phá hazard**: hook khi vỡ để thả dân phu, đếm `state.rescued`.

Layout thử `?layout=engine` màn 1 chương 5 chạy đủ E1–E5.

---

## 4. NỘI DUNG MÀN 2 — CHỜ TEAM DUYỆT (tên phần thưởng đã duyệt)

Quy ước: ✅ đáp án đúng; câu **in nghiêng** lấy từ Excel ô A1 (mục 4.1 và lý do đúng 4.3 đã sửa chữ theo tra cứu 07/11), còn lại Claude soạn nháp. Thoại xưng hô với Mai Thúc Loan.

### 4.1 Mẹ Mai Thúc Loan (Mai Thị — Tương truyền)

**Thoại**
1. Mẹ: "Con về rồi đấy ư? Cả xóm đồn con đã đập vỡ sọt cống phẩm."
2. Mẹ: *"Con gánh cống phẩm đi nộp, thân làm phu phen khốn khổ. Cớ sao lại cản đường lính canh, chuốc lấy hiểm nguy cho bản thân?"*

**Câu hỏi:** Mai Thúc Loan trả lời mẹ thế nào?
- ✅ *Con thà đập vỡ sọt cống phẩm, chịu tội chém đầu còn hơn để bá tánh kiệt sức chết dọc đường. Ý chí của dân nghèo bị dồn vào chân tường là vũ khí mạnh nhất.*
- ❌ "Con chỉ lỡ tay, xin mẹ để con đi xin tội với lính canh."
- ❌ "Con sẽ bỏ xứ đi nơi khác, mặc cho dân phu gánh tiếp."

**Gợi ý khi sai:** Dân phu đang kiệt sức dọc đường. Ai sẽ đứng ra vì họ?

**Vì sao đúng:** *Sự phẫn nộ và quyết đoán đập vỡ cống phẩm là ngòi nổ tập hợp lòng dân của Mai Hắc Đế.*

**Phần thưởng:** Ý chí dân nghèo. Trong trận đánh, sức mạnh đòn đánh cơ bản tăng 20%.

### 4.2 Hào kiệt Thúc Bảo (Người bạn chiến đấu đắc lực)

> **Chờ team cho biết nguồn** về Thúc Bảo (mục 7). Không có nguồn trước MHD-L2 thì đổi NPC, xem RESEARCH_MHD_QUESTIONS.md mục 2.

**Thoại**
1. Thúc Bảo: "Anh em đã tụ về đông lắm, nhưng chưa có chỗ đứng chân."
2. Thúc Bảo: *"Nhà Đường tất sẽ điều đại quân từ phương Bắc xuống đàn áp. Vùng Hoan Châu ta đất rộng người thưa, ta nên lập căn cứ ở đâu để thủ hiểm dài lâu?"*

**Câu hỏi:** Mai Thúc Loan chọn lập căn cứ ở đâu?
- ✅ *Chọn vùng Sa Nam, dựa vào dãy Hùng Sơn hiểm trở và dòng sông Lam làm hào nước tự nhiên để xây dựng thành Vạn An phòng ngự kiên cố.*
- ❌ "Đóng quân giữa đồng bằng trống trải cho dễ tiến thoái."
- ❌ "Chia quân về từng làng, không cần căn cứ chung."

**Gợi ý khi sai:** Cần nơi có núi dựa lưng và sông che trước mặt.

**Vì sao đúng:** *Địa thế Sa Nam (Nam Đàn) "công thủ toàn diện" là lựa chọn chiến lược vĩ đại của Mai Thúc Loan.*

**Phần thưởng:** Vỏ Bọc Vạn An. Trong trận đánh, bấm K để miễn nhiễm sát thương 1 lần.

### 4.3 Sứ giả nước Lâm Ấp

> Excel ghi "Lâm Ấp / Chân Lạp". Bản nháp dùng một sứ giả Lâm Ấp; đáp án vẫn nhắc cả hai nước.

**Thoại**
1. Sứ giả: "Tiếng tăm nghĩa quân Hoan Châu đã vang tới phương Nam."
2. Sứ giả: *"Nước ngài quân lực dẫu đang lên nhưng so với triều đình nhà Đường vẫn chỉ là lấy trứng chọi đá. Làm sao để phá vỡ thế bị bao vây cô lập?"*

**Câu hỏi:** Mai Thúc Loan sẽ làm gì?
- ✅ *Phái sứ giả giao hảo, kết minh với Lâm Ấp, Chân Lạp ở phía Nam và các thủ lĩnh miền núi để tạo thế gọng kìm, khiến giặc phải phân tán lực lượng.*
- ❌ "Một mình chống giặc, không cần cầu viện ai."
- ❌ "Đem vàng bạc sang nộp cho nhà Đường để xin hoà."

**Gợi ý khi sai:** Một mình khó chống nổi nhà Đường. Hãy tìm đồng minh.

**Vì sao đúng:** *Mai Hắc Đế có tầm nhìn ngoại giao xuất sắc, kết minh với Lâm Ấp, Chân Lạp ở phía Nam.*
> Đã bỏ con số "32 vạn" của Excel vì không có nguồn.

**Phần thưởng:** Viện Binh. Trong trận đánh, bấm L gọi viện binh dọn lính.

---

## 5. CÂU CHỮ KHÁC — CHỜ TEAM DUYỆT, TRỪ 5.1 TÊN MÀN (Claude soạn nháp từ A1)

### 5.1 Thông báo đầu màn
- Màn 1: "Màn 1: Gánh cống Hoan Châu — Năm 713, nhà Đường đô hộ nước ta. Hãy cùng Mai Thúc Loan phá đoàn cống phẩm, thu đủ 5 Quyển Sách Tinh Hoa."
- Màn 2: "Màn 2: Dựng cờ Vạn An"
- Màn 3: "Màn 3: Công phá Tống Bình"

### 5.2 Thoại Mai Thúc Loan dẫn màn 1
1. Mai Thúc Loan: "Ta là Mai Thúc Loan, người dân phu Hoan Châu. Bà con đang gánh cống phẩm dưới đòn roi lính canh."
2. Mai Thúc Loan: "Tới xe cống phía trước, hãy đập vỡ sọt cống phẩm và giải phóng dân phu!"

Thoại hướng dẫn phím đoạn gánh cống phẩm chốt ở MHD-L1 (không phải nội dung lịch sử).

### 5.3 Cutscene màn 3 (câu 1 lấy từ A1)
1. "Quang Sở Khách bỏ vũ khí, lên ngựa mở cổng thành tẩu thoát về nước."
2. "Cờ Hắc Đế tung bay trên thành Tống Bình."

> Không để xưng đế ở đây: sách giáo khoa gắn việc xưng đế với thành Vạn An (chốt 07/11).

### 5.4 Panel kết chương
- Tiêu đề: "Hoàn thành chương Mai Hắc Đế"
- Dòng 1: `Bạn đã cùng Mai Thúc Loan giải phóng thành Tống Bình và đạt ${score} điểm.`
- Dòng 2 (lấy từ giải thích câu 12, 16): "Từ căn cứ Sa Nam với thành Vạn An, Mai Hắc Đế tiến đánh và giải phóng thành Tống Bình, thủ phủ chính quyền đô hộ."

---

## 6. ASSET (đề xuất — chốt ID trong prompt Codex từng đợt bằng `/codex-prompt`, không tạo ID gần giống ID đã có)

**Chép cùng ID, không vẽ mới:** `EN_TIGER`, `OB_TRIBUTE_CART`, `PJ_SPEAR`, `PJ_OIL_JAR`, `FX_OIL_FIRE` (chương 1); `OB_BOULDER`, `ITEM_LND_HEAL` (chương 3); `FX_BT_ARMOR_SPARK` (chương 2–4). Map mượn qua `BORROWED_MAPS`: trời, tile, sách, bia câu hỏi.

| Đợt | Nội dung |
|---|---|
| `MHD_ART_01` | [Prompt](CODEX_PROMPT_MHD_ART_01.md) (chờ giao Codex). NPC + chân dung Mai Thúc Loan (theo avatar thư viện, nước da đen); animation gánh cống phẩm cho `PLAYER_MALE`/`PLAYER_FEMALE` (`manifest_shared.json`); lính áp giải cầm roi; dân phu; cung thủ, lính ném lao, kỵ binh Đường; quan thu thuế + hòm rỗng; `pounce` cho `EN_TIGER`; cửa hang; nền Hoan Châu + đèo |
| `MHD_ART_02` | 3 NPC + chân dung (mẹ, Thúc Bảo, sứ giả); nền Sa Nam / sông Lam; FX + icon 3 phần thưởng |
| `MHD_ART_03` | Quang Sở Khách (đứng, đại đao, lên ngựa) + chân dung; xe bắn tiễn; vệ sĩ khiên sắt; lính trinh sát; cờ đen; nền cổng Tống Bình; dân quân Viện Binh |

## 7. VIỆC CHỜ TEAM

- [x] Duyệt chia pool câu hỏi (mục 3.3) — 07/11/2026 (người dùng).
- [x] Duyệt tên 3 màn (5.1), tên 3 phần thưởng (3.4) — 07/11/2026 (người dùng).
- [ ] Duyệt mục 4 và 5.1 (câu mô tả màn 1), 5.2–5.4 (thoại, đáp án sai, gợi ý, cutscene, panel kết chương).
- [x] Duyệt thưởng vàng / thành tựu (mục 9) — 07/11/2026 (người dùng).
- [x] Câu hỏi: bộ Excel đã thay bằng 50 câu có nguồn (07/11/2026). Số câu trong bảng dưới là **số Excel cũ**, bảng giữ lại để tra lý do; đối chiếu đầy đủ ở RESEARCH_MHD_QUESTIONS.md mục 4.
- [x] 4 điểm thiết kế ở RESEARCH_MHD_QUESTIONS.md mục 2 chốt theo đề xuất (07/11/2026).
- [ ] **Team cho biết nguồn về Thúc Bảo** trước MHD-L2 (cả trang thư viện đang nhắc tên này).

| # | Câu/ô | Vấn đề |
|---|---|---|
| 1 | 8 | Dương Quý Phi [sinh năm 719](https://en.wikipedia.org/wiki/Yang_Guifei), năm 722 mới khoảng 3 tuổi: "cống vải cho Dương Quý Phi" lệch niên đại với cuộc khởi nghĩa |
| 2 | 9, 27 | Câu 9 ghi 722, câu 27 ghi độc lập 713–722. Các nguồn cũng [chia hai phía](https://tienphong.vn/xa-hoi/phong-su/615043/Viet-nhan-1300-nam-mot-su-kien-tpp.html). Game hiển thị 713 (quyết định 6) |
| 3 | 7, A1 | "Vải thiều" có thể là tên muộn hơn thời này; nên cân nhắc "vải tống"/"vải". Claude chưa tra nguồn, team kiểm |
| 4 | 14, A1 | "32 vạn" có thể nhầm với "32 châu" trong sử nhà Đường; chưa tìm được nguồn xác nhận con số quân |
| 5 | A1 | Có [nguồn](https://baohatinh.vn/mai-thuc-loan-the-ky-viii-post47572.html) chép ông mồ côi từ nhỏ, xung đột NPC người mẹ (quyết định 4: giữ, ghi "tương truyền") |
| 6 | A1 | Có nguồn ghi ông xưng đế và lấy thành Vạn An làm quốc đô; A1 + thư viện đặt việc xưng đế sau trận Tống Bình. Game đã bỏ cảnh xưng đế ở Tống Bình (mục 5.3) |
| 7 | 13, 34 | "Nhà Đường mệnh Hỏa": chưa có nguồn, cần team kiểm |
| 8 | 38 | Lời nhận định của Lê Văn Hưu: chưa có nguồn |
| 9 | 49 | Việc bỏ lệ cống vải: nguồn tra được chỉ ghi "tương truyền", câu hỏi ghi như sự kiện chắc chắn |
| 10 | 26, 41 | Tên huyện/quận/thị trấn có thể đã đổi sau sắp xếp hành chính 2025 |
| 11 | 6, 7 (cột H) | Lỗi gõ lặp "đô hộ đô hộ", "cống nạp nạp": không tự sửa |

## 8. GATE MHD-00
1. Team duyệt mục 4, 5 (3.3, 9 và tên màn, tên phần thưởng đã duyệt 07/11/2026).
2. Sau khi duyệt, nội dung mục 4–5 thành **Source of Truth**, chép nguyên văn vào `dialogue-data.js`.

## 9. THƯỞNG VÀNG / THÀNH TỰU CHƯƠNG 5 — ĐÃ DUYỆT 07/11/2026 (`DESIGN_BASELINE`)

Nguyên tắc như chương 3–4: chương sau thưởng cao hơn chương trước ~20%; cùng khuôn thành tựu; chỉ dùng dữ liệu server đã có.

| Màn | Chương 4 (đối chiếu) | Chương 5 đề xuất |
|---|---|---|
| 1 | 173 vàng | **208 vàng** |
| 2 | 259 vàng | **311 vàng** |
| 3 | 346 vàng + 12 KC | **415 vàng + 14 KC** |
| Tổng | 778 vàng + 12 KC | **934 vàng + 14 KC** |

| Code | Tên | Điều kiện | Thưởng |
|---|---|---|---|
| `MHD_CLEAR_1` | Gánh cống Hoan Châu | Hoàn thành màn 1 chương Mai Hắc Đế | 103 vàng |
| `MHD_CLEAR_2` | Dựng cờ Vạn An | Hoàn thành màn 2 chương Mai Hắc Đế | 103 vàng |
| `MHD_CHAPTER` | Hắc Đế | Hoàn thành chương Mai Hắc Đế | 20 KC |
| `MHD_SPEED` | Thần tốc ra Bắc | Tổng thời gian tốt nhất 3 màn dưới 15 phút | 10 KC |

- `TT_FLAWLESS` và `TT_SCHOLAR` giữ chung mọi chương — không tạo bản `MHD_` trùng nghĩa.
