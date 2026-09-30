# REPORT TT-L2-HARD — Tăng độ khó màn 2 "Chiêu mộ hiền tài"

Ngày: 29/09/2026 · Người làm: Claude · Trạng thái: **DONE** (còn chơi thử tay — xem mục 4)

## 1. Yêu cầu & quyết định team

Màn 2 cũ quá dễ (4 chunk, 6 vật cản tĩnh, không quân địch). Team chọn:

- Hướng: **quân Hán chặn đường + giải cứu NPC + đoạn địa hình khó + kéo dài màn** (cả 4).
- Mức độ: **khó hơn màn 1**.
- Vị trí: **cố định** (không xáo).
- Lính vây NPC: **lính canh** `EN_HAN_GUARD` (mặc định).

Thay thế quy định "màn 2 không hazard/enemy/đạn/hố" của TT-NPC-01 §3.2 (team duyệt 29/09).
Nội dung lịch sử (thoại, câu hỏi, cốt truyện) **không đổi**. Không cần asset mới.

## 2. Bố cục mới (DESIGN_BASELINE)

| Chunk | Vùng | Nội dung |
|---|---|---|
| 1 | Z1 làng | `fenceLow` 150 · hố chông `TR_SPIKE_PIT` 300 · **Thi Sách** 560 + 2 lính vây |
| 2 | Z2 đồng lúa | cốt truyện Thi Sách hy sinh (giữ nguyên) · lính thu thuế 300 · `reedCurtain` 470 (lướt) · xe cống 738 |
| 3 | Z3 rừng | hổ 732 · `fenceHigh` 200 · **hố hở** 400 (64px, phải nhảy) · `slideBar` 560 (lướt) |
| 4 | Z4 bến sông | `logDrift` 120 · lính canh 300 · `stoneBlock` 380 · **Lê Chân** 560 + 2 lính vây |
| 5 | Z4 bến sông | hố 160 (96px) + `bridge` · `bambooSlope` 330 · tháp canh 520 + lính gác 574 + kỵ binh 780 |
| 6 | Z4 bến sông | lính thu thuế 180 · lính canh 330 · **Trưng Nhị** 560 + 2 lính vây · về đích 672 |

Số là localX trong chunk. Về đích `LEVEL2_FINISH_X` = 4512.

**Giải cứu NPC**: lính vây trái (tâm NPC −100, tuần tra [−170, −30]) và phải (+48, [−60, +80]) —
`NPC_RESCUE` trong `config.js`. Còn lính vây sống: vẫn bị giữ trước NPC, không mở hội thoại, nhắc
"Hãy hạ lính canh đang vây …!" (≤ 200px, tối đa 1 lần/4 s).

## 3. File đã sửa

| File | Mục đích |
|---|---|
| `frontend/static/js/levels/trung-trac/config.js` | `LEVEL2_CHUNKS` = 6, `LEVEL2_ZONES` thêm Z3 rừng, `LEVEL2_FINISH_X`, `LEVELS[2]`, `NPC_RESCUE` |
| `frontend/static/js/levels/trung-trac/state.js` | viết lại `level2Content()`, thêm `makeCaptors()`, `checkNpcClearance()` kiểm tra cả hazard + hố |
| `frontend/static/js/levels/trung-trac/physics.js` | `updateMeetings()`: chặn hội thoại khi còn lính vây + lời nhắc; **sửa lỗi hố** (xem 3.1) |
| `CLAUDE.md` | cập nhật mô tả màn 2, hố, NPC, vật cản P2 |

### 3.1 Lỗi engine phát hiện khi test (đã sửa)

**Hiện tượng**: đi thẳng vào hố hở không rơi. **Bằng chứng** (log từng frame): chân rơi tới y = 304
(56px dưới mặt đất) rồi bị kéo về 248 đúng frame chân trước qua mép phải hố. **Nguyên nhân**:
điều kiện tiếp đất `feetY >= groundY && vy >= 0` không xét chân đã ở sâu dưới đất từ frame trước.
Chưa lộ vì trước đây màn thường không có hố hở (layout thử P2 có cầu). **Sửa**: chỉ tiếp đất khi
`previousBottom <= groundY + GROUND_SNAP_DISTANCE`; đã rơi xuống hố thì kẹp giữa 2 vách hố.
Ảnh hưởng màn 1/3: không (không có hố); nhảy thường vẫn tiếp đất đúng (đã test).

## 4. Kết quả test (trình duyệt, `/gameplay/levels/trung-trac/2?debug=1`)

| # | Test | Kết quả |
|---|---|---|
| 1 | Bố cục 6 chunk đúng bảng mục 2, cầu được giữ (có hố bên dưới) | PASS |
| 2 | Không cảnh báo khoảng cách NPC / cầu thiếu hố, không lỗi console | PASS |
| 3 | Còn lính vây: bị giữ trước NPC, không mở hội thoại, hiện lời nhắc | PASS |
| 4 | Lính vây với tới chỗ bị giữ và gây sát thương (đứng yên 6 s: 5 → 2 máu) | PASS |
| 5 | Từ chỗ bị giữ chém trúng được lính vây bên phải | PASS |
| 6 | Hạ hết lính vây → hội thoại mở (Thi Sách, Lê Chân, Trưng Nhị) | PASS |
| 7 | Cốt truyện Thi Sách hy sinh khi vào chunk 2 | PASS |
| 8 | Đi vào hố hở → rơi, −1 máu, hồi sinh x = 1608 (không nằm trong hố) | PASS (sau khi sửa 3.1) |
| 9 | Nhảy qua hố + lướt qua `slideBar` → không mất máu | PASS |
| 10 | Đi qua cầu chunk 5 → không rơi, không mất máu | PASS |
| 11 | Nhảy tại chỗ tiếp đất đúng (không hồi quy do sửa 3.1) | PASS |
| 12 | Về đích → "Hoàn thành Màn 2", nút "Sang Màn 3", ghi đủ 3 phần thưởng | PASS |
| 13 | **Chơi thử tay cả màn không gian lận** (không bất tử, không dịch chuyển) | **CHƯA LÀM** |

Test 3–12 chạy bằng script bước vòng lặp mô phỏng (preview không chạy `requestAnimationFrame`),
một số test cho người chơi bất tử để tách riêng từng cơ chế. Test 13 cần người chơi thật để đánh
giá độ khó — đề nghị team chơi thử và báo số cần chỉnh.

## 5. Vấn đề asset

Không có. Toàn bộ quân/bẫy/vật cản đã có asset `IN_GAME`.

## 6. TODO / điểm cần theo dõi khi chơi thử

- Độ khó tổng thể (test 13): mọi số là `DESIGN_BASELINE`.
- Chunk 3: hổ lao ra có thể trùng lúc nhảy hố — đó là ý đồ, nhưng nếu quá gắt thì dời `triggerX` của hổ.
- Lính vây bên phải đứng sát chỗ bị giữ (đâm tới được ngay) — nếu quá khó, giảm `NPC_RESCUE.right.patrol[0]`.
- Chơi thử với `?debug=1` có ghi tiến trình vào `sessionStorage` khi về đích (hành vi có sẵn của `endGame`, không thuộc task này).
