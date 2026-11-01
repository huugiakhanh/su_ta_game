# SỬ TA — CHƯƠNG 3: LÝ NAM ĐẾ
# TASK CARD: LND-ENGINE — CƠ CHẾ CHUNG MỚI CHO CHƯƠNG 3

TASK_ID: LND-ENGINE • Version 1.0 • 31/10/2026 • **ĐÃ DUYỆT, ĐÃ LÀM** — report [REPORT_LND-ENGINE.md](REPORT_LND-ENGINE.md)
Task card tổng: [SUTA_LND_TASK_00.md](SUTA_LND_TASK_00.md) (mục 3.1, 3.4, 3.5) • Trước đó: [LND-SKELETON](REPORT_LND-SKELETON.md)
Mẫu: [SUTA_BT_TASK_ENGINE_01.md](SUTA_BT_TASK_ENGINE_01.md) (Phase B) • Rule: `engine.md`, `ly-nam-de-gameplay.md`

---

## 0. MỤC TIÊU

Thêm vào engine `js/engine/` những cơ chế màn 1 chương Lý Nam Đế cần mà engine chưa có, viết **chung cho mọi chương**, thử bằng layout `?layout=engine` ở màn 1 Lý Nam Đế (asset tạm/hộp dự phòng). Không đổi hành vi chương 1–2.

Đã đọc code 31/10:

| Excel | Engine hiện có | Việc |
|---|---|---|
| Thuyền chiến trên sông bắn hoả tiễn | Hố từ lưới địa hình (`terrainHoles`), rơi → −1 máu về đầu chunk +72; hazard **nổi** `floatY` + lớp vẽ chìm dưới khe sông (`drawHazards(time, true)`, di sản chương 1, chưa chương nào dùng); `thrower` chỉ bắn ngang | **E1 sông**, **E2 đạn nhắm** |
| Cung thủ tháp canh bắn chéo | `thrower` bắn ngang | **E2 đạn nhắm** |
| Bẫy lưới trúc + công tắc ẩn | `trap` (hố chông bật khi tới gần), `stunPlayer` (chương 2) | **E3 kind `snare`** |
| Xe chở cống phẩm → rơi Quyển Sách Tinh Hoa | `roller` có `hp` chém vỡ được; sách đặt cố định, tổng = `state.items.length` | **E4a sách giấu trong vật** |
| Tinh Thiều: quân màn 3 rơi bình máu | Không có vật phẩm hồi máu | **E4b bình máu rơi** |
| Chó săn | Hành vi `rusher` (quân cảm tử chương 1) | Không sửa engine — dữ liệu chương (LND-L1) |
| Đá lở | `roller` có `hp` | Không sửa engine |
| Cận vệ khiên sắt (màn 3) | `CHAPTER.enemyKinds[kind].blockStrike(enemy)` (chương 2 dùng cho kỵ binh thiết giáp) đọc được `state.player` | Không sửa engine — phần chương ở LND-L3 |

**Không làm:** nội dung màn 1 thật (LND-L1), asset (prompt Codex `LND_ART_01` làm **sau** task này — người dùng chốt), boss/kỹ năng màn 3.

## 1. QUYẾT ĐỊNH ĐÃ CHỐT (31/10/2026)

| # | Quyết định |
|---|---|
| Q1 | Đạn tháp canh + thuyền **nhắm vào người chơi** lúc nhả đạn (một cơ chế chung), không phải góc cố định |
| Q2 | Rơi xuống **sông**: −1 máu, hiện lại ở **chỗ đất/mỏm đá vững cuối cùng** vừa đứng. Hố thường giữ cách cũ (đầu chunk +72) |
| Q3 | Lưới trúc trúng: **−1 máu + trói 1 giây** (dùng `stunPlayer`), có báo hiệu trước khi rơi để còn lướt thoát |
| Q4 | Prompt Codex `LND_ART_01` làm sau LND-ENGINE |

---

## 2. TRIỂN KHAI

### E1 — Sông (hố nước)
- **Lưới địa hình**: ký tự mới `'~'` ở **hàng cuối** = cột nước (như `'.'` là hố, thêm cờ nước). `buildTerrain` lưu cờ nước theo cột; `terrainHoles()` trả `{ x, w, water: true }` cho dải nước liền nhau. Mỏm đá giữa sông = cột `'#'` (đất liền từ đáy) hoặc bục một chiều có sẵn (`makePlatform`). Lưới không có `'~'` → như cũ.
- **Vẽ**: hố nước vẽ mặt nước lặp ngang trong khe — asset map `CHAPTER.tiles.water` (ID trong manifest map chương, `drawMapImage`); chưa có asset thì dải xanh nước dự phòng (`TODO_MISSING`, không lỗi). Hố thường vẽ như cũ. Hazard nổi (`floatY`) vẫn vẽ ở lớp chìm trước mặt nước.
- **Rơi**: `player.js` nhớ `p.safeX` = vị trí khi người chơi **đứng vững** trên đất hoặc bục tĩnh (không tính lưng hazard `ride`) ở frame gần nhất. `respawnAfterFall()`: rơi vào hố `water` → −1 máu, đặt lại ở `p.safeX` (lùi vào trong mép đất `RESPAWN_EDGE_MARGIN` px), miễn thương ngắn như hiện tại; hố thường → giữ cách cũ.
- **Thuyền**: dữ liệu chương — `makeHazard('thrower', …, { groundY: GROUND_Y, floatY })` đặt giữa khe sông (engine đã hỗ trợ nổi + vẽ chìm). Không thêm kind mới.

### E2 — Đạn nhắm (có hướng)
- `makeProjectile(sprite, x, y, direction, aim = null)`: `aim = { x, y }` (điểm nhắm) → vector đơn vị `vx, vy`; không có `aim` → bay ngang như cũ (`vx = direction`, `vy = 0`).
- Hazard có `aim: true` (tuỳ chọn `makeHazard`) → `fireProjectile` nhắm vào **tâm thân người chơi** lúc đạn rời tay (`hit_frame`). Tốc độ `PROJECTILE_SPEED` hoặc `speed` của sprite đạn.
- `updateProjectiles`: dịch theo `vx, vy`; giữ luật cũ (chạm người chơi −máu, lướt xuyên được, chạm sườn đất thì tan, quá tầm thì mờ rồi tan, bị chém thì tan). Thêm: đạn ra khỏi đỉnh/đáy khung nhìn thì tan.
- **Vẽ**: ảnh đạn quay PHẢI, xoay theo góc bay (`Math.atan2(vy, vx)`) quanh tâm hitbox; hitbox giữ hình chữ nhật thẳng (`DESIGN_BASELINE` — đạn nhỏ, sai số chấp nhận được). Đạn ngang vẽ như cũ (không xoay) → chương 1–2 không đổi.
- Thêm vào hợp đồng `engine/chapter.js`: `projectiles[…].speed?`, hazard option `aim`.

### E3 — Hazard kind `snare` (bẫy rơi từ trên, công tắc ẩn)
- `makeHazard('snare', sprite, chunk, localX, { triggerWidth, dropHeight })`: công tắc **vô hình** rộng `triggerWidth` quanh tâm trên mặt đất; vật treo cao `dropHeight` px trên mặt đất.
- Chu kỳ 1 lần mỗi lượt: `idle` (treo, ẩn trong tán cây) → người chơi chạm công tắc → `warn` (rung, `warnTime` giây của sprite, kèm `springMessage`) → `fall` (rơi theo `GRAVITY`) → chạm đất: `landed`, nằm lại vô hại (như `corpse`).
- Trong lúc `fall`: chạm người chơi (lướt vẫn miễn như hazard thường) → `hurtPlayer(hitMessage, damage)` + `stunPlayer(hitMessage, stun)` (sprite khai báo `damage` mặc định 1, `stun` giây — chương 3 dùng 1). Chỉ trúng 1 lần.
- Không chém được (`hp: 0`). Thiếu asset: hộp lưới dự phòng theo trạng thái. F2 vẽ cả vùng công tắc.

### E4a — Vật phẩm giấu trong hazard (sách trong xe cống phẩm)
- `makeItem(chunk, localX, lift, { carrier })`: `carrier` = id hazard chở vật phẩm. Vật phẩm **ẩn** (không vẽ, không nhặt) nhưng **vẫn tính vào tổng** (`state.items.length`) từ đầu màn.
- Hazard đó bị phá (`breakHazard`) → vật phẩm hiện tại tâm hazard, cao `lift`, nhặt như thường. Hazard rời màn khi chưa bị phá (roller lăn quá) → vật phẩm vẫn hiện tại chỗ hazard biến mất (kẹp trong màn) để không kẹt màn.
- `checkTerrainFootprints`/bố cục không kiểm vật phẩm ẩn.

### E4b — Bình máu rơi khi hạ địch
- `state.pickups` (mới): `{ x, y, vy, life }`. Enemy hoặc hazard có máu bị hạ → hỏi `CHAPTER.hooks.dropHeal?.(target)`; trả `true` thì sinh 1 bình tại tâm mục tiêu, rơi xuống mặt đất (`GRAVITY`), nằm `HEAL_PICKUP.life` giây (nháy 2 s cuối) rồi mất. Không có hook = không rơi → chương 1–2 không đổi. Tỉ lệ rơi (Tinh Thiều) do chương quyết ở LND-L3.
- Chạm bình: +1 máu (kẹp `MAX_HEALTH`), tiếng `heal` (đã có trong `sfx-data.js`), hiệu ứng hồi máu HUD có sẵn. **Đầy máu thì không nhặt** (bình nằm lại).
- Vẽ: `CHAPTER.pickups?.heal` (ID sprite chương) nếu có; chưa có thì vẽ icon tim chung `ICON_HUD_HEART` (đã nạp ở mọi màn).

### Layout thử `?layout=engine` (màn 1 Lý Nam Đế, `ENGINE_TEST` trong `ly-nam-de/config.js`)
Nền phẳng, không sách/câu hỏi; mọi hình là asset mượn hoặc hộp dự phòng (`PLACEHOLDER`):
- chunk 1: bẫy lưới (`snare`) + lính, công tắc ngay trước lính;
- chunk 2: sông 2 khe nước + 1 mỏm đá + 1 bục giữa, 1 thuyền nổi nhắm bắn;
- chunk 3: cung thủ đứng cao (`groundY` nâng lên — tạm không có tháp) nhắm bắn chéo xuống;
- chunk 4: xe cống phẩm (roller `hp`) chở 1 sách (`carrier`); chó săn (`rusher`, sprite tạm);
- chunk 5: 3 lính + hook thử `dropHeal` luôn rơi.

---

## 3. TEST

| # | Test |
|---|---|
| G1 | `pytest tests` PASS |
| G2 | Sông: rơi khe nước → −1 máu, hiện lại trên mỏm đá/đất vừa đứng (đo `p.x` trước/sau); đứng trên bục giữa sông rồi rơi → hiện lại trên bục đó; hố thường màn 2 Trưng Trắc vẫn về đầu chunk +72 |
| G3 | Đạn nhắm: thuyền bắn chéo lên, cung thủ bắn chéo xuống; đạn đi đúng hướng người chơi lúc nhả (đo góc), lướt xuyên được, chém tan được, chạm đất tan; đạn ngang chương 1–2 không xoay, không đổi |
| G4 | Lưới: chạm công tắc → báo hiệu → rơi; trúng → −1 máu + không điều khiển ~1 s; lướt thoát được; nằm lại vô hại, không kích hoạt lần 2 |
| G5 | Sách trong xe: HUD 0/1 từ đầu; chưa phá xe không nhặt được; phá xe → sách hiện, nhặt được 1/1; xe lăn qua không phá → sách hiện chỗ xe biến mất |
| G6 | Bình máu: hạ lính (hook luôn rơi) → bình rơi xuống đất; còn thiếu máu nhặt +1; đầy máu không nhặt; hết giờ thì mất |
| G7 | F2 vẽ hộp công tắc lưới, đạn chéo, bình máu; `?viewer=1` chạy; console sạch |
| G8 | Hồi quy: 3 màn Trưng Trắc + `?layout=p2` + `?layout=skills`; màn 1 Bà Triệu + `?layout=engine` + màn 3 (mưa tên độc, tiền vàng); 3 màn khung Lý Nam Đế |
| G9 | `/verify-ui` màn 1 Lý Nam Đế `?layout=engine` ở desktop + điện thoại ngang |

## 4. FILE

| Loại | File |
|---|---|
| Sửa | `js/engine/{geometry,hazards,player,damage,level-flow,state,entities,combat,config,chapter}.js`, `js/engine/render/{entities,terrain,debug,index}.js`, `js/levels/ly-nam-de/{config,level1}.js` (layout thử), `.claude/rules/engine.md`, `.claude/rules/ly-nam-de-gameplay.md` |
| Tạo | `docs/REPORT_LND-ENGINE.md` |
| Chỉ đọc | `js/levels/{trung-trac,ba-trieu}/*` (không sửa) |

## 5. GATE
1. Không đổi hành vi chương 1–2 (mọi cơ chế mới chỉ bật khi dữ liệu chương khai báo); không sửa file chương 1–2.
2. Số mới (`HEAL_PICKUP.life`, `RESPAWN_EDGE_MARGIN`, thời gian báo hiệu lưới…) là `DESIGN_BASELINE`; số riêng chương ở `ly-nam-de/config.js`.
3. Test G1–G9 ghi PASS/FAIL có số đo; FAIL hoặc sửa ngoài phạm vi → `BLOCKED`.
4. Report `/task-report`; chỉ commit khi người dùng yêu cầu. Sau đó: prompt Codex `LND_ART_01`.
