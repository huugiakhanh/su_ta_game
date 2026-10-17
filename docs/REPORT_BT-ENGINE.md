# REPORT BT-ENGINE — Cơ chế chung mới cho chương 2

Task card: [SUTA_BT_TASK_ENGINE_01.md](SUTA_BT_TASK_ENGINE_01.md)

## Phase A — 16/10/2026 — PASS (chờ người chơi thử duyệt)

### Quyết định người dùng chốt
Duyệt task card nguyên đề xuất Q1–Q5: Phase A → BT-SKELETON → Phase B; BXH Quiz gộp mọi chương; không rơi xuyên bục; lướt không miễn chướng khí; `/quiz` Bà Triệu tạm lọc 5 câu 15, 33, 37, 41, 45.

### File đã sửa
| File | Mục đích |
|---|---|
| `backend/routes/pages.py` | E1: `render_trung_trac()` → `render_chapter_level(slug, level_id, title)`; mọi URL Trưng Trắc giữ nguyên |
| `tests/test_time_api.py` | E1: test 4 URL Trưng Trắc (cũ/mới) → 200, đúng `data-level`, đúng script chương (không cần DB) |
| `frontend/templates/quiz.html`, `frontend/static/css/quiz.css`, `frontend/static/js/quiz.js` | E2: nút chọn chương, `QUIZ_BANKS` + `excluded`, `?chapter=<slug>`; đổi chương nạp lại bộ câu, cập nhật `max` thanh kéo; chặn kết quả nạp cũ về trễ (`loadToken`) |
| `frontend/static/js/engine/damage.js` | E3: `hurtPlayer(reason, amount = 1)`, máu kẹp ≥ 0, `hitsTaken` +1 mỗi lần trúng |
| `frontend/static/js/engine/enemies.js`, `hazards.js` | E3: truyền `rules.damage` (cú đánh lính), `damage` của hazard/đạn — mặc định 1 |
| `frontend/static/js/engine/combat.js` | E4: `strikeEnemy/strikeHazard/strike(…, damage = 1)`, `onStruck(enemy, damage)`, `attackDamage()` + `playerStrike()` (hook `CHAPTER.skills.attackDamage`, chí mạng → tiếng `crit` nếu chương có + `hooks.onCrit`) |
| `frontend/static/js/engine/player.js` | E4: đòn chém đi qua `playerStrike()` |
| `frontend/static/js/engine/chapter.js` | Chú thích hợp đồng: `damage`/`rules.damage`, `skills.attackDamage?`, `hooks.onCrit?`, `onStruck(enemy, damage)` |
| `.claude/rules/engine.md`, `web-pages.md`, `trung-trac-gameplay.md` | Ghi cơ chế mới |

Không sửa file nào trong `js/levels/trung-trac/`.

### Kết quả test
| # | Test | Kết quả |
|---|---|---|
| A1 | `pytest tests` | PASS — 82 passed, 1 skipped (`test_app.py` cần DB test, tự skip) |
| A2 | Hồi quy Trưng Trắc (mô phỏng `update(1/60)` vì ô trình duyệt bị ẩn nên `requestAnimationFrame` không chạy) | PASS — màn 1: lính đâm 3 lần −3 máu (1/lần), đạn lính thu thuế −1, hố chông −1, chém lính 2 hp chết sau 2 đòn, lính tháp 2 hp chết sau 2 đòn, kiệu quan 6→4 sau 2 đòn; màn 2: chém lính chết, rơi hố −1; màn 3: chiến xa chặn đòn chém thẳng (3→3), mưa tên (K) + bóng Trưng Nhị (L) chạy; `?layout=skills`, `?viewer=1` nạp được; console chỉ có 401 của tiến trình khách (đúng thiết kế) |
| A3 | Hook giả trong console | PASS — mặc định `{damage:1, crit:false}`; hook trả `{damage:2, crit:true}` → bao cát 99→97, `onCrit` gọi 1 lần; gỡ hook → về 1; `hurtPlayer('…', 2)` 5→3 máu, `hitsTaken` +1 |
| A4 | `/quiz` | PASS — `?chapter=ba-trieu` chọn sẵn Bà Triệu: 45 câu (đã lọc 5), `max` = 45; đổi sang Trưng Trắc: 50 câu; chơi hết lượt 2 câu Bà Triệu, khách được nhắc đăng nhập (401) |
| A5 | Giao diện `/quiz` | PASS một phần — desktop 800×600 và điện thoại dọc 375×812 (không cuộn ngang, 2 nút chương nằm gọn 67–308px). **Chưa đo** laptop, điện thoại ngang, tablet |

**Chưa kiểm được:** chơi tay thật từ đầu tới cuối 3 màn (ô trình duyệt ẩn, chỉ mô phỏng theo khung hình); giai đoạn 3 Tô Định đi bộ không chạy tới trong mô phỏng — đường đi `onStruck` chỉ thêm tham số, hp vẫn trừ 1 như cũ.

### Vấn đề asset
Không có.

### TODO / câu hỏi cho team
- 5 câu Bà Triệu tạm lọc trong `/quiz` — chờ team (BT-00 §3.3).
- Bộ `/quiz` Trưng Trắc **không lọc** câu 41 (đang tạm loại trong game, REPORT_TT-QUIZ-01) — giữ nguyên như trước, chưa hỏi lại team.

### Bước tiếp
BT-SKELETON (task card riêng), rồi Phase B (bục một chiều, lưng voi, `vent`).

## Phase B — 16/10/2026 — PASS (chờ người chơi thử duyệt)

### File đã sửa
| File | Mục đích |
|---|---|
| `js/engine/entities.js` | E6–E7: `makePlatform`, `makeRidePlatform`, `platformActive`, `checkPlatformReach` (cảnh báo bục cao quá tầm nhảy ≈ 83px hoặc chồng NPC/bia) |
| `js/engine/state.js` | `state.platforms` = bục của màn + bục tự gắn cho hazard có `ride` |
| `js/engine/player.js` | E6: `landingPlatform()` — tiếp đất từ trên, nhảy từ dưới/đi ngang xuyên qua, chọn bục cao nhất; `p.platform`; E7: chở người chơi theo `platform.dx` |
| `js/engine/hazards.js` | E8: kind `vent` (`cycle` off/warn/active, `phase` lệch nhịp, harmful chỉ lúc active); `ignoreDash`; E7: `syncRidePlatforms()`, đứng trên lưng không tính va chạm thân (`ridingOn`) |
| `js/engine/geometry.js` | `makeHazard` thêm `phase`, `ventState` |
| `js/engine/render/{entities,index,debug}.js` | Vẽ bục (ảnh prop hoặc khối gỗ dự phòng), vent dự phòng tím theo trạng thái, hộp bục xanh lơ trên F2 |
| `js/engine/chapter.js` | Hợp đồng: `content.platforms`, `ride`, `cycle`, `ignoreDash`, kind `vent` |
| `js/levels/ba-trieu/{config,level1,chapter}.js` | Layout thử `?layout=engine` (`ENGINE_TEST`) + 3 sprite tạm `wildElephant`, `boulder`, `miasma` (`id: null`) |
| `.claude/rules/engine.md`, `ba-trieu-gameplay.md` | Ghi cơ chế mới + cách kiểm khi ô trình duyệt ẩn |

E5 (roller phá được): **không sửa engine** — đã có sẵn, chỉ thêm dữ liệu `boulder`.

### Kết quả test (mô phỏng `update(1/60)` + `setKey()` vì ô trình duyệt ẩn)
| # | Test | Kết quả |
|---|---|---|
| B1 | Bục một chiều | PASS — đứng dưới bục 1 (cao 40) nhảy thẳng lên: xuyên qua rồi đáp, chân = 208 = mặt bục; đi ra mép → rơi về 248; đi ngang dưới bục 2 (cao 72) không bị chặn (x 340 → 452); từ bục 1 nhảy sang bục 2 → đứng chân 176 |
| B2 | Bục trên hố | PASS — đứng 60 frame trên bục bắc qua hố, máu 5/5; rời bục → rơi hố, −1 máu, hồi sinh |
| B3 | Voi rừng | PASS — chưa kích hoạt: bục lưng không dùng được (rơi qua, chân 248); va ngang −1 máu; đứng trên lưng 120 frame: được chở −120px đúng bằng voi, máu không đổi |
| B4 | Chướng khí | PASS — 3 miệng lệch nhịp (active/off/off cùng lúc); đứng dưới đất chỉ trúng lúc `active`; đứng trên cành (cao 60) 300 frame không mất máu; lướt xuyên lúc `active` vẫn −1 máu |
| B5 | Đá lăn | PASS — chém 2 đòn vỡ và biến mất; nhảy qua được khi nhảy lúc đá cách 10–18px, nhảy sớm (40px) hoặc muộn (4px) thì trúng — cửa sổ canh nhịp hẹp, chỉnh tốc độ/cỡ ở BT-L1 |
| B6 | F2 / viewer | PASS — chụp F2: cành cây + hộp bục xanh lơ, người chơi đứng trên cành, 3 vùng khí tím; `?viewer=1` cả 2 chương nạp không lỗi |
| B7 | Hồi quy Trưng Trắc | PASS — màn 1: bot đi hết màn (bậc đất, hố, hạ mini-boss), bị giữ ở cổng vì bot chỉ nhặt 3/5 sách (đúng luật); màn 2: qua trọn (2 hố, gặp đủ 3 NPC); màn 3: phá hết khiên chiến xa, sang giai đoạn 2; `?layout=p2`, `?layout=skills` nạp không lỗi |
| B8 | `pytest tests` | PASS — 93 passed, 1 skipped. `/verify-ui` điện thoại ngang cho layout thử: **chưa đo** (bục/vent còn là khối tạm) |

### Ghi chú
- Console màn Bà Triệu có cảnh báo "maps_tt.json: stage khác engine/chương" — do chương 2 mượn map chương 1 (9216px) cho màn 4608px; vô hại, hết khi có map riêng.
- Không có thao tác rơi xuyên bục (Q3). Quân địch/hazard/đạn không dùng bục.

### Bước tiếp
Soạn prompt Codex `BT_ART_01` (màn 1), rồi BT-L1 (8 loại chướng ngại + mini-boss Tham quan thu thuế).
