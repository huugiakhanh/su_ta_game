# REPORT PLAYER-SWORD-01 — Nhân vật nam/nữ đổi giáo sang kiếm

Ngày: 03–04/11/2026. Thuộc TT-HERO-01 (quyết định D14, D15 trong [TT_HERO_TASK_01.md](TT_HERO_TASK_01.md)).
Yêu cầu người dùng: vẽ lại asset người chơi nam/nữ cầm kiếm thay vì cầm giáo.

## Hiện trạng / đo trước khi sửa
- `PLAYER_MALE` / `PLAYER_FEMALE` (8 animation mỗi người) cầm giáo cán tre; `ICON_SK_ATTACK` vẽ cây giáo. Avatar không có vũ khí → giữ nguyên.
- Vùng trúng đòn trong code (`spearBox`, `engine/combat.js`) là dải 48 px logic trước thân, cố định, không lấy từ ảnh. Bản giáo cũ ở ô chạm chỉ vẽ tới x=445 px ảnh (vùng trúng đòn tới 498).

## Quyết định (người dùng chốt)
- Kiếm **thẳng sắt hai lưỡi**, chắn tay **thanh ngang ngắn** (phương án A), chuôi quấn vải, đốc tròn.
- **Giữ vùng trúng đòn 48 px** và nhịp `attack_01` (9 ô @21, `hit_frame` 4, ô 128) → không sửa code.
- Vẽ lại `ICON_SK_ATTACK` cùng đợt.
- Cho phép **36 màu** mỗi nhân vật (brief giới hạn 32).
- **Tay cầm kiếm = tay gần người xem**, vẽ đè lên thân, mọi ô; **hai tay không chồng nhau**, mỗi tay mọc từ vai riêng cố định qua mọi ô; tay xa thủ trước ngực khi tay gần vắt qua thân.
- **Loại hướng ghép kiếm lên thân bản giáo** (v1, 5 lượt R1–R5): dáng không tự nhiên, kiếm lúc dài lúc ngắn. Làm **v2 vẽ mới hoàn toàn**, chỉ giữ tạo hình nhân vật.
- v2: chém **chéo từ trên xuống**; idle **thủ thế**; lưỡi **18 px logic**; một kiếm mẫu + bảng xoay (chỉ xoay, không co giãn); concept đủ tư thế khoá 8 animation nam + nữ duyệt trước khi vẽ strip.
- Nữ **giữ tạo hình cũ** (áo chàm, đai lưng nâu, đai trán đỏ, tóc xõa dài) — khác màu với nam.

## File đã sửa / tạo / xoá
| File | Việc |
|---|---|
| `frontend/static/assets/images/shared/sprites-32bit/player/PLAYER_MALE/*.png` (8) | Strip kiếm v2 (Codex vẽ, Gate B) |
| `frontend/static/assets/images/shared/sprites-32bit/player/PLAYER_FEMALE/*.png` (8) | Strip kiếm v2 |
| `frontend/static/assets/images/shared/sprites-32bit/icon/ICON_SK_ATTACK/icon_sk_attack_idle.png` | Icon kiếm |
| `frontend/static/assets/images/shared/sprites-32bit/manifest_shared.json` | 3 mục: chỉ `qa_notes` (status vốn `IN_GAME`) |
| `assets/sprites-32bit/manifest_tt.json` (ngoài git) | 3 mục: `status` → `IN_GAME`, `qa_notes` |
| `SUTA_TT_ART_BRIEF_32.md` | Mục 3.3: mô tả nghĩa sĩ nam/nữ cầm kiếm |
| `docs/TT_HERO_TASK_01.md` | D14, D15 + bảng soát từng gate + kết quả tích hợp |
| `docs/CODEX_PROMPT_PLAYER_SWORD.md` | Xoá — asset đã duyệt `IN_GAME` (nội dung tóm tắt trong report này) |

Thay đổi hành vi nhỏ ngoài yêu cầu: không. Code không đổi; tên hàm `spearBox` giữ nguyên.

## Kết quả test
- `pytest tests`: 108 passed, 1 skipped — PASS (skip: `test_app.py` thiếu `SUTA_TEST_DATABASE_URL`, test DB **chưa chạy**).
- Đo strip (script Pillow): 16 strip đúng `frames × frame_w × 4` × 192, icon 128×128; alpha 0/255; đáy mọi ô y=187; 1 cụm pixel/ô; lề ≥ 4 px; nam 36 màu, nữ 36, icon 32, 0 màu ngoài bảng; lưỡi chiếu 71,0–71,6 px ảnh mọi ô (lệch 0,16 px logic); vệt ô 4 x 311–492 / y 44–164 — PASS.
- Manifest: 3 mục chỉ khác bản cũ ở `status`/`qa_notes` — PASS.
- Trình duyệt (server 5057): `?viewer=1` 17/17 ảnh nạp đúng cỡ, nam/nữ `IN_GAME`; màn 1 Trưng Trắc nhân vật nam, bấm J, dừng ở ô chạm (t = 0,15 s): kiếm bổ chéo + vệt cung hiện trước mặt; console không lỗi mới — PASS.
- Nhân vật nữ trong màn chơi thật, chương Bà Triệu / Lý Nam Đế, cỡ điện thoại — CHƯA CHẠY (nữ mới xem ở viewer).

## Vấn đề asset
- Không có lỗi chặn. Ghi nhận để xem khi chơi thử: `death` kết thúc ở tư thế quỵ gối gục (không nằm sấp); `jump` 3 ô đều chạm y=187 như bản cũ; `PLAYER_FEMALE.dash` Codex báo cảnh báo phụ diện tích silhouette lệch 10,8% so idle (xem mắt bình thường).
- Bộ giáo cũ lưu ở `assets/sprites-32bit/archive/spear_20261103/`, bản kiếm v1 ở `archive/sword_v1_20261103/` và `meta/sword_sw1*/` (ngoài git).

## Câu hỏi cho team / TODO
- "Kiếm thẳng sắt hợp mọi thời 40–1789" chưa được team kiểm chứng (độ chắc chắn thấp–vừa).
- Chơi thử nhân vật nữ + 2 chương còn lại + điện thoại.
