# TT-HIBIT-01 — Bộ sprite 32-bit (hi-bit) cho chương Trưng Trắc

Ngày: 01/10/2026 • Trạng thái: **HOÀN THÀNH 02/10 — 23/23 sprite canvas 32-bit `IN_GAME`. Report: [REPORT_TT-HIBIT-01.md](REPORT_TT-HIBIT-01.md).** `CODEX_PROMPT_32BIT_A4.md` (đã xoá). Prompt: `CODEX_PROMPT_32BIT_PILOT.md` (đã xoá), `CODEX_PROMPT_32BIT_GATE2.md` (đã xoá), `CODEX_PROMPT_32BIT_A3.md` (đã xoá)

## 1. Quyết định (người dùng, 01/10)

- Đổi sprite sang pixel art **32-bit / hi-bit**, **Codex vẽ** (không dùng Gemini — để đồng bộ).
- Mật độ **×4** (ô người 48×48 logic → ảnh 192×192), khớp bộ đệm N = 4 trên màn 1080p.
- Phạm vi: **chỉ sprite**; map giữ 8-bit, tính sau.
- **Dừng hướng Godot + 16-bit**, dồn vào bản web.
- Pilot: `PLAYER_TRUNG_TRAC` + `EN_HAN_GUARD`, đạt mới làm tiếp.

## 2. Thiết kế

Giữ nguyên hệ pixel logic (canvas cao 270, hitbox, tốc độ, nhịp đòn). Bộ 32-bit chỉ thay **ảnh**:
manifest riêng `sprites-32bit/manifest_tt.json`, cùng ID/animation/frames/fps/loop/hit_frame/frame_w/
frame_h như 8-bit, thêm `density`. Engine thay **từng asset**:

- Dùng bản 32-bit khi: asset có trong manifest 32-bit **và** (`status: IN_GAME` **hoặc** URL có
  `?hibit=1`) **và** khớp contract 8-bit **và** mọi strip tải được đúng cỡ
  (`frames × frame_w × density` × `frame_h × density`).
- Không thì giữ bản 8-bit + `console.warn` lý do. Không có thư mục 32-bit → chạy 8-bit như cũ
  (1 dòng 404 của manifest trên console).
- Vẽ: ô ảnh dày ép vào khung logic; bộ đệm N < density → bật nội suy khi thu nhỏ.
- Viewer `?viewer=1`: mục `ID [32-bit]` ngay sau bản 8-bit, báo cỡ strip cần có.

Spec cho Codex: [SUTA_TT_ART_BRIEF_32.md](../SUTA_TT_ART_BRIEF_32.md); prompt GATE 1:
`CODEX_PROMPT_32BIT_PILOT.md` (đã xoá); mẫu phong cách:
[docs/references/hibit_style_ref_trung_trac.gif](references/hibit_style_ref_trung_trac.gif).

## 3. File

| File | Sửa |
|---|---|
| `frontend/static/js/levels/trung-trac/config.js` | `SPRITE_32BIT_ROOT` |
| `.../animation.js` | `getAnimMeta` trả thêm `density` |
| `.../assets.js` | `loadSprites()` (thay `loadSprites8bit`): trộn 32-bit/8-bit, `hibitMismatch`, `loadStrips`; `loadSpriteManifest(root)` |
| `.../render.js` | `drawSprite8` + `drawTintedSprite` theo `density` |
| `.../viewer.js` | liệt kê + vẽ asset 32-bit |
| `.../main.js` | log asset 32-bit đang dùng |

Không đụng `physics.js`, `state.js`, asset 8-bit.

## 4. Test case

Phần code thử bằng bộ 32-bit **giả** (strip 8-bit của Trưng Trắc phóng ×4 nearest + vạch chéo 1 px
ảnh để nhận ra; `EN_HAN_GUARD` cố ý sai số frame) — đã xoá sau khi thử.

| # | Kịch bản | Kỳ vọng | Kết quả |
|---|---|---|---|
| TC1 | Không có `sprites-32bit/` | Màn 1 tải đủ, dùng 8-bit | PASS |
| TC2 | Asset 32-bit `NORMALIZED`, không `?hibit` | Dùng 8-bit | PASS |
| TC3 | `?hibit=1` | Trưng Trắc dùng strip 32-bit (768×192), cỡ trên màn như cũ, vạch 1 px ảnh hiện trên canvas (N = 3) | PASS |
| TC4 | 32-bit lệch contract (frames) | Giữ 8-bit + warn `idle.frames 5, 8-bit 4` | PASS |
| TC5 | Viewer | Có `PLAYER_TRUNG_TRAC [32-bit]`, báo “cần strip 768×192”, ×4 = cỡ gốc | PASS |
| TC6 | Strip 32-bit sai cỡ ảnh | Giữ 8-bit + warn | Chưa thử riêng (code chung nhánh TC4) |
| TC7 | Bóng Trưng Nhị (tint) với asset 32-bit | Vẽ đúng cỡ, ánh chàm | PASS — màn 3 `?debug=1&hibit=1`, phím L + J (02/10) |
| TC8 | Asset Codex thật, GATE 2: chơi màn 1 `?hibit=1` + F2 | Chân trên mặt đất, hitbox khớp hình, đòn chém trúng đúng tầm | PASS — người dùng chơi thử 02/10 |

## 5. GATE 1 (02/10/2026)

Codex giao `PLAYER_TRUNG_TRAC.idle`, `EN_HAN_GUARD.idle`; người dùng duyệt (kể cả **Trưng Trắc cầm giáo đồng**
thay kiếm). Claude soát kỹ thuật: strip 768×192, alpha 0/255, 32 màu/asset, chân hàng 187 mọi ô, tâm
x 95–96, tỉ lệ khối 4×4 đồng màu 0,1–0,7 % (không phải ảnh phóng to) — **PASS**. Đã chép 2 strip +
manifest sang `frontend/.../sprites-32bit/` (chỉ để xem trong viewer; thiếu animation nên game vẫn dùng 8-bit).

**Tầm giáo:** `spearBox` (`physics.js`) đánh xa 48 px logic từ mép thân (~60 px từ tâm), ô 48 chỉ vẽ được
24 px. Người dùng chọn: `attack_01` của Trưng Trắc dùng **ô riêng 128×48 logic** (512×192 ảnh). Engine
bổ sung: animation được có `frame_w` riêng (`getAnimMeta`, `hibitMismatch` chỉ cho rộng hơn, `loadStrips`,
viewer). Thử bằng bộ giả (ô attack 512 + vạch giáo 240 px): nhân vật không lệch chỗ/cỡ, vạch vươn đúng
phía trước — PASS, đã xoá bộ giả.

**Số frame (team 02/10):** bản 32-bit tăng frame cho mượt, giữ thời lượng + thời điểm chạm (gameplay không
đổi). Engine: `hibitMismatch` so thời lượng `frames/fps` + tỉ lệ `(hit_frame−1)/frames` (animation không lặp),
animation lặp tự do, `HIBIT_FRAME_LOCKED` (`config.js`: `PLAYER_TRUNG_TRAC.jump`) giữ số frame. Bảng số frame
GATE 2: `CODEX_PROMPT_32BIT_GATE2.md` (đã xoá) (vd. `attack_01` Trưng Trắc 9 @21 chạm
ô 4; lính canh 9 @18 chạm ô 4). Thử bằng bộ giả: Trưng Trắc + lính canh số frame mới được nhận, `hitTime`
.120 s / .167 s, `death` lính .5 s như cũ, F2 hiện `attack_01 2/9`; quân cảm tử giả 8 @28 chạm ô 5 bị loại
(“lệch thời điểm chạm”) — PASS, đã xoá bộ giả, khôi phục bản GATE 1.

## 6. GATE 2 (02/10/2026)

Codex giao đủ 8 animation Trưng Trắc + 5 lính canh theo bảng frame mới (report `assets/sprites-32bit/SPRITE_REPORT_TT_32.md`).
Claude soát độc lập 13 strip: đúng cỡ (kể cả `attack_01` 4608×192, ô 512), alpha 0/255, 32 màu/asset, chân hàng 187
mọi ô, không frame trùng frame trước, khối 4×4 đồng màu ≤ 2,3 % — **PASS**. Mũi giáo ô 4 tại x 486 (vùng 476–496),
mũi kích ô 4 tại x 187 (vùng 168–188). `walk` lính 8 @11 = 0,727 s (cũ 0,75 s) — animation lặp, không ảnh hưởng gameplay.
Đã chép 13 strip + manifest sang `frontend/.../sprites-32bit/`. Màn 1 `?hibit=1`: engine nhận cả 2 asset (density 4,
`attack_01` 9 ô, `hitTime` .120 s / .167 s như 8-bit), F2 hiện `attack_01 2/9`, `walk 4/8`, chân đúng mặt đất/gò.
Report Codex ghi các ô raw chạm biên ở `attack_01`/`death`/`victory` (TT) và `attack_01`/`death` (lính) — strip cuối
không chạm mép, cần mắt người soát GIF các action này.

Người dùng chơi thử ổn (02/10) → `status: IN_GAME` ở cả 2 manifest (`assets/` + `frontend/`). Kiểm tra không cờ `?hibit`: màn 1 và màn 3 (`?debug=1`) dùng bản 32-bit (density 4) cho 2 asset này, asset khác vẫn 8-bit, không lỗi console mới.

## 7. Đợt A3 (02/10/2026)

Codex giao A3a (`NPC_TRUNG_NHI`, `NPC_THI_SACH`, `NPC_LE_CHAN`) + A3b (`EN_HAN_TAXMAN`, `EN_HAN_WATCHTOWER`,
`EN_HAN_RUSHER`, `BOSS_TO_DINH_FOOT`): 25 animation / 158 frame theo `CODEX_PROMPT_32BIT_A3.md` (đã xoá).
Claude soát độc lập: đúng cỡ (đòn rìu Trưng Nhị ô 512), alpha 0/255, chân hàng 187, không frame trùng, không chạm mép,
32 màu/asset, cả chương 64 màu — PASS. Tỉ lệ khối 4×4 đồng màu cao hơn pilot ở lính thu thuế (5–8 %) và `flee` Tô Định
(15,6 %): soát bằng mắt là mảng áo phẳng màu, pixel vẽ tay — không phải ảnh phóng to. Lưỡi rìu Trưng Nhị ô 4 x 484 /
hàng 122–175, mũi đao quân cảm tử ô 3 x 178 / hàng 131–135 (trong vùng); tay ném lính gác tháp ô 5 ~hàng 39–51, cao
hơn điểm sinh đạn (~hàng 59) khoảng 2–5 px logic — nhỏ, chấp nhận được, ghi chú. Đã chép 38 strip + manifest vào game;
màn 3 `?debug=1&hibit=1`: engine nhận cả 9 asset 32-bit, thời điểm chạm/thời lượng như 8-bit, bóng Trưng Nhị đúng (TC7).

Người dùng chơi thử màn 1–3 ổn (02/10) → `status: IN_GAME` cho 7 asset ở cả 2 manifest.

## 8. Đợt A4 (02/10/2026)

Codex giao A4a (`EN_HAN_PALANQUIN`, `EN_HAN_CAVALRY`, `EN_TIGER`, `OB_TRIBUTE_CART`) + A4b (`BOSS_TO_DINH_CHARIOT`,
`PROP_WATCHTOWER`, `TR_SPIKE_PIT`): 23 animation / 134 frame; bảng màu chương 80/80 (thêm 16 màu, không đổi màu cũ).
Report Codex nêu lệch bbox >8 px ảnh ở nhiều animation. Claude đo lại theo **hitbox code** (px logic, chỉ animation còn
va chạm): hổ `idle/run/hurt`, kỵ binh `gallop/hurt`, kiệu `walk/throw/hurt`, xe `roll`, chiến xa `idle/charge/stun/throw/
idle_cracked`, hố chông `reveal` đều lệch bản 8-bit ≤ 8 px logic và vẫn bao hitbox — PASS. Lệch lớn (46–109 px ảnh) chỉ ở
`death`/`break`/`shield_break` (đã tắt va chạm) — chấp nhận. Đã chép 61 strip + manifest; màn 3 `?debug=1&hibit=1`:
engine nhận cả 16 asset 32-bit, thời điểm chạm/thời lượng như 8-bit.

**Dao kiệu quan** (Codex ghi NEED_REDRAW): tay quan ở giữa kiệu (~12 px logic), game sinh dao ở mép trước (42 px) — bản
8-bit cũng vậy. Người dùng chọn sửa code: `HAZARD_SPRITES.palanquinBoss.muzzleX = 12` (`fireProjectile()` đọc `muzzleX`,
mặc định `w/2 + 4`), `DESIGN_BASELINE`; không cần Codex vẽ lại. Thử (bước `update()` thủ công): dao sinh ở ô 4 `throw`,
cách tâm 12 px, cao 24 px — PASS.

Người dùng chơi thử ổn (02/10) → `status: IN_GAME` cho 7 asset A4 ở cả 2 manifest.

## 9. Đợt A5 (02/10/2026)

Codex giao 7 asset đạn/FX (35 frame) theo `CODEX_PROMPT_32BIT_A5.md` (đã xoá), không thêm màu (chương
80/80). Claude soát độc lập: đúng cỡ, alpha 0/255, 32 màu/asset, không frame trùng, không chạm mép; **tâm vật thể lệch tâm ô
≤ 0,1 px logic** (khớp cách game vẽ đạn tâm-ô = tâm-hitbox); thân phủ hitbox (giáo 26×3 / 22×4, tên lửa 19×5 / 16×5, túi
11–12×12–14 / 10×10, hũ 7–10×11–14 / 10×10); dao khi xoay dựng hẹp hơn hitbox 12×5 như bản 8-bit; mũi mưa tên hàng 82
(yêu cầu 80–83), đáy lửa hàng 123, lửa dầu 9 @18 = 0,5 s — PASS. Đã chép vào game (68 strip, 23 asset); màn 3
`?debug=1&hibit=1`: engine nhận **cả 23 sprite canvas** bản 32-bit.

Người dùng chơi thử ổn (02/10) → `status: IN_GAME` cho 7 asset A5. Không cờ `?hibit`: màn 1 nạp 23/23 sprite canvas bản 32-bit.

## 10. TODO

- `ICON_SK_ATTACK` đang vẽ kiếm → bản 32-bit (TT-HIBIT-02) vẽ giáo đồng cho khớp.
- Map 32-bit: chưa làm (quyết định 01/10).
- Q1/Q2 trong brief 32-bit mục 5 chờ team.
