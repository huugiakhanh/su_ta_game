# PROMPT NHẠC NỀN — CHƯƠNG 5 MAI HẮC ĐẾ (giao Gemini Pro)

Ngày soạn: 08/11/2026 • Người giao: team Sử Ta (Claude soạn) • Theo khuôn [GEMINI_PROMPT_TQP_MUSIC.md](GEMINI_PROMPT_TQP_MUSIC.md).
**XONG 08/11/2026** — team nộp 3 bản, đã tích hợp (kết quả kiểm ở mục 6).
Chương 5 đang **mượn tạm** 3 bản của chương 4 (`MUSIC_FILES` trong `js/levels/mai-hac-de/audio-data.js`), nên bộ mới phải **nghe khác hẳn chương 2–4**:

| Chương | Không gian âm thanh đã dùng — tránh lặp lại |
|---|---|
| 2 Bà Triệu | rừng núi, voi, **cồng chiêng** |
| 3 Lý Nam Đế | sông Hồng, đồng bằng, công thành; **đàn bầu, đàn tranh rải như sóng nước, kèn bầu** |
| 4 Triệu Việt Vương | **đầm lầy, ban đêm, lau sậy, du kích, rồng vàng**; trống trận trầm, đàn đáy |
| 5 Mai Hắc Đế (bộ này) | **miền Trung nắng gió, dân phu gánh nặng, khí chất dân dã bùng thành khởi nghĩa** — nhịp đòn gánh, sắc thái hò ví xứ Nghệ (chỉ nhạc cụ), ban ngày, khô và sáng |

## 1. Bối cảnh (dán cho Gemini)

Game "Sử Ta" là game pixel art 2D giáo dục lịch sử Việt Nam, chạy trên web. Chương 5 kể về Mai Thúc Loan đầu thế kỷ 8 ở Hoan Châu (Nghệ An ngày nay). Dân phu phải gánh cống phẩm cho nhà Đường dưới đòn roi lính áp giải. Mai Thúc Loan đập vỡ sọt cống phẩm, giải phóng dân phu, cùng người bạn chiến đấu Thúc Bảo dựng căn cứ Sa Nam với thành Vạn An, dựa dãy Hùng Sơn và sông Lam, kết minh với nước Lâm Ấp, rồi tiến đánh và giải phóng thành Tống Bình. Hình ảnh nổi bật: đường cống phẩm nắng gắt, đèo núi khô, trạm gác nhà Đường, đồng Sa Nam, bờ sông Lam, cổng thành vỡ, cờ đen tung bay.

## 2. Yêu cầu kỹ thuật (giữ giống bộ nhạc chương 1–4 để game phát đồng nhất)

| Mục | Yêu cầu |
|---|---|
| Số bản | 3 (mỗi màn 1 bản) |
| Độ dài | 60–65 giây, **lặp liền mạch**: đoạn cuối nối thẳng vào đoạn đầu, **không fade-in, không fade-out**, không khoảng lặng ở đầu/cuối (bộ chương 3–4 đều bị nhỏ dần ở cuối, mỗi vòng hụt 3–4 s) |
| Định dạng | MP3, 44,1 kHz, stereo, 192 kbps (≤ 1,6 MB/bản) |
| Độ lớn | khoảng **−11,5 LUFS** tích hợp, true peak ≤ −1 dBTP |
| Lời | **Không lời**, không giọng hát, không hô, không tiếng nói |
| Tên file | `level1.mp3`, `level2.mp3`, `level3.mp3` |

Không dùng giai điệu có bản quyền hay bài dân ca/quốc ca có sẵn; sáng tác mới. Thang ngũ cung Việt.

## 3. Ba bản nhạc

**`level1.mp3` — Màn 1 "Gánh cống Hoan Châu"**: khởi đầu nặng nề dưới roi lính, đập sọt, phá xe cống, cứu dân phu; qua đèo có đá lăn, hổ vồ, kỵ binh, tới trạm gác. Cảm xúc: nhẫn nhịn dồn nén bật thành phẫn nộ, quyết liệt nhưng dân dã. Ban ngày nắng gắt. ~112–120 BPM. Nhạc cụ: **nhịp đòn gánh** (gỗ tre kẽo kẹt theo phách), **mõ tre, phách**, **đàn nguyệt** gảy khô, **sáo trúc** dẫn giai điệu sắc thái hò xứ Nghệ, trống cơm. Không đàn bầu, không cồng chiêng.

**`level2.mp3` — Màn 2 "Dựng cờ Vạn An"**: đường Hoan Châu, đồng Sa Nam dưới dãy Hùng Sơn, bờ sông Lam; gặp mẹ Mai Thúc Loan, Thúc Bảo, sứ giả Lâm Ấp; có hội thoại, câu hỏi. Cảm xúc: ấm áp, tình làng nghĩa xóm, niềm tin đang lớn dần, tầm nhìn rộng mở. Nhẹ để không át hội thoại. ~84–92 BPM. Nhạc cụ: **đàn nhị** ngân sắc thái ví xứ Nghệ, **sáo trúc** thổi dài, **đàn nguyệt** đệm thưa, trống cơm rất nhẹ, một nét gõ gỗ nhỏ gợi tiếng phương Nam ở đoạn giữa. Không tiếng côn trùng đêm, không đàn tranh rải sóng nước.

**`level3.mp3` — Màn 3 "Công phá Tống Bình"**: trận đánh ban ngày trước cổng thành đổ nát; xe bắn tiễn nhả tên, vệ sĩ khiên sắt, hũ dầu lửa; xe húc thẳng, dân quân ùa ra chặn; cuối cùng đấu đại đao với đô hộ Quang Sở Khách. Cảm xúc: khí thế nhân dân tràn lên, dồn dập, hào sảng và chiến thắng, sáng hơn trận đêm chương 4. ~140–148 BPM. Nhạc cụ: **trống chiến nhiều lớp theo nhịp xe gỗ lăn**, **tù và** gọi quân, **đàn nguyệt** riff nhanh, **sáo trúc** rít ở cao trào, lớp chiptune nhịp nền; một câu "cờ đen" ngắn, kiêu hùng lặp lại làm điểm nhấn. Không kèn bầu, không cồng chiêng.

## 4. Câu lệnh cho Gemini Pro (mỗi bản một lần, dán nguyên khối)

`level1.mp3`:

> Create an instrumental loop for a 2D pixel-art educational game about Mai Thúc Loan, early 8th-century Vietnam. Level 1 "Carrying the Tribute of Hoan Châu": exhausted porters haul tribute along a sun-baked road under soldiers' whips, then smash the baskets, wreck the tribute carts and free the people, crossing a dry mountain pass with rolling boulders, a tiger and cavalry to reach an enemy checkpoint. Mood: suppressed endurance bursting into anger, determined and earthy, harsh daylight. Tempo about 112–120 BPM. Instruments: creaking wooden carrying-pole rhythm on the beat, bamboo woodblock (mõ) and clappers, dry plucked đàn nguyệt (moon lute), bamboo flute leading with the phrasing of central Vietnamese Nghệ work calls, trống cơm hand drum, a thin chiptune layer. No đàn bầu, no gongs. No vocals, no chanting, no speech. Seamless loop: the last bar must lead directly into the first bar, no fade-in or fade-out, no silence at either end, full level until the final sample. Length 60–65 seconds. Original melody in a Vietnamese pentatonic scale, no existing folk songs or copyrighted tunes. MP3, 44.1 kHz stereo, 192 kbps, about −11.5 LUFS integrated, true peak ≤ −1 dBTP.

`level2.mp3`:

> Create an instrumental loop for a 2D pixel-art educational game about Mai Thúc Loan, early 8th-century Vietnam. Level 2 "Raising the Banner at Vạn An": a walk across the Sa Nam plain below the Hùng Sơn mountains and along the Lam River, meeting the hero's mother, his comrade Thúc Bảo and an envoy from the southern kingdom of Lâm Ấp, with dialogue and quiz screens. Mood: warm, neighbourly, trust and hope slowly growing, a widening horizon; softer than the other levels so dialogue stays clear. Tempo about 84–92 BPM. Instruments: singing đàn nhị (two-string fiddle) with the phrasing of Nghệ folk ví melodies, long-breathed bamboo flute, sparse đàn nguyệt accompaniment, very light trống cơm hand drum, a small wooden percussion figure in the middle section hinting at a southern land, warm bass. No night insects, no zither water arpeggios, no gongs. No vocals, no chanting, no speech. Seamless loop: the last bar must lead directly into the first bar, no fade-in or fade-out, no silence at either end, full level until the final sample. Length 60–65 seconds. Original melody in a Vietnamese pentatonic scale, no existing folk songs or copyrighted tunes. MP3, 44.1 kHz stereo, 192 kbps, about −11.5 LUFS integrated, true peak ≤ −1 dBTP.

`level3.mp3`:

> Create an instrumental loop for a 2D pixel-art educational game about Mai Thúc Loan, early 8th-century Vietnam. Level 3 "Storming Tống Bình": a daylight boss battle before a shattered citadel gate. A great arrow cart looses volleys and rams forward, iron-shielded guards hold the line, oil jars burst into flame, militia pour in to block the cart, and the hero finally duels the Tang governor and his great glaive. Mood: a people's army surging forward, driving, heroic and triumphant, brighter than a night ambush. Tempo about 140–148 BPM. Instruments: layered battle drums with a rolling wooden-cart rhythm, buffalo-horn calls, fast đàn nguyệt riffs, shrill bamboo flute at the climax, a chiptune rhythm bed; one short proud "black banner" motif recurring as the hook. No kèn bầu, no gongs. No vocals, no chanting, no speech. Seamless loop: the last bar must lead directly into the first bar, no fade-in or fade-out, no silence at either end, full level until the final sample. Length 60–65 seconds. Original melody in a Vietnamese pentatonic scale, no existing folk songs or copyrighted tunes. MP3, 44.1 kHz stereo, 192 kbps, about −11.5 LUFS integrated, true peak ≤ −1 dBTP.

## 5. Giao nộp và tích hợp

- Nộp 3 file vào `frontend/static/assets/audio/mai-hac-de/` (thư mục mới), đúng tên ở mục 2.
- Claude kiểm: độ dài, định dạng, độ lớn + true peak (ffmpeg `ebur128`), chỗ nối lặp, khoảng lặng đầu/cuối, không lời; rồi đổi `MUSIC_FILES` trong `js/levels/mai-hac-de/audio-data.js` sang `audio/mai-hac-de/` và bỏ ghi chú `TODO_MISSING`.
- Xong việc: chuyển file prompt này vào `docs/archive/`.

## 6. Kết quả kiểm (08/11/2026)

| File | Độ dài | Định dạng | Độ lớn | True peak | Lặng đầu / cuối | Đoạn lặp engine (−45 dB) |
|---|---|---|---|---|---|---|
| `level1.mp3` | 64,7 s | mp3 44,1 kHz stereo 192 kbps, 1,56 MB | −12,0 LUFS | +0,2 dBFS | 0,85 / 2,42 s | 0,85–62,31 s (61,5 s) |
| `level2.mp3` | 64,2 s | như trên, 1,55 MB | −11,2 LUFS | +0,3 dBFS | 0,13 / 2,16 s | 0,13–62,05 s (61,9 s) |
| `level3.mp3` | 66,8 s | như trên, 1,61 MB | −12,0 LUFS | 0,0 dBFS | 0,00 / 2,75 s | 0,07–64,10 s (64,0 s) |

- Khoảng lặng đầu/cuối: engine tự cắt (`audio.js loopPoints`). Chỗ nối không tách tiếng (bước nhảy mẫu 0,000–0,008 so với p99 0,10–0,11).
- `level3` đạt: đầu/cuối đoạn lặp đủ lớn (cuối −3,4 dB so nền).
- **Chưa đạt "không fade"**, độ lớn so với nền bài:
  - `level1`: nhỏ dần ~2,5 s cuối (−9 → −37 dB); đoạn mở đầu thưa, nhiều quãng ngắt (−12…−52 dB trong ~4 s đầu).
  - `level2`: nhỏ dần ~1,5 s cuối (−7 → −35 dB).
  - Cùng loại lỗi bộ nhạc chương 3–4, tích hợp ngay vì tốt hơn nhạc mượn. Cần thì team tạo lại `level1`/`level2` (chép đè cùng tên, không phải sửa code).
- True peak cả 3 bản vượt −1 dBTP, cùng mức chương 2–4 đã chấp nhận.
- Đo bằng ffmpeg và phân tích mức âm; không nghe được nên chưa xác nhận "không lời" và cảm xúc bài, người dùng nghe khi chơi.
