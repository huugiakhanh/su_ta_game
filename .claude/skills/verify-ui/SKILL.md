---
name: verify-ui
description: >-
  Kiểm tra thay đổi giao diện/gameplay của Sử Ta trên trình duyệt thật (Browser pane) — khởi động server dev, đo request/dung lượng, lỗi console và request lỗi, chạy thử tương tác, chụp và đo ở 5 cỡ màn hình (desktop, laptop, điện thoại dọc/ngang). Dùng sau khi sửa HTML/CSS/JS trang chủ, thư viện, quiz hoặc màn chơi, hoặc khi người dùng hỏi "đã chạy được chưa", "kiểm tra giao diện".
argument-hint: "[trang hoặc tính năng cần kiểm, vd. /quiz, dòng thời gian, màn 3]"
---

# /verify-ui — kiểm chứng trên trình duyệt

Đối tượng: `$ARGUMENTS`. Báo kết quả bằng **số đo** (request, KB, px lệch, số lỗi), không chỉ "trông ổn".

## 1. Server

- Dùng `preview_start` với `name: "su-ta-flask-5057"` (`.claude/launch.json`, debug tắt).
- Debug tắt nên **Jinja cache template**: đã sửa file `.html` mà server đang chạy → `preview_stop` rồi `preview_start` lại. CSS/JS tĩnh chỉ cần tải lại trang.
- Lần đầu chạy server sẽ áp migration mới vào **DB dev của người dùng** — báo trước nếu có migration mới.
- Xong việc thì `preview_stop`.

## 2. Tài khoản và dữ liệu

- Browser pane có thể đang **đăng nhập tài khoản thật** của người dùng: **không đăng xuất**, không đổi avatar/mật khẩu của tài khoản đó.
- Cần thử form đăng nhập/đăng ký khi đang đăng nhập → mở form trực tiếp bằng module (vd. `import('/static/js/home/loader.js').then(l => l.loadComponent('login'))` rồi `openLogin()`), không đăng xuất.
- Thao tác **ghi dữ liệu** (gửi kết quả quiz, lưu kỷ lục) sẽ vào tài khoản đó → hạn chế; nếu đã ghi thì báo người dùng dữ liệu thử nào đã tạo và cách xoá. Không tự xoá dữ liệu trong DB.
- Thao tác này đổi `localStorage` (vd. chọn nhân vật ở dòng thời gian) → nhắc người dùng.

## 3. Đo tải trang

Chạy trong trang bằng `javascript_tool` (sau khi tải xong ~1 s):

```js
const e = performance.getEntriesByType('resource');
({ count: e.length,
   failed: e.filter(r => r.responseStatus >= 400).map(r => r.name),
   names: e.map(r => r.name.replace(location.origin, '')) })
```

- `transferSize` = 0 khi file lấy từ cache → muốn biết dung lượng thì `fetch(n, {cache:'force-cache'}).then(r => r.blob())` lấy `size`.
- `read_console_messages` **giữ cả log của lần tải trước** → kết luận lỗi theo `failed` ở trên hoặc `read_network_requests` của lần tải mới.

## 4. Tương tác

- Trang chủ: cửa sổ chỉ tải khi bấm — kiểm rê chuột **không** sinh request, bấm thì sinh đúng HTML + CSS + JS của cửa sổ đó.
- Gọi hàm trực tiếp được: `openTimeline()`, `openLeaderboard('quiz')`, `openAchievements()`, `moBangDangNhap()`, `openChapterModal()`.
- Màn chơi: `?debug=1` vào thẳng màn 2/3 (dữ liệu giả, đủ phần thưởng, không gửi kỷ lục); `?layout=p2` (màn 1), `?layout=skills` (màn 3); `?viewer=1` xem sprite; phím **F2** hiện hitbox/pivot.
- Ưu tiên `read_page`/`find`/`javascript_tool` để kiểm nội dung; chụp màn hình để chứng minh phần nhìn.

## 5. Cỡ màn hình

Kiểm bằng `resize_window` (tải lại trang sau khi đổi cỡ nếu bố cục phụ thuộc lúc nạp):

| Cỡ | Ý nghĩa |
|---|---|
| 1920×1080 | desktop lớn |
| 1366×768, 1280×720 | laptop / màn thấp |
| `preset: mobile` (375×812) | điện thoại dọc (CSS `max-width: 600px`) |
| 812×375 | điện thoại ngang (CSS `max-height: 500px` + landscape) |

Đo những gì dễ vỡ: tràn cuộn (`scrollHeight - clientHeight`), phần tử ra ngoài khung (`getBoundingClientRect`), căn thẳng hàng (vd. độ lệch tâm chấm so với trục). Xong thì `resize_window` `preset: "desktop"`.

## 6. Bẫy đã gặp

- Ảnh chụp **ngay sau khi mở cửa sổ có hiệu ứng mờ dần** có thể ra mờ/trong suốt dù trang đúng → chụp lại lần nữa trước khi kết luận.
- Trang trả về bản cũ sau khi sửa template → server chưa khởi động lại (mục 1).
- Request 404 tới file đã xoá/đổi tên → còn chỗ trỏ cũ; `grep` đường dẫn cũ trong repo.

## 7. Báo cáo

Liệt kê: đã kiểm gì, ở cỡ nào, số đo, ảnh chụp nếu là thay đổi nhìn thấy; **điều chưa kiểm được** (vd. đăng nhập thật) nói rõ.
