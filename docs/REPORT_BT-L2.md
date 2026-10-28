# REPORT BT-L2 — Màn 2 "Chiêu mộ hiền tài" (bố cục thật)

Task card: [SUTA_BT_TASK_L2_01.md](SUTA_BT_TASK_L2_01.md) • 28/10/2026 • **PASS** (người dùng chơi tay OK 28/10/2026)

## Quyết định người dùng (28/10/2026)
- Duyệt task card, Q1–Q5 theo đề xuất: Bạch Tượng bị **2 thợ săn** vây (engine E2); `holdGap` riêng cho NPC to (E1); đồi xa đồng bằng
  `BG_BT_FAR_PLAIN` riêng màn 2 (E3); lính Ngô thường giữ tầm kích theo hình, sát thương 1, nghỉ 1,6 s; `bow` của Bạch Tượng để BT-L3.

## File
| File | Thay đổi |
|---|---|
| `js/engine/level-flow.js` | E1: `holdGap` đọc từ `sprites.npcs[id].holdGap` (mặc định `NPC_RULES.holdGap`), khoảng nói chuyện dời theo; E2: quân vây gồm cả hazard `captorOf` |
| `js/engine/assets.js`, `render/backdrop.js`, `chapter.js` | E3: `LEVEL.farHills ?? CHAPTER.farHills` + chú thích hợp đồng |
| `js/levels/ba-trieu/config.js` | `LEVEL2_*` 9 chunk (rừng nứa → sườn đá → đầm lầy), `LEVEL2_FAR_HILLS`, `CAPTORS`, `QUIZ.level2Spots`, `LEVEL_SPRITES[2]`, `SOLDIER` + `SOLDIER_GUARD` + `ENEMY_SPRITES.soldier`, `holdGap` họ Lý 48 / Bạch Tượng 56 |
| `js/levels/ba-trieu/level2.js` | bố cục cố định 9 chunk, 3 NPC + quân vây, 3 câu hỏi theo pool NPC, cốt truyện `level2Events` |
| `js/levels/ba-trieu/dialogue-data.js` | `NPC_DIALOGUES` 3 NPC + `STORY_QUOC_DAT` — nguyên văn BT-00 §4 (script so 41 chuỗi mới: 0 lệch) |
| `js/levels/ba-trieu/chapter.js` | màn 2: `farHills`, `events` |
| `manifest_bt.json`, `maps_bt.json` (nguồn + bản chạy) | status → `IN_GAME`: `NPC_TRIEU_QUOC_DAT`, `NPC_HO_LY`, `NPC_BACH_TUONG`, `EN_NGO_SOLDIER`, `BG_BT_MID_MARSH`, `BG_BT_FAR_PLAIN` (chỉ đổi status) |

## Số đo asset (strip BT_ART_02, px logic)
- `EN_NGO_SOLDIER`: thân ±7 px, sọ→chân ~35 → hitbox **22×34**; kích ô hit 4 vươn **60,2** từ tâm (49 ngoài mép), cao 16–24 trên chân →
  `attackReach` 49, `attackBoxY` 10, `attackBoxH` 9.
- NPC: Triệu Quốc Đạt ±8; họ Lý ±43 (3 người); Bạch Tượng ±52 (ô 128×96).

## Kết quả test (mô phỏng `update(1/60)` + chụp màn hình)
| # | Test | Kết quả |
|---|---|---|
| L1 | Màn 6912 px (đích 6816), nạp đủ nền `NUA_FOREST`/`ROCKY_SLOPE`/`MARSH` + `BG_BT_FAR_PLAIN`, 10 sprite màn 2; không cảnh báo bố cục | PASS |
| L2 | 3 bia: chunk 2/5/8, stt rút đúng pool (vd. 6 ∈ quocDat, 17 ∈ hoLy, 23 ∈ bachTuong) | PASS |
| L3 | Còn lính vây → giữ lại + nhắc; hết → mở hội thoại. Họ Lý mở ở khoảng 66 px (người chơi đứng ngoài nhóm 3 người), Bạch Tượng giữ ở 56 px khi 2 thợ săn còn sống, giết xong mở hội thoại — ảnh chụp người chơi đứng ngoài thân voi | PASS |
| L4 | Thoại/câu hỏi/vì sao đúng/phần thưởng đúng nguyên văn; chọn sai rồi đúng; tiến trình lưu đủ `BUFF_BT_CRIT`, `SK_BT_RATTAN_SHIELD`, `SK_BT_WHITE_ELEPHANT` | PASS |
| L5 | Cốt truyện Triệu Quốc Đạt hiện 1 lần khi vào chunk 4 | PASS |
| L6 | Lính Ngô thường: đâm ở khoảng 42 px (−1 máu), không đâm ở 52 px, nghỉ 1,6 s (97 frame) | PASS |
| L7 | Gặp đủ 3 NPC → `won`, `level2Complete`, panel "Sang Màn 3" | PASS |
| L8 | Chơi tay hết màn | PASS — người dùng chơi thử OK 28/10/2026; asset màn 2 → `IN_GAME` |
| L9 | Hồi quy: Trưng Trắc màn 2 mở hội thoại Thi Sách ở 30 px như cũ; màn 3 `?layout=skills` chạy 300 frame không lỗi; `?layout=p2` 3 cảnh báo sprite `PJ_OIL_JAR`/`FX_OIL_FIRE`/`PJ_ARROW_RAIN` **có sẵn từ trước** (kiểm bằng `git stash` engine); Bà Triệu `?layout=engine` chạy, đồi xa vẫn `BG_BT_FAR_NUA` | PASS |
| — | `pytest tests` | 93 passed, 1 skipped, **1 failed ngoài phạm vi**: `test_library_hero_pages_render` — commit `cf4e71a` (đồng đội) đặt ảnh `nguyen_hue.png` nhưng `library_heroes.json` ghi `nguyen-hue.png` |

## TODO
- Báo đồng đội lỗi tên ảnh `nguyen-hue` (test thư viện).
- BT-L3: cơ chế 3 kỹ năng + FX/icon, `bow` của Bạch Tượng (Q5), boss Lục Dận (`BT_ART_03`).
