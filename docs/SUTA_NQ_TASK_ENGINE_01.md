# SỬ TA — CHƯƠNG 7: NGÔ QUYỀN
# TASK CARD: NQ-ENGINE — CƠ CHẾ CHUNG MỚI CHO CHƯƠNG 7

TASK_ID: NQ-ENGINE • Version 1.0 • 11/11/2026 • **ĐÃ DUYỆT, ĐÃ LÀM** — report [REPORT_NQ-ENGINE.md](REPORT_NQ-ENGINE.md)
Task card tổng: [SUTA_NQ_TASK_00.md](SUTA_NQ_TASK_00.md) (mục 3.1, 3.2, 3.4, 3.5) • Trước đó: [NQ-SKELETON](REPORT_NQ-SKELETON.md)
Mẫu: [SUTA_PH_TASK_ENGINE_01.md](SUTA_PH_TASK_ENGINE_01.md) • Rule: `engine.md`, `ngo-quyen-gameplay.md`, `backend.md` (cột tiến trình mới)

---

## 0. MỤC TIÊU

Thêm vào engine `js/engine/` những cơ chế chương 7 cần mà engine chưa có. Mọi cơ chế viết **chung cho mọi chương** và **chỉ bật khi chương khai báo dữ liệu**, nên chương 1–6 không đổi hành vi. Thử bằng layout `?layout=engine` ở màn 1 chương 7.

Đã đọc code 11/11:

| NQ-00 | Engine hiện có | Việc |
|---|---|---|
| Thuyền nhỏ người chơi lái, lạng lách né đạn (màn 1, 3) | Hazard nổi `floatY` + bục `ride` trên lưng (`entities.js makeRidePlatform`, `hazards.js syncRidePlatforms`): người chơi đứng được nhưng không điều khiển; cưỡi trâu `state.mount` tự lao, chỉ nhảy | **E1 thuyền lái** |
| Thủy triều lên/rút, bãi lộ khi nước ròng, cọc ngầm theo triều | Cột `'~'` = khe sông cố định (`geometry.js buildTerrain`); TQP-L3 đổi địa hình giữa trận bằng `setTerrain` + gán lại `state.holes` (code riêng chương) | **E2 thủy triều + bãi triều** |
| Gió ngược đẩy lùi, nấp sau đá | Không có lực đẩy ngang; `vent` có nhịp off/warn/active; `state.covers` là vùng ẩn nấp | **E3 gió ngược** |
| Xoáy nước kéo thuyền | Không có | **E4 xoáy nước** |
| Vác cọc, cắm cọc lúc nước ròng; số cọc mang sang màn 3 | Gánh nặng `p.burden` chỉ bật lúc vào màn (`LEVEL.burden`), bỏ bằng `releaseBurden()`; tiến trình chỉ có `rescued` (0–5, chương 5) | **E5 cắm cọc + cột `stakes`** |
| Lính thủy quăng lưới bắt người | Đạn chỉ trừ máu; `snare` choáng nhưng rơi từ trên | **E6 đạn choáng** |
| Cá sấu, lính giáo, mini-boss, ném lao, thuyền hỏa công trôi | `lurker`, `guard`, enemy `boss` + `behavior`, `carry.js`, `roller`/`drift` | **Không sửa engine** |

**Không làm:** nội dung màn thật (NQ-L1/L2), boss + kỹ năng (NQ-L3), asset. Prompt Codex `NQ_ART_01` soạn **sau** task này.

## 1. QUYẾT ĐỊNH ĐÃ CHỐT (người dùng, 11/11/2026)

| # | Câu hỏi | Quyết định |
|---|---|---|
| Q1 | Thuyền lái thế nào? | Đứng trên boong thì ←/→ lái thuyền, người đứng yên trên boong. Nhảy, đánh, ném lao vẫn dùng; lướt tắt. Thuyền chỉ đi trong khúc sông của nó; cập bờ thì nhảy lên bờ |
| Q2 | Thủy triều ảnh hưởng địa hình? | **Có bãi triều**: cột mới, nước ròng đi bộ được, nước lớn thành sông; đứng trên bãi lúc triều lên thì −1 máu, về chỗ đứng vững; báo trước ~2 s. Cọc ngầm chỉ đâm khi nước ròng; mốc cắm cọc nằm trên bãi |
| Q3 | Lưu số cọc? | **Cột mới `chapter_progress.stakes`** (0–6), migration 013 |
| Q4 | Quăng lưới? | **Đạn lưới vòng cung gây choáng ~1 s, không mất máu** (tuỳ chọn `stun` của đạn); lướt hoặc nhảy né được |

---

## 2. TRIỂN KHAI

### E1 — Thuyền lái (`boat`)
- **Khai báo:** sprite hazard `boat: { speed, deckTop, inset, dock? }` + `ride` tự suy ra từ `deckTop`/`inset`. Đặt bằng `makeHazard('boat', id, chunk, localX, { floatY })` trong khe sông; `hazard.span` = khúc nước chứa thuyền (tính lúc dựng và mỗi lần triều đổi, E2).
- **Lái:** người chơi đứng trên bục của thuyền (`p.platform.attached` là thuyền `boat`) và đứng đất → `move` (←/→) không đổi `p.vx` mà đổi `boat.vx = move × speed`; người chơi đi theo qua `platform.dx` (đã có). `p.facing` vẫn theo phím. Thả phím thì thuyền trôi chậm lại (`drag`) rồi dừng.
- **Giới hạn:** mép thuyền không vượt khúc nước `span` (chạm bờ thì dừng). Bờ cao hơn mặt boong ≤ tầm nhảy nên luôn nhảy lên bờ được.
- **Khi ở trên thuyền:** lướt bị tắt (bỏ `pressed.dash`); nhảy, đánh, ném vẫn chạy. Animation người chơi: `row` nếu manifest có, không thì `idle` (strip `row` giao `NQ_ART_01`, không bắt buộc).
- **Va chạm:** thuyền có `hp` thì bị chém/húc như hazard thường; hazard `rammable` không áp dụng cho thuyền. Vật cản trên mặt nước (cọc ngầm E2, xoáy E4, hazard có `damage`) gây sát thương cho **người trên thuyền** theo luật hazard sẵn có.
- **F2:** vẽ `span` của thuyền.

### E2 — Thủy triều + bãi triều (`LEVEL.tide`)
- **Khai báo:** `LEVEL.tide = { period, high, low, warn, rise }` (giây nước lớn, giây nước ròng, giây báo trước, độ dâng mặt nước px). Màn không khai báo thì không có gì đổi.
- **Cột `','` bãi triều** (hàng cuối lưới địa hình): mặt đất (level 0) khi nước ròng, cột nước (`water`) khi nước lớn. `buildTerrain` thêm mảng `flats`; hàm mới `setTide(high)` đổi `levels`/`water` của các cột bãi rồi gán lại `state.holes = terrainHoles()` và `span` của mọi thuyền.
- **Đồng hồ:** `state.tide = { phase: 'low'|'rising'|'high'|'falling', time, level 0–1 }`, chạy trong `level-flow.js update`. `rising` kéo dài `warn` giây: hiện thông báo `text.tideRising` + ô HUD nhấp nháy; hết `warn` mới gọi `setTide(true)`. Chương ép triều bằng `forceTide('low'|'high')` (màn 3 GĐ 2).
- **Đứng trên bãi lúc triều lên:** người chơi rơi vào khe nước như thường → `respawnAfterFall` về `p.safeSpot` (đã có cho khe sông). `rememberSafeSpot` **không** nhận cột bãi làm chỗ đứng vững.
- **Hazard theo triều:** cờ sprite `tideOnly: 'low' | 'high'` → ngoài pha đó thì `harmful = false` và vẽ theo `anims.submerged` (thiếu thì ẩn). Dùng cho cọc ngầm (`'low'`: nhô lên, đâm thuyền/người).
- **Vẽ:** mặt nước của khe sông nâng thêm `tide.level × rise` px (`render/terrain.js drawWater`); cột bãi vẽ bằng `tiles.flat` (thiếu thì dải bùn dự phòng) khi nước ròng.
- **HUD:** ô `#tideHud` (ẩn mặc định) trong `.corner-hud`: biểu tượng lên/ròng + vạch thời gian còn lại; chỉ hiện ở màn có `tide`.

### E3 — Gió ngược (`gust`)
- **Khai báo:** hazard kind mới `gust` (vùng `w` px), sprite `cycle: { off, warn, active }` như `vent`, `force` (px/s đẩy), `dir` (−1/1). Vùng nấp: `content.shelters = [{ x, w }]` (đá chắn gió vẽ bằng hazard `prop` riêng).
- **Đẩy:** lúc `active`, người chơi trong vùng gió, không trong `shelters`, đang đứng đất hoặc trên không → `p.x += dir × force × dt` (cộng sau khi tính `vx`, trước va chạm vách). Đang lướt vẫn bị đẩy (lướt không phải chỗ nấp). Không trừ máu.
- **Báo:** `warn` phát animation báo (lá bay) + `text.gustWarn` 1 lần mỗi vùng.
- **Vẽ:** sprite `anims.idle/warn/active` nếu có; thiếu thì vệt gió vẽ bằng code.

### E4 — Xoáy nước (`whirl`)
- **Khai báo:** hazard kind mới `whirl` đặt trong khe sông, sprite `radius`, `core`, `pull` (px/s).
- **Kéo:** thuyền có tâm trong `radius` bị kéo về tâm `pull` px/s (cộng vào `boat.vx`). Tâm thuyền vào `core` → người trên thuyền mất 1 máu, về `p.safeSpot`; thuyền về chỗ đặt ban đầu (`boat.homeX`).
- Người chơi rơi trực tiếp xuống nước gần xoáy: như rơi sông thường.

### E5 — Cắm cọc + lưu số cọc
- **Đống cọc:** hazard `prop` có cờ sprite `burdenSource` → người chơi chạm vào khi không gánh, không cầm, không trên thuyền → `startBurden()` (hàm mới, đối xứng `releaseBurden()`): `p.burden = true`, `state.burden` theo `LEVEL.burden` hoặc `BURDEN`. Gánh thì đi chậm, khoá lướt (đã có).
- **Mốc cắm:** `content.stakeSpots = [{ x, planted }]` (dựng bằng `makeStakeSpot(chunk, localX)`). Mốc dùng được khi cột dưới mốc đang là đất (bãi lộ lúc nước ròng). Gánh + đứng trong `reach` của mốc chưa cắm + bấm Đánh → `planted = true`, `releaseBurden()`, `state.stakesPlanted += 1`, `hooks.onStakePlanted?.(spot)`, thông báo `text.stakePlanted(n, total)`. Đứng ở mốc lúc nước lớn (mốc ngập) thì nhắc `text.stakeFlooded`.
- **Điều kiện về đích:** `LEVEL.stakesRequired` (vd. 3): thiếu thì giữ lại trước đích như thiếu sách, câu `text.stakesMissing(n)`.
- **HUD:** ô đếm cọc dùng lại ô vật phẩm phụ (`#extraHud`, PH-ENGINE E6) với nhãn riêng; không thêm ô thứ 3.
- **Tiến trình:** trường mới `stakes` (mặc định 0) trong `progress.js emptyProgress`. `end-game.js` ghi `stakes: state.stakesPlanted` khi qua màn có `stakeSpots`; màn khác giữ giá trị cũ. Màn 3 đọc `readProgress().stakes` (vào bằng URL không có tiến trình → chương tự lấy mức tối thiểu).
- **Backend** (skill `/add-migration`): `013_progress_stakes.sql` thêm `chapter_progress.stakes SMALLINT NOT NULL DEFAULT 0 CHECK (stakes BETWEEN 0 AND 6)`; `api.py` `MAX_STAKES = 6` + `parse_progress` nhận `stakes`; `progress_repository.py` đọc/ghi cột; test cả 2 file.

### E6 — Đạn choáng
- `projectiles[…].stun` (giây) → trúng người chơi thì `stunPlayer(message, stun)` thay vì `hurtPlayer`, trừ khi `damage > 0` (khi đó trừ máu rồi choáng). Kết hợp được với `lob` (đạn vòng cung, đã có). Lướt miễn như đạn thường; đạn tan khi chạm đất/nước.

### Hợp đồng + layout thử
- `engine/chapter.js` thêm `LEVEL.tide`, `LEVEL.stakesRequired`, hazard kind `boat`/`gust`/`whirl`, cờ sprite `boat`/`tideOnly`/`burdenSource`, `projectiles[…].stun`, `tiles.flat`, `content.shelters`/`stakeSpots`, hook `onStakePlanted`, câu `text.*` mới. `engine.md` cập nhật.
- **`?layout=engine`** (màn 1 chương 7, `ENGINE_TEST` trong `ngo-quyen/config.js`), `PLACEHOLDER` vẽ hộp dự phòng tới `NQ_ART_01`, triều chu kỳ ngắn (`period` 6 s) để thử nhanh:
  - chunk 1: bến + thuyền trong khe sông 320 px + 1 xoáy;
  - chunk 2: 2 vùng gió lệch nhịp + 2 đá chắn;
  - chunk 3: bãi triều 192 px + 2 cọc ngầm `tideOnly: 'low'` + thuyền thứ 2 (đi xa hơn khi nước lớn);
  - chunk 4: đống cọc + 3 mốc trên bãi triều, `stakesRequired` 2;
  - chunk 5: lính trên bè quăng lưới (`lob` + `stun`) + 1 lính giáo.

---

## 3. TEST

| # | Test |
|---|---|
| G1 | `pytest tests` PASS (thêm test `stakes`: nhận 0–6, từ chối 7 và số âm, đọc lại đúng; `test_app.py` thêm `013`) |
| G2 | Thuyền: đứng trên boong thì ←/→ lái, đo tốc độ ≈ `speed`; không vượt bờ khúc sông; nhảy lên bờ được (đo cao bờ – boong < 83 px); lướt bị tắt trên boong, đánh và ném vẫn chạy; xuống thuyền thì đi bộ như cũ; thuyền nổi + bục `ride` của chương 3–4 (không có `boat`) không đổi |
| G3 | Triều: đo thời gian 4 pha khớp `tide`; báo trước đúng `warn` s; lúc lên, bãi thành nước và người đứng trên bãi rơi −1 máu về chỗ đứng vững (không phải về bãi); lúc ròng đi bộ qua bãi; thuyền đi xa hơn khi nước lớn và bị chặn ở mép bãi khi nước ròng (không kẹt trong đất); cọc `tideOnly: 'low'` chỉ gây sát thương lúc ròng; `#tideHud` chỉ hiện ở màn có triều |
| G4 | Gió: đo độ lùi ≈ `force × thời gian active` khi đứng yên; trong `shelters` không lùi; `warn` báo trước; không mất máu |
| G5 | Xoáy: thuyền trong `radius` bị kéo; vào `core` thì −1 máu, người về chỗ đứng vững, thuyền về `homeX`; ngoài `radius` không ảnh hưởng |
| G6 | Cọc: chạm đống cọc thì gánh (đi chậm, khoá lướt); cắm được khi mốc lộ, không cắm được khi ngập (có câu nhắc); đếm HUD đúng; thiếu `stakesRequired` bị giữ trước đích; qua màn ghi `stakes` vào sessionStorage và PUT `progress/7` (pytest); màn không có mốc giữ nguyên `stakes` cũ |
| G7 | Đạn choáng: trúng thì choáng ≈ `stun` s, máu không đổi; lướt né được; đạn `damage` thường của chương khác không đổi |
| G8 | F2 vẽ `span`, vùng gió, `radius`/`core`, mốc cọc; `?viewer=1` chạy; console sạch, trừ 401 khách, cảnh báo asset mượn và thiếu ảnh của layout thử |
| G9 | Hồi quy: 3 màn Trưng Trắc + `?layout=p2` + `?layout=skills`; `?layout=engine` màn 1 chương 2–6; màn 1 + `?layout=skills` chương 3–6; khe sông + thuyền nổi chương 3–4, đầm màn 3 chương 4 (`setTerrain` giữa trận); gánh nặng chương 5; tiến trình chương 5 vẫn lưu `rescued`; 3 màn khung chương 7 |
| G10 | `/verify-ui` màn 1 chương 7 `?layout=engine` ở desktop + điện thoại ngang; `#tideHud` không che ô sách, ô cọc, kỹ năng |

## 4. FILE

| Loại | File |
|---|---|
| Tạo | `backend/migrations/013_progress_stakes.sql`, `docs/REPORT_NQ-ENGINE.md` |
| Sửa | `js/engine/{config,chapter,state,geometry,entities,hazards,player,level-flow,damage,end-game,progress,ui}.js`, `js/engine/render/{entities,player,terrain,debug}.js`, `templates/gameplay/base.html`, `css/game/game.css`, `backend/routes/api.py`, `backend/repositories/progress_repository.py`, `tests/test_time_api.py`, `tests/test_app.py`, `js/levels/ngo-quyen/{chapter,config,level1}.js` (layout thử, câu `TEXT` mới), `.claude/rules/{engine,backend,ngo-quyen-gameplay}.md`, `docs/SUTA_NQ_TASK_00.md` (link) |
| Chỉ đọc | `js/levels/{trung-trac,ba-trieu,ly-nam-de,trieu-quang-phuc,mai-hac-de,phung-hung}/*` (không sửa) |

Câu `TEXT` mới (`tideRising`, `gustWarn`, `stakePlanted`, `stakeFlooded`, `stakesMissing`...) là câu kỹ thuật, không phải nội dung lịch sử; chốt nguyên văn khi làm, ghi trong report.

## 5. GATE

1. Không đổi hành vi chương 1–6: mọi cơ chế mới chỉ bật khi dữ liệu chương khai báo; không sửa file chương 1–6. Cột `stakes` mặc định 0, chương khác không gửi cũng hợp lệ.
2. Số mới (tốc độ thuyền, chu kỳ triều, lực gió, lực xoáy, `stun`...) là `DESIGN_BASELINE`; số riêng chương ở `ngo-quyen/config.js`.
3. Test G1–G10 ghi PASS/FAIL có số đo; FAIL hoặc sửa ngoài phạm vi → `BLOCKED`.
4. Report `/task-report`; chỉ commit khi người dùng yêu cầu. Sau đó: prompt Codex `NQ_ART_01` (thuyền nhỏ + strip `row` tuỳ chọn cho `PLAYER_MALE`/`PLAYER_FEMALE`, xoáy nước, đá chắn gió + FX gió, tile bãi triều, cọc ngầm, đống cọc, mốc cắm, lưới, lính Kiều Công Tiễn, mini-boss, Ngô Quyền NPC + chân dung, nền màn 1).
