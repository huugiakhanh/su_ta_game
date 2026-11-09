# SỬ TA — CHƯƠNG 6: PHÙNG HƯNG
# TASK CARD: PH-L2 — MÀN 2 "TỤ NGHĨA CHIÊU HIỀN" (BỐ CỤC THẬT)

TASK_ID: PH-L2 • Version 1.0 • 09/11/2026 • **ĐÃ DUYỆT 09/11/2026** (Q1–Q3 theo đề xuất) • Xong phần code, chờ chơi tay; report [REPORT_PH-L2.md](REPORT_PH-L2.md)
Task card tổng: [SUTA_PH_TASK_00.md](SUTA_PH_TASK_00.md) (§3.2, §3.3, §4) • Asset: `PH_ART_02` (Gate B1 + B2 đã `IN_GAME`, đã chép vào `images/phung-hung/`; prompt đã xoá)
Mẫu: màn 2 Mai Hắc Đế ([SUTA_MHD_TASK_L2_01.md](SUTA_MHD_TASK_L2_01.md), `js/levels/mai-hac-de/level2.js`) • Cơ chế: PH-ENGINE E1, E5, E6
Rule: `phung-hung-gameplay.md`, `engine.md`, `assets-32bit.md`, `history-content.md`

---

## 0. MỤC TIÊU

Thay khung màn 2 (4 chunk, 2 lính, 3 bia) bằng màn thật:
- **10 chunk cố định**, 3 vùng cảnh: Đường Lâm → đường tiếp tế → ngoại thành Tống Bình.
- **3 NPC** khoá bằng cả sách lẫn vũ khí: Phùng Hải (3 sách + 1 vũ khí) → Đỗ Anh Hàn (6 + 2) → Bồ Phá Cần (10 + 3). Mỗi NPC có 2 lính vây và 1 bia trước mặt.
- **10 Quyển Sách Tinh Hoa + 3 Vũ Khí Thô Sơ**, có món ở chỗ khó (trên cao, trong rào, lính khiên mang).
- Thoại 3 NPC chép **nguyên văn** PH-00 §4; 3 phần thưởng ghi vào tiến trình.

**Không làm:** tác dụng phần thưởng, kỹ năng K/L, 3 icon và 3 FX (`PH-L3` khai báo), màn 3, nhạc riêng. **Không sửa engine.**

## 1. ASSET VÀ ENGINE

| Thực thể | Asset | Khai báo |
|---|---|---|
| 3 NPC + chân dung | `NPC_PHUNG_HAI`, `NPC_DO_ANH_HAN`, `NPC_BO_PHA_CAN`, `PORTRAIT_*` cùng tên | `LEVEL_SPRITES[2]`, `PORTRAITS`, `NPC_SPRITES` (id `phungHai`, `doAnhHan`, `boPhaCan` = khoá pool câu hỏi) |
| Vũ Khí Thô Sơ | `ITEM_PH_WEAPON` | Thêm vào `MAP_PROPS_IN_GAME` (`EXTRA_ITEMS.weapon` đã trỏ đúng ID) |
| 2 nền mới | `BG_PH_MID_SUPPLY_ROAD`, `BG_PH_MID_TONG_BINH_OUTSKIRTS` | `LEVEL2_ZONES` |
| Chướng ngại | sprite màn 1 | Thêm ID vào `LEVEL_SPRITES[2]` |

NPC khoá nhiều vật phẩm (`makeNpc(..., { requires, extras })`), quân vây `captorOf`, vật giấu `carrier` (cả cho vật phẩm phụ), cột chông `'^'` đều đã có trong engine.

## 2. BỐ CỤC (DESIGN_BASELINE — `config.js` `LEVEL2_*`)

| Chunk | Vùng (lớp giữa) | Nội dung | Sách | Vũ khí |
|---|---|---|---|---|
| 1 | `BG_PH_MID_DUONG_LAM` | đá ong 350, lính 600 | đất 150 | — |
| 2 | như trên | thợ săn trên cây 300, lính khiên 620 | lính khiên mang | đất 460 |
| 3 | như trên | bia 280 → **Phùng Hải** 560, 2 lính vây | đất 100 | — |
| 4 | `BG_PH_MID_SUPPLY_ROAD` | rào 300, lính 620 | trong rào | — |
| 5 | như trên | hào chông hẹp 320–416, đá ong 540, rào 640 | cao 64 ở 180 | trong rào |
| 6 | như trên | bia 280 → **Đỗ Anh Hàn** 560, 2 lính vây | đất 100 | — |
| 7 | `BG_PH_MID_TONG_BINH_OUTSKIRTS` | thợ săn trên cây 280, lính 620 | đất 150 | — |
| 8 | như trên | lính khiên 300, lính 520, đá ong 660 | lính khiên mang | — |
| 9 | như trên | rào 300, thợ săn trên cây 620 | cao 64 ở 150, đất 480 | trong rào |
| 10 | như trên | bia 280 → **Bồ Phá Cần** 560, 2 lính vây; đích `worldX(10, 672)`, không cổng | — | — |

- Dài 10 × 768 = **7680 px**. Trời `BG_TT_SKY_DAY`, đồi xa như màn 1.
- Sách: trước Phùng Hải 3, trước Đỗ Anh Hàn thêm 3, trước Bồ Phá Cần thêm 4 = 10. Vũ khí: 1 / 1 / 1 = 3.
- Đòn gồng vẫn cần cho lính khiên. Lính khiên hp 6 = 2 đòn gồng, như màn 1; rào phá bằng đòn thường.
- Hào chông chunk 5 rộng **6 cột = 96 px**, nhảy chạy qua được (nhảy chạy xa 115 px), không cần lướt như hào 160 px màn 1 (Q3).
- Không có hổ, trâu, xe muối (Q2).
- Kiểm bằng `checkNpcClearance`, `checkTerrainFootprints`.

## 3. NỘI DUNG LỊCH SỬ

- `dialogue-data.js` `NPC_DIALOGUES`: **nguyên văn PH-00 §4.1–4.3** (lời thoại, câu hỏi, đáp án đúng đứng đầu, gợi ý, vì sao đúng, phần thưởng). Không chép dòng ghi chú "(Claude sửa theo Q3…)" và phần "Lưu ý" trong card.
- Id NPC trùng khoá pool `NPC_QUESTION_POOLS`; bia trước NPC rút 1 câu trong pool đó (PH-00 §3.3).
- `name` / `title` xem Q1.
- Tên màn "Màn 2: Tụ nghĩa chiêu hiền" giữ nguyên.

**Câu kỹ thuật mới (không có nội dung lịch sử):** `summary` màn 2, theo mẫu màn 1: `Bạn thu thập ${sách}/10 Quyển Sách Tinh Hoa, ${vũ khí}/3 Vũ Khí Thô Sơ và đạt ${điểm} điểm.`

## 4. FILE

| Loại | File |
|---|---|
| Sửa | `js/levels/phung-hung/{config,level2,chapter,dialogue-data}.js` |
| Sửa nhỏ | `level1.js`: xuất `makeSoldier`, `makeShield`, `makeRock`, `makeTreeHunter`, bộ dựng rào, `updateRocks` để màn 2 dùng lại (không đổi hành vi màn 1) |
| Sửa tài liệu | `.claude/rules/phung-hung-gameplay.md`, `docs/SUTA_PH_TASK_00.md` §2, `docs/REPORT_PH-L2.md` (mới) |
| Chỉ đọc | `js/levels/mai-hac-de/level2.js` (mẫu, không import), `js/engine/*` |

## 5. TEST

| # | Kiểm tra | Cách đo |
|---|---|---|
| L1 | Dựng đủ: 10 sách (3 giấu: 2 lính khiên mang, 1 trong rào), 3 vũ khí (2 trong rào), 3 NPC, 3 bia; 7680 px; không cảnh báo khoảng cách NPC, địa hình; console sạch; không hộp tạm | `?debug=1`, đọc `state`, console |
| L2 | NPC khoá: thiếu sách hoặc thiếu vũ khí đều bị giữ, câu nhắc đúng số; đủ cả hai và hết lính vây thì hội thoại mở | 2 sách + 1 vũ khí, 3 sách + 0 vũ khí, 3 + 1; tương tự 6 + 2, 10 + 3 |
| L3 | Hội thoại: tên, danh xưng, chân dung đúng; thoại khớp từng chữ PH-00 §4 (đối chiếu bằng script); trả lời đúng thì tiến trình có `BUFF_PH_POWER`, `SK_PH_SUPPLY_CUT`, `SK_PH_FIRE_DRUM` | mô phỏng + `readProgress()` |
| L4 | Vật giấu: rào đổ, lính khiên chết thì hiện đúng sách / vũ khí; sách trên cao với tới bằng nhảy | mô phỏng |
| L5 | Hào hẹp: nhảy chạy qua, không mất máu; đi bộ rơi −1 máu, về sát mép | mô phỏng |
| L6 | HUD: ô đếm vũ khí hiện icon cuốc + gậy, đúng số; thông báo nhặt đúng | đọc DOM, chụp ảnh |
| L7 | Nền: 3 vùng nạp đúng, chỗ chuyển vùng không vệt; 0 request `BG_MHD_MID_SA_NAM` | network, ảnh |
| L8 | Nam + nữ; màn 1, màn 3 khung, `?layout=engine`, `?viewer=1` vẫn chạy | mô phỏng |
| L9 | `pytest tests`; 812×375 không cuộn | số đo |
| L10 | Chơi tay cả màn (người dùng) | |

## 6. CÂU HỎI CẦN CHỐT

| # | Câu hỏi | Đề xuất |
|---|---|---|
| Q1 | Danh xưng trên hộp thoại. PH-00 §4 chỉ có tên; Excel A1 ghi "Em trai, sức địch ngàn người", "Mưu sĩ xuất chúng", "Tướng tài kiệt xuất" | **Dùng nguyên văn Excel**; Bồ Phá Cần ghi "Tướng tài kiệt xuất — Tương truyền" theo PH-00 §4.3, cùng cách chương 5 |
| Q2 | Bố cục mục 2: chỉ dùng lính, lính khiên, đá ong, thợ săn, rào, hào; không hổ, trâu, xe muối | **Duyệt**: đã là bài học riêng ở màn 1. Trâu cưỡi đi 1500 px sẽ vượt qua nhiều sách và NPC |
| Q3 | Hào chông màn 2 hẹp 96 px, không cần lướt | **Duyệt**: dễ hơn hào màn 1, hợp màn chiêu mộ; hào 160 px có thể khó trên điện thoại |

## 7. GATE

1. Không sửa engine; không sửa file chương 1–5; số mới ghi `DESIGN_BASELINE`.
2. Test L1–L10 có số đo; FAIL hoặc sửa ngoài phạm vi → `BLOCKED`.
3. Report `/task-report`; chỉ commit khi người dùng yêu cầu. Sau đó: `PH_ART_03` (prompt Codex màn 3) + PH-L3.
