# REPORT ASSET-CACHE-01 — Manifest JSON luôn mới sau khi chép asset

Ngày: 12/11/2026. Yêu cầu: sau khi chép asset mới vào bản chạy, trình duyệt đã từng chơi chương đó vẫn dùng manifest cũ tới 24 giờ, nên asset mới bị vẽ thành hộp tạm. Cần cách nhỏ nhất để game luôn đọc manifest mới.

## Hiện trạng / đo trước khi sửa
- `backend/__init__.py` (`after_request`) đặt `Cache-Control: public, max-age=86400` cho **mọi** file dưới `/static/assets/`, gồm cả `manifest_*.json`, `maps_*.json` và `tileset_*.json`.
- `engine/assets.js` `fetchJson()` gọi `fetch()` thường, nên trong 24 giờ trình duyệt dùng bản cache mà không hỏi lại server.
- Phiên giao việc đã tái hiện lỗi ở chương 7 màn 2: `fetch` thường trả 16 mục, còn `fetch(..., {cache: 'no-store'})` trả 34 mục. Worktree này (nhánh `claude/epic-almeida-83ccb8`) mới có chương 1–6, nên phần kiểm lại dùng chương 6.

## Quyết định (người dùng chốt)
- Chọn: file `.json` dưới `/static/assets/` dùng `Cache-Control: no-cache`. Trình duyệt vẫn giữ bản sao nhưng mỗi lần tải phải hỏi lại server; file không đổi thì server trả `304` (Flask gửi file tĩnh kèm ETag/Last-Modified). Ảnh và âm thanh vẫn `public, max-age=86400`.
- Bỏ: thêm tham số phiên bản `?v=` vào URL manifest. Cách này phải sửa `assets.js`, cần một nguồn số phiên bản, và lỗi quay lại nếu quên tăng số.

## File đã sửa / tạo / xoá
| File | Việc |
|---|---|
| `backend/__init__.py` | `cache_static_assets`: đường dẫn kết thúc `.json` thì `no-cache` (bỏ `public`/`max-age`); file khác giữ 24 h như cũ |
| `tests/test_time_api.py` | `test_static_assets_are_cached_but_code_is_not`: PNG vẫn 24 h; manifest `no-cache`, không có `max-age`/`public`; gửi lại với `If-None-Match` → `304` |
| `.claude/rules/backend.md` | Cập nhật mô tả `after_request` |
| `docs/REPORT_ASSET-CACHE-01.md` (mới) | Report này |

Không sửa `assets.js`, `viewer.js`, manifest hay ảnh.

Thay đổi hành vi nhỏ ngoài yêu cầu: có, một chỗ. Ngân hàng câu hỏi `/quiz` (`static/assets/question/*.json`) cũng thành `no-cache`, vì cùng là `.json` dưới `/static/assets/`. Tác dụng: sửa câu hỏi cũng hiện ngay.

## Kết quả test
- `pytest tests`: 150 passed, 1 skipped — PASS. Bản skip là `test_app.py` (thiếu `SUTA_TEST_DATABASE_URL`), tức test có DB **chưa chạy**.
- Header (server dev cổng 5059, chương 6 màn 1): `manifest_ph.json` → `no-cache`; `avatar_male.png` → `public, max-age=86400` — PASS.
- Đổi manifest trên đĩa (thêm tạm trường `_cache_probe` vào `manifest_ph.json`), tải lại trang **không xoá cache**: lượt tải của game nhận bản 32300 byte (trước đó 32280), `fetch` thường thấy `_cache_probe: 1` — PASS. Sau đó đã hoàn tác bằng `git checkout`.
- Tải lại trang khi file không đổi: server log 9 file JSON (manifest chung, manifest chương, 5 `maps_*`, 2 `tileset_*`) đều trả `304`, mỗi file chỉ tốn khoảng 300 byte header — PASS.
- Chương 1–6, màn 1 (`/gameplay/levels/<chương>`): `images.loaded = true`, ảnh nạp đủ (95/95, 77/77, 80/80, 94/94, 88/88, 97/97), không có request asset ≥ 400, console không có lỗi ngoài các lỗi 401 của `/api/game/progress` khi chơi khách (bình thường) — PASS.
- Chương 7: **CHƯA CHẠY**, vì chương này chưa có trong nhánh. Bản sửa nằm ở server và áp cho mọi `.json`, nên không phụ thuộc chương.

## Vấn đề asset
- Không có.

## Câu hỏi cho team / TODO
- Ảnh PNG thay mới mà **giữ nguyên tên** vẫn có thể hiện bản cũ tới 24 giờ (max-age ảnh không đổi). Nếu sau này cần thay ảnh tại chỗ, có thể đặt tên file mới hoặc thêm phiên bản vào đường dẫn ảnh. Việc này để sau.
- Người chơi đang giữ manifest cũ trong cache (nhận header 24 h trước bản sửa) vẫn dùng bản cũ cho tới khi cache đó hết hạn, tối đa 24 giờ sau lần tải cuối. Từ lần tải sau đó, trình duyệt luôn hỏi lại server.
