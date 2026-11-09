# SỬ TA — CHƯƠNG 6: PHÙNG HƯNG
# TASK CARD: PH-ENGINE — CƠ CHẾ CHUNG MỚI CHO CHƯƠNG 6

TASK_ID: PH-ENGINE • Version 1.0 • 09/11/2026 • **ĐÃ DUYỆT, ĐÃ LÀM** — report [REPORT_PH-ENGINE.md](REPORT_PH-ENGINE.md)
Task card tổng: [SUTA_PH_TASK_00.md](SUTA_PH_TASK_00.md) (mục 3.1, 3.2, 3.5) • Trước đó: [PH-SKELETON](REPORT_PH-SKELETON.md)
Mẫu: [SUTA_MHD_TASK_ENGINE_01.md](SUTA_MHD_TASK_ENGINE_01.md) • Rule: `engine.md`, `phung-hung-gameplay.md`

---

## 0. MỤC TIÊU

Thêm vào engine `js/engine/` những cơ chế chương 6 cần mà engine chưa có. Mọi cơ chế viết **chung cho mọi chương** và **chỉ bật khi chương khai báo dữ liệu**, nên chương 1–5 không đổi hành vi. Thử bằng layout `?layout=engine` ở màn 1 chương 6.

Đã đọc code 09/11:

| PH-00 | Engine hiện có | Việc |
|---|---|---|
| Lính khiên chỉ vỡ bởi đòn gồng; thu phục trâu; hạ hổ | Có `plungeOnly` + `blockedByGuard` (`player.js:257`) làm mẫu. `keys.attack` đã giữ trạng thái cả bàn phím lẫn cảm ứng, nhưng `startAttack` chỉ chạy lúc nhấn | **E1 đòn gồng** |
| Thu phục trâu rồi cưỡi húc lính | `roller` chỉ chạy ngang; `ride` chỉ là bục trên lưng (voi rừng), người chơi không điều khiển gì | **E2 thu phục + cưỡi** |
| Đẩy xe thuế muối húc lính | Hazard `blocking` đẩy người chơi ra mép (`player.js:464`), không dịch chuyển được vật | **E3 vật đẩy được** |
| Hổ vồ bù nhìn thì khựng | `pounce` luôn nhắm người chơi (`startLeap`), có `recover` nhưng không có mồi | **E4 mồi nhử** |
| Hào chông tre, rơi −1 máu, về chỗ đứng vững | Khe sông `'~'` đã về `p.safeSpot` (`damage.js:76`). Chưa có loại hố chông | **E5 cột `'^'`** |
| Sách + Vũ Khí Thô Sơ cùng mở khoá NPC | `state.items` một loại, `npc.requires` là một số | **E6 vật phẩm phụ** |
| Lính tuần, đá rơi, thợ săn trên cây, ném đuốc, nước sôi, thanh Sợ hãi | `guard`, `snare`, thrower `aim`, `carry.js`, `vent`, `hooks.updateHud` | **Không sửa engine** |

**Không làm:** nội dung màn thật (PH-L1/L2), boss + kỹ năng (PH-L3), asset. Prompt Codex `PH_ART_01` soạn **sau** task này.

**Chỉnh so với PH-00 §3.5:** E1 không cần sửa `input.js`; `keys.attack` đã đủ cho cả phím và nút cảm ứng.

## 1. QUYẾT ĐỊNH ĐÃ CHỐT (người dùng duyệt theo đề xuất, 09/11/2026)

| # | Câu hỏi | Quyết định |
|---|---|---|
| Q1 | Giữ J thao tác thế nào? | Nhấn vẫn chém ngay như cũ, giữ tiếp thì tích lực, thả khi đủ 0,7 s thì tung đòn gồng. Không làm đòn thường bị trễ. Đang tích đi chậm ×0,6; nhảy, lướt hoặc trúng đòn thì huỷ |
| Q2 | Cưỡi trâu điều khiển thế nào? | Trâu tự lao theo hướng mặt lúc thu phục, 5 s. Người chơi chỉ nhảy; không đánh, không lướt; miễn mọi sát thương. Húc trúng lính hoặc vật `rammable` thì hạ. Gặp mép hố hoặc vật chặn thì xuống ngay, không rơi |
| Q3 | Đẩy xe thế nào? | Đi sát và đi tiếp về phía xe là đẩy, tốc độ ×0,45; không kéo được; đẩy được cả 2 chiều. Xe dừng ở mép hố và bậc đất. Xe cao dưới tầm nhảy nên luôn nhảy qua được, không kẹt màn |
| Q4 | Bù nhìn dùng thế nào? | Đặt sẵn trong đấu trường hổ, người chơi không mang đi. Hổ nhắm bù nhìn trong tầm trước, vồ trúng thì bù nhìn đổ và hổ khựng 2 s, chỉ lúc này mới chịu đòn. Bù nhìn dựng lại sau 4 s nên không kẹt |
| Q5 | Asset cho layout thử? | Mượn trong manifest chương 5: `EN_TANG_CAVALRY` thay trâu, `OB_TRIBUTE_CART` thay xe muối, `EN_TANG_SHIELD_GUARD`, `EN_TIGER`. Bù nhìn, chông, vũ khí vẽ hộp dự phòng tới `PH_ART_01`; console có cảnh báo thiếu ảnh ở layout này |

---

## 2. TRIỂN KHAI

### E1 — Đòn gồng (`CHAPTER.charge`)
- **Khai báo:** `CHAPTER.charge = {}` để bật; ghi đè `CHARGE = { hold: .7, damage: 3, moveSpeed: .6, hintInterval: 3 }` (`engine/config.js`, `DESIGN_BASELINE`). Chương không khai báo thì toàn bộ nhánh này không chạy.
- **Tích lực** (`updatePlayerControl`): `keys.attack` giữ, đứng đất, không `dashing`/`burden`/`carrying`/`stun` → `p.chargeTime += dt`; đủ `hold` thì đặt `p.charged`, tiếng `chargeReady` 1 lần. Đang tích đi × `moveSpeed`.
- **Huỷ:** nhảy, lướt, trúng đòn, rời đất, cầm vật → `chargeTime = 0`, `charged = false`.
- **Thả phím:** `charged` thì `startChargedAttack()`: như `startAttack` nhưng `p.chargedSwing = true`, mở lại `attackHits`. Chưa đủ thì không có gì thêm.
- **Trúng:** `updateAttack` khi `chargedSwing`: mục tiêu mất `damage`, xuyên `chargeOnly`. Mục tiêu `chargeOnly` gặp đòn thường thì gạt như `plungeOnly`, nhắc `text.chargeHint`, phát `blocked`. Gọi `hooks.onChargedHit(target)`.
- **Animation:** `PLAYER_ANIMATIONS.charge` (`charge_hold`, `fallback` ô đầu `attack_01`) và `chargeStrike` (`charge_strike`, `fallback` `attack_01`). Ưu tiên: hurt > dash > plunge > attack > charge > jump. Có vầng sáng tối giản khi `charged` (vẽ code, không cần asset).

### E2 — Thu phục + cưỡi
- **Khai báo:** sprite hazard `tameable: { speed, time, damage, rideTop, anims: { ride, tamed } }`.
- **Thu phục:** đòn gồng trúng hazard `tameable` đang sống → hazard biến mất, không mất máu thường, không cộng điểm hạ; đặt `state.mount = { sprite, spec, time, dir }`, `p.mounted = true`. Đòn thường bị gạt (`chargeOnly`). Trâu lao qua mà không thu phục được thì đi mất như `roller`, màn vẫn qua được.
- **Khi cưỡi:** `p.vx = dir × speed`; bỏ phím trái/phải, Đánh, Lướt; nhảy vẫn được. `playerImmune` trả true.
- **Húc:** enemy sống (trừ `boss`) và hazard có `rammable` chạm thân → `strike(target, damage)`, mỗi mục tiêu 1 lần.
- **Kết thúc:** hết `time`, gặp mép hố phía trước, vật chặn, hoặc tường màn → xuống tại chỗ, `p.invulnerable = .5`, trâu chạy tiếp rồi biến mất (chỉ vẽ).
- **Vẽ:** trâu trước người chơi; người chơi nâng `rideTop`, animation `ride` (`fallback` `idle`). F2 vẽ `state.mount.time`.

### E3 — Vật đẩy được
- **Khai báo:** sprite hazard `blocking: true` + `pushable: { speed, damage }`.
- **Đẩy:** trong vòng `blocking` (`player.js:464`): đứng đất, đi về phía vật, chạm mép → `hazard.x += dir × speed × MOVE_SPEED × dt`, người chơi đi theo. Không đẩy khi đang lướt.
- **Dừng:** mép trước gặp hố (`groundYAt`), bậc đất, obstacle hoặc hazard `blocking` khác. Giữ nguyên `standOn` từ trên.
- **Húc:** vật đang đẩy chạm enemy → `hooks.onPushHit(body, enemy)`; trả `true` là chương đã xử lý; không thì `strike(enemy, damage)`. Mỗi lần đẩy trúng cách nhau 0,5 s.

### E4 — Mồi nhử cho `pounce`
- **Dựng:** `makeDecoy(chunk, localX, { sprite, respawn })` vào `state.decoys`.
- **Chọn đích:** `startLeap` tìm mồi đang đứng trong `leapRange`, gần hổ nhất, trước khi nhắm người chơi; không có thì như cũ.
- **Khựng:** rơi trúng mồi → mồi đổ (`respawn` giây dựng lại), `pounceState = 'stuck'`, `stuckTime` giây, vô hại, `exposed = true`.
- **Cờ sprite `stuckOnly`:** ngoài `stuck` thì `exposed = false`, không chém được. Sprite không có cờ này thì `recover` vẫn chém được như chương 5.
- **Vẽ:** mồi ở `render/entities.js`, hổ dùng `anims.stuck` (`fallback` `recover`). F2 vẽ mồi + đích.

### E5 — Cột chông `'^'`
- `buildTerrain`: `'^'` ở hàng cuối = hố như `'.'`, thêm mảng `spikes`. `terrainHoles` tách đoạn theo loại, trả `{ x, w, water, spikes }`.
- `respawnAfterFall`: `hole.water || hole.spikes` về `p.safeSpot`, thông báo `text.spikeFell` nếu có. Hố thường và sông không đổi.
- `render/terrain.js`: lát `CHAPTER.tiles.spikes` nếu có; thiếu thì dải dự phòng.
- Số đo từ hằng engine: nhảy chạy xa ~119 px, nhảy + lướt ~198 px, nên hào rộng 150–176 px thì phải nhảy + lướt. Đo lại ở G6, chốt độ rộng ở PH-L1.

### E6 — Vật phẩm phụ
- **Danh sách riêng** `state.extras`, không gộp vào `state.items`, nên mọi logic đích, HUD sách, `books` không đổi.
- **Khai báo:** `CHAPTER.extraItems = { weapon: { sprite, fps, label, picked(count, total) } }`. `makeExtra(kind, chunk, localX, lift, { carrier })`. `revealCarriedItems` hiện cả vật phụ.
- **NPC:** `makeNpc(..., { requires, extras: { weapon: 1 } })`. Helper `npcLocked(npc)` dùng ở `level-flow.js:267` và `render/entities.js:377`; `text.npcLocked` nhận thêm tham số thứ 3 `extras`.
- **HUD:** `base.html` thêm `#extraHud` ẩn mặc định sau `#itemHud`; `ui.js` chỉ hiện khi màn có vật phụ.

### Hợp đồng + layout thử
- `engine/chapter.js` thêm `charge`, `extraItems`, sprite `chargeOnly`/`tameable`/`pushable`/`rammable`/`stuckOnly`, `tiles.spikes`, các hook mới. `engine.md` cập nhật.
- **`?layout=engine`** (màn 1 chương 6, `ENGINE_TEST` trong `phung-hung/config.js`), nền phẳng, `PLACEHOLDER`, mỗi chunk một cơ chế:
  - chunk 1: bao cát `chargeOnly` + lính khiên;
  - chunk 2: hổ `pounce` `stuckOnly` + 2 bù nhìn;
  - chunk 3: trâu `tameable` + 3 lính + rào `rammable`;
  - chunk 4: xe đẩy + 2 lính + 1 khe hố phía trước;
  - chunk 5: hào `'^'` rộng 160 px;
  - chunk 6: NPC hộp `requires: 1, extras: { weapon: 1 }` + 1 sách + 1 vũ khí.

---

## 3. TEST

| # | Test |
|---|---|
| G1 | `pytest tests` PASS |
| G2 | Gồng: nhấn nhanh vẫn chém đúng nhịp cũ; giữ < 0,7 s rồi thả không có đòn gồng; đo đủ `hold` thì `charged`; đòn gồng mất đúng `damage`; đi chậm ≈ × `moveSpeed`; nhảy, lướt, trúng đòn đều huỷ. Lính `chargeOnly`: đòn thường gạt, có `blocked` + gợi ý tối đa 1 lần/3 s. Nút ĐÁNH cảm ứng giữ được |
| G3 | Cưỡi: đòn thường không thu phục được; đòn gồng thu phục; đo tốc độ ≈ `speed`, thời gian ≈ `time`; nhảy được, Đánh và Lướt bị bỏ; không mất máu suốt lúc cưỡi; húc hạ lính và rào; boss không bị hạ; gặp mép hố xuống không rơi; trâu lao qua không thu phục thì màn vẫn đi tiếp |
| G4 | Đẩy: đo tốc độ ≈ × `speed`; không kéo được; dừng ở mép hố và bậc; húc lính mất `damage`, hook trả `true` thì không trừ lần 2; đứng lên và nhảy qua được; xe đứng yên khi không có ai đẩy. Xe `blocking` không có `pushable` của chương 5 vẫn chặn như cũ |
| G5 | Mồi: hổ chọn mồi trong tầm; không có mồi thì vồ người chơi; khựng đúng `stuckTime`; `stuckOnly` chém ngoài lúc khựng không trúng; mồi dựng lại sau `respawn`. Hổ chương 5 không có mồi vẫn như cũ, `recover` chém được |
| G6 | Chông: rơi −1 máu, về `safeSpot`, không kẹt; đo nhảy chạy và nhảy + lướt qua hào 160 px (ghi số px thật); hố thường về đầu chunk, khe sông như cũ |
| G7 | Vật phụ: nhặt tăng đúng đếm, HUD phụ hiện; thiếu 1 trong 2 thì NPC mờ + giữ lại + nhắc; đủ cả hai thì gặp được. Màn không có vật phụ thì `#extraHud` ẩn. `requires` số của chương 2–5 giữ nguyên |
| G8 | F2 vẽ các hộp mới; `?viewer=1` chạy; console sạch, trừ 401 khách, cảnh báo asset mượn và thiếu ảnh của layout thử (Q5) |
| G9 | Hồi quy: 3 màn Trưng Trắc + `?layout=p2` + `?layout=skills`; màn 1 Bà Triệu + `?layout=engine`; màn 1 Lý Nam Đế + `?layout=engine` + `?layout=skills`; 3 màn Triệu Việt Vương + `?layout=engine` + `?layout=skills` (đòn bổ, giáo dài); 3 màn Mai Hắc Đế + `?layout=engine` + `?layout=skills` (hổ, gánh, xe `blocking`, ném hũ); 3 màn khung chương 6. Giữ J ở chương 1–5 không đổi gì |
| G10 | `/verify-ui` màn 1 chương 6 `?layout=engine` ở desktop + điện thoại ngang; HUD phụ không che ô sách, kỹ năng |

## 4. FILE

| Loại | File |
|---|---|
| Tạo | `docs/REPORT_PH-ENGINE.md` |
| Sửa | `js/engine/{config,chapter,state,geometry,entities,combat,hazards,player,level-flow,damage,ui}.js`, `js/engine/render/{entities,player,terrain,debug}.js`, `templates/gameplay/base.html`, `css/game/game.css`, `js/levels/phung-hung/{chapter,config,level1}.js` (layout thử, câu `TEXT` mới), `.claude/rules/engine.md`, `.claude/rules/phung-hung-gameplay.md`, `docs/SUTA_PH_TASK_00.md` (link) |
| Chỉ đọc | `js/levels/{trung-trac,ba-trieu,ly-nam-de,trieu-quang-phuc,mai-hac-de}/*` (không sửa) |

Câu `TEXT` mới (`chargeHint`, `spikeFell`...) là câu kỹ thuật, không phải nội dung lịch sử; chốt nguyên văn khi làm, ghi trong report.

## 5. GATE

1. Không đổi hành vi chương 1–5: mọi cơ chế mới chỉ bật khi dữ liệu chương khai báo; không sửa file chương 1–5.
2. Số mới (`CHARGE`, tốc độ cưỡi, đẩy, `stuckTime`...) là `DESIGN_BASELINE`; số riêng chương ở `phung-hung/config.js`.
3. Test G1–G10 ghi PASS/FAIL có số đo; FAIL hoặc sửa ngoài phạm vi → `BLOCKED`.
4. Report `/task-report`; chỉ commit khi người dùng yêu cầu. Sau đó: prompt Codex `PH_ART_01` (gồm `charge_hold`, `charge_strike`, `ride` cho `PLAYER_MALE`/`PLAYER_FEMALE`, `stuck` cho `EN_TIGER`).
