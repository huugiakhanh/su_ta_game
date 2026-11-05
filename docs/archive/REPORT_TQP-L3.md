# REPORT TQP-L3 — Màn 3 chương 4 "Đại phá Dương Sàn" (boss Dương Sàn + kỹ năng + cutscene)

Ngày: 05/11/2026. Yêu cầu người dùng: "Duyệt, làm luôn" — làm TQP-L3 theo task card [SUTA_TQP_TASK_L3_01.md](SUTA_TQP_TASK_L3_01.md), Q1–Q8 theo đề xuất.

## Hiện trạng trước khi sửa
- Màn 3 là khung TQP-SKELETON: đấu trường 1 chunk nền ngày mượn chương 3, 3 đợt lính tuần, hết quân thì thắng.
- Asset `TQP_ART_03` đã `IN_GAME` (commit 283939b) nhưng chưa khai báo trong `config.js`. Template chương chưa có ô kỹ năng. 3 phần thưởng màn 2 đã lưu trong tiến trình nhưng chưa có tác dụng.

## Quyết định (người dùng chốt 05/11)
- Q1: duyệt câu thông báo trận `BOSS_TEXT` (Claude soạn, không phải nội dung lịch sử).
- Q2: đấu trường **1 chunk** (TQP-00 ghi 2 chunk).
- Q3: mỏm đất đứng được sát dải sình làm bệ nhảy; GĐ 3 boss sa vào sình mép bờ sau mỗi cú cuồng nộ. Lý do: boss cao ~100, người chơi nhảy ~83, trong sình ~58.
- Q4: đoạn giữa đổi thành nước một lần lúc boss cuồng nộ; người chơi đứng giữa được đặt về bờ trái.
- Q5: số liệu DESIGN_BASELINE: boss 12 máu (3 lượt + kết liễu), lún 4 s / 3 s, gọi viện 10 s, tối đa 3 lính, bình máu 25 %, K hồi 12 s, L 6 s / hồi 10 s.
- Q6: cutscene §5.4 và panel kết §5.5 dùng **bản nháp, ghi chờ team**.
- Q7: Hiệu triệu không gây sát thương Dương Sàn nhưng ngắt cú lao.
- Q8: cutscene dùng chân dung Triệu Quang Phục cho cả 2 câu, không đưa NPC vào sân.

## File đã sửa / tạo
| File | Việc |
|---|---|
| `js/levels/trieu-quang-phuc/boss.js` (mới) | Trận 3 giai đoạn: Dương Sàn (`ENEMY_KINDS.duongSan`: đi, chém đao, lao, lún, gọi viện, cuồng nộ), giáp chặn + bổ gáy, chuyển GĐ 3 (mỏm vỡ, đổi địa hình thành nước, 3 thuyền), sóng đất, cutscene, ô boss HUD, `dropHeal` |
| `js/levels/trieu-quang-phuc/skills.js` (mới) | `TQP_SKILLS`: Thể lực cường tráng (`bonusHealth` +2), Hiệu triệu (K), Móng Rồng (L, `clawActive()`) |
| `js/levels/trieu-quang-phuc/level3.js` | Thay khung: dựng địa hình 2 dải sình, 2 mỏm đất (hazard `prop` có `ride`), Dương Sàn, `battle`; hàm dựng lính đánh thuê, cung thủ, thuyền; layout `?layout=skills` |
| `js/levels/trieu-quang-phuc/config.js` | `ARENA`, `LEVEL3_*` (vùng đêm, đồi xa, địa hình, tiles), `MOUNDS`, `CANOES`, `TORCHES`, `BOSS`, `SLAM`, `REINFORCE`, `HEAL_DROP`, `SPARK`, `NAPE_GLOW`, `TORCH`, `SKILLS`, `SKILL_TEST`, `TQP_CUTSCENE`, `BOSS_TEXT`; `LEVEL_SPRITES[3]`, `PORTRAITS` (+ chân dung Dương Sàn, 3 icon); sprite `mercenary`, `duongSan`, hazard `dirtMound`, `canoe`. Bỏ `WAVES` của khung |
| `js/levels/trieu-quang-phuc/chapter.js` | Gắn `skills`, `enemyKinds`, hooks (`dropHeal`, `updateHud`, `debugEntities`), level 3 `update`/`cutscene`/`farHills`/`tiles`/`testLayout`/`skills: true`; `stateFields` + `battle` |
| `js/levels/trieu-quang-phuc/render-extras.js` | `drawLevel3`: gáy sáng, tóe lửa, Móng Rồng trúng gáy, sóng đất, Hiệu triệu, Móng Rồng trên kiếm (`hold` chỉ khi đứng yên), đuốc tiền cảnh, màn tối cutscene |
| `js/levels/trieu-quang-phuc/dialogue-data.js` | `STORY_TQP_FINISH`, `STORY_TQP_VICTORY` (§5.4), `CHAPTER_END` (§5.5) — bản nháp, ghi chờ team |
| `js/levels/trieu-quang-phuc/audio-data.js` | 14 tiếng chiptune boss + kỹ năng |
| `templates/gameplay/levels/trieu-quang-phuc.html` | Ô kỹ năng HUD, nút cảm ứng HIỆU/RỒNG, dòng trợ giúp K/L |
| `.claude/rules/trieu-quang-phuc-gameplay.md`, `docs/SUTA_TQP_TASK_00.md`, `docs/SUTA_TQP_TASK_L3_01.md` | Trạng thái màn 3, lộ trình |

Không sửa engine, không sửa file chương 1–3.

Thay đổi nhỏ ngoài task card:
- Cung thủ có tầm bắn **260** thay vì cả đấu trường. Lý do: tên của engine chỉ bay tối đa 276 px (`PROJECTILE_MAX_RANGE`), không sửa engine. Cung thủ đứng mép khống chế phía đó.
- Mỏm đất và thuyền là hazard `prop` có `ride` (giống voi rừng chương 2), không phải bục `makePlatform`. Lý do: bục không có ảnh map thì engine vẽ khối gỗ dự phòng; hazard có `ride` được engine tự vẽ sprite và tự gắn bục.
- Thuyền đứng yên theo chiều ngang. Nhấp nhô ±1 logic chỉ có trong ảnh; bục giữ hàng 9 (chân người chơi lệch tối đa 1 px).
- Cú lao chỉ làm boss lún khi boss **đi vào** sình trong lúc lao. Lao từ trong sình ra (vừa thoát lún) không bị lún lại ngay.

## Kết quả test
- `pytest tests`: 120 passed, 1 skipped — PASS (`test_app.py` skip vì thiếu `SUTA_TEST_DATABASE_URL`, test DB **chưa chạy**).
- T1: nền trại Lương đêm, 3 đuốc tiền cảnh, boss chân ở GROUND_Y (y 148 + h 100 = 248), 7 tim, 3 ô kỹ năng có icon, console 0 lỗi, không hộp tạm — PASS (chụp màn hình).
- T2: chém ngang khi boss đứng → máu 9 → 9, 1 tóe lửa; bổ khi không lún bị chặn — PASS.
- T3: mô phỏng 12 s, người chơi đứng x 109: boss đi → lao (2,93 s) → lún ở dải sình trái (4,25 s, hitbox h 70) → hết 4 s `hurt` → gọi viện → chém trúng (máu 7 → 6). Bổ từ mỏm (3 cách giữ phím) trúng gáy: Móng Rồng 12 → 9, lượt 1 → 2, boss thoát lún; không Móng Rồng 12 → 11. Gáy sáng đúng sau mũ (chụp phóng to) — PASS.
- T4: gọi viện lượt 3 ra 2 lính đánh thuê + 1 cung thủ ở mép xa người chơi; cung thủ bắn trúng người đứng trong tầm (−2 máu / 6 s). Bình máu đo 400 lần: 25,5 %; boss không rơi — PASS.
- T5: bổ gáy ở lượt cuối → `rage` 0,67 s → đầm vỡ: `state.holes` = nước 176–592 (w 416), sình 592–656, 2 mỏm biến mất, 3 thuyền + 3 bục (y 237 = GROUND_Y − 11), người chơi về x 96, boss về x 704. Vòng GĐ 3: rage → sóng đất 14 frame (người chơi trên thuyền không mất máu) → lội vào sình x 624 → lún; nhảy từ thuyền 3 bổ gáy → máu 3 → 0 → cutscene — PASS.
- T6: cutscene beaten (0,58 s) → death → câu 1 → tối/sáng → câu 2 → panel. Chữ khớp TQP-00 §5.4/§5.5 (đọc từ DOM). Tiến trình ghi `level3Complete: true` — PASS. Thành tựu chương: **CHƯA CHẠY** (lượt `?debug=1` không gửi kỷ lục).
- T7: 7 tim với Thể lực cường tráng; K hạ 2 lính trong bán kính, không chạm lính cách 120 px, không trừ máu boss, ngắt cú lao (boss `rest`), hồi 12 s; L bật 6 s, hồi 10 s, `hold` vẽ dọc lưỡi kiếm khi đứng yên — PASS. Nút cảm ứng: **CHƯA KIỂM** trên máy cảm ứng.
- T8: `?layout=skills`: boss lún mãi (h 70, máu 12 giữ nguyên), 2 lính đánh thuê lặp, ô boss ẩn, đủ 3 phần thưởng — PASS. Đường không có Móng Rồng: bổ gáy −1 (đã thử bằng `claw.left = 0`) — PASS; chưa chơi trọn một lượt không phần thưởng.
- T9: bot hồi quy 12 màn (4 chương, 2400 frame mỗi màn, giữ phải + nhảy + đánh): **12/12 màn 0 lỗi JS** — PASS. Hạn chế: màn 1 của cả 4 chương đứng ở x 84 vì bot không đóng hộp thoại NPC dẫn đầu màn, nên ở 4 màn này bot chỉ kiểm phần nạp. Cỡ 812×375 (ngang điện thoại): tim, 4 ô kỹ năng, ô boss không chồng nhau — PASS. Nút cảm ứng HIỆU/RỒNG chỉ hiện trên máy `pointer: coarse` — **CHƯA KIỂM** trên máy thật.
- T10: người dùng chơi tay 05/11 — lần 1 phát hiện 2 lỗi (mục dưới); chơi lại sau khi sửa mỏm đất + chép ảnh sửa màu: **"Đã ổn"** — PASS. Thời gian chơi không ghi.

## Chơi thử lần 1 (người dùng, 05/11/2026)
- **Mỏm đất đi ngang xuyên qua được** (bục `ride` là bục một chiều). Đã sửa trong `boss.js` `blockMounds()`: thân mỏm dưới mặt quá 4 px đẩy người chơi ra mép gần nhất, không mất máu (như vật cản `blocking` của engine — vật cản tĩnh engine vẽ bằng ảnh map nên không dùng cho sprite mỏm). Đo lại: đi bộ và lướt từ trái dừng ở x 242 (mép mỏm 242), đi từ phải dừng ở 296 (mép 296), nhảy lên đứng trên mặt (chân y 220), đi trên mặt không bị đẩy — PASS. Dương Sàn vẫn lao xuyên qua mỏm (cố ý).
- **Màu quần áo khác nhau giữa các animation** của `BOSS_DUONG_SAN` và `EN_LUONG_MERCENARY` — lỗi asset, xem mục "Vấn đề asset". Người dùng chốt: màu chuẩn là `idle` của từng asset.

## Vấn đề asset
- `BOSS_DUONG_SAN`: `NEED_REDRAW` (chỉ màu) `walk`, `charge`, `attack_01` — tay áo, quần, dải đai đỏ tươi (pixel đỏ 5,4–7,8 %) trong khi `idle` và 6 animation Gate C2 nâu gỉ (0,6–2,3 %).
- `EN_LUONG_MERCENARY`: `NEED_REDRAW` (chỉ màu) `walk`, `attack_01`, `hurt`, `death` — áo xám giảm 47 % → 24 %, nâu ấm tăng 22 % → 51 % từ `idle` tới `death` (hurt/death đổi hẳn sang áo nâu vàng + quần vàng đất).
- Giao Codex: `CODEX_PROMPT_TQP_ART_03_FIX_COLOR.md` (đã xoá sau khi duyệt). Ở Gate C1/C2, Claude chỉ so **bộ màu** (trùng 100 %) mà không so màu **từng vùng** giữa các animation nên đã bỏ sót — lần sau soát thêm contact sheet ô 1 mọi animation xếp cạnh nhau.
- **Gate FIX-COLOR soát 05/11, người dùng duyệt, đã chép vào game** (7 strip + manifest, 2 ID `IN_GAME`; server trả đúng file mới — số byte khớp): Codex chỉ đổi RGB theo mặt nạ vùng quần áo, không sinh lại ảnh.
  - Cả 2 asset: cỡ ảnh, alpha 0/255, baseline (boss 507, lính 187), số màu (40 / 32) giữ nguyên; số pixel đổi alpha = 0. Các strip không thuộc diện sửa (boss idle + 6 animation C2, lính idle) trùng từng byte bản trong game.
  - `BOSS_DUONG_SAN` walk / charge / attack_01: pixel đỏ tươi (ngưỡng RGB của Claude) 5,4 / 7,8 / 7,3 % → 0,7 / 1,0 / 0,8 % (idle 0,6 %). Tay áo, quần nâu gỉ như idle; dải đai bay giữ hình, đổi đỏ sẫm → **PASS**.
  - `EN_LUONG_MERCENARY` walk / attack_01 / hurt / death: xám 41,5 / 36,3 / 26,5 / 24,1 % → 41,5 / 36,3 / 39,7 / 38,4 % (idle 47,3 %); nâu ấm 25,8 / 29,3 / 40,3 / 51,1 % → 22,4 / 28,2 / 32,1 / 37,4 % (idle 22,4 %). Xếp cạnh nhau: áo xám + quần nâu đỏ như idle; phần nâu ấm dư ở hurt/death là giáp da, khiên, da lộ khi ngã → **PASS**.
  - Codex ghi chú: số đo trong prompt dùng ngưỡng RGB của Claude nên Codex không tái lập được; Codex đo lại bằng nhóm mã màu công bố trong `meta/fix_color/validation.json`. Lần sau prompt ghi rõ cách đo.

## Câu hỏi cho team / TODO
- TQP-00 §5.4 câu 1 ("Triệu Quang Phục tung đòn kết liễu") lệch Toàn thư (Dương Sàn "chống đánh, thua rồi chết"). §5.4–5.5 vẫn là bản nháp, chờ team.
- Không có Móng Rồng thì GĐ 3 cần 3 cú bổ trong 3 s lún — khó. Chỉ xảy ra khi vào thẳng màn 3 bằng URL thử; chỉnh sau chơi thử nếu cần.
- Số liệu DESIGN_BASELINE (§2–3 task card) chỉnh sau chơi tay.
- Nhạc riêng chương 4 vẫn mượn chương 3 (`TODO_MISSING`).
