# SỬ TA — CHƯƠNG 6: PHÙNG HƯNG
# TASK CARD: PH-L3 — MÀN 3 "VÂY PHỦ TỐNG BÌNH" (TRẬN CAO CHÍNH BÌNH + KỸ NĂNG + CUTSCENE)

TASK_ID: PH-L3 • Version 1.0 • 09/11/2026 • **ĐÃ DUYỆT 09/11/2026** (Q1–Q7 theo đề xuất) • **XONG 09/11/2026** (chơi tay ổn); report [REPORT_PH-L3.md](REPORT_PH-L3.md)
Task card tổng: [SUTA_PH_TASK_00.md](SUTA_PH_TASK_00.md) (§3.4 thiết kế và phần thưởng, §5.2 cutscene, §5.3 panel kết; §5 đã duyệt nguyên văn)
Asset: `PH_ART_03` (`IN_GAME`, đã chép vào bản chạy, prompt đã xoá) + 3 icon và 3 FX của `PH_ART_02`. Số đo: `assets/sprites-32bit/phung-hung/SPRITE_REPORT_PH_32.md`, `assets/maps-32bit/phung-hung/MAP_REPORT_PH_32.md` (mục `PH_ART_03`).
Mẫu: màn 3 Mai Hắc Đế (`js/levels/mai-hac-de/{level3,boss,skills,render-extras}.js`), chỉ đọc, **không import**.
Rule: `phung-hung-gameplay.md`, `engine.md`, `assets-32bit.md`, `history-content.md`

---

## 0. MỤC TIÊU

- Thay màn 3 khung (3 đợt lính) bằng trận Cao Chính Bình **3 giai đoạn**: đốt trụ gác → đấm trống đồng → cutscene.
- Boss **không có máu**, thay bằng thanh **Nỗi sợ hãi**.
- Biến 3 phần thưởng màn 2 thành tác dụng thật.
- Làm cutscene và panel kết chương.
- **Không sửa engine.** Móc có sẵn: `enemyKinds.update/blockStrike/onStruck`, `skills.attackDamage`, `levels[3].skills: true`, `hooks.dropCarry/onThrownHit/onThrownLand/dropHeal/updateHud/draw`, `LEVEL.update/cutscene`, `shakeCamera`, `CHAPTER.carry`, hazard `vent`, `snare`, thrower `aim`.

**Không làm:** nhạc riêng (vẫn nhạc tạm chương 5), sửa thư viện, sửa engine, sửa file chương 1–5.

## 1. ASSET VÀ KHAI BÁO

- `LEVEL_SPRITES[3]`: `BOSS_CAO_CHINH_BINH`, `OB_PH_BRONZE_DRUM`, `OB_PH_WATCH_POST`, `PJ_PH_TORCH`, `TR_PH_BOILING_WATER`, `NPC_PHUNG_HUNG`, `NPC_PHUNG_HAI`, `NPC_DO_ANH_HAN`, `NPC_BO_PHA_CAN`, `EN_PH_TANG_SPEARMAN`, `EN_TANG_ARCHER`, `OB_PH_LATERITE_ROCK`, `PJ_CROSSBOW_BOLT`, `FX_OIL_FIRE`, `FX_TQP_TORCH`, `FX_PH_POWER_HIT`, `FX_PH_SUPPLY_CUT`, `FX_PH_FIRE_DRUM`, `FX_BT_STUN`, `ITEM_LND_HEAL`.
- `PORTRAITS` thêm `ICON_BUFF_PH_POWER`, `ICON_SK_PH_SUPPLY_CUT`, `ICON_SK_PH_FIRE_DRUM`.
- `MAP_PROPS_IN_GAME` thêm `PROP_PH_TONG_BINH_GATE`, `PROP_PH_TONG_BINH_GATE_OPEN`.
- **Chép cùng ID, cả nguồn và bản chạy** (mục + ảnh): `EN_TANG_ARCHER` và `FX_OIL_FIRE` từ chương 5, `FX_TQP_TORCH` từ chương 4.
- `BORROWED_MAPS`: thêm `BG_TQP_SKY_NIGHT`; bỏ `BG_MHD_MID_TANG_CHECKPOINT` nếu không còn nơi dùng.
- `LEVEL3_ZONES`: trời `BG_TQP_SKY_NIGHT`, lớp giữa `BG_PH_MID_TONG_BINH_WALL_NIGHT`. Đồi xa ẩn dưới trời đêm (`hiddenUnderSky`, như màn 2 Triệu Việt Vương).
- Template `phung-hung.html`: thêm block `skill_slots`, `skill_controls`, `skill_help` (mẫu `mai-hac-de.html`).
- Lầu cổng vẽ theo thế giới ở lớp `beforeNpcs`, không phụ thuộc parallax. Mốc từ pivot giữa đáy (đo ở Gate C1): sàn lầu cao 140, lối đi cao 112, 4 máng ±72 và ±120.
- Hitbox do code khai báo. Số có dấu `*` đo lại trên ảnh lúc code.

| Đối tượng | Khai báo |
|---|---|
| Cao Chính Bình | Không có thân. Chỉ vẽ tại x 384, sàn cao 140 |
| Trụ gác | 22×96* |
| Trống đồng | 40×44* |
| Nước sôi | 24×112, vẽ ô 48×112 |
| Cung thủ | đứng ở lối đi, x 288 và 480, cao 112 |
| Đuốc khi bay | 8×12*, vùng nhặt 22×22, nằm 12 s |

## 2. TRẬN ĐẤU (DESIGN_BASELINE)

Đấu trường 1 chunk (768 px), đất phẳng, không hố. Người chơi vào ở x 170.

```
x:   56      140   224   | 264 288 312 |  384  | 456 480 504 |  544   628      712
   trống      trụ   trụ  | nước cung nước | cổng | nước cung nước |  trụ   trụ     trống
```

### GĐ 1: Đốt trụ gác (thanh sợ 0 → 40)
- Boss phát `command` mỗi loạt tên.
- **Nước sôi:** 4 cột, chu kỳ nghỉ 2,4 s / báo 0,8 s / đổ 1,2 s, lệch pha 1 s. −1 máu. Lướt qua được, không nhảy qua được. `warn` của ảnh rất nhỏ nên code vẽ thêm **vạch báo** trên đất.
- **Đá rơi:** 1 viên mỗi 3 s phía trên người chơi, dùng `OB_PH_LATERITE_ROCK`, báo 0,6 s, −1 máu. Viên đã rơi **không chặn đường** và tự biến sau 1 s, để không cản đường chạy.
- **Cung thủ:** 2 người, thrower `aim`, bắn mỗi 3,2 s lệch nhau. Không đánh được.
- **Lính:** tối đa 3 lính cùng lúc, ra từ mép xa người chơi mỗi 4 s, 2 máu.
- **Đuốc:** lính chết rơi đuốc nếu còn trụ chưa cháy và trên sân chưa quá 2 đuốc. Nhặt rồi bấm Đánh để ném, tầm 120.
- **Trụ gác:** đuốc trúng thì `ignite` rồi `burning`, cháy vĩnh viễn, thanh sợ +10. Chém không có tác dụng, hiện câu gợi ý.
- Cả 4 trụ cháy → GĐ 2.

### GĐ 2: Đấm trống đồng (thanh sợ 40 → 100)
- Rung màn hình, 2 trống mở, trống bên xa người chơi `ready` trước.
- Mỗi đòn thường hoặc đòn gồng trúng trống `ready` +6, boss `hurt`, rung màn hình. Trống vừa đấm về `idle`, trống bên kia `ready`.
- Không có phần thưởng cần **10 cú đấm**. Khoảng cách 2 trống 656 px, chạy 168 px/s là 3,9 s mỗi lượt.
- Có Sức Địch Ngàn Người: mỗi cú ×1,5 = +9, cần **7 cú**.
- Đấm trống chưa `ready`: không tính, hiện câu gợi ý.
- Nước sôi và đá rơi vẫn chạy. Cung thủ ngừng bắn. Lính tối đa 1, 7 s một lần, không rơi đuốc.
- Từ 50 trở lên boss chuyển `fear`.

### GĐ 3: Thanh đầy → cutscene (mục 4)

### Bình máu và HUD
- Lính bị hạ rơi bình máu 25 % (`hooks.dropHeal`).
- Ô boss: "Cao Chính Bình — Đốt trụ gác" + chữ n/4; GĐ 2 "Cao Chính Bình — Trống đồng".
- **Thanh Nỗi sợ hãi** vẽ trên canvas, cố định đầu màn hình, có nhãn "Nỗi sợ hãi". Ô boss của engine chỉ có 3 nấc nên không dùng làm thanh.

## 3. KỸ NĂNG (`CHAPTER.skills`, DESIGN_BASELINE)

| Id | Phím | Cơ chế | FX / icon |
|---|---|---|---|
| `BUFF_PH_POWER` Sức Địch Ngàn Người | — | Bị động: sát thương ×2 với lính (`attackDamage`), mỗi cú đấm trống ×1,5 | `FX_PH_POWER_HIT`, `ICON_BUFF_PH_POWER` |
| `SK_PH_SUPPLY_CUT` Khóa Lương | K | 6 s, hồi 14 s tính từ lúc bật. Lính và tên chậm ×0,5, cung thủ bắn thưa ×2. Không tác dụng lên nước sôi, đá rơi | `FX_PH_SUPPLY_CUT`, `ICON_SK_PH_SUPPLY_CUT` |
| `SK_PH_FIRE_DRUM` Hỏa Trận Trống Đồng | L | Hồi 18 s. Lính trong 240 px choáng 3 s, không đánh. GĐ 2 cộng thêm +8 thanh sợ. | `FX_PH_FIRE_DRUM`, `FX_BT_STUN`, `ICON_SK_PH_FIRE_DRUM` |

- Cách làm chậm không sửa engine: đổi lính sang art có `rules` chậm, đổi tên sang sprite có `speed` chậm rồi trả lại khi hết. Không làm được thì dừng và báo `BLOCKED`.
- Không dùng kỹ năng khi choáng hoặc trong cutscene. Hết hồi chiêu phát tiếng sẵn sàng.
- Vào màn 3 không có phần thưởng (`?layout`, URL thẳng) vẫn thắng được.
- Layout thử `?layout=skills`: vào thẳng GĐ 2; thêm `?debug=1` để đủ 3 phần thưởng.

## 4. CUTSCENE + KẾT CHƯƠNG

Người chơi mất điều khiển từ lúc thanh đầy; dừng đạn, lính, nước sôi, đá, kỹ năng.

1. Rung màn hình, boss `death` phát hết.
2. **Story 1:** nguyên văn §5.2 câu 1.
3. Cổng đổi sang `PROP_PH_TONG_BINH_GATE_OPEN`, rung màn hình.
4. Phùng Hưng `walk` từ mép trái tới cổng x 384 rồi mờ dần vào trong. Phùng Hải, Đỗ Anh Hàn, Bồ Phá Cần đứng hai bên, `talk` (Q3).
5. **Story 2:** nguyên văn §5.2 câu 2, chân dung `PORTRAIT_PHUNG_HUNG`.
6. Panel `CHAPTER_END` (§5.3, đã có trong `dialogue-data.js`) → `endGame(true)`.

## 5. NỘI DUNG CHỮ

- `dialogue-data.js`: 2 câu cutscene **chép bằng script từ PH-00 §5.2**, kiểm từng ký tự.
- Câu thông báo trận `BOSS_TEXT`, Claude soạn, không phải nội dung lịch sử, **chờ duyệt Q1**:

| Khoá | Câu |
|---|---|
| `postHint` | Trụ gác quá chắc — hãy nhặt đuốc ném vào! |
| `torchHint` | Nhặt đuốc, bấm Đánh để ném vào trụ gác! |
| `postLit` | Trụ gác bốc cháy! |
| `phase2` | Bốn trụ đã cháy! Đấm trống đồng, trái rồi phải! |
| `drumWait` | Trống này vừa đánh — chạy sang trống bên kia! |
| `drumLocked` | Đốt hết trụ gác rồi mới đánh trống! |
| `waterHit` | Bạn bị nước sôi dội trúng! |
| `rockHit` | Bạn bị đá rơi trúng! |
| `boltHit` | Bạn trúng tên! |

## 6. FILE

| Loại | File |
|---|---|
| Tạo | `js/levels/phung-hung/boss.js`: trận, cutscene, `ENEMY_KINDS` (`watchPost`, `drum`), HUD, móc đuốc + bình máu |
| Tạo | `js/levels/phung-hung/skills.js`: `PH_SKILLS` |
| Tạo | `js/levels/phung-hung/render-extras.js`: lầu cổng, boss, vạch báo, thanh sợ, FX kỹ năng, nhân vật cutscene |
| Sửa | `js/levels/phung-hung/level3.js` (thay khung), `config.js` (`ARENA`, `LEVEL3_ZONES`, `BORROWED_MAPS`, số trận, `BOSS_TEXT`, `SKILLS`, `CARRY`, sprite, `LEVEL_SPRITES[3]`, `PORTRAITS`, `MAP_PROPS_IN_GAME`; bỏ `WAVES`), `chapter.js` (`skills`, `carry`, `enemyKinds`, hooks, màn 3), `dialogue-data.js`, `audio-data.js` (tiếng boss + kỹ năng, chép định nghĩa có sẵn, không import) |
| Sửa | `templates/gameplay/levels/phung-hung.html` (3 block kỹ năng; **khởi động lại server**) |
| Chép | `EN_TANG_ARCHER`, `FX_OIL_FIRE`, `FX_TQP_TORCH` vào manifest chương (nguồn rồi bản chạy) |
| Sửa tài liệu | `.claude/rules/phung-hung-gameplay.md`, `docs/SUTA_PH_TASK_00.md` §2, `docs/REPORT_PH-L3.md` (mới) |
| Chỉ đọc | `js/engine/*`, `js/levels/mai-hac-de/*` (mẫu) |

## 7. TEST

| # | Kiểm tra | Cách đo |
|---|---|---|
| T1 | Trời đêm, tường, lầu cổng đúng neo; boss đúng sàn lầu, cung thủ đúng lối đi, nước sôi đúng máng; console sạch, không hộp tạm | ảnh + `state` |
| T2 | Nước sôi đúng chu kỳ, −1 máu, lướt qua không mất máu; có vạch báo | mô phỏng |
| T3 | Đá rơi −1 máu, không chặn đường, biến sau 1 s | mô phỏng |
| T4 | Cung thủ bắn đúng nhịp ở GĐ 1, ngừng ở GĐ 2 | mô phỏng |
| T5 | Lính rơi đuốc đúng điều kiện, không quá 2 đuốc; hết trụ thì hết rơi; đếm bình máu ≥ 40 lần hạ ra khoảng 25 % | script |
| T6 | Chém trụ không tác dụng; đuốc trúng thì cháy, +10; 4 trụ sang GĐ 2 ở đúng 40 | mô phỏng |
| T7 | Trống luân phiên; đấm trống chưa `ready` không tính; 10 cú không phần thưởng, 7 cú có phần thưởng; đầy đúng 100 | script |
| T8 | K: lính và tên chậm, cung thủ thưa, hồi 14 s. L: choáng lính trong 240 px, +8 ở GĐ 2, hồi 18 s. Ô HUD và nút cảm ứng đúng | mô phỏng + ảnh |
| T9 | Cutscene đủ bước; chữ khớp §5.2–5.3 từng ký tự; panel kết → xong chương, thành tựu chương | script + `readProgress()` |
| T10 | Không phần thưởng vẫn thắng được, không kẹt | bot |
| T11 | `?layout=skills` chạy; bot hồi quy 18 màn (6 chương) 0 lỗi JS; `pytest tests` 0 FAIL; `/verify-ui` desktop + điện thoại ngang | bot + pytest |
| T12 | Người dùng chơi tay hết màn ít nhất 1 lần | chơi tay |

## 8. CÂU HỎI CẦN CHỐT

| # | Câu hỏi | Đề xuất |
|---|---|---|
| Q1 | Câu thông báo trận mục 5 | **Duyệt** |
| Q2 | Số liệu mục 2–3: 4 trụ +10, trống +6, ×1,5, nước sôi 2,4/0,8/1,2 s, đá 3 s, lính tối đa 3, bình máu 25 %, K 6 s hồi 14 s, L 3 s hồi 18 s | **Duyệt làm `DESIGN_BASELINE`**, chỉnh sau chơi thử |
| Q3 | Cutscene thêm 3 NPC màn 2 đứng hai bên để thể hiện "giữa tiếng hò reo", không thoại riêng. §5.2 không tả cảnh này | **Thêm**, dùng NPC có sẵn |
| Q4 | Câu 1 cutscene là lời kể, chưa có chân dung Cao Chính Bình | **Không chân dung**, tên hộp thoại ghi "Tống Bình" |
| Q5 | Cung thủ đứng trên lầu cổng, không đánh được, chỉ né hoặc làm chậm bằng K | **Duyệt**: người chơi không với tới, đúng thiết kế PH-00 |
| Q6 | Hỏa Trận Trống Đồng chỉ cộng thanh sợ ở GĐ 2, để GĐ 1 luôn phải đốt đủ trụ | **Chỉ GĐ 2** |
| Q7 | Trang phục Cao Chính Bình và chi tiết trống đồng vẫn chờ team. Dùng bản đã `IN_GAME` | **Dùng tạm** (`DESIGN_BASELINE`), team đổi thì giao Codex vẽ lại |

## 9. GATE

1. Không sửa engine, không sửa file chương 1–5. Số mới ghi `DESIGN_BASELINE`.
2. Test T1–T12 có số đo. FAIL hoặc sửa ngoài phạm vi → `BLOCKED`.
3. Report `/task-report`. Chỉ commit khi người dùng yêu cầu. Việc tiếp theo: prompt nhạc chương 6 (Gemini).
