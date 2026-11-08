// Âm thanh riêng chương Mai Hắc Đế. Nhạc nền 3 màn: file mp3 của team (tạo theo
// docs/archive/GEMINI_PROMPT_MHD_MUSIC.md, nộp 08/11/2026 — phát lặp; engine cắt
// khoảng lặng đầu/cuối khi tính điểm lặp). File mp3 là asset của team, không sửa —
// thay nhạc thì chép đè cùng tên. Tiếng trận + kỹ năng màn 3 (MHD-L3) chép định
// nghĩa chương 4, không import. Định dạng: xem engine/sfx-data.js.

export const MUSIC_FILES = {
  level1: '/static/assets/audio/mai-hac-de/level1.mp3',
  level2: '/static/assets/audio/mai-hac-de/level2.mp3',
  level3: '/static/assets/audio/mai-hac-de/level3.mp3'
};

export const MUSIC = {};
// Tiếng vó ngựa báo kỵ binh (MHD-L1) — chép định nghĩa của chương Bà Triệu (không import).
export const SFX = {
  cavalryCharge: [
    { wave: 'noise', filter: { type: 'lowpass', f: [500, 900] }, dur: .5, vol: .2 },
    { wave: 'sawtooth', f: [90, 160], dur: .5, vol: .12, filter: { type: 'lowpass', f: [400, 900] } }
  ],
  // --- Trận Quang Sở Khách ---
  bossCharge: [
    { wave: 'noise', filter: { type: 'lowpass', f: [400, 900] }, dur: .35, vol: .22 },
    { wave: 'sawtooth', f: [90, 140], dur: .3, vol: .1, filter: { type: 'lowpass', f: [500, 700] } }
  ],
  bossCommand: [{ wave: 'sawtooth', notes: [196, 247, 196], step: .1, vol: .1, filter: { type: 'lowpass', f: [900, 900] } }],
  bladeSwing: [{ wave: 'noise', filter: { type: 'bandpass', f: [2200, 900] }, dur: .18, vol: .2 }],
  armorClank: [
    { wave: 'square', f: [1300, 1150], dur: .1, vol: .12 },
    { wave: 'triangle', f: [2600, 2400], dur: .09, vol: .1 }
  ],
  wallCrash: [
    { wave: 'noise', filter: { type: 'lowpass', f: [1200, 160] }, dur: .5, vol: .38 },
    { wave: 'square', f: [120, 45], dur: .3, vol: .2 }
  ],
  cartBreak: [{ wave: 'noise', filter: { type: 'bandpass', f: [900, 300] }, dur: .45, vol: .28 }],
  leverHit: [
    { wave: 'noise', filter: { type: 'highpass', f: [2400, 4800] }, dur: .16, vol: .22 },
    { wave: 'square', f: [880, 1760], dur: .12, vol: .12 }
  ],
  shieldBurn: [{ wave: 'noise', filter: { type: 'lowpass', f: [500, 2600] }, dur: .5, vol: .25 }],
  // --- Kỹ năng ---
  shellOn: [
    { wave: 'triangle', f: [600, 1500], dur: .25, vol: .16 },
    { wave: 'sine', f: [1200, 2400], dur: .2, vol: .08 }
  ],
  shellBreak: [{ wave: 'noise', filter: { type: 'bandpass', f: [1400, 600] }, dur: .25, vol: .25 }],
  reinforceCall: [{ wave: 'square', notes: [392, 523, 659, 784], step: .07, vol: .14 }],
  reinforceHit: [
    { wave: 'noise', filter: { type: 'lowpass', f: [700, 150] }, dur: .5, vol: .3 },
    { wave: 'square', f: [160, 70], dur: .3, vol: .12 }
  ]
};
