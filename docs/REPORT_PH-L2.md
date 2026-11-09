# REPORT PH-L2 — Màn 2 "Tụ nghĩa chiêu hiền" (bố cục thật + asset `PH_ART_02`)

Ngày: 09/11/2026 • **PASS, còn chờ chơi tay (L10)**. Test tự động chạy bằng `update(1/60)` + giả lập phím trên trình duyệt thật.
Task card: [SUTA_PH_TASK_L2_01.md](SUTA_PH_TASK_L2_01.md). Yêu cầu người dùng: làm màn 2 chương Phùng Hưng theo task card đã duyệt.

## Hiện trạng / đo trước khi sửa
- `pytest tests`: 149 passed, 1 skipped.
- Màn 2 là khung 4 chunk, 2 lính, 3 bia, dùng nền mượn chương 5.

## Quyết định (người dùng chốt, 09/11/2026, theo đề xuất)
- Q1: danh xưng lấy nguyên văn Excel: "Em trai, sức địch ngàn người", "Mưu sĩ xuất chúng", "Tướng tài kiệt xuất — Tương truyền".
- Q2: màn 2 chỉ dùng lính, lính khiên, đá ong, thợ săn, rào, hào; không có hổ, trâu, xe muối.
- Q3: hào chông màn 2 hẹp 96 px, nhảy chạy qua được.
- Từ đợt asset: hình dáng 3 NPC theo đề xuất trong prompt, do sử sách không tả; chấp nhận `NPC_DO_ANH_HAN` và chân dung 34 màu.

## Kết quả soát `PH_ART_02` (prompt đã xoá)
- Gate B1: 1 lượt sửa màu (áo Đỗ Anh Hàn từ tím sang chàm, đai chân dung Phùng Hải theo sprite). Còn khoảng 16–29 pixel màu tím cũ mỗi ô ở nét viền, không thấy khi xem.
- Gate B2: 1 lượt sửa `ITEM_PH_WEAPON` (rìu thành cuốc, bỏ 12 đốm đỏ).
- Toàn bộ `IN_GAME`. `FX_BT_STUN` chép từ chương 2, chỉ có ở bản chạy `manifest_ph.json`.

## File đã sửa / tạo / xoá
| File | Việc |
|---|---|
| `js/levels/phung-hung/config.js` | `LEVEL2_*`, `LEVEL2`, `CAPTORS`, `QUIZ.level2Spots`, `LEVEL_SPRITES[2]`, `PORTRAITS`, `NPC_SPRITES`, `MAP_PROPS_IN_GAME`; bỏ `BG_MHD_MID_SA_NAM` khỏi `BORROWED_MAPS` |
| `js/levels/phung-hung/level2.js` | Viết lại: bố cục thật, NPC khoá 2 loại vật phẩm, vật giấu trong rào và lính khiên |
| `js/levels/phung-hung/level1.js` | Chỉ thêm `export` cho `makeSoldier`, `makeShield`, `makeRock`, `makeTreeHunter`, `updateRocks` |
| `js/levels/phung-hung/chapter.js` | `events`, `summary` màn 2 |
| `js/levels/phung-hung/dialogue-data.js` | `NPC_DIALOGUES` 3 NPC, nguyên văn PH-00 §4 |
| `images/phung-hung/{sprites,maps}-32bit/` | 20 ảnh và 16 mục manifest của `PH_ART_02` |
| `.claude/rules/phung-hung-gameplay.md`, `docs/SUTA_PH_TASK_{00,L2_01}.md` | Ghi lại |
| `docs/CODEX_PROMPT_PH_ART_02.md` (xoá) | Asset đã duyệt hết |

Không sửa `js/engine/` và file chương 1–5.

**Câu kỹ thuật mới (không có nội dung lịch sử):** dòng tổng kết màn 2.

**Không phải do phiên này:** 3 file `docs/SUTA_TQP_TASK_*` vẫn đang ở trạng thái bị xoá.

## Kết quả test
| # | Test | Kết quả |
|---|---|---|
| L1 | Dựng đủ | PASS — 7680 px; 10 sách (3 giấu), 3 vũ khí (2 giấu), 3 NPC 3+1 / 6+2 / 10+3, 3 bia đúng pool; không cảnh báo khoảng cách NPC, địa hình; không request lỗi; không hộp tạm |
| L2 | NPC khoá | PASS — ở cả 3 NPC: thiếu 1 sách hoặc thiếu 1 vũ khí đều bị giữ cách 12 px, câu nhắc đúng số; đủ nhưng còn lính vây thì nhắc hạ lính; hạ hết thì mở hội thoại |
| L3 | Hội thoại | PASS — tên, danh xưng, chân dung đúng; script đối chiếu 27 câu với PH-00 §4, 0 câu lệch; chọn sai −1 máu và hiện gợi ý; trả lời đúng lần lượt có `BUFF_PH_POWER`, `SK_PH_SUPPLY_CUT`, `SK_PH_FIRE_DRUM` |
| L4 | Vật giấu | PASS — rào 3 → 0 bằng 3 đòn thường, hiện vũ khí/sách, nhặt được; lính khiên: đòn thường 6 → 6 + câu nhắc, 2 đòn gồng 6 → 3 → 0, hiện sách; sách cao 64 lấy được bằng nhảy |
| L5 | Hào hẹp | PASS — nhảy chạy qua, không mất máu; đi bộ rơi −1 máu, về cách mép 21 px |
| L6 | HUD | PASS — ô vũ khí hiện icon `ITEM_PH_WEAPON`, đếm 0/3 → 1/3; "Đã thu thập Vũ Khí Thô Sơ 1/3" |
| L7 | Nền | PASS — 3 vùng đúng theo ảnh chụp; 0 request `BG_MHD_MID_SA_NAM` |
| L8 | Nam + nữ, hồi quy | PASS — L1–L6 chạy bản nam, hình màn 2 chụp bản nữ; màn 1, `?layout=engine`, màn 3 khung nạp xong, chạy 120 frame và vẽ không lỗi, 0 cảnh báo; request lỗi duy nhất là 401 tiến trình của khách; `?viewer=1` có đủ asset mới; `ITEM_PH_WEAPON` nạp ở cả `?layout=engine` nên hết hộp dự phòng |
| L9 | `pytest`, giao diện | PASS — 149 passed, 1 skipped (`test_app.py` thiếu `SUTA_TEST_DATABASE_URL`); 812×375: canvas 523×221, không thanh cuộn |
| L10 | Chơi tay | **CHƯA CHẠY** — chờ người dùng |

Về đích: panel "Hoàn thành Màn 2…", dòng tổng kết đúng, có nút "Sang Màn 3".

**Giới hạn:** các phép đo dùng mô phỏng, dịch chuyển người chơi và đặt thẳng số vật phẩm. Câu nhắc khi NPC khoá ghi số sách đã có, nhưng không ghi số vũ khí đã có (ô HUD có số này).

## Vấn đề asset
Không có.

## Câu hỏi cho team / TODO
- L10: người dùng chơi tay cả màn 1 và màn 2, sau đó chỉnh số `DESIGN_BASELINE` nếu cần.
- Tiếp theo: `PH_ART_03` + PH-L3.
