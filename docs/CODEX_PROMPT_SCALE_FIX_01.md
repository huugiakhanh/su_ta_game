# CODEX PROMPT — SCALE_FIX_01: ĐỒNG BỘ TỈ LỆ NGƯỜI CHƠI + LÍNH HÁN (32-bit)

Ngày giao: 21/10/2026 • Người giao: team Sử Ta (Claude soạn, người dùng duyệt 21/10/2026) • Skill: agent-sprite-forge / `$generate2dsprite`

> Đọc **[SUTA_TT_ART_BRIEF_32.md](../SUTA_TT_ART_BRIEF_32.md)** trước — nhất là mục 2.2 (**chuẩn chiều cao người 34 ± 1 px logic**, đỉnh sọ →
> chân, không tính mũ/búi/lông/vũ khí). Prompt mâu thuẫn brief → theo prompt, ghi vào report.

---

## 0. MỤC TIÊU

Sửa **tỉ lệ**, không đổi thiết kế. Hai lỗi đo được trên bản đang chạy trong game (Claude đo 21/10/2026, px logic, ±1):

1. **Animation của người chơi vẽ nhỏ hơn `idle`** — mỗi lần chém, nhân vật "co lại" ~15–18%. Trước đây có người bù bằng cách phóng ảnh
   khi vẽ (`renderScale` ×1,2) — đã **gỡ bỏ** vì trái rule (không hệ số bù tỉ lệ, phóng ảnh làm nhoè pixel). Phải sửa ở ảnh.
2. **Lính Hán chương 1 thấp hơn chuẩn**: `EN_HAN_GUARD` `idle` ~29 px (chuẩn 34), `attack_01` còn nhỏ hơn nữa.

Chiều cao thân (bỏ vũ khí) từng animation, đo từ hàng có thân rộng ≥ 7 px logic tới chân (gần đúng — tư thế khom làm số thấp hơn, **Codex
đo lại bằng cỡ đầu** cho chính xác):

| Asset | `idle` | Animation nghi lệch tỉ lệ |
|---|---|---|
| `PLAYER_MALE` | 34,2–34,8 | **`attack_01` 22–29** (ô 1 đứng thủ: đỉnh hình hàng 63 so với `idle` hàng 37), **`victory` 27,5–28** |
| `PLAYER_FEMALE` | 35,2–35,5 | **`attack_01` 25,5–31**, **`victory` 27,5–29**, `run` 29–31 (xem lại) |
| `PLAYER_TRUNG_TRAC` | 32,2–33,8 | **`attack_01` 26–30**, `hurt` 28,5–29,5, `victory` 27–30 (xem lại) |
| `EN_HAN_GUARD` | **28,5–29,5** | toàn asset thấp; `attack_01` 22,5–24 |
| Đạt (không sửa) | `NPC_TRUNG_NHI` 33–34 mọi animation • `EN_HAN_RUSHER` 32,5–34,5 | |

## 1. DANH SÁCH VIỆC

| # | Asset ID | Animation | Việc | Giữ nguyên |
|---|---|---|---|---|
| 1 | `PLAYER_MALE` | `attack_01` (+ `victory` nếu đo lệch) | đưa về **cùng tỉ lệ `idle`** (cùng cỡ đầu, thân) | 9@21, hit **4**, `frame_w` **128**; tầm mũi giáo ô 4 lệch ≤ 8 px ảnh (brief 2.2) |
| 2 | `PLAYER_FEMALE` | `attack_01`, `victory` (+ `run` nếu đo lệch) | như trên | như trên |
| 3 | `PLAYER_TRUNG_TRAC` | `attack_01` (+ `hurt`, `victory` nếu đo lệch) | như trên | như trên |
| 4 | `EN_HAN_GUARD` | **mọi animation** | phóng cả asset lên **chuẩn 34** (×~1,17 so với hiện tại), **một hệ số cho cả asset**; `attack_01` thêm phần lệch riêng để cùng tỉ lệ `idle` | `idle` 6@9, `walk` 8@11, `attack_01` 9@18 hit 4, `hurt` 3@12, `death` 6@12; nếu mũi giáo `attack_01` vượt ô 48, đề xuất `frame_w` riêng (như `EN_NGO_SOLDIER` 128) và ghi report |

**Không** sửa animation đã đúng tỉ lệ (chỉ đổi file trong bảng; animation "nếu đo lệch" chỉ sửa khi Codex đo thấy cỡ đầu lệch > 5% so với `idle`).
Không đổi ID, tên animation, số frame, fps, `hit_frame`, màu, thiết kế.

## 2. CÁCH LÀM

- **Tạo lại từ nguồn** (`raw/`, nguồn gốc độ phân giải cao) với hệ số đúng — **không** phóng to strip 192 px đã thu nhỏ (pixel béo, brief 2.4).
  Nguồn không đủ độ phân giải → vẽ lại pose đó (`NEED_REDRAW`) và ghi report.
- Mốc tỉ lệ = **cỡ đầu** (đỉnh sọ → cằm) của `idle` ô 1: mọi ô của animation sửa phải cùng cỡ đầu ±1 px ảnh. Neo chân pivot bottom-center,
  baseline như `idle` (hàng 187). Một hệ số cho cả animation, không fit bbox từng ô.
- Vùng làm việc: nguồn chương 1 `assets/sprites-32bit/` (`player/`, `enemy/`, `manifest_tt.json` — đã gộp `PLAYER_MALE`/`PLAYER_FEMALE`).
  Không đụng `frontend/`, `ba-trieu/`, `samples/`. Manifest: chỉ được sửa `status` (→ `NORMALIZED`) + `qa_notes` (và `frame_w` riêng của
  `EN_HAN_GUARD.attack_01` nếu cần, ghi rõ).
- Script xử lý của Codex để trong `assets/sprites-32bit/` (vd. `meta/`), **không** để trong `tools/` của repo. 6 script đợt BT_ART_02 đang nằm
  ở `tools/` (`build_bt_art_02_b1.ps1`, `build_ba_trieu_reference.ps1`, `finalize_*.js`, `preview_*.ps1`) — chuyển về `assets/sprites-32bit/ba-trieu/meta/`.

## 3. ACCEPTANCE

1. Bảng đo trong report: **cỡ đầu** (px ảnh) và **đỉnh sọ → chân** (px logic) của `idle` ô 1 và **mọi ô** của từng animation đã sửa.
   Người chơi: mọi ô cùng cỡ đầu `idle` ±1 px ảnh. `EN_HAN_GUARD`: `idle` 34 ± 1 px logic, mọi animation cùng cỡ đầu.
2. Đúng cỡ strip theo manifest, alpha 0/255, ≤ 32 màu, đúng bảng màu, baseline như `idle`, quay phải.
3. Nhịp: số frame/fps/`hit_frame`/`frame_w` không đổi (trừ đề xuất `frame_w` của lính Hán, nếu có). Tầm vũ khí ô chạm: ghi px logic từ pivot
   (bản cũ và bản mới) — Claude cập nhật hitbox trong code theo số này.
4. Hash: chỉ các file trong bảng mục 1 thay đổi.
5. Preview: `preview/scale_fix_01_lineup.png` — `idle` ô 1 + `attack_01` ô 1, 4, 9 của 3 người chơi + `EN_HAN_GUARD` (`idle`, `attack_01`
   ô 4) cạnh `EN_NGO_LUMBERJACK`, cùng baseline, ×1 và ×2, kẻ vạch ở 34 px logic.

## 4. BÁO CÁO & DỪNG

- Ghi `SPRITE_REPORT_TT_32.md` mục mới **"SCALE_FIX_01 — 21/10/2026"** theo mẫu brief mục 6: file đã sửa, hệ số dùng, bảng đo, tầm vũ khí.
- Không ghi "người dùng đã duyệt". **Dừng chờ duyệt** (Claude soát bằng `/asset-review`).

---

## 5. PHẢN HỒI LƯỢT 1 (Claude soát 28/10/2026 — `/asset-review`) — **NGƯỜI DÙNG DUYỆT 28/10/2026, làm lượt 2 theo mục này**

Codex dừng đúng quy trình: **0 strip bàn giao**, chỉ có bản thử trong `meta/scale_fix_01/candidates/`; 6 script đã chuyển khỏi `tools/`
(đạt). Kẹt do prompt đặt ràng buộc **không thể cùng đạt**. Gỡ như sau:

1. **Bỏ ràng buộc "tầm giáo lệch ≤ 8 px ảnh"** (mục 1, 3.3). Thân to lên thì giáo dài ra theo cùng hệ số — chấp nhận. Lý do: vùng gây sát
   thương của người chơi là **số trong code** (`spearBox`: hộp rộng 48 px logic từ mép thân ≈ 60 px từ tâm), hình giáo hiện chỉ tới
   ~34,5 px — giáo dài thêm không đổi gameplay. Vẫn **ghi tầm mới** vào report.
2. **Chân luôn ở pivot** (bottom-center, hàng 187) — **cấm dịch cả animation theo x** để giữ tầm giáo (bản male vẽ lại dịch −41 px →
   loại là đúng). Phóng to quanh điểm chân.
3. **`EN_HAN_GUARD`**: được dùng `frame_w` riêng cho **`death`** (vd. 64 hoặc 80 logic, căn giữa pivot) như đã cho `attack_01`
   (engine đọc `frame_w` từng animation). Ghi số vào manifest + report.
4. **Thu hẹp phạm vi lượt này** — chỉ làm phần đã đo chắc chắn lệch:
   - `PLAYER_MALE.attack_01`, `PLAYER_FEMALE.attack_01`: dùng bản thử ×1,18 (cỡ đầu male đã đo 29–31 px ảnh = `idle` 30 ±1) — hoàn thiện
     QA, đo cỡ đầu từng ô cho female.
   - `PLAYER_TRUNG_TRAC.attack_01`: bản thử đang **×1,00 (không đổi)** — sai: ô 1 đỉnh hình hàng 58 so với `idle` hàng 41. Đo cỡ đầu
     `idle` và từng ô, chọn hệ số để khớp.
   - `EN_HAN_GUARD`: mọi animation, một hệ số ×1,18 (đã có bản thử), `death` theo điểm 3.
   - **Hoãn** sang đợt sau: `victory` (chỉ dùng ở cutscene cuối màn 3 Trưng Trắc, pose giơ giáo tràn ô 192 — cần đổi pose), `PLAYER_FEMALE.run`,
     `PLAYER_TRUNG_TRAC.hurt` (chưa chứng minh lệch > 5%). Không xuất các file này.
5. Acceptance còn lại giữ nguyên (cỡ đầu từng ô ±1 px ảnh so với `idle`, alpha, ≤ 32 màu, baseline 187, hash chỉ file trong phạm vi,
   preview `scale_fix_01_lineup.png`). Report "SCALE_FIX_01 — lượt 2"; dừng chờ duyệt.

---

## 6. KẾT LUẬN LƯỢT 2 (Claude soát 28/10/2026): **PASS 7 strip, chờ người dùng duyệt nhập game**

**Phạm vi đổi (người dùng 28/10):** `PLAYER_TRUNG_TRAC` hiện **chỉ dùng `idle`** (NPC đứng chờ màn 1 — `config.js` ánh xạ
`{ idle: 'idle', talk: 'idle' }`); mọi animation khác của Trưng Trắc **không dùng nữa** → **không sửa, không nhập** các animation đó (kể cả
`attack_01` Codex vẽ lại ở lượt này — giữ ở nguồn, không chép vào game; `hurt`, `victory` của Trưng Trắc bỏ khỏi danh sách hoãn).

| Asset ID | Animation | Kết quả | Số đo |
|---|---|---|---|
| `PLAYER_MALE` | `attack_01` | PASS | ×1,18 từ nguồn; cỡ đầu 29–31 px ảnh (= `idle` 30); 9@21 hit 4, `frame_w` 128, đáy 187, 32 màu; tầm giáo ô 4: 34,5 → **47** px logic (vẫn trong `spearBox` ~60) |
| `PLAYER_FEMALE` | `attack_01` | PASS | ×1,18; cỡ đầu 29–30 (= `idle` 29); tầm giáo 32,75 → **44,75** |
| `EN_HAN_GUARD` | `idle`, `walk`, `hurt` | PASS | ×1,18; `idle` sọ→chân 33,25–34 px logic (chuẩn 34 ± 1); cỡ đầu 30–32 |
| `EN_HAN_GUARD` | `attack_01` | PASS | `frame_w` 128, 9@18 hit 4; cỡ đầu 31; mũi giáo ô 4: 22,75 → **29,25** px logic |
| `EN_HAN_GUARD` | `death` | PASS | `frame_w` **80** (mục 5.3), 6@12, cả 6 ô đủ hình không bị cắt |
| `PLAYER_TRUNG_TRAC` | `attack_01` | **KHÔNG NHẬP** | ngoài phạm vi (animation không dùng) |

Kỹ thuật cả 7 strip: đúng cỡ ×4 theo manifest, alpha 0/255, 32 màu, đáy 187, không chạm mép ô; hash chỉ đổi đúng 8 strip (Codex báo).

**Còn hoãn:** `PLAYER_MALE.victory`, `PLAYER_FEMALE.victory` (cảnh kết màn 3 Trưng Trắc — pose giơ giáo tràn ô), `PLAYER_FEMALE.run`.

**Khi nhập game (Claude):** chép 7 strip + `manifest_shared.json` (người chơi) / `manifest_tt.json` (lính Hán, 2 `frame_w` mới) sang bản
chạy; cập nhật hitbox lính Hán trong `trung-trac/config.js` (thân to ×1,18) + tầm đâm; chơi lại 3 màn Trưng Trắc + màn 1 Bà Triệu.

---

## 7. ĐÃ NHẬP GAME (28/10/2026) — người dùng duyệt lượt 2

- Chép 7 strip sang bản chạy: `shared/sprites-32bit` (`PLAYER_MALE`, `PLAYER_FEMALE` `attack_01`) và `trung-trac/sprites-32bit`
  (`EN_HAN_GUARD` 5 animation); manifest bản chạy chỉ đổi `qa_notes` + `frame_w` 128 (`attack_01`) / 80 (`death`) của lính Hán.
  Nguồn `manifest_tt.json`: 3 ID → `IN_GAME`; `PLAYER_TRUNG_TRAC` trả về `IN_GAME` (chỉ `idle` dùng trong game; `attack_01` mới ở nguồn
  **không** nhập — bản chạy giữ strip cũ, không dùng).
- `trung-trac/config.js` `GUARD`: `attackReach` 12 → **18**, `attackBoxY` 13 → **12**, `attackBoxH` 10 → **9** (mũi kích ô 4 dài hơn);
  hitbox 22×40 giữ.
- Kiểm (mô phỏng `update(1/60)`): màn 2 Trưng Trắc — lính đâm trúng ở khoảng trống 14 px (−1 máu), không đâm ở 22 px; người chơi chém 2 đòn
  hạ lính; màn 1 Bà Triệu chém 2 đòn hạ lính đốn gỗ, strip `player_male_attack_01` mới được nạp; console sạch; `pytest` 94 passed.
- Còn hoãn: `victory` nam/nữ, `PLAYER_FEMALE.run`.
