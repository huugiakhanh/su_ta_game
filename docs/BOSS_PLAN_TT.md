# BOSS_PLAN_TT — Kế hoạch TT-BOSS-01 (Bước 0)

Task card: [SUTA_TT_TASK_BOSS_01.md](SUTA_TT_TASK_BOSS_01.md) · 26/09/2026 · Trạng thái: **ĐÃ CHỐT Q1–Q6** (26/09) — chờ lệnh bắt đầu Phase A.

## 1. Đối chiếu manifest (bản chạy `sprites-8bit/manifest_tt.json`, `maps-8bit/maps_tt.json`)

| Asset | Thực tế | Khác task card / ghi chú |
|---|---|---|
| `BOSS_TO_DINH_CHARIOT` 128×96 | idle 4f/6 loop · charge 6f/14 loop · stun 4f/8 loop · throw 6f/10 hit **4** · shield_break 6f/10 không lặp · idle_cracked 4f/6 loop | Khớp. throw dài .6s → hũ rời tay ở .3s |
| `BOSS_TO_DINH_FOOT` 48×48 | idle 4f/8 loop · disarmed 4f/10 · flee 6f/12 loop | Khớp. **Bản nguồn `assets/sprites/` đã có `hurt` 2f/8** (Codex làm xong), **chưa chép sang bản chạy** |
| `EN_HAN_RUSHER` 48×48 | run 6f/14 loop · attack_01 4f/14 hit **2** · death 4f/10 | Khớp. status `QA_PASS` |
| `PJ_OIL_JAR` 16×16 | animation tên **`loop`** 4f/12 | Card không nêu tên — dùng `loop` |
| `FX_OIL_FIRE` 32×32 | animation tên **`impact`** 6f/12, **không lặp = 0,5s** | Vùng lửa 0,6s > 0,5s → giữ ô cuối 0,1s (đề xuất) |
| `PJ_ARROW_RAIN` 8×24 | `idle` 1 ô | Khớp |
| `PLAYER_TRUNG_TRAC.victory` | 4f/6 không lặp | Khớp |
| `NPC_TRUNG_NHI` | idle 4f/6 · run 6f/12 · attack_01 6f/14 hit 3 | Khớp (cùng số ô/hit với attack_01 người chơi → trải trên `ATTACK_COOLDOWN` .36s để đồng bộ) |
| `PROP_STONE_PILLAR` | file strip 48×48 = 2 ô 24×48 (`frame_states` intact/cracked) + `state_files` riêng; pivot (12,48); **không `visible_bbox`**; status `NORMALIZED` | `obstacleDrawRect()` dùng `asset.w` (48) → phải vẽ theo ô `frame_w` 24 |
| `PROP_LUYLAU_GATE` 192×176 | tâm 672 → trải 576–768 | Vừa khít đấu trường |
| `PROP_TT_VICTORY_FLAG` | **Có ở bản nguồn** (96×32, 4 ô 24×32, 6fps, pivot bottom-left, `QA_PASS`) + `flag_attach {x:166,y:31}` trên cổng mở | **Chưa chép sang `maps-8bit/`** |
| `PORTRAIT_TO_DINH`, `PORTRAIT_TRUNG_TRAC` | có, status `QA_PASS` | — |

## 2. Phát hiện trong code ảnh hưởng thiết kế
1. **Phím K đang là dash** (`input.js` `KeyK: 'dash'`) — xung đột với K = Mưa tên. → cần chốt.
2. `updateAttack()` chặn mục tiêu có `hitTimer > 0` (.18s). Bóng Trưng Nhị đánh **cùng lúc** người chơi, mưa tên 10 mũi/0,8s → đòn phụ bị hitTimer chặn, không đạt "lính 2 máu chết sau 1 cú". Đề xuất: đòn bóng/mưa tên dùng bộ đếm riêng (Set theo cú/lần dùng), **bỏ qua hitTimer**; tách hàm `damageTarget(target, source)` dùng chung.
3. Kẹp người chơi `p.x ∈ [12, finishX+96]` — màn 3 cần tường 0/768: rẽ nhánh theo `LEVEL.arena` (không đổi màn 1–2).
4. Camera hiện tại `p.x − 0.34·VIEW_W`, kẹp `[0, worldWidth − VIEW_W]` — đã đúng yêu cầu kẹp.
5. Đạn hiện chỉ bay ngang tốc độ cố định; chém trúng → tan (+30). Hũ dầu cần bay vòng cung + bị phản → thêm nhánh `arc`/`reflected` trong `updateProjectiles`, không đổi đạn cũ.
6. `makeEnemy()` đặt patrol theo tâm ±48 và `updateGuard()` dùng `GUARD.aggroRange` 110 → thêm tham số tuỳ chọn `patrolMin/Max`, `aggroRange` trên từng enemy (mặc định giữ GUARD).
7. `openStory()` luôn gắn class `--memorial` (grayscale) và lấy chân dung qua `NPC_SPRITES[id].portrait` — cutscene cần chân dung Tô Định/Trưng Trắc **màu**: thêm tham số `portraitId`/`memorial` tuỳ chọn.
8. Cổng: `finishGateOpen()` = `!bossAlive() && đủ sách` → màn 3 sẽ mở cổng sai lúc; thêm cờ `state.gateOpen` cho màn 3.
9. `endGame()` chỉ có nhánh màn 1/2 và nút "Sang Màn N" → thêm nhánh màn 3 (panel kết chương, 2 nút).
10. `tests/test_app.py:31` chỉ kiểm `/3` trả 200 → vẫn PASS khi đổi template.

## 3. Quyết định team đã chốt (26/09)
- **Q1 Cột đá va ngang**: thêm cờ riêng `blocking`, chỉ dùng cho cột đá. Va ngang thì bị chặn (đẩy ra mép), **không mất máu**; vẫn đứng lên được. Không đổi luật chung của vật cản.
- **Q2 Địch với cột đá**: lính canh và quân cảm tử **đi xuyên** cột; **chỉ chiến xa** bị cột chặn.
- **Q3 Phím K**: bỏ `KeyK` khỏi dash ở **mọi màn** (dash còn ↓/S/Shift). K = Mưa tên, L = Bóng Trưng Nhị.
- **Q4 Asset Codex**: ở Phase C, chép `BOSS_TO_DINH_FOOT.hurt`, `PROP_TT_VICTORY_FLAG` và `flag_attach` của cổng mở từ `assets/` sang bản chạy; code vẫn giữ fallback.
- **Q5 Lửa hũ dầu**: `FX_OIL_FIRE.impact` phát theo fps manifest (0,5 s), **giữ ô cuối thêm 0,1 s** cho đủ 0,6 s.
- **Q6 Hũ dầu phản ngược**: chỉ tính khi trúng **hitbox thân xe**; lửa trên thân xe **không** làm người chơi mất máu.

## 4. Camera (VIEW_W 480–640 < 768)
Giữ công thức kẹp `[0, 768 − VIEW_W]` (max 288 @480, 128 @640); **màn 3 đổi điểm neo sang tâm người chơi** (`p.x + p.w/2 − VIEW_W/2`) vì địch đến từ cả hai phía (cổng bên phải, xe lao cả hai chiều), vẫn lerp `dt·6`. Ở 640 camera gần như cố định; cổng (576–768) luôn thấy khi người chơi ở nửa phải. Mưa tên trên thành / hũ dầu rơi ngoài khung: vạch báo vẫn vẽ, không cần chỉ báo mép.

## 5. OWNED FILES theo phase
**Phase A** — `config.js` (LEVELS[3], ARENA, SKILLS, RUSHER, sprite mới, PROP_STONE_PILLAR), `state.js` (level3Content, makeEnemy tham số, layout `skills`, bao cát), `physics.js` (tường, blocking, rusher, kỹ năng, buff, camera màn 3, endGame màn 3 thua), `render.js` (cột 2 trạng thái, bóng Trưng Nhị, mưa tên, rusher), `input.js` (K/L, bỏ KeyK dash nếu Q3 duyệt), `ui.js` (HUD kỹ năng), `main.js` (INTRO 3, levelOptions layout skills), `progress.js` (chỉ nếu cần helper `hasReward`), `trung-trac.html` (ô kỹ năng, 2 nút cảm ứng, ô đợt/khiên ẩn sẵn), `css/levels/trung-trac.css`, `backend/routes/pages.py` (route /3), `docs/REPORT_TT-BOSS-01.md`.
**Phase B** — `config.js` (BOSS_TD, WAVES), `state.js`, `physics.js` (máy trạng thái xe, hũ dầu vòng cung/phản, lửa, đợt quân), `render.js` (xe rung, hũ, lửa, xác xe, Tô Định đứng), `geometry.js` (makeProjectile tuỳ chọn arc), `ui.js`/template/CSS (thanh khiên, "Đợt N/3"), report.
**Phase C** — `config.js`, `physics.js` (giai đoạn 3, cutscene, mưa tên trên thành, endGame thắng), `render.js` (fade tối, flee, cờ, vạch báo), `dialogue.js` (tham số chân dung/memorial), `dialogue-data.js` (text §5.3), `progress.js` (level3Complete), `main.js` (nút kết chương), template/CSS, chép asset Q4 + `status IN_GAME` trong 2 manifest, `CLAUDE.md`, report.
**Chỉ đọc**: `animation.js`, `assets.js` (trừ khi cần tải ảnh theo ô — dự kiến không), `viewer.js`, `placeholder.js` + template giữ chỗ (giữ, ngừng dùng).

## 6. Máy trạng thái boss
```
GĐ1 CHARIOT (shield 3)
  THROW×2 (1,6s; hũ ở hit_frame 4) → WARN .8s (idle/idle_cracked, rung 1px)
  → CHARGE 220px/s ─┬ chạm cột → STUN 2,5s (shield−1, cột intact→cracked→fade .3s) → THROW
                    └ chạm tường → WALL .5s → quay đầu → THROW
  hũ bị phản trúng xe: shield−1, FX lửa, không stun
  shield=1 → idle_cracked; shield=0 → SHIELD_BREAK (1 lần, xác nằm lại) → msg → GĐ2
GĐ2 WAVES: Tô Định FOOT idle @640 không hitbox; đợt1 2 guard → đợt2 3 rusher(.6s) → đợt3 2g+2r; nghỉ 1,5s giữa đợt → msg → GĐ3
GĐ3 FOOT 3hp idle, trúng: nháy/hurt + lùi 16px (≤740); rusher mỗi 4s (≤2) → hp0: dừng địch/đạn, disarmed → CUTSCENE
CUTSCENE: tối .4s → story(câu 1–2, PORTRAIT_TO_DINH) → sáng, flee sang trái → TT đi tới cổng, gate open, victory → cờ (nếu có) → story(câu 3–4, PORTRAIT_TRUNG_TRAC) → panel kết chương, lưu level3Complete
```
Mưa tên trên thành chạy suốt GĐ1–3, nghỉ 2s đầu mỗi GĐ và trong cutscene.

## 7. Luồng màn 3
Màn 2 thắng → `/3` (`trung-trac.html`, level_id=3) → `requireLevel(3)` → thông báo §5.1 → GĐ1–3 → cutscene → panel kết chương ("Chơi lại chương" = clearProgress + màn 1; "Về trang chủ"). Thua bất kỳ lúc nào → "Đánh lại" = reset màn 3, máu 5, điểm = điểm mang sang từ màn 2.

## 8. Rủi ro
- Chồng hitbox 1px khi xe dừng ở mép cột → xét va chạm xe/người bằng hitbox thu 1px khi xe `STUN` sát cột.
- Người chơi đứng TRÊN cột khi xe đâm: cột cao 48 < xe 80 → hitbox xe chồng người đứng trên cột; cần luật "đứng trên cột không tính va chạm" (đã có trong card).
- Cả 2 cột vỡ → chỉ còn hũ dầu; đảm bảo xe vẫn ném sau khi đâm tường.
- Hệ số hitTimer (mục 2.2) có thể làm sai test "bao cát tối đa 2 đòn".
- HUD 480px chật: 3 ô kỹ năng + tim + điểm + thanh tiến độ (màn 3 có thể ẩn thanh tiến độ).
- Template dùng chung: phần tử mới phải `hidden` ở màn 1–2 để không hồi quy.

