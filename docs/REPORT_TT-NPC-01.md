# REPORT TT-NPC-01

Task card: [SUTA_TT_TASK_NPC_01.md](SUTA_TT_TASK_NPC_01.md) · Kế hoạch: [NPC_PLAN_TT.md](NPC_PLAN_TT.md) (quyết định team 26/09 ở §4).

## Phase A — 26/09/2026

**Trạng thái: PASS — chờ người chơi thử duyệt.** Không sửa file ngoài OWNED FILES của Phase A.

### File đã sửa (file | mục đích)

| File | Mục đích |
|---|---|
| `frontend/static/js/levels/trung-trac/progress.js` (**mới**) | Tiến trình giữa các màn trong `sessionStorage` (`readProgress`/`saveProgress`/`clearProgress`/`addReward`), chặn truy cập `requireLevel()` + `?debug=1` (dữ liệu giả lập, không ghi vào storage), `LEVEL_URLS`, `REWARD_NAMES` (tên nguyên văn mục 5). |
| `frontend/static/js/levels/trung-trac/placeholder.js` (**mới**) | Trang giữ chỗ màn 2 (tạm, tới Phase B) và màn 3: chặn truy cập, tóm tắt điểm/binh thư/phần thưởng, nút “Chơi lại từ màn 1” (xoá tiến trình). |
| `frontend/templates/gameplay/levels/trung-trac-placeholder.html` (**mới**) | Template trang giữ chỗ (tham số `level_id`, `title`). |
| `frontend/static/js/levels/trung-trac/config.js` | `HAZARD_SPRITES.palanquinBoss` (thêm `throw`, `muzzle` 24, `idleHold`); `PROJECTILE_SPRITES.throwingKnife`; `PJ_THROWING_KNIFE` vào `SPRITE_8BIT_IN_GAME`; hằng `MINIBOSS`; comment boss Tô Định tạm không dùng. |
| `frontend/static/js/levels/trung-trac/state.js` | Bỏ boss Tô Định khỏi màn 1; thêm mini-boss (`makeMiniBoss()`, hazard kind `patrol`, `boss: true`) ở chunk 11; bỏ nhóm kiệu `roller` khỏi nhóm xáo, thay bằng nhóm lính canh thứ 2 (D5); `bossAlive()` dùng chung. |
| `frontend/static/js/levels/trung-trac/physics.js` | `updatePatrol()` (đi tuần / đứng lại quay về người chơi), dùng lại cơ chế ném của thrower; animation `idle` giữ ô 1 (`idleHold`); điểm + thông báo mini-boss; cổng dùng `bossAlive()`; `endGame(true)` ghi tiến trình + hiện nút “Sang Màn 2”. |
| `frontend/static/js/levels/trung-trac/render.js` | Cổng mở dùng `bossAlive()`; thanh máu mini-boss màu đỏ. |
| `frontend/static/js/levels/trung-trac/ui.js` | Ref `nextLevelButton`; HUD sách `x/${books.length}`. |
| `frontend/static/js/levels/trung-trac/main.js` | Nút “Sang Màn 2”; `resetGame` ẩn nút này; thông báo đầu màn. |
| `frontend/templates/gameplay/levels/trung-trac.html` | Tiêu đề “Màn 1: Vượt ải”; nút `#nextLevelButton`. `#questionPanel` giữ nguyên (D1). |
| `frontend/static/css/levels/trung-trac.css` | Khung 16:9 cho trang giữ chỗ + danh sách phần thưởng. |
| `backend/routes/pages.py` | Route `/gameplay/levels/trung-trac/2` và `/3` (trang giữ chỗ). |
| `tests/test_app.py` | Assert 200 cho 2 route mới. |

**Làm ÍT hơn kế hoạch (patch nhỏ nhất):** `LEVELS`/`setLevel()` trong `config.js`, `assets.js` và `geometry.js` **chưa đụng tới** — Phase A chưa có màn 2 chơi được nên chưa cần. Dời sang Phase B.

### Hằng số mới (tên | giá trị | DESIGN_BASELINE)

| Tên | Giá trị | DESIGN_BASELINE |
|---|---|---|
| `MINIBOSS.chunk` / `localX` | 11 / 510 (tâm = 8190, chỗ boss cũ) | Có |
| `MINIBOSS.hp` | 6 | Có |
| `MINIBOSS.patrolRange` / `speed` | 160 px (8110–8270) / 30 px/s | Có |
| `MINIBOSS.fireRange` / `fireInterval` | 240 px / 2.5 s | Có |
| `MINIBOSS.hitScore` / `defeatScore` | 100 / 700 (D9) | Có |
| `palanquinBoss.muzzle` | 24 px | Có (D10) |
| `throwingKnife` hitbox | 12×5 | Có (D10) |
| Hitbox kiệu | 76×44 (dùng lại của kiệu `roller`) | Có sẵn |

### Kết quả test (test | PASS/FAIL | ghi chú)

Khung trình duyệt bị ẩn nên `requestAnimationFrame` không chạy; mình kiểm bằng cách gọi thẳng `update(1/60)` và `draw()` của engine trong trang thật (asset thật, module thật), cộng với 1 ảnh chụp F2.

| Test | Kết quả | Ghi chú |
|---|---|---|
| Màn 1 không còn boss Tô Định | **PASS** | `enemies` chỉ còn 2 lính canh; tổng 12 = 3 vật tĩnh + 6 hazard (không tính tháp) + 2 lính canh + mini-boss. |
| Mini-boss ở chunk 11 đi qua lại | **PASS** | 12s: 8190 → 8121 (quay đầu) → 8270 (quay đầu) → 8180; 30 px/s; phát `walk`. |
| Ném dao đúng `hit_frame` | **PASS** | Trong tầm 240: dừng, quay về người chơi, phát `throw`; dao sinh sau 0.217s (ô 3 = 0.2s + 1 khung 1/60). |
| Chu kỳ 2.5s từ lúc ném xong | **PASS** | Hết ném t=1.300 → ném tiếp t=3.817 (2.517s, sai số 1 khung). |
| Dao trúng mất 1 máu | **PASS** | 5 → 4, dao tan. |
| Chết sau 6 đòn, phát `break`, xoá | **PASS** | hp 6→0 sau đúng 6 cú; `death` (= `break`) phát 36 khung (0.6s) rồi xoá. |
| Trúng đòn phát `hurt`, không đẩy lùi | **PASS** | `hurt` suốt `hitTimer` 0.18s; x kiệu không đổi. |
| Cổng mở khi hạ mini-boss + đủ 5 sách | **PASS** | Kiệu sống + 5 sách: giữ lại, “Hãy hạ kiệu quan trước khi qua cổng.”; kiệu chết + 4 sách: giữ lại, “Bạn còn thiếu 1 cuốn sách lịch sử.”; đủ cả hai: thắng. |
| Qua cổng → màn 2 (trang tạm), dữ liệu đúng | **PASS** | Tiến trình `{score:1234, books:5, level1Complete:true, level2Complete:false, rewards:[]}`; panel “Hoàn thành Màn 1: Vượt ải” + nút “Sang Màn 2” → `/2` hiện “Điểm: 1234 · Binh thư: 5/5”. |
| Vào thẳng màn 2 khi chưa qua màn 1 → về màn 1 | **PASS** | `sessionStorage` trống → `/2` chuyển về `/gameplay/levels/trung-trac`. `/3` khi mới xong màn 1 cũng về màn 1. |
| `?debug=1` vào được | **PASS** | `/3?debug=1` hiện đủ 3 phần thưởng, điểm 0. |
| Chơi lại từ màn 1 xoá tiến trình | **PASS** | |
| Dash xuyên kiệu và dao ném | **PASS** | Dash: dao chồng lên người chơi 83 khung, máu vẫn 5, dao bay qua. Va chạm kiệu dùng chung `playerImmune()`. |
| Dao chém tan được | **PASS** | Tan sau 8 khung, +30 điểm. |
| Hồi quy: hết màn 1 ba lượt, không lỗi console | **PASS** (mô phỏng) | 3 lượt tự chạy (giữ phải, nhảy, chém, trả lời câu hỏi) với 3 layout xáo khác nhau: đều thắng (146–180s), kiệu ném dao trong cả 3 lượt, 0 lỗi / 0 lỗi console. **Cần người chơi thử thật.** |
| `?layout=p2`, `?viewer=1` | **PASS** | p2: 6 vật cản, không hazard/enemy, chạy 300 khung không lỗi. |
| Route | **PASS** | `pytest` bị skip (không có `SUTA_TEST_DATABASE_URL`); gọi 4 route bằng test client của Flask: đều 200. |

Lưu ý môi trường: trong lúc test, máy nhiều lần báo `net::ERR_NETWORK_CHANGED` khi tải static qua `localhost` (curl vẫn trả 200), nên có lúc trang báo thiếu sprite. Mở qua `127.0.0.1` thì tải đủ. Không phải lỗi code.

### Text đã sửa so với bản cũ (vị trí | cũ | mới)

| Vị trí | Cũ | Mới |
|---|---|---|
| `trung-trac.html` `<title>` | SUTA – Màn thử Trưng Trắc | SUTA – Trưng Trắc · Màn 1: Vượt ải |
| `trung-trac.html` loading `<h1>` | Màn thử Trưng Trắc | Màn 1: Vượt ải |
| `main.js` thông báo đầu màn | Thu thập 5 cuốn sách và vượt qua các chướng ngại vật. | Thu thập 5 cuốn sách, vượt chướng ngại và hạ kiệu quan. |
| `physics.js` giữ ở cổng | Hãy đánh bại lính giữ thành trước khi về đích. | Hãy hạ kiệu quan trước khi qua cổng. |
| `physics.js` hạ mini-boss | (boss cũ: Đã đánh bại toán lính giữ thành!) | Đã hạ kiệu quan! |
| `physics.js` / `trung-trac.html` tiêu đề panel thắng | Hoàn thành màn thử! | Hoàn thành Màn 1: Vượt ải |
| Panel thắng | nút “Chơi lại” | nút “Sang Màn 2” (phím R vẫn chơi lại) |
| Trang giữ chỗ (mới) | — | “Màn 2: Chiêu mộ hiền tài — đang phát triển”, “Màn 3: Trận Luy Lâu — đang phát triển”, “Điểm: N · Binh thư: N/5”, “Chơi lại từ màn 1” |

Giữ nguyên theo D1–D2: câu hỏi năm 40 (chunk 8), “Nghỉ chân: hồi 1 máu.” (chunk 9), “Mê Linh, năm 40: nghĩa quân tập hợp, chuẩn bị phất cờ khởi nghĩa.” (chunk 10). Text của boss Tô Định (“Đã đánh bại toán lính giữ thành!”, “Lính giữ thành phản công!”) vẫn nằm trong code cho màn 3, màn 1 không còn gọi tới. Không có text nào nói “chiếm”/“hạ” thành Luy Lâu.

### Vấn đề asset

- `EN_HAN_PALANQUIN` **không có `idle`**: khi đứng chờ giữa 2 lần ném, kiệu dừng ở ô 1 của `walk` (D6). Nếu team muốn kiệu “thở” khi đứng, cần Codex bổ sung `idle` (thiếu animation, không phải lỗi hình — không cần `NEED_REDRAW`).
- `PJ_THROWING_KNIFE` 16×8 khá nhỏ ở ×1 (ảnh F2): nhìn được nhưng dễ lẫn nền cỏ; chờ người chơi thử đánh giá.
- ~~`status` trong manifest chưa đổi~~ → đã đổi `IN_GAME` sau Phase B (xem Phase B).

### Câu hỏi cho team

1. ~~Nhóm lính canh thứ 2 dùng cùng vị trí…~~ → đã xử lý ở “Bổ sung Phase A” bên dưới.
2. Trang giữ chỗ nháy lên một thoáng trước khi chuyển về màn 1 (lúc chặn truy cập). Có cần ẩn nội dung tới khi kiểm tra xong không?
3. Dòng cốt truyện chunk 10 (“…chuẩn bị phất cờ khởi nghĩa”) và câu hỏi “khởi nghĩa bùng nổ năm 40” vẫn đi trước cốt truyện 5.4 của màn 2 — ghi lại để sửa khi có bộ câu hỏi mới (D1–D2).

## Bổ sung Phase A — Lính canh đi tuần + đâm kích — 26/09/2026

Yêu cầu team (26/09): lính canh không đứng yên nữa mà đi qua lại và tấn công; 2 lính đứng lệch nhau. **Trạng thái: PASS về gameplay, có vấn đề asset `NEED_REDRAW` (xem dưới) — chờ người chơi thử duyệt.**

### File đã sửa (file | mục đích)

| File | Mục đích |
|---|---|
| `config.js` | `ENEMY_SPRITES.normal` thêm `walk`, `attack` (`attack_01`); hằng `GUARD`. |
| `state.js` | `makeEnemy()`: lính thường có đoạn tuần tra, `facing`, `action`, `attackCooldown` (boss giữ nguyên, đứng yên). Nhóm lính canh thứ 2 đặt ở `localX` 200 (nhóm 1 ở 624). |
| `physics.js` | `updateGuard()` (đi tuần / thấy người chơi thì quay lại và tiến tới trong đoạn tuần tra / tới tầm thì đâm), `advanceGuardAttack()` (sát thương đúng ô `hit_frame`, 1 lần/cú, bị chém thì huỷ cú đâm), animation `death > hurt > attack > walk > idle`. |
| `render.js` | Lính thường vẽ theo `facing` riêng; boss vẫn luôn quay về phía người chơi. |

### Hằng số mới (DESIGN_BASELINE)

| Tên | Giá trị | Ghi chú |
|---|---|---|
| `GUARD.patrolRange` / `speed` | 96 px / 24 px/s | |
| `GUARD.aggroRange` | 110 px (tâm tới tâm) | |
| `GUARD.attackReach` | ~~8~~ → **12** px từ mép hitbox | Đo lại theo strip vẽ lại 26/09 (Codex): mũi kích 8 px quá mép hitbox + 4 px dung sai. |
| `GUARD.attackBoxY` / `attackBoxH` | ~~20 / 10~~ → **13 / 10** (từ đỉnh hitbox) | Đo lại theo strip vẽ lại 26/09. |
| `GUARD.attackCooldown` | 1.2 s | |
| Vị trí nhóm lính 2 | `localX` 200 ± 60 | Nhóm 1: 624 ± 60. Tránh vị trí sách 258–558. |

### Kết quả test

| Test | Kết quả | Ghi chú |
|---|---|---|
| Đi qua lại | **PASS** | 10s: quay đầu đúng ở 2 mép đoạn 96 px, phát `walk`. (Lần đầu FAIL: lính đứng im ở mép vì bước kế tiếp vượt đoạn mà không quay đầu — đã sửa.) |
| Thấy người chơi → quay lại, tiến tới, đâm | **PASS** | Đâm khi khoảng trống ≤ 4 px; sát thương ở 0.167s = ô 3 (12 fps); nghỉ 1.2s giữa 2 cú. |
| Không trúng oan ngoài tầm kích | **PASS** | Đứng cách 10 px trong 3s: không đâm, không mất máu. |
| Dash né cú đâm | **PASS** | Máu giữ 5. |
| Chém ngắt cú đâm | **PASS** | Cú đâm huỷ trước ô `hit_frame`, không mất máu, lính phát `hurt`. |
| Hạ lính sau 2 đòn, phát `death`, xoá | **PASS** | |
| 2 lính đứng lệch nhau | **PASS** | 20 lượt xáo: lính 1 ở 578–692, lính 2 ở 155–265 trong chunk. |
| Hồi quy 3 lượt hết màn 1 | **PASS** (mô phỏng) | Đều thắng, lính đâm 3–6 lần mỗi lượt, 0 lỗi / 0 lỗi console. |

### Vấn đề asset

- **`EN_HAN_GUARD.attack_01` — `RESOLVED 2026-09-26`**: đã vẽ lại từ identity `idle`, giữ 6 ô / 12 fps / hit frame 3 và khiên chữ nhật trong toàn bộ chuyển động. Chiều cao trung bình mới 40.5 px so với `idle` 43.75 px (lệch 7.4%); strict QC: 0 edge-touch, 0 clamp, body-scale CV 0.022, anchor-y std 0.021. Đã đo lại vùng đâm theo ô 3–4: `attackReach=12`, `attackBoxY=13`, `attackBoxH=10`.

## Phase B — 26/09/2026

**Trạng thái: PASS — chờ người chơi thử duyệt.** Không sửa file ngoài OWNED FILES Phase B (§6 NPC_PLAN_TT.md). Text màn 2 khớp mục 5 từng chữ (kiểm bằng script).

### File đã sửa (file | mục đích)

| File | Mục đích |
|---|---|
| `trung-trac/dialogue-data.js` (**mới**) | Nội dung mục 5 nguyên văn (thoại, câu hỏi, 3 đáp án — đáp án đầu là đúng, gợi ý, vì sao đúng, phần thưởng + id, cốt truyện 5.4). |
| `trung-trac/dialogue.js` (**mới**) | Khung hội thoại: chân dung, tên + danh hiệu, thoại bấm-tiếp, câu hỏi 3 đáp án xáo, sai → −1 máu + gợi ý + làm mờ + chọn lại, đúng → vì sao đúng → phần thưởng; cốt truyện chân dung trắng đen; phím 1–3 / Enter / Space + cảm ứng; tạm dừng/chạy tiếp game. |
| `trung-trac/config.js` | `LEVELS` + `LEVEL`/`setLevel()` (mẫu `VIEW_W`), `LEVEL2_ZONES`, `LEVEL2_FINISH_X`, `NPC_SPRITES`, `NPC_RULES`, `QUESTION_SCORE`; NPC vào `SPRITE_8BIT_IN_GAME`. |
| `trung-trac/state.js` | `createLevelState()` chọn nội dung theo `LEVEL.id` (`level1Content()` giữ nguyên màn 1; `level2Content()` mới), `makeNpc()`, `checkNpcClearance()`, `options.score`. |
| `trung-trac/physics.js` | Sự kiện màn 1 gom vào `updateLevel1Events()` (chỉ chạy màn 1); `updateMeetings()` (giữ người chơi trước NPC chưa gặp, mở hội thoại ở ≤ 32 px, NPC mờ dần, cốt truyện khi vào chunk 2); điều kiện về đích dùng `books.length` + NPC; camera theo `LEVEL.worldWidth`; `endGame()` ghi tiến trình + tiêu đề/nút theo màn. |
| `trung-trac/render.js` | Vùng cảnh/cổng/HUD chunk theo `LEVEL`; `drawNpcs()` (idle/talk, quay về người chơi, mờ dần); NPC trong lớp F2. |
| `trung-trac/assets.js` | Nền cần tải theo `LEVEL.zones`; chỉ so `stage_length` ở màn 1. |
| `trung-trac/ui.js` | Ẩn ô Sách khi màn không có sách. |
| `trung-trac/main.js` | Đọc `data-level` → `setLevel()` → `requireLevel()`; điểm mang sang; lời giới thiệu theo màn; `initDialogue()`; nút sang màn theo `LEVEL.id`; đóng hội thoại khi chơi lại. |
| `templates/gameplay/levels/trung-trac.html` | `data-level`, tiêu đề theo `title`, `#bookHud`, `#dialoguePanel`. |
| `css/levels/trung-trac.css` | Khung hội thoại (`pixelated`, `grayscale(1)`), đáp án sai mờ/gạch; điện thoại dọc: bảng nổi ở đáy; `[hidden]` cho ô HUD/phần tử hội thoại. |
| `backend/routes/pages.py` | Màn 1 truyền `level_id=1`; `/2` render `trung-trac.html` với `level_id=2` (thay trang giữ chỗ). |
| `assets/sprites/manifest_tt.json` + `sprites-8bit/manifest_tt.json` | `status` → `IN_GAME`: `NPC_THI_SACH`, `NPC_LE_CHAN`, `NPC_TRUNG_NHI`, `PORTRAIT_THI_SACH`, `PORTRAIT_LE_CHAN`, `PORTRAIT_TRUNG_NHI`, `PJ_THROWING_KNIFE` (chỉ trường `status`, script kiểm tra). |
| `assets/maps/trung-trac/maps_tt.json` + `maps-8bit/maps_tt.json` | `status` → `IN_GAME`: `OBS_FENCE_LOW`, `OBS_BAMBOO_SLOPE`, `OBS_SLIDE_BAR`, `OBS_LOG_DRIFT`. |
| `CLAUDE.md` | Cấu trúc 3 màn, tổ chức level (`LEVELS`/`setLevel`), module mới, tiến trình, mini-boss, lính canh, màn 2/NPC/câu hỏi; boss Tô Định tạm không dùng; danh sách asset chưa dùng. |

`trung-trac-placeholder.html`/`placeholder.js` giờ chỉ còn phục vụ màn 3.

### Hằng số mới (tên | giá trị | DESIGN_BASELINE)

| Tên | Giá trị | DESIGN_BASELINE |
|---|---|---|
| `LEVELS[2].chunks` / `worldWidth` | 4 / 3072 | Có (task §3.2.1) |
| `LEVEL2_ZONES` | Z1 0–768, Z2 768–1536, Z4 1536–3072, trời ngày | Có |
| `LEVEL2_FINISH_X` | 2976 (cuối chunk 4 − 96) | Có (D15) |
| Vị trí NPC | Thi Sách 384, Lê Chân 1920, Trưng Nhị 2688 (giữa chunk 1/3/4) | Có |
| Vật cản màn 2 | fenceLow 180, bambooSlope 600, fallenBranch 968, slideBar 1288, logDrift 1656, stoneBlock 2136 (mép trái) — cách NPC gần nhất ≥ 164 px | Có |
| `NPC_RULES.talkDistance` | 32 px (mép phải người chơi → tâm NPC) | Có (task §3.2.3) |
| `NPC_RULES.holdGap` | 12 px | Có |
| `NPC_RULES.fadeTime` | 0.8 s | Có |
| `NPC_RULES.clearance` | 96 px | Có (task §3.2.2) |
| `QUESTION_SCORE` | đúng lần đầu +500 / đúng sau khi sai +250 | Có (D14) |

### Kết quả test (test | PASS/FAIL | ghi chú)

Như Phase A, mô phỏng bằng cách gọi `update()`/`draw()` và thao tác DOM/phím thật trên trang (khung trình duyệt bị ẩn nên `requestAnimationFrame` không chạy); kèm ảnh chụp.

| Test | Kết quả | Ghi chú |
|---|---|---|
| Đúng thứ tự Thi Sách → cốt truyện → Lê Chân → Trưng Nhị | **PASS** | Hội thoại mở ở khoảng cách 31 px; cốt truyện mở ở x = 770 (vừa vào chunk 2). |
| Không đi vượt được NPC chưa gặp | **PASS** | Dịch người chơi ra sau Lê Chân → bị kéo về trước NPC (mép phải 1908 = 1920 − 12) và hội thoại mở. |
| Chọn sai mất 1 máu, được chọn lại | **PASS** | Máu 5 → 4 (HUD 4 tim), hiện “Gợi ý: …”, đáp án sai bị làm mờ + khoá; bấm lại đáp án đó không trừ thêm. |
| Chọn đúng đủ các bước, phần thưởng vào tiến trình | **PASS** | Vì sao đúng → Phần thưởng → Đóng; +250 khi đã sai, +500 khi đúng ngay; `rewards` ghi ngay khi đúng; đóng thì game chạy tiếp, NPC mờ dần trong 0.8 s. |
| Hết máu khi trả lời sai → thua, chơi lại màn 2 giữ dữ liệu màn 1 | **PASS** | “Bạn đã thất bại”; chơi lại: máu 5, điểm về 1500 (mang từ màn 1), NPC + cốt truyện đặt lại. |
| Cốt truyện hiện đúng một lần | **PASS** | Không mở lại khi đi tiếp qua chunk 2–4. |
| Đối chiếu từng chữ với mục 5 | **PASS** | Script: 29/29 câu có trong `dialogue-data.js`, đáp án đầu mỗi câu là ✅; không có chuỗi nội dung nào ngoài mục 5. |
| F2: vật cản P2 khớp hitbox | **PASS** | Đo alpha PNG theo `obstacleDrawRect`: Δ = 0 ở 4 cạnh cho cả 6 loại (`slideBar` có 20 px dây treo phía trên — đúng thiết kế TT-MAP-01). Ảnh F2 chunk 3. |
| Nhảy qua, đứng lên được; va ngang mất máu | **PASS** | 5 loại thường: rơi từ trên xuống đứng đúng mặt trên, không mất máu; va ngang mất máu. |
| Dash qua `slideBar` | **PASS** | Đi bộ vào: −1 máu; dash: không mất máu, qua được. (Màn 2 dùng `slideBar`, không dùng `reedCurtain`.) |
| Trang màn 3 hiện đủ 3 phần thưởng và điểm | **PASS** | |
| Điện thoại dọc/ngang: panel đọc và bấm được | **PASS** (giả lập) | Dọc 375×812: canvas chỉ cao 205 px nên hộp thoại thành bảng nổi ở đáy, nút đáp án ≥ 50 px, không cuộn ngang. Ngang 812×375: canvas cao 227 px, hộp cao 295 px → cuộn một đoạn trong panel. **Cần thử trên máy thật.** |
| Hồi quy: màn 1 → 2 → trang màn 3 ba lượt, không lỗi console | **PASS** (mô phỏng) | 3/3 lượt: màn 1 thắng, màn 2 thắng (có lượt chọn sai), màn 3 hiện đúng điểm + 3 phần thưởng; 0 lỗi, console không lỗi. |
| Chặn truy cập / route | **PASS** | `/2` không có tiến trình → về màn 1. Route 1/2/3 trả 200 với `data-level` 1/2/3; `?layout=p2` vẫn chạy (6 vật cản + hố, không NPC). `pytest` skip (không có DB test). |

Hai lỗi phát hiện và sửa trong lúc test: (1) nền panel mờ + hộp nằm đè dải mặt đất làm không thấy NPC phát `talk` → đưa hộp lên trên, bỏ lớp mờ; (2) thông báo đầu màn đứng yên sau hộp thoại vì game dừng → ẩn thông báo khi mở hội thoại.

### Text đã sửa so với bản cũ (vị trí | cũ | mới)

| Vị trí | Cũ | Mới |
|---|---|---|
| Nội dung màn 2 | — | Nguyên văn mục 5 (không sửa chữ). Tên người nói ở tiêu đề khung nên câu thoại bỏ tiền tố “Thi Sách: ” và cặp ngoặc kép bao ngoài; danh hiệu lấy từ tiêu đề mục (“Hào trưởng Chu Diên”, “Nữ tướng vùng biển An Biên”, “Em gái, cánh tay phải”). |
| Nhãn giao diện mới (không phải nội dung lịch sử) | — | “Câu hỏi”, “Gợi ý: …”, “Vì sao đúng”, “Phần thưởng · +N điểm”, “Tiếp ▸”, “Đóng”, số thứ tự “1. / 2. / 3.” trước đáp án. |
| Panel thắng màn 2 | — | “Hoàn thành Màn 2: Chiêu mộ hiền tài” / “Bạn đã gặp đủ 3 người tài và đạt N điểm.” / nút “Sang Màn 3”. |
| Giới thiệu đầu màn 2 | trang giữ chỗ | “Màn 2: Chiêu mộ hiền tài” (tiêu đề panel bắt đầu + thông báo đầu màn). |

### Vấn đề asset

- Không có asset lỗi mới. NPC 48×48 và chân dung 64×64 hiển thị đúng hướng (NPC lật quay về người chơi), tỉ lệ khớp nhân vật chính.
- `NPC_TRUNG_NHI.run`/`attack_01` được tải cùng NPC nhưng chưa dùng (dành cho “Bóng Trưng Nhị” ở màn 3).

### Câu hỏi cho team

1. Ở điện thoại ngang, hộp câu hỏi phải cuộn một đoạn ngắn (canvas chỉ cao ~227 px). Chấp nhận, hay muốn thu gọn (ví dụ ẩn danh hiệu NPC ở bước câu hỏi)?
2. Màn 2 dùng `slideBar` làm vật cản bắt buộc dash (task cho chọn `reedCurtain` hoặc `slideBar`). Có muốn đổi/thêm `reedCurtain` không?
3. Phần thưởng hiện chỉ được ghi nhận; câu mô tả phần thưởng nhắc phím K/L — cơ chế làm ở task màn 3.
