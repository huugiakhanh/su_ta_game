# REPORT ENGINE-01 — Tách engine màn chơi dùng chung mọi chương

Ngày: 13/10/2026.

Yêu cầu người dùng: rà soát JS chương Trưng Trắc, phần nào tái sử dụng được cho các chương sau thì viết thành module chung. Chương riêng chỉ chứa phần riêng của màn/chương. Nhân vật nam/nữ là nhân vật chung mọi chương.

## Hiện trạng trước khi sửa
- Toàn bộ 22 module nằm trong `js/levels/trung-trac/`, khoảng 7.000 dòng.
- `physics.js` dài 1.734 dòng: khoảng 60% là cơ chế chung, 40% là boss/kỹ năng riêng màn 3.
- `render.js` dài 1.136 dòng, `config.js` dài 633 dòng, trộn hằng số chung với số liệu riêng chương.
- Logic chung có nhiều chỗ ghi cứng cho Trưng Trắc:
  - các nhánh `LEVEL.id === 1/2/3`;
  - câu chữ "kiệu quan", "sách lịch sử …/5", "quân Hán";
  - khoá `suta.tt.progress`, `CHAPTER_ID = 1`, URL `/gameplay/levels/trung-trac`;
  - phím/ô kỹ năng mang tên `arrowRain`/`shadow`.
- Sprite nhân vật nam/nữ + 3 icon HUD nằm trong `images/trung-trac/` và `manifest_tt.json`.

## Quyết định (người dùng chốt 13/10)
- Duyệt kế hoạch tách thành **engine** (`js/engine/`) và **chương** (`js/levels/<chương>/`).
- Engine không import file chương. Chương truyền một object định nghĩa vào `boot(chapter)`.
- **Asset dùng chung (A):** chuyển `PLAYER_MALE`, `PLAYER_FEMALE`, `ICON_SK_DASH`, `ICON_SK_ATTACK`, `ICON_HUD_HEART` sang `images/shared/sprites-32bit/` với `manifest_shared.json`. Các mục được chép nguyên từ `manifest_tt.json`. Đây là **ngoại lệ** của quy tắc "manifest chỉ sửa `status`", đã được người dùng cho phép.
- **Template/CSS (A):** tách thành `gameplay/base.html` + `css/game/game.css` dùng chung. Chương chỉ điền các block riêng.
- **Khe kỹ năng chung (theo đề xuất):**
  - Engine lo phím K/L (`skill1`/`skill2`), ô HUD, nút cảm ứng, việc sở hữu kỹ năng.
  - Chương lo hiệu ứng và hồi chiêu.

## File đã sửa / tạo / xoá
| File | Việc |
|---|---|
| `js/engine/` (mới, 25 file + `render/` 7 file) | Engine dùng chung. Chi tiết module: rule `engine.md`. 13 file chuyển bằng `git mv` từ `trung-trac/` để giữ lịch sử. |
| `js/engine/chapter.js` (mới) | `CHAPTER`/`LEVEL` + hợp đồng object chương |
| `js/engine/{player,combat,damage,hazards,enemies,level-flow,end-game}.js` | Tách từ `physics.js` |
| `js/engine/{state,entities}.js` | Phần khung của `state.js` + bộ dựng thực thể cho chương |
| `js/engine/render/*` | Tách từ `render.js` |
| `js/engine/sfx-data.js` | Tiếng chung + nhạc thắng/thua (tách từ `audio-data.js`) |
| `js/levels/trung-trac/chapter.js`, `main.js` | Định nghĩa chương `TRUNG_TRAC`; `main.js` còn 3 dòng gọi `boot()` |
| `js/levels/trung-trac/config.js` | Chỉ giữ số liệu riêng chương. Thêm `TEXT` (câu thông báo) và các câu gắn trên sprite |
| `js/levels/trung-trac/level1.js`, `level2.js`, `level3.js` (mới) | Nội dung + sự kiện từng màn |
| `js/levels/trung-trac/boss.js`, `skills.js`, `render-extras.js`, `audio-data.js` (mới) | Trận boss, 3 kỹ năng, lớp vẽ riêng, nhạc + tiếng riêng |
| `templates/gameplay/base.html` (đổi tên từ `levels/trung-trac.html`) + `levels/trung-trac.html` (mới, kế thừa) | Khung chung + block riêng chương |
| `css/game/game.css` (đổi tên từ `css/levels/trung-trac.css`) | Đổi tên class: `status-bar__books` → `__items`; `control--arrow-rain`/`--shadow` → `control--skill-1`/`-2` |
| `assets/images/shared/sprites-32bit/` (mới) | 16 strip nhân vật + 3 icon (`git mv`) + `manifest_shared.json` |
| `assets/images/trung-trac/sprites-32bit/manifest_tt.json` | Bớt đúng 5 mục trên (diff chỉ có xoá) |
| `.claude/rules/engine.md` (mới), `trung-trac-gameplay.md`, `assets-32bit.md`, `skills/asset-review/SKILL.md`, `CLAUDE.md`, `docs/architecture.md` | Cập nhật cấu trúc mới |

Tổng: 49 file đổi trong git (+1.120 / −4.698 dòng, chưa tính file mới). JS màn chơi: khoảng 7.900 → 7.576 dòng.

Thay đổi hành vi ngoài yêu cầu: **không**. Đổi tên nội bộ không ảnh hưởng người chơi:
- `state.books` → `state.items`;
- id DOM `bookHud`/`bookValue`/`bookIcon` → `itemHud`/`itemValue`/`itemIcon`;
- `shieldPips` → `bossHudPips`;
- SFX `book` → `item`.

Giữ nguyên:
- khoá lưu `suta.tt.progress` và trường `books` trong dữ liệu tiến trình trên server;
- mọi số, câu chữ, ID asset.

## Kết quả test
- `pytest tests`: **78 passed, 1 skipped** — PASS. `test_app.py` skip vì thiếu `SUTA_TEST_DATABASE_URL`, nên test DB **chưa chạy**.
- Kiểm cú pháp ESM toàn bộ 38 module: 0 lỗi — PASS.
- **So hành vi cũ ↔ mới:** PASS.
  - Cách kiểm: chạy bản HEAD và bản mới trên Node với cùng hạt giống `Math.random`, cùng kịch bản phím, cùng manifest; ghi snapshot state mỗi 10 frame.
  - Dữ liệu so trong snapshot: vị trí/vận tốc/animation người chơi, máu, điểm, quân, hazard, đạn, hũ dầu, lửa, mưa tên, giai đoạn boss, cutscene, câu hỏi, NPC, hồi chiêu kỹ năng, thống kê.
  - Phạm vi: 17 lượt chơi gồm 3 màn × 3 hạt giống, 3 màn × 2 hạt giống chế độ bất tử, `?layout=p2`, `?layout=skills`.
  - Các lượt đã đi qua: gặp đủ 3 NPC và qua màn 2; boss màn 3 tới giai đoạn 3 + cutscene + thắng; cổng màn 1 chặn khi thiếu sách.
  - Kết quả: **5.513/5.513 snapshot giống hệt**.
- Flask: `/gameplay/levels/trung-trac`, `/2`, `/3` và URL cũ đều 200. Template mới có `game.css`, `main.js`, khe `skill1`, `itemHud`. Asset `images/shared/` trả 200 — PASS.
- **Chrome headless thật** (DevTools Protocol, khách đã chọn nữ) — PASS:
  - Màn 1 (1280×720): 143 request. Hội thoại Trưng Trắc mở, đóng xong đồng hồ chạy. Tim và icon lướt nạp từ `images/shared/`. Ô sách 0/5.
  - Màn 2 `?debug=1`: 134 request, chơi và mất máu bình thường.
  - Màn 3 `?debug=1` (1280×720, 812×375 cảm ứng): 117 / 115 request. Ô "Khiên", 3 ô kỹ năng, nút TÊN/BÓNG đúng vị trí, có chân dung. K/L kích hoạt hồi chiêu, bóng Trưng Nhị hiện. F2 hiện nhãn riêng chiến xa "warn khiên 2".
  - `?layout=p2`: chạy bình thường.
  - `?viewer=1`: 56 asset (gồm manifest chung).
  - Request lỗi chỉ có `404 favicon.ico` và `401 /api/game/progress/1` (khách) — giống trước.
  - 0 exception.
- `/verify-ui` đầy đủ 5 cỡ màn hình bằng Browser pane: **CHƯA CHẠY**, vì phiên này không có Browser pane. Đã thay bằng Chrome headless ở 2 cỡ (desktop + điện thoại ngang).

## Vấn đề asset
- Không có ảnh lỗi.
- Bản nguồn Codex `assets/sprites-32bit/manifest_tt.json` (ngoài git) vẫn gộp 5 mục dùng chung. Lần sau chép nguồn sang bản chạy phải tách các mục này sang `manifest_shared.json`, nếu không `animation.js` sẽ cảnh báo trùng ID. Đã ghi vào rule `assets-32bit.md`.

## Câu hỏi cho team / TODO
- **Có từ trước, không do ENGINE-01:** màn 1 và màn 2 cảnh báo console `sprite PJ_OIL_JAR / FX_OIL_FIRE / PJ_ARROW_RAIN chưa nạp`.
  - Nguyên nhân: hàm vẽ hũ/lửa/mũi tên gọi `spriteImage()` mỗi frame dù danh sách rỗng. Code giống hệt bản HEAD.
  - Đề xuất sửa nhỏ: thoát sớm khi danh sách rỗng. Chưa sửa để giữ hành vi y nguyên — chờ người dùng đồng ý.
- Route `/gameplay/levels/level-test` trỏ tới `gameplay/levels/level-test.html` không tồn tại. Lỗi có từ trước, ngoài phạm vi.
- Khi làm chương 2: tạo `js/levels/<chương>/chapter.js` theo hợp đồng `engine/chapter.js`. Hành vi quân/boss mới dùng được nhiều chương thì thêm vào engine.
- Chưa commit (chờ người dùng yêu cầu `/commit-master`).
