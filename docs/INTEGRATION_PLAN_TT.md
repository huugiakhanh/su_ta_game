# TT-INT-01 — INTEGRATION PLAN (Bước 0: khảo sát, đo đạc, lập kế hoạch)

## Context
Task card `docs/SUTA_TT_TASK_INTEGRATE_P0.md` (v2.0) yêu cầu chuyển màn Trưng Trắc sang canvas logic 480×270 phóng bội số nguyên và thay asset bằng bộ sprite 8-bit mới, giữ nguyên cảm giác chơi. Tài liệu này là kết quả Bước 0 (chỉ đọc). Trạng thái: **CHỜ DUYỆT** — Phase 1 chỉ bắt đầu khi team duyệt tài liệu này và trả lời mục 8.

**Quyết định đã chốt với người dùng:** dùng **k = 0.6** thay vì công thức của task card `k = 270/360 = 0.75` (lệch task card, đã được xác nhận — xem mục 3).

---

## 1. Kết quả đo hệ toạ độ hiện tại
| Mục | Giá trị | Nguồn |
|---|---|---|
| Canvas logic | 896×360 (2.49:1, **không phải 16:9**) | `config.js:4-5`, `render.js:19-20`, template `width=896 height=360`, CSS `aspect-ratio: 896/360` |
| Hiển thị | `width:100%` co giãn lẻ, không letterbox | `trung-trac.css:90-99` |
| Camera | `cameraX` lerp tới `p.x − VIEW_W·0.34`, hệ số `dt·6`, kẹp `[0, LEVEL_WORLD_WIDTH − VIEW_W]`; không có camera dọc | `physics.js:411-413` |
| `GROUND_LAYER_TOP` / `GROUND_GRASS_OFFSET` / `GROUND_Y` | 290 / 34 / 324 | `config.js:13-16` |
| `CHUNK_W` × `LEVEL_CHUNKS` | 1280 × 12 = 15360 | `config.js:6-8` |
| Nhảy | v²/2g = 780²/4400 ≈ 138 px, thời gian lên ≈ 0.355 s | tính từ `JUMP_FORCE`, `GRAVITY` |
| Nhân vật | hitbox 42×70, GIF vẽ cao 86 trong `<div>` overlay | `state.js:112-129`, `render.js:367-409` |

## 2. Bộ sprite mới & manifest
- Vị trí: `assets/sprites/` (ngoài `frontend/static/` → Flask không phục vụ được). Manifest: `assets/sprites/manifest_tt.json`. Brief nằm ở **gốc repo** `SUTA_TT_SPRITE_BRIEF.md` (CLAUDE.md ghi `docs/` — lệch, cần sửa CLAUDE.md ở Phase 3).
- Đã kiểm: **mọi file `file` trong manifest đều tồn tại, kích thước = frame_w×frames × frame_h** (không có SIZE_MISMATCH).
- `hit_frame` **đếm từ 1** (brief §3.3) → index 0-based = `hit_frame − 1`.
- Baseline: chân ở hàng `frame_h − 2` (1 px trống dưới chân) → pivot vẽ = `(frame_w/2, frame_h − 1)`.
- **Đề xuất sao chép** (sau khi duyệt): chỉ các strip cuối cùng + manifest vào `frontend/static/assets/images/sprites-8bit/`, **giữ nguyên cấu trúc `<category>/<ID>/<file>.png`** để trường `file` của manifest resolve trực tiếp. Không chép `raw/ frames/ meta/ preview/`. `assets/sprites/` là vùng của Codex → chỉ đọc + chép.
- Đo bbox thật (union các frame, px @×1): PLAYER 30×44 (attack 37×30, hurt 43×38); TAXMAN 26×44; WATCHTOWER guard 35×39; GUARD 28×44; CAVALRY 75×54; PALANQUIN 92×53; TIGER run 58×30; CART roll 58×45, break 58×31 (frame cuối cao 26 — **không trống hẳn** như task card nói); SPIKE_PIT hidden 44×6, reveal 41×13; PROP_WATCHTOWER 29×91; BOSS CHARIOT 117×94; PJ coin 12×14, spear 26×3, fire arrow 19×6.
- ⚠ `EN_HAN_PALANQUIN` và `PJ_THROWING_KNIFE` có `status: NORMALIZED`, **chưa QA_PASS** (task card nói cả bộ đã QA_PASS).

## 3. Hệ số quy đổi k và xử lý chiều ngang
- Công thức task card: k = 270/360 = 0.75 → tầm nhìn ngang còn 640 px cũ (mất 29%), phía trước nhân vật ≈ 422 px cũ < `fireRange` 430 → lính ném từ ngoài màn hình; sprite mới nhỏ hơn hitbox quy đổi ~20–25%.
- Đo cho thấy bộ sprite mới vẽ theo tỉ lệ ≈ 0.6 thế giới cũ (TAXMAN 26×44 vs hitbox cũ×0.6 = 28×47; TIGER 58×30 vs 62×31; CAVALRY 75×54 vs 55×58; PLAYER 44 cao vs 42).
- **Chốt k = 0.6** (người dùng đã duyệt): 480×270 logic = **800×450 px cũ** → ngang giữ 89% tầm nhìn cũ, dọc dư 90 px cũ (54 px logic) — phần dư là **trời phía trên**. Sàn neo đáy khung: `GROUND_Y` mới = 270 − (360−324)·0.6 ≈ **248**. Mọi y trong code đều tính tương đối `GROUND_Y` nên chỉ cần đổi hằng số này.
- Camera giữ hệ số 0.34 → sau lưng 163 px logic, phía trước 317 px logic (≈528 px cũ) > `fireRange` mới 258 ✓.
- Hằng số thời gian (giây, cooldown, fps, `fireInterval`, `DASH_TIME`, `HURT_ANIMATION_TIME`) **không nhân k**. Tốc độ/gia tốc nhân k tuyến tính → độ cao nhảy, khoảng dash, thời gian đi hết màn giữ nguyên (sai số làm tròn < 0.5%).

## 4. Bảng quy đổi (k = 0.6, làm tròn gần nhất)
**config.js**
| Hằng số | Cũ | Mới |
|---|---|---|
| VIEW_W × VIEW_H | 896×360 | 480×270 (hằng `LOGICAL_W/H` đặt 1 chỗ) |
| CHUNK_W / LEVEL_WORLD_WIDTH | 1280 / 15360 | 768 / 9216 |
| GROUND_LAYER_HEIGHT / TOP / GRASS_OFFSET / GROUND_Y | 70 / 290 / 34 / 324 | 42 / 228 / 20 / 248 |
| FOOT_MARGIN | 9 | 5 |
| MOVE_SPEED / GRAVITY / JUMP_FORCE / DASH_SPEED | 280 / 2200 / 780 / 720 | 168 / 1320 / 468 / 432 |
| GROUND_SNAP_DISTANCE | 18 | 11 |
| PLAYER_SPRITE_HEIGHT | 86 | 52 (chỉ còn dùng nếu giữ GIF ở Phase 1 — không dùng, xem §6) |
| OBSTACLE_GROUND_SINK | 7 | 4 |
| MIDGROUND_BASE_IN_IMAGE / offset / MIDGROUND_Y | 175 / 8 / 141 | 105 / 5 / 138 |
| BACKDROP sky (y,h) / foreground h / ground (y,h) | 0,360 / 360 / 290,70 | 0,**270** (phủ cả phần trời dư) / 216 / 228,42 |
| LANDMARKS finish-gate worldX / height / sink | 15150 / 250 / 14 | 9090 / 150 / 8 |
| PROJECTILE_SPEED / MAX_RANGE / FADE_RANGE | 330 / 460 / 90 | 198 / 276 / 54 |
| HAZARD_DESPAWN_MARGIN | 520 | 312 |
| HAZARD_SPRITE_SIZES (drawW×drawH, w×h) | tiger 132×64,104×52 · cavalry 132×120,92×96 · cart 168×92,120×78 · cartBroken 142×90,112×58 · palanquin 175×100,140×82 · boat 190×110,150×66 · taxman 74×86,46×78 · wtGuard 81×86,48×78 · watchtower 111×180 · pitHidden 133×42,120×16 · pitOpen 142×60,74×12 | 79×38,62×31 · 79×72,55×58 · 101×55,72×47 · 85×54,67×35 · 105×60,84×49 · 114×66,90×40 · 44×52,28×47 · 49×52,29×47 · 67×108 · 80×25,72×10 · 85×36,44×7 (tỉ lệ groundLine/pit giữ) |
| PROJECTILE_SIZES | coin 33×26,22×18 · arrow 42×20,30×14 · dart 46×17,32×12 | 20×16,13×11 · 25×12,18×8 · 28×10,19×7 |
| ENEMY_SPRITES normal / boss | 75×88 / 138×126 | 45×53 / 83×76 |

**geometry.js** — `makeObstacle`: overhead `groundY−77`→`−46`, overhead h 34→20 (`drawScale` 1.65 là tỉ lệ, giữ). `makeHazard` default `fireRange` 430→258.

**state.js**
| Mục | Cũ | Mới |
|---|---|---|
| JITTER | 100 | 60 |
| fallenBranch (localX,w,h) | 700,91,39 | 420,55,23 |
| stoneBlock | 600,85,39 | 360,51,23 |
| trap localX / triggerDistance | 820 / 96 | 492 / 58 |
| reedCurtain | 500,127,53 | 300,76,32 |
| palanquin localX / speed / triggerX local | 1180 / −74 / 150 | 708 / −44 / 90 |
| guard enemy localX / w×h | 1040 / 74×82 | 624 / 44×49 |
| taxman localX | 520 | 312 |
| tiger localX / speed / trigger | 1220 / −232 / 700 | 732 / −139 / 420 |
| cart localX / speed / trigger | 1230 / −168 / 250 | 738 / −101 / 150 |
| watchtower / wtGuard / fireRange / cavalry / speed | 700 / 790 / 400 / 1300 / −316 | 420 / 474 / 240 / 780 / −190 |
| player x, w×h, normalH | 140, 42×70, 70 | 84, 25×42, 42 |
| boss localX / w×h | 850 / 96×105 | 510 / 58×63 |
| finishX | worldX(12,1030)=15110 | worldX(12,618)=9066 |
| books (chunk, localX, y−GROUND_Y) | (2,650,−94) (3,650,−86) (4,700,−145) (7,430,−100) (7,930,−120) | (2,390,−56) (3,390,−52) (4,420,−87) (7,258,−60) (7,558,−72) |

**physics.js** — hurt knockback vy −330→−198, vx −230→−138; respawn `max(80, start+120)`→`max(48, start+72)`; attack box rộng 80→48, y+12→+7, h `max(42,h−16)`→`max(25,h−10)`; platform tolerance +8→+5; clamp x min 20→12, `finishX+160`→`+96`; đẩy lùi ở đích 30→18; mốc câu hỏi worldX(8,520)→(8,312), nghỉ chân (9,470)→(9,282), cốt truyện (10,520)→(10,312); rơi hố `VIEW_H+160`→`VIEW_H+96`; lệch điểm bắn +6→+4; hitbox sách 18/22/36/44→11/13/22/26.

**render.js** — hằng vẽ thuần hình ảnh (lề culling, halo, thanh máu y−12/h6 →−7/4, sách w40/bob5/glow26 → 24/3/16, fallback landmark, chunk marker) nhân k tương ứng.

## 5. Bảng ánh xạ asset cũ → mới
| Thực thể (kind) | Cũ | Mới | Animation dùng | Ghi chú |
|---|---|---|---|---|
| Nhân vật | 6 GIF `characters/trung-trac/` | PLAYER_TRUNG_TRAC | idle, run, jump(theo vy), attack_01, hurt, death | **dash: TODO_MISSING** |
| roller kiệu | officialPalanquin strip4 | EN_HAN_PALANQUIN | walk | kiệu hp=0 → `break` không dùng; ⚠ status NORMALIZED |
| roller hổ | jungleTiger strip6 | EN_TIGER | run, hurt, death | không dùng attack_01/idle (không thêm vồ) |
| roller xe cống | tributeCart strip4 + tribute_cart_broken.png | OB_TRIBUTE_CART | roll, break | xác xe: **chờ team chọn** (§8) |
| roller kỵ binh | hanCavalry strip6 | EN_HAN_CAVALRY | gallop, hurt, death | |
| thrower thu thuế | hanTaxSoldier strip4 | EN_HAN_TAXMAN | idle, throw(hit 4), hurt, death | walk không dùng |
| thrower lính gác | watchtowerGuard strip4 | EN_HAN_WATCHTOWER | idle, alarm, throw(hit 4), hurt, death | |
| prop tháp canh | watchtower.png | PROP_WATCHTOWER | idle (1f) | |
| trap hố chông | spike_pit_hidden/open.png | TR_SPIKE_PIT | hidden → reveal (1 lần) | ảnh mới hố nông → bỏ `groundLine`/`pitLeft/Right` + `drawPitShadow`, neo baseline sát `GROUND_Y` chìm ~3 px (DESIGN_BASELINE) |
| boat | patrolBoat strip4 | EN_HAN_BOAT | float, shoot(hit 4), death | chỉ khai báo, không vào màn |
| enemy thường | hanTaxSoldier strip | EN_HAN_GUARD | idle, hurt, death | enemy hiện đứng yên + va chạm → walk/attack_01 không có hành vi tương ứng |
| boss | hanCavalry strip | BOSS_TO_DINH_CHARIOT | idle (+ nháy hitTimer) | boss hiện chỉ đứng yên → charge/throw/shield_break không có hành vi tương ứng |
| đạn thu thuế | coin_pouch_strip2 | PJ_COIN_POUCH | loop 4f | |
| đạn lính gác | throwing_dart_strip2 | PJ_SPEAR | idle 1f | |
| đạn thuyền | fire_arrow_strip2 | PJ_FIRE_ARROW | loop 3f | |
| boss ném | — | PJ_OIL_JAR + FX_OIL_FIRE | — | boss hiện **không ném** → không dùng |
| obstacles tĩnh | fallenBranch/stoneBlock/reedCurtain… | (giữ ảnh cũ) | — | TODO_MAP |
| backdrop/landmark | sky/foreground/ground/finish-gate | (giữ, vẽ thu k) | — | TODO_MAP |

Hitbox mới đề xuất (px logic, pivot bottom-center, DESIGN_BASELINE): player 25×42 (giữ từ quy đổi); tiger 48×24; cavalry 56×48; cart 48×38; palanquin 76×44; taxman 20×40; wtGuard 22×36; guard 22×40; boss 90×80; pit 36×6; coin 10×10; spear 22×4; arrow 16×5. Sprite vẽ ×1 theo frame gốc, không co giãn.

## 6. Thiết kế theo phase
**Module (DAG giữ nguyên, thêm 2 module):**
```
config ← geometry ← state ← physics ← main
   ↑        ↑         ↑        ↑
assets   animation ───┴── render ← main      input ← physics/main   ui ← physics/main
viewer (chỉ nạp động từ main khi ?viewer=1; import config, assets)
```
- `animation.js` (Phase 2, mới): hàm thuần `setAnim(entity, name)` (không reset nếu trùng tên), `tickAnim(entity, dt)`, `frameIndex(meta, anim)` (loop / dừng frame cuối), `hitReached(meta, anim)`. Lý do tách: dùng chung bởi physics (đạn/đòn tại `hit_frame`) và render; tránh vòng render↔physics.
- `viewer.js` (Phase 1, mới): chế độ `?viewer=1`, chọn asset → animation từ manifest, xem ×1/×3/×4, lưới + baseline. Lý do tách: không liên quan gameplay, chỉ nạp khi cần.
- Manifest đọc lúc chạy bằng `fetch` trong `assets.js` → nguồn duy nhất cho frames/fps/loop/hit_frame; `config.js` chỉ giữ ID/animation mỗi thực thể dùng + hitbox logic.

**Phase 1 — 480×270 + quy đổi**
- `render.js`: canvas 480×270; `fitCanvas()` tính `s = floor(min(availW/480, availH/270))`, `s<1` (điện thoại dọc) thì dùng lẻ — chú thích rõ; đặt CSS size canvas = 480s×270s; smoothing bật cho backdrop/landmark, tắt trước khi vẽ sprite; `Math.round` sau khi trừ camera. F2: hitbox, pivot, tên anim + frame.
- `main.js`: gọi `fitCanvas` lúc tải + `resize`/`orientationchange`; nạp `viewer.js` khi `?viewer=1`.
- `input.js`: phím F2 → cờ debug (export `debug`).
- Template/CSS: bỏ `width/height/aspect-ratio` cố định; `.stage-wrap` ôm đúng kích thước canvas hiển thị, căn giữa, viền letterbox; HUD cùng bề rộng canvas; panel/message/nút cảm ứng nằm trong vùng canvas.
- Nhân vật Phase 1: **hộp placeholder** theo hitbox (+ dấu hướng mặt), ẩn `#playerSprite`. Lý do: định vị GIF overlay qua letterbox + scale là code bỏ đi ở Phase 2.
- Chép sprite + manifest vào `sprites-8bit/` (cần cho viewer).

**Phase 2 — nhân vật strip**
- `drawPlayer()` vẽ strip, pivot chân tại `(p.x+p.w/2, p.y+p.h)`, lật khi `facing<0` (gốc quay phải). Ưu tiên `hurt > dash > attack > jump > run > idle`.
- attack_01: 6 frame trải trên `attackCooldown` .36 s → **16.7 fps** (manifest 14); đòn gây sát thương tại frame 3 = **t = 0.12 s**. Hiện code gây sát thương **ngay khi bấm** (`startAttack`) → chuyển sang xét hitbox khi tới frame 3, giữ cửa sổ `attacking` .18 s, mỗi mục tiêu chỉ trúng 1 lần/đòn (set id đã trúng). Trễ 120 ms so với bản cũ — ghi vào report.
- jump: frame 0 khi vy < −90, 1 khi |vy| ≤ 90, 2 khi vy > 90 (DESIGN_BASELINE).
- hurt: 2f @8fps, giữ frame cuối tới hết `hurtTimer` .45 s.
- dash (TODO_MISSING): frame cuối `run` + 2–3 bóng mờ vẽ bằng code phía sau. Chọn run thay attack_01 để không lẫn với đòn chém. Ghi yêu cầu vẽ `dash` cho Codex.
- death: luồng thua hiện chỉ `endGame(false)` (không có trạng thái chết), nhưng `draw()` vẫn chạy sau đó → đề xuất chỉ thêm `player.deathTime` ghi trong `endGame(false)` và render phát `death` 1 lần (không thêm cơ chế). Nếu team không muốn → chỉ ghi chú.
- Bỏ `<div id="playerSprite">` khỏi template + CSS; giữ file GIF và `tools/normalize_player_gifs.py`.

**Phase 3 — hazard/enemy/boss/projectile**
- Mỗi hazard/enemy có `anim {name, time}` riêng, tick trong physics; strip không lặp chạy theo thời gian riêng, không theo đồng hồ chung.
- `THROWER_ANIMATIONS` thay bằng manifest: đạn sinh khi `throw` tới `hit_frame` 4 (index 3). Đề xuất **trải `throw` trên tổng thời lượng cũ .85 s** → nhả đạn tại ≈ .425 s (cũ .45 s) để giữ khoảng né; nếu dùng fps manifest (12) thì nhả tại .25 s — ghi report. `alarm` (loop) phát 1.1 s như cũ.
- Hết máu: vào trạng thái `dying` (tắt va chạm ngay), phát `death`/`break` 1 lần rồi xoá; áp cả enemy/boss (hiện biến mất tức thì).
- `hitTimer > 0` → `hurt` (nếu asset có) thay cho nháy alpha.
- Tất cả strip mới `facing: 'right'`; kiểm tra bằng viewer.

## 7. OWNED / READ-ONLY FILES
| Phase | OWNED |
|---|---|
| Bước 0 | `docs/INTEGRATION_PLAN_TT.md` |
| 1 | `trung-trac/{config,geometry,state,physics,render,main,input,assets}.js`, **mới** `trung-trac/viewer.js`, `templates/gameplay/levels/trung-trac.html`, `css/levels/trung-trac.css`, **chép vào** `static/assets/images/sprites-8bit/**`, `docs/REPORT_TT-INT-01.md` |
| 2 | `config,assets,state,physics,render.js`, **mới** `animation.js`, template + CSS (bỏ div GIF), report |
| 3 | `config,geometry,state,physics,render,assets,animation.js`, `sprites-8bit/manifest_tt.json` + `assets/sprites/manifest_tt.json` (chỉ `status`), `CLAUDE.md`, report |

READ-ONLY: `assets/sprites/**` (trừ `status`), `SUTA_TT_SPRITE_BRIEF.md`, mọi PNG/GIF, `tools/*.py`, `backend/**`, `app.py`, level khác (`level-test.*`), `docs/SUTA_TT_TASK_INTEGRATE_P0.md`.

## 8. Rủi ro & câu hỏi cho team
1. **k = 0.6 lệch công thức task card** — đã được người dùng duyệt; cần cập nhật task card hoặc ghi nhận trong report.
2. **Xe cống vỡ:** (a) phát `break` 1 lần rồi xoá (đề xuất — frame cuối vẫn còn đống xác cao 26 px nên có thể **giữ frame cuối làm xác xe**, bỏ `tribute_cart_broken.png`), (b) giữ ảnh xác xe cũ (lệch phong cách/tỉ lệ), (c) xoá hẳn.
3. `EN_HAN_PALANQUIN` chưa QA_PASS — được dùng không? Cuối Phase 3 có đổi sang `IN_GAME` không?
4. Boss mới 117×94 lớn gấp ~1.5 lần boss cũ quy đổi → hitbox 90×80 đề xuất khó né hơn; chấp nhận hay giữ hitbox 58×63?
5. Nhịp ném: giữ tổng thời lượng cũ (.85 s) hay dùng fps manifest (.5 s)?
6. Đòn chém trễ 120 ms do sát thương dời về frame 3 — chấp nhận?
7. Letterbox bội số nguyên: màn 1366×768 chỉ được ×2 (960×540) → viền lớn. Chấp nhận?
8. Nền cũ vẽ thu 0.6 + phần trời dư 54 px: `sky.png` kéo cao 270 (chấp nhận tạm, TODO_MAP).
9. Chữ chunk marker trên canvas 480 sẽ rất nhỏ/vỡ → chuyển sang HUD DOM hay giữ?
10. Code hiện có lệch sẵn: comment `config.js:63` nói landmark 15150 khớp `finishX`, nhưng `worldX(12,1030)` = 15110 (lệch 40 px). Giữ nguyên độ lệch khi quy đổi, không tự sửa.
11. Nhánh `refactor-static-obstacle` đang có nhiều thay đổi **chưa commit** trên chính các file sẽ sửa → đề nghị commit/tách nhánh trước Phase 1.
12. `victory` 4f có sẵn nhưng ngoài phạm vi → không dùng.

## 9. Quyết định của team (25/09/2026)
| # | Câu hỏi | Quyết định |
|---|---|---|
| 1 | Hệ số k | **k = 0.6** |
| 2 | Xác xe cống | Phát `break` 1 lần, **giữ frame cuối làm xác xe** nằm lại map (vô hại); ngừng tham chiếu `tribute_cart_broken.png` |
| 3 | `EN_HAN_PALANQUIN` (NORMALIZED) | **Được dùng** |
| 4 | Hitbox boss | **Theo hình mới 90×80** |
| 5 | Nhịp ném | **Giữ tổng thời lượng cũ 0.85 s** — `throw` 6f trải trên .85 s (≈7.06 fps), nhả đạn tại frame 4 ≈ .425 s |
| 6 | Đòn chém trễ 120 ms (sát thương tại frame 3) | **Chấp nhận** |
| 7 | Letterbox bội số nguyên (1366×768 → ×2) | **Chấp nhận** |
| 7b | (25/09, sau Phase 2) Hiển thị | **Đổi: phủ kín vùng trống, scale lẻ** — bộ đệm bội số nguyên + thu mượt (thay cho letterbox bội số nguyên) |
| 3b | (25/09, đóng task) `EN_HAN_PALANQUIN` = `IN_GAME` | **Giữ** |
| 12 | (25/09, sau Phase 3) Hitbox lính canh 22×40 | **Giữ** |
| 13 | (25/09, sau Phase 3) Dash | **Bất tử với lính, hazard, đạn** |
| 11 | Thay đổi chưa commit | **Đã commit** (`e3d8951`) |

Chưa có quyết định — áp dụng mặc định đề xuất, team có thể đổi khi duyệt Phase tương ứng:
- §8.8 Nền: `sky.png` kéo cao 270 phủ phần trời dư (TODO_MAP).
- §8.9 Chunk marker: giữ trên canvas ở cỡ quy đổi, đánh giá lại khi chơi thử Phase 1.
- Phase 2 `death`: thêm `player.deathTime` trong `endGame(false)`, render phát `death` 1 lần (không thêm cơ chế).
- §8.12 `victory`: không dùng.
