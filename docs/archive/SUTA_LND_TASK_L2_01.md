# SỬ TA — CHƯƠNG 3: LÝ NAM ĐẾ
# TASK CARD: LND-L2 — MÀN 2 "CHIÊU MỘ HIỀN TÀI" (BỐ CỤC THẬT + ASSET LND_ART_02)

TASK_ID: LND-L2 • Version 1.0 • 02/11/2026 • **ĐÃ DUYỆT 02/11/2026** (Q1–Q4 theo đề xuất) • **XONG 02/11/2026** (chơi tay OK; report [REPORT_LND-L2.md](REPORT_LND-L2.md))
Task card tổng: [SUTA_LND_TASK_00.md](../SUTA_LND_TASK_00.md) (§3.2, §4 — thoại 3 NPC đã duyệt 31/10) • Asset: `CODEX_PROMPT_LND_ART_02.md` — đã xoá khi xong LND-L3 (mục 10–12: Gate B1/B2 PASS, bảng màu 98 màu duyệt 02/11)
Mẫu: màn 2 Bà Triệu (`js/levels/ba-trieu/level2.js` — 9 chunk cố định, NPC bị vây, bia câu hỏi trước NPC, phần thưởng) • Màn 1 chương này (`level1.js` — sông, thuyền, lưới, tháp canh)
Rule: `ly-nam-de-gameplay.md`, `engine.md`, `assets-32bit.md`

---

## 0. MỤC TIÊU

Thay màn 2 khung (4 chunk, 3 câu hỏi, không NPC) bằng màn thật: **9 chunk đặt cố định**, giải cứu và gặp **Phạm Tu → Tinh Thiều → cha con
Triệu Túc**, mỗi NPC bị 2 lính Lương vây, 1 bia câu hỏi trước mỗi NPC, hội thoại + câu hỏi + phần thưởng **nguyên văn LND-00 §4**. Nhập
asset `LND_ART_02` vào bản chạy. **Không sửa engine** (mọi cơ chế đã có: gặp/giải cứu NPC, `holdGap`, phần thưởng, sông, lưới, tháp).

**Không làm:** kỹ năng/buff (Khiên Tô Lịch, Lương thảo dồi dào, Triều Cường) — cơ chế ở LND-L3; boss màn 3.

## 1. ASSET

- Chép **toàn bộ** mục mới của `manifest_lnd.json` (12 sprite) + `palette` không cần chép + `maps_lnd.json` (thêm `BG_LND_MID_CHU_DIEN`)
  sang `frontend/static/assets/images/ly-nam-de/`, giữ cấu trúc, chỉ file manifest tham chiếu (như LND-L1).
- Khai báo:
  - `NPC_SPRITES`: `phamTu`, `tinhThieu`, `trieuTuc` (`holdGap` ~40 — nhóm 2 người rộng ±33 logic, Triệu Quang Phục đứng trước).
  - `PORTRAITS`: + `PORTRAIT_PHAM_TU`, `PORTRAIT_TINH_THIEU`, `PORTRAIT_TRIEU_TUC`.
  - `LEVEL_SPRITES[2]`: 3 NPC + lính Lương, thuyền, hoả tiễn, lưới, chó săn, quan thu thuế, tiền chì, tháp + cung thủ + tên.
  - `CHAPTER.pickups.heal = { id: 'ITEM_LND_HEAL', anim: 'idle' }` (engine E4b) + thêm ID vào `LEVEL_SPRITES[1]` (layout thử
    `?layout=engine` rơi bình máu) và `[3]` (dùng ở LND-L3).
  - Đồi xa riêng màn `LEVEL.farHills` = `BG_BT_FAR_PLAIN` (đồng trũng, mượn chương 2 qua `BORROWED_MAPS`).
- Status → `IN_GAME` sau chơi thử: NPC, chân dung, nền Chu Diên, bình máu. **FX khiên/sóng + 3 icon** chép sẵn nhưng giữ `NORMALIZED`
  tới LND-L3 (chưa dùng).

## 2. BỐ CỤC (DESIGN_BASELINE)

| Chunk | Vùng (lớp giữa) | Nội dung |
|---|---|---|
| 1 | bờ sông Hồng (`BG_LND_MID_RED_RIVER`) | lưới trúc (local 300), lính tuần tiễu tuần tra |
| 2 | bờ sông Hồng | **khe sông + thuyền chiến + mỏm đá** (lưới `RIVER` như màn 1); bia câu hỏi **về Phạm Tu** local 680 |
| 3 | bờ sông Hồng | **Phạm Tu** local 560, 2 lính Lương vây |
| 4 | làng (`BG_TT_MID_VILLAGE`) | quan thu thuế ném tiền chì (local 440), chó săn |
| 5 | làng | tháp canh + cung thủ (local 380); bia câu hỏi **về Tinh Thiều** local 600 |
| 6 | làng | **Tinh Thiều** local 560, 2 lính Lương vây; lưới trúc local 200 |
| 7 | Chu Diên (`BG_LND_MID_CHU_DIEN`) | **khe sông + thuyền chiến + mỏm đá** |
| 8 | Chu Diên | chó săn; bia câu hỏi **về Triệu Túc** local 600 |
| 9 | Chu Diên | **cha con Triệu Túc** local 560, 2 lính Lương vây (cả 2 bên trái — nhóm rộng); về đích cuối chunk 9 khi gặp đủ 3 NPC (không cổng, như chương 2) |

- 9 × 768 = 6912 px. Không sách. Câu hỏi: 1 câu rút ngẫu nhiên trong pool của NPC đó (`phamTu` 14/15/17/18/40, `tinhThieu` 7/28/41/48,
  `trieuTuc` 8/23/30/34/49 — đã duyệt LND-00 §3.3).
- Quân vây (`CAPTORS`, như chương 2): Phạm Tu, Tinh Thiều = 1 trái + 1 phải; Triệu Túc = cả 2 bên trái, đoạn tuần tra tới chỗ người chơi
  bị giữ (`holdGap`).
- Kiểm bố cục: `checkNpcClearance`, `checkTerrainFootprints`, `checkPlatformReach`; quanh NPC (local 560) và bia giữ đất phẳng, không khe.

## 3. NỘI DUNG CHỮ

- `NPC_DIALOGUES` (`dialogue-data.js`): `phamTu`, `tinhThieu`, `trieuTuc` — tên, danh hiệu, 2 câu thoại, câu hỏi, 3 đáp án (đúng đứng
  đầu, engine tự xáo), gợi ý khi sai, "vì sao đúng", câu phần thưởng: **chép nguyên văn LND-00 §4.1–4.3**, không sửa chữ.
- Phần thưởng: `SK_LND_TO_LICH_SHIELD`, `BUFF_LND_SUPPLY`, `SK_LND_TIDE` (khớp seed `007`) — lưu tiến trình, chưa có tác dụng (LND-L3).
- Thông báo đầu màn: "Màn 2: Chiêu mộ hiền tài" (đã có). Không thêm cốt truyện giữa màn (chưa có câu đã duyệt).

## 4. FILE

| Loại | File |
|---|---|
| Tạo (chép asset) | `frontend/static/assets/images/ly-nam-de/{sprites,maps}-32bit/**` (12 sprite + 1 nền mới, 2 manifest) |
| Sửa | `js/levels/ly-nam-de/{config,level2,chapter,dialogue-data}.js` |
| Sửa (sau chơi thử) | status → `IN_GAME` (mục 1) trong `manifest_lnd.json` / `maps_lnd.json` (bản nguồn rồi chép lại) |
| Sửa tài liệu | `.claude/rules/ly-nam-de-gameplay.md`, `docs/REPORT_LND-L2.md` (mới) |
| Chỉ đọc | `js/levels/ba-trieu/level2.js` (mẫu, không import), `js/engine/*` |

## 5. TEST

| # | Test |
|---|---|
| T1 | Màn dài 6912 px, 3 vùng đúng chunk, đồi xa đồng trũng; console sạch (trừ 401 khách); không ảnh nào vẽ hộp tạm |
| T2 | 3 NPC đúng chỗ, đúng sprite (idle, talk khi nói); Triệu Túc nhóm 2 người, người chơi dừng trước Triệu Quang Phục không chồng hình |
| T3 | Giải cứu: còn lính vây thì nhắc "Hãy hạ quân Lương đang vây …", hạ hết mới mở hội thoại |
| T4 | Hội thoại: 2 câu + chân dung đúng người; câu hỏi 3 đáp án xáo; sai → gợi ý; đúng → "vì sao đúng" + phần thưởng; chữ khớp LND-00 §4 từng ký tự |
| T5 | 3 bia câu hỏi rút đúng pool từng NPC |
| T6 | Khe sông, thuyền, lưới, tháp, quan thu thuế, chó săn hoạt động như màn 1 |
| T7 | Gặp đủ 3 NPC → về đích → "Sang Màn 3"; tiến trình có 3 phần thưởng |
| T8 | Chơi tay hết màn ít nhất 1 lần (người dùng), ghi thời gian |
| T9 | `pytest tests` PASS; `/verify-ui` desktop + điện thoại ngang; màn 1 + `?layout=engine` (bình máu có hình mới) vẫn chạy |

## 6. CÂU HỎI CẦN CHỐT

| # | Câu hỏi | Đề xuất |
|---|---|---|
| Q1 | Thứ tự vùng: sông Hồng (Phạm Tu — Thanh Trì, cửa sông Tô Lịch) → làng (Tinh Thiều) → Chu Diên (Triệu Túc)? | **Duyệt** |
| Q2 | Bố cục chướng ngại cố định như §2 (2 khe sông có thuyền, 2 lưới, tháp canh, quan thu thuế, 2 chó săn, 1 lính tuần + 6 lính vây NPC)? | **Duyệt** |
| Q3 | Đồi xa màn 2 mượn đồng trũng `BG_BT_FAR_PLAIN` của chương 2? | **Duyệt** — hợp vùng sông nước, không cần vẽ |
| Q4 | FX khiên/sóng + 3 icon chép sẵn nhưng giữ `NORMALIZED` tới LND-L3? | **Có** — chưa dùng thì chưa `IN_GAME` |

## 7. GATE
1. Không sửa engine, không sửa file chương 1–2; số mới ghi `DESIGN_BASELINE`.
2. Test T1–T9 có số đo; FAIL hoặc sửa ngoài phạm vi → `BLOCKED`.
3. Report `/task-report`; chỉ commit khi người dùng yêu cầu. Sau đó: `LND_ART_03` (prompt Codex màn 3) + LND-L3.
