# SỬ TA — CHƯƠNG 5: MAI HẮC ĐẾ
# TASK CARD: MHD-L3 — MÀN 3 "CÔNG PHÁ TỐNG BÌNH" (BOSS QUANG SỞ KHÁCH + KỸ NĂNG + CUTSCENE)

TASK_ID: MHD-L3 • Version 1.0 • 08/11/2026 • **ĐÃ DUYỆT 08/11/2026** (Q1–Q8 theo đề xuất) • **XONG 08/11/2026** (chơi tay OK, asset → `IN_GAME`) — report [REPORT_MHD-L3.md](REPORT_MHD-L3.md)
Task card tổng: [SUTA_MHD_TASK_00.md](SUTA_MHD_TASK_00.md) (§3.4 thiết kế, §5.3 cutscene, §5.4 panel kết; §5.3–5.4 đã duyệt nguyên văn 08/11/2026)
Asset: `MHD_ART_03` (8 ID, Gate C1, C2, C2-R1 PASS, đã chép vào game, status `NORMALIZED`) + 3 icon và `FX_MHD_VAN_AN_SHELL` của `MHD_ART_02`. Số đo: `assets/sprites-32bit/mai-hac-de/SPRITE_REPORT_MHD_32.md`, `assets/maps-32bit/mai-hac-de/MAP_REPORT_MHD_32.md` (mục `MHD_ART_03`).
Mẫu: màn 3 Triệu Việt Vương (`js/levels/trieu-quang-phuc/{level3,boss,skills,render-extras}.js`). Chỉ đọc, **không import**.
Rule: `mai-hac-de-gameplay.md`, `engine.md`, `assets-32bit.md`, `history-content.md`

---

## 0. MỤC TIÊU

- Thay màn 3 khung (3 đợt lính) bằng trận Quang Sở Khách **3 giai đoạn**: phá khiên → phá xe bắn tiễn → đấu đại đao.
- Biến 3 phần thưởng màn 2 thành tác dụng thật: đòn cơ bản +20 %, phím K Vỏ Bọc Vạn An, phím L Viện Binh.
- `rescued` của màn 1 đổi thành thời gian xe bị chặn.
- Làm cutscene và panel kết chương.
- **Không sửa engine.** Các móc cần đã có:
  - `enemyKinds.update/blockStrike/onStruck/onContact`, `plungeOnly` + `anims.blocked` (gạt đòn);
  - `skills.attackDamage/blockHurt`, `levels[3].skills: true`;
  - `hooks.dropCarry/onThrownHit/onThrownLand/dropHeal/updateHud/draw/onAttackWindow`;
  - `LEVEL.update/cutscene`, `shakeCamera`, `makeProjectile(..., aim)`, `state.platforms`.

**Không làm:** nhạc riêng (vẫn dùng nhạc tạm chương 4), sửa thư viện, sửa file chương 1–4.

## 1. ASSET VÀ KHAI BÁO

- `LEVEL_SPRITES[3]`: `BOSS_QUANG_SO_KHACH`, `EN_TANG_ARROW_CART`, `EN_TANG_SHIELD_GUARD`, `EN_TANG_SCOUT`, `FX_MHD_REINFORCE`, `FX_MHD_VAN_AN_SHELL`, `PROP_MHD_BLACK_FLAG`, `NPC_MAI_THUC_LOAN`, `PJ_CROSSBOW_BOLT`, `PJ_OIL_JAR`, `FX_OIL_FIRE`, `FX_BT_ARMOR_SPARK`, `ITEM_LND_HEAL`.
- `PORTRAITS` thêm: `PORTRAIT_QUANG_SO_KHACH`, `ICON_BUFF_MHD_POWER`, `ICON_SK_MHD_VAN_AN_SHELL`, `ICON_SK_MHD_REINFORCE`.
- `FX_BT_ARMOR_SPARK` **chưa có** trong `manifest_mhd.json`: chép mục + ảnh cùng ID từ chương 4 (bản nguồn rồi bản chạy, như MHD-00 §6).
- Nền: `LEVEL3_ZONES` đổi lớp giữa thành `BG_MHD_MID_TONG_BINH_GATE`; trời `BG_TT_SKY_DAY`, đồi xa giữ nguyên.
- Template `mai-hac-de.html`: thêm block `skill_slots`, `skill_controls`, `skill_help` (mẫu `trieu-quang-phuc.html`).
- Hitbox do code khai báo (pixel logic, so với pivot giữa đáy). Số có dấu `*` đo lại trên ảnh lúc code:

| Đối tượng | Khai báo |
|---|---|
| Quang Sở Khách | 24×38. Lưỡi đao ô hit 5: từ tâm +8 tới +39 (`attack_01`) / +37 (`attack_02`), cao 4–30* |
| Xe bắn tiễn | thân 120×58, tâm trùng tâm ô. Mũi húc +62 |
| Bục trên xe (quay phải) | x −57,75…−14,5, mặt bục cao 42,5 trên đất. Quay trái thì lật |
| Cần điều khiển (quay phải) | x −41,75…−35,5, nới ±10 để dễ trúng, cao 42–58 trên đất |
| Điểm bắn tên | ô hit 5 của `fire`, đo trên giá nỏ* |
| Vệ sĩ khiên sắt | 22×34. Tầm đánh đo từ `attack_01` [w128]* |
| Lính trinh sát | 22×34. Tầm đánh đo từ `attack_01`* |
| Cờ đen | tâm cột cách mép trái ô 4,25 → tâm ô đặt tại x 652,25, chân tại lỗ cắm (x 640,5, cao 125 trên đất) |

## 2. TRẬN ĐẤU (DESIGN_BASELINE)

Đấu trường 1 chunk (768 px), đất phẳng, không hố. Người chơi vào ở x 170.

```
x: 0      170         320–520        536–664     700      768
   | người chơi |  2 vệ sĩ khiên  |  xe bắn tiễn | boss | tường
```

### GĐ 1 — Phá khiên
- **Xe bắn tiễn** đứng yên, tâm x 600, quay trái. Boss đứng sau xe, tâm x 700, phát `command` mỗi loạt.
- **Loạt tên** mỗi 3,5 s, chỉ khi người chơi cách xe ≤ 340 px:
  1. Khoá vị trí người chơi, vẽ vạch báo 0,8 s từ giá nỏ tới điểm đó.
  2. Xe `fire`; ở ô hit, bắn 3 `PJ_CROSSBOW_BOLT` theo đường nhắm, lệch cao −14 / 0 / +14 px tại điểm khoá.
  3. Tên trúng −1 máu. Tầm bay theo engine 276 px.
- **2 vệ sĩ khiên sắt** tâm 380 và 470, tuần 320–520, hành vi `guard`, art `shieldGuard` có `plungeOnly`. Chương 5 không bật đòn bổ nên **mọi đòn chém bị gạt** (`blocked` + tóe lửa).
- **Lính trinh sát** (`rusher`, 1 máu, chạy 130 px/s): ra từ mép xa người chơi mỗi 4,5 s, tối đa 2 con.
- Trinh sát chết rơi **hũ dầu** nếu còn khiên chưa cháy và trên sân (đất + tay + trên không) chưa quá 2 hũ.
- **Ném hũ dầu**: trúng vệ sĩ, hoặc vỡ cách vệ sĩ ≤ 36 px, thì khiên cháy. Chuỗi art `shieldGuard` → `burningGuard` (`shield_burn`, đứng yên, vô hại, 0,67 s) → `bareGuard` (đi 40 px/s, 3 máu, chém được).
- Xe và boss GĐ 1–2 **không mất máu**: chém trúng thì tóe lửa + câu gợi ý.
- Hạ đủ 2 vệ sĩ → GĐ 2.

### GĐ 2 — Phá xe (3 lượt)
- Boss lùi về sát tường, vẫn không đánh được.
- Vòng xe: báo trước 0,8 s (xe rung, vạch dưới đất) → `charge` 240 px/s theo hướng về phía người chơi → chạy tới tường (biên tâm 68–630) → khựng → quay đầu.
- Xe húc trúng −1 máu. Né bằng nhảy qua (xe cao 60, nhảy 83) hoặc lướt.
- **Khựng** (`stalled`, hiện bục + cần điều khiển):

| Nguyên nhân | Thời gian |
|---|---|
| Đâm tường (luôn có, không cần kỹ năng) | 1,8 s |
| Viện Binh chặn, `rescued` 0–1 | 3 s |
| Viện Binh chặn, `rescued` 2–3 | 4 s |
| Viện Binh chặn, `rescued` 4–5 | 5 s |

- **Đánh cần**: đứng **trên bục** (`p.platform` là bục xe) và chém trúng cần → `lever_hit`. Đủ **2 nhát** thì xong 1 lượt. Nhát đã đánh giữ qua các lần khựng.
- Hết khựng hoặc xong lượt: xe hất người chơi khỏi bục, miễn thương 1,2 s, không mất máu.
- Xong lượt 3: xe `break`, xác nằm lại, không cản đường, rung màn hình → GĐ 3.
- GĐ 2 không có lính trinh sát.

### GĐ 3 — Đại đao
- Quang Sở Khách **12 máu**, hiện thanh máu. Đi 44 px/s tới người chơi; trong tầm 40 px thì chém.
- Chuỗi chém luân phiên `attack_01` / `attack_02`, mỗi nhát tiến 12 px, −1 máu:
  - máu > 6: 2 nhát;
  - máu ≤ 6: 3 nhát.
- Sau chuỗi: `winded` **1,4 s**. Chỉ lúc này chém mới mất máu; lúc khác `blocked` + tóe lửa.
- Trúng đòn lúc `winded` phát `hurt`, không làm ngắn khoảng hở.
- Không có Ý chí dân nghèo: 12 nhát. Có: mỗi nhát 1,2 → **10 nhát** (làm tròn 2 chữ số sau mỗi nhát để tránh sai số cộng dồn).
- 1 trinh sát ra mỗi 7 s, tối đa 1 con, không rơi hũ dầu.

### Bình máu và HUD
- Trinh sát, vệ sĩ bị hạ rơi bình máu **25 %** (`hooks.dropHeal`). Boss, xe không rơi.
- Ô boss: GĐ 1 "Quang Sở Khách — Phá khiên" + 2 nấc; GĐ 2 "Quang Sở Khách — Phá xe n/3" + 3 nấc; GĐ 3 "Quang Sở Khách", ẩn nấc, dùng thanh máu trên đầu.

## 3. KỸ NĂNG (`CHAPTER.skills`, DESIGN_BASELINE)

| Id | Phím | Cơ chế | FX / icon |
|---|---|---|---|
| `BUFF_MHD_POWER` Ý chí dân nghèo | — | Bị động: `attackDamage` trả 1,2. Lính 1–3 máu số nhát không đổi, boss 12 → 10 | `ICON_BUFF_MHD_POWER` |
| `SK_MHD_VAN_AN_SHELL` Vỏ Bọc Vạn An | K | Bật tối đa 6 s, chặn trọn 1 đòn (`blockHurt`), vỡ thì miễn thương 0,5 s. Hồi 12 s tính từ lúc bật | `FX_MHD_VAN_AN_SHELL` (`on` → `hold` → `break`), `ICON_SK_MHD_VAN_AN_SHELL` |
| `SK_MHD_REINFORCE` Viện Binh | L | Toán dân quân chạy từ người chơi 300 px/s tới tường. GĐ 2 luôn chạy về phía xe, còn lại theo hướng mặt. Trúng lính: trinh sát −2 máu, vệ sĩ bị đẩy 30 px, không mất khiên. Trúng xe đang báo trước hoặc đang húc: xe khựng theo `rescued`, FX chuyển `brace` tại mũi xe. Không gây sát thương boss. Hồi 14 s | `FX_MHD_REINFORCE`, `ICON_SK_MHD_REINFORCE` |

- Không dùng kỹ năng khi choáng hoặc trong cutscene. Hết hồi chiêu phát tiếng sẵn sàng.
- Vào màn 3 không có phần thưởng (`?layout`, URL thẳng): xe vẫn đâm tường khựng 1,8 s, boss 12 nhát, thắng được.

## 4. CUTSCENE + KẾT CHƯƠNG

Người chơi mất điều khiển từ lúc boss hết máu; dừng đạn, lính, kỹ năng.

1. **disarm**: boss `disarm` phát hết, đứng 0,4 s.
2. **story 1**: nguyên văn §5.3 câu 1, chân dung `PORTRAIT_QUANG_SO_KHACH`.
3. **flee**: boss `flee` phi tới cổng (x 629,5–654,5) rồi biến mất ở cổng.
4. Màn tối dần, sáng lại: Mai Thúc Loan (`NPC_MAI_THUC_LOAN`) đứng giữa sân; cờ `PROP_MHD_BLACK_FLAG` `raise` rồi `wave` tại lỗ cắm trên cổng.
5. **story 2**: nguyên văn §5.3 câu 2, chân dung `PORTRAIT_MAI_THUC_LOAN`.
6. Panel `CHAPTER_END` nguyên văn §5.4 → `endGame(true)`.

## 5. NỘI DUNG CHỮ

- `dialogue-data.js`: `STORY_MHD_FLEE`, `STORY_MHD_FLAG` (§5.3), `CHAPTER_END` (§5.4): **chép bằng script từ MHD-00**, kiểm từng ký tự.
- Câu thông báo trận `BOSS_TEXT`, Claude soạn, không phải nội dung lịch sử, **chờ duyệt Q1**:

| Khoá | Câu |
|---|---|
| `shieldHint` | Khiên sắt gạt mọi đòn chém — hãy ném hũ dầu! |
| `jarHint` | Nhặt hũ dầu, bấm Đánh để ném vào vệ sĩ! |
| `shieldBurn` | Khiên sắt bốc cháy! |
| `cartBlock` | Xe bắn tiễn quá chắc — phải phá cần điều khiển! |
| `bossSafe` | Quang Sở Khách núp sau xe, chưa đánh được! |
| `phase2` | Quang Sở Khách thúc xe bắn tiễn húc thẳng! |
| `chargeHit` | Bạn bị xe bắn tiễn húc trúng! |
| `boltHit` | Bạn trúng tên! |
| `stalled` | Xe khựng lại — nhảy lên bục, đánh cần điều khiển! |
| `reinforce` | Viện binh chặn xe! |
| `leverOff` | Phải đứng trên bục mới với tới cần điều khiển! |
| `phase3` | Xe vỡ! Quang Sở Khách vác đại đao xông ra! |
| `bladeHit` | Bạn trúng đại đao! |
| `bossGuard` | Đại đao gạt đòn — chờ hắn đuối sức sau loạt chém! |

## 6. FILE

| Loại | File |
|---|---|
| Tạo | `js/levels/mai-hac-de/boss.js`: trận 3 giai đoạn, cutscene, `ENEMY_KINDS` (`quangSoKhach`, `arrowCart`), ô boss HUD, móc hũ dầu + bình máu |
| Tạo | `js/levels/mai-hac-de/skills.js`: `MHD_SKILLS` |
| Sửa | `js/levels/mai-hac-de/level3.js` (thay khung), `config.js` (`ARENA`, `LEVEL3_ZONES`, `BOSS`, `CART`, `BOSS_TEXT`, `SKILLS`, art lính, `LEVEL_SPRITES[3]`, `PORTRAITS`; bỏ `WAVES`), `chapter.js` (`skills`, `enemyKinds`, hooks, level 3), `render-extras.js` (vạch báo, tóe lửa, FX kỹ năng, cờ), `dialogue-data.js`, `audio-data.js` (tiếng boss + kỹ năng, chép định nghĩa có sẵn, không import) |
| Sửa | `templates/gameplay/levels/mai-hac-de.html` (3 block kỹ năng) |
| Chép | `FX_BT_ARMOR_SPARK` vào `manifest_mhd.json` + thư mục `fx/` (bản nguồn rồi bản chạy) |
| Sửa (sau chơi thử) | Status `MHD_ART_03` (8 ID) + 3 icon + `FX_MHD_VAN_AN_SHELL` → `IN_GAME`; xoá `CODEX_PROMPT_MHD_ART_02.md`, `CODEX_PROMPT_MHD_ART_03.md` |
| Sửa tài liệu | `.claude/rules/mai-hac-de-gameplay.md`, `docs/SUTA_MHD_TASK_00.md` §2, `docs/REPORT_MHD-L3.md` (mới) |
| Chỉ đọc | `js/engine/*`, `js/levels/trieu-quang-phuc/*` (mẫu) |

Layout thử `?layout=skills` ở màn 3: vào thẳng GĐ 2, xe chạy lặp, không kết thúc; thêm `?debug=1` để có đủ 3 phần thưởng.

## 7. TEST

| # | Kiểm tra | Cách đo |
|---|---|---|
| T1 | Nền cổng Tống Bình đúng neo; boss, xe, lính chân đúng đất (± 1 px); console sạch, không hộp tạm | ảnh + `state` |
| T2 | Vạch báo 0,8 s rồi 3 tên đúng hướng khoá; ngoài 340 px không bắn | mô phỏng |
| T3 | Chém vệ sĩ còn khiên: máu không đổi, có `blocked` + tóe lửa. Hũ trúng và hũ vỡ cách ≤ 36 px đều cháy khiên; sau đó 3 nhát hạ | mô phỏng |
| T4 | Trinh sát rơi hũ đúng điều kiện, không quá 2 hũ; 0 khiên thì hết rơi; đếm bình máu ≥ 40 lần hạ ra khoảng 25 % | script |
| T5 | GĐ 2: húc −1 máu, đâm tường khựng 1,8 s; Viện Binh với `rescued` 0, 3, 5 cho 3 / 4 / 5 s | mô phỏng |
| T6 | Đánh cần chỉ tính khi đứng trên bục, 2 nhát 1 lượt, cả 2 hướng xe; hết giờ thì hất xuống không mất máu; lượt 3 xe `break` | mô phỏng |
| T7 | GĐ 3: ngoài `winded` máu không đổi; 12 nhát (không buff), 10 nhát (có buff), máu về đúng 0 | script |
| T8 | K chặn 1 đòn, vỡ, hồi 12 s; L dọn trinh sát, không hại boss, hồi 14 s; ô HUD và nút cảm ứng đúng | mô phỏng + ảnh |
| T9 | Cutscene đủ bước; chữ khớp §5.3–5.4 từng ký tự; panel kết → tiến trình xong chương, thành tựu chương | script + `readProgress()` |
| T10 | Không phần thưởng, không `rescued` vẫn thắng được, không kẹt | bot |
| T11 | `?layout=skills` chạy; bot hồi quy 15 màn (5 chương) 0 lỗi JS; `pytest tests` 0 FAIL; `/verify-ui` desktop + điện thoại ngang | bot + pytest |
| T12 | Người dùng chơi tay hết màn ít nhất 1 lần | chơi tay |

## 8. CÂU HỎI CẦN CHỐT

| # | Câu hỏi | Đề xuất |
|---|---|---|
| Q1 | Câu thông báo trận mục 5 | **Duyệt** |
| Q2 | Số liệu mục 2–3: boss 12 máu, loạt tên 3,5 s, khựng tường 1,8 s, 2 nhát mỗi lượt, `winded` 1,4 s, bình máu 25 %, Vỏ Bọc 6 s | **Duyệt làm `DESIGN_BASELINE`**, chỉnh sau chơi thử |
| Q3 | MHD-00 ghi "Viện Binh chặn xe → xe khựng", còn đâm tường chỉ dành cho lúc chưa có kỹ năng. Đề xuất **luôn** có khựng tường 1,8 s, kể cả khi đã có Viện Binh mà chưa dùng, vì L hồi 14 s, chờ không thì lâu | **Luôn có khựng tường** |
| Q4 | Mỗi lượt cần **2 nhát** vào cần, để `rescued` có ý nghĩa: 1 nhát thì khựng 3 s hay 5 s không khác gì | **2 nhát** |
| Q5 | Bắt buộc **đứng trên bục** mới đánh được cần, nhảy chém từ đất không tính (đúng mô tả MHD-00, khó hơn một chút) | **Bắt buộc đứng bục** |
| Q6 | GĐ 1–2 boss có thân, đứng phía sau, chém trúng tóe lửa, không gây sát thương cho người chơi. MHD-00 ghi boss "chỉ vẽ" ở GĐ 1 | **Có thân, tóe lửa** để người chơi hiểu vì sao không đánh được |
| Q7 | Cutscene thêm Mai Thúc Loan đứng giữa sân khi cờ kéo lên, không thoại riêng. §5.3 chỉ có 2 câu, không tả cảnh này | **Thêm**, dùng NPC có sẵn |
| Q8 | Trang thư viện vẫn nhắc Thúc Bảo, thoại §5.2 vẫn "người dân phu Hoan Châu": không liên quan màn 3, tiếp tục để team quyết | **Để nguyên, không sửa trong task này** |

## 9. GATE
1. Không sửa engine, không sửa file chương 1–4. Số mới ghi `DESIGN_BASELINE`.
2. Test T1–T12 có số đo. FAIL hoặc sửa ngoài phạm vi → `BLOCKED`.
3. Report `/task-report`. Chỉ commit khi người dùng yêu cầu. Việc tiếp theo: prompt nhạc chương 5 (Gemini).
