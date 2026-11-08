# SỬ TA — CHƯƠNG 5: MAI HẮC ĐẾ
# TASK CARD: MHD-L1 — MÀN 1 "GÁNH CỐNG HOAN CHÂU" (BỐ CỤC THẬT + ASSET MHD_ART_01)

TASK_ID: MHD-L1 • Version 1.0 • 08/11/2026 • **ĐÃ DUYỆT 08/11/2026** (Q1–Q5 theo đề xuất) • **XONG 08/11/2026** (chơi tay OK, asset → `IN_GAME`; report [REPORT_MHD-L1.md](REPORT_MHD-L1.md))
Task card tổng: [SUTA_MHD_TASK_00.md](SUTA_MHD_TASK_00.md) (§3.1, §5) • Asset: `MHD_ART_01` (Gate A1 + A2 đã PASS, kết quả soát tóm tắt trong [REPORT_MHD-L1.md](REPORT_MHD-L1.md); prompt đã xoá)
Mẫu: màn 1 Triệu Việt Vương ([archive/SUTA_TQP_TASK_L1_01.md](archive/SUTA_TQP_TASK_L1_01.md), `js/levels/trieu-quang-phuc/level1.js`: nhóm xáo theo vùng, NPC dẫn màn, mini-boss cố định, nghỉ chân, cổng đích) • Cơ chế: MHD-ENGINE (gánh nặng, xe `blocking` + `frees`, hổ `pounce`, hòm `lob` + `landAs`)
Rule: `mai-hac-de-gameplay.md`, `engine.md`, `assets-32bit.md`

---

## 0. MỤC TIÊU

Thay bố cục khung (6 chunk, asset chương 4) bằng màn 1 thật:
- **12 chunk**, 3 vùng cảnh: đường cống phẩm → đèo núi → trạm gác nhà Đường.
- **Đoạn gánh cống phẩm** ở chunk 1–2: đi chậm tới xe cống rồi đập sọt.
- **Cứu dân phu**: 5 xe cống, mỗi xe thả 1 dân phu, ghi `rescued` (0–5).
- **7 loại chướng ngại** theo MHD-00 §3.1 cộng **mini-boss quan thu thuế** ném hòm rỗng.
- 5 Quyển Sách Tinh Hoa, 4 bia câu hỏi, 1 điểm nghỉ chân; **Mai Thúc Loan dẫn màn**.

Chép asset `MHD_ART_01` sang bản chạy, chuyển cả chương 5 sang manifest riêng, chơi thử, chỉnh số, rồi đổi status → `IN_GAME`.

**Không làm:** nội dung màn 2–3 (chỉ đổi sprite tạm, §5), hũ dầu (dùng ở màn 3), kỹ năng, boss, nhạc riêng.

## 1. ASSET

Chép từ vùng Codex sang bản chạy, **giữ cấu trúc thư mục**. Chỉ chép file manifest tham chiếu, không chép `raw/`, `meta/`, `preview/`, `frames/`, `concept/`, `*.prompt.txt`:

| Nguồn | Đích | Số lượng |
|---|---|---|
| `assets/sprites-32bit/mai-hac-de/` + `manifest_mhd.json` | `frontend/static/assets/images/mai-hac-de/sprites-32bit/` | 19 ID, 46 strip (9 ID mới, `EN_TIGER` thêm 2 strip, 9 ID chép nguyên) |
| `assets/maps-32bit/mai-hac-de/` + `maps_mhd.json` | `frontend/static/assets/images/mai-hac-de/maps-32bit/` | 3 nền + 4 prop |
| `assets/sprites-32bit/player/PLAYER_{MALE,FEMALE}/player_*_burden_{idle,run}.png` | `images/shared/sprites-32bit/player/…` | 4 strip |

- `manifest_shared.json`: thêm `burden_idle` (6@9) và `burden_run` (8@12), `frame_w` 80, vào `PLAYER_MALE`/`PLAYER_FEMALE`. Chép nguyên mục từ `manifest_tt.json` nguồn. Không đổi animation khác. Đây là chỗ sửa manifest chung duy nhất.
- `engine/config.js` `PLAYER_ANIMATIONS.burdenIdle/burdenRun`: giữ `fallback` (chương khác không có strip này cũng không sao).
- `config.js` chương 5:
  - `SPRITE_ROOT`/`MAP_ROOT` trỏ `images/mai-hac-de/`, manifest `manifest_mhd.json`/`maps_mhd.json`;
  - `BORROWED_MAPS` mượn: chương 1 (`BG_TT_SKY_DAY`, 2 tileset, `PROP_TT_QUIZ_STELE`), chương 2 (`ITEM_BT_TINH_HOA`), chương 3 (`BG_LND_FAR_MIDLANDS`). Bỏ `BG_TT_MID_VILLAGE`, `BG_LND_MID_CHU_DIEN`.
- Hitbox Claude tự khai báo (pixel logic, từ số đo report Codex — `DESIGN_BASELINE`):

| Thực thể | Asset | Khai báo |
|---|---|---|
| Mai Thúc Loan | `NPC_MAI_THUC_LOAN` + `PORTRAIT_MAI_THUC_LOAN` | `guide` đầu màn, như Triệu Quang Phục chương 4 |
| Lính áp giải | `EN_TANG_ESCORT` | `guard` 22×34. Đầu roi ô 4 cách pivot 46,75, cao 15,4 → `attackReach` ~36 ngoài mép, `attackBoxY` 12, `attackBoxH` 8. Nhanh hơn lính chương 4: `speed` 34, `aggroRange` 150 |
| Cung thủ núp bụi | `EN_TANG_ARCHER` + `PJ_CROSSBOW_BOLT`, bụi `PROP_MHD_BUSH_COVER` | thrower đứng đất, điểm phóng +11; 25,5. Bụi vẽ **sau người chơi** (`hooks.draw.afterPlayer`) như bụi cỏ chương 4 |
| Lính ném lao trên tháp | `EN_TANG_JAVELIN` + `PJ_SPEAR`, tháp `PROP_LUONG_WATCHTOWER` | thrower `aim` đứng cao (mép sàn hàng ảnh 80 → cao 92 logic), điểm phóng +13,75; 18,75. Tháp vẽ qua `hooks.draw.beforeEnemies` |
| Kỵ binh | `EN_TANG_CAVALRY` | `roller` nhanh, hộp thân ngựa ~64×34 (DESIGN_BASELINE), có báo trước (§3) — **xem Q2** |
| Đá lăn | `OB_BOULDER` | `roller` 18×18 như chương 3 |
| Hổ vồ | `EN_TIGER` + `PROP_MHD_CAVE_MOUTH` | `pounce` 48×24; `warn` → `warn`, `leap` → `pounce`, `recover` → `idle`. Cửa hang là hazard `prop` chỉ vẽ, đặt trước hổ để vẽ phía sau |
| Xe cống | `OB_TRIBUTE_CART` | hazard `prop` 48×38, `blocking`, `hp` 2, `frees: 1`; `death` → `break`. Đứng yên: **xem Q3** |
| Dân phu | `NPC_MHD_PORTER` | `RESCUE.runner` (đã có, 16×32, `run`) |
| Quan thu thuế | `EN_TANG_TAX_OFFICIAL` | `patrol` mini-boss ~30×44, `throw` → `throw`; điểm buông hòm +20,75; 33,25 |
| Hòm rỗng nằm lại | `OB_MHD_EMPTY_CHEST`; hòm bay `PJ_SILVER_CHEST` | `landAs` hazard 18×16 (ảnh rộng 17, chốt Gate A2), `blocking`, `hp` 1; `break` khi vỡ |
| Cổng trạm gác (đích) | `PROP_MHD_CHECKPOINT_GATE` / `_OPEN` | `FINISH_GATE`, mở khi đủ 5 sách + hạ quan thu thuế |

### 1.1 Sửa nhỏ engine
- **Khung đứng yên cho hazard**: thêm trường tuỳ chọn `holdFrame` vào sprite hazard (giống `holdFrame` đã có ở `render/player.js`). Xe cống đứng yên dùng ô 1 của `roll`, không cho bánh xe quay. Mặc định không có trường này, chương khác không đổi. Chỉ làm nếu Q3 chọn xe đứng yên.
- Không thêm cơ chế khác.

## 2. BỐ CỤC (DESIGN_BASELINE)

| Chunk | Vùng (lớp giữa) | Ghi chú |
|---|---|---|
| 1–2 | đường cống phẩm (`BG_MHD_MID_TRIBUTE_ROAD`) | đoạn gánh cố định §2.1, không chướng ngại xáo |
| 3–4 | đường cống phẩm | |
| 5–9 | đèo núi (`BG_MHD_MID_MOUNTAIN_PASS`) | đá lăn, hổ, tháp lao; nghỉ chân đầu chunk 7 |
| 10–12 | trạm gác (`BG_MHD_MID_TANG_CHECKPOINT`) | **mini-boss chunk 11**; cổng trạm = đích `worldX(12, 618)` |

- Trời `BG_TT_SKY_DAY`, đồi xa `BG_LND_FAR_MIDLANDS` cả màn. Dài 12 × 768 = **9216 px**.
- 4 bia câu hỏi ở chunk 3, 5, 8, 10, rút 4 câu không trùng từ `LEVEL1_QUESTION_POOL` (35 câu).

### 2.1 Đoạn gánh cống phẩm (chunk 1–2, cố định)
1. Vào màn: người chơi gánh sọt (`LEVEL.burden`), đi chậm ×0,6, nhảy thấp, không lướt.
2. Mai Thúc Loan đứng ở chunk 1, nói thoại dẫn màn (§4).
3. Câu hướng dẫn phím hiện 1 lần (như `TRAINING.tips` chương 4): "Đang gánh nặng, chỉ đi và nhảy được." (đầu chunk 1), "Tới xe cống, bấm Đánh để đập sọt!" (gần xe).
4. **Xe cống đầu tiên** cuối chunk 2: đứng trong 60 px bấm Đánh → hết gánh (`hooks.onBurdenAttack`), có đủ thao tác. Xe này có `frees: 1`: phá xe thì dân phu đầu tiên chạy thoát.
5. 1 lính áp giải đứng **sau** xe (phía phải): người chơi chỉ gặp nó khi đã hết gánh, nên không bị đánh lúc đang gánh.

Không làm lính quất roi "thúc" người gánh: đang gánh không đánh trả được, bị quất sẽ chỉ mất máu oan.

## 3. CHƯỚNG NGẠI — NHÓM XÁO + CỐ ĐỊNH + MINI-BOSS

Mỗi lượt xáo các nhóm vào chunk 3–10 trong **vùng được phép** (lệch ±60 px):

| # | Nhóm | Cơ chế | Vùng | Số DESIGN_BASELINE |
|---|---|---|---|---|
| 1–3 | Lính áp giải (×3) | `guard` | 3–10 | hp 2 |
| 4–5 | Xe cống giữ dân phu (×2) + 1 lính áp giải canh | `prop` `blocking` `frees: 1` | 3–4, 10 | hp 2 |
| 6 | Cung thủ núp bụi | thrower theo chu kỳ, đứng đất | 3–9 | bắn mỗi 2,2 s, tầm 260 |
| 7 | Lính ném lao trên tháp | thrower `aim` cao 92 | 5–10 | ném mỗi 2,4 s, tầm 260; không với tới |
| 8 | Đá lăn | `roller` | đèo 5–9 | 140 px/s, lăn khi người chơi cách 320; chém vỡ |
| 9 | Hổ vồ từ hang | `pounce` + cửa hang | đèo 5–9 | như layout thử: hp 3, `triggerRange` 220, vồ cao 70, xa 200 |
| 10 | Kỵ binh phi ngang | `roller` nhanh | 3–4, 10 | 300 px/s, báo trước 1 s (bụi + tiếng vó); hp 2 |
| 11 | Xe cống chở sách (×2) | `prop` `frees: 1` + sách `carrier` | cố định chunk 6, 9 | hp 2 |
| 12 | **Mini-boss quan thu thuế** | `patrol` + `lob` hòm rỗng | **cố định chunk 11** | hp 6, đi 30 px/s, ném mỗi 2,2 s, tầm 240, tối đa 3 hòm nằm; 2 lính áp giải hộ tống; chết rơi 1 sách |

- **5 xe = 5 dân phu**: xe đập sọt chunk 2, 2 xe xáo, 2 xe chở sách. Đập đủ 5 thì `rescued` = 5.
- Sách: 2 cố định (chunk 4, 8, trên cao vừa nhảy) + 2 từ xe chở sách + 1 từ quan thu thuế = 5.
- Nghỉ chân hồi 1 máu (một lần) ở chunk 7.
- Kiểm bố cục bằng `checkTerrainFootprints`, `checkNpcClearance`.

## 4. NỘI DUNG CHỮ

- Thông báo đầu màn (MHD-00 §5.1) + 2 câu Mai Thúc Loan dẫn màn (§5.2): **đang là nháp chờ team duyệt** — **xem Q1**. Chép nguyên văn vào `dialogue-data.js` (`STORY_MHD_INTRO`), chân dung `PORTRAIT_MAI_THUC_LOAN`.
- Câu hướng dẫn phím (§2.1) và câu thông báo trúng/hạ (lính áp giải, cung thủ, lao, kỵ binh, đá lăn, hổ, xe, hòm, quan thu thuế, cứu dân phu): câu ngắn kiểu chương 4, không có nội dung lịch sử.

## 5. FILE

| Loại | File |
|---|---|
| Tạo (chép asset) | `frontend/static/assets/images/mai-hac-de/{sprites,maps}-32bit/**`; 4 strip gánh ở `images/shared/sprites-32bit/player/` |
| Sửa | `images/shared/sprites-32bit/manifest_shared.json` (thêm `burden_idle`, `burden_run`) |
| Sửa | `js/levels/mai-hac-de/{config,level1,chapter,dialogue-data}.js` |
| Sửa | `level2.js`, `level3.js`: đổi sprite tạm `EN_LUONG_PATROL` → `EN_TANG_ESCORT`, bỏ hố chông (không còn trong manifest chương 5), nền màn 3 tạm → `BG_MHD_MID_TANG_CHECKPOINT` |
| Tạo | `js/levels/mai-hac-de/render-extras.js` (tháp canh trước lính, bụi cây sau người chơi — `hooks.draw`) |
| Sửa engine (§1.1, theo Q3) | `js/engine/render/entities.js` (`holdFrame` hazard), `engine/chapter.js` (ghi hợp đồng) |
| Sửa | `templates/components/home/{timeline,chapter}.html` — mở thẻ chương 5 `data-unlock-after="4"` (**xem Q4**) |
| Sửa (sau chơi thử) | status `NORMALIZED` → `IN_GAME` ở `manifest_mhd.json` / `maps_mhd.json` / `manifest_tt.json` (bản nguồn rồi chép lại) |
| Sửa tài liệu | `.claude/rules/{mai-hac-de-gameplay,assets-32bit,engine}.md`, `docs/SUTA_MHD_TASK_00.md` §2, `docs/REPORT_MHD-L1.md` (mới); xoá `docs/CODEX_PROMPT_MHD_ART_01.md` khi xong (kết quả soát tóm tắt trong report) |
| Chỉ đọc | `js/levels/trieu-quang-phuc/{level1,config,render-extras}.js` (mẫu, không import), `js/engine/*` |

Giữ layout thử `?layout=engine`, chuyển sang asset thật (bỏ hộp dự phòng). Móc thật thay `ENGINE_TEST_HOOKS` trong `chapter.js`, móc layout thử vẫn chạy khi `?layout=engine`.

## 6. TEST

| # | Test |
|---|---|
| L1 | Màn dài 9216 px, 3 vùng đúng chunk; console sạch (trừ 401 khách); không ảnh nào vẽ hộp tạm; hết cảnh báo "stage khác" |
| L2 | Đúng số nhóm §3; 10 lượt tải lại: chunk 1–2 không có nhóm xáo, đá lăn/hổ luôn ở đèo, không nhóm nào chồng nhau |
| L3 | Đoạn gánh: strip `burden_idle`/`burden_run` thật cả nam lẫn nữ; tốc độ ×0,6; ô Lướt mờ; Đánh xa xe chỉ hiện gợi ý; gần xe thì hết gánh, xe vỡ, 1 dân phu chạy thoát |
| L4 | Từng loại: roi lính áp giải trúng đúng tầm; cung thủ bị bụi che nửa dưới, bắn đúng điểm phóng; lính ném lao đứng đúng mép sàn tháp; đá lăn chém vỡ được; hổ `warn` ở miệng hang, vồ vòng cung, chỉ chém được lúc nghỉ; kỵ binh báo trước rồi phi qua, né theo Q2 |
| L5 | Cứu dân phu: phá 5 xe → `rescued` 5; qua màn → `suta.mhd.progress.rescued` = 5; phá ít hơn thì ghi đúng số |
| L6 | Mini-boss chunk 11: ném hòm nằm lại chắn đường (tối đa 3), chém vỡ hòm; hạ quan rơi sách; 2 lính hộ tống; thiếu sách hoặc chưa hạ → cổng đóng; đủ → cổng mở, qua đích → "Sang Màn 2" |
| L7 | Mai Thúc Loan chờ ở chunk 1, thoại đúng nguyên văn đã duyệt, chân dung hiện, mờ dần sau khi nói |
| L8 | 4 câu không trùng; nhặt đủ 5 sách; nghỉ chân hồi 1 máu một lần |
| L9 | Màn 2–3 khung vẫn chạy bằng sprite mới; `?layout=engine` chạy bằng asset thật; thẻ trang chủ mở đúng theo Q4 |
| L10 | Chơi tay hết màn ít nhất 1 lần, ghi thời gian; chỉnh số nếu quá dễ/khó |
| L11 | `pytest tests` PASS; `/verify-ui` desktop + điện thoại ngang; hồi quy (sửa engine + manifest chung): màn 1 của chương 1–4, `?layout=engine` chương 2–4, `?viewer=1` thấy `burden_idle`/`burden_run` |

## 7. CÂU HỎI CẦN CHỐT

| # | Câu hỏi | Đề xuất |
|---|---|---|
| Q1 | Thông báo đầu màn (MHD-00 §5.1) + 2 câu Mai Thúc Loan dẫn màn (§5.2) vẫn là nháp. Duyệt luôn nguyên văn, hay để `TODO_MISSING` (NPC nói câu tạm) chờ team? | **Duyệt nguyên văn** — thoại ngắn, không có dữ kiện mới ngoài bộ câu hỏi |
| Q2 | MHD-00 ghi kỵ binh "hitbox cao quá tầm nhảy → buộc lướt". Nhảy cao tối đa ~83 px logic, ngựa chỉ cao ~40, nên muốn buộc lướt phải dùng hộp va chạm vô hình cao gấp đôi ngựa. Làm sao? | **Cho né bằng nhảy hoặc lướt**, hộp theo thân ngựa, báo trước 1 s. Phương án khác: hộp cao 90 để buộc lướt (trông như bị đâm khi đã nhảy qua đầu ngựa) |
| Q3 | Xe cống đứng yên chờ phá hay xe chạy? Strip `roll` có bánh quay, chương 1–3 dùng xe lăn tới người chơi | **Đứng yên**, thêm `holdFrame` (§1.1) để bánh không quay. Phương án khác: xe lăn chậm về phía người chơi, không cần sửa engine |
| Q4 | Mở thẻ chương 5 trên trang chủ ngay ở task này (khoá tới khi qua chương 4)? | **Có** — MHD-00 đã định mở ở MHD-L1 |
| Q5 | Bố cục §2–3: 3 vùng, 5 xe = 5 dân phu, sách 2 cố định + 2 xe + 1 quan thu thuế? | **Duyệt** |

## 8. GATE
1. Engine chỉ sửa theo §1.1; không sửa file chương 1–4; manifest chung chỉ thêm 2 animation gánh; số mới ghi `DESIGN_BASELINE`.
2. Test L1–L11 có số đo; FAIL hoặc sửa ngoài phạm vi → `BLOCKED`.
3. Report `/task-report`; chỉ commit khi người dùng yêu cầu. Sau đó: `MHD_ART_02` (prompt Codex màn 2) + MHD-L2 (cần team cho nguồn Thúc Bảo).
