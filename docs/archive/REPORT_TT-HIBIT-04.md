# REPORT TT-HIBIT-04 — Phần D: nạp asset theo màn, gỡ bộ 8-bit, dọn tài liệu

Ngày: 06/10/2026 • Trạng thái: **HOÀN THÀNH** (phần code + dọn dẹp); **TODO**: đo trên điện thoại thật (cần người dùng).
Không có task card riêng — kế hoạch người dùng duyệt trong chat 06/10 (4 quyết định ở mục 1). Trước đó: [REPORT_TT-HIBIT-03.md](REPORT_TT-HIBIT-03.md).

## 1. Quyết định người dùng (06/10)

| Việc | Chốt |
|---|---|
| Kế hoạch: gỡ 8-bit khỏi code → nạp theo màn → xoá ảnh 8-bit → dọn tài liệu → test → report | Duyệt, làm luôn |
| Vùng làm việc 8-bit của Codex `assets/sprites/` (200 MB), `assets/maps/` (62 MB) — ngoài git | **Giữ lại** (chỉ xoá bản 8-bit trong `frontend/`) |
| Dọn tài liệu | Theo danh sách đề xuất (mục 4) |
| `EN_HAN_BOAT`, `EN_HAN_BASE` (chỉ có 8-bit, không màn nào dùng) | Xoá code + khai báo |

## 2. Kết quả đo (asset thật, không cờ, máy dev, server Flask cục bộ)

Ảnh giải nén = tổng w×h×4 mọi ảnh trong `images`; thời gian = tới khi `loadAssets()` xong (tính từ lúc mở trang).

| Màn | Trước (06/10, TT-HIBIT-03) | Sau | Giảm |
|---|---|---|---|
| 1 | map 67,8 + sprite 95,4 = **163 MB**, ~9,1 s | map 67,8 + sprite 47,7 = **116 MB**, ~6,8–6,9 s | −29 % |
| 2 | 52,4 + 95,4 = **148 MB**, ~8,5 s | 52,4 + 47,5 = **100 MB**, ~6,8 s | −32 % |
| 3 | 29,9 + 95,4 = **125 MB**, ~8,6 s | 22,9 + 58,4 = **81 MB**, ~6,4 s | −35 % |

Màn 3 không còn nạp `BG_TT_FAR_HILLS` (bị trời giông che hoàn toàn).

## 3. File code đã sửa

| File | Mục đích |
|---|---|
| `config.js` | `MAP_ROOT`/`SPRITE_ROOT` (bỏ `MAP_8BIT_ROOT`, `SPRITE_8BIT_ROOT`, `*_32BIT_ROOT`); **`LEVEL_SPRITES`** (sprite canvas mỗi màn — thay `SPRITE_8BIT_IN_GAME`); bỏ `HIBIT_FRAME_LOCKED`, `SPRITE_HIBIT_ONLY`, `ITEM_ROOT`/`ITEM_FILES`, `patrolBoat`; sửa chú thích 8-bit/lỗi thời (kể cả `VICTORY_FLAG_ATTACH`) |
| `assets.js` | viết lại: chỉ nạp manifest 32-bit; bỏ so contract với 8-bit (`mapMismatch`, `tileMetaMismatch`, `hibitMismatch`) và fallback 8-bit, bỏ `?hibit=1`; nạp sprite theo `LEVEL_SPRITES[LEVEL.id]` + ảnh DOM; đồi xa bỏ khi mọi vùng của màn có trời che nó; ảnh sai cỡ logic × `density` → cảnh báo + vẽ tạm; `images.sprites8` → `images.sprites`, thêm `images.loaded` |
| `render.js` | `spriteImage()` thay mọi chỗ đọc strip — sprite chưa nạp ở màn này thì cảnh báo 1 lần "thêm vào LEVEL_SPRITES"; `drawSprite8` → `drawSprite`; bỏ nhánh `boat`; chú thích |
| `physics.js` | bỏ hành vi hazard `boat` (người dùng chọn xoá) |
| `main.js` | thông báo/log theo cấu trúc mới (một dòng log nền + sprite đã nạp, cảnh báo khi thiếu) |
| `ui.js` | bỏ tim dự phòng `items/heart.png` (thiếu icon thì chữ ♥) |
| `viewer.js` | chỉ đọc manifest 32-bit (bỏ mục `[32-bit]` đôi) |
| `animation.js`, `geometry.js` | chú thích |

Không đổi gameplay (hitbox, nhịp, nội dung màn).

## 4. File đã xoá

- **Ảnh 8-bit trong game** (114 file, có trong git): `frontend/static/assets/images/trung-trac/sprites-8bit/`, `maps-8bit/`, `frontend/static/assets/images/items/heart.png`.
- **Tài liệu** (có trong git, trừ handoff): `docs/CODEX_PROMPT_ICON_SK_ATTACK.md`, `CODEX_PROMPT_ICON_SK_DASH.md`, `CODEX_PROMPT_PROP_TT_QUIZ_STELE.md`,
  `CODEX_PROMPT_TILESET_PIT.md`, `CODEX_PROMPT_TILESET_TT_TERRAIN.md` (prompt asset 8-bit đã xong), `docs/sprite-spec-trung-trac.md`,
  `docs/asset-brief-trung-trac.md`, `SUTA_TT_BOSS_ASSET_BRIEF.md`, `docs/HANDOFF_32BIT.md` (**ngoài git — mất hẳn**; nội dung đã có trong report 01–04).
  Liên kết markdown tới các file này trong tài liệu khác đổi thành tên file + "(đã xoá 06/10)"; nhắc tên dạng chữ trong report/task card cũ giữ nguyên (lịch sử).
- **Ngoài danh sách đã duyệt (báo rõ):** `tools/finalize_en_han_rusher_redraw.py`, `tools/finalize_npc_trung_nhi_attack_redraw.py` — script một lần
  của đợt vẽ lại 8-bit (26/09), chép ảnh vào `sprites-8bit/` nên vô dụng sau khi xoá bộ 8-bit; có trong git. `tools/__pycache__/` (6 file `.pyc`,
  ngoài git) bị khoá quyền xoá trong môi trường này — vô hại, người dùng tự xoá thư mục `tools/` được.
- **Đợt 2 (người dùng chọn thêm 06/10):** 12 file `docs/CODEX_PROMPT_32BIT_*.md` (prompt các đợt sprite/chân dung/map đã xong; **ngoài git — mất
  hẳn**); link trong report/task card/brief đổi thành tên file + "(đã xoá)".
- **Đợt 3 (người dùng chọn 06/10):** gộp 4 brief (`SUTA_TT_SPRITE_BRIEF.md`, `SUTA_TT_MAP_BRIEF.md` — có trong git; `SUTA_TT_SPRITE_BRIEF_32.md`,
  `SUTA_TT_MAP_BRIEF_32.md` — ngoài git) thành **`SUTA_TT_ART_BRIEF_32.md`** (chỉ 32-bit, tự đủ) rồi xoá 4 file cũ; link trong report/task card/
  CLAUDE.md/config.js trỏ sang file mới.
- **Giữ:** `SUTA_TT_TASK_NPC_01.md`/`BOSS_01.md` (nguồn nguyên
  văn thoại/cốt truyện/thông báo), mọi report/task card/plan khác, `docs/references/hibit_style_ref_trung_trac.gif` (brief 32-bit dùng),
  vùng làm việc Codex `assets/` (8-bit lẫn 32-bit).

Tài liệu cập nhật: `CLAUDE.md` (gộp 2 mục bộ sprite 8-bit/32-bit thành 1 mục "Bộ asset 32-bit", `assets.js`, Map, vật cản, bình thư, bia đá,
HUD, quy ước thêm sprite/asset môi trường, mục Tài liệu asset; sửa mô tả cờ chiến thắng đang sai), `docs/architecture.md` (thay đoạn nền
cảnh lỗi thời `backdrops/chapter1`), brief gộp `SUTA_TT_ART_BRIEF_32.md`.

## 5. Test

| # | Kịch bản | Kết quả |
|---|---|---|
| T1 | Cú pháp 17 module (`node --check` dạng `.mjs`) | PASS |
| T2 | Không còn tham chiếu tên đã gỡ (`SPRITE_8BIT_*`, `MAP_8BIT_ROOT`, `*_32BIT_ROOT`, `ITEM_*`, `sprites8`, `hibit*`) trong code; không file nào ngoài tài liệu trỏ tới `sprites-8bit`/`maps-8bit`/`items/` | PASS |
| T3 | `LEVEL_SPRITES` đủ và không thừa: màn 1 dựng 30 lượt xáo (kể cả `?layout=p2`), màn 2, màn 3 + mọi nguồn sinh động (đợt quân, Tô Định đi bộ, hũ dầu, lửa, mưa tên, bóng Trưng Nhị, `?layout=skills`) | PASS — 3 màn thiếu 0 / thừa 0 |
| T4 | Sau khi xoá ảnh 8-bit: màn 1 và 2 vẽ hết chiều dài màn (camera từng 120 px, gồm mọi vùng hoà cảnh), màn 3 mô phỏng 4 s (chiến xa ném hũ, lính, quân cảm tử, Tô Định) + mở cổng/cờ | PASS — 0 lỗi, 0 cảnh báo; ảnh chụp màn 3 đúng |
| T5 | Cơ chế cảnh báo: tạm gỡ strip `EN_HAN_GUARD` rồi vẽ lính canh | PASS — "sprite EN_HAN_GUARD chưa nạp ở màn 1 — thêm vào LEVEL_SPRITES[1]", vẽ hộp tạm |
| T6 | Viewer `?viewer=1` | PASS — 46 mục (sprite + 15 vật thể map), ảnh lấy từ `*-32bit/` |
| T7 | Bộ nhớ / thời gian nạp | Đo ở mục 2 |
| T8 | `pytest tests` | 1 skipped (chưa cấu hình `SUTA_TEST_DATABASE_URL` — như CLAUDE.md) |

Ghi chú test: khung trình duyệt ẩn (cửa sổ 0×0) làm `fitCanvas()` ra hệ số bộ đệm 0 → canvas hoà lớp giữa cỡ 0 và `drawImage` lỗi — hiện tượng
môi trường test, không phải lỗi game; test chạy với khung 1280×720.

## 6. TODO / đề xuất tiếp

- **Đo trên điện thoại thật** (chưa làm — cần người dùng): màn 1 vẫn ~116 MB ảnh giải nén, chủ yếu nền (5 lớp giữa ×4 ≈ 7,5 MB/lớp, 2 trời ≈
  7,9 MB/ảnh). Nếu điện thoại yếu bị thiếu bộ nhớ: (a) nạp lớp giữa theo vùng khi camera tới gần thay vì cả màn; (b) giảm ảnh nền xuống ×2
  cho máy có bộ đệm N ≤ 2; (c) chỉ nạp prop màn dùng (vd. màn 2 không có cổng nhưng vẫn nạp 2 ảnh cổng ≈ 4 MB).
- Thời gian nạp ~6–7 s trên máy dev chủ yếu do giải mã PNG lớn; panel "Bắt đầu" đã khoá tới khi nạp xong.
- Chưa commit (cả đợt 32-bit + Phần D). `.gitignore` (người dùng sửa 06/10) đã bỏ qua `assets/maps-32bit`, `assets/sprites-32bit` — vùng
  làm việc Codex không vào git.
