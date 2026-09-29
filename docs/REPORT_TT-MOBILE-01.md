# REPORT TT-MOBILE-01 — Điều khiển cảm ứng xoay ngang

Ngày: 2026-09-29 · Trạng thái: **HOÀN THÀNH** (chưa thử trên máy thật — xem TODO)

## Yêu cầu (người dùng chốt trong phiên)

- Điện thoại/tablet chơi **ngang**; cầm dọc → che màn + nhắc xoay, game dừng.
- Nút **phủ lên canvas**, bán trong suốt, cỡ cố định theo px.
- Trái: ◀ ▶ hàng dưới, nhảy **▲** (mũi tên, không chữ) phía trên.
- Phải: ĐÁNH to ở góc, LƯỚT / TÊN / BÓNG xếp vòng cung quanh.
- HUD giữ dải trên, thu gọn. Chỉ áp dụng cho thiết bị cảm ứng (`pointer: coarse`).

## File đã sửa

| File | Mục đích |
|---|---|
| `frontend/templates/gameplay/levels/trung-trac.html` | Chuyển `.mobile-controls` vào `.stage-wrap` (phủ canvas), sắp lại 2 cụm nút, nút nhảy `▲` (`aria-label="Nhảy"`); thêm `#rotateOverlay`. Giữ nguyên `data-control`/`data-skill`. |
| `frontend/static/css/levels/trung-trac.css` | Nút tròn định vị tuyệt đối, opacity .55 (.9 khi bấm), ĐÁNH 72px, còn lại 50–56px, tôn trọng `safe-area-inset`; `@media (pointer: coarse)` hiện nút + HUD thu gọn; `(pointer: coarse) and (orientation: portrait)` hiện lớp nhắc xoay; luật cửa sổ hẹp desktop tách riêng `(max-width: 820px) and (pointer: fine)`; bỏ luật hộp thoại dạng bảng nổi đáy màn hình khi dọc (máy dọc giờ đã bị che) và `.control--skill` cũ. |
| `frontend/static/js/levels/trung-trac/render.js` | `fitCanvas()` không trừ chiều cao `.mobile-controls` nữa (nút phủ lên canvas). |
| `frontend/static/js/levels/trung-trac/main.js` | `portraitQuery` (matchMedia): `frame()` không gọi `update()` khi máy cảm ứng dọc; đổi hướng → `clearInput()`. |
| `CLAUDE.md` | Cập nhật mô tả điều khiển cảm ứng, bỏ ghi chú hộp thoại khi dọc. |

`input.js` không đổi (vẫn gắn theo `[data-control]`).

## Kết quả test (trình duyệt trong app, giả lập cảm ứng)

| # | Test | Kết quả |
|---|---|---|
| 1 | 740×360 ngang, màn 3 `?debug=1`: HUD 31px, canvas 316px, không thanh cuộn; đủ 7 nút đúng vị trí, TÊN/BÓNG hiện | PASS |
| 2 | Cả 7 nút: `elementFromPoint` tại tâm trúng đúng nút (không bị che), pointerdown → `keys[x] = true` (+ `pressed` với nhảy/đánh/lướt/kỹ năng), pointerup → `false` | PASS |
| 3 | 390×740 dọc: `#rotateOverlay` hiện, `.game-shell` ẩn, `portraitQuery.matches` = true | PASS |
| 4 | 667×375 ngang, màn 1: hộp câu hỏi 4 đáp án nằm trên nút, vừa khung, không thanh cuộn | PASS |
| 5 | Máy tính (`pointer: fine`): không hiện nút, không lớp nhắc xoay, dòng trợ giúp phím vẫn hiện | PASS |

Không kiểm được nhân vật di chuyển thật qua vòng lặp vì khung trình duyệt bị ẩn (rAF dừng); đường input → `keys` đã xác nhận, phần `keys` → vật lý không đổi.

## Đợt 2 (cùng ngày, theo yêu cầu người dùng)

| File | Mục đích |
|---|---|
| `config.js` | `ARENA.playerStartX` 60 → **170** (`DESIGN_BASELINE`): lúc vào màn 3 nhân vật không nằm dưới cụm nút trái; vẫn ở trước cột đá 250 (hitbox 238–262). |
| `trung-trac.html`, `ui.js`, `trung-trac.css` | Nút LƯỚT / TÊN / BÓNG hiện ảnh: `ICON_SK_DASH`, `PORTRAIT_LE_CHAN`, `PORTRAIT_TRUNG_NHI` — cùng ảnh ô kỹ năng HUD, gán qua `setControlIcon()` khi ô HUD nạp ảnh; ảnh chưa tải/lỗi thì giữ chữ. Thêm `aria-label`. |

| # | Test | Kết quả |
|---|---|---|
| 6 | Màn 3 `?debug=1` 740×360: `player.x` = 170, nhân vật ngoài cụm nút trái | PASS |
| 7 | 3 ảnh nút tải xong (`naturalWidth` 32/64/64), chữ tạm ẩn, ảnh phủ kín nút tròn | PASS |

## Đợt 3 — icon nút ĐÁNH (`ICON_SK_ATTACK`, Codex 29/09)

| File | Mục đích |
|---|---|
| `sprites-8bit/icon/ICON_SK_ATTACK/icon_sk_attack_idle.png` | Chép từ `assets/sprites/icon/ICON_SK_ATTACK/`. |
| `sprites-8bit/manifest_tt.json` | Chèn **1 dòng** mục `ICON_SK_ATTACK` sau `ICON_SK_DASH`. Không chép đè cả file: bản chạy có `qa_notes` mới hơn bản nguồn ở `NPC_TRUNG_NHI`, `EN_HAN_RUSHER` (chỉ khác `qa_notes`). |
| `config.js`, `ui.js`, `trung-trac.html` | `ATTACK_ICON`; `updateDashHud()` gán ảnh cho nút `attack` 1 lần qua `setControlIcon()`; nút có `<img>` + chữ tạm, `aria-label="Đánh"`. |

| # | Test | Kết quả |
|---|---|---|
| 8 | QC file: 32×32 RGBA, alpha nhị phân (0 pixel bán trong suốt), 0 pixel ngoài hình tròn nội tiếp r16 | PASS |
| 9 | Màn 3 `?debug=1` 740×360: 4 ảnh nút tải xong (ĐÁNH 32, LƯỚT 32, TÊN 64, BÓNG 64), chữ tạm ẩn, console không lỗi | PASS |

Vấn đề asset: không. Lệch `qa_notes` giữa 2 manifest (có từ trước, không do task này) — nên cho Codex đồng bộ bản nguồn.

## Đợt 4 — bỏ ô đếm chunk

| File | Mục đích |
|---|---|
| `render.js` | Xoá `drawChunkMarker()` (ô “N / 12” góc trên-phải canvas) + lời gọi trong `draw()`; bỏ import `CHUNK_W` không còn dùng. |

| # | Test | Kết quả |
|---|---|---|
| 10 | Màn 1 740×360: không còn ô đếm chunk, console không lỗi | PASS |

Ghi nhận thêm: đầu màn 1 (người chơi x = 84, camera kẹp ở 0) nhân vật cũng nằm sát cụm nút trái, giống màn 3 trước đợt 2 — chưa sửa, chờ quyết định.

## Lưu ý / TODO

- Nút ĐÁNH: icon `ICON_SK_ATTACK` (Codex 29/09, prompt [CODEX_PROMPT_ICON_SK_ATTACK.md](CODEX_PROMPT_ICON_SK_ATTACK.md)) — team duyệt 29/09 → `status: IN_GAME` ở cả 2 manifest.
- TODO: thử trên máy thật (iPhone Safari, Android Chrome, iPad) — đặc biệt thanh địa chỉ trình duyệt khi ngang và vùng tai thỏ.
- Cỡ/vị trí nút là `DESIGN_BASELINE`.
