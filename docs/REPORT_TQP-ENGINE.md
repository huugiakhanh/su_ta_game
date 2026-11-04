# REPORT TQP-ENGINE — Cơ chế chung mới cho chương 4

Task card: [SUTA_TQP_TASK_ENGINE_01.md](SUTA_TQP_TASK_ENGINE_01.md) • 04/11/2026 • **PASS**
Yêu cầu người dùng: làm bước tiếp theo của chương 4 (TQP-ENGINE) theo task card đã duyệt.

## Quyết định người dùng chốt (04/11/2026)
- Q1: đòn bổ = **đang rơi bấm Đánh**; đang bật lên vẫn chém ngang; chỉ bật ở chương khai báo `CHAPTER.plunge`.
- Q2: Codex vẽ thêm strip `plunge` cho `PLAYER_MALE`/`PLAYER_FEMALE` ở `TQP_ART_01`; trong lúc chờ engine dùng ô cuối `attack_01`.
- Q3: prompt Codex `TQP_ART_01` làm sau task này.

## File
| File | Việc |
|---|---|
| `engine/geometry.js` | Cột `'='` (sình) trong lưới địa hình, `terrainMud()`, `inMud(x)`; `makeHazard` thêm trường `drift`/`lurker`/`callHelp`, làn khói `lanes` |
| `engine/config.js` | `MUD`, `STEALTH`, `PLUNGE`; `PLAYER_ANIMATIONS.plunge` (+ `fallback`) |
| `engine/state.js` | `state.maxHealth` (+ `CHAPTER.skills.bonusHealth`, `content.bonusHealth`), `state.mud`, `state.covers` |
| `engine/player.js` | Sình (chậm, nhảy thấp, lún → −1 máu + đẩy ra mép dải); đòn bổ (`canPlunge`, `updatePlunge`, `plungeBox`); `plungeOnly` gạt đòn ngang + nhắc; đánh úp (`ambushTargets` lúc bắt đầu vung); `revealTimer`, `plungeGrace` |
| `engine/combat.js` | `plungeOnly(target)`; `playerStrike(target, fn, multiplier)` + `hooks.onAmbush` |
| `engine/damage.js` | `playerImmune` + `plungeGrace`; `playerHidden()` |
| `engine/hazards.js` | Kind `drift`, `lurker` (chồm `leap`), `callHelp` (gọi lính), action `signal`; thrower không bắn khi người chơi ẩn |
| `engine/enemies.js` | `enemy.alerted`; lính không phát hiện + đi ngang không va trúng khi người chơi ẩn |
| `engine/entities.js` | `makeNpc(…, { requires })` |
| `engine/level-flow.js` | NPC khoá theo số vật phẩm (giữ lại + nhắc `text.npcLocked`); NPC chưa có thoại → coi như đã gặp + cảnh báo; bình máu kẹp `state.maxHealth` |
| `engine/render/{terrain,index,entities,player,debug}.js` | `drawMud` (asset `tiles.mud` hoặc dải bùn dự phòng); hazard `invisible`/`lift`, hộp dự phòng khói + bọt cá sấu; NPC khoá vẽ mờ; người chơi chìm sình/mờ khi ẩn/ảnh `plunge` dự phòng; F2 vẽ sình, vùng ẩn, quãng khói, tầm cá sấu, đồng hồ gọi viện, chữ "ẨN"/"sình Ns" |
| `engine/chapter.js` | Hợp đồng: `tiles.mud/mudLift`, `mud`, `plunge`, `stealth`, `skills.bonusHealth`, `hooks.onPlunge/onAmbush`, hazard kind/option mới, `plungeOnly`, `covers`, `bonusHealth`, `makeNpc requires` |
| `levels/trieu-quang-phuc/{chapter,config,level1}.js` | Bật `plunge`, `stealth`; `TEXT` mới; lính giáo dài `spearman`; sprite hazard thử; `ENGINE_TEST` + `engineTestLayout()` (`?layout=engine`) |
| `.claude/rules/{engine,trieu-quang-phuc-gameplay}.md`, `docs/SUTA_TQP_TASK_00.md`, task card | Ghi cơ chế mới, đánh dấu xong |

Không sửa file nào của chương 1–3.

**Khác task card** (sửa khi chạy thử, cùng mục tiêu):
- E1: lún xong **đặt thẳng người chơi ra mép dải sình gần nhất** (vận tốc đẩy lùi của `hurtPlayer` bị phím đi đè, người chơi lún lại tại chỗ).
- E3: thêm thông số `leap` — cá sấu **chồm lên** theo nửa sóng sin lúc đớp (ngoi 14 px trên mặt nước thì nhảy qua lúc nào cũng thoát).
- E7: đang ẩn thì lính thường **đi ngang không va trúng** (task card ghi "chạm thân vẫn tính" — thử thì đứng ẩn 5 s mất 4 máu vì lính tuần đi xuyên người). Đánh úp xét **lúc bắt đầu vung** (xét lúc trúng thì lính đã kịp phát hiện vì vung làm lộ).
- E6: NPC chưa có thoại (`TODO_MISSING`) thì coi như đã gặp + cảnh báo console, để NPC hộp của layout thử không làm vỡ màn.
- Layout thử 6 chunk (task card ghi 7): khói dời sang chunk 2 (đặt ở chunk 1 trùng đường tuần của lính sau dải sình), NPC khoá ở cuối chunk 6.

Câu `TEXT` mới (kỹ thuật, không phải nội dung lịch sử): `mudSunk` "Bạn bị lún trong bãi sình!", `plungeHint` "Lính giáo dài gạt đòn chém ngang — nhảy lên, đang rơi thì bấm Đánh để bổ xuống!", `npcLocked` "Cần N Quyển Sách Tinh Hoa mới gặp được (đang có M)."

## Kết quả test
Kiểm bằng mô phỏng `update(1/60)` + `setKey()` trong trang `?layout=engine` (server dev cổng 5059), có số đo:

| # | Test | Kết quả |
|---|---|---|
| G1 | `pytest tests` | PASS — 120 passed, 1 skipped (`test_app.py` thiếu DB test) |
| G2 | Sình | PASS — tốc độ đi 168 → 84 px/s; đỉnh nhảy 79 → 38 px; chìm tới ~8 px; ở trong sình 3 s → −1 máu, bị đẩy ra mép trái (tâm x = 146, dải 160–320) |
| G3 | Khói trôi | PASS — làn thấp: đứng yên trúng, đi tới + nhảy qua không trúng; làn cao: đứng yên trúng, lướt xuyên / nhảy qua không trúng; chu kỳ hết quãng → nghỉ 1,2 s → trôi lại |
| G4 | Cá sấu | PASS — lúc bọt (warn) chém không mất máu (2/2); chu kỳ warn 0,6 → attack 1,0 → dive 0,3 → nghỉ 1,5 s; chồm cao 56 px; nhảy qua lúc đang đớp → bị cắn, lúc đã lặn → không; chém lúc ngoi 2 đòn → chết, xoá khỏi màn |
| G5 | Thuyền gọi viện | PASS — đứng gần liên tục 4,00 s → "Thuyền tuần bắn pháo hiệu gọi quân!" + 2 lính sinh ở x 2424 và 2984 (đo lại sau 2 s đi tuần: 2424, 2940), thêm 6 s không gọi lần 2; phá thuyền (3 đòn) trước 4 s → không gọi |
| G6 | Đòn bổ | PASS — chém ngang lính giáo dài: máu 2/2 + gợi ý; đang bật lên (vy −424) bấm Đánh → chém ngang; đang rơi bấm Đánh → bổ (vy 520), trúng đầu lính giáo → 2 → 0, nảy vy −330, không mất máu; bổ xuống đất trống → hết bổ khi chạm đất. Chương 1–3: đang rơi bấm Đánh vẫn chém ngang (xem G11) |
| G7 | NPC khoá | PASS — 0/2 sách: bị giữ ở mép phải 4448 (tâm NPC 4460), nhắc "Cần 2 Quyển Sách Tinh Hoa mới gặp được (đang có 0)."; quay lại nhảy lấy 2 sách → qua NPC (NPC hộp không có thoại → cảnh báo console, coi như đã gặp) → về đích |
| G8 | Ẩn nấp | PASS — đứng ẩn 5 s cạnh 2 lính tuần + cung thủ cách 130 px: 0 máu mất, 0 phát tên, lính không `alerted`; bước ra: lính phát hiện, cung thủ bắn, mất máu; đánh úp sau lưng lính chưa phát hiện: lính 2 máu chết 1 đòn; chém lính đã phát hiện: −1 |
| G9 | Máu tối đa | PASS — layout thử (`bonusHealth` 2): 7/7 máu, HUD 7 tim; bình máu 6 → 7, đầy 7 thì bình nằm lại. Chương 1–3 và 3 màn khung chương 4: 5 |
| G10 | F2 + viewer + console | PASS — F2 vẽ hộp cá sấu đang chồm, khung dải sình/vùng ẩn, nhãn trạng thái; `?viewer=1` chạy; console chỉ có 401 của khách + cảnh báo NPC thử thiếu thoại (cố ý) |
| G11 | Hồi quy | PASS — Trưng Trắc màn 1, `2?layout=p2`, `3?layout=skills`; Bà Triệu `?layout=engine`, màn 3; Lý Nam Đế màn 1, `?layout=engine`, màn 2, `3?layout=skills`; 3 màn khung chương 4: nạp đúng, máu 5, không có sình/vùng ẩn, mô phỏng chạy 20 s (đi + nhảy + đánh) không lỗi, console sạch. Chương 4 khung: đang rơi bấm Đánh → bổ (đúng thiết kế) |
| G12 | Giao diện | PASS một phần — chụp layout thử ở 812×375: trang không cuộn ngang (812/812), HUD 7 tim. NPC hộp mờ khó nhìn (hộp tạm màu nâu, alpha 0,45 trên nền đất) — chờ sprite NPC thật ở TQP-L2. Chưa đo đủ 5 cỡ màn hình |

Ghi chú: mọi hình mới (khói, cá sấu, NPC thử, mặt sình) là hộp/dải dự phòng (`TODO_MISSING`) tới khi có asset `TQP_ART_01`. Số mới đều `DESIGN_BASELINE`, chưa chơi thử bằng tay.

## Vấn đề asset
- Cần trong `TQP_ART_01`: strip `plunge` cho `PLAYER_MALE` + `PLAYER_FEMALE` (asset chung, giữ ID — Q2), mặt sình (prop map lát ngang), khói chướng khí, cá sấu (`warn`/`attack`/`dive`/`death`), thuyền tuần tiễu có `signal`, lính giáo dài.

## TODO
- Chơi thử bằng tay (cảm giác đòn bổ, độ khó sình/cá sấu) — chưa làm.
- `test_app.py` trên DB test.

## Bước tiếp
Prompt Codex `TQP_ART_01` (`/codex-prompt`), rồi TQP-L1.
