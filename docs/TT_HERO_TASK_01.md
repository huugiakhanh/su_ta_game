# TT-HERO-01 — Nhân vật nam/nữ chung + cảnh chạy vào màn + hội thoại Trưng Trắc

Ngày: 12/10/2026. Trạng thái: code xong, chờ sprite Codex + thoại của team.

## Mục tiêu
- Người chơi là **một nghĩa sĩ nam hoặc nữ**, dùng chung cho mọi chương. Không vẽ nhân vật riêng cho từng chương nữa.
- Giới tính lấy từ tài khoản. Khách chọn một lần, trình duyệt nhớ.
- Bỏ màn phủ mờ và nút "Bắt đầu". Vào màn là nhân vật tự chạy từ mép trái vào.
- Màn 1 có thêm đoạn nói chuyện với Trưng Trắc trước khi bắt đầu tính giờ.

## Quyết định đã chốt
| # | Quyết định |
|---|---|
| D1 | Làm code trước. Sprite tạm: `PLAYER_TRUNG_TRAC` cho cả nam lẫn nữ. Sprite thật `PLAYER_MALE` / `PLAYER_FEMALE` do Codex vẽ. |
| D2 | Thêm cột `users.gender` riêng (migration 004). Không dùng cột `avatar`. |
| D3 | Tài khoản cũ có `gender = NULL`: hỏi khi vào màn, lưu bằng `POST /api/auth/gender`. Đăng ký mới bắt buộc chọn giới tính. |
| D4 | Khách: chọn 1 lần, lưu `localStorage['suta.player.gender']`. Đổi lại được trong menu Cài đặt, áp dụng từ lần vào màn sau. |
| D5 | Cảnh chạy vào có ở cả 3 màn. Hội thoại chỉ ở màn 1. |
| D6 | Trưng Trắc làm NPC màn 1: dùng strip idle của `PLAYER_TRUNG_TRAC` và chân dung `PORTRAIT_TRUNG_TRAC`. |
| D7 | Chơi lại (R / nút) thì không phát lại cảnh chạy vào và hội thoại. |
| D8 | Người chơi là nghĩa sĩ đi theo Hai Bà. Thoại do team viết, Claude chỉ để `TODO_MISSING`. |
| D9 | (13/10) Nhân vật dùng cho mọi chương, từ năm 40 tới 1789. Cách kể: **"nghĩa sĩ mỗi thời, cùng gương mặt"** (không du hành thời gian). |
| D10 | (13/10) Trang phục **phi thời đại**: áo ngắn vải mộc, quần lửng/xà cạp, đai trán, giáo cán tre mũi sắt. Bỏ lông chim, hoa văn Đông Sơn. "Giáo mũi sắt hợp mọi thời" chưa kiểm chứng (chờ team / `/research`). |
| D11 | (13/10) Vẽ lại `AVATAR_MALE` / `AVATAR_FEMALE` cùng đợt cho khớp hình tượng mới; giữ ID và cỡ ảnh. |
| D12 | (13/10) Team trả lời câu hỏi Codex: giáo mũi sắt **hợp** mọi thời; nếp cổ áo **không** bị đọc thành áo kiểu Hán. |
| D13 | (13/10) Người dùng yêu cầu Claude soạn thoại. Đã soạn `STORY_TRUNG_TRAC_INTRO` (5 câu) và sửa **chỉ lời xưng hô** trong `lines` của Thi Sách / Lê Chân / Trưng Nhị + `title` Trưng Nhị ("Em gái Trưng Trắc, cánh tay phải"). Câu hỏi, đáp án, gợi ý, giải thích, phần thưởng giữ nguyên (đối chiếu bằng script). Màn 3 + `STORY_THI_SACH` + `CHAPTER_END` kể ngôi thứ ba nên không sửa. |

| D14 | (03/11) Người dùng chốt đổi vũ khí: **kiếm thẳng sắt** thay giáo (thay phần vũ khí của D10). Giữ vùng trúng đòn 48px (code không đổi), `attack_01` chém ngang có vệt kiếm, giữ 9 frame @21, `hit_frame` 4, ô 128. Vẽ lại cả `ICON_SK_ATTACK`. Prompt `CODEX_PROMPT_PLAYER_SWORD.md` (đã xoá 04/11 khi asset xong — tóm tắt trong [REPORT_PLAYER-SWORD-01.md](REPORT_PLAYER-SWORD-01.md)). "Kiếm hợp mọi thời" **chờ team xác nhận**. |
| D15 | (04/11) Người dùng **loại bản kiếm v1** (ghép trên thân bản giáo: dáng không tự nhiên, kiếm lúc dài lúc ngắn). Vẽ **mới hoàn toàn** mọi animation, chỉ giữ tạo hình nhân vật. Chém **chéo từ trên xuống**; idle **thủ thế**; lưỡi kiếm **18 px logic**, một kiếm mẫu + bảng xoay; tay gần cầm kiếm. Concept đủ tư thế khoá 8 animation cho nam + nữ, duyệt trước khi vẽ strip. Prompt v2 đã xoá 04/11 — xem [REPORT_PLAYER-SWORD-01.md](REPORT_PLAYER-SWORD-01.md). |

## Acceptance criteria / test case
| # | Kiểm tra | Kết quả 12/10 |
|---|---|---|
| T1 | `register` thiếu hoặc sai `gender` → lỗi. `/api/auth/gender`: khách → 401, giá trị sai → 400, hợp lệ → 200. `/me` có trả `gender`. | PASS (`test_time_api.py`) |
| T2 | Migration 004 chạy được. Đổi giới tính lưu vào DB. Trang màn chơi có `data-gender`. | Viết test trong `test_app.py`; **skip** vì máy chưa có `SUTA_TEST_DATABASE_URL`. Server dev đã áp 004 thành công. |
| T3 | Chưa biết giới tính → hiện bảng chọn. Chọn xong mới tải asset, nhân vật chạy từ x = −40 tới 84 (màn 1/2) hoặc 170 (màn 3). | PASS (mô phỏng `update(1/60)`) |
| T4 | Màn 1: tới nơi thì hội thoại "Trưng Trắc" mở (có chân dung), nhân vật đứng `idle`. Đồng hồ 00:00 cho tới khi đóng hội thoại. Đóng xong: thông báo nhiệm vụ, Trưng Trắc mờ dần trong 0,8 s. | PASS |
| T5 | Bấm R: không có intro, không có Trưng Trắc. Bấm R trong lúc chọn nhân vật / tải asset: không có tác dụng. | PASS |
| T6 | Menu Cài đặt → "Đổi nhân vật": bảng chọn phủ lên menu, lưu xong hiện ghi chú. | PASS |
| T7 | Bảng chọn vừa khung ở cỡ 812×375. Không có lỗi console. | PASS |
| T8 | Khách tải lại trang thì không bị hỏi lại (đọc từ localStorage). | **Chưa kiểm**: Browser pane đang đăng nhập tài khoản thật. |

## Còn mở
- **Sprite:** Codex vẽ **liền khối** `PLAYER_MALE` / `PLAYER_FEMALE`, cùng hợp đồng với `PLAYER_TRUNG_TRAC`, theo
  `CODEX_PROMPT_PLAYER_MF.md` (đã xoá 13/10 khi asset xong — nội dung tóm tắt trong task card này và `SPRITE_REPORT_TT_32.md`):
  - Gate H1: idle + run. Gate H2: đủ 8 animation.
  - Có sprite thì đổi `PLAYER_SPRITES` trong `config.js`.
- **Để sau (người dùng chốt 12/10):** vẽ theo lớp (paper-doll) để cửa hàng đổi vũ khí/áo/quần/đồ cài đầu. Lý do hoãn: team không ai biết
  vẽ, vẽ theo lớp quá phức tạp. Các quyết định đã bàn (nam/nữ khác khung thân, đổi lớp + đổi màu, giáo/đao/rìu) giữ trong bộ nhớ dự án để
  dùng khi làm.
- ~~Nội dung lịch sử~~ → Claude soạn/sửa 13/10 theo yêu cầu (D13), **chờ team đọc duyệt**. Danh sách ban đầu:
  - Thoại Trưng Trắc ở màn 1 (`STORY_TRUNG_TRAC_INTRO`).
  - Thoại NPC màn 2: Thi Sách và Trưng Nhị đang nói với người chơi như thể người chơi là Trưng Trắc.
  - `STORY_THI_SACH` ("Trưng Trắc quyết dựng cờ…").
  - Cutscene màn 3: người chơi tự đi tới cổng.
  - Tên kỹ năng "Bóng Trưng Nhị".
  - `INTRO_MESSAGES`.
- ~~Nền trống khi chọn nhân vật~~ → đã sửa 12/10: nền + sprite của màn tải song song trong lúc bảng chọn mở (nền hiện sau ~5,8 s ở lần tải lạnh); chọn xong vào màn sau 21 ms (sprite người chơi đã có sẵn trong bộ tải của màn 1). Prompt sprite: `CODEX_PROMPT_PLAYER_MF.md` (đã xoá 13/10 khi asset xong — nội dung tóm tắt trong task card này và `SPRITE_REPORT_TT_32.md`) — bỏ `PORTRAIT_PLAYER_*`, avatar đã duyệt đóng vai chân dung; trang phục 1 bộ chung, cả hai cầm giáo đồng (người dùng chốt).

## Soát asset Codex — 13/10/2026 (`/asset-review`)
| Asset | Animation | Kết quả | Ghi chú |
|---|---|---|---|
| `PLAYER_MALE`, `PLAYER_FEMALE` | idle, run, attack_01, hurt, victory, dash | PASS | Cùng hợp đồng `PLAYER_TRUNG_TRAC` (cỡ, ô, fps, `hit_frame` 4, `frame_w` 128); alpha 0/255; 32 màu, 0 màu ngoài palette; chân hàng 187; không chạm mép ô. |
| ″ | jump | PASS (ghi chú) | Chân nhấc lên tới hàng 162–178 (Trưng Trắc: 187); lệch tối đa ~6 px logic, chỉ lúc đang bay. |
| `PLAYER_FEMALE` | death | PASS | |
| `PLAYER_MALE` | death | PASS (sửa 13/10) | Bản đầu: ô 4–5 nằm mà giáo dựng đứng → Codex vẽ lại ô 4–5 (giáo đổ, ô 5 nằm sát đất); ô 1–3 không đổi. Đo lại: 960×192, alpha 0/255, 32 màu, 0 màu ngoài palette, chân y187. Codex tự chép vào `frontend/` (prompt dặn không đụng) — bản game trùng bản nguồn. |
| `AVATAR_MALE`, `AVATAR_FEMALE` | idle | PASS | 256×256, alpha 0/255, 32 màu. |

Đã tích hợp (người dùng duyệt):
- 16 strip vào `sprites-32bit/player/PLAYER_{MALE,FEMALE}/`.
- 2 mục mới trong `manifest_tt.json` bản chạy (status `IN_GAME`, cả bản nguồn). `AVATAR_*`/`ICON_HUD_GOLD` có trong manifest nguồn nhưng **không** chép vào manifest chương (asset dùng chung web).
- Avatar mới vào `images/avatar/`.
- `PLAYER_SPRITES` đổi sang `PLAYER_MALE`/`PLAYER_FEMALE`.

Kiểm tra:
- Flask phục vụ đủ 18 file, đúng cỡ.
- `config.js` nạp được trong Node.
- 21 module qua kiểm cú pháp ESM.
- `pytest` 78 pass / 1 skip.
- **Chưa kiểm trên trình duyệt** (Browser pane không khả dụng ở phiên này).

Câu hỏi Codex gửi team (chưa trả lời):
1. Giáo mũi sắt có hợp mọi thời 40–1789 không?
2. Nếp cổ áo có bị đọc thành áo vạt chéo kiểu Hán không?

## Soát asset Codex — PLAYER_SWORD SW1 — 03/11/2026 (`/asset-review`)
Bản ứng viên ở `assets/sprites-32bit/meta/sword_sw1/delivery/`; Codex chưa ghi đè strip chính, tự báo `NEED_REDRAW`.
| Asset | Animation | Kết quả | Ghi chú |
|---|---|---|---|
| `CONCEPT_PLAYER_SWORD` | concept | PASS — người dùng chọn **A** (03/11) | Kiếm thẳng, chuôi quấn vải, đốc tròn; phương án A chắn ngang ngắn, B đĩa tròn. |
| `PLAYER_MALE` | idle | NEED_REDRAW | 1152×192, alpha 0/255, baseline 187 đúng. Tâm chân x≈87 (ô 192, pivot 96; bản giáo ≈92–97) → lệch trái ~2 px logic. Mặt/thân bị vẽ lại (bbox khác biệt phủ cả người), không chỉ vùng vũ khí. 2 màu ngoài bảng (`#6C6E7A`, `#A5A8B2` — lỗi của prompt, đã sửa sang xám có trong bảng). |
| `PLAYER_MALE` | attack_01 | NEED_REDRAW | 4608×192, baseline 187 đúng. **Người to hơn idle ~20%** (thế tấn cao ~145 px ảnh, bản giáo ~118). **Tâm chân lệch trái**: x≈219–234 (pivot 256; bản giáo 265–275) → khi đánh nhân vật giật sang trái. **Vệt chém** ô 4 tới x=458 (cần 480–504), một tông xám phẳng, tách rời mũi kiếm (prompt cần 2–3 tông + viền, nối liền lưỡi). |
Ghi chú: bản giáo cũ ô chạm cũng chỉ tới x=445 — vùng trúng đòn 48px vốn dài hơn hình từ trước.

### SW1 lượt 2 (R2) — 03/11/2026
Codex ghép kiếm lên thân bản giáo (giữ pixel thân, scale 1.0, căn lại pivot). Ứng viên: `assets/sprites-32bit/meta/sword_sw1_r2/delivery/`.
| Asset | Animation | Kết quả | Ghi chú |
|---|---|---|---|
| `PLAYER_MALE` | idle | NEED_REDRAW (nhẹ) | 1152×192, alpha 0/255, baseline 187, 0 màu ngoài bảng; thân trùng bản giáo. Lưỡi kiếm chỉ dày ~1–2 px ảnh (< 0,5 px logic) → ở cỡ chơi ×1 đọc thành cây gậy/que, không thấy chắn tay. |
| `PLAYER_MALE` | attack_01 | NEED_REDRAW | Đã đạt: tỉ lệ thân = bản giáo, tâm chân 255,5–256,5, vệt ô 4 x 365–498 / y 71–150. Lỗi: **ô 3 còn sót cán giáo** ngang qua hai tay; ô 1–3 tay vẫn nắm kiểu cầm giáo, kiếm nằm sau lưng không nằm trong tay; vệt chém là **hình trăng lưỡi liềm tô đặc xám tối**, gắn vào lưỡi kiếm mảnh → nhìn như rìu/đại đao trên cán, không phải vệt chém. |
Nguyên nhân gốc: giữ nguyên pixel thân thì tư thế tay vẫn là tư thế cầm giáo hai tay. Codex báo người dùng cho phép **36 màu** ở SW1 (vượt 32) — chưa xác nhận trong phiên Claude.
Người dùng chốt sau R2 (03/11): cho Codex **vẽ lại hai cánh tay + kiếm** (giữ đầu, mặt, thân, chân — đo trùng pixel ngoài mask); xác nhận **cho phép 36 màu** cho `PLAYER_MALE`/`PLAYER_FEMALE` bản kiếm.

### SW1 lượt 3 (R3) — 03/11/2026
Ứng viên: `assets/sprites-32bit/meta/sword_sw1_r3/delivery/`. Đo lại: idle 1152×192, attack_01 4608×192, alpha 0/255, 36 màu, 0 màu ngoài bảng, baseline 187; vệt ô 4 tới x=492.
| Asset | Animation | Kết quả | Ghi chú |
|---|---|---|---|
| `PLAYER_MALE` | idle | NEED_REDRAW (dọn) | Kiếm cầm một tay, lưỡi rộng, đọc rõ ở ×1 — đạt. Lỗi: **ô 2–6 còn que mảnh dựng đứng trên nắm tay** (đầu cán giáo cũ, lên quá đầu); ô 1, 4, 5 còn **mẩu nâu nhọn cạnh bàn chân phải** (đuôi cán giáo). |
| `PLAYER_MALE` | attack_01 | NEED_REDRAW (dọn) | Ô 4–5: tay, kiếm, vệt cung mảnh sáng — đạt. Lỗi đường ghép: ô 2 mảnh vụn rời quanh vai/tay sau và cạnh hông phải; **ô 3 mảng áo chữ nhật nổi rời cạnh thắt lưng**; ô 7–9 mẩu vụn cạnh vai/khuỷu tay sau. Cần soát pixel rời (cụm không nối thân) ở mọi ô. |

### SW1 lượt 4 (R4) — 03/11/2026
Ứng viên: `assets/sprites-32bit/meta/sword_sw1_r4/delivery/`. Đo lại: idle 1152×192, attack_01 4608×192, alpha 0/255, 36 màu, 0 màu ngoài bảng; **mỗi ô đúng 1 cụm pixel** (8 hướng) — không còn que/đuôi cán giáo, không mảnh vụn.
| Asset | Animation | Kết quả | Ghi chú |
|---|---|---|---|
| `PLAYER_MALE` | idle | NEED_REDRAW (tay cầm) | Sạch. Còn theo quy tắc mới: tay cầm kiếm phải là tay gần người xem, vẽ đè lên thân. |
| `PLAYER_MALE` | attack_01 | NEED_REDRAW (tay cầm) | Sạch; ô 4–5 vệt đạt. Lớp tay chưa thống nhất: ô 6–9 tay cầm kiếm vắt chéo trước ngực (lớp trên thân), ô 1–3 tay giơ kiếm nằm ở mép ngoài thân như tay xa. |
Người dùng chốt (03/11): **tay cầm kiếm = tay gần người xem, luôn vẽ đè lên thân, mọi animation, cả nam lẫn nữ**. Đã ghi vào prompt mục 3.1.

### SW1 lượt 5 (R5) — 03/11/2026
Ứng viên: `assets/sprites-32bit/meta/sword_sw1_r5/delivery/`. Đo lại: idle 1152×192, attack_01 4608×192, alpha 0/255, 36 màu, 0 màu ngoài bảng, baseline 187, mỗi ô 1 cụm pixel. So R4: idle đổi vùng tay (y 82–184), attack ô 1–3 đổi vùng tay, ô 4–9 trùng từng byte.
| Asset | Animation | Kết quả | Ghi chú |
|---|---|---|---|
| `CONCEPT_PLAYER_SWORD` | concept | PASS | Phương án A. |
| `PLAYER_MALE` | idle | PASS | Tay gần vắt qua ngực cầm kiếm, tay xa sau thân; kiếm rõ ở ×1. Mép phải cách ô 3 px (x=189/192). |
| `PLAYER_MALE` | attack_01 | PASS | Ô 1–3 tay gần vắt trước thân giơ kiếm; ô 4 đâm ngang + vệt tới x=492; ô 6–9 hạ kiếm, cùng một tay. |
Gate SW1 đạt — người dùng duyệt 04/11, giao SW2 (6 animation nam còn lại, đủ 8 animation nữ, `ICON_SK_ATTACK`).
**04/11: người dùng loại hướng ghép trên thân bản giáo (D15)** — chuyển sang prompt v2 vẽ mới.

## Soát asset Codex — PLAYER_SWORD v2 Gate C (concept) — 04/11/2026 (`/asset-review`)
`concept/CONCEPT_PLAYER_SWORD.png` + từng pose ở `assets/sprites-32bit/meta/sword_v2/C/delivery/`. Kiếm mẫu: lưỡi 72 px ảnh (18 logic), dày 8 px, tổng 92 px; lưỡi chiếu sau xoay 71,0–71,7 px ảnh (lệch < 1 px).
| Asset | Nội dung | Kết quả | Ghi chú |
|---|---|---|---|
| Kiếm mẫu + bảng xoay | 12 góc | PASS | Chắn A, chuôi quấn nâu, đốc tròn. |
| `PLAYER_MALE` | 10 tư thế khoá | PASS — **người dùng duyệt 04/11** | Tạo hình giữ đúng; tay gần cầm kiếm; ≤ 36 màu, 0 màu ngoài bảng; vệt f4 tới x=492, trong y 44–172. Lưu ý cho Gate A/B: hurt, dash sát mép trái (x=2), victory sát mép trên (y=3); death đáy y=190 (dưới baseline 187); vệt f5 là vòng nhỏ quanh mũi kiếm, đọc hơi rối. |
| `PLAYER_FEMALE` | 10 tư thế khoá | NEED_REDRAW | Mặc **y hệt nam** (áo nâu, đai lưng chàm, đai trán chàm) — sai tạo hình hiện tại (áo chàm, đai lưng nâu, đai trán đỏ). **Lỗi do prompt** ghi "cùng màu với nam"; đã sửa mục 3.1. Người dùng chốt giữ tạo hình nữ cũ; dáng/tư thế theo nam đã duyệt. |

### Gate C R2 — 04/11/2026
Chỉ vẽ lại 10 tư thế nữ (`meta/sword_v2/C/R2/delivery/`); Codex báo 0 pixel đổi ngoài vùng nữ trên board.
| Asset | Nội dung | Kết quả | Ghi chú |
|---|---|---|---|
| `PLAYER_FEMALE` | 10 tư thế khoá | PASS — **người dùng duyệt 04/11** (Gate C xong, giao Gate A) | Đúng tạo hình cũ: áo chàm, đai lưng nâu, đai trán đỏ, tóc búi + xõa dài. Dáng và góc kiếm khớp nam đã duyệt; tay gần cầm kiếm, trên thân. Alpha 0/255, 36 màu, 0 màu ngoài bảng; vệt f4 tới x=492. Cùng lưu ý mép/baseline như nam (hurt/dash/death x=2, victory y=3, death đáy y=190); đầu vệt f4 có một dải màu kem nhạt, cần thống nhất tông vệt ở Gate A. |

## Soát asset Codex — PLAYER_SWORD v2 Gate A — 04/11/2026 (`/asset-review`)
Ứng viên `assets/sprites-32bit/meta/sword_v2/A/delivery/`. Đo lại: idle 1152×192, attack_01 4608×192, alpha 0/255, 36 màu, 0 màu ngoài bảng. Codex báo: lưỡi chiếu 71,0–71,6 px ảnh mọi ô, lề ≥ 4 px, 1 cụm/ô, vệt ô 4 x 311–492 / y 44–164.
| Asset | Animation | Kết quả | Ghi chú |
|---|---|---|---|
| `PLAYER_MALE` | idle | NEED_REDRAW | Người dùng báo hai tay đè nhau. Xác nhận: cả 6 ô tay gần mọc từ vai phía sau, vắt xuống cầm kiếm ở thắt lưng; **bàn tay xa thò ra ngay khuỷu tay gần**, cùng chĩa về sau → đọc như hai tay mọc một chỗ. |
| `PLAYER_MALE` | attack_01 | NEED_REDRAW | Ô 1, 6, 7, 8, 9 lỗi giống idle. Ô 4–5 tay gần lại mọc từ vai phía trước (đổi vai giữa các ô). Ô 2–3 (giơ kiếm qua vai, tay xa mở ra trước) đọc đúng. Kiếm không đổi độ dài, vệt đạt. |
Người dùng chốt (04/11): hai tay không chồng nhau, mỗi tay mọc từ vai riêng cố định qua mọi ô; tay xa đưa về trước ngực khi tay gần vắt qua thân. Đã ghi prompt mục 3.3.

### Gate A lượt 2 (R2) — 04/11/2026
Ứng viên `assets/sprites-32bit/meta/sword_v2/A/R2/delivery/` (đồng bộ `A/delivery/`). Đo lại: idle 1152×192, attack_01 4608×192, alpha 0/255, 36 màu, 0 màu ngoài bảng. Codex báo: chỉ sửa vùng vai–tay 13 ô (ô 2–3 giữ nguyên), kiếm và vệt 0 pixel đổi.
| Asset | Animation | Kết quả | Ghi chú |
|---|---|---|---|
| `PLAYER_MALE` | idle | PASS — **người dùng duyệt 04/11** | Tay gần từ vai phía sau xuống cầm kiếm ở hông, trên thân; tay xa nắm thủ trước ngực. Hai tay tách rõ, không chồng nhau. |
| `PLAYER_MALE` | attack_01 | PASS — **người dùng duyệt 04/11**, giao Gate B | Cùng một vai tay gần ở cả 9 ô (hết đổi vai ở ô 4–5); tay xa thủ trước ngực ở ô 1, 4–9, mở ra trước ở ô 2–3. Ô 9 = idle ô 1. Lưỡi 71,0–71,6 px, vệt ô 4 tới x=492. |

## Soát asset Codex — PLAYER_SWORD v2 Gate B — 04/11/2026 (`/asset-review`)
Codex đã ghi đè 17 strip/icon chính ở `assets/sprites-32bit/` + `manifest_tt.json` (status `NORMALIZED`). Đo lại bằng script: mọi strip đúng `frames × frame_w × 4` × 192 (icon 128×128), alpha 0/255, đáy mọi ô y=187, 1 cụm pixel/ô, lề ≥ 4 px; nam 36 màu, nữ 36, icon 32, 0 màu ngoài bảng; manifest so `manifest_shared.json` chỉ khác `status`/`qa_notes`.
| Asset | Animation | Kết quả | Ghi chú |
|---|---|---|---|
| `PLAYER_MALE` | idle, attack_01 | PASS | Trùng byte Gate A R2 đã duyệt. |
| `PLAYER_MALE` | run, jump, hurt, death, victory, dash | PASS — duyệt 04/11 | Tay gần cầm kiếm mọi ô, hai tay tách; lưỡi 71,0–71,6 px. Death: quỵ gối gục xuống, kiếm nằm trước mặt ở ô 4–5 (không nằm sấp hẳn). Jump 3 ô đều chạm y=187 như bản cũ. |
| `PLAYER_FEMALE` | đủ 8 | PASS — duyệt 04/11 | Tạo hình C R2 (áo chàm, đai nâu, đai trán đỏ, tóc xõa); dáng theo nam. Attack: vệt ô 4 tới x=492, ô 9 = idle 1. Codex báo cảnh báo phụ dash (diện tích silhouette lệch 10,8% so idle) — xem mắt thấy bình thường. |
| `ICON_SK_ATTACK` | idle | PASS — duyệt 04/11 | Kiếm chéo 45°, vải đỏ ở chuôi. |

### Tích hợp vào game — 04/11/2026
- Người dùng duyệt Gate B 04/11. Chép 17 PNG (`PLAYER_MALE` 8, `PLAYER_FEMALE` 8, `ICON_SK_ATTACK`) sang `frontend/static/assets/images/shared/sprites-32bit/` (SHA256 trùng nguồn). `status` = `IN_GAME` ở `assets/sprites-32bit/manifest_tt.json` và `manifest_shared.json`; `qa_notes` thêm ghi chú duyệt. Số frame/fps/`hit_frame`/`frame_w` không đổi nên **không sửa code** (vùng trúng đòn 48px giữ nguyên; tên hàm `spearBox` để nguyên).
- `pytest tests`: 108 passed, 1 skipped (test cần DB riêng).
- Trình duyệt (server dev 5057): `?viewer=1` liệt kê `PLAYER_MALE`/`PLAYER_FEMALE` `IN_GAME`, 17/17 ảnh nạp đúng cỡ theo manifest; chơi màn 1 Trưng Trắc với nhân vật nam, bấm J, dừng vòng vẽ ở ô chạm (`attack` t = 0,15 s): kiếm bổ chéo + vệt cung hiện trước mặt. Console: chỉ 401 `/api/auth/me` (khách) và 3 cảnh báo sprite `PJ_OIL_JAR`/`FX_OIL_FIRE`/`PJ_ARROW_RAIN` chưa nạp ở màn 1 — có từ trước, không liên quan đợt này.
- **Chưa kiểm:** nhân vật nữ trong màn chơi thật (mới xem ở viewer), chương Bà Triệu / Lý Nam Đế, cỡ màn hình điện thoại.
- Còn mở: team xác nhận "kiếm thẳng sắt hợp mọi thời 40–1789" (prompt mục 4).
