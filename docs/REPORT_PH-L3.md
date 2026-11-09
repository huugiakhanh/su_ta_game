# REPORT PH-L3 — Màn 3 "Vây phủ Tống Bình" (trận Cao Chính Bình + kỹ năng + cutscene)

Ngày: 09/11/2026 • **PASS**. Test tự động chạy bằng `update(1/60)` + giả lập phím trên trình duyệt thật.
Task card: [SUTA_PH_TASK_L3_01.md](SUTA_PH_TASK_L3_01.md). Yêu cầu người dùng: làm màn 3 chương Phùng Hưng theo task card đã duyệt.

## Hiện trạng / đo trước khi sửa
- `pytest tests`: 149 passed, 1 skipped.
- Màn 3 là khung 3 đợt lính, nền và trời mượn tạm.

## Quyết định (người dùng chốt, 09/11/2026, theo đề xuất)
- Q1: 9 câu thông báo trận theo card mục 5.
- Q2: số ở mục 2–3 là `DESIGN_BASELINE`, chỉnh sau chơi thử.
- Q3: cutscene có 3 NPC màn 2 đứng hai bên, không thoại riêng.
- Q4: câu 1 cutscene không chân dung, tên hộp thoại "Tống Bình".
- Q5: cung thủ không đánh được.
- Q6: Hỏa Trận Trống Đồng chỉ cộng thanh sợ ở GĐ 2.
- Q7: dùng tạm trang phục boss và trống đồng đã `IN_GAME`, chờ team.

## Kết quả soát `PH_ART_03` (prompt đã xoá)
- Gate C1: 1 lượt sửa (đầu boss ở `hurt`, `death`; màu đêm lầu cổng, cánh tường sáng 105 → 42,9). Bản đóng còn 11 màu sau khi đổi màu; người dùng duyệt.
- Gate C2: đạt ngay. Cổng mở khác bản đóng 102.558 px, đều trong vùng cửa.
- Toàn bộ `IN_GAME`. `EN_TANG_ARCHER`, `FX_OIL_FIRE` chép từ chương 5, `FX_TQP_TORCH` chép từ chương 4 (nguồn và bản chạy).

## File đã sửa / tạo / xoá
| File | Việc |
|---|---|
| `js/levels/phung-hung/boss.js` (mới) | Trận, thanh sợ, trụ gác, trống đồng, đá rơi, lính, HUD, cutscene |
| `js/levels/phung-hung/skills.js` (mới) | `PH_SKILLS`: 3 phần thưởng |
| `js/levels/phung-hung/render-extras.js` (mới) | Lầu cổng, boss, vạch báo, đá rơi, nhân vật cutscene, FX, thanh sợ |
| `js/levels/phung-hung/level3.js` | Viết lại: dựng trụ, trống, nước sôi, cung thủ |
| `js/levels/phung-hung/{config,chapter,dialogue-data,audio-data}.js` | Số trận, art, sprite, 2 câu cutscene, 4 tiếng chép từ chương 5 |
| `templates/gameplay/levels/phung-hung.html` | 3 block kỹ năng |
| `images/phung-hung/{sprites,maps}-32bit/` | 25 ảnh chép vào bản chạy (19 của `PH_ART_03`, 6 của 3 asset mượn) và mục manifest |
| `.claude/rules/phung-hung-gameplay.md`, `docs/SUTA_PH_TASK_{00,L3_01}.md` | Ghi lại |
| `docs/CODEX_PROMPT_PH_ART_03.md` (xoá) | Asset đã duyệt hết |

Không sửa `js/engine/` và file chương 1–5 (`git status` 0 file).

**Khác task card, để phục vụ đúng mục tiêu:**
- Đá rơi tự mô phỏng trong `boss.js`, không dùng hazard `snare`: `snare` bám theo người chơi tới lúc rơi nên đi bộ không né được; card yêu cầu né được.
- Trống đồng GĐ 1 chưa `alive`: nếu không, đuốc ném gần trống bị trống chặn và mất (phát hiện lúc test). Lời nhắc `drumLocked` chuyển sang `hooks.onAttackWindow`.
- Thanh sợ đặt dưới hộp thông báo, ở y 36, vì hộp thông báo đè lên vị trí đầu tiên.
- **Thêm ngoài card:** phủ tối dải đất lúc vẽ (`NIGHT_GROUND`), vì tile đất chung là tile ban ngày, xanh sáng lệch cảnh đêm. Không đổi ảnh. Người dùng có thể bỏ nếu không thích.

**Không phải do phiên này:** 3 file `docs/SUTA_TQP_TASK_*` vẫn đang ở trạng thái bị xoá.

## Kết quả test
| # | Test | Kết quả |
|---|---|---|
| T1 | Dựng cảnh | PASS — ảnh chụp: boss đúng sàn lầu, cung thủ đúng lối đi, nước đúng máng; request lỗi 0, không hộp tạm |
| T2 | Nước sôi | PASS — nghỉ 2,4 / báo 0,8 / đổ 1,2 s; đứng dưới −1 máu; lướt qua 0 máu; có vạch báo |
| T3 | Đá rơi | PASS — báo 0,6 s, rơi, nằm 0,6 s, vỡ 0,4 s rồi biến; đứng yên −1 máu; không có hazard chặn đường |
| T4 | Cung thủ | PASS — 7 phát trong 12,5 s, boss `command` 7 lần; GĐ 2 `fireRange` −1 |
| T5 | Đuốc, bình máu | PASS — hạ 4 lính được đúng 2 đuốc (cap); bình máu 36/120 = 30 %, 120 mẫu, kỳ vọng 25 % |
| T6 | Trụ gác | PASS — chém 0 tác dụng + câu nhắc; đuốc trúng cháy, +10; đủ 4 trụ vào GĐ 2 ở đúng 40 |
| T7 | Trống | PASS — đấm trống chưa mở 40 → 40; không phần thưởng 10 cú (46…100); có phần thưởng 7 cú (49…94, 100) |
| T8 | Kỹ năng | PASS — K: lính 70 → 35 px/s, tên 198 → 99 px/s, cung thủ 3,2 → 6,4 s, 6 s, hồi 14 s, hết thì trả lại. L: lính gần choáng 3 s, đứng yên, lính ngoài 240 px không; GĐ 2 40 → 48; hồi 18 s. Sức Địch Ngàn Người: lính 2 máu 1 nhát, không có thì còn 1 máu. Ô HUD, nút cảm ứng, dòng trợ giúp đúng |
| T9 | Cutscene | PASS — collapse → story1 → gate → march → enter → story2 → panel; script so §5.2 2/2 câu, §5.3 3/3 đoạn khớp; `level3Complete: true` |
| T10 | Không phần thưởng | PASS — bot không né, không kỹ năng thắng trong 51,8 s, không kẹt |
| T11 | Hồi quy | PASS — 21 trang (18 màn, `?layout=engine`, `?layout=skills`, `?viewer=1`): dựng được, 120 frame, 0 lỗi JS; `pytest`: xem cuối report |
| T12 | Chơi tay | PASS — người dùng chơi thử, báo ổn 09/11/2026 |

**Số đo giao diện:** 812×375 canvas 523×221, cuộn dọc 33 px, bằng đúng màn 3 chương 5 (do dòng trợ giúp phím trên máy không cảm ứng), không phải lỗi mới.

**Giới hạn:** các phép đo dùng mô phỏng và dịch chuyển người chơi. Ảnh chụp chỉ dùng bản nam; bản nữ dùng chung logic, chưa chụp màn này. Bot trúng 21 đòn trong 52 s vì không né, nên chưa biết độ khó khi người chơi né thật. Thưởng vàng và thành tựu qua API thật chưa kiểm, vì chế độ `?debug=1` không gửi kỷ lục.

## Vấn đề asset
Không có.

## Câu hỏi cho team / TODO
- Trang phục, dáng Cao Chính Bình và chi tiết trống đồng.
- Tiếp theo: prompt nhạc chương 6 (Gemini).

`pytest tests`: 149 passed, 1 skipped (`test_app.py` thiếu `SUTA_TEST_DATABASE_URL`, chưa chạy).
