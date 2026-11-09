---
paths:
  - "frontend/static/js/engine/**"
  - "frontend/templates/gameplay/base.html"
  - "frontend/static/css/game/**"
---

# Engine màn chơi dùng chung (ENGINE-01)

Engine ở `frontend/static/js/engine/` chạy **mọi chương**. Phần riêng chương nằm trong `js/levels/<chương>/` (mẫu: rule `trung-trac-gameplay.md`). Lý do tách: `docs/REPORT_ENGINE-01.md` (chuyển vào `docs/archive/` khi đóng việc).

## Nguyên tắc

- **Engine không import file nào của chương.** Chương tạo một object định nghĩa (`js/levels/<chương>/chapter.js`), `main.js` của chương gọi `boot(chapter)`. Engine đọc qua `CHAPTER` / `LEVEL` (`engine/chapter.js`, `export let`).
- Chỉ đọc `CHAPTER`/`LEVEL` **bên trong hàm**, không đọc ở top-level module (lúc module nạp chưa có chương).
- Hợp đồng các trường của object chương ghi ở đầu `engine/chapter.js` — thêm trường mới thì cập nhật chú thích đó.
- Module là DAG, không phụ thuộc vòng: `damage` → `end-game`; `combat`; `hazards`/`enemies` → `damage` (`hazards` → thêm `combat` + `entities` cho lính gọi viện); `player` → `damage` + `combat` + `carry`; `carry` → `combat`; `render/player` + `render/debug` → `damage` (`playerHidden`); `level-flow` → tất cả; `main` → `level-flow`. Code chương được import engine thoải mái.
- Câu chữ có tên riêng chương (quân Hán, sách, kiệu quan...) **không** ghi trong engine: lấy từ `CHAPTER.text`, hoặc từ thông báo gắn trên sprite (`breakMessage`, `attackMessage`...).
- Thay đổi engine ảnh hưởng mọi chương. Đổi hành vi engine thì kiểm cả 3 màn Trưng Trắc (+ `?layout=p2`, `?layout=skills`, `?viewer=1`), layout thử cơ chế `?layout=engine` ở màn 1 Bà Triệu (bục, bục trên hố, chướng khí, voi rừng, đá lăn), `?layout=engine` ở màn 1 Lý Nam Đế (bẫy lưới, sông + thuyền, cung thủ bắn chéo, xe chở sách, chó săn, bình máu) và `?layout=engine` ở màn 1 Triệu Việt Vương (sình, khói trôi, cá sấu, thuyền gọi viện, lính giáo dài + đòn bổ, ẩn nấp + đánh úp, NPC khoá sách, 7 máu) , `?layout=engine` ở màn 1 Mai Hắc Đế (gánh nặng, xe chặn đường thả người, hổ vồ, hòm rỗng nằm lại, ném hũ dầu) và `?layout=engine` ở màn 1 Phùng Hưng (đòn gồng, thu phục + cưỡi, xe đẩy, mồi nhử, hào chông, vật phẩm phụ).
- Ô trình duyệt ẩn thì `requestAnimationFrame` không chạy: kiểm luồng bằng cách `import()` module engine trong console rồi gọi `update(1/60)` + `setKey()` (đồng hồ màn không chạy trong cách này).

## Module

- `config.js`: hằng số chung gồm độ phân giải (`VIEW_W` live), vật lý, lướt/đánh, `MAX_HEALTH` (máu tối đa của lượt là `state.maxHealth` — TQP-ENGINE E8), `MUD`, `STEALTH`, `PLUNGE`, người chơi nam/nữ (`PLAYER_SPRITES`, `PLAYER_ANIMATIONS`, `INTRO`), parallax, địa hình ô, đạn, `NPC_RULES`, `NPC_RESCUE`, `QUESTION_SCORE`, `QUIZ_SCORE`, `SHARED_*` (asset chung).
- `chapter.js`: `CHAPTER`, `LEVEL`, `setChapter`, `setLevel`, `levelIds`, `isLastLevel` + hợp đồng object chương.
- `main.js`: `boot(chapter)` làm các việc sau:
  - đặt chương và màn từ `<body data-level>`;
  - đồng bộ tiến trình, `requireLevel`;
  - chạy vòng `frame()`, `resetGame()`;
  - nút panel;
  - xử lý `?viewer=1`, `?debug=1`, `?layout=<LEVEL.testLayout>`.
- Mô phỏng:
  - `level-flow.js`: `update(dt)`, cảnh vào màn + NPC dẫn (`LEVEL.guide`), câu hỏi chặn đường, gặp/giải cứu NPC (quân vây = enemy **hoặc hazard** `captorOf`; NPC to khai báo `sprites.npcs[id].holdGap` — BT-L2), vật phẩm, **bình máu rơi** (`state.pickups`: rơi tới đất, nằm `HEAL_PICKUP.life` giây, thiếu máu mới nhặt — LND-ENGINE E4b), về đích, camera, khe kỹ năng. Đồi xa: `LEVEL.farHills ?? CHAPTER.farHills`. **Rung màn hình** `shakeCamera(time, amp)` (BT-L3 E3): `state.cameraShake`, lệch camera ngang giảm dần, vẽ ở `render/index.js`.
  - `player.js`: điều khiển/vật lý người chơi, đánh, lướt, animation; **sình** (TQP-ENGINE E1: chân giữa trên cột `'='` → đi ×`MUD.speed`, nhảy ×`MUD.jump`, `p.mudTime` cộng dồn, chìm `p.mudSink`, đủ `MUD.limit` giây −1 máu + đẩy ra mép dải); **đòn bổ** (E5, chương bật `CHAPTER.plunge`: đang rơi bấm Đánh → `p.plunging`, rơi `speed` (`forward` > 0: đường chéo đều về hướng mặt lúc bấm `p.plungeDir` — TQP-L1), hộp dưới chân `plungeBox`, trúng đỉnh mục tiêu −`damage` + nảy `bounce` + `p.plungeGrace`; mục tiêu `plungeOnly` gạt đòn chém ngang + `text.plungeHint`; animation `plunge`, thiếu thì `fallback` ô cuối attack_01); **đánh úp** (E7: lúc bắt đầu vung ghi `p.ambushTargets` = lính chưa `alerted` đang quay lưng → sát thương × `CHAPTER.stealth.ambush`); đánh/lướt/bổ đặt `p.revealTimer`; **gánh nặng** (MHD-ENGINE E4: `LEVEL.burden` → `p.burden`, số `state.burden`; đi/nhảy chậm, khoá lướt; bấm Đánh hỏi `hooks.onBurdenAttack`, true thì `releaseBurden()` + vung đòn, không thì nhắc `text.burdenHint`; animation `burdenIdle/burdenRun` có `fallback`, cả lúc chạy vào màn — `level-flow.js` `updateIntro`; trên không hoặc trúng đòn vẫn `burdenIdle` vì chưa có strip nhảy/trúng đòn khi gánh); hazard sprite **`blocking`** (E3) theo luật vật chặn (`standOn`, `pushOut`); đứng trên **bục một chiều** `state.platforms` (BT-ENGINE E6: tiếp đất từ trên khi `vy ≥ 0` và chân frame trước ≤ mặt bục + `GROUND_SNAP_DISTANCE`; nhảy từ dưới / đi ngang xuyên qua; không có thao tác rơi xuyên — ↓ là lướt; `p.platform` = bục đang đứng, bục gắn hazard chở người chơi theo `dx`). Nhớ **chỗ đứng vững** `p.safeSpot` (đất/bục tĩnh, cách mép khe ≥ `RESPAWN_EDGE_MARGIN`; bục hẹp: tâm trong nửa giữa) — LND-ENGINE E1.
  - `carry.js` (MHD-ENGINE E1): mang và ném — `throwCarried()` (bấm Đánh khi `p.carrying`, dùng `attackCooldown` để phát `attack`, `p.throwSwing` tắt hộp chém), `updateThrown(dt)` (`state.thrown`, `state.impacts`). Chương khai báo `CHAPTER.carry[kind]`; trúng địch gọi `hooks.onThrownHit` (true = chương đã xử lý), không thì `strike`. Hũ dầu chương 1 vẫn là code riêng `trung-trac/boss.js`.
  - `combat.js`: `strikeEnemy(enemy, damage)`, `strikeHazard(hazard, damage)`, `strike(target, damage)`, `breakHazard` (hiện vật phẩm `carrier` = hazard — E4a; enemy có `id` chết cũng hiện vật phẩm `carrier` = id đó — TQP-L1; quân/hazard bị hạ hỏi `CHAPTER.hooks.dropHeal(target)` → rơi bình máu `state.pickups` — E4b; `hooks.dropCarry(target)` → `spawnCarry(kind, x, y)` rơi vật để ném — MHD-ENGINE E1; hazard option `frees` → `state.rescued`, `state.runners` theo `CHAPTER.rescue`, rồi `hooks.onHazardBroken` — E5), `revealCarriedItems`, `spearBox`, `playerStrike`/`attackDamage` (đòn chém người chơi: sát thương + chí mạng do `CHAPTER.skills.attackDamage`, chí mạng gọi `hooks.onCrit` — BT-ENGINE).
  - `damage.js`: `hurtPlayer(reason, amount = 1)`, `stunPlayer(reason, time)` (BT-L3 E2: `p.stun` giây — `player.js` bỏ qua phím, vẫn rơi), `respawnAfterFall` (hố thường: đầu chunk +72; **khe sông** `hole.water`: về `p.safeSpot` — LND-ENGINE E1), `playerImmune` (+ `plungeGrace`), `playerHidden` (TQP-ENGINE E7: tâm thân trong `state.covers`, đứng đất, không đánh/lướt/bổ, hết `revealTimer`). Kỹ năng chặn đòn của chương `CHAPTER.skills.blockHurt(reason)` trả `true` thì bỏ qua cả sát thương lẫn choáng (BT-L3 E1 — khiên mây tre). Số máu mất lấy từ dữ liệu chương: `damage` của hazard/đạn, `rules.damage` của lính (cú đánh); không khai báo = 1.
  - `hazards.js`: roller, patrol, thrower, trap, prop, **vent** (vùng phun theo nhịp `cycle` off/warn/active, `phase` lệch nhịp; `ignoreDash` = lướt không miễn), **drift** (TQP-ENGINE E2 — khói trôi: wait → move hết `travel` → gap; làn `lanes.low/high`; `invisible` khi nghỉ), **lurker** (E3 — cá sấu trong khe sông: hidden → warn → attack (chồm `leap`, `exposed`, chém được) → dive, nghỉ `rest`), **pounce** (MHD-ENGINE E2 — thú vồ: hidden → warn → leap vòng cung → recover → leap tiếp; `span` kẹp điểm rơi, tránh khe hố), đạn **`lob`** + `landAs` (E3 — đạn vòng cung, chạm đất thành hazard `prop` `life` giây, tối đa `maxLanded`), tuỳ chọn **`callHelp`** (E4 — người chơi ở gần liên tục `after` giây → tín hiệu + lính ở `spawnAt`, 1 lần), thrower không bắn khi `playerHidden`, **snare** (LND-ENGINE E3 — bẫy rơi: công tắc ẩn `triggerWidth` → `warn` `warnTime` giây bám theo đầu người chơi → rơi vận tốc đầu `fallSpeed` + trọng lực; trúng −`damage` + choáng `stun` 1 lần; `landed` nằm lại) + đạn. Thrower `aim: true` (E2) nhắm đạn vào thân người chơi lúc nhả: đạn có `vx, vy, angle`, ảnh xoay theo góc bay; bay trên khe hố/sông không bị "chạm đất"; ra khỏi đỉnh/đáy khung thì tan. Hazard nổi `floatY` (thuyền) đặt trong khe sông với `groundY: GROUND_Y`, vẽ chìm dưới mặt nước. Roller chở vật phẩm rời màn mà chưa bị phá → `revealCarriedItems`. Sprite hazard có `ride: { top, inset }` mang bục trên lưng (E7 — voi rừng): bục đồng bộ cuối `updateHazards`, đứng trên lưng thì không tính va chạm thân; roller có `hp` thì chém vỡ được (đá lăn).
  - `enemies.js`: hành vi `guard`/`rusher` theo `sprites.enemies[art].behavior` + `rules` (enemy `boss` có art mang `behavior` cũng chạy hành vi — mini-boss TQP-L1), chạm thân, sinh quân theo đợt; `blockTimer` → animation `blocked` khi gạt đòn (`plungeOnly`, cả hazard). `guard` đặt `enemy.alerted` (trong `aggroRange` và người chơi không ẩn — TQP-ENGINE E7); người chơi đang ẩn thì lính thường không phát hiện và đi ngang không va trúng.
  - `end-game.js`: thắng/thua, tiến trình, panel, kỷ lục.
- Dữ liệu:
  - `state.js`: `state` + `createLevelState` (khung chung + `LEVEL.content()` + `CHAPTER.stateFields()`).
  - `entities.js`: bộ dựng cho chương gồm `makeEnemy`, `makeNpc` (`{ requires, story, hint }` — `requires`: NPC khoá theo số vật phẩm, TQP-ENGINE E6: thiếu thì giữ lại, vẽ mờ, nhắc `text.npcLocked`; `story`: cốt truyện ngắn nói khi gặp thay hội thoại câu hỏi; `hint`: câu nhắc riêng khi còn quân vây `captorOf` — TQP-L1; NPC không thoại, không `story` thì coi như đã gặp + cảnh báo), `makeCaptors`, `makeQuiz`, `makeItem` (`{ carrier }` = vật phẩm giấu trong hazard: ẩn nhưng tính vào tổng), `makeSpawner`, `makePlatform` (+ `makeRidePlatform`, `platformActive` — `state.js` tự gắn bục cho hazard `ride`), `shuffle`, `pick` và các hàm kiểm bố cục (`checkPlatformReach`: bục cao quá tầm nhảy ≈ 83px / chồng NPC, bia).
  - `geometry.js`: hàm thuần + địa hình (lưới chữ: `'#'` đất, `'.'` trống/hố, **`'~'` ở hàng cuối = cột nước** → `terrainHoles()` trả `{ x, w, water }` — LND-ENGINE E1; **`'='` ở hàng cuối = cột sình** (mặt đất) → `terrainMud()` → `state.mud`, `inMud(x)` — TQP-ENGINE E1) + `makeObstacle`, `makeHazard`, `makeProjectile(sprite, x, y, direction, aim?)`.
  - `animation.js`: registry manifest gộp, mỗi asset có `root`.
- Nạp và hiển thị:
  - `assets.js`: nạp manifest chung + manifest chương, nền/tile/prop của chương + asset map **mượn** chương khác (`CHAPTER.borrowedMaps = [{ root, manifest, ids }]`, chỉ các ID liệt kê, trùng ID thì chương thắng); mỗi mục map nhớ `asset.root` (ảnh, metadata tileset, `state_files` đọc theo đó).
  - `render/`: gồm `canvas.js` (fitCanvas + công cụ vẽ cho chương dùng: `drawSprite`, `drawAnimated`, `drawMapImage`, `spriteImage`...), `backdrop.js`, `terrain.js` (dải sình `drawMud` — `CHAPTER.tiles.mud` hoặc dải bùn dự phòng; khe sông: `drawWaterBanks` phủ vách bờ tối **trước** vật nổi — ảnh nước trong suốt vài hàng trên — rồi `drawHoles` vẽ mặt nước `CHAPTER.tiles.water` hoặc dải nước dự phòng — LND-L1), `entities.js` (đạn nhắm xoay theo góc; bình máu `CHAPTER.pickups.heal` hoặc icon tim chung), `player.js`, `debug.js` và `index.js` (`draw()` + lớp vẽ chương `CHAPTER.hooks.draw`: `beforeNpcs` — thêm TQP-L2 cho rồng sau lưng NPC —, `beforeEnemies`, `beforePlayer`, `afterPlayer`). Màn có `tiles` riêng (`LEVEL.tiles`) thì `setLevel()` ghép đè lên `CHAPTER.tiles` của chương (TQP-L2: nước đầm riêng màn 2).
  - `ui.js`: HUD, ô vật phẩm, khe kỹ năng. Ô boss do chương cập nhật qua `hooks.updateHud`.
  - `dialogue.js`: hội thoại NPC, cốt truyện, câu hỏi.
- Hạ tầng:
  - `input.js`: phím; khe kỹ năng là `skill1` (K) và `skill2` (L).
  - `audio.js` + `sfx-data.js`: tiếng chung, nhạc thắng/thua; chương gộp thêm bằng `registerAudio(CHAPTER.audio)`.
  - `progress.js`: khoá `suta.<CHAPTER.key>.progress`, `level_id` = 100 × `CHAPTER.id` + màn; `rescued` (số dân phu chương 5, mặc định 0; `end-game.js` ghi lúc qua màn 1).
  - Còn lại: `timer.js`, `settings.js`, `hero.js` (chọn nam/nữ), `viewer.js`.

## Cơ chế PH-ENGINE (chỉ bật khi chương khai báo)

- **Đòn gồng** (`CHAPTER.charge`, số `CHARGE`, `player.js updateCharge`): bấm Đánh vẫn chém ngay; giữ trên đất đủ `hold` giây rồi thả thì `startChargedAttack` (`p.chargedSwing`). Sau `delay` giây giữ mới đi chậm, để bấm nhanh không bị ảnh hưởng. Nhảy, lướt, trúng đòn huỷ và đặt `p.chargeBlocked` tới khi thả phím. Cờ sprite `chargeOnly` gạt đòn thường qua `blockedByGuard` (`text.chargeHint`); đòn gồng nhân với `attackDamage` nên phần thưởng tăng sát thương vẫn có tác dụng. Hiệu ứng tích lực là sprite `FX_CHARGE_AURA` (`CHARGE_FX_SPRITE`, manifest chung, `assets.js` chỉ nạp khi chương có `CHAPTER.charge`), vẽ ở `render/player.js`: lớp `back` sau và `front` trước nhân vật. `build_*` chọn ô theo lực (`chargeTime` từ `delay` tới `hold`), không theo fps; đủ lực thì lặp `hold_*` và phát `ready_burst` một lượt. Lửa tính theo `chargeTime >= delay` chứ không theo animation, vì 0,36 s đầu nhân vật còn vung nhát chém.
- **Thu phục + cưỡi** (sprite `tameable`, cần `hp > 0`, `state.mount`, `p.mounted`): đòn gồng trúng thì hazard biến mất. Khi cưỡi: `playerImmune` true và `hurtPlayer` bỏ qua, chỉ nhảy được; húc enemy không `boss` và hazard `rammable`. Xuống khi hết `time`, gặp mép hố, hoặc không nhích được so với đầu frame. `rammable` có `blocking` thì không chặn lúc cưỡi.
- **Đẩy vật** (sprite `pushable`, cần `blocking`, `player.js pushBody`): chạy trong vòng va chạm `blocking`. Dừng khi mép trước gặp hố, khác `baseY`, vật chặn khác. `hooks.onPushHit` trả true = chương đã xử lý.
- **Mồi nhử** (`makeDecoy`, `state.decoys`): `startLeap` ưu tiên mồi đang dựng trong `leapRange` + `span`; rơi trúng thì `pounceState = 'stuck'`. Sprite `stuckOnly` chỉ `exposed` lúc khựng; không có cờ thì `recover` vẫn chém được như chương 5.
- **Hào chông**: cột `'^'` → `hole.spikes`; `respawnAfterFall` về `p.safeSpot` như sông, câu `text.spikeFell`; ảnh `tiles.spikes` (+ `spikesTop`), thiếu thì răng dự phòng.
- **Vật phẩm phụ** (`CHAPTER.extraItems`, `makeExtra`, `state.extras`, `state.extraCollected`): danh sách riêng nên không đụng logic về đích và `books`. NPC `extras: { kind: số }`, kiểm bằng `npcLocked(npc)` ở `state.js`. HUD `#extraHud` ẩn ở màn không có.

## Khe kỹ năng

Engine lo phần chung:
- phím K/L (`skill1`/`skill2`);
- ô HUD (`.skill[data-skill]`) và nút cảm ứng (`data-control="skill1|skill2"`);
- dòng trợ giúp;
- kỹ năng nào đã sở hữu (`state.skills.owned` = phần thưởng có trong `CHAPTER.skills.defs`).

Chương lo phần riêng:
- `defs[id]` = `{ slot, portrait, timer(skills) }`;
- `createState(owned)`;
- `update(dt, triggered)`;
- `onPlayerHurt()`, `onAttackStart()`, `attackDamage(target)` (chí mạng), `blockHurt(reason)` (chặn đòn) — không bắt buộc.

Màn bật khe kỹ năng bằng `LEVEL.skills: true`.

## Asset dùng chung

Nhân vật `PLAYER_MALE`/`PLAYER_FEMALE` và icon `ICON_SK_DASH`, `ICON_SK_ATTACK`, `ICON_HUD_HEART` nằm ở `assets/images/shared/sprites-32bit/` (`manifest_shared.json`). Manifest chương **không** được có các ID này (trùng ID thì `animation.js` cảnh báo).

## Template + CSS

- `templates/gameplay/base.html`: khung chung. Template chương `{% extends %}` và điền các block `chapter_name`, `brand`, `canvas_label`, `item_label`, `item_glyph`, `skill_slots`, `skill_controls`, `skill_help`, `chapter_css`, `chapter_script`.
- `css/game/game.css`: CSS khung chung. Khe nút cảm ứng dùng class `.control--skill-1` / `.control--skill-2`. CSS riêng chương (nếu cần) đặt ở `css/levels/<chương>.css` qua block `chapter_css`.
