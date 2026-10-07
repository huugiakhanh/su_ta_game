# REPORT TT-HIBIT-01 — Bộ sprite 32-bit (hi-bit) chương Trưng Trắc

Ngày: 01–02/10/2026 • Trạng thái: **HOÀN THÀNH** — 23/23 sprite vẽ trên canvas dùng bản 32-bit, `IN_GAME`.
Task card: [SUTA_TT_TASK_HIBIT_01.md](SUTA_TT_TASK_HIBIT_01.md) (chi tiết từng đợt, số đo QA). Spec: [SUTA_TT_ART_BRIEF_32.md](../SUTA_TT_ART_BRIEF_32.md).

## 1. Kết quả

| Đợt | Asset | Prompt |
|---|---|---|
| GATE 1–2 (pilot) | `PLAYER_TRUNG_TRAC`, `EN_HAN_GUARD` | `CODEX_PROMPT_32BIT_PILOT.md` (đã xoá), `CODEX_PROMPT_32BIT_GATE2.md` (đã xoá) |
| A3 | `NPC_TRUNG_NHI`, `NPC_THI_SACH`, `NPC_LE_CHAN`, `EN_HAN_TAXMAN`, `EN_HAN_WATCHTOWER`, `EN_HAN_RUSHER`, `BOSS_TO_DINH_FOOT` | `CODEX_PROMPT_32BIT_A3.md` (đã xoá) |
| A4 | `EN_HAN_PALANQUIN`, `EN_HAN_CAVALRY`, `EN_TIGER`, `OB_TRIBUTE_CART`, `BOSS_TO_DINH_CHARIOT`, `PROP_WATCHTOWER`, `TR_SPIKE_PIT` | `CODEX_PROMPT_32BIT_A4.md` (đã xoá) |
| A5 | `PJ_COIN_POUCH`, `PJ_SPEAR`, `PJ_FIRE_ARROW`, `PJ_THROWING_KNIFE`, `PJ_OIL_JAR`, `PJ_ARROW_RAIN`, `FX_OIL_FIRE` | `CODEX_PROMPT_32BIT_A5.md` (đã xoá) |

Mật độ ×4, 68 strip, bảng màu chương 80 màu. Mỗi đợt: Codex vẽ trong `assets/sprites-32bit/` → Claude soát kỹ thuật độc lập
→ chép sang `frontend/static/assets/images/trung-trac/sprites-32bit/` → người dùng chơi thử (`?hibit=1`) → `IN_GAME`.

Còn 8-bit: `EN_HAN_BOAT`, `EN_HAN_BASE` (không dùng trong màn — không vẽ); chân dung `PORTRAIT_*` + icon `ICON_SK_*` (DOM —
task TT-HIBIT-02, code xong, chờ Codex); map (TT-HIBIT-03, chưa làm).

## 2. File code đã sửa

| File | Mục đích |
|---|---|
| `config.js` | `SPRITE_32BIT_ROOT`, `HIBIT_FRAME_LOCKED`, `SPRITE_DOM_IN_GAME`; `HAZARD_SPRITES.*.muzzleX` (kiệu quan 12) |
| `animation.js` | `getAnimMeta` trả `density` + `frame_w` riêng từng animation |
| `assets.js` | `loadSprites()` chọn 32-bit/8-bit từng asset; `hibitMismatch` (thời lượng + thời điểm chạm, ô rộng chỉ được rộng hơn); `loadStrips` kiểm cỡ ảnh; `spriteUrl`; `loadSpriteManifest(root)` |
| `render.js` | `drawSprite8`/`drawTintedSprite` vẽ ô dày vào khung logic, nội suy khi bộ đệm N < density |
| `physics.js` | `fireProjectile()` đọc `muzzleX` |
| `viewer.js` | mục `ID [32-bit]`, ô rộng, cỡ strip cần có |
| `ui.js`, `dialogue.js`, `css/levels/trung-trac.css` | ảnh DOM qua `setSpriteImage` + `.img--hibit` (TT-HIBIT-02) |
| `main.js` | log asset 32-bit đang dùng |

Không đổi hitbox, tốc độ, nhịp đòn: mọi thời điểm chạm / độ dài hành động đo lại sau mỗi đợt trùng bản 8-bit.

## 3. Quyết định trong task (người dùng)

- Codex vẽ (không Gemini); ×4; chỉ sprite trước; dừng hướng Godot + 16-bit (01/10).
- Trưng Trắc cầm **giáo đồng** (GATE 1); `attack_01` ô rộng 128 logic để mũi giáo chạm tầm `spearBox` — Trưng Nhị bổ rìu cũng vậy.
- **Tăng số frame** cho mượt, giữ thời lượng + thời điểm chạm (02/10).
- Bảng màu chương nới tới 80 (A4), không đổi màu cũ.
- Dao kiệu quan sinh ở tay quan (`muzzleX` 12, `DESIGN_BASELINE`) thay vì mép kiệu.

## 4. Test

| # | Kết quả |
|---|---|
| TC1–TC5, TC7, TC8 (task card mục 4) | PASS |
| TC6 strip sai cỡ ảnh | Không thử riêng (cùng nhánh code TC4) |
| Mỗi đợt: soát kỹ thuật độc lập (cỡ, alpha, màu, chân, frame trùng, chạm mép, tâm/hitbox, vị trí tay ném/mũi đòn) | PASS (A4: lệch silhouette chỉ ở `death`/`break` khi đã tắt va chạm — chấp nhận) |
| Mỗi đợt: engine nhận asset, `hitTime`/`animLength` như 8-bit | PASS |
| Người dùng chơi thử từng đợt (màn 1–3) | PASS |
| Không cờ `?hibit`: màn 1 nạp 23/23 sprite canvas bản 32-bit, không lỗi console mới | PASS |

## 5. Vấn đề asset / ghi chú

- Tay lính gác tháp lúc ném cao hơn điểm sinh giáo ~2–5 px logic — chấp nhận.
- Report Codex nhiều lần tự ghi "người dùng đã duyệt" — từ A3 prompt đã cấm; việc duyệt lấy theo người dùng báo trực tiếp.
- Ảnh lớn: 68 strip ×4 — chưa đo bộ nhớ trên điện thoại (Phần D của kế hoạch).

## 6. TODO

- TT-HIBIT-02: prompt Codex chân dung + icon (`ICON_SK_ATTACK` vẽ giáo đồng); `items/heart.png` cần team quyết ID mới.
- TT-HIBIT-03: map 32-bit (code `maps-32bit/` + brief map).
- Đo bộ nhớ/hiệu năng trên điện thoại; cân nhắc chỉ nạp asset của màn đang chơi.
- Q1/Q2 brief 32-bit mục 5.
