---
name: home-window
description: >-
  Thêm một cửa sổ (modal) mới vào trang chủ Sử Ta theo kiến trúc tải-khi-bấm — tạo partial templates/components/home/<tên>.html, CSS css/home/, module js/home/<tên>.js, đăng ký trong loader.js, HOME_COMPONENTS (pages.py), hàm window.open* trong main.js, nút trong home.html và test. Dùng khi cần thêm cửa sổ như cửa hàng, nhiệm vụ, cài đặt, hộp thư trên trang chủ.
argument-hint: "[tên cửa sổ, vd. shop]"
---

# /home-window — thêm cửa sổ trang chủ

Tên: `$ARGUMENTS` (chữ thường, không dấu, vd. `shop`). Nền tảng: rule `web-pages.md`. Cửa sổ **chỉ tải khi bấm**, không tải trước khi rê chuột.

## 1. HTML — `frontend/templates/components/home/<tên>.html`

- Chú thích đầu file: cửa sổ gì, module JS nào.
- Phần tử gốc **ẩn sẵn**: `class="modal-overlay" style="display: none;"` (kiểu BXH) hoặc `class="modal-overlay hidden"` (kiểu dòng thời gian, có hiệu ứng mờ dần) hoặc `hidden`.
- Có nút đóng (kiểu `.close-btn` của BXH). Ảnh dùng `url_for('static', ...)`, thêm `loading="lazy"`; ảnh lớn thì dùng bản thu nhỏ (`tools/make_home_images.py`).
- Nội dung lịch sử trong cửa sổ → rule `history-content.md`.

## 2. CSS — `frontend/static/css/home/<tên>.css`

- Kiểu bảng giống BXH/Thành tựu → dùng lại `board.css`, không tạo file.
- Đồng bộ giao diện gỗ + vàng (`#8b4513`, viền `#3e1f0b`, chữ tiêu đề `#ffdb58`, nền giấy `#f4e3c5`).
- Có `@media (max-width: 600px), (max-height: 500px) and (orientation: landscape)` cho điện thoại.

## 3. JS — `frontend/static/js/home/<tên>.js`

```js
// <Mô tả> (HOME-LAZY-01). HTML: components/home/<tên>.html, CSS: css/home/<tên>.css.
import { home } from './shared.js';      // chỉ import shared.js, KHÔNG import main.js

export function init() { /* gắn sự kiện 1 lần, sau khi HTML đã vào trang */ }
export function open() { /* hiện cửa sổ, tải dữ liệu API nếu cần */ }

window.close<Ten> = function close<Ten>() { /* hàm gọi từ onclick trong partial */ };
```

- Dữ liệu người dùng (tên, mô tả từ server) gán bằng `textContent`, không `innerHTML`.
- Hàm dùng chung mới → đặt trong `shared.js`.

## 4. Đăng ký

- `js/home/loader.js` → `COMPONENTS`: `<tên>: { css: ['<tên>'] }` (hoặc `['board']`).
- `backend/routes/pages.py` → thêm `'<tên>'` vào `HOME_COMPONENTS`.
- `js/home/main.js` → `window.open<Ten> = () => openComponent('<tên>', (module) => module.open());`
- `frontend/templates/home.html` → nút `onclick="open<Ten>()"` (không thêm thuộc tính tải trước).

## 5. Test + kiểm tra

- `tests/test_time_api.py`: thêm `("<tên>", 'id="<id phần tử gốc>"')` vào tham số của `test_home_component`; nếu không có trong `test_home_page_has_no_modals` thì thêm id vào danh sách (trang chủ không được chứa sẵn cửa sổ).
- `python -m pytest tests -q`.
- Skill `/verify-ui`: khởi động lại server (template mới), rê chuột không sinh request, bấm thì tải đúng 3 file, mở/đóng được, đúng ở 5 cỡ màn hình, không lỗi request.
- Cập nhật rule `web-pages.md` nếu có quy ước mới; viết report (`/task-report`).
