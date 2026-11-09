// Âm thanh riêng chương Phùng Hưng. TODO_MISSING nhạc riêng chương: tạm phát lại 3 bản
// nhạc nền của chương Mai Hắc Đế (PLACEHOLDER). Tiếng trận + kỹ năng màn 3 (PH-L3) chép
// định nghĩa chương 5, không import. Định dạng: xem engine/sfx-data.js.

export const MUSIC_FILES = {
  level1: '/static/assets/audio/mai-hac-de/level1.mp3',
  level2: '/static/assets/audio/mai-hac-de/level2.mp3',
  level3: '/static/assets/audio/mai-hac-de/level3.mp3'
};

export const MUSIC = {};
export const SFX = {
  drumHit: [
    { wave: 'noise', filter: { type: 'lowpass', f: [1200, 160] }, dur: .5, vol: .38 },
    { wave: 'square', f: [120, 45], dur: .3, vol: .2 }
  ],
  postIgnite: [{ wave: 'noise', filter: { type: 'lowpass', f: [500, 2600] }, dur: .5, vol: .25 }],
  supplyCut: [
    { wave: 'triangle', f: [600, 1500], dur: .25, vol: .16 },
    { wave: 'sine', f: [1200, 2400], dur: .2, vol: .08 }
  ],
  fireDrum: [
    { wave: 'noise', filter: { type: 'lowpass', f: [700, 150] }, dur: .5, vol: .3 },
    { wave: 'square', f: [160, 70], dur: .3, vol: .12 }
  ]
};
