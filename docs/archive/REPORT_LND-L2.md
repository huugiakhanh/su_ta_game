# REPORT LND-L2 — Màn 2 "Chiêu mộ hiền tài" (bố cục thật + asset LND_ART_02)

Task card: [SUTA_LND_TASK_L2_01.md](SUTA_LND_TASK_L2_01.md) • 02/11/2026 • **PASS** — T1–T7, T9 bằng mô phỏng; T8 người dùng chơi tay duyệt "Đẹp rồi" → 8 asset `IN_GAME` (3 NPC, 3 chân dung, bình máu, nền Chu Diên); FX khiên/sóng + 3 icon giữ `NORMALIZED` tới LND-L3.
Yêu cầu người dùng: lập kế hoạch + làm LND-L2 (duyệt Q1–Q4 theo đề xuất 02/11/2026).

## Quyết định người dùng chốt (02/11/2026)
- Q1 vùng: sông Hồng 1–3 (Phạm Tu) → làng 4–6 (Tinh Thiều) → Chu Diên 7–9 (cha con Triệu Túc).
- Q2 bố cục chướng ngại cố định (2 khe sông có thuyền, 2 lưới, tháp canh, quan thu thuế, 2 chó săn, 1 lính tuần + 6 lính vây).
- Q3 đồi xa mượn `BG_BT_FAR_PLAIN`. Q4 FX khiên/sóng + 3 icon chép sẵn, giữ `NORMALIZED` tới LND-L3.
- Asset `LND_ART_02` (soát Gate B1/B2): Phạm Tu talk giơ bàn tay phía sau; Triệu Quang Phục áo rêu; thêm màu xanh → bảng màu sprite **98 màu** (ngoại lệ trần 96).

## File
| File | Việc |
|---|---|
| `static/assets/images/ly-nam-de/{sprites,maps}-32bit/**` | Chép 12 sprite + `BG_LND_MID_CHU_DIEN` (manifest chỉ thêm mục — 21 mục cũ giữ `IN_GAME`); 4,3 MB tổng thư mục |
| `js/levels/ly-nam-de/config.js` | `PORTRAITS` + 3 chân dung; `LEVEL_SPRITES[2]`; `ITEM_LND_HEAL` vào mọi màn; `PICKUPS`; vùng màn 2, `LEVEL2_FAR_HILLS`, `CAPTORS`, `QUIZ.level2Spots`; `NPC_SPRITES` 3 NPC (`trieuTuc.holdGap` 40); `BORROWED_MAPS` bỏ nền rừng/đầm chương 2, thêm `BG_BT_FAR_PLAIN` |
| `js/levels/ly-nam-de/level2.js` | Viết lại: 9 chunk cố định, 2 khe sông + thuyền + mỏm đá, lưới, quan thu thuế, tháp canh, chó săn, 3 NPC bị vây, 3 bia câu hỏi theo pool NPC |
| `js/levels/ly-nam-de/dialogue-data.js` | `NPC_DIALOGUES` 3 NPC — trích **bằng script** từ LND-00 §4 (bỏ dấu `*…*`/ngoặc kép markdown), không gõ tay |
| `js/levels/ly-nam-de/chapter.js` | `pickups`, `farHills` màn 2 |
| `.claude/rules/ly-nam-de-gameplay.md` | Trạng thái màn 2, asset, bảng màu 98 |

Không sửa engine, không sửa file chương 1–2.

**Khác task card:** `ITEM_LND_HEAL` thêm vào `LEVEL_SPRITES` cả màn 2 (task card ghi màn 1, 3): engine `drawPickups` tra ảnh bình máu mỗi frame kể cả khi chưa có bình → thiếu thì console cảnh báo "chưa nạp ở màn 2". Không sửa engine.

## Kết quả test
| # | Test | Kết quả |
|---|---|---|
| T1 | Độ dài + vùng + console | PASS — đích x 6816 (9 chunk), nền sông Hồng / làng / Chu Diên + đồi xa `BG_BT_FAR_PLAIN` nạp đúng; console chỉ 401 khách (sau khi thêm bình máu vào màn 2) |
| T2 | NPC đúng chỗ, sprite | PASS — Phạm Tu x 2096, Tinh Thiều x 4400, Triệu Túc x 6704; ảnh chụp: nhóm cha con lật quay về người chơi, Triệu Túc đứng gần, người chơi dừng mép phải x 6645 (ngoài nhóm ±33) |
| T3 | Giải cứu | PASS — còn 2 lính vây thì người chơi bị giữ, không mở hội thoại; hạ hết lính → mở hội thoại |
| T4 | Hội thoại | PASS — 3 NPC: tên, danh hiệu, chân dung đúng người (`portrait_pham_tu/tinh_thieu/trieu_tuc_idle.png`), 2 câu thoại, câu hỏi, 3 đáp án xáo; sai (Phạm Tu) → "Gợi ý: Quân ít, khí giới thô sơ…"; đúng → "vì sao đúng" → câu phần thưởng; chữ khớp LND-00 §4 (trích tự động) |
| T5 | Bia câu hỏi | PASS — chunk 2 x 1448 (sau khe sông) pool `phamTu` (câu 14), chunk 5 `tinhThieu` (41), chunk 8 `trieuTuc` (23) |
| T6 | Chướng ngại | PASS — 2 khe sông (x 992/1168, 4832/5008) có thuyền + mỏm đá; lưới, quan thu thuế, tháp + cung thủ, 2 chó săn, 1 lính tuần đúng chỗ (cơ chế đã kiểm ở LND-L1) |
| T7 | Về đích | PASS — gặp đủ 3 NPC → về đích → "Sang Màn 3"; tiến trình `rewards` = `SK_LND_TO_LICH_SHIELD`, `BUFF_LND_SUPPLY`, `SK_LND_TIDE` |
| T8 | Chơi tay hết màn | PASS — người dùng chơi tay 02/11, duyệt "Đẹp rồi" |
| T9 | pytest + giao diện + hồi quy | PASS — 108 passed, 1 skipped; điện thoại ngang 812×375: khung 523×221, không cuộn ngang; màn 1 `?layout=engine`: hạ lính → bình máu ống tre rơi tới đất (x 3604, ảnh `ITEM_LND_HEAL`) |

Ghi chú: một lần nạp màn 1 lỗi `ERR_NETWORK_CHANGED` (mạng máy đổi giữa chừng) — tải lại thì bình thường, không liên quan code.

## Vấn đề asset
- Không có lỗi mới. `IN_GAME` 02/11: `NPC_PHAM_TU`, `NPC_TINH_THIEU`, `NPC_TRIEU_TUC`, 3 chân dung, `ITEM_LND_HEAL`, `BG_LND_MID_CHU_DIEN` (bản nguồn + bản chạy). Còn `NORMALIZED`: `FX_LND_TO_LICH_SHIELD`, `FX_LND_TIDE`, 3 `ICON_SK_LND_*` (dùng ở LND-L3).

## Câu hỏi cho team / TODO
- Câu hỏi Codex còn mở (không chặn): trang phục 3 NPC; có cần sprite Triệu Quang Phục riêng; hình khiên Tô Lịch; nguồn trang phục/hoạ tiết.

## Bước tiếp
`LND_ART_03` (prompt Codex màn 3) + LND-L3. Prompt `LND_ART_02` giữ tới LND-L3 (FX/icon chưa dùng), xoá khi các asset đó `IN_GAME`.
