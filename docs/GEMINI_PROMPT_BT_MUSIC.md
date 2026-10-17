# PROMPT NHẠC NỀN — CHƯƠNG 2 BÀ TRIỆU (giao Gemini Pro)

Ngày soạn: 17/10/2026 • Người giao: team Sử Ta (Claude soạn) • Người dùng chốt giao Gemini Pro (17/10).
Mẫu tham chiếu: 3 bản nhạc chương Trưng Trắc trong `frontend/static/assets/audio/trung-trac/` (team tạo bằng Gemini, 01/10).

## 1. Bối cảnh (dán cho Gemini)

Game "Sử Ta" là game pixel art 2D giáo dục lịch sử Việt Nam, chạy trên web. Chương 2 kể khởi nghĩa Bà Triệu năm 248: nghĩa quân
từ rừng núi Nưa (Thanh Hoá) chống quan lại nhà Ngô, lập căn cứ Bồ Điền, đánh trận quyết định với tướng Lục Dận. Hình ảnh nổi bật:
áo vàng, voi trắng một ngà, tiếng cồng chiêng thuần phục voi.

## 2. Yêu cầu kỹ thuật (giữ giống bộ nhạc chương 1 để game phát đồng nhất)

| Mục | Yêu cầu | Chương 1 đo được |
|---|---|---|
| Số bản | 3 (mỗi màn 1 bản) | 3 |
| Độ dài | 60–65 giây, **lặp liền mạch** (đoạn cuối nối thẳng vào đoạn đầu, không fade-out, không khoảng lặng ở đầu/cuối) | 61,0 / 62,7 / 62,8 s |
| Định dạng | MP3, 44,1 kHz, stereo, 192 kbps (≤ 1,6 MB/bản) | 44,1 kHz stereo 192 kbps, 1,47–1,51 MB |
| Độ lớn | khoảng **−11,5 LUFS** tích hợp, true peak ≤ −1 dBTP | −11,5 / −11,5 / −11,7 LUFS |
| Lời | **Không lời**, không giọng hát, không tiếng nói | — |
| Tên file | `level1.mp3`, `level2.mp3`, `level3.mp3` | cùng tên |

Không dùng giai điệu có bản quyền hay bài dân ca/quốc ca có sẵn; sáng tác mới.

## 3. Ba bản nhạc

**`level1.mp3` — Màn 1 "Rừng núi Nưa"** (vượt chướng ngại, hành quân qua rừng nứa, rừng thiêng, sườn núi đá, tới doanh trại)
- Cảm xúc: phiêu lưu, khẩn trương nhưng sáng, tinh thần nổi dậy.
- Nhịp ~126–132 BPM. Gợi ý nhạc cụ: sáo trúc dẫn giai điệu, đàn tranh/đàn nguyệt rải, trống da nhịp hành quân, lớp synth/chiptune nhẹ
  cho hợp game pixel. Thang ngũ cung Việt.

**`level2.mp3` — Màn 2 "Chiêu mộ hiền tài"** (gặp anh trai Triệu Quốc Đạt, ba anh em họ Lý, thu phục voi trắng; có hội thoại, câu hỏi)
- Cảm xúc: ấm áp, trang trọng, hy vọng; nhẹ hơn hai bản kia để không át hội thoại (game tự giảm âm khi mở hội thoại).
- Nhịp ~88–96 BPM. Gợi ý: đàn bầu hoặc sáo trúc chậm, **cồng chiêng** điểm nhịp (gợi cảnh thuần phục voi), bass ấm.

**`level3.mp3` — Màn 3 "Chiến lũy Bồ Điền"** (đánh boss Lục Dận 3 giai đoạn, đầm lầy, tên độc, kỵ binh; voi trắng xung trận)
- Cảm xúc: dồn dập, hào hùng, căng thẳng trận chiến.
- Nhịp ~140–150 BPM. Gợi ý: trống trận nhiều lớp, cồng chiêng mạnh, kèn/tù và, dây gảy nhanh; lớp chiptune làm nền nhịp.

## 4. Câu lệnh mẫu cho Gemini Pro (mỗi bản một lần)

> Create a 62-second instrumental loop for a 2D pixel-art educational game about the Vietnamese heroine Lady Triệu (year 248).
> [MÔ TẢ TỪNG BẢN Ở MỤC 3, dịch sang tiếng Anh]. No vocals. Seamless loop: the last bar must lead directly into the first bar,
> no fade-in/out, no silence. Export MP3 44.1 kHz stereo 192 kbps, about −11.5 LUFS integrated, true peak ≤ −1 dBTP.

## 5. Giao nộp và tích hợp

- Nộp 3 file vào `frontend/static/assets/audio/ba-trieu/` (thư mục mới), đúng tên ở mục 2.
- Claude kiểm: độ dài, định dạng, độ lớn (ebur128), chỗ nối lặp (nghe 2 vòng liền), không lời; rồi đổi `MUSIC_FILES` trong
  `frontend/static/js/levels/ba-trieu/audio-data.js` từ `audio/trung-trac/` sang `audio/ba-trieu/`.
- Xong việc: chuyển file prompt này vào `docs/archive/`.
