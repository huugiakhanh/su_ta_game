# REPORT PH-ENGINE — Cơ chế chung mới cho chương 6

Ngày: 09/11/2026 • **PASS** (chưa chơi tay; test chạy bằng `update(1/60)` + giả lập phím trên trình duyệt thật)
Task card: [SUTA_PH_TASK_ENGINE_01.md](SUTA_PH_TASK_ENGINE_01.md). Yêu cầu người dùng: làm 6 cơ chế engine cho chương Phùng Hưng theo task card đã duyệt.

## Hiện trạng / đo trước khi sửa
- `pytest tests`: 149 passed, 1 skipped (sau PH-SKELETON).
- Engine chưa có đòn gồng, cưỡi, đẩy vật, mồi nhử, hố chông, vật phẩm phụ.

## Quyết định (người dùng chốt, 09/11/2026, theo đề xuất)
- Q1: nhấn vẫn chém ngay, giữ 0,7 s rồi thả thì ra đòn gồng; đang tích đi chậm ×0,6; nhảy, lướt, trúng đòn thì huỷ.
- Q2: trâu tự lao 5 s theo hướng mặt, chỉ nhảy được, miễn mọi sát thương, húc hạ lính; gặp mép hố hoặc vật chặn thì xuống.
- Q3: đi sát rồi đi tiếp là đẩy, ×0,45, không kéo; dừng ở mép hố và bậc đất.
- Q4: bù nhìn đặt sẵn; hổ vồ trúng thì khựng 2 s, chỉ lúc đó chịu đòn; bù nhìn dựng lại sau 4 s.
- Q5: layout thử mượn sprite chương 5; bù nhìn, chông, vũ khí vẽ hộp dự phòng.

## File đã sửa / tạo
| File | Việc |
|---|---|
| `js/engine/config.js` | `CHARGE`, `MOUNT_AWAY_TIME`, animation `charge`, `chargeStrike`, `ride` có `fallback` |
| `js/engine/player.js` | E1 tích lực + đòn gồng; E2 cưỡi, húc, xuống; E3 đẩy vật |
| `js/engine/combat.js` | `chargeOnly`; `revealCarriedItems` gồm vật phụ |
| `js/engine/damage.js` | Miễn sát thương khi cưỡi; hào chông về `safeSpot`, câu riêng |
| `js/engine/hazards.js` | E4 mồi nhử, trạng thái `stuck`, cờ `stuckOnly` |
| `js/engine/geometry.js` | Cột `'^'`, `hole.spikes` |
| `js/engine/entities.js` | `makeExtra`, `makeDecoy`, `makeNpc` nhận `extras` |
| `js/engine/state.js` | `npcLocked`, trường mới |
| `js/engine/level-flow.js`, `ui.js`, `templates/gameplay/base.html` | Nhặt vật phụ, khoá NPC, ô HUD phụ |
| `js/engine/render/{index,entities,player,terrain,debug}.js` | Vẽ trâu, mồi, vật phụ, hào chông, vầng sáng gồng, hộp F2 |
| `js/engine/chapter.js`, `.claude/rules/engine.md` | Hợp đồng + mô tả |
| `js/levels/phung-hung/{chapter,config,level1}.js` | Bật `charge`, `extraItems`, layout thử, câu `TEXT` mới |
| `.claude/rules/phung-hung-gameplay.md`, `docs/SUTA_PH_TASK_{00,ENGINE_01}.md` | Ghi lại |

Không sửa file nào trong `js/levels/` của chương 1–5.

Thay đổi nhỏ so với task card:
- Không cần sửa `input.js` (đã ghi trong task card).
- Không thêm tiếng `chargeReady`; dùng lại `skillReady` có sẵn.
- `CHARGE` có thêm `delay: .15` để bấm nhanh không bị đi chậm.
- `css/game/game.css` không cần sửa: ô HUD phụ dùng lại class `status-bar__items`.

**Câu `TEXT` kỹ thuật mới:** "Đòn thường bị gạt! Giữ J rồi thả để tung đòn gồng.", "Bạn rơi xuống hào chông và mất 1 máu.", câu khoá NPC, "Đã thu phục trâu mộng!".

**Không phải do phiên này:** 3 file `docs/SUTA_TQP_TASK_*` vẫn đang ở trạng thái bị xoá.

## Kết quả test
| # | Test | Kết quả |
|---|---|---|
| G1 | `pytest tests` | PASS — 149 passed, 1 skipped (`test_app.py` thiếu `SUTA_TEST_DATABASE_URL`) |
| G2 | Đòn gồng | PASS — bấm nhanh `attackCooldown` 0,36 như cũ; giữ 0,5 s rồi thả không ra đòn; đủ lực sau 42 frame = 0,70 s; đòn gồng −3 (6 → 3); đi 168 → 100,8 px/s; nhảy, lướt, trúng đòn đều huỷ và phải thả phím mới tích lại. Lính khiên: đòn thường 6 → 6 + câu nhắc. Nút ĐÁNH cảm ứng giữ được |
| G3 | Cưỡi | PASS — đòn thường không thu phục; đòn gồng thu phục; 300 px/s; 5,02 s; Đánh và Lướt bị bỏ, nhảy được; máu 5 → 5; hạ hết lính, rào 3 máu đổ; boss 6 → 6; gặp mép hố dừng cách 8 px, không rơi; gặp xe chặn thì xuống sát mép; trâu không thu phục tự đi mất, màn vẫn chạy |
| G4 | Đẩy xe | PASS — 75,6 px/s (= 168 × 0,45); xe đứng yên khi không đẩy; không kéo được; đẩy được chiều trái; dừng ở mép hố (2846,8 so với 2848) và bậc đất (2783,5 so với 2784); hook trả `true` không trừ máu, không hook thì hạ lính; đứng lên và nhảy qua được |
| G5 | Mồi nhử | PASS — hổ vồ bù nhìn gần nhất (1248), khựng 2 s, bù nhìn đổ rồi dựng lại; ngoài lúc khựng đòn gồng 9 → 9; lúc khựng đòn thường 9 → 9, đòn gồng 9 → 6; hết mồi thì vồ người chơi |
| G6 | Hào chông | PASS — nhảy chạy xa 115 px, không qua hào 160 px: −1 máu, về `safeSpot` cách mép 20 px, đúng câu; nhảy + lướt 198 px qua được, không mất máu. Hố thường về 2376 (đúng chunk +72); khe sông về chỗ đứng vững như cũ |
| G7 | Vật phụ | PASS — thiếu cả hai, chỉ có vũ khí, chỉ có sách đều bị giữ ở 4388, chưa gặp; đủ cả hai thì gặp; HUD 0/1 → 1/1; `#extraHud` ẩn ở cả 23 URL của G9 |
| G8 | F2, viewer | PASS — bật F2 không lỗi console; `?viewer=1` chạy. Console chỉ có 401 của khách, cảnh báo `stage_length` và NPC hộp chưa có thoại |
| G9 | Hồi quy | PASS — 23 URL đúng danh sách task card (3 màn Trưng Trắc + `p2` + `skills`; màn 1 Bà Triệu + `engine`; màn 1 Lý Nam Đế + `engine` + `skills`; 3 màn và 2 layout của chương 4, chương 5; 3 màn khung chương 6): mỗi URL chạy ~1000 frame vừa đi vừa đánh, nhảy, lướt; 0 ngoại lệ, 0 request lỗi; giữ J ở chương 1–5 `chargeTime` = 0. Riêng: chương 5 xe `blocking` đứng yên, hổ `recover` vẫn chém được (3 → 2); chương 4 giáo dài gạt đòn thường, đòn bổ vẫn trúng |
| G10 | Giao diện | PASS — 1366×768: canvas 1362×655, ô phụ x 197–245 không chồng ô sách (139–187) và ô kỹ năng; 812×375: canvas 523×221, ô phụ 304–345 không chồng; không thanh cuộn |

**Giới hạn:** các phép đo dùng mô phỏng, người chơi được đặt thẳng tới vị trí. Chưa chơi tay nên cảm giác nhịp gồng, độ khó, tốc độ trâu chưa đánh giá. Hình của trâu, xe muối, bù nhìn, chông, vũ khí vẫn là tạm.

## Vấn đề asset
Không có. Đợt `PH_ART_01` cần vẽ thêm: `charge_hold`, `charge_strike`, `ride` cho `PLAYER_MALE`/`PLAYER_FEMALE`; `stuck` cho `EN_TIGER`.

## Câu hỏi cho team / TODO
- Số `CHARGE`, tốc độ cưỡi, đẩy, `stuckTime` là `DESIGN_BASELINE`, cần chơi thử.
- Độ rộng hào ở PH-L1 phải nằm giữa 115 và 198 px.
- Tiếp theo: prompt Codex `PH_ART_01` rồi PH-L1.
