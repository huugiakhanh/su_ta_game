# REPORT NQ-L2 — Màn 2 "Trận địa cọc ngầm" (chương 7 Ngô Quyền)

Ngày: 12/11/2026. Yêu cầu người dùng: làm màn 2 thật theo task card [SUTA_NQ_TASK_L2_01.md](SUTA_NQ_TASK_L2_01.md) ("Duyệt theo đề xuất" Q1–Q5), dùng asset đợt `NQ_ART_02` vừa chép bản chạy.

## Hiện trạng / đo trước khi sửa
- Màn 2 là khung NQ-SKELETON: 4 chunk, 2 lính, 3 bia, nền tạm `BG_NQ_MID_NORTH_ROAD`, chưa NPC/cọc/triều.
- Engine luôn phát `burden_idle`/`burden_run` khi vác — chưa cho chương chọn strip vác riêng; NPC chưa có kiểu "hồi tưởng".
- Asset `NQ_ART_02` đã ở bản chạy (40 ảnh, `IN_GAME`) nhưng chưa khai báo trong `config.js`.

## Quyết định (người dùng chốt 12/11/2026)
- Q1 — dòng chú khung thoại = chú thích nguyên văn Excel A1 + dòng chú NQ-00: "Cha vợ, Tiết độ sứ — Hồi tưởng năm 937", "Tướng tài, cháu nội Kiều Công Tiễn nhưng trung thành với nước — Tương truyền", "Con trai trưởng, Tướng tiên phong — Tương truyền".
- Q2 — 2 lính vây Dương Đình Nghệ là **quân Kiều Công Tiễn** (cảnh năm 937); 2 NPC sau quân Nam Hán.
- Q3 — **2 đống cọc** (chunk 3 sau Kiều Công Hãn, chunk 6).
- Q4 — đang vác vẫn lên thuyền được, nhảy thấp hơn; khe cá sấu chunk 7 không qua được khi vác, mốc chunk 7 đặt trước khe.
- Q5 — duyệt 4 tip + câu tổng kết như nháp (tip đống cọc đổi chữ, xem dưới).

## File đã sửa / tạo / xoá
| File | Việc |
|---|---|
| `frontend/static/js/engine/render/player.js` | L2-E1: `CHAPTER.burdenAnims { idle, run }` — có strip trong manifest thì phát, thiếu thì như cũ |
| `frontend/static/js/engine/render/entities.js` | L2-E2: NPC `memorial` vẽ `grayscale(1)` + alpha ×0,7 |
| `frontend/static/js/engine/dialogue.js` | L2-E2: thoại NPC `memorial: true` → chân dung trắng đen (cốt truyện giữ quy ước cũ) |
| `frontend/static/js/engine/chapter.js` | ghi hợp đồng `burdenAnims`, `dialogues[id].memorial`, `sprites.npcs[id].memorial` |
| `frontend/static/js/levels/ngo-quyen/config.js` | màn 2: 10 chunk, 3 vùng nền, `LEVEL2_TERRAIN` (bãi triều chunk 4/6/7, sông 5/7/8), `LEVEL2_TIDE` 8/2/6 `rise` 0, `LEVEL2_NPCS`, `CAPTORS`, `LEVEL2` (10 sách, 3 lính, 2 đống, 6 mốc, 2 thuyền, bè, 2 cọc ngầm, thuyền lửa, gió, cá sấu, nghỉ chân, 4 tip), `QUIZ.level2Spots`; `ENEMY_SPRITES.nh` + `NH_GUARD` (tầm 40); hazard `netRaft`, `fireBoat`, `hiddenStake`/`stakePile` sprite thật; `STAKES.sprite`; `BURDEN_ANIMS`; 3 NPC + 3 chân dung; `TILES.flat`; `LEVEL_SPRITES[1]` thêm bộ cọc + bè cho `?layout=engine` |
| `frontend/static/js/levels/ngo-quyen/level2.js` | viết lại: bố cục, NPC + lính vây theo art, bè, thuyền lửa (`drift`), sự kiện tip/nghỉ chân/`returnBoats` |
| `frontend/static/js/levels/ngo-quyen/level1.js` | export `makeBoat`, `makeGust`, `returnBoats`; layout thử dùng `netRaft` |
| `frontend/static/js/levels/ngo-quyen/chapter.js` | `burdenAnims`, levels[2] `events`/`tide`/`stakesRequired` 3/`summary` |
| `frontend/static/js/levels/ngo-quyen/dialogue-data.js` | `NPC_DIALOGUES` 3 NPC, nguyên văn NQ-00 §4 |
| `.claude/rules/ngo-quyen-gameplay.md`, `.claude/rules/engine.md` | mô tả màn 2 + L2-E1/E2 |
| `docs/SUTA_NQ_TASK_L2_01.md` | trạng thái ĐÃ DUYỆT |

Thay đổi hành vi nhỏ ngoài yêu cầu:
1. Tip đống cọc đổi "Bấm Đánh để vác một cọc" → **"Chạm vào để vác một cọc."** — engine nhặt cọc khi chạm (NQ-ENGINE E5), bấm Đánh khi đang vác là để cắm.
2. Thuyền hỏa công chạy `drift` (trôi hết lòng sông rồi ẩn, nghỉ 3 s, trôi lại) — **không** phát strip `death` lúc chìm như card ghi (kind `drift` không có pha chết); tốc độ 150 px/s thay 70 (đo bên dưới).
3. Bỏ bè quăng lưới thứ 2 ở chunk 8 (card mục 2): thuyền lửa trôi xuyên qua bè trông vô lý; chunk 8 chỉ còn thuyền lửa.
4. Cọc ngầm hitbox cao 20 (layout thử cũ 22) theo ảnh thật.

## Kết quả test
- `pytest tests`: 170 passed, 1 skipped — PASS (`test_app.py` skip vì thiếu `SUTA_TEST_DATABASE_URL`, test DB chưa chạy).
- L2-2 nạp màn 2: 25 sprite + 5 nền nạp đủ, không cảnh báo thiếu asset, không lỗi console (ngoài 401 khách) — PASS.
- L2-3 vác cọc: `p.anim` = `burdenRun` → phát `stake_run` (chụp, nam); chương 5 màn 1 vẫn gánh `burden_*` (775 frame gánh, không lỗi) — PASS; bản nữ chỉ kiểm có strip trong `manifest_shared.json`, chưa chụp.
- L2-4 cắm cọc: đống 1 → mốc 1 (2584) 3,2 s, → mốc 2 5,2 s (cùng 1 lượt ròng 8 s); cắm lúc `rising` vẫn được (bãi chưa ngập); 2 cọc thì đích chặn "Cần cắm thêm 1 cọc nữa." ở x 7594; 3 cọc thì qua màn, tiến trình `stakes: 3`, `rewards` đủ 3 — PASS.
- L2-5 đứng trên bãi khi triều lên: rơi ở pha `high`, −1 máu, hiện lại x 2450 (ngoài bãi) — PASS.
- L2-6 cọc ngầm: qua sông lúc ròng −1 máu ("Bạn va phải cọc ngầm!"), lúc lớn không trúng — PASS.
- L2-7 lưới: trúng thì choáng (`p.stun`), không mất máu; bè chỉ chết khi người chơi chém từ thuyền (log `strikeHazard`) — PASS. Không chém thì đi qua bè −1 máu (va chạm thân).
- L2-8 thuyền lửa: 70 px/s **không** tránh được (nhảy tại chỗ bay 0,70 s, cao 72 px, thuyền lửa 52 px chưa kịp lọt qua) → đổi 150 px/s: nhảy khi cách ≤ 25 px thì không trúng, cách 40 px thì trúng — PASS sau sửa.
- L2-9 NPC: khoá 3/6/10 sách, lính vây giữ thoại, bia trước NPC rút đúng pool (DĐN câu 49, KCH câu 11, NXN câu 28 ở 1 lượt) — PASS.
- L2-10 thoại: script so 27 chuỗi NQ-00 §4 với `dialogue-data.js`, khớp 27/27 — PASS.
- L2-11 hồi tưởng: Dương Đình Nghệ vẽ xám mờ, chân dung class `dialogue__portrait--memorial`, tiêu đề "Cha vợ, Tiết độ sứ — Hồi tưởng năm 937" (chụp) — PASS.
- L2-12 qua sông: khe 5 bằng thuyền 4,3–4,4 s; khe 8 4,6–4,8 s; khe 7 (160 px) nhảy + lướt qua khi tay không, đang vác thì rơi (đúng Q4); rơi giữa sông khe 5 → về x 3189 bờ trái, thuyền về `homeX` 3234 — PASS.
- L2-13 đi hết màn trong harness (gặp đủ 3 NPC, cắm 3 cọc, về đích): PASS. Người dùng chơi thử 12/11: ổn — PASS.
- L2-14 `?layout=engine` màn 1: 900 frame không lỗi, bè/cọc/mốc dùng sprite thật — PASS.
- L2-15 hồi quy: 900 frame mỗi màn — chương 1–6 màn 1, chương 5 màn 2, chương 7 màn 1, layout thử, màn 2: không lỗi mới (chương 1 vẫn 3 cảnh báo sprite cũ `PJ_OIL_JAR`, `FX_OIL_FIRE`, `PJ_ARROW_RAIN`) — PASS.

## Vấn đề asset
- Không có lỗi ảnh mới. Ghi chú (không giao Codex): `stake_run` cằm sát mép cọc khi phóng to (đã chấp nhận ở Gate B1); mốc vải `OB_NQ_STAKE_SPOT` nhỏ (8 px) — thấy được ở cỡ chơi nhưng nên xem lại khi chơi thử.

## Câu hỏi cho team / TODO
- **Cache manifest**: Flask trả `manifest_*.json` với `Cache-Control: public, max-age=86400`. Trình duyệt đã chơi chương 7 trong 24 giờ qua sẽ dùng manifest cũ (16 mục) và vẽ hộp tạm cho asset mới tới khi hết hạn — tái hiện được trong phiên này. Có từ trước, không thuộc NQ-L2; đề xuất một task nhỏ thêm tham số phiên bản cho URL manifest hoặc giảm max-age riêng cho JSON.
- TODO engine (từ NQ-L1, còn mở): nhảy khỏi thuyền đang chạy không mang theo vận tốc thuyền.
- Người dùng chơi thử màn 2 (12/11): ổn, giữ nguyên số.
- Tiếp: `NQ_ART_03` + NQ-L3 (tác dụng 3 phần thưởng ở màn 3).
