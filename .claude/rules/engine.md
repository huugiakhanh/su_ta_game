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
- Module là DAG, không phụ thuộc vòng: `damage` → `end-game`; `combat`; `hazards`/`enemies` → `damage`; `player` → `damage` + `combat`; `level-flow` → tất cả; `main` → `level-flow`. Code chương được import engine thoải mái.
- Câu chữ có tên riêng chương (quân Hán, sách, kiệu quan...) **không** ghi trong engine: lấy từ `CHAPTER.text`, hoặc từ thông báo gắn trên sprite (`breakMessage`, `attackMessage`...).
- Thay đổi engine ảnh hưởng mọi chương. Đổi hành vi engine thì kiểm cả 3 màn Trưng Trắc (+ `?layout=p2`, `?layout=skills`, `?viewer=1`).

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
  - `level-flow.js`: `update(dt)`, cảnh vào màn + NPC dẫn (`LEVEL.guide`), câu hỏi chặn đường, gặp/giải cứu NPC, vật phẩm, về đích, camera, khe kỹ năng.
  - `player.js`: điều khiển/vật lý người chơi, đánh, lướt, animation.
  - `combat.js`: `strikeEnemy`, `strikeHazard`, `strike`, `breakHazard`, `spearBox`.
  - `damage.js`: `hurtPlayer`, `respawnAfterFall`, `playerImmune`.
  - `hazards.js`: roller, patrol, thrower, trap, prop + đạn.
  - `enemies.js`: hành vi `guard`/`rusher` theo `sprites.enemies[art].behavior` + `rules`, chạm thân, sinh quân theo đợt.
  - `end-game.js`: thắng/thua, tiến trình, panel, kỷ lục.
- Dữ liệu:
  - `state.js`: `state` + `createLevelState` (khung chung + `LEVEL.content()` + `CHAPTER.stateFields()`).
  - `entities.js`: bộ dựng cho chương gồm `makeEnemy`, `makeNpc`, `makeCaptors`, `makeQuiz`, `makeItem`, `makeSpawner`, `shuffle`, `pick` và các hàm kiểm bố cục.
  - `geometry.js`: hàm thuần + địa hình + `makeObstacle`, `makeHazard`, `makeProjectile`.
  - `animation.js`: registry manifest gộp, mỗi asset có `root`.
- Nạp và hiển thị:
  - `assets.js`: nạp manifest chung + manifest chương, nền/tile/prop của chương.
  - `render/`: gồm `canvas.js` (fitCanvas + công cụ vẽ cho chương dùng: `drawSprite`, `drawAnimated`, `drawMapImage`, `spriteImage`...), `backdrop.js`, `terrain.js`, `entities.js`, `player.js`, `debug.js` và `index.js` (`draw()` + lớp vẽ chương `CHAPTER.hooks.draw`).
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
- `onPlayerHurt()` và `onAttackStart()` (không bắt buộc).

Màn bật khe kỹ năng bằng `LEVEL.skills: true`.

## Asset dùng chung

Nhân vật `PLAYER_MALE`/`PLAYER_FEMALE` và icon `ICON_SK_DASH`, `ICON_SK_ATTACK`, `ICON_HUD_HEART` nằm ở `assets/images/shared/sprites-32bit/` (`manifest_shared.json`). Manifest chương **không** được có các ID này (trùng ID thì `animation.js` cảnh báo).

## Template + CSS

- `templates/gameplay/base.html`: khung chung. Template chương `{% extends %}` và điền các block `chapter_name`, `brand`, `canvas_label`, `item_label`, `item_glyph`, `skill_slots`, `skill_controls`, `skill_help`, `chapter_css`, `chapter_script`.
- `css/game/game.css`: CSS khung chung. Khe nút cảm ứng dùng class `.control--skill-1` / `.control--skill-2`. CSS riêng chương (nếu cần) đặt ở `css/levels/<chương>.css` qua block `chapter_css`.
