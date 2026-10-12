# REPORT HOME-LAZY-01 — Trang chủ tải cửa sổ khi bấm + ảnh thu nhỏ

Ngày: 12/10/2026. Yêu cầu người dùng: trang chủ tải quá nhiều, có thể gây giật lag. Cần chia thành component, bấm vào phần nào thì JS mới tải phần đó.

## Đo trước khi sửa
Một lần mở trang chủ tải **25 request, ~27 MB**:
- 16 ảnh avatar của cửa sổ Dòng thời gian (đang ẩn): ~19,8 MB (ảnh 1024×707, chỉ hiện dạng ô 220×110).
- Ảnh nền `home-game-4.gif`: 4,3 MB. Logo `logo2.png`: 2,9 MB (1536×1024, hiển thị ≤ 350px).
- HTML + JS + CSS: ~80 KB (chỉ ~0,3%).

## Quyết định (người dùng chốt)
- Mỗi cửa sổ tải cả HTML + CSS + JS khi bấm lần đầu.
- Cho phép Claude tạo **bản thu nhỏ** ảnh (ngoại lệ quy tắc "Claude không sửa ảnh"): ảnh gốc giữ nguyên, ảnh nền GIF giữ nguyên.
- Chờ người dùng xem trước rồi mới commit.

## Thiết kế
- `home.html`: chỉ còn khung chính (thanh trên, menu, logo, 3 nút).
- 5 cửa sổ = 5 bộ file: `templates/components/home/<tên>.html` + `css/home/*.css` + `js/home/<tên>.js` — `timeline`, `leaderboard`, `achievements` (2 cửa sổ này dùng chung `board.css`), `login` (đăng nhập/đăng ký + hồ sơ), `chapter` (chọn chương → chọn tướng).
- `js/home/loader.js`: lần đầu mở thì tải song song HTML (route `/components/home/<tên>`), CSS, module JS. Sau đó gắn HTML vào `<body>`, gọi `init()`, các lần sau dùng lại. Lỗi thì lần sau thử lại. Chậm quá 150 ms thì hiện "Đang tải...", lỗi thì hiện "Không tải được, hãy thử lại.".
- Chỉ tải khi **bấm**. Bản đầu có tải trước khi rê chuột, người dùng yêu cầu bỏ (12/10).
- `js/home/main.js`: khôi phục đăng nhập, nhân vật đã chọn, hàm `window.open*`. `js/home/shared.js`: trạng thái `home.user` + hàm dùng chung.
- Ảnh: `tools/make_home_images.py` sinh `characters/avatar/thumb/*.webp` (rộng 440px) và `logo2.webp` (rộng 700px). Ảnh dòng thời gian thêm `loading="lazy"`.

## File đã sửa / tạo / xoá
| File | Việc |
|---|---|
| `frontend/templates/home.html` | Bỏ 3 cửa sổ + 2 include, logo → `logo2.webp`, script → `js/home/main.js` (module) |
| `frontend/templates/components/home/{timeline,leaderboard,achievements}.html` (mới) | Cắt nguyên văn từ `home.html`; timeline trỏ ảnh `thumb/*.webp` + `loading="lazy"` |
| `frontend/templates/components/home/{login,chapter}.html` | Đổi tên từ `components/login-modal.html`, `chapter-modal.html` (chỉ sửa chú thích) |
| `frontend/static/css/main.css` | Bỏ phần riêng của cửa sổ (giữ lớp nền `.modal-overlay`), thêm `.home-toast` |
| `frontend/static/css/home/{timeline,board,login}.css` (mới) | Tách nguyên văn từ `main.css`, kể cả phần `@media` tương ứng |
| `frontend/static/css/home/chapter.css` | Đổi tên từ `css/components/chapter-modal.css` |
| `frontend/static/js/home/{main,loader,shared,timeline,leaderboard,achievements,login,chapter}.js` (mới) | Chia từ `home.js` |
| `frontend/static/js/home.js` | Xoá (đã chia hết) |
| `backend/routes/pages.py` | Route `/components/home/<tên>` (chỉ nhận 5 tên, còn lại 404) |
| `tools/make_home_images.py` (mới) + 17 ảnh `.webp` (mới) | Ảnh thu nhỏ; ảnh gốc không đổi |
| `tests/test_time_api.py` | Test trang chủ không còn cửa sổ / route component / tên lạ 404 |
| `CLAUDE.md`, `docs/architecture.md` | Cây thư mục, mục "Trang chủ (HOME-LAZY-01)" |

Thay đổi nhỏ về hành vi: nút "BẮT ĐẦU CHƠI" khi khôi phục từ lần trước hiện "⚔️" giống lúc chọn (trước là "⚔"), tên nhân vật gán bằng `textContent` thay `innerHTML`.

## Kết quả test
- `pytest tests`: 71 PASS, 1 skip (`test_app.py` cần `SUTA_TEST_DATABASE_URL`) — PASS.
- Đo trên trình duyệt (server dev 5057), mở trang chủ: **9 request, ~4,5 MB** (trước 25 request, ~27 MB). Trong đó ảnh nền GIF chiếm 4,3 MB. Không còn cửa sổ nào trong trang lúc đầu — PASS.
- Dòng thời gian: mở được, ảnh thu nhỏ nét, chỉ tải ảnh trong tầm nhìn (7/16), chọn Trưng Trắc → nút "BẮT ĐẦU CHƠI" + localStorage đúng, cửa sổ đóng — PASS.
- Bảng xếp hạng: tab Toàn game/Quiz đúng cột, hạng của mình đúng — PASS. Thành tựu: 6 dòng, "2/6", `board.css` chỉ tải 1 lần — PASS.
- Hồ sơ (đang đăng nhập): mở đúng, avatar đang dùng được đánh dấu — PASS. Form đăng nhập/đăng ký: mở bằng module (không đăng xuất tài khoản của trình duyệt), avatar vẽ đúng — PASS. **Chưa thử** đăng nhập/đăng ký/đăng xuất thật (cần tài khoản thử).
- Chọn chương → chọn tướng → Esc đóng — PASS.
- Điện thoại 375×812: dòng thời gian + BXH áp dụng đúng CSS điện thoại — PASS.
- Không request nào lỗi sau khi tải lại — PASS.

## TODO / ghi chú
- Ảnh nền `home-game-4.gif` (4,3 MB) giờ là phần nặng nhất. Đổi sang video/WebP động sẽ nhẹ hơn nhiều, nhưng đây là asset nên cần team quyết.
- Cửa sổ "chọn chương → chọn tướng" chưa có nút nào mở (đã như vậy trước khi sửa).

## Bổ sung 12/10 — giao diện mới cho Dòng thời gian
Người dùng yêu cầu làm lại CSS. Đã chốt: giao diện gỗ + vàng như Bảng xếp hạng, thẻ khoá có ảnh xám mờ + ổ khoá, thẻ cao hơn để thấy phần trên ảnh.
- `css/home/timeline.css` viết lại. Trong `components/home/timeline.html`: bỏ thẻ `div.timeline-line` (trục giờ là `.timeline-items::before`, dài đúng bằng dãy thẻ, trước cố định 3800px) và đổi nút ❌ thành "X" giống nút đóng BXH.
- Lỗi đã sửa:
  - `.locked` / `.lock-overlay` trước đây không có CSS nào (thẻ khoá trông như thẻ thường, vẫn nổi lên khi rê chuột).
  - Chấm lệch trục ~30px; nay đặt theo tâm trục, lệch 0px.
  - Ảnh bị cắt mất tên poster; nay khung ảnh đúng tỉ lệ 1024×707 nên hiện trọn ảnh.
  - Thừa khoảng trống; nay cỡ thẻ co giãn theo chiều cao màn hình `clamp(190px, 28vh, 320px)`.
- Thẻ chơi được: viền vàng, nhãn "▶ CHƠI NGAY" ở góc dưới ảnh. Thẻ khoá: ảnh xám tối, nhãn "🔒 Chờ mở khóa" giữa ảnh, con trỏ thường.
- Kiểm tra trên trình duyệt ở 1920×1080, 1366×768, 1280×720, 375×812, 812×375: chấm lệch trục 0px, không cuộn dọc. Chọn Trưng Trắc vẫn đổi nút "BẮT ĐẦU CHƠI" và đóng cửa sổ — PASS.
