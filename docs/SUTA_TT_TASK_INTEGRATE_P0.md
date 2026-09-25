# SỬ TA — CHƯƠNG TRƯNG TRẮC
# TASK CARD: CHUYỂN SANG CANVAS PIXEL 480×270 VÀ TÍCH HỢP SPRITE 8-BIT

TASK_ID: TT-INT-01 • Version 2.0 • 25/09/2026 (thay thế hoàn toàn bản 1.0)
Thư mục code: `frontend/static/js/levels/trung-trac/`
Tài liệu liên quan (READ-ONLY): `CLAUDE.md`, `docs/SUTA_TT_SPRITE_BRIEF.md`, `manifest_tt.json`

---

## 0. MỤC TIÊU

Team đã quyết định chuyển màn Trưng Trắc sang **canvas pixel độ phân giải logic 480×270**, phóng to bội số nguyên, và thay asset cũ bằng **bộ sprite 8-bit mới** (Codex vẽ, đã `QA_PASS`).

Kết quả cuối cùng:
1. Mọi thứ trong màn được vẽ lên một canvas logic 480×270, rồi phóng to lên màn hình theo bội số nguyên, pixel sắc nét.
2. Toàn bộ toạ độ và hằng số vật lý được quy đổi sang đơn vị pixel logic mới, **cảm giác chơi (tốc độ, độ cao nhảy, dash, nhịp màn) giữ nguyên**.
3. Nhân vật chính chuyển từ GIF trong `<div>` sang PNG strip vẽ trên canvas.
4. Hazard, enemy, boss, projectile dùng sprite mới, animation chạy theo trạng thái.

**Giữ nguyên, không thiết kế lại:** hệ `hazards` (`roller`/`thrower`/`trap`/`boat`/`prop`), `obstacles`, `projectiles`, `books`, `questionPanel`, HUD DOM, điều khiển bàn phím + cảm ứng, `randomizeObstacles()` và quy tắc 12 chướng ngại vật, luồng thắng/thua. Dữ liệu màn vẫn nằm trong `state.js`/`config.js` như hiện tại (không tách JSON).

**Ngoài phạm vi:** cơ chế mới (hổ vồ, boss 3 giai đoạn, NPC, quiz mới, buff/kỹ năng), vẽ lại map/background, âm thanh, backend Flask, auth.

---

## 1. QUY TẮC

1. Tuân thủ toàn bộ `CLAUDE.md`. Mâu thuẫn giữa task card và code thực tế → dừng và báo.
2. Không sửa, không vẽ lại PNG/GIF. Được **sao chép** file sprite mới vào thư mục static nếu cần (sau khi kế hoạch được duyệt). Không xoá asset cũ; chỉ ngừng tham chiếu.
3. Không đổi ID, tên animation, số frame, `hit_frame` của bộ sprite mới. Trong manifest chỉ được sửa trường `status`.
4. Không thêm thư viện/framework, không bundler. Giữ ES modules và cấu trúc DAG hiện có; thêm module mới chỉ khi thật cần và ghi lý do.
5. Làm theo **3 phase**, mỗi phase kết thúc bằng test + báo cáo + **dừng chờ duyệt** (mục 4).
6. Thiếu asset hoặc dữ liệu → `TODO_MISSING` + dùng fallback ghi trong mục 3, không tự bịa.

---

## 2. BƯỚC 0 — KHẢO SÁT, ĐO ĐẠC, LẬP KẾ HOẠCH (CHỈ ĐỌC)

1. Đọc toàn bộ module trong `trung-trac/`, template và CSS của màn.
2. **Đo hệ toạ độ hiện tại:** kích thước canvas logic (width/height), cách camera đi theo nhân vật, `GROUND_Y`, `GROUND_LAYER_TOP`, `GROUND_GRASS_OFFSET`, chiều dài chunk (1280).
3. Tính **hệ số quy đổi `k = 270 / chiều_cao_canvas_hiện_tại`**. Nếu tỉ lệ khung hiện tại không phải 16:9, nêu cách xử lý phần chiều ngang (tầm nhìn rộng hơn/hẹp hơn) và đề xuất.
4. Lập bảng **mọi hằng số chịu ảnh hưởng** (vị trí, kích thước, tốc độ, gia tốc, trọng lực, lực nhảy, dash, hitbox, `triggerX`, `fireRange`, `triggerDistance`, `PROJECTILE_MAX_RANGE`, `HAZARD_SPRITE_SIZES`, `PROJECTILE_SIZES`, `LANDMARKS`, `OBSTACLE_GROUPS`…) với giá trị hiện tại và giá trị dự kiến sau quy đổi. Hằng số tính theo thời gian (giây, cooldown) **không** nhân `k`.
5. Tìm vị trí thực tế của bộ sprite mới và `manifest_tt.json`. Nếu nằm ngoài `frontend/static/`, đề xuất nơi sao chép (vd. `frontend/static/assets/images/sprites-8bit/`) để Flask phục vụ được.
6. Lập **bảng ánh xạ** asset cũ → asset mới theo mục 3.3–3.5, đánh dấu chỗ nào thiếu.
7. Viết `docs/INTEGRATION_PLAN_TT.md`: sơ đồ module, OWNED FILES theo từng phase, READ-ONLY FILES, bảng quy đổi, bảng ánh xạ, rủi ro, câu hỏi cho team.
8. **DỪNG. Chờ duyệt.**

---

## 3. NỘI DUNG TRIỂN KHAI

### PHASE 1 — Hiển thị 480×270 và quy đổi toạ độ (chưa đổi sprite)

**3.1 Canvas và scale**
- Toàn bộ scene vẽ lên canvas logic **480×270**; hiển thị lên màn hình bằng **bội số nguyên lớn nhất vừa khung**, phần thừa là viền (letterbox). Tính lại khi đổi kích thước/xoay màn hình.
- Màn hình nhỏ hơn 480×270 ở ×1 (điện thoại dọc): cho phép scale lẻ < 1 **chỉ trong trường hợp này**, ghi rõ trong code.
- `imageSmoothingEnabled = false` khi vẽ sprite; CSS `image-rendering: pixelated` cho canvas hiển thị.
- Làm tròn toạ độ vẽ (`Math.round`) sau khi trừ camera để sprite không rung hình.
- Hằng số độ phân giải logic đặt một chỗ trong `config.js`.
- HUD DOM, `questionPanel`, nút cảm ứng phải nằm đúng trên vùng canvas sau khi letterbox (không lệch ra viền).

**3.2 Quy đổi đơn vị**
- Áp dụng bảng quy đổi đã duyệt ở Bước 0. Mọi giá trị không gian nhân `k` và làm tròn hợp lý.
- Background hiện tại (`sky`, `foreground`, `ground.png`, `LANDMARKS`): vẽ thu nhỏ theo `k`. Riêng các lớp nền được phép bật smoothing khi thu nhỏ để đỡ răng cưa (tắt lại trước khi vẽ sprite). `GROUND_Y` quy đổi sao cho vẫn nằm đúng mép cỏ của ảnh đất. Ghi `TODO_MAP` — nền sẽ được vẽ lại theo brief môi trường sau.
- Obstacles tĩnh (`fallenBranch`, `stoneBlock`, `reedCurtain`…): giữ ảnh cũ, vẽ theo cỡ đã quy đổi.
- Nhân vật chính trong Phase 1: tạm vẽ **hộp placeholder** trên canvas theo hitbox đã quy đổi (hoặc giữ GIF nếu định vị được chính xác — nêu lựa chọn trong kế hoạch).

**Test Phase 1:** chơi hết màn; so sánh với bản cũ: độ cao nhảy so với obstacle, khoảng dash, vượt được `reedCurtain` bằng dash, thời gian đi hết màn, vị trí rơi của sách, hazard kích hoạt đúng lúc. Mọi khác biệt ghi vào report.

### PHASE 2 — Nhân vật chính sang PNG strip trên canvas

- Bỏ việc vẽ nhân vật bằng `<div>` GIF (giữ file GIF và `tools/normalize_player_gifs.py`, chỉ ngừng dùng). Vẽ `PLAYER_TRUNG_TRAC` bằng strip, pivot bottom-center tại chân, lật ngang theo hướng chạy (sprite gốc quay **phải**).
- Mỗi entity có trạng thái animation riêng (tên animation + thời gian đã chạy). Không khởi động lại animation nếu đang phát đúng animation đó. Animation không lặp dừng ở frame cuối.
- Ánh xạ trạng thái (giữ thứ tự ưu tiên hiện có `hurt > dash > attack > jump > run > idle`):

| Trạng thái hiện tại | Animation mới | Ghi chú |
|---|---|---|
| idle (stance) | `idle` 4f | lặp |
| run | `run` 6f | lặp |
| jump | `jump` 3f | chọn frame theo vận tốc dọc: lên / gần đỉnh / rơi |
| attack | `attack_01` 6f | tổng thời lượng animation = `attackCooldown` hiện tại; cửa sổ gây sát thương (`attacking`) bắt đầu tại `hit_frame` 3. Ghi fps và thời điểm thực tế vào report |
| hurt | `hurt` 2f | theo `hurtTimer` |
| dash | **thiếu asset** | `TODO_MISSING`: tạm dùng frame cuối của `run` hoặc frame 3 của `attack_01` kèm vệt mờ vẽ bằng code (nêu lựa chọn). Ghi yêu cầu vẽ `dash` cho Codex vào report |
| thua / hết máu | `death` 5f | phát một lần nếu luồng thua có trạng thái chết; nếu không có thì ghi chú, không tạo cơ chế mới |

- Hitbox nhân vật: định nghĩa theo pixel logic, tương đối với pivot, **không lấy từ kích thước ảnh**. Kiểm tra lại với obstacle `overhead` (dash phải chui qua được) và platform.

**Test Phase 2:** đổi qua lại mọi trạng thái, chân không nhảy lệch; đánh liên tục không reset giữa chừng; mỗi đòn chỉ trúng một mục tiêu một lần; dash vẫn bất tử và qua được `reedCurtain`; lật trái/phải đúng.

### PHASE 3 — Hazard, enemy, boss, projectile

Tất cả sprite mới quay mặt **phải** → khai báo `facing: 'right'` cho mọi strip mới. Kiểm tra hướng mặt thật trong ảnh theo đúng lưu ý của CLAUDE.md.

**3.3 Hazards**

| kind | Hazard hiện tại | Asset mới | Animation |
|---|---|---|---|
| roller | Kiệu quan | `EN_HAN_PALANQUIN` | `walk` khi lăn; `break` khi bị chém hết máu (nếu kiệu có hp) |
| roller | Hổ | `EN_TIGER` | `run` khi lao; `death` khi hết máu. Không thêm hành vi vồ |
| roller | Xe cống | `OB_TRIBUTE_CART` | `roll`; khi vỡ phát `break`. Frame cuối của `break` gần trống nên hành vi `wreckSprite` (xác xe nằm lại) cần quyết định: giữ ảnh xác xe cũ, hay bỏ xác xe. Nêu trong kế hoạch, chờ team chọn |
| roller | Kỵ binh | `EN_HAN_CAVALRY` | `gallop`; `death` |
| thrower | Lính thu thuế | `EN_HAN_TAXMAN` | `idle` khi chờ; chuỗi `throw` 6f, đạn sinh tại `hit_frame` 4 (thay cho bước `release: true`); `death` |
| thrower | Lính gác tháp | `EN_HAN_WATCHTOWER` | `idle`, `alarm` (tù và), `throw` (đạn tại frame 4), `death` |
| prop | Tháp canh | `PROP_WATCHTOWER` | 1 frame tĩnh |
| trap | Cỏ → hố chông | `TR_SPIKE_PIT` | `hidden` → `reveal` một lần khi tới `triggerDistance`. Ảnh mới 48×16 là hố nông, không phải mặt cắt: xem lại `groundLine`/`pitLeft`/`pitRight` cho phù hợp, ghi lựa chọn |
| boat | Thuyền tuần tra (không dùng trong màn) | `EN_HAN_BOAT` | khai báo `float`, `shoot` (đạn tại frame 4), `death`; không đưa vào màn |

Hazard có `hp` khi bị hạ: phát animation `death`/`break` **một lần** rồi mới xoá (hoặc chuyển xác), tắt va chạm ngay từ frame đầu. Animation không lặp phải chạy theo thời gian riêng của entity, không theo đồng hồ chung.

**3.4 Enemies và boss**

| Hiện tại | Asset mới | Ghi chú |
|---|---|---|
| Lính thường (strip lính Hán) | `EN_HAN_GUARD` | `idle`, `walk`, `attack_01` (hit 3), `hurt`, `death` — ánh xạ vào hành vi đang có, không thêm hành vi |
| Boss (đang dùng strip kỵ binh) | `BOSS_TO_DINH_CHARIOT` | ánh xạ hành vi boss hiện tại vào `idle` / `charge` / `throw` / `shield_break` gần nhất. **Không** làm cơ chế 3 giai đoạn (task riêng sau) |

**3.5 Projectiles**

| Nguồn | Asset mới |
|---|---|
| Lính thu thuế | `PJ_COIN_POUCH` (lặp 4f) |
| Lính gác tháp | `PJ_SPEAR` (1f) |
| Thuyền | `PJ_FIRE_ARROW` (lặp 3f) |
| Boss ném (nếu có) | `PJ_OIL_JAR` + `FX_OIL_FIRE` khi vỡ |

Cập nhật `PROJECTILE_SIZES` theo cỡ sprite mới (pixel logic).

**Test Phase 3:** chơi ít nhất 3 lượt (thứ tự obstacle xáo ngẫu nhiên); mỗi hazard kích hoạt, tấn công, chết đúng animation; đạn sinh đúng frame vung tay; không animation nào reset mỗi frame; không lỗi console mới.

**3.6 Công cụ debug (làm từ Phase 1)**
- Phím **F2**: bật/tắt hitbox, pivot, tên animation + số frame trên đầu entity.
- Chế độ xem sprite (vd. tham số `?viewer=1` trên trang màn chơi): chọn asset → animation trong manifest, xem ở ×1/×3/×4 có lưới và baseline — để team soát cả asset chưa dùng.

---

## 4. GATE MỖI PHASE

1. Liệt kê file đã sửa + mục đích.
2. Chạy test của phase, ghi PASS/FAIL.
3. Không đổi ID/animation; không sửa ngoài OWNED FILES của phase.
4. Có FAIL hoặc sửa ngoài phạm vi → `BLOCKED` + lý do.
5. PASS → cập nhật report, **dừng chờ người chơi thử duyệt** rồi mới sang phase sau.
6. Sau Phase 3: đổi `status` các asset đã dùng thành `IN_GAME`; **cập nhật CLAUDE.md** (mục Cơ chế gameplay, Quy ước mở rộng) để mô tả đúng cách hiển thị và sprite mới, xoá các mô tả đã lỗi thời (GIF nhân vật chính, `drawStripSprite` theo đồng hồ chung…).

---

## 5. BÁO CÁO `docs/REPORT_TT-INT-01.md`

```
## Phase <n> — <ngày>
### File đã sửa (file | mục đích)
### Bảng quy đổi (hằng số | cũ | mới)
### Kết quả test (test | PASS/FAIL | ghi chú)
### Khác biệt cảm giác chơi so với bản cũ
### Vấn đề asset (asset | animation | mô tả | NORMALIZE/NEED_REDRAW)
### Yêu cầu vẽ thêm cho Codex (vd. PLAYER_TRUNG_TRAC dash)
### TODO_MISSING / TODO_MAP
### Câu hỏi cho team
```
