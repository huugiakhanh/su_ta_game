# Kiến trúc dự án Sử Ta

## Mục tiêu

Tách rõ ba lớp thay đổi độc lập:

1. `backend` — HTTP, cấu hình PostgreSQL và nghiệp vụ tài khoản.
2. `frontend` — template HTML, CSS, JavaScript giao diện và logic từng màn.
3. `frontend/static/assets/images` — tài nguyên hình ảnh/GIF của game.

Game hiện đang là Flask server-rendered app. Đây là lựa chọn phù hợp ở giai đoạn prototype vì có thể phát triển nhanh mà chưa cần bundler JavaScript. Khi số màn tăng, mỗi màn có thể chuyển dần sang module JavaScript hoặc engine riêng mà không ảnh hưởng API tài khoản.

## Cấu trúc hiện tại

```text
su_ta_game/
├── app.py                         # entry point duy nhất
├── backend/
│   ├── __init__.py                # application factory
│   ├── config.py                  # biến môi trường/cấu hình
│   ├── db.py                      # kết nối PostgreSQL và khởi tạo schema
│   ├── repositories/
│   │   └── user_repository.py     # truy vấn users
│   └── routes/
│       ├── pages.py               # các trang HTML
│       └── api.py                 # login/register
├── frontend/
│   ├── templates/
│   │   ├── home.html
│   │   ├── history.html
│   │   ├── components/chapter-modal.html
│   │   └── gameplay/levels/*.html
│   └── static/
│       ├── css/{main,history}.css
│       ├── css/components/chapter-modal.css
│       ├── css/levels/*.css
│       ├── js/{home,history}.js
│       ├── js/levels/trung-trac.js
│       └── assets/images/...
├── docs/
├── tests/
├── requirements.txt
└── .env.example
```

## Luồng chính

```text
Browser
  ├── GET page ──> pages blueprint ──> Jinja template
  ├── GET /static ──> CSS / JS / images
  └── POST auth ──> API blueprint ──> user_repository ──> PostgreSQL
```

Logic gameplay vẫn nằm trong level-specific JS vì đang dùng Canvas trực tiếp. Các hằng số map, obstacle và enemy hiện nằm trong `trung-trac.js`; bước tiếp theo nên đưa chúng sang `data/levels/trung-trac.json` để level designer chỉnh mà không sửa code.

## Quy ước mở rộng

- Thêm trang: thêm route trong `backend/routes/pages.py` và template trong `frontend/templates`.
- Thêm API: thêm endpoint trong `backend/routes/api.py`; nghiệp vụ truy cập dữ liệu đặt trong repository/service, không viết SQL ở template.
- Thêm level: tạo một template, một CSS, một JS dưới `frontend/.../levels`, sau đó thêm route trang.
- Thêm asset: đặt trong `frontend/static/assets/images`; trong template dùng `url_for('static', ...)`, trong JS dùng URL bắt đầu bằng `/static/assets/...`.
- Không tạo thêm `app.py` backend phụ cho thử nghiệm. Nếu cần prototype, đặt trong `tests/` hoặc `docs/archive/`.

## Việc nên làm tiếp theo

1. Đổi mật khẩu plaintext sang hash và thêm migration cho bảng `users`.
2. Tách dữ liệu level (map chunks, vật cản, enemy, câu hỏi) ra JSON hoặc database.
3. Viết test cho `login`, `register` và các route trang.
4. Khi gameplay lớn hơn, tách `trung-trac.js` thành input, physics, entities, renderer và level data.
