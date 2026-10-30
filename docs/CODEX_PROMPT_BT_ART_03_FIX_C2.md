# CODEX PROMPT — BT_ART_03_FIX_C2: khe hở trên tóc Bà Triệu cưỡi voi (32-bit)

28/10/2026 • Người giao: team Sử Ta (Claude soạn) • Skill `$generate2dsprite` • **Người dùng duyệt 28/10/2026**
> Đọc `SUTA_TT_ART_BRIEF_32.md` và `docs/CODEX_PROMPT_BT_ART_03.md` mục 8 trước khi làm. Đây là bản vá **Gate C2**. Mọi asset C2 khác đã **PASS**, không được sửa.

## 0. LỖI (Claude soát 28/10/2026)

Asset `PLAYER_BA_TRIEU_ELEPHANT` (`cutscene/PLAYER_BA_TRIEU_ELEPHANT/`) có lỗi ở **cả 14 ô**: một **khe trong suốt dọc rộng 5 px ảnh** (≈ 1,25 px logic) cắt ngang tóc và áo choàng đỏ, nằm ngay sau đầu. Phần người trong ô 3 charge phóng 1,5× cho thấy rõ khe này.

Nhiều khả năng đây là mép trái của vùng đầu chép từ `PLAYER_BA_TRIEU.idle` (ROI [89,15,129,78)): tóc bên ngoài ROI bị xoá nhưng phần tóc/áo choàng còn lại không được nối liền vào.

Toạ độ khe trong từng ô (x ảnh trong ô 512 px, y ảnh, cột trong suốt bị kẹp giữa hai bên đục):

| Animation | Ô: x (rộng 5), y từ–đến |
|---|---|
| idle | 1: 184, 88–104 • 2: 183, 87–103 • 3: 183, 86–102 • 4: 183, 88–103 • 5: 184, 85–101 • 6: 183, 85–101 |
| charge | 1: 197, 104–118 • 2: 193, 120–137 • 3: 195, 102–124 • 4: 189, 99–126 • 5: 194, 83–101 • 6: 194, 103–122 • 7: 189, 95–119 • 8: 192, 77–104 |

## 1. YÊU CẦU

- Lấp khe bằng cách **vẽ nối tóc và áo choàng liền mạch** qua chỗ khe, đúng hình khối và hướng bay của tóc trong từng ô. Không lấp bằng màu đơn hay màu lấy sát mép.
- Không đổi:
  - đầu, mặt, mũ (ROI giữ nguyên hình học);
  - voi (pixel voi giữ đúng `NPC_BACH_TUONG`, 0 pixel lệch);
  - cỡ strip: idle 3072×384, charge 4096×384;
  - frames/fps: idle 6@8, charge 8@18;
  - pivot, baseline (hàng 378 như `NPC_BACH_TUONG`);
  - ≤ 40 màu cả asset;
  - ID, tên animation, tên file.
- Rà lại toàn bộ 14 ô xem còn khe tương tự ở mép **phải / trên / dưới** của ROI đầu. Có thì sửa luôn và ghi vào report.

## 2. ACCEPTANCE

1. Quét từng ô trong vùng x 140–300, y 20–200: không còn chuỗi cột trong suốt (rộng 1–8 px) bị kẹp giữa hai bên đục và dài quá 6 hàng.
2. Mọi pixel thuộc lớp voi trùng với bản `NPC_BACH_TUONG` (0 lệch).
3. GIF preview mới: `preview/gate_c2/player_ba_trieu_elephant_{idle,charge}_fix.gif`, kèm ảnh phóng 3× vùng đầu và tóc của 14 ô.
4. So SHA-256: chỉ 2 PNG của asset này, `qa_notes` trong manifest và report được thay đổi.

## 3. BÁO CÁO & DỪNG

Thêm mục `BT_ART_03_FIX_C2` vào `SPRITE_REPORT_BT_32.md`, kèm số đo acceptance. Status tối đa `NORMALIZED`. **Dừng, chờ duyệt.**
