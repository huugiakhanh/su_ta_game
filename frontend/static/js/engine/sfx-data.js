// Dữ liệu âm thanh chiptune CHUNG mọi chương, tổng hợp bằng Web Audio
// (TT-AUDIO-01) — không có file âm thanh. Mọi số (âm lượng, tần số, độ dài,
// nhịp) là DESIGN_BASELINE, chờ team nghe thử. audio.js đọc file này; không
// import gì. Tiếng/nhạc riêng chương (boss, kỹ năng, nhạc nền từng màn) khai
// báo ở `audio-data.js` của chương, gộp vào qua CHAPTER.audio (registerAudio).

// Âm lượng tổng / nhạc nền / hiệu ứng (0–1) và hệ số giảm nhạc khi mở hội thoại.
// `musicFile`: hệ số riêng cho nhạc file. 3 file mp3 trung bình −14,3 dB, còn
// bản chiptune đo trên bus nhạc −25…−28,5 dB (01/10) -> .45 cho file ≈ −28 dB,
// ngang bản chiptune nhỏ nhất. `silenceDb`: ngưỡng coi là im lặng khi tìm điểm
// lặp của file.
export const AUDIO_MIX = { master: .8, music: .45, sfx: .7, duck: .35, musicFile: .45, silenceDb: -45 };

// Hiệu ứng: mỗi id là danh sách lớp âm (voice) phát cùng lúc.
//   wave   'square' | 'triangle' | 'sawtooth' | 'sine' | 'noise'
//   f      [tần số đầu, tần số cuối] (Hz) — quét theo hàm mũ trong `dur` giây
//   notes  chuỗi nốt (Hz, 0 = lặng) cách nhau `step` giây — thay cho `f`
//   filter { type: 'lowpass' | 'highpass' | 'bandpass', f: [đầu, cuối] }
//   vol    âm lượng đỉnh; delay: trễ so với lúc gọi (giây)
export const SFX = {
  // --- Nhân vật ---
  jump: [{ wave: 'square', f: [280, 620], dur: .12, vol: .22 }],
  land: [{ wave: 'noise', filter: { type: 'lowpass', f: [900, 300] }, dur: .07, vol: .22 }],
  dash: [
    { wave: 'noise', filter: { type: 'bandpass', f: [3200, 500] }, dur: .2, vol: .35 },
    { wave: 'square', f: [620, 180], dur: .12, vol: .08 }
  ],
  swing: [{ wave: 'noise', filter: { type: 'bandpass', f: [2600, 700] }, dur: .11, vol: .3 }],
  hurt: [
    { wave: 'square', f: [460, 110], dur: .22, vol: .25 },
    { wave: 'noise', filter: { type: 'lowpass', f: [2000, 400] }, dur: .1, vol: .2 }
  ],
  fall: [{ wave: 'triangle', f: [760, 70], dur: .5, vol: .3 }],
  death: [{ wave: 'sawtooth', f: [320, 50], dur: .6, vol: .2, filter: { type: 'lowpass', f: [2400, 400] } }],

  // --- Địch & boss ---
  hit: [
    { wave: 'square', f: [190, 80], dur: .08, vol: .24 },
    { wave: 'noise', filter: { type: 'highpass', f: [1800, 1800] }, dur: .05, vol: .18 }
  ],
  enemyDie: [
    { wave: 'square', f: [320, 55], dur: .24, vol: .22 },
    { wave: 'noise', filter: { type: 'lowpass', f: [1800, 200] }, dur: .28, vol: .24 }
  ],
  throw: [{ wave: 'noise', filter: { type: 'bandpass', f: [1600, 450] }, dur: .13, vol: .18 }],
  // Tù và báo động: kèn trầm, lên giọng nhẹ.
  alarm: [
    { wave: 'sawtooth', f: [185, 220], dur: .75, vol: .16, filter: { type: 'lowpass', f: [700, 1100] } },
    { wave: 'sawtooth', f: [370, 440], dur: .75, vol: .06, filter: { type: 'lowpass', f: [900, 1400] } }
  ],
  trap: [{ wave: 'square', notes: [140, 0, 280], step: .04, vol: .2 }],
  // Mở đầu mỗi đợt quân (spawner có `sfx`).
  waveStart: [{ wave: 'sawtooth', notes: [220, 0, 220, 330], step: .09, vol: .12, filter: { type: 'lowpass', f: [1200, 1200] } }],
  bossDefeat: [
    { wave: 'square', notes: [196, 262, 330, 392, 523], step: .07, vol: .2 },
    { wave: 'noise', filter: { type: 'lowpass', f: [2500, 200] }, dur: .5, vol: .25 }
  ],

  // --- Vật phẩm & câu hỏi ---
  // Nhặt vật phẩm thu thập (chương Trưng Trắc: bình thư).
  item: [{ wave: 'square', notes: [988, 1319], step: .07, vol: .16 }],
  quizOpen: [{ wave: 'triangle', notes: [523, 659, 784], step: .06, vol: .25 }],
  correct: [{ wave: 'square', notes: [523, 659, 784, 1047], step: .07, vol: .16 }],
  wrong: [{ wave: 'sawtooth', f: [220, 170], dur: .32, vol: .16, filter: { type: 'lowpass', f: [1200, 800] } }],
  reward: [
    { wave: 'square', notes: [523, 659, 784, 1047, 1319], step: .08, vol: .14 },
    { wave: 'triangle', notes: [262, 330, 392, 523, 659], step: .08, vol: .2 }
  ],
  gateOpen: [
    { wave: 'sawtooth', f: [55, 90], dur: .9, vol: .16, filter: { type: 'lowpass', f: [300, 600] } },
    { wave: 'triangle', notes: [392, 523, 659, 784], step: .12, vol: .22, delay: .5 }
  ],
  talk: [{ wave: 'square', f: [720, 720], dur: .035, vol: .1 }],

  // --- UI & kỹ năng ---
  click: [{ wave: 'square', f: [900, 600], dur: .045, vol: .12 }],
  heal: [{ wave: 'triangle', notes: [523, 784, 1047], step: .09, vol: .28 }],
  skillReady: [{ wave: 'triangle', notes: [1047, 1568], step: .06, vol: .16 }]
};

// Nhạc nền kiểu tracker: `steps` = số ô mỗi phách (2 = nốt móc đơn).
// Mỗi kênh là chuỗi ô cách nhau bởi khoảng trắng: tên nốt (A4, C#5…) = đánh
// nốt, `-` = ngân tiếp nốt trước, `.` = lặng. Kênh trống: k (trống cái),
// s (trống con), h (chũm chọe), `.` lặng. Mọi kênh cùng số ô.
// Nhạc nền từng màn khai báo ở chương (id `level<số màn>`). Ở đây chỉ có nhạc
// thắng/thua dùng chung.
export const MUSIC = {
  // Thắng màn (không lặp).
  win: {
    bpm: 150, steps: 2, loop: false,
    voices: [
      { wave: 'square', vol: .09, pattern: 'A4 C5 E5 - A5 - G5 A5 C6 - - - - - - .' },
      { wave: 'triangle', vol: .18, pattern: 'A2 . E3 . A2 . E3 . A2 - - - - - - .' }
    ],
    drums: 'k . s . k . s . k . . . . . . .'
  },
  // Thua (không lặp).
  lose: {
    bpm: 100, steps: 2, loop: false,
    voices: [
      { wave: 'square', vol: .08, pattern: 'E5 - D5 - C5 - A4 - - - - - . .' },
      { wave: 'triangle', vol: .16, pattern: 'A2 - G2 - F2 - E2 - - - - - . .' }
    ],
    drums: '. . . . . . . . . . . . . .'
  }
};
