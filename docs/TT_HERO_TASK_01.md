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
