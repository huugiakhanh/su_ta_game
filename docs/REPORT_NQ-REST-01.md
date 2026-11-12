# REPORT NQ-REST-01 — Điểm nghỉ chân hiện bình máu (mọi chương)

Ngày: 12/11/2026. Yêu cầu người dùng: cuối màn 2 chương 7, nhân vật "nhặt một item gì đó mà không hiển thị" — kiểm tra lại. Sau đó: "Đổi hết" các mốc nghỉ chân vô hình còn lại.

## Hiện trạng / đo trước khi sửa
- Thứ "nhặt" vô hình là **điểm nghỉ chân** `LEVEL2.rest: [9, 100]` (x 6244, chương 7 màn 2). Khi nhân vật đi qua x đó, `level2Events()` hồi 1 máu, phát `heal` và hiện "Nghỉ chân: hồi 1 máu.", nhưng không vẽ gì. Tái hiện trên trình duyệt: máu 2 → 3, không có hình.
- Không phải lỗi tải asset: màn 2 nạp đủ 82/82 ảnh.
- Cùng kiểu mốc vô hình có ở màn 1 của cả 7 chương (Trưng Trắc chunk 9, Bà Triệu chunk 9, Lý Nam Đế chunk 8, Triệu Việt Vương chunk 8, Mai Hắc Đế chunk 7, Phùng Hưng chunk 8, Ngô Quyền chunk 7).
- Không manifest nào có sẵn prop kiểu lửa trại hay chòi nghỉ.

## Quyết định (người dùng chốt)
- Dùng bình máu có sẵn, không nhờ Codex vẽ prop mới.
- "Đổi hết": áp dụng cho mọi điểm nghỉ chân, cả 7 chương.

## File đã sửa / tạo / xoá
| File | Việc |
|---|---|
| `frontend/static/js/engine/entities.js` | `makeRestHeal(chunk, localX)`: bình máu đặt chân trên `groundYAt` tại tâm, `life: Infinity` |
| `js/levels/<7 chương>/level1.js` | Thêm `pickups: [makeRestHeal(...)]` vào nội dung màn 1 (TT bỏ qua ở `?layout=p2`; layout thử `?layout=engine` không có). Bỏ mốc vô hình trong `level1Events` + import thừa |
| `js/levels/ngo-quyen/level2.js` | Như trên cho màn 2 (bản đầu có hàm riêng, nay dùng hàm của engine) |
| `ba-trieu/chapter.js`, `ly-nam-de/chapter.js` | Bỏ `level1Events` (chỉ còn mốc nghỉ chân) và cờ `restUsed` |
| `chapter.js` của 5 chương còn lại | Bỏ cờ `restUsed` khỏi `stateFields` |
| `phung-hung/config.js`, `ngo-quyen/config.js` | Bỏ `TEXT.rest` (không còn dùng) |
| `trieu-quang-phuc/config.js` | `REST.localX` 200 → **60** (xem dưới) |
| `ba-trieu`, `ly-nam-de`, `mai-hac-de` `config.js` | Sửa chú thích `REST` |
| `.claude/rules/engine.md` + rule 5 chương | Ghi `makeRestHeal` và điểm nghỉ chân mới |
| `docs/REPORT_NQ-REST-01.md` (mới) | Report này |

Hình bình máu: chương có `CHAPTER.pickups.heal` (Lý Nam Đế, Triệu Việt Vương, Mai Hắc Đế, Phùng Hưng, Ngô Quyền) vẽ ống tre `ITEM_LND_HEAL`. Trưng Trắc và Bà Triệu không có nên engine vẽ icon tim chung `ICON_HUD_HEART`.

Thay đổi hành vi ngoài yêu cầu:
- Đầy máu đi qua thì bình **nằm lại**, quay lại nhặt được khi bị thương. Mốc cũ thì dùng hết ngay khi đi qua, kể cả lúc đầy máu.
- Nhặt bình không còn hiện câu "Nghỉ chân: hồi 1 máu.", chỉ phát tiếng `heal`, giống bình máu rơi khi hạ địch.
- **Triệu Việt Vương**: điểm nghỉ dời từ chunk 8 local 200 về local 60 (vẫn đầu đầm lầy, `DESIGN_BASELINE`). Lý do: mô phỏng 200 lượt xáo thì ở local 200 có 14 lượt cọc tre `blocking`, hố chông hoặc cây cung thủ đè lên bình; ở local 60 thì 0/200.

## Kết quả test
- `pytest tests`: 170 passed, 1 skipped — PASS. Bản skip là `test_app.py` (thiếu `SUTA_TEST_DATABASE_URL`), tức test có DB **chưa chạy**.
- Trình duyệt (server dev 5059, ô Browser ẩn nên chạy `update(1/60)` bằng tay):
  - Chương 1–7 màn 1 + chương 7 màn 2: lúc tải màn có đúng 1 bình, chân bình = `groundYAt`, `life` Infinity sau 120 frame, ảnh bình đã nạp — PASS.
  - Sinh lại nội dung màn 1 50 lần mỗi chương (Triệu Việt Vương 100 lần sau khi dời): không lần nào bình rơi vào hố. Có vật trùng chỗ bình nhưng không chặn việc nhặt:
    - Trưng Trắc: lính ném hoặc rèm lau. Rèm lau treo trên cao (`overhead`); lính ném hạ xong là nhặt được.
    - Mai Hắc Đế: vùng phục của hổ.
    - Ngô Quyền: vùng gió.
    - Bà Triệu, Lý Nam Đế, Phùng Hưng, Triệu Việt Vương (sau khi dời): không có vật nào.
  - Nhặt: chương 7 màn 2 đầy máu 5/5 đi qua → bình còn; 3/5 → 4/5, bình mất. Trưng Trắc 3/5 → 4/5 — PASS.
  - Ảnh chụp: ống tre (chương 7 màn 2) và tim (Trưng Trắc) hiện trên mặt đất — PASS.
  - Layout thử: `trung-trac?layout=p2` và `?layout=engine` của 6 chương (Bà Triệu → Ngô Quyền) nạp xong, không bình, chạy 60 frame không lỗi — PASS.
  - Console: chỉ có lỗi 401 của `/api/game/progress` khi chơi khách (bình thường).
- Chưa kiểm: chơi tay cả màn bằng bàn phím (ô Browser ẩn).

## Vấn đề asset
- Không có. Nếu muốn điểm nghỉ có hình riêng (lửa trại, chòi), có thể giao Codex sau; hiện dùng bình máu có sẵn.

## Câu hỏi cho team / TODO
- Trưng Trắc và Bà Triệu đang vẽ icon tim chung. Muốn đồng bộ ống tre thì phải chép mục `ITEM_LND_HEAL` vào manifest 2 chương đó và khai báo `pickups.heal`.
