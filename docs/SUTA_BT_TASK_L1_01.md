# SỬ TA — CHƯƠNG 2: BÀ TRIỆU
# TASK CARD: BT-L1 — MÀN 1 "RỪNG NÚI NƯA" (BỐ CỤC THẬT)

TASK_ID: BT-L1 • Version 1.0 • 17/10/2026 • **ĐÃ DUYỆT 17/10/2026** (Q1–Q4 theo đề xuất, gồm 5 câu thoại Bà Triệu §3) • **XONG 19/10/2026** (chơi thử OK, asset → `IN_GAME`; report [REPORT_BT-L1.md](REPORT_BT-L1.md))
Task card tổng: [SUTA_BT_TASK_00.md](SUTA_BT_TASK_00.md) (§3.1, §5.1) • Asset: [REPORT_BT-ART-01.md](REPORT_BT-ART-01.md)
Mẫu: màn 1 Trưng Trắc (`js/levels/trung-trac/level1.js` — nhóm chướng ngại xáo mỗi lượt, mini-boss cố định, bia câu hỏi, sách)
Rule: `ba-trieu-gameplay.md`, `engine.md`

---

## 0. MỤC TIÊU

Thay bố cục khung (6 chunk, cố định) bằng màn 1 thật theo thiết kế team: **12 chunk**, **8 loại chướng ngại** của Excel, **mini-boss
tham quan thu thuế** trước cổng trại, 5 Quyển Sách Tinh Hoa, 4 câu hỏi chặn đường, Bà Triệu dẫn đầu màn. Chơi thử, chỉnh số, rồi
đổi status asset BT_ART_01 → `IN_GAME`.

**Không làm:** màn 2–3, kỹ năng, engine mới (mọi cơ chế đã có ở BT-ENGINE A/B). Thiếu gì ở engine → dừng và báo.

## 1. BỐ CỤC (DESIGN_BASELINE)

| Chunk | Vùng (lớp giữa) | Ghi chú |
|---|---|---|
| 1 | làng Quan Yên (`BG_TT_MID_VILLAGE` mượn) | Bà Triệu đứng chờ (NPC dẫn), chỉ nhóm "dễ" |
| 2–3 | rừng nứa (`BG_BT_MID_NUA_FOREST`) | |
| 4–5 | rừng thiêng (`BG_BT_MID_SACRED_FOREST`) | nhóm chướng khí bắt buộc nằm ở đây |
| 6–8 | sườn núi đá (`BG_BT_MID_ROCKY_SLOPE`) | đá lăn, voi rừng ưu tiên ở đây; bậc đất |
| 9–10 | rừng nứa | |
| 11–12 | doanh trại (`BG_BT_MID_CAMP`) | mini-boss chunk 11, cổng trại tâm tại `worldX(12, 618)` = đích (như chương 1) |

- Độ dài 12 × 768 = **9216 px** = `stage_length` của `maps_bt.json` (hết cảnh báo "stage khác").
- 5 sách ở vị trí cố định; 4 bia câu hỏi ở chunk 3, 5, 8, 10 (như chương 1), rút 4 câu không trùng từ `LEVEL1_QUESTION_POOL`.
- Cổng mở khi đủ 5 sách + hạ mini-boss (engine `bossAlive()` + `itemsCollected`).

## 2. CHƯỚNG NGẠI — ĐÚNG 12 KỂ CẢ MINI-BOSS

11 nhóm xáo mỗi lượt vào chunk 1–10 (lệch ±60 px; nhóm có địa hình lệch bội số 16 px), mỗi nhóm có **vùng được phép** để giữ
đúng cảnh (Excel: chướng khí ở rừng thiêng, đá lăn từ dốc núi…):

| # | Nhóm | Cơ chế (engine có sẵn) | Vùng được phép | Số DESIGN_BASELINE |
|---|---|---|---|---|
| 1–2 | Lính đốn gỗ (×2) | `guard` (`EN_NGO_LUMBERJACK`) | mọi chunk 2–10 | hp 2, rìu sát thương 2, nghỉ 1,8 s |
| 3–4 | Thợ săn nỏ trong bụi (×2) | `thrower` + `crossbowBolt` | 2–10 | hp 2, bắn mỗi 3,0 s, tầm 240 |
| 5–6 | Đá tảng lăn (×2) | `roller` có hp (chém vỡ / nhảy qua) | sườn đá 6–8 (1 cái được ra ngoài nếu thiếu chỗ) | hp 2, tốc độ 100 px/s (nới cửa sổ nhảy — bản khung 120 quá hẹp) |
| 7 | Voi rừng | `roller` + `ride` (nhảy lên lưng) | sườn đá 6–8 | hp 0, tốc độ 60 px/s |
| 8–9 | Hố chông tre (×2) | `trap` | mọi chunk 1–10 (nhóm "dễ") | bật khi cách 58 px |
| 10 | Kỵ binh Ngô | `roller` | 2–10 | hp 3, tốc độ 190 px/s, kích hoạt từ ngoài màn hình |
| 11 | Chướng khí rừng thiêng | 3 `vent` lệch nhịp + 3 cành dài bục cao 60 | rừng thiêng 4–5 | chu kỳ 1,6 / 0,6 / 1,2 s, lướt không né |
| 12 | **Mini-boss tham quan thu thuế** | `patrol` + `silverChest`, `boss: true` | **cố định chunk 11** | hp 6, đi tuần 160 px @30, ném khi trong 240 px, mỗi 2,5 s |

- Chunk 1 chỉ nhận nhóm "dễ" (hố chông) — như chương 1.
- Thêm vài bậc đất ở sườn đá (lưới chữ đi theo nhóm, như chương 1); không đặt bậc trong 130 px đầu chunk, không đè bia/sách.
- Kiểm bố cục bằng hàm sẵn có: `checkTerrainFootprints`, `checkPlatformReach`.

## 3. NỘI DUNG CHỮ

- Thông báo đầu màn: dùng nguyên văn BT-00 §5.1 (đã duyệt, đã có trong code).
- **Bà Triệu dẫn màn** — thoại mở đầu **ĐÃ DUYỆT 17/10/2026** (Source of Truth, chép nguyên văn vào `dialogue-data.js`):
  1. "Ngươi từ làng Quan Yên tìm lên núi Nưa, muốn theo nghĩa quân phải không?"
  2. "Quan lại Đông Ngô tham tàn, cướp bóc dân lành, bắt dân nộp thuế nặng."
  3. "Ta muốn tụ nghĩa binh. Nhưng muốn đánh giặc, nghĩa quân phải có Quyển Sách Tinh Hoa."
  4. "Hãy vượt rừng nứa, rừng thiêng, tìm đủ 5 Quyển Sách Tinh Hoa, rồi hạ tên tham quan thu thuế chặn đường tới doanh trại."
  5. "Đi đi, nghĩa sĩ. Ta chờ ngươi ở núi Nưa!"
- Thông báo trúng đòn/hạ địch (thợ săn, kỵ binh, chông, voi, đá, chướng khí, mini-boss): câu ngắn kiểu chương 1, không nội dung lịch sử.
- Chương 1 có "nghỉ chân hồi 1 máu" (chunk 9) + 1 dòng cốt truyện (chunk 10) — Q2.

## 4. FILE

| Loại | File |
|---|---|
| Sửa | `frontend/static/js/levels/ba-trieu/{config,level1,chapter,dialogue-data}.js` |
| Sửa (sau chơi thử) | status `NORMALIZED` → `IN_GAME` trong `manifest_bt.json` / `maps_bt.json` (bản nguồn `assets/…/ba-trieu/` rồi chép lại bản chạy) |
| Sửa tài liệu | `.claude/rules/ba-trieu-gameplay.md`, `docs/REPORT_BT-L1.md` (mới) |
| Chỉ đọc | `js/levels/trung-trac/level1.js` (mẫu, không import), `js/engine/*` |

Giữ layout thử `?layout=engine`.

## 5. TEST

| # | Test |
|---|---|
| L1 | Màn dài 9216 px, 5 vùng cảnh đúng chunk, không còn cảnh báo "stage khác"; console sạch (trừ 401 khách) |
| L2 | Đúng 12 chướng ngại kể cả mini-boss; 10 lượt tải lại: chunk 1 chỉ hố chông, chướng khí luôn ở chunk 4–5, voi luôn ở 6–8 |
| L3 | Từng loại hoạt động: rìu −2 máu ở ô hit 7; nỏ bắn tên ở ô 5, chém tan tên; đá lăn nhảy qua được / chém 2 đòn vỡ; đứng lên lưng voi được chở; chông bật khi tới gần; kỵ binh lao từ ngoài màn hình; chướng khí trúng lúc phun, an toàn trên cành, lướt vẫn trúng |
| L4 | Mini-boss chunk 11: đi tuần, dừng ném hòm đúng ô 4, chém 6 đòn hạ; chưa hạ hoặc thiếu sách thì cổng đóng và bị giữ lại; đủ thì cổng mở, qua đích → "Sang Màn 2" |
| L5 | Bà Triệu chờ ở chunk 1, hội thoại mở đầu (nếu Q1 duyệt), mờ dần sau khi nói |
| L6 | 4 câu hỏi không trùng; nhặt đủ 5 sách |
| L7 | Chơi tay hết màn ít nhất 1 lần (người dùng hoặc Claude), ghi thời gian; chỉnh số nếu quá dễ/khó |
| L8 | `pytest tests` PASS; `/verify-ui` desktop + điện thoại ngang; hồi quy 3 màn Trưng Trắc không cần (không sửa engine) |

## 6. CÂU HỎI CẦN CHỐT

| # | Câu hỏi | Đề xuất |
|---|---|---|
| Q1 | Duyệt 5 câu thoại mở đầu của Bà Triệu (§3)? | **Duyệt** (sửa chữ nếu muốn) — Bà Triệu dẫn màn như Trưng Trắc |
| Q2 | Có "nghỉ chân hồi 1 máu" + dòng cốt truyện giữa màn như chương 1? | **Có nghỉ chân** (chunk 9), **bỏ dòng cốt truyện** (chưa có câu đã duyệt) |
| Q3 | Xáo trong vùng được phép (§2) hay đặt cố định hoàn toàn? | **Xáo trong vùng** — chơi lại không nhàm, vẫn đúng cảnh |
| Q4 | Mini-boss 6 đòn như kiệu quan chương 1? | **6 đòn** |

## 7. GATE
1. Không sửa engine, không sửa file Trưng Trắc; số mới ghi `DESIGN_BASELINE`.
2. Test L1–L8 có số đo; FAIL hoặc sửa ngoài phạm vi → `BLOCKED`.
3. Report `/task-report`; chỉ commit khi người dùng yêu cầu. Sau đó: `BT_ART_02` (prompt Codex màn 2) + BT-L2.
