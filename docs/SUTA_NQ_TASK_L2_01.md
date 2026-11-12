# SUTA — NQ-L2: Màn 2 "Trận địa cọc ngầm" (chương 7 Ngô Quyền)

> Trạng thái: **ĐÃ DUYỆT 12/11/2026** (người dùng duyệt Q1–Q5 theo đề xuất của Claude).
> Nguồn: [SUTA_NQ_TASK_00.md](SUTA_NQ_TASK_00.md) §3.2 (thiết kế), §3.3 (pool câu hỏi), §4 (thoại 3 NPC — đã duyệt nguyên văn), §0 Q1–Q3 (hồi tưởng / tương truyền), §3.4 (phần thưởng). Asset: đợt `NQ_ART_02` (đã chép bản chạy 12/11, `IN_GAME`).
> Mẫu: màn 2 chương Phùng Hưng (`phung-hung/level2.js` — NPC + lính vây + bia + sách khoá), màn 1 chương 7 (`level1.js` — thuyền, xoáy, gió, cá sấu).
> Mọi số trong card là `DESIGN_BASELINE`, chỉnh khi chơi thử.

## 0. MỤC TIÊU

Thay khung tạm màn 2 (4 chunk, 2 lính, 3 bia) bằng màn thật 10 chunk cố định:

- rừng ven sông Bạch Đằng, xưởng đẽo cọc (chunk 1–3) → bãi cửa sông lúc triều (4–7) → bến thuyền ta (8–10);
- **cắm cọc theo triều** (NQ-ENGINE E2 + E5): vác cọc từ đống cọc, ra bãi bùn lúc nước ròng, bấm Đánh ở mốc; **6 mốc, tối thiểu 3** mới về đích; số cọc ghi vào tiến trình (đã có ở engine, migration 013);
- **3 NPC** khoá 3 / 6 / 10 sách, mỗi NPC 2 lính vây + 1 bia trước mặt; thoại + câu hỏi + phần thưởng NQ-00 §4 chép nguyên văn;
- **quân Nam Hán**: lính đao (`EN_NH_SOLDIER`), bè quăng lưới (choáng), thuyền hỏa công trôi trên sông;
- cọc ngầm của ta: thuyền va lúc nước ròng −1 máu.

Ngoài phạm vi: cơ chế 3 phần thưởng (`BUFF_NQ_SWIFT`, `SK_NQ_IRON_STAKE`, `SK_NQ_DECOY_BOAT`) — làm ở NQ-L3; màn 3.

## 1. ASSET + ENGINE

### 1.1 Asset (đã ở bản chạy — chỉ khai báo trong `config.js`)

| Asset | Dùng làm | Khai báo |
|---|---|---|
| `EN_NH_SOLDIER` (idle, walk, attack_01 hit 4, hurt, death) | lính Nam Hán (đi tuần, lính vây NPC) | `ENEMY_SPRITES.nh`, `LEVEL_SPRITES[2]` |
| `EN_NH_NET_RAFT` (idle, throw nhả ô 5, hurt, death) + `PJ_NQ_NET` | bè quăng lưới — thay hộp `netThrower` (`EN_NQ_NET_THROWER` tạm) | `HAZARD_SPRITES.netRaft`, `PROJECTILE_SPRITES.net` |
| `OB_NQ_FIRE_BOAT` (move, death) | thuyền hỏa công trôi trên khe sông | `HAZARD_SPRITES.fireBoat` |
| `OB_NQ_STAKE_PILE` | đống cọc (nguồn vác) | `HAZARD_SPRITES.stakePile` |
| `OB_NQ_STAKE_SPOT` (spot, planted) | mốc cắm cọc | `STAKES.sprite` |
| `OB_NQ_HIDDEN_STAKE` | cọc ngầm theo triều | `HAZARD_SPRITES.hiddenStake` |
| `NPC_DUONG_DINH_NGHE`, `NPC_KIEU_CONG_HAN`, `NPC_NGO_XUONG_NGAP` + 3 `PORTRAIT_*` | 3 NPC màn 2 | `NPC_SPRITES`, `PORTRAITS`, `LEVEL_SPRITES[2]` |
| `PLAYER_*.stake_idle` / `stake_run` (`manifest_shared.json`) | vác cọc | engine mục 1.2 |
| `BG_NQ_MID_RIVERSIDE_FOREST`, `BG_NQ_MID_BACH_DANG_ESTUARY`, `BG_NQ_MID_OUR_DOCK` | nền 3 vùng | `LEVEL2_ZONES` |
| `PROP_NQ_TIDAL_FLAT` (64×16, lặp ngang) | mặt bãi triều `','` lúc nước ròng | `TILES.flat` (xem cách vẽ bãi của `render/terrain.js`), `MAP_PROPS_IN_GAME` |
| Mượn lại màn 1: `OB_NQ_BOAT`, `EN_CROCODILE`, `FX_NQ_GUST`/`OB_NQ_WIND_ROCK` (gió + đá), `ITEM_LND_HEAL`, `EN_NQ_KCT_SPEARMAN` (nếu Q2 chọn a) | | `LEVEL_SPRITES[2]` |

Chưa dùng ở màn 2 (để NQ-L3): 3 icon phần thưởng (`ICON_*` — có thể hiện ở panel nhận thưởng nếu engine đã hỗ trợ icon thưởng, kiểm tra khi làm), `FX_NQ_IRON_STAKE`, `FX_NQ_DECOY_BOAT`.

### 1.2 Engine (2 thay đổi nhỏ, dùng chung)

| Mã | Nội dung | File |
|---|---|---|
| L2-E1 | **Strip vác theo chương**: `CHAPTER.burdenAnims?: { idle, run }` (vd. `{ idle: 'stake_idle', run: 'stake_run' }`). Có thì `burdenIdle`/`burdenRun` phát strip đó; thiếu strip thì lùi về `burden_idle`/`burden_run` rồi `idle`/`run` như cũ. Chương 5 (Mai Hắc Đế) không khai báo → không đổi | `engine/config.js` (`PLAYER_ANIMATIONS`), chỗ render tra anim người chơi, `engine/chapter.js` (ghi hợp đồng) |
| L2-E2 | **NPC hồi tưởng**: `NPC_SPRITES[id].memorial: true` → vẽ NPC xám + mờ (`ctx.filter = 'grayscale(1)'`, alpha .7); thoại NPC có `memorial: true` → chân dung dùng class `dialogue__portrait--memorial` (đang có cho cốt truyện) | `engine/render/entities.js` (vẽ NPC), `engine/dialogue.js`, `engine/chapter.js` |

Không đổi cơ chế triều, cắm cọc, lưới, thuyền (NQ-ENGINE đã có).

### 1.3 Hitbox (`DESIGN_BASELINE`, số đo từ report Codex)

| Thực thể | Hitbox | Ghi chú |
|---|---|---|
| Lính Nam Hán | `SOLDIER` w 22 h 34 hp 2 (như màn 1) | tầm đao ô 4 = 40,25 px logic → `NH_GUARD.attackReach` 40, boxY 10, boxH 10 |
| Bè quăng lưới | thrower w 20 h 34, hp 1, `muzzle` 26; bè đứng trên mặt nước (đáy ô chìm 6 px dưới lớp nước như `OB_NQ_BOAT`) | `fireInterval` 2,6 s, `fireRange` 260, lưới vòng cung `flightTime` .9, choáng 1 s, không mất máu |
| Thuyền hỏa công | w 52 h 18, sát thương 1, nhảy qua được | trôi trái 70 px/s trong khe sông, ra khỏi mép khe thì phát `death` (chìm) rồi lặp sau 3 s |
| Đống cọc | w 30 h 20 (như layout thử) | vác vô hạn |
| Mốc cắm cọc | `STAKES` w 8 h 28 (cọc đã cắm cao 27,75) | |
| Cọc ngầm | w 10 h 20, `tideOnly: 'low'`, damage 1 | |

## 2. BỐ CỤC (10 chunk, đặt cố định, `DESIGN_BASELINE`)

Ký hiệu địa hình như màn 1: `#` đất, `~` sông, `,` bãi triều (ngập lúc nước lớn).

| Chunk | Vùng / nền | Nội dung |
|---|---|---|
| 1 | Rừng ven sông | 2 sách, 1 lính Nam Hán đi tuần, tip vác cọc chưa hiện |
| 2 | Rừng | 1 sách (đủ 3) → bia + **Dương Đình Nghệ** (cần 3 sách, hồi tưởng 937), 2 lính vây |
| 3 | Xưởng đẽo cọc | 3 sách (đủ 6) → bia + **Kiều Công Hãn** (cần 6), 2 lính vây; **đống cọc 1** ngay sau NPC + tip vác cọc |
| 4 | Bãi cửa sông | bãi triều 384 px + **2 mốc**; tip triều (lần đầu thấy bãi) |
| 5 | Bãi cửa sông | khe sông 448 px + thuyền + **bè quăng lưới** giữa dòng + **2 cọc ngầm** + 1 sách treo giữa sông |
| 6 | Bãi cửa sông | **đống cọc 2** + bãi triều 320 px + **2 mốc**; 1 vùng gió + đá nấp; 1 sách |
| 7 | Bãi cửa sông | bãi triều 256 px + **2 mốc**; khe nhỏ 160 px + cá sấu (nhảy + lướt qua được — không khi đang vác cọc, xem Q4) |
| 8 | Bến thuyền ta | khe sông 448 px + thuyền + **thuyền hỏa công** + bè quăng lưới; 1 sách |
| 9 | Bến thuyền ta | 2 lính Nam Hán, nghỉ chân hồi máu (1 lần), 1 sách (đủ 10) |
| 10 | Bến thuyền ta | bia + **Ngô Xương Ngập** (cần 10), 2 lính vây; đích cuối chunk (không cổng, như PH màn 2). Chưa đủ 3 cọc → `stakesMissing` chặn đích |

- Triều: `LEVEL2.tide = { low: 8, warn: 2, high: 6 }` — ròng 8 s đủ vác cọc từ đống ra 2 mốc gần; triều lên thì đứng trên bãi sẽ rơi (về chỗ đứng vững −1 máu, như rơi sông).
- 10 sách + 3 bia (pool `duongDinhNghe` / `kieuCongHan` / `ngoXuongNgap`, 1 câu ngẫu nhiên mỗi bia — đã có trong `QUIZ`).
- Thuyền: như màn 1 (`returnBoats` khi người chơi về bờ trái khe).
- Kiểm `checkNpcClearance` + `checkTerrainFootprints` như PH màn 2.

## 3. CƠ CHẾ RIÊNG MÀN

### 3.1 Vác + cắm cọc

- Chạm đống cọc (bấm Đánh) → vác 1 cọc: strip `stake_idle`/`stake_run` (L2-E1), đi chậm, khoá lướt (số gánh nặng engine).
- Tới mốc trên bãi lúc nước ròng → bấm Đánh = cắm (`stakePlanted` x/6). Nước lớn → `stakeFlooded`.
- Đang vác vẫn nhảy được (thấp hơn); trúng đòn **không** rơi cọc (giữ như engine E5 hiện tại).
- HUD ô đếm cọc `x/6` (đã có). `CHAPTER.stakeIcon` nhận ID **prop map** nên không dùng sprite mốc; để trống (ô đếm chữ) trừ khi kiểm thấy engine nhận được sprite.

### 3.2 NPC

- 3 NPC theo hợp đồng `makeNpc(id, chunk, localX, { requires })`, khoá NPC trùng khoá pool câu hỏi.
- Dương Đình Nghệ: `memorial: true` (L2-E2) — NPC xám mờ, chân dung trắng đen.
- Phần thưởng nhận ở màn 2 (đã có `REWARD_NAMES`, id khớp seed `012`); chưa có tác dụng tới NQ-L3.

### 3.3 Tip (thông báo, mỗi tip 1 lần)

Câu chữ mới — **chờ duyệt** (Claude soạn nháp, không phải nội dung lịch sử):

| Chỗ | Câu nháp |
|---|---|
| Đống cọc 1 (chunk 3) | "Đống cọc gỗ bịt sắt! Bấm Đánh để vác một cọc." |
| Bãi triều đầu tiên (chunk 4) | "Nước ròng lộ bãi bùn: cắm cọc vào mốc. Nước lên thì rời bãi ngay!" |
| Bè quăng lưới (chunk 5) | "Thuyền do thám Nam Hán quăng lưới! Trúng lưới sẽ bị khựng." |
| Thuyền hỏa công (chunk 8) | "Thuyền lửa trôi xuôi dòng! Nhảy tránh." |

Các câu đã có trong `TEXT` (`stakePicked`, `stakePlanted`, `stakeFlooded`, `stakesMissing`, `tideRising`, `tideFalling`, `burdenHint`) giữ nguyên.

## 4. NỘI DUNG CHỮ (đã duyệt — chép nguyên văn NQ-00)

- `dialogue-data.js` thêm `NPC_DIALOGUES` 3 NPC, chép **nguyên văn** NQ-00 §4.1–4.3: `lines`, `question`, `answers` (đáp án đúng đứng đầu), `hint`, `why`, `reward.text`. Kiểm bằng script so chuỗi với NQ-00 như NQ-L1.
- `title` (dòng chú trên khung thoại) — xem **Q1**.
- Tên màn: "Màn 2: Trận địa cọc ngầm" (đã có).
- `summary` màn 2: `Bạn thu thập ${books}/10 Quyển Sách Tinh Hoa, cắm ${stakes}/6 cọc và đạt ${score} điểm.` (câu mới, chờ duyệt cùng tip).

## 5. FILE

| File | Việc |
|---|---|
| `frontend/static/js/engine/config.js`, render người chơi, `engine/chapter.js` | L2-E1 |
| `frontend/static/js/engine/render/entities.js`, `engine/dialogue.js` | L2-E2 |
| `frontend/static/js/levels/ngo-quyen/config.js` | `LEVEL_SPRITES[2]`, `PORTRAITS` (+3), `LEVEL2_CHUNKS` 10, `LEVEL2_ZONES` (3 vùng), `LEVEL2_FINISH_X`, `LEVEL2` (bố cục mục 2), `LEVEL2_RIVERS`, `LEVEL2_NPCS`, `CAPTORS`, `QUIZ.level2Spots`, `ENEMY_SPRITES.nh` + `NH_GUARD`, `HAZARD_SPRITES` (netRaft, fireBoat, stakePile, hiddenStake thật), `PROJECTILE_SPRITES.net`, `STAKES.sprite`, `NPC_SPRITES` (+3), `TILES.flat`, `MAP_PROPS_IN_GAME`, `TEXT` (tip mới); `ENGINE_TEST` đổi sang asset thật |
| `frontend/static/js/levels/ngo-quyen/level2.js` | viết lại theo mục 2–3 |
| `frontend/static/js/levels/ngo-quyen/chapter.js` | `burdenAnims`, levels[2] (`chunks`, `zones`, `tide`, `stakesRequired` 3, `summary`, `events`), `stateFields` thêm cờ tip màn 2 |
| `frontend/static/js/levels/ngo-quyen/dialogue-data.js` | `NPC_DIALOGUES` (mục 4) |
| `frontend/static/js/levels/ngo-quyen/level1.js` | chỉ export hàm dựng dùng lại (`makeBoat`, `makeGust`…) nếu cần, không đổi màn 1 |
| `.claude/rules/ngo-quyen-gameplay.md`, `.claude/rules/engine.md` | cập nhật màn 2 + L2-E1/E2 |
| `docs/REPORT_NQ-L2.md` | report |

Chỉ đọc: `phung-hung/level2.js`, `engine/{player,tide,hazards,entities,state,level-flow}.js`, NQ-00.

## 6. TEST

| # | Kiểm | Cách |
|---|---|---|
| L2-1 | `pytest tests` xanh | |
| L2-2 | Màn 2 nạp không lỗi console, không sprite hộp tạm (trừ thứ ghi chú) | `/verify-ui`, `?debug=1` |
| L2-3 | Vác cọc phát `stake_idle`/`stake_run` (nam + nữ); chương 5 vẫn phát `burden_*` | harness + chụp |
| L2-4 | Cắm được lúc ròng, bị chặn lúc lớn; đếm HUD x/6; < 3 cọc thì chặn đích, ≥ 3 qua; tiến trình lưu `stakes` | harness `step()` |
| L2-5 | Đứng trên bãi khi triều lên → rơi, về chỗ vững −1 máu, không kẹt | harness |
| L2-6 | Cọc ngầm: thuyền va lúc ròng −1 máu, lúc lớn đi qua | harness |
| L2-7 | Lưới trúng → choáng 1 s, không mất máu; hạ được bè (hp 1) | harness |
| L2-8 | Thuyền hỏa công trôi trong khe, chạm −1 máu, nhảy qua được, chìm ở mép khe rồi lặp | harness |
| L2-9 | 3 NPC khoá đúng 3/6/10 sách; lính vây giữ thoại; bia trước NPC đúng pool | harness |
| L2-10 | Thoại 3 NPC khớp NQ-00 §4 từng chữ | script so chuỗi |
| L2-11 | Dương Đình Nghệ vẽ xám mờ, chân dung trắng đen; 2 NPC kia màu | chụp |
| L2-12 | Mọi khe sông qua được (thuyền hoặc nhảy + lướt), khe 7 nhảy qua được khi **không** vác; rơi giữa sông không kẹt (`returnBoats`) | harness đo |
| L2-13 | Đi hết màn từ đầu tới đích (cắm 3 và 6 cọc) trong harness; thời gian chơi ước tính | harness |
| L2-14 | `?layout=engine` màn 1 vẫn chạy, giờ vẽ asset thật | harness + chụp |
| L2-15 | Hồi quy: chạy 900 frame mỗi chương 1–6 + màn 1 chương 7, không lỗi mới | harness |

## 7. CÂU HỎI CẦN CHỐT

| # | Câu hỏi | Đề xuất của Claude |
|---|---|---|
| Q1 | Dòng `title` trên khung thoại 3 NPC | Lấy **nguyên văn chú thích A1** + dòng chú đã chốt ở NQ-00 (như PH: "Tướng tài kiệt xuất — Tương truyền"): **"Cha vợ, Tiết độ sứ — Hồi tưởng năm 937"**, **"Tướng tài, cháu nội Kiều Công Tiễn nhưng trung thành với nước — Tương truyền"**, **"Con trai trưởng, Tướng tiên phong — Tương truyền"** |
| Q2 | 2 lính vây Dương Đình Nghệ (cảnh hồi tưởng năm 937, trước khi Nam Hán sang) là quân nào? | **(a) lính Kiều Công Tiễn** (`EN_NQ_KCT_SPEARMAN` — Tiễn giết ông năm 937, khớp sử); (b) lính Nam Hán như 2 NPC kia |
| Q3 | Đống cọc: mấy đống? | **2 đống** (chunk 3 sau Kiều Công Hãn + chunk 6), mỗi lần vác 1 cọc, quãng đi về ≤ 1 chunk; (b) 1 đống ở xưởng chunk 3 như NQ-00 viết (đi về tới 4 chunk, dài) |
| Q4 | Đang vác cọc có lên thuyền / nhảy qua khe được không? | **Được lên thuyền** (chở cọc qua sông), nhảy thấp hơn; khe 7 (cá sấu) không qua được khi vác — mốc chunk 7 đặt **trước** khe nên không cần vác qua |
| Q5 | Duyệt 4 tip + câu `summary` mục 3.3, 4 | Duyệt như nháp |

## 8. GATE

1. Người dùng duyệt card + Q1–Q5 → code.
2. Xong: test mục 6, `/verify-ui`, `/task-report` → `docs/REPORT_NQ-L2.md`; người dùng chơi thử.
3. Chỉ commit khi người dùng yêu cầu. Sau đó: `NQ_ART_03` + NQ-L3.
