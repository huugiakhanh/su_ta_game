// Âm thanh riêng chương Trưng Trắc (TT-AUDIO-01): nhạc nền 3 màn (file mp3
// của team + bản tổng hợp dự phòng) và tiếng boss/kỹ năng màn 3. Gộp vào bảng
// âm thanh engine qua CHAPTER.audio (engine/audio.js registerAudio). Định dạng
// SFX/MUSIC: xem engine/sfx-data.js. Mọi số DESIGN_BASELINE. File mp3 là asset
// của team, không sửa — thay nhạc thì chép đè cùng tên.

// Nhạc nền từ file (team tạo bằng Gemini, 01/10). Có mục ở đây thì phát file
// thay cho bản tổng hợp cùng id trong MUSIC; tải/giải mã lỗi thì lùi về MUSIC.
// Thắng/thua vẫn dùng bản tổng hợp.
export const MUSIC_FILES = {
  level1: '/static/assets/audio/trung-trac/level1.mp3',
  level2: '/static/assets/audio/trung-trac/level2.mp3',
  level3: '/static/assets/audio/trung-trac/level3.mp3'
};

export const SFX = {
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
  skillArrow: [
    { wave: 'triangle', f: [500, 1300], dur: .22, vol: .22 },
    { wave: 'noise', filter: { type: 'highpass', f: [3000, 1500] }, dur: .3, vol: .12 }
  ],
  skillShadow: [
    { wave: 'triangle', f: [200, 820], dur: .42, vol: .25 },
    { wave: 'square', f: [400, 1640], dur: .42, vol: .06 }
  ],
};

// Nhạc tổng hợp từng màn — dùng khi thiếu/lỗi file mp3. Giai điệu thang ngũ
// cung cho màu dân gian Việt; tự soạn cho game.
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
};
