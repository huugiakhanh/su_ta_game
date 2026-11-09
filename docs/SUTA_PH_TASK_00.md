# SỬ TA — CHƯƠNG 6: PHÙNG HƯNG (BỐ CÁI ĐẠI VƯƠNG)
# TASK CARD TỔNG: KẾ HOẠCH CHƯƠNG + NỘI DUNG CHỜ DUYỆT

TASK_ID: PH-00 • Version 1.0 • 09/11/2026
Nguồn: Excel của team `DATA các nhân vật.xlsx`, sheet "6 Phùng Hưng" (ô A1 = bối cảnh + thiết kế; 50 câu tham khảo). Tra cứu: [RESEARCH_PH_QUESTIONS.md](RESEARCH_PH_QUESTIONS.md).
Mẫu tham chiếu: chương Mai Hắc Đế ([SUTA_MHD_TASK_00.md](SUTA_MHD_TASK_00.md), `js/levels/mai-hac-de/`).

> Task card này **chỉ là tài liệu**. Mỗi giai đoạn code ở mục 2 có task card riêng, duyệt trước khi làm.
> **ĐÃ DUYỆT toàn bộ 09/11/2026** (người dùng): kế hoạch tổng, Q1–Q5, mục 3.3, 3.4, 4, 5, 8 và đối chiếu 50 câu. Mục 4–5 + bộ câu hỏi là Source of Truth, chép nguyên văn vào `dialogue-data.js` / `config.js` (rule `history-content.md`).

---

## 0. QUYẾT ĐỊNH

### Đã chốt (09/11/2026)

| # | Quyết định |
|---|---|
| 1 | Người chơi là **nghĩa sĩ nam/nữ** (`PLAYER_MALE`/`PLAYER_FEMALE`). Phùng Hưng là NPC dẫn màn 1 + nhân vật cutscene màn 3 |
| 2 | Slug `phung-hung`, khớp mục thư viện và avatar `phung_hung.png` đã có |
| 3 | Câu hỏi: tra nguồn từng câu, giữ câu đúng, chỉ thay câu sai/lạc đề, đủ 50 câu |
| 4 | **Sách + Vũ Khí Thô Sơ cùng mở khoá NPC** màn 2 |
| 5 | Thêm ngoài A1: bù nhìn rơm nhử hổ, cưỡi trâu đã thu phục. Không làm đốt kho lương, không làm đấm trống đúng nhịp |
| 6 | Đồ hoạ 32-bit hi-bit (Excel ghi "8-bit" là thiết kế cũ). Không import file của chương khác; sprite dùng lại thì chép cùng ID |

### Đã chốt theo đề xuất 09/11/2026 (phát hiện khi tra cứu, RESEARCH mục 2)

| # | Vấn đề | Quyết định |
|---|---|---|
| Q1 | Hiệu Bố Cái do Phùng An tôn **sau khi ông mất**, A1 đặt ngay ở Tống Bình | Cutscene không suy tôn; ghi việc tôn hiệu ở panel kết chương (mục 5.3) |
| Q2 | Bồ Phá Cần chỉ có tư liệu về việc lập Phùng An, không có tư liệu nghi binh | Giữ NPC như thư viện, thoại ghi "tương truyền" (mục 4.3) |
| Q3 | "Cắt tiếp tế" không có nguồn, chỉ có "vây phủ đô hộ" | Đáp án NPC 2 xoay quanh việc vây phủ (mục 4.2); kỹ năng vẫn tên "Khóa Lương" |
| Q4 | Giai thoại đánh hổ không có chi tiết nhảy từ trên cao; **thay cho phương án đòn bổ trong kế hoạch ban đầu** | Hổ vồ bù nhìn thì khựng, đứng cạnh dùng **đòn gồng** thay vì đòn bổ. Bớt bục cao |
| Q5 | Thư viện `phung-hung` viết "được suy tôn" khi vào Tống Bình | Team quyết; Claude không tự sửa `library_heroes.json` |

## 1. THÔNG SỐ CHƯƠNG

| Mục | Giá trị |
|---|---|
| Thư mục code | `frontend/static/js/levels/phung-hung/` |
| Id chương / key tiến trình | `6` / `ph` (khoá `suta.ph.progress`) |
| Level id | `601`, `602`, `603` (migration `011_phung_hung.sql`) |
| URL | `/gameplay/levels/phung-hung`, `…/2`, `…/3` |
| Template | `templates/gameplay/levels/phung-hung.html` kế thừa `gameplay/base.html` |
| Asset | `assets/images/phung-hung/sprites-32bit/manifest_ph.json`, `maps-32bit/maps_ph.json` |
| Câu hỏi | `assets/question/phung-hung-question.json` → `python tools/make_question_data.py phung-hung`; thêm vào `QUIZ_BANKS` trong `quiz.js` |
| Thư viện | `library_heroes.json` đã có mục `phung-hung`; không đụng (xem Q5) |
| Trang chủ | thẻ `chapter.html` + `timeline.html` đang khoá → `data-unlock-after="5"`, `data-hero`, `data-route`. Mốc năm giữ **791** |

## 2. LỘ TRÌNH

| Mã | Nội dung | Phụ thuộc |
|---|---|---|
| **PH-00** | **Xong 09/11**: task card này + RESEARCH, đã duyệt hết | — |
| **PH-SKELETON** | **Xong 09/11** ([task card](SUTA_PH_TASK_SKELETON_01.md), [report](REPORT_PH-SKELETON.md)) Thư mục chương, template, route `pages.py`, migration `011`, `VALID_*` trong `api.py`, `game_service.py`, thẻ trang chủ, JSON câu hỏi + script, `QUIZ_BANKS`, rule `.claude/rules/phung-hung-gameplay.md` (+ bảng rule `CLAUDE.md`), test | PH-00 |
| **PH-ENGINE** | **Xong 09/11** ([task card](SUTA_PH_TASK_ENGINE_01.md), [report](REPORT_PH-ENGINE.md)) E1–E6 (mục 3.5) | SKELETON |
| **PH-L1** + `PH_ART_01` | **Xong phần code 09/11, chờ chơi tay** ([task card](SUTA_PH_TASK_L1_01.md), [report](REPORT_PH-L1.md)) Màn 1 | SKELETON, ENGINE |
| **PH-L2** + `PH_ART_02` | **Xong phần code 09/11, chờ chơi tay** ([task card](SUTA_PH_TASK_L2_01.md), [report](REPORT_PH-L2.md)) Màn 2 | L1, mục 4 đã duyệt |
| **PH-L3** + `PH_ART_03` | Màn 3 + cutscene | L2 |
| Nhạc | Prompt Gemini, team nộp `audio/phung-hung/level1–3.mp3` | — |

Mỗi giai đoạn: kế hoạch → duyệt → code → `pytest tests` + `/verify-ui` → `/task-report`. Đổi engine thì chơi lại các màn 5 chương trước và các layout thử (`?layout=p2`, `?layout=skills`, `?layout=engine`, `?viewer=1`).

---

## 3. THIẾT KẾ MÀN (DESIGN_BASELINE, số cụ thể chốt ở task card từng màn)

### 3.1 Màn 1, 12 chunk
Vùng cảnh: làng Đường Lâm → đồi đá ong → ải thu thuế. Phùng Hưng dẫn đầu màn. 5 Quyển Sách Tinh Hoa, 4 bia câu hỏi.

| A1 | Cơ chế | Mới/có |
|---|---|---|
| Mãnh hổ (mini-boss, chunk 3–4) | Đấu trường nhỏ có bù nhìn rơm; hổ vồ trúng bù nhìn thì khựng; đòn gồng mới mất máu (Q4) | `pounce` có + E4 |
| Trâu mộng nổi điên | Lao thẳng; đòn gồng đúng lúc thì thu phục, cưỡi đoạn ngắn húc văng lính, rào | E1, E2 |
| Lính tuần giáo | `guard` | có |
| Xe thuế muối | Đẩy xe húc lính gác để qua ải, chunk cuối | E3 |
| Đá tảng đá ong | Báo trước, rơi chặn đường, đấm vỡ | `snare` + hp |
| Thợ săn trên cây | Thrower `aim` | có, sprite mới |
| Hào chông tre | Khe rộng phải nhảy + lướt; rơi −1 máu, về chỗ đứng vững | E5 |
| Lính khiên | Gạt đòn thường, chỉ vỡ bởi đòn gồng | E1 |

Đòn gồng: giữ J khoảng 0,7 s rồi thả. Dạy theo thứ tự hổ → lính khiên → trâu.

### 3.2 Màn 2, 10 chunk cố định
Vùng cảnh: Đường Lâm → đường tiếp tế → ngoại thành Tống Bình. Rải 10 sách + 3 Vũ Khí Thô Sơ. NPC cần 3 sách + 1 vũ khí / 6 + 2 / 10 + 3. Mỗi NPC 2 lính vây + 1 bia.

### 3.3 Câu hỏi: chia pool (ĐÃ DUYỆT 09/11/2026, số theo STT)

| Pool | Câu |
|---|---|
| `NPC_QUESTION_POOLS.phungHai` (sức vóc, gia đình) | 7, 8, 10, 28, 42 |
| `NPC_QUESTION_POOLS.doAnhHan` (mưu vây Tống Bình) | 6, 9, 13, 34, 43 |
| `NPC_QUESTION_POOLS.boPhaCan` (hậu sự, kế vị) | 17, 18, 38, 46, 49 |
| `LEVEL1_QUESTION_POOL` (rút 4 câu/lượt) | 35 câu còn lại |

### 3.4 Màn 3, đấu trường 1 chunk
Tường phủ thành Tống Bình ban đêm, lửa đuốc, rung màn hình theo tiếng trống (`shakeCamera`). Cao Chính Bình ở trong lầu, không đánh trực tiếp; thanh **Nỗi sợ hãi** thay máu (`hooks.updateHud`).
- **GĐ 1:** né đá rơi (`snare`), nước sôi (`vent` có báo trước), cung thủ trên tường. Lính rơi đuốc (`hooks.dropCarry`), ném vào 4 trụ gác (`carry.js`).
- **GĐ 2:** cả 4 trụ cháy thì 2 trống đồng hai bên mở. Mỗi cú đấm tăng Sợ hãi; phải luân phiên trái/phải, trống vừa đấm không tính tiếp.
- **GĐ 3:** đầy thanh → cutscene (5.2) → panel kết chương (5.3).
- Chưa có kỹ năng (vào bằng `?layout`) thì vẫn qua được.

Phần thưởng màn 2 (chỉ tác dụng màn 3):

| Id đề xuất | Tên (A1) | Loại | Từ NPC |
|---|---|---|---|
| `BUFF_PH_POWER` | Sức Địch Ngàn Người (A1 không đặt tên, duyệt 09/11/2026) | bị động: sát thương ×2 với lính; mỗi cú đấm trống tính ×1,5 (boss không có máu) | Phùng Hải |
| `SK_PH_SUPPLY_CUT` | Khóa Lương | K: làm chậm địch và đạn, 6 s, hồi 14 s | Đỗ Anh Hàn |
| `SK_PH_FIRE_DRUM` | Hỏa Trận Trống Đồng | L: lính choáng hoảng loạn 3 s diện rộng, cộng Sợ hãi, hồi 18 s | Bồ Phá Cần |

### 3.5 PH-ENGINE: cơ chế mới (dùng chung)

| Mã | Nội dung |
|---|---|
| E1 | Đòn gồng + cờ `chargeOnly` theo mẫu `plungeOnly`; giữ phím, cả nút cảm ứng |
| E2 | Thu phục + cưỡi: `tameable`, `state.mount`, va chạm phá `rammable`, hết giờ thì xuống |
| E3 | Vật đẩy được, húc lính, dừng ở mép hố (mở rộng `blocking`) |
| E4 | `pounce` ưu tiên mồi nhử; trạng thái `stuck` mới chịu đòn gồng |
| E5 | Cột chông `'^'` trong lưới địa hình |
| E6 | 2 loại vật phẩm, NPC `requires` nhiều loại, ô đếm thứ 2 trên HUD |

Layout thử `?layout=engine` màn 1 chương 6 chạy đủ E1–E6.

---

## 4. NỘI DUNG MÀN 2 — ĐÃ DUYỆT 09/11/2026 (người dùng duyệt nguyên văn)

Quy ước: ✅ đáp án đúng. Câu **in nghiêng** lấy nguyên văn Excel ô A1; còn lại Claude soạn nháp. Thoại nói với Phùng Hưng.

### 4.1 Phùng Hải

**Thoại**
1. Phùng Hải: "Anh ơi, trai làng đã tụ về đầy sân."
2. Phùng Hải: *"Quân Đường đông đúc, anh em ta tuy khỏe nhưng tay không tấc sắt, làm sao chống lại giáo mác của giặc?"*

**Câu hỏi:** Phùng Hưng trả lời em thế nào?
- ✅ *Lấy sức người bù đắp vũ khí. Ban ngày vác gỗ, ban đêm xô trâu để rèn luyện gân cốt. Biến cuốc xẻng, gậy gộc của dân cày thành vũ khí bén nhọn nhất bằng sức mạnh đoàn kết.*
- ❌ "Chờ khi nào có đủ giáo mác hẵng tính."
- ❌ "Anh em ta về nhà làm ruộng, mặc kệ quan đô hộ."

**Gợi ý khi sai:** Không có giáo mác thì còn có gì trong tay dân làng?

**Vì sao đúng:** *Sự rèn luyện thể chất phi thường của anh em họ Phùng là nền tảng ban đầu của nghĩa quân.*
> Lưu ý: "vác gỗ, xô trâu" không có trong nguồn đã tra (sử chép "vật trâu, đánh hổ"). Người dùng duyệt giữ nguyên A1 (09/11/2026).

**Phần thưởng:** Sức Địch Ngàn Người. Trong trận đánh, sát thương đòn đánh tăng gấp đôi.

### 4.2 Đỗ Anh Hàn

**Thoại**
1. Đỗ Anh Hàn: "Ta cùng làng với ông, có một kế muốn bàn."
2. Đỗ Anh Hàn: *"Cao Chính Bình đang vơ vét tàn bạo, dân chúng oán thán tận trời. Nhưng Tống Bình thành cao hào sâu, nay nên dùng mưu kế gì để công phá?"*

**Câu hỏi:** Phùng Hưng chọn kế nào?
- ✅ "Không vội đánh thẳng vào thành. Đem quân vây chặt phủ đô hộ, để giặc trong thành hoang mang mà tự suy sụp." (**Claude sửa theo Q3**; A1 ghi: chiếm vùng xung quanh, cắt đường tiếp tế, chờ trong thành cạn lương.)
- ❌ "Dồn hết quân đánh thẳng vào cổng thành ngay trong đêm nay."
- ❌ "Gửi thư xin Cao Chính Bình giảm thuế rồi chờ."

**Gợi ý khi sai:** Thành cao hào sâu thì đánh thẳng sẽ tổn thất lớn.

**Vì sao đúng:** "Theo Cương mục, Phùng Hưng dùng kế của Đỗ Anh Hàn, đem quân vây phủ đô hộ."

**Phần thưởng:** Khóa Lương. Trong trận đánh, bấm K để làm chậm địch.

### 4.3 Bồ Phá Cần (tương truyền)

**Thoại**
1. Bồ Phá Cần: "Tương truyền đêm ấy, lửa cháy khắp bốn phía thành."
2. Bồ Phá Cần: *"Khi vòng vây đã khép chặt, Cao Chính Bình đóng chặt cổng thành không ra, viện binh nhà Đường có thể đến bất cứ lúc nào. Ta phải làm sao?"*

**Câu hỏi:** Phùng Hưng sẽ làm gì?
- ✅ *Dùng kế nghi binh, ban đêm đốt lửa khắp bốn phía thành, đánh trống hò reo vang trời tạo thế trận áp đảo, dùng tâm lý chiến để bẻ gãy ý chí của giặc.*
- ❌ "Giải vây, rút quân về Đường Lâm để tránh viện binh."
- ❌ "Cho quân nghỉ ngơi, đợi giặc tự mở cổng."

**Gợi ý khi sai:** Giặc đang sợ. Làm sao cho chúng sợ hơn?

**Vì sao đúng:** *Áp lực tâm lý đã khiến viên Đô hộ Cao Chính Bình hoảng sợ sinh bệnh mà chết.*

**Phần thưởng:** Hỏa Trận Trống Đồng. Trong trận đánh, bấm L khiến quân địch hoảng loạn.

---

## 5. CÂU CHỮ KHÁC — ĐÃ DUYỆT 09/11/2026 (người dùng duyệt nguyên văn)

### 5.1 Tên màn + thông báo + thoại dẫn
- Màn 1: "Màn 1: Trai tráng Đường Lâm — Nửa cuối thế kỷ 8, nhà Đường đô hộ nước ta. Hãy cùng Phùng Hưng bảo vệ dân làng, thu đủ 5 Quyển Sách Tinh Hoa."
- Màn 2: "Màn 2: Tụ nghĩa chiêu hiền"
- Màn 3: "Màn 3: Vây phủ Tống Bình"
- Phùng Hưng dẫn màn 1: "Ta là Phùng Hưng, người Đường Lâm. Quan đô hộ Cao Chính Bình thu thuế nặng, dân làng khốn khổ." / "Tương truyền hổ dữ quen vồ bù nhìn rơm. Hãy nhử nó tới, giữ J rồi thả để tung đòn gồng!"

### 5.2 Cutscene màn 3
1. "Cao Chính Bình lo sợ phát bệnh, gục ngã trong lầu gác."
2. "Cổng thành mở tung. Phùng Hưng tiến vào phủ đô hộ giữa tiếng hò reo."

### 5.3 Panel kết chương
- Tiêu đề: "Hoàn thành chương Phùng Hưng"
- Dòng 1: `Bạn đã cùng Phùng Hưng làm chủ phủ đô hộ Tống Bình và đạt ${score} điểm.`
- Dòng 2: "Sau khi ông mất, con là Phùng An tôn ông làm Bố Cái Đại Vương. Theo sử cũ, bố là cha, cái là mẹ."

## 6. ASSET (chốt ID bằng `/codex-prompt` từng đợt, không tạo ID gần giống ID đã có)

**Chép cùng ID, không vẽ mới:** `EN_TIGER`, `OB_BOULDER`, `EN_TANG_SHIELD_GUARD`, lính Đường chương 5 phù hợp. Map mượn: `BG_TQP_SKY_NIGHT`, tile, sách, bia câu hỏi.

| Đợt | Nội dung |
|---|---|
| `PH_ART_01` | (prompt đã xoá, kết quả soát ở [REPORT_PH-L1.md](REPORT_PH-L1.md); Gate A1 đạt sau 2 lượt sửa, người dùng giữ, đã `IN_GAME` 09/11/2026; Gate A2 đạt sau 1 lượt sửa, đã `IN_GAME`; người dùng chốt giữ `OB_PH_SALT_CART` 4 bánh, khác prompt mục 6.4) Phùng Hưng + chân dung (theo avatar `phung_hung.png`); trâu mộng (lao, bị gạt, cưỡi); bù nhìn rơm; xe thuế muối; lính giáo; thợ săn trên cây; đá ong rơi; rào; hào chông; nền Đường Lâm + đồi đá ong + ải; animation gồng, cưỡi cho `PLAYER_MALE`/`PLAYER_FEMALE` (`manifest_shared.json`) |
| `PH_ART_02` | (prompt đã xoá; Gate B1, B2 đã `IN_GAME` 09/11/2026, B1 sửa màu 1 lượt, B2 sửa vật phẩm 1 lượt) 3 NPC + chân dung; `ITEM_PH_WEAPON`; nền đường tiếp tế + ngoại thành; FX + icon 3 phần thưởng |
| `PH_ART_03` | Cao Chính Bình trong lầu; tường phủ thành ban đêm; trụ gác (thường/cháy); trống đồng; đuốc; nước sôi; cổng mở; Phùng Hưng cutscene |

## 7. VIỆC CHỜ DUYỆT

- [x] Chốt Q1–Q5 theo đề xuất (mục 0) — 09/11/2026 (người dùng).
- [x] Duyệt đối chiếu 50 câu ([RESEARCH](RESEARCH_PH_QUESTIONS.md) mục 4–6) + chia pool 3.3 — 09/11/2026 (người dùng).
- [x] Duyệt mục 4 (thoại NPC), mục 5 (tên màn, cutscene, panel) — 09/11/2026 (người dùng).
- [x] Duyệt tên 3 phần thưởng + cách tính ×2 / ×1,5 (3.4) — 09/11/2026 (người dùng).
- [x] Duyệt thưởng/thành tựu mục 8 — 09/11/2026 (người dùng).

## 8. THƯỞNG VÀNG / THÀNH TỰU CHƯƠNG 6 — ĐÃ DUYỆT 09/11/2026 (`DESIGN_BASELINE`)

Chương sau thưởng cao hơn chương trước ~20%; cùng khuôn thành tựu; chỉ dùng dữ liệu server đã có.

| Màn | Chương 5 (đối chiếu) | Chương 6 đề xuất |
|---|---|---|
| 1 | 208 vàng | **250 vàng** |
| 2 | 311 vàng | **373 vàng** |
| 3 | 415 vàng + 14 KC | **498 vàng + 16 KC** |
| Tổng | 934 vàng + 14 KC | **1121 vàng + 16 KC** |

| Code | Tên | Điều kiện | Thưởng |
|---|---|---|---|
| `PH_CLEAR_1` | Trai tráng Đường Lâm | Hoàn thành màn 1 chương Phùng Hưng | 124 vàng |
| `PH_CLEAR_2` | Tụ nghĩa chiêu hiền | Hoàn thành màn 2 chương Phùng Hưng | 124 vàng |
| `PH_CHAPTER` | Bố Cái Đại Vương | Hoàn thành chương Phùng Hưng | 20 KC |
| `PH_SPEED` | Thần tốc vây thành | Tổng thời gian tốt nhất 3 màn dưới 15 phút | 10 KC |

`TT_FLAWLESS` và `TT_SCHOLAR` giữ chung mọi chương; không tạo bản `PH_` trùng nghĩa.

## 9. GATE PH-00
1. Các mục ở mục 7 đã duyệt hết (09/11/2026): **gate đạt**.
2. Nội dung mục 4–5 + bộ câu hỏi là **Source of Truth**, chép nguyên văn vào dữ liệu chương.
