# REPORT MHD-SKELETON — Khung chương Mai Hắc Đế

Task card: [SUTA_MHD_TASK_SKELETON_01.md](SUTA_MHD_TASK_SKELETON_01.md) • 07/11/2026 • **PASS** (`test_app.py` chưa chạy trên DB test; chưa thử bằng tài khoản thật và chưa chơi tay — xem dưới)
Yêu cầu người dùng: lập kế hoạch chương 5 từ sheet "5 Mai Hắc Đế", rồi dựng khung chương theo task card đã duyệt.

## Quyết định (người dùng chốt)
- (07/11, MHD-00) Thêm gánh vải mở màn + cứu dân phu / lòng dân; không làm dựng thành Vạn An, bè sông Lam.
- (07/11, MHD-00) Giữ NPC người mẹ, ghi "tương truyền", đưa lên đầu: Mẹ → Thúc Bảo → Sứ giả.
- (07/11, MHD-00) "Bom lửa" đổi thành hũ dầu lửa. Thống nhất mốc 722.
- (07/11, Q1) Duyệt luôn pool §3.3, tên màn §5.1, tên 3 phần thưởng §3.4 (gồm tên nháp "Ý chí dân nghèo"), thưởng + thành tựu §9 → seed trong `009`.
- (07/11, Q2) Thẻ trang chủ giữ khoá tới MHD-L1.
- (07/11, Q3) Tab BXH xuống hàng ở màn rộng hơn điện thoại; điện thoại giữ cuộn ngang.

## File đã sửa / tạo
| File | Việc |
|---|---|
| `frontend/static/assets/question/mai-hac-de-question.json` (mới) | 50 câu chuyển từ Excel (script ở scratchpad, không vào repo) |
| `frontend/static/js/levels/mai-hac-de/*` (mới, 9 file) | Khung chương `MAI_HAC_DE` (id 5, key `mhd`), 3 màn tối giản, asset chương 4 (`PLACEHOLDER`); `questions-data.js` sinh tự động |
| `frontend/templates/gameplay/levels/mai-hac-de.html` (mới) | Template chương, chưa có khe kỹ năng |
| `backend/migrations/009_mai_hac_de.sql` (mới) | Chương 5, level 501–503, 3 phần thưởng, 4 thành tựu, cột `chapter_progress.rescued` |
| `backend/routes/pages.py` | 3 route |
| `backend/routes/api.py` | `VALID_*`, `MAX_RESCUED`, `parse_progress` nhận `rescued` |
| `backend/repositories/progress_repository.py` | Đọc/ghi `rescued` |
| `backend/services/game_service.py` | `CHAPTER_MHD_LEVELS` + 4 luật `MHD_*` |
| `frontend/static/js/engine/progress.js` | `emptyProgress()` thêm `rescued: 0` (ngoại lệ duy nhất ở engine, task card đã ghi) |
| `tools/make_question_data.py` | Mục `mai-hac-de` |
| `frontend/templates/components/home/leaderboard.html`, `frontend/static/css/home/board.css` | Tab `chapter-5` "🏴 MAI HẮC ĐẾ"; tab xuống hàng, điện thoại `nowrap` |
| `frontend/templates/components/home/timeline.html`, `frontend/templates/history.html` | Năm 713 → 722 |
| `frontend/templates/quiz.html`, `frontend/static/js/quiz.js` | Nút "Mai Hắc Đế" + `QUIZ_BANKS` |
| `frontend/static/css/quiz.css` | `.chapter-buttons { flex-wrap: wrap }` — xem dưới |
| `tests/test_time_api.py`, `tests/test_app.py` | Route, save-time, `rescued`, luật `MHD_*`, thưởng; `chapter-6`/`progress/6`/`level-504` là giá trị sai; `levels_total` 15; thêm `009` vào danh sách migration |
| `.claude/rules/mai-hac-de-gameplay.md` (mới), `.claude/rules/{backend,assets-32bit,engine,history-content}.md`, `CLAUDE.md` | Ghi chương mới |
| `docs/SUTA_MHD_TASK_00.md`, `docs/SUTA_MHD_TASK_SKELETON_01.md` | Đánh dấu đã duyệt / đã làm |

Không sửa file nào trong `js/levels/{trung-trac,ba-trieu,ly-nam-de,trieu-quang-phuc}/`.

Thay đổi nhỏ ngoài task card (2):
- **`quiz.css`**: `/quiz` ở điện thoại dọc cắt 2/5 nút chương vì `.preset-buttons` không xuống hàng → thêm `flex-wrap` riêng cho `.chapter-buttons`. Sau sửa 0 nút bị cắt ở 375 px, nút thành 4 hàng.
- **`test_app.py:280`**: `test_progress_roundtrip` so bằng toàn bộ tiến trình nên phải thêm `"rescued": 0`. Task card chỉ ghi cho `test_time_api.py`.

## Kết quả test
| # | Test | Kết quả |
|---|---|---|
| S1 | `pytest tests` | PASS — 137 passed, 1 skipped (`test_app.py` thiếu `SUTA_TEST_DATABASE_URL`) |
| S2 | `parse_progress` | PASS — 5 nhận; 6, −1, `"3"`, `true` → 400; thiếu trường → 0 |
| S3 | Migration | PASS trên **DB dev**: `schema_migrations` có `009`, `scope=all` → `levels_total` 15, `scope=chapter-5` → 3, 4 thành tựu `MHD_*` (103/103 vàng, 20/10 KC). `rescued` chạy SQL thật trong 1 transaction rồi rollback: lưu 4 đọc lại 4, ghi đè 2, CHECK chặn 6; số dòng trước/sau 8/8, users 7/7. **`test_app.py` CHƯA CHẠY** trên DB test, nên 2 test mới ở file này chưa từng chạy |
| S4 | Câu hỏi | PASS — JSON 50/50 khớp Excel (chữ câu hỏi, 4 phương án, đáp án đúng, giải thích), ô số câu 9 ra chuỗi; script tự kiểm pool: 35 + 5 + 5 + 5 = 50, không trùng. Phân bố đáp án Excel A/B/C/D = 12/22/16/0, giao diện tự xáo nên không ảnh hưởng |
| S5 | Màn 1 | PASS — mô phỏng `update(1/60)`: 4 câu không trùng (22, 24, 19, 45); thiếu 2 sách → bị giữ ở x=4497 (đích 4512); đủ 5/5 → "Sang Màn 2". *Sách được nhặt bằng cách đặt người chơi tới chỗ sách, chưa kiểm bằng tay* |
| S6 | Màn 2 | PASS — 3 câu đúng thứ tự pool (2 `maThi` → 42 `thucBao` → 14 `suGia`) → "Sang Màn 3" |
| S7 | Màn 3 | PASS — hết 3 đợt (6 lính) → panel "Hoàn thành chương Mai Hắc Đế"; "Chơi lại chương" xoá tiến trình, về màn 1. *Lính bị hạ bằng script, không đánh thật* |
| S8 | Chặn vào thẳng + khoá tiến trình | PASS — vào `/3` khi chưa qua màn 2 → về màn 1; ghi `suta.mhd.progress`, `suta.{tt,bt,lnd,tqp}.progress` vẫn `null`. `?debug=1` **chưa thử** ở chương này (code engine dùng chung) |
| S9 | API | PASS ở mức test không DB (save-time 501–503, `PUT progress/5`). Tab BXH "MAI HẮC ĐẾ" chọn được, hiện "Chưa có dữ liệu xếp hạng". **Chưa chơi bằng tài khoản thật** |
| S10 | Hồi quy | PASS — 5 URL chương 1–4 trả 200 đúng `main.js`; màn 1 chương 4 nạp thật (5 sách, 8 lính, lỗi duy nhất là 401 khách). `/quiz?chapter=mai-hac-de` chọn sẵn chương 5. `/history` và dòng thời gian: "Năm 722", không còn 713. Chưa nạp thật màn 1 chương 1–3 (chỉ HTTP) |
| S11 | Giao diện | PASS — Màn 1 ở 812×375: không tràn, canvas 523×221. BXH 7 tab: 1024×768 2 hàng, `scroll` = `client` (859), bảng cao 384 px; điện thoại ngang 1 hàng cuộn ngang 872/750; dọc 872/330. `/quiz`: 812×375 1 hàng, 0 nút cắt; 375×812 0 nút cắt sau sửa. Console chỉ có 401 của khách + cảnh báo `maps_tqp.json: stage khác` (asset mượn, vô hại) |

Ghi chú mô phỏng: người chơi được đặt bất tử để kiểm luồng, không kiểm độ khó; đồng hồ màn gần như không chạy trong mô phỏng. Đã xoá cờ thử `suta.cleared.5` trong trình duyệt preview. Mọi lượt thử chạy bằng khách, không ghi dữ liệu người chơi nào vào DB dev. Migration `009` đã áp vào DB dev.

## Vấn đề asset
- Không có (chưa có asset riêng chương 5).

## Câu hỏi cho team / TODO
- Sau report này (07/11): chốt mốc 713 (bỏ thay đổi 713 → 722 ở trên, thẻ chọn tướng cũng thành 713), đổi tên màn 1 thành "Gánh cống Hoan Châu" bằng migration `010`.
- Sau report này (07/11): bộ 50 câu Excel đã được thay bằng bộ mới có nguồn, xem [RESEARCH_MHD_QUESTIONS.md](RESEARCH_MHD_QUESTIONS.md). Kết quả S4 chỉ đúng với bộ cũ.
- Duyệt thoại NPC + cutscene + panel kết chương (MHD-00 §4–5): `dialogue-data.js` để trống.
- 11 nghi vấn lịch sử (MHD-00 mục 7): đang dùng nguyên văn trong game và `/quiz`.
- Nhạc riêng chương (đang mượn nhạc chương 4).
- Chạy `test_app.py` khi có `SUTA_TEST_DATABASE_URL`.

## Bước tiếp
MHD-ENGINE (mang và ném, hazard vồ, đạn nằm lại, gánh nặng, sự kiện phá hazard) và prompt Codex `MHD_ART_01` (`/codex-prompt`).
