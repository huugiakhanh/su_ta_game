# CLAUDE.md

Hướng dẫn cho Claude Code khi làm việc trong repo này.

## Giới thiệu game

**Sử Ta** là game 2D 8-bit giáo dục lịch sử Việt Nam, chạy trên web (HTML/CSS/JS render qua Canvas + Flask/Python backend). Người chơi vào vai các nhân vật lịch sử, vượt qua chướng ngại vật (đá tảng, chông tre, lính gác...), thu thập vật phẩm, gặp NPC/"người tài" để trả lời câu hỏi lịch sử đổi lấy phần thưởng (thêm máu, thêm giáp, tăng dame...), và đánh bại boss cuối màn.

**Cấu trúc dự định**: game chia theo **chương** (mỗi chương ứng với một giai đoạn/nhân vật lịch sử, ví dụ "Trưng Trắc – Trưng Nhị"), mỗi chương thường gồm **3 phần** (level) nối tiếp nhau, phần cuối kết thúc bằng trận đánh boss.

**Trạng thái hiện tại** (đã code, không phải toàn bộ thiết kế trên): mới có **1 phần chơi được** — "Màn thử Trưng Trắc" ([frontend/static/js/levels/trung-trac/](frontend/static/js/levels/trung-trac/)) — coi như phần mở đầu prototype của chương Trưng Trắc. Cơ chế 3-phần/chương, hệ thống giáp, và tăng dame vĩnh viễn **chưa được cài đặt**; đây là roadmap thiết kế, không phải code đang chạy. Khi được yêu cầu làm việc liên quan, luôn kiểm tra lại code thực tế thay vì giả định roadmap đã hoàn thành.

## Kiến trúc kỹ thuật

Flask server-rendered app, chưa dùng bundler JS (giai đoạn prototype). Gameplay phía client dùng **ES modules chuẩn của trình duyệt** (`<script type="module">` + `import`/`export`) để chia file mà không cần webpack/vite/npm — xem cấu trúc `trung-trac/` bên dưới.

```
su_ta_game/
├── app.py                    # entry point duy nhất — không tạo thêm app.py phụ
├── backend/
│   ├── __init__.py           # application factory (create_app)
│   ├── config.py             # biến môi trường (.env qua python-dotenv)
│   ├── db.py                 # kết nối PostgreSQL (psycopg2) + init schema `users`
│   ├── repositories/
│   │   └── user_repository.py
│   └── routes/
│       ├── pages.py          # route trả HTML (Jinja templates)
│       └── api.py            # /login, /register, /api/auth/*
├── frontend/
│   ├── templates/            # Jinja: home, history, gameplay/levels/*.html
│   └── static/
│       ├── css/{main,history}.css, css/levels/*.css
│       ├── js/{home,history}.js
│       ├── js/levels/trung-trac/    # ES modules — logic gameplay màn Trưng Trắc (xem bên dưới)
│       ├── js/levels/level-test.js  # level khác vẫn dùng 1 file duy nhất
│       └── assets/images/... # backdrop, sprite nhân vật, obstacle, item
├── docs/
│   ├── architecture.md       # tài liệu kiến trúc kỹ thuật chi tiết (đọc thêm nếu cần)
│   └── archive/              # bản nháp/prototype cũ, không phải code chạy
└── tests/test_app.py
```

Database chỉ hỗ trợ **PostgreSQL** (không SQLite). Bắt buộc `SUTA_DATABASE_URL` trong `.env`.

### Luồng chính

```
Browser
  ├── GET page   → pages_bp   → Jinja template
  ├── GET /static → CSS/JS/images
  └── POST auth  → api_bp     → user_repository → PostgreSQL
```

Gameplay (vật lý, va chạm, vẽ canvas) chạy hoàn toàn phía client trong file JS riêng của từng màn — backend không biết gì về logic trong-màn-chơi, chỉ phục vụ trang tĩnh + auth.

## Cấu trúc module — frontend/static/js/levels/trung-trac/

Tách theo trách nhiệm, không phụ thuộc vòng (DAG), import thẳng bằng đường dẫn tương đối (`./config.js`...):

- `config.js` — hằng số thuần (kích thước, vật lý, asset path). Mọi module khác import từ đây, không định nghĩa lại.
- `geometry.js` — hàm thuần: `worldX`, `aabb`, `groundYAt`, `makeObstacle`.
- `assets.js` — cache `images` + các hàm `load*`/`loadAssets()`. Không đụng DOM ngoài `Image()`.
- `state.js` — `state` (export dạng `let` + `setState()` vì bị gán lại toàn bộ mỗi lần chơi lại — ES module named import là live-binding nên các module khác luôn thấy giá trị mới) + `createLevelState()` (nội dung level: player/obstacles/holes/books/enemies).
- `input.js` — `keys`/`pressed` + `setKey`/`clearInput`/`bindInput()`.
- `ui.js` — DOM refs (`ui`), `updateHud()`, `showMessage()`, `tickMessage()`.
- `physics.js` — `update(dt)` (vòng lặp mô phỏng chính) + `hurtPlayer`/`respawnAfterFall`/`startAttack`/`startDash`/`endGame`.
- `render.js` — `draw()` + toàn bộ hàm vẽ canvas, giữ `canvas`/`ctx`/`playerSprite` refs.
- `main.js` — entry point (script `type="module"` trong template): `resetGame()`, vòng lặp `frame()`, wiring nút bấm, gọi `loadAssets()`.

Thêm nội dung mới (obstacle/hazard/item/level data) thường chỉ cần sửa `state.js` (dữ liệu) và `config.js` (asset path + cỡ vẽ); thêm cơ chế gameplay mới sửa `physics.js`; thêm hiệu ứng vẽ sửa `render.js`.

## Cơ chế gameplay

- **Map**: level dài 12 × 1280px (world-space, dùng để định vị obstacle/book/enemy qua `worldX(chunk, localX)`), nhưng nền vẽ bằng **2 layer parallax chồng nhau** (`sky` = trời+vật xa, ảnh opaque, vẽ trước; `foreground` = đất/cây/nhà, PNG nền TRONG SUỐT, vẽ đè lên sau — xem `BACKDROP_LAYERS`) với `GROUND_Y` cố định — không còn 12 ảnh toàn cảnh ghép cạnh nhau như bản cũ (cách cũ gây lệch khung hình ở mép nối vì mỗi ảnh AI generate độc lập không đồng nhất). Từng thử tách 3 lớp riêng rồi cắt 1 ảnh gộp làm 2 — cuối cùng chốt kỹ thuật layer chồng có alpha vì AI tạo ảnh không "cắt lớp" khớp nhau được nhưng vẽ tốt 1 lớp có nền trong suốt. Set-piece cốt truyện đặt qua mảng `LANDMARKS` theo toạ độ world-X. Layer `ground` (`ground.png`, dải cỏ/đất 70px vẽ ở cỡ gốc sát đáy khung) có ~34px trong suốt phía trên mép cỏ, nên `GROUND_Y` = `GROUND_LAYER_TOP + GROUND_GRASS_OFFSET` (= 324) nằm ở mép cỏ — không kéo giãn ảnh đất để khớp sàn (vỡ ảnh), mà dời sàn vật lý cho khớp ảnh. Asset cần tạo xem [docs/asset-brief-trung-trac.md](docs/asset-brief-trung-trac.md).
- **Nhân vật**: di chuyển trái/phải, nhảy (`jump`), lướt/dash (`dash` — bất tử tạm thời + vượt được obstacle loại `overhead`), đánh cận chiến (`attack`). Animation chọn theo thứ tự ưu tiên `hurt > dash > attack > jump > run > idle` (xem `drawPlayer()`): `hurt` dùng `player.hurtTimer` (đặt trong `hurtPlayer()`, dài `HURT_ANIMATION_TIME`), `attack` dùng `attackCooldown` (.36s) chứ không phải `attacking` (.18s — chỉ là khung gây sát thương) để cú vung kiếm chạy hết.
- **Chướng ngại vật tĩnh** (`obstacles` — mỗi loại là 1 ảnh riêng trong `assets/images/obstacles/`, xem `OBSTACLE_SPRITE_FILES`): `fallenBranch`, `stoneBlock`, `fenceLow`, `bambooSlope`, `reedCurtain`, `slideBar`, `bridge`, `fenceHigh`, `logDrift` (màn hiện chỉ dùng `fallenBranch`, `stoneBlock`, `reedCurtain`; các ảnh khác vẫn khai báo sẵn). Mỗi loại có cờ:
  - `harmful: true` → chạm là mất máu.
  - `overhead: true` + `requiresDash` → bắt buộc dash mới né được (`reedCurtain`, `slideBar`).
  - Loại thường (không harmful, không overhead) → hoạt động như platform đứng lên được nếu nhảy/rơi trúng từ trên xuống, va ngang thì mất máu.
- **Chướng ngại vật CÓ TRẠNG THÁI** (`hazards` — bộ sprite sinh ra ở `artifacts/sprite-forge-trung-trac/`, tạo bằng `makeHazard()` trong `geometry.js`). Khác `obstacles` ở chỗ có hành vi riêng theo `kind`, và `localX` là **tâm** vật chứ không phải mép trái (vì bẫy/xe đổi sprite giữa chừng, neo tâm thì vật không trượt):
  - `roller` — nằm chờ tới khi người chơi vượt `triggerX` (hoặc tới khi có báo động) rồi lao sang trái; ra khỏi tầm thì xoá khỏi state. Kiệu quan, hổ, xe cống, kỵ binh.
  - `thrower` — đứng yên, vào tầm `fireRange` thì bắn đạn theo chu kỳ. Lính thu thuế, lính gác tháp.
  - `boat` — thuyền tuần tra neo trong khe sông, bắn tên lửa. **Hiện không dùng trong màn** (đã bỏ cùng 2 hố ở chunk 4), code vẫn giữ.
  - `trap` — vô hại tới khi người chơi tới sát `triggerDistance` thì đổi sang `sprungSprite` và bắt đầu gây sát thương (cỏ dại → hố chông). `spike_pit_open.png` là ảnh MẶT CẮT hố nên khai báo `groundLine` (vị trí mép cỏ trong ảnh, 0..1) trong `HAZARD_SPRITE_SIZES`: render neo mép cỏ vào `GROUND_Y` để lòng hố chìm xuống dải đất (thay vì neo đáy ảnh làm hố lồi lên), và tô nền tối cho miệng hố (`pitLeft`/`pitRight`).
  - `prop` — chỉ để vẽ, không va chạm (tháp canh, xác xe cống).
  - Hazard có `hp > 0` thì chém được; loại có `wreckSprite` (xe cống) không biến mất mà đổi thành đống đổ nát nằm lại map.
- **Đạn** (`projectiles`): sinh ra từ hazard có `projectile`, bay ngang về phía người chơi, chạm thì mất máu, chém trúng thì tan. Cỡ khai báo trong `PROJECTILE_SIZES`.
- **Sprite động vẽ trên canvas phải là PNG strip ngang**, không phải GIF (canvas chỉ lấy khung đầu của GIF — chỉ nhân vật chính dùng GIF vì nó là `<div>` HTML). Số khung/tốc độ khai báo trong `OBSTACLE_STRIP_FILES`/`ITEM_STRIP_FILES`, cỡ vẽ + hitbox trong `HAZARD_SPRITE_SIZES`; `drawStripSprite()` trong `render.js` cắt ô thứ `i` theo đồng hồ chung của game. Mỗi strip có `facing` = hướng mặt GỐC trong ảnh (mặc định `'left'`; kiệu quan, lính thu thuế, lính gác được AI vẽ quay phải nên khai báo `'right'`) — `drawHazardArt()` tự lật để vật di chuyển quay theo hướng chạy, lính đứng/boss quay về phía người chơi. Thêm sprite mới thì kiểm tra hướng mặt thật trong ảnh, đừng tin spec. Atlas `mapchunk_1/contains obstacles.png` đã **bỏ hẳn** — enemy giờ cũng dùng strip riêng (xem `ENEMY_SPRITES`).
- **Hố (`holes`)**: rơi xuống → mất 1 máu + respawn tại đầu chunk gần nhất. Màn hiện tại **không có hố** (`holes: []`), cơ chế vẫn giữ.
- **Mật độ màn**: đúng **12 chướng ngại vật kể cả boss**, khoảng 1 cái/chunk — danh sách và thứ tự nằm trong comment đầu `obstacles` ở `state.js`. Thêm/bớt vật cản thì giữ con số này trừ khi được yêu cầu khác.
- **Vật phẩm thu thập** (`books`): vẽ bằng `items/book.png` (xem `ITEM_FILES`), đủ số lượng quy định mới được qua cổng/kết thúc màn.
- **Câu hỏi lịch sử** (`questionPanel`): dừng game giữa màn, trả lời đúng cộng điểm, sai trừ máu — đây là cơ chế "gặp người tài" theo mô tả game, hiện chỉ có 1 câu hỏi hard-code.
- **Enemy/Boss** (`enemies`): enemy thường có thể đánh bại bằng attack; boss ở cuối màn — phải hạ boss + đủ điều kiện thu thập mới hoàn thành màn. Ảnh lấy theo cờ `boss` qua `ENEMY_SPRITES`: lính thường dùng strip lính Hán, boss dùng strip kỵ binh.
- **HUD**: máu vẽ bằng icon `items/heart.png` (1 icon/1 máu, xem `updateHud()`), điểm, tiến độ (progress bar theo % quãng đường).
- Điều khiển: bàn phím (WASD/Arrow, Space, Shift, J) và nút cảm ứng mobile (`data-control`) dùng chung 1 state input.
- **Chưa dùng tới**: `items/armor.png`, `items/question_scroll.png`, `items/book_gold.png`, `items/book-open.png` — chưa có mechanic tương ứng (giáp, đánh dấu điểm hỏi đáp...), để dành cho roadmap Phần 2/3. `obstacles/spikes.png` (`spikesTrap`) đã bị cặp `spike_pit_hidden`/`spike_pit_open` thay chỗ trong màn nhưng vẫn giữ trong `OBSTACLE_SPRITE_FILES`.

## Quy ước mở rộng (khi thêm nội dung game)

- **Thêm level/phần mới**: tạo 1 template (`frontend/templates/gameplay/levels/`), 1 CSS (`frontend/static/css/levels/`), 1 JS (`frontend/static/js/levels/`), rồi thêm route trong `backend/routes/pages.py`. Level nhỏ/đơn giản có thể theo mẫu `level-test.js` (1 file); level đang phát triển tiếp (nhiều obstacle/cơ chế) nên theo mẫu module hoá của `trung-trac/` (xem "Cấu trúc module" ở trên) — dùng `<script type="module">` trỏ tới `main.js` của thư mục đó.
- **Thêm chương mới**: đặt tên file/level theo nhân vật-giai đoạn lịch sử tương ứng (nhất quán với `trung-trac`), giữ cấu trúc 3-phần nếu áp dụng thiết kế roadmap.
- **Thêm API**: thêm endpoint trong `backend/routes/api.py`; nghiệp vụ dữ liệu đặt trong `backend/repositories/`, không viết SQL trong route hay template.
- **Thêm asset**: đặt trong `frontend/static/assets/images/`; dùng `url_for('static', ...)` trong template, dùng URL bắt đầu `/static/assets/...` trong JS.
- **Không** tạo thêm `app.py` phụ để thử nghiệm — nếu cần prototype, đặt trong `tests/` hoặc `docs/archive/`.
- Dữ liệu màn chơi (tọa độ obstacle, câu hỏi, enemy...) hiện **hard-code trực tiếp trong JS** của từng level (xem known issues bên dưới) — khi sửa nội dung màn, sửa đúng file JS đó, không tạo cơ chế cấu hình mới trừ khi được yêu cầu.
- **Sprite nhân vật (GIF) phải được chuẩn hoá trước khi dùng**: 6 GIF trong `characters/trung-trac/` (`stance/run/jump/dash/attack/hurt`) đã được đưa về **cùng 1 khung 1202×610, nhân vật cùng tỉ lệ, chân cùng đáy khung, đầu cùng toạ độ ngang**. Lý do: mỗi GIF do AI tạo có khung cao thấp khác nhau, mà CSS `background-size: contain` co theo *khung ảnh* chứ không theo nhân vật → nhân vật từng bị phình to/thu nhỏ khi đổi animation (jump to gấp đôi idle). `render.js` suy chiều rộng ô vẽ từ tỉ lệ ảnh thật lúc chạy + neo theo `PLAYER_SPRITE_ANCHOR_X` (vị trí đầu trong khung), nên **không có hệ số bù riêng cho từng animation**. Thêm/thay GIF → chạy `python tools/normalize_player_gifs.py` (xem asset brief), nếu script in ra anchor khác thì cập nhật `config.js`. Khi thiếu GIF, engine tự fallback sang placeholder vẽ bằng canvas (`drawPlayer()`, nhánh `else`).

## Known issues / lưu ý kỹ thuật

- **Mật khẩu lưu plaintext** trong bảng `users` (`backend/db.py`, `user_repository.py`) — không phải bug cần tự ý sửa, nhưng cẩn thận khi động vào auth; nếu người dùng yêu cầu tăng cường bảo mật, cần hash (bcrypt/werkzeug) + migration.
- **Dữ liệu level hard-code trong JS** (obstacle, câu hỏi, enemy) thay vì tách JSON/DB riêng — việc tách dữ liệu ra khỏi code là hướng cải tiến đã được ghi nhận, không phải trạng thái hiện tại.
- Route gameplay giữ cả URL cũ (`/gameplay/level/Trung_Trac/trung-trac.html`) lẫn URL mới (`/gameplay/levels/trung-trac`) để không phá liên kết hiện có — khi thêm level mới, cân nhắc có cần giữ alias tương tự hay không.
- Test (`tests/test_app.py`) cần biến môi trường `SUTA_TEST_DATABASE_URL` (PostgreSQL thật), tự skip nếu thiếu — không phải lỗi nếu thấy test bị skip khi chưa cấu hình.

## Tài liệu asset

- [docs/asset-brief-trung-trac.md](docs/asset-brief-trung-trac.md) — checklist asset đang có / đang thiếu.
- [docs/sprite-spec-trung-trac.md](docs/sprite-spec-trung-trac.md) — đặc tả cho agent vẽ sprite: tạo hình nhân vật + 6 animation, chướng ngại vật tĩnh/động, và các ràng buộc kỹ thuật bắt buộc (nền trong suốt, cắt sát đáy, GIF cho nhân vật vs PNG strip cho vật vẽ trên canvas, bảng cỡ tương đối).
- `artifacts/sprite-forge-trung-trac/` — sản phẩm trung gian của đợt vẽ sprite (ảnh raw, frame đã tách, `pipeline-meta.json`, prompt đã dùng). Không phải asset chạy trong game; file chạy thật đã được chép vào `assets/images/obstacles/` và `assets/images/items/`.

## Chi tiết kiến trúc bổ sung

Xem [docs/architecture.md](docs/architecture.md) để biết thêm chi tiết luồng và các việc dự kiến làm tiếp theo do nhóm tự ghi nhận trước đó.
