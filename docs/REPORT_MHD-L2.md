# REPORT MHD-L2 — Màn 2 "Dựng cờ Vạn An"

Task card: [SUTA_MHD_TASK_L2_01.md](SUTA_MHD_TASK_L2_01.md) • 08/11/2026 • **PASS** (người dùng chơi tay ổn 08/11; asset màn 2 → `IN_GAME`). `test_app.py` chưa chạy trên DB test.
Yêu cầu người dùng: làm màn 2 thật theo task card đã duyệt ("Duyệt, làm màn 2").

## Quyết định (người dùng chốt 08/11)
- NPC thứ 2 là **Hào kiệt Sa Nam**, nhân vật hư cấu (chưa có nguồn về tên "Thúc Bảo"); khoá pool vẫn `thucBao`.
- Thoại 3 NPC (MHD-00 §4) duyệt nguyên văn.
- Q1: bố cục 3 vùng, chướng ngại cố định, sách 3/3/4. Q2: xe cống màn 2 không thả dân phu. Q3: giữ tiêu đề bia "Câu hỏi về <tên NPC>".
- Asset `MHD_ART_02` Gate B1, B2 duyệt nguyên trạng; Mai Thúc Loan vẽ lại theo ảnh thư viện (ghi trong [REPORT_MHD-L1.md](REPORT_MHD-L1.md)).

## File đã sửa
| File | Việc |
|---|---|
| `js/levels/mai-hac-de/config.js` | `LEVEL2_*` (10 chunk, 3 vùng, NPC, quân vây, 7 sách cố định, bố cục), `QUIZ.level2Spots`, `LEVEL_SPRITES[2]`, `PORTRAITS` +3, `NPC_SPRITES` +3, `TEXT.npcLocked` |
| `js/levels/mai-hac-de/level2.js` | Bố cục thật cố định, xe/lính mang sách, quân vây, bia trước NPC, `level2Events` (kỵ binh) |
| `js/levels/mai-hac-de/level1.js` | Xuất bộ dựng chướng ngại (`makeSoldier`, `makeCart`, `makeBushArcher`, `makeJavelinTower`, `makeBoulder`, `makeTigerCave`, `makeCavalry`, `updateCavalry`); nhóm xáo màn 1 gọi lại các hàm này, hành vi không đổi |
| `js/levels/mai-hac-de/chapter.js` | `levels[2].events`, câu tổng kết 10 sách |
| `js/levels/mai-hac-de/dialogue-data.js` | `NPC_DIALOGUES` 3 NPC — sinh bằng script từ MHD-00 §4 để khớp nguyên văn |
| `.claude/rules/mai-hac-de-gameplay.md`, `docs/SUTA_MHD_TASK_00.md` | Tài liệu |

Không sửa engine, không sửa file chương 1–4. Asset `MHD_ART_02` đã chép vào game ở bước soát (trước khi làm task này).

## Kết quả test
| # | Test | Kết quả |
|---|---|---|
| T1 | Dựng nội dung | PASS — dài 7680 px, đích x 7584; 10 sách (3 ẩn: 2 xe + 1 lính mang); NPC `maThi` 2096 cần 3, `thucBao` 4400 cần 6, `suGia` 7472 cần 10; 3 bia ở 1816 / 4120 / 7192 với câu 40, 43, 46 (đúng pool); 13 lính, 12 hazard; console không cảnh báo khoảng cách NPC/địa hình; nạp đủ 3 nền + 14 sprite + 4 chân dung |
| T2 | NPC khoá | PASS — thiếu 1 sách: không mở hội thoại, hiện "Cần 3 Quyển Sách Tinh Hoa mới gặp được (đang có 2)." (Hào kiệt: 6/5 tương tự); đủ sách + hết lính vây → hội thoại mở |
| T3 | Hội thoại + phần thưởng | PASS — tên, danh xưng, chân dung đúng 3 NPC (`portrait_mhd_mother_idle.png`, `…sa_nam_hero…`, `…lam_ap_envoy…`); câu mở đầu khớp nguyên văn; mỗi NPC 5 bước thoại; trả lời đúng → `readProgress().rewards` = `BUFF_MHD_POWER`, `SK_MHD_VAN_AN_SHELL`, `SK_MHD_REINFORCE`. Sứ giả không có danh xưng: ô danh xưng cao 0 px, không để khung trống |
| T4 | Chướng ngại | PASS — các bộ dựng dùng chung đã kiểm ở MHD-L1; màn 2 đặt đúng: bụi ở 300 và 4858, hang 3492, kỵ binh báo trước ở chunk 7 (câu báo hiện khi vượt `warnX`). Ảnh chụp: Mẹ trên đường Hoan Châu, Hào kiệt trên đồng Sa Nam, Sứ giả cạnh bia trên bờ sông Lam |
| T5 | Hồi quy | PASS — bot 4 trang chương 5 (`/2` 3000 frame, màn 1, `?layout=engine`, `/3`): 0 exception, 0 tài nguyên lỗi. Bot màn 2 dừng trước Mẹ vì chưa nhặt sách — đúng cơ chế khoá |
| T6 | `pytest tests` | PASS — 137 passed, 1 skipped (`test_app.py` thiếu `SUTA_TEST_DATABASE_URL`) |
| T7 | Chơi tay | PASS — người dùng báo "đã ổn" 08/11; không có thời gian hoàn thành, số DESIGN_BASELINE giữ nguyên |

Các số chỉ là `DESIGN_BASELINE`. Không dữ liệu người chơi nào được ghi vào DB.

## Vấn đề asset
- Status: 6 mục NPC/chân dung (`manifest_mhd.json`) + 2 nền (`maps_mhd.json`) → `IN_GAME` (bản nguồn rồi chép lại, 08/11). 3 icon + `FX_MHD_VAN_AN_SHELL` giữ `NORMALIZED` tới MHD-L3; prompt đã xoá sau MHD-L3.

## Câu hỏi cho team / TODO
- Trang thư viện vẫn nhắc tên Thúc Bảo; thoại §5.2 vẫn có câu "người dân phu Hoan Châu" trong khi Mai Thúc Loan đã mặc áo choàng đen — team quyết.
- Duyệt MHD-00 §5.3–5.4 (cutscene, panel kết chương) trước MHD-L3.

## Bước tiếp
Prompt Codex `MHD_ART_03` + MHD-L3 (cần duyệt MHD-00 §5.3–5.4 trước).
