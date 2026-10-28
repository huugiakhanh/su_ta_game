# REPORT BT-ART-02 — Nhập asset BT_ART_02 (Gate B1 + B2) vào game

Prompt: [CODEX_PROMPT_BT_ART_02.md](CODEX_PROMPT_BT_ART_02.md) (mục 12–16 là các vòng soát) • 21/10/2026 • **PASS** (chưa chơi tay — xem TODO)

## Quyết định người dùng
- 19/10: chuẩn chiều cao người trưởng thành **34 ± 1 px logic** (đỉnh sọ → chân, không tính mũ/búi/vũ khí) cho mọi chương — ghi vào
  brief `SUTA_TT_ART_BRIEF_32.md` mục 2.2; sửa chương 2 trước, lính Hán chương 1 (~29,5) để TODO.
- 19/10: Triệu Quốc Đạt + họ Lý phải khác người chơi nam (bỏ khăn chàm); Bà Triệu **thiết kế mới** theo ảnh người dùng đưa.
- 19/10: áo họ Lý nâu đất (bỏ chàm sẫm của phe Ngô). 21/10: chấp nhận dải nâu sẵn có trong bảng màu thay cho đúng mã `#8A5A34`/`#EDE2C8`.
- 21/10: duyệt BT_ART_02, nhập B1 + B2.

## File
| File | Thay đổi |
|---|---|
| `frontend/static/assets/images/ba-trieu/sprites-32bit/` | +23 PNG mới (3 NPC, 3 chân dung, lính Ngô thường, 2 FX, 3 icon), 16 PNG thay (lính đốn gỗ, thợ săn, kỵ binh, `PLAYER_BA_TRIEU`, `PORTRAIT_BA_TRIEU`); `manifest_bt.json` chép từ nguồn (chỉ khác `version`, `status`, mục mới — kiểm từng mục cũ) |
| `frontend/static/assets/images/ba-trieu/maps-32bit/` | +`BG_BT_MID_MARSH`, `BG_BT_FAR_PLAIN`; `maps_bt.json` |
| `assets/sprites-32bit/ba-trieu/manifest_bt.json` (nguồn, ngoài git) | `status` → `IN_GAME` cho 5 asset đang chạy ở màn 1; asset màn 2 giữ `NORMALIZED` tới BT-L2 |
| `js/levels/ba-trieu/config.js` | hitbox lính đốn gỗ 22×32 → **24×34**, ô đánh `attackBoxY` 20 → 22; **bỏ `renderScale: 1.2`** (hệ số bù cho bản vẽ nhỏ cũ — trái rule asset); thợ săn 24×18 → 26×20, `muzzleX` 12 → 13; kỵ binh 56×34 → 61×37; `PORTRAITS` + 3 chân dung NPC; `NPC_SPRITES` + `quocDat`, `hoLy`, `bachTuong` |
| `.claude/rules/ba-trieu-gameplay.md`, `SUTA_TT_ART_BRIEF_32.md` | trạng thái asset, hitbox mới, chuẩn chiều cao |

Không sửa engine, không sửa chương Trưng Trắc, không đặt NPC/lính thường/FX/icon vào màn (việc của BT-L2/L3).

## Kết quả test
| # | Test | Kết quả |
|---|---|---|
| 1 | Nạp màn 1 | PASS — 45 ảnh chương nạp, gồm 4 chân dung; ảnh mới (đỉnh lính đốn gỗ hàng 50, Bà Triệu hàng 15 — khớp file nguồn); console không lỗi |
| 2 | Bà Triệu dẫn màn | PASS — sprite + chân dung mới trong hội thoại 5 câu |
| 3 | Lính đốn gỗ | PASS — hitbox 24×34; đứng sát người chơi → nhát rìu −2 máu; ở cỡ chơi cao ngang người chơi |
| 4 | Thợ săn | PASS — tên nỏ sinh ở độ cao 20 px, trúng −1 máu (mô phỏng `update(1/60)`) |
| 5 | Kỵ binh | PASS — hitbox 61×37, lao trúng −1 máu |
| 6 | `pytest tests` | PASS — 94 passed, 1 skipped |

## Sau commit 26f59f0 (21/10/2026)
- Gỡ phần `renderScale` **chưa commit** (không phải của task này) ở 6 file engine/Trưng Trắc bằng `git restore`: nó phóng ảnh khi vẽ để
  che lỗi tỉ lệ asset (đòn đánh người chơi ×1,2, lính Hán ×1,03) — trái rule "không hệ số bù tỉ lệ". Kiểm: không còn `renderScale` trong
  `js/`; `pytest` 94 passed; màn 1 Trưng Trắc và Bà Triệu chém 2 đòn hạ lính, console sạch.
- Sửa tận gốc giao Codex: [CODEX_PROMPT_SCALE_FIX_01.md](CODEX_PROMPT_SCALE_FIX_01.md) — `attack_01`/`victory` người chơi nhỏ hơn `idle`
  ~15–18%; `EN_HAN_GUARD` lên chuẩn 34.

## TODO
- Người dùng chơi tay màn 1 với lính Ngô mới (hitbox to hơn ~10%).
- BT-L2: đặt `NPC_TRIEU_QUOC_DAT`, `NPC_HO_LY`, `NPC_BACH_TUONG`, `EN_NGO_SOLDIER` (cần `ENEMY_SPRITES` mới, `frame_w` 128 của `attack_01`), nền đầm lầy; thêm ID vào `LEVEL_SPRITES[2]`; đổi status → `IN_GAME`.
- BT-L3: FX khiên, chí mạng, icon kỹ năng, `NPC_BACH_TUONG.charge` cho kỹ năng Gọi Bạch Tượng.
- Lính Hán chương 1 (`EN_HAN_GUARD` ~29,5 px) chưa theo chuẩn 34.
- `samples/PLAYER_BA_TRIEU_ELEPHANT` còn thiết kế Bà Triệu cũ — vẽ lại nếu dùng cho cutscene (BT_ART_03).
- Câu hỏi lịch sử Codex nêu (trang phục Triệu Quốc Đạt, vũ khí họ Lý, ngà Bạch Tượng, hoạ tiết Đông Sơn) — chờ team.
