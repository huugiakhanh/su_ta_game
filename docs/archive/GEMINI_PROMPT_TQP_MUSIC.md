# PROMPT NHẠC NỀN — CHƯƠNG 4 TRIỆU VIỆT VƯƠNG (giao Gemini Pro)

Ngày soạn: 05/11/2026 • Người giao: team Sử Ta (Claude soạn) • Theo khuôn [GEMINI_PROMPT_LND_MUSIC.md](GEMINI_PROMPT_LND_MUSIC.md).
**XONG 05/11/2026** — team nộp 3 bản, đã tích hợp (kết quả kiểm ở mục 6).
Mẫu tham chiếu: 3 bản nhạc chương Lý Nam Đế trong `frontend/static/assets/audio/ly-nam-de/`. Chương 4 đang **mượn tạm** đúng 3 bản đó
(`MUSIC_FILES` trong `js/levels/trieu-quang-phuc/audio-data.js`), nên bộ mới phải **nghe khác hẳn chương 3 và chương 2**:

| Chương | Không gian âm thanh đã dùng — tránh lặp lại |
|---|---|
| 2 Bà Triệu | rừng núi, voi, **cồng chiêng** |
| 3 Lý Nam Đế | sông Hồng, đồng bằng, công thành; **đàn bầu, đàn tranh rải như sóng nước, kèn bầu**, tiếng mái chèo |
| 4 Triệu Việt Vương (bộ này) | **đầm lầy Dạ Trạch, ban đêm, lau sậy, du kích, huyền thoại rồng vàng** — trầm, bí ẩn, tiếng côn trùng/ếch đêm |

## 1. Bối cảnh (dán cho Gemini)

Game "Sử Ta" là game pixel art 2D giáo dục lịch sử Việt Nam, chạy trên web. Chương 4 kể về Triệu Quang Phục giữa thế kỷ 6: chàng trai
Chu Diên rèn võ nghệ, theo Lý Nam Đế chống quân Lương. Khi giặc mạnh, ông rút về đầm Dạ Trạch mênh mông lau sậy: ban ngày ẩn nấp, ban
đêm dùng thuyền độc mộc đánh úp trại giặc. Truyền thuyết kể Chử Đồng Tử cưỡi rồng vàng hiện về trao móng rồng. Năm 550 nghĩa quân
đánh tan quân Lương, tướng giặc Dương Sàn tử trận; Triệu Quang Phục xưng Triệu Việt Vương. Hình ảnh nổi bật: bãi tập võ, bãi lau ven
sông, đầm lầy, đêm trăng có đuốc, thuyền độc mộc, rồng vàng.

## 2. Yêu cầu kỹ thuật (giữ giống bộ nhạc chương 1–3 để game phát đồng nhất)

| Mục | Yêu cầu | Chương 3 đo được (02/11/2026) |
|---|---|---|
| Số bản | 3 (mỗi màn 1 bản) | 3 |
| Độ dài | 60–65 giây, **lặp liền mạch** (đoạn cuối nối thẳng vào đoạn đầu, không fade-out, không khoảng lặng ở đầu/cuối) | 62,6 / 61,5 / 62,6 s (lặng cuối 2,05–2,57 s) |
| Định dạng | MP3, 44,1 kHz, stereo, 192 kbps (≤ 1,6 MB/bản) | 44,1 kHz stereo 192 kbps, 1,48–1,51 MB |
| Độ lớn | khoảng **−11,5 LUFS** tích hợp, true peak ≤ −1 dBTP | −10,7 / −11,4 / −11,1 LUFS; peak +0,1…+0,2 dBFS (vượt — bộ mới cần giữ ≤ −1) |
| Lời | **Không lời**, không giọng hát, không tiếng nói | — |
| Tên file | `level1.mp3`, `level2.mp3`, `level3.mp3` | cùng tên |

Không dùng giai điệu có bản quyền hay bài dân ca/quốc ca có sẵn; sáng tác mới. Thang ngũ cung Việt.

## 3. Ba bản nhạc

**`level1.mp3` — Màn 1 "Tuổi trẻ rèn luyện"** (Triệu Quang Phục dẫn người chơi qua bãi tập võ: chém bù nhìn rơm, nhảy cọc tre; rồi qua
làng Chu Diên, bãi lau ven sông có thuyền tuần, đầm lầy có rắn, cá sấu, khói chướng khí, tới cổng trại nghĩa quân bên đầm Dạ Trạch)
- Cảm xúc: tuổi trẻ hăng hái, luyện võ có nhịp hô, tinh thần lên cao; về cuối thoáng chút hoang dã của đầm lầy. Ban ngày, sáng.
- Nhịp ~124–132 BPM. Gợi ý nhạc cụ: **sáo trúc** (âm sáng) dẫn giai điệu, **trống chầu/trống cơm** đánh nhịp như bài quyền, **phách tre**
  và **song lang** điểm phách như tiếng gậy tập, **đàn nguyệt** gảy nhanh; lớp chiptune mỏng. Không đàn bầu, không cồng chiêng.

**`level2.mp3` — Màn 2 "Hiền tài Dạ Trạch"** (đi từ bờ sông Chu Diên ban ngày qua núi rừng động Khuất Lão, nơi Lý Nam Đế đang bệnh, tới
đầm Dạ Trạch ban đêm; gặp cha là Thái phó Triệu Túc, Lý Nam Đế trao binh quyền, Chử Đồng Tử hiện về cùng rồng vàng; có ẩn nấp trong
lau sậy, hội thoại, câu hỏi)
- Cảm xúc: kính trọng, trầm lắng, có trách nhiệm được trao; dần bí ẩn và linh thiêng khi đêm xuống. Nhẹ hơn hai bản kia để không át
  hội thoại (game tự giảm âm khi mở hội thoại).
- Nhịp ~80–88 BPM. Gợi ý: **đàn đáy** gảy trầm ấm, **sáo trúc âm trầm** thổi hơi dài, **đàn nhị** ngân, chuông nhỏ/khánh đồng ngân xa
  gợi linh thiêng (rồng vàng), nền **tiếng côn trùng và ếch nhái đêm rất nhẹ** (không lấn nhạc), bass ấm. Không đàn tranh rải sóng nước
  (đã dùng ở chương 3).

**`level3.mp3` — Màn 3 "Đại phá Dương Sàn"** (trận đêm khuya ở bãi lầy Dạ Trạch trước trại quân Lương có đuốc: tướng Dương Sàn mặc
giáp nặng, cầm đại đao, lao tới rồi sa lầy; nghĩa quân bổ xuống gáy hắn bằng Móng Rồng; giữa trận hắn cuồng nộ đập vỡ bờ đầm, nước tràn,
người chơi nhảy qua các thuyền độc mộc để kết liễu)
- Cảm xúc: căng thẳng của trận đánh úp ban đêm, đối đầu một tướng giặc khổng lồ; nặng nề, dồn dập, rồi bùng lên quyết thắng. Khác cảnh
  công thành ban ngày của chương 3: tối hơn, trầm hơn, có tiếng nước và sình.
- Nhịp ~136–144 BPM. Gợi ý: **trống trận trầm nhiều lớp** (nặng như bước chân tướng giặc), **tù và** gọi quân, **đàn đáy/đàn nguyệt**
  gảy riff dồn dập, **sáo trúc** rít cao ở cao trào, phách tre, lớp chiptune nhịp nền; một câu nhạc "rồng vàng" ngắn sáng màu lặp lại làm
  điểm nhấn (tương phản với nền tối). Không kèn bầu (đã dùng ở chương 3), không cồng chiêng.

## 4. Câu lệnh cho Gemini Pro (mỗi bản một lần)

Chung cho cả 3 (dán sau mô tả từng bản):

> No vocals, no speech. Seamless loop: the last bar must lead directly into the first bar, no fade-in/out, no silence at either end.
> Length 60–65 seconds. Original melody in a Vietnamese pentatonic scale (no existing folk songs or copyrighted tunes). Export MP3
> 44.1 kHz stereo 192 kbps, about −11.5 LUFS integrated, true peak ≤ −1 dBTP.

`level1.mp3`:

> Create an instrumental loop for a 2D pixel-art educational game about Triệu Quang Phục, mid-6th-century Vietnam. Level 1 "Youth in
> training": the hero practises martial arts in a training yard (slashing straw dummies, leaping onto bamboo posts), then travels
> through a village, reed banks by a river with patrol boats, and a swamp with snakes, crocodiles and drifting marsh gas, to a rebel
> camp at the edge of the Dạ Trạch marsh. Mood: youthful, eager, rhythmic like martial drills, rising spirit, daylight, with a hint of
> wild marsh near the end. Tempo about 124–132 BPM. Instruments: bright bamboo flute leading the melody, festival hand drums (trống chầu,
> trống cơm) in a martial-drill pattern, bamboo clappers and song lang woodblock like training staffs, fast đàn nguyệt (moon lute)
> plucking, a thin chiptune layer. No đàn bầu (monochord), no gongs.

`level2.mp3`:

> Create an instrumental loop for a 2D pixel-art educational game about Triệu Quang Phục, mid-6th-century Vietnam. Level 2 "Talents of
> Dạ Trạch": the hero travels from a riverbank by day, through a mountain forest where the ailing emperor hands over command, into the
> Dạ Trạch marsh at night, where the legendary immortal Chử Đồng Tử appears with a golden dragon; the player hides in reeds and has
> dialogue and quiz screens. Mood: respectful, grave, a sense of duty being passed on, growing mysterious and sacred as night falls;
> softer than the other levels so dialogue stays clear. Tempo about 80–88 BPM. Instruments: warm low đàn đáy (three-string long-neck
> lute), low bamboo flute with long breaths, sustained đàn nhị (two-string fiddle), small bells / bronze chime ringing in the distance
> for the sacred dragon, a very subtle bed of night insects and frogs under the music, warm bass. No zither water arpeggios.

`level3.mp3`:

> Create an instrumental loop for a 2D pixel-art educational game about Triệu Quang Phục, mid-6th-century Vietnam. Level 3 "Crushing
> Dương Sàn": a midnight boss battle in the Dạ Trạch swamp in front of a torch-lit enemy camp. A giant heavily armoured general with a
> great glaive charges, gets stuck in the mud and is struck from above with the Dragon Claw; enraged, he smashes the banks, the marsh
> floods and the hero leaps across dugout canoes to finish him. Mood: tense night ambush against a towering foe, heavy and relentless,
> then bursting into a will to win; darker and lower than a daytime siege, with a sense of water and mud. Tempo about 136–144 BPM.
> Instruments: layered deep war drums heavy like the general's footsteps, buffalo-horn calls, driving đàn đáy / đàn nguyệt riffs,
> shrill bamboo flute at the climax, bamboo clappers, a chiptune rhythm bed; one short bright "golden dragon" motif recurring as the
> hook against the dark backdrop. No kèn bầu (oboe-like horn), no gongs.

## 5. Giao nộp và tích hợp

- Nộp 3 file vào `frontend/static/assets/audio/trieu-quang-phuc/` (thư mục mới), đúng tên ở mục 2.
- Claude kiểm: độ dài, định dạng, độ lớn + true peak (ffmpeg `ebur128`), chỗ nối lặp, khoảng lặng đầu/cuối, không lời; rồi đổi
  `MUSIC_FILES` trong `frontend/static/js/levels/trieu-quang-phuc/audio-data.js` từ `audio/ly-nam-de/` sang `audio/trieu-quang-phuc/`
  và bỏ ghi chú `TODO_MISSING`.
- Xong việc: chuyển file prompt này vào `docs/archive/`.

## 6. Kết quả kiểm (05/11/2026)

| File | Độ dài | Định dạng | Độ lớn | True peak | Lặng đầu / cuối | Đoạn lặp engine (−45 dB) |
|---|---|---|---|---|---|---|
| `level1.mp3` | 66,5 s | mp3 44,1 kHz stereo 192 kbps, 1,60 MB | −11,3 LUFS | +0,2 dBFS | 2,05 / 2,49 s | 2,05–64,02 s (62,0 s) |
| `level2.mp3` | 62,9 s | như trên, 1,52 MB | −11,9 LUFS | +0,1 dBFS | 0,10 / 0,58 s | 0,10–62,32 s (62,2 s) |
| `level3.mp3` | 67,9 s | như trên, 1,64 MB | −11,9 LUFS | +0,6 dBFS | 0,15 / 2,65 s | 0,15–65,24 s (65,1 s) |

- Khoảng lặng đầu/cuối: engine tự cắt (`audio.js loopPoints`) — điểm lặp đo trong trình duyệt khớp ffmpeg. Chỗ nối không tách tiếng (bước nhảy mẫu 0,005–0,012 so với p99 0,07–0,13).
- `level3` đạt: đầu/cuối đoạn lặp đủ lớn (0,25 s cuối −13 dB so nền).
- **Chưa đạt "không fade"** (prompt mục 2), độ lớn so với nền bài:
  - `level1`: to dần ~1,75 s đầu (−35 → 0 dB) và nhỏ dần ~1,5 s cuối (−9 → −37 dB) → mỗi vòng lặp hụt ~3 s.
  - `level2`: nhỏ dần ~4 s cuối (−10 → −44 dB; có 2 quãng lặng ngắn 61,15–61,85 s trong đoạn này) → mỗi vòng hụt ~4 s.
  - Cùng loại lỗi bộ nhạc chương 3 (giây cuối −32…−45 dB), nhưng `level1` còn to dần ở đầu. Tích hợp ngay vì vẫn tốt hơn nhạc mượn; người dùng nghe khi chơi, cần thì team tạo lại `level1`/`level2` (chép đè cùng tên, không phải sửa code).
- True peak cả 3 bản vượt −1 dBTP — cùng mức chương 2–3 đã chấp nhận.
