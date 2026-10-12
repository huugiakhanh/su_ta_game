---
paths:
  - "frontend/templates/home.html"
  - "frontend/templates/components/**"
  - "frontend/templates/history.html"
  - "frontend/templates/library/**"
  - "frontend/templates/quiz.html"
  - "frontend/static/js/home/**"
  - "frontend/static/js/{history,library,quiz}.js"
  - "frontend/static/css/{main,history,library,quiz}.css"
  - "frontend/static/css/home/**"
  - "backend/routes/pages.py"
---

# Trang web ngoài màn chơi (trang chủ, thư viện, trắc nghiệm)

## Trang chủ (HOME-LAZY-01)

- `home.html` chỉ chứa khung chính. Mỗi cửa sổ (dòng thời gian, BXH, thành tựu, đăng nhập/hồ sơ, chọn chương) là 1 bộ `templates/components/home/<tên>.html` + `css/home/*.css` + `js/home/<tên>.js`.
- `js/home/loader.js` tải cửa sổ **khi bấm lần đầu** (route `/components/home/<tên>`) rồi gọi `init()` 1 lần, sau đó `open()`. **Không** tải trước khi rê chuột — người dùng đã chốt.
- `main.js` = khôi phục đăng nhập + nhân vật đã chọn + hàm `window.open*` gọi từ `onclick`. `shared.js` = trạng thái `home.user` + hàm dùng chung. Module cửa sổ import `shared.js`, **không** import `main.js` (tránh vòng).
- Thêm cửa sổ: skill `/home-window`.
- Cửa sổ "chọn chương → chọn tướng" (`chapter`) chưa có nút nào mở.
- `main.css` giữ lớp nền `.modal-overlay` dùng chung (2 khối, giữ đúng thứ tự); phần riêng từng cửa sổ ở `css/home/*.css`, kể cả `@media` tương ứng. BXH và Thành tựu dùng chung `board.css`.

## Dòng thời gian

- Giao diện gỗ + vàng + giấy cổ, đồng bộ Bảng xếp hạng. Chấm đặt tuyệt đối tại 50% chiều cao, thẻ/năm đặt theo khoảng cách tới tâm → chấm luôn nằm đúng trục (không dùng lưới chia hàng — lệch khi thẻ cao hơn chỗ trống). Cỡ thẻ `--card-w` co giãn theo chiều cao màn hình.
- Thẻ khoá: class `locked` + `.lock-overlay`. Mở khoá nhân vật = bỏ 2 thứ đó; thẻ tự có viền vàng + nhãn "CHƠI NGAY".
- Ảnh thẻ là bản thu nhỏ `characters/avatar/thumb/*.webp` (tỉ lệ 1024×707 → khung ảnh đúng tỉ lệ, không cắt). Thêm/đổi ảnh gốc thì chạy `python tools/make_home_images.py`. Logo dùng `logo2.webp`.

## Thư viện lịch sử

- `/history_library/<slug>`: 1 template `library/hero.html` + dữ liệu `backend/data/library_heroes.json` (`title`, `person`, `image` — cùng tên file trong `characters/avatar/` và `characters/library/`, `badge`, `name`, `subtitle`, `cards[{heading, body}]` — chuỗi HTML in bằng `|safe`). Thẻ trái/phải xen kẽ, thẻ cuối ở giữa, số thứ tự tự sinh.
- Thêm nhân vật = 1 mục JSON + liên kết trong `history.html`. **Không** tạo HTML/CSS/JS riêng cho từng nhân vật.
- Mục `nguyen-hue` đang tạm dùng nội dung Trưng Trắc — chờ team soạn (không tự viết).
- Trang `history.html` vẫn tải ảnh avatar gốc (~1 MB/ảnh); có thể đổi sang `thumb/*.webp` như trang chủ.

## Trắc nghiệm `/quiz`

- `quiz.js` đếm giờ **chỉ lúc suy nghĩ** (từ lúc hiện câu tới lúc chọn, không tính 3,5 s xem giải thích); hết bài gửi `POST /api/quiz/result`, khách được nhắc đăng nhập. Không thưởng.
- Ngân hàng câu: `static/assets/question/trung-trac-question.json` (nội dung lịch sử — xem rule `history-content.md`).

## Chung

- Ô bảng/tên người chơi gán bằng `textContent`, không đưa dữ liệu người dùng vào `innerHTML`.
- **Icon vàng**: ảnh `assets/images/icon/icon_gold.png` (CSS `.res-icon--gold`); **không dùng emoji 🪙** (Windows 10 không hiện). **Avatar người chơi**: `assets/images/avatar/avatar_male.png`/`avatar_female.png` (thanh niên Lạc Việt chung chung, không phải nhân vật lịch sử), lỗi tải thì hiện chữ "Nam"/"Nữ".
- Responsive: kiểm tra ở desktop + điện thoại dọc (≤ 600px rộng) + điện thoại ngang (≤ 500px cao) — skill `/verify-ui`.
