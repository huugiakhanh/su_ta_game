# CODEX PROMPT — BT_ART_02_FIX_LJ: ĐỒNG BỘ TỈ LỆ LÍNH ĐỐN GỖ (32-bit)

Ngày giao: 28/10/2026 • Người giao: team Sử Ta (Claude soạn, người dùng duyệt 28/10/2026) • Skill: agent-sprite-forge / `$generate2dsprite`

> Đọc **[SUTA_TT_ART_BRIEF_32.md](../SUTA_TT_ART_BRIEF_32.md)** trước — nhất là mục 2.2 (**chuẩn chiều cao người 34 ± 1 px logic**, đỉnh sọ →
> chân, không tính mũ/búi/vũ khí). Cách làm giống [CODEX_PROMPT_SCALE_FIX_01.md](CODEX_PROMPT_SCALE_FIX_01.md) mục 2 + 5 (đã PASS).
> Prompt mâu thuẫn brief → theo prompt, ghi vào report.

---

## 0. MỤC TIÊU

Sửa **tỉ lệ**, không đổi thiết kế. `EN_NGO_LUMBERJACK` (đang chạy ở màn 1 Bà Triệu) có animation **không cùng cỡ người** với `idle`
(Claude đo 28/10/2026 trên strip hiện tại, px logic, ±1):

| Animation | Số đo hiện tại | So với `idle` |
|---|---|---|
| `idle` 6@9 | sọ→chân 34,0–34,5; bề ngang thân ở ngực ~11 | **mốc chuẩn — không sửa** |
| `walk` 8@11 | 32,8–33,2 (dáng bước) | đạt — không sửa |
| `attack_01` 10@10 hit 7, `frame_w` 80 | thế thủ ô 1 cao 34,8 nhưng thân ở ngực ~17, vai/giáp/đùi dày hơn rõ | **người to bè hơn** — chuyển từ `walk` sang chém thì lính "phình" ra |
| `hurt` 3@12 | cao 25–26; diện tích hình ~70% `idle` | **nhỏ hơn ~×0,85** — đầu, giáp, rìu đều nhỏ |
| `death` 6@12 | ô 1 còn gần đứng thẳng nhưng chỉ cao **21**; diện tích ~44% `idle` | **nhỏ hơn ~×0,65** — lính teo lại khi trúng đòn |

Nguyên nhân có thể (theo `qa_notes`): Gate B1 bản sửa 1 dùng **một hệ số ×34/31 cho mọi animation**, nhưng `hurt`/`death` raw vốn đã nhỏ
hơn `idle` raw, còn `attack_01` lấy từ `revision3_source` (bản vẽ khác, khổ người khác). Codex đo lại bằng **cỡ đầu** để xác nhận.

## 1. DANH SÁCH VIỆC

| # | Asset ID | Animation | Việc | Giữ nguyên |
|---|---|---|---|---|
| 1 | `EN_NGO_LUMBERJACK` | `hurt` | đưa về **cùng tỉ lệ `idle`** (cùng cỡ đầu, giáp, rìu) | 3@12, `frame_w` 48 |
| 2 | `EN_NGO_LUMBERJACK` | `death` | như trên; ô 1 (còn đứng/ngửa) cỡ người như `idle` | 6@12; được dùng **`frame_w` riêng** (64 hoặc 80, căn giữa pivot) nếu thân nằm vượt ô 48 — ghi manifest + report |
| 3 | `EN_NGO_LUMBERJACK` | `attack_01` | chỉnh **khổ người** (vai, giáp, đùi, cỡ đầu) khớp `idle` — cùng một người, chỉ khác tư thế | 10@10, hit **7**, `frame_w` 80; thế vung rìu, nhịp các ô |

**Không** sửa `idle`, `walk`. Không đổi ID, tên animation, số frame, fps, `hit_frame`, màu, thiết kế (mũ chàm, giáp vảy, rìu cán dài).
Tầm rìu ô 7 được thay đổi theo thân — **ghi tầm mới** vào report (hiện đầu rìu cách pivot **24,5 px logic**, cao 0–12 px trên mặt chân).

## 2. CÁCH LÀM

- **Tạo lại từ nguồn** (`raw/`, `meta/gate_b1_r1_source/`, `revision3_source`) với hệ số đo riêng từng animation — **không** phóng to strip
  192 px đã thu nhỏ (pixel béo, brief 2.4). Nguồn không đủ độ phân giải hoặc khổ người `attack_01` không khớp được bằng hệ số → vẽ lại pose
  đó, ghi `NEED_REDRAW` trong report.
- Mốc tỉ lệ = **cỡ đầu** (đỉnh sọ → cằm) của `idle` ô 1: mọi ô của animation sửa cùng cỡ đầu ±1 px ảnh. Một hệ số cho cả animation, không
  fit bbox từng ô.
- **Chân luôn ở pivot** (bottom-center, hàng 187); phóng quanh điểm chân; **cấm dịch cả animation theo x**.
- Vùng làm việc: `assets/sprites-32bit/ba-trieu/` (`enemy/EN_NGO_LUMBERJACK/`, `manifest_bt.json`, `meta/`, `preview/`). Không đụng
  `frontend/`, chương 1, `samples/`. Script để trong `assets/sprites-32bit/ba-trieu/meta/`, **không** để trong `tools/` của repo.
- Manifest: chỉ được sửa `status` (→ `NORMALIZED`) + `qa_notes` (+ `frame_w` riêng của `death` nếu cần).

## 3. ACCEPTANCE

1. Bảng đo trong report: **cỡ đầu** (px ảnh) và **đỉnh sọ → chân** (px logic) của `idle` ô 1 và **mọi ô** của `hurt`, `death`, `attack_01`;
   + bề ngang thân ở ngực của `idle` ô 1 và `attack_01` ô 1. Mọi ô cùng cỡ đầu `idle` ±1 px ảnh; `attack_01` ô 1 và ô 10 (thế thủ) cao 34 ± 1.
2. Đúng cỡ strip theo manifest (×4), alpha 0/255, ≤ 32 màu, đúng bảng màu `palette_32_bt_a2.png`, đáy hàng 187, quay phải, không chạm mép ô.
3. Nhịp: frames/fps/`hit_frame`/`frame_w` không đổi (trừ `frame_w` của `death` nếu dùng mục 1.2). Tầm rìu ô 7: px logic từ pivot, bản cũ
   và bản mới, + độ cao đầu rìu trên mặt chân — Claude cập nhật ô đánh trong code theo số này.
4. Hash: chỉ 3 strip trong bảng mục 1 (+ `manifest_bt.json`) thay đổi.
5. Preview `preview/fix_lj_lineup.png`: `idle` ô 1, `walk` ô 1, `attack_01` ô 1/7/10, `hurt` ô 1, `death` ô 1 và ô 6 của lính đốn gỗ cạnh
   `EN_NGO_SOLDIER` `idle`, cùng baseline, ×1 và ×2, kẻ vạch ở 34 px logic. Thêm bản so sánh trước/sau.

## 4. BÁO CÁO & DỪNG

- Ghi `assets/sprites-32bit/ba-trieu/SPRITE_REPORT_BT_32.md` mục mới **"BT_ART_02_FIX_LJ — 28/10/2026"** theo mẫu brief mục 6: file đã sửa,
  hệ số từng animation, bảng đo, tầm rìu.
- Không ghi "người dùng đã duyệt". **Dừng chờ duyệt** (Claude soát bằng `/asset-review`).

---

## 5. KẾT LUẬN SOÁT (Claude, 28/10/2026 — `/asset-review`): **PASS 3 strip, chờ người dùng duyệt nhập game**

Codex vẽ nguồn mới cho cả 3 animation (raw cũ: `death` còn bị nhân thêm ×0,70; `attack_01` lấy từ strip 192 px khổ bè) — không phóng strip
đã thu nhỏ. Claude đo lại trên strip bàn giao (px logic):

| Asset ID | Animation | Kết quả | Số đo |
|---|---|---|---|
| `EN_NGO_LUMBERJACK` | `attack_01` | PASS | ô 1 cao 34,5, ô 10 34,8 (idle 34,0–34,5); thân ở ngực 11,25 (idle 11; bản cũ 17); diện tích hình ô 1 = 394 (idle 385; bản cũ 616 kể cả rìu); 10@10 hit 7, `frame_w` 80; đầu rìu ô 7 cách pivot 24,5 → **25,0**, cao 0–10,5 trên mặt chân |
| `EN_NGO_LUMBERJACK` | `hurt` | PASS | cao 34,2–35,5 (bản cũ 25–26); cỡ đầu bằng idle khi xem phóng to; ngả người + dạng chân nên trông hơi to hơn idle ~5% (xà cạp, giày rộng hơn 1–3 px ảnh) — trong mức chấp nhận |
| `EN_NGO_LUMBERJACK` | `death` | PASS | ô 1 cao 35,5 (bản cũ 21); 6 ô ngã dần, `frame_w` 48 đủ hình (mép trái ô 6 còn 2,8 px) |

Kỹ thuật: đúng cỡ strip ×4, alpha 0/255, 32 màu, không chạm mép ô; hash chỉ đổi 3 strip + `manifest_bt.json` (Codex báo). Lệch nhỏ: hàng
chân thấp nhất của 3 strip mới là 187, của `idle`/`walk` cũ là 186 — 1 px ảnh (0,25 px logic), không thấy khi chơi, không cần sửa.

**Khi nhập game (Claude):** chép 3 strip + `manifest_bt.json` sang `frontend/static/assets/images/ba-trieu/sprites-32bit/`; nguồn
`status` → `IN_GAME`. Hitbox `LUMBERJACK` 24×34 giữ; ô đánh `GUARD` (`attackReach` 14 → tới 26 px từ tâm, cao 0–12 trên chân) đã phủ đầu
rìu mới 25,0 / 0–10,5 — **không cần sửa `config.js`**, chỉ cập nhật comment số đo. Kiểm màn 1 Bà Triệu.

## 6. ĐÃ NHẬP GAME (28/10/2026) — người dùng duyệt

- Chép `en_ngo_lumberjack_{attack_01,hurt,death}.png` + `manifest_bt.json` sang `frontend/static/assets/images/ba-trieu/sprites-32bit/`;
  nguồn `EN_NGO_LUMBERJACK.status` → `IN_GAME`; manifest bản chạy chỉ đổi `qa_notes` của lính đốn gỗ.
- `ba-trieu/config.js`: chỉ cập nhật comment số đo rìu (25 px từ tâm, cao 0–10,5); `LUMBERJACK`/`GUARD` giữ nguyên.
- Kiểm (mô phỏng `update(1/60)`, màn 1): 5 strip nạp đúng cỡ theo manifest; đứng cách lính 10 px → nhát rìu −2 máu (5 → 3); chém hạ lính,
  chuỗi animation `attack → hurt → idle → attack → death` chạy đủ; console chỉ có 401 của API tiến trình (chưa đăng nhập — bình thường);
  `pytest` 94 passed, 1 skipped.
