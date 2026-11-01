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
- Module là DAG, không phụ thuộc vòng: `damage` → `end-game`; `combat`; `hazards`/`enemies` → `damage` (`hazards` → thêm `combat`); `player` → `damage` + `combat`; `level-flow` → tất cả; `main` → `level-flow`. Code chương được import engine thoải mái.
- Câu chữ có tên riêng chương (quân Hán, sách, kiệu quan...) **không** ghi trong engine: lấy từ `CHAPTER.text`, hoặc từ thông báo gắn trên sprite (`breakMessage`, `attackMessage`...).
- Thay đổi engine ảnh hưởng mọi chương. Đổi hành vi engine thì kiểm cả 3 màn Trưng Trắc (+ `?layout=p2`, `?layout=skills`, `?viewer=1`), layout thử cơ chế `?layout=engine` ở màn 1 Bà Triệu (bục, bục trên hố, chướng khí, voi rừng, đá lăn) và `?layout=engine` ở màn 1 Lý Nam Đế (bẫy lưới, sông + thuyền, cung thủ bắn chéo, xe chở sách, chó săn, bình máu).
- Ô trình duyệt ẩn thì `requestAnimationFrame` không chạy: kiểm luồng bằng cách `import()` module engine trong console rồi gọi `update(1/60)` + `setKey()` (đồng hồ màn không chạy trong cách này).

## Module

- `config.js`: hằng số chung gồm độ phân giải (`VIEW_W` live), vật lý, lướt/đánh, `MAX_HEALTH`, người chơi nam/nữ (`PLAYER_SPRITES`, `PLAYER_ANIMATIONS`, `INTRO`), parallax, địa hình ô, đạn, `NPC_RULES`, `NPC_RESCUE`, `QUESTION_SCORE`, `QUIZ_SCORE`, `SHARED_*` (asset chung).
- `chapter.js`: `CHAPTER`, `LEVEL`, `setChapter`, `setLevel`, `levelIds`, `isLastLevel` + hợp đồng object chương.
- `main.js`: `boot(chapter)` làm các việc sau:
  - đặt chương và màn từ `<body data-level>`;
  - đồng bộ tiến trình, `requireLevel`;
  - chạy vòng `frame()`, `resetGame()`;
  - nút panel;
  - xử lý `?viewer=1`, `?debug=1`, `?layout=<LEVEL.testLayout>`.
- Mô phỏng:
  - `level-flow.js`: `update(dt)`, cảnh vào màn + NPC dẫn (`LEVEL.guide`), câu hỏi chặn đường, gặp/giải cứu NPC (quân vây = enemy **hoặc hazard** `captorOf`; NPC to khai báo `sprites.npcs[id].holdGap` — BT-L2), vật phẩm, **bình máu rơi** (`state.pickups`: rơi tới đất, nằm `HEAL_PICKUP.life` giây, thiếu máu mới nhặt — LND-ENGINE E4b), về đích, camera, khe kỹ năng. Đồi xa: `LEVEL.farHills ?? CHAPTER.farHills`. **Rung màn hình** `shakeCamera(time, amp)` (BT-L3 E3): `state.cameraShake`, lệch camera ngang giảm dần, vẽ ở `render/index.js`.
  - `player.js`: điều khiển/vật lý người chơi, đánh, lướt, animation; đứng trên **bục một chiều** `state.platforms` (BT-ENGINE E6: tiếp đất từ trên khi `vy ≥ 0` và chân frame trước ≤ mặt bục + `GROUND_SNAP_DISTANCE`; nhảy từ dưới / đi ngang xuyên qua; không có thao tác rơi xuyên — ↓ là lướt; `p.platform` = bục đang đứng, bục gắn hazard chở người chơi theo `dx`). Nhớ **chỗ đứng vững** `p.safeSpot` (đất/bục tĩnh, cách mép khe ≥ `RESPAWN_EDGE_MARGIN`; bục hẹp: tâm trong nửa giữa) — LND-ENGINE E1.
  - `combat.js`: `strikeEnemy(enemy, damage)`, `strikeHazard(hazard, damage)`, `strike(target, damage)`, `breakHazard` (hiện vật phẩm `carrier` = hazard — E4a; quân/hazard bị hạ hỏi `CHAPTER.hooks.dropHeal(target)` → rơi bình máu `state.pickups` — E4b), `revealCarriedItems`, `spearBox`, `playerStrike`/`attackDamage` (đòn chém người chơi: sát thương + chí mạng do `CHAPTER.skills.attackDamage`, chí mạng gọi `hooks.onCrit` — BT-ENGINE).
  - `damage.js`: `hurtPlayer(reason, amount = 1)`, `stunPlayer(reason, time)` (BT-L3 E2: `p.stun` giây — `player.js` bỏ qua phím, vẫn rơi), `respawnAfterFall` (hố thường: đầu chunk +72; **khe sông** `hole.water`: về `p.safeSpot` — LND-ENGINE E1), `playerImmune`. Kỹ năng chặn đòn của chương `CHAPTER.skills.blockHurt(reason)` trả `true` thì bỏ qua cả sát thương lẫn choáng (BT-L3 E1 — khiên mây tre). Số máu mất lấy từ dữ liệu chương: `damage` của hazard/đạn, `rules.damage` của lính (cú đánh); không khai báo = 1.
  - `hazards.js`: roller, patrol, thrower, trap, prop, **vent** (vùng phun theo nhịp `cycle` off/warn/active, `phase` lệch nhịp; `ignoreDash` = lướt không miễn), **snare** (LND-ENGINE E3 — bẫy rơi: công tắc ẩn `triggerWidth` → `warn` `warnTime` giây bám theo đầu người chơi → rơi vận tốc đầu `fallSpeed` + trọng lực; trúng −`damage` + choáng `stun` 1 lần; `landed` nằm lại) + đạn. Thrower `aim: true` (E2) nhắm đạn vào thân người chơi lúc nhả: đạn có `vx, vy, angle`, ảnh xoay theo góc bay; bay trên khe hố/sông không bị "chạm đất"; ra khỏi đỉnh/đáy khung thì tan. Hazard nổi `floatY` (thuyền) đặt trong khe sông với `groundY: GROUND_Y`, vẽ chìm dưới mặt nước. Roller chở vật phẩm rời màn mà chưa bị phá → `revealCarriedItems`. Sprite hazard có `ride: { top, inset }` mang bục trên lưng (E7 — voi rừng): bục đồng bộ cuối `updateHazards`, đứng trên lưng thì không tính va chạm thân; roller có `hp` thì chém vỡ được (đá lăn).
  - `enemies.js`: hành vi `guard`/`rusher` theo `sprites.enemies[art].behavior` + `rules`, chạm thân, sinh quân theo đợt.
  - `end-game.js`: thắng/thua, tiến trình, panel, kỷ lục.
- Dữ liệu:
  - `state.js`: `state` + `createLevelState` (khung chung + `LEVEL.content()` + `CHAPTER.stateFields()`).
  - `entities.js`: bộ dựng cho chương gồm `makeEnemy`, `makeNpc`, `makeCaptors`, `makeQuiz`, `makeItem` (`{ carrier }` = vật phẩm giấu trong hazard: ẩn nhưng tính vào tổng), `makeSpawner`, `makePlatform` (+ `makeRidePlatform`, `platformActive` — `state.js` tự gắn bục cho hazard `ride`), `shuffle`, `pick` và các hàm kiểm bố cục (`checkPlatformReach`: bục cao quá tầm nhảy ≈ 83px / chồng NPC, bia).
  - `geometry.js`: hàm thuần + địa hình (lưới chữ: `'#'` đất, `'.'` trống/hố, **`'~'` ở hàng cuối = cột nước** → `terrainHoles()` trả `{ x, w, water }` — LND-ENGINE E1) + `makeObstacle`, `makeHazard`, `makeProjectile(sprite, x, y, direction, aim?)`.
  - `animation.js`: registry manifest gộp, mỗi asset có `root`.
- Nạp và hiển thị:
  - `assets.js`: nạp manifest chung + manifest chương, nền/tile/prop của chương + asset map **mượn** chương khác (`CHAPTER.borrowedMaps = [{ root, manifest, ids }]`, chỉ các ID liệt kê, trùng ID thì chương thắng); mỗi mục map nhớ `asset.root` (ảnh, metadata tileset, `state_files` đọc theo đó).
  - `render/`: gồm `canvas.js` (fitCanvas + công cụ vẽ cho chương dùng: `drawSprite`, `drawAnimated`, `drawMapImage`, `spriteImage`...), `backdrop.js`, `terrain.js` (khe sông vẽ mặt nước `CHAPTER.tiles.water` hoặc dải nước dự phòng), `entities.js` (đạn nhắm xoay theo góc; bình máu `CHAPTER.pickups.heal` hoặc icon tim chung), `player.js`, `debug.js` và `index.js` (`draw()` + lớp vẽ chương `CHAPTER.hooks.draw`).
  - `ui.js`: HUD, ô vật phẩm, khe kỹ năng. Ô boss do chương cập nhật qua `hooks.updateHud`.
  - `dialogue.js`: hội thoại NPC, cốt truyện, câu hỏi.
- Hạ tầng:
  - `input.js`: phím; khe kỹ năng là `skill1` (K) và `skill2` (L).
  - `audio.js` + `sfx-data.js`: tiếng chung, nhạc thắng/thua; chương gộp thêm bằng `registerAudio(CHAPTER.audio)`.
  - `progress.js`: khoá `suta.<CHAPTER.key>.progress`, `level_id` = 100 × `CHAPTER.id` + màn.
  - Còn lại: `timer.js`, `settings.js`, `hero.js` (chọn nam/nữ), `viewer.js`.

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
