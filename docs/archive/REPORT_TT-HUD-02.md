# REPORT TT-HUD-02 — Máu + sách vào khung chơi

Ngày: 07/10/2026 · Nhánh: `responsive-mobile` · Trạng thái: **DONE** (chưa commit)

## Yêu cầu (người dùng chốt 07/10)

- Máu và số sách không còn trên thanh HUD mà hiện **góc trên-trái khung chơi**, hàng ô kỹ năng dời xuống ngay dưới.
- Sách hiện bằng **ảnh bình thư trong game** (`ITEM_BINH_THU`) + "n/5".
- Hiệu ứng nhẹ khi mất / hồi máu và khi nhặt sách.

## File đã sửa

| File | Mục đích |
|---|---|
| `frontend/templates/gameplay/levels/trung-trac.html` | Bỏ ô Máu/Sách khỏi `.hud`; thêm `.corner-hud` (gồm `#statusBar` tim + sách, và `#skillBar` cũ) trong `.stage-wrap` |
| `frontend/static/css/levels/trung-trac.css` | HUD còn 2 ô (Điểm, Thời gian); style `.corner-hud`/`.status-bar` (nền tối mờ, gọn hơn trên cảm ứng / cửa sổ hẹp); `.skill-bar` hết `absolute`; keyframes `heart-lost`, `heart-gained`, `hud-shake`, `book-bump` (tắt rung khi `prefers-reduced-motion`); hộp thông báo `max-width` chừa 2 góc trên |
| `frontend/static/js/levels/trung-trac/ui.js` | `updateHud()`: hiệu ứng chỉ khi số đổi trong cùng lượt (`lastHudState`); tim mất xoá khi `animationend`; `updateBookIcon()` lấy ô đầu strip bình thư từ `images.maps.props` làm nền CSS (thiếu → 📖) |
| `CLAUDE.md` | Mục HUD |

Không đổi gameplay, không đổi asset. `assets.js`/`config.js`/`render.js` chỉ đọc.

## Kết quả test

| # | Test case | Kết quả |
|---|---|---|
| 1 | Màn 1 (1280×800): 5 tim + ảnh bình thư "0/5" góc trên-trái, ô Lướt ngay dưới; HUD trên còn Điểm + Thời gian | **PASS** |
| 2 | Mất máu 5→3: 2 tim `is-lost` + hàng tim rung; sau hiệu ứng còn đúng 3 tim (tim mất đã xoá) | **PASS** |
| 3 | Nhặt sách 0→1: ô sách nảy, "1/5" | **PASS** |
| 4 | Hồi máu 3→4: 1 tim `is-gained` | **PASS** |
| 5 | Chơi lại: 5 tim, "0/5", không hiệu ứng | **PASS** |
| 6 | Màn 2: ô sách ẩn, chỉ còn tim | **PASS** |
| 7 | Màn 3 (`?debug=1`): tim + 4 ô kỹ năng/buff không đè hộp thông báo, thanh Khiên giữ góc trên-phải | **PASS** |
| 8 | Điện thoại ngang 740×360 (cảm ứng): góc trên-trái gọn, không đè nút cảm ứng / thông báo / Khiên | **PASS** |

Mất/hồi máu và nhặt sách được giả lập bằng cách đổi `state.health` / `state.booksCollected` rồi gọi `updateHud()` qua module (khung trình duyệt của Claude bị ẩn nên game không tự chạy frame).

## Lưu ý

- Trên máy cảm ứng, nhãn "Điểm" / "Thời gian" trên thanh HUD vẫn ẩn như trước (chỉ hiện số).
