// Âm thanh riêng chương Lý Nam Đế. Nhạc nền 3 màn: file mp3 của team (tạo theo
// docs/archive/GEMINI_PROMPT_LND_MUSIC.md, nộp 02/11/2026 — mp3 192 kbps, 61–63 s,
// phát lặp; engine cắt khoảng lặng ~2 s ở cuối khi tính điểm lặp). File mp3 là
// asset của team, không sửa — thay nhạc thì chép đè cùng tên. Tiếng boss/kỹ
// năng màn 3 (LND-L3) tổng hợp chiptune. Định dạng: xem engine/sfx-data.js.
// Mọi số DESIGN_BASELINE.

export const MUSIC_FILES = {
  level1: '/static/assets/audio/ly-nam-de/level1.mp3',
  level2: '/static/assets/audio/ly-nam-de/level2.mp3',
  level3: '/static/assets/audio/ly-nam-de/level3.mp3'
};

export const MUSIC = {};

export const SFX = {
  // --- Trận Tiêu Tư ---
  catapultCreak: [{ wave: 'sawtooth', f: [180, 120], dur: .25, vol: .1, filter: { type: 'lowpass', f: [700, 400] } }],
  catapultFire: [
    { wave: 'noise', filter: { type: 'bandpass', f: [600, 1400] }, dur: .2, vol: .25 },
    { wave: 'square', f: [220, 520], dur: .12, vol: .1 }
  ],
  boulderCrash: [
    { wave: 'noise', filter: { type: 'lowpass', f: [1200, 180] }, dur: .45, vol: .35 },
    { wave: 'square', f: [120, 50], dur: .25, vol: .18 }
  ],
  guardMarch: [{ wave: 'noise', filter: { type: 'lowpass', f: [500, 300] }, dur: .3, vol: .18 }],
  spearThrust: [{ wave: 'noise', filter: { type: 'highpass', f: [1800, 3600] }, dur: .12, vol: .14 }],
  armorClank: [
    { wave: 'square', f: [1300, 1150], dur: .1, vol: .12 },
    { wave: 'triangle', f: [2600, 2400], dur: .09, vol: .1 }
  ],
  cartIgnite: [
    { wave: 'noise', filter: { type: 'bandpass', f: [700, 2200] }, dur: .6, vol: .22 },
    { wave: 'sawtooth', f: [110, 180], dur: .4, vol: .08, filter: { type: 'lowpass', f: [500, 900] } }
  ],
  fireBlock: [{ wave: 'noise', filter: { type: 'bandpass', f: [1600, 900] }, dur: .15, vol: .2 }],
  douse: [
    { wave: 'noise', filter: { type: 'highpass', f: [5000, 1800] }, dur: .7, vol: .28 },
    { wave: 'triangle', f: [900, 300], dur: .3, vol: .1 }
  ],
  bossLand: [
    { wave: 'noise', filter: { type: 'lowpass', f: [900, 160] }, dur: .45, vol: .38 },
    { wave: 'square', f: [140, 50], dur: .3, vol: .2 }
  ],
  swordSwing: [{ wave: 'noise', filter: { type: 'bandpass', f: [2600, 1200] }, dur: .14, vol: .16 }],
  coinThrow: [{ wave: 'triangle', f: [1400, 2200], dur: .12, vol: .12 }],
  coinStun: [{ wave: 'square', notes: [1568, 1175, 1568, 1175], step: .06, vol: .12 }],
  bossPanic: [{ wave: 'square', notes: [784, 659, 523, 440], step: .06, vol: .12 }],
  flagRaise: [{ wave: 'triangle', notes: [523, 659, 784, 1047], step: .09, vol: .16 }],
  // --- Kỹ năng ---
  shieldRaise: [{ wave: 'triangle', f: [300, 520], dur: .14, vol: .2 }],
  shieldBlock: [{ wave: 'noise', filter: { type: 'bandpass', f: [900, 500] }, dur: .1, vol: .3 }],
  shieldBreak: [
    { wave: 'noise', filter: { type: 'lowpass', f: [1800, 300] }, dur: .35, vol: .3 },
    { wave: 'square', notes: [392, 294, 196], step: .06, vol: .12 }
  ],
  tideCall: [
    { wave: 'noise', filter: { type: 'lowpass', f: [400, 2400] }, dur: .8, vol: .3 },
    { wave: 'sine', f: [180, 360], dur: .6, vol: .12 }
  ],
  tideHit: [{ wave: 'noise', filter: { type: 'bandpass', f: [1400, 600] }, dur: .25, vol: .25 }]
};
