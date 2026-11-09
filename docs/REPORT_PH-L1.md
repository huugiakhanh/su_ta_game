# REPORT PH-L1 — Màn 1 "Trai tráng Đường Lâm" (bố cục thật + asset `PH_ART_01`)

Ngày: 09/11/2026 • **PASS, còn chờ chơi tay (L12)**. Test tự động chạy bằng `update(1/60)` + giả lập phím trên trình duyệt thật.
Task card: [SUTA_PH_TASK_L1_01.md](SUTA_PH_TASK_L1_01.md). Yêu cầu người dùng: làm màn 1 chương Phùng Hưng theo task card đã duyệt.

## Hiện trạng / đo trước khi sửa
- `pytest tests`: 149 passed, 1 skipped.
- Màn 1 là khung 6 chunk, `manifest_ph.json` bản chạy còn mục tạm `OB_BOULDER`.

## Quyết định (người dùng chốt, 09/11/2026, theo đề xuất)
- Q1: lính gác ải chỉ xe muối mới hạ được.
- Q2: bắt buộc hạ hổ mới mở cổng.
- Q3: trâu không bắt buộc thu phục.
- Q4: bài học cố định, chỉ 7 nhóm phụ được xáo.
- Từ đợt asset: giữ `OB_PH_SALT_CART` 4 bánh, khác prompt mục 6.4.

## Kết quả soát `PH_ART_01` (prompt đã xoá)
- Gate A1: 2 lượt sửa (`charge_strike` nam/nữ vẽ lại 2 lần; `charge_hold` nam, ô 3 `ride` trâu, `attack_01` lính giáo, chỗ nối và viền đỏ của nền). Hình Phùng Hưng và tông đất đỏ do người dùng duyệt.
- Gate A2: 1 lượt sửa (đá ong đổi màu về H 25,5° S 0,45; hào chông vẽ lại thành một hào liền; vùng vá 2 nền).
- Toàn bộ `IN_GAME`.

## File đã sửa / tạo / xoá
| File | Việc |
|---|---|
| `js/levels/phung-hung/config.js` | 12 chunk, 3 vùng, cổng, bia, `LEVEL1`, sprite đá ong, thợ săn, cây, tên, NPC |
| `js/levels/phung-hung/level1.js` | Bố cục thật, xáo nhóm, hổ, trâu, lính gác ải, `onPushHit`, sự kiện |
| `js/levels/phung-hung/chapter.js` | `gate`, `guide`, `events`, `hooks`, `stateFields`, câu mô tả màn |
| `js/levels/phung-hung/dialogue-data.js` | `STORY_PH_INTRO`, chép nguyên văn PH-00 §5.1 |
| `images/phung-hung/sprites-32bit/manifest_ph.json` | Bỏ mục tạm `OB_BOULDER`; bản chạy trùng bản nguồn |
| `templates/components/home/{chapter,timeline}.html` | Thẻ chương 6 `data-unlock-after="5"` |
| `.claude/rules/{phung-hung-gameplay,assets-32bit}.md`, `docs/SUTA_PH_TASK_{00,L1_01}.md` | Ghi lại |
| `docs/CODEX_PROMPT_PH_ART_01.md` (xoá) | Asset đã duyệt hết |

Không sửa `js/engine/` và file chương 1–5 trong task này, trừ mục dưới.

**Sửa thêm theo yêu cầu người dùng (09/11/2026):** bỏ ô chữ nhật vàng nhấp nháy khi gồng, thay bằng vầng lửa pixel vẽ bằng code ở `js/engine/render/player.js`: lớn dần khi tích lực, đủ lực thì bùng một vòng và có lõi vàng. Không có trong `PH_ART_02/03` nên làm ngay, không thêm ảnh. Chỉ chương bật `CHAPTER.charge` mới thấy.

**Thay vầng lửa code bằng asset Codex (đợt `PH_ART_FX_CHARGE`, người dùng duyệt 09/11/2026):** `FX_CHARGE_AURA` 5 animation, F1 sửa 2 lượt (lõi sáng bị cắt thẳng, ô 8 lệch nét, lửa quá tối), F2 đạt ngay. Thêm vào `manifest_shared.json` + `images/shared/sprites-32bit/fx/` (144 KB), `CHARGE_FX_SPRITE` trong `engine/config.js`, `assets.js` chỉ nạp ở chương có `CHAPTER.charge`, `render/player.js` bỏ phần vẽ bằng code. Kiểm từng khung 1/60 s: lửa từ 0,15 s; `build` ô 1–7 tới 0,63 s; đủ lực ở 0,70 s thì `hold` + `ready_burst` (hết ở 0,95 s); thả phím ra đòn gồng và tắt lửa; bấm nhanh 0,08 s không có lửa; nam và nữ đều đúng; chương 5 không tải file FX nào; `pytest` 149 passed, 1 skipped. Chưa xem ở tốc độ thật vì ô trình duyệt đang ẩn.

Thay đổi nhỏ so với task card:
- Đá ong **ẩn tới khi có người vào vùng**, rồi mới hiện và rung (`updateRocks`). Lý do: khác lưới trúc treo trên cây, đá treo giữa trời trông sai.
- Sách trong rào chunk 8 là rào riêng, ngoài rào của bài học trâu.

**Câu kỹ thuật mới (không có nội dung lịch sử):** 4 câu hướng dẫn ở task card mục 4, "Lính gác không hề hấn. Hãy đẩy xe húc chúng!", "Hãy hạ mãnh hổ và lính gác ải trước.", "Nghỉ chân: hồi 1 máu.", các câu của đá ong và thợ săn.

**Không phải do phiên này:** 3 file `docs/SUTA_TQP_TASK_*` vẫn đang ở trạng thái bị xoá.

## Kết quả test
| # | Test | Kết quả |
|---|---|---|
| L1 | Tải màn | PASS — 9216 px, 3 vùng; 0 request sprite chương 5 (0/131); request lỗi duy nhất là 401 tiến trình của khách; hết cảnh báo `stage_length`; không hộp tạm |
| L2 | Xáo nhóm | PASS — 300 lần dựng: luôn 2 đá, 2 thợ săn, 3 lính; 0 nhóm sai vùng; khoảng cách nhỏ nhất giữa 2 nhóm 262 px; 5 sách, 4 câu không trùng |
| L3 | Phùng Hưng | PASS — đúng 2 câu, đối chiếu script với PH-00; chân dung nạp; `fade` về 0 |
| L4 | Hổ | PASS — ngoài lúc khựng đòn gồng 9 → 9; lúc khựng đòn thường 9 → 9, đòn gồng −3 mỗi lần; vồ bù nhìn thì animation `stuck`; hết máu thì rơi sách |
| L5 | Đá ong | PASS — hiện khi kích hoạt; `warn` 0,5 s; trúng −1 máu, choáng 0,4 s; đá rơi trúng người thì đẩy ra sát mép, không kẹt; đi ngang bị chặn; 1 đòn đánh vỡ, phát `death` |
| L6 | Thợ săn, lính khiên | PASS — tên ra ở độ cao 135 (hông thợ săn 161), nhắm chéo trúng thân, −1 máu. Lính khiên: đòn thường 6 → 6, 2 đòn gồng thì chết, rơi sách |
| L7 | Trâu | PASS — đứng trước lính, thu phục sau 9 frame; húc hết 3 lính + rào; không mất máu; cưỡi 5 s, dừng ở x 6358 trước hào; không thu phục thì trâu chạy khỏi màn, vẫn qua được. Gặp bia giữa đường: game dừng, trả lời xong cưỡi tiếp |
| L8 | Hào chông | PASS — đi bộ rơi −1 máu, về cách mép 23 px; chỉ nhảy không qua, −1 máu; nhảy + lướt qua, không mất máu |
| L9 | Xe + cổng | PASS — kiếm và đòn gồng 2 → 2; đẩy 354 px trong 4,68 s, hạ cả 2 lính; còn lính gác hoặc thiếu sách đều bị giữ trước cổng; đủ thì cổng mở, qua đích hiện "Sang Màn 2" |
| L10 | Sách, nghỉ chân, thẻ | PASS — rào chunk 8 phá bằng đòn thường, rơi sách; nghỉ chân 3 → 4 máu một lần; thẻ chương 6 khoá khi chưa có cờ, mở khi có `suta.cleared.5` |
| L11 | Nam + nữ, hồi quy | PASS — bản nữ nạp đủ `charge_hold`, `charge_strike`, `ride`, thu phục và cưỡi được; `?layout=engine`, `?viewer=1`, màn 2–3 khung chạy, 12 ID mới hiện trong viewer |
| L12 | Chơi tay | **CHƯA CHẠY** — chờ người dùng; độ khó và thời gian màn chưa đánh giá |
| L13 | `pytest`, giao diện | PASS — 149 passed, 1 skipped (`test_app.py` thiếu `SUTA_TEST_DATABASE_URL`); 812×375: canvas 523×221, không thanh cuộn |

**Giới hạn:** các phép đo dùng mô phỏng và dịch chuyển người chơi. Trong lúc thử, tôi đã xoá hết dữ liệu tạm trong trình duyệt và trả lại lựa chọn nhân vật nam; chưa ghi gì vào DB (khách, API trả 401).

## Vấn đề asset
Không có.

## Câu hỏi cho team / TODO
- L12: người dùng chơi tay, sau đó chỉnh số `DESIGN_BASELINE` nếu cần.
- Hào cần nhảy + lướt nên khó với điện thoại; xem lại khi chơi tay.
- Tiếp theo: `PH_ART_02` + PH-L2.

## Bổ sung: animation đẩy xe `PH_ART_PUSH` (09/11/2026)

Người dùng báo thiếu sprite đẩy xe. Thêm `push` 8@10, ô 64 logic cho `PLAYER_MALE`, `PLAYER_FEMALE` (đạt ngay lượt đầu, prompt đã xoá; strip ở `images/shared/`, mục ở `manifest_shared.json`).

Sửa engine: `p.pushing` trong `player.js pushBody`, `PLAYER_ANIMATIONS.push` lùi về `run` khi thiếu strip.

| Kiểm tra | Kết quả |
|---|---|
| Đẩy xe `?layout=engine` | PASS — 60/60 frame phát `push`, không nhấp nháy, xe 76 px/s, tay khớp thành xe; nam + nữ |
| Thả phím / lùi / nhảy | PASS — `idle` / `run` / `jump` |
| Xe chạm mép hố | PASS — xe dừng cách hố 1,1 px, nhân vật về `idle` |
| Hồi quy | PASS — 21 trang (18 màn, `?layout=engine` chương 5 và 6, `?viewer=1`), 0 lỗi JS; `pytest` 149 passed, 1 skipped |

Chơi tay: người dùng báo ổn 09/11/2026.
