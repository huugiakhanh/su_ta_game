// Dữ liệu âm thanh chiptune tổng hợp bằng Web Audio (TT-AUDIO-01) — không có
// file âm thanh. Mọi số (âm lượng, tần số, độ dài, nhịp) là DESIGN_BASELINE,
// chờ team nghe thử. audio.js đọc file này; không import gì.

// Âm lượng tổng / nhạc nền / hiệu ứng (0–1) và hệ số giảm nhạc khi mở hội thoại.
// `musicFile`: hệ số riêng cho nhạc file. 3 file mp3 trung bình −14,3 dB, còn
// bản chiptune đo trên bus nhạc −25…−28,5 dB (01/10) -> .45 cho file ≈ −28 dB,
// ngang bản chiptune nhỏ nhất. `silenceDb`: ngưỡng coi là im lặng khi tìm điểm
// lặp của file.
export const AUDIO_MIX = { master: .8, music: .45, sfx: .7, duck: .35, musicFile: .45, silenceDb: -45 };

// Nhạc nền từ file (team tạo bằng Gemini, 01/10). Có mục ở đây thì phát file
// thay cho bản tổng hợp cùng id trong MUSIC; tải/giải mã lỗi thì lùi về MUSIC.
// Thắng/thua vẫn dùng bản tổng hợp.
export const MUSIC_FILES = {
  level1: '/static/assets/audio/trung-trac/level1.mp3',
  level2: '/static/assets/audio/trung-trac/level2.mp3',
  level3: '/static/assets/audio/trung-trac/level3.mp3'
};

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
  chariotWarn: [{ wave: 'square', notes: [880, 660, 880, 660], step: .1, vol: .14 }],
  chariotCharge: [
    { wave: 'sawtooth', f: [70, 150], dur: .55, vol: .18, filter: { type: 'lowpass', f: [400, 900] } },
    { wave: 'noise', filter: { type: 'lowpass', f: [500, 900] }, dur: .55, vol: .2 }
  ],
  pillarCrack: [
    { wave: 'noise', filter: { type: 'lowpass', f: [1400, 200] }, dur: .38, vol: .4 },
    { wave: 'square', f: [130, 40], dur: .26, vol: .22 }
  ],
  // Chém thẳng xe còn khiên: tiếng "keng" vô ích.
  shieldHit: [
    { wave: 'square', f: [1250, 1150], dur: .12, vol: .12 },
    { wave: 'triangle', f: [2500, 2400], dur: .1, vol: .1 }
  ],
  // Khiên mất 1 nấc.
  shieldCrack: [
    { wave: 'square', notes: [660, 440], step: .07, vol: .18 },
    { wave: 'noise', filter: { type: 'bandpass', f: [2000, 600] }, dur: .2, vol: .22 }
  ],
  shieldBreak: [
    { wave: 'noise', filter: { type: 'lowpass', f: [3000, 200] }, dur: .6, vol: .35 },
    { wave: 'square', notes: [523, 392, 262, 131], step: .08, vol: .2 }
  ],
  jarReflect: [{ wave: 'square', f: [380, 950], dur: .1, vol: .2 }],
  fire: [{ wave: 'noise', filter: { type: 'lowpass', f: [900, 250] }, dur: .5, vol: .22 }],
  arrowFall: [{ wave: 'noise', filter: { type: 'highpass', f: [4200, 1400] }, dur: .25, vol: .12 }],
  waveStart: [{ wave: 'sawtooth', notes: [220, 0, 220, 330], step: .09, vol: .12, filter: { type: 'lowpass', f: [1200, 1200] } }],
  bossDefeat: [
    { wave: 'square', notes: [196, 262, 330, 392, 523], step: .07, vol: .2 },
    { wave: 'noise', filter: { type: 'lowpass', f: [2500, 200] }, dur: .5, vol: .25 }
  ],

  // --- Vật phẩm & câu hỏi ---
  book: [{ wave: 'square', notes: [988, 1319], step: .07, vol: .16 }],
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
  skillArrow: [
    { wave: 'triangle', f: [500, 1300], dur: .22, vol: .22 },
    { wave: 'noise', filter: { type: 'highpass', f: [3000, 1500] }, dur: .3, vol: .12 }
  ],
  skillShadow: [
    { wave: 'triangle', f: [200, 820], dur: .42, vol: .25 },
    { wave: 'square', f: [400, 1640], dur: .42, vol: .06 }
  ],
  heal: [{ wave: 'triangle', notes: [523, 784, 1047], step: .09, vol: .28 }],
  skillReady: [{ wave: 'triangle', notes: [1047, 1568], step: .06, vol: .16 }]
};

// Nhạc nền kiểu tracker: `steps` = số ô mỗi phách (2 = nốt móc đơn).
// Mỗi kênh là chuỗi ô cách nhau bởi khoảng trắng: tên nốt (A4, C#5…) = đánh
// nốt, `-` = ngân tiếp nốt trước, `.` = lặng. Kênh trống: k (trống cái),
// s (trống con), h (chũm chọe), `.` lặng. Mọi kênh cùng số ô.
// Giai điệu dùng thang ngũ cung cho màu dân gian Việt; tự soạn cho game.
export const MUSIC = {
  // Màn 1 — Vượt ải: hành quân, La ngũ cung (A C D E G), 132 bpm.
  level1: {
    bpm: 132, steps: 2, loop: true,
    voices: [
      {
        wave: 'square', vol: .07,
        pattern: `A4 - C5 D5 E5 - D5 C5  D5 - E5 G5 E5 - D5 -  C5 - D5 C5 A4 - G4 A4  C5 - A4 - - - . .
                  E5 - G5 A5 G5 - E5 D5  E5 - D5 C5 D5 - . .  C5 D5 E5 - D5 C5 A4 G4  A4 - - - . . . .`
      },
      {
        wave: 'triangle', vol: .16,
        pattern: `A2 . A3 . A2 . E2 .  D2 . D3 . D2 . A2 .  C3 . C2 . G2 . G2 .  A2 . A3 . A2 . E2 .
                  A2 . A3 . C3 . C3 .  D2 . D3 . G2 . G2 .  C3 . C2 . G2 . G2 .  A2 . E2 . A2 . . .`
      }
    ],
    drums: `k . h . s . h .  k . h . s . h .  k . h . s . h .  k . h . s . h .
            k . h . s . h .  k . h . s . h .  k . h . s . h .  k . h . s s s s`
  },
  // Màn 2 — Chiêu mộ hiền tài: chậm, ấm, điệu Bắc (C D F G A), 96 bpm.
  level2: {
    bpm: 96, steps: 2, loop: true,
    voices: [
      {
        wave: 'triangle', vol: .2,
        pattern: `G4 - A4 C5 A4 - G4 -  F4 - G4 - D4 - - -  F4 - G4 A4 C5 - D5 C5  A4 - - - G4 - - -
                  C5 - D5 - C5 A4 G4 -  A4 - G4 F4 D4 - - -  F4 G4 A4 - G4 F4 D4 -  C4 - - - . . . .`
      },
      {
        wave: 'square', vol: .035,
        pattern: `C4 - - - E4 - - -  F3 - - - A3 - - -  F3 - - - A3 - - -  A3 - - - G3 - - -
                  C4 - - - F3 - - -  D3 - - - F3 - - -  F3 - - - G3 - - -  C4 - - - . . . .`
      },
      {
        wave: 'triangle', vol: .13,
        pattern: `C3 . G2 . C3 . G2 .  F2 . C3 . D2 . A2 .  F2 . C3 . F2 . C3 .  A2 . A2 . G2 . G2 .
                  C3 . G2 . F2 . C3 .  D2 . A2 . D2 . A2 .  F2 . C3 . G2 . D3 .  C3 . G2 . C3 . . .`
      }
    ],
    drums: `k . . . h . . .  k . . . h . . .  k . . . h . . .  k . . . h . h .
            k . . . h . . .  k . . . h . . .  k . . . h . . .  k . . . . . . .`
  },
  // Màn 3 — Trận Luy Lâu: dồn dập, Mi ngũ cung (E G A B D), 160 bpm.
  level3: {
    bpm: 160, steps: 2, loop: true,
    voices: [
      {
        wave: 'square', vol: .065,
        pattern: `E4 E4 G4 E4 A4 E4 B4 A4  G4 E4 D4 E4 - - . .  E4 E4 G4 E4 A4 E4 D5 B4  A4 G4 E4 - - - . .
                  B4 - D5 B4 E5 - D5 B4  A4 - B4 A4 G4 - E4 -  G4 A4 B4 D5 E5 D5 B4 A4  B4 - - - E4 . E4 .`
      },
      {
        wave: 'triangle', vol: .17,
        pattern: `E2 E2 E3 E2 E2 E2 E3 E2  E2 E2 E3 E2 D2 D2 D3 D2  E2 E2 E3 E2 E2 E2 E3 E2  C3 C3 C2 C3 D3 D3 D2 D3
                  G2 G2 G3 G2 G2 G2 G3 G2  A2 A2 A3 A2 A2 A2 A3 A2  C3 C3 C2 C3 D3 D3 D2 D3  E2 E2 E3 E2 B1 B1 B2 B1`
      }
    ],
    drums: `k h s h k k s h  k h s h k k s h  k h s h k k s h  k h s h k s s s
            k h s h k k s h  k h s h k k s h  k h s h k k s h  k s k s k s s s`
  },
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
