# PROMPT NHẠC NỀN — CHƯƠNG 6 PHÙNG HƯNG (giao Gemini Pro)

Ngày soạn: 09/11/2026 • Người giao: team Sử Ta (Claude soạn) • Theo khuôn [GEMINI_PROMPT_MHD_MUSIC.md](GEMINI_PROMPT_MHD_MUSIC.md).
**XONG 09/11/2026** — team nộp 3 bản, đã tích hợp (kết quả kiểm ở mục 6).
Chương 6 đang **mượn tạm** 3 bản của chương 5 (`MUSIC_FILES` trong `js/levels/phung-hung/audio-data.js`), nên bộ mới phải **nghe khác hẳn chương 2–5**:

| Chương | Không gian âm thanh đã dùng — tránh lặp lại |
|---|---|
| 2 Bà Triệu | rừng núi, voi, **cồng chiêng** |
| 3 Lý Nam Đế | sông Hồng, đồng bằng, công thành; **đàn bầu, đàn tranh rải như sóng nước, kèn bầu** |
| 4 Triệu Việt Vương | **đầm lầy, ban đêm, lau sậy, du kích, rồng vàng**; trống trận trầm, đàn đáy |
| 5 Mai Hắc Đế | **miền Trung nắng gió, dân phu**, nhịp đòn gánh, sắc thái hò ví xứ Nghệ, đàn nguyệt, ban ngày |
| 6 Phùng Hưng (bộ này) | **làng đá ong xứ Đoài, sức vóc trai tráng**, nhịp bước chắc nặng, **đêm vây thành bằng lửa và trống đồng** |

## 1. Bối cảnh (dán cho Gemini)

Game "Sử Ta" là game pixel art 2D giáo dục lịch sử Việt Nam, chạy trên web. Chương 6 kể về Phùng Hưng, người Đường Lâm, nửa cuối thế kỷ 8. Quan đô hộ nhà Đường Cao Chính Bình thu thuế nặng, dân làng khốn khổ. Anh em họ Phùng nổi tiếng sức khoẻ, tương truyền vật trâu, đánh hổ. Ông tụ nghĩa ở Đường Lâm, theo kế của Đỗ Anh Hàn đem quân vây phủ đô hộ Tống Bình. Tương truyền đêm ấy lửa cháy khắp bốn phía thành, trống vang trời, khiến Cao Chính Bình lo sợ phát bệnh mà chết. Hình ảnh nổi bật: làng đá ong, đồi đất đỏ, trâu mộng, hổ dữ, xe thuế muối, đuốc, trụ gác cháy, trống đồng, cổng thành mở giữa tiếng hò reo.

## 2. Yêu cầu kỹ thuật (giữ giống bộ nhạc các chương trước để game phát đồng nhất)

| Mục | Yêu cầu |
|---|---|
| Số bản | 3 (mỗi màn 1 bản) |
| Độ dài | 60–65 giây, **lặp liền mạch**: đoạn cuối nối thẳng vào đoạn đầu, **không fade-in, không fade-out**, không khoảng lặng ở đầu/cuối (bộ chương 3–5 vẫn bị nhỏ dần ở cuối, mỗi vòng hụt 2–4 s) |
| Định dạng | MP3, 44,1 kHz, stereo, 192 kbps (≤ 1,6 MB/bản) |
| Độ lớn | khoảng **−11,5 LUFS** tích hợp, true peak ≤ −1 dBTP |
| Lời | **Không lời**, không giọng hát, không hô, không tiếng nói |
| Tên file | `level1.mp3`, `level2.mp3`, `level3.mp3` |

Không dùng giai điệu có bản quyền hay bài dân ca/quốc ca có sẵn; sáng tác mới. Thang ngũ cung Việt.

## 3. Ba bản nhạc

**`level1.mp3` — Màn 1 "Trai tráng Đường Lâm"**: làng đá ong, đồi đất đỏ, ải thu thuế; đánh hổ, thu phục trâu mộng, đẩy xe muối húc lính gác. Cảm xúc: khoẻ khoắn, chắc nịch, bộc trực, sức trẻ thôn quê nổi giận vì thuế nặng. Ban ngày. ~104–112 BPM, nhịp bước nặng. Nhạc cụ: **trống cái gõ chắc theo nhịp bước**, **sênh tre**, **đàn tứ** gảy đanh, **sáo trúc** câu ngắn, dứt khoát, lớp chiptune mỏng. Không đòn gánh, không đàn nguyệt, không cồng chiêng.

**`level2.mp3` — Màn 2 "Tụ nghĩa chiêu hiền"**: đường làng, đường tiếp tế, ngoại thành Tống Bình; gặp Phùng Hải, Đỗ Anh Hàn, Bồ Phá Cần; có hội thoại, câu hỏi. Cảm xúc: nghĩa khí tụ hội, bàn mưu tính kế, trầm tĩnh mà tin tưởng. Nhẹ để không át hội thoại. ~80–88 BPM. Nhạc cụ: **đàn tứ** thưa, **đàn nhị** ngân ấm nhưng trầm hơn chương 5, **sáo dọc** thổi dài, trống da gõ rất nhẹ, một nét nhịp nhỏ gợi bước chân người tụ về ở đoạn giữa. Không tiếng côn trùng đêm, không đàn tranh rải sóng nước.

**`level3.mp3` — Màn 3 "Vây phủ Tống Bình"**: trận ban đêm trước lầu cổng phủ đô hộ; đốt 4 trụ gác, rồi đấm luân phiên 2 trống đồng hai bên, thanh Nỗi sợ hãi dâng dần; né đá rơi, nước sôi, tên bắn. Cảm xúc: vòng vây khép lại, lửa bốn phía, áp đảo tinh thần, hào hùng nhưng dữ dội, khác trận phục kích tĩnh lặng chương 4. ~132–140 BPM. Nhạc cụ: **trống đồng** (tiếng kim loại trầm, ngân) làm chủ đạo, **hai lớp trống đối đáp trái, phải trong stereo** theo cơ chế đấm luân phiên, **tù và** gọi vòng vây, đàn tứ riff nhanh, sáo rít ở cao trào, lớp chiptune nhịp nền, âm lửa nổ lách tách rất khẽ. Không kèn bầu, không cồng chiêng.

## 4. Câu lệnh cho Gemini Pro (mỗi bản một lần, dán nguyên khối)

`level1.mp3`:

> Create an instrumental loop for a 2D pixel-art educational game about Phùng Hưng, late 8th-century Vietnam. Level 1 "The Young Men of Đường Lâm": a village of red laterite stone and rust-coloured hills, where villagers fight a tiger, tame a raging buffalo and push a salt-tax cart through a Tang toll gate. Mood: robust, stocky, plain-spoken rural strength roused to anger by heavy taxes, daylight. Tempo about 104–112 BPM with a heavy striding pulse. Instruments: solid big barrel drum on the footsteps, bamboo clappers, sharply plucked đàn tứ, bamboo flute in short decisive phrases, a thin chiptune layer. No carrying-pole creak, no đàn nguyệt, no gongs. No vocals, no chanting, no speech. Seamless loop: the last bar must lead directly into the first bar, no fade-in or fade-out, no silence at either end, full level until the final sample. Length 60–65 seconds. Original melody in a Vietnamese pentatonic scale, no existing folk songs or copyrighted tunes. MP3, 44.1 kHz stereo, 192 kbps, about −11.5 LUFS integrated, true peak ≤ −1 dBTP.

`level2.mp3`:

> Create an instrumental loop for a 2D pixel-art educational game about Phùng Hưng, late 8th-century Vietnam. Level 2 "Gathering the Righteous": village lanes, a supply road and the outskirts of Tống Bình, meeting the hero's brother, a village strategist and a general, with dialogue and quiz screens. Mood: comrades gathering, quiet planning, calm and confident; softer than the other levels so dialogue stays clear. Tempo about 80–88 BPM. Instruments: sparse đàn tứ, warm low đàn nhị (two-string fiddle), long-breathed end-blown bamboo flute, very light hide drum, a small rhythmic figure in the middle section suggesting people arriving on foot, warm bass. No night insects, no zither water arpeggios, no gongs. No vocals, no chanting, no speech. Seamless loop: the last bar must lead directly into the first bar, no fade-in or fade-out, no silence at either end, full level until the final sample. Length 60–65 seconds. Original melody in a Vietnamese pentatonic scale, no existing folk songs or copyrighted tunes. MP3, 44.1 kHz stereo, 192 kbps, about −11.5 LUFS integrated, true peak ≤ −1 dBTP.

`level3.mp3`:

> Create an instrumental loop for a 2D pixel-art educational game about Phùng Hưng, late 8th-century Vietnam. Level 3 "Besieging Tống Bình": a night battle before the gate tower of the Tang protectorate. Watch posts burn, and two great bronze drums are struck in turn on the left and right while a Tang governor grows more afraid; rocks, boiling water and arrows rain from the walls. Mood: a closing siege, fire on every side, overwhelming psychological pressure, heroic and fierce rather than stealthy. Tempo about 132–140 BPM. Instruments: Đông Sơn style bronze drum as the lead sound (deep, metallic, resonant), two drum layers answering each other left and right in the stereo field, buffalo-horn calls, fast đàn tứ riffs, shrill bamboo flute at the climax, a chiptune rhythm bed, very faint crackling fire texture; one short rising menacing motif recurring as the hook. No kèn bầu, no gongs. No vocals, no chanting, no speech. Seamless loop: the last bar must lead directly into the first bar, no fade-in or fade-out, no silence at either end, full level until the final sample. Length 60–65 seconds. Original melody in a Vietnamese pentatonic scale, no existing folk songs or copyrighted tunes. MP3, 44.1 kHz stereo, 192 kbps, about −11.5 LUFS integrated, true peak ≤ −1 dBTP.

## 5. Giao nộp và tích hợp

- Nộp 3 file vào `frontend/static/assets/audio/phung-hung/` (thư mục mới), đúng tên ở mục 2.
- Claude kiểm: độ dài, định dạng, độ lớn + true peak (ffmpeg `ebur128`), chỗ nối lặp, khoảng lặng đầu/cuối; rồi đổi `MUSIC_FILES` trong `js/levels/phung-hung/audio-data.js` sang `audio/phung-hung/` và bỏ ghi chú `TODO_MISSING`. Claude không nghe được, nên "không lời" và cảm xúc bài do người dùng xác nhận khi chơi.
- Xong việc: chuyển file prompt này vào `docs/archive/`.

## 6. Kết quả kiểm (09/11/2026)

| File | Độ dài | Định dạng | Độ lớn | True peak | Lặng đầu / cuối | Đoạn lặp engine (−45 dB) |
|---|---|---|---|---|---|---|
| `level1.mp3` | 65,6 s | mp3 44,1 kHz stereo 192 kbps, 1,58 MB | −12,2 LUFS | +0,6 dBFS | 0,05 / 2,54 s | 0,05–63,08 s (63,0 s) |
| `level2.mp3` | 70,5 s | như trên, 1,70 MB | −12,3 LUFS | 0,0 dBFS | 0,08 / 2,66 s | 0,08–67,79 s (67,7 s) |
| `level3.mp3` | 68,3 s | như trên, 1,65 MB | −12,2 LUFS | +0,4 dBFS | 0,05 / 2,27 s | 0,05–66,04 s (66,0 s) |

- Khoảng lặng đầu/cuối: engine tự cắt (`audio.js loopPoints`). Chỗ nối không tách tiếng (bước nhảy mẫu 0,003–0,011 so với p99 0,05–0,12).
- **Chưa đạt "không fade"**, so với nền bài, đo mỗi 0,25 s:
  - `level1`: 1,5 s cuối nhỏ dần (−13 → −35 dB); đầu bài thưa (−8…−30 dB trong 3 s đầu).
  - `level2`: nhỏ dần nhẹ, chỉ 0,5 s cuối (−14 → −22 dB); nối tốt nhất trong 3 bản.
  - `level3`: 2 s cuối nhỏ dần (−10 → −40 dB); 3 s đầu thấp (−12…−22 dB), nhịp đầu trận chưa dồn.
  - Cùng loại lỗi bộ nhạc chương 3–5. Tích hợp ngay vì đúng không gian chương. Cần thì team tạo lại và chép đè cùng tên, không phải sửa code.
- `level2`, `level3` dài hơn 60–65 s, `level2`, `level3` lớn hơn 1,6 MB chút; true peak vượt −1 dBTP cùng mức các chương trước. Không ảnh hưởng phát.
- Đo bằng ffmpeg và phân tích mức âm; Claude không nghe được nên chưa xác nhận "không lời" và cảm xúc bài, người dùng nghe khi chơi.
