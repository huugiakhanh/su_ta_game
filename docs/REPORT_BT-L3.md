# REPORT BT-L3 — Màn 3 "Chiến lũy Bồ Điền" (boss Lục Dận + 3 kỹ năng)

Task card: [SUTA_BT_TASK_L3_01.md](SUTA_BT_TASK_L3_01.md) • 28/10/2026 • **CHỜ CHƠI TAY** (T11). Mọi test mô phỏng PASS.

## Quyết định người dùng (28/10/2026)
- Duyệt task card, Q1–Q5 theo đề xuất:
  - câu chữ mới theo mục 9 (thông báo đầu màn giữ như §5.1);
  - `?debug=1` cấp đủ 3 kỹ năng;
  - `bow` của Bạch Tượng dùng trong cutscene;
  - thay đổi engine E1–E3;
  - thông số: 3 tháp × 4 máu, 3 kỵ binh, Lục Dận 8 máu.
- Gate C1 + C2 của `BT_ART_03` đã duyệt, gồm 3 bản vá:
  - FIX_LD: Lục Dận cầm kiếm tay ngoài;
  - FIX_C1: kỵ binh `death` và nền chiến lũy;
  - FIX_C2: khe trên tóc Bà Triệu cưỡi voi.
- Người dùng cho phép tên độc dùng 2 màu môi trường.

## File
| File | Thay đổi |
|---|---|
| `js/engine/damage.js` | E1: `hurtPlayer` hỏi `CHAPTER.skills.blockHurt(reason)`. E2: `stunPlayer(reason, time)` |
| `js/engine/player.js`, `state.js` | E2: `p.stun` — bỏ qua phím di chuyển/nhảy/lướt/đánh, vẫn rơi theo trọng lực. E3: `state.cameraShake` |
| `js/engine/level-flow.js`, `render/index.js` | E3: `shakeCamera(time, amp)`. Rung giảm dần, vẫn tắt dần cả khi đã thắng |
| `js/engine/chapter.js` | E4: chú thích hợp đồng cho `skills.blockHurt` |
| `js/levels/ba-trieu/config.js` | `LEVEL_SPRITES[3]`, `PORTRAITS` (+ chân dung Lục Dận + 3 icon), cờ vào `MAP_PROPS_IN_GAME`, `ARENA`/`LEVEL3_*`, `COMMAND_TOWER`, `BOSS_LD`, `POISON_ARROWS`, `GOLD_TOWER`, `GOLD_COIN`, `STUN_FX`, `ARMORED_CAVALRY`, `BOSS_TEXT`, `BT_CUTSCENE`, `SKILL_TEST`, `SKILLS`, `ENEMY_SPRITES` (goldTower / armoredCavalry / lucDan / dummy). Bỏ `WAVES` |
| `js/levels/ba-trieu/level3.js` | viết lại: tháp vàng, kỵ binh, Lục Dận trong bùn, bao cát, `battle` |
| `js/levels/ba-trieu/boss.js` (mới) | trận 3 giai đoạn, mưa tên độc, tiền vàng, kỵ binh, đài sụp, cutscene, `ENEMY_KINDS`, ô boss HUD |
| `js/levels/ba-trieu/skills.js` (mới) | `BT_SKILLS`: chí mạng, khiên mây tre, gọi Bạch Tượng |
| `js/levels/ba-trieu/render-extras.js` (mới) | lớp vẽ: đài + Lục Dận, tiền, tên + vạch báo, tóe lửa, chí mạng, choáng, khiên, voi, cutscene + cờ |
| `js/levels/ba-trieu/{chapter,audio-data,dialogue-data}.js` | màn 3: `update`/`cutscene`/`skills`/`testLayout`; hooks; 16 tiếng chiptune mới; `STORY_LUC_DAN_FALLS`, `STORY_BT_VICTORY` (nguyên văn §5.2) |
| `templates/gameplay/levels/ba-trieu.html` | khe kỹ năng K/L + ô buff, nút cảm ứng KHIÊN/VOI, dòng trợ giúp |
| `manifest_bt.json`, `maps_bt.json` (bản chạy) | chép nguyên bản nguồn: thêm 10 sprite + 2 map của BT_ART_03 (26 PNG). Status vẫn `NORMALIZED`, đổi sang `IN_GAME` sau khi chơi tay |
| `.claude/rules/engine.md`, `ba-trieu-gameplay.md` | E1–E3, mục màn 3 |

## Số đo asset dùng cho code (px logic, đo từ strip)
- **Tháp vàng:** thân ±20,5 × cao 83 → hitbox 36×80.
- **Kỵ binh thiết giáp:** −35…+44 × cao 44 → hitbox 64×40.
- **Lục Dận trong bùn:** −16…+10,5 × cao 31 → hitbox 24×30.
- **Voi kỹ năng:** ±49 × cao 54 → hộp húc 96×50.
- **Đài chỉ huy:** sàn cao 128, mép sàn ±19,5.
- **Điểm tiền rời tay:** (+21,5, −55,25), theo report Gate C2.

## Kết quả test (mô phỏng `update(1/60)` + ảnh chụp canvas)
| # | Test | Kết quả |
|---|---|---|
| T1 | Màn 3 nạp 3 nền + 12 sprite + 8 ảnh DOM, không cảnh báo thiếu ID | PASS |
| T2 | GĐ 1, người chơi đứng yên 10 s: mỗi loạt 3 tên có vạch báo, trúng 1 tên −1 máu, bị tiền làm choáng 4 lần (vòng choáng trên đầu), không mất máu | PASS |
| T3 | Mỗi tháp 4 đòn → `destroyed` (đống đổ nằm lại); phá đủ 3 tháp → GĐ 2. Ô HUD "Tháp vàng" giảm theo | PASS |
| T4 | Chém kỵ binh: `blocked`, 1 tóe lửa, hp giữ nguyên, hiện gợi ý "Giáp quá dày…". Voi húc: `knockback` → `fallen`. Đủ 3 lượt → GĐ 3 | PASS |
| T5 | Đài `shake` → `collapse`, Lục Dận `fall` từ sàn xuống bùn. Chạm Lục Dận không mất máu, bị đẩy lùi 10 px/đòn; 8 máu thì cutscene | PASS |
| T6 | Cutscene đi đủ các bước beaten → fadeOut → story1 → fadeIn (`bow`) → mount → ready → charge → victory → story2 → panel. 2 câu §5.2 và panel §5.3 đúng nguyên văn. Cờ cắm trên đống đổ đài | PASS |
| T7 | Khiên: chặn đòn và choáng (0 máu mất, không choáng), hết 2,5 s thì hồi chiêu 10 s. Voi: hồi chiêu 14 s, húc bao cát −2. Chí mạng: 2000 lần thử ra 24,7 %, đòn chí mạng −2 và có FX | PASS |
| T8 | Rung màn hình khi voi chạy / đài sụp / Lục Dận chạm đất, hết rung thì camera về đúng vị trí. Choáng: 30 frame không di chuyển/nhảy/đánh, hết choáng chạy lại bình thường | PASS |
| T9 | Hồi quy engine | PASS — chi tiết bên dưới |
| T10 | `pytest tests` | 93 passed, 1 skipped, **1 failed ngoài phạm vi**: `test_library_hero_pages_render` (ảnh `nguyen-hue`, commit đồng đội `cf4e71a`), như BT-L2 |
| T11 | Chơi tay hết màn 3 | **Chờ người dùng** |

Chi tiết T9:
- **Chạy được, không có lỗi JS:** Trưng Trắc màn 1/2/3, `?layout=p2`, `?layout=skills`; Bà Triệu `?layout=engine` và màn 2.
- **Trưng Trắc vẫn điều khiển bình thường:** chạy 43 px / 30 frame, nhảy vy −446, lướt và mưa tên được.
- **Cảnh báo sprite có sẵn từ trước:** Trưng Trắc màn 1/2 còn cảnh báo `PJ_OIL_JAR` / `FX_OIL_FIRE` / `PJ_ARROW_RAIN`. Nguồn là `trung-trac/render-extras.js`, file không sửa trong đợt này.
- **Lỗi cùng kiểu ở Bà Triệu đã sửa:** lớp vẽ màn 3 lúc đầu cũng gây cảnh báo ở màn 1/2. Đã thêm thoát sớm khi không có gì để vẽ, giờ Bà Triệu 3 màn đều 0 cảnh báo.

## Điều chỉnh khi chạy thử
- **Vị trí đài và tháp:** đài dời từ x 658 sang 618, 3 tháp đặt ở 240 / 365 / 490. Lý do: khung nhìn 567–640 px vẫn thấy đài khi người chơi tiến lên. Riêng khung nhìn hẹp (480) chỉ thấy Lục Dận khi người chơi vượt quá ~x 330 — **cần xem khi chơi tay**.
- **Cutscene:** người chơi được đưa về x 120 lúc màn hình tối, để voi không che người chơi.
- **Cờ chiến thắng:** cắm trên đống đổ đài, không cắm vào ụ đất trong nền. Lý do: nền là lớp parallax, ụ đất trong nền xê dịch theo camera.

## Sửa sau chơi tay (30/10/2026)
Người dùng chơi hết 3 màn và thấy ổn, trừ một chỗ: **cổng trại màn 1 không liền đất**.

- **Nguyên nhân:** đáy hình `PROP_BT_CAMP_GATE(_OPEN)` nằm ở hàng 174,5/176 logic, tức trống 1,5 px dưới chân cột. Cổng Luy Lâu của chương 1 thì chạm đúng hàng 176.
- **Cách sửa:** thêm `sink` vào `LEVEL.gate` (engine `render/entities.js` + chú thích hợp đồng trong `chapter.js`). Bà Triệu khai báo `FINISH_GATE.sink = 2`. Không co giãn ảnh.
- **Kiểm:** ảnh chụp canvas phóng to cho thấy chân cột chạm viền cỏ. Trưng Trắc không khai báo `sink` (= 0) nên không đổi.

## TODO
- T11 chơi tay. Đạt thì đổi status 13 asset BT_ART_03, cùng FX/icon/`bow`/`charge` của BT_ART_02, sang `IN_GAME`.
- Chỉnh số `DESIGN_BASELINE` sau chơi thử: nhịp tên, tiền, tốc độ kỵ binh, máu.
- Nhạc riêng chương (Gemini).
- Mở khoá thẻ Bà Triệu trên trang chủ.
- Dọn `docs/`: chuyển các task card/report BT xong vào archive, xoá các prompt Codex đã xong.
- Báo đồng đội lỗi test ảnh `nguyen-hue`.
