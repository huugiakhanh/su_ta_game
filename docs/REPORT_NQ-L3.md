# REPORT NQ-L3 — Màn 3 "Đại thắng Bạch Đằng" (chương 7 Ngô Quyền)

Ngày: 12/11/2026. Yêu cầu người dùng: làm màn 3 thật theo task card [SUTA_NQ_TASK_L3_01.md](SUTA_NQ_TASK_L3_01.md) ("Duyệt theo đề xuất" Q1–Q4), dùng asset `NQ_ART_03` vừa chép bản chạy.

## Hiện trạng / đo trước khi sửa
- Màn 3 là đấu trường tạm NQ-SKELETON: 3 đợt lính, không boss, không cutscene, không kỹ năng, nền tạm `BG_NQ_MID_AI_CHAU_RIVER`.
- Engine chưa đưa số cọc màn 2 sang màn 3 (`levelOptions` chỉ có `rewards`), chưa có cách hoà sang nền thứ 2 trong cùng vùng, chưa có hệ số tốc độ cho kỹ năng bị động.

## Quyết định (người dùng chốt 12/11/2026)
- Q1 — 2 câu cutscene NQ-00 §5.2 hiện trong khung cốt truyện chân dung + tên **Ngô Quyền**.
- Q2 — GĐ 3 Hoằng Tháo **gạt đòn chém thường**; chỉ mất máu khi khựng (phản đòn), kiếm cắm ván sau đòn bổ, hoặc trúng K.
- Q3 — GĐ 2 có **lính Nam Hán nhảy xuống bùn** (tối đa 2).
- Q4 — duyệt các câu thông báo mục 5 card như nháp.

## File đã sửa / tạo / xoá
| File | Việc |
|---|---|
| `frontend/static/js/engine/main.js` | L3-E1: `levelOptions.stakes = progress?.stakes ?? 0` |
| `frontend/static/js/engine/assets.js`, `render/backdrop.js` | L3-E2: vùng có `midAlt` nạp thêm lớp giữa đó; `state.midAlt` (0..1) hoà lớp giữa sang `midAlt`; t ≥ 1 vẽ thẳng; canvas phụ cỡ 0 thì vẽ thẳng (chặn lỗi `drawImage` cỡ 0 gặp 1 lần lúc thử) |
| `frontend/static/js/engine/player.js`, `hazards.js` | L3-E3 (thêm ngoài card): `CHAPTER.skills.moveFactor?()` nhân tốc độ chạy + chèo thuyền |
| `frontend/static/js/engine/chapter.js` | ghi hợp đồng `zones[i].midAlt`, `content(options).stakes`, `skills.moveFactor` |
| `frontend/static/js/levels/ngo-quyen/config.js` | màn 3: `ARENA`, `LEVEL3_TERRAIN` (bờ x 0–96 + bãi triều), `LEVEL3_TIDE`, `LEVEL3_ZONES` (+ `midAlt`), `SHIP`, `CATAPULT`, `DECK_ARCHERS`, `RAFTS`, `BAIT`, `BOSS`, `MUD_SOLDIERS`, `SKILLS`, `NQ_CUTSCENE`, `BOSS_TEXT`; enemy art `mud`, `hoangThao`, `shipArmor`; hazard `ship` (+ `ride` = mặt boong), `shipHull`, `deckArcher`; đạn `fireArrow`; `LEVEL_SPRITES[3]`, `PORTRAITS` (+ chân dung + 3 icon), `MAP_PROPS_IN_GAME` (+ bãi cọc); bỏ `WAVES` tạm |
| `frontend/static/js/levels/ngo-quyen/level3.js` | viết lại: dựng đấu trường, lâu thuyền, giáp, cung thủ, boss, bè lao, thuyền nhỏ; layout thử `lowtide` |
| `frontend/static/js/levels/ngo-quyen/boss.js` (mới) | `updateBattle` 3 GĐ, máy bắn đá + đá + vạch báo, cung thủ hồi sinh, bè lao, thanh Nhử địch, chuyển cảnh nước rút, giáp, lính bùn, mở boong, Hoằng Tháo (gạt đòn / né đúng lúc / khựng), HUD, cutscene |
| `frontend/static/js/levels/ngo-quyen/skills.js` (mới) | 3 kỹ năng |
| `frontend/static/js/levels/ngo-quyen/render-extras.js` | máy bắn đá, bãi cọc, bè lao, đá + vạch báo, FX, cọc sắt K, vệt thuyền L |
| `frontend/static/js/levels/ngo-quyen/chapter.js` | levels[3] (`update`, `cutscene`, `tide`, `skills`, `testLayout: 'lowtide'`); `skills`, `enemyKinds`, hooks `onThrownHit`, `onHazardBroken`, `dropHeal`, `updateHud`; câu tên lửa trúng |
| `frontend/static/js/levels/ngo-quyen/dialogue-data.js` | `STORY_NQ_VICTORY` (§5.2 nguyên văn) |
| `frontend/static/js/levels/ngo-quyen/audio-data.js` | 12 tiếng chiptune trận Bạch Đằng |
| `frontend/templates/gameplay/levels/ngo-quyen.html` | khe kỹ năng K/L + bị động, nút cảm ứng, dòng trợ giúp |
| `.claude/rules/ngo-quyen-gameplay.md`, `.claude/rules/engine.md` | cập nhật |
| `docs/SUTA_NQ_TASK_L3_01.md` | trạng thái ĐÃ DUYỆT |

Thay đổi hành vi / số ngoài card:
1. **Boss hp 10 (card 8) + tối đa 2 đòn mỗi lần khựng** (`counterHits`): đo harness — khựng 1,5 s không giới hạn thì chém được ~4 đòn × 2 = hết 8 máu sau **1** lần phản đòn (1,9 s). Giờ cần **3** lần khựng (9–10 s).
2. **Vùng chặn thân thuyền chỉ ở GĐ 1** (card: hạ xuống làm mặt boong ở GĐ 3): từ GĐ 2 người chơi đi trên bùn **trước mạn** thuyền (cảnh nhìn ngang) để chém giáp — vùng chặn cũ đẩy người chơi ra trước mũi, không với tới giáp phía sau. Mặt boong là bục gắn thuyền (`ship.ride`, engine không vẽ), chỉ dùng được sau khi mở boong (`ship.active`).
3. **Thuyền nhỏ bị bỏ khi vào GĐ 2** (card: mắc lại trên bùn): engine cho chèo thuyền trên đất khô khi không còn khúc nước nào.
4. **Thêm L3-E3** `moveFactor` ở engine (card ghi "không đổi thêm engine") — cần cho Thần Tốc Hành Quân chạy + chèo ×1,2.
5. L3-E2 làm bằng `zones[i].midAlt` + `state.midAlt` trong lớp giữa có sẵn (card: hook `afterBackground`) — dùng lại đúng đường hoà nền của engine, không cần lớp vẽ mới.
6. Lâu thuyền là hazard `prop` nổi (engine vẽ trước lớp nước), animation qua `ship.pose` — không dùng `hazard.action` vì engine coi mọi `action` là đang ném đạn (lỗi `makeProjectile` khi thử).
8. Sửa sau chơi thử (12/11): ảnh bãi triều chỉ cao 16 px nên lúc nước rút lộ đáy lâu thuyền dưới lớp bùn — `render-extras.js drawMudBed` lát thêm nửa dưới ảnh bãi triều từ GROUND_Y + 14 tới đáy khung (chỉ khi `state.battle`, nước không lớn), vẽ sau thân thuyền. Đo: hàng 262–269 ở x 520/560 (dưới thuyền) giờ là màu bùn, không còn màu thân thuyền.
7. Mảng giáp vỡ sẵn ở layout thử `lowtide` lấy 3 tấm đầu theo mảng (phía đuôi), ở trận thật lấy từ mũi — chỉ khác ở layout thử.

## Kết quả test
- `pytest tests`: 170 passed, 1 skipped — PASS (`test_app.py` skip vì thiếu `SUTA_TEST_DATABASE_URL`, test DB/thành tựu server chưa chạy).
- L3-2 nạp màn 3: 17 sprite + 3 nền + bãi cọc, không cảnh báo thiếu asset; console không lỗi sau khi sửa — PASS.
- L3-3 GĐ 1 (harness lái thuyền thật): đá rơi vào vạch báo ("Bạn bị đá máy bắn đá trúng!"), tên lửa nhắm người chơi; 5 lần nhặt lao từ bè + 5 lần ném trúng mạn (+20 mỗi lần) → đầy 100 sau **11,6 s** → chuyển cảnh — PASS.
- L3-4 GĐ 2: thuyền tiến 120 px trong 2 s → `impale` → `stuck`; triều rút; nền hoà 0 → 1; giáp vỡ sẵn đúng `clamp(stakes,3,6)`: `?debug=1` (stakes 0) → **3**, tiến trình stakes 5 → **5** (còn 1); giáp còn lại 2 đòn; bùn đi được — PASS. Stakes 6 chưa thử riêng (cùng công thức).
- L3-5 GĐ 3: nhảy từ bùn lên bục boong (chân = 212 = mặt boong); đòn thường bị gạt (máu boss giữ); lướt trong 0,15 s trước ô hit → `stagger`; 3 lần khựng hạ boss (10,2 s / 9,0 s) → cutscene `fall` → `sink` → khung Ngô Quyền → panel — PASS.
- L3-6 kỹ năng (`?debug=1`): Thần Tốc vận tốc 201,6 so với 168 (×1,2); K ở GĐ 1 → "Chưa có chỗ dựng cọc."; K GĐ 2 phá 1 giáp (3 → 2), K vào lính bùn −2 (hạ); K GĐ 3 → boss `stagger`; L → +25 Nhử địch, `guard` 3 s, 150 frame không mất máu khi tắt god — PASS. Không kỹ năng (tiến trình `rewards: []`, không debug) vẫn thắng — PASS.
- L3-7 cutscene nguyên văn §5.2 (đọc DOM), panel §5.3, tiến trình `level3Complete: true` — PASS. Thành tựu server chưa chạy (cần DB test).
- L3-8 đồ hoạ (chụp): lâu thuyền mũi trái nổi đúng mặt nước, boss + 2 cung thủ trên boong, giáp khớp ô ở cả `idle` và `stuck`, bãi cọc + nền nước rút, cảnh chìm (người chơi rơi xuống bùn phát `victory`) — PASS.
- L3-9 hồi quy 900 frame + bấm K/L: chương 1 (màn 1, 3), 2, 3 (màn 1, 3), 4, 5 (màn 1, 3), 6 (màn 1, 3), 7 (màn 1, `?layout=engine`, màn 2, 3, `?layout=lowtide`) — không lỗi — PASS.
- L3-10 người dùng chơi thử cả 3 màn (12/11) — ổn — PASS.

## Vấn đề asset
- Không có lỗi ảnh. Ghi chú: `stuck` nghiêng 1,2° — code bù toạ độ giáp + boss + máy bắn đá theo `tilt`.

## Câu hỏi cho team / TODO
- **Cache JS** (gặp khi thử): Flask trả cả file `.js` với `max-age=86400` như manifest JSON. Phiên sửa cache (nhánh `claude/epic-almeida-83ccb8`) chỉ chuyển `.json` sang `no-cache`. Sau khi cập nhật code, trình duyệt đã chơi trong 24 giờ có thể nạp lẫn `config.js` cũ với `boss.js` mới (thiếu export → màn 3 không chạy). Đề xuất mở rộng sửa cache cho `.js`.
- Người dùng chơi thử: độ khó 3 GĐ (nhịp đá 3,6 s, tên 2,8 s, cửa sổ né 0,25 s, boss 10 máu / 2 đòn mỗi lần khựng), thời gian cả màn.
- Nhạc riêng chương 7: xong 12/11 (`docs/archive/GEMINI_PROMPT_NQ_MUSIC.md`).
- TODO engine (từ NQ-L1): nhảy khỏi thuyền đang chạy không mang theo vận tốc thuyền.
