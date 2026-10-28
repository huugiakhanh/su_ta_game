# SỬ TA — CHƯƠNG 2: BÀ TRIỆU
# TASK CARD: BT-L2 — MÀN 2 "CHIÊU MỘ HIỀN TÀI" (BỐ CỤC THẬT)

TASK_ID: BT-L2 • Version 1.0 • 28/10/2026 • **ĐÃ DUYỆT 28/10/2026** (Q1–Q5 theo đề xuất) • **XONG 28/10/2026** (chơi thử OK, asset → `IN_GAME`; report [REPORT_BT-L2.md](REPORT_BT-L2.md))
Task card tổng: [SUTA_BT_TASK_00.md](SUTA_BT_TASK_00.md) (§3.2, §3.3, §4, §5.1) • Asset: [CODEX_PROMPT_BT_ART_02.md](CODEX_PROMPT_BT_ART_02.md), [REPORT_BT-ART-02.md](REPORT_BT-ART-02.md)
Mẫu: màn 2 Trưng Trắc (`js/levels/trung-trac/level2.js` — vị trí cố định, câu hỏi chặn đường trước mỗi NPC, giải cứu NPC, cốt truyện giữa màn)
Rule: `ba-trieu-gameplay.md`, `engine.md`

---

## 0. MỤC TIÊU

Thay khung màn 2 (4 chunk, chỉ 3 câu hỏi) bằng màn thật: **3 NPC** theo thứ tự **Triệu Quốc Đạt → ba anh em họ Lý → Bạch Tượng**, mỗi NPC
bị quân Ngô vây (giải cứu) và có 1 câu hỏi chặn đường trước đó; thoại + câu hỏi NPC + cốt truyện **nguyên văn BT-00 §4** (đã duyệt
17/10); trả lời đúng nhận 3 phần thưởng (cơ chế dùng ở màn 3 — BT-L3). Địa hình chuyển dần từ rừng núi Nưa sang **đầm lầy Bồ Điền**,
khó hơn màn 1. Chơi thử, chỉnh số, rồi đổi status asset BT_ART_02 màn 2 → `IN_GAME`.

**Không làm:** cơ chế 3 kỹ năng (chí mạng, khiên, gọi voi — BT-L3, gồm FX + icon), màn 3, asset mới.

## 1. BỐ CỤC (DESIGN_BASELINE)

9 chunk = 6912 px, **đặt cố định** (như màn 2 chương 1, không xáo). Đích cuối chunk 9, không cổng (như chương 1: phải gặp đủ 3 NPC).

| Chunk | Vùng (lớp giữa / đồi xa) | Nội dung chính |
|---|---|---|
| 1 | rừng nứa (`BG_BT_MID_NUA_FOREST`) | khởi động: 1 lính đốn gỗ, 1 hố chông |
| 2 | rừng nứa | thợ săn nỏ + gò đất; **bia câu hỏi về Triệu Quốc Đạt** (pool `quocDat`) |
| 3 | rừng nứa | **Triệu Quốc Đạt** (x 560) bị 2 lính Ngô vây |
| 4 | sườn đá (`BG_BT_MID_ROCKY_SLOPE`) | **cốt truyện** Triệu Quốc Đạt qua đời (BT-00 §4.4) khi vào chunk; đá lăn, bậc đất |
| 5 | sườn đá → đầm lầy | kỵ binh lao từ ngoài màn hình; **bia câu hỏi về họ Lý** |
| 6 | đầm lầy (`BG_BT_MID_MARSH`) | **ba anh em họ Lý** (x 560) bị 2 lính Ngô vây |
| 7 | đầm lầy | hố bùn có cành cây bắc qua (bục một chiều), lính đốn gỗ |
| 8 | đầm lầy | 2 thợ săn + hố bùn; **bia câu hỏi về Bạch Tượng** |
| 9 | đầm lầy | **Bạch Tượng** (x 560) bị vây (Q1); về đích |

- Câu hỏi: 1 câu rút ngẫu nhiên trong pool của NPC sắp gặp (BT-00 §3.3), tiêu đề "Câu hỏi về …" (`makeQuiz(…, npc.id)`).
- Hố bùn = hố của lưới địa hình (rơi mất 1 máu, hồi sinh đầu chunk); không đặt hố trong 130 px đầu chunk; quanh NPC giữ phẳng
  (`checkNpcClearance`). Không có cơ chế "lún bùn" mới.
- Mức khó: nhiều quân hơn màn 1 nhưng không có mini-boss; tổng ~12–14 chướng ngại + 6 lính vây. Số cụ thể chỉnh sau chơi thử.

## 2. NPC, GIẢI CỨU, PHẦN THƯỞNG

| NPC | Sprite (ô logic) | Lính vây | Phần thưởng (BT-00 §3.4) |
|---|---|---|---|
| `quocDat` Triệu Quốc Đạt | `NPC_TRIEU_QUOC_DAT` 48×48 | 2 × `EN_NGO_SOLDIER` (lính Ngô thường, kích dài) | `BUFF_BT_CRIT` Chí mạng |
| `hoLy` Ba anh em họ Lý | `NPC_HO_LY` 112×48 (3 người, Lý Hoằng giữa nói) | 2 × `EN_NGO_SOLDIER` | `SK_BT_RATTAN_SHIELD` Khiên mây tre |
| `bachTuong` Bạch Tượng | `NPC_BACH_TUONG` 128×96 | Q1: 2 × thợ săn `EN_NGO_HUNTER` (đề xuất) | `SK_BT_WHITE_ELEPHANT` Gọi Bạch Tượng |

- **Lính Ngô thường** `EN_NGO_SOLDIER` lần đầu vào game: thêm `ENEMY_SPRITES.soldier` (`art: 'soldier'`) với `rules` riêng; hitbox + tầm
  kích **đo từ strip** khi làm (chuẩn cao 34 → dự kiến ~24×34). Mũi kích `attack_01` ô 4 vươn ~60 px từ pivot (report BT_ART_02) —
  dài hơn lính đốn gỗ nhiều, xem Q4.
- Lính vây dựng bằng helper riêng của chương (bọc `makeCaptors` của engine, đổi `art`/cỡ hitbox) — engine giữ nguyên hàm.
- Thoại `NPC_DIALOGUES` (`dialogue-data.js`): chép **nguyên văn** BT-00 §4.1–4.3 (thoại, câu hỏi, 3 đáp án — đáp án đúng đứng đầu như
  chương 1, engine tự xáo —, gợi ý, vì sao đúng, phần thưởng). Tên/chức danh hiển thị: "Triệu Quốc Đạt — Anh trai, Hào trưởng vùng
  Quan Yên"; "Ba anh em họ Lý — Tướng tài vùng Bồ Điền" (người nói: Lý Hoằng); "Bạch Tượng — Voi trắng một ngà". Thoại 1 của Bạch Tượng
  "(Tiếng voi rống vang khắp núi rừng.)" giữ nguyên văn.
- Cốt truyện `STORY_QUOC_DAT` (§4.4): hiện 1 lần khi vào chunk sau Triệu Quốc Đạt, sau khi đã gặp (như `level2Events` chương 1).

## 3. THAY ĐỔI ENGINE (nhỏ, tương thích ngược — Q1–Q3)

NPC chương 1 đều là người 48×48 nên engine đang cứng vài số; NPC chương 2 to hơn:

| # | Thay đổi | Lý do |
|---|---|---|
| E1 | Khoảng giữ người chơi trước NPC đọc `CHAPTER.sprites.npcs[id].holdGap ?? NPC_RULES.holdGap` (`level-flow.js updateMeetings`) | Bạch Tượng ô 128 (thân voi rộng ~100), họ Lý ô 112: với `holdGap` 12 người chơi đứng **lọt vào giữa** voi / người anh bên trái |
| E2 | (Q1) Giải cứu tính cả **hazard** có `captorOf` còn sống (thợ săn) | Bạch Tượng bị thợ săn vây theo BT-00 §3.2 — hiện chỉ đếm `enemies` |
| E3 | (Q3) Đồi xa theo màn: `LEVEL.farHills ?? CHAPTER.farHills` (`assets.js`, `render/backdrop.js`, chú thích `chapter.js`) | Màn 2 dùng `BG_BT_FAR_PLAIN` (đồng bằng), màn 1 giữ `BG_BT_FAR_NUA` |

Thay đổi engine → **chơi lại 3 màn Trưng Trắc** + `?layout=p2`, `?layout=skills`, `?viewer=1` (rule `engine.md`).

## 4. FILE

| Loại | File |
|---|---|
| Sửa | `js/levels/ba-trieu/{config,level2,chapter,dialogue-data}.js` (`LEVEL2_*`, `LEVEL_SPRITES[2]`, `QUIZ.level2Spots`, `ENEMY_SPRITES.soldier`, `NPC_SPRITES` + `holdGap`) |
| Sửa (engine, Q1–Q3) | `js/engine/{level-flow,assets,chapter}.js`, `js/engine/render/backdrop.js` |
| Sửa (sau chơi thử) | status `NORMALIZED` → `IN_GAME`: `NPC_TRIEU_QUOC_DAT`, `NPC_HO_LY`, `NPC_BACH_TUONG`, `EN_NGO_SOLDIER` (`manifest_bt.json`), `BG_BT_MID_MARSH`, `BG_BT_FAR_PLAIN` (`maps_bt.json`) — sửa bản nguồn rồi chép bản chạy |
| Sửa tài liệu | `.claude/rules/ba-trieu-gameplay.md`, `docs/architecture.md` (nếu E1–E3), `docs/REPORT_BT-L2.md` (mới) |
| Chỉ đọc | `js/levels/trung-trac/level2.js` (mẫu, không import), `docs/SUTA_BT_TASK_00.md` §4 |

Phần thưởng đã có id trong seed `005` + `REWARD_NAMES`; engine `addReward` lưu sẵn — không sửa backend.

## 5. TEST

| # | Test |
|---|---|
| L1 | Màn dài 6912 px, vùng cảnh đúng chunk (rừng nứa → sườn đá → đầm lầy, hoà cảnh ở chỗ nối), đồi xa đồng bằng (nếu Q3); console sạch (trừ 401 khách) |
| L2 | 3 bia câu hỏi trước 3 NPC, câu rút đúng pool; sai −1 máu, đúng +500 |
| L3 | Mỗi NPC: còn lính vây thì bị giữ lại + nhắc "Hãy hạ quân Ngô đang vây …"; hạ hết thì mở hội thoại; người chơi đứng **ngoài** thân NPC (đo khoảng cách mép, Bạch Tượng + họ Lý) |
| L4 | Hội thoại đúng nguyên văn §4.1–4.3 (đối chiếu từng chữ), sai thì hiện gợi ý, đúng thì "Vì sao đúng" + phần thưởng; `state.skills`/tiến trình có đủ 3 id |
| L5 | Cốt truyện §4.4 hiện 1 lần sau Triệu Quốc Đạt, trước họ Lý |
| L6 | Lính Ngô thường: đi tuần, đâm trúng −1 máu đúng ô hit 4, chém 2 đòn hạ; animation đủ 5 trạng thái |
| L7 | Chưa gặp đủ 3 NPC thì không về đích; đủ → panel "Sang Màn 3" |
| L8 | Chơi tay hết màn ít nhất 1 lần (người dùng hoặc Claude), ghi thời gian; chỉnh số |
| L9 | `pytest tests` PASS; `/verify-ui` desktop + điện thoại ngang; **hồi quy 3 màn Trưng Trắc** (nếu sửa engine) + màn 1 Bà Triệu |

## 6. CÂU HỎI CẦN CHỐT

| # | Câu hỏi | Đề xuất |
|---|---|---|
| Q1 | Bạch Tượng bị vây bởi ai? | **2 thợ săn** như BT-00 §3.2 (engine E2 — 1 điều kiện) — hợp cảnh săn voi; phương án khác: lính Ngô như 2 NPC kia (không sửa engine) |
| Q2 | Khoảng giữ trước NPC to (E1)? | **Có** — `holdGap` riêng: họ Lý ~48, Bạch Tượng ~56 (đo khi làm) |
| Q3 | Màn 2 dùng đồi xa đồng bằng `BG_BT_FAR_PLAIN`? | **Có** (E3) — Codex đã vẽ riêng cho màn 2; không thì giữ đồi núi Nưa, bỏ asset này |
| Q4 | Tầm kích lính Ngô thường (~60 px từ tâm, gấp đôi lính đốn gỗ)? | **Giữ đúng hình** nhưng sát thương 1, nghỉ 1,6 s, đâm khi người chơi trong ~40 px — khó hơn lính đốn gỗ vừa đủ; chỉnh sau chơi thử |
| Q5 | Bạch Tượng cúi chào (`bow`) sau khi trả lời đúng? | **Để BT-L3** — hiện NPC mờ ngay khi gặp xong; cần engine giữ animation trước khi mờ. Màn 2 chỉ dùng `idle`/`talk` |

## 7. GATE
1. Chỉ sửa engine trong phạm vi E1–E3 đã duyệt; số mới ghi `DESIGN_BASELINE`; thoại nguyên văn BT-00 §4.
2. Test L1–L9 có số đo; FAIL hoặc sửa ngoài phạm vi → `BLOCKED`.
3. Report `/task-report`; chỉ commit khi người dùng yêu cầu. Sau đó: `BT_ART_03` (prompt Codex màn 3) + BT-L3.
