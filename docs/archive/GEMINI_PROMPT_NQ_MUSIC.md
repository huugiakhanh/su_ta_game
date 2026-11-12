# PROMPT NHẠC NỀN — CHƯƠNG 7 NGÔ QUYỀN (giao Gemini Pro)

Ngày soạn: 12/11/2026 • Người giao: team Sử Ta (Claude soạn) • Theo khuôn [GEMINI_PROMPT_PH_MUSIC.md](GEMINI_PROMPT_PH_MUSIC.md).
**XONG 12/11/2026** — team nộp 3 bản, đã tích hợp (kết quả kiểm ở mục 6). Bước "Nhạc" của [SUTA_NQ_TASK_00.md](../SUTA_NQ_TASK_00.md).

Chương 7 đang **mượn tạm** 3 bản của chương 6 (`MUSIC_FILES` trong `js/levels/ngo-quyen/audio-data.js`). Bộ mới phải **nghe khác hẳn chương 2–6**:

| Chương | Không gian âm thanh đã dùng — tránh lặp lại |
|---|---|
| 2 Bà Triệu | rừng núi, voi, **cồng chiêng** |
| 3 Lý Nam Đế | sông Hồng, đồng bằng, công thành; **đàn bầu, đàn tranh rải như sóng nước, kèn bầu** |
| 4 Triệu Việt Vương | **đầm lầy, ban đêm, lau sậy, du kích**; trống trận trầm, đàn đáy |
| 5 Mai Hắc Đế | **miền Trung nắng gió, dân phu**, nhịp đòn gánh, hò ví xứ Nghệ, đàn nguyệt |
| 6 Phùng Hưng | **làng đá ong, sức vóc trai tráng**, trống cái bước nặng, đàn tứ, **trống đồng chủ đạo, tù và**, đêm vây thành bằng lửa |
| 7 Ngô Quyền (bộ này) | **cửa sông ra biển, thuyền chèo, gió và thủy triều**, nhịp mái chèo, tiếng gỗ (đẽo cọc, va thuyền), **ốc biển** gọi quân, trận thủy chiến ban ngày |

## 1. Bối cảnh (dán cho Gemini)

Game "Sử Ta" là game pixel art 2D giáo dục lịch sử Việt Nam, chạy trên web. Chương 7 kể về Ngô Quyền, năm 937–938. Kiều Công Tiễn giết Dương Đình Nghệ rồi cầu cứu nhà Nam Hán. Ngô Quyền từ Ái Châu kéo quân ra Bắc, diệt Kiều Công Tiễn, rồi chuẩn bị trận địa trên sông Bạch Đằng: cho đẽo gỗ, bịt sắt, cắm cọc ngầm ở cửa sông. Nước triều lên, thuyền nhẹ ra khiêu chiến nhử thuyền lớn quân Nam Hán do Lưu Hoằng Tháo chỉ huy vào sâu; nước triều rút, thuyền giặc mắc cọc, vỡ đắm, Hoằng Tháo tử trận. Hình ảnh nổi bật: sông nước mênh mông, núi đá vôi ven sông, thuyền nan và mái chèo, gió ngược, xoáy nước, bãi cọc nhô lên khi nước ròng, lâu thuyền to lớn nghiêng đổ.

## 2. Yêu cầu kỹ thuật (giữ giống bộ nhạc các chương trước để game phát đồng nhất)

| Mục | Yêu cầu |
|---|---|
| Số bản | 3 (mỗi màn 1 bản) |
| Độ dài | 60–65 giây, **lặp liền mạch**: đoạn cuối nối thẳng vào đoạn đầu, **không fade-in, không fade-out**, không khoảng lặng ở đầu/cuối, không nốt ngân tắt dần ở cuối |
| Định dạng | MP3, 44,1 kHz, stereo, 192 kbps (≤ 1,6 MB/bản) |
| Độ lớn | khoảng **−11,5 LUFS** tích hợp, true peak ≤ −1 dBTP |
| Lời | **Không lời**, không giọng hát, không hò, không hô, không tiếng nói |
| Tên file | `level1.mp3`, `level2.mp3`, `level3.mp3` |

Không dùng giai điệu có bản quyền hay bài dân ca/quốc ca có sẵn; sáng tác mới. Thang ngũ cung Việt.

Lưu ý từ bộ chương 3–6: cả 4 bộ đều bị **nhỏ dần 1,5–2,5 s ở cuối** và **thưa/nhỏ 3 s đầu** dù prompt đã cấm. Câu lệnh mục 4 nhắc rõ hơn; khi nhận bài, nghe đoạn nối trước khi nộp, bản nào còn nhỏ dần thì tạo lại.

## 3. Ba bản nhạc

**`level1.mp3` — Màn 1 "Hành quân ra Bắc"**: bến sông Ái Châu, đường sông núi ra Bắc, ngoài thành Đại La; lái thuyền nhỏ, gió ngược, xoáy nước, cá sấu; cuối màn đánh Kiều Công Tiễn. Cảm xúc: lên đường, quyết đoán, sải dài theo dòng sông, ban ngày, khí thế báo thù cho chủ tướng. ~112–120 BPM. Nhạc cụ: **nhịp mái chèo** đều (gõ gỗ, mõ, phách) làm xương sống, **sáo trúc** giai điệu chính rộng và thoáng, **đàn nhị** đáp câu, trống da cỡ vừa nhấn đầu ô nhịp, bass ấm, lớp chiptune mỏng. Không cồng chiêng, không đàn bầu, không đàn tranh rải sóng, không trống đồng, không đàn tứ.

**`level2.mp3` — Màn 2 "Trận địa cọc ngầm"**: rừng ven sông Bạch Đằng, bãi cửa sông, bến thuyền ta; vác gỗ, cắm cọc lúc nước ròng; gặp Dương Đình Nghệ (hồi tưởng), Kiều Công Hãn, Ngô Xương Ngập; có hội thoại, câu hỏi. Cảm xúc: chuẩn bị âm thầm, kiên nhẫn, chờ con nước, mưu kế đang thành hình. Nhẹ để không át hội thoại. ~84–92 BPM. Nhạc cụ: **tiếng gỗ trầm đục theo nhịp** (gợi đẽo cọc, đóng cọc, rất khẽ), **đàn tam thập lục** (đàn dây gõ) rải thưa, **sáo dọc** thổi dài, đàn nhị trầm, một lớp nền dâng lên rồi rút xuống chậm gợi thủy triều (nhưng giữ đủ độ lớn ở mọi đoạn). Không tiếng côn trùng đêm, không đàn tranh rải sóng, không đàn đáy.

**`level3.mp3` — Màn 3 "Đại thắng Bạch Đằng"**: trận thủy chiến ban ngày ở cửa sông. Lái thuyền nhỏ né đá máy bắn đá và tên lửa, ném lao nhử lâu thuyền; nước rút, lâu thuyền mắc cọc, nghiêng; nhảy lên boong đấu kiếm Lưu Hoằng Tháo. Cảm xúc: hào hùng, rộng lớn, sóng gió, cao trào chiến thắng dồn tới — khác đêm vây thành bằng lửa chương 6 và phục kích chương 4. ~136–144 BPM. Nhạc cụ: **trống trận lớn** dồn theo nhịp chèo nhanh, **ốc biển** gọi quân làm hook, sáo trúc chạy nhanh ở cao trào, đàn nhị riff gắt, tiếng gỗ va đập/nứt rất khẽ điểm nhịp, lớp chiptune nhịp nền, bass mạnh. Không trống đồng làm chủ đạo, không tù và, không kèn bầu, không cồng chiêng.

## 4. Câu lệnh cho Gemini Pro (mỗi bản một lần, dán nguyên khối)

`level1.mp3`:

> Create an instrumental loop for a 2D pixel-art educational game about Ngô Quyền, Vietnam in 938. Level 1 "Marching North": a river landing in the south, then a long journey north along rivers between limestone mountains, steering a small boat through headwinds, whirlpools and crocodiles, ending outside the citadel of Đại La against a usurper general. Mood: setting out, determined, wide and flowing like a river journey, daylight, resolve to avenge a fallen lord. Tempo about 112–120 BPM. Instruments: a steady rowing pulse on wooden percussion (wood block, temple block, bamboo clappers) as the backbone, bamboo transverse flute carrying a broad open melody, đàn nhị (two-string fiddle) answering phrases, mid-size hide drum accenting bar starts, warm bass, a thin chiptune layer. No gongs, no monochord đàn bầu, no zither water arpeggios, no bronze drum, no đàn tứ. No vocals, no chanting, no work-song calls, no speech. Seamless loop: the last bar must lead directly into the first bar at full energy; no fade-in, no fade-out, no ringing or decaying final note, no silence at either end; the first and last 3 seconds must be as loud and dense as the middle. Length 60–65 seconds. Original melody in a Vietnamese pentatonic scale, no existing folk songs or copyrighted tunes. MP3, 44.1 kHz stereo, 192 kbps, about −11.5 LUFS integrated, true peak ≤ −1 dBTP.

`level2.mp3`:

> Create an instrumental loop for a 2D pixel-art educational game about Ngô Quyền, Vietnam in 938. Level 2 "The Hidden Stake Field": riverside woods and the wide mouth of the Bạch Đằng river, where soldiers carry timber and plant sharpened stakes into the riverbed at low tide, and meet advisors and a young commander, with dialogue and quiz screens. Mood: quiet, patient preparation, waiting for the tide, a plan taking shape; softer than the other levels so dialogue stays clear. Tempo about 84–92 BPM. Instruments: soft low wooden thuds in rhythm suggesting timber being carved and driven (very subtle), sparse đàn tam thập lục (Vietnamese hammered dulcimer), long-breathed end-blown bamboo flute, low warm đàn nhị, a pad that slowly swells and recedes like a tide while keeping steady overall loudness. No night insects, no zither water arpeggios, no gongs, no bronze drum. No vocals, no chanting, no work-song calls, no speech. Seamless loop: the last bar must lead directly into the first bar; no fade-in, no fade-out, no ringing or decaying final note, no silence at either end; the first and last 3 seconds must be as loud as the middle. Length 60–65 seconds. Original melody in a Vietnamese pentatonic scale, no existing folk songs or copyrighted tunes. MP3, 44.1 kHz stereo, 192 kbps, about −11.5 LUFS integrated, true peak ≤ −1 dBTP.

`level3.mp3`:

> Create an instrumental loop for a 2D pixel-art educational game about Ngô Quyền, Vietnam in 938. Level 3 "Great Victory on the Bạch Đằng": a daytime naval battle at a river mouth. The player rows a small boat through catapult boulders and fire arrows to lure a huge enemy tower ship; the tide goes out, the ship is impaled on hidden stakes and tilts, and the player leaps aboard to duel the enemy prince. Mood: heroic and vast, wind and waves, relentless momentum building toward victory; bright and open, not a night siege and not a stealth ambush. Tempo about 136–144 BPM. Instruments: big war drums driving like fast rowing strokes, a conch-shell horn call as the recurring hook, fast bamboo flute runs at the climax, aggressive đàn nhị riffs, faint cracking and knocking wood accents on the beat, a chiptune rhythm bed, strong bass. No bronze drum as lead, no buffalo horn, no kèn bầu, no gongs. No vocals, no chanting, no battle cries, no speech. Seamless loop: the last bar must lead directly into the first bar at full energy; no fade-in, no fade-out, no ringing or decaying final note, no silence at either end; the first and last 3 seconds must be as loud and dense as the middle. Length 60–65 seconds. Original melody in a Vietnamese pentatonic scale, no existing folk songs or copyrighted tunes. MP3, 44.1 kHz stereo, 192 kbps, about −11.5 LUFS integrated, true peak ≤ −1 dBTP.

## 5. Giao nộp và tích hợp

- Nộp 3 file vào `frontend/static/assets/audio/ngo-quyen/` (thư mục mới), đúng tên ở mục 2.
- Claude kiểm: độ dài, định dạng, độ lớn + true peak (ffmpeg `ebur128`), chỗ nối lặp, khoảng lặng và độ nhỏ dần ở đầu/cuối; rồi đổi `MUSIC_FILES` trong `js/levels/ngo-quyen/audio-data.js` sang `audio/ngo-quyen/` và bỏ ghi chú `TODO_MISSING`. Claude không nghe được, nên "không lời" và cảm xúc bài do người dùng xác nhận khi chơi.
- Xong việc: chuyển file prompt này vào `docs/archive/`.

## 6. Kết quả kiểm (12/11/2026)

| File | Độ dài | Định dạng | Độ lớn | True peak | Lặng đầu / cuối | Đoạn lặp engine (−45 dB) |
|---|---|---|---|---|---|---|
| `level1.mp3` | 66,8 s | mp3 44,1 kHz stereo 192 kbps, 1,61 MB | −10,9 LUFS | +0,6 dBFS | 0,05 / 2,73 s | 0,05–64,07 s (64,0 s) |
| `level2.mp3` | 62,1 s | như trên, 1,50 MB | −11,8 LUFS | +0,1 dBFS | 0,07 / 2,41 s | 0,07–59,71 s (59,6 s) |
| `level3.mp3` | 63,0 s | như trên, 1,52 MB | −11,3 LUFS | +0,5 dBFS | 0,09 / 2,37 s | 0,09–60,59 s (60,5 s) |

- Khoảng lặng đầu/cuối: engine tự cắt (`audio.js loopPoints`). Chỗ nối không tách tiếng: bước nhảy mẫu 0,006–0,012, so với p99 0,06–0,11.
- **Vẫn chưa đạt "không fade"**. Đo mức so với thân bài, mỗi 0,25 s:
  - `level1`: 1 s cuối nhỏ dần (−9 → −16 dB); 3 s đầu thưa (−14…−25 dB).
  - `level2`: 2 s cuối nhỏ dần (−11 → −30 dB); 2,5 s đầu là đoạn dạo thưa (−15…−40 dB).
  - `level3`: 1,5 s cuối nhỏ dần (−16 → −37 dB); **3 s đầu đạt** (0…−10 dB), tốt hơn các bộ trước.
  - Cùng loại lỗi bộ nhạc chương 3–6. Tích hợp ngay như chương 6. Cần thì team tạo lại và chép đè cùng tên, không phải sửa code.
- Độ lớn và độ dài đạt; `level1` dài hơn 65 s, nhỉnh hơn 1,6 MB một chút. True peak vượt −1 dBTP như các chương trước. Không ảnh hưởng phát.
- Trình duyệt: 3 file trả 200 và giải mã được (66,80 / 62,12 / 62,96 s, 2 kênh); `playMusic('level1')` tải đúng `audio/ngo-quyen/level1.mp3`, console không lỗi âm thanh.
- Claude không nghe được nên chưa xác nhận "không lời" và cảm xúc bài; người dùng nghe khi chơi.
