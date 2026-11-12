# SUTA — NQ-L3: Màn 3 "Đại thắng Bạch Đằng" (chương 7 Ngô Quyền)

> Trạng thái: **ĐÃ DUYỆT 12/11/2026** (người dùng duyệt Q1–Q4 theo đề xuất của Claude).
> Nguồn: [SUTA_NQ_TASK_00.md](SUTA_NQ_TASK_00.md) §0 quyết định 7–8, §3.4 (thiết kế màn 3 + 3 phần thưởng — đã duyệt), §5.2 (cutscene — đã duyệt nguyên văn), §5.3 (panel kết chương). Asset: đợt `NQ_ART_03` (đã chép bản chạy 12/11, `IN_GAME`) + `NQ_ART_02` (FX/icon phần thưởng).
> Mẫu: màn 3 chương Phùng Hưng (`phung-hung/boss.js`, `skills.js` — thanh đo thay máu boss, `LEVEL.update`/`cutscene`, khe kỹ năng), chương Mai Hắc Đế (`mai-hac-de/boss.js` — boss chỉ mất máu khi hở thế), chương Lý Nam Đế (máy bắn đá + vạch báo).
> Mọi số trong card là `DESIGN_BASELINE`, chỉnh khi chơi thử.

## 0. MỤC TIÊU

Thay đấu trường tạm (3 đợt lính) bằng trận boss thật ở cửa sông Bạch Đằng:

- **GĐ 1 — Nước lớn:** lái thuyền nhỏ né đá máy bắn đá + tên lửa; nhặt lao trên bè, ném lên lâu thuyền → thanh **Nhử địch** đầy.
- **GĐ 2 — Nước rút:** lâu thuyền mắc cọc; **số mảng giáp vỡ sẵn = số cọc đã cắm ở màn 2** (3–6); phá nốt giáp còn lại.
- **GĐ 3 — Xáp lá cà:** nhảy lên boong, đấu kiếm Lưu Hoằng Tháo; lướt né đúng lúc → hắn khựng, mở cửa phản đòn.
- Hạ boss → cutscene NQ-00 §5.2 → panel kết chương §5.3.
- **3 phần thưởng màn 2 có tác dụng** (khe kỹ năng K/L). Không có kỹ năng (vào bằng URL, chưa nhận thưởng) vẫn qua được.

## 1. ASSET + ENGINE

### 1.1 Khai báo asset (đã ở bản chạy)

| Asset | Dùng làm | Khai báo |
|---|---|---|
| `BOSS_LUU_HOANG_THAO` + `PORTRAIT_LUU_HOANG_THAO` | boss (chỉ vẽ theo tư thế, thân do `boss.js` lo — như PH) | `LEVEL_SPRITES[3]`, `PORTRAITS`, `BOSS` |
| `OB_NH_TOWER_SHIP` (idle/impale/stuck/sink) | lâu thuyền: vẽ ở lớp chương, bục boong (`platforms`) hàng 56 logic trên đáy ô, x 58–224 | `SHIP` |
| `OB_NH_SHIP_ARMOR` ×6 (idle/crack/break) | mảng giáp, hazard hp 2 tại 6 tâm (−76…64 bước 28, −37) | `SHIP.armor` |
| `OB_NH_SHIP_CATAPULT` | máy bắn đá trên boong, đá rời ô 5 tại (+18,25; −27) → `OB_BOULDER` vòng cung + vạch báo | `CATAPULT` |
| `EN_NH_ARCHER` ×2 | cung thủ trên boong (thrower hp 1), tên rời ô 5 tại (+9,25; −26) → `PJ_FIRE_ARROW` | `HAZARD_SPRITES.deckArcher`, `PROJECTILE_SPRITES.fireArrow` |
| `OB_NQ_JAVELIN_RAFT` ×2 | bè lao nổi: chạm thì cầm 1 lao (`CARRY.javelin`) | `HAZARD_SPRITES.javelinRaft` |
| `FX_NQ_WOOD_SPLINTER`, `FX_NQ_SPLASH`, `FX_BT_ARMOR_SPARK` | giáp vỡ / đá rơi nước, boss rơi / boss gạt đòn | lớp vẽ chương |
| `FX_NQ_IRON_STAKE`, `FX_NQ_DECOY_BOAT`, 3 `ICON_*` (`NQ_ART_02`) | kỹ năng K, L, ô HUD | `SKILLS` |
| `BG_NQ_MID_BACH_DANG_BATTLE` → `BG_NQ_MID_BACH_DANG_LOW_TIDE` | nền GĐ 1 → chuyển mờ 2 s khi triều rút (GĐ 2–3) | `LEVEL3_ZONES` + lớp L3-E2 |
| `PROP_NQ_STAKE_FIELD` | bãi cọc nhô quanh chân lâu thuyền lúc nước rút | `MAP_PROPS_IN_GAME` |
| Có sẵn: `OB_NQ_BOAT`, `EN_NH_SOLDIER`, `PJ_SPEAR`, `OB_BOULDER`, `ITEM_LND_HEAL`, `FX_BT_STUN`, `PROP_NQ_TIDAL_FLAT` | | `LEVEL_SPRITES[3]` |

### 1.2 Engine (2 thay đổi nhỏ, dùng chung)

| Mã | Nội dung | File |
|---|---|---|
| L3-E1 | **Số cọc sang màn sau**: `levelOptions.stakes = progress?.stakes ?? 0` (như `rewards`) để `LEVEL.content(options)` đọc được | `engine/main.js`, `engine/chapter.js` (ghi hợp đồng) |
| L3-E2 | **Lớp vẽ sau nền**: `hooks.draw.afterBackground?(time)` gọi sau lớp giữa, trước địa hình — chương vẽ nền thứ 2 mờ dần | `engine/render/index.js` (hoặc chỗ vẽ zone), `engine/chapter.js` |

Không đổi thuyền, triều (`forceTide` có sẵn), bục, ném lao, khe kỹ năng.

## 2. TRẬN ĐẤU (`DESIGN_BASELINE`)

**Đấu trường** 1 chunk (768 px), `arena: true`. Địa hình: bờ trái `#` x 0–96 (chỗ xuất phát + bến thuyền), còn lại **bãi triều `,`** (ngập lúc nước lớn = sông, lộ lúc nước rút = bùn đi được). Lâu thuyền neo bên phải: đáy ô tại x 480–736, mũi quay **trái** (về phía người chơi).

### GĐ 1 — Nước lớn (`forceTide('high')`)

- Người chơi lên thuyền nhỏ ở bến (x ≈ 120), chèo trong vùng nước x 96–470 (không tới sát lâu thuyền: thuyền nhỏ dừng ở mép x 470).
- **Máy bắn đá**: mỗi 3,6 s ra lệnh (`command` của boss) → vạch đỏ báo 1,0 s tại x người chơi → đá `OB_BOULDER` rơi vòng cung; trúng −1 máu; rơi xuống nước phát `FX_NQ_SPLASH`.
- **2 cung thủ** trên boong: mỗi 2,8 s lệch nhịp, tên lửa `PJ_FIRE_ARROW` nhắm người chơi, −1 máu. Hạ được (hp 1) bằng lao nhảy-ném; hồi sinh sau 8 s.
- **2 bè lao** trôi chậm qua lại giữa sông (x 180–420); chạm khi đang trên thuyền và tay không → cầm 1 lao; bè hết lao 5 s rồi có lại.
- **Thanh Nhử địch** (0–100, ô HUD boss): lao trúng mạn thuyền +20, hạ cung thủ +15, kỹ năng L +25. Đầy → GĐ 2.

### GĐ 2 — Nước rút

- Chuyển cảnh 3 s (người chơi không mất máu): lâu thuyền trôi trái 120 px vào bãi cọc (`idle` → `impale` + rung màn hình + `FX_NQ_WOOD_SPLINTER`) → `stuck`; `forceTide('low')`: bãi lộ thành bùn, thuyền nhỏ mắc lại; nền chuyển mờ sang `LOW_TIDE`; `PROP_NQ_STAKE_FIELD` hiện quanh chân thuyền.
- **Giáp**: `vỡ sẵn = clamp(stakes, 3, 6)` tấm (vào bằng URL/`?debug=1` = 3 — NQ-00 Q8), vỡ lần lượt theo mũi thuyền trong lúc `impale`. Tấm còn lại hp 2: chém (nhảy chém tới được — tâm giáp cao ~25 px trên bùn) hoặc lao trúng; trúng lần 1 `crack`, lần 2 `break`.
- Máy bắn đá ngừng (thuyền nghiêng); 2 cung thủ vẫn bắn; mỗi 6 s 1 lính Nam Hán nhảy từ boong xuống bùn (tối đa 2 cùng lúc), hạ thì có thể rơi bình máu (1 lần cả GĐ).
- Hết giáp → boong mở: Hoằng Tháo bước ra mũi thuyền (`walk`), câu báo "Nhảy lên boong!" → GĐ 3 khi người chơi đứng trên bục boong.

### GĐ 3 — Xáp lá cà trên boong

- Cung thủ + lính còn lại rút đi (biến mất), boss **hp 8** đứng trên boong, đi qua lại trong bục boong.
- **Đòn**: `attack_01` chém ngang (tầm 48, báo trước ô 1–4) và `attack_02` bổ dọc (tầm 41, báo trước dài ô 1–5), xen kẽ ngẫu nhiên, nghỉ 1,2 s giữa đòn. Trúng −1 máu.
- **Gạt đòn**: lúc thủ, đòn chém thường bị gạt (`FX_BT_ARMOR_SPARK`, câu nhắc) — không mất máu.
- **Phản đòn**: lướt (`dash`) xuyên qua đòn trong cửa sổ **0,25 s trước ô hit** → boss `stagger` 1,5 s, mỗi đòn chém trong lúc đó **−2 máu**. Ngoài ra sau `attack_02` (kiếm cắm ván, ô 7–9) chém được −1.
- Rơi khỏi boong xuống bùn: không mất máu, nhảy lên lại.
- Hết máu → `death` (rơi qua mép boong) + `FX_NQ_SPLASH` → cutscene.

### Bình máu
1 bình rơi từ lính GĐ 2 (lần đầu). Máu đầu màn 5 (+ không có thưởng máu ở chương này).

### Ô boss trên HUD (`hooks.updateHud`)
GĐ 1: "Nhử địch" x/100. GĐ 2: "Giáp lâu thuyền" còn n/6. GĐ 3: "Lưu Hoằng Tháo" máu x/8.

## 3. KỸ NĂNG (`CHAPTER.skills`, NQ-00 §3.4)

| Id | Phím | Tác dụng | Hồi |
|---|---|---|---|
| `BUFF_NQ_SWIFT` Thần Tốc Hành Quân | bị động | chạy nhanh ×1,2, chèo thuyền nhanh ×1,2 | — |
| `SK_NQ_IRON_STAKE` Cọc Sắt Bạch Đằng | K | dựng cọc sắt (`FX_NQ_IRON_STAKE` rise→hold→break) dưới chân mục tiêu gần nhất: lính −2 máu + khựng 1 s; GĐ 2 phá ngay 1 mảng giáp; GĐ 3 boss khựng (`stagger`) 1,5 s. GĐ 1 không có mục tiêu → báo "Chưa có chỗ dựng cọc" | 14 s |
| `SK_NQ_DECOY_BOAT` Thuyền Nhẹ Khiêu Chiến | L | lướt nhanh về trước 0,4 s + miễn sát thương 3 s (`FX_NQ_DECOY_BOAT` dưới chân); GĐ 1 +25 Nhử địch | 16 s |

## 4. CUTSCENE + KẾT CHƯƠNG

1. Boss rơi → dừng điều khiển, lâu thuyền phát `sink`, camera giữ.
2. 2 câu NQ-00 §5.2 (**nguyên văn**) hiện qua khung cốt truyện — người nói: xem **Q1**.
3. Nhân vật người chơi phát `victory` → `endGame(true)` → panel `CHAPTER_END` (§5.3, đã có trong `dialogue-data.js`).

## 5. NỘI DUNG CHỮ

- Cutscene: nguyên văn NQ-00 §5.2 (đã duyệt).
- Câu thông báo kỹ thuật **mới — chờ duyệt (Q4)**, Claude soạn nháp:

| Khi | Câu nháp |
|---|---|
| Vào GĐ 1 | "Nước lớn! Nhặt lao trên bè, ném vào lâu thuyền để nhử giặc vào bãi cọc." |
| Cầm lao lần đầu | "Đã nhặt lao. Nhảy lên rồi bấm Đánh để ném cao." |
| Vào GĐ 2 | "Nước rút! Lâu thuyền mắc cọc — phá nốt giáp mạn thuyền." |
| Giáp vỡ sẵn | `Bãi cọc đã phá ${n} mảng giáp!` |
| Hết giáp | "Nhảy lên boong!" |
| Boss gạt đòn | "Hoằng Tháo gạt đòn! Lướt né đúng lúc hắn chém để phản đòn." |
| Phản đòn mở | "Hắn hở thế — chém!" |
| K ở GĐ 1 | "Chưa có chỗ dựng cọc." |
| Bị đá trúng / tên trúng | "Bạn bị đá máy bắn đá trúng!" / "Bạn trúng tên lửa!" |

- Tên HUD: "Nhử địch", "Giáp lâu thuyền", "Lưu Hoằng Tháo".

## 6. FILE

| File | Việc |
|---|---|
| `engine/main.js`, `engine/render/index.js` (vẽ zone), `engine/chapter.js` | L3-E1, L3-E2 |
| `levels/ngo-quyen/config.js` | `LEVEL_SPRITES[3]`, `PORTRAITS` (+1), `LEVEL3_ZONES` (2 nền), `ARENA`, `LEVEL3_TERRAIN`, `SHIP`, `CATAPULT`, `RAFTS`, `BAIT`, `BOSS`, `BOSS_GUARD`, `SKILLS`, `BOSS_TEXT`, hazard/đạn mới, `MAP_PROPS_IN_GAME`; bỏ `WAVES` tạm |
| `levels/ngo-quyen/level3.js` | viết lại nội dung đấu trường + layout thử |
| `levels/ngo-quyen/boss.js` (mới) | `updateBattle` 3 GĐ, lâu thuyền, giáp, máy bắn đá, bè lao, boss, `updateCutscene`, `updateBossHud`, hook `onThrownHit` |
| `levels/ngo-quyen/skills.js` (mới) | 3 kỹ năng |
| `levels/ngo-quyen/render-extras.js` | lớp vẽ lâu thuyền, giáp, máy bắn đá, vạch báo, FX, nền nước rút (`afterBackground`) |
| `levels/ngo-quyen/chapter.js` | levels[3] (`update`, `cutscene`, `skills: true`, `testLayout`), `skills`, `hooks`, `enemyKinds` |
| `levels/ngo-quyen/dialogue-data.js` | cutscene §5.2 |
| `.claude/rules/ngo-quyen-gameplay.md`, `.claude/rules/engine.md` | cập nhật |
| `docs/REPORT_NQ-L3.md` | report |

Chỉ đọc: `phung-hung/{boss,skills}.js`, `mai-hac-de/boss.js`, `ly-nam-de/boss.js` (máy bắn đá), engine.

Layout thử: `?layout=lowtide` vào thẳng GĐ 2 (thêm `?debug=1` để đủ 3 kỹ năng).

## 7. TEST

| # | Kiểm | Cách |
|---|---|---|
| L3-1 | `pytest tests` xanh | |
| L3-2 | Màn 3 nạp không lỗi, không hộp tạm | `/verify-ui` |
| L3-3 | GĐ 1: đá rơi đúng vạch báo, tên nhắm người chơi; nhặt lao từ bè; lao trúng mạn +20; đầy thanh → GĐ 2 | harness |
| L3-4 | GĐ 2: giáp vỡ sẵn đúng `clamp(stakes,3,6)` với stakes 0/3/5/6; giáp còn lại 2 đòn; bùn đi được, thuyền nhỏ mắc | harness |
| L3-5 | GĐ 3: lên boong được từ bùn (đo cú nhảy); boss gạt đòn thường; lướt đúng cửa sổ → `stagger`, chém −2; hp 8 → cutscene → panel | harness |
| L3-6 | Không kỹ năng vẫn thắng; có đủ 3 kỹ năng: K/L/bị động đúng số | harness |
| L3-7 | Cutscene nguyên văn §5.2; panel kết chương; tiến trình `level3Complete`, thành tựu chương (server) | harness + `pytest` |
| L3-8 | Đồ hoạ: lâu thuyền + giáp khớp (cả lúc nghiêng 1,2°), nền chuyển mờ, bãi cọc | chụp |
| L3-9 | Hồi quy 900 frame các chương 1–7 | harness |
| L3-10 | Người dùng chơi thử | |

## 8. CÂU HỎI CẦN CHỐT

| # | Câu hỏi | Đề xuất của Claude |
|---|---|---|
| Q1 | 2 câu cutscene §5.2 do ai "nói" (khung cốt truyện cần chân dung + tên)? | **Ngô Quyền** (chân dung có sẵn) — như Phùng Hưng ở chương 6; (b) khung không chân dung, tên "Sử chép" |
| Q2 | Boss gạt đòn chém thường ở GĐ 3 (chỉ mất máu khi phản đòn / kiếm cắm ván / kỹ năng K)? | **Có** — bám thiết kế "lướt né → phản đòn"; (b) đòn thường vẫn −1 máu, phản đòn ×2 (dễ hơn) |
| Q3 | Lính Nam Hán nhảy xuống bùn ở GĐ 2? | **Có** (tối đa 2, để K có mục tiêu + rơi bình máu); (b) không lính, chỉ cung thủ |
| Q4 | Duyệt các câu thông báo mục 5 | Duyệt như nháp |

## 9. GATE

1. Người dùng duyệt card + Q1–Q4 → code.
2. Xong: test mục 7, `/verify-ui`, `/task-report` → `docs/REPORT_NQ-L3.md`; người dùng chơi thử.
3. Chỉ commit khi người dùng yêu cầu. Sau NQ-L3: chương 7 xong (còn nhạc riêng — `TODO_MISSING`).
