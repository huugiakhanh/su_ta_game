# SỬ TA — CHƯƠNG 5: MAI HẮC ĐẾ
# TASK CARD: MHD-ENGINE — CƠ CHẾ CHUNG MỚI CHO CHƯƠNG 5

TASK_ID: MHD-ENGINE • Version 1.0 • 07/11/2026 • **ĐÃ DUYỆT, ĐÃ LÀM** — report [REPORT_MHD-ENGINE.md](REPORT_MHD-ENGINE.md)
Task card tổng: [SUTA_MHD_TASK_00.md](SUTA_MHD_TASK_00.md) (mục 3.1, 3.4, 3.5) • Trước đó: [MHD-SKELETON](REPORT_MHD-SKELETON.md)
Mẫu: [SUTA_TQP_TASK_ENGINE_01.md](SUTA_TQP_TASK_ENGINE_01.md) • Rule: `engine.md`, `mai-hac-de-gameplay.md`

---

## 0. MỤC TIÊU

Thêm vào engine `js/engine/` những cơ chế chương 5 cần mà engine chưa có. Mọi cơ chế viết **chung cho mọi chương** và **chỉ bật khi chương khai báo dữ liệu**, nên chương 1–4 không đổi hành vi. Thử bằng layout `?layout=engine` ở màn 1 chương 5.

Đã đọc code 07/11:

| MHD-00 | Engine hiện có | Việc |
|---|---|---|
| Nhặt hũ dầu, ném vào khiên vệ sĩ | Hũ dầu chương 1 là code riêng `trung-trac/boss.js` (địch ném, người chơi phản). `state.pickups` chỉ có bình máu. Người chơi chưa ném được gì | **E1 mang và ném** |
| Hổ vồ từ hang theo vòng cung | `roller` chỉ chạy ngang; `lurker` có sẵn mẫu trạng thái ẩn/hiện + `exposed`, nhưng đứng yên trong khe | **E2 kind `pounce`** |
| Quan thu thuế ném hòm rỗng cản đường | Đạn bay thẳng, chạm đất thì tan. Hazard không chặn ngang được, chỉ `obstacles` có `blocking` (nhưng obstacle không chém được) | **E3 đạn nằm lại + hazard `blocking`** |
| Gánh cống phẩm mở màn | `MUD` đã có mẫu giảm tốc, giảm nhảy. Chưa có trạng thái khoá đánh, lướt | **E4 gánh nặng** |
| Đập xe thả dân phu, đếm `rescued` | `breakHazard()` đã có điểm móc; `rescued` đã lưu server nhưng `end-game.js` chưa ghi | **E5 giải cứu** |
| Kỵ binh, buộc lướt | `roller`; lướt miễn sát thương (`playerImmune`), tầm nhảy ≈ 83 px | **Không sửa engine** — dữ liệu ở MHD-L1: hitbox cao hơn tầm nhảy |
| Đá lăn, cung thủ núp lùm, lính ném lao, lính áp giải | `roller`, `thrower`, `guard`, lớp vẽ `afterPlayer` | **Không sửa engine** |
| Xe cống phẩm chắn đường | `prop` có `hp`, `corpse`, `carrier` | Chỉ thêm `blocking` (E3) + `frees` (E5) |

**Không làm:** nội dung màn thật (MHD-L1/L2), boss Quang Sở Khách + kỹ năng (MHD-L3), asset, sửa hũ dầu chương 1. Prompt Codex `MHD_ART_01` soạn **sau** task này.

## 1. QUYẾT ĐỊNH ĐÃ CHỐT (người dùng duyệt theo đề xuất, 07/11/2026)

| # | Câu hỏi | Đề xuất |
|---|---|---|
| Q1 | Thao tác nhặt và ném? | Chạm là tự nhặt khi tay trống; đang cầm thì bấm Đánh là ném. Không thêm phím hay nút cảm ứng. Đang cầm thì không chém được |
| Q2 | Thao tác đập sọt lúc gánh? | Tới gần xe cống, bấm Đánh là đập sọt và hết gánh. Xa xe thì bấm Đánh chỉ hiện gợi ý |
| Q3 | Có gom hũ dầu chương 1 vào E1 không? | **Không.** Giữ nguyên chương 1, chỉ dùng lại công thức đường bay. Kế hoạch ghi "khái quát từ hũ dầu chương 1" nghĩa là lấy cách tính, không sửa code chương 1, tránh rủi ro boss chương 1 |
| Q4 | Asset cho layout thử? | Dùng hộp dự phòng tới `MHD_ART_01`, không chép sprite sớm. Console sẽ có cảnh báo thiếu ảnh ở layout này |
| Q5 | Chơi lại màn 1, `rescued` tính thế nào? | Ghi đè bằng số của lượt qua màn gần nhất, giống `books` |

---

## 2. TRIỂN KHAI

### E1 — Mang và ném (module mới `engine/carry.js`)
- **Khai báo chương:** `CHAPTER.carry = { <kind>: { sprite, anim, w, h, pickup: { w, h, life }, range, flightTime, gravity, damage, impact: { id, anim, w, h, time } } }`.
- **Rơi vật:** `spawnCarry(kind, x, y)` trong `combat.js` đẩy vào `state.pickups` với `carry: kind`. Hook `CHAPTER.hooks.dropCarry(target)` trả `kind` hoặc null, gọi cùng chỗ `dropHeal`. Enemy có `onStruck` riêng thì chương tự gọi `spawnCarry`.
- **Nhặt:** `updatePickups` tách nhánh `pickup.carry`: chạm khi `p.carrying` rỗng → `p.carrying = kind`, tiếng `pickup`, xoá vật. Tay đang cầm thì để nguyên. Hết `life` thì mất, nháy như bình máu.
- **Ném:** trong `updatePlayerControl`, `pressed.attack` và `p.carrying` thì `throwCarried()`, xét **trước** đòn bổ. Tạo vật trong `state.thrown` ở độ cao tay, bay theo `facing`: `vx = facing × range / flightTime`, `vy = (groundY − y − ½·g·t²) / t` (công thức `throwJar` chương 1). Tiếng `throw`. Dùng `attackCooldown` để phát animation `attack`.
- **Trúng:** mỗi frame xét enemy sống, hazard `hp > 0` và không `exposed === false`. Gọi `CHAPTER.hooks.onThrownHit(thrown, target)`; trả `true` là chương đã xử lý (vd. đốt khiên). Không có hook thì `strike(target, damage)`, nên `blockStrike` của chương vẫn có hiệu lực.
- **Chạm đất hoặc trúng:** vật mất, thêm `impact` vào `state.impacts` (chỉ vẽ, vô hại), gọi `hooks.onThrownLand(thrown)`. Bay ra ngoài màn thì mất.
- **Vẽ:** vật cầm vẽ trên đầu người chơi; vật bay và `impact` thêm ở `render/entities.js`; thiếu ảnh thì hộp dự phòng. F2 vẽ hộp vật bay.
- `p.carrying`, `state.thrown`, `state.impacts` khởi tạo ở `createLevelState`.

### E2 — Hazard kind `pounce` (hổ vồ)
- `makeHazard('pounce', sprite, chunk, localX, { triggerRange, patrolMin, patrolMax, hp })`. Sprite khai báo `warnTime`, `leapTime`, `leapHeight`, `leapRange`, `recoverTime`, `anims: { warn, leap, recover, hurt, death }`.
- Chu kỳ:
  - `hidden`: `invisible`, vô hại, `exposed = false`;
  - người chơi vào `triggerRange` → `warn` (hiện ở miệng hang, `warnTime`), khoá điểm rơi;
  - `leap`: bay vòng cung trong `leapTime`, x tuyến tính, cao `leapHeight × sin(π·t)`, `harmful`, chém được;
  - `recover`: đứng trên đất `recoverTime`, vô hại, chém được;
  - còn sống và người chơi trong tầm → `leap` tiếp, không thì đứng chờ ở `recover`.
- Điểm rơi: về phía người chơi, xa nhất `leapRange`, kẹp trong `[patrolMin, patrolMax]`. Trúng khe hố thì rút về mép đất gần nhất, nên hổ không rơi xuống hố.
- `makeHazard` (`geometry.js`) thêm `pounce` vào các nhánh mặc định như `lurker`: `harmful` false, `exposed` false, `invisible` true lúc đầu.
- Lướt miễn sát thương như hazard thường. Thiếu animation thì vẽ hộp dự phòng. F2 vẽ `triggerRange` + điểm rơi.

### E3 — Đạn nằm lại + hazard `blocking`
- **Đạn vòng cung:** `CHAPTER.sprites.projectiles[id].lob = { flightTime, gravity }`. `fireProjectile` tính vận tốc tới chỗ người chơi lúc ném (cùng công thức E1); `updateProjectiles` có nhánh riêng dùng `gravity`, bỏ qua `speed`, `PROJECTILE_MAX_RANGE`. Đạn không có `lob` giữ nguyên code cũ.
- **Nằm lại:** `landAs: <sprite hazard>` trên đạn. Chạm đất thì sinh hazard `prop` có `hp`, tại điểm rơi. Rơi vào khe hố thì tan. Đạn đang bay vẫn gây sát thương, chém được như đạn thường.
- **Giới hạn để không kẹt đường:** sprite khai báo `life` (giây tự vỡ, không điểm, không rơi đồ) và `maxLanded` (quá số này thì vật cũ nhất mất trước).
- **`blocking` trên sprite hazard:** sau vòng `state.obstacles` trong `updatePlayerControl`, xét hazard `alive` có `blocking` theo cùng luật: rơi từ trên thì đứng lên được, va ngang thì đẩy ra mép, không mất máu. Tách helper dùng chung, không đổi luật của obstacle. Xác `corpse` không chặn. Vật rơi đè lên người chơi cũng dùng đẩy ra mép.
- F2 vẽ khung vật nằm lại + `life` còn lại.

### E4 — Gánh nặng (`LEVEL.burden`)
- Màn khai báo `burden: { speed, jump }`. `createLevelState` đặt `p.burden = true`; số mặc định `BURDEN = { speed: .6, jump: .7 }` ở `engine/config.js` (`DESIGN_BASELINE`).
- Khi `p.burden`: đi × `speed`, nhảy × `jump`, `pressed.dash` bị bỏ. Bấm Đánh gọi `CHAPTER.hooks.onBurdenAttack(p)`:
  - trả `true` → `releaseBurden()` rồi `startAttack()`;
  - trả `false` hoặc không có hook → hiện `CHAPTER.text.burdenHint`, tối đa 1 lần mỗi 3 s.
- `releaseBurden()` export từ `player.js` cho chương gọi (vd. sau cảnh thoại).
- **Animation:** `PLAYER_ANIMATIONS.burdenIdle/burdenRun` với `fallback` về `idle`/`run` như `plunge`, nên chạy được trước khi có `MHD_ART_01`. `jump`, `hurt` giữ nguyên.
- **HUD:** ô Lướt thêm class `skill--locked` khi gánh; thêm 1 luật mờ ở `css/game/game.css`.

### E5 — Giải cứu (`frees`)
- **Khai báo chương:** `CHAPTER.rescue = { max, score, runner: { id, anim, speed, life } }`. Hazard option `frees: n`.
- `breakHazard()`: có `frees` thì `state.rescued = min(max, rescued + frees)`, cộng `score`, đẩy `n` người vào `state.runners`, gọi `CHAPTER.hooks.onHazardBroken(hazard)`. Hook gọi với mọi hazard bị phá, kể cả không có `frees`.
- `state.runners`: chỉ vẽ, không va chạm, chạy ngược hướng người chơi với `speed` trong `life` giây. Thiếu ảnh thì hộp dự phòng.
- `end-game.js`: lúc thắng màn 1 ghi thêm `rescued: state.rescued ?? 0` vào `saveProgress` (chương khác luôn 0). Màn sau giữ nguyên nhờ `saveProgress` gộp trường.
- Chương đọc ở màn sau bằng `readProgress().rescued`.

### Hợp đồng + layout thử
- `engine/chapter.js` thêm `carry`, `rescue`, `LEVEL.burden`, sprite `blocking`, `lob`, `landAs`, kind `pounce`, các hook mới. `engine.md` cập nhật DAG: `carry` → `combat`; `player`, `level-flow` → `carry`.
- **`?layout=engine`** (màn 1 chương 5, `ENGINE_TEST` trong `mai-hac-de/config.js`, `testLayout: 'engine'` ở `chapter.js`). Nền phẳng, không sách, không câu hỏi, `PLACEHOLDER`, mỗi chunk một cơ chế:
  - chunk 1: gánh nặng + hộp mốc đập sọt;
  - chunk 2: 2 xe `prop` `hp` 2 `blocking` `frees` 1, xác nằm lại;
  - chunk 3: hổ `pounce` + 1 khe hố để kiểm điểm rơi;
  - chunk 4: quan `patrol` ném hòm `lob` + `landAs`;
  - chunk 5: 2 lính rơi hũ dầu qua `dropCarry` + 1 bao cát chặn đòn chém, chỉ mất máu khi `onThrownHit` xử lý.

---

## 3. TEST

| # | Test |
|---|---|
| G1 | `pytest tests` PASS |
| G2 | Ném: chạm hũ khi tay trống thì nhặt, đang cầm thì không nhặt thêm; bấm Đánh ném đúng `range` (đo điểm rơi, sai ≤ 4 px), cả 2 hướng; đang rơi vẫn ném, không thành đòn bổ; hết `life` thì hũ mất |
| G3 | Trúng: không hook thì mục tiêu −`damage`; hook trả `true` thì không trừ máu lần 2; `impact` hiện đúng `time`; hazard `exposed === false` không bị trúng |
| G4 | Hổ: ẩn thì chém không trúng và đi qua không mất máu; đo đỉnh vòng cung ≈ `leapHeight`; trúng khi `leap`, lướt miễn; `recover` chém được, không gây hại; điểm rơi không bao giờ trong khe hố |
| G5 | Hòm: bay vòng cung, rơi cách chỗ người chơi lúc ném ≤ 4 px; nằm lại chặn ngang, không mất máu; đứng lên được; chém vỡ; tự vỡ sau `life`; không quá `maxLanded`; rơi vào hố thì tan. Đạn thường giữ nguyên quãng bay |
| G6 | Gánh: đo tốc độ ≈ ×`speed`, đỉnh nhảy ≈ ×`jump`²; Lướt không chạy; Đánh xa xe chỉ gợi ý; Đánh gần xe thì hết gánh và chém; sau đó tốc độ về `MOVE_SPEED`; rơi hố vẫn còn gánh; "Chơi lại" gánh lại từ đầu |
| G7 | Giải cứu: phá xe `frees` → `state.rescued` +1, có người chạy, không vượt `max`; hazard không `frees` thì không đổi; thắng màn 1 → `suta.mhd.progress` có đúng `rescued`, sang màn 2 vẫn còn; đăng nhập thì PUT mang theo `rescued` |
| G8 | `blocking`: xe sống chặn, xác `corpse` không chặn; obstacle chương 1 (cột đá) đẩy ra mép như cũ |
| G9 | F2 vẽ các hộp mới; `?viewer=1` chạy; console sạch, trừ 401 khách, cảnh báo asset mượn và cảnh báo thiếu ảnh của layout thử (Q4) |
| G10 | Hồi quy: 3 màn Trưng Trắc + `?layout=p2` + `?layout=skills` (hũ dầu boss còn phản được); màn 1 Bà Triệu + `?layout=engine`; màn 1 Lý Nam Đế + `?layout=engine` + `?layout=skills`; màn 1–3 Triệu Việt Vương + `?layout=engine` + `?layout=skills`; 3 màn khung chương 5. Chương 1–4 bấm Đánh trên không vẫn như cũ |
| G11 | `/verify-ui` màn 1 chương 5 `?layout=engine` ở desktop + điện thoại ngang; nút ĐÁNH cảm ứng ném được, ô Lướt mờ khi gánh |

## 4. FILE

| Loại | File |
|---|---|
| Tạo | `js/engine/carry.js`, `docs/REPORT_MHD-ENGINE.md` |
| Sửa | `js/engine/{config,chapter,state,geometry,combat,hazards,player,level-flow,end-game,ui}.js`, `js/engine/render/{entities,player,debug}.js`, `css/game/game.css`, `js/levels/mai-hac-de/{chapter,config,level1}.js` (layout thử, câu `TEXT` mới), `.claude/rules/engine.md`, `.claude/rules/mai-hac-de-gameplay.md`, `docs/SUTA_MHD_TASK_00.md` (link) |
| Chỉ đọc | `js/levels/{trung-trac,ba-trieu,ly-nam-de,trieu-quang-phuc}/*` (không sửa) |

Câu `TEXT` mới (`burdenHint`) là câu kỹ thuật, không phải nội dung lịch sử — chốt nguyên văn khi làm, ghi trong report.

## 5. GATE
1. Không đổi hành vi chương 1–4: mọi cơ chế mới chỉ bật khi dữ liệu chương khai báo; không sửa file chương 1–4.
2. Số mới (`BURDEN`, chu kỳ hổ, `lob`, `life`, `maxLanded`, `range`...) là `DESIGN_BASELINE`; số riêng chương ở `mai-hac-de/config.js`.
3. Test G1–G11 ghi PASS/FAIL có số đo; FAIL hoặc sửa ngoài phạm vi → `BLOCKED`.
4. Report `/task-report`; chỉ commit khi người dùng yêu cầu. Sau đó: prompt Codex `MHD_ART_01` (gồm animation gánh cống phẩm cho `PLAYER_MALE`/`PLAYER_FEMALE`, `pounce` cho `EN_TIGER`).
