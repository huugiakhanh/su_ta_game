# SỬ TA — CHƯƠNG 5: MAI HẮC ĐẾ
# TASK CARD: MHD-L2 — MÀN 2 "DỰNG CỜ VẠN AN" (BỐ CỤC THẬT + ASSET MHD_ART_02)

TASK_ID: MHD-L2 • Version 1.0 • 08/11/2026 • **ĐÃ DUYỆT 08/11/2026** (Q1–Q3 theo đề xuất) • **XONG 08/11/2026** (chơi tay OK, asset → `IN_GAME`; report [REPORT_MHD-L2.md](REPORT_MHD-L2.md))
Task card tổng: [SUTA_MHD_TASK_00.md](SUTA_MHD_TASK_00.md) (§3.2, §4) • Asset: `MHD_ART_02` (Gate B1 + B2 PASS, chép vào game, status còn `NORMALIZED`; kết luận ở mục 10–11 của prompt `MHD_ART_02` (đã xoá sau MHD-L3))
Mẫu: màn 2 Triệu Việt Vương ([archive/SUTA_TQP_TASK_L2_01.md](archive/SUTA_TQP_TASK_L2_01.md), `js/levels/trieu-quang-phuc/level2.js`: 10 chunk cố định, 3 NPC khoá theo sách 3/6/10, 2 lính vây + 1 bia câu hỏi trước mỗi NPC, lính/xe mang sách)
Rule: `mai-hac-de-gameplay.md`, `engine.md`, `assets-32bit.md`, `history-content.md`

---

## 0. MỤC TIÊU

Thay khung màn 2 (4 chunk, 2 lính, 3 câu hỏi) bằng màn thật:
- **10 chunk cố định**: đường Hoan Châu (1–3) → đồng Sa Nam, dãy Hùng Sơn (4–6) → bờ sông Lam (7–10).
- **3 NPC** theo thứ tự MHD-00 quyết định 4: Mẹ Mai Thúc Loan (cần 3 sách) → Hào kiệt Sa Nam (cần 6) → Sứ giả Lâm Ấp (cần 10). Mỗi NPC có 2 lính áp giải vây và 1 bia câu hỏi trước mặt.
- **10 Quyển Sách Tinh Hoa** chia 3 / 3 / 4, có quyển ở chỗ khó (trên cao, trong xe cống, lính mang).
- Chướng ngại lấy từ màn 1 (MHD-00 §3.2), đặt cố định.
- Thoại 3 NPC chép **nguyên văn** MHD-00 §4 (duyệt 08/11/2026); 3 phần thưởng ghi vào tiến trình (tác dụng ở MHD-L3).

**Không làm:** tác dụng phần thưởng, kỹ năng K/L, FX vỏ bọc, icon trên HUD (dùng ở MHD-L3), màn 3, nhạc riêng.

## 1. ASSET VÀ ENGINE

- Asset `MHD_ART_02` đã nằm trong `images/mai-hac-de/`. Màn 2 dùng:
  - 3 NPC + 3 chân dung (thêm vào `LEVEL_SPRITES[2]`, `PORTRAITS`, `NPC_SPRITES`);
  - 2 nền `BG_MHD_MID_SA_NAM`, `BG_MHD_MID_LAM_RIVER`;
  - sprite màn 1 cho chướng ngại (thêm ID vào `LEVEL_SPRITES[2]`).
- 3 icon + `FX_MHD_VAN_AN_SHELL` để MHD-L3 khai báo; status giữ `NORMALIZED` tới lúc đó.
- Sau chơi tay: 6 mục NPC/chân dung + 2 nền → `IN_GAME` (bản nguồn rồi chép lại).
- **Không sửa engine.** NPC khoá theo sách (E6), quân vây `captorOf`, xe/lính mang sách (`carrier`) đã có.

## 2. BỐ CỤC (DESIGN_BASELINE — `config.js` `LEVEL2_*`)

| Chunk | Vùng (lớp giữa) | Nội dung | Sách |
|---|---|---|---|
| 1 | `BG_MHD_MID_TRIBUTE_ROAD` | lính áp giải 600, cung thủ núp bụi 300 | đất 150 |
| 2 | như trên | xe cống chở sách 300 + lính canh, đá lăn 600 | trong xe |
| 3 | như trên | bia 280 → **Mẹ Mai Thúc Loan** 560 (cần 3), 2 lính vây | đất 100 |
| 4 | `BG_MHD_MID_SA_NAM` | tháp lao 300, lính áp giải 600 | cao 64 ở 450 (nhảy) |
| 5 | như trên | hổ + cửa hang 420 | đất 100, lính áp giải 650 mang |
| 6 | như trên | bia 280 → **Hào kiệt Sa Nam** 560 (cần 6), 2 lính vây | cao 60 ở 120 |
| 7 | `BG_MHD_MID_LAM_RIVER` | kỵ binh phi ngang (báo trước như màn 1), cung thủ núp bụi 600 | đất 150 |
| 8 | như trên | 2 lính áp giải 260 / 600, đá lăn 420 | cao 64 ở 420 |
| 9 | như trên | xe cống chở sách 300 + lính canh, tháp lao 620 | trong xe, đất 100 |
| 10 | như trên | bia 280 → **Sứ giả Lâm Ấp** 560 (cần 10), 2 lính vây; đích `worldX(10, 672)` | — |

- Trời `BG_TT_SKY_DAY`, đồi xa `BG_LND_FAR_MIDLANDS` như màn 1. Dài 10 × 768 = **7680 px**. Không khe nước: sông Lam chỉ ở nền xa (Gate B2).
- Sách: 7 cố định + 2 trong xe + 1 lính mang = 10; trước Mẹ có 3, trước Hào kiệt thêm 3, trước Sứ giả thêm 4.
- Xe cống ở màn 2 **không** `frees` (xem Q2).
- Kiểm bằng `checkNpcClearance`, `checkTerrainFootprints`.

## 3. NỘI DUNG LỊCH SỬ

- `dialogue-data.js` `NPC_DIALOGUES`: **nguyên văn MHD-00 §4.1–4.3** (lời thoại, câu hỏi, đáp án — đúng đứng đầu, gợi ý, vì sao đúng, phần thưởng). `name`/`title` tách từ tiêu đề mục: "Mẹ Mai Thúc Loan" / "Mai Thị — Tương truyền"; "Hào kiệt Sa Nam" / "Người bạn chiến đấu đắc lực"; "Sứ giả nước Lâm Ấp" / không có danh xưng.
- Id NPC trùng khoá pool câu hỏi: `maThi`, `thucBao`, `suGia` (§3.3). Bia trước NPC rút 1 câu ngẫu nhiên trong pool đó.
- Tiêu đề bia do engine ghi "Câu hỏi về <tên NPC>". Pool `maThi` hỏi về xuất thân Mai Thúc Loan, pool `thucBao` về căn cứ, nên tiêu đề sẽ là "Câu hỏi về Mẹ Mai Thúc Loan", "Câu hỏi về Hào kiệt Sa Nam" — **xem Q3**.
- Tên màn "Màn 2: Dựng cờ Vạn An" (duyệt 07/11).

## 4. FILE

| Loại | File |
|---|---|
| Sửa | `js/levels/mai-hac-de/{config,level2,chapter,dialogue-data}.js` |
| Sửa nhỏ | `level1.js`: xuất `makeSoldier`, `makeCart`, các hàm dựng nhóm chướng ngại để màn 2 dùng lại (không đổi hành vi màn 1) |
| Sửa (sau chơi thử) | status 6 mục NPC/chân dung + 2 nền → `IN_GAME` ở `manifest_mhd.json` / `maps_mhd.json` (bản nguồn rồi chép lại) |
| Sửa tài liệu | `.claude/rules/mai-hac-de-gameplay.md`, `docs/SUTA_MHD_TASK_00.md` §2, `docs/REPORT_MHD-L2.md` (mới) |
| Chỉ đọc | `js/levels/trieu-quang-phuc/level2.js` (mẫu, không import), `js/engine/*` |

## 5. TEST

| # | Kiểm tra | Cách đo |
|---|---|---|
| T1 | Dựng đủ: 10 sách (3 ẩn trong xe/lính), 3 NPC `requires` 3/6/10, 3 bia, không cảnh báo khoảng cách NPC/địa hình; console sạch, không hộp tạm | mô phỏng `?debug=1`, đọc `state` + console |
| T2 | NPC khoá: thiếu sách → giữ lại + "Cần N Quyển Sách Tinh Hoa…"; đủ sách và hết lính vây → hội thoại mở | 2 → 3 sách (Mẹ), 5 → 6 (Hào kiệt), 9 → 10 (Sứ giả) |
| T3 | Hội thoại: tên, danh xưng, chân dung đúng; 3 câu thoại khớp nguyên văn §4; trả lời đúng → tiến trình có `BUFF_MHD_POWER`, `SK_MHD_VAN_AN_SHELL`, `SK_MHD_REINFORCE` | mô phỏng + `readProgress()` |
| T4 | Chướng ngại màn 1 chạy đúng ở màn 2 (kỵ binh báo trước, hổ, tháp lao, bụi che cung thủ); xe/lính mang sách thả sách khi bị hạ | mô phỏng |
| T5 | Màn 1, 3 và `?layout=engine` vẫn chạy | bot iframe |
| T6 | `pytest tests` | 0 FAIL |
| T7 | Chơi tay cả màn (người dùng) | |

## 6. CÂU HỎI CẦN CHỐT

| # | Câu hỏi | Đề xuất |
|---|---|---|
| Q1 | Bố cục §2 (3 vùng 3/3/4 chunk, chướng ngại đặt cố định, sách 3/3/4)? | **Duyệt** |
| Q2 | Xe cống ở màn 2 có thả dân phu, cộng `rescued` không? `rescued` hiện chỉ ghi khi qua màn 1 (MHD-00: "lòng dân" là cơ chế màn 1) | **Không**: xe màn 2 chỉ chở sách. Cộng ở màn 2 thì phải đổi cách ghi tiến trình |
| Q3 | Tiêu đề bia "Câu hỏi về Mẹ Mai Thúc Loan" / "…về Hào kiệt Sa Nam" trong khi câu hỏi nói về Mai Thúc Loan và căn cứ. Giữ hay đổi? | **Giữ**: cùng cách chương 4 (bia là câu hỏi trước khi gặp NPC đó). Đổi thì phải thêm trường tiêu đề vào engine |

## 7. GATE
1. Không sửa engine; không sửa file chương 1–4; số mới ghi `DESIGN_BASELINE`.
2. Test T1–T7 có số đo; FAIL hoặc sửa ngoài phạm vi → `BLOCKED`.
3. Report `/task-report`; chỉ commit khi người dùng yêu cầu. Sau đó: `MHD_ART_03` (prompt Codex màn 3) + MHD-L3.
