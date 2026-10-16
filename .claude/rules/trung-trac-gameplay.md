---
paths:
  - "frontend/static/js/levels/trung-trac/**"
  - "frontend/templates/gameplay/levels/**"
  - "frontend/static/css/levels/**"
---

# Màn chơi chương Trưng Trắc

Áp dụng khi làm việc với module `frontend/static/js/levels/trung-trac/` và template `gameplay/levels/trung-trac.html` (dùng chung 3 màn, kế thừa `gameplay/base.html`). Hợp đồng asset (manifest, pivot, density) ở rule `assets-32bit.md`. Lý do quyết định: report trong `docs/archive/` theo mã task ghi trong ngoặc.

Từ ENGINE-01, mọi cơ chế dùng chung (người chơi nam/nữ, vật lý, hazard, lính canh/quân cảm tử, đạn, câu hỏi, gặp NPC, HUD, hội thoại, âm thanh, tiến trình, render) nằm ở **engine** `js/engine/` — xem rule `engine.md`. Thư mục chương chỉ chứa phần riêng Trưng Trắc. Mô tả cơ chế bên dưới vẫn đúng; tên hàm chung giờ nằm trong engine.

## Module chương (`js/levels/trung-trac/`)

- `main.js` — 3 dòng: `boot(TRUNG_TRAC)` (engine/main.js).
- `chapter.js` — object định nghĩa chương `TRUNG_TRAC` (hợp đồng: `engine/chapter.js`): asset, bảng sprite, câu hỏi/thoại, phần thưởng, âm thanh, khe kỹ năng, `enemyKinds`, `hooks`, và **`levels`** = thông số từng màn (độ dài, vùng, đích, cổng, sprite nạp, `content`, `events`, `update`, `cutscene`, `guide`, thông báo đầu màn, layout thử, câu tổng kết). Engine đọc màn đang chơi qua `LEVEL.*`, **không** dùng thẳng `ZONES`/`LEVEL_CHUNKS`/`FINISH_GATE` (đó chỉ là số của màn 1).
- `config.js` — hằng số thuần RIÊNG chương: asset path (`SPRITE_ROOT`, `MAP_ROOT`, `TILES`, `FAR_HILLS`, `PORTRAITS`), `LEVEL_SPRITES` (sprite mỗi màn nạp), `LEVEL_URLS`, vùng cảnh/đích/cổng từng màn, bảng ánh xạ (`OBSTACLE_TYPES`, `HAZARD_SPRITES`, `ENEMY_SPRITES` + `GUARD`/`RUSHER`, `PROJECTILE_SPRITES`, `NPC_SPRITES`), `MINIBOSS`, `ITEM` (bình thư), `QUIZ` (vị trí mốc), `ARENA`, `BOSS_TD`, `WAVES`, `WALL_ARROWS`, `SKILLS`, `REWARD_NAMES`, `BOSS_TEXT`, `TEXT` (câu thông báo engine dùng). Hằng số chung (vật lý, người chơi, NPC...) ở `engine/config.js`.
- `level1.js` — `OBSTACLE_GROUPS`, xáo vật cản, mini-boss, layout thử P2, `level1Content()`, `level1Events()` (nghỉ chân, dòng cốt truyện).
- `level2.js` — `LEVEL2_TERRAIN`, `level2Content()`, `level2Events()` (cốt truyện Thi Sách).
- `level3.js` — `level3Content()`, dựng quân đấu trường (`makeArenaGuard`, `makeRusher`, `spawnArenaEnemy`, `makeArenaSpawner`), chiến xa, Tô Định đi bộ, cột đá.
- `boss.js` — trận boss: chiến xa + hũ dầu + lửa + cột đá, `updateBattle()` (= `LEVEL.update`), giai đoạn 2–3, mưa tên trên thành, `updateCutscene()` (= `LEVEL.cutscene`), `ENEMY_KINDS` (chariot, foot), ô boss HUD, hộp F2.
- `skills.js` — 3 phần thưởng màn 2 thành kỹ năng (`TT_SKILLS` gắn vào khe kỹ năng engine).
- `render-extras.js` — lớp vẽ riêng (`DRAW_LAYERS`): Tô Định sau xác xe, hũ dầu, bóng Trưng Nhị, lửa, mưa tên.
- `audio-data.js` — nhạc nền 3 màn (`MUSIC_FILES` mp3 + bản tổng hợp dự phòng) + tiếng boss/kỹ năng.
- `dialogue-data.js` — thoại/câu hỏi NPC màn 2 + cutscene/panel kết chương màn 3, **chép nguyên văn** task card TT-NPC-01 / TT-BOSS-01 — Source of Truth, không tự sửa. Đáp án đầu tiên là đáp án đúng.
- `questions-data.js` — bộ câu hỏi chương (`QUESTIONS`, `LEVEL1_QUESTION_POOL`, `NPC_QUESTION_POOLS`), sinh bằng script từ Excel của team — Source of Truth, không tự sửa.

Tham số URL (engine): `?viewer=1` (xem sprite), `?debug=1` (vào thẳng màn, dữ liệu giả, đủ phần thưởng), `?layout=p2` (màn 1: thử 6 vật cản P2 trên nền phẳng), `?layout=skills` (màn 3: thử kỹ năng với bao cát + quân sinh lặp, không boss).

Thêm nội dung (vật cản/hazard/item/dữ liệu màn): sửa `levelN.js` + `config.js` của chương. Hành vi riêng chương (boss, kỹ năng): `boss.js`/`skills.js` gắn qua hook; hành vi dùng được cho chương khác thì đưa vào engine (rule `engine.md`). Hiệu ứng vẽ riêng: `render-extras.js`.

**Thêm màn**: mục mới trong `levels` của `chapter.js` + `levelN.js` (`content`, `events`), route truyền `level_id`/`title` (`backend/routes/pages.py`), URL vào `LEVEL_URLS`, id level mới trong migration + `VALID_LEVEL_IDS`. `requireLevel()` của engine tự đòi qua mọi màn trước.

## Hiển thị (TT-INT-01)

- Canvas logic cao **270**, rộng **`VIEW_W`** (giãn theo tỉ lệ cửa sổ, kẹp [`LOGICAL_W` 480, `MAX_VIEW_W` 640]; `export let`, đặt qua `setViewWidth()`). Code mới **không được giả định khung nhìn rộng 480** — luôn dùng `VIEW_W`.
- Mọi toạ độ/kích thước/tốc độ là **pixel logic**. `GROUND_Y` = 248 (khớp `stage.ground_y` của `maps_tt.json`). Toạ độ thế giới qua `worldX(chunk, localX)`, chunk 768px, đếm từ 1.
- `fitCanvas()`: vẽ vào bộ đệm bội số nguyên N = ceil(scale × DPR) bằng nearest-neighbor + `setTransform(N)`, trình duyệt thu về cỡ hiển thị; cỡ hiển thị làm tròn xuống để không sinh thanh cuộn. Toạ độ vẽ làm tròn sau khi trừ camera.
- HUD, panel, nút cảm ứng là DOM nằm trong khung đúng bằng canvas (`--stage-w/--stage-h`).

## Map, địa hình, hố

- **Map (TT-MAP-01)**: thứ tự vẽ trời (parallax 0.05) → đồi xa (0.2, tắt dần dưới trời giông — `FAR_HILLS.hiddenUnderSky`) → lớp giữa theo vùng (0.5, đáy ở `GROUND_Y`) → mặt đất → decor → cổng → vật cản/nhân vật. Màn 1 có 5 vùng (`ZONES`: làng → đồng lúa → rừng → bến sông → ngoài thành Luy Lâu); trời + lớp giữa hoà trong `ZONE_BLEND_WIDTH` trước mỗi ranh giới (lớp giữa hoà qua canvas phụ `'lighter'` để không thủng). Lặp ngang theo chiều rộng logic, offset làm tròn trước khi lấy modulo. Mặt đất dùng **chung 1 bộ tile cho mọi vùng và mọi màn** (`TILES.groundRegion` = `'Z1'`), chỉ tile đầu tiên mỗi vai trò; decor chọn tất định theo chỉ số cột. Parallax/vùng/mật độ `DESIGN_BASELINE`.
- **Địa hình (TT-TERRAIN-01)**: soạn bằng **lưới chữ** 48 ô × 16px mỗi chunk — `'#'` đất, `'.'` trống, hàng cuối = `GROUND_Y`, `'.'` ở hàng cuối = hố. Chỉ có bậc (đất liền từ đáy lên), **không bục lơ lửng**. `null` = phẳng (màn 3, layout thử). Màn 1: địa hình đi theo nhóm vật cản (`terrain` trong `OBSTACLE_GROUPS`); màn 2: `LEVEL2_TERRAIN`. Sườn bậc chặn ngang, không mất máu; lính tuần tra trong đoạn phẳng; roller chạy theo bậc; đạn chạm sườn thì tan. Cảnh báo: vật/bia/NPC vắt qua bậc (`checkTerrainFootprints()`), bậc chênh > `TERRAIN_MAX_STEP` (3 ô ≈ tầm nhảy). Vẽ bằng bộ tile ghép `TILESET_TT_TERRAIN` (12 vai trò, `terrainTileRole()` chọn theo cột đó + 2 cột bên; thiếu vai trò lùi `TERRAIN_ROLE_FALLBACK`; không nạp được sheet thì dự phòng `drawRaisedColumn()`).
- **Hố**: rơi → −1 máu + hồi sinh ở đầu chunk gần nhất (+72). Chỉ màn 2 có hố (sinh từ lưới địa hình). Không đặt hố trong ~130px đầu chunk. Chỉ tiếp đất khi frame trước chân chưa xuống sâu dưới mặt đất (`previousBottom`); đã rơi thì bị kẹp giữa 2 vách. Lòng hố **để trống** (thấy nền, phủ tối dần theo `HOLE_DEPTH_BANDS`) — tile lòng hố khác màu nhìn không ra hố; dự phòng khi thiếu bộ tile: `drawHoles()`.

## Người chơi, vật cản, quân địch

- **Người chơi** (nghĩa sĩ nam/nữ dùng chung mọi chương — `PLAYER_MALE`/`PLAYER_FEMALE`, engine; `PLAYER_TRUNG_TRAC` giờ là Trưng Trắc NPC dẫn màn 1): chạy, nhảy, lướt (hồi chiêu `DASH_COOLDOWN` tính từ lúc bắt đầu lướt), đánh. Khi lướt **bất tử** với lính, hazard, đạn (`playerImmune()`), xuyên vật cản `requiresDash`; vật cản tĩnh khác vẫn gây sát thương khi va ngang. Animation theo ưu tiên `hurt > dash > attack > jump > run > idle` (`playerAnimationState()`). Sát thương cú đánh tính trong cửa sổ bắt đầu ở ô `hit_frame` (dài `ATTACK_ACTIVE_TIME`), mỗi mục tiêu trúng 1 lần/cú (`attackHits`). Ô **Lướt** luôn hiện đầu `#skillBar`.
- **Vật cản tĩnh** (`makeObstacle(type, chunk, localX, w, h)` — `localX` là **mép trái** hitbox; loại trong `OBSTACLE_TYPES`): vẽ sao cho **phần nhìn thấy trùng hitbox** (`obstacleDrawRect()`: có `visible_bbox` thì góc bbox trùng góc hitbox, không thì đáy-giữa trùng + `groundSink`). Cờ: `harmful` (chạm mất máu); `overhead` + `requiresDash` (phải lướt — `reedCurtain`, `slideBar`; hitbox overhead luôn cao 20px); `blocking` (chặn ngang, không mất máu — cột đá); loại thường = đứng lên được từ trên, va ngang mất máu. `bridge` cần hố (`requiresHole`). `spikesTrap` không có asset.
- **Hazard có trạng thái** (`makeHazard()`, `localX` là **tâm** = pivot; ánh xạ trong `HAZARD_SPRITES`; animation `death > hurt > throw/alarm > sprung > move/idle`):
  - `roller` — chờ tới khi người chơi vượt `triggerX` (hoặc có báo động) rồi lao sang trái (hổ, xe cống, kỵ binh). `facing` giữ hướng chạy cả khi chết.
  - `patrol` — **mini-boss kiệu quan** màn 1 (`MINIBOSS`, `boss: true`): cố định chunk 11, đi tuần; người chơi vào tầm thì đứng lại, quay mặt, ném dao ở `hit_frame` của `throw`. Không có `idle` nên chờ thì giữ ô 1 của `walk` (`idleHold`). Không bị đẩy lùi.
  - `thrower` — đứng yên, vào `fireRange` thì bắn theo `fireInterval` (tính từ lúc ném xong); **đạn sinh đúng `hit_frame`** ở độ cao `muzzle`. Lính gác tháp có `alarm` gọi kỵ binh. Ô vẽ dùng đồng hồ của `action` nên khớp lúc nhả đạn kể cả khi bị `hurt` ngắt.
  - `trap` — hố chông nông: vô hại tới khi người chơi tới `triggerDistance` thì `reveal` một lần rồi gây sát thương.
  - `prop` — chỉ vẽ (tháp canh).
  - Hết máu: `alive = false` ngay (tắt va chạm/di chuyển/đạn), phát `death`/`break` một lần rồi xoá; `corpse: true` thì nằm lại map vô hại.
- **Đạn** (`PROJECTILE_SPRITES`): bay ngang về phía người chơi, chạm mất máu, chém trúng thì tan, quá `PROJECTILE_MAX_RANGE` thì mờ rồi tan. Hũ dầu/lửa của chiến xa là danh sách riêng `state.jars`/`state.fires`.
- **Lính canh** `EN_HAN_GUARD` (`GUARD`, `updateGuard()`): tuần tra, người chơi vào `aggroRange` thì tiến tới (không ra khỏi đoạn tuần tra), đâm `attack_01` — sát thương chỉ ở ô `hit_frame`; bị chém trước ô hit thì huỷ cú đâm; lướt né được. `enemy.patrolMin/patrolMax/aggroRange` ghi đè `GUARD`. Lính canh + quân cảm tử dùng chung `advanceMeleeAttack()`. Mọi sát thương lên địch đi qua `strikeEnemy()`/`strikeHazard()`.
- **Bình thư** (vật phẩm thu thập của engine — `state.items`, `ITEM`): strip `ITEM_BINH_THU`, hitbox nhặt 22×26 (cố ý lớn hơn hình), 5 vị trí cố định; đủ số mới qua cổng/kết thúc màn.

## Màn 1 — Vượt ải

- Đúng **12 chướng ngại kể cả mini-boss** (~1/chunk): 10 nhóm trong `OBSTACLE_GROUPS` + mini-boss. Thứ tự **xáo mỗi lượt** (`randomizeObstacles()`): chunk 1 chỉ nhóm dễ, tháp canh + lính gác + kỵ binh luôn đi chung, mini-boss cố định chunk 11, mỗi nhóm lệch ±60px. Thêm/bớt vật cản thì giữ con số này trừ khi được yêu cầu khác.
- **Cổng đích** `PROP_LUYLAU_GATE` tại `FINISH_X`, **không hitbox** (trigger ở engine `level-flow.js`), đổi sang `_OPEN` khi mini-boss đã hạ + đủ sách (`bossAlive()`).
- Câu hỏi chặn đường: 4 câu không trùng rút từ `LEVEL1_QUESTION_POOL` mỗi lượt, ở chunk 3, 5, 8, 10. Mốc nghỉ chân và dòng cốt truyện (`level1Events()`) đang tạm giữ.

## Màn 2 — Chiêu mộ hiền tài (TT-NPC-01, TT-L2-HARD)

- 9 chunk, trời ngày, vùng `LEVEL2_ZONES`, về đích ở `LEVEL2_FINISH_X` (không cổng). Mọi thứ đặt **cố định** (không xáo), có quân Hán/bẫy/2 hố/bậc đất, `DESIGN_BASELINE`. HUD ẩn ô Sách.
- Không vật cản/hazard/hố nào trong 96px quanh NPC (`checkNpcClearance()` cảnh báo).
- **NPC** (`makeNpc()`, Thi Sách → Lê Chân → Trưng Nhị): không va chạm, quay về người chơi; chỉ NPC chưa gặp đầu tiên có tác dụng (`updateMeetings()`), giữ người chơi lại trước NPC. **Giải cứu**: mỗi NPC bị 2 lính vây (`makeCaptors()`, `captorOf`) — còn lính sống thì chỉ nhắc, hạ hết mới mở hội thoại.
- Hội thoại: câu hỏi 3 đáp án xáo; sai −1 máu + gợi ý + làm mờ đáp án đó, chọn lại; đúng → "Vì sao đúng" → phần thưởng (`addReward` ngay), điểm theo `QUESTION_SCORE` (đúng ngay lần đầu được nhiều hơn). Gặp xong NPC mờ dần rồi biến mất. Cốt truyện **Thi Sách hy sinh** 1 lần khi vào chunk sau Thi Sách, chân dung trắng đen.
- Trước mỗi NPC có 1 câu hỏi chặn đường rút từ `NPC_QUESTION_POOLS`, tiêu đề "Câu hỏi về <NPC>".

## Câu hỏi chặn đường (TT-QUIZ-01)

- Mốc là `state.quizzes` (`makeQuiz()`), `updateQuizzes()` mở `openQuiz()` khi người chơi vượt mốc; thông số `QUIZ`. Trả lời 1 lần (phím 1–4), đúng +điểm, sai −1 máu (hết máu thì thua), luôn hiện đáp án đúng + giải thích.
- Mỗi mốc có bia đá `PROP_TT_QUIZ_STELE` (không hitbox): strip `active` khi chưa hỏi, ảnh `done` khi đã hỏi.
- Chỉ chép câu đang dùng từ Excel. Câu 41 tạm loại (đáp án lưu dạng số ngày Excel + nội dung đáng ngờ) — chờ team.

## Màn 3 — Trận Luy Lâu (TT-BOSS-01)

Mọi số `DESIGN_BASELINE` trong `config.js` (`ARENA`, `BOSS_TD`, `WAVES`, `RUSHER`, `WALL_ARROWS`, `SKILLS`). Câu chữ gợi ý/cutscene nguyên văn task card (`BOSS_TEXT`, `dialogue-data.js`).

- **Đấu trường**: 1 chunk 768px, vùng Z5, tường vô hình 2 đầu (người chơi bị kẹp; chiến xa/quân cảm tử quay đầu). Người chơi vào ở x = 170 (tránh cụm nút cảm ứng trái). Không sách/hố/hazard/NPC/về đích. Camera neo tâm người chơi, ẩn thanh tiến độ.
- **Cột đá** (`stonePillar`, `blocking`): chặn ngang không mất máu, đứng lên được, vẽ theo `obstacle.state` (`intact`/`cracked`). Chỉ chiến xa bị cột chặn.
- **Giai đoạn 1 — chiến xa** (`updateChariot()`): khiên 3 nấc. Vòng: ném 2 hũ dầu (vòng cung tới chỗ người chơi lúc ném) → `warn` → `charge` → đâm cột (−1 nấc, cột nứt/vỡ, `stun`) hoặc đâm tường (đứng chờ). Chém trúng hũ đang bay → hũ phản về xe, trúng thân −1 nấc. Hũ chạm đất/người chơi → đám lửa, tối đa 1 sát thương/đám. Chém thẳng xe (cả bóng Trưng Nhị) chỉ nháy + gợi ý; mưa tên không tác dụng. Hết khiên → `shield_break`, xác xe nằm lại. Chạm thân xe −1 máu (trừ khi đứng trên cột); lướt xuyên được (tự kéo dài khi còn chồng thân xe; xe sát tường thì không xuyên được — đã chấp nhận).
- **Giai đoạn 2 — thân binh** (`updateSpawner()`): Tô Định đứng sau xác xe, không hitbox; 3 đợt từ cổng; đợt sau = đợt trước chết hết + chờ. HUD `#bossHud`: "Khiên" / "Đợt N/3".
- **Giai đoạn 3** (`updateFoot()`): Tô Định `passive` (không tấn công, chạm không mất máu), trúng đòn bị đẩy lùi về phía cổng, định kỳ gọi quân cảm tử (tối đa 2). Hết máu (`defeatToDinh()`): quân còn lại tan rã, xoá hũ/lửa/đạn/tên → cutscene.
- **Cutscene** (`updateCutscene()` thay `update`, người chơi không điều khiển): Tô Định bỏ chạy → Trưng Trắc tới cổng, cổng mở + cờ `PROP_TT_VICTORY_FLAG` (gắn ở `flag_attach` của cổng mở trong `maps_tt.json`; `VICTORY_FLAG_ATTACH` khác `null` thì ghi đè) → panel "Hoàn thành chương" + "Chơi lại chương" / "Về trang chủ". Cổng **đóng suốt trận**, chỉ mở trong cutscene (`state.gateOpen`).
- **Mưa tên trên thành**: định kỳ nhắm quanh người chơi, vạch báo trên đất trước khi rơi; lướt né được; không trúng quân địch; ngưng đầu mỗi giai đoạn và trong cutscene.
- **Quân cảm tử** `EN_HAN_RUSHER` (`updateRusher()`): 1 máu, chạy về phía người chơi (chọn hướng lúc ra/sau mỗi lần nghỉ), chạm tường quay đầu, sát người chơi thì chém thấp (sát thương ở `hit_frame`), nghỉ thì giữ ô 1 của `run`. Lướt né được. Phản hũ dầu cần canh nhịp.
- **Phần thưởng màn 2** (`SKILLS`, `updateSkills()`; chỉ khi tiến trình có phần thưởng):
  - **Ý chí kiên cường** (bị động) — còn 1 máu + một lúc không trúng đòn → +1 máu, có hồi chiêu.
  - **Mưa tên** (phím **K**) — loạt tên rơi phía trước; mỗi mũi trúng = 1 đòn, giới hạn số mũi tính cho lính/boss mỗi lần dùng; không tác dụng lên khiên, không chặn đạn.
  - **Bóng Trưng Nhị** (phím **L**) — bóng mờ đi theo, chém cùng lúc với người chơi, thêm 1 đòn/mục tiêu/cú (đòn kỹ năng **bỏ qua `hitTimer`**); không phản hũ, không hurtbox.
  - HUD: ô chân dung + lớp phủ hồi chiêu; chỉ hiện phần thưởng đã có (cả dòng trợ giúp và nút cảm ứng TÊN/BÓNG).
- Thua ở giai đoạn nào cũng "Đánh lại" từ đầu giai đoạn 1, máu đầy, điểm = số mang sang từ màn 2.

## Tiến trình, thời gian, thống kê

- **Tiến trình** (`progress.js`): `sessionStorage` khoá `suta.tt.progress`. Đã đăng nhập thì đó là **bản đệm của server** (`syncProgressFromServer()`): tab chưa có bản của tài khoản (khoá `suta.tt.progress.owner`) thì lấy bản server; server chưa có mà tab có tiến trình khách thì đẩy lên; khách (401) thì xoá bản của tài khoản cũ; lỗi mạng/quá 4 s thì dùng bản tab. Ghi = tab + PUT/DELETE nền (xếp hàng, `keepalive`).
- Luồng: qua màn 1 → ghi **mới** `{score, books, level1Complete, rewards: []}` → "Sang Màn 2"; đúng câu NPC → `addReward` ngay; qua màn 2 → "Sang Màn 3"; thắng màn 3 → `level3Complete`, "Chơi lại chương" xoá tiến trình và về màn 1. Máu luôn đầy khi bắt đầu màn; thua/chơi lại thì điểm về số mang sang. Vào màn 2/3 khi chưa đủ điều kiện → về màn 1 (`?debug=1` vào thẳng).
- **Thời gian** (`timer.js`): `frame()` cộng thời gian thật (kẹp .25 s/frame) khi `countsLevelTime()` (đang chạy, chưa thắng, không cutscene) + menu đóng + không cầm dọc. **Có tính** lúc hội thoại/câu hỏi và **cộng dồn qua các lượt thua**; thắng rồi chơi lại thì về 0; tải lại trang về 0. `endGame(true)` chốt giây vào `progress.times`, panel hiện thời gian (hết chương: từng màn + tổng) và gửi kỷ lục (điểm = điểm cuối − điểm mang sang).
- **Thống kê lượt** `state.stats`: `hitsTaken` (+1 ở `hurtPlayer`/`respawnAfterFall`; trả lời sai **không** tính), `quizCorrect`/`quizTotal` (câu NPC chỉ tính đúng khi đúng ngay lần đầu). Gửi kèm kỷ lục; panel qua màn hiện vàng/KC nhận được (icon `GOLD_ICON_URL`, lỗi tải thì chữ "+N vàng") + thành tựu mới (`showRecordReward()`).

## Âm thanh (TT-AUDIO-01)

Nhạc nền `playMusic('level' + id)` trong `resetGame` (bản đang phát/đang tải thì không phát lại; đổi bản thì nhỏ dần). `endGame` → `win`/`lose`; `defeatToDinh` dừng nhạc (cutscene không nhạc). Hội thoại mở → `duckMusic`. SFX: gọi `playSfx('<id>')` ngay tại chỗ sự kiện (cùng id chặn phát dày hơn 40 ms); thêm tiếng = khai báo trong `SFX` (tiếng chung: `engine/sfx-data.js`; tiếng riêng chương: `audio-data.js` của chương) rồi gọi. Ẩn tab / cầm dọc → `AudioContext` suspend.

## HUD và điều khiển

- Thanh trên: tên game + ⚙️ (`#settingsButton`), điểm, ⏱, thanh tiến độ (ẩn ở đấu trường). **Máu + sách trong khung chơi** (`.corner-hud` góc trên-trái): tim `ICON_HUD_HEART` 1 icon/1 máu (thiếu ảnh thì ♥), ô sách (ẩn khi màn không có sách), hàng kỹ năng `#skillBar` bên dưới. Hiệu ứng mất/hồi máu, nhặt sách chỉ khi đổi trong cùng lượt. Hộp thông báo chừa 2 góc trên.
- Bàn phím: WASD/mũi tên, Space nhảy, Shift/S/↓ lướt, J đánh, màn 3: **K** mưa tên, **L** bóng Trưng Nhị (**K không phải lướt** ở mọi màn), M tắt tiếng, Esc/P menu. Nút cảm ứng (`data-control`) dùng chung state input.
- **Cảm ứng (TT-MOBILE-01)**: chỉ máy `pointer: coarse` (cửa sổ desktop hẹp vẫn dùng bàn phím). Chơi **ngang**; cầm dọc thì `#rotateOverlay` che và ngừng `update()` (cờ `portraitQuery`, không dùng `state.paused`). Nút bán trong suốt phủ lên đáy canvas (không chiếm chiều cao trong `fitCanvas()`, z-index dưới panel/hội thoại): trái ◀ ▶ + ▲; phải ĐÁNH ở góc, LƯỚT/TÊN/BÓNG xếp vòng cung, có ảnh icon/chân dung (`setControlIcon()`), chưa tải thì chữ tạm.
