# SỬ TA — CHƯƠNG 4: TRIỆU VIỆT VƯƠNG
# TASK CARD: TQP-ENGINE — CƠ CHẾ CHUNG MỚI CHO CHƯƠNG 4

TASK_ID: TQP-ENGINE • Version 1.0 • 04/11/2026 • **ĐÃ DUYỆT, ĐÃ LÀM** — report [REPORT_TQP-ENGINE.md](REPORT_TQP-ENGINE.md)
Task card tổng: [SUTA_TQP_TASK_00.md](SUTA_TQP_TASK_00.md) (mục 3.1, 3.2, 3.4, 3.5) • Trước đó: [TQP-SKELETON](REPORT_TQP-SKELETON.md)
Mẫu: [SUTA_LND_TASK_ENGINE_01.md](SUTA_LND_TASK_ENGINE_01.md) • Rule: `engine.md`, `trieu-quang-phuc-gameplay.md`

---

## 0. MỤC TIÊU

Thêm vào engine `js/engine/` những cơ chế chương 4 cần mà engine chưa có. Mọi cơ chế viết **chung cho mọi chương** và **chỉ bật khi chương khai báo dữ liệu**, nên chương 1–3 không đổi hành vi. Thử bằng layout `?layout=engine` ở màn 1 chương 4, dùng asset mượn hoặc hộp dự phòng.

Đã đọc code 04/11:

| Excel / TQP-00 | Engine hiện có | Việc |
|---|---|---|
| Bãi sình lầy (đứng quá 3 s thì lún, mất máu); boss bị lún | Lưới địa hình `'#' '.' '~'`; chưa có vùng làm chậm | **E1 sình** |
| Khói chướng khí bay ngang | `vent` đứng yên theo nhịp; lướt được miễn sát thương (`playerImmune`) | **E2 kind `drift`** |
| Cá sấu ngoi lên từ hố nước | Khe sông `water`, hazard nổi `floatY`; hazard có `hp` thì luôn chém được | **E3 kind `lurker`** |
| Thuyền tuần tiễu, không diệt nhanh thì gọi viện | `thrower` nổi trong sông, bắn `aim`; `alarmFor` chỉ đánh thức roller | **E4 `callHelp`** |
| Lính giáo dài: chỉ hạ được bằng đòn từ trên xuống; gáy Dương Sàn | Chỉ có đòn chém ngang (`spearBox`); `blockStrike` của `enemyKinds` | **E5 đòn bổ + `plungeOnly`** |
| Đủ 3/6/10 sách mới gặp NPC màn 2 | NPC giữ người chơi lại; chỉ chờ lính vây chết | **E6 `requires`** |
| Ẩn nấp lau sậy, đánh úp | `guard` thấy người chơi theo `aggroRange`; thrower bắn theo `fireRange` | **E7 vùng ẩn nấp** |
| Thể lực cường tráng: máu tối đa +2 | `MAX_HEALTH = 5` là hằng số (`state.js`, `level-flow.js`) | **E8 `state.maxHealth`** |
| Bẫy chông tre ẩn dưới lá | `trap` + sprite `TR_BAMBOO_SPIKE_PIT` chương 2 đã có `idle: 'hidden'` → `sprung: 'reveal'` | **Không sửa engine** — dữ liệu chương ở TQP-L1. TQP-00 §3.5 E9 bỏ |
| Rắn độc trườn trong bụi cỏ | `rusher`; lớp vẽ chương `hooks.draw.afterPlayer` | **Không sửa engine** — bụi cỏ vẽ ở lớp trên (TQP-L1) |
| Cung thủ trên cây | `thrower` `aim` + `prop` tháp canh (chương 3) | **Không sửa engine** |

**Không làm:** nội dung màn thật (TQP-L1/L2), khu rèn luyện (TQP-L1, dùng E5 + cơ chế có sẵn), boss Dương Sàn + kỹ năng (TQP-L3), asset. Prompt Codex `TQP_ART_01` soạn **sau** task này.

## 1. QUYẾT ĐỊNH ĐÃ CHỐT (04/11/2026)

| # | Quyết định |
|---|---|
| Q1 | Đòn bổ: **đang rơi xuống (vy > 0) mà bấm Đánh thì bổ thẳng xuống**. Đang bật lên thì Đánh vẫn chém ngang như cũ. Không thêm phím hay nút cảm ứng. Chỉ bật ở chương khai báo `CHAPTER.plunge` |
| Q2 | Codex vẽ thêm strip `plunge` cho `PLAYER_MALE` + `PLAYER_FEMALE` (asset dùng chung, giữ ID) ở `TQP_ART_01`. Trong lúc chờ, engine dùng tạm ô cuối của `attack_01` |
| Q3 | Prompt Codex `TQP_ART_01` làm sau TQP-ENGINE |

---

## 2. TRIỂN KHAI

### E1 — Vùng sình lầy
- **Lưới địa hình**: ký tự mới `'='` ở **hàng cuối** = cột sình. Cột sình là đất đi được, cao bằng mặt đất. `buildTerrain` lưu cờ sình theo cột; `terrainMud()` trả các dải `{ x, w }` liền nhau → `state.mud`. Lưới không có `'='` → như cũ.
- **Người chơi** (chân giữa nằm trong dải sình và đang đứng đất):
  - tốc độ đi × `MUD.speed`, lực nhảy × `MUD.jump` (lướt vẫn bình thường, thoát được);
  - `p.mudTime` cộng dồn khi còn ở trong sình, ra khỏi sình thì về 0;
  - vẽ chìm dần tới `MUD.sink` px;
  - đủ `MUD.limit` giây (Excel: 3 s) → `hurtPlayer(CHAPTER.text.mudSunk)`, bật nhảy ra phía trước, `mudTime = 0`.
- Hàm chung `inMud(x)` (`geometry.js`) cho chương dùng, ví dụ boss lao vào sình thì kẹt (TQP-L3).
- **Vẽ**: mặt sình lặp ngang trong dải, dùng asset map `CHAPTER.tiles.mud` (`drawMapImage`). Chưa có asset thì vẽ dải nâu dự phòng (`TODO_MISSING`, không báo lỗi). F2 vẽ khung dải sình + `mudTime`.
- Số: `MUD = { speed: .5, jump: .7, sink: 8, limit: 3 }` ở `engine/config.js` (`DESIGN_BASELINE`). Chương ghi đè được qua `CHAPTER.mud`.

### E2 — Hazard kind `drift` (khói chướng khí trôi ngang)
- `makeHazard('drift', sprite, chunk, localX, { lane, travel, speed, gap, triggerRange })`:
  - đám khói nằm ở độ cao `lane`: `'low'` sát đất thì phải nhảy qua; `'high'` ngang thân thì phải lướt (lướt được miễn sát thương) hoặc nhảy qua đúng lúc;
  - người chơi vào `triggerRange` thì khói xuất phát từ `localX`, trôi với `speed` (âm = về phía người chơi) hết quãng `travel` px;
  - tới cuối quãng thì mờ đi, chờ `gap` giây rồi xuất phát lại.
- Chạm thì −`damage` (mặc định 1), dùng luật va chạm hazard chung (lướt miễn, nhấp nháy sau khi trúng). Không chém được (`hp: 0`).
- Thiếu asset: hộp khói dự phòng. F2 vẽ quãng trôi.

### E3 — Hazard kind `lurker` (cá sấu trong khe nước)
- `makeHazard('lurker', sprite, chunk, localX, { triggerRange, rest })`, đặt trong khe sông (`groundY: GROUND_Y`, `floatY` như thuyền).
- Chu kỳ: `hidden` (dưới nước: không vẽ thân, vô hại, **không chém được**) → người chơi vào `triggerRange` và đã hết `rest` → `warn` (bọt nước, `warnTime` của sprite) → `attack` (ngoi lên đớp trong `upTime`: gây sát thương, chém được) → `dive` → `hidden`, đếm lại `rest`.
- Engine thêm cờ chung `hazard.exposed === false` → `updateAttack` bỏ qua hazard đó (dùng được cho vật khác cần ẩn/hiện).
- Có `hp`: hết máu thì `death`, xoá như hazard thường. F2 vẽ vùng kích hoạt.

### E4 — Thuyền gọi viện (`callHelp`)
- Tuỳ chọn hazard (dùng cho `thrower`/`patrol`): `callHelp: { after, range, spawnAt: [worldX…], enemy: { art, w, h, hp } }`.
- Người chơi ở trong `range` liên tục đủ `after` giây mà hazard còn sống → hành động `signal` (animation `signal` nếu sprite có, tiếng `alarm`, `signalMessage` của sprite) → sinh lính ở các vị trí `spawnAt` (đứng trên mặt đất bằng `makeEnemy`), **1 lần mỗi lượt**. Hazard bị phá trước đó thì không gọi.
- Thuyền chém được = khai báo `hp` (đã có). Người chơi đứng trên mỏm đá hoặc bờ để chém, hoặc dùng đòn bổ (E5).
- F2 hiện đồng hồ `after` còn lại.

### E5 — Đòn bổ từ trên (`CHAPTER.plunge`)
- Chương bật bằng `plunge: { damage, bounce, speed }` (mặc định `{ damage: 2, bounce: 330, speed: 520 }`, `DESIGN_BASELINE`).
- **Kích hoạt**: đang ở trên không, `vy > 0` (đang rơi), không lướt, không choáng → bấm Đánh = bắt đầu bổ (`p.plunging = true`). Lúc này `vx` giữ nguyên ×0,5, `vy = speed`, tiếng `swing`.
- **Vùng đánh**: hộp dưới chân, rộng bằng thân, cao 14 px. Trúng enemy/hazard có `hp` (đỉnh mục tiêu dưới chân người chơi) → `playerStrike` với `plunge.damage`, người chơi nảy lên `vy = −bounce` và hết bổ. Chạm đất thì hết bổ, rung nhẹ.
- Mỗi lần bổ, mỗi mục tiêu chỉ trúng 1 lần. Đang bổ mà va thân địch thì không mất máu nếu đòn trúng trong cùng frame.
- **`plungeOnly`**: cờ trên sprite enemy/hazard (lính giáo dài). Chém ngang vào mục tiêu này bị gạt: không mất máu, có tia lửa/tiếng chặn nếu chương khai báo, hiện `CHAPTER.text.plungeHint` (tối đa 1 lần mỗi 3 s). Chỉ đòn bổ mới trúng.
- **Animation**: trạng thái `plunge` của người chơi dùng `PLAYER_ANIMATIONS.plunge` nếu manifest có. Chưa có thì giữ ô cuối của `attack_01` (Q2). Thêm vào hợp đồng `engine/chapter.js`.

### E6 — NPC khoá theo số vật phẩm (`requires`)
- `makeNpc(id, chunk, localX, { requires })`: chưa nhặt đủ `requires` vật phẩm thì:
  - NPC vẫn giữ người chơi lại trước mặt như hiện nay (phải quay lại tìm);
  - vẽ mờ (alpha 0,45);
  - nhắc `CHAPTER.text.npcLocked(requires, có)`, tối đa 1 lần mỗi `NPC_RESCUE.hintInterval` giây;
  - không mở hội thoại.
- Đủ vật phẩm thì xét tiếp lính vây (`captorOf`) như cũ. NPC không có `requires` → như cũ.

### E7 — Vùng ẩn nấp (lau sậy) + đánh úp
- Nội dung màn có `covers: [{ x, w }]` → `state.covers`. Người chơi **ẩn** khi tâm thân nằm trong 1 vùng, đang đứng đất, không đang đánh hoặc lướt. Đánh hoặc lướt làm lộ thêm `STEALTH.reveal` giây.
- Lúc ẩn:
  - `guard` không phát hiện (không quay lại, không đuổi, không đâm; đang đuổi thì bỏ, về tuần tra) và thrower không bắn;
  - chạm thân vẫn tính như cũ;
  - người chơi vẽ alpha 0,55.
- **Đánh úp**: chương bật `CHAPTER.stealth = { ambush: 2 }`. Chém trúng lính **chưa phát hiện người chơi** (`enemy.alerted` false) **từ sau lưng** → sát thương × `ambush`, chương tự vẽ hiệu ứng qua `hooks.onAmbush(target)`. `guard` đặt `alerted = true` khi người chơi vào `aggroRange` mà không ẩn; ra khỏi tầm hoặc người chơi ẩn thì về `false`.
- F2 vẽ khung vùng ẩn + chữ "ẨN" khi đang ẩn.

### E8 — Máu tối đa theo lượt (`state.maxHealth`)
- `createLevelState`: `maxHealth = MAX_HEALTH + (CHAPTER.skills?.bonusHealth?.(owned) ?? 0)` (chỉ ở màn bật khe kỹ năng). Bắt đầu màn `health = maxHealth`.
- `level-flow.js` (bình máu) kẹp theo `state.maxHealth` thay `MAX_HEALTH`. HUD đã vẽ theo `state.health` nên không cần sửa. File chương 2–3 vẫn dùng `MAX_HEALTH` (bằng 5) — không sửa.

### Layout thử `?layout=engine` (màn 1 chương 4, `ENGINE_TEST` trong `trieu-quang-phuc/config.js`)
Nền phẳng, không sách/câu hỏi; asset mượn hoặc hộp dự phòng (`PLACEHOLDER`). Mỗi chunk một cơ chế:
- chunk 1: dải sình 160 px (`'='`) + 1 lính đứng sau dải;
- chunk 2: khói `drift` làn thấp + làn cao;
- chunk 3: sông 1 khe có cá sấu `lurker` + mỏm đá;
- chunk 4: sông có thuyền `hp` + `callHelp` (2 lính trên bờ);
- chunk 5: 2 lính `plungeOnly` (sprite lính tuần chương 3 tạm) + 1 bục để nhảy;
- chunk 6: vùng ẩn nấp 200 px + 2 lính tuần tra qua lại + 1 cung thủ thrower;
- chunk 7: NPC tạm (hộp) `requires: 2` + 2 sách đặt **sau lưng** người chơi (phải quay lại) — chỉ ở layout thử.
- `CHAPTER.skills.bonusHealth` chưa có (TQP-L3) → E8 thử bằng hook tạm trong layout (`?layout=engine` đặt `bonusHealth` trả 2).

---

## 3. TEST

| # | Test |
|---|---|
| G1 | `pytest tests` PASS |
| G2 | Sình: đi qua chậm hơn (đo vận tốc ≈ ×0,5), nhảy thấp hơn (đo đỉnh nhảy); đứng 3 s → −1 máu + bật ra; lướt thoát được; `inMud()` đúng mép dải |
| G3 | Khói trôi: làn thấp nhảy qua được, làn cao lướt xuyên được, đứng yên thì trúng −1; hết quãng → chờ `gap` → chạy lại |
| G4 | Cá sấu: lúc ẩn chém không trúng, đi qua không mất máu; báo bọt → ngoi đớp (nhảy qua khe đúng lúc thì trúng); chém trúng lúc ngoi, hết máu thì mất |
| G5 | Thuyền: đứng gần đủ `after` giây → báo + 2 lính xuất hiện trên bờ đúng 1 lần; phá thuyền trước → không gọi |
| G6 | Đòn bổ: đang rơi bấm Đánh → bổ (đo `vy`), trúng đầu lính → −2 máu lính + nảy lên; đang bật lên bấm Đánh → chém ngang như cũ; lính `plungeOnly`: chém ngang không mất máu + gợi ý, bổ thì trúng. Chương 1–3 (không khai báo) bấm Đánh trên không vẫn chém ngang |
| G7 | NPC khoá: thiếu sách → bị giữ + nhắc "Cần N…", NPC mờ; quay lại nhặt đủ → NPC sáng, gặp được |
| G8 | Ẩn nấp: đứng trong vùng → lính đi ngang không đuổi/đâm, cung thủ không bắn; chém → lộ; chém sau lưng lính chưa phát hiện → ×2 (lính 2 máu chết 1 đòn) |
| G9 | Máu tối đa: hook +2 → bắt đầu 7 tim, bình máu kẹp ở 7; chương 1–3 vẫn 5 |
| G10 | F2 vẽ dải sình, quãng khói, vùng cá sấu, đồng hồ gọi viện, vùng ẩn; `?viewer=1` chạy; console sạch (trừ 401 khách + cảnh báo asset mượn) |
| G11 | Hồi quy: 3 màn Trưng Trắc + `?layout=p2` + `?layout=skills`; màn 1 Bà Triệu + `?layout=engine`; 3 màn Lý Nam Đế + `?layout=engine` + `?layout=skills`; 3 màn khung chương 4 |
| G12 | `/verify-ui` màn 1 chương 4 `?layout=engine` ở desktop + điện thoại ngang |

## 4. FILE

| Loại | File |
|---|---|
| Sửa | `js/engine/{geometry,hazards,player,damage,enemies,combat,level-flow,state,entities,config,chapter}.js`, `js/engine/render/{terrain,entities,player,debug}.js`, `js/levels/trieu-quang-phuc/{chapter,config,level1}.js` (bật `plunge`/`stealth`, câu `TEXT` mới, layout thử), `.claude/rules/engine.md`, `.claude/rules/trieu-quang-phuc-gameplay.md`, `docs/SUTA_TQP_TASK_00.md` (bỏ E9, link) |
| Tạo | `docs/REPORT_TQP-ENGINE.md` |
| Chỉ đọc | `js/levels/{trung-trac,ba-trieu,ly-nam-de}/*` (không sửa) |

Câu `TEXT` mới của chương 4 (`mudSunk`, `plungeHint`, `npcLocked`) là câu thông báo kỹ thuật, không phải nội dung lịch sử — chốt nguyên văn khi làm, ghi trong report.

## 5. GATE
1. Không đổi hành vi chương 1–3: mọi cơ chế mới chỉ bật khi dữ liệu chương khai báo; không sửa file chương 1–3.
2. Số mới (`MUD`, `STEALTH.reveal`, `plunge`, chu kỳ cá sấu, `callHelp.after`…) là `DESIGN_BASELINE`; số riêng chương ở `trieu-quang-phuc/config.js`.
3. Test G1–G12 ghi PASS/FAIL có số đo; FAIL hoặc sửa ngoài phạm vi → `BLOCKED`.
4. Report `/task-report`; chỉ commit khi người dùng yêu cầu. Sau đó: prompt Codex `TQP_ART_01` (gồm strip `plunge` người chơi nam/nữ — Q2).
