# Task card TT-AUDIO-01 — Nhạc nền + hiệu ứng âm thanh (chương Trưng Trắc)

## Mục tiêu
Thêm nhạc nền và hiệu ứng âm thanh cho cả 3 màn Trưng Trắc. Người dùng chốt ngày 30/09:
- Âm thanh **tổng hợp bằng code** (Web Audio API, chiptune 8-bit), không dùng file âm thanh.
- **Mỗi màn 1 bản nhạc nền** (M1 vượt ải, M2 chiêu mộ – nhẹ hơn, M3 boss – dồn dập), thêm đoạn ngắn khi thắng/thua.
- SFX đủ 4 nhóm: nhân vật, địch & boss, vật phẩm & câu hỏi, UI & kỹ năng.
- Nút loa trên HUD + phím **M** để bật/tắt, lựa chọn lưu `localStorage`.

## Phạm vi (owned files)
- Tạo: `frontend/static/js/levels/trung-trac/audio.js`, `audio-data.js`.
- Sửa: `physics.js`, `dialogue.js`, `main.js`, `input.js`, `ui.js`, `trung-trac.html`, `trung-trac.css`, `CLAUDE.md`.
- Không đổi logic gameplay, không đổi ID asset, không đụng nội dung lịch sử.

## Acceptance / test case
| # | Test case |
|---|---|
| T1 | Bấm Bắt đầu → AudioContext `running`, nhạc đúng màn (`level1`/`level2`/`level3`). |
| T2 | Nhảy/tiếp đất/lướt/chém/trúng đòn/rơi hố/chết đều có tiếng. |
| T3 | Màn 1: nhặt sách, bẫy chông bật, tù và báo động, lính ném, hạ kiệu quan, nghỉ chân hồi máu có tiếng. |
| T4 | Câu hỏi/NPC: mở câu hỏi, trả lời đúng/sai, thoại, phần thưởng có tiếng; nhạc nhỏ lại khi mở hội thoại. |
| T5 | Màn 3: chiến xa báo trước/lao, cột nứt, khiên nứt/vỡ, hũ dầu/lửa, mưa tên trên thành, đợt quân, K/L, kỹ năng sẵn sàng, hạ Tô Định, cổng mở. |
| T6 | Thắng → nhạc `win`; thua → tiếng chết + nhạc `lose`; cả hai phát 1 lần rồi dừng. Cutscene màn 3 không có nhạc trận. |
| T7 | Phím M / nút loa bật-tắt; tải lại trang vẫn giữ; `localStorage` bị chặn vẫn chơi được. |
| T8 | Ẩn tab / máy cảm ứng cầm dọc → âm thanh dừng; hiện lại → phát tiếp. |
| T9 | Console không lỗi; `pytest` không vỡ. |
