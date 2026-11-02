# REPORT — LND-L3: Màn 3 "Công phá thành Long Biên" (boss Tiêu Tư + kỹ năng + cutscene)

Ngày: 02/11/2026 • Task card: [SUTA_LND_TASK_L3_01.md](SUTA_LND_TASK_L3_01.md) (duyệt 02/11, Q1–Q6 theo đề xuất)
Trạng thái: **XONG** — người dùng chơi tay OK 02/11/2026; asset `IN_GAME`.

## File đã sửa

| Loại | File |
|---|---|
| Asset (chép từ nguồn Codex) | 8 sprite mới `LND_ART_03` + strip `plant_flag` của `NPC_LY_BI` + `BG_LND_MID_LONG_BIEN` + `PROP_LND_VAN_XUAN_FLAG`; `manifest_lnd.json`, `maps_lnd.json` chép nguyên bản nguồn (35 / 9 mục) |
| Tạo | `js/levels/ly-nam-de/boss.js`, `skills.js`, `render-extras.js` |
| Sửa | `js/levels/ly-nam-de/{config,level3,chapter,dialogue-data,audio-data}.js` |
| Sửa (**ngoài danh sách task card**) | `templates/gameplay/levels/ly-nam-de.html`: thêm ô kỹ năng HUD, nút cảm ứng KHIÊN/SÓNG, dòng trợ giúp K/L. Bắt buộc cho T6 (task card bỏ sót). Theo đúng mẫu `ba-trieu.html` |
| Tài liệu | `docs/SUTA_LND_TASK_00.md` (link lộ trình), `.claude/rules/ly-nam-de-gameplay.md` |

Không sửa engine, không sửa file chương 1–2. Bỏ mượn `BG_BT_MID_CAMP` (không còn dùng).

## Asset LND_ART_03 (soát Gate C1/C2 — tóm tắt từ prompt đã xoá)

- C1: cận vệ khiên lần 1 `NEED_REDRAW` (tay cầm giáo sau lưng đọc thành 3 tay + bước "khoá đầu" dán khung chữ nhật làm thủng 187–958 px đục/ô ở cả Tiêu Tư); bản sửa PASS (0 px mất, 1 tay liền vai→bàn tay, giáo 41 logic). Nền Long Biên PASS (nối lặp 10,1 < 17,9 bên trong, mặt thành hàng 256).
- C2: xe hoả công `douse` (càng xe chỉ ở douse) + `death` (không nối từ stalled, xe không vỡ) `NEED_REDRAW`; bản sửa PASS (douse ô 6 = stalled ô 1, death ô 1 = stalled ô 4, ô cuối 11,25 logic). Chân dung, máy bắn đá, `plant_flag`, cờ, 3 asset chép từ chương 2 (trùng SHA256) PASS.
- Câu hỏi team còn mở (Codex hỏi): quan bào + mũ Tiêu Tư, hình khiên sắt, vật liệu thành Long Biên 542, màu cờ Vạn Xuân (đang dùng đỏ tươi viền vàng), cấu tạo máy bắn đá/xe dầu.

## Kiểm chứng

| # | Kết quả | Số đo |
|---|---|---|
| T1 | PASS | Nền thành Long Biên; Tiêu Tư (x 660) + máy bắn đá (x 540) đứng trên mặt thành y 152. Console không có lỗi/cảnh báo ở màn 1, 2, 3 |
| T2 | PASS | Đá: vạch báo tại x người chơi, bay 1,1 s, trúng −1 máu (5→4). Cận vệ: chém phía trước máu giữ 3, có tóe lửa + gợi ý; chém sau lưng 3→2; quay lại sau 0,70 s; đâm thương trúng ở 0,17 s (hit_frame 4 @18). 3 lượt → GĐ 2 |
| T3 | PASS | Xe cháy: chém bị chặn (máu 3→3), chạm thân −1 máu. Triều Cường: burn → douse → stalled; 3 đòn → xác nằm lại. 2 xe → GĐ 3, ô HUD 2 nấc (nấc 3 ẩn) |
| T4 | PASS | Tiêu Tư rơi 0,47 s, chạm đất ở y 212 (= 248 − 36), 10 máu. Ném vàng → choáng 1,20 s; chém kiếm trúng ở 0,22 s; 3 đòn → chạy sang đầu kia (649 → 83, 4,1 s) |
| T5 | PASS | beaten → bribe → câu 1 → flee → tối → Lý Bí trên thành `plant_flag` → cờ ở đầu cán → câu 2 → panel kết chương. Chữ 2 câu khớp LND-00 §5.3 (so bằng script). Tiến trình ghi `level3Complete`. Thành tựu `LND_CHAPTER` cần tài khoản + DB, **chưa kiểm** |
| T6 | PASS | Khiên Tô Lịch: chặn 3 đòn (máu giữ 5) → `break` → hồi chiêu 12 s, đòn sau mất máu. Triều Cường: quét 1,5 s, hồi chiêu 14 s, xuyên khiên cận vệ −1. Ô HUD + nút cảm ứng có icon (giả lập 740×360) |
| T7 | PASS | 4000 lần thử: không buff 15,7 %, có buff 39,9 %; boss/bao cát không rơi. `?layout=engine` màn 1 vẫn luôn rơi |
| T8 | PASS | `?layout=skills`: bao cát + cận vệ + xe hoả công ra lặp |
| T9 | PASS | `pytest tests`: 108 passed, 1 skipped. Màn 1 (`?layout=engine`), màn 2 chạy, console sạch. Không đụng chương 2 nên không chơi lại |
| T10 | PASS | Người dùng chơi tay hết màn (điểm 23100, 02:06). Báo lỗi cờ tách khỏi cán → sửa neo (mục dưới), duyệt lại OK |

## Sửa trong lúc kiểm

- Cutscene: Tiêu Tư quỳ hối lộ ở sát mép trái (sau lần chạy hoảng loạn) nên gần như ngoài khung hình → camera neo Tiêu Tư ở bước beaten/bribe/flee.
- Cảnh bỏ chạy dài 6,1 s → `fleeSpeed` 120 → 180 và tối dần khi còn cách mép phải 140 px: tối đa 3,2 s.
- Lúc "Đang tải bản đồ…", máy bắn đá vẽ lơ lửng giữa trời vì nền chưa tải → chỉ vẽ lớp trên thành khi `images.loaded`.
- (Người dùng chơi thử) Cờ Vạn Xuân nằm trên đầu cán, tách khỏi cán: vải chỉ ở 12,5 hàng dưới của ô 32, pivot bottom-left đặt ở đầu cán → hạ neo 12,5 (`LND_CUTSCENE.flag.lift` 42,5 → 30), vải buông dọc cán. Không sửa ảnh.

## Còn lại

- Đã làm sau T10: status `IN_GAME` cho 13 sprite (`LND_ART_03` + FX khiên/sóng + 3 icon) + 2 map (bản nguồn rồi chép bản chạy, chỉ đổi `status`); xoá `CODEX_PROMPT_LND_ART_02.md`, `CODEX_PROMPT_LND_ART_03.md`; task card + report vào `archive/`.
- Q2 (parallax): người dùng chơi thử không báo vấn đề — giữ nguyên.
- Màu cờ Vạn Xuân và 4 câu hỏi lịch sử của Codex vẫn chờ team.
- Nhạc riêng chương: vẫn mượn nhạc chương 2 (TODO_MISSING).
