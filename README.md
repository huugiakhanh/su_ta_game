# Sử Ta

Game 2D giáo dục lịch sử Việt Nam, gồm trang chính, thư viện lịch sử và các màn platformer chạy trên Canvas.

## Chạy local

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
py -m pip install -r requirements.txt
Copy-Item .env.example .env
# Sửa SUTA_DATABASE_URL trong .env cho đúng PostgreSQL của bạn
py app.py
```

Đặt `SUTA_DATABASE_URL` theo `.env.example`, sau đó mở `http://127.0.0.1:5000`. Lần chạy đầu sẽ tự tạo bảng `users` và tài khoản demo `admin/admin` trong PostgreSQL.

Project chỉ hỗ trợ PostgreSQL.

## Các URL chính

- `/` — trang chủ.
- `/history` — thư viện lịch sử.
- `/gameplay/levels/trung-trac` — màn thử Trưng Trắc.
- `/gameplay/levels/level-test` — prototype điều khiển cơ bản.
- Các URL gameplay cũ vẫn được giữ để không làm hỏng liên kết hiện có.
- `/login`, `/register` — API xác thực hiện tại; bản mới `/api/auth/login`, `/api/auth/register` cũng được hỗ trợ.

## Kiến trúc

Chi tiết nằm trong [`docs/architecture.md`](docs/architecture.md).
