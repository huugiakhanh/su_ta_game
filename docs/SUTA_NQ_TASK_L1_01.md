# SỬ TA — CHƯƠNG 7: NGÔ QUYỀN
# TASK CARD: NQ-L1 — MÀN 1 "HÀNH QUÂN RA BẮC" (BỐ CỤC THẬT)

TASK_ID: NQ-L1 • Version 1.0 • 11/11/2026 • **ĐÃ DUYỆT 12/11/2026** (Q1–Q4 theo đề xuất) • Xong 12/11 (người dùng chơi thử ổn); report [REPORT_NQ-L1.md](REPORT_NQ-L1.md)
Task card tổng: [SUTA_NQ_TASK_00.md](SUTA_NQ_TASK_00.md) (§3.1, §5.1) • Asset: `NQ_ART_01` (Gate A1 + A2 duyệt 11/11/2026; prompt + 2 bản FIX đã xoá, kết quả soát trong report)
Mẫu: màn 1 Phùng Hưng ([SUTA_PH_TASK_L1_01.md](SUTA_PH_TASK_L1_01.md), `js/levels/phung-hung/level1.js`), đội trưởng giáo dài + cá sấu + cung thủ trên cao chương 4 (`trieu-quang-phuc/`), lao ném PH (`CARRY`, `hooks.dropCarry`) • Cơ chế: NQ-ENGINE E1 (thuyền), E3 (gió), E4 (xoáy)
Rule: `ngo-quyen-gameplay.md`, `engine.md`, `assets-32bit.md`, `history-content.md`

---

## 0. MỤC TIÊU

Thay khung 6 chunk bằng màn 1 thật:
- **12 chunk**, 3 vùng cảnh: bến sông Ái Châu → đường ra Bắc → ngoài thành Đại La.
- **Dạy lái thuyền** ở bến; sau đó xoáy nước, cá sấu, gió ngược, lính giáo, cung thủ trên ụ thành.
- **Ngô Quyền dẫn màn**; **mini-boss Kiều Công Tiễn** trước cổng Đại La, cổng là đích.
- 5 Quyển Sách Tinh Hoa, 4 bia câu hỏi, 1 điểm nghỉ chân; lính rơi **lao ném**.
- Chuyển chương 7 sang **asset riêng** `images/ngo-quyen/`; mở thẻ chương 7 trên trang chủ.

**Không làm:** màn 2–3, thủy triều (màn 1 không có triều), cọc, Nam Hán, nhạc riêng. **Không sửa engine** (mục 1.2).

## 1. ASSET

### 1.1 Chép sang bản chạy
- `assets/sprites-32bit/ngo-quyen/` → `frontend/static/assets/images/ngo-quyen/sprites-32bit/` (`manifest_nq.json` + ảnh, giữ cấu trúc), status → `IN_GAME` ở bản nguồn rồi chép.
- `assets/maps-32bit/ngo-quyen/` → `images/ngo-quyen/maps-32bit/` (`maps_nq.json` + `bg/`, `props/`).
- Strip `row` của `PLAYER_MALE`/`PLAYER_FEMALE` → `images/shared/sprites-32bit/` + thêm 2 mục `row` vào `manifest_shared.json` (cách đã làm với `burden_*`, `ride`, `push`).
- `config.js`: `SPRITE_ROOT`/`MAP_ROOT` trỏ `images/ngo-quyen/`; bỏ mọi tham chiếu `images/phung-hung/`. `BORROWED_MAPS` thêm `PROP_LND_RIVER_WATER` (chương 3).

### 1.2 Engine
Không sửa `js/engine/`. Cần gì thêm thì **dừng và báo**. Thuyền: đổi `HAZARD_SPRITES.boat.anims.move` từ `'row'` sang `'move'` (tên animation thật của `OB_NQ_BOAT`).

### 1.3 Hitbox (DESIGN_BASELINE, đo lại khi làm từ report Codex)

| Thực thể | Asset | Khai báo |
|---|---|---|
| Ngô Quyền | `NPC_NGO_QUYEN` + `PORTRAIT_NGO_QUYEN` | `guide` đầu màn (như `phungHung`), `PORTRAITS` |
| Lính giáo dài | `EN_NQ_KCT_SPEARMAN` | thay `EN_PH_TANG_SPEARMAN`: `guard` 22×34, `attackReach` ~34 (mũi giáo ô 4 cách pivot 44,5 → 33,5 ngoài mép), `attackBoxY` ~10 |
| Cung thủ trên ụ | `EN_NQ_KCT_ARCHER` + `PJ_CROSSBOW_BOLT`, ụ `PROP_NQ_RAMPART` | mẫu `treeArcher` + `archerTree` chương 4: ụ là hazard `prop` đặt trước, cung thủ `thrower aim` đứng ở `top_y` 8 (mặt ụ cao 56 trên đất), bắn mỗi 2,2 s, tầm 240; điểm phóng đo từ ô 5 |
| Mini-boss | `EN_KIEU_CONG_TIEN` + `PORTRAIT_KIEU_CONG_TIEN` | mẫu `captain` chương 4: `boss: true` + `behavior: 'guard'`, 30×44, `attackReach` ~45 (mũi thương 60 từ pivot), hp 8, `blocked` (**xem Q1**) |
| Thuyền | `OB_NQ_BOAT` | đã khai báo ở NQ-ENGINE (64×16, boong `ride.top` 4, `BOAT_FLOAT` 14) |
| Xoáy nước | `FX_NQ_WHIRLPOOL` | đã khai báo (`radius` 64, `core` 10, `pull` 70) |
| Gió + đá nấp | `FX_NQ_GUST`, `OB_NQ_WIND_ROCK` | đã khai báo (gió 256×90, lực 120; đá 28×36) |
| Cá sấu | `EN_CROCODILE` | chép khai báo `crocodile` chương 4 (46×20, `lurker`) |
| Đá lăn | `OB_BOULDER` | `roller` từ dốc (mẫu chương 3/5), thay đá ong mượn |
| Lao ném | `PJ_SPEAR` | `CARRY.javelin` (mẫu đuốc PH): lính giáo hạ thì rơi 1 lao (`hooks.dropCarry`), ném vòng cung tầm 140, sát thương 1 |
| Bình máu | `ITEM_LND_HEAL` | giữ |
| Cổng Đại La (đích) | `PROP_NQ_DAI_LA_GATE` / `_OPEN` | `FINISH_GATE` tại `worldX(12, 618)`, `MAP_PROPS_IN_GAME` |

## 2. BỐ CỤC (DESIGN_BASELINE)

Dài 12 × 768 = **9216 px**, khớp `stage_length` của `maps_nq.json`. Trời `BG_TT_SKY_DAY`, đồi xa `BG_LND_FAR_MIDLANDS`.

| Chunk | Vùng (lớp giữa) | Bài học cố định | Sách / bia |
|---|---|---|---|
| 1 | Ái Châu (`BG_NQ_MID_AI_CHAU_RIVER`) | Ngô Quyền dẫn màn; **khe sông 1 (256 px) + thuyền** ở bến: câu nhắc cách lái | |
| 2 | Ái Châu | **khe sông 2 (448 px)**: thuyền, giữa sông có 1 sách treo cao phải nhảy từ thuyền | sách; bia 1 |
| 3 | Ái Châu | **khe sông 3 + xoáy nước** giữa dòng, phải lái men mép | |
| 4 | đường ra Bắc (`BG_NQ_MID_NORTH_ROAD`) | nhóm xáo | bia 2 |
| 5 | đường ra Bắc | **khe sông 4 + cá sấu** ngoi đớp người trên thuyền | sách |
| 6 | đường ra Bắc | **2 vùng gió lệch nhịp + 2 đá nấp** | |
| 7 | đường ra Bắc | nhóm xáo; nghỉ chân đầu chunk, hồi 1 máu một lần | sách; bia 3 |
| 8 | đường ra Bắc | **dốc đá lăn** (đá lăn tới từ phải, nhảy/lướt qua) | |
| 9 | ngoài Đại La (`BG_NQ_MID_DAI_LA_OUTSKIRTS`) | **2 lính giáo chốt chặn** — hạ thì rơi lao, câu nhắc ném lao | |
| 10 | ngoài Đại La | **2 ụ thành + 2 cung thủ**: ném lao hạ, hoặc nhảy lên ụ (**xem Q2**) | sách từ cung thủ thứ 2; bia 4 |
| 11–12 | ngoài Đại La | **Kiều Công Tiễn + 2 lính hộ vệ**, câu thoại khi gặp; cổng = đích | sách thứ 5 do Kiều Công Tiễn giữ |

Khe sông dùng cột `'~'` của terrain (đã có), mặt nước `PROP_LND_RIVER_WATER`. Khe 2–4 rộng hơn tầm nhảy + lướt nên **phải đi thuyền** (**xem Q3**). Mỗi khe có 1 thuyền ở mép trái; rơi xuống nước thì −1 máu về chỗ đứng vững (engine).

`QUIZ.level1Spots` đổi sang chunk 2, 4, 7, 10; rút 4 câu không trùng từ `LEVEL1_QUESTION_POOL` (35 câu).

### 2.1 Nhóm xáo
Mỗi lượt xáo vào các ô của chunk 4, 7 (lệch ±60 px), mẫu `placeGroups` chương 6: **3 lính giáo** (mọi ô xáo) + **1 vùng gió + đá nấp** (chunk 4 hoặc 7). Kiểm bằng `checkTerrainFootprints`.

## 3. CƠ CHẾ RIÊNG MÀN

### 3.1 Dạy lái thuyền (chunk 1)
Tới gần thuyền 1: câu nhắc. Khe 1 hẹp (256 px), nhảy + lướt cũng qua được, để người chơi thử thuyền mà không bị kẹt.

### 3.2 Lao ném (chunk 9–12)
- Mỗi lính giáo hạ rơi 1 lao nằm 12 s (`pickup.life`). Chạm để nhặt; bấm Đánh để ném vòng cung (`CHAPTER.carry`, như đuốc PH).
- Lao trúng cung thủ / lính / Kiều Công Tiễn: −1 máu. Đang cầm lao không chém được (luật engine `carry`).

### 3.3 Kiều Công Tiễn (chunk 11–12)
- Đứng chặn ở `[12, 300]`, 2 lính hộ vệ đứng trước. Tới gần: khung thoại 1 câu (§4) với chân dung.
- `boss: true` → cổng khoá tới khi hạ (`bossBlocksFinish`). Hết máu thì rơi sách thứ 5 (`carrier`).
- Cách hạ: **xem Q1**.

## 4. NỘI DUNG CHỮ

Chép **nguyên văn** NQ-00 §5.1 đã duyệt:
- Thông báo đầu màn: đã có trong `chapter.js`, giữ.
- 2 câu Ngô Quyền ("Ta là Ngô Quyền, người Đường Lâm…", "Đường ra Bắc nhiều sông nước…") → `STORY_NQ_INTRO` trong `dialogue-data.js`, chân dung `PORTRAIT_NGO_QUYEN`.
- Câu Kiều Công Tiễn ("Ngô Quyền! Quân Nam Hán sắp tới, ngươi chẳng làm gì được ta!") → `STORY_NQ_KCT`, chân dung `PORTRAIT_KIEU_CONG_TIEN`.

Câu hướng dẫn (không có nội dung lịch sử):

| Khi | Câu |
|---|---|
| Tới thuyền 1 | "Đứng lên thuyền, bấm ←/→ để chèo. Nhảy lên bờ khi tới nơi." |
| Tới xoáy nước | "Xoáy nước! Chèo men theo mép, đừng để thuyền bị cuốn." |
| Tới cá sấu | "Cá sấu ẩn dưới nước — thấy bọt thì nhảy lên!" |
| Tới vùng gió | `gustWarn` (đã có) |
| Tới đá lăn | "Đá lăn xuống dốc! Nhảy hoặc lướt qua." |
| Nhặt lao | "Đã nhặt lao. Bấm Đánh để ném." |
| Tới ụ thành | "Cung thủ trên ụ thành! Ném lao để hạ." |
| Cổng còn khoá | `bossBlocksFinish` → "Hãy hạ Kiều Công Tiễn trước." |

## 5. TRANG CHỦ

`templates/components/home/{timeline,chapter}.html`: thẻ chương 7 (Năm 938, Ngô Quyền) thêm `data-unlock-after="6"`, `data-hero`, `data-route="/gameplay/levels/ngo-quyen"`, bỏ ghi chú NQ-SKELETON. Theo cách thẻ chương 6 đang làm.

## 6. FILE

| Loại | File |
|---|---|
| Sửa | `js/levels/ngo-quyen/{config,level1,chapter,dialogue-data}.js` |
| Tạo (chép) | `frontend/static/assets/images/ngo-quyen/{sprites,maps}-32bit/**` |
| Sửa | `images/shared/sprites-32bit/manifest_shared.json` + 2 strip `row` |
| Sửa nguồn | `assets/sprites-32bit/ngo-quyen/manifest_nq.json`, `assets/maps-32bit/ngo-quyen/maps_nq.json`, `assets/sprites-32bit/manifest_tt.json`: chỉ `status` → `IN_GAME` |
| Sửa | `templates/components/home/{timeline,chapter}.html` |
| Sửa tài liệu | `.claude/rules/{ngo-quyen-gameplay,assets-32bit}.md`, `docs/SUTA_NQ_TASK_00.md` §2, `docs/REPORT_NQ-L1.md` (mới); xoá 3 prompt `CODEX_PROMPT_NQ_ART_01*.md` khi xong |
| Chỉ đọc | `js/levels/{phung-hung,trieu-quang-phuc,ly-nam-de}/*` (mẫu, không import), `js/engine/*` |

Giữ layout thử `?layout=engine` (nay vẽ bằng asset thật cho thuyền, xoáy, gió, đá). Sửa template nên phải khởi động lại server khi kiểm.

## 7. TEST

| # | Test |
|---|---|
| L1 | Màn dài 9216 px, 3 vùng đúng chunk; console sạch (trừ 401 khách); hết cảnh báo lệch `stage_length`; không request nào tới `images/phung-hung/`; không ảnh nào vẽ hộp tạm |
| L2 | Nhóm xáo đúng số, đúng vùng; 10 lần tải lại không chồng nhau, không rơi vào khe sông |
| L3 | Ngô Quyền ở chunk 1, đúng 2 câu nguyên văn (đối chiếu bằng script), chân dung hiện |
| L4 | Thuyền: lên, chèo (strip `row` chạy khi thuyền đi, `idle` khi đứng), cập bờ; khe 2–4 không qua được bằng nhảy + lướt; sách giữa sông lấy được từ thuyền |
| L5 | Xoáy: lái men mép qua được; lọt lõi −1 máu, về chỗ đứng, thuyền về chỗ cũ |
| L6 | Cá sấu: báo bọt, ngoi đớp người trên thuyền −1 máu; hạ được |
| L7 | Gió: đẩy lùi lúc active, nấp sau đá không bị đẩy; đá lăn trúng −1 máu, nhảy/lướt qua được |
| L8 | Lính giáo: tầm đâm khớp mũi giáo (đo F2); hạ thì rơi lao; ném lao trúng cung thủ hạ được, rơi sách |
| L9 | Kiều Công Tiễn: thoại hiện 1 lần; cách hạ theo Q1; rơi sách 5; còn sống thì cổng khoá; hạ xong + đủ sách thì cổng mở, sang màn 2 |
| L10 | 4 câu không trùng; nghỉ chân hồi 1 máu một lần; thẻ trang chủ khoá tới khi qua chương 6 |
| L11 | Chơi hết màn cả **nam và nữ** bằng mô phỏng; `?layout=engine`, `?viewer=1`, màn 2–3 khung vẫn chạy; chương 1–6 khói 900 frame không lỗi |
| L12 | Người dùng chơi tay ít nhất 1 lần, ghi thời gian; xem lại 3 điểm Gate A2 (mép xoáy, cung thủ bắn ngang, tường nền thấp) |
| L13 | `pytest tests` PASS; `/verify-ui` desktop + điện thoại ngang |

## 8. CÂU HỎI CẦN CHỐT

| # | Câu hỏi | Đề xuất |
|---|---|---|
| Q1 | Hạ Kiều Công Tiễn thế nào? | **Như đội trưởng chương 4** (`plungeOnly`): đòn chém ngang bị gạt (`blocked`), chỉ **đòn bổ** từ trên không và **lao ném** trúng được; hp 8. Dùng lại cơ chế đã dạy, không cần engine mới. Phương án khác: đánh thường được, hp 12 |
| Q2 | Ụ thành cao 56 px: cho người chơi nhảy lên ụ đánh cung thủ không? | **Không**, ụ chỉ để vẽ; cung thủ hạ bằng **lao ném** (lý do có lao). Đứng sát chân ụ thì tên không trúng được nên vẫn có chỗ nấp. Phương án khác: ụ là bục đứng được |
| Q3 | Khe sông 2–4 bắt buộc đi thuyền? | **Bắt buộc** (rộng 448 px, quá tầm nhảy + lướt), vì thuyền là cơ chế chính của chương. Khe 1 thì không bắt buộc |
| Q4 | Bài học cố định, chỉ xáo nhóm ở chunk 4 và 7? | **Duyệt**, vì thuyền, xoáy, cá sấu, lao cần dạy theo thứ tự |

## 9. GATE
1. Không sửa `js/engine/` và file chương 1–6; số mới ghi `DESIGN_BASELINE`.
2. Test L1–L13 có số đo; FAIL hoặc sửa ngoài phạm vi → `BLOCKED`.
3. Report `/task-report`; chỉ commit khi người dùng yêu cầu. Sau đó: `NQ_ART_02` + NQ-L2.
