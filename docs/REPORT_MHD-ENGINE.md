# REPORT MHD-ENGINE — Cơ chế chung mới cho chương 5

Task card: [SUTA_MHD_TASK_ENGINE_01.md](SUTA_MHD_TASK_ENGINE_01.md) • 07/11/2026 • **PASS** (mô phỏng trên trình duyệt; chưa chơi tay, chưa thử tài khoản thật, `test_app.py` chưa chạy trên DB test — xem dưới)
Yêu cầu người dùng: làm 5 cơ chế engine của chương 5 theo task card đã duyệt.

## Quyết định (người dùng chốt 07/11, theo đề xuất)
- Q1: chạm là tự nhặt khi tay trống; đang cầm thì bấm Đánh là ném; đang cầm không chém được.
- Q2: tới gần xe cống bấm Đánh là đập sọt, hết gánh; xa xe chỉ gợi ý.
- Q3: không gom hũ dầu chương 1, chỉ dùng lại công thức đường bay.
- Q4: layout thử dùng hộp dự phòng tới `MHD_ART_01`.
- Q5: `rescued` ghi đè theo lượt qua màn 1 gần nhất.

## File đã sửa / tạo
| File | Việc |
|---|---|
| `js/engine/carry.js` (mới) | E1: ném, vật bay, hiệu ứng vỡ |
| `js/engine/combat.js` | `spawnCarry`, hook `dropCarry`, `freePeople`, hook `onHazardBroken` |
| `js/engine/hazards.js` | E2 `updatePounce`; E3 `startLob`, `updateLob`, `landProjectile`, `life` |
| `js/engine/player.js` | E4 gánh, `releaseBurden`; ưu tiên phím Đánh; `throwSwing`; hazard `blocking`; tách `standOn`, `pushOut` |
| `js/engine/geometry.js` | `makeHazard`: kind `pounce`, `span`, `frees` |
| `js/engine/state.js`, `config.js`, `chapter.js` | Trường mới, `BURDEN`, `burdenIdle/Run`, hợp đồng |
| `js/engine/level-flow.js` | Nhặt vật, `updateThrown`, `updateRunners` |
| `js/engine/end-game.js` | Qua màn 1 ghi `rescued` |
| `js/engine/ui.js`, `css/game/game.css` | Ô Lướt `skill--locked` |
| `js/engine/render/{entities,index,debug}.js` | Vẽ vật cầm, vật bay, hiệu ứng, người chạy thoát; F2 |
| `js/levels/mai-hac-de/{chapter,config,level1}.js` | `CARRY`, `RESCUE`, sprite, `ENGINE_TEST`, móc layout thử, `burdenHint` |
| `.claude/rules/{engine,mai-hac-de-gameplay}.md`, `docs/SUTA_MHD_TASK_00.md`, task card | Tài liệu |

Không sửa file nào trong `js/levels/{trung-trac,ba-trieu,ly-nam-de,trieu-quang-phuc}/`.

Khác task card (nhỏ):
- Hổ kẹp điểm rơi bằng option `span: [min, max]`, không dùng `patrolMin/patrolMax`, vì `makeHazard` không có 2 trường này.
- Layout thử bật gánh bằng `content.burden`; màn thật dùng `LEVEL.burden`.
- Tiếng nhặt dùng `item` có sẵn (engine không có `pickup`).
- Công thức đường bay chỉnh so với chương 1: tích phân đúng parabol, và tính theo mốc chạm đất của từng loại (vật ném `y` là tâm, đạn `y` là đỉnh hộp). Bản đầu ném được 149/160 px, hòm sai tới 6,5 px; sau sửa ném 160/160 px, hòm sai ≤ 3,6 px.

Câu `TEXT` mới, không phải nội dung lịch sử: `burdenHint` = "Đang gánh nặng! Tới xe cống rồi bấm Đánh để đập sọt."

## Kết quả test
Mô phỏng `update(1/60)` trên trình duyệt, tài khoản khách, `?layout=engine` màn 1 chương 5.

| # | Test | Kết quả |
|---|---|---|
| G1 | `pytest tests` | PASS — 137 passed, 1 skipped (`test_app.py` thiếu `SUTA_TEST_DATABASE_URL`) |
| G2 | Ném | PASS — tầm 160 px cả 2 hướng (41 frame ≈ 0,68 s); đang cầm không nhặt thêm, hũ thứ 2 nằm lại; hết `life` thì mất; cú ném không có hộp chém (`throwSwing`). Bot không ném lúc đang rơi: chương 5 không bật đòn bổ nên chưa kiểm thứ tự ưu tiên với đòn bổ trên chương có `plunge` |
| G3 | Trúng | PASS — bao cát 3 → 2 đúng 1 lần qua hook, chém không mất máu; `impact` hiện rồi hết. Nhánh không hook dùng `strike()`, chưa đo riêng trên lính |
| G4 | Hổ | PASS — ẩn: chém không trúng, không mất máu; đỉnh vồ 70 px; đổi trạng thái warn → leap → recover → leap; trúng người khi `leap`; lướt miễn (0 máu); `recover` chém được, 3 → 2; điểm rơi nhắm khe hố 1760–1856 bị đẩy về 1882 |
| G5 | Hòm | PASS — đo ở 5 khoảng cách 90–210 px, quan đứng yên: sai 1,4–3,6 px so với chỗ người chơi lúc ném (khoảng 1 frame bay), 54 frame; chặn ngang ở 2561, 0 máu mất; chém vỡ; 4 hòm thì còn 3 (`maxLanded`); hết `life` thì mất; rơi vào hố thì tan |
| G6 | Gánh | PASS — tốc độ 100,8 = ×0,6; đỉnh nhảy 37,9/79,1 = ×0,48 (lý thuyết ×0,49); Lướt không chạy; Đánh xa xe vẫn gánh; Đánh gần xe hết gánh và vung đòn; tốc độ về 168; rơi hố vẫn gánh. **"Chơi lại" chưa đo riêng** (`createLevelState` đặt lại) |
| G7 | Giải cứu | PASS — phá xe: `rescued` +1, 1 người chạy 75 px trong 0,5 s, hết `life` thì mất; không vượt `max`; thắng màn 1: `suta.mhd.progress` có `rescued: 3`. **Chưa thử PUT bằng tài khoản thật và sang màn 2 thật** (`saveProgress` gộp trường) |
| G8 | `blocking` | PASS — xe sống chặn ở mép 996, đứng lên được, xác không chặn. Cột đá chương 1: chưa đo riêng; `pushOut` là code cũ tách ra, boss chương 1 chạy không lỗi |
| G9 | F2, viewer, console | PASS — vẽ F2 30 frame không lỗi; `?viewer=1` nạp được; console chỉ có 401 khách, cảnh báo asset mượn và cảnh báo khi server đã dừng |
| G10 | Hồi quy | PASS — 20 trang của 5 chương, mỗi trang tới 1800 frame có đi, nhảy, đánh: 0 exception, 0 request tài nguyên lỗi. Hũ dầu boss chương 1 vẫn phản được. **Chưa chạy** `ba-trieu/2`, `ly-nam-de/2`; `ly-nam-de/3` chỉ chạy `?layout=skills`. Hồi quy chạy trước lần chỉnh cuối công thức `lob`, chỉ ảnh hưởng đạn có `lob` (chưa chương nào dùng ngoài chương 5) |
| G11 | Giao diện | PASS — 812×375 không tràn; ô Lướt mờ 0,4 khi gánh, hết gánh thì bỏ; bấm nút ĐÁNH (giả lập chạm) ném được. Không chạy trên điện thoại thật |

Ghi chú G10: 2 lượt bot hết máu (`ly-nam-de?layout=engine`, `trieu-quang-phuc/2`). Đã kiểm: mọi lần mất máu ở y ≈ 354–366, tức bot rơi sông rồi hồi sinh; không phải lỗi mới.

Các số chỉ là `DESIGN_BASELINE`, chưa cân chỉnh độ khó. Không dữ liệu người chơi nào được ghi vào DB.

## Vấn đề asset
- Layout thử dùng hộp dự phòng cho `EN_TIGER`, `OB_TRIBUTE_CART`, `PJ_SILVER_CHEST`, `PJ_OIL_JAR`, `FX_OIL_FIRE` (Q4). Chép cùng ID ở đợt `MHD_ART_01`.
- `NPC_MHD_PORTER` trong `RESCUE.runner` là ID đề xuất, chốt trong prompt Codex.
- `MHD_ART_01` cần thêm `burden_idle`, `burden_run` cho `PLAYER_MALE`/`PLAYER_FEMALE`; `warn`, `leap`, `recover` hiện map tạm vào `idle`/`run` của `EN_TIGER`.

## Câu hỏi cho team / TODO
- Nguồn về Thúc Bảo, duyệt thoại MHD-00 §4–5 (không chặn MHD-L1, trừ thoại dẫn §5.2).
- Chạy `test_app.py` khi có `SUTA_TEST_DATABASE_URL`.

## Bước tiếp
Prompt Codex `MHD_ART_01` (`/codex-prompt`), rồi MHD-L1.
