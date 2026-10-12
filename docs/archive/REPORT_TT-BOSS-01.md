# REPORT TT-BOSS-01 — Màn 3 "Trận Luy Lâu"

Task card: [SUTA_TT_TASK_BOSS_01.md](SUTA_TT_TASK_BOSS_01.md) · Kế hoạch + quyết định Q1–Q6: [BOSS_PLAN_TT.md](BOSS_PLAN_TT.md)

## Phase A — 26/09/2026

**Trạng thái: PASS (mô phỏng) — chờ người chơi thử duyệt.** Chưa có boss: màn 3 thường hiện là đấu trường trống (Phase B thêm chiến xa), nên chưa thắng được màn 3.

### File đã sửa (file | mục đích)
| File | Mục đích |
|---|---|
| `backend/routes/pages.py` | Route `/gameplay/levels/trung-trac/3` render `trung-trac.html` (`level_id=3`) thay trang giữ chỗ; template + `placeholder.js` giữ nguyên, ngừng dùng |
| `frontend/static/js/levels/trung-trac/config.js` | `ARENA`, `LEVEL3_ZONES`, `LEVELS[3]` (`arena: true`, cổng tại 672), `OBSTACLE_TYPES.stonePillar` (`blocking`), `ENEMY_SPRITES.rusher`/`dummy`, `RUSHER`, `SKILLS`, `ARROW_RAIN_SPRITE`, `SKILL_TEST`; thêm `EN_HAN_RUSHER`, `PJ_ARROW_RAIN` vào `SPRITE_8BIT_IN_GAME` |
| `.../state.js` | `level3Content()` (2 cột đá, layout thử `skills`), `makeEnemy()` nhận `patrolMin/patrolMax/aggroRange`, `makeArenaGuard()`, `makeRusher()`, bao cát, `createSkillState()`, `enemyArtKey()`; người chơi bắt đầu ở x = 60 |
| `.../physics.js` | Tường 0/768, cột đá chặn không trừ máu (Q1), quân cảm tử `updateRusher()`, gộp cú đâm lính canh + cảm tử thành `advanceMeleeAttack()` (hành vi lính canh giữ nguyên), `strikeEnemy()`/`strikeHazard()` dùng chung, 3 phần thưởng (`updateSkills`), bộ sinh quân theo nhóm (`updateSpawner`), camera màn 3 neo tâm người chơi, nút "Đánh lại" khi thua màn 3 |
| `.../render.js` | Cột đá vẽ theo ô trạng thái (`frame_states`), cổng màn 3 đóng (`state.gateOpen`), vẽ theo `enemyArtKey` (quân cảm tử, bao cát = hộp tạm), bóng Trưng Nhị (ánh chàm, alpha .5), mũi tên mưa; ẩn ô "chunk" ở đấu trường |
| `.../input.js` | K = Mưa tên, L = Bóng Trưng Nhị; **bỏ K khỏi dash ở mọi màn** (Q3) |
| `.../ui.js` | HUD kỹ năng: chân dung theo manifest, lớp phủ hồi chiêu, số giây; chỉ hiện phần thưởng đã có (ô HUD, dòng trợ giúp, nút cảm ứng); ẩn thanh tiến độ ở đấu trường |
| `.../main.js` | Thông báo đầu màn §5.1 (nguyên văn), `?layout=skills` (chỉ màn 3), truyền `rewards` từ tiến trình |
| `frontend/templates/gameplay/levels/trung-trac.html` | `#skillBar` (3 ô), dòng trợ giúp K/L, 2 nút cảm ứng TÊN/BÓNG cạnh ĐÁNH — mặc định `hidden` |
| `frontend/static/css/levels/trung-trac.css` | Kiểu ô kỹ năng + nút cảm ứng kỹ năng |

Không sửa: `geometry.js` (cờ `blocking`/`state` của cột gán ở `state.js`), `progress.js`, `dialogue*.js`, asset, manifest.

### Hằng số mới (tên | giá trị | DESIGN_BASELINE)
| Tên | Giá trị |
|---|---|
| `ARENA` | width 768, gateX 672, pillars [250, 450], pillar 24×48, playerStartX 60, spawnX 700 |
| `RUSHER` | 1 máu, 22×40, 90 px/s, attackRange 12, attackReach 12, attackBoxY 26 / H 8, rest 1,0 s |
| `SKILLS.BUFF_Y_CHI_KIEN_CUONG` | calmTime 3 s, cooldown 20 s |
| `SKILLS.SK_LE_CHAN_ARROW_RAIN` | cooldown 12 s, vùng 160 px cách 24 px, 10 mũi trong 0,8 s, jitter ±5 px, rơi 420 px/s, lính ≤ 2 / boss ≤ 1 mũi mỗi lần |
| `SKILLS.SK_TRUNG_NHI_SHADOW` | 8 s, cooldown 20 s (từ lúc hết), gap 20 px, trễ 0,15 s, alpha .5, tint `rgba(58,64,190,.55)` |
| `ARROW_RAIN_SPRITE` | hitbox 4×10 ở đầu mũi |
| `SKILL_TEST` | nhóm 3 cảm tử (0 / .6 / 1,2 s) → nhóm 2 lính canh, gap 1,5 s, lặp; bao cát 99 máu ở x = 380 (đổi thứ tự theo yêu cầu người chơi thử 26/09) |

Tất cả là DESIGN_BASELINE.

### Kết quả test (test | PASS/FAIL | mô phỏng/thật | ghi chú)
Mô phỏng = gọi `update(1/60)` trực tiếp trong trình duyệt (pane không chạy `requestAnimationFrame` khi đang chạy script) + chụp màn hình thật. **Cần người chơi thử thật.**

| Test | Kết quả | Cách test | Ghi chú |
|---|---|---|---|
| Vào màn 3 bằng `?debug=1` | PASS | thật | đủ 3 phần thưởng |
| Vào màn 3 từ tiến trình màn 2 (không debug) | PASS | mô phỏng | đặt `sessionStorage` `level2Complete` + 1 phần thưởng → điểm 4321 mang sang, chỉ hiện ô Mưa tên + nút TÊN |
| Cảnh Z5, cổng đóng, 2 cột đá | PASS | thật (ảnh) | cổng 576–768, cột ở 238–262 / 438–462 |
| Cột đá chặn, không mất máu; đứng lên được | PASS | mô phỏng | bị chặn tại x = 213 / 413 / 262, máu 5; đứng trên cột chân = 200 |
| Tường 0 / 768 | PASS | mô phỏng | x = 0 và x + w = 768 |
| Camera kẹp ở 480 / 561 / 640 | PASS | mô phỏng | max 288 / 207 / 128 |
| Thua → "Đánh lại" → máu đầy, điểm đúng | PASS | mô phỏng | nút đổi thành "Đánh lại", máu 5, điểm = số mang sang (debug = 0) |
| K/L/buff chỉ hoạt động khi có phần thưởng | PASS | mô phỏng | không có phần thưởng: K/L không tác dụng, thanh kỹ năng + dòng trợ giúp ẩn |
| Mưa tên hạ cảm tử trong vùng | PASS | mô phỏng | 2/3 cảm tử trong vùng chết; con thứ 3 vào vùng sau khi mưa đã rơi |
| Bao cát mất tối đa 2 đòn mỗi lần | PASS | mô phỏng | lần 1: −2, lần 2: −4 tổng |
| Hồi chiêu mưa tên chặn bấm lại | PASS | mô phỏng | bấm K trong lúc hồi chiêu: 0 mũi |
| Có bóng: lính canh 2 máu chết sau 1 cú; không bóng: 2 cú | PASS | mô phỏng | |
| Bóng hết 8 s → hồi chiêu 20 s | PASS | mô phỏng | |
| Buff: 1 máu, 3 s không trúng đòn → +1; hồi chiêu 20 s | PASS | mô phỏng | 2,9 s: 1 máu; 3,1 s: 2 máu; hồi chiêu chặn lần hồi thứ 2 |
| HUD hồi chiêu đúng giây | PASS | mô phỏng | số giây = làm tròn lên thời gian còn lại |
| Quân cảm tử: tiến tới, đâm ở ô 2, nghỉ 1 s; dash né được; chạm tường quay đầu | PASS | mô phỏng | đâm khi còn cách 12 px, −1 máu; dash giữa lúc đâm: không mất máu |
| Hồi quy màn 1 / màn 2 | PASS | mô phỏng | màn 1 chạy 20 s (lính canh dùng hàm đâm mới), màn 2 mở hội thoại Thi Sách; K không còn dash, Shift vẫn dash; không lỗi console |
| Hồi quy chơi 1 → 2 → 3 một lượt | CHƯA CHẠY THẬT | — | cần người chơi thử |
| `pytest tests` | SKIP | thật | thiếu `SUTA_TEST_DATABASE_URL` (test `/3` → 200 vẫn áp dụng khi có DB) |

### Cảm nhận độ khó
Chưa có boss nên chưa đo. Ghi nhận: cảm tử 90 px/s chậm hơn người chơi (168) nên dễ nhảy/lướt qua.

### Vấn đề asset
- `EN_HAN_RUSHER.attack_01`: tư thế lao thấp (cao ~22 px so với `run` ~36 px) và mũi giáo chỉ vươn ~4 px qua mép hitbox, trong khi card đặt tầm đâm 12 px → tầm đâm dùng số của card, dải dọc đo theo strip (hàng 34–36). Chưa cần vẽ lại; nếu người thử thấy "bị đâm từ xa" thì đề xuất `NORMALIZE`.
- Bao cát không có asset → hộp tạm (chỉ layout thử, không cần vẽ).
- `PROP_STONE_PILLAR` status vẫn `NORMALIZED`, `EN_HAN_RUSHER`/`PJ_ARROW_RAIN` vẫn `QA_PASS` — đổi `IN_GAME` sau Phase C theo gate §4.

### Câu hỏi cho team
1. **Hướng chạy quân cảm tử**: đang chọn hướng về phía người chơi khi xuất hiện và sau mỗi lần nghỉ, rồi giữ hướng tới khi chạm tường (nên nhảy qua được, đúng kiểu "cảm tử"). Nếu muốn cảm tử quay lại ngay khi bị vượt qua thì báo.
2. **Cảm tử đứng xuyên trong cột đá (Q2)**: người chơi bị cột chặn ngay cạnh một con cảm tử đang đứng trong cột thì dash không thoát được và vẫn bị chạm thân. Chấp nhận, hay cho dash xuyên cột?
3. **Vị trí HUD kỹ năng**: đặt nổi ở góc trên-trái khung chơi (không đổi lưới HUD), ở 480 px vẫn đủ chỗ. Ở màn hình ngang điện thoại, nút cảm ứng TÊN/BÓNG (48 px) nằm cạnh ĐÁNH, vừa một hàng.
4. Thông báo khi buff hồi máu dùng tên phần thưởng: "Ý chí kiên cường: hồi 1 máu." — không có trong mục 5 của card; cần câu chữ khác thì báo.

## Phase B — 26/09/2026

**Trạng thái: PASS (mô phỏng) — chờ người chơi thử duyệt.** Màn 3 thường (`/3`, `/3?debug=1`) giờ có chiến xa → 3 đợt thân binh → thông báo giai đoạn 3. Giai đoạn 3, cutscene và kết chương thuộc Phase C: tới giai đoạn 3 thì trận đứng yên (chưa thắng được).

### File đã sửa (file | mục đích)
| File | Mục đích |
|---|---|
| `frontend/static/js/levels/trung-trac/config.js` | `ENEMY_SPRITES.boss` đủ 6 animation chiến xa, `ENEMY_SPRITES.bossFoot`, `BOSS_TD`, `WAVES`, `BOSS_TEXT` (mục 5.2 nguyên văn); thêm `BOSS_TO_DINH_FOOT`, `PJ_OIL_JAR`, `FX_OIL_FIRE` vào `SPRITE_8BIT_IN_GAME` |
| `.../state.js` | `makeChariot()`, `makeSpawner()` (dùng chung layout thử + đợt quân), `state.battle` (giai đoạn, xác xe, Tô Định đứng, hẹn giờ gợi ý), `state.jars`, `state.fires` |
| `.../physics.js` | Máy trạng thái chiến xa (`updateChariot`), hũ dầu vòng cung + chém phản (`updateJars`, `reflectJar`), lửa (`updateFires`), cột nứt/vỡ/mờ (`hitPillar`, `updatePillars`), `loseShield`, gợi ý "Khiên quá dày!", tiến trình trận (`updateBattle`), đứng trên cột thì xe không tính va chạm (`p.standingOn`), **dash xuyên xe** (kéo dài cú lướt khi còn chồng thân xe), spawner có `done` |
| `.../render.js` | Chiến xa rung 1 px khi báo trước, xác xe, Tô Định đứng sau xác xe, hũ dầu, lửa; ô F2 hiện chế độ + số khiên |
| `.../ui.js` | HUD trận: "Khiên" 3 nấc (giai đoạn 1) / "Đợt N/3" (giai đoạn 2) |
| `frontend/templates/gameplay/levels/trung-trac.html`, `frontend/static/css/levels/trung-trac.css` | Khung `#bossHud` (góc trên-phải khung chơi) |

Không sửa `geometry.js` (hũ dầu là danh sách riêng `state.jars`, không đổi `makeProjectile`).

**Thay đổi không do Claude làm trong lúc Phase B:** `EN_HAN_RUSHER.attack_01`/`death` được vẽ lại, `manifest_tt.json` cập nhật `qa_notes`, `RUSHER.attackBoxY` đổi 26 → 20 theo strip mới, thêm `tools/finalize_en_han_rusher_redraw.py`. Tôi đã kiểm lại strip: lưỡi đao ô 2 nằm ở hàng 26–29, khớp số mới. Không đụng tới.

### Hằng số mới (tên | giá trị | DESIGN_BASELINE)
| Tên | Giá trị |
|---|---|
| `BOSS_TD` | startX 600, 90×80, khiên 3, startDelay 1,5 s, ném 2 lần cách 1,6 s, muzzle 64 px (+20 px phía trước), warn 0,8 s, rung 1 px, lao 220 px/s, stun 2,5 s, đâm tường đứng 0,5 s, cột mờ 0,3 s, gợi ý tối đa 1 lần / 5 s |
| `BOSS_TD.jar` | hitbox 10×10, bay 0,9 s, trọng lực 600 px/s², phản 260 px/s |
| `BOSS_TD.fire` | vùng 32×24, tồn tại 0,6 s (`impact` 0,5 s + giữ ô cuối — Q5) |
| `BOSS_TD` điểm | mất nấc +300, vỡ khiên +1000, phản hũ +50 |
| `BOSS_TD.footX` | 640 |
| `WAVES` | gap 1,5 s; đợt 1: 2 lính canh; đợt 2: 3 cảm tử (0 / .6 / 1,2 s); đợt 3: 2 lính canh + 2 cảm tử (.6 / 1,2 s) |

### Kết quả test (test | PASS/FAIL | mô phỏng/thật | ghi chú)
Cùng cách như Phase A: gọi `update(1/60)` trực tiếp + chụp màn hình. **Cần người chơi thử thật.**

| Test | Kết quả | Cách test | Ghi chú |
|---|---|---|---|
| Phá hết khiên chỉ bằng cột đá | PASS | mô phỏng | đứng sau cột 2: xe đâm → stun, cột 2 nứt → lần 2 vỡ, mờ, mất va chạm → xe lao tiếp tới cột 1 → nứt, hết khiên |
| Xe dừng đúng mép cột, không chồng hitbox người chơi đứng sau cột | PASS | mô phỏng | xe dừng ở x = 462 (mép phải cột 438–462) |
| Đứng trên cột khi xe đâm: không mất máu | PASS | mô phỏng | người chơi trên cột 2 chồng 21 px sang thân xe, máu giữ 5 |
| Phá hết khiên chỉ bằng hũ dầu, **cả 2 cột đã vỡ** | PASS | mô phỏng | 3 lần phản = hết khiên (~10 s); lửa trên thân xe vô hại |
| Chém trực tiếp không làm mất khiên + gợi ý §5.2 | PASS | mô phỏng | khiên giữ 3, xe nháy mờ, thông báo đúng chữ |
| Bóng Trưng Nhị / mưa tên không làm mất khiên | PASS | mô phỏng | |
| Kết hợp cột + hũ | PASS | mô phỏng | cùng hàm `loseShield` — chưa chạy riêng một lượt kết hợp, **cần thử thật** |
| Mỗi đám lửa gây đúng 1 sát thương | PASS | mô phỏng | đứng yên trong lửa 0,6 s (hết miễn thương giữa chừng): chỉ −1 |
| Dash xuyên xe | PASS (sau khi sửa) | mô phỏng | lần đầu FAIL: cú lướt 130 px kết thúc giữa thân xe 90 px khi bắt đầu cách 60 px → sửa bằng kéo dài cú lướt khi còn chồng thân xe (tối đa +0,3 s). Xe sát tường thì không xuyên được (mất máu) |
| 3 đợt quân đúng thành phần, đợt sau = chết hết + 1,5 s | PASS | mô phỏng | xem hằng số `WAVES` |
| Lính canh đuổi khắp đấu trường | PASS | mô phỏng | patrol [40, 728], aggroRange 768 |
| Kỹ năng dọn được quân | PASS | mô phỏng (Phase A) | dùng chung đường sát thương |
| HUD: khiên 3 nấc / "Đợt N/3" | PASS | thật (ảnh) + mô phỏng | |
| Thông báo §5.2 (khiên vỡ, vào giai đoạn 3) | PASS | mô phỏng | đúng từng chữ |
| Thua ở giai đoạn 2 → "Đánh lại" → từ đầu giai đoạn 1 | PASS | mô phỏng | khiên 3, 2 cột nguyên, không còn hũ/lửa/đợt quân |
| Hồi quy `?layout=skills` + màn 1 | PASS | mô phỏng | không lỗi console |

### Cảm nhận độ khó
- **Phản hũ dầu khó canh**: đứng xa xe, hũ bay ngang ~460 px/s và chỉ nằm trong vùng giáo khoảng 0,1 s; phải bấm J sớm ~0,12 s (đòn chém có trễ tới ô hit_frame). Bot canh nhịp đúng làm được, người chơi thật có thể thấy quá khó. Đề xuất nếu cần: nới hitbox "phản" của hũ (vd. 20×20), không đổi hitbox gây lửa.
- Chỉ dùng cột: hạ khiên ~20 s. Chưa đo số máu mất trung bình — cần người chơi thử.
- Camera neo tâm người chơi: đứng ở nửa trái thì xe (x ~555–645) nằm sát mép phải khung 561 px; vẫn thấy xe nhưng thấy tay ném muộn.

### Vấn đề asset
- **`BOSS_TO_DINH_CHARIOT.shield_break` ô cuối vẫn vẽ Tô Định ngồi trên xe**, trong khi giai đoạn 2 có Tô Định đi bộ đứng ở x = 640 → **hai Tô Định cùng lúc**, lại khác mũ (mũ trụ trên xe / mũ quan cao khi đi bộ). Đề xuất `NEED_REDRAW`: ô cuối (hoặc thêm animation mới, ví dụ `wreck`) là xe hỏng **không người**, hoặc cho phép bỏ Tô Định đứng riêng ở giai đoạn 2.
- `PJ_OIL_JAR`, `FX_OIL_FIRE`, `BOSS_TO_DINH_FOOT` vẫn `QA_PASS` — đổi `IN_GAME` sau Phase C.

### Câu hỏi cho team
1. Hai Tô Định ở giai đoạn 2 (mục asset trên): chờ Codex vẽ lại hay tạm ẩn Tô Định đi bộ tới giai đoạn 3?
2. Có nới vùng phản hũ dầu không (mục độ khó)?
3. Xe sát tường: dash không xuyên qua được (bị chặn ở tường, dính thân xe). Chấp nhận?
4. Tới giai đoạn 3 hiện trận đứng yên (chưa có Tô Định đánh được) — Phase C sẽ làm.

### Phase B — cập nhật sau duyệt của team (26/09)
| Quyết định | Xử lý |
|---|---|
| Hai Tô Định ở giai đoạn 2 → `NEED_REDRAW` xe hỏng không người | Đã soạn prompt giao Codex: vẽ lại `BOSS_TO_DINH_CHARIOT.shield_break` (giữ 6 ô / 10 fps / không lặp), Tô Định nhảy khỏi xe về phía đuôi xe ở ô 3–5, ô 6 = xe hỏng không người. Code không cần đổi (xác xe giữ ô cuối). |
| Nới vùng phản hũ dầu | `BOSS_TD.jar.reflectW/reflectH` = 20×20 (DESIGN_BASELINE), chỉ dùng cho đòn chém phản; hitbox gây lửa giữ 10×10. Thời gian hũ nằm trong vùng giáo (mô phỏng): x = 150: 0,117 → 0,133 s; x = 300: 0,117 → 0,150 s; x = 450: 0,083 → 0,150 s (cộng thêm cửa sổ chém 0,18 s). Bot phản hũ vẫn phá hết khiên khi cả 2 cột đã vỡ — PASS mô phỏng. |
| Dash vào xe đang sát tường không xuyên được | Team chấp nhận — giữ nguyên. |

## Phase C — 27/09/2026

**Trạng thái: PASS (mô phỏng) — chờ người chơi thử duyệt.** Màn 3 chơi trọn: chiến xa → 3 đợt thân binh → Tô Định đi bộ → cutscene → panel kết chương.

### File đã sửa (file | mục đích)
| File | Mục đích |
|---|---|
| `frontend/static/js/levels/trung-trac/config.js` | `ARENA.wallArrows`, `WALL_ARROWS`, `BOSS_TD.foot`, `BOSS_TD.cutscene`, `ENEMY_SPRITES.bossFoot` (idle/hurt/disarmed/flee), `PLAYER_ANIMATIONS.victory`, `VICTORY_FLAG_ID` + thêm vào `MAP_PROPS_IN_GAME` |
| `.../state.js` | `makeToDinhFoot()`, `battle.todinh/rusherTimer/wallTimer`, `state.wallArrows`, `state.cutscene` |
| `.../physics.js` | Giai đoạn 3 (`startPhase3`, `updateFoot`, đẩy lùi 1 lần/khung, quân cảm tử mỗi 4 s ≤ 2), `defeatToDinh`, cutscene 6 bước (`updateCutscene`, người chơi không điều khiển), mưa tên trên thành (`updateWallArrows`), `updateCamera()` tách riêng, `endGame` màn 3 (lưu `level3Complete`, panel kết chương), màn 1 ghi `level3Complete: false` khi tạo tiến trình mới |
| `.../render.js` | Cờ chiến thắng trên cổng mở (`flag_attach`), vạch báo + tên trên thành, màn tối/sáng của cutscene |
| `.../dialogue.js` | `openStory()` nhận `story.portrait` (id chân dung) và `memorial: false` (chân dung màu) — cốt truyện Thi Sách giữ trắng đen |
| `.../dialogue-data.js` | `STORY_TO_DINH_FLEES`, `STORY_LUY_LAU_VICTORY`, `CHAPTER_END` — **nguyên văn mục 5.3–5.4** |
| `.../progress.js` | `level3Complete` trong tiến trình rỗng |
| `.../ui.js`, `.../main.js`, `frontend/templates/gameplay/levels/trung-trac.html` | Nút "Chơi lại chương" (xoá tiến trình → màn 1) / "Về trang chủ" (`/`) |
| `frontend/static/assets/images/sprites-8bit/` | Chép bản Codex đã duyệt: `boss_to_dinh_chariot_shield_break.png` (xe hỏng không người), `boss_to_dinh_foot_hurt.png`; `manifest_tt.json`: thay đúng 2 dòng `BOSS_TO_DINH_CHARIOT`/`BOSS_TO_DINH_FOOT` từ bản nguồn (không chép cả file vì `EN_HAN_RUSHER.qa_notes` bản chạy mới hơn bản nguồn) |
| `frontend/static/assets/images/maps-8bit/` | Chép `PROP_TT_VICTORY_FLAG` + `maps_tt.json` từ bản nguồn (thêm mục cờ + `flag_attach` của cổng mở) |
| `assets/sprites/manifest_tt.json`, `assets/maps/trung-trac/maps_tt.json` + 2 bản chạy | Chỉ đổi `status` → `IN_GAME`: `EN_HAN_RUSHER`, `BOSS_TO_DINH_FOOT`, `PJ_OIL_JAR`, `FX_OIL_FIRE`, `PJ_ARROW_RAIN`, `PORTRAIT_TO_DINH`, `PORTRAIT_TRUNG_TRAC`, `PROP_STONE_PILLAR`, `PROP_TT_VICTORY_FLAG` |
| `CLAUDE.md` | Màn 3, boss 3 giai đoạn, buff/kỹ năng, quân cảm tử, đấu trường, kết chương, điều khiển K/L (K không còn dash); bỏ mô tả trang giữ chỗ; gỡ asset đã dùng khỏi danh sách "chưa dùng" |

### Hằng số mới (tên | giá trị | DESIGN_BASELINE)
| Tên | Giá trị |
|---|---|
| `WALL_ARROWS` | mỗi 3,5 s, 2 mũi, ±120 px, vạch báo 0,6 s, rơi 420 px/s, ngưng 2 s đầu mỗi giai đoạn |
| `BOSS_TD.foot` | 22×40, 3 máu, đẩy lùi 16 px, tâm ≤ 740, cảm tử mỗi 4 s (≤ 2), chạy trốn 150 px/s |
| `BOSS_TD.cutscene` | đứng sau `disarmed` 0,4 s, tối/sáng 0,4 s, đi tới cổng 120 px/s, đứng `victory` 1,4 s |

### Kết quả test (test | PASS/FAIL | mô phỏng/thật | ghi chú)
Cùng cách như Phase A–B. **Cần người chơi thử thật.**

| Test | Kết quả | Cách test | Ghi chú |
|---|---|---|---|
| Giai đoạn 3: 3 đòn → `disarmed` → cutscene | PASS | mô phỏng | `hurt` phát khi trúng, đẩy lùi 16 px, chạm Tô Định không mất máu |
| Có bóng Trưng Nhị: 2 cú chém là xong | PASS | mô phỏng | cú 1: −2 máu (người chơi + bóng), cú 2: hết |
| Mưa tên Lê Chân tối đa 1 đòn lên Tô Định mỗi lần | PASS | mô phỏng | |
| Không bị đẩy quá x = 740 | PASS | mô phỏng | |
| Cảm tử mỗi 4 s, tối đa 2 con | PASS | mô phỏng | |
| Cutscene đủ 6 bước, không điều khiển được | PASS | mô phỏng + ảnh | bấm A/J trong cutscene: không di chuyển, không chém |
| Text khớp mục 5 từng chữ | PASS | mô phỏng | 4 câu cutscene + tiêu đề/dòng phụ panel kết chương; chân dung Tô Định / Trưng Trắc **màu** |
| Cổng mở + cờ đúng `flag_attach` + `victory` | PASS | thật (ảnh) | |
| Tiến trình lưu `level3Complete`; "Chơi lại chương" xoá tiến trình | PASS | mô phỏng | về `/gameplay/levels/trung-trac`, `sessionStorage` rỗng |
| Mưa tên trên thành: vạch báo, dash né, không trúng lính, tắt bằng hằng số | PASS | mô phỏng | loạt đầu ở 5,5 s (2 s ngưng + 3,5 s) |
| Hồi quy màn 2 → "Sang Màn 3" → màn 3 (tiến trình thật, 3 phần thưởng) | PASS | mô phỏng | điểm mang sang đúng, tải đủ asset, không lỗi console |
| Hồi quy 1 → 2 → 3 → hết chương 2 lượt (có / không kỹ năng) | PASS từng đoạn | mô phỏng | chưa chơi liền mạch bằng tay — **cần người chơi thử** |
| `pytest tests` | SKIP | thật | thiếu `SUTA_TEST_DATABASE_URL` |

### Cảm nhận độ khó
Chưa có số đo từ người chơi thật (thời gian hạ boss, máu mất mỗi giai đoạn) — cần buổi chơi thử. Mô phỏng: giai đoạn 1 ~10–20 s, giai đoạn 2 phụ thuộc tốc độ dọn 9 quân, giai đoạn 3 ngắn (3 đòn) — có thể cần tăng máu Tô Định nếu thấy quá nhanh.

### Vấn đề asset
- Bản chạy `EN_HAN_RUSHER.qa_notes` mới hơn bản nguồn `assets/sprites/manifest_tt.json` (ghi chú vẽ lại 26/09 chưa có ở bản nguồn). Không sửa (ngoài quyền: chỉ được sửa `status`) — đề xuất Codex đồng bộ lại bản nguồn.
- Không còn vấn đề mở ở boss: `shield_break` đã vẽ lại (xe hỏng không người), `hurt` và cờ đã có.

### Câu hỏi cho team
1. Khi Tô Định văng kiếm, quân còn lại **phát `death`** (tan rã) thay vì đứng im — card ghi "dừng mọi quân địch". Giữ vậy?
2. Giai đoạn 3 chỉ 3 đòn (2 cú nếu có bóng) — có thấy quá nhanh không sau khi chơi thử?

### Phase C — cập nhật sau duyệt của team (27/09)
| Quyết định | Xử lý |
|---|---|
| Quân còn lại phát `death` (tan rã) khi Tô Định văng kiếm | Giữ nguyên. |
| Tăng máu Tô Định (giai đoạn 3) lên 5 | `BOSS_TD.foot.hp` 3 → 5 (DESIGN_BASELINE; card gốc 3). Có bóng Trưng Nhị: 3 cú (2 + 2 + 1). CLAUDE.md cập nhật. |
| Cờ cắm ở giữa mái cổng (thay vì đỉnh cột cờ bên phải) | `VICTORY_FLAG_ATTACH` = (94, 10) trong `config.js` ghi đè `flag_attach` (166, 31) của `maps_tt.json` (không sửa manifest — chỉ được sửa `status`). Đo: nóc mái phẳng hàng y = 7 (x 80–112); cán cờ cột 1–3, chân cán hàng 30 → cán đứng đúng x = 96, chân cắm 1 px vào nóc. Kiểm bằng ảnh chụp trong game — PASS. Đề xuất Codex cập nhật `flag_attach` trong `maps_tt.json` cho khớp (khi đó đặt `VICTORY_FLAG_ATTACH = null`). |
