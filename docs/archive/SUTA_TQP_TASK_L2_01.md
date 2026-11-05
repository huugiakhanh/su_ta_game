# SỬ TA — CHƯƠNG 4: TRIỆU VIỆT VƯƠNG
# TASK CARD: TQP-L2 — MÀN 2 "HIỀN TÀI DẠ TRẠCH" (BỐ CỤC THẬT + ASSET TQP_ART_02)

TASK_ID: TQP-L2 • Version 1.0 • 05/11/2026 • **ĐÃ DUYỆT 05/11/2026** (kế hoạch trong chat, giữ nguyên văn §4.2 "(Triệu Việt Vương)") • **XONG 05/11/2026** (chơi tay OK; report [REPORT_TQP-L2.md](REPORT_TQP-L2.md))
Task card tổng: [SUTA_TQP_TASK_00.md](../SUTA_TQP_TASK_00.md) (§3.2, §4, §6) • Asset: `TQP_ART_02` (Gate B1 + B2 PASS, `IN_GAME` — commit beba708; tư liệu [RESEARCH_TQP_ART_BIBLE.md](RESEARCH_TQP_ART_BIBLE.md))
Mẫu: màn 2 Lý Nam Đế (`js/levels/ly-nam-de/level2.js` — 9 chunk cố định, 3 NPC + quân vây + bia câu hỏi trước NPC) • Cơ chế: TQP-ENGINE E6 (NPC khoá theo sách), E7 (ẩn nấp + đánh úp)
Rule: `trieu-quang-phuc-gameplay.md`, `engine.md`, `assets-32bit.md`, `history-content.md`

---

## 0. MỤC TIÊU

Thay khung màn 2 (4 chunk, 2 lính, 1 chông) bằng màn thật:
- **10 chunk cố định**: bờ sông Chu Diên (1–3) → trung du động Khuất Lão (4–6) → **đầm Dạ Trạch ban đêm** (7–10).
- **3 NPC** theo thứ tự Excel: Triệu Túc (cần 3 sách) → Lý Nam Đế ngồi (cần 6) → Chử Đồng Tử (cần 10, rồng vàng hiện sau lưng). Mỗi NPC có 2 lính vây và 1 bia câu hỏi trước mặt.
- **10 Quyển Sách Tinh Hoa** chia 3 / 3 / 4, có quyển ở chỗ khó (trên cọc tre, trên mỏm đá, trong bụi lau, lính mang).
- Đoạn Dạ Trạch có **2 bụi lau ẩn nấp** (E7).
- Thoại 3 NPC chép nguyên văn TQP-00 §4; 3 phần thưởng ghi vào tiến trình (tác dụng ở TQP-L3).

**Không làm:** tác dụng 3 phần thưởng, kỹ năng K/L, màn 3, nhạc riêng.

## 1. SỬA ENGINE (bật theo chương — chương khác không đổi)

| # | Thay đổi | File |
|---|---|---|
| 1 | Lớp vẽ `hooks.draw.beforeNpcs(time)` — vẽ trước NPC (rồng sau lưng Chử Đồng Tử; trước đây chỉ có `beforeEnemies`, vẽ SAU NPC) | `engine/render/index.js` |
| 2 | Trường màn `tiles?` ghi đè từng khoá của `CHAPTER.tiles` (ghép lại trong `setLevel`, bản gốc của chương giữ ở biến riêng) — đổi ảnh nước riêng màn 2 | `engine/chapter.js` |

## 2. BỐ CỤC (DESIGN_BASELINE — `config.js` `LEVEL2_*`)

| Chunk | Vùng (trời / lớp giữa) | Nội dung | Sách |
|---|---|---|---|
| 1 | ngày / `BG_LND_MID_CHU_DIEN` | lính tuần 600, chông ẩn 300, cọc tre 440 | đất 150, đỉnh cọc 440 |
| 2 | ngày / `BG_TQP_MID_REED_BANK` | khe thuyền tuần gọi viện + mỏm đá (`BOAT_RIVER`) | trên mỏm đá 488 |
| 3 | như trên | bia 280 → **Triệu Túc** 560 (cần 3), 2 lính vây | — |
| 4 | ngày / `BG_TQP_MID_KHUAT_LAO` | rắn trong bụi cỏ 240, mỏm đá 380 (cao 48), cung thủ trên cây 620 | trên mỏm đá 412 |
| 5 | như trên | 2 lính giáo dài 260 / 600 (+ cọc tre trước mặt) | lính giáo 600 mang |
| 6 | như trên | bia 280 → **Lý Nam Đế** 560 (cần 6), 2 lính vây | đất 100 |
| 7 | **đêm** / `BG_TQP_MID_DA_TRACH_NIGHT` | **bụi lau** 200–392 + 2 lính tuần đi xuyên | giữa bụi lau 296 |
| 8 | như trên | khe cá sấu (`CROC_RIVER`) + khói 2 làn ô b | sau khe 440 |
| 9 | như trên | sình ô a, **bụi lau** 400–592, lính tuần mang sách 500, cung thủ trên cây 700 | đất 90, lính mang |
| 10 | như trên | bia 280 → **Chử Đồng Tử** 560 (cần 10) + rồng, 2 lính vây; đích `worldX(10, 672)` | — |

- Đồi xa `BG_LND_FAR_MIDLANDS` (mượn chương 3), tắt dưới `BG_TQP_SKY_NIGHT` (trời đêm có sẵn chân trời). Engine hoà trời + lớp giữa ngày → đêm ở ranh giới vùng.
- Nước khe cả màn: `PROP_TQP_SWAMP_WATER` (xanh rêu, `waterLift` 6, vách `#2c3820`). Màn 1 giữ nước nâu chương 3.
- NPC ngồi/trên mây rộng hơn thân người → `holdGap` 16 (Lý Nam Đế, Chử Đồng Tử).
- Bụi lau `PROP_TQP_REED_COVER` lặp mỗi 64 px trong vùng nấp, vẽ trước người chơi; **người chơi ở trong thì vẽ mờ 55%** (đo khi chụp: bụi đặc che kín nhân vật — người dùng không thấy mình).
- Rồng `FX_TQP_GOLDEN_DRAGON`: khi đủ 10 sách và cách Chử Đồng Tử < 420 px thì `appear` (0,5 s) rồi `idle` lặp, vẽ sau NPC, mờ theo NPC khi gặp xong.

## 3. NỘI DUNG LỊCH SỬ

- `dialogue-data.js` `NPC_DIALOGUES`: **nguyên văn TQP-00 §4.1–4.3** (lời thoại, câu hỏi, đáp án — đúng đứng đầu, gợi ý, vì sao đúng, phần thưởng). `name`/`title` tách từ tiêu đề mục §4.x: "Thái phó Triệu Túc" / "cha Triệu Quang Phục"; "Lý Nam Đế" / "Lý Bí — Quân vương"; "Chử Đồng Tử" / "Nhân vật huyền thoại — Đạo sĩ hiển linh".
- §4.2 "Vì sao đúng" giữ "(Triệu Việt Vương)" như bản đã duyệt; nghi vấn *Dạ Trạch Vương* vẫn ở TQP-00 mục 7 dòng 5 chờ team.
- Bia câu hỏi rút 1 câu ngẫu nhiên từ pool NPC (`NPC_QUESTION_POOLS`, §3.3).
- Tên màn "Màn 2: Hiền tài Dạ Trạch" vẫn là nháp §5.1.

## 4. TEST CASE

| # | Kiểm tra | Cách đo |
|---|---|---|
| T1 | Nội dung dựng đủ: 10 sách (2 ẩn theo lính), 3 NPC `requires` 3/6/10, 3 bia, 2 vùng nấp, 3 khe, không cảnh báo khoảng cách NPC/địa hình | mô phỏng `?debug=1`, đọc `state` + console |
| T2 | NPC khoá: thiếu sách → giữ lại + "Cần N Quyển Sách Tinh Hoa…", không mở hội thoại; đủ sách (và hết lính vây) → hội thoại mở | mô phỏng: 0 → 3 sách (Triệu Túc), 5 → 6 (Lý Nam Đế), 9 → 10 (Chử Đồng Tử) |
| T3 | Hội thoại: tên/danh xưng/chân dung đúng, trả lời đúng → nhận phần thưởng; tiến trình có đủ `BUFF_TQP_VITALITY`, `SK_TQP_RALLY`, `SK_TQP_DRAGON_CLAW` | mô phỏng + `readProgress()` |
| T4 | Ẩn nấp: đứng trong bụi lau 10 s, lính đi xuyên → không mất máu; đứng ngoài → bị đánh | mô phỏng, đo máu |
| T5 | Rồng hiện sau Chử Đồng Tử khi đủ sách, `appear` → `idle` | chụp canvas |
| T6 | Nước xanh rêu ở màn 2, màn 1 vẫn nước nâu | `CHAPTER.tiles.water` từng màn |
| T7 | Bot hồi quy 12 màn của 4 chương: không lỗi JS | bot iframe |
| T8 | `pytest tests` | 0 FAIL |
| T9 | Chơi tay cả màn (người dùng) | PASS 05/11 |
