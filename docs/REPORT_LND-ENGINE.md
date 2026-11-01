# REPORT LND-ENGINE — Cơ chế chung mới cho chương 3

Task card: [SUTA_LND_TASK_ENGINE_01.md](SUTA_LND_TASK_ENGINE_01.md) • 31/10/2026 • **PASS** (test DB chưa chạy — không thuộc phạm vi engine)
Yêu cầu người dùng: làm việc tiếp theo của chương 3 → thêm vào engine các cơ chế màn 1 Lý Nam Đế cần.

## Quyết định người dùng chốt (31/10/2026)
- Q1: đạn tháp canh + thuyền **nhắm vào người chơi** lúc nhả (một cơ chế chung).
- Q2: rơi sông → −1 máu, hiện lại ở **chỗ đứng vững cuối cùng**; hố thường giữ cách cũ.
- Q3: lưới trúc trúng → **−1 máu + trói 1 giây**, có báo hiệu để còn lướt thoát.
- Q4: prompt Codex `LND_ART_01` làm **sau** task này.

## File
| File | Việc |
|---|---|
| `js/engine/geometry.js` | Lưới địa hình: `'~'` ở hàng cuối = cột nước; `terrainHoles()` trả `water`; `makeHazard` thêm `aim`, kind `snare` (treo `dropHeight`, `triggerWidth`, trạng thái); `makeProjectile(…, aim)` → `vx, vy, angle` |
| `js/engine/player.js` | `rememberSafeSpot` → `p.safeSpot` (đất/bục tĩnh, cách mép khe ≥ `RESPAWN_EDGE_MARGIN`; bục hẹp: tâm trong nửa giữa) |
| `js/engine/damage.js` | `respawnAfterFall`: khe sông → về `p.safeSpot`; hố thường như cũ |
| `js/engine/hazards.js` | Kind `snare`; thrower `aim`; đạn bay theo vector, tốc độ riêng `speed`, bay trên khe không "chạm đất", ra khỏi đỉnh/đáy khung thì tan; roller chở vật phẩm rời màn → hiện vật phẩm |
| `js/engine/combat.js` | `revealCarriedItems` (hazard bị phá), `dropHeal` qua hook `CHAPTER.hooks.dropHeal` |
| `js/engine/entities.js` | `makeItem(…, { carrier })` — vật phẩm ẩn nhưng tính vào tổng |
| `js/engine/level-flow.js` | Không nhặt vật phẩm ẩn; `updatePickups` (rơi, nhặt khi thiếu máu, hết hạn) |
| `js/engine/state.js` | `state.pickups`, `player.safeSpot` |
| `js/engine/config.js` | `HEAL_PICKUP` (10 s, nháy 2 s cuối, 16×16, +1 máu), `RESPAWN_EDGE_MARGIN` 20 — `DESIGN_BASELINE` |
| `js/engine/chapter.js` | Hợp đồng: `tiles.water`, kind `snare`, `projectiles[…].speed`, option `aim`, `pickups.heal`, `hooks.dropHeal` |
| `js/engine/render/{terrain,entities,index,debug}.js` | Mặt nước trong khe sông (asset `tiles.water` hoặc dải dự phòng); đạn nhắm xoay theo góc; vẽ bình máu (icon tim chung khi chương chưa có sprite); F2: vạch công tắc lưới, hộp bình máu, không vẽ vật phẩm ẩn |
| `js/levels/ly-nam-de/{config,level1,chapter}.js` | Layout thử `?layout=engine` (`ENGINE_TEST`, sprite thử `netTrap`/`warBoat`/`towerArcher`/`tributeCart`/`hound`, đạn `fireArrow`), hook `dropHeal` chỉ bật ở layout thử |
| `.claude/rules/{engine,ly-nam-de-gameplay}.md` | Ghi cơ chế mới + layout thử |

Không sửa file nào của chương 1–2.

Thay đổi so với task card: **bẫy lưới bám theo đầu người chơi trong lúc báo hiệu và rơi với vận tốc đầu `fallSpeed` 300 px/s**. Bản đầu (lưới đứng yên, rơi từ 0) đo được: người chơi đi bộ (168 px/s) đã qua khỏi chỗ rơi nên lưới không bao giờ trúng. Bản sửa giữ đúng Q3: đi bộ thì bị chụp, lướt đúng lúc lưới rơi thì thoát.

## Kết quả test
| # | Test | Kết quả |
|---|---|---|
| G1 | `pytest tests` | PASS — 108 passed, 1 skipped (`test_app.py` thiếu `SUTA_TEST_DATABASE_URL`) |
| G2 | Sông | PASS — từ bờ trái rơi khe 1 (x 1024): −1 máu, hiện lại x=978 (mép phải người chơi cách khe 21 px), đứng vững; từ mỏm đá (1120–1248) rơi khe 2: hiện lại x=1200 trên mỏm đá; bước ra mép bục giữa sông (mặt 208) rơi xuống: hiện lại x=1338 trên bục, chân 208. Hố thường (layout thử chương 2, x 1088): hiện lại x=840 = đầu chunk +72 như cũ |
| G3 | Đạn nhắm | PASS — thuyền bắn −169,2°, cung thủ 148,8° (người chơi x 1893) / 127,8° (x 1973), góc bay = góc tới tâm người chơi lúc nhả; trúng −1 máu; lướt né được (5 máu); chém trúng nhịp thì tan +30 điểm (chém khi đạn cách ≤ 80 px). Đạn ngang chương 1 (màn 2 Trưng Trắc: 83 frame có đạn) không xoay (`angle` 0) |
| G4 | Lưới | PASS — báo hiệu 0,37 s rồi rơi; đi bộ: trúng sau 0,13 s, −1 máu, trói 1,00 s; lướt đúng lúc lưới rơi: không mất máu; giẫm lại: không kích hoạt lần 2; nằm lại `landed` vô hại |
| G5 | Sách trong xe | PASS — HUD 0/1 từ đầu, chưa phá xe không nhặt được; chém vỡ xe → sách hiện tại x=2793, nhặt 1/1; xe lăn qua không phá → sách hiện tại chỗ xe biến mất (x=2701), quay lại nhặt được |
| G6 | Bình máu | PASS — hạ lính → bình sinh tại tâm lính, rơi tới đất (đáy 248); 3 máu nhặt → 4; đầy máu không nhặt (bình nằm lại); mất sau 10,0 s |
| G7 | F2 / viewer | PASS — chụp F2 ở khúc sông: mặt nước 2 khe, thuyền (hộp tạm) chìm dưới mặt nước, nhãn placeholder; `?viewer=1` màn 1 Lý Nam Đế mở được (liệt kê manifest chung + manifest chương 2 đang mượn); console chỉ có 401 của khách |
| G8 | Hồi quy | PASS — mô phỏng 600–2400 frame (chạy phải, nhảy, chém) không lỗi JS ở: Trưng Trắc màn 1, `?layout=p2`, màn 2, màn 3, màn 3 `?layout=skills`; Bà Triệu màn 1, `?layout=engine`, màn 3 (mưa tên độc, tiền vàng); Lý Nam Đế màn 3. Đây là mô phỏng không chơi tay — không kiểm cảm giác chơi |
| G9 | Giao diện | PASS — `?layout=engine` ở điện thoại ngang 812×375: khung 523×221, trang không cuộn ngang |

Ghi chú: đo bằng `update(1/60)` gọi tay, tạm dừng vòng lặp thật trong lúc đo (số không bị nhân đôi); người chơi được hồi máu ở các bài cần đi xa.

## Vấn đề asset
- Không có asset mới. Mọi hình ở layout thử là hộp dự phòng (`id: null`) hoặc mượn chương 2 — chờ `LND_ART_01`.

## Câu hỏi cho team / TODO
- Prompt Codex `LND_ART_01` (bước tiếp theo): cần thêm vào danh sách — **mặt nước sông** (prop lát ngang, đỉnh ảnh ở mặt đất), **thuyền chiến** (thân nổi, phần dưới chìm dưới mặt nước ~14 px), **lưới trúc** (idle/warn/fall/landed), **hoả tiễn/tên** (ảnh quay phải, engine xoay), **bình máu** (nếu không muốn dùng icon tim chung).
- Tỉ lệ rơi bình máu thật + buff "Lương thảo dồi dào": LND-L3.

## Bước tiếp
Prompt Codex `LND_ART_01` (`/codex-prompt`), rồi LND-L1.
