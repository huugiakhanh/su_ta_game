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
│   │   ├── components/home/*.html   # cửa sổ trang chủ, tải khi bấm (HOME-LAZY-01)
│   │   ├── gameplay/base.html       # khung màn chơi dùng chung (ENGINE-01)
│   │   └── gameplay/levels/*.html   # template chương, kế thừa base.html
│   └── static/
│       ├── css/{main,history}.css
│       ├── css/home/*.css           # CSS riêng từng cửa sổ trang chủ
│       ├── css/game/game.css        # CSS khung màn chơi dùng chung
│       ├── css/levels/*.css         # CSS riêng chương (nếu cần)
│       ├── js/history.js
│       ├── js/home/                 # ES modules trang chủ: main/loader/shared + 1 file/cửa sổ
│       ├── js/engine/               # engine màn chơi dùng chung mọi chương
│       ├── js/levels/trung-trac/     # phần riêng chương: chapter.js, config, level1-3, boss, skills...
│       └── assets/images/...        # <chương>/ (asset riêng) + shared/ (nhân vật nam/nữ, icon HUD)
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

Gameplay chạy hoàn toàn phía client bằng Canvas. Từ ENGINE-01 tách làm hai lớp:

- **Engine** `frontend/static/js/engine/` — dùng chung mọi chương: người chơi nam/nữ, vật lý, địa hình, hazard, lính canh/quân cảm tử, đạn, vật phẩm, câu hỏi chặn đường, gặp/giải cứu NPC, khe kỹ năng, HUD, hội thoại, âm thanh, tiến trình, kỷ lục, render. Chi tiết: rule [.claude/rules/engine.md](../.claude/rules/engine.md).
- **Chương** `frontend/static/js/levels/<chương>/` — một object định nghĩa chương (`chapter.js`: asset, bảng sprite, nội dung 3 màn, boss, kỹ năng, thoại, nhạc) truyền vào `boot(chapter)`. Engine đọc qua `CHAPTER`/`LEVEL`, không import file chương. Mẫu: `trung-trac/` (rule [.claude/rules/trung-trac-gameplay.md](../.claude/rules/trung-trac-gameplay.md)).

Dữ liệu màn (vật cản, quân, câu hỏi) vẫn hard-code trong `levelN.js` của chương. Bước tiếp theo có thể đưa sang `data/levels/<chương>.json` để level designer chỉnh mà không sửa code.

Asset màn Trưng Trắc là bộ pixel art **32-bit (×4)** do Codex vẽ: sprite ở `assets/images/trung-trac/sprites-32bit/` (`manifest_tt.json`), môi trường (nền parallax, tileset, vật cản, cổng…) ở `assets/images/trung-trac/maps-32bit/` (`maps_tt.json`). Manifest ghi mọi số theo **pixel logic** (canvas 480–640×270) + `density`; engine vẽ ảnh dày vào khung logic nên gameplay không phụ thuộc độ phân giải ảnh. Mỗi màn chỉ nạp ảnh nó dùng (`LEVEL_SPRITES` của chương, nền theo vùng của màn — xem `engine/assets.js`). Nhân vật nam/nữ + icon HUD dùng chung mọi chương ở `assets/images/shared/sprites-32bit/` (`manifest_shared.json`). Nền gồm trời → đồi xa → lớp giữa theo vùng (hoà chéo ở ranh giới vùng) → tile mặt đất; mỗi lớp là ảnh lặp ngang có nền trong suốt. Chi tiết: [CLAUDE.md](../CLAUDE.md), các report `docs/REPORT_TT-HIBIT-0*.md`.

## Quy ước mở rộng

- Thêm trang: thêm route trong `backend/routes/pages.py` và template trong `frontend/templates`.
- Thêm API: thêm endpoint trong `backend/routes/api.py`; nghiệp vụ truy cập dữ liệu đặt trong repository/service, không viết SQL ở template.
- Thêm chương: thư mục `js/levels/<chương>/` theo mẫu `trung-trac/` (định nghĩa chương + nội dung màn), template kế thừa `gameplay/base.html`, route trang — xem mục "Thêm chương mới" trong [CLAUDE.md](../CLAUDE.md).
- Thêm asset: đặt trong `frontend/static/assets/images`; trong template dùng `url_for('static', ...)`, trong JS dùng URL bắt đầu bằng `/static/assets/...`.
- Không tạo thêm `app.py` backend phụ cho thử nghiệm. Nếu cần prototype, đặt trong `tests/` hoặc `docs/archive/`.

## Việc nên làm tiếp theo

1. Đổi mật khẩu plaintext sang hash và thêm migration cho bảng `users`.
2. Tách dữ liệu level (vật cản, enemy, câu hỏi trong `trung-trac/level1-3.js`) ra JSON hoặc database.
3. Viết test cho `login`, `register` và các route trang.
4. ~~Khi gameplay lớn hơn, tách `trung-trac.js` thành input, physics, entities, renderer và level data.~~ Đã xong.
5. ~~Tách phần dùng chung thành engine cho mọi chương.~~ Đã xong (ENGINE-01) — `frontend/static/js/engine/`.
