# REPORT TT-INT-01 — Canvas pixel 480×270 & sprite 8-bit

Kế hoạch và quyết định của team: [INTEGRATION_PLAN_TT.md](INTEGRATION_PLAN_TT.md) (k = 0.6).

## Phase 1 — 25/09/2026

Trạng thái: **PASS (tự động) — chờ người chơi thử duyệt.** Chưa sang Phase 2.

### File đã sửa (file | mục đích)
| File | Mục đích |
|---|---|
| `frontend/static/js/levels/trung-trac/config.js` | `LOGICAL_W/H` = 480×270 (một chỗ duy nhất); quy đổi mọi hằng số không gian theo k = 0.6; backdrop `sky` phủ 270, `foreground` cao 216; `SPRITE_8BIT_ROOT`, `SPRITE_MANIFEST_FILE` |
| `.../geometry.js` | overhead obstacle `−77/34` → `−46/20`; `fireRange` mặc định 430 → 258 |
| `.../state.js` | quy đổi toạ độ/kích thước/tốc độ trong `OBSTACLE_GROUPS`, `JITTER`, player, boss, sách, `finishX` |
| `.../physics.js` | quy đổi knockback, respawn, attackBox, platform tolerance, clamp, mốc câu hỏi/nghỉ chân/cốt truyện, ngưỡng rơi, hitbox sách, điểm bắn |
| `.../render.js` | canvas logic 480×270; `fitCanvas()` letterbox bội số nguyên (scale lẻ chỉ khi vùng trống < 480×270); smoothing chỉ bật cho nền + landmark; nhân vật vẽ hộp placeholder theo hitbox (bỏ `<div>` GIF); lớp debug F2; hằng số vẽ quy đổi theo k |
| `.../input.js` | cờ `debug` + phím F2 |
| `.../assets.js` | `loadSpriteManifest()` (fetch manifest) |
| `.../main.js` | gọi `fitCanvas` lúc tải + `resize`/`orientationchange`; `?viewer=1` nạp `viewer.js` thay vì chạy màn |
| `.../viewer.js` (**mới**) | chế độ xem sprite: asset → animation theo manifest, ×1/×3/×4, lưới pixel, baseline, pivot, đánh dấu `hit_frame`, cả strip bên dưới. Tách module vì không liên quan gameplay và chỉ nạp khi cần |
| `frontend/templates/gameplay/levels/trung-trac.html` | canvas `width=480 height=270` |
| `frontend/static/css/levels/trung-trac.css` | khung (HUD + canvas + nút cảm ứng) rộng đúng bằng canvas hiển thị (`--stage-w/--stage-h`), căn giữa, viền letterbox; bỏ `aspect-ratio 896/360`; panel `overflow: auto` cho canvas thấp |
| `frontend/static/assets/images/sprites-8bit/**` (**chép**) | 76 strip + `manifest_tt.json` từ `assets/sprites/`, giữ cấu trúc `<category>/<ID>/<file>.png`. Không sửa ảnh nào, không chép `raw/frames/meta/preview` |

Không sửa ngoài OWNED FILES của Phase 1. Không đổi ID/animation/frame nào của bộ sprite.

### Bảng quy đổi (hằng số | cũ | mới)
Áp dụng đúng bảng ở [INTEGRATION_PLAN_TT.md §4](INTEGRATION_PLAN_TT.md). Tóm tắt các giá trị chính:

| Hằng số | Cũ | Mới |
|---|---|---|
| Canvas logic | 896×360 | 480×270 |
| CHUNK_W / world | 1280 / 15360 | 768 / 9216 |
| GROUND_Y (TOP + GRASS_OFFSET) | 324 (290+34) | 248 (228+20) |
| MOVE_SPEED / GRAVITY / JUMP_FORCE / DASH_SPEED | 280 / 2200 / 780 / 720 | 168 / 1320 / 468 / 432 |
| Player hitbox | 42×70 | 25×42 |
| PROJECTILE_SPEED / MAX_RANGE | 330 / 460 | 198 / 276 |
| fireRange mặc định / lính gác | 430 / 400 | 258 / 240 |
| finishX | 15110 | 9066 |
Hằng số thời gian (DASH_TIME, cooldown, fireInterval, HURT_ANIMATION_TIME, THROWER_ANIMATIONS) giữ nguyên.

### Kết quả test (test | PASS/FAIL | ghi chú)
Đo bằng mô phỏng trong trình duyệt: gọi thẳng `update(1/120)` của `physics.js` (cùng module đang chạy trong trang), so với bản cũ tính bằng cùng phương pháp tích phân.

| Test | Kết quả | Ghi chú |
|---|---|---|
| Độ cao nhảy so với vật cản | PASS | mới 81.0 px = cũ 135.0 × 0.6; thời gian trên không 0.708 s = cũ. Tỉ lệ độ cao nhảy / cao vật cản (23 px) = 3.5, giống bản cũ (135/39) |
| Nhảy qua `stoneBlock` / đứng lên trên được | PASS | qua được, không mất máu, đáp trên đỉnh khối đá |
| Nhảy qua `fallenBranch` | PASS | không mất máu |
| Khoảng dash | PASS | 129.6 px = cũ 216 × 0.6 |
| Vượt `reedCurtain` bằng dash | PASS | máu 5/5. Đối chứng: đi bộ qua thì mất 1 máu (5 → 4) |
| Thời gian đi hết màn | PASS | 53.47 s giữ phím phải (bản cũ tính 53.46 s); mốc câu hỏi lịch sử hiện ở giây 33.36 = bản cũ |
| Vị trí rơi của sách | PASS | 3 lượt: nhặt đủ 5/5 sách bằng nhảy tại chỗ; sách cao nhất (−87) nằm trong tầm với đỉnh nhảy |
| Hazard kích hoạt đúng lúc | PASS | điều kiện kích hoạt (`triggerX`, `triggerDistance`, `fireRange`, báo động) tính theo toạ độ thế giới đã nhân cùng k, tốc độ cũng nhân k → thời điểm kích hoạt/va chạm không đổi. 3 lượt xáo ngẫu nhiên: mọi roller, bẫy, thrower, báo động → kỵ binh đều kích hoạt |
| Chơi hết màn (3 lượt, thứ tự xáo ngẫu nhiên) | PASS | thắng cả 3 lượt; boss chặn ở đích như cũ; không lỗi console |
| Letterbox 1280×720 | PASS | ×2 = 960×540, HUD cùng bề rộng và thẳng mép canvas |
| Điện thoại dọc 375×812 (DPR 2) | PASS | scale lẻ 0.75 → 359×202, nút cảm ứng nằm trong bề rộng canvas |
| Điện thoại ngang 812×375 | PASS | scale lẻ 0.83 → 396×223, không cuộn trang |
| F2 debug | PASS | hitbox, pivot, nhãn animation/ô, vạch GROUND_Y, toạ độ camera |
| Viewer `?viewer=1` | PASS | đủ asset/animation trong manifest; ×1/×3/×4; `hit_frame` 4 của `EN_HAN_TAXMAN.throw` rơi đúng ô vung tay |
| `pytest tests` | SKIP | 1 skipped (thiếu `SUTA_TEST_DATABASE_URL`, không liên quan) |

**Chưa có:** buổi người chơi thử bằng tay để xác nhận cảm giác — đây là bước duyệt của gate.

### Khác biệt cảm giác chơi so với bản cũ
- Tầm nhìn tính theo px cũ: **800×450** thay vì 896×360. Bề ngang hẹp hơn 11%, phía trước nhân vật thấy 528 thay vì 591 px cũ; phía trên thấy thêm 90 px cũ (là trời).
- Bản cũ hổ xuất hiện sát mép phải khi kích hoạt; bản mới cũng vậy (tâm hổ ở x=500/480, tức vừa khuất mép, chạy vào ngay).
- Phím bấm và nhịp gameplay không đổi. Sai số làm tròn tốc độ < 0.5%.
- Nhân vật Phase 1 là hộp màu (đỏ đậm đứng, đỏ chạy, nâu nhảy, xanh dash, vàng đánh, đỏ nhạt trúng đòn) kèm đầu quay theo hướng mặt, có vạch kiếm dài đúng bằng tầm đánh.

### Vấn đề asset (asset | animation | mô tả | NORMALIZE/NEED_REDRAW)
| Asset | Animation | Mô tả | Đề xuất |
|---|---|---|---|
| Ảnh vật cản tĩnh cũ (`obstacles/*.png`), strip hazard cũ, `items/book.png` | — | ảnh lớn (350–2700 px) vẽ thu còn 25–105 px bằng nearest-neighbor → hơi răng cưa. Task card chỉ cho bật smoothing ở lớp nền nên giữ nguyên | Hazard/đạn cũ được thay ở Phase 3. Vật cản tĩnh + sách: `NEED_REDRAW` sang pixel art 8-bit (TODO_MAP) |
| `backdrops/chapter1/sky.png` | — | kéo cao 270 để phủ phần trời dư (khung 16:9) | TODO_MAP: vẽ lại nền đúng tỉ lệ |

Bộ sprite 8-bit mới: không phát hiện lỗi (kích thước khớp manifest 100%).

### Yêu cầu vẽ thêm cho Codex
- `PLAYER_TRUNG_TRAC` `dash` (TODO_MISSING, dùng ở Phase 2): thiếu hẳn trong manifest.
- Nền map + vật cản tĩnh + sách theo phong cách 8-bit ở tỉ lệ canvas 480×270 (TODO_MAP).

### TODO_MISSING / TODO_MAP
- TODO_MISSING: `PLAYER_TRUNG_TRAC.dash`.
- TODO_MAP: `sky`, `foreground`, `ground.png`, `finish-gate.png`, obstacles tĩnh, `book.png` đang là ảnh cũ vẽ thu k = 0.6.

### Câu hỏi cho team
1. Chữ đánh số chunk trên canvas (9 px) đọc được không, hay chuyển sang HUD DOM?
2. Điện thoại ngang: canvas chỉ còn 396×223 vì HUD + hàng nút cảm ứng chiếm chỗ. Có muốn phủ nút cảm ứng lên trên canvas ở chế độ ngang không? Việc này nằm ngoài Phase 1.
3. Code có sẵn một chỗ lệch: cổng đích vẽ tại 9090 trong khi `finishX` = 9066. Độ lệch này có từ bản cũ (15150 và 15110), tôi giữ nguyên khi quy đổi, chưa sửa.

## Phase 2 — 25/09/2026

Trạng thái: **PASS, còn 1 điểm mâu thuẫn cần team xác nhận** (dash "bất tử", xem dưới). Chờ người chơi thử duyệt. Chưa sang Phase 3.

### File đã sửa (file | mục đích)
| File | Mục đích |
|---|---|
| `.../animation.js` (**mới**) | registry manifest (`registerManifest`, `getAsset`, `getAnimMeta`) + hàm animation theo entity: `createAnim`, `setAnim` (không khởi động lại nếu trùng tên), `tickAnim`, `frameIndex` (lặp / dừng ô cuối, `duration` tuỳ chọn), `hitTime` (`hit_frame` đếm từ 1). Tách module vì physics (thời điểm gây sát thương) và render (ô cần vẽ) cùng dùng, tránh phụ thuộc vòng |
| `.../config.js` | bỏ hằng số GIF (`PLAYER_SPRITE_HEIGHT`, `PLAYER_SPRITE_ANCHOR_X`, `PLAYER_ROOT_CANDIDATES`, `PLAYER_ANIMATION_FILES`); thêm `SPRITE_8BIT_IN_GAME`, `ATTACK_COOLDOWN`/`ATTACK_ACTIVE_TIME`, `PLAYER_SPRITE_ID`, `PLAYER_ANIMATIONS` (trạng thái → animation manifest), `PLAYER_JUMP_APEX_VY`, `PLAYER_DASH_TRAIL` |
| `.../assets.js` | ngừng tải GIF; tải manifest khi load màn, đăng ký vào `animation.js`, tải mọi strip của `PLAYER_TRUNG_TRAC` vào `images.sprites8` |
| `.../physics.js` | `startAttack()` chỉ bắt đầu cú vung; `updateAttack()` gây sát thương trong cửa sổ `[hit_frame, +0.18s)`, mỗi mục tiêu trúng 1 lần/cú (`attackHits`); `updatePlayerAnimation()` chọn trạng thái theo ưu tiên `hurt > dash > attack > jump > run > idle`; `endGame(false)` ghi `player.deathTime` |
| `.../state.js` | player: bỏ `attackTimer`, thêm `attackHits`, `anim`, `deathTime` |
| `.../render.js` | `drawPlayer()` vẽ strip x1, pivot bottom-center tại chân hitbox, lật quanh pivot khi quay trái; chọn ô theo `PLAYER_ANIMATIONS`; dash có bóng mờ; thua thì phát `death` 1 lần; thiếu manifest/strip thì quay về hộp placeholder |
| `.../main.js` | thông báo thiếu asset theo manifest/strip 8-bit thay cho GIF |
| `templates/.../trung-trac.html`, `css/levels/trung-trac.css` | bỏ `<div id="playerSprite">` và CSS `.player-sprite` |

Giữ nguyên: 6 GIF trong `characters/trung-trac/` và `tools/normalize_player_gifs.py` (chỉ ngừng dùng). Không đổi ID, animation, số frame, `hit_frame`.

### Ánh xạ trạng thái → animation (đã cài)
| Trạng thái | Animation | Cách chọn ô |
|---|---|---|
| idle | `idle` 4f | lặp, fps manifest (6) |
| run | `run` 6f | lặp, fps manifest (12) |
| jump | `jump` 3f | theo vận tốc dọc: vy < −90 ô 1, \|vy\| ≤ 90 ô 2, vy > 90 ô 3 (DESIGN_BASELINE) |
| attack | `attack_01` 6f | trải trên `attackCooldown` 0.36 s → **16.7 fps** (manifest ghi 14). Cửa sổ gây sát thương bắt đầu ở ô 3 = **0.12 s** sau khi bấm, dài 0.18 s (tới 0.30 s). Đo thực tế ở 120 Hz: trúng lúc 0.125–0.133 s (lệch ≤ 1 frame game) |
| hurt | `hurt` 2f | fps 8 (0.25 s), đứng ở ô cuối tới hết `hurtTimer` 0.45 s |
| dash | **TODO_MISSING** | ô cuối của `run` + 3 bóng mờ phía sau. Chọn `run` thay vì `attack_01` để không lẫn với đòn chém |
| thua | `death` 5f | phát 1 lần (fps 8) từ lúc `endGame(false)`, dừng ở ô cuối |

### Kết quả test (test | PASS/FAIL | ghi chú)
Đo bằng mô phỏng `update(1/120)` trong trình duyệt + chụp màn hình từng tư thế.

| Test | Kết quả | Ghi chú |
|---|---|---|
| Đổi qua lại mọi trạng thái | PASS | chuỗi đo được: run → jump → run → attack → run → dash → run → idle → hurt → idle, đổi đúng lúc |
| Chân không nhảy lệch khi đổi animation | PASS | mọi strip đứng đất (idle/run/attack/hurt/death) có hàng chân = 46 (= frame_h − 2), vẽ neo đúng mép cỏ `GROUND_Y`; ảnh chụp cả 12 tư thế trên cùng baseline. Riêng các ô `jump` có chân cao hơn baseline 1–5 px, đúng thiết kế tư thế trên không |
| Đánh liên tục không reset giữa chừng | PASS | 5 cú liên tiếp trong 1.5 s, 0 lần tụt ô giữa cú; mỗi cú đủ ô 1→6, tăng dần |
| Mỗi đòn trúng mỗi mục tiêu 1 lần | PASS | 1 cú vào 1 mục tiêu: máu 5 → 4. 2 mục tiêu trong tầm: mỗi con mất đúng 1 máu |
| Dash qua `reedCurtain` | PASS | máu 5/5 |
| Đứng lên khối đá (platform) với hitbox 25×42 | PASS | đáp trên đỉnh, không mất máu |
| Lật trái/phải | PASS | ảnh chụp idle/run/attack/dash hai hướng: quay đúng hướng chạy, lật quanh pivot (không trượt ngang) |
| `death` khi thua | PASS | phát ô 1→5 rồi đứng ở 5/5 |
| Chơi hết màn (3 lượt, có chém) | PASS | thắng cả 3 lượt, 5/5 sách, hạ boss bằng 5 đòn; không lỗi console |
| **Dash "vẫn bất tử"** | **MÂU THUẪN — không phải hồi quy** | Cả code cũ (HEAD) lẫn code mới: dash chỉ bỏ qua va chạm với vật cản `requiresDash` (`reedCurtain`, `slideBar`). Dash vào lính/hazard/đạn **vẫn mất máu** (đã đo: đang dash va lính canh → trừ máu). CLAUDE.md và task card nói dash "bất tử tạm thời". Không tự sửa — cần team chọn (câu hỏi 1) |

### Khác biệt cảm giác chơi so với bản cũ
- **Đòn chém trễ 0.12 s**: sát thương dời về ô 3 của animation (team đã chấp nhận). AttackBox giờ đi theo vị trí nhân vật suốt cửa sổ 0.18 s, trước đây chỉ xét một lần lúc bấm. Nếu vừa chạy vừa chém thì tầm với xa hơn khoảng 0–30 px.
- Nhân vật trông nhỏ hơn GIF cũ: GIF cũ cao 86 px hệ cũ, tức ~52 px logic; sprite mới cao 44 px. Hitbox 25×42 không đổi so với Phase 1.
- Trúng đòn giữa lúc đang vung: animation chuyển sang `hurt` (ưu tiên cao hơn), nhưng cú vung vẫn gây sát thương ở ô 3 như bình thường. Bản cũ gây sát thương ngay lúc bấm nên không có tình huống này.

### Vấn đề asset
| Asset | Animation | Mô tả | Đề xuất |
|---|---|---|---|
| PLAYER_TRUNG_TRAC | attack_01 | fps manifest 14 (0.43 s) ≠ `attackCooldown` 0.36 s → phát nhanh hơn (16.7 fps) theo yêu cầu task card | Không cần sửa ảnh |
| PLAYER_TRUNG_TRAC | (dash) | thiếu hẳn | xem yêu cầu vẽ |

### Yêu cầu vẽ thêm cho Codex
- **`PLAYER_TRUNG_TRAC` `dash`**: khung 48×48, pivot bottom-center, baseline hàng 46, quay phải. Tư thế lướt thấp người về trước, tóc/vạt áo bay ngược ra sau. Đề xuất 3–4 ô, `loop: true`. Nên cao không quá ~40 px vì hitbox 42 px chui dưới vật cản `overhead`.

### TODO_MISSING / TODO_MAP
- TODO_MISSING: `PLAYER_TRUNG_TRAC.dash` (đang tạm dùng ô cuối `run` + bóng mờ).
- TODO_MAP: như Phase 1.

### Câu hỏi cho team
1. **Dash có bất tử thật không?** Code hiện tại (cả trước tích hợp) chỉ cho dash xuyên vật cản `overhead`; lính, hazard, đạn vẫn gây sát thương khi dash. Chọn: (a) giữ như code hiện tại và sửa CLAUDE.md/task card cho khớp, hay (b) cho dash bất tử thật (thêm cơ chế — ngoài phạm vi TT-INT-01, cần task riêng)?
2. Tốc độ `attack_01` 16.7 fps (theo cooldown) thay vì 14 fps theo manifest — chấp nhận?

### Phase 2 — bổ sung (25/09/2026, sau phản hồi chơi thử)
| File | Thay đổi |
|---|---|
| `.../config.js` | `dash` dùng strip `dash` mới (4 ô, 16 fps, không lặp → đứng ở ô cuối tới hết `DASH_TIME` 0.30 s); bỏ bóng mờ tạm `PLAYER_DASH_TRAIL`. `attack` thêm `drawScale: 1.5` (tạm, xem dưới) |
| `.../render.js` | `drawSprite8()` nhận `scale` (pivot chân giữ nguyên); bỏ vẽ bóng mờ; `fitCanvas()` phủ kín vùng trống thay cho letterbox bội số nguyên |

**Dash:** Codex đã thêm `PLAYER_TRUNG_TRAC.dash` vào manifest; bản chép trong `sprites-8bit/` khớp bản gốc (đã so md5 toàn bộ strip). TODO_MISSING dash **đã đóng**.

**Đòn đánh nhỏ hơn các animation khác:**
- **Nguyên nhân:** lỗi asset, không phải tư thế cúi. Trong `attack_01` cả nhân vật được vẽ ở tỉ lệ nhỏ hơn, đầu cũng nhỏ theo: cao 28–30 px, còn idle/run/dash cao 44 px, tức nhỏ hơn khoảng 1.5 lần.
- **Cách xử lý tạm:** theo quy ước không sửa PNG, nên code vẽ `attack_01` phóng ×1.5 quanh pivot chân. Đây là DESIGN_BASELINE; ảnh chụp đối chiếu cho thấy người cùng cỡ với idle/run, chân vẫn ở mép cỏ.
- **Mặt trái:** hệ số 1.5 không nguyên nên khối pixel của đòn đánh hơi to và không đều so với các animation khác.
- **Việc cần làm:** Codex vẽ lại đúng tỉ lệ (dưới), khi đó xoá `drawScale`.

**Màn hình phủ kín (thay quyết định §9.7):**
- Canvas giờ phủ hết vùng trống, giữ tỉ lệ 16:9, cho phép scale lẻ ở mọi màn hình.
- Để pixel không méo khi scale lẻ: vẽ vào bộ đệm ở bội số nguyên N = ceil(scale × DPR) bằng nearest-neighbor, rồi để trình duyệt thu nhẹ về cỡ hiển thị. Khi scale trùng số nguyên thì dùng `pixelated`.
- Toạ độ vẽ vẫn là pixel logic 480×270 nhờ `setTransform`.
- Đo được:

| Cửa sổ | Trước | Sau |
|---|---|---|
| 1280×720 | 960×540 (×2) | **1084×610**, bộ đệm 1440×810; canvas + HUD + dòng hướng dẫn vừa khít 720 px, không cuộn |
| 375×812 dọc (DPR 2) | 359×202 | 359×202 (giới hạn bởi bề ngang), bộ đệm 960×540 |
| 812×375 ngang | 396×223 | 396×223 (giới hạn bởi HUD + nút cảm ứng) |

| Test hồi quy | Kết quả |
|---|---|
| Dash qua `reedCurtain` (phát ô dash 1→4) | PASS |
| Thời điểm gây sát thương (0.125–0.133 s), 1 máu/đòn | PASS |
| Chơi hết màn 3 lượt có chém | PASS (thắng cả 3, 5/5 sách) |
| Console | không lỗi |

**Vấn đề asset**
| Asset | Animation | Mô tả | Đề xuất |
|---|---|---|---|
| PLAYER_TRUNG_TRAC | attack_01 | nhân vật vẽ nhỏ hơn ~1.5 lần so với idle/run/dash/hurt (cao 28–30 px so với 44 px, đầu nhỏ theo). Đang bù tạm bằng `drawScale: 1.5` | **NEED_REDRAW**: vẽ lại cùng tỉ lệ thân với `idle`, khung 48×48 (hoặc rộng hơn nếu lưỡi kiếm vượt khung — cần team duyệt đổi `frame_w`), giữ 6 ô và `hit_frame` 3 |

**Câu hỏi thêm cho team:** trên màn 16:9 ngang, chiều cao là giới hạn: HUD phía trên cùng dòng hướng dẫn phía dưới chiếm khoảng 110 px. Có muốn đặt HUD và dòng hướng dẫn đè lên canvas để màn chơi chiếm trọn cửa sổ không? Nếu có, cần duyệt vì đổi bố cục HUD.


## Phase 3 — 25/09/2026

Trạng thái: **PASS**. Chờ người chơi thử duyệt. Còn mở từ Phase 2: câu hỏi dash "bất tử"; `attack_01` NEED_REDRAW.

### File đã sửa (file | mục đích)
| File | Mục đích |
|---|---|
| `.../config.js` | bỏ `OBSTACLE_STRIP_FILES`, `THROWER_ANIMATIONS`, `HAZARD_SPRITE_SIZES`, `PROJECTILE_SIZES`, `ITEM_STRIP_FILES` và các mục hazard trong `OBSTACLE_SPRITE_FILES` (ngừng tham chiếu, file ảnh giữ nguyên); thêm `HAZARD_SPRITES` (asset, hitbox, trạng thái → animation, `durations`, `alarmTime`, `muzzle`, `sink`, `corpse`), `ENEMY_SPRITES`, `PROJECTILE_SPRITES` mới; mở rộng `SPRITE_8BIT_IN_GAME` |
| `.../animation.js` | thêm `animLength()` |
| `.../geometry.js` | `makeHazard` dùng `HAZARD_SPRITES`, thêm `dying`, `facing` (hướng chạy cố định), `anim`; bỏ `drawW/drawH`, `sprungSprite`, `wreckSprite`, `animOffset`; bỏ `reskinHazard`, `actionStepAt`; `makeProjectile` dùng `PROJECTILE_SPRITES`, thêm `age` |
| `.../state.js` | trap dùng `spikePit`; `makeEnemy()` cho lính canh (22×40) và boss (90×80); bỏ `wreckSprite`/`animOffset` |
| `.../physics.js` | `breakHazard` → dying + `death`/`break` một lần (xe cống `corpse` nằm lại); ném/báo động theo manifest (`hitTime`, `animLength`); đạn sinh ở `muzzle`; `updateHazardAnimation`, `updateDyingHazard`, `updateEnemies` (anim + xoá sau khi chết xong); đạn tính `age` |
| `.../render.js` | bỏ `drawStripSprite`, `drawHazardArt`, `throwerFrame`, `drawPitShadow`; thêm `drawAnimated`, `drawPlaceholder`; `drawHazards`/`drawEnemies`/`drawProjectiles` vẽ sprite 8-bit ×1 theo pivot + đồng hồ riêng; `facingDirection` theo ảnh gốc quay phải |
| `.../assets.js`, `.../main.js` | ngừng tải strip cũ; thông báo thiếu asset theo sprite 8-bit |
| `assets/sprites/manifest_tt.json`, `sprites-8bit/manifest_tt.json` | **chỉ** đổi `status` → `IN_GAME` cho 13 asset đang dùng (script so JSON trước/sau: ngoài `status` không trường nào đổi) |
| `CLAUDE.md` | cập nhật Cấu trúc module, Cơ chế gameplay, Quy ước mở rộng, Tài liệu asset theo cách hiển thị + sprite mới; xoá mô tả lỗi thời (GIF nhân vật, `drawStripSprite` theo đồng hồ chung, `facing` mặc định `'left'`, `HAZARD_SPRITE_SIZES`, `groundLine`, `wreckSprite`, brief nằm ở `docs/`) |

### Ánh xạ đã cài
| Thực thể | Asset | Animation theo trạng thái | Hitbox (px logic) |
|---|---|---|---|
| Kiệu quan (roller, hp 0) | EN_HAN_PALANQUIN | `walk` | 76×44 |
| Hổ (roller) | EN_TIGER | `run`; `hurt`; `death` 1 lần | 48×24 |
| Xe cống (roller) | OB_TRIBUTE_CART | `roll`; `break` 1 lần → **nằm lại ở ô cuối**, vô hại | 48×38 |
| Kỵ binh (roller) | EN_HAN_CAVALRY | `gallop`; `hurt`; `death` | 56×48 |
| Lính thu thuế (thrower) | EN_HAN_TAXMAN | `idle`; `throw` trải 0.85 s, đạn ở ô 4; `hurt`; `death` | 20×40 |
| Lính gác tháp (thrower) | EN_HAN_WATCHTOWER | `idle`; `alarm` 1.1 s; `throw` 0.85 s, đạn ở ô 4; `hurt`; `death` | 22×36 |
| Tháp canh (prop) | PROP_WATCHTOWER | `idle` | — |
| Hố chông (trap) | TR_SPIKE_PIT | `hidden` → `reveal` 1 lần; chìm 3 px vào cỏ, bỏ `groundLine`/`pitLeft/Right`/nền tối vì ảnh mới là hố nông | 36×6 |
| Thuyền (boat, không vào màn) | EN_HAN_BOAT | `float`; `shoot` (đạn ở ô 4); `death` | 70×24 |
| Lính canh (enemy) | EN_HAN_GUARD | `idle`; `hurt`; `death` | 22×40 |
| Boss (enemy) | BOSS_TO_DINH_CHARIOT | `idle`; trúng đòn nháy mờ (asset không có `hurt`); hết máu `shield_break` 1 lần | 90×80 |
| Đạn lính thu thuế / lính gác / thuyền | PJ_COIN_POUCH / PJ_SPEAR / PJ_FIRE_ARROW | lặp theo tuổi viên đạn | 10×10 / 22×4 / 16×5 |

Hướng mặt: đã kiểm từng strip bằng ảnh ghép. **Mọi strip đều quay phải thật**, khớp manifest. Render: roller quay theo hướng chạy (giữ hướng cả khi đang chết), lính/boss quay về phía người chơi, tháp/bẫy giữ hướng gốc, đạn lật theo hướng bay.

### Kết quả test (test | PASS/FAIL | ghi chú)
Đo bằng mô phỏng `update(1/120)` trong trình duyệt, kèm ảnh chụp cảnh dựng sẵn mọi hazard/enemy/đạn.

| Test | Kết quả | Ghi chú |
|---|---|---|
| Chơi 3 lượt (thứ tự xáo ngẫu nhiên) | PASS | thắng cả 3, 5/5 sách, không lỗi console, không lỗi vẽ |
| Mỗi hazard kích hoạt / tấn công / chết đúng animation | PASS | đã thấy đủ trạng thái trong 3 lượt: `move`, `idle`, `throw`, `alarm`, `hurt`, `sprung`, `death`; lính canh/boss `idle`/`hurt`/`death` |
| Đạn sinh đúng frame vung tay | PASS | lính thu thuế và lính gác: đạn ra **0.433 s** sau khi bắt đầu ném (mục tiêu 0.425 s, ô 4/6 của 0.85 s; bản cũ 0.45 s); cả chuỗi 0.867 s (mục tiêu 0.85 s); lệch ≤ 1 frame game; đạn ở độ cao 32 px như bản cũ quy đổi |
| Báo động → kỵ binh | PASS | `alarm` kéo dài 1.10 s, kỵ binh kích hoạt ngay khi báo động |
| Hết máu: death 1 lần rồi xoá, tắt va chạm ngay | PASS | hổ/kỵ binh/lính canh xoá sau 0.49 s (4 hoặc 5 ô ở 8–10 fps = 0.5 s); boss sau 0.59 s (`shield_break` 0.6 s); boss được tính là đã hạ ngay khi hết máu; chạm xác đang chết không mất máu |
| Xe cống vỡ nằm lại | PASS | sau 3 s xe vẫn trong state, `harmful = false`, dừng ở ô cuối `break`, người chơi không mất máu |
| Bẫy `reveal` một lần | PASS | đồng hồ animation tăng đều, không phát lại; giẫm vào thì mất máu như cũ |
| Không animation nào reset mỗi frame | PASS | theo dõi mọi hazard/enemy suốt 3 lượt: **0** lần `time` tụt khi tên animation không đổi |
| Hồi quy Phase 1–2 | PASS | chạy lại cùng bộ mô phỏng, giữ nguyên kết quả |
| Viewer `?viewer=1` | PASS | không lỗi |

### Khác biệt cảm giác chơi so với bản cũ
- **Hitbox** đổi theo hình mới (DESIGN_BASELINE, bảng trên):
  - Lính canh 44×49 → 22×40 và lính thu thuế 28×47 → 20×40: hẹp hơn, dễ né hơn nhưng cũng khó chém trúng hơn một chút.
  - Boss 58×63 → 90×80, theo quyết định team: khó né hơn.
  - Hố chông 44×7 → 36×6.
- **Nhịp ném:** đạn ra sớm hơn khoảng 0.02 s so với bản cũ, thực tế không nhận ra.
- **Xác chết:** kẻ địch không còn biến mất tức thì mà phát animation chết khoảng 0.5 s, không còn va chạm.
- **Xác xe cống:** giờ là ô cuối của `break`, một đống xác thấp, thay cho ảnh `tribute_cart_broken.png`.
- **Cỡ vật thể trên màn:** vẽ đúng ×1 theo ảnh mới. Kiệu, hổ, kỵ binh nhỏ hơn hình cũ quy đổi một chút; boss to hơn nhiều.

### Vấn đề asset (asset | animation | mô tả | NORMALIZE/NEED_REDRAW)
| Asset | Animation | Mô tả | Đề xuất |
|---|---|---|---|
| EN_HAN_WATCHTOWER | throw | ô 4–6 vẽ nhân vật **nhỏ hẳn** so với ô 1–3 và `idle` (giống lỗi `attack_01`), nên sau khi phóng giáo người lính co lại | **NEED_REDRAW**: giữ tỉ lệ thân như `idle` cho cả 6 ô |
| PLAYER_TRUNG_TRAC | attack_01 | (từ Phase 2) nhỏ hơn ~1.5 lần, đang bù tạm `drawScale: 1.5` | NEED_REDRAW |
| TR_SPIKE_PIT | hidden | chỉ là túm cỏ 44×6, gần như không nhìn thấy trên nền cỏ. Là bẫy nên có thể chủ ý | Team xác nhận |
| BOSS_TO_DINH_CHARIOT | — | không có `hurt`/`death`: trúng đòn dùng nháy mờ, chết dùng `shield_break` | Nếu cần, vẽ thêm `hurt`/`death` cho task boss 3 giai đoạn |

### Yêu cầu vẽ thêm cho Codex
- Vẽ lại `EN_HAN_WATCHTOWER.throw` ô 4–6 và `PLAYER_TRUNG_TRAC.attack_01` đúng tỉ lệ thân.

### TODO_MISSING / TODO_MAP
- TODO_MISSING: không còn. `dash` đã có từ bản bổ sung Phase 2.
- TODO_MAP: nền, vật cản tĩnh, sách, cổng đích vẫn là ảnh cũ vẽ thu k = 0.6.

### Câu hỏi cho team
1. (Còn mở từ Phase 2) Dash có bất tử thật với lính/hazard/đạn không? CLAUDE.md đã được sửa để mô tả đúng code hiện tại và ghi rõ đang chờ quyết định.
2. `EN_HAN_PALANQUIN` trước đó là `NORMALIZED`, chưa `QA_PASS`. Theo task card tôi đã đổi thành `IN_GAME` vì team cho phép dùng. Nếu cần QA riêng thì trả lại trạng thái.
3. Hitbox mới của lính canh (22×40) hẹp hơn nhiều so với bản cũ (44×49). Giữ theo hình, hay nới rộng cho dễ chém?

### Bổ sung sau Phase 3 — dash bất tử (25/09/2026)
Team quyết định: **dash bất tử thật với lính, hazard và đạn** (đóng câu hỏi 1 của Phase 2/3).

| File | Thay đổi |
|---|---|
| `.../physics.js` | thêm `playerImmune(p)` = `invulnerable > 0 \|\| dashing`, dùng cho va chạm hazard, đạn, lính/boss. Đạn bay xuyên qua người đang dash (không tan). Vật cản tĩnh giữ nguyên: dash chỉ xuyên loại `requiresDash`, va ngang khối đá khi dash vẫn mất máu |
| `CLAUDE.md` | mô tả dash theo hành vi mới |

| Test | Kết quả |
|---|---|
| Dash xuyên lính canh / hổ đang lao / hố chông đã bật / túi tiền đang bay | PASS: 5/5 máu, không trúng cả trong lẫn ngay sau cú lướt |
| Đối chứng: đi bộ vào lính canh | PASS: mất 1 máu như cũ |
| Dash qua `reedCurtain` | PASS: 5/5 máu |
| Dash va ngang `stoneBlock` | mất 1 máu, đúng như cũ (ngoài phạm vi quyết định) |
| Chơi hết màn 3 lượt | PASS: thắng cả 3, không lỗi console |

Lưu ý: bất tử chỉ kéo dài trong lúc dash (0.30 s). Nếu cú lướt kết thúc khi người chơi còn chồng lên lính/hazard thì frame kế tiếp vẫn mất máu như bình thường.

## Đóng task — 25/09/2026

Trạng thái: **HOÀN THÀNH.**
- Người chơi thử bằng tay: **ổn**. Duyệt gate Phase 1–3.
- `EN_HAN_PALANQUIN` giữ `IN_GAME` (team chấp nhận dù trước đó chưa QA_PASS).
- Hitbox lính canh 22×40: **giữ**.
- Dash bất tử với lính/hazard/đạn: đã cài (mục bổ sung ở trên).
- Commit: team tự thực hiện.

Việc còn lại, ngoài phạm vi TT-INT-01:
- TODO_MAP: nền, vật cản tĩnh, sách, cổng đích vẽ lại theo brief môi trường.
- Boss 3 giai đoạn: task riêng.
