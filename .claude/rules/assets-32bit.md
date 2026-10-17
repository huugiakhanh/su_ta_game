---
paths:
  - "assets/**"
  - "frontend/static/assets/**"
  - "frontend/static/js/levels/**/{config,chapter,render-extras}.js"
  - "frontend/static/js/engine/{config,assets,animation,viewer}.js"
  - "frontend/static/js/engine/render/**"
  - "SUTA_TT_ART_BRIEF_32.md"
  - "docs/CODEX_PROMPT_*.md"
  - "tools/**"
---

# Asset và Codex

## Phân công

- Codex (skill agent-sprite-forge) vẽ asset; Claude **không vẽ lại, không chỉnh sửa** PNG/GIF Codex xuất. Asset lỗi → ghi vào report kèm đề xuất `NORMALIZE` hoặc `NEED_REDRAW` để giao lại Codex. Ngoại lệ đã duyệt: sinh **bản thu nhỏ** cho web bằng `tools/make_home_images.py`, ảnh gốc giữ nguyên.
- [SUTA_TT_ART_BRIEF_32.md](../../SUTA_TT_ART_BRIEF_32.md) (gốc repo) là brief **duy nhất** cho Codex. Mỗi đợt giao kèm prompt `docs/CODEX_PROMPT_*.md` (skill `/codex-prompt`), **xoá khi việc xong**. Soát asset nộp về: skill `/asset-review`.
- Vùng làm việc Codex (ngoài git): `assets/sprites-32bit/`, `assets/maps-32bit/<chương>/`. Bộ 8-bit cũ `assets/sprites/`, `assets/maps/` không còn dùng; hướng Godot + 16-bit đã dừng. Không làm việc trong thư mục Codex đang làm.
- Không đổi ID / tên animation / số frame, không tạo ID gần giống. Trong `manifest_tt.json`, `maps_tt.json` chỉ được sửa `status` (sửa bản nguồn rồi chép lại bản chạy).

## Vị trí asset trong web

- Asset riêng chương: `frontend/static/assets/images/<chương>/`. Asset dùng chung toàn web (avatar người chơi, icon tiền tệ, nền trang chủ, ảnh nhân vật thư viện): thư mục chung (`images/avatar/`, `images/icon/`, `images/characters/`…), trỏ thẳng đường dẫn, **không** khai báo trong manifest chương.
- Template dùng `url_for('static', ...)`; JS dùng URL bắt đầu `/static/assets/...`.

## Hợp đồng asset 32-bit (TT-HIBIT-01…04)

- Bộ asset **duy nhất** trong game. Bản chạy: `assets/images/trung-trac/sprites-32bit/` (`manifest_tt.json`) và `maps-32bit/` (`maps_tt.json`), cấu trúc `<category>/<ID>/<file>.png`. Nguồn Codex: `assets/sprites-32bit/`, `assets/maps-32bit/trung-trac/` (ngoài git). Chương Bà Triệu: `images/ba-trieu/{sprites,maps}-32bit/` (`manifest_bt.json`, `maps_bt.json`), nguồn `assets/{sprites,maps}-32bit/ba-trieu/`; asset dùng lại của chương 1 khai báo qua `borrowedMaps` (không chép ảnh).
- Mật độ **×4**: số trong manifest là pixel logic + `density`. Vẽ map qua `drawMapImage()`/`mapWidth()`/`mapHeight()`, sprite qua `drawSprite` — **không** gọi `ctx.drawImage`/`image.width` thẳng.
- **`manifest_tt.json` là nguồn duy nhất** cho `frames`/`fps`/`loop`/`hit_frame` (đọc lúc chạy, không chép số vào code); `maps_tt.json` là nguồn cho đường dẫn/cỡ/`visible_bbox`/`pivot`. Trong 2 file này chỉ được sửa `status` (sửa bản nguồn rồi chép lại bản chạy).
- Animation **không lặp** đổi số frame/fps phải giữ nhịp gameplay: thời lượng `frames/fps` và tỉ lệ `(hit_frame−1)/frames`. `hit_frame` đếm từ 1. `jump` của người chơi chọn ô theo vận tốc nên đúng 3 ô. Một animation được có `frame_w` riêng rộng hơn, căn giữa pivot (vd. `PLAYER_TRUNG_TRAC.attack_01` — Trưng Trắc cầm giáo đồng).
- Mọi strip **pivot bottom-center** (chân ở hàng `frame_h − 2`), ảnh gốc quay **phải**; render lật khi quay trái (vật chạy theo hướng chạy, lính/boss quay về người chơi, bẫy/tháp giữ hướng gốc).
- Mỗi entity có `anim = { name, time }` với đồng hồ riêng (tick trong phần mô phỏng của engine); animation không lặp dừng ở ô cuối. Mọi animation vẽ ×1, **không** hệ số bù tỉ lệ.
- Hitbox theo pixel logic tương đối với pivot, **không lấy từ cỡ ảnh**.
- **Nạp theo màn**: sprite canvas chỉ các ID trong `LEVEL_SPRITES[id]` của chương (`config.js` chương, gắn vào `levels[id].sprites`) — thêm thực thể dùng sprite mới thì thêm ID vào đó (quên thì `spriteImage()` cảnh báo + vẽ hộp tạm). Ảnh DOM: icon chung `SHARED_DOM_SPRITES` (engine) + chân dung chương `PORTRAITS`, hiển thị qua `setSpriteImage()`/`spriteUrl()`, class `img--hibit`.
- **Asset dùng chung mọi chương (ENGINE-01)**: nhân vật `PLAYER_MALE`/`PLAYER_FEMALE` + icon `ICON_SK_DASH`/`ICON_SK_ATTACK`/`ICON_HUD_HEART` ở `assets/images/shared/sprites-32bit/` với `manifest_shared.json` (cùng định dạng manifest chương, chép nguyên mục từ manifest Trưng Trắc — ngoại lệ người dùng duyệt 13/10). Manifest chương **không** chứa các ID này. Bản nguồn Codex (`assets/sprites-32bit/manifest_tt.json`, ngoài git) vẫn gộp chung — khi chép nguồn sang bản chạy phải tách 5 mục này sang `manifest_shared.json`.
- **Thêm/đổi sprite**: sau khi soát + người dùng duyệt, chép strip + manifest sang bản chạy, thêm ID vào `LEVEL_SPRITES`, khai báo ánh xạ trạng thái → animation + hitbox trong `config.js` của chương. Kiểm hướng mặt và tỉ lệ thật bằng `?viewer=1` (liệt kê cả manifest chung), đừng tin spec.
- **Thêm/đổi asset môi trường**: chép PNG + `maps_tt.json` (+ `tileset_tt_*.json`) giữ cấu trúc; khai báo trong `config.js` của chương (`ZONES`, `FAR_HILLS`, `TILES`, `OBSTACLE_TYPES`, `FINISH_GATE`, `ITEM`; prop phải có trong `MAP_PROPS_IN_GAME`). Lệch vị trí thì sửa neo/offset, không co giãn. Soát nền: xem ở cỡ chơi thật + phóng to, đo chỗ nối lặp (không tin "cột đầu = cột cuối"), tìm lỗ/vụn.
- Chưa dùng: `PJ_FIRE_ARROW` (không nạp). Chưa có asset/cơ chế giáp, tăng dame.
