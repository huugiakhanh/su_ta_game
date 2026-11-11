# REPORT NQ-ENGINE — Cơ chế chung mới cho chương 7

Ngày: 11/11/2026 • **PASS** (`test_app.py` chưa chạy trên DB test; chưa chơi tay; asset là hộp dự phòng — xem dưới)
Task card: [SUTA_NQ_TASK_ENGINE_01.md](SUTA_NQ_TASK_ENGINE_01.md). Yêu cầu người dùng: "làm việc tiếp theo" sau NQ-SKELETON → task card NQ-ENGINE, duyệt rồi code.

## Hiện trạng / đo trước khi sửa
- Engine có thuyền nổi chở người (bục `ride`) nhưng không lái được; cưỡi trâu tự lao; khe sông `'~'` cố định; không có lực đẩy ngang, xoáy, gánh giữa màn, đạn choáng. Tiến trình chỉ có `rescued`.
- `pytest tests` trước khi sửa: 162 passed, 1 skipped (report NQ-SKELETON).

## Quyết định (người dùng chốt, 11/11/2026)
- Thuyền: đứng trên boong thì ←/→ lái, người đứng yên; nhảy/đánh/ném vẫn dùng, lướt tắt; thuyền chỉ đi trong khúc sông của nó.
- Thủy triều **có bãi triều**: nước ròng đi bộ được, nước lớn thành sông; đứng trên bãi lúc ngập −1 máu về chỗ đứng vững; báo trước ~2 s. Cọc ngầm chỉ đâm lúc ròng.
- Số cọc lưu ở **cột mới `stakes`** (migration 013).
- Lưới: **đạn vòng cung gây choáng**, không mất máu.

## File đã sửa / tạo
| File | Việc |
|---|---|
| `frontend/static/js/engine/tide.js` (mới) | Đồng hồ triều 4 pha, đổi bãi triều, `forceTide`, `tideActive` |
| `frontend/static/js/engine/geometry.js` | Cột `','` bãi triều, `setTide`, `onFlat`, `terrainFlats`; kind `boat`/`whirl`/`gust` mặc định vô hại |
| `frontend/static/js/engine/hazards.js` | `updateBoat` (lái, trôi, kẹp khúc nước, nổi theo triều), `updateWhirl`, `updateGust`, cờ `tideOnly`, đạn `stun` (`hitPlayer`) |
| `frontend/static/js/engine/player.js` | Lái thuyền (`boat.drive`), gió `p.windVx`, `startBurden` + đống cọc, `plantStake`, bãi không làm chỗ đứng vững, animation `row` |
| `frontend/static/js/engine/{state,level-flow,end-game,progress,entities,config,ui,chapter}.js` | `state.tide/shelters/stakeSpots/stakesPlanted/stakesRequired`; gọi `updateTide`; giữ lại trước đích khi thiếu cọc; ghi `stakes`; `makeStakeSpot`; `row` fallback `idle`; ô `#tideHud` + ô đếm cọc; hợp đồng chương |
| `frontend/static/js/engine/render/{terrain,entities,index,debug}.js` | Mặt nước hạ theo triều, vẽ bãi lộ + màng nước báo lên, mốc cọc, vệt gió + vòng xoáy dự phòng, hộp F2 |
| `frontend/templates/gameplay/base.html`, `frontend/static/css/game/game.css` | Ô `#tideHud`, nhấp nháy lúc báo lên (tắt khi `prefers-reduced-motion`) |
| `backend/migrations/013_progress_stakes.sql` (mới), `backend/routes/api.py`, `backend/repositories/progress_repository.py` | Cột `stakes` 0–6, `MAX_STAKES`, `parse_progress`, đọc/ghi cột |
| `tests/test_time_api.py`, `tests/test_app.py` | `stakes` nhận 0/3/6, từ chối 7/−1/"3"/2.5; thiếu trường = 0; roundtrip; `013` trong danh sách migration |
| `frontend/static/js/levels/ngo-quyen/{config,level1,chapter}.js` | Layout thử `?layout=engine`, `STAKES`, câu `TEXT` mới |
| `.claude/rules/{engine,backend,ngo-quyen-gameplay}.md`, `docs/SUTA_NQ_TASK_00.md`, `docs/SUTA_NQ_TASK_ENGINE_01.md` (mới) | Tài liệu |

Không sửa file nào trong `js/levels/` của chương 1–6.

Khác task card:
- Số triều và số cọc tối thiểu của layout thử khai báo trong nội dung màn (`content.tideSpec`, `content.stakesRequired`) để màn 1 thật không có triều; khoá đặt tên `tideSpec` để không đè `state.tide`. Số triều nằm trong `state.tide.spec`.
- Lỗi phát hiện khi đo và đã sửa trong task: lực xoáy ban đầu cộng dồn vào vận tốc thuyền (tới lõi sau 0,17 s thay vì ~0,57 s). Nay là vận tốc cộng thêm từng frame, không tích luỹ.
- Câu `text.stakeFlooded` hầu như không hiện: mốc nằm trên bãi, lúc ngập người chơi không đứng được ở đó (rơi xuống nước).

Câu `TEXT` mới (câu kỹ thuật, không phải nội dung lịch sử): `tideRising` "Nước triều sắp lên! Rời khỏi bãi bùn.", `tideFalling` "Nước triều đang rút.", `gustWarn` "Gió ngược sắp thổi! Nấp sau tảng đá.", `whirlHit` "Thuyền bị xoáy nước cuốn!", `stakePicked` "Đã vác cọc. Ra bãi bùn lúc nước ròng để cắm.", `stakePlanted` "Đã cắm cọc n/N", `stakeFlooded` "Nước đang lớn, chưa cắm cọc được.", `stakesMissing` "Cần cắm thêm n cọc nữa.", `burdenHint` "Đang vác cọc: tới mốc trên bãi bùn rồi bấm Đánh để cắm.", lưới "Bạn bị lưới chụp trúng!".

## Kết quả test
Đo bằng `update(1/60)` trên trình duyệt thật, `?layout=engine&debug=1`.

| # | Test | Kết quả |
|---|---|---|
| G1 | `pytest tests` | PASS — 170 passed, 1 skipped (`test_app.py` thiếu `SUTA_TEST_DATABASE_URL`). Migration 013 **đã chạy trên DB dev** (cột `stakes` smallint mặc định 0); test DB **chưa chạy** |
| G2 | Thuyền | PASS — đứng trên boong (chân 260 = GROUND_Y + 12 lúc ròng); tốc độ đo 140 px/s = `speed`; người lệch tâm thuyền 2 px khi chạy; dừng đúng mép khúc sông (mép phải 480/480); lướt trên boong bị tắt; nhảy lên bờ được (bờ cao hơn boong 12 px), xuống thuyền đi bộ như cũ |
| G3 | Triều | PASS — mốc đổi pha 6,00 / 8,02 / 14,03 / 16,05 s (ròng 6, lên 2, lớn 6, rút 2); lúc ròng đi trên bãi (chân 248), bãi không thành chỗ đứng vững (giữ 1600); triều lên thì rơi −1 máu, về x 1600 ngoài bãi; khe chunk 3 từ 192 px thành 384 px lúc lớn; thuyền 2 lái tới 1664 (mép bãi) lúc lớn, nước rút thì về lòng sông (x 1856); cọc ngầm lúc ròng `harmful` + hiện, lúc lớn vô hại + ẩn; lái qua cọc lúc ròng −1 máu, lúc lớn 0; `#tideHud` "Ròng 6s"/"Lớn 4s" chỉ hiện ở layout có triều |
| G4 | Gió | PASS — đứng yên trong vùng lúc active bị đẩy 2 px/frame = 120 px/s = `force`; vào vùng nấp thì dừng (lần đo đầu ra −88 px/s là do chạm vùng nấp giữa chừng); lúc off không đẩy; không mất máu; câu báo `warn` |
| G5 | Xoáy | PASS — thuyền không người cách tâm 50 px tới lõi sau 0,60 s (40 px / 70 px/s); người trên thuyền 0,58 s, −1 máu, về chỗ đứng vững, thuyền về `homeX`; chèo ngược 1 s thì thoát ra 141 px; ngoài `radius` thuyền đứng yên (0 px/s) |
| G6 | Cọc | PASS — chạm đống cọc thì vác, câu nhắc; đi 101 px/s (= 168 × 0,6), khoá lướt; cắm mốc 1 → "Đã cắm cọc 1/3", ô HUD "1/3"; 1 cọc thì bị giữ ở x 4502 trước đích 4512 + "Cần cắm thêm 1 cọc nữa."; cắm mốc 2 → về đích, sessionStorage `stakes: 2`. PUT `progress` có `stakes`: PASS qua pytest; **chưa ghi thật** (lượt khách) |
| G7 | Đạn choáng | PASS — lưới trúng: choáng 1,00 s, máu 5 → 5, câu "Bạn bị lưới chụp trúng!"; đang lướt thì lưới bay qua (0 frame choáng) |
| G8 | F2 / console | PASS — F2 vẽ khúc nước của thuyền, tầm + lõi xoáy, vùng gió, vùng nấp, mốc cọc, dòng trạng thái triều. Console: chỉ 401 của khách và cảnh báo lệch `stage_length` do mượn map chương 6. Sprite placeholder vẽ hộp, không có cảnh báo |
| G9 | Hồi quy | PASS (khói) — 24 URL chạy 900 frame mỗi URL, 0 lỗi: 3 màn Trưng Trắc + `?layout=p2` + `?layout=skills`; `?layout=engine` chương 2–7; màn 2 chương 3, 4, 6; màn 3 chương 4 + `?layout=skills` chương 2–6; màn 1 chương 5; 3 màn khung chương 7. Đây là kiểm không ném lỗi, **chưa chơi lại tay**; nhánh mới chỉ chạy khi có `boat`/`whirl`/`gust`/`tideOnly`/`burdenSource`/`stakeSpots`/`tide`/`stun`, chương 1–6 không khai báo |
| G10 | Giao diện | PASS — 812×375: canvas 523×221; tim, ô cọc "⚒ 0/3", ô triều "🌊 Ròng 6s" cùng hàng, không chồng nhau, không chồng ô kỹ năng, nằm trong canvas. 1366×768 chụp hình layout có F2 |

## Vấn đề asset
Chưa có asset (giao `NQ_ART_01`): thuyền `OB_NQ_BOAT` (+ `row`), xoáy `FX_NQ_WHIRLPOOL`, gió `FX_NQ_GUST`, đá nấp `OB_NQ_WIND_ROCK`, cọc ngầm `OB_NQ_HIDDEN_STAKE` (+ `submerged`), đống cọc `OB_NQ_STAKE_PILE`, mốc cắm cọc (sprite `spot`/`planted`), lính quăng lưới `EN_NQ_NET_THROWER`, lưới `PJ_NQ_NET`, tile bãi triều (`tiles.flat`), strip `row` cho `PLAYER_MALE`/`PLAYER_FEMALE`. ID trong layout thử là đề xuất, chốt ở `/codex-prompt`.

## Câu hỏi cho team / TODO
- Muốn chạy `test_app.py` cần `SUTA_TEST_DATABASE_URL`.
- Số `DESIGN_BASELINE` cần chơi tay: tốc độ thuyền 140, `drag` 3, triều 6/2/6 s (layout thử; màn thật chốt ở NQ-L1/L2), lực gió 120, xoáy `pull` 70 / `radius` 64 / `core` 10, choáng lưới 1 s.
- Tiếp theo: prompt Codex `NQ_ART_01` rồi NQ-L1.
