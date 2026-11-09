# SỬ TA — CHƯƠNG 6: PHÙNG HƯNG
# TASK CARD: PH-L1 — MÀN 1 "TRAI TRÁNG ĐƯỜNG LÂM" (BỐ CỤC THẬT)

TASK_ID: PH-L1 • Version 1.0 • 09/11/2026 • **ĐÃ DUYỆT 09/11/2026** (Q1–Q4 theo đề xuất) • Xong phần code, chờ chơi tay; report [REPORT_PH-L1.md](REPORT_PH-L1.md)
Task card tổng: [SUTA_PH_TASK_00.md](SUTA_PH_TASK_00.md) (§3.1, §5.1) • Asset: `PH_ART_01` (Gate A1 + A2 đã `IN_GAME`, kết quả soát trong report; prompt đã xoá)
Mẫu: màn 1 Mai Hắc Đế ([SUTA_MHD_TASK_L1_01.md](SUTA_MHD_TASK_L1_01.md), `js/levels/mai-hac-de/level1.js`), cây cung thủ chương 4 (`trieu-quang-phuc/level1.js`), bẫy rơi chương 3 (`ly-nam-de/level1.js`) • Cơ chế: PH-ENGINE E1–E6
Rule: `phung-hung-gameplay.md`, `engine.md`, `assets-32bit.md`, `history-content.md`

---

## 0. MỤC TIÊU

Thay bố cục khung (6 chunk) bằng màn 1 thật:
- **12 chunk**, 3 vùng cảnh: làng Đường Lâm → đồi đá ong → ải thu thuế.
- **Đòn gồng được dạy dần**: hổ → lính khiên → trâu (PH-00 §3.1).
- Đủ 8 loại chướng ngại của PH-00 §3.1; **Phùng Hưng dẫn màn**; cổng ải là đích.
- 5 Quyển Sách Tinh Hoa, 4 bia câu hỏi, 1 điểm nghỉ chân.
- Mở thẻ chương 6 trên trang chủ.

**Không làm:** nội dung màn 2–3, Vũ Khí Thô Sơ (PH-L2), kỹ năng, boss, nhạc riêng. **Không sửa engine** (mục 1.1).

## 1. ASSET VÀ HITBOX

Ảnh đã nằm ở bản chạy, task này chỉ khai báo trong `config.js`. Số `DESIGN_BASELINE`, theo report Codex và số đo khi soát.

| Thực thể | Asset | Khai báo |
|---|---|---|
| Phùng Hưng | `NPC_PHUNG_HUNG` + `PORTRAIT_PHUNG_HUNG` | `guide` đầu màn, `PORTRAITS` |
| Lính tuần giáo | `EN_PH_TANG_SPEARMAN` | Đã khai báo: `guard` 22×34, `attackReach` 34, `attackBoxY` 10, `attackBoxH` 9 |
| Lính khiên | `EN_TANG_SHIELD_GUARD` | Đã khai báo: art `shield`, `chargeOnly`, hp 6 = 2 đòn gồng |
| Mãnh hổ | `EN_TIGER` | Đã khai báo: `pounce` 48×24, `stuckOnly`, `chargeOnly`, hp 9 = 3 đòn gồng |
| Bù nhìn | `OB_PH_SCARECROW` | Đã khai báo: `makeDecoy` 18×40, dựng lại sau 4 s |
| Trâu mộng | `EN_PH_BUFFALO` | Đã khai báo: `roller` 64×36, `tameable`, `rideTop` 27 |
| Rào gỗ | `OB_PH_FENCE` | Đã khai báo: `prop` 28×36, `blocking`, `rammable`, hp 3 |
| Xe thuế muối | `OB_PH_SALT_CART` | Đã khai báo: `prop` 46×28, `blocking`, `pushable` |
| Đá ong rơi | `OB_PH_LATERITE_ROCK` | Mới: `snare` ~24×24, `warn` 0,5 s, treo cao 90, `triggerWidth` 24; `death` → `break`, `blocking` khi nằm (§3.3), hp 1, `damage` 1, `stun` 0,4 |
| Thợ săn trên cây | `EN_PH_TANG_HUNTER` + `PJ_CROSSBOW_BOLT`, cây `PROP_TQP_ARCHER_TREE` | Mới, theo mẫu `treeArcher` chương 4: mặt cành hàng ảnh 99 → `deck` 87; thrower `aim`, bắn mỗi 2,2 s, tầm 240; `throw` → animation `throw`. Điểm phóng đo từ ô 5 khi làm. Cây là hazard `prop` đặt trước thợ săn trong danh sách để vẽ phía sau |
| Hào chông | `PROP_PH_SPIKE_TRENCH` | Đã khai báo: `tiles.spikes`, cột `'^'`, rộng 160 px |
| Cổng ải (đích) | `PROP_PH_TAX_GATE` / `_OPEN` | `FINISH_GATE` tại `worldX(12, 618)`, thêm vào `MAP_PROPS_IN_GAME` |

Khi xong, bỏ mục tạm `OB_BOULDER` khỏi `manifest_ph.json` bản chạy: bản chạy khớp bản nguồn, chương 6 không còn trỏ sprite chương 5.

### 1.1 Engine
Không sửa `js/engine/`. Cần gì thêm thì **dừng và báo**, không tự thêm. Mọi thứ riêng màn đi qua hook/`enemyKinds` có sẵn: `blockStrike`, `hooks.onPushHit`, `boss: true`, `carrier`, `level.update`.

## 2. BỐ CỤC (DESIGN_BASELINE)

Dài 12 × 768 = **9216 px**, khớp `stage_length` của `maps_ph.json`. Trời `BG_TT_SKY_DAY`, đồi xa `BG_LND_FAR_MIDLANDS` cả màn.

| Chunk | Vùng (lớp giữa) | Bài học cố định | Sách / bia |
|---|---|---|---|
| 1 | Đường Lâm | Phùng Hưng dẫn màn, 1 lính tuần cuối chunk | |
| 2 | Đường Lâm | nhóm xáo | sách cao vừa nhảy; bia 1 |
| 3–4 | Đường Lâm | **Mãnh hổ + 3 bù nhìn** (§3.1) | sách từ hổ |
| 5 | đồi đá ong (`BG_PH_MID_LATERITE_HILLS`) | **Lính khiên** + câu nhắc đòn gồng | sách từ lính khiên |
| 6 | đồi đá ong | nhóm xáo | bia 2 |
| 7 | đồi đá ong | **Trâu mộng + 3 lính + rào** (§3.2) | |
| 8 | đồi đá ong | nhóm xáo; nghỉ chân đầu chunk, hồi 1 máu một lần | sách trong 1 rào riêng hp 3 (đòn thường phá được); bia 3 |
| 9 | ải thu thuế (`BG_PH_MID_TAX_PASS`) | **Hào chông 160 px** (phải nhảy + lướt) | |
| 10 | ải thu thuế | nhóm xáo | sách cao trên đường; bia 4 |
| 11–12 | ải thu thuế | **Xe muối + 2 lính gác ải** (§3.4), cổng = đích | |

`QUIZ.level1Spots` đổi sang chunk 2, 6, 8, 10; rút 4 câu không trùng từ `LEVEL1_QUESTION_POOL` (35 câu). 5 sách = chunk 2, hổ, lính khiên, rào chunk 8, chunk 10.

### 2.1 Nhóm xáo
Mỗi lượt xáo vào 2 ô của chunk 2, 6, 8, 10, lệch ±60 px, theo mẫu `placeGroups` chương 5:

| Nhóm | Số lượng | Vùng được phép |
|---|---|---|
| Lính tuần giáo | 3 | mọi chunk xáo |
| Đá ong rơi | 2 | 6, 8 |
| Thợ săn trên cây | 2 | 2, 6, 8, 10 |

Kiểm bố cục bằng `checkTerrainFootprints`.

## 3. CƠ CHẾ RIÊNG MÀN

### 3.1 Mãnh hổ (mini-boss chunk 3–4)
- `pounce` trong `span` từ `worldX(3, 120)` tới `worldX(4, 640)`, `triggerRange` 300, hp 9, mang `boss: true` (**xem Q2**), `id` để rơi sách `carrier`.
- 3 bù nhìn ở `[3, 420]`, `[3, 660]`, `[4, 200]`. Hổ vồ trúng thì khựng 2 s, chỉ lúc đó đòn gồng mới trúng; bù nhìn dựng lại sau 4 s.
- Câu hướng dẫn hiện một lần khi tới gần: mục 4.

### 3.2 Trâu mộng (chunk 7)
- `roller` tới từ phải, `speed` −220, kích hoạt khi người chơi cách 440.
- Đòn gồng trúng thì cưỡi 5 s, húc 3 lính + rào ở phía trước.
- **Không bắt buộc** (**xem Q3**): bỏ lỡ thì trâu chạy mất; lính và rào vẫn hạ bằng đòn thường.

### 3.3 Đá ong rơi
`snare`: tới gần thì rung, bám đầu người chơi rồi rơi. Trúng thì −1 máu, choáng 0,4 s. Nằm lại chặn đường, đập vỡ được.

`blocking` chưa từng dùng với `snare`, và engine sẽ đẩy người chơi ra nếu đá rơi trúng người: phải kiểm ở L5. Lỗi thì bỏ `blocking`, đá chỉ nằm lại và vẫn đập vỡ được, rồi báo.

### 3.4 Xe muối và lính gác ải (chunk 11–12)
- Xe ở `[11, 640]`. 2 lính gác đứng yên ở `[12, 120]` và `[12, 260]`, trước cổng; đẩy khoảng 3–5 s là tới.
- Lính gác là enemy `kind: 'gateGuard'`, `boss: true`: `update` chỉ quay mặt về người chơi, `blockStrike` trả `true` nên **đòn kiếm không hạ được**, chỉ **xe húc** mới hạ (**xem Q1**).
- `blockStrike` tự hiện câu nhắc ở mục 4 (engine không có câu sẵn cho trường hợp này). Chạm thân lính gác vẫn mất máu như lính thường.
- `hooks.onPushHit`: lính `gateGuard` thì bỏ `kind` rồi hạ ngay, trả `true`; lính khác để engine xử lý.
- Cổng mở khi đủ 5 sách, đã hạ hổ và 2 lính gác (`bossAlive` + `finishGateOpen` có sẵn). Hết máu giữa chừng hoặc xe đi quá thì không bị kẹt: xe đẩy được cả hai chiều, phím `R` chơi lại.

## 4. NỘI DUNG CHỮ

Chép **nguyên văn** PH-00 đã duyệt, không viết lại:
- Thông báo đầu màn (§5.1, câu "Màn 1: Trai tráng Đường Lâm — Nửa cuối thế kỷ 8...") vào `chapter.js`.
- 2 câu Phùng Hưng (§5.1) vào `STORY_PH_INTRO` trong `dialogue-data.js`, chân dung `PORTRAIT_PHUNG_HUNG`.

Câu hướng dẫn và thông báo (không có nội dung lịch sử, viết ngắn):

| Khi | Câu |
|---|---|
| Tới gần hổ | "Đứng gần bù nhìn, đợi hổ vồ trúng rồi tung đòn gồng!" |
| Tới gần trâu | "Giữ J, thả đúng lúc để thu phục trâu mộng!" |
| Tới hào chông | "Hào quá rộng: nhảy rồi lướt để qua." |
| Tới xe muối | "Đẩy xe húc lính gác ải!" |
| Đánh lính gác bằng kiếm | "Lính gác không hề hấn. Hãy đẩy xe húc chúng!" |
| Cổng còn khoá | `bossBlocksFinish` đổi thành "Hãy hạ mãnh hổ và lính gác ải trước." |
| Trúng/hạ thợ săn, đá ong | câu ngắn kiểu chương 5 |

## 5. FILE

| Loại | File |
|---|---|
| Sửa | `js/levels/phung-hung/{config,level1,chapter,dialogue-data}.js` |
| Sửa | `images/phung-hung/sprites-32bit/manifest_ph.json` (bản chạy): bỏ mục tạm `OB_BOULDER` |
| Sửa | `templates/components/home/{timeline,chapter}.html`: thẻ chương 6 `data-unlock-after="5"`, `data-hero`, `data-route` |
| Sửa tài liệu | `.claude/rules/{phung-hung-gameplay,assets-32bit}.md`, `docs/SUTA_PH_TASK_00.md` §2, `docs/REPORT_PH-L1.md` (mới); xoá `docs/CODEX_PROMPT_PH_ART_01.md` khi xong |
| Chỉ đọc | `js/levels/{mai-hac-de,trieu-quang-phuc,ly-nam-de}/*` (mẫu, không import), `js/engine/*` |

Giữ layout thử `?layout=engine`. Sửa template nên phải khởi động lại server khi kiểm.

## 6. TEST

| # | Test |
|---|---|
| L1 | Màn dài 9216 px, 3 vùng đúng chunk; console sạch (trừ 401 khách); không ảnh nào vẽ hộp tạm; hết cảnh báo "stage khác"; không request sang `images/mai-hac-de/sprites-32bit/` |
| L2 | Đúng số nhóm §2.1; 10 lần tải lại: nhóm chỉ ở đúng vùng, không chồng nhau, không nhóm nào rơi vào chunk bài học |
| L3 | Phùng Hưng chờ ở chunk 1, đúng 2 câu nguyên văn (đối chiếu bằng script), chân dung hiện, mờ dần sau khi nói |
| L4 | Hổ: đòn thường và đòn gồng ngoài lúc khựng đều không mất máu; vồ trúng bù nhìn thì khựng 2 s; 3 đòn gồng thì chết, rơi sách; hết bù nhìn thì vồ người |
| L5 | Đá ong: báo trước, rơi trúng −1 máu + choáng; nằm lại chặn đường; đập vỡ phát `break`; rơi đè lên người chơi không kẹt |
| L6 | Thợ săn đứng đúng mặt cành, tên ra đúng điểm phóng, nhắm trúng thân; lính khiên gạt đòn thường, 2 đòn gồng thì chết, rơi sách |
| L7 | Trâu: thu phục, cưỡi 5 s, húc 3 lính + rào; bỏ lỡ thì trâu chạy mất, vẫn qua màn |
| L8 | Hào 160 px: nhảy không qua, nhảy + lướt qua; rơi −1 máu, về sát mép |
| L9 | Xe + lính gác: kiếm và đòn gồng không hạ được, câu nhắc hiện; xe húc hạ từng lính; thiếu sách hoặc còn hổ/lính gác thì cổng đóng; đủ thì cổng mở, qua đích sang màn 2 |
| L10 | 4 câu không trùng; đủ 5 sách lấy được kể cả khi không cưỡi trâu; nghỉ chân hồi 1 máu một lần; thẻ trang chủ khoá tới khi qua chương 5 |
| L11 | Chơi hết màn cả **nam và nữ** bằng mô phỏng; đo số; `?layout=engine` và `?viewer=1` vẫn chạy; màn 2–3 khung vẫn chạy |
| L12 | Người dùng chơi tay ít nhất 1 lần, ghi thời gian; chỉnh số nếu quá dễ/khó |
| L13 | `pytest tests` PASS; `/verify-ui` desktop + điện thoại ngang |

## 7. CÂU HỎI CẦN CHỐT

| # | Câu hỏi | Đề xuất |
|---|---|---|
| Q1 | Lính gác ải: chỉ xe mới hạ được, hay đòn gồng cũng hạ được? Xe chỉ cao 28 logic nên nhảy qua dễ; nếu đòn gồng cũng hạ được thì người chơi sẽ bỏ xe lại | **Chỉ xe mới hạ được**, đúng mô tả A1 "đẩy xe húc lính gác để qua ải". Phương án khác: đòn gồng cũng được, xe chỉ là cách nhanh hơn |
| Q2 | Có bắt buộc hạ hổ mới mở cổng không? Engine không có tường vô hình, người chơi nhảy lướt qua được | **Bắt buộc** (`boss: true`), hổ là mini-boss theo A1, và giữ sách. Người chạy qua phải quay lại. Phương án khác: không bắt buộc, sách đặt chỗ khác |
| Q3 | Trâu có bắt buộc thu phục không? Thu phục cần gồng đúng lúc, trượt thì trâu chạy mất | **Không bắt buộc**, là phần thưởng. Phương án khác: trâu quay lại lần 2 khi hụt |
| Q4 | Bố cục mục 2: các bài học cố định, chỉ 7 nhóm phụ được xáo? Chương 5 xáo gần hết | **Duyệt**, vì đòn gồng cần dạy theo thứ tự |

## 8. GATE
1. Không sửa `js/engine/` và file chương 1–5; số mới ghi `DESIGN_BASELINE`.
2. Test L1–L13 có số đo; FAIL hoặc sửa ngoài phạm vi → `BLOCKED`.
3. Report `/task-report`; chỉ commit khi người dùng yêu cầu. Sau đó: `PH_ART_02` + PH-L2.
