# NPC_PLAN_TT — Kế hoạch TT-NPC-01 (Bước 0, chỉ khảo sát)

Task card: [SUTA_TT_TASK_NPC_01.md](SUTA_TT_TASK_NPC_01.md) v2.0 · Ngày khảo sát: 26/09/2026 · Trạng thái: **ĐÃ CHỐT QUYẾT ĐỊNH (26/09)** — xem cột “Team chốt” ở §4; chờ lệnh bắt đầu Phase A, chưa sửa code.

---

## 1. Tiến trình giữa các màn — backend có gì?

| Thành phần | Hiện trạng | Dùng được cho tiến trình? |
|---|---|---|
| `backend/db.py` | Bảng `users` duy nhất: `username, password, name, level INT DEFAULT 1, gold, gems` | Cột `level` có nhưng **không có code nào ghi** vào nó. Không lưu điểm/phần thưởng/cờ màn. |
| `backend/repositories/user_repository.py` | `find_by_credentials`, `exists`, `create` | Không có hàm cập nhật. |
| `backend/routes/api.py` | `/login`, `/register` (+ alias `/api/auth/*`) | Không có endpoint tiến trình. |
| `backend/routes/pages.py` | 1 route màn Trưng Trắc (2 URL alias) + `level-test` | Không có route màn 2/3, không chuyển level. |
| Phía trình duyệt | `home.js` chỉ ghi `localStorage.sutaSelectedChapter`; đăng nhập **không lưu phiên** (chỉ vẽ tên lên trang chủ). Màn chơi không biết ai đang chơi. | — |

**Kết luận:** chưa có cơ chế lưu tiến trình hay chuyển level. Theo 3.1.5 → dùng **`sessionStorage`**, gói trong module nhỏ `progress.js` (đọc/ghi/xoá), để sau này đổi sang backend chỉ sửa module đó.

### Thiết kế `progress.js` (Phase A)

- Khoá: `suta.tt.progress`. Mọi truy cập bọc `try/catch` (private mode/sessionStorage bị chặn → coi như chưa có tiến trình, không crash).
- API: `readProgress()`, `writeProgress(patch)` (merge), `clearProgress()`, `addReward(id)` (không trùng lặp), `debugProgress(level)` (dữ liệu giả lập đủ điều kiện cho `?debug=1`).
- Dữ liệu:

```js
{
  score: 0,            // điểm cộng dồn khi HOÀN THÀNH mỗi màn
  books: 0,            // 5 sau màn 1
  level1Complete: false,
  level2Complete: false,
  rewards: []          // 'BUFF_Y_CHI_KIEN_CUONG', 'SK_LE_CHAN_ARROW_RAIN', 'SK_TRUNG_NHI_SHADOW'
}
```

- Chặn truy cập: màn 2 cần `level1Complete`, màn 3 cần `level2Complete`; thiếu → `location.replace()` về màn 1. `?debug=1` → ghi dữ liệu giả lập rồi vào thẳng.
- Máu: luôn hồi đầy 5 khi bắt đầu màn (không lưu máu).

---

## 2. Tổ chức level — đề xuất

### Hiện trạng chặn việc dùng lại engine

Các số của **màn 1** đang là hằng module-level, được import trực tiếp ở nhiều nơi:

| Hằng / logic | Nơi dùng |
|---|---|
| `LEVEL_CHUNKS`, `LEVEL_WORLD_WIDTH` | `physics.js` (giới hạn camera), `render.js` (HUD chunk `n / 12`), `assets.js` (so với `stage_length` của `maps_tt.json`, chỉ cảnh báo) |
| `ZONES` (5 vùng, trời giông Z5) | `render.js` (trời, lớp giữa, tile), `assets.js` (danh sách ảnh cần tải) |
| `FINISH_X`, `FINISH_GATE` | `state.js` (`finishX`), `render.js` (cổng) |
| Câu hỏi (chunk 8), nghỉ chân (chunk 9), cốt truyện (chunk 10), điều kiện boss + 5 sách | viết cứng trong `update()` của `physics.js` |
| Số `5` sách | `physics.js`, `ui.js` (`x/5`), text `endGame` |
| Câu hỏi + đáp án | DOM viết cứng trong `trung-trac.html`, handler trong `main.js` |

### Phương án A (đề xuất) — cùng bộ module, chọn level theo tham số

- `config.js` thêm bảng **dữ liệu thuần** `LEVELS = { 1: {...}, 2: {...} }` (chunks, zones, finishX, gate, trời…) + `export let LEVEL` + `setLevel(id)` — **đúng mẫu live-binding của `VIEW_W`/`setViewWidth()`** đã có. `LEVEL_CHUNKS`, `LEVEL_WORLD_WIDTH`, `ZONES`, `FINISH_X` giữ tên cho màn 1 (không đổi hành vi); code engine đọc qua `LEVEL.*`.
- `state.js`: `createLevelState(levelId, options)` — màn 1 giữ nguyên `randomizeObstacles()`; màn 2 dựng layout cố định + NPC.
- `physics.js`: sự kiện theo level (màn 1: không còn câu hỏi; màn 2: NPC/cốt truyện) gọi qua hàm nhỏ, không rẽ nhánh rải rác.
- Template: **dùng chung** `trung-trac.html`, route truyền `level_id` → `<body data-level="...">`; `main.js` đọc để `setLevel()`.
- **Ưu:** diff nhỏ nhất, không di chuyển file, không đổi import của các module khác, không nhân bản engine; viewer/`?layout=p2` giữ nguyên.
- **Nhược:** `config.js` trở nên “biết level” (dù vẫn là dữ liệu thuần); physics có thêm nhánh theo level; phải rà mọi chỗ còn giả định 12 chunk/5 sách.

### Phương án B — tách `engine/` chung + `levels/tt-1/`, `levels/tt-2/` dữ liệu riêng

- **Ưu:** ranh giới sạch, dễ thêm màn 3 và chương sau.
- **Nhược:** di chuyển ~10 file, sửa mọi đường import, viết lại mục “Cấu trúc module” trong `CLAUDE.md`; vượt “patch nhỏ nhất” của task này, rủi ro hồi quy màn 1 cao.

**Đề xuất: A.** Nếu sau màn 3 thấy `physics.js` phình to, tách B thành task refactor riêng.

### URL (đề xuất)

| Màn | URL | Template |
|---|---|---|
| 1 | `/gameplay/levels/trung-trac` (giữ alias cũ `/gameplay/level/Trung_Trac/trung-trac.html`) | `trung-trac.html`, `level_id=1` |
| 2 | `/gameplay/levels/trung-trac/2` | Phase A: trang giữ chỗ; Phase B: `trung-trac.html`, `level_id=2` |
| 3 | `/gameplay/levels/trung-trac/3` | `trung-trac-placeholder.html` (trang giữ chỗ) |

---

## 3. Màn 1 hiện tại

### 3.1 Boss và điều kiện thắng

- `OBSTACLE_GROUPS` (`state.js`) có **10 nhóm** xáo vào chunk 1–10 = 11 chướng ngại (nhóm tháp canh tính lính gác + kỵ binh, tháp không tính). Boss **không nằm trong `OBSTACLE_GROUPS`** mà thêm riêng ở cuối `createLevelState()`: `makeEnemy(worldX(11, 510), 90, 80, 5, true)` → 11 + 1 = 12.
- Điều kiện thắng (`physics.js` cuối `update()`): khi `p.x >= finishX` — boss còn sống → giữ lại + “Hãy đánh bại lính giữ thành trước khi về đích.”; thiếu sách → giữ lại + “Bạn còn thiếu N cuốn sách…”; đủ → `endGame(true)`.
- Cổng mở: `finishGateOpen()` (`render.js`) = không còn `enemy.boss && alive` và `booksCollected >= books.length`. **Logic “boss” lặp ở 2 nơi** (physics + render) → đề xuất gom thành 1 hàm `bossAlive()` dùng chung.

### 3.2 Kiệu quan hiện tại

- Nhóm `officialPalanquin`: `makeHazard('roller', …, 708 + dx, { speed: -44, triggerX })`, **hp 0** (không chém được, chỉ né), lao sang trái, ra khỏi tầm thì xoá.
- `HAZARD_SPRITES.officialPalanquin`: `EN_HAN_PALANQUIN`, hitbox 76×44, `anims { move: walk, idle: walk, hurt, death: break }` — **chưa ánh xạ `throw`**.
- Manifest: `walk` 6 ô 8fps lặp, `throw` 4 ô 10fps **hit 3** (→ dao rời tay ở .2s, hết animation .4s), `hurt` 2 ô, `break` 6 ô. **Không có `idle`.**
- `PJ_THROWING_KNIFE`: 16×8, `loop` 4 ô 12fps, status `QA_PASS`, PNG có trên đĩa. Chưa có trong `PROJECTILE_SPRITES`/`SPRITE_8BIT_IN_GAME`.

### 3.3 Câu hỏi, nghỉ chân, cốt truyện (viết cứng)

| Mốc | Vị trí | Hành vi / text hiện tại |
|---|---|---|
| Câu hỏi | `p.x > worldX(8, 312)` (`physics.js`); DOM `#questionPanel` (`trung-trac.html`); handler `[data-answer]` (`main.js`) | “Cuộc khởi nghĩa Hai Bà Trưng bùng nổ vào năm nào?” — Năm 40 TCN / **Năm 40 SCN** / Năm 248 SCN. Đúng +500, “Chính xác! Khởi nghĩa Hai Bà Trưng bùng nổ năm 40 SCN.”; sai −1 máu, “Chưa đúng. Đáp án là năm 40 SCN; bạn mất 1 máu.” |
| Nghỉ chân | `p.x > worldX(9, 282)` | +1 máu, “Nghỉ chân: hồi 1 máu.” |
| Cốt truyện | `p.x > worldX(10, 312)` | “Mê Linh, năm 40: nghĩa quân tập hợp, chuẩn bị phất cờ khởi nghĩa.” |

### 3.4 Text nói Thi Sách đã chết

Đã grep toàn bộ `frontend/templates/` và `frontend/static/js/` (kể cả trang thư viện `gameplay/library/trung-trac.html`): **không có chỗ nào nhắc tới Thi Sách**, nên không có text nào nói ông đã chết. Chỉ có `SUTA_TT_SPRITE_BRIEF.md` (tài liệu asset) mô tả ngoại hình NPC.

Tuy vậy có **2 chỗ mâu thuẫn trình tự** với cốt truyện mới (màn 2 mới là lúc “quyết dựng cờ khởi nghĩa”, mục 5.4):
1. Câu hỏi giữa màn 1 và text đáp án khẳng định khởi nghĩa **đã bùng nổ** năm 40.
2. Cốt truyện chunk 10: “…chuẩn bị phất cờ khởi nghĩa.”

---

## 4. Quyết định cần team chốt (mục 3.1.4 + phát sinh)

Cột “Đề xuất” là mặc định sẽ làm nếu team duyệt không ý kiến.

| # | Vấn đề | Đề xuất | Team chốt 26/09 |
|---|---|---|---|
| D1 | Câu hỏi giữa màn 1 | **Bỏ** khỏi màn 1: xoá trigger chunk 8, DOM `#questionPanel` câu năm 40, handler `[data-answer]`. Giữ CSS `.panel`/`.answers` để màn 2 dùng. | **Giữ** câu hỏi năm 40 ở màn 1 (tạm thời; sẽ thay khi có bộ câu hỏi chi tiết). |
| D2 | Cốt truyện chunk 10 “Mê Linh, năm 40: … chuẩn bị phất cờ khởi nghĩa.” | **Bỏ** (mâu thuẫn trình tự với 5.4, và người chơi lúc này đang ở ngoài thành Luy Lâu chứ không ở Mê Linh). Nếu team muốn giữ 1 dòng dẫn truyện, xin team cung cấp câu (nội dung lịch sử — Claude không tự viết). | **Giữ** nguyên dòng cốt truyện chunk 10 (tạm thời, cùng đợt với D1). |
| D3 | Nghỉ chân chunk 9 (+1 máu) | Giữ nguyên. | Theo đề xuất. |
| D4 | Text cổng/kết thúc màn 1 (không nói “chiếm”/“hạ” Luy Lâu) | Xem bảng text cũ → mới ở §5. | Theo đề xuất (§5). |
| D5 | Kiệu `roller` trong nhóm xáo | Giữ nguyên (theo 3.1.2). Lưu ý: người chơi sẽ gặp kiệu 2 lần (roller hp 0 không chém được, rồi mini-boss chém được) — có thể gây khó hiểu. Phương án thay: đổi nhóm roller sang xe cống thứ 2… (team chọn). | **Bỏ** kiệu `roller` khỏi nhóm xáo, thay bằng **enemy khác**; kiệu chỉ còn là mini-boss. Mặc định: thêm 1 nhóm **lính canh `EN_HAN_GUARD`** (hp 2, đứng yên, đánh cận chiến), vì đã có sẵn hành vi và asset. Vẫn đủ 10 nhóm + mini-boss = 12. *Chờ team xác nhận loại enemy.* |
| D6 | Kiệu không có `idle`: khi đứng chờ ném (trong tầm, giữa 2 lần ném) vẽ gì? | Dừng ở **ô 1 của `walk`** (không chạy chân). Không vẽ asset mới. | Theo đề xuất. |
| D7 | Hướng mặt mini-boss | Đi tuần: quay theo hướng đi; trong tầm/đang ném: quay về phía người chơi. | Theo đề xuất. |
| D8 | Thanh máu mini-boss | Vẽ như hazard có hp (màu đỏ như boss cũ). | Theo đề xuất. |
| D9 | Điểm mini-boss | Mỗi đòn +100 (như hazard), hạ +700 (như boss cũ). | Theo đề xuất. |
| D10 | Hitbox dao / điểm ra dao | Dao 12×5 (hình 16×8, bớt cán), `muzzle` 24 px so với chân — DESIGN_BASELINE, soát lại bằng `?viewer=1` + F2. | Theo đề xuất. |
| D11 | Chuyển màn 1 → 2 | Panel “Hoàn thành Màn 1” có nút **“Sang Màn 2”** (không tự chuyển, để người chơi đọc điểm). Ghi progress trước khi hiện panel. | Theo đề xuất. |
| D12 | Điểm khi thua ở màn 2 | Chơi lại màn 2 bắt đầu bằng điểm đã lưu sau màn 1; điểm kiếm trong lượt thua bị bỏ. | Theo đề xuất. |
| D13 | Thời điểm ghi phần thưởng | Ghi ngay khi trả lời đúng (`addReward`, không trùng lặp). `level2Complete` chỉ bật khi qua cuối màn 2 → màn 3 vẫn bị chặn nếu chưa xong. | Theo đề xuất. |
| D14 | Điểm câu hỏi màn 2 (“thang điểm hiện có” = +500) | Đúng ngay lần đầu **+500**, đúng sau khi đã sai **+250**; sai: −1 máu, không trừ điểm (như câu hỏi cũ). | Theo đề xuất. |
| D15 | Cuối màn 2 có cổng/vật mốc? | Không vẽ cổng (không có asset phù hợp cho cửa sông Hát); chỉ trigger ở `finishX` = cuối chunk 4 − 96 px. | Theo đề xuất. |
| D16 | Hố ở màn 2 | Không có hố (cầu mới thử ở `?layout=p2`, chưa chốt cho màn thật). | Theo đề xuất. |
| D17 | Trình tự địa lý | Màn 1 kết thúc ở ngoài thành Luy Lâu (Z5, trời giông); màn 2 lại bắt đầu ở làng (Z1). Team xác nhận đây là cốt truyện hồi tưởng / cảnh khác, hay cần câu giới thiệu? Màn hình đầu màn 2 hiện chỉ có 1 dòng “Màn 2: Chiêu mộ hiền tài” theo 3.2.5. | **Xác nhận** trình tự (màn 2 bắt đầu ở làng); không thêm câu giới thiệu. |
| D18 | Kích thước canvas | Task ghi “canvas 480×270”; thực tế khung nhìn rộng 480–640 (`VIEW_W`, team 26/09). Màn 2 dùng cùng cơ chế `VIEW_W` — hiểu “480×270” là “cùng canvas với màn 1”. | **Dùng cùng canvas với màn 1** (cơ chế `VIEW_W` 480–640). |

### Mâu thuẫn nhỏ giữa `CLAUDE.md` và code (không chặn task, báo để biết)

- `CLAUDE.md` ghi `reedCurtain` 76×20; `state.js` truyền `makeObstacle('reedCurtain', …, 76, 32, …)`. Màn 2 sẽ dùng đúng số đang chạy trong màn 1 (76×32) trừ khi team nói khác.

---

## 5. Text đổi ở màn 1 (cũ → mới)

| Vị trí | Cũ | Mới (đề xuất) |
|---|---|---|
| `trung-trac.html` `<title>` | SUTA – Màn thử Trưng Trắc | SUTA – Trưng Trắc · Màn 1: Vượt ải |
| `trung-trac.html` loading `<h1>` | Màn thử Trưng Trắc | Màn 1: Vượt ải |
| `main.js` thông báo đầu màn | Thu thập 5 cuốn sách và vượt qua các chướng ngại vật. | Thu thập 5 cuốn sách, vượt chướng ngại và hạ kiệu quan. |
| `physics.js` hạ boss | Đã đánh bại toán lính giữ thành! | Đã hạ kiệu quan! |
| `physics.js` giữ ở cổng | Hãy đánh bại lính giữ thành trước khi về đích. | Hãy hạ kiệu quan trước khi qua cổng. |
| `physics.js` `endGame(true)` tiêu đề | Hoàn thành màn thử! | Hoàn thành Màn 1: Vượt ải |
| `physics.js` `endGame(true)` nội dung | Bạn thu thập 5/5 sách và đạt N điểm. | Bạn thu thập 5/5 sách và đạt N điểm. (giữ) |
| Nút panel thắng | Chơi lại | Sang Màn 2 (+ giữ phím R chơi lại) |

Câu hỏi năm 40 và dòng cốt truyện chunk 10 **giữ nguyên** (D1–D2). Không có text nào nói “chiếm”/“hạ” thành Luy Lâu, và đề xuất mới không thêm. Text lịch sử màn 2 lấy **nguyên văn** mục 5 của task card.

---

## 6. OWNED FILES theo phase

Thư mục gốc JS: `frontend/static/js/levels/trung-trac/` (viết tắt `tt/`).

### Phase A — Sửa màn 1 + chuyển màn

| File | Loại | Mục đích |
|---|---|---|
| `tt/progress.js` | **mới** | Đọc/ghi/xoá tiến trình `sessionStorage`, guard + `?debug=1`. |
| `tt/config.js` | sửa | `LEVELS` + `LEVEL`/`setLevel()`; hằng mini-boss (hp 6, patrol 160, 30 px/s, fireRange 240, fireInterval 2.5 — DESIGN_BASELINE); `HAZARD_SPRITES.palanquinBoss` (thêm `throw`, `muzzle`); `PROJECTILE_SPRITES.throwingKnife`; thêm `PJ_THROWING_KNIFE` vào `SPRITE_8BIT_IN_GAME`. |
| `tt/state.js` | sửa | `createLevelState(levelId, options)`; màn 1: bỏ boss Tô Định, thêm mini-boss chunk 11; trong `OBSTACLE_GROUPS` thay nhóm kiệu `roller` bằng nhóm enemy khác (D5). Giữ `questionShown`/`storyShown`/`restUsed`. |
| `tt/geometry.js` | sửa (nhỏ) | `makeHazard` nhận thêm thông số tuần tra (`patrolMin/Max`) nếu cần. |
| `tt/physics.js` | sửa | Hành vi mini-boss (tuần tra → dừng → ném tại `hit_frame` → chu kỳ 2.5s); `bossAlive()` dùng chung; trigger câu hỏi/nghỉ chân/cốt truyện giữ nguyên nhưng chỉ chạy ở màn 1; điều kiện qua cổng; `endGame(true)` ghi progress; camera dùng `LEVEL`. |
| `tt/render.js` | sửa | Hướng mặt mini-boss (D7), ô đứng chờ (D6), thanh máu (D8), cổng dùng `bossAlive()`, HUD chunk theo `LEVEL`. |
| `tt/ui.js` | sửa (nhỏ) | `x/N` sách theo `state.books.length`; ref nút sang màn. |
| `tt/main.js` | sửa | Đọc `data-level`, `setLevel()`, guard progress; giữ handler câu hỏi; nút “Sang Màn 2”. |
| `tt/assets.js` | sửa (nhỏ) | So `stage_length` theo `LEVEL` (chỉ cảnh báo). |
| `tt/placeholder.js` | **mới** | Trang giữ chỗ (màn 2 tạm ở Phase A, màn 3): guard, tóm tắt điểm/phần thưởng, nút chơi lại từ màn 1 (`clearProgress`). |
| `frontend/templates/gameplay/levels/trung-trac.html` | sửa | Đổi tiêu đề, `data-level`; giữ `#questionPanel` (D1). |
| `frontend/templates/gameplay/levels/trung-trac-placeholder.html` | **mới** | Trang giữ chỗ dùng chung CSS màn. |
| `frontend/static/css/levels/trung-trac.css` | sửa (nhỏ) | Style trang giữ chỗ nếu cần. |
| `backend/routes/pages.py` | sửa | Route `/gameplay/levels/trung-trac/2`, `/3`. |
| `tests/test_app.py` | sửa | Thêm assert 200 cho 2 route mới trong `test_pages_render`. |
| `docs/REPORT_TT-NPC-01.md` | **mới** | Report Phase A. |

### Phase B — Màn 2 “Chiêu mộ hiền tài”

| File | Loại | Mục đích |
|---|---|---|
| `tt/dialogue-data.js` | **mới** | Nội dung mục 5 **nguyên văn** (thoại, câu hỏi, đáp án, gợi ý, vì sao đúng, phần thưởng, cốt truyện) + id phần thưởng. Tách riêng để đối chiếu từng chữ. |
| `tt/dialogue.js` | **mới** | Panel hội thoại DOM: chân dung, tên, câu thoại bấm-tiếp, câu hỏi 3 đáp án xáo, sai → mờ + gợi ý + chọn lại, đúng → vì sao đúng + phần thưởng; phím 1–3/Enter/Space + cảm ứng; panel cốt truyện grayscale. |
| `tt/config.js` | sửa | `LEVELS[2]` (4 chunk, vùng Z1/Z2/Z4 trời ngày), `NPC_SPRITES`, hằng NPC (khoảng kích hoạt 32, vùng cấm vật cản 96, thời gian mờ dần) — DESIGN_BASELINE; thêm NPC vào `SPRITE_8BIT_IN_GAME`. |
| `tt/state.js` | sửa | Layout màn 2 cố định: 5–6 vật cản (`fenceLow`, `logDrift`, `bambooSlope`, `fallenBranch`, `stoneBlock`, 1 `reedCurtain`/`slideBar`), 3 NPC; không hazard/enemy/sách/hố. |
| `tt/physics.js` | sửa | Kích hoạt cuộc gặp (≤32 px, tạm dừng), giữ người chơi trước NPC chưa gặp, cốt truyện khi vào chunk 2, kết thúc màn 2 → progress → màn 3. |
| `tt/render.js` | sửa | Vẽ NPC (`idle`/`talk`, quay về phía người chơi, mờ dần sau khi gặp); F2 hitbox NPC/trigger. |
| `tt/assets.js` | sửa (nhỏ) | Tải portrait (`PORTRAIT_*`) cho DOM nếu cần URL. |
| `tt/ui.js` | sửa (nhỏ) | HUD màn 2 (ẩn ô Sách). |
| `tt/main.js` | sửa | Wiring panel hội thoại; intro “Màn 2: Chiêu mộ hiền tài”. |
| `frontend/templates/gameplay/levels/trung-trac.html` | sửa | DOM `#dialoguePanel`. |
| `frontend/static/css/levels/trung-trac.css` | sửa | Style panel hội thoại (`image-rendering: pixelated`, `filter: grayscale(1)`), responsive dọc/ngang. |
| `backend/routes/pages.py` | sửa | `/2` render `trung-trac.html` với `level_id=2`. |
| `assets/sprites/manifest_tt.json` → chép sang `frontend/static/assets/images/sprites-8bit/manifest_tt.json` | sửa `status` | NPC, portrait, `PJ_THROWING_KNIFE` → `IN_GAME` (chỉ trường `status`). |
| `assets/maps/trung-trac/maps_tt.json` → chép sang `maps-8bit/maps_tt.json` | sửa `status` | Vật cản P2 đưa vào màn 2 → `IN_GAME`. |
| `CLAUDE.md` | sửa | Cấu trúc 3 màn, tổ chức level, tiến trình, mini-boss, NPC/câu hỏi; boss Tô Định tạm không dùng. |
| `docs/REPORT_TT-NPC-01.md` | sửa | Report Phase B. |

### READ-ONLY

`SUTA_TT_SPRITE_BRIEF.md`, `SUTA_TT_MAP_BRIEF.md`, `docs/REPORT_TT-INT-01.md`, `docs/REPORT_TT-MAP-01.md`, `docs/SUTA_TT_TASK_NPC_01.md`, mọi PNG/GIF (không vẽ/sửa ảnh), `tt/animation.js`, `tt/input.js`, `tt/viewer.js`, `backend/db.py`, `backend/repositories/*`, `backend/routes/api.py`, `frontend/static/js/home.js`, `frontend/static/js/levels/level-test.js`.

Không đụng code/asset boss Tô Định (`ENEMY_SPRITES.boss`, `BOSS_TO_DINH_*`) — chỉ không tạo trong màn 1.

---

## 7. Luồng màn 1 → 2 → 3

```text
/gameplay/levels/trung-trac  (Màn 1: Vượt ải)
   │  bắt đầu: máu 5, điểm 0
   │  12 chướng ngại xáo (chunk 1–10) + mini-boss kiệu quan (chunk 11)
   │  cổng mở khi: mini-boss hạ + 5/5 binh thư
   │  chạm finishX → writeProgress({score, books:5, level1Complete:true})
   │  panel "Hoàn thành Màn 1" → [Sang Màn 2]
   ▼
/gameplay/levels/trung-trac/2  (Màn 2: Chiêu mộ hiền tài)
   │  guard: level1Complete? không → về màn 1  (?debug=1 → giả lập)
   │  bắt đầu: máu 5, điểm = progress.score
   │  chunk 1 Thi Sách ─► vào chunk 2: cốt truyện Thi Sách hy sinh
   │  chunk 3 Lê Chân ─► chunk 4 Trưng Nhị   (đúng → addReward)
   │  thua (hết máu) → chơi lại màn 2, điểm về progress.score
   │  chạm cuối chunk 4 (đủ 3 NPC) → writeProgress({score, level2Complete:true})
   ▼
/gameplay/levels/trung-trac/3  (giữ chỗ)
   │  guard: level2Complete? không → về màn 1  (?debug=1 → giả lập)
   │  "Màn 3: Trận Luy Lâu — đang phát triển", điểm, 3 phần thưởng
   │  [Chơi lại từ màn 1] → clearProgress() → màn 1
```

Phase A: `/2` là trang giữ chỗ (cùng `placeholder.js`) hiển thị dữ liệu mang sang, để test chuyển màn trước khi có Phase B.

---

## 8. Rủi ro

| Rủi ro | Giảm thiểu |
|---|---|
| Đổi hằng level-wide (`LEVEL_CHUNKS`, `ZONES`, `FINISH_X`) sang `LEVEL.*` gây hồi quy màn 1 (camera, hoà vùng, cổng). | Giữ nguyên giá trị màn 1; test hồi quy 3 lượt + `?layout=p2` + `?viewer=1`. |
| `sessionStorage` bị chặn / mất khi đóng tab → người chơi mở lại màn 2 bị đẩy về màn 1. | Chấp nhận cho prototype (đúng yêu cầu 3.1.5); ghi TODO chuyển sang backend (`users.level` đã có cột). |
| Mini-boss đứng giữa người chơi và cổng, dao bay 276 px — có thể quá khó khi kèm đội hình ngẫu nhiên ở chunk 10. | Số là DESIGN_BASELINE, chờ chơi thử. |
| Kiệu thiếu `idle` → đứng chờ trông cứng (D6). | Ghi vào “Vấn đề asset” của report, đề xuất Codex bổ sung `idle` nếu team muốn (`NEED_REDRAW` không cần — thiếu animation chứ không lỗi). |
| Vật cản P2 lần đầu vào màn thật; `logDrift` hitbox mới là DESIGN_BASELINE. | Kiểm F2 theo Test B. |
| Panel hội thoại trên điện thoại dọc (canvas chỉ ~359×202) — text dài (mục “Vì sao đúng”) khó đọc. | Panel DOM cuộn được, cỡ chữ theo khung `--stage-w`; test dọc/ngang. |
| Tạm dừng game trong lúc nhận phím 1–3/Enter/Space: phím Space đang là “nhảy” → có thể lọt 1 cú nhảy khi đóng panel. | `clearInput()` khi mở và khi đóng panel (như câu hỏi cũ). |
| Text lịch sử sai lệch khi chép. | Đặt riêng `dialogue-data.js`, đối chiếu từng chữ với mục 5 trong Test B. |
