# CLAUDE.md

Hướng dẫn cho Claude Code khi làm việc trong repo này.

## Giới thiệu game

**Sử Ta** là game 2D 8-bit giáo dục lịch sử Việt Nam, chạy trên web (HTML/CSS/JS render qua Canvas + Flask/Python backend). Người chơi vào vai các nhân vật lịch sử, vượt qua chướng ngại vật (đá tảng, chông tre, lính gác...), thu thập vật phẩm, gặp NPC/"người tài" để trả lời câu hỏi lịch sử đổi lấy phần thưởng (thêm máu, thêm giáp, tăng dame...), và đánh bại boss cuối màn.

**Cấu trúc dự định**: game chia theo **chương** (mỗi chương ứng với một giai đoạn/nhân vật lịch sử, ví dụ "Trưng Trắc – Trưng Nhị"), mỗi chương thường gồm **3 phần** (level) nối tiếp nhau, phần cuối kết thúc bằng trận đánh boss.

**Trạng thái hiện tại** (đã code, không phải toàn bộ thiết kế trên): mới có **1 phần chơi được** — "Màn thử Trưng Trắc" ([frontend/static/js/levels/trung-trac/](frontend/static/js/levels/trung-trac/)) — coi như phần mở đầu prototype của chương Trưng Trắc. Cơ chế 3-phần/chương, hệ thống giáp, và tăng dame vĩnh viễn **chưa được cài đặt**; đây là roadmap thiết kế, không phải code đang chạy. Khi được yêu cầu làm việc liên quan, luôn kiểm tra lại code thực tế thay vì giả định roadmap đã hoàn thành.

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

- `config.js` — hằng số thuần (độ phân giải logic, kích thước, vật lý, asset path, bảng ánh xạ sprite 8-bit `HAZARD_SPRITES`/`ENEMY_SPRITES`/`PROJECTILE_SPRITES`/`PLAYER_ANIMATIONS`, bộ môi trường `ZONES`/`FAR_HILLS`/`OBSTACLE_TYPES`/`FINISH_GATE`). Mọi module khác import từ đây, không định nghĩa lại.
- `animation.js` — registry manifest sprite 8-bit (`registerManifest`, `getAnimMeta`) + hàm animation theo entity (`setAnim` không khởi động lại nếu trùng tên, `tickAnim`, `frameIndex`, `hitTime`, `animLength`). Dùng chung bởi physics (thời điểm gây sát thương/nhả đạn theo `hit_frame`) và render (ô cần vẽ).
- `geometry.js` — hàm thuần: `worldX`, `aabb`, `groundYAt`, `makeObstacle`, `makeHazard`, `makeProjectile`.
- `assets.js` — cache `images` + các hàm `load*`/`loadAssets()` (`maps_tt.json` → `images.maps` gồm lớp nền, tileset, vật cản/bình thư/cổng; `manifest_tt.json` → mọi strip 8-bit trong `SPRITE_8BIT_IN_GAME`; icon HUD). Không đụng DOM ngoài `Image()`/`fetch`.
- `state.js` — `state` (export dạng `let` + `setState()` vì bị gán lại toàn bộ mỗi lần chơi lại — ES module named import là live-binding nên các module khác luôn thấy giá trị mới) + `createLevelState()` (nội dung level: player/obstacles/holes/books/enemies).
- `input.js` — `keys`/`pressed` + `setKey`/`clearInput`/`bindInput()`; cờ `debug` (phím **F2**: hitbox, pivot, tên animation + ô).
- `ui.js` — DOM refs (`ui`), `updateHud()`, `showMessage()`, `tickMessage()`.
- `physics.js` — `update(dt)` (vòng lặp mô phỏng chính) + `hurtPlayer`/`respawnAfterFall`/`startAttack`/`startDash`/`endGame`.
- `render.js` — `draw()` + toàn bộ hàm vẽ canvas, giữ `canvas`/`ctx`; `fitCanvas()` phóng canvas logic ra màn hình.
- `main.js` — entry point (script `type="module"` trong template): `resetGame()`, vòng lặp `frame()`, wiring nút bấm, gọi `loadAssets()`/`fitCanvas()`; `?viewer=1` nạp `viewer.js` thay vì chạy màn; `?layout=p2` chạy layout thử vật cản P2 (chỉ để test).
- `viewer.js` — chế độ xem sprite (`/gameplay/levels/trung-trac?viewer=1`): chọn asset → animation trong manifest (sprite 8-bit + vật cản/item/prop trong `maps_tt.json`, nhãn `map/…`), xem ×1/×3/×4, lưới, baseline, pivot, đánh dấu `hit_frame`. Công cụ soát asset, không phải gameplay.

Thêm nội dung mới (obstacle/hazard/item/level data) thường chỉ cần sửa `state.js` (dữ liệu) và `config.js` (asset path, ánh xạ sprite, hitbox); thêm cơ chế gameplay mới sửa `physics.js`; thêm hiệu ứng vẽ sửa `render.js`.

## Cơ chế gameplay

- **Hiển thị (TT-INT-01)**: mọi thứ vẽ lên canvas **logic 480×270** (`LOGICAL_W/H` trong `config.js`); mọi toạ độ/kích thước/tốc độ là **pixel logic** (quy đổi từ hệ cũ 896×360 theo k = 0.6, khớp tỉ lệ bộ sprite 8-bit — xem [docs/INTEGRATION_PLAN_TT.md](docs/INTEGRATION_PLAN_TT.md); hằng số thời gian không nhân k). `fitCanvas()` phóng canvas **phủ kín vùng trống** (giữ 16:9, scale lẻ được phép): vẽ vào bộ đệm ở bội số nguyên N = ceil(scale × DPR) bằng nearest-neighbor + `setTransform(N)`, trình duyệt thu nhẹ về cỡ hiển thị (`pixelated` khi scale trùng số nguyên). Toạ độ vẽ làm tròn sau khi trừ camera. HUD, panel, nút cảm ứng là DOM nằm trong khung rộng đúng bằng canvas (`--stage-w/--stage-h`).
- **Map (TT-MAP-01)**: level dài 12 × 768px logic (world-space, định vị obstacle/book/enemy qua `worldX(chunk, localX)`, chunk đếm từ 1), `GROUND_Y` = **248** (hằng số, khớp `stage.ground_y` của `maps_tt.json`). Bộ môi trường 8-bit (Codex, `assets/maps/trung-trac/`, bản chạy thật chép ở `frontend/static/assets/images/maps-8bit/` giữ cấu trúc thư mục) — **`maps_tt.json` là nguồn cho đường dẫn/cỡ ảnh/`visible_bbox`/`pivot`/số ô** (đọc lúc chạy trong `assets.js`); cách vẽ (parallax, vùng, neo) nằm trong `config.js`. Mọi lớp vẽ **×1, không smoothing**, lặp ngang theo chiều rộng gốc, offset làm tròn trước khi lấy modulo. Thứ tự vẽ: trời (`BG_TT_SKY_DAY`, Z5 `BG_TT_SKY_STORM`, parallax 0.05) → đồi xa (`BG_TT_FAR_HILLS`, đáy y=230, 0.2; **tắt dần dưới trời giông** — `FAR_HILLS.hiddenUnderSky`) → lớp giữa (`BG_TT_MID_*` theo vùng, đáy ở `GROUND_Y`, 0.5) → mặt đất lát `TILESET_TT_GROUND` → decor → cổng đích → vật cản/nhân vật. **5 vùng** (`ZONES`): Z1 làng 0–2304, Z2 đồng lúa –3840, Z3 rừng –6144, Z4 bến sông –7680, Z5 ngoài thành Luy Lâu –9216. Trời + lớp giữa hoà trong `ZONE_BLEND_WIDTH` (192px) **trước** mỗi ranh giới theo tâm khung nhìn (lớp giữa hoà qua canvas phụ `'lighter'` để không thủng). Mặt đất: tile `surface` top = `GROUND_Y`, `fill` bên dưới (cắt ở 270), biến thể + decor (~1/4 cột) chọn **tất định theo chỉ số cột** (`tileHash`), vai trò tile đọc từ `tileset_tt_ground.json`; quanh mỗi ranh giới là **dải chuyển tiếp dither** rộng `GROUND_BLEND_WIDTH` (192px, nhiễu 3 tầng, dựng 1 lần rồi cache — thay cho cắt dứt khoát theo yêu cầu team). Hố: không vẽ tile trong hố, `left-edge`/`right-edge` kết thúc đúng mép hố. Parallax/vùng/mật độ là `DESIGN_BASELINE`. Chi tiết: [docs/MAP_PLAN_TT.md](docs/MAP_PLAN_TT.md), [docs/REPORT_TT-MAP-01.md](docs/REPORT_TT-MAP-01.md). `backdrops/chapter1/map-v2-manifest.json` (896×360, `GROUND_Y` 290) đã **lỗi thời**, không dùng; ảnh nền cũ `sky.png`/`foreground.png`/`ground.png`/`finish-gate.png` ngừng tham chiếu (vẫn giữ trên đĩa).
- **Cổng đích** (`FINISH_GATE` trong `config.js`): `PROP_LUYLAU_GATE` 192×176, tâm tại `FINISH_X` = 9066 (cùng số với `state.finishX`), pivot bottom-center, đáy ở `GROUND_Y`, **không có hitbox** (trigger về đích ở `physics.js`). Đổi sang `PROP_LUYLAU_GATE_OPEN` khi boss đã hạ + nhặt đủ sách (suy ra mỗi frame, trước khi chạm `finishX`).
- **Bộ sprite 8-bit** (Codex, `assets/sprites/`, bản chạy thật chép ở `frontend/static/assets/images/sprites-8bit/` giữ cấu trúc `<category>/<ID>/<file>.png`): **`manifest_tt.json` là nguồn DUY NHẤT** cho `frames`/`fps`/`loop`/`hit_frame` (đọc lúc chạy qua `animation.js`, không chép số vào code). Mọi strip vẽ **×1**, **pivot bottom-center** (chân ở hàng `frame_h - 2`, 1px đệm dưới chân), ảnh gốc quay **PHẢI** — render lật khi cần quay trái (vật chạy quay theo hướng chạy, lính/boss quay về phía người chơi, bẫy/tháp giữ hướng gốc). `hit_frame` đếm từ 1. Mỗi entity có `anim = { name, time }` với **đồng hồ riêng** (tick trong `physics.js`), không khởi động lại khi đang phát đúng animation đó; animation không lặp dừng ở ô cuối. Hitbox định nghĩa theo pixel logic tương đối với pivot, **không lấy từ cỡ ảnh**. Thêm/thay sprite: kiểm tra hướng mặt và tỉ lệ thật bằng `?viewer=1`, đừng tin spec. Khi cập nhật asset ở `assets/sprites/` phải chép lại strip + manifest sang `sprites-8bit/`. Trong manifest chỉ được sửa `status` (asset đang dùng trong màn = `IN_GAME`).
- **Nhân vật** (`PLAYER_TRUNG_TRAC`, vẽ trên canvas bằng strip — GIF cũ trong `characters/trung-trac/` đã ngừng dùng): di chuyển trái/phải, nhảy, lướt/dash (**bất tử tạm thời** với lính, hazard và đạn — `playerImmune()` trong `physics.js`, đạn bay xuyên qua; xuyên qua obstacle `requiresDash` — `reedCurtain`, `slideBar`; vật cản tĩnh khác vẫn gây sát thương khi va ngang), đánh cận chiến. Trạng thái animation chọn trong `playerAnimationState()` (`physics.js`) theo ưu tiên `hurt > dash > attack > jump > run > idle`, ánh xạ sang manifest qua `PLAYER_ANIMATIONS`: `jump` chọn ô theo vận tốc dọc; `attack_01` trải đúng `ATTACK_COOLDOWN` (.36s) và **sát thương tính trong cửa sổ bắt đầu ở ô `hit_frame`** (.12s sau khi bấm, dài `ATTACK_ACTIVE_TIME` .18s), mỗi mục tiêu trúng 1 lần/cú (`attackHits`); `hurt` giữ ô cuối tới hết `hurtTimer`; thua thì phát `death` một lần (`player.deathTime`). Mọi animation (kể cả `attack_01` đã vẽ lại ở Batch R) vẽ ×1, không hệ số bù.
- **Chướng ngại vật tĩnh** (`obstacles`, tạo bằng `makeObstacle(type, chunk, localX, w, h)` — `localX` là MÉP TRÁI hitbox; ánh xạ type → asset 8-bit `OBS_*` + `anchor` + `groundSink` trong `OBSTACLE_TYPES`): vẽ **×1** theo cỡ PNG, căn sao cho **phần nhìn thấy trùng hitbox** (`obstacleDrawRect()` ở `render.js`: có `visible_bbox` → góc bbox trùng góc hitbox; không có → đáy-giữa canvas trùng đáy-giữa hitbox + `groundSink`), không quầng. Hitbox không lấy từ cỡ ảnh. Màn thường dùng `fallenBranch` (55×23), `stoneBlock` (51×23), `reedCurtain` (76×20 overhead, khe dash 26px). **P2** `fenceLow` 40×18, `fenceHigh` 16×48, `bambooSlope` 56×30, `slideBar` 40×20 overhead, `bridge` 96×8 (anchor `top` = mặt trên ở `GROUND_Y`, `requiresHole` — thiếu hố thì `state.js` cảnh báo và bỏ), `logDrift` 56×14 (hitbox `DESIGN_BASELINE`) **chỉ có trong layout thử `?layout=p2`** (nền phẳng, 6 vật cản P2 + hố 96px có cầu, không hazard/enemy/sách). `spikesTrap` không có asset 8-bit (màn dùng `TR_SPIKE_PIT`) — thiếu ảnh thì vẽ hộp tạm. Mỗi loại có cờ:
  - `harmful: true` → chạm là mất máu.
  - `overhead: true` + `requiresDash` → bắt buộc dash mới né được (`reedCurtain`, `slideBar`).
  - Loại thường (không harmful, không overhead) → hoạt động như platform đứng lên được nếu nhảy/rơi trúng từ trên xuống, va ngang thì mất máu.
- **Chướng ngại vật CÓ TRẠNG THÁI** (`hazards`, tạo bằng `makeHazard()`; ánh xạ `sprite` → asset 8-bit + hitbox + trạng thái animation trong `HAZARD_SPRITES`). `localX` là **tâm** vật (= pivot). Trạng thái animation (`updateHazardAnimation()`): `death > hurt > throw/alarm > sprung > move/idle`:
  - `roller` — nằm chờ tới khi người chơi vượt `triggerX` (hoặc tới khi có báo động) rồi lao sang trái; ra khỏi tầm thì xoá khỏi state. Kiệu quan (`EN_HAN_PALANQUIN`), hổ (`EN_TIGER`), xe cống (`OB_TRIBUTE_CART`), kỵ binh (`EN_HAN_CAVALRY`). `facing` giữ hướng chạy cả khi đang chết.
  - `thrower` — đứng yên ở `idle`, vào tầm `fireRange` thì bắn theo chu kỳ `fireInterval` (tính từ lúc ném xong): phát `throw` trải trên `durations.throw` (.85s = nhịp cũ), **đạn sinh khi animation tới `hit_frame`** (ô 4 → .425s), ở độ cao `muzzle` so với chân. Lính thu thuế (`EN_HAN_TAXMAN`), lính gác tháp (`EN_HAN_WATCHTOWER`, có `alarm` thổi tù và `alarmTime` 1.1s gọi kỵ binh). Ô vẽ của hành động dùng đúng đồng hồ của `action` nên khớp lúc nhả đạn kể cả khi bị ngắt bởi `hurt`.
  - `boat` — thuyền tuần tra (`EN_HAN_BOAT`, `float`/`shoot`/`death`). **Hiện không dùng trong màn**, code và khai báo vẫn giữ.
  - `trap` — hố chông `TR_SPIKE_PIT` (hố NÔNG 48×16, chìm `sink` 3px vào cỏ): `hidden` vô hại tới khi người chơi tới sát `triggerDistance` thì phát `reveal` một lần (`sprung`) và bắt đầu gây sát thương.
  - `prop` — chỉ để vẽ, không va chạm (tháp canh `PROP_WATCHTOWER`).
  - Hazard có `hp > 0` thì chém được; hết máu: `alive = false` (tắt va chạm/di chuyển/đạn ngay), `dying = true`, phát `death`/`break` **một lần** rồi xoá. Loại `corpse: true` (xe cống) đứng ở ô cuối của `break` và **nằm lại map** vô hại.
- **Đạn** (`projectiles`): sinh ra từ hazard có `projectile`, bay ngang về phía người chơi, chạm thì mất máu, chém trúng thì tan, bay hết `PROJECTILE_MAX_RANGE` thì mờ dần rồi tan. Sprite + hitbox trong `PROJECTILE_SPRITES`: túi tiền `PJ_COIN_POUCH`, giáo `PJ_SPEAR`, tên lửa `PJ_FIRE_ARROW`; strip lặp theo tuổi viên đạn (`age`). Boss hiện không ném nên `PJ_OIL_JAR`/`FX_OIL_FIRE` chưa dùng.
- **Hố (`holes`)**: rơi xuống → mất 1 máu + respawn tại đầu chunk gần nhất. Màn thường **không có hố** (`holes: []`); chỉ layout thử `?layout=p2` có 1 hố (có cầu bắc qua — đi qua cầu không rơi, không mất máu theo luật va chạm chung).
- **Mật độ màn**: đúng **12 chướng ngại vật kể cả boss**, khoảng 1 cái/chunk — danh sách nằm trong `OBSTACLE_GROUPS` ở `state.js`; **thứ tự được xáo ngẫu nhiên mỗi lượt chơi** (`randomizeObstacles()`: chunk 1 chỉ nhận nhóm dễ, tháp canh+lính gác+kỵ binh luôn đi chung, boss cố định chunk 11, mỗi nhóm lệch thêm ±60px logic). Thêm/bớt vật cản thì giữ con số này trừ khi được yêu cầu khác.
- **Vật phẩm thu thập** (`books` — bình thư): strip `ITEM_BINH_THU` (4 ô 16×16, maps-8bit) vẽ ×1, tâm tại `(book.x, book.y + bob)`, lặp `BOOK_FPS` = 6 (`DESIGN_BASELINE`, manifest để `null`), bob làm tròn pixel, không quầng. Hitbox nhặt 22×26 (lớn hơn hình, cố ý — dễ nhặt) và 5 vị trí giữ nguyên; đủ số lượng mới được qua cổng/kết thúc màn. `items/book.png` ngừng tham chiếu.
- **Câu hỏi lịch sử** (`questionPanel`): dừng game giữa màn, trả lời đúng cộng điểm, sai trừ máu — đây là cơ chế "gặp người tài" theo mô tả game, hiện chỉ có 1 câu hỏi hard-code.
- **Enemy/Boss** (`enemies`, tạo bằng `makeEnemy()` trong `state.js`): đứng yên, va chạm gây sát thương; enemy thường có thể đánh bại bằng attack; boss ở cuối màn — phải hạ boss + đủ điều kiện thu thập mới hoàn thành màn. Ảnh theo cờ `boss` qua `ENEMY_SPRITES`: lính thường `EN_HAN_GUARD` (`idle`/`hurt`/`death`, hitbox 22×40), boss `BOSS_TO_DINH_CHARIOT` (`idle`, trúng đòn nháy mờ vì không có `hurt`, hết máu phát `shield_break`; hitbox 90×80). Hết máu: `alive = false` ngay (boss tính là đã hạ), phát `death` một lần rồi xoá. Boss **chưa có** cơ chế 3 giai đoạn (`charge`/`throw`/`stun`/`idle_cracked` chưa dùng).
- **HUD**: máu vẽ bằng icon `items/heart.png` (1 icon/1 máu, xem `updateHud()`), điểm, tiến độ (progress bar theo % quãng đường).
- Điều khiển: bàn phím (WASD/Arrow, Space, Shift, J) và nút cảm ứng mobile (`data-control`) dùng chung 1 state input.
- **Chưa dùng tới**: `items/armor.png`, `items/question_scroll.png`, `items/book_gold.png`, `items/book-open.png` — chưa có mechanic tương ứng (giáp, đánh dấu điểm hỏi đáp...), để dành cho roadmap Phần 2/3. Ảnh vật cản tĩnh cũ trong `obstacles/` (kể cả `spikes.png`) và ảnh hazard/đạn cũ (`obstacles/*_strip*.png`, `spike_pit_*.png`, `tribute_cart_broken.png`, `watchtower.png`, `items/*_strip2.png`) và GIF nhân vật đã **ngừng tham chiếu** nhưng vẫn giữ trên đĩa. Trong bộ 8-bit: NPC, portrait, `EN_HAN_BASE`, `EN_HAN_RUSHER`, `BOSS_TO_DINH_FOOT`, `PJ_ARROW_RAIN`, `PJ_THROWING_KNIFE`, `PJ_OIL_JAR`, `FX_OIL_FIRE`, `PLAYER_TRUNG_TRAC.victory` chưa dùng. Trong bộ môi trường: 6 vật cản P2 (chỉ layout thử) và `PROP_STONE_PILLAR` (cột đá 2 trạng thái — chỉ xem trong viewer, thuộc task boss) chưa đặt vào màn.

## Quy ước mở rộng (khi thêm nội dung game)

- **Thêm level/phần mới**: tạo 1 template (`frontend/templates/gameplay/levels/`), 1 CSS (`frontend/static/css/levels/`), 1 JS (`frontend/static/js/levels/`), rồi thêm route trong `backend/routes/pages.py`. Level nhỏ/đơn giản có thể theo mẫu `level-test.js` (1 file); level đang phát triển tiếp (nhiều obstacle/cơ chế) nên theo mẫu module hoá của `trung-trac/` (xem "Cấu trúc module" ở trên) — dùng `<script type="module">` trỏ tới `main.js` của thư mục đó.
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
