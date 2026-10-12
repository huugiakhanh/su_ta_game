# Report TT-AUDIO-01 — Nhạc nền + hiệu ứng âm thanh

Task card: [SUTA_TT_TASK_AUDIO_01.md](SUTA_TT_TASK_AUDIO_01.md). Ngày: 30/09.

## File đã tạo/sửa
| File | Mục đích |
|---|---|
| `js/levels/trung-trac/audio.js` (mới) | Engine Web Audio: mở khoá ở thao tác đầu tiên, bus master/music/sfx, `playSfx`, bộ phát nhạc kiểu tracker (lập lịch trước 120 ms), `duckMusic`, tắt tiếng (`localStorage` `suta.audio.muted`), tạm dừng khi ẩn tab/cầm dọc. |
| `js/levels/trung-trac/audio-data.js` (mới) | `AUDIO_MIX`, `SFX` (35 tiếng), `MUSIC` (`level1`/`level2`/`level3`/`win`/`lose`, thang ngũ cung, tự soạn). |
| `physics.js` | Thêm lời gọi `playSfx` tại các sự kiện (1 dòng mỗi chỗ); `endGame` phát `win`/`lose`; `defeatToDinh` dừng nhạc trận. Không đổi logic. |
| `dialogue.js` | Tiếng mở câu hỏi/thoại, đúng/sai, phần thưởng; nhạc nhỏ lại khi panel mở. |
| `main.js` | `initAudio`, nhạc theo màn trong `resetGame`, nút loa + phím M, tiếng bấm nút panel, tạm dừng khi cầm dọc. |
| `input.js` | Phím M → callback `onToggleMute`. |
| `ui.js` | `ui.mute` + `updateMuteButton()`. |
| `trung-trac.html`, `trung-trac.css` | Nút `#muteButton` trong `.hud__brand`, dòng trợ giúp “M tắt/bật âm thanh”. |
| `CLAUDE.md` | Ghi module âm thanh, cơ chế, phím M. |

## Kết quả test
Chạy trên Flask cổng 5057, trình duyệt trong app. Để kiểm tra, mình thêm log tạm đếm id tiếng; phần mô phỏng dài thì tua nhanh bằng cách gọi `update()` trực tiếp. Log tạm đã xoá sau khi test xong.

| # | Kết quả | Bằng chứng |
|---|---|---|
| T1 | PASS | `ctx.state = running`, nhạc lần lượt `level1`/`level2`/`level3`. |
| T2 | PASS | log: `jump`, `land`, `dash`, `swing`, `hurt`, `fall`, `death`. |
| T3 | PASS | tua màn 1 tới đích: `book`×5, `trap`, `alarm`, `throw`, `bossDefeat`, `heal`, `quizOpen`×4. |
| T4 | PASS | `quizOpen`, `wrong`, `talk`, `correct`, `reward`; `duckMusic` gọi khi mở/đóng. |
| T5 | PASS | tua trọn màn 3: `chariotWarn`, `chariotCharge`, `pillarCrack`, `shieldCrack`, `shieldBreak`, `fire`, `arrowFall`, `waveStart`, `skillArrow`, `skillShadow`, `skillReady`, `bossDefeat`, `gateOpen`. |
| T6 | PASS | nhạc `level3` → tắt trong cutscene → `win`; thua → `death` + `lose`, sau đó nhạc tự về rỗng. |
| T7 | PASS | M → 🔇, `localStorage` = `1`, tải lại vẫn 🔇; bấm nút → 🔊, focus trả về body. Mọi truy cập storage đều bọc try/catch. |
| T8 | PASS | Cầm dọc → `suspended`, xoay lại → `running`; khung trình duyệt ẩn (`document.hidden`) → `suspended`. |
| T9 | PASS | Console không có lỗi hay cảnh báo `SUTA audio`; `pytest`: 1 skipped (máy này thiếu `SUTA_TEST_DATABASE_URL`). |

`jarReflect` (phản hũ dầu) chưa có trong log tua nhanh vì mô phỏng không canh nhịp chém trúng hũ. Lời gọi nằm ngay đầu `reflectJar()`, dùng chung đường gọi với các tiếng đã PASS.

## Bổ sung 01/10 — nhạc nền từ file mp3 (team tạo bằng Gemini)
Người dùng duyệt kế hoạch và yêu cầu nhạc file nhỏ đi cho giống bộ chiptune cũ.

| File | Mục đích |
|---|---|
| `audio-data.js` | `MUSIC_FILES` (level1–3 → `/static/assets/audio/trung-trac/levelN.mp3`), `AUDIO_MIX.musicFile` = .45, `AUDIO_MIX.silenceDb` = −45. |
| `audio.js` | Tải + giải mã file khi vào màn, phát lặp (`AudioBufferSourceNode`), `loopPoints()` cắt im lặng đầu/cuối, đổi bản thì nhỏ dần .15 s; lỗi tải → lùi về bản chiptune cùng id. Thắng/thua + SFX giữ bản tổng hợp. |
| `CLAUDE.md` | Ghi nhạc file. |

File mp3 chỉ đọc, không sửa (ffprobe: mp3 44,1 kHz stereo 192 kbps, 61–63 s, ~1,5 MB mỗi file).

**Âm lượng**: đo RMS trên bus nhạc trong trình duyệt.
- Chiptune: màn 1 −28,5 dB, màn 2 −25,2 dB, màn 3 −26,5 dB.
- Cả 3 file mp3: trung bình −14,3 dB (ffmpeg).
- Hệ số .45 → file ≈ −28 dB, ngang bản chiptune nhỏ nhất.

| Test | Kết quả | Bằng chứng |
|---|---|---|
| F1 Phát đúng file mỗi màn | PASS | `level1`/`level2`/`level3` giải mã xong, `loop = true`, gain .45. |
| F2 Điểm lặp bỏ im lặng | PASS | L1 0,851–58,574 s; L2 0,398–60,251 s; L3 0,038–60,209 s — khớp `silencedetect` của ffmpeg. |
| F3 Gọi lại cùng bản không phát lại từ đầu | PASS | `playMusic('level3')` lần 2 giữ nguyên nguồn. |
| F4 Thua/chơi lại | PASS | thua → file dừng, `lose` chiptune; phím R → file màn phát lại. |
| F5 File lỗi → dự phòng | PASS | trỏ URL không tồn tại → cảnh báo `SUTA audio … HTTP 404`, phát chiptune `level1`. |
| F6 Giảm nhạc khi hội thoại | PASS | bus nhạc .45 → .16 → .45. |

**Lưu ý chỗ nối vòng lặp**: level1 và level2 nhỏ dần ở cuối (4 giây cuối nhỏ hơn 4 giây đầu khoảng 10–16 dB), nên lúc lặp lại sẽ nghe hơi hẫng. level3 nối ổn hơn. Nếu thấy khó chịu thì tạo lại bản "seamless loop, no fade out" trong Gemini, chép đè cùng tên là xong, không phải sửa code.

## Vấn đề asset
Ba file mp3 dùng được. Chỉ lưu ý chỗ nhỏ dần ở cuối level1 và level2 như mục trên. Nút loa tạm dùng emoji 🔊/🔇; nếu cần icon 8-bit thì giao Codex (`ICON_UI_SOUND_ON/OFF`, 16×16), đề xuất `NEED_REDRAW`: không.

## TODO / cần team duyệt
- **Nghe thử**: mọi âm lượng, tần số, nhịp và giai điệu đều là `DESIGN_BASELINE`. Chỉnh trong `audio-data.js`, không cần sửa engine.
- Giai điệu do Claude tự soạn (thang ngũ cung), không trích bài dân ca nào. Nếu team muốn dùng làn điệu có sẵn thì cần xác nhận bản quyền/nguồn.
- Màn 1 chưa có tiếng “cổng mở” riêng: cổng mở được suy ra mỗi frame, hiện chỉ có `bossDefeat` khi hạ kiệu quan.
