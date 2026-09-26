# CLAUDE.md

Hướng dẫn cho Claude Code khi làm việc trong repo này.

## Giới thiệu game

**Sử Ta** là game 2D 8-bit giáo dục lịch sử Việt Nam, chạy trên web (HTML/CSS/JS render qua Canvas + Flask/Python backend). Người chơi vào vai các nhân vật lịch sử, vượt qua chướng ngại vật (đá tảng, chông tre, lính gác...), thu thập vật phẩm, gặp NPC/"người tài" để trả lời câu hỏi lịch sử đổi lấy phần thưởng (thêm máu, thêm giáp, tăng dame...), và đánh bại boss cuối màn.

**Cấu trúc dự định**: game chia theo **chương** (mỗi chương ứng với một giai đoạn/nhân vật lịch sử, ví dụ "Trưng Trắc – Trưng Nhị"), mỗi chương thường gồm **3 phần** (level) nối tiếp nhau, phần cuối kết thúc bằng trận đánh boss.

**Trạng thái hiện tại** (đã code, không phải toàn bộ thiết kế trên): chương Trưng Trắc đã chia **3 màn** (task TT-NPC-01), cùng một bộ module [frontend/static/js/levels/trung-trac/](frontend/static/js/levels/trung-trac/):
- **Màn 1 — Vượt ải** (`/gameplay/levels/trung-trac`): vượt chướng ngại, nhặt 5 binh thư, hạ **mini-boss kiệu quan**, qua cổng Luy Lâu. Chơi được.
- **Màn 2 — Chiêu mộ hiền tài** (`/gameplay/levels/trung-trac/2`): gặp Thi Sách → cốt truyện Thi Sách hy sinh → Lê Chân → Trưng Nhị, trả lời câu hỏi, nhận phần thưởng. Chơi được.
- **Màn 3 — Trận Luy Lâu** (`/gameplay/levels/trung-trac/3`): **trang giữ chỗ** (tóm tắt điểm + phần thưởng). Boss Tô Định 3 giai đoạn **chưa làm**.

Phần thưởng màn 2 (`BUFF_Y_CHI_KIEN_CUONG`, `SK_LE_CHAN_ARROW_RAIN`, `SK_TRUNG_NHI_SHADOW`) mới chỉ được **ghi nhận** vào tiến trình — cơ chế buff/kỹ năng, hệ thống giáp, tăng dame vĩnh viễn **chưa được cài đặt** (roadmap màn 3). Khi được yêu cầu làm việc liên quan, luôn kiểm tra lại code thực tế thay vì giả định roadmap đã hoàn thành. Kế hoạch/report: [docs/NPC_PLAN_TT.md](docs/NPC_PLAN_TT.md), [docs/REPORT_TT-NPC-01.md](docs/REPORT_TT-NPC-01.md).

## Phân công AI và quy trình làm việc

- **Codex** (skill agent-sprite-forge) chỉ vẽ asset. **Claude** viết code gameplay, engine, dữ liệu màn chơi. Claude **không vẽ lại, không chỉnh sửa** file ảnh (PNG/GIF) do Codex xuất; asset lỗi thì ghi vào report kèm đề xuất `NORMALIZE` hoặc `NEED_REDRAW` để giao lại Codex. Ngoại lệ đã có: script chuẩn hoá `tools/normalize_player_gifs.py` (xem "Quy ước mở rộng").
- Không để Codex và Claude cùng làm việc trên cùng một thư mục trong cùng lúc.
- **Task card**: mỗi đầu việc lớn có một file task card trong `docs/` (ví dụ `docs/SUTA_TT_TASK_INTEGRATE_P0.md`). Đọc task card trước khi làm. Nếu task card mâu thuẫn với code thực tế hoặc với file này, **dừng lại và báo** thay vì tự chọn một bên.
- **Lập kế hoạch trước khi code**: liệt kê file sẽ tạo/sửa (owned files) và file chỉ đọc; chờ người duyệt rồi mới sửa. Chỉ sửa trong phạm vi đã duyệt, patch nhỏ nhất đủ đạt acceptance criteria, không refactor ngoài phạm vi.
- **Source of Truth**: không đổi ID/tên animation/số frame của asset, không tạo ID gần giống. Thiếu dữ liệu → ghi `TODO_MISSING`, không tự bịa; số tạm chưa qua chơi thử → ghi `DESIGN_BASELINE`.
- **Debug có bằng chứng**: tái hiện lỗi → nêu giả thuyết → thêm log tối thiểu → chứng minh nguyên nhân → mới sửa → xoá log tạm.
- **Kết thúc task**: chạy các test case trong task card, viết report vào `docs/` (file đã sửa + mục đích, kết quả test PASS/FAIL, vấn đề asset, TODO). Có test FAIL hoặc sửa ngoài phạm vi → báo `BLOCKED`, không báo hoàn thành.
- **Nội dung lịch sử** (tên người, địa danh, sự kiện, câu hỏi và đáp án): không tự sửa; nghi ngờ sai thì hỏi team.

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
│   ├── templates/            # Jinja: home, history, gameplay/levels/*.html (trung-trac.html dùng chung màn 1+2, trung-trac-placeholder.html = màn 3)
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

- `config.js` — hằng số thuần (độ phân giải logic, kích thước, vật lý, asset path, bảng ánh xạ sprite 8-bit `HAZARD_SPRITES`/`ENEMY_SPRITES`/`PROJECTILE_SPRITES`/`PLAYER_ANIMATIONS`/`NPC_SPRITES`, bộ môi trường `ZONES`/`FAR_HILLS`/`OBSTACLE_TYPES`/`FINISH_GATE`, thông số `MINIBOSS`/`GUARD`/`NPC_RULES`/`QUESTION_SCORE`). **`LEVELS`** = thông số từng màn (số chunk, `zones`, `finishX`, `gate`, `title`); màn đang chơi là **`LEVEL`** (`export let`, đặt bằng `setLevel(id)` — live-binding như `VIEW_W`). Code engine đọc độ dài màn/vùng cảnh/cổng qua `LEVEL.*`, **không** dùng thẳng `ZONES`/`LEVEL_CHUNKS`/`FINISH_GATE` (các hằng đó chỉ là số của màn 1). Mọi module khác import từ đây, không định nghĩa lại.
- `animation.js` — registry manifest sprite 8-bit (`registerManifest`, `getAnimMeta`) + hàm animation theo entity (`setAnim` không khởi động lại nếu trùng tên, `tickAnim`, `frameIndex`, `hitTime`, `animLength`). Dùng chung bởi physics (thời điểm gây sát thương/nhả đạn theo `hit_frame`) và render (ô cần vẽ).
- `geometry.js` — hàm thuần: `worldX`, `aabb`, `groundYAt`, `makeObstacle`, `makeHazard`, `makeProjectile`.
- `assets.js` — cache `images` + các hàm `load*`/`loadAssets()` (`maps_tt.json` → `images.maps` gồm lớp nền, tileset, vật cản/bình thư/cổng; `manifest_tt.json` → mọi strip 8-bit trong `SPRITE_8BIT_IN_GAME`; icon HUD). Không đụng DOM ngoài `Image()`/`fetch`.
- `state.js` — `state` (export dạng `let` + `setState()` vì bị gán lại toàn bộ mỗi lần chơi lại — ES module named import là live-binding nên các module khác luôn thấy giá trị mới) + `createLevelState(options)` (chọn nội dung theo `LEVEL.id`: `level1Content()` / `level2Content()` — player/obstacles/holes/books/enemies/hazards/npcs; `options.score` = điểm mang sang) + `bossAlive()` (boss/mini-boss còn sống — physics và render dùng chung).
- `progress.js` — tiến trình giữa các màn (**`sessionStorage`**, khoá `suta.tt.progress`): `readProgress`/`saveProgress`/`clearProgress`/`addReward`, `requireLevel(level)` (chưa hoàn thành màn trước → chuyển về màn 1; `?debug=1` vào thẳng với dữ liệu giả lập, không ghi storage), `LEVEL_URLS`, `REWARD_NAMES`. Sau này đổi sang backend chỉ sửa file này.
- `dialogue-data.js` — nội dung màn 2 (thoại, câu hỏi, đáp án, gợi ý, vì sao đúng, phần thưởng, cốt truyện) **chép nguyên văn** task card TT-NPC-01 mục 5 — Source of Truth, không tự sửa. Đáp án đầu tiên là đáp án đúng.
- `dialogue.js` — khung hội thoại DOM (`#dialoguePanel`): `openNpcDialogue()` (thoại → câu hỏi 3 đáp án xáo → vì sao đúng → phần thưởng), `openStory()`, `closeDialogue()`, `initDialogue({ onDefeat })`. Mở thì `state.paused`. Không import `physics.js` (tránh vòng) — hết máu khi trả lời sai thì gọi `onDefeat` do `main.js` truyền.
- `placeholder.js` — trang giữ chỗ màn 3 (chặn truy cập, tóm tắt điểm/phần thưởng, nút chơi lại từ màn 1).
- `input.js` — `keys`/`pressed` + `setKey`/`clearInput`/`bindInput()`; cờ `debug` (phím **F2**: hitbox, pivot, tên animation + ô).
- `ui.js` — DOM refs (`ui`), `updateHud()`, `showMessage()`, `tickMessage()`.
- `physics.js` — `update(dt)` (vòng lặp mô phỏng chính) + `hurtPlayer`/`respawnAfterFall`/`startAttack`/`startDash`/`endGame`.
- `render.js` — `draw()` + toàn bộ hàm vẽ canvas, giữ `canvas`/`ctx`; `fitCanvas()` phóng canvas logic ra màn hình.
- `main.js` — entry point (script `type="module"` trong template): đọc `<body data-level>` (route truyền `level_id`) → `setLevel()` → `requireLevel()`; `resetGame()`, vòng lặp `frame()`, wiring nút bấm (kể cả “Sang Màn N”), `initDialogue()`, gọi `loadAssets()`/`fitCanvas()`; `?viewer=1` nạp `viewer.js` thay vì chạy màn; `?layout=p2` chạy layout thử vật cản P2 (chỉ màn 1, chỉ để test).
- `viewer.js` — chế độ xem sprite (`/gameplay/levels/trung-trac?viewer=1`): chọn asset → animation trong manifest (sprite 8-bit + vật cản/item/prop trong `maps_tt.json`, nhãn `map/…`), xem ×1/×3/×4, lưới, baseline, pivot, đánh dấu `hit_frame`. Công cụ soát asset, không phải gameplay.

Thêm nội dung mới (obstacle/hazard/item/level data) thường chỉ cần sửa `state.js` (dữ liệu) và `config.js` (asset path, ánh xạ sprite, hitbox); thêm cơ chế gameplay mới sửa `physics.js`; thêm hiệu ứng vẽ sửa `render.js`.

## Cơ chế gameplay

- **Hiển thị (TT-INT-01)**: mọi thứ vẽ lên canvas logic cao **270**, rộng **`VIEW_W`** — giãn theo tỉ lệ cửa sổ để màn chơi **phủ kín chiều ngang** (team 26/09), kẹp trong [`LOGICAL_W` 480, `MAX_VIEW_W` 640 (`DESIGN_BASELINE`)]; cửa sổ hẹp/dọc giữ 480×270 như cũ, siêu rộng thì có viền 2 bên. `VIEW_W` là `export let` trong `config.js`, `fitCanvas()` đặt qua `setViewWidth()` — code mới **không được giả định chiều rộng khung nhìn là 480**, luôn dùng `VIEW_W`; mọi toạ độ/kích thước/tốc độ là **pixel logic** (quy đổi từ hệ cũ 896×360 theo k = 0.6, khớp tỉ lệ bộ sprite 8-bit — xem [docs/INTEGRATION_PLAN_TT.md](docs/INTEGRATION_PLAN_TT.md); hằng số thời gian không nhân k). `fitCanvas()` phóng canvas **phủ kín vùng trống** (scale theo chiều cao còn trống, scale lẻ được phép; cỡ hiển thị làm tròn xuống để không sinh thanh cuộn): vẽ vào bộ đệm ở bội số nguyên N = ceil(scale × DPR) bằng nearest-neighbor + `setTransform(N)`, trình duyệt thu nhẹ về cỡ hiển thị (`pixelated` khi scale trùng số nguyên). Toạ độ vẽ làm tròn sau khi trừ camera. HUD, panel, nút cảm ứng là DOM nằm trong khung rộng đúng bằng canvas (`--stage-w/--stage-h`).
- **Tiến trình & chuyển màn (TT-NPC-01)**: lưu ở `sessionStorage` qua `progress.js` (backend **chưa** có cơ chế lưu tiến trình — cột `users.level` có nhưng không dùng). Hoàn thành màn 1 → ghi MỚI `{score, books: 5, level1Complete, level2Complete: false, rewards: []}` rồi hiện nút “Sang Màn 2”; trả lời đúng ở màn 2 → `addReward(id)` ngay; hoàn thành màn 2 → `{score, level2Complete: true}` → “Sang Màn 3”. Máu luôn đầy khi bắt đầu màn; thua/chơi lại màn 2 thì điểm quay về số mang sang từ màn 1. Vào thẳng màn 2/3 khi chưa đủ điều kiện → về màn 1 (`?debug=1` vào thẳng).
- **Map (TT-MAP-01)**: màn 1 dài 12 × 768px logic (màn 2: 4 chunk — xem “Màn 2” bên dưới) (world-space, định vị obstacle/book/enemy qua `worldX(chunk, localX)`, chunk đếm từ 1), `GROUND_Y` = **248** (hằng số, khớp `stage.ground_y` của `maps_tt.json`). Bộ môi trường 8-bit (Codex, `assets/maps/trung-trac/`, bản chạy thật chép ở `frontend/static/assets/images/maps-8bit/` giữ cấu trúc thư mục) — **`maps_tt.json` là nguồn cho đường dẫn/cỡ ảnh/`visible_bbox`/`pivot`/số ô** (đọc lúc chạy trong `assets.js`); cách vẽ (parallax, vùng, neo) nằm trong `config.js`. Mọi lớp vẽ **×1, không smoothing**, lặp ngang theo chiều rộng gốc, offset làm tròn trước khi lấy modulo. Thứ tự vẽ: trời (`BG_TT_SKY_DAY`, Z5 `BG_TT_SKY_STORM`, parallax 0.05) → đồi xa (`BG_TT_FAR_HILLS`, đáy y=230, 0.2; **tắt dần dưới trời giông** — `FAR_HILLS.hiddenUnderSky`) → lớp giữa (`BG_TT_MID_*` theo vùng, đáy ở `GROUND_Y`, 0.5) → mặt đất lát `TILESET_TT_GROUND` → decor → cổng đích → vật cản/nhân vật. **5 vùng** (`ZONES`): Z1 làng 0–2304, Z2 đồng lúa –3840, Z3 rừng –6144, Z4 bến sông –7680, Z5 ngoài thành Luy Lâu –9216. Trời + lớp giữa hoà trong `ZONE_BLEND_WIDTH` (192px) **trước** mỗi ranh giới theo tâm khung nhìn (lớp giữa hoà qua canvas phụ `'lighter'` để không thủng). Mặt đất: tile `surface` top = `GROUND_Y`, `fill` bên dưới (cắt ở 270), biến thể + decor (~1/4 cột) chọn **tất định theo chỉ số cột** (`tileHash`), vai trò tile đọc từ `tileset_tt_ground.json`; tile đổi **dứt khoát tại ranh giới vùng** (team đã thử dải dither rồi chốt lại cắt dứt khoát, 26/09). Hố: không vẽ tile trong hố, `left-edge`/`right-edge` kết thúc đúng mép hố. Parallax/vùng/mật độ là `DESIGN_BASELINE`. Chi tiết: [docs/MAP_PLAN_TT.md](docs/MAP_PLAN_TT.md), [docs/REPORT_TT-MAP-01.md](docs/REPORT_TT-MAP-01.md). `backdrops/chapter1/map-v2-manifest.json` (896×360, `GROUND_Y` 290) đã **lỗi thời**, không dùng; ảnh nền cũ `sky.png`/`foreground.png`/`ground.png`/`finish-gate.png` ngừng tham chiếu (vẫn giữ trên đĩa).
- **Cổng đích** (`FINISH_GATE` trong `config.js`): `PROP_LUYLAU_GATE` 192×176, tâm tại `FINISH_X` = 9066 (cùng số với `state.finishX`), pivot bottom-center, đáy ở `GROUND_Y`, **không có hitbox** (trigger về đích ở `physics.js`). Đổi sang `PROP_LUYLAU_GATE_OPEN` khi **mini-boss kiệu quan** đã hạ + nhặt đủ sách (`bossAlive()`, suy ra mỗi frame, trước khi chạm `finishX`). Chỉ màn 1 có cổng (`LEVEL.gate`); màn 2 không có cổng.
- **Bộ sprite 8-bit** (Codex, `assets/sprites/`, bản chạy thật chép ở `frontend/static/assets/images/sprites-8bit/` giữ cấu trúc `<category>/<ID>/<file>.png`): **`manifest_tt.json` là nguồn DUY NHẤT** cho `frames`/`fps`/`loop`/`hit_frame` (đọc lúc chạy qua `animation.js`, không chép số vào code). Mọi strip vẽ **×1**, **pivot bottom-center** (chân ở hàng `frame_h - 2`, 1px đệm dưới chân), ảnh gốc quay **PHẢI** — render lật khi cần quay trái (vật chạy quay theo hướng chạy, lính/boss quay về phía người chơi, bẫy/tháp giữ hướng gốc). `hit_frame` đếm từ 1. Mỗi entity có `anim = { name, time }` với **đồng hồ riêng** (tick trong `physics.js`), không khởi động lại khi đang phát đúng animation đó; animation không lặp dừng ở ô cuối. Hitbox định nghĩa theo pixel logic tương đối với pivot, **không lấy từ cỡ ảnh**. Thêm/thay sprite: kiểm tra hướng mặt và tỉ lệ thật bằng `?viewer=1`, đừng tin spec. Khi cập nhật asset ở `assets/sprites/` phải chép lại strip + manifest sang `sprites-8bit/`. Trong manifest chỉ được sửa `status` (asset đang dùng trong màn = `IN_GAME`).
- **Nhân vật** (`PLAYER_TRUNG_TRAC`, vẽ trên canvas bằng strip — GIF cũ trong `characters/trung-trac/` đã ngừng dùng): di chuyển trái/phải, nhảy, lướt/dash (**bất tử tạm thời** với lính, hazard và đạn — `playerImmune()` trong `physics.js`, đạn bay xuyên qua; xuyên qua obstacle `requiresDash` — `reedCurtain`, `slideBar`; vật cản tĩnh khác vẫn gây sát thương khi va ngang), đánh cận chiến. Trạng thái animation chọn trong `playerAnimationState()` (`physics.js`) theo ưu tiên `hurt > dash > attack > jump > run > idle`, ánh xạ sang manifest qua `PLAYER_ANIMATIONS`: `jump` chọn ô theo vận tốc dọc; `attack_01` trải đúng `ATTACK_COOLDOWN` (.36s) và **sát thương tính trong cửa sổ bắt đầu ở ô `hit_frame`** (.12s sau khi bấm, dài `ATTACK_ACTIVE_TIME` .18s), mỗi mục tiêu trúng 1 lần/cú (`attackHits`); `hurt` giữ ô cuối tới hết `hurtTimer`; thua thì phát `death` một lần (`player.deathTime`). Mọi animation (kể cả `attack_01` đã vẽ lại ở Batch R) vẽ ×1, không hệ số bù.
- **Chướng ngại vật tĩnh** (`obstacles`, tạo bằng `makeObstacle(type, chunk, localX, w, h)` — `localX` là MÉP TRÁI hitbox; ánh xạ type → asset 8-bit `OBS_*` + `anchor` + `groundSink` trong `OBSTACLE_TYPES`): vẽ **×1** theo cỡ PNG, căn sao cho **phần nhìn thấy trùng hitbox** (`obstacleDrawRect()` ở `render.js`: có `visible_bbox` → góc bbox trùng góc hitbox; không có → đáy-giữa canvas trùng đáy-giữa hitbox + `groundSink`), không quầng. Hitbox không lấy từ cỡ ảnh. Màn 1 dùng `fallenBranch` (55×23), `stoneBlock` (51×23), `reedCurtain` (hitbox overhead luôn cao 20px, khe dash 26px; `state.js` truyền 76×32 nhưng `makeObstacle` ép h = 20 với loại overhead). **P2** `fenceLow` 40×18, `fenceHigh` 16×48, `bambooSlope` 56×30, `slideBar` 40×20 overhead, `bridge` 96×8 (anchor `top` = mặt trên ở `GROUND_Y`, `requiresHole` — thiếu hố thì `state.js` cảnh báo và bỏ), `logDrift` 56×14 (hitbox `DESIGN_BASELINE`). `fenceLow`/`bambooSlope`/`slideBar`/`logDrift` **đã vào màn 2**; `fenceHigh`/`bridge` vẫn chỉ có trong layout thử `?layout=p2` (nền phẳng, 6 vật cản P2 + hố 96px có cầu, không hazard/enemy/sách). `spikesTrap` không có asset 8-bit (màn dùng `TR_SPIKE_PIT`) — thiếu ảnh thì vẽ hộp tạm. Mỗi loại có cờ:
  - `harmful: true` → chạm là mất máu.
  - `overhead: true` + `requiresDash` → bắt buộc dash mới né được (`reedCurtain`, `slideBar`).
  - Loại thường (không harmful, không overhead) → hoạt động như platform đứng lên được nếu nhảy/rơi trúng từ trên xuống, va ngang thì mất máu.
- **Chướng ngại vật CÓ TRẠNG THÁI** (`hazards`, tạo bằng `makeHazard()`; ánh xạ `sprite` → asset 8-bit + hitbox + trạng thái animation trong `HAZARD_SPRITES`). `localX` là **tâm** vật (= pivot). Trạng thái animation (`updateHazardAnimation()`): `death > hurt > throw/alarm > sprung > move/idle`:
  - `roller` — nằm chờ tới khi người chơi vượt `triggerX` (hoặc tới khi có báo động) rồi lao sang trái; ra khỏi tầm thì xoá khỏi state. Hổ (`EN_TIGER`), xe cống (`OB_TRIBUTE_CART`), kỵ binh (`EN_HAN_CAVALRY`). `facing` giữ hướng chạy cả khi đang chết. (Kiệu quan `roller` — `officialPalanquin` — **đã bỏ khỏi nhóm xáo**, khai báo vẫn giữ.)
  - `patrol` — **mini-boss kiệu quan** màn 1 (`palanquinBoss`, `EN_HAN_PALANQUIN`, `boss: true`, thông số `MINIBOSS` trong `config.js`): cố định chunk 11, 6 máu, đi qua lại đoạn 160px ở 30px/s (`walk`); người chơi trong 240px → đứng lại, quay về phía người chơi, ném dao `PJ_THROWING_KNIFE` ở `hit_frame` 3 của `throw` (cơ chế ném dùng chung với `thrower`), chu kỳ 2.5s tính từ lúc ném xong. Không có `idle` nên đứng chờ thì giữ ô 1 của `walk` (`idleHold`). Trúng đòn phát `hurt`, không bị đẩy lùi; hết máu phát `break` rồi xoá. Thanh máu đỏ.
  - `thrower` — đứng yên ở `idle`, vào tầm `fireRange` thì bắn theo chu kỳ `fireInterval` (tính từ lúc ném xong): phát `throw` trải trên `durations.throw` (.85s = nhịp cũ), **đạn sinh khi animation tới `hit_frame`** (ô 4 → .425s), ở độ cao `muzzle` so với chân. Lính thu thuế (`EN_HAN_TAXMAN`), lính gác tháp (`EN_HAN_WATCHTOWER`, có `alarm` thổi tù và `alarmTime` 1.1s gọi kỵ binh). Ô vẽ của hành động dùng đúng đồng hồ của `action` nên khớp lúc nhả đạn kể cả khi bị ngắt bởi `hurt`.
  - `boat` — thuyền tuần tra (`EN_HAN_BOAT`, `float`/`shoot`/`death`). **Hiện không dùng trong màn**, code và khai báo vẫn giữ.
  - `trap` — hố chông `TR_SPIKE_PIT` (hố NÔNG 48×16, chìm `sink` 3px vào cỏ): `hidden` vô hại tới khi người chơi tới sát `triggerDistance` thì phát `reveal` một lần (`sprung`) và bắt đầu gây sát thương.
  - `prop` — chỉ để vẽ, không va chạm (tháp canh `PROP_WATCHTOWER`).
  - Hazard có `hp > 0` thì chém được; hết máu: `alive = false` (tắt va chạm/di chuyển/đạn ngay), `dying = true`, phát `death`/`break` **một lần** rồi xoá. Loại `corpse: true` (xe cống) đứng ở ô cuối của `break` và **nằm lại map** vô hại.
- **Đạn** (`projectiles`): sinh ra từ hazard có `projectile`, bay ngang về phía người chơi, chạm thì mất máu, chém trúng thì tan, bay hết `PROJECTILE_MAX_RANGE` thì mờ dần rồi tan. Sprite + hitbox trong `PROJECTILE_SPRITES`: túi tiền `PJ_COIN_POUCH`, giáo `PJ_SPEAR`, tên lửa `PJ_FIRE_ARROW`, dao ném `PJ_THROWING_KNIFE` (mini-boss, hitbox 12×5); strip lặp theo tuổi viên đạn (`age`). Boss hiện không ném nên `PJ_OIL_JAR`/`FX_OIL_FIRE` chưa dùng.
- **Hố (`holes`)**: rơi xuống → mất 1 máu + respawn tại đầu chunk gần nhất. Màn thường **không có hố** (`holes: []`); chỉ layout thử `?layout=p2` có 1 hố (có cầu bắc qua — đi qua cầu không rơi, không mất máu theo luật va chạm chung).
- **Mật độ màn 1**: đúng **12 chướng ngại vật kể cả mini-boss**, khoảng 1 cái/chunk — 10 nhóm trong `OBSTACLE_GROUPS` ở `state.js` (11 chướng ngại; nhóm tháp canh tính lính gác + kỵ binh; có **2 nhóm lính canh**, đứng lệch nhau: localX 624 và 200) + mini-boss; **thứ tự được xáo ngẫu nhiên mỗi lượt chơi** (`randomizeObstacles()`: chunk 1 chỉ nhận nhóm dễ, tháp canh+lính gác+kỵ binh luôn đi chung, mini-boss cố định chunk 11, mỗi nhóm lệch thêm ±60px logic). Thêm/bớt vật cản thì giữ con số này trừ khi được yêu cầu khác.
- **Vật phẩm thu thập** (`books` — bình thư): strip `ITEM_BINH_THU` (4 ô 16×16, maps-8bit) vẽ ×1, tâm tại `(book.x, book.y + bob)`, lặp `BOOK_FPS` = 6 (`DESIGN_BASELINE`, manifest để `null`), bob làm tròn pixel, không quầng. Hitbox nhặt 22×26 (lớn hơn hình, cố ý — dễ nhặt) và 5 vị trí giữ nguyên; đủ số lượng mới được qua cổng/kết thúc màn. `items/book.png` ngừng tham chiếu.
- **Câu hỏi lịch sử màn 1** (`questionPanel`, chunk 8): dừng game giữa màn, trả lời đúng cộng điểm, sai trừ máu — 1 câu hard-code (năm 40), cùng mốc nghỉ chân (chunk 9) và dòng cốt truyện (chunk 10) **tạm giữ** (team D1–D2) tới khi có bộ câu hỏi chi tiết; lưu ý 2 chỗ này đi trước cốt truyện màn 2 về trình tự. Chỉ chạy ở màn 1 (`updateLevel1Events()`).
- **Màn 2 — Chiêu mộ hiền tài** (`level2Content()` trong `state.js`, `LEVELS[2]`): 4 chunk (3072px), trời ngày suốt màn, vùng `LEVEL2_ZONES` (chunk 1 Z1 làng, chunk 2 Z2 đồng lúa, chunk 3–4 Z4 bến sông), về đích tại `LEVEL2_FINISH_X` = 2976 (không có cổng). **Không** hazard/enemy/đạn/sách/hố; 6 vật cản tĩnh **cố định** (`fenceLow`, `bambooSlope`, `fallenBranch`, `slideBar` — bắt buộc dash, `logDrift`, `stoneBlock`), không trong vòng 96px quanh NPC (`checkNpcClearance()` cảnh báo nếu sai). HUD ẩn ô Sách.
- **NPC & hội thoại (màn 2)**: `npcs` (`makeNpc()`), sprite theo `NPC_SPRITES` (`NPC_THI_SACH`/`NPC_LE_CHAN`/`NPC_TRUNG_NHI`, `idle`, `talk` khi đang nói thoại — lặp theo đồng hồ chung vì game dừng lúc hội thoại), quay về phía người chơi, không va chạm. Chỉ NPC chưa gặp đầu tiên có tác dụng (`updateMeetings()` ở `physics.js`): giữ người chơi lại trước NPC (`NPC_RULES.holdGap`), tới cách ≤ 32px thì tạm dừng game và mở `#dialoguePanel` (chân dung `PORTRAIT_*` `pixelated`). Câu hỏi 3 đáp án xáo mỗi lần hiện; sai: −1 máu, hiện gợi ý, làm mờ đáp án đó, chọn lại (hết máu thì thua, chơi lại màn 2); đúng: “Vì sao đúng” → phần thưởng, +500 nếu đúng ngay lần đầu, +250 nếu đã sai (`QUESTION_SCORE`). Gặp xong NPC mờ dần 0.8s rồi biến mất. **Cốt truyện Thi Sách hy sinh**: 1 lần khi vào chunk 2 sau khi đã gặp Thi Sách, chân dung `grayscale(1)`. Phím 1–3 chọn đáp án, Enter/Space sang bước; điện thoại dọc thì hộp thoại thành bảng nổi ở đáy màn hình.
- **Enemy/Boss** (`enemies`, tạo bằng `makeEnemy()` trong `state.js`): va chạm gây sát thương, đánh bại được bằng attack. **Lính canh** `EN_HAN_GUARD` (hitbox 22×40, 2 máu, thông số `GUARD`): đi tuần đoạn 96px ở 24px/s (`walk`), người chơi trong 110px thì quay lại và tiến tới (không ra khỏi đoạn tuần tra), tới tầm kích thì đâm `attack_01` — sát thương chỉ trong ô `hit_frame` 3, vùng đâm đo theo strip đã vẽ lại (26/09), nghỉ 1.2s giữa 2 cú; bị chém trước ô hit thì cú đâm bị huỷ; dash né được. Animation `death > hurt > attack > walk > idle` (`updateGuard()` ở `physics.js`). **Boss Tô Định** `BOSS_TO_DINH_CHARIOT` (`idle`, trúng đòn nháy mờ vì không có `hurt`, hết máu phát `shield_break`; hitbox 90×80, đứng yên) — **tạm không đặt vào màn nào**, code/asset/khai báo giữ nguyên chờ màn 3 (chưa có cơ chế 3 giai đoạn; `charge`/`throw`/`stun`/`idle_cracked` chưa dùng). Hết máu: `alive = false` ngay, phát `death` một lần rồi xoá.
- **HUD**: máu vẽ bằng icon `items/heart.png` (1 icon/1 máu, xem `updateHud()`), điểm, số sách (ẩn khi màn không có sách), tiến độ (progress bar theo % quãng đường).
- Điều khiển: bàn phím (WASD/Arrow, Space, Shift, J) và nút cảm ứng mobile (`data-control`) dùng chung 1 state input.
- **Chưa dùng tới**: `items/armor.png`, `items/question_scroll.png`, `items/book_gold.png`, `items/book-open.png` — chưa có mechanic tương ứng (giáp, đánh dấu điểm hỏi đáp...), để dành cho roadmap Phần 2/3. Ảnh vật cản tĩnh cũ trong `obstacles/` (kể cả `spikes.png`) và ảnh hazard/đạn cũ (`obstacles/*_strip*.png`, `spike_pit_*.png`, `tribute_cart_broken.png`, `watchtower.png`, `items/*_strip2.png`) và GIF nhân vật đã **ngừng tham chiếu** nhưng vẫn giữ trên đĩa. Trong bộ 8-bit: `PORTRAIT_TRUNG_TRAC`, `PORTRAIT_TO_DINH`, `NPC_TRUNG_NHI.run`/`attack_01` (dành cho “Bóng Trưng Nhị”), `EN_HAN_BASE`, `EN_HAN_RUSHER`, `BOSS_TO_DINH_CHARIOT` (tạm không có trong màn), `BOSS_TO_DINH_FOOT`, `PJ_ARROW_RAIN`, `PJ_OIL_JAR`, `FX_OIL_FIRE`, `PLAYER_TRUNG_TRAC.victory` chưa dùng. Trong bộ môi trường: `fenceHigh`, `bridge` (chỉ layout thử) và `PROP_STONE_PILLAR` (cột đá 2 trạng thái — chỉ xem trong viewer, thuộc task boss) chưa đặt vào màn.

## Quy ước mở rộng (khi thêm nội dung game)

- **Thêm màn trong chương Trưng Trắc**: dùng chung bộ module `trung-trac/` và template `trung-trac.html` — thêm mục vào `LEVELS` (`config.js`), hàm nội dung `levelNContent()` trong `state.js` (rẽ nhánh theo `LEVEL.id`), sự kiện riêng của màn trong `physics.js`, route truyền `level_id`/`title`, URL vào `LEVEL_URLS` và điều kiện vào `requireLevel()` (`progress.js`).
- **Thêm level/phần mới** (chương khác): tạo 1 template (`frontend/templates/gameplay/levels/`), 1 CSS (`frontend/static/css/levels/`), 1 JS (`frontend/static/js/levels/`), rồi thêm route trong `backend/routes/pages.py`. Level nhỏ/đơn giản có thể theo mẫu `level-test.js` (1 file); level đang phát triển tiếp (nhiều obstacle/cơ chế) nên theo mẫu module hoá của `trung-trac/` (xem "Cấu trúc module" ở trên) — dùng `<script type="module">` trỏ tới `main.js` của thư mục đó.
- **Thêm chương mới**: đặt tên file/level theo nhân vật-giai đoạn lịch sử tương ứng (nhất quán với `trung-trac`), giữ cấu trúc 3-phần nếu áp dụng thiết kế roadmap.
- **Thêm API**: thêm endpoint trong `backend/routes/api.py`; nghiệp vụ dữ liệu đặt trong `backend/repositories/`, không viết SQL trong route hay template.
- **Thêm asset**: đặt trong `frontend/static/assets/images/`; dùng `url_for('static', ...)` trong template, dùng URL bắt đầu `/static/assets/...` trong JS.
- **Không** tạo thêm `app.py` phụ để thử nghiệm — nếu cần prototype, đặt trong `tests/` hoặc `docs/archive/`.
- Dữ liệu màn chơi (tọa độ obstacle, câu hỏi, enemy...) hiện **hard-code trực tiếp trong JS** của từng level (xem known issues bên dưới) — khi sửa nội dung màn, sửa đúng file JS đó, không tạo cơ chế cấu hình mới trừ khi được yêu cầu.
- **Thêm/đổi sprite 8-bit cho thực thể**: chép strip + manifest từ `assets/sprites/` sang `frontend/static/assets/images/sprites-8bit/`, thêm ID vào `SPRITE_8BIT_IN_GAME`, khai báo ánh xạ trạng thái → animation + hitbox trong `HAZARD_SPRITES`/`ENEMY_SPRITES`/`PROJECTILE_SPRITES`/`PLAYER_ANIMATIONS` (`config.js`). Không đổi ID/tên animation/số frame/`hit_frame`; không thêm hệ số bù tỉ lệ trừ khi là bù tạm có ghi `NEED_REDRAW` (hiện không có).
- **Thêm/đổi asset môi trường 8-bit** (nền, tile, vật cản tĩnh, item, prop): chép PNG + `maps_tt.json` (và `tileset_tt_ground.json`) từ `assets/maps/trung-trac/` sang `frontend/static/assets/images/maps-8bit/` giữ cấu trúc; khai báo cách dùng trong `config.js` (`ZONES`, `FAR_HILLS`, `OBSTACLE_TYPES`, `FINISH_GATE`, `BOOK_SPRITE_ID`; asset không phải nền/tile cần có trong `MAP_PROPS_IN_GAME`). Vẽ ×1, lệch vị trí thì sửa neo/offset, không co giãn. Trong `maps_tt.json` chỉ được sửa `status` (sửa bản nguồn rồi chép lại bản chạy).
- `tools/normalize_player_gifs.py` chỉ còn phục vụ bộ GIF nhân vật cũ (đã ngừng dùng trong màn).

## Known issues / lưu ý kỹ thuật

- **Mật khẩu lưu plaintext** trong bảng `users` (`backend/db.py`, `user_repository.py`) — không phải bug cần tự ý sửa, nhưng cẩn thận khi động vào auth; nếu người dùng yêu cầu tăng cường bảo mật, cần hash (bcrypt/werkzeug) + migration.
- **Dữ liệu level hard-code trong JS** (obstacle, câu hỏi, enemy) thay vì tách JSON/DB riêng — việc tách dữ liệu ra khỏi code là hướng cải tiến đã được ghi nhận, không phải trạng thái hiện tại.
- **Tiến trình giữa các màn lưu ở `sessionStorage`** (mất khi đóng tab, không gắn tài khoản) — tạm thời vì backend chưa có API tiến trình; chuyển sang backend thì chỉ sửa `progress.js` (+ endpoint trong `api.py`, repository riêng).
- Route gameplay giữ cả URL cũ (`/gameplay/level/Trung_Trac/trung-trac.html`) lẫn URL mới (`/gameplay/levels/trung-trac`) để không phá liên kết hiện có — khi thêm level mới, cân nhắc có cần giữ alias tương tự hay không.
- Test (`tests/test_app.py`) cần biến môi trường `SUTA_TEST_DATABASE_URL` (PostgreSQL thật), tự skip nếu thiếu — không phải lỗi nếu thấy test bị skip khi chưa cấu hình.

## Tài liệu asset

- [docs/asset-brief-trung-trac.md](docs/asset-brief-trung-trac.md) — checklist asset đang có / đang thiếu.
- [docs/sprite-spec-trung-trac.md](docs/sprite-spec-trung-trac.md) — đặc tả CŨ (trước bộ 8-bit) cho agent vẽ sprite: GIF nhân vật, PNG strip quay trái, bảng cỡ theo hệ 896×360. Đã bị bộ 8-bit thay thế; chỉ còn giá trị tham khảo cho vật cản tĩnh/nền.
- [SUTA_TT_SPRITE_BRIEF.md](SUTA_TT_SPRITE_BRIEF.md) (ở **gốc repo**) — brief cho **bộ sprite 8-bit** của chương Trưng Trắc: ID asset, tên animation, số frame, canvas, `hit_frame` (đếm từ 1), pivot bottom-center, quay mặt **phải**, mỗi animation là PNG strip ngang. Manifest: `assets/sprites/manifest_tt.json` (bản chạy thật: `frontend/static/assets/images/sprites-8bit/manifest_tt.json`). **Đã tích hợp vào màn Trưng Trắc** (task TT-INT-01) — xem [docs/INTEGRATION_PLAN_TT.md](docs/INTEGRATION_PLAN_TT.md) và [docs/REPORT_TT-INT-01.md](docs/REPORT_TT-INT-01.md).
- `artifacts/sprite-forge-trung-trac/` — sản phẩm trung gian của đợt vẽ sprite CŨ (trước bộ 8-bit). Không phải asset chạy trong game.
- `assets/sprites/<category>/<ID>/{raw,frames,meta,preview}/` — sản phẩm trung gian của bộ 8-bit (vùng làm việc của Codex); chỉ các strip khai báo trong manifest được chép sang `sprites-8bit/`.
- [SUTA_TT_MAP_BRIEF.md](SUTA_TT_MAP_BRIEF.md) (ở **gốc repo**) — brief bộ **môi trường 8-bit** (nền parallax, tileset, vật cản tĩnh, bình thư, cổng Luy Lâu, cột đá). Manifest: `assets/maps/trung-trac/maps_tt.json` (bản chạy thật: `frontend/static/assets/images/maps-8bit/maps_tt.json`); kiểm kê/QC: `assets/maps/MAP_INVENTORY_TT.md`, `assets/maps/trung-trac/MAP_REPORT_TT.md`. **Đã tích hợp** (task TT-MAP-01) — xem [docs/SUTA_TT_TASK_MAP_01.md](docs/SUTA_TT_TASK_MAP_01.md), [docs/MAP_PLAN_TT.md](docs/MAP_PLAN_TT.md), [docs/REPORT_TT-MAP-01.md](docs/REPORT_TT-MAP-01.md). `assets/maps/trung-trac/{raw,mockups,references}/` là sản phẩm trung gian, không chép vào game.
- `frontend/static/assets/images/backdrops/chapter1/map-v2-manifest.json` — **lỗi thời** (896×360, `GROUND_Y` 290), không dùng.

## Chi tiết kiến trúc bổ sung

Xem [docs/architecture.md](docs/architecture.md) để biết thêm chi tiết luồng và các việc dự kiến làm tiếp theo do nhóm tự ghi nhận trước đó.
