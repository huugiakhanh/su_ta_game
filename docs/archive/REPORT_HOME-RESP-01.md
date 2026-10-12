# REPORT HOME-RESP-01 — Trang chủ responsive (điện thoại + tablet)

Ngày: 07/10/2026 · Nhánh: `responsive-mobile` · Trạng thái: **DONE** (chưa commit)

## Yêu cầu (người dùng chốt 07/10)

- Trang chủ dùng được cả **dọc và ngang** trên điện thoại (chỉ màn chơi mới bắt xoay ngang).
- Điện thoại: 4 nút menu phụ (Thành tựu, Bảng xếp hạng, Cửa hàng, Thư viện lịch sử) thành **thanh icon cố định dưới đáy**.
- Thanh tài nguyên 🪙💎⚡: **thu gọn, giữ cả 3** (ẩn nút "+").
- Responsive cả popup **đăng nhập/đăng ký**, **timeline chọn chương**, **bảng xếp hạng**.
- Desktop (> 1024px) giữ nguyên.

## Mốc màn hình

| Mốc | Media query | Bố cục |
|---|---|---|
| Tablet | `601–1024px` rộng, cao ≥ 501px | Giữ bố cục desktop, menu trái nhỏ lại; `.main-area` chỉ chiếm phần dưới top-bar |
| Tablet thấp | như trên + cao ≤ 800px (VD 1024×768) | Logo 240px, khung chào mừng hạ thấp |
| Điện thoại dọc | rộng ≤ 600px | Dòng chảy dọc, khung chào mừng trên thanh đáy, thanh icon dưới đáy |
| Điện thoại dọc thấp | rộng ≤ 600px, cao ≤ 700px | Logo nhỏ hơn |
| Điện thoại ngang | cao ≤ 500px + `landscape` | 3 nút chính 1 hàng, thanh đáy icon + chữ cùng hàng, ẩn khung chào mừng + số phiên bản |

## File đã sửa

| File | Mục đích |
|---|---|
| `frontend/static/css/main.css` | Thêm ở cuối file: class thay inline style (`.player-info--guest`, `.avatar--guest`, `.guest-name`, `.guest-hint`, `.btn-settings`, `.btn-start`, `.main-actions` = `display: contents`) + các khối `@media`. Không sửa CSS desktop phía trên. |
| `frontend/templates/home.html` | Chuyển inline style của ô khách / nút ⚙️ / nút "Bắt đầu chơi" sang class; bọc icon + chữ nút menu phụ trong `<span>`; bọc 3 nút chính trong `<div class="main-actions">`; viewport thêm `viewport-fit=cover` (tai thỏ iPhone, dùng với `env(safe-area-inset-*)`). Không đổi chữ, link, `onclick`, `id`. |
| `frontend/templates/components/login-modal.html` | `width:320px` → `width:min(320px, 92vw)`, thêm `max-height: 92dvh` + cuộn. |

`home.js` không sửa: các selector JS dùng (`.info-text h3`, `.info-text div`, `.avatar`, `.res-item`, `#btn-start-game`) vẫn giữ nguyên. Cột bảng xếp hạng được ẩn bằng `nth-child` nên `<td>` JS sinh ra không cần đổi.

## Kết quả test

| # | Test case | Kết quả |
|---|---|---|
| 1 | Desktop 1440×900: vị trí/kích thước 13 phần tử chính trước và sau sửa (đo `getBoundingClientRect`, so với bản gốc qua `git stash`) | **PASS** — giống hệt |
| 2 | Điện thoại dọc 375×812: không đè, đủ 3 nút chính, thanh đáy 4 nút, top-bar không tràn | **PASS** |
| 3 | Điện thoại dọc nhỏ 360×640: vừa một màn, không cuộn, không thanh cuộn ngang | **PASS** |
| 4 | Điện thoại ngang 812×375 và 667×375: 3 nút chính thấy và bấm được (trước đây bị cắt), không đè | **PASS** |
| 5 | Tablet dọc 768×1024 và ngang 1024×768: menu trái không đè logo, nút chính không chạm khung chào mừng (cách 30px) | **PASS** |
| 6 | Bấm "Bảng xếp hạng" trên thanh đáy (điện thoại ngang) → mở popup | **PASS** |
| 7 | Popup đăng nhập dọc/ngang: vừa màn, input 16px (iOS không tự zoom) | **PASS** |
| 8 | Timeline dọc/ngang: thẻ nhỏ gọn, nút ❌ nằm trong khung, vuốt ngang được | **PASS** |
| 9 | Bảng xếp hạng: dọc ẩn cột Thời gian + Thành tích, ngang ẩn Thành tích; nút X không đè tiêu đề | **PASS** |
| 10 | `pytest tests` | 1 skipped (thiếu `SUTA_TEST_DATABASE_URL` — bình thường) |

Kiểm bằng giả lập viewport trong trình duyệt của Claude, **chưa thử trên máy thật** (iPhone Safari / Android Chrome) — nên thử thêm, nhất là vùng tai thỏ và thanh địa chỉ.

## Vấn đề có sẵn, ngoài phạm vi (không sửa)

- **Ảnh nhân vật timeline 404**: thư mục `frontend/static/assets/images/characters/` không tồn tại → 16 ảnh vỡ (`trung-trac.jpg`, `ba-trieu.jpg`, …), console báo 404 mỗi lần tải trang. Cần team bổ sung ảnh `TODO_MISSING`.
- **`.lock-overlay` chưa có CSS** → chữ "🔒 Chờ mở khóa" hiện như dòng thường trên thẻ thay vì lớp phủ.
- `timeline-line` dùng chiều rộng cố định (desktop 3800px, điện thoại 2880px theo 16 thẻ) — thêm/bớt nhân vật thì phải chỉnh số này.
- Server chạy `SUTA_DEBUG=0` cache template Jinja → sửa HTML phải khởi động lại server mới thấy.

## TODO

- Thử trên máy thật.
- Các nút Thành tựu / Cửa hàng / ⚙️ / "+" chưa có chức năng (như trước).
