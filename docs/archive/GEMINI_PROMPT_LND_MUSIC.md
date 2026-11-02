# PROMPT NHẠC NỀN — CHƯƠNG 3 LÝ NAM ĐẾ (giao Gemini Pro)

Ngày soạn: 02/11/2026 • Người giao: team Sử Ta (Claude soạn) • Theo khuôn [GEMINI_PROMPT_BT_MUSIC.md](../GEMINI_PROMPT_BT_MUSIC.md).
**XONG 02/11/2026** — team nộp 3 bản, đã tích hợp (kết quả kiểm ở mục 6).
Mẫu tham chiếu: 3 bản nhạc chương Bà Triệu trong `frontend/static/assets/audio/ba-trieu/`. Chương này đang **mượn tạm** đúng 3 bản đó,
nên bộ mới phải **nghe khác hẳn chương 2** (chương 2: rừng núi, voi, cồng chiêng; chương 3: sông nước, đồng bằng, công thành).

## 1. Bối cảnh (dán cho Gemini)

Game "Sử Ta" là game pixel art 2D giáo dục lịch sử Việt Nam, chạy trên web. Chương 3 kể về Lý Bí (sau là Lý Nam Đế) đầu thế kỷ 6:
từ quan vì bất bình thứ sử Tiêu Tư nhà Lương tàn bạo, tham nhũng; chiêu binh, tập hợp hào kiệt các vùng; đánh chiếm thành Long Biên,
đuổi Tiêu Tư về Quảng Châu. Kết chương: mùa xuân năm 544 Lý Bí lên ngôi, đặt quốc hiệu Vạn Xuân. Hình ảnh nổi bật: sông Hồng, đồng
bằng Giao Châu, vùng sông nước Chu Diên, tường thành đất Long Biên, lá cờ đỏ cắm trên thành.

## 2. Yêu cầu kỹ thuật (giữ giống bộ nhạc chương 1–2 để game phát đồng nhất)

| Mục | Yêu cầu | Chương 2 đo được (02/11/2026) |
|---|---|---|
| Số bản | 3 (mỗi màn 1 bản) | 3 |
| Độ dài | 60–65 giây, **lặp liền mạch** (đoạn cuối nối thẳng vào đoạn đầu, không fade-out, không khoảng lặng ở đầu/cuối) | 63,2 / 64,1 / 66,6 s |
| Định dạng | MP3, 44,1 kHz, stereo, 192 kbps (≤ 1,6 MB/bản) | 44,1 kHz stereo 192 kbps, 1,52–1,60 MB |
| Độ lớn | khoảng **−11,5 LUFS** tích hợp, true peak ≤ −1 dBTP | −11,1 / −11,5 / −12,6 LUFS; peak −0,1 / +0,1 / +0,5 dBFS (vượt — bộ mới cần giữ ≤ −1) |
| Lời | **Không lời**, không giọng hát, không tiếng nói | — |
| Tên file | `level1.mp3`, `level2.mp3`, `level3.mp3` | cùng tên |

Không dùng giai điệu có bản quyền hay bài dân ca/quốc ca có sẵn; sáng tác mới. Thang ngũ cung Việt.

## 3. Ba bản nhạc

**`level1.mp3` — Màn 1 "Từ quan chiêu binh"** (Lý Bí dẫn đường qua đồi trung du, làng quê, bờ sông Hồng có thuyền chiến, trạm kiểm
soát nhà Lương, tới doanh trại nghĩa quân giữa đồng bằng)
- Cảm xúc: lên đường, quyết tâm, hơi bí mật lúc vượt trạm kiểm soát; sáng và có đà tiến.
- Nhịp ~120–126 BPM. Gợi ý nhạc cụ: **đàn bầu** hoặc sáo trúc dẫn giai điệu, đàn nguyệt gảy nhịp đều như bước chân, trống cơm/trống
  da nhịp hành quân nhẹ, mõ điểm phách; lớp synth/chiptune mỏng hợp game pixel. Không cồng chiêng (để khác chương 2).

**`level2.mp3` — Màn 2 "Chiêu mộ hiền tài"** (giải cứu và thuyết phục lão tướng Phạm Tu, mưu sĩ Tinh Thiều, hào trưởng Triệu Túc;
cảnh sông nước Chu Diên; có hội thoại, câu hỏi)
- Cảm xúc: trân trọng, tin cậy, hy vọng đoàn kết; nhẹ hơn hai bản kia để không át hội thoại (game tự giảm âm khi mở hội thoại).
- Nhịp ~84–92 BPM. Gợi ý: **đàn tranh** rải như sóng nước, sáo trúc chậm, đàn nhị ngân dài, tiếng nước/mái chèo rất nhẹ làm nền
  (không lấn nhạc), bass ấm.

**`level3.mp3` — Màn 3 "Công phá thành Long Biên"** (đánh boss Tiêu Tư 3 giai đoạn dưới chân thành: máy bắn đá, cận vệ khiên sắt,
xe hoả công, sóng Triều Cường; kết thúc cắm cờ trên thành)
- Cảm xúc: công thành dồn dập, hào hùng, căng thẳng; có cảm giác đoàn quân tràn lên.
- Nhịp ~140–148 BPM. Gợi ý: trống trận nhiều lớp, **tù và** gọi quân, kèn bầu, dây gảy nhanh, phách tre; lớp chiptune làm nền nhịp.
  Một câu nhạc "hô xung trận" lặp lại làm điểm nhấn.

## 4. Câu lệnh cho Gemini Pro (mỗi bản một lần)

Chung cho cả 3 (dán sau mô tả từng bản):

> No vocals, no speech. Seamless loop: the last bar must lead directly into the first bar, no fade-in/out, no silence at either end.
> Length 60–65 seconds. Original melody in a Vietnamese pentatonic scale (no existing folk songs or copyrighted tunes). Export MP3
> 44.1 kHz stereo 192 kbps, about −11.5 LUFS integrated, true peak ≤ −1 dBTP.

`level1.mp3`:

> Create an instrumental loop for a 2D pixel-art educational game about Lý Bí (Lý Nam Đế), early 6th-century Vietnam. Level 1
> "Leaving office to raise an army": the hero travels through midland hills, a village, the banks of the Red River with enemy war
> boats, and a Liang dynasty checkpoint, toward a rebel camp on the plains. Mood: setting out, determined, slightly stealthy, bright
> forward momentum. Tempo about 120–126 BPM. Instruments: đàn bầu (Vietnamese monochord) or bamboo flute leading the melody, đàn
> nguyệt (moon lute) plucking steady footsteps, light hand drums for a marching pulse, wooden block accents, a thin chiptune layer.
> No gongs.

`level2.mp3`:

> Create an instrumental loop for a 2D pixel-art educational game about Lý Bí (Lý Nam Đế), early 6th-century Vietnam. Level 2
> "Recruiting talented allies": the hero rescues and wins over a veteran general, a scholar-strategist and a local chief in a land
> of rivers and marshes; the level has dialogue and quiz screens. Mood: respectful, trusting, hopeful unity; softer than the other
> levels so dialogue stays clear. Tempo about 84–92 BPM. Instruments: đàn tranh (zither) arpeggios like flowing water, slow bamboo
> flute, sustained đàn nhị (two-string fiddle), very subtle water/oar ambience under the music, warm bass.

`level3.mp3`:

> Create an instrumental loop for a 2D pixel-art educational game about Lý Bí (Lý Nam Đế), early 6th-century Vietnam. Level 3
> "Storming Long Biên citadel": a boss battle at the foot of an earthen city wall against the Liang governor — catapult boulders,
> iron-shield guards, burning fire carts, a great tidal wave; it ends with the rebel flag planted on the wall. Mood: relentless siege,
> heroic, tense, an army surging forward. Tempo about 140–148 BPM. Instruments: layered war drums, buffalo-horn calls, kèn bầu
> (oboe-like horn), fast plucked strings, bamboo clappers, a chiptune rhythm bed; one recurring "charge" motif as the hook.

## 5. Giao nộp và tích hợp

- Nộp 3 file vào `frontend/static/assets/audio/ly-nam-de/` (thư mục mới), đúng tên ở mục 2.
- Claude kiểm: độ dài, định dạng, độ lớn + true peak (ffmpeg `ebur128`), chỗ nối lặp (nghe 2 vòng liền), không lời; rồi đổi
  `MUSIC_FILES` trong `frontend/static/js/levels/ly-nam-de/audio-data.js` từ `audio/ba-trieu/` sang `audio/ly-nam-de/` và bỏ ghi chú
  `TODO_MISSING`.
- Xong việc: chuyển file prompt này vào `docs/archive/`.

## 6. Kết quả kiểm (02/11/2026)

| File | Độ dài | Định dạng | Độ lớn | True peak | Lặng đầu / cuối | Nhỏ dần giây cuối (so nền −14 dB) |
|---|---|---|---|---|---|---|
| `level1.mp3` | 62,6 s | mp3 44,1 kHz stereo 192 kbps, 1,51 MB | −10,7 LUFS | +0,2 dBFS | 0,05 / 2,05 s | −45 dB |
| `level2.mp3` | 61,5 s | như trên, 1,48 MB | −11,4 LUFS | +0,1 dBFS | 0,10 / 2,21 s | −42 dB |
| `level3.mp3` | 62,6 s | như trên, 1,51 MB | −11,1 LUFS | +0,2 dBFS | 0,05 / 2,57 s | −32 dB |

- Khoảng lặng cuối: engine tự cắt khi tính điểm lặp (`audio.js loopPoints`, ngưỡng −45 dB) — vòng lặp thật 59,2–60,5 s. Chỗ nối không tách tiếng (bước nhảy mẫu 0,004–0,010 so với p99 0,08–0,13).
- Chưa đạt 2 mục: true peak vượt −1 dBTP và giây cuối nhỏ dần (hụt nhẹ mỗi vòng lặp) — **cùng mức bộ nhạc chương 2 đang dùng** (peak −0,1…+0,5; giây cuối −40 / −42 / −32 dB), nên chấp nhận như chương 2. Chưa nghe bằng tai trong phiên này — người dùng nghe thử khi chơi.
