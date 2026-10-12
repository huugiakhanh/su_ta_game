# TT-HIBIT-02 — Chân dung + icon 32-bit (hiển thị DOM)

Ngày: 02/10/2026 • Trạng thái: **HOÀN THÀNH 02/10 — 8 asset `IN_GAME`. Report: [REPORT_TT-HIBIT-02.md](REPORT_TT-HIBIT-02.md).** Prompt: `CODEX_PROMPT_32BIT_PORTRAITS_ICONS.md` (đã xoá)
Kế hoạch tổng: Phần B trong lộ trình 32-bit (nhân vật → icon → map), xem [SUTA_TT_TASK_HIBIT_01.md](SUTA_TT_TASK_HIBIT_01.md).

## 1. Phạm vi

| ID | 8-bit | 32-bit (density 4) | Dùng ở |
|---|---|---|---|
| `PORTRAIT_TRUNG_TRAC`, `PORTRAIT_TRUNG_NHI`, `PORTRAIT_THI_SACH`, `PORTRAIT_LE_CHAN`, `PORTRAIT_TO_DINH` | 64×64 | 256×256 | Khung hội thoại (128 / 64 CSS px), ô kỹ năng HUD, nút TÊN/BÓNG |
| `ICON_SK_DASH`, `ICON_SK_ATTACK` | 32×32 | 128×128 | Ô Lướt HUD, nút LƯỚT/ĐÁNH (~72 CSS px) |

Contract như sprite (brief `SUTA_TT_SPRITE_BRIEF_32.md`): cùng ID, 1 animation `idle`, frames 1,
`frame_w`/`frame_h` logic (64 hoặc 32), `density: 4`, cùng manifest `sprites-32bit/manifest_tt.json`.

## 2. Code

| File | Sửa |
|---|---|
| `config.js` | `SPRITE_DOM_IN_GAME` (5 chân dung + 2 icon) |
| `assets.js` | `loadSprites()` duyệt thêm `SPRITE_DOM_IN_GAME` (cùng `hibitMismatch`/`loadStrips`); bản 32-bit được chọn mang `root`; `spriteUrl(id)` |
| `ui.js` | `setSpriteImage(img, id)` (gán URL + class `img--hibit`); ô Lướt, nút ĐÁNH, ô kỹ năng, nút chiêu dùng hàm này |
| `dialogue.js` | chân dung qua `setSpriteImage` (bỏ ghép thẳng `SPRITE_8BIT_ROOT`) |
| `css/levels/trung-trac.css` | `.img--hibit` → `image-rendering: auto` (ảnh dày thu nhỏ mượt; 8-bit giữ `pixelated`) |

## 3. Test (bộ giả: 8-bit ×4 nearest + vạch chéo; đã xoá sau khi thử)

| # | Kịch bản | Kết quả |
|---|---|---|
| TC1 | Màn 3 `?debug=1`, không `?hibit` | PASS — 5 ảnh đều `sprites-8bit/`, `pixelated`, cỡ gốc 32/64 |
| TC2 | `?hibit=1`, có giả `PORTRAIT_THI_SACH`, `PORTRAIT_LE_CHAN`, `ICON_SK_DASH` | PASS — 3 ảnh này lấy `sprites-32bit/` (256/128 px, `auto`), `PORTRAIT_TRUNG_NHI`/`ICON_SK_ATTACK` vẫn 8-bit; nút cảm ứng dùng cùng ảnh |
| TC3 | Cốt truyện Thi Sách (`openStory`) với `?hibit=1` | PASS — chân dung 32-bit, vẫn `grayscale(1)` |
| TC4 | Asset thật của Codex: soát độ nét ở 64 / 128 CSS px và trong nút tròn 72 px | Kỹ thuật PASS (xem mục 5); độ nét do người dùng xem khi chơi thử |
| TC5 | Icon máu `?hibit=1` | PASS — 5 tim `ICON_HUD_HEART` (64 px ảnh, 18 CSS px, `auto`) |
| TC6 | Không `?hibit` | PASS — tim `items/heart.png`, chân dung/icon 8-bit `pixelated`, không lỗi console mới |

## 5. Tích hợp asset Codex (02/10/2026)

Codex giao 8 asset (5 chân dung 256×256, 2 icon kỹ năng 128×128, `ICON_HUD_HEART` 64×64). Soát độc lập: đúng cỡ, alpha 0/255,
17–28 màu/asset, bảng màu chương 91 (≤ 96, thêm 16 màu theo prompt, không đổi màu cũ); tim có khối pixel to có chủ ý
(đọc ở 18 px), `ICON_SK_ATTACK` vẽ giáo đồng — PASS. Đã chép vào game.

Code icon máu: `config.js` `HEART_ICON`, `SPRITE_HIBIT_ONLY` (asset chỉ có bản 32-bit), thêm vào `SPRITE_DOM_IN_GAME`;
`assets.js` `loadSprites()` nạp asset 32-bit không có bản 8-bit (chỉ kiểm density + cỡ ảnh, thiếu không báo lỗi) và đăng ký
thêm vào manifest đã trộn; `ui.js` `updateHud()` dùng `setSpriteImage(icon, HEART_ICON)`, thiếu thì `items/heart.png`;
CSS `.hud__hearts img.img--hibit`. **Lỗi tìm thấy khi thử:** `updateHud()` chạy lúc khởi tạo trước khi asset tải xong, máu
không đổi nên tim không vẽ lại → giữ ảnh cũ. Sửa: vẽ lại cả khi nguồn ảnh tim đổi (`lastHeartUrl`).

## 4. TODO / câu hỏi team

- **Icon máu:** người dùng duyệt 02/10 thêm ID mới **`ICON_HUD_HEART`** (16×16 logic, ảnh 64×64, chỉ có ở bộ 32-bit) thay
  `items/heart.png` (ảnh cũ 199×242 bị ép méo vào 18×18). Code cần bổ sung khi tích hợp: `loadSprites()` nhận asset DOM
  **không có bản 8-bit** (chỉ kiểm cỡ ảnh/density), thêm `ICON_HUD_HEART` vào `SPRITE_DOM_IN_GAME`; `updateHud()` (`ui.js`)
  dùng `setSpriteImage(icon, 'ICON_HUD_HEART')`, thiếu thì `items/heart.png` như cũ.
- `ICON_SK_ATTACK` bản 32-bit vẽ **giáo đồng** (Trưng Trắc cầm giáo từ GATE 1).
- Bảng màu: chân dung được thêm tối đa 16 màu (chương ≤ 96), không đổi màu cũ.
