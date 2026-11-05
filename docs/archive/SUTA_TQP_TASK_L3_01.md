# SỬ TA — CHƯƠNG 4: TRIỆU VIỆT VƯƠNG
# TASK CARD: TQP-L3 — MÀN 3 "ĐẠI PHÁ DƯƠNG SÀN" (BOSS DƯƠNG SÀN + KỸ NĂNG + CUTSCENE)

TASK_ID: TQP-L3 • Version 1.0 • 05/11/2026 • **ĐÃ DUYỆT 05/11/2026** (Q1–Q8 theo đề xuất) • **XONG 05/11/2026** (chơi tay OK) — report [REPORT_TQP-L3.md](REPORT_TQP-L3.md)
Task card tổng: [SUTA_TQP_TASK_00.md](../SUTA_TQP_TASK_00.md). Liên quan: §3.4 thiết kế màn 3, §5.4 cutscene, §5.5 panel kết. Cả hai mục câu chữ **chưa** được team duyệt.
Asset: `TQP_ART_03` (10 ID, `IN_GAME` 05/11, commit 283939b). Dùng thêm FX và icon 3 phần thưởng của `TQP_ART_02`. Số đo cho code lấy ở `assets/sprites-32bit/trieu-quang-phuc/SPRITE_REPORT_TQP_32.md` (mục Gate C2) và `assets/maps-32bit/trieu-quang-phuc/MAP_REPORT_TQP_32.md`.
Mẫu tham khảo: màn 3 Lý Nam Đế (`js/levels/ly-nam-de/{level3,boss,skills,render-extras}.js`). Chỉ đọc, **không import**.
Rule: `trieu-quang-phuc-gameplay.md`, `engine.md`, `assets-32bit.md`, `history-content.md`.

---

## 0. MỤC TIÊU

- Thay màn 3 khung (3 đợt lính) bằng trận boss Dương Sàn gồm **3 giai đoạn**.
- Biến 3 phần thưởng màn 2 thành tác dụng thật: máu +2, phím K Hiệu triệu, phím L Móng Rồng.
- Làm cutscene và panel kết chương.
- **Không sửa engine.** Mọi móc cần dùng đã có sẵn:
  - `enemyKinds.update/blockStrike/onStruck/onContact`;
  - `hooks.onPlunge/dropHeal/draw/updateHud`;
  - `skills.bonusHealth/blockHurt`;
  - `LEVEL.update/cutscene`, `shakeCamera`;
  - đổi địa hình giữa trận: `setTerrain` + gán lại `state.holes` / `state.mud`. Engine đọc lại 2 mảng này mỗi frame.
  - bục có `y` đổi mỗi frame (thuyền nhấp nhô). Người chơi bám theo `platform.y`.

## 1. ASSET VÀ KHAI BÁO

- `LEVEL_SPRITES[3]`, gồm:
  - boss, lính, cung thủ: `BOSS_DUONG_SAN`, `EN_LUONG_MERCENARY`, `EN_LUONG_PATROL`, `EN_LUONG_ARCHER`, `PJ_CROSSBOW_BOLT`;
  - FX và vật thể trận: `FX_TQP_NAPE_GLOW`, `FX_TQP_GROUND_SLAM`, `FX_BT_ARMOR_SPARK`, `OB_TQP_DIRT_MOUND`, `OB_TQP_DUGOUT_CANOE`, `FX_TQP_TORCH`;
  - FX kỹ năng: `FX_TQP_RALLY`, `FX_TQP_DRAGON_CLAW`;
  - bình máu: `ITEM_LND_HEAL`.
- `PORTRAITS` thêm: `PORTRAIT_DUONG_SAN` và 3 icon `ICON_SK_TQP_RALLY`, `ICON_SK_TQP_DRAGON_CLAW`, `ICON_BUFF_TQP_VITALITY`.
- Vùng màn 3:
  - trời `BG_TQP_SKY_NIGHT`;
  - lớp giữa `BG_TQP_MID_LUONG_CAMP_NIGHT` (y = GROUND_Y − 160, đáy đục 24 logic);
  - nước `PROP_TQP_SWAMP_WATER` (`LEVEL.tiles` giống màn 2);
  - sình `PROP_TQP_MUD`, mặc định của chương.
- Đuốc `FX_TQP_TORCH`: 3 cây tiền cảnh trên đất, không cắm giữa nước. Vẽ ở lớp `afterPlayer`.
- Hitbox (pixel logic, tương đối pivot) do code khai báo:

| Đối tượng | Hitbox |
|---|---|
| Dương Sàn đứng / lao | 40×100 |
| Dương Sàn đang lún (`stuck`) | 40×70. Đỉnh hộp = khe gáy (C2 đo −70…−76,5) |
| Lính đánh thuê | 22×34, nhịp đánh giống `EN_LUONG_PATROL` |
| Mỏm đất | 58×30 |
| Thuyền | bục rộng 56. Mặt bục = `pivotY − 24 + rimRow[ô]` (rim 8–10) |

## 2. TRẬN ĐẤU (DESIGN_BASELINE)

Đấu trường **1 chunk (768 px)**, tường 2 đầu, camera theo người chơi. Xem Q2.

```
x:  0        176  240 272            496 528  592         768
    | bờ trái | sình | mỏm |  đất giữa  | mỏm | sình | bờ phải |
```

- **2 dải sình** rộng 64 (`'='`): x 176–240 và 528–592.
- **2 mỏm đất** `OB_TQP_DIRT_MOUND`, đứng được (obstacle cao 30), sát mép trong 2 dải sình: x 240–298 và 470–528.
- Mỏm đất cho người chơi nhảy cao hơn để bổ xuống gáy. Lý do:

| Chỗ nhảy | Độ cao bổ tối đa |
|---|---|
| Đất | ~83 px |
| Trong sình | ~58 px |
| Từ mỏm | ~113 px |

### GĐ 1–2 — Nhử vào sình (lặp 3 lượt)

**Dương Sàn đuổi theo người chơi:**
- Đi bộ (`walk`) 40 px/s.
- Người chơi trong tầm 70 px → `attack_01`. Ô 5 là ô đánh trúng: mũi đao +60 logic, −1 máu. Nghỉ 1,8 s.
- Người chơi xa > 180 px và đã hết hồi 3 s → **lao** (`charge`, 230 px/s) theo một hướng cố định. Dừng khi:
  - qua người chơi 120 px; hoặc
  - chạm tường: ngừng, nghỉ 1 s; hoặc
  - **tâm boss vào dải sình** → lún.
- Chạm thân khi đang lao: −1 máu, đẩy người chơi 40 px.

**Lún** (`stuck`, lặp):
- Kéo dài **4 s**.
- `FX_TQP_NAPE_GLOW` đặt tại khe gáy từng ô (số đo C2).
- Hết 4 s → `hurt` 1 lần → đi tiếp.

**Giáp nặng:**
- Mọi đòn chém ngang, hoặc đòn bổ khi boss **không** lún → `blocked` + `FX_BT_ARMOR_SPARK`, không mất máu.
- Câu gợi ý hiện cách nhau ≥ 4 s.

**Đòn bổ trúng gáy khi đang lún:**

| Trường hợp | Sát thương |
|---|---|
| Móng Rồng đang bật | 3 |
| Không có Móng Rồng | 1 |

- Trúng gáy kèm `FX_TQP_DRAGON_CLAW.strike` (nếu có Móng Rồng), boss `hurt`, rung màn hình.
- Boss có **12 máu**: 3 lượt GĐ 1–2 × 3 + GĐ 3 × 3. Có Móng Rồng mỗi lượt là 1 cú bổ; không có thì 3 cú.
- Mỗi khi máu boss chạm mốc 9 / 6 / 3, boss thoát lún ngay, `hurt`, lui lại 60 px. Mốc 3 → sang GĐ 3.

**Gọi viện** (`command` 6@12, ô 3 ra lệnh):
- Mỗi 10 s, chỉ khi boss không lao và không lún.
- Lượt 1: 1 lính đánh thuê từ mép xa người chơi.
- Lượt 2: 2 lính đánh thuê.
- Lượt 3: 2 lính + 1 cung thủ `EN_LUONG_ARCHER` đứng ở mép đấu trường, bắn tên nỏ nhắm (`aim`) mỗi 2,5 s, 1 máu.
- Trên sân tối đa 3 lính.
- Lính đánh thuê theo hành vi `guard`, 2 máu, nhịp đánh như lính tuần.

### GĐ 3 — Cuồng nộ, đầm vỡ

Chuyển giai đoạn (0 điều khiển, ~2 s):
1. Câu thông báo `phase3`.
2. Boss `rage` (8@12). Ở ô 6 (đao chạm đất) phát `FX_TQP_GROUND_SLAM` tại mũi đao (+50,25 / −2 logic) và rung màn hình.
3. 2 mỏm phát `crack` (6@12) rồi biến mất.
4. **Địa hình đổi**: x 176–592 thành **nước** (`'~'`). Bờ trái 0–176 còn đất. Bờ phải 592–768 có dải sình 592–656 sát mép nước, phần còn lại là đất.
5. Người chơi đang đứng trên phần thành nước thì đặt về bờ trái (x 96). Boss đứng ở bờ phải (x 700).
6. Hiện **3 thuyền độc mộc** `OB_TQP_DUGOUT_CANOE` tại x 240, 352, 464 (khoảng cách nhảy 112 − 64). Thuyền đứng yên theo chiều ngang, nhấp nhô ±1 logic theo ô.

Vòng GĐ 3:
- Boss đứng ở bờ phải. Người chơi lên bờ phải trong tầm 70 → `attack_01`.
- Mỗi 6 s boss `rage`. Ô 6 tạo sóng đất chạy dọc bờ phải tới mép nước: người chơi đang đứng đất bờ phải −1 máu. Đứng trên thuyền thì an toàn.
- Sau mỗi `rage`, boss **sa vào sình mép bờ** (lùi về x 624): `stuck` 3 s, gáy sáng. Người chơi nhảy từ thuyền cuối và bổ gáy.
- Cung thủ bờ phải (nếu còn) vẫn bắn.
- Rơi xuống nước: về chỗ đứng vững gần nhất, −1 máu (engine đã có).
- Hết máu → cutscene (§4).

### Bình máu
- Lính đánh thuê, lính tuần, cung thủ bị hạ rơi bình máu (`hooks.dropHeal`) với tỉ lệ **25 %**.
- Boss không rơi bình.

### Ô boss trên HUD
- "Dương Sàn" kèm thanh máu engine.
- GĐ 1–2 thêm dòng "Lượt n/3". GĐ 3 ghi "Cuồng nộ".

## 3. KỸ NĂNG (`CHAPTER.skills`, DESIGN_BASELINE)

| Id | Phím | Cơ chế | FX / icon |
|---|---|---|---|
| `BUFF_TQP_VITALITY` Thể lực cường tráng | — | Bị động: `bonusHealth` +2. Ở màn 3 có 7 tim | `ICON_BUFF_TQP_VITALITY` |
| `SK_TQP_RALLY` Hiệu triệu Vạn Xuân | K | `burst` quanh người chơi (8@16). Ở ô 3: mọi lính thường và cung thủ trong bán kính 40 logic −2 máu, bị đẩy lùi 30 px; đạn trong bán kính tan. Không gây sát thương Dương Sàn, nhưng **ngắt cú lao** (boss dừng, nghỉ 1 s). Hồi chiêu 12 s | `FX_TQP_RALLY`, `ICON_SK_TQP_RALLY` |
| `SK_TQP_DRAGON_CLAW` Móng Rồng | L | `on` (4@16) rồi bật 6 s. Trong 6 s, bổ gáy gây 3 sát thương thay vì 1 và phát `strike` khi trúng. `hold` chỉ vẽ khi người chơi **đứng yên** (FX căn theo kiếm tư thế idle, ghi chú Gate B2). Hồi chiêu 10 s, tính từ lúc bật | `FX_TQP_DRAGON_CLAW`, `ICON_SK_TQP_DRAGON_CLAW` |

- Không dùng kỹ năng khi đang choáng.
- Hết hồi chiêu thì phát tiếng sẵn sàng (giống chương 2–3).
- Vào màn 3 bằng `?layout=` mà không có Móng Rồng: bổ gáy vẫn gây 1 sát thương, không bị kẹt màn (TQP-00 §3.4).

## 4. CUTSCENE + KẾT CHƯƠNG

Người chơi mất điều khiển từ lúc boss hết máu.

1. **beaten**: boss `hurt`, đứng 0,6 s. Dừng mọi đạn, lính và sóng đất.
2. **death**: boss `death` (8@10), nằm ô cuối, đao rơi cạnh.
3. **story 1**: cốt truyện §5.4 câu 1, chân dung `PORTRAIT_TQP`.
4. **story 2**: màn tối dần, sáng lại. Cốt truyện §5.4 câu 2, chân dung `PORTRAIT_TQP`.
5. Panel kết chương `CHAPTER_END` §5.5 → `endGame(true)`.

## 5. NỘI DUNG CHỮ

- **Cutscene §5.4 và panel §5.5**: dùng nguyên văn bản nháp trong TQP-00, ghi chú **CHỜ TEAM**. Xem Q6.
  - §5.4 câu 1 nói Triệu Quang Phục "tung đòn kết liễu". Toàn thư chỉ ghi Dương Sàn "chống đánh, thua rồi chết" (TQP-00 dòng `TQP_ART_03`).
  - §5.5 dòng 2 "chém tướng Dương Sàn" lấy từ phần giải thích câu 19–21 của team.
- **Câu thông báo trận** `BOSS_TEXT`. Claude soạn, không phải nội dung lịch sử, **chờ duyệt Q1**:

| Khoá | Câu |
|---|---|
| `armorHint` | Giáp Dương Sàn quá dày — hãy nhử hắn lao vào bãi sình! |
| `napeHint` | Dương Sàn bị lún — nhảy lên bổ vào gáy! |
| `noClaw` | Gáy chưa đủ hở — bật Móng Rồng (L) để đánh mạnh hơn! |
| `bladeHit` | Bạn trúng đại đao của Dương Sàn! |
| `chargeHit` | Dương Sàn lao trúng bạn! |
| `command` | Dương Sàn gọi lính đánh thuê! |
| `phase3` | Dương Sàn cuồng nộ đập vỡ bờ đầm! |
| `slamHit` | Sóng đất hất ngã bạn! |
| `canoeHint` | Nhảy qua thuyền độc mộc để áp sát! |

## 6. FILE

| Loại | File |
|---|---|
| Tạo | `js/levels/trieu-quang-phuc/boss.js`: trận 3 giai đoạn, đổi địa hình GĐ 3, thuyền, cutscene, `ENEMY_KINDS.duongSan`, ô boss HUD |
| Tạo | `js/levels/trieu-quang-phuc/skills.js`: `TQP_SKILLS` |
| Sửa | `js/levels/trieu-quang-phuc/config.js`: `LEVEL3_*`, `BOSS`, `BOSS_TEXT`, `LEVEL_SPRITES[3]`, `PORTRAITS`, sprite lính, cung thủ, mỏm, thuyền, `REINFORCE`, `HEAL_DROP` |
| Sửa | `js/levels/trieu-quang-phuc/level3.js` (thay khung), `chapter.js` (`skills`, `enemyKinds`, hooks, level 3 `update`/`cutscene`/`tiles`/`testLayout`), `render-extras.js` (gáy sáng, sóng đất, tóe lửa, thuyền, mỏm, đuốc, FX kỹ năng), `dialogue-data.js` (cốt truyện cutscene), `audio-data.js` (tiếng boss + kỹ năng, mượn bộ chiptune có sẵn) |
| Sửa | `templates/gameplay/levels/trieu-quang-phuc.html`: thêm block `skill_slots` / `skill_controls` / `skill_help` (template chương 4 chưa có; mẫu `ly-nam-de.html`) |
| Sửa tài liệu | `.claude/rules/trieu-quang-phuc-gameplay.md`, `docs/SUTA_TQP_TASK_00.md` (lộ trình), `docs/REPORT_TQP-L3.md` (mới) |
| Chỉ đọc | `js/engine/*`, `js/levels/ly-nam-de/*` (mẫu) |

Layout thử `?layout=skills` ở màn 3: bao gồm boss lún sẵn, lính đánh thuê ra lặp, đủ 3 phần thưởng, để thử K/L và đòn bổ gáy.

## 7. TEST

| # | Test |
|---|---|
| T1 | Nền trại Lương đêm, đuốc tiền cảnh. Boss chân đúng mặt đất (± 1 px). Console sạch. Không ảnh nào vẽ hộp tạm |
| T2 | Chém ngang và bổ khi boss không lún đều bị chặn: tóe lửa, máu boss không đổi, câu gợi ý cách nhau ≥ 4 s |
| T3 | Boss lao vào sình thì lún 4 s, gáy sáng đúng khe từng ô. Bổ từ mỏm trúng gáy: có Móng Rồng −3, không có −1. Lượt n/3 cập nhật |
| T4 | Gọi viện đúng số lượng, tối đa 3 lính. Cung thủ bắn nhắm. Đếm bình máu rơi ≥ 40 lần hạ bằng script, ra khoảng 25 % |
| T5 | GĐ 3: mỏm vỡ, địa hình thành nước (`state.holes` có khe nước 176–592), 3 thuyền nhấp nhô và người chơi đứng theo. Sóng đất chỉ trúng người đứng đất bờ phải. Bổ gáy kết liễu |
| T6 | Cutscene đủ 5 bước. Chữ khớp TQP-00 §5.4/§5.5 từng ký tự. Panel kết → tiến trình chương xong, thành tựu chương |
| T7 | Máu tối đa 7 khi có Thể lực cường tráng. K quét đúng bán kính, ngắt cú lao, hồi 12 s. L bật 6 s, `hold` chỉ hiện khi đứng yên, hồi 10 s. Ô HUD và nút cảm ứng đúng |
| T8 | `?layout=skills` chạy. Vào màn 3 không có phần thưởng vẫn thắng được (bổ gáy 1 sát thương) |
| T9 | `pytest tests` PASS. `/verify-ui` desktop + điện thoại ngang. Bot hồi quy 12 màn (4 chương) 0 lỗi JS |
| T10 | Người dùng chơi tay hết màn ít nhất 1 lần, ghi thời gian |

## 8. CÂU HỎI CẦN CHỐT

| # | Câu hỏi | Đề xuất |
|---|---|---|
| Q1 | Câu thông báo trận §5 | **Duyệt** |
| Q2 | TQP-00 ghi "đấu trường 2 chunk". Bố cục trên chỉ cần **1 chunk** (768 px, rộng hơn khung nhìn ~480): 2 dải sình + 2 mỏm đối xứng; GĐ 3 có đủ chỗ cho 3 thuyền | **1 chunk** |
| Q3 | Boss cao ~102 logic, người chơi nhảy tối đa ~83 (trong sình ~58) → chỉ bổ được gáy khi boss lún (gáy hạ còn ~70). Vì vậy đặt 2 **mỏm đất đứng được** sát dải sình làm bệ nhảy (GĐ 1–2), và ở GĐ 3 cho boss sa vào sình mép bờ sau mỗi cú cuồng nộ | **Duyệt** |
| Q4 | Cách sang GĐ 3: thay vì bờ đất vỡ dần, toàn đoạn giữa đổi thành nước một lần lúc boss `rage`, người chơi đứng giữa được đặt về bờ trái | **Duyệt** |
| Q5 | Số liệu §2–3: boss 12 máu (3 lượt + kết liễu), lún 4 s / 3 s, gọi viện 10 s, tối đa 3 lính, bình máu 25 %, K hồi 12 s, L 6 s / hồi 10 s | **Duyệt làm DESIGN_BASELINE**, chỉnh sau chơi thử |
| Q6 | Câu chữ cutscene §5.4 và panel §5.5 chưa được team duyệt, và §5.4 câu 1 lệch Toàn thư. Đề xuất vẫn dùng bản nháp để làm màn, đánh dấu chờ team, đổi khi team chốt | **Dùng bản nháp, chờ team** |
| Q7 | Hiệu triệu (K) không gây sát thương Dương Sàn (giáp) nhưng ngắt cú lao | **Duyệt** |
| Q8 | Cutscene dùng chân dung Triệu Quang Phục cho cả 2 câu cốt truyện, không đưa NPC Triệu Quang Phục vào sân (người chơi là nghĩa sĩ) | **Duyệt** |

## 9. GATE
1. Không sửa engine, không sửa file chương 1–3. Số mới ghi `DESIGN_BASELINE`.
2. Test T1–T10 có số đo. Có FAIL hoặc sửa ngoài phạm vi → `BLOCKED`.
3. Viết report bằng `/task-report`. Chỉ commit khi người dùng yêu cầu. Việc tiếp theo: prompt nhạc chương 4 (Gemini) và chờ team trả lời TQP-00 §7.
