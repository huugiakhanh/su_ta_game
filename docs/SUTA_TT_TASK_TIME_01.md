# TASK CARD TT-TIME-01 — Thời gian qua màn/chương + menu cài đặt trong màn chơi

Người dùng duyệt 07/10/2026 (hỏi đáp trong phiên Claude Code).

## 1. Mục tiêu

1. Đo thời gian qua từng màn và cả chương Trưng Trắc, hiện trong game và lưu lên bảng xếp hạng.
2. Màn chơi có nút ⚙️ mở menu: **Tiếp tục**, **Âm thanh**, **Thoát khỏi màn chơi**.

## 2. Quyết định đã chốt

| # | Nội dung | Chốt |
|---|---|---|
| D1 | Thời gian tính | Đang chơi + lúc trả lời câu hỏi / hội thoại / cốt truyện + các lượt thua rồi chơi lại (cộng dồn từ lúc vào màn tới lúc thắng) |
| D2 | Thời gian KHÔNG tính | Menu cài đặt mở, đang tải (panel Bắt đầu), máy cầm dọc, cutscene kết chương màn 3 |
| D3 | Hiển thị | Ô ⏱ `mm:ss` chạy trên HUD; panel qua màn hiện thời gian màn; panel kết chương hiện từng màn + tổng |
| D4 | Lưu | Server, bảng `level_records` sẵn có; khách chưa đăng nhập chỉ hiện, không lưu |
| D5 | Đăng nhập | Flask session (`session['username']`); `GET /api/auth/me`, `POST /api/auth/logout`; `save-time` lấy user từ session, không nhận username client gửi |
| D6 | Bản ghi | 1 bản ghi / màn thắng, `level_id` = 100 × chương + màn (Trưng Trắc = chương 1 → 101/102/103); `score` = điểm kiếm được trong riêng màn đó (điểm cuối − điểm mang sang) |
| D7 | Nút cài đặt | ⚙️ thay chỗ 🔊 trên HUD; phím Esc/P mở/đóng; phím M vẫn bật/tắt tiếng |
| D8 | Âm thanh | Thanh trượt Nhạc + Hiệu ứng (0–100 %) + ô Tắt tiếng; nhớ `localStorage` |
| D9 | Thoát | Hỏi xác nhận → về trang chủ; giữ tiến trình màn đã qua, thời gian màn đang chơi bỏ đi |
| D10 | Đăng xuất | Trang chủ: bấm ô người chơi khi đã đăng nhập → hỏi "Đăng xuất?" |

Tải lại trang / thoát rồi vào lại giữa màn → đồng hồ màn đó tính lại từ 0. Thắng màn 1 → tiến trình ghi MỚI (như cũ) nên tổng chương cũng tính lại.

## 3. Test case

| # | Test case |
|---|---|
| T1 | HUD hiện ⏱ chạy khi chơi; đứng yên ở panel Bắt đầu |
| T2 | Mở menu (⚙️ / Esc / P) → game + đồng hồ dừng; Tiếp tục / Esc → chạy tiếp, không kẹt phím |
| T3 | Đồng hồ vẫn chạy khi đang mở câu hỏi / hội thoại |
| T4 | Thua → Chơi lại: đồng hồ màn không về 0 (cộng dồn) |
| T5 | Thắng màn: panel hiện "Thời gian: mm:ss"; tiến trình lưu thời gian màn |
| T6 | Cutscene màn 3 không cộng giờ; panel kết chương hiện 3 màn + tổng |
| T7 | Thanh trượt Nhạc / Hiệu ứng đổi âm lượng, nhớ sau khi tải lại; ô Tắt tiếng đồng bộ với phím M |
| T8 | Thoát → hỏi xác nhận → Huỷ ở lại / Đồng ý về trang chủ |
| T9 | Phím 1–4/Enter của hội thoại và phím điều khiển bị chặn khi menu mở |
| T10 | API: `/api/auth/me` trước/sau login/logout; `save-time` không session → 401; có session → lưu đúng user; dữ liệu sai → 400 |
| T11 | Thắng màn khi đã đăng nhập → bản ghi 101/102/103 trong `level_records`; khách → "Đăng nhập để lưu kỷ lục" |
| T12 | Trang chủ: tải lại vẫn còn đăng nhập; đăng xuất được |
| T13 | Menu cài đặt dùng được trên điện thoại ngang (cảm ứng) |
