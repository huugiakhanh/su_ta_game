# REPORT TT-HIBIT-02 — Chân dung + icon 32-bit (hiển thị DOM)

Ngày: 02/10/2026 • Trạng thái: **HOÀN THÀNH** — 8 asset `IN_GAME`. Task card: [SUTA_TT_TASK_HIBIT_02.md](SUTA_TT_TASK_HIBIT_02.md),
prompt: `CODEX_PROMPT_32BIT_PORTRAITS_ICONS.md` (đã xoá).

## 1. Kết quả

| Asset | Ảnh | Dùng ở |
|---|---|---|
| `PORTRAIT_TRUNG_TRAC`, `PORTRAIT_TRUNG_NHI`, `PORTRAIT_THI_SACH`, `PORTRAIT_LE_CHAN`, `PORTRAIT_TO_DINH` | 256×256 | hội thoại, cốt truyện, cutscene, ô kỹ năng, nút TÊN/BÓNG |
| `ICON_SK_DASH`, `ICON_SK_ATTACK` (vẽ lại: giáo đồng) | 128×128 | ô Lướt, nút LƯỚT/ĐÁNH |
| `ICON_HUD_HEART` (**ID mới**, chỉ có bản 32-bit — người dùng duyệt 02/10) | 64×64 | thanh máu HUD, thay `items/heart.png` |

Bảng màu chương 91 màu (≤ 96). Cùng với TT-HIBIT-01: **mọi ảnh nhân vật/vật thể/UI trong game đã là 32-bit**, trừ
`EN_HAN_BOAT` (không dùng) và map (TT-HIBIT-03).

## 2. File code đã sửa

| File | Mục đích |
|---|---|
| `config.js` | `SPRITE_DOM_IN_GAME`, `HEART_ICON`, `SPRITE_HIBIT_ONLY` |
| `assets.js` | `loadSprites()` nạp cả asset DOM; asset chỉ có bản 32-bit (không có contract 8-bit) chỉ kiểm density + cỡ ảnh; `spriteUrl(id)` |
| `ui.js` | `setSpriteImage(img, id)`; ô Lướt, nút ĐÁNH, ô kỹ năng, nút chiêu, **thanh máu** dùng hàm này; `updateHud()` vẽ lại tim khi nguồn ảnh đổi |
| `dialogue.js` | chân dung qua `setSpriteImage` |
| `css/levels/trung-trac.css` | `.img--hibit` → `image-rendering: auto` (thu nhỏ mượt) |

## 3. Test

| # | Kịch bản | Kết quả |
|---|---|---|
| TC1–TC3 | bộ giả: 8-bit khi không cờ, chọn 32-bit/8-bit từng asset, chân dung trắng đen | PASS |
| TC4 | asset thật: kỹ thuật (cỡ, alpha, màu) + người dùng chơi thử | PASS |
| TC5 | icon máu 32-bit (5 tim, 64 px ảnh / 18 CSS px) | PASS (sau khi sửa lỗi dưới) |
| TC6 | không cờ khi còn `NORMALIZED`: lùi về 8-bit + `heart.png` | PASS |
| Sau `IN_GAME`, không cờ (màn 3 `?debug=1`) | tim, ô kỹ năng, nút cảm ứng đều `sprites-32bit/`, `auto` | PASS |

**Lỗi tìm thấy khi tích hợp:** `updateHud()` chạy lúc khởi tạo trước khi asset tải xong; máu không đổi nên tim không vẽ lại
→ giữ ảnh cũ. Chứng minh: sau khi tải xong `getAsset('ICON_HUD_HEART')` đã có nhưng `<img>` vẫn `heart.png`. Sửa: so thêm
nguồn ảnh tim (`lastHeartUrl`).

## 4. TODO

- Map 32-bit (TT-HIBIT-03).
- `items/heart.png` giữ làm dự phòng; có thể xoá khi bỏ hẳn bộ 8-bit.
