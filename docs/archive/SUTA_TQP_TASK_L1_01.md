# SỬ TA — CHƯƠNG 4: TRIỆU VIỆT VƯƠNG
# TASK CARD: TQP-L1 — MÀN 1 "TUỔI TRẺ RÈN LUYỆN" (BỐ CỤC THẬT + ASSET TQP_ART_01)

TASK_ID: TQP-L1 • Version 1.0 • 04/11/2026 • **ĐÃ DUYỆT 04/11/2026** (Q1–Q5 theo đề xuất) • **XONG 04/11/2026** (chơi tay OK, asset → `IN_GAME`; report [REPORT_TQP-L1.md](REPORT_TQP-L1.md))
Task card tổng: [SUTA_TQP_TASK_00.md](../SUTA_TQP_TASK_00.md) (§3.1, §5, §6) • Asset: `TQP_ART_01` (Gate A1 + A2 đã PASS; prompt Codex đã xoá khi xong, kết quả soát tóm tắt trong report)
Mẫu: màn 1 Lý Nam Đế (`js/levels/ly-nam-de/level1.js` — nhóm xáo theo vùng, khe sông, tháp canh qua `hooks.draw`, mini-boss cố định, NPC dẫn màn, nghỉ chân) • Cơ chế: TQP-ENGINE (sình, khói trôi, cá sấu, thuyền gọi viện, đòn bổ, máu tối đa)
Rule: `trieu-quang-phuc-gameplay.md`, `engine.md`, `assets-32bit.md`

---

## 0. MỤC TIÊU

Thay bố cục khung (6 chunk, asset mượn chương 3) bằng màn 1 thật:
- **12 chunk**, có **khu rèn luyện** ở chunk 1–2.
- **9 loại chướng ngại** theo Excel, cộng **mini-boss đội trưởng giáo dài** và 2 lính hộ tống.
- 5 Quyển Sách Tinh Hoa, 4 bia câu hỏi, 1 điểm nghỉ chân; **Triệu Quang Phục dẫn màn**.

Chép asset `TQP_ART_01` sang bản chạy, chơi thử, chỉnh số, rồi đổi status → `IN_GAME`.

**Không làm:** nội dung màn 2–3 (chỉ đổi sprite tạm nếu cần, §5), kỹ năng, boss Dương Sàn, nhạc riêng.

## 1. ASSET

Chép từ vùng Codex sang bản chạy, **giữ cấu trúc thư mục**. Chỉ chép file manifest tham chiếu, không chép `raw/`, `meta/`, `preview/`, `frames/`, `*.prompt.txt`:

| Nguồn | Đích | Số lượng |
|---|---|---|
| `assets/sprites-32bit/trieu-quang-phuc/` | `frontend/static/assets/images/trieu-quang-phuc/sprites-32bit/` + `manifest_tqp.json` | 17 ID, 47 strip |
| `assets/maps-32bit/trieu-quang-phuc/` | `frontend/static/assets/images/trieu-quang-phuc/maps-32bit/` + `maps_tqp.json` | 4 nền + 6 prop |
| `assets/sprites-32bit/player/PLAYER_{MALE,FEMALE}/player_*_plunge.png` | `images/shared/sprites-32bit/player/…` | 2 strip |

- `manifest_shared.json`: thêm animation `plunge` (4@16, `frame_w` 80) vào `PLAYER_MALE`/`PLAYER_FEMALE`. Chép nguyên mục từ manifest nguồn của Codex. Không đổi animation khác. Prompt đã cho phép thêm animation này; đây vẫn là chỗ sửa manifest chung duy nhất.
- `engine/config.js` `PLAYER_ANIMATIONS.plunge`: bỏ `fallback` khi đã có strip thật (giữ fallback nếu engine cần cho chương khác — xem lúc làm).
- `config.js` chương 4:
  - `SPRITE_ROOT`/`MAP_ROOT` trỏ `images/trieu-quang-phuc/`;
  - `BORROWED_MAPS` mượn: chương 1 (trời, tile, bia câu hỏi), chương 2 (`ITEM_BT_TINH_HOA`, `BG_BT_FAR_PLAIN`), chương 3 (`BG_LND_MID_CHU_DIEN`, `PROP_LND_RIVER_WATER`, `PROP_LND_ROCK_LEDGE`).
- Hitbox Claude tự khai báo (pixel logic, từ số đo report Codex — `DESIGN_BASELINE`):

| Thực thể | Asset | Khai báo |
|---|---|---|
| Triệu Quang Phục | `NPC_TQP` + `PORTRAIT_TQP` | guide đầu màn, như Lý Bí chương 3 |
| Lính tuần | `EN_LUONG_PATROL` | như chương 3 (22×34, kích 49) |
| Lính giáo dài | `EN_LUONG_SPEARMAN` | `guard` `plungeOnly`, 22×34; tầm đâm ô 4 = 56,5 logic từ pivot, cao 20,75 |
| Đội trưởng giáo dài | `EN_LUONG_SPEAR_CAPTAIN` | `guard` `boss` `plungeOnly`, ~30×46; tầm 75, cao 30,75 |
| Cung thủ trên cây | `EN_LUONG_ARCHER` + `PJ_CROSSBOW_BOLT`, cây `PROP_TQP_ARCHER_TREE` | thrower `aim` đứng cao 87 (mặt cành); cây vẽ qua `hooks.draw.beforeEnemies`, như tháp canh chương 3 |
| Bẫy chông ẩn | `TR_BAMBOO_SPIKE_PIT` | `trap` như chương 2 (36×6, `hidden` → `reveal`) — **không cần E9** (ảnh `hidden` đã là lá phủ) |
| Sình | `PROP_TQP_MUD` | `CHAPTER.tiles.mud`, mặt ở hàng 12–15 ảnh (3 logic) |
| Khói chướng khí | `FX_SWAMP_GAS` | `drift` 2 làn, hộp ~52×14 (bbox ô) |
| Rắn | `EN_SWAMP_SNAKE` + bụi `PROP_TQP_GRASS_TUFT` | `rusher` thấp ~40×6; bụi cỏ vẽ **sau người chơi** (`hooks.draw.afterPlayer`) |
| Cá sấu | `EN_CROCODILE` | `lurker` trong khe nước, hộp đớp 53×22 (ô 5); bù chênh neo `warn` (§1.1) |
| Thuyền tuần | `EN_LUONG_WAR_BOAT` | thrower nổi + `callHelp` + `signal`; mốc che nước y 168 ảnh |
| Bù nhìn rơm / bù nhìn cầm giáo | `OB_TQP_STRAW_DUMMY` / `_SPEARMAN` | hazard `prop` có `hp`, không gây hại; bù nhìn giáo `plungeOnly` |
| Cọc tre | `PROP_TQP_BAMBOO_POST` | bục một chiều 16 px, mặt trên hàng 0 |
| Cổng trại nghĩa quân (đích) | `PROP_TQP_REED_GATE` / `_OPEN` | `FINISH_GATE`, mở khi đủ 5 sách + hạ đội trưởng |

### 1.1 Sửa nhỏ engine (chỉ nếu chơi thử cần)
- **Neo theo animation**: thêm trường tuỳ chọn `animLift: { warn: N }` vào sprite hazard. Ở `warn`, mắt/bọt cá sấu nằm ở hàng ≤ 51 ảnh, còn thân ở `attack` nằm ở hàng 60–123. Không có trường này thì mắt nổi cao hơn mặt nước ~18 logic. Mặc định 0, chương khác không đổi.
- Không thêm cơ chế khác; khu rèn luyện dùng cơ chế có sẵn (§2.1, Q2).

## 2. BỐ CỤC (DESIGN_BASELINE)

| Chunk | Vùng (lớp giữa) | Ghi chú |
|---|---|---|
| 1–2 | bãi tập (`BG_TQP_MID_TRAINING_YARD`) | khu rèn luyện cố định, §2.1; không chướng ngại xáo |
| 3–4 | làng Chu Diên (`BG_LND_MID_CHU_DIEN` mượn) | |
| 5–7 | bãi lau ven sông (`BG_TQP_MID_REED_BANK`) | khe nước: cá sấu, thuyền |
| 8–10 | đầm lầy (`BG_TQP_MID_SWAMP`) | sình, khói; nghỉ chân đầu chunk 8 |
| 11–12 | bờ đầm Dạ Trạch (`BG_TQP_MID_DA_TRACH`) | **mini-boss chunk 11**; cổng trại = đích `worldX(12, 618)` |

- Đồi xa `BG_BT_FAR_PLAIN` cả màn. Dài 12 × 768 = **9216 px**.
- 4 bia câu hỏi ở chunk 3, 5, 8, 10, rút 4 câu không trùng từ `LEVEL1_QUESTION_POOL` (35 câu). Không đặt bia trong khe nước hay sình.

### 2.1 Khu rèn luyện (chunk 1–2, cố định)
1. TQP đứng đầu chunk 1, nói thoại dẫn màn (§4).
2. 3 bù nhìn rơm (`prop` hp 1) — chém ngang.
3. 2 cọc tre cao dần — nhảy lên.
4. 1 bù nhìn cầm giáo (`prop` hp 1, `plungeOnly`) — chém ngang thì gạt + hiện `plungeHint`, nhảy lên cọc rồi bổ xuống mới vỡ.
5. Chặn đường cuối chunk 2 tới khi đủ 4 bù nhìn vỡ — **xem Q2**.

Bỏ bài "lướt qua khe thấp" của TQP-00 (không có asset vật chắn thấp) — **xem Q3**.

## 3. CHƯỚNG NGẠI — 11 NHÓM XÁO + 1 CỐ ĐỊNH + MINI-BOSS

Mỗi lượt xáo các nhóm vào chunk 3–10 trong **vùng được phép** (lệch ±60 px; nhóm có địa hình lệch bội số 16 px):

| # | Nhóm | Cơ chế | Vùng | Số DESIGN_BASELINE |
|---|---|---|---|---|
| 1–2 | Lính tuần (×2) | `guard` | 3–10 | hp 2, như chương 3 |
| 3–4 | Lính giáo dài (×2) | `guard` `plungeOnly` | 3–10 | hp 2; mỗi nhóm kèm 1 bục/cọc tre trước lính để nhảy bổ |
| 5 | Cung thủ trên cây | thrower `aim` cao 87 | 3–4, 8–10 | bắn mỗi 2,0 s, tầm 240; không với tới |
| 6 | Bẫy chông ẩn | `trap` | 3–4, 8–10 | −1 máu |
| 7 | Rắn trong bụi cỏ | `rusher` + bụi cỏ tiền cảnh | 5–10 | hp 1, 150 px/s, lao ra khi người chơi cách 180 |
| 8 | Cá sấu | `lurker` khe nước 112 px | sông 5–7 | như layout thử TQP-ENGINE; hp 2 |
| 9 | Thuyền tuần | thrower nổi + `callHelp` | sông 5–7 | khe 176 px có mỏm đá giữa; hp 3, bắn mỗi 2,2 s, gọi 2 lính sau 4 s |
| 10 | Bãi sình | lưới `'='` 160 px | đầm 8–10 | như TQP-ENGINE (3 s lún) |
| 11 | Khói chướng khí (2 làn) | `drift` | đầm 8–10 | làn thấp + làn cao, như layout thử |
| 12 | Bẫy chông cố định | `trap` | chunk 9 | |
| 13 | **Mini-boss đội trưởng giáo dài** | `guard` `boss` `plungeOnly` | **cố định chunk 11** | hp 6, 2 `EN_LUONG_PATROL` hộ tống; chết rơi 1 sách |

- Sách: **4 cố định** (chunk 3, 6, 8, 10 — trên cao vừa nhảy hoặc trên cọc/mỏm đá) + 1 rơi từ đội trưởng = 5.
- Nghỉ chân hồi 1 máu (một lần) ở chunk 8, như chương 2–3.
- Kiểm bố cục bằng `checkTerrainFootprints`, `checkPlatformReach`, `checkNpcClearance`; không đặt nhóm khác vào khe nước hay dải sình.

## 4. NỘI DUNG CHỮ

- Thông báo đầu màn + 2 câu TQP dẫn màn: **TQP-00 §5, đang là nháp chờ team duyệt** — **xem Q1**. Chép nguyên văn vào `dialogue-data.js` (`STORY_TQP_INTRO`), chân dung `PORTRAIT_TQP`.
- Câu thông báo trúng/hạ (đội trưởng, cá sấu, rắn, khói, chông, bù nhìn, thuyền): câu ngắn kiểu chương 3, không có nội dung lịch sử.

## 5. FILE

| Loại | File |
|---|---|
| Tạo (chép asset) | `frontend/static/assets/images/trieu-quang-phuc/{sprites,maps}-32bit/**`; 2 strip `plunge` ở `images/shared/sprites-32bit/player/` |
| Sửa | `images/shared/sprites-32bit/manifest_shared.json` (thêm `plunge`) |
| Sửa | `js/levels/trieu-quang-phuc/{config,level1,chapter,dialogue-data}.js`; `level2.js`, `level3.js` chỉ khi sprite tạm không còn nạp được (bẫy lưới chương 3 → bẫy chông) |
| Tạo | `js/levels/trieu-quang-phuc/render-extras.js` (cây cung thủ trước lính, bụi cỏ sau người chơi — `hooks.draw`) |
| Sửa engine (nếu cần, §1.1) | `js/engine/render/entities.js` (`animLift`), `engine/chapter.js` (ghi hợp đồng), `engine/config.js` (`PLAYER_ANIMATIONS.plunge`) |
| Sửa | `templates/components/home/{timeline,chapter}.html` — mở thẻ TQP `data-unlock-after="3"` (**xem Q4**) |
| Sửa (sau chơi thử) | status `NORMALIZED` → `IN_GAME` ở `manifest_tqp.json` / `maps_tqp.json` (bản nguồn rồi chép lại) |
| Sửa tài liệu | `.claude/rules/{trieu-quang-phuc-gameplay,assets-32bit,engine}.md`, `docs/SUTA_TQP_TASK_00.md` §2, `docs/REPORT_TQP-L1.md` (mới); xoá `docs/CODEX_PROMPT_TQP_ART_01.md` khi xong (kết quả soát tóm tắt trong report) |
| Chỉ đọc | `js/levels/ly-nam-de/{level1,config,render-extras}.js`, `ba-trieu/config.js` (mẫu bẫy chông, không import), `js/engine/*` |

Giữ layout thử `?layout=engine`, chuyển sang asset thật (bỏ hộp tạm `id: null`).

## 6. TEST

| # | Test |
|---|---|
| L1 | Màn dài 9216 px, 5 vùng đúng chunk; console sạch (trừ 401 khách); không ảnh nào vẽ hộp tạm; hết cảnh báo "stage khác" |
| L2 | Đúng số nhóm §3; 10 lượt tải lại: chunk 1–2 không có nhóm xáo, cá sấu/thuyền luôn ở 5–7, sình/khói luôn ở 8–10, không nhóm nào rơi vào khe nước hay sình |
| L3 | Khu rèn luyện: 3 bù nhìn vỡ khi chém; bù nhìn giáo gạt đòn ngang + gợi ý, vỡ khi bổ từ cọc; chặn đường theo Q2 |
| L4 | Từng loại: giáo dài gạt đòn ngang, bổ trúng; cung thủ đứng đúng mặt cành, bắn chéo xuống; chông ẩn bật; rắn lao ra từ bụi cỏ, bụi cỏ che rắn; cá sấu: mắt ở mặt nước lúc `warn`, chồm đớp, chỉ chém được lúc ngoi; thuyền thổi tù và gọi 2 lính; sình lún 3 s; khói 2 làn trúng/né đúng |
| L5 | Đòn bổ dùng strip thật: 4 ô, ô 2 kiếm dựng lên, giữ ô 4 tới khi chạm đất/trúng; nam + nữ |
| L6 | Mini-boss chunk 11: chém ngang bị gạt, bổ 6 lần hạ, rơi sách; 2 lính hộ tống; thiếu sách hoặc chưa hạ → cổng đóng; đủ → cổng mở, qua đích → "Sang Màn 2" |
| L7 | TQP chờ ở chunk 1, thoại đúng nguyên văn đã duyệt, chân dung hiện, mờ dần sau khi nói |
| L8 | 4 câu không trùng; nhặt đủ 5 sách; nghỉ chân hồi 1 máu một lần |
| L9 | Màn 2–3 khung vẫn chạy; `?layout=engine` chạy bằng asset thật; thẻ trang chủ mở đúng theo Q4 |
| L10 | Chơi tay hết màn ít nhất 1 lần, ghi thời gian; chỉnh số nếu quá dễ/khó |
| L11 | `pytest tests` PASS; `/verify-ui` desktop + điện thoại ngang; hồi quy (nếu sửa engine/manifest chung): màn 1 của chương 1–3, `?layout=engine` chương 2–3, `?viewer=1` thấy `plunge` |

## 7. CÂU HỎI CẦN CHỐT

| # | Câu hỏi | Đề xuất |
|---|---|---|
| Q1 | Thông báo đầu màn + 2 câu TQP dẫn màn (TQP-00 §5) vẫn là nháp. Duyệt luôn nguyên văn, hay để `TODO_MISSING` (NPC nói câu tạm) chờ team? | **Duyệt nguyên văn §5** — thoại ngắn, không có dữ kiện mới ngoài câu hỏi Excel |
| Q2 | Khu rèn luyện chặn đường thế nào? | **Mở rộng E6**: NPC khoá theo **số bù nhìn đã vỡ** (`requires: { hazards: 4 }`) — đặt TQP lần 2 ở cuối chunk 2 làm "cổng", nói 1 câu kỹ thuật "Đã luyện xong, lên đường!". Phương án khác: không chặn, bài tập tự chọn |
| Q3 | Bỏ bài "lướt qua khe thấp" (không có asset)? | **Bỏ** — lướt đã dạy ở chương 1; khói chướng khí ở đầm dạy lại lướt xuyên |
| Q4 | Mở thẻ chương 4 trên trang chủ ngay ở task này (khoá tới khi qua chương 3)? | **Có** — đã có asset thật màn 1 |
| Q5 | Thứ tự vùng §2 và cách chia sách (4 cố định + 1 từ đội trưởng)? | **Duyệt** |

## 8. GATE
1. Engine chỉ sửa theo §1.1 + Q2; không sửa file chương 1–3; manifest chung chỉ thêm `plunge`; số mới ghi `DESIGN_BASELINE`.
2. Test L1–L11 có số đo; FAIL hoặc sửa ngoài phạm vi → `BLOCKED`.
3. Report `/task-report`; chỉ commit khi người dùng yêu cầu. Sau đó: `TQP_ART_02` (prompt Codex màn 2) + TQP-L2.
