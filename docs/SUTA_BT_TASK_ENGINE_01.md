# SỬ TA — CHƯƠNG 2: BÀ TRIỆU
# TASK CARD: BT-ENGINE — CƠ CHẾ CHUNG MỚI CHO CHƯƠNG 2

TASK_ID: BT-ENGINE • Version 1.0 • 16/10/2026 • **CHỜ DUYỆT**
Task card tổng: [SUTA_BT_TASK_00.md](SUTA_BT_TASK_00.md) (mục 3.1, 3.4)
Rule áp dụng: `.claude/rules/engine.md`, `.claude/rules/web-pages.md` (phần `/quiz`), `.claude/rules/backend.md`

---

## 0. MỤC TIÊU

Thêm vào engine `js/engine/` những cơ chế chương Bà Triệu cần mà engine chưa có, viết **chung cho mọi chương**, và gỡ những chỗ còn cứng cho Trưng Trắc ở route gameplay và trang `/quiz`.

| # | Hạng mục | Hiện trạng (đã đọc code 16/10) | Cần làm |
|---|---|---|---|
| E1 | Route/template gameplay theo chương | `render_trung_trac()` cứng template `trung-trac.html` (`backend/routes/pages.py:59`) | Helper chung |
| E2 | `/quiz` chọn chương | `quiz.js:31` cứng `trung-trac-question.json` | Chọn bộ câu |
| E3 | Sát thương > 1 | `hurtPlayer(reason)` luôn −1 máu (`damage.js`) | Tham số lượng máu |
| E4 | Chí mạng | `strikeEnemy`/`strikeHazard` luôn −1 hp (`combat.js`) | Lượng sát thương + hook của chương |
| E5 | Roller phá được (đá lăn) | **Đã có**: hazard `roller` có `hp > 0` chém được (`player.js` `updateAttack`), `corpse` nằm lại (xe cống chương 1); roller đi theo bậc đất | **Không sửa engine** — chỉ kiểm lại ở BT-L1 |
| E6 | Bục lơ lửng một chiều | Chỉ có bậc đất liền + vật cản đứng được; không có bục | Mới |
| E7 | Bục di chuyển gắn hazard (lưng voi rừng) | Không có | Mới |
| E8 | Vùng hazard theo nhịp (chướng khí) | Không có | Kind hazard mới `vent` |

**Không làm trong task này:** nội dung màn, asset, kỹ năng Khiên mây tre / Gọi Bạch Tượng (phần riêng chương — làm ở BT-L2/BT-L3 qua khe kỹ năng có sẵn), cơ chế cưỡi voi.

## 1. CHIA PHASE

Cơ chế E6–E8 cần một màn để thử mà chưa có màn Bà Triệu → chia 2 phase, xen BT-SKELETON ở giữa:

| Phase | Hạng mục | Thử trên |
|---|---|---|
| **A** | E1, E2, E3, E4 | 3 màn Trưng Trắc (không đổi hành vi) + `/quiz` |
| *(BT-SKELETON — task card riêng)* | khung chương `ba-trieu` chạy bằng asset chương 1 | |
| **B** | E6, E7, E8 (+ kiểm E5) | layout thử `?layout=engine` ở màn 1 Bà Triệu + hồi quy Trưng Trắc |

Mỗi phase: kế hoạch file → duyệt → code → test → report → **dừng chờ duyệt**.

---

## 2. PHASE A

### E1 — Route gameplay chung
- `pages.py`: thay `render_trung_trac(level_id, title)` bằng `render_chapter_level(slug, level_id, title)` → `render_template(f"gameplay/levels/{slug}.html", …)`, giữ nguyên các biến (`level_id`, `title`, `logged_in`, `player_gender`).
- Route Trưng Trắc gọi helper mới; **giữ mọi URL cũ** (cả alias `/gameplay/level/Trung_Trac/trung-trac.html`).
- Route Bà Triệu **chưa thêm** ở đây (thuộc BT-SKELETON).

### E2 — `/quiz` chọn chương
- Màn thiết lập có chọn chương: **Trưng Trắc** | **Bà Triệu**; bảng `QUIZ_BANKS = { 'trung-trac': '/static/assets/question/trung-trac-question.json', 'ba-trieu': '…/ba-trieu-question.json' }` trong `quiz.js`. Đổi chương thì nạp file, cập nhật `max` của thanh kéo.
- Tham số URL `?chapter=ba-trieu` chọn sẵn (để nút từ trang khác trỏ tới).
- **Không đổi API/DB**: `quiz_results` không có cột chương → BXH Quiz vẫn gộp mọi chương (xem câu hỏi Q2).

### E3 — Sát thương nhiều máu
- `hurtPlayer(reason, amount = 1)`: trừ `amount` máu (kẹp ≥ 0), `hitsTaken` +1 mỗi lần trúng (không cộng theo amount). Hiệu ứng mất máu HUD hiện đúng số tim mất.
- Nguồn gây sát thương đọc `amount` từ dữ liệu chương: `rules.damage` của lính (`GUARD`-like), `damage` trong `sprites.hazards[…]` / `sprites.projectiles[…]`. Không khai báo = 1 → **Trưng Trắc không đổi**.

### E4 — Chí mạng (hook chung, tỉ lệ do chương)
- `strikeEnemy(enemy, damage = 1)`, `strikeHazard(hazard, damage = 1)`: trừ `damage` hp; `kind.onStruck` nhận thêm `damage`.
- Đòn chém của người chơi (`updateAttack`) hỏi `CHAPTER.skills?.attackDamage?.(target)` → số hoặc `{ damage, crit }`; không có hook = 1.
- `crit: true` → engine phát `playSfx('crit')` (nếu chương khai báo) và gọi `CHAPTER.hooks?.onCrit?.(target)` để chương tự vẽ hiệu ứng/chữ — engine không ghi câu chữ riêng chương.
- Đòn kỹ năng (`strike(target)`) giữ 1 sát thương, trừ khi chương truyền số.
- Cập nhật chú thích hợp đồng `engine/chapter.js`: `skills.attackDamage?`, `hooks.onCrit?`, `damage` trong bảng sprite.

### Test A
| # | Test |
|---|---|
| A1 | `pytest tests` PASS (thêm test: mọi URL Trưng Trắc cũ/mới trả 200, đúng template) |
| A2 | Chơi hết 3 màn Trưng Trắc: lính/hazard/đạn/hố vẫn −1 máu; boss chiến xa, Tô Định nhận đòn như cũ; `?layout=p2`, `?layout=skills`, `?viewer=1` chạy, console sạch |
| A3 | Hook giả trong console (`attackDamage` trả 2, `crit`) → lính 2 hp chết sau 1 đòn; gỡ hook thì về như cũ |
| A4 | `/quiz`: chọn từng chương, thanh kéo tối đa đúng số câu bộ đó, chơi hết một lượt, gửi kết quả OK; `?chapter=ba-trieu` chọn sẵn |
| A5 | `/verify-ui` trang `/quiz` ở 5 cỡ màn hình |

---

## 3. PHASE B (sau BT-SKELETON)

### E6 — Bục một chiều (`state.platforms`)
- Dữ liệu: `{ x, y, w, h, sprite?, vx?, attached? }`; `y` = mặt trên. Dựng bằng `makePlatform(chunk, localX, heightAboveGround, w, sprite)` trong `entities.js` (`localX` = mép trái, như `makeObstacle`). `LEVEL.content()` trả `platforms`.
- Va chạm **chỉ từ trên xuống**: tiếp đất khi `vy ≥ 0`, một trong hai chân (`FOOT_MARGIN`) nằm trong `[x, x+w]`, và chân frame trước ≤ `y + GROUND_SNAP_DISTANCE`. Nhảy từ dưới lên, đi ngang: xuyên qua.
- **Không có thao tác "rơi xuống xuyên bục"**: ↓ đang là phím lướt. Muốn xuống thì đi ra mép bục (Q3).
- Đứng trên bục: `p.standingOn = platform`; đi ra mép (cả 2 chân ra ngoài) thì rơi. Lướt trên bục vẫn giữ độ cao như trên đất.
- Hố dưới bục: đứng trên bục không tính rơi hố.
- Quân địch, hazard, đạn **không** dùng bục (bay/đi xuyên).
- Vẽ: lớp sau vật cản, trước nhân vật; có `sprite` (prop trong map manifest chương, `drawMapImage`) thì vẽ ảnh, thiếu ảnh thì khối nâu dẹt dự phòng (`TODO_MISSING`, không crash). F2 vẽ hộp bục.
- Kiểm bố cục (`entities.js`): cảnh báo bục cao hơn tầm nhảy từ chỗ đứng gần nhất (dựa `JUMP_FORCE`/`GRAVITY`, như `TERRAIN_MAX_STEP`), bục chồng NPC/bia.

### E7 — Bục di chuyển gắn hazard (lưng voi rừng)
- Hazard khai báo `ride: { top, inset }` trong `sprites.hazards[…]` → engine tạo một bục `attached: hazard`, mỗi frame đặt bục theo hazard (`y = hazard.y + top`, bề ngang hazard trừ `inset` mỗi bên).
- Người chơi đứng trên bục gắn hazard thì **được chở theo** (`p.x += hazard dx` của frame).
- Va chạm thân: khi đang đứng trên bục của chính hazard đó hoặc chân ở trên mặt bục → **không** trúng đòn; va ngang vẫn trúng như roller thường.
- Hazard chết/rời màn → bục biến mất, người chơi rơi bình thường.
- Voi rừng = `roller` + `ride` + `hp: 0` (không giết được) — dữ liệu ở chương.

### E8 — Hazard `vent` (vùng phun theo nhịp)
- Kind mới trong `hazards.js`: chu kỳ `off → warn → active → off` với `durations { off, warn, active }` + `phase` lệch nhịp ban đầu (để nhiều miệng phun không đồng bộ). Animation `idle` (off), `warn`, `active`.
- Gây sát thương **chỉ khi `active`**, trong vùng `w × h` từ mặt đất lên (`h` thấp hơn bục cành cây để đứng trên cành là an toàn).
- Lướt **không** miễn sát thương của vent (cờ `ignoreDash` trên sprite, mặc định `false` cho kind khác) — nếu không người chơi lướt xuyên mọi chướng khí (Q4). Vẫn tôn trọng `invulnerable` sau khi trúng đòn.
- Không chém được (`hp: 0`). Thiếu asset: vẽ vùng tím bán trong suốt theo trạng thái.

### E5 — Kiểm roller phá được
- Đá lăn = `roller` + `hp` + anim `death` (vỡ), không `corpse`. Chỉ thêm dữ liệu ở chương; nếu kiểm thấy thiếu hành vi (vd. lăn ngược chiều, nảy theo bậc) → dừng và báo, không tự mở rộng.

### Test B (layout `?layout=engine` ở màn 1 Bà Triệu, asset tạm)
| # | Test |
|---|---|
| B1 | Nhảy từ dưới xuyên lên bục, đáp xuống đứng được; đi ra mép thì rơi; đi ngang dưới bục không bị chặn |
| B2 | Bục trên hố: đứng không rơi; rời bục rơi xuống hố → −1 máu, hồi sinh như cũ |
| B3 | Voi rừng: chạm ngang −1 máu; nhảy lên lưng không mất máu, được chở theo; voi đi khỏi màn thì rơi xuống |
| B4 | Chướng khí: chỉ gây sát thương lúc `active`; đứng trên cành không trúng; lướt qua lúc `active` vẫn trúng; nhịp lệch giữa các miệng phun |
| B5 | Đá lăn: nhảy qua được, chém đủ hp thì vỡ và biến mất |
| B6 | F2 hiện hộp bục/vent đúng; `?viewer=1` chạy; console sạch |
| B7 | Hồi quy: 3 màn Trưng Trắc + `?layout=p2` + `?layout=skills` chơi như trước |
| B8 | `pytest tests` PASS; `/verify-ui` điện thoại ngang (nút cảm ứng không che bục) |

---

## 4. FILE DỰ KIẾN (chốt ở kế hoạch từng phase)

| Phase | Sửa | Tạo |
|---|---|---|
| A | `backend/routes/pages.py`, `tests/test_app.py`, `frontend/static/js/quiz.js`, `frontend/templates/quiz.html` (+ `css/quiz.css` nếu cần), `js/engine/{damage,combat,player,enemies,hazards,chapter}.js` | — |
| B | `js/engine/{player,hazards,entities,geometry,state,chapter,level-flow}.js`, `js/engine/render/{entities,debug}.js` | — (layout thử nằm trong `js/levels/ba-trieu/` của BT-SKELETON) |
| Cả hai | `.claude/rules/engine.md` (mô tả cơ chế mới), `docs/architecture.md` nếu đổi cấu trúc | `docs/REPORT_BT-ENGINE.md` |

Chỉ đọc: `js/levels/trung-trac/*` (không sửa — hành vi chương 1 phải giữ nguyên).

## 5. CÂU HỎI CẦN CHỐT TRƯỚC KHI CODE

| # | Câu hỏi | Đề xuất |
|---|---|---|
| Q1 | Thứ tự: Phase A → BT-SKELETON → Phase B? | Đồng ý như mục 1 |
| Q2 | BXH Quiz gộp mọi chương hay tách theo chương? | **Gộp** (không đổi DB); tách thì cần migration + task riêng |
| Q3 | Có cần thao tác rơi xuyên bục không? | **Không** (↓ là lướt) |
| Q4 | Lướt có miễn chướng khí không? | **Không** (`ignoreDash`) — đúng tinh thần Excel "phải leo lên cành cây cao" |
| Q5 | `/quiz` Bà Triệu có loại 5 câu tạm loại (15, 33, 37, 41, 45) không? | Chờ team (BT-00 §3.3); trong lúc chờ: **loại** bằng danh sách lọc trong `quiz.js`, không sửa file JSON |

## 6. GATE
1. Liệt kê file đã sửa + mục đích; không sửa ngoài danh sách đã duyệt.
2. Test A/B ghi PASS/FAIL có số đo; FAIL hoặc sửa ngoài phạm vi → `BLOCKED`.
3. Mọi số mới (chu kỳ vent, kích thước bục…) là `DESIGN_BASELINE`, nằm trong `config.js` của chương, không trong engine.
4. Report `/task-report`; chỉ commit khi người dùng yêu cầu.
