// Âm thanh riêng chương Bà Triệu. Nhạc nền 3 màn: file mp3 của team (tạo theo
// docs/GEMINI_PROMPT_BT_MUSIC.md, nộp 30/10/2026 — mp3 192 kbps, 63–67 s, phát
// lặp). File mp3 là asset của team, không sửa — thay nhạc thì chép đè cùng tên.
// Tiếng boss/kỹ năng màn 3 (BT-L3) tổng hợp chiptune. Định dạng: xem
// engine/sfx-data.js. Mọi số DESIGN_BASELINE.

export const MUSIC_FILES = {
  level1: '/static/assets/audio/ba-trieu/level1.mp3',
  level2: '/static/assets/audio/ba-trieu/level2.mp3',
  level3: '/static/assets/audio/ba-trieu/level3.mp3'
};

export const MUSIC = {};

export const SFX = {
  // --- Trận Lục Dận ---
  arrowCommand: [{ wave: 'square', notes: [392, 523], step: .08, vol: .12 }],
  arrowFall: [{ wave: 'noise', filter: { type: 'highpass', f: [4200, 1400] }, dur: .25, vol: .12 }],
  coinThrow: [{ wave: 'triangle', f: [1400, 2200], dur: .12, vol: .12 }],
  coinStun: [{ wave: 'square', notes: [1568, 1175, 1568, 1175], step: .06, vol: .12 }],
  towerBreak: [
    { wave: 'noise', filter: { type: 'lowpass', f: [1600, 200] }, dur: .5, vol: .35 },
    { wave: 'triangle', notes: [1319, 1047, 784], step: .06, vol: .14 }
  ],
  armorClank: [
    { wave: 'square', f: [1300, 1150], dur: .1, vol: .12 },
    { wave: 'triangle', f: [2600, 2400], dur: .09, vol: .1 }
  ],
  armorBreak: [
    { wave: 'noise', filter: { type: 'bandpass', f: [2400, 500] }, dur: .4, vol: .3 },
    { wave: 'square', notes: [523, 392, 262], step: .07, vol: .16 }
  ],
  cavalryCharge: [
    { wave: 'noise', filter: { type: 'lowpass', f: [500, 900] }, dur: .5, vol: .2 },
    { wave: 'sawtooth', f: [90, 160], dur: .5, vol: .12, filter: { type: 'lowpass', f: [400, 900] } }
  ],
  towerShake: [{ wave: 'noise', filter: { type: 'lowpass', f: [400, 300] }, dur: .6, vol: .3 }],
  towerCollapse: [
    { wave: 'noise', filter: { type: 'lowpass', f: [1800, 150] }, dur: .9, vol: .4 },
    { wave: 'square', f: [140, 45], dur: .6, vol: .2 }
  ],
  mudSplash: [{ wave: 'noise', filter: { type: 'lowpass', f: [700, 200] }, dur: .35, vol: .35 }],
  // --- Kỹ năng ---
  crit: [
    { wave: 'square', f: [900, 1800], dur: .08, vol: .16 },
    { wave: 'noise', filter: { type: 'highpass', f: [2500, 2500] }, dur: .08, vol: .16 }
  ],
  shieldRaise: [{ wave: 'triangle', f: [300, 520], dur: .14, vol: .2 }],
  shieldBlock: [{ wave: 'noise', filter: { type: 'bandpass', f: [900, 500] }, dur: .1, vol: .3 }],
  elephantCall: [
    { wave: 'sawtooth', f: [260, 620], dur: .45, vol: .16, filter: { type: 'lowpass', f: [1400, 2400] } },
    { wave: 'square', f: [130, 310], dur: .45, vol: .08 }
  ],
  elephantHit: [
    { wave: 'noise', filter: { type: 'lowpass', f: [900, 200] }, dur: .3, vol: .35 },
    { wave: 'square', f: [160, 60], dur: .2, vol: .2 }
  ]
};
