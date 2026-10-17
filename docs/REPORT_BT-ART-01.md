# REPORT BT-ART-01 — Nhập asset màn 1 chương Bà Triệu

Prompt + 4 lượt soát: [CODEX_PROMPT_BT_ART_01.md](CODEX_PROMPT_BT_ART_01.md) (mục 8–12) • 17/10/2026 • **PASS** (chưa chơi tay — xem dưới)

## Quyết định người dùng
- Duyệt BT_ART_01 sau bản sửa 3 (mục 12); phe Ngô = phương án B chàm sẫm; lính đốn gỗ dùng rìu (khác "búa tạ quai ngang" trong Excel — chờ team); voi rừng xám-nâu hai ngà; quan thu thuế ~44 px logic; thêm 4 màu tím vào `palette_32_bt.png`.
- Status giữ `NORMALIZED`; lên `IN_GAME` sau khi người dùng chơi thử.

## File
| File | Mục đích |
|---|---|
| `frontend/static/assets/images/ba-trieu/sprites-32bit/` (mới) | `manifest_bt.json` + 12 sprite ID (enemy, fx, obstacle, player, portrait, projectile) — chép nguyên từ `assets/sprites-32bit/ba-trieu/`, bỏ raw/meta/preview/concept |
| `frontend/static/assets/images/ba-trieu/maps-32bit/` (mới) | `maps_bt.json` + bg (5), props (4), items (1) |
| `frontend/static/js/engine/assets.js` | `CHAPTER.borrowedMaps`: mượn asset map chương khác theo danh sách ID; mỗi mục map nhớ `asset.root` (ảnh, metadata tileset, `state_files`) |
| `frontend/static/js/engine/render/entities.js` | Bục vẽ lùi theo `visible_bbox.x` để hitbox trùng thân cành |
| `frontend/static/js/engine/chapter.js` | Hợp đồng: `borrowedMaps?` |
| `frontend/static/js/levels/ba-trieu/config.js` | Trỏ asset riêng; `BORROWED_MAPS` (trời, tile, nền làng, bia, 2 vật cản của chương 1); vùng cảnh 3 màn; `FINISH_GATE`; `BRANCH`; hitbox/thông số đo từ strip cho 12 sprite; NPC Bà Triệu, đạn |
| `frontend/static/js/levels/ba-trieu/{level1,level2,level3,chapter}.js` | Thay lính Hán/hổ/chông sắt tạm bằng lính đốn gỗ/đá lăn/chông tre; cổng trại màn 1; layout thử dùng cành thật |
| `.claude/rules/{ba-trieu-gameplay,engine,assets-32bit}.md` | Ghi vị trí asset, mượn map, số đo |

Không sửa file chương Trưng Trắc, không sửa thư mục Codex.

## Kết quả kiểm
| Test | Kết quả |
|---|---|
| Đường dẫn manifest → file | PASS — 44 file, 0 thiếu |
| `pytest tests` | PASS — 93 passed, 1 skipped |
| Nạp asset màn 1 (`?layout=engine`) | PASS — 7 lớp nền (gồm 2 mượn), 8 prop (3 mượn), tileset + địa hình mượn, 6 sprite chương + chân dung; không có cảnh báo thiếu ảnh/sai cỡ |
| Hiển thị trong game (ảnh chụp) | PASS — người chơi đứng trên cành cây phía trên chướng khí; đứng trên lưng voi rừng đang đi; lính đốn gỗ, bia câu hỏi, Quyển Sách Tinh Hoa; cổng trại mở khi đủ 5/5 sách |
| Sát thương rìu | PASS — 5 → 3 máu (damage 2) |
| Hồi quy Trưng Trắc | PASS — màn 3 nạp đủ nền, 15 prop, ảnh trạng thái cột đá; không lỗi console |

**Chưa kiểm:** chơi tay trọn màn; cảm giác nhịp rìu chậm, tầm đá lăn, voi — để BT-L1 chỉnh. Cảnh báo "maps_bt.json: stage khác" (stage 9216 vs màn khung 4608) còn — hết khi BT-L1 kéo dài màn.

## TODO / chờ team
- Mũ/trang phục quan thu thuế, mức hoạ tiết Đông Sơn năm 248, rìu thay búa tạ.
- Thoại NPC Bà Triệu (BT-00 §4–5) để đặt NPC dẫn màn.
- Đổi status → `IN_GAME` sau khi chơi thử.
