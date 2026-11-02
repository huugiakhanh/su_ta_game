# SỬ TA — CHƯƠNG 3: LÝ NAM ĐẾ
# TASK CARD: LND-L3 — MÀN 3 "CÔNG PHÁ THÀNH LONG BIÊN" (BOSS TIÊU TƯ + KỸ NĂNG + CUTSCENE)

TASK_ID: LND-L3 • Version 1.0 • 02/11/2026 • **ĐÃ DUYỆT 02/11/2026** (Q1–Q6 theo đề xuất) • **XONG 02/11/2026** (chơi tay OK; report [REPORT_LND-L3.md](REPORT_LND-L3.md))
Task card tổng: [SUTA_LND_TASK_00.md](../SUTA_LND_TASK_00.md) (§3.4 thiết kế, §5.3 cutscene, §5.4 panel kết — đã duyệt 31/10)
Asset: `CODEX_PROMPT_LND_ART_03.md` (§13–15: Gate C1/C2 PASS — prompt đã xoá, kết quả soát tóm tắt trong report) + FX/icon đợt `LND_ART_02`
Mẫu: màn 3 Bà Triệu (`js/levels/ba-trieu/{level3,boss,skills,render-extras}.js` — chỉ đọc, **không import**)
Rule: `ly-nam-de-gameplay.md`, `engine.md`, `assets-32bit.md`, `history-content.md`

---

## 0. MỤC TIÊU

Thay màn 3 khung (3 đợt lính) bằng trận boss thật **3 giai đoạn**, 3 phần thưởng màn 2 thành kỹ năng, cutscene + panel kết chương. Nhập
asset `LND_ART_03` vào bản chạy; FX/icon `LND_ART_02` (đang `NORMALIZED`) bắt đầu dùng. **Không sửa engine**. Mọi hook cần dùng đã có:
`enemyKinds.blockStrike/update/onContact`, `skills.blockHurt`, `hooks.dropHeal/draw/updateHud`, `LEVEL.update/cutscene`, `stunPlayer`.

## 1. ASSET

- Chép sang `frontend/static/assets/images/ly-nam-de/` (giữ cấu trúc, cập nhật 2 manifest):
  - Sprite: `BOSS_TIEU_TU`, `EN_LUONG_SHIELD_GUARD`, `EN_LUONG_FIRE_CART`, `PROP_LUONG_CATAPULT`, `PORTRAIT_TIEU_TU`, `PJ_BT_GOLD_COIN`,
    `FX_BT_STUN`, `FX_BT_ARMOR_SPARK`, và strip `plant_flag` mới của `NPC_LY_BI` (idle/talk giữ nguyên hash).
  - Map: `BG_LND_MID_LONG_BIEN`, `PROP_LND_VAN_XUAN_FLAG`.
- `LEVEL_SPRITES[3]`: các sprite trên + `NPC_LY_BI`, `EN_LUONG_PATROL`, `OB_BOULDER`, `FX_LND_TO_LICH_SHIELD`, `FX_LND_TIDE`, `ITEM_LND_HEAL`.
  `PORTRAITS`: + `PORTRAIT_TIEU_TU`, + 3 `ICON_SK_LND_*` (ô kỹ năng HUD). `MAP_PROPS_IN_GAME`: + cờ Vạn Xuân.
- Vùng màn 3: lớp giữa `BG_LND_MID_LONG_BIEN` (thay `BG_BT_MID_CAMP` mượn tạm). Mặt thành ở **GROUND_Y − 96 = y 152** (Codex đo hàng 256/640).
- Status → `IN_GAME` sau khi người dùng chơi thử: toàn bộ `LND_ART_03` + FX khiên/sóng + 3 icon. Cờ Vạn Xuân `IN_GAME` nhưng vẫn ghi "màu chờ team chốt".

## 2. TRẬN ĐẤU (DESIGN_BASELINE)

Đấu trường 1 chunk (768 px), tường 2 đầu. Tiêu Tư và máy bắn đá **đứng trên mặt thành** (vẽ qua `hooks.draw`, không phải enemy) ở GĐ 1–2.

### GĐ 1 — Máy bắn đá + cận vệ khiên sắt
- **Tiêu Tư** (mặt thành, x 660): `idle`, mỗi `commandInterval` 4 s `command` → ở hit_frame 3 ra lệnh máy bắn đá.
- **Máy bắn đá** (mặt thành, x 540): `fire`, ô 5 (hit) đá rời rổ. **Vạch báo** đỏ nhấp nháy trên đất tại x người chơi lúc lệnh. Đá
  (`OB_BOULDER` `roll`) bay vòng cung từ miệng rổ (pivot +23,5 / −43,25 logic) tới vạch sau 1,1 s, chạm đất phát `break`. Trúng: −1 máu.
- **Cận vệ khiên sắt** (`EN_LUONG_SHIELD_GUARD`): **3 lượt**, mỗi lượt 1 con ra từ mép phải. Lượt sau ra 1,5 s sau khi lượt trước ngã.
  - Hitbox 22×34. Đi `walk` về phía người chơi 24 px/s. Trong tầm thì `attack_01` (hit 4): mũi thương +53,5 logic từ tâm, ô đâm cao 12–20
    trên chân, −1 máu, nghỉ 1,8 s.
  - **Khiên chặn phía trước**: đòn chém tới khi người chơi đứng phía cận vệ đang quay mặt → `blocked` + `FX_BT_ARMOR_SPARK` + gợi ý (cách
    nhau ≥ 4 s). Chém **sau lưng** thì trúng. 3 máu.
  - **Quay chậm**: người chơi nhảy qua đầu sang phía sau thì cận vệ đợi `turnDelay` 0,7 s mới quay lại. Đây là khe để chém sau lưng.
  - Hết máu → `death`, xác nằm 2 s rồi biến mất.
- Hạ đủ 3 lượt → GĐ 2.

### GĐ 2 — Xe hoả công
- Thông báo "Tiêu Tư tung xe hoả công!". Tiêu Tư `command` → **2 lượt xe hoả công** (`EN_LUONG_FIRE_CART`), lượt sau ra 2 s sau khi xe
  trước bị phá. Máy bắn đá vẫn bắn, nhịp chậm lại (6 s).
- Xe ra từ mép phải, `burn` chạy 60 px/s về phía người chơi, chạm tường thì quay đầu. Ảnh lật theo hướng chạy.
  - Hitbox thân xe 80×26: không tính lửa, nên nhảy qua được (nhảy cao ~83 px). Chạm thân −1 máu.
  - Đang cháy: chém bị chặn, có gợi ý "Lửa quá lớn — hãy gọi Triều Cường (L)!".
- **Triều Cường** quét trúng xe đang cháy → `douse` → `stalled` (đứng yên, vô hại). Xe `stalled` chém được, 3 máu → `death`, xác nằm lại
  hết trận.
- Phá đủ 2 xe → GĐ 3.

### GĐ 3 — Tiêu Tư hoảng loạn
- Thông báo "Tiêu Tư hoảng loạn nhảy xuống thành!". Máy bắn đá ngừng. Tiêu Tư rơi từ mặt thành xuống đất (giữ ô 1 `hurt`, rơi theo trọng
  lực), chạm đất rung màn hình. Từ đó là enemy boss, **10 máu**, có thanh máu engine. Chạm thân **không** mất máu (như Lục Dận).
  - Người chơi trong tầm 40 px → `attack_01` (hit 4, mũi kiếm +32,5 logic từ tâm, −1 máu), nghỉ 1,6 s.
  - Xa hơn → `throw` mỗi 2,5 s: tiền vàng `PJ_BT_GOLD_COIN` bay vòng cung tới chỗ người chơi. Trúng thì **choáng 1,2 s** (`stunPlayer` +
    `FX_BT_STUN`), không mất máu.
  - Trúng đòn: `hurt` + bị đẩy lùi 10 px. **Mỗi 3 đòn trúng** → hoảng loạn chạy `flee` sang đầu bên kia đấu trường (140 px/s), vẫn chém được.
- Hết máu → cutscene (§4).

### Quân thường + bình máu
- Trong GĐ 1–2, mỗi 9 s có 1 lính tuần tiễu (`EN_LUONG_PATROL`, như màn 1–2) ra từ mép trái nếu đang có < 2 lính.
- Bình máu (`hooks.dropHeal`): lính, cận vệ, xe bị hạ rơi bình với tỉ lệ **15 %**, có buff Lương thảo dồi dào thì **40 %**. Boss không rơi.
- Ô boss HUD góc trên-phải: GĐ 1 "Cận vệ khiên sắt" + nấc lượt còn lại, GĐ 2 "Xe hoả công", GĐ 3 ẩn (thanh máu trên đầu Tiêu Tư).

## 3. KỸ NĂNG (`CHAPTER.skills`, DESIGN_BASELINE)

| Id | Phím | Cơ chế | FX / icon |
|---|---|---|---|
| `SK_LND_TO_LICH_SHIELD` Khiên Tô Lịch | K | Dựng khiên trước mặt (`raise` → `hold`), chặn mọi sát thương + choáng (`blockHurt`, kể cả đá, tiền vàng). Mỗi lần chặn phát `block`. Chặn **3 đòn** hoặc hết 6 s thì `break`. Hồi chiêu 12 s | `FX_LND_TO_LICH_SHIELD`, `ICON_SK_LND_TO_LICH_SHIELD` |
| `BUFF_LND_SUPPLY` Lương thảo dồi dào | — | Bị động: tỉ lệ rơi bình máu 15 % → 40 % | `ICON_SK_LND_SUPPLY` |
| `SK_LND_TIDE` Triều Cường | L | Sóng xuất hiện sau lưng người chơi, quét theo hướng mặt qua hết khung nhìn 320 px/s (`surge`), ra khỏi khung thì `fade`. Mỗi mục tiêu trúng 1 lần/lượt: lính thường −2 máu; cận vệ −1 máu **xuyên khiên** + đẩy lùi; xe đang cháy → `douse`; Tiêu Tư GĐ 3 −1 máu. Hồi chiêu 14 s | `FX_LND_TIDE`, `ICON_SK_LND_TIDE` |

Không dùng kỹ năng khi đang choáng. Hết hồi chiêu kêu tiếng sẵn sàng (như chương 2). Vào màn 3 bắt buộc đã qua màn 2, mà qua màn 2 thì có
đủ 3 phần thưởng, nên không cần đường thay thế khi thiếu Triều Cường.

## 4. CUTSCENE + KẾT CHƯƠNG

Người chơi mất điều khiển từ khi Tiêu Tư hết máu:
1. **beaten**: Tiêu Tư `hurt` đứng 0,8 s. Dừng mọi đá, tiền, xe, sóng, khiên.
2. **bribe**: Tiêu Tư `bribe` (quỳ dâng túi vàng), giữ ô cuối 0,8 s → cốt truyện câu 1 (chân dung `PORTRAIT_TIEU_TU`).
3. **flee**: Tiêu Tư `flee` chạy ra mép phải rồi biến mất.
4. **flag**: tối dần → sáng lại có **Lý Bí trên mặt thành** (x 384) → `plant_flag` 8 ô → cờ `PROP_LND_VAN_XUAN_FLAG` gắn đầu cán
   (+10 / −42,5 logic từ pivot, pivot cờ bottom-left). Camera neo Lý Bí, đứng 1 s → cốt truyện câu 2 (chân dung `PORTRAIT_LY_BI`).
5. Panel kết chương `CHAPTER_END` (đã có, §5.4) → `endGame(true)`.

## 5. NỘI DUNG CHỮ

- Cốt truyện cutscene: **nguyên văn LND-00 §5.3** (đã duyệt 31/10):
  - `STORY_TIEU_TU_FLEES`: "Tiêu Tư hoảng sợ, đem vàng bạc hối lộ xin tha mạng rồi bỏ chạy về Quảng Châu."
  - `STORY_LND_VICTORY`: "Lý Bí cắm cờ trên thành Long Biên. Giao Châu được giải phóng."
- Panel kết chương: `CHAPTER_END` đã có (§5.4), không sửa.
- **Câu thông báo trận** `BOSS_TEXT` (Claude soạn, không phải nội dung lịch sử, **chờ duyệt Q1**):

| Khoá | Câu |
|---|---|
| `guardHint` | Khiên sắt chặn phía trước — hãy nhảy qua đầu, chém sau lưng! |
| `guardHit` | Bạn bị cận vệ đâm thương trúng! |
| `boulderHit` | Bạn trúng đá máy bắn đá! |
| `phase2` | Tiêu Tư tung xe hoả công! |
| `cartHint` | Lửa quá lớn — hãy gọi Triều Cường (L)! |
| `cartHit` | Xe hoả công lao trúng bạn! |
| `phase3` | Tiêu Tư hoảng loạn nhảy xuống thành! |
| `swordHit` | Bạn trúng kiếm của Tiêu Tư! |
| `coinStun` | Không nhận vàng giặc! (giống chương 2) |

## 6. FILE

| Loại | File |
|---|---|
| Tạo (chép asset) | `frontend/static/assets/images/ly-nam-de/{sprites,maps}-32bit/**` (mục 1) + 2 manifest |
| Tạo | `js/levels/ly-nam-de/boss.js` (trận + cutscene + `ENEMY_KINDS` shieldGuard/fireCart/tieuTu + ô boss HUD), `skills.js` (`LND_SKILLS`), `render-extras.js` (`DRAW_LAYERS`: thành, máy bắn đá, Tiêu Tư trên thành, đá + vạch báo, tiền, khiên, sóng, choáng, tóe lửa, Lý Bí + cờ cutscene) |
| Sửa | `js/levels/ly-nam-de/{config,level3,chapter,dialogue-data,audio-data}.js` (`audio-data`: tiếng chiptune cho boss + kỹ năng) |
| Sửa (sau chơi thử) | status → `IN_GAME` trong `manifest_lnd.json` / `maps_lnd.json` (bản nguồn rồi chép lại) |
| Sửa tài liệu | `.claude/rules/ly-nam-de-gameplay.md`, `docs/SUTA_LND_TASK_00.md` (lộ trình), `docs/REPORT_LND-L3.md` (mới) |
| Xoá khi xong | `docs/CODEX_PROMPT_LND_ART_02.md`, `docs/CODEX_PROMPT_LND_ART_03.md` (mọi asset đã dùng) |
| Chỉ đọc | `js/levels/ba-trieu/*` (mẫu), `js/engine/*` |

## 7. TEST

| # | Test |
|---|---|
| T1 | Màn 3 nền thành Long Biên; Tiêu Tư + máy bắn đá đứng đúng mặt thành (chân ở y 152 ± 1); console sạch; không ảnh nào vẽ hộp tạm |
| T2 | GĐ 1: đá có vạch báo, rơi đúng chỗ, −1 máu; cận vệ chém trước bị chặn (tóe lửa + gợi ý), nhảy qua chém sau trúng; 3 lượt → GĐ 2 |
| T3 | GĐ 2: xe cháy chém không chết, nhảy qua được; Triều Cường → douse → stalled → chém 3 lần → xác nằm; 2 xe → GĐ 3 |
| T4 | GĐ 3: Tiêu Tư rơi xuống, chém/ném vàng (choáng có FX), mỗi 3 đòn chạy sang đầu kia; 10 đòn → cutscene |
| T5 | Cutscene đủ 5 bước; chữ cốt truyện khớp LND-00 §5.3 từng ký tự; cờ gắn đúng đầu cán; panel kết §5.4 → tiến trình chương xong, thành tựu `LND_CHAPTER` |
| T6 | Khiên Tô Lịch chặn 3 đòn rồi vỡ, hồi 12 s; Triều Cường quét đúng mục tiêu, hồi 14 s; ô HUD + nút cảm ứng hiện đúng |
| T7 | Bình máu: đếm rơi trên ≥ 40 lần hạ bằng script — có buff ~40 %, không buff ~15 % |
| T8 | `?layout=skills`: bao cát + cận vệ + xe hoả công ra lặp, thử đủ 2 kỹ năng |
| T9 | `pytest tests` PASS; `/verify-ui` desktop + điện thoại ngang; màn 1–2 chương này + màn 3 Bà Triệu vẫn chạy |
| T10 | Người dùng chơi tay hết màn ít nhất 1 lần, ghi thời gian |

## 8. CÂU HỎI CẦN CHỐT

| # | Câu hỏi | Đề xuất |
|---|---|---|
| Q1 | Câu thông báo trận §5 | **Duyệt** |
| Q2 | Tiêu Tư và máy bắn đá đứng trên lớp nền giữa (parallax 0,5). Mặt thành phẳng suốt chiều ngang nên đứng đúng mặt; chỉ có cọc rào/cờ phía sau trôi chậm hơn nhân vật khi camera di chuyển (đấu trường chỉ lệch tối đa ~144 px) | **Chấp nhận**, kiểm bằng mắt. Nếu khó chịu thì làm task engine riêng cho phép đổi parallax từng vùng |
| Q3 | Tiêu Tư không có animation đi bộ → GĐ 3 đứng tại chỗ, mỗi 3 đòn trúng thì `flee` sang đầu bên kia (hợp "hoảng loạn") | **Duyệt** |
| Q4 | Thêm lính tuần tiễu rải rác ở GĐ 1–2 (nguồn rơi bình máu để buff Tinh Thiều có ý nghĩa) | **Có** |
| Q5 | Số liệu §2–3 (3 cận vệ, 2 xe, boss 10 máu, tỉ lệ 15 %/40 %, hồi chiêu 12/14 s) | **Duyệt làm DESIGN_BASELINE**, chỉnh sau chơi thử |
| Q6 | Cutscene: Tiêu Tư quỳ hối lộ trước rồi mới chạy; Lý Bí xuất hiện trên thành sau màn tối (không có cảnh trèo thành) | **Duyệt** |

## 9. GATE
1. Không sửa engine, không sửa file chương 1–2; số mới ghi `DESIGN_BASELINE`.
2. Test T1–T10 có số đo; FAIL hoặc sửa ngoài phạm vi → `BLOCKED`.
3. Report `/task-report`; chỉ commit khi người dùng yêu cầu. Sau đó: prompt nhạc chương (Gemini) và chờ team trả lời các câu hỏi LND-00 §7.
