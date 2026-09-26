# SỬ TA — CHƯƠNG TRƯNG TRẮC
# TASK CARD: TÁCH CHƯƠNG THÀNH 3 MÀN — SỬA MÀN 1 VÀ LÀM MÀN 2 "CHIÊU MỘ HIỀN TÀI"

TASK_ID: TT-NPC-01 • Version 2.0 • 25/09/2026 (thay thế hoàn toàn bản 1.0)
Thư mục code hiện tại: `frontend/static/js/levels/trung-trac/`
Tài liệu (READ-ONLY): `CLAUDE.md`, `SUTA_TT_SPRITE_BRIEF.md`, `SUTA_TT_MAP_BRIEF.md`, `docs/REPORT_TT-INT-01.md`, `docs/REPORT_TT-MAP-01.md`

---

## 0. MỤC TIÊU

Team quyết định chia chương Trưng Trắc thành 3 màn:

| Màn | Nội dung | Task |
|---|---|---|
| **Màn 1 — Vượt ải** | Vượt chướng ngại, nhặt đủ 5 binh thư, hạ **mini-boss kiệu quan**, qua cổng thành | Task này (Phase A) |
| **Màn 2 — Chiêu mộ hiền tài** | Đi cảnh ngắn có chướng ngại nhẹ, gặp lần lượt Thi Sách → Lê Chân → Trưng Nhị, trả lời câu hỏi, nhận phần thưởng | Task này (Phase B) |
| **Màn 3 — Trận Luy Lâu** | Boss Tô Định 3 giai đoạn, dùng buff/kỹ năng nhận ở màn 2 | Task sau |

Task này:
1. **Màn 1:** bỏ boss Tô Định, thay bằng mini-boss kiệu quan; qua cổng thì chuyển sang màn 2.
2. **Màn 2:** level mới gồm cảnh, chướng ngại nhẹ, 3 cuộc gặp NPC, câu hỏi lịch sử, cốt truyện Thi Sách hy sinh.
3. **Tiến trình:** mang dữ liệu từ màn 1 sang màn 2, từ màn 2 sang màn 3; tạm thời màn 3 là trang giữ chỗ.

**Không làm trong task này:**
- Cơ chế buff "Ý chí kiên cường", mưa tên, bóng Trưng Nhị. Màn 2 không có địch nên không thử được; màn 2 chỉ **ghi nhận đã nhận phần thưởng**, cơ chế làm ở task màn 3.
- Boss Tô Định 3 giai đoạn. Code và asset boss hiện có **giữ nguyên** để dùng lại ở màn 3, chỉ không đặt vào màn 1 nữa.
- Asset mới, âm thanh.

---

## 1. QUY TẮC

1. Tuân thủ `CLAUDE.md`. Task card mâu thuẫn với code → dừng và báo.
2. **Nội dung lịch sử ở mục 5 là Source of Truth**: chép nguyên văn, không viết lại, không thêm chi tiết. Nghi sai → hỏi team.
3. Chỉ dùng asset đã có trong `manifest_tt.json` và `maps_tt.json`. Thiếu → `TODO_MISSING` + placeholder, không crash.
4. Con số mới là DESIGN_BASELINE, đặt trong `config.js` (hoặc file dữ liệu level đã duyệt) kèm comment.
5. Hạn chế nhân bản code: màn 2 **dùng lại** engine của màn 1 (vật lý, render, input, asset, HUD) thay vì chép cả thư mục. Cách tổ chức cụ thể đề xuất ở Bước 0.
6. Làm 2 phase, mỗi phase: test → report → **dừng chờ người chơi thử duyệt**.

---

## 2. BƯỚC 0 — KHẢO SÁT VÀ KẾ HOẠCH (CHỈ ĐỌC)

1. **Tiến trình giữa các màn:** backend (`backend/routes/`, model, database) đã có cơ chế lưu tiến trình người chơi hay chuyển level chưa? Liệt kê những gì có sẵn.
2. **Tổ chức level:** đề xuất cách để màn 2 dùng chung engine với màn 1, ví dụ:
   - chọn dữ liệu level theo tham số (`createLevelState(levelId)`) cho cùng bộ module;
   - hoặc tách engine chung / dữ liệu riêng.
   Nêu ưu nhược điểm và danh sách file sẽ động tới.
3. **Màn 1 hiện tại:**
   - boss nằm ở đâu trong `OBSTACLE_GROUPS` và điều kiện thắng;
   - kiệu quan hiện là `roller` (hp 0) trong nhóm xáo ngẫu nhiên;
   - câu hỏi lịch sử đang viết cứng giữa màn và các mốc "nghỉ chân" / "cốt truyện";
   - **mọi đoạn text nói Thi Sách đã chết** (mâu thuẫn với màn 2: người chơi gặp ông khi ông còn sống).
4. Đề xuất cho các điểm cần team chốt (mục 3.1.4).
5. Viết `docs/NPC_PLAN_TT.md`: OWNED FILES theo phase, READ-ONLY FILES, cách lưu tiến trình, cách tổ chức level, sơ đồ luồng màn 1 → 2 → 3, quyết định cần chốt, rủi ro.
6. **DỪNG. Chờ duyệt.**

---

## 3. TRIỂN KHAI

### PHASE A — Sửa màn 1 và cơ chế chuyển màn

**3.1.1 Bỏ boss Tô Định khỏi màn 1**
- Không tạo boss `BOSS_TO_DINH_CHARIOT` trong màn 1. Giữ nguyên code, asset, khai báo để màn 3 dùng.
- Mini-boss chiếm chỗ boss ở chunk 11. Tổng vẫn **12 chướng ngại vật kể cả mini-boss**; các quy tắc `randomizeObstacles()` khác giữ nguyên.

**3.1.2 Mini-boss kiệu quan** (`EN_HAN_PALANQUIN`; animation có sẵn: `walk`, `throw` hit 3, `hurt`, `break`)

| Thông số | Giá trị (DESIGN_BASELINE) |
|---|---|
| Vị trí | cố định ở chunk 11, trước cổng thành |
| Máu | 6 đòn chém |
| Di chuyển | đi qua lại trong đoạn 160 px, tốc độ 30 px/s, phát `walk` |
| Tấn công | người chơi trong vòng 240 px → dừng lại, phát `throw`, sinh `PJ_THROWING_KNIFE` tại `hit_frame` 3, bay về phía người chơi. Chu kỳ 2,5 giây tính từ lúc ném xong |
| Đạn | tốc độ và tầm như `PROJECTILE_SPEED` / `PROJECTILE_MAX_RANGE` hiện tại; trúng mất 1 máu; chém trúng thì tan |
| Va chạm thân | chạm mất 1 máu (như enemy hiện tại); hitbox 76×44 như kiệu `roller` |
| Trúng đòn | phát `hurt`, không bị đẩy lùi |
| Hết máu | tắt va chạm ngay, phát `break` một lần rồi xoá |
| Dash | xuyên qua như với enemy khác (`playerImmune`) |

- Khai báo `PJ_THROWING_KNIFE` trong `PROJECTILE_SPRITES` (asset đã có: 16×8, 4 ô lặp).
- Kiệu `roller` trong nhóm xáo ngẫu nhiên: giữ nguyên, trừ khi team chọn khác ở Bước 0.

**3.1.3 Điều kiện hoàn thành màn 1**
- Hạ mini-boss + đủ **5/5 binh thư** + qua `finishX`.
- Cổng Luy Lâu mở khi đủ hai điều kiện đầu, như logic hiện có nhưng đổi "boss" thành "mini-boss".
- Hoàn thành thì lưu tiến trình và chuyển sang màn 2.

**3.1.4 Điểm cần team chốt ở Bước 0**
- Câu hỏi lịch sử đang viết cứng giữa màn 1: đề xuất **bỏ khỏi màn 1**, vì câu hỏi giờ tập trung ở màn 2.
- Text nói Thi Sách đã chết: đề xuất sửa từng chỗ, đưa bản cũ → mới vào kế hoạch.
- Text ở cổng cuối màn 1: không được nói đã "chiếm" hay "hạ" thành Luy Lâu, vì trận Luy Lâu là màn 3.

**3.1.5 Tiến trình**

| Chuyển | Dữ liệu mang theo |
|---|---|
| Màn 1 → 2 | điểm, số binh thư (5), cờ `level1Complete` |
| Màn 2 → 3 | điểm, cờ `level2Complete`, danh sách phần thưởng đã nhận: `BUFF_Y_CHI_KIEN_CUONG`, `SK_LE_CHAN_ARROW_RAIN`, `SK_TRUNG_NHI_SHADOW` |

- Máu được hồi đầy khi bắt đầu mỗi màn (DESIGN_BASELINE).
- Dùng cơ chế backend có sẵn nếu có. Nếu không, dùng `sessionStorage` phía trình duyệt, gói trong một module nhỏ (đọc/ghi/xoá) để sau này đổi sang backend dễ dàng.
- Vào thẳng màn 2 hoặc màn 3 khi chưa hoàn thành màn trước: quay về màn 1. Ngoại lệ tham số `?debug=1` cho phép vào thẳng, với dữ liệu giả lập đủ điều kiện.
- **Màn 3 tạm thời:** trang/màn giữ chỗ hiển thị "Màn 3: Trận Luy Lâu — đang phát triển", tóm tắt điểm và phần thưởng đã nhận, có nút chơi lại từ màn 1.

**Test A:**
- Màn 1 không còn boss Tô Định; mini-boss ở chunk 11 đi qua lại, ném dao đúng `hit_frame`, chết sau 6 đòn, phát `break`.
- Cổng mở khi hạ mini-boss + đủ 5 binh thư. Thiếu một trong hai: cổng đóng, người chơi bị giữ như cũ.
- Qua cổng → chuyển sang màn 2 (hoặc trang tạm của màn 2 nếu Phase B chưa làm), dữ liệu mang theo đúng.
- Vào thẳng màn 2 khi chưa qua màn 1 → quay về màn 1; `?debug=1` vào được.
- Dash xuyên kiệu và dao ném; dao chém tan được.
- Hồi quy: chơi hết màn 1 ba lượt, không lỗi console.

### PHASE B — Màn 2 "Chiêu mộ hiền tài"

**3.2.1 Bố cục** (DESIGN_BASELINE)
- Dài 4 chunk × 768 px = 3072 px. Cùng canvas 480×270, cùng `GROUND_Y`, vật lý, điều khiển với màn 1.
- **Không có hazard, enemy, projectile, binh thư.** Không có hố, trừ khi TT-MAP-01 đã chốt hành vi `bridge`.
- Trời ngày `BG_TT_SKY_DAY` + `BG_TT_FAR_HILLS` suốt màn.

| Chunk | Cảnh (lớp giữa + tile) | Sự kiện |
|---|---|---|
| 1 | Z1 làng (`BG_TT_MID_VILLAGE`) | gặp **Thi Sách** ở khoảng giữa chunk |
| 2 | Z2 đồng lúa (`BG_TT_MID_FIELDS`) | vào chunk 2 (sau khi đã gặp Thi Sách) → **cốt truyện Thi Sách hy sinh** |
| 3 | Z4 bến sông (`BG_TT_MID_RIVER`) | gặp **Lê Chân** |
| 4 | Z4 bến sông | gặp **Trưng Nhị** (cửa sông Hát); điểm kết thúc cuối chunk |

Hoà cảnh giữa các vùng theo cách đã làm ở TT-MAP-01.

**3.2.2 Chướng ngại nhẹ**
- Đặt **cố định** (không xáo), 5–6 vật cản tĩnh xen giữa các NPC, dùng các loại đã có asset: `fenceLow`, `logDrift`, `bambooSlope`, `fallenBranch`, `stoneBlock`, và 1 `reedCurtain` hoặc `slideBar` để nhắc người chơi dùng dash.
- Luật va chạm như màn 1 (va ngang mất máu).
- Không đặt vật cản trong vòng 96 px quanh NPC.
- Đây là lần đầu các vật cản P2 (`fenceLow`, `logDrift`, `bambooSlope`, `slideBar`) vào màn thật: kiểm tra lại bằng F2.

**3.2.3 Cuộc gặp NPC**
- NPC (`NPC_THI_SACH`, `NPC_LE_CHAN`, `NPC_TRUNG_NHI`) đứng cố định, quay về phía người chơi đến, phát `idle`. Không có va chạm.
- Người chơi tới cách ≤ 32 px thì **tạm dừng game** và mở hội thoại.
- Không đi qua được NPC khi chưa hoàn thành cuộc gặp: giữ người chơi lại trước NPC, giống cách cổng đích giữ người chơi.
- Mỗi cuộc gặp chỉ xảy ra một lần.
- **Khung hội thoại** (DOM, cùng phong cách `questionPanel`):
  - chân dung `PORTRAIT_*` với CSS `image-rendering: pixelated`;
  - tên nhân vật; từng câu thoại theo mục 5, bấm để sang câu tiếp;
  - NPC trên canvas phát `talk` khi đang nói.
- **Câu hỏi:** 3 đáp án, thứ tự xáo mỗi lần hiện.
  - Chọn sai: mất 1 máu, hiện gợi ý, đáp án sai đó bị làm mờ, **được chọn lại**. Hết máu thì thua theo luật hiện tại (chơi lại màn 2, giữ dữ liệu từ màn 1).
  - Chọn đúng: hiện "Vì sao đúng", thông báo phần thưởng, cộng điểm (đúng ngay lần đầu cộng nhiều hơn; dùng thang điểm hiện có).
  - Ghi phần thưởng vào tiến trình.
- Điều khiển bằng bàn phím (phím 1–3, Enter/Space) và cảm ứng.
- Đóng panel: game chạy tiếp, NPC mờ dần rồi biến mất.

**3.2.4 Cốt truyện Thi Sách hy sinh**
- Kích hoạt một lần khi người chơi vào chunk 2 sau khi đã gặp Thi Sách.
- Tạm dừng game; panel dùng `PORTRAIT_THI_SACH` với CSS `filter: grayscale(1)`; text theo mục 5.4.

**3.2.5 Kết thúc màn 2**
- Qua điểm cuối chunk 4 sau khi đã gặp đủ 3 NPC → lưu tiến trình → chuyển sang màn 3 (trang giữ chỗ).
- Màn hình giới thiệu đầu màn 2 (1 dòng): "Màn 2: Chiêu mộ hiền tài".

**Test B:**
- Đi hết màn 2: đúng thứ tự Thi Sách → cốt truyện → Lê Chân → Trưng Nhị; không đi vượt được NPC chưa gặp.
- Chọn sai mất 1 máu, được chọn lại; đúng thì đủ các bước và phần thưởng được ghi vào tiến trình.
- Cốt truyện Thi Sách hiện đúng một lần.
- Đối chiếu từng chữ text hiển thị với mục 5.
- F2: vật cản P2 khớp hitbox; nhảy qua, đứng lên được; dash qua `reedCurtain`/`slideBar`.
- Trang màn 3 hiện đủ 3 phần thưởng và điểm.
- Điện thoại dọc/ngang: panel đọc và bấm được.
- Hồi quy: chơi liền màn 1 → 2 → trang màn 3 ba lượt, không lỗi console.

---

## 4. GATE MỖI PHASE

1. Liệt kê file đã sửa + mục đích.
2. Chạy test của phase, ghi PASS/FAIL.
3. Không sửa ngoài OWNED FILES đã duyệt; text khớp mục 5 từng chữ.
4. Có FAIL → `BLOCKED` + lý do.
5. PASS → **dừng chờ người chơi thử duyệt**.
6. Sau Phase B:
   - đổi `status` các asset mới dùng (NPC, portrait, `PJ_THROWING_KNIFE`, vật cản P2 đưa vào màn 2) thành `IN_GAME`;
   - cập nhật `CLAUDE.md`: cấu trúc 3 màn, cách tổ chức level, tiến trình, mini-boss, NPC/câu hỏi; ghi rõ boss Tô Định tạm không dùng, chờ màn 3.

---

## 5. NỘI DUNG MÀN 2 (SOURCE OF TRUTH — CHÉP NGUYÊN VĂN)

### 5.1 Thi Sách — Hào trưởng Chu Diên

**Thoại**
1. Thi Sách: "Trắc, Tô Định vừa sai người tới dụ ta quy hàng."
2. Thi Sách: "Chúng dọa nếu ta cùng nàng chống lại, sẽ giết cả họ ta và bá tánh Chu Diên."

**Câu hỏi:** Trước lời đe dọa của giặc, người làm tướng nên chọn con đường nào?
- ✅ Lấy đại nghĩa làm trọng, không cúi đầu trước giặc, cùng dựng cờ cứu dân.
- ❌ Tạm quy hàng để giữ yên cho gia tộc, chờ thời cơ.
- ❌ Bỏ vào rừng sâu lánh nạn, mặc cho dân chúng chịu khổ.

**Gợi ý khi sai:** Nghĩ xem điều gì giúp muôn dân thoát ách đô hộ.

**Vì sao đúng:** Sử cũ chép rằng Thi Sách không chịu khuất phục trước Tô Định. Nợ nước, thù nhà đã hun đúc ý chí khởi nghĩa của Trưng Trắc.

**Phần thưởng:** Ý chí kiên cường. Khi máu chỉ còn 1, nếu tránh được đòn trong 3 giây, bạn sẽ hồi 1 máu.

### 5.2 Lê Chân — Nữ tướng vùng biển An Biên

**Thoại**
1. Lê Chân: "Quân Hán đông, giáp trụ tốt. Đánh nhau trên đất bằng, ta khó thắng."
2. Lê Chân: "Nhưng người vùng ta giỏi sông nước. Nàng muốn ta chuẩn bị lực lượng thế nào?"

**Câu hỏi:** Lê Chân nên chuẩn bị lực lượng ra sao để hưởng ứng Hai Bà?
- ✅ Lập căn cứ ven biển, chiêu mộ trai tráng, luyện thủy quân và khai hoang lấy lương nuôi quân.
- ❌ Dồn toàn bộ quân ra đánh ngay trên đồng bằng.
- ❌ Gửi thư cầu hòa với Thái thú để giữ yên vùng biển.

**Gợi ý khi sai:** Hãy dựa vào thế mạnh riêng và chuẩn bị cho cuộc chiến lâu dài.

**Vì sao đúng:** Theo truyền thuyết, Lê Chân lập căn cứ ở vùng ven biển An Biên (nay thuộc Hải Phòng), khai hoang và luyện quân, rồi đem lực lượng về hưởng ứng khởi nghĩa Hai Bà Trưng.

**Phần thưởng:** Mưa tên. Trong trận đánh, bấm K để gọi mưa tên đánh kẻ địch phía trước.

### 5.3 Trưng Nhị — Em gái, cánh tay phải

**Thoại**
1. Trưng Nhị: "Chị ơi, các Lạc tướng đã tụ về cửa sông Hát."
2. Trưng Nhị: "Họ đang chờ xem chị nói gì trước khi vác giáo theo."

**Câu hỏi:** Điều gì quan trọng nhất để các Lạc tướng một lòng đi theo?
- ✅ Một lời thề xuất quân rõ ràng: đền nợ nước, trả thù nhà, khôi phục nghiệp xưa họ Hùng.
- ❌ Hứa chia hết cống phẩm vàng bạc cho mọi người.
- ❌ Giữ kín mục tiêu để giặc không biết.

**Gợi ý khi sai:** Người ta theo nhau vì chính nghĩa, không vì của cải.

**Vì sao đúng:** Theo truyền thống, Trưng Trắc làm lễ thề ở cửa sông Hát (Hát Môn). Lời thề được lưu truyền qua sách đời sau, mở đầu bằng câu: "Một xin rửa sạch nước thù".

**Phần thưởng:** Bóng Trưng Nhị. Trong trận đánh, bấm L để Trưng Nhị cùng xuất trận, sát thương tăng gấp đôi.

### 5.4 Cốt truyện — Thi Sách hy sinh

1. "Tin dữ truyền về: Tô Định đã sát hại Thi Sách."
2. "Nợ nước chồng thêm thù nhà. Trưng Trắc quyết dựng cờ khởi nghĩa."

---

## 6. BÁO CÁO `docs/REPORT_TT-NPC-01.md`

```
## Phase <A|B> — <ngày>
### File đã sửa (file | mục đích)
### Hằng số mới (tên | giá trị | DESIGN_BASELINE)
### Kết quả test (test | PASS/FAIL | ghi chú)
### Text đã sửa so với bản cũ (vị trí | cũ | mới)
### Vấn đề asset
### Câu hỏi cho team
```
