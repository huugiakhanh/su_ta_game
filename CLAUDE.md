# CLAUDE.md

Hướng dẫn cho Claude Code khi làm việc trong repo này. File này nạp ở **mọi phiên** nên chỉ giữ quy tắc chung. Chi tiết theo vùng code nằm trong `.claude/rules/` — mỗi rule **tự nạp khi Claude đọc/sửa file khớp `paths`** của nó:

| Rule | Nạp khi làm việc với |
|---|---|
| [engine.md](.claude/rules/engine.md) | Engine màn chơi dùng chung mọi chương `js/engine/`, `gameplay/base.html`, `css/game/` |
| [trung-trac-gameplay.md](.claude/rules/trung-trac-gameplay.md) | Phần riêng chương Trưng Trắc `js/levels/trung-trac/`, template + CSS chương |
| [assets-32bit.md](.claude/rules/assets-32bit.md) | Asset (`assets/`, `static/assets/`), file JS vẽ/nạp asset, brief + prompt Codex, `tools/` |
| [backend.md](.claude/rules/backend.md) | `backend/`, `tests/`, `app.py` |
| [web-pages.md](.claude/rules/web-pages.md) | Trang chủ + cửa sổ, Thư viện lịch sử, `/quiz` |
| [history-content.md](.claude/rules/history-content.md) | File chứa nội dung lịch sử (câu hỏi, thoại, thư viện) |

Quy trình lặp lại đóng gói thành **skill** trong `.claude/skills/` — gõ `/tên`: `/task-report`, `/commit-master`, `/verify-ui`, `/codex-prompt`, `/asset-review`, `/add-migration`, `/home-window`, `/research` (tìm thông tin có trích nguồn).

Lý do của các quyết định cũ nằm trong report ở `docs/archive/` (tra theo mã task, vd. `TT-TERRAIN-01` → `REPORT_TT-TERRAIN-01.md`) và lịch sử git.

## Giới thiệu game

**Sử Ta** là game 2D pixel art giáo dục lịch sử Việt Nam chạy trên web (Canvas + Flask). Người chơi vào vai nhân vật lịch sử, vượt chướng ngại, nhặt vật phẩm, trả lời câu hỏi lịch sử để nhận phần thưởng, đánh boss cuối màn. Thiết kế: chia theo **chương** (mỗi chương một nhân vật/giai đoạn), mỗi chương **3 màn**, màn cuối là boss.

**Trạng thái hiện tại** — chỉ chương **Trưng Trắc** có màn chơi (3 màn, chơi được):
- **Màn 1 — Vượt ải** (`/gameplay/levels/trung-trac`): vượt chướng ngại, nhặt 5 binh thư, hạ mini-boss kiệu quan, qua cổng Luy Lâu.
- **Màn 2 — Chiêu mộ hiền tài** (`…/trung-trac/2`): giải cứu và gặp Thi Sách → Lê Chân → Trưng Nhị, trả lời câu hỏi, nhận phần thưởng.
- **Màn 3 — Trận Luy Lâu** (`…/trung-trac/3`): boss Tô Định 3 giai đoạn, cutscene kết chương.

Phần thưởng màn 2 chỉ có tác dụng ở màn 3. Giáp, tăng dame vĩnh viễn, cửa hàng, năng lượng **chưa có**. Khi được yêu cầu làm việc liên quan, kiểm tra code thực tế thay vì giả định roadmap đã xong.

Ngoài màn chơi: trang chủ (đăng nhập, vàng/kim cương, BXH, thành tựu, dòng thời gian chọn nhân vật), Thư viện lịch sử (`/history`, 16 trang nhân vật), trắc nghiệm `/quiz`.

## Phân công AI và quy trình làm việc

- **Codex** (skill agent-sprite-forge) chỉ vẽ asset. **Claude** viết code gameplay, engine, dữ liệu màn chơi, và **không vẽ lại, không chỉnh sửa** ảnh Codex xuất (chi tiết: rule `assets-32bit.md`). Không để Codex và Claude cùng làm việc trên một thư mục cùng lúc.
- **Task card**: mỗi đầu việc lớn có một task card trong `docs/`. Đọc trước khi làm. Task card mâu thuẫn với code hoặc với file này → **dừng lại và báo**, không tự chọn một bên.
- **Lập kế hoạch trước khi code**: liệt kê file sẽ tạo/sửa và file chỉ đọc; chờ người duyệt rồi mới sửa. Có quyết định thật sự thuộc về người dùng (phong cách, phạm vi, đánh đổi) thì hỏi kèm phương án đề xuất. Chỉ sửa trong phạm vi đã duyệt, patch nhỏ nhất đủ đạt acceptance criteria, không refactor ngoài phạm vi. Tính năng thêm mà người dùng không yêu cầu (vd. tải trước khi rê chuột) thì hỏi trước.
- **Source of Truth**: không đổi ID/tên animation/số frame của asset, không tạo ID gần giống. Thiếu dữ liệu → ghi `TODO_MISSING`, không tự bịa; số tạm chưa qua chơi thử → ghi `DESIGN_BASELINE`.
- **Debug có bằng chứng**: tái hiện lỗi → nêu giả thuyết → thêm log tối thiểu → chứng minh nguyên nhân → mới sửa → xoá log tạm.
- **Kiểm chứng trước khi báo xong**: chạy `pytest tests`; thay đổi nhìn thấy được trên trình duyệt thì kiểm tra thật (skill `/verify-ui`), báo số đo cụ thể. Bước nào chưa kiểm được thì nói rõ.
- **Kết thúc task**: chạy test case trong task card, viết report (skill `/task-report`). Có test FAIL hoặc sửa ngoài phạm vi → báo `BLOCKED`, không báo hoàn thành. **Chỉ commit khi người dùng yêu cầu** (skill `/commit-master`), không push.
- **Thư mục `docs/`** chỉ để việc **đang làm** (task card, plan, prompt Codex còn chờ duyệt) + `architecture.md`, `references/`. Đầu việc xong → chuyển task card/plan/report vào `docs/archive/` bằng `git mv` và sửa link trỏ tới. TODO còn mở trong report cũ vẫn tra ở đó (vd. câu 41 bị tạm loại — `REPORT_TT-QUIZ-01`; ảnh nền GIF trang chủ 4,3 MB — `REPORT_HOME-LAZY-01`).
- **Nội dung lịch sử** (tên người, địa danh, sự kiện, câu hỏi, đáp án, nội dung thư viện): không tự sửa, không tự viết; nghi ngờ sai thì hỏi team (rule `history-content.md`).
- Trả lời người dùng bằng **tiếng Việt**.

## Kiến trúc

Flask server-rendered, **chưa dùng bundler JS**: client dùng ES modules chuẩn của trình duyệt (`<script type="module">` + `import`/`export`, đường dẫn tương đối), không webpack/vite/npm. Gameplay (vật lý, va chạm, vẽ) chạy hoàn toàn phía client; backend chỉ phục vụ trang, auth, tiến trình, kỷ lục. Chỉ hỗ trợ **PostgreSQL** (bắt buộc `SUTA_DATABASE_URL` trong `.env`).

```
su_ta_game/
├── app.py                    # entry point duy nhất — không tạo thêm app.py phụ
├── backend/                  # routes (pages.py, api.py), repositories, services, migrations, data/library_heroes.json
├── frontend/
│   ├── templates/            # home.html, history.html, quiz.html, library/hero.html,
│   │                         # components/home/*.html (cửa sổ trang chủ), gameplay/base.html (khung màn chơi chung)
│   │                         # + gameplay/levels/trung-trac.html (kế thừa base, dùng chung 3 màn)
│   └── static/
│       ├── css/              # main.css, home/*.css, history.css, library.css, quiz.css, game/game.css (khung màn chơi), levels/*.css
│       ├── js/home/          # ES modules trang chủ
│       ├── js/engine/        # engine màn chơi dùng chung mọi chương (người chơi, vật lý, quân, HUD, render...)
│       ├── js/levels/trung-trac/   # phần riêng chương: chapter.js (định nghĩa chương), nội dung màn, boss, kỹ năng
│       ├── js/{history,library,quiz}.js
│       └── assets/           # images/<chương>/ (asset riêng chương) + images/shared/ (nhân vật nam/nữ, icon HUD) + images dùng chung, audio/, question/
├── tools/make_home_images.py # sinh ảnh thu nhỏ cho web (ảnh gốc giữ nguyên)
├── docs/                     # việc đang làm + architecture.md; archive/ = đầu việc đã xong
├── tests/                    # test_time_api.py (không cần DB), test_app.py (cần DB test)
├── .claude/                  # rules/, skills/, launch.json (server dev cho preview)
└── SUTA_TT_ART_BRIEF_32.md   # brief duy nhất cho Codex
```

## Quy ước mở rộng

- **Thêm màn trong chương Trưng Trắc**: rule `trung-trac-gameplay.md` (mục "Thêm màn").
- **Thêm chương mới**: đặt tên file/level theo nhân vật-giai đoạn (nhất quán với `trung-trac`), giữ cấu trúc 3 màn. Engine `js/engine/` (rule `engine.md`) đã lo mọi cơ chế chung — chương chỉ cần:
  - thư mục `js/levels/<chương>/` theo mẫu `trung-trac/`: `chapter.js` (object định nghĩa chương — hợp đồng ở `engine/chapter.js`), `config.js`, `levelN.js`, dữ liệu thoại/câu hỏi/âm thanh, `main.js` gọi `boot(chapter)`;
  - template `templates/gameplay/levels/<chương>.html` kế thừa `gameplay/base.html`; CSS riêng (`css/levels/`) chỉ khi cần;
  - asset riêng ở `images/<chương>/` (manifest sprite + map của chương; nhân vật nam/nữ đã có ở `images/shared/`);
  - route trong `backend/routes/pages.py`, id level trong migration mới.
  - Thêm `paths` của chương mới vào các rule liên quan. Cơ chế mới dùng được cho nhiều chương thì thêm vào engine, không chép vào chương.
- **Thêm API**: endpoint trong `backend/routes/api.py`; nghiệp vụ dữ liệu trong `backend/repositories/`, không viết SQL trong route hay template.
- **Không** tạo `app.py` phụ để thử nghiệm — prototype đặt trong `tests/` hoặc `docs/archive/`.
- Dữ liệu màn chơi (toạ độ vật cản, câu hỏi, quân địch) **hard-code trong JS** của màn — sửa đúng file đó, không tạo cơ chế cấu hình mới trừ khi được yêu cầu.

## Lưu ý kỹ thuật

- Mật khẩu hash bằng werkzeug; đăng nhập giữ bằng Flask session (cookie ký bằng `SUTA_SECRET_KEY` — đổi giá trị mặc định khi chạy thật).
- Thời gian, điểm, thống kê lượt, kết quả quiz do trình duyệt đo/gửi → **chưa chống gian lận** (ảnh hưởng BXH, thưởng).
- Route gameplay giữ cả URL cũ (`/gameplay/level/Trung_Trac/trung-trac.html`) lẫn mới — khi thêm màn, cân nhắc có cần alias tương tự không.
- Test: `pytest tests`. `test_app.py` cần `SUTA_TEST_DATABASE_URL` (PostgreSQL riêng), tự skip nếu thiếu — không phải lỗi.
- Server dev cho preview: `.claude/launch.json` (`su-ta-flask-5057` chạy debug tắt → **template bị cache, sửa HTML phải khởi động lại server**).
- Kiến trúc chi tiết hơn: [docs/architecture.md](docs/architecture.md).
