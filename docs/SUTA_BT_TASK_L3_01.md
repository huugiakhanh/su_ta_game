# SỬ TA — BT-L3: MÀN 3 "CHIẾN LŨY BỒ ĐIỀN" — BOSS LỤC DẬN + 3 KỸ NĂNG

28/10/2026 • Claude soạn • **Người dùng duyệt 28/10/2026** (Q1–Q5 theo đề xuất, mục 9)
Nguồn: [SUTA_BT_TASK_00.md](SUTA_BT_TASK_00.md) §3.4, §5.2–5.3 (đã duyệt 17/10); asset `BT_ART_03` (Gate C1 + C2 đã duyệt 28/10), `BT_ART_02` (FX/icon kỹ năng, `NPC_BACH_TUONG.charge/bow`).
Mẫu: chương Trưng Trắc màn 3 (`trung-trac/level3.js`, `boss.js`, `skills.js`, `render-extras.js`). **Không import** file chương 1. Bảng nào cần thì khai báo lại trong chương này.

## 0. MỤC TIÊU

Thay khung màn 3 hiện tại (3 đợt lính đốn gỗ) bằng trận boss Lục Dận 3 giai đoạn, 3 kỹ năng từ phần thưởng màn 2, cutscene và panel kết chương.

Mọi số trong card là `DESIGN_BASELINE`: chốt sau khi người dùng chơi thử.

## 1. ĐẤU TRƯỜNG

| Mục | Giá trị |
|---|---|
| Đấu trường | 1 chunk (`ARENA.width` = `CHUNK_W`), `arena: true` |
| Lớp nền | trời `BG_TT_SKY_DAY` (mượn chương 1), lớp giữa `BG_BT_MID_FORTRESS`, đồi xa `BG_BT_FAR_PLAIN` (`LEVEL.farHills`) |
| Người chơi vào | x 170 |
| Đài chỉ huy | `PROP_BT_COMMAND_TOWER` tâm tại x ≈ `width − 110` |
| Lục Dận | đứng trên sàn đài, cao 128 px logic; không với tới; quay về phía người chơi |
| 3 tháp vàng | `EN_BT_GOLD_TOWER`, tâm tại x ≈ 300 / 480 / 640 |
| Kỵ binh ra từ | mép phải (sau đài) |

Không có hố, sách, bia hay NPC. Có khe kỹ năng (`skills: true`).

## 2. DIỄN BIẾN TRẬN (`boss.js` của chương)

### GĐ 1 — Mưa tên độc + 3 tháp vàng

**Lục Dận:**
- Chạy `command` mỗi 3,5 s. Ở `hit_frame` 3, phát một loạt **2–3 tên độc**.
- Tên rơi thẳng xuống. Mỗi mũi có **vạch báo đỏ** do code vẽ trên mặt đất trong 0,7 s, rồi mũi `PJ_BT_POISON_ARROW` rơi với tốc 420 px/s.
- Trúng tên: −1 máu.

**Tháp vàng:**
- Tháp là enemy đứng yên, **4 máu**, chém được.
- Khi trúng đòn chạy `hurt`; hết máu chạy `destroyed` và để lại đống đổ.
- Mỗi 2,8 s (các tháp lệch nhịp nhau), tháp chạy `throw`. Ở ô 4, từ điểm rời tay (+21,5 / −55,25 px logic so với pivot), tháp ném `PJ_BT_GOLD_COIN` theo đường cong về phía người chơi.

**Tiền vàng trúng người chơi:**
- Không mất máu, nhưng người chơi bị **choáng 1,2 s**: không di chuyển, không đánh, có `FX_BT_STUN` trên đầu.
- Hiện thông báo kiểu "Không nhận vàng giặc!" (câu chữ chờ duyệt, mục 9).

**Chuyển giai đoạn:** phá đủ 3 tháp thì sang GĐ 2.

### GĐ 2 — Kỵ binh thiết giáp

- Mưa tên tiếp tục, thưa hơn: mỗi 5 s.
- **3 lượt kỵ binh**, mỗi lượt 1 con `EN_NGO_ARMORED_CAVALRY`.
  - Kỵ binh phi (`gallop`) ngang đấu trường như roller, va chạm thân −1 máu. Hết đấu trường thì quay đầu.
  - Hitbox thân đo từ bbox lõi C1. Ghi trong comment `config.js`.
- **Đòn chém thường bị giáp chặn:** chạy `blocked` + `FX_BT_ARMOR_SPARK` ở điểm chạm. Lần đầu hiện gợi ý "Giáp quá dày — hãy gọi Bạch Tượng (L)!".
- **Bạch Tượng húc trúng:** kỵ binh chạy `knockback`. Hết animation thì chạy `death`, rồi xác nằm lại 2 s.
- Hạ đủ 3 kỵ binh thì sang GĐ 3.
- Kỹ năng **Gọi Bạch Tượng luôn có ở màn 3**: màn 2 bắt buộc trả lời đúng mới qua, nên phần thưởng này luôn có trong tiến trình. Vào thẳng `?debug=1` mà thiếu phần thưởng thì vẫn cấp cho phép thử (mục 9 Q2).

### GĐ 3 — Đài sụp, Lục Dận rơi xuống đầm lầy

- **Đài sụp:**
  - Đài chạy `shake` 0,6 s, rung màn hình, rồi chạy `collapse`.
  - Lục Dận chạy `fall` theo quỹ đạo rơi từ sàn đài xuống đất trước đài.
  - Sau đó Lục Dận chạy `mud_idle`.
- **Lục Dận lúc này:**
  - `passive`: không tấn công, chạm không mất máu;
  - **8 máu**;
  - trúng đòn chạy `hurt` và bị đẩy lùi nhẹ;
  - chí mạng trừ 2 máu (kỹ năng Chí mạng).
- Hết máu thì Lục Dận chạy `flee` ra mép phải, người chơi mất quyền điều khiển, chuyển sang cutscene.

### Cutscene + kết chương

1. Mờ dần, hiện câu §5.2 dòng 1 (nguyên văn, đã duyệt): "Đài cao sụp đổ, Lục Dận rơi xuống đầm lầy."
2. Mờ lại vào cảnh: `PLAYER_BA_TRIEU_ELEPHANT.charge` đi từ mép trái vào giữa rồi `idle`. Rung màn hình theo nhịp chân voi.
3. `PROP_BT_VICTORY_FLAG` cắm trên ụ đất của chiến lũy (điểm gắn đặt trong `config.js`).
4. Hiện câu §5.2 dòng 2: "Bà Triệu mặc giáp vàng, cưỡi voi trắng dẫn quân xông lên. Lục Dận bỏ chạy về phương Bắc."
5. `endGame(true)` → panel §5.3 (`CHAPTER_END` đã có sẵn trong `dialogue-data.js`).

### HUD boss

- Ô boss qua `hooks.updateHud`:
  - GĐ 1: "Tháp vàng" n/3;
  - GĐ 2: "Kỵ binh thiết giáp" n/3;
  - GĐ 3: thanh máu Lục Dận.
- Tên hiển thị dùng `PORTRAIT_LUC_DAN`.

## 3. KỸ NĂNG (`skills.js` của chương → `CHAPTER.skills`)

| Id | Khe | Cơ chế | Asset |
|---|---|---|---|
| `BUFF_BT_CRIT` Chí mạng | bị động | Mỗi đòn chém có **25 %** chí mạng, gây ×2 sát thương. Dùng hook `skills.attackDamage` + `hooks.onCrit` có sẵn trong engine | `FX_BT_CRIT.impact` tại điểm trúng, `ICON_SK_BT_CRIT` |
| `SK_BT_RATTAN_SHIELD` Khiên mây tre | `skill1` (K) | Giơ khiên **2,5 s**, hồi chiêu **10 s**. Trong thời gian này **chặn mọi sát thương và choáng** (tên, tiền, kỵ binh), bằng hook engine E1. Mỗi lần chặn chạy `block` + tiếng | `FX_BT_RATTAN_SHIELD` raise → hold → block, `ICON_SK_BT_RATTAN_SHIELD` |
| `SK_BT_WHITE_ELEPHANT` Gọi Bạch Tượng | `skill2` (L) | `NPC_BACH_TUONG.charge` lao từ mép sau người chơi qua hết đấu trường với tốc **360 px/s**. Mọi kỵ binh, lính và tháp chạm phải: kỵ binh `knockback`, tháp −2 máu. Lục Dận GĐ 3: −2 máu. Rung màn hình khi voi chạy. Hồi chiêu **14 s** | `NPC_BACH_TUONG.charge`, `ICON_SK_BT_WHITE_ELEPHANT` |

**Animation `bow` của Bạch Tượng (Q5 hoãn từ BT-L2):** đề xuất đưa vào **cutscene**. Trước câu §5.2 dòng 2, Bạch Tượng (NPC) cúi chào rồi Bà Triệu lên voi. Phương án khác: bỏ không dùng (mục 9 Q3).

Template `ba-trieu.html`: điền các block `skill_slots`, `skill_controls`, `skill_help` theo mẫu `trung-trac.html`, dùng icon `ICON_SK_BT_*` (thêm vào `PORTRAITS`).

## 4. THAY ĐỔI ENGINE (`js/engine/` — kiểm hồi quy đủ theo rule `engine.md`)

| # | File | Thay đổi | Vì sao |
|---|---|---|---|
| E1 | `damage.js` | `hurtPlayer`: nếu `CHAPTER.skills?.blockHurt?.(reason)` trả `true` thì bỏ qua sát thương. Chương tự chạy hiệu ứng chặn | khiên mây tre |
| E2 | `player.js` (+ `state.js`) | `p.stun` (giây): còn > 0 thì bỏ qua phím di chuyển, nhảy, đánh, lướt; vẫn rơi theo trọng lực. Thêm `stunPlayer(time)` vào `damage.js` (qua E1, khiên chặn được) | tiền vàng gây choáng |
| E3 | `level-flow.js` / `render/index.js` | Rung màn hình: `state.cameraShake = { time, amp }`. Lúc vẽ cộng lệch ngẫu nhiên ±amp vào camera, giảm dần theo thời gian | voi dậm, đài sụp |
| E4 | `chapter.js` | Thêm chú thích hợp đồng cho `skills.blockHurt?` | — |

Trưng Trắc không dùng các trường mới, nên hành vi chương 1 phải giữ nguyên.

## 5. FILE

| File | Thay đổi |
|---|---|
| `js/levels/ba-trieu/level3.js` | viết lại: dựng đài, Lục Dận, 3 tháp; `battle` state; layout thử `?layout=skills` (bao cát + kỵ binh lặp, không boss) |
| `js/levels/ba-trieu/boss.js` (mới) | máy trạng thái GĐ 1–3, tên độc, tiền vàng, kỵ binh, đài sụp, cutscene, `updateBossHud`, `enemyKinds`, `debugEntities` |
| `js/levels/ba-trieu/skills.js` (mới) | 3 kỹ năng theo mục 3 |
| `js/levels/ba-trieu/render-extras.js` (mới) | vạch báo tên, đài + Lục Dận, FX choáng/khiên/chí mạng/tóe lửa, voi kỹ năng, cờ (`hooks.draw`) |
| `js/levels/ba-trieu/config.js` | `LEVEL_SPRITES[3]`, `PORTRAITS` (+chân dung Lục Dận, 3 icon), `MAP_PROPS_IN_GAME` (+cờ), `ARENA`/`LEVEL3_ZONES`/`LEVEL3_FAR_HILLS`, `BOSS_LD`, `GOLD_TOWER`, `ARMORED_CAVALRY`, `POISON_ARROWS`, `SKILLS`, hitbox đo từ strip; xoá `WAVES` nếu không còn dùng |
| `js/levels/ba-trieu/chapter.js` | màn 3: `update`, `cutscene`, `skills: true`, `testLayout: 'skills'`; chương: `skills`, `enemyKinds`, `hooks`, `stateFields` thêm `battle`, `poisonArrows`, `coins`, `elephant` |
| `js/levels/ba-trieu/dialogue-data.js` | `STORY_LUC_DAN_FALLS`, `STORY_BT_VICTORY`: nguyên văn §5.2 |
| `templates/gameplay/levels/ba-trieu.html` | khe kỹ năng + nút cảm ứng + trợ giúp |
| `js/engine/{damage,player,state,level-flow,chapter}.js`, `render/index.js` | E1–E4 |
| Asset: `manifest_bt.json`, `maps_bt.json` (nguồn + bản chạy) | chép 13 asset BT_ART_03 + FX/icon BT_ART_02 sang `frontend/static/assets/images/ba-trieu/`; status → `IN_GAME` sau khi chơi thử OK |
| `.claude/rules/ba-trieu-gameplay.md`, `engine.md` | mục màn 3, E1–E3 |

**Chỉ đọc:** `trung-trac/{level3,boss,skills,render-extras}.js`, `CODEX_PROMPT_BT_ART_03*.md`, `SPRITE_REPORT_BT_32.md` (số đo cho code).

## 6. TEST CASE

| # | Test | Mong đợi |
|---|---|---|
| T1 | Vào `/gameplay/levels/ba-trieu/3?debug=1` | nạp đủ sprite màn 3, không cảnh báo thiếu ID; nền chiến lũy + đài + 3 tháp |
| T2 | GĐ 1 | vạch báo hiện 0,7 s trước khi tên rơi; trúng tên −1 máu; trúng tiền thì choáng 1,2 s, có FX, không mất máu |
| T3 | Tháp vàng | 4 đòn thì `destroyed`; phá đủ 3 tháp sang GĐ 2 |
| T4 | GĐ 2 | chém kỵ binh: `blocked` + tóe lửa, không mất máu, có gợi ý; voi húc: `knockback` → `death`; 3 con thì sang GĐ 3 |
| T5 | GĐ 3 | đài `shake` → `collapse`, Lục Dận `fall` → `mud_idle`, chạm không mất máu; 8 máu (chí mạng −2) thì `flee` |
| T6 | Cutscene | 2 câu §5.2 nguyên văn, Bà Triệu cưỡi voi + cờ, rồi panel §5.3; tiến trình `level3Complete` |
| T7 | Kỹ năng | K chặn tên/tiền/kỵ binh trong 2,5 s, hồi chiêu 10 s; L hồi chiêu 14 s; chí mạng khoảng 25 % trên 200 đòn mô phỏng |
| T8 | Rung màn hình | voi chạy và đài sụp thì camera rung, hết rung thì camera về đúng vị trí |
| T9 | Hồi quy engine | Trưng Trắc 3 màn + `?layout=p2`, `?layout=skills`, `?viewer=1`; Bà Triệu màn 1 `?layout=engine`, màn 2 hội thoại NPC |
| T10 | `pytest tests` | không có FAIL mới (lỗi `nguyen-hue` của đồng đội có từ trước) |
| T11 | Chơi tay | người dùng chơi hết màn 3 |

## 7. NGOÀI PHẠM VI

- Nhạc riêng chương (chờ Gemini).
- Mở khoá thẻ Bà Triệu trên trang chủ.
- Thưởng vàng/thành tựu (đã có từ migration `006`).
- Dọn `docs/` sau khi xong chương.

## 8. RỦI RO

- Đấu trường 1 màn hình, nên voi lao và kỵ binh phi nhanh dễ khó nhìn. Tốc độ để `DESIGN_BASELINE`, chỉnh sau khi chơi thử.
- E2 (choáng) đụng vào điều khiển người chơi. Kiểm kỹ hồi quy lướt/nhảy ở chương 1.

## 9. CÂU HỎI CHỜ NGƯỜI DÙNG CHỐT

| # | Câu hỏi | Đề xuất |
|---|---|---|
| Q1 | Câu chữ mới chưa có trong BT-00: (a) thông báo đầu màn 3 thay "Màn 3: Chiến lũy Bồ Điền"? (b) "Không nhận vàng giặc!" khi trúng tiền; (c) "Giáp quá dày — hãy gọi Bạch Tượng (L)!"; (d) "Đài chỉ huy rung chuyển!" khi sang GĐ 3 | giữ (a) như §5.1; (b)–(d) như trên, team duyệt |
| Q2 | Thiếu phần thưởng Bạch Tượng (vào thẳng URL) thì sao? | `?debug=1` cấp đủ 3 kỹ năng; chơi thường thì `requireLevel` đã buộc qua màn 2 |
| Q3 | Dùng `NPC_BACH_TUONG.bow` ở đâu? | cutscene, trước câu §5.2 dòng 2 |
| Q4 | Engine E1–E3 có duyệt không? | duyệt (đều là trường tuỳ chọn, chương 1 không đổi) |
| Q5 | Số GĐ: 3 tháp × 4 máu, 3 kỵ binh, Lục Dận 8 máu | giữ, chỉnh sau chơi thử |
